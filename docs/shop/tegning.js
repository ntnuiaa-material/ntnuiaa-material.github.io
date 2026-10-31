// Tegningen av plagget med trykk. Delt av designeren, som bygger DOM-lag av den, og shop-admin, som
// tegner den på et canvas til forhåndsvisningene. Alt som avgjør hvilke lag som finnes og hvor de ligger
// står her, så forhåndsvisningen i admin alltid er lik det kunden så i designeren.
// Krever katalog.js. Stiene er relative til docs/shop/ (admin sender med "../" som rot).

const LERRET_B = 900;
const LERRET_H = 1000;
const TRYKK_OPASITET = 0.96;
const NAVN_FONT = '"Arial Black", "Archivo Black", sans-serif';
const NAVN_VERSALHOYDE = 0.716; // versalhøyde i Arial Black, som del av skriftstørrelsen

// Hvitt trykk på mørke plagg, sort på lyse
function trykkfargeFor(plagg, farge) {
  return plagg.farger[farge].lys ? "sort" : "hvit";
}

function logoKildeFor(gruppe) {
  const g = finnGruppe(gruppe);
  return g ? `img/logo/${g.slug}.webp` : "../img/ntnui-logo.svg";
}

// Lagene på en side, nederst først. `valg` har plagg, farge, gruppe, front, bak og navn.
// type: base (plaggbildet), bilde (trykkfil, bredden styrer høyden), boks (trykkfil i fast boks),
// navn (tekst). `posisjon` er sonen i katalogen, og trykkfilene har `fil` med et filnavn-forslag.
function trykkLag(valg, side) {
  const p = finnPlagg(valg.plagg);
  const s = p.soner;
  const bilde = p.farger[valg.farge][side];
  if (!p.sider.includes(side) || !bilde) return [];
  const g = finnGruppe(valg.gruppe);
  const f = trykkfargeFor(p, valg.farge);
  const lag = [{ nokkel: `base:${bilde}`, type: "base", src: bilde }];

  if (side === "front") {
    if (valg.front === "ntnui") {
      lag.push({ nokkel: "front:ntnui", type: "bilde", posisjon: "bryst", src: "../img/ntnui-logo.svg", fil: "trykk-front-bryst" });
    } else if (valg.front === "tekst" && g) {
      lag.push({ nokkel: `front:tekst:${g.slug}:${f}`, type: "bilde", posisjon: "tekst", src: `img/tekst/${g.slug}-front-${f}.svg`, fil: "trykk-front-tekst" });
    }
  } else {
    if (valg.bak === "logo") {
      lag.push({ nokkel: `bak:logo:${valg.gruppe}`, type: "bilde", posisjon: "logo", src: logoKildeFor(valg.gruppe), fil: "trykk-bak-logo" });
    } else if (valg.bak === "motiv" && g) {
      lag.push(
        { nokkel: `bak:baktekst:${f}`, type: "bilde", posisjon: "baktekst", src: `img/tekst/${g.slug}-bak-${f}.svg`, fil: "trykk-bak-baktekst" },
        { nokkel: `bak:motiv:${g.slug}:${f}`, type: "boks", posisjon: "motiv", src: `img/motiv/${g.slug}-${f}.svg`, fil: "trykk-bak-motiv" },
        { nokkel: `bak:estd:${g.slug}:${f}`, type: "bilde", posisjon: "estd", src: `img/tekst/${g.slug}-estd-${f}.svg`, fil: "trykk-bak-estd" },
      );
    }
    if (valg.navn) {
      lag.push({ nokkel: `bak:navn:${valg.navn}:${f}`, type: "navn", posisjon: "navn", tekst: valg.navn, farge: f, fil: "trykk-bak-navn" });
    }
  }
  for (const l of lag) if (l.posisjon) l.sone = s[l.posisjon];
  return lag;
}

// Navnet står i Arial Black, som i PSD-en. Høyden er versalhøyden i prosent av lerretet, regnet om til
// skriftstørrelse i prosent av lerretbredden (1 % av høyden er 10/9 av 1 % av bredden).
function navnStorrelse(sone) {
  return (sone.h * 10 / 9) / NAVN_VERSALHOYDE;
}

// Mål i cm for en sone på et plagg: tabellen i katalogen, med plaggets eventuelle avvik
function soneMaal(plagg, posisjon) {
  return { ...TRYKKSONER[posisjon], ...(plagg.sonerCm && plagg.sonerCm[posisjon]) };
}

// ---------- Canvas ----------

const bildeCache = new Map();
function hentBilde(src) {
  if (!bildeCache.has(src)) {
    bildeCache.set(src, new Promise((ok, feil) => {
      const img = new Image();
      img.onload = () => ok(img);
      img.onerror = () => feil(new Error(`Fikk ikke lastet ${src}`));
      img.src = src;
    }));
  }
  return bildeCache.get(src);
}

async function lastNavnFont() {
  try { await document.fonts.load(`40px "Archivo Black"`); } catch {}
}

// Tegner én side av plagget på ctx, med øvre venstre hjørne i (x, y) og lerretbredde `bredde` i px.
// Samme regler som CSS-en i designeren: trykket sentreres på sonen, bredden er prosent av lerretbredden,
// høyden følger bildet (eller sonens h for boks), og navnet har linjehøyde 1.
async function tegnSide(ctx, valg, side, { x = 0, y = 0, bredde = LERRET_B, rot = "" } = {}) {
  const lag = trykkLag(valg, side);
  const W = bredde;
  const H = bredde * LERRET_H / LERRET_B;
  await lastNavnFont();
  const bilder = await Promise.all(lag.map((l) => (l.src ? hentBilde(rot + l.src) : null)));
  lag.forEach((l, i) => {
    const img = bilder[i];
    if (l.type === "base") {
      // object-fit: contain, object-position: top center
      const k = Math.min(W / img.naturalWidth, H / img.naturalHeight);
      const w = img.naturalWidth * k, h = img.naturalHeight * k;
      ctx.drawImage(img, x + (W - w) / 2, y, w, h);
      return;
    }
    const s = l.sone;
    const cx = x + s.x / 100 * W, cy = y + s.y / 100 * H;
    ctx.save();
    ctx.globalAlpha = TRYKK_OPASITET;
    if (l.type === "bilde") {
      const w = s.b / 100 * W, h = w * img.naturalHeight / img.naturalWidth;
      ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
    } else if (l.type === "boks") {
      const bw = s.b / 100 * W, bh = s.h / 100 * H;
      const k = Math.min(bw / img.naturalWidth, bh / img.naturalHeight);
      const w = img.naturalWidth * k, h = img.naturalHeight * k;
      ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
    } else if (l.type === "navn") {
      const fs = navnStorrelse(s) / 100 * W;
      ctx.font = `${fs}px ${NAVN_FONT}`;
      ctx.fillStyle = l.farge === "sort" ? "#111" : "#f4f4f0";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      // Linjeboksen er fs høy og sentrert på (cx, cy); grunnlinja ligger under halvt linjegap og stigehøyden
      const m = ctx.measureText(l.tekst);
      const stige = m.fontBoundingBoxAscent, fall = m.fontBoundingBoxDescent;
      ctx.fillText(l.tekst, cx, cy - fs / 2 + (fs - (stige + fall)) / 2 + stige);
    }
    ctx.restore();
  });
}

// Navnet som egen trykkfil: PNG med gjennomsiktig bakgrunn, i trykkfargen, med versalhøyden i cm
// ved gitt oppløsning. Returnerer canvas, så kaller kan lage PNG av det.
async function navnCanvas(tekst, farge, hCm, dpi = 300) {
  await lastNavnFont();
  const fs = Math.round(hCm / 2.54 * dpi / NAVN_VERSALHOYDE);
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  ctx.font = `${fs}px ${NAVN_FONT}`;
  const m = ctx.measureText(tekst);
  const stige = Math.ceil(m.fontBoundingBoxAscent), fall = Math.ceil(m.fontBoundingBoxDescent);
  c.width = Math.ceil(m.width) + 8;
  c.height = stige + fall;
  ctx.font = `${fs}px ${NAVN_FONT}`; // størrelsen på canvas nullstiller fonten
  ctx.fillStyle = farge === "sort" ? "#111" : "#f4f4f0";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(tekst, c.width / 2, stige);
  return c;
}

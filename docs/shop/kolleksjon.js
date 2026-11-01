// Kolleksjonen på forsiden: tilfeldige kombinasjoner fra designeren, tegnet med samme kode (tegning.js),
// og en skinne som kan dras med musa. Krever katalog.js, felles.js og tegning.js.
// De rene funksjonene (kombinasjoner, dra-terskel) er skilt ut fra DOM-koden, så api/test kan kjøre dem i Node.

const KOL_ANTALL = 12;
const KOL_NAVN = "DITT NAVN";
const DRA_TERSKEL = 6; // px musa må flytte seg før det regnes som et drag og ikke et klikk

// ---------- Kombinasjoner ----------

function kolBland(liste, rng) {
  const a = [...liste];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Samme regler som rettOpp() i designer.js: tekst foran og motiv bak finnes bare for grupper med motiv, bare
// plagg med navnFelt kan ha navn, og fargen, front og bak må finnes på plagget.
function kolGyldig(k) {
  const p = finnPlagg(k.plagg);
  const g = finnGruppe(k.gruppe);
  if (!p || !g || !p.farger[k.farge]) return false;
  if (!p.front.includes(k.front)) return false;
  if (p.bak.length ? !p.bak.includes(k.bak) : k.bak !== "ingen") return false;
  if ((k.front === "tekst" || k.bak === "motiv") && !g.motiv) return false;
  if (k.navn && (!p.navnFelt || k.navn.length > 12 || k.bak === "ingen")) return false;
  return true;
}

// Lager `antall` tilfeldige, gyldige og ulike kombinasjoner. rng er Math.random i nettleseren.
// De tre første er plukket for å se bra ut: jersey med gruppelogo bak, Entrada-tee med motiv, og en genser med
// motiv. Resten er de andre plaggene i tilfeldig rekkefølge, pluss hvit tee og ett bunnplagg (bare front).
function lagKombinasjoner(antall = KOL_ANTALL, rng = Math.random) {
  const ko = kolBland(GRUPPER, rng); // gruppene, uten gjentak
  const hentGruppe = (trengerMotiv) => {
    let i = trengerMotiv ? ko.findIndex((g) => g.motiv) : 0;
    if (i < 0) i = 0;
    return ko.splice(i, 1)[0];
  };
  const velg = (liste) => liste[Math.floor(rng() * liste.length)];
  const topper = PLAGG.filter((p) => p.sider.length > 1);
  const bunner = PLAGG.filter((p) => p.sider.length === 1);
  const sett = new Set();
  const ut = [];
  let antallNavn = 0;

  const legg = (k) => {
    const nokkel = JSON.stringify(k);
    if (sett.has(nokkel) || !kolGyldig(k)) return false;
    sett.add(nokkel);
    ut.push(k);
    return true;
  };

  // Tre kuraterte
  const g1 = hentGruppe(true);
  legg({ plagg: "tiro-drakt", farge: "svart", gruppe: g1.navn, front: rng() < 0.5 ? "tekst" : "ntnui", bak: "logo", navn: "" });
  const g2 = hentGruppe(true);
  legg({ plagg: "entrada-tee", farge: "svart", gruppe: g2.navn, front: "ntnui", bak: "motiv", navn: "" });
  const g3 = hentGruppe(true);
  const tredje = velg(["entrada-hoody", "entrada-sweat-top"]);
  legg({ plagg: tredje, farge: "svart", gruppe: g3.navn, front: rng() < 0.5 ? "tekst" : "ntnui", bak: "motiv", navn: "" });

  // Resten: ubrukte topper, hvit tee og ett bunnplagg
  const brukt = new Set(["tiro-drakt", "entrada-tee", tredje]);
  const rest = topper.filter((p) => !brukt.has(p.id)).map((p) => ({ p, farge: "svart" }));
  rest.push({ p: finnPlagg("entrada-tee"), farge: "hvit" });
  if (bunner.length) rest.push({ p: velg(bunner), farge: "svart" });
  const bland = kolBland(rest, rng);
  // Bunnplagget ligger ikke blant de første (trykket er lite, og fronten alene er mindre fristende)
  const bunnI = bland.findIndex((r) => r.p.sider.length === 1);
  if (bunnI >= 0 && bunnI < 3) bland.push(bland.splice(bunnI, 1)[0]);

  for (const { p, farge } of bland) {
    if (ut.length >= antall) break;
    const g = hentGruppe(p.bak.includes("motiv"));
    const motiv = Boolean(g.motiv);
    const r = rng();
    let front = "ntnui";
    if (p.front.includes("tekst") && motiv && r < 0.35) front = "tekst";
    else if (p.bak.length && r > 0.9 && p.front.includes("ingen")) front = "ingen";
    let bak = "ingen";
    if (p.bak.includes("motiv") && motiv && rng() < 0.65) bak = "motiv";
    else if (p.bak.includes("logo")) bak = "logo";
    let navn = "";
    if (p.navnFelt && bak !== "ingen" && antallNavn < 2 && rng() < 0.25) { navn = KOL_NAVN; antallNavn++; }
    legg({ plagg: p.id, farge, gruppe: g.navn, front, bak, navn });
  }
  return ut.slice(0, antall);
}

// Adressen til designeren som gjenskaper kombinasjonen (se parsingen øverst i designer.js)
function kolLenke(k) {
  const p = finnPlagg(k.plagg);
  const q = new URLSearchParams({ plagg: k.plagg, gruppe: k.gruppe, farge: k.farge, front: k.front });
  if (p.bak.length) q.set("bak", k.bak);
  if (k.navn) q.set("navn", k.navn);
  return `designer.html?${q}`;
}

function kolTittel(k, spraak) {
  const p = finnPlagg(k.plagg);
  const flereFarger = Object.keys(p.farger).length > 1;
  return flereFarger ? `${p.navn[spraak]} · ${t(k.farge)}` : p.navn[spraak];
}

// ---------- Dra med musa ----------

// Gjør at skinna kan dras med musa. Touch skroller som før (native), og scroll-snap står av mens man drar og
// mens svevet varer, så det ikke slåss mot scrollLeft. Når alt står stille, slås snap på igjen og nettleseren
// legger skinna på nærmeste kort. Returnerer et lite objekt til testing.
function lagDraing(skinne, { redusertBevegelse = false } = {}) {
  let id = null, startX = 0, startScroll = 0, dratt = false, nede = false;
  let sisteScroll = 0, sisteT = 0, fart = 0; // fart i px/ms på scrollLeft
  let raf = 0, sluttT = 0;

  const naa = () => (typeof performance !== "undefined" ? performance.now() : Date.now());
  const stopp = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };
  const ferdig = () => { stopp(); skinne.classList.remove("dras"); };

  function ned(e) {
    if (e.pointerType !== "mouse" || e.button !== 0) return; // touch og penn skroller native
    stopp();
    nede = true; dratt = false; id = e.pointerId;
    startX = e.clientX; startScroll = skinne.scrollLeft;
    sisteScroll = startScroll; sisteT = naa(); fart = 0;
  }

  function flytt(e) {
    if (!nede || e.pointerId !== id) return;
    const dx = e.clientX - startX;
    if (!dratt) {
      if (!erDrag(dx)) return;
      dratt = true;
      skinne.classList.add("dras");
      try { skinne.setPointerCapture(id); } catch {}
    }
    skinne.scrollLeft = startScroll - dx;
    const t = naa(), dt = t - sisteT;
    if (dt > 0) {
      const v = (skinne.scrollLeft - sisteScroll) / dt;
      fart = 0.7 * v + 0.3 * fart; // glatter ut hakkete musebevegelser
      sisteScroll = skinne.scrollLeft; sisteT = t;
    }
  }

  function opp(e) {
    if (!nede || (e && e.pointerId !== id)) return;
    nede = false;
    if (!dratt) return;
    sluttT = naa();
    try { skinne.releasePointerCapture(id); } catch {}
    if (redusertBevegelse || naa() - sisteT > 80 || Math.abs(fart) < 0.05) return ferdig();
    // Svev: farten dør ut med ca. 5 % per bilde (60 Hz)
    let forrige = naa();
    const steg = () => {
      const t = naa(), dt = Math.min(t - forrige, 50);
      forrige = t;
      const foer = skinne.scrollLeft;
      skinne.scrollLeft = foer + fart * dt;
      fart *= Math.pow(0.95, dt / 16.67);
      if (Math.abs(fart) < 0.02 || skinne.scrollLeft === foer) return ferdig(); // stoppet, eller i enden
      raf = requestAnimationFrame(steg);
    };
    raf = requestAnimationFrame(steg);
  }

  // Et drag skal ikke åpne kortet man slapp musa over. Klikket kommer rett etter pointerup.
  function klikk(e) {
    if (dratt && naa() - sluttT < 400) { e.preventDefault(); e.stopPropagation(); }
    dratt = false;
  }

  skinne.addEventListener("pointerdown", ned);
  skinne.addEventListener("pointermove", flytt);
  skinne.addEventListener("pointerup", opp);
  skinne.addEventListener("pointercancel", opp);
  skinne.addEventListener("click", klikk, true);
  skinne.addEventListener("dragstart", (e) => e.preventDefault()); // ikke dra lenker og bilder native
  skinne.addEventListener("wheel", stopp, { passive: true });
  return { stopp, ned, flytt, opp, klikk };
}

// Hvor langt musa må flytte seg før det er et drag (px, absoluttverdi)
function erDrag(dx) {
  return Math.abs(dx) > DRA_TERSKEL;
}

// ---------- DOM ----------

if (typeof document !== "undefined" && document.getElementById("skinne")) {
  const skinne = document.getElementById("skinne");
  const redusert = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const kombinasjoner = lagKombinasjoner();
  let bygget = false;

  const kortHtml = (k, i) => `
    <a href="${escape(kolLenke(k))}" class="lookbook reveal" data-i="${i}" draggable="false">
      <div class="lookbook-bilde"><canvas role="img"></canvas></div>
      <div class="lookbook-tekst">
        <span class="mono dempet">${String(i + 1).padStart(2, "0")} · ${escape(k.gruppe)}</span>
        <h3></h3>
        <span class="lookbook-lenke"><span class="lookbook-cta"></span> <span aria-hidden="true">→</span></span>
      </div>
    </a>`;

  // Tekstene settes for seg, så språkbytte ikke tegner kortene om igjen
  function tekster() {
    skinne.setAttribute("aria-label", t("kol.tittel"));
    skinne.querySelectorAll(".lookbook").forEach((kort) => {
      const k = kombinasjoner[Number(kort.dataset.i)];
      const tittel = kolTittel(k, sprak);
      kort.querySelector("h3").textContent = tittel;
      kort.querySelector(".lookbook-cta").textContent = t("kol.cta");
      kort.querySelector("canvas").setAttribute("aria-label", `${tittel} · ${k.gruppe}`);
    });
    document.querySelectorAll("[data-skinne]").forEach((b) => b.setAttribute("aria-label", t(`kol.${b.dataset.skinne}`)));
  }

  // Tegner kortet med samme kode som designeren: foran og bak ved siden av hverandre på et gjennomsiktig lerret
  async function tegnKort(kort) {
    const k = kombinasjoner[Number(kort.dataset.i)];
    const c = kort.querySelector("canvas");
    const p = finnPlagg(k.plagg);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = Math.round(c.clientWidth * dpr), ch = Math.round(c.clientHeight * dpr);
    if (!cw || !ch) return;
    c.width = cw; c.height = ch;
    const ctx = c.getContext("2d");
    const sider = p.sider.filter((s) => p.farger[k.farge][s]);
    const s = Math.min(cw / 2, ch / (LERRET_H / LERRET_B)) * 0.94; // bredden på ett plagg, med litt luft
    const h = s * LERRET_H / LERRET_B;
    const x0 = (cw - s * sider.length) / 2, y0 = (ch - h) / 2;
    try {
      for (let i = 0; i < sider.length; i++) await tegnSide(ctx, k, sider[i], { x: x0 + i * s, y: y0, bredde: s });
      c.classList.add("klar");
    } catch (feil) {
      console.warn("Kortet kunne ikke tegnes", feil);
    }
  }

  function bygg() {
    skinne.innerHTML = kombinasjoner.map(kortHtml).join("");
    bygget = true;
    // Tegn bare kort i nærheten av synsfeltet; skinna er rota, så sideveis nærhet teller
    const io = "IntersectionObserver" in window
      ? new IntersectionObserver((o) => o.forEach((x) => {
          if (x.isIntersecting) { io.unobserve(x.target); tegnKort(x.target); }
        }), { root: skinne, rootMargin: "0px 700px" })
      : null;
    skinne.querySelectorAll(".lookbook").forEach((kort) => (io ? io.observe(kort) : tegnKort(kort)));
    observerInn(skinne);
  }

  function tegnKolleksjon() {
    if (!bygget) bygg();
    tekster();
    pilStatus();
  }
  vedSprak.push(tegnKolleksjon);

  // Tastatur: pil venstre/høyre ett kort om gangen
  const kortSteg = () => {
    const kort = skinne.querySelector(".lookbook");
    return kort ? kort.getBoundingClientRect().width + (parseFloat(getComputedStyle(skinne).columnGap) || 22) : 300;
  };
  const rull = (retning) => skinne.scrollBy({ left: retning * kortSteg(), behavior: redusert ? "auto" : "smooth" });
  skinne.addEventListener("keydown", (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (e.key === "ArrowRight") { e.preventDefault(); rull(1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); rull(-1); }
    else if (e.key === "Home") { e.preventDefault(); skinne.scrollTo({ left: 0, behavior: redusert ? "auto" : "smooth" }); }
    else if (e.key === "End") { e.preventDefault(); skinne.scrollTo({ left: skinne.scrollWidth, behavior: redusert ? "auto" : "smooth" }); }
  });

  // Små piler i toppen (skjules på touch, der man sveiper)
  const forrige = document.querySelector('[data-skinne="forrige"]');
  const neste = document.querySelector('[data-skinne="neste"]');
  function pilStatus() {
    const maks = skinne.scrollWidth - skinne.clientWidth - 2;
    if (forrige) forrige.disabled = skinne.scrollLeft <= 2;
    if (neste) neste.disabled = skinne.scrollLeft >= maks;
  }
  if (forrige) forrige.addEventListener("click", () => rull(-1));
  if (neste) neste.addEventListener("click", () => rull(1));
  skinne.addEventListener("scroll", pilStatus, { passive: true });
  window.addEventListener("resize", pilStatus);
  setTimeout(pilStatus, 0);

  lagDraing(skinne, { redusertBevegelse: redusert });
}

// Shop-admin. Bruker samme passord som lager-admin, og husker det på samme måte
// (localStorage "lager.passord"), så man er logget inn på begge samtidig.

const API = ["localhost", "127.0.0.1"].includes(location.hostname)
  ? "http://127.0.0.1:8788"
  : "https://lager-api.ntnuiaa.workers.dev";

const $ = (sel, rot = document) => rot.querySelector(sel);
const $$ = (sel, rot = document) => [...rot.querySelectorAll(sel)];

let data = { bestillinger: [], puljer: [] };

// ---------- Passord og API ----------

function hentPassord() {
  try { return localStorage.getItem("lager.passord") || ""; } catch { return ""; }
}
function huskPassord(passord) {
  try { passord ? localStorage.setItem("lager.passord", passord) : localStorage.removeItem("lager.passord"); } catch {}
}

async function kall(sti, body) {
  const svar = await fetch(API + sti, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${hentPassord()}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const svarData = await svar.json().catch(() => ({}));
  if (!svar.ok) throw Object.assign(new Error(svarData.feil || "Fikk ikke kontakt med API-et."), { status: svar.status });
  return svarData;
}

function sporPassord(feil) {
  return new Promise((ferdig) => {
    const d = $("#passord");
    $("#passord-feil").textContent = feil;
    $("#passord-felt").value = "";
    d.showModal();
    $("#passord-skjema").onsubmit = () => ferdig($("#passord-felt").value);
  });
}

async function last() {
  for (;;) {
    try {
      data = await kall("/api/admin/shop");
      tegn();
      return;
    } catch (feil) {
      if (feil.status !== 401) { visToast(feil.message); return; }
      huskPassord(await sporPassord(hentPassord() ? "Feil passord." : ""));
    }
  }
}

$("#logg-ut").addEventListener("click", () => { huskPassord(""); location.reload(); });

// ---------- Tekst om plagg ----------

const NAVN = { herre: "Herre", dame: "Dame", svart: "Svart", hvit: "Hvit" };
const kroner = (n) => `${n.toLocaleString("nb-NO")},-`;
const escape = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const dato = (s) => s ? new Date(s.replace(" ", "T") + "Z").toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" }) : "";

function plaggNavn(id) {
  const p = finnPlagg(id);
  return p ? p.navn.nb : id;
}

function gruppeTekst(l) {
  return l.gruppe === GENERISK ? "Generisk" : l.gruppe;
}

function trykkTekst(l) {
  const deler = [];
  if (l.front === "ntnui") deler.push("NTNUI-logo foran");
  if (l.front === "tekst") deler.push(`${gruppeTekst(l)} tekst foran`);
  if (l.bak === "logo") deler.push(`${gruppeTekst(l)} logo bak`);
  if (l.bak === "motiv") deler.push(`${gruppeTekst(l)} motiv bak`);
  return deler.join(" + ") || "Ingen trykk";
}

// Samme regel som arket til Erik fra Nettskjema-tiden
function trykkfarge(l) {
  if (l.bak === "motiv" || l.front === "tekst") return l.farge === "hvit" ? "Svart" : "Hvit";
  if (l.bak === "logo") return "Farger (badge)";
  if (l.front === "ntnui") return "Farger (logo)";
  return "–";
}

function linjeTekst(l) {
  const navn = l.navn ? ` · «${l.navn}»` : "";
  return `${l.antall} × ${plaggNavn(l.plagg)} · ${NAVN[l.farge] || l.farge} · ${NAVN[l.kjonn]} ${l.storrelse} · ${trykkTekst(l)}${navn}`;
}

// ---------- Tegning ----------

function tegn() {
  const nye = data.bestillinger.filter((b) => b.status === "ny");
  const ikkeSendt = data.puljer.filter((p) => !p.sendt);
  const sendt = data.puljer.filter((p) => p.sendt && !p.levert);
  $("#tall").innerHTML = [
    [nye.length, "nye bestillinger"],
    [kroner(nye.reduce((s, b) => s + b.sum, 0)), "i nye bestillinger"],
    [ikkeSendt.length, "puljer ikke sendt"],
    [sendt.length, "puljer hos Intersport"],
  ].map(([t, s]) => `<div><strong>${t}</strong><span>${s}</span></div>`).join("");

  $("#nye").innerHTML = nye.length ? nye.map((b) => ordreKort(b, true)).join("") : `<p class="tom">Ingen nye bestillinger.</p>`;
  const avb = data.bestillinger.filter((b) => b.status === "avbestilt");
  $("#avbestilte").innerHTML = avb.length ? avb.map((b) => ordreKort(b, false)).join("") : `<p class="tom">Ingen avbestilte.</p>`;
  $("#puljer").innerHTML = data.puljer.length ? data.puljer.map(puljeKort).join("") : `<p class="tom">Ingen puljer ennå.</p>`;

  if (!$("#pulje-navn").value) $("#pulje-navn").value = `Pulje ${new Date().toLocaleDateString("nb-NO")}`;
  oppdaterValg();
}

function ordreKort(b, velgbar) {
  const anonym = b.anonymisert ? `<span class="merke">Personopplysninger slettet</span>` : "";
  return `
    <article class="ordre">
      ${velgbar ? `<input type="checkbox" data-velg="${b.id}" aria-label="Velg ${escape(b.ordrenr)}">` : "<span></span>"}
      <div>
        <div class="ordre-topp">
          <span class="nr">${escape(b.ordrenr)}</span>
          <strong>${escape(b.navn)}</strong>
          <span class="dempet">${dato(b.opprettet)}</span>
          ${anonym}
        </div>
        <p class="ordre-kontakt">
          <a href="tel:${escape(b.telefon.replace(/\s/g, ""))}">${escape(b.telefon)}</a> ·
          <a href="mailto:${escape(b.epost)}">${escape(b.epost)}</a>
        </p>
        <ul>${b.linjer.map((l) => `<li>${escape(linjeTekst(l))}</li>`).join("")}</ul>
        ${b.kommentar ? `<p class="kommentar">«${escape(b.kommentar)}»</p>` : ""}
      </div>
      <div class="ordre-hoyre">
        <span class="sum">${kroner(b.sum)}</span>
        ${b.status !== "avbestilt" ? `<button type="button" class="knapp fare liten" data-avbestill="${b.id}">Avbestill</button>` : `<span class="dempet">Avbestilt ${dato(b.avbestilt)}</span>`}
      </div>
    </article>`;
}

function puljeKort(p) {
  const best = data.bestillinger.filter((b) => b.pulje_id === p.id);
  const linjer = best.flatMap((b) => b.linjer);
  const plagg = linjer.reduce((s, l) => s + l.antall, 0);
  const status = p.levert
    ? `<span class="merke gronn">Levert ${dato(p.levert)}</span>`
    : p.sendt ? `<span class="merke gul">Sendt ${dato(p.sendt)}</span>` : `<span class="merke">Ikke sendt</span>`;
  const knapper = [
    `<button type="button" class="knapp knapp-hoved liten" data-csv="${p.id}">Last ned ark til Erik</button>`,
    `<button type="button" class="knapp knapp-hoved liten" data-zip="${p.id}">Last ned ZIP</button>`,
    !p.sendt ? `<button type="button" class="knapp knapp-gul liten" data-status="sendt" data-pulje="${p.id}">Merk som sendt</button>`
      : !p.levert ? `<button type="button" class="knapp knapp-gul liten" data-status="levert" data-pulje="${p.id}">Merk som levert</button>` : "",
    !p.sendt ? `<button type="button" class="knapp fare liten" data-los-opp="${p.id}">Løs opp pulje</button>` : "",
    p.levert ? `<button type="button" class="knapp knapp-sekundaer liten" data-status="levert" data-angre="1" data-pulje="${p.id}">Angre levert</button>`
      : p.sendt ? `<button type="button" class="knapp knapp-sekundaer liten" data-status="sendt" data-angre="1" data-pulje="${p.id}">Angre sendt</button>` : "",
  ].join("");
  return `
    <article class="pulje">
      <div class="pulje-topp">
        <div>
          <h3>${escape(p.navn)}</h3>
          <div class="pulje-status">${status}<span class="merke">${best.length} bestillinger</span><span class="merke">${plagg} plagg</span>
            <span class="merke">${kroner(best.reduce((s, b) => s + b.sum, 0))}</span></div>
        </div>
        <div class="pulje-knapper">${knapper}</div>
      </div>
      <details>
        <summary>Sammendrag: plagg og trykk</summary>
        ${sammendrag(linjer)}
      </details>
      <details>
        <summary>Bestillingene</summary>
        <div class="liste" style="margin-top:12px">${best.map((b) => ordreKort(b, false)).join("")}</div>
      </details>
    </article>`;
}

// Antall per artikkel og størrelse, og antall gruppelogoer. Til innkjøp av logoer og plagg.
function sammendrag(linjer) {
  const tell = (nokkel) => {
    const m = new Map();
    for (const l of linjer) m.set(nokkel(l), (m.get(nokkel(l)) || 0) + l.antall);
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], "nb"));
  };
  const plagg = tell((l) => `${plaggNavn(l.plagg)}|${l.artikkel || ""}|${NAVN[l.farge] || l.farge}|${l.storrelse}`);
  const trykk = tell((l) => trykkTekst(l));
  return `
    <table class="sammendrag">
      <thead><tr><th>Plagg</th><th>Artikkel</th><th>Farge</th><th>Størrelse</th><th>Antall</th></tr></thead>
      <tbody>${plagg.map(([k, n]) => `<tr>${k.split("|").map((c) => `<td>${escape(c)}</td>`).join("")}<td class="tall-celle">${n}</td></tr>`).join("")}</tbody>
    </table>
    <table class="sammendrag">
      <thead><tr><th>Trykk</th><th>Antall</th></tr></thead>
      <tbody>${trykk.map(([k, n]) => `<tr><td>${escape(k)}</td><td class="tall-celle">${n}</td></tr>`).join("")}</tbody>
    </table>`;
}

// ---------- Arket til Erik ----------

// Én rad per plagg, samme kolonner som arket fra Nettskjema-tiden. Semikolon og BOM, så
// norsk Excel åpner fila riktig med dobbeltklikk.
const CSV_KOLONNER = ["Nr", "Navn", "Telefon", "E-post", "Plagg", "Modell", "Artikkel", "Farge", "Snitt", "Størrelse", "Trykk", "Trykkfarge", "Egennavn"];
// ZIP-en har i tillegg mappa til bestillingen og bredden på hvert trykk i cm (ca., fra størrelse L herre)
const MAAL_KOLONNER = [
  ["bryst", "Bredde NTNUI-logo foran (cm)"], ["tekst", "Bredde tekst foran (cm)"], ["logo", "Bredde logo bak (cm)"],
  ["baktekst", "Bredde tekst bak (cm)"], ["motiv", "Bredde motiv bak (cm)"], ["estd", "Bredde ESTD bak (cm)"], ["navn", "Høyde navn bak (cm)"],
];

function valgFor(l) {
  return { plagg: l.plagg, farge: l.farge, gruppe: l.gruppe, front: l.front, bak: l.bak, navn: l.navn || "" };
}

// Trykk på en linje, i samme rekkefølge som i designeren: posisjon, fil og mål i cm
function trykkFor(l) {
  const v = valgFor(l);
  const p = finnPlagg(l.plagg);
  return ["front", "bak"].flatMap((side) => trykkLag(v, side).filter((x) => x.posisjon).map((x) => {
    const m = soneMaal(p, x.posisjon);
    return { ...x, side, cm: x.posisjon === "navn" ? m.h : m.b, rot: m.rot || 0 };
  }));
}

function byggCsv(puljeId, utvidet) {
  const kol = utvidet ? [...CSV_KOLONNER, "Mappe", ...MAAL_KOLONNER.map(([, t]) => t)] : CSV_KOLONNER;
  const rader = [kol];
  for (const b of data.bestillinger.filter((x) => x.pulje_id === puljeId)) {
    for (const l of b.linjer) {
      const pl = finnPlagg(l.plagg);
      const trykk = trykkFor(l);
      for (let i = 0; i < l.antall; i++) {
        const rad = [b.ordrenr, b.navn, b.telefon, b.epost, plaggNavn(l.plagg), pl ? pl.kategori : "", l.artikkel || "",
          NAVN[l.farge] || l.farge, NAVN[l.kjonn], l.storrelse, trykkTekst(l), trykkfarge(l), l.navn || ""];
        if (utvidet) {
          rad.push(b.ordrenr);
          for (const [pos] of MAAL_KOLONNER) {
            const t = trykk.find((x) => x.posisjon === pos);
            rad.push(t ? String(t.cm).replace(".", ",") : "");
          }
        }
        rader.push(rad);
      }
    }
  }
  const celle = (v) => /[";\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v);
  return "\ufeff" + rader.map((r) => r.map(celle).join(";")).join("\r\n");
}

function filnavn(tekst) {
  return tekst.replace(/[^\wæøåÆØÅ.-]+/g, "_");
}

function lastNedFil(blob, navn) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = navn;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 10000);
}

function lastNedCsv(puljeId) {
  const p = data.puljer.find((x) => x.id === puljeId);
  lastNedFil(new Blob([byggCsv(puljeId, false)], { type: "text/csv;charset=utf-8" }), `${filnavn(p.navn)}_NTNUI.csv`);
}

// ---------- ZIP med forhåndsvisninger og trykkfiler ----------

const SIDE_NAVN = { front: "Front", bak: "Rygg" };
const POSISJON_TEKST = {
  bryst: "Foran: NTNUI-logo", tekst: "Foran: tekst", logo: "Bak: logo", baktekst: "Bak: tekst øverst",
  motiv: "Bak: motiv", estd: "Bak: ESTD", navn: "Bak: navn",
};

// PNG-er uten oppløsning i fila åpnes som 72 dpi. Legger inn pHYs rett etter IHDR.
function settDpi(png, dpi) {
  const ppm = Math.round(dpi / 0.0254);
  const chunk = new Uint8Array(21);
  const v = new DataView(chunk.buffer);
  v.setUint32(0, 9);
  chunk.set([0x70, 0x48, 0x59, 0x73], 4); // "pHYs"
  v.setUint32(8, ppm);
  v.setUint32(12, ppm);
  chunk[16] = 1; // meter
  v.setUint32(17, crc32(chunk.subarray(4, 17)));
  const ut = new Uint8Array(png.length + chunk.length);
  ut.set(png.subarray(0, 33), 0); // signatur (8) + IHDR (25)
  ut.set(chunk, 33);
  ut.set(png.subarray(33), 33 + chunk.length);
  return ut;
}

const tilBytes = async (blob) => new Uint8Array(await blob.arrayBuffer());
const canvasPng = (c) => new Promise((ok) => c.toBlob(ok, "image/png"));

// Front og rygg ved siden av hverandre, tegnet av samme kode som designeren, og kortet under som tekst
async function forhandsvisning(b, l, nr, antallLinjer) {
  const p = finnPlagg(l.plagg);
  const v = valgFor(l);
  const trykk = trykkFor(l);
  const sider = p.sider;
  const M = 40, B = 900, H = 1000;
  const bredde = M + sider.length * (B + M);

  const rader = [
    [`${b.ordrenr}${antallLinjer > 1 ? ` · linje ${nr} av ${antallLinjer}` : ""}`, "tittel"],
    [`${plaggNavn(l.plagg)}${l.artikkel ? ` (${l.artikkel})` : ""}`, "fet"],
    [`Farge: ${NAVN[l.farge] || l.farge}   ·   Snitt: ${NAVN[l.kjonn]}   ·   Størrelse: ${l.storrelse}   ·   Antall: ${l.antall}`, ""],
    [`Gruppe: ${gruppeTekst(l)}`, ""],
    ...trykk.map((t) => {
      const mal = (t.posisjon === "navn" ? `«${t.tekst}», versalhøyde ${t.cm} cm` : `${t.cm} cm bredt`)
        + (t.rot ? `, rotert ${String(t.rot).replace(".", ",")}°` : "");
      return [`${POSISJON_TEKST[t.posisjon]}: ${mal}   (${t.fil}.${t.type === "navn" ? "png" : t.src.split(".").pop()})`, ""];
    }),
  ];
  if (!trykk.length) rader.push(["Ingen trykk", ""]);
  rader.push(["Forhåndsvisning fra shopen. Mål i cm er ca. og regnet fra størrelse L herre.", "liten"]);

  const linjeH = 46;
  const tekstH = 20 + rader.reduce((s, [, t]) => s + (t === "tittel" ? 80 : linjeH), 0) + 20;
  const c = document.createElement("canvas");
  c.width = bredde;
  c.height = M + H + 60 + tekstH + M;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#f2f2ee";
  ctx.fillRect(0, 0, c.width, c.height);

  for (const [i, side] of sider.entries()) {
    const x = M + i * (B + M);
    ctx.fillStyle = "#c9c9c4"; // lysere enn plaggene, så sort og hvitt synes
    ctx.fillRect(x, M, B, H);
    await tegnSide(ctx, v, side, { x, y: M, bredde: B, rot: "../" });
    ctx.fillStyle = "#555";
    ctx.font = "30px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(SIDE_NAVN[side], x + B / 2, M + H + 40);
  }

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  let y = M + H + 60 + 20;
  for (const [t, stil] of rader) {
    if (stil === "tittel") { ctx.font = "bold 56px system-ui, sans-serif"; ctx.fillStyle = "#111"; y += 64; }
    else if (stil === "fet") { ctx.font = "bold 34px system-ui, sans-serif"; ctx.fillStyle = "#111"; y += linjeH; }
    else if (stil === "liten") { ctx.font = "26px system-ui, sans-serif"; ctx.fillStyle = "#777"; y += linjeH; }
    else { ctx.font = "32px system-ui, sans-serif"; ctx.fillStyle = "#222"; y += linjeH; }
    ctx.fillText(t, M, y);
    if (stil === "tittel") y += 16;
  }
  return tilBytes(await canvasPng(c));
}

// Selve trykkfila: originalen fra siden (SVG, eller WebP for gruppelogoene), og navnet som PNG i 300 dpi
async function trykkfil(l, t) {
  if (t.type === "navn") {
    const png = await tilBytes(await canvasPng(await navnCanvas(t.tekst, t.farge, t.cm, 300)));
    return { navn: `${t.fil}.png`, data: settDpi(png, 300) };
  }
  const svar = await fetch(`../${t.src}`);
  if (!svar.ok) throw new Error(`Fikk ikke hentet ${t.src}`);
  return { navn: `${t.fil}.${t.src.split(".").pop()}`, data: new Uint8Array(await svar.arrayBuffer()) };
}

async function lastNedZip(puljeId, knapp) {
  const p = data.puljer.find((x) => x.id === puljeId);
  const best = data.bestillinger.filter((x) => x.pulje_id === puljeId);
  const tekst = knapp.textContent;
  knapp.disabled = true;
  try {
    const filer = [{ navn: "bestillingsark.csv", data: byggCsv(puljeId, true) }];
    let i = 0;
    for (const b of best) {
      for (const [n, l] of b.linjer.entries()) {
        i++;
        knapp.textContent = `Lager ${i}…`;
        const flere = b.linjer.length > 1;
        const mappe = `${b.ordrenr}/`;
        const prefiks = flere ? `linje${n + 1}-` : "";
        filer.push({ navn: `${mappe}forhandsvisning${flere ? `-${n + 1}` : ""}.png`, data: await forhandsvisning(b, l, n + 1, b.linjer.length) });
        for (const t of trykkFor(l)) {
          const f = await trykkfil(l, t);
          filer.push({ navn: `${mappe}${prefiks}${f.navn}`, data: f.data });
        }
      }
    }
    lastNedFil(lagZip(filer), `${filnavn(p.navn)}.zip`);
    visToast("ZIP-en er laget.");
  } catch (feil) {
    visToast(`Fikk ikke laget ZIP-en: ${feil.message}`);
  } finally {
    knapp.disabled = false;
    knapp.textContent = tekst;
  }
}

// ---------- Hendelser ----------

function oppdaterValg() {
  const valgt = $$("[data-velg]:checked");
  $("#lag-pulje").disabled = !valgt.length;
  $("#lag-pulje").textContent = valgt.length ? `Lag pulje av ${valgt.length} valgte` : "Lag pulje av valgte";
  const alle = $$("[data-velg]");
  $("#velg-alle").checked = alle.length > 0 && valgt.length === alle.length;
}

document.addEventListener("change", (e) => {
  if (e.target.id === "velg-alle") $$("[data-velg]").forEach((c) => { c.checked = e.target.checked; });
  if (e.target.matches("[data-velg], #velg-alle")) oppdaterValg();
});

async function handling(fn, melding) {
  try {
    await fn();
    visToast(melding);
    await last();
  } catch (feil) {
    visToast(feil.message);
  }
}

// Fanen kan også velges med #nye, #puljer eller #avbestilte i adressen
function visFane(navn) {
  if (!$(`[role=tab][data-fane="${navn}"]`)) return;
  $$("[role=tab]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.fane === navn)));
  $$("section.fane").forEach((s) => { s.hidden = s.dataset.fane !== navn; });
}

document.addEventListener("click", (e) => {
  const fane = e.target.closest("[data-fane][role=tab]");
  if (fane) {
    visFane(fane.dataset.fane);
    history.replaceState(null, "", `#${fane.dataset.fane}`);
    return;
  }
  if (e.target.id === "lag-pulje") {
    const ider = $$("[data-velg]:checked").map((c) => Number(c.dataset.velg));
    handling(() => kall("/api/admin/shop/pulje", { bestillinger: ider, navn: $("#pulje-navn").value }), "Pulja er laget.")
      .then(() => { $("#pulje-navn").value = ""; tegn(); });
    return;
  }
  const avb = e.target.closest("[data-avbestill]");
  if (avb && confirm("Avbestille denne bestillingen? Det kan ikke angres.")) {
    handling(() => kall("/api/admin/shop/avbestill", { id: Number(avb.dataset.avbestill) }), "Bestillingen er avbestilt.");
    return;
  }
  const los = e.target.closest("[data-los-opp]");
  if (los) {
    const id = Number(los.dataset.losOpp);
    const antall = data.bestillinger.filter((b) => b.pulje_id === id).length;
    if (confirm(`Løse opp pulja? ${antall} ${antall === 1 ? "bestilling" : "bestillinger"} blir nye igjen, og pulja slettes.`)) {
      handling(() => kall("/api/admin/shop/pulje/los-opp", { id }), "Pulja er løst opp.");
    }
    return;
  }
  const st = e.target.closest("[data-status]");
  if (st) {
    handling(() => kall("/api/admin/shop/pulje/status", { id: Number(st.dataset.pulje), status: st.dataset.status, angre: Boolean(st.dataset.angre) }),
      st.dataset.angre ? "Angret." : `Pulja er merket som ${st.dataset.status}.`);
    return;
  }
  const csv = e.target.closest("[data-csv]");
  if (csv) lastNedCsv(Number(csv.dataset.csv));
  const zip = e.target.closest("[data-zip]");
  if (zip) lastNedZip(Number(zip.dataset.zip), zip);
});

$("#tema-knapp").addEventListener("click", () => {
  const tema = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = tema;
  try { localStorage.setItem("shop-tema", tema); } catch {}
});

let toastTid;
function visToast(melding) {
  const t = $("#toast");
  t.textContent = melding;
  t.classList.add("vis");
  clearTimeout(toastTid);
  toastTid = setTimeout(() => t.classList.remove("vis"), 2600);
}

visFane(location.hash.slice(1));
last();

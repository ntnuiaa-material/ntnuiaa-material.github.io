// Henter og lagrer data via API-et på Cloudflare (mappa api/ i repoet).

const GRUNNADRESSE = "HTTPS://NTNUIAA-MATERIAL.GITHUB.IO/";

const API = ["localhost", "127.0.0.1"].includes(location.hostname)
  ? "http://127.0.0.1:8788"
  : "https://lager-api.ntnuiaa.workers.dev";

let TING = [];
let utlaan = [];
let hendelser = [];

async function kall(sti, valg = {}) {
  const svar = await fetch(API + sti, {
    ...valg,
    headers: { "Content-Type": "application/json", ...(valg.headers || {}) },
  });
  const data = await svar.json().catch(() => ({}));
  if (!svar.ok) throw Object.assign(new Error(data.feil || "Fikk ikke kontakt med lageret."), { status: svar.status });
  return data;
}

function brukData(data) {
  TING = data.ting;
  utlaan = data.utlaan;
  hendelser = data.hendelser;
}

async function lastData() {
  brukData(await kall("/api/ting"));
}

async function laan(id, navn, telefon, frist, antall, variant) {
  await kall("/api/laan", { method: "POST", body: JSON.stringify({ ting_id: id, navn, telefon, frist, antall, variant }) });
}

async function lever(utlaanId) {
  await kall("/api/lever", { method: "POST", body: JSON.stringify({ utlaan_id: utlaanId }) });
}

function bildeUrl(ting) {
  return ting.bilde ? `${API}/api/bilde/${ting.id}?v=${ting.bilde}` : null;
}

// ---------- Admin ----------

function hentPassord() {
  try { return localStorage.getItem("lager.passord") || ""; } catch { return ""; }
}

function huskPassord(passord) {
  try { passord ? localStorage.setItem("lager.passord", passord) : localStorage.removeItem("lager.passord"); } catch {}
}

function adminKall(sti, valg = {}) {
  return kall(sti, { ...valg, headers: { Authorization: `Bearer ${hentPassord()}` } });
}

// Laster admin-data. Spør etter passord hvis det mangler eller er feil.
async function lastAdmin() {
  for (;;) {
    try {
      brukData(await adminKall("/api/admin"));
      return;
    } catch (feil) {
      if (feil.status !== 401) throw feil;
      huskPassord(await sporPassord(hentPassord() ? "Feil passord" : ""));
    }
  }
}

document.addEventListener("click", (e) => {
  if (!e.target.closest("[data-logg-ut]")) return;
  e.preventDefault();
  huskPassord("");
  location.reload();
});

function sporPassord(feilmelding) {
  return new Promise((ferdig) => {
    const boks = document.createElement("div");
    boks.className = "innlogging";
    boks.innerHTML = `
      <form class="panel skjema">
        <p class="terminal">Tilgang begrenset<br>Kun materialansvarlig</p>
        <label class="felt"><span class="etikett">Passord</span>
          <input type="password" autocomplete="current-password" required autofocus></label>
        ${feilmelding ? `<p class="hjelp" style="color:var(--feil)">${feilmelding}</p>` : ""}
        <button class="knapp" type="submit">Logg inn</button>
      </form>`;
    document.body.appendChild(boks);
    boks.querySelector("form").addEventListener("submit", (e) => {
      e.preventDefault();
      const verdi = boks.querySelector("input").value;
      boks.remove();
      ferdig(verdi);
    });
  });
}

async function lagreTing(ting) {
  return adminKall("/api/admin/ting", { method: "POST", body: JSON.stringify(ting) });
}

function visFeil(element, feil) {
  element.innerHTML = `<div class="panel"><p class="terminal" style="color:var(--feil)">Feil</p><p>${esc(feil.message)}</p></div>`;
}

function finnTing(id) {
  return TING.find((t) => t.id === Number(id));
}

function alleKategorier() {
  return [...new Set(TING.filter((t) => t.type !== "lokasjon").map((t) => t.kategori).filter(Boolean))].sort();
}

function lokasjoner() {
  return TING.filter((t) => t.type === "lokasjon");
}

function hjemTil(ting) {
  return ting.hjem_id ? finnTing(ting.hjem_id) : null;
}

function stiTil(ting) {
  const deler = [];
  let sted = hjemTil(ting);
  while (sted) {
    deler.unshift(sted.navn);
    sted = hjemTil(sted);
  }
  return deler.join(" / ");
}

function aapneUtlaan(id) {
  return utlaan.filter((u) => u.ting_id === Number(id) && !u.levert);
}

function idag() {
  return new Date().toISOString().slice(0, 10);
}

function statusFor(ting) {
  if (ting.type === "lokasjon") return { kode: "lager", tekst: "Lokasjon" };
  const ute = aapneUtlaan(ting.id);
  if (ting.type === "bulk") {
    const totalt = ting.varianter.reduce((s, v) => s + v.antall, 0);
    const utlaant = ute.reduce((s, u) => s + (u.antall || 0), 0);
    return { kode: "lager", tekst: `${totalt - utlaant} / ${totalt} inne` };
  }
  if (ute.length === 0) return { kode: "lager", tekst: "Inne" };
  if (ute[0].frist < idag()) return { kode: "forsinket", tekst: "Forsinket" };
  return { kode: "ute", tekst: "Utlånt" };
}

function datoKort(iso) {
  const [, m, d] = iso.split("-");
  return `${d}.${m}`;
}

function esc(tekst) {
  return String(tekst).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Offentlige sider lenker aldri til admin. Admin-sidene ligger i en mappe med hemmelig navn.
function topplinje(aktiv, admin) {
  const lenke = (href, navn) =>
    `<a href="${href}"${aktiv === navn ? ' aria-current="page"' : ""}>${navn}</a>`;
  const meny = admin
    ? lenke("index.html", "Oversikt") + lenke("etiketter.html", "Etiketter") + lenke("../index.html", "Lager") +
      '<a href="#" data-logg-ut>Logg ut</a>'
    : lenke("index.html", "Lager");
  return `
    <header class="topplinje">
      <a class="merke" href="index.html">NTNUI<small>ÅLESUND</small></a>
      <div class="terminal">${admin ? "Kontrollpanel // Kun materialansvarlig" : "Materiallager // Terminal 01"}</div>
      <nav class="meny">${meny}</nav>
    </header>`;
}

function bunnlinje() {
  return `
    <footer class="bunn">
      <span class="terminal dempet">Laget i Ålesund 2026</span>
      <span class="terminal dempet">Materialansvarlig NTNUI Å</span>
    </footer>`;
}

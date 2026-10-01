// Testdata til prototypen. Byttes ut med D1-databasen i sprint 1.

const GRUNNADRESSE = "HTTPS://NTNUIAA-MATERIAL.GITHUB.IO/";

const START_TING = [
  { id: 3001, type: "lokasjon", navn: "Boden, Campus", kategori: "Lokasjon", hjem_id: null },
  { id: 3002, type: "lokasjon", navn: "Hylle 1", kategori: "Lokasjon", hjem_id: 3001 },
  { id: 3003, type: "lokasjon", navn: "Hylle 2", kategori: "Lokasjon", hjem_id: 3001 },
  { id: 3004, type: "lokasjon", navn: "Skap, styrerommet", kategori: "Lokasjon", hjem_id: null },

  { id: 1001, type: "utstyr", navn: "Telt Nordisk Oppland 4", kategori: "Tur", hjem_id: 3002 },
  { id: 1002, type: "utstyr", navn: "Telt Nordisk Oppland 4", kategori: "Tur", hjem_id: 3002 },
  { id: 1003, type: "utstyr", navn: "Primus Eta Lite", kategori: "Tur", hjem_id: 3002 },
  { id: 1004, type: "utstyr", navn: "Sovepose Ajungilak -10", kategori: "Tur", hjem_id: 3002 },
  { id: 1010, type: "utstyr", navn: "Klatretau Mammut 60 m", kategori: "Klatring", hjem_id: 3003 },
  { id: 1011, type: "utstyr", navn: "Sikringsbrikke Grigri", kategori: "Klatring", hjem_id: 3003 },
  { id: 1020, type: "utstyr", navn: "Høyttaler JBL PartyBox", kategori: "Arrangement", hjem_id: 3004 },
  { id: 1021, type: "utstyr", navn: "Beachflagg NTNUI 3 m", kategori: "Arrangement", hjem_id: 3004 },
  { id: 1022, type: "utstyr", navn: "Førstehjelpsskrin stort", kategori: "Arrangement", hjem_id: 3004 },
  { id: 1030, type: "utstyr", navn: "Ballpumpe elektrisk", kategori: "Ball", hjem_id: 3003 },

  { id: 2001, type: "bulk", navn: "Kasse T-skjorter 2026", kategori: "Klær", hjem_id: 3002,
    varianter: [{ navn: "S", antall: 6 }, { navn: "M", antall: 14 }, { navn: "L", antall: 9 }, { navn: "XL", antall: 3 }] },
  { id: 2002, type: "bulk", navn: "Kjegler, gule", kategori: "Ball", hjem_id: 3003,
    varianter: [{ navn: "Stk", antall: 40 }] },
  { id: 2003, type: "bulk", navn: "Volleyballer Mikasa", kategori: "Ball", hjem_id: 3003,
    varianter: [{ navn: "Stk", antall: 8 }] },
  { id: 2004, type: "bulk", navn: "Klatrehjelmer", kategori: "Klatring", hjem_id: 3003,
    varianter: [{ navn: "S/M", antall: 5 }, { navn: "M/L", antall: 7 }] },
];

const START_UTLAAN = [
  { id: 1, ting_id: 1002, navn: "Ola Nordmann", telefon: "912 34 567", utlaant: "2026-09-20", frist: "2026-10-04", levert: null },
  { id: 2, ting_id: 1010, navn: "Kari Fjell", telefon: "478 11 222", utlaant: "2026-09-10", frist: "2026-09-24", levert: null },
  { id: 3, ting_id: 1020, navn: "Futsal-styret", telefon: "400 00 000", utlaant: "2026-09-28", frist: "2026-10-08", levert: null },
  { id: 4, ting_id: 2002, antall: 12, variant: "Stk", navn: "Per Ball", telefon: "955 55 555", utlaant: "2026-09-29", frist: "2026-10-13", levert: null },
];

const START_HENDELSER = [
  { tid: "2026-09-29 18:02", ting_id: 2002, tekst: "12 stk utlånt til Per Ball" },
  { tid: "2026-09-28 16:40", ting_id: 1020, tekst: "Utlånt til Futsal-styret" },
  { tid: "2026-09-27 12:15", ting_id: 1004, tekst: "Levert av Jonas" },
  { tid: "2026-09-20 09:31", ting_id: 1002, tekst: "Utlånt til Ola Nordmann" },
];

// Utlån lagres i nettleseren så prototypen føles levende. Ikke ekte lagring.
function hentLagret(nokkel, standard) {
  try {
    const verdi = localStorage.getItem(nokkel);
    return verdi ? JSON.parse(verdi) : structuredClone(standard);
  } catch {
    return structuredClone(standard);
  }
}

function lagre(nokkel, verdi) {
  try { localStorage.setItem(nokkel, JSON.stringify(verdi)); } catch {}
}

let TING = hentLagret("lager.ting", START_TING);
let utlaan = hentLagret("lager.utlaan", START_UTLAAN);
let hendelser = hentLagret("lager.hendelser", START_HENDELSER);

function finnTing(id) {
  return TING.find((t) => t.id === Number(id));
}

function lagreTing(ny) {
  const i = TING.findIndex((t) => t.id === ny.id);
  if (i === -1) {
    TING.push(ny);
    loggHendelse(ny.id, "Registrert");
  } else {
    TING[i] = ny;
    loggHendelse(ny.id, "Endret");
  }
  lagre("lager.ting", TING);
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

function laan(id, navn, telefon, frist, antall, variant) {
  utlaan.push({ id: Date.now(), ting_id: Number(id), navn, telefon, utlaant: idag(), frist, levert: null, antall, variant });
  loggHendelse(id, antall ? `${antall} ${variant} utlånt til ${navn}` : `Utlånt til ${navn}`);
  lagre("lager.utlaan", utlaan);
}

function lever(utlaanId) {
  const u = utlaan.find((x) => x.id === utlaanId);
  if (!u) return;
  u.levert = idag();
  loggHendelse(u.ting_id, `Levert av ${u.navn}`);
  lagre("lager.utlaan", utlaan);
}

function loggHendelse(id, tekst) {
  const tid = new Date().toISOString().slice(0, 16).replace("T", " ");
  hendelser.unshift({ tid, ting_id: Number(id), tekst });
  lagre("lager.hendelser", hendelser);
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
    ? lenke("index.html", "Oversikt") + lenke("etiketter.html", "Etiketter") + lenke("../index.html", "Lager")
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

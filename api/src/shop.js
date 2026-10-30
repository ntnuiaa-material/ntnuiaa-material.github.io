// Shopen: bestillinger fra docs/shop og adminsida docs/shop/admin.
// Prisen regnes alltid ut her, med samme katalog som nettsida (src/katalog.js).
//
// Offentlig:
//   POST /api/shop/bestilling          send en bestilling, svarer med ordrenummer
// Admin (samme passord som lageret):
//   GET  /api/admin/shop               alle bestillinger med linjer, og puljene
//   POST /api/admin/shop/pulje         samle nye bestillinger i en ny pulje
//   POST /api/admin/shop/pulje/status  merk en pulje som sendt eller levert
//   POST /api/admin/shop/avbestill     avbestill en bestilling som ikke er sendt

import { PLAGG, GRUPPER, GENERISK, prisFor, finnPlagg, fargerFor } from "./katalog.js";

const MAKS_LINJER = 20;
const MAKS_ANTALL = 10;
const EPOST = /^[^\s@]+@stud\.ntnu\.no$/i;

export async function shopRuter(request, env, sti, metode, { Brukerfeil, lesJson, json, sjekkAdmin }) {
  if (metode === "POST" && sti === "/api/shop/bestilling") {
    return json(await nyBestilling(env, await lesJson(request), Brukerfeil));
  }
  if (sti.startsWith("/api/admin/shop")) {
    await sjekkAdmin(request, env);
    if (metode === "GET" && sti === "/api/admin/shop") return json(await hentShop(env));
    if (metode === "POST" && sti === "/api/admin/shop/pulje") return json(await lagPulje(env, await lesJson(request), Brukerfeil));
    if (metode === "POST" && sti === "/api/admin/shop/pulje/status") return json(await puljeStatus(env, await lesJson(request), Brukerfeil));
    if (metode === "POST" && sti === "/api/admin/shop/avbestill") return json(await avbestill(env, await lesJson(request), Brukerfeil));
  }
  return null;
}

// Kjøres av cron sammen med lageret
export async function anonymiserShop(env) {
  await env.DB.prepare(
    `UPDATE shop_bestillinger SET navn = 'slettet', telefon = '', epost = '', kommentar = NULL, anonymisert = 1
     WHERE anonymisert = 0 AND (
       (status = 'avbestilt' AND avbestilt < datetime('now', '-6 months'))
       OR pulje_id IN (SELECT id FROM shop_puljer WHERE levert IS NOT NULL AND levert < datetime('now', '-6 months'))
     )`
  ).run();
}

// ---------- Bestilling ----------

async function nyBestilling(env, data, Brukerfeil) {
  // Honeypot: feltet er skjult for mennesker. Svar som om alt gikk bra.
  if (data.nettside) return { ok: true, ordrenr: "NTNUI-0000" };

  const navn = tekst(data.navn, "Navn", 80, Brukerfeil);
  if (navn.split(/\s+/).length < 2) throw new Brukerfeil("Skriv fullt navn.");
  const telefon = tekst(data.telefon, "Telefon", 30, Brukerfeil);
  if (!/^\+\d{1,4} \d{5,14}$/.test(telefon)) throw new Brukerfeil("Ugyldig telefonnummer.");
  const epost = tekst(data.epost, "E-post", 120, Brukerfeil).toLowerCase();
  if (!EPOST.test(epost)) throw new Brukerfeil("Bruk e-posten din som slutter på @stud.ntnu.no.");
  const kommentar = String(data.kommentar || "").trim().slice(0, 500) || null;
  const sprak = data.sprak === "en" ? "en" : "nb";

  const inn = Array.isArray(data.linjer) ? data.linjer : [];
  if (!inn.length) throw new Brukerfeil("Kurven er tom.");
  if (inn.length > MAKS_LINJER) throw new Brukerfeil(`Høyst ${MAKS_LINJER} linjer per bestilling.`);
  const linjer = inn.map((l) => sjekkLinje(l, Brukerfeil));
  const sum = linjer.reduce((s, l) => s + l.stykkpris * l.antall, 0);

  const ordrenr = await nyttOrdrenr(env);
  const ny = await env.DB.prepare(
    `INSERT INTO shop_bestillinger (ordrenr, navn, telefon, epost, kommentar, sprak, sum)
     VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id`
  ).bind(ordrenr, navn, telefon, epost, kommentar, sprak, sum).first();

  await env.DB.batch(linjer.map((l) => env.DB.prepare(
    `INSERT INTO shop_linjer (bestilling_id, plagg, artikkel, farge, kjonn, storrelse, gruppe, front, bak, navn, antall, stykkpris)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(ny.id, l.plagg, l.artikkel, l.farge, l.kjonn, l.storrelse, l.gruppe, l.front, l.bak, l.navn, l.antall, l.stykkpris)));

  return { ok: true, ordrenr, sum };
}

// Godtar bare kombinasjoner som finnes i katalogen. Alt annet avvises, ikke rettes.
function sjekkLinje(l, Brukerfeil) {
  const p = finnPlagg(l.plagg);
  if (!p) throw new Brukerfeil("Ukjent plagg.");
  const kjonn = p.kjonn.includes(l.kjonn) ? l.kjonn : null;
  if (!kjonn) throw new Brukerfeil(`${p.navn.nb}: ugyldig snitt.`);
  if (!fargerFor(p, kjonn).includes(l.farge)) throw new Brukerfeil(`${p.navn.nb}: fargen finnes ikke i dette snittet.`);
  if (!(p.storrelser[kjonn] || []).includes(l.storrelse)) throw new Brukerfeil(`${p.navn.nb}: ugyldig størrelse.`);
  if (!p.front.includes(l.front)) throw new Brukerfeil(`${p.navn.nb}: ugyldig valg foran.`);
  const bak = p.bak.length ? l.bak : "ingen";
  if (p.bak.length && !p.bak.includes(bak)) throw new Brukerfeil(`${p.navn.nb}: ugyldig valg bak.`);

  const gruppe = l.gruppe === GENERISK ? GENERISK : GRUPPER.find((g) => g.navn === l.gruppe);
  if (!gruppe) throw new Brukerfeil("Ukjent gruppe.");
  const g = gruppe === GENERISK ? null : gruppe;
  if ((l.front === "tekst" || bak === "motiv") && !(g && g.motiv)) throw new Brukerfeil("Gruppa har ikke motiv.");

  const navn = p.navnFelt ? String(l.navn || "").toUpperCase().replace(/[^A-ZÆØÅ0-9 .\-]/g, "").trim().slice(0, 12) : "";
  const antall = Number(l.antall);
  if (!Number.isInteger(antall) || antall < 1 || antall > MAKS_ANTALL) throw new Brukerfeil(`Antall må være 1–${MAKS_ANTALL}.`);

  const k = { plagg: p.id, farge: l.farge, gruppe: g ? g.navn : GENERISK, front: l.front, bak, navn, kjonn, storrelse: l.storrelse };
  return { ...k, navn: navn || null, artikkel: p.artikler[`${l.farge}:${kjonn}`] || null, antall, stykkpris: prisFor(k).sum };
}

// NTNUI-1001, NTNUI-1002 … Fortløpende, så de er lette å si i telefonen
async function nyttOrdrenr(env) {
  const { siste } = await env.DB.prepare("SELECT COALESCE(MAX(id), 0) AS siste FROM shop_bestillinger").first();
  return `NTNUI-${1001 + siste}`;
}

// ---------- Admin ----------

async function hentShop(env) {
  const [bestillinger, linjer, puljer] = await env.DB.batch([
    env.DB.prepare("SELECT * FROM shop_bestillinger ORDER BY id DESC"),
    env.DB.prepare("SELECT * FROM shop_linjer ORDER BY id"),
    env.DB.prepare("SELECT * FROM shop_puljer ORDER BY id DESC"),
  ]);
  const perBestilling = new Map();
  for (const l of linjer.results) {
    if (!perBestilling.has(l.bestilling_id)) perBestilling.set(l.bestilling_id, []);
    perBestilling.get(l.bestilling_id).push(l);
  }
  return {
    bestillinger: bestillinger.results.map((b) => ({ ...b, linjer: perBestilling.get(b.id) || [] })),
    puljer: puljer.results,
  };
}

async function lagPulje(env, data, Brukerfeil) {
  const ider = (Array.isArray(data.bestillinger) ? data.bestillinger : []).map(Number).filter(Number.isInteger);
  if (!ider.length) throw new Brukerfeil("Velg minst én bestilling.");
  const navn = tekst(data.navn, "Navn på pulja", 60, Brukerfeil);
  const plass = ider.map(() => "?").join(",");
  const { n } = await env.DB.prepare(`SELECT COUNT(*) AS n FROM shop_bestillinger WHERE status = 'ny' AND id IN (${plass})`).bind(...ider).first();
  if (n !== ider.length) throw new Brukerfeil("Noen av bestillingene er ikke nye lenger. Last sida på nytt.", 409);

  const pulje = await env.DB.prepare("INSERT INTO shop_puljer (navn) VALUES (?) RETURNING id").bind(navn).first();
  await env.DB.prepare(`UPDATE shop_bestillinger SET status = 'pulje', pulje_id = ? WHERE id IN (${plass})`).bind(pulje.id, ...ider).run();
  return { ok: true, id: pulje.id };
}

async function puljeStatus(env, data, Brukerfeil) {
  const id = Number(data.id);
  const felt = { sendt: "sendt", levert: "levert" }[data.status];
  if (!Number.isInteger(id) || !felt) throw new Brukerfeil("Ugyldig forespørsel.");
  const pulje = await env.DB.prepare("SELECT * FROM shop_puljer WHERE id = ?").bind(id).first();
  if (!pulje) throw new Brukerfeil("Pulja finnes ikke.", 404);
  if (felt === "levert" && !pulje.sendt) throw new Brukerfeil("Pulja må være sendt før den kan være levert.", 409);
  // Sendt og levert kan angres med angre: true, så en feilklikk ikke låser noe
  const verdi = data.angre ? null : new Date().toISOString().slice(0, 19).replace("T", " ");
  await env.DB.prepare(`UPDATE shop_puljer SET ${felt} = ? WHERE id = ?`).bind(verdi, id).run();
  return { ok: true };
}

async function avbestill(env, data, Brukerfeil) {
  const id = Number(data.id);
  const b = await env.DB.prepare(
    `SELECT b.*, p.sendt FROM shop_bestillinger b LEFT JOIN shop_puljer p ON p.id = b.pulje_id WHERE b.id = ?`
  ).bind(id).first();
  if (!b) throw new Brukerfeil("Bestillingen finnes ikke.", 404);
  if (b.sendt) throw new Brukerfeil("Pulja er sendt til Intersport. Gi Erik beskjed i stedet.", 409);
  await env.DB.prepare("UPDATE shop_bestillinger SET status = 'avbestilt', avbestilt = datetime('now'), pulje_id = NULL WHERE id = ?").bind(id).run();
  return { ok: true };
}

function tekst(verdi, navn, maks, Brukerfeil) {
  const t = String(verdi ?? "").trim();
  if (!t) throw new Brukerfeil(`${navn} mangler.`);
  return t.slice(0, maks);
}

export const _test = { sjekkLinje, PLAGG };

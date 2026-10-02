// API for NTNUI Ålesund lager. Nettsida på GitHub Pages henter og lagrer alt her.
//
// Offentlig:
//   GET  /api/ting         alle aktive ting, åpne utlån (kun fornavn) og varianter
//   GET  /api/bilde/:id    bildet av en ting
//   POST /api/laan         lån en ting
//   POST /api/lever        lever et utlån
// Admin (Authorization: Bearer <ADMIN_PASSORD>):
//   GET  /api/admin        alt, med telefon og hendelser
//   POST /api/admin/ting   lagre ny eller endret ting, med bilde

const MAKS_BILDE = 1_500_000;

export default {
  async fetch(request, env) {
    const cors = corsHoder(request, env);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    try {
      const svar = await ruter(request, env);
      for (const [k, v] of Object.entries(cors)) svar.headers.set(k, v);
      return svar;
    } catch (feil) {
      if (feil instanceof Brukerfeil) return json({ feil: feil.message }, feil.status, cors);
      console.error(feil);
      return json({ feil: "Noe gikk galt på serveren." }, 500, cors);
    }
  },

  async scheduled(_hendelse, env) {
    await env.DB.prepare(
      `UPDATE utlaan SET navn = 'slettet', telefon = ''
       WHERE levert IS NOT NULL AND levert < date('now', '-12 months') AND navn != 'slettet'`
    ).run();
  },
};

class Brukerfeil extends Error {
  constructor(melding, status = 400) {
    super(melding);
    this.status = status;
  }
}

async function ruter(request, env) {
  const url = new URL(request.url);
  const sti = url.pathname.replace(/\/+$/, "");
  const metode = request.method;

  if (metode === "GET" && sti === "/api/ting") return json(await hentAlt(env, false));
  if (metode === "GET" && sti.startsWith("/api/bilde/")) return hentBilde(env, sti.split("/").pop());
  if (metode === "POST" && sti === "/api/laan") return json(await laan(env, await lesJson(request)));
  if (metode === "POST" && sti === "/api/lever") return json(await lever(env, await lesJson(request)));

  if (sti.startsWith("/api/admin")) {
    await sjekkAdmin(request, env);
    if (metode === "GET" && sti === "/api/admin") return json(await hentAlt(env, true));
    if (metode === "POST" && sti === "/api/admin/ting") return json(await lagreTing(env, await lesJson(request)));
  }

  return json({ feil: "Fant ikke" }, 404);
}

// ---------- Lesing ----------

async function hentAlt(env, admin) {
  const tingSql = admin ? "SELECT * FROM ting ORDER BY id" : "SELECT * FROM ting WHERE status = 'aktiv' ORDER BY id";
  const [ting, varianter, utlaan, hendelser] = await env.DB.batch([
    env.DB.prepare(tingSql),
    env.DB.prepare("SELECT ting_id, navn, antall FROM varianter ORDER BY id"),
    env.DB.prepare("SELECT * FROM utlaan WHERE levert IS NULL ORDER BY frist"),
    env.DB.prepare(admin ? "SELECT * FROM hendelser ORDER BY id DESC LIMIT 50" : "SELECT 1 WHERE 0"),
  ]);

  const perTing = new Map();
  for (const v of varianter.results) {
    if (!perTing.has(v.ting_id)) perTing.set(v.ting_id, []);
    perTing.get(v.ting_id).push({ navn: v.navn, antall: v.antall });
  }

  return {
    ting: ting.results.map((t) => ({ ...t, varianter: perTing.get(t.id) })),
    // Offentlig vises bare fornavnet til låneren
    utlaan: utlaan.results.map((u) =>
      admin ? u : { id: u.id, ting_id: u.ting_id, variant: u.variant, antall: u.antall,
                   navn: u.navn.split(" ")[0], utlaant: u.utlaant, frist: u.frist }
    ),
    hendelser: admin ? hendelser.results : [],
  };
}

async function hentBilde(env, id) {
  const bilde = await env.BILDER.get(`bilde:${Number(id)}`, { type: "arrayBuffer" });
  if (!bilde) return new Response("Fant ikke", { status: 404 });
  return new Response(bilde, {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=86400" },
  });
}

// ---------- Lån og levering ----------

async function laan(env, data) {
  const tingId = heltall(data.ting_id, "ting_id");
  const navn = tekst(data.navn, "Navn", 80);
  const telefon = tekst(data.telefon, "Telefon", 30);
  const frist = dato(data.frist);
  const antall = data.antall ? heltall(data.antall, "Antall") : 1;

  const ting = await env.DB.prepare("SELECT * FROM ting WHERE id = ? AND status = 'aktiv'").bind(tingId).first();
  if (!ting || ting.type === "lokasjon" || !ting.utlaanbar) throw new Brukerfeil("Denne gjenstanden kan ikke lånes.");

  let variant = null;
  if (ting.type === "utstyr") {
    const ute = await env.DB.prepare("SELECT 1 FROM utlaan WHERE ting_id = ? AND levert IS NULL").bind(tingId).first();
    if (ute) throw new Brukerfeil("Gjenstanden er allerede utlånt.", 409);
  } else {
    variant = tekst(data.variant, "Størrelse", 20);
    const v = await env.DB.prepare("SELECT antall FROM varianter WHERE ting_id = ? AND navn = ?").bind(tingId, variant).first();
    if (!v) throw new Brukerfeil("Ukjent størrelse.");
    const { ute } = await env.DB.prepare(
      "SELECT COALESCE(SUM(antall), 0) AS ute FROM utlaan WHERE ting_id = ? AND variant = ? AND levert IS NULL"
    ).bind(tingId, variant).first();
    if (antall > v.antall - ute) throw new Brukerfeil(`Bare ${v.antall - ute} ${variant} er inne.`, 409);
  }

  const detaljer = ting.type === "bulk" ? `${antall} ${variant} utlånt til ${navn}` : `Utlånt til ${navn}`;
  await env.DB.batch([
    env.DB.prepare("INSERT INTO utlaan (ting_id, variant, antall, navn, telefon, frist) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(tingId, variant, antall, navn, telefon, frist),
    hendelse(env, tingId, "utlaant", detaljer),
  ]);
  return { ok: true };
}

async function lever(env, data) {
  const id = heltall(data.utlaan_id, "utlaan_id");
  const u = await env.DB.prepare("SELECT * FROM utlaan WHERE id = ? AND levert IS NULL").bind(id).first();
  if (!u) throw new Brukerfeil("Utlånet finnes ikke eller er allerede levert.", 409);
  await env.DB.batch([
    env.DB.prepare("UPDATE utlaan SET levert = date('now') WHERE id = ?").bind(id),
    hendelse(env, u.ting_id, "levert", `Levert av ${u.navn.split(" ")[0]}`),
  ]);
  return { ok: true };
}

// ---------- Admin ----------

async function sjekkAdmin(request, env) {
  const gitt = (request.headers.get("Authorization") || "").replace(/^Bearer /, "");
  if (!env.ADMIN_PASSORD || !(await likt(gitt, env.ADMIN_PASSORD))) throw new Brukerfeil("Feil passord.", 401);
}

// Sammenligner via hash, så svartiden ikke avslører hvor mye av passordet som stemmer
async function likt(a, b) {
  const enc = new TextEncoder();
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(a)),
    crypto.subtle.digest("SHA-256", enc.encode(b)),
  ]);
  return crypto.subtle.timingSafeEqual(ha, hb);
}

async function lagreTing(env, data) {
  const id = heltall(data.id, "ID");
  const type = data.type;
  if (!["utstyr", "bulk", "lokasjon"].includes(type)) throw new Brukerfeil("Ukjent type.");
  const navn = tekst(data.navn, "Navn", 120);
  const kategori = type === "lokasjon" ? "Lokasjon" : (data.kategori || "").trim().slice(0, 60);
  const beskrivelse = (data.beskrivelse || "").trim().slice(0, 500);
  const hjemId = data.hjem_id ? heltall(data.hjem_id, "Hjem") : null;
  const status = data.status === "kassert" ? "kassert" : "aktiv";
  if (hjemId === id) throw new Brukerfeil("En gjenstand kan ikke ligge i seg selv.");

  const fra = await env.DB.prepare("SELECT * FROM ting WHERE id = ?").bind(id).first();
  if (fra && data.ny) throw new Brukerfeil(`ID ${id} er allerede brukt.`, 409);
  if (fra && fra.type !== type) throw new Brukerfeil("Typen kan ikke endres etter registrering.");

  // Bildet kommer som data-URL fra nettleseren
  let bilde = fra?.bilde || null;
  if (typeof data.bilde === "string" && data.bilde.startsWith("data:image/")) {
    const bytes = Uint8Array.from(atob(data.bilde.split(",")[1]), (c) => c.charCodeAt(0));
    if (bytes.length > MAKS_BILDE) throw new Brukerfeil("Bildet er for stort.");
    await env.BILDER.put(`bilde:${id}`, bytes);
    bilde = String(Date.now());
  }

  const setninger = [
    env.DB.prepare(
      `INSERT INTO ting (id, type, navn, kategori, beskrivelse, hjem_id, bilde, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET navn = excluded.navn, kategori = excluded.kategori,
         beskrivelse = excluded.beskrivelse, hjem_id = excluded.hjem_id,
         bilde = excluded.bilde, status = excluded.status`
    ).bind(id, type, navn, kategori, beskrivelse, hjemId, bilde, status),
  ];

  if (type === "bulk") {
    const varianter = (data.varianter || []).filter((v) => v.navn);
    if (!varianter.length) throw new Brukerfeil("Skriv inn minst én rad med antall.");
    setninger.push(env.DB.prepare("DELETE FROM varianter WHERE ting_id = ?").bind(id));
    for (const v of varianter) {
      setninger.push(env.DB.prepare("INSERT INTO varianter (ting_id, navn, antall) VALUES (?, ?, ?)")
        .bind(id, tekst(v.navn, "Størrelse", 20), Math.max(0, Number(v.antall) || 0)));
    }
  }

  const hva = !fra ? ["opprettet", "Registrert"]
    : fra.status !== status ? [status === "kassert" ? "kassert" : "endret", status === "kassert" ? "Kassert" : "Tatt i bruk igjen"]
    : fra.hjem_id !== hjemId ? ["flyttet", "Flyttet"]
    : ["endret", "Endret"];
  setninger.push(hendelse(env, id, ...hva));

  await env.DB.batch(setninger);
  return { ok: true, id };
}

// ---------- Hjelpere ----------

function hendelse(env, tingId, type, detaljer) {
  return env.DB.prepare("INSERT INTO hendelser (ting_id, hendelse, detaljer) VALUES (?, ?, ?)").bind(tingId, type, detaljer);
}

async function lesJson(request) {
  try {
    return await request.json();
  } catch {
    throw new Brukerfeil("Ugyldig forespørsel.");
  }
}

function heltall(verdi, navn) {
  const n = Number(verdi);
  if (!Number.isInteger(n) || n < 1) throw new Brukerfeil(`${navn} må være et positivt heltall.`);
  return n;
}

function tekst(verdi, navn, maks) {
  const t = String(verdi ?? "").trim();
  if (!t) throw new Brukerfeil(`${navn} mangler.`);
  return t.slice(0, maks);
}

function dato(verdi) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(verdi || "")) throw new Brukerfeil("Ugyldig dato.");
  return verdi;
}

function corsHoder(request, env) {
  const fra = request.headers.get("Origin");
  const tillatt = env.TILLATTE_ADRESSER.split(",").includes(fra);
  return tillatt
    ? { "Access-Control-Allow-Origin": fra, "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization", "Vary": "Origin" }
    : { "Vary": "Origin" };
}

function json(data, status = 200, ekstra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...ekstra },
  });
}

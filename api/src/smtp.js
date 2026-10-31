// Minimal SMTP-klient for Cloudflare Workers (cloudflare:sockets). Ingen avhengigheter.
//
// Sender via Domeneshop sin SMTP-server med implisitt TLS (port 465) og innlogging som den
// ekte postkassa. Støtter AUTH PLAIN og AUTH LOGIN, flere mottakere, dot-stuffing og MIME
// (multipart/alternative med tekst og HTML, emne kodet etter RFC 2047).
//
// Secrets (wrangler secret put): SMTP_BRUKER og SMTP_PASSORD. De logges aldri, og feilmeldingene
// under inneholder bare kommandoens navn og svaret fra serveren, aldri det som ble sendt.
// Vars: SMTP_HOST, SMTP_PORT, EPOST_FRA_ADRESSE, EPOST_FRA_NAVN.

const CRLF = "\r\n";
const TIDSGRENSE_MS = 20000;
const EHLO_NAVN = "ntnui-alesund.no";

export class SmtpFeil extends Error {
  constructor(melding, kode) {
    super(melding);
    this.name = "SmtpFeil";
    this.kode = kode;
  }
}

// ---------- MIME ----------

const enc = new TextEncoder();

export function base64(tekst) {
  const bytes = enc.encode(tekst);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

// Base64 brutt på 76 tegn per linje, CRLF mellom linjene
export function base64Linjer(tekst) {
  return (base64(tekst).match(/.{1,76}/g) || []).join(CRLF);
}

const erAscii = (s) => /^[\x20-\x7e]*$/.test(s);
const rens = (s) => String(s ?? "").replace(/[\r\n]+/g, " ").trim();

// RFC 2047: =?UTF-8?B?...?=. Hvert kodet ord er høyst 75 tegn, og et tegn deles aldri midt i.
export function kodeOrd(tekst) {
  const t = rens(tekst);
  if (erAscii(t)) return t;
  const deler = [];
  let del = "";
  for (const tegn of t) {
    if (enc.encode(del + tegn).length > 45) { deler.push(del); del = ""; }
    del += tegn;
  }
  if (del) deler.push(del);
  return deler.map((d) => `=?UTF-8?B?${base64(d)}?=`).join(CRLF + " ");
}

function sjekkAdresse(a) {
  if (!/^[^\s<>@"\\]+@[^\s<>@"\\]+$/.test(a)) throw new Error(`Ugyldig e-postadresse: ${rens(a).slice(0, 80)}`);
  return a;
}

const klokkeslett = (d) => d.toUTCString().replace("GMT", "+0000");

function dotStuff(tekst) {
  return tekst.replace(/(^|\n)\./g, "$1..");
}

// Bygger hele meldingen med CRLF. fra = { navn, adresse }, til = én adresse eller liste.
export function byggMelding({ fra, til, svarTil, emne, text, html, dato = new Date(), id = crypto.randomUUID(), grense }) {
  const mottakere = (Array.isArray(til) ? til : [til]).map(sjekkAdresse);
  const domene = fra.adresse.split("@")[1];
  const hode = [
    `From: ${kodeOrd(fra.navn)} <${sjekkAdresse(fra.adresse)}>`,
    `To: ${mottakere.join(", ")}`,
    ...(svarTil ? [`Reply-To: ${sjekkAdresse(svarTil)}`] : []),
    `Subject: ${kodeOrd(emne)}`,
    `Date: ${klokkeslett(dato)}`,
    `Message-ID: <${id}@${domene}>`,
    "MIME-Version: 1.0",
  ];
  const tekstDel = [
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64", "",
    base64Linjer(text.replace(/\r?\n/g, CRLF)),
  ];
  if (!html) return [...hode, ...tekstDel, ""].join(CRLF);

  const g = grense || `=_ntnui_${crypto.randomUUID().replace(/-/g, "")}`;
  return [
    ...hode,
    `Content-Type: multipart/alternative; boundary="${g}"`, "",
    `--${g}`, ...tekstDel,
    `--${g}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64", "",
    base64Linjer(html.replace(/\r?\n/g, CRLF)),
    `--${g}--`, "",
  ].join(CRLF);
}

// ---------- Protokoll ----------

function medFrist(p, frist, hva) {
  const igjen = frist - Date.now();
  p.catch?.(() => {});
  if (igjen <= 0) return Promise.reject(new Error(`SMTP: tidsavbrudd (${hva})`));
  let t;
  const timer = new Promise((_, avvis) => { t = setTimeout(() => avvis(new Error(`SMTP: tidsavbrudd (${hva})`)), igjen); });
  return Promise.race([p, timer]).finally(() => clearTimeout(t));
}

// Leser svar fra serveren. Et svar kan ha flere linjer: "250-..." fortsetter, "250 ..." avslutter.
export class SvarLeser {
  constructor(leser, frist) {
    this.leser = leser;
    this.frist = frist;
    this.dekoder = new TextDecoder();
    this.buffer = "";
  }

  async nesteLinje() {
    for (;;) {
      const i = this.buffer.indexOf("\n");
      if (i >= 0) {
        const linje = this.buffer.slice(0, i).replace(/\r$/, "");
        this.buffer = this.buffer.slice(i + 1);
        return linje;
      }
      const { value, done } = await medFrist(this.leser.read(), this.frist, "lesing");
      if (done) throw new Error("SMTP: serveren lukket forbindelsen");
      this.buffer += this.dekoder.decode(value, { stream: true });
    }
  }

  async svar() {
    const linjer = [];
    for (;;) {
      const linje = await this.nesteLinje();
      const m = /^(\d{3})([ -]|$)(.*)$/.exec(linje);
      if (!m) throw new Error(`SMTP: uventet svar fra serveren: ${linje.slice(0, 120)}`);
      linjer.push(m[3]);
      if (m[2] !== "-") return { kode: Number(m[1]), linjer, tekst: linjer.join(" ") };
    }
  }
}

class Sesjon {
  constructor(socket, frist) {
    this.frist = frist;
    this.leser = new SvarLeser(socket.readable.getReader(), frist);
    this.skriver = socket.writable.getWriter();
  }

  skriv(data) {
    return medFrist(this.skriver.write(enc.encode(data)), this.frist, "skriving");
  }

  // Sender en kommando og krever at svaret har en av forventede koder. navn brukes i feilmeldingen,
  // aldri selve kommandoen (den kan inneholde passord).
  async kommando(linje, navn, forventet) {
    await this.skriv(linje + CRLF);
    return this.forvent(navn, forventet);
  }

  async forvent(navn, forventet) {
    const s = await this.leser.svar();
    if (!forventet.includes(s.kode)) throw new SmtpFeil(`SMTP ${navn}: ${s.kode} ${s.tekst}`, s.kode);
    return s;
  }

  async logginn(bruker, passord, metoder) {
    if (metoder.includes("PLAIN")) {
      await this.kommando(`AUTH PLAIN ${base64(`\0${bruker}\0${passord}`)}`, "AUTH PLAIN", [235]);
    } else if (metoder.includes("LOGIN")) {
      await this.kommando("AUTH LOGIN", "AUTH LOGIN", [334]);
      await this.kommando(base64(bruker), "AUTH LOGIN (bruker)", [334]);
      await this.kommando(base64(passord), "AUTH LOGIN (passord)", [235]);
    } else {
      throw new Error(`SMTP: serveren tilbyr ingen støttet innloggingsmetode (${metoder.join(" ") || "ingen"})`);
    }
  }

  async transaksjon(avsender, mottakere, melding) {
    await this.kommando(`MAIL FROM:<${sjekkAdresse(avsender)}>`, "MAIL FROM", [250]);
    for (const m of mottakere) await this.kommando(`RCPT TO:<${sjekkAdresse(m)}>`, "RCPT TO", [250, 251]);
    await this.kommando("DATA", "DATA", [354]);
    await this.skriv(dotStuff(melding.endsWith(CRLF) ? melding : melding + CRLF) + "." + CRLF);
    await this.forvent("meldingen", [250]);
  }
}

async function standardKoble(host, port) {
  const { connect } = await import("cloudflare:sockets");
  return connect({ hostname: host, port }, { secureTransport: "on", allowHalfOpen: false });
}

// Sender flere meldinger i én økt, hver i sin transaksjon. En melding som serveren avviser
// stopper ikke de andre. Svarer med [{ ok: true } | { ok: false, feil }] i samme rekkefølge.
// Feil på tilkobling eller innlogging kastes.
// meldinger: [{ til, emne, text, html }]
export async function sendMeldinger(env, meldinger, { koble = standardKoble, tidsgrense = TIDSGRENSE_MS } = {}) {
  if (!env.SMTP_BRUKER || !env.SMTP_PASSORD) throw new Error("SMTP: SMTP_BRUKER eller SMTP_PASSORD mangler");
  const fra = { navn: env.EPOST_FRA_NAVN, adresse: env.EPOST_FRA_ADRESSE };
  const frist = Date.now() + tidsgrense;

  // Bygg alt først, så en ugyldig adresse feiler før vi kobler til
  const ferdige = meldinger.map((m) => {
    try {
      const til = Array.isArray(m.til) ? m.til : [m.til];
      return { til, data: byggMelding({ fra, svarTil: fra.adresse, ...m }) };
    } catch (feil) {
      return { feil };
    }
  });

  const socket = await medFrist(koble(env.SMTP_HOST, Number(env.SMTP_PORT)), frist, "tilkobling");
  const resultat = [];
  try {
    const s = new Sesjon(socket, frist);
    await s.forvent("hilsen", [220]);
    const ehlo = await s.kommando(`EHLO ${EHLO_NAVN}`, "EHLO", [250]);
    const metoder = ehlo.linjer.flatMap((l) => (/^AUTH[ =](.*)$/i.exec(l)?.[1] || "").toUpperCase().split(/\s+/)).filter(Boolean);
    await s.logginn(env.SMTP_BRUKER, env.SMTP_PASSORD, metoder);

    for (const m of ferdige) {
      if (m.feil) { resultat.push({ ok: false, feil: m.feil }); continue; }
      try {
        await s.transaksjon(fra.adresse, m.til, m.data);
        resultat.push({ ok: true });
      } catch (feil) {
        resultat.push({ ok: false, feil });
        // Avvist av serveren: nullstill og prøv neste. Alt annet (brudd, tidsavbrudd) avslutter økta.
        if (!(feil instanceof SmtpFeil)) break;
        try { await s.kommando("RSET", "RSET", [250]); } catch { break; }
      }
    }
    while (resultat.length < ferdige.length) resultat.push({ ok: false, feil: new Error("SMTP: økta ble avbrutt før meldingen ble sendt") });
    await s.kommando("QUIT", "QUIT", [221]).catch(() => {});
  } finally {
    try { await socket.close(); } catch { /* allerede lukket */ }
  }
  return resultat;
}

export const _test = { dotStuff, Sesjon };

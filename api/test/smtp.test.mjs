// Kjøres med: node --test api/test   (ingen avhengigheter)
import test from "node:test";
import assert from "node:assert/strict";
import { byggMelding, kodeOrd, base64Linjer, sendMeldinger, SvarLeser, _test } from "../src/smtp.js";
import { _test as epostTest } from "../src/epost.js";

const dek = new TextDecoder();

// Falsk SMTP-server i minnet. svar(kommando) gir tekst som sendes tilbake.
function falskServer({ ehlo = "250-smtp.test\r\n250-AUTH PLAIN LOGIN\r\n250 HELP\r\n", avvis = [], hengVedData = false } = {}) {
  const logg = [];
  let ut;
  const readable = new ReadableStream({ start(c) { ut = c; c.enqueue(new TextEncoder().encode("220 smtp.test ESMTP\r\n")); } });
  let buf = "";
  let iData = false;
  let melding = "";
  const sendt = (s) => ut.enqueue(new TextEncoder().encode(s));
  const writable = new WritableStream({
    write(chunk) {
      buf += dek.decode(chunk);
      if (iData) {
        if (buf.endsWith("\r\n.\r\n")) {
          iData = false;
          logg.push({ data: buf.slice(0, -3) });
          buf = "";
          if (!hengVedData) sendt("250 OK queued\r\n");
        }
        return;
      }
      let i;
      while ((i = buf.indexOf("\r\n")) >= 0) {
        const linje = buf.slice(0, i);
        buf = buf.slice(i + 2);
        logg.push(linje);
        if (linje.startsWith("EHLO")) sendt(ehlo);
        else if (linje.startsWith("AUTH PLAIN")) sendt("235 2.7.0 Authentication succeeded\r\n");
        else if (linje.startsWith("MAIL FROM")) sendt("250 OK\r\n");
        else if (linje.startsWith("RCPT TO")) sendt(avvis.some((a) => linje.includes(a)) ? "550 5.1.1 no such user\r\n" : "250 OK\r\n");
        else if (linje === "DATA") { sendt("354 go ahead\r\n"); iData = true; break; }
        else if (linje === "RSET") sendt("250 reset\r\n");
        else if (linje === "QUIT") sendt("221 bye\r\n");
        else sendt("500 what\r\n");
      }
    },
  });
  return { socket: { readable, writable, close: async () => {} }, logg };
}

const env = { SMTP_BRUKER: "material@ntnui-alesund.no", SMTP_PASSORD: "hemmelig-passord", SMTP_HOST: "x", SMTP_PORT: "465",
  EPOST_FRA_ADRESSE: "material@ntnui-alesund.no", EPOST_FRA_NAVN: "NTNUI Ålesund Materialansvarlig" };

test("dot-stuffing", () => {
  assert.equal(_test.dotStuff("a\r\n.b\r\n..c\r\nd"), "a\r\n..b\r\n...c\r\nd");
  assert.equal(_test.dotStuff(".start"), "..start");
});

test("RFC 2047: ASCII urørt, æøå kodet, kodede ord <= 75 tegn, ingen tegn delt", () => {
  assert.equal(kodeOrd("Hello"), "Hello");
  const e = kodeOrd("Bestillingen din er mottatt – NTNUI-1001 æøå ÆØÅ og enda mer tekst her");
  for (const ord of e.split("\r\n ")) assert.ok(ord.length <= 75 && /^=\?UTF-8\?B\?[A-Za-z0-9+/=]+\?=$/.test(ord), ord);
  const tilbake = e.split("\r\n ").map((o) => Buffer.from(o.slice(10, -2), "base64").toString("utf8")).join("");
  assert.equal(tilbake, "Bestillingen din er mottatt – NTNUI-1001 æøå ÆØÅ og enda mer tekst her");
  assert.equal(kodeOrd("a\r\nBcc: x@y.no"), "a Bcc: x@y.no");
});

test("base64 brytes på 76 tegn med CRLF", () => {
  const b = base64Linjer("æ".repeat(200));
  for (const l of b.split("\r\n")) assert.ok(l.length <= 76);
  assert.equal(Buffer.from(b.replace(/\r\n/g, ""), "base64").toString("utf8"), "æ".repeat(200));
});

test("MIME: alle linjer CRLF, multipart/alternative, headere", () => {
  const m = byggMelding({
    fra: { navn: "NTNUI Ålesund Materialansvarlig", adresse: "material@ntnui-alesund.no" },
    til: "kari@stud.ntnu.no", svarTil: "material@ntnui-alesund.no", emne: "Mottatt – æøå",
    text: "Hei\n.punktum\nÆØÅ", html: "<p>Hei</p>\n<p>ÆØÅ</p>", dato: new Date("2026-10-31T09:00:00Z"), id: "abc", grense: "GRENSE",
  });
  assert.ok(!/(^|[^\r])\n/.test(m), "bare CRLF");
  assert.ok(m.includes("From: =?UTF-8?B?"));
  assert.ok(m.includes("<material@ntnui-alesund.no>"));
  assert.ok(m.includes("To: kari@stud.ntnu.no\r\n"));
  assert.ok(m.includes("Reply-To: material@ntnui-alesund.no\r\n"));
  assert.ok(m.includes("Date: Sat, 31 Oct 2026 09:00:00 +0000\r\n"));
  assert.ok(m.includes("Message-ID: <abc@ntnui-alesund.no>\r\n"));
  assert.ok(m.includes('Content-Type: multipart/alternative; boundary="GRENSE"'));
  assert.ok(m.includes("Content-Type: text/plain; charset=UTF-8") && m.includes("Content-Type: text/html; charset=UTF-8"));
  assert.ok(m.endsWith("--GRENSE--\r\n"));
  const deler = m.split("--GRENSE");
  const tekst = deler[1].split("\r\n\r\n")[1];
  assert.equal(Buffer.from(tekst.replace(/\r\n/g, ""), "base64").toString("utf8"), "Hei\r\n.punktum\r\nÆØÅ");
  assert.throws(() => byggMelding({ fra: { navn: "x", adresse: "a@b.no" }, til: "a@b.no\r\nBcc: x@y.no", emne: "x", text: "x" }));
});

test("MIME: bare tekst gir text/plain base64", () => {
  const m = byggMelding({ fra: { navn: "x", adresse: "a@b.no" }, til: ["a@b.no", "c@d.no"], emne: "Hei", text: "tekst" });
  assert.ok(m.includes("To: a@b.no, c@d.no\r\n") && !m.includes("multipart"));
});

test("svarleser: flerlinjede svar og svar delt over flere biter", async () => {
  const biter = ["250-smtp.test He", "llo\r\n250-AUTH PLAIN", " LOGIN\r\n250 ", "HELP\r\n220 neste\r\n"];
  let i = 0;
  const leser = new SvarLeser({ read: async () => (i < biter.length ? { value: new TextEncoder().encode(biter[i++]), done: false } : { done: true }) }, Date.now() + 1000);
  const a = await leser.svar();
  assert.equal(a.kode, 250);
  assert.deepEqual(a.linjer, ["smtp.test Hello", "AUTH PLAIN LOGIN", "HELP"]);
  assert.deepEqual((await leser.svar()).linjer, ["neste"]);
  await assert.rejects(leser.svar(), /lukket/);
});

test("full økt: to meldinger, AUTH PLAIN, dot-stuffing, QUIT", async () => {
  const s = falskServer();
  const res = await sendMeldinger(env, [
    { til: "kari@stud.ntnu.no", emne: "Kvittering", text: "a\n.b", html: "<p>a</p>" },
    { til: "material@ntnui-alesund.no", emne: "Varsel – æ", text: "ny" },
  ], { koble: async () => s.socket });
  assert.deepEqual(res.map((r) => r.ok), [true, true]);
  const kommandoer = s.logg.filter((l) => typeof l === "string");
  assert.deepEqual(kommandoer.map((k) => k.split(" ")[0] + (k.startsWith("AUTH") ? " PLAIN" : "")), ["EHLO", "AUTH PLAIN", "MAIL", "RCPT", "DATA", "MAIL", "RCPT", "DATA", "QUIT"].map((x) => x));
  const auth = kommandoer.find((k) => k.startsWith("AUTH PLAIN"));
  assert.equal(Buffer.from(auth.split(" ")[2], "base64").toString(), "\0material@ntnui-alesund.no\0hemmelig-passord");
  assert.ok(kommandoer.includes("MAIL FROM:<material@ntnui-alesund.no>"));
  assert.ok(kommandoer.includes("RCPT TO:<kari@stud.ntnu.no>"));
  assert.equal(s.logg.filter((l) => l.data).length, 2);
});

test("avvist mottaker stopper ikke neste melding, feilen har serversvaret", async () => {
  const s = falskServer({ avvis: ["kari@"] });
  const res = await sendMeldinger(env, [
    { til: "kari@stud.ntnu.no", emne: "K", text: "x" },
    { til: "material@ntnui-alesund.no", emne: "V", text: "y" },
  ], { koble: async () => s.socket });
  assert.equal(res[0].ok, false);
  assert.match(res[0].feil.message, /RCPT TO: 550 5\.1\.1 no such user/);
  assert.equal(res[1].ok, true);
  assert.ok(s.logg.includes("RSET"));
  assert.ok(!JSON.stringify(res[0].feil.message).includes("hemmelig"));
});

test("AUTH LOGIN når bare LOGIN tilbys", async () => {
  const enc = new TextEncoder();
  const logg = [];
  let ut;
  const sock = {
    readable: new ReadableStream({ start(c) { ut = c; c.enqueue(enc.encode("220 hi\r\n")); } }),
    writable: new WritableStream({ write(ch) {
      for (const l of dek.decode(ch).split("\r\n").filter(Boolean)) {
        logg.push(l);
        if (l.startsWith("EHLO")) ut.enqueue(enc.encode("250-x\r\n250 AUTH LOGIN\r\n"));
        else if (l === "AUTH LOGIN") ut.enqueue(enc.encode("334 VXNlcm5hbWU6\r\n"));
        else if (logg.length === 3) ut.enqueue(enc.encode("334 UGFzc3dvcmQ6\r\n"));
        else if (logg.length === 4) ut.enqueue(enc.encode("235 ok\r\n"));
        else if (l === "QUIT") ut.enqueue(enc.encode("221 bye\r\n"));
      }
    } }),
    close: async () => {},
  };
  await sendMeldinger(env, [], { koble: async () => sock });
  assert.equal(Buffer.from(logg[2], "base64").toString(), env.SMTP_BRUKER);
  assert.equal(Buffer.from(logg[3], "base64").toString(), env.SMTP_PASSORD);
});

test("ingen støttet innloggingsmetode gir feil", async () => {
  const s = falskServer({ ehlo: "250-x\r\n250 AUTH CRAM-MD5\r\n" });
  await assert.rejects(sendMeldinger(env, [{ til: "a@b.no", emne: "x", text: "x" }], { koble: async () => s.socket }), /ingen støttet innloggingsmetode/);
});

test("tidsavbrudd når serveren ikke svarer etter DATA", async () => {
  const s = falskServer({ hengVedData: true });
  const res = await sendMeldinger(env, [{ til: "a@b.no", emne: "x", text: "x" }], { koble: async () => s.socket, tidsgrense: 300 });
  assert.equal(res[0].ok, false);
  assert.match(res[0].feil.message, /tidsavbrudd/);
});

test("mangler secrets gir feil før tilkobling", async () => {
  await assert.rejects(sendMeldinger({ ...env, SMTP_PASSORD: "" }, [], { koble: async () => assert.fail() }), /mangler/);
});

test("kvitteringen har sikkerhetsmerknad på riktig språk og ingen lenker", () => {
  const linjer = [{ plagg: "ukjent", antall: 1, stykkpris: 100, farge: "svart", kjonn: "herre", storrelse: "M", gruppe: "Generisk", front: "ingen", bak: "ingen", navn: null }];
  for (const [sprak, tekst] of [["nb", "Vi vil aldri be deg om personopplysninger, passord eller betaling på e-post, eller be deg klikke på lenker utenfor ntnui-alesund.no."],
    ["en", "We will never ask for personal information, passwords or payment by email, or ask you to click links outside ntnui-alesund.no."]]) {
    const k = epostTest.kvittering({ navn: "Kari Nordmann", epost: "kari@stud.ntnu.no", ordrenr: "NTNUI-1001", sum: 100, sprak }, linjer);
    assert.ok(k.html.includes(tekst) && k.text.endsWith(tekst));
    assert.ok(!/href=|https?:\/\//i.test(k.html + k.text));
  }
});

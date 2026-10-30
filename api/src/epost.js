// E-post via Resend (resend.com). Kvittering til kunden på språket kunden valgte på nettsida,
// og varsel til materialansvarlig om hver nye bestilling.
//
// Krever secret RESEND_API_KEY (wrangler secret put RESEND_API_KEY). Uten den sendes ingenting,
// og bestillingen lagres som vanlig. Avsender og mottaker for varsel står i wrangler.jsonc.

import { finnPlagg, GENERISK } from "./katalog.js";

const TEKST = {
  nb: {
    emne: (nr) => `Bestillingen din er mottatt – ${nr}`,
    hei: (navn) => `Hei ${navn}!`,
    intro: "Takk for bestillingen. Vi samler bestillingene og sender dem til Intersport Rongve. Du får beskjed når plaggene er klare til henting.",
    ordrenr: "Ordrenummer",
    plagg: "Plagg",
    pris: "Pris",
    total: "Totalt",
    betaling: "Du betaler når du henter hos Intersport Rongve, Høgvollveien 8. Ingen betaling på forhånd.",
    sporsmal: "Spørsmål eller endringer? Svar på denne e-posten.",
    hilsen: "Hilsen NTNUI Ålesund",
    farge: { svart: "svart", hvit: "hvit" },
    kjonn: { herre: "herre", dame: "dame" },
    foran: "foran", bak: "bak",
    trykk: { ntnui: "NTNUI-logo", tekst: "gruppenavn", logo: "gruppelogo", motiv: "motiv" },
    generisk: "generisk",
    ingenTrykk: "uten trykk",
    navn: "navn",
  },
  en: {
    emne: (nr) => `Your order has been received – ${nr}`,
    hei: (navn) => `Hi ${navn}!`,
    intro: "Thank you for your order. We collect the orders and send them to Intersport Rongve. We will let you know when your items are ready for pickup.",
    ordrenr: "Order number",
    plagg: "Item",
    pris: "Price",
    total: "Total",
    betaling: "You pay when you pick up at Intersport Rongve, Høgvollveien 8. No payment in advance.",
    sporsmal: "Questions or changes? Reply to this email.",
    hilsen: "Best regards, NTNUI Ålesund",
    farge: { svart: "black", hvit: "white" },
    kjonn: { herre: "men", dame: "women" },
    foran: "front", bak: "back",
    trykk: { ntnui: "NTNUI logo", tekst: "group name", logo: "group logo", motiv: "motif" },
    generisk: "generic",
    ingenTrykk: "no print",
    navn: "name",
  },
};

const kroner = (n, sprak) => (sprak === "en" ? `NOK ${n.toLocaleString("en-GB")}` : `${n.toLocaleString("nb-NO")},-`);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function beskriv(l, t, sprak) {
  const p = finnPlagg(l.plagg);
  const gruppe = l.gruppe === GENERISK ? t.generisk : l.gruppe;
  const trykk = [];
  if (l.front !== "ingen") trykk.push(`${l.front === "tekst" ? `${gruppe} ` : ""}${t.trykk[l.front]} ${t.foran}`);
  if (l.bak !== "ingen") trykk.push(`${gruppe} ${t.trykk[l.bak]} ${t.bak}`);
  if (l.navn) trykk.push(`${t.navn} «${l.navn}»`);
  return {
    tittel: `${l.antall} × ${p ? p.navn[sprak] : l.plagg}`,
    detaljer: `${t.farge[l.farge] || l.farge}, ${t.kjonn[l.kjonn]} ${l.storrelse} · ${trykk.join(", ") || t.ingenTrykk}`,
  };
}

function kvittering(b, linjer) {
  const sprak = b.sprak === "en" ? "en" : "nb";
  const t = TEKST[sprak];
  const fornavn = b.navn.split(/\s+/)[0];
  const rader = linjer.map((l) => ({ ...beskriv(l, t, sprak), sum: kroner(l.stykkpris * l.antall, sprak) }));

  const html = `<!doctype html><html lang="${sprak === "en" ? "en" : "nb"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head><body style="margin:0;background:#eef5ee;font-family:Helvetica,Arial,sans-serif;color:#0b1f12">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef5ee;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="background:#007d32;padding:22px 28px;color:#fafa00;font-size:20px;font-weight:bold;letter-spacing:.5px">NTNUI ÅLESUND</td></tr>
<tr><td style="padding:28px">
<p style="margin:0 0 12px;font-size:18px;font-weight:bold">${esc(t.hei(fornavn))}</p>
<p style="margin:0 0 20px;font-size:15px;line-height:1.5">${esc(t.intro)}</p>
<p style="margin:0 0 20px;font-size:15px">${esc(t.ordrenr)}: <strong style="color:#007d32">${esc(b.ordrenr)}</strong></p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;border-top:1px solid #dfe9e1">
${rader.map((r) => `<tr><td style="padding:12px 0;border-bottom:1px solid #dfe9e1"><strong>${esc(r.tittel)}</strong><br><span style="color:#56665b">${esc(r.detaljer)}</span></td>
<td align="right" style="padding:12px 0;border-bottom:1px solid #dfe9e1;white-space:nowrap;vertical-align:top">${esc(r.sum)}</td></tr>`).join("")}
<tr><td style="padding:14px 0;font-weight:bold">${esc(t.total)}</td><td align="right" style="padding:14px 0;font-weight:bold;font-size:17px;white-space:nowrap">${esc(kroner(b.sum, sprak))}</td></tr>
</table>
<p style="margin:18px 0 0;padding:14px 16px;background:#fafae0;border-radius:10px;font-size:14px;line-height:1.5">${esc(t.betaling)}</p>
<p style="margin:20px 0 0;font-size:14px;color:#56665b">${esc(t.sporsmal)}<br>${esc(t.hilsen)}</p>
</td></tr></table></td></tr></table></body></html>`;

  const tekst = [
    t.hei(fornavn), "", t.intro, "", `${t.ordrenr}: ${b.ordrenr}`, "",
    ...rader.map((r) => `${r.tittel} – ${r.sum}\n  ${r.detaljer}`), "",
    `${t.total}: ${kroner(b.sum, sprak)}`, "", t.betaling, "", t.sporsmal, t.hilsen,
  ].join("\n");

  return { to: b.epost, subject: t.emne(b.ordrenr), html, text: tekst };
}

// Varselet til materialansvarlig er alltid på norsk
function varsel(b, linjer, env) {
  const t = TEKST.nb;
  const tekst = [
    `Ny bestilling ${b.ordrenr} fra ${b.navn}`,
    `${b.telefon} · ${b.epost}`, "",
    ...linjer.map((l) => { const r = beskriv(l, t, "nb"); return `${r.tittel}: ${r.detaljer} – ${kroner(l.stykkpris * l.antall, "nb")}`; }),
    "", `Totalt: ${kroner(b.sum, "nb")}`,
    b.kommentar ? `\nKommentar: ${b.kommentar}` : "",
    "", `Se alle bestillinger: ${env.SHOP_ADMIN_URL}`,
  ].join("\n");
  return { to: env.VARSEL_TIL, subject: `Ny bestilling ${b.ordrenr} – ${b.navn}`, text: tekst };
}

async function send(env, melding) {
  const svar = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.EPOST_FRA, reply_to: env.VARSEL_TIL, ...melding }),
  });
  if (!svar.ok) throw new Error(`Resend ${svar.status}: ${await svar.text()}`);
}

// Sender kvittering og varsel. Feiler aldri bestillingen: svarer bare om kvitteringen gikk.
export async function sendEposter(env, bestilling, linjer) {
  if (!env.RESEND_API_KEY) return false;
  const [kunde, admin] = await Promise.allSettled([
    env.KVITTERING === "av" ? Promise.reject(new Error("Kvittering er slått av")) : send(env, kvittering(bestilling, linjer)),
    env.VARSEL_TIL ? send(env, varsel(bestilling, linjer, env)) : Promise.resolve(),
  ]);
  if (admin.status === "rejected") console.error(admin.reason);
  if (kunde.status === "rejected" && env.KVITTERING !== "av") console.error(kunde.reason);
  return kunde.status === "fulfilled";
}

export const _test = { kvittering, varsel };

// Tester kolleksjonen på forsiden (docs/shop/kolleksjon.js): tilfeldige kombinasjoner og dra-logikken.
// Skriptene er vanlige nettleserskript, så de kjøres i en vm-kontekst uten DOM.
import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync, existsSync } from "node:fs";

const rot = new URL("../../docs/shop/", import.meta.url);
const ctx = vm.createContext({ console, performance, URLSearchParams, requestAnimationFrame: (f) => setTimeout(f, 16), cancelAnimationFrame: clearTimeout });
vm.runInContext(readFileSync(new URL("katalog.js", rot), "utf8"), ctx);
vm.runInContext(readFileSync(new URL("kolleksjon.js", rot), "utf8"), ctx);
const k = (uttrykk) => vm.runInContext(uttrykk, ctx);

// Fast frø, så testen gir samme resultat hver gang
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
ctx.mulberry32 = mulberry32;

test("kombinasjonene er gyldige, ulike og har trykkfilene på plass", () => {
  const farger = new Set();
  const plagg = new Set();
  for (let frø = 1; frø <= 300; frø++) {
    const liste = k(`lagKombinasjoner(12, mulberry32(${frø}))`);
    assert.equal(liste.length, 12);
    assert.equal(new Set(liste.map((x) => JSON.stringify(x))).size, 12, "ingen duplikater");
    assert.equal(new Set(liste.map((x) => x.gruppe)).size, 12, "hver gruppe bare én gang");
    for (const x of liste) {
      assert.ok(k(`kolGyldig(${JSON.stringify(x)})`), JSON.stringify(x));
      const g = k(`finnGruppe(${JSON.stringify(x.gruppe)})`);
      const f = x.farge === "hvit" ? "sort" : "hvit";
      if (x.front === "tekst") assert.ok(existsSync(new URL(`img/tekst/${g.slug}-front-${f}.svg`, rot)));
      if (x.bak === "motiv") for (const fil of [`motiv/${g.slug}-${f}.svg`, `tekst/${g.slug}-bak-${f}.svg`, `tekst/${g.slug}-estd-${f}.svg`]) assert.ok(existsSync(new URL(`img/${fil}`, rot)), fil);
      if (x.bak === "logo") assert.ok(existsSync(new URL(`img/logo/${g.slug}.webp`, rot)));
      farger.add(`${x.plagg}:${x.farge}`);
      plagg.add(x.plagg);
    }
    // De tre første skal være de pene: jersey med logo bak, Entrada-tee med motiv, genser med motiv
    assert.deepEqual([liste[0].plagg, liste[0].bak], ["tiro-drakt", "logo"]);
    assert.deepEqual([liste[1].plagg, liste[1].farge, liste[1].bak], ["entrada-tee", "svart", "motiv"]);
    assert.equal(liste[2].bak, "motiv");
    assert.ok(liste.some((x) => x.farge === "hvit"), "hvit tee er med");
    assert.ok(liste.filter((x) => x.navn).length <= 2);
  }
  assert.ok(farger.has("entrada-tee:hvit"));
  assert.ok(plagg.size >= 13, "alle plaggene dukker opp over mange trekk");
});

test("kolGyldig avviser det designeren ikke tillater", () => {
  const ok = { plagg: "entrada-tee", farge: "svart", gruppe: "Klatring", front: "ntnui", bak: "motiv", navn: "" };
  assert.ok(k(`kolGyldig(${JSON.stringify(ok)})`));
  for (const avvik of [
    { gruppe: "Badminton", bak: "motiv" },          // gruppa har ikke motiv
    { gruppe: "Styrkesport", front: "tekst" },      // ingen tekst foran uten motiv
    { plagg: "tiro-shorts", bak: "motiv" },         // shorts har ikke ryggtrykk
    { plagg: "tiro-shorts", bak: "logo" },          // shorts har ikke ryggtrykk
    { plagg: "tiro-drakt", farge: "hvit" },         // hvit finnes bare på Entrada-tee
    { plagg: "tiro-shorts", bak: "ingen", navn: "X" }, // navn bare på plagg med navnfelt
  ]) assert.ok(!k(`kolGyldig(${JSON.stringify({ ...ok, ...avvik })})`), JSON.stringify(avvik));
});

test("kolLenke gir parametrene designeren leser", () => {
  const url = new URL("http://x/" + k(`kolLenke(${JSON.stringify({ plagg: "entrada-tee", farge: "hvit", gruppe: "Turn & Calisthenics", front: "tekst", bak: "motiv", navn: "DITT NAVN" })})`));
  assert.equal(url.pathname, "/designer.html");
  assert.deepEqual(Object.fromEntries(url.searchParams), { plagg: "entrada-tee", gruppe: "Turn & Calisthenics", farge: "hvit", front: "tekst", bak: "motiv", navn: "DITT NAVN" });
  const bukse = new URL("http://x/" + k(`kolLenke(${JSON.stringify({ plagg: "tiro-shorts", farge: "svart", gruppe: "Golf", front: "ntnui", bak: "ingen", navn: "" })})`));
  assert.equal(bukse.searchParams.has("bak"), false);
});

// ---------- Dra-logikken med en falsk skinne ----------

function falskSkinne() {
  const lyttere = {};
  const klasser = new Set();
  return {
    scrollLeft: 500, lyttere, klasser,
    classList: { add: (c) => klasser.add(c), remove: (c) => klasser.delete(c) },
    addEventListener: (n, f) => { lyttere[n] = f; },
    setPointerCapture() {}, releasePointerCapture() {},
  };
}
const mus = (x, utvid = {}) => ({ pointerType: "mouse", button: 0, pointerId: 1, clientX: x, ...utvid });
function klikk() {
  const e = { stopp: false, forhindret: false, preventDefault() { this.forhindret = true; }, stopPropagation() { this.stopp = true; } };
  return e;
}

test("under terskelen er det et klikk, over er det et drag som ikke åpner kortet", () => {
  assert.equal(k("DRA_TERSKEL"), 6);
  assert.equal(k("erDrag(6)"), false);
  assert.equal(k("erDrag(-6)"), false);
  assert.equal(k("erDrag(7)"), true);
  assert.equal(k("erDrag(-7)"), true);

  // 5 px: ingenting skjer, klikket slipper gjennom
  let s = falskSkinne();
  ctx.s = s;
  k("lagDraing(s, { redusertBevegelse: true })");
  s.lyttere.pointerdown(mus(300));
  s.lyttere.pointermove(mus(295));
  s.lyttere.pointerup(mus(295));
  let c = klikk();
  s.lyttere.click(c);
  assert.equal(s.scrollLeft, 500);
  assert.equal(s.klasser.has("dras"), false);
  assert.equal(c.forhindret, false);

  // 40 px mot venstre: skinna følger (scrollLeft øker), og klikket blir slukt
  s = falskSkinne(); ctx.s = s;
  k("lagDraing(s, { redusertBevegelse: true })");
  s.lyttere.pointerdown(mus(300));
  s.lyttere.pointermove(mus(280));
  assert.equal(s.klasser.has("dras"), true);
  s.lyttere.pointermove(mus(260));
  assert.equal(s.scrollLeft, 540);
  s.lyttere.pointerup(mus(260));
  assert.equal(s.klasser.has("dras"), false, "uten inertia slås snap på igjen med en gang");
  c = klikk();
  s.lyttere.click(c);
  assert.ok(c.forhindret && c.stopp);
  // Neste klikk, uten drag, er vanlig
  c = klikk();
  s.lyttere.click(c);
  assert.equal(c.forhindret, false);
});

test("touch og høyreklikk ignoreres, og inertia ruller videre etter slipp", async () => {
  let s = falskSkinne(); ctx.s = s;
  k("lagDraing(s, { redusertBevegelse: false })");
  s.lyttere.pointerdown({ pointerType: "touch", button: 0, pointerId: 2, clientX: 300 });
  s.lyttere.pointermove({ pointerType: "touch", pointerId: 2, clientX: 100 });
  assert.equal(s.scrollLeft, 500);
  s.lyttere.pointerdown(mus(300, { button: 2 }));
  s.lyttere.pointermove(mus(100));
  assert.equal(s.scrollLeft, 500);

  // Rask sveip, sluppet med en gang: skinna fortsetter litt og stopper så
  s = falskSkinne(); ctx.s = s;
  k("lagDraing(s, { redusertBevegelse: false })");
  s.lyttere.pointerdown(mus(600));
  for (let x = 590; x >= 400; x -= 10) { await new Promise((r) => setTimeout(r, 8)); s.lyttere.pointermove(mus(x)); }
  s.lyttere.pointerup(mus(400));
  const ved = s.scrollLeft;
  await new Promise((r) => setTimeout(r, 120));
  assert.ok(s.scrollLeft > ved, "inertia flytter skinna videre i dra-retningen");
  await new Promise((r) => setTimeout(r, 2500));
  assert.equal(s.klasser.has("dras"), false, "snap slås på igjen når farten er død");
});

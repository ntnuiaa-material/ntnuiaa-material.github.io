// Kjøres med: node --test api/test   (ingen avhengigheter)
import test from "node:test";
import assert from "node:assert/strict";
import { _test } from "../src/shop.js";
import { readFileSync } from "node:fs";
import { PLAGG, GRUPPER, TRYKKSONER, motivMaal } from "../src/katalog.js";

class Brukerfeil extends Error {
  constructor(melding, status = 400) { super(melding); this.status = status; }
}

// Minimal D1-etterligning med to tabeller i minnet
function falskDb({ puljer, bestillinger }) {
  const kall = [];
  const stmt = (sql) => ({
    sql, args: [],
    bind(...a) { this.args = a; return this; },
    async first() { return puljer.find((p) => p.id === this.args[0]) ?? null; },
  });
  return {
    kall, puljer, bestillinger,
    prepare: stmt,
    async batch(s) {
      kall.push(s.map((x) => x.sql));
      for (const x of s) {
        if (x.sql.startsWith("UPDATE shop_bestillinger")) {
          for (const b of bestillinger) if (b.pulje_id === x.args[0] && b.status === "pulje") { b.status = "ny"; b.pulje_id = null; }
        } else if (x.sql.startsWith("DELETE FROM shop_puljer")) {
          const i = puljer.findIndex((p) => p.id === x.args[0]);
          if (i >= 0) puljer.splice(i, 1);
        }
      }
    },
  };
}

test("løs opp pulje: sletter pulja og gjør bestillingene nye", async () => {
  const DB = falskDb({
    puljer: [{ id: 1, navn: "A", sendt: null }, { id: 2, navn: "B", sendt: null }],
    bestillinger: [{ id: 1, status: "pulje", pulje_id: 1 }, { id: 2, status: "pulje", pulje_id: 2 }],
  });
  assert.deepEqual(await _test.losOppPulje({ DB }, { id: 1 }, Brukerfeil), { ok: true });
  assert.equal(DB.kall.length, 1, "én batch");
  assert.deepEqual(DB.puljer.map((p) => p.id), [2]);
  assert.deepEqual(DB.bestillinger[0], { id: 1, status: "ny", pulje_id: null });
  assert.equal(DB.bestillinger[1].pulje_id, 2);
});

test("løs opp pulje: 404 når pulja mangler, 409 når den er sendt", async () => {
  const DB = falskDb({ puljer: [{ id: 1, navn: "A", sendt: "2026-10-01 10:00:00" }], bestillinger: [] });
  await assert.rejects(() => _test.losOppPulje({ DB }, { id: 9 }, Brukerfeil), (e) => e.status === 404);
  await assert.rejects(() => _test.losOppPulje({ DB }, { id: 1 }, Brukerfeil), (e) => e.status === 409);
  assert.equal(DB.puljer.length, 1);
});

// ---------- Trykksoner i cm ----------

test("trykksoner: samme fysiske bredde på alle plagg, med mindre plagget avviker", () => {
  for (const p of PLAGG) {
    for (const [navn, z] of Object.entries(TRYKKSONER)) {
      const s = p.soner[navn];
      if (!s) continue;
      const mal = p.mal[z.side];
      const b = (p.sonerCm && p.sonerCm[navn] && p.sonerCm[navn].b) || z.b;
      const cm = s.b * (mal.cm / mal.bredde);
      assert.ok(Math.abs(cm - b) < 0.3, `${p.id}.${navn}: ${cm.toFixed(2)} cm, ventet ${b}`);
    }
  }
});

test("trykksoner: Tiro jersey og Entrada TEE får samme plassering bak (foran følger adidas-logoen)", () => {
  const f = (id) => PLAGG.find((p) => p.id === id).soner;
  for (const sone of ["logo", "navn"]) assert.deepEqual(f("tiro-drakt")[sone], f("entrada-tee")[sone]);
});

test("trykksoner: NTNUI-logoen foran står på høyde med adidas-logoen og speilvendt om midtlinja", () => {
  const medAdidas = PLAGG.filter((p) => p.mal.front && p.mal.front.adidas);
  assert.ok(medAdidas.length >= 12, "alle overdeler og lange bukser har adidas-logo i malen");
  for (const p of medAdidas) {
    const { hals, adidas } = p.mal.front;
    const mal = p.mal.front, cmPerProsent = mal.cm / mal.bredde;
    for (const sone of ["bryst", "tekst"]) {
      const s = p.soner[sone];
      if (!s) continue;
      const nudge = ((p.sonerCm && p.sonerCm[sone] && p.sonerCm[sone].speilDx) || 0) / cmPerProsent;
      assert.ok(Math.abs(s.y - adidas.y) <= 0.06, `${p.id}.${sone}: y ${s.y}, adidas ${adidas.y}`);
      assert.ok(Math.abs(s.x - (2 * hals.x - adidas.x + nudge)) <= 0.06, `${p.id}.${sone}: x ${s.x}, speilet ${2 * hals.x - adidas.x}`);
    }
  }
  // shortsene har ingen adidas-logo i malen og beholder håndplasseringen
  for (const id of ["tiro-shorts", "entrada-short"]) assert.equal(PLAGG.find((p) => p.id === id).mal.front.adidas, undefined);
});

test("trykksoner: rotasjonen fra sonerCm følger med til sona", () => {
  const sh = PLAGG.find((p) => p.id === "tiro-shorts");
  assert.equal(sh.soner.bryst.rot, sh.sonerCm.bryst.rot);
  assert.ok(sh.soner.bryst.rot > 0 && sh.soner.bryst.rot < 10);
  assert.equal(PLAGG.find((p) => p.id === "tiro-drakt").soner.bryst.rot, undefined);
});

test("Entrada26 jersey: herre JZ2505 og dame JZ2492, 150 kr og samme soner som Entrada TEE", () => {
  const j = PLAGG.find((p) => p.id === "entrada-jersey");
  assert.deepEqual(j.kjonn, ["herre", "dame"]);
  assert.equal(j.artikler["svart:herre"], "JZ2505");
  assert.equal(j.artikler["svart:dame"], "JZ2492");
  assert.deepEqual(j.storrelser.dame, ["2XS", "XS", "S", "M", "L", "XL", "2XL"]);
  assert.deepEqual(j.info.passform, { herre: "Slim", dame: "Regular" });
  assert.equal(j.pris, Math.round(j.katalogpris * 0.75 / 5) * 5);
  assert.equal(j.pris, 150);
  assert.deepEqual(j.soner, PLAGG.find((p) => p.id === "entrada-tee").soner);
});

test("trykksoner: alle soner ligger innenfor lerretet", () => {
  for (const p of PLAGG) for (const [navn, s] of Object.entries(p.soner)) {
    assert.ok(s.x - s.b / 2 >= 0 && s.x + s.b / 2 <= 100, `${p.id}.${navn} går utenfor sidene`);
    assert.ok(s.y > 0 && s.y < 100, `${p.id}.${navn} går utenfor toppen/bunnen`);
  }
});

test("motiv: motivAspekt stemmer med viewBox i begge SVG-ene, og viewBox er beskåret til motivet", () => {
  for (const g of GRUPPER.filter((x) => x.motiv)) {
    for (const f of ["hvit", "sort"]) {
      const svg = readFileSync(new URL(`../../docs/shop/img/motiv/${g.slug}-${f}.svg`, import.meta.url), "utf8");
      const [, , , w, h] = svg.match(/viewBox="([-\d.]+) ([-\d.]+) ([\d.]+) ([\d.]+)"/).map(Number);
      assert.ok(Math.abs(w / h / g.motivAspekt - 1) < 0.01, `${g.slug}-${f}: aspekt ${(w / h).toFixed(3)}, katalogen sier ${g.motivAspekt}`);
    }
  }
});

test("motiv: bredde 0,9 × logoen, høyden fra motivAspekt, og høyden kappes ved motivbredden", () => {
  const z = TRYKKSONER.motiv;
  const kappet = [];
  for (const g of GRUPPER.filter((x) => x.motiv)) {
    const m = motivMaal(z, g.motivAspekt);
    assert.ok(m.b <= z.b + 0.01 && m.h <= z.h + 0.01, `${g.slug}: ${m.b} x ${m.h} cm er utenfor boksen`);
    assert.ok(Math.abs(m.b / m.h / g.motivAspekt - 1) < 0.01, `${g.slug}: proporsjonene er endret`);
    if (m.b < z.b - 0.05) kappet.push(g.slug); else assert.equal(m.b, z.b, `${g.slug}: skal ha full motivbredde`);
  }
  // Bare de som er litt høyere enn brede
  assert.deepEqual(kappet.sort(), ["handball", "padel"]);
  assert.equal(motivMaal(z, GRUPPER.find((x) => x.slug === "klatring").motivAspekt).b, z.b);
});

test("motiv bak finnes på alle overdeler, og gruppenavn foran på alle plagg", () => {
  for (const p of PLAGG) {
    assert.ok(p.front.includes("tekst"), `${p.id}: mangler gruppenavn foran`);
    if (p.sider.includes("bak")) assert.deepEqual(p.bak, ["motiv", "logo", "ingen"], `${p.id}: bak`);
  }
  // API-et godtar kombinasjonene
  const { sjekkLinje } = _test;
  const lagLinje = (plagg, vis) => ({ plagg, farge: "svart", kjonn: "herre", storrelse: "M", gruppe: "Fotball", front: "ntnui", bak: "ingen", navn: "", antall: 1, ...vis });
  assert.equal(sjekkLinje(lagLinje("tiro-drakt", { bak: "motiv", navn: "ola" }), Brukerfeil).stykkpris, 225 + 165);
  assert.equal(sjekkLinje(lagLinje("tiro-regnjakke", { bak: "motiv", front: "tekst" }), Brukerfeil).stykkpris, 1160 + 165);
  assert.equal(sjekkLinje(lagLinje("tiro-treningsbukse", { front: "tekst" }), Brukerfeil).stykkpris, 450 + 30);
  assert.throws(() => sjekkLinje(lagLinje("tiro-shorts", { front: "tekst", gruppe: "Badminton" }), Brukerfeil), /motiv/);
});

test("motiv bak: 0,9 × logobredden, og baktekst, motiv, ESTD og navn har luft", () => {
  for (const p of PLAGG.filter((x) => x.bak.includes("motiv"))) {
    const logo = { ...TRYKKSONER.logo, ...(p.sonerCm && p.sonerCm.logo) };
    const z = { ...TRYKKSONER.motiv, ...(p.sonerCm && p.sonerCm.motiv) };
    assert.ok(Math.abs(z.b - 0.9 * logo.b) < 0.06, `${p.id}: motivet skal være 0,9 × logobredden (${z.b} mot ${logo.b})`);
    for (const g of GRUPPER.filter((x) => x.motiv)) {
      const m = motivMaal(z, g.motivAspekt);
      assert.ok(m.h <= z.h + 0.01 && m.b <= z.b + 0.01, `${p.id}/${g.slug}: utenfor boksen`);
      if (g.motivAspekt >= 1) assert.equal(m.b, z.b, `${p.id}/${g.slug}: ikke full motivbredde`);
    }
    // Loddrett rekkefølge i prosent av lerretshøyden: baktekst, motivboksen (høyde = motivbredden), ESTD, navn.
    // 4 cm luft over og under motivboksen, og minst 3 cm mellom ESTD og navnet
    const s = p.soner;
    const cm = (prosent) => prosent / 0.9 * (p.mal.bak.cm / p.mal.bak.bredde);
    const bakH = s.baktekst.b / 8.33 * 0.9, estdH = s.estd.b / 6.5 * 0.9;
    assert.ok(cm((s.motiv.y - s.motiv.h / 2) - (s.baktekst.y + bakH / 2)) >= 3.9, `${p.id}: baktekst treffer motivet`);
    assert.ok(cm(s.estd.y - estdH / 2 - (s.motiv.y + s.motiv.h / 2)) >= 3.9, `${p.id}: motivet treffer ESTD`);
    assert.ok(cm(s.navn.y - s.navn.h / 2 - (s.estd.y + estdH / 2)) >= 2.9, `${p.id}: ESTD treffer navnet`);
    assert.ok(s.baktekst.y - bakH / 2 > p.mal.bak.hals.y, `${p.id}: baktekst over halsen/hetta`);
  }
  assert.equal(PLAGG.find((x) => x.id === "entrada-tee").sonerCm.baktekst.dy, 17.5);
});

test("gruppenavn foran på bukser og shorts ligger på samme sted som NTNUI-logoen, men er bredere", () => {
  for (const id of ["entrada-short", "tiro-shorts", "tiro-treningsbukse", "tiro-sweat-pant"]) {
    const p = PLAGG.find((x) => x.id === id);
    assert.deepEqual([p.soner.tekst.x, p.soner.tekst.y, p.soner.tekst.rot], [p.soner.bryst.x, p.soner.bryst.y, p.soner.bryst.rot], id);
    assert.ok(p.soner.tekst.b > p.soner.bryst.b && p.soner.tekst.b < 15 / (p.mal.front.cm / p.mal.front.bredde) , id);
  }
});

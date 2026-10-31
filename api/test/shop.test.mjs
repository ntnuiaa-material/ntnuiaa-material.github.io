// Kjøres med: node --test api/test   (ingen avhengigheter)
import test from "node:test";
import assert from "node:assert/strict";
import { _test } from "../src/shop.js";
import { PLAGG, TRYKKSONER } from "../src/katalog.js";

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

test("trykksoner: Tiro jersey og Entrada TEE får samme plassering", () => {
  const f = (id) => PLAGG.find((p) => p.id === id).soner;
  for (const sone of ["bryst", "tekst", "logo", "navn"]) assert.deepEqual(f("tiro-drakt")[sone], f("entrada-tee")[sone]);
});

test("trykksoner: alle soner ligger innenfor lerretet", () => {
  for (const p of PLAGG) for (const [navn, s] of Object.entries(p.soner)) {
    assert.ok(s.x - s.b / 2 >= 0 && s.x + s.b / 2 <= 100, `${p.id}.${navn} går utenfor sidene`);
    assert.ok(s.y > 0 && s.y < 100, `${p.id}.${navn} går utenfor toppen/bunnen`);
  }
});

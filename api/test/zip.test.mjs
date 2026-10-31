// Tester ZIP-skriveren til shop-admin (docs/shop/admin/zip.js). Kjøres med: node --test api/test
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";

const { lagZipBytes, crc32 } = createRequire(import.meta.url)("../../docs/shop/admin/zip.js");
const enc = new TextEncoder();
const dec = new TextDecoder();

const filer = [
  { navn: "bestillingsark.csv", data: "﻿Nr;Navn\r\nNTNUI-1007;Åse Ødegård\r\n" },
  { navn: "NTNUI-1007/forhandsvisning.png", data: new Uint8Array(randomBytes(70000)) },
  { navn: "NTNUI-1007/tom.txt", data: new Uint8Array(0) },
  { navn: "NTNUI-1008/trykk-bak-æøå.svg", data: "<svg/>" },
];
const bytes = Buffer.concat(lagZipBytes(filer).map((d) => Buffer.from(d)));

test("crc32 gir kjent verdi", () => {
  assert.equal(crc32(enc.encode("123456789")), 0xcbf43926);
});

test("zip: sentralkatalogen stemmer med filene, og UTF-8-flagget er satt", () => {
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.length);
  const eocd = bytes.length - 22;
  assert.equal(v.getUint32(eocd, true), 0x06054b50);
  assert.equal(v.getUint16(eocd + 10, true), filer.length);
  let p = v.getUint32(eocd + 16, true);
  for (const f of filer) {
    assert.equal(v.getUint32(p, true), 0x02014b50);
    assert.equal(v.getUint16(p + 8, true) & 0x0800, 0x0800, "bit 11");
    assert.equal(v.getUint16(p + 10, true), 0, "store");
    const lengde = v.getUint32(p + 24, true);
    const nl = v.getUint16(p + 28, true);
    const lokal = v.getUint32(p + 42, true);
    assert.equal(dec.decode(bytes.subarray(p + 46, p + 46 + nl)), f.navn);
    const data = typeof f.data === "string" ? enc.encode(f.data) : f.data;
    assert.equal(lengde, data.length);
    assert.equal(v.getUint32(p + 16, true), crc32(data));
    // Lokal hode peker på samme data
    const ln = v.getUint16(lokal + 26, true);
    const start = lokal + 30 + ln;
    assert.deepEqual(new Uint8Array(bytes.subarray(start, start + lengde)), new Uint8Array(data));
    p += 46 + nl;
  }
});

test("zip: unzip -t godtar fila", { skip: spawnSync("unzip", ["-v"]).error ? "unzip finnes ikke" : false }, () => {
  const mappe = mkdtempSync(join(tmpdir(), "zip-"));
  try {
    writeFileSync(join(mappe, "t.zip"), bytes);
    const r = spawnSync("unzip", ["-t", join(mappe, "t.zip")], { encoding: "utf8" });
    assert.equal(r.status, 0, r.stdout + r.stderr);
  } finally { rmSync(mappe, { recursive: true }); }
});

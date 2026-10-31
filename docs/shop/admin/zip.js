// Minimal ZIP-skriver uten avhengigheter: "store" (ingen komprimering), CRC32 og UTF-8-filnavn
// (bit 11), så æøå i mappe- og filnavn blir riktige. Holder til under 65 535 filer og 4 GB, som er
// mer enn nok til en pulje. I nettleseren: lagZip(filer) gir en Blob. I node: require("./zip.js").
//
// filer: [{ navn: "mappe/fil.txt", data: Uint8Array | string, dato?: Date }]

const CRC_TABELL = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes, start = 0) {
  let c = ~start >>> 0;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABELL[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return ~c >>> 0;
}

// MS-DOS-dato og -tid: to 16-bits ord. Året regnes fra 1980 og sekundene i to-sekunders steg.
function dosTid(d) {
  const ar = Math.max(d.getFullYear(), 1980);
  return {
    tid: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1),
    dato: ((ar - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
  };
}

function lagZipBytes(filer) {
  const enc = new TextEncoder();
  const deler = [];
  const katalog = [];
  let forskyvning = 0;
  const legg = (bytes) => { deler.push(bytes); forskyvning += bytes.length; };

  for (const f of filer) {
    const navn = enc.encode(f.navn);
    const data = typeof f.data === "string" ? enc.encode(f.data) : f.data;
    const { tid, dato } = dosTid(f.dato || new Date());
    const crc = crc32(data);
    const start = forskyvning;

    // Lokal filhode (30 byte) + navn
    const lokal = new DataView(new ArrayBuffer(30));
    lokal.setUint32(0, 0x04034b50, true);
    lokal.setUint16(4, 20, true);      // versjon som trengs
    lokal.setUint16(6, 0x0800, true);  // bit 11: filnavnet er UTF-8
    lokal.setUint16(8, 0, true);       // metode 0 = store
    lokal.setUint16(10, tid, true);
    lokal.setUint16(12, dato, true);
    lokal.setUint32(14, crc, true);
    lokal.setUint32(18, data.length, true);
    lokal.setUint32(22, data.length, true);
    lokal.setUint16(26, navn.length, true);
    lokal.setUint16(28, 0, true);
    legg(new Uint8Array(lokal.buffer));
    legg(navn);
    legg(data);
    katalog.push({ navn, crc, storrelse: data.length, tid, dato, start });
  }

  // Sentralkatalogen (46 byte per fil + navn), så slutten (22 byte)
  const katalogStart = forskyvning;
  for (const k of katalog) {
    const v = new DataView(new ArrayBuffer(46));
    v.setUint32(0, 0x02014b50, true);
    v.setUint16(4, 20, true);          // laget av
    v.setUint16(6, 20, true);          // versjon som trengs
    v.setUint16(8, 0x0800, true);
    v.setUint16(10, 0, true);
    v.setUint16(12, k.tid, true);
    v.setUint16(14, k.dato, true);
    v.setUint32(16, k.crc, true);
    v.setUint32(20, k.storrelse, true);
    v.setUint32(24, k.storrelse, true);
    v.setUint16(28, k.navn.length, true);
    v.setUint32(42, k.start, true);
    legg(new Uint8Array(v.buffer));
    legg(k.navn);
  }
  const katalogLengde = forskyvning - katalogStart;
  const slutt = new DataView(new ArrayBuffer(22));
  slutt.setUint32(0, 0x06054b50, true);
  slutt.setUint16(8, katalog.length, true);
  slutt.setUint16(10, katalog.length, true);
  slutt.setUint32(12, katalogLengde, true);
  slutt.setUint32(16, katalogStart, true);
  legg(new Uint8Array(slutt.buffer));
  return deler;
}

function lagZip(filer) {
  return new Blob(lagZipBytes(filer), { type: "application/zip" });
}

if (typeof module !== "undefined") module.exports = { lagZip, lagZipBytes, crc32 };

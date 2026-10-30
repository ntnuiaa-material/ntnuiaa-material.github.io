// LAGET AUTOMATISK av verktoy/katalog_til_api.sh fra docs/shop/katalog.js. Ikke rediger her.

// Katalogen – felles for forsiden, designeren og kurven.
// Prisene på plaggene er fra Bestillingsskjema_Nettskjema.md og ikke bekreftet mot avtalen.
// Trykkprisene er Eriks svar 03.09.2026.

// motiv: gruppa har Entrada-filer (tekst foran, tekst bak, ESTD og motiv) som SVG fra PDF-ene
const GRUPPER = [
  { navn: "Badminton", slug: "badminton", motiv: false },
  { navn: "Basketball", slug: "basketball", motiv: true },
  { navn: "Crosstrain", slug: "crosstrain", motiv: true },
  { navn: "Dans", slug: "dans", motiv: true },
  { navn: "Fotball", slug: "fotball", motiv: true },
  { navn: "Futsal Damer", slug: "futsal-damer", motiv: true },
  { navn: "Futsal Herrer", slug: "futsal-herrer", motiv: true },
  { navn: "Golf", slug: "golf", motiv: true },
  { navn: "Håndball", slug: "handball", motiv: true },
  { navn: "Klatring", slug: "klatring", motiv: true },
  { navn: "Løping", slug: "loping", motiv: true },
  { navn: "Padel", slug: "padel", motiv: true },
  { navn: "Seiling", slug: "seiling", motiv: true },
  { navn: "Styrkesport", slug: "styrkesport", motiv: false },
  { navn: "Svømming", slug: "svomming", motiv: true },
  { navn: "Tennis", slug: "tennis", motiv: true },
  { navn: "Turn & Calisthenics", slug: "turn-og-calisthenics", motiv: true },
  { navn: "Volleyball", slug: "volleyball", motiv: true },
];
const GENERISK = "generisk";

const TRYKKPRIS = {
  SPORT: 165,   // logo front + bak + navn
  CASUAL: 110,  // logo front + bak
  BRYST: 30,    // bare NTNUI-logo på brystet
  BOKSTAV: 15,  // egennavn uten ryggtrykk, maks NAVN_MAKS
  NAVN_MAKS: 75,
};

// Plasseringene er i prosent av bildelerretet (900 × 1000). Tiro jersey, Entrada TEE og Entrada shorts
// er regnet ut fra PSD-mockupene. De andre plaggene er generert med Nano Banana 2.1 fra katalogbilder, og
// brystlogoen står speilvendt av adidas-logoen.
// Plaggbildene er laget fra de samme PSD-ene med NTNUI-trykket fjernet (verktoy/ i repoet).
//
// Regel fra Kristian: Climacool og alt som heter JERSEY er svart med hvite dekaler.
// Bare ENTRADA 26 TEE finnes i flere farger, og hvit finnes bare i herremodell.
// Passform, teknologi og materiale: adidas Teamwear 2026 (Nordics), lest 30.10.2026.
// Artikkelnumre og veiledende pris: kolleksjonsarket NTNUI ÅLESUND KOLLEKSJON 26/27 og
// adidas-katalogen. Medlemspris er veiledende pris minus 25 %, avrundet til nærmeste fem.

const HERRE = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
const DAME = ["2XS", "XS", "S", "M", "L", "XL", "2XL"];

const PLAGG = [
  {
    id: "tiro-drakt",
    navn: { nb: "Tiro26 League jersey", en: "Tiro26 League jersey" },
    kategori: "SPORT",
    katalogpris: 299,
    pris: 225,
    farger: {
      svart: { front: "img/plagg/tiro-svart-front.webp", bak: "img/plagg/tiro-svart-bak.webp", prikk: "#111111" },
    },
    artikler: { "svart:herre": "KB1348", "svart:dame": "KB3747" },
    storrelser: { herre: HERRE, dame: DAME },
    stoff: { nb: "Climacool · polyester", en: "Climacool · polyester" },
    info: {
      passform: { herre: "Slim", dame: "Regular" },
      teknologi: "Climacool",
      materiale: { nb: "100 % resirkulert polyester", en: "100% recycled polyester" },
    },
    kjonn: ["herre", "dame"],
    sider: ["front", "bak"],
    front: ["ntnui", "tekst", "ingen"],
    bak: ["logo", "ingen"],
    navnFelt: true,
    soner: {
      bryst: { x: 66.4, y: 26.6, b: 15.1 },
      tekst: { x: 66.4, y: 26.8, b: 19.1 },
      logo: { x: 49.9, y: 35.6, b: 42.6 },
      navn: { x: 49.9, y: 85.8, b: 37.9, h: 3.8 },
    },
  },
  {
    id: "entrada-tee",
    navn: { nb: "Entrada26 T-skjorte", en: "Entrada26 tee" },
    kategori: "CASUAL",
    katalogpris: 299,
    pris: 225,
    farger: {
      svart: { front: "img/plagg/entrada-svart-front.webp", bak: "img/plagg/entrada-svart-bak.webp", prikk: "#111111" },
      hvit: { front: "img/plagg/entrada-hvit-front.webp", bak: "img/plagg/entrada-hvit-bak.webp", prikk: "#f4f4f4", lys: true, kjonn: ["herre"] },
    },
    artikler: { "svart:herre": "JZ6675", "svart:dame": "JZ6682", "hvit:herre": "JZ6679" },
    storrelser: { herre: HERRE, dame: DAME },
    stoff: { nb: "Bomull", en: "Cotton" },
    info: {
      passform: { herre: "Regular", dame: "Regular" },
      materiale: { nb: "100 % bomull (BCI)", en: "100% cotton (BCI)" },
    },
    kjonn: ["herre", "dame"],
    sider: ["front", "bak"],
    front: ["ntnui", "tekst", "ingen"],
    bak: ["motiv", "logo", "ingen"],
    navnFelt: true,
    soner: {
      bryst: { x: 66.4, y: 25.3, b: 15.1 },
      tekst: { x: 66.4, y: 25.5, b: 19.1 },
      logo: { x: 49.9, y: 35.6, b: 42.6 },
      baktekst: { x: 50, y: 16.8, b: 49.1 },
      motiv: { x: 50, y: 38.9, b: 38.5, h: 24.7 },
      estd: { x: 49.9, y: 60.2, b: 15 },
      navn: { x: 49.9, y: 85.8, b: 37.9, h: 3.8 },
    },
  },
  {
    // Står ikke på kolleksjonsarket fra Intersport. Medlemsprisen er regnet ut, ikke bekreftet.
    id: "entrada-short",
    navn: { nb: "Entrada26 shorts", en: "Entrada26 shorts" },
    kategori: "SHORTS",
    katalogpris: 199,
    pris: 150,
    farger: {
      svart: { front: "img/plagg/entrada-short-svart-front.webp", prikk: "#111111" },
    },
    artikler: { "svart:herre": "JZ2521", "svart:dame": "JZ2533" },
    storrelser: { herre: HERRE, dame: DAME },
    stoff: { nb: "Climacool · polyester", en: "Climacool · polyester" },
    info: {
      passform: { herre: "Regular", dame: "Regular" },
      teknologi: "Climacool",
      materiale: { nb: "100 % resirkulert polyester", en: "100% recycled polyester" },
    },
    kjonn: ["herre", "dame"],
    sider: ["front"],
    front: ["ntnui", "ingen"],
    bak: [],
    navnFelt: false,
    soner: {
      bryst: { x: 23, y: 62, b: 17 }, // nede på venstre lår, som Kristian markerte 30.10
    },
  },
  {
    // Bare herremodell. Hvit (JZ6579, herre) finnes, men har ikke bilde ennå. Bildet er generert med Nano Banana 2.1
    id: "entrada-hoody",
    navn: { nb: "Entrada26 hoody", en: "Entrada26 hoodie" },
    kategori: "CASUAL",
    katalogpris: 549,
    pris: 410,
    farger: {
      svart: { front: "img/plagg/entrada-hoody-svart-front.webp", bak: "img/plagg/entrada-hoody-svart-bak.webp", prikk: "#111111" },
    },
    artikler: { "svart:herre": "JZ6577" },
    storrelser: { herre: HERRE },
    stoff: { nb: "Bomull og polyester", en: "Cotton and polyester" },
    info: {
      passform: { herre: "Regular" },
      materiale: { nb: "70 % bomull (BCI) / 30 % resirkulert polyester", en: "70% cotton (BCI) / 30% recycled polyester" },
    },
    kjonn: ["herre"],
    sider: ["front", "bak"],
    front: ["ntnui", "tekst", "ingen"],
    bak: ["motiv", "logo", "ingen"],
    navnFelt: true,
    soner: {
      bryst: { x: 62.4, y: 42.6, b: 13 },
      tekst: { x: 62.4, y: 42.6, b: 17 },
      logo: { x: 50, y: 50, b: 38 },
      navn: { x: 50, y: 82, b: 36, h: 3.4 },
      baktekst: { x: 50, y: 33, b: 44 },
      motiv: { x: 50, y: 50, b: 34, h: 22 },
      estd: { x: 50, y: 66, b: 13 },
    },
  },
  {
    id: "entrada-sweat-top",
    navn: { nb: "Entrada26 sweat top", en: "Entrada26 sweat top" },
    kategori: "CASUAL",
    katalogpris: 549,
    pris: 410,
    farger: {
      svart: { front: "img/plagg/entrada-sweat-top-svart-front.webp", bak: "img/plagg/entrada-sweat-top-svart-bak.webp", prikk: "#111111" },
    },
    artikler: { "svart:herre": "JZ6573", "svart:dame": "KB3951" },
    storrelser: { herre: HERRE, dame: DAME },
    stoff: { nb: "Bomull og polyester", en: "Cotton and polyester" },
    info: {
      passform: { herre: "Regular" },
      materiale: { nb: "70 % bomull (BCI) / 30 % resirkulert polyester", en: "70% cotton (BCI) / 30% recycled polyester" },
    },
    kjonn: ["herre", "dame"],
    sider: ["front", "bak"],
    front: ["ntnui", "tekst", "ingen"],
    bak: ["motiv", "logo", "ingen"],
    navnFelt: true,
    soner: {
      bryst: { x: 66.6, y: 23.6, b: 13 },
      tekst: { x: 66.6, y: 23.6, b: 17 },
      logo: { x: 50, y: 39, b: 38 },
      navn: { x: 50, y: 80, b: 36, h: 3.4 },
      baktekst: { x: 50, y: 17, b: 44 },
      motiv: { x: 50, y: 39, b: 34, h: 22 },
      estd: { x: 50, y: 60, b: 13 },
    },
  },
  {
    id: "tiro-sweat-crew",
    navn: { nb: "Tiro26 League sweat crew", en: "Tiro26 League sweat crew" },
    kategori: "SPORT",
    katalogpris: 649,
    pris: 485,
    farger: {
      svart: { front: "img/plagg/tiro-sweat-crew-svart-front.webp", bak: "img/plagg/tiro-sweat-crew-svart-bak.webp", prikk: "#111111" },
    },
    artikler: { "svart:herre": "KF3413" },
    storrelser: { herre: HERRE },
    stoff: { nb: "Bomull og polyester", en: "Cotton and polyester" },
    info: {
      passform: { herre: "Regular" },
      materiale: { nb: "70 % bomull (BCI) / 30 % resirkulert polyester", en: "70% cotton (BCI) / 30% recycled polyester" },
    },
    kjonn: ["herre"],
    sider: ["front", "bak"],
    front: ["ntnui", "tekst", "ingen"],
    bak: ["logo", "ingen"],
    navnFelt: true,
    soner: {
      bryst: { x: 65.9, y: 24.2, b: 13 },
      tekst: { x: 65.9, y: 24.2, b: 17 },
      logo: { x: 50, y: 36, b: 38 },
      navn: { x: 50, y: 80, b: 36, h: 3.4 },
    },
  },
  {
    id: "tiro-full-zip",
    navn: { nb: "Tiro26 League full zip hoodie", en: "Tiro26 League full zip hoodie" },
    kategori: "SPORT",
    katalogpris: 699,
    pris: 525,
    farger: {
      svart: { front: "img/plagg/tiro-full-zip-svart-front.webp", bak: "img/plagg/tiro-full-zip-svart-bak.webp", prikk: "#111111" },
    },
    artikler: { "svart:herre": "KF3321", "svart:dame": "KF3326" },
    storrelser: { herre: HERRE, dame: DAME },
    stoff: { nb: "Bomull og polyester", en: "Cotton and polyester" },
    info: {
      passform: { herre: "Regular" },
      materiale: { nb: "70 % bomull (BCI) / 30 % resirkulert polyester", en: "70% cotton (BCI) / 30% recycled polyester" },
    },
    kjonn: ["herre", "dame"],
    sider: ["front", "bak"],
    front: ["ntnui", "tekst", "ingen"],
    bak: ["logo", "ingen"],
    navnFelt: true,
    soner: {
      bryst: { x: 61.8, y: 43.5, b: 13 },
      tekst: { x: 61.8, y: 43.5, b: 17 },
      logo: { x: 50, y: 47, b: 38 },
      navn: { x: 50, y: 82, b: 36, h: 3.4 },
    },
  },
  {
    id: "tiro-treningsjakke",
    navn: { nb: "Tiro26 League treningsjakke", en: "Tiro26 League training jacket" },
    kategori: "SPORT",
    katalogpris: 599,
    pris: 450,
    farger: {
      svart: { front: "img/plagg/tiro-treningsjakke-svart-front.webp", bak: "img/plagg/tiro-treningsjakke-svart-bak.webp", prikk: "#111111" },
    },
    artikler: { "svart:herre": "JY7207", "svart:dame": "JY7109" },
    storrelser: { herre: HERRE, dame: DAME },
    stoff: { nb: "Climacool · polyester", en: "Climacool · polyester" },
    info: {
      passform: { herre: "Slim" },
      teknologi: "Climacool",
      materiale: { nb: "100 % resirkulert polyester", en: "100% recycled polyester" },
    },
    kjonn: ["herre", "dame"],
    sider: ["front", "bak"],
    front: ["ntnui", "tekst", "ingen"],
    bak: ["logo", "ingen"],
    navnFelt: true,
    soner: {
      bryst: { x: 64.4, y: 26.6, b: 13 },
      tekst: { x: 64.4, y: 26.6, b: 17 },
      logo: { x: 50, y: 37, b: 38 },
      navn: { x: 50, y: 80, b: 36, h: 3.4 },
    },
  },
  {
    id: "tiro-windbreaker",
    navn: { nb: "Tiro26 League windbreaker", en: "Tiro26 League windbreaker" },
    kategori: "SPORT",
    katalogpris: 699,
    pris: 525,
    farger: {
      svart: { front: "img/plagg/tiro-windbreaker-svart-front.webp", bak: "img/plagg/tiro-windbreaker-svart-bak.webp", prikk: "#111111" },
    },
    artikler: { "svart:herre": "JY9733", "svart:dame": "JY9668" },
    storrelser: { herre: HERRE, dame: DAME },
    stoff: { nb: "Clima365 · polyester", en: "Clima365 · polyester" },
    info: {
      passform: { herre: "Regular" },
      teknologi: "Clima365",
      materiale: { nb: "100 % resirkulert polyester", en: "100% recycled polyester" },
    },
    kjonn: ["herre", "dame"],
    sider: ["front", "bak"],
    front: ["ntnui", "tekst", "ingen"],
    bak: ["logo", "ingen"],
    navnFelt: true,
    soner: {
      bryst: { x: 62.7, y: 33, b: 13 },
      tekst: { x: 62.7, y: 33, b: 17 },
      logo: { x: 50, y: 44, b: 38 },
      navn: { x: 50, y: 80, b: 36, h: 3.4 },
    },
  },
  {
    id: "tiro-regnjakke",
    navn: { nb: "Tiro26 League regnjakke", en: "Tiro26 League rain jacket" },
    kategori: "SPORT",
    katalogpris: 1549,
    pris: 1160,
    farger: {
      svart: { front: "img/plagg/tiro-regnjakke-svart-front.webp", bak: "img/plagg/tiro-regnjakke-svart-bak.webp", prikk: "#111111" },
    },
    artikler: { "svart:herre": "JJ2969" },
    storrelser: { herre: HERRE },
    stoff: { nb: "Clima365 · polyester", en: "Clima365 · polyester" },
    info: {
      passform: { herre: "Regular" },
      teknologi: "Clima365",
      materiale: { nb: "100 % resirkulert polyester", en: "100% recycled polyester" },
    },
    kjonn: ["herre"],
    sider: ["front", "bak"],
    front: ["ntnui", "tekst", "ingen"],
    bak: ["logo", "ingen"],
    navnFelt: true,
    soner: {
      bryst: { x: 63.9, y: 31.4, b: 13 },
      tekst: { x: 63.9, y: 31.4, b: 17 },
      logo: { x: 50, y: 42, b: 38 },
      navn: { x: 50, y: 78, b: 36, h: 3.4 },
    },
  },
  {
    id: "tiro-shorts",
    navn: { nb: "Tiro26 League treningsshorts", en: "Tiro26 League training shorts" },
    kategori: "TRENING",
    katalogpris: 299,
    pris: 225,
    farger: {
      svart: { front: "img/plagg/tiro-shorts-svart-front.webp", prikk: "#111111" },
    },
    artikler: { "svart:herre": "JY9719", "svart:dame": "KA8807" },
    storrelser: { herre: HERRE, dame: DAME },
    stoff: { nb: "Climacool · polyester", en: "Climacool · polyester" },
    info: {
      passform: { herre: "Regular" },
      teknologi: "Climacool",
      materiale: { nb: "100 % resirkulert polyester", en: "100% recycled polyester" },
    },
    kjonn: ["herre", "dame"],
    sider: ["front"],
    front: ["ntnui", "ingen"],
    bak: [],
    navnFelt: false,
    soner: {
      bryst: { x: 22, y: 78, b: 15 },
    },
  },
  {
    id: "tiro-treningsbukse",
    navn: { nb: "Tiro26 League treningsbukse", en: "Tiro26 League training pants" },
    kategori: "TRENING",
    katalogpris: 599,
    pris: 450,
    farger: {
      svart: { front: "img/plagg/tiro-treningsbukse-svart-front.webp", prikk: "#111111" },
    },
    artikler: { "svart:herre": "JY7230", "svart:dame": "JY7178" },
    storrelser: { herre: HERRE, dame: DAME },
    stoff: { nb: "Climacool · polyester", en: "Climacool · polyester" },
    info: {
      passform: { herre: "Regular" },
      teknologi: "Climacool",
      materiale: { nb: "100 % resirkulert polyester", en: "100% recycled polyester" },
    },
    kjonn: ["herre", "dame"],
    sider: ["front"],
    front: ["ntnui", "ingen"],
    bak: [],
    navnFelt: false,
    soner: {
      bryst: { x: 35, y: 27, b: 8 },
    },
  },
  {
    id: "tiro-sweat-pant",
    navn: { nb: "Tiro26 League sweat pants", en: "Tiro26 League sweat pants" },
    kategori: "TRENING",
    katalogpris: 699,
    pris: 525,
    farger: {
      svart: { front: "img/plagg/tiro-sweat-pant-svart-front.webp", prikk: "#111111" },
    },
    artikler: { "svart:herre": "JY7154", "svart:dame": "JY7156" },
    storrelser: { herre: HERRE, dame: DAME },
    stoff: { nb: "Bomull og polyester", en: "Cotton and polyester" },
    info: {
      passform: { herre: "Regular" },
      materiale: { nb: "70 % bomull (BCI) / 30 % resirkulert polyester", en: "70% cotton (BCI) / 30% recycled polyester" },
    },
    kjonn: ["herre", "dame"],
    sider: ["front"],
    front: ["ntnui", "ingen"],
    bak: [],
    navnFelt: false,
    soner: {
      bryst: { x: 34, y: 30, b: 8 },
    },
  },
];

// plagg: åpner designeren med dette plagget. Uten plagg er kortet bare et bilde.
const KOLLEKSJON = [
  { bilde: "img/kolleksjon/sport-svart.webp", plagg: "tiro-drakt", tittel: { nb: "Tiro26 League jersey", en: "Tiro26 League jersey" }, gruppe: "Klatring" },
  { bilde: "img/kolleksjon/casual-svart.webp", plagg: "entrada-tee", tittel: { nb: "Entrada26 T-skjorte · Svart", en: "Entrada26 tee · Black" }, gruppe: "Klatring" },
  { bilde: "img/kolleksjon/casual-hvit.webp", plagg: "entrada-tee", tittel: { nb: "Entrada26 T-skjorte · Hvit", en: "Entrada26 tee · White" }, gruppe: "Volleyball" },
  { bilde: "img/kolleksjon/hoody.webp", plagg: "entrada-hoody", tittel: { nb: "Entrada26 hoody", en: "Entrada26 hoodie" }, gruppe: "Klatring" },
  { bilde: "img/kolleksjon/sweat-top.webp", plagg: "entrada-sweat-top", tittel: { nb: "Entrada26 sweat top", en: "Entrada26 sweat top" }, gruppe: "Klatring" },
  { bilde: "img/kolleksjon/sweat-crew.webp", plagg: "tiro-sweat-crew", tittel: { nb: "Tiro26 sweat crew", en: "Tiro26 sweat crew" }, gruppe: "Klatring" },
  { bilde: "img/kolleksjon/full-zip.webp", plagg: "tiro-full-zip", tittel: { nb: "Tiro26 full zip hoodie", en: "Tiro26 full zip hoodie" }, gruppe: "Klatring" },
  { bilde: "img/kolleksjon/treningsjakke.webp", plagg: "tiro-treningsjakke", tittel: { nb: "Tiro26 treningsjakke", en: "Tiro26 training jacket" }, gruppe: "Klatring" },
  { bilde: "img/kolleksjon/windbreaker.webp", plagg: "tiro-windbreaker", tittel: { nb: "Tiro26 windbreaker", en: "Tiro26 windbreaker" }, gruppe: "Klatring" },
];

function finnPlagg(id) {
  return PLAGG.find((p) => p.id === id);
}
function finnGruppe(navn) {
  return GRUPPER.find((g) => g.navn === navn);
}

// Prisen for én konfigurasjon, med hvert ledd for seg
// Fargene som finnes for et snitt (hvit TEE finnes bare i herre)
function fargerFor(p, kjonn) {
  return Object.keys(p.farger).filter((f) => !kjonn || !p.farger[f].kjonn || p.farger[f].kjonn.includes(kjonn));
}

function prisFor(k) {
  const p = finnPlagg(k.plagg);
  if (!p) return { plagg: 0, trykk: 0, navn: 0, sum: 0 };
  const harBak = k.bak && k.bak !== "ingen";
  const harFront = k.front && k.front !== "ingen";
  let trykk = 0;
  if (harBak) trykk = TRYKKPRIS[p.kategori];
  else if (harFront) trykk = TRYKKPRIS.BRYST;
  const bokstaver = (k.navn || "").replace(/\s/g, "").length;
  // Navnet er med i SPORT-prisen når ryggen har trykk
  const navn = bokstaver && !(harBak && p.kategori === "SPORT")
    ? Math.min(bokstaver * TRYKKPRIS.BOKSTAV, TRYKKPRIS.NAVN_MAKS)
    : 0;
  return { plagg: p.pris, trykk, navn, sum: p.pris + trykk + navn };
}

export { PLAGG, GRUPPER, GENERISK, TRYKKPRIS, prisFor, finnPlagg, finnGruppe, fargerFor };

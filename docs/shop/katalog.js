// Katalogen – felles for forsiden, designeren og kurven.
// Prisene på plaggene er fra Bestillingsskjema_Nettskjema.md og ikke bekreftet mot avtalen.
// Trykkprisene er Eriks svar 03.09.2026.

// motiv: gruppa har Entrada-filer (tekst foran, tekst bak, ESTD og motiv) som SVG fra PDF-ene
// motivAspekt: bredde / høyde på motivfila (viewBox, beskåret til selve motivet). Må stemme med img/motiv/<slug>-*.svg
//   (api/test sjekker det). Brukes av motivMaal() for å regne ut hvor stort motivet trykkes.
// vektor: gruppelogoen finnes som SVG med kurver i img/logo/trykk/<slug>.svg (brukes som trykkfil bak).
//   Uten vektor blir WebP-en på siden (560×560) lagt i ZIP-en, og admin merker den «kun rasterfil».
const GRUPPER = [
  { navn: "Badminton", slug: "badminton", motiv: false, vektor: true },
  { navn: "Basketball", slug: "basketball", motiv: true, motivAspekt: 1.042, vektor: true },
  { navn: "Crosstrain", slug: "crosstrain", motiv: true, motivAspekt: 1.164, vektor: true },
  { navn: "Dans", slug: "dans", motiv: true, motivAspekt: 1.19, vektor: true },
  { navn: "Fotball", slug: "fotball", motiv: true, motivAspekt: 1.042, vektor: true },
  { navn: "Futsal Damer", slug: "futsal-damer", motiv: true, motivAspekt: 1.211, vektor: true },
  { navn: "Futsal Herrer", slug: "futsal-herrer", motiv: true, motivAspekt: 1.19, vektor: true },
  { navn: "Golf", slug: "golf", motiv: true, motivAspekt: 1.405, vektor: true },
  { navn: "Håndball", slug: "handball", motiv: true, motivAspekt: 0.998, vektor: true },
  { navn: "Klatring", slug: "klatring", motiv: true, motivAspekt: 1.407, vektor: true },
  { navn: "Løping", slug: "loping", motiv: true, motivAspekt: 1.305, vektor: true },
  { navn: "Padel", slug: "padel", motiv: true, motivAspekt: 0.989, vektor: true },
  { navn: "Seiling", slug: "seiling", motiv: true, motivAspekt: 1.369, vektor: true },
  { navn: "Styrkesport", slug: "styrkesport", motiv: false, vektor: true },
  { navn: "Svømming", slug: "svomming", motiv: true, motivAspekt: 1.0, vektor: true },
  { navn: "Tennis", slug: "tennis", motiv: true, motivAspekt: 1.15, vektor: true },
  { navn: "Turn & Calisthenics", slug: "turn-og-calisthenics", motiv: true, motivAspekt: 1.228, vektor: true },
  { navn: "Volleyball", slug: "volleyball", motiv: true, motivAspekt: 1.022, vektor: true },
];
const GENERISK = "generisk";

const TRYKKPRIS = {
  SPORT: 165,   // logo front + bak + navn
  CASUAL: 110,  // logo front + bak
  BRYST: 30,    // bare NTNUI-logo på brystet
  BOKSTAV: 15,  // egennavn uten ryggtrykk, maks NAVN_MAKS
  NAVN_MAKS: 75,
};

// Trykket plasseres i cm, ikke i prosent: TRYKKSONER under er den ene tabellen, og hvert plagg har
// `mal` (målt på bildene) som gjør cm om til prosent av bildelerretet (900 × 1000). Da får trykket samme
// fysiske størrelse og plass på alle plagg, selv om mockupene fyller lerretet ulikt.
// Mockupene er PSD-er (Tiro jersey, Entrada TEE og Tiro shorts) og bilder generert med Nano Banana 2.1.
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
    bak: ["motiv", "logo", "ingen"],
    navnFelt: true,
    mal: {
      front: { hals: { x: 50.8, y: 0.3 }, bredde: 58.1, cm: 54, adidas: { x: 34.4, y: 26.7 } },
      bak: { hals: { x: 49.7, y: 0.3 }, bredde: 55.2, cm: 54 },
    },
    // Teksten er bredere enn logoen og tok i det hvite skulderfeltet når den ble speilet, så den er flyttet 2 cm mot midten
    sonerCm: { tekst: { speilDx: -2 } },
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
    mal: {
      front: { hals: { x: 50.8, y: 0.3 }, bredde: 58.1, cm: 54, adidas: { x: 33.9, y: 25.4 } },
      bak: { hals: { x: 49.7, y: 0.3 }, bredde: 55.2, cm: 54 },
    },
  },
  {
    // Samme plagg som Entrada26 T-skjorte i bildene (svart med hvite detaljer), så bildene og målene er delt.
    // Herre (JZ2505) og dame (JZ2492, Regular). Ungdomsmodellen JZ2524 selges ikke. 199 × 0,75 = 149,25, rundet til 150.
    id: "entrada-jersey",
    navn: { nb: "Entrada26 jersey", en: "Entrada26 jersey" },
    kategori: "CASUAL",
    katalogpris: 199,
    pris: 150,
    farger: {
      svart: { front: "img/plagg/entrada-svart-front.webp", bak: "img/plagg/entrada-svart-bak.webp", prikk: "#111111" },
    },
    artikler: { "svart:herre": "JZ2505", "svart:dame": "JZ2492" },
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
    bak: ["motiv", "logo", "ingen"],
    navnFelt: true,
    mal: {
      front: { hals: { x: 50.8, y: 0.3 }, bredde: 58.1, cm: 54, adidas: { x: 33.9, y: 25.4 } },
      bak: { hals: { x: 49.7, y: 0.3 }, bredde: 55.2, cm: 54 },
    },
  },
  {
    // Står ikke på kolleksjonsarket fra Intersport. Medlemsprisen er regnet ut, ikke bekreftet.
    // Bildene er generert med Nano Banana 2.1 fra Tiro-shortsen (uten striper), 31.10.2026, og passer i samme
    // plaggboks som Tiro-bildene. Derfor er `mal` og trykksonene de samme som på tiro-shorts. Baksidebildet
    // er klart, men vises først når `sider` og `bak` åpner for ryggtrykk (Tiro-shortsen har ikke det).
    id: "entrada-short",
    navn: { nb: "Entrada26 shorts", en: "Entrada26 shorts" },
    kategori: "SHORTS",
    katalogpris: 199,
    pris: 150,
    farger: {
      svart: { front: "img/plagg/entrada-short-svart-front.webp?v=20261031", bak: "img/plagg/entrada-short-svart-bak.webp?v=20261031", prikk: "#111111" },
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
    front: ["ntnui", "tekst", "ingen"],
    bak: [],
    navnFelt: false,
    // Midjen er målestokken (flat bredde i bånd, antatt 40 cm), halsen er øverst midt på linningen
    mal: {
      front: { hals: { x: 49.7, y: 1.2 }, bredde: 67.4, cm: 40 },
    },
    // Som tiro-shorts: nede på venstre lår, rett over fallet, rotert etter fallet (samme omriss)
    sonerCm: {
      bryst: { b: 10, dx: -16.5, dy: 54.5, rot: 3.5 },
      tekst: { b: 12, dx: -16.5, dy: 54.5, rot: 3.5 }, // gruppenavnet på samme sted som logoen, litt bredere
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
    mal: {
      front: { hals: { x: 50.2, y: 28.3 }, bredde: 40.6, cm: 60, adidas: { x: 38.3, y: 42.1 } },
      bak: { hals: { x: 50.0, y: 27.5 }, bredde: 44.4, cm: 60, bunn: 99.8, rygg: 51 },
    },
    sonerCm: { navn: { dy: 82.0 } }, // samme høyde som før cm-målene (nær nedre kant)
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
    mal: {
      front: { hals: { x: 49.9, y: 2.2 }, bredde: 54.1, cm: 60, adidas: { x: 34.4, y: 22.9 } },
      bak: { hals: { x: 49.8, y: 0.8 }, bredde: 54.4, cm: 60, bunn: 99.5 },
    },
    sonerCm: { navn: { dy: 97.0 } }, // samme høyde som før cm-målene (nær nedre kant)
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
    bak: ["motiv", "logo", "ingen"],
    navnFelt: true,
    mal: {
      front: { hals: { x: 50.0, y: 2.5 }, bredde: 53.8, cm: 60, adidas: { x: 34.8, y: 23.4 } },
      bak: { hals: { x: 50.0, y: 1.0 }, bredde: 55.1, cm: 60, bunn: 99.7 },
    },
    sonerCm: { navn: { dy: 95.5 } }, // samme høyde som før cm-målene (nær nedre kant)
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
    bak: ["motiv", "logo", "ingen"],
    navnFelt: true,
    mal: {
      front: { hals: { x: 50.4, y: 28.3 }, bredde: 43.6, cm: 60, adidas: { x: 38.8, y: 42.9 } },
      bak: { hals: { x: 49.7, y: 28.8 }, bredde: 44.8, cm: 60, bunn: 99.7, rygg: 51 },
    },
    sonerCm: { navn: { dy: 79.0 } }, // samme høyde som før cm-målene (nær nedre kant)
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
    bak: ["motiv", "logo", "ingen"],
    navnFelt: true,
    mal: {
      front: { hals: { x: 50.0, y: 9.0 }, bredde: 50.7, cm: 56, adidas: { x: 36.3, y: 25.9 } },
      bak: { hals: { x: 50.0, y: 6.2 }, bredde: 50.7, cm: 56, bunn: 99.8 },
    },
    sonerCm: { navn: { dy: 90.5 } }, // samme høyde som før cm-målene (nær nedre kant)
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
    bak: ["motiv", "logo", "ingen"],
    navnFelt: true,
    mal: {
      front: { hals: { x: 50.1, y: 14.8 }, bredde: 47.6, cm: 60, adidas: { x: 37.4, y: 32.5 } },
      bak: { hals: { x: 50.0, y: 25.5 }, bredde: 48.9, cm: 60, bunn: 99.8, rygg: 51, tekstMaks: 42.5 },
    },
    sonerCm: { navn: { dy: 74.5 } }, // samme høyde som før cm-målene (nær nedre kant)
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
    bak: ["motiv", "logo", "ingen"],
    navnFelt: true,
    mal: {
      front: { hals: { x: 50.2, y: 11.5 }, bredde: 47.8, cm: 60, adidas: { x: 36.8, y: 30.7 } },
      bak: { hals: { x: 50.0, y: 24.5 }, bredde: 47.3, cm: 60, bunn: 99.8, rygg: 51, tekstMaks: 42.5 },
    },
    sonerCm: { navn: { dy: 75.5 } }, // samme høyde som før cm-målene (nær nedre kant)
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
    front: ["ntnui", "tekst", "ingen"],
    bak: [],
    navnFelt: false,
    // Midjen er målestokken (flat bredde i bånd, antatt 40 cm), halsen er øverst midt på linningen
    mal: {
      front: { hals: { x: 49.7, y: 1.2 }, bredde: 67.4, cm: 40 },
    },
    // Nede på venstre lår, rett over fallet. Trykket er rotert 3,5° med klokka, så det følger fallet på benet
    // (kanten stiger ca. 3,3° mot venstre i bildet, målt 31.10.2026)
    sonerCm: {
      bryst: { b: 10, dx: -16.5, dy: 54.5, rot: 3.5 },
      tekst: { b: 12, dx: -16.5, dy: 54.5, rot: 3.5 }, // gruppenavnet på samme sted som logoen, litt bredere
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
    front: ["ntnui", "tekst", "ingen"],
    bak: [],
    navnFelt: false,
    // Midjen er målestokken (flat bredde i bånd, antatt 40 cm), halsen er øverst midt på linningen
    mal: {
      front: { hals: { x: 49.6, y: 1.2 }, bredde: 33.7, cm: 40, adidas: { x: 60.9, y: 30.9 } },
    },
    // bredden; speilet om adidas-logoen, 2 cm lenger ut mot sida. Gruppenavnet har samme plass, litt bredere
    sonerCm: { bryst: { b: 10, speilDx: -2 }, tekst: { b: 12, speilDx: -2 } },
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
    front: ["ntnui", "tekst", "ingen"],
    bak: [],
    navnFelt: false,
    // Midjen er målestokken (flat bredde i bånd, antatt 40 cm), halsen er øverst midt på linningen
    mal: {
      front: { hals: { x: 49.9, y: 1.2 }, bredde: 36.8, cm: 40, adidas: { x: 65.1, y: 30.1 } },
    },
    // bredden; plasseringen følger adidas-logoen på det andre låret. Gruppenavnet har samme plass, litt bredere
    sonerCm: { bryst: { b: 10 }, tekst: { b: 12 } },
  },
];

// ---------- Trykksoner i cm ----------
// Tabellen er avledet av utseendet til Entrada TEE (slik det var før plasseringene ble regnet i cm), med
// bryst til bryst-bredde 54 cm som målestokk. Vil man ha standardmål, er dette utgangspunktet:
// bryst 9 cm bredt (dx 10, topp 17 cm under halsen), baktekst og logo/motiv 26 cm brede, estd 11 cm.
// (Disse er mindre enn utseendet var: baktekst på Entrada TEE tilsvarer ca. 48 cm av 54 cm bryst.)
//
// side:  hvilken side av plagget sonen ligger på (bestemmer hvilken `mal` som brukes)
// b:     bredde i cm (trykkfila skaleres til denne bredden)
// h:     høyde i cm, bare for soner med fast boks (motiv, da som største høyde) og for versalhøyden på navnet
// dx:    cm sideveis fra midtlinja. Positiv er mot høyre i bildet (brukerens venstre side)
// dy:    cm ned fra halsen til midten av trykket. Målt på mockupen med bredden som målestokk, så
//        det er ikke en nøyaktig avstand langs plagget (mockupene er litt strukket i høyden)
// rot:   (valgfri) rotasjon i grader rundt midten av trykket, positiv med klokka. Brukes når trykket skal følge
//        en skråstilt kant på plagget, f.eks. fallet på shortsbenet
// Sonene sentreres på (dx, dy), bortsett fra bryst og tekst på plagg med `mal.front.adidas` (se beregnSoner).
// Et plagg kan avvike med `sonerCm: { sone: { b, dx, dy, rot } }`. For bryst og tekst på plagg med adidas-logo
// kan man i stedet flytte den speilvendte plasseringen sideveis med `speilDx` (cm, positiv mot høyre i bildet),
// f.eks. når teksten ellers ville truffet et hvitt felt.
const TRYKKSONER = {
  bryst: { side: "front", b: 14, dx: 14.5, dy: 26 },
  tekst: { side: "front", b: 18, dx: 14.5, dy: 26 },
  logo: { side: "bak", b: 42, dx: 0, dy: 38.5 },
  // baktekst, motiv og estd er én blokk. Tallene her er Entrada TEE: baktekst 17,5 cm under halsen, 4 cm luft, motivet,
  // 4 cm luft, estd, og navnet nederst. Andre plagg regnes ut av visuellMotiv() med samme andeler
  baktekst: { side: "bak", b: 48, dx: 0, dy: 17.5 },
  // motiv: 0,9 × logoens bredde (b og h er største boks, cm). Høyden følger proporsjonene, men aldri høyere enn h (= b).
  // Se motivMaal() og visuellMotiv()
  motiv: { side: "bak", b: 37.8, h: 37.8, dx: 0, dy: 43.4 },
  estd: { side: "bak", b: 15, dx: 0, dy: 67.4 },
  navn: { side: "bak", b: 37, h: 4, dx: 0, dy: 93 },
};

// Hvor stort et motiv trykkes, i cm: {b, h}. `z` er motivsona (TRYKKSONER.motiv, evt. med plaggets avvik, som er
// 0,9 × logoens bredde) og `aspekt` bredde/høyde på motivfila. Motivet er z.b bredt, så ringen står nesten like stor
// som gruppelogoen på samme plagg. Høyden følger aspektet. Blir motivet høyere enn z.h (høyere enn bredt, i dag
// Padel og Håndball), settes høyden til z.h og bredden krympes litt.
function motivMaal(z, aspekt) {
  let b = z.b;
  let h = b / aspekt;
  if (h > z.h) { h = z.h; b = h * aspekt; }
  return { b: Math.round(b * 10) / 10, h: Math.round(h * 10) / 10 };
}

// Sonene et plagg faktisk bruker, etter hva det kan trykkes på det
function sonePaaPlagg(p, sone) {
  if (sone === "bryst") return p.front.includes("ntnui");
  if (sone === "tekst") return p.front.includes("tekst");
  if (sone === "logo") return p.bak.includes("logo");
  if (sone === "navn") return p.navnFelt;
  return p.bak.includes("motiv"); // baktekst, motiv og estd hører sammen
}

// Gjør cm om til prosent av lerretet for ett plagg. Resultatet har samme form som `soner` hadde:
// x og y er midten av trykket, b og h er bredde og høyde. Sider uten `mal` får ingen soner.
//
// `mal` per side, målt i bildene (ikke på selve plagget):
//   hals:   halsen (x, y i prosent av lerretet): midtlinja i høyde med skulderlinja ved halsen, der
//           kragen (eller hetta) møter skuldrene. På jakker med hette som ligger nede bak er det
//           underkanten av hetta, siden trykket må ligge under den
//   bredde: bryst til bryst (arm til arm), prosent av lerretbredden
//   adidas: (valgfri) midten av den hvite adidas-logoen på brystet (på bukser: det ene låret), prosent av
//           lerretet, målt på bildet (tegnet rundt logoen, ikke fra mockup-malen). NTNUI-logoen foran
//           (bryst og tekst) plasseres på samme høyde og speilvendt om `hals.x`, så den ligger like langt
//           fra midtlinja/glidelåsen på motsatt side. Svart adidas-logo på hvit T-skjorte ligger på samme sted
//   rygg:   (valgfri, bak) synlig ryggbredde i prosent av lerretet når `bredde` er smalere enn det som ser ut som
//           ryggen i bildet (hettejakker: hetta og armene gjør at bildet er skalert ned). Brukes bare av visuellLogo()
//   tekstMaks: (valgfri, bak) største bredde i % av lerretet for «NTNUI ÅLESUND» bak, når de hvite eller grå
//           skulderfeltene begrenser det mørke feltet (windbreaker og regnjakke). Brukes av visuellMotiv()
//   bunn:   (valgfri, bak) y til nederkanten av plagget i prosent av lerretet. Gir ryggtrykket «logo» samme
//           synlige størrelse og plass som på Entrada TEE, se visuellLogo()
//   cm:     bredden i cm på referansestørrelsen (L herre). ANTATT, ikke hentet fra størrelsestabellen:
//           54 cm på T-skjorte og jersey, 56 på treningsjakka, 60 på hettegenser, genser, full zip og
//           regnjakke/windbreaker. På shorts og bukser er det midjen (flat, i bånd) som er målet, 40 cm
// Ryggloggen skal se like stor og stå like høyt på alle overdeler som på Entrada TEE. Der er logoen 42 cm av
// 54 cm bryst, og midten ligger 38,5 cm under halsen. Mockupene av jakker og gensere er både bredere (antatt
// 60 cm) og høyere i bildet enn teen, så samme cm-mål ga en logo som så mindre ut og satt lavere. Derfor regnes
// logoen på plagg med `mal.bak.bunn` ut relativt til selve bildet: samme andel av ryggbredden, og midten på
// samme andel av avstanden fra halsen (underkant av hetta på hettejakker) til nederkanten. Resultatet blir et
// avvik i sonerCm.logo, så designer, forhåndsvisning og ZIP/CSV bruker de samme cm-målene.
const LOGO_ANDEL_BREDDE = 42 / 54; // logobredde / ryggbredde (Entrada TEE)
const LOGO_ANDEL_HOYDE = 0.356;    // (midt - hals) / (bunn - hals); 38,5 cm på Entrada TEE (halsen 0,3 %, bunnen 99,8 %)
function visuellLogo(p) {
  const mal = p.mal && p.mal.bak;
  if (!mal || mal.bunn === undefined || !p.bak.includes("logo") || (p.sonerCm && p.sonerCm.logo)) return;
  const cmPerProsent = mal.cm / mal.bredde;
  const rund = (v) => Math.round(v * 2) / 2; // hele og halve cm
  p.sonerCm = { ...p.sonerCm, logo: {
    b: rund(LOGO_ANDEL_BREDDE * (mal.rygg || mal.bredde) * cmPerProsent),
    dy: rund(LOGO_ANDEL_HOYDE * (mal.bunn - mal.hals.y) * cmPerProsent / 0.9),
  } };
}
for (const p of PLAGG) visuellLogo(p);

// Motivet bak (baktekst, motiv og ESTD) er én blokk som skaleres med ryggbredden. Referansen er Entrada sweat top
// (60 cm rygg, kb = 1,11), som Kristian godkjente: baktekst rett under kragen, blokka fyller øvre rygg. Alle plagg
// med `mal.bak.bunn` får de samme andelene av ryggbredden (kb = ryggbredde i cm / 54, 54 cm på Entrada TEE), så
// blokka er like stor og står like langt under halsen på sweat top, hettegenser og jakker. Bildehøyden brukes ikke:
// den gjorde hettejakkene (der hetta tar toppen av bildet) mindre og lavere. For hettejakker er `hals` underkanten
// av hetta, så baktekst og blokk flyttes ned under hetta og følger ryggen. Fra toppen:
//   baktekst: 17,6 × kb under halsen (19,6 cm på sweat top). På hettejakker (mal.bak.rygg) i stedet rett under hetta,
//             HETTE_LUFT cm under `hals`. Bredden er BAKTEKST_PROSENT av lerretbredden (som på sweat top, ikke av
//             ryggbredden: se under), men høyst mal.bak.tekstMaks der skulderfelt begrenser
//   motiv:    en kvadratisk boks, b = h = MOTIV_ANDEL (0,9) × logo-b, 3,6 × kb cm (4 cm på sweat top) under baktekst
//   estd:     ESTD_PROSENT av lerretbredden, 3,6 × kb cm under boksen
//   navn:     hettejakker: NAVN_LUFT_HETTE (6) cm under ESTD. Andre: der plagget har det (sonerCm.navn.dy), men flyttes
//             ned så det er minst NAVN_LUFT (3) cm til ESTD
// Plagg uten `mal.bak.bunn` (Entrada TEE, jersey og Tiro-drakt) har kb = 1 og bruker tallene fra tabellen
// (baktekst 17,5, luft 4 cm).
const BAKTEKST_ASPEKT = 8.33;      // bredde / høyde på baktekst-SVG-ene (alle like)
const ESTD_ASPEKT = 6.5;           // ca. bredde / høyde på ESTD-SVG-ene (6,5 til 6,8)
const MOTIV_ANDEL = 0.9;           // motivbredde / logobredde
const NAVN_LUFT = 3;               // minste luft mellom ESTD og navnet (cm)
const NAVN_LUFT_HETTE = 6;         // luften mellom ESTD og navnet på hettejakker, der det er god plass
const BAKTEKST_PROSENT = 48.5;     // bredden på baktekst i % av lerretbredden (Entrada sweat top: 53,5 cm)
const ESTD_PROSENT = 15;           // bredden på ESTD i % av lerretbredden (sweat top: 16,5 cm)
const HETTE_LUFT = 5.5;            // cm fra hetta (`hals`) til overkanten av baktekst på hettejakker. Hetta kaster skygge nedover
                                   // ryggen, så det som ser ut som hetteskjøten ligger noen cm under `hals`
function visuellMotiv(p) {
  if (!p.bak.includes("motiv")) return;
  const mal = p.mal && p.mal.bak;
  const rund = (v) => Math.round(v * 10) / 10;
  const medBunn = Boolean(mal && mal.bunn !== undefined);
  const kb = medBunn ? (mal.rygg || mal.bredde) * mal.cm / mal.bredde / 54 : 1;
  const logo = { ...TRYKKSONER.logo, ...(p.sonerCm && p.sonerCm.logo) };
  const navn = { ...TRYKKSONER.navn, ...(p.sonerCm && p.sonerCm.navn) };
  const boks = rund(MOTIV_ANDEL * logo.b);
  // Tekstene (baktekst og ESTD) har samme bredde i prosent av lerretet som på sweat top. Det er det man ser: på
  // hettejakker er plagget mindre i bildet, så de ble for små når de ble regnet av ryggbredden (cm)
  const cmPerProsent = medBunn ? mal.cm / mal.bredde : 54 / 55.2;
  const bakB = medBunn ? Math.round(Math.min(BAKTEKST_PROSENT, mal.tekstMaks || 99) * cmPerProsent * 2) / 2 : TRYKKSONER.baktekst.b;
  const estdB = medBunn ? Math.round(ESTD_PROSENT * cmPerProsent * 2) / 2 : TRYKKSONER.estd.b;
  const bakH = bakB / BAKTEKST_ASPEKT, estdH = estdB / ESTD_ASPEKT;
  const hette = medBunn && Boolean(mal.rygg); // hettejakke: hals er underkanten av hetta midt på ryggen (målt)
  const bakDy = hette ? rund(bakH / 2 + HETTE_LUFT) : medBunn ? rund(17.6 * kb) : TRYKKSONER.baktekst.dy;
  const luft = medBunn ? 3.6 * kb : 4;
  const motivDy = rund(bakDy + bakH / 2 + luft + boks / 2);
  const estdDy = rund(motivDy + boks / 2 + luft + estdH / 2);
  const ny = {
    baktekst: { b: bakB, dy: bakDy },
    motiv: { b: boks, h: boks, dy: motivDy },
    estd: { b: estdB, dy: estdDy },
  };
  p.sonerCm = { ...p.sonerCm };
  for (const [z, v] of Object.entries(ny)) if (!p.sonerCm[z]) p.sonerCm[z] = v;
  // Navnet: på hettejakker rett under ESTD med NAVN_LUFT_HETTE cm luft, ellers flyttes det ned bare om det ikke er
  // plass til NAVN_LUFT mellom ESTD og navnet
  const navnDy = rund(estdDy + estdH / 2 + (hette ? NAVN_LUFT_HETTE : NAVN_LUFT) + navn.h / 2);
  if (hette ? true : navnDy > navn.dy) p.sonerCm.navn = { ...p.sonerCm.navn, dy: navnDy };
}
for (const p of PLAGG) visuellMotiv(p);

function beregnSoner(p) {
  const soner = {};
  for (const [navn, z0] of Object.entries(TRYKKSONER)) {
    const mal = p.mal && p.mal[z0.side];
    if (!mal || !sonePaaPlagg(p, navn)) continue;
    const z = { ...z0, ...(p.sonerCm && p.sonerCm[navn]) };
    const cmPerProsent = mal.cm / mal.bredde; // cm per prosent av lerretbredden (9 px)
    const px = (cm) => cm / cmPerProsent; // lengde i prosent av lerretbredden
    const rund = (v) => Math.round(v * 10) / 10;
    // Brystlogoen (bryst og tekst) står på samme høyde som adidas-logoen og speilet om midtlinja, med
    // mindre plagget har egen dx/dy i sonerCm. Plagg uten `adidas` (shorts) bruker dx og dy fra tabellen.
    const ov = (p.sonerCm && p.sonerCm[navn]) || {};
    const folgerAdidas = (navn === "bryst" || navn === "tekst") && mal.adidas;
    soner[navn] = {
      x: rund(folgerAdidas && ov.dx === undefined ? 2 * mal.hals.x - mal.adidas.x + px(ov.speilDx || 0) : mal.hals.x + px(z.dx)),
      y: rund(folgerAdidas && ov.dy === undefined ? mal.adidas.y : mal.hals.y + px(z.dy) * 0.9), // 1 % av høyden er 10 px, 1 % av bredden 9 px
      b: rund(px(z.b)),
    };
    if (z.h) soner[navn].h = rund(px(z.h) * 0.9);
    if (z.rot) soner[navn].rot = z.rot;
  }
  return soner;
}
for (const p of PLAGG) p.soner = beregnSoner(p);

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

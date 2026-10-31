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

// Trykket plasseres i cm, ikke i prosent: TRYKKSONER under er den ene tabellen, og hvert plagg har
// `mal` (målt på bildene) som gjør cm om til prosent av bildelerretet (900 × 1000). Da får trykket samme
// fysiske størrelse og plass på alle plagg, selv om mockupene fyller lerretet ulikt.
// Mockupene er PSD-er (Tiro jersey, Entrada TEE og shorts) og bilder generert med Nano Banana 2.1.
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
    mal: {
      front: { hals: { x: 50.8, y: 0.3 }, bredde: 58.1, cm: 54 },
      bak: { hals: { x: 49.7, y: 0.3 }, bredde: 55.2, cm: 54 },
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
    mal: {
      front: { hals: { x: 50.8, y: 0.3 }, bredde: 58.1, cm: 54 },
      bak: { hals: { x: 49.7, y: 0.3 }, bredde: 55.2, cm: 54 },
    },
  },
  {
    // Samme plagg som Entrada26 T-skjorte i bildene (svart med hvite detaljer), så bildene og målene er delt.
    // Bare herremodell (JZ2505). Ungdomsmodellen JZ2524 selges ikke. 199 × 0,75 = 149,25, rundet til 150.
    id: "entrada-jersey",
    navn: { nb: "Entrada26 jersey", en: "Entrada26 jersey" },
    kategori: "CASUAL",
    katalogpris: 199,
    pris: 150,
    farger: {
      svart: { front: "img/plagg/entrada-svart-front.webp", bak: "img/plagg/entrada-svart-bak.webp", prikk: "#111111" },
    },
    artikler: { "svart:herre": "JZ2505" },
    storrelser: { herre: HERRE },
    stoff: { nb: "Climacool · polyester", en: "Climacool · polyester" },
    info: {
      passform: { herre: "Slim" },
      teknologi: "Climacool",
      materiale: { nb: "100 % resirkulert polyester", en: "100% recycled polyester" },
    },
    kjonn: ["herre"],
    sider: ["front", "bak"],
    front: ["ntnui", "tekst", "ingen"],
    bak: ["motiv", "logo", "ingen"],
    navnFelt: true,
    mal: {
      front: { hals: { x: 50.8, y: 0.3 }, bredde: 58.1, cm: 54 },
      bak: { hals: { x: 49.7, y: 0.3 }, bredde: 55.2, cm: 54 },
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
    // Midjen er målestokken (flat bredde i bånd, antatt 40 cm), halsen er øverst midt på linningen
    mal: {
      front: { hals: { x: 48.4, y: 1.2 }, bredde: 61.7, cm: 40 },
    },
    sonerCm: { bryst: { b: 10, dx: -16.5, dy: 43.8 } }, // nede på venstre lår, som Kristian markerte 30.10
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
      front: { hals: { x: 50.2, y: 28.3 }, bredde: 40.6, cm: 60 },
      bak: { hals: { x: 50.0, y: 27.5 }, bredde: 44.4, cm: 60 },
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
      front: { hals: { x: 49.9, y: 2.2 }, bredde: 54.1, cm: 60 },
      bak: { hals: { x: 49.8, y: 0.8 }, bredde: 54.4, cm: 60 },
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
    bak: ["logo", "ingen"],
    navnFelt: true,
    mal: {
      front: { hals: { x: 50.0, y: 2.5 }, bredde: 53.8, cm: 60 },
      bak: { hals: { x: 50.0, y: 1.0 }, bredde: 55.1, cm: 60 },
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
    bak: ["logo", "ingen"],
    navnFelt: true,
    mal: {
      front: { hals: { x: 50.4, y: 28.3 }, bredde: 43.6, cm: 60 },
      bak: { hals: { x: 49.7, y: 28.8 }, bredde: 44.8, cm: 60 },
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
    bak: ["logo", "ingen"],
    navnFelt: true,
    mal: {
      front: { hals: { x: 50.0, y: 9.0 }, bredde: 50.7, cm: 56 },
      bak: { hals: { x: 50.0, y: 6.2 }, bredde: 50.7, cm: 56 },
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
    bak: ["logo", "ingen"],
    navnFelt: true,
    mal: {
      front: { hals: { x: 50.1, y: 14.8 }, bredde: 47.6, cm: 60 },
      bak: { hals: { x: 50.0, y: 25.5 }, bredde: 48.9, cm: 60 },
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
    bak: ["logo", "ingen"],
    navnFelt: true,
    mal: {
      front: { hals: { x: 50.2, y: 11.5 }, bredde: 47.8, cm: 60 },
      bak: { hals: { x: 50.0, y: 24.5 }, bredde: 47.3, cm: 60 },
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
    front: ["ntnui", "ingen"],
    bak: [],
    navnFelt: false,
    // Midjen er målestokken (flat bredde i bånd, antatt 40 cm), halsen er øverst midt på linningen
    mal: {
      front: { hals: { x: 49.7, y: 1.2 }, bredde: 67.4, cm: 40 },
    },
    // Nede på venstre lår, rett over fallet. Trykket er rotert 3,5° med klokka, så det følger fallet på benet
    // (kanten stiger ca. 3,3° mot venstre i bildet, målt 31.10.2026)
    sonerCm: { bryst: { b: 10, dx: -16.5, dy: 54.5, rot: 3.5 } },
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
    // Midjen er målestokken (flat bredde i bånd, antatt 40 cm), halsen er øverst midt på linningen
    mal: {
      front: { hals: { x: 49.6, y: 1.2 }, bredde: 33.7, cm: 40 },
    },
    sonerCm: { bryst: { b: 10, dx: -17.5, dy: 34 } }, // nede på låret
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
    // Midjen er målestokken (flat bredde i bånd, antatt 40 cm), halsen er øverst midt på linningen
    mal: {
      front: { hals: { x: 49.9, y: 1.2 }, bredde: 36.8, cm: 40 },
    },
    sonerCm: { bryst: { b: 10, dx: -17.5, dy: 35 } }, // nede på låret
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
// h:     høyde i cm, bare for soner med fast boks (motiv) og for versalhøyden på navnet
// dx:    cm sideveis fra midtlinja. Positiv er mot høyre i bildet (brukerens venstre side)
// dy:    cm ned fra halsen til midten av trykket. Målt på mockupen med bredden som målestokk, så
//        det er ikke en nøyaktig avstand langs plagget (mockupene er litt strukket i høyden)
// rot:   (valgfri) rotasjon i grader rundt midten av trykket, positiv med klokka. Brukes når trykket skal følge
//        en skråstilt kant på plagget, f.eks. fallet på shortsbenet
// Sonene sentreres på (dx, dy). Et plagg kan avvike med `sonerCm: { sone: { b, dx, dy, rot } }`.
const TRYKKSONER = {
  bryst: { side: "front", b: 14, dx: 14.5, dy: 26 },
  tekst: { side: "front", b: 18, dx: 14.5, dy: 26 },
  logo: { side: "bak", b: 42, dx: 0, dy: 38.5 },
  baktekst: { side: "bak", b: 48, dx: 0, dy: 18 },
  motiv: { side: "bak", b: 38, h: 27, dx: 0, dy: 42 },
  estd: { side: "bak", b: 15, dx: 0, dy: 65 },
  navn: { side: "bak", b: 37, h: 4, dx: 0, dy: 93 },
};

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
//   cm:     bredden i cm på referansestørrelsen (L herre). ANTATT, ikke hentet fra størrelsestabellen:
//           54 cm på T-skjorte og jersey, 56 på treningsjakka, 60 på hettegenser, genser, full zip og
//           regnjakke/windbreaker. På shorts og bukser er det midjen (flat, i bånd) som er målet, 40 cm
function beregnSoner(p) {
  const soner = {};
  for (const [navn, z0] of Object.entries(TRYKKSONER)) {
    const mal = p.mal && p.mal[z0.side];
    if (!mal || !sonePaaPlagg(p, navn)) continue;
    const z = { ...z0, ...(p.sonerCm && p.sonerCm[navn]) };
    const cmPerProsent = mal.cm / mal.bredde; // cm per prosent av lerretbredden (9 px)
    const px = (cm) => cm / cmPerProsent; // lengde i prosent av lerretbredden
    const rund = (v) => Math.round(v * 10) / 10;
    soner[navn] = {
      x: rund(mal.hals.x + px(z.dx)),
      y: rund(mal.hals.y + px(z.dy) * 0.9), // 1 % av høyden er 10 px, 1 % av bredden 9 px
      b: rund(px(z.b)),
    };
    if (z.h) soner[navn].h = rund(px(z.h) * 0.9);
    if (z.rot) soner[navn].rot = z.rot;
  }
  return soner;
}
for (const p of PLAGG) p.soner = beregnSoner(p);

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

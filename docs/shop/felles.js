// Felles for forsiden og designeren: tekster, tema, språk, kurv, skjema og kvittering.
// Krever katalog.js. Bestillingen sendes til lager-API-et (api/src/shop.js), som regner ut
// prisen på nytt og lagrer den.

const API = ["localhost", "127.0.0.1"].includes(location.hostname)
  ? "http://127.0.0.1:8788"
  : "https://lager-api.ntnuiaa.workers.dev";
const EPOST_MONSTER = /^[^\s@]+@stud\.ntnu\.no$/i;

// Landkoder for telefon: [ISO-kode, norsk navn, engelsk navn, retningsnummer]
const LAND = [
  ["no", "Norge", "Norway", "47"], ["se", "Sverige", "Sweden", "46"], ["dk", "Danmark", "Denmark", "45"],
  ["fi", "Finland", "Finland", "358"], ["is", "Island", "Iceland", "354"], ["de", "Tyskland", "Germany", "49"],
  ["nl", "Nederland", "Netherlands", "31"], ["be", "Belgia", "Belgium", "32"], ["fr", "Frankrike", "France", "33"],
  ["es", "Spania", "Spain", "34"], ["pt", "Portugal", "Portugal", "351"], ["it", "Italia", "Italy", "39"],
  ["ch", "Sveits", "Switzerland", "41"], ["at", "Østerrike", "Austria", "43"], ["gb", "Storbritannia", "United Kingdom", "44"],
  ["ie", "Irland", "Ireland", "353"], ["pl", "Polen", "Poland", "48"], ["cz", "Tsjekkia", "Czechia", "420"],
  ["sk", "Slovakia", "Slovakia", "421"], ["hu", "Ungarn", "Hungary", "36"], ["ro", "Romania", "Romania", "40"],
  ["bg", "Bulgaria", "Bulgaria", "359"], ["gr", "Hellas", "Greece", "30"], ["hr", "Kroatia", "Croatia", "385"],
  ["si", "Slovenia", "Slovenia", "386"], ["rs", "Serbia", "Serbia", "381"], ["ua", "Ukraina", "Ukraine", "380"],
  ["lt", "Litauen", "Lithuania", "370"], ["lv", "Latvia", "Latvia", "371"], ["ee", "Estland", "Estonia", "372"],
  ["tr", "Tyrkia", "Türkiye", "90"], ["us", "USA", "United States", "1"], ["ca", "Canada", "Canada", "1"],
  ["br", "Brasil", "Brazil", "55"], ["mx", "Mexico", "Mexico", "52"], ["in", "India", "India", "91"],
  ["pk", "Pakistan", "Pakistan", "92"], ["bd", "Bangladesh", "Bangladesh", "880"], ["np", "Nepal", "Nepal", "977"],
  ["cn", "Kina", "China", "86"], ["jp", "Japan", "Japan", "81"], ["kr", "Sør-Korea", "South Korea", "82"],
  ["vn", "Vietnam", "Vietnam", "84"], ["ph", "Filippinene", "Philippines", "63"], ["id", "Indonesia", "Indonesia", "62"],
  ["ir", "Iran", "Iran", "98"], ["sy", "Syria", "Syria", "963"], ["eg", "Egypt", "Egypt", "20"],
  ["et", "Etiopia", "Ethiopia", "251"], ["er", "Eritrea", "Eritrea", "291"], ["so", "Somalia", "Somalia", "252"],
  ["ng", "Nigeria", "Nigeria", "234"], ["ke", "Kenya", "Kenya", "254"], ["za", "Sør-Afrika", "South Africa", "27"],
  ["au", "Australia", "Australia", "61"], ["nz", "New Zealand", "New Zealand", "64"],
];

const TEKST = {
  nb: {
    "nav.tittel": "Bestilling",
    "nav.tema": "Bytt mellom mørkt og lyst",
    "nav.kurv": "Kurv",
    "nav.hjem": "Kolleksjonen",
    "nav.designer": "Designeren",
    "helt.tittel1": "Klær for",
    "helt.tittel2": "hele NTNUI",
    "helt.serif": "fra gymsalen til fjelltoppen.",
    "helt.ingress": "Sett sammen plagget ditt i designeren, legg det i kurven og send bestillingen. Du betaler først når du henter hos Intersport Rongve.",
    "helt.slagord": "klær for hele NTNUI Ålesund",
    "helt.samarbeid": "i samarbeid med",
    "helt.cta": "Ta meg til designeren",
    "helt.cta2": "Se kolleksjonen",
    "slik.tittel": "Slik funker det",
    "slik.antall": "03 steg",
    "slik.1t": "Design plagget",
    "slik.1": "Velg plagg, gruppe, hva som skal stå foran og bak, og størrelse.",
    "slik.2t": "Send bestillingen",
    "slik.2": "Navn, telefon og stud-e-post. Du får ordrenummer med en gang.",
    "slik.3t": "Hent og betal",
    "slik.3": "Vi samler bestillingene og sender dem til Intersport Rongve. Du betaler i butikken.",
    "kol.tittel": "Kolleksjonen",
    "kol.ingress": "Et utvalg av hvordan plaggene kan se ut. Trykk på et plagg for å lage din egen versjon.",
    "kol.cta": "Design din egen",
    "kol.kommer": "Kommer i designeren",
    "kol.forrige": "Forrige plagg",
    "kol.neste": "Neste plagg",
    "band.tittel": "Lag ditt eget plagg",
    "band.tekst": "Velg gruppe, logo foran, motiv bak og navn på ryggen. Du ser resultatet med en gang.",
    "band.cta": "Ta meg til designeren",
    "bunn.betaling": "Betaling",
    "bunn.betalingtekst": "Ingen betaling her. Du betaler når du henter hos Intersport Rongve, Høgvollveien 8.",
    "bunn.kontakt": "Kontakt",
    "bunn.personvern": "Personvern",
    "bunn.personverntekst": "Navn, telefon og e-post brukes bare til bestillingen og slettes etter levering.",
    "bunn.kode": "Feil på siden?",
    "bunn.kodetekst": "Koden ligger åpent på GitHub. Meld fra om feil eller kom med forslag under Issues.",
    "des.tittel": "Designeren",
    "des.front": "Front",
    "des.bak": "Rygg",
    "des.plagg": "Plagg",
    "des.farge": "Farge",
    "des.gruppe": "Gruppe",
    "des.frontvalg": "Foran",
    "des.bakvalg": "Bak",
    "des.navn": "Navn på ryggen",
    "des.navnhjelp": "Maks 12 tegn",
    "des.kjonn": "Snitt",
    "des.storrelse": "Størrelse",
    "des.prisplagg": "Plagg",
    "des.pristrykk": "Trykk",
    "des.prisnavn": "Navn",
    "des.leggtil": "Legg i kurven",
    "des.lagre": "Lagre endringen",
    "des.info": "Om plagget",
    "des.kun": "bare",
    "des.velgsnitt": "Velg snitt først",
    "info.artikkel": "Artikkelnr.",
    "info.passform": "Passform",
    "info.teknologi": "Teknologi",
    "info.materiale": "Materiale",
    "info.storrelser": "Størrelser",
    "kurv.tittel": "Kurven",
    "kurv.lukk": "Lukk",
    "kurv.tom": "Kurven er tom. Lag noe i designeren.",
    "kurv.total": "Totalt",
    "kurv.merknad": "Betales ved henting hos Intersport Rongve. Ingen betaling her.",
    "kurv.videre": "Videre til bestilling",
    "kurv.tilbake": "← Tilbake til kurven",
    "skjema.navn": "Navn",
    "skjema.telefon": "Telefon",
    "skjema.land": "Landkode",
    "skjema.landsok": "Søk etter land",
    landIngen: "Fant ingen land",
    "skjema.epost": "Stud-e-post",
    "skjema.kommentar": "Kommentar (valgfritt)",
    "skjema.samtykke": "Jeg forstår at bestillingen er bindende, og at jeg betaler når jeg henter.",
    "skjema.send": "Send bestilling",
    "sendt.tittel": "Bestillingen er sendt",
    "sendt.ferdig": "Tilbake til butikken",
    // Brukes fra skriptene
    generisk: "Generisk NTNUI",
    "front.ntnui": "NTNUI-logo",
    "front.tekst": "Gruppenavn",
    "front.ingen": "Ingenting",
    "bak.logo": "Gruppelogo",
    "bak.motiv": "Motiv",
    "bak.ingen": "Ingenting",
    herre: "Herre",
    dame: "Dame",
    svart: "Svart", hvit: "Hvit", gronn: "Grønn", marine: "Marine", rod: "Rød", bla: "Blå", gra: "Grå", gul: "Gul",
    foran: "foran",
    bak: "bak",
    lagtTil: "lagt i kurven",
    fjern: "Fjern",
    endre: "Endre",
    endret: "Endringen er lagret",
    mindre: "Færre",
    flere: "Flere",
    mangler: "Velg snitt og størrelse først",
    feilNavn: "Skriv fullt navn",
    feilTelefon: "Skriv et norsk mobilnummer med 8 siffer",
    feilTelefonUtland: "Skriv telefonnummeret uten landkode",
    feilEpost: "Bruk e-posten din som slutter på @stud.ntnu.no",
    feilSamtykke: "Kryss av for å gå videre",
    feilSend: "Noe gikk galt. Prøv igjen, eller send en mail til material@ntnui-alesund.no.",
    sender: "Sender …",
    sendtEpost: (epost) => `Kvitteringen er sendt til ${epost}. Vi sier fra når plaggene er klare til henting.`,
    sendtTekst: (epost) => `Ta vare på ordrenummeret. Vi sier fra på ${epost} når plaggene er klare til henting.`,
  },
  en: {
    "nav.tittel": "Order",
    "nav.tema": "Switch between dark and light",
    "nav.kurv": "Cart",
    "nav.hjem": "Collection",
    "nav.designer": "Designer",
    "helt.tittel1": "Clothes for",
    "helt.tittel2": "all of NTNUI",
    "helt.serif": "from the gym to the summit.",
    "helt.ingress": "Build your item in the designer, add it to the cart and send the order. You only pay when you pick it up at Intersport Rongve.",
    "helt.slagord": "clothes for all of NTNUI Ålesund",
    "helt.samarbeid": "in partnership with",
    "helt.cta": "Take me to the designer",
    "helt.cta2": "See the collection",
    "slik.tittel": "How it works",
    "slik.antall": "03 steps",
    "slik.1t": "Design it",
    "slik.1": "Pick the item, group, what goes on the front and back, and size.",
    "slik.2t": "Send the order",
    "slik.2": "Name, phone and student email. You get an order number right away.",
    "slik.3t": "Pick up and pay",
    "slik.3": "We collect the orders and send them to Intersport Rongve. You pay in the store.",
    "kol.tittel": "The collection",
    "kol.ingress": "A selection of what the clothes can look like. Tap an item to make your own version.",
    "kol.cta": "Design your own",
    "kol.kommer": "Coming to the designer",
    "kol.forrige": "Previous item",
    "kol.neste": "Next item",
    "band.tittel": "Make your own",
    "band.tekst": "Pick your group, logo on the front, motif on the back and a name. You see the result instantly.",
    "band.cta": "Take me to the designer",
    "bunn.betaling": "Payment",
    "bunn.betalingtekst": "No payment here. You pay when you pick up at Intersport Rongve, Høgvollveien 8.",
    "bunn.kontakt": "Contact",
    "bunn.personvern": "Privacy",
    "bunn.personverntekst": "Name, phone and email are only used for the order and deleted after delivery.",
    "bunn.kode": "Found a bug?",
    "bunn.kodetekst": "The code is open on GitHub. Report bugs or suggest changes under Issues.",
    "des.tittel": "The designer",
    "des.front": "Front",
    "des.bak": "Back",
    "des.plagg": "Item",
    "des.farge": "Colour",
    "des.gruppe": "Group",
    "des.frontvalg": "Front",
    "des.bakvalg": "Back",
    "des.navn": "Name on the back",
    "des.navnhjelp": "Max 12 characters",
    "des.kjonn": "Fit",
    "des.storrelse": "Size",
    "des.prisplagg": "Item",
    "des.pristrykk": "Print",
    "des.prisnavn": "Name",
    "des.leggtil": "Add to cart",
    "des.lagre": "Save changes",
    "des.info": "About the item",
    "des.kun": "only",
    "des.velgsnitt": "Choose a fit first",
    "info.artikkel": "Article no.",
    "info.passform": "Fit",
    "info.teknologi": "Technology",
    "info.materiale": "Material",
    "info.storrelser": "Sizes",
    "kurv.tittel": "Cart",
    "kurv.lukk": "Close",
    "kurv.tom": "Your cart is empty. Make something in the designer.",
    "kurv.total": "Total",
    "kurv.merknad": "Paid at pickup at Intersport Rongve. No payment here.",
    "kurv.videre": "Continue to order",
    "kurv.tilbake": "← Back to cart",
    "skjema.navn": "Name",
    "skjema.telefon": "Phone",
    "skjema.land": "Country code",
    "skjema.landsok": "Search for a country",
    landIngen: "No countries found",
    "skjema.epost": "Student email",
    "skjema.kommentar": "Comment (optional)",
    "skjema.samtykke": "I understand that the order is binding and that I pay at pickup.",
    "skjema.send": "Send order",
    "sendt.tittel": "Order sent",
    "sendt.ferdig": "Back to the shop",
    generisk: "Generic NTNUI",
    "front.ntnui": "NTNUI logo",
    "front.tekst": "Group name",
    "front.ingen": "Nothing",
    "bak.logo": "Group logo",
    "bak.motiv": "Motif",
    "bak.ingen": "Nothing",
    herre: "Men",
    dame: "Women",
    svart: "Black", hvit: "White", gronn: "Green", marine: "Navy", rod: "Red", bla: "Blue", gra: "Grey", gul: "Yellow",
    foran: "front",
    bak: "back",
    lagtTil: "added to cart",
    fjern: "Remove",
    endre: "Edit",
    endret: "Changes saved",
    mindre: "Fewer",
    flere: "More",
    mangler: "Choose fit and size first",
    feilNavn: "Enter your full name",
    feilTelefon: "Enter a Norwegian mobile number with 8 digits",
    feilTelefonUtland: "Enter the phone number without the country code",
    feilEpost: "Use your email ending in @stud.ntnu.no",
    feilSamtykke: "Tick the box to continue",
    feilSend: "Something went wrong. Try again, or email material@ntnui-alesund.no.",
    sender: "Sending …",
    sendtEpost: (epost) => `The receipt has been sent to ${epost}. We will let you know when your items are ready for pickup.`,
    sendtTekst: (epost) => `Keep the order number. We will let you know at ${epost} when your items are ready for pickup.`,
  },
};

// ---------- Hjelpere ----------

const $ = (sel, rot = document) => rot.querySelector(sel);
const $$ = (sel, rot = document) => [...rot.querySelectorAll(sel)];

function hent(nokkel, standard) {
  try { return JSON.parse(localStorage.getItem(nokkel)) ?? standard; } catch (e) { return standard; }
}
function lagre(nokkel, verdi) {
  try { localStorage.setItem(nokkel, JSON.stringify(verdi)); } catch (e) {}
}

let sprak = document.documentElement.lang === "en" ? "en" : "nb";
const t = (nokkel) => TEKST[sprak][nokkel] ?? TEKST.nb[nokkel] ?? nokkel;

function kroner(belop) {
  const tall = belop.toLocaleString("nb-NO");
  return sprak === "en" ? `NOK ${tall}` : `${tall},-`;
}

function escape(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ---------- Tema og språk ----------

function settTema(tema) {
  document.documentElement.dataset.theme = tema;
  try { localStorage.setItem("shop-tema", tema); } catch (e) {}
}
$("#tema-knapp").addEventListener("click", () => {
  settTema(document.documentElement.dataset.theme === "light" ? "dark" : "light");
});

// Sidene legger inn egne funksjoner her for å tegne seg selv på nytt ved språkbytte
const vedSprak = [];

function settSprak(nytt) {
  sprak = nytt;
  document.documentElement.lang = nytt;
  try { localStorage.setItem("shop-sprak", nytt); } catch (e) {}
  $$("[data-sprak]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.sprak === nytt)));
  $$("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
    if (el.dataset.text !== undefined) el.dataset.text = el.textContent;
  });
  $$("[data-i18n-aria]").forEach((el) => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
  $$("[data-i18n-ph]").forEach((el) => el.setAttribute("placeholder", t(el.dataset.i18nPh)));
  vedSprak.forEach((f) => f());
  tegnKurv();
}
$$("[data-sprak]").forEach((b) => b.addEventListener("click", () => settSprak(b.dataset.sprak)));

// ---------- Kurven ----------

let kurv = hent("shop-kurv-v2", []);

function nokkelFor(k) {
  return [k.plagg, k.farge, k.gruppe, k.front, k.bak, k.navn || "", k.kjonn, k.storrelse].join("|");
}

function leggTil(k) {
  const nokkel = nokkelFor(k);
  const finnes = kurv.find((l) => l.nokkel === nokkel);
  if (finnes) finnes.antall += 1;
  else kurv.push({ nokkel, k: { ...k }, antall: 1 });
  lagre("shop-kurv-v2", kurv);
  tegnKurv();
}

// Bytter ut linja med nøkkelen `gammel` med et nytt valg, og beholder antallet. Blir det nye valget likt en annen
// linje i kurven, slås de sammen. Gir false hvis linja ikke finnes lenger (f.eks. fjernet i en annen fane).
function erstatt(gammel, k) {
  const linje = kurv.find((l) => l.nokkel === gammel);
  if (!linje) return false;
  const nokkel = nokkelFor(k);
  const lik = kurv.find((l) => l.nokkel === nokkel && l !== linje);
  if (lik) {
    lik.antall = Math.min(10, lik.antall + linje.antall);
    kurv.splice(kurv.indexOf(linje), 1);
  } else {
    linje.nokkel = nokkel;
    linje.k = { ...k };
  }
  lagre("shop-kurv-v2", kurv);
  tegnKurv();
  return true;
}

// Adressen til designeren med alle valgene på en kurvlinje, og `endre` som sier hvilken linje som skal byttes ut
function endreLenke(l) {
  const u = new URLSearchParams({ plagg: l.k.plagg, gruppe: l.k.gruppe, farge: l.k.farge, front: l.k.front, bak: l.k.bak,
    kjonn: l.k.kjonn, storrelse: l.k.storrelse, endre: l.nokkel });
  if (l.k.navn) u.set("navn", l.k.navn);
  return `designer.html?${u}`;
}

function total() {
  return kurv.reduce((sum, l) => sum + prisFor(l.k).sum * l.antall, 0);
}

function gruppeNavn(g) {
  return g === GENERISK ? t("generisk") : g;
}

function beskriv(k) {
  const p = finnPlagg(k.plagg);
  const deler = [];
  if (p.front.includes("tekst") || p.bak.length) deler.push(gruppeNavn(k.gruppe));
  deler.push(`${t(`front.${k.front}`)} ${t("foran")}`);
  if (p.bak.length) deler.push(`${t(`bak.${k.bak}`)} ${t("bak")}`);
  if (k.navn) deler.push(`«${k.navn}»`);
  deler.push(t(k.farge), t(k.kjonn), k.storrelse);
  return deler.join(" · ");
}

function tegnKurv() {
  kurv = kurv.filter((l) => l.k && finnPlagg(l.k.plagg));
  const antall = kurv.reduce((s, l) => s + l.antall, 0);
  $("#kurv-antall").textContent = antall;
  $("#kurv-tom").hidden = kurv.length > 0;
  $("#kurv-sum").hidden = kurv.length === 0;
  $("#sum-tall").textContent = kroner(total());
  $("#sum-tall-2").textContent = kroner(total());
  $("#kurv-liste").innerHTML = kurv.map((l, i) => {
    const p = finnPlagg(l.k.plagg);
    const g = finnGruppe(l.k.gruppe);
    const miniatyr = g
      ? `<img src="img/logo/${g.slug}.webp" alt="">`
      : `<img src="../img/ntnui-logo.svg" alt="">`;
    return `
      <li class="kurv-linje">
        <div class="kurv-miniatyr" aria-hidden="true">${miniatyr}</div>
        <div>
          <h4>${escape(p.navn[sprak])}</h4>
          <p class="detaljer">${escape(beskriv(l.k))}</p>
          <div class="antall">
            <button type="button" data-endre="${i}" data-steg="-1" aria-label="${escape(t("mindre"))}">−</button>
            <span>${l.antall}</span>
            <button type="button" data-endre="${i}" data-steg="1" aria-label="${escape(t("flere"))}">+</button>
          </div>
        </div>
        <div class="linje-hoyre">
          <strong>${kroner(prisFor(l.k).sum * l.antall)}</strong>
          <div class="linje-valg">
            <a class="fjern" href="${escape(endreLenke(l))}">${escape(t("endre"))}</a>
            <button type="button" class="fjern" data-fjern="${i}">${escape(t("fjern"))}</button>
          </div>
        </div>
      </li>`;
  }).join("");
}

$("#kurv-liste").addEventListener("click", (e) => {
  const endre = e.target.closest("[data-endre]");
  const fjern = e.target.closest("[data-fjern]");
  if (endre) {
    const linje = kurv[+endre.dataset.endre];
    linje.antall = Math.min(10, linje.antall + +endre.dataset.steg);
    if (linje.antall < 1) kurv.splice(+endre.dataset.endre, 1);
  } else if (fjern) {
    kurv.splice(+fjern.dataset.fjern, 1);
  } else return;
  lagre("shop-kurv-v2", kurv);
  tegnKurv();
});

// ---------- Åpne og lukke skuffen ----------

const skuff = $("#kurv");
const slor = $("#slor");
let sistFokus = null;

function visSteg(navn) {
  $$(".kurv-steg", skuff).forEach((s) => { s.hidden = s.dataset.steg !== navn; });
}

function apneKurv() {
  sistFokus = document.activeElement;
  visSteg("kurv");
  skuff.hidden = false;
  slor.hidden = false;
  void skuff.offsetWidth; // tving tegning, så overgangen starter fra lukket posisjon
  skuff.classList.add("apen");
  slor.classList.add("apen");
  $("#kurv-lukk").focus();
  document.body.style.overflow = "hidden";
}

function lukkKurv() {
  skuff.classList.remove("apen");
  slor.classList.remove("apen");
  document.body.style.overflow = "";
  setTimeout(() => { skuff.hidden = true; slor.hidden = true; }, 600);
  sistFokus && sistFokus.focus();
}

$("#kurv-knapp").addEventListener("click", apneKurv);
$("#kurv-lukk").addEventListener("click", lukkKurv);
slor.addEventListener("click", lukkKurv);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !skuff.hidden) lukkKurv();
});
$("#til-detaljer").addEventListener("click", () => { visSteg("detaljer"); $("#navn").focus(); });
$("#tilbake").addEventListener("click", () => visSteg("kurv"));
$("#ferdig").addEventListener("click", lukkKurv);

// ---------- Skjema og innsending ----------

// Landvelger med flagg. Flaggene er bilder, fordi flagg-emoji ikke vises på Windows.
let land = LAND[0];
const landKnapp = $("#land-knapp");
const landMeny = $("#land-meny");
const landSok = $("#land-sok");
const landListe = $("#land-liste");
let aktivtLand = 0;

const flagg = (kode) => `https://flagcdn.com/w40/${kode}.png`;
const landNavn = (l) => (sprak === "en" ? l[2] : l[1]);

function treff() {
  const q = landSok.value.trim().toLowerCase().replace(/^\+/, "");
  if (!q) return LAND;
  return LAND.filter((l) => l[1].toLowerCase().includes(q) || l[2].toLowerCase().includes(q) || l[3].startsWith(q));
}

function tegnLand() {
  const liste = treff();
  aktivtLand = Math.min(aktivtLand, Math.max(liste.length - 1, 0));
  landListe.innerHTML = liste.length
    ? liste.map((l, i) => `
        <li role="option" id="land-${l[0]}" data-land="${l[0]}" aria-selected="${l === land}" class="${i === aktivtLand ? "aktiv" : ""}">
          <img class="flagg" src="${flagg(l[0])}" alt="" width="22" height="16" loading="lazy">
          <span class="land-navn">${escape(landNavn(l))}</span>
          <span class="land-tall">+${l[3]}</span>
        </li>`).join("")
    : `<li class="land-tom">${escape(t("landIngen"))}</li>`;
  const aktiv = $(".aktiv", landListe);
  if (aktiv) { landListe.setAttribute("aria-activedescendant", aktiv.id); aktiv.scrollIntoView({ block: "nearest" }); }
}

function velgLand(kode) {
  land = LAND.find((l) => l[0] === kode) || land;
  $("#land-flagg").src = flagg(land[0]);
  $("#land-kode").textContent = `+${land[3]}`;
  $("#telefon").placeholder = land[0] === "no" ? "123 45 678" : "";
  lukkLand();
  $("#telefon").focus();
}

function apneLand() {
  landMeny.hidden = false;
  landKnapp.setAttribute("aria-expanded", "true");
  landSok.value = "";
  aktivtLand = Math.max(LAND.indexOf(land), 0);
  tegnLand();
  landSok.focus();
}

function lukkLand() {
  landMeny.hidden = true;
  landKnapp.setAttribute("aria-expanded", "false");
}

landKnapp.addEventListener("click", () => (landMeny.hidden ? apneLand() : lukkLand()));
landSok.addEventListener("input", () => { aktivtLand = 0; tegnLand(); });
landSok.addEventListener("keydown", (e) => {
  const liste = treff();
  if (e.key === "ArrowDown") { e.preventDefault(); aktivtLand = Math.min(aktivtLand + 1, liste.length - 1); tegnLand(); }
  else if (e.key === "ArrowUp") { e.preventDefault(); aktivtLand = Math.max(aktivtLand - 1, 0); tegnLand(); }
  else if (e.key === "Enter") { e.preventDefault(); if (liste[aktivtLand]) velgLand(liste[aktivtLand][0]); }
  else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); lukkLand(); landKnapp.focus(); }
});
landListe.addEventListener("click", (e) => {
  const valgt = e.target.closest("[data-land]");
  if (valgt) velgLand(valgt.dataset.land);
});
document.addEventListener("click", (e) => {
  if (!landMeny.hidden && !e.target.closest(".land")) lukkLand();
});
vedSprak.push(() => { if (!landMeny.hidden) tegnLand(); });

function settFeil(felt, melding) {
  const boks = $(`[data-feil="${felt}"]`);
  boks.textContent = melding || "";
  const input = $(`#${felt}`);
  if (input) input.setAttribute("aria-invalid", melding ? "true" : "false");
}

function sjekkSkjema() {
  const navn = $("#navn").value.trim();
  const siffer = $("#telefon").value.replace(/[\s\-().]/g, "").replace(new RegExp(`^(\\+|00)${land[3]}`), "");
  const norsk = land[0] === "no";
  const telefonOk = norsk ? /^[49]\d{7}$/.test(siffer) : /^\d{5,14}$/.test(siffer);
  const telefon = `+${land[3]} ${siffer}`;
  const epost = $("#epost").value.trim();
  const feil = {
    navn: navn.split(/\s+/).length < 2 ? t("feilNavn") : "",
    telefon: telefonOk ? "" : t(norsk ? "feilTelefon" : "feilTelefonUtland"),
    epost: EPOST_MONSTER.test(epost) ? "" : t("feilEpost"),
    samtykke: $("#samtykke").checked ? "" : t("feilSamtykke"),
  };
  Object.entries(feil).forEach(([felt, melding]) => settFeil(felt, melding));
  const forste = Object.keys(feil).find((k) => feil[k]);
  if (forste) { $(`#${forste}`).focus(); return null; }
  return { navn, telefon, epost, kommentar: $("#kommentar").value.trim() };
}

$("#skjema").addEventListener("submit", async (e) => {
  e.preventDefault();
  const kunde = sjekkSkjema();
  if (!kunde) return;

  const send = $("#send");
  const sendTekst = $("span", send);
  send.disabled = true;
  sendTekst.textContent = t("sender");

  const bestilling = {
    ...kunde,
    sprak,
    nettside: e.target.nettside.value,
    linjer: kurv.map((l) => ({ ...l.k, antall: l.antall })),
  };

  try {
    const svar = await fetch(`${API}/api/shop/bestilling`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bestilling),
    });
    const data = await svar.json().catch(() => ({}));
    if (!svar.ok) throw new Error(data.feil || t("feilSend"));
    const ordrenr = data.ordrenr;
    $("#ordrenr").textContent = `#${ordrenr}`;
    $("#sendt-tekst").textContent = t(data.epost ? "sendtEpost" : "sendtTekst")(kunde.epost);
    kurv = [];
    lagre("shop-kurv-v2", kurv);
    tegnKurv();
    e.target.reset();
    visSteg("sendt");
  } catch (feil) {
    visToast(feil instanceof TypeError ? t("feilSend") : feil.message);
  } finally {
    send.disabled = false;
    sendTekst.textContent = t("skjema.send");
  }
});

// ---------- Toast ----------

let toastTid;
function visToast(melding) {
  const toast = $("#toast");
  toast.textContent = melding;
  toast.classList.add("vis");
  clearTimeout(toastTid);
  toastTid = setTimeout(() => toast.classList.remove("vis"), 2400);
}

// ---------- Inngangsanimasjon ----------

const observer = "IntersectionObserver" in window
  ? new IntersectionObserver((oppforinger) => {
      oppforinger.forEach((o) => {
        if (o.isIntersecting) { o.target.classList.add("is-in"); observer.unobserve(o.target); }
      });
    }, { threshold: 0.12 })
  : null;

function observerInn(rot = document) {
  $$(".reveal:not(.is-in)", rot).forEach((el) => (observer ? observer.observe(el) : el.classList.add("is-in")));
}

// Antall stjerner på repoet i bunnen av forsiden. Vises bare når det er noen, og feiler stille
// (GitHub tillater 60 kall i timen per IP uten innlogging).
function hentStjerner() {
  const el = $("#github-stjerner");
  if (!el) return;
  fetch("https://api.github.com/repos/ntnuiaa-material/ntnuiaa-material.github.io")
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      if (!d || !d.stargazers_count) return;
      el.textContent = `★ ${d.stargazers_count}`;
      el.hidden = false;
    })
    .catch(() => {});
}

// Sidens eget skript kaller start() til slutt
function start() {
  settSprak(sprak);
  observerInn();
  hentStjerner();
}

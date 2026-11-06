// Designeren: plagget tegnes som lag over et frilagt bilde av front og rygg.
// Plasseringene ligger i katalog.js (soner, regnet ut fra cm), og lagene bygges i tegning.js.

const params = new URLSearchParams(location.search);
const startPlagg = finnPlagg(params.get("plagg")) || PLAGG[0];
const startGruppe = finnGruppe(params.get("gruppe")) ? params.get("gruppe") : GRUPPER[0].navn;

// Valgfrie parametre som gjenskaper en kombinasjon (brukes av kortene i kolleksjonen): farge, front, bak og navn.
// Ugyldige verdier for plagget ignoreres, og rettOpp() under sjekker resten (f.eks. motiv uten motivgruppe).
function urlNavn(v) {
  return (v || "").toUpperCase().replace(/[^A-ZÆØÅ0-9 .\-]/g, "").slice(0, 12).trim();
}
// NTNUI-logoen er standardvalget foran, selv om «Gruppenavn» står først i knapperaden
function standardFront(p) {
  return p.front.includes("ntnui") ? "ntnui" : p.front[0];
}
const urlFarge = params.get("farge");
const urlFront = params.get("front");
const urlBak = params.get("bak");

const valg = {
  plagg: startPlagg.id,
  farge: startPlagg.farger[urlFarge] ? urlFarge : Object.keys(startPlagg.farger)[0],
  gruppe: startGruppe,
  front: startPlagg.front.includes(urlFront) ? urlFront : standardFront(startPlagg),
  bak: startPlagg.bak.includes(urlBak) ? urlBak : startPlagg.bak[0] || "ingen",
  navn: startPlagg.navnFelt ? urlNavn(params.get("navn")) : "",
  // Snitt og størrelse kommer bare med fra «Endre» i kurven. rettOpp() tømmer dem hvis plagget ikke har dem
  kjonn: startPlagg.kjonn.includes(params.get("kjonn")) ? params.get("kjonn") : "",
  storrelse: params.get("storrelse") || "",
};

// Nøkkelen til kurvlinja som endres (fra «Endre» i kurven), ellers null. Da lagrer knappen over linja
// i stedet for å legge til en ny.
let endrer = kurv.some((l) => l.nokkel === params.get("endre")) ? params.get("endre") : null;

function tegnKnapp() {
  const tekst = $("#legg-til [data-i18n]");
  tekst.dataset.i18n = endrer ? "des.lagre" : "des.leggtil";
  tekst.textContent = t(tekst.dataset.i18n);
}

const plagg = () => finnPlagg(valg.plagg);

// Det brukeren sist valgte. Valgene følger med når plagget byttes, så langt plagget har dem.
const onske = { front: valg.front, bak: valg.bak, navn: valg.navn };

// Motiv finnes ikke for alle grupper, og aldri for generisk
function motivMulig() {
  const g = finnGruppe(valg.gruppe);
  return Boolean(g && g.motiv);
}

function rettOpp() {
  const p = plagg();
  if (!p.farger[valg.farge]) valg.farge = Object.keys(p.farger)[0];
  valg.front = p.front.includes(onske.front) ? onske.front : standardFront(p);
  if (valg.front === "tekst" && !motivMulig()) valg.front = "ntnui";
  if (!p.bak.length) valg.bak = "ingen";
  else if (p.bak.includes(onske.bak)) valg.bak = onske.bak;
  else valg.bak = onske.bak === "motiv" && p.bak.includes("logo") ? "logo" : p.bak[0];
  if (valg.bak === "motiv" && !motivMulig()) valg.bak = "logo";
  valg.navn = p.navnFelt ? onske.navn : "";
  if (valg.kjonn && !p.kjonn.includes(valg.kjonn)) valg.kjonn = "";
  if (p.kjonn.length === 1) valg.kjonn = p.kjonn[0]; // bare herremodell: velg den med en gang
  // Hvit TEE finnes bare i herre: bytt farge hvis snittet ikke har den
  if (!fargerFor(p, valg.kjonn).includes(valg.farge)) valg.farge = fargerFor(p, valg.kjonn)[0];
  if (valg.storrelse && !(p.storrelser[valg.kjonn] || []).includes(valg.storrelse)) valg.storrelse = "";
}

// Gruppa betyr bare noe når et valg bruker den
function brukerGruppe(p) {
  return p.front.includes("tekst") || p.bak.length > 0;
}

function artikkel() {
  return plagg().artikler[`${valg.farge}:${valg.kjonn}`] || "";
}

// ---------- Lagene på plagget ----------

function plassering(sone, boks = false) {
  const rot = sone.rot ? `;transform:translate(-50%,-50%) rotate(${sone.rot}deg)` : "";
  return `left:${sone.x}%;top:${sone.y}%;width:${sone.b}%${boks && sone.h ? `;height:${sone.h}%` : ""}${rot}`;
}

// Lagene kommer fra tegning.js, som admin bruker til forhåndsvisningene. Her gjøres de om til HTML.
function lagHtml(l) {
  if (l.type === "base") return `<img class="lag lag-base" src="${l.src}" alt="">`;
  if (l.type === "bilde") return `<img class="lag lag-trykk" style="${plassering(l.sone)}" src="${l.src}" alt="">`;
  if (l.type === "boks") return `<div class="lag lag-trykk lag-boks" style="${plassering(l.sone, true)}"><img src="${l.src}" alt=""></div>`;
  return `<div class="lag lag-trykk lag-navn lag-${l.farge}" style="${plassering(l.sone)};font-size:${navnStorrelse(l.sone).toFixed(2)}cqw">${escape(l.tekst)}</div>`;
}

function lagFor(side) {
  return trykkLag(valg, side).map((l) => ({ nokkel: l.nokkel, html: lagHtml(l) }));
}

// Bytter bare lagene som er endret, så de nye kan tones inn. De gamle står til de nye
// bildene er lastet, så plagget ikke blinker når fargen byttes.
function tegnLerret(side) {
  const lerret = $(`#lerret-${side}`);
  const nye = lagFor(side);
  const nokler = new Set(nye.map((l) => l.nokkel));
  const gamle = $$(":scope > [data-nokkel]:not(.ut)", lerret).filter((el) => !nokler.has(el.dataset.nokkel));
  const lastes = [];
  nye.forEach((l, i) => {
    let el = $(`:scope > [data-nokkel="${CSS.escape(l.nokkel)}"]:not(.ut)`, lerret);
    if (el && el.dataset.html !== l.html) {
      // Samme lag på et annet plagg: flytt det til den nye plasseringen
      const mal = document.createElement("template");
      mal.innerHTML = l.html.trim();
      const ny = mal.content.firstElementChild;
      el.setAttribute("style", ny.getAttribute("style") || "");
      if (ny.matches("img") && el.getAttribute("src") !== ny.getAttribute("src")) el.setAttribute("src", ny.getAttribute("src"));
      if (!ny.matches("img")) el.innerHTML = ny.innerHTML;
      el.dataset.html = l.html;
    }
    if (!el) {
      const mal = document.createElement("template");
      mal.innerHTML = l.html.trim();
      el = mal.content.firstElementChild;
      el.dataset.nokkel = l.nokkel;
      el.dataset.html = l.html;
      if (lerret.dataset.klar) el.classList.add("inn");
      lerret.appendChild(el);
      const bilder = el.matches("img") ? [el] : $$("img", el);
      bilder.forEach((img) => lastes.push(img.decode().catch(() => {})));
    }
    el.style.zIndex = i + 1;
  });
  Promise.all(lastes).then(() => {
    gamle.forEach((el) => {
      el.classList.add("ut");
      setTimeout(() => el.remove(), 350);
    });
  });
  lerret.dataset.klar = "1";
}

// Last inn alle fargene på plagget, så fargebytte går med en gang
const forhandslastet = new Set();
function forhandslast() {
  Object.values(plagg().farger).forEach((f) => [f.front, f.bak].filter(Boolean).forEach((src) => {
    if (forhandslastet.has(src)) return;
    forhandslastet.add(src);
    new Image().src = src;
  }));
}

// ---------- Panelet ----------

function chips(id, alternativer, valgt, tekst, deaktivert = () => false) {
  $(id).innerHTML = alternativer.map((a) => `
    <button type="button" class="chip" data-verdi="${a}" aria-pressed="${a === valgt}" ${deaktivert(a) ? "disabled" : ""}>
      ${escape(tekst(a))}
    </button>`).join("");
}

function tegnPanel() {
  const p = plagg();
  $("#scene-tittel").textContent = p.navn[sprak];
  $("#scene-stoff").textContent = p.stoff ? p.stoff[sprak] : "";

  $("#valg-plagg").innerHTML = PLAGG.map((x) => {
    const forste = Object.values(x.farger)[0].front;
    return `
      <button type="button" class="plagg-kort" data-plagg="${x.id}" aria-pressed="${x.id === valg.plagg}">
        <img src="${forste}" alt="">
        <span class="plagg-kort-navn">${escape(x.navn[sprak])}</span>
        <span class="mono dempet">${escape(x.stoff ? x.stoff[sprak] : x.kategori)}</span>
      </button>`;
  }).join("");

  const tilgjengelig = fargerFor(p, valg.kjonn);
  $("#valg-farge").innerHTML = Object.entries(p.farger).map(([navn, f]) => {
    const merknad = f.kjonn ? ` (${t("des.kun")} ${f.kjonn.map((k) => t(k).toLowerCase()).join("/")})` : "";
    return `
    <button type="button" class="fargeprikk" data-farge="${navn}" aria-pressed="${navn === valg.farge}"
      aria-label="${escape(t(navn) + merknad)}" title="${escape(t(navn) + merknad)}" style="--prikk:${f.prikk}"
      ${tilgjengelig.includes(navn) ? "" : "disabled"}></button>`;
  }).join("");
  $("#farge-felt").hidden = Object.keys(p.farger).length < 2;
  $("#gruppe-felt").hidden = !brukerGruppe(p);
  $("#bak-felt").hidden = p.bak.length === 0;
  $("#figurer").dataset.sider = p.sider.length;
  $(".visning").hidden = p.sider.length < 2;

  $("#valg-gruppe").innerHTML = [
    ...GRUPPER.map((g) => `<option value="${escape(g.navn)}">${escape(g.navn)}</option>`),
    `<option value="${GENERISK}">${escape(t("generisk"))}</option>`,
  ].join("");
  $("#valg-gruppe").value = valg.gruppe;

  chips("#valg-front", p.front, valg.front, (a) => t(`front.${a}`), (a) => a === "tekst" && !motivMulig());
  chips("#valg-bak", p.bak, valg.bak, (a) => t(`bak.${a}`), (a) => a === "motiv" && !motivMulig());
  const fargeKjonn = p.farger[valg.farge].kjonn;
  chips("#valg-kjonn", p.kjonn, valg.kjonn, (a) => t(a), (a) => Boolean(fargeKjonn && !fargeKjonn.includes(a)));

  $("#navn-felt").hidden = !p.navnFelt;
  $("#valg-navn").value = valg.navn;

  const storrelser = p.storrelser[valg.kjonn] || [];
  $("#valg-storrelse").disabled = !valg.kjonn;
  $("#valg-storrelse").innerHTML = `<option value="">${escape(valg.kjonn ? "–" : t("des.velgsnitt"))}</option>` +
    storrelser.map((s) => `<option${s === valg.storrelse ? " selected" : ""}>${s}</option>`).join("");

  tegnInfo();
  tegnPris();
}

// Fakta om plagget fra katalogen. Bare det som er kjent vises.
function tegnInfo() {
  const p = plagg();
  const i = p.info || {};
  const rader = [];
  const nr = artikkel() || [...new Set(Object.values(p.artikler))].join(" / ");
  if (nr) rader.push([t("info.artikkel"), nr]);
  if (i.passform) {
    const pf = valg.kjonn ? i.passform[valg.kjonn] : [...new Set(Object.values(i.passform))].join(" / ");
    if (pf) rader.push([t("info.passform"), pf]);
  }
  if (i.teknologi) rader.push([t("info.teknologi"), i.teknologi]);
  if (i.materiale) rader.push([t("info.materiale"), i.materiale[sprak]]);
  const st = (k) => `${p.storrelser[k][0]}–${p.storrelser[k].at(-1)}`;
  rader.push([t("info.storrelser"), p.kjonn.map((k) => `${t(k)} ${st(k)}`).join(", ")]);
  $("#info-liste").innerHTML = rader.map(([a, b]) => `<div><dt>${escape(a)}</dt><dd>${escape(b)}</dd></div>`).join("");
}

function tegnPris() {
  const p = plagg();
  const pris = prisFor(valg);
  const linjer = [
    [t("des.prisplagg"), `${p.katalogpris > p.pris ? `<s>${kroner(p.katalogpris)}</s> ` : ""}${kroner(pris.plagg)}`],
    [t("des.pristrykk"), kroner(pris.trykk)],
  ];
  if (pris.navn) linjer.push([t("des.prisnavn"), kroner(pris.navn)]);
  $("#prislinjer").innerHTML = linjer.map(([a, b]) => `<div><dt>${escape(a)}</dt><dd>${b}</dd></div>`).join("");
  $("#des-sum").textContent = kroner(pris.sum);
}

function oppdater() {
  rettOpp();
  tegnPanel();
  if (plagg().sider.length < 2) visSide("front");
  tegnLerret("front");
  tegnLerret("bak");
  forhandslast();
  const url = new URL(location.href);
  url.searchParams.set("plagg", valg.plagg);
  url.searchParams.set("gruppe", valg.gruppe);
  // Resten av valget følger med i adressen, så lenken kan deles og gjenskaper det samme plagget
  url.searchParams.set("farge", valg.farge);
  url.searchParams.set("front", valg.front);
  url.searchParams.set("bak", valg.bak);
  if (valg.navn) url.searchParams.set("navn", valg.navn);
  else url.searchParams.delete("navn");
  history.replaceState(null, "", url);
}

// ---------- Hendelser ----------

$(".panel").addEventListener("click", (e) => {
  const kort = e.target.closest("[data-plagg]");
  const farge = e.target.closest("[data-farge]");
  const chip = e.target.closest(".chip");
  if (kort) valg.plagg = kort.dataset.plagg;
  else if (farge) valg.farge = farge.dataset.farge;
  else if (chip && !chip.disabled) {
    const felt = { "valg-front": "front", "valg-bak": "bak", "valg-kjonn": "kjonn" }[chip.parentElement.id];
    valg[felt] = chip.dataset.verdi;
    if (felt in onske) onske[felt] = chip.dataset.verdi;
    chip.closest(".gruppe-valg").classList.remove("mangler");
    // Velger man ryggtrykk, vis ryggen på mobil
    if (felt === "bak") visSide("bak");
    if (felt === "front") visSide("front");
    if (felt === "kjonn") valg.storrelse = "";
  } else return;
  oppdater();
});

$("#valg-gruppe").addEventListener("change", (e) => { valg.gruppe = e.target.value; oppdater(); });
$("#valg-storrelse").addEventListener("change", (e) => {
  valg.storrelse = e.target.value;
  e.target.closest(".gruppe-valg").classList.remove("mangler");
  tegnPris();
});
$("#valg-navn").addEventListener("input", (e) => {
  const rent = e.target.value.toUpperCase().replace(/[^A-ZÆØÅ0-9 .\-]/g, "").slice(0, 12);
  if (rent !== e.target.value) e.target.value = rent;
  valg.navn = onske.navn = rent.trim();
  visSide("bak");
  tegnLerret("bak");
  tegnPris();
});

$("#legg-til").addEventListener("click", () => {
  const mangler = [];
  if (!valg.kjonn) mangler.push($("#valg-kjonn").closest(".gruppe-valg"));
  if (!valg.storrelse) mangler.push($("#valg-storrelse").closest(".gruppe-valg"));
  if (mangler.length) {
    mangler.forEach((m) => { m.classList.remove("mangler"); void m.offsetWidth; m.classList.add("mangler"); });
    return visToast(t("mangler"));
  }
  if (endrer && erstatt(endrer, { ...valg, artikkel: artikkel() })) {
    // Ferdig med endringen: knappen legger til igjen, og kurven åpnes så man ser resultatet
    endrer = null;
    const url = new URL(location.href);
    ["endre", "kjonn", "storrelse"].forEach((n) => url.searchParams.delete(n));
    history.replaceState(null, "", url);
    tegnKnapp();
    visToast(t("endret"));
    apneKurv();
    return;
  }
  endrer = null;
  tegnKnapp();
  leggTil({ ...valg, artikkel: artikkel() });
  visToast(`${plagg().navn[sprak]} ${t("lagtTil")}`);
});

// Front/rygg på mobil
function visSide(side) {
  $("#figurer").dataset.vis = side;
  $$("[data-vis]").forEach((b) => b.matches("button") && b.setAttribute("aria-selected", String(b.dataset.vis === side)));
}
$$(".visning button").forEach((b) => b.addEventListener("click", () => visSide(b.dataset.vis)));

vedSprak.push(oppdater);
start();
tegnKnapp();

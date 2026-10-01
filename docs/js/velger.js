// Søkefelt med forslag. Filtrerer eksisterende verdier mens man skriver.
// valg: () => [{ verdi, tekst, hint }]. fri: tillat ny verdi som ikke finnes fra før.

function lagVelger(input, { valg, fri = false, nyTekst = "Ny", onVelg = () => {} }) {
  const boks = document.createElement("div");
  boks.className = "velger";
  input.parentNode.insertBefore(boks, input);
  boks.appendChild(input);

  const liste = document.createElement("ul");
  liste.className = "velger-liste skjult";
  liste.id = `${input.name}-forslag`;
  liste.setAttribute("role", "listbox");
  boks.appendChild(liste);

  input.setAttribute("role", "combobox");
  input.setAttribute("aria-autocomplete", "list");
  input.setAttribute("aria-controls", liste.id);
  input.setAttribute("aria-expanded", "false");
  input.autocomplete = "off";

  let treff = [];
  let aktiv = -1;

  function marker(tekst, q) {
    const i = tekst.toLowerCase().indexOf(q);
    if (!q || i === -1) return esc(tekst);
    return esc(tekst.slice(0, i)) + "<mark>" + esc(tekst.slice(i, i + q.length)) + "</mark>" + esc(tekst.slice(i + q.length));
  }

  function tegn() {
    const q = input.value.trim().toLowerCase();
    treff = valg().filter((v) => !q || `${v.tekst} ${v.hint || ""}`.toLowerCase().includes(q));
    const finnes = valg().some((v) => v.tekst.toLowerCase() === q);
    if (fri && q && !finnes) treff.push({ verdi: input.value.trim(), tekst: input.value.trim(), ny: true });

    liste.innerHTML = treff.length
      ? treff.map((v, i) => `
          <li role="option" id="${liste.id}-${i}" data-i="${i}" aria-selected="${i === aktiv}" class="${v.ny ? "ny" : ""}">
            ${v.ny ? `<span class="etikett">+ ${nyTekst}</span> ${esc(v.tekst)}` : marker(v.tekst, q)}
            ${v.hint ? `<small>${marker(v.hint, q)}</small>` : ""}
          </li>`).join("")
      : `<li class="tom">Ingen treff</li>`;
    input.setAttribute("aria-activedescendant", aktiv >= 0 ? `${liste.id}-${aktiv}` : "");
  }

  function aapne() {
    aktiv = -1;
    tegn();
    liste.classList.remove("skjult");
    input.setAttribute("aria-expanded", "true");
  }

  function lukk() {
    liste.classList.add("skjult");
    input.setAttribute("aria-expanded", "false");
  }

  function velg(i) {
    const v = treff[i];
    if (!v) return;
    input.value = v.tekst;
    input.dataset.verdi = v.verdi;
    lukk();
    onVelg(v);
  }

  input.addEventListener("focus", aapne);
  input.addEventListener("input", () => {
    delete input.dataset.verdi;
    aapne();
    if (input.value.trim() && treff.length) {
      aktiv = 0;
      tegn();
    }
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (liste.classList.contains("skjult")) aapne();
      aktiv = (aktiv + (e.key === "ArrowDown" ? 1 : -1) + treff.length) % treff.length;
      tegn();
      liste.querySelector(`[data-i="${aktiv}"]`)?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter" && !liste.classList.contains("skjult") && aktiv >= 0) {
      e.preventDefault();
      velg(aktiv);
    } else if (e.key === "Escape") {
      lukk();
    }
  });
  // mousedown i stedet for click, så feltet ikke mister fokus før valget registreres
  liste.addEventListener("mousedown", (e) => {
    const li = e.target.closest("[data-i]");
    if (!li) return;
    e.preventDefault();
    velg(Number(li.dataset.i));
  });
  input.addEventListener("blur", () => setTimeout(lukk, 100));

  return {
    sett(verdi, tekst) {
      input.value = tekst;
      input.dataset.verdi = verdi;
    },
  };
}

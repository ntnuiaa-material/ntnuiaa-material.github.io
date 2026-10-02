# lager
Oversikt over utstyr, klær og utlån i NTNUI Ålesund

Hver ting har en QR-kode med et ID-nummer (`https://ntnuiaa-material.github.io/1002`). Medlemmer skanner, låner og leverer selv. Materialansvarlig registrerer ting og skriver ut etiketter.

## Status

Prototype av brukergrensesnittet. Data ligger som testdata i `docs/js/data.js`, og utlån lagres bare i nettleseren. Database (Cloudflare D1) og bilder (Cloudflare R2) kommer.

## Sider

| Fil | Hva |
|---|---|
| `docs/index.html` | Søk og liste over alle ting |
| `docs/ting.html?id=1002` | Tingen: bilde, status, lån og lever |
| `docs/admin/` | Admin: oversikt, alle gjenstander, registrer og endre med bilde, QR-etiketter på A4. Krever passord |

Admin er beskyttet av et passord som sjekkes i API-et (secret `ADMIN_PASSORD`).

## Publisering

GitHub Pages: Settings → Pages → Deploy from a branch → `main` / `docs`. `404.html` sender `/1002` videre til `ting.html?id=1002`, siden GitHub Pages ikke har ruter.

## Kjøre lokalt

Hvilken som helst statisk server fra `docs/`, for eksempel:

```
npx serve docs
```

## ID-serier

| Serie | Brukes til |
|---|---|
| 1xxx | Enkeltutstyr |
| 2xxx | Bulk og klær |
| 3xxx | Lokasjoner (bod, hylle, skap) |

## Cache

Alle `js/` og `css/`-lenker har `?v=<tidsstempel>`, så nettleseren henter nye filer etter en endring. Oppdater tallet når du endrer en JS- eller CSS-fil:

```
V=$(date +%Y%m%d%H%M); sed -i -E "s#\?v=[0-9]+#?v=$V#g" docs/*.html docs/admin/*.html
```

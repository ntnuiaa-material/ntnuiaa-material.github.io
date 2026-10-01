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
| `docs/kontroll-*/` | Admin: oversikt, alle ting, registrer og endre ting med bilde, QR-etiketter på A4 |

Admin-mappa har et navn ingen gjetter, og de offentlige sidene lenker aldri dit. Det er bare et gjemmested, ikke en lås. En ekte lås kommer sammen med databasen. Mappa kan døpes om fritt, alle lenker inni den er relative.

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

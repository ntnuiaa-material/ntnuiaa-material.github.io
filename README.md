# lager
Oversikt over utstyr, klær og utlån i NTNUI Ålesund

Hver ting har en QR-kode med et ID-nummer (`HTTPS://LAGER.PAGES.DEV/1002`). Medlemmer skanner, låner og leverer selv. Materialansvarlig registrerer ting og skriver ut etiketter.

## Status

Prototype av brukergrensesnittet. Data ligger som testdata i `public/js/data.js`, og utlån lagres bare i nettleseren. Database (Cloudflare D1) og bilder (Cloudflare R2) kommer.

## Sider

| Fil | Hva |
|---|---|
| `public/index.html` | Søk og liste over alle ting |
| `public/ting.html?id=1002` | Tingen: bilde, status, lån og lever |
| `public/kontroll-*/` | Admin: oversikt, alle ting, registrer og endre ting med bilde, QR-etiketter på A4 |

Admin-mappa har et navn ingen gjetter, og de offentlige sidene lenker aldri dit. Det er bare et gjemmested, ikke en lås. Låsen er Cloudflare Access. Mappa kan døpes om fritt, alle lenker inni den er relative.

## Kjøre lokalt

Hvilken som helst statisk server fra `public/`, for eksempel:

```
npx serve public
```

## ID-serier

| Serie | Brukes til |
|---|---|
| 1xxx | Enkeltutstyr |
| 2xxx | Bulk og klær |
| 3xxx | Lokasjoner (bod, hylle, skap) |

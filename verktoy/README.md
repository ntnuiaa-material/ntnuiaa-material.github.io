# Verktøy for bestillingssiden

Skriptene lager bildene i `docs/bestilling/img/`. De ligger utenfor `docs/`, så GitHub Pages publiserer dem ikke.

| Skript | Lager | Kjøres slik |
|---|---|---|
| `plagg_fra_psd.py` | `img/plagg/<plagg>-<farge>-<side>.webp` fra PSD-mockupene, uten NTNUI-trykk | `python plagg_fra_psd.py ../docs/bestilling/img/plagg soner.json` |
| `tekst_fra_pdf.py` | `img/tekst/` og `img/motiv/` som SVG i hvitt og sort, fra PDF-ene til hver gruppe | `python tekst_fra_pdf.py <Klær-mappa> ../docs/bestilling/img <tmp-mappe>` |

- `plagg_fra_psd.py` krever `psd-tools`, `numpy` og `Pillow`. Fargene står i `FARGER` øverst. Ny farge: legg den inn der og i `katalog.js`
- `tekst_fra_pdf.py` krever `pdftocairo` og `pdfinfo` (poppler). Glyfene blir stier, så MADE Mirage trengs ikke på nettsiden
- `soner.json` viser hvor trykket satt i PSD-en, i prosent av lerretet. Sonene i `katalog.js` er regnet ut fra den

- `plagg_fra_psd.py` og `shorts_fra_psd.py` finner PSD-ene i mappa `KLAER_MAPPE` (miljøvariabel), som er `Klær/` på NTNUI-disken
- `generert_til_plagg.py` deler mockups generert med Nano Banana 2.1 (OpenArt) i front og rygg

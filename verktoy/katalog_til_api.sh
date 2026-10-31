#!/bin/sh
# Kopierer katalogen fra nettsida til API-et, så prisene regnes ut med nøyaktig samme kode
# på begge sider. Kjør etter hver endring i docs/shop/katalog.js, før API-et deployes.
cd "$(dirname "$0")/.."
{
  echo "// LAGET AUTOMATISK av verktoy/katalog_til_api.sh fra docs/shop/katalog.js. Ikke rediger her."
  echo
  cat docs/shop/katalog.js
  echo
  echo "export { PLAGG, GRUPPER, GENERISK, TRYKKPRIS, TRYKKSONER, prisFor, finnPlagg, finnGruppe, fargerFor };"
} > api/src/katalog.js
echo "api/src/katalog.js oppdatert"

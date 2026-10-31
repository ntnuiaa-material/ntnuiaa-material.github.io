// Skriver src/logo.js fra assets/logo-epost.png. Kjøres fra api/: node scripts/lag-logo.mjs
//
// Slik lages PNG-en (fra api/):
//   rsvg-convert -w 220 -h 88 ../docs/img/ntnui-logo.svg -o /tmp/raw.png
//   magick /tmp/raw.png -strip -define png:compression-level=9 -define png:compression-filter=5 PNG32:assets/logo-epost.png
// 220x88 px = 2x av visningsstørrelsen 110x44 px. PNG32 beholder myk kant mot gjennomsiktig bakgrunn.
import { readFileSync, writeFileSync } from "node:fs";

const b64 = readFileSync(new URL("../assets/logo-epost.png", import.meta.url)).toString("base64");
const biter = b64.match(/.{1,100}/g).map((b) => `  "${b}"`).join(" +\n");
writeFileSync(new URL("../src/logo.js", import.meta.url), `// GENERERT FIL - ikke rediger for hånd. Lages av scripts/lag-logo.mjs fra assets/logo-epost.png.
// Logoen til kvitteringshodet som base64, sendt som innebygd CID-vedlegg (se smtp.js og epost.js).
// 220x88 px, vises 110x44 px (2x for skarpe skjermer). Gjenskap PNG-en: se kommentaren i scripts/lag-logo.mjs.
export const LOGO_BREDDE = 110;
export const LOGO_HOYDE = 44;
export const LOGO_CID = "logo@ntnui-alesund.no";
export const LOGO_PNG_BASE64 =
${biter};
`);

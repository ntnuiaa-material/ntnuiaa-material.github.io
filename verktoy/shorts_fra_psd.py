import os, sys, io
import numpy as np
from PIL import Image
from psd_tools import PSDImage

# Mappa med Klær/ fra NTNUI-disken. Sett KLAER_MAPPE før skriptet kjøres.
KLAER = os.environ.get("KLAER_MAPPE", "Klær")
UT = sys.argv[1]
psd = PSDImage.open(f"{KLAER}/Generisk/Shorts/Short_NTNUI_Generisk.psd")
so = [l for l in psd.descendants() if l.kind == "smartobject" and l.name == "Mockup"][0]
indre = PSDImage.open(io.BytesIO(so.smart_object.data))
for il in indre.descendants():
    b = il.topil()
    if b is not None:
        a = np.asarray(b.convert("RGBA")).astype(float); m = a[..., 3] > 0
        print(il.name, il.bbox, "rgb", a[..., :3][m].mean(0).round(0) if m.any() else None, "dekning", round(m.mean(), 3))
# Indre design uten logo og uten sidestriper (ENTRADA 26 SHORT har ingen striper)
W, H = indre.size
design = Image.new("RGBA", (W, H), (0, 0, 0, 0))
for il in indre.descendants():
    if il.name in ("Logo__NTNUI-A",) or il.name.startswith("Ellipse") or not il.is_visible():
        continue
    b = il.topil()
    if b is None: continue
    if il.name == "Layer 3":  # adidas-logoen, hvit
        b = Image.merge("RGBA", (Image.new("L", b.size, 255),) * 3 + (b.convert("RGBA").split()[3],))
    lag = Image.new("RGBA", (W, H), (0, 0, 0, 0)); lag.paste(b.convert("RGBA"), il.bbox[:2])
    design = Image.alpha_composite(design, lag)
# Perspektiv: hjørnene i det indre bildet til transform_box i dokumentet
tb = so.smart_object.transform_box  # x1,y1 (øvre venstre), x2,y2 (øvre høyre), x3,y3 (nedre høyre), x4,y4 (nedre venstre)
dst = [(tb[0], tb[1]), (tb[2], tb[3]), (tb[4], tb[5]), (tb[6], tb[7])]
src = [(0, 0), (W, 0), (W, H), (0, H)]
def koeff(fra, til):
    # Finner koeffisientene som PIL trenger: punkt i ut-bildet -> punkt i inn-bildet
    A, B = [], []
    for (x, y), (u, v) in zip(til, fra):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); B.append(u)
        A.append([0, 0, 0, x, y, 1, -v * x, -v * y]); B.append(v)
    return np.linalg.solve(np.array(A, float), np.array(B, float)).tolist()
DW, DH = psd.size
varp = design.transform((DW, DH), Image.PERSPECTIVE, koeff(src, dst), Image.BICUBIC)
# Masken til smartobjektet avgrenser plagget
m = so.mask; mk = Image.new("L", (DW, DH), m.background_color); mk.paste(m.topil().convert("L"), m.bbox[:2])
varp.putalpha(Image.fromarray(np.minimum(np.asarray(varp.split()[3]), np.asarray(mk))))
c = np.asarray(varp, np.float32) / 255
rgb, alfa = c[..., :3], c[..., 3:4]
fx = {l.name: l for l in psd.descendants() if l.kind == "pixel" and l.parent.name == "Fx"}
def lag_full(l):
    a = np.zeros((DH, DW, 4), np.float32); b = np.asarray(l.topil().convert("RGBA"), np.float32) / 255
    x0, y0, x1, y1 = l.bbox; a[y0:y1, x0:x1] = b; return a
for navn, modus in (("Shadow", "burn"), ("Midtone", "dodge"), ("Light", "screen")):
    f = lag_full(fx[navn]); fa = f[..., 3:4] * (fx[navn].opacity / 255); fr = f[..., :3]
    if modus == "burn": ny = np.clip(rgb + fr - 1, 0, 1)
    elif modus == "dodge": ny = np.clip(rgb + fr, 0, 1)
    else: ny = 1 - (1 - rgb) * (1 - fr)
    rgb = rgb * (1 - fa) + ny * fa
# Snoren ligger i bakgrunnsfotoet, ikke i smartobjektet: hent den fra den flate eksporten
flat = np.asarray(Image.open(f"{KLAER}/Generisk/Shorts/Short_NTNUI_Generisk.png").convert("RGB").resize((DW, DH)), np.float32) / 255
fmx, fmn = flat.max(2), flat.min(2)
snor = (fmx > 0.55) & ((fmx - fmn) < 0.12) & (alfa[..., 0] < 0.5)
ys, xs = np.where(np.asarray(mk) > 128)
boks = np.zeros_like(snor); boks[ys.min():ys.max(), xs.min():xs.max()] = True
snor &= boks
snor = np.asarray(Image.fromarray((snor * 255).astype(np.uint8)).filter(__import__("PIL.ImageFilter", fromlist=["x"]).MaxFilter(3)), np.float32)[..., None] / 255
rgb = rgb * (1 - snor) + flat * snor
alfa = np.maximum(alfa, snor)
ut = Image.fromarray((np.dstack([rgb, alfa[..., 0:1]]) * 255).astype(np.uint8), "RGBA")
bb = ut.split()[3].getbbox(); ut = ut.crop(bb)
print("plagg-boks", bb, "logo i dokumentet:")
# Logoplassering til katalogen (perspektiv på logoens midtpunkt)
lg = [l for l in indre.descendants() if l.name == "Logo__NTNUI-A"][0]
inv = koeff(dst, src)
def frem(x, y):
    a, b_, c_, d, e, f, g, h = koeff(dst, src)
    # løs omvendt: bruk koeff fra src til dst
    A = koeff(src, dst)  # dst-punkt -> src-punkt
    return None
skala = min(900 / ut.width, 1000 / ut.height)
ut = ut.resize((round(ut.width * skala), round(ut.height * skala)), Image.LANCZOS)
lerret = Image.new("RGBA", (900, 1000), (0, 0, 0, 0)); padx = (900 - ut.width) // 2
lerret.alpha_composite(ut, (padx, 0))
lerret.save(f"{UT}/entrada-short-svart-front.webp", quality=86, method=6)
# Logoens hjørner fra indre til dokument med fremover-perspektiv
Fkoef = koeff(dst, src)  # PIL-koeff for avbildning src(ut)->dst(inn) er motsatt; her trenger vi indre->dokument
a, b_, c_, d, e, f, g, h = koeff(dst, src)
def tildok(x, y):
    n = g * x + h * y + 1
    return ((a * x + b_ * y + c_) / n, (d * x + e * y + f) / n)
x0, y0, x1, y1 = lg.bbox
hj = [tildok(x0, y0), tildok(x1, y0), tildok(x1, y1), tildok(x0, y1)]
X = [p[0] for p in hj]; Y = [p[1] for p in hj]
cx, cy, bw = (min(X) + max(X)) / 2, (min(Y) + max(Y)) / 2, max(X) - min(X)
px = ((cx - bb[0]) * skala + padx) / 900 * 100; py = (cy - bb[1]) * skala / 1000 * 100; pb = bw * skala / 900 * 100
print(f"logo-sone: x {px:.1f} y {py:.1f} b {pb:.1f}")

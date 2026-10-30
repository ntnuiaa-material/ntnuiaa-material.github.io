import os, sys, io, json
import numpy as np
from PIL import Image, ImageFilter
from psd_tools import PSDImage

# Mappa med Klær/ fra NTNUI-disken. Sett KLAER_MAPPE før skriptet kjøres.
KLAER = os.environ.get("KLAER_MAPPE", "Klær")

KILDE = {
    "tiro": f"{KLAER}/Klatring/SPORT (TIRO 26)/NTNUI-sport-Klatring-2026.psd",
    "entrada": f"{KLAER}/Klatring/CASUAL (ENTRADA 26)/NTNUI-casual-Klatring-2026.psd",
}
# Trykklag som fjernes fra smartobjektene. Striper, adidas-logo og mansjetter blir stående.
TRYKK = {"KLATRING", "DITT NAVN", "Logo__NTNUI-A", "BULDREHALLEN", "Klatring_ESTD2024_back",
         "Klatring_tekst_back", "KLATRING_MOTIV", "Klatring_tekst_front"}
# Regel: Climacool og alt som heter JERSEY er svart med hvite dekaler.
# Bare ENTRADA 26 TEE finnes i flere farger: svart (herre og dame) og hvit (bare herre).
FARGER = {
    "tiro": {"svart": (0, 0, 0)},
    "entrada": {"svart": (0, 0, 0), "hvit": (244, 244, 244)},
}
LYSE = {"hvit", "gul"}
R, UT = sys.argv[1], sys.argv[2]
SKALA, LW, LH = 0.437, 900, 1000

def lag_med_navn(rot, navn):
    return [l for l in rot.descendants() if l.name == navn]

def maske(layer, box):
    """Lagmasken som flyttall i boksens koordinater."""
    x0, y0, x1, y1 = box
    m = layer.mask
    ut = np.full((y1 - y0, x1 - x0), m.background_color / 255, np.float32)
    bilde = m.topil()
    if bilde is not None:
        a = np.asarray(bilde.convert("L"), np.float32) / 255
        mx0, my0, mx1, my1 = m.bbox
        ix0, iy0, ix1, iy1 = max(mx0, x0), max(my0, y0), min(mx1, x1), min(my1, y1)
        if ix1 > ix0 and iy1 > iy0:
            ut[iy0 - y0:iy1 - y0, ix0 - x0:ix1 - x0] = a[iy0 - my0:iy1 - my0, ix0 - mx0:ix1 - mx0]
    return ut

def lim(dst, src, x, y):
    """Lim src inn i dst med øvre venstre hjørne i (x, y), med klipping."""
    h, w = src.shape[:2]
    H, W = dst.shape[:2]
    ax0, ay0, ax1, ay1 = max(x, 0), max(y, 0), min(x + w, W), min(y + h, H)
    if ax1 > ax0 and ay1 > ay0:
        dst[ay0:ay1, ax0:ax1] = np.maximum(dst[ay0:ay1, ax0:ax1], src[ay0 - y:ay1 - y, ax0 - x:ax1 - x])

def tegn_strek(il, storrelse, over=4):
    """Tegner streken til en vektorform (linje eller ellipse) med kantutjevning."""
    from PIL import ImageDraw
    w, h = storrelse
    farge = il.stroke.content[b"Clr "]
    rgb = tuple(round(farge[k]) for k in (b"Rd  ", b"Grn ", b"Bl  "))
    bredde = il.stroke.line_width * over
    stor = Image.new("RGBA", (w * over, h * over), (0, 0, 0, 0))
    tegn = ImageDraw.Draw(stor)
    pkt = lambda par: (par[1] * w * over, par[0] * h * over)
    for sti in il.vector_mask.paths[:1]:
        knuter = list(sti)
        punkter = []
        for i in range(len(knuter) if sti.is_closed() else len(knuter) - 1):
            k0, k1 = knuter[i], knuter[(i + 1) % len(knuter)]
            p0, c0, c1, p1 = pkt(k0.anchor), pkt(k0.leaving), pkt(k1.preceding), pkt(k1.anchor)
            for t in np.linspace(0, 1, 48):
                u = 1 - t
                punkter.append((u**3 * p0[0] + 3 * u * u * t * c0[0] + 3 * u * t * t * c1[0] + t**3 * p1[0],
                                u**3 * p0[1] + 3 * u * u * t * c0[1] + 3 * u * t * t * c1[1] + t**3 * p1[1]))
        tegn.line(punkter, fill=rgb + (255,), width=round(bredde), joint="curve")
    return stor.resize((w, h), Image.LANCZOS)

soner = {}
for plagg, fil in KILDE.items():
    psd = PSDImage.open(fil)
    skygge_l = lag_med_navn(psd, "FX Shadows")[0]; lys_l = lag_med_navn(psd, "FX Lights")[0]
    for side, gnavn in (("front", "Front"), ("bak", "Back")):
        gruppe = [g for g in psd.descendants() if g.kind == "group" and g.name == gnavn][0]
        farge_l = [l for l in gruppe if l.kind == "solidcolorfill"][0]
        so = [l for l in gruppe if l.kind == "smartobject"][0]
        box = farge_l.bbox
        x0, y0, x1, y1 = box
        plaggmaske = maske(farge_l, box)

        # Designlaget bygges på nytt av lagene i smartobjektet, uten trykklagene
        indre = PSDImage.open(io.BytesIO(so.smart_object.data))
        tb = so.smart_object.transform_box
        fak = (tb[2] - tb[0]) / indre.width
        indre_rgba = Image.new("RGBA", indre.size, (0, 0, 0, 0))
        for il in indre.descendants():
            if il.kind == "group" or not il.is_visible() or il.bbox == (0, 0, 0, 0):
                continue
            if il.name.strip() in TRYKK or il.name.startswith("Safety zone"):
                continue
            bilde = il.topil()
            if bilde is None:
                if il.kind == "shape" and il.stroke is not None and il.stroke.enabled:
                    indre_rgba = Image.alpha_composite(indre_rgba, tegn_strek(il, indre.size))
                else:
                    print("  uten piksler:", il.name, il.kind)
                continue
            bilde = bilde.convert("RGBA")
            if il.name == "Layer 1":  # adidas-logoen er hvit via en lageffekt i Photoshop
                bilde = Image.merge("RGBA", (Image.new("L", bilde.size, 255),) * 3 + (bilde.split()[3],))
            if il.mask is not None and not il.mask.disabled:
                bilde.putalpha(Image.fromarray((np.asarray(bilde.split()[3], np.float32) * maske(il, il.bbox)).astype(np.uint8)))
            if il.opacity < 255:
                bilde.putalpha(bilde.split()[3].point(lambda v: v * il.opacity // 255))
            lag = Image.new("RGBA", indre.size, (0, 0, 0, 0)); lag.paste(bilde, il.bbox[:2])
            indre_rgba = Image.alpha_composite(indre_rgba, lag)
        stor = indre_rgba.resize((round(indre.width * fak), round(indre.height * fak)), Image.LANCZOS)
        design_bilde = Image.new("RGBA", (x1 - x0, y1 - y0), (0, 0, 0, 0))
        design_bilde.paste(stor, (round(tb[0]) - x0, round(tb[1]) - y0))
        design = np.asarray(design_bilde, np.float32) / 255
        if so.mask is not None:
            design = design.copy(); design[..., 3] *= maske(so, box)

        skygge = np.asarray(skygge_l.topil().convert("RGB").crop(box), np.float32) / 255
        lys = np.asarray(lys_l.topil().convert("RGB").crop(box), np.float32) / 255
        lysstyrke = lys_l.opacity / 255

        for fnavn, rgb in FARGER[plagg].items():
            c = np.broadcast_to(np.array(rgb, np.float32) / 255, design.shape[:2] + (3,)).copy()
            d = design[..., :3].copy()
            if fnavn in LYSE:
                d = 1 - d  # hvite striper og logo blir sorte på lyse plagg
            a = design[..., 3:4]
            c = c * (1 - a) + d * a
            c = np.clip(c + skygge - 1, 0, 1)                    # Linear Burn
            c = c + (np.maximum(c, lys) - c) * lysstyrke         # Lighten
            alfa = np.clip(np.maximum(plaggmaske, design[..., 3]), 0, 1)
            ut = np.dstack([c, alfa])
            im = Image.fromarray((ut * 255).astype(np.uint8), "RGBA")
            im = im.resize((round(im.width * SKALA), round(im.height * SKALA)), Image.LANCZOS)
            lerret = Image.new("RGBA", (LW, LH), (0, 0, 0, 0))
            lerret.alpha_composite(im, ((LW - im.width) // 2, 0))
            lerret.save(f"{R}/{plagg}-{fnavn}-{side}.webp", quality=86, method=6)
        print(plagg, side, "ferdig", flush=True)
json.dump(soner, open(UT, "w"), indent=1, ensure_ascii=False)

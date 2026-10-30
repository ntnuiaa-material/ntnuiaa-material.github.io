"""Deler et generert mockup-bilde (front til venstre, rygg til høyre, periwinkle bakgrunn)
i to frilagte webp-bilder på samme 900 × 1000-lerret som resten av plaggene.

    python generert_til_plagg.py <inn.png> <ut-mappe> <navn>   ->  <navn>-svart-front.webp og -bak.webp
"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

LW, LH = 900, 1000


def frilegg(del_):
    a = np.asarray(del_.convert("RGB"), np.float32) / 255
    mx, mn = a.max(2), a.min(2)
    s = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    # Bakgrunnen er mettet periwinkle. Plagget er svart, hvitt og grått.
    m = ((s < 0.2) | (mx < 0.2)).astype(np.uint8) * 255
    maske = Image.fromarray(m).filter(ImageFilter.MedianFilter(5)).copy()
    w, h = maske.size
    ImageDraw.floodfill(maske, (w // 2, h // 2), 128, thresh=10)
    plagg = np.asarray(maske) == 128
    inv = Image.fromarray(np.where(plagg, 0, 255).astype(np.uint8)).copy()
    ImageDraw.floodfill(inv, (0, 0), 128, thresh=10)
    bak = np.asarray(inv) == 128
    alfa = Image.fromarray(np.where(bak, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
    ut = del_.convert("RGBA")
    ut.putalpha(alfa)
    return ut.crop(alfa.getbbox())


def main(inn, mappe, navn):
    im = Image.open(inn).convert("RGB")
    W, H = im.size
    sider = {"front": frilegg(im.crop((0, 0, W // 2, H))), "bak": frilegg(im.crop((W // 2, 0, W, H)))}
    # Samme skala på begge sider, så front og rygg blir like store
    skala = min(min(LW / d.width, LH / d.height) for d in sider.values())
    for side, d in sider.items():
        d = d.resize((round(d.width * skala), round(d.height * skala)), Image.LANCZOS)
        lerret = Image.new("RGBA", (LW, LH), (0, 0, 0, 0))
        lerret.alpha_composite(d, ((LW - d.width) // 2, 0))
        lerret.save(f"{mappe}/{navn}-svart-{side}.webp", quality=86, method=6)
        print(navn, side, d.size)


if __name__ == "__main__":
    main(*sys.argv[1:4])

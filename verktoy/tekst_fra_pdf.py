import sys, os, re, subprocess, glob
from PIL import Image
K, R, S = sys.argv[1], sys.argv[2], sys.argv[3]
def slug(g):
    g = g.lower().replace("&", "og").replace("ø", "o").replace("å", "a").replace("æ", "ae")
    return "-".join(g.split())
def konverter(pdf, ut):
    tmp = f"{S}/svg/tmp"
    info = subprocess.run(["pdfinfo", pdf], capture_output=True, text=True).stdout
    pw, ph = map(float, re.search(r"Page size:\s+([\d.]+) x ([\d.]+)", info).groups())
    dpi = max(4, round(1600 / (max(pw, ph) / 72)))
    subprocess.run(["pdftocairo", "-png", "-r", str(dpi), "-singlefile", "-transp", pdf, tmp], check=True)
    im = Image.open(tmp + ".png").convert("RGBA"); bb = im.split()[3].getbbox()
    W, H = im.size
    subprocess.run(["pdftocairo", "-svg", pdf, tmp + ".svg"], check=True)
    s = open(tmp + ".svg").read()
    m = re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', s); vw, vh = float(m[1]), float(m[2])
    fx, fy = vw / W, vh / H
    x0, y0, x1, y1 = (bb[0]-1)*fx, (bb[1]-1)*fy, (bb[2]+1)*fx, (bb[3]+1)*fy
    s = re.sub(r'width="[\d.]+(pt)?" height="[\d.]+(pt)?" viewBox="[^"]*"', f'width="{x1-x0:.1f}" height="{y1-y0:.1f}" viewBox="{x0:.1f} {y0:.1f} {x1-x0:.1f} {y1-y0:.1f}"', s, count=1)
    for navn, farge in (("hvit", "rgb(100%, 100%, 100%)"), ("sort", "rgb(0%, 0%, 0%)")):
        t = re.sub(r'fill="rgb\([^)]*\)"', f'fill="{farge}"', s)
        t = re.sub(r'stroke="rgb\([^)]*\)"', f'stroke="{farge}"', t)
        open(f"{ut}-{navn}.svg", "w").write(t)
    return round((x1-x0)/(y1-y0), 3)
for mappe in sorted(glob.glob(f"{K}/*/CASUAL (ENTRADA 26)")):
    g = mappe.split("/")[-2]; sl = slug(g); rad = [g]
    for del_, mønster, mål in (("bak", "*_tekst_back.pdf", "tekst"), ("front", "*_tekst_front.pdf", "tekst"), ("estd", "*_ESTD*_back.pdf", "tekst"), ("motiv", "*_MOTIV.pdf", "motiv")):
        f = [x for x in glob.glob(f"{mappe}/{mønster}") if "backup" not in x.lower()]
        if not f: rad.append(f"{del_}:MANGLER"); continue
        ut = f"{R}/motiv/{sl}" if mål == "motiv" else f"{R}/tekst/{sl}-{del_}"
        rad.append(f"{del_}:{konverter(f[0], ut)}")
    print(" | ".join(rad))

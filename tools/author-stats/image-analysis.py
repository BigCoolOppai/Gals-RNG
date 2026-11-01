import json, os, math, colorsys
from PIL import Image
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
d = json.load(open(os.path.join(ROOT, 'tools/author-stats/game-data.json')))
r = d['rarities']

def hue_name(h):
    if h < 15 or h >= 345: return 'red'
    if h < 45: return 'orange'
    if h < 70: return 'yellow'
    if h < 160: return 'green'
    if h < 200: return 'cyan'
    if h < 250: return 'blue'
    if h < 290: return 'purple'
    if h < 330: return 'magenta'
    return 'pink'

rows = []
for x in r:
    p = os.path.join(ROOT, x['card']['image'])
    im = Image.open(p).convert('RGB')
    w, h = im.size
    small = im.resize((64, 64))
    a = np.asarray(small).astype(np.float32) / 255.0
    # sRGB -> HSV vectorized
    import matplotlib.colors as mcolors
    hsv = mcolors.rgb_to_hsv(a)
    hue = hsv[..., 0] * 360.0
    sat = hsv[..., 1]
    val = hsv[..., 2]
    wt = sat * val  # цветные пиксели весят больше, серые почти игнорим
    mask = wt > 0.05
    if mask.sum() > 0:
        ang = np.deg2rad(hue[mask])
        wsum = wt[mask]
        cx = (np.cos(ang) * wsum).sum() / wsum.sum()
        cy = (np.sin(ang) * wsum).sum() / wsum.sum()
        mean_hue = math.degrees(math.atan2(cy, cx)) % 360
    else:
        mean_hue = 0.0
    # доминирующий оттенок: гистограмма по 24 корзинам, взвешенная на sat*val
    hist, edges = np.histogram(hue[mask], bins=24, range=(0, 360), weights=wt[mask]) if mask.sum() else (np.zeros(24), None)
    dom_hue = (int(np.argmax(hist)) * 15 + 7.5) % 360
    rows.append({
        'id': x['id'],
        'w': w, 'h': h,
        'bytes': os.path.getsize(p),
        'mean_hue': round(mean_hue, 1),
        'dom_hue': round(dom_hue, 1),
        'hue_family': hue_name(mean_hue),
        'sat': round(float((sat * wt).sum() / wt.sum() * 100) if mask.sum() else 0, 1),
        'val': round(float(val.mean() * 100), 1),
        'dark_frac': round(float((val < 0.25).mean() * 100), 1),
        'bright_frac': round(float((val > 0.8).mean() * 100), 1),
        'color_frac': round(float(mask.mean() * 100), 1),
    })

out = os.path.join(ROOT, 'tools/author-stats/image-stats.json')
json.dump(rows, open(out, 'w'), ensure_ascii=False)
print('done', len(rows))
import collections
print(collections.Counter(x['hue_family'] for x in rows).most_common())
print('dims', collections.Counter((x['w'], x['h']) for x in rows).most_common(5))
print('mean val', round(np.mean([x['val'] for x in rows]), 1))

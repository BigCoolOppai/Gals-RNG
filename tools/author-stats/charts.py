# tools/author-stats/charts.py — графики для отчёта «досье автора»
import json, os, re, math, collections
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib import font_manager

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'tools/author-stats/charts')
os.makedirs(OUT, exist_ok=True)

d = json.load(open(os.path.join(ROOT, 'tools/author-stats/game-data.json')))
s = json.load(open(os.path.join(ROOT, 'tools/author-stats/stats.json')))
img = json.load(open(os.path.join(ROOT, 'tools/author-stats/image-stats.json')))
r = d['rarities']
ru = d['locales']['ru']['cards']

BG = '#0d0a14'
FG = '#e8e3f3'
ACC = ['#ff4fa3', '#a86bff', '#38e8ff', '#ffd166', '#7cf29c', '#ff7a45']
plt.rcParams.update({
    'figure.facecolor': BG, 'axes.facecolor': BG, 'savefig.facecolor': BG,
    'text.color': FG, 'axes.labelcolor': FG, 'xtick.color': FG, 'ytick.color': FG,
    'axes.edgecolor': '#2f2740', 'font.size': 12, 'axes.grid': True,
    'grid.color': '#241d33', 'grid.linewidth': 0.8,
    'font.family': 'DejaVu Sans',
})


def style(ax, title, sub=None):
    ax.set_title(title, fontsize=16, fontweight='bold', color=FG, pad=30 if sub else 10, loc='left')
    if sub:
        ax.text(0, 1.035, sub, transform=ax.transAxes, fontsize=9.5, color='#9d92b8', va='bottom')
    for sp in ('top', 'right'):
        ax.spines[sp].set_visible(False)
    ax.spines['left'].set_color('#3a3050')
    ax.spines['bottom'].set_color('#3a3050')


def save(fig, name):
    p = os.path.join(OUT, name)
    fig.savefig(p, dpi=170, bbox_inches='tight')
    plt.close(fig)
    print('->', p)


# 1. лог-редкость
buckets = collections.Counter()
for x in r:
    inv = 1 / x['probabilityBase']
    buckets[min(9, int(math.floor(math.log10(inv))))] += 1
labels = ['1', '10', '100', '1 тыс.', '10 тыс.', '100 тыс.', '1 млн', '10 млн', '100 млн', '1 млрд']
vals = [buckets.get(i, 0) for i in range(10)]
fig, ax = plt.subplots(figsize=(9.4, 4.6))
bars = ax.bar(labels, vals, color=[ACC[i % len(ACC)] for i in range(10)], width=0.72)
ax.tick_params(axis='x', labelsize=9.5)
for b, v in zip(bars, vals):
    ax.text(b.get_x() + b.get_width() / 2, v + 1.2, str(v), ha='center', color=FG, fontsize=11, fontweight='bold')
style(ax, 'Где живут твои карты', 'сколько карт с шансом «1 к N» попадает в каждый порядок величины')
ax.set_ylabel('карт')
ax.set_ylim(0, max(vals) + 10)
ax.grid(axis='x', visible=False)
save(fig, '01-rarity.png')

# 2. состав
fig, ax = plt.subplots(figsize=(5.2, 5.2))
sizes = [146, 32]
labels2 = ['Базовый пул — 146', 'Ивентовые — 32']
wedges, _ = ax.pie(sizes, colors=[ACC[1], ACC[0]], startangle=90,
                   wedgeprops=dict(width=0.34, edgecolor=BG, linewidth=3))
ax.text(0, 0.06, '178', ha='center', va='center', fontsize=34, fontweight='bold', color=FG)
ax.text(0, -0.2, 'карт', ha='center', va='center', fontsize=12, color='#9d92b8')
ax.legend(wedges, labels2, loc='upper center', bbox_to_anchor=(0.5, 0.06), frameon=False, fontsize=11)
ax.set_title('Из чего собрана коллекция', fontsize=15, fontweight='bold', loc='left', color=FG)
save(fig, '02-composition.png')

# 3. длина описаний
lens = [len(ru[x['id']]['description']) for x in r]
fig, ax = plt.subplots(figsize=(9, 4.4))
ax.hist(lens, bins=22, color=ACC[2], edgecolor=BG, linewidth=1.2)
ax.axvline(sum(lens) / len(lens), color=ACC[0], linestyle='--', linewidth=2)
ax.text(sum(lens) / len(lens) + 4, ax.get_ylim()[1] * 0.85, 'среднее 130', color=ACC[0], fontsize=11, fontweight='bold')
style(ax, 'Длина описаний', 'символов на карточку: почти всё уложено в 90–170 — формат «подпись, а не рассказ»')
ax.set_xlabel('символов')
ax.set_ylabel('карт')
ax.grid(axis='x', visible=False)
save(fig, '03-desc-len.png')

# 4. топ-слова
words = [('кажется', 18), ('девушка', 14), ('лишь', 12), ('решила', 12), ('взгляд', 11),
         ('возможно', 10), ('опасная / опасность', 8), ('женщина', 8), ('невероятно', 7),
         ('говорят', 6), ('меч', 6), ('милая', 5)]
fig, ax = plt.subplots(figsize=(9, 4.8))
words = words[::-1]
ax.barh([w for w, _ in words], [n for _, n in words], color=[ACC[3] if n >= 12 else ACC[4] for _, n in words], height=0.7)
for i, (w, n) in enumerate(words):
    ax.text(n + 0.3, i, str(n), va='center', color=FG, fontsize=10.5, fontweight='bold')
style(ax, 'Слова-визитки', 'в скольких карточках встречается слово (не всего раз, а именно карт)')
ax.set_xlim(0, 21)
ax.grid(axis='y', visible=False)
save(fig, '04-words.png')

# 5. код
code = s['code']
files = [(k, v['lines']) for k, v in code.items()]
files = [f for f in files if f[1] > 150]
files.sort(key=lambda t: t[1])
fig, ax = plt.subplots(figsize=(9, 4.6))
names = [f[0] for f in files]
vals = [f[1] for f in files]
cols = [ACC[0] if n.startswith('css') else (ACC[3] if 'ru.js' in n or 'en.js' in n else ACC[1]) for n in names]
ax.barh(names, vals, color=cols, height=0.72)
for i, v in enumerate(vals):
    ax.text(v + 40, i, f'{v:,}'.replace(',', ' '), va='center', color=FG, fontsize=10)
style(ax, 'Карта кода', 'строк на файл — 18 772 строки на всю игру, и большая часть веса не в логике, а в контенте')
ax.set_xlim(0, max(vals) * 1.18)
ax.grid(axis='y', visible=False)
save(fig, '05-code.png')

# 6. светлота артов
vals = [x['val'] for x in img]
fig, ax = plt.subplots(figsize=(9, 4.4))
ax.hist(vals, bins=18, color=ACC[5], edgecolor=BG, linewidth=1.2)
ax.axvline(sum(vals) / len(vals), color=ACC[2], linestyle='--', linewidth=2)
ax.text(sum(vals) / len(vals) + 2, ax.get_ylim()[1] * 0.85, 'средняя 57%', color=ACC[2], fontsize=11, fontweight='bold')
style(ax, 'Светлота артов', 'средняя яркость кадра, % — половина коллекции живёт в тёмной половине шкалы')
ax.set_xlabel('средняя яркость, %')
ax.set_ylabel('карт')
ax.grid(axis='x', visible=False)
save(fig, '06-lightness.png')

print('charts done')

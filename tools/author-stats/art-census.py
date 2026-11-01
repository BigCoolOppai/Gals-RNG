# tools/author-stats/art-census.py — перепись артов по 178 картам (визуальная разметка вручную)
import json, os, collections

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
d = json.load(open(os.path.join(ROOT, 'tools/author-stats/game-data.json')))
r = d['rarities']
ru = d['locales']['ru']['cards']

# L — крупная, M — средняя, S — маленькая, C — не видно (спина, броня, силуэт, крупный кроп)
LABELS = (
    # sheet1  0–29
    "CLLLSLLLSL" "CLLLMLLLLM" "LLLMCLSLLL"
    # sheet2 30–59
    "LSCMCCLMCC" "MLSLCLLCLM" "LLLLMLLLLL"
    # sheet3 60–89
    "CLLCLLLLLS" "LLCCLLLLLM" "LCLLCLMMSM"
    # sheet4 90–119
    "MLLMMLLLLM" "LLLLLLLLLL" "LLLMLSLLLL"
    # sheet5 120–149
    "LLLLLLLLLL" "LLLMLLLMLM" "LCLLCMLLLL"
    # sheet6 150–177
    "LMLMLCMLLL" "LLLLLLLLLL" "SLLLLLLL"
)
assert len(LABELS) == 178, len(LABELS)

CODE = {'L': 'крупная', 'M': 'средняя', 'S': 'маленькая', 'C': 'не видно'}

rows = []
for i, x in enumerate(r):
    rows.append({
        'i': i, 'id': x['id'], 'name': ru[x['id']]['cardName'],
        'label': LABELS[i], 'kind': CODE[LABELS[i]],
        'inv': round(1 / x['probabilityBase']) if x['probabilityBase'] else None,
        'prestige': x.get('minPrestige', 0),
        'event': (x.get('availability') or {}).get('eventId'),
        'alt': bool(x.get('displayParentId')),
    })

def share(sel):
    c = collections.Counter(x['label'] for x in sel)
    vis = [x for x in sel if x['label'] != 'C']
    return {
        'n': len(sel),
        'counts': {k: c.get(k, 0) for k in 'LMSC'},
        'visible': len(vis),
        'L_share': round(100 * c.get('L', 0) / len(vis), 1) if vis else None,
        'S_share': round(100 * c.get('S', 0) / len(vis), 1) if vis else None,
    }

out = {
    'cards': rows,
    'all': share(rows),
    'base': share([x for x in rows if not x['event']]),
    'halloween': share([x for x in rows if x['event'] == 'halloween_luck_2025']),
    'choco': share([x for x in rows if x['event'] == 'choco_2025']),
    'prestige0': share([x for x in rows if x['prestige'] == 0]),
    'prestige_hi': share([x for x in rows if x['prestige'] >= 3]),
    'alts': share([x for x in rows if x['alt']]),
    'originals': share([x for x in rows if not x['alt']]),
}
a = out['all']['counts']
out['ratio_L_S'] = round(a['L'] / a['S'], 1)
out['ratio_L_MS'] = round(a['L'] / (a['M'] + a['S']), 1)
out['ratio_L_rest'] = round(a['L'] / (a['M'] + a['S'] + a['C']), 1)
out['share_all_L'] = round(100 * a['L'] / 178, 1)
out['share_all_S'] = round(100 * a['S'] / 178, 1)
out['small_list'] = [x['name'] for x in rows if x['label'] == 'S']
out['medium_list'] = [x['name'] for x in rows if x['label'] == 'M']
out['hidden_list'] = [x['name'] for x in rows if x['label'] == 'C']

json.dump(out, open(os.path.join(ROOT, 'tools/author-stats/art-census.json'), 'w'),
          ensure_ascii=False, indent=1)

print('всего', out['all']['n'], out['all']['counts'])
print('видимых', out['all']['visible'], 'L%', out['all']['L_share'])
print('L:S', out['ratio_L_S'], 'L:(M+S)', out['ratio_L_MS'], 'L:остальные', out['ratio_L_rest'])
print('доля L от всех карт', out['share_all_L'], '% ; S', out['share_all_S'], '%')
for k in ('base', 'halloween', 'choco', 'prestige0', 'prestige_hi', 'alts', 'originals'):
    print(k, out[k])
print('S:', out['small_list'])
print('M:', out['medium_list'])
print('C:', out['hidden_list'])

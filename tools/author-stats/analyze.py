# tools/author-stats/analyze.py — считает статистику «автора» по данным игры
import json, os, re, collections, statistics as st

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
d = json.load(open(os.path.join(ROOT, 'tools/author-stats/game-data.json')))
img = {x['id']: x for x in json.load(open(os.path.join(ROOT, 'tools/author-stats/image-stats.json')))}
r = d['rarities']
ru = d['locales']['ru']['cards']
en = d['locales']['en']['cards']
out = {}

# ---------- базовое ----------
def ev(x): return (x.get('availability') or {}).get('eventId')
cards = []
for x in r:
    c = ru[x['id']]
    cards.append({
        'id': x['id'], 'name': c['cardName'], 'tier': c['name'], 'desc': c['description'],
        'tierEn': en[x['id']]['name'], 'nameEn': en[x['id']]['cardName'], 'descEn': en[x['id']]['description'],
        'p': x['probabilityBase'], 'inv': 1 / x['probabilityBase'] if x['probabilityBase'] else 0,
        'prestige': x.get('minPrestige', 0), 'event': ev(x),
        'dup': x.get('currencyOnDuplicate', 0),
        'parent': x.get('displayParentId'), 'image': x['card']['image'],
        'eff': 'mechanicalEffect' in x, 'pass': 'passiveEffect' in x,
        'rollable': x.get('rollable', True), 'css': x['cssClass']
    })
out['n_cards'] = len(cards)
out['n_rollable'] = sum(1 for c in cards if c['rollable'])
out['n_event'] = sum(1 for c in cards if c['event'])
out['events'] = dict(collections.Counter(c['event'] for c in cards if c['event']))
out['n_alts'] = sum(1 for c in cards if c['parent'])
out['n_families'] = len({c['parent'] for c in cards if c['parent']})
out['n_effects'] = sum(1 for c in cards if c['eff'])
out['n_passives'] = sum(1 for c in cards if c['pass'])
out['n_prestige_gated'] = sum(1 for c in cards if c['prestige'] > 0)
out['prestige_hist'] = dict(collections.Counter(c['prestige'] for c in cards))

# ---------- вероятности ----------
inv = [c['inv'] for c in cards]
out['inv_max'] = max(inv); out['inv_min'] = min(inv); out['inv_median'] = st.median(inv)
out['p_sum'] = sum(c['p'] for c in cards)
# «эстетичные» шансы: не круглые и с повторами цифр
def aesthetic(n):
    s = str(int(round(n)))
    if len(s) < 3: return False
    return (len(set(s)) <= 3) or (s in ('777', '666')) or re.match(r'^(\d)\1+$', s)
out['aesthetic_count'] = sum(1 for c in cards if aesthetic(c['inv']))
out['aesthetic_list'] = [(c['name'], int(round(c['inv']))) for c in cards if aesthetic(c['inv']) and c['inv'] > 100]
# сколько карт с шансом хуже 1 на миллион / 10 млн / 100 млн
for lim in (1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9):
    out[f'rarer_than_1e{int(__import__("math").log10(lim))}'] = sum(1 for v in inv if v >= lim)

# ---------- экономика дублей ----------
ratios = [c['dup'] * c['inv'] for c in cards if c['p'] > 0]
out['dup_ratio_median'] = round(st.median(ratios), 2)
out['dup_ratio_min'] = round(min(ratios), 2); out['dup_ratio_max'] = round(max(ratios), 2)

# ---------- тексты ----------
descs = [c['desc'] for c in cards]
en_descs = [c['descEn'] for c in cards]
words = lambda s: re.findall(r"[А-Яа-яЁёA-Za-z0-9'’@%~_\-]+", s)
lens = [len(w) for w in map(words, descs)]
chars = [len(x) for x in descs]
out['desc_chars_total'] = sum(chars)
out['desc_chars_mean'] = round(st.mean(chars), 1)
out['desc_chars_median'] = st.median(chars)
out['desc_words_mean'] = round(st.mean(lens), 1)
out['desc_words_total'] = sum(lens)
out['desc_shortest'] = min(zip(chars, [c['name'] for c in cards]))
out['desc_longest'] = max(zip(chars, [c['name'] for c in cards]))
out['desc_top5_longest'] = sorted([(len(c['desc']), c['name']) for c in cards], reverse=True)[:5]
out['desc_top5_shortest'] = sorted([(len(c['desc']), c['name']) for c in cards])[:5]

punc = {
    'восклицаний !': sum(c['desc'].count('!') for c in cards),
    'вопросов ?': sum(c['desc'].count('?') for c in cards),
    'многоточий ...': sum(len(re.findall(r'\.\.\.', c['desc'])) for c in cards),
    'тильд ~': sum(c['desc'].count('~') for c in cards),
    'смайликов )': sum(c['desc'].count(')') + c['desc'].count('(') for c in cards),
    'двоеточий :': sum(c['desc'].count(':') for c in cards),
    'кавычек «»/"': sum(c['desc'].count('«') + c['desc'].count('"') + c['desc'].count("'") for c in cards),
    'дефис-тире': sum(c['desc'].count('—') for c in cards),
    'CAPS-слов': sum(len([w for w in c['desc'].split() if len(w) >= 3 and w.upper() == w and re.search('[А-ЯA-Z]', w)]) for c in cards),
}
out['punc'] = punc
out['desc_with_bang'] = sum(1 for c in descd if False) if False else sum(1 for c in cards if '!' in c['desc'])
out['desc_with_ellipsis'] = sum(1 for c in cards if '...' in c['desc'])
out['desc_with_tilde'] = sum(1 for c in cards if '~' in c['desc'])
out['desc_with_paren'] = sum(1 for c in cards if '(' in c['desc'])
out['desc_with_quote'] = sum(1 for c in cards if '«' in c['desc'] or '"' in c['desc'])
out['desc_english_tokens'] = sum(len(re.findall(r'[A-Za-z]{2,}', c['desc'])) for c in cards)
out['english_words'] = collections.Counter(w.lower() for c in cards for w in re.findall(r'[A-Za-z]{2,}', c['desc'])).most_common(25)
# второе лицо
you = re.compile(r'\b(ты|тебя|тебе|твой|твоя|твое|твоё|твои|твоего|твоей|тобой|тобою|тебя|себе)\b', re.I)
you_hits = {c['name']: len(you.findall(c['desc'])) for c in cards}
out['you_total'] = sum(you_hits.values())
out['you_cards'] = sum(1 for v in you_hits.values() if v > 0)
out['you_share'] = round(100 * out['you_cards'] / len(cards), 1)
# «ты»-плотность на 100 слов
out['you_per_100w'] = round(out['you_total'] / out['desc_words_total'] * 100, 1)

# частотные слова (без стоп-слов)
stop = set('и в во не что он на я с со как а то все она так его но да ты к у же вы за бы по только ее мне было вот от меня еще нет о из ему теперь когда даже ну вдруг ли если уже или ни быть был него до вас нибудь опять уж вам ведь там потом себя ничего ей может они тут где есть надо ней для мы тебя их чем была сам чтоб без будто чего раз тоже себе под будет ж тогда кто этот того потому этого какой совсем ним здесь этом один почти мой тем чтобы нее сейчас были куда зачем всех никогда можно при наконец два об другой хоть после над больше тот через эти нас про всего них какая много разве три эту моя впрочем хорошо свою этой перед иногда лучше чуть том нельзя такой им более всегда конечно всю между это как же ещё её оно свой свои своя твой твоя твоё твои тебе тебя тобой тут эта эти этих тех той тою кое кто-то что-то как-то всё все всех свои очень просто даже такой такая такие'.split())
freq = collections.Counter()
for c in cards:
    for w in words(c['desc']):
        w = w.lower()
        if len(w) < 3 or w in stop: continue
        freq[w] += 1
out['top_words'] = freq.most_common(40)
out['hapax'] = sum(1 for w, n in freq.items() if n == 1)
out['vocab'] = len(freq)

# ---------- тропы ----------
tropes = {
    'эльфы/полуэльфы': r'эльф',
    'мотиё/кицунэ/ушки': r'лисиц|лисичк|кошк|кошач|фенек|ушко|ушк|хвост|мотил|мотыл|акул|кролик|лягушк|гоблин|дроу|мотыльк',
    'демоны/вампиры': r'демон|дьявол|дампир|вампир|адск|преисподн|ад[уе]\b',
    'смерть/хоррор': r'смерт|кров|мясник|маньяк|убийц|ужас|кошмар|призрак|дух[а-я]* |безголов|слендер|труп|пожира|зловещ',
    'богини/мифы': r'богин|бог[а-я]*\b|архонт|олимп|зевс|анубис|яга|леши|домов|царевн|дионис|крампус|всадниц|небожител|сущност',
    'наука/химия': r'натри|хлор|уран|углерод|вольфрам|обсидиан|графит|угол|алмаз|магм|лав[аоу]|соль|солён|солен|реакц|молекул|давлен|энерг',
    'оружие': r'меч|катан|арбалет|нож|бит[аоу]|бензопил|пушк|клинок|коса|копь|пистолет|дробовик|катана',
    'одежда/костюмы': r'костюм|наряд|латекс|платье|корсет|бель[её]|коспле|корона|горничн|броня|брон[яи]',
    'интернет-мемы': r'мем|прикол|гипнодэнс|gyatt|rizz|brainrot|tuca|донать|депать|кринж|вайб|база\b',
}
out['tropes'] = {}
for k, pat in tropes.items():
    hit = [c['name'] for c in cards if re.search(pat, c['desc'], re.I)]
    out['tropes'][k] = (len(hit), hit)

# ---------- код ----------
code = {}
for f in ['index.html', 'css/style.css'] + ['js/' + x for x in sorted(os.listdir(os.path.join(ROOT, 'js'))) if x.endswith('.js')] + ['js/locales/ru.js', 'js/locales/en.js']:
    s = open(os.path.join(ROOT, f), encoding='utf-8').read()
    lines = s.split('\n')
    code[f] = {'lines': len(lines), 'bytes': len(s.encode())}
out['code'] = code
out['code_lines_total'] = sum(v['lines'] for v in code.values())
alljs = ''.join(open(os.path.join(ROOT, f), encoding='utf-8').read() + '\n' for f in code if f.endswith('.js'))
out['js_counts'] = {p: alljs.count(p) for p in ['console.log', 'console.warn', 'console.error', 'gsap', 'Math.random', 'innerHTML', 'setTimeout', 'localStorage', 'PIXI']}
out['ru_comments'] = sum(1 for l in alljs.split('\n') if re.match(r'^\s*//', l) and re.search('[а-яА-Я]', l))
out['en_comments'] = sum(1 for l in alljs.split('\n') if re.match(r'^\s*//', l) and not re.search('[а-яА-Я]', l))
out['ru_keys'] = len(re.findall(r'^\s{8}[a-zA-Z_0-9]+:', open(os.path.join(ROOT, 'js/locales/ru.js'), encoding='utf-8').read(), re.M))
out['achievements'] = len(d['achievements'] or {})
out['collections'] = len(d['collections'] or {})
out['recipes'] = len(d['crafting'] or [])
out['materials'] = len(d['materials'] or {})
shop = d['shop'] or {}
out['shop'] = {k: len(v) for k, v in shop.items()}
out['material_drop_sources'] = len(d['materialDrops'] or {})

# ---------- картинки ----------
fams = collections.Counter(v['hue_family'] for v in img.values())
out['hue_families'] = dict(fams.most_common())
out['img_val_mean'] = round(st.mean([v['val'] for v in img.values()]), 1)
out['img_sat_mean'] = round(st.mean([v['sat'] for v in img.values()]), 1)
out['img_dark_mean'] = round(st.mean([v['dark_frac'] for v in img.values()]), 1)
out['img_bytes_total'] = sum(v['bytes'] for v in img.values())
out['img_dims'] = dict(collections.Counter(f"{v['w']}x{v['h']}" for v in img.values()).most_common())
out['darkest'] = sorted(((v['val'], c['name']) for c in cards for v in [img[c['id']]]) )[:5]
out['brightest'] = sorted(((v['val'], c['name']) for c in cards for v in [img[c['id']]]) )[-5:]
# редкость x яркость
for tier in ['garbage', 'common', 'rare', 'epic', 'legendary', 'mythic']:
    vals = [img[c['id']]['val'] for c in cards if c['id'] == tier]
    if vals: out.setdefault('val_by_tier', {})[tier] = vals[0]

json.dump(out, open(os.path.join(ROOT, 'tools/author-stats/stats.json'), 'w'), ensure_ascii=False, indent=1)
print(json.dumps({k: v for k, v in out.items() if k not in ('tropes', 'code')}, ensure_ascii=False, indent=1)[:8000])
print('--- TROPES ---')
for k, (n, hit) in out['tropes'].items():
    print(k, n, hit[:12])

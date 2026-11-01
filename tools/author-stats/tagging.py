# tools/author-stats/tagging.py — ручная разметка тропов по 178 картам
import json, os, collections

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
d = json.load(open(os.path.join(ROOT, 'tools/author-stats/game-data.json')))
ru = d['locales']['ru']['cards']
ids = [x['id'] for x in d['rarities']]

# --- отсылки к франшизам / внешним источникам ---
REFS = {
    'Berserk': ['berserk', 'berserk_alt_1'],
    'Bleach': ['bleached', 'aizen', 'aizen_traitor'],
    'Jujutsu Kaisen': ['gojo', 'gojo_alt'],
    'Genshin Impact': ['hween_furina'],
    'JoJo': ['timestop', 'gyro'],
    'Touhou': ['timestop_alt_1'],
    'Naruto': ['naruko'],
    'Dragon Ball': ['kefla'],
    'Undertale': ['maternal', 'alt_maternal'],
    'Hollow Knight': ['hornet'],
    'Elden Ring': ['marika'],
    'Hazbin Hotel': ['alastor'],
    'Devil May Cry': ['smokinsexystyle', 'sss_dt'],
    'Chainsaw Man': ['devil', 'altDevil'],
    'Tokyo Revengers': ['unbound', 'unbound_alt_1'],
    'Hellsing': ['alt_mythic'],
    'Mortal Kombat': ['jade'],
    'Vocaloid': ['kasane_teto'],
    'Хоррор-кино/крипипаста (Звонок, Слендер, Джефф, Крик)':
        ['hween_sadako', 'hween_slender', 'hween_jeff', 'hween_ghostface'],
    'Славянский фольклор': ['russian', 'russian_alt_ussr', 'russian_alt_usa',
                            'leshy', 'domovoi', 'yaga', 'frog_princess'],
    'Античная мифология': ['zeus', 'dionysia', 'moon', 'anubis', 'orochi'],
    'Четыре всадника Апокалипсиса': ['war', 'famine', 'pestilence', 'death'],
    'Массовая культура/мемы': ['brainrot', 'common_alt_1', 'jackpot', 'afro', 'gamer',
                               'metalhead', 'western', 'bazil'],
}
# «мем-отсылки» отдельно (интернет-сленг, а не франшизы)
MEMES = {
    'brainrot': 'брейнрот-мем «Bub Bub Bub Sahur»',
    'common_alt_1': 'GYATT / rizz-сленг',
    'jackpot': '«TUCA DONKA» — гача-мем',
    'jade': '«CUMALITY» — мем из Mortal Kombat',
    'afro': '«Гипнодэнс»',
    'gamer': 'ник @Nagibator2001',
    'hybrid': 'гяру-архетип',
    'error_alt_1': 'глитч-эстетика',
}

# --- архетипы ---
ARCH = {
    'маньячки и монстры': ['hween_jeff', 'hween_ghostface', 'hween_clown', 'hween_piggy',
                           'hween_nurse', 'hween_tyria', 'hween_scarecrow', 'hween_eyeless',
                           'hween_kuchi', 'hween_thing', 'hween_dullahan', 'shroom', 'chlorine',
                           'berserk', 'drow', 'war', 'famine', 'pestilence', 'death', 'empty_angry'],
    'умершие и нежить': ['hween_sadako', 'hween_ghost', 'hween_eyeless', 'hween_dullahan',
                         'hween_slender', 'hween_bennin', 'death', 'hween_tar', 'midday'],
    'тёти-мамочки': ['alice', 'alt_alice_night' if 'alt_alice_night' in ids else 'alice_alt_night',
                     'maternal', 'alt_maternal', 'yaga', 'krampus'],
    'горничные': ['ellen', 'ellen_alt_student', 'timestop_alt_1'],
    'звериные ушки и хвосты': ['fenek', 'fenek_alt', 'miyabi', 'bazil', 'harpy', 'hornet', 'bee',
                               'ellen', 'easter_bunny', 'tamer', 'frog_princess', 'goblin',
                               'hween_noctua', 'hween_tyria', 'slime', 'ensnared', 'guide'],
    'богини и высшие существа': ['zeus', 'dionysia', 'moon', 'anubis', 'marika', 'death',
                                  'celestial_being', 'gal', 'time_eternal', 'carbon', 'orochi'],
    'боевые девы': ['space_marine', 'war', 'gyro', 'western', 'jade', 'tungsten', 'motivation',
                    'berserk', 'berserk_alt_1', 'drow', 'drow_alt', 'sss_dt', 'unbound',
                    'unbound_alt_1', 'hween_bennin', 'kefla', 'uranium'],
    'химия и физика': ['sodium', 'chlorine', 'salt', 'uranium', 'uranium_alt_1', 'carbon',
                        'graphite', 'coal', 'diamond', 'obsidian', 'lava', 'tungsten', 'moon',
                        'neon', 'platinum', 'gold', 'celestial_being'],
}
ARCH['боевые девы'] = [x for x in ARCH['боевые девы'] if x in ids]

out = {}
covered = set()
tot = 0
for label, lst in REFS.items():
    lst = [x for x in lst if x in ids]
    out.setdefault('refs', {})[label] = lst
    covered |= set(lst)
out['refs_cards'] = len(covered)
out['ref_cards_share'] = round(100 * len(covered) / len(ids), 1)
arch_out = {}
for label, lst in ARCH.items():
    lst = sorted(set(x for x in lst if x in ids))
    arch_out[label] = lst
out['arch'] = arch_out
out['memes'] = {k: v for k, v in MEMES.items() if k in ids}
json.dump(out, open(os.path.join(ROOT, 'tools/author-stats/tags.json'), 'w'),
          ensure_ascii=False, indent=1)
for label, lst in out['refs'].items():
    print(f"{label}: {len(lst)} — {[ru[i]['cardName'] for i in lst]}")
print('всего карт с внешней отсылкой:', out['refs_cards'], f"({out['ref_cards_share']}%)")
for label, lst in arch_out.items():
    print(f"{label}: {len(lst)} — {[ru[i]['cardName'] for i in lst]}")

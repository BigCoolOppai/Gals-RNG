# tools/author-stats — статистика автора по данным игры

Набор скриптов, из которых собирается отчёт **[../../docs/AUTHOR-STATS.md](../../docs/AUTHOR-STATS.md)**
и его HTML-версия `docs/AUTHOR-STATS.html` (самодостаточный файл, графики вшиты в base64).

Пайплайн (нужны Node 18+ и Python 3 с `pillow`, `matplotlib`):

```bash
node tools/author-stats/extract.js                    # -> game-data.json (карты, локали, ачивки, крафт)
python3 tools/author-stats/image-analysis.py           # -> image-stats.json (яркость/палитра 178 артов)
python3 tools/author-stats/analyze.py                  # -> stats.json (числа: редкости, тексты, код)
python3 tools/author-stats/tagging.py                  # -> tags.json (ручная разметка отсылок и архетипов)
python3 tools/author-stats/charts.py                   # -> charts/*.png
```

`game-data.json` — промежуточный дамп репозитория, он в `.gitignore`; всё остальное
(`stats.json`, `tags.json`, `image-stats.json`, `charts/`) коммитится, чтобы отчёт
собирался без запуска скриптов.

Что важно про допущения:

* **архетипы и отсылки** размечены вручную в `tagging.py` — это разметка, а не формула;
* **палитра** считается по усреднённой яркости/насыщенности кадра, а не по цвету фона;
* **тексты** берутся из русской локализации (`js/locales/ru.js`);
* **шансы** — из `probabilityBase` в `js/cards.js`, включая 3 невыпадающие крафтовые карты
  (в отчёте они отделены: «178 карт, из них роллятся 175»).

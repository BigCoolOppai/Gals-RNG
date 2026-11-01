// tools/author-stats/extract.js
// Загружает игровые данные (карты, локали, достижения, крафт) в Node и складывает их в JSON,
// чтобы потом считать по ним статистику автора.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '../..');
const files = ['js/cards.js', 'js/achievements.js', 'js/crafting.js', 'js/locales/ru.js', 'js/locales/en.js'];

const sandbox = { console };
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
const ctx = vm.createContext(sandbox);

for (const f of files) {
  const code = fs.readFileSync(path.join(ROOT, f), 'utf8');
  try {
    vm.runInContext(code, ctx, { filename: f });
  } catch (e) {
    // некоторые файлы могут ссылаться на браузерные объекты — это нормально
    console.error('warn:', f, e.message);
  }
}

const json = vm.runInContext(`JSON.stringify({
  rarities: window.RARITIES_DATA,
  locales: window.locales,
  achievements: typeof ACHIEVEMENTS_DATA !== 'undefined' ? ACHIEVEMENTS_DATA : null,
  collections: typeof COLLECTIONS_DATA !== 'undefined' ? COLLECTIONS_DATA : null,
  crafting: window.CRAFT_RECIPES,
  materials: window.MATERIALS_DATA,
  materialDrops: window.MATERIAL_DROPS,
  shop: typeof SHOP_DATA !== 'undefined' ? SHOP_DATA : null
}, (k, v) => typeof v === 'function' ? '[fn]' : v)`, ctx);
const out = JSON.parse(json);

const dest = path.join(__dirname, 'game-data.json');
fs.writeFileSync(dest, JSON.stringify(out, null, 1));
console.log('rarities:', out.rarities && out.rarities.length);
console.log('locales ru cards:', Object.keys((out.locales.ru || {}).cards || {}).length);
console.log('locales en cards:', Object.keys((out.locales.en || {}).cards || {}).length);
console.log('achievements:', out.achievements && Object.keys(out.achievements).length);
console.log('collections:', out.collections && Object.keys(out.collections).length);
console.log('recipes:', out.crafting && out.crafting.length);
console.log('materials:', out.materials && Object.keys(out.materials).length);
console.log('->', dest);

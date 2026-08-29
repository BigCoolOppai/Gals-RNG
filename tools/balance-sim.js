#!/usr/bin/env node
/**
 * Gals-RNG — балансовый симулятор и smoke-тесты.
 *
 * Запуск:  node tools/balance-sim.js
 *
 * Что делает:
 *  1. Загружает настоящие игровые файлы (cards/events/crafting/achievements/saveManager/game/ui/visualEffects)
 *     в Node с минимальными DOM-заглушками.
 *  2. Проверяет много-ивентную систему (0.2.10): несколько ивентов одновременно,
 *     доступность лимиток, бусты материалов (включая бусты из магазина).
 *  3. Гоняет REАЛЬНЫЙ Game.performRoll и показывает распределение дропа.
 *  4. Симулирует время до первого перерождения (1 000 000 💎).
 *  5. Показывает статус ивентов по текущей дате.
 *
 * Выход: 0 — все проверки прошли, 1 — есть провал.
 */
'use strict';
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// 1) Минимальные заглушки DOM/окружения
// ---------------------------------------------------------------------------
global.window = global;

const memStorage = {};
global.localStorage = {
    getItem: k => (k in memStorage ? memStorage[k] : null),
    setItem: (k, v) => { memStorage[k] = String(v); },
    removeItem: k => { delete memStorage[k]; }
};

function elStub() {
    return {
        style: {}, dataset: {},
        classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
        addEventListener() {}, setAttribute() {}, removeAttribute() {},
        appendChild() {}, insertAdjacentElement() {}, remove() {},
        querySelectorAll() { return []; },
        querySelector() { return null; },
        getAttribute() { return null; },
        innerHTML: '', textContent: '', value: '', checked: false, disabled: false
    };
}
global.document = {
    getElementById: () => elStub(),
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => elStub(),
    addEventListener() {},
    head: elStub(),
    body: elStub(),
    hidden: false
};
global.addEventListener = () => {};
try {
    Object.defineProperty(global, 'navigator', {
        value: { clipboard: { writeText: async () => {} } }, configurable: true
    });
} catch (e) { /* node >=21 уже даёт navigator — оставляем его */ }
global.bootstrap = {
    Modal: class { constructor() {} show() {} hide() {} },
    Tooltip: class { constructor() {} },
    Alert: { getOrCreateInstance: () => ({ close() {} }) }
};
// Локализацию не грузим (нужен DOM) — L.get возвращает ключ как есть.
global.L = { get: k => k, getCurrentLanguage: () => 'ru', init: async () => {}, setLanguage() {} };
global.fetch = async () => { throw new Error('offline (sim)'); };
global.requestAnimationFrame = cb => setTimeout(cb, 16);

// ---------------------------------------------------------------------------
// 2) Загрузка игровых файлов в ОДНУ eval-среду (как классические <script>)
// ---------------------------------------------------------------------------
const ROOT = path.join(__dirname, '..');
const files = ['js/cards.js', 'js/events.js', 'js/achievements.js', 'js/crafting.js', 'js/saveManager.js', 'js/visualEffects.js', 'js/game.js', 'js/ui.js'];
const bundle = files.map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n;\n');
(0, eval)(`
${bundle}
globalThis.__T = { Game, SaveManager, RARITIES_DATA, EVENTS_DATA };
`);
const T = global.__T;

// ---------------------------------------------------------------------------
// 3) Тестовая утилита
// ---------------------------------------------------------------------------
let passed = 0, failed = 0;
function check(name, cond, extra = '') {
    if (cond) { passed++; console.log(`  ✅ ${name}${extra ? ` (${extra})` : ''}`); }
    else { failed++; console.log(`  ❌ ${name}${extra ? ` (${extra})` : ''}`); }
}
const close = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;

console.log('\n=== 1) Много-ивентная система (0.2.10) ===');
T.Game.init();
const pd = T.Game.getPlayerData();

const iso = ms => new Date(ms).toISOString();
const now = Date.now();
const win = { startDate: iso(now - 1000), endDate: iso(now + 3600e3) };

// Два ивента с ПЕРЕСЕКАЮЩИМСЯ периодом (как workshop_rush + workshop_rush_variant_boost)
T.EVENTS_DATA.length = 0;
T.EVENTS_DATA.push(
    { id: 'ev_mat', nameKey: 'ev_mat.name', descriptionKey: 'ev_mat.description', ...win, effect: { type: 'material_drop_multiplier', multiplier: 1.5 } },
    { id: 'ev_var', nameKey: 'ev_var.name', descriptionKey: 'ev_var.description', ...win, effect: { type: 'variant_chance_multiplier', multiplier: 1.3 } }
);

check('getActiveEvents() видит оба ивента', T.Game.getActiveEvents().length === 2, `получено ${T.Game.getActiveEvents().length}`);
check('буст мутаций от второго ивента применяется', close(T.Game.getVariantChanceBonusGlobal(), 0.3), `bonus=${T.Game.getVariantChanceBonusGlobal()}`);
check('буст материалов от ивента применяется', close(T.Game.getMaterialDropBonusPercent(), 0.5), `bonus=${T.Game.getMaterialDropBonusPercent()}`);

// Буст из магазина СУММИРУЕТСЯ с ивентом (раньше мёртвый дубль функции игнорировал бусты)
pd.activeBoosts.push({ id: 'sim_boost', type: 'material_drop_multiplier', multiplier: 1.5 });
check('буст материалов из магазина стакается с ивентом', close(T.Game.getMaterialDropBonusPercent(), 1.0), `bonus=${T.Game.getMaterialDropBonusPercent()}`);
pd.activeBoosts.length = 0;

// Лимитка из ВТОРОГО ивента доступна к роллу (раньше — нет, ивент «затенялся» первым)
const fakeLimited = { id: 'sim_limited', probabilityBase: 0.001, availability: { type: 'event', eventId: 'ev_var' } };
check('лимитка второго ивента доступна к роллу', T.Game.isCardAvailableNow(fakeLimited, pd) === true);

// Глобальный множитель удачи попадает в «Состав удачи»
T.EVENTS_DATA.length = 0;
T.EVENTS_DATA.push({ id: 'ev_luck', nameKey: 'x', descriptionKey: 'y', ...win, effect: { type: 'global_luck_multiplier', multiplier: 2 } });
const lb = T.Game.getLuckBreakdown();
check('Состав удачи учитывает ивент-множитель ×2', lb.eventMultiplier === 2 && close(lb.total, 2.0), `total=${lb.total}`);

// ---------------------------------------------------------------------------
console.log('\n=== 2) Распределение дропа (реальный Game.performRoll, fresh-игрок, prestige 0) ===');
T.EVENTS_DATA.length = 0; // ивентов нет (как сейчас в проде)
const N = 50000;
const dist = {};
let rollOk = true;
for (let i = 0; i < N; i++) {
    const res = T.Game.performRoll();
    if (!res) { rollOk = false; break; }
    dist[res.rarity.id] = (dist[res.rarity.id] || 0) + 1;
}
check('performRoll всегда возвращает результат', rollOk);
const garbagePct = ((dist.garbage || 0) / N) * 100;
let classic = 0;
['common', 'rare', 'epic', 'legendary', 'mythic'].forEach(id => classic += dist[id] || 0);
const classicPct = (classic / N) * 100;
const rarerPct = 100 - garbagePct - classicPct;
console.log(`  🎲 ${N.toLocaleString()} роллов @ luck 1.0`);
console.log(`     мусор: ${garbagePct.toFixed(1)}%   |   common–mythic: ${classicPct.toFixed(1)}%   |   реже мифика: ${rarerPct.toFixed(1)}%`);
check('мусор в разумном диапазоне (45–65%)', garbagePct > 45 && garbagePct < 65, `${garbagePct.toFixed(1)}%`);
check('мифик+ всё же выпадают', (dist.mythic || 0) > 0 && (dist.legendary || 0) > 0, `legendary=${dist.legendary || 0}, mythic=${dist.mythic || 0}`);

// ---------------------------------------------------------------------------
console.log('\n=== 3) Время до первого перерождения (1 000 000 💎, luck 1.0, prestige 0) ===');
const available = T.RARITIES_DATA.filter(r =>
    (r.minPrestige || 0) <= 0 && r.rollable !== false &&
    r.id !== 'diamond' && r.id !== 'salt' && !(r.availability && r.availability.type === 'event')
);
function timeToRebirth(rollsPerSecond, maxRolls = 2000000) {
    const owned = new Set();
    let currency = 0, rolls = 0;
    while (rolls < maxRolls) {
        rolls++;
        for (const r of available) {
            const odds = r.probabilityBase / (1 - r.probabilityBase);
            if (Math.random() < odds / (1 + odds)) {
                if (!owned.has(r.id)) owned.add(r.id);
                else currency += r.currencyOnDuplicate || 0;
                break;
            }
        }
        if (currency >= 1000000) break;
    }
    return { rolls, currency, hours: rolls / rollsPerSecond / 3600, done: currency >= 1000000 };
}
const base = timeToRebirth(0.5); // 1 ролл / 2 сек (базовый авторолл)
const fast = timeToRebirth(4);   // multi x5 + fast roll
console.log(`  базовый авторолл (2 с/ролл):   ~${base.hours.toFixed(0)} ч  (${base.rolls.toLocaleString()} роллов)`);
console.log(`  x5 + fast roll (4 ролла/сек):  ~${fast.hours.toFixed(1)} ч  (${fast.rolls.toLocaleString()} роллов)`);
check('первый ребирт достижим в симуляции', base.done && fast.done);

// ---------------------------------------------------------------------------
console.log('\n=== 4) Статус ивентов по текущей дате ===');
// Перечитываем оригинальный список (мы мутировали EVENTS_DATA выше)
const eventsSrc = fs.readFileSync(path.join(ROOT, 'js/events.js'), 'utf8');
(0, eval)(`${eventsSrc.replace('const EVENTS_DATA', 'var EVENTS_DATA')}
globalThis.__EV = EVENTS_DATA;`);
for (const ev of global.__EV) {
    const start = ev.startDate ? new Date(ev.startDate).getTime() : -Infinity;
    const end = ev.endDate ? new Date(ev.endDate).getTime() : Infinity;
    const status = now >= start && now <= end ? '🟢 АКТИВЕН' : (end < now ? '⚪ завершён' : '🔵 запланирован');
    console.log(`  ${status}  ${ev.id}  [${ev.startDate || '—'} → ${ev.endDate || '—'}]`);
}
const activeNow = global.__EV.filter(ev => {
    const start = ev.startDate ? new Date(ev.startDate).getTime() : -Infinity;
    const end = ev.endDate ? new Date(ev.endDate).getTime() : Infinity;
    return now >= start && now <= end;
});
console.log(`  → активных ивентов сейчас: ${activeNow.length}`);
if (activeNow.length === 0) {
    console.log('  ⚠️  Игровое пространство в простое: лимитки не выпадают, баннер пуст.');
    console.log('      Нужны расписание/ретры ивентов (см. docs/REVIEW-0.2.9.md, Этап 4).');
}

// ---------------------------------------------------------------------------
console.log(`\nИтог: ${passed} прошло, ${failed} упало.`);
process.exit(failed > 0 ? 1 : 0);

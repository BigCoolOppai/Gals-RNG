#!/usr/bin/env node
/**
 * Gals-RNG — симуляция экономики: время до первого перерождения
 *
 * Стратегия игрока во всех сценариях — задумка разработчика:
 *   «СКОРОСТЬ ПЕРВОЙ» (fast roll + multi x5 берём первыми), дальше перманенты,
 *   зелья (титанический буст почти постоянно), базовый Lucky Roll ×2 / 11 роллов.
 *
 * Рычаги (лечверы) для A/B:
 *   garbageDup: 1        — мусор-дубль даёт 1 💎 (включено в игре с 0.2.12)
 *   classicDupX: 2       — дубли классики ×2 (common/rare/epic/legendary)
 *   rebirthCost: 250000  — стоимость ПЕРВОГО престижа (вместо 1 000 000)
 *   starterPotion: true  — стартовое бесплатное зелье (+1.0 удача на 600 c)
 *   cheapStart: true     — талисман 150 (вместо 300) + ядро удачи с базой 3000 (вместо 6500)
 *
 * Запуск: node tools/econ-sim.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
global.window = global;
const ROOT = path.join(__dirname, '..');
eval(fs.readFileSync(path.join(ROOT, 'js/cards.js'), 'utf8'));

// Пул карт для нового игрока (prestige 0)
const pool = RARITIES_DATA.filter(r =>
    (r.minPrestige || 0) <= 0 && r.rollable !== false &&
    r.id !== 'diamond' && r.id !== 'salt' && r.id !== 'garbage' &&
    !(r.availability && r.availability.type === 'event'));
// «Донные» редкости — та же логика, что getBottomFeederRaritiesFromRarities в cards.js
const bottom = new Set(RARITIES_DATA
    .filter(r => r.id !== 'garbage' && r.probabilityBase >= 1 / 1024 && r.id !== 'jackpot')
    .sort((a, b) => b.probabilityBase - a.probabilityBase)
    .slice(0, 12)
    .map(r => r.id));
const CLASSIC = new Set(['common', 'rare', 'epic', 'legendary']);

function rollCard(luck) {
    for (const r of pool) {
        const o = r.probabilityBase / (1 - r.probabilityBase);
        if (Math.random() < (o * luck) / (1 + o * luck)) return r;
    }
    return null; // garbage
}

// Ядро удачи — формула из game.js
function coreBonus(level) {
    let total = 0, rem = level, tier = 0;
    while (rem > 0) { const n = Math.min(rem, 10); total += n * (0.01 + tier * 0.005); rem -= n; tier++; }
    return total;
}
const coreCost = (level, cfg) => Math.floor((cfg.cheapStart ? 3000 : 6500) * Math.pow(1.15, level));

const SPEED_FIRST = ['fast', 'multi5', 'talisman', 'goldenTicket', 'ring', 'artifact', 'hof', 'pendant', 'abyss', 'greed', 'empowered'];
const COSTS = {
    goldenTicket: 550, ring: 750, artifact: 1800, hof: 5000, multi5: 7500,
    pendant: 20000, abyss: 25000, greed: 50500, empowered: 120000
};
// fast и talisman зависят от рычага cheapStart
const costOf = (id, cfg) =>
    id === 'fast' ? 1000 :
    id === 'talisman' ? (cfg.cheapStart ? 150 : 300) : COSTS[id];

/**
 * @param {object} cfg — рычаги (см. заголовок)
 */
function simulate(cfg, trials = 7) {
    const rebirthCost = cfg.rebirthCost || 1000000;
    const garbageDup = cfg.garbageDup || 0;
    const classicDupX = cfg.classicDupX || 1;
    const results = [];
    for (let tr = 0; tr < trials; tr++) {
        let currency = 0, t = 0, guard = 0;
        const owned = new Set();
        const bought = new Set();
        let coreLvl = 0, dupBonus = 0;
        let fast = false, has5 = false, empowered = false;
        let misStacks = 0, abyStacks = 0;
        let boostLeft = cfg.starterPotion ? 600 : 0; // стартовое зелье
        let luckyCounter = 0;
        let tFast = null, tMulti = null, t1000 = null;
        let garbageSeen = false;

        while (currency < rebirthCost && guard++ < 8e7) {
            const cycleLen = (fast ? 0.75 : 1.5) + 0.5;
            const rolls = has5 ? 5 : 1;

            for (let i = 0; i < rolls; i++) {
                let luck = 1
                    + (bought.has('talisman') ? 0.05 : 0) + (bought.has('ring') ? 0.1 : 0)
                    + (bought.has('artifact') ? 0.15 : 0) + (bought.has('pendant') ? 0.35 : 0)
                    + coreBonus(coreLvl)
                    + (bought.has('hof') ? Math.min(misStacks, 10) * 0.05 : 0)
                    + (bought.has('abyss') ? Math.min(abyStacks, 15) * 0.05 : 0)
                    + (boostLeft > 0 ? 1.0 : 0);
                luckyCounter++;
                if (luckyCounter >= 11) { luckyCounter = 0; luck *= empowered ? 2.5 : 2.0; }

                const r = rollCard(luck);
                const isLow = !r || r.id === 'garbage' || r.id === 'common' || r.id === 'rare';
                if (bought.has('hof')) misStacks = isLow ? Math.min(misStacks + 1, 10) : 0;
                if (bought.has('abyss')) abyStacks = (r && bottom.has(r.id)) ? Math.min(abyStacks + 1, 15) : 0;

                if (r) {
                    if (!owned.has(r.id)) owned.add(r.id);
                    else {
                        let dup = r.currencyOnDuplicate || 0;
                        if (CLASSIC.has(r.id)) dup *= classicDupX;
                        currency += Math.ceil(dup * (1 + dupBonus));
                    }
                } else if (garbageDup > 0) {
                    if (garbageSeen) currency += Math.ceil(garbageDup * (1 + dupBonus));
                    else garbageSeen = true;
                }
            }
            t += cycleLen;
            if (t1000 === null && currency >= 1000) t1000 = t;
            if (boostLeft > 0) boostLeft = Math.max(0, boostLeft - cycleLen);

            for (const id of SPEED_FIRST) {
                if (bought.has(id) || currency < costOf(id, cfg)) continue;
                currency -= costOf(id, cfg);
                bought.add(id);
                if (id === 'goldenTicket') dupBonus += 0.10;
                if (id === 'greed') dupBonus += 0.25;
                if (id === 'fast') { fast = true; if (tFast === null) tFast = t; }
                if (id === 'multi5') { has5 = true; if (tMulti === null) tMulti = t; }
                if (id === 'empowered') empowered = true;
            }
            const cc = coreCost(coreLvl, cfg);
            if (currency >= cc && (currency - cc) >= rebirthCost * 0.05) { currency -= cc; coreLvl++; }
            if (boostLeft <= 30 && currency >= 1500) { currency -= 1500; boostLeft = 600; }
        }
        const luckAtEnd = 1
            + (bought.has('talisman') ? 0.05 : 0) + (bought.has('ring') ? 0.1 : 0)
            + (bought.has('artifact') ? 0.15 : 0) + (bought.has('pendant') ? 0.35 : 0)
            + coreBonus(coreLvl);
        results.push({
            hours: t / 3600, luck: luckAtEnd, coreLvl,
            t1000Min: t1000 !== null ? t1000 / 60 : null
        });
    }
    results.sort((a, b) => a.hours - b.hours);
    return results[Math.floor(results.length / 2)];
}

const fmt = (m) => m === null ? '—' : (m >= 60 ? (m / 60).toFixed(1) + ' ч' : Math.round(m) + ' мин');
const BASE = { priority: 'speed', boosts: true, lucky: true }; // задуманный цикл игрока

console.log('\n=== Время до первого перерождения. Игрок: «скорость первая» + зелья (медиана из 7) ===');
const runs = [
    ['«до»: текущая экономика', { ...BASE }],
    ['«до» + мусор = 1 (уже включено в 0.2.12)', { ...BASE, garbageDup: 1 }],
    ['+ дубли классики ×2', { ...BASE, garbageDup: 1, classicDupX: 2 }],
    ['+ первый престиж 250K', { ...BASE, garbageDup: 1, rebirthCost: 250000 }],
    ['+ стартовое зелье', { ...BASE, garbageDup: 1, starterPotion: true }],
    ['+ дешёвый первый тир (талисман 150, ядро 3000)', { ...BASE, garbageDup: 1, cheapStart: true }],
    ['ЯДРО: 250K + дубли классики ×2', { ...BASE, garbageDup: 1, classicDupX: 2, rebirthCost: 250000 }],
    ['ЯДРО + стартовое зелье', { ...BASE, garbageDup: 1, classicDupX: 2, rebirthCost: 250000, starterPotion: true }],
    ['АЛЬТ: 500K + дубли классики ×2 + зелье', { ...BASE, garbageDup: 1, classicDupX: 2, rebirthCost: 500000, starterPotion: true }],
    ['ПОЛНЫЙ ПАКЕТ (все рычаги)', { ...BASE, garbageDup: 1, classicDupX: 2, rebirthCost: 250000, starterPotion: true, cheapStart: true }]
];
for (const [label, cfg] of runs) {
    const r = simulate(cfg);
    console.log(`  ${label}\n      ~${r.hours.toFixed(1)} ч | первые 1000 💎 на ${fmt(r.t1000Min)} | удача к финишу ${r.luck.toFixed(2)} (ядро ур.${r.coreLvl})`);
}
process.exit(0);

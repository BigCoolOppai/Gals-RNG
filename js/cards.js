// js/cards.js

window.RARITIES_DATA = [
    {
        id: "blackhole",
        nameKey: "cards.blackhole.name",
        probabilityBase: 1/9876543, 
        color: "#E65100", // Orange 900 - глубокий, огненный оранжевый
        glowColor: "#ffca28", // Amber 400 - яркое желто-оранжевое свечение
        currencyOnDuplicate: 987654,
        card: {
            name: "FY-3741 alpha", 
            image: "img/cardBlackHole.png",
            descriptionKey: "cards.blackhole.description"
        }
    },
    {
        id: "berserk",
        nameKey: "cards.berserk.name",
        probabilityBase: 1/30000, 
        color: "#c62828", // Red 800 - глубокий красный
        glowColor: "#ff8a80", // Red A100 - огненно-розовое свечение 
        cssClass: "rarity-berserk",
        currencyOnDuplicate: 3000,
        card: {
            name: "Stug", 
            image: "img/cardBerserker.png",
            descriptionKey: "cards.berserk.description"
        }
    },
    {
        id: "bee",
        nameKey: "cards.bee.name", 
        probabilityBase: 1/15000, 
        color: "#ffb300", // Amber 700 - медовый/золотой
        glowColor: "#ffd54f", // Amber 300 - светлое золотое свечение
        cssClass: "rarity-bee",
        currencyOnDuplicate: 1500,
        card: {
            name: "Queen Bee", 
            image: "img/cardQueenBee.png",
            descriptionKey: "cards.bee.description"
        }
    },
    {
        id: "russian",
        nameKey: "cards.russian.name",
        probabilityBase: 1/10000, 
        color: "#B71C1C", // Red 900 - насыщенный клюквенный
        glowColor: "#f5f5f5", // Grey 100 - почти белое свечение
        cssClass: "rarity-russian",
        currencyOnDuplicate: 1000,
        card: {
            name: "Klyukva Medvedeva", 
            image: "img/cardRussian.png",
            descriptionKey: "cards.russian.description"
        }
    },
 // --- НОВАЯ РЕДКОСТЬ: MOTIVATION (Вергилий) ---
    {
        id: "motivation",
        nameKey: "cards.motivation.name",
        probabilityBase: 1/2111, // Пример
        color: "#0d47a1", // Глубокий синий (Blue 900)
        glowColor: "#64b5f6", // Яркий голубой для свечения (Blue 300)
        cssClass: "rarity-motivation",
        currencyOnDuplicate: 211,
        card: {
            name: "Alpha and Omega", // Имя карты, можно конкретизировать
            image: "img/cardMotivation.png",
            descriptionKey: "cards.motivation.description"
        }
    },
    // --- НОВАЯ РЕДКОСТЬ: SMOKINSEXYSTYLE (Данте Ж) ---
    {
        id: "smokinsexystyle", // или sss
        nameKey: "cards.smokinsexystyle.name",
        probabilityBase: 1/1999, // Пример
        color: "#b71c1c", // Глубокий красный (Red 900)
        glowColor: "#ef9a9a", // Светло-красный/розовый для свечения (Red 200)
        cssClass: "rarity-smokinsexystyle", // или rarity-sss
        currencyOnDuplicate: 199,
        card: {
            name: "Subhuman",
            image: "img/cardSmokinSexyStyle.png",
            descriptionKey: "cards.smokinsexystyle.description"
        }
    },
    
    // --- НОВАЯ РЕДКОСТЬ: COSMIC (Темная космическая сущность) ---
    {
        id: "cosmic",
        nameKey: "cards.cosmic.name",
        probabilityBase: 1/1618, // Пример
        color: "#311b92", // Темный индиго/фиолетовый (Indigo 900)
        glowColor: "#7e57c2", // Приглушенный фиолетовый для свечения (Deep Purple 400)
        cssClass: "rarity-cosmic",
        currencyOnDuplicate: 161,
        card: {
            name: "Star Elf",
            image: "img/cardCosmic.png",
            descriptionKey: "cards.cosmic.description"
        }
    },
    // --- НОВАЯ РЕДКОСТЬ: SPACE (Светлая космическая сущность) ---
    {
        id: "space",
        nameKey: "cards.space.name",
        probabilityBase: 1/1042, // Пример
        color: "#0097a7", // Яркий циан/бирюза (Cyan 700)
        glowColor: "#80deea", // Очень светлый циан/бирюза (Cyan 200)
        cssClass: "rarity-space",
        currencyOnDuplicate: 142,
        card: {
            name: "Nebula Weaver",
            image: "img/cardSpace.png",
            descriptionKey: "cards.space.description"
        }
    },
    {
        id: "timestop", // Дио
        nameKey: "cards.timestop.name",
        probabilityBase: 1/1024, // или ваш шанс
        color: "#FBC02D",
        glowColor: "#FFF59D",
        cssClass: "rarity-timestop",
        currencyOnDuplicate: 124, // например
        card: {
            name: "D.I.O.N.A.", // Ваше имя
            image: "img/cardTimestop.png", // Ваш путь
            descriptionKey: "cards.timestop.description"
        }
    },
    {
        id: "jackpot", // Хакари
        nameKey: "cards.jackpot.name",
        probabilityBase: 1/777,
        color: "#ffb300",
        glowColor: "#ffe54c",
        cssClass: "rarity-jackpot",
        currencyOnDuplicate: 77, // например
        card: {
            name: "Hakaria", // Ваше имя
            image: "img/cardJackpot.png", // Ваш путь
            descriptionKey: "cards.jackpot.description"
        }
    },
    {
        id: "devil", // Макима
        nameKey: "cards.devil.name",
        probabilityBase: 1/666,
        color: "#a01c1c",
        glowColor: "#d73a3a",
        cssClass: "rarity-devil",
        currencyOnDuplicate: 66, // например
        card: {
            name: "Makima, Demon of Control", // Ваше имя
            image: "img/cardDevil.png", // Ваш путь
            descriptionKey: "cards.devil.description"
        }
    },
    {
        id: "error",
        nameKey: "cards.error.name",
        probabilityBase: 1/404,
        color: "#ff3d00",
        glowColor: "#ff6e40",
        cssClass: "rarity-error",
        currencyOnDuplicate: 44,
        card: {
            name: "ER-RR_R_DATA",
            image: "img/cardError.png",
            descriptionKey: "cards.error.description"
        }
    },
    {
        id: "uranium",
        nameKey: "cards.uranium.name",
        probabilityBase: 1/238,
        color: "#76ff03",
        glowColor: "#b0ff57",
        cssClass: "rarity-uranium",
        currencyOnDuplicate: 30,
        card: {
            name: "Uranium-chan",
            image: "img/cardUranium.png",
            descriptionKey: "cards.uranium.description"
        }
    },
    {
        id: "unbound",
        nameKey: "cards.unbound.name",
        probabilityBase: 1/64,
        color: "#a958dd",
        glowColor: "#c386ed",
        cssClass: "rarity-unbound",
        currencyOnDuplicate: 20,
        card: {
            name: "Hanma",
            image: "img/cardUnbound.png",
            descriptionKey: "cards.unbound.description"
        }
    },
    {
        id: "mythic",
        nameKey: "cards.mythic.name",
        probabilityBase: 1/32,
        color: "#f44336",
        glowColor: "#ff5252",
        cssClass: "rarity-mythic",
        currencyOnDuplicate: 15,
        card: {
            name: "Carmilla",
            image: "img/cardMythic.png",
            descriptionKey: "cards.mythic.description"
        }
    },
    {
        id: "legendary",
        nameKey: "cards.legendary.name",
        probabilityBase: 1/16,
        color: "#ff9800",
        glowColor: "#ffeb3b",
        cssClass: "rarity-legendary",
        currencyOnDuplicate: 10,
        card: {
            name: "Misa",
            image: "img/cardLegendary.png",
            descriptionKey: "cards.legendary.description"
        }
    },
    {
        id: "epic",
        nameKey: "cards.epic.name",
        probabilityBase: 1/8,
        color: "#9c27b0",
        glowColor: "#ba68c8",
        cssClass: "rarity-epic",
        currencyOnDuplicate: 7,
        card: {
            name: "Gael",
            image: "img/cardEpic.png",
            descriptionKey: "cards.epic.description"
        }
    },
    {
        id: "rare",
        nameKey: "cards.rare.name",
        probabilityBase: 1/4,
        color: "#2196f3",
        glowColor: "#64b5f6",
        cssClass: "rarity-rare",
        currencyOnDuplicate: 5,
        card: {
            name: "Mila",
            image: "img/cardRare.png",
            descriptionKey: "cards.rare.description"
        }
    },
    {
        id: "common",
        nameKey: "cards.common.name",
        probabilityBase: 1/2, // Шанс на обычную, если более редкие не выпали
        color: "#9e9e9e",
        glowColor: "#bdbdbd",
        cssClass: "rarity-common",
        currencyOnDuplicate: 2, // Обычные дубликаты теперь дают немного
        card: {
            name: "Eve",
            image: "img/cardCommon.png",
            descriptionKey: "cards.common.description"
        }
    },
    { // Новая "мусорная" редкость - ГАРАНТИРОВАНА, если ничего другое не выпало
        id: "garbage",
        nameKey: "cards.garbage.name",
        probabilityBase: 1.0, // Эта вероятность будет использоваться только если ВСЕ предыдущие не сработали
        color: "#795548", // Коричневатый, как мусор
        glowColor: "#8d6e63",
        cssClass: "rarity-garbage",
        currencyOnDuplicate: 0, // Мусорные дубликаты ничего не дают
        card: {
            name: "Garbage Idol", // Или что-то подобное
            image: "img/cardGarbage.png", // Убедитесь, что создали это изображение
            descriptionKey: "cards.garbage.description"
        }
    }
];

// Важно: Массив RARITIES_DATA должен быть отсортирован от САМОЙ РЕДКОЙ к САМОЙ ЧАСТОЙ/ФОЛЛБЭК.
// Логика ролла будет это учитывать.

const SHOP_DATA = {
    boosts: [
        { id: "boost_small", nameKey: "shop.boosts.boost_small.name", descriptionKey: "shop.boosts.boost_small.description", cost: 75, durationSeconds: 30, luckBonus: 0.1, type: "luck_boost" },
        { id: "boost_medium", nameKey: "shop.boosts.boost_medium.name", descriptionKey: "shop.boosts.boost_medium.description", cost: 250, durationSeconds: 120, luckBonus: 0.25, type: "luck_boost" },
        { id: "boost_large", nameKey: "shop.boosts.boost_large.name", descriptionKey: "shop.boosts.boost_large.description", cost: 600, durationSeconds: 300, luckBonus: 0.5, type: "luck_boost" },
        { id: "boost_titanic", nameKey: "shop.boosts.boost_titanic.name", descriptionKey: "shop.boosts.boost_titanic.description", cost: 1500, durationSeconds: 600, luckBonus: 1.0, type: "luck_boost" },
    ],
    equipment: [
        { id: "equip_talisman", nameKey: "shop.equipment.equip_talisman.name", descriptionKey: "shop.equipment.equip_talisman.description", cost: 300, luckBonus: 0.05, type: "equipment" },
        { id: "equip_ring", nameKey: "shop.equipment.equip_ring.name", descriptionKey: "shop.equipment.equip_ring.description", cost: 750, luckBonus: 0.1, type: "equipment" },
        { id: "equip_artifact", nameKey: "shop.equipment.equip_artifact.name", descriptionKey: "shop.equipment.equip_artifact.description", cost: 1800, luckBonus: 0.15, type: "equipment" },
        {
            id: "equip_golden_ticket",
            nameKey: "shop.equipment.equip_golden_ticket.name",
            descriptionKey: "shop.equipment.equip_golden_ticket.description",
            cost: 550, // Стоимость можно будет настроить
            type: "equipment",
            // luckBonus здесь нет, так как эффект другой
            effect: { type: "duplicate_currency_bonus_percent", value: 0.10 } // 10%
        },
        {
            id: "equip_hand_of_misfortune", // Или cloak_of_misfortune
            nameKey: "shop.equipment.equip_hand_of_misfortune.name",
            descriptionKey: "shop.equipment.equip_hand_of_misfortune.description",
            cost: 1500, // Стоимость можно будет настроить
            type: "equipment",
            // luckBonus здесь нет, так как бонус динамический
            effect: { 
                type: "cumulative_luck_on_low_rolls", 
                bonusPerStack: 0.05, 
                maxStacks: 10, // Опционально: максимальное количество стаков (например, до +0.5 удачи)
                triggerRarities: ["garbage", "common", "rare"] // ID редкостей, которые стакают бонус
            }
        }
    ],
    upgrades: [
        { id: "upgrade_fast_roll", nameKey: "shop.upgrades.upgrade_fast_roll.name", descriptionKey: "shop.upgrades.upgrade_fast_roll.description", cost: 1000, type: "permanent_upgrade", targetProperty: "fastRoll" },
        { id: "upgrade_multi_roll_x5", nameKey: "shop.upgrades.upgrade_multi_roll_x5.name", descriptionKey: "shop.upgrades.upgrade_multi_roll_x5.description", cost: 5000, type: "permanent_upgrade", targetProperty: "multiRollX5" },
    ]
};



// Константы для игры
const MAX_EQUIPPED_ITEMS = 3;
const ROLL_ANIMATION_ITEMS_COUNT = 50;
const BASE_LUCK = 1.0;

// Функция для получения данных о редкости по ID
function getRarityDataById(id) {
    return RARITIES_DATA.find(r => r.id === id);
}
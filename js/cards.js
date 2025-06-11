// js/cards.js

window.RARITIES_DATA = [
    {
        id: "blackhole",
        nameKey: "cards.blackhole.name",
        probabilityBase: 1/9876543, 
        color: "#E65100",
        glowColor: "#ffca28",
        cssClass: "rarity-blackhole",
        currencyOnDuplicate: 987654,
        card: {
            name: "FY-3741 alpha", 
            nameKey: "cards.blackhole.cardName", // <-- ДОБАВЛЕНО
            image: "img/cardBlackHole.png",
            descriptionKey: "cards.blackhole.description"
        }
    },
    {
        id: "berserk",
        nameKey: "cards.berserk.name",
        probabilityBase: 1/30000, 
        color: "#c62828",
        glowColor: "#ff8a80", 
        cssClass: "rarity-berserk",
        currencyOnDuplicate: 3000,
        card: {
            name: "Stug", 
            nameKey: "cards.berserk.cardName", // <-- ДОБАВЛЕНО
            image: "img/cardBerserker.png",
            descriptionKey: "cards.berserk.description"
        }
    },
    {
        id: "hybrid",
        nameKey: "cards.hybrid.name",
        probabilityBase: 1/20000, 
        color: "#6a1b9a", // Deep Purple 800
        glowColor: "#64ffda", // Teal A400
        cssClass: "rarity-hybrid",
        currencyOnDuplicate: 2000,
        card: {
            name: "Alex", 
            nameKey: "cards.hybrid.cardName",
            image: "img/cardHybrid.png", // Вам нужно будет создать это изображение
            descriptionKey: "cards.hybrid.description"
        }
    },
    {
        id: "bee",
        nameKey: "cards.bee.name", 
        probabilityBase: 1/15000, 
        color: "#ffb300",
        glowColor: "#ffd54f",
        cssClass: "rarity-bee",
        currencyOnDuplicate: 1500,
        card: {
            name: "Queen Bee", 
            nameKey: "cards.bee.cardName", // <-- ДОБАВЛЕНО
            image: "img/cardQueenBee.png",
            descriptionKey: "cards.bee.description"
        }
    },
    {
        id: "russian",
        nameKey: "cards.russian.name",
        probabilityBase: 1/10000, 
        color: "#B71C1C",
        glowColor: "#f5f5f5",
        cssClass: "rarity-russian",
        currencyOnDuplicate: 1000,
        card: {
            name: "Klyukva Medvedeva", 
            nameKey: "cards.russian.cardName", // <-- ДОБАВЛЕНО
            image: "img/cardRussian.png",
            descriptionKey: "cards.russian.description"
        }
    },
    {
        id: "platinum",
        nameKey: "cards.platinum.name",
        probabilityBase: 1/7810, 
        color: "#78909c", // Blue Grey 500
        glowColor: "#ffffff", // Чисто белое свечение
        cssClass: "rarity-platinum",
        currencyOnDuplicate: 781,
        card: {
            name: "Platina", 
            nameKey: "cards.platinum.cardName",
            image: "img/cardPlatinum.png", // Вам нужно будет создать это изображение
            descriptionKey: "cards.platinum.description"
        }
    },
    {
        id: "motivation",
        nameKey: "cards.motivation.name",
        probabilityBase: 1/2111,
        color: "#0d47a1",
        glowColor: "#64b5f6",
        cssClass: "rarity-motivation",
        currencyOnDuplicate: 211,
        card: {
            name: "Alpha and Omega",
            nameKey: "cards.motivation.cardName", // <-- ДОБАВЛЕНО
            image: "img/cardMotivation.png",
            descriptionKey: "cards.motivation.description"
        }
    },
    {
        id: "smokinsexystyle",
        nameKey: "cards.smokinsexystyle.name",
        probabilityBase: 1/1999,
        color: "#b71c1c",
        glowColor: "#ef9a9a",
        cssClass: "rarity-smokinsexystyle",
        currencyOnDuplicate: 199,
        card: {
            name: "Subhuman",
            nameKey: "cards.smokinsexystyle.cardName", // <-- ДОБАВЛЕНО
            image: "img/cardSmokinSexyStyle.png",
            descriptionKey: "cards.smokinsexystyle.description"
        }
    },
    {
        id: "cosmic",
        nameKey: "cards.cosmic.name",
        probabilityBase: 1/1618,
        color: "#311b92",
        glowColor: "#7e57c2",
        cssClass: "rarity-cosmic",
        currencyOnDuplicate: 161,
        card: {
            name: "Star Elf",
            nameKey: "cards.cosmic.cardName", // <-- ДОБАВЛЕНО
            image: "img/cardCosmic.png",
            descriptionKey: "cards.cosmic.description"
        }
    },
    {
        id: "space",
        nameKey: "cards.space.name",
        probabilityBase: 1/1042,
        color: "#0097a7",
        glowColor: "#80deea",
        cssClass: "rarity-space",
        currencyOnDuplicate: 142,
        card: {
            name: "Nebula Weaver",
            nameKey: "cards.space.cardName", // <-- ДОБАВЛЕНО
            image: "img/cardSpace.png",
            descriptionKey: "cards.space.description"
        }
    },
    {
        id: "timestop",
        nameKey: "cards.timestop.name",
        probabilityBase: 1/1024,
        color: "#FBC02D",
        glowColor: "#FFF59D",
        cssClass: "rarity-timestop",
        currencyOnDuplicate: 124,
        card: {
            name: "D.I.O.N.A.",
            nameKey: "cards.timestop.cardName", // <-- ДОБАВЛЕНО
            image: "img/cardTimestop.png",
            descriptionKey: "cards.timestop.description"
        }
    },
    {
        id: "jackpot",
        nameKey: "cards.jackpot.name",
        probabilityBase: 1/777,
        color: "#ffb300",
        glowColor: "#ffe54c",
        cssClass: "rarity-jackpot",
        currencyOnDuplicate: 77,
        card: {
            name: "Hakaria",
            nameKey: "cards.jackpot.cardName", // <-- ДОБАВЛЕНО
            image: "img/cardJackpot.png",
            descriptionKey: "cards.jackpot.description"
        }
    },
    {
        id: "devil",
        nameKey: "cards.devil.name",
        probabilityBase: 1/666,
        color: "#a01c1c",
        glowColor: "#d73a3a",
        cssClass: "rarity-devil",
        currencyOnDuplicate: 66,
        card: {
            name: "Makima, Demon of Control",
            nameKey: "cards.devil.cardName", // <-- ДОБАВЛЕНО
            image: "img/cardDevil.png",
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
            nameKey: "cards.error.cardName", // <-- ДОБАВЛЕНО
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
            nameKey: "cards.uranium.cardName", // <-- ДОБАВЛЕНО
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
            nameKey: "cards.unbound.cardName", // <-- ДОБАВЛЕНО
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
            nameKey: "cards.mythic.cardName", // <-- ДОБАВЛЕНО
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
            nameKey: "cards.legendary.cardName", // <-- ДОБАВЛЕНО
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
            nameKey: "cards.epic.cardName", // <-- ДОБАВЛЕНО
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
            nameKey: "cards.rare.cardName", // <-- ДОБАВЛЕНО
            image: "img/cardRare.png",
            descriptionKey: "cards.rare.description"
        }
    },
    {
        id: "common",
        nameKey: "cards.common.name",
        probabilityBase: 1/2,
        color: "#9e9e9e",
        glowColor: "#bdbdbd",
        cssClass: "rarity-common",
        currencyOnDuplicate: 2,
        card: {
            name: "Eve",
            nameKey: "cards.common.cardName", // <-- ДОБАВЛЕНО
            image: "img/cardCommon.png",
            descriptionKey: "cards.common.description"
        }
    },
    {
        id: "garbage",
        nameKey: "cards.garbage.name",
        probabilityBase: 1.0,
        color: "#795548",
        glowColor: "#8d6e63",
        cssClass: "rarity-garbage",
        currencyOnDuplicate: 0,
        card: {
            name: "Garbage Idol",
            nameKey: "cards.garbage.cardName", // <-- ДОБАВЛЕНО
            image: "img/cardGarbage.png",
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
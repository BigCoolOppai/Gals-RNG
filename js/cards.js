// js/cards.js

const RARITIES_DATA = [
    {
        id: "timestop", // Дио
        name: "ZA WARUDO", // Или "Королева Мира"
        probabilityBase: 1/1024, // или ваш шанс
        color: "#FBC02D",
        glowColor: "#FFF59D",
        cssClass: "rarity-timestop",
        currencyOnDuplicate: 124, // например
        card: {
            name: "Д.И.О.Н.А", // Ваше имя
            image: "img/cardTimestop.png", // Ваш путь
            description: "Хо, ты приближаешься ко мне? Вместо того чтобы бежать ты идёшь прямо ко мне?"
        }
    },
    {
        id: "jackpot", // Хакари
        name: "Джекпот", // Или "Королева Азарта"
        probabilityBase: 1/777,
        color: "#ffb300",
        glowColor: "#ffe54c",
        cssClass: "rarity-jackpot",
        currencyOnDuplicate: 77, // например
        card: {
            name: "Хакария", // Ваше имя
            image: "img/cardJackpot.png", // Ваш путь
            description: "Вы верите в удачу? Вы знали что 99.9% игроков останавливаются перед выигрышем? Время депать! TUCA DONKA!"
        }
    },
    {
        id: "devil", // Макима
        name: "Дьявольская", // Или "Повелительница Контроля"
        probabilityBase: 1/666,
        color: "#a01c1c",
        glowColor: "#d73a3a",
        cssClass: "rarity-devil",
        currencyOnDuplicate: 66, // например
        card: {
            name: "Макима, Демон Контроля", // Ваше имя
            image: "img/cardDevil.png", // Ваш путь
            description: "Все под контролем. По крайней мере у неё. Макима иди на х%№!"
        }
    },
    {
        id: "error",
        name: "ERROR",
        probabilityBase: 1/404,
        color: "#ff3d00",
        glowColor: "#ff6e40",
        cssClass: "rarity-error",
        currencyOnDuplicate: 44,
        card: {
            name: "ОШИ_Б-БКА_DATA",
            image: "img/cardError.png",
            description: "Мало кто знает кто или что это. Известно лишь то, что это злостное порождение цифровой реальности..."
        }
    },
    {
        id: "uranium",
        name: "Урановый",
        probabilityBase: 1/238,
        color: "#76ff03",
        glowColor: "#b0ff57",
        cssClass: "rarity-uranium",
        currencyOnDuplicate: 30,
        card: {
            name: "Ураночка",
            image: "img/cardUranium.png",
            description: "Ураночка встречается только в самых индустриальных районах, говорят люди встретившие её, светились от счастья."
        }
    },
    {
        id: "unbound",
        name: "Неприкаянный",
        probabilityBase: 1/64,
        color: "#a958dd",
        glowColor: "#c386ed",
        cssClass: "rarity-unbound",
        currencyOnDuplicate: 20,
        card: {
            name: "Ханма",
            image: "img/cardUnbound.png",
            description: "Эта невероятно сильная женщина всегда сбегает из тюрьмы! Кстати, что-то у неё знакомое имя..."
        }
    },
    {
        id: "mythic",
        name: "Мифический",
        probabilityBase: 1/32,
        color: "#f44336",
        glowColor: "#ff5252",
        cssClass: "rarity-mythic",
        currencyOnDuplicate: 15,
        card: {
            name: "Кармилла",
            image: "img/cardMythic.png",
            description: "Кармилла - древний и могущественный дампир, что питается кровью несчастных попавших ей на пути. К слову пить она может и другие телесные жидкости..."
        }
    },
    {
        id: "legendary",
        name: "Легендарный",
        probabilityBase: 1/16,
        color: "#ff9800",
        glowColor: "#ffeb3b",
        cssClass: "rarity-legendary",
        currencyOnDuplicate: 10,
        card: {
            name: "Миса",
            image: "img/cardLegendary.png",
            description: "Миса - вечная тусовщица. Быть приглашённым на её вечеринку - большая честь, повезло тебе."
        }
    },
    {
        id: "epic",
        name: "Эпический",
        probabilityBase: 1/8,
        color: "#9c27b0",
        glowColor: "#ba68c8",
        cssClass: "rarity-epic",
        currencyOnDuplicate: 7,
        card: {
            name: "Гаэль",
            image: "img/cardEpic.png",
            description: "Гаэль не застать на улице просто так, она скорее будет бегать стометровку или тренировать мышцы."
        }
    },
    {
        id: "rare",
        name: "Редкий",
        probabilityBase: 1/4,
        color: "#2196f3",
        glowColor: "#64b5f6",
        cssClass: "rarity-rare",
        currencyOnDuplicate: 5,
        card: {
            name: "Мила",
            image: "img/cardRare.png",
            description: "Мила редко выходит из дома из-за своей слепоты, тебе повезло её встретить!"
        }
    },
    {
        id: "common",
        name: "Обычный",
        probabilityBase: 1/2, // Шанс на обычную, если более редкие не выпали
        color: "#9e9e9e",
        glowColor: "#bdbdbd",
        cssClass: "rarity-common",
        currencyOnDuplicate: 2, // Обычные дубликаты теперь дают немного
        card: {
            name: "Ева",
            image: "img/cardCommon.png",
            description: "Обычная Ева. Её все любят, но она слишком базовая что-ли..."
        }
    },
    { // Новая "мусорная" редкость - ГАРАНТИРОВАНА, если ничего другое не выпало
        id: "garbage",
        name: "Хлам", // Или "Мусор", "Утиль"
        probabilityBase: 1.0, // Эта вероятность будет использоваться только если ВСЕ предыдущие не сработали
        color: "#795548", // Коричневатый, как мусор
        glowColor: "#8d6e63",
        cssClass: "rarity-garbage",
        currencyOnDuplicate: 0, // Мусорные дубликаты ничего не дают
        card: {
            name: "Мусорный идол", // Или что-то подобное
            image: "img/cardGarbage.png", // Убедитесь, что создали это изображение
            description: "Она никому не нужна... может хоть ты не выбросишь её?"
        }
    }
];

// Важно: Массив RARITIES_DATA должен быть отсортирован от САМОЙ РЕДКОЙ к САМОЙ ЧАСТОЙ/ФОЛЛБЭК.
// Логика ролла будет это учитывать.

const SHOP_DATA = {
    boosts: [
        { id: "boost_small", name: "Малый Буст Удачи", description: "+0.1 к удаче на 30 секунд.", cost: 75, durationSeconds: 30, luckBonus: 0.1, type: "luck_boost" },
        { id: "boost_medium", name: "Средний Буст Удачи", description: "+0.25 к удаче на 2 минуты.", cost: 250, durationSeconds: 120, luckBonus: 0.25, type: "luck_boost" },
        { id: "boost_large", name: "Большой Буст Удачи", description: "+0.5 к удаче на 5 минут.", cost: 600, durationSeconds: 300, luckBonus: 0.5, type: "luck_boost" },
        { id: "boost_titanic", name: "Титанический Буст Удачи", description: "+1.0 к удаче на 10 минут.", cost: 1500, durationSeconds: 600, luckBonus: 1.0, type: "luck_boost" },
    ],
    equipment: [
        { id: "equip_talisman", name: "Талисман Новичка", description: "+0.05 к удаче (постоянно).", cost: 300, luckBonus: 0.05, type: "equipment" },
        { id: "equip_ring", name: "Кольцо Искателя", description: "+0.1 к удаче (постоянно).", cost: 750, luckBonus: 0.1, type: "equipment" },
        { id: "equip_artifact", name: "Артефакт Провидца", description: "+0.15 к удаче (постоянно).", cost: 1800, luckBonus: 0.15, type: "equipment" },
        {
            id: "equip_golden_ticket",
            name: "Золотой Билет",
            description: "Увеличивает осколки за дубликаты на 10% (округляется вверх).",
            cost: 550, // Стоимость можно будет настроить
            type: "equipment",
            // luckBonus здесь нет, так как эффект другой
            effect: { type: "duplicate_currency_bonus_percent", value: 0.10 } // 10%
        },
        {
            id: "equip_hand_of_misfortune", // Или cloak_of_misfortune
            name: "Длань Неудачника",
            description: "За каждый Garbage, Common или Rare подряд +0.05 к удаче. Сбрасывается при выпадении чего-то лучше.",
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
        { id: "upgrade_fast_roll", name: "Быстрый Ролл", description: "Уменьшает время анимации ролла до ~0.75 сек.", cost: 1000, type: "permanent_upgrade", targetProperty: "fastRoll" },
        { id: "upgrade_multi_roll_x5", name: "Мульти-Ролл x5", description: "Разблокирует возможность делать 5 роллов одновременно.", cost: 5000, type: "permanent_upgrade", targetProperty: "multiRollX5" },
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
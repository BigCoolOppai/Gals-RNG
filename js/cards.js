window.RARITIES_DATA = [
    {
        id: "gal",
        nameKey: "cards.gal.name",
        minPrestige: 6, // Требует 6-го перерождения
        probabilityBase: 1 / 1000000000, // Невероятно редкая
        color: "#000000",
        glowColor: "#f0f0f0", // Черно-белый контраст
        cssClass: "rarity-gal",
        currencyOnDuplicate: 100000000,
        card: {
            name: "Gal, the Creator", 
            nameKey: "cards.gal.cardName",
            image: "img/cardGal.png",
            descriptionKey: "cards.gal.description"
        }
    },
    {
        id: "time_eternal",
        nameKey: "cards.time_eternal.name",
        minPrestige: 2,
        probabilityBase: 1 / 307246060,
        color: "#212121", // Черный
        glowColor: "#FFD700", // Золотой
        cssClass: "rarity-time-eternal",
        currencyOnDuplicate: 30724606,
        card: {
            name: "Ananke Chrona", 
            nameKey: "cards.time_eternal.cardName",
            image: "img/cardTime.png",
            descriptionKey: "cards.time_eternal.description"
        }
    },
    {
        id: "blackhole_alt_1",
        nameKey: "cards.blackhole_alt_1.name",
        displayParentId: "blackhole",
        minPrestige: 1,
        probabilityBase: 1 / 98765432,
        color: "#ff3d00", // Ярко-оранжевый
        glowColor: "#ff9e80", // Светло-оранжевый
        cssClass: "rarity-blackhole-alt",
        currencyOnDuplicate: 9876543,
        card: {
            name: "Event Horizon", 
            nameKey: "cards.blackhole_alt_1.cardName",
            image: "img/altBlackhole.png",
            descriptionKey: "cards.blackhole_alt_1.description"
        }
    },
    {
        id: "seductress",
        nameKey: "cards.seductress.name",
        displayParentId: "vacation",
        minPrestige: 2,
        probabilityBase: 1 / 20000000,
        color: "#4A0000", // Глубокий кроваво-черный
        glowColor: "#FF4D4D", // Опасное красное свечение
        cssClass: "rarity-seductress",
        currencyOnDuplicate: 2000000,
        card: {
            name: "Surie", 
            nameKey: "cards.seductress.cardName",
            image: "img/altVacation.png", // Убедитесь, что файл существует
            descriptionKey: "cards.seductress.description"
        }
    },
    {
        id: "gojo",
        nameKey: "cards.gojo.name",
        minPrestige: 3, // Доступна после 2 ребёрнов
        probabilityBase: 1 / 15000000, // Невероятно сильный персонаж = очень редкая карта
        color: "#01579B", // Глубокий синий, цвет ее глаз и техник
        glowColor: "#81D4FA", // Яркое голубое свечение, как "Бесконечность"
        cssClass: "rarity-gojo",
        currencyOnDuplicate: 1500000,
        card: {
            name: "Satsuki Gojo", 
            nameKey: "cards.gojo.cardName",
            image: "img/cardGojo.png", // Убедитесь, что файл существует
            descriptionKey: "cards.gojo.description"
        }
    },
    {
        id: "kefla",
        nameKey: "cards.kefla.name",
        minPrestige: 2, // Доступна после 2 ребёрнов
        probabilityBase: 1 / 13000000, // Очень редкая, как и подобает LSSJ фьюжну
        color: "#4CAF50", // Насыщенный зеленый цвет ауры LSSJ
        glowColor: "#B9F6CA", // Ярко-зеленое свечение
        cssClass: "rarity-kefla",
        currencyOnDuplicate: 1500000,
        card: {
            name: "Kefla", 
            nameKey: "cards.kefla.cardName",
            image: "img/cardKefla.png", // Убедитесь, что файл существует
            descriptionKey: "cards.kefla.description"
        }
    },
    {
        id: "altLibrarian",
        nameKey: "cards.altLibrarian.name",
        displayParentId: "librarian",
        minPrestige: 2,
        probabilityBase: 1 / 12000000, // В 100 раз реже оригинала
        color: "#c2185b", // Глубокий розовый, цвет страсти
        glowColor: "#f48fb1", // Яркое, манящее свечение
        cssClass: "rarity-alt-librarian",
        currencyOnDuplicate: 1200000,
        card: {
            name: "Vicious Scholar", 
            nameKey: "cards.altLibrarian.cardName",
            image: "img/altLibrarian.png", // Убедитесь, что файл существует
            descriptionKey: "cards.altLibrarian.description"
        }
    },
    {
        id: "dionysia",
        nameKey: "cards.dionysia.name",
        minPrestige: 4,
        probabilityBase: 1 / 11000000, // Между Легендарной и Мифической
        color: "#6A1B9A", // Цвет вина и винограда
        glowColor: "#9CCC65", // Цвет виноградных лоз
        cssClass: "rarity-dionysia",
        currencyOnDuplicate: 1100000,
         card: {
            name: "Dionysia", 
            nameKey: "cards.dionysia.cardName",
            image: "img/cardDionysis.png", // Убедитесь, что файл существует
            descriptionKey: "cards.dionysia.description"
        }
    },
    {
        id: "blackhole",
        nameKey: "cards.blackhole.name",
        probabilityBase: 1/9876543, 
        color: "#E65100",
        glowColor: "#ffca28",
        cssClass: "rarity-blackhole",
        currencyOnDuplicate: 987654,
        mechanicalEffect: { // <<< ДОБАВЛЕНО
            type: "duplicate_collector",
            luckBonusPerDuplicate: 0.03
        },
        card: {
            name: "FY-3741 alpha", 
            nameKey: "cards.blackhole.cardName", // <-- ДОБАВЛЕНО
            image: "img/cardBlackHole.png",
            descriptionKey: "cards.blackhole.description"
        }
    },
    {
        id: "obsidian",
        nameKey: "cards.obsidian.name",
        displayParentId: "lava",
        minPrestige: 1, // Доступна после 1 реборна
        probabilityBase: 1 / 7500000, // 1/75000 * 100
        color: "#212121", // Угольно-черный
        glowColor: "#E53935", // Красное свечение от лавы
        cssClass: "rarity-obsidian",
        currencyOnDuplicate: 750000,
        card: {
            name: "Obsidiana", 
            nameKey: "cards.obsidian.cardName",
            image: "img/altLava.png",
            descriptionKey: "cards.obsidian.description"
        }
    },
    {
        id: "altShroom",
        nameKey: "cards.altShroom.name",
        displayParentId: "shroom",
        minPrestige: 1,
        probabilityBase: 1 / 7000000, // В 100 раз реже оригинала
        color: "#A1887F", // Землистый, натуральный цвет
        glowColor: "#D7CCC8", // Мягкое бежевое свечение
        cssClass: "rarity-alt-shroom",
        currencyOnDuplicate: 700000,
        card: {
            name: "Boletus", 
            nameKey: "cards.altShroom.cardName",
            image: "img/altShroom.png", // Убедитесь, что файл существует
            descriptionKey: "cards.altShroom.description"
        }
    },
    {
        id: "ensnared",
        nameKey: "cards.ensnared.name",
        displayParentId: "guide",
        minPrestige: 1,
        probabilityBase: 1 / 6010000, // Редкость как у оригинала, но требует реборна
        color: "#795548", // Коричневый, цвет сундука
        glowColor: "#A1887F",
        cssClass: "rarity-ensnared",
        currencyOnDuplicate: 60100,
        card: {
            name: "Elf in a Trap", 
            nameKey: "cards.ensnared.cardName",
            image: "img/altFrieren.png",
            descriptionKey: "cards.ensnared.description"
        }
    },
    {
        id: "goblin_alt_1",
        nameKey: "cards.goblin_alt_1.name",
        displayParentId: "goblin",
        minPrestige: 1,
        probabilityBase: 1 / 5000020, // 1/50000 * 100
        color: "#9CCC65", // Более светлый, "довольный" зеленый
        glowColor: "#C5E1A5",
        cssClass: "rarity-goblin-alt",
        currencyOnDuplicate: 500000,
        card: {
            name: "Satisfied Tur'gata", 
            nameKey: "cards.goblin_alt_1.cardName",
            image: "img/altGoblin.png",
            descriptionKey: "cards.goblin_alt_1.description"
        }
    },
    {
        id: "tamer",
        nameKey: "cards.tamer.name",
        minPrestige: 1,
        probabilityBase: 1 / 5000000,
        color: "#FF7043", // Теплый, игривый оранжевый
        glowColor: "#FFAB91", // Мягкое персиковое свечение
        cssClass: "rarity-tamer",
        currencyOnDuplicate: 500000,
        card: {
            name: "Nufka & Syaba", 
            nameKey: "cards.tamer.cardName",
            image: "img/cardTamer.png", // Убедитесь, что файл существует
            descriptionKey: "cards.tamer.description"
        }
    },
    {
        id: "raven",
        nameKey: "cards.raven.name",
        displayParentId: "amy",
        minPrestige: 1, // Доступна после 1 реборна
        probabilityBase: 1 / 4600000, // В 10 раз реже оригинала
        color: "#311B92", // Темный индиго
        glowColor: "#9575CD", // Глубокое фиолетовое свечение
        cssClass: "rarity-raven",
        currencyOnDuplicate: 360,
        card: {
            name: "Raven", 
            nameKey: "cards.raven.cardName",
            image: "img/altAmy.png",
            descriptionKey: "cards.raven.description"
        }
    },
    {
        id: "aizen_traitor",
        nameKey: "cards.aizen_traitor.name",
        displayParentId: "aizen",
        minPrestige: 3,
        probabilityBase: 1 / 4200000, // В 3 раза реже
        color: "#FFFFFF", // Чистый, холодный белый
        glowColor: "#80DEEA", // Бирюзовое свечение, как у эспады
        cssClass: "rarity-aizen-traitor",
        currencyOnDuplicate: 420000,
        card: {
            name: "Traitor Aizen", 
            nameKey: "cards.aizen_traitor.cardName",
            image: "img/altCaptain.png",
            descriptionKey: "cards.aizen_traitor.description"
        }
    },
    {
        id: "error_alt_1",
        nameKey: "cards.error_alt_1.name",
        displayParentId: "error",
        minPrestige: 1,
        probabilityBase: 1/4040403,
        color: "#ff6d00",
        glowColor: "#ff9e80",
        cssClass: "rarity-error-alt",
        currencyOnDuplicate: 404403,
        // --- НОВАЯ, УСИЛЕННАЯ МЕХАНИКА ---
        mechanicalEffect: {
            type: "universal_upgrade",
            // Шанс на базовое улучшение (+1) стал выше
            chance: 0.20, // 20%
            // Шансы на многоуровневое улучшение. Проверяются от лучшего к худшему.
            multiUpgradeTiers: [
                { tiers: 3, chance: 0.005 }, // 0.5% шанс на +3
                { tiers: 2, chance: 0.015 }  // 1.5% шанс на +2
            ]
        },
        card: {
            name: "ERROR, Corrupted Core", 
            nameKey: "cards.error_alt_1.cardName",
            image: "img/altError.png",
            descriptionKey: "cards.error_alt_1.description"
        }
    },
    {
        id: "salt",
        nameKey: "cards.salt.name",
        // Шанс выпадения после разблокировки
        probabilityBase: 1 / 3584427, 
        color: "#FFFFFF", // Чисто-белый
        glowColor: "#B0BEC5", // Легкое серое свечение
        cssClass: "rarity-salt",
        currencyOnDuplicate: 5500,
        // isUnlockable: true, // Можно добавить флаг для будущего отображения в UI
        card: {
            name: "NaCl-chan", 
            nameKey: "cards.salt.cardName",
            image: "img/cardSalt.png",
            descriptionKey: "cards.salt.description"
        }
    },
    {
        id: "alt_witchy",
        nameKey: "cards.alt_witchy.name",
        displayParentId: "witchy",
        minPrestige: 2, // Наставница доступна позже
        probabilityBase: 1 / 2500000, // В 100 раз реже оригинала
        color: "#4A148C", // Королевский фиолетовый
        glowColor: "#E1BEE7", // Светло-лавандовое мистическое свечение
        cssClass: "rarity-alt-witchy",
        currencyOnDuplicate: 250000,
        card: {
            name: "Arch-Cummoner", 
            nameKey: "cards.alt_witchy.cardName",
            image: "img/altWitchy.png", // Убедитесь, что файл существует
            descriptionKey: "cards.alt_witchy.description"
        }
    },
    {
        id: "alt_maternal",
        nameKey: "cards.alt_maternal.name",
        displayParentId: "maternal",
        minPrestige: 2, // Позже оригинала
        probabilityBase: 1 / 2100000, // Реже оригинала
        color: "#FFFDE7", // Кремовый, молочный цвет
        glowColor: "#FFFFFF", // Чистое белое свечение
        cssClass: "rarity-alt-maternal",
        currencyOnDuplicate: 210000,
        card: {
            name: "The Wet Nurse", 
            nameKey: "cards.alt_maternal.cardName",
            image: "img/altGoat.png", // Убедитесь, что файл существует
            descriptionKey: "cards.alt_maternal.description"
        }
    },
    {
        id: "shy_princess",
        nameKey: "cards.shy_princess.name",
        displayParentId: "dark_princess",
        minPrestige: 3, // +1 к оригиналу
        probabilityBase: 1 / 2000001,
        color: "#D1C4E9", // Светло-фиолетовый
        glowColor: "#B39DDB",
        cssClass: "rarity-shy-princess",
        currencyOnDuplicate: 200000,
        card: {
            name: "Sofia", 
            nameKey: "cards.shy_princess.cardName",
            image: "img/altDarkPrincess.png",
            descriptionKey: "cards.shy_princess.description"
        }
    },
    {
        id: "dark_princess",
        nameKey: "cards.dark_princess.name",
        minPrestige: 2,
        probabilityBase: 1 / 2000000,
        color: "#F06292", // Темно-розовый
        glowColor: "#F48FB1",
        cssClass: "rarity-dark-princess",
        currencyOnDuplicate: 200000,
        card: {
            name: "Roxie", 
            nameKey: "cards.dark_princess.cardName",
            image: "img/cardDarkPrincess.png",
            descriptionKey: "cards.dark_princess.description"
        }
    },
    {
        id: "russian_alt_ussr",
        nameKey: "cards.russian_alt_ussr.name",
        displayParentId: "russian",
        minPrestige: 2,
        probabilityBase: 1 / 1991000, // Отсылка к году распада
        color: "#CC0000", // Насыщенный красный
        glowColor: "#FFD700", // Золотой, как на флаге
        cssClass: "rarity-russian-ussr",
        currencyOnDuplicate: 199100,
        card: {
            name: "Comrade Medvedeva", 
            nameKey: "cards.russian_alt_ussr.cardName",
            image: "img/alt2Russian.png",
            descriptionKey: "cards.russian_alt_ussr.description"
        }
    },
    {
        id: "maternal",
        nameKey: "cards.maternal.name",
        minPrestige: 1,
        probabilityBase: 1 / 1592015,
        color: "#6A1B9A", // Королевский фиолетовый
        glowColor: "#CE93D8",
        cssClass: "rarity-maternal",
        currencyOnDuplicate: 159201,
        card: {
            name: "Tutoriel", 
            nameKey: "cards.maternal.cardName",
            image: "img/cardGoat.png",
            descriptionKey: "cards.maternal.description"
        }
    },
    {
        id: "sodium",
        nameKey: "cards.sodium.name",
        // minPrestige можно не ставить, чтобы она была доступна, но редка
        probabilityBase: 1 / 1551122,
        color: "#f8f8ff", // Призрачный белый
        glowColor: "#d1c4e9", // Лавандовое свечение
        cssClass: "rarity-sodium",
        currencyOnDuplicate: 155000,
        card: {
            name: "Natria", 
            nameKey: "cards.sodium.cardName",
            image: "img/cardSodium.png",
            descriptionKey: "cards.sodium.description"
        }
    },
    {
        id: "vacation",
        nameKey: "cards.vacation.name",
        minPrestige: 1,
        probabilityBase: 1 / 1500000,
        color: "#EF5350", // Яркий курортный красный
        glowColor: "#FFCDD2", // Теплый розовый оттенок заката
        cssClass: "rarity-vacation",
        currencyOnDuplicate: 150000,
        card: {
            name: "Zia", 
            nameKey: "cards.vacation.cardName",
            image: "img/cardVacation.png", // Убедитесь, что файл существует
            descriptionKey: "cards.vacation.description"
        }
    },
    {
        id: "aizen",
        nameKey: "cards.aizen.name",
        minPrestige: 2,
        probabilityBase: 1 / 1400000,
        color: "#4A148C", // Глубокий, авторитетный фиолетовый
        glowColor: "#D1C4E9",
        cssClass: "rarity-aizen",
        currencyOnDuplicate: 140000,
        card: {
            name: "Captain Aizen", 
            nameKey: "cards.aizen.cardName",
            image: "img/cardCaptain.png",
            descriptionKey: "cards.aizen.description"
        }
    },
    {
        id: "alastor",
        nameKey: "cards.alastor.name",
        minPrestige: 1,
        probabilityBase: 1 / 1300000,
        color: "#c62828", // Демонический красный
        glowColor: "#ef5350",
        cssClass: "rarity-alastor",
        currencyOnDuplicate: 130000,
        card: {
            name: "Radio Demoness", 
            nameKey: "cards.alastor.cardName",
            image: "img/cardRadio.png",
            descriptionKey: "cards.alastor.description"
        }
    },
    {
        id: "garbage_alt_1",
        nameKey: "cards.garbage_alt_1.name",
        displayParentId: "garbage",
        probabilityBase: 1 / 1000000,
        color: "#ff9800", // Яркий оранжевый
        glowColor: "#2196f3", // Синее свечение для контраста
        cssClass: "rarity-garbage-alt",
        currencyOnDuplicate: 100000,
        card: {
            name: "Shining Idol", 
            nameKey: "cards.garbage_alt_1.cardName",
            image: "img/altGarbage.png", // Вам нужно будет создать это изображение
            descriptionKey: "cards.garbage_alt_1.description"
        }
    },
    {
        id: "silken_alt_sushi",
        nameKey: "cards.silken_alt_sushi.name",
        displayParentId: "silken",
        minPrestige: 1,
        probabilityBase: 1 / 800000, // В 10 раз реже оригинала
        color: "#E57373", // Цвет тунца
        glowColor: "#FFF9C4", // Цвет риса/тамаго
        cssClass: "rarity-silken-sushi",
        currencyOnDuplicate: 80000,
        card: {
            name: "Hana Akano (Omakase)", 
            nameKey: "cards.silken_alt_sushi.cardName",
            image: "img/altAsian.png",
            descriptionKey: "cards.silken_alt_sushi.description"
        }
    },
    {
        id: "alt_mythic",
        nameKey: "cards.alt_mythic.name",
        displayParentId: "mythic",
        minPrestige: 1,
        probabilityBase: 1 / 64000, // в 1000 раз реже оригинала
        color: "#B71C1C", // Кроваво-красный
        glowColor: "#FF8A80", // Алое свечение
        cssClass: "rarity-alt-mythic",
        currencyOnDuplicate: 6400,
        card: {
            name: "Girlycard", 
            nameKey: "cards.alt_mythic.cardName",
            image: "img/altMythic.png", // Убедитесь, что файл существует
            descriptionKey: "cards.alt_mythic.description"
        }
    },
    {
        id: "guide",
        nameKey: "cards.guide.name",
        probabilityBase: 1 / 601000, // Изменено, чтобы быть реже
        color: "#B0BEC5", // Холодный, как её характер
        glowColor: "#E0E0E0",
        cssClass: "rarity-guide",
        currencyOnDuplicate: 6010,
        card: {
            name: "Mysterious Elf", 
            nameKey: "cards.guide.cardName",
            image: "img/cardFrieren.png",
            descriptionKey: "cards.guide.description"
        }
    },
    {
        id: "diamond",
        nameKey: "cards.diamond.name",
        displayParentId: "carbon",
        // Нет minPrestige, доступна с начала для бустеров
        probabilityBase: 1 / 501000, // отсылка на 50 тысяч атмосфер и 1000 градусов
        color: "#B2EBF2", // Светло-голубой, как алмаз
        glowColor: "#FFFFFF", // Чистое белое сияние
        cssClass: "rarity-diamond",
        currencyOnDuplicate: 50100,
        passiveEffect: {
            type: "global_purchase_discount",
            value: 0.10
        },
        card: {
            name: "Dime",
            nameKey: "cards.diamond.cardName",
            image: "img/altDiamond.png",
            descriptionKey: "cards.diamond.description"
        }
    },
    {
        id: "amy",
        nameKey: "cards.amy.name",
        probabilityBase: 1 / 465000,
        color: "#673AB7", // Глубокий фиолетовый
        glowColor: "#B39DDB", // Лавандовое свечение
        cssClass: "rarity-amy",
        currencyOnDuplicate: 46500,
        card: {
            name: "Amy", 
            nameKey: "cards.amy.cardName",
            image: "img/cardAmy.png",
            descriptionKey: "cards.amy.description"
        }
    },
    {
        id: "metalhead",
        nameKey: "cards.metalhead.name",
        probabilityBase: 1 / 450000,
        color: "#616161", // Металлический серый
        glowColor: "#E0E0E0",
        cssClass: "rarity-metalhead",
        currencyOnDuplicate: 45000,
        card: {
            name: "Kori Bennington", 
            nameKey: "cards.metalhead.cardName",
            image: "img/cardMetal.png",
            descriptionKey: "cards.metalhead.description"
        }
    },
    {
        id: "error",
        nameKey: "cards.error.name",
        probabilityBase: 1/404403,
        color: "#ff3d00",
        glowColor: "#ff6e40",
        cssClass: "rarity-error",
        currencyOnDuplicate: 40404,
        // --- ДОБАВЛЕНА МЕХАНИКА ОТ АЛЬТЕРНАТИВНОЙ ВЕРСИИ ---
        mechanicalEffect: {
            type: "universal_upgrade",
            chance: 0.10 // 10% шанс
        },
        card: {
            name: "ER-RR_R_DATA",
            nameKey: "cards.error.cardName",
            image: "img/cardError.png",
            descriptionKey: "cards.error.description"
        }
    },
    {
        id: "moon",
        nameKey: "cards.moon.name",
        probabilityBase: 1 / 384000,
        color: "#90A4AE", // Лунный серебристый
        glowColor: "#ECEFF1",
        cssClass: "rarity-moon",
        currencyOnDuplicate: 38400,
        card: {
            name: "Selena", 
            nameKey: "cards.moon.cardName",
            image: "img/cardMoon.png",
            descriptionKey: "cards.moon.description"
        }
    },
    {
        id: "gold",
        nameKey: "cards.gold.name",
        probabilityBase: 1 / 379000,
        color: "#FFD700", // Золотой
        glowColor: "#FFF9C4", // Светло-золотое свечение
        cssClass: "rarity-gold",
        currencyOnDuplicate: 37900,
        passiveEffect: {
            type: "duplicate_currency_bonus_percent",
            value: 0.15
        },
        card: {
            name: "Goldy",
            nameKey: "cards.gold.cardName",
            image: "img/cardGold.png",
            descriptionKey: "cards.gold.description"
        }
    },
    {
        id: "berserk_alt_1",
        nameKey: "cards.berserk_alt_1.name",
        displayParentId: "berserk",
        minPrestige: 1,
        probabilityBase: 1 / 300000,
        color: "#ffb74d", // Теплый оранжевый
        glowColor: "#ffe0b2", // Мягкий желтый, как свет от костра
        cssClass: "rarity-berserk-alt",
        currencyOnDuplicate: 30000,
        card: {
            name: "Stug, at Peace", 
            nameKey: "cards.berserk_alt_1.cardName",
            image: "img/altBerserk.png", // Вам нужно будет создать это изображение
            descriptionKey: "cards.berserk_alt_1.description"
        }
    },
    {
        id: "mechanic",
        nameKey: "cards.mechanic.name",
        minPrestige: 2,
        probabilityBase: 1 / 270000,
        color: "#4CAF50", // Зеленый, как неоновые пряди
        glowColor: "#A5D6A7",
        cssClass: "rarity-mechanic",
        currencyOnDuplicate: 27000,
        card: {
            name: "Jena", 
            nameKey: "cards.mechanic.cardName",
            image: "img/cardMechanic.png",
            descriptionKey: "cards.mechanic.description"
        }
    },
    {
        id: "uranium_alt_1",
        nameKey: "cards.uranium_alt_1.name",
        displayParentId: "uranium",
        minPrestige: 1,
        probabilityBase: 1 / 238000, // 1/238 * 100
        color: "#1b5e20", // Темно-зеленый
        glowColor: "#a5d6a7", // Светло-зеленый
        cssClass: "rarity-uranium-alt",
        currencyOnDuplicate: 23800,
        card: {
            name: "Uranium-235", 
            nameKey: "cards.uranium_alt_1.cardName",
            image: "img/altUranium.png",
            descriptionKey: "cards.uranium_alt_1.description"
        }
    },
    {
        id: "sss_dt",
        nameKey: "cards.sss_dt.name",
        displayParentId: "smokinsexystyle",
        minPrestige: 2,
        probabilityBase: 1 / 199900, // В 100 раз реже оригинала
        color: "#7B1FA2", // Демонический фиолетовый
        glowColor: "#FF4081", // Ярко-розовое свечение
        cssClass: "rarity-sss-dt",
        currencyOnDuplicate: 19990,
        card: {
            name: "Devil Trigger", 
            nameKey: "cards.sss_dt.cardName",
            image: "img/altSmokinSexyStyle.png",
            descriptionKey: "cards.sss_dt.description"
        }
    },
    {
        id: "doctor",
        nameKey: "cards.doctor.name",
        probabilityBase: 1 / 192800,
        color: "#F48FB1", // Розовый
        glowColor: "#F8BBD0",
        cssClass: "rarity-doctor",
        currencyOnDuplicate: 19280,
        card: {
            name: "Tina", 
            nameKey: "cards.doctor.cardName",
            image: "img/cardDoctor.png",
            descriptionKey: "cards.doctor.description"
        }
    },
    {
        id: "tungsten",
        nameKey: "cards.tungsten.name",
        probabilityBase: 1 / 183840, // Реже Ткачихи
        color: "#B0BEC5", // Холодный металлик
        glowColor: "#ECEFF1", // Белое свечение
        cssClass: "rarity-tungsten",
        currencyOnDuplicate: 18384,
        card: {
            name: "Tung Stenn",
            nameKey: "cards.tungsten.cardName",
            image: "img/cardTungsten.png",
            descriptionKey: "cards.tungsten.description"
        }
    },
    {
        id: "russian_alt_usa",
        nameKey: "cards.russian_alt_usa.name",
        displayParentId: "russian",
        minPrestige: 1,
        probabilityBase: 1 / 177600, // Отсылка к году независимости
        color: "#3C3B6E", // Темно-синий
        glowColor: "#B22234", // Красный
        cssClass: "rarity-russian-usa",
        currencyOnDuplicate: 17760,
        card: {
            name: "Miss Klyukva Liberty", 
            nameKey: "cards.russian_alt_usa.cardName",
            image: "img/altRussian.png",
            descriptionKey: "cards.russian_alt_usa.description"
        }
    },
    {
        id: "space_alt_2",
        nameKey: "cards.space_alt_2.name",
        displayParentId: "space",
        minPrestige: 2,
        probabilityBase: 1 / 142420, // 1/1042 * 100
        color: "#80deea", // Светло-голубой
        glowColor: "#ffffff", // Белый
        cssClass: "rarity-space-alt",
        currencyOnDuplicate: 1424,
        mechanicalEffect: { // <<< ДОБАВЛЕНО
            type: "boost_catalyst",
            multiplier: 1.25
        },
        card: {
            name: "Reality Weaver", 
            nameKey: "cards.space_alt_2.cardName",
            image: "img/alt2Space.png",
            descriptionKey: "cards.space_alt_2.description"
        }
    },
    {
        id: "librarian",
        nameKey: "cards.librarian.name",
        minPrestige: 1,
        probabilityBase: 1 / 120000,
        color: "#607D8B", // Строгий сине-серый
        glowColor: "#B0BEC5", // Мягкое свечение
        cssClass: "rarity-librarian",
        currencyOnDuplicate: 12000,
        card: {
            name: "Libra", 
            nameKey: "cards.librarian.cardName",
            image: "img/cardLibrarian.png", // Убедитесь, что файл существует
            descriptionKey: "cards.librarian.description"
        }
    },
    {
        id: "space_alt_1",
        nameKey: "cards.space_alt_1.name",
        displayParentId: "space",
        minPrestige: 1,
        probabilityBase: 1 / 104200, // 1/1042 * 100
        color: "#80deea", // Светло-голубой
        glowColor: "#ffffff", // Белый
        cssClass: "rarity-space-alt",
        currencyOnDuplicate: 1420,
        card: {
            name: "Reality Weaver", 
            nameKey: "cards.space_alt_1.cardName",
            image: "img/altSpace.png",
            descriptionKey: "cards.space_alt_1.description"
        }
    },
    {
        id: "timestop_alt_1",
        nameKey: "cards.timestop_alt_1.name",
        displayParentId: "timestop",
        minPrestige: 1,
        probabilityBase: 1 / 102400,
        color: "#b0bec5", // Серебряный/серый
        glowColor: "#80deea", // Голубоватое свечение, как у Сакуи
        cssClass: "rarity-timestop-alt",
        currencyOnDuplicate: 10240,
        card: {
            name: "S.A.K.U.Y.A.", 
            nameKey: "cards.timestop_alt_1.cardName",
            image: "img/altTimestop.png", // Вам нужно будет создать это изображение
            descriptionKey: "cards.timestop_alt_1.description"
        }
    },
    {
        id: "rias",
        nameKey: "cards.rias.name",
        probabilityBase: 1 / 96000, // Реже мифической, но чаще Unbound
        color: "#d32f2f", // Глубокий малиновый
        glowColor: "#ffcdd2", // Розовое свечение
        cssClass: "rarity-rias",
        currencyOnDuplicate: 9600,
        card: {
            name: "Crimson Duchess", 
            nameKey: "cards.rias.cardName",
            image: "img/cardCrimson.png",
            descriptionKey: "cards.rias.description"
        }
    },
    {
        id: "silken",
        nameKey: "cards.silken.name",
        probabilityBase: 1 / 80000,
        color: "#C2185B", // Алый/Малиновый
        glowColor: "#F48FB1",
        cssClass: "rarity-silken",
        currencyOnDuplicate: 8000,
        card: {
            name: "Hana Akano", 
            nameKey: "cards.silken.cardName",
            image: "img/cardAsian.jpg",
            descriptionKey: "cards.silken.description"
        }
    },
    {
        id: "lava",
        nameKey: "cards.lava.name",
        probabilityBase: 1 / 75000,
        color: "#E64A19", // Глубокий оранжевый
        glowColor: "#FFCC80", // Светло-оранжевое свечение
        cssClass: "rarity-lava",
        currencyOnDuplicate: 7500,
        card: {
            name: "Magmalina", 
            nameKey: "cards.lava.cardName",
            image: "img/cardLava.png",
            descriptionKey: "cards.lava.description"
        }
    },
    {
        id: "shroom",
        nameKey: "cards.shroom.name",
        probabilityBase: 1 / 70000,
        color: "#B71C1C", // Агрессивный красный мухомора
        glowColor: "#FFCDD2", // Розовое свечение
        cssClass: "rarity-shroom",
        currencyOnDuplicate: 7000,
        card: {
            name: "Amanita", 
            nameKey: "cards.shroom.cardName",
            image: "img/cardShroom.png", // Убедитесь, что файл существует
            descriptionKey: "cards.shroom.description"
        }
    },
    {
        id: "altDevil",
        nameKey: "cards.altDevil.name",
        displayParentId: "devil",
        minPrestige: 1,
        probabilityBase: 1 / 66666, // В 100 раз реже оригинала
        color: "#d1c4e9", // Бледный, покорный лавандовый
        glowColor: "#b39ddb", // Мягкое фиолетовое свечение
        cssClass: "rarity-alt-devil",
        currencyOnDuplicate: 6666,
        card: {
            name: "The Controlled", 
            nameKey: "cards.altDevil.cardName",
            image: "img/altDevil.png", // Убедитесь, что файл существует
            descriptionKey: "cards.altDevil.description"
        }
    },
    {
        id: "goblin",
        nameKey: "cards.goblin.name",
        // Нет displayParentId и minPrestige, доступна всем с начала
        probabilityBase: 1 / 50000,
        color: "#388e3c", // Грязновато-зеленый
        glowColor: "#a5d6a7", // Светло-зеленое свечение
        cssClass: "rarity-goblin", // Используем 'goblin' для уникальности класса
        currencyOnDuplicate: 5000,
        card: {
            name: "Tur'gata", 
            nameKey: "cards.goblin.cardName",
            image: "img/cardGoblin.png", // Вам нужно будет создать это изображение
            descriptionKey: "cards.goblin.description"
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
        id: "witchy",
        nameKey: "cards.witchy.name",
        minPrestige: 1,           // <<< Карта доступна только после 1-го ребёрза
        // НЕТ displayParentId, т.к. это уникальная карта со своим слотом
        probabilityBase: 1/25000, // Сделаем ее достаточно редкой
        color: "#fafafa",          // Очень светлый, почти белый цвет
        glowColor: "#7b1fa2",      // Яркое фиолетовое свечение
        cssClass: "rarity-witchy",  // Новый CSS класс
        currencyOnDuplicate: 2500,
        card: {
            name: "Jizzy, the Cummoner", 
            nameKey: "cards.witchy.cardName",
            image: "img/cardWitchy.png", // Вам нужно будет создать это изображение
            descriptionKey: "cards.witchy.description"
        }
    },
    {
        id: "neon",
        nameKey: "cards.neon.name",
        probabilityBase: 1 / 20180,
        color: "#FF1744", // Яркий неоновый красный
        glowColor: "#FF8A80", // Розовое свечение
        cssClass: "rarity-neon",
        currencyOnDuplicate: 2018,
        card: {
            name: "Neonia",
            nameKey: "cards.neon.cardName",
            image: "img/cardNeon.png",
            descriptionKey: "cards.neon.description"
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
        tags: ["futanari"], // Помечаем карту тегом для фильтрации
        safeVersion: {
            nameKey: "cards.hybrid_safe.name",
            card: {
                name: "Alex (Vanilla)",
                nameKey: "cards.hybrid_safe.cardName",
                image: "img/cardHybrid_safe.png", // Путь к "безопасному" изображению
                descriptionKey: "cards.hybrid_safe.description"
            }
        },
        card: {
            name: "Alex", 
            nameKey: "cards.hybrid.cardName",
            image: "img/cardHybrid.png", // Вам нужно будет создать это изображение
            descriptionKey: "cards.hybrid.description"
        }
    },
    {
        id: "chlorine",
        nameKey: "cards.chlorine.name",
        probabilityBase: 1 / 17000,
        color: "#8BC34A", // Светло-зеленый
        glowColor: "#FFF176", // Желтоватое свечение
        cssClass: "rarity-chlorine",
        currencyOnDuplicate: 1700,
        card: {
            name: "Chloretta",
            nameKey: "cards.chlorine.cardName",
            image: "img/cardChlorine.png",
            descriptionKey: "cards.chlorine.description"
        }
    },
    {
        id: "naruko",
        nameKey: "cards.naruko.name",
        minPrestige: 1,
        probabilityBase: 1 / 15500,
        color: "#FF9800", // Фирменный оранжевый
        glowColor: "#FFCC80", // Теплое свечение
        cssClass: "rarity-naruko",
        currencyOnDuplicate: 1550,
        card: {
            name: "Naruko", 
            nameKey: "cards.naruko.cardName",
            image: "img/cardNaruto.png", // Убедитесь, что файл существует
            descriptionKey: "cards.naruko.description"
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
        id: "smoke",
        nameKey: "cards.smoke.name",
        probabilityBase: 1 / 14000, // Рядом с другими концептуальными картами
        color: "#616161", // Серый, как дым
        glowColor: "#BDBDBD", // Пепельное свечение
        cssClass: "rarity-smoke",
        currencyOnDuplicate: 1400,
        card: {
            name: "Fuma", 
            nameKey: "cards.smoke.cardName",
            image: "img/cardSmoke.png", // Убедитесь, что файл существует
               descriptionKey: "cards.smoke.description"
        }
    },
    {
        id: "graphite",
        nameKey: "cards.graphite.name",
        displayParentId: "carbon",
        minPrestige: 1,
        probabilityBase: 1 / 13000, // Реже, чем уголь
        color: "#616161", // Графитовый
        glowColor: "#CFD8DC", // Металлическое свечение
        cssClass: "rarity-graphite",
        currencyOnDuplicate: 1300,
        card: {
            name: "Sketchy",
            nameKey: "cards.graphite.cardName",
            image: "img/altGraphite.png",
            descriptionKey: "cards.graphite.description"
        }
    },
    {
        id: "unbound_alt_1",
        nameKey: "cards.unbound_alt_1.name",
        displayParentId: "unbound",
        minPrestige: 1,
        probabilityBase: 1 / 12800, // 1/64 * 100
        color: "#e65100", // Огненно-оранжевый
        glowColor: "#ffcc80", // Светло-оранжевый
        cssClass: "rarity-unbound-alt",
        currencyOnDuplicate: 1280,
        card: {
            name: "Hanma, Awakened", 
            nameKey: "cards.unbound_alt_1.cardName",
            image: "img/altUnbound.png",
            descriptionKey: "cards.unbound_alt_1.description"
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
        mechanicalEffect: { // <<< ДОБАВЛЕНО
            type: "quality_guarantor"   
        },
        card: {
            name: "Platina", 
            nameKey: "cards.platinum.cardName",
            image: "img/cardPlatinum.png", // Вам нужно будет создать это изображение
            descriptionKey: "cards.platinum.description"
        }
    },
    {
        id: "legendary_alt_1",
        nameKey: "cards.legendary_alt_1.name",
        displayParentId: "legendary",
        minPrestige: 1,
        probabilityBase: 1/3200, // В 100 раз реже оригинала
        color: "#ff4081", // Яркий розовый, как глазурь на торте
        glowColor: "#f8bbd0", // Светло-розовый
        cssClass: "rarity-legendary-alt",
        currencyOnDuplicate: 360,
        card: {
            name: "Misa, the Party Clown", 
            nameKey: "cards.legendary_alt_1.cardName",
            image: "img/altLegendary.png", // Вам нужно будет создать это изображение
            descriptionKey: "cards.legendary_alt_1.description"
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
        mechanicalEffect: {
            type: "sword_path",
            bonusPerRoll: 0.005,
            maxBonus: 0.25,
            timeoutSeconds: 10
        },
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
        id: "epic_alt_1",
        nameKey: "cards.epic_alt_1.name",
        displayParentId: "epic",
        minPrestige: 1,
        probabilityBase: 1/1600, // В 100 раз реже оригинала
        color: "#448aff", // Яркий синий (Blue A200)
        glowColor: "#bbdefb", // Светло-голубой (Blue 100)
        cssClass: "rarity-epic-alt",
        currencyOnDuplicate: 200,
        card: {
            name: "Gael, the Blue Streak", 
            nameKey: "cards.epic_alt_1.cardName",
            image: "img/altEpic.png", // Вам нужно будет создать это изображение
            descriptionKey: "cards.epic_alt_1.description"
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
        id: "coal",
        nameKey: "cards.coal.name",
        displayParentId: "carbon",
        minPrestige: 1,
        probabilityBase: 1 / 1000, // Чуть чаще, чем углерод
        color: "#212121", // Угольно-черный
        glowColor: "#FF9800", // Огненное свечение
        cssClass: "rarity-coal",
        currencyOnDuplicate: 100,
        card: {
            name: "Ember",
            nameKey: "cards.coal.cardName",
            image: "img/altCoal.png",
            descriptionKey: "cards.coal.description"
        }
    },
    {
        id: "rare_alt_1",
        nameKey: "cards.rare_alt_1.name",
        displayParentId: "rare",
        minPrestige: 1,
        probabilityBase: 1 / 800, // 1/8 (оригинал) * 100 = 1/800
        color: "#b71c1c", // Глубокий красный
        glowColor: "#e57373", // Кроваво-красное свечение
        cssClass: "rarity-rare-alt",
        currencyOnDuplicate: 80,
        card: {
            name: "Mila, the Crimson Tear", 
            nameKey: "cards.rare_alt_1.cardName",
            image: "img/altRare.png", // Вам нужно будет создать это изображение
            descriptionKey: "cards.rare_alt_1.description"
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
        mechanicalEffect: {
            type: "high_risk_high_reward",
            rollCost: 5,
            chance: 0.005, // 0.5%
            luckBonus: 100.0
        },
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
        id: "common_alt_1",
        nameKey: "cards.common_alt_1.name",
        displayParentId: "common",
        minPrestige: 1,
        probabilityBase: 1 / 400, 
        color: "#9e9e9e",
        glowColor: "#bdbdbd", 
        cssClass: "rarity-common-alt",
        currencyOnDuplicate: 40,
        card: {
            name: "GYATT", 
            nameKey: "cards.common_alt_1.cardName",
            image: "img/altCommon.png",
            descriptionKey: "cards.common_alt_1.description"
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
        probabilityBase: 1/128,
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
        probabilityBase: 1/64,
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
        probabilityBase: 1/32,
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
        probabilityBase: 1/16,
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
        id: "carbon",
        nameKey: "cards.carbon.name",
        probabilityBase: 1 / 12, // Как ты и просил!
        color: "#424242", // Темно-серый
        glowColor: "#9E9E9E", // Серое свечение
        cssClass: "rarity-carbon",
        currencyOnDuplicate: 12,
        card: {
            name: "Life-Giver",
            nameKey: "cards.carbon.cardName",
            image: "img/cardCarbon.png",
            descriptionKey: "cards.carbon.description"
        }
    },
    {
        id: "rare",
        nameKey: "cards.rare.name",
        probabilityBase: 1/8,
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
        probabilityBase: 1/4,
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
const bottomFeederRarities = RARITIES_DATA.slice(-12).map(r => r.id);

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
        { id: "equip_pendant", nameKey: "shop.equipment.equip_pendant.name", descriptionKey: "shop.equipment.equip_pendant.description", cost: 20000, luckBonus: 0.35, type: "equipment" },
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
            cost: 5000, // Стоимость можно будет настроить
            type: "equipment",
            // luckBonus здесь нет, так как бонус динамический
            effect: { 
                type: "cumulative_luck_on_low_rolls", 
                bonusPerStack: 0.05, 
                maxStacks: 10, // Опционально: максимальное количество стаков (например, до +0.5 удачи)
                triggerRarities: ["garbage", "common", "rare"] // ID редкостей, которые стакают бонус
            }
        },
        {
            id: "equip_greedstone",
            nameKey: "shop.equipment.equip_greedstone.name",
            descriptionKey: "shop.equipment.equip_greedstone.description",
            cost: 50500,
            type: "equipment",
            effect: { type: "duplicate_currency_bonus_percent", value: 0.25 }
        },
        {
            id: "equip_distortion_chronometer",
            nameKey: "shop.equipment.equip_distortion_chronometer.name",
            descriptionKey: "shop.equipment.equip_distortion_chronometer.description",
            cost: 24000,
            type: "equipment",
            effect: { type: "lucky_roll_accelerator", rolls_reduced: 2 }
        },
        {
            id: "equip_abyssal_hand", // "Донная длань"
            nameKey: "shop.equipment.equip_abyssal_hand.name",
            descriptionKey: "shop.equipment.equip_abyssal_hand.description",
            cost: 25000,
            type: "equipment",
            effect: { 
                type: "cumulative_luck_on_low_rolls", 
                bonusPerStack: 0.05, 
                maxStacks: 15,
                triggerRarities: bottomFeederRarities 
            }
        },
        {
            id: "equip_fates_thread", // "Нить Судьбы"
            nameKey: "shop.equipment.equip_fates_thread.name",
            descriptionKey: "shop.equipment.equip_fates_thread.description",
            cost: 1250000,
            type: "equipment",
            effect: { 
                type: "preserve_item_on_rebirth" 
            }
        },
        {
            id: "equip_alchemists_stone", // "Камень Алхимика"
            nameKey: "shop.equipment.equip_alchemists_stone.name",
            descriptionKey: "shop.equipment.equip_alchemists_stone.description",
            cost: 15000000, // Ваша цена
            type: "equipment",
            effect: { 
                type: "core_fragment_chance",
                chance: 0.001, // Ваш шанс (0.1%)
                triggerRarities: bottomFeederRarities,
                fragmentsNeeded: 30 // Сколько осколков нужно для 1 уровня
            }
        }
    ],
    upgrades: [
        { id: "upgrade_fast_roll", nameKey: "shop.upgrades.upgrade_fast_roll.name", descriptionKey: "shop.upgrades.upgrade_fast_roll.description", cost: 1000, type: "permanent_upgrade", targetProperty: "fastRoll" },
        { id: "upgrade_multi_roll_x5", nameKey: "shop.upgrades.upgrade_multi_roll_x5.name", descriptionKey: "shop.upgrades.upgrade_multi_roll_x5.description", cost: 7500, type: "permanent_upgrade", targetProperty: "multiRollX5" },
        { 
            id: "upgrade_multi_roll_x10", 
            nameKey: "shop.upgrades.upgrade_multi_roll_x10.name", 
            descriptionKey: "shop.upgrades.upgrade_multi_roll_x10.description", 
            cost: 50000000, 
            type: "permanent_upgrade", 
            targetProperty: "multiRollX10" 
        },
        { 
            id: "upgrade_empowered_lucky_roll", 
            nameKey: "shop.upgrades.upgrade_empowered_lucky_roll.name", 
            descriptionKey: "shop.upgrades.upgrade_empowered_lucky_roll.description", 
            cost: 120000, 
            type: "permanent_upgrade", 
            targetProperty: "empoweredLuckyRoll" 
        },
        { 
            id: "upgrade_probability_analyzer", 
            nameKey: "shop.upgrades.upgrade_probability_analyzer.name", 
            descriptionKey: "shop.upgrades.upgrade_probability_analyzer.description", 
            cost: 100000, // Ваша цена
            type: "permanent_upgrade", 
            targetProperty: "probabilityAnalyzer" 
        }
    ]
};





// Константы для игры

const ROLL_ANIMATION_ITEMS_COUNT = 50;


/**
 * Получает данные о редкости, УЧИТЫВАЯ ПЕРЕДАННЫЕ НАСТРОЙКИ ИГРОКА.
 * @param {string} id - ID редкости.
 * @param {object} [playerData=null] - ОБЪЕКТ с данными игрока.
 * @returns {object|null} - Объект с данными о редкости или null, если не найдена.
 */
function getRarityDataById(id, playerData = null) { // <<< ДОБАВЛЕН АРГУМЕНТ
    const originalData = RARITIES_DATA.find(r => r.id === id);
    if (!originalData) return null;

    // Определяем, включен ли спец. контент. Если playerData не переданы, считаем, что включен.
    const specialContentEnabled = playerData ? playerData.specialContentEnabled : true;
    
    // Если особый контент включен ИЛИ у карты нет безопасной версии, возвращаем оригинал
    if (specialContentEnabled || !originalData.safeVersion) {
        return originalData;
    }

    // Если особый контент ОТКЛЮЧЕН и есть безопасная версия, "собираем" её
    const safeData = {
        ...originalData,
        ...originalData.safeVersion
    };

    return safeData;
}
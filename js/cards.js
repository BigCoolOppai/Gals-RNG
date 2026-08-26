// js/cards.js

// --- Mutations (card variants, not separate rarities) ---
window.MUTATIONS = {
  negative: {
    id: 'negative',
    nameKey: 'mutations.negative.name',
    cssClass: 'variant-negative',
    baseChance: window.MUTATION_BASE_CHANCE || 0.02,
    duplicateMultiplier: 2.0 // ×2 к награде за дубль
  },
  gold: {
    id: 'gold',
    nameKey: 'mutations.gold.name',
    cssClass: 'variant-gold',
    baseChance: 0.006,                // 0.6%
    duplicateMultiplier: 3.0          // x3 к награде за дубль
  },
  voided: {
    id: 'voided',
    nameKey: 'mutations.voided.name',
    cssClass: 'variant-voided',
    baseChance: 0.004,                // 0.4%
    duplicateMultiplier: 0.0,         // дубль = 0 валюты
    forceMaterialDrop: true,          // гарантия дропа
    materialMultiplier: 3             // x3 к количеству
  }
};
// Базовый шанс мутации (НЕ зависит от удачи; усиливается предметами/ивентом)
window.MUTATION_BASE_CHANCE = 0.02; // 2%

// Полный список редкостей.
// Важно: порядок должен быть от САМОЙ РЕДКОЙ к САМОЙ ЧАСТОЙ (для апгрейдов по индексам)!
window.RARITIES_DATA = [
    {
        id: "dogma",
        nameKey: "cards.dogma.name",
        minPrestige: 6, 
        probabilityBase: 1 / 1010101010, 
        color: "#ffffff", 
        glowColor: "#ffffff", 
        cssClass: "rarity-dogma", 
        currencyOnDuplicate: 101010101, 
        mechanicalEffect: {
            type: "variant_chance_bonus",
            value: 3.0 // +300% к шансу мутации
        },
        card: {
            name: "BLASPHEMY AGAINST THE HOLY SPIRIT", 
            nameKey: "cards.dogma.cardName",
            image: "img/webp/cardDogma.webp",
            descriptionKey: "cards.dogma.description"
        }
    },
    {
        id: "gal",
        nameKey: "cards.gal.name",
        minPrestige: 6, // Требует 6-го перерождения
        probabilityBase: 1 / 1000000000,
        color: "#000000",
        glowColor: "#f0f0f0",
        cssClass: "rarity-gal",
        currencyOnDuplicate: 100000000,
        card: {
            name: "Gal, the Creator",
            nameKey: "cards.gal.cardName",
            image: "img/webp/cardGal.webp",
            descriptionKey: "cards.gal.description"
        }
    },
    {
        id: "kasane_teto",
        nameKey: "cards.kasane_teto.name",
        minPrestige: 6,
        probabilityBase: 1 / 401040104,
        color: "#d32f2f", 
        glowColor: "#ff8a80",
        cssClass: "rarity-mythic", 
        currencyOnDuplicate: 40104010,
        card: {
            name: "Kasane Teto",
            nameKey: "cards.kasane_teto.cardName",
            image: "img/webp/cardTeto.webp",
            descriptionKey: "cards.kasane_teto.description"
        }
    },
    {
        id: "time_eternal",
        nameKey: "cards.time_eternal.name",
        minPrestige: 2,
        probabilityBase: 1 / 307246060,
        color: "#212121",
        glowColor: "#FFD700",
        cssClass: "rarity-time-eternal",
        currencyOnDuplicate: 30724606,
        card: {
            name: "Ananke Chrona",
            nameKey: "cards.time_eternal.cardName",
            image: "img/webp/cardTime.webp",
            descriptionKey: "cards.time_eternal.description"
        }
    },
    {
        id: "hween_slender",
        nameKey: "cards.hween_slender.name",
        minPrestige: 2,
        probabilityBase: 1 / 275666666,
        color: "#E0E0E0", glowColor: "#757575",
        cssClass: "rarity-legendary",
        currencyOnDuplicate: 27566666,
        availability: { type: 'event', eventId: 'halloween_luck_2025' },
        card: { nameKey: "cards.hween_slender.cardName", image: "img/webp/limited/halloween2025/cardSlender.webp", descriptionKey: "cards.hween_slender.description" }
    },
    {
        id: "hween_goth",
        nameKey: "cards.hween_goth.name",
        minPrestige: 3,
        probabilityBase: 1 / 250000000,
        color: "#6A1B9A", glowColor: "#AB47BC",
        cssClass: "rarity-legendary",
        currencyOnDuplicate: 25000000,
        availability: { type: 'event', eventId: 'halloween_luck_2025' },
        card: { nameKey: "cards.hween_goth.cardName", image: "img/webp/limited/halloween2025/cardGoth.webp", descriptionKey: "cards.hween_goth.description" }
    },
    {
        id: "hween_tar",
        nameKey: "cards.hween_tar.name",
        minPrestige: 1,
        probabilityBase: 1 / 225000000,
        color: "#212121", glowColor: "#616161",
        cssClass: "rarity-legendary",
        currencyOnDuplicate: 22500000,
        availability: { type: 'event', eventId: 'halloween_luck_2025' },
        card: { nameKey: "cards.hween_tar.cardName", image: "img/webp/limited/halloween2025/cardTar.webp", descriptionKey: "cards.hween_tar.description" }
    },
    {
        id: "hween_jeff",
        nameKey: "cards.hween_jeff.name",
        minPrestige: 2,
        probabilityBase: 1 / 200000000,
        color: "#ECEFF1", glowColor: "#B0BEC5",
        cssClass: "rarity-legendary",
        currencyOnDuplicate: 20000000,
        availability: { type: 'event', eventId: 'halloween_luck_2025' },
        card: { nameKey: "cards.hween_jeff.cardName", image: "img/webp/limited/halloween2025/cardJeff.webp", descriptionKey: "cards.hween_jeff.description" }
    },
    {
        id: "hween_eyeless",
        nameKey: "cards.hween_eyeless.name",
        minPrestige: 2,
        probabilityBase: 1 / 175000000,
        color: "#0D47A1", glowColor: "#1976D2",
        cssClass: "rarity-legendary",
        currencyOnDuplicate: 17500000,
        availability: { type: 'event', eventId: 'halloween_luck_2025' },
        card: { nameKey: "cards.hween_eyeless.cardName", image: "img/webp/limited/halloween2025/cardEyeless.webp", descriptionKey: "cards.hween_eyeless.description" }
    },
    {
        id: "gyro",
        nameKey: "cards.gyro.name",
        minPrestige: 4,
        probabilityBase: 1 / 161800000,
        color: "#2d5c01ff",
        glowColor: "rgba(0, 204, 4, 1)",
        cssClass: "rarity-gyro",
        currencyOnDuplicate: 16180000,
        card: {
            name: "Gyro Zeppeli",
            nameKey: "cards.gyro.cardName",
            image: "img/webp/cardGyro.webp",
            descriptionKey: "cards.gyro.description"
        }
    },
    {
        id: "hween_dullahan",
        nameKey: "cards.hween_dullahan.name",
        minPrestige: 1,
        probabilityBase: 1 / 150000000,
        color: "#4A148C", glowColor: "#9C27B0",
        cssClass: "rarity-legendary",
        currencyOnDuplicate: 15000000,
        availability: { type: 'event', eventId: 'halloween_luck_2025' },
        card: { nameKey: "cards.hween_dullahan.cardName", image: "img/webp/limited/halloween2025/cardDullahan.webp", descriptionKey: "cards.hween_dullahan.description" }
    },
    {
        id: "hween_sadako",
        nameKey: "cards.hween_sadako.name",
        probabilityBase: 1 / 110444444,
        color: "#B0C4DE",
         glowColor: "#778899",
        cssClass: "rarity-legendary",
        currencyOnDuplicate: 11000000,
        availability: { type: 'event', eventId: 'halloween_luck_2025' },
        card: { nameKey: "cards.hween_sadako.cardName", image: "img/webp/limited/halloween2025/cardSadako.webp", descriptionKey: "cards.hween_sadako.description" }
    },
    {
        id: "choco_peppermint",
        nameKey: "cards.choco_peppermint.name",
        probabilityBase: 1 / 100000000, // 1 / 100 млн
        color: "#2f3e2c", glowColor: "#b3ffcc",
        cssClass: "rarity-legendary",
        currencyOnDuplicate: 10000000,
        availability: { type: 'event', eventId: 'choco_2025' },
        card: { nameKey: "cards.choco_peppermint.cardName", image: "img/webp/limited/chocolateEvent/cardPeppermint.webp", descriptionKey: "cards.choco_peppermint.description" }
        },
    {
        id: "blackhole_alt_1",
        nameKey: "cards.blackhole_alt_1.name",
        displayParentId: "blackhole",
        minPrestige: 1,
        probabilityBase: 1 / 98765432,
        color: "#ff3d00",
        glowColor: "#ff9e80",
        cssClass: "rarity-blackhole-alt",
        currencyOnDuplicate: 9876543,
        card: {
            name: "Event Horizon",
            nameKey: "cards.blackhole_alt_1.cardName",
            image: "img/webp/altBlackhole.webp",
            descriptionKey: "cards.blackhole_alt_1.description"
        }
    },
    {
        id: "hween_nurse",
        nameKey: "cards.hween_nurse.name",
        probabilityBase: 1 / 90000000,
        color: "#F8F8FF", glowColor: "#DC143C",
        cssClass: "rarity-legendary",
        currencyOnDuplicate: 9000000,
        availability: { type: 'event', eventId: 'halloween_luck_2025' },
        card: { nameKey: "cards.hween_nurse.cardName", image: "img/webp/limited/halloween2025/cardNurse.webp", descriptionKey: "cards.hween_nurse.description" }
    },
    {
        id: "krampus",
        nameKey: "cards.krampus.name",
        minPrestige: 4,
        probabilityBase: 1 / 85000000,
        color: "#b71c1c", 
        glowColor: "#ff5252",
        cssClass: "rarity-mythic",
        currencyOnDuplicate: 8500000,
        card: {
            name: "Krampus",
            nameKey: "cards.krampus.cardName",
            image: "img/webp/cardKrampus.webp",
            descriptionKey: "cards.krampus.description"
        }
    },
    {
        id: "caramella",
        nameKey: "cards.caramella.name",
        minPrestige: 4,
        probabilityBase: 1 / 77777777,
        color: "#e040fb", 
        glowColor: "#ffff00",
        cssClass: "rarity-legendary-alt",
        currencyOnDuplicate: 7777777,
        card: {
            name: "Caramella Jester",
            nameKey: "cards.caramella.cardName",
            image: "img/webp/cardCaramellaJester.webp",
            descriptionKey: "cards.caramella.description"
        }
    },
    {
        id: "hween_furina",
        nameKey: "cards.hween_furina.name",
        minPrestige: 4,
        probabilityBase: 1 / 75000000,
        color: "#2196F3", glowColor: "#81D4FA",
        cssClass: "rarity-legendary",
        currencyOnDuplicate: 7500000,
        availability: { type: 'event', eventId: 'halloween_luck_2025' },
        card: { nameKey: "cards.hween_furina.cardName", image: "img/webp/limited/halloween2025/cardHFurina.webp", descriptionKey: "cards.hween_furina.description" }
    },
    {
        id: "hween_hybrid",
        nameKey: "cards.hween_hybrid.name",
        displayParentId: "hybrid",
        minPrestige: 4,
        probabilityBase: 1 / 70000000,
        color: "#673AB7", glowColor: "#B39DDB",
        cssClass: "rarity-legendary",
        currencyOnDuplicate: 7000000,
        tags: ["futanari", "ghost", "halloween", "costume"], // Добавим теги сразу (см. пункт 4)
        availability: { type: 'event', eventId: 'halloween_luck_2025' },
        // --- ДОБАВЛЕНО: Safe Version ---
        safeVersion: {
            nameKey: "cards.hween_hybrid_safe.name",
            card: {
                name: "Haunted Alex (Safe)", // Фолбэк имя
                nameKey: "cards.hween_hybrid_safe.cardName",
                image: "img/webp/limited/halloween2025/cardHHybrid_safe.webp",
                descriptionKey: "cards.hween_hybrid_safe.description"
            }
        },
        // -------------------------------
        card: { nameKey: "cards.hween_hybrid.cardName", image: "img/webp/limited/halloween2025/cardHHybrid.webp", descriptionKey: "cards.hween_hybrid.description" }
    },
    {
        id: "hween_scarecrow",
        nameKey: "cards.hween_scarecrow.name",
        probabilityBase: 1 / 65000000,
        color: "#8B4513", glowColor: "#D2691E",
        cssClass: "rarity-legendary",
        currencyOnDuplicate: 6500000,
        availability: { type: 'event', eventId: 'halloween_luck_2025' },
        card: { nameKey: "cards.hween_scarecrow.cardName", image: "img/webp/limited/halloween2025/cardScarecrow.webp", descriptionKey: "cards.hween_scarecrow.description" }
    },
    
    {
        id: "hween_mime",
        nameKey: "cards.hween_mime.name",
        probabilityBase: 1 / 50000441,
        color: "#1C1C1C", glowColor: "#FF0000",
        cssClass: "rarity-legendary",
        currencyOnDuplicate: 5000000,
        availability: { type: 'event', eventId: 'halloween_luck_2025' },
        card: { nameKey: "cards.hween_mime.cardName", image: "img/webp/limited/halloween2025/cardMime.webp", descriptionKey: "cards.hween_mime.description" }
    },
    {
        id: "choco_lewd",
        nameKey: "cards.choco_lewd.name",
        probabilityBase: 1 / 50000000, // 1 / 50 млн
        color: "#4a2525", glowColor: "#ffb3c6",
        cssClass: "rarity-legendary",
        currencyOnDuplicate: 5000000,
        availability: { type: 'event', eventId: 'choco_2025' },
        card: { nameKey: "cards.choco_lewd.cardName", image: "img/webp/limited/chocolateEvent/cardChocoPussy.webp", descriptionKey: "cards.choco_lewd.description" }
    },
    {
        id: "gojo_alt", 
        nameKey: "cards.gojo_alt.name",
        displayParentId: "gojo",
        minPrestige: 4,
        probabilityBase: 1 / 45000000,
        color: "#1A237E",
        glowColor: "#E91E63",
        cssClass: "rarity-malevolent",
        currencyOnDuplicate: 4500000,
        card: {
            name: "Queen of Curses", 
            nameKey: "cards.gojo_alt.cardName",
            image: "img/webp/altGojo.webp",
            descriptionKey: "cards.gojo_alt.description"
        }
    },
    {
        id: "hween_clown",
        nameKey: "cards.hween_clown.name",
        probabilityBase: 1 / 35000000,
        color: "#B22222", glowColor: "#00BFFF",
        cssClass: "rarity-legendary",
        currencyOnDuplicate: 3500000,
        availability: { type: 'event', eventId: 'halloween_luck_2025' },
        card: { nameKey: "cards.hween_clown.cardName", image: "img/webp/limited/halloween2025/cardClown.webp", descriptionKey: "cards.hween_clown.description" }
    },
    {
        id: "hween_ghostface",
        nameKey: "cards.hween_ghostface.name",
        probabilityBase: 1 / 30000000,
        color: "#240046", glowColor: "#7B2CBF",
        cssClass: "rarity-legendary",
        currencyOnDuplicate: 3000000,
        availability: { type: 'event', eventId: 'halloween_luck_2025' },
        card: { nameKey: "cards.hween_ghostface.cardName", image: "img/webp/limited/halloween2025/cardGhostface.webp", descriptionKey: "cards.hween_ghostface.description" }
    },
    {
        id: "hween_witch",
        nameKey: "cards.hween_witch.name",
        probabilityBase: 1 / 25000000,
        color: "#FFBF00", glowColor: "#FFD700",
        cssClass: "rarity-legendary",
        currencyOnDuplicate: 2500000,
        availability: { type: 'event', eventId: 'halloween_luck_2025' },
        card: { nameKey: "cards.hween_witch.cardName", image: "img/webp/limited/halloween2025/cardWitch.webp", descriptionKey: "cards.hween_witch.description" }
    },
    {
        id: "hween_ghost",
        nameKey: "cards.hween_ghost.name",
        probabilityBase: 1 / 20006660,
        color: "#ADD8E6", glowColor: "#E0FFFF",
        cssClass: "rarity-epic",
        currencyOnDuplicate: 2000000,
        availability: { type: 'event', eventId: 'halloween_luck_2025' },
        card: { nameKey: "cards.hween_ghost.cardName", image: "img/webp/limited/halloween2025/cardGhost.webp", descriptionKey: "cards.hween_ghost.description" }
    },
    {
        id: "choco_white",
        nameKey: "cards.choco_white.name",
        probabilityBase: 1 / 20000001, // 1 / 20 млн
        color: "#e8e0cc", glowColor: "#fff2c4",
        cssClass: "rarity-epic",
        currencyOnDuplicate: 2000000,
        availability: { type: 'event', eventId: 'choco_2025' },
        card: { nameKey: "cards.choco_white.cardName", image: "img/webp/limited/chocolateEvent/cardWhiteChoco.webp", descriptionKey: "cards.choco_white.description" }
    },
    {
        id: "seductress",
        nameKey: "cards.seductress.name",
        displayParentId: "vacation",
        minPrestige: 2,
        probabilityBase: 1 / 20000000,
        color: "#4A0000",
        glowColor: "#FF4D4D",
        cssClass: "rarity-seductress",
        currencyOnDuplicate: 2000000,
        card: {
            name: "Surie",
            nameKey: "cards.seductress.cardName",
            image: "img/webp/altVacation.webp",
            descriptionKey: "cards.seductress.description"
        }
    },
    {
        id: "space_marine",
        nameKey: "cards.space_marine.name",
        minPrestige: 3,
        probabilityBase: 1 / 17000000,
        color: "#1565C0", // Ультрамариновый синий
        glowColor: "#FFD700", // Золотой акцент (аквила/декор брони)
        cssClass: "rarity-zealous",
        currencyOnDuplicate: 1700000,
        card: {
            name: "Inimica Anima",
            nameKey: "cards.space_marine.cardName",
            image: "img/webp/cardSpaceMarine.webp",
            descriptionKey: "cards.space_marine.description"
        }
    },
    {
        id: "lucy_alt",
        nameKey: "cards.lucy_alt.name",
        displayParentId: "lucy",
        minPrestige: 3,
        probabilityBase: 1 / 16000000,
        color: "#8E24AA", // Фиолетово-руинный оттенок
        glowColor: "#CE93D8",
        cssClass: "rarity-legendary",
        currencyOnDuplicate: 1600000,
        card: {
            name: "Amelia",
            nameKey: "cards.lucy_alt.cardName",
            image: "img/webp/altLucy.webp",
            descriptionKey: "cards.lucy_alt.description"
        }
    },
    {
        id: "hween_eyeling",
        nameKey: "cards.hween_eyeling.name",
        probabilityBase: 1 / 15000660,
        color: "#DC143C", glowColor: "#FF6347",
        cssClass: "rarity-epic",
        currencyOnDuplicate: 1500000,
        availability: { type: 'event', eventId: 'halloween_luck_2025' },
        card: { nameKey: "cards.hween_eyeling.cardName", image: "img/webp/limited/halloween2025/cardEyeling.webp", descriptionKey: "cards.hween_eyeling.description" }
    },
    {
        id: "zeus",
        nameKey: "cards.zeus.name",
        minPrestige: 5, // <--- Добавлено
        probabilityBase: 1 / 15000030,
        color: "#00B0FF", 
        glowColor: "#FFFFFF",
        cssClass: "rarity-godly",
        currencyOnDuplicate: 1500000,
        card: {
            nameKey: "cards.zeus.cardName",
            image: "img/webp/cardZeus.webp",
            descriptionKey: "cards.zeus.description"
        }
    },
    {
        id: "gojo",
        nameKey: "cards.gojo.name",
        minPrestige: 3, // Доступна после 3 ребёрнов
        probabilityBase: 1 / 15000000,
        color: "#01579B",
        glowColor: "#81D4FA",
        cssClass: "rarity-gojo",
        currencyOnDuplicate: 1500000,
        card: {
            name: "Satsuki Gojo",
            nameKey: "cards.gojo.cardName",
            image: "img/webp/cardGojo.webp",
            descriptionKey: "cards.gojo.description"
        }
    },
    {
        id: "president",
        nameKey: "cards.president.name",
        minPrestige: 3,
        probabilityBase: 1 / 14810000,
        color: "#9c27b0",
        glowColor: "#e1bee7",
        cssClass: "rarity-president",
        currencyOnDuplicate: 1481000,
        card: {
            name: "Funny Valentine",
            nameKey: "cards.president.cardName",
            image: "img/webp/cardPresident.webp",
            descriptionKey: "cards.president.description"
        }
    },
    {
        id: "death",
        nameKey: "cards.death.name",
        minPrestige: 2,
        probabilityBase: 1 / 13666000, // 13 (смерть) + 666 (ад)
        color: "#B0BEC5", // Бледно-серый
        glowColor: "#00E5FF", // Призрачный циан
        cssClass: "rarity-legendary", // Используем существующий класс для базы
        currencyOnDuplicate: 1366600,
        card: {
            nameKey: "cards.death.cardName",
            image: "img/webp/cardDeath.webp",
            descriptionKey: "cards.death.description"
        }
    },
        {
        id: "kefla",
        nameKey: "cards.kefla.name",
        minPrestige: 2,
        probabilityBase: 1 / 13000000,
        color: "#4CAF50",
        glowColor: "#B9F6CA",
        cssClass: "rarity-kefla",
        currencyOnDuplicate: 1300000,
        card: {
            name: "Kefla",
            nameKey: "cards.kefla.cardName",
            image: "img/webp/cardKefla.webp",
            descriptionKey: "cards.kefla.description"
        }
    },
    
    {
        id: "famine",
        nameKey: "cards.famine.name",
        minPrestige: 2,
        probabilityBase: 1 / 12606006, // Отсылка к Откровению 6:6
        color: "#8D6E63", // Изможденный коричневый
        glowColor: "#FFCC80", // Сухой желтый
        cssClass: "rarity-legendary",
        currencyOnDuplicate: 1260600,
        card: {
            nameKey: "cards.famine.cardName",
            image: "img/webp/cardFamine.webp",
            descriptionKey: "cards.famine.description"
        }
    },
    {
        id: "war",
        nameKey: "cards.war.name",
        minPrestige: 2,
        probabilityBase: 1 / 12500000,
        color: "#D32F2F", 
        glowColor: "#FF5252", // Огненный красный
        cssClass: "rarity-legendary",
        currencyOnDuplicate: 1250000,
        card: {
            nameKey: "cards.war.cardName",
            image: "img/webp/cardWar.webp", // Обрати внимание на расширение .jpg
            descriptionKey: "cards.war.description"
        }
    },
    {
        id: "pestilence",
        nameKey: "cards.pestilence.name",
        minPrestige: 2,
        probabilityBase: 1 / 12400000,
        color: "#388E3C", 
        glowColor: "#76FF03", // Ядовитый зеленый
        cssClass: "rarity-legendary",
        currencyOnDuplicate: 1240000,
        card: {
            nameKey: "cards.pestilence.cardName",
            image: "img/webp/cardPestilence.webp", // Обрати внимание на расширение .jpg
            descriptionKey: "cards.pestilence.description"
        }
    },
    {
        id: "altLibrarian",
        nameKey: "cards.altLibrarian.name",
        displayParentId: "librarian",
        minPrestige: 2,
        probabilityBase: 1 / 12000000,
        color: "#c2185b",
        glowColor: "#f48fb1",
        cssClass: "rarity-alt-librarian",
        currencyOnDuplicate: 1200000,
        card: {
            name: "Vicious Scholar",
            nameKey: "cards.altLibrarian.cardName",
            image: "img/webp/altLibrarian.webp",
            descriptionKey: "cards.altLibrarian.description"
        }
    },
    {
        id: "dionysia",
        nameKey: "cards.dionysia.name",
        minPrestige: 4,
        probabilityBase: 1 / 11000000,
        color: "#6A1B9A",
        glowColor: "#9CCC65",
        cssClass: "rarity-dionysia",
        currencyOnDuplicate: 1100000,
        card: {
            name: "Dionysia",
            nameKey: "cards.dionysia.cardName",
            image: "img/webp/cardDionysia.webp",
            descriptionKey: "cards.dionysia.description"
        }
    },
    {
        id: "hween_piggy",
        nameKey: "cards.hween_piggy.name",
        probabilityBase: 1 / 10500000,
        color: "#8B0000", glowColor: "#FF4500",
        cssClass: "rarity-epic",
        currencyOnDuplicate: 1000000,
        availability: { type: 'event', eventId: 'halloween_luck_2025' },
        card: { nameKey: "cards.hween_piggy.cardName", image: "img/webp/limited/halloween2025/cardPiggy.webp", descriptionKey: "cards.hween_piggy.description" }
    },
    {
        id: "choco_espresso",
        nameKey: "cards.choco_espresso.name",
        probabilityBase: 1 / 10000002, // 1 / 10 млн
        color: "#2c1b14", glowColor: "#d1a780",
        cssClass: "rarity-epic",
        currencyOnDuplicate: 1000000,
        availability: { type: 'event', eventId: 'choco_2025' },
        card: { nameKey: "cards.choco_espresso.cardName", image: "img/webp/limited/chocolateEvent/cardEspresso.webp", descriptionKey: "cards.choco_espresso.description" }
    },
    {
        id: "bean", 
        nameKey: "cards.bean.name",
        probabilityBase: 1 / 10000001,
        color: "#4CAF50",
        glowColor: "#AED581",
        cssClass: "rarity-bean",
        currencyOnDuplicate: 1000000,
        card: {
            name: "Green Bean", 
            nameKey: "cards.bean.cardName",
            image: "img/webp/cardBean.webp",
            descriptionKey: "cards.bean.description"
        }
    },
    {
        id: "brainrot", 
        nameKey: "cards.brainrot.name",
        probabilityBase: 1 / 10000000,
        color: "#A1887F",
        glowColor: "#D7CCC8",
        cssClass: "rarity-brainrot",
        currencyOnDuplicate: 1000000,
        card: {
            name: "Bub Bub Bub Sahur", 
            nameKey: "cards.brainrot.cardName",
            image: "img/webp/cardSahur.webp",
            descriptionKey: "cards.brainrot.description"
        }
    },
    {
        id: "marika",
        nameKey: "cards.marika.name",
        minPrestige: 3,
        probabilityBase: 1 / 9999999, // 1 шанс из почти 10 миллионов
        color: "#FFD700", // Золотой
        glowColor: "#FFF8E7", // Светящийся белый/кремовый
        cssClass: "rarity-godly", // Или rarity-mythic
        currencyOnDuplicate: 999999,
        card: {
            name: "Eternal Queen",
            nameKey: "cards.marika.cardName",
            image: "img/webp/cardMarika.webp",
            descriptionKey: "cards.marika.description"
        }
    },
    {
        id: "blackhole",
        nameKey: "cards.blackhole.name",
        probabilityBase: 1 / 9876543,
        color: "#E65100",
        glowColor: "#ffca28",
        cssClass: "rarity-blackhole",
        currencyOnDuplicate: 987654,
        mechanicalEffect: {
            type: "duplicate_collector",
            luckBonusPerDuplicate: 0.01 
        },
        card: {
            name: "FY-3741 alpha",
            nameKey: "cards.blackhole.cardName",
            image: "img/webp/cardBlackHole.webp",
            descriptionKey: "cards.blackhole.description"
        }
    },
    {
        id: "easter_bunny",
        nameKey: "cards.easter_bunny.name",
        minPrestige: 2,
        probabilityBase: 1 / 8000000,
        color: "#f48fb1", 
        glowColor: "#fce4ec",
        cssClass: "rarity-legendary",
        currencyOnDuplicate: 800000,
        card: {
            name: "Easter Bunny",
            nameKey: "cards.easter_bunny.cardName",
            image: "img/webp/cardEasterBunny.webp",
            descriptionKey: "cards.easter_bunny.description"
        }
    },
    {
        id: "pulchra",
        nameKey: "cards.pulchra.name",
        probabilityBase: 1 / 7777777, 
        color: "#E91E63", 
        glowColor: "#F48FB1",
        cssClass: "rarity-mythic", 
        currencyOnDuplicate: 777777,
        card: {
            nameKey: "cards.pulchra.cardName",
            image: "img/webp/cardPulchra.webp",
            descriptionKey: "cards.pulchra.description"
        }
    },
    
    {
        id: "obsidian",
        nameKey: "cards.obsidian.name",
        displayParentId: "lava",
        minPrestige: 1,
        probabilityBase: 1 / 7500000,
        color: "#212121",
        glowColor: "#E53935",
        cssClass: "rarity-obsidian",
        currencyOnDuplicate: 750000,
        card: {
            name: "Obsidiana",
            nameKey: "cards.obsidian.cardName",
            image: "img/webp/altLava.webp",
            descriptionKey: "cards.obsidian.description"
        }
    },
    {
        id: "hornet",
        nameKey: "cards.hornet.name",
        minPrestige: 2,                       // доступна с 2-го перерождения
        probabilityBase: 1 / 7300000,         // 1 / 7 300 000
        color: "#c62828",                      // базовый цвет (красный/бордовый)
        glowColor: "#ffcdd2",                  // мягкое розово-кремовое свечение
        cssClass: "rarity-hornet",
        currencyOnDuplicate: 730000,
        card: {
            nameKey: "cards.hornet.cardName",
            image: "img/webp/cardHornet.webp",
            descriptionKey: "cards.hornet.description"
        }
    },
    {
        id: "altShroom",
        nameKey: "cards.altShroom.name",
        displayParentId: "shroom",
        minPrestige: 1,
        probabilityBase: 1 / 7000000,
        color: "#A1887F",
        glowColor: "#D7CCC8",
        cssClass: "rarity-alt-shroom",
        currencyOnDuplicate: 700000,
        card: {
            name: "Boletus",
            nameKey: "cards.altShroom.cardName",
            image: "img/webp/altShroom.webp",
            descriptionKey: "cards.altShroom.description"
        }
    },
    {
        id: "demo",
        nameKey: "cards.demo.name",
        probabilityBase: 1 / 6666666, 
        color: "#880E4F", 
        glowColor: "#FF5252",
        cssClass: "rarity-mythic",
        currencyOnDuplicate: 666666,
        card: {
            nameKey: "cards.demo.cardName",
            image: "img/webp/cardDemo.webp",
            descriptionKey: "cards.demo.description"
        }
    },
    {
        id: "ensnared",
        nameKey: "cards.ensnared.name",
        displayParentId: "guide",
        minPrestige: 1,
        probabilityBase: 1 / 6010000,
        color: "#795548",
        glowColor: "#A1887F",
        cssClass: "rarity-ensnared",
        currencyOnDuplicate: 601000,
        card: {
            name: "Elf in a Trap",
            nameKey: "cards.ensnared.cardName",
            image: "img/webp/altFrieren.webp",
            descriptionKey: "cards.ensnared.description"
        }
    },
    {
        id: "hween_jack",
        nameKey: "cards.hween_jack.name",
        probabilityBase: 1 / 5666666,
        color: "#FF7518", glowColor: "#FFD700",
        cssClass: "rarity-epic",
        currencyOnDuplicate: 500000,
        availability: { type: 'event', eventId: 'halloween_luck_2025' },
        card: { nameKey: "cards.hween_jack.cardName", image: "img/webp/limited/halloween2025/cardJack.webp", descriptionKey: "cards.hween_jack.description" }
    },
    {
        id: "goblin_alt_1",
        nameKey: "cards.goblin_alt_1.name",
        displayParentId: "goblin",
        minPrestige: 1,
        probabilityBase: 1 / 5000020,
        color: "#9CCC65",
        glowColor: "#C5E1A5",
        cssClass: "rarity-goblin-alt",
        currencyOnDuplicate: 500002,
        card: {
            name: "Satisfied Tur'gata",
            nameKey: "cards.goblin_alt_1.cardName",
            image: "img/webp/altGoblin.webp",
            descriptionKey: "cards.goblin_alt_1.description"
        }
    },
    {
        id: "choco",
        nameKey: "cards.choco.name",
        probabilityBase: 1 / 5000001, // 1 / 5 млн
        color: "#5a3a2e", glowColor: "#ffd9b3",
        cssClass: "rarity-epic",
        currencyOnDuplicate: 500000,
        availability: { type: 'event', eventId: 'choco_2025' },
        card: { nameKey: "cards.choco.cardName", image: "img/webp/limited/chocolateEvent/cardChoco.webp", descriptionKey: "cards.choco.description" }
    },
    {
        id: "tamer",
        nameKey: "cards.tamer.name",
        minPrestige: 1,
        probabilityBase: 1 / 5000000,
        color: "#FF7043",
        glowColor: "#FFAB91",
        cssClass: "rarity-tamer",
        currencyOnDuplicate: 500000,
        card: {
            name: "Nufka & Syaba",
            nameKey: "cards.tamer.cardName",
            image: "img/webp/cardTamer.webp",
            descriptionKey: "cards.tamer.description"
        }
    },
    {
        id: "raven",
        nameKey: "cards.raven.name",
        displayParentId: "amy",
        minPrestige: 1,
        probabilityBase: 1 / 4600000,
        color: "#311B92",
        glowColor: "#9575CD",
        cssClass: "rarity-raven",
        currencyOnDuplicate: 460000, // исправлено с 360 на 460000
        card: {
            name: "Raven",
            nameKey: "cards.raven.cardName",
            image: "img/webp/altAmy.webp",
            descriptionKey: "cards.raven.description"
        }
    },
    {
        id: "anubis",
        nameKey: "cards.anubis.name",
        minPrestige: 5, 
        probabilityBase: 1 / 4500000,
        color: "#FFD700", 
        glowColor: "#212121",
        cssClass: "rarity-mythic",
        currencyOnDuplicate: 450000,
        card: {
            nameKey: "cards.anubis.cardName",
            image: "img/webp/cardAnubis.webp",
            descriptionKey: "cards.anubis.description"
        }
    },
    {
        id: "aizen_traitor",
        nameKey: "cards.aizen_traitor.name",
        displayParentId: "aizen",
        minPrestige: 3,
        probabilityBase: 1 / 4200000,
        color: "#FFFFFF",
        glowColor: "#80DEEA",
        cssClass: "rarity-aizen-traitor",
        currencyOnDuplicate: 420000,
        card: {
            name: "Traitor Aizen",
            nameKey: "cards.aizen_traitor.cardName",
            image: "img/webp/altCaptain.webp",
            descriptionKey: "cards.aizen_traitor.description"
        }
    },
    {
        id: "error_alt_1",
        nameKey: "cards.error_alt_1.name",
        displayParentId: "error",
        minPrestige: 1,
        probabilityBase: 1 / 4040403,
        color: "#ff6d00",
        glowColor: "#ff9e80",
        cssClass: "rarity-error-alt",
        currencyOnDuplicate: 404403,
        mechanicalEffect: {
            type: "universal_upgrade",
            chance: 0.20,
            multiUpgradeTiers: [
                { tiers: 3, chance: 0.005 },
                { tiers: 2, chance: 0.015 }
            ]
        },
        card: {
            name: "ERROR, Corrupted Core",
            nameKey: "cards.error_alt_1.cardName",
            image: "img/webp/altError.webp",
            descriptionKey: "cards.error_alt_1.description"
        }
    },
    {
        id: "orochi",
        nameKey: "cards.orochi.name",
        minPrestige: 3,
        // отсылка к «восьми головам/хвостам»: 3,808,008
        probabilityBase: 1 / 3808008,
        color: "#0e0e10",
        glowColor: "#9e9e9e",
        cssClass: "rarity-orochi",
        currencyOnDuplicate: 380800,
        card: {
            name: "Orochi",
            nameKey: "cards.orochi.cardName",
            image: "img/webp/cardOrochi.webp",
            descriptionKey: "cards.orochi.description"
        }
    },
    {
        id: "bazil",
        nameKey: "cards.bazil.name",
        probabilityBase: 1 / 3700000,
        color: "#ff9800",
        glowColor: "#ffe0b2",
        cssClass: "rarity-bazil",
        currencyOnDuplicate: 370000,
        card: {
            name: "Кот Базилио",
            nameKey: "cards.bazil.cardName",
            image: "img/webp/cardBazil.webp",
            descriptionKey: "cards.bazil.description"
        }
    },
    {
        id: "fenek_alt",
        nameKey: "cards.fenek_alt.name",
        displayParentId: "fenek",
        minPrestige: 2,
        probabilityBase: 1 / 3600000,
        color: "#FFB74D",
        glowColor: "#FFE0B2",
        cssClass: "rarity-fenek-alt",
        currencyOnDuplicate: 360000,
        card: {
            name: "Fox Face", 
            nameKey: "cards.fenek_alt.cardName",
            image: "img/webp/altFenek.webp",
            descriptionKey: "cards.fenek_alt.description"
        }
    },
    {
        id: "salt",
        nameKey: "cards.salt.name",
        probabilityBase: 1 / 3584427,
        color: "#FFFFFF",
        glowColor: "#B0BEC5",
        cssClass: "rarity-salt",
        currencyOnDuplicate: 358442,
        card: {
            name: "NaCl-chan",
            nameKey: "cards.salt.cardName",
            image: "img/webp/cardSalt.webp",
            descriptionKey: "cards.salt.description"
        }
    },
    {
        id: "choco_common",
        nameKey: "cards.choco_common.name",
        probabilityBase: 1 / 3500001, // 1 / 3.5 млн
        color: "#6b4635", glowColor: "#ffdfb8",
        cssClass: "rarity-rare",
        currencyOnDuplicate: 350000,
        availability: { type: 'event', eventId: 'choco_2025' },
        card: { nameKey: "cards.choco_common.cardName", image: "img/webp/limited/chocolateEvent/cardCommonChocolate.webp", descriptionKey: "cards.choco_common.description" }
    },
    {
        id: "ellen_alt_student", 
        nameKey: "cards.ellen_alt_student.name",
        displayParentId: "ellen",
        minPrestige: 4,
        probabilityBase: 1 / 3500000,
        color: "#90A4AE",
        glowColor: "#E0F7FA",
        cssClass: "rarity-student",
        currencyOnDuplicate: 350000,
        card: {
            name: "Student Maid", 
            nameKey: "cards.ellen_alt_student.cardName",
            image: "img/webp/altEllen.webp",
            descriptionKey: "cards.ellen_alt_student.description"
        }
    },
    {
        id: "miyabi",
        nameKey: "cards.miyabi.name",
        minPrestige: 3,
        probabilityBase: 1 / 3200000,
        color: "#2196f3",
        glowColor: "#bbdefb",
        cssClass: "rarity-miyabi",
        currencyOnDuplicate: 320000,
        card: {
            name: "Miyabi Hoshino",
            nameKey: "cards.miyabi.cardName",
            image: "img/webp/cardMiyabi.webp",
            descriptionKey: "cards.miyabi.description"
        }
    },
    {
        id: "alt_midday",
        nameKey: "cards.alt_midday.name",
        displayParentId: "midday",
        minPrestige: 5, 
        probabilityBase: 1 / 3000986,
        color: "#FF3D00", 
        glowColor: "#FFAB40",
        cssClass: "rarity-mythic",
        currencyOnDuplicate: 300000,
        card: {
            nameKey: "cards.alt_midday.cardName",
            image: "img/webp/altMidday.webp",
            descriptionKey: "cards.alt_midday.description"
        }
    },
    {
        id: "ellen",
        nameKey: "cards.ellen.name",
        minPrestige: 2,
        probabilityBase: 1 / 3000000,
        color: "#2196F3",
        glowColor: "#81D4FA",
        cssClass: "rarity-shark",
        currencyOnDuplicate: 300000,
        card: {
            name: "Shark Maid", 
            nameKey: "cards.ellen.cardName",
            image: "img/webp/cardEllen.webp",
            descriptionKey: "cards.ellen.description"
        }
    },
    {
        id: "alt_witchy",
        nameKey: "cards.alt_witchy.name",
        displayParentId: "witchy",
        minPrestige: 2,
        probabilityBase: 1 / 2500000,
        color: "#4A148C",
        glowColor: "#E1BEE7",
        cssClass: "rarity-alt-witchy",
        currencyOnDuplicate: 250000,
        card: {
            name: "Arch-Cummoner",
            nameKey: "cards.alt_witchy.cardName",
            image: "img/webp/altWitchy.webp",
            descriptionKey: "cards.alt_witchy.description"
        }
    },
    {
        id: "alt_maternal",
        nameKey: "cards.alt_maternal.name",
        displayParentId: "maternal",
        minPrestige: 2,
        probabilityBase: 1 / 2100000,
        color: "#FFFDE7",
        glowColor: "#FFFFFF",
        cssClass: "rarity-alt-maternal",
        currencyOnDuplicate: 210000,
        card: {
            name: "The Wet Nurse",
            nameKey: "cards.alt_maternal.cardName",
            image: "img/webp/altGoat.webp",
            descriptionKey: "cards.alt_maternal.description"
        }
    },
    {
        id: "yaga",
        nameKey: "cards.yaga.name",
        minPrestige: 5, 
        probabilityBase: 1 / 2000333,
        color: "#9C27B0", 
        glowColor: "#E040FB",
        cssClass: "rarity-legendary",
        currencyOnDuplicate: 200000,
        card: {
            nameKey: "cards.yaga.cardName",
            image: "img/webp/cardYaga.webp",
            descriptionKey: "cards.yaga.description"
        }
    },
    {
        id: "choco_crema",
        nameKey: "cards.choco_crema.name",
        probabilityBase: 1 / 2000002, // 1 / 2 млн
        color: "#8b5e3c", glowColor: "#ffe0b3",
        cssClass: "rarity-rare",
        currencyOnDuplicate: 200000,
        availability: { type: 'event', eventId: 'choco_2025' },
        card: { nameKey: "cards.choco_crema.cardName", image: "img/webp/limited/chocolateEvent/cardCrema.webp", descriptionKey: "cards.choco_crema.description" }
    },
    {
        id: "shy_princess",
        nameKey: "cards.shy_princess.name",
        displayParentId: "dark_princess",
        minPrestige: 3,
        probabilityBase: 1 / 2000001,
        color: "#D1C4E9",
        glowColor: "#B39DDB",
        cssClass: "rarity-shy-princess",
        currencyOnDuplicate: 200000,
        card: {
            name: "Sofia",
            nameKey: "cards.shy_princess.cardName",
            image: "img/webp/altDarkPrincess.webp",
            descriptionKey: "cards.shy_princess.description"
        }
    },
    {
        id: "dark_princess",
        nameKey: "cards.dark_princess.name",
        minPrestige: 2,
        probabilityBase: 1 / 2000000,
        color: "#F06292",
        glowColor: "#F48FB1",
        cssClass: "rarity-dark-princess",
        currencyOnDuplicate: 200000,
        card: {
            name: "Roxie",
            nameKey: "cards.dark_princess.cardName",
            image: "img/webp/cardDarkPrincess.webp",
            descriptionKey: "cards.dark_princess.description"
        }
    },
    {
        id: "russian_alt_ussr",
        nameKey: "cards.russian_alt_ussr.name",
        displayParentId: "russian",
        minPrestige: 2,
        probabilityBase: 1 / 1991000,
        color: "#CC0000",
        glowColor: "#FFD700",
        cssClass: "rarity-russian-ussr",
        currencyOnDuplicate: 199100,
        card: {
            name: "Comrade Medvedeva",
            nameKey: "cards.russian_alt_ussr.cardName",
            image: "img/webp/alt2Russian.webp",
            descriptionKey: "cards.russian_alt_ussr.description"
        }
    },
    {
        id: "western",
        nameKey: "cards.western.name",
        minPrestige: 2,
        // год «дикого запада»: 1876
        probabilityBase: 1 / 1876000,
        color: "#6d4c41",
        glowColor: "#ffca28",
        cssClass: "rarity-western",
        currencyOnDuplicate: 187600,
        card: {
            name: "Jessie",
            nameKey: "cards.western.cardName",
            image: "img/webp/cardWestern.webp",
            descriptionKey: "cards.western.description"
        }
    },
    {
        id: "lucy",
        nameKey: "cards.lucy.name",
        probabilityBase: 1 / 1700000,
        color: "#E65100", // Теплый рыжий/офисный цвет
        glowColor: "#FFCC80",
        cssClass: "rarity-legendary",
        currencyOnDuplicate: 170000,
        card: {
            name: "Lucy",
            nameKey: "cards.lucy.cardName",
            image: "img/webp/cardLucy.webp",
            descriptionKey: "cards.lucy.description"
        }
    },
    {
        id: "empty",
        nameKey: "cards.empty.name",
        probabilityBase: 1 / 1600000,
        color: "#CFD8DC", // Холодный светло-серый
        glowColor: "#ECEFF1",
        cssClass: "rarity-legendary",
        currencyOnDuplicate: 160000,
        card: {
            nameKey: "cards.empty.cardName",
            image: "img/webp/cardEmpty.webp",
            descriptionKey: "cards.empty.description"
        }
    },
    {
        id: "empty_angry",
        nameKey: "cards.empty_angry.name",
        displayParentId: "empty",
        probabilityBase: 1 / 1600000,
        color: "#D32F2F", // Агрессивный красный
        glowColor: "#FF5252",
        cssClass: "rarity-legendary",
        currencyOnDuplicate: 160000,
        card: {
            nameKey: "cards.empty_angry.cardName",
            image: "img/webp/cardEmptyA.webp",
            descriptionKey: "cards.empty_angry.description"
        }
    },
    {
        id: "empty_sad",
        nameKey: "cards.empty_sad.name",
        displayParentId: "empty",
        probabilityBase: 1 / 1600000,
        color: "#1976D2", // Глубокий синий
        glowColor: "#448AFF",
        cssClass: "rarity-legendary",
        currencyOnDuplicate: 160000,
        card: {
            nameKey: "cards.empty_sad.cardName",
            image: "img/webp/cardEmptyS.webp",
            descriptionKey: "cards.empty_sad.description"
        }
    },
    {
        id: "empty_happy",
        nameKey: "cards.empty_happy.name",
        displayParentId: "empty",
        probabilityBase: 1 / 1600000,
        color: "#FBC02D", // Яркий желтый
        glowColor: "#FFF176",
        cssClass: "rarity-legendary",
        currencyOnDuplicate: 160000,
        card: {
            nameKey: "cards.empty_happy.cardName",
            image: "img/webp/cardEmptyH.webp",
            descriptionKey: "cards.empty_happy.description"
        }
    },
    {
        id: "empty_scared",
        nameKey: "cards.empty_scared.name",
        displayParentId: "empty",
        probabilityBase: 1 / 1600000,
        color: "#7B1FA2", // Тревожный фиолетовый
        glowColor: "#E040FB",
        cssClass: "rarity-legendary",
        currencyOnDuplicate: 160000,
        card: {
            nameKey: "cards.empty_scared.cardName",
            image: "img/webp/cardEmptyF.webp",
            descriptionKey: "cards.empty_scared.description"
        }
    },
    {
        id: "maternal",
        nameKey: "cards.maternal.name",
        minPrestige: 1,
        probabilityBase: 1 / 1592015,
        color: "#6A1B9A",
        glowColor: "#CE93D8",
        cssClass: "rarity-maternal",
        currencyOnDuplicate: 159201,
        card: {
            name: "Tutoriel",
            nameKey: "cards.maternal.cardName",
            image: "img/webp/cardGoat.webp",
            descriptionKey: "cards.maternal.description"
        }
    },
    {
        id: "sodium",
        nameKey: "cards.sodium.name",
        probabilityBase: 1 / 1551122,
        color: "#f8f8ff",
        glowColor: "#d1c4e9",
        cssClass: "rarity-sodium",
        currencyOnDuplicate: 155000,
        card: {
            name: "Natria",
            nameKey: "cards.sodium.cardName",
            image: "img/webp/cardSodium.webp",
            descriptionKey: "cards.sodium.description"
        }
    },
    {
        id: "midday",
        nameKey: "cards.midday.name",
        minPrestige: 5, 
        probabilityBase: 1 / 1500505,
        color: "#FFF9C4", 
        glowColor: "#FFFF00",
        cssClass: "rarity-legendary",
        currencyOnDuplicate: 150000,
        card: {
            nameKey: "cards.midday.cardName",
            image: "img/webp/cardMidday.webp",
            descriptionKey: "cards.midday.description"
        }
    },
    {
        id: "vacation",
        nameKey: "cards.vacation.name",
        minPrestige: 1,
        probabilityBase: 1 / 1500000,
        color: "#EF5350",
        glowColor: "#FFCDD2",
        cssClass: "rarity-vacation",
        currencyOnDuplicate: 150000,
        card: {
            name: "Zia",
            nameKey: "cards.vacation.cardName",
            image: "img/webp/cardVacation.webp",
            descriptionKey: "cards.vacation.description"
        }
    },
    {
        id: "aizen",
        nameKey: "cards.aizen.name",
        minPrestige: 2,
        probabilityBase: 1 / 1400000,
        color: "#4A148C",
        glowColor: "#D1C4E9",
        cssClass: "rarity-aizen",
        currencyOnDuplicate: 140000,
        card: {
            name: "Captain Aizen",
            nameKey: "cards.aizen.cardName",
            image: "img/webp/cardCaptain.webp",
            descriptionKey: "cards.aizen.description"
        }
    },
    {
        id: "alastor",
        nameKey: "cards.alastor.name",
        minPrestige: 1,
        probabilityBase: 1 / 1300000,
        color: "#c62828",
        glowColor: "#ef5350",
        cssClass: "rarity-alastor",
        currencyOnDuplicate: 130000,
        card: {
            name: "Radio Demoness",
            nameKey: "cards.alastor.cardName",
            image: "img/webp/cardRadio.webp",
            descriptionKey: "cards.alastor.description"
        }
    },
    {
        id: "bleached",
        nameKey: "cards.bleached.name",
        minPrestige: 2,
        probabilityBase: 1 / 1200000,
        color: "#111111",
        glowColor: "#ff6a00",
        cssClass: "rarity-bleached",
        currencyOnDuplicate: 120000,
        card: {
            name: "Substitute",
            nameKey: "cards.bleached.cardName",
            image: "img/webp/cardBleached.webp",
            descriptionKey: "cards.bleached.description"
        }
    },
    {
        id: "jade",
        nameKey: "cards.jade.name",
        minPrestige: 3,
        // MK‑11: 1/1,110,011
        probabilityBase: 1 / 1110011,
        color: "#1b5e20",
        glowColor: "#00e676",
        cssClass: "rarity-jade",
        currencyOnDuplicate: 111001,
        card: {
            name: "Emerald",
            nameKey: "cards.jade.cardName",
            image: "img/webp/cardJade.webp",
            descriptionKey: "cards.jade.description"
        }
    },
    {
        id: "harpy",
        nameKey: "cards.harpy.name",
        minPrestige: 5, // <--- Добавлено
        probabilityBase: 1 / 1100000,
        color: "#42A5F5", 
        glowColor: "#E3F2FD",
        cssClass: "rarity-legendary",
        currencyOnDuplicate: 110000,
        card: {
            nameKey: "cards.harpy.cardName",
            image: "img/webp/cardHarpy.webp",
            descriptionKey: "cards.harpy.description"
        }
    },
    {
        id: "choco_missy",
        nameKey: "cards.choco_missy.name",
        probabilityBase: 1 / 1000001, // 1 / 1 млн
        color: "#80543a", glowColor: "#ffd7a1",
        cssClass: "rarity-rare",
        currencyOnDuplicate: 100000,
        availability: { type: 'event', eventId: 'choco_2025' },
        card: { nameKey: "cards.choco_missy.cardName", image: "img/webp/limited/chocolateEvent/cardMissy.webp", descriptionKey: "cards.choco_missy.description" }
    },
    {
        id: "garbage_alt_1",
        nameKey: "cards.garbage_alt_1.name",
        displayParentId: "garbage",
        probabilityBase: 1 / 1000000,
        color: "#ff9800",
        glowColor: "#2196f3",
        cssClass: "rarity-garbage-alt",
        currencyOnDuplicate: 100000,
        card: {
            name: "Shining Idol",
            nameKey: "cards.garbage_alt_1.cardName",
            image: "img/webp/altGarbage.webp",
            descriptionKey: "cards.garbage_alt_1.description"
        }
    },
    {
        id: "scrap_golem",
        nameKey: "cards.scrap_golem.name",
        rollable: false,               // ВАЖНО: не попадает в пул ролла
        probabilityBase: 1 / 999999,   // не используется, можно любое
        color: "#8D6E63",              // тёплый «металлолом»
        glowColor: "#BCAAA4",
        cssClass: "rarity-scrap-golem",
        currencyOnDuplicate: 5000,
        card: {
            name: "Scrap Golem",
            nameKey: "cards.scrap_golem.cardName",
            image: "img/webp/cardScrapGolem.webp", // положи файл позже; временно можно любую картинку
            descriptionKey: "cards.scrap_golem.description"
        }
    },
    {
        id: "cyber_demon",
        nameKey: "cards.cyber_demon.name",
        rollable: false,
        probabilityBase: 1 / 999999,
        color: "#d50000",
        glowColor: "#ff1744",
        cssClass: "rarity-cyber-demon",
        currencyOnDuplicate: 15000,
        card: {
            name: "Cyber-Demon",
            nameKey: "cards.cyber_demon.cardName",
            image: "img/webp/cardCyberDemon.webp",
            descriptionKey: "cards.cyber_demon.description"
        }
    },
    {
        id: "celestial_being",
        nameKey: "cards.celestial_being.name",
        rollable: false,
        probabilityBase: 1 / 999999,
        color: "#FFF59D",
        glowColor: "#FFFDE7",
        cssClass: "rarity-celestial-being",
        currencyOnDuplicate: 25000,
        card: {
            name: "Celestial Being",
            nameKey: "cards.celestial_being.cardName",
            image: "img/webp/cardCelestial.webp",
            descriptionKey: "cards.celestial_being.description"
        }
    },
    {
        id: "leshy",
        nameKey: "cards.leshy.name",
        minPrestige: 5, 
        probabilityBase: 1 / 900000,
        color: "#33691E", 
        glowColor: "#8BC34A",
        cssClass: "rarity-epic",
        currencyOnDuplicate: 90000,
        card: {
            nameKey: "cards.leshy.cardName",
            image: "img/webp/cardLeshy.webp",
            descriptionKey: "cards.leshy.description"
        }
    },
    {
        id: "alice_alt_night",
        nameKey: "cards.alice_alt_night.name",
        displayParentId: "alice",
        minPrestige: 1,
        probabilityBase: 1 / 850000,
        color: "#311b92", 
        glowColor: "#b39ddb",
        cssClass: "rarity-epic",
        currencyOnDuplicate: 85000,
        card: {
            name: "Night Alice",
            nameKey: "cards.alice_alt_night.cardName",
            image: "img/webp/altAlice.webp",
            descriptionKey: "cards.alice_alt_night.description"
        }
    },
    {
        id: "silken_alt_sushi",
        nameKey: "cards.silken_alt_sushi.name",
        displayParentId: "silken",
        minPrestige: 1,
        probabilityBase: 1 / 800000,
        color: "#E57373",
        glowColor: "#FFF9C4",
        cssClass: "rarity-silken-sushi",
        currencyOnDuplicate: 80000,
        card: {
            name: "Hana Akano (Omakase)",
            nameKey: "cards.silken_alt_sushi.cardName",
            image: "img/webp/altAsian.webp",
            descriptionKey: "cards.silken_alt_sushi.description"
        }
    },
    {
        id: "frog_princess",
        nameKey: "cards.frog_princess.name",
        minPrestige: 5, 
        probabilityBase: 1 / 750000,
        color: "#76FF03", 
        glowColor: "#CCFF90",
        cssClass: "rarity-epic",
        currencyOnDuplicate: 75000,
        card: {
            nameKey: "cards.frog_princess.cardName",
            image: "img/webp/cardFrogPrincess.webp",
            descriptionKey: "cards.frog_princess.description"
        }
    },
    {
        id: "gamer",
        nameKey: "cards.gamer.name",
        minPrestige: 1,
        // отсылка к «2001»: 1/702,001
        probabilityBase: 1 / 702001,
        color: "#311b92",
        glowColor: "#7e57c2",
        cssClass: "rarity-gamer",
        currencyOnDuplicate: 70200,
        card: {
            name: "@Nagibator2001",
            nameKey: "cards.gamer.cardName",
            image: "img/webp/cardGamer.webp",
            descriptionKey: "cards.gamer.description"
        }
    },
    {
        id: "alt_mythic",
        nameKey: "cards.alt_mythic.name",
        displayParentId: "mythic",
        minPrestige: 1,
        probabilityBase: 1 / 640000,
        color: "#B71C1C",
        glowColor: "#FF8A80",
        cssClass: "rarity-alt-mythic",
        currencyOnDuplicate: 6400,
        card: {
            name: "Girlycard",
            nameKey: "cards.alt_mythic.cardName",
            image: "img/webp/altMythic.webp",
            descriptionKey: "cards.alt_mythic.description"
        }
    },
    {
        id: "guide",
        nameKey: "cards.guide.name",
        probabilityBase: 1 / 601000,
        color: "#B0BEC5",
        glowColor: "#E0E0E0",
        cssClass: "rarity-guide",
        currencyOnDuplicate: 6010,
        card: {
            name: "Mysterious Elf",
            nameKey: "cards.guide.cardName",
            image: "img/webp/cardFrieren.webp",
            descriptionKey: "cards.guide.description"
        }
    },
    {
        id: "diamond",
        nameKey: "cards.diamond.name",
        displayParentId: "carbon",
        probabilityBase: 1 / 501000,
        color: "#B2EBF2",
        glowColor: "#FFFFFF",
        cssClass: "rarity-diamond",
        currencyOnDuplicate: 50100,
        passiveEffect: {
            type: "global_purchase_discount",
            value: 0.10
        },
        card: {
            name: "Dime",
            nameKey: "cards.diamond.cardName",
            image: "img/webp/altDiamond.webp",
            descriptionKey: "cards.diamond.description"
        }
    },
    {
        id: "domovoi",
        nameKey: "cards.domovoi.name",
        minPrestige: 5,
        probabilityBase: 1 / 500000,
        color: "#795548", 
        glowColor: "#D7CCC8",
        cssClass: "rarity-epic",
        currencyOnDuplicate: 50000,
        card: {
            nameKey: "cards.domovoi.cardName",
            image: "img/webp/cardDomovoi.webp",
            descriptionKey: "cards.domovoi.description"
        }
    },
    {
        id: "amy",
        nameKey: "cards.amy.name",
        probabilityBase: 1 / 465000,
        color: "#673AB7",
        glowColor: "#B39DDB",
        cssClass: "rarity-amy",
        currencyOnDuplicate: 46500,
        card: {
            name: "Amy",
            nameKey: "cards.amy.cardName",
            image: "img/webp/cardAmy.webp",
            descriptionKey: "cards.amy.description"
        }
    },
    {
        id: "metalhead",
        nameKey: "cards.metalhead.name",
        probabilityBase: 1 / 450000,
        color: "#616161",
        glowColor: "#E0E0E0",
        cssClass: "rarity-metalhead",
        currencyOnDuplicate: 45000,
        card: {
            name: "Kori Bennington",
            nameKey: "cards.metalhead.cardName",
            image: "img/webp/cardMetal.webp",
            descriptionKey: "cards.metalhead.description"
        }
    },
    {
        id: "error",
        nameKey: "cards.error.name",
        probabilityBase: 1 / 404403,
        color: "#ff3d00",
        glowColor: "#ff6e40",
        cssClass: "rarity-error",
        currencyOnDuplicate: 40404,
        mechanicalEffect: {
            type: "universal_upgrade",
            chance: 0.10
        },
        card: {
            name: "ER-RR_R_DATA",
            nameKey: "cards.error.cardName",
            image: "img/webp/cardError.webp",
            descriptionKey: "cards.error.description"
        }
    },
    {
        id: "moon",
        nameKey: "cards.moon.name",
        probabilityBase: 1 / 384000,
        color: "#90A4AE",
        glowColor: "#ECEFF1",
        cssClass: "rarity-moon",
        currencyOnDuplicate: 38400,
        card: {
            name: "Selena",
            nameKey: "cards.moon.cardName",
            image: "img/webp/cardMoon.webp",
            descriptionKey: "cards.moon.description"
        }
    },
    {
        id: "gold",
        nameKey: "cards.gold.name",
        probabilityBase: 1 / 379000,
        color: "#FFD700",
        glowColor: "#FFF9C4",
        cssClass: "rarity-gold",
        currencyOnDuplicate: 37900,
        passiveEffect: {
            type: "duplicate_currency_bonus_percent",
            value: 0.15
        },
        card: {
            name: "Goldy",
            nameKey: "cards.gold.cardName",
            image: "img/webp/cardGold.webp",
            descriptionKey: "cards.gold.description"
        }
    },
    {
        id: "fenek",
        nameKey: "cards.fenek.name",
        minPrestige: 1,
        // «360» уши/окружность: 1/360,036
        probabilityBase: 1 / 360036,
        color: "#ffb74d",
        glowColor: "#ffe0b2",
        cssClass: "rarity-fenek",
        currencyOnDuplicate: 36003,
        card: {
            name: "Fluffy",
            nameKey: "cards.fenek.cardName",
            image: "img/webp/cardFenek.webp",
            descriptionKey: "cards.fenek.description"
        }
    },
    {
        id: "afro",
        nameKey: "cards.afro.name",
        probabilityBase: 1 / 350000,
        color: "#6A1B9A",
        glowColor: "#E1BEE7",
        cssClass: "rarity-afro",
        currencyOnDuplicate: 35000,
        card: {
            name: "Afro Queen",
            nameKey: "cards.afro.cardName",
            image: "img/webp/cardAfro.webp",
            descriptionKey: "cards.afro.description"
        }
    },
    {
        id: "nicole",
        nameKey: "cards.nicole.name",
        minPrestige: 1, // с первого перерождения
        probabilityBase: 1 / 320000,
        color: "#2c3e50",
        glowColor: "#f1c40f",
        cssClass: "rarity-nicole",
        currencyOnDuplicate: 32000,
        card: {
            nameKey: "cards.nicole.cardName",
            image: "img/webp/cardNicole.webp",
            descriptionKey: "cards.nicole.description"
        }
    },
    {
        id: "berserk_alt_1",
        nameKey: "cards.berserk_alt_1.name",
        displayParentId: "berserk",
        minPrestige: 1,
        probabilityBase: 1 / 300000,
        color: "#ffb74d",
        glowColor: "#ffe0b2",
        cssClass: "rarity-berserk-alt",
        currencyOnDuplicate: 30000,
        card: {
            name: "Stug, at Peace",
            nameKey: "cards.berserk_alt_1.cardName",
            image: "img/webp/altBerserk.webp",
            descriptionKey: "cards.berserk_alt_1.description"
        }
    },
    {
        id: "drow_alt",
        nameKey: "cards.drow_alt.name",
        displayParentId: "drow",
        minPrestige: 2,
        probabilityBase: 1 / 280000,
        color: "#311b92",
        glowColor: "#f50057",
        cssClass: "rarity-epic",
        currencyOnDuplicate: 28000,
        card: {
            name: "Drow Ranger (Unbound)",
            nameKey: "cards.drow_alt.cardName",
            image: "img/webp/altDrow.webp",
            descriptionKey: "cards.drow_alt.description"
        }
    },
    
    {
        id: "mechanic",
        nameKey: "cards.mechanic.name",
        minPrestige: 2,
        probabilityBase: 1 / 270000,
        color: "#4CAF50",
        glowColor: "#A5D6A7",
        cssClass: "rarity-mechanic",
        currencyOnDuplicate: 27000,
        card: {
            name: "Jena",
            nameKey: "cards.mechanic.cardName",
            image: "img/webp/cardMechanic.webp",
            descriptionKey: "cards.mechanic.description"
        }
    },
    {
        id: "slime",
        nameKey: "cards.slime.name",
        minPrestige: 1,
        // 256k — привет майнкрафту/степеням двойки
        probabilityBase: 1 / 256000,
        color: "#388e3c",
        glowColor: "#a5d6a7",
        cssClass: "rarity-slime",
        currencyOnDuplicate: 25600,
        card: {
            name: "CubeSlime",
            nameKey: "cards.slime.cardName",
            image: "img/webp/cardSlime.webp",
            descriptionKey: "cards.slime.description"
        }
    },
    {
        id: "uranium_alt_1",
        nameKey: "cards.uranium_alt_1.name",
        displayParentId: "uranium",
        minPrestige: 1,
        probabilityBase: 1 / 238000,
        color: "#1b5e20",
        glowColor: "#a5d6a7",
        cssClass: "rarity-uranium-alt",
        currencyOnDuplicate: 23800,
        card: {
            name: "Uranium-235",
            nameKey: "cards.uranium_alt_1.cardName",
            image: "img/webp/altUranium.webp",
            descriptionKey: "cards.uranium_alt_1.description"
        }
    },
    {
        id: "sss_dt",
        nameKey: "cards.sss_dt.name",
        displayParentId: "smokinsexystyle",
        minPrestige: 2,
        probabilityBase: 1 / 199900,
        color: "#7B1FA2",
        glowColor: "#FF4081",
        cssClass: "rarity-sss-dt",
        currencyOnDuplicate: 19990,
        card: {
            name: "Devil Trigger",
            nameKey: "cards.sss_dt.cardName",
            image: "img/webp/altSmokinSexyStyle.webp",
            descriptionKey: "cards.sss_dt.description"
        }
    },
    {
        id: "doctor",
        nameKey: "cards.doctor.name",
        probabilityBase: 1 / 192800,
        color: "#F48FB1",
        glowColor: "#F8BBD0",
        cssClass: "rarity-doctor",
        currencyOnDuplicate: 19280,
        card: {
            name: "Tina",
            nameKey: "cards.doctor.cardName",
            image: "img/webp/cardDoctor.webp",
            descriptionKey: "cards.doctor.description"
        }
    },
    {
        id: "tungsten",
        nameKey: "cards.tungsten.name",
        probabilityBase: 1 / 183840,
        color: "#B0BEC5",
        glowColor: "#ECEFF1",
        cssClass: "rarity-tungsten",
        currencyOnDuplicate: 18384,
        card: {
            name: "Tung Stenn",
            nameKey: "cards.tungsten.cardName",
            image: "img/webp/cardTungsten.webp",
            descriptionKey: "cards.tungsten.description"
        }
    },
    {
        id: "russian_alt_usa",
        nameKey: "cards.russian_alt_usa.name",
        displayParentId: "russian",
        minPrestige: 1,
        probabilityBase: 1 / 177600,
        color: "#3C3B6E",
        glowColor: "#B22234",
        cssClass: "rarity-russian-usa",
        currencyOnDuplicate: 17760,
        card: {
            name: "Miss Klyukva Liberty",
            nameKey: "cards.russian_alt_usa.cardName",
            image: "img/webp/altRussian.webp",
            descriptionKey: "cards.russian_alt_usa.description"
        }
    },
    {
        id: "alice",
        nameKey: "cards.alice.name",
        probabilityBase: 1 / 150000,
        color: "#d81b60", 
        glowColor: "#f8bbd0",
        cssClass: "rarity-rare",
        currencyOnDuplicate: 15000,
        card: {
            name: "Aunt Alice",
            nameKey: "cards.alice.cardName",
            image: "img/webp/cardAlice.webp",
            descriptionKey: "cards.alice.description"
        }
    },
    {
        id: "space_alt_2",
        nameKey: "cards.space_alt_2.name",
        displayParentId: "space",
        minPrestige: 2,
        probabilityBase: 1 / 142420,
        color: "#80deea",
        glowColor: "#ffffff",
        cssClass: "rarity-space-alt-2",
        currencyOnDuplicate: 1424,
        mechanicalEffect: {
            type: "boost_catalyst",
            multiplier: 1.25
        },
        card: {
            name: "Reality Weaver",
            nameKey: "cards.space_alt_2.cardName",
            image: "img/webp/alt2Space.webp",
            descriptionKey: "cards.space_alt_2.description"
        }
    },
    {
        id: "librarian",
        nameKey: "cards.librarian.name",
        minPrestige: 1,
        probabilityBase: 1 / 120000,
        color: "#607D8B",
        glowColor: "#B0BEC5",
        cssClass: "rarity-librarian",
        currencyOnDuplicate: 12000,
        card: {
            name: "Libra",
            nameKey: "cards.librarian.cardName",
            image: "img/webp/cardLibrarian.webp",
            descriptionKey: "cards.librarian.description"
        }
    },
    {
        id: "space_alt_1",
        nameKey: "cards.space_alt_1.name",
        displayParentId: "space",
        minPrestige: 1,
        probabilityBase: 1 / 104200,
        color: "#80deea",
        glowColor: "#ffffff",
        cssClass: "rarity-space-alt-1",
        currencyOnDuplicate: 1042, // исправлено (было 1420)
        card: {
            name: "Reality Weaver",
            nameKey: "cards.space_alt_1.cardName",
            image: "img/webp/altSpace.webp",
            descriptionKey: "cards.space_alt_1.description"
        }
    },
    {
        id: "timestop_alt_1",
        nameKey: "cards.timestop_alt_1.name",
        displayParentId: "timestop",
        minPrestige: 1,
        probabilityBase: 1 / 102400,
        color: "#b0bec5",
        glowColor: "#80deea",
        cssClass: "rarity-timestop-alt",
        currencyOnDuplicate: 10240,
        card: {
            name: "S.A.K.U.Y.A.",
            nameKey: "cards.timestop_alt_1.cardName",
            image: "img/webp/altTimestop.webp",
            descriptionKey: "cards.timestop_alt_1.description"
        }
    },
    {
        id: "rias",
        nameKey: "cards.rias.name",
        probabilityBase: 1 / 96000,
        color: "#d32f2f",
        glowColor: "#ffcdd2",
        cssClass: "rarity-rias",
        currencyOnDuplicate: 9600,
        card: {
            name: "Crimson Duchess",
            nameKey: "cards.rias.cardName",
            image: "img/webp/cardCrimson.webp",
            descriptionKey: "cards.rias.description"
        }
    },
    {
        id: "silken",
        nameKey: "cards.silken.name",
        probabilityBase: 1 / 80000,
        color: "#C2185B",
        glowColor: "#F48FB1",
        cssClass: "rarity-silken",
        currencyOnDuplicate: 8000,
        card: {
            name: "Hana Akano",
            nameKey: "cards.silken.cardName",
            image: "img/webp/cardAsian.webp",
            descriptionKey: "cards.silken.description"
        }
    },
    {
        id: "lava",
        nameKey: "cards.lava.name",
        probabilityBase: 1 / 75000,
        color: "#E64A19",
        glowColor: "#FFCC80",
        cssClass: "rarity-lava",
        currencyOnDuplicate: 7500,
        card: {
            name: "Magmalina",
            nameKey: "cards.lava.cardName",
            image: "img/webp/cardLava.webp",
            descriptionKey: "cards.lava.description"
        }
    },
    {
        id: "shroom",
        nameKey: "cards.shroom.name",
        probabilityBase: 1 / 70000,
        color: "#B71C1C",
        glowColor: "#FFCDD2",
        cssClass: "rarity-shroom",
        currencyOnDuplicate: 7000,
        card: {
            name: "Amanita",
            nameKey: "cards.shroom.cardName",
            image: "img/webp/cardShroom.webp",
            descriptionKey: "cards.shroom.description"
        }
    },
    {
        id: "altDevil",
        nameKey: "cards.altDevil.name",
        displayParentId: "devil",
        minPrestige: 1,
        probabilityBase: 1 / 66666,
        color: "#d1c4e9",
        glowColor: "#b39ddb",
        cssClass: "rarity-alt-devil",
        currencyOnDuplicate: 6666,
        card: {
            name: "The Controlled",
            nameKey: "cards.altDevil.cardName",
            image: "img/webp/altDevil.webp",
            descriptionKey: "cards.altDevil.description"
        }
    },
    {
        id: "christmas_elf",
        nameKey: "cards.christmas_elf.name",
        probabilityBase: 1 / 65000,
        color: "#2e7d32", 
        glowColor: "#81c784",
        cssClass: "rarity-rare",
        currencyOnDuplicate: 6500,
        card: {
            name: "Christmas Elf",
            nameKey: "cards.christmas_elf.cardName",
            image: "img/webp/cardChristmasElf.webp",
            descriptionKey: "cards.christmas_elf.description"
        }
    },
    {
        id: "goblin",
        nameKey: "cards.goblin.name",
        probabilityBase: 1 / 50000,
        color: "#388e3c",
        glowColor: "#a5d6a7",
        cssClass: "rarity-goblin",
        currencyOnDuplicate: 5000,
        card: {
            name: "Tur'gata",
            nameKey: "cards.goblin.cardName",
            image: "img/webp/cardGoblin.webp",
            descriptionKey: "cards.goblin.description"
        }
    },
    {
        id: "drow",
        nameKey: "cards.drow.name",
        probabilityBase: 1 / 40000,
        color: "#4a148c",
        glowColor: "#b39ddb",
        cssClass: "rarity-rare",
        currencyOnDuplicate: 4000,
        card: {
            name: "Drow Ranger",
            nameKey: "cards.drow.cardName",
            image: "img/webp/cardDrow.webp",
            descriptionKey: "cards.drow.description"
        }
    },
    {
        id: "berserk",
        nameKey: "cards.berserk.name",
        probabilityBase: 1 / 30000,
        color: "#c62828",
        glowColor: "#ff8a80",
        cssClass: "rarity-berserk",
        currencyOnDuplicate: 3000,
        card: {
            name: "Stug",
            nameKey: "cards.berserk.cardName",
            image: "img/webp/cardBerserker.webp",
            descriptionKey: "cards.berserk.description"
        }
    },
    {
        id: "witchy",
        nameKey: "cards.witchy.name",
        minPrestige: 1,
        probabilityBase: 1 / 25000,
        color: "#fafafa",
        glowColor: "#7b1fa2",
        cssClass: "rarity-witchy",
        currencyOnDuplicate: 2500,
        card: {
            name: "Jizzy, the Cummoner",
            nameKey: "cards.witchy.cardName",
            image: "img/webp/cardWitchy.webp",
            descriptionKey: "cards.witchy.description"
        }
    },
    {
        id: "neon",
        nameKey: "cards.neon.name",
        probabilityBase: 1 / 20180,
        color: "#FF1744",
        glowColor: "#FF8A80",
        cssClass: "rarity-neon",
        currencyOnDuplicate: 2018,
        card: {
            name: "Neonia",
            nameKey: "cards.neon.cardName",
            image: "img/webp/cardNeon.webp",
            descriptionKey: "cards.neon.description"
        }
    },
    {
        id: "hybrid",
        nameKey: "cards.hybrid.name",
        probabilityBase: 1 / 20000,
        color: "#6a1b9a",
        glowColor: "#64ffda",
        cssClass: "rarity-hybrid",
        currencyOnDuplicate: 2000,
        tags: ["futanari"],
        safeVersion: {
            nameKey: "cards.hybrid_safe.name",
            card: {
                name: "Alex (Vanilla)",
                nameKey: "cards.hybrid_safe.cardName",
                image: "img/webp/cardHybrid_safe.webp",
                descriptionKey: "cards.hybrid_safe.description"
            }
        },
        card: {
            name: "Alex",
            nameKey: "cards.hybrid.cardName",
            image: "img/webp/cardHybrid.webp",
            descriptionKey: "cards.hybrid.description"
        }
    },
    {
        id: "chlorine",
        nameKey: "cards.chlorine.name",
        probabilityBase: 1 / 17000,
        color: "#8BC34A",
        glowColor: "#FFF176",
        cssClass: "rarity-chlorine",
        currencyOnDuplicate: 1700,
        card: {
            name: "Chloretta",
            nameKey: "cards.chlorine.cardName",
            image: "img/webp/cardChlorine.webp",
            descriptionKey: "cards.chlorine.description"
        }
    },
    {
        id: "naruko",
        nameKey: "cards.naruko.name",
        minPrestige: 1,
        probabilityBase: 1 / 15500,
        color: "#FF9800",
        glowColor: "#FFCC80",
        cssClass: "rarity-naruko",
        currencyOnDuplicate: 1550,
        card: {
            name: "Naruko",
            nameKey: "cards.naruko.cardName",
            image: "img/webp/cardNaruto.webp",
            descriptionKey: "cards.naruko.description"
        }
    },
    {
        id: "bee",
        nameKey: "cards.bee.name",
        probabilityBase: 1 / 15000,
        color: "#ffb300",
        glowColor: "#ffd54f",
        cssClass: "rarity-bee",
        currencyOnDuplicate: 1500,
        card: {
            name: "Queen Bee",
            nameKey: "cards.bee.cardName",
            image: "img/webp/cardQueenBee.webp",
            descriptionKey: "cards.bee.description"
        }
    },
    {
        id: "smoke",
        nameKey: "cards.smoke.name",
        probabilityBase: 1 / 14000,
        color: "#616161",
        glowColor: "#BDBDBD",
        cssClass: "rarity-smoke",
        currencyOnDuplicate: 1400,
        card: {
            name: "Fuma",
            nameKey: "cards.smoke.cardName",
            image: "img/webp/cardSmoke.webp",
            descriptionKey: "cards.smoke.description"
        }
    },
    {
        id: "graphite",
        nameKey: "cards.graphite.name",
        displayParentId: "carbon",
        minPrestige: 1,
        probabilityBase: 1 / 13000,
        color: "#616161",
        glowColor: "#CFD8DC",
        cssClass: "rarity-graphite",
        currencyOnDuplicate: 1300,
        card: {
            name: "Sketchy",
            nameKey: "cards.graphite.cardName",
            image: "img/webp/altGraphite.webp",
            descriptionKey: "cards.graphite.description"
        }
    },
    {
        id: "unbound_alt_1",
        nameKey: "cards.unbound_alt_1.name",
        displayParentId: "unbound",
        minPrestige: 1,
        probabilityBase: 1 / 12800,
        color: "#e65100",
        glowColor: "#ffcc80",
        cssClass: "rarity-unbound-alt",
        currencyOnDuplicate: 1280,
        card: {
            name: "Hanma, Awakened",
            nameKey: "cards.unbound_alt_1.cardName",
            image: "img/webp/altUnbound.webp",
            descriptionKey: "cards.unbound_alt_1.description"
        }
    },
    {
        id: "russian",
        nameKey: "cards.russian.name",
        probabilityBase: 1 / 10000,
        color: "#B71C1C",
        glowColor: "#f5f5f5",
        cssClass: "rarity-russian",
        currencyOnDuplicate: 1000,
        card: {
            name: "Klyukva Medvedeva",
            nameKey: "cards.russian.cardName",
            image: "img/webp/cardRussian.webp",
            descriptionKey: "cards.russian.description"
        }
    },
    {
        id: "platinum",
        nameKey: "cards.platinum.name",
        probabilityBase: 1 / 7810,
        color: "#78909c",
        glowColor: "#ffffff",
        cssClass: "rarity-platinum",
        currencyOnDuplicate: 781,
        mechanicalEffect: {
            type: "quality_guarantor"
        },
        card: {
            name: "Platina",
            nameKey: "cards.platinum.cardName",
            image: "img/webp/cardPlatinum.webp",
            descriptionKey: "cards.platinum.description"
        }
    },
    {
        id: "elf",
        nameKey: "cards.elf.name",
        probabilityBase: 1 / 5500,
        color: "#33691e",
        glowColor: "#aed581",
        cssClass: "rarity-common",
        currencyOnDuplicate: 550,
        card: {
            name: "Aristocrat Elf",
            nameKey: "cards.elf.cardName",
            image: "img/webp/cardElf.webp",
            descriptionKey: "cards.elf.description"
        }
    },
    {
        id: "legendary_alt_1",
        nameKey: "cards.legendary_alt_1.name",
        displayParentId: "legendary",
        minPrestige: 1,
        probabilityBase: 1 / 3200,
        color: "#ff4081",
        glowColor: "#f8bbd0",
        cssClass: "rarity-legendary-alt",
        currencyOnDuplicate: 360,
        card: {
            name: "Misa, the Party Clown",
            nameKey: "cards.legendary_alt_1.cardName",
            image: "img/webp/altLegendary.webp",
            descriptionKey: "cards.legendary_alt_1.description"
        }
    },
    {
        id: "motivation",
        nameKey: "cards.motivation.name",
        probabilityBase: 1 / 2111,
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
            nameKey: "cards.motivation.cardName",
            image: "img/webp/cardMotivation.webp",
            descriptionKey: "cards.motivation.description"
        }
    },
    {
        id: "smokinsexystyle",
        nameKey: "cards.smokinsexystyle.name",
        probabilityBase: 1 / 1999,
        color: "#b71c1c",
        glowColor: "#ef9a9a",
        cssClass: "rarity-smokinsexystyle",
        currencyOnDuplicate: 199,
        card: {
            name: "Subhuman",
            nameKey: "cards.smokinsexystyle.cardName",
            image: "img/webp/cardSmokinSexyStyle.webp",
            descriptionKey: "cards.smokinsexystyle.description"
        }
    },
    {
        id: "cosmic",
        nameKey: "cards.cosmic.name",
        probabilityBase: 1 / 1618,
        color: "#311b92",
        glowColor: "#7e57c2",
        cssClass: "rarity-cosmic",
        currencyOnDuplicate: 161,
        card: {
            name: "Star Elf",
            nameKey: "cards.cosmic.cardName",
            image: "img/webp/cardCosmic.webp",
            descriptionKey: "cards.cosmic.description"
        }
    },
    {
        id: "epic_alt_1",
        nameKey: "cards.epic_alt_1.name",
        displayParentId: "epic",
        minPrestige: 1,
        probabilityBase: 1 / 1600,
        color: "#448aff",
        glowColor: "#bbdefb",
        cssClass: "rarity-epic-alt",
        currencyOnDuplicate: 200,
        card: {
            name: "Gael, the Blue Streak",
            nameKey: "cards.epic_alt_1.cardName",
            image: "img/webp/altEpic.webp",
            descriptionKey: "cards.epic_alt_1.description"
        }
    },
    {
        id: "space",
        nameKey: "cards.space.name",
        probabilityBase: 1 / 1042,
        color: "#0097a7",
        glowColor: "#80deea",
        cssClass: "rarity-space",
        currencyOnDuplicate: 142,
        card: {
            name: "Nebula Weaver",
            nameKey: "cards.space.cardName",
            image: "img/webp/cardSpace.webp",
            descriptionKey: "cards.space.description"
        }
    },
    {
        id: "timestop",
        nameKey: "cards.timestop.name",
        probabilityBase: 1 / 1024,
        color: "#FBC02D",
        glowColor: "#FFF59D",
        cssClass: "rarity-timestop",
        currencyOnDuplicate: 124,
        card: {
            name: "D.I.O.N.A.",
            nameKey: "cards.timestop.cardName",
            image: "img/webp/cardTimestop.webp",
            descriptionKey: "cards.timestop.description"
        }
    },
    {
        id: "coal",
        nameKey: "cards.coal.name",
        displayParentId: "carbon",
        minPrestige: 1,
        probabilityBase: 1 / 1000,
        color: "#212121",
        glowColor: "#FF9800",
        cssClass: "rarity-coal",
        currencyOnDuplicate: 100,
        card: {
            name: "Ember",
            nameKey: "cards.coal.cardName",
            image: "img/webp/altCoal.webp",
            descriptionKey: "cards.coal.description"
        }
    },
    {
        id: "rare_alt_1",
        nameKey: "cards.rare_alt_1.name",
        displayParentId: "rare",
        minPrestige: 1,
        probabilityBase: 1 / 800,
        color: "#b71c1c",
        glowColor: "#e57373",
        cssClass: "rarity-rare-alt",
        currencyOnDuplicate: 80,
        card: {
            name: "Mila, the Crimson Tear",
            nameKey: "cards.rare_alt_1.cardName",
            image: "img/webp/altRare.webp",
            descriptionKey: "cards.rare_alt_1.description"
        }
    },
    {
        id: "jackpot",
        nameKey: "cards.jackpot.name",
        probabilityBase: 1 / 777,
        color: "#ffb300",
        glowColor: "#ffe54c",
        cssClass: "rarity-jackpot",
        currencyOnDuplicate: 77,
        mechanicalEffect: {
            type: "high_risk_high_reward",
            rollCost: 5,
            chance: 0.005,
            luckBonus: 100.0
        },
        card: {
            name: "Hakaria",
            nameKey: "cards.jackpot.cardName",
            image: "img/webp/cardJackpot.webp",
            descriptionKey: "cards.jackpot.description"
        }
    },
    {
        id: "devil",
        nameKey: "cards.devil.name",
        probabilityBase: 1 / 666,
        color: "#a01c1c",
        glowColor: "#d73a3a",
        cssClass: "rarity-devil",
        currencyOnDuplicate: 66,
        card: {
            name: "Makima, Demon of Control",
            nameKey: "cards.devil.cardName",
            image: "img/webp/cardDevil.webp",
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
            image: "img/webp/altCommon.webp",
            descriptionKey: "cards.common_alt_1.description"
        }
    },
    {
        id: "uranium",
        nameKey: "cards.uranium.name",
        probabilityBase: 1 / 238,
        color: "#76ff03",
        glowColor: "#b0ff57",
        cssClass: "rarity-uranium",
        currencyOnDuplicate: 30,
        card: {
            name: "Uranium-chan",
            nameKey: "cards.uranium.cardName",
            image: "img/webp/cardUranium.webp",
            descriptionKey: "cards.uranium.description"
        }
    },
    {
        id: "unbound",
        nameKey: "cards.unbound.name",
        probabilityBase: 1 / 128,
        color: "#a958dd",
        glowColor: "#c386ed",
        cssClass: "rarity-unbound",
        currencyOnDuplicate: 20,
        card: {
            name: "Hanma",
            nameKey: "cards.unbound.cardName",
            image: "img/webp/cardUnbound.webp",
            descriptionKey: "cards.unbound.description"
        }
    },
    {
        id: "mythic",
        nameKey: "cards.mythic.name",
        probabilityBase: 1 / 64,
        color: "#f44336",
        glowColor: "#ff5252",
        cssClass: "rarity-mythic",
        currencyOnDuplicate: 15,
        card: {
            name: "Carmilla",
            nameKey: "cards.mythic.cardName",
            image: "img/webp/cardMythic.webp",
            descriptionKey: "cards.mythic.description"
        }
    },
    {
        id: "legendary",
        nameKey: "cards.legendary.name",
        probabilityBase: 1 / 32,
        color: "#ff9800",
        glowColor: "#ffeb3b",
        cssClass: "rarity-legendary",
        currencyOnDuplicate: 20, // 0.2.12: 10 -> 20 (дубли классики x2, Этап 3)
        card: {
            name: "Misa",
            nameKey: "cards.legendary.cardName",
            image: "img/webp/cardLegendary.webp",
            descriptionKey: "cards.legendary.description"
        }
    },
    {
        id: "epic",
        nameKey: "cards.epic.name",
        probabilityBase: 1 / 16,
        color: "#9c27b0",
        glowColor: "#ba68c8",
        cssClass: "rarity-epic",
        currencyOnDuplicate: 14, // 0.2.12: 7 -> 14 (дубли классики x2, Этап 3)
        card: {
            name: "Gael",
            nameKey: "cards.epic.cardName",
            image: "img/webp/cardEpic.webp",
            descriptionKey: "cards.epic.description"
        }
    },
    {
        id: "carbon",
        nameKey: "cards.carbon.name",
        probabilityBase: 1 / 12,
        color: "#424242",
        glowColor: "#9E9E9E",
        cssClass: "rarity-carbon",
        currencyOnDuplicate: 12,
        card: {
            name: "Life-Giver",
            nameKey: "cards.carbon.cardName",
            image: "img/webp/cardCarbon.webp",
            descriptionKey: "cards.carbon.description"
        }
    },
    {
        id: "rare",
        nameKey: "cards.rare.name",
        probabilityBase: 1 / 8,
        color: "#2196f3",
        glowColor: "#64b5f6",
        cssClass: "rarity-rare",
        currencyOnDuplicate: 10, // 0.2.12: 5 -> 10 (дубли классики x2, Этап 3)
        card: {
            name: "Mila",
            nameKey: "cards.rare.cardName",
            image: "img/webp/cardRare.webp",
            descriptionKey: "cards.rare.description"
        }
    },
    {
        id: "common",
        nameKey: "cards.common.name",
        probabilityBase: 1 / 4,
        color: "#9e9e9e",
        glowColor: "#bdbdbd",
        cssClass: "rarity-common",
        currencyOnDuplicate: 4, // 0.2.12: 2 -> 4 (дубли классики x2, Этап 3)
        card: {
            name: "Eve",
            nameKey: "cards.common.cardName",
            image: "img/webp/cardCommon.webp",
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
        // 0.2.12: мусор-дубль даёт 1 💎 — «trickle»-доход закрывает стартовую
        // долину (на удаче 1 мусор = ~53% роллов; на поздней удаче вклад
        // тает сам, так что поздней игры это незаметные 1–2%)
        currencyOnDuplicate: 1,
        card: {
            name: "Garbage Idol",
            nameKey: "cards.garbage.cardName",
            image: "img/webp/cardGarbage.webp",
            descriptionKey: "cards.garbage.description"
        }
    }
];

// Утилита: получить список "донных" редкостей для предметов
function getBottomFeederRaritiesFromRarities(list) {
    // Берём самые частые редкости (исключая мусор и специфические эффекты вроде jackpot)
    return list
        .filter(r => r.id !== 'garbage' && r.probabilityBase >= 1 / 1024 && !['jackpot'].includes(r.id))
        .sort((a, b) => b.probabilityBase - a.probabilityBase)
        .slice(0, 12)
        .map(r => r.id);
}

const bottomFeederRarities = getBottomFeederRaritiesFromRarities(RARITIES_DATA);

// Магазин
const SHOP_DATA = {
    boosts: [
        { id: "boost_small", nameKey: "shop.boosts.boost_small.name", descriptionKey: "shop.boosts.boost_small.description", cost: 75, durationSeconds: 30, luckBonus: 0.1, type: "luck_boost" },
        { id: "boost_medium", nameKey: "shop.boosts.boost_medium.name", descriptionKey: "shop.boosts.boost_medium.description", cost: 250, durationSeconds: 120, luckBonus: 0.25, type: "luck_boost" },
        { id: "boost_large", nameKey: "shop.boosts.boost_large.name", descriptionKey: "shop.boosts.boost_large.description", cost: 600, durationSeconds: 300, luckBonus: 0.5, type: "luck_boost" },
        { id: "boost_titanic", nameKey: "shop.boosts.boost_titanic.name", descriptionKey: "shop.boosts.boost_titanic.description", cost: 1500, durationSeconds: 600, luckBonus: 1.0, type: "luck_boost" },
        { id: "boost_variant",    nameKey: "shop.boosts.boost_variant.name",    descriptionKey: "shop.boosts.boost_variant.description",    cost: 12000, durationSeconds: 600, type: "variant_chance_multiplier",  multiplier: 1.5 },
        { id: "boost_materials",  nameKey: "shop.boosts.boost_materials.name",  descriptionKey: "shop.boosts.boost_materials.description",  cost: 9000,  durationSeconds: 300, type: "material_drop_multiplier",    multiplier: 1.5 },
        { id: "boost_luckyroll",  nameKey: "shop.boosts.boost_luckyroll.name",  descriptionKey: "shop.boosts.boost_luckyroll.description",  cost: 8000,  durationSeconds: 600, type: "lucky_roll_accelerator",       rolls_reduced: 1 }
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
            cost: 550,
            type: "equipment",
            effect: { type: "duplicate_currency_bonus_percent", value: 0.10 }
        },
        {
            id: "equip_hand_of_misfortune",
            nameKey: "shop.equipment.equip_hand_of_misfortune.name",
            descriptionKey: "shop.equipment.equip_hand_of_misfortune.description",
            cost: 5000,
            type: "equipment",
            effect: {
                type: "cumulative_luck_on_low_rolls",
                bonusPerStack: 0.05,
                maxStacks: 10,
                triggerRarities: ["garbage", "common", "rare"]
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
            id: "equip_abyssal_hand",
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
            id: "equip_fates_thread",
            nameKey: "shop.equipment.equip_fates_thread.name",
            descriptionKey: "shop.equipment.equip_fates_thread.description",
            cost: 1250000,
            type: "equipment",
            effect: { type: "preserve_item_on_rebirth" }
        },
        {
            id: "equip_alchemists_stone",
            nameKey: "shop.equipment.equip_alchemists_stone.name",
            descriptionKey: "shop.equipment.equip_alchemists_stone.description",
            cost: 15000000,
            type: "equipment",
            effect: {
                type: "core_fragment_chance",
                chance: 0.001,
                triggerRarities: bottomFeederRarities,
                fragmentsNeeded: 30
            }
        },
        // --- craft-only equipment (получаются только через крафт; в магазине не отображаются) ---
        {
        id: "equip_disco_glasses",
        nameKey: "shop.equipment.equip_disco_glasses.name",
        descriptionKey: "shop.equipment.equip_disco_glasses.description",
        type: "equipment",
        craftOnly: true,
        luckBonus: 1.5
        },
        {
        id: "equip_soul_badge",
        nameKey: "shop.equipment.equip_soul_badge.name",
        descriptionKey: "shop.equipment.equip_soul_badge.description",
        type: "equipment",
        craftOnly: true,
        effect: { type: "lucky_roll_accelerator", rolls_reduced: 1 }
        },
        {
        id: "equip_afro_pick",
        nameKey: "shop.equipment.equip_afro_pick.name",
        descriptionKey: "shop.equipment.equip_afro_pick.description",
        type: "equipment",
        craftOnly: true,
        effect: { type: "cumulative_luck_on_low_rolls", bonusPerStack: 0.03, maxStacks: 12, triggerRarities: bottomFeederRarities }
        },
        {
        id: "equip_catalyst_lens",
        nameKey: "shop.equipment.equip_catalyst_lens.name",
        descriptionKey: "shop.equipment.equip_catalyst_lens.description",
        type: "equipment",
        craftOnly: true,
        effect: { type: "variant_chance_bonus", value: 0.5 } // +50% к шансу мутации (аддитивно)
        },
        {
        id: "equip_refiner_gloves",
        nameKey: "shop.equipment.equip_refiner_gloves.name",
        descriptionKey: "shop.equipment.equip_refiner_gloves.description",
        type: "equipment",
        craftOnly: true,
        effect: { type: "material_drop_bonus_percent", value: 0.25 } // +25% к шансу материалов
        },
        {
        id: "equip_boost_capacitor",
        nameKey: "shop.equipment.equip_boost_capacitor.name",
        descriptionKey: "shop.equipment.equip_boost_capacitor.description",
        type: "equipment",
        craftOnly: true,
        effect: { type: "boost_duration_multiplier", value: 1.5 } // ×1.5 к длительности бустов
        },
        {
            id: "equip_queens_crown",
            nameKey: "shop.equipment.equip_queens_crown.name",
            descriptionKey: "shop.equipment.equip_queens_crown.description",
            type: "equipment",
            craftOnly: true,
            effect: { type: "duplicate_currency_bonus_percent", value: 0.40 }
        },
        {
            id: "equip_cyber_implant",
            nameKey: "shop.equipment.equip_cyber_implant.name",
            descriptionKey: "shop.equipment.equip_cyber_implant.description",
            type: "equipment",
            craftOnly: true,
            effect: { type: "lucky_roll_accelerator", rolls_reduced: 4 }
        },
        {
            id: "equip_void_amulet",
            nameKey: "shop.equipment.equip_void_amulet.name",
            descriptionKey: "shop.equipment.equip_void_amulet.description",
            type: "equipment",
            craftOnly: true,
            luckBonus: 0.5,
            effect: { type: "variant_chance_bonus", value: 1.5 }
        },
        {
            id: "equip_ouroboros_ring",
            nameKey: "shop.equipment.equip_ouroboros_ring.name",
            descriptionKey: "shop.equipment.equip_ouroboros_ring.description",
            type: "equipment",
            craftOnly: true,
            effect: { type: "cumulative_luck_on_low_rolls", bonusPerStack: 0.06, maxStacks: 25, triggerRarities: bottomFeederRarities }
        }
    ],
    upgrades: [
        { id: "upgrade_fast_roll", nameKey: "shop.upgrades.upgrade_fast_roll.name", descriptionKey: "shop.upgrades.upgrade_fast_roll.description", cost: 1000, type: "permanent_upgrade", targetProperty: "fastRoll" },
        { id: "upgrade_multi_roll_x5", nameKey: "shop.upgrades.upgrade_multi_roll_x5.name", descriptionKey: "shop.upgrades.upgrade_multi_roll_x5.description", cost: 7500, type: "permanent_upgrade", targetProperty: "multiRollX5" },
        { id: "upgrade_multi_roll_x10", nameKey: "shop.upgrades.upgrade_multi_roll_x10.name", descriptionKey: "shop.upgrades.upgrade_multi_roll_x10.description", cost: 50000000, type: "permanent_upgrade", targetProperty: "multiRollX10" },
        { id: "upgrade_empowered_lucky_roll", nameKey: "shop.upgrades.upgrade_empowered_lucky_roll.name", descriptionKey: "shop.upgrades.upgrade_empowered_lucky_roll.description", cost: 120000, type: "permanent_upgrade", targetProperty: "empoweredLuckyRoll" },
        { id: "upgrade_probability_analyzer", nameKey: "shop.upgrades.upgrade_probability_analyzer.name", descriptionKey: "shop.upgrades.upgrade_probability_analyzer.description", cost: 100000, type: "permanent_upgrade", targetProperty: "probabilityAnalyzer" }
    ]
};

// --- ОПТИМИЗАЦИЯ: Создаем Map для мгновенного поиска (O(1)) ---
// Это избавляет от необходимости использовать .find() каждый раз
window.RARITY_MAP = new Map(window.RARITIES_DATA.map(r => [r.id, r]));

/**
 * Получает данные о редкости с учётом настроек игрока (safe-версия).
 * Оптимизировано через Map.
 * @param {string} id - ID редкости.
 * @param {object|null} [playerData] - Объект данных игрока.
 * @returns {object|null}
 */
function getRarityDataById(id, playerData = (typeof Game !== 'undefined' ? Game.getPlayerData() : null)) {
    // БЫЛО: const originalData = RARITIES_DATA.find(r => r.id === id);
    // СТАЛО: Мгновенный доступ
    const originalData = window.RARITY_MAP.get(id);
    
    if (!originalData) return null;

    const specialContentEnabled = playerData ? !!playerData.specialContentEnabled : true;

    if (specialContentEnabled || !originalData.safeVersion) {
        return originalData;
    }

    // Собираем safe-версию поверх оригинала
    // Используем Object.assign для небольшой оптимизации по сравнению со спредом, но это микро-оптимизация
    return Object.assign({}, originalData, originalData.safeVersion);
}
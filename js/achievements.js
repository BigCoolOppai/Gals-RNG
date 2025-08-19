// js/achievements.js

// В этом файле мы определяем все достижения и коллекции в игре.

const ACHIEVEMENTS_DATA = {
    // ID достижения
    'roll_1000': { 
        nameKey: 'achievements.roll_1000.name',
        descriptionKey: 'achievements.roll_1000.description',
        // Условие для выполнения. Принимает объект stats игрока.
        condition: (playerData) => playerData.stats.totalRolls >= 1000,
        // Награда за выполнение
        reward: { type: 'currency', amount: 10000 }
    },
    'roll_10000': { 
        nameKey: 'achievements.roll_10000.name',
        descriptionKey: 'achievements.roll_10000.description',
        condition: (playerData) => playerData.stats.totalRolls >= 10000,
        reward: { type: 'currency', amount: 100000 }
    },
    'open_all_mythic': {
        nameKey: 'achievements.open_all_mythic.name',
        descriptionKey: 'achievements.open_all_mythic.description',
        condition: (playerData) => {
            const mythicIds = ['mythic', 'unbound', 'uranium']; // ID всех мифических карт
            return mythicIds.every(id => playerData.inventory.includes(id));
        },
        reward: { type: 'currency', amount: 25000 }
    },
    'five_rares_in_multi': {
        nameKey: 'achievements.five_rares_in_multi.name',
        descriptionKey: 'achievements.five_rares_in_multi.description',
        // Это достижение будет проверяться по-особому, внутри логики мульти-ролла
        // Здесь condition можно оставить пустым или вернуть false
        condition: () => false, 
        reward: { type: 'currency', amount: 5000 }
    },
    'unlock_salt_card': {
        nameKey: 'achievements.unlock_salt_card.name',
        descriptionKey: 'achievements.unlock_salt_card.description',
        // Условие: в инвентаре есть и Натрий, и Хлор
        condition: (playerData) => 
            playerData.inventory.includes('sodium') && playerData.inventory.includes('chlorine'),
        // У этого достижения нет прямой награды, оно просто флаг
        reward: null 
    },
    'get_salt_card': { 
        nameKey: 'achievements.get_salt_card.name',
        descriptionKey: 'achievements.get_salt_card.description',
        condition: (playerData) => playerData.inventory.includes('salt'),
        reward: { 
            type: 'ui_theme', 
            themeId: 'theme-salt',
            nameKey: 'achievements.get_salt_card.rewardName'
        }
    },
    // Достичь 2-го престижа
    'reach_prestige_2': {
    nameKey: 'achievements.reach_prestige_2.name',
    descriptionKey: 'achievements.reach_prestige_2.description',
    condition: (playerData) => playerData.prestigeLevel >= 2,
    reward: { type: 'currency', amount: 10000 }
    },
    'reach_prestige_6': {
        nameKey: 'achievements.reach_prestige_6.name',
        descriptionKey: 'achievements.reach_prestige_6.description',
        condition: (playerData) => playerData.prestigeLevel >= 6,
        reward: {
            type: 'ui_theme',
            themeId: 'theme-prestige',
            nameKey: 'achievements.reach_prestige_6.rewardName'
        }
    },
    'roll_1000000': {
        nameKey: 'achievements.roll_1000000.name',
        descriptionKey: 'achievements.roll_1000000.description',
        condition: (playerData) => playerData.stats.totalRolls >= 1000000,
        reward: { type: 'currency', amount: 1000000 }
    },
    'roll_1000000000': {
        nameKey: 'achievements.roll_1000000000.name',
        descriptionKey: 'achievements.roll_1000000000.description',
        condition: (playerData) => playerData.stats.totalRolls >= 1000000000,
        reward: { type: 'currency', amount: 100000000 }
    },
    'use_fates_thread': {
        nameKey: 'achievements.use_fates_thread.name',
        descriptionKey: 'achievements.use_fates_thread.description',
        // Это достижение будет выдаваться по событию, а не по условию
        condition: () => false, 
        reward: { type: 'currency', amount: 125000 } // Награда соразмерна стоимости предмета
    },
    'empower_core_with_stone': {
        nameKey: 'achievements.empower_core_with_stone.name',
        descriptionKey: 'achievements.empower_core_with_stone.description',
        // Это достижение также будет выдаваться по событию
        condition: () => false,
        reward: { type: 'currency', amount: 150000 } // Награда соразмерна редкости и сложности
    },
    'first_mega_rare': {
        nameKey: 'achievements.first_mega_rare.name',
        descriptionKey: 'achievements.first_mega_rare.description',
        condition: (playerData) => {
            // Находим все карты, которые реже 1/999999
            const megaRareIds = RARITIES_DATA
                .filter(r => r.probabilityBase < 1/999999)
                .map(r => r.id);
            // Проверяем, есть ли хоть одна из них в инвентаре
            return megaRareIds.some(id => playerData.inventory.includes(id));
        },
        reward: { type: 'currency', amount: 500000 }
    },
    // Получить новую карту: Bleached
    'get_bleached_card': {
    nameKey: 'achievements.get_bleached_card.name',
    descriptionKey: 'achievements.get_bleached_card.description',
    condition: (playerData) => playerData.inventory.includes('bleached'),
    reward: { type: 'currency', amount: 25000 }
    },

    // Получить новую карту: Afro
    'get_afro_card': {
    nameKey: 'achievements.get_afro_card.name',
    descriptionKey: 'achievements.get_afro_card.description',
    condition: (playerData) => playerData.inventory.includes('afro'),
    reward: { type: 'currency', amount: 15000 }
    },

    // Скрафтить 3 любых предмета/карты/темы (суммарно)
    'craft_3_items': {
    nameKey: 'achievements.craft_3_items.name',
    descriptionKey: 'achievements.craft_3_items.description',
    condition: (playerData) => (playerData.stats?.itemsCrafted || 0) >= 3,
    reward: { type: 'currency', amount: 7500 }
    },

    // Собрать 100 материалов суммарно
    'collect_100_materials_total': {
    nameKey: 'achievements.collect_100_materials_total.name',
    descriptionKey: 'achievements.collect_100_materials_total.description',
    condition: (playerData) => (playerData.stats?.materialsCollectedTotal || 0) >= 100,
    reward: { type: 'currency', amount: 5000 }
    },

    
};

const COLLECTIONS_DATA = {
    'classic_set': {
        nameKey: 'collections.classic_set.name',
        descriptionKey: 'collections.classic_set.description',
        // Список ID карт, которые нужно собрать
        cardIds: ['common', 'rare', 'epic', 'legendary', 'mythic'],
        // Награда за сбор полной коллекции
        reward: { 
            type: 'ui_theme', 
            themeId: 'theme-classic',
            nameKey: 'collections.classic_set.rewardName'
        }
    }
    // Сюда можно будет добавлять новые коллекции
};
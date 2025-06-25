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
    }
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
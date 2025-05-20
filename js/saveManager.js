// js/saveManager.js

const SaveManager = (() => {
    const SAVE_KEY = 'rngCardGameSaveData';

    const getDefaultPlayerData = () => ({
        version: "1.0.0", // Версия для возможной миграции данных в будущем
        currency: 0, // Призматические осколки
        inventory: [], // Массив ID открытых редкостей (карт)
        seenRarities: [], // Массив ID редкостей, которые игрок видел хотя бы раз
        activeBoosts: [], // { id, type, endTime, luckBonus }
        equippedItems: [], // { id, name, luckBonus } - сохраняем копии, чтобы не зависеть от изменений в SHOP_DATA
        purchasedUpgrades: {
            fastRoll: false,
            multiRollX5: false
        },
        luckyRollCounter: 0,        
        luckyRollThreshold: 11,     
        luckyRollBonusMultiplier: 2,
        misfortuneStacks: 0, // Текущее количество стаков для "Длани Неудачника"
        activeVisualEffectRarityId: null, // <<--- ДОБАВИТЬ: ID редкости карты с активным визуальным эффектом
        musicVolume: 0, // По умолчанию громкость 0
        stats: { // <--- НОВЫЙ ОБЪЕКТ СТАТИСТИКИ
        totalRolls: 0,
        // currencySpentOnRolls: 0, // Пока не нужно, если роллы бесплатные
        currencyFromDuplicates: 0,
        rollsByRarity: {} // Объект: { rarityId1: count1, rarityId2: count2, ... }
        },
        lastPlayed: new Date().toISOString()
        
    });

    const savePlayerData = (playerData) => {
        try {
            playerData.lastPlayed = new Date().toISOString();
            localStorage.setItem(SAVE_KEY, JSON.stringify(playerData));
            console.log("Game data saved.");
        } catch (error) {
            console.error("Error saving game data:", error);
            // Можно добавить уведомление для пользователя, если сохранение не удалось
        }
    };

    const loadPlayerData = () => {
        try {
            const savedData = localStorage.getItem(SAVE_KEY);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                // Здесь можно добавить логику миграции, если версия данных изменилась
                // Например, если !parsedData.version || parsedData.version < "1.0.0"
                // То можно дополнить parsedData новыми полями из getDefaultPlayerData()
                
                // Простая проверка и дополнение недостающих полей из дефолтных
                let defaultData = getDefaultPlayerData();
                let mergedData = { ...defaultData, ...parsedData };
                // Глубокое слияние для вложенных объектов
                mergedData.purchasedUpgrades = { ...defaultData.purchasedUpgrades, ...(parsedData.purchasedUpgrades || {}) };
                
                // НОВОЕ: Глубокое слияние для объекта stats
                mergedData.stats = { 
                    ...defaultData.stats, 
                    ...(parsedData.stats || {}),
                    // Убедимся, что rollsByRarity всегда объект, даже если в старом сейве его не было или stats был пуст
                    rollsByRarity: { ...(defaultData.stats.rollsByRarity || {}), ...((parsedData.stats && parsedData.stats.rollsByRarity) || {}) }
                };

                mergedData.activeBoosts = (mergedData.activeBoosts || []).filter(boost => {
                    return boost.endTime && new Date(boost.endTime) > new Date();
                });

                console.log("Game data loaded.");
                return mergedData;
            }
        } catch (error) {
            console.error("Error loading game data:", error);
            // Если ошибка загрузки (например, поврежденные данные), возвращаем дефолтные
        }
        console.log("No saved data found or error loading, starting new game.");
        return getDefaultPlayerData();
    };

    const resetPlayerData = () => {
        try {
            localStorage.removeItem(SAVE_KEY);
            console.log("Game data reset.");
            return getDefaultPlayerData(); // Возвращаем дефолтные данные для немедленного использования
        } catch (error) {
            console.error("Error resetting game data:", error);
        }
        return getDefaultPlayerData(); // На случай ошибки
    };

    return {
        savePlayerData,
        loadPlayerData,
        resetPlayerData,
        getDefaultPlayerData // Экспортируем, если понадобится где-то еще
    };
})();
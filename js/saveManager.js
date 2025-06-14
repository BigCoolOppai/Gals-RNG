// js/saveManager.js

const SaveManager = (() => {
    const SAVE_KEY = 'rngCardGameSaveData';

    const getDefaultPlayerData = () => ({
        version: "0.1.5", // Версия для возможной миграции данных в будущем
        prestigeLevel: 0,
        prestigeLuckBonus: 0.0,
        luckCoreLevel: 0,
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
                let defaultData = getDefaultPlayerData();
                let mergedData = { ...defaultData, ...parsedData };
                
                mergedData.purchasedUpgrades = { ...defaultData.purchasedUpgrades, ...(parsedData.purchasedUpgrades || {}) };
                mergedData.stats = { 
                    ...defaultData.stats, 
                    ...(parsedData.stats || {}),
                    rollsByRarity: { ...(defaultData.stats.rollsByRarity || {}), ...((parsedData.stats && parsedData.stats.rollsByRarity) || {}) }
                };

                // Фильтруем просроченные бусты
                mergedData.activeBoosts = (mergedData.activeBoosts || []).filter(boost => boost.endTime && new Date(boost.endTime) > new Date());

                // =====================================================================
                // <<< НАЧАЛО БЛОКА МИГРАЦИИ СТАРЫХ СОХРАНЕНИЙ ДЛЯ ПРЕДМЕТОВ >>>
                // =====================================================================
                if (mergedData.equippedItems && mergedData.equippedItems.length > 0) {
                    mergedData.equippedItems = mergedData.equippedItems.map(item => {
                        // Проверяем, это старый формат (с `name`) или новый (с `nameKey`)
                        if (item.name && !item.nameKey) {
                            // Это старый формат. Нужно найти ключ и преобразовать.
                            const shopDefinition = SHOP_DATA.equipment.find(shopItem => shopItem.id === item.id);
                            if (shopDefinition) {
                                return {
                                    ...item, // Копируем все старые поля (id, luckBonus, effect)
                                    nameKey: shopDefinition.nameKey, // Добавляем правильный ключ
                                    name: undefined // Удаляем старое жестко закодированное имя
                                };
                            }
                        }
                        // Если это уже новый формат или предмет не найден, возвращаем как есть
                        return item;
                    }).filter(Boolean); // Убираем предметы, которые не удалось смигрировать
                }
                // =====================================================================
                // <<< КОНЕЦ БЛОКА МИГРАЦИИ >>>
                // =====================================================================

                console.log("Game data loaded and migrated.");
                return mergedData;
            }
        } catch (error) {
            console.error("Error loading game data:", error);
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
// js/saveManager.js

const SaveManager = (() => {
    const SAVE_KEY = 'rngCardGameSaveData';

    const getDefaultPlayerData = () => ({
        version: "0.1.5", // Версия для возможной миграции данных в будущем
        prestigeLevel: 0,
        prestigeLuckBonus: 0.0,
        luckCoreLevel: 0,
        currency: 0, // Призматические осколки
        notificationsEnabled: true,
        specialContentEnabled: true,
        playerId: null, 
        isSupporter: false, 
        activeMechanicalEffect: null, // ID карты с активным механическим эффектом
        lastRollTimestamp: 0,         // Для эффекта "Путь Меча"
        motivationStacks: 0,          // Для эффекта "Путь Меча
        activeSkins: {},
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
            let playerObject; // Временный объект для данных

            if (savedData) {
                playerObject = JSON.parse(savedData);
            } else {
                // Если сохранения нет, создаем дефолтные данные
                playerObject = getDefaultPlayerData();
            }

            // --- КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ ---
            let needsResave = false; // Флаг, который покажет, нужно ли пересохранить данные

            // 1. Генерируем ID, если его нет
            if (!playerObject.playerId) {
                console.log("Player ID not found. Generating a new one.");
                playerObject.playerId = 'player_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
                needsResave = true; // Отмечаем, что нужно пересохранить
            }
            
            // 2. Объединяем с дефолтными данными, чтобы добавить новые поля из апдейтов
            const defaultData = getDefaultPlayerData();
            let mergedData = { ...defaultData, ...playerObject };

            // Дополнительные проверки (оставляем их, они полезны)
            mergedData.purchasedUpgrades = { ...defaultData.purchasedUpgrades, ...(playerObject.purchasedUpgrades || {}) };
            mergedData.stats = { 
                ...defaultData.stats, 
                ...(playerObject.stats || {}),
                rollsByRarity: { ...(defaultData.stats.rollsByRarity || {}), ...((playerObject.stats && playerObject.stats.rollsByRarity) || {}) }
            };
            mergedData.activeBoosts = (mergedData.activeBoosts || []).filter(boost => boost.endTime && new Date(boost.endTime) > new Date());
            
            // Миграция старых предметов (оставляем)
            if (mergedData.equippedItems && mergedData.equippedItems.length > 0) {
                // ... ваш код миграции ...
            }

            // 3. Если мы сгенерировали новый ID, немедленно сохраняем игру
            if (needsResave) {
                console.log("Immediately re-saving data to set the new Player ID.");
                savePlayerData(mergedData);
            }
            // --- КОНЕЦ ИСПРАВЛЕНИЯ ---

            console.log("Game data loaded successfully.");
            return mergedData;

        } catch (error) {
            console.error("Error loading game data:", error);
        }
        
        // Фоллбэк, если все сломалось
        console.log("No saved data found or error loading, starting new game.");
        const newPlayerWithId = getDefaultPlayerData();
        newPlayerWithId.playerId = 'player_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
        savePlayerData(newPlayerWithId);
        return newPlayerWithId;
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
        getDefaultPlayerData, // Экспортируем, если понадобится где-то еще
         exportSave: function() {
            try {
                const dataStr = localStorage.getItem(SAVE_KEY);
                const dataBlob = new Blob([dataStr], { type: "application/json" });
                const url = URL.createObjectURL(dataBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `gals-rng-save-${Date.now()}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                return true;
            } catch (error) {
                console.error("Error exporting save:", error);
                return false;
            }
        },
        importSave: function(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = function(event) {
                    try {
                        const importedData = JSON.parse(event.target.result);
                        // Простая валидация: проверяем наличие ключевого поля, например, 'playerId'
                        if (importedData && importedData.playerId) {
                            localStorage.setItem(SAVE_KEY, event.target.result);
                            resolve(true);
                        } else {
                            reject(new Error("Invalid save file format."));
                        }
                    } catch (error) {
                        reject(error);
                    }
                };
                reader.onerror = (error) => reject(error);
                reader.readAsText(file);
            });
        }
    };
})();
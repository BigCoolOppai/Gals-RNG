// js/game.js
const PRESTIGE_LUCK_PER_CARD = 0.015;
const Game = (() => {
    let playerData = {}; // Здесь будут храниться все данные игрока

    // --- Инициализация ---
    function init() {
        playerData = SaveManager.loadPlayerData();
        console.log("Game initialized with player data:", playerData);
        checkActiveBoosts(); // Запускаем проверку бустов при инициализации
        // UI.updateAll() будет вызван из основного скрипта после Game.init() и UI.init()
    }

    // --- Управление данными игрока ---
    function getPlayerData() {
        return playerData;
    }

    function saveGame() {
        SaveManager.savePlayerData(playerData);
    }

    function resetGame() {
        if (confirm(L.get('ui.resetWarning'))) {
            playerData = SaveManager.resetPlayerData();
            // ИСПРАВЛЕНИЕ: Используем updateAll для полного обновления
            if (typeof UI !== 'undefined' && UI.updateAll) {
                 UI.updateAll(playerData);
            }
            console.log("Game progress has been reset.");
        }
    }

    function getRebirthCost() {
        const baseCost = 1000000; // Начальная стоимость первого ребёрза
        const multiplier = 3.5;   // Цена каждого следующего ребёрза будет в 3.5 раза выше
        return Math.floor(baseCost * Math.pow(multiplier, playerData.prestigeLevel));
    }

    // --- Валюта ---
    function addCurrency(amount) {
        if (amount <= 0) return;
        playerData.currency += amount;
        console.log(`Added ${amount} currency. Total: ${playerData.currency}`);
        // ИСПРАВЛЕНИЕ: Заменяем вызовы мелких функций на один главный
        if (typeof UI !== 'undefined' && UI.updateAll) {
            UI.updateAll(getPlayerData()); 
        }
    }

    function spendCurrency(amount) {
        if (playerData.currency >= amount) {
            playerData.currency -= amount;
            console.log(`Spent ${amount} currency. Remaining: ${playerData.currency}`);
            return true;
        }
        console.log(`Not enough currency. Needed: ${amount}, Has: ${playerData.currency}`);
        if(typeof UI !== 'undefined' && UI.showNotification) {
            UI.showNotification(L.get('notifications.notEnoughCurrency'), 'danger');
        }
        return false;
    }

    function setMusicVolume(volume) {
        if (playerData.musicVolume !== volume) {
            playerData.musicVolume = volume;
            saveGame();
        }
    }

    // --- Инвентарь и Редкости ---
    function addCardToInventory(rarityId) {
        const rarityData = getRarityDataById(rarityId);
        if (!rarityData) return;

        let isNew = false;
        if (!playerData.inventory.includes(rarityId)) {
            playerData.inventory.push(rarityId);
            isNew = true;
        }

        // <<< НАЧАЛО ИЗМЕНЕНИЯ >>>
        // Если это альт-карта, а родительская еще не открыта,
        // добавляем родительскую в инвентарь, чтобы слот появился.
        if (rarityData.displayParentId && !playerData.inventory.includes(rarityData.displayParentId)) {
            playerData.inventory.push(rarityData.displayParentId);
        }
        // <<< КОНЕЦ ИЗМЕНЕНИЯ >>>

        if (!playerData.seenRarities.includes(rarityId)) {
            playerData.seenRarities.push(rarityId);
        }
        return isNew;
    }

    // Rebirth
    function performRebirth() {
        const cost = getRebirthCost();
        if (playerData.currency < cost) {
            UI.showNotification(L.get('notifications.notEnoughForRebirth'), 'danger');
            return;
        }

        if (confirm(L.get('ui.rebirth.confirmation'))) {
            const uniqueCardsCount = new Set(playerData.inventory.filter(id => id !== 'garbage')).size;
            const luckBonus = uniqueCardsCount * PRESTIGE_LUCK_PER_CARD;

            const defaultData = SaveManager.getDefaultPlayerData();
            
            playerData.currency = 0;
            playerData.activeBoosts = [];
            playerData.equippedItems = [];
            playerData.luckCoreLevel = 0;
            playerData.misfortuneStacks = 0;
            playerData.purchasedUpgrades = defaultData.purchasedUpgrades;

            playerData.prestigeLevel++;
            playerData.prestigeLuckBonus += luckBonus;

            saveGame();
            UI.showNotification(`${L.get('ui.rebirth.success')} +${luckBonus.toFixed(3)} ${L.get('ui.luck').toLowerCase()}`, 'success', 8000);
            UI.updateAll(playerData);
        }
    }

    // --- Удача ---
    function calculateCurrentLuck() {
        const luckFromCore = (playerData.luckCoreLevel || 0) * 0.01;
        let currentDisplayLuck = BASE_LUCK + luckFromCore + (playerData.prestigeLuckBonus || 0);
        
        // ИСПРАВЛЕНИЕ: Объявление переменной вынесено сюда, в начало функции.
        let misfortuneBonus = 0;

        playerData.equippedItems.forEach(item => {
            if (item.luckBonus) {
                currentDisplayLuck += item.luckBonus;
            }
            if (item.effect && item.effect.type === "cumulative_luck_on_low_rolls") {
                const currentStacks = playerData.misfortuneStacks || 0;
                let bonusFromStacks = currentStacks * item.effect.bonusPerStack;
                if (item.effect.maxStacks) {
                    bonusFromStacks = Math.min(bonusFromStacks, item.effect.maxStacks * item.effect.bonusPerStack);
                }
                // Присваиваем значение, а не переобъявляем
                misfortuneBonus = bonusFromStacks; 
            }
        });

        // Теперь переменная misfortuneBonus здесь видна
        currentDisplayLuck += misfortuneBonus;
        
        let maxBoostBonus = 0;
        playerData.activeBoosts.forEach(boost => {
            if (boost.type === "luck_boost" && boost.luckBonus > maxBoostBonus) {
                maxBoostBonus = boost.luckBonus;
            }
        });
        currentDisplayLuck += maxBoostBonus;
        
        return parseFloat(currentDisplayLuck.toFixed(2));
    }

    function getEffectiveLuck() {
        let effectiveLuck = BASE_LUCK + (playerData.prestigeLuckBonus || 0);
        let misfortuneBonus = 0;
    
        // Бонусы от экипировки
        playerData.equippedItems.forEach(item => {
            if (item.luckBonus) {
                effectiveLuck += item.luckBonus;
            }
            if (item.effect && item.effect.type === "cumulative_luck_on_low_rolls") {
                if (playerData.misfortuneStacks === undefined) playerData.misfortuneStacks = 0;
                let currentMisfortuneBonus = playerData.misfortuneStacks * item.effect.bonusPerStack;
                if (item.effect.maxStacks) {
                    currentMisfortuneBonus = Math.min(currentMisfortuneBonus, item.effect.maxStacks * item.effect.bonusPerStack);
                }
                misfortuneBonus += currentMisfortuneBonus;
            }
        });
        effectiveLuck += misfortuneBonus;
    
        // Самый сильный активный буст удачи
        let maxBoostBonus = 0;
        playerData.activeBoosts.forEach(boost => {
            if (boost.type === "luck_boost" && boost.luckBonus > maxBoostBonus) {
                maxBoostBonus = boost.luckBonus;
            }
        });
        effectiveLuck += maxBoostBonus;
        
        return parseFloat(effectiveLuck.toFixed(2)); // Возвращаем базовую эффективную удачу
    }

    // Новая функция для расчета стоимости
    function getLuckCoreAmplificationCost() {
        const baseCost = 7500; // Начальная стоимость
        const multiplier = 1.15; // Множитель (15% за уровень)
        return Math.floor(baseCost * Math.pow(multiplier, playerData.luckCoreLevel));
    }

    // Новая функция для покупки улучшения
    function amplifyLuckCore() {
        const cost = getLuckCoreAmplificationCost();
        if (spendCurrency(cost)) {
            playerData.luckCoreLevel++;
            console.log(`Luck Core amplified to level ${playerData.luckCoreLevel}. New permanent bonus: +${(playerData.luckCoreLevel * 0.01).toFixed(2)}`);
            saveGame();
            // Обновляем UI, чтобы показать новый бонус и новую цену
            if (typeof UI !== 'undefined') {
                UI.updateAll(getPlayerData());
            }
        }
    }
    
    // --- Ролл Карточек ---
    function performRoll(guaranteedRarityId = null) {
        // Фильтруем пул карт по уровню престижа игрока
        const availableRarities = RARITIES_DATA.filter(r => 
            (r.minPrestige || 0) <= playerData.prestigeLevel
        );
        // --- НАЧАЛО БЛОКА ДЛЯ ЛАКИ РОЛЛА ---
        let isLuckyRollActiveThisRoll = false; // Флаг, был ли этот ролл Лаки
        let currentLuckMultiplier = 1.0; // Множитель по умолчанию

        // Инициализация полей Лаки Ролла в playerData
        if (playerData.luckyRollCounter === undefined) playerData.luckyRollCounter = 0;
        if (playerData.luckyRollThreshold === undefined) playerData.luckyRollThreshold = 11;
        if (playerData.luckyRollBonusMultiplier === undefined) playerData.luckyRollBonusMultiplier = 2;

        playerData.luckyRollCounter++; 

        if (playerData.luckyRollCounter >= playerData.luckyRollThreshold) {
            isLuckyRollActiveThisRoll = true; // Отмечаем, что этот ролл - Лаки
            currentLuckMultiplier = playerData.luckyRollBonusMultiplier;
            console.log(`✨ LUCKY ROLL TRIGGERED! Luck will be multiplied by ${currentLuckMultiplier}. Counter reset.`);
            playerData.luckyRollCounter = 0; // Сбрасываем счетчик НЕМЕДЛЕННО
            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification(L.get('notifications.luckyRollTriggered'), "success");
            }
        }
        // --- КОНЕЦ БЛОКА ДЛЯ ЛАКИ РОЛЛА ---

        // Обновляем UI для счетчика Lucky Roll СРАЗУ ПОСЛЕ обновления счетчика
        if (typeof UI !== 'undefined' && UI.updateLuckyRollDisplay) {
            UI.updateLuckyRollDisplay(playerData.luckyRollCounter, playerData.luckyRollThreshold);
        }
        if (!playerData.stats) { // На всякий случай, если stats не инициализирован (хотя saveManager должен это делать)
            playerData.stats = SaveManager.getDefaultPlayerData().stats;
        }
        playerData.stats.totalRolls++;

        const baseEffectiveLuck = getEffectiveLuck(); // Получаем базовую удачу без учета Лаки Ролла
        // Применяем множитель Лаки Ролла (currentLuckMultiplier будет 1.0, если это не Лаки Ролл)
        const finalEffectiveLuck = parseFloat((baseEffectiveLuck * currentLuckMultiplier).toFixed(2));
        
        console.log(`Performing roll. BaseLuck: ${baseEffectiveLuck}, LuckyMultiplier: ${currentLuckMultiplier}, FinalEffectiveLuck: ${finalEffectiveLuck}`);

        // let remainingProbability = 1.0; // Как вы и указали, не используется активно
        let determinedRarityId = null;

        if (guaranteedRarityId && getRarityDataById(guaranteedRarityId)) {
        determinedRarityId = guaranteedRarityId;
        console.log(`Performing GUARANTEED roll for: ${guaranteedRarityId}`);
        } else {

        for (const rarity of availableRarities) {
            if (rarity.id === 'garbage') continue;

            let P_base = rarity.probabilityBase;
            let odds = P_base / (1 - P_base);
            if (1 - P_base <= 0) {
                odds = Number.MAX_SAFE_INTEGER;
            }
            let modifiedOdds = odds * finalEffectiveLuck; // Используем finalEffectiveLuck
            let effectiveProbabilityForTier = modifiedOdds / (1 + modifiedOdds);
                
            const randomRoll = Math.random();

            if (randomRoll < effectiveProbabilityForTier) {
                determinedRarityId = rarity.id;
                break; // Выходим из цикла, как только редкость определена
            }
        }

        // Если после цикла ничего не определено, выпадает "мусор"
        if (!determinedRarityId) {
            const garbageRarity = RARITIES_DATA.find(r => r.id === 'garbage');
            if (garbageRarity) {
                determinedRarityId = garbageRarity.id;
            } else {
                console.error("Fallback 'garbage' rarity not found!");
                determinedRarityId = RARITIES_DATA[RARITIES_DATA.length - 1].id;
            }
        }
    }
        
        // Передаем determinedRarityId в processRollResult.
        // Флаг isLuckyRollActiveThisRoll можно передать, если он нужен в processRollResult для каких-то эффектов.
        // Для текущих двух артефактов он не нужен в processRollResult.
        return processRollResult(determinedRarityId /*, isLuckyRollActiveThisRoll */); 
}
    
    function processRollResult(rarityId) { // Убрали wasLuckyRoll, т.к. не используется здесь
        const rarityData = getRarityDataById(rarityId);
        if (!rarityData) {
            console.error(`Rarity data not found for ID: ${rarityId}`);
            // Возвращаем объект ошибки, чтобы UI мог это обработать или показать что-то дефолтное
            return {
                card: { name: "Ошибка Карты", image: "", description: "Данные о карте не найдены." },
                rarity: { id: "error_rarity", name: "Неизвестно", color: "#fff", glowColor: "#fff", cssClass: "" },
                isNew: false,
                duplicateReward: 0
            };
        }

        const isNew = addCardToInventory(rarityId); // addCardToInventory остается без изменений
        let baseDuplicateReward = 0;

        if (!isNew) {
            baseDuplicateReward = rarityData.currencyOnDuplicate || 0;
        }

        // Применяем бонус "Золотого Билета"
        let finalDuplicateReward = baseDuplicateReward;
        const goldenTicketEquipped = playerData.equippedItems.find(item => item.effect && item.effect.type === "duplicate_currency_bonus_percent");
        
        if (goldenTicketEquipped && baseDuplicateReward > 0) {
            finalDuplicateReward += Math.ceil(baseDuplicateReward * goldenTicketEquipped.effect.value);
            console.log(`Golden Ticket Bonus: Original: ${baseDuplicateReward}, New: ${finalDuplicateReward}`);
        }
        

        if (finalDuplicateReward > 0) {
            addCurrency(finalDuplicateReward);
            // Обновляем статистику по валюте за дубликаты
            playerData.stats.currencyFromDuplicates += finalDuplicateReward; 
        }
        
        // Обновляем статистику по выпавшим редкостям
        if (!playerData.stats.rollsByRarity) playerData.stats.rollsByRarity = {}; // Инициализация, если нужно
        if (!playerData.stats.rollsByRarity[rarityData.id]) {
            playerData.stats.rollsByRarity[rarityData.id] = 0;
        }
        playerData.stats.rollsByRarity[rarityData.id]++;
        
        // Логика для "Длани Неудачника"
        if (playerData.misfortuneStacks === undefined) playerData.misfortuneStacks = 0; // Инициализация, если нет
        
        const handOfMisfortuneItem = playerData.equippedItems.find(item => item.effect && item.effect.type === "cumulative_luck_on_low_rolls");

        if (handOfMisfortuneItem) { // Если Длань Неудачника надета
            const handEffectData = handOfMisfortuneItem.effect;
            if (handEffectData.triggerRarities.includes(rarityId)) {
                // Выпала одна из "неудачных" редкостей, увеличиваем стаки
                playerData.misfortuneStacks++;
                if (handEffectData.maxStacks && playerData.misfortuneStacks > handEffectData.maxStacks) {
                    playerData.misfortuneStacks = handEffectData.maxStacks; // Не превышаем максимум
                }
                console.log(`Hand of Misfortune: Stacked to ${playerData.misfortuneStacks} on ${rarityData.name}. Bonus luck: +${(playerData.misfortuneStacks * handEffectData.bonusPerStack).toFixed(2)}`);
            } else {
                // Выпала "хорошая" редкость, сбрасываем стаки
                if (playerData.misfortuneStacks > 0) {
                    console.log(`Hand of Misfortune: Stacks reset from ${playerData.misfortuneStacks} due to ${rarityData.name}`);
                }
                playerData.misfortuneStacks = 0;
            }
            // Опционально: Обновляем отображение удачи, т.к. она могла измениться из-за стаков
            if (typeof UI !== 'undefined' && UI.updateLuckDisplay) {
                UI.updateLuckDisplay();
            }
            // Опционально: Обновляем отображение стаков, если вы его реализовали
            // if (typeof UI !== 'undefined' && UI.updateMisfortuneStacksDisplay) {
            //    UI.updateMisfortuneStacksDisplay(playerData.misfortuneStacks);
            // }
        }
        
        saveGame(); // saveGame остается без изменений

        return {
            card:{
                 ...rarityData.card,
                 name: L.get(rarityData.card.nameKey) // Возвращаем переведенное имя карты
                },
            rarity: { 
                id: rarityData.id, 
                name: L.get(rarityData.nameKey), 
                color: rarityData.color, 
                glowColor: rarityData.glowColor, 
                cssClass: rarityData.cssClass 
            },
            isNew,
            duplicateReward: finalDuplicateReward // Передаем итоговую награду в UI
        };
    }

    // Добавить эту функцию в модуль Game
    function unlockAllCards() {
        const allCardIds = RARITIES_DATA.map(r => r.id);
        
        // Используем Set, чтобы избежать дубликатов, если что-то уже открыто
        const newInventory = [...new Set([...playerData.inventory, ...allCardIds])];
        playerData.inventory = newInventory;
        
        // Также помечаем все редкости как "виденные"
        const newSeenRarities = [...new Set([...playerData.seenRarities, ...allCardIds])];
        playerData.seenRarities = newSeenRarities;

        console.log("All cards unlocked!");

        // Обновляем весь UI, чтобы показать изменения в инвентаре и т.д.
        if (typeof UI !== 'undefined') {
            UI.updateAll(getPlayerData()); // updateAll перерисует все что нужно
        }
        saveGame();
    }

    function setCurrency(amount) {
        const value = parseInt(amount, 10);
        if (isNaN(value) || value < 0) return;
        playerData.currency = value;
        // ИСПРАВЛЕНИЕ: Используем updateAll
        if (typeof UI !== 'undefined') {
            UI.updateAll(getPlayerData());
        }
        saveGame();
    }

    // --- Магазин ---
    function purchaseShopItem(itemId, itemType) {
        let itemData;
        switch (itemType) {
            case 'boost':
                itemData = SHOP_DATA.boosts.find(b => b.id === itemId);
                break;
            case 'equipment':
                itemData = SHOP_DATA.equipment.find(e => e.id === itemId);
                break;
            case 'upgrade':
                itemData = SHOP_DATA.upgrades.find(u => u.id === itemId);
                break;
            default:
                console.error("Unknown item type:", itemType);
                return false;
        }

        if (!itemData) {
            console.error("Item not found in shop:", itemId, itemType);
            return false;
        }

        // Проверка на уже купленные неперепокупаемые предметы
        if (itemType === 'equipment' && playerData.equippedItems.find(e => e.id === itemId)) {
            console.log("Equipment already owned (and equipped) or in inventory if not equippable multiple times - logic depends on game design.");
            // Если экипировка одноразовая, то тут можно проверять playerData.inventory или спец. массив купленной экипировки
            // В нашем случае, экипировка уникальна и покупается один раз.
            // Если игрок "продал" или "снял" ее, он не должен покупать заново.
            // Поэтому, если она есть в playerData.purchasedEquipment (если бы такой массив был), то не даем купить.
            // Пока считаем, что раз купленная экипировка всегда доступна для надевания.
            // Проверку на "уже куплено" добавим.
            if (playerData.inventory.includes("purchased_"+itemId)) { // Используем префикс для купленной экипировки
                 console.log("Equipment item already purchased:", itemData.name);
                 alert(`${L.get(itemData.nameKey)} ${L.get('notifications.itemPurchased')}`);
                 return false;
            }
        }
        if (itemType === 'upgrade' && playerData.purchasedUpgrades[itemData.targetProperty]) {
            console.log("Upgrade already purchased:", itemData.name);
            alert(`${L.get(itemData.nameKey)} ${L.get('notifications.upgradeAlreadyPurchased')}`);
            return false;
        }


        if (spendCurrency(itemData.cost)) {
            console.log(`Purchased ${itemType}: ${itemData.name}`);
            if (itemType === 'boost') {
                activateBoost(itemData);
            } else if (itemType === 'equipment') {
                // Добавляем в "купленные", чтобы не купить снова
                playerData.inventory.push("purchased_"+itemId); // Отмечаем как купленное
                // Пытаемся сразу надеть, если есть место
                if (playerData.equippedItems.length < MAX_EQUIPPED_ITEMS) {
                    equipItem(itemData);
                } else {
                    alert(`${L.get(itemData.nameKey)} ${L.get('notifications.itemPurchased')}`);
                }
            } else if (itemType === 'upgrade') {
                playerData.purchasedUpgrades[itemData.targetProperty] = true;
                if (itemData.targetProperty === 'multiRollX5' && typeof UI !== 'undefined' && UI.toggleMultiRollButton) {
                    UI.toggleMultiRollButton(true);
                }
                if (itemData.targetProperty === 'fastRoll' && typeof UI !== 'undefined' && UI.updateRollSpeed) {
                    UI.updateRollSpeed(true);
                }
            }
            saveGame();
            return true;
        }
        return false;
    }

    // --- Бусты ---
    function activateBoost(boostData) {
        const now = Date.now();
        // Ищем существующий буст с таким же ID
        const existingBoost = playerData.activeBoosts.find(b => b.id === boostData.id);

        if (existingBoost) {
            // Если нашли, продлеваем его
            const remainingTime = Math.max(0, existingBoost.endTime - now);
            existingBoost.endTime = now + remainingTime + (boostData.durationSeconds * 1000);
            console.log(`Boost '${L.get(boostData.nameKey)}' duration extended. New end time: ${new Date(existingBoost.endTime).toLocaleTimeString()}`);
        } else {
            // Если не нашли, добавляем как новый
            const newBoost = {
                id: boostData.id,
                type: boostData.type,
                name: L.get(boostData.nameKey),
                endTime: now + (boostData.durationSeconds * 1000),
                luckBonus: boostData.luckBonus
            };
            playerData.activeBoosts.push(newBoost);
            console.log(`Boost activated: ${L.get(boostData.nameKey)}. Ends at: ${new Date(newBoost.endTime).toLocaleTimeString()}`);
        }
        
        // Запускаем/перезапускаем таймер проверки
        checkActiveBoosts();
    }

    let boostCheckInterval = null;
    function checkActiveBoosts() {
        if (boostCheckInterval) clearInterval(boostCheckInterval); // Очищаем предыдущий интервал

        boostCheckInterval = setInterval(() => {
            let boostsChanged = false;
            const now = new Date().getTime();
            playerData.activeBoosts = playerData.activeBoosts.filter(boost => {
                if (boost.endTime <= now) {
                    console.log(`Boost expired: ${boost.name}`);
                    boostsChanged = true;
                    return false;
                }
                return true;
            });

            if (boostsChanged) {
                if (typeof UI !== 'undefined' && UI.updateActiveBoostsDisplay) UI.updateActiveBoostsDisplay();
                if (typeof UI !== 'undefined' && UI.updateLuckDisplay) UI.updateLuckDisplay();
                saveGame(); // Сохраняем, если буст истек
            }
            if (playerData.activeBoosts.length === 0) {
                clearInterval(boostCheckInterval);
                boostCheckInterval = null;
            }
        }, 1000); // Проверять каждую секунду
        if (typeof UI !== 'undefined' && UI.updateActiveBoostsDisplay) UI.updateActiveBoostsDisplay(); // Обновить сразу
    }


    // --- Экипировка ---
    // js/game.js
// Внутри модуля Game

// --- Экипировка ---
    function equipItem(itemData) {
        if (playerData.equippedItems.length >= MAX_EQUIPPED_ITEMS) {
            UI.showNotification(L.get('ui.maxEquipment'), 'warning');
            return false;
        }
        if (playerData.equippedItems.find(e => e.id === itemData.id)) {
            return false;
        }

        // ИСПРАВЛЕНИЕ: Сохраняем КЛЮЧ (nameKey), а не переведенное имя (name)
        const equipToSave = {
            id: itemData.id,
            nameKey: itemData.nameKey, // <--- ГЛАВНОЕ ИЗМЕНЕНИЕ
            luckBonus: itemData.luckBonus,
            effect: itemData.effect ? JSON.parse(JSON.stringify(itemData.effect)) : undefined 
        };

        playerData.equippedItems.push(equipToSave);
        saveGame();
        // Обновляем UI после сохранения
        if (typeof UI !== 'undefined') {
            UI.updateAll(getPlayerData());
        }
        return true;
    }

    function unequipItem(itemId) {
        const initialLength = playerData.equippedItems.length;
        playerData.equippedItems = playerData.equippedItems.filter(e => e.id !== itemId);
        if (playerData.equippedItems.length < initialLength) {
            saveGame();
            return true;
        }
        return false;
    }

        function setActiveVisualEffect(rarityId) {
        if (playerData.activeVisualEffectRarityId === rarityId && rarityId !== null) { // Добавил проверку на null, чтобы можно было "пере-очистить"
            console.log(`Game: Visual effect ${rarityId} is already active.`);
            return;
        }
        if (playerData.activeVisualEffectRarityId === null && rarityId === null) {
            console.log(`Game: No visual effect active, and trying to clear (no-op).`);
            return;
        }

        console.log(`Game: Activating visual effect for: ${rarityId}`);
        playerData.activeVisualEffectRarityId = rarityId;
        saveGame();
        
        // ВЫЗЫВАЕМ UI для применения эффекта
        if (typeof UI !== 'undefined' && UI.applyVisualEffect) {
            UI.applyVisualEffect(playerData.activeVisualEffectRarityId); // Передаем текущее (новое) состояние
        } else {
            console.warn("Game.setActiveVisualEffect: UI.applyVisualEffect is not available.");
        }
    }

    function clearActiveVisualEffect() {
        if (playerData.activeVisualEffectRarityId === null) {
            console.log("Game: No visual effect active to clear.");
            return;
        }

        const oldEffect = playerData.activeVisualEffectRarityId;
        console.log(`Game: Clearing visual effect. Was: ${oldEffect}`);
        playerData.activeVisualEffectRarityId = null;
        saveGame();

        // ВЫЗЫВАЕМ UI для применения эффекта (в данном случае, для очистки)
        if (typeof UI !== 'undefined' && UI.applyVisualEffect) {
            UI.applyVisualEffect(null); // Передаем null для очистки
        } else {
            console.warn("Game.clearActiveVisualEffect: UI.applyVisualEffect is not available.");
        }
    }
        
    
    // --- Настройки ---
    function setSkipAnimationForDuplicate(rarityId, skip) {
        playerData.settings.skipAnimationForDuplicate[rarityId] = skip;
        saveGame();
    }


    // Публичный интерфейс модуля
    return {
        init, getPlayerData, saveGame, resetGame, addCurrency, spendCurrency, performRoll,
        purchaseShopItem, equipItem, unequipItem, calculateCurrentLuck, getEffectiveLuck,
        checkActiveBoosts, setActiveVisualEffect, clearActiveVisualEffect, setMusicVolume,
        unlockAllCards, setCurrency, addCardToInventory, amplifyLuckCore,
        getLuckCoreAmplificationCost, performRebirth, getRebirthCost
    };
})();

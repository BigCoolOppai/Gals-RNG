// js/game.js

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
        if (confirm("Вы уверены, что хотите сбросить весь прогресс? Это действие необратимо!")) {
            playerData = SaveManager.resetPlayerData();
            // После сброса нужно обновить весь UI
            if (typeof UI !== 'undefined' && UI.updateAll) {
                 UI.updateAll(playerData);
                 UI.renderShop(); // Перерисовать магазин, т.к. покупки сброшены
                 UI.renderSettings(); // Перерисовать настройки
            }
            console.log("Game progress has been reset.");
        }
    }

    // --- Валюта ---
    function addCurrency(amount) {
        if (amount <= 0) return;
        playerData.currency += amount;
        console.log(`Added ${amount} currency. Total: ${playerData.currency}`);
        if (typeof UI !== 'undefined') {
        UI.updateCurrencyDisplay(playerData.currency); // Это у вас уже должно быть
        UI.renderShop(); // <<--- ДОБАВИТЬ ЭТОТ ВЫЗОВ
    }
    }

    function spendCurrency(amount) {
        if (playerData.currency >= amount) {
            playerData.currency -= amount;
            console.log(`Spent ${amount} currency. Remaining: ${playerData.currency}`);
            
            return true;
        }
        console.log(`Not enough currency. Needed: ${amount}, Has: ${playerData.currency}`);
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
            console.log(`New card added to inventory: ${rarityData.card.name} (${rarityData.name})`);
        }

        if (!playerData.seenRarities.includes(rarityId)) {
            playerData.seenRarities.push(rarityId);
            // Если UI уже инициализирован, обновить настройки, чтобы показать новую опцию
            if (typeof UI !== 'undefined' && UI.renderSettings) {
                UI.renderSettings();
            }
            console.log(`New rarity seen: ${rarityData.name}`);
        }
        return isNew;
    }

    // --- Удача ---
    function calculateCurrentLuck() { // Эта функция теперь для отображения, getEffectiveLuck - для расчетов
        let currentDisplayLuck = BASE_LUCK;
        let misfortuneBonus = 0;
    
        playerData.equippedItems.forEach(item => {
            if (item.luckBonus) { // Стандартные бонусы к удаче
                currentDisplayLuck += item.luckBonus;
            }
            // Для "Длани Неудачника" бонус уже учтен в getEffectiveLuck, но для дисплея можно добавить
            if (item.effect && item.effect.type === "cumulative_luck_on_low_rolls") {
                if (playerData.misfortuneStacks === undefined) playerData.misfortuneStacks = 0;
                misfortuneBonus = playerData.misfortuneStacks * item.effect.bonusPerStack;
                if (item.effect.maxStacks) { // Ограничение максимального бонуса от стаков
                    misfortuneBonus = Math.min(misfortuneBonus, item.effect.maxStacks * item.effect.bonusPerStack);
                }
            }
        });
        currentDisplayLuck += misfortuneBonus;
    
        // Добавляем удачу от активных бустов (самый сильный)
        let maxBoostBonus = 0;
        playerData.activeBoosts.forEach(boost => {
            if (boost.type === "luck_boost" && boost.luckBonus > maxBoostBonus) {
                maxBoostBonus = boost.luckBonus;
            }
        });
        currentDisplayLuck += maxBoostBonus;
        
        // Добавляем бонус от Лаки Ролла, ЕСЛИ ОН АКТИВЕН В ЭТОТ МОМЕНТ
        // (Это сложно показать в общем отображении удачи, т.к. он разовый. 
        // Лучше не включать его в calculateCurrentLuck, а показывать отдельно при срабатывании)
    
        return parseFloat(currentDisplayLuck.toFixed(2));
    }

    function getEffectiveLuck() {
        let effectiveLuck = BASE_LUCK;
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


    
    // --- Ролл Карточек ---
    function performRoll() {
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
                UI.showNotification("✨ Lucky Roll! Удача умножена! ✨", "success");
            }
        }
        // --- КОНЕЦ БЛОКА ДЛЯ ЛАКИ РОЛЛА ---

        // Обновляем UI для счетчика Lucky Roll СРАЗУ ПОСЛЕ обновления счетчика
        if (typeof UI !== 'undefined' && UI.updateLuckyRollDisplay) {
            UI.updateLuckyRollDisplay(playerData.luckyRollCounter, playerData.luckyRollThreshold);
        }

        const baseEffectiveLuck = getEffectiveLuck(); // Получаем базовую удачу без учета Лаки Ролла
        // Применяем множитель Лаки Ролла (currentLuckMultiplier будет 1.0, если это не Лаки Ролл)
        const finalEffectiveLuck = parseFloat((baseEffectiveLuck * currentLuckMultiplier).toFixed(2));
        
        console.log(`Performing roll. BaseLuck: ${baseEffectiveLuck}, LuckyMultiplier: ${currentLuckMultiplier}, FinalEffectiveLuck: ${finalEffectiveLuck}`);

        // let remainingProbability = 1.0; // Как вы и указали, не используется активно
        let determinedRarityId = null;

        for (const rarity of RARITIES_DATA) {
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
            addCurrency(finalDuplicateReward); // addCurrency остается без изменений
        }
        
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
            card: rarityData.card,
            rarity: { 
                id: rarityData.id, 
                name: rarityData.name, 
                color: rarityData.color, 
                glowColor: rarityData.glowColor, 
                cssClass: rarityData.cssClass 
            },
            isNew,
            duplicateReward: finalDuplicateReward // Передаем итоговую награду в UI
        };
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
                 alert(`Предмет "${itemData.name}" уже куплен.`);
                 return false;
            }
        }
        if (itemType === 'upgrade' && playerData.purchasedUpgrades[itemData.targetProperty]) {
            console.log("Upgrade already purchased:", itemData.name);
            alert(`Улучшение "${itemData.name}" уже куплено.`);
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
                    alert(`${itemData.name} куплен, но нет места для экипировки. Освободите слот.`);
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
        // Удаляем старый буст того же типа, если он слабее или такой же
        // Или просто заменяем, если бусты одного типа не стакаются, а заменяются более сильным/новым
        // По условию: "не стакаются, применяется самый сильный активный" - эта логика в getEffectiveLuck
        // Здесь просто добавляем в список активных

        const newBoost = {
            id: boostData.id,
            type: boostData.type,
            name: boostData.name, // Для отображения
            endTime: new Date().getTime() + boostData.durationSeconds * 1000,
            luckBonus: boostData.luckBonus
        };
        playerData.activeBoosts.push(newBoost);
        console.log(`Boost activated: ${boostData.name}. Ends at: ${new Date(newBoost.endTime).toLocaleTimeString()}`);
        checkActiveBoosts(); // Запустить проверку и обновление таймеров
        if (typeof UI !== 'undefined' && UI.updateActiveBoostsDisplay) UI.updateActiveBoostsDisplay();
        if (typeof UI !== 'undefined' && UI.updateLuckDisplay) UI.updateLuckDisplay();

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
    function equipItem(itemData) { // itemData - это объект из SHOP_DATA
        if (playerData.equippedItems.length >= MAX_EQUIPPED_ITEMS) {
            alert("Максимальное количество экипировки надето.");
            return false;
        }
        if (playerData.equippedItems.find(e => e.id === itemData.id)) {
            alert("Этот предмет уже надет.");
            return false;
        }

        // Создаем объект для сохранения в playerData.equippedItems
        // Копируем все необходимые поля из itemData (который пришел из SHOP_DATA)
        const equipToSave = {
            id: itemData.id,
            name: itemData.name,
            // Копируем luckBonus, только если он есть и является числом
            luckBonus: typeof itemData.luckBonus === 'number' ? itemData.luckBonus : undefined,
            // ВАЖНО: Глубоко копируем объект effect, если он есть
            effect: itemData.effect ? JSON.parse(JSON.stringify(itemData.effect)) : undefined 
            // ИЛИ поверхностная копия, если внутри effect нет вложенных объектов, которые могут меняться:
            // effect: itemData.effect ? { ...itemData.effect } : undefined 
        };

        playerData.equippedItems.push(equipToSave);
        console.log(`Equipped: ${itemData.name}`, equipToSave); // Логируем, что именно было сохранено в playerData
        
        if (typeof UI !== 'undefined' && UI.updateLuckDisplay) UI.updateLuckDisplay();
        if (typeof UI !== 'undefined' && UI.updateEquippedItemsDisplay) UI.updateEquippedItemsDisplay(playerData.equippedItems); // Передаем обновленный массив
        saveGame();
        return true;
    }

    function unequipItem(itemId) {
        const itemIndex = playerData.equippedItems.findIndex(e => e.id === itemId);
        if (itemIndex > -1) {
            const unequippedItem = playerData.equippedItems.splice(itemIndex, 1)[0];
            console.log(`Unequipped: ${unequippedItem.name}`);
            if (typeof UI !== 'undefined' && UI.updateLuckDisplay) UI.updateLuckDisplay();
            if (typeof UI !== 'undefined' && UI.updateEquippedItemsDisplay) UI.updateEquippedItemsDisplay();
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
        init,
        getPlayerData,
        saveGame,
        resetGame,
        addCurrency,
        spendCurrency,
        performRoll,
        purchaseShopItem,
        equipItem, // Может быть вызван из UI, если игрок выбирает из купленных, но не надетых
        unequipItem,
        setSkipAnimationForDuplicate,
        calculateCurrentLuck, // Для отображения
        getEffectiveLuck, // Для расчетов
        checkActiveBoosts, // Экспортируем для UI, если понадобится обновить таймеры бустов
        setActiveVisualEffect,
        clearActiveVisualEffect,
        setMusicVolume,
    };
})();

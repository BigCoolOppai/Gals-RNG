// js/game.js
const PRESTIGE_BONUSES = [
    // Уровень 1
    { base: 0.10, perCard: 0.010 },
    // Уровень 2
    { base: 0.25, perCard: 0.012 },
    // Уровень 3
    { base: 0.45, perCard: 0.015 },
    // Уровень 4
    { base: 0.70, perCard: 0.018 },
    // Уровень 5
    { base: 0.90, perCard: 0.022 },
    // Уровень 6
    { base: 1.20, perCard: 0.025 }
    // Сюда можно добавлять новые уровни в будущем
];
const Game = (() => {
    const BASE_LUCK = 1.0;
    let playerData = {}; // Здесь будут храниться все данные игрока

    // --- Инициализация ---
    function init() {
        playerData = SaveManager.loadPlayerData();
        console.log("Game initialized with player data:", playerData);
        updateActivePassives(); // Обновляем пассивки при загрузке
        const maxItems = getMaxEquippedItems();
        if (playerData.equippedItems.length > maxItems) {
            console.warn(`Player has ${playerData.equippedItems.length} items but only ${maxItems} slots. Unequipping last item.`);
            // Снимаем последний надетый предмет
            const itemToUnequip = playerData.equippedItems.pop();
            // Возвращаем его в "купленные", если его там нет (на всякий случай)
            const purchasedItemId = "purchased_" + itemToUnequip.id;
            if (!playerData.inventory.includes(purchasedItemId)) {
                playerData.inventory.push(purchasedItemId);
            }
            // Показываем уведомление игроку
            if(typeof UI !== 'undefined' && UI.showNotification) {
                const itemName = L.get(itemToUnequip.nameKey) || itemToUnequip.id;
                const message = L.get('notifications.itemUnequippedDueToSlotLoss').replace('{itemName}', itemName);
                UI.showNotification(message, 'warning', 8000);
            }
            saveGame();
        }
        if (playerData.isSupporter) { // Проверяем только если игрок СЧИТАЕТСЯ саппортером
            checkForSupporterStatus();
        }
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

    // const MAX_EQUIPPED_ITEMS = 3;
    function getMaxEquippedItems() {
        return playerData.isSupporter ? 4 : 3;
    }

    function getRebirthCost() {
        const baseCost = 1000000;
        const multiplier = 3.5;
        const originalCost = Math.floor(baseCost * Math.pow(multiplier, playerData.prestigeLevel));
        return getDiscountedCost(originalCost);
    }

    // --- НОВЫЙ БЛОК: Пассивные эффекты ---

    function updateActivePassives() {
        const newActivePassives = {};
        // Перебираем все редкости от самой редкой к самой частой
        RARITIES_DATA.forEach(rarity => {
            // Пропускаем, если карты нет в инвентаре или у нее нет пассивки
            if (!playerData.inventory.includes(rarity.id) || !rarity.passiveEffect) {
                return;
            }
            const familyId = rarity.displayParentId || rarity.id;
            // Если для этого семейства карт пассивка еще не назначена, назначаем
            // Так как мы идем от редких к частым, первая найденная будет самой редкой
            if (!newActivePassives[familyId]) {
                newActivePassives[familyId] = rarity.id;
            }
        });
        playerData.activePassives = newActivePassives;
        console.log("Active passives updated:", playerData.activePassives);
    }
    
    function getPassiveBonusValue(bonusType) {
        let totalValue = 0;
        if (!playerData.activePassives) return 0;
    
        // Перебираем ID активных пассивных карт
        for (const cardId of Object.values(playerData.activePassives)) {
            const rarityData = getRarityDataById(cardId);
            if (rarityData && rarityData.passiveEffect && rarityData.passiveEffect.type === bonusType) {
                totalValue += rarityData.passiveEffect.value;
            }
        }
        return totalValue;
    }

    function getDiscountedCost(originalCost) {
        const discount = getPassiveBonusValue('global_purchase_discount');
        return Math.ceil(originalCost * (1 - discount));
    }


    // Функция для "маскировки" URL, чтобы его не было видно в исходном коде
    function getSupporterSheetUrl() {
        // Просто собираем URL из частей. Этого достаточно, чтобы "спрятать" его от случайных глаз.
        const part1 = "https://docs.google.com/spreadsheets/d/";
        const sheetId = "1T0nZBft0W77asIxgY5LnW17cb3Xq4l3DX7RqEYfTfsg"; // Твой ID
        const part2 = "/gviz/tq?tqx=out:csv&sheet=supporters"; // Используем новое имя листа
        return `${part1}${sheetId}${part2}`;
    }


    async function checkForSupporterStatus() {
        console.log("Checking for supporter status...");
        UI.showNotification(L.get('notifications.checkingSupporterStatus'), "info");

        try {
            const url = getSupporterSheetUrl();
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const csvText = await response.text();
            
            const supporterIds = new Set(csvText.split('\n').map(id => id.replace(/"/g, '').trim()).filter(Boolean));
            const isCurrentlySupporterInSheet = supporterIds.has(playerData.playerId);
            const wasSupporterInGame = playerData.isSupporter;

            // --- НОВАЯ, УМНАЯ ЛОГИКА ---

            // Сценарий 1: Игрок ЕСТЬ в таблице, но НЕ БЫЛ в игре (новая подписка)
            if (isCurrentlySupporterInSheet && !wasSupporterInGame) {
                console.log("New supporter detected! Activating perks.");
                playerData.isSupporter = true;
                UI.showNotification(L.get('notifications.supporterPerksActivated'), "success", 8000);
                saveGame();
                UI.updateAll(getPlayerData());
                return;
            }

            // Сценарий 2: Игрок ЕСТЬ в таблице и УЖЕ БЫЛ в игре (продление/просто проверка)
            if (isCurrentlySupporterInSheet && wasSupporterInGame) {
                console.log("Supporter status confirmed. No changes needed.");
                UI.showNotification(L.get('notifications.supporterStatusConfirmed'), "success");
                // Ничего не меняем, просто подтверждаем статус
                return;
            }

            // Сценарий 3: Игрока НЕТ в таблице, но он БЫЛ в игре (подписка закончилась)
            if (!isCurrentlySupporterInSheet && wasSupporterInGame) {
                console.log("Supporter status has expired. Deactivating perks.");
                playerData.isSupporter = false;
                
                // Запускаем логику проверки и снятия лишнего предмета
                const maxItems = getMaxEquippedItems(); // Теперь вернет 3
                if (playerData.equippedItems.length > maxItems) {
                    const itemToUnequip = playerData.equippedItems.pop();
                    const purchasedItemId = "purchased_" + itemToUnequip.id;
                    if (!playerData.inventory.includes(purchasedItemId)) {
                        playerData.inventory.push(purchasedItemId);
                    }
                    const itemName = L.get(itemToUnequip.nameKey) || itemToUnequip.id;
                    const message = L.get('notifications.itemUnequippedDueToSlotLoss').replace('{itemName}', itemName);
                    UI.showNotification(message, 'warning', 8000);
                }
                
                UI.showNotification(L.get('notifications.supporterStatusExpired'), "warning", 8000);
                saveGame();
                UI.updateAll(getPlayerData());
                return;
            }

            // Сценарий 4: Игрока НЕТ в таблице и НЕ БЫЛО в игре (обычный игрок)
            if (!isCurrentlySupporterInSheet && !wasSupporterInGame) {
                console.log("Player ID not found in supporter list.");
                UI.showNotification(L.get('notifications.supporterStatusNotFound'), "warning");
                return;
            }

        } catch (error) {
            console.error('Error fetching supporter sheet:', error);
            UI.showNotification(L.get('notifications.supporterCheckError'), "danger");
        }
    }

    function setActiveMechanicalEffect(effectId) {
        // Если пытаемся экипировать уже активный эффект, снимаем его
        if (playerData.activeMechanicalEffect === effectId) {
            playerData.activeMechanicalEffect = null;
        } else {
            playerData.activeMechanicalEffect = effectId;
        }
        console.log(`Active mechanical effect set to: ${playerData.activeMechanicalEffect}`);
        saveGame();
        // Обновляем UI, чтобы отобразить изменения (например, удачу от эффекта "Путь Меча")
        UI.updateAll(getPlayerData());
    }

    // Пересчитываем бонус от эффекта "Путь Меча"
    function calculateMotivationBonus() {
        const effectData = getRarityDataById('motivation', playerData)?.mechanicalEffect;
        if (!effectData) return 0;

        // Сбрасываем стаки, если прошло слишком много времени
        const timeSinceLastRoll = Date.now() - (playerData.lastRollTimestamp || 0);
        if (timeSinceLastRoll > effectData.timeoutSeconds * 1000) {
            if (playerData.motivationStacks > 0) {
                console.log("Motivation bonus reset due to inactivity.");
            }
            playerData.motivationStacks = 0;
        }
        
        return Math.min(playerData.motivationStacks * effectData.bonusPerRoll, effectData.maxBonus);
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
            
            if (!playerData.unseenCardIds.includes(rarityId)) {
            playerData.unseenCardIds.push(rarityId);
            }
            isNew = true;
        }

        if (isNew) {
        // Если это основная карта, устанавливаем для нее скин по умолчанию
        if (!rarityData.displayParentId) {
            playerData.activeSkins[rarityId] = rarityData.id;
        }
     }
        // Если это альт-карта, а родительская еще не открыта...
        if (rarityData.displayParentId && !playerData.inventory.includes(rarityData.displayParentId)) {
            playerData.inventory.push(rarityData.displayParentId);
            // И сразу устанавливаем для родителя скин по умолчанию
            playerData.activeSkins[rarityData.displayParentId] = rarityData.displayParentId;
        }

        if (!playerData.seenRarities.includes(rarityId)) {
            playerData.seenRarities.push(rarityId);
        }
        
        // После добавления новой карты нужно пересчитать активные пассивки
        updateActivePassives();
        return isNew;
    }

    function setActiveSkin(parentId, skinId) {
        if (playerData.inventory.includes(skinId)) {
            playerData.activeSkins[parentId] = skinId;
            saveGame();
            // Обновляем UI, чтобы инвентарь перерисовался с новым скином
            UI.updateAll(getPlayerData()); 
        }
    }

    // Rebirth
    function performRebirth() {
        const cost = getRebirthCost();
        if (playerData.currency < cost) {
            UI.showNotification(L.get('notifications.notEnoughForRebirth'), 'danger');
            return;
        }
        const thread = playerData.equippedItems.find(item => item.id === 'equip_fates_thread');
        let preservedItem = null;

        if (thread) {
            // Собираем все надетые предметы, КРОМЕ самой Нити Судьбы
            const otherItems = playerData.equippedItems.filter(item => item.id !== 'equip_fates_thread');
            if (otherItems.length > 0) {
                // Выбираем случайный предмет для сохранения
                preservedItem = otherItems[Math.floor(Math.random() * otherItems.length)];
                console.log(`Fate's Thread will preserve: ${preservedItem.id}`);
                UI.showNotification(`Нить Судьбы сохранит: ${L.get(preservedItem.nameKey)}`, 'info');
            }
            if (!playerData.completedAchievements.includes('use_fates_thread')) {
                grantAchievement('use_fates_thread');
            }
        }

        if (confirm(L.get('ui.rebirth.confirmation'))) {
            const oldBonus = calculateRebirthBonus(playerData);

            // Получаем чистый объект с дефолтными значениями
            const defaultData = SaveManager.getDefaultPlayerData();
            
            // 1. Сбрасываем основные игровые показатели
            playerData.currency = 0;
            playerData.activeBoosts = [];
            playerData.luckCoreLevel = 0;
            playerData.misfortuneStacks = 0;
            playerData.activeMechanicalEffect = null;
            
            // 2. ПОЛНЫЙ СБРОС ЭКИПИРОВКИ И УЛУЧШЕНИЙ
            playerData.equippedItems = defaultData.equippedItems; // Сбрасываем надетую экипировку (в пустой массив)
            playerData.purchasedUpgrades = defaultData.purchasedUpgrades; // Сбрасываем все улучшения (fastRoll: false, и т.д.)
            
            // 3. ОЧИЩАЕМ ИНВЕНТАРЬ ОТ КУПЛЕННЫХ ПРЕДМЕТОВ
            // Оставляем в инвентаре только карточки (те, что не начинаются с "purchased_")
            playerData.inventory = playerData.inventory.filter(itemId => !itemId.startsWith("purchased_"));

            if (preservedItem) {
                playerData.inventory.push("purchased_" + preservedItem.id);
                playerData.equippedItems.push(preservedItem);
                console.log(`Preserved item ${preservedItem.id} restored to inventory and equipped.`);
            }
            
            // 4. Пересчитываем пассивки на основе оставшихся (открытых) карт
            updateActivePassives();

            // 5. Применяем бонусы престижа
            playerData.prestigeLevel++;
            const newBonus = calculateRebirthBonus(playerData);
            const bonusGain = newBonus - oldBonus;

            // Сохраняем и обновляем игру
            saveGame();
            UI.showNotification(`${L.get('ui.rebirth.success')} +${bonusGain.toFixed(3)} ${L.get('ui.luck').toLowerCase()}`, 'success', 8000);
            UI.updateAll(playerData);
        }
    }

    /**
     * Динамически рассчитывает бонус удачи от перерождений.
     * @param {object} pData - Объект данных игрока.
     * @returns {number} - Рассчитанный бонус к удаче.
     */
    function calculateRebirthBonus(pData) {
        const level = pData.prestigeLevel;
        if (level === 0) return 0.0;

        // Считаем только реальные коллекционные карты, исключая мусор и купленные предметы
        const uniqueCardsCount = new Set(
            pData.inventory.filter(id => id !== 'garbage' && !id.startsWith("purchased_"))
        ).size;

        // Находим правильный тир бонусов из таблицы. 
        // Если уровень игрока выше, чем записей в таблице, используем последнюю доступную.
        const tierIndex = Math.min(level - 1, PRESTIGE_BONUSES.length - 1);
        const tier = PRESTIGE_BONUSES[tierIndex];

        const baseBonus = tier.base;
        const perCardBonus = uniqueCardsCount * tier.perCard;
        
        return baseBonus + perCardBonus;
    }

    // --- Удача ---
    function calculateCurrentLuck() {
        const luckFromCore = calculateLuckFromCore(playerData.luckCoreLevel || 0);
        const rebirthBonus = calculateRebirthBonus(playerData);
        let currentDisplayLuck = BASE_LUCK + luckFromCore + rebirthBonus;
        
        // <<< НАЧАЛО ИЗМЕНЕНИЙ: БОНУС ОТ ДУБЛИКАТОВ >>>
        const collectorBonus = (playerData.duplicateCounts?.blackhole || 0) * 0.01;
        currentDisplayLuck += collectorBonus;
        // <<< КОНЕЦ ИЗМЕНЕНИЙ >>>

        let misfortuneBonus = 0;

        playerData.equippedItems.forEach(item => {
            if (item.luckBonus) {
                currentDisplayLuck += item.luckBonus;
            }
            if (item.effect?.type === "cumulative_luck_on_low_rolls") {
                const currentStacks = playerData.misfortuneStacks || 0;
                let bonusFromStacks = currentStacks * item.effect.bonusPerStack;
                if (item.effect.maxStacks) {
                    bonusFromStacks = Math.min(bonusFromStacks, item.effect.maxStacks * item.effect.bonusPerStack);
                }
                misfortuneBonus = bonusFromStacks; 
            }
        });

        currentDisplayLuck += misfortuneBonus;
        
        let maxBoostBonus = 0;
        playerData.activeBoosts.forEach(boost => {
            if (boost.type === "luck_boost" && boost.luckBonus > maxBoostBonus) {
                maxBoostBonus = boost.luckBonus;
            }
        });
        
        // <<< НАЧАЛО ИЗМЕНЕНИЙ: ЭФФЕКТ КАТАЛИЗАТОРА >>>
        if (playerData.activeMechanicalEffect === 'space_alt_2') {
            const effectData = getRarityDataById('space_alt_2')?.mechanicalEffect;
            if (effectData) {
                maxBoostBonus *= effectData.multiplier;
            }
        }
        // <<< КОНЕЦ ИЗМЕНЕНИЙ >>>
        currentDisplayLuck += maxBoostBonus;
        
        if (playerData.activeMechanicalEffect === 'motivation') {
            currentDisplayLuck += calculateMotivationBonus();
        }
        
        return parseFloat(currentDisplayLuck.toFixed(3));
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

    /**
     * Новая функция для расчета ОБЩЕГО бонуса удачи от Ядра.
     * Она учитывает тиры прокачки.
     * @param {number} coreLevel - Текущий уровень Ядра Удачи.
     * @returns {number} - Суммарный бонус удачи.
     */
    function calculateLuckFromCore(coreLevel) {
        if (!coreLevel || coreLevel <= 0) {
            return 0.0;
        }

        let totalLuckBonus = 0;
        const tierSize = 10; // Каждый тир - 10 уровней
        const baseBonus = 0.01; // Начальный бонус за уровень
        const bonusIncrement = 0.005; // Насколько бонус увеличивается с каждым тиром

        let levelsRemaining = coreLevel;
        let currentTier = 0;

        while (levelsRemaining > 0) {
            const levelsInThisTier = Math.min(levelsRemaining, tierSize);
            const bonusPerLevelInThisTier = baseBonus + (currentTier * bonusIncrement);
            
            totalLuckBonus += levelsInThisTier * bonusPerLevelInThisTier;
            
            levelsRemaining -= levelsInThisTier;
            currentTier++;
        }

        return totalLuckBonus;
    }

    // Новая функция для расчета стоимости
    function getLuckCoreAmplificationCost() {
        const coreLevel = playerData.luckCoreLevel || 0;
        const baseCost = 6500; // <<--- ИЗМЕНЕНИЕ СТОИМОСТИ
        const tier = Math.floor(coreLevel / 10); // 0-9 -> тир 0, 10-19 -> тир 1, и т.д.
        
        // Множитель стоимости растет с каждым тиром
        const costMultiplier = 1.15 + (tier * 0.02); 
        
        const originalCost = Math.floor(baseCost * Math.pow(costMultiplier, coreLevel));
        return getDiscountedCost(originalCost);
    }

    // Новая функция для покупки улучшения
    function amplifyLuckCore(isFree = false) {
        const cost = getLuckCoreAmplificationCost();

        // Проверяем валюту, только если это НЕ бесплатное усиление
        if (!isFree && !spendCurrency(cost)) {
            return; // Если это платное усиление и денег нет, выходим
        }
        
        // Если это бесплатное усиление или денег хватило, выполняем основную логику
        playerData.luckCoreLevel++;
        const newTotalBonus = calculateLuckFromCore(playerData.luckCoreLevel);
        console.log(`Luck Core amplified to level ${playerData.luckCoreLevel}. New permanent bonus: +${newTotalBonus.toFixed(3)}`);
        saveGame();
        // Обновляем UI, чтобы показать новый бонус и новую цену
        if (typeof UI !== 'undefined') {
            UI.updateAll(getPlayerData());
        }
    }
    
    // --- Ролл Карточек ---
    function performRoll(guaranteedRarityId = null) {
        if (playerData.activeMechanicalEffect === 'jackpot') {
            const effectData = getRarityDataById('jackpot', playerData).mechanicalEffect;
            if (effectData && effectData.rollCost > 0) {
                if (!spendCurrency(effectData.rollCost)) {
                    console.warn(`Roll blocked: Not enough currency for Jackpot effect. Need: ${effectData.rollCost}`);
                    return null;
                }
            }
        }

        playerData.lastRollTimestamp = Date.now();
        if (playerData.activeMechanicalEffect === 'motivation') {
            playerData.motivationStacks++;
            console.log(`Motivation stack increased to: ${playerData.motivationStacks}`);
        } else {
            playerData.motivationStacks = 0;
        }

        const availableRarities = RARITIES_DATA.filter(r => {
            const prestigeOk = (r.minPrestige || 0) <= playerData.prestigeLevel;
            if (!prestigeOk) return false;
            if (r.id === 'salt') {
                // Карта доступна только если достижение 'unlock_salt_card' выполнено
                if (!playerData.completedAchievements.includes('unlock_salt_card')) {
                    return false; // Если достижения нет, карту из пула убираем
                }
            }
            if (r.id === 'diamond' && !playerData.isSupporter) {
                return false;
            }
            return true;
        });

        let isLuckyRollActiveThisRoll = false;
        let currentLuckMultiplier = 1.0;
        if (playerData.luckyRollCounter === undefined) playerData.luckyRollCounter = 0;
        let luckyRollThreshold = 11;
        const chronometer = playerData.equippedItems.find(item => item.effect?.type === "lucky_roll_accelerator");
        if (chronometer) {
            luckyRollThreshold -= chronometer.effect.rolls_reduced;
        }
        playerData.luckyRollThreshold = luckyRollThreshold;
        playerData.luckyRollCounter++;

        if (playerData.luckyRollCounter >= playerData.luckyRollThreshold) {
            const baseMultiplier = playerData.purchasedUpgrades.empoweredLuckyRoll ? 2.5 : 2.0;
            currentLuckMultiplier = baseMultiplier;
            isLuckyRollActiveThisRoll = true;
            console.log(`✨ LUCKY ROLL TRIGGERED! Luck will be multiplied by ${currentLuckMultiplier}. Counter reset.`);
            playerData.luckyRollCounter = 0;
            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification(L.get('notifications.luckyRollTriggered'), "success");
            }
        }

        if (typeof UI !== 'undefined' && UI.updateLuckyRollDisplay) {
            UI.updateLuckyRollDisplay(playerData.luckyRollCounter, playerData.luckyRollThreshold);
        }
        if (!playerData.stats) {
            playerData.stats = SaveManager.getDefaultPlayerData().stats;
        }
        playerData.stats.totalRolls++;

        let baseEffectiveLuck = getEffectiveLuck();
        
        let jackpotTriggeredThisRoll = false;
        if (playerData.activeMechanicalEffect === 'jackpot') {
            const effectData = getRarityDataById('jackpot', playerData).mechanicalEffect;
            if (Math.random() < effectData.chance) {
                jackpotTriggeredThisRoll = true; 
            }
        }

        let finalEffectiveLuck = baseEffectiveLuck;
        if (jackpotTriggeredThisRoll) {
            const effectData = getRarityDataById('jackpot', playerData).mechanicalEffect;
            finalEffectiveLuck += effectData.luckBonus;
            console.log(`%cJACKPOT EFFECT TRIGGERED! +${effectData.luckBonus} Luck for this roll!`, "color: gold; font-weight: bold;");
            const message = L.get('notifications.jackpotEffectTriggered').replace('{bonus}', effectData.luckBonus);
            UI.showNotification(message, 'warning');
        }
        
        finalEffectiveLuck *= currentLuckMultiplier;
        finalEffectiveLuck = parseFloat(finalEffectiveLuck.toFixed(2));

        const activeLuckEvent = getActiveEvent();
        let eventLuckMultiplier = 1;
        if (activeLuckEvent && activeLuckEvent.effect.type === 'global_luck_multiplier') {
            eventLuckMultiplier = activeLuckEvent.effect.multiplier;
            finalEffectiveLuck *= eventLuckMultiplier;
        }

        
        // --- НОВЫЙ БЛОК: УЧЕТ ЭВЕНТОВ ---
        const activeEvent = getActiveEvent();
        let eventMultiplier = 1;
        // --- КОНЕЦ БЛОКА ---

        console.log(`Performing roll. BaseLuck: ${baseEffectiveLuck}, LuckyMultiplier: ${currentLuckMultiplier}, EventLuckMultiplier: ${eventLuckMultiplier}, Jackpot: ${jackpotTriggeredThisRoll}, FinalEffectiveLuck: ${finalEffectiveLuck}`);

        let determinedRarityId = null;

        if (guaranteedRarityId && getRarityDataById(guaranteedRarityId, playerData)) {
            determinedRarityId = guaranteedRarityId;
            console.log(`Performing GUARANTEED roll for: ${guaranteedRarityId}`);
        } else {
            for (const rarity of availableRarities) {
                if (rarity.id === 'garbage') continue;

                // Применяем эвент-множитель
                eventMultiplier = 1;
                if (activeEvent && activeEvent.effect.type === 'boost_specific_cards' && activeEvent.effect.cardIds.includes(rarity.id)) {
                    eventMultiplier = activeEvent.effect.multiplier;
                }

                let P_base = rarity.probabilityBase;
                let odds = P_base / (1 - P_base);
                if (1 - P_base <= 0) { odds = Number.MAX_SAFE_INTEGER; }
                let modifiedOdds = odds * finalEffectiveLuck * eventMultiplier;
                let effectiveProbabilityForTier = modifiedOdds / (1 + modifiedOdds);
                if (Math.random() < effectiveProbabilityForTier) {
                    determinedRarityId = rarity.id;
                    break;
                }
            }
            if (!determinedRarityId) {
                determinedRarityId = 'garbage';
            }
        }
        if (playerData.activeMechanicalEffect === 'platinum' && determinedRarityId === 'garbage') {
            console.log("Quality Guarantor activated! Upgrading 'Garbage' to 'Common'.");
            determinedRarityId = 'common';
        }
        
        const activeEffectId = playerData.activeMechanicalEffect;

        const rollMeta = {
            wasUpgraded: false,
            originalRarityId: determinedRarityId,
            jackpotTriggered: jackpotTriggeredThisRoll
        };

        if (activeEffectId && !guaranteedRarityId) {
            const activeEffectCardData = getRarityDataById(activeEffectId, playerData);

            if (activeEffectCardData && activeEffectCardData.mechanicalEffect?.type === 'universal_upgrade') {
                const effectData = activeEffectCardData.mechanicalEffect;
                let tiersUpgraded = 0;
                let upgradeSucceeded = false;

                if (effectData.multiUpgradeTiers && Array.isArray(effectData.multiUpgradeTiers)) {
                    for (const multi of effectData.multiUpgradeTiers) {
                        if (Math.random() < multi.chance) {
                            tiersUpgraded = multi.tiers;
                            upgradeSucceeded = true;
                            break;
                        }
                    }
                }
                
                if (!upgradeSucceeded && Math.random() < effectData.chance) {
                    tiersUpgraded = 1;
                    upgradeSucceeded = true;
                }

                if (upgradeSucceeded) {
                    const currentIndex = RARITIES_DATA.findIndex(r => r.id === determinedRarityId);
                    const newIndex = currentIndex - tiersUpgraded;

                    if (newIndex >= 0) {
                        const nextRarity = RARITIES_DATA[newIndex];
                        const prestigeOk = (nextRarity.minPrestige || 0) <= playerData.prestigeLevel;
                        const supporterOk = !(nextRarity.id === 'diamond' && !playerData.isSupporter);

                        if (prestigeOk && supporterOk) {
                            determinedRarityId = nextRarity.id;
                            if (!playerData.inventory.includes(determinedRarityId)) {
                                rollMeta.isNewViaUpgrade = true; 
                            }
                            rollMeta.wasUpgraded = true;
                            
                            const originalName = L.get(getRarityDataById(rollMeta.originalRarityId, playerData).nameKey);
                            const upgradedName = L.get(nextRarity.nameKey);

                            console.log(`%cCORRUPTION EFFECT TRIGGERED! Upgraded ${rollMeta.originalRarityId} to ${determinedRarityId} (+${tiersUpgraded} tiers)`, "color: red;");
                            
                            let message = tiersUpgraded > 1 ?
                                L.get('notifications.corruptionEffectTriggeredMulti').replace('{original}', originalName).replace('{upgraded}', upgradedName).replace('{tiers}', tiersUpgraded) :
                                L.get('notifications.corruptionEffectTriggered').replace('{original}', originalName).replace('{upgraded}', upgradedName);
                            
                            UI.showNotification(message, 'danger');
                        }
                    }
                }
            }
        }
        
        // Добавляем ID в историю роллов
        if (!playerData.lastRollsHistory) playerData.lastRollsHistory = [];
        playerData.lastRollsHistory.push(determinedRarityId);
        if (playerData.lastRollsHistory.length > 10) { // Храним только 10 последних
            playerData.lastRollsHistory.shift();
        }
        
        return processRollResult(determinedRarityId, rollMeta);
    }
    
    function processRollResult(rarityId, meta = {}) {
        const rarityData = getRarityDataById(rarityId, playerData);
        if (!rarityData) {
            console.error(`Rarity data not found for ID: ${rarityId}`);
            return {
                card: { name: "Ошибка Карты", image: "", description: "Данные о карте не найдены." },
                rarity: { id: "error_rarity", name: "Неизвестно", color: "#fff", glowColor: "#fff", cssClass: "" },
                isNew: false,
                duplicateReward: 0,
                meta: {}
            };
        }
        
        const isNew = meta.isNewViaUpgrade || !playerData.inventory.includes(rarityId);
        addCardToInventory(rarityId);

        let baseDuplicateReward = 0;

        if (!isNew) {
            baseDuplicateReward = rarityData.currencyOnDuplicate || 0;
            if (rarityId === 'blackhole') {
                if (!playerData.duplicateCounts) playerData.duplicateCounts = {};
                if (!playerData.duplicateCounts.blackhole) playerData.duplicateCounts.blackhole = 0;
                playerData.duplicateCounts.blackhole++;
                console.log(`Blackhole duplicate count is now: ${playerData.duplicateCounts.blackhole}`);
            }
        }

        let finalDuplicateReward = baseDuplicateReward;
        let fragmentGenerated = false;
        const alchemistStone = playerData.equippedItems.find(item => item.id === 'equip_alchemists_stone');
        if (alchemistStone && alchemistStone.effect.triggerRarities.includes(rarityId) && baseDuplicateReward > 0) {
            if (Math.random() < alchemistStone.effect.chance) {
                playerData.luckCoreFragments = (playerData.luckCoreFragments || 0) + 1;
                fragmentGenerated = true; 
                
                // Используем L.get() и замену плейсхолдеров
                const notificationText = L.get('notifications.luckCoreFragmentFound')
                    .replace('{current}', playerData.luckCoreFragments)
                    .replace('{needed}', alchemistStone.effect.fragmentsNeeded);
                UI.showNotification(notificationText, 'warning');
                
                if (playerData.luckCoreFragments >= alchemistStone.effect.fragmentsNeeded) {
                    UI.showNotification(L.get('notifications.luckCoreAmplifiedByFragments'), 'success', 6000);
                    if (!playerData.completedAchievements.includes('empower_core_with_stone')) {
                        grantAchievement('empower_core_with_stone');
                    }
                    amplifyLuckCore(true); 
                    playerData.luckCoreFragments = 0; 
                }
            }
        }
        
        let totalBonusPercent = 0;
        playerData.equippedItems.forEach(item => {
            if (item.effect?.type === "duplicate_currency_bonus_percent") {
                totalBonusPercent += item.effect.value;
            }
        });
        totalBonusPercent += getPassiveBonusValue('duplicate_currency_bonus_percent');

        if (totalBonusPercent > 0 && baseDuplicateReward > 0) {
            const bonusAmount = Math.ceil(baseDuplicateReward * totalBonusPercent);
            finalDuplicateReward += bonusAmount;
            console.log(`Greed Bonus: Original: ${baseDuplicateReward}, Bonus: +${bonusAmount} (${(totalBonusPercent*100).toFixed(0)}%), New: ${finalDuplicateReward}`);
        }
        const activeEvent = getActiveEvent();
        if (activeEvent && activeEvent.effect.type === 'duplicate_currency_multiplier' && finalDuplicateReward > 0) {
            const multiplier = activeEvent.effect.multiplier;
            const eventBonus = Math.ceil(finalDuplicateReward * multiplier) - finalDuplicateReward;
            finalDuplicateReward += eventBonus;
            console.log(`Event Bonus: Original: ${finalDuplicateReward - eventBonus}, Multiplier: x${multiplier}, New: ${finalDuplicateReward}`);
        }
        
        if (!fragmentGenerated) {
            if (finalDuplicateReward > 0) {
                addCurrency(finalDuplicateReward);
                playerData.stats.currencyFromDuplicates += finalDuplicateReward; 
            }
        }
        if (!playerData.stats.rollsByRarity) playerData.stats.rollsByRarity = {};
        if (!playerData.stats.rollsByRarity[rarityData.id]) {
            playerData.stats.rollsByRarity[rarityData.id] = 0;
        }
        playerData.stats.rollsByRarity[rarityData.id]++;
        
        if (playerData.misfortuneStacks === undefined) playerData.misfortuneStacks = 0;
        
        const handOfMisfortuneItem = playerData.equippedItems.find(item => item.effect && item.effect.type === "cumulative_luck_on_low_rolls");

        if (handOfMisfortuneItem) {
            const handEffectData = handOfMisfortuneItem.effect;
            if (handEffectData.triggerRarities.includes(rarityId)) {
                playerData.misfortuneStacks++;
                if (handEffectData.maxStacks && playerData.misfortuneStacks > handEffectData.maxStacks) {
                    playerData.misfortuneStacks = handEffectData.maxStacks;
                }
                console.log(`Hand of Misfortune: Stacked to ${playerData.misfortuneStacks} on ${rarityData.name}. Bonus luck: +${(playerData.misfortuneStacks * handEffectData.bonusPerStack).toFixed(2)}`);
            } else {
                if (playerData.misfortuneStacks > 0) {
                    console.log(`Hand of Misfortune: Stacks reset from ${playerData.misfortuneStacks} due to ${rarityData.name}`);
                }
                playerData.misfortuneStacks = 0;
            }
            if (typeof UI !== 'undefined' && UI.updateLuckDisplay) {
                UI.updateLuckDisplay();
            }
        }
        
        // После каждого ролла проверяем ачивки
        checkAchievementsAndCollections();
        
        saveGame();

        return {
            card:{
                ...rarityData.card,
                name: L.get(rarityData.card.nameKey)
                },
            rarity: { 
                id: rarityData.id, 
                name: L.get(rarityData.nameKey), 
                color: rarityData.color, 
                glowColor: rarityData.glowColor, 
                cssClass: rarityData.cssClass 
            },
            isNew,
            duplicateReward: finalDuplicateReward,
            meta: meta 
        };
    }
    
    function processMultiRollResult(results) {
        // Проверяем ачивку на 5 rare карт в мультиролле
        const isFiveRares = results.every(res => res.rarity.id === 'rare');
        if (isFiveRares && !playerData.completedAchievements.includes('five_rares_in_multi')) {
            grantAchievement('five_rares_in_multi');
        }
        
        // ... остальная логика обработки мультиролла (которая уже есть в UI)
    }

    function unlockAllCards() {
        const allCardIds = RARITIES_DATA.map(r => r.id);
        const newInventory = [...new Set([...playerData.inventory, ...allCardIds])];
        playerData.inventory = newInventory;
        const newSeenRarities = [...new Set([...playerData.seenRarities, ...allCardIds])];
        playerData.seenRarities = newSeenRarities;
        updateActivePassives();
        checkAchievementsAndCollections(); // Проверяем ачивки после открытия всех карт
        console.log("All cards unlocked!");
        if (typeof UI !== 'undefined') {
            UI.updateAll(getPlayerData()); 
        }
        saveGame();
    }

    function setCurrency(amount) {
        const value = parseInt(amount, 10);
        if (isNaN(value) || value < 0) return;
        playerData.currency = value;
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

        if (itemType === 'equipment' && playerData.inventory.includes("purchased_"+itemId)) {
             alert(`${L.get(itemData.nameKey)} ${L.get('notifications.itemPurchased')}`);
             return false;
        }
        if (itemType === 'upgrade' && playerData.purchasedUpgrades[itemData.targetProperty]) {
            alert(`${L.get(itemData.nameKey)} ${L.get('notifications.upgradeAlreadyPurchased')}`);
            return false;
        }

        const finalCost = getDiscountedCost(itemData.cost);

        if (spendCurrency(finalCost)) {
            console.log(`Purchased ${itemType}: ${itemData.nameKey} for ${finalCost} (original: ${itemData.cost})`);
            if (itemType === 'boost') {
                activateBoost(itemData);
            } else if (itemType === 'equipment') {
                playerData.inventory.push("purchased_"+itemId);
                if (playerData.equippedItems.length < Game.getMaxEquippedItems()) {
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
            if (typeof UI !== 'undefined' && UI.updateAll) {
                UI.updateAll(playerData);
            }
            return true;
        }
        return false;
    }

    // --- Бусты ---
    function activateBoost(boostData) {
        const now = Date.now();
        const existingBoost = playerData.activeBoosts.find(b => b.id === boostData.id);

        if (existingBoost) {
            const remainingTime = Math.max(0, existingBoost.endTime - now);
            existingBoost.endTime = now + remainingTime + (boostData.durationSeconds * 1000);
            console.log(`Boost '${L.get(boostData.nameKey)}' duration extended. New end time: ${new Date(existingBoost.endTime).toLocaleTimeString()}`);
        } else {
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
        
        checkActiveBoosts();
    }

    let boostCheckInterval = null;
    function checkActiveBoosts() {
        if (boostCheckInterval) clearInterval(boostCheckInterval);

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
                saveGame();
            }
            if (playerData.activeBoosts.length === 0) {
                clearInterval(boostCheckInterval);
                boostCheckInterval = null;
            }
        }, 1000);
        if (typeof UI !== 'undefined' && UI.updateActiveBoostsDisplay) UI.updateActiveBoostsDisplay();
    }


    // --- Экипировка ---
    function equipItem(itemData) {
        if (playerData.equippedItems.length >= Game.getMaxEquippedItems()) {
            UI.showNotification(L.get('ui.maxEquipment'), 'warning');
            return false;
        }
        if (playerData.equippedItems.find(e => e.id === itemData.id)) {
            return false;
        }

        const equipToSave = {
            id: itemData.id,
            nameKey: itemData.nameKey,
            luckBonus: itemData.luckBonus,
            effect: itemData.effect ? JSON.parse(JSON.stringify(itemData.effect)) : undefined 
        };

        playerData.equippedItems.push(equipToSave);
        saveGame();
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
        if (playerData.activeVisualEffectRarityId === rarityId && rarityId !== null) {
            return;
        }
        if (playerData.activeVisualEffectRarityId === null && rarityId === null) {
            return;
        }

        console.log(`Game: Activating visual effect for: ${rarityId}`);
        playerData.activeVisualEffectRarityId = rarityId;
        saveGame();
        
        if (typeof UI !== 'undefined' && UI.applyVisualEffect) {
            UI.applyVisualEffect(playerData.activeVisualEffectRarityId);
        } else {
            console.warn("Game.setActiveVisualEffect: UI.applyVisualEffect is not available.");
        }
    }

    function clearActiveVisualEffect() {
        if (playerData.activeVisualEffectRarityId === null) {
            return;
        }

        const oldEffect = playerData.activeVisualEffectRarityId;
        console.log(`Game: Clearing visual effect. Was: ${oldEffect}`);
        playerData.activeVisualEffectRarityId = null;
        saveGame();

        if (typeof UI !== 'undefined' && UI.applyVisualEffect) {
            UI.applyVisualEffect(null);
        } else {
            console.warn("Game.clearActiveVisualEffect: UI.applyVisualEffect is not available.");
        }
    }
        
    
    // --- Настройки ---
    function setActiveTheme(themeId) {
        if (playerData.unlockedThemes.includes(themeId)) {
            playerData.activeTheme = themeId;
            saveGame();
            if (typeof UI !== 'undefined') {
                UI.applyTheme(themeId);
            }
        }
    }
    
    // --- Эвенты, Ачивки, Коллекции ---
    function getActiveEvent() {
        const now = new Date();
        return EVENTS_DATA.find(event => now < new Date(event.endDate));
    }
    
    function checkAchievementsAndCollections() {
        // Проверка обычных достижений
        for (const achId in ACHIEVEMENTS_DATA) {
            if (!playerData.completedAchievements.includes(achId)) {
                if (ACHIEVEMENTS_DATA[achId].condition(playerData)) {
                    grantAchievement(achId);
                }
            }
        }
        // Проверка коллекций
        for (const colId in COLLECTIONS_DATA) {
            if (!playerData.completedAchievements.includes(colId)) {
                const collection = COLLECTIONS_DATA[colId];
                const hasAllCards = collection.cardIds.every(cardId => playerData.inventory.includes(cardId));
                if (hasAllCards) {
                    grantAchievement(colId, true); // true, т.к. это коллекция
                }
            }
        }
    }

    function grantAchievement(achId, isCollection = false) {
        const data = isCollection ? COLLECTIONS_DATA[achId] : ACHIEVEMENTS_DATA[achId];
        if (!data) return;

        playerData.completedAchievements.push(achId);
        const reward = data.reward;
        
        let rewardText = "";
        
        // <<< НАЧАЛО ИСПРАВЛЕНИЯ: ДОБАВЛЯЕМ ПРОВЕРКУ >>>
        // Обрабатываем награду, только если она существует (не null)
        if (reward) { 
            if (reward.type === 'currency') {
                addCurrency(reward.amount);
                rewardText = `💎 ${reward.amount}`;
            } else if (reward.type === 'ui_theme') {
                if (!playerData.unlockedThemes.includes(reward.themeId)) {
                    playerData.unlockedThemes.push(reward.themeId);
                }
                rewardText = L.get(reward.nameKey);
            }
        }
        // <<< КОНЕЦ ИСПРАВЛЕНИЯ >>>

        const achievementName = L.get(data.nameKey);
        // Изменяем сообщение, чтобы оно не показывало "Награда:", если награды нет
        let notificationMessage = `${L.get('notifications.achievementUnlocked')}: <strong>${achievementName}</strong>!`;
        if (rewardText) {
            notificationMessage += ` ${L.get('notifications.reward')}: ${rewardText}`;
        }
        
        UI.showNotification(notificationMessage, 'success', 8000);
        console.log(`Achievement unlocked: ${achId}`);
    }


    // Публичный интерфейс модуля
    return {
        init, getPlayerData, saveGame, resetGame, addCurrency, spendCurrency, performRoll, processMultiRollResult,
        purchaseShopItem, equipItem, unequipItem, calculateCurrentLuck, getEffectiveLuck,
        checkActiveBoosts, setActiveVisualEffect, clearActiveVisualEffect, setMusicVolume,
        unlockAllCards, setCurrency, addCardToInventory, amplifyLuckCore,
        getLuckCoreAmplificationCost, performRebirth, getRebirthCost, setActiveSkin, checkForSupporterStatus, getMaxEquippedItems,
        setActiveMechanicalEffect, calculateLuckFromCore, getDiscountedCost, getActiveEvent, setActiveTheme, calculateRebirthBonus
    };
})();
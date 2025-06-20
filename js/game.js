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

    // const MAX_EQUIPPED_ITEMS = 3;
    function getMaxEquippedItems() {
        return playerData.isSupporter ? 4 : 3;
    }

    function getRebirthCost() {
        const baseCost = 1000000; // Начальная стоимость первого ребёрза
        const multiplier = 3.5;   // Цена каждого следующего ребёрза будет в 3.5 раза выше
        return Math.floor(baseCost * Math.pow(multiplier, playerData.prestigeLevel));
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
        if (playerData.isSupporter) {
            UI.showNotification(L.get('notifications.supporterStatusAlreadyActive'), "info");
            return;
        }

        console.log("Checking for supporter status...");
        UI.showNotification(L.get('notifications.checkingSupporterStatus'), "info");

        try {
            const url = getSupporterSheetUrl(); // Получаем URL здесь
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const csvText = await response.text();
            
            const supporterIds = csvText.split('\n').map(id => id.replace(/"/g, '').trim()).filter(Boolean); // Добавил filter(Boolean) для удаления пустых строк

            if (supporterIds.includes(playerData.playerId)) {
                console.log("Player ID found in supporter list! Activating perks.");
                playerData.isSupporter = true;
                saveGame();
                UI.showNotification(L.get('notifications.supporterPerksActivated'), "success", 8000);
                
                UI.updateAll(getPlayerData());
            } else {
                console.log("Player ID not found in supporter list.");
                UI.showNotification(L.get('notifications.supporterStatusNotFound'), "warning");
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
        const effectData = getRarityDataById('motivation')?.mechanicalEffect;
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

        if (confirm(L.get('ui.rebirth.confirmation'))) {
            const uniqueCardsCount = new Set(playerData.inventory.filter(id => id !== 'garbage')).size;
            const luckBonus = uniqueCardsCount * PRESTIGE_LUCK_PER_CARD;

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

            // 4. Применяем бонусы престижа
            playerData.prestigeLevel++;
            playerData.prestigeLuckBonus += luckBonus;

            // Сохраняем и обновляем игру
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
        if (playerData.activeMechanicalEffect === 'motivation') {
            currentDisplayLuck += calculateMotivationBonus();
        }
        
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
        if (playerData.activeMechanicalEffect === 'jackpot') {
            const effectData = getRarityDataById('jackpot').mechanicalEffect;
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
            isLuckyRollActiveThisRoll = true;
            currentLuckMultiplier = playerData.luckyRollBonusMultiplier;
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
        let finalEffectiveLuck = parseFloat((baseEffectiveLuck * currentLuckMultiplier).toFixed(2));

        if (playerData.activeMechanicalEffect === 'jackpot') {
            const effectData = getRarityDataById('jackpot').mechanicalEffect;
            if (Math.random() < effectData.chance) {
                finalEffectiveLuck = baseEffectiveLuck + effectData.luckBonus;
                console.log(`%cJACKPOT EFFECT TRIGGERED! +${effectData.luckBonus} Luck for this roll!`, "color: gold; font-weight: bold;");
                const message = L.get('notifications.jackpotEffectTriggered').replace('{bonus}', effectData.luckBonus);
                UI.showNotification(message, 'warning');
            }
        }
        finalEffectiveLuck = parseFloat((finalEffectiveLuck * currentLuckMultiplier).toFixed(2));
        console.log(`Performing roll. BaseLuck: ${baseEffectiveLuck}, LuckyMultiplier: ${currentLuckMultiplier}, FinalEffectiveLuck: ${finalEffectiveLuck}`);

        let determinedRarityId = null;

        if (guaranteedRarityId && getRarityDataById(guaranteedRarityId)) {
            determinedRarityId = guaranteedRarityId;
            console.log(`Performing GUARANTEED roll for: ${guaranteedRarityId}`);
        } else {
            for (const rarity of availableRarities) {
                if (rarity.id === 'garbage') continue;
                let P_base = rarity.probabilityBase;
                let odds = P_base / (1 - P_base);
                if (1 - P_base <= 0) { odds = Number.MAX_SAFE_INTEGER; }
                let modifiedOdds = odds * finalEffectiveLuck;
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
        
        // <<< НАЧАЛО БЛОКА КЛЮЧЕВОГО ИСПРАВЛЕНИЯ >>>
        // Получаем ID активного эффекта, если он есть
        const activeEffectId = playerData.activeMechanicalEffect;

        // Проверяем, является ли активный эффект "универсальным улучшением"
        if (activeEffectId && !guaranteedRarityId) {
            const activeEffectCardData = getRarityDataById(activeEffectId);

            if (activeEffectCardData && activeEffectCardData.mechanicalEffect?.type === 'universal_upgrade') {
                const effectData = activeEffectCardData.mechanicalEffect;
                let upgradeSucceeded = false;
                let tiersUpgraded = 0;

                // 1. Сначала проверяем многоуровневые улучшения (если они есть)
                if (effectData.multiUpgradeTiers && Array.isArray(effectData.multiUpgradeTiers)) {
                    for (const multi of effectData.multiUpgradeTiers) {
                        if (Math.random() < multi.chance) {
                            tiersUpgraded = multi.tiers;
                            upgradeSucceeded = true;
                            break;
                        }
                    }
                }
                
                // 2. Если многоуровневое улучшение не сработало, проверяем базовое
                if (!upgradeSucceeded && Math.random() < effectData.chance) {
                    tiersUpgraded = 1;
                    upgradeSucceeded = true;
                }

                // 3. Если любое улучшение сработало, применяем его
                if (upgradeSucceeded) {
                    const currentIndex = RARITIES_DATA.findIndex(r => r.id === determinedRarityId);
                    const newIndex = currentIndex - tiersUpgraded;

                    if (newIndex >= 0) {
                        const originalId = determinedRarityId;
                        const nextRarity = RARITIES_DATA[newIndex];
                        const prestigeOk = (nextRarity.minPrestige || 0) <= playerData.prestigeLevel;
                        const supporterOk = !(nextRarity.id === 'diamond' && !playerData.isSupporter);

                        if (prestigeOk && supporterOk) {
                            determinedRarityId = nextRarity.id;
                            const originalName = L.get(getRarityDataById(originalId).nameKey);
                            const upgradedName = L.get(nextRarity.nameKey);

                            console.log(`%cCORRUPTION EFFECT TRIGGERED! Upgraded ${originalId} to ${determinedRarityId} (+${tiersUpgraded} tiers)`, "color: red;");
                            
                            let message = tiersUpgraded > 1 ?
                                L.get('notifications.corruptionEffectTriggeredMulti').replace('{original}', originalName).replace('{upgraded}', upgradedName).replace('{tiers}', tiersUpgraded) :
                                L.get('notifications.corruptionEffectTriggered').replace('{original}', originalName).replace('{upgraded}', upgradedName);
                            
                            UI.showNotification(message, 'danger');
                        }
                    }
                }
            }
        }
        // <<< КОНЕЦ БЛОКА КЛЮЧЕВОГО ИСПРАВЛЕНИЯ >>>

        return processRollResult(determinedRarityId);
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
        if (playerData.equippedItems.length >= Game.getMaxEquippedItems()) {
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
        getLuckCoreAmplificationCost, performRebirth, getRebirthCost, setActiveSkin, checkForSupporterStatus, getMaxEquippedItems,
        setActiveMechanicalEffect

    };
})();

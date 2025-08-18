// js/game.js

// Таблица бонусов престижа
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
    { base: 1.20, perCard: 0.025 },
    // Уровень 7
    { base: 1.50, perCard: 0.028 },
    // Уровень 8
    { base: 1.70, perCard: 0.031 },
    // Уровень 9
    { base: 2.00, perCard: 0.034 },
    // Уровень 10
    { base: 2.30, perCard: 0.037 },
    // Уровень 11
    { base: 2.60, perCard: 0.040 },

    // Сюда можно добавлять новые уровни в будущем
];

const Game = (() => {
    const BASE_LUCK = 1.0;

    // Текущее состояние игрока
    let playerData = {};

    // Утилиты
    function deepClone(obj) {
        try {
            return JSON.parse(JSON.stringify(obj));
        } catch {
            return obj;
        }
    }

    function notify(msg, type = 'info', ms = 4000) {
        if (typeof UI !== 'undefined' && UI.showNotification) {
            UI.showNotification(msg, type, ms);
        } else {
            console.log(`[${type}] ${msg}`);
        }
    }

    function ensurePlayerDataDefaults(data) {
        const defaults = SaveManager.getDefaultPlayerData ? SaveManager.getDefaultPlayerData() : {};
        const d = data || {};
        d.playerId = d.playerId || defaults.playerId || '';
        d.currency = Number.isFinite(d.currency) ? d.currency : 0;

        d.inventory = Array.isArray(d.inventory) ? d.inventory : [];
        d.equippedItems = Array.isArray(d.equippedItems) ? d.equippedItems : [];
        d.activeBoosts = Array.isArray(d.activeBoosts) ? d.activeBoosts : [];
        d.seenRarities = Array.isArray(d.seenRarities) ? d.seenRarities : [];
        d.unseenCardIds = Array.isArray(d.unseenCardIds) ? d.unseenCardIds : [];
        d.completedAchievements = Array.isArray(d.completedAchievements) ? d.completedAchievements : [];
        d.seenAchievements = Array.isArray(d.seenAchievements) ? d.seenAchievements : [];

        d.activeSkins = d.activeSkins || {};
        d.purchasedUpgrades = d.purchasedUpgrades || {};
        d.duplicateCounts = d.duplicateCounts || {};
        d.activePassives = d.activePassives || {};

        d.activeTheme = d.activeTheme || (defaults.activeTheme || 'default');
        d.unlockedThemes = Array.isArray(d.unlockedThemes) ? d.unlockedThemes : (defaults.unlockedThemes || []);

        d.specialContentEnabled = typeof d.specialContentEnabled === 'boolean' ? d.specialContentEnabled : true;
        d.notificationsEnabled = d.notificationsEnabled !== false; // По умолчанию включены

        d.isSupporter = !!d.isSupporter;
        d.luckCoreLevel = Number.isFinite(d.luckCoreLevel) ? d.luckCoreLevel : 0;
        d.luckCoreFragments = Number.isFinite(d.luckCoreFragments) ? d.luckCoreFragments : 0;

        d.prestigeLevel = Number.isFinite(d.prestigeLevel) ? d.prestigeLevel : 0;

        d.misfortuneStacks = Number.isFinite(d.misfortuneStacks) ? d.misfortuneStacks : 0;
        d.motivationStacks = Number.isFinite(d.motivationStacks) ? d.motivationStacks : 0;

        d.musicVolume = Number.isFinite(d.musicVolume) ? d.musicVolume : 0;

        d.lastRollTimestamp = Number.isFinite(d.lastRollTimestamp) ? d.lastRollTimestamp : 0;

        d.materials = d.materials || {}; // { materialId: count }
        d.tokens = d.tokens || {}; // { tokenId: count }

        // Статистика — глубокая копия дефолтов
        if (!d.stats) {
            d.stats = deepClone(defaults.stats || {});
        } else {
            // Гарантируем под-поля
            d.stats.rollsByRarity = d.stats.rollsByRarity || {};
            d.stats.totalRolls = Number.isFinite(d.stats.totalRolls) ? d.stats.totalRolls : 0;
            d.stats.currencyFromDuplicates = Number.isFinite(d.stats.currencyFromDuplicates) ? d.stats.currencyFromDuplicates : 0;
        }

        return d;
    }

    // --- Инициализация ---
    function init() {
        playerData = ensurePlayerDataDefaults(SaveManager.loadPlayerData());
        console.log("Game initialized with player data:", playerData);

        updateActivePassives();

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
            const itemName = (typeof L !== 'undefined' && L.get) ? (L.get(itemToUnequip.nameKey) || itemToUnequip.id) : itemToUnequip.id;
            const message = (typeof L !== 'undefined' && L.get) ? L.get('notifications.itemUnequippedDueToSlotLoss').replace('{itemName}', itemName) : `Item unequipped: ${itemName}`;
            notify(message, 'warning', 8000);
            saveGame();
        }

        // Проверяем статус саппортера всегда, но без "not found" спама при старте
        checkForSupporterStatus({ silentNotFound: true })
            .catch(err => console.warn('Supporter check on init failed:', err));

        checkActiveBoosts();
        // UI.updateAll — вызывается из основного скрипта после Game.init() и UI.init()
    }

    // --- Управление данными игрока ---
    function getPlayerData() {
        return playerData;
    }

    function saveGame() {
        SaveManager.savePlayerData(playerData);
    }

    function resetGame() {
        if (typeof L !== 'undefined' && confirm(L.get('ui.resetWarning'))) {
            playerData = ensurePlayerDataDefaults(SaveManager.resetPlayerData());
            updateActivePassives();
            if (typeof UI !== 'undefined' && UI.updateAll) {
                UI.updateAll(playerData);
            }
            console.log("Game progress has been reset.");
        }
    }

    function getMaxEquippedItems() {
        return playerData.isSupporter ? 4 : 3;
    }

    function getRebirthCost() {
        const baseCost = 1000000;
        const multiplier = 3.5;
        const originalCost = Math.floor(baseCost * Math.pow(multiplier, playerData.prestigeLevel));
        return getDiscountedCost(originalCost);
    }

    // --- Пассивные эффекты ---
    function updateActivePassives() {
        const newActivePassives = {};
        const sorted = Array.isArray(RARITIES_DATA)
            ? [...RARITIES_DATA].sort((a, b) => (a.probabilityBase ?? 1) - (b.probabilityBase ?? 1)) // от самой редкой к частой
            : [];

        sorted.forEach(rarity => {
            if (!playerData.inventory.includes(rarity.id) || !rarity.passiveEffect) return;
            const familyId = rarity.displayParentId || rarity.id;
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

        for (const cardId of Object.values(playerData.activePassives)) {
            const rarityData = getRarityDataById(cardId, playerData);
            if (rarityData && rarityData.passiveEffect && rarityData.passiveEffect.type === bonusType) {
                totalValue += rarityData.passiveEffect.value;
            }
        }
        return totalValue;
    }

    function getDiscountedCost(originalCost) {
        const discount = Math.max(0, Math.min(0.95, getPassiveBonusValue('global_purchase_discount') || 0));
        const cost = Math.ceil(originalCost * (1 - discount));
        return Math.max(1, cost);
    }

    // --- Саппортеры ---
    function getSupporterSheetUrl() {
        const part1 = "https://docs.google.com/spreadsheets/d/";
        const sheetId = "1T0nZBft0W77asIxgY5LnW17cb3Xq4l3DX7RqEYfTfsg";
        const part2 = "/gviz/tq?tqx=out:csv&sheet=supporters";
        return `${part1}${sheetId}${part2}`;
    }

    async function checkForSupporterStatus(options = {}) {
        const { silentNotFound = false } = options;
        if (!playerData || !playerData.playerId) {
            console.warn('checkForSupporterStatus: missing playerId');
            return;
        }

        if (!silentNotFound) {
            notify(L.get('notifications.checkingSupporterStatus'), "info");
        }

        try {
            const url = getSupporterSheetUrl();
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');

            const csvText = await response.text();
            const supporterIds = new Set(csvText.split('\n').map(id => id.replace(/"/g, '').trim()).filter(Boolean));

            const isCurrentlySupporterInSheet = supporterIds.has(playerData.playerId);
            const wasSupporterInGame = playerData.isSupporter;

            if (isCurrentlySupporterInSheet && !wasSupporterInGame) {
                console.log("New supporter detected! Activating perks.");
                playerData.isSupporter = true;
                notify(L.get('notifications.supporterPerksActivated'), "success", 8000);
                saveGame();
                if (typeof UI !== 'undefined' && UI.updateAll) UI.updateAll(getPlayerData());
                return;
            }

            if (isCurrentlySupporterInSheet && wasSupporterInGame) {
                console.log("Supporter status confirmed. No changes needed.");
                notify(L.get('notifications.supporterStatusConfirmed'), "success");
                return;
            }

            if (!isCurrentlySupporterInSheet && wasSupporterInGame) {
                console.log("Supporter status has expired. Deactivating perks.");
                playerData.isSupporter = false;

                const maxItems = getMaxEquippedItems(); // вернет 3
                if (playerData.equippedItems.length > maxItems) {
                    const itemToUnequip = playerData.equippedItems.pop();
                    const purchasedItemId = "purchased_" + itemToUnequip.id;
                    if (!playerData.inventory.includes(purchasedItemId)) {
                        playerData.inventory.push(purchasedItemId);
                    }
                    const itemName = L.get(itemToUnequip.nameKey) || itemToUnequip.id;
                    const message = L.get('notifications.itemUnequippedDueToSlotLoss').replace('{itemName}', itemName);
                    notify(message, 'warning', 8000);
                }

                notify(L.get('notifications.supporterStatusExpired'), "warning", 8000);
                saveGame();
                if (typeof UI !== 'undefined' && UI.updateAll) UI.updateAll(getPlayerData());
                return;
            }

            if (!isCurrentlySupporterInSheet && !wasSupporterInGame) {
                console.log("Player ID not found in supporter list.");
                if (!silentNotFound) notify(L.get('notifications.supporterStatusNotFound'), "warning");
                return;
            }

        } catch (error) {
            console.error('Error fetching supporter sheet:', error);
            notify(L.get('notifications.supporterCheckError'), "danger");
        }
    }

    // --- Механические эффекты ---
    function setActiveMechanicalEffect(effectId) {
        if (playerData.activeMechanicalEffect === effectId) {
            playerData.activeMechanicalEffect = null;
        } else {
            playerData.activeMechanicalEffect = effectId;
        }
        console.log(`Active mechanical effect set to: ${playerData.activeMechanicalEffect}`);
        saveGame();
        if (typeof UI !== 'undefined' && UI.updateAll) {
            UI.updateAll(getPlayerData());
        }
    }

    function calculateMotivationBonus() {
        const effectData = getRarityDataById('motivation', playerData)?.mechanicalEffect;
        if (!effectData) return 0;

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
        if (typeof UI !== 'undefined' && UI.updateAll) {
            UI.updateAll(getPlayerData());
        }
        saveGame();
    }

    function spendCurrency(amount) {
        if (playerData.currency >= amount) {
            playerData.currency -= amount;
            console.log(`Spent ${amount} currency. Remaining: ${playerData.currency}`);
            saveGame();
            return true;
        }
        console.log(`Not enough currency. Needed: ${amount}, Has: ${playerData.currency}`);
        if (typeof L !== 'undefined') notify(L.get('notifications.notEnoughCurrency'), 'danger');
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
        if (rarityId === 'garbage') {
            // "Мусор" не добавляем в коллекцию/инвентарь
            return false;
        }

        const rarityData = getRarityDataById(rarityId, playerData);
        if (!rarityData) return false;

        let isNew = false;
        if (!playerData.inventory.includes(rarityId)) {
            playerData.inventory.push(rarityId);

            if (!playerData.unseenCardIds.includes(rarityId)) {
                playerData.unseenCardIds.push(rarityId);
            }
            isNew = true;
        }

        // Если это основная карта, устанавливаем для нее скин по умолчанию
        if (isNew && !rarityData.displayParentId) {
            playerData.activeSkins[rarityId] = rarityData.id;
        }

        // Если это альт-карта, а родительская еще не открыта — добавляем родителя
        if (rarityData.displayParentId && !playerData.inventory.includes(rarityData.displayParentId)) {
            playerData.inventory.push(rarityData.displayParentId);
            playerData.activeSkins[rarityData.displayParentId] = rarityData.displayParentId;
        }

        if (!playerData.seenRarities.includes(rarityId)) {
            playerData.seenRarities.push(rarityId);
        }

        updateActivePassives();
        return isNew;
    }

    function setActiveSkin(parentId, skinId) {
        if (playerData.inventory.includes(skinId)) {
            playerData.activeSkins[parentId] = skinId;
            saveGame();
            if (typeof UI !== 'undefined' && UI.updateAll) {
                UI.updateAll(getPlayerData());
            }
        }
    }

    function addMaterials(materialId, amount) {
        if (amount <= 0) return;
        if (!playerData.materials[materialId]) playerData.materials[materialId] = 0;
        playerData.materials[materialId] += amount;
        }

        function hasMaterials(costObj) {
        return Object.entries(costObj).every(([id, need]) => (playerData.materials[id] || 0) >= need);
        }

        function spendMaterials(costObj) {
        if (!hasMaterials(costObj)) return false;
        for (const [id, need] of Object.entries(costObj)) {
        playerData.materials[id] -= need;
        }
        return true;
        }

        function craftItem(recipeId) {
        const recipe = (window.CRAFT_RECIPES || []).find(r => r.id === recipeId);
        if (!recipe) {
        console.warn('CRAFT: recipe not found', recipeId);
        return false;
        }
        if (!hasMaterials(recipe.cost)) {
        if (typeof UI !== 'undefined' && UI.showNotification) UI.showNotification(L.get('notifications.notEnoughMaterials') || 'Not enough materials', 'danger');
        return false;
        }
        spendMaterials(recipe.cost);

        // Применяем результат
        const res = recipe.result;
        if (res.type === 'ui_theme') {
        if (!playerData.unlockedThemes.includes(res.themeId)) playerData.unlockedThemes.push(res.themeId);
        if (typeof UI !== 'undefined' && UI.applyTheme) UI.applyTheme(res.themeId);
        } else if (res.type === 'equipment') {
        // Кладём как купленный
        const invId = 'purchased_' + res.itemId;
        if (!playerData.inventory.includes(invId)) playerData.inventory.push(invId);
        } else if (res.type === 'card') {
        addCardToInventory(res.rarityId);
        } else if (res.type === 'token') {
        playerData.tokens[res.tokenId] = (playerData.tokens[res.tokenId] || 0) + 1;
        }
        saveGame();
        if (typeof UI !== 'undefined' && UI.updateAll) UI.updateAll(getPlayerData());
        if (typeof UI !== 'undefined' && UI.showNotification) UI.showNotification(L.get('notifications.craftSuccess') || 'Crafted!', 'success');
        return true;
    }

    // --- Перерождение ---
    function performRebirth() {
        const cost = getRebirthCost();
        if (playerData.currency < cost) {
            notify(L.get('notifications.notEnoughForRebirth'), 'danger');
            return;
        }

        const thread = playerData.equippedItems.find(item => item.id === 'equip_fates_thread');
        let preservedItem = null;

        if (thread) {
            const otherItems = playerData.equippedItems.filter(item => item.id !== 'equip_fates_thread');
            if (otherItems.length > 0) {
                preservedItem = otherItems[Math.floor(Math.random() * otherItems.length)];
                console.log(`Fate's Thread will preserve: ${preservedItem.id}`);
                notify(`Нить Судьбы сохранит: ${L.get(preservedItem.nameKey)}`, 'info');
            }
            if (!playerData.completedAchievements.includes('use_fates_thread')) {
                grantAchievement('use_fates_thread');
            }
        }

        if (confirm(L.get('ui.rebirth.confirmation'))) {
            const oldBonus = calculateRebirthBonus(playerData);

            // Сбрасываем основные игровые показатели
            playerData.currency = 0;
            playerData.activeBoosts = [];
            playerData.luckCoreLevel = 0;
            playerData.misfortuneStacks = 0;
            playerData.activeMechanicalEffect = null;

            // Полный сброс экипировки и улучшений
            playerData.equippedItems = [];
            playerData.purchasedUpgrades = {}; // fastRoll: false и т.п.

            // Очищаем инвентарь от купленных предметов
            playerData.inventory = playerData.inventory.filter(itemId => !itemId.startsWith("purchased_"));

            if (preservedItem) {
                playerData.inventory.push("purchased_" + preservedItem.id);
                playerData.equippedItems.push(preservedItem);
                console.log(`Preserved item ${preservedItem.id} restored to inventory and equipped.`);
            }

            // Пересчитываем пассивки
            updateActivePassives();

            // Применяем бонусы престижа
            playerData.prestigeLevel++;
            const newBonus = calculateRebirthBonus(playerData);
            const bonusGain = newBonus - oldBonus;

            saveGame();
            notify(`${L.get('ui.rebirth.success')} +${bonusGain.toFixed(3)} ${L.get('ui.luck').toLowerCase()}`, 'success', 8000);
            if (typeof UI !== 'undefined' && UI.updateAll) UI.updateAll(playerData);
        }
    }

    /**
     * Динамически рассчитывает бонус удачи от перерождений.
     * @param {object} pData
     * @returns {number}
     */
    function calculateRebirthBonus(pData) {
        const level = pData.prestigeLevel;
        if (level === 0) return 0.0;

        // Считаем только реальные коллекционные карты
        const uniqueCardsCount = new Set(
            pData.inventory.filter(id => id !== 'garbage' && !id.startsWith("purchased_"))
        ).size;

        const tierIndex = Math.min(level - 1, PRESTIGE_BONUSES.length - 1);
        const tier = PRESTIGE_BONUSES[tierIndex];

        const baseBonus = tier.base;
        const perCardBonus = uniqueCardsCount * tier.perCard;
        return baseBonus + perCardBonus;
    }

    // --- Удача ---
    function computeLuck() {
        // База
        let luck = BASE_LUCK;

        // Ядро и престиж
        luck += calculateLuckFromCore(playerData.luckCoreLevel || 0);
        luck += calculateRebirthBonus(playerData);

        // Бонус от дубликатов "blackhole" (если есть механика)
        const bhBonusPerDup = getRarityDataById('blackhole', playerData)?.mechanicalEffect?.luckBonusPerDuplicate ?? 0.01;
        luck += (playerData.duplicateCounts?.blackhole || 0) * bhBonusPerDup;

        // Экипировка и "несчастье"
        let misfortuneBonus = 0;
        playerData.equippedItems.forEach(item => {
            if (item.luckBonus) {
                luck += item.luckBonus;
            }
            if (item.effect?.type === "cumulative_luck_on_low_rolls") {
                const stacks = Math.min(playerData.misfortuneStacks || 0, (item.effect.maxStacks ?? Infinity));
                misfortuneBonus += stacks * item.effect.bonusPerStack;
            }
        });
        luck += misfortuneBonus;

        // Самый сильный буст
        let maxBoostBonus = 0;
        playerData.activeBoosts.forEach(boost => {
            if (boost.type === "luck_boost" && boost.luckBonus > maxBoostBonus) {
                maxBoostBonus = boost.luckBonus;
            }
        });

        // Эффект катализатора
        if (playerData.activeMechanicalEffect === 'space_alt_2') {
            const effectData = getRarityDataById('space_alt_2', playerData)?.mechanicalEffect;
            if (effectData) {
                maxBoostBonus *= effectData.multiplier;
            }
        }
        luck += maxBoostBonus;

        // "Путь меча" (мотивация)
        if (playerData.activeMechanicalEffect === 'motivation') {
            luck += calculateMotivationBonus();
        }

        return parseFloat(luck.toFixed(3));
    }

    function calculateCurrentLuck() {
        return computeLuck();
    }

    function getEffectiveLuck() {
        // Должно совпадать с показателем, чтобы игрок видел то, что реально используется
        return computeLuck();
    }

    /**
     * Суммарный бонус удачи от Ядра (учитывая тиры).
     * @param {number} coreLevel
     * @returns {number}
     */
    function calculateLuckFromCore(coreLevel) {
        if (!coreLevel || coreLevel <= 0) return 0.0;

        let totalLuckBonus = 0;
        const tierSize = 10;
        const baseBonus = 0.01;
        const bonusIncrement = 0.005;

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

    // Стоимость усиления Ядра
    function getLuckCoreAmplificationCost() {
        const coreLevel = playerData.luckCoreLevel || 0;
        const baseCost = 6500;
        const tier = Math.floor(coreLevel / 10);
        const costMultiplier = 1.15 + (tier * 0.02);
        const originalCost = Math.floor(baseCost * Math.pow(costMultiplier, coreLevel));
        return getDiscountedCost(originalCost);
    }

    function amplifyLuckCore(isFree = false) {
        const cost = getLuckCoreAmplificationCost();
        if (!isFree && !spendCurrency(cost)) {
            return;
        }

        playerData.luckCoreLevel++;
        const newTotalBonus = calculateLuckFromCore(playerData.luckCoreLevel);
        console.log(`Luck Core amplified to level ${playerData.luckCoreLevel}. New permanent bonus: +${newTotalBonus.toFixed(3)}`);
        saveGame();
        if (typeof UI !== 'undefined' && UI.updateAll) {
            UI.updateAll(getPlayerData());
        }
    }

    // --- Ролл Карточек ---
    function performRoll(guaranteedRarityId = null) {
        // Стоимость и шанс эффектов
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
            if (r.id === 'salt' && !playerData.completedAchievements.includes('unlock_salt_card')) {
                return false;
            }
            if (r.id === 'diamond' && !playerData.isSupporter) {
                return false;
            }
            return true;
        });

        // Lucky Roll
        let isLuckyRollActiveThisRoll = false;
        let currentLuckMultiplier = 1.0;

        if (playerData.luckyRollCounter === undefined) playerData.luckyRollCounter = 0;
        let luckyRollThreshold = 11;

        const chronometer = playerData.equippedItems.find(item => item.effect?.type === "lucky_roll_accelerator");
        if (chronometer) {
            luckyRollThreshold -= (chronometer.effect.rolls_reduced || 0);
        }
        luckyRollThreshold = Math.max(2, luckyRollThreshold); // Минимальный порог

        playerData.luckyRollThreshold = luckyRollThreshold;
        playerData.luckyRollCounter++;

        if (playerData.luckyRollCounter >= playerData.luckyRollThreshold) {
            const baseMultiplier = playerData.purchasedUpgrades.empoweredLuckyRoll ? 2.5 : 2.0;
            currentLuckMultiplier = baseMultiplier;
            isLuckyRollActiveThisRoll = true;
            console.log(`✨ LUCKY ROLL TRIGGERED! Luck x${currentLuckMultiplier}. Counter reset.`);
            playerData.luckyRollCounter = 0;
            if (typeof UI !== 'undefined' && UI.showNotification) {
                notify(L.get('notifications.luckyRollTriggered'), "success");
            }
        }

        if (typeof UI !== 'undefined' && UI.updateLuckyRollDisplay) {
            UI.updateLuckyRollDisplay(playerData.luckyRollCounter, playerData.luckyRollThreshold);
        }

        if (!playerData.stats) {
            playerData.stats = deepClone(SaveManager.getDefaultPlayerData().stats);
        }
        playerData.stats.totalRolls++;

        let baseEffectiveLuck = getEffectiveLuck();

        // Эффект "джекпот"
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
            notify(message, 'warning');
        }

        finalEffectiveLuck *= currentLuckMultiplier;
        finalEffectiveLuck = parseFloat(finalEffectiveLuck.toFixed(2));

        const activeEvent = getActiveEvent();
        let eventLuckMultiplier = 1;
        if (activeEvent && activeEvent.effect?.type === 'global_luck_multiplier') {
            eventLuckMultiplier = activeEvent.effect.multiplier;
            finalEffectiveLuck *= eventLuckMultiplier;
        }

        console.log(`Performing roll. BaseLuck: ${baseEffectiveLuck}, LuckyMultiplier: ${currentLuckMultiplier}, EventLuckMultiplier: ${eventLuckMultiplier}, Jackpot: ${jackpotTriggeredThisRoll}, FinalEffectiveLuck: ${finalEffectiveLuck}`);

        let determinedRarityId = null;

        if (guaranteedRarityId && getRarityDataById(guaranteedRarityId, playerData)) {
            determinedRarityId = guaranteedRarityId;
            console.log(`Performing GUARANTEED roll for: ${guaranteedRarityId}`);
        } else {
            for (const rarity of availableRarities) {
                if (rarity.id === 'garbage') continue;

                // Эвент-множитель для конкретных карт
                let eventMultiplier = 1;
                if (activeEvent && activeEvent.effect?.type === 'boost_specific_cards' && activeEvent.effect.cardIds.includes(rarity.id)) {
                    eventMultiplier = activeEvent.effect.multiplier;
                }

                const P_base = rarity.probabilityBase;
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

        // Платина: апгрейд мусора до common
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

        // Универсальный апгрейд редкости (ERROR alt)
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
                    const idx = RARITIES_DATA.findIndex(r => r.id === determinedRarityId);
                    const newIndex = idx - tiersUpgraded;

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

                            let message = tiersUpgraded > 1
                                ? L.get('notifications.corruptionEffectTriggeredMulti')
                                    .replace('{original}', originalName)
                                    .replace('{upgraded}', upgradedName)
                                    .replace('{tiers}', tiersUpgraded)
                                : L.get('notifications.corruptionEffectTriggered')
                                    .replace('{original}', originalName)
                                    .replace('{upgraded}', upgradedName);

                            notify(message, 'danger');
                        }
                    }
                }
            }
        }

        // История последних роллов
        if (!playerData.lastRollsHistory) playerData.lastRollsHistory = [];
        playerData.lastRollsHistory.push(determinedRarityId);
        if (playerData.lastRollsHistory.length > 10) {
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

        // Камень Алхимика: шанс получить фрагмент вместо валюты с дублей из "донных" редкостей
        let finalDuplicateReward = baseDuplicateReward;
        let fragmentGenerated = false;
        const alchemistStone = playerData.equippedItems.find(item => item.id === 'equip_alchemists_stone');
        if (alchemistStone && alchemistStone.effect.triggerRarities.includes(rarityId) && baseDuplicateReward > 0) {
            if (Math.random() < alchemistStone.effect.chance) {
                playerData.luckCoreFragments = (playerData.luckCoreFragments || 0) + 1;
                fragmentGenerated = true;

                const notificationText = L.get('notifications.luckCoreFragmentFound')
                    .replace('{current}', playerData.luckCoreFragments)
                    .replace('{needed}', alchemistStone.effect.fragmentsNeeded);
                notify(notificationText, 'warning');

                if (playerData.luckCoreFragments >= alchemistStone.effect.fragmentsNeeded) {
                    notify(L.get('notifications.luckCoreAmplifiedByFragments'), 'success', 6000);
                    if (!playerData.completedAchievements.includes('empower_core_with_stone')) {
                        grantAchievement('empower_core_with_stone');
                    }
                    amplifyLuckCore(true);
                    playerData.luckCoreFragments = 0;
                }
            }
        }

        // Материалы с дубликатов (по таблице выпадений)
        if (!isNew && window.MATERIAL_DROPS) {
            const drops = window.MATERIAL_DROPS[rarityId] || [];
            drops.forEach(entry => {
            if (Math.random() < entry.chance) {
            const amt = entry.min + Math.floor(Math.random() * (entry.max - entry.min + 1));
            addMaterials(entry.materialId, amt);
            console.log("Materials: +${amt} ${entry.materialId} from ${rarityId}");
            }
            });
        }

        // Бонус % к валюте за дубли
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
            console.log(`Greed Bonus: Original: ${baseDuplicateReward}, Bonus: +${bonusAmount} (${(totalBonusPercent * 100).toFixed(0)}%), New: ${finalDuplicateReward}`);
        }

        // Эвент-множитель на валюту за дубли
        const activeEvent = getActiveEvent();
        if (activeEvent && activeEvent.effect?.type === 'duplicate_currency_multiplier' && finalDuplicateReward > 0) {
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

        // "Рука Несчастья": стаки
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
            card: {
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
        // Считаем "редкие" как parent 'rare' и alt-версии
        const rareCount = results.filter(res => {
            const id = res.rarity.id;
            return id === 'rare' || id.startsWith('rare_');
        }).length;

        if (rareCount >= 5 && !playerData.completedAchievements.includes('five_rares_in_multi')) {
            grantAchievement('five_rares_in_multi');
        }
    }

    function unlockAllCards() {
        const allCardIds = RARITIES_DATA.map(r => r.id);
        const newInventory = [...new Set([...playerData.inventory, ...allCardIds])];
        playerData.inventory = newInventory;
        const newSeenRarities = [...new Set([...playerData.seenRarities, ...allCardIds])];
        playerData.seenRarities = newSeenRarities;
        updateActivePassives();
        checkAchievementsAndCollections();
        console.log("All cards unlocked!");
        if (typeof UI !== 'undefined' && UI.updateAll) {
            UI.updateAll(getPlayerData());
        }
        saveGame();
    }

    function setCurrency(amount) {
        const value = parseInt(amount, 10);
        if (isNaN(value) || value < 0) return;
        playerData.currency = value;
        if (typeof UI !== 'undefined' && UI.updateAll) {
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

        if (itemType === 'equipment' && playerData.inventory.includes("purchased_" + itemId)) {
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
                playerData.inventory.push("purchased_" + itemId);
                if (playerData.equippedItems.length < getMaxEquippedItems()) {
                    equipItem(itemData);
                } else {
                    alert(`${L.get(itemData.nameKey)} ${L.get('notifications.itemPurchased')}`);
                }
            } else if (itemType === 'upgrade') {
                playerData.purchasedUpgrades[itemData.targetProperty] = true;
                if (itemData.targetProperty === 'multiRollX5' && typeof UI !== 'undefined' && UI.toggleMultiRollButton) {
                    UI.toggleMultiRollButton(true);
                }
                if (itemData.targetProperty === 'multiRollX10' && typeof UI !== 'undefined' && UI.toggleMultiRollButton) {
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
        saveGame();
    }

    let boostCheckInterval = null;
    function checkActiveBoosts() {
        if (boostCheckInterval) clearInterval(boostCheckInterval);

        boostCheckInterval = setInterval(() => {
            let boostsChanged = false;
            const now = Date.now();
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
        if (playerData.equippedItems.length >= getMaxEquippedItems()) {
            notify(L.get('ui.maxEquipment'), 'warning');
            return false;
        }
        if (playerData.equippedItems.find(e => e.id === itemData.id)) {
            return false;
        }

        const equipToSave = {
            id: itemData.id,
            nameKey: itemData.nameKey,
            luckBonus: itemData.luckBonus,
            effect: itemData.effect ? deepClone(itemData.effect) : undefined
        };

        playerData.equippedItems.push(equipToSave);
        saveGame();
        if (typeof UI !== 'undefined' && UI.updateAll) {
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

    // --- Визуальные эффекты ---
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
            if (typeof UI !== 'undefined' && UI.applyTheme) {
                UI.applyTheme(themeId);
            }
        }
    }

    // --- Эвенты, Ачивки, Коллекции ---
    function getActiveEvent() {
        const now = Date.now();
        if (!Array.isArray(EVENTS_DATA)) return null;
        return EVENTS_DATA.find(event => {
            const start = event.startDate ? new Date(event.startDate).getTime() : -Infinity;
            const end = event.endDate ? new Date(event.endDate).getTime() : Infinity;
            return now >= start && now <= end;
        }) || null;
    }

    function checkAchievementsAndCollections() {
        // Достижения
        for (const achId in ACHIEVEMENTS_DATA) {
            if (!playerData.completedAchievements.includes(achId)) {
                try {
                    if (ACHIEVEMENTS_DATA[achId].condition(playerData)) {
                        grantAchievement(achId);
                    }
                } catch (e) {
                    console.warn(`Achievement condition error for ${achId}:`, e);
                }
            }
        }
        // Коллекции
        for (const colId in COLLECTIONS_DATA) {
            if (!playerData.completedAchievements.includes(colId)) {
                const collection = COLLECTIONS_DATA[colId];
                const hasAllCards = collection.cardIds.every(cardId => playerData.inventory.includes(cardId));
                if (hasAllCards) {
                    grantAchievement(colId, true);
                }
            }
        }
    }

    function grantAchievement(achId, isCollection = false) {
        const data = isCollection ? COLLECTIONS_DATA[achId] : ACHIEVEMENTS_DATA[achId];
        if (!data) return;

        if (!playerData.completedAchievements.includes(achId)) {
            playerData.completedAchievements.push(achId);
        }

        const reward = data.reward;
        let rewardText = "";

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

        const achievementName = L.get(data.nameKey);
        let notificationMessage = `${L.get('notifications.achievementUnlocked')}: <strong>${achievementName}</strong>!`;
        if (rewardText) {
            notificationMessage += ` ${L.get('notifications.reward')}: ${rewardText}`;
        }

        notify(notificationMessage, 'success', 8000);
        console.log(`Achievement unlocked: ${achId}`);
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
        processMultiRollResult,
        purchaseShopItem,
        equipItem,
        unequipItem,
        calculateCurrentLuck,
        getEffectiveLuck,
        checkActiveBoosts,
        setActiveVisualEffect,
        clearActiveVisualEffect,
        setMusicVolume,
        unlockAllCards,
        setCurrency,
        addCardToInventory,
        amplifyLuckCore,
        getLuckCoreAmplificationCost,
        performRebirth,
        getRebirthCost,
        setActiveSkin,
        checkForSupporterStatus,
        getMaxEquippedItems,
        setActiveMechanicalEffect,
        calculateLuckFromCore,
        getDiscountedCost,
        getActiveEvent,
        setActiveTheme,
        calculateRebirthBonus,
        craftItem, addMaterials, hasMaterials, spendMaterials
    };
})();
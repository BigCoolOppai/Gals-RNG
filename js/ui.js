// js/ui.js

const UI = (() => {
    // --- DOM Элементы ---
    let currencyDisplay, luckDisplay, activeBoostsDisplay;
    let rollButton, multiRollButton, autorollButton;
    let rollAnimationContainer, rollSlot, multiRollSlotsContainer, rollResultContainer;
    let inventoryGrid, inventoryCounterElement; // Добавлен inventoryCounterElement
    let boostShop, equipmentShop, upgradesShop, equippedItemsDisplay;
    // skipAnimationSettings удален
    let cardModal, modalCardImage, modalCardName, modalCardRarity, modalCardDescription;
    let statsTotalRollsEl, statsUniqueCardsOpenedEl, statsCurrencyFromDuplicatesEl, statsByRarityContainerEl;
    let inventorySortSelect;

    const AUTOROLL_BREATHING_ROOM = 500; // ms "передышки" между роллами

    // Состояние UI
    let isRolling = false;
    let boostTimerInterval = null;
    let isAutorolling = false; 
    let autorollTimer = null;
    let lastRollTimestamp = 0;
    let activeSingleRollClearCallback = null;
    let activeMultiRollClearCallbacks = [];

    let isTabActive = true; 

    let currentEffectCleanup = null; 

    let newCardModal, newCardModalImage, newCardModalName, newCardModalRarity;
    let newCardQueue = []; // Очередь для показа новых карт
    let isShowingNewCard = false;

    let newCardDismissTimer = null; // <-- ДОБАВЬТЕ ЭТУ СТРОКУ


    function cacheDOMElements() {
        currencyDisplay = document.getElementById('currencyDisplay');
        luckDisplay = document.getElementById('luckDisplay');
        activeBoostsDisplay = document.getElementById('activeBoostsDisplay');
        luckyRollDisplay = document.getElementById('luckyRollDisplay');

        rollButton = document.getElementById('rollButton');
        multiRollButton = document.getElementById('multiRollButton');
        rollAnimationContainer = document.getElementById('rollAnimationContainer');
        rollSlot = document.getElementById('rollSlot');
        multiRollSlotsContainer = document.getElementById('multiRollSlotsContainer');
        rollResultContainer = document.getElementById('rollResultContainer');
        autorollButton = document.getElementById('autorollButton');

        inventoryGrid = document.getElementById('inventoryGrid');
        inventoryCounterElement = document.getElementById('inventoryCounter'); // Кэшируем счетчик

        boostShop = document.getElementById('boostShop');
        equipmentShop = document.getElementById('equipmentShop');
        upgradesShop = document.getElementById('upgradesShop');
        equippedItemsDisplay = document.getElementById('equippedItemsDisplay');

        // skipAnimationSettings удален

        cardModal = new bootstrap.Modal(document.getElementById('cardModal'));
        modalCardImage = document.getElementById('modalCardImage');
        modalCardName = document.getElementById('cardModalLabel');
        modalCardRarity = document.getElementById('modalCardRarity');
        modalCardChance = document.getElementById('modalCardChance');
        modalCardDescription = document.getElementById('modalCardDescription');
        toggleVisualEffectButton = document.getElementById('toggleVisualEffectButton'); // Это не нужно, если кнопка создается динамически
        visualEffectControlsContainer = document.getElementById('visualEffectControls'); // Если бы он был всегда

        musicVolumeSlider = document.getElementById('musicVolumeSlider');
        musicVolumeLabel = document.getElementById('musicVolumeLabel');
        backgroundMusicElement = document.getElementById('backgroundMusic');

        statsTotalRollsEl = document.getElementById('statsTotalRolls');
        statsUniqueCardsOpenedEl = document.getElementById('statsUniqueCardsOpened');
        statsCurrencyFromDuplicatesEl = document.getElementById('statsCurrencyFromDuplicates');
        statsByRarityContainerEl = document.getElementById('statsByRarityContainer');

        playerIdDisplay = document.getElementById('playerIdDisplay');
        copyPlayerIdBtn = document.getElementById('copyPlayerIdBtn');
        checkSupportBtn = document.getElementById('checkSupportBtn');

        document.getElementById('resetProgressButton')?.addEventListener('click', Game.resetGame);

        inventorySortSelect = document.getElementById('inventorySort');

        newCardModal = new bootstrap.Modal(document.getElementById('newCardModal'));
        newCardModalImage = document.getElementById('newCardModalImage');
        newCardModalName = document.getElementById('newCardModalName');
        newCardModalRarity = document.getElementById('newCardModalRarity');
    }

    // --- Инициализация UI ---
    // js/ui.js

    function init() {
        cacheDOMElements();
        setupEventListeners();
        renderShop(); // renderShop обычно сам получает данные из Game.getPlayerData()
        const initialPlayerData = Game.getPlayerData(); 
        updateAll(initialPlayerData); 

        // 3. Проверяем активные бусты (может обновить UI через свои внутренние вызовы)
        Game.checkActiveBoosts(); 

        // 4. Часть кода, которая обновляет специфичные элементы UI при инициализации,
        //    используя уже полученные 'initialPlayerData'.
        //    Lucky Roll display УЖЕ должен обновляться внутри updateAll.
        //    Если нет, то:
        // if (initialPlayerData && typeof initialPlayerData.luckyRollCounter !== 'undefined') {
        //     updateLuckyRollDisplay(initialPlayerData.luckyRollCounter, initialPlayerData.luckyRollThreshold);
        // }
        //    Но лучше, чтобы updateAll был единственным источником правды для таких обновлений.

        // Установка громкости
        if (musicVolumeSlider && backgroundMusicElement) {
            // Убедимся, что initialPlayerData и musicVolume существуют
            if (initialPlayerData && typeof initialPlayerData.musicVolume === 'number') {
                musicVolumeSlider.value = initialPlayerData.musicVolume;
                backgroundMusicElement.volume = initialPlayerData.musicVolume;
                if (musicVolumeLabel) musicVolumeLabel.textContent = `${Math.round(initialPlayerData.musicVolume * 100)}%`;
            } else {
                // Устанавливаем дефолтное значение, если в playerData нет musicVolume
                musicVolumeSlider.value = 0; // или ваше дефолтное значение
                backgroundMusicElement.volume = 0;
                if (musicVolumeLabel) musicVolumeLabel.textContent = `0%`;
                console.warn("UI.init: initialPlayerData.musicVolume is undefined, defaulting to 0.");
            }
        }

        // Применение начального визуального эффекта
        // Убедимся, что initialPlayerData существует
        const initialEffectId = initialPlayerData ? initialPlayerData.activeVisualEffectRarityId : null;
        applyVisualEffect(initialEffectId, true); 

        // Логика начальной загрузки музыки
        if (backgroundMusicElement) {
            const musicForInitialEffect = initialEffectId ? VisualEffects.effectMusicMap[initialEffectId] : null;
            const targetInitialTrack = musicForInitialEffect || VisualEffects.defaultMusicTrack;

            if (!backgroundMusicElement.currentSrc || !backgroundMusicElement.currentSrc.endsWith(targetInitialTrack)) {
                backgroundMusicElement.src = targetInitialTrack;
                backgroundMusicElement.load();
                console.log("UI.init: Initial music source explicitly set to:", targetInitialTrack);
            }
            // Повторный вызов applyVisualEffect здесь, если он отвечает за запуск музыки, 
            // может быть избыточен, если VisualEffects.apply уже это сделал при первом вызове.
            // UI.applyVisualEffect(initialEffectId, true); // Этот вызов уже был выше.

            // Логика автоплея/паузы при громкости > 0 была у вас корректной (не трогаем)
            // if (initialPlayerData && initialPlayerData.musicVolume > 0) { ... }
        }

        // Строка, которая вызывала ошибку, больше не нужна,
        // так как renderStats вызывается из updateAll:
        // if (playerDataForInit && playerDataForInit.stats) { 
        //     renderStats(playerDataForInit);
        // }
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    }

    function setupEventListeners() {
        rollButton.addEventListener('click', handleManualRoll);
        multiRollButton.addEventListener('click', handleManualMultiRoll);
        autorollButton.addEventListener('click', toggleAutoroll);
        musicVolumeSlider.addEventListener('input', handleVolumeChange);
        // Добавляем обработчики для кнопок языка
        document.getElementById('lang-ru')?.addEventListener('click', () => L.setLanguage('ru'));
        document.getElementById('lang-en')?.addEventListener('click', () => L.setLanguage('en'));
        // Подсвечиваем активный язык
        const currentLang = L.getCurrentLanguage();
        document.getElementById(`lang-${currentLang}`)?.classList.add('active');
        // НОВЫЙ КОД: Обновление статистики при активации вкладки
        const statsTabButton = document.getElementById('stats-tab');
        if (statsTabButton) {
            statsTabButton.addEventListener('shown.bs.tab', function (event) {
                // 'shown.bs.tab' - это событие Bootstrap, которое срабатывает ПОСЛЕ того, как вкладка стала активной
                console.log("Stats tab shown, updating stats..."); // Для дебага
                const currentPlayerData = Game.getPlayerData(); // Получаем самые свежие данные
                if (currentPlayerData && currentPlayerData.stats) {
                    renderStats(currentPlayerData); // Перерисовываем статистику
                }
            });
        }
        inventorySortSelect.addEventListener('change', () => {
            // Сохраняем выбор пользователя
            localStorage.setItem('inventorySortOrder', inventorySortSelect.value);
            // Перерисовываем инвентарь с новым порядком
            renderInventory(Game.getPlayerData());
        });

        copyPlayerIdBtn.addEventListener('click', () => {
            if (playerIdDisplay.value) {
                navigator.clipboard.writeText(playerIdDisplay.value).then(() => {
                    showNotification(L.get('notifications.playerIdCopied'), "success");
                }).catch(err => {
                    showNotification(L.get('notifications.playerIdCopyError'), "danger");
                });
            }
        });

        checkSupportBtn.addEventListener('click', () => {
            Game.checkForSupporterStatus();
        });
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // --- ВКЛАДКА СТАЛА НЕАКТИВНОЙ ---
                isTabActive = false;
                // Останавливаем таймер, чтобы он не тикал в фоне зря
                clearTimeout(autorollTimer);
                autorollTimer = null;
                console.log('Tab became inactive. Autoroll timer paused.');
            } else {
                // --- ВКЛАДКА СНОВА АКТИВНА ---
                isTabActive = true;
                console.log('Tab became active.');
                // Если авторолл был включен, запускаем логику "догона"
                if (isAutorolling) {
                    handleAfkProgress();
                    // Таймер будет перезапущен в onRollsCompleted после первого "ручного" ролла
                }
                // Показываем карты из очереди
                processNewCardQueue();
            }
        });
        
    }

    function getTextColorForBg(hexColor) {
        if (!hexColor || hexColor.length < 7) return '#FFFFFF'; // Фоллбэк на белый
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 135 ? '#000000' : '#FFFFFF'; // Порог можно настроить
    }

    // js/ui.js

    function renderStats(playerData) {
        if (!playerData || !playerData.stats) {
            console.warn("renderStats: playerData or playerData.stats is missing.");
            return;
        }

        const stats = playerData.stats;
        const seenRaritiesSet = new Set(playerData.seenRarities || []); // Создаем Set из виденных редкостей для быстрой проверки

        if (statsTotalRollsEl) {
            statsTotalRollsEl.textContent = stats.totalRolls || 0;
        }
        if (statsUniqueCardsOpenedEl) {
            const validCardRarityIds = new Set(RARITIES_DATA.map(r => r.id));
            const totalPossibleCards = RARITIES_DATA.filter(r => r.id !== 'garbage' && validCardRarityIds.has(r.id)).length; // Убедимся, что считаем только валидные
            
            // Считаем открытые только из тех, что есть в RARITIES_DATA (на случай старых ID в инвентаре)
            const openedCount = playerData.inventory.filter(id => id !== 'garbage' && validCardRarityIds.has(id)).length;
            statsUniqueCardsOpenedEl.textContent = `${openedCount} / ${totalPossibleCards}`;
        }
        if (statsCurrencyFromDuplicatesEl) {
            statsCurrencyFromDuplicatesEl.textContent = stats.currencyFromDuplicates || 0;
        }

        if (statsByRarityContainerEl) {
            statsByRarityContainerEl.innerHTML = ''; // Очищаем предыдущие
            
            // Фильтруем RARITIES_DATA, оставляем только те, что игрок видел (и не "мусор", если он не выпадал)
            const raritiesToShowInStats = RARITIES_DATA.filter(rarity => {
                // "Мусор" показываем только если он был выбит хотя бы раз (т.е. есть в rollsByRarity)
                // ИЛИ если он есть в seenRarities (хотя обычно он не должен там быть, если не коллекционный)
                if (rarity.id === 'garbage') {
                    return stats.rollsByRarity && stats.rollsByRarity[rarity.id] > 0;
                }
                // Для остальных редкостей - проверяем, видел ли их игрок
                return seenRaritiesSet.has(rarity.id);
            });

            // Можно дополнительно отсортировать raritiesToShowInStats, если нужно,
            // например, по порядку из RARITIES_DATA (от редких к частым)
            // или по количеству выпадений. Сейчас они будут в порядке из RARITIES_DATA.

            raritiesToShowInStats.forEach(rarity => {
                const count = stats.rollsByRarity[rarity.id] || 0;
                // Если для виденной редкости счетчик роллов 0 (маловероятно, но возможно при ручном редактировании сейва),
                // можно ее не показывать, или показывать с нулем. Сейчас показываем с нулем.
                // if (count === 0 && rarity.id !== 'garbage') return; // Опционально: не показывать виденные, но не выбитые

                const textColor = getTextColorForBg(rarity.color);

                const listItem = document.createElement('a');
                listItem.href = "#";
                listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                listItem.style.cursor = 'default';
                listItem.onclick = (e) => e.preventDefault();

                listItem.innerHTML = `
                    ${L.get(rarity.nameKey)}
                    <span class="badge rounded-pill" style="background-color:${rarity.color}; color:${textColor};">
                        ${count}
                    </span>
                `;
                statsByRarityContainerEl.appendChild(listItem);
            });
        }
    }

    function showNewCard(rollResult) {
        newCardQueue.push(rollResult);
        processNewCardQueue();
    }

    function processNewCardQueue() {
        if (isShowingNewCard || newCardQueue.length === 0) {
            return;
        }
        isShowingNewCard = true;
        const result = newCardQueue.shift(); // Берем первую карту из очереди

        
        newCardModalImage.src = result.card.image;
        newCardModalName.textContent = result.card.name;
        newCardModalRarity.textContent = `${L.get('ui.rarity')}: ${result.rarity.name}`;
        newCardModalRarity.style.color = result.rarity.color;
        
        newCardModal.show();

        // --- НАЧАЛО НОВОГО КОДА ---
        // Запускаем таймер на 1 минуту (60000 мс) для автозакрытия
        clearTimeout(newCardDismissTimer); // Очищаем старый таймер на всякий случай
        newCardDismissTimer = setTimeout(() => {
            console.log("Auto-dismissing new card modal.");
            newCardModal.hide();
        }, 60000); 
        // --- КОНЕЦ НОВОГО КОДА ---
        
        // Слушатель на закрытие модалки
        const modalEl = document.getElementById('newCardModal');
        modalEl.addEventListener('hidden.bs.modal', () => {
            isShowingNewCard = false;
            clearTimeout(newCardDismissTimer);
            processNewCardQueue(); // Проверяем, есть ли еще карты в очереди
        }, { once: true });
    }

    function handleVolumeChange(event) {
    const volume = parseFloat(event.target.value);
    if (backgroundMusicElement) {
        backgroundMusicElement.volume = volume;
    }
    if (musicVolumeLabel) {
        musicVolumeLabel.textContent = `${Math.round(volume * 100)}%`;
    }
    Game.setMusicVolume(volume); // Сохраняем громкость через Game -> SaveManager

    // Если громкость > 0 и музыка на паузе (и src установлен), пытаемся запустить
    if (volume > 0 && backgroundMusicElement && backgroundMusicElement.paused && backgroundMusicElement.currentSrc && backgroundMusicElement.src !== window.location.href) {
        backgroundMusicElement.play().catch(e => console.warn("Volume change play failed:", e));
    } else if (volume === 0 && backgroundMusicElement && !backgroundMusicElement.paused) {
        backgroundMusicElement.pause(); // Если громкость 0, ставим на паузу
    }
}

    // --- Управление Автороллом ---
     function toggleAutoroll() {
        isAutorolling = !isAutorolling;
        autorollButton.textContent = L.get(isAutorolling ? 'ui.stopAutoroll' : 'ui.autoroll');
        autorollButton.classList.toggle('btn-success', !isAutorolling);
        autorollButton.classList.toggle('btn-danger', isAutorolling);
        
        if (isAutorolling) {
            console.log("Autoroll STARTED");
            rollButton.disabled = true;
            multiRollButton.disabled = true;
            performNextAutoroll(); // Запускаем первый ролл немедленно
        } else {
            console.log("Autoroll STOPPED");
            clearTimeout(autorollTimer);
            autorollTimer = null;
            rollButton.disabled = false;
            multiRollButton.disabled = !Game.getPlayerData().purchasedUpgrades.multiRollX5;
        }
    }

    function startAutoroll() {
        isAutorolling = true;
        autorollButton.textContent = 'Stop Autoroll';
        autorollButton.classList.remove('btn-success');
        autorollButton.classList.add('btn-danger');
        rollButton.disabled = true; // Блокируем ручные кнопки
        multiRollButton.disabled = true;
        console.log("Autoroll STARTED");
        performNextAutoroll(); // Запускаем первый авторолл
    }

    function stopAutoroll() {
        isAutorolling = false;
        if (autorollTimer) {
            clearTimeout(autorollTimer);
            autorollTimer = null;
        }
        autorollButton.textContent = 'Autoroll';
        autorollButton.classList.remove('btn-danger');
        autorollButton.classList.add('btn-success');
        // Разблокируем ручные кнопки, только если не идет анимация от последнего авторолла
        if (!isRolling) {
            rollButton.disabled = false;
            const playerData = Game.getPlayerData(); // Нужно получить playerData
            if (playerData && playerData.purchasedUpgrades.multiRollX5) { // Проверяем playerData
                multiRollButton.disabled = false;
            }
        }
        console.log("Autoroll STOPPED");
    }

    function performNextAutoroll() {
        if (!isAutorolling || isRolling) return;

        // Сразу останавливаем таймер. Новый будет установлен в onRollsCompleted.
        clearInterval(autorollTimer);
        autorollTimer = null;

        const playerData = Game.getPlayerData();
        
        // Выбираем, какой ролл делать, на основе апгрейда
        if (playerData.purchasedUpgrades.multiRollX5) {
            handleMultiRollButtonClick(true);
        } else {
            handleRollButtonClick(true);
        }
    }

    // Создаем обертки для ручных вызовов
    function handleManualRoll() {
        handleRollButtonClick(false); // false = не вызвано автороллом
    }

    function handleManualMultiRoll() {
        handleMultiRollButtonClick(false); // false = не вызвано автороллом
    }

    // --- Обновление общих элементов UI ---
    function updateAll(playerData) {
        if (!playerData) return;
        if (playerIdDisplay) playerIdDisplay.value = playerData.playerId;
        updateCurrencyDisplay(playerData.currency);
        updateLuckDisplay();
        updateActiveBoostsDisplay();
        
        renderInventory(playerData); // Обновляем инвентарь (включая счетчик)
        renderShop(); // Обновляем магазин (состояние кнопок)
        // renderSettings() удален
        renderRebirthSection();
        updateEquippedItemsDisplay(playerData.equippedItems);
        toggleMultiRollButton(playerData.purchasedUpgrades.multiRollX5);
        if (playerData && typeof playerData.luckyRollCounter !== 'undefined') {
            // Получаем актуальный порог. По умолчанию 11.
            const currentThreshold = playerData.luckyRollThreshold || 11;
            updateLuckyRollDisplay(playerData.luckyRollCounter, currentThreshold);
        }
        if (playerData && playerData.stats) { // Проверяем наличие stats
            renderStats(playerData);
        }
    }

    function updateCurrencyDisplay(currency) {
        if (currencyDisplay) currencyDisplay.textContent = currency;
    }

    function updateLuckDisplay() {
        if (luckDisplay) luckDisplay.textContent = Game.calculateCurrentLuck().toFixed(2);
    }

    // js/ui.js
    function updateLuckyRollDisplay(current, threshold) {
        if (!luckyRollDisplay) return;
        if (threshold > 0 && current < threshold) {
            luckyRollDisplay.textContent = `${L.get('ui.luckyRollCounter')}: ${threshold - current}`;
            luckyRollDisplay.style.opacity = '1';
        } else if (threshold > 0 && current >= threshold) {
            luckyRollDisplay.textContent = L.get('ui.luckyRollNext');
            luckyRollDisplay.style.opacity = '1';
        } else {
            luckyRollDisplay.textContent = '';
            luckyRollDisplay.style.opacity = '0';
        }
    }

    // Универсальная функция для отображения уведомлений
    function showNotification(message, type = 'info', duration = 4000) {
        let container = document.getElementById('notificationsContainer'); 
        if (!container) {
            container = document.createElement('div');
            container.id = 'notificationsContainer';
            Object.assign(container.style, { position: 'fixed', top: '20px', right: '20px', zIndex: '1060', width: 'auto', maxWidth: '350px' });
            document.body.appendChild(container);
        }
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show mb-2`;
        alertDiv.setAttribute('role', 'alert');
        alertDiv.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
        container.appendChild(alertDiv);
        setTimeout(() => bootstrap.Alert.getOrCreateInstance(alertDiv)?.close(), duration);
    }

    function updateActiveBoostsDisplay() {
        if (!activeBoostsDisplay) return;

        const playerData = Game.getPlayerData();
        const activeBoosts = playerData.activeBoosts;

        if (activeBoosts.length > 0) {
            const boostsHTML = activeBoosts.map(boost => {
                const timeLeft = Math.max(0, Math.round((boost.endTime - Date.now()) / 1000));
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                // Добавляем '0' перед секундами, если их меньше 10
                const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds;
                return `<span class="badge bg-success me-1">${boost.name}: ${minutes}:${paddedSeconds}</span>`;
            }).join('');
            activeBoostsDisplay.innerHTML = `${L.get('ui.activeBoosts')}: ${boostsHTML}`;

            // Если есть бусты, а таймер еще не запущен - ЗАПУСКАЕМ ЕГО.
            if (!boostTimerInterval) {
                console.log("Starting boost timer interval.");
                boostTimerInterval = setInterval(updateActiveBoostsDisplay, 1000);
            }
        } else {
            // Если бустов нет, очищаем дисплей и таймер.
            activeBoostsDisplay.innerHTML = '';
            if (boostTimerInterval) {
                console.log("Stopping boost timer interval.");
                clearInterval(boostTimerInterval);
                boostTimerInterval = null;
            }
        }
    }

    //rebirh
    function renderRebirthSection() {
        const rebirthSection = document.getElementById('rebirth');
        if (!rebirthSection) return;

        const playerData = Game.getPlayerData();
        const nextCost = Game.getRebirthCost();
        const canAfford = playerData.currency >= nextCost;
        // Используем тот же самый, единственно верный метод подсчета
        const uniqueCardsCount = new Set(playerData.inventory.filter(id => id !== 'garbage')).size;
        const potentialBonus = (uniqueCardsCount * PRESTIGE_LUCK_PER_CARD).toFixed(3);

        rebirthSection.innerHTML = `
            <div class="text-center p-md-5">
                <h2 class="mb-3">${L.get('ui.rebirth.title')}</h2>
                <p class="lead text-muted mb-4">${L.get('ui.rebirth.description')}</p>
                
                <p class="text-info-emphasis">${L.get('ui.rebirth.unlock_alt_hint')}</p> 
            
                <div class="card bg-dark-subtle p-4 mx-auto" style="max-width: 600px;">
                    <div class="card-body">
                        <p class="fs-5">${L.get('ui.rebirth.current_cards').replace('{count}', uniqueCardsCount)}</p>
                        <p class="fs-5">${L.get('ui.rebirth.potential_bonus').replace('{bonus}', `<strong class="text-success">+${potentialBonus}</strong>`)}</p>
                        <hr>
                        <p class="text-warning-emphasis">${L.get('ui.rebirth.warning')}</p>
                        <button id="rebirthButton" class="btn btn-lg btn-danger w-100 mt-3" ${!canAfford ? 'disabled' : ''}>
                            <span>${L.get('ui.rebirth.button')}</span>
                            <span class="d-block small">${nextCost.toLocaleString()} 💎</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('rebirthButton')?.addEventListener('click', Game.performRebirth);
    }
    
    // --- Анимация Ролла (быстрая смена на одном месте) ---
    function startRollAnimation(slotElement, targetRarity, onCompleteCallback) {
        let animationTimeouts = [];
        const playerData = Game.getPlayerData(); // Получаем данные игрока для проверки Fast Roll
        const isFastRollActive = playerData.purchasedUpgrades.fastRoll;

        const clearMyTimeouts = () => {
            animationTimeouts.forEach(clearTimeout);
            animationTimeouts = [];
            slotElement.dataset.animationActive = 'false';
        };

        if (slotElement.dataset.animationActive === 'true' && slotElement.clearPreviousAnimation) {
            slotElement.clearPreviousAnimation();
        }
        slotElement.clearPreviousAnimation = clearMyTimeouts;
        slotElement.dataset.animationActive = 'true';

        // Настройки длительности анимации в зависимости от Fast Roll
        let baseTickDuration = isFastRollActive ? 15 : 30;    // ms
        let minTickDuration = isFastRollActive ? 100 : 250;   // ms, самая медленная скорость перед остановкой
        let accelerationTicks = isFastRollActive ? 8 : 20;  // Количество быстрых тиков
        let decelerationTicks = isFastRollActive ? 6 : 15;  // Количество тиков замедления

        let currentTick = 0;
        let currentTickDuration = baseTickDuration;

        function animateTick() {
            RARITIES_DATA.forEach(r => slotElement.classList.remove(r.cssClass));
            slotElement.classList.remove('landed');
            let rarityToShow;

            if (currentTick < accelerationTicks) {
                rarityToShow = getRandomRarity();
                currentTickDuration = baseTickDuration + (currentTick * (isFastRollActive ? 0.5 : 1));
            } else if (currentTick < accelerationTicks + decelerationTicks) {
                const decelerationProgress = (currentTick - accelerationTicks) / decelerationTicks;
                if (Math.random() < 0.3 + decelerationProgress * 0.6) {
                    rarityToShow = targetRarity;
                } else {
                    rarityToShow = getRandomRarityNear(targetRarity);
                }
                currentTickDuration = baseTickDuration + (minTickDuration - baseTickDuration) * decelerationProgress;
            } else {
                rarityToShow = targetRarity;
                if (rarityToShow.id === 'error') {
                    slotElement.dataset.text = rarityToShow.name;
                } else {
                    delete slotElement.dataset.text;
                }
                slotElement.textContent = rarityToShow.name;
                slotElement.classList.add(rarityToShow.cssClass);
                slotElement.classList.add('landed');
                console.log(`--- Roll Animation End (Flash) --- (Landed: ${targetRarity.name})`);
                slotElement.dataset.animationActive = 'false';
                slotElement.clearPreviousAnimation = null;
                if (onCompleteCallback) onCompleteCallback();
                return;
            }

            
            if (rarityToShow.id === 'error') {
                slotElement.dataset.text = rarityToShow.name;
            } else {
                delete slotElement.dataset.text; // Удаляем, если это не ERROR, чтобы псевдоэлементы не показывали старый текст
            }
            slotElement.textContent = rarityToShow.name;
            slotElement.classList.add(rarityToShow.cssClass);
            currentTick++;
            const timeoutId = setTimeout(animateTick, currentTickDuration);
            animationTimeouts.push(timeoutId);
        }
        console.log(`--- Roll Animation Start (Flash) --- (Target: ${targetRarity.name}, FastRoll: ${isFastRollActive})`);
        animateTick();
        return clearMyTimeouts;
    }
    
    function getRandomRarityFull() { const randIndex = Math.floor(Math.random() * RARITIES_DATA.length); return RARITIES_DATA[randIndex]; }
    function getRandomRarityNearFull(targetRarity) { const targetIdx = RARITIES_DATA.findIndex(r => r.id === targetRarity.id); if (targetIdx === -1) return getRandomRarityFull(); const numRarities = RARITIES_DATA.length; let offset; do { offset = Math.floor(Math.random() * 5) - 2; } while (offset === 0 && Math.random() < 0.7); let newIndex = (targetIdx + offset + numRarities) % numRarities; return RARITIES_DATA[newIndex]; }
    function getRandomRarity() { const r = getRandomRarityFull(); return { id: r.id, name: L.get(r.nameKey), cssClass: r.cssClass }; }
    function getRandomRarityNear(targetRarity) { const r = getRandomRarityNearFull(targetRarity); return { id: r.id, name: L.get(r.nameKey), cssClass: r.cssClass }; }

    function setButtonsDisabled(disabled, isCalledByAutoroll) {
        rollButton.disabled = disabled;
        multiRollButton.disabled = disabled;
        if (!isCalledByAutoroll && !isAutorolling) {
            autorollButton.disabled = disabled;
        }
    }

    function onRollsCompleted(results, isCalledByAutoroll) {
        isRolling = false;
        lastRollTimestamp = Date.now(); 
        if (!isAutorolling) {
            setButtonsDisabled(false, false);
            const playerData = Game.getPlayerData();
            if (playerData) {
                multiRollButton.disabled = !playerData.purchasedUpgrades.multiRollX5;
            }
        }

        if (results.length > 1) {
            displayMultiRollSummary(results);
        }
        
        // ИСПРАВЛЕНИЕ: Используем правильное имя переменной - 'results'
        results.forEach(result => {
            if (result.isNew) {
                showNewCard(result);
            }
        });

        updateAll(Game.getPlayerData());

       if (isAutorolling && isTabActive) {
            // Очищаем предыдущий на всякий случай
            clearTimeout(autorollTimer);
            // Запускаем следующий ролл после короткой "передышки"
            autorollTimer = setTimeout(performNextAutoroll, AUTOROLL_BREATHING_ROOM);
        }
    }
    // --- Обработчики кнопок Ролла ---
    function handleRollButtonClick(isCalledByAutoroll = false) {
        if (isRolling) return;
        isRolling = true;
        setButtonsDisabled(true, isCalledByAutoroll);
        
        rollResultContainer.innerHTML = '';
        activeSingleRollClearCallback?.();
        
        rollAnimationContainer.querySelector('.single-roll-slot-wrapper').classList.remove('d-none');
        multiRollSlotsContainer.classList.add('d-none');

        const rollResult = Game.performRoll(); 
        activeSingleRollClearCallback = startRollAnimation(rollSlot, rollResult.rarity, () => {
            activeSingleRollClearCallback = null; 
            displayRollResult(rollResult);
            onRollsCompleted([rollResult], isCalledByAutoroll);
        });
    }

    // Замените вашу существующую handleMultiRollButtonClick на эту:
     function handleMultiRollButtonClick(isCalledByAutoroll = false) {
        if (isRolling) return;
        isRolling = true;
        setButtonsDisabled(true, isCalledByAutoroll);

        rollResultContainer.innerHTML = '';
        activeMultiRollClearCallbacks.forEach(cb => cb());
        activeMultiRollClearCallbacks = [];

        multiRollSlotsContainer.classList.remove('d-none');
        multiRollSlotsContainer.innerHTML = '';
        rollAnimationContainer.querySelector('.single-roll-slot-wrapper').classList.add('d-none');
        
        const numRolls = 5;
        let completedAnimations = 0;
        const allRollResults = [];

        for (let i = 0; i < numRolls; i++) {
            const slotWrapper = document.createElement('div');
            slotWrapper.className = 'multi-roll-slot-wrapper';
            const slot = document.createElement('div');
            slot.className = 'roll-slot';
            slotWrapper.appendChild(slot);
            multiRollSlotsContainer.appendChild(slotWrapper);

            const rollResult = Game.performRoll();
            allRollResults.push(rollResult);

            const clearCb = startRollAnimation(slot, rollResult.rarity, () => {
                completedAnimations++;
                if (completedAnimations === numRolls) {
                    onRollsCompleted(allRollResults, isCalledByAutoroll);
                }
            });
            activeMultiRollClearCallbacks.push(clearCb);
        }
    }

    function handleAllMultiRollsCompleted(allRollResults) {
        const playerData = Game.getPlayerData();
        isRolling = false;
        rollButton.disabled = false;
        if (playerData.purchasedUpgrades.multiRollX5) multiRollButton.disabled = false;
        updateCurrencyDisplay(playerData.currency);
        renderInventory(playerData.inventory);
        activeMultiRollClearCallbacks = [];

        let totalCurrencyFromMultiRoll = 0;
        allRollResults.forEach(res => totalCurrencyFromMultiRoll += res.duplicateReward);
        if (totalCurrencyFromMultiRoll > 0) {
            const summaryText = document.createElement('p');
            summaryText.className = 'text-center mt-3';
            summaryText.innerHTML = `${L.get('ui.totalDuplicateReward')}: <span class="currency-icon">💎</span>${totalCurrencyFromMultiRoll}`;
            rollResultContainer.appendChild(summaryText);
        }
        const multiResultsDisplay = document.createElement('div');
        multiResultsDisplay.className = 'd-flex flex-wrap justify-content-center gap-2 mt-3';
        allRollResults.forEach(result => {
            const cardMini = document.createElement('div');
            cardMini.style.textAlign = 'center';
            const img = document.createElement('img');
            img.src = result.card.image;
            img.alt = result.card.name;
            img.style.width = '60px'; img.style.height = 'auto'; img.style.aspectRatio = '1024 / 1360';
            img.style.border = `2px solid ${result.rarity.color}`; img.style.borderRadius = '4px';
            cardMini.appendChild(img);
            const nameP = document.createElement('p'); nameP.textContent = result.card.name; nameP.className = 'small mb-0'; cardMini.appendChild(nameP);
            if (result.duplicateReward > 0) { const rewardP = document.createElement('p'); rewardP.innerHTML = `+💎${result.duplicateReward}`; rewardP.className = 'small text-warning'; cardMini.appendChild(rewardP); }
            multiResultsDisplay.appendChild(cardMini);
        });
        rollResultContainer.appendChild(multiResultsDisplay);
    }
    
    // displayQuickRollResult и displayCardInMultiSlot больше не нужны в том виде, если анимация всегда играется
    // Но displayQuickRollResult может быть полезна, если мы решим вернуть какой-то супер-мгновенный режим.
    // Пока оставим displayRollResult для отображения выезжающей карточки.
    function displayRollResult(rollResult) {
        rollResultContainer.innerHTML = '';
        const cardWrapper = document.createElement('div');
        cardWrapper.className = 'received-card-animation-wrapper';
        const cardElement = document.createElement('div');
        cardElement.className = 'received-card';
        cardElement.style.backgroundImage = `url('${rollResult.card.image}')`;
        cardElement.style.borderColor = rollResult.rarity.color;
        cardElement.style.setProperty('--rarity-glow-color', rollResult.rarity.glowColor);
        cardElement.setAttribute('title', `${L.get('ui.rarity')}: ${rollResult.rarity.name}`);
        const nameElement = document.createElement('h3');
        nameElement.className = 'received-card-name';
        
        // ИСПРАВЛЕНИЕ 1: Используем rollResult.card.name, который уже переведен в game.js
        nameElement.textContent = `${L.get('ui.youGot')}: ${rollResult.card.name}!`; 
        
        if (rollResult.isNew) nameElement.innerHTML += ` <span class="badge bg-warning">${L.get('ui.isNew')}</span>`;
        cardWrapper.appendChild(cardElement);
        rollResultContainer.appendChild(cardWrapper);
        rollResultContainer.appendChild(nameElement);
        if (rollResult.duplicateReward > 0) {
            const rewardText = document.createElement('p');
            rewardText.className = 'duplicate-reward-text';
            rewardText.innerHTML = `${L.get('ui.duplicateReward')}: <span class="currency-icon">💎</span>${rollResult.duplicateReward}`;
            rollResultContainer.appendChild(rewardText);
        }
    }
    
    function displayMultiRollSummary(allRollResults) {
        let totalCurrency = allRollResults.reduce((sum, res) => sum + res.duplicateReward, 0);
        if (totalCurrency > 0) {
            const summaryText = document.createElement('p');
            summaryText.className = 'text-center mt-3';
            summaryText.innerHTML = `${L.get('ui.totalDuplicateReward')}: <span class="currency-icon">💎</span>${totalCurrency}`;
            rollResultContainer.appendChild(summaryText);
        }

        const multiResultsDisplay = document.createElement('div');
        multiResultsDisplay.className = 'd-flex flex-wrap justify-content-center gap-2 mt-3';
        allRollResults.forEach(result => {
            const cardMini = document.createElement('div');
            cardMini.style.textAlign = 'center';
            const img = document.createElement('img');
            Object.assign(img, { src: result.card.image, alt: result.card.name });
            Object.assign(img.style, { width: '60px', aspectRatio: '1024 / 1360', border: `2px solid ${result.rarity.color}`, borderRadius: '4px' });
            cardMini.appendChild(img);
            const nameP = document.createElement('p');
            nameP.textContent = result.card.name;
            nameP.className = 'small mb-0';
            cardMini.appendChild(nameP);
            if (result.duplicateReward > 0) {
                const rewardP = document.createElement('p');
                rewardP.innerHTML = `+💎${result.duplicateReward}`;
                rewardP.className = 'small text-warning';
                cardMini.appendChild(rewardP);
            }
            multiResultsDisplay.appendChild(cardMini);
        });
        rollResultContainer.appendChild(multiResultsDisplay);
    }
    
    // --- Инвентарь с силуэтами и счетчиком ---
    function renderInventory(playerData) {
        if (!inventoryGrid || !inventoryCounterElement) return;

        const sortOrder = localStorage.getItem('inventorySortOrder') || 'rarity_desc';
        if (inventorySortSelect) inventorySortSelect.value = sortOrder;

        inventoryGrid.innerHTML = '';

        // --- НАЧАЛО ИЗМЕНЕНИЯ ---
        // 1. Фильтруем ВЕСЬ список карт, оставляя только те, что доступны игроку
        const availableRarities = RARITIES_DATA.filter(r => 
            (r.minPrestige || 0) <= playerData.prestigeLevel
        );
        const availableRaritiesIds = new Set(availableRarities.map(r => r.id)); // Создаем Set для быстрой проверки
        // --- КОНЕЦ ИЗМЕНЕНИЯ ---

        let sortedRarities = [...availableRarities];

        // Логика сортировки теперь применяется к отфильтрованному списку
        switch (sortOrder) {
            case 'rarity_asc':
                sortedRarities.reverse(); // Примечание: reverse() мутирует массив, но т.к. мы создали копию, это безопасно
                break;
            case 'name_asc':
                sortedRarities.sort((a, b) => 
                    L.get(a.card.nameKey).localeCompare(L.get(b.card.nameKey), L.getCurrentLanguage())
                );
                break;
            case 'rarity_desc':
            default:
                // Сортировка по probabilityBase УЖЕ выполнена в RARITIES_DATA, так что ничего не делаем
                break;
        }

        const parentCards = sortedRarities.filter(r => !r.displayParentId);

        parentCards.forEach(rarityData => {
            const allCardVersions = [rarityData, ...availableRarities.filter(r => r.displayParentId === rarityData.id)];
            const openedVersions = allCardVersions.filter(v => playerData.inventory.includes(v.id));
            const isAnyVersionOpened = openedVersions.length > 0;

            const col = document.createElement('div');
            col.className = 'col';
            const cardDiv = document.createElement('div');
            cardDiv.className = 'inventory-card';
            cardDiv.dataset.rarityId = rarityData.id;
            const img = document.createElement('img');
            img.className = 'inventory-card-image';
            const nameDiv = document.createElement('div');
            nameDiv.className = 'inventory-card-name';

            if (isAnyVersionOpened) {
                // Находим активный скин из сохранения или берем родительский по умолчанию
            const activeSkinId = playerData.activeSkins[rarityData.id] || rarityData.id;
            const activeSkinData = getRarityDataById(activeSkinId) || rarityData;
            
            img.src = activeSkinData.card.image;
            nameDiv.textContent = L.get(activeSkinData.card.nameKey);
            cardDiv.classList.add(`border-${activeSkinData.cssClass || activeSkinData.id}`);
            cardDiv.style.setProperty('--rarity-glow-color', activeSkinData.glowColor);
            
            const allPossibleVersions = [rarityData, ...RARITIES_DATA.filter(r => r.displayParentId === rarityData.id)];
            cardDiv.addEventListener('click', () => showCardModal(rarityData.id, allPossibleVersions));
            } else {
                cardDiv.classList.add('locked');
                img.src = "img/silhouette_placeholder.png";
                nameDiv.textContent = "?????";
            }
            
            cardDiv.appendChild(img);
            cardDiv.appendChild(nameDiv);
            col.appendChild(cardDiv);
            inventoryGrid.appendChild(col);
        });

        const uniqueOpenedCount = new Set(playerData.inventory.filter(id => id !== 'garbage' && availableRaritiesIds.has(id))).size;
        const totalPossibleCount = availableRarities.filter(r => r.id !== 'garbage').length;
        
        inventoryCounterElement.textContent = `${L.get('ui.opened')}: ${uniqueOpenedCount} / ${totalPossibleCount}`;
}

    function showCardModal(parentId, allVersions) {
        const versionSwitcher = document.getElementById('versionSwitcher');
        const visualEffectControls = document.getElementById('visualEffectControls');
        const mechanicalEffectControls = document.getElementById('mechanicalEffectControls'); 

        const playerData = Game.getPlayerData();
        const activeSkinId = playerData.activeSkins[parentId] || parentId;

        versionSwitcher.innerHTML = '';
        visualEffectControls.innerHTML = '';
        mechanicalEffectControls.innerHTML = '';
        
        const showVersionDetails = (versionData) => {
            // --- НАЧАЛО ВОССТАНОВЛЕННОГО БЛОКА ---
            modalCardImage.src = versionData.card.image;
            modalCardName.textContent = L.get(versionData.card.nameKey);
            modalCardRarity.textContent = `${L.get('ui.rarity')}: ${L.get(versionData.nameKey)}`;
            modalCardDescription.textContent = L.get(versionData.card.descriptionKey);
            modalCardRarity.style.color = versionData.color;

            if (versionData.probabilityBase >= 1) {
                modalCardChance.textContent = L.get('ui.guaranteed');
            } else {
                modalCardChance.textContent = `${L.get('ui.baseChance')}: 1/${Math.round(1 / versionData.probabilityBase)}`;
            }
            // --- КОНЕЦ ВОССТАНОВЛЕННОГО БЛОКА ---
            
            // --- Блок визуальных эффектов (остается без изменений) ---
            visualEffectControls.innerHTML = '';
            const cardHasEffect = VisualEffects.effects.hasOwnProperty(versionData.id);
            if (cardHasEffect) {
                const toggleBtn = document.createElement('button');
                toggleBtn.classList.add('btn', 'btn-sm');
                const isActive = playerData.activeVisualEffectRarityId === versionData.id;
                toggleBtn.textContent = L.get(isActive ? 'ui.deactivateEffect' : 'ui.activateEffect');
                toggleBtn.classList.add(isActive ? 'btn-danger' : 'btn-success');
                
                toggleBtn.addEventListener('click', () => {
                    if (isActive) {
                        Game.clearActiveVisualEffect();
                    } else {
                        Game.setActiveVisualEffect(versionData.id);
                    }
                    cardModal.hide();
                    setTimeout(() => showCardModal(parentId, allVersions), 300);
                });
                visualEffectControls.appendChild(toggleBtn);
            } else {
                visualEffectControls.innerHTML = `<p class="text-muted small">${L.get('ui.noVisualEffect')}</p>`;
            }

            // --- Блок механических эффектов (остается без изменений) ---
            mechanicalEffectControls.innerHTML = '';
            const mechEffectData = versionData.mechanicalEffect;
            let descriptionText = '';
            if (mechEffectData) {
                // Ключ формируется из типа эффекта
                descriptionText = L.get(`mechanical_effects.${mechEffectData.type}`);
            } else {
                descriptionText = L.get('mechanical_effects.no_effect');
            }

            let equippedIndicator = '';
            if (playerData.activeMechanicalEffect === versionData.id) {
                equippedIndicator = ` <span class="text-success">${L.get('mechanical_effects.equipped_label')}</span>`;
            }

            mechanicalEffectControls.innerHTML = `
                <hr>
                <h5>${L.get('mechanical_effects.description_title')}${equippedIndicator}</h5>
                <p class="text-muted small">${descriptionText}</p>
            `;

            if (mechEffectData) {
                const equipBtn = document.createElement('button');
                equipBtn.classList.add('btn', 'btn-sm');
                const isActive = playerData.activeMechanicalEffect === versionData.id;
                equipBtn.textContent = L.get(isActive ? 'mechanical_effects.unequip_button' : 'mechanical_effects.equip_button');
                equipBtn.classList.add(isActive ? 'btn-danger' : 'btn-primary');

                equipBtn.addEventListener('click', () => {
                    Game.setActiveMechanicalEffect(isActive ? null : versionData.id);
                    cardModal.hide();
                    setTimeout(() => showCardModal(parentId, allVersions), 300);
                });
                mechanicalEffectControls.appendChild(equipBtn);
            }
        };
        
        // --- Блок переключателя версий (остается без изменений) ---
        if (allVersions.length > 1) {
            const group = document.createElement('div');
            group.className = 'd-flex justify-content-center align-items-center flex-wrap gap-2';

            allVersions.forEach(version => {
                const isUnlocked = playerData.inventory.includes(version.id);
                if (!isUnlocked) return;

                const wrapper = document.createElement('div');
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'btn btn-sm';
                // Используем имя карты для кнопки
                button.textContent = L.get(version.card.nameKey);

                if (version.id === activeSkinId) {
                    button.classList.add('btn-light', 'active');
                    button.disabled = true;
                } else {
                    button.classList.add('btn-outline-light');
                    button.addEventListener('click', () => {
                        Game.setActiveSkin(parentId, version.id);
                        cardModal.hide();
                        setTimeout(() => showCardModal(parentId, allVersions), 300);
                    });
                }
                
                wrapper.appendChild(button);
                group.appendChild(wrapper);
            });
            versionSwitcher.appendChild(group);
        }
        
        const initialVersionToShow = getRarityDataById(activeSkinId) || allVersions[0];
        showVersionDetails(initialVersionToShow);
        cardModal.show();
    }
        function applyVisualEffect(rarityId, isInitialLoad = false) {
        const targets = { body: document.body, glitchOverlay: document.getElementById('globalGlitchOverlay'), audioPlayer: backgroundMusicElement };
        VisualEffects.apply(rarityId, targets, isInitialLoad);
    }

    
    
    // --- Магазин ---
    function renderShop() {
        if (!boostShop || !equipmentShop || !upgradesShop) return;
        const playerData = Game.getPlayerData();
        
        // Функция для рендера бустов, экипировки и улучшений (остается без изменений)
        const renderSection = (container, data, type) => {
            container.innerHTML = data.map(item => {
                const isPurchased = (type === 'equipment' && playerData.inventory.includes("purchased_" + item.id)) || (type === 'upgrade' && playerData.purchasedUpgrades[item.targetProperty]);
                const isEquipped = type === 'equipment' && playerData.equippedItems.find(e => e.id === item.id);
                const canAfford = playerData.currency >= item.cost;
                let buttonHtml;
                if (isEquipped) {
                    buttonHtml = `<button class="btn btn-sm btn-secondary" disabled>${L.get('ui.nowEquipped')}</button>`;
                } else if (isPurchased) {
                    const isDisabled = type === 'equipment' && playerData.equippedItems.length >= Game.getMaxEquippedItems();
                    buttonHtml = `<button class="btn btn-sm btn-outline-primary equip-btn" data-item-id="${item.id}" ${isDisabled ? `disabled title="${L.get('ui.maxEquipment')}"` : ''}>${L.get('ui.equip')}</button>`;
                } else {
                    buttonHtml = `<button class="btn btn-sm btn-success buy-${type}-btn" data-item-id="${item.id}" ${!canAfford ? 'disabled' : ''}>${L.get('ui.buy')} <span class="badge bg-warning text-dark">${item.cost} 💎</span></button>`;
                }
                return `
                <div class="list-group-item shop-item d-flex justify-content-between align-items-center ${isPurchased ? 'purchased' : ''} ${isEquipped ? 'equipped' : ''}">
                    <div><strong>${L.get(item.nameKey)}</strong><small class="d-block text-muted">${L.get(item.descriptionKey)}</small></div>
                    <div>${buttonHtml}</div>
                </div>`;
            }).join('');
        };
        
        renderSection(boostShop, SHOP_DATA.boosts, 'boost');
        renderSection(equipmentShop, SHOP_DATA.equipment, 'equipment');
        renderSection(upgradesShop, SHOP_DATA.upgrades, 'upgrade');

        // --- НАЧАЛО БЛОКА, КОТОРЫЙ МЫ ИСПРАВЛЯЕМ ---
        const luckCoreSection = document.getElementById('luckCoreSection');
        if (luckCoreSection) {
            const currentBonus = ((Game.getPlayerData().luckCoreLevel || 0) * 0.01).toFixed(2);
            const nextCost = Game.getLuckCoreAmplificationCost();
            const canAfford = Game.getPlayerData().currency >= nextCost;

            // ИСПРАВЛЕНИЕ: Теперь все тексты здесь ГАРАНТИРОВАННО берутся через L.get()
            luckCoreSection.innerHTML = `
                <hr>
                <h4>${L.get('shop.luck_core.title')}</h4>
                <div class="list-group">
                    <div class="list-group-item shop-item d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${L.get('shop.luck_core.current_bonus')}</strong>: <span class="text-success">+${currentBonus}</span>
                            <small class="d-block text-muted">${L.get('shop.luck_core.description')}</small>
                        </div>
                        <button id="amplifyLuckCoreBtn" class="btn btn-lg btn-warning" ${!canAfford ? 'disabled' : ''}>
                        <span>${L.get('shop.luck_core.amplify')}</span> (+0.01)
                        <br>
                        <span class="badge bg-dark">${nextCost.toLocaleString()} 💎</span>
                        </button>
                    </div>
                </div>
            `;
            
            document.getElementById('amplifyLuckCoreBtn')?.addEventListener('click', () => {
                Game.amplifyLuckCore();
            });
        }
        // --- КОНЕЦ ИСПРАВЛЕННОГО БЛОКА ---

        addShopEventListeners();
    }
    function addShopEventListeners() {
        document.querySelectorAll('.buy-boost-btn, .buy-equipment-btn, .buy-upgrade-btn, .equip-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                const itemId = e.currentTarget.dataset.itemId;
                if (btn.classList.contains('buy-boost-btn')) Game.purchaseShopItem(itemId, 'boost');
                else if (btn.classList.contains('buy-equipment-btn')) Game.purchaseShopItem(itemId, 'equipment');
                else if (btn.classList.contains('buy-upgrade-btn')) Game.purchaseShopItem(itemId, 'upgrade');
                else if (btn.classList.contains('equip-btn')) {
                    const itemData = SHOP_DATA.equipment.find(eq => eq.id === itemId);
                    if (itemData) Game.equipItem(itemData);
                }
                renderShop();
                updateEquippedItemsDisplay(Game.getPlayerData().equippedItems);
            });
        });
    }
    function updateEquippedItemsDisplay(equippedItems = []) {
        if (!equippedItemsDisplay) return;

        equippedItemsDisplay.innerHTML = equippedItems.length === 0 
            ? `<p class="text-muted small">${L.get('ui.noEquippedItems')}</p>`
            : equippedItems.map(item => {
                // ЗАЩИТА: Проверяем, есть ли у предмета nameKey.
                // Если нет (из-за старого сейва), пытаемся использовать name или ставим заглушку.
                const itemName = item.nameKey ? L.get(item.nameKey) : (item.name || 'Unknown Item'); 
                
                const shopItem = SHOP_DATA.equipment.find(shopItem => shopItem.id === item.id);
                let effectText = L.get('debug.effect.active');
                if (shopItem?.luckBonus) effectText = `+${shopItem.luckBonus.toFixed(2)} ${L.get('ui.luck').toLowerCase()}`;
                else if (shopItem?.effect?.type === 'duplicate_currency_bonus_percent') effectText = `+${shopItem.effect.value * 100}% 💎`;
                else if (shopItem?.effect?.type === 'cumulative_luck_on_low_rolls') effectText = `${L.get('debug.effect.cumulative')} (+${shopItem.effect.bonusPerStack}/${L.get('debug.effect.stack')})`;

                return `<div class="equipped-item-chip badge bg-info text-dark me-1 mb-1 p-2">
                    <span>${itemName} <small class="text-white-75">(${effectText})</small></span>
                    <button class="btn btn-xs btn-outline-light btn-remove-equip ms-2" data-item-id="${item.id}" title="${L.get('ui.unequipItem')}">×</button>
                </div>`;
            }).join('');

        equippedItemsDisplay.querySelectorAll('.btn-remove-equip').forEach(btn => {
            btn.addEventListener('click', () => {
                Game.unequipItem(btn.dataset.itemId);
                UI.updateAll(Game.getPlayerData());
            });
        });
    }
    function toggleMultiRollButton(isPurchased) {
        if (multiRollButton) multiRollButton.classList.toggle('d-none', !isPurchased);
    }

    // Замените старую getCycleTime на эту
    function getEstimatedCycleTime() {
        const playerData = Game.getPlayerData();
        const isFast = playerData.purchasedUpgrades.fastRoll;

        // Эти значения должны примерно соответствовать реальной длительности анимации
        const animationTime = isFast ? 750 : 1500; 

        // Полное время цикла = время анимации + "передышка"
        return animationTime + AUTOROLL_BREATHING_ROOM;
    }

    // Показывает красивое уведомление с итогами
    function showAfkSummaryNotification(rolls, currency, newCards) {
        let messageKey;
        
        if (currency > 0 && newCards > 0) {
            messageKey = 'notifications.afkSummary';
        } else if (currency > 0 && newCards === 0) {
            messageKey = 'notifications.afkSummaryNoNewCards';
        } else if (currency === 0 && newCards > 0) {
            messageKey = 'notifications.afkSummaryNoCurrency';
        } else {
            messageKey = 'notifications.afkSummaryRollsOnly';
        }

        const message = L.get(messageKey)
            .replace('{rolls}', rolls)
            .replace('{currency}', currency)
            .replace('{newCards}', newCards);

        showNotification(message, 'info', 8000);
    }

    // Вычисляет и выполняет пропущенный прогресс
    // Замените существующую функцию handleAfkProgress
    function handleAfkProgress() {
        if (!lastRollTimestamp || lastRollTimestamp === 0) {
            performNextAutoroll(); // Если нечего догонять, просто делаем следующий ролл
            return;
        }

        const timeElapsed = Date.now() - lastRollTimestamp;
        const timePerCycle = getEstimatedCycleTime();
        const cyclesToPerform = Math.floor(timeElapsed / timePerCycle);

        if (cyclesToPerform <= 0) {
            performNextAutoroll();
            return;
        }
        
        // Вместо цикла, мы запускаем обработчик порций
        processAfkInChunks(cyclesToPerform);
    }

    function processAfkInChunks(totalCycles) {
        console.log(`Starting AFK catch-up for ${totalCycles} cycles in chunks.`);
        isRolling = true; // Блокируем новые роллы на время "догона"

        let cyclesProcessed = 0;
        let totalCurrencyGained = 0;
        let newCardsCount = 0;
        const rollsPerCycle = Game.getPlayerData().purchasedUpgrades.multiRollX5 ? 5 : 1;
        const chunkSize = 50; // Обрабатываем по 50 циклов за один раз (можно настроить)

        function processChunk() {
            const cyclesInThisChunk = Math.min(chunkSize, totalCycles - cyclesProcessed);

            for (let i = 0; i < cyclesInThisChunk; i++) {
                for (let j = 0; j < rollsPerCycle; j++) {
                    const result = Game.performRoll();
                    if (result.duplicateReward > 0) {
                        totalCurrencyGained += result.duplicateReward;
                    }
                    if (result.isNew) {
                        newCardsCount++;
                        newCardQueue.push(result);
                    }
                }
            }

            cyclesProcessed += cyclesInThisChunk;

            // Обновляем прогресс, если еще не все готово
            if (cyclesProcessed < totalCycles) {
                // Запрашиваем у браузера обработку следующей порции, когда он будет готов
                requestAnimationFrame(processChunk);
            } else {
                // --- ВСЕ ГОТОВО ---
                console.log("AFK catch-up finished.");
                isRolling = false;
                
                // Финальное обновление UI и уведомление
                updateAll(Game.getPlayerData());
                showAfkSummaryNotification(totalCycles * rollsPerCycle, totalCurrencyGained, newCardsCount);
                
                // Запускаем следующий обычный ролл, который перезапустит таймер
                performNextAutoroll();
            }
        }
        
        // Запускаем обработку первой порции
        requestAnimationFrame(processChunk);
    }
    // --- Публичный интерфейс ---
    return { init, updateAll, renderShop, showNotification, updateEquippedItemsDisplay, updateLuckyRollDisplay, applyVisualEffect, toggleMultiRollButton };
})();
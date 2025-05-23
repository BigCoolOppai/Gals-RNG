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

    // Состояние UI
    let isRolling = false;
    let isAutorolling = false; 
    let autorollTimer = null;   
    let activeSingleRollClearCallback = null;
    let activeMultiRollClearCallbacks = [];

    let currentEffectCleanup = null; 


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

        document.getElementById('resetProgressButton')?.addEventListener('click', Game.resetGame);
    }

    // --- Инициализация UI ---
    function init() {
        cacheDOMElements();
        setupEventListeners();
        renderShop(); // Должен быть до updateAll, чтобы playerData был свежим
        updateAll(Game.getPlayerData()); // Загружаем все данные
        Game.checkActiveBoosts(); // Проверяем бусты
        const playerData = Game.getPlayerData();
        if (playerData && typeof playerData.luckyRollCounter !== 'undefined') {
            updateLuckyRollDisplay(playerData.luckyRollCounter, playerData.luckyRollThreshold);
        }
        // Установка громкости
        if (musicVolumeSlider && backgroundMusicElement) {
            musicVolumeSlider.value = playerData.musicVolume;
            backgroundMusicElement.volume = playerData.musicVolume;
            if (musicVolumeLabel) musicVolumeLabel.textContent = `${Math.round(playerData.musicVolume * 100)}%`;
        }
        const initialEffectId = Game.getPlayerData().activeVisualEffectRarityId;
        applyVisualEffect(initialEffectId, true); // Применяем сохраненный эффект через новый модуль
        // Если src не был установлен эффектом (или эффекта нет), устанавливаем дефолтный
        if (backgroundMusicElement) {
            // Старая неверная строка:
            // const effectDefinition = initialEffectId ? VisualEffects.effects[initialEffectId] : null;
            // const currentEffectMusic = effectDefinition && effectDefinition.music;

            // ИСПРАВЛЕННАЯ ЛОГИКА ПОЛУЧЕНИЯ МУЗЫКИ ДЛЯ ЭФФЕКТА:
            const musicForInitialEffect = initialEffectId ? VisualEffects.effectMusicMap[initialEffectId] : null;
            const targetInitialTrack = musicForInitialEffect || VisualEffects.defaultMusicTrack;

            // Устанавливаем src + load, если он еще не установлен или отличается.
            // VisualEffects.apply с isInitialLoad=true также пытается это сделать.
            // Этот блок здесь - подстраховка или если apply не вызывается до этого момента с нужными параметрами.
            if (!backgroundMusicElement.currentSrc || !backgroundMusicElement.currentSrc.endsWith(targetInitialTrack)) {
                backgroundMusicElement.src = targetInitialTrack;
                backgroundMusicElement.load(); // Важно вызвать load
                console.log("UI.init: Initial music source explicitly set to:", targetInitialTrack);
            }
            
            // Вызов UI.applyVisualEffect должен быть после того, как `backgroundMusicElement`
            // потенциально получил свой `src` из блока выше, или он должен сам это делать.
            // Сейчас VisualEffects.apply(..., isInitialLoad=true) сам устанавливает src.
            // Так что вызов applyVisualEffect(initialEffectId, true) ДО этого блока или ПОСЛЕ него
            // должен привести к одному результату, если они оба проверяют currentSrc.
            // Логичнее, чтобы applyVisualEffect отвечал за это.
            // Вызываем applyVisualEffect здесь, чтобы он применил визуальную часть и музыку
            // с учетом isInitialLoad=true
            UI.applyVisualEffect(initialEffectId, true);


            const playerData = Game.getPlayerData(); // Получаем снова, если нужно
            if (playerData.musicVolume > 0) {
                // Попытка воспроизведения после взаимодействия с пользователем (например, слайдер громкости)
                // или если браузер разрешает автоплей.
                // Этот play() здесь может быть проблематичным без явного пользовательского действия.
                // Лучше, чтобы музыка начинала играть после первого изменения громкости > 0,
                // что у вас уже есть в handleVolumeChange.
                // backgroundMusicElement.play().catch(e => {
                //     console.warn("UI.init: Initial music play failed (autoplay policy?):", e);
                // });
                // Вместо этого, просто убедимся, что состояние кнопки/UI отражает состояние плеера.
                // Если у вас будет кнопка play/pause, ее нужно будет обновить.
            }
        }
    }

    function setupEventListeners() {
        rollButton.addEventListener('click', handleManualRoll);
        multiRollButton.addEventListener('click', handleManualMultiRoll);
        autorollButton.addEventListener('click', toggleAutoroll);
        musicVolumeSlider.addEventListener('input', handleVolumeChange);
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
        if (isAutorolling) {
            stopAutoroll();
        } else {
            startAutoroll();
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
        if (!isAutorolling || isRolling) { // Не запускаем новый, если авторолл выключен или уже идет ролл
            return;
        }

        const playerData = Game.getPlayerData(); // Получаем playerData

        // Роллы бесплатные, так что проверка на валюту не нужна
        if (playerData && playerData.purchasedUpgrades.multiRollX5) { // Проверяем playerData
            console.log("Autoroll: Performing Multi-Roll");
            handleMultiRollButtonClick(true); // true = вызвано автороллом
        } else {
            console.log("Autoroll: Performing Single Roll");
            handleRollButtonClick(true); // true = вызвано автороллом
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
        updateCurrencyDisplay(playerData.currency);
        updateLuckDisplay();
        updateActiveBoostsDisplay();
        renderInventory(playerData.inventory); // Обновляем инвентарь (включая счетчик)
        renderShop(); // Обновляем магазин (состояние кнопок)
        // renderSettings() удален
        updateEquippedItemsDisplay(playerData.equippedItems);
        toggleMultiRollButton(playerData.purchasedUpgrades.multiRollX5);
        if (playerData && typeof playerData.luckyRollCounter !== 'undefined') {
            updateLuckyRollDisplay(playerData.luckyRollCounter, playerData.luckyRollThreshold);
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
        if (luckyRollDisplay) {
            if (threshold > 0 && current < threshold) { // Показываем, только если есть прогресс и порог задан
                luckyRollDisplay.textContent = `До Lucky Roll: ${threshold - current}`;
                luckyRollDisplay.style.opacity = '1';
            } else {
                luckyRollDisplay.textContent = '✨ Lucky Roll следующий! ✨'; // Или просто скрываем
                // Можно сделать, чтобы текст "Lucky Roll следующий!" показывался только когда current === 0 после сброса
                if (current === 0 && threshold > 0) {
                    // Уже сработало или только что сбросилось, можно так и написать
                } else {
                    luckyRollDisplay.textContent = '';
                }
                luckyRollDisplay.style.opacity = current === 0 ? '1' : '0'; // Показываем ярко, если следующий - лаки
            }
        }
    }

    // Универсальная функция для отображения уведомлений
    function showNotification(message, type = 'info', duration = 4000) { // type: 'info', 'success', 'warning', 'danger'
        // Пытаемся найти специальный контейнер для уведомлений, если нет - используем rollResultContainer
        let notificationContainer = document.getElementById('notificationsContainer'); 
        if (!notificationContainer) {
            // Если нет спец. контейнера, можно создать его динамически или использовать существующий
            // Для простоты пока будем использовать/создавать его в body для fixed позиционирования
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notificationsContainer';
            notificationContainer.style.position = 'fixed';
            notificationContainer.style.top = '20px';
            notificationContainer.style.right = '20px';
            notificationContainer.style.zIndex = '1060'; // Выше большинства элементов Bootstrap
            notificationContainer.style.width = 'auto';
            notificationContainer.style.maxWidth = '350px';
            document.body.appendChild(notificationContainer);
        }

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show mb-2`; // Добавил mb-2 для отступа между уведомлениями
        alertDiv.setAttribute('role', 'alert');
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        notificationContainer.appendChild(alertDiv); // Добавляем новое уведомление

        // Автоматически скрыть через 'duration' миллисекунд
        setTimeout(() => {
            const bsAlert = bootstrap.Alert.getOrCreateInstance(alertDiv);
            if (bsAlert) {
                bsAlert.close();
            } else if (alertDiv.parentElement) { // Если Bootstrap не инициализировал, удаляем вручную
                 alertDiv.remove();
            }
            // Если контейнер стал пустым после удаления, его тоже можно удалить (опционально)
            // if (notificationContainer.children.length === 0 && notificationContainer.id === 'notificationsContainerDynamic') {
            //     notificationContainer.remove();
            // }
        }, duration);
    }

    function updateActiveBoostsDisplay() {
        if (!activeBoostsDisplay) return;
        const playerData = Game.getPlayerData();
        activeBoostsDisplay.innerHTML = '';
        if (playerData.activeBoosts.length > 0) {
            const boostsHTML = playerData.activeBoosts.map(boost => {
                const timeLeft = Math.max(0, Math.round((boost.endTime - new Date().getTime()) / 1000));
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                return `<span class="badge bg-success me-1">${boost.name}: ${minutes}м ${seconds}с</span>`;
            }).join('');
            activeBoostsDisplay.innerHTML = `Активные бусты: ${boostsHTML}`;
        }
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
    function getRandomRarity() { const r = getRandomRarityFull(); return { id: r.id, name: r.name, cssClass: r.cssClass }; }
    function getRandomRarityNear(targetRarity) { const r = getRandomRarityNearFull(targetRarity); return { id: r.id, name: r.name, cssClass: r.cssClass }; }


    
    // --- Обработчики кнопок Ролла ---
    function handleRollButtonClick(isCalledByAutoroll = false) {
        if (isRolling) return;
        isRolling = true;
        // Блокируем ручные кнопки
        rollButton.disabled = true;
       multiRollButton.disabled = true;
        
        // Блокируем кнопку авторолла, только если это ручной запуск И авторолл НЕ активен
        if (!isCalledByAutoroll && !isAutorolling) { 
        autorollButton.disabled = true;
        }
    // Если авторолл уже активен, кнопка "Остановить Авторолл" должна оставаться активной
        rollResultContainer.innerHTML = '';
        if (activeSingleRollClearCallback) activeSingleRollClearCallback();
    
        rollAnimationContainer.querySelector('.single-roll-slot-wrapper').classList.remove('d-none');
        multiRollSlotsContainer.classList.add('d-none');
        multiRollSlotsContainer.innerHTML = '';
    
            const rollResult = Game.performRoll(); 

            activeSingleRollClearCallback = startRollAnimation(rollSlot, rollResult.rarity, () => {
            activeSingleRollClearCallback = null; 
            displayRollResult(rollResult);
            isRolling = false;
        
            const latestPlayerData = Game.getPlayerData();
            // Логика разблокировки кнопок
            if (!isAutorolling) { // Если авторолл НЕ активен (был выключен или не запускался)
                rollButton.disabled = false;
                if (latestPlayerData.purchasedUpgrades.multiRollX5) multiRollButton.disabled = false;
                autorollButton.disabled = false; // Разблокируем кнопку "Авторолл"
            } else {
                // Если авторолл АКТИВЕН, ручные кнопки остаются заблокированными.
                // Кнопка "Остановить Авторолл" уже должна быть активна (управляется start/stopAutoroll).
            }
    
    
            updateCurrencyDisplay(latestPlayerData.currency);
            renderInventory(latestPlayerData.inventory);
            if (typeof UI.updateLuckyRollDisplay === "function" && typeof latestPlayerData.luckyRollCounter !== 'undefined') {
                 UI.updateLuckyRollDisplay(latestPlayerData.luckyRollCounter, latestPlayerData.luckyRollThreshold);
            }
    
            if (isAutorolling && isCalledByAutoroll) {
                // Если это был авторолл, планируем следующий
                const autorollDelay = 500; // Задержка перед следующим автороллом (мс)
                autorollTimer = setTimeout(performNextAutoroll, autorollDelay);
            }
        });
    }

    // Замените вашу существующую handleMultiRollButtonClick на эту:
function handleMultiRollButtonClick(isCalledByAutoroll = false) {
    if (isRolling) return;
    isRolling = true;
    // Блокируем все кнопки ролла
    rollButton.disabled = true;
    multiRollButton.disabled = true;
    // Блокируем кнопку авторолла, только если это ручной запуск И авторолл НЕ активен
    if (!isCalledByAutoroll && !isAutorolling) {
        autorollButton.disabled = true;
    }

    rollResultContainer.innerHTML = '';
    activeMultiRollClearCallbacks.forEach(cb => cb());
    activeMultiRollClearCallbacks = [];

    rollAnimationContainer.querySelector('.single-roll-slot-wrapper').classList.add('d-none');
    multiRollSlotsContainer.classList.remove('d-none');
    multiRollSlotsContainer.innerHTML = '';

    const numRolls = 5;
    let completedAnimations = 0;
    const allRollResults = [];

    for (let i = 0; i < numRolls; i++) {
        const multiSlotWrapper = document.createElement('div');
        multiSlotWrapper.className = 'multi-roll-slot-wrapper';
        const currentMultiInnerSlot = document.createElement('div');
        currentMultiInnerSlot.className = 'roll-slot';
        currentMultiInnerSlot.id = `multiRollInnerSlot-${i}`;
        multiSlotWrapper.appendChild(currentMultiInnerSlot);
        multiRollSlotsContainer.appendChild(multiSlotWrapper);

        const rollResult = Game.performRoll();
        allRollResults.push(rollResult);

        const clearCb = startRollAnimation(currentMultiInnerSlot, rollResult.rarity, () => {
            completedAnimations++;
            if (completedAnimations === numRolls) {
                isRolling = false; // Общий флаг роллинга снимаем
                handleAllMultiRollsCompleted(allRollResults); 

                const latestPlayerData = Game.getPlayerData();
                // Разблокируем кнопки в зависимости от состояния авторолла
                if (!isAutorolling) { // Если авторолл НЕ активен
                    rollButton.disabled = false;
                    if (latestPlayerData.purchasedUpgrades.multiRollX5) multiRollButton.disabled = false;
                    autorollButton.disabled = false; // Разблокируем кнопку "Авторолл"
                } else {
                    // Если авторолл АКТИВЕН, ручные кнопки остаются заблокированными.
                }

                updateCurrencyDisplay(latestPlayerData.currency);
                renderInventory(latestPlayerData.inventory);
                 if (typeof UI.updateLuckyRollDisplay === "function" && typeof latestPlayerData.luckyRollCounter !== 'undefined') {
                    UI.updateLuckyRollDisplay(latestPlayerData.luckyRollCounter, latestPlayerData.luckyRollThreshold);
                }

                if (isAutorolling && isCalledByAutoroll) {
                    const autorollDelay = 700; // Чуть больше задержка для мультиролла
                    autorollTimer = setTimeout(performNextAutoroll, autorollDelay);
                }
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
            summaryText.innerHTML = `Всего получено за дубликаты: <span class="currency-icon">💎</span>${totalCurrencyFromMultiRoll}`;
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
        cardElement.setAttribute('title', `Редкость: ${rollResult.rarity.name}`);
        const nameElement = document.createElement('h3');
        nameElement.className = 'received-card-name';
        nameElement.textContent = `Вы получили: ${rollResult.card.name}!`;
        if (rollResult.isNew) nameElement.innerHTML += ' <span class="badge bg-warning">НОВАЯ!</span>';
        cardWrapper.appendChild(cardElement);
        rollResultContainer.appendChild(cardWrapper);
        rollResultContainer.appendChild(nameElement);
        if (rollResult.duplicateReward > 0) {
            const rewardText = document.createElement('p');
            rewardText.className = 'duplicate-reward-text';
            rewardText.innerHTML = `Получено за дубликат: <span class="currency-icon">💎</span>${rollResult.duplicateReward}`;
            rollResultContainer.appendChild(rewardText);
        }
    }
    
    // --- Инвентарь с силуэтами и счетчиком ---
    function renderInventory(playerInventoryIds) {
        if (!inventoryGrid || !inventoryCounterElement) return;
        inventoryGrid.innerHTML = '';
        let openedCount = 0;

        // Отображаем в порядке от самой частой к самой редкой (визуально снизу вверх по редкости)
        const sortedRaritiesForDisplay = [...RARITIES_DATA].reverse(); 

        sortedRaritiesForDisplay.forEach(rarityData => {
            const isOpened = playerInventoryIds.includes(rarityData.id);
            if (isOpened) openedCount++;

            const col = document.createElement('div');
            col.className = 'col';
            const cardDiv = document.createElement('div');
            cardDiv.className = 'inventory-card';
            cardDiv.dataset.rarityId = rarityData.id;
            const img = document.createElement('img');
            img.alt = isOpened ? rarityData.card.name : "Неизвестная карта";
            img.className = 'inventory-card-image';
            const nameDiv = document.createElement('div');
            nameDiv.className = 'inventory-card-name';

            if (isOpened) {
                cardDiv.classList.add(`border-${rarityData.id}`);
                cardDiv.style.setProperty('--rarity-glow-color', rarityData.glowColor);
                img.src = rarityData.card.image;
                nameDiv.textContent = rarityData.card.name;
                cardDiv.addEventListener('click', () => showCardModal(rarityData));
            } else {
                cardDiv.classList.add('locked');
                img.src = "img/silhouette_placeholder.png"; // Используем ваш силуэт
                nameDiv.textContent = "?????"; // Или название редкости: rarityData.name
            }
            cardDiv.appendChild(img);
            cardDiv.appendChild(nameDiv);
            col.appendChild(cardDiv);
            inventoryGrid.appendChild(col);
        });
        inventoryCounterElement.textContent = `Открыто: ${openedCount} / ${RARITIES_DATA.length}`;
    }

    function showCardModal(rarityData) {
        modalCardImage.src = rarityData.card.image;
        modalCardImage.alt = rarityData.card.name;
        modalCardName.textContent = rarityData.card.name;
        modalCardRarity.textContent = `Редкость: ${rarityData.name}`;
        if (modalCardChance) { // Если элемент есть
            let chanceText = "";
            if (rarityData.probabilityBase) {
                if (rarityData.probabilityBase >= 1) { 
                    chanceText = "Гарантировано (если другое не выпало)";
                } else {
                    const denominator = Math.round(1 / rarityData.probabilityBase);
                    chanceText = `Базовый шанс: 1/${denominator}`;
                }
            }
            modalCardChance.textContent = chanceText;
        }
        modalCardDescription.textContent = rarityData.card.description;
        modalCardRarity.style.color = rarityData.color;
        // Удален дубликат: modalCardDescription.textContent = rarityData.card.description;

        const visualEffectControls = document.getElementById('visualEffectControls');
        visualEffectControls.innerHTML = ''; // Очищаем кнопки от предыдущей карты

        const currentActiveEffectId = Game.getPlayerData().activeVisualEffectRarityId;
        const cardHasVisualEffect = (typeof VisualEffects !== 'undefined' && VisualEffects.effects.hasOwnProperty(rarityData.id));

        if (cardHasVisualEffect) {
            const toggleBtn = document.createElement('button');
            toggleBtn.id = 'toggleVisualEffectButtonActive'; // Можно оставить, если нужен для стилей/тестов
            toggleBtn.classList.add('btn', 'btn-sm');

            // Начальное состояние кнопки
            if (currentActiveEffectId === rarityData.id) {
                toggleBtn.classList.add('btn-danger');
                toggleBtn.textContent = 'Деактивировать эффект';
            } else {
                toggleBtn.classList.add('btn-success');
                toggleBtn.textContent = 'Активировать эффект';
            }
            
            visualEffectControls.appendChild(toggleBtn);

            // ЕДИНСТВЕННЫЙ ОБРАБОТЧИК КЛИКА
            toggleBtn.addEventListener('click', () => {
                const isActiveNow = Game.getPlayerData().activeVisualEffectRarityId === rarityData.id;
                
                if (isActiveNow) {
                    Game.clearActiveVisualEffect(); // Предполагается, что это вызовет UI.applyVisualEffect(null) из Game
                } else {
                    Game.setActiveVisualEffect(rarityData.id); // Предполагается, что это вызовет UI.applyVisualEffect(rarityData.id) из Game
                }

                // Обновляем ТОЛЬКО кнопку в текущей модалке после того, как Game отработает.
                // Небольшая задержка, чтобы Game успел обновить playerData и вызвать UI.applyVisualEffect.
                // В идеале, Game.setActive/clear должны возвращать Promise или принимать callback,
                // чтобы избежать гонки с setTimeout. Но пока так:
                setTimeout(() => {
                    const newPlayerData = Game.getPlayerData(); // Получаем свежие данные
                    if (newPlayerData.activeVisualEffectRarityId === rarityData.id) {
                        toggleBtn.classList.remove('btn-success');
                        toggleBtn.classList.add('btn-danger');
                        toggleBtn.textContent = 'Деактивировать эффект';
                    } else {
                        toggleBtn.classList.remove('btn-danger');
                        toggleBtn.classList.add('btn-success');
                        toggleBtn.textContent = 'Активировать эффект';
                    }
                }, 70); // Чуть увеличим задержку на всякий случай, но это "магическое число"
            });

        } else {
            visualEffectControls.innerHTML = '<p class="text-muted small">У этой карты нет визуального эффекта.</p>';
        }
        cardModal.show();
    }

        function applyVisualEffect(rarityId) { // rarityId - это effectId для модуля VisualEffects
        const targets = {
            body: document.body,
            glitchOverlay: document.getElementById('globalGlitchOverlay'),
            audioPlayer: backgroundMusicElement
            // Можно передать и другие общие элементы, если эффекты их используют
        };
        VisualEffects.apply(rarityId, targets);
    }

    
    
    // --- Магазин ---
    function renderShop() {
        if (!boostShop || !equipmentShop || !upgradesShop) {
            console.error("Shop DOM elements not found!");
            return;
        }

        const playerData = Game.getPlayerData();
        if (!playerData) {
            console.error("Player data not available for rendering shop.");
            return;
        }

        // Бусты
        boostShop.innerHTML = SHOP_DATA.boosts.map(boost => `
            <div class="list-group-item shop-item d-flex justify-content-between align-items-center">
                <div>
                    <strong>${boost.name}</strong>
                    <small class="d-block text-muted">${boost.description}</small>
                </div>
                <button class="btn btn-sm btn-success buy-boost-btn" data-item-id="${boost.id}" ${playerData.currency < boost.cost ? 'disabled' : ''}>
                    Купить <span class="badge bg-warning text-dark">${boost.cost} 💎</span>
                </button>
            </div>
        `).join('');

        // Экипировка
        equipmentShop.innerHTML = SHOP_DATA.equipment.map(equip => {
            const isPurchased = playerData.inventory.includes("purchased_"+equip.id); // Проверяем, куплен ли предмет
            const isEquipped = playerData.equippedItems.find(e => e.id === equip.id);
            let buttonHtml;

            if (isEquipped) {
                buttonHtml = `<button class="btn btn-sm btn-secondary" disabled>Надето</button>`;
            } else if (isPurchased) {
                buttonHtml = `<button class="btn btn-sm btn-outline-primary equip-btn" data-item-id="${equip.id}" ${playerData.equippedItems.length >= MAX_EQUIPPED_ITEMS ? 'disabled title="Максимум экипировки"' : ''}>Надеть</button>`;
            } else {
                 buttonHtml = `<button class="btn btn-sm btn-success buy-equip-btn" data-item-id="${equip.id}" ${playerData.currency < equip.cost ? 'disabled' : ''}>
                    Купить <span class="badge bg-warning text-dark">${equip.cost} 💎</span>
                </button>`;
            }

            return `
            <div class="list-group-item shop-item d-flex justify-content-between align-items-center ${isPurchased ? 'purchased' : ''} ${isEquipped ? 'equipped' : ''}">
                <div>
                    <strong>${equip.name}</strong>
                    <small class="d-block text-muted">${equip.description}</small>
                </div>
                ${buttonHtml}
            </div>
            `}).join('');

        // Улучшения
        upgradesShop.innerHTML = SHOP_DATA.upgrades.map(upgrade => {
            const isUpgradePurchased = playerData.purchasedUpgrades[upgrade.targetProperty];
            return `
            <div class="list-group-item shop-item d-flex justify-content-between align-items-center ${isUpgradePurchased ? 'purchased' : ''}">
                <div>
                    <strong>${upgrade.name}</strong>
                    <small class="d-block text-muted">${upgrade.description}</small>
                </div>
                <button class="btn btn-sm btn-success buy-upgrade-btn" data-item-id="${upgrade.id}" 
                    ${isUpgradePurchased ? 'disabled' : ''} 
                    ${playerData.currency < upgrade.cost && !isUpgradePurchased ? 'disabled' : ''}>
                    ${isUpgradePurchased ? 'Куплено' : `Купить <span class="badge bg-warning text-dark">${upgrade.cost} 💎</span>`}
                </button>
            </div>
        `}).join('');

        addShopEventListeners(); // Добавляем слушатели после генерации HTML
    }
    function addShopEventListeners() {
        boostShop.querySelectorAll('.buy-boost-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.currentTarget.dataset.itemId;
                if (Game.purchaseShopItem(itemId, 'boost')) {
                    updateCurrencyDisplay(Game.getPlayerData().currency);
                    // updateLuckDisplay(); // Вызывается из Game.activateBoost -> checkActiveBoosts -> UI.updateActiveBoostsDisplay
                    // updateActiveBoostsDisplay(); // Вызывается из Game.activateBoost
                    renderShop(); // Обновить состояние кнопок и доступность
                } else {
                    alert("Недостаточно Призматических осколков!");
                }
            });
        });

        equipmentShop.querySelectorAll('.buy-equip-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.currentTarget.dataset.itemId;
                if (Game.purchaseShopItem(itemId, 'equipment')) {
                    updateCurrencyDisplay(Game.getPlayerData().currency);
                    updateLuckDisplay();
                    updateEquippedItemsDisplay(Game.getPlayerData().equippedItems);
                    renderShop();
                } else {
                    // Проверяем, не куплен ли он уже, чтобы не показывать ошибку о валюте, если он просто уже есть
                    if (!Game.getPlayerData().inventory.includes("purchased_"+itemId)) {
                        alert("Недостаточно Призматических осколков!");
                    }
                }
            });
        });

        equipmentShop.querySelectorAll('.equip-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.currentTarget.dataset.itemId;
                const itemData = SHOP_DATA.equipment.find(eq => eq.id === itemId);
                if (itemData && Game.equipItem(itemData)) {
                    renderShop(); // Обновить кнопки (например, "Надеть" станет "Надето")
                    updateEquippedItemsDisplay(Game.getPlayerData().equippedItems);
                    updateLuckDisplay();
                }
            });
        });

        upgradesShop.querySelectorAll('.buy-upgrade-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.currentTarget.dataset.itemId;
                const upgradeData = SHOP_DATA.upgrades.find(u=>u.id === itemId); // Находим данные об улучшении
                if (upgradeData && Game.purchaseShopItem(itemId, 'upgrade')) {
                    updateCurrencyDisplay(Game.getPlayerData().currency);
                    renderShop(); // Обновить кнопку на "Куплено"
                    // Если это Fast Roll, обновить скорость анимации (хотя она проверяется в startRollAnimation)
                    // if (upgradeData.targetProperty === 'fastRoll') { UI.updateRollSpeed(true); } - updateRollSpeed пока не активна
                    if (upgradeData.targetProperty === 'multiRollX5') { UI.toggleMultiRollButton(true); }
                } else {
                    // Проверяем, не куплено ли уже улучшение
                    if (upgradeData && !Game.getPlayerData().purchasedUpgrades[upgradeData.targetProperty]) {
                         alert("Недостаточно Призматических осколков!");
                    }
                }
            });
        });
    }
    function updateEquippedItemsDisplay(equippedItems = []) {
        if (!equippedItemsDisplay) {
            console.warn("equippedItemsDisplay DOM element not found.");
            return;
        }
    
        equippedItemsDisplay.innerHTML = '';
    
        if (equippedItems.length === 0) {
            equippedItemsDisplay.innerHTML = '<p class="text-muted small">Нет надетой экипировки.</p>';
            return;
        }
    
        equippedItems.forEach(equippedItemData => { // Переименовал item в equippedItemData для ясности
            const itemChip = document.createElement('div');
            // Используем классы Bootstrap для "чипов", можно настроить по вкусу
            itemChip.className = 'equipped-item-chip badge bg-info text-dark me-1 mb-1 p-2'; // Изменил цвет на bg-info для лучшей читаемости
    
            let itemInfoText = ""; // Текст, описывающий эффект предмета
    
            // Пытаемся получить полное описание предмета из SHOP_DATA, чтобы отобразить его эффект
            const shopItemDefinition = SHOP_DATA.equipment.find(shopItem => shopItem.id === equippedItemData.id);
    
            if (shopItemDefinition) {
                // Если у предмета есть прямой luckBonus, показываем его
                if (typeof shopItemDefinition.luckBonus === 'number') {
                    itemInfoText = `+${shopItemDefinition.luckBonus.toFixed(2)} удачи`; // toFixed(2) для красивого отображения
                } 
                // Если у предмета есть поле effect, пытаемся его описать
                else if (shopItemDefinition.effect) {
                    switch (shopItemDefinition.effect.type) {
                        case "duplicate_currency_bonus_percent":
                            itemInfoText = `+${shopItemDefinition.effect.value * 100}% 💎 за дубли`;
                            break;
                        case "cumulative_luck_on_low_rolls":
                            // Для "Длани Неудачника" можно показать базовый бонус за стак
                            // Динамическое отображение стаков лучше делать в отдельном элементе UI
                            itemInfoText = `Накоп. удача (+${shopItemDefinition.effect.bonusPerStack} за стак)`;
                            break;
                        default:
                            // Если тип эффекта неизвестен, берем краткое описание из SHOP_DATA
                            itemInfoText = shopItemDefinition.description.split('.')[0];
                            if (itemInfoText.length > 30) { // Обрезаем, если слишком длинное
                                itemInfoText = itemInfoText.substring(0, 27) + "...";
                            }
                            break;
                    }
                } 
                // Если нет ни luckBonus, ни effect, но есть описание в SHOP_DATA
                else if (shopItemDefinition.description) {
                     itemInfoText = shopItemDefinition.description.split('.')[0];
                     if (itemInfoText.length > 30) {
                        itemInfoText = itemInfoText.substring(0, 27) + "...";
                    }
                }
                // Если ничего из вышеперечисленного, но есть имя
                else {
                    itemInfoText = "Активен"; // Общий текст
                }
            } else {
                // Если предмет не найден в SHOP_DATA (не должно происходить, но на всякий случай)
                // Пытаемся использовать данные из самого equippedItemData (если они там есть)
                if (typeof equippedItemData.luckBonus === 'number') {
                     itemInfoText = `+${equippedItemData.luckBonus.toFixed(2)} удачи`;
                } else {
                    itemInfoText = "Неизвестный эффект";
                }
            }
    
            itemChip.innerHTML = `
                <span>${equippedItemData.name} <small class="text-white-75">(${itemInfoText})</small></span>
                <button class="btn btn-xs btn-outline-light btn-remove-equip ms-2" data-item-id="${equippedItemData.id}" title="Снять предмет" style="border-color: rgba(255,255,255,0.5); color: rgba(255,255,255,0.7);">&times;</button>
            `;
            
            const removeButton = itemChip.querySelector('.btn-remove-equip');
            if (removeButton) {
                removeButton.addEventListener('click', () => {
                    Game.unequipItem(equippedItemData.id);
                    renderShop(); 
                    updateEquippedItemsDisplay(Game.getPlayerData().equippedItems); 
                    updateLuckDisplay(); 
                });
            }
            equippedItemsDisplay.appendChild(itemChip);
        });
    }
    function toggleMultiRollButton(isPurchased) { if (multiRollButton) { multiRollButton.classList.toggle('d-none', !isPurchased); } }

    // --- Публичный интерфейс ---
    return {
        init, updateAll, updateCurrencyDisplay, updateLuckDisplay, updateActiveBoostsDisplay,
        renderInventory, renderShop, /* renderSettings удален */ updateEquippedItemsDisplay,
        toggleMultiRollButton, showNotification,        // <<--- ДОБАВИТЬ ЭКСПОРТ
        updateLuckyRollDisplay, applyVisualEffect

    };
})();
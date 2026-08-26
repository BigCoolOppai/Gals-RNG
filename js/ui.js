// js/ui.js

const UI = (() => {
    // --- Константы ---
    const AUTOROLL_BREATHING_ROOM = 500;

    // --- DOM-элементы (все объявлены, чтобы не создавать неявные глобальные переменные) ---
    let currencyDisplay, luckDisplay, activeBoostsDisplay, luckyRollDisplay;
    let rollButton, multiRollButton, autorollButton;
    let rollAnimationContainer, rollSlot, multiRollSlotsContainer, rollResultContainer;
    let inventoryGrid, inventoryCounterElement;
    let boostShop, equipmentShop, upgradesShop, equippedItemsDisplay;
    let cardModal, modalCardImage, modalCardName, modalCardRarity, modalCardDescription, modalCardChance;
    let statsTotalRollsEl, statsUniqueCardsOpenedEl, statsCurrencyFromDuplicatesEl, statsByRarityContainerEl, statsTotalRebirthsEl;
    let inventorySortSelect, notificationsToggle, specialContentToggle;
    let exportSaveButton, importSaveInput;
    let playerIdDisplay, copyPlayerIdBtn, checkSupportBtn;
    let musicVolumeSlider, musicVolumeLabel, backgroundMusicElement;
    let eventBanner, achievementsContainer, htmlRoot;

    // Модалка новой карты
    let newCardModal, newCardModalImage, newCardModalName, newCardModalRarity;

    // --- Состояние UI ---
    let isRolling = false;
    let isAutorolling = false;
    let autorollTimer = null;
    let lastRollTimestamp = 0;
    let activeSingleRollClearCallback = null;
    let activeMultiRollCallbacks = [];
    let boostTimerInterval = null; // таймер отображения обратного отсчета бустов

    // Для очереди новых карт
    let newCardQueue = [];
    let isShowingNewCard = false;
    let newCardDismissTimer = null;

    // Активность вкладки
    let isTabActive = true;

    // --- Утилиты ---
    const hasAnyMulti = (pd) => !!(pd?.purchasedUpgrades?.multiRollX10 || pd?.purchasedUpgrades?.multiRollX5);

    // Миниатюра для грида/списков: img/webp/cardGal.webp -> img/webp/cardGal-thumb.webp.
    // Полный размер (без -thumb) используется только в модалке карты.
    function thumbOf(imagePath) {
        return String(imagePath || '').replace(/\.webp$/, '-thumb.webp');
    }

    function cacheDOMElements() {
        currencyDisplay = document.getElementById('currencyDisplay');
        luckDisplay = document.getElementById('luckDisplay');
        activeBoostsDisplay = document.getElementById('activeBoostsDisplay');
        luckyRollDisplay = document.getElementById('luckyRollDisplay');

        rollButton = document.getElementById('rollButton');
        multiRollButton = document.getElementById('multiRollButton');
        autorollButton = document.getElementById('autorollButton');

        rollAnimationContainer = document.getElementById('rollAnimationContainer');
        rollSlot = document.getElementById('rollSlot');
        multiRollSlotsContainer = document.getElementById('multiRollSlotsContainer');
        rollResultContainer = document.getElementById('rollResultContainer');

        notificationsToggle = document.getElementById('notificationsToggle');
        specialContentToggle = document.getElementById('specialContentToggle');
        statsTotalRebirthsEl = document.getElementById('statsTotalRebirths');

        exportSaveButton = document.getElementById('exportSaveButton');
        importSaveInput = document.getElementById('importSaveInput');

        inventoryGrid = document.getElementById('inventoryGrid');
        inventoryCounterElement = document.getElementById('inventoryCounter');

        boostShop = document.getElementById('boostShop');
        equipmentShop = document.getElementById('equipmentShop');
        upgradesShop = document.getElementById('upgradesShop');
        equippedItemsDisplay = document.getElementById('equippedItemsDisplay');

        cardModal = new bootstrap.Modal(document.getElementById('cardModal'));
        modalCardImage = document.getElementById('modalCardImage');
        modalCardName = document.getElementById('cardModalLabel');
        modalCardRarity = document.getElementById('modalCardRarity');
        modalCardChance = document.getElementById('modalCardChance');
        modalCardDescription = document.getElementById('modalCardDescription');

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

        eventBanner = document.getElementById('eventBanner');
        achievementsContainer = document.getElementById('achievements');
        htmlRoot = document.getElementById('htmlRoot');
    }

    function injectInventorySearch() {
        const bar = document.getElementById('inventorySort')?.closest('.d-flex');
        if (!bar) return;
        if (document.getElementById('inventorySearchInput')) return;

        const wrap = document.createElement('div');
        wrap.className = 'ms-2';
        wrap.innerHTML = `
            <input id="inventorySearchInput" type="text" class="form-control form-control-sm"
                placeholder="${L.get('ui.searchCards') || 'Поиск...'}" style="width: 200px;">
        `;
        bar.appendChild(wrap);

        let t;
        document.getElementById('inventorySearchInput').addEventListener('input', () => {
            clearTimeout(t);
            t = setTimeout(() => renderInventory(Game.getPlayerData()), 150);
        });
    }

    // --- Состояние фильтров инвентаря (localStorage, как сортировка) ---
    const FILTER_DEFAULTS = { new: false, limited: false, mutation: false, effect: false, alts: false, rarity: 'all' };
    function getInvFilterState() {
        try {
            const saved = JSON.parse(localStorage.getItem('inventoryFilters') || '{}');
            return Object.assign({}, FILTER_DEFAULTS, saved);
        } catch (e) {
            return Object.assign({}, FILTER_DEFAULTS);
        }
    }
    function saveInvFilterState(state) {
        localStorage.setItem('inventoryFilters', JSON.stringify(state));
    }
    function isAnyInvFilterActive(state) {
        return state.new || state.limited || state.mutation || state.effect || state.alts || state.rarity !== 'all';
    }

    function injectInventoryFilters() {
        const grid = document.getElementById('inventoryGrid');
        if (!grid || document.getElementById('inventoryFilters')) return;

        const state = getInvFilterState();
        const chips = [
            { key: 'new',      cls: 'filter-new',      label: L.get('ui.filter.new') },
            { key: 'limited',  cls: 'filter-limited',  label: L.get('ui.filter.limited') },
            { key: 'mutation', cls: 'filter-mutation', label: L.get('ui.filter.mutation') },
            { key: 'effect',   cls: 'filter-effect',   label: L.get('ui.filter.effect') },
            { key: 'alts',     cls: 'filter-alts',     label: L.get('ui.filter.alts') }
        ];
        const rarityOptions = [
            ['all',     L.get('ui.filter.rarity.all')],
            ['le1k',    L.get('ui.filter.rarity.le1k')],
            ['k1_10',   L.get('ui.filter.rarity.k1_10')],
            ['k10_100', L.get('ui.filter.rarity.k10_100')],
            ['m100_1',  L.get('ui.filter.rarity.m100_1')],
            ['m1_100',  L.get('ui.filter.rarity.m1_100')],
            ['g100',    L.get('ui.filter.rarity.g100')]
        ];

        const row = document.createElement('div');
        row.id = 'inventoryFilters';
        row.className = 'd-flex flex-wrap align-items-center gap-2 mb-2';

        chips.forEach(c => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'btn btn-sm btn-outline-secondary inv-filter-chip ' + c.cls;
            b.textContent = c.label;
            if (state[c.key]) b.classList.add('active');
            b.addEventListener('click', () => {
                b.classList.toggle('active');
                const s = getInvFilterState();
                s[c.key] = b.classList.contains('active');
                saveInvFilterState(s);
                renderInventory(Game.getPlayerData());
            });
            row.appendChild(b);
        });

        const selWrap = document.createElement('span');
        selWrap.innerHTML = `<label class="inv-filter-rarity-label mb-0">${L.get('ui.filter.rarity')}</label>`;
        const sel = document.createElement('select');
        sel.id = 'inventoryRarityFilter';
        sel.className = 'form-select form-select-sm inv-filter-rarity';
        rarityOptions.forEach(([val, label]) => {
            const o = document.createElement('option');
            o.value = val;
            o.textContent = label;
            if (val === state.rarity) o.selected = true;
            sel.appendChild(o);
        });
        sel.addEventListener('change', () => {
            const s = getInvFilterState();
            s.rarity = sel.value;
            saveInvFilterState(s);
            renderInventory(Game.getPlayerData());
        });
        selWrap.appendChild(sel);
        row.appendChild(selWrap);

        const reset = document.createElement('button');
        reset.type = 'button';
        reset.className = 'btn btn-sm btn-link inv-filter-reset';
        reset.textContent = L.get('ui.filter.reset');
        reset.addEventListener('click', () => {
            saveInvFilterState(Object.assign({}, FILTER_DEFAULTS));
            row.querySelectorAll('.inv-filter-chip.active').forEach(b => b.classList.remove('active'));
            sel.value = 'all';
            renderInventory(Game.getPlayerData());
        });
        row.appendChild(reset);

        grid.parentElement.insertBefore(row, grid);
    }

    function init() {
        cacheDOMElements();
        injectInventorySearch();
        injectInventoryFilters();
        injectEffectWidget();
        setupEventListeners();
        checkAgeDisclaimer();

        const initialPlayerData = Game.getPlayerData();
        updateAll(initialPlayerData);
        Game.checkActiveBoosts();

        // Инициализация громкости/музыки
        if (musicVolumeSlider && backgroundMusicElement) {
            if (initialPlayerData && typeof initialPlayerData.musicVolume === 'number') {
                musicVolumeSlider.value = initialPlayerData.musicVolume;
                backgroundMusicElement.volume = initialPlayerData.musicVolume;
                if (musicVolumeLabel) musicVolumeLabel.textContent = `${Math.round(initialPlayerData.musicVolume * 100)}%`;
            } else {
                musicVolumeSlider.value = 0;
                backgroundMusicElement.volume = 0;
                if (musicVolumeLabel) musicVolumeLabel.textContent = `0%`;
            }
        }

        // Визуальный эффект при загрузке
        const initialEffectId = initialPlayerData ? initialPlayerData.activeVisualEffectRarityId : null;
        applyVisualEffect(initialEffectId, true);

        // Прокладка смены трека для эффекта
        const musicForInitialEffect = initialEffectId ? VisualEffects.effectMusicMap[initialEffectId] : null;
        const targetInitialTrack = musicForInitialEffect || VisualEffects.defaultMusicTrack;
        if (backgroundMusicElement && (!backgroundMusicElement.currentSrc || !backgroundMusicElement.currentSrc.endsWith(targetInitialTrack))) {
            backgroundMusicElement.src = targetInitialTrack;
            backgroundMusicElement.load();
        }

        applyTheme(initialPlayerData.activeTheme);

        // Тултипы Bootstrap
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        [...tooltipTriggerList].map(el => new bootstrap.Tooltip(el));
    }

    function checkAgeDisclaimer() {
        const isConfirmed = localStorage.getItem('ageDisclaimerConfirmed') === 'true';
        if (isConfirmed) return;

        const modalEl = document.getElementById('ageDisclaimerModal');
        if (!modalEl) return;

        const ageModal = new bootstrap.Modal(modalEl);
        ageModal.show();

        document.getElementById('ageConfirmBtn')?.addEventListener('click', () => {
            localStorage.setItem('ageDisclaimerConfirmed', 'true');
            ageModal.hide();
        });

        document.getElementById('ageDeclineBtn')?.addEventListener('click', () => {
            window.location.href = 'https://www.google.com';
        });
    }

    function setupEventListeners() {
        rollButton?.addEventListener('click', handleManualRoll);
        multiRollButton?.addEventListener('click', handleManualMultiRoll);
        autorollButton?.addEventListener('click', toggleAutoroll);
        musicVolumeSlider?.addEventListener('input', handleVolumeChange);

        // Язык
        document.getElementById('lang-ru')?.addEventListener('click', () => L.setLanguage('ru'));
        document.getElementById('lang-en')?.addEventListener('click', () => L.setLanguage('en'));
        const currentLang = L.getCurrentLanguage?.() || 'en';
        document.getElementById(`lang-${currentLang}`)?.classList.add('active');

        // Вкладка статистики
        document.getElementById('stats-tab')?.addEventListener('shown.bs.tab', () => {
            const pd = Game.getPlayerData();
            if (pd?.stats) renderStats(pd);
        });

        // Вкладка достижений
        document.getElementById('achievements-tab')?.addEventListener('shown.bs.tab', () => {
            renderAchievements();
        });

        // Тяжёлые вкладки: рендерим при открытии (и при смене данных — из updateAll/updateHud)
        const pdOnShow = () => Game.getPlayerData();
        document.getElementById('shop-tab')?.addEventListener('shown.bs.tab', () => {
            renderShop();
            updateEquippedItemsDisplay(pdOnShow().equippedItems);
        });
        document.getElementById('workshop-tab')?.addEventListener('shown.bs.tab', () => {
            renderWorkshop(pdOnShow());
        });
        document.getElementById('backpack-tab')?.addEventListener('shown.bs.tab', () => {
            const pd = pdOnShow();
            renderMaterials(pd);
            renderOwnedEquipment(pd);
        });
        document.getElementById('rebirth-tab-button')?.addEventListener('shown.bs.tab', () => {
            renderRebirthSection();
        });

        // Сортировка инвентаря
        inventorySortSelect?.addEventListener('change', () => {
            localStorage.setItem('inventorySortOrder', inventorySortSelect.value);
            renderInventory(Game.getPlayerData());
        });

        // Копирование PlayerID
        copyPlayerIdBtn?.addEventListener('click', () => {
            if (playerIdDisplay?.value) {
                navigator.clipboard.writeText(playerIdDisplay.value).then(() => {
                    showNotification(L.get('notifications.playerIdCopied'), "success");
                }).catch(() => {
                    showNotification(L.get('notifications.playerIdCopyError'), "danger");
                });
            }
        });

        // Проверка саппортера
        checkSupportBtn?.addEventListener('click', () => {
            Game.checkForSupporterStatus();
        });

        // Активность вкладки
        document.addEventListener('visibilitychange', () => {
            isTabActive = !document.hidden;
            if (isTabActive) {
                if (isAutorolling) {
                    handleAfkProgress();
                }
                processNewCardQueue();
            } else {
                clearTimeout(autorollTimer);
                autorollTimer = null;
            }
        });

        // Тоггл уведомлений
        notificationsToggle?.addEventListener('change', (event) => {
            Game.getPlayerData().notificationsEnabled = event.target.checked;
            Game.saveGame();
        });

        // Экспорт
        exportSaveButton?.addEventListener('click', () => {
            if (SaveManager.exportSave()) {
                showNotification(L.get('notifications.exportSuccess'), 'success');
            } else {
                showNotification(L.get('notifications.exportError'), 'danger');
            }
        });

        // Импорт
        importSaveInput?.addEventListener('change', async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;

            if (confirm(L.get('notifications.importConfirm'))) {
                try {
                    await SaveManager.importSave(file);
                    showNotification(L.get('notifications.importSuccess'), 'success');
                    setTimeout(() => window.location.reload(), 1500);
                } catch (error) {
                    showNotification(`${L.get('notifications.importError')} (${error.message})`, 'danger', 6000);
                }
            }
            event.target.value = '';
        });

        // Тоггл спец-контента (включает немедленную перерисовку)
        specialContentToggle?.addEventListener('change', (event) => {
            const pd = Game.getPlayerData();
            pd.specialContentEnabled = event.target.checked;
            Game.saveGame();
            updateAll(pd); // перерисовать инвентарь/модалки
            showNotification(L.get('notifications.settingsRefresh'), 'info');
        });
    }

    // --- Вспомогательное: цвет текста для бейджей ---
    function getTextColorForBg(hexColor) {
        if (!hexColor || hexColor.length < 7) return '#FFFFFF';
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 135 ? '#000000' : '#FFFFFF';
    }

    // --- Рендер статистики ---
    function renderStats(playerData) {
        if (!playerData || !playerData.stats) {
            console.warn("renderStats: playerData or stats missing.");
            return;
        }

        const stats = playerData.stats;
        const seenRaritiesSet = new Set(playerData.seenRarities || []);
        renderLuckBreakdownUI();

        statsTotalRollsEl && (statsTotalRollsEl.textContent = formatNumber(stats.totalRolls || 0));

        if (statsUniqueCardsOpenedEl) {
            const validCardIds = new Set(RARITIES_DATA.map(r => r.id));
            const totalPossibleCards = RARITIES_DATA.filter(r => r.id !== 'garbage' && validCardIds.has(r.id)).length;
            const openedCount = playerData.inventory.filter(id => id !== 'garbage' && validCardIds.has(id)).length;
            statsUniqueCardsOpenedEl.textContent = `${openedCount} / ${totalPossibleCards}`;
        }

        statsCurrencyFromDuplicatesEl && (statsCurrencyFromDuplicatesEl.textContent = formatNumber(stats.currencyFromDuplicates || 0));
        statsTotalRebirthsEl && (statsTotalRebirthsEl.textContent = playerData.prestigeLevel || 0);
        

        if (statsByRarityContainerEl) {
            statsByRarityContainerEl.innerHTML = '';

            const raritiesToShowInStats = RARITIES_DATA.filter(rarity => {
                if (rarity.id === 'garbage') {
                    return stats.rollsByRarity && stats.rollsByRarity[rarity.id] > 0;
                }
                return seenRaritiesSet.has(rarity.id);
            });

            raritiesToShowInStats.forEach(rarity => {
                const count = (stats.rollsByRarity && stats.rollsByRarity[rarity.id]) || 0;
                const textColor = getTextColorForBg(rarity.color);

                const listItem = document.createElement('a');
                listItem.href = "#";
                listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                listItem.style.cursor = 'default';
                listItem.onclick = (e) => e.preventDefault();

                listItem.innerHTML = `
                    ${L.get(rarity.nameKey)}
                    <span class="badge rounded-pill" style="background-color:${rarity.color}; color:${textColor};">
                        ${formatNumber(count)}
                    </span>
                `;
                statsByRarityContainerEl.appendChild(listItem);
            });
        }
        
    }

    function renderLuckBreakdownUI() {
        const hostRow = document.getElementById('playerStatsContainer');
        if (!hostRow || typeof Game.getLuckBreakdown !== 'function') return;

        let box = document.getElementById('luckBreakdownBox');
        if (!box) {
            box = document.createElement('div');
            box.id = 'luckBreakdownBox';
            box.className = 'col-md-12 mb-3';
            // вставляем САМЫМ ВЕРХОМ
            hostRow.insertBefore(box, hostRow.firstChild);
        }

        const lb = Game.getLuckBreakdown();
        const t = (k) => L.get(`ui.luckBreakdown.${k}`);
        const fmt = (v) => (v >= 0 ? '+' : '') + v.toFixed(3);

        const labels = {
            base: t('base'),
            core: t('core'),
            prestige: t('prestige'),
            collections: t('collections'),
            blackhole: t('blackhole'),
            equip: t('equip'),
            misfortune: t('misfortune'),
            motivation: t('motivation'),
            boosts: t('boosts')
        };

        const leftItems = ['base','core','prestige','collections','blackhole','equip','misfortune','motivation']
            .map(key => {
            const comp = lb.components.find(c => c.key === key) || { value: 0 };
            return `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>${labels[key]}</span>
                <span class="badge bg-primary rounded-pill">${fmt(comp.value)}</span>
                </li>
            `;
            }).join('');

        const compBoosts = lb.components.find(c => c.key === 'boosts') || { value: 0, mult: 1, list: [] };
        const boostLines = (compBoosts.list || [])
            .map(b => `<div class="small text-info">${b.name || b.id}: ${fmt(b.value)}</div>`)
            .join('') || `<div class="text-muted small">${t('noBoosts')}</div>`;

        const multBadge = compBoosts.mult && compBoosts.mult !== 1
            ? `<span class="badge bg-warning text-dark ms-2">×${compBoosts.mult.toFixed(2)}</span>` : '';

        // Глобальный множитель удачи от активных ивентов (если есть)
        const eventLine = (lb.eventMultiplier && lb.eventMultiplier !== 1)
            ? `<div class="small text-warning">${t('event')}: ×${lb.eventMultiplier.toFixed(2)}</div>`
            : '';

        box.innerHTML = `
            <div class="card bg-dark-subtle">
            <div class="card-body">
                <h4>${t('title')}</h4>
                <div class="row">
                <div class="col-md-6">
                    <ul class="list-group">${leftItems}</ul>
                </div>
                <div class="col-md-6">
                    <div class="mb-2">
                    <strong>${t('boosts')}</strong> ${multBadge}
                    </div>
                    ${boostLines}
                    ${eventLine}
                    <hr class="my-2">
                    <div class="d-flex justify-content-between">
                    <span><strong>${t('total')}</strong></span>
                    <span class="badge bg-success rounded-pill">${lb.total.toFixed(3)}</span>
                    </div>
                </div>
                </div>
            </div>
            </div>
        `;
        }

    // --- Очередь модалки "Новая карта" ---
    function showNewCard(rollResult) {
        newCardQueue.push(rollResult);
        processNewCardQueue();
    }

    function processNewCardQueue() {
        if (isShowingNewCard || newCardQueue.length === 0) return;

        isShowingNewCard = true;
        const result = newCardQueue.shift();

        newCardModalImage.src = thumbOf(result.card.image);
        newCardModalName.textContent = result.card.name;
        newCardModalRarity.textContent = `${L.get('ui.rarity')}: ${result.rarity.name}`;
        newCardModalRarity.style.color = result.rarity.color;

        newCardModal.show();

        clearTimeout(newCardDismissTimer);
        newCardDismissTimer = setTimeout(() => {
            console.log("Auto-dismissing new card modal.");
            newCardModal.hide();
        }, 60000);

        const modalEl = document.getElementById('newCardModal');
        modalEl.addEventListener('hidden.bs.modal', () => {
            isShowingNewCard = false;
            clearTimeout(newCardDismissTimer);
            processNewCardQueue();
        }, { once: true });
    }

    // --- Громкость/музыка ---
    function handleVolumeChange(event) {
        const volume = parseFloat(event.target.value);
        if (backgroundMusicElement) {
            backgroundMusicElement.volume = volume;
        }
        if (musicVolumeLabel) {
            musicVolumeLabel.textContent = `${Math.round(volume * 100)}%`;
        }
        Game.setMusicVolume(volume);

        // Управление "ручной паузой" для VisualEffects
        if (backgroundMusicElement) {
            if (volume === 0) {
                backgroundMusicElement.wasManuallyPaused = true;
                backgroundMusicElement.pause();
            } else {
                backgroundMusicElement.wasManuallyPaused = false;
                if (backgroundMusicElement.paused && backgroundMusicElement.currentSrc && backgroundMusicElement.src !== window.location.href) {
                    backgroundMusicElement.play().catch(e => console.warn("Volume change play failed:", e));
                }
            }
        }
    }

    // --- Авторолл ---
    function toggleAutoroll() {
        const pd = Game.getPlayerData();
        isAutorolling = !isAutorolling;
        autorollButton.textContent = L.get(isAutorolling ? 'ui.stopAutoroll' : 'ui.autoroll');
        autorollButton.classList.toggle('btn-success', !isAutorolling);
        autorollButton.classList.toggle('btn-danger', isAutorolling);

        if (isAutorolling) {
            console.log("Autoroll STARTED");
            rollButton.disabled = true;
            multiRollButton.disabled = true;
            performNextAutoroll();
        } else {
            console.log("Autoroll STOPPED");
            clearTimeout(autorollTimer);
            autorollTimer = null;
            rollButton.disabled = false;
            multiRollButton.disabled = !hasAnyMulti(pd);
        }
    }

    function startAutoroll() {
        isAutorolling = true;
        autorollButton.textContent = L.get('ui.stopAutoroll');
        autorollButton.classList.remove('btn-success');
        autorollButton.classList.add('btn-danger');
        rollButton.disabled = true;
        multiRollButton.disabled = true;
        console.log("Autoroll STARTED");
        performNextAutoroll();
    }

    function stopAutoroll() {
        isAutorolling = false;
        if (autorollTimer) {
            clearTimeout(autorollTimer);
            autorollTimer = null;
        }
        autorollButton.textContent = L.get('ui.autoroll');
        autorollButton.classList.remove('btn-danger');
        autorollButton.classList.add('btn-success');
        if (!isRolling) {
            rollButton.disabled = false;
            const pd = Game.getPlayerData();
            if (pd && hasAnyMulti(pd)) multiRollButton.disabled = false;
        }
        console.log("Autoroll STOPPED");
    }

    function performNextAutoroll() {
        if (!isAutorolling || isRolling) return;

        clearTimeout(autorollTimer);
        autorollTimer = null;

        const playerData = Game.getPlayerData();
        if (playerData.purchasedUpgrades.multiRollX10 || playerData.purchasedUpgrades.multiRollX5) {
            handleMultiRollButtonClick(true);
        } else {
            handleRollButtonClick(true);
        }
    }

    // Обертки для ручных кликов
    function handleManualRoll() {
        handleRollButtonClick(false);
    }
    function handleManualMultiRoll() {
        handleMultiRollButtonClick(false);
    }

    // --- Общий апдейт UI ---
    function updateAll(playerData) {
        if (!playerData) return;

        playerIdDisplay && (playerIdDisplay.value = playerData.playerId || '');
        updateMultiRollButtonText(playerData);
        updateCurrencyDisplay(playerData.currency);
        updateLuckDisplay();
        updateActiveBoostsDisplay();
        renderEventBanner();
        renderActiveEffectWidget();
        renderInventory(playerData);
        renderShop();
        renderRebirthSection();
        updateEquippedItemsDisplay(playerData.equippedItems);
        toggleMultiRollButton(hasAnyMulti(playerData));
        renderMaterials(playerData);
        renderOwnedEquipment(playerData);
        renderWorkshop(playerData);

        if (typeof playerData.luckyRollCounter !== 'undefined') {
            const currentThreshold = playerData.luckyRollThreshold || 11;
            updateLuckyRollDisplay(playerData.luckyRollCounter, currentThreshold);
        }
        if (playerData.stats) {
            renderStats(playerData);
        }
        if (notificationsToggle) {
            notificationsToggle.checked = playerData.notificationsEnabled !== false;
        }
        if (specialContentToggle) {
            specialContentToggle.checked = playerData.specialContentEnabled;
        }
    }

    // --- Виджет активного механического эффекта (шапка) ---
    // Показывает, какой эффект «надет» сейчас, и позволяет переключить
    // его в один клик (важно: джекпот стоит 5💎 с каждого ролла).
    function injectEffectWidget() {
        const statsRow = document.querySelector('.player-stats');
        if (!statsRow || document.getElementById('activeEffectWidget')) return;

        const widget = document.createElement('div');
        widget.id = 'activeEffectWidget';
        widget.className = 'effect-widget';
        widget.title = L.get('ui.effectWidget.title');
        widget.innerHTML = `<span id="activeEffectContent"></span>
            <div id="activeEffectMenu" class="effect-widget-menu d-none"></div>`;
        statsRow.appendChild(widget);

        widget.addEventListener('click', (e) => {
            e.stopPropagation();
            const menu = document.getElementById('activeEffectMenu');
            menu.classList.toggle('d-none');
            if (!menu.classList.contains('d-none')) {
                renderActiveEffectMenu();
            }
        });
        document.addEventListener('click', () => {
            const menu = document.getElementById('activeEffectMenu');
            menu && menu.classList.add('d-none');
        });
    }

    function renderActiveEffectMenu() {
        const menu = document.getElementById('activeEffectMenu');
        if (!menu) return;
        const playerData = Game.getPlayerData();
        const owned = RARITIES_DATA.filter(r => r.mechanicalEffect && playerData.inventory.includes(r.id));

        menu.innerHTML = '';
        const makeItem = (label, id, thumb) => {
            const item = document.createElement('div');
            item.className = 'effect-menu-item';
            if (thumb) {
                item.innerHTML = `<img src="${thumb}" alt="">`;
            }
            const span = document.createElement('span');
            span.textContent = label;
            item.appendChild(span);
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                menu.classList.add('d-none');
                Game.setActiveMechanicalEffect(id); // null = снять
            });
            menu.appendChild(item);
        };
        makeItem(L.get('ui.effectWidget.nothing'), null);
        owned.forEach(r => {
            const name = L.get(r.card.nameKey) || r.id;
            makeItem(name, r.id, thumbOf(r.card.image));
        });
    }

    function renderActiveEffectWidget() {
        const widget = document.getElementById('activeEffectWidget');
        const content = document.getElementById('activeEffectContent');
        if (!widget || !content) return;
        const playerData = Game.getPlayerData();
        const activeId = playerData.activeMechanicalEffect;
        const activeData = activeId ? getRarityDataById(activeId, playerData) : null;

        widget.classList.toggle('effect-widget-active', !!activeData);
        if (activeData) {
            widget.style.borderColor = activeData.color || '';
            widget.style.boxShadow = `0 0 8px ${activeData.glowColor || 'transparent'}`;
            const typeName = L.get(`ui.effectWidget.types.${activeData.mechanicalEffect.type}`);
            let cost = '';
            if (activeData.mechanicalEffect.type === 'high_risk_high_reward' && activeData.mechanicalEffect.rollCost > 0) {
                cost = ` <span class="effect-jackpot-cost">${L.get('ui.effectWidget.jackpotCost').replace('{cost}', activeData.mechanicalEffect.rollCost)}</span>`;
            }
            content.innerHTML = `⚙️ ${L.get(activeData.card.nameKey) || activeId} · ${typeName}${cost}`;
        } else {
            widget.style.borderColor = '';
            widget.style.boxShadow = '';
            content.textContent = `⚙️ ${L.get('ui.effectWidget.none')}`;
        }
    }

    // Лёгкое обновление для авторолла/AFK-догона: только то, что видно постоянно
    // (валюта, удача, бусты, баннер, lucky roll, инвентарь) + открытая вкладка.
    function updateHud(playerData) {
        if (!playerData) return;

        playerIdDisplay && (playerIdDisplay.value = playerData.playerId || '');
        updateCurrencyDisplay(playerData.currency);
        updateLuckDisplay();
        updateActiveBoostsDisplay();
        renderEventBanner();
        renderActiveEffectWidget();
        renderInventory(playerData);

        if (typeof playerData.luckyRollCounter !== 'undefined') {
            const currentThreshold = playerData.luckyRollThreshold || 11;
            updateLuckyRollDisplay(playerData.luckyRollCounter, currentThreshold);
        }

        renderVisibleExpensiveTabs(playerData);
    }

    // Тяжёлые вкладки (магазин, мастерская, рюкзак, статы, ребирт) рендерим
    // только если они сейчас открыты — иначе авторолл их зря перерисовывает.
    function renderVisibleExpensiveTabs(playerData) {
        const activeLink = document.querySelector('#mainTabs .nav-link.active');
        const target = activeLink && activeLink.getAttribute('data-bs-target');
        const id = target ? target.replace('#', '') : null;
        if (!id) return;

        if (id === 'shop') {
            renderShop();
            updateEquippedItemsDisplay(playerData.equippedItems);
        } else if (id === 'workshop') {
            renderWorkshop(playerData);
        } else if (id === 'backpack') {
            renderMaterials(playerData);
            renderOwnedEquipment(playerData);
        } else if (id === 'stats') {
            renderStats(playerData);
        } else if (id === 'rebirth') {
            renderRebirthSection();
        }
    }

    // --- Баннер событий (все активные ивенты) ---
    function renderEventBanner() {
        if (!eventBanner) return;
        const activeEvents = (typeof Game.getActiveEvents === 'function')
            ? Game.getActiveEvents()
            : (Game.getActiveEvent() ? [Game.getActiveEvent()] : []);

        if (activeEvents.length > 0) {
            eventBanner.innerHTML = activeEvents.map(activeEvent => {
                const endDate = new Date(activeEvent.endDate);
                const now = new Date();
                const timeLeft = endDate - now;

                let timerHtml = '';
                if (timeLeft > 0) {
                    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const dSuffix = L.get('ui.timeShort.days');
                    const hSuffix = L.get('ui.timeShort.hours');
                    timerHtml = `<small class="d-block">${L.get('events.timeLeft')}: ${days}${dSuffix} ${hours}${hSuffix}</small>`;
                }

                const extraClass = activeEvent.bannerClass || '';

                return `
                <div class="alert alert-info ${extraClass}" role="alert">
                    <h5 class="alert-heading">🎉 ${L.get(activeEvent.nameKey)}</h5>
                    <p>${L.get(activeEvent.descriptionKey)}</p>
                    ${timerHtml}
                </div>
            `;
            }).join('');
            eventBanner.style.display = 'block';
        } else {
            eventBanner.innerHTML = '';
            eventBanner.style.display = 'none';
        }
    }

    // --- Достижения/темы ---
    function renderAchievements() {
        if (!achievementsContainer) return;
        const playerData = Game.getPlayerData();
        const achievementsTabButton = document.getElementById('achievements-tab');
        let hasNewAchievement = false;

        // Достижения
        let achievementsHtml = `<h3 data-i18n="ui.achievements.title">${L.get('ui.achievements.title')}</h3><div class="list-group mb-4">`;
        for (const achId in ACHIEVEMENTS_DATA) {
            const achData = ACHIEVEMENTS_DATA[achId];
            const isCompleted = playerData.completedAchievements.includes(achId);
            const isSeen = playerData.seenAchievements.includes(achId);
            if (isCompleted && !isSeen) hasNewAchievement = true;

            achievementsHtml += `
                <div class="list-group-item ${isCompleted ? 'bg-success-subtle' : 'bg-dark-subtle'} ${isCompleted && !isSeen ? 'new-version' : ''}">
                    <strong>${L.get(achData.nameKey)}</strong>
                    <small class="d-block text-muted">${L.get(achData.descriptionKey)}</small>
                </div>
            `;
        }
        achievementsHtml += `</div>`;

        // Коллекции
        let collectionsHtml = `<h3 data-i18n="ui.achievements.collectionsTitle">${L.get('ui.achievements.collectionsTitle')}</h3><div class="list-group mb-4">`;
        for (const colId in COLLECTIONS_DATA) {
            const colData = COLLECTIONS_DATA[colId];
            const isCompleted = playerData.completedAchievements.includes(colId);
            const collectedCount = colData.cardIds.filter(id => playerData.inventory.includes(id)).length;

            // Пассивный бонус за полную коллекцию (активен после сбора)
            let bonusLine = '';
            const pe = colData.passiveEffect;
            if (pe) {
                const bonusKeyMap = {
                    luck_flat: 'luck',
                    duplicate_currency_bonus_percent: 'duplicates',
                    variant_chance_bonus: 'mutations',
                    material_drop_bonus_percent: 'materials'
                };
                const v = (pe.type === 'luck_flat') ? pe.value.toFixed(2) : Math.round(pe.value * 100) + '%';
                const bonusText = (L.get(`ui.collectionBonus.${bonusKeyMap[pe.type]}`) || '').replace('{v}', v);
                if (bonusText) {
                    bonusLine = `<small class="d-block mt-1 ${isCompleted ? 'text-success' : 'text-muted'}">${L.get('ui.achievements.collectionBonus')} ${bonusText}${isCompleted ? ' ✓' : ''}</small>`;
                }
            }

            collectionsHtml += `
                <div class="list-group-item ${isCompleted ? 'bg-success-subtle' : 'bg-dark-subtle'}">
                    <strong>${L.get(colData.nameKey)} (${collectedCount}/${colData.cardIds.length})</strong>
                    <small class="d-block text-muted">${L.get(colData.descriptionKey)}</small>
                    <small class="d-block text-info-emphasis mt-1">${L.get('ui.achievements.reward')}: ${L.get(colData.reward.nameKey)}</small>
                    ${bonusLine}
                </div>
            `;
        }
        collectionsHtml += `</div>`;

        // Темы
        let themesHtml = `<h3 data-i18n="ui.achievements.themesTitle">${L.get('ui.achievements.themesTitle')}</h3><div class="btn-group" role="group">`;
        playerData.unlockedThemes.forEach(themeId => {
            const isActive = playerData.activeTheme === themeId;
            themesHtml += `
                <button type="button" class="btn ${isActive ? 'btn-primary' : 'btn-outline-secondary'} theme-switcher-btn" data-theme-id="${themeId}">
                    ${L.get(`ui.themes.${themeId}`)}
                </button>
            `;
        });
        themesHtml += `</div>`;

        achievementsContainer.innerHTML = achievementsHtml + collectionsHtml + themesHtml;

        achievementsContainer.querySelectorAll('.theme-switcher-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                Game.setActiveTheme(e.currentTarget.dataset.themeId);
                renderAchievements();
            });
        });

        achievementsTabButton?.classList.toggle('new-version', hasNewAchievement);

        // Помечаем все выполненные как просмотренные
        playerData.completedAchievements.forEach(achId => {
            if (!playerData.seenAchievements.includes(achId)) {
                playerData.seenAchievements.push(achId);
            }
        });
        Game.saveGame();
    }

    // --- Темы ---
    function applyTheme(themeId) {
        if (!htmlRoot) return;
        htmlRoot.className = '';
        htmlRoot.classList.add(themeId || 'default');
    }

    // --- Общие апдейты ---
    function updateCurrencyDisplay(currency) {
        currencyDisplay && (currencyDisplay.textContent = formatNumber(currency));
    }

    function updateLuckDisplay() {
        if (!luckDisplay) return;
        // Показываем ту же удачу, что и в логике (3 знака)
        luckDisplay.textContent = Game.calculateCurrentLuck().toFixed(3);
    }

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

    function formatNumber(n, decimals = 2) {
        if (!Number.isFinite(n)) return '∞';
        const abs = Math.abs(n);
        const units = [
            { v: 1e36, s: 'Ud' }, { v: 1e33, s: 'Dc' }, { v: 1e30, s: 'No' },
            { v: 1e27, s: 'Oc' }, { v: 1e24, s: 'Sp' }, { v: 1e21, s: 'Sx' },
            { v: 1e18, s: 'Qi' }, { v: 1e15, s: 'Qa' }, { v: 1e12, s: 'T'  },
            { v: 1e9,  s: 'B'  }, { v: 1e6,  s: 'M'  }, { v: 1e3,  s: 'K'  }
        ];
        for (const u of units) if (abs >= u.v) return (n / u.v).toFixed(decimals) + u.s;
        return n.toLocaleString();
    }

    // --- Уведомления ---
    function showNotification(message, type = 'info', duration = 4000) {
        const playerData = Game.getPlayerData();
        if (playerData.notificationsEnabled === false) return;

        let container = document.getElementById('notificationsContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notificationsContainer';
            Object.assign(container.style, {
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: '1060',
                width: 'auto',
                maxWidth: '350px'
            });
            document.body.appendChild(container);
        }

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show mb-2`;
        alertDiv.setAttribute('role', 'alert');
        alertDiv.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
        container.appendChild(alertDiv);
        setTimeout(() => bootstrap.Alert.getOrCreateInstance(alertDiv)?.close(), duration);
    }

    function showMutationToasts(results) {
        const muts = window.MUTATIONS || {};
        const sym  = { negative: 'N', gold: '⭐', voided: '◼️' };
        const nameOf = vid => (muts[vid] ? L.get(muts[vid].nameKey) : vid.toUpperCase());

        const ids = results.map(r => r.variantId).filter(Boolean);
        if (ids.length === 0) return;

        // одиночный ролл
        if (results.length === 1) {
            const v = ids[0];
            const card = results[0].card?.name || '';
            const variantName = nameOf(v);
            const base = (L.get('notifications.mutation_single') || 'Мутация: {variant} на карте «{card}»!')
            .replace('{variant}', variantName)
            .replace('{card}', card);
            const extra = L.get(`notifications.mutation.${v}`) || '';
            const msg = `${sym[v] || '•'} ${base}${extra ? `<br><small>${extra}</small>` : ''}`;
            // GOLD — success, остальные — info
            showNotification(msg, v === 'gold' ? 'success' : 'info', 6000);
            return;
        }

        // мульти-ролл
        const counts = ids.reduce((acc, v) => (acc[v] = (acc[v] || 0) + 1, acc), {});
        const order  = { gold: 1, voided: 2, negative: 3 };
        const parts  = Object.keys(counts)
            .sort((a,b) => (order[a] || 99) - (order[b] || 99))
            .map(v => `${sym[v] || '•'}×${counts[v]}`);
        const list = parts.join(' · ');
        const base = (L.get('notifications.mutation_multi') || 'Мутации в ролле: {list}')
            .replace('{list}', list);
        showNotification(base, 'info', 6000);
        }

    // --- Активные бусты ---
    function updateActiveBoostsDisplay() {
        if (!activeBoostsDisplay) return;
        const playerData = Game.getPlayerData();
        const activeBoosts = playerData.activeBoosts || [];

        if (activeBoosts.length > 0) {
            const boostsHTML = activeBoosts.map(boost => {
                const timeLeft = Math.max(0, Math.round((boost.endTime - Date.now()) / 1000));
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds;
                return `<span class="badge bg-success me-1">${boost.name}: ${minutes}:${paddedSeconds}</span>`;
            }).join('');
            activeBoostsDisplay.innerHTML = `${L.get('ui.activeBoosts')}: ${boostsHTML}`;

            if (!boostTimerInterval) {
                boostTimerInterval = setInterval(updateActiveBoostsDisplay, 1000);
            }
        } else {
            activeBoostsDisplay.innerHTML = '';
            if (boostTimerInterval) {
                clearInterval(boostTimerInterval);
                boostTimerInterval = null;
            }
        }
    }

    function updateMultiRollButtonText(playerData) {
        if (!multiRollButton) return;
        if (playerData.purchasedUpgrades.multiRollX10) {
            multiRollButton.textContent = "Multi-Roll x10";
        } else if (playerData.purchasedUpgrades.multiRollX5) {
            multiRollButton.textContent = "Multi-Roll x5";
        }
    }

    function renderRebirthSection() {
        const rebirthSection = document.getElementById('rebirth');
        if (!rebirthSection) return;

        const playerData = Game.getPlayerData();
        const nextCost = Game.getRebirthCost();
        const canAfford = playerData.currency >= nextCost;

        // Только коллекционные (без purchased_ и garbage)
        const uniqueCardsCount = new Set(playerData.inventory.filter(id => id !== 'garbage' && !id.startsWith('purchased_'))).size;

        const currentBonus = Game.calculateRebirthBonus(playerData);
        const futurePlayerData = { ...playerData, prestigeLevel: playerData.prestigeLevel + 1 };
        const futureBonus = Game.calculateRebirthBonus(futurePlayerData);
        const potentialBonus = (futureBonus - currentBonus).toFixed(3);

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
                            <span class="d-block small">${formatNumber(nextCost)} 💎</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('rebirthButton')?.addEventListener('click', Game.performRebirth);
    }

    // --- Анимация ролла ---
    function startRollAnimation(slotElement, targetRarity, onCompleteCallback, meta = {}) {
        let animationTimeouts = [];
        const playerData = Game.getPlayerData();
        const isFastRollActive = !!playerData.purchasedUpgrades.fastRoll;

        const clearMyTimeouts = () => {
            animationTimeouts.forEach(clearTimeout);
            animationTimeouts = [];
            const parentWrapper = slotElement.parentNode;
            if (parentWrapper) {
                const indicators = parentWrapper.querySelectorAll('.slot-upgrade-indicator');
                indicators.forEach(indicator => indicator.remove());
            }
            slotElement.dataset.animationActive = 'false';
        };

        if (slotElement.dataset.animationActive === 'true' && slotElement.clearPreviousAnimation) {
            slotElement.clearPreviousAnimation();
        }
        slotElement.clearPreviousAnimation = clearMyTimeouts;
        slotElement.dataset.animationActive = 'true';

        let baseTickDuration = isFastRollActive ? 15 : 30;
        let minTickDuration = isFastRollActive ? 100 : 250;
        let accelerationTicks = isFastRollActive ? 8 : 20;
        let decelerationTicks = isFastRollActive ? 6 : 15;

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
                // Завершение
                rarityToShow = targetRarity;
                if (rarityToShow.id === 'error') {
                    slotElement.dataset.text = rarityToShow.name;
                } else {
                    delete slotElement.dataset.text;
                }
                slotElement.textContent = rarityToShow.name;
                slotElement.classList.add(rarityToShow.cssClass);
                slotElement.classList.add('landed');

                const isMultiRoll = slotElement.closest('#multiRollSlotsContainer');
                if (isMultiRoll) {
                    if (meta.wasUpgraded && meta.originalRarityId) {
                        const originalRarityData = getRarityDataById(meta.originalRarityId, playerData);
                        if (originalRarityData) {
                            const indicator = document.createElement('div');
                            indicator.className = 'slot-upgrade-indicator';
                            indicator.innerHTML = `<span>${L.get(originalRarityData.nameKey)}</span> <span class="arrow">→</span>`;
                            slotElement.parentNode.insertBefore(indicator, slotElement);
                        }
                    }
                    if (meta.jackpotTriggered) {
                        const indicator = document.createElement('div');
                        indicator.className = 'slot-upgrade-indicator jackpot-indicator';
                        indicator.innerHTML = `🍀 JACKPOT! 🍀`;
                        slotElement.parentNode.insertBefore(indicator, slotElement);
                    }
                }

            //    console.log(`--- Roll Animation End (Flash) --- (Landed: ${targetRarity.name})`);
                slotElement.dataset.animationActive = 'false';
                slotElement.clearPreviousAnimation = null;
                onCompleteCallback && onCompleteCallback();
                return;
            }

            if (rarityToShow.id === 'error') {
                slotElement.dataset.text = rarityToShow.name;
            } else {
                delete slotElement.dataset.text;
            }
            slotElement.textContent = rarityToShow.name;
            slotElement.classList.add(rarityToShow.cssClass);
            currentTick++;
            const timeoutId = setTimeout(animateTick, currentTickDuration);
            animationTimeouts.push(timeoutId);
        }
    //    console.log(`--- Roll Animation Start (Flash) --- (Target: ${targetRarity.name}, FastRoll: ${isFastRollActive})`);
        animateTick();
        return clearMyTimeouts;
    }

    function getRandomRarityFull() {
        const randIndex = Math.floor(Math.random() * RARITIES_DATA.length);
        return RARITIES_DATA[randIndex];
    }
    function getRandomRarityNearFull(targetRarity) {
        const targetIdx = RARITIES_DATA.findIndex(r => r.id === targetRarity.id);
        if (targetIdx === -1) return getRandomRarityFull();
        const numRarities = RARITIES_DATA.length;
        let offset;
        do { offset = Math.floor(Math.random() * 5) - 2; } while (offset === 0 && Math.random() < 0.7);
        let newIndex = (targetIdx + offset + numRarities) % numRarities;
        return RARITIES_DATA[newIndex];
    }
    function getRandomRarity() {
        const r = getRandomRarityFull();
        return { id: r.id, name: L.get(r.nameKey), cssClass: r.cssClass };
    }
    function getRandomRarityNear(targetRarity) {
        const r = getRandomRarityNearFull(targetRarity);
        return { id: r.id, name: L.get(r.nameKey), cssClass: r.cssClass };
    }

    function setButtonsDisabled(disabled, isCalledByAutoroll) {
        rollButton && (rollButton.disabled = disabled);
        multiRollButton && (multiRollButton.disabled = disabled);
        if (!isCalledByAutoroll && !isAutorolling) {
            autorollButton && (autorollButton.disabled = disabled);
        }
    }

    function onRollsCompleted(results, isCalledByAutoroll) {
        isRolling = false;
        lastRollTimestamp = Date.now();

        if (!isAutorolling) {
            setButtonsDisabled(false, false);
            const pd = Game.getPlayerData();
            if (pd) {
                multiRollButton && (multiRollButton.disabled = !hasAnyMulti(pd));
            }
        }

        if (results.length === 1) {
            displayRollResult(results[0]);
        } else if (results.length > 1) {
            Game.processMultiRollResult(results);
            displayMultiRollSummary(results);
        }

        results.forEach(result => {
            if (result.isNew) {
                showNewCard(result);
            }
        });

        showMutationToasts(results);

        // Авторолл: обновляем только HUD (валюту, удачу, инвентарь, видимые вкладки).
        // Полный updateAll на каждый тик перерисовывал ВСЕ вкладки (магазин, мастерская,
        // рюкзак, ребирт, статы) — при AFK-догоне это был главный источник фриза.
        if (isAutorolling) {
            updateHud(Game.getPlayerData());
        } else {
            updateAll(Game.getPlayerData());
        }

        if (isAutorolling && isTabActive) {
            clearTimeout(autorollTimer);
            autorollTimer = setTimeout(performNextAutoroll, AUTOROLL_BREATHING_ROOM);
        }
    }

    function handleRollButtonClick(isCalledByAutoroll = false) {
        if (isRolling) return;

        setButtonsDisabled(true, isCalledByAutoroll);

        const rollResult = Game.performRoll();
        if (!rollResult) {
            setButtonsDisabled(false, isCalledByAutoroll);
            const pd = Game.getPlayerData();
            if (pd) toggleMultiRollButton(hasAnyMulti(pd));
            return;
        }

        isRolling = true;
        rollResultContainer.innerHTML = '';

        // Очистить стрелочки/индикаторы в одиночном слоте
        const singleSlotWrapper = rollAnimationContainer.querySelector('.single-roll-slot-wrapper');
        if (singleSlotWrapper) {
            const indicators = singleSlotWrapper.querySelectorAll('.slot-upgrade-indicator');
            indicators.forEach(indicator => indicator.remove());
        }

        if (activeSingleRollClearCallback) activeSingleRollClearCallback();

        rollAnimationContainer.querySelector('.single-roll-slot-wrapper').classList.remove('d-none');
        multiRollSlotsContainer.classList.add('d-none');

        activeSingleRollClearCallback = startRollAnimation(rollSlot, rollResult.rarity, () => {
            activeSingleRollClearCallback = null;
            onRollsCompleted([rollResult], isCalledByAutoroll);
        });
    }

    function handleMultiRollButtonClick(isCalledByAutoroll = false) {
        if (isRolling) return;
        const playerData = Game.getPlayerData();
        setButtonsDisabled(true, isCalledByAutoroll);

        const numRolls = playerData.purchasedUpgrades.multiRollX10 ? 10 : 5;
        const allRollResults = [];

        for (let i = 0; i < numRolls; i++) {
            const rollResult = Game.performRoll();
            if (!rollResult) {
                console.log(`Multi-roll stopped at attempt ${i + 1} due to insufficient funds.`);
                break;
            }
            allRollResults.push(rollResult);
        }

        if (allRollResults.length === 0) {
            setButtonsDisabled(false, isCalledByAutoroll);
            const pd = Game.getPlayerData();
            if (pd) toggleMultiRollButton(hasAnyMulti(pd));
            return;
        }

        isRolling = true;
        rollResultContainer.innerHTML = '';

        // Очищаем прошлые коллбеки
        activeMultiRollCallbacks.forEach(cb => cb && cb());
        activeMultiRollCallbacks = [];

        multiRollSlotsContainer.classList.remove('d-none');
        multiRollSlotsContainer.innerHTML = '';
        rollAnimationContainer.querySelector('.single-roll-slot-wrapper').classList.add('d-none');

        let completedAnimations = 0;

        for (const result of allRollResults) {
            const slotWrapper = document.createElement('div');
            slotWrapper.className = 'multi-roll-slot-wrapper';
            const slot = document.createElement('div');
            slot.className = 'roll-slot';
            slotWrapper.appendChild(slot);
            multiRollSlotsContainer.appendChild(slotWrapper);

            const clearCb = startRollAnimation(slot, result.rarity, () => {
                completedAnimations++;
                if (completedAnimations === allRollResults.length) {
                    onRollsCompleted(allRollResults, isCalledByAutoroll);
                }
            }, result.meta);

            activeMultiRollCallbacks.push(clearCb);
        }
    }

    function displayRollResult(rollResult) {
        rollResultContainer.innerHTML = '';
        const cardWrapper = document.createElement('div');
        cardWrapper.className = 'received-card-animation-wrapper';
        const cardElement = document.createElement('div');
        cardElement.className = 'received-card';
        cardElement.style.backgroundImage = `url('${thumbOf(rollResult.card.image)}')`;
        cardElement.style.borderColor = rollResult.rarity.color;
        cardElement.style.setProperty('--rarity-glow-color', rollResult.rarity.glowColor);
        cardElement.setAttribute('title', `${L.get('ui.rarity')}: ${rollResult.rarity.name}`);
        const nameElement = document.createElement('h3');
        nameElement.className = 'received-card-name';
        nameElement.textContent = `${L.get('ui.youGot')}: ${rollResult.card.name}!`;
        if (rollResult.isNew) nameElement.innerHTML += ` <span class="badge bg-warning">${L.get('ui.isNew')}</span>`;

        cardWrapper.appendChild(cardElement);
        rollResultContainer.appendChild(cardWrapper);
        rollResultContainer.appendChild(nameElement);

        const playerData = Game.getPlayerData();

        if (rollResult.meta?.wasUpgraded && rollResult.meta?.originalRarityId) {
            const originalRarityData = getRarityDataById(rollResult.meta.originalRarityId, playerData);
            if (originalRarityData) {
                const upgradeIndicator = document.createElement('div');
                upgradeIndicator.className = 'upgrade-indicator';
                upgradeIndicator.innerHTML = `
                    <span class="badge" style="background-color:${originalRarityData.color}">${L.get(originalRarityData.nameKey)}</span>
                    <span class="arrow">→</span>
                    <span class="badge" style="background-color:${rollResult.rarity.color}">${rollResult.rarity.name}</span>
                `;
                rollResultContainer.appendChild(upgradeIndicator);
            }
        }

        if (rollResult.meta?.jackpotTriggered) {
            const jackpotIndicator = document.createElement('div');
            jackpotIndicator.className = 'upgrade-indicator text-warning';
            jackpotIndicator.innerHTML = `🍀 JACKPOT! 🍀`;
            rollResultContainer.appendChild(jackpotIndicator);
        }

        if (rollResult.duplicateReward > 0) {
            const rewardText = document.createElement('p');
            rewardText.className = 'duplicate-reward-text';
            rewardText.innerHTML = `${L.get('ui.duplicateReward')}: <span class="currency-icon">💎</span>${formatNumber(rollResult.duplicateReward)}`;
            rollResultContainer.appendChild(rewardText);
        }
    }

    function displayMultiRollSummary(allRollResults) {
        let totalCurrency = allRollResults.reduce((sum, res) => sum + res.duplicateReward, 0);
        if (totalCurrency > 0) {
            const summaryText = document.createElement('p');
            summaryText.className = 'text-center mt-3';
            summaryText.innerHTML = `${L.get('ui.totalDuplicateReward')}: <span class="currency-icon">💎</span>${formatNumber(totalCurrency)}`;
            rollResultContainer.appendChild(summaryText);
        }

        const multiResultsDisplay = document.createElement('div');
        multiResultsDisplay.className = 'd-flex flex-wrap justify-content-center gap-2 mt-3';
        allRollResults.forEach(result => {
            const cardMini = document.createElement('div');
            cardMini.style.textAlign = 'center';
            const img = document.createElement('img');
            Object.assign(img, { src: thumbOf(result.card.image), alt: result.card.name });
            Object.assign(img.style, { width: '60px', aspectRatio: '1024 / 1360', border: `2px solid ${result.rarity.color}`, borderRadius: '4px' });
            cardMini.appendChild(img);
            const nameP = document.createElement('p');
            nameP.textContent = result.card.name;
            nameP.className = 'small mb-0';
            cardMini.appendChild(nameP);
            if (result.duplicateReward > 0) {
                const rewardP = document.createElement('p');
                rewardP.innerHTML = `+💎${formatNumber(result.duplicateReward)}`;
                rewardP.className = 'small text-warning';
                cardMini.appendChild(rewardP);
            }
            multiResultsDisplay.appendChild(cardMini);
        });
        rollResultContainer.appendChild(multiResultsDisplay);
    }

    
    // --- Инвентарь ---
    function renderInventory(playerData) {
        if (!inventoryGrid || !inventoryCounterElement) return;

        // 1. Подготовка данных и сортировка (как раньше)
        const sortOrder = localStorage.getItem('inventorySortOrder') || 'rarity_desc';
        if (inventorySortSelect) inventorySortSelect.value = sortOrder;

        const availableRarities = RARITIES_DATA.filter(r =>
            Game.isCardAvailableNow(r, playerData) || playerData.inventory.includes(r.id)
        );

        let sortedRarities = [...availableRarities];

        switch (sortOrder) {
            case 'rarity_asc':
                sortedRarities.sort((a, b) => (a.probabilityBase ?? 1) - (b.probabilityBase ?? 1));
                break;
            case 'name_asc':
                sortedRarities.sort((a, b) => L.get(a.card.nameKey).localeCompare(L.get(b.card.nameKey), L.getCurrentLanguage()));
                break;
            case 'rarity_desc':
            default:
                sortedRarities.sort((a, b) => (b.probabilityBase ?? 1) - (a.probabilityBase ?? 1));
                break;
        }

        // 2. Фильтрация поиска
        const qEl = document.getElementById('inventorySearchInput');
        const query = (qEl?.value || '').trim().toLowerCase();

        const parentCards = sortedRarities.filter(r => !r.displayParentId);
        let filteredParents = !query ? parentCards : parentCards.filter(parent => {
            const versions = [parent, ...availableRarities.filter(r => r.displayParentId === parent.id)];
            return versions.some(v => {
                const name = (L.get(v.card.nameKey) || '').toLowerCase();
                const rname = (L.get(v.nameKey) || '').toLowerCase();
                return name.includes(query) || rname.includes(query);
            });
        });

        // 2.5. Фильтры (чипы + редкость) — на уровне семьи, AND-логика
        const invFilters = getInvFilterState();
        if (isAnyInvFilterActive(invFilters)) {
            filteredParents = filteredParents.filter(parent => {
                const versions = [parent, ...availableRarities.filter(r => r.displayParentId === parent.id)];
                const hasUnseen = versions.some(v => playerData.unseenCardIds.includes(v.id));

                if (invFilters.new && !hasUnseen) return false;
                if (invFilters.limited && !versions.some(v => v.availability && v.availability.type === 'event')) return false;
                if (invFilters.mutation) {
                    const ov = playerData.ownedVariants || {};
                    const hasMut = versions.some(v => {
                        const vm = ov[v.id];
                        return vm && Object.values(vm).some(cnt => cnt > 0);
                    });
                    if (!hasMut) return false;
                }
                if (invFilters.effect && !versions.some(v => v.mechanicalEffect || v.passiveEffect)) return false;
                if (invFilters.alts && versions.length < 2) return false;

                if (invFilters.rarity !== 'all') {
                    // Диапазон редкости — по активной версии семьи (показываемой карте)
                    const activeSkinId = playerData.activeSkins[parent.id] || parent.id;
                    const skinData = getRarityDataById(playerData.inventory.includes(activeSkinId) ? activeSkinId : parent.id, playerData);
                    const denom = (skinData && skinData.probabilityBase > 0) ? 1 / skinData.probabilityBase : Infinity;
                    const ok =
                        (invFilters.rarity === 'le1k'    && denom <= 1000) ||
                        (invFilters.rarity === 'k1_10'   && denom > 1000 && denom <= 10000) ||
                        (invFilters.rarity === 'k10_100' && denom > 10000 && denom <= 100000) ||
                        (invFilters.rarity === 'm100_1'  && denom > 100000 && denom <= 1000000) ||
                        (invFilters.rarity === 'm1_100'  && denom > 1000000 && denom <= 100000000) ||
                        (invFilters.rarity === 'g100'    && denom > 100000000);
                    if (!ok) return false;
                }
                return true;
            });
        }

        // 3. Создаем Map существующих элементов для быстрого доступа
        // Ключ: rarityId, Значение: DOM-элемент колонки (.col)
        const existingNodes = new Map();
        Array.from(inventoryGrid.children).forEach(col => {
            const card = col.querySelector('.inventory-card');
            if (card && card.dataset.rarityId) {
                existingNodes.set(card.dataset.rarityId, col);
            }
        });

        // 4. Проходимся по отфильтрованному списку и обновляем/создаем элементы
        filteredParents.forEach(rarityData => {
            const allCardVersions = [rarityData, ...availableRarities.filter(r => r.displayParentId === rarityData.id)];
            const openedVersions = allCardVersions.filter(v => playerData.inventory.includes(v.id));
            const isAnyVersionOpened = openedVersions.length > 0;
            const hasUnseenVersion = allCardVersions.some(v => playerData.unseenCardIds.includes(v.id));

            // Определяем активный скин и варианты
            const activeSkinId = playerData.activeSkins[rarityData.id] || rarityData.id;
            const chosenVariant = (playerData.variantView || {})[activeSkinId] || null;
            const hasChosenVariant = !!(chosenVariant && (playerData.ownedVariants || {})[activeSkinId]?.[chosenVariant] > 0);

            // Попытка найти существующий элемент
            let col = existingNodes.get(rarityData.id);
            let cardDiv, img, nameDiv, variantChip, limitedBadge, mechBadge;

            if (!col) {
                // СОЗДАНИЕ: Если элемента нет, создаем структуру
                col = document.createElement('div');
                col.className = 'col';
                
                cardDiv = document.createElement('div');
                cardDiv.className = 'inventory-card';
                cardDiv.dataset.rarityId = rarityData.id;

                img = document.createElement('img');
                img.className = 'inventory-card-image';
                
                nameDiv = document.createElement('div');
                nameDiv.className = 'inventory-card-name';

                // Создаем контейнеры для чипов сразу, скрываем их по умолчанию
                variantChip = document.createElement('div');
                variantChip.className = 'variant-chip position-absolute';
                variantChip.style.cssText = 'right:6px; top:6px; z-index:3; display:none;';
                
                limitedBadge = document.createElement('div');
                limitedBadge.className = 'badge bg-warning text-dark position-absolute m-1';
                limitedBadge.style.cssText = 'left:6px; top:6px; z-index:2; display:none;';
                limitedBadge.textContent = 'LIMITED';

                mechBadge = document.createElement('div');
                mechBadge.className = 'mech-badge position-absolute';
                mechBadge.textContent = '⚙️'; 
                mechBadge.style.cssText = 'left:6px; top:30px; z-index:4; font-size:16px; display:none; cursor:help; filter:drop-shadow(0 0 2px black);';

                cardDiv.appendChild(img);
                cardDiv.appendChild(nameDiv);
                cardDiv.appendChild(variantChip);
                cardDiv.appendChild(limitedBadge);
                cardDiv.appendChild(mechBadge);
                col.appendChild(cardDiv);
            } else {
                // ОБНОВЛЕНИЕ: Элемент есть, берем ссылки
                cardDiv = col.querySelector('.inventory-card');
                img = cardDiv.querySelector('.inventory-card-image');
                nameDiv = cardDiv.querySelector('.inventory-card-name');
                variantChip = cardDiv.querySelector('.variant-chip');
                limitedBadge = cardDiv.querySelector('.badge.bg-warning'); // LIMITED бейдж
                mechBadge = cardDiv.querySelector('.mech-badge');
                // Защита: если это старая ячейка, где бейджа еще нет - создадим
                if (!mechBadge) {
                    mechBadge = document.createElement('div');
                    mechBadge.className = 'mech-badge position-absolute';
                    mechBadge.textContent = '⚙️';
                    mechBadge.style.cssText = 'left:6px; top:30px; z-index:4; font-size:16px; display:none; cursor:help; filter:drop-shadow(0 0 2px black);';
                    cardDiv.appendChild(mechBadge);
                }
                
                // Удаляем его из Map, чтобы в конце удалить те, что остались в Map (не попали в фильтр)
                existingNodes.delete(rarityData.id);
            }

            // 5. Обновление состояния (классы, стили, контент)
            
            // Сброс классов вариантов
            cardDiv.className = 'inventory-card'; 
            if (hasChosenVariant) cardDiv.classList.add(`variant-${chosenVariant}`);
            if (hasUnseenVersion) cardDiv.classList.add('new-card');

            if (isAnyVersionOpened) {
                const activeSkinData = getRarityDataById(activeSkinId, playerData) || getRarityDataById(rarityData.id, playerData);
                
                // Проверка: обновляем src только если он изменился (избегает мерцания).
                // В гриде — миниатюра (~50 КБ), полный арт грузится только в модалке.
                const gridSrc = thumbOf(activeSkinData.card.image);
                if (img.getAttribute('src') !== gridSrc) {
                    img.src = gridSrc;
                }
                
                nameDiv.textContent = L.get(activeSkinData.card.nameKey);

                const hasMechanic = activeSkinData.mechanicalEffect || activeSkinData.passiveEffect || activeSkinData.mechanic;

                if (mechBadge) {
                    if (hasMechanic) {
                        mechBadge.style.display = 'block';
                        // Пытаемся сформировать тултип
                        let tooltip = 'Mechanic';
                        if (activeSkinData.mechanic && activeSkinData.mechanic.description) {
                            tooltip = activeSkinData.mechanic.description;
                        } else if (activeSkinData.mechanicalEffect) {
                             // Если есть ключ локализации, пробуем его, иначе тип
                             tooltip = L.get(`mechanical_effects.${activeSkinData.mechanicalEffect.type}`) || 'Active Effect';
                        } else if (activeSkinData.passiveEffect) {
                             tooltip = L.get(`passive_effects.${activeSkinData.passiveEffect.type}`) || 'Passive Effect';
                        }
                        mechBadge.title = tooltip;
                        
                        // Если есть LIMITED, сдвинем шестеренку чуть ниже, иначе вернем наверх (опциональная красота)
                        if (limitedBadge && limitedBadge.style.display !== 'none') {
                             mechBadge.style.top = '32px'; 
                        } else {
                             mechBadge.style.top = '6px';
                        }

                    } else {
                        mechBadge.style.display = 'none';
                    }
                }
                
                // Стилизация из JS (Этап 1)
                cardDiv.style.borderColor = activeSkinData.color;
                cardDiv.style.setProperty('--rarity-glow-color', activeSkinData.glowColor);
                
                // Сохраняем класс редкости для специфичных CSS оверрайдов (если есть)
                cardDiv.classList.add(`rarity-${activeSkinData.id}`);
                cardDiv.classList.remove('locked');

                // Важно: используем onclick вместо addEventListener для предотвращения дублей при ре-рендере
                const allPossibleVersions = [rarityData, ...RARITIES_DATA.filter(r => r.displayParentId === rarityData.id)];
                cardDiv.onclick = () => showCardModal(rarityData.id, allPossibleVersions);
            } else {
                cardDiv.classList.add('locked');
                cardDiv.style.borderColor = ''; // Сброс инлайн стиля
                cardDiv.style.removeProperty('--rarity-glow-color');
                if (mechBadge) mechBadge.style.display = 'none';
                const silhouetteSrc = "img/webp/silhouette_placeholder-thumb.webp";
                if (img.getAttribute('src') !== silhouetteSrc) {
                    img.src = silhouetteSrc;
                }
                nameDiv.textContent = "?????";
                cardDiv.onclick = null;
            }

            // Обновление чипов
            if (variantChip) {
                if (hasChosenVariant) {
                    const sym = { negative: 'N', gold: 'G', voided: 'V' }[chosenVariant] || '•';
                    variantChip.textContent = sym;
                    variantChip.style.display = 'flex'; // variant-chip имеет display:inline-flex в CSS
                } else {
                    variantChip.style.display = 'none';
                }
            }

            // Обновление LIMITED бейджа
            if (limitedBadge) {
                if (rarityData.availability?.type === 'event') {
                    limitedBadge.style.display = 'inline-block';
                } else {
                    limitedBadge.style.display = 'none';
                }
            }

            // 6. Вставка в DOM (appendChild перемещает существующий узел в конец, тем самым сортируя их)
            inventoryGrid.appendChild(col);
        });

        // 7. Удаление элементов, которые не попали в текущий фильтр/список
        // (Все, что осталось в existingNodes — это карточки, которые были на экране, но теперь отфильтрованы)
        existingNodes.forEach(col => col.remove());

        // Обновление счетчиков
        const viewableRarities = availableRarities.filter(r => !(r.id === 'diamond' && !playerData.isSupporter));
        const uniqueOpenedCount = new Set(playerData.inventory.filter(id => id !== 'garbage' && viewableRarities.some(r => r.id === id))).size;
        const totalPossibleCount = viewableRarities.filter(r => r.id !== 'garbage').length;
        
        const inventoryTabButton = document.getElementById('inventory-tab');
        // Проверка на наличие .new-version класса на кнопке таба
        if (inventoryTabButton) {
             inventoryTabButton.classList.toggle('new-version', (playerData.unseenCardIds?.length || 0) > 0);
        }

        // При активном фильтре: «Показано X» + обычный счётчик, чтобы не терять картину
        if (isAnyInvFilterActive(getInvFilterState())) {
            inventoryCounterElement.textContent =
                `${L.get('ui.filter.shown')}: ${filteredParents.length} | ` +
                `${L.get('ui.opened')}: ${uniqueOpenedCount} / ${totalPossibleCount}`;
        } else {
            inventoryCounterElement.textContent = `${L.get('ui.opened')}: ${uniqueOpenedCount} / ${totalPossibleCount}`;
        }
    }

    // Рендер материалов в рюкзаке
    function renderMaterials(playerData) {
    const grid = document.getElementById('materialsGrid');
    if (!grid) return;

    const mats = window.MATERIALS_DATA || {};
    const entries = Object.keys(mats).map(id => ({
        id, count: (playerData.materials && playerData.materials[id]) || 0
    })).filter(e => e.count > 0).sort((a,b) => a.id.localeCompare(b.id));

    if (entries.length === 0) {
        grid.innerHTML = `<p class="text-muted small">${L.get('ui.noMaterials') || 'No materials yet.'}</p>`;
        return;
    }

    grid.innerHTML = '';
    entries.forEach(e => {
        const m = mats[e.id];
        const name = L.get(m.nameKey) || e.id;
        const col = document.createElement('div');
        col.className = 'col';
        col.innerHTML = `
        <div class="card bg-dark-subtle h-100">
            <div class="card-body text-center">
            <img class="material-icon" src="${m.icon}" alt="${name}">
            <div class="mt-2 fw-bold">${name}</div>
            <div class="text-info-emphasis">x${formatNumber(e.count)}</div>
            </div>
        </div>
        `;
        grid.appendChild(col);
    });
    }

    // Рендер списка всей купленной экипировки + кнопки (надеть/снять)
    function renderOwnedEquipment(playerData) {
    const list = document.getElementById('ownedEquipmentList');
    if (!list) return;

    // 1) Безопасно берём данные магазина
    const equipmentData = (typeof SHOP_DATA !== 'undefined' && SHOP_DATA.equipment)
        ? SHOP_DATA.equipment
        : [];

    // 2) Собираем множество «владения»:
    //    - purchased_<id> из inventory
    //    - id из equippedItems (чтобы показывать даже из старых сейвов)
    const ownedIds = new Set();
    (playerData.inventory || []).forEach(id => {
        if (typeof id === 'string' && id.startsWith('purchased_')) {
        ownedIds.add(id.slice('purchased_'.length));
        }
    });
    (playerData.equippedItems || []).forEach(e => {
        if (e && e.id) ownedIds.add(e.id);
    });

    const owned = equipmentData.filter(eq => ownedIds.has(eq.id));

    if (owned.length === 0) {
        list.innerHTML = `<p class="text-muted small">${L.get('ui.noOwnedEquipment') || 'No owned equipment yet.'}</p>`;
        return;
    }

    list.innerHTML = owned.map(eq => {
        const isEquipped = (playerData.equippedItems || []).some(e => e.id === eq.id);
        const btnText = isEquipped ? (L.get('ui.unequipItem') || 'Unequip') : (L.get('ui.equip') || 'Equip');
        const btnClass = isEquipped ? 'btn-outline-danger' : 'btn-outline-primary';
        return `
        <div class="list-group-item d-flex justify-content-between align-items-center ${isEquipped ? 'equipped' : ''}">
            <div>
            <strong>${L.get(eq.nameKey)}</strong>
            <small class="d-block text-muted">${L.get(eq.descriptionKey)}</small>
            </div>
            <div>
            <button class="btn btn-sm ${btnClass} equip-toggle-btn" data-item-id="${eq.id}">${btnText}</button>
            </div>
        </div>
        `;
    }).join('');

    // Кнопки надеть/снять
    list.querySelectorAll('.equip-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
        const id = btn.dataset.itemId;
        const isEquipped = (playerData.equippedItems || []).some(e => e.id === id);
        if (isEquipped) {
            Game.unequipItem(id);
        } else {
            const itemData = equipmentData.find(eq => eq.id === id);
            if (itemData) Game.equipItem(itemData);
        }
        UI.updateAll(Game.getPlayerData());
        });
    });
    }

    // Рендер мастерской (рецепты крафта)
    function renderWorkshop(playerData) {
    const list = document.getElementById('craftRecipesList');
    if (!list) return;

    const recipes = window.CRAFT_RECIPES || [];
    if (recipes.length === 0) {
        list.innerHTML = `<p class="text-muted small">${L.get('ui.noRecipes') || 'No recipes yet.'}</p>`;
        return;
    }

    list.innerHTML = recipes.map(r => {
        const can = Object.entries(r.cost).every(([id, need]) => (playerData.materials?.[id] || 0) >= need);
        const costHtml = Object.entries(r.cost).map(([id, need]) => {
        const mat = window.MATERIALS_DATA?.[id];
        const have = playerData.materials?.[id] || 0;
        const matName = mat ? (L.get(mat.nameKey) || id) : id;
        return `<span class="badge bg-secondary me-1">${matName}: ${have}/${need}</span>`;
        }).join(' ');

        const name = L.get(r.nameKey) || r.id;
        const desc = L.get(r.descriptionKey) || '';

        return `
        <div class="list-group-item d-flex justify-content-between align-items-center">
            <div>
            <strong>${name}</strong>
            <small class="d-block text-muted">${desc}</small>
            <div class="mt-1">${costHtml}</div>
            </div>
            <button class="btn btn-sm btn-success craft-btn" data-id="${r.id}" ${can ? '' : 'disabled'}>
            ${L.get('ui.craft') || 'Craft'}
            </button>
        </div>
        `;
    }).join('');

    list.querySelectorAll('.craft-btn').forEach(btn => {
        btn.addEventListener('click', () => {
        if (typeof Game.craftItem === 'function') {
            Game.craftItem(btn.dataset.id);
        } else {
            console.warn('Game.craftItem is not available');
        }
        });
    });
    }

    function showCardModal(parentId, allVersions) {
        const versionSwitcher = document.getElementById('versionSwitcher');
        const visualEffectControls = document.getElementById('visualEffectControls');
        const mechanicalEffectControls = document.getElementById('mechanicalEffectControls');

        const playerData = Game.getPlayerData();
        const versionIds = allVersions.map(v => v.id);
        let needsSave = false;

        const activeSkinId = playerData.activeSkins[parentId] || parentId;

        versionSwitcher.innerHTML = '';
        visualEffectControls.innerHTML = '';
        mechanicalEffectControls.innerHTML = '';

        const showVersionDetails = (versionData) => {
            const modalRoot = document.getElementById('cardModal');
            // Сбрасываем на старте — чтобы негатив не "залипал"
            modalRoot.classList.remove('variant-negative');
            modalCardImage.src = versionData.card.image;
            modalCardName.textContent = L.get(versionData.card.nameKey);
            modalCardRarity.textContent = `${L.get('ui.rarity')}: ${L.get(versionData.nameKey)}`;
            modalCardDescription.textContent = L.get(versionData.card.descriptionKey);
            modalCardRarity.style.color = versionData.color;
            // Если это Догма — делаем текст редкости шумным
            if (versionData.id === 'dogma') {
                modalCardRarity.classList.add('text-noise-animated');
            } else {
                modalCardRarity.classList.remove('text-noise-animated');
            }
            
            if (versionData.probabilityBase >= 1) {
                modalCardChance.textContent = L.get('ui.guaranteed');
            } else {
                modalCardChance.textContent = `${L.get('ui.baseChance')}: 1/${Math.round(1 / versionData.probabilityBase)}`;
            }

            const old = document.getElementById('modalCardEffectiveChance');
            old && old.remove();

            if (playerData.purchasedUpgrades.probabilityAnalyzer) {
                const luck = Game.getEffectiveLuck(); // использовать реальную удачу
                const pBase = versionData.probabilityBase;
                const odds = pBase / (1 - pBase);
                const modifiedOdds = odds * luck;
                const effectiveP = modifiedOdds / (1 + modifiedOdds);
                const effectiveChanceText = (effectiveP > 0) ? `1 / ${Math.round(1 / effectiveP).toLocaleString()}` : '≈ 0';

                const effectiveChanceEl = document.createElement('p');
                effectiveChanceEl.id = 'modalCardEffectiveChance';
                effectiveChanceEl.className = 'text-info small mb-1';
                const effectiveChanceLabel = L.get('ui.effectiveChance');
                effectiveChanceEl.innerHTML = `${effectiveChanceLabel} <strong class="text-white">${effectiveChanceText}</strong>`;
                modalCardChance.insertAdjacentElement('afterend', effectiveChanceEl);
            }

            function stripModalVariants() {
            Object.keys(muts).forEach(k => modalRoot.classList.remove(`variant-${k}`));
            modalRoot.classList.remove('variant-negative');
            }

            function applyVariantFromSave() {
            const pd = Game.getPlayerData();
            const savedVid = (pd.variantView || {})[versionData.id] || null;
            stripModalVariants();
            if (savedVid) modalRoot.classList.add(`variant-${savedVid}`);

            // обновить бейдж в заголовке модалки
            let badge = document.getElementById('modalVariantBadge');
            if (!badge) {
                badge = document.createElement('span');
                badge.id = 'modalVariantBadge';
                badge.className = 'variant-chip ms-2';
                document.getElementById('cardModalLabel')?.appendChild(badge);
            }
            if (savedVid) {
                badge.textContent = chipMap[savedVid] || '•';
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
            }

            // ВИЗУАЛЬНЫЕ ЭФФЕКТЫ
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

            // МЕХАНИЧЕСКИЕ/ПАССИВНЫЕ ЭФФЕКТЫ
            mechanicalEffectControls.innerHTML = '';

            // Механический
            const mechEffectData = versionData.mechanicalEffect;
            let mechDescriptionText = '';
            if (mechEffectData) {
                mechDescriptionText = L.get(`mechanical_effects.${mechEffectData.type}`);
                if (mechEffectData.type === 'duplicate_collector') {
                    const currentDuplicates = Game.getPlayerData().duplicateCounts?.[versionData.id] || 0;
                    const perDup = (mechEffectData.luckBonusPerDuplicate || 0);
                    const currentBonus = currentDuplicates * perDup;
                    mechDescriptionText += ` (${L.get('ui.currentBonus')}: +${currentBonus.toFixed(2)})`;
                }
            } else {
                mechDescriptionText = L.get('mechanical_effects.no_effect');
            }

            let mechEquippedIndicator = '';
            if (playerData.activeMechanicalEffect === versionData.id) {
                mechEquippedIndicator = ` <span class="text-success">${L.get('mechanical_effects.equipped_label')}</span>`;
            }

            mechanicalEffectControls.innerHTML = `
                <hr>
                <h5>${L.get('mechanical_effects.description_title')}${mechEquippedIndicator}</h5>
                <p class="text-muted small">${mechDescriptionText}</p>
            `;

            // --- Переключатель мутаций (универсально) ---
            const muts = window.MUTATIONS || {};
            const variantContainerId = 'variantFilterGroup';
            let variantGroup = document.getElementById(variantContainerId);
            if (!variantGroup) {
            variantGroup = document.createElement('div');
            variantGroup.id = variantContainerId;
            variantGroup.className = 'd-flex justify-content-center align-items-center flex-wrap gap-2 mt-3';
            document.getElementById('versionSwitcher')?.insertAdjacentElement('afterend', variantGroup);
            }
            variantGroup.innerHTML = '';

            const pd = Game.getPlayerData();
            const vCounts = (pd.ownedVariants || {})[versionData.id] || {};
            const chipMap = { negative: 'N', gold: 'G', voided: 'V' };

            // Кнопка NORMAL
            const btnNormal = document.createElement('button');
            btnNormal.type = 'button';
            btnNormal.className = 'btn btn-sm btn-outline-light';
            btnNormal.textContent = L.get('ui.variant.normal') || 'Normal';
            btnNormal.addEventListener('click', () => applyVariantToModal(null));
            variantGroup.appendChild(btnNormal);

            // Остальные — только те, что выбиты
            Object.keys(muts).forEach(vid => {
            const cnt = vCounts[vid] || 0;
            if (cnt <= 0) return;
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'btn btn-sm btn-outline-warning';
            b.textContent = L.get(muts[vid].nameKey) || vid.toUpperCase();
            b.addEventListener('click', () => applyVariantToModal(vid));
            variantGroup.appendChild(b);
            });

            // Применение к модалке + сохранение выбора для ЭТОЙ версии
            function applyVariantToModal(vid) {
            const modalRoot = document.getElementById('cardModal');
            // снять любые variant-* классы
            Object.keys(muts).forEach(k => modalRoot.classList.remove(`variant-${k}`));
            modalRoot.classList.remove('variant-negative');
            if (vid) modalRoot.classList.add(`variant-${vid}`);

            // Сохраняем локальный выбор версии
            pd.variantView = pd.variantView || {};
            pd.variantView[versionData.id] = vid || null;
            Game.saveGame();

            // Бейдж в модалке (короткий)
            let badge = document.getElementById('modalVariantBadge');
            if (!badge) {
                badge = document.createElement('span');
                badge.id = 'modalVariantBadge';
                badge.className = 'variant-chip ms-2';
                document.getElementById('cardModalLabel')?.appendChild(badge);
            }
            badge.textContent = vid ? (chipMap[vid] || '•') : '';
            badge.style.display = vid ? 'inline-block' : 'none';

            // Перерисовать грид, чтобы семья показывала выбранный вид
            renderInventory(Game.getPlayerData());
            }

            const modalEl = document.getElementById('cardModal');
            const mutsAll = window.MUTATIONS || {};
            function stripAllModalVariants() {
            Object.keys(mutsAll).forEach(k => modalRoot.classList.remove(`variant-${k}`));
            modalRoot.classList.remove('variant-negative'); // на всякий случай
            const b = document.getElementById('modalVariantBadge');
            if (b) b.style.display = 'none';
            }
            // вместо старого “remove variant-negative”:
            modalEl.addEventListener('hidden.bs.modal', stripAllModalVariants, {once:true});

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

            // Пассивный
            const passiveEffectData = versionData.passiveEffect;
            if (passiveEffectData) {
                const isPassiveActive = playerData.activePassives && Object.values(playerData.activePassives).includes(versionData.id);
                let passiveActiveIndicator = '';
                if (isPassiveActive) {
                    passiveActiveIndicator = ` <span class="text-success">${L.get('passive_effects.active_label')}</span>`;
                }
                const passiveHtml = `
                    <hr>
                    <h5>${L.get('passive_effects.description_title')}${passiveActiveIndicator}</h5>
                    <p class="text-muted small">${L.get(`passive_effects.${passiveEffectData.type}`)}</p>
                `;
                mechanicalEffectControls.innerHTML += passiveHtml;
            }
            applyVariantFromSave();
        };

        // Переключатель версий
        if (allVersions.length > 1) {
            const group = document.createElement('div');
            group.className = 'd-flex justify-content-center align-items-center flex-wrap gap-2';

            allVersions.forEach(version => {
                const isUnlocked = playerData.inventory.includes(version.id);
                if (!isUnlocked) return;

                const wrapper = document.createElement('div');
                const button = document.createElement('button');
                if (playerData.unseenCardIds.includes(version.id)) {
                    button.classList.add('new-version');
                }
                button.type = 'button';
                button.className = 'btn btn-sm';
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

        const initialVersionToShow = getRarityDataById(activeSkinId, playerData) || allVersions[0];
        showVersionDetails(initialVersionToShow);
        cardModal.show();

        // Убираем "непросмотренные" для всех версий семьи
        playerData.unseenCardIds = playerData.unseenCardIds.filter(unseenId => {
            if (versionIds.includes(unseenId)) {
                needsSave = true;
                return false;
            }
            return true;
        });

        if (needsSave) {
            Game.saveGame();
            renderInventory(playerData);
        }
    }

    function applyVisualEffect(rarityId, isInitialLoad = false) {
        const targets = {
            body: document.body,
            glitchOverlay: document.getElementById('globalGlitchOverlay'),
            audioPlayer: backgroundMusicElement
        };
        VisualEffects.apply(rarityId, targets, isInitialLoad);
    }

    // --- Магазин ---
    function renderShop() {
        if (!boostShop || !equipmentShop || !upgradesShop) return;
        const playerData = Game.getPlayerData();

        const renderSection = (container, data, type) => {
            container.innerHTML = data.map(item => {
                const isPurchased = (type === 'equipment' && playerData.inventory.includes("purchased_" + item.id)) ||
                                    (type === 'upgrade' && playerData.purchasedUpgrades[item.targetProperty]);
                const isEquipped = type === 'equipment' && playerData.equippedItems.find(e => e.id === item.id);

                const finalCost = Game.getDiscountedCost(item.cost);
                const canAfford = playerData.currency >= finalCost;
                const hasDiscount = finalCost < item.cost;

                let buttonHtml;
                if (isEquipped) {
                    buttonHtml = `<button class="btn btn-sm btn-secondary" disabled>${L.get('ui.nowEquipped')}</button>`;
                } else if (isPurchased) {
                    const isDisabled = type === 'equipment' && playerData.equippedItems.length >= Game.getMaxEquippedItems();
                    buttonHtml = `<button class="btn btn-sm btn-outline-primary equip-btn" data-item-id="${item.id}" ${isDisabled ? `disabled title="${L.get('ui.maxEquipment')}"` : ''}>${L.get('ui.equip')}</button>`;
                }
                else if (type === 'boost') {
                    const unit = Game.getDiscountedCost(item.cost);
                    buttonHtml = `
                        <div class="d-flex align-items-center gap-2">
                        <div class="input-group input-group-sm" style="width: 160px;">
                            <span class="input-group-text">×</span>
                            <input type="number" class="form-control form-control-sm boost-count-input" value="1" min="1" max="99">
                        </div>
                        <button class="btn btn-sm btn-success buy-boost-btn" data-item-id="${item.id}" data-unit="${unit}">
                            ${L.get('ui.buy')} ×1
                            <span class="badge bg-warning text-dark">${formatNumber(unit)} 💎</span>
                        </button>
                        </div>
                    `;
                } 
                else {
                    const finalCost = Game.getDiscountedCost(item.cost);
                    const hasDiscount = finalCost < item.cost;
                    const orig = hasDiscount ? `<small><s class="text-muted">${formatNumber(item.cost)}</s></small> ` : '';
                    const costHtml = `${orig}${formatNumber(finalCost)} 💎`;
                    buttonHtml = `<button class="btn btn-sm btn-success buy-${type}-btn" data-item-id="${item.id}" ${!canAfford ? 'disabled' : ''}>${L.get('ui.buy')} <span class="badge bg-warning text-dark">${costHtml}</span></button>`;
                }

                return `
                    <div class="list-group-item shop-item d-flex justify-content-between align-items-center ${isPurchased ? 'purchased' : ''} ${isEquipped ? 'equipped' : ''}">
                        <div><strong>${L.get(item.nameKey)}</strong><small class="d-block text-muted">${L.get(item.descriptionKey)}</small></div>
                        <div>${buttonHtml}</div>
                    </div>
                `;
            }).join('');
        };

        renderSection(boostShop, SHOP_DATA.boosts, 'boost');
        const equipmentForShop = (SHOP_DATA.equipment || []).filter(eq => !eq.craftOnly);
        renderSection(equipmentShop, equipmentForShop, 'equipment');
        renderSection(upgradesShop, SHOP_DATA.upgrades, 'upgrade');

        const equipmentHeader = document.querySelector('#equipmentShop')?.previousElementSibling;
        if (equipmentHeader) {
            const maxItems = Game.getMaxEquippedItems();
            equipmentHeader.textContent = `${L.get('ui.equipmentPermanent').replace('3', maxItems)}`;
        }

        const luckCoreSection = document.getElementById('luckCoreSection');
        if (luckCoreSection) {
            const coreLevel = playerData.luckCoreLevel || 0;
            const currentTotalBonus = Game.calculateLuckFromCore(coreLevel);
            const nextLevelBonus = Game.calculateLuckFromCore(coreLevel + 1) - currentTotalBonus;

            const nextCost = Game.getLuckCoreAmplificationCost();
            const nextCostText = formatNumber(nextCost);
            const canAfford = playerData.currency >= nextCost;

            luckCoreSection.innerHTML = `
                <hr>
                <h4>${L.get('shop.luck_core.title')}</h4>
                <div class="list-group">
                    <div class="list-group-item shop-item d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${L.get('shop.luck_core.current_bonus')}</strong>: <span class="text-success">+${currentTotalBonus.toFixed(3)}</span>
                            <small class="d-block text-muted">${L.get('shop.luck_core.description')}</small>
                        </div>
                        <div id="luckCoreFragmentsDisplay" class="mt-2 small text-warning-emphasis"></div>
                        <button id="amplifyLuckCoreBtn" class="btn btn-lg btn-warning" ${!canAfford ? 'disabled' : ''}>
                            <span>${L.get('shop.luck_core.amplify')}</span> (+${nextLevelBonus.toFixed(3)})<br>
                            <span class="badge bg-dark">${nextCostText} 💎</span>
                        </button>
                    </div>
                </div>
            `;

            const fragmentsDisplay = document.getElementById('luckCoreFragmentsDisplay');
            if (fragmentsDisplay && playerData.luckCoreFragments > 0) {
                const stoneData = SHOP_DATA.equipment.find(i => i.id === 'equip_alchemists_stone');
                if (stoneData) {
                    fragmentsDisplay.textContent = `${L.get('ui.luckCoreFragments')} ${playerData.luckCoreFragments} / ${stoneData.effect.fragmentsNeeded}`;
                }
            }

            document.getElementById('amplifyLuckCoreBtn')?.addEventListener('click', () => {
                Game.amplifyLuckCore();
            });
        }

        addShopEventListeners();
    }

    function addShopEventListeners() {
        // Пересчёт цены и текста на кнопке при изменении количества
        document.querySelectorAll('#boostShop .boost-count-input').forEach(inp => {
        inp.addEventListener('input', e => {
            const input = e.currentTarget;
            let val = Math.max(1, Math.min(99, Number(input.value) || 1));
            input.value = val;
            const container = input.closest('.shop-item');
            const btn = container?.querySelector('.buy-boost-btn');
            const unit = Number(btn?.dataset.unit) || 0;
            const total = unit * val;
            if (btn) {
            btn.innerHTML = `${L.get('ui.buy')} ×${val} <span class="badge bg-warning text-dark">${formatNumber(total)} 💎</span>`;
            // доступность по валюте
            const can = (Game.getPlayerData().currency || 0) >= total;
            btn.disabled = !can;
            }
        });
        });

        // Покупка ×N
        document.querySelectorAll('.buy-boost-btn, .buy-equipment-btn, .buy-upgrade-btn, .equip-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const el = e.currentTarget;
            const itemId = el.dataset.itemId;

            if (el.classList.contains('buy-boost-btn')) {
            const container = el.closest('.shop-item');
            const count = Math.max(1, Math.min(99, Number(container?.querySelector('.boost-count-input')?.value) || 1));
            Game.purchaseShopItem(itemId, 'boost', count);
            } else if (el.classList.contains('buy-equipment-btn')) {
            Game.purchaseShopItem(itemId, 'equipment');
            } else if (el.classList.contains('buy-upgrade-btn')) {
            Game.purchaseShopItem(itemId, 'upgrade');
            } else if (el.classList.contains('equip-btn')) {
            const itemData = (SHOP_DATA.equipment || []).find(eq => eq.id === itemId);
            if (itemData) Game.equipItem(itemData);
            }

            renderShop();
            updateEquippedItemsDisplay(Game.getPlayerData().equippedItems);
        });
        });
    }

    function updateEquippedItemsDisplay(equippedItems = []) {
        if (!equippedItemsDisplay) return;

        if (equippedItems.length === 0) {
            equippedItemsDisplay.innerHTML = `<p class="text-muted small">${L.get('ui.noEquippedItems')}</p>`;
            return;
        }

        const chips = [];
        (equippedItems || []).forEach(item => {
        const shopItem = (SHOP_DATA.equipment || []).find(s => s.id === item.id);
        // craftOnly не показываем в магазине
        if (shopItem?.craftOnly) return;
        const itemName = item.nameKey ? L.get(item.nameKey) : (item.name || 'Unknown Item');
        let effectText = L.get('debug.effect.active');
        if (shopItem?.luckBonus) {
            effectText = `+${shopItem.luckBonus.toFixed(2)} ${L.get('ui.luck').toLowerCase()}`;
        } else if (shopItem?.effect?.type === 'duplicate_currency_bonus_percent') {
            effectText = `+${(shopItem.effect.value * 100).toFixed(0)}% 💎`;
        } else if (shopItem?.effect?.type === 'cumulative_luck_on_low_rolls') {
            effectText = `${L.get('debug.effect.cumulative')} (+${shopItem.effect.bonusPerStack}/${L.get('debug.effect.stack')})`;
        }

        chips.push(
        `<div class="equipped-item-chip badge bg-info text-dark me-1 mb-1 p-2">
            <span>${itemName} <small class="text-white-75">(${effectText})</small></span>
            <button class="btn btn-xs btn-outline-light btn-remove-equip ms-2" data-item-id="${item.id}" title="${L.get('ui.unequipItem')}">×</button>
        </div>`
        );
        });
        equippedItemsDisplay.innerHTML = chips.join('');
        // обработчики снятия
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

    // --- Оценка времени цикла ---
    function getEstimatedCycleTime() {
        const playerData = Game.getPlayerData();
        const isFast = !!playerData.purchasedUpgrades.fastRoll;
        const animationTime = isFast ? 750 : 1500;
        return animationTime + AUTOROLL_BREATHING_ROOM;
    }

    // --- AFK-резюме ---
    function showAfkSummaryNotification(rolls, currency, newCards) {
        let messageKey;
        if (currency > 0 && newCards > 0) messageKey = 'notifications.afkSummary';
        else if (currency > 0 && newCards === 0) messageKey = 'notifications.afkSummaryNoNewCards';
        else if (currency === 0 && newCards > 0) messageKey = 'notifications.afkSummaryNoCurrency';
        else messageKey = 'notifications.afkSummaryRollsOnly';

        const f = (n)=> formatNumber(n);
        const message = L.get(messageKey)
            .replace('{rolls}', f(rolls))
            .replace('{currency}', f(currency))
            .replace('{newCards}', f(newCards));

        showNotification(message, 'info', 8000);
    }

    // --- Догон AFK ---
    function handleAfkProgress() {
        if (!lastRollTimestamp || lastRollTimestamp === 0) {
            performNextAutoroll();
            return;
        }

        const timeElapsed = Date.now() - lastRollTimestamp;
        const timePerCycle = getEstimatedCycleTime();
        const cyclesToPerform = Math.floor(timeElapsed / timePerCycle);

        if (cyclesToPerform <= 0) {
            performNextAutoroll();
            return;
        }

        processAfkInChunks(cyclesToPerform);
    }

    let lastNewCardResult = null;

    function processAfkInChunks(totalCycles) {
        const playerData = Game.getPlayerData();
        console.log(`Starting AFK catch-up for ${totalCycles} cycles in chunks.`);
        isRolling = true;

        let cyclesProcessed = 0;
        let totalCurrencyGained = 0;
        let newCardsCount = 0;
        const rollsPerCycle = playerData.purchasedUpgrades.multiRollX10 ? 10 :
                              playerData.purchasedUpgrades.multiRollX5 ? 5 : 1;
        const chunkSize = 50;

        function processChunk() {
            const cyclesInThisChunk = Math.min(chunkSize, totalCycles - cyclesProcessed);

            for (let i = 0; i < cyclesInThisChunk; i++) {
                for (let j = 0; j < rollsPerCycle; j++) {
                    const result = Game.performRoll();
                    if (!result) continue;

                    // Нет дополнительной логики "Камня Алхимика" здесь — все решает Game.processRollResult
                    if (result.duplicateReward > 0) {
                        totalCurrencyGained += result.duplicateReward;
                    }
                    if (result.isNew) {
                        newCardsCount++;
                        lastNewCardResult = result; // покажем одну по завершении
                    }
                }
            }

            cyclesProcessed += cyclesInThisChunk;

            if (cyclesProcessed < totalCycles) {
                requestAnimationFrame(processChunk);
            } else {
                console.log("AFK catch-up finished.");
                isRolling = false;
                if (lastNewCardResult) showNewCard(lastNewCardResult);
                // updateHud, а не updateAll: полный перерендер всех вкладок после
                // десятков тысяч роллов догона — лишний фриз.
                updateHud(Game.getPlayerData());
                showAfkSummaryNotification(totalCycles * rollsPerCycle, totalCurrencyGained, newCardsCount);

                performNextAutoroll();
            }
        }

        setTimeout(processChunk, 0);
    }

    

    // --- Публичный интерфейс ---
    return {
        init,
        updateAll,
        renderShop,
        showNotification,
        updateEquippedItemsDisplay,
        updateLuckyRollDisplay,
        applyVisualEffect,
        toggleMultiRollButton,
        applyTheme
        // При необходимости можно добавить updateRollSpeed как заглушку для совместимости:
        // updateRollSpeed: (enabled) => console.log('FastRoll set:', enabled)
    };
})();
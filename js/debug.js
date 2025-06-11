const Debug = (() => {
    // DOM-элементы панели
    let panel, closeBtn;
    let currencyInput, addCurrencyBtn, spendCurrencyBtn, setCurrencyBtn;
    let unlockAllBtn, cardSelect, unlockOneBtn;
    let raritySelect, guaranteedRollBtn;

    function cacheDOMElements() {
        panel = document.getElementById('debugPanel');
        closeBtn = document.getElementById('debugCloseBtn');
        currencyInput = document.getElementById('debugCurrencyInput');
        addCurrencyBtn = document.getElementById('debugAddCurrencyBtn');
        spendCurrencyBtn = document.getElementById('debugSpendCurrencyBtn');
        setCurrencyBtn = document.getElementById('debugSetCurrencyBtn');
        unlockAllBtn = document.getElementById('debugUnlockAllBtn');
        cardSelect = document.getElementById('debugCardSelect');
        unlockOneBtn = document.getElementById('debugUnlockOneBtn');
        raritySelect = document.getElementById('debugRaritySelect');
        guaranteedRollBtn = document.getElementById('debugGuaranteedRollBtn');
    }

    // ИСПРАВЛЕНИЕ: Используем L.get() для получения имен
    function populateSelects() {
        if (!window.RARITIES_DATA || typeof L === 'undefined') {
            console.error("Debug Panel: RARITIES_DATA or Localization (L) is not available.");
            return;
        }

        RARITIES_DATA.forEach(rarity => {
            const cardName = L.get(rarity.card.nameKey);
            const rarityName = L.get(rarity.nameKey);

            // Список карт для открытия
            const cardOption = document.createElement('option');
            cardOption.value = rarity.id;
            cardOption.textContent = `${rarityName} - ${cardName}`;
            cardSelect.appendChild(cardOption);

            // Список редкостей для ролла
            const rarityOption = document.createElement('option');
            rarityOption.value = rarity.id;
            rarityOption.textContent = rarityName;
            raritySelect.appendChild(rarityOption);
        });
    }

    // ИСПРАВЛЕНИЕ: Используем L.get() для уведомлений
    function bindEvents() {
        closeBtn.addEventListener('click', hide);

        addCurrencyBtn.addEventListener('click', () => {
            const amount = parseInt(currencyInput.value, 10);
            if (!isNaN(amount)) Game.addCurrency(amount);
        });
        spendCurrencyBtn.addEventListener('click', () => {
            const amount = parseInt(currencyInput.value, 10);
            if (!isNaN(amount)) Game.spendCurrency(amount);
        });
        setCurrencyBtn.addEventListener('click', () => {
            const amount = parseInt(currencyInput.value, 10);
            if (!isNaN(amount)) Game.setCurrency(amount);
        });

        unlockAllBtn.addEventListener('click', () => {
            Game.unlockAllCards();
            UI.showNotification(L.get('debug.notifications.allCardsUnlocked'), "success");
        });
        unlockOneBtn.addEventListener('click', () => {
            const rarityId = cardSelect.value;
            if (rarityId) {
                Game.addCardToInventory(rarityId);
                UI.updateAll(Game.getPlayerData());
                UI.showNotification(`${L.get('debug.notifications.cardAdded')} "${rarityId}"`, "info");
            }
        });

        guaranteedRollBtn.addEventListener('click', () => {
            const rarityId = raritySelect.value;
            if (rarityId) {
                const result = Game.performRoll(rarityId);
                UI.updateAll(Game.getPlayerData());
                UI.showNotification(`${L.get('debug.notifications.guaranteedRoll')} "${result.rarity.name}"!`, "success");
            }
        });
    }

    function show() { if (panel) panel.style.display = 'block'; }
    function hide() { if (panel) panel.style.display = 'none'; }

    function init() {
        cacheDOMElements();
        populateSelects();
        bindEvents();
        console.log("Debug Panel Initialized. Call Debug.show() to open.");
    }

    return { init, show, hide };
})();
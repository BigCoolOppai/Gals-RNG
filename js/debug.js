const Debug = (() => {
    // DOM-элементы панели
    let panel, closeBtn;
    let currencyInput, addCurrencyBtn, spendCurrencyBtn, setCurrencyBtn;
    let unlockAllBtn, cardSelect, unlockOneBtn;
    let raritySelect, guaranteedRollBtn;

    // Функция для кэширования элементов
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

    // Заполняем выпадающие списки данными из cards.js
    function populateSelects() {
        if (!window.RARITIES_DATA) {
            console.error("Debug Panel: RARITIES_DATA is not available.");
            return;
        }

        RARITIES_DATA.forEach(rarity => {
            // Добавляем в список карт
            const cardOption = document.createElement('option');
            cardOption.value = rarity.id;
            cardOption.textContent = `${rarity.name} - ${rarity.card.name}`;
            cardSelect.appendChild(cardOption);

            // Добавляем в список редкостей для ролла
            const rarityOption = document.createElement('option');
            rarityOption.value = rarity.id;
            rarityOption.textContent = rarity.name;
            raritySelect.appendChild(rarityOption);
        });
    }

    // Привязываем обработчики событий к кнопкам
    function bindEvents() {
        closeBtn.addEventListener('click', hide);

        // --- Валюта ---
        addCurrencyBtn.addEventListener('click', () => {
            const amount = parseInt(currencyInput.value, 10);
            if (!isNaN(amount)) Game.addCurrency(amount);
        });
        spendCurrencyBtn.addEventListener('click', () => {
            const amount = parseInt(currencyInput.value, 10);
            if (!isNaN(amount)) Game.spendCurrency(amount);
            // spendCurrency сама обновляет UI, но на случай если мы хотим обновить кнопки магазина:
            UI.renderShop();
        });
        setCurrencyBtn.addEventListener('click', () => {
            const amount = parseInt(currencyInput.value, 10);
            if (!isNaN(amount)) Game.setCurrency(amount);
        });

        // --- Карточки ---
        unlockAllBtn.addEventListener('click', () => {
            Game.unlockAllCards();
            UI.showNotification("Все карты открыты!", "success");
        });
        unlockOneBtn.addEventListener('click', () => {
            const rarityId = cardSelect.value;
            if (rarityId) {
                Game.addCardToInventory(rarityId);
                UI.updateAll(Game.getPlayerData()); // Обновляем UI, чтобы показать новую карту
                UI.showNotification(`Карта для редкости "${rarityId}" добавлена.`, "info");
            }
        });

        // --- Гарантированный ролл ---
        guaranteedRollBtn.addEventListener('click', () => {
            const rarityId = raritySelect.value;
            if (rarityId) {
                // Выполняем ролл с гарантированным ID
                const result = Game.performRoll(rarityId);
                // Обновляем весь интерфейс, чтобы отразить результат
                UI.updateAll(Game.getPlayerData());
                UI.showNotification(`Выполнен гарантированный ролл на "${result.rarity.name}"!`, "success");
            }
        });
    }

    function show() {
        if (panel) panel.style.display = 'block';
    }

    function hide() {
        if (panel) panel.style.display = 'none';
    }

    function init() {
        cacheDOMElements();
        populateSelects();
        bindEvents();
        console.log("Debug Panel Initialized. Call Debug.show() to open.");
    }

    // Публичный интерфейс объекта Debug
    return {
        init,
        show,
        hide
    };
})();
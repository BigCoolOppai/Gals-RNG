const L = (() => {
    let currentLanguage = 'ru';
    // let locales = {};

    // Загружает данные для выбранного языка
    async function loadLanguage(lang) {
        if (window.locales && window.locales[lang]) {
            console.log(`Language ${lang} already loaded.`);
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `js/locales/${lang}.js`;
            script.onload = () => {
                console.log(`Successfully loaded locale: ${lang}`);
                resolve();
            };
            script.onerror = () => {
                console.error(`Failed to load locale: ${lang}`);
                reject();
            };
            document.head.appendChild(script);
        });
    }

    // Главная функция для получения текста по ключуD
    function get(key) {
        // ЗАЩИТА: Если ключ не является строкой, возвращаем его как есть.
        if (typeof key !== 'string' || !key) {
            console.warn(`Translation key is not a valid string:`, key);
            return key || ''; // Возвращаем пустую строку, если key это null или undefined
        }

        const keys = key.split('.');
        let result = window.locales ? window.locales[currentLanguage] : undefined;
        for (const k of keys) {
            result = result ? result[k] : undefined;
            if (result === undefined) {
                console.warn(`Translation key not found: ${key}`);
                return key;
            }
        }
        return result;
    }
    
    // Применяет переводы ко всем статичным элементам на странице
        function applyToDOM() {
        // Обработка обычных текстов
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const targetAttr = element.getAttribute('data-i18n-target') || 'textContent';
            if (targetAttr === 'textContent') {
                element.textContent = get(key);
            } else {
                element.setAttribute(targetAttr, get(key));
            }
        });

        // <<< НАЧАЛО НОВОГО БЛОКА ДЛЯ ТУЛТИПОВ >>>
        // Обработка атрибутов title для тултипов
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.setAttribute('title', get(key));
        });
        // <<< КОНЕЦ НОВОГО БЛОКА >>>
    }

    // Устанавливает язык, загружает его и перезагружает страницу
    async function setLanguage(lang) {
        currentLanguage = lang;
        localStorage.setItem('gameLanguage', lang);
        // Самый надежный способ применить все изменения - перезагрузить страницу
        window.location.reload();
    }

    // Инициализация модуля
    async function init() {
        // Берем язык из сохранения или ставим русский по умолчанию
        const savedLang = localStorage.getItem('gameLanguage') || 'ru';
        currentLanguage = savedLang;

        // Инициализируем глобальный объект, если его нет
        if (!window.locales) { // <--- ДОБАВЬТЕ ЭТУ ПРОВЕРКУ
            window.locales = {};
        }

        await loadLanguage(currentLanguage);
        applyToDOM();
    }

    return {
        init,
        get,
        setLanguage,
        getCurrentLanguage: () => currentLanguage
    };
})();
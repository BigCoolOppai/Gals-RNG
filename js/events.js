// js/events.js

// В этом файле мы будем определять все активные и будущие игровые события.
// Система будет автоматически проверять дату и активировать/деактивировать их.

const EVENTS_DATA = [
    {
        id: 'march_of_artists_2025',
        nameKey: 'events.march_of_artists.name',
        descriptionKey: 'events.march_of_artists.description',
        // ВАЖНО: Установите реальную дату окончания в формате ISO (ГГГГ-ММ-ДДTЧЧ:ММ:ССZ)
        // Например, '2025-07-20T23:59:59Z'
        endDate: '2025-07-06T23:59:59Z', 
        effect: {
            // Этот эффект повышает шанс выпадения определенных карт
            type: 'boost_specific_cards',
            // Карты, связанные с творчеством, перформансом, стилем
            cardIds: ['smokinsexystyle', 'metalhead', 'neon', 'carbon', 'graphite', 'alastor', 'seductress', 'vacation', 'platinum'],
            // Во сколько раз повышается шанс (не удача, а именно итоговый шанс)
            multiplier: 10
        }
        
    },
    {
        id: 'crystal_fever_2025',
        nameKey: 'events.crystal_fever.name',
        descriptionKey: 'events.crystal_fever.description',
        // Начнется после "Шествия Артистов", продлится 3 дня
        endDate: '2025-07-09T23:59:59Z', 
        effect: {
            // Новый тип эффекта: множитель для валюты с дубликатов
            type: 'duplicate_currency_multiplier',
            multiplier: 1.5
        }
    },
    {
        id: 'black_clover_2025',
        nameKey: 'events.black_clover.name',
        descriptionKey: 'events.black_clover.description',
        // Начнется после "Кристальной лихорадки", продлится 3 дня
        endDate: '2025-07-12T23:59:59Z', 
        effect: {
            // Новый тип эффекта: глобальный множитель удачи
            type: 'global_luck_multiplier',
            multiplier: 2.0
        }
    }
    // Сюда можно будет добавлять новые эвенты в будущем
];
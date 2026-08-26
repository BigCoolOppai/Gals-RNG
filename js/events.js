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
    },
    {
        id: 'workshop_rush_2025',
        nameKey: 'events.workshop_rush.name',
        descriptionKey: 'events.workshop_rush.description',
        startDate: '2025-09-01T00:00:00Z',
        endDate:   '2025-09-06T23:59:59Z',
        effect: { type: 'material_drop_multiplier', multiplier: 1.5 }
    },
    {
        id: 'workshop_rush_variant_boost_2025',
        nameKey: 'events.workshop_rush.name',
        descriptionKey: 'events.workshop_rush.description',
        startDate: '2025-09-01T00:00:00Z',
        endDate:   '2025-09-06T23:59:59Z',
        effect: { type: 'variant_chance_multiplier', multiplier: 1.3 }
    },

    {
    id: 'choco_2025',
    nameKey: 'events.chocolate.name',
    descriptionKey: 'events.chocolate.description',
    startDate: '2025-09-08T16:00:00Z', // 23:00 по МСК
    endDate:   '2025-09-20T00:00:00Z',
    bannerClass: 'choco-banner',
  },

    {
        id: 'halloween_luck_2025',
        nameKey: 'events.halloween_2025.name',
        descriptionKey: 'events.halloween_2025.description',
        startDate: '2025-10-10T00:00:00Z',
        endDate:   '2025-11-09T23:59:59Z',
        bannerClass: 'halloween-banner',
        effect: {
            type: 'boost_specific_cards',
            cardIds: ['hween_slender', 'hween_goth', 'hween_tar', 'hween_jeff', 'hween_eyeless', 'hween_dullahan', 'hween_sadako', 'hween_nurse', 'hween_furina', 'hween_hybrid', 'hween_scarecrow', 'hween_mime', 'hween_clown', 'hween_ghostface', 'hween_witch', 'hween_ghost', 'hween_eyeling', 'hween_piggy', 'hween_jack'],
            multiplier: 2
        }
    },

    // Ретро-ивент «Ретро Взгляд»: витрина старых лимиток для новых игроков.
    // 10 карт (4 из шоколадного, 6 из хэллоуинского ивентов) выпадают с x2,
    // не открывая целиком ни один из прошлых ивентов. Наград нет — это
    // демонстрация: «периодически проходят ивенты».
    // Даты: 27.08.2026 00:00 (UTC+5) -> 26.09.2026 00:00 (UTC+5), 1 месяц.
    {
        id: 'retro_gaze_2026',
        nameKey: 'events.retro_gaze.name',
        descriptionKey: 'events.retro_gaze.description',
        startDate: '2026-08-26T19:00:00Z',
        endDate:   '2026-09-26T19:00:00Z',
        bannerClass: 'retro-banner',
        effect: {
            type: 'boost_specific_cards',
            cardIds: [
                // Шоколадный ивент (4 из 8)
                'choco', 'choco_espresso', 'choco_white', 'choco_peppermint',
                // Хэллоуин 2025 (6 из 19)
                'hween_ghost', 'hween_ghostface', 'hween_clown',
                'hween_scarecrow', 'hween_sadako', 'hween_slender'
            ],
            multiplier: 2
        },
        // Эти лимитки доступны к роллу во время ретро-ивента (см. isCardAvailableNow)
        retroCards: [
            'choco', 'choco_espresso', 'choco_white', 'choco_peppermint',
            'hween_ghost', 'hween_ghostface', 'hween_clown',
            'hween_scarecrow', 'hween_sadako', 'hween_slender'
        ]
    },

    // Сюда можно будет добавлять новые эвенты в будущем
];
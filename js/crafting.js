// crafting.js

window.MATERIALS_DATA = {
scrap: { id: 'scrap', nameKey: 'materials.scrap.name', icon: 'img/materials/scrap.png', color: '#b0bec5' },
obsidian_shard: { id: 'obsidian_shard', nameKey: 'materials.obsidian_shard.name', icon: 'img/materials/obsidian.png', color: '#6a1b9a' },
silken_thread: { id: 'silken_thread', nameKey: 'materials.silken_thread.name', icon: 'img/materials/silk.png', color: '#c2185b' },
lava_core: { id: 'lava_core', nameKey: 'materials.lava_core.name', icon: 'img/materials/lava.png', color: '#e64a19' },
carbon_shard: { id: 'carbon_shard', nameKey: 'materials.carbon_shard.name', icon: 'img/materials/carbon.png', color: '#424242' }
};

// Выпадение материалов с конкретных карт (как правило — при дубликате)
window.MATERIAL_DROPS = {
garbage: [{ materialId: 'scrap', chance: 0.65, min: 1, max: 2 }],
garbage_alt_1: [{ materialId: 'scrap', chance: 0.85, min: 2, max: 3 }],

obsidian: [{ materialId: 'obsidian_shard', chance: 0.50, min: 1, max: 1 }],
silken: [{ materialId: 'silken_thread', chance: 0.40, min: 1, max: 2 }],
lava: [{ materialId: 'lava_core', chance: 0.45, min: 1, max: 1 }],
carbon: [{ materialId: 'carbon_shard', chance: 0.35, min: 1, max: 1 }],

// // При желании — семейства/альт-версии:
// space_alt_1: [{ materialId: 'carbon_shard', chance: 0.20, min: 1, max: 1 }],
// space_alt_2: [{ materialId: 'carbon_shard', chance: 0.25, min: 1, max: 1 }]
};

// Рецепты крафта
window.CRAFT_RECIPES = [
// Тема (пример)
{
id: 'theme_obsidian_forge',
nameKey: 'craft.theme_obsidian_forge.name',
descriptionKey: 'craft.theme_obsidian_forge.description',
cost: { obsidian_shard: 5, lava_core: 3 },
result: { type: 'ui_theme', themeId: 'theme-prestige' }
},
// Снаряжение (пример)
{
id: 'equip_steel_edge',
nameKey: 'craft.equip_steel_edge.name',
descriptionKey: 'craft.equip_steel_edge.description',
cost: { silken_thread: 5, carbon_shard: 2, scrap: 15 },
result: { type: 'equipment', itemId: 'equip_artifact' } // можно завести новый item (лучше), пока пример
},
// Карта (пример — альт версия)
{
id: 'card_alt_shroom',
nameKey: 'craft.card_alt_shroom.name',
descriptionKey: 'craft.card_alt_shroom.description',
cost: { lava_core: 2, silken_thread: 4 },
result: { type: 'card', rarityId: 'altShroom' }
},
// Расходник (токен) — опционально
// {
// id: 'token_tier_up',
// nameKey: 'craft.token_tier_up.name',
// descriptionKey: 'craft.token_tier_up.description',
// cost: { carbon_shard: 3, scrap: 20 },
// result: { type: 'token', tokenId: 'tier_up_1' }
// }
];
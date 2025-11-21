// crafting.js

window.MATERIALS_DATA = {
  scrap:           { id: 'scrap',            nameKey: 'materials.scrap.name',           icon: 'img/materials/scrap1.png',           color: '#b0bec5' },
  obsidian_shard:  { id: 'obsidian_shard',   nameKey: 'materials.obsidian_shard.name',  icon: 'img/materials/os.jpg',        color: '#6a1b9a' },
  silken_thread:   { id: 'silken_thread',    nameKey: 'materials.silken_thread.name',   icon: 'img/materials/st.jpg',            color: '#c2185b' },
  lava_core:       { id: 'lava_core',        nameKey: 'materials.lava_core.name',       icon: 'img/materials/lc.jpg',            color: '#e64a19' },
  carbon_shard:    { id: 'carbon_shard',     nameKey: 'materials.carbon_shard.name',    icon: 'img/materials/cs.jpg',          color: '#424242' },

  // Новые 15
  hollow_mask:     { id: 'hollow_mask',      nameKey: 'materials.hollow_mask.name',     icon: 'img/materials/hm.jpg',     color: '#ff6a00' },
  soul_shard:      { id: 'soul_shard',       nameKey: 'materials.soul_shard.name',      icon: 'img/materials/ss.jpg',            color: '#80deea' },
  reiatsu_thread:  { id: 'reiatsu_thread',   nameKey: 'materials.reiatsu_thread.name',  icon: 'img/materials/rt.jpg',         color: '#ff7043' },
  afro_fiber:      { id: 'afro_fiber',       nameKey: 'materials.afro_fiber.name',      icon: 'img/materials/af.jpg',            color: '#7b1fa2' },
  neon_tube:       { id: 'neon_tube',        nameKey: 'materials.neon_tube.name',       icon: 'img/materials/nt.jpg',            color: '#00e5ff' },
  cosmic_dust:     { id: 'cosmic_dust',      nameKey: 'materials.cosmic_dust.name',     icon: 'img/materials/cd.jpg',          color: '#7e57c2' },
  moon_tears:      { id: 'moon_tears',       nameKey: 'materials.moon_tears.name',      icon: 'img/materials/mt.jpg',            color: '#b0bec5' },
  gold_leaf:       { id: 'gold_leaf',        nameKey: 'materials.gold_leaf.name',       icon: 'img/materials/gl.jpg',       color: '#FFD700' },
  steel_ingot:     { id: 'steel_ingot',      nameKey: 'materials.steel_ingot.name',     icon: 'img/materials/si.jpg',           color: '#90a4ae' },
  vinyl_chip:      { id: 'vinyl_chip',       nameKey: 'materials.vinyl_chip.name',      icon: 'img/materials/vc.jpg',           color: '#ff4081' },
  crystal_shard:   { id: 'crystal_shard',    nameKey: 'materials.crystal_shard.name',   icon: 'img/materials/crs.jpg',         color: '#bbdefb' },
  graphite_powder: { id: 'graphite_powder',  nameKey: 'materials.graphite_powder.name', icon: 'img/materials/gd.jpg', color: '#616161' },
  bee_royal_jelly: { id: 'bee_royal_jelly',  nameKey: 'materials.bee_royal_jelly.name', icon: 'img/materials/rj.jpg',           color: '#ffb300' },
  shroom_spores:   { id: 'shroom_spores',    nameKey: 'materials.shroom_spores.name',   icon: 'img/materials/shs.jpg',          color: '#8bc34a' },
  devil_chain_link:{ id: 'devil_chain_link', nameKey: 'materials.devil_chain_link.name',icon: 'img/materials/dch.jpg',           color: '#d32f2f' }
};

// Выпадение материалов с конкретных карт (как правило — при дубликате)
window.MATERIAL_DROPS = {
  // «донные»
  garbage:        [{ materialId: 'scrap',           chance: 0.25, min: 1, max: 2, applyOn: 'duplicate' }],
  garbage_alt_1:  [{ materialId: 'scrap',           chance: 0.85, min: 2, max: 3, applyOn: 'duplicate' }],

  // базовые материалы
  obsidian:       [{ materialId: 'obsidian_shard',  chance: 0.50, min: 1, max: 1, applyOn: 'both' }],
  silken:         [{ materialId: 'silken_thread',   chance: 0.40, min: 1, max: 2, applyOn: 'both' }],
  lava:           [{ materialId: 'lava_core',       chance: 0.45, min: 1, max: 1, applyOn: 'both' }],
  carbon:         [{ materialId: 'carbon_shard',    chance: 0.35, min: 1, max: 1, applyOn: 'both' }],

  // новые карты и популярные редкости
  bleached: [
    { materialId: 'hollow_mask',    chance: 0.35, min: 1, max: 1, applyOn: 'both' },
    { materialId: 'reiatsu_thread', chance: 0.25, min: 1, max: 1, applyOn: 'duplicate' }
  ],
  afro: [
    { materialId: 'afro_fiber',     chance: 0.45, min: 1, max: 2, applyOn: 'both' },
    { materialId: 'vinyl_chip',     chance: 0.25, min: 1, max: 1, applyOn: 'duplicate' }
  ],

  gold:           [{ materialId: 'gold_leaf',       chance: 0.30, min: 1, max: 2, applyOn: 'both' }],
  cosmic:         [{ materialId: 'cosmic_dust',     chance: 0.40, min: 1, max: 1, applyOn: 'both' }],
  moon:           [{ materialId: 'moon_tears',      chance: 0.35, min: 1, max: 1, applyOn: 'both' }],
  metalhead:      [{ materialId: 'steel_ingot',     chance: 0.35, min: 1, max: 1, applyOn: 'both' }],
  neon:           [{ materialId: 'neon_tube',       chance: 0.40, min: 1, max: 1, applyOn: 'both' }],
  diamond:        [{ materialId: 'crystal_shard',   chance: 0.30, min: 1, max: 1, applyOn: 'duplicate' }],
  graphite:       [{ materialId: 'graphite_powder', chance: 0.45, min: 1, max: 2, applyOn: 'both' }],
  bee:            [{ materialId: 'bee_royal_jelly', chance: 0.45, min: 1, max: 1, applyOn: 'duplicate' }],
  shroom:         [{ materialId: 'shroom_spores',   chance: 0.50, min: 1, max: 2, applyOn: 'both' }],
  devil:          [{ materialId: 'devil_chain_link',chance: 0.30, min: 1, max: 1, applyOn: 'duplicate' }],
  guide:          [{ materialId: 'soul_shard',      chance: 0.35, min: 1, max: 1, applyOn: 'both' }],
  aizen:          [{ materialId: 'soul_shard',      chance: 0.40, min: 1, max: 1, applyOn: 'duplicate' }]

  // при желании можно дополнять дальше
};

// Рецепты крафта
window.CRAFT_RECIPES = [
  // Прежние примеры (оставим их)
  {
    id: 'theme_obsidian_forge',
    nameKey: 'craft.theme_obsidian_forge.name',
    descriptionKey: 'craft.theme_obsidian_forge.description',
    cost: { obsidian_shard: 5, lava_core: 3 },
    result: { type: 'ui_theme', themeId: 'theme-obsidian' }
  },
  {
    id: 'theme_shinigami',
    nameKey: 'craft.theme_shinigami.name',
    descriptionKey: 'craft.theme_shinigami.description',
    cost: { hollow_mask: 2, reiatsu_thread: 3, soul_shard: 2 },
    result: { type: 'ui_theme', themeId: 'theme-shinigami' }
  },

  {
    id: 'equip_disco_glasses_recipe',
    nameKey: 'shop.equipment.equip_disco_glasses.name',
    descriptionKey: 'shop.equipment.equip_disco_glasses.description',
    cost: { afro_fiber: 3, vinyl_chip: 2, neon_tube: 2 },
    result: { type: 'equipment', itemId: 'equip_disco_glasses' }
  },

  {
    id: 'card_scrap_golem_recipe',
    nameKey: 'craft.card_scrap_golem.name',
    descriptionKey: 'craft.card_scrap_golem.description',
    cost: { scrap: 150, graphite_powder: 10 },
    result: { type: 'card', rarityId: 'scrap_golem' } 
  },
  {
  id: 'equip_catalyst_lens_recipe',
  nameKey: 'shop.equipment.equip_catalyst_lens.name',
  descriptionKey: 'shop.equipment.equip_catalyst_lens.description',
  // Усиливает шанс мутации карт на +50% (аддитивно к базовому)
  cost: { crystal_shard: 1, neon_tube: 2, soul_shard: 2 },
  result: { type: 'equipment', itemId: 'equip_catalyst_lens' }
},

{
  id: 'equip_refiner_gloves_recipe',
  nameKey: 'shop.equipment.equip_refiner_gloves.name',
  descriptionKey: 'shop.equipment.equip_refiner_gloves.description',
  // +25% к шансам выпадения материалов (аддитивно)
  cost: { steel_ingot: 3, graphite_powder: 2, carbon_shard: 5 },
  result: { type: 'equipment', itemId: 'equip_refiner_gloves' }
},

{
  id: 'equip_boost_capacitor_recipe',
  nameKey: 'shop.equipment.equip_boost_capacitor.name',
  descriptionKey: 'shop.equipment.equip_boost_capacitor.description',
  // ×1.5 к длительности временных бустов (мультипликативно)
  cost: { gold_leaf: 2, neon_tube: 1, crystal_shard: 1 },
  result: { type: 'equipment', itemId: 'equip_boost_capacitor' }
},
];
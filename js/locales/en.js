// Ensure the global locales object exists
if (!window.locales) {
    window.locales = {};
}

// Add the English translation
window.locales.en = {
    // Cards
    cards: {
        hybrid: { name: "Hybrid", cardName: "Alex", description: "Alex is a sweet, yet sassy gyaru. And it seems she has a little secret ;)... or maybe not so little either" },
        platinum: { name: "Noble", cardName: "Miss Platina", description: "Cold, unapproachable, and incredibly valuable. Rarely shows her true emotions." },
        blackhole: { name: "Supermassive", cardName: "FY-3741 alpha", description: "You've found one of the rarest creatures in the universe. Oh, and it seems she's up to something interesting~~" },
        berserk: { name: "Furious", cardName: "Stug", description: "As you can see, she has endured much in her life. She was branded with the Mark of Sacrifice. Now her fury knows no bounds... (and she has a cool sword and armor)." },
        bee: { name: "Buzzing", cardName: "Queen Bee", description: "This creature is clearly unhappy that you've invaded its hive. You better run." },
        russian: { name: "Homely", cardName: "Klyukva Medvedeva", description: "You know, *hic*, I really love my country! Just, let me, *hic*, sleep..." },
        motivation: { name: "Motivation", cardName: "Alpha and Omega", description: "Power. Motivation. POWER. These words embody this girl, who skillfully wields her katana and never loses focus. (By the way, her favorite dish is Berry Delight)." },
        smokinsexystyle: { name: "S.S.S.", cardName: "Subhuman", description: "Time to light it up! This party's getting crazy! - these were the exact words this lady spoke before disappearing in an unknown direction." },
        cosmic: { name: "Dark Cosmos", cardName: "Star Elf", description: "From the void where stars die, she gazes upon the fragility of worlds. Her hunger is eternal, and her gaze is fixed on the abyss. You'd be better off not crossing her path." },
        space: { name: "Cosmic", cardName: "Nebula Weaver", description: "She weaves patterns from stardust, illuminating the path for lost souls in the infinity. The weaver is kind to all visitors of her gloomy habitat." },
        timestop: { name: "THE WORLD", cardName: "D.I.O.N.A.", description: "Oh, you're approaching me? Instead of running away, you're coming right to me?" },
        jackpot: { name: "Jackpot", cardName: "Hakaria", description: "Do you believe in luck? Did you know that 99.9% of gamblers quit right before they're about to hit it big? Time to deposit! TUCA DONKA!" },
        devil: { name: "Devilish", cardName: "Makima, Demon of Control", description: "Everything is under control. At least for her. Makima go to h*ll!" },
        error: { name: "ERROR", cardName: "ER-RR_R_DATA", description: "Few know who or what this is. It is only known that it is a malevolent spawn of the digital reality..." },
        uranium: { name: "Uranium", cardName: "Uranium-chan", description: "Uranium-chan is only found in the most industrial areas; they say people who met her were glowing with happiness." },
        unbound: { name: "Unbound", cardName: "Hanma", description: "This incredibly strong woman always escapes from prison! By the way, her name sounds kind of familiar..." },
        mythic: { name: "Mythic", cardName: "Carmilla", description: "Carmilla is an ancient and powerful dhampir who feeds on the blood of the unfortunate who cross her path. By the way, she can drink other bodily fluids too..." },
        legendary: { name: "Legendary", cardName: "Misa", description: "Misa is an eternal party-goer. Being invited to her party is a great honor; you're lucky." },
        epic: { name: "Epic", cardName: "Gael", description: "You won't just find Gael on the street; she's more likely to be running a 100-meter dash or training her muscles." },
        rare: { name: "Rare", cardName: "Mila", description: "Mila rarely leaves her home due to her blindness; you're lucky to have met her!" },
        common: { name: "Common", cardName: "Eve", description: "Just a regular Eva. Everyone likes her, but she's a bit too basic, isn't she..." },
        garbage: { name: "Junk", cardName: "Garbage Idol", description: "Nobody wants her... maybe you won't throw her away?" },
        error_alt_1: { name: "Corrupted Core", cardName: "3NN_MI#S EVV-VrYw_ER?", description: "Her digital code has mutated. Stability is an illusion, and her reality is crumbling into pixels.She's been passive threat. Now, she's active..." },
        witchy: { name: "Witchy", cardName: "Jizzy, the Cummoner", description: "She's a master summoner, but she uses very... organic materials for her rituals. Her creations are powerful, yet short-lived." },
        blackhole_alt_1: { name: "Singularity", cardName: "Event Horizon", description: "The point of no return. Everything that enters her sight ceases to exist as we know it. Not even light can escape. And neither can you." },
        uranium_alt_1: { name: "Unstable", cardName: "Unstable Uranium-chan", description: "She doesn't just glow anymore. She is the source of energy. The chain reaction has begun, and you'd better stay away. Far away." },
        unbound_alt_1: { name: "Unchained", cardName: "Hanma, Awakened", description: "The chains are broken. Pain has become her fuel. She no longer runs—now, everyone runs from her." },
        space_alt_1: { name: "Primordial", cardName: "Reality Weaver", description: "She has witnessed the birth and death of stars. To her, galaxies are but threads in the infinite tapestry of existence." },
        legendary_alt_1: { name: "Clownish", cardName: "Misa, the Clowness", description: "Aww, how sweet, Misa threw a clown-themed party... But who's going to finish the cake?" },
        epic_alt_1: { name: "Velocity", cardName: "Gael, the Blue Streak", description: "She has surpassed her limits. Now she's ready to run towards her goal with incredible speed, and nothing will stand in her way. And what is her goal? Who knows..." },
        common_alt_1: { name: "GYATT", cardName: "Rizz Eve", description: "It turns out Eve has two very weighty (and soft) arguments for not considering her so ordinary." },
        space_alt_2: { name: "Galactic", cardName: "Galaxy Weaver", description: "After creating hundreds of galaxies and communicating with more influential cosmic entities, she decided to change her image..." },
        rare_alt_1: { name: "Awakened", cardName: "Mila, the Crimson Tear", description: "She has seen the light, but the truth she witnessed drove her mad. Now her gaze brings only pain, and her mind knows only suffering..." },
        garbage_alt_1: { name: "Popular", cardName: "Shining Idol", description: "She went from the garbage can to the spotlight. Now she is who she always dreamed of being, thanks for not throwing me away! *smooch*" },
        goblin: { name: "Cunning", cardName: "Tur'gata", description: "She's crept onto your porch... so what? Oh... she's luring you into a so-called 'breeding trap'. Silly goblins..." },
        berserk_alt_1: { name: "Peaceful", cardName: "Stug, at Peace", description: "The battles are over. The sword is planted in the ground. By the fire, she has finally found the peace she was denied for so long. Perhaps this is her true victory. She is finally happy." },
        timestop_alt_1: { name: "Za Warudo?", cardName: "S.A.K.U.Y.A.", description: "She is the head maid at a very famous mansion. She masterfully throws knives and... it seems she can also stop time. What a coincidence." },
        tungsten: { name: "Hardened", cardName: "Tung Stenn", description: "She didn't live in the gym for nothing, look at her gorgeous, sculpted, and hard abs! Yet, she somehow remains a fragile girl." },
        gold: { name: "Precious", cardName: "Goldy", description: "She shines brighter than the sun, attracting the eyes of both the rich and the thieves. It seems she was drawn here by the abundance of wealth in someone's pockets..." },
        neon: { name: "Neon", cardName: "Neonia", description: "She is the soul of the night city. Bright, alluring, and a little dangerous. Don't touch, you might get an electric shock! (but not too much, she's kind)." },
        chlorine: { name: "Caustic", cardName: "Chloretta", description: "She is one of the horrors of war. Remembered as an executioner among executioners. If only we could find her a Sodium soon..." },
        carbon: { name: "The Giver", cardName: "Life-Giver", description: "She is the basis of all life. From her, both life and death are born. She is multifaceted and infinite in her manifestations." },
        coal: { name: "Smoldering", cardName: "Ember", description: "The simplest form, full of hidden energy. A single spark is enough for her to ignite and warm you with her heat... or burn you to ashes. You don't want a fried sausage, do you?" },
        graphite: { name: "The Drafter", cardName: "Sketchy", description: "She leaves a mark on everything she touches. She knows many trades, from electronics to art. But she came specifically for you." },
        diamond: { name: "High Pressure", cardName: "Dime", description: "The perfect form, born under incredible pressure. She is pure, unbreakable, and incredibly rare. She only appears before those who are ready to pay. They say to see her is the greatest luck." },
        seductress: { name: "Seductress", cardName: "Surie", description: "The tan is flawless, the smile is dangerous. She doesn't rest, she hunts. And if her gaze falls on you, it means the choice has been made." },
        tamer: { name: "Tamer", cardName: "Nufka & Syaba", description: "These two mischievous girls are sisters, and though they have different fathers, they are very close. Because of this, they often spend time together. Nufka is a little fox, and Syaba is a dark elf witch. They have a lot of fun together." },
        vacation: { name: "Vacation", cardName: "Zia", description: "The sun is warm, the cocktail is melting, and her gaze is an invitation to adventure. She knows that rest is not an excuse to lose her grip." },
        altDevil: { name: "The Controlled", cardName: "Demon Under Control", description: "It seems someone managed to put a collar on her. Now the demon of control has become a toy herself. And, it looks like, she's all... messy." },
        librarian: { name: "Erudite", cardName: "Libra", description: "Silence, order, and dusty tomes are her element. She strictly enforces discipline, but behind her stern glasses lies a curious gaze. No noise in the library!" },
        altLibrarian: { name: "Curious", cardName: "Depraved Libra", description: "She has read too many forbidden books. Now she isn't interested in some mere letters, and the blindfold only sharpens her other senses~." },
        shroom: { name: "Fungal", cardName: "Amanita", description: "Cute, but deadly poisonous. One wrong step in her forest could be your last. You shouldn't trust her cute appearance. And also, deer love her." },
        altShroom: { name: "Umami", cardName: "Boletus", description: "Natural and generous, she is the soul of the forest. They say her spores can give life to entire groves. Or to another 'mushroom'... " },
        rias: { name: "Crimson", cardName: "The Crimson-Haired Duchess", description: "The heir of a noble house, known for their crimson hair and... demonic power. She seeks loyal servants, but be warned: her kindness can be as deceptive as her beauty." },
        amy: { name: "Gentle", cardName: "Amy", description: "Amy came here from a distant land. Apparently, the journey was long and arduous, so she decided to rest a little~" },
        raven: { name: "Passionate", cardName: "Raven", description: "She is Amy, who decided to rest in a more... adult way. What she's wearing now is not enough for her, so, perhaps you'll join?" },
        hybrid_safe: { name: "Gyaru", cardName: "Alex", description: "Alex is a sweet, yet sassy gyaru. She loves bright clothes and is always the center of attention." },
        time_eternal: { name: "Eternal", cardName: "Ananke Chrona", description: "She was here before the beginning and will remain after the end. For her, time is but sand slipping through her fingers, and universes are fleeting sparks." },
        shy_princess: { name: "Light Princess", cardName: "Sofia", description: "The complete opposite of her sister. She prefers cozy hoodies and video games, hiding from the world behind a golden crown and white hair. But perhaps she is the true ruler?" },
        dark_princess: { name: "Dark Princess", cardName: "Roxie", description: "The heir to the dark throne with clear gyaru features. She doesn't hide her desires or her power, clad in latex and a crown of obsidian. They say submitting to her is the ultimate pleasure." },
        alastor: { name: "Stayed Gone", cardName: "Radio Demoness", description: "Salutations! Good to be back on the air. Yes, I know it's been a while, since someone with style treated Hell to a broadcast, sinners, rejoice! (By the way, she adores Amanita, as a true deer should)." },
        maternal: { name: "Maternal", cardName: "Tutoriel", description: "Her care is as warming as a hearth fire, and her butterscotch pie can heal any wound. Besides, it seems she's trying to raise your 'Determination' right now... Is it working?" },
        metalhead: { name: "Heavy", cardName: "Kori Bennington", description: "She came here to rock! Her guitar riffs shake the earth, and her stage makeup inspires awe. Are you ready for the heaviest concert of your life?" },
        moon: { name: "Lunar", cardName: "Selena", description: "Cold, distant, and alluring. She silently gazes upon the world from above, holding ancient secrets. Her light beckons lost travelers, promising peace... and satisfaction." },
        mechanic: { name: "The Fixer", cardName: "Jena", description: "Wrenches, the smell of engine oil, and big... talents. She can fix anything, from an old engine to a broken heart. The main thing is not to be afraid to get a little dirty." },
        doctor: { name: "The Healer", cardName: "Tina", description: "She has a cure for all ailments, especially loneliness. One shot of her love, and you'll forget all your troubles. Happy Valentine's Day!" },
        silken: { name: "Silken", cardName: "Hana Akano", description: "Her movements are as smooth as the dance of sakura petals, and her gaze behind the fan hides more than it tells. She is the embodiment of Eastern mystery and refined beauty." },
        ensnared: { name: "Ensnared", cardName: "Elf in a Trap", description: "Even centuries of experience couldn't save her from the simplest of traps. Now she waits for some hapless hero to free her... or take advantage of the situation." },
        guide: { name: "The Guide", cardName: "Mysterious Elf", description: "She has seen empires rise and fall, but her magic is still as potent as ever. She will guide you on any path, but the price for her services may be higher than you expect." },
        gal: { 
            name: "The Origin", 
            cardName: "Gal", 
            description: "She is watching you. Always. She knows your every roll. Perhaps one day she'll decide to fully reveal herself... if you prove your loyalty. (this is her first appearance, she's a bit shy :3)" 
        },
        sodium: { 
            name: "The Reactive", 
            cardName: "Sodia", 
            description: "An incredibly frantic girl. Just a single drop of moisture and she erupts into fire and explosions that leave no witnesses. Someone should find her a Chloretta, and fast..." 
        },
        obsidian: { 
            name: "The Cooled", 
            cardName: "Obsi", 
            description: "The lava's fury has subsided, leaving behind smooth, cool skin. Although she's no longer as scorching, a sharp sense of danger remains with her. Be careful." 
        },
        lava: { 
            name: "The Molten", 
            cardName: "Magmalina", 
            description: "Hot, fluid, and dangerous. One wrong move near her, and you risk becoming part of the landscape. But she's so hot..." 
        },
        goblin_alt_1: { 
            name: "The Satisfied", 
            cardName: "Pleased Tur'gata", 
            description: "It seems someone was cleverer than the goblin. The trap worked, but not quite as she planned. Now she looks very... pleased." 
        },
        salt: { 
            name: "The Salty", 
            cardName: "NaCl",
            description: "The result of a volatile ̶n̶i̶g̶h̶t̶ chemical reaction. NaCl took the best from both and became a pleasant addition to everyone's life. And she's beautiful, too :)" 
        },
        aizen: { 
            name: "Captain", 
            cardName: "Captain Airi", 
            description: "Captain Airi is a woman you can rely on. She is kind, but reasonably strict and fair. Many would give their lives for her." 
        },
        aizen_traitor: { 
            name: "Traitor", 
            cardName: "Airi Sōsuke", 
            description: "As it turns out, Airi is not who she pretended to be. She is not a kind captain, but a calculating and cruel strategist. And she will do anything to bring her plan to fruition. 'No one stands on the top of the world. Not you, not I, not even the gods...'" 
        },
        russian_alt_ussr: { 
            name: "Comrade", 
            cardName: "Comrade Medvedeva", 
            description: "For the Motherland! For the Party! For the UNION! Medvedeva used to be a powerful woman who gave her all for the good of the party. But I'd love to see what's under her 'Iron Curtain'~" 
        },
        sss_dt: { 
            name: "S.S.S. DT", 
            cardName: "Red Devil", 
            description: "The power that flowed through her veins has been unleashed. No more jokes, only pure, primal, devilish might. Jackpot!" 
        },
        silken_alt_sushi: { 
            name: "Omakase", 
            cardName: "Hana Akano (Omakase)", 
            description: "Tonight, the chef offers a special dish. The freshest and most tender ingredients are laid out right on her. 'Itadakimasu!'" 
        },
        russian_alt_usa: { 
            name: "Free", 
            cardName: "Cola Liberty", 
            description: "She has no idea what vodka or a kilometer is. But she has burgers and an eagle (that farms aura). She talks about freedom, democracy, and the right to bear large... guns." 
        },
        alt_maternal: { name: "Nourishing", cardName: "Lactoriel", description: "This is a more... adult version of Tutoriel. She's ready to nourish you with her boundless love and... milk. It's for your 'Determination', of course." },
        alt_witchy: { name: "Supreme", cardName: "Eja, the Arch-Cummoner", description: "Jizzy's mentor. She has perfected the arts of summoning and 'extraction' to a frightening degree. Her spells work with a slight gesture, and her creations... are grand." },
        dionysia: { name: "Intoxicating", cardName: "Dionysia", description: "The goddess of wine, revelry, and madness (and orgies). Her parties last for weeks, and her gaze promises freedom from all worldly cares. Care for some wine?" },
        alt_mythic: { name: "Bloody", cardName: "Girlycard", description: "She's not just a dhampir, she's a walking calamity. She enjoys long walks on the beach, big guns, and the total annihilation of her enemies. 'Bitches love cannons.'" },
        gojo: { name: "Limitless", cardName: "Satsuki Gojo", description: "Throughout heaven and earth, she alone is the honored one. The Six Eyes will forever keep you in fear of her power, and hopefully, she won't feel like expanding your 'territory'..." },
        kefla: { name: "Erupting", cardName: "Kef (LSSJ)", description: "The fusion of two Saiyan girls has unleashed unimaginable power. She's cocky, strong, and ready to erase you from existence with a single ki blast. I hope your blast is more powerful." },
        naruko: { name: "Seductive", cardName: "Naruko", description: "The most powerful and unexpected jutsu. It seems she's relaxing in an onsen after a tough mission. Don't you want to join? I promise, there's no catch, dattebayo!" },
        smoke: { name: "Smoky", cardName: "Fuma", description: "She is formless and intangible, like a fleeting memory or a wisp of smoke. She can be everywhere and nowhere at the same time. Try to catch her, if you can." },
        bleached: {
            name: "Hollowfied",
            cardName: "Kurosaki",
            description: "This red‑haired girl ended up on the wrong end of a sword and became a temporary guardian of souls. She still has a long road ahead..."
        },
        afro: {
            name: "Afro",
            cardName: "Dolores",
            description: "Dolores simply knows she’s cool—period. She may or may not have invented a certain famous dance—the Hypno Dance."
        },
        scrap_golem: {
            name: "Scrapbound",
            cardName: "Scrap Golem",
            description: "A hulking frame hammered from junk and resolve. It moves because you willed it to."
        }
    },
    // Shop Items
    shop: {
        boosts: {
            boost_small: { name: "Small Luck Boost", description: "+0.1 to luck for 30 seconds." },
            boost_medium: { name: "Medium Luck Boost", description: "+0.25 to luck for 2 minutes." },
            boost_large: { name: "Large Luck Boost", description: "+0.5 to luck for 5 minutes." },
            boost_titanic: { name: "Titanic Luck Boost", description: "+1.0 to luck for 10 minutes." }
        },
        equipment: {
            equip_talisman: { name: "Novice's Talisman", description: "+0.05 to luck (permanent)." },
            equip_ring: { name: "Seeker's Ring", description: "+0.1 to luck (permanent)." },
            equip_artifact: { name: "Seer's Artifact", description: "+0.15 to luck (permanent)." },
            equip_pendant: { name: "Fortuna's Pendant", description: "+0.35 to luck (permanent)." },
            equip_golden_ticket: { name: "Golden Ticket", description: "Increases shards from duplicates by 10% (rounded up)." },
            equip_hand_of_misfortune: { name: "Hand of Misfortune", description: "+0.05 luck for each consecutive Garbage, Common, or Rare. Resets on a better roll." },
            equip_greedstone: { name: "Greedstone", description: "Increases shards from duplicates by 25% (rounded up)." },
            equip_distortion_chronometer: { name: "Distortion Chronometer", description: "Triggers Lucky Roll 2 rolls sooner (every 9th roll instead of 11th)." },
            equip_abyssal_hand: { name: "Abyssal Hand", description: "An enhanced version of the Hand of Misfortune. Increases luck for each of the 12 most common cards in a row." },
            equip_fates_thread: { name: "Fate's Thread", description: "When you Rebirth with this item equipped, you will preserve one random item from equipped." },
            equip_alchemists_stone: { name: "Alchemist's Stone", description: "Grants a very small chance to transmute shards from 'bottom-feeder' duplicates into a Luck Core Fragment." },
            equip_disco_glasses: { name: "Disco Glasses", description: "+1.5 luck" },
            equip_soul_badge:    { name: "Soul Badge", description: "Lucky Roll triggers 1 roll sooner. Available via crafting." },
            equip_afro_pick:     { name: "Afro Pick", description: "Cumulative luck from common streaks: +0.03/stack (max 12). Available via crafting." }
        },
        upgrades: {
            upgrade_fast_roll: { name: "Fast Roll", description: "Reduces roll animation time to ~0.75 sec." },
            upgrade_multi_roll_x5: { name: "Multi-Roll x5", description: "Unlocks the ability to perform 5 rolls at once." },
            upgrade_multi_roll_x10: { name: "Multi-Roll x10", description: "Unlocks the ability to perform 10 rolls at once, replacing x5." },
            upgrade_empowered_lucky_roll: { name: "Empowered Lucky Roll", description: "Increases the luck multiplier from a Lucky Roll from x2 to x2.5." },
            upgrade_probability_analyzer: { name: "Probability Analyzer", description: "Displays your effective chance of obtaining a card, accounting for your current luck." },
        },
        luck_core: {
        title: "Luck Core Amplification",
        current_bonus: "Current Bonus",
        description: "Permanently increases base luck. The cost increases with each level.",
        amplify: "Amplify"
        }
    },
    // UI Elements
    ui: {
        prismaticShards: "Prismatic Shards",
        luck: "Luck",
        activeBoosts: "Active Boosts",
        roll: "Roll!",
        multiRoll: "Multi-Roll x5",
        autoroll: "Autoroll",
        stopAutoroll: "Stop Autoroll",
        inventory: "Inventory",
        shop: "Shop",
        settings: "Settings",
        stats: "Statistics",
        openedCards: "Unlocked Cards",
        opened: "Unlocked",
        boostsTemporary: "Luck Boosts (Temporary)",
        equipmentPermanent: "Equipment (Permanent, max 3)",
        equipped: "Equipped",
        upgrades: "Upgrades",
        dataManagement: "Data Management",
        resetProgress: "Reset Progress",
        resetWarning: "Warning! This action will delete all your data and cannot be undone.",
        musicVolume: "Music Volume",
        playerStats: "Player Statistics",
        generalStats: "General Statistics",
        totalRolls: "Total Rolls Made",
        uniqueCardsOpened: "Unique Cards Unlocked",
        currencyFromDuplicates: "Shards from Duplicates",
        statsByRarity: "Statistics by Rarity",
        buy: "Buy",
        purchased: "Purchased",
        equip: "Equip",
        nowEquipped: "Equipped",
        maxEquipment: "Max equipment reached",
        noEquippedItems: "No equipment worn.",
        unequipItem: "Unequip item",
        card: "Card",
        rarity: "Rarity",
        baseChance: "Base Chance",
        guaranteed: "Guaranteed (if nothing else drops)",
        activateEffect: "Activate Effect",
        deactivateEffect: "Deactivate Effect",
        noVisualEffect: "This card has no visual effect.",
        luckyRollNext: "✨ Lucky Roll is next! ✨",
        luckyRollCounter: "Until Lucky Roll",
        youGot: "You got",
        currentBonus: "Current bonus:",
        isNew: "NEW!",
        duplicateReward: "Received for duplicate",
        totalDuplicateReward: "Total received for duplicates",
        luckTooltipTitle: "Luck is your main success multiplier. It doesn't just increase chances; it makes every roll 'higher quality'.\n\n- With a luck of 1.0, your chances are standard.\n- With a luck of 2.0, your odds of getting a rare card are twice as high compared to the odds of failing.\n\nLuck is especially effective for pulling the rarest cards!",
        sortBy: "Sort by:",
        sort: {
            rarity_desc: "Rarity (desc)",
            rarity_asc: "Rarity (asc)",
            name_asc: "Name (A-Z)"
        },
        newCardNotification: {
            title: "✨ NEW CARD! ✨",
            closeBtn: "Awesome!"
        },
        rebirth: {
            title: "Rebirth",
            description: "Reset your progress to gain a permanent luck bonus for each unique card collected.",
            warning: "This will reset your currency, shop upgrades, boosts, equipment, and Luck Core level. Your card collection and statistics will be preserved.",
            current_cards: "Unique cards collected: {count}",
            potential_bonus: "Luck bonus upon rebirth: {bonus}",
            button: "Rebirth",
            confirmation: "ARE YOU SURE?\n\nYou will lose almost all progress except for your card collection. This action is irreversible!",
            success: "Rebirth successful! Received a permanent luck bonus of:",
            unlock_alt_hint: "After your first rebirth, you will start finding exclusive cards and alternative versions of familiar characters!",
            locked_after: "after R{level}"
        },
        notifications: { title: "Notifications", enable: "Enable notifications" },
        data: { 
            title: "Export / Import",
            description: "Save your progress to a file or load it on another device. Importing will overwrite your current progress!",
            export: "Export",
            import: "Import"
        },
        specialContent: { title: "Special Content", enable: "Enable", description: "Enables specific content, like futanari." },
        totalRebirths: "Total Rebirths:",
        achievements: {
            tabTitle: "Achievements",
            title: "Achievements",
            collectionsTitle: "Collections",
            themesTitle: "UI Themes",
            reward: "Reward"
        },
        themes: {
            'default': 'Default',
            'theme-classic': 'Classic',
            'theme-salt': 'Salt',
            'theme-prestige': 'Prestige',
            'theme-shinigami': 'Shinigami',
            'theme-obsidian': 'Obsidian'
        },
        luckCoreFragments: "Core Fragments:",
        effectiveChance: "Effective Chance (with your luck):",
        backpack: "Backpack",
        workshop: "Workshop",
        materials: "Materials",
        myEquipment: "My Equipment",
        noMaterials: "No materials yet.",
        noOwnedEquipment: "No owned equipment yet.",
        noRecipes: "No recipes available.",
        craft: "Craft",
        luckBreakdown: {
            title: "Luck Breakdown",
            base: "Base",
            core: "Luck Core",
            prestige: "Prestige",
            blackhole: "Blackhole dupes",
            equip: "Equipment (flat)",
            misfortune: "Misfortune stacks",
            motivation: "Sword Path",
            boosts: "Boosts",
            multiplier: "multiplier",
            noBoosts: "No active boosts",
            total: "Total"
        }  
    },
    // Notifications
    notifications: {
        luckyRollTriggered: "✨ Lucky Roll! Luck multiplied! ✨",
        notEnoughCurrency: "Not enough Prismatic Shards!",
        itemPurchased: "purchased, but there's no space to equip it. Free up a slot.",
        alreadyPurchased: "is already purchased.",
        upgradeAlreadyPurchased: "is already purchased.",
        supporterStatusAlreadyActive: "Supporter status is already active!",
        checkingSupporterStatus: "Checking supporter status...",
        supporterStatusConfirmed: "Supporter status confirmed. Thank you!",
        supporterStatusExpired: "Supporter status has expired. Perks have been deactivated.",
        supporterPerksActivated: "Thank you for your support! Perks activated: Diamond Card and a 4th equipment slot!",
        supporterStatusNotFound: "Supporter status not found. Please make sure you sent the correct ID.",
        supporterCheckError: "Error checking status. Please try again later.",
        playerIdCopied: "Player ID copied!",
        playerIdCopyError: "Failed to copy ID.",
        afkSummary: "While you were away, {rolls} rolls were performed.<br>💎 Shards from duplicates: {currency}<br>✨ New cards found: {newCards}!",
        afkSummaryNoNewCards: "While you were away, {rolls} rolls were performed.<br>💎 Shards from duplicates: {currency}",
        afkSummaryNoCurrency: "While you were away, {rolls} rolls were performed.<br>✨ New cards found: {newCards}!",
        afkSummaryRollsOnly: "While you were away, {rolls} rolls were performed.",
        jackpotEffectTriggered: "JACKPOT! +{bonus} LUCK!",
        corruptionEffectTriggered: "CORRUPTION! {original} -> {upgraded}",
        corruptionEffectTriggeredMulti: "CRITICAL CORRUPTION! {original} -> {upgraded} (+{tiers} TIERS!)",
        exportSuccess: "Save exported successfully!",
        exportError: "Error exporting save.",
        importConfirm: "WARNING!\nImporting a save will overwrite your current progress. This action is irreversible.\n\nContinue?",
        importSuccess: "Save imported successfully! Reloading...",
        importError: "Error importing save:",
        settingsRefresh: "Settings will be applied after reloading the page.",
        itemUnequippedDueToSlotLoss: "The 4th equipment slot bonus has expired. Item '{itemName}' has been unequipped.",
        achievementUnlocked: "Achievement Unlocked",
        reward: "Reward",
        luckCoreFragmentFound: "Found a Luck Core Fragment! ({current}/{needed})",
        luckCoreAmplifiedByFragments: "Luck Core amplified using Fragments!",
        notEnoughMaterials: "Not enough materials!",
        craftSuccess: "Craft completed!",
        notEnoughForRebirth: "Not enough shards for Rebirth!"
    },
    debug: {
        notifications: {
            allCardsUnlocked: "All cards unlocked!",
            cardAdded: "Card added for rarity:",
            guaranteedRoll: "Performed a guaranteed roll for",
            
        },
        effect: {
            active: "Active",
            cumulative: "Cumul.",
            stack: "stack"
        }
    },
    mechanical_effects: {
        description_title: "Mechanical Effect:",
        high_risk_high_reward: "Each roll with this effect costs 5 💎. Grants a 0.5% chance to get +100.0 luck for a single roll. High risk, high reward!",
        universal_upgrade: "Grants a 10% chance to upgrade the roll result by one tier. Or even more with ALt-tErn..",
        sword_path: "Each consecutive fast roll (within 10s) adds +0.005 to luck (max +0.25). Bonus resets on inactivity.",
        duplicate_collector: "Each duplicate of this card permanently increases your luck by 0.01.", // <<< ADDED
        quality_guarantor: "While this effect is active, 'Junk' rarity cards cannot be rolled. You get a 'Common' card instead.", // <<< ADDED
        boost_catalyst: "Increases the effectiveness of temporary luck boosts from the shop by 25%.",
        no_effect: "This card has no mechanical effect.",
        equip_button: "Equip Effect",
        unequip_button: "Unequip Effect",
        equipped_label: "(Equipped)"
    },
    passive_effects: {
        description_title: "Passive Effect:",
        active_label: "(Active)",
        duplicate_currency_bonus_percent: "Increases shards from duplicates by 15%. Stacks with equipment.",
        global_purchase_discount: "Reduces the cost of all purchases (items, upgrades, core, rebirth) by 10%."
    },
    events: {
        timeLeft: "Time left",
        march_of_artists: {
            name: "March of the Artists",
            description: "Attention, the creators have taken the stage! The chance of rolling cards related to art and style is significantly increased."
        },
        crystal_fever: {
            name: "Crystal Fever",
            description: "Shard rewards from duplicate cards are increased by x1.5!"
        },
        black_clover: {
            name: "Black Clover",
            description: "Time to test your fortune! Your Luck is doubled for the duration of this event."
        }
    },
    achievements: {
        roll_1000: { name: "Novice Player", description: "Perform 1,000 rolls." },
        roll_10000: { name: "Avid Collector", description: "Perform 10,000 rolls." },
        open_all_mythic: { name: "Mythic Master", description: "Unlock all Mythic rarity cards." },
        five_rares_in_multi: { name: "Blue Fever", description: "Get 5 Rare cards in a single multi-roll." },
        unlock_salt_card: { 
            name: "Poison + Explosion = Yummy", 
            description: "Obtain the elemental cards that need each other to unlock a new card for the roll pool." 
        },
        get_salt_card: { name: "Salt of the Earth", description: "Obtain the 'Salt' card.", rewardName: "'Salt' Theme" },
        reach_prestige_6: { name: "Major League", description: "Reach Prestige level 6.", rewardName: "'Prestige' Theme" },
        roll_1000000: { name: "Marathon Runner", description: "Perform 1,000,000 rolls." },
        roll_1000000000: { name: "Living Legend", description: "Perform 1,000,000,000 rolls. We admire your dedication." },
        use_fates_thread: { name: "Ariadne's Thread", description: "Successfully preserve an item on Rebirth using 'Fate's Thread'." },
        empower_core_with_stone: { name: "Apprentice Alchemist", description: "Amplify the Luck Core using the 'Alchemist's Stone' once." },
        first_mega_rare: { name: "Beyond Luck", description: "Obtain your first card with a drop chance rarer than 1 in a million." },
        get_bleached_card: { name: "Taste of Shinigami", description: "Obtain the 'Bleached' card." },
        get_afro_card: { name: "Dancefloor Queen", description: "Obtain the 'Afro' card." },
        craft_3_items: { name: "First Crafter", description: "Craft 3 items." },
        collect_100_materials_total: { name: "Small Hoarder", description: "Collect 100 materials (total)." },
        reach_prestige_2: { name: "The Path Begins", description: "Reach Prestige 2." }
    },
    collections: {
        classic_set: {
            name: "Classic Set",
            description: "Collect the first 5 cards of the base rarities.",
            rewardName: "'Classic' Theme"
        }
    },
    materials: {
        scrap:           { name: "Scrap" },
        obsidian_shard:  { name: "Obsidian Shard" },
        silken_thread:   { name: "Silken Thread" },
        lava_core:       { name: "Lava Core" },
        carbon_shard:    { name: "Carbon Shard" },
        hollow_mask:     { name: "Hollow Mask Fragment" },
        soul_shard:      { name: "Soul Shard" },
        reiatsu_thread:  { name: "Reiatsu Thread" },
        afro_fiber:      { name: "Afro Fiber" },
        neon_tube:       { name: "Neon Tube" },
        cosmic_dust:     { name: "Cosmic Dust" },
        moon_tears:      { name: "Moon Tears" },
        gold_leaf:       { name: "Gold Leaf" },
        steel_ingot:     { name: "Steel Ingot" },
        vinyl_chip:      { name: "Vinyl Chip" },
        crystal_shard:   { name: "Crystal Shard" },
        graphite_powder: { name: "Graphite Powder" },
        bee_royal_jelly: { name: "Royal Jelly" },
        shroom_spores:   { name: "Shroom Spores" },
        devil_chain_link:{ name: "Chain Link" }
    },
    craft: {
        theme_obsidian_forge: {
        name: "Theme: Obsidian Forge",
        description: "Tempered in molten stone. Unlocks a dark, prestige-like theme."
    },
    equip_steel_edge: {
        name: "Steel Edge",
        description: "A polished relic. Grants an equipment item."
    },
    card_alt_shroom: {
        name: "Alt Card: Boletus",
        description: "Weave silk and ignite a lava core to craft the alt Shroom."
    },
    theme_shinigami: { name: "Theme: Shinigami", description: "Black, white and orange. Hollow patterns and a faint red glow." },
    card_scrap_golem: {
        name: "Card: Scrap Golem (exclusive)",
        description: "150 scrap and a pinch of graphite—shape the heap and wake the metal."
    }
    }
};
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
            equip_golden_ticket: { name: "Golden Ticket", description: "Increases shards from duplicates by 10% (rounded up)." },
            equip_hand_of_misfortune: { name: "Hand of Misfortune", description: "+0.05 luck for each consecutive Garbage, Common, or Rare. Resets on a better roll." }
        },
        upgrades: {
            upgrade_fast_roll: { name: "Fast Roll", description: "Reduces roll animation time to ~0.75 sec." },
            upgrade_multi_roll_x5: { name: "Multi-Roll x5", description: "Unlocks the ability to perform 5 rolls at once." }
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
            locked_after: "after R{level}"
        }
    },
    // Notifications
    notifications: {
        luckyRollTriggered: "✨ Lucky Roll! Luck multiplied! ✨",
        notEnoughCurrency: "Not enough Prismatic Shards!",
        itemPurchased: "purchased, but there's no space to equip it. Free up a slot.",
        alreadyPurchased: "is already purchased.",
        upgradeAlreadyPurchased: "is already purchased."
    },
    debug: {
        notifications: {
            allCardsUnlocked: "All cards unlocked!",
            cardAdded: "Card added for rarity:",
            guaranteedRoll: "Performed a guaranteed roll for",
            notEnoughForRebirth: "Not enough shards for Rebirth!"
        },
        effect: {
            active: "Active",
            cumulative: "Cumul.",
            stack: "stack"
        }
    }
};
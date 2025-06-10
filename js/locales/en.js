// Ensure the global locales object exists
if (!window.locales) {
    window.locales = {};
}

// Add the English translation
window.locales.en = {
    // Cards
    cards: {
        blackhole: { name: "Supermassive", description: "You've found one of the rarest creatures in the universe. Oh, and it seems she's up to something interesting~~" },
        berserk: { name: "Furious", description: "As you can see, she has endured much in her life. She was branded with the Mark of Sacrifice. Now her fury knows no bounds... (and she has a cool sword and armor)." },
        bee: { name: "Buzzing", description: "This creature is clearly unhappy that you've invaded its hive. You better run." },
        russian: { name: "Homely", description: "You know, *hic*, I really love my country! Just, let me, *hic*, sleep..." },
        motivation: { name: "Motivation", description: "Power. Motivation. POWER. These words embody this girl, who skillfully wields her katana and never loses focus. (By the way, her favorite dish is Berry Delight)." },
        smokinsexystyle: { name: "S.S.S.", description: "Time to light it up! This party's getting crazy! - these were the exact words this lady spoke before disappearing in an unknown direction." },
        cosmic: { name: "Dark Cosmos", description: "From the void where stars die, she gazes upon the fragility of worlds. Her hunger is eternal, and her gaze is fixed on the abyss. You'd be better off not crossing her path." },
        space: { name: "Cosmic", description: "She weaves patterns from stardust, illuminating the path for lost souls in the infinity. The weaver is kind to all visitors of her gloomy habitat." },
        timestop: { name: "THE WORLD", description: "Oh, you're approaching me? Instead of running away, you're coming right to me?" },
        jackpot: { name: "Jackpot", description: "Do you believe in luck? Did you know that 99.9% of gamblers quit right before they're about to hit it big? Time to deposit! TUCA DONKA!" },
        devil: { name: "Devilish", description: "Everything is under control. At least for her. Makima go to h*ll!" },
        error: { name: "ERROR", description: "Few know who or what this is. It is only known that it is a malevolent spawn of the digital reality..." },
        uranium: { name: "Uranium", description: "Uranium-chan is only found in the most industrial areas; they say people who met her were glowing with happiness." },
        unbound: { name: "Unbound", description: "This incredibly strong woman always escapes from prison! By the way, her name sounds kind of familiar..." },
        mythic: { name: "Mythic", description: "Carmilla is an ancient and powerful dhampir who feeds on the blood of the unfortunate who cross her path. By the way, she can drink other bodily fluids too..." },
        legendary: { name: "Legendary", description: "Misa is an eternal party-goer. Being invited to her party is a great honor; you're lucky." },
        epic: { name: "Epic", description: "You won't just find Gael on the street; she's more likely to be running a 100-meter dash or training her muscles." },
        rare: { name: "Rare", description: "Mila rarely leaves her home due to her blindness; you're lucky to have met her!" },
        common: { name: "Common", description: "Just a regular Eve. Everyone likes her, but she's a bit too basic, isn't she..." },
        garbage: { name: "Junk", description: "Nobody wants her... maybe you won't throw her away?" }
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
        totalDuplicateReward: "Total received for duplicates"
    },
    // Notifications
    notifications: {
        luckyRollTriggered: "✨ Lucky Roll! Luck multiplied! ✨",
        notEnoughCurrency: "Not enough Prismatic Shards!",
        itemPurchased: "purchased, but there's no space to equip it. Free up a slot.",
        alreadyPurchased: "is already purchased.",
        upgradeAlreadyPurchased: "is already purchased."
    }
};
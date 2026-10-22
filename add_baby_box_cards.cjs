const fs = require('fs');
const vm = require('vm');
const window = {};
vm.runInNewContext(fs.readFileSync('tcg-data.js', 'utf8'), { window });
const cards = window.CARD_DATA;

const newCards = [
  // 1. Igglybuff (30C 120)
  {
    id: '30c-120',
    name: 'Igglybuff',
    supertype: 'Pokémon',
    subtypes: ['Basic'],
    hp: '30',
    types: ['Colorless'],
    attacks: [
      {
        name: 'Bouncy Circle',
        cost: [],
        convertedEnergyCost: 0,
        damage: '30×',
        text: 'This attack does 30 damage for each of your Benched Pokémon that has a maximum HP of 30.'
      }
    ],
    weaknesses: [{ type: 'Fighting', value: '×2' }],
    retreatCost: [],
    convertedRetreatCost: 0,
    number: '120',
    rarity: 'Common',
    nationalPokedexNumbers: [174],
    legalities: { unlimited: 'Legal', standard: 'Legal', expanded: 'Legal' },
    regulationMark: 'J',
    images: {
      small: 'https://images.pokemontcg.io/30c/120.png',
      large: 'https://images.pokemontcg.io/30c/120_hires.png'
    }
  },

  // 2. Poltchageist (PBL 5)
  {
    id: 'pbl-5',
    name: 'Poltchageist',
    supertype: 'Pokémon',
    subtypes: ['Basic'],
    hp: '30',
    types: ['Grass'],
    attacks: [
      {
        name: 'Spill Powder',
        cost: ['Grass'],
        convertedEnergyCost: 1,
        damage: '10',
        text: ''
      }
    ],
    weaknesses: [{ type: 'Fire', value: '×2' }],
    retreatCost: ['Colorless'],
    convertedRetreatCost: 1,
    number: '5',
    rarity: 'Common',
    nationalPokedexNumbers: [1012],
    legalities: { unlimited: 'Legal', standard: 'Legal', expanded: 'Legal' },
    regulationMark: 'J',
    images: {
      small: 'https://images.pokemontcg.io/pbl/5.png',
      large: 'https://images.pokemontcg.io/pbl/5_hires.png'
    }
  },

  // 3. Misty's Magikarp (DRI 48)
  {
    id: 'dri-48',
    name: "Misty's Magikarp",
    supertype: 'Pokémon',
    subtypes: ['Basic'],
    hp: '30',
    types: ['Water'],
    abilities: [
      {
        name: 'So Submerged',
        text: "As long as this Pokémon is on your Bench, prevent all damage from and effects of attacks from your opponent's Pokémon done to this Pokémon.",
        type: 'Ability'
      }
    ],
    attacks: [
      {
        name: 'Splash',
        cost: ['Water'],
        convertedEnergyCost: 1,
        damage: '10',
        text: ''
      }
    ],
    weaknesses: [{ type: 'Lightning', value: '×2' }],
    retreatCost: ['Colorless'],
    convertedRetreatCost: 1,
    number: '48',
    rarity: 'Common',
    nationalPokedexNumbers: [129],
    legalities: { unlimited: 'Legal', standard: 'Legal', expanded: 'Legal' },
    regulationMark: 'I',
    images: {
      small: 'https://images.pokemontcg.io/dri/48.png',
      large: 'https://images.pokemontcg.io/dri/48_hires.png'
    }
  },

  // 4. Tyrogue (MEG 71)
  {
    id: 'meg-71',
    name: 'Tyrogue',
    supertype: 'Pokémon',
    subtypes: ['Basic'],
    hp: '30',
    types: ['Fighting'],
    attacks: [
      {
        name: 'Pow-Pow Punching',
        cost: [],
        convertedEnergyCost: 0,
        damage: '10+',
        text: 'Flip a coin until you get tails. This attack does 30 more damage for each heads.'
      }
    ],
    weaknesses: [{ type: 'Psychic', value: '×2' }],
    retreatCost: [],
    convertedRetreatCost: 0,
    number: '71',
    rarity: 'Common',
    nationalPokedexNumbers: [236],
    legalities: { unlimited: 'Legal', standard: 'Legal', expanded: 'Legal' },
    regulationMark: 'I',
    images: {
      small: 'https://images.pokemontcg.io/meg/71.png',
      large: 'https://images.pokemontcg.io/meg/71_hires.png'
    }
  },

  // 5. Shaymin (DRI 10)
  {
    id: 'dri-10',
    name: 'Shaymin',
    supertype: 'Pokémon',
    subtypes: ['Basic'],
    hp: '80',
    types: ['Grass'],
    abilities: [
      {
        name: 'Flower Curtain',
        text: "Prevent all damage done to your Benched Pokémon that don't have a Rule Box by attacks from your opponent's Pokémon.",
        type: 'Ability'
      }
    ],
    attacks: [
      {
        name: 'Smash Kick',
        cost: ['Colorless', 'Colorless'],
        convertedEnergyCost: 2,
        damage: '30',
        text: ''
      }
    ],
    weaknesses: [{ type: 'Fire', value: '×2' }],
    retreatCost: ['Colorless'],
    convertedRetreatCost: 1,
    number: '10',
    rarity: 'Uncommon',
    nationalPokedexNumbers: [492],
    legalities: { unlimited: 'Legal', standard: 'Legal', expanded: 'Legal' },
    regulationMark: 'I',
    images: {
      small: 'https://images.pokemontcg.io/dri/10.png',
      large: 'https://images.pokemontcg.io/dri/10_hires.png'
    }
  },

  // 6. Patrat (CRI 70)
  {
    id: 'cri-70',
    name: 'Patrat',
    supertype: 'Pokémon',
    subtypes: ['Basic'],
    hp: '70',
    types: ['Colorless'],
    abilities: [
      {
        name: 'Watchful Eye',
        text: "Damage counters on each Pokémon (both yours and your opponent's) can't be moved to other Pokémon.",
        type: 'Ability'
      }
    ],
    attacks: [
      {
        name: 'Bite',
        cost: ['Colorless'],
        convertedEnergyCost: 1,
        damage: '10',
        text: ''
      }
    ],
    weaknesses: [{ type: 'Fighting', value: '×2' }],
    retreatCost: ['Colorless'],
    convertedRetreatCost: 1,
    number: '70',
    rarity: 'Common',
    nationalPokedexNumbers: [504],
    legalities: { unlimited: 'Legal', standard: 'Legal', expanded: 'Legal' },
    regulationMark: 'J',
    images: {
      small: 'https://images.pokemontcg.io/cri/70.png',
      large: 'https://images.pokemontcg.io/cri/70_hires.png'
    }
  },

  // 7. Buddy-Buddy Poffin (TEF 144)
  {
    id: 'tef-144',
    name: 'Buddy-Buddy Poffin',
    supertype: 'Trainer',
    subtypes: ['Item'],
    rules: [
      'Search your deck for up to 2 Basic Pokémon with 70 HP or less and put them onto your Bench. Then, shuffle your deck.'
    ],
    number: '144',
    rarity: 'Uncommon',
    legalities: { unlimited: 'Legal', standard: 'Legal', expanded: 'Legal' },
    regulationMark: 'H',
    images: {
      small: 'https://images.pokemontcg.io/tef/144.png',
      large: 'https://images.pokemontcg.io/tef/144_hires.png'
    }
  },

  // 8. Brave Bangle (WHT 80)
  {
    id: 'wht-80',
    name: 'Brave Bangle',
    supertype: 'Trainer',
    subtypes: ['Pokémon Tool'],
    rules: [
      "If the Pokémon this card is attached to doesn't have a Rule Box, the attacks it uses do 30 more damage to your opponent's Active Pokémon ex (before applying Weakness and Resistance)."
    ],
    number: '80',
    rarity: 'Uncommon',
    legalities: { unlimited: 'Legal', standard: 'Legal', expanded: 'Legal' },
    regulationMark: 'I',
    images: {
      small: 'https://images.pokemontcg.io/wht/80.png',
      large: 'https://images.pokemontcg.io/wht/80_hires.png'
    }
  },

  // 9. Pokégear 3.0 (SVI 186)
  {
    id: 'sv1-186',
    name: 'Pokégear 3.0',
    supertype: 'Trainer',
    subtypes: ['Item'],
    rules: [
      'Look at the top 7 cards of your deck. You may reveal a Supporter card you find there and put it into your hand. Shuffle the other cards back into your deck.'
    ],
    number: '186',
    rarity: 'Common',
    legalities: { unlimited: 'Legal', standard: 'Legal', expanded: 'Legal' },
    regulationMark: 'H',
    images: {
      small: 'https://images.pokemontcg.io/sv1/186.png',
      large: 'https://images.pokemontcg.io/sv1/186_hires.png'
    }
  },

  // 10. Morty's Conviction (TEF 155)
  {
    id: 'tef-155',
    name: "Morty's Conviction",
    supertype: 'Trainer',
    subtypes: ['Supporter'],
    rules: [
      'You can use this card only if you discard another card from your hand.',
      "Draw a card for each of your opponent's Benched Pokémon."
    ],
    number: '155',
    rarity: 'Uncommon',
    legalities: { unlimited: 'Legal', standard: 'Legal', expanded: 'Legal' },
    regulationMark: 'H',
    images: {
      small: 'https://images.pokemontcg.io/tef/155.png',
      large: 'https://images.pokemontcg.io/tef/155_hires.png'
    }
  },

  // 11. Hassel (TWM 151)
  {
    id: 'twm-151',
    name: 'Hassel',
    supertype: 'Trainer',
    subtypes: ['Supporter'],
    rules: [
      "You can use this card only if any of your Pokémon were Knocked Out during your opponent's last turn.",
      'Look at the top 8 cards of your deck and put up to 3 of them into your hand. Shuffle the other cards back into your deck.'
    ],
    number: '151',
    rarity: 'Uncommon',
    legalities: { unlimited: 'Legal', standard: 'Legal', expanded: 'Legal' },
    regulationMark: 'H',
    images: {
      small: 'https://images.pokemontcg.io/sv6/151.png',
      large: 'https://images.pokemontcg.io/sv6/151_hires.png'
    }
  },

  // 12. Rescue Board (TEF 159)
  {
    id: 'tef-159',
    name: 'Rescue Board',
    supertype: 'Trainer',
    subtypes: ['Pokémon Tool'],
    rules: [
      "The Retreat Cost of the Pokémon this card is attached to is Colorless less. If that Pokémon's remaining HP is 30 or less, it has no Retreat Cost."
    ],
    number: '159',
    rarity: 'Uncommon',
    legalities: { unlimited: 'Legal', standard: 'Legal', expanded: 'Legal' },
    regulationMark: 'H',
    images: {
      small: 'https://images.pokemontcg.io/tef/159.png',
      large: 'https://images.pokemontcg.io/tef/159_hires.png'
    }
  },

  // 13. Special Red Card (CRI 82)
  {
    id: 'cri-82',
    name: 'Special Red Card',
    supertype: 'Trainer',
    subtypes: ['Item'],
    rules: [
      'You can use this card only if your opponent has 3 or fewer Prize cards remaining.',
      'Your opponent shuffles their hand and puts it on the bottom of their deck. If they put any cards on the bottom of their deck in this way, they draw 3 cards.'
    ],
    number: '82',
    rarity: 'Uncommon',
    legalities: { unlimited: 'Legal', standard: 'Legal', expanded: 'Legal' },
    regulationMark: 'J',
    images: {
      small: 'https://images.pokemontcg.io/cri/82.png',
      large: 'https://images.pokemontcg.io/cri/82_hires.png'
    }
  },

  // 14. Mist Energy (TEF 161)
  {
    id: 'tef-161',
    name: 'Mist Energy',
    supertype: 'Energy',
    subtypes: ['Special'],
    rules: [
      'As long as this card is attached to a Pokémon, it provides Colorless Energy.',
      "Prevent all effects of attacks used by your opponent's Pokémon done to the Pokémon this card is attached to."
    ],
    number: '161',
    rarity: 'Uncommon',
    legalities: { unlimited: 'Legal', standard: 'Legal', expanded: 'Legal' },
    regulationMark: 'H',
    images: {
      small: 'https://images.pokemontcg.io/tef/161.png',
      large: 'https://images.pokemontcg.io/tef/161_hires.png'
    }
  },

  // 15. Legacy Energy (TWM 167)
  {
    id: 'twm-167',
    name: 'Legacy Energy',
    supertype: 'Energy',
    subtypes: ['Special', 'ACE SPEC'],
    rules: [
      "ACE SPEC: You can't have more than 1 ACE SPEC card in your deck.",
      'As long as this card is attached to a Pokémon, it provides every type of Energy but provides only 1 Energy at a time.',
      'Once per game, if the Pokémon this card is attached to is Knocked Out by damage from an attack from your opponent’s Pokémon, that opponent takes 1 fewer Prize card.'
    ],
    number: '167',
    rarity: 'ACE SPEC Rare',
    legalities: { unlimited: 'Legal', standard: 'Legal', expanded: 'Legal' },
    regulationMark: 'H',
    images: {
      small: 'https://images.pokemontcg.io/sv6/167.png',
      large: 'https://images.pokemontcg.io/sv6/167_hires.png'
    }
  }
];

for (const nc of newCards) {
  const idx = cards.findIndex(c => c.id === nc.id);
  if (idx >= 0) cards[idx] = nc;
  else cards.push(nc);
}

fs.writeFileSync('tcg-data.js', 'window.CARD_DATA=' + JSON.stringify(cards) + ';', 'utf8');
console.log('tcg-data.js updated with Baby Box cards. Total cards now:', cards.length);

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { Game, DECKS, DECK_INFO } = require('./mega-engine.js');
const { install } = require('./pro-ai.js');
const dragapultAI = require('./dragapult-ai.js');
const lucarioAI = require('./lucario-ai.js');
install(Game, lucarioAI.takeTurn, dragapultAI.takeTurn);

const window = {};
vm.runInNewContext(fs.readFileSync('tcg-data.js', 'utf8'), { window });
const cards = window.CARD_DATA;

console.log('Testing 16 decks validation and games...');

const EXPECTED_DECKS = [
  'rocket',
  'dragapult',
  'lucario',
  'charizard',
  'ragingbolt',
  'terapagos',
  'archaludon',
  'zoroark',
  'grimmsnarl',
  'exeggutor',
  'babybox',
  'festival',
  'ceruledge',
  'hydrapple',
  'pecharunt',
  'feraligatr'
];

assert.equal(EXPECTED_DECKS.length, 16, 'Must have 16 decks');

const cardMap = Object.fromEntries(cards.map(c => [c.id, c]));

for (const deckKey of EXPECTED_DECKS) {
  assert.ok(DECKS[deckKey], `Deck ${deckKey} must exist in DECKS`);
  const deckCards = DECKS[deckKey];
  const total = Object.values(deckCards).reduce((a, b) => a + b, 0);
  assert.equal(total, 60, `Deck ${deckKey} must have exactly 60 cards`);
  assert.ok(DECK_INFO[deckKey], `Deck ${deckKey} must exist in DECK_INFO`);

  let aceSpecCount = 0;
  for (const [cardId, count] of Object.entries(deckCards)) {
    const card = cardMap[cardId];
    assert.ok(card, `Card ${cardId} in deck ${deckKey} must exist in CARD_DATA`);
    const isBasicEnergy = card.supertype === 'Energy' && card.subtypes?.includes('Basic');
    if (!isBasicEnergy) {
      assert.ok(count <= 4, `Card ${cardId} in deck ${deckKey} exceeds max 4 copies (has ${count})`);
    }
    if (card.subtypes?.includes('ACE SPEC')) {
      aceSpecCount += count;
    }
  }
  assert.ok(aceSpecCount <= 1, `Deck ${deckKey} has more than 1 ACE SPEC (has ${aceSpecCount})`);
}

// Test newGame with all combinations or selected matchups
for (const pDeck of EXPECTED_DECKS) {
  const g = new Game(cards, Math.random, [pDeck, 'dragapult']);
  assert.equal(g.me.deckName, pDeck);
  assert.ok(g.me.active, 'Player has active Pokémon');
  assert.ok(g.me.hand.length >= 7, 'Player has at least 7 cards in hand (6 setup + 1 draw)');
  assert.equal(g.me.prize.length, 6, 'Player has 6 prizes');
}

for (const cpuDeck of EXPECTED_DECKS) {
  const g = new Game(cards, Math.random, ['dragapult', cpuDeck]);
  assert.equal(g.bot.deckName, cpuDeck);
  assert.ok(g.bot.active, 'CPU has active Pokémon');
  assert.equal(g.bot.prize.length, 6, 'CPU has 6 prizes');
  
  // Test CPU can execute aiTurn without error
  g.turn = 1;
  g.bot.turns = 2;
  assert.doesNotThrow(() => {
    g.aiTurn();
  }, `CPU with deck ${cpuDeck} should execute aiTurn without throwing`);
}

console.log('All 16 decks validation and CPU turns passed!');

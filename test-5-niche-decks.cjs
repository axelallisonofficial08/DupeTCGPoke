const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { Game, DECKS, DECK_INFO } = require('./mega-engine.js');

const window = {};
vm.runInNewContext(fs.readFileSync('tcg-data.js', 'utf8'), { window });
const cards = window.CARD_DATA;
const cardMap = Object.fromEntries(cards.map(c => [c.id, c]));

let serial = 1000;
const inst = id => ({ uid: ++serial, id });

console.log('Testing 5 Niche Decks mechanics...');

// 1. FESTIVAL LEAD & FESTIVAL GROUNDS
{
  const g = new Game(cards, () => 0.49, ['festival', 'dragapult']);
  // Setup Festival Grounds stadium
  g.stadium = { id: 'twm-149', card: inst('twm-149'), owner: g.me };
  
  // Set active to Dipplin (twm-18) with 1 Grass Energy
  g.me.active = g.unit(inst('twm-18'), 1);
  g.me.active.energy.push(inst('sve-1'));
  
  // Set bench of 3 Pokémon
  g.me.bench = [
    g.unit(inst('twm-17'), 1),
    g.unit(inst('twm-14'), 1),
    g.unit(inst('twm-15'), 1)
  ];
  
  g.me.turns = 2;
  g.turn = 0;
  
  // Attack: Do the Wave (index 0 on Dipplin)
  // 3 benched Pokémon * 20 = 60 damage
  const res1 = g.attack(0);
  assert.ok(res1.ok, 'First attack should succeed');
  assert.equal(g.bot.active.damage, 60, 'Do the Wave should deal 60 damage');
  assert.equal(g.me.festivalSecondAttack, true, 'Festival Lead should grant a second attack');
  assert.equal(g.turn, 0, 'Turn should NOT end yet because of Festival Lead');
  
  // Second attack
  const res2 = g.attack(0);
  assert.ok(res2.ok, 'Second attack should succeed');
  assert.equal(g.bot.active.damage, 120, 'Opponent should now have 120 damage');
  assert.equal(g.me.festivalSecondAttack, false, 'Festival second attack flag reset');
  assert.equal(g.turn, 1, 'Turn should now end');
  console.log('✔ Festival Lead double attack & Do the Wave passed');
}

// 2. CERULEDGE EX & DISCARD ACCELERATION
{
  const g = new Game(cards, () => 0.49, ['ceruledge', 'dragapult']);
  g.me.active = g.unit(inst('ssp-35'), 1);
  g.me.active.energy.push(inst('sve-2'));
  g.me.turns = 2;
  g.turn = 0;
  
  // Put 5 energy cards in discard pile
  for (let i = 0; i < 5; i++) {
    g.me.discard.push(inst('sve-2'));
  }
  
  // Abyssal Flame: 30 + 20 * 5 = 130 damage
  const moves = g.validMoves(g.me);
  const abyssal = moves.find(m => m.attack.name === 'Abyssal Flame');
  assert.ok(abyssal, 'Ceruledge should have Abyssal Flame');
  
  const res = g.attack(abyssal.index);
  assert.ok(res.ok);
  assert.equal(g.bot.active.damage, 130, 'Abyssal Flame deals 30 + 20 * 5 = 130');
  console.log('✔ Ceruledge ex Abyssal Flame scaling passed');
}

// 3. HYDRAPPLE EX & GRAND TREE
{
  const g = new Game(cards, () => 0.49, ['hydrapple', 'dragapult']);
  g.me.active = g.unit(inst('scr-14'), 1);
  g.me.active.energy.push(inst('sve-1'), inst('sve-1'));
  
  g.me.bench = [
    g.unit(inst('twm-17'), 1)
  ];
  g.me.bench[0].energy.push(inst('sve-1'), inst('sve-1'), inst('sve-1'));
  
  g.me.turns = 2;
  g.turn = 0;
  
  // Total Grass Energy in play: 2 (Active) + 3 (Bench) = 5
  // Syrup Storm: 30 + 30 * 5 = 180 damage
  const moves = g.validMoves(g.me);
  const syrup = moves.find(m => m.attack.name === 'Syrup Storm');
  assert.ok(syrup, 'Hydrapple has Syrup Storm');
  
  const res = g.attack(syrup.index);
  assert.ok(res.ok);
  assert.equal(g.bot.active.damage, 180, 'Syrup Storm deals 30 + 30 * 5 = 180');
  
  // Test Grand Tree Stadium
  g.turn = 0;
  g.stadium = { id: 'scr-136', card: inst('scr-136'), owner: g.me };
  // Put Dipplin and Hydrapple in deck
  g.me.deck.push(inst('scr-13'), inst('scr-14'));
  // Applin on bench was placed at turn 1, current turn is 2
  assert.ok(g.canUseStadium(g.me), 'Grand Tree should be usable');
  const resTree = g.useStadium(g.me);
  assert.ok(resTree.ok, 'Grand Tree execution should succeed');
  assert.equal(g.top(g.me.bench[0]).id, 'scr-14', 'Applin should evolve directly into Hydrapple ex via Grand Tree');
  console.log('✔ Hydrapple ex Syrup Storm & Grand Tree evolution passed');
}

// 4. PECHARUNT EX & POISON BOX
{
  const g = new Game(cards, () => 0.49, ['pecharunt', 'dragapult']);
  // Pecharunt on bench
  g.me.bench = [
    g.unit(inst('sfa-39'), 1), // Pecharunt ex
    g.unit(inst('sfa-36'), 1)  // Okidogi
  ];
  // Active is someone else
  g.me.active = g.unit(inst('twm-95'), 1); // Munkidori
  g.me.turns = 2;
  g.turn = 0;
  // Give bot a high HP active (Dragapult ex: 320 HP)
  g.bot.active = g.unit(inst('me2pt5-160'), 1);
  
  // Give Okidogi 2 Darkness energies and Binding Mochi
  g.me.bench[1].energy.push(inst('sve-7'), inst('sve-7'));
  g.me.bench[1].tool = inst('sfa-55'); // Binding Mochi (+40 when poisoned)
  
  // Test Subjugating Chains ability from Pecharunt (ref: 0 on bench)
  assert.ok(g.canAbility(g.me, 0), 'Pecharunt can use Subjugating Chains');
  const resChain = g.useAbility(0, { targetBenchIndex: 1 }, g.me);
  assert.ok(resChain.ok, 'Subjugating Chains succeeded');
  
  // Now Okidogi should be Active and Poisoned!
  assert.equal(g.top(g.me.active).id, 'sfa-36', 'Okidogi is now Active');
  assert.equal(g.me.active.poisoned, true, 'Okidogi is now Poisoned');
  
  // Okidogi HP with Darkness Energy should be 130 + 100 = 230
  assert.equal(g.hp(g.me.active), 230, 'Okidogi has 230 HP via Adrena-Power');
  
  // Good Punch: 70 + 100 (Darkness Energy) + 40 (Binding Mochi while Poisoned) = 210 damage
  const moves = g.validMoves(g.me);
  const punch = moves.find(m => m.attack.name === 'Good Punch');
  assert.ok(punch, 'Okidogi has Good Punch');
  
  const resPunch = g.attack(punch.index);
  assert.ok(resPunch.ok);
  assert.equal(g.bot.active.damage, 210, 'Good Punch deals 70 + 100 + 40 = 210 damage');
  console.log('✔ Pecharunt ex Subjugating Chains & Okidogi Adrena-Power / Mochi passed');
}

// 5. FERALIGATR & RELICANTH MEMORY DIVE
{
  const g = new Game(cards, () => 0.49, ['feraligatr', 'dragapult']);
  // Stack: Totodile (tef-39) -> Croconaw (tef-40) -> Feraligatr (tef-41)
  const feralStack = [inst('tef-39'), inst('tef-40'), inst('tef-41')];
  g.me.active = { stack: feralStack, energy: [inst('sve-3'), inst('sve-3')], tool: inst('tef-154'), damage: 0, attackLocks: {}, placedTurn: 1 };
  
  // Relicanth on bench (tef-84)
  g.me.bench = [
    g.unit(inst('tef-84'), 1)
  ];
  
  g.me.turns = 2;
  g.turn = 0;
  
  // Feraligatr uses Torrential Heart (+120 damage, 50 recoil)
  assert.ok(g.canAbility(g.me, 'active'), 'Feraligatr can use Torrential Heart');
  const resAbil = g.useAbility('active', {}, g.me);
  assert.ok(resAbil.ok);
  assert.equal(g.me.active.damage, 50, 'Feraligatr takes 50 damage from Torrential Heart');
  
  // Target is Dragapult ex
  g.bot.active = g.unit(inst('me2pt5-160'), 1);
  assert.ok(g.top(g.bot.active).subtypes.includes('ex'), 'Opponent active is Pokémon ex');
  
  // Great Wave: 160 + 120 (Torrential Heart) + 50 (Maximum Belt vs ex) = 330 damage! (One-shots any Stage 2 ex!)
  const moves = g.validMoves(g.me);
  const wave = moves.find(m => m.attack.name === 'Great Wave');
  assert.ok(wave, 'Feraligatr has Great Wave');
  
  const resWave = g.attack(wave.index);
  assert.ok(resWave.ok);
  // 330 damage is lethal on Dragapult ex (320 HP), so Dragapult ex gets knocked out!
  assert.equal(g.me.prize.length, 4, 'Player takes 2 Prizes from Knocking Out Dragapult ex');
  console.log('✔ Feraligatr Torrential Heart + Maximum Belt 330 DMG one-shot KO passed');
  
  // Also verify Memory Dive allowed Croconaw Reverse Thrust
  const g2 = new Game(cards, () => 0.49, ['feraligatr', 'dragapult']);
  g2.me.active = { stack: [inst('tef-39'), inst('tef-40'), inst('tef-41')], energy: [inst('sve-3')], damage: 0, attackLocks: {}, placedTurn: 1 };
  g2.me.bench = [g2.unit(inst('tef-84'), 1)];
  const moves2 = g2.validMoves(g2.me);
  const thrust = moves2.find(m => m.attack.name === 'Reverse Thrust');
  assert.ok(thrust, 'Relicanth Memory Dive should make Reverse Thrust accessible to Feraligatr');
  console.log('✔ Relicanth Memory Dive previous evolution attack access passed');
}

console.log('ALL 5 NICHE DECKS PASSED ALL UNIT TESTS 100%!');

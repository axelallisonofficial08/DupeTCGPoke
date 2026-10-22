const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {Game,DECKS}=require('./mega-engine.js');
const {install}=require('./pro-ai.js');
const dragapultAI=require('./dragapult-ai.js');
install(Game,require('./lucario-ai.js').takeTurn,dragapultAI.takeTurn);

const window={};
vm.runInNewContext(fs.readFileSync('tcg-data.js','utf8'),{window});
const cards=window.CARD_DATA;

// 1. Deck sizes
assert.equal(DECKS.rocket['me2pt5-126'],4);
assert.equal(DECKS.dragapult['me2pt5-160'],3);

// 2. New Game defaults with Rocket & Dragapult
const game=new Game(cards,()=>0.5,['rocket','dragapult']);
assert.equal(game.me.deckName,'rocket');
assert.equal(game.bot.deckName,'dragapult');
assert.ok(game.me.active.stack[0].id==='me2pt5-126'||game.isBasic(game.me.active.stack[0]));
assert.ok(game.bot.active.stack[0].id==='me2pt5-158'||game.isBasic(game.bot.active.stack[0]));

// 3. Rocket energy attachment & Rocket Feathers
let serial=900000;
const mk=id=>({uid:serial++,id});
game.me.active=game.unit(mk('me2pt5-127'),0); // Team Rocket's Honchkrow
game.me.active.energy=[mk('sv10-182')]; // Team Rocket's Energy provides 2 Colorless/Darkness/Psychic
assert.equal(game.validMoves(game.me).some(m=>m.attack.name==='Rocket Feathers'),true);

// Test Rocket Feathers discarding 2 Team Rocket Supporters
const proton=mk('sv10-177');
const ariana=mk('sv10-171');
game.me.hand.push(proton,ariana);
game.me.turns=2;
game.bot.active=game.unit(mk('me2pt5-160'),0); // Dragapult ex 320 HP
game.bot.bench=[game.unit(mk('me2pt5-158'),0)];
assert.equal(game.attack(0,{supporterDiscards:[proton.uid,ariana.uid]}).ok,true);
assert.equal(game.bot.active.damage,120,'2 discarded Team Rocket Supporters deal 120 damage');
assert.ok(game.me.discard.some(c=>c.uid===proton.uid));
assert.ok(game.me.discard.some(c=>c.uid===ariana.uid));

// 4. Test R Command with Porygon-Z
const rGame=new Game(cards,()=>0.5,['rocket','dragapult']);
rGame.me.active=rGame.unit(mk('sv10-155'),0); // Team Rocket's Porygon-Z
rGame.me.active.energy=[mk('sv10-182')]; // Team Rocket's Energy
rGame.me.turns=2;
rGame.me.discard.push(mk('sv10-177'),mk('sv10-171'),mk('sv10-170')); // 3 TR supporters in discard
assert.equal(rGame.attack(0).ok,true);
assert.equal(rGame.bot.active.damage,60,'3 TR supporters in discard deal 60 damage with R Command');

// 5. Test CPU Dragapult turn
const dragGame=new Game(cards,()=>0.5,['rocket','dragapult']);
dragGame.turn=1;
dragGame.bot.turns=2;
dragGame.me.bench=[dragGame.unit(mk('me2pt5-126'),0)]; // Player has bench so game continues
dragGame.bot.hand=[mk('me2pt5-160'),mk('me1-125'),mk('sve-2'),mk('sve-5')]; // Dragapult ex, Rare Candy, Fire, Psychic
dragGame.bot.bench=[dragGame.unit(mk('me2pt5-158'),0)]; // Dreepy
dragGame.aiTurn();
// 6. Test Team Rocket's Proton on Turn 1
const protonGame=new Game(cards,()=>0.5,['rocket','dragapult']);
assert.equal(protonGame.me.turns,1,'Player starts at turn 1');
const pCard=mk('sv10-177'); // Proton
const otherSupporter=mk('sv10-171'); // Ariana
const b1=mk('me2pt5-126'); // Murkrow
const b2=mk('sv10-153'); // Porygon
protonGame.me.deck.push(b1,b2);
protonGame.me.hand.push(pCard,otherSupporter);

// Playing ordinary supporter on turn 1 should fail
const arianaRes=protonGame.playTrainer(otherSupporter.uid);
assert.equal(arianaRes.ok,false,'Normal supporter cannot be played on turn 1');

// Playing Proton on turn 1 should succeed
const initialHandSize=protonGame.me.hand.length;
const protonRes=protonGame.playTrainer(pCard.uid,{chosen:[b1.uid,b2.uid]});
assert.equal(protonRes.ok,true,'Team Rocket\'s Proton CAN be played on turn 1');
assert.ok(protonGame.me.hand.some(c=>c.uid===b1.uid),'Chosen Murkrow added to hand');
assert.ok(protonGame.me.hand.some(c=>c.uid===b2.uid),'Chosen Porygon added to hand');
assert.ok(protonGame.me.discard.some(c=>c.uid===pCard.uid),'Proton discarded after play');
assert.equal(protonGame.me.supporterUsed,true,'Supporter marked as used for turn');
assert.ok(protonGame.log.some(msg=>msg.includes('mengambil')&&msg.includes('dari dek')),'Log mentions fetched cards');

// 7. Test Ultra Ball with exactly 3 cards in hand (Ultra Ball + 2 discard costs)
const ubGame=new Game(cards,()=>0.5,['rocket','dragapult']);
const ultraBall=mk('me1-131');
const cost1=mk('sve-7');
const cost2=mk('sve-7');
const targetPkmn=mk('me2pt5-127'); // Honchkrow
ubGame.me.deck.push(targetPkmn);
ubGame.me.hand=[ultraBall,cost1,cost2];
assert.equal(ubGame.me.hand.length,3,'Hand has exactly 3 cards before Ultra Ball');
const ubRes=ubGame.playTrainer(ultraBall.uid,{discard:[cost1.uid,cost2.uid],chosen:[targetPkmn.uid]});
assert.equal(ubRes.ok,true,'Ultra Ball succeeds with exactly 3 cards in hand');
assert.equal(ubGame.me.hand.length,1,'Hand has exactly 1 card after Ultra Ball');
assert.equal(ubGame.me.hand[0].uid,targetPkmn.uid,'The only card in hand is the searched Pokemon');
assert.ok(ubGame.me.discard.some(c=>c.uid===ultraBall.uid),'Ultra Ball is in discard');
assert.ok(ubGame.me.discard.some(c=>c.uid===cost1.uid),'Discard cost 1 is in discard');
assert.ok(ubGame.me.discard.some(c=>c.uid===cost2.uid),'Discard cost 2 is in discard');

// 8. Test HP remaining is never negative and KO moves Pokemon to discard/trash
const koGame=new Game(cards,()=>0.5,['rocket','dragapult']);
const weakling=koGame.unit(mk('me2pt5-126'),0); // 80 HP
weakling.damage=150; // Overkill damage
assert.equal(koGame.remaining(weakling),0,'Remaining HP is 0, never negative');

// KO test in combat
const pDiveGame=new Game(cards,()=>0.5,['dragapult','rocket']);
pDiveGame.me.turns=2;
pDiveGame.me.active=pDiveGame.unit(mk('me2pt5-160'),0); // Dragapult ex
pDiveGame.me.active.energy=[mk('sve-2'),mk('sve-5')];
const botActive=pDiveGame.unit(mk('sv10-153'),0); // TR Porygon 60 HP
const botBench=pDiveGame.unit(mk('me2pt5-126'),0); // Murkrow 80 HP (has 30 damage already)
botBench.damage=30;
pDiveGame.bot.active=botActive;
pDiveGame.bot.bench=[botBench,pDiveGame.unit(mk('me2pt5-126'),0)]; // Another bench so game doesn't instantly end
const atkRes=pDiveGame.attack(1,{targetBenchIndex:0}); // Phantom Dive: 200 to Active, 60 to Bench 0
assert.equal(atkRes.ok,true);
// Both botActive (60 HP took 200) and botBench (80 HP took 30+60=90) should be KO'd and moved to discard
assert.ok(pDiveGame.bot.discard.some(c=>c.uid===botActive.stack[0].uid),'Active KO goes to discard (trash)');
assert.ok(pDiveGame.bot.discard.some(c=>c.uid===botBench.stack[0].uid),'Bench KO goes to discard (trash)');
assert.ok(!pDiveGame.bot.bench.some(u=>u===botBench),'KO Bench unit removed from bench');

// 9. Test Stadium Team Rocket's Factory manual activation
const stadiumGame=new Game(cards,()=>0.5,['rocket','dragapult']);
const factoryCard=mk('sv10-173');
const arianaSupporter=mk('sv10-171');
stadiumGame.me.turns=2;
stadiumGame.me.hand.push(factoryCard,arianaSupporter);
// Play stadium
assert.equal(stadiumGame.playTrainer(factoryCard.uid).ok,true);
assert.equal(stadiumGame.canUseStadium(stadiumGame.me),false,'Cannot use Stadium ability before playing TR Supporter');
// Play TR Supporter
const handBeforeAriana=stadiumGame.me.hand.length;
assert.equal(stadiumGame.playTrainer(arianaSupporter.uid).ok,true);
// Assert that Stadium Factory did NOT automatically draw
assert.equal(stadiumGame.me.abilityFlags['factory_'+stadiumGame.me.turns],undefined,'Stadium Factory did NOT auto-activate');
assert.equal(stadiumGame.canUseStadium(stadiumGame.me),true,'Stadium ability is now available to be manually clicked');
// Manually use stadium ability
const handBeforeStadium=stadiumGame.me.hand.length;
const stadiumUseRes=stadiumGame.useStadium(stadiumGame.me);
assert.equal(stadiumUseRes.ok,true,'Stadium ability activation succeeded');
assert.equal(stadiumGame.me.hand.length,handBeforeStadium+2,'Drew 2 cards from manual Stadium ability');
assert.equal(stadiumGame.canUseStadium(stadiumGame.me),false,'Cannot use Stadium ability twice in the same turn');

// 10. Test Three-Tier Ability Rules:
// Tier A: Multi-Use (Oricorio ex 'Excited Turbo')
// Tier B: Per-Instance Once Per Turn (Porygon-Z 'Reconstitute')
// Tier C: Global Named Once Per Turn (Fezandipiti ex 'Flip the Script')

const abilityGame=new Game(cards,()=>0.5,['rocket','dragapult']);
abilityGame.me.turns=2;

// Test Tier B: 2x Porygon-Z on field
const pz1=abilityGame.unit(mk('sv10-155'),0);
const pz2=abilityGame.unit(mk('sv10-155'),0);
abilityGame.me.active=pz1;
abilityGame.me.bench=[pz2];
// Hand has 4 cards to discard (2 for each Porygon-Z)
const d1=mk('sve-7'),d2=mk('sve-7'),d3=mk('sve-7'),d4=mk('sve-7');
abilityGame.me.hand=[d1,d2,d3,d4];
const topDeck1=mk('sv10-178'),topDeck2=mk('sv10-178');
abilityGame.me.deck.push(topDeck1,topDeck2);

assert.equal(abilityGame.canAbility(abilityGame.me,'active'),true,'Porygon-Z #1 can use Reconstitute');
assert.equal(abilityGame.canAbility(abilityGame.me,0),true,'Porygon-Z #2 can use Reconstitute');

// Use Reconstitute on active Porygon-Z #1
const pz1Res=abilityGame.useAbility('active',{discardUids:[d1.uid,d2.uid]});
assert.equal(pz1Res.ok,true,'Porygon-Z #1 used Reconstitute');
assert.equal(abilityGame.canAbility(abilityGame.me,'active'),false,'Porygon-Z #1 CANNOT use Reconstitute again this turn');
assert.equal(abilityGame.canAbility(abilityGame.me,0),true,'Porygon-Z #2 CAN STILL use Reconstitute this turn (per-instance rule)');

// Use Reconstitute on bench Porygon-Z #2
const pz2Res=abilityGame.useAbility(0,{discardUids:[d3.uid,d4.uid]});
assert.equal(pz2Res.ok,true,'Porygon-Z #2 used Reconstitute');
assert.equal(abilityGame.canAbility(abilityGame.me,0),false,'Porygon-Z #2 CANNOT use Reconstitute again this turn');

// Test Tier C: Global Named Once Per Turn (2x Fezandipiti ex)
const fez1=abilityGame.unit(mk('sv6pt5-38'),0);
const fez2=abilityGame.unit(mk('sv6pt5-38'),0);
abilityGame.me.active=fez1;
abilityGame.me.bench=[fez2];
abilityGame.me.koLastTurn=true;
abilityGame.me.deck.push(mk('sv10-178'),mk('sv10-178'),mk('sv10-178'),mk('sv10-178'),mk('sv10-178'),mk('sv10-178'));

assert.equal(abilityGame.canAbility(abilityGame.me,'active'),true,'Fezandipiti #1 can use Flip the Script');
assert.equal(abilityGame.canAbility(abilityGame.me,0),true,'Fezandipiti #2 also can use Flip the Script before any are used');

// Fezandipiti #1 uses Flip the Script
const fez1Res=abilityGame.useAbility('active');
assert.equal(fez1Res.ok,true,'Fezandipiti #1 Flip the Script succeeded');
// Fezandipiti #2 should now be blocked by the global named lock!
assert.equal(abilityGame.canAbility(abilityGame.me,0),false,'Fezandipiti #2 is BLOCKED from using Flip the Script by global named lock');
const fez2Res=abilityGame.useAbility(0);
assert.equal(fez2Res.ok,false,'Calling useAbility on Fezandipiti #2 fails due to global lock');

// Test Tier A: Multi-Use (Oricorio ex 'Excited Turbo')
const multiGame=new Game(cards,()=>0.5,['charizard','dragapult']);
multiGame.me.turns=2;
const ori=multiGame.unit(mk('me2-18'),0); // Oricorio ex
const megaZard=multiGame.unit(mk('me2-13'),0); // Mega Charizard X ex
const fireBench=multiGame.unit(mk('me2-11'),0); // Charmander (Fire)
multiGame.me.active=megaZard;
multiGame.me.bench=[ori,fireBench];
const fe1=mk('sve-2'),fe2=mk('sve-2');
multiGame.me.hand=[fe1,fe2];

assert.equal(multiGame.canAbility(multiGame.me,0),true,'Oricorio ex can use Excited Turbo');
const use1=multiGame.useAbility(0,{energyUid:fe1.uid,targetRef:1});
assert.equal(use1.ok,true,'First Excited Turbo use succeeded');
assert.equal(multiGame.canAbility(multiGame.me,0),true,'Oricorio ex can STILL use Excited Turbo again in the same turn (multi-use rule)');
const use2=multiGame.useAbility(0,{energyUid:fe2.uid,targetRef:1});
assert.equal(use2.ok,true,'Second Excited Turbo use succeeded');
assert.equal(fireBench.energy.length,2,'Attached 2 Fire Energy via repeated Excited Turbo');

// 11. Test Discard / Trash Separation (Pokemon, Trainer, Energy)
const trashGame=new Game(cards,()=>0.5,['rocket','dragapult']);
const pkmnCard=mk('me2pt5-126'); // Murkrow (Pokemon)
const trainerCard=mk('sv10-178'); // TR Transceiver (Trainer)
const energyCard=mk('sv10-182'); // TR Energy (Energy)
const specialEnergy=mk('sve-7'); // Basic Darkness Energy (Energy)

trashGame.me.discard.push(pkmnCard,trainerCard,energyCard,specialEnergy);

const myPokemon=trashGame.me.discard.filter(c=>trashGame.card(c).supertype==='Pokémon');
const myTrainers=trashGame.me.discard.filter(c=>trashGame.card(c).supertype==='Trainer');
const myEnergies=trashGame.me.discard.filter(c=>trashGame.card(c).supertype==='Energy');

assert.equal(myPokemon.length,1,'Player discard has 1 Pokemon card');
assert.equal(myPokemon[0].id,'me2pt5-126');
assert.equal(myTrainers.length,1,'Player discard has 1 Trainer card');
assert.equal(myTrainers[0].id,'sv10-178');
assert.equal(myEnergies.length,2,'Player discard has 2 Energy cards');

// Test CPU Discard separation
const cpuPkmn=mk('me2pt5-160'); // Dragapult ex
const cpuTrainer=mk('me1-125'); // Rare Candy
const cpuEnergy=mk('sve-2'); // Fire Energy
trashGame.bot.discard.push(cpuPkmn,cpuTrainer,cpuEnergy);

const botPokemon=trashGame.bot.discard.filter(c=>trashGame.card(c).supertype==='Pokémon');
const botTrainers=trashGame.bot.discard.filter(c=>trashGame.card(c).supertype==='Trainer');
const botEnergies=trashGame.bot.discard.filter(c=>trashGame.card(c).supertype==='Energy');

assert.equal(botPokemon.length,1,'CPU discard has 1 Pokemon card');
assert.equal(botTrainers.length,1,'CPU discard has 1 Trainer card');
assert.equal(botEnergies.length,1,'CPU discard has 1 Energy card');

console.log('Team Rocket & Dragapult duel tests passed successfully!');



const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {Game}=require('./mega-engine.js');
const {install}=require('./pro-ai.js');
install(Game,require('./lucario-ai.js').takeTurn);
const window={};vm.runInNewContext(fs.readFileSync('tcg-data.js','utf8'),{window});
let serial=500000;
const card=id=>({uid:serial++,id});
function fresh(){const g=new Game(window.CARD_DATA,()=>0.41,['lucario','charizard']);g.turn=1;g.bot.turns=2;g.me.turns=2;g.bot.hand=[];g.bot.bench=[];g.bot.discard=[];g.bot.deck=[];g.bot.supporterUsed=false;g.bot.energyUsed=false;return g;}
function unit(g,id,energy=0){const u=g.unit(card(id),0);for(let i=0;i<energy;i++)u.energy.push(card('sve-2'));return u;}

{
  const g=fresh();g.bot.active=unit(g,'me2-13',2);g.bot.bench=[unit(g,'me2-18',3)];
  g.me.active=unit(g,'me2pt5-112');g.me.bench=[unit(g,'me2pt5-112')];
  g.aiTurn();
  assert.equal(g.bot.active.energy.length,2,'CPU keeps attack cost attached when Bench Energy can pay Inferno X');
  assert.equal(g.bot.discard.filter(x=>x.id==='sve-2').length,1,'CPU spends only one Fire Energy for 80 HP');
  assert.equal(g.bot.prize.length,5,'CPU takes one Prize from KO');
}

{
  const g=fresh();g.bot.active=unit(g,'me2-13',2);g.bot.bench=[unit(g,'me2-18',2)];
  g.bot.hand=[card('me1-114')];g.me.active=unit(g,'me2pt5-112');
  g.me.bench=[unit(g,'me2pt5-113'),unit(g,'me2pt5-112')];g.me.bench[0].damage=160;
  g.aiTurn();
  assert.ok(g.log.some(x=>x.includes("Boss's Orders")),'CPU uses Boss’s Orders to target a higher-Prize KO');
  assert.equal(g.bot.prize.length,3,'CPU takes three Prize from Mega Lucario');
}

{
  const g=fresh();g.bot.active=unit(g,'me2-18');g.bot.bench=[unit(g,'me2-13',2)];
  g.bot.hand=[card('me2-89'),card('me1-130')];g.bot.deck=[card('sve-2'),card('sve-2'),card('sve-2'),card('sve-2')];
  g.me.active=unit(g,'me2pt5-113');g.me.bench=[unit(g,'me2pt5-112')];
  g.aiTurn();
  assert.ok(g.log.some(x=>x.includes('Firebreather')),'CPU searches Fire Energy before Excited Turbo');
  assert.ok(g.log.some(x=>x.includes('Excited Turbo')),'CPU accelerates Fire Energy to Bench');
  assert.ok(g.log.some(x=>x.includes('Inferno X')),'CPU pivots into Mega Charizard X and attacks');
}

{
  const g=new Game(window.CARD_DATA,()=>0.47,['lucario','charizard']);
  g.me.turns=2;g.me.active=unit(g,'me2-13');g.bot.active=unit(g,'me2pt5-22');
  const gravity=card('sv8-177');g.me.hand.push(gravity);
  assert.equal(g.playTrainer(gravity.uid).ok,true);
  assert.equal(g.stadium.owner,g.me,'player Stadium occupies the shared zone');
  assert.equal(g.hp(g.me.active),Number(g.top(g.me.active).hp)-30,'Gravity Mountain affects player Stage 2');
  assert.equal(g.hp(g.bot.active),Number(g.top(g.bot.active).hp)-30,'Gravity Mountain affects CPU Stage 2');
  g.turn=1;g.bot.turns=2;g.bot.hand=[card('me2-85')];g.bot.energyUsed=true;
  g.aiTurn();
  assert.equal(g.stadium.card.id,'me2-85','CPU replaces opposing Stadium with Battle Cage');
  assert.equal(g.stadium.owner,g.bot);
  assert.ok(g.me.discard.some(x=>x.uid===gravity.uid),'replaced Stadium goes to its owner discard');
  assert.equal(g.hp(g.me.active),Number(g.top(g.me.active).hp),'old Stadium effect ends for player');
  assert.equal(g.hp(g.bot.active),Number(g.top(g.bot.active).hp),'old Stadium effect ends for CPU');
  const duplicate=card('me2-85');g.me.hand.push(duplicate);
  assert.equal(g.playTrainer(duplicate.uid).ok,false,'same-name Stadium cannot replace itself');
}

console.log('Pro CPU tactical tests passed.');

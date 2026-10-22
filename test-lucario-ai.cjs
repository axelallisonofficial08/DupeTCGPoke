const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {Game}=require('./mega-engine.js');
require('./pro-ai.js').install(Game,require('./lucario-ai.js').takeTurn);
const window={};vm.runInNewContext(fs.readFileSync('tcg-data.js','utf8'),{window});
let serial=900000;
const card=id=>({uid:serial++,id});
function unit(g,id,energy=[]){const u=g.unit(card(id),0);u.energy=energy.map(card);return u;}
function fresh(){const g=new Game(window.CARD_DATA,()=>0.41);g.turn=1;g.bot.turns=2;g.me.turns=2;g.bot.hand=[];g.bot.bench=[];g.bot.discard=[];g.bot.deck=[];return g;}

{
  const g=fresh();g.bot.active=unit(g,'me2pt5-112',['sve-6']);g.bot.hand=[card('me2pt5-113')];g.bot.bench=[unit(g,'me1-72')];g.bot.discard=[card('sve-6')];g.me.active=unit(g,'me2-11');g.me.bench=[unit(g,'me2-11')];
  g.aiTurn();
  assert.equal(g.top(g.bot.active).name,'Mega Lucario ex');
  assert.ok(g.log.some(x=>x.includes('Aura Jab')));
  assert.equal(g.bot.bench[0].energy.length,1,'Aura Jab accelerates Fighting Energy');
}
{
  const g=fresh();g.bot.active=unit(g,'me2pt5-113',['sve-6','sve-6']);g.bot.hand=[card('me1-124'),card('me1-124')];g.me.active=unit(g,'me2-13');g.me.active.damage=60;g.me.bench=[unit(g,'me2-11')];
  g.aiTurn();
  assert.ok(g.log.filter(x=>x.includes('Premium Power Pro')).length>=1,'CPU powers up for KO');
  assert.ok(g.log.some(x=>x.includes('Mega Brave')));
  assert.equal(g.bot.prize.length,3,'Mega Charizard KO gives three Prize cards');
}
{
  const g=fresh();g.bot.active=unit(g,'me2pt5-112');g.bot.hand=[card('sv8-177')];g.me.active=unit(g,'me2-13');g.me.bench=[unit(g,'me2-11')];
  const old=card('me2-85');g.stadium={id:old.id,card:old,owner:g.me};
  g.aiTurn();
  assert.equal(g.stadium.id,'sv8-177','CPU replaces Stadium with Gravity Mountain');
  assert.ok(g.me.discard.some(x=>x.uid===old.uid));
  assert.equal(g.hp(g.me.active),Number(g.top(g.me.active).hp)-30);
}
console.log('Lucario CPU tactical tests passed.');

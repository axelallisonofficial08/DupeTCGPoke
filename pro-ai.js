(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PTCGProAI=api;})(typeof window!=='undefined'?window:globalThis,function(){
  const IDS={charmander:'me2-11',charmeleon:'me2-12',charizard:'me2-13',charizardY:'me2pt5-22',oricorio:'me2-18',fez:'sv6pt5-38',meowth:'me3-62',reshiram:'me2-17',fire:'sve-2',candy:'me1-125',ultra:'me1-131',pad:'me2pt5-198',signal:'me1-121',trolley:'sv8-185',retrieval:'me4-108',recycler:'me3-108',stretcher:'me2pt5-196',balloon:'zsv10pt5-79',switch:'me1-130',boss:'me1-114',lillie:'me1-119',firebreather:'me2-89',judge:'me3-76',dawn:'me2-87',petrel:'sv10-176',lana:'sv6-155',cage:'me2-85'};
  const find=(list,id)=>list.find(c=>c.id===id);
  const count=(list,id)=>list.filter(c=>c.id===id).length;
  const topName=(g,u)=>g.top(u).name;
  const isChar=(g,u)=>['Charmander','Charmeleon','Mega Charizard X ex','Mega Charizard Y ex'].includes(topName(g,u));
  const charPriority=(g,u)=>topName(g,u)==='Mega Charizard X ex'?4:topName(g,u)==='Mega Charizard Y ex'?3:topName(g,u)==='Charmeleon'?2:topName(g,u)==='Charmander'?1:0;
  const fireCount=(g,u)=>u.energy.filter(e=>g.energyType(e)==='Fire').length;
  const shuffle=(list,random)=>{for(let i=list.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[list[i],list[j]]=[list[j],list[i]];}return list;};
  function install(Game,lucarioTurn,dragapultTurn){
    Game.prototype.aiTurn=function(){
      if(this.bot.deckName==='dragapult')return (dragapultTurn||(typeof PTCGDragapultAI!=='undefined'&&PTCGDragapultAI.takeTurn)||takeTurn)(this);
      return this.bot.deckName==='lucario'?lucarioTurn(this):takeTurn(this);
    };
  }
  function takeTurn(g){
    if(g.over||g.turn!==1||g.pendingPromotion!==null)return;
    const p=g.bot,op=g.me;
    const spent=card=>{p.discard.push(g.takeHand(p,card.uid));g.print('CPU memainkan '+g.name(card)+'.');g.recordAction(p,'card',g.name(card),'Dimainkan ('+g.card(card).supertype+')',{cardId:card.id,subtype:g.card(card).supertype});};
    const search=(predicate,n=1)=>{const chosen=p.deck.filter(predicate).slice(0,n).map(c=>c.uid);return g.search(p,predicate,n,chosen);};
    const recovery=(predicate,n=1)=>{const chosen=p.discard.filter(predicate).slice(0,n).map(c=>c.uid);return g.recover(p,predicate,n,chosen);};
    const units=()=>g.allRefs(p).map(x=>x.unit);
    const charUnits=()=>units().filter(u=>isChar(g,u));
    const xUnits=()=>units().filter(u=>topName(g,u)==='Mega Charizard X ex');
    const oricorioInPlay=()=>units().some(u=>topName(g,u)==='Oricorio ex');
    const fireMegaInPlay=()=>units().some(u=>g.top(u).subtypes?.includes('MEGA')&&g.top(u).types?.includes('Fire'));
    const benchCount=id=>p.bench.filter(u=>u.stack[0].id===id).length+(p.active?.stack[0].id===id?1:0);
    const drawFez=()=>{const u=units().find(x=>topName(g,x)==='Fezandipiti ex');if(u&&p.koLastTurn&&p.abilityFlags.flip!==p.turns&&p.deck.length){g.draw(p,3);p.abilityFlags.flip=p.turns;g.print('CPU memakai Flip the Script: mengambil 3 kartu.');g.recordAction(p,'skill','Flip the Script (Fezandipiti ex)','Mengambil 3 kartu',{abilityName:'Flip the Script',cardId:IDS.fez});}};
    const meowthSearch=()=>{if(p.abilityFlags.lastDitch===p.turns)return;let id=IDS.lillie;if(fireMegaInPlay()&&oricorioInPlay()&&count(p.hand,IDS.fire)<2)id=IDS.firebreather;else if(p.hand.length>5)id=IDS.boss;const target=find(p.deck,id)||p.deck.find(c=>g.card(c).subtypes?.includes('Supporter'));if(!target)return;p.deck.splice(p.deck.indexOf(target),1);p.hand.push(target);shuffle(p.deck,g.random);p.abilityFlags.lastDitch=p.turns;g.print('CPU memakai Last-Ditch Catch mencari '+g.name(target)+'.');g.recordAction(p,'skill','Last-Ditch Catch (Meowth ex)','Mencari '+g.name(target),{abilityName:'Last-Ditch Catch',cardId:IDS.meowth});};
    const benchBasics=()=>{
      const priority=[IDS.charmander,IDS.oricorio,IDS.charmander,IDS.fez,IDS.meowth,IDS.reshiram];
      for(const id of priority){if(p.bench.length>=5)break;const limit=id===IDS.charmander?3:id===IDS.oricorio?1:1;if(benchCount(id)>=limit)continue;const c=find(p.hand,id);if(!c)continue;p.bench.push(g.unit(g.takeHand(p,c.uid),p.turns));g.print('CPU menaruh '+g.name(c)+' di Bench.');g.recordAction(p,'card',g.name(c),'Masuk ke Bench',{cardId:c.id,subtype:'Basic'});if(id===IDS.meowth)meowthSearch();}
    };
    const trolley=()=>{const c=find(p.hand,IDS.trolley);if(!c||p.bench.length>=5)return;const wanted=[IDS.charmander,IDS.charmander,IDS.oricorio,IDS.charmander,IDS.fez,IDS.meowth,IDS.reshiram];const selected=[];for(const id of wanted){if(p.bench.length+selected.length>=5)break;const limit=id===IDS.charmander?3:id===IDS.oricorio?1:1;if(benchCount(id)+selected.filter(x=>x.id===id).length>=limit)continue;const card=p.deck.find(x=>x.id===id&&!selected.includes(x));if(card)selected.push(card);}if(!selected.length)return;spent(c);for(const card of selected){p.deck.splice(p.deck.indexOf(card),1);p.bench.push(g.unit(card,p.turns));g.recordAction(p,'card',g.name(card),'Masuk ke Bench via Trolley',{cardId:card.id,subtype:'Basic'});}shuffle(p.deck,g.random);g.print('Precious Trolley menyiapkan '+selected.length+' Pokémon Basic.');};
    const searchTarget=kind=>{
      const inPlay=id=>units().some(u=>u.stack[0].id===id);
      const hasCandy=!!find(p.hand,IDS.candy);
      const charBasics=charUnits().filter(u=>topName(g,u)==='Charmander');
      if(kind==='signal')return p.deck.find(c=>c.id===IDS.charizard);
      if(kind==='pad'){
        if(!inPlay(IDS.charmander)&&p.bench.length<5)return p.deck.find(c=>c.id===IDS.charmander);
        if(charBasics.length&&!hasCandy&&!find(p.hand,IDS.charmeleon))return p.deck.find(c=>c.id===IDS.charmeleon);
        // Poké Pad cannot search Pokémon ex such as Oricorio ex.
        return null;
      }
      if(!charUnits().length&&p.bench.length<5)return p.deck.find(c=>c.id===IDS.charmander);
      if(!xUnits().length&&!find(p.hand,IDS.charizard))return p.deck.find(c=>c.id===IDS.charizard);
      if(charBasics.length&&!hasCandy&&!find(p.hand,IDS.charmeleon))return p.deck.find(c=>c.id===IDS.charmeleon);
      if(!oricorioInPlay()&&p.bench.length<5)return p.deck.find(c=>c.id===IDS.oricorio);
      return null;
    };
    const discardScore=c=>{
      const id=c.id;if(id===IDS.charizard&&xUnits().length)return 2;if(id===IDS.charizardY)return 1;
      if(id===IDS.charmander&&benchCount(id)>=2)return 2;if(id===IDS.oricorio&&oricorioInPlay())return 3;
      if(id===IDS.cage&&g.stadium?.id===IDS.cage)return 6;if(id===IDS.judge&&p.supporterUsed)return 5;
      if(id===IDS.balloon&&units().some(u=>u.tool?.id===IDS.balloon))return 4;
      if(id===IDS.fire)return -7;if(id===IDS.candy&&charUnits().some(u=>topName(g,u)==='Charmander'))return -6;
      if(id===IDS.charizard&&!xUnits().length)return -7;if(id===IDS.charmander&&benchCount(id)===0)return -8;
      if(id===IDS.firebreather&&fireMegaInPlay())return -4;
      return 0;
    };
    const searchItems=()=>{for(let pass=0;pass<8;pass++){let played=false;for(const [id,kind] of [[IDS.signal,'signal'],[IDS.pad,'pad'],[IDS.ultra,'ultra']]){const item=find(p.hand,id);if(!item)continue;const target=searchTarget(kind);if(!target)continue;if(id===IDS.ultra&&p.hand.length<4)continue;
          p.discard.push(g.takeHand(p,item.uid));if(id===IDS.ultra){const candidates=[...p.hand].sort((a,b)=>discardScore(b)-discardScore(a));for(const x of candidates.slice(0,2))p.discard.push(g.takeHand(p,x.uid));}
          p.deck.splice(p.deck.indexOf(target),1);p.hand.push(target);shuffle(p.deck,g.random);g.print('CPU memakai '+g.name(item)+' mencari '+g.name(target)+'.');played=true;break;
        }if(!played)break;}};
    const evolve=()=>{
      // Rare Candy is used before Charmeleon so a ready Stage 2 can attack this turn.
      for(let i=0;i<3;i++){const candy=find(p.hand,IDS.candy),mega=find(p.hand,IDS.charizard)||find(p.hand,IDS.charizardY);if(!candy||!mega)break;const basics=charUnits().filter(u=>topName(g,u)==='Charmander'&&u.placedTurn<p.turns&&u.evolvedTurn!==p.turns).sort((a,b)=>fireCount(g,b)-fireCount(g,a));if(!basics.length)break;const u=basics[0];spent(candy);u.stack.push(g.takeHand(p,mega.uid));u.evolvedTurn=p.turns;u.poisoned=false;u.paralyzed=false;g.print('CPU memakai Rare Candy menjadi '+topName(g,u)+'.');g.recordAction(p,'card',g.card(mega).name,'Evolusi via Rare Candy menjadi '+topName(g,u),{cardId:mega.id,subtype:'Evolution'});}
      for(const id of [IDS.charizard,IDS.charizardY,IDS.charmeleon])for(const c of [...p.hand].filter(x=>x.id===id)){const u=charUnits().filter(x=>g.canEvolve(p,g.card(c),x)).sort((a,b)=>fireCount(g,b)-fireCount(g,a))[0];if(!u)continue;u.stack.push(g.takeHand(p,c.uid));u.evolvedTurn=p.turns;u.poisoned=false;u.paralyzed=false;u.attackLocks={};g.print('CPU mengevolusikan '+topName(g,u)+'.');g.recordAction(p,'card',g.card(c).name,'Evolusi menjadi '+topName(g,u),{cardId:c.id,subtype:'Evolution'});}
    };
    const recoverEnergy=()=>{const energyInHand=count(p.hand,IDS.fire);if(energyInHand<=1){const c=find(p.hand,IDS.retrieval);if(c&&count(p.discard,IDS.fire)){spent(c);recovery(x=>x.id===IDS.fire,2);}}
      const recycler=find(p.hand,IDS.recycler);if(recycler&&count(p.discard,IDS.fire)>=4&&count(p.deck,IDS.fire)<=3){spent(recycler);for(const x of p.discard.filter(x=>x.id===IDS.fire).slice(0,5)){p.discard.splice(p.discard.indexOf(x),1);p.deck.push(x);}shuffle(p.deck,g.random);}
      const stretcher=find(p.hand,IDS.stretcher);if(stretcher){const target=p.discard.find(x=>x.id===IDS.charizard)&&!find(p.hand,IDS.charizard)&&charUnits().some(u=>topName(g,u)==='Charmander'||topName(g,u)==='Charmeleon')?IDS.charizard:energyInHand===0?IDS.fire:null;if(target&&p.discard.some(x=>x.id===target)){spent(stretcher);recovery(x=>x.id===target,1);}}
    };
    const attachTool=()=>{const c=find(p.hand,IDS.balloon);if(!c)return;const candidate=units().filter(u=>!u.tool).sort((a,b)=>{const score=u=>u===p.active&&charPriority(g,u)===0?5:u===p.active?3:charPriority(g,u)===0?2:0;return score(b)-score(a);})[0];if(!candidate)return;candidate.tool=g.takeHand(p,c.uid);g.print('CPU memasang Air Balloon pada '+topName(g,candidate)+'.');g.recordAction(p,'card','Air Balloon','Dipasang pada '+topName(g,candidate),{cardId:IDS.balloon,subtype:'Tool'});};
    const playStadium=()=>{const c=find(p.hand,IDS.cage);if(!c||p.stadiumUsed||g.stadium?.id===IDS.cage)return;const old=g.stadium;if(old)old.owner.discard.push(old.card);g.stadium={id:IDS.cage,card:g.takeHand(p,c.uid),owner:p};p.stadiumUsed=true;g.print(old?'CPU mengganti '+g.card(old.card).name+' dengan Battle Cage.':'CPU memainkan Battle Cage di area bersama.');g.recordAction(p,'card','Battle Cage','Dimainkan di arena bersama',{cardId:IDS.cage,subtype:'Stadium'});g.checkAllKO();};
    const energyTarget=()=>charUnits().sort((a,b)=>{const value=u=>charPriority(g,u)*10+(u===p.active?4:0)-Math.min(3,fireCount(g,u))*3;return value(b)-value(a);})[0]||p.active;
    const attachOnce=()=>{if(p.energyUsed)return;const c=find(p.hand,IDS.fire);if(!c)return;const target=energyTarget();target.energy.push(g.takeHand(p,c.uid));p.energyUsed=true;g.print('CPU memasang Fire Energy ke '+topName(g,target)+'.');g.recordAction(p,'card','Basic Fire Energy','Dipasang ke '+topName(g,target),{cardId:c.id,subtype:'Energy'});};
    const turbo=()=>{if(!oricorioInPlay()||!fireMegaInPlay())return;for(const c of [...p.hand].filter(x=>x.id===IDS.fire)){const target=p.bench.filter(u=>g.top(u).types?.includes('Fire')).sort((a,b)=>{const score=u=>charPriority(g,u)*10-Math.min(4,fireCount(g,u))*2;return score(b)-score(a);})[0];if(!target)break;target.energy.push(g.takeHand(p,c.uid));g.print('CPU memakai Excited Turbo ke '+topName(g,target)+'.');g.recordAction(p,'skill','Excited Turbo (Oricorio ex)','Memasang Fire Energy ke '+topName(g,target),{abilityName:'Excited Turbo',cardId:IDS.oricorio});}};
    const possibleDamage=(attacker,defender)=>{const name=topName(g,attacker),move=g.top(attacker).attacks||[];if(name==='Mega Charizard X ex'){if(fireCount(g,attacker)<2)return 0;const total=units().reduce((n,u)=>n+fireCount(g,u),0);const mult=g.top(defender).weaknesses?.[0]?.type==='Fire'?2:1;return Math.floor(total*90*mult);}if(name==='Mega Charizard Y ex')return fireCount(g,attacker)>=3?280:0;let damage=0;for(const attack of move)if(g.hasCost(attacker,attack.cost||[]))damage=Math.max(damage,parseInt(attack.damage,10)||0);return damage;};
    const gustTarget=()=>{if(!p.active||p.supporterUsed||p.turns===1)return null;const boss=find(p.hand,IDS.boss);if(!boss||!op.bench.length)return null;let best=null;for(let i=0;i<op.bench.length;i++){const u=op.bench[i],damage=possibleDamage(p.active,u),canKO=damage>=g.remaining(u),prize=g.prizeCount(u);if(!canKO)continue;const score=prize*100+Math.max(0,400-g.remaining(u))+((prize>=p.prize.length)?500:0);if(!best||score>best.score)best={index:i,score};}if(!best)return null;const activeDamage=possibleDamage(p.active,op.active);const activeKO=activeDamage>=g.remaining(op.active);if(activeKO&&g.prizeCount(op.active)>=g.prizeCount(op.bench[best.index]))return null;return best.index;};
    const supporter=()=>{if(p.supporterUsed||p.turns===1)return;
      const fireInDeck=count(p.deck,IDS.fire),fireInHand=count(p.hand,IDS.fire),needsFuel=fireMegaInPlay()&&oricorioInPlay()&&fireInDeck>=2&&fireInHand<=2;
      if(gustTarget()!==null)return;
      let c=null;if(needsFuel)c=find(p.hand,IDS.firebreather);
      if(!c&&p.hand.length<=4)c=find(p.hand,IDS.lillie);
      if(!c&&op.hand.length>=6&&p.hand.length<=5)c=find(p.hand,IDS.judge);
      if(!c&&charUnits().some(u=>topName(g,u)==='Charmander')&&!find(p.hand,IDS.charizard)&&!find(p.hand,IDS.charmeleon))c=find(p.hand,IDS.dawn);
      if(!c&&fireInHand===0&&fireInDeck)c=find(p.hand,IDS.firebreather);
      if(!c&&p.hand.length<=3)c=find(p.hand,IDS.petrel);
      if(!c&&p.hand.length<=3)c=find(p.hand,IDS.lillie);
      if(!c)return;spent(c);p.supporterUsed=true;
      if(c.id===IDS.firebreather)search(x=>x.id===IDS.fire,7);
      else if(c.id===IDS.lillie){p.deck.push(...p.hand.splice(0));shuffle(p.deck,g.random);g.draw(p,p.prize.length===6?8:6);}
      else if(c.id===IDS.judge){for(const q of g.players){q.deck.push(...q.hand.splice(0));shuffle(q.deck,g.random);g.draw(q,4);}}
      else if(c.id===IDS.dawn){for(const [stage,preferred] of [['Basic',IDS.charmander],['Stage 1',IDS.charmeleon],['Stage 2',IDS.charizard]]){const chosen=find(p.deck,preferred);if(chosen)g.search(p,x=>g.card(x).subtypes?.includes(stage),1,[chosen.uid]);else search(x=>g.card(x).subtypes?.includes(stage),1);}}
      else if(c.id===IDS.petrel){const preferred=charUnits().some(u=>topName(g,u)==='Charmander')&&find(p.hand,IDS.charizard)?IDS.candy:!find(p.hand,IDS.charizard)?IDS.ultra:fireMegaInPlay()?IDS.firebreather:IDS.lillie;const target=find(p.deck,preferred);if(target)g.search(p,x=>g.card(x).supertype==='Trainer',1,[target.uid]);else search(x=>g.card(x).supertype==='Trainer',1);}
    };
    const selectAttacker=()=>{const options=[p.active,...p.bench].filter(Boolean).map(u=>({u,damage:possibleDamage(u,op.active),prize:g.prizeCount(op.active)}));const score=x=>{const u=x.u,n=topName(g,u),canAttack=!u.paralyzed&&(g.top(u).attacks||[]).some(a=>g.hasCost(u,a.cost||[]));const ko=x.damage>=g.remaining(op.active)&&canAttack;return(ko?500+x.prize*120:0)+(canAttack?Math.min(x.damage,360):0)+(n==='Mega Charizard X ex'?90:0)-(n==='Oricorio ex'?90:0)-(n==='Meowth ex'?120:0);};options.sort((a,b)=>score(b)-score(a));const best=options[0]?.u;if(!best||best===p.active||score(options[0])<=score(options.find(x=>x.u===p.active)))return;const index=p.bench.indexOf(best);const sw=find(p.hand,IDS.switch);if(sw){spent(sw);g.gust(p,index);return;}if(g.canRetreat(p)){const old=p.active;for(let i=0;i<g.retreatCost(old);i++)p.discard.push(old.energy.pop());old.poisoned=false;old.paralyzed=false;p.active=p.bench.splice(index,1)[0];p.bench.push(old);p.retreated=true;g.print('CPU mundur ke '+topName(g,p.active)+'.');}};
    const bossIfWinning=()=>{const index=gustTarget();if(index===null)return;const boss=find(p.hand,IDS.boss);spent(boss);p.supporterUsed=true;g.gust(op,index);g.print('CPU memilih target bernilai '+g.prizeCount(op.active)+' Prize.');};
    const attackChoice=()=>{if(!g.canAttack(p))return null;const moves=g.validMoves(p);const source=topName(g,p.active);let best=null;for(const {attack,index} of moves){let options={},damage=parseInt(attack.damage,10)||0;if(attack.name==='Inferno X'){const all=g.allRefs(p).flatMap(({unit})=>unit.energy.filter(e=>g.energyType(e)==='Fire').map(e=>({unit,e})));const weak=g.top(op.active).weaknesses?.[0]?.type==='Fire'?2:1;const resist=g.top(op.active).resistances?.[0]?.type==='Fire'?parseInt(g.top(op.active).resistances[0].value,10)||0:0;let required=1;while(required<all.length&&required*90*weak-resist<g.remaining(op.active))required++;const canKO=required*90*weak-resist>=g.remaining(op.active);const countToSpend=canKO?required:Math.max(1,Math.min(all.length-2,2));const ordered=all.sort((a,b)=>{const value=x=>x.unit===p.active?100:(charPriority(g,x.unit)>=3?50:0);return value(a)-value(b);});options.fireDiscards=ordered.slice(0,countToSpend).map(x=>x.e.uid);damage=countToSpend*90*weak-resist;}
        if(attack.name==='Explosion Y'||attack.name==='Cruel Arrow'){const benches=op.bench.map((u,i)=>({u,i}));const possible=attack.name==='Explosion Y'?280:100;const target=benches.filter(x=>g.remaining(x.u)<=possible).sort((a,b)=>g.prizeCount(b.u)-g.prizeCount(a.u))[0];if(target&&g.remaining(op.active)>possible){options.targetBenchIndex=target.i;damage=possible;}}
        const target=options.targetBenchIndex===undefined?op.active:op.bench[options.targetBenchIndex];const knockout=damage>=g.remaining(target);const prize=g.prizeCount(target);let score=(knockout?500+prize*140:0)+Math.min(damage,g.remaining(target))+(source==='Mega Charizard X ex'?20:0);if(attack.name==='Burning Flare'&&g.remaining(p.active)<=60)score-=300;if(attack.name==='Inferno X'&&!knockout)score-=30*options.fireDiscards.length;if(!best||score>best.score)best={index,options,score};}
      return best;};
    drawFez();benchBasics();trolley();searchItems();benchBasics();recoverEnergy();evolve();
    supporter();benchBasics();searchItems();evolve();recoverEnergy();
    attachTool();playStadium();attachOnce();turbo();selectAttacker();bossIfWinning();
    const choice=attackChoice();if(choice){const result=g.attack(choice.index,choice.options);if(result.ok)return;g.print('CPU tidak dapat menyerang: '+result.error);}
    g.print('CPU mengakhiri giliran.');g.endTurn();
  }
  return{install,takeTurn};
});

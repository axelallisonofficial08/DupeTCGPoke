(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PTCGLucarioAI=api;})(typeof window!=='undefined'?window:globalThis,function(){
  const ID={riolu:'me2pt5-112',lucario:'me2pt5-113',solrock:'me2pt5-106',lunatone:'me2pt5-105',makuhita:'me1-72',hariyama:'me1-73',fighting:'sve-6',rocky:'me3-87',gong:'me1-116',pad:'me2pt5-198',ultra:'me1-131',secret:'sv6-163',premium:'me1-124',stretcher:'me2pt5-196',balloon:'zsv10pt5-79',switch:'me1-130',boss:'me1-114',lillie:'me1-119',judge:'me3-76',brock:'sv9-146',blackBelt:'sv9-143',gravity:'sv8-177'};
  const find=(list,id)=>list.find(c=>c.id===id);
  const count=(list,id)=>list.filter(c=>c.id===id).length;
  const shuffle=(list,random)=>{for(let i=list.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[list[i],list[j]]=[list[j],list[i]];}return list;};
  function takeTurn(g){
    if(g.over||g.turn!==1||g.pendingPromotion!==null)return;
    const p=g.bot,op=g.me;
    const units=()=>g.allRefs(p).map(x=>x.unit);
    const name=u=>g.top(u).name;
    const inPlay=id=>units().some(u=>u.stack[0].id===id);
    const qtyInPlay=id=>units().filter(u=>u.stack[0].id===id).length;
    const fightingEnergy=e=>g.energyType(e)==='Fighting';
    const spent=c=>{p.discard.push(g.takeHand(p,c.uid));g.print('CPU memainkan '+g.name(c)+'.');g.recordAction(p,'card',g.name(c),'Dimainkan ('+g.card(c).supertype+')',{cardId:c.id,subtype:g.card(c).supertype});};
    const search=(predicate,n=1,preferred=null)=>{const picked=preferred?find(p.deck,preferred):null;return g.search(p,predicate,n,picked?[picked.uid]:[]);};
    const healSearch=()=>{
      const stretcher=find(p.hand,ID.stretcher);if(!stretcher)return;
      const target=!inPlay(ID.riolu)&&find(p.discard,ID.riolu)?ID.riolu:
        units().some(u=>name(u)==='Riolu')&&find(p.discard,ID.lucario)?ID.lucario:
        !find(p.hand,ID.fighting)&&find(p.discard,ID.fighting)?ID.fighting:null;
      if(!target)return;spent(stretcher);g.recover(p,c=>c.id===target,1,[find(p.discard,target).uid]);
    };
    const bench=()=>{
      for(const id of [ID.riolu,ID.solrock,ID.lunatone,ID.riolu,ID.makuhita]){
        if(p.bench.length>=5)break;const limit=id===ID.riolu?3:1;if(qtyInPlay(id)>=limit)continue;
        const c=find(p.hand,id);if(!c)continue;p.bench.push(g.unit(g.takeHand(p,c.uid),p.turns));g.print('CPU menaruh '+g.name(c)+' di Bench.');g.recordAction(p,'card',g.name(c),'Masuk ke Bench',{cardId:c.id,subtype:'Basic'});
      }
    };
    const searchTarget=kind=>{
      if(!inPlay(ID.riolu)&&p.bench.length<5)return find(p.deck,ID.riolu);
      if(!inPlay(ID.solrock)&&p.bench.length<5)return find(p.deck,ID.solrock);
      if(!inPlay(ID.lunatone)&&p.bench.length<5)return find(p.deck,ID.lunatone);
      if(kind==='ultra'&&units().some(u=>name(u)==='Riolu')&&!find(p.hand,ID.lucario))return find(p.deck,ID.lucario);
      if(kind==='pad'&&inPlay(ID.makuhita)&&!find(p.hand,ID.hariyama))return find(p.deck,ID.hariyama);
      if(kind==='gong'&&!find(p.hand,ID.fighting))return find(p.deck,ID.fighting);
      if(kind==='ultra'&&!inPlay(ID.makuhita)&&p.bench.length<5)return find(p.deck,ID.makuhita);
      return null;
    };
    const discardValue=c=>{
      if(c.id===ID.fighting&&count(p.hand,ID.fighting)>=2)return 4; // Aura Jab wants Basic Fighting Energy in discard.
      if(c.id===ID.rocky&&count(p.hand,ID.rocky)>=2)return 3;
      if(c.id===ID.gravity&&g.stadium?.id===ID.gravity)return 5;
      if(c.id===ID.lucario&&units().some(u=>name(u)==='Mega Lucario ex'))return 3;
      if(c.id===ID.riolu&&qtyInPlay(ID.riolu)>=2)return 3;
      if(c.id===ID.premium&&count(p.hand,ID.premium)>2)return 2;
      if(c.id===ID.lucario&&!units().some(u=>name(u)==='Mega Lucario ex'))return -8;
      if(c.id===ID.fighting)return -5;
      return 0;
    };
    const searchItems=()=>{for(let pass=0;pass<8;pass++){let played=false;for(const [id,kind] of [[ID.gong,'gong'],[ID.pad,'pad'],[ID.ultra,'ultra']]){
          const item=find(p.hand,id),target=searchTarget(kind);if(!item||!target)continue;
          if(id===ID.pad&&g.card(target).rules?.some(x=>x.includes('ex Rule')))continue;
          if(id===ID.gong&&!(target.id===ID.fighting||(g.isBasic(target)&&g.card(target).types?.includes('Fighting'))))continue;
          if(id===ID.ultra&&p.hand.length<4)continue;
          spent(item);if(id===ID.ultra){const pool=[...p.hand].sort((a,b)=>discardValue(b)-discardValue(a));for(const c of pool.slice(0,2))p.discard.push(g.takeHand(p,c.uid));}
          p.deck.splice(p.deck.indexOf(target),1);p.hand.push(target);shuffle(p.deck,g.random);g.print('CPU mencari '+g.name(target)+'.');played=true;break;
        }if(!played)break;}};
    const secretBox=()=>{const c=find(p.hand,ID.secret);if(!c||p.hand.length<5)return;const wants=units().some(u=>name(u)==='Riolu')&&!find(p.hand,ID.lucario)||!find(p.hand,ID.fighting);if(!wants)return;
      p.discard.push(g.takeHand(p,c.uid));g.recordAction(p,'card','Secret Box','Dimainkan (Item ACE SPEC)',{cardId:ID.secret,subtype:'Item'});for(const x of [...p.hand].sort((a,b)=>discardValue(b)-discardValue(a)).slice(0,3))p.discard.push(g.takeHand(p,x.uid));
      for(const [type,preferred] of [['Item',ID.ultra],['Pokémon Tool',ID.balloon],['Supporter',ID.lillie],['Stadium',ID.gravity]]){
        const target=find(p.deck,preferred)||p.deck.find(x=>g.card(x).subtypes?.includes(type));if(!target)continue;
        p.deck.splice(p.deck.indexOf(target),1);p.hand.push(target);
      }shuffle(p.deck,g.random);g.print('CPU memakai Secret Box untuk menyiapkan kombinasi kartu.');};
    const evolve=()=>{for(const id of [ID.lucario,ID.hariyama])for(const c of [...p.hand].filter(x=>x.id===id)){
        const u=units().filter(x=>g.canEvolve(p,g.card(c),x)).sort((a,b)=>b.energy.length-a.energy.length)[0];if(!u)continue;
        u.stack.push(g.takeHand(p,c.uid));u.evolvedTurn=p.turns;u.poisoned=false;u.paralyzed=false;u.attackLocks={};g.print('CPU mengevolusikan '+name(u)+'.');g.recordAction(p,'card',g.card(c).name,'Evolusi menjadi '+name(u),{cardId:c.id,subtype:'Evolution'});
      }};
    const stadium=()=>{const c=find(p.hand,ID.gravity);if(!c||p.stadiumUsed||g.stadium?.id===ID.gravity)return;const old=g.stadium;if(old)old.owner.discard.push(old.card);g.stadium={id:ID.gravity,card:g.takeHand(p,c.uid),owner:p};p.stadiumUsed=true;g.print(old?'CPU mengganti '+g.card(old.card).name+' dengan Gravity Mountain.':'CPU memainkan Gravity Mountain di area bersama.');g.recordAction(p,'card','Gravity Mountain','Dimainkan di arena bersama',{cardId:ID.gravity,subtype:'Stadium'});g.checkAllKO();};
    const attachTool=()=>{const c=find(p.hand,ID.balloon);if(!c)return;const target=units().filter(u=>!u.tool).sort((a,b)=>{const score=u=>u===p.active&&name(u)!=='Mega Lucario ex'?5:u===p.active?3:0;return score(b)-score(a);})[0];if(!target)return;target.tool=g.takeHand(p,c.uid);g.print('CPU memasang Air Balloon pada '+name(target)+'.');g.recordAction(p,'card','Air Balloon','Dipasang pada '+name(target),{cardId:ID.balloon,subtype:'Tool'});};
    const energyTarget=()=>units().sort((a,b)=>{const score=u=>(name(u)==='Mega Lucario ex'?40:name(u)==='Riolu'?30:name(u)==='Hariyama'?22:name(u)==='Solrock'?12:4)+(u===p.active?4:0)-Math.min(3,u.energy.length)*12;return score(b)-score(a);})[0]||p.active;
    const attach=()=>{if(p.energyUsed)return;const c=find(p.hand,ID.fighting)||find(p.hand,ID.rocky);if(!c)return;const target=energyTarget();target.energy.push(g.takeHand(p,c.uid));p.energyUsed=true;g.print('CPU memasang Fighting Energy ke '+name(target)+'.');g.recordAction(p,'card',g.card(c).name,'Dipasang ke '+name(target),{cardId:c.id,subtype:'Energy'});};
    const lunarCycle=()=>{if(p.abilityFlags.lunar===p.turns||!inPlay(ID.solrock)||!inPlay(ID.lunatone)||!p.deck.length)return;const energy=find(p.hand,ID.fighting);if(!energy)return;
      p.discard.push(g.takeHand(p,energy.uid));g.draw(p,3);p.abilityFlags.lunar=p.turns;g.print('CPU memakai Lunar Cycle: membuang Fighting Energy dan mengambil 3 kartu.');g.recordAction(p,'skill','Lunar Cycle (Solrock/Lunatone)','Membuang Fighting Energy dan mengambil 3 kartu',{abilityName:'Lunar Cycle',cardId:ID.solrock});};
    const supporter=()=>{if(p.supporterUsed||p.turns===1)return;let c=null;
      if(p.hand.length<=4)c=find(p.hand,ID.lillie);
      if(!c&&op.hand.length>=6&&p.hand.length<=5)c=find(p.hand,ID.judge);
      if(!c&&units().some(u=>name(u)==='Riolu')&&!find(p.hand,ID.lucario))c=find(p.hand,ID.brock);
      if(!c&&p.hand.length<=3)c=find(p.hand,ID.lillie);
      if(!c)return;spent(c);p.supporterUsed=true;
      if(c.id===ID.lillie){p.deck.push(...p.hand.splice(0));shuffle(p.deck,g.random);g.draw(p,p.prize.length===6?8:6);}
      else if(c.id===ID.judge){for(const q of g.players){q.deck.push(...q.hand.splice(0));shuffle(q.deck,g.random);g.draw(q,4);}}
      else if(c.id===ID.brock){const target=find(p.deck,ID.lucario)||find(p.deck,ID.hariyama);if(target)g.search(p,x=>g.card(x).supertype==='Pokémon'&&!g.isBasic(x),1,[target.uid]);else g.search(p,x=>g.isBasic(x),2);}
    };
    const damage=(attacker,target,move,extra=0)=>{let n=(parseInt(move.damage,10)||0)+extra;
      if(g.top(attacker).types?.includes('Fighting'))n+=p.bonus;
      if(p.blackBelt&&g.top(target).subtypes?.includes('ex'))n+=40;
      if(move.name!=='Cosmic Beam'){if(g.top(target).weaknesses?.[0]?.type==='Fighting')n*=2;if(g.top(target).resistances?.[0]?.type==='Fighting')n=Math.max(0,n-Math.abs(parseInt(g.top(target).resistances[0].value,10)||0));}
      return n;};
    const legalMoves=u=>{if(u.paralyzed)return[];return(g.top(u).attacks||[]).filter(a=>g.hasCost(u,a.cost||[])&&!(u.attackLocks[a.name]>=p.turns)&&!(a.name==='Cosmic Beam'&&!p.bench.some(b=>name(b)==='Lunatone')));};
    const maxDamage=(u,target,extra=0)=>Math.max(0,...legalMoves(u).map(m=>damage(u,target,m,extra)));
    const switchAttacker=()=>{const scored=units().map(u=>{const dmg=maxDamage(u,op.active),ko=dmg>=g.remaining(op.active);return{u,score:(ko?500+g.prizeCount(op.active)*120:0)+Math.min(dmg,400)+(name(u)==='Mega Lucario ex'?35:0)}}).sort((a,b)=>b.score-a.score);
      const best=scored[0];if(!best||best.u===p.active||best.score<=scored.find(x=>x.u===p.active).score)return;
      const index=p.bench.indexOf(best.u),sw=find(p.hand,ID.switch);if(sw){spent(sw);g.gust(p,index);return;}
      if(g.canRetreat(p)){const old=p.active;for(let i=0;i<g.retreatCost(old);i++)p.discard.push(old.energy.pop());old.poisoned=false;old.paralyzed=false;p.active=p.bench.splice(index,1)[0];p.bench.push(old);p.retreated=true;g.print('CPU mundur ke '+name(p.active)+'.');}};
    const prizeTarget=()=>{const active=g.remaining(op.active),activePrize=g.prizeCount(op.active),boss=find(p.hand,ID.boss);if(!boss||p.supporterUsed||!op.bench.length)return null;
      let best=null;for(let i=0;i<op.bench.length;i++){const u=op.bench[i],d=maxDamage(p.active,u);if(d<g.remaining(u))continue;const score=g.prizeCount(u)*100+Math.max(0,400-g.remaining(u));if(!best||score>best.score)best={index:i,score,prize:g.prizeCount(u)};}
      if(!best)return null;if(maxDamage(p.active,op.active)>=active&&activePrize>=best.prize)return null;return best.index;};
    const powerTurn=()=>{if(!p.active||!g.top(p.active).types?.includes('Fighting'))return;const canBoss=!!find(p.hand,ID.boss)&&!p.supporterUsed;const targetCandidates=[op.active,...(canBoss?op.bench:[])];
      const premiumInHand=count(p.hand,ID.premium),belt=find(p.hand,ID.blackBelt);
      let best=null;for(const target of targetCandidates){for(const move of legalMoves(p.active)){
        const base=damage(p.active,target,move),need=g.remaining(target);
        for(let useBelt=0;useBelt<=Number(!!belt&&!p.supporterUsed&&target===op.active&&g.top(target).subtypes?.includes('ex'));useBelt++){
          const afterBelt=base+(useBelt?40:0),premiums=Math.max(0,Math.ceil((need-afterBelt)/30));
          if(premiums>premiumInHand||premiums===0&&useBelt===0)continue;
          if(afterBelt+premiums*30<need)continue;
          const score=g.prizeCount(target)*100-premiums*10-useBelt*5;
          if(!best||score>best.score)best={target,premiums,useBelt,score};
        }
      }}
      if(!best)return;if(best.useBelt){spent(belt);p.supporterUsed=true;p.blackBelt=true;}
      for(let i=0;i<best.premiums;i++){const c=find(p.hand,ID.premium);spent(c);p.bonus+=30;}
    };
    const attack=()=>{if(!g.canAttack(p))return false;let best=null;for(const {attack:move,index} of g.validMoves(p)){
        const dmg=damage(p.active,op.active,move),ko=dmg>=g.remaining(op.active),prize=g.prizeCount(op.active);
        let score=(ko?500+prize*140:0)+Math.min(dmg,g.remaining(op.active));
        if(move.name==='Aura Jab'){score+=p.discard.filter(c=>c.id===ID.fighting).length&&p.bench.length?95:15;}
        if(move.name==='Mega Brave'&&!ko)score-=55;
        if(move.name==='Wild Press'&&g.remaining(p.active)<=70&&!ko)score-=350;
        if(!best||score>best.score)best={index,move,score};
      }
      if(!best)return false;const options={};if(best.move.name==='Aura Jab'&&p.bench.length){const target=p.bench.map((u,i)=>({u,i})).sort((a,b)=>{const priority=x=>name(x.u)==='Riolu'?20:name(x.u)==='Hariyama'?12:0;return priority(b)-priority(a);})[0];options.energyTargets=Array(Math.min(3,count(p.discard,ID.fighting))).fill(target.i);}
      const result=g.attack(best.index,options);return result.ok;};

    bench();searchItems();bench();secretBox();searchItems();evolve();stadium();healSearch();
    supporter();bench();searchItems();evolve();attachTool();attach();lunarCycle();bench();evolve();
    switchAttacker();powerTurn();const target=prizeTarget();if(target!==null){const boss=find(p.hand,ID.boss);spent(boss);p.supporterUsed=true;g.gust(op,target);g.print('CPU mengejar Pokémon bernilai '+g.prizeCount(op.active)+' Prize.');}
    if(attack())return;g.print('CPU mengakhiri giliran.');g.endTurn();
  }
  return{takeTurn};
});

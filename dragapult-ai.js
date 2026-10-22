(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.PTCGDragapultAI=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  const ID={
    dreepy:'me2pt5-158',
    drakloak:'me2pt5-159',
    dragapult:'me2pt5-160',
    fez:'sv6pt5-38',
    meowth:'me3-62',
    oricorio:'me2-18',
    fire:'sve-2',
    psychic:'sve-5',
    candy:'me1-125',
    ultra:'me1-131',
    pad:'me2pt5-198',
    stretcher:'me2pt5-196',
    balloon:'zsv10pt5-79',
    switch:'me1-130',
    boss:'me1-114',
    lillie:'me1-119',
    judge:'me3-76',
    cage:'me2-85',
    trolley:'sv8-185'
  };

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

    const spent=c=>{
      p.discard.push(g.takeHand(p,c.uid));
      g.print('CPU memainkan '+g.name(c)+'.');
      g.recordAction(p,'card',g.name(c),'Dimainkan ('+g.card(c).supertype+')',{cardId:c.id,subtype:g.card(c).supertype});
    };

    // 1. Bench Basics
    const benchBasics=()=>{
      for(const id of [ID.dreepy,ID.dreepy,ID.meowth,ID.fez,ID.oricorio]){
        if(p.bench.length>=5)break;
        const limit=id===ID.dreepy?3:1;
        if(qtyInPlay(id)>=limit)continue;
        const c=find(p.hand,id);if(!c)continue;
        p.bench.push(g.unit(g.takeHand(p,c.uid),p.turns));
        g.print('CPU menaruh '+g.name(c)+' di Bench.');
        g.recordAction(p,'card',g.name(c),'Masuk ke Bench',{cardId:c.id,subtype:'Basic'});
      }
    };

    // 2. Precious Trolley
    const trolley=()=>{
      const c=find(p.hand,ID.trolley);if(!c||p.bench.length>=5)return;
      spent(c);
      const needed=[ID.dreepy,ID.dreepy,ID.meowth,ID.fez].filter(id=>qtyInPlay(id)<(id===ID.dreepy?3:1));
      for(const id of needed){
        if(p.bench.length>=5)break;
        const card=p.deck.find(x=>x.id===id);
        if(!card)continue;
        p.deck.splice(p.deck.indexOf(card),1);
        p.bench.push(g.unit(card,p.turns));
        g.recordAction(p,'card',g.name(card),'Masuk ke Bench via Trolley',{cardId:card.id,subtype:'Basic'});
      }
      shuffle(p.deck,g.random);
      g.print('CPU memainkan Precious Trolley.');
    };

    // 3. Search Items (Ultra Ball & Poké Pad)
    const searchItems=()=>{
      for(let pass=0;pass<4;pass++){
        let played=false;
        // Poké Pad (searches non-ex Pokémon: Dreepy or Drakloak)
        const pad=find(p.hand,ID.pad);
        if(pad){
          const target=units().some(u=>name(u)==='Dreepy')&&!find(p.hand,ID.drakloak)?find(p.deck,ID.drakloak):!inPlay(ID.dreepy)?find(p.deck,ID.dreepy):null;
          if(target){
            spent(pad);
            p.deck.splice(p.deck.indexOf(target),1);
            p.hand.push(target);
            shuffle(p.deck,g.random);
            g.print('CPU memakai Poké Pad mencari '+g.name(target)+'.');
            played=true;
          }
        }
        // Ultra Ball
        const ultra=find(p.hand,ID.ultra);
        if(ultra&&p.hand.length>=3){
          const wantsDragapult=!find(p.hand,ID.dragapult)&&units().some(u=>name(u)==='Dreepy'||name(u)==='Drakloak');
          const target=wantsDragapult?find(p.deck,ID.dragapult):units().some(u=>name(u)==='Dreepy')&&!find(p.hand,ID.drakloak)?find(p.deck,ID.drakloak):find(p.deck,ID.dreepy);
          if(target){
            spent(ultra);
            // Discard 2 spare cards
            const spares=[...p.hand].filter(x=>x.id!==target.id&&x.id!==ID.candy).slice(0,2);
            for(const sp of spares)p.discard.push(g.takeHand(p,sp.uid));
            p.deck.splice(p.deck.indexOf(target),1);
            p.hand.push(target);
            shuffle(p.deck,g.random);
            g.print('CPU memakai Ultra Ball mencari '+g.name(target)+'.');
            played=true;
          }
        }
        if(!played)break;
      }
    };

    // 4. Evolution (Rare Candy and Normal)
    const evolve=()=>{
      // Rare Candy Dreepy -> Dragapult ex
      for(let i=0;i<2;i++){
        const candy=find(p.hand,ID.candy),drag=find(p.hand,ID.dragapult);
        if(!candy||!drag)break;
        const dreepy=units().find(u=>name(u)==='Dreepy'&&u.placedTurn<p.turns&&u.evolvedTurn!==p.turns);
        if(!dreepy)break;
        spent(candy);
        dreepy.stack.push(g.takeHand(p,drag.uid));
        dreepy.evolvedTurn=p.turns;
        dreepy.poisoned=false;dreepy.paralyzed=false;
        g.print('CPU memakai Rare Candy mengevolusikan Dragapult ex.');
        g.recordAction(p,'card','Dragapult ex','Evolusi via Rare Candy',{cardId:ID.dragapult,subtype:'Evolution'});
      }
      // Normal evolution Dreepy -> Drakloak
      for(const c of [...p.hand].filter(x=>x.id===ID.drakloak)){
        const u=units().find(x=>g.canEvolve(p,g.card(c),x));
        if(!u)continue;
        u.stack.push(g.takeHand(p,c.uid));
        u.evolvedTurn=p.turns;u.poisoned=false;u.paralyzed=false;u.attackLocks={};
        g.print('CPU mengevolusikan Drakloak.');
        g.recordAction(p,'card','Drakloak','Evolusi menjadi Drakloak',{cardId:ID.drakloak,subtype:'Evolution'});
      }
      // Normal evolution Drakloak -> Dragapult ex
      for(const c of [...p.hand].filter(x=>x.id===ID.dragapult)){
        const u=units().find(x=>g.canEvolve(p,g.card(c),x));
        if(!u)continue;
        u.stack.push(g.takeHand(p,c.uid));
        u.evolvedTurn=p.turns;u.poisoned=false;u.paralyzed=false;u.attackLocks={};
        g.print('CPU mengevolusikan Dragapult ex.');
        g.recordAction(p,'card','Dragapult ex','Evolusi menjadi Dragapult ex',{cardId:ID.dragapult,subtype:'Evolution'});
      }
    };

    // 5. Abilities (Recon Directive & Flip the Script)
    const useAbilities=()=>{
      // Recon Directive on Drakloaks
      for(const {ref,unit} of g.allRefs(p)){
        if(name(unit)==='Drakloak'&&g.canAbility(p,ref)){
          g.useAbility(ref);
        }
      }
      // Flip the Script on Fezandipiti ex
      const fezUnit=units().find(u=>name(u)==='Fezandipiti ex');
      if(fezUnit&&p.koLastTurn&&p.abilityFlags.flip!==p.turns&&p.deck.length){
        g.draw(p,3);
        p.abilityFlags.flip=p.turns;
        g.print('CPU memakai Flip the Script: mengambil 3 kartu.');
        g.recordAction(p,'skill','Flip the Script (Fezandipiti ex)','Mengambil 3 kartu',{abilityName:'Flip the Script',cardId:ID.fez});
      }
    };

    // 6. Stadium & Tool
    const playStadium=()=>{
      const c=find(p.hand,ID.cage);if(!c||p.stadiumUsed||g.stadium?.id===ID.cage)return;
      const old=g.stadium;if(old)old.owner.discard.push(old.card);
      g.stadium={id:ID.cage,card:g.takeHand(p,c.uid),owner:p};
      p.stadiumUsed=true;
      g.print(old?'CPU mengganti '+g.card(old.card).name+' dengan Battle Cage.':'CPU memainkan Battle Cage di arena bersama.');
      g.recordAction(p,'card','Battle Cage','Dimainkan di arena bersama',{cardId:ID.cage,subtype:'Stadium'});
      g.checkAllKO();
    };

    const attachTool=()=>{
      const c=find(p.hand,ID.balloon);if(!c)return;
      const candidate=units().find(u=>!u.tool);
      if(!candidate)return;
      candidate.tool=g.takeHand(p,c.uid);
      g.print('CPU memasang Air Balloon pada '+name(candidate)+'.');
      g.recordAction(p,'card','Air Balloon','Dipasang pada '+name(candidate),{cardId:ID.balloon,subtype:'Tool'});
    };

    // 7. Energy Attachment (prioritize Dragapult ex for Fire + Psychic)
    const attachEnergy=()=>{
      if(p.energyUsed)return;
      const dragapultUnit=units().find(u=>name(u)==='Dragapult ex');
      const target=dragapultUnit||units().find(u=>name(u)==='Drakloak'||name(u)==='Dreepy')||p.active;
      if(!target)return;
      const hasFire=target.energy.some(e=>g.energyType(e)==='Fire');
      const hasPsychic=target.energy.some(e=>g.energyType(e)==='Psychic');
      let chosen=null;
      if(!hasFire)chosen=find(p.hand,ID.fire)||find(p.hand,ID.psychic);
      else if(!hasPsychic)chosen=find(p.hand,ID.psychic)||find(p.hand,ID.fire);
      else chosen=find(p.hand,ID.fire)||find(p.hand,ID.psychic);
      if(!chosen)return;
      target.energy.push(g.takeHand(p,chosen.uid));
      p.energyUsed=true;
      g.print('CPU memasang '+g.name(chosen)+' ke '+name(target)+'.');
      g.recordAction(p,'card',g.name(chosen),'Dipasang ke '+name(target),{cardId:chosen.id,subtype:'Energy'});
    };

    // 8. Supporter
    const playSupporter=()=>{
      if(p.supporterUsed||p.turns===1)return;
      let c=null;
      if(p.hand.length<=4)c=find(p.hand,ID.lillie);
      if(!c&&op.hand.length>=6&&p.hand.length<=5)c=find(p.hand,ID.judge);
      if(!c&&find(p.hand,ID.boss)&&op.bench.length){
        // Boss to KO an injured opponent
        const killable=op.bench.findIndex(u=>g.remaining(u)<=200);
        if(killable>=0)c=find(p.hand,ID.boss);
      }
      if(!c&&p.hand.length<=3)c=find(p.hand,ID.lillie);
      if(!c)return;
      spent(c);p.supporterUsed=true;
      if(c.id===ID.lillie){
        p.deck.push(...p.hand.splice(0));shuffle(p.deck,g.random);g.draw(p,p.prize.length===6?8:6);
      }else if(c.id===ID.judge){
        for(const q of g.players){q.deck.push(...q.hand.splice(0));shuffle(q.deck,g.random);g.draw(q,4);}
      }else if(c.id===ID.boss&&op.bench.length){
        const killable=op.bench.findIndex(u=>g.remaining(u)<=200);
        g.gust(op,killable>=0?killable:0);
      }
    };

    // 9. Switch / Pivot to Dragapult ex
    const pivotToDragapult=()=>{
      if(name(p.active)==='Dragapult ex')return;
      const readyIdx=p.bench.findIndex(u=>name(u)==='Dragapult ex'&&g.hasCost(u,['Fire','Psychic']));
      if(readyIdx<0)return;
      const sw=find(p.hand,ID.switch);
      if(sw){
        spent(sw);g.gust(p,readyIdx);return;
      }
      if(g.canRetreat(p)){
        const old=p.active;
        for(let i=0;i<g.retreatCost(old);i++)p.discard.push(old.energy.pop());
        old.poisoned=false;old.paralyzed=false;
        p.active=p.bench.splice(readyIdx,1)[0];
        p.bench.push(old);
        p.retreated=true;
        g.print('CPU mundur ke Dragapult ex.');
      }
    };

    // 10. Attack
    const attack=()=>{
      if(!g.canAttack(p))return false;
      const moves=g.validMoves(p);
      if(!moves.length)return false;
      const phantom=moves.find(m=>m.attack.name==='Phantom Dive');
      const bestMove=phantom||moves[0];
      const options={};
      if(bestMove.attack.name==='Phantom Dive'&&op.bench.length){
        // Choose bench target for 60 damage: prioritize knockout or highest Prize
        let bestTargetIdx=0,bestScore=-1;
        op.bench.forEach((u,idx)=>{
          const canKO=g.remaining(u)<=60;
          const score=(canKO?300:0)+g.prizeCount(u)*50+Math.max(0,100-g.remaining(u));
          if(score>bestScore){bestScore=score;bestTargetIdx=idx;}
        });
        options.targetBenchIndex=bestTargetIdx;
      }
      const result=g.attack(bestMove.index,options);
      return result.ok;
    };

    benchBasics();
    trolley();
    searchItems();
    evolve();
    useAbilities();
    searchItems();
    evolve();
    playStadium();
    attachTool();
    attachEnergy();
    playSupporter();
    pivotToDragapult();
    if(attack())return;
    g.print('CPU mengakhiri giliran.');
    g.endTurn();
  }

  return{takeTurn};
});

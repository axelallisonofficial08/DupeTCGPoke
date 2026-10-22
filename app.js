(() => {
  PTCGProAI.install(PTCGEngine.Game,typeof PTCGLucarioAI!=='undefined'?PTCGLucarioAI.takeTurn:null,typeof PTCGDragapultAI!=='undefined'?PTCGDragapultAI.takeTurn:null);
  const initialPlayerDeck = (typeof localStorage!=='undefined'&&localStorage.getItem('ptcg_player_deck'))||'rocket';
  const initialCpuDeck = (typeof localStorage!=='undefined'&&localStorage.getItem('ptcg_cpu_deck'))||'dragapult';
  const validDeck = d => PTCGEngine.DECKS && PTCGEngine.DECKS[d];
  const pDeck = validDeck(initialPlayerDeck) ? initialPlayerDeck : 'rocket';
  const cDeck = validDeck(initialCpuDeck) ? initialCpuDeck : 'dragapult';
  const game=new PTCGEngine.Game(window.CARD_DATA,Math.random,[pDeck,cDeck]);
  window.game=game;
  const $=id=>document.getElementById(id);
  let aiQueued=false,draggedUid=null,dragGhost=null,touchStart=null,suppressClickUntil=0,promotionOpen=false,opponentHandOpen=true;
  const refName=(player,ref)=>game.top(game.unitAt(player,ref)).name+(ref==='active'?' · Active':' · Bench '+(ref+1));
  const cardName=instance=>game.card(instance).name;

  function makeCard(instance,unit=null,kind='') {
    const printed=game.card(instance);
    const button=document.createElement('button');
    button.type='button';button.className='tcg-card '+kind;
    button.setAttribute('aria-label',printed.name+(unit?' · '+game.remaining(unit)+' HP tersisa':''));
    button.title=printed.name;
    const image=document.createElement('img');
    image.src='assets/cards/'+instance.id+'.png';image.alt=printed.name;image.draggable=false;
    image.onerror=()=>{if(printed.images?.small||printed.images?.large)image.src=printed.images.small||printed.images.large;};
    button.append(image);
    if(unit){
      const hp=document.createElement('span');hp.className='badge';hp.textContent=game.remaining(unit)+' HP';button.append(hp);
      const attachments=document.createElement('span');attachments.className='attachments';
      attachments.textContent=(unit.energy.length?'⚡'+unit.energy.length:'')+(unit.tool?' · Tool':'')+(unit.poisoned?' · Poison':'')+(unit.paralyzed?' · Paralyzed':'');
      button.append(attachments);
    }
    return button;
  }
  function label(text,className){const div=document.createElement('div');div.className=className;div.textContent=text;return div;}
  function renderField(player,id,mine){
    const root=$(id);root.replaceChildren();
    const head=document.createElement('div');head.className='field-head';
    const name=document.createElement('strong');name.textContent=player.name;
    const headRight=document.createElement('div');headRight.className='field-head-right';
    const count=document.createElement('small');count.textContent='Dek '+player.deck.length+' · Tangan '+player.hand.length+' · Prize '+player.prize.length;
    const trashBtn=document.createElement('button');trashBtn.type='button';trashBtn.className='trash-btn';
    trashBtn.innerHTML='🗑️ Trash ('+player.discard.length+')';
    trashBtn.title='Lihat isi Trash/Buangan '+player.name;
    trashBtn.onclick=()=>openDiscardMenu(player,mine);
    headRight.append(count,trashBtn);
    head.append(name,headRight);root.append(head);
    const zones=document.createElement('div');zones.className='zones';
    const left=document.createElement('div');left.append(label('Prize','zone-label'));
    const prizes=document.createElement('div');prizes.className='prizes';
    for(let i=0;i<player.prize.length;i++){const prize=document.createElement('div');prize.className='prize';prizes.append(prize);}
    const deckPile=label('Dek '+player.deck.length,'pile');
    const trashPile=document.createElement('button');trashPile.type='button';trashPile.className='pile pile-discard';
    trashPile.innerHTML='🗑️ Trash ('+player.discard.length+')';
    trashPile.title='Lihat isi Trash/Buangan '+player.name;
    trashPile.onclick=()=>openDiscardMenu(player,mine);
    left.append(prizes,deckPile,trashPile);
    const active=document.createElement('div');active.className='zone';active.append(label('Active','zone-label'));
    if(player.active){
      const button=makeCard(player.active.stack.at(-1),player.active,'active');
      if(mine){
        button.dataset.drop='pokemon';button.dataset.ref='active';
        button.onclick=()=>openPokemonMenu('active',true);
      }else{
        button.title='Lihat detail Active CPU ('+game.top(player.active).name+')';
        button.onclick=()=>openPokemonMenu('active',false);
      }
      active.append(button);
    }else active.append(label('Menunggu pengganti','empty-slot'));
    const right=document.createElement('div');right.className='zone';right.append(label('Bench '+player.bench.length+'/5','zone-label'));
    const bench=document.createElement('div');bench.className='bench-list';
    if(mine)bench.dataset.drop='bench';
    player.bench.forEach((unit,index)=>{
      const button=makeCard(unit.stack.at(-1),unit);
      if(mine){
        button.dataset.drop='pokemon';button.dataset.ref=String(index);
        button.onclick=()=>openPokemonMenu(index,true);
      }else{
        button.title='Lihat detail Bench CPU ('+game.top(unit).name+')';
        button.onclick=()=>openPokemonMenu(index,false);
      }
      bench.append(button);
    });
    if(mine&&player.bench.length<5)bench.append(label('Taruh Basic di sini','empty-slot'));
    right.append(bench);
    if(mine){const trainer=label('Taruh Item atau Supporter di sini','trainer-slot');trainer.dataset.drop='trainer';right.append(trainer);}
    zones.append(left,active,right);root.append(zones);
    if(!mine){
      const details=document.createElement('details');details.className='opponent-hand';details.open=opponentHandOpen;
      const summary=document.createElement('summary');summary.textContent='Tangan CPU terbuka ('+player.hand.length+' kartu)';details.append(summary);
      const cards=document.createElement('div');cards.className='opponent-hand-list';
      if(!player.hand.length)cards.append(label('Tangan CPU kosong.','opponent-hand-empty'));
      for(const instance of player.hand){
        const entry=document.createElement('div');entry.className='opponent-hand-entry';
        const button=makeCard(instance,null,'revealed');button.title='Lihat detail '+cardName(instance);
        button.onclick=()=>showOpponentCard(instance);
        entry.append(button,label(cardName(instance),'opponent-card-name'));cards.append(entry);
      }
      details.append(cards);details.ontoggle=()=>{opponentHandOpen=details.open;};root.append(details);
    }
  }
  function renderStadium(){
    const root=$('stadiumZone');root.replaceChildren();
    if(!game.stadium){
      root.append(label('STADIUM BERSAMA','stadium-title'),label('Seret Stadium ke sini','stadium-empty'));
      return;
    }
    const card=game.stadium.card,printed=game.card(card);
    const button=makeCard(card,null,'stadium-card');
    button.onclick=()=>openStadiumMenu();
    button.title='Buka menu Stadium '+printed.name;
    const info=document.createElement('div');info.className='stadium-info';
    info.append(label('STADIUM BERSAMA','stadium-title'),label(printed.name,'stadium-name'),
      label('Dimainkan '+(game.stadium.owner===game.me?'kamu':'CPU')+' · berlaku untuk keduanya','stadium-owner'));
    if(printed.id==='sv10-173'){
      const canUse=game.canUseStadium(game.me);
      const actBtn=document.createElement('button');
      actBtn.type='button';
      actBtn.className='stadium-ability-btn';
      actBtn.textContent=canUse?'⚡ Gunakan Efek (Ambil 2 Kartu)':'Ability Belum Aktif';
      actBtn.disabled=!canUse;
      actBtn.onclick=e=>{e.stopPropagation();apply(game.useStadium());};
      info.append(actBtn);
    }
    root.append(button,info);
  }
  async function openStadiumMenu(){
    if(!game.stadium)return;
    const card=game.stadium.card,printed=game.card(card);
    const options=[];
    if(printed.id==='sv10-173'){
      const canUse=game.canUseStadium(game.me);
      options.push({
        label:'⚡ Gunakan Ability Stadium: Ambil 2 kartu',
        value:'use',
        disabled:!canUse
      });
    }
    options.push({label:'Tutup',value:'close'});
    const dom=buildCardDetailDOM(printed);
    const choice=await ask(printed.name,dom,options);
    if(choice==='use')apply(game.useStadium());
  }
  let activePlayerTab='player',activeHistoryFilter='all';

  function buildCardDetailDOM(card,unit=null,customSubtitle=''){
    const container=document.createElement('div');
    container.className='card-detail-layout';

    // Left: High-resolution card artwork
    const visualCol=document.createElement('div');
    visualCol.className='card-detail-visual';
    const img=document.createElement('img');
    img.src='assets/cards/'+card.id+'.png';
    img.alt=card.name;
    img.className='card-detail-img';
    img.onerror=()=>{if(card.images?.large||card.images?.small)img.src=card.images.large||card.images.small;};
    visualCol.append(img);

    // Right: Detailed information & stats
    const infoCol=document.createElement('div');
    infoCol.className='card-detail-info';

    // Badges: Supertype, Subtypes, HP
    const badges=document.createElement('div');
    badges.className='card-detail-badges';
    const typeBadge=document.createElement('span');
    typeBadge.className='cd-badge cd-type';
    typeBadge.textContent=(card.types?card.types.join('/'):card.supertype);
    badges.append(typeBadge);

    if(card.subtypes&&card.subtypes.length){
      const subBadge=document.createElement('span');
      subBadge.className='cd-badge cd-sub';
      subBadge.textContent=card.subtypes.join(' · ');
      badges.append(subBadge);
    }
    if(card.hp){
      const hpBadge=document.createElement('span');
      hpBadge.className='cd-badge cd-hp';
      hpBadge.textContent=(unit?game.remaining(unit)+' / '+card.hp:card.hp)+' HP';
      badges.append(hpBadge);
    }
    infoCol.append(badges);

    if(card.evolvesFrom){
      const evo=document.createElement('div');
      evo.className='cd-meta-row';
      evo.innerHTML='<strong>Evolusi dari:</strong> '+card.evolvesFrom;
      infoCol.append(evo);
    }

    // Ability
    if(card.abilities&&card.abilities.length){
      card.abilities.forEach(ab=>{
        const abBox=document.createElement('div');
        abBox.className='cd-box cd-ability-box';
        const usage=game.abilityUsageType?game.abilityUsageType(ab.name):'once';
        const usageTag=usage==='multi'?'Berulang kali':usage==='global_once'?'Global 1x / Turn':'1x / Turn (Kartu ini)';
        abBox.innerHTML=`
          <div class="cd-box-title">
            <span class="cd-title-txt">⚡ Ability: ${ab.name}</span>
            <span class="cd-usage-tag">${usageTag}</span>
          </div>
          <p class="cd-box-desc">${ab.text}</p>
        `;
        infoCol.append(abBox);
      });
    }

    // Attacks
    if(card.attacks&&card.attacks.length){
      const atkSec=document.createElement('div');
      atkSec.className='cd-attacks-section';
      card.attacks.forEach(atk=>{
        const atkBox=document.createElement('div');
        atkBox.className='cd-box cd-attack-box';
        const costSyms=(atk.cost||[]).map(c=>{
          const sym=c==='Fire'?'🔥':c==='Fighting'?'🥊':c==='Psychic'?'🔮':c==='Grass'?'🌿':c==='Lightning'?'⚡':c==='Darkness'?'🌑':c==='Metal'?'⚙️':c==='Dragon'?'🐲':'⚪';
          return `<span class="cd-cost-sym" title="${c}">${sym}</span>`;
        }).join(' ');
        atkBox.innerHTML=`
          <div class="cd-attack-header">
            <span class="cd-cost-wrap">${costSyms||'Free'}</span>
            <strong class="cd-atk-name">${atk.name}</strong>
            ${atk.damage?`<span class="cd-atk-dmg">${atk.damage} DMG</span>`:''}
          </div>
          ${atk.text?`<p class="cd-atk-text">${atk.text}</p>`:''}
        `;
        atkSec.append(atkBox);
      });
      infoCol.append(atkSec);
    }

    // Rules
    if(card.rules&&card.rules.length){
      const ruleBox=document.createElement('div');
      ruleBox.className='cd-box cd-rule-box';
      ruleBox.innerHTML=`<strong class="cd-rule-title">📜 Aturan Kartu:</strong><p class="cd-rule-text">${card.rules.join('<br>')}</p>`;
      infoCol.append(ruleBox);
    }

    // Stats: Weakness, Resistance, Retreat
    if(card.weaknesses||card.resistances||card.retreatCost){
      const stats=document.createElement('div');
      stats.className='cd-stats-row';
      if(card.weaknesses&&card.weaknesses.length){
        stats.innerHTML+=`<span class="cd-stat">Kelemahan: <b>${card.weaknesses.map(w=>w.type+' '+w.value).join(', ')}</b></span>`;
      }
      if(card.resistances&&card.resistances.length){
        stats.innerHTML+=`<span class="cd-stat">Resistansi: <b>${card.resistances.map(r=>r.type+' '+r.value).join(', ')}</b></span>`;
      }
      if(card.retreatCost){
        stats.innerHTML+=`<span class="cd-stat">Retreat: <b>${card.retreatCost.length} Energy</b></span>`;
      }
      infoCol.append(stats);
    }

    container.append(visualCol,infoCol);
    return container;
  }

  function showCardDetailsById(cardId){
    const card=game.cards[cardId];if(!card)return;
    const dom=buildCardDetailDOM(card);
    ask(card.name,dom,[{label:'Tutup',value:'close'}]);
  }
  function renderHistory(){
    const isPlayer=activePlayerTab==='player';
    const target=isPlayer?game.me:game.bot;
    const list=$('historyList');if(!list)return;
    const pCount=$('playerActionCount'),cCount=$('cpuActionCount');
    if(pCount)pCount.textContent=String(game.me?.history?.length||0);
    if(cCount)cCount.textContent=String(game.bot?.history?.length||0);
    const hist=target?.history||[];
    const allC=hist.length,cardC=hist.filter(x=>x.type==='card').length,skillC=hist.filter(x=>x.type==='skill').length,atkC=hist.filter(x=>x.type==='attack').length;
    if($('countAll'))$('countAll').textContent=String(allC);
    if($('countCard'))$('countCard').textContent=String(cardC);
    if($('countSkill'))$('countSkill').textContent=String(skillC);
    if($('countAttack'))$('countAttack').textContent=String(atkC);
    const tabP=$('tabPlayer'),tabC=$('tabCpu');
    if(tabP&&tabC){tabP.classList.toggle('active',isPlayer);tabP.setAttribute('aria-selected',isPlayer?'true':'false');tabC.classList.toggle('active',!isPlayer);tabC.setAttribute('aria-selected',!isPlayer?'true':'false');}
    document.querySelectorAll('.filter-chip').forEach(btn=>{btn.classList.toggle('active',btn.dataset.filter===activeHistoryFilter);});
    const items=activeHistoryFilter==='all'?hist:hist.filter(x=>x.type===activeHistoryFilter);
    list.replaceChildren();
    if(!items.length){
      const empty=document.createElement('div');empty.className='history-empty';
      empty.textContent=isPlayer?'Belum ada riwayat aksi untuk Kamu.':'Belum ada riwayat aksi untuk CPU.';
      list.append(empty);return;
    }
    items.forEach(item=>{
      const row=document.createElement('div');row.className='history-item history-type-'+item.type;
      const thumb=document.createElement('div');thumb.className='history-item-thumb';
      if(item.cardId&&game.cards[item.cardId]){
        const img=document.createElement('img');img.src='assets/cards/'+item.cardId+'.png';img.alt=item.title;img.loading='lazy';
        thumb.title='Lihat kartu: '+item.title;thumb.style.cursor='pointer';thumb.onclick=()=>showCardDetailsById(item.cardId);
        thumb.append(img);
      }else{
        const icon=document.createElement('span');icon.className='history-icon';
        icon.textContent=item.type==='attack'?'⚔️':item.type==='skill'?'⚡':'🃏';
        thumb.append(icon);
      }
      const body=document.createElement('div');body.className='history-item-body';
      const topRow=document.createElement('div');topRow.className='history-item-top';
      const title=document.createElement('strong');title.className='history-item-title';title.textContent=item.title;
      if(item.cardId&&game.cards[item.cardId]){title.style.cursor='pointer';title.title='Lihat kartu: '+item.title;title.onclick=()=>showCardDetailsById(item.cardId);}
      const meta=document.createElement('div');meta.className='history-item-meta';
      const badge=document.createElement('span');badge.className='history-badge badge-'+item.type;
      badge.textContent=item.type==='attack'?'Attack':item.type==='skill'?'Skill':(item.subtype||'Kartu');
      const turn=document.createElement('span');turn.className='history-turn-badge';turn.textContent='G'+item.turn;
      meta.append(badge,turn);topRow.append(title,meta);
      const desc=document.createElement('p');desc.className='history-item-desc';desc.textContent=item.detail;
      body.append(topRow,desc);row.append(thumb,body);list.append(row);
    });
  }

  function render(){
    renderField(game.bot,'opponent',false);renderField(game.me,'player',true);
    renderStadium();
    const hand=$('hand');hand.replaceChildren();
    game.me.hand.forEach(instance=>{
      const button=makeCard(instance,null,'hand');button.draggable=true;button.dataset.uid=String(instance.uid);
      button.ondragstart=e=>{draggedUid=instance.uid;e.dataTransfer.setData('text/plain',String(instance.uid));e.dataTransfer.effectAllowed='move';};
      button.ondragend=()=>{draggedUid=null;document.querySelectorAll('.drag-over').forEach(x=>x.classList.remove('drag-over'));};
      button.onpointerdown=e=>touchDown(e,instance.uid,button);
      button.onclick=()=>{if(Date.now()>suppressClickUntil)openHandMenu(instance.uid);};
      hand.append(button);
    });
    $('handCount').textContent='('+game.me.hand.length+')';
    $('turnStatus').textContent=game.over?(game.winner===game.me?'Kamu menang!':'Lawan menang!'):
      game.pendingPromotion===0?'Pilih Active baru':game.turn===0?'Giliranmu':'Giliran lawan';
    $('attackButton').disabled=game.turn!==0||!game.canAttack(game.me);
    $('retreatButton').disabled=game.turn!==0||!game.canRetreat(game.me);
    $('endButton').disabled=game.turn!==0||game.over||game.pendingPromotion!==null;
    const log=$('log');if(log){log.replaceChildren();game.log.forEach(item=>log.append(label(item,'')));}
    renderHistory();
    if(game.pendingPromotion===0&&!promotionOpen&&!game.over)promptPromotion();
    if(game.over&&$('modal').hidden)showGameOver();
  }
  function ask(title,text,options){
    return new Promise(resolve=>{
      $('dialogTitle').textContent=title;
      const textEl=$('dialogText');
      if(typeof text==='string'){
        textEl.textContent=text||'';
      }else if(text instanceof Node){
        textEl.replaceChildren(text);
      }
      const choices=$('dialogChoices');choices.replaceChildren();
      for(const option of options){
        const button=document.createElement('button');button.type='button';button.className='choice';
        button.textContent=option.label;button.disabled=!!option.disabled;
        button.onclick=()=>{close();resolve(option.value);};choices.append(button);
      }
      $('dialogCancel').onclick=()=>{close();resolve(null);};
      $('modal').hidden=false;
      function close(){$('modal').hidden=true;}
    });
  }
  function askMulti(title,text,items,minSelect=0,maxSelect=3,confirmVerb='Pilih'){
    return new Promise(resolve=>{
      $('dialogTitle').textContent=title;$('dialogText').textContent=text||'';
      const choices=$('dialogChoices');choices.replaceChildren();
      const selected=[];
      const counterDiv=document.createElement('div');counterDiv.className='multi-counter';
      counterDiv.style.cssText='width:100%;font-size:13px;font-weight:700;color:#f3db87;margin-bottom:8px;';
      const itemsGrid=document.createElement('div');
      itemsGrid.style.cssText='display:flex;flex-wrap:wrap;gap:8px;width:100%;max-height:48vh;overflow-y:auto;padding:2px;';
      const confirmBtn=document.createElement('button');confirmBtn.type='button';confirmBtn.className='choice';
      confirmBtn.style.cssText='width:100%;background:#235882;border:1px solid #7cb5ec;border-radius:9px;color:#fff;padding:10px 14px;font-weight:700;margin-top:10px;text-align:center;max-width:none;';
      function updateConfirm(){
        const reqText=minSelect===maxSelect?' (tepat '+minSelect+' kartu)':minSelect>0?' ('+minSelect+'-'+maxSelect+' kartu)':' (maks. '+maxSelect+' kartu)';
        counterDiv.textContent='Terpilih: '+selected.length+' / '+maxSelect+reqText;
        const isValid=selected.length>=minSelect&&selected.length<=maxSelect;
        confirmBtn.disabled=!isValid;
        if(selected.length===0&&minSelect===0)confirmBtn.textContent='Selesai Tanpa Memilih Kartu';
        else confirmBtn.textContent=confirmVerb+' '+selected.length+' Kartu Terpilih';
      }
      updateConfirm();
      choices.append(counterDiv);
      items.forEach(item=>{
        const btn=document.createElement('button');btn.type='button';btn.className='choice';btn.textContent=item.label;
        btn.onclick=()=>{
          const idx=selected.indexOf(item.value);
          if(idx>=0){
            selected.splice(idx,1);btn.style.background='';btn.style.borderColor='';btn.style.boxShadow='';btn.textContent=item.label;
          }else{
            if(selected.length>=maxSelect)return;
            selected.push(item.value);btn.style.background='#2563eb';btn.style.borderColor='#93c5fd';btn.style.boxShadow='0 0 0 2px #60a5fa';btn.textContent='✓ '+item.label;
          }
          updateConfirm();
        };
        itemsGrid.append(btn);
      });
      confirmBtn.onclick=()=>{close();resolve(selected);};
      choices.append(itemsGrid,confirmBtn);
      $('dialogCancel').onclick=()=>{close();resolve(null);};
      $('modal').hidden=false;
      function close(){$('modal').hidden=true;}
    });
  }
  function showOpponentCard(instance){
    const card=game.card(instance);
    const dom=buildCardDetailDOM(card,null,'Tangan CPU');
    ask(card.name+' (Tangan CPU)',dom,[{label:'Tutup',value:'close'}]);
  }
  async function apply(result){
    if(!result?.ok){
      const err=result?.error||'Aksi tidak tersedia.';
      game.print(err);
      render();
      await ask('Aksi Tidak Berhasil',err,[{label:'Mengerti',value:'ok'}]);
      return;
    }
    render();
    scheduleAI();
  }
  function scheduleAI(){
    if(aiQueued||game.over||game.pendingPromotion!==null||game.turn!==1)return;
    aiQueued=true;setTimeout(()=>{aiQueued=false;game.aiTurn();render();if(game.turn===1)scheduleAI();},430);
  }
  async function promptPromotion(){
    promotionOpen=true;
    const choice=await ask('Pilih Active baru','Pokémon Active-mu Knock Out. Pilih pengganti dari Bench.',
      game.me.bench.map((unit,index)=>({label:game.top(unit).name,value:index})));
    promotionOpen=false;
    if(choice===null){render();return;}
    apply(game.promote(game.me,choice));
  }
  async function showGameOver(){
    const choice=await ask('Pertandingan selesai',game.winner===game.me?'Kamu menang!':'Lawan menang!',
      [{label:'Main lagi',value:'restart'}]);
    if(choice==='restart'){game.newGame();render();}
  }
  async function openHandMenu(uid){
    if(!game.canAct())return;
    const instance=game.handCard(game.me,uid);if(!instance)return;
    const card=game.card(instance);
    const dom=buildCardDetailDOM(card);
    const choice=await ask(card.name,dom,[{label:'🃏 Mainkan kartu',value:'play'},{label:'Batal',value:'close'}]);
    if(choice==='play')await playFromHand(uid,null,null);
  }
  async function chooseTarget(title,refs){
    if(!refs.length)return null;
    return ask(title,'Pilih Pokémon target.',refs.map(({ref})=>({label:refName(game.me,ref),value:ref})));
  }
  async function playFromHand(uid,zone,ref){
    const instance=game.handCard(game.me,uid);if(!instance)return;
    const card=game.card(instance),type=PTCGEngine.cardType(card);
    if(type==='pokemon'){
      if(card.subtypes?.includes('Basic')){
        if(zone&&zone!=='bench')return apply(game.fail('Basic harus ditaruh di Bench.'));
        if(card.name==='Meowth ex'&&game.me.abilityFlags.lastDitch!==game.me.turns){
          const supporters=game.me.deck.filter(c=>PTCGEngine.cardType(game.card(c))==='supporter');
          if(supporters.length){
            const distinct=[...new Map(supporters.map(c=>[c.id,c])).values()];
            const selected=await ask('Last-Ditch Catch','Saat Meowth ex masuk Bench, pilih Supporter dari deck untuk langsung masuk tangan.',[
              ...distinct.map(c=>({label:game.name(c),value:c.uid})),{label:'Lewati Ability',value:'skip'}
            ]);
            if(selected===null)return;
            return apply(game.playBasic(uid,selected==='skip'?{skipAbility:true}:{supporterUid:selected}));
          }
        }
        return apply(game.playBasic(uid));
      }
      const refs=game.allRefs(game.me).filter(({unit})=>game.top(unit).name===card.evolvesFrom);
      if(zone==='pokemon')return evolveCard(uid,ref);
      const chosen=await chooseTarget('Evolusi '+card.name,refs);
      if(chosen!==null)return evolveCard(uid,chosen);
      return;
    }
    if(type==='energy'||type==='tool'){
      if(zone==='pokemon')return apply(type==='energy'?game.attachEnergy(uid,ref):game.attachTool(uid,ref));
      const chosen=await chooseTarget(type==='energy'?'Pasang Energy':'Pasang Pokémon Tool',game.allRefs(game.me));
      if(chosen!==null)return apply(type==='energy'?game.attachEnergy(uid,chosen):game.attachTool(uid,chosen));
      return;
    }
    if(type==='stadium'){
      if(zone&&zone!=='stadium'&&zone!=='trainer')return apply(game.fail('Taruh Stadium di area tengah.'));
      return playTrainer(uid);
    }
    if(['item','supporter'].includes(type)){
      if(zone&&zone!=='trainer')return apply(game.fail('Taruh Trainer di area Trainer.'));
      return playTrainer(uid);
    }
  }
  async function evolveCard(uid,ref){
    const c=game.handCard(game.me,uid);let opponentBenchIndex=null;
    if(game.card(c).name==='Hariyama'&&game.bot.bench.length){
      opponentBenchIndex=await ask('Heave-Ho Catcher','Pilih Pokémon lawan dari Bench untuk menjadi Active, atau lewati.',
        [...game.bot.bench.map((u,i)=>({label:game.top(u).name,value:i})),{label:'Lewati Ability',value:'skip'}]);
      if(opponentBenchIndex==='skip')opponentBenchIndex=null;
    }
    apply(game.evolve(uid,ref,opponentBenchIndex));
  }
  async function playTrainer(uid){
    const c=game.handCard(game.me,uid),card=game.card(c),options={};
    if(card.name==='Team Rocket\'s Transceiver'){
      const pool=game.me.deck.filter(x=>game.isTeamRocketSupporter(x));
      if(!pool.length){await ask(card.name,'Tidak ada Supporter Team Rocket di dek.',[{label:'OK',value:'ok'}]);return;}
      const choice=await ask(card.name,'Pilih Supporter Team Rocket dari dek.',pool.map(x=>({label:cardName(x),value:x.uid})));
      if(choice===null)return;options.chosen=[choice];
    }
    if(card.name==='Team Rocket\'s Proton'){
      const pool=game.me.deck.filter(x=>game.isBasic(x)&&game.name(x).includes("Team Rocket's"));
      if(!pool.length){await ask(card.name,'Tidak ada Pokémon Basic Team Rocket tersisa di dek.',[{label:'OK',value:'ok'}]);return;}
      const chosen=await askMulti(
        card.name,
        'Pilih hingga 3 Pokémon Basic Team Rocket dari dek untuk diambil ke tangan:',
        pool.map(x=>({label:cardName(x),value:x.uid})),
        0,
        3,
        'Ambil'
      );
      if(chosen===null)return;
      options.chosen=chosen;
    }
    if(card.name==='Team Rocket\'s Giovanni'){
      if(game.me.bench.length){const choice=await ask(card.name,'Pilih Pokémon Team Rocket di Bench untuk menjadi Active.',game.me.bench.map((u,i)=>({label:game.top(u).name,value:i})));if(choice===null)return;options.benchIndex=choice;}
      if(game.bot.bench.length){const opChoice=await ask(card.name,'Pilih Pokémon lawan di Bench untuk ditarik ke Active.',game.bot.bench.map((u,i)=>({label:game.top(u).name,value:i})));if(opChoice===null)return;options.opponentBenchIndex=opChoice;}
    }
    if(['Boss\'s Orders','Switch'].includes(card.name)){
      const bench=card.name==='Switch'?game.me.bench:game.bot.bench;
      if(bench.length){const choice=await ask(card.name,'Pilih Pokémon Bench yang menjadi Active.',bench.map((u,i)=>({label:game.top(u).name,value:i})));if(choice===null)return;options.benchIndex=choice;}
    }
    if(card.name==='Rare Candy'){
      const pairs=game.rareCandyOptions();if(pairs.length){const choice=await ask('Rare Candy','Pilih pasangan Basic dan Stage 2.',pairs.map((x,i)=>({label:game.top(game.unitAt(game.me,x.ref)).name+' → '+game.card(x.card).name,value:i})));if(choice===null)return;options.ref=pairs[choice].ref;options.evolutionUid=pairs[choice].card.uid;}
    }
    if(card.name==='Ultra Ball'||card.name==='Secret Box'){
      const amount=card.name==='Ultra Ball'?2:3;
      const pool=game.me.hand.filter(x=>x.uid!==uid);
      if(pool.length<amount)return apply(game.fail(card.name+' perlu membuang '+amount+' kartu lain.'));
      const chosen=await askMulti(
        card.name,
        'Pilih tepat '+amount+' kartu dari tangan untuk dibuang:',
        pool.map(x=>({label:cardName(x),value:x.uid})),
        amount,
        amount,
        'Buang'
      );
      if(chosen===null||chosen.length<amount)return;
      options.discard=chosen;
    }
    if(card.name==='Fighting Gong'||card.name==='Poké Pad'||card.name==='Mega Signal'||card.name==='Ultra Ball'||card.name==='Team Rocket\'s Petrel'){
      const predicate=card.name==='Fighting Gong'?x=>x.id==='sve-6'||(game.isBasic(x)&&game.card(x).types?.includes('Fighting')):
        card.name==='Poké Pad'?x=>PTCGEngine.cardType(game.card(x))==='pokemon'&&!game.card(x).rules?.some(r=>r.includes('ex Rule')):
        card.name==='Mega Signal'?x=>game.card(x).subtypes?.includes('MEGA'):
        card.name==='Ultra Ball'?x=>PTCGEngine.cardType(game.card(x))==='pokemon':x=>game.card(x).supertype==='Trainer';
      const pool=game.me.deck.filter(predicate);
      if(pool.length){const choice=await ask(card.name,'Pilih kartu dari dek.',pool.map(x=>({label:cardName(x),value:x.uid})));if(choice===null)return;options.chosen=[choice];}
    }
    if(card.name==='Night Stretcher'||card.name==='Energy Retrieval'){
      const pool=game.me.discard.filter(x=>card.name==='Energy Retrieval'?game.card(x).supertype==='Energy'&&game.card(x).subtypes?.includes('Basic'):PTCGEngine.cardType(game.card(x))==='pokemon'||(game.card(x).supertype==='Energy'&&game.card(x).subtypes?.includes('Basic')));
      if(pool.length){const choice=await ask(card.name,'Pilih kartu dari discard.',pool.map(x=>({label:cardName(x),value:x.uid})));if(choice===null)return;options.chosen=[choice];}
    }
    apply(game.playTrainer(uid,options));
  }
  async function openPokemonMenu(ref,isMine=true){
    if(game.over)return;
    const player=isMine?game.me:game.bot;
    const unit=game.unitAt(player,ref);if(!unit)return;
    const card=game.top(unit),ability=game.ability(unit);
    const posLabel=ref==='active'?'Active Spot':'Bench '+(Number(ref)+1);
    const ownerLabel=isMine?'Kamu':'CPU';

    // Construct Inspector DOM
    const inspector=document.createElement('div');inspector.className='unit-inspector';

    // Top badges bar
    const badgeBar=document.createElement('div');badgeBar.className='inspector-badge-bar';
    const ownerBadge=document.createElement('span');ownerBadge.className='inspector-badge badge-owner';
    ownerBadge.textContent=ownerLabel+' · '+posLabel;
    const hpBadge=document.createElement('span');hpBadge.className='inspector-badge badge-hp';
    hpBadge.textContent='HP '+game.remaining(unit)+' / '+game.hp(unit);
    const retreatBadge=document.createElement('span');retreatBadge.className='inspector-badge';
    retreatBadge.textContent='Retreat: '+game.retreatCost(unit)+' Energy';
    badgeBar.append(ownerBadge,hpBadge,retreatBadge);
    if(unit.poisoned){const b=document.createElement('span');b.className='inspector-badge badge-status';b.textContent='Poisoned';badgeBar.append(b);}
    if(unit.paralyzed){const b=document.createElement('span');b.className='inspector-badge badge-status';b.textContent='Paralyzed';badgeBar.append(b);}
    inspector.append(badgeBar);

    // Section 1: Pokémon & Attacks
    const secPkmn=document.createElement('div');secPkmn.className='inspector-section section-pokemon';
    const pkmnHead=document.createElement('div');pkmnHead.className='inspector-section-header';
    pkmnHead.innerHTML='<span class="inspector-section-title">🃏 Pokémon &amp; Kemampuan</span>';
    const pkmnBody=document.createElement('div');pkmnBody.className='inspector-section-body';

    // Thumbnail & Header Meta
    const thumbBox=document.createElement('div');
    thumbBox.style.cssText='display:flex;gap:12px;align-items:center;margin-bottom:10px;background:#101a26;padding:8px;border-radius:8px;border:1px solid #28415a;';
    const pkmnImg=document.createElement('img');
    pkmnImg.src='assets/cards/'+card.id+'.png';
    pkmnImg.alt=card.name;
    pkmnImg.style.cssText='width:56px;height:auto;border-radius:4px;border:1px solid #38bdf8;cursor:pointer;flex:none;';
    pkmnImg.title='Klik untuk melihat kartu ukuran penuh';
    pkmnImg.onerror=()=>{if(card.images?.large||card.images?.small)pkmnImg.src=card.images.large||card.images.small;};
    pkmnImg.onclick=()=>showCardDetailsById(card.id);
    const pkmnMeta=document.createElement('div');
    pkmnMeta.style.cssText='display:flex;flex-direction:column;gap:3px;font-size:12px;min-width:0;';
    pkmnMeta.innerHTML='<strong style="font-size:13px;color:#f8fafc;">'+card.name+'</strong>'+
      '<span style="color:#38bdf8;font-weight:700;">'+(card.types?.join('/')||'Colorless')+' · '+(card.subtypes?.join(' · ')||'Basic')+'</span>'+
      '<span style="color:#94a3b8;font-size:11px;">HP Asli: '+card.hp+' · Sisa: <b style="color:#4ade80;">'+game.remaining(unit)+' HP</b></span>';
    thumbBox.append(pkmnImg,pkmnMeta);
    pkmnBody.append(thumbBox);

    // Evolution Stack
    const evoTrail=document.createElement('div');evoTrail.className='evolution-stack';
    if(unit.stack.length>1){
      unit.stack.forEach((c,idx)=>{
        if(idx>0){const arrow=document.createElement('span');arrow.className='evo-arrow';arrow.textContent='➔';evoTrail.append(arrow);}
        const step=document.createElement('span');
        const isCurrent=idx===unit.stack.length-1;
        step.className='evo-step'+(isCurrent?' current':'');
        const cCard=game.card(c);
        step.textContent=cCard.name+' ('+(cCard.subtypes?.[0]||'')+')';
        evoTrail.append(step);
      });
    }else{
      const step=document.createElement('span');step.className='evo-step current';
      step.textContent=card.name+' ('+(card.subtypes?.join(', ')||'Basic')+') · Tipe: '+(card.types?.join('/')||'Colorless');
      evoTrail.append(step);
    }
    pkmnBody.append(evoTrail);

    // Ability (if present)
    if(ability){
      const aBox=document.createElement('div');aBox.className='inspector-card-box';
      const usage=game.abilityUsageType(ability.name);
      const usageTag=usage==='multi'?'Berulang kali':usage==='global_once'?'Global 1x / Turn':'1x / Turn (Kartu ini)';
      const canUse=isMine&&game.canAbility(player,ref);
      const aTitle=document.createElement('strong');
      aTitle.textContent='⚡ Ability: '+ability.name;
      const tagSpan=document.createElement('span');tagSpan.className='inspector-ability-meta';tagSpan.textContent=usageTag;
      aBox.append(aTitle,tagSpan);
      const aDesc=document.createElement('p');aDesc.textContent=ability.text;aBox.append(aDesc);
      if(isMine&&game.canAct()){
        const statusNote=document.createElement('small');
        statusNote.style.cssText='display:block;margin-top:4px;font-weight:600;color:'+(canUse?'#4ade80':'#94a3b8')+';';
        statusNote.textContent=canUse?'Status: Tersedia untuk digunakan':'Status: Belum tersedia / sudah terpakai giliran ini';
        aBox.append(statusNote);
      }
      pkmnBody.append(aBox);
    }

    // Attacks (if present)
    if(card.attacks?.length){
      const atkBox=document.createElement('div');atkBox.className='inspector-card-box';
      const atkHeader=document.createElement('strong');atkHeader.textContent='⚔️ Serangan (Attacks):';atkBox.append(atkHeader);
      card.attacks.forEach(a=>{
        const row=document.createElement('p');
        row.style.cssText='margin:4px 0;';
        row.innerHTML='<strong>'+a.name+'</strong> ['+(a.cost?.join('/')||'Free')+'] — '+(a.damage?a.damage+' DMG':'Efek')+(a.text?'<br><span style="color:#94a3b8;font-size:11px;">'+a.text+'</span>':'');
        atkBox.append(row);
      });
      pkmnBody.append(atkBox);
    }
    secPkmn.append(pkmnHead,pkmnBody);inspector.append(secPkmn);

    // Section 2: Attached Energy (Energi)
    const secEnergy=document.createElement('div');secEnergy.className='inspector-section section-energy';
    const energyHead=document.createElement('div');energyHead.className='inspector-section-header';
    energyHead.innerHTML='<span class="inspector-section-title">⚡ Kartu Energy Terpasang ('+unit.energy.length+')</span>';
    const energyBody=document.createElement('div');energyBody.className='inspector-section-body';
    if(!unit.energy.length){
      const empty=document.createElement('div');empty.className='inspector-empty';empty.textContent='Belum ada kartu Energy terpasang.';energyBody.append(empty);
    }else{
      const grid=document.createElement('div');grid.className='inspector-energy-grid';
      unit.energy.forEach(e=>{
        const pill=document.createElement('div');pill.className='inspector-energy-pill';
        const eCard=game.card(e);
        const eType=game.energyType(e);
        pill.title='Klik untuk melihat kartu '+eCard.name;
        pill.style.cursor='pointer';
        const eThumb=document.createElement('img');
        eThumb.className='energy-pill-thumb';
        eThumb.src='assets/cards/'+e.id+'.png';
        eThumb.alt=eCard.name;
        eThumb.onerror=()=>{if(eCard.images?.small||eCard.images?.large)eThumb.src=eCard.images.small||eCard.images.large;};
        const eSym=eType==='Grass'?'🌿':eType==='Fire'?'🔥':eType==='Water'?'💧':eType==='Lightning'?'⚡':eType==='Psychic'?'🔮':eType==='Fighting'?'🥊':eType==='Darkness'?'🌑':eType==='Metal'?'⚙️':eType==='Rocket'?'🚀':'⚡';
        const txt=document.createElement('span');txt.textContent=eSym+' '+eCard.name;
        pill.append(eThumb,txt);
        pill.onclick=()=>showCardDetailsById(e.id);
        grid.append(pill);
      });
      energyBody.append(grid);
    }
    secEnergy.append(energyHead,energyBody);inspector.append(secEnergy);

    // Section 3: Trainer / Pokémon Tool (Trainer)
    const secTool=document.createElement('div');secTool.className='inspector-section section-trainer';
    const toolHead=document.createElement('div');toolHead.className='inspector-section-header';
    toolHead.innerHTML='<span class="inspector-section-title">🎒 Kartu Trainer / Pokémon Tool</span>';
    const toolBody=document.createElement('div');toolBody.className='inspector-section-body';
    if(!unit.tool){
      const empty=document.createElement('div');empty.className='inspector-empty';empty.textContent='Tidak ada Pokémon Tool terpasang.';toolBody.append(empty);
    }else{
      const tCard=game.card(unit.tool);
      const tBox=document.createElement('div');tBox.className='inspector-card-box';
      const tName=document.createElement('strong');tName.textContent='🧰 '+tCard.name+' (Pokémon Tool)';
      const tDesc=document.createElement('p');tDesc.textContent=(tCard.rules||[]).join('\n')||'Alat Pokémon terpasang.';
      tBox.append(tName,tDesc);toolBody.append(tBox);
    }
    secTool.append(toolHead,toolBody);inspector.append(secTool);

    // Dialog Options / Actions
    const options=[];
    if(isMine&&game.canAct()){
      if(ability)options.push({label:'⚡ Gunakan Ability: '+ability.name,value:'ability',disabled:!game.canAbility(game.me,ref)});
      if(ref==='active'){
        const attackChoices=game.validMoves(game.me);
        for(const {attack,index} of attackChoices){
          options.push({label:'⚔️ Serang: '+attack.name+' ('+attack.cost.join('/')+') · '+attack.damage+' DMG',value:'attack:'+index,disabled:!game.canAttack(game.me)});
        }
        options.push({label:'🏃 Mundur ke Bench · '+game.retreatCost(unit)+' Energy',value:'retreat',disabled:!game.canRetreat(game.me)});
      }
    }
    options.push({label:'Tutup',value:'close'});

    const selected=await ask(card.name+' ('+ownerLabel+')',inspector,options);
    if(selected==='ability'){
      const options={};
      if(ability.name==='Reconstitute'){
        const pool=game.me.hand;
        if(pool.length<2)return apply(game.fail('Reconstitute perlu membuang 2 kartu dari tangan.'));
        const discards=await askMulti(
          'Reconstitute',
          'Pilih tepat 2 kartu dari tangan untuk dibuang:',
          pool.map(x=>({label:cardName(x),value:x.uid})),
          2,
          2,
          'Buang'
        );
        if(discards===null||discards.length<2)return;
        options.discardUids=discards;
      }else if(ability.name==='Excited Turbo'){
        const targets=game.me.bench.map((u,i)=>({u,i})).filter(x=>game.top(x.u).types?.includes('Fire'));
        const picked=await ask('Excited Turbo','Pilih Pokémon Fire di Bench untuk Energy.',
          targets.map(x=>({label:game.top(x.u).name,value:x.i})));
        if(picked===null)return;options.targetRef=picked;
      }
      apply(game.useAbility(ref,options));
    }else if(selected==='retreat')chooseRetreat();
    else if(selected?.startsWith('attack:'))performAttack(Number(selected.split(':')[1]));
  }
  async function openDiscardMenu(player,isMine=true){
    if(game.over)return;
    const ownerLabel=isMine?'Kamu':'CPU';
    const totalCount=player.discard.length;

    const inspector=document.createElement('div');
    inspector.className='trash-inspector';

    // Separate cards by category
    const pokemonList=player.discard.filter(c=>game.card(c).supertype==='Pokémon');
    const trainerList=player.discard.filter(c=>game.card(c).supertype==='Trainer');
    const energyList=player.discard.filter(c=>game.card(c).supertype==='Energy');

    // Summary bar
    const bar=document.createElement('div');bar.className='trash-summary-bar';
    const ownerBadge=document.createElement('span');ownerBadge.className='inspector-badge badge-owner';
    ownerBadge.textContent=ownerLabel+' · Tempat Buangan';
    const totalBadge=document.createElement('span');totalBadge.className='inspector-badge';
    totalBadge.textContent='Total: '+totalCount+' Kartu';
    const pkmnBadge=document.createElement('span');pkmnBadge.className='inspector-badge badge-hp';
    pkmnBadge.textContent='🃏 Pokémon: '+pokemonList.length;
    const trBadge=document.createElement('span');trBadge.className='inspector-badge';
    trBadge.style.cssText='background:#713f12;color:#fde047;border-color:#a16207;';
    trBadge.textContent='🎒 Trainer: '+trainerList.length;
    const enBadge=document.createElement('span');enBadge.className='inspector-badge';
    enBadge.style.cssText='background:#064e3b;color:#34d399;border-color:#059669;';
    enBadge.textContent='⚡ Energy: '+energyList.length;
    bar.append(ownerBadge,totalBadge,pkmnBadge,trBadge,enBadge);
    inspector.append(bar);

    if(!totalCount){
      const emptyAll=document.createElement('div');emptyAll.className='trash-empty';
      emptyAll.style.cssText='padding:22px 10px;text-align:center;font-size:13px;';
      emptyAll.textContent='Tempat buangan (trash) '+ownerLabel+' masih kosong. Belum ada kartu yang dibuang atau Knock Out.';
      inspector.append(emptyAll);
      await ask('Tempat Buangan (Trash) — '+ownerLabel,inspector,[{label:'Tutup',value:'close'}]);
      return;
    }

    // Helper to group identical cards
    function groupCards(list){
      const map=new Map();
      list.forEach(item=>{
        if(!map.has(item.id))map.set(item.id,{card:game.card(item),count:0,instances:[]});
        const g=map.get(item.id);
        g.count++;
        g.instances.push(item);
      });
      return [...map.values()];
    }

    // Helper to render a category section
    function renderCategory(title,list,cssClass,emptyMsg){
      const sec=document.createElement('div');sec.className='trash-section '+cssClass;
      const head=document.createElement('div');head.className='trash-section-header';
      const tSpan=document.createElement('span');tSpan.className='trash-section-title';
      tSpan.textContent=title;
      const cSpan=document.createElement('span');cSpan.className='trash-section-count';
      cSpan.textContent=list.length+' Kartu';
      head.append(tSpan,cSpan);
      sec.append(head);

      if(!list.length){
        const empty=document.createElement('div');empty.className='trash-empty';
        empty.textContent=emptyMsg;
        sec.append(empty);
      }else{
        const grid=document.createElement('div');grid.className='trash-cards-grid';
        const grouped=groupCards(list);
        grouped.forEach(({card,count,instances})=>{
          const item=document.createElement('div');item.className='trash-card-item';

          // Thumb
          const thumb=document.createElement('div');thumb.className='trash-card-thumb';
          thumb.title='Lihat detail kartu: '+card.name;
          const img=document.createElement('img');img.src='assets/cards/'+card.id+'.png';img.alt=card.name;
          thumb.append(img);
          if(count>1){
            const cnt=document.createElement('span');cnt.className='trash-card-count';
            cnt.textContent='x'+count;
            thumb.append(cnt);
          }
          thumb.onclick=()=>inspectCardFromTrash(card.id,player,isMine);

          // Info
          const info=document.createElement('div');info.className='trash-card-info';
          const topRow=document.createElement('div');topRow.className='trash-card-top';
          const nameSpan=document.createElement('span');nameSpan.className='trash-card-name';
          nameSpan.textContent=card.name;
          nameSpan.title='Lihat detail kartu: '+card.name;
          nameSpan.onclick=()=>inspectCardFromTrash(card.id,player,isMine);

          const typeBadge=document.createElement('span');typeBadge.className='trash-card-type';
          if(card.supertype==='Pokémon'){
            typeBadge.textContent=(card.subtypes?.[0]||'Pokémon')+(card.hp?' · '+card.hp+' HP':'');
          }else if(card.supertype==='Trainer'){
            typeBadge.textContent=card.subtypes?.join(' ')||'Trainer';
          }else{
            typeBadge.textContent=game.energyType(instances[0])+' Energy';
          }
          topRow.append(nameSpan,typeBadge);

          // Description preview
          const desc=document.createElement('p');desc.className='trash-card-desc';
          if(card.supertype==='Pokémon'){
            const parts=[];
            if(card.abilities?.length)parts.push('⚡ '+card.abilities[0].name);
            if(card.attacks?.length)parts.push('⚔️ '+card.attacks.map(a=>a.name+(a.damage?' '+a.damage:'')).join(', '));
            desc.textContent=parts.join(' · ')||(card.types?.join('/')+' Pokémon');
          }else if(card.supertype==='Trainer'){
            desc.textContent=(card.rules?.[0]||'Kartu Trainer').replace(/\s+/g,' ');
          }else{
            desc.textContent=card.id==='sv10-182'?'Menyediakan 2 Darkness/Psychic Energy untuk Pokémon Team Rocket':'Menyediakan 1 '+game.energyType(instances[0])+' Energy';
          }
          info.append(topRow,desc);
          item.append(thumb,info);
          grid.append(item);
        });
        sec.append(grid);
      }
      return sec;
    }

    // 1. Pokémon Section
    inspector.append(renderCategory('🃏 Kartu Pokémon ('+pokemonList.length+')',pokemonList,'section-pokemon','Tidak ada kartu Pokémon di tempat buangan.'));
    // 2. Trainer Section
    inspector.append(renderCategory('🎒 Kartu Trainer ('+trainerList.length+')',trainerList,'section-trainer','Tidak ada kartu Trainer di tempat buangan.'));
    // 3. Energy Section
    inspector.append(renderCategory('⚡ Kartu Energy ('+energyList.length+')',energyList,'section-energy','Tidak ada kartu Energy di tempat buangan.'));

    await ask('Tempat Buangan (Trash) — '+ownerLabel+' ('+totalCount+' Kartu)',inspector,[{label:'Tutup',value:'close'}]);
  }

  function inspectCardFromTrash(cardId,player,isMine){
    const card=game.cards[cardId];if(!card)return;
    const text=[
      ...(card.abilities||[]).map(a=>'Ability '+a.name+': '+a.text),
      ...(card.attacks||[]).map(a=>a.name+' ('+a.cost.join('/')+'): '+a.damage+' · '+a.text),
      ...(card.rules||[])
    ].join('\n');
    ask(card.name,text||'Detail kartu.',[
      {label:'← Kembali ke Trash',value:'back'},
      {label:'Tutup',value:'close'}
    ]).then(res=>{
      if(res==='back')openDiscardMenu(player,isMine);
    });
  }
  async function chooseRetreat(){
    if(!game.canRetreat(game.me))return apply(game.fail('Belum bisa mundur.'));
    const choice=await ask('Mundur','Pilih Pokémon Bench untuk menggantikan Active.',
      game.me.bench.map((u,i)=>({label:game.top(u).name,value:i})));
    if(choice!==null)apply(game.retreat(choice));
  }
  async function performAttack(index){
    const options={};
    const move=game.top(game.me.active).attacks[index];
    if(move?.name==='Inferno X'){
      const fire=game.allRefs(game.me).flatMap(({unit})=>unit.energy.filter(e=>game.energyType(e)==='Fire'));
      const choice=await ask('Inferno X','Berapa Fire Energy yang akan dibuang? Setiap kartu memberi 90 damage.',fire.map((_,i)=>({label:(i+1)+' Energy · '+((i+1)*90)+' damage',value:i+1})));
      if(choice===null)return;options.fireDiscards=fire.slice(0,choice).map(e=>e.uid);
    }
    if(move?.name==='Rocket Feathers'){
      const supporters=game.me.hand.filter(c=>game.isTeamRocketSupporter(c));
      if(supporters.length){
        const discards=await askMulti(
          'Rocket Feathers',
          'Pilih Supporter Team Rocket dari tangan untuk dibuang (+60 damage per kartu):',
          supporters.map(x=>({label:cardName(x),value:x.uid})),
          0,
          supporters.length,
          'Buang'
        );
        if(discards===null)return;
        options.supporterDiscards=discards;
      }
    }
    if(move?.name==='Deceit'){
      const supporters=game.me.deck.filter(c=>PTCGEngine.cardType(game.card(c))==='supporter');
      if(supporters.length){
        const pick=await ask('Deceit','Pilih Supporter dari dek untuk diambil ke tangan.',supporters.map(c=>({label:cardName(c),value:c.uid})));
        if(pick!==null)options.supporterUid=pick;
      }
    }
    if(move?.name==='Phantom Dive'&&game.bot.bench.length){
      const choice=await ask('Phantom Dive','Pilih Pokémon Bench lawan yang menerima 60 damage.',game.bot.bench.map((u,i)=>({label:game.top(u).name+' ('+game.remaining(u)+' HP)',value:i})));
      if(choice!==null)options.targetBenchIndex=choice;
    }
    if((move?.name==='Explosion Y'||move?.name==='Cruel Arrow')&&game.bot.bench.length){
      const choice=await ask(move.name,'Pilih target serangan.',[{label:game.top(game.bot.active).name+' · Active',value:'active'},...game.bot.bench.map((u,i)=>({label:game.top(u).name+' · Bench',value:i}))]);
      if(choice===null)return;if(choice!=='active')options.targetBenchIndex=choice;
    }
    if(move?.name==='Aura Jab'&&game.me.bench.length){options.energyTargets=[];for(let i=0;i<Math.min(3,game.me.discard.filter(x=>x.id==='sve-6').length);i++){const choice=await ask('Aura Jab','Pilih Bench untuk Fighting Energy '+(i+1)+'.',game.me.bench.map((u,j)=>({label:game.top(u).name,value:j})));if(choice===null)return;options.energyTargets.push(choice);}}
    apply(game.attack(index,options));
  }
  function handleDrop(uid,zone,ref){
    if(!Number.isFinite(uid))return;
    playFromHand(uid,zone,ref);
  }
  const board=document.querySelector('.game-board');
  board.addEventListener('dragover',event=>{
    const zone=event.target.closest('[data-drop]');if(!zone||!draggedUid)return;
    event.preventDefault();event.dataTransfer.dropEffect='move';zone.classList.add('drag-over');
  });
  board.addEventListener('dragleave',event=>{
    const zone=event.target.closest('[data-drop]');if(zone)zone.classList.remove('drag-over');
  });
  board.addEventListener('drop',event=>{
    const zone=event.target.closest('[data-drop]');if(!zone)return;
    event.preventDefault();zone.classList.remove('drag-over');
    const uid=Number(event.dataTransfer.getData('text/plain')||draggedUid);
    handleDrop(uid,zone.dataset.drop,zone.dataset.ref==='active'?'active':Number(zone.dataset.ref));
    draggedUid=null;
  });
  function touchDown(event,uid,button){
    if(event.pointerType!=='touch')return;
    touchStart={uid,x:event.clientX,y:event.clientY,button,dragging:false};
    button.setPointerCapture(event.pointerId);
  }
  document.addEventListener('pointermove',event=>{
    if(!touchStart)return;
    const distance=Math.hypot(event.clientX-touchStart.x,event.clientY-touchStart.y);
    if(distance>10&&!touchStart.dragging){
      touchStart.dragging=true;dragGhost=touchStart.button.querySelector('img').cloneNode();
      dragGhost.className='drag-ghost';document.body.append(dragGhost);
    }
    if(dragGhost){dragGhost.style.left=event.clientX+'px';dragGhost.style.top=event.clientY+'px';}
  });
  document.addEventListener('pointerup',event=>{
    if(!touchStart)return;
    const state=touchStart;touchStart=null;
    if(dragGhost){dragGhost.remove();dragGhost=null;}
    if(!state.dragging)return;
    suppressClickUntil=Date.now()+500;
    const zone=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-drop]');
    if(zone)handleDrop(state.uid,zone.dataset.drop,zone.dataset.ref==='active'?'active':Number(zone.dataset.ref));
  });
  $('newGame').onclick=()=>{game.newGame();render();updateTopbarTitles();};
  $('attackButton').onclick=()=>openPokemonMenu('active');
  $('retreatButton').onclick=chooseRetreat;
  $('endButton').onclick=()=>{if(game.turn===0&&!game.over){game.endTurn();render();scheduleAI();}};
  const tabP=$('tabPlayer'),tabC=$('tabCpu');
  if(tabP)tabP.onclick=()=>{activePlayerTab='player';renderHistory();};
  if(tabC)tabC.onclick=()=>{activePlayerTab='cpu';renderHistory();};
  document.querySelectorAll('.filter-chip').forEach(btn=>{
    btn.onclick=()=>{activeHistoryFilter=btn.dataset.filter||'all';renderHistory();};
  });

  function updateTopbarTitles(){
    const info = PTCGEngine.DECK_INFO || {};
    const pInfo = info[game.roles[0]] || {name: game.roles[0], icon: '🃏'};
    const cInfo = info[game.roles[1]] || {name: game.roles[1], icon: '🃏'};
    const matchupSpan = $('matchupSpan');
    if(matchupSpan) matchupSpan.textContent = pInfo.name + ' vs ' + cInfo.name;
    const subtitle = $('deckSubtitle');
    if(subtitle) subtitle.textContent = 'Kamu: ' + pInfo.name + ' · CPU: ' + cInfo.name;
    document.title = 'Pokémon TCG — ' + pInfo.name + ' vs ' + cInfo.name;

    const pQuick = $('playerQuickSelect');
    if(pQuick && pQuick.value !== game.roles[0]) pQuick.value = game.roles[0];
    const cQuick = $('cpuQuickSelect');
    if(cQuick && cQuick.value !== game.roles[1]) cQuick.value = game.roles[1];
    if(window.TrafficPresence){
      window.TrafficPresence.setAction('Bermain: ' + pInfo.name + ' vs ' + cInfo.name);
    }
  }

  function initQuickMatchupBar(){
    const info = PTCGEngine.DECK_INFO || {};
    const deckKeys = Object.keys(PTCGEngine.DECKS || {});
    const pQuick = $('playerQuickSelect');
    const cQuick = $('cpuQuickSelect');

    if(pQuick){
      pQuick.replaceChildren();
      for(const key of deckKeys){
        const opt = document.createElement('option');
        opt.value = key;
        const d = info[key];
        opt.textContent = (d?.icon || '🃏') + ' ' + (d?.name || key);
        if(key === game.roles[0]) opt.selected = true;
        pQuick.append(opt);
      }
    }

    if(cQuick){
      cQuick.replaceChildren();
      for(const key of deckKeys){
        const opt = document.createElement('option');
        opt.value = key;
        const d = info[key];
        opt.textContent = (d?.icon || '🤖') + ' ' + (d?.name || key);
        if(key === game.roles[1]) opt.selected = true;
        cQuick.append(opt);
      }
    }

    const applyBtn = $('applyQuickMatchupBtn');
    if(applyBtn){
      applyBtn.onclick = () => {
        const pVal = pQuick?.value || game.roles[0];
        const cVal = cQuick?.value || game.roles[1];
        try {
          localStorage.setItem('ptcg_player_deck', pVal);
          localStorage.setItem('ptcg_cpu_deck', cVal);
        } catch (_) {}
        game.newGame([pVal, cVal]);
        updateTopbarTitles();
        render();
      };
    }
  }

  let modalPlayerDeck = pDeck;
  let modalCpuDeck = cDeck;
  let activeModalTab = 'player';

  function setModalTab(tab){
    activeModalTab = tab;
    const tabP = $('tabModalPlayer');
    const tabC = $('tabModalCpu');
    if(tabP){
      tabP.classList.toggle('active', tab === 'player');
      tabP.setAttribute('aria-selected', tab === 'player' ? 'true' : 'false');
    }
    if(tabC){
      tabC.classList.toggle('active', tab === 'cpu');
      tabC.setAttribute('aria-selected', tab === 'cpu' ? 'true' : 'false');
    }
    const container = $('deckColumnsContainer');
    if(container){
      container.className = 'deck-columns-container ' + (tab === 'cpu' ? 'show-cpu' : 'show-player');
      if(window.innerWidth > 768){
        const targetCol = tab === 'cpu' ? $('colCpu') : $('colPlayer');
        if(targetCol) targetCol.scrollIntoView({behavior: 'smooth', block: 'nearest'});
      }
    }
  }

  function updateMatchupSummary(){
    const info = PTCGEngine.DECK_INFO || {};
    const pD = info[modalPlayerDeck] || {name: modalPlayerDeck, icon: '🧑'};
    const cD = info[modalCpuDeck] || {name: modalCpuDeck, icon: '🤖'};

    const pBadge = $('playerDeckBadge');
    if(pBadge) pBadge.textContent = (pD.icon || '🃏') + ' ' + pD.name;
    const cBadge = $('cpuDeckBadge');
    if(cBadge) cBadge.textContent = (cD.icon || '🤖') + ' ' + cD.name;

    const pTabChosen = $('tabModalPlayerChosen');
    if(pTabChosen) pTabChosen.textContent = (pD.icon || '') + ' ' + pD.name;
    const cTabChosen = $('tabModalCpuChosen');
    if(cTabChosen) cTabChosen.textContent = (cD.icon || '') + ' ' + cD.name;

    const summary = $('matchupSummaryText');
    if(summary) summary.textContent = (pD.icon || '🧑') + ' ' + pD.name + '  VS  ' + (cD.icon || '🤖') + ' ' + cD.name;
  }

  function setModalPlayerDeck(key){
    modalPlayerDeck = key;
    const list = $('playerDeckOptions');
    if(list){
      list.querySelectorAll('.deck-card-option').forEach(el => {
        const isMatch = el.dataset.deckKey === key;
        el.classList.toggle('selected', isMatch);
        el.setAttribute('aria-checked', isMatch ? 'true' : 'false');
      });
    }
    updateMatchupSummary();
  }

  function setModalCpuDeck(key){
    modalCpuDeck = key;
    const list = $('cpuDeckOptions');
    if(list){
      list.querySelectorAll('.deck-card-option').forEach(el => {
        const isMatch = el.dataset.deckKey === key;
        el.classList.toggle('selected', isMatch);
        el.setAttribute('aria-checked', isMatch ? 'true' : 'false');
      });
    }
    updateMatchupSummary();
  }

  function buildDeckPickerList(containerId, activeDeckKey, onSelect){
    const container = $(containerId);
    if(!container) return;
    container.replaceChildren();
    const info = PTCGEngine.DECK_INFO || {};
    const deckKeys = Object.keys(PTCGEngine.DECKS || {});
    for(const key of deckKeys){
      const deck = info[key] || {name: key, types: [], icon: '🃏', description: ''};
      const opt = document.createElement('div');
      opt.className = 'deck-card-option' + (key === activeDeckKey ? ' selected' : '');
      opt.dataset.deckKey = key;
      opt.tabIndex = 0;
      opt.role = 'radio';
      opt.setAttribute('aria-checked', key === activeDeckKey ? 'true' : 'false');

      const mainRow = document.createElement('div');
      mainRow.className = 'deck-option-main';

      const thumb = document.createElement('img');
      thumb.className = 'deck-thumb';
      thumb.src = 'assets/cards/' + (deck.preferredActive || 'me2pt5-126') + '.png';
      thumb.alt = deck.name;
      thumb.loading = 'lazy';

      const meta = document.createElement('div');
      meta.className = 'deck-card-meta';

      const title = document.createElement('div');
      title.className = 'deck-card-name';
      title.innerHTML = '<span>' + (deck.icon || '🃏') + '</span> <span>' + deck.name + '</span>';

      const types = document.createElement('div');
      types.className = 'deck-card-types';
      types.textContent = (deck.types || []).join(' · ');

      const desc = document.createElement('div');
      desc.className = 'deck-card-desc';
      desc.textContent = deck.description || '';

      meta.append(title, types, desc);

      const expandBtn = document.createElement('button');
      expandBtn.type = 'button';
      expandBtn.className = 'deck-expand-btn';
      expandBtn.innerHTML = '👁️ <span>Lihat Kartu</span>';
      expandBtn.title = 'Buka daftar 60 kartu fisik ' + deck.name;

      mainRow.append(thumb, meta, expandBtn);

      // Card list drawer
      const drawer = document.createElement('div');
      drawer.className = 'deck-cardlist-drawer';
      drawer.hidden = true;

      // Group cards for this deck
      const deckCards = PTCGEngine.DECKS[key] || {};
      const pkmnList = [], trainerList = [], energyList = [];
      for(const [cId, qty] of Object.entries(deckCards)){
        const cardObj = game.cards[cId];
        if(!cardObj) continue;
        const itemData = { id: cId, card: cardObj, qty };
        if(cardObj.supertype === 'Pokémon') pkmnList.push(itemData);
        else if(cardObj.supertype === 'Energy') energyList.push(itemData);
        else trainerList.push(itemData);
      }

      function renderDrawerCategory(catTitle, list){
        if(!list.length) return null;
        const sec = document.createElement('div');
        sec.className = 'drawer-section';
        const titleEl = document.createElement('div');
        titleEl.className = 'drawer-section-title';
        const total = list.reduce((a, b) => a + b.qty, 0);
        titleEl.textContent = catTitle + ' (' + total + ')';
        const grid = document.createElement('div');
        grid.className = 'drawer-cards-grid';

        list.forEach(({id, card, qty}) => {
          const itemEl = document.createElement('div');
          itemEl.className = 'drawer-card-item';
          itemEl.title = card.name + ' (' + qty + 'x) — Klik untuk melihat detail & skill!';

          const cardImg = document.createElement('img');
          cardImg.className = 'drawer-card-img';
          cardImg.src = 'assets/cards/' + id + '.png';
          cardImg.alt = card.name;
          cardImg.loading = 'lazy';
          cardImg.onerror = () => {
            if (card.images?.small || card.images?.large) cardImg.src = card.images.small || card.images.large;
          };

          const qtyBadge = document.createElement('span');
          qtyBadge.className = 'drawer-card-qty';
          qtyBadge.textContent = qty + 'x';

          const nameEl = document.createElement('span');
          nameEl.className = 'drawer-card-name';
          nameEl.textContent = card.name;

          itemEl.append(cardImg, qtyBadge, nameEl);
          itemEl.onclick = e => {
            e.stopPropagation();
            showCardDetailsById(id);
          };
          grid.append(itemEl);
        });

        sec.append(titleEl, grid);
        return sec;
      }

      const pSec = renderDrawerCategory('🃏 Pokémon', pkmnList);
      if(pSec) drawer.append(pSec);
      const tSec = renderDrawerCategory('🎒 Trainer', trainerList);
      if(tSec) drawer.append(tSec);
      const eSec = renderDrawerCategory('⚡ Energy', energyList);
      if(eSec) drawer.append(eSec);

        expandBtn.onclick = e => {
        e.stopPropagation();
        const isHidden = drawer.hidden;
        drawer.hidden = !isHidden;
        expandBtn.classList.toggle('expanded', isHidden);
        expandBtn.innerHTML = isHidden ? '▲ <span>Tutup</span>' : '👁️ <span>Lihat Kartu</span>';
        if(window.TrafficPresence && isHidden){
          window.TrafficPresence.setAction('Melihat Kartu: ' + (deck.name || key));
        }
      };

      opt.append(mainRow, drawer);

      opt.onclick = () => onSelect(key);
      opt.onkeydown = e => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(key); } };
      container.append(opt);
    }
  }

  function setupDeckModal(){
    buildDeckPickerList('playerDeckOptions', modalPlayerDeck, key => {
      setModalPlayerDeck(key);
    });
    buildDeckPickerList('cpuDeckOptions', modalCpuDeck, key => {
      setModalCpuDeck(key);
    });

    const tabP = $('tabModalPlayer');
    if(tabP) tabP.onclick = () => setModalTab('player');
    const tabC = $('tabModalCpu');
    if(tabC) tabC.onclick = () => setModalTab('cpu');

    const randBtn = $('randomDecksBtn');
    if(randBtn){
      randBtn.onclick = () => {
        const keys = Object.keys(PTCGEngine.DECKS || {});
        const pR = keys[Math.floor(Math.random() * keys.length)];
        const cR = keys[Math.floor(Math.random() * keys.length)];
        setModalPlayerDeck(pR);
        setModalCpuDeck(cR);
      };
    }

    const confirmBtn = $('confirmDecksBtn');
    if(confirmBtn){
      confirmBtn.onclick = () => {
        try {
          localStorage.setItem('ptcg_player_deck', modalPlayerDeck);
          localStorage.setItem('ptcg_cpu_deck', modalCpuDeck);
        } catch (_) {}
        game.newGame([modalPlayerDeck, modalCpuDeck]);
        updateTopbarTitles();
        render();
        const modal = $('deckModal');
        if(modal) modal.hidden = true;
        if(window.TrafficPresence){
          const pName = PTCGEngine.DECK_INFO[modalPlayerDeck]?.name || modalPlayerDeck;
          const cName = PTCGEngine.DECK_INFO[modalCpuDeck]?.name || modalCpuDeck;
          window.TrafficPresence.setAction('Bertarung: ' + pName + ' vs ' + cName);
        }
      };
    }

    const deckClose = $('deckModalClose');
    if(deckClose) deckClose.onclick = () => { const m = $('deckModal'); if(m) m.hidden = true; };
  }

  function openDeckSelectorModal(){
    modalPlayerDeck = game.roles[0];
    modalCpuDeck = game.roles[1];
    setModalPlayerDeck(modalPlayerDeck);
    setModalCpuDeck(modalCpuDeck);
    setModalTab('player');
    const modal = $('deckModal');
    if(modal) modal.hidden = false;
    if(window.TrafficPresence) window.TrafficPresence.setAction('Memilih Matchup Deck');
  }

  function setupTrafficModal(){
    const trafficBtn = $('trafficBtn');
    const modal = $('trafficModal');
    const closeBtn = $('trafficModalClose');
    const logoutBtn = $('trafficLogoutBtn');
    const tabLive = $('tabTrafficLive');
    const tabGh = $('tabTrafficGithub');
    const contentLive = $('trafficContentLive');
    const contentGh = $('trafficContentGithub');
    const nickInput = $('trafficNicknameInput');
    const saveNickBtn = $('saveNicknameBtn');
    const refreshBtn = $('refreshTrafficBtn');

    // Auth modal elements
    const authModal = $('trafficAuthModal');
    const authForm = $('trafficAuthForm');
    const authUser = $('trafficAuthUser');
    const authPass = $('trafficAuthPass');
    const authError = $('trafficAuthError');
    const authCancel = $('trafficAuthCancel');

    function isAuthenticated(){
      return sessionStorage.getItem('tcg_traffic_auth') === 'true';
    }

    function showTrafficDialog(){
      if(!modal) return;
      modal.hidden = false;
      if(window.TrafficPresence){
        if(nickInput) nickInput.value = window.TrafficPresence.myNickname || '';
        window.TrafficPresence._updateUI();
        window.TrafficPresence._sendHeartbeat();
      }
    }

    function showAuthDialog(){
      if(!authModal) return;
      if(authError) authError.hidden = true;
      if(authPass) authPass.value = '';
      authModal.hidden = false;
      setTimeout(() => {
        if(authUser && !authUser.value) authUser.focus();
        else if(authPass) authPass.focus();
      }, 50);
    }

    function handleTrafficBtnClick(){
      if(isAuthenticated()){
        showTrafficDialog();
      } else {
        showAuthDialog();
      }
    }

    function handleAuthSubmit(){
      const u = (authUser?.value || '').trim();
      const p = authPass?.value || '';
      if(u === 'kaito' && p === 'k@it01412kudo'){
        sessionStorage.setItem('tcg_traffic_auth', 'true');
        if(authModal) authModal.hidden = true;
        if(authError) authError.hidden = true;
        if(authPass) authPass.value = '';
        showTrafficDialog();
      } else {
        if(authError){
          authError.textContent = '❌ Username atau password salah. Akses ditolak!';
          authError.hidden = false;
        }
        if(authPass){
          authPass.value = '';
          authPass.focus();
        }
      }
    }

    if(trafficBtn) trafficBtn.onclick = handleTrafficBtnClick;
    if(authForm) authForm.onsubmit = (e) => { e.preventDefault(); handleAuthSubmit(); };
    if(authCancel) authCancel.onclick = () => { if(authModal) authModal.hidden = true; };
    if(authModal) authModal.onclick = (e) => { if(e.target === authModal) authModal.hidden = true; };

    if(logoutBtn){
      logoutBtn.onclick = () => {
        sessionStorage.removeItem('tcg_traffic_auth');
        if(modal) modal.hidden = true;
      };
    }

    function closeModal(){
      if(modal) modal.hidden = true;
    }

    if(closeBtn) closeBtn.onclick = closeModal;

    if(modal){
      modal.onclick = (e) => {
        if(e.target === modal) closeModal();
      };
    }

    if(tabLive && tabGh){
      tabLive.onclick = () => {
        tabLive.classList.add('active');
        tabLive.setAttribute('aria-selected', 'true');
        tabGh.classList.remove('active');
        tabGh.setAttribute('aria-selected', 'false');
        if(contentLive) contentLive.style.display = 'block';
        if(contentGh) contentGh.style.display = 'none';
      };
      tabGh.onclick = () => {
        tabGh.classList.add('active');
        tabGh.setAttribute('aria-selected', 'true');
        tabLive.classList.remove('active');
        tabLive.setAttribute('aria-selected', 'false');
        if(contentLive) contentLive.style.display = 'none';
        if(contentGh) contentGh.style.display = 'block';
      };
    }

    function handleSaveNick(){
      if(!nickInput || !window.TrafficPresence) return;
      const val = nickInput.value.trim();
      if(val){
        window.TrafficPresence.setNickname(val);
        if(saveNickBtn){
          const orig = saveNickBtn.innerHTML;
          saveNickBtn.innerHTML = '✅ Tersimpan!';
          saveNickBtn.disabled = true;
          setTimeout(() => {
            saveNickBtn.innerHTML = orig;
            saveNickBtn.disabled = false;
          }, 1200);
        }
      }
    }

    if(saveNickBtn) saveNickBtn.onclick = handleSaveNick;
    if(nickInput){
      nickInput.onkeydown = (e) => {
        if(e.key === 'Enter') handleSaveNick();
      };
    }

    if(refreshBtn){
      refreshBtn.onclick = () => {
        if(window.TrafficPresence){
          window.TrafficPresence._sendHeartbeat();
          refreshBtn.style.transform = 'rotate(360deg)';
          refreshBtn.style.transition = 'transform 0.5s ease';
          setTimeout(() => {
            refreshBtn.style.transform = 'none';
            refreshBtn.style.transition = 'none';
          }, 500);
        }
      };
    }
  }

  const deckBtn = $('deckSelectBtn');
  if(deckBtn) deckBtn.onclick = openDeckSelectorModal;

  initQuickMatchupBar();
  setupDeckModal();
  setupTrafficModal();
  updateTopbarTitles();
  render();
})();


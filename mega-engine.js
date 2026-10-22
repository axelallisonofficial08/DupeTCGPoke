(function (root, factory) {
  const exported=factory();
  if(typeof module==='object'&&module.exports)module.exports=exported;
  root.PTCGEngine=exported;
})(typeof window!=='undefined'?window:globalThis,function(){
  const DECKS={
    rocket:{
      'me2pt5-126':4,'me2pt5-127':4,'sv10-153':3,'sv10-154':2,'sv10-155':3,
      'sv10-87':1,'sv10-178':4,'sv10-177':4,'sv10-176':3,'sv10-171':4,
      'sv10-174':2,'sv10-170':2,'sv10-173':2,'me1-125':3,'me1-131':3,
      'me2pt5-196':2,'zsv10pt5-79':2,'sv10-182':4,'sve-7':8
    },
    dragapult:{
      'me2pt5-158':4,'me2pt5-159':4,'me2pt5-160':3,'sv6pt5-38':1,'me3-62':1,
      'me2-18':1,'me1-119':4,'me1-114':2,'me3-76':2,'me1-125':4,
      'me1-131':4,'me2pt5-198':4,'me2pt5-196':2,'me1-130':3,'zsv10pt5-79':2,
      'me2-85':2,'sv8-185':1,'me4-108':2,'sve-2':7,'sve-5':7
    },
    lucario:{
      'me2pt5-113':3,'me2pt5-112':3,'me2pt5-105':2,'me2pt5-106':2,'me1-73':2,'me1-72':2,
      'me1-119':4,'me1-114':2,'sv9-146':2,'me3-76':2,'sv9-143':1,'sv8-177':1,
      'me1-116':4,'me2pt5-198':4,'me1-124':4,'me1-131':4,'me2pt5-196':2,
      'zsv10pt5-79':1,'sv6-163':1,'me1-130':1,'sve-6':10,'me3-87':3
    },
    charizard:{
      'me2-13':3,'me2pt5-22':1,'me2-12':2,'me2-11':4,'me2-18':2,'me2-17':1,
      'sv6pt5-38':1,'me3-62':1,'me1-119':4,'me1-114':2,'me2-89':2,
      'sv10-176':2,'me2-87':1,'me3-76':1,'sv6-155':1,'me2-85':2,
      'me1-125':4,'me1-131':4,'me4-108':2,'me2pt5-196':2,'me2pt5-198':2,
      'me3-108':1,'me1-121':1,'sv8-185':1,'zsv10pt5-79':2,'sve-2':11
    },
    ragingbolt:{
      'sv5-123':4,'sv6-25':4,'sv6pt5-38':1,'me3-62':1,
      'me1-131':4,'me2pt5-198':4,'me4-108':4,'me2pt5-196':2,'me1-130':2,
      'zsv10pt5-79':2,'sv8-185':1,'me1-119':4,'me1-114':3,'me3-76':2,
      'sve-1':8,'sve-4':6,'sve-6':8
    },
    terapagos:{
      'sv7-128':3,'sv7-114':4,'sv7-115':4,'sv7-119':2,'sv6pt5-38':1,'me3-62':1,
      'me1-131':4,'me2pt5-198':4,'me1-114':4,'me1-119':4,'me1-130':3,
      'me2pt5-196':2,'zsv10pt5-79':2,'sv8-185':1,'me3-76':3,'me4-108':2,
      'me3-108':2,'sve-4':14
    },
    archaludon:{
      'sv8-129':4,'sv8-130':4,'sv6pt5-38':1,'me3-62':1,
      'me1-131':4,'me2pt5-198':4,'me1-114':4,'me1-119':4,'me1-130':3,
      'me2pt5-196':2,'zsv10pt5-79':2,'sv8-185':1,'me3-76':3,'me4-108':2,
      'me1-125':4,'sve-8':17
    },
    zoroark:{
      'sv9-97':4,'sv9-98':4,'sv9-116':2,'sv6pt5-38':1,'me3-62':1,
      'me1-131':4,'me2pt5-198':4,'me2pt5-196':2,'me1-130':3,
      'zsv10pt5-79':2,'sv8-185':1,'sv9-152':2,'me1-119':4,'me1-114':4,'me3-76':3,
      'me4-108':2,
      'sve-7':17
    },
    grimmsnarl:{
      'sv10-134':4,'sv10-135':3,'sv10-136':3,'sv10-137':2,'sv6pt5-38':1,'me3-62':1,
      'me1-131':4,'me2pt5-198':4,'me1-114':4,'me1-119':4,'me1-130':3,
      'me2pt5-196':2,'zsv10pt5-79':2,'sv8-185':1,'me3-76':3,'me4-108':2,
      'sve-7':17
    },
    exeggutor:{
      'sv8-1':4,'30c-2':3,'me1-8':2,'me1-9':1,'me1-10':2,'sv6-25':3,'sv6pt5-38':1,
      'me1-125':2,'me1-131':4,'me2pt5-198':3,'me1-119':4,'me1-114':3,'me3-76':2,'me1-130':2,
      'me4-108':2,'me2pt5-196':2,'sv5-152':1,'zsv10pt5-79':2,'sve-1':17
    }
  };

  const DECK_INFO={
    dragapult:{
      id:'dragapult',
      name:'Dragapult ex',
      types:['Dragon','Psychic'],
      icon:'🐲',
      preferredActive:'me2pt5-158',
      description:'Phantom Dive memberi 200 damage Active + 60 damage Bench dengan mesin Recon Directive.'
    },
    charizard:{
      id:'charizard',
      name:'Mega Charizard X ex',
      types:['Fire','Darkness'],
      icon:'🔥',
      preferredActive:'me2-11',
      description:'Inferno X sweeper dahsyat bertenaga api dan akselerasi Oricorio ex Excited Turbo.'
    },
    lucario:{
      id:'lucario',
      name:'Mega Lucario ex',
      types:['Fighting'],
      icon:'🥊',
      preferredActive:'me2pt5-112',
      description:'Aura Jab akselerasi Fighting Energy cepat dari discard untuk meluncurkan Mega Brave 270 damage.'
    },
    rocket:{
      id:'rocket',
      name:"Team Rocket's Honchkrow",
      types:['Darkness','Colorless'],
      icon:'🦹',
      preferredActive:'me2pt5-126',
      description:'Serangan Rocket Feathers dan R Command didukung draw konsisten Porygon-Z Reconstitute.'
    },
    ragingbolt:{
      id:'ragingbolt',
      name:'Raging Bolt ex',
      types:['Dragon','Grass','Lightning'],
      icon:'⚡',
      preferredActive:'sv5-123',
      description:'Bellowing Thunder menghabisi lawan dengan 70x per Basic Energy yang dibuang via Teal Mask Ogerpon.'
    },
    terapagos:{
      id:'terapagos',
      name:'Terapagos ex / Noctowl',
      types:['Colorless'],
      icon:'🐢',
      preferredActive:'sv7-128',
      description:'Unified Beatdown 30x per benched Pokémon, disokong mesin pencari Trainer Jewel Seeker Noctowl & Curling Wall Bouffalant.'
    },
    archaludon:{
      id:'archaludon',
      name:'Archaludon ex',
      types:['Metal'],
      icon:'🌉',
      preferredActive:'sv8-129',
      description:'Metal Defender mengakselerasi Metal Energy dari discard saat evolusi untuk meluncurkan Iron Blaster 220 damage.'
    },
    zoroark:{
      id:'zoroark',
      name:"N's Zoroark ex",
      types:['Darkness','Dragon'],
      icon:'🦊',
      preferredActive:'sv9-97',
      description:'Trade membuang 1 kartu untuk draw 2 kartu, Night Joker menyalin serangan N\'s Reshiram (Virtuous Flame 170 damage).'
    },
    grimmsnarl:{
      id:'grimmsnarl',
      name:"Marnie's Grimmsnarl ex",
      types:['Darkness'],
      icon:'👹',
      preferredActive:'sv10-134',
      description:'Punk Up mengisi hingga 5 Darkness Energy ke Pokémon Marnie saat evolusi, disusul Shadow Bullet 180 damage + 30 ke bench lawan.'
    },
    exeggutor:{
      id:'exeggutor',
      name:'Alolan Exeggutor / Meganium',
      types:['Grass'],
      icon:'🌴',
      preferredActive:'30c-2',
      description:'Wild Growth Meganium mendobel setiap Basic Grass Energy menjadi 2 Grass, memicu Scale Up Alolan Exeggutor (+250 HP, total 400 HP / 500 HP Hero\'s Cape) dan melipatgandakan Myriad Leaf Shower Ogerpon ex!'
    }
  };

  const ALLOWED=new Set(['H','I','J']);
  let serial=0;
  const shuffle=(array,random)=>{for(let i=array.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[array[i],array[j]]=[array[j],array[i]];}return array;};
  const typeOf=c=>c.supertype==='Pokémon'?'pokemon':c.supertype==='Energy'?'energy':c.subtypes?.includes('Pokémon Tool')?'tool':c.subtypes?.includes('Supporter')?'supporter':c.subtypes?.includes('Stadium')?'stadium':'item';
  const basicEnergy=c=>c.supertype==='Energy'&&c.subtypes?.includes('Basic');
  const ruleBox=c=>c.rules?.some(x=>/Pokémon ex rule|Mega Evolution ex Rule/i.test(x));

  class Game{
    constructor(data,random=Math.random,roles=['charizard','lucario']){this.cards=Object.fromEntries(data.map(c=>[c.id,c]));this.random=random;this.roles=roles;this.validateDeck();this.newGame();}
    validateDeck(){for(const [name,deck] of Object.entries(DECKS)){let count=0,ace=0;for(const [id,qty] of Object.entries(deck)){const c=this.cards[id];if(!c)throw Error('Kartu tidak ditemukan: '+id);if(c.supertype!=='Energy'&&!ALLOWED.has(c.regulationMark))throw Error('Kartu di luar rotasi: '+id);if(c.supertype!=='Energy'&&qty>4)throw Error('Lebih dari 4 kopi: '+id);if(c.subtypes?.includes('ACE SPEC'))ace+=qty;count+=qty;}if(count!==60||ace>1)throw Error('Dek '+name+' tidak sah: '+count+' kartu, '+ace+' ACE SPEC');}}
    createDeck(name){const cards=[];for(const [id,qty] of Object.entries(DECKS[name]))for(let i=0;i<qty;i++)cards.push({uid:++serial,id});return shuffle(cards,this.random);}
    makePlayer(name,deckName){return{name,deckName,deck:this.createDeck(deckName),hand:[],prize:[],discard:[],active:null,bench:[],turns:0,energyUsed:false,supporterUsed:false,stadiumUsed:false,retreated:false,mulligans:0,bonus:0,blackBelt:false,ampPrizeBonus:false,koLastTurn:false,koThisTurn:false,abilityFlags:{},history:[]};}
    print(message){this.log.unshift(message);this.log=this.log.slice(0,100);}
    recordAction(p,type,title,detail='',extra={}){
      if(!p)return null;
      if(!p.history)p.history=[];
      const entry={turn:p.turns,type,title,detail,cardId:extra.cardId||null,cardName:extra.cardName||title,time:Date.now()};
      p.history.unshift(entry);
      return entry;
    }
    draw(p,n=1){let count=0;while(count<n&&p.deck.length){p.hand.push(p.deck.pop());count++;}return count;}
    unit(card,turn){return{stack:[card],energy:[],tool:null,damage:0,placedTurn:turn,evolvedTurn:-1,poisoned:false,paralyzed:false,attackLocks:{},abilityUsedTurn:-1};}
    newGame(roles=null){
      if(roles&&Array.isArray(roles)&&roles.length===2)this.roles=roles;
      const label=deck=>DECK_INFO[deck]?.name||deck;
      this.players=[this.makePlayer('Kamu · '+label(this.roles[0]),this.roles[0]),this.makePlayer('CPU · '+label(this.roles[1]),this.roles[1])];
      this.turn=0;this.over=false;this.winner=null;this.pendingPromotion=null;this.stadium=null;this.log=[];
      for(const p of this.players){
        do{p.deck.push(...p.hand);p.hand=[];shuffle(p.deck,this.random);this.draw(p,7);if(!p.hand.some(c=>this.isBasic(c)))p.mulligans++;}while(!p.hand.some(c=>this.isBasic(c)));
        p.prize=p.deck.splice(-6);
        const preferred=DECK_INFO[p.deckName]?.preferredActive||'me2pt5-126';
        const first=p.hand.find(c=>c.id===preferred)||p.hand.find(c=>this.isBasic(c));
        p.hand.splice(p.hand.indexOf(first),1);
        p.active=this.unit(first,0);
        this.recordAction(p,'card',this.name(first),'Active awal',{cardId:first.id,subtype:'Basic'});
      }
      if(this.bot.mulligans>this.me.mulligans)this.draw(this.me,this.bot.mulligans-this.me.mulligans);
      if(this.me.mulligans>this.bot.mulligans)this.draw(this.bot,this.me.mulligans-this.bot.mulligans);
      this.me.turns=1;this.draw(this.me);
      this.print(label(this.roles[0])+' melawan '+label(this.roles[1])+'. Kamu bermain pertama.');
    }
    get me(){return this.players[0];}get bot(){return this.players[1];}get current(){return this.players[this.turn];}
    card(instance){return this.cards[instance.id];}top(unit){return this.card(unit.stack.at(-1));}name(instance){return this.card(instance).name;}
    isBasic(instance){return typeOf(this.card(instance))==='pokemon'&&this.card(instance).subtypes?.includes('Basic');}
    unitAt(p,ref){return ref==='active'?p.active:p.bench[ref];}allRefs(p){return[{ref:'active',unit:p.active},...p.bench.map((unit,ref)=>({ref,unit}))].filter(x=>x.unit);}
    handCard(p,uid){return p.hand.find(c=>c.uid===uid);}takeHand(p,uid){const i=p.hand.findIndex(c=>c.uid===uid);return i<0?null:p.hand.splice(i,1)[0];}
    fail(error){return{ok:false,error};}ok(){return{ok:true};}canAct(){return!this.over&&this.turn===0&&this.pendingPromotion===null;}
    ownerOf(unit){
      if(!this.players) return null;
      for(const p of this.players){
        if(p.active === unit || p.bench?.includes(unit)) return p;
      }
      return null;
    }
    hasMeganium(p){
      if(!p) return false;
      return (p.active && this.top(p.active).name === 'Meganium') ||
             (p.bench && p.bench.some(b => this.top(b).name === 'Meganium'));
    }
    totalEnergyValue(unit){
      if(!unit||!unit.energy)return 0;
      const owner=this.ownerOf(unit);
      const dbl=owner?this.hasMeganium(owner):false;
      let total=0;
      for(const e of unit.energy){
        if(this.energyType(e)==='Grass'&&dbl)total+=2;
        else if(e.id==='sv10-182')total+=2;
        else total+=1;
      }
      return total;
    }
    hp(unit){
      let val = Number(this.top(unit).hp);
      if(this.stadium?.id==='sv8-177'&&this.top(unit).subtypes?.includes('Stage 2')) val -= 30;
      if(unit.tool?.id==='sv5-152') val += 100;
      if(this.top(unit).name==='Alolan Exeggutor'){
        const owner = this.ownerOf(unit);
        const doubleGrass = owner ? this.hasMeganium(owner) : false;
        let grassCount = 0;
        for(const e of unit.energy){
          if(this.energyType(e)==='Grass') grassCount += (doubleGrass ? 2 : 1);
        }
        if(grassCount >= 6) val += 250;
      }
      return val;
    }
    remaining(unit){return Math.max(0,this.hp(unit)-unit.damage);}
    retreatCost(unit){let n=this.top(unit).convertedRetreatCost||0;if(unit.tool?.id==='zsv10pt5-79')n=Math.max(0,n-2);if(this.top(unit).name==='Charmander'&&!unit.energy.length)n=0;return n;}
    energyType(instance){
      if(instance.id==='sv10-182')return 'Rocket';
      if(instance.id==='me3-87'||instance.id==='sve-6')return 'Fighting';
      if(instance.id==='sve-2')return 'Fire';
      if(instance.id==='sve-5')return 'Psychic';
      if(instance.id==='sve-7')return 'Darkness';
      if(instance.id==='sve-1')return 'Grass';
      if(instance.id==='sve-3')return 'Water';
      if(instance.id==='sve-4')return 'Lightning';
      if(instance.id==='sve-8')return 'Metal';
      return this.name(instance).replace(/^Basic /,'').replace(/ Energy$/,'');
    }
    hasCost(unit,cost){
      const owner = this.ownerOf(unit);
      const doubleGrass = owner ? this.hasMeganium(owner) : false;
      let units=[];
      for(const e of unit.energy){
        if(e.id==='sv10-182')units.push('Darkness/Psychic','Darkness/Psychic');
        else if(this.energyType(e)==='Grass' && doubleGrass) units.push('Grass','Grass');
        else units.push(this.energyType(e));
      }
      if(units.length<cost.length)return false;
      const remaining=[...units];
      for(const type of cost.filter(x=>x!=='Colorless')){
        const exactIdx=remaining.indexOf(type);
        if(exactIdx>=0)remaining.splice(exactIdx,1);
        else{
          const wildIdx=remaining.findIndex(u=>u.includes(type));
          if(wildIdx>=0)remaining.splice(wildIdx,1);
          else return false;
        }
      }
      return remaining.length>=cost.filter(x=>x==='Colorless').length;
    }
    validMoves(p=this.current){
      const u=p.active;
      if(!u||u.paralyzed)return[];
      if(u.attackLocks['All']>=p.turns)return[];
      return(this.top(u).attacks||[]).map((attack,index)=>({attack,index})).filter(({attack})=>this.hasCost(u,attack.cost||[])&&!(u.attackLocks[attack.name]>=p.turns)&&!(attack.name==='Cosmic Beam'&&!p.bench.some(b=>this.top(b).name==='Lunatone')));
    }
    canAttack(p=this.current){return!this.over&&this.pendingPromotion===null&&!!p.active&&!(p===this.me&&p.turns===1)&&this.validMoves(p).length>0;}
    canEvolve(p,card,u){if(!card.evolvesFrom||!u||p.turns===1||u.placedTurn>=p.turns||u.evolvedTurn===p.turns)return false;return card.evolvesFrom===this.top(u).name;}
    isTeamRocketSupporter(c){const printed=this.card(c);return printed.supertype==='Trainer'&&printed.subtypes?.includes('Supporter')&&printed.name.includes("Team Rocket's");}
    playBasic(uid,options={}){if(!this.canAct())return this.fail('Bukan giliranmu.');const p=this.me,c=this.handCard(p,uid);if(!c||!this.isBasic(c))return this.fail('Pilih Pokémon Basic.');if(p.bench.length>=5)return this.fail('Bench penuh.');p.bench.push(this.unit(this.takeHand(p,uid),p.turns));this.print(this.name(c)+' masuk Bench.');this.recordAction(p,'card',this.name(c),'Masuk ke Bench',{cardId:c.id,subtype:'Basic'});if(c.id==='me3-62'&&!options.skipAbility)this.lastDitchCatch(p,options.supporterUid);return this.ok();}
    lastDitchCatch(p,supporterUid){if(p.abilityFlags.lastDitch===p.turns||p.abilityFlags['global_ability_Last-Ditch Catch']===p.turns)return false;const choices=p.deck.filter(x=>typeOf(this.card(x))==='supporter');const c=choices.find(x=>x.uid===supporterUid)||choices[0];if(!c)return false;p.deck.splice(p.deck.indexOf(c),1);p.hand.push(c);shuffle(p.deck,this.random);p.abilityFlags.lastDitch=p.turns;p.abilityFlags['global_ability_Last-Ditch Catch']=p.turns;this.print('Last-Ditch Catch: Meowth ex memperlihatkan '+this.name(c)+' dan memasukkannya ke tangan.');this.recordAction(p,'skill','Last-Ditch Catch (Meowth ex)','Mengambil '+this.name(c)+' dari dek',{abilityName:'Last-Ditch Catch',cardId:'me3-62'});return true;}
    evolve(uid,ref,opponentBenchIndex=null){if(!this.canAct())return this.fail('Bukan giliranmu.');const p=this.me,c=this.handCard(p,uid),u=this.unitAt(p,ref);if(!c||!this.canEvolve(p,this.card(c),u))return this.fail('Evolusi belum tersedia atau target tidak cocok.');const prevName=this.top(u).name;u.stack.push(this.takeHand(p,uid));u.evolvedTurn=p.turns;u.poisoned=false;u.paralyzed=false;u.attackLocks={};u.abilityUsedTurn=-1;this.print('Evolusi menjadi '+this.top(u).name+'.');this.recordAction(p,'card',this.card(c).name,'Evolusi dari '+prevName+' ('+(ref==='active'?'Active':'Bench')+')',{cardId:c.id,subtype:'Evolution'});
    if(this.top(u).name==='Hariyama'&&this.bot.bench.length&&opponentBenchIndex!==null){this.gust(this.bot,opponentBenchIndex);this.recordAction(p,'skill','Heave-Ho Catcher (Hariyama)','Menarik Pokémon lawan ke Active',{abilityName:'Heave-Ho Catcher',cardId:'me1-73'});}
    if(this.top(u).name==='Archaludon ex'){const disc=p.discard.filter(x=>this.energyType(x)==='Metal').slice(0,2);for(const e of disc){p.discard.splice(p.discard.indexOf(e),1);u.energy.push(e);}if(disc.length){this.print('Metal Defender: Archaludon ex memasang '+disc.length+' Metal Energy dari discard.');this.recordAction(p,'skill','Metal Defender (Archaludon ex)','Memasang '+disc.length+' Metal Energy dari discard',{cardId:'sv8-130'});}}
    if(this.top(u).name==="Marnie's Grimmsnarl ex"){const dk=p.deck.filter(x=>this.energyType(x)==='Darkness').slice(0,3);for(const e of dk){p.deck.splice(p.deck.indexOf(e),1);u.energy.push(e);}shuffle(p.deck,this.random);if(dk.length){this.print("Punk Up: Marnie's Grimmsnarl ex memasang "+dk.length+" Darkness Energy dari dek.");this.recordAction(p,'skill',"Punk Up (Marnie's Grimmsnarl ex)","Memasang "+dk.length+" Darkness Energy dari dek",{cardId:'sv10-136'});}}
    if(this.top(u).name==='Noctowl'){const tr=p.deck.filter(x=>this.card(x).supertype==='Trainer').slice(0,2);for(const t of tr){p.deck.splice(p.deck.indexOf(t),1);p.hand.push(t);}shuffle(p.deck,this.random);if(tr.length){this.print('Jewel Seeker: Noctowl mengambil '+tr.map(t=>this.name(t)).join(', ')+' dari dek.');this.recordAction(p,'skill','Jewel Seeker (Noctowl)','Mengambil '+tr.length+' Trainer dari dek',{cardId:'sv7-115'});}}
    this.checkAllKO();return this.ok();}
    attachEnergy(uid,ref){if(!this.canAct())return this.fail('Bukan giliranmu.');const p=this.me,c=this.handCard(p,uid),u=this.unitAt(p,ref);if(!c||typeOf(this.card(c))!=='energy'||!u)return this.fail('Pilih Energy dan Pokémon target.');if(p.energyUsed)return this.fail('Energy sudah dipasang giliran ini.');u.energy.push(this.takeHand(p,uid));p.energyUsed=true;this.print(this.name(c)+' dipasang ke '+this.top(u).name+'.');this.recordAction(p,'card',this.name(c),'Dipasang ke '+this.top(u).name,{cardId:c.id,subtype:'Energy'});return this.ok();}
    attachTool(uid,ref){if(!this.canAct())return this.fail('Bukan giliranmu.');const p=this.me,c=this.handCard(p,uid),u=this.unitAt(p,ref);if(!c||typeOf(this.card(c))!=='tool'||!u||u.tool)return this.fail('Tool atau target tidak tersedia.');u.tool=this.takeHand(p,uid);this.print(this.name(c)+' dipasang ke '+this.top(u).name+'.');this.recordAction(p,'card',this.name(c),'Dipasang ke '+this.top(u).name,{cardId:c.id,subtype:'Tool'});return this.ok();}
    ability(unit){return this.top(unit).abilities?.[0]||null;}
    abilityUsageType(name){
      if(name==='Excited Turbo'||name==='Psychic Embrace')return 'multi';
      if(name==='Flip the Script'||name==='Lunar Cycle'||name==='Last-Ditch Catch')return 'global_once';
      return 'per_instance_once';
    }
    canAbility(p,ref){
      const u=this.unitAt(p,ref),a=u&&this.ability(u);
      if(!a)return false;
      const name=a.name,usage=this.abilityUsageType(name);
      if(usage==='per_instance_once'&&u.abilityUsedTurn===p.turns)return false;
      if(usage==='global_once'&&p.abilityFlags['global_ability_'+name]===p.turns)return false;
      if(name==='Recon Directive')return p.deck.length>0;
      if(name==='Reconstitute')return p.hand.length>=2&&p.deck.length>0;
      if(name==='Lunar Cycle')return this.allRefs(p).some(x=>this.top(x.unit).name==='Solrock')&&p.hand.some(c=>c.id==='sve-6')&&p.deck.length>0;
      if(name==='Excited Turbo')return this.allRefs(p).some(x=>this.top(x.unit).subtypes?.includes('MEGA')&&this.top(x.unit).types?.includes('Fire'))&&p.hand.some(c=>c.id==='sve-2')&&p.bench.some(x=>this.top(x).types?.includes('Fire'));
      if(name==='Flip the Script')return p.koLastTurn&&p.deck.length>0;
      if(name==='Teal Dance')return p.hand.some(c=>c.id==='sve-1')&&p.deck.length>0;
      if(name==='Psychic Embrace')return p.discard.some(c=>c.id==='sve-5')&&this.allRefs(p).some(x=>this.top(x.unit).types?.includes('Psychic'));
      if(name==='Refinement'||name==='Trade')return p.hand.length>=1&&p.deck.length>0;
      if(name==='Tandem Unit')return p.bench.length<5&&p.deck.some(c=>this.isBasic(c)&&this.card(c).types?.includes('Lightning'));
      if(name==='Coin Bonus')return p.deck.length>0;
      return false;
    }
    useAbility(ref,options={},targetPlayer=null){
      const p=targetPlayer||(this.canAct()?this.me:(this.turn===1?this.bot:null));
      if(!p)return this.fail('Bukan giliranmu.');
      if(!targetPlayer&&p===this.me&&!this.canAct())return this.fail('Bukan giliranmu.');
      const u=this.unitAt(p,ref);
      if(!u||!this.canAbility(p,ref))return this.fail('Ability belum tersedia.');
      const name=this.ability(u).name,usage=this.abilityUsageType(name);
      if(usage==='per_instance_once')u.abilityUsedTurn=p.turns;
      if(usage==='global_once')p.abilityFlags['global_ability_'+name]=p.turns;
      if(name==='Recon Directive'){
        this.draw(p,1);p.abilityFlags['recon_'+ref]=p.turns;
        this.print('Recon Directive: '+this.top(u).name+' mengambil 1 kartu dari dek.');
        this.recordAction(p,'skill','Recon Directive ('+this.top(u).name+')','Mengambil 1 kartu dari atas dek',{abilityName:'Recon Directive',cardId:u.stack.at(-1)?.id});
      }else if(name==='Reconstitute'){
        const toDiscard=(options.discardUids||[]).slice(0,2).map(uid=>p.hand.find(c=>c.uid===uid)).filter(Boolean);
        while(toDiscard.length<2&&p.hand.length){const next=p.hand.find(c=>!toDiscard.includes(c));if(!next)break;toDiscard.push(next);}
        for(const c of toDiscard)p.discard.push(this.takeHand(p,c.uid));
        this.draw(p,1);p.abilityFlags.reconstitute=p.turns;
        this.print('Reconstitute: membuang 2 kartu dan mengambil 1 kartu.');
        this.recordAction(p,'skill','Reconstitute ('+this.top(u).name+')','Membuang 2 kartu dan mengambil 1 kartu',{abilityName:'Reconstitute',cardId:u.stack.at(-1)?.id});
      }else if(name==='Lunar Cycle'){
        const c=p.hand.find(x=>x.id==='sve-6');
        p.discard.push(this.takeHand(p,options.energyUid||c.uid));
        this.draw(p,3);p.abilityFlags.lunar=p.turns;
        this.print('Lunar Cycle: buang Fighting Energy, ambil 3 kartu.');
        this.recordAction(p,'skill','Lunar Cycle (Solrock/Lunatone)','Membuang Fighting Energy, mengambil 3 kartu',{abilityName:'Lunar Cycle',cardId:'me2pt5-105'});
      }else if(name==='Excited Turbo'){
        const c=this.handCard(p,options.energyUid)||p.hand.find(x=>x.id==='sve-2');
        const target=p.bench[options.targetRef]||p.bench.find(x=>this.top(x).types?.includes('Fire'));
        if(!c||c.id!=='sve-2'||!target||!this.top(target).types?.includes('Fire'))return this.fail('Pilih Fire Energy dan Pokémon Fire di Bench.');
        target.energy.push(this.takeHand(p,c.uid));
        this.print('Excited Turbo: Fire Energy dipasang ke Bench.');
        this.recordAction(p,'skill','Excited Turbo (Oricorio ex)','Memasang Fire Energy ke '+this.top(target).name,{abilityName:'Excited Turbo',cardId:'me2-18'});
      }else if(name==='Flip the Script'){
        this.draw(p,3);p.abilityFlags.flip=p.turns;
        this.print('Flip the Script: ambil 3 kartu.');
        this.recordAction(p,'skill','Flip the Script (Fezandipiti ex)','Mengambil 3 kartu',{abilityName:'Flip the Script',cardId:'sv6pt5-38'});
      }else if(name==='Teal Dance'){
        const c=this.handCard(p,options.energyUid)||p.hand.find(x=>x.id==='sve-1');
        if(!c||c.id!=='sve-1')return this.fail('Pilih Basic Grass Energy di tangan.');
        u.energy.push(this.takeHand(p,c.uid));
        this.draw(p,1);
        this.print('Teal Dance: memasang Grass Energy dan mengambil 1 kartu.');
        this.recordAction(p,'skill','Teal Dance (Teal Mask Ogerpon ex)','Memasang Grass Energy, mengambil 1 kartu',{abilityName:'Teal Dance',cardId:'sv6-25'});
      }else if(name==='Psychic Embrace'){
        const e=options.energyUid?p.discard.find(x=>x.uid===options.energyUid&&x.id==='sve-5'):p.discard.find(x=>x.id==='sve-5');
        const target=options.targetRef!==undefined?this.unitAt(p,options.targetRef):this.allRefs(p).map(x=>x.unit).find(x=>this.top(x).types?.includes('Psychic'));
        if(!e||!target||!this.top(target).types?.includes('Psychic'))return this.fail('Pilih Psychic Energy di discard dan target Psychic Pokémon.');
        p.discard.splice(p.discard.indexOf(e),1);
        target.energy.push(e);
        target.damage+=20;
        this.print('Psychic Embrace: memasang Psychic Energy ke '+this.top(target).name+' (+20 damage).');
        this.recordAction(p,'skill','Psychic Embrace (Gardevoir ex)','Memasang Psychic Energy dari discard ke '+this.top(target).name,{abilityName:'Psychic Embrace',cardId:'sv1-86'});
        this.checkAllKO();
      }else if(name==='Refinement'||name==='Trade'){
        const toDump=options.handUid?this.handCard(p,options.handUid):p.hand[0];
        if(!toDump)return this.fail('Pilih kartu untuk dibuang.');
        p.discard.push(this.takeHand(p,toDump.uid));
        this.draw(p,2);
        this.print(name+': membuang '+this.name(toDump)+' dan mengambil 2 kartu.');
        this.recordAction(p,'skill',name+' ('+this.top(u).name+')','Membuang '+this.name(toDump)+', mengambil 2 kartu',{abilityName:name,cardId:u.stack.at(-1)?.id});
      }else if(name==='Tandem Unit'){
        const found=p.deck.filter(c=>this.isBasic(c)&&this.card(c).types?.includes('Lightning')).slice(0,Math.min(2,5-p.bench.length));
        for(const c of found){
          p.deck.splice(p.deck.indexOf(c),1);
          p.bench.push(this.unit(c,p.turns));
          this.recordAction(p,'card',this.name(c),'Masuk ke Bench via Tandem Unit',{cardId:c.id,subtype:'Basic'});
        }
        shuffle(p.deck,this.random);
        this.print('Tandem Unit: menaruh '+found.map(c=>this.name(c)).join(', ')+' di Bench.');
      }else if(name==='Coin Bonus'){
        const count=ref==='active'?2:1;
        this.draw(p,count);
        this.print('Coin Bonus: mengambil '+count+' kartu.');
        this.recordAction(p,'skill','Coin Bonus (Gholdengo ex)','Mengambil '+count+' kartu',{abilityName:'Coin Bonus',cardId:'sv4-139'});
      }
      return this.ok();
    }
    canRetreat(p=this.me){const u=p.active;return!!u&&!p.retreated&&!u.paralyzed&&p.bench.length>0&&this.totalEnergyValue(u)>=this.retreatCost(u);}
    retreat(index){
      if(!this.canAct()||!this.canRetreat(this.me))return this.fail('Belum dapat mundur.');
      const p=this.me;
      if(!p.bench[index])return this.fail('Pilih pengganti Bench.');
      const old=p.active;
      let needed=this.retreatCost(old);
      const owner=this.ownerOf(old);
      const dbl=owner?this.hasMeganium(owner):false;
      while(needed>0&&old.energy.length){
        const e=old.energy.pop();
        p.discard.push(e);
        const val=(this.energyType(e)==='Grass'&&dbl)?2:(e.id==='sv10-182'?2:1);
        needed-=val;
      }
      old.poisoned=false;
      old.paralyzed=false;
      p.active=p.bench.splice(index,1)[0];
      p.bench.push(old);
      p.retreated=true;
      this.print('Kamu mundur ke '+this.top(p.active).name+'.');
      return this.ok();
    }
    gust(p,index){if(!p.bench[index])return false;const old=p.active;p.active=p.bench.splice(index,1)[0];p.bench.push(old);this.print(p.name+' mengganti Active ke '+this.top(p.active).name+'.');return true;}
    search(p,predicate,n=1,chosen=[]){const selected=[];for(const uid of chosen){const c=p.deck.find(x=>x.uid===uid&&predicate(x));if(c&&!selected.includes(c)&&selected.length<n)selected.push(c);}if(!chosen.length)selected.push(...p.deck.filter(predicate).slice(0,n));for(const c of selected){p.deck.splice(p.deck.indexOf(c),1);p.hand.push(c);}shuffle(p.deck,this.random);if(selected.length)this.print(p.name+' mengambil '+selected.map(c=>this.name(c)).join(', ')+' dari dek.');return selected.length;}
    recover(p,predicate,n=1,chosen=[]){const selected=[];for(const uid of chosen){const c=p.discard.find(x=>x.uid===uid&&predicate(x));if(c&&!selected.includes(c)&&selected.length<n)selected.push(c);}if(!chosen.length)selected.push(...p.discard.filter(predicate).slice(0,n));for(const c of selected){p.discard.splice(p.discard.indexOf(c),1);p.hand.push(c);}if(selected.length)this.print(p.name+' mengambil '+selected.map(c=>this.name(c)).join(', ')+' dari discard.');return selected.length;}
    basicFighting(c){return c.id==='sve-6';}basicFire(c){return c.id==='sve-2';}
    playTrainer(uid,options={}){if(!this.canAct())return this.fail('Bukan giliranmu.');const p=this.me,c=this.handCard(p,uid);if(!c)return this.fail('Kartu tidak di tangan.');const printed=this.card(c),type=typeOf(printed),id=c.id;if(!['supporter','item','stadium'].includes(type))return this.fail('Bukan kartu Trainer.');if(type==='item'&&p.abilityFlags['item_lock_'+p.turns])return this.fail("Kamu tidak dapat memainkan kartu Item pada giliran ini karena efek Itchy Pollen.");if(type==='supporter'&&(p.supporterUsed||(p.turns===1&&id!=='sv10-177')))return this.fail('Supporter belum dapat dimainkan.');if(id==='sv10-170'&&!p.koLastTurn)return this.fail("Archer hanya bisa dimainkan jika Pokémon Team Rocket KO pada giliran lawan sebelumnya.");if(type==='stadium'&&(p.stadiumUsed||this.stadium?.id===id))return this.fail('Stadium belum dapat dimainkan.');const otherCards=p.hand.filter(x=>x.uid!==uid).length;if(id==='me1-131'&&otherCards<2)return this.fail('Ultra Ball perlu 2 kartu lain untuk dibuang.');if(id==='sv6-163'&&otherCards<3)return this.fail('Secret Box perlu 3 kartu lain untuk dibuang.');if(id==='me1-130'&&!p.bench.length)return this.fail('Bench kosong.');if(id==='me1-114'&&!this.bot.bench.length)return this.fail('Bench lawan kosong.');if(id==='me1-125'&&!this.rareCandyOptions(p).length)return this.fail('Rare Candy tidak memiliki pasangan evolusi.');
      const played=this.takeHand(p,uid);if(type==='supporter')p.supporterUsed=true;if(type==='stadium'){p.stadiumUsed=true;const old=this.stadium;if(old)old.owner.discard.push(old.card);this.stadium={id,card:played,owner:p};this.checkAllKO();}else p.discard.push(played);
      const fromDeck=(predicate,n=1)=>this.search(p,predicate,n,options.chosen||[]);
      const fromDiscard=(predicate,n=1)=>this.recover(p,predicate,n,options.chosen||[]);
      const dump=n=>{const chosen=(options.discard||[]).map(x=>this.handCard(p,x)).filter(Boolean).slice(0,n);while(chosen.length<n&&p.hand.length){const next=p.hand.find(x=>!chosen.includes(x));if(!next)break;chosen.push(next);}for(const x of chosen)p.discard.push(this.takeHand(p,x.uid));};
      if(id==='me1-116')fromDeck(x=>this.basicFighting(x)||(this.isBasic(x)&&this.card(x).types?.includes('Fighting')));
      else if(id==='me2pt5-198')fromDeck(x=>typeOf(this.card(x))==='pokemon'&&!ruleBox(this.card(x)));
      else if(id==='me1-121')fromDeck(x=>this.card(x).subtypes?.includes('MEGA'));
      else if(id==='me1-131'){dump(2);fromDeck(x=>typeOf(this.card(x))==='pokemon');}
      else if(id==='sv6-163'){dump(3);for(const t of ['item','tool','supporter','stadium'])this.search(p,x=>typeOf(this.card(x))===t,1,options[t]?[options[t]]:[]);}
      else if(id==='me2pt5-196')fromDiscard(x=>typeOf(this.card(x))==='pokemon'||basicEnergy(this.card(x)));
      else if(id==='me4-108')fromDiscard(x=>basicEnergy(this.card(x)),2);
      else if(id==='me3-108'){const selected=p.discard.filter(x=>basicEnergy(this.card(x))).slice(0,5);for(const x of selected){p.discard.splice(p.discard.indexOf(x),1);p.deck.push(x);}shuffle(p.deck,this.random);if(selected.length)this.print(p.name+' memasukkan '+selected.length+' Energy ke dek.');}
      else if(id==='me1-130')this.gust(p,options.benchIndex??0);
      else if(id==='me1-114')this.gust(this.bot,options.benchIndex??0);
      else if(id==='me1-125'){const pair=this.rareCandyOptions(p).find(x=>x.ref===options.ref&&x.card.uid===options.evolutionUid)||this.rareCandyOptions(p)[0];if(pair){const u=this.unitAt(p,pair.ref);u.stack.push(this.takeHand(p,pair.card.uid));u.evolvedTurn=p.turns;u.poisoned=false;u.paralyzed=false;u.attackLocks={};u.abilityUsedTurn=-1;this.print('Rare Candy: '+this.top(u).name+' berevolusi.');this.recordAction(p,'card',this.name(pair.card),'Evolusi via Rare Candy',{cardId:pair.card.id,subtype:'Evolution'});}}
      else if(id==='me1-119'){p.deck.push(...p.hand.splice(0));shuffle(p.deck,this.random);this.draw(p,p.prize.length===6?8:6);}
      else if(id==='me3-76'){for(const player of this.players){player.deck.push(...player.hand.splice(0));shuffle(player.deck,this.random);this.draw(player,4);}}
      else if(id==='sv9-146'){const evolution=options.mode==='evolution';fromDeck(x=>typeOf(this.card(x))==='pokemon'&&(evolution?!this.isBasic(x):this.isBasic(x)),2);}
      else if(id==='sv9-143')p.blackBelt=true;
      else if(id==='me1-124')p.bonus+=30;
      else if(id==='me2-89')fromDeck(x=>this.basicFire(x),7);
      else if(id==='sv10-176')fromDeck(x=>this.card(x).supertype==='Trainer');
      else if(id==='me2-87')for(const subtype of ['Basic','Stage 1','Stage 2'])this.search(p,x=>this.card(x).subtypes?.includes(subtype),1,options[subtype]?[options[subtype]]:[]);
      else if(id==='sv6-155')fromDiscard(x=>(typeOf(this.card(x))==='pokemon'&&!ruleBox(this.card(x)))||basicEnergy(this.card(x)),3);
      else if(id==='sv8-185'){const selected=p.deck.filter(x=>this.isBasic(x)).slice(0,5-p.bench.length);for(const x of selected){p.deck.splice(p.deck.indexOf(x),1);p.bench.push(this.unit(x,p.turns));this.recordAction(p,'card',this.name(x),'Masuk ke Bench via Trolley',{cardId:x.id,subtype:'Basic'});}shuffle(p.deck,this.random);if(selected.length)this.print(p.name+' menaruh '+selected.length+' Pokémon Basic ke Bench.');}
      else if(id==='sv10-178')fromDeck(x=>this.isTeamRocketSupporter(x),1);
      else if(id==='sv10-177')fromDeck(x=>this.isBasic(x)&&this.name(x).includes("Team Rocket's"),3);
      else if(id==='sv10-171'){const allTR=this.allRefs(p).every(x=>this.top(x.unit).name.includes("Team Rocket's"));const n=allTR?3:2;fromDeck(x=>this.isBasic(x)&&this.name(x).includes("Team Rocket's"),n);}
      else if(id==='sv10-174'){if(p.bench.length)this.gust(p,options.benchIndex??0);if(this.bot.bench.length)this.gust(this.bot,options.opponentBenchIndex??0);}
      else if(id==='sv10-170'){for(const player of this.players){player.deck.push(...player.hand.splice(0));shuffle(player.deck,this.random);}this.draw(p,6);this.draw(this.bot,3);}
      if(this.isTeamRocketSupporter(c))p.abilityFlags['played_tr_supporter_'+p.turns]=true;
      this.print(p.name+' memainkan '+printed.name+'.');this.recordAction(p,'card',printed.name,'Dimainkan ('+type+')',{cardId:id,subtype:type});this.checkAllKO();return this.ok();
    }
    canUseStadium(p=this.current){
      if(this.over||this.turn!==(p===this.me?0:1)||this.pendingPromotion!==null)return false;
      if(!this.stadium)return false;
      if(this.stadium.id==='sv10-173'){
        return !!p.abilityFlags['played_tr_supporter_'+p.turns]&&!p.abilityFlags['factory_'+p.turns]&&p.deck.length>0;
      }
      return false;
    }
    useStadium(p=this.me){
      if(!this.canAct())return this.fail('Bukan giliranmu.');
      if(!this.stadium)return this.fail('Tidak ada Stadium di arena.');
      if(this.stadium.id==='sv10-173'){
        if(!p.abilityFlags['played_tr_supporter_'+p.turns])return this.fail("Team Rocket's Factory hanya bisa dipakai setelah memainkan Supporter Team Rocket.");
        if(p.abilityFlags['factory_'+p.turns])return this.fail("Efek Team Rocket's Factory sudah digunakan giliran ini.");
        if(p.deck.length===0)return this.fail('Dek kosong.');
        p.abilityFlags['factory_'+p.turns]=true;
        const drawn=this.draw(p,2);
        this.print(p.name+" menggunakan efek Team Rocket's Factory: mengambil "+drawn+" kartu.");
        this.recordAction(p,'skill',"Team Rocket's Factory","Mengambil "+drawn+" kartu dari dek",{cardId:'sv10-173'});
        return this.ok();
      }
      return this.fail('Stadium ini tidak memiliki efek yang dapat diaktifkan.');
    }
    rareCandyOptions(p=this.me){
      if(p.turns===1)return[];
      const result=[];
      for(const {ref,unit} of this.allRefs(p)){
        if(!this.top(unit).subtypes?.includes('Basic')||unit.placedTurn>=p.turns||unit.evolvedTurn===p.turns)continue;
        for(const c of p.hand){
          const card=this.card(c);
          if(card.subtypes?.includes('Stage 2')){
            if(this.top(unit).name==='Charmander'&&card.name.startsWith('Mega Charizard'))result.push({ref,card:c});
            if(this.top(unit).name==='Dreepy'&&card.name==='Dragapult ex')result.push({ref,card:c});
            if(this.top(unit).name==="Team Rocket's Porygon"&&card.name==="Team Rocket's Porygon-Z")result.push({ref,card:c});
            if(this.top(unit).name==='Ralts'&&card.name==='Gardevoir ex')result.push({ref,card:c});
            if((this.top(unit).name==='Impidimp'||this.top(unit).name==="Marnie's Impidimp")&&card.name.includes('Grimmsnarl'))result.push({ref,card:c});
            if(this.top(unit).name==='Chikorita'&&card.name==='Meganium')result.push({ref,card:c});
          }
        }
      }
      return result;
    }
    attack(index,options={}){
      const p=this.current,op=this.players[1-this.turn],u=p.active;
      if(!this.canAttack(p))return this.fail('Serangan belum tersedia.');
      const move=this.validMoves(p).find(x=>x.index===index)?.attack;
      if(!move)return this.fail('Energy tidak cukup.');
      const source=this.top(u),defender=op.active,target=this.top(defender);
      let damage=Number.parseInt(move.damage,10)||0;
      let benchTarget=null;
      if(move.name==='Inferno X'){const all=this.allRefs(p).flatMap(({unit})=>unit.energy.filter(e=>this.energyType(e)==='Fire').map(e=>({unit,e})));const selected=options.fireDiscards?.length?all.filter(x=>options.fireDiscards.includes(x.e.uid)):all.slice(0,Math.min(all.length,Math.ceil(this.remaining(defender)/90)));if(!selected.length)return this.fail('Inferno X perlu membuang Fire Energy.');damage=90*selected.length;for(const {unit,e} of selected){unit.energy.splice(unit.energy.indexOf(e),1);p.discard.push(e);}this.print('Inferno X membuang '+selected.length+' Fire Energy.');}
      if(move.name==='Explosion Y'){if(u.energy.length<3)return this.fail('Perlu 3 Energy untuk dibuang.');for(let n=0;n<3;n++)p.discard.push(u.energy.pop());damage=280;if(Number.isInteger(options.targetBenchIndex)&&op.bench[options.targetBenchIndex])benchTarget=op.bench[options.targetBenchIndex];}
      if(move.name==='Cruel Arrow'&&Number.isInteger(options.targetBenchIndex)&&op.bench[options.targetBenchIndex]){benchTarget=op.bench[options.targetBenchIndex];damage=100;}
      if(move.name==='Phantom Dive'){damage=200;if(Number.isInteger(options.targetBenchIndex)&&op.bench[options.targetBenchIndex]){benchTarget=op.bench[options.targetBenchIndex];benchTarget.damage+=60;this.print('Phantom Dive memberi 60 damage ke Bench '+this.top(benchTarget).name+'.');}}
      if(move.name==='Rocket Feathers'){const discards=(options.supporterDiscards||[]).map(uid=>this.handCard(p,uid)).filter(c=>c&&this.isTeamRocketSupporter(c));if(!discards.length&&p.hand.some(c=>this.isTeamRocketSupporter(c))&&!options.supporterDiscards){const auto=p.hand.filter(c=>this.isTeamRocketSupporter(c));discards.push(...auto);}for(const c of discards)p.discard.push(this.takeHand(p,c.uid));damage=60*discards.length;this.print('Rocket Feathers membuang '+discards.length+' Supporter Team Rocket ('+damage+' damage).');}
      if(move.name==='R Command'){const count=p.discard.filter(c=>this.isTeamRocketSupporter(c)).length;damage=20*count;this.print('R Command: '+count+' Supporter Team Rocket di discard ('+damage+' damage).');}
      if(move.name==='Deceit'){this.search(p,x=>typeOf(this.card(x))==='supporter',1,options.supporterUid?[options.supporterUid]:[]);}
      if(move.name==='Hacking'){const myDump=options.handUid?this.handCard(p,options.handUid):p.hand[0];if(myDump)p.discard.push(this.takeHand(p,myDump.uid));if(op.hand.length){const opDump=op.hand.pop();op.discard.push(opDump);this.print(op.name+' membuang 1 kartu dari tangan via Hacking.');}}
      if(move.name==='Mega Brave'||move.name==='Accelerating Stab')u.attackLocks[move.name]=p.turns+1;
      if(move.name==='Aura Jab'){let energies=p.discard.filter(x=>this.basicFighting(x)).slice(0,3);for(let i=0;i<energies.length&&p.bench.length;i++){const e=energies[i],targetUnit=p.bench[options.energyTargets?.[i]??0]||p.bench[0];p.discard.splice(p.discard.indexOf(e),1);targetUnit.energy.push(e);}if(energies.length&&p.bench.length)this.print('Aura Jab memasang '+energies.length+' Fighting Energy dari discard ke Bench.');}
      if(move.name==='Cosmic Beam'&&!p.bench.some(b=>this.top(b).name==='Lunatone'))damage=0;
      
      // New top archetypes attacks
      if(move.name==='Bellowing Thunder'){
        const allEnergies=this.allRefs(p).flatMap(({unit})=>unit.energy.filter(e=>basicEnergy(this.card(e))).map(e=>({unit,e})));
        const needed=Math.max(1,Math.min(allEnergies.length,Math.ceil(this.remaining(defender)/70)));
        const selected=options.energyDiscards?.length?allEnergies.filter(x=>options.energyDiscards.includes(x.e.uid)):allEnergies.slice(0,needed);
        for(const {unit,e} of selected){unit.energy.splice(unit.energy.indexOf(e),1);p.discard.push(e);}
        damage=70*selected.length;
        this.print('Bellowing Thunder membuang '+selected.length+' Basic Energy ('+damage+' damage).');
      }
      if(move.name==='Bursting Roar'){
        for(const c of [...p.hand])p.discard.push(this.takeHand(p,c.uid));
        this.draw(p,6);
        this.print('Bursting Roar: membuang seluruh tangan dan mengambil 6 kartu.');
        damage=0;
      }
      if(move.name==='Make It Rain'){
        const handEnergies=p.hand.filter(c=>basicEnergy(this.card(c)));
        const needed=Math.max(1,Math.min(handEnergies.length,Math.ceil(this.remaining(defender)/50)));
        const selected=options.handEnergyDiscards?.length?handEnergies.filter(x=>options.handEnergyDiscards.includes(x.uid)):handEnergies.slice(0,needed);
        for(const c of selected)p.discard.push(this.takeHand(p,c.uid));
        damage=50*selected.length;
        this.print('Make It Rain membuang '+selected.length+' Basic Energy dari tangan ('+damage+' damage).');
      }
      if(move.name==='Amp You Very Much'){
        p.ampPrizeBonus=true;
      }
      if(move.name==='Shadow Bullet'){
        damage=180;
        if(op.bench.length){
          const bIdx=Number.isInteger(options.targetBenchIndex)&&op.bench[options.targetBenchIndex]?options.targetBenchIndex:0;
          op.bench[bIdx].damage+=30;
          this.print("Shadow Bullet memberi 30 damage ke Bench "+this.top(op.bench[bIdx]).name+".");
        }
      }
      if(move.name==='Iron Blaster'){
        damage=220;
        u.attackLocks['Iron Blaster']=p.turns+1;
      }
      if(move.name==='Unified Beatdown'){
        damage=30*p.bench.length;
        this.print('Unified Beatdown: '+damage+' damage ('+p.bench.length+' benched Pokémon).');
      }
      if(move.name==='Crown Opal'){
        damage=180;
      }
      if(move.name==='Spiky Wheel'){
        damage=30;
        if(u.energy.length&&p.bench.length){
          const moved=u.energy.pop();
          p.bench[0].energy.push(moved);
          this.print('Spiky Wheel memindahkan 1 Energy ke Bench.');
        }
      }
      if(move.name==='Tormenting Horn'){
        defender.attackLocks['All']=p.turns+1;
        this.print('Tormenting Horn: '+target.name+' tidak dapat menyerang pada giliran berikutnya.');
      }
      if(move.name==='Doom Crush'){
        if(defender.energy.length){
          const dumped=defender.energy.pop();
          op.discard.push(dumped);
          this.print('Doom Crush membuang 1 Energy ('+this.name(dumped)+') lawan.');
        }
      }
      if(move.name==='Shadow Impact'){
        u.damage+=30;
        this.print('Shadow Impact memberi 30 recoil damage ke '+source.name+'.');
      }
      if(move.name==="Barrage O'Clock"){
        const totalEnergy=(u.energy?.length||0)+(defender.energy?.length||0);
        let heads=0;
        for(let i=0;i<totalEnergy;i++){
          if(this.random()<0.5)heads++;
        }
        damage=60*heads;
        this.print("Barrage O'Clock: "+totalEnergy+" Energy terpasang ("+heads+" heads, "+damage+" damage).");
      }
      if(move.name==='Tropical Frenzy'){
        damage=150;
        const handEnergies=p.hand.filter(c=>basicEnergy(this.card(c)));
        if(handEnergies.length){
          for(const e of handEnergies){
            this.takeHand(p,e.uid);
            u.energy.push(e);
          }
          this.print('Tropical Frenzy memasang '+handEnergies.length+' Basic Grass Energy dari tangan.');
        }
      }
      if(move.name==='Precocious Evolution'){
        damage=0;
        const evo=p.deck.find(x=>this.card(x).evolvesFrom==='Exeggcute');
        if(evo){
          p.deck.splice(p.deck.indexOf(evo),1);
          u.stack.push(evo);
          u.evolvedTurn=p.turns;
          shuffle(p.deck,this.random);
          this.print('Precocious Evolution: Exeggcute berevolusi menjadi '+this.name(evo)+'.');
          this.recordAction(p,'skill','Precocious Evolution','Berevolusi menjadi '+this.name(evo),{cardId:evo.id});
        }
      }
      if(move.name==='Swinging Sphene'){
        const isHeads=this.random()<0.5;
        if(isHeads){
          if(this.isBasic(defender)){
            defender.damage=this.top(defender).hp;
            this.print('Swinging Sphene (Heads): Meng-KO Pokémon Active '+this.top(defender).name+'.');
          }else{
            this.print('Swinging Sphene (Heads): Pokémon Active lawan bukan Basic.');
          }
        }else{
          const bIdx=Number.isInteger(options.targetBenchIndex)&&op.bench[options.targetBenchIndex]?options.targetBenchIndex:0;
          if(op.bench[bIdx]&&this.isBasic(op.bench[bIdx])){
            op.bench[bIdx].damage=this.top(op.bench[bIdx]).hp;
            this.print('Swinging Sphene (Tails): Meng-KO Pokémon Bench '+this.top(op.bench[bIdx]).name+'.');
          }else{
            this.print('Swinging Sphene (Tails): Tidak ada target Basic di Bench.');
          }
        }
        damage=0;
      }
      if(move.name==='Mega Drain'){
        damage=150;
        const heal = Math.min(u.damage, 50);
        u.damage -= heal;
        if(heal > 0) this.print('Mega Drain menyembuhkan '+heal+' damage pada '+source.name+'.');
      }
      if(move.name==='Push Down'){
        damage=50;
        if(op.bench.length){
          const nextActive=op.bench.shift();
          op.bench.push(op.active);
          op.active=nextActive;
          this.print('Push Down: Pokémon Active lawan terdorong ke Bench, digantikan oleh '+this.top(op.active).name+'.');
        }
      }
      if(move.name==='Myriad Leaf Shower'){
        const countEnergy=(pkmnUnit)=>{
          if(!pkmnUnit||!pkmnUnit.energy)return 0;
          const owner=this.ownerOf(pkmnUnit);
          const dbl=owner?this.hasMeganium(owner):false;
          let count=0;
          for(const e of pkmnUnit.energy){
            if(this.energyType(e)==='Grass'&&dbl)count+=2;
            else if(e.id==='sv10-182')count+=2;
            else count+=1;
          }
          return count;
        };
        const totalE=countEnergy(u)+countEnergy(defender);
        damage=30+30*totalE;
        this.print('Myriad Leaf Shower: Total '+totalE+' Energy terpasang ('+damage+' damage).');
      }
      if(move.name==='Itchy Pollen'){
        damage=10;
        op.abilityFlags['item_lock_'+(op.turns+1)] = true;
        this.print("Itchy Pollen: Lawan tidak dapat memainkan kartu Item pada giliran berikutnya.");
      }
      if(move.name==='Photon Blaster'){
        u.attackLocks['Photon Blaster']=p.turns+1;
      }
      if(move.name==='Miracle Force'){
        u.poisoned=false;u.paralyzed=false;
      }
      if(move.name==='Balloon Bombs'){
        damage=30*Math.floor(u.damage/10);
      }
      if(move.name==='Roaring Scream'){
        damage=20*Math.floor(u.damage/10);
        if(Number.isInteger(options.targetBenchIndex)&&op.bench[options.targetBenchIndex]){
          benchTarget=op.bench[options.targetBenchIndex];
        }
      }

      if(p.blackBelt&&target.subtypes?.includes('ex'))damage+=40;
      if(source.types?.includes('Fighting'))damage+=p.bonus;
      if(move.name==='Cosmic Beam'||benchTarget){/* Printed effects bypass Weakness and Resistance. */}
      else{if(target.weaknesses?.[0]?.type===source.types?.[0])damage*=2;if(target.resistances?.[0]?.type===source.types?.[0])damage=Math.max(0,damage-Math.abs(Number.parseInt(target.resistances[0].value,10)||0));}
      const hit=benchTarget&&move.name!=='Phantom Dive'?benchTarget:defender;hit.damage+=damage;this.print(source.name+' memakai '+move.name+': '+damage+' damage'+(benchTarget&&move.name!=='Phantom Dive'?' ke Bench':'')+'.');
      this.recordAction(p,'attack',source.name+' — '+move.name,damage+' damage ke '+this.top(hit).name+(benchTarget&&move.name!=='Phantom Dive'?' (Bench)':' (Active)'),{attacker:source.name,attackName:move.name,damage,target:this.top(hit).name,cardId:u.stack.at(-1)?.id});
      if(move.name==='Wild Press')u.damage+=70;if(move.name==='Burning Flare')u.damage+=60;
      this.checkAllKO();if(!this.over)this.endTurn();return this.ok();
    }
    prizeCount(u){const c=this.top(u);return c.subtypes?.includes('MEGA')?3:c.subtypes?.includes('ex')?2:1;}
    resolvePlayerKO(loser,winner){
      if(this.over)return;
      for(let i=loser.bench.length-1;i>=0;i--){
        const u=loser.bench[i];
        if(u&&u.damage>=this.hp(u)){
          const name=this.top(u).name,count=this.prizeCount(u)+(winner.ampPrizeBonus?1:0);
          loser.discard.push(...u.stack,...u.energy,...(u.tool?[u.tool]:[]));
          loser.bench.splice(i,1);
          for(let j=0;j<count&&winner.prize.length;j++)winner.hand.push(winner.prize.pop());
          loser.koThisTurn=true;
          this.print(name+' (Bench) Knock Out. '+winner.name+' mengambil '+count+' Prize.');
          this.recordAction(winner,'card',name,'Knock Out (Bench) — Mengambil '+count+' Prize',{cardId:u.stack.at(-1)?.id});
          if(!winner.prize.length){this.finish(winner);return;}
        }
      }
      if(loser.active&&loser.active.damage>=this.hp(loser.active)){
        const u=loser.active;
        const name=this.top(u).name,count=this.prizeCount(u)+(winner.ampPrizeBonus?1:0);
        loser.discard.push(...u.stack,...u.energy,...(u.tool?[u.tool]:[]));
        loser.active=null;
        for(let j=0;j<count&&winner.prize.length;j++)winner.hand.push(winner.prize.pop());
        loser.koThisTurn=true;
        this.print(name+' Knock Out. '+winner.name+' mengambil '+count+' Prize.');
        this.recordAction(winner,'card',name,'Knock Out — Mengambil '+count+' Prize',{cardId:u.stack.at(-1)?.id});
        if(!winner.prize.length){this.finish(winner);return;}
        if(!loser.bench.length){this.finish(winner);return;}
        if(loser===this.bot)this.promote(loser,0);
        else this.pendingPromotion=0;
      }
    }
    checkAllKO(){
      if(this.over)return;
      const op=this.players[1-this.turn],p=this.current;
      this.resolvePlayerKO(op,p);
      if(!this.over)this.resolvePlayerKO(p,op);
    }
    resolveKO(loser,winner){return this.resolvePlayerKO(loser,winner);}
    promote(p,index){if(!p.bench[index])return this.fail('Pilih Pokémon Bench.');p.active=p.bench.splice(index,1)[0];this.pendingPromotion=null;this.print(p.name+' memilih '+this.top(p.active).name+' sebagai Active.');return this.ok();}
    finish(winner){this.over=true;this.winner=winner;this.print(winner.name+' menang!');}
    endTurn(){
      if(this.over)return;
      const old=this.current;
      for(const p of this.players)if(p.active?.poisoned){p.active.damage+=10;}
      this.checkAllKO();
      if(this.over)return;
      if(old.active)old.active.paralyzed=false;
      old.ampPrizeBonus=false;
      this.turn=1-this.turn;
      const next=this.current;
      next.turns++;next.energyUsed=false;next.supporterUsed=false;next.stadiumUsed=false;next.retreated=false;next.bonus=0;next.blackBelt=false;next.koLastTurn=next.koThisTurn;next.koThisTurn=false;
      if(!this.draw(next,1)){this.finish(old);return;}
      this.print('Giliran '+next.name+': mengambil 1 kartu.');
    }
    aiTurn(){
      if(this.over||this.turn!==1||this.pendingPromotion!==null)return;
      const p=this.bot;
      
      // 1. Bench Basics
      for(const c of [...p.hand])if(this.isBasic(c)&&p.bench.length<5){p.bench.push(this.unit(this.takeHand(p,c.uid),p.turns));this.print('CPU menaruh '+this.name(c)+' di Bench.');this.recordAction(p,'card',this.name(c),'Masuk ke Bench',{cardId:c.id,subtype:'Basic'});if(c.id==='me3-62')this.lastDitchCatch(p);}
      
      // 2. Play Precious Trolley
      const trolley=p.hand.find(c=>c.id==='sv8-185');
      if(trolley&&p.bench.length<5){
        p.discard.push(this.takeHand(p,trolley.uid));
        this.recordAction(p,'card','Precious Trolley','Dimainkan (Item)',{cardId:trolley.id,subtype:'Item'});
        for(const c of p.deck.filter(x=>this.isBasic(x)).slice(0,5-p.bench.length)){
          p.deck.splice(p.deck.indexOf(c),1);
          p.bench.push(this.unit(c,p.turns));
          this.recordAction(p,'card',this.name(c),'Masuk ke Bench via Trolley',{cardId:c.id,subtype:'Basic'});
        }
        shuffle(p.deck,this.random);
        this.print('CPU memainkan Precious Trolley.');
      }
      
      // 3. Search Items (Ultra Ball, Poké Pad)
      for(const id of ['me2pt5-198','me1-131']){
        const item=p.hand.find(x=>x.id===id);
        if(!item)continue;
        if(id==='me1-131'&&p.hand.length<3)continue;
        const target=p.deck.find(x=>!this.isBasic(x)&&this.allRefs(p).some(u=>this.canEvolve(p,this.card(x),u.unit)))||p.deck.find(x=>typeOf(this.card(x))==='pokemon');
        if(!target)continue;
        p.discard.push(this.takeHand(p,item.uid));
        if(id==='me1-131')for(let i=0;i<2;i++){const dump=p.hand.find(x=>x.uid!==target.uid)||p.hand.at(-1);if(dump)p.discard.push(this.takeHand(p,dump.uid));}
        p.deck.splice(p.deck.indexOf(target),1);p.hand.push(target);shuffle(p.deck,this.random);
        this.print('CPU memakai '+this.name(item)+' mencari '+this.name(target)+'.');
        this.recordAction(p,'card',this.name(item),'Mencari '+this.name(target),{cardId:item.id,subtype:'Item'});
      }

      // 4. Evolve
      for(const c of [...p.hand]){
        const card=this.card(c);
        if(!card.evolvesFrom)continue;
        const u=this.allRefs(p).map(x=>x.unit).find(x=>this.canEvolve(p,card,x));
        if(u){
          u.stack.push(this.takeHand(p,c.uid));
          u.evolvedTurn=p.turns;u.poisoned=false;u.paralyzed=false;
          this.print('CPU mengevolusikan '+card.name+'.');
          this.recordAction(p,'card',card.name,'Evolusi',{cardId:c.id,subtype:'Evolution'});
        }
      }

      // 5. Rare Candy
      const candy=p.hand.find(c=>c.id==='me1-125'),pair=this.rareCandyOptions(p);
      if(candy&&pair.length){
        p.discard.push(this.takeHand(p,candy.uid));
        const x=pair[0];
        this.unitAt(p,x.ref).stack.push(this.takeHand(p,x.card.uid));
        this.unitAt(p,x.ref).evolvedTurn=p.turns;
        this.print('CPU memakai Rare Candy.');
        this.recordAction(p,'card','Rare Candy','Dimainkan (Item)',{cardId:candy.id,subtype:'Item'});
        this.recordAction(p,'card',this.card(x.card).name,'Evolusi via Rare Candy',{cardId:x.card.id,subtype:'Evolution'});
      }

      // 6. Abilities (Coin Bonus, Recon Directive, Trade, Refinement, Teal Dance, Flip the Script, Tandem Unit)
      for(const {ref} of this.allRefs(p)){
        if(this.canAbility(p,ref)){
          this.useAbility(ref,{},p);
        }
      }

      // 7. Energy Attachment
      if(!p.energyUsed){
        const energyCard=p.hand.find(x=>typeOf(this.card(x))==='energy');
        if(energyCard){
          const target=p.active||this.allRefs(p).map(x=>x.unit)[0];
          target.energy.push(this.takeHand(p,energyCard.uid));
          p.energyUsed=true;
          this.print('CPU memasang '+this.name(energyCard)+'.');
          this.recordAction(p,'card',this.name(energyCard),'Dipasang ke '+this.top(target).name,{cardId:energyCard.id,subtype:'Energy'});
        }
      }

      // 8. Tool attachment
      const balloon=p.hand.find(c=>c.id==='zsv10pt5-79');
      if(balloon){
        const target=this.allRefs(p).map(x=>x.unit).find(x=>!x.tool);
        if(target){
          target.tool=this.takeHand(p,balloon.uid);
          this.print('CPU memasang Air Balloon.');
          this.recordAction(p,'card',this.name(balloon),'Dipasang ke '+this.top(target).name,{cardId:balloon.id,subtype:'Tool'});
        }
      }

      // 9. Supporter (Lillie, Judge, Boss)
      if(p.turns>1&&!p.supporterUsed){
        const sup=p.hand.find(x=>typeOf(this.card(x))==='supporter');
        if(sup){
          p.discard.push(this.takeHand(p,sup.uid));
          p.supporterUsed=true;
          if(sup.id==='me1-119'){p.deck.push(...p.hand.splice(0));shuffle(p.deck,this.random);this.draw(p,p.prize.length===6?8:6);}
          else if(sup.id==='me3-76'){for(const q of this.players){q.deck.push(...q.hand.splice(0));shuffle(q.deck,this.random);this.draw(q,4);}}
          else if(sup.id==='me1-114'&&this.me.bench.length){this.gust(this.me,0);}
          else this.draw(p,2);
          this.print('CPU memainkan '+this.name(sup)+'.');
          this.recordAction(p,'card',this.name(sup),'Dimainkan (Supporter)',{cardId:sup.id,subtype:'Supporter'});
        }
      }

      // 10. Attack
      const moves=this.validMoves(p);
      if(moves.length){
        const best=moves.sort((a,b)=>(Number.parseInt(b.attack.damage,10)||0)-(Number.parseInt(a.attack.damage,10)||0))[0];
        const result=this.attack(best.index);
        if(!result.ok){
          this.print('CPU mengakhiri giliran.');
          this.endTurn();
        }
      }else{
        this.print('CPU mengakhiri giliran.');
        this.endTurn();
      }
    }
  }

  return{Game,DECKS,DECK_INFO,cardType:typeOf};
});

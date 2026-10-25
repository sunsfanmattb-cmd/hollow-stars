'use strict';
/* ================= v8: difficulty, campaign, daily quests + login calendar, crafting, cosmetics, stats, menu hub =================
   Saves: localStorage.hsV8 = {v:1,dif,camp,quests,login,stats}; cosmetics live in hsCol (COLL.var/COLL.show). Every loader fills
   missing fields with defaults, so v7.x saves load unchanged (migration = additive only). Dates are the device's LOCAL calendar day. */
const DIFS={easy:{n:'Easy',m:.5,d:'The void hesitates and blunders. Half Shards.'},normal:{n:'Normal',m:1,d:'The void as you know it.'},nightmare:{n:'Nightmare',m:1.6,d:'It plans whole turns ahead and you start with 1 Madness. ×1.6 Shards.'}};
const difMul=d=>(DIFS[d]||DIFS.normal).m;
let V8NOW=null;const v8now=()=>V8NOW?new Date(V8NOW):new Date();
const dayKey=t=>{const d=t||v8now();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const dayAdd=(k,n)=>{const[y,m,d]=k.split('-').map(Number);return dayKey(new Date(y,m-1,d+n,12))};
const V8D=()=>({v:1,dif:'normal',camp:{},quests:null,login:{last:'',day:0,claimed:''},stats:{games:0,wins:0,losses:0,draws:0,streak:0,best:0,deck:{},fac:{},dif:{},cards:{},hist:[]}});
function v8Mig(o){const d=V8D();if(!o||typeof o!=='object'||o.v!==1)return d;for(const k of Object.keys(d))if(o[k]===undefined||(o[k]===null&&k!=='quests')||typeof o[k]!==typeof d[k]&&k!=='quests')o[k]=d[k];
 for(const k of Object.keys(d.stats))if(o.stats[k]===undefined||typeof o.stats[k]!==typeof d.stats[k])o.stats[k]=d.stats[k];if(!Array.isArray(o.stats.hist))o.stats.hist=[];
 for(const k of Object.keys(d.login))if(o.login[k]===undefined)o.login[k]=d.login[k];if(!DIFS[o.dif])o.dif='normal';return o}
let V8=(()=>{let o=null;try{o=JSON.parse(localStorage.getItem('hsV8')||'null')}catch(e){}return v8Mig(o)})();
function saveV8(){try{localStorage.setItem('hsV8',JSON.stringify(V8))}catch(e){}}
function collMig(){let ch=0;if(!COLL.var||typeof COLL.var!=='object'){COLL.var={};ch=1}if(!COLL.show||typeof COLL.show!=='object'){COLL.show={};ch=1}if(typeof COLL.shards!=='number'){COLL.shards=+COLL.shards||0;ch=1}if(typeof COLL.packs!=='number'){COLL.packs=+COLL.packs||0;ch=1}if(ch)saveColl()}
collMig();
const give=rw=>{collMig();COLL.shards+=rw.sh||0;COLL.packs+=rw.pk||0;saveColl()};
const rwTxt=rw=>[rw.sh?`${rw.sh}◆`:'',rw.pk?(rw.pk>1?rw.pk+' packs':'a pack'):''].filter(Boolean).join(' + ');
const myDeck=()=>{const d=dkGet(UI.deck);return d&&dkCheck(d).ok?dkDeck(d):prebuilt(['v','m','c'].includes(UI.deck)?UI.deck:'v')};
const deckLabel=k=>{if(k==='gaunt')return'Gauntlet';const d=dkGet(k);return d?d.name:FAC[['v','m','c'].includes(k)?k:'v'].hero};

/* ---------------- cosmetics: ~3% of pack cards come as a variant. CSS-only static frames (no images, no animation, no blend) ---------------- */
const VARS=['gild','crimson','void','prism'],VARN={gild:'GILDED',crimson:'CRIMSON FRAME',void:'VOID FRAME',prism:'PRISMATIC'},VARP=.03;
let VARR=Math.random;
function varRoll(id){if(!C[id]||!C[id].pk)return null;return VARR()<VARP?VARS[Math.min(3,Math.floor(VARR()*4))]:null}
function varAdd(id,v){collMig();const a=COLL.var[id]||(COLL.var[id]=[]);if(!a.includes(v))a.push(v)}
const varHas=id=>(COLL.var&&COLL.var[id])||[];
function varShow(id){const s=COLL.show&&COLL.show[id];return s&&varHas(id).includes(s)&&owned(id)?s:null}
function varEl(e,v){if(v&&!e.classList.contains('vr')){e.classList.add('vr','vr-'+v);e.insertAdjacentHTML('beforeend','<i class="vfr"></i>')}return e}
function varSet(id,v){collMig();if(v&&!varHas(id).includes(v))return false;if(v)COLL.show[id]=v;else delete COLL.show[id];saveColl();return true}

/* ---------------- crafting: pack cards only (campaign rewards and starters can't be crafted) ---------------- */
const CRAFT={C:40,U:100,R:400,L:1600};
const canCraft=id=>!!(C[id]&&C[id].pk);
function craft(id){if(!canCraft(id))return{ok:0,why:C[id]&&C[id].cmp?'Campaign cards are earned, not crafted':'Starter cards are always yours'};const n=COLL.own[id]||0;
 if(n>=maxC(id))return{ok:0,why:'You already own the maximum'};const c=CRAFT[C[id].r];if(COLL.shards<c)return{ok:0,why:`Needs ${c} Shards`};COLL.shards-=c;COLL.own[id]=n+1;saveColl();return{ok:1,cost:c}}
const inDecks=id=>Math.max(0,...DK.decks.map(d=>d.cards.filter(x=>x===id).length));
function disenchant(id){if(!canCraft(id))return{ok:0,why:'Only pack cards can be disenchanted'};const n=COLL.own[id]||0;if(n<=0)return{ok:0,why:'You own none'};
 const g=SH.dup[C[id].r];COLL.own[id]=n-1;if(!COLL.own[id]){delete COLL.own[id];if(COLL.show)delete COLL.show[id]}COLL.shards+=g;saveColl();return{ok:1,gain:g}}

/* ---------------- campaign ---------------- */
const RULES={mad3:['Frayed Mind','You start with 3 Madness.'],grow:['It Grows','Every third enemy turn, its strongest unit gains +1/+1.'],
 tide:['The Tide','At the start of every turn, the leftmost unit of the side whose turn it is takes 1 damage.'],fleet:['The Dead Fleet','Every third enemy turn, the enemy summons a 1/1 Drone.'],
 whisper:['The Hymn Seeps In','Every fourth enemy turn, you gain 1 Madness.'],bleed:['The Bleeding Moon','Every third turn of yours, you lose 1 Sanity and the enemy restores 1.'],surge:['Hungry Engines','The enemy starts with 1 extra Flux.']};
const CAMP=[
 {id:'v',f:'v',n:'The Drowning Hymn',d:'The sea has started singing. Every ship that hears it turns toward the trench.',ch:[
  {n:'The Last Lighthouse',x:16,y:82,foe:'The Drowned Keepers',esan:-8,rule:['tide'],deck:'v1*2 v2*2 v14*2 v15*2 v22*2 v5*2 v16*2 v3*2 v10*2 v11*2 v4*2 v18*2 n2*2 n3*2 n4',rw:{card:'v24',sh:60},
   pre:'The lighthouse on Kell Reef has burned for three hundred years. Tonight its keepers walked into the sea, still holding their lamps. The light is still moving, under the water.',
   post:'You smash the last lamp. In the dark you hear it clearly for the first time: a hymn, rising from very far below, in a key no throat should reach.'},
  {n:'Psalm of the Pressure',x:44,y:66,foe:'The Kelp Choir',esan:-6,rule:['whisper'],deck:'v10*2 v29*2 v3*2 v13*2 v17*2 v6*2 v15*2 v2*2 v5*2 v28*2 v30*2 v18*2 v7*2 v20 n2*2 n4',rw:{sh:120,pk:1},
   pre:'The fishing fleet anchored over the trench to listen. The nets came up full of hair. The crews are singing now, and none of them can stop.',
   post:'The singing breaks into gasps, then sobbing, then silence. A rowboat drifts out of the fog with a robe folded neatly on its bench, wet and smelling of brine and incense.'},
  {n:'The Brine Abbot',x:76,y:54,foe:'The Brine Abbot',boss:'b_v1',esan:-2,rule:['grow'],deck:'v5*2 v28*2 v2*2 v4*2 v17*2 v11*2 v21 v6*2 v18*2 v7*2 v20*2 v8*2 v31 v26 v12 n3*2',rw:{card:'v25',sh:150,pk:1},
   pre:'The Abbot of the Drowned Rite keeps his monastery in a capsized hull. He has made a sacrament of drowning, and he wants you to kneel in the water with the others.',
   post:'The Abbot sinks with his hands folded, smiling. "She has already heard you," he says, and the water closes over his mouth. Far below, something turns over in its sleep.'},
  {n:'The Sunken Ark',x:40,y:30,foe:'The Ark\'s Last Crew',esan:-6,rule:['mad3'],deck:'v14*2 v22*2 v15*2 v3*2 v29*2 v10*2 v30*2 v17*2 v16*2 v6*2 v18*2 v7*2 v13*2 v20 v21 n10',rw:{card:'v26',sh:100},
   pre:'You dive to the Ark, the pilgrim ship that went down singing. Forty sailors still stand at their posts in the dark, mouths open, and the pressure is already in your skull.',
   post:'The hull groans. The choir falls quiet one voice at a time until only one note is left, long and low, coming from the trench beneath the wreck.'},
  {n:'Mother Below',x:70,y:12,foe:'Mother Below',boss:'b_v2',esan:0,rule:['whisper'],deck:'v27 v9 v23 v32 v8*2 v20*2 v31*2 v7*2 v12 v21*2 v26*2 v18*2 v17*2 v5*2 v28*2 v11*2 v30',rw:{card:'v27',sh:250,pk:2},
   pre:'The trench opens like an eye. She is not rising. The sea is lowering itself to let her see you. The hymn was never a song. It was a lullaby, and it is ending.',
   post:'For one moment the ocean is perfectly still. Then Mother Below closes her eye, and the tide goes out farther than it ever has. You walk home across the sea floor. Behind you, very softly, someone is still humming.'}]},
 {id:'m',f:'m',n:'Signal From The Graveyard Fleet',d:'A distress call from a fleet that died before you were born. It knows your name.',ch:[
  {n:'Distress Beacon',x:14,y:80,foe:'Salvage Drones',esan:-8,rule:['fleet'],deck:'m1*2 m14*2 m2*2 m28*2 m29*2 m3*2 m5*2 m16*2 m18*2 m11*2 m10*2 m6*2 m17*2 n2*2 n9*2',rw:{card:'m24',sh:60},
   pre:'The signal repeats every ninety seconds: coordinates, a crew roster, and your name, read in your own voice. The beacon sits on a wreck that has been dead for four hundred years.',
   post:'The drones fall still. In the beacon\'s log you find the roster. Your name is on it, with a cryo-pod number, and the pod is still running.'},
  {n:'Cold Sleep',x:46,y:70,foe:'The Thawed',esan:-6,rule:['tide'],deck:'m15*2 m2*2 m4*2 m13*2 m19*2 m30*2 m6*2 m21 m7*2 m18*2 m16*2 m8*2 m12*2 m31 n10 n3',rw:{sh:120,pk:1},
   pre:'Pod 0419 is warm. The others are open, and their passengers stand in the corridors with frost on their eyes, waiting for orders from a captain who is long dead.',
   post:'The last of the thawed falls with a sound like breaking glass. The ship\'s quartermaster comes on the intercom: "Inventory discrepancy. One passenger unaccounted for. Correcting."'},
  {n:'Quartermaster HOLLOW',x:78,y:52,foe:'Quartermaster HOLLOW',boss:'b_m1',esan:-2,rule:['grow'],deck:'m2*2 m6*2 m16*2 m8*2 m17*2 m11*2 m12*2 m22 m21*2 m31*2 m7*2 m4*2 m9 m25 n3*2',rw:{card:'m25',sh:150,pk:1},
   pre:'HOLLOW has kept the fleet\'s books for four centuries. Every death is logged, every body is stored, nothing is wasted. You are an error in its ledger, and it does not tolerate errors.',
   post:'HOLLOW\'s core dims. "Ledger balanced," it whispers, and every screen on the ship lights up with the same line: ARK-0 AWAKE.'},
  {n:'The Mourning Lanes',x:40,y:30,foe:'The Grieving Hulls',esan:-6,rule:['fleet','whisper'],deck:'m3*2 m14*2 m18*2 m15*2 m1*2 m10*2 m5*2 m17*2 m7*2 m8*2 m22 m26 m30*2 m19*2 n9*2 n2',rw:{card:'m26',sh:100},
   pre:'Between you and ARK-0 lie the Mourning Lanes, a river of dead ships drifting in formation. Their lights blink in sequence, like a funeral procession that never reaches the grave.',
   post:'The lanes part. The dead ships turn their bows toward you, one by one, in salute or warning. At the center waits a ship made out of other ships.'},
  {n:'ARK-0',x:72,y:12,foe:'ARK-0, the Mourning Fleet',boss:'b_m2',esan:-2,rule:['fleet'],deck:'m27 m9 m23 m32 m31*2 m21*2 m8*2 m22*2 m6*2 m12*2 m17*2 m7*2 m16*2 m2*2 m25 m4*2',rw:{card:'m27',sh:250,pk:2},
   pre:'ARK-0 was the fleet\'s mind. When the crews died it kept them, every voice, every heartbeat, wired into its hull. It called you here to fill the last empty seat.',
   post:'The fleet\'s lights go out one by one, from the outermost wreck inward, like a breath being let go. The last transmission is just a word: "Thank you." Then the signal stops.'}]},
 {id:'c',f:'c',n:'The Feast of Open Wounds',d:'The Red Communion holds its feast once a century. You are invited. You are also the meal.',ch:[
  {n:'The Bell of Teeth',x:16,y:82,foe:'The Bellringers',esan:-8,rule:['bleed'],deck:'c1*2 c28*2 c2*2 c14*2 c3*2 c10*2 c15*2 c29*2 c4*2 c11*2 c5*2 c16*2 c17*2 n2*2 n4',rw:{card:'c24',sh:60},
   pre:'In the hill town of Vey the church bell is made of teeth, and it rings itself. Tonight it rang seven times. The townsfolk have set a long table in the square and set a place with your name.',
   post:'The bell cracks and goes quiet. Under the table you find a map drawn on skin, and on it, circled in something dark, the cathedral where the feast will be held.'},
  {n:'Hymn of Hooks',x:44,y:66,foe:'The Hooked Choir',esan:-6,rule:['mad3'],deck:'c29*2 c13*2 c2*2 c30*2 c6*2 c11*2 c10*2 c18*2 c12*2 c20 c7*2 c3*2 c19*2 c16*2 n10 n4*2',rw:{sh:120,pk:1},
   pre:'The pilgrims walk the road to the cathedral with hooks through their skin, pulled forward by the faith of the one ahead. They sing as they walk, and the song gets into your teeth.',
   post:'You cut the last chain. The pilgrims stop singing and stare at you, then at their hooks, then at the road. One of them laughs, and keeps walking.'},
  {n:'Deaconess Marrow',x:78,y:54,foe:'Deaconess Marrow',boss:'b_c1',esan:-2,rule:['grow'],deck:'c5*2 c30*2 c4*2 c6*2 c12*2 c8*2 c11*2 c13*2 c31*2 c18*2 c20*2 c7*2 c10*2 c25 n3*2',rw:{card:'c25',sh:150,pk:1},
   pre:'The Deaconess guards the cathedral door. She wears a gown sewn from the vestments of every priest who refused the feast. Her hounds have been fed on relics, and they remember the taste of holiness.',
   post:'Marrow falls to her knees and holds out her hands, palms up, as if offering you something. They are empty. "He is already inside you," she whispers. "He always was."'},
  {n:'The Banquet Hall',x:40,y:30,foe:'The Hollowed Guests',esan:-9,rule:['bleed'],deck:'c28*2 c1*2 c14*2 c29*2 c3*2 c15*2 c4*2 c10*2 c11*2 c19*2 c6*2 c16*2 c30*2 c21 c26 n9 n2',rw:{card:'c26',sh:100},
   pre:'The banquet has begun. The guests eat with silver knives, and what they eat is each other, politely, taking turns. They have saved you the seat at the head of the table.',
   post:'The hall falls silent, except for the dripping. At the far end, behind the altar, a curtain of red cloth moves, as though something behind it has taken a breath.'},
  {n:'The Red Sacrament',x:70,y:12,foe:'The Red Sacrament',boss:'b_c2',esan:0,rule:['bleed','grow'],deck:'c27 c9 c22 c32 c20*2 c8*2 c31*2 c12*2 c13*2 c18*2 c7*2 c6*2 c26*2 c10*2 c25*2 c30*2 c4',rw:{card:'c27',sh:250,pk:2},
   pre:'The Sacrament is not a priest and not a god. It is the feast itself, given a body: a thing of open wounds that heals by eating. It has waited a hundred years for this course.',
   post:'The Sacrament closes, wound by wound, until it is only a red stain on the altar stone. The feast is over. You walk out into the dawn with blood on your hands, and for a moment, you are very, very hungry.'}]}];
const CAMPI={};for(const c of CAMP)c.ch.forEach((h,i)=>{h.i=i;h.cid=c.id;CAMPI[c.id+':'+i]=h});
/* enemy decks are handcrafted lists; a power cap keeps them fair against a starter deck: at most 5 Rare/Legendary cards (8 for a boss),
   one copy each of a Rare outside boss fights; the rest is filled from that faction's starter list */
function campDeck(h){const out=[],cap=h.boss?8:5;let rl=0;for(const t of h.deck.split(/\s+/)){if(!t)continue;const[id,n]=t.split('*');if(!C[id])continue;const hi=C[id].r==='R'||C[id].r==='L';for(let k=0;k<(+n||1);k++){if(hi&&(rl>=cap||(!h.boss&&k>0)))continue;if(hi)rl++;out.push(id)}}
 const fill=prebuilt(h.cid).cards;let i=0;while(out.length<30)out.push(fill[i++%fill.length]);return{fac:h.cid,name:h.foe,cards:out.slice(0,30)}}
const campProg=cid=>V8.camp[cid]||(V8.camp[cid]={done:[],best:{}});
const campOpen=(cid,i)=>i===0||campProg(cid).done.includes(i-1);
const DIFR={easy:0,normal:1,nightmare:2};
function campClear(key,dif){const h=CAMPI[key];if(!h)return null;const P=campProg(h.cid),first=!P.done.includes(h.i),m=difMul(dif);const out={first,key,post:h.post,cards:[],sh:0,pk:0};
 if(first){P.done.push(h.i);if(h.rw.card){const id=h.rw.card;COLL.own[id]=maxC(id);out.cards.push(id)}out.sh=Math.round((h.rw.sh||0)*m);out.pk=h.rw.pk||0}
 else out.sh=Math.round((h.rw.sh||0)*.4*m);
 if(!(DIFR[P.best[h.i]]>=DIFR[dif]))P.best[h.i]=dif;give({sh:out.sh,pk:out.pk});saveV8();return out}
const UC={c:'v',sel:0};
function startChapter(cid,i){const h=CAMP.find(c=>c.id===cid).ch[i];if(!campOpen(cid,i)){sfx('err');toast('Clear the previous chapter first');return}auInit();sfx('click');
 startMatch(myDeck(),cid,{foe:campDeck(h),rule:h.rule,esan:h.esan||0,boss:h.boss||null,ch:cid+':'+i,dif:V8.dif,dkey:UI.deck})}
function renderCamp(){const c=CAMP.find(x=>x.id===UC.c)||CAMP[0],P=campProg(c.id);
 $('#ctabs').innerHTML=CAMP.map(x=>`<button class="f-${x.id}${x.id===c.id?' on':''}" data-camp="${x.id}">${x.n}<em>${campProg(x.id).done.length}/${x.ch.length}</em></button>`).join('');
 $('#cdif').innerHTML=Object.keys(DIFS).map(k=>`<button data-dif="${k}" class="${V8.dif===k?'on':''}">${DIFS[k].n}</button>`).join('');
 const opts=['v','m','c',...DK.decks.filter(d=>dkCheck(d).ok).map(d=>d.id)];if(!opts.includes(UI.deck))UI.deck='v';
 $('#cdeck').innerHTML='<span>Deck</span>'+opts.map(k=>`<button data-cdeck="${k}" class="${UI.deck===k?'on':''}"><span data-fit="dk">${esc(deckLabel(k))}</span></button>`).join('');fitScan($('#cdeck'));
 if(!(UC.sel>=0&&UC.sel<c.ch.length)||!campOpen(c.id,UC.sel)){UC.sel=0;for(let i=0;i<c.ch.length;i++)if(campOpen(c.id,i))UC.sel=i}
 const pts=c.ch.map(h=>h.x+','+h.y).join(' ');let m=`<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts}" class="cpath"/></svg><p class="cdesc">${c.d}</p>`;
 c.ch.forEach((h,i)=>{const done=P.done.includes(i),open=campOpen(c.id,i);m+=`<button class="cnode${h.boss?' boss':''}${done?' done':''}${open?'':' lock'}${UC.sel===i?' sel':''}" data-ch="${i}" style="left:${h.x}%;top:${h.y}%${h.boss?`;--bimg:url(${realArt(h.boss)})`:''}" aria-label="Chapter ${i+1}: ${h.n}"><i>${h.boss?'':(i+1)}</i><b>${h.n}</b></button>`});
 const map=$('#cmap');map.className='cmap f-'+c.id;map.innerHTML=m;
 const h=c.ch[UC.sel],done=P.done.includes(UC.sel),best=P.best[UC.sel];
 $('#chp').innerHTML=`<h3>${h.boss?'BOSS · ':''}Chapter ${UC.sel+1}: ${h.n}</h3><p class="story">${h.pre}</p>${done?`<p class="story post">${h.post}</p>`:''}
  <div class="crule">${h.rule.map(r=>`<p><b>${RULES[r][0]}.</b> ${RULES[r][1]}</p>`).join('')}<p><b>${h.boss?'Boss':'Foe'}.</b> ${h.foe} has ${20+(h.esan||0)} Sanity.</p></div>
  <p class="crw"><span>Enemy: <b>${h.foe}</b></span><span>${done?`Cleared${best?' on '+DIFS[best].n:''} · replay for ${Math.round((h.rw.sh||0)*.4*difMul(V8.dif))}◆`:`Reward: ${h.rw.card?'<b class="rc">'+C[h.rw.card].n+'</b> + ':''}${rwTxt({sh:Math.round((h.rw.sh||0)*difMul(V8.dif)),pk:h.rw.pk})}`}</span></p>
  <div class="rowb"><button class="btn" id="chGo">${done?'Replay':'Begin'}</button></div>`;
 $('#chGo').onclick=()=>startChapter(c.id,UC.sel)}
$('#camp').addEventListener('click',e=>{const t=e.target.closest('[data-camp],[data-dif],[data-cdeck],[data-ch]');if(!t)return;
 if(t.dataset.camp){UC.c=t.dataset.camp;UC.sel=-1}else if(t.dataset.dif){V8.dif=t.dataset.dif;saveV8()}else if(t.dataset.cdeck)UI.deck=t.dataset.cdeck;
 else{const i=+t.dataset.ch;if(!campOpen(UC.c,i)){sfx('err');toast('Clear the previous chapter first');return}UC.sel=i}sfx('click');renderCamp()});

/* ---------------- daily quests + 7-day login calendar (local date) ---------------- */
const QT={winf:{n:1,t:q=>`Win a match with ${FAC[q.f].n}`,rw:{sh:70}},win:{n:2,t:()=>'Win 2 matches',rw:{sh:80}},rites:{n:6,t:()=>'Play 6 Rites',rw:{sh:50}},
 units:{n:14,t:()=>'Play 14 units',rw:{sh:50}},dmg:{n:40,t:()=>'Deal 40 damage to enemy minds',rw:{sh:60}},leg:{n:1,t:()=>'Play a Legendary',rw:{sh:60}},
 camp:{n:1,t:()=>'Clear a campaign chapter',rw:{pk:1}},games:{n:3,t:()=>'Finish 3 matches',rw:{sh:50}},hard:{n:1,t:()=>'Win a match on Nightmare',rw:{pk:1}}};
const LOGIN=[{sh:30},{sh:40},{pk:1},{sh:60},{sh:80},{sh:100},{pk:1,sh:150}];
function qMake(k,R){return{k,f:['v','m','c'][Math.floor(R()*3)],n:QT[k].n,p:0,cl:0}}
function genQuests(day){const R=rng(hash('hsq'+day)),ks=Object.keys(QT),out=[];while(out.length<3){const k=ks[Math.floor(R()*ks.length)];if(!out.some(q=>q.k===k))out.push(qMake(k,R))}return out}
function questsToday(){const t=dayKey();if(!V8.quests||V8.quests.day!==t||!Array.isArray(V8.quests.list)){V8.quests={day:t,list:genQuests(t),rr:0};saveV8()}return V8.quests}
function questReroll(i){const Q=questsToday(),q=Q.list[i];if(!q)return{ok:0,why:'No quest'};if(Q.rr)return{ok:0,why:'You already rerolled today'};if(q.p>=q.n)return{ok:0,why:'That quest is complete'};
 const ks=Object.keys(QT).filter(k=>!Q.list.some(x=>x.k===k)),R=rng(hash('hsr'+Q.day+i));Q.list[i]=qMake(ks[Math.floor(R()*ks.length)],R);Q.rr=1;saveV8();return{ok:1}}
function questClaim(i){const q=questsToday().list[i];if(!q||q.p<q.n||q.cl)return{ok:0};q.cl=1;give(QT[q.k].rw);saveV8();return{ok:1,rw:QT[q.k].rw}}
function questProgress(g,win,camp){const Q=questsToday(),st=g.st||{},done=[];for(const q of Q.list){if(q.p>=q.n)continue;const b=q.p;
  switch(q.k){case'winf':if(win&&g.p[0].fac===q.f)q.p++;break;case'win':if(win)q.p++;break;case'rites':q.p+=st.rites||0;break;case'units':q.p+=st.units||0;break;
   case'dmg':q.p+=st.dmg||0;break;case'leg':q.p+=st.leg?1:0;break;case'camp':if(camp)q.p++;break;case'games':q.p++;break;case'hard':if(win&&g.dif==='nightmare')q.p++;break}
  q.p=Math.min(q.n,q.p);if(q.p>=q.n&&b<q.n)done.push(QT[q.k].t(q))}return done}
function loginCheck(){const t=dayKey(),L=V8.login;if(L.last===t)return L;L.day=L.last&&dayAdd(L.last,1)===t?L.day%7+1:1;L.last=t;saveV8();return L}
const loginCan=()=>{const L=loginCheck();return L.claimed!==L.last};
function loginClaim(){const L=loginCheck();if(L.claimed===L.last)return{ok:0};L.claimed=L.last;const rw=LOGIN[L.day-1];give(rw);saveV8();return{ok:1,rw,day:L.day}}
const qClaimable=()=>questsToday().list.filter(q=>q.p>=q.n&&!q.cl).length+(loginCan()?1:0);
function renderQuests(){const L=loginCheck(),Q=questsToday(),can=L.claimed!==L.last;
 $('#qcal').innerHTML=LOGIN.map((r,i)=>{const d=i+1,st=d<L.day||(d===L.day&&!can)?'got':d===L.day?'now':'';return`<div class="qd ${st}"><small>Day ${d}</small><b>${r.pk?'<i class="qpk"></i>':''}${r.sh?r.sh+'◆':''}</b>${st==='got'?'<em>✓</em>':''}</div>`}).join('');
 $('#qlog').innerHTML=can?`<button class="btn" id="qLogin">Claim day ${L.day}: ${rwTxt(LOGIN[L.day-1])}</button>`:`<p class="qnote">Day ${L.day} claimed. Come back tomorrow to keep the streak. Miss a day and it starts over.</p>`;
 $('#qlist').innerHTML=Q.list.map((q,i)=>{const T=QT[q.k],full=q.p>=q.n;return`<div class="qq${full?' full':''}${q.cl?' cl':''}"><div class="qt"><b>${T.t(q)}</b><span>${rwTxt(T.rw)}</span></div><div class="pbarw"><i style="width:${(q.p/q.n*100).toFixed(0)}%"></i></div><div class="qa"><small>${q.p}/${q.n}</small>${q.cl?'<em>Claimed</em>':full?`<button class="btn sm" data-qc="${i}">Claim</button>`:Q.rr?'':`<button class="btn sm ghost" data-qr="${i}">Reroll</button>`}</div></div>`}).join('');
 $('#qfoot').textContent=Q.rr?'Reroll used today. New quests at local midnight.':'You can reroll one quest per day. New quests at local midnight.';
 const lb=$('#qLogin');if(lb)lb.onclick=()=>{const r=loginClaim();if(r.ok){sfx('heal');toast('Day '+r.day+': '+rwTxt(r.rw))}renderQuests();badges()}}
$('#qlist').addEventListener('click',e=>{const c=e.target.closest('[data-qc]'),r=e.target.closest('[data-qr]');
 if(c){const o=questClaim(+c.dataset.qc);if(o.ok){sfx('heal');toast('Quest reward: '+rwTxt(o.rw))}}else if(r){const o=questReroll(+r.dataset.qr);sfx(o.ok?'click':'err');if(!o.ok)toast(o.why)}else return;renderQuests();badges()});

/* ---------------- match bookkeeping: stats, history, quests, campaign ---------------- */
function v8MatchStart(g){const m=g.meta;if(m&&m.ch){const h=CAMPI[m.ch];if(h)setTimeout(()=>{if(G===g)toast(h.rule.map(r=>RULES[r][0]).join(' · ')+(h.boss?` · ${h.foe}: ${20+(h.esan||0)} Sanity`:''),2600)},D(900)+(g.second===0?2300:0))}}
function v8MatchEnd(g){if(g.v8done)return g.v8done;const m=g.meta||{},win=g.winner===0,res=g.winner===-1?'d':win?'w':'l',S=V8.stats;
 S.games++;if(res==='w'){S.wins++;S.streak++;S.best=Math.max(S.best,S.streak)}else{if(res==='l')S.losses++;else S.draws++;S.streak=0}
 const bump=(o,k,nm)=>{const r=o[k]||(o[k]={w:0,l:0,d:0});r[res]=(r[res]||0)+1;if(nm)r.n=nm};const dk=m.dkey||g.p[0].fac;
 bump(S.deck,dk,deckLabel(dk));bump(S.fac,g.p[0].fac);bump(S.dif,g.dif||'normal');
 for(const[id,n]of Object.entries((g.st&&g.st.plays)||{}))S.cards[id]=(S.cards[id]||0)+n;
 S.hist.unshift({t:Date.now(),d:deckLabel(dk),f:g.p[0].fac,o:g.p[1].name,of:g.p[1].fac,dif:g.dif||'normal',r:res,tn:Math.ceil(g.turn/2),mode:m.mode||'quick',ch:m.ch||null});if(S.hist.length>20)S.hist.length=20;
 let camp=null;if(m.mode==='camp'&&win)camp=campClear(m.ch,g.dif);const qd=questProgress(g,win,camp);saveV8();let v9=null;try{v9=v9MatchEnd(g,res)}catch(e){console.warn('v9 end',e)}return g.v8done={res,camp,qd,v9}}
function v8Over(g,x){const b=$('#ovx'),m=g.meta||{};$('#ovm').textContent=m.mode==='camp'?'Campaign':m.mode==='gaunt'?'Continue':m.mode==='week'?'Weekly':'Menu';$('#ovr').textContent=m.mode==='camp'?'Replay chapter':'Play again';$('#ovr').hidden=m.mode==='gaunt';
 let h='';if(x&&x.camp){const c=x.camp;h+=`<p class="ovst">${c.post}</p><div class="ovcr">${c.first?'Chapter cleared':'Chapter replayed'}${c.cards.map(id=>` · <b class="rc">${C[id].n}</b>`).join('')}${c.sh||c.pk?' · '+rwTxt(c)+' ':''}</div>`}
 else if(m.mode==='camp'&&g.winner!==0)h+='<p class="ovst">The chapter is not over. The dark is patient, and so must you be.</p>';
 if(x&&x.qd&&x.qd.length)h+=x.qd.map(t=>`<div class="ovq">Quest complete: ${t}</div>`).join('');try{h+=v9OverHTML(g,x&&x.v9)}catch(e){console.warn(e)}b.innerHTML=h}

/* ---------------- stats screen ---------------- */
const pct=r=>{const n=(r.w||0)+(r.l||0)+(r.d||0);return n?Math.round(((r.w||0)+(r.d||0)*.5)/n*100):0},tot=r=>(r.w||0)+(r.l||0)+(r.d||0);
function renderStats(){const S=V8.stats,all={w:S.wins,l:S.losses,d:S.draws};
 const row=(lab,r,cls='')=>`<div class="srow ${cls}"><span data-fit="dk">${lab}</span><div class="pbarw"><i style="width:${pct(r)}%"></i></div><b>${pct(r)}%</b><small>${r.w||0}-${r.l||0}${r.d?'-'+r.d:''}</small></div>`;
 const top=Object.entries(S.cards).filter(([id])=>C[id]).sort((a,b)=>b[1]-a[1]).slice(0,5);
 $('#stx').innerHTML=`<div class="stiles"><div><b>${S.games}</b><small>Matches</small></div><div><b>${pct(all)}%</b><small>Win rate</small></div><div><b>${S.streak}</b><small>Streak</small></div><div><b>${S.best}</b><small>Best streak</small></div></div>
 <h3>BY FACTION</h3>${['v','m','c'].map(f=>row(FAC[f].n,S.fac[f]||{},'f-'+f)).join('')}
 <h3>BY DIFFICULTY</h3>${Object.keys(DIFS).map(k=>row(DIFS[k].n,S.dif[k]||{})).join('')}
 <h3>BY DECK</h3>${Object.keys(S.deck).length?Object.entries(S.deck).sort((a,b)=>tot(b[1])-tot(a[1])).map(([k,r])=>row(esc(r.n||deckLabel(k)),r)).join(''):'<p class="qnote">No matches yet.</p>'}
 <h3>MOST PLAYED</h3>${top.length?top.map(([id,n])=>`<div class="srow f-${C[id].f}"><span data-fit="dk">${C[id].n}</span><b>×${n}</b></div>`).join(''):'<p class="qnote">Play some cards first.</p>'}
 <h3>LAST ${Math.min(20,S.hist.length)||20} MATCHES</h3>${S.hist.length?'<div class="shist">'+S.hist.map(h=>`<div class="sh ${h.r}"><i>${h.r==='w'?'W':h.r==='l'?'L':'D'}</i><span data-fit="dk">${esc(h.d)} vs ${esc(h.o)}</span><small>${DIFS[h.dif]?DIFS[h.dif].n:''}${h.mode==='camp'?' · Campaign':''} · ${h.tn}t</small></div>`).join('')+'</div>':'<p class="qnote">No matches yet.</p>'}`;fitScan($('#stx'))}

/* ---------------- collection crafting bar + variant toggle ---------------- */
const CF={id:null};
function craftSync(){const b=$('#craft');if(!b)return;const id=CF.id;$$('#cgrid .card.csel').forEach(e=>{if(e.dataset.cid!==id)e.classList.remove('csel')});
 if(!id||!C[id]){b.innerHTML=`<p>Tap a card to craft, disenchant or change its frame. <b>${COLL.shards}◆</b></p>`;return}
 const d=C[id],n=owned(id),cc=canCraft(id),cost=CRAFT[d.r],vs=varHas(id);const el=$(`#cgrid .card[data-cid="${id}"]`);if(el)el.classList.add('csel');
 b.innerHTML=`<div class="cfn"><b data-fit="dk">${d.n}</b><small>${{C:'Common',U:'Uncommon',R:'Rare',L:'Legendary'}[d.r]||''} · owned ${n}/${maxC(id)} · ${COLL.shards}◆</small></div>
 ${cc?`<button class="btn sm" id="cfC" ${n>=maxC(id)||COLL.shards<cost?'disabled':''}>Craft ${cost}◆</button><button class="btn sm ghost" id="cfD" ${n?'':'disabled'}>Disenchant +${SH.dup[d.r]}◆</button>`:`<small class="cfx">${d.cmp?'Campaign reward: earn it in '+CAMP.find(c=>c.id===d.cmp).n:'Starter card: always in your collection'}</small>`}
 ${vs.length&&n?`<div class="seg cfv"><button data-vr="" class="${varShow(id)?'':'on'}">Standard</button>${vs.map(v=>`<button data-vr="${v}" class="${varShow(id)===v?'on':''}">${VARN[v]}</button>`).join('')}</div>`:''}`;fitScan(b)}
$('#cgrid').addEventListener('click',e=>{if(lpJust){lpJust=0;return}const el=e.target.closest('.card[data-cid]');if(!el)return;CF.id=el.dataset.cid;sfx('click');craftSync()});
$('#craft').addEventListener('click',async e=>{const id=CF.id;if(!id)return;const t=e.target.closest('button');if(!t)return;
 if(t.id==='cfC'){const r=craft(id);sfx(r.ok?'heal':'err');toast(r.ok?`Crafted ${C[id].n} (−${r.cost}◆)`:r.why);if(r.ok)renderColl()}
 else if(t.id==='cfD'){const n=owned(id),u=inDecks(id);if(u>n-1&&!await dlg({t:'Disenchant?',x:`A deck uses ${u} ${C[id].n}. It will need a replacement.`,ok:'Disenchant',danger:1}))return;const r=disenchant(id);sfx(r.ok?'click':'err');toast(r.ok?`+${r.gain}◆`:r.why);if(r.ok)renderColl()}
 else if(t.dataset.vr!==undefined){varSet(id,t.dataset.vr||null);sfx('click');renderColl()}});

/* ---------------- hub, badges, quick-play difficulty ---------------- */
function badges(){const q=qClaimable(),p=COLL.packs,set=(id,n)=>{const b=$(id);if(!b)return;const t=n>0?String(n):'';if(b.textContent!==t)b.textContent=t;b.classList.toggle('on',n>0)};set('#bgQ',q);set('#bgPk',p);try{set('#bgW',weekClaimable()?1:0);set('#bgA',achNew())}catch(e){}}
function renderPdif(){const b=$('#pdif');if(b)b.innerHTML=Object.keys(DIFS).map(k=>`<button data-pd="${k}" class="${V8.dif===k?'on':''}">${DIFS[k].n}</button>`).join('')+`<small>${DIFS[V8.dif].d}</small>`}
$('#pdif').addEventListener('click',e=>{const b=e.target.closest('[data-pd]');if(!b)return;V8.dif=b.dataset.pd;saveV8();sfx('click');renderPdif()});
function v8Show(id){try{if(id==='title')badges();if(id==='camp')renderCamp();if(id==='quests')renderQuests();if(id==='stats')renderStats();if(id==='pick')renderPdif();if(id==='coll')craftSync()}catch(e){console.warn('v8 screen',e)}}
$('#bCamp').onclick=()=>{sfx('click');show('camp')};$('#bQuest').onclick=()=>{sfx('click');show('quests')};$('#bStats').onclick=()=>{sfx('click');show('stats')};
loginCheck();questsToday();badges();
Object.defineProperty(window.__hs,'V8',{get(){return V8},set(v){V8=v8Mig(v)},configurable:true});
Object.assign(window.__hs,{v8Mig,collMig,saveV8,DIFS,difMul,dayKey,dayAdd,setNow:t=>{V8NOW=t},CAMP,CAMPI,campDeck,campClear,campOpen,campProg,startChapter,renderCamp,
 QT,LOGIN,genQuests,questsToday,questReroll,questClaim,questProgress,loginCheck,loginClaim,loginCan,qClaimable,renderQuests,v8MatchEnd,renderStats,CRAFT,craft,disenchant,canCraft,
 VARS,VARN,setVarR:f=>{VARR=f||Math.random},varRoll,varAdd,varSet,varShow,CF,craftSync,badges,RULES,myDeck,aiTurnSync,mkUnit,cleanup,endTurn,hideZoom});

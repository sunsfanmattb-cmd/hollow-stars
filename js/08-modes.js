'use strict';
/* ================= v9: battery saver, gauntlet, achievements + card backs / board themes, lore codex, weekly challenge =================
   Saves: localStorage.hsV9 = {v:1,gaunt,ach,cos,codex,week}. Loader is additive (missing fields get defaults), so v8 saves load unchanged.
   RENDERING_RULES.md applies: no new card visuals animate; codex/achievement tiles are flat images, cosmetics are static CSS gradients. */
/* ---------------- lore codex text: one field note per card (the Archive of the Hollow Star) ---------------- */
const LORE={
v1:'Spawn are shed by larger entities the way skin is shed. They drift for centuries and wake only when something warm passes close.',
v2:'Watchers were first logged by deep-survey probes. Every probe that logged one kept transmitting the same frame until its batteries died.',
v3:'Crews describe the whispering as a voice they almost recognise. Most say it sounds like a parent calling them in from the dark.',
v4:'A Leech does not drink blood. It drinks the warmth of remembered days, and leaves its host unable to recall why they ever smiled.',
v5:'Survey teams measured one tendril for eleven kilometres before the instruments refused to go further. It was still tapering.',
v6:'The Choir sings at a frequency the ear cannot hear but the inner ear obeys. Listeners lose their balance first, then their names.',
v7:'The Maw is not a mouth. It is an absence shaped like hunger, and matter falls into it the way water falls downhill.',
v8:'Abyssal theologians hold that the Leviathan dreams the universe. They pray, very quietly, that it never wakes.',
v9:'The Unbound Star was catalogued as a variable sun until the variation resolved into a pupil. It has been looking at us since.',
v10:'Archive rule nine: never stare into a region with no stars. The absence looks back, and it is patient.',
v11:'Rifts open where reality is thinnest: old battlefields, abandoned chapels, the beds of the dying.',
v12:'Recorded once, from very far away. The observing station kept its log for six more seconds, then its log was blank, then it was gone.',
v13:'Those who chase forbidden knowledge report the same thing: every answer arrives twice, and the second time it is wrong.',
m1:'Scrap drones still follow maintenance routines written for crews four centuries dead. They polish the bones carefully.',
m2:'Sentries repeat their last order until their power cells fail. Some have been holding the same corridor since before the war.',
m3:'Seeker swarms hunt heat signatures. They do not distinguish between an engine, an enemy and a child.',
m4:'The Med-Bay unit\'s bedside manner was programmed by a committee. It is soothing until you notice it never blinks.',
m5:'Breach Cutters were built to open derelicts for salvage. They still open things. They no longer check what is inside.',
m6:'Its lantern burns a fuel no one can identify. Shadows thrown by it do not always match the shapes that cast them.',
m7:'The pilot died at the helm. The ship kept her, wired her nerves into the controls, and she has not stopped flying.',
m8:'A defence platform whose targeting AI concluded that everything was a threat. Statistically, it was not wrong.',
m9:'The Ark launched with nine thousand colonists. It arrived with nine thousand passengers. They are not the same thing.',
m10:'Engineers call it redlining. The reactor calls it something else, in a voice heard only through the hull plating.',
m11:'Point-defence lasers turned inward. The Derelict has no enemies outside the hull anymore.',
m12:'The purge vents atmosphere, heat and anything not bolted down. The manifests list the losses as acceptable.',
m13:'A full reboot wipes a mind back to its last stable state. Nobody asks how far back that is.',
c1:'Initiates are given a new name and a small knife. By the end of their first year, they have used both.',
c2:'Bloodletters believe pain is a form of prayer, and that the loudest prayers are answered first.',
c3:'Mutation is a sacrament in the Communion. The faithful change a little every dawn and give thanks for it.',
c4:'Spore carriers exhale constantly. Their breath settles on wounds and teaches the flesh to keep growing.',
c5:'The Knife-Priest blesses the blade before each offering. The blessing is the only part he has ever skipped.',
c6:'Golems are stitched from the congregation\'s dead, and occasionally from members of the congregation who were running late.',
c7:'The Hierophant preaches that every open wound is a door. She has opened a great many doors.',
c8:'The Abomination began as a feast. Over the course of a single night, the feast and the guests became one body.',
c9:'When the Thousand Mouths speaks, every throat in the room moves with it. Silence is no defence. Neither is distance.',
c10:'The oldest rite of the Communion: give something of yourself, and the stars will give something back. They always take more.',
c11:'Communion surgeons can open a vein from across a room. They do it with a word, and the word is your name.',
c12:'At the Feast, everyone eats and everyone is eaten. The Communion considers this the purest form of equality.',
c13:'Ascension is the Communion\'s highest honour. The ascended leave their bodies behind, usually in several places.',
n1:'Distress calls echo through the dark for centuries. Some are still being answered by things that should not answer.',
n2:'Stranded crews keep logs to stay sane. The logs grow shorter each week, then stop, then start again in another hand.',
n3:'She was the only one who came back from the derelict. Her squad still appears on her helmet sensors, standing behind her.',
n4:'Quarantine wardens are chosen for one quality: they do not open doors, no matter who is knocking or what it sounds like.',
n5:'Every beacon promises rescue. The Archive has records of three that were answered by actual rescuers.',
n6:'No crew, no lights, no transponder. Black Vessels appear on scanners only after they have already passed through you.',
v14:'Larvae dream constantly. Sleepers near them share the dream, and wake a little less themselves each morning.',
v15:'The Prophet\'s skull is hollow, yet it preaches. Whatever speaks through it uses the mouth only out of courtesy.',
v16:'Tidal horrors move with the tides of worlds that no longer exist. Their arrival floods stations bone-dry for millennia.',
v17:'Thought Eaters feed on memory. Victims keep their skills but lose the reasons they ever learned them.',
v18:'A shape larger than the station passed beneath it. Sensors registered nothing. Every crew member registered it at once.',
v19:'The astronomer drew the same shape for forty years. When he finished, the stars rearranged themselves to match it.',
v20:'The Colossus weeps endlessly. Each tear contains a face, and each face is still screaming.',
v21:'Beyond the horizon, time stops. Things that fall in are not destroyed. They simply never finish falling.',
v22:'Her suit filled with something black and patient. It wears her now, and still radios for help on the old frequency.',
v23:'Before light, there was the Hungering Dark. Astronomers who study it find their own lamps dimming as they work.',
m14:'Crawlers count the dead as they skitter through the vents. Their tally is always one higher than the manifest.',
m15:'Do not wake the sleepers. Whatever thawed in pod 0419 was not the passenger listed on the label.',
m16:'Grav-lock turrets track body heat. In the cold of a dead ship, the living are very easy to find.',
m17:'Boarding protocol was written by people. The Breacher rewrote it, and removed the part about survivors.',
m18:'The hauler carries cargo from hold to hold, forever. The cargo was colonists. It still is, mostly.',
m19:'Static is the only signal on the dead fleet\'s band that does not try to persuade you of anything.',
m20:'The captain triggered it with his last breath. His hand has not left the switch in four hundred years.',
m21:'The Autosurgeon has completed every procedure in its database and has begun inventing new ones.',
m22:'An orbital strike is the fleet\'s way of saying it cannot come down to meet you, but wishes you well.',
m23:'A thousand ships, every one of them dead, every one of them steered by the same grieving intelligence.',
c14:'The Penitent offered her skin as a first tithe. The Communion accepted, and asked what else she had.',
c15:'The brood eats what the Communion leaves behind. The Communion leaves nothing behind, so the brood is always hungry.',
c16:'The Sisters weep for those they bleed. Their tears are red, and they are, strictly speaking, not tears.',
c17:'The Deacon carves sermons into the faithful. The best of them can be read from across the cathedral.',
c18:'The Wombspawn is always carrying. What it births is always worse than what it was carrying before.',
c19:'Every hand severed in the rite grows back somewhere else. The Communion keeps a very large garden of them.',
c20:'The Choir of Teeth has sung since the cathedral was built. Their hymn has worn the stone walls smooth.',
c21:'The Gospel was bound in the skin of its first reader. Every reader since has felt it trying to choose the next.',
c22:'Every wound in the galaxy is one of her children, and she remembers all their names.',
c23:'The martyrs burned singing. The smoke kept singing for three days after the fire went out.',
n7:'Divers strip the wrecks for parts. Some come back with treasure. Some come back with passengers.',
n8:'Eleven seats. Forty hands on the hatch. The Archive does not record who decided, only that someone did.',
v24:'The Confessor hears the sins of the drowned. He has never once offered absolution, only company.',
v25:'The Eel\'s lure shows each person a face they loved. It has never needed to show anyone the same face twice.',
v26:'The pilgrim ship sank mid-hymn. Its crew have not missed a single note since.',
v27:'Mother Below does not rise. The ocean lowers itself, out of respect, so that she can see.',
m24:'It thawed in the wrong order: nerves first, then cables, then a mind that was never in the pod to begin with.',
m25:'Three crewmen volunteered for the grafting. The Sentinel still answers to all three of their names.',
m26:'The last message from the fleet was a warning. It has been repeating for four centuries. Nobody has ever obeyed it.',
m27:'ARK-0 kept every voice of every crew it lost. It called them home and wired them into a single grieving choir.',
c24:'Seven cuts for the seven mouths of God. The Sisters count each one aloud, and smile on the seventh.',
c25:'The Hound was fed on relics until it could smell holiness. It hunts saints now, and it is very rarely wrong.',
c26:'At the Banquet, the guest of honour is always the main course. Invitations are not optional.',
c27:'The Sacrament is the feast given flesh. It has never gone hungry, because there is always another course.',
v28:'The Saint walked into the sea on pilgrimage. The pilgrimage ended at the bottom, but he never stopped walking.',
v29:'Kelp from the trench grows towards the drowned. Divers find it wound around the wrecks like fingers through hair.',
v30:'Acolytes stitch gills into their own throats to hear the hymn more clearly. Most of them hear nothing else again.',
v31:'The deep folded its bones inward for a thousand years, gently, the way one folds a letter one does not intend to send.',
v32:'The lighthouse kept shining after its keepers walked into the sea. Ships followed it. None came back out.',
m28:'Ghouls strip the ship for parts and graft them onto themselves. The oldest ghouls are mostly ship.',
m29:'He was tethered by his own cable when the airlock cycled. He is still out there, and he still knocks.',
m30:'The Plague Doctor\'s nanites cure everything, eventually, including the condition of being alive.',
m31:'The Colossus\'s pilot died at the controls. The machine has been walking for him ever since.',
m32:'Deck 9 has no end. Crews who walk it hear the lights shut off behind them, one by one, in perfect rhythm.',
c28:'The Novice fills her chalice daily. It has never been full, and she has begun to suspect it never will be.',
c29:'The Matron drags the congregation to service on hooks. Attendance has never been better.',
c30:'The Idol weeps for the faithful. Its tears are warm and red, and they heal, and the healed are never quite the same.',
c31:'The Martyr died for the faith. Then he crawled out of what was left and kept believing.',
c32:'Every tooth in the Crown was taken from a king. Every king it touches becomes a mouth.',
n9:'His eyes went black on the third wreck. He kept the helmet on, and nobody has asked him to take it off.',
n10:'The Navigator charts stars that are not there. Each new chart shows them a little closer.',
n11:'She saw the Hollow Star with her own eyes. In her visor\'s reflection, the star saw her first.',
v33:'Echoes of the drowned surface in pairs. Divers learn to follow only the one that is not breathing.',
v34:'The Maw keeps everything it swallows. Late at night, the swallowed can be heard taking roll call.',
v35:'Blackwater does not drown. It soaks into muscle and teaches it to forget what strength was for.',
m33:'Ward-lattices were designed to protect cargo. They now protect whatever is closest, without discrimination.',
m34:'A maintenance psalm broadcast on every channel. The machines obey it. So, it seems, does the rust.',
m35:'It was built to clear wreckage. Somewhere along the way it stopped checking whether the wreckage was still moving.',
c33:'Every word the Preacher speaks leaves a wound that will not close. Her sermons are very short.',
c34:'The Gutter Hound eats from under the Banquet table. Lately, it has started eating from the chairs.',
c35:'There is always room for another course. The Communion ensures there is always another course.',
n12:'She found the last working shield on the station and has not taken it off in a year. Not to sleep. Not to eat.',
n13:'No survey has found where the Pathless began. Crews who cross its road say the nightmares stop afterwards. Someone else\'s begin.',
tD:'Drones of the dead fleet. They run maintenance cycles on whatever remains, including the crews.',
tS:'Survivors. They got out. They stopped asking what they got out of.',
tC:'Spawnlings are born hungry from open wounds. They already know their parent\'s name, and yours.'};
/* ---------------- save ---------------- */
const V9D=()=>({v:1,gaunt:{run:null,best:0,runs:0,wins:0,done:0,last:null},ach:{got:{},seen:0,ctr:{}},cos:{back:'veil',theme:'none'},codex:{p:{},f:{}},week:{key:'',wins:0,games:0,claimed:0,total:0}});
function v9Mig(o){const d=V9D();if(!o||typeof o!=='object'||o.v!==1)return d;for(const k of Object.keys(d)){if(!o[k]||typeof o[k]!=='object'||Array.isArray(o[k]))o[k]=d[k];else for(const j of Object.keys(d[k]))if(o[k][j]===undefined)o[k][j]=d[k][j]}
 for(const k of['got','ctr'])if(!o.ach[k]||typeof o.ach[k]!=='object')o.ach[k]={};for(const k of['p','f'])if(!o.codex[k]||typeof o.codex[k]!=='object')o.codex[k]={};return o}
let V9=(()=>{let o=null;try{o=JSON.parse(localStorage.getItem('hsV9')||'null')}catch(e){}return v9Mig(o)})();
/* first v9 run (v8 save): record cards the player already knows (pack cards owned + cards in saved decks) */
if(!V9.codex.o){V9.codex.o={};try{for(const k in COLL.own)if(COLL.own[k]>0&&C[k])V9.codex.o[k]=1;for(const d of (DK.decks||[]))for(const k of d.cards||[])if(C[k])V9.codex.o[k]=1}catch(e){}}
function saveV9(){try{localStorage.setItem('hsV9',JSON.stringify(V9))}catch(e){}}
const ctr=(k,n=1)=>{V9.ach.ctr[k]=(V9.ach.ctr[k]||0)+n};

/* ---------------- battery saver (state object BAT lives in d.js) ---------------- */
function batPoke(){BAT.last=performance.now();if(BAT.idle)batWake()}
function batBusy(){return !!(window.__hsNoIdle||UI.aiRun||UI.cin||FX.run||P||$('#zoom').classList.contains('on')||$('#pstage').classList.contains('on')||$('#dlg').classList.contains('on'))}
function batSleep(){if(BAT.idle||BAT.hid)return;BAT.idle=1;BAT.sleeps++;document.body.classList.add('idle');vidSync()}
function batWake(){BAT.idle=0;if(!BAT.hid){document.body.classList.remove('idle');BAT.wakes++;bgKick();qKick();vidSync()}}
function batHide(){if(BAT.hid)return;BAT.hid=1;document.body.classList.add('idle');auSusp();vidSync();gyroOff()}
function batShow(){if(!BAT.hid)return;BAT.hid=0;BAT.idle=0;BAT.last=performance.now();document.body.classList.remove('idle');auRes();bgKick();qKick();vidSync();if(ZT.c)gyroOn()}
setInterval(()=>{if(BAT.hid)return;if(document.hidden){batHide();return}if(!BAT.idle&&performance.now()-BAT.last>BAT.IDLE){if(batBusy())BAT.last=performance.now()-BAT.IDLE+1500;else batSleep()}},1000);
document.addEventListener('visibilitychange',()=>document.hidden?batHide():batShow());
addEventListener('pagehide',batHide);addEventListener('pageshow',()=>{if(!document.hidden)batShow()});
document.addEventListener('freeze',batHide);document.addEventListener('resume',()=>{if(!document.hidden)batShow()});
for(const ev of['keydown','wheel','touchstart','pointermove'])addEventListener(ev,()=>{if(BAT.idle)batPoke();else BAT.last=performance.now()},{passive:true,capture:true});
window.hsBat={pause:batHide,resume:batShow};/* Android: MainActivity onPause/onResume -> shim -> hsBat */

/* ---------------- codex (bestiary): unlocks when you play a card or face it ---------------- */
function v9Fx(f){if(!G||G.sim||UI.auto)return;const C9=V9.codex;let id=null,pi=null;
 if(f.k==='play'){id=f.cid;pi=f.pi;if(pi===0&&f.e)ctr('echo')}else if(f.k==='summon'){const u=findU(G,+f.id.slice(1));if(u){id=u.id;pi=u.o}}else return;
 if(!id||!C[id])return;if(f.k==='play'&&pi===0)for(const k of C[id].k||[])if(['echo','devour','corrupt','ward'].includes(k))V9.ach.ctr['k_'+k]=1;const o=pi===0?C9.p:C9.f,first=!C9.p[id]&&!C9.f[id];o[id]=(o[id]||0)+1;if(first){V9.codex.nw=(V9.codex.nw||0)+1}clearTimeout(v9Fx.t);v9Fx.t=setTimeout(saveV9,800)}
const CDXI=()=>[...COL,'tD','tS','tC'];
const cdxHas=id=>!!(V9.codex.p[id]||V9.codex.f[id]||(C[id]&&C[id].t!=='x'&&!C[id].tok&&C[id].r!=='T'&&V9.codex.o&&V9.codex.o[id]));
const cdxN=()=>CDXI().filter(cdxHas).length;
const UX={cdf:'v',cdsel:null,gtf:'v',achTab:'ach'};
function renderCodex(){const ids=CDXI(),f=UX.cdf,n=cdxN(),list=ids.filter(id=>C[id].f===f);
 $('#cdtabs').innerHTML=['v','m','c','n'].map(k=>`<button class="f-${k}${k===f?' on':''}" data-cdf="${k}">${FAC[k].n}<em>${ids.filter(i=>C[i].f===k&&cdxHas(i)).length}/${ids.filter(i=>C[i].f===k).length}</em></button>`).join('');
 $('#cdprog').innerHTML=`<b>${n}</b>/${ids.length} entries recorded<div class="pbarw"><i style="width:${(n/ids.length*100).toFixed(0)}%"></i></div>`;
 $('#cdfac').innerHTML=`<b>${FAC[f].n}.</b> ${FAC[f].d}`;
 $('#cdgrid').innerHTML=list.map(id=>{const d=C[id],h=cdxHas(id);return`<button class="cdt q${d.r}${h?'':' unk'}${UX.cdsel===id?' on':''}" data-cd="${id}" aria-label="${h?esc(d.n):'Unknown entry'}"><i style="${h?`background-image:url(${realArtS(id)})`:''}"></i><span>${h?d.n:'???'}</span></button>`}).join('');
 renderCdx()}
function renderCdx(){const id=UX.cdsel,b=$('#cdx');if(!id||!C[id]){b.innerHTML='<p class="qnote">Tap an entry. New entries are recorded the first time you play a card or face it in a match.</p>';b.classList.remove('on');return}
 const d=C[id],h=cdxHas(id);b.classList.add('on');
 b.innerHTML=h?`<div class="cdart" style="background-image:url(${realArt(id)}),url(${realArtS(id)})"></div><div class="cdtx"><h3>${d.n}</h3><p class="cdty">${FAC[d.f].n} · ${d.t==='u'?FAC[d.f].s+' '+d.a+'/'+d.h:'Rite'} · ${{C:'Common',U:'Uncommon',R:'Rare',L:'Legendary',T:'Token'}[d.r]}</p>${cardText(d)?`<p class="cdrt">${cardText(d)}</p>`:''}${d.fl?`<p class="fl">“${d.fl}”</p>`:''}<p class="cdlore">${LORE[id]||''}</p><p class="cdst">Played by you ×${V9.codex.p[id]||0} · Faced ×${V9.codex.f[id]||0}</p></div>`
  :`<div class="cdart unk"></div><div class="cdtx"><h3>Unknown entry</h3><p class="cdlore">The Archive holds no record of this ${FAC[d.f].s.toLowerCase()} yet. Play it, or face it across the board, to record it.</p></div>`}
$('#codex').addEventListener('click',e=>{const t=e.target.closest('[data-cdf],[data-cd]');if(!t)return;sfx('click');if(t.dataset.cdf){UX.cdf=t.dataset.cdf;UX.cdsel=null;renderCodex()}else{UX.cdsel=t.dataset.cd;$$('#cdgrid .cdt.on').forEach(x=>x.classList.remove('on'));t.classList.add('on');renderCdx();if(innerWidth<900)$('#cdx').scrollIntoView({block:'nearest',behavior:'smooth'})}});

/* ---------------- weekly challenge: deterministic modifier per ISO week (local calendar) ---------------- */
const WK=[{id:'w_mad',n:'Madness Doubles',d:'All Madness gained is doubled, for both sides. Minds break fast.'},{id:'w_san',n:'Thick Skulls',d:'Both sides start with 25 Sanity.'},
 {id:'w_flux',n:'Overcharged Void',d:'Both sides start with 1 extra Flux.'},{id:'w_swift',n:'The Hunt',d:'Every unit has Swift.'},{id:'w_draw',n:'Torrent of Visions',d:'From your second turn on, each side draws 2 cards a turn.'},
 {id:'w_echo',n:'Resonance',d:'Every Rite has Echo.'},{id:'w_glass',n:'Glass Bodies',d:'Every unit gets +2 Attack and −1 Health.'},{id:'w_ward',n:'Warded Dark',d:'Every unit arrives with Ward.'}];
const WKN=3,WKRW={sh:250,pk:1},WKWIN=30;
function weekKey(t){const d=t||v8now(),u=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())),dn=u.getUTCDay()||7;u.setUTCDate(u.getUTCDate()+4-dn);const y=u.getUTCFullYear(),w=Math.ceil(((u-Date.UTC(y,0,1))/864e5+1)/7);return y+'-W'+String(w).padStart(2,'0')}
const weekMod=k=>WK[hash('hsw'+(k||weekKey()))%WK.length];
function weekState(){const k=weekKey(),W=V9.week;if(W.key!==k){W.key=k;W.wins=0;W.games=0;W.claimed=0;saveV9()}return W}
const weekClaimable=()=>{const W=weekState();return W.wins>=WKN&&!W.claimed};
function weekClaim(){const W=weekState();if(W.wins<WKN||W.claimed)return{ok:0};W.claimed=1;W.total=(W.total||0)+1;give(WKRW);saveV9();achCheck();return{ok:1,rw:WKRW}}
function weekFoe(){const W=weekState(),R=rng(hash('hswf'+W.key+':'+W.games));return['v','m','c'][Math.floor(R()*3)]}
function weekPlay(){auInit();sfx('click');const m=weekMod();startMatch(myDeck(),weekFoe(),{rule:[m.id],mode:'week',dif:'normal',dkey:UI.deck})}
function renderWeekly(){const W=weekState(),m=weekMod(),k=W.key,opts=['v','m','c',...DK.decks.filter(d=>dkCheck(d).ok).map(d=>d.id)];if(!opts.includes(UI.deck))UI.deck='v';
 const now=v8now(),dn=now.getDay()||7,left=8-dn;
 $('#wkx').innerHTML=`<div class="wkmod"><small>WEEK ${k.split('-W')[1]} · ${k.split('-')[0]} · ${left} day${left>1?'s':''} left</small><h3>${m.n}</h3><p>${m.d}</p></div>
 <div class="wkp"><div class="pips">${Array.from({length:WKN},(_,i)=>`<i class="${i<W.wins?'on':''}"></i>`).join('')}</div><p>Win ${WKN} matches under this week's rule. Each win pays a bonus ${WKWIN}◆. Reward: <b>${rwTxt(WKRW)}</b>.</p></div>
 <div class="seg cdeck" id="wkdeck"><span>Deck</span>${opts.map(o=>`<button data-wdeck="${o}" class="${UI.deck===o?'on':''}"><span data-fit="dk">${esc(deckLabel(o))}</span></button>`).join('')}</div>
 <div class="rowb">${W.claimed?'<p class="qnote">Claimed. A new rule arrives on Monday.</p>':W.wins>=WKN?'<button class="btn" id="wkClaim">Claim '+rwTxt(WKRW)+'</button>':'<button class="btn" id="wkGo">Face the Week</button>'}</div>
 <p class="qnote">${W.games} played this week · ${W.total||0} weekly challenges completed</p>`;fitScan($('#wkx'))}
$('#weekly').addEventListener('click',e=>{const t=e.target.closest('#wkGo,#wkClaim,[data-wdeck]');if(!t)return;if(t.id==='wkGo'){weekPlay();return}
 if(t.id==='wkClaim'){const r=weekClaim();if(r.ok){sfx('heal');toast('Weekly reward: '+rwTxt(r.rw))}}else{UI.deck=t.dataset.wdeck;sfx('click')}renderWeekly();badges()});

/* ---------------- gauntlet: roguelike run, escalating AI, draft a card after each win, 3 losses end it ---------------- */
const GT={MAXW:12,MAXL:3,FOES:{v:['Drowned Pilgrim','Trench Cantor','Hierophant of the Deep','The Abyssal Tide'],m:['Scavenger Swarm','Hull-Warden Prime','Mourning Ark Remnant','The Iron Requiem'],c:['Hook-Pilgrim','Deacon of Teeth','Matron of the Feast','The Red Choir']}};
const gtRun=()=>V9.gaunt.run;
function gtStart(f){if(!['v','m','c'].includes(f))f='v';V9.gaunt.run={f,deck:prebuilt(f).cards.slice(),w:0,l:0,seed:(Date.now()%1e9)|0,pick:null,log:[]};V9.gaunt.runs++;saveV9();return V9.gaunt.run}
function gtFoe(run){const n=run.w,R=rng(hash('gtf'+run.seed+':'+n)),f=['v','m','c'][Math.floor(R()*3)],tier=Math.min(3,Math.floor(n/3));
 const dif=n<2?'easy':n<7?'normal':'nightmare',esan=n<2?-5:n<4?-2:Math.min(6,(n-4)*1.5|0);
 const pool=[...PACK,...CAMPC].filter(id=>C[id].f===f).sort();const cards=prebuilt(f).cards.slice();const k=Math.min(14,2+n*2);
 const slots=cards.map((c,i)=>C[c].f==='n'||C[c].r==='C'?i:-1).filter(i=>i>=0);for(let i=0;i<k&&slots.length;i++){const id=pool[Math.floor(R()*pool.length)];if(C[id].r==='L'&&(cards.includes(id)||n<5))continue;cards[slots.shift()]=id}
 return{fac:f,name:GT.FOES[f][tier],cards,dif,esan,n}}
function gtOffer(run){const R=rng(hash('gto'+run.seed+':'+run.w)),n=run.w,f=run.f,pool=[...BASE,...PACK].filter(id=>(C[id].f===f||C[id].f==='n')&&!(C[id].r==='L'&&run.deck.includes(id)));
 const wt={C:Math.max(.2,.6-n*.04),U:.28,R:Math.min(.35,.1+n*.02),L:Math.min(.12,.02+n*.008)},out=[];
 for(let t=0;t<40&&out.length<3;t++){let x=R()*(wt.C+wt.U+wt.R+wt.L),r='C';for(const k of['C','U','R','L']){if(x<wt[k]){r=k;break}x-=wt[k]}const c=pool.filter(id=>C[id].r===r&&!out.includes(id));if(c.length)out.push(c[Math.floor(R()*c.length)])}
 return out}
function gtReplace(run){const sc=id=>(C[id].f==='n'?0:10)+{C:0,U:3,R:6,L:9}[C[id].r]+C[id].c*.1;let j=0;for(let i=1;i<run.deck.length;i++)if(sc(run.deck[i])<sc(run.deck[j]))j=i;return j}
function gtPick(id){const run=gtRun();if(!run||!run.pick)return{ok:0};if(id&&!run.pick.includes(id))return{ok:0};let out=null;if(id){const j=gtReplace(run);out=run.deck[j];run.deck[j]=id;run.log.push(id)}run.pick=null;saveV9();return{ok:1,out}}
function gtEnd(run){const G9=V9.gaunt,w=run.w,sh=25*w+(w>=GT.MAXW?300:0),pk=w>=GT.MAXW?3:w>=7?2:w>=4?1:0;G9.best=Math.max(G9.best,w);G9.wins+=w;G9.done++;G9.last={w,l:run.l,f:run.f,sh,pk,t:Date.now()};G9.run=null;give({sh,pk});saveV9();return G9.last}
function gtFight(){const run=gtRun();if(!run)return;if(run.pick){toast('Choose your reward first');return}auInit();sfx('click');const foe=gtFoe(run);
 startMatch({fac:run.f,name:'Gauntlet · '+FAC[run.f].hero,cards:run.deck.slice()},foe.fac,{foe:{fac:foe.fac,name:foe.name,cards:foe.cards},dif:foe.dif,esan:foe.esan,mode:'gaunt',dkey:'gaunt'})}
function gtResult(g,res){const run=gtRun();if(!run||g.gtDone)return null;g.gtDone=1;if(res==='d')return{draw:1,run};if(res==='w')run.w++;else run.l++;
 if(run.l>=GT.MAXL||run.w>=GT.MAXW){const e=gtEnd(run);return{end:e,win:res==='w'}}run.pick=res==='w'?gtOffer(run):null;saveV9();return{win:res==='w',run}}
function renderGaunt(){const G9=V9.gaunt,run=gtRun(),b=$('#gtx');
 if(!run){const L=G9.last;b.innerHTML=`<p class="gtin">Twelve foes wait in the dark, each worse than the last. Draft a card after every victory. Three defeats and the run is over.</p>
  ${L?`<div class="gtlast">Last run: <b>${L.w} wins</b> with ${FAC[L.f].n} · earned ${rwTxt(L)||'nothing'}</div>`:''}
  <div class="stiles"><div><b>${G9.best}</b><small>Best run</small></div><div><b>${G9.done}</b><small>Runs</small></div><div><b>${G9.wins}</b><small>Total wins</small></div><div><b>${GT.MAXW}</b><small>To conquer</small></div></div>
  <h3>CHOOSE YOUR HERO</h3><div class="seg gtf">${['v','m','c'].map(f=>`<button class="f-${f}${UX.gtf===f?' on':''}" data-gtf="${f}">${FAC[f].n}</button>`).join('')}</div>
  <p class="qnote">You start with the starter deck of ${FAC[UX.gtf].n}. Rewards: 25◆ per win, a pack at 4 wins, two at 7, and three packs + 300◆ for all 12.</p>
  <div class="rowb"><button class="btn" id="gtGo">Begin the Gauntlet</button></div>`;return}
 const foe=gtFoe(run),pips=(n,m,c)=>Array.from({length:m},(_,i)=>`<i class="${i<n?c:''}"></i>`).join('');
 let h=`<div class="gthd f-${run.f}"><div><small>WINS</small><div class="pips w">${pips(run.w,GT.MAXW,'on')}</div></div><div><small>LIVES</small><div class="pips l">${pips(GT.MAXL-run.l,GT.MAXL,'on')}</div></div></div>`;
 if(run.pick){h+=`<h3>VICTORY ${run.w}: CLAIM A CARD</h3><p class="qnote">It replaces the weakest card in your deck (${C[run.deck[gtReplace(run)]].n}).</p><div class="gtpick" id="gtpick"></div><div class="rowb"><button class="btn ghost sm" id="gtSkip">Skip</button></div>`}
 else h+=`<div class="gtfoe f-${foe.fac}"><div class="ta" style="background-image:${heroBG(foe.fac)}"></div><div><small>FOE ${run.w+1} OF ${GT.MAXW}</small><b>${foe.name}</b><p>${FAC[foe.fac].n} · ${DIFS[foe.dif].n} · ${20+foe.esan} Sanity</p></div></div>
  <div class="rowb"><button class="btn ghost sm" id="gtQuit">Abandon run</button><button class="btn" id="gtFight">Fight</button></div>`;
 h+=`<h3>YOUR DECK · ${run.deck.length}</h3><div class="gtdeck">${[...new Set(run.deck)].sort((a,b)=>C[a].c-C[b].c).map(id=>`<span class="f-${C[id].f}${run.log.includes(id)?' new':''}"><b>${C[id].c}</b>${C[id].n}${run.deck.filter(x=>x===id).length>1?' ×'+run.deck.filter(x=>x===id).length:''}</span>`).join('')}</div>`;
 b.innerHTML=h;if(run.pick){const p=$('#gtpick');for(const id of run.pick){const e=cardEl(id);e.dataset.gpick=id;p.appendChild(e)}}}
$('#gaunt').addEventListener('click',async e=>{const t=e.target.closest('[data-gtf],#gtGo,#gtFight,#gtQuit,#gtSkip,[data-gpick]');if(!t)return;
 if(t.dataset.gtf){UX.gtf=t.dataset.gtf;sfx('click');renderGaunt();return}
 if(t.id==='gtGo'){gtStart(UX.gtf);sfx('heal');renderGaunt();return}
 if(t.id==='gtFight'){gtFight();return}
 if(t.id==='gtQuit'){if(!await dlg({t:'Abandon the run?',x:'You keep the rewards for the wins so far.',ok:'Abandon',danger:1}))return;const r=gtEnd(gtRun());toast(`Run over: ${r.w} wins · ${rwTxt(r)||'no reward'}`);achCheck();renderGaunt();return}
 if(t.id==='gtSkip'){gtPick(null);sfx('click');renderGaunt();return}
 if(t.dataset.gpick){if(lpJust){lpJust=0;return}const r=gtPick(t.dataset.gpick);if(r.ok){sfx('rare');toast(`${C[t.dataset.gpick].n} joins your deck${r.out?' (replaces '+C[r.out].n+')':''}`)}renderGaunt()}});

/* ---------------- achievements + cosmetics (card backs, board themes: static CSS gradients, no art, no animation) ---------------- */
const CB={veil:{n:'The Veil',css:null},
 bone:{n:'Ossuary',css:'repeating-linear-gradient(45deg,#d8ccb418 0 2px,#0000 2px 10px),repeating-linear-gradient(-45deg,#d8ccb418 0 2px,#0000 2px 10px),radial-gradient(ellipse at 50% 45%,#4a4034,#120e0a 72%)'},
 eye:{n:'The Open Eye',css:'radial-gradient(circle at 50% 50%,#050203 0 7%,#ff3a2a 8% 9.5%,#7a0814 10% 17%,#0000 18%),radial-gradient(ellipse 46% 22% at 50% 50%,#d8c8b0 0 92%,#0000 95%),radial-gradient(circle at 50% 50%,#2a0a10,#060203 75%)'},
 abyss:{n:'Abyssal Spiral',css:'repeating-radial-gradient(circle at 50% 50%,#7a40c033 0 3px,#0000 3px 14px),radial-gradient(circle at 50% 50%,#3a1868,#08040e 70%)'},
 rust:{n:'Rusted Hull',css:'repeating-linear-gradient(0deg,#0006 0 1px,#0000 1px 18px),repeating-linear-gradient(90deg,#0006 0 1px,#0000 1px 22px),linear-gradient(160deg,#5a3418,#2a1a10 45%,#10161a)'},
 flesh:{n:'Red Communion',css:'radial-gradient(ellipse at 30% 20%,#c0182e55,#0000 45%),radial-gradient(ellipse at 70% 80%,#7a081455,#0000 50%),repeating-linear-gradient(115deg,#3a0610 0 6px,#2a040a 6px 11px)'},
 gold:{n:'Nightmare Gilt',css:'repeating-conic-gradient(from 0deg at 50% 50%,#c8a07033 0 4deg,#0000 4deg 15deg),radial-gradient(circle at 50% 50%,#3a2810,#0a0604 72%)'},
 void:{n:'Starless Void',css:'radial-gradient(circle at 20% 30%,#fff8 0 .6px,#0000 1px),radial-gradient(circle at 70% 60%,#fff6 0 .6px,#0000 1px),radial-gradient(circle at 40% 80%,#fff5 0 .5px,#0000 1px),radial-gradient(circle at 50% 50%,#000 0 26%,#4affc022 27% 28%,#0000 29%),linear-gradient(#030306,#030306)'},
 chain:{n:'Gauntlet Chains',css:'repeating-linear-gradient(45deg,#8a7a6a30 0 3px,#0000 3px 7px,#8a7a6a18 7px 9px,#0000 9px 16px),radial-gradient(circle at 50% 50%,#2a2226,#08060a 75%)'},
 sigil:{n:'Pack Sigil',css:'repeating-conic-gradient(from 22.5deg at 50% 50%,#b070ff26 0 10deg,#0000 10deg 45deg),radial-gradient(circle at 50% 50%,#2a1040,#06030a 70%)'},
 ritual:{n:'Weekly Rite',css:'radial-gradient(circle at 50% 50%,#0000 0 30%,#c8a07055 31% 32%,#0000 33% 40%,#c8a07033 41% 41.6%,#0000 42%),repeating-conic-gradient(from 0deg at 50% 50%,#c0182e22 0 30deg,#0000 30deg 60deg),radial-gradient(circle,#1a0a0c,#050203)'}};
const TH={none:{n:'Faction Mat',css:null},
 ash:{n:'Ashfall',css:'linear-gradient(180deg,#8a807018,#0000 40%,#00000040),radial-gradient(ellipse at 50% 120%,#a09888 0,#0000 60%)'},
 blood:{n:'Blood Moon',css:'radial-gradient(circle at 80% 8%,#ff3a2a40 0 4%,#c0182e18 5% 22%,#0000 40%),linear-gradient(180deg,#3a000822,#2a000644)'},
 starless:{n:'Starless',css:'radial-gradient(ellipse at 50% 50%,#0000 30%,#000a 80%),linear-gradient(#00000055,#00000055)'},
 tide:{n:'The Drowning Tide',css:'linear-gradient(180deg,#0a3a4a22,#0000 35%,#06202a55),radial-gradient(ellipse at 50% 100%,#2affc018,#0000 60%)'},
 hull:{n:'Dead Hull',css:'repeating-linear-gradient(90deg,#9ef8ff08 0 1px,#0000 1px 64px),linear-gradient(180deg,#06141a40,#0000 50%,#06141a50)'},
 cathedral:{n:'Red Cathedral',css:'radial-gradient(ellipse 60% 40% at 50% 0%,#c0182e30,#0000 70%),linear-gradient(180deg,#0000 50%,#2a040a50)'},
 aurora:{n:'Hollow Aurora',css:'linear-gradient(170deg,#4affc014,#0000 30%,#a050ff14 55%,#0000 75%,#ff3a6a10)'},
 vellum:{n:'Archive Vellum',css:'radial-gradient(ellipse at 50% 50%,#d8c09018,#0000 70%),linear-gradient(180deg,#2a201418,#2a201440)'},
 eclipse:{n:'Eclipse',css:'radial-gradient(circle at 50% 42%,#000 0 14%,#ffd07030 15%,#ff8a3a10 22%,#0000 36%),radial-gradient(ellipse at 50% 50%,#0000 40%,#0008)'}};
const AS=()=>V8.stats,AC=k=>V9.ach.ctr[k]||0,facW=f=>(AS().fac[f]&&AS().fac[f].w)||0,campDone=f=>((V8.camp[f]||{}).done||[]).length;
const ACH=[
 ['first','First Blood','Win your first match.',()=>AS().wins>=1,{sh:50}],
 ['w10','Hardened','Win 10 matches.',()=>AS().wins>=10,{back:'bone'}],
 ['w50','Veteran of the Dark','Win 50 matches.',()=>AS().wins>=50,{theme:'ash'}],
 ['g100','Centurion','Finish 100 matches.',()=>AS().games>=100,{theme:'starless'}],
 ['st5','Unbroken','Win 5 matches in a row.',()=>AS().best>=5,{back:'eye'}],
 ['fv','Voice of the Abyss','Win 5 matches with The Abyss.',()=>facW('v')>=5,{back:'abyss'}],
 ['fm','Ghost in the Machine','Win 5 matches with The Derelict.',()=>facW('m')>=5,{back:'rust'}],
 ['fc','Communicant','Win 5 matches with The Red Communion.',()=>facW('c')>=5,{back:'flesh'}],
 ['n1','Into the Nightmare','Win a match on Nightmare.',()=>((AS().dif.nightmare||{}).w||0)>=1,{theme:'blood'}],
 ['n10','Nightmare Lord','Win 10 matches on Nightmare.',()=>((AS().dif.nightmare||{}).w||0)>=10,{back:'gold'}],
 ['mad','Mindbreaker','Win by driving the enemy to 10 Madness.',()=>AC('madwin')>=1,{sh:60}],
 ['flaw','Untouched','Win a match with 20 or more Sanity left.',()=>AC('flaw')>=1,{sh:80}],
 ['c1','The First Chapter','Clear a campaign chapter.',()=>['v','m','c'].some(f=>campDone(f)>=1),{sh:60}],
 ['cv','The Hymn Ends','Complete The Drowning Hymn.',()=>campDone('v')>=5,{theme:'tide'}],
 ['cm','Signal Lost','Complete Signal From The Graveyard Fleet.',()=>campDone('m')>=5,{theme:'hull'}],
 ['cc','The Feast Is Over','Complete The Feast of Open Wounds.',()=>campDone('c')>=5,{theme:'cathedral'}],
 ['call','Hollow Saint','Complete all three campaigns.',()=>['v','m','c'].every(f=>campDone(f)>=5),{back:'void'}],
 ['gt3','Into the Gauntlet','Reach 3 wins in one Gauntlet run.',()=>V9.gaunt.best>=3,{sh:100}],
 ['gt7','Chained to the Dark','Reach 7 wins in one Gauntlet run.',()=>V9.gaunt.best>=7,{back:'chain'}],
 ['gt12','Gauntlet Conqueror','Win all 12 Gauntlet matches in one run.',()=>V9.gaunt.best>=12,{theme:'aurora'}],
 ['p5','Pack Rat','Open 5 booster packs.',()=>(COLL.opened||0)>=5,{sh:50}],
 ['p25','Sigil Hoarder','Open 25 booster packs.',()=>(COLL.opened||0)>=25,{back:'sigil'}],
 ['leg','Legend Pulled','Own a pack Legendary.',()=>PACK.some(id=>C[id].r==='L'&&owned(id)),{sh:80}],
 ['half','Half the Dark','Discover half of the pack cards.',()=>PACK.filter(id=>owned(id)).length>=PACK.length/2,{sh:120}],
 ['craft','Flesh-Smith','Craft a card.',()=>AC('craft')>=1,{sh:40}],
 ['cx25','Archivist','Record 25 codex entries.',()=>cdxN()>=25,{sh:50}],
 ['cxall','Keeper of the Archive','Record every codex entry.',()=>cdxN()>=CDXI().length,{theme:'vellum'}],
 ['wk1','Weekly Rite','Complete a weekly challenge.',()=>(V9.week.total||0)>=1,{back:'ritual'}],
 ['wk4','Month of Rites','Complete 4 weekly challenges.',()=>(V9.week.total||0)>=4,{theme:'eclipse'}],
 ['echo','Resonant','Play 10 Echo copies.',()=>AC('echo')>=10,{sh:40}],
 ['kw4','Fluent in Ruin','Play a card with each new keyword: Echo, Devour, Corrupt and Ward.',()=>['echo','devour','corrupt','ward'].every(k=>AC('k_'+k)>=1),{sh:40}],
 ['dk5','Five Doctrines','Build 5 custom decks.',()=>DK.decks.length>=5,{sh:40}]];
const ACHI=Object.fromEntries(ACH.map(a=>[a[0],a]));
const achNew=()=>Math.max(0,Object.keys(V9.ach.got).length-(V9.ach.seen||0));
const cosHas=(kind,id)=>(kind==='back'?CB:TH)[id]&&(id==='veil'||id==='none'||ACH.some(a=>V9.ach.got[a[0]]&&a[4][kind]===id));
function achCheck(quiet){const out=[];for(const a of ACH){if(V9.ach.got[a[0]])continue;let ok=false;try{ok=a[3]()}catch(e){}if(ok){V9.ach.got[a[0]]=Date.now();out.push(a);if(a[4].sh)give({sh:a[4].sh})}}
 if(out.length){saveV9();if(!quiet)toast('Achievement: '+out.map(a=>a[1]).join(' · '),2600);try{badges()}catch(e){}}return out}
function cosApply(){const rs=document.documentElement.style,b=CB[V9.cos.back]&&cosHas('back',V9.cos.back)?V9.cos.back:'veil',t=TH[V9.cos.theme]&&cosHas('theme',V9.cos.theme)?V9.cos.theme:'none';
 rs.setProperty('--cardback',CB[b].css||`url(${cardBackURL._u||(cardBackURL._u=cardBackURL())})`);rs.setProperty('--th',TH[t].css||'none');document.body.dataset.th=t}
function cosSet(kind,id){if(!cosHas(kind,id))return false;V9.cos[kind]=id;saveV9();cosApply();return true}
const rwName=r=>r.back?'Card back: '+CB[r.back].n:r.theme?'Board theme: '+TH[r.theme].n:r.sh?r.sh+'◆':'';
function renderAch(){const got=V9.ach.got,n=Object.keys(got).length,tab=UX.achTab;V9.ach.seen=n;saveV9();badges();
 $('#achtabs').innerHTML=`<button data-at="ach" class="${tab==='ach'?'on':''}">Achievements<em>${n}/${ACH.length}</em></button><button data-at="cos" class="${tab==='cos'?'on':''}">Card Backs &amp; Boards</button>`;
 const by=(kind,id)=>ACH.find(a=>a[4][kind]===id);
 if(tab==='ach')$('#achx').innerHTML=`<div class="pbarw"><i style="width:${(n/ACH.length*100).toFixed(0)}%"></i></div><div class="achl">${ACH.map(a=>`<div class="ach${got[a[0]]?' got':''}"><i class="am">${got[a[0]]?'✦':'◇'}</i><div><b>${a[1]}</b><small>${a[2]}</small></div><em>${rwName(a[4])}</em></div>`).join('')}</div>`;
 else $('#achx').innerHTML=`<h3>CARD BACK</h3><div class="cosg backs">${Object.keys(CB).map(id=>{const h=cosHas('back',id),a=by('back',id);return`<button class="cos cb${V9.cos.back===id?' on':''}${h?'':' unk'}" data-cos="back:${id}"><i style="background:${CB[id].css||`url(${cardBackURL._u||(cardBackURL._u=cardBackURL())}) center/cover`}"></i><b>${CB[id].n}</b><small>${h?(V9.cos.back===id?'Equipped':'Tap to equip'):'🔒 '+(a?a[1]:'')}</small></button>`}).join('')}</div>
  <h3>BOARD THEME</h3><div class="cosg themes">${Object.keys(TH).map(id=>{const h=cosHas('theme',id),a=by('theme',id);return`<button class="cos tb${V9.cos.theme===id?' on':''}${h?'':' unk'}" data-cos="theme:${id}"><i style="background:${TH[id].css?TH[id].css+',':''}var(--pimgb,linear-gradient(#1a1018,#050304))"></i><b>${TH[id].n}</b><small>${h?(V9.cos.theme===id?'Equipped':'Tap to equip'):'🔒 '+(a?a[1]:'')}</small></button>`}).join('')}</div>`}
$('#ach').addEventListener('click',e=>{const t=e.target.closest('[data-at],[data-cos]');if(!t)return;if(t.dataset.at){UX.achTab=t.dataset.at;sfx('click');renderAch();return}
 const[k,id]=t.dataset.cos.split(':');if(cosSet(k,id)){sfx('heal');renderAch()}else{sfx('err');const a=ACH.find(a=>a[4][k]===id);toast(a?'Unlock: '+a[1]+' · '+a[2]:'Locked')}});

/* ---------------- match hooks ---------------- */
function v9MatchEnd(g,res){const m=g.meta||{},out={};if(res==='w'){if(g.reason==='mad')ctr('madwin');if(g.p[0].san>=20)ctr('flaw')}
 if(m.mode==='gaunt')out.gt=gtResult(g,res);
 if(m.mode==='week'){const W=weekState();W.games++;if(res==='w'){W.wins=Math.min(WKN,W.wins+1);give({sh:WKWIN});out.wk={win:1,wins:W.wins,done:W.wins>=WKN}}else out.wk={win:0,wins:W.wins}}
 saveV9();out.ach=achCheck(1).map(a=>a[1]);return out}
function v9OverHTML(g,x){if(!x)return'';let h='';const m=g.meta||{};
 if(x.gt){const t=x.gt;if(t.end)h+=`<p class="ovst">${t.end.w>=GT.MAXW?'Twelve foes lie broken behind you. The Gauntlet is conquered.':'The Gauntlet claims you.'} Run over: <b>${t.end.w} wins</b>.</p><div class="ovcr">${rwTxt(t.end)||'No reward'}</div>`;
  else if(t.draw)h+='<p class="ovst">A stalemate. The foe waits for a rematch.</p>';else h+=`<div class="ovcr">Gauntlet: ${t.run.w} wins · ${GT.MAXL-t.run.l} ${GT.MAXL-t.run.l===1?'life':'lives'} left${t.win?' · a card awaits':''}</div>`}
 if(x.wk)h+=`<div class="ovcr">Weekly: ${x.wk.wins}/${WKN} wins${x.wk.win?' · +'+WKWIN+'◆':''}${x.wk.done?' · reward ready to claim':''}</div>`;
 if(x.ach&&x.ach.length)h+=x.ach.map(n=>`<div class="ovq">Achievement unlocked: ${n}</div>`).join('');return h}
function v9Quit(g){if(!g||!g.meta)return null;const md=g.meta.mode;if(md==='gaunt'){if(!g.over&&gtRun()){gtResult(g,'l');saveV9()}return'gaunt'}if(md==='week')return'weekly';return null}
{const c0=craft;craft=function(id){const r=c0(id);if(r&&r.ok){ctr('craft');saveV9();achCheck()}return r}}
function v9Show(id){if(id==='gaunt')renderGaunt();if(id==='weekly')renderWeekly();if(id==='codex'){if(V9.codex.nw){V9.codex.nw=0;saveV9()}renderCodex()}if(id==='ach')renderAch();if(id==='title'){achCheck();badges()}}
$('#bGaunt').onclick=()=>{sfx('click');show('gaunt')};$('#bWeek').onclick=()=>{sfx('click');show('weekly')};$('#bCodex').onclick=()=>{sfx('click');show('codex')};$('#bAch').onclick=()=>{sfx('click');show('ach')};
$('#sCos').onclick=()=>{sfx('click');$('#settings').classList.remove('on');UX.achTab='cos';show('ach')};
cosApply();weekState();achCheck(1);badges();
Object.defineProperty(window.__hs,'V9',{get(){return V9},set(v){V9=v9Mig(v)},configurable:true});
Object.assign(window.__hs,{v9Mig,saveV9,BAT,batSleep,batWake,batHide,batShow,batPoke,LORE,CDXI,cdxHas,cdxN,renderCodex,UX,WK,weekKey,weekMod,weekState,weekClaim,weekClaimable,weekPlay,renderWeekly,
 BG,gtReplace,GT,gtStart,gtFoe,gtOffer,gtPick,gtFight,gtResult,gtEnd,gtRun,renderGaunt,CB,TH,ACH,achCheck,cosHas,cosSet,cosApply,renderAch,dkFac,v9MatchEnd,v9Quit,dlg,fitScan});

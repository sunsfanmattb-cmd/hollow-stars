'use strict';
/* test/debug hooks; every file adds to this object */
window.__hs=window.__hs||{};
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let rnd=Math.random;const pick=a=>a[Math.floor(rnd()*a.length)];
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
/* ================= DATA ================= */
const FAC={v:{n:'The Abyss',s:'Entity',d:'Eldritch titans from beyond the void. Slow, enormous and Phase-touched; they spread Madness until minds break.',hero:'The Drowned Choir',ak:'eye'},
m:{n:'The Derelict',s:'Construct',d:'Haunted drones and ghost ships. Walls of Guard, Salvage, Swift strikes and automated firepower.',hero:'Ship-Mind ECHO-9',ak:'drone'},
c:{n:'The Red Communion',s:'Cultist',d:'Deep-space cultists who feed the flesh. Offerings, Drain and Blight; growth through sacrifice.',hero:'High Mother Vael',ak:'robed'},
n:{n:'Wanderers',s:'Crew',d:'Survivors of the dark between stars.',hero:'Lost Crew',ak:'human'}};
const ICO={guard:'M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z',swift:'M13 2L4 14h6l-1 8 9-12h-6z',phase:'M15 3a9 9 0 1 0 6 15A8 8 0 0 1 15 3z',drain:'M12 2c4 6 7 9 7 13a7 7 0 0 1-14 0c0-4 3-7 7-13z',
blight:'M12 2a4 4 0 1 1 0 8 4 4 0 1 1 0-8zM5.5 12a4 4 0 1 1 0 8 4 4 0 1 1 0-8zM18.5 12a4 4 0 1 1 0 8 4 4 0 1 1 0-8z',dread:'M12 5C6 5 2 12 2 12s4 7 10 7 10-7 10-7-4-7-10-7zm0 3a4 4 0 1 0 0 8 4 4 0 1 0 0-8z',
offering:'M11 1h2v13h4v2h-4v7h-2v-7H7v-2h4z',echo:'M12 3a9 9 0 1 1 0 18 9 9 0 1 1 0-18zm0 2.4a6.6 6.6 0 1 0 0 13.2 6.6 6.6 0 1 0 0-13.2zM12 8.2a3.8 3.8 0 1 1 0 7.6 3.8 3.8 0 1 1 0-7.6zm0 2a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 1 0 0-3.6z',devour:'M3 6c3 2 15 2 18 0l-2 6H5zM5 4l1.6 3 1.6-3 1.6 3 1.6-3 1.6 3 1.6-3 1.6 3 1.6-3zM5 13h14l2 5c-3-2-15-2-18 0zm1 7l1.6-3 1.6 3 1.6-3 1.6 3 1.6-3 1.6 3 1.6-3 1.6 3z',corrupt:'M12 2c1 4 6 6 6 11a6 6 0 0 1-12 0c0-5 5-7 6-11zm-2 9a2 2 0 1 0 0 4 2 2 0 1 0 0-4zm4.5 4a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 1 0 0-2.6z',ward:'M12 1l9.5 5.5v11L12 23l-9.5-5.5v-11zm0 3L5 8v8l7 4 7-4V8z',salvage:'M10 1h4l.6 3.2 2.3 1.3 3-1.2 2 3.4-2.4 2.1v2.4l2.4 2.1-2 3.4-3-1.2-2.3 1.3L14 23h-4l-.6-3.2-2.3-1.3-3 1.2-2-3.4 2.4-2.1v-2.4L2.1 8.7l2-3.4 3 1.2 2.3-1.3zM12 9a3 3 0 1 0 0 6 3 3 0 1 0 0-6z'};
const KW={guard:['Guard','Enemies must attack Guard units first.'],swift:['Swift','Can attack the turn it arrives.'],phase:['Phase','Ignores Guard. Only Phase units can attack it.'],drain:['Drain','Damage this deals restores your Sanity.'],blight:['Blight','Any unit damaged by this is destroyed.'],dread:['Dread','When it arrives, the enemy gains that much Madness.'],offering:['Offering','When it arrives, sacrifice your weakest other unit to empower it.'],salvage:['Salvage','When destroyed, draw a card.'],echo:['Echo','After you play it, a fading copy returns to your hand. The copy has no Echo and vanishes at the end of your turn.'],devour:['Devour','Whenever it destroys a unit in combat, it gains +1/+1.'],corrupt:['Corrupt','Any unit damaged by this permanently loses 1 Attack.'],ward:['Ward','The first time it would take damage, prevent it and break the Ward.']};
const svgI=k=>`<svg viewBox="0 0 24 24" data-k="${k}"><title>${KW[k]?KW[k][0]+': '+KW[k][1]:k}</title><path fill-rule="evenodd" d="${ICO[k]}"/></svg>`;
const C={},COL=[];
function U(id,n,f,c,a,h,k,r,art,x,fl,o={}){const d=C[id]=Object.assign({id,n,f,t:'u',c,a,h,k:k?k.split(' '):[],r,art,x,fl},o);if(d.dread&&!d.k.includes('dread'))d.k.push('dread');if(r!=='T')COL.push(id)}
function S(id,n,f,c,r,art,x,fl,o={}){if(/^Echo\. /.test(x)){x=x.slice(6);o.k=['echo']}C[id]=Object.assign({id,n,f,t:'s',c,k:[],r,art,x,fl},o);COL.push(id)}
const E=(g,pi)=>g.p[1-pi];
// ---- The Abyss ----
U('v1','Drifting Spawn','v',1,1,2,'','C','tent','','It fell between the stars for a thousand years. It is still falling.',{dread:1});
U('v2','Starless Watcher','v',2,1,3,'phase corrupt','C','eye','','It does not blink. It has never needed to.');
U('v3','Whispering Eye','v',2,2,2,'','U','eye','At the start of your turn, the enemy gains 1 Madness.','You hear it best when you try to sleep.',{start:(g,pi)=>addMad(g,1-pi,1)});
U('v4','Void Leech','v',3,2,3,'phase drain','U','tent','','It drinks the warmth from your memories.');
U('v5','Tendril of the Deep','v',3,3,5,'guard','C','tent','','Only a fingertip of something vast.');
U('v6','Choir of Silence','v',4,3,4,'','U','star','','Their hymn has no sound. Your ears bleed anyway.',{dread:2});
U('v7','Abyssal Maw','v',5,5,5,'','R','maw','When it arrives, deal 2 damage to all other units.','The station had no airlock on that side. It does now.',{play:(g,pi,u)=>{for(const q of units(g))if(q!==u)hurtU(g,q,2,null)}});
U('v8','Dreaming Leviathan','v',7,7,8,'guard','R','tent','','When it wakes, the dream that is our universe ends.',{dread:2});
U('v9','The Unbound Star','v',9,9,9,'phase','L','star','','A sun that remembered it was an eye.',{dread:3});
S('v10','Gaze Into Nothing','v',1,'C','eye','The enemy gains 2 Madness.','And the nothing gazed back, hungry.',{cast:(g,pi)=>addMad(g,1-pi,2)});
S('v11','Rift Tear','v',3,'C','rune','Deal 4 damage to a unit.','Space folds. Something on the other side bites.',{tg:'unit',cast:(g,pi,T)=>hurt(g,T,4)});
S('v12','The Unmaking','v',7,'R','star','Destroy ALL units. The enemy gains 2 Madness.','Everything returns to the dark. Everything.',{cast:(g,pi)=>{for(const q of units(g))destroy(g,q);addMad(g,1-pi,2)}});
S('v13','Echoes Beyond','v',2,'U','rune','Echo. Draw 2 cards. You gain 1 Madness.','Knowledge has a price, and it is always you.',{cast:(g,pi)=>{draw(g,pi,2);addMad(g,pi,1)}});
// ---- The Derelict ----
U('m1','Scrap Drone','m',1,1,2,'salvage','C','drone','','Still running maintenance on a crew long dead.');
U('m2','Hull Sentry','m',2,1,4,'guard','C','drone','','PERIMETER HOLDING. PERIMETER HOLDING. PERIMETER—');
U('m3','Seeker Swarm','m',2,2,1,'swift','U','drone','When it arrives, summon a 1/1 Drone.','They hunt in pairs, then in hundreds.',{play:(g,pi)=>summon(g,pi,'tD')});
U('m4','Med-Bay Unit','m',3,1,4,'','C','drone','When it arrives, restore 3 Sanity and remove 2 Madness.','"Please remain calm. Your screams are being recorded."',{play:(g,pi)=>{healH(g,pi,3);addMad(g,pi,-2)}});
U('m5','Breach Cutter','m',3,3,2,'swift','C','ship','','Built to open hulls. It never stopped.');
U('m6','Lantern Automaton','m',4,3,5,'guard salvage','U','drone','','Its light keeps the dark at bay. Mostly.');
U('m7','Ghost Pilot','m',4,4,3,'phase salvage','U','human','','The ship still flies. Its captain still steers.');
U('m8','Railgun Platform','m',5,3,5,'','R','ship','End of your turn: deal 2 damage to a random enemy unit (or the enemy, if none).','Targeting solution: everything.',{end:(g,pi,u)=>{const e=E(g,pi).board.filter(x=>x.h>0);if(e.length)hurtU(g,pick(e),2,u);else hurtH(g,1-pi,2,u)}});
U('m9','The Ashen Ark','m',8,7,9,'guard','L','ship','When it arrives, summon two 1/1 Drones.','The colony ship arrived 400 years late. Its passengers did not.',{play:(g,pi)=>{summon(g,pi,'tD');summon(g,pi,'tD')}});
S('m10','Overclock','m',1,'C','beam','Give a friendly unit +2 attack. It can attack this turn.','Redline the reactor. Ignore the screaming.',{tg:'friendlyUnit',cast:(g,pi,T)=>{T.u.a+=2;T.u.ready=true}});
S('m11','Ion Lance','m',2,'C','beam','Deal 3 damage to a unit.','Point-defence, repurposed.',{tg:'unit',cast:(g,pi,T)=>hurt(g,T,3)});
S('m12','Emergency Purge','m',4,'U','beam','Deal 2 damage to all enemy units.','Venting compartments 4 through 19.',{cast:(g,pi)=>{for(const q of E(g,pi).board)hurtU(g,q,2,null)}});
S('m13','Reboot Protocol','m',2,'C','rune','Restore 4 Sanity and remove 3 Madness.','Have you tried turning your mind off and on again?',{cast:(g,pi)=>{healH(g,pi,4);addMad(g,pi,-3)}});
// ---- The Red Communion ----
U('c1','Initiate of the Maw','c',1,2,2,'','C','robed','','Eager to give. Eager to be given.');
U('c2','Bloodletter','c',2,2,3,'drain','C','robed','','Every wound is a prayer.');
U('c3','Mutating Acolyte','c',2,1,3,'','U','flesh','At the start of your turn, this gains +1/+1.','Each morning, a little less human. A little more holy.',{start:(g,pi,u)=>{buff(u,1,1);fx(g,{k:'buff',id:'u'+u.uid})}});
U('c4','Spore Carrier','c',2,2,2,'blight corrupt','C','flesh','','Breathe deep. Become.');
U('c5','Knife-Priest','c',3,3,3,'offering','U','robed','Offering: +2/+2.','The blade is blessed. The hand is not.',{play:(g,pi,u)=>{if(sacrifice(g,pi,u))buff(u,2,2)}});
U('c6','Flesh Golem','c',4,4,6,'guard','C','flesh','','Assembled from the willing. And the unwilling.');
U('c7','Hierophant of Rot','c',4,3,5,'blight drain','R','robed','','She preaches the gospel of the open wound.');
U('c8','Gorged Abomination','c',5,5,6,'offering','U','maw','Offering: draw 2 cards.','It was a congregation once.',{play:(g,pi,u)=>{if(sacrifice(g,pi,u))draw(g,pi,2)}});
U('c9','The Thousand Mouths','c',8,6,6,'drain','L','maw','When it arrives, sacrifice all your other units. It gains +2/+2 for each.','All voices become one voice. All mouths become one hunger.',{play:(g,pi,u)=>{for(const q of g.p[pi].board)if(q!==u&&q.h>0){destroy(g,q);fx(g,{k:'sac',id:'u'+q.uid});buff(u,2,2)}}});
S('c10','Blood Rite','c',1,'C','rune','Destroy a friendly unit. Draw 2 cards.','The stars only answer those who pay.',{tg:'friendlyUnit',cast:(g,pi,T)=>{destroy(g,T.u);draw(g,pi,2)}});
S('c11','Hemorrhage','c',2,'C','rune','Deal 3 damage to an enemy or enemy unit. Restore 2 Sanity.','Your blood remembers the way out.',{tg:'enemy',cast:(g,pi,T)=>{hurt(g,T,3);healH(g,pi,2)}});
S('c12','Feast of Flesh','c',2,'U','flesh','Give your units +1/+1.','The communion table is set. You are the meal.',{cast:(g,pi)=>{for(const q of g.p[pi].board){buff(q,1,1);fx(g,{k:'buff',id:'u'+q.uid})}}});
S('c13','Final Ascension','c',6,'R','star','Destroy a unit. Restore Sanity equal to its health.','Rise, child. Leave the meat behind.',{tg:'unit',cast:(g,pi,T)=>{const h=Math.max(0,T.u.h);destroy(g,T.u);healH(g,pi,h)}});
// ---- Wanderers ----
S('n1','Lost Signal','n',0,'C','planet','Draw a card. You gain 1 Madness.','...is anyone out there... is anyone out there... is any—',{cast:(g,pi)=>{draw(g,pi,1);addMad(g,pi,1)}});
U('n2','Stranded Crewman','n',2,2,3,'','C','human','','Day 312. The stars are wrong again.');
U('n3','Hollow-Eyed Marine','n',3,3,4,'','C','human','','She came back from the derelict. Something else came back too.');
U('n4','Quarantine Warden','n',4,2,6,'guard','C','human','','No one leaves. Nothing gets in.');
S('n5','Distress Beacon','n',3,'U','ship','Summon two 1/2 Survivors with Guard.','Help is coming. Probably.',{cast:(g,pi)=>{summon(g,pi,'tS');summon(g,pi,'tS')}});
U('n6','Black Vessel','n',6,5,6,'swift','R','ship','','No crew. No lights. Full speed.');
// ---- Booster-pack cards (owned only once pulled) ----
const PK=o=>Object.assign({pk:1},o);
const hitRnd=(g,pi,n,src)=>{const e=E(g,pi).board.filter(x=>x.h>0);if(e.length)hurtU(g,pick(e),n,src);else hurtH(g,1-pi,n,src)};
U('v14','Larval Dreamer','v',1,1,2,'','C','larva','When it dies, the enemy gains 1 Madness.','It dreams of being born. You dream of it too.',PK({death:(g,pi)=>addMad(g,1-pi,1)}));
U('v15','Hollow Prophet','v',2,2,2,'','C','prophet','','Its mouth speaks. Its skull is empty.',PK({dread:1}));
U('v16','Tidal Horror','v',3,3,3,'','C','tidal','When it arrives, deal 1 damage to all enemy units.','The tide came in. It brought the sea floor with it.',PK({play:(g,pi)=>{for(const q of E(g,pi).board)hurtU(g,q,1,null)}}));
U('v17','Thought Eater','v',3,2,4,'drain','U','thought','When it arrives, if the enemy has 4+ Madness, draw a card.','Your best memories taste of copper.',PK({play:(g,pi)=>{if(E(g,pi).mad>=4)draw(g,pi,1)}}));
U('v18','Nameless Swimmer','v',4,4,4,'phase devour','U','swimmer','','Something huge passed under the station. The station tilted.',PK());
S('v19',"Stargazer's Ruin",'v',2,'U','ruin','The enemy gains 1 Madness for each unit you control (max 3).','He saw the shape between the stars. Now he cannot stop drawing it.',PK({cast:(g,pi)=>addMad(g,1-pi,Math.min(3,g.p[pi].board.length))}));
U('v20','Weeping Colossus','v',6,5,7,'guard','R','colossus','End of your turn: the enemy gains 1 Madness.','Its tears are full of tiny screaming faces.',PK({end:(g,pi)=>addMad(g,1-pi,1)}));
S('v21','Event Horizon','v',5,'R','horizon','Destroy an enemy unit. The enemy gains 1 Madness.','Past this point, even light begs.',PK({tg:'enemyUnit',cast:(g,pi,T)=>{destroy(g,T.u);addMad(g,1-pi,1)}}));
U('v22','Drowned Astronaut','v',2,2,1,'phase','C','drowned','','Her suit filled with something that was not water.',PK({dread:1}));
U('v23','The Hungering Dark','v',9,8,8,'phase','L','dark','Start of your turn: destroy a random enemy unit.','Before the first star there was hunger. There will be after.',PK({start:(g,pi)=>{const e=E(g,pi).board.filter(x=>x.h>0);if(e.length){const t=pick(e);destroy(g,t);fx(g,{k:'blight',id:'u'+t.uid})}}}));
U('m14','Rivet Crawler','m',1,1,1,'swift salvage echo','C','crawler','','It skitters through the vents, counting the dead.',PK());
U('m15','Cryo-Pod Sleeper','m',2,0,5,'guard','C','cryo','When it dies, summon two 1/1 Drones.','Do not wake the passengers. They are not passengers anymore.',PK({death:(g,pi)=>{summon(g,pi,'tD');summon(g,pi,'tD')}}));
U('m16','Grav-Lock Turret','m',3,2,4,'','C','gturret','End of your turn: deal 1 damage to a random enemy unit (or the enemy).','It locks on to warmth.',PK({end:(g,pi,u)=>hitRnd(g,pi,1,u)}));
U('m17','Hull Breacher','m',4,4,3,'swift','U','breacher','When it arrives, deal 2 damage to a random enemy unit (or the enemy).','Boarding procedure: there is no procedure.',PK({play:(g,pi,u)=>hitRnd(g,pi,2,u)}));
U('m18','Corpse Hauler','m',3,3,3,'salvage','C','hauler','When it arrives, summon a 1/1 Drone.','Cargo manifest: 2,113 colonists. Condition: stacked.',PK({play:(g,pi)=>summon(g,pi,'tD')}));
S('m19','Signal Jammer','m',2,'C','jammer','Remove 2 Madness. Draw a card.','Static is the only voice that does not lie.',PK({cast:(g,pi)=>{addMad(g,pi,-2);draw(g,pi,1)}}));
S('m20',"Dead Man's Switch",'m',3,'U','switch','Destroy a friendly unit. Deal damage equal to its attack to all enemy units.','The captain\'s hand is still on the trigger.',PK({tg:'friendlyUnit',cast:(g,pi,T)=>{const a=Math.max(0,T.u.a);destroy(g,T.u);for(const q of E(g,pi).board)hurtU(g,q,a,null)}}));
U('m21','Autosurgeon','m',5,3,6,'','R','surgeon','Start of your turn: restore 2 Sanity and give a random friendly unit +1/+1.','"Procedure 4,812 complete. Patient status: improved."',PK({start:(g,pi,u)=>{healH(g,pi,2);const b=g.p[pi].board.filter(x=>x.h>0);if(b.length){const t=pick(b);buff(t,1,1);fx(g,{k:'buff',id:'u'+t.uid})}}}));
S('m22','Orbital Strike','m',6,'R','orbital','Deal 5 damage to a unit and 2 damage to the enemy.','The ship cannot land. It can still deliver.',PK({tg:'unit',cast:(g,pi,T)=>{hurt(g,T,5);hurtH(g,1-pi,2)}}));
U('m23','The Hollow Armada','m',9,6,8,'guard','L','armada','When it arrives, fill your board with 1/1 Drones. They can attack this turn.','A thousand ships, one dead mind.',PK({play:(g,pi)=>{for(let i=0;i<5;i++){const d=summon(g,pi,'tD');if(d)d.ready=true}}}));
U('c14','Flayed Penitent','c',1,2,2,'drain','C','penitent','','She offered her skin first. It was only the beginning.',PK());
U('c15','Maggot Brood','c',2,2,1,'blight swift','C','maggot','','They will eat whatever the Communion leaves. Which is nothing.',PK());
U('c16','Weeping Sister','c',3,3,4,'','C','sister','When it arrives, restore 3 Sanity.','She weeps for you. Her tears are red.',PK({play:(g,pi)=>healH(g,pi,3)}));
U('c17','Butcher-Deacon','c',4,4,5,'offering','U','butcher','Offering: +1/+1 and Drain.','He carves the sermon into the congregation.',PK({play:(g,pi,u)=>{if(sacrifice(g,pi,u)){buff(u,1,1);if(!u.k.includes('drain'))u.k.push('drain')}}}));
U('c18','Wombspawn','c',3,2,3,'','U','womb','When it dies, summon two 1/1 Spawnlings.','It is always pregnant with something worse.',PK({death:(g,pi)=>{summon(g,pi,'tC');summon(g,pi,'tC')}}));
S('c19','Rite of Many Hands','c',3,'U','hands','Summon three 1/1 Spawnlings.','Every hand you cut off grows back. Somewhere.',PK({cast:(g,pi)=>{for(let i=0;i<3;i++)summon(g,pi,'tC')}}));
U('c20','Choir of Teeth','c',5,4,6,'drain','R','teethchoir','End of your turn: deal 1 damage to all enemy units.','Their hymn is a grinding. It never ends.',PK({end:(g,pi,u)=>{for(const q of E(g,pi).board)hurtU(g,q,1,u)}}));
S('c21','Skin-Bound Gospel','c',2,'C','gospel','Give a friendly unit +2/+2 and Drain.','Bound in the skin of the first reader.',PK({tg:'friendlyUnit',cast:(g,pi,T)=>{buff(T.u,2,2);if(!T.u.k.includes('drain'))T.u.k.push('drain');fx(g,{k:'buff',id:'u'+T.u.uid})}}));
U('c22','Mother of Wounds','c',8,7,7,'drain','L','mother','Start of your turn: summon a 1/1 Spawnling and restore 2 Sanity.','Every wound in the galaxy is one of her children.',PK({start:(g,pi)=>{summon(g,pi,'tC');healH(g,pi,2)}}));
S('c23',"Martyr's Pyre",'c',4,'R','pyre','Destroy all your units. For each, deal 2 damage to a random enemy unit (or the enemy).','They burned singing. The smoke sang longer.',PK({cast:(g,pi)=>{const b=g.p[pi].board.filter(x=>x.h>0);for(const q of b)destroy(g,q);for(const q of b)hitRnd(g,pi,2,null)}}));
U('n7','Salvage Diver','n',2,2,2,'','U','diver','When it arrives, draw a card. You gain 1 Madness.','The wrecks are full of treasure. And of those who came for it.',PK({play:(g,pi)=>{draw(g,pi,1);addMad(g,pi,1)}}));
S('n8','Last Lifeboat','n',5,'R','lifeboat','Summon three 1/2 Survivors with Guard. Restore 3 Sanity.','Eleven seats. Forty hands on the hatch.',PK({cast:(g,pi)=>{for(let i=0;i<3;i++)summon(g,pi,'tS');healH(g,pi,3)}}));
// ---- v8 campaign reward cards (cmp: obtainable ONLY by clearing campaign chapters; never in packs, never craftable) ----
const CP=(f,o={})=>Object.assign({cmp:f},o);
U('v24','Tidebound Confessor','v',3,2,4,'','U','confessor','When it arrives, restore 2 Sanity.','He confesses every sin of the drowned. His lungs are full of them.',CP('v',{dread:1,play:(g,pi)=>healH(g,pi,2)}));
U('v25','Lantern-Eel of the Trench','v',4,3,4,'phase','R','eel','End of your turn: if the enemy has 5+ Madness, deal 2 damage to the enemy.','Follow the light. It has your mother\'s face.',CP('v',{end:(g,pi,u)=>{if(E(g,pi).mad>=5)hurtH(g,1-pi,2,u)}}));
U('v26','Choir of the Sunken Ark','v',5,4,6,'guard','R','sunkchoir','When it arrives, give your other units +1/+1.','Forty sailors, one hull, one endless hymn.',CP('v',{dread:1,play:(g,pi,u)=>{for(const q of g.p[pi].board)if(q!==u){buff(q,1,1);fx(g,{k:'buff',id:'u'+q.uid})}}}));
U('v27','Mother Below, the Unsurfacing','v',9,8,9,'phase','L','motherbelow','Start of your turn: the enemy gains 1 Madness and each enemy unit takes 1 damage.','The ship was not sinking. The sea was rising to look at it.',CP('v',{dread:2,start:(g,pi,u)=>{addMad(g,1-pi,1);for(const q of E(g,pi).board)hurtU(g,q,1,u)}}));
U('m24','Cryo-Wake Survivor','m',3,2,4,'salvage','U','cryowake','When it arrives, summon a 1/1 Drone.','It thawed in the wrong order. The cables kept growing.',CP('m',{play:(g,pi)=>summon(g,pi,'tD')}));
U('m25','Hull-Grafted Sentinel','m',4,2,6,'guard','R','sentinel','End of your turn: deal 1 damage to a random enemy unit (or the enemy).','Plating, servos, and three crewmen who volunteered.',CP('m',{end:(g,pi,u)=>hitRnd(g,pi,1,u)}));
S('m26','The Last Transmission','m',3,'R','transmission','Draw 2 cards. Summon a 1/1 Drone. Remove 1 Madness.','"...if anyone hears this, do not answer..."',CP('m',{cast:(g,pi)=>{draw(g,pi,2);summon(g,pi,'tD');addMad(g,pi,-1)}}));
U('m27','ARK-0, the Mourning Fleet','m',9,7,9,'guard','L','ark0','When it arrives, summon two 1/1 Drones. End of your turn: deal 1 damage to a random enemy unit (or the enemy) for each other unit you control (max 4).','A thousand dead ships, one grieving mind.',CP('m',{play:(g,pi)=>{summon(g,pi,'tD');summon(g,pi,'tD')},end:(g,pi,u)=>{const n=Math.min(4,g.p[pi].board.filter(x=>x!==u&&x.h>0).length);for(let i=0;i<n;i++)hitRnd(g,pi,1,u)}}));
U('c24','Sister of the Seventh Cut','c',2,2,2,'','U','sister','When it arrives, you lose 3 Sanity and it gains +2/+2.','Seven cuts for the seven mouths of God.',CP('c',{play:(g,pi,u)=>{g.p[pi].san-=3;fx(g,{k:'dmg',id:'h'+pi,n:3});buff(u,2,2)}}));
U('c25','Reliquary Hound','c',4,3,2,'swift blight devour','R','hound','','Bones of saints, sinew of sinners, appetite of neither.',CP('c'));
S('c26','Banquet of the Hollowed','c',4,'R','banquet','Sacrifice your weakest unit. Your other units gain +2/+2 and Drain.','The guests are the meal. The meal says grace.',CP('c',{cast:(g,pi)=>{sacrifice(g,pi,null);for(const q of g.p[pi].board)if(q.h>0){buff(q,2,2);if(!q.k.includes('drain'))q.k.push('drain');fx(g,{k:'buff',id:'u'+q.uid})}}}));
U('c27','The Red Sacrament','c',8,6,8,'drain','L','sacrament','Start of your turn: sacrifice your weakest other unit. If you did, this gains +1/+1 and you restore 2 Sanity.','Drink. It is already inside you.',CP('c',{start:(g,pi,u)=>{if(sacrifice(g,pi,u)){buff(u,1,1);healH(g,pi,2);fx(g,{k:'buff',id:'u'+u.uid})}}}));
// ---- v8 booster-pack cards ----
U('v28','Barnacle Saint','v',2,1,5,'guard','C','barnacle','','The pilgrimage ended at the bottom. He keeps walking.',PK());
S('v29','Whisper-Kelp','v',1,'C','kelp','The enemy gains 1 Madness. If they have 4+ Madness, draw a card.','The fronds remember every face they caught.',PK({cast:(g,pi)=>{addMad(g,1-pi,1);if(E(g,pi).mad>=4)draw(g,pi,1)}}));
U('v30','Gill-Stitched Acolyte','v',3,3,4,'','U','gills','When it arrives, if the enemy has 3+ Madness, it gains +1/+1 and Phase.','The sutures are fresh. The breathing is not.',PK({play:(g,pi,u)=>{if(E(g,pi).mad>=3){buff(u,1,1);if(!u.k.includes('phase'))u.k.push('phase')}}}));
U('v31','The Pressure-Born','v',6,5,6,'phase','R','pressure','When it arrives, deal 3 damage to a random enemy unit (or the enemy).','The deep folded its bones inward, gently, for a thousand years.',PK({play:(g,pi,u)=>hitRnd(g,pi,3,u)}));
U('v32','Hymn That Swallows Light','v',7,6,6,'phase','L','hymn','When it arrives, deal 3 damage to all enemy units.','The lighthouse kept shining. Nothing came back out.',PK({dread:2,play:(g,pi,u)=>{for(const q of E(g,pi).board)hurtU(g,q,3,u)}}));
U('m28','Scrap-Ghoul','m',2,2,2,'salvage','C','ghoul','','It strips the ship for parts. It started with itself.',PK());
U('m29','Airlock Hanged Man','m',1,1,1,'guard','C','hanged','When it dies, deal 2 damage to a random enemy unit (or the enemy).','Tethered by his own cable. Still knocking.',PK({death:(g,pi)=>hitRnd(g,pi,2,null)}));
U('m30','Nanite Plague Doctor','m',3,2,3,'corrupt','U','plaguedoc','End of your turn: restore 1 Sanity and deal 1 damage to a random enemy unit (or the enemy).','The cure is also hungry.',PK({end:(g,pi,u)=>{healH(g,pi,1);hitRnd(g,pi,1,u)}}));
U('m31','Engine-Heart Colossus','m',6,5,5,'guard','R','colossus2','When it dies, deal 2 damage to all enemy units.','Its pilot died at the controls. It kept walking for him.',PK({death:(g,pi)=>{for(const q of E(g,pi).board)hurtU(g,q,2,null)}}));
U('m32','The Infinite Corridor','m',8,4,7,'guard','L','corridor','Start of your turn: summon a 1/1 Drone and the enemy gains 1 Madness.','Deck 9 goes on forever. The lights go out one by one behind you.',PK({start:(g,pi)=>{summon(g,pi,'tD');addMad(g,1-pi,1)}}));
U('c28','Bloodletter Novice','c',1,1,2,'drain','C','novice','','The chalice is never full. She keeps trying.',PK());
U('c29','Hookwife Matron','c',3,3,2,'swift offering','C','hooks','Offering: +2/+1.','She drags the congregation to service.',PK({play:(g,pi,u)=>{if(sacrifice(g,pi,u))buff(u,2,1)}}));
U('c30','Weeping Flesh-Idol','c',3,0,5,'guard','U','idol','Start of your turn: give a random other friendly unit +1/+1 and restore 1 Sanity.','It weeps for you. It weeps you.',PK({start:(g,pi,u)=>{const b=g.p[pi].board.filter(x=>x!==u&&x.h>0);if(b.length){const t=pick(b);buff(t,1,1);fx(g,{k:'buff',id:'u'+t.uid})}healH(g,pi,1)}}));
U('c31','The Twice-Born Martyr','c',4,4,3,'','R','martyr','The first time it dies, it returns as a 2/2.','He crawled out of his skin and kept the faith.',PK({death:(g,pi,u)=>{if(u.twice)return;const r=summon(g,pi,'c31');if(r){r.a=2;r.h=r.mh=2;r.twice=1}}}));
U('c32','Crown of Ten Thousand Teeth','c',8,6,6,'drain','L','crown','End of your turn: deal 1 damage to the enemy and to each enemy unit.','Every tooth a tithe. Every king a mouth.',PK({end:(g,pi,u)=>{for(const q of E(g,pi).board)hurtU(g,q,1,u);hurtH(g,1-pi,1,u)}}));
U('n9','Void-Salvager','n',2,2,2,'salvage','C','salvager','','His eyes went black on the third wreck. He kept the helmet.',PK());
U('n10','The Starving Navigator','n',3,2,3,'','U','navigator','When it arrives, draw 2 cards. You gain 2 Madness.','He charts stars that are not there. They are getting closer.',PK({play:(g,pi)=>{draw(g,pi,2);addMad(g,pi,2)}}));
U('n11','Witness of the Hollow Star','n',4,3,5,'','R','witness','When it arrives, the enemy gains Madness equal to yours (max 3).','The star in her visor has an eye. It saw her first.',PK({play:(g,pi)=>addMad(g,1-pi,Math.min(3,g.p[pi].mad))}));
// ---- v9 booster-pack cards: new keywords (Echo, Devour, Corrupt, Ward). Own art since batch 10; ai (reused painting) only where none exists yet ----
const V9C=(ai,o={})=>Object.assign({pk:1,v9:1},ai?{ai}:{},o);
U('v33','Echo of the Drowned','v',2,2,2,'phase echo','U','drowned','','She surfaces twice. Only one of her is breathing.',V9C(0));
U('v34','The Maw That Remembers','v',5,4,5,'devour','R','maw','','It keeps every crew it swallows. On quiet nights you can hear them taking roll.',V9C(0,{dread:1}));
S('v35','Blackwater Rot','v',2,'U','ruin','Deal 2 damage to a unit. If it survives, it permanently loses 2 Attack.','The water does not drown you. It teaches your muscles to forget.',V9C(0,{tg:'unit',cast:(g,pi,T)=>{hurt(g,T,2);if(T.k==='u'&&T.u.h>0)T.u.a=Math.max(0,T.u.a-2)}}));
U('m33','Ward-Lattice Drone','m',2,1,3,'ward','C','drone','','Its shield remembers the shape of the last thing that tried to kill it.',V9C(0));
S('m34','Rust Psalm','m',3,'U','jammer','Echo. Enemy units permanently lose 1 Attack.','A maintenance hymn, broadcast on every channel. The machines are listening. So is the rust.',V9C(0,{cast:(g,pi)=>{for(const q of E(g,pi).board)if(q.a>0){q.a--;fx(g,{k:'cor',id:'u'+q.uid})}}}));
U('m35','Scrap-Maw Excavator','m',4,3,4,'devour salvage','U','hauler','','It was built to clear wreckage. It no longer checks whether the wreckage is still moving.',V9C(0));
U('c33','Rot-Tongue Preacher','c',3,2,4,'corrupt drain','U','robed','','Every word she speaks is a wound that refuses to close.',V9C(0));
U('c34','Gutter Hound','c',2,2,2,'devour','C','hound','','Fed on scraps from the feast. It has started to prefer the guests.',V9C(0));
S('c35','Second Supper','c',1,'C','banquet','Echo. Give a friendly unit +1/+1 and Devour.','There is always room for another course. There is always another course.',V9C('c26',{tg:'friendlyUnit',cast:(g,pi,T)=>{buff(T.u,1,1);if(!T.u.k.includes('devour'))T.u.k.push('devour');fx(g,{k:'buff',id:'u'+T.u.uid})}}));
U('n12','Warded Survivor','n',3,2,3,'guard ward','C','human','','She wears the last working shield on the station. She has not taken it off in a year.',V9C(0));
U('n13','The Pathless','n',7,5,7,'phase','L','human','When it arrives, draw a card. Start of your turn: move 1 of your Madness to the enemy.','It walks a road no one built, toward a star no one can see. The road follows it.',PK({play:(g,pi)=>draw(g,pi,1),start:(g,pi)=>{if(g.p[pi].mad>0){addMad(g,pi,-1);addMad(g,1-pi,1)}}}));
U('tD','Drone','m',1,1,1,'','T','drone','','A drone of the dead fleet. It runs a maintenance cycle on whatever is left.');
U('tS','Survivor','n',1,1,2,'guard','T','human','','Someone who got out. They stopped asking out of what.');
U('tC','Spawnling','c',1,1,1,'','T','spawnling','','Born hungry from an open wound. It already knows your name.');
const BASE=COL.filter(id=>!C[id].pk&&!C[id].cmp),PACK=COL.filter(id=>C[id].pk),CAMPC=COL.filter(id=>C[id].cmp);
function cardText(d){const k=d.k.filter(k=>k!=='offering'||!/Offering/.test(d.x)).map(k=>`<span data-kw="${k}">${k==='dread'?'Dread '+d.dread:KW[k][0]}</span>`).join(', ');return(k?`<b>${k}.</b> `:'')+(d.x||'').replace(/^Offering:/,'<b data-kw="offering">Offering:</b>')}
function prebuilt(f,pool=BASE){const cards=[];for(const id of pool){const d=C[id];if(d.f!==f)continue;cards.push(id);if(d.r!=='L')cards.push(id)}cards.push('n2','n2','n3','n3','n4');return{fac:f,name:FAC[f].hero,cards}}

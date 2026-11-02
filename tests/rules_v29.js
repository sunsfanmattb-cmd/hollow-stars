/* v2.9 rules check (headless): hero powers, Pact, Unhinged, adjacency + placement, dynamic cost, sacrifice and arrival triggers,
   the Epics, and the mulligan. Usage: node tests/rules_v29.js */
const X=require('../tools/sim_load.js')();const{C}=X;let fails=0;
const ok=(n,c,info)=>{console.log((c?'PASS ':'FAIL ')+n+(c||info===undefined?'':'  '+JSON.stringify(info)));if(!c)fails++};
const fresh=(f0='v',f1='m')=>{const g=X.newGame(X.prebuilt(f0),X.prebuilt(f1),{sim:1,first:0});g.p[0].board=[];g.p[1].board=[];g.p[0].hand=[];g.p[0].flux=g.p[0].max=10;g.p[0].mad=0;g.p[1].mad=0;g.cur=0;return g};
const put=(g,pi,id)=>{const u=X.mkUnit(g,pi,id);u.ready=true;g.p[pi].board.push(u);X.cleanup(g);return u};
const hand=(g,id)=>{const c={uid:g.uid++,id};g.p[0].hand.push(c);return c};
const ev=(g,s)=>new Function('g','X',`with(X){return ${s}}`)(g,X);
// hero powers
let g=fresh('v');ok('Abyss power needs an Entity on the board',!X.legal(g,0).some(a=>a.t==='hp'));put(g,0,'v1');ok('Abyss power: enemy +1 Madness, costs 2',X.act(g,0,{t:'hp'})&&g.p[1].mad===1&&g.p[0].flux===8);
ok('power once per turn',!X.act(g,0,{t:'hp'})&&!X.legal(g,0).some(a=>a.t==='hp'));
X.endTurn(g);X.endTurn(g);ok('power refreshes next turn',X.legal(g,0).some(a=>a.t==='hp'));
g=fresh('m');g.p[0].mad=2;ok('Derelict power: summons a Drone, removes 1 Madness',X.act(g,0,{t:'hp'})&&g.p[0].board.length===1&&g.p[0].board[0].id==='tD'&&g.p[0].mad===1);
g=fresh('m');for(let i=0;i<6;i++)put(g,0,'m1');ok('Derelict power unavailable on a full board',!X.legal(g,0).some(a=>a.t==='hp'));
g=fresh('c');ok('Communion power needs a friendly unit',!X.legal(g,0).some(a=>a.t==='hp'));
let u=put(g,0,'c1');const keep=put(g,0,'c6');ok('Communion power: sacrifice, another unit +2/+2',X.act(g,0,{t:'hp',tg:'u'+u.uid})&&!g.p[0].board.includes(u)&&keep.a===6&&keep.h===8,[keep.a,keep.h]);
g=fresh('n');g.p[0].san=10;g.p[0].mad=3;X.act(g,0,{t:'hp'});ok('Wanderer power: +2 Sanity, -1 Madness',g.p[0].san===12&&g.p[0].mad===2);
g=fresh('v');g.p[0].flux=1;ok('power needs 2 Flux',!X.legal(g,0).some(a=>a.t==='hp'));
// pact / unhinged
g=fresh();let c=hand(g,'v10');X.play(g,0,c.uid);ok('Gaze Into Nothing: Pact 1, enemy +3',g.p[0].mad===1&&g.p[1].mad===3);
g=fresh();u=put(g,0,'n3');ok('Marine 3/4 when sane',u.a===3);g.p[0].mad=5;X.cleanup(g);ok('Marine Unhinged at 5 Madness: 5 Attack',u.a===5);g.p[0].mad=4;X.cleanup(g);ok('bonus lifts below 5',u.a===3);
g=fresh();g.p[0].mad=3;c=hand(g,'n10');const h0=g.p[0].hand.length;X.play(g,0,c.uid);ok('Navigator: Pact 2 pushes to 5, Unhinged draws 3',g.p[0].mad===5&&g.p[0].hand.length===h0-1+3,[g.p[0].mad,g.p[0].hand.length-h0]);
g=fresh();u=put(g,0,'c3');g.p[0].mad=6;X.startTurn(g);ok('Mutating Acolyte grows +2/+2 while Unhinged',u.a===3&&u.h===5,[u.a,u.h]);
// adjacency and placement
g=fresh();const a1=put(g,0,'v5'),a2=put(g,0,'v5');c=hand(g,'v6');X.play(g,0,c.uid,null,1);const ch=g.p[0].board[1];ok('placed between two units',ch.id==='v6');ok('Choir: both neighbours +1 Attack',a1.a===4&&a2.a===4,[a1.a,a2.a]);
X.destroy(g,a1);X.cleanup(g);ok('bonus lifts when the neighbour changes',a2.a===4&&g.p[0].board.length===2);
g=fresh();put(g,0,'v5');put(g,0,'v5');c=hand(g,'v6');ok('AI is offered every position for an adjacency card',X.legal(g,0).filter(a=>a.uid===c.uid).length===3);
g=fresh();put(g,0,'v5');c=hand(g,'v5');ok('positions are not multiplied when placement cannot matter',X.legal(g,0).filter(a=>a.uid===c.uid).length===1);
g=fresh('m');const w=put(g,0,'m46'),l=put(g,0,'m1');const far=put(g,0,'v5');X.cleanup(g);ok('Hull-Link Warden: adjacent Construct gets Guard +0/+2',l.k.includes('guard')&&l.h===4,[l.k,l.h]);ok('Warden: non-adjacent unit unaffected',!far.k.includes('guard')||C.v5.k.includes('guard'));
g=fresh();put(g,0,'m38');const s1=put(g,0,'c1');ok('Docking-Clamp: neighbour +0/+2',s1.h===4);
g=fresh();const b1=put(g,0,'c1'),b2=put(g,0,'c1'),b3=put(g,0,'c1');c=hand(g,'m37');X.play(g,0,c.uid,'u'+b2.uid);ok('Bulkhead Seal: target +0/+3 Guard, neighbours +0/+1',b2.h===5&&b2.k.includes('guard')&&b1.h===3&&b3.h===3);
// dynamic cost
g=fresh();put(g,0,'v1');put(g,0,'v5');put(g,0,'m1');c=hand(g,'v46');ok('Leviathan costs 1 less per Entity',X.costOf(g,0,c)===6);g.p[0].flux=6;ok('playable at the reduced cost',X.play(g,0,c.uid)&&g.p[0].flux===0);
// arrival and sacrifice triggers
g=fresh();put(g,0,'v45');c=hand(g,'v5');X.play(g,0,c.uid);ok('Hadal Cantor: Entity arrives -> enemy +1',g.p[1].mad===1);c=hand(g,'m1');X.play(g,0,c.uid);ok('Cantor ignores non-Entities',g.p[1].mad===1);
g=fresh('c');const vic=put(g,0,'c1');c=hand(g,'c46');X.play(g,0,c.uid);ok('Mother arrives with a Spawnling',g.p[0].board.filter(q=>q.id==='tC').length===1);c=hand(g,'c10');X.play(g,0,c.uid,'u'+vic.uid);ok('Mother of the Red Litter: sacrifice -> Spawnling',g.p[0].board.filter(q=>q.id==='tC').length===2);
g=fresh('c');put(g,0,'c46');const vic2=put(g,0,'c1');X.act(g,0,{t:'hp',tg:'u'+vic2.uid});ok('hero-power sacrifice also triggers the Mother',g.p[0].board.some(q=>q.id==='tC'));
g=fresh('c');put(g,0,'c46');put(g,0,'c1');c=hand(g,'c5');X.play(g,0,c.uid);ok('Offering counts as a sacrifice',g.p[0].board.some(q=>q.id==='tC'));
g=fresh();put(g,0,'c1');put(g,0,'c2');c=hand(g,'c9');X.play(g,0,c.uid);const tm=g.p[0].board.find(q=>q.id==='c9');ok('Thousand Mouths: +3/+3 per sacrifice',tm&&tm.a===14&&tm.h===14,tm&&[tm.a,tm.h]);
// epics
g=fresh('m');const k=put(g,0,'m45');X.endTurn(g);ok('KESTREL: one Drone with few Constructs',g.p[0].board.filter(q=>q.id==='tD').length===1);
g=fresh('m');put(g,0,'m45');put(g,0,'m1');put(g,0,'m2');put(g,0,'m5');X.endTurn(g);ok('KESTREL: two Drones with 4+ Constructs',g.p[0].board.filter(q=>q.id==='tD').length===2);
g=fresh('c');const cu=put(g,0,'c1');c=hand(g,'c45');X.play(g,0,c.uid);ok('Abbess: Pact 2, other Cultists get Drain',g.p[0].mad===2&&cu.k.includes('drain'));g.p[0].mad=5;X.cleanup(g);ok('Abbess Unhinged: +1 Attack',cu.a===3);
g=fresh('n');put(g,0,'n2');put(g,0,'tS');c=hand(g,'n17');X.play(g,0,c.uid);ok('Quartermaster: 1 + 2 Survivors for 2 Crew',g.p[0].board.filter(q=>q.id==='tS').length===4);ok('Quartermaster: other Crew +1 Health',g.p[0].board.find(q=>q.id==='n2').h===4);
// mulligan
g=X.newGame(X.prebuilt('v'),X.prebuilt('m'),{first:0,mull:1,ai:[0,1]});ok('human mulligan pauses the start',g.mullPending===1&&g.turn===0);
const before=g.p[0].hand.map(c=>c.uid),deckN=g.p[0].deck.length,handN=g.p[0].hand.length;ev(g,'mullDone(g,[g.p[0].hand[0].uid,g.p[0].hand[1].uid])');
ok('mulligan swaps 2 cards, keeps hand size and deck size, starts the turn',g.turn===1&&!g.mullPending&&g.p[0].hand.length===handN&&g.p[0].hand.filter(c=>before.includes(c.uid)).length===handN-2&&g.p[0].deck.length===deckN,[g.turn,g.p[0].hand.length,handN,g.p[0].deck.length,deckN]);
g=X.newGame(X.prebuilt('v'),X.prebuilt('m'),{first:0,ai:[1,1],sim:1});ok('AI games mulligan automatically and start at once',g.turn===1&&!g.mullPending);
console.log(fails?fails+' failed':'all rules checks passed');process.exit(fails?1:0);

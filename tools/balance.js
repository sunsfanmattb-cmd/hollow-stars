/* Headless balance play-test: AI vs AI across many generated decks.
   node tools/balance.js [games_per_matchup=400] [decks_per_faction=12] [seed=1] [--starter] [--json out.json] [--dif normal|nightmare] [--nohp]
   Decks: 30 cards from a faction's collectible cards plus Wanderers (max 2 copies, 1 per Legendary), curve-weighted,
   about 2/3 units. --starter uses the starter decks instead. Prints faction and matchup win rates, first-player edge, game
   length, how games end, hero-power use, and per-card win rate when played (cards played in at least 40 games). */
const load=require('./sim_load.js'),X=load();
const args=process.argv.slice(2),num=(i,d)=>isFinite(+args[i])?+args[i]:d;
const GPM=num(0,400),DPF=num(1,12),SEED=num(2,1),STARTER=args.includes('--starter'),JOUT=args.includes('--json')?args[args.indexOf('--json')+1]:null;
const DIF=args.includes('--dif')?args[args.indexOf('--dif')+1]:'normal';
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const R=mulberry(SEED);X.setR(R);
if(args.includes('--nohp'))for(const k of Object.keys(X.HP))delete X.HP[k];  /* compare without hero powers */
const FS=['v','m','c'];
function genDeck(f,r){const pool=X.COL.filter(id=>{const d=X.C[id];return(d.f===f||d.f==='n')&&d.r!=='T'});const cards=[],cnt={};
 const w=id=>{const d=X.C[id];const cw=[.5,1,1.6,1.6,1.4,1.1,.8,.6,.45,.35,.3][Math.min(10,d.c)];return cw*(d.t==='u'?1.25:1)*(d.f==='n'?.55:1)};
 let guard=0;while(cards.length<30&&guard++<2000){let tot=0;const ok=pool.filter(id=>(cnt[id]||0)<(X.C[id].r==='L'?1:2));for(const id of ok)tot+=w(id);let x=r()*tot,pickId=ok[0];for(const id of ok){x-=w(id);if(x<=0){pickId=id;break}}cards.push(pickId);cnt[pickId]=(cnt[pickId]||0)+1}
 return{fac:f,name:f,cards}}
const decks={};for(const f of FS)decks[f]=STARTER?[X.prebuilt(f)]:Array.from({length:DPF},()=>genDeck(f,R));
const st={games:0,first:0,turns:0,reason:{},draws:0,fw:{v:[0,0],m:[0,0],c:[0,0]},mu:{},card:{},hp:{v:[0,0],m:[0,0],c:[0,0]},hpWin:{},mull:0};
function play1(d0,d1,first){const g=X.newGame(d0,d1,{ai:[1,1],sim:1,first,dif:DIF});const played=[new Set(),new Set()];
 for(let n=0;n<300&&!g.over;n++){const pi=g.cur;for(let k=0;k<40&&!g.over;k++){const a=X.aiChoose(g,pi,DIF==='nightmare'?0:1);if(!a)break;if(a.t==='play'){const c=g.p[pi].hand.find(c=>c.uid===a.uid);if(c)played[pi].add(c.id)}if(a.t==='hp'){st.hp[g.p[pi].fac][0]++;played[pi].add('HP:'+g.p[pi].fac)}X.act(g,pi,a)}if(!g.over)X.endTurn(g)}
 return{g,played}}
for(let i=0;i<FS.length;i++)for(let j=i;j<FS.length;j++){const a=FS[i],b=FS[j],key=a+b;st.mu[key]=[0,0,0];
 for(let n=0;n<GPM;n++){const d0=decks[a][Math.floor(R()*decks[a].length)],d1=decks[b][Math.floor(R()*decks[b].length)];const first=n%2;
  const{g,played}=play1(d0,d1,first);st.games++;st.turns+=g.turn;st.reason[g.reason]=(st.reason[g.reason]||0)+1;
  if(g.winner===-1){st.draws++;st.mu[key][2]++;continue}if(g.winner===first)st.first++;
  const wf=g.p[g.winner].fac,lf=g.p[1-g.winner].fac;if(a!==b){st.fw[wf][0]++;st.fw[lf][1]++;st.mu[key][g.winner===0?0:1]++}else st.mu[key][0]++;
  for(let pi=0;pi<2;pi++)for(const id of played[pi]){const c=st.card[id]||(st.card[id]=[0,0]);c[1]++;if(g.winner===pi)c[0]++}}}
const pct=(a,b)=>b?(100*a/b).toFixed(1)+'%':'-';
const decisive=st.games-st.draws;
console.log(`games ${st.games} (${STARTER?'starter decks':DPF+' decks per faction'}, AI ${DIF})  draws ${st.draws}  avg turns ${(st.turns/st.games).toFixed(1)}`);
console.log(`first player wins ${pct(st.first,decisive)}   endings: ${Object.entries(st.reason).map(([k,v])=>k+' '+pct(v,st.games)).join(', ')}`);
console.log('faction win rate (vs other factions): '+FS.map(f=>`${f} ${pct(st.fw[f][0],st.fw[f][0]+st.fw[f][1])}`).join('  '));
console.log('matchups (row wins): '+Object.entries(st.mu).filter(([k])=>k[0]!==k[1]).map(([k,v])=>`${k[0]}>${k[1]} ${pct(v[0],v[0]+v[1])}`).join('  '));
const hpLine=FS.map(f=>`${f} ${(st.hp[f][0]/Math.max(1,st.games)).toFixed(2)}/game`).join('  ');console.log('hero power uses: '+hpLine);
const rows=Object.entries(st.card).filter(([,v])=>v[1]>=40).map(([id,v])=>[id,v[0]/v[1],v[1]]).sort((x,y)=>y[1]-x[1]);
const nm=id=>id.startsWith('HP:')?'Hero power '+id.slice(3):X.C[id]?X.C[id].n:id;
console.log('\ncards: highest win rate when played');for(const r of rows.slice(0,15))console.log(`  ${(r[1]*100).toFixed(1)}%  ${r[0].padEnd(5)} ${nm(r[0]).padEnd(32)} (${r[2]} games)`);
console.log('cards: lowest win rate when played');for(const r of rows.slice(-12))console.log(`  ${(r[1]*100).toFixed(1)}%  ${r[0].padEnd(5)} ${nm(r[0]).padEnd(32)} (${r[2]} games)`);
if(JOUT)require('fs').writeFileSync(JOUT,JSON.stringify({st,rows},null,1));

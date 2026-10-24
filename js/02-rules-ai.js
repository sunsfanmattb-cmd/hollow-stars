'use strict';
/* ================= RULES ================= */
function fx(g,o){if(!g.sim)g.fx.push(o)}
function units(g){return g.p[0].board.concat(g.p[1].board)}
function findU(g,uid){for(const p of g.p)for(const u of p.board)if(u.uid===uid)return u}
function resolve(g,t){if(!t)return null;if(t[0]==='h')return{k:'h',pi:+t[1]};const u=findU(g,+t.slice(1));return u?{k:'u',pi:u.o,u}:null}
function addMad(g,pi,n){if(n>0&&g.rule&&g.rule.includes('w_mad'))n*=2;const p=g.p[pi],b=p.mad;p.mad=Math.max(0,Math.min(10,p.mad+n));if(p.mad!==b)fx(g,{k:'mad',pi,n:p.mad-b})}
function healH(g,pi,n){const p=g.p[pi],b=p.san,cap=Math.max(20,p.cap||20);if(p.san>=cap)return;p.san=Math.min(cap,p.san+n);if(p.san>b)fx(g,{k:'heal',id:'h'+pi,n:p.san-b})}
function hurtH(g,pi,n,src){if(n<=0)return;g.p[pi].san-=n;if(pi===1&&g.st)g.st.dmg+=n;fx(g,{k:'dmg',id:'h'+pi,n,s:src?src.uid:0,f:src?C[src.id].f:g.sf||null});if(src&&src.k.includes('drain'))healH(g,src.o,n)}
function hurtU(g,u,n,src){if(n<=0||u.dead)return;if(u.k.includes('ward')){u.k=u.k.filter(k=>k!=='ward');fx(g,{k:'ward',id:'u'+u.uid});return}u.h-=n;if(src&&src.k.includes('corrupt')&&u.h>0&&u.a>0){u.a--;fx(g,{k:'cor',id:'u'+u.uid})}fx(g,{k:'dmg',id:'u'+u.uid,n,s:src?src.uid:0,f:src?C[src.id].f:g.sf||null});if(src){if(src.k.includes('blight')&&u.h>0){u.h=0;fx(g,{k:'blight',id:'u'+u.uid})}if(src.k.includes('drain'))healH(g,src.o,n)}}
function hurt(g,T,n,src){if(T.k==='h')hurtH(g,T.pi,n,src);else hurtU(g,T.u,n,src)}
function destroy(g,u){u.h=0;u.dead=1}
function buff(u,a,h){u.a+=a;u.h+=h;u.mh+=h}
function draw(g,pi,n=1){const p=g.p[pi];for(let i=0;i<n;i++){if(!p.deck.length){p.fat++;fx(g,{k:'fatigue',pi,n:p.fat});hurtH(g,pi,p.fat);addMad(g,pi,1);continue}const id=p.deck.pop();if(p.hand.length>=10){fx(g,{k:'burn',pi,cid:id});continue}p.hand.push({uid:g.uid++,id});fx(g,{k:'draw',pi})}}
function mkUnit(g,pi,id,uid){const d=C[id],R=g.rule||[],gl=R.includes('w_glass');const u={uid:uid??g.uid++,id,o:pi,a:d.a+(gl?2:0),h:Math.max(1,d.h-(gl?1:0)),k:d.k.slice(),ready:d.k.includes('swift')||R.includes('w_swift'),atk:0,dead:0};u.mh=u.h;if(R.includes('w_ward')&&!u.k.includes('ward')&&d.r!=='T')u.k.push('ward');return u}
function summon(g,pi,id){const p=g.p[pi];if(p.board.length>=6)return null;const u=mkUnit(g,pi,id);p.board.push(u);fx(g,{k:'summon',id:'u'+u.uid});return u}
function sacrifice(g,pi,ex){const b=g.p[pi].board.filter(u=>u!==ex&&u.h>0);if(!b.length)return null;b.sort((x,y)=>(x.a+x.h)-(y.a+y.h));destroy(g,b[0]);fx(g,{k:'sac',id:'u'+b[0].uid});return b[0]}
function cleanup(g){for(let n=0;n<30;n++){let any=false;for(let pi=0;pi<2;pi++){const p=g.p[pi],dead=p.board.filter(u=>u.h<=0);if(!dead.length)continue;any=true;p.board=p.board.filter(u=>u.h>0);for(const u of dead){u.dead=1;fx(g,{k:'die',id:'u'+u.uid,cid:u.id,o:u.o});if(u.k.includes('salvage'))draw(g,pi,1);const d=C[u.id];if(d.death)d.death(g,pi,u)}}if(!any)break}checkWin(g)}
function checkWin(g){if(g.over)return;const l=g.p.map(p=>p.san<=0||p.mad>=10);if(l[0]||l[1]){g.over=true;g.winner=l[0]&&l[1]?-1:l[0]?1:0;const lp=g.p[l[0]?0:1];g.reason=lp.mad>=10?'mad':'san'}}
function spellTargets(g,pi,tg){const r=[],add=pj=>{for(const u of g.p[pj].board)r.push('u'+u.uid)};
 if(tg==='unit'){add(0);add(1)}else if(tg==='enemyUnit')add(1-pi);else if(tg==='friendlyUnit')add(pi);else if(tg==='enemy'){add(1-pi);r.push('h'+(1-pi))}else if(tg==='any'){add(0);add(1);r.push('h0','h1')}return r}
function canAtk(u){return u.ready&&!u.atk&&u.a>0&&u.h>0}
function atkTargets(g,pi,u){const ph=u.k.includes('phase');const e=E(g,pi).board.filter(t=>ph||!t.k.includes('phase'));const gd=e.filter(t=>t.k.includes('guard'));if(!ph&&gd.length)return gd.map(t=>'u'+t.uid);return e.map(t=>'u'+t.uid).concat('h'+(1-pi))}
function canPlay(g,pi,c){const p=g.p[pi],d=C[c.id];if(g.over||g.cur!==pi||d.c>p.flux)return false;if(d.t==='u')return p.board.length<6;if(d.tg)return spellTargets(g,pi,d.tg).length>0;return true}
function play(g,pi,huid,tg){const p=g.p[pi],i=p.hand.findIndex(c=>c.uid===huid);if(i<0)return false;const c=p.hand[i],d=C[c.id];if(!canPlay(g,pi,c))return false;
 if(d.tg&&(!tg||!spellTargets(g,pi,d.tg).includes(tg)))return false;
 p.hand.splice(i,1);p.flux-=d.c;g.sf=d.f;if(!c.echo&&(d.k.includes('echo')||(d.t==='s'&&g.rule&&g.rule.includes('w_echo')))&&p.hand.length<10){p.hand.push({uid:g.uid++,id:c.id,echo:1});fx(g,{k:'echo',pi,cid:c.id})}if(pi===0&&g.st&&!g.sim){const t=g.st;if(d.t==='s')t.rites++;else t.units++;if(d.r==='L')t.leg++;t.plays[c.id]=(t.plays[c.id]||0)+1}fx(g,{k:'play',pi,cid:c.id,tg,uid:c.uid,e:c.echo?1:0});
 if(d.t==='u'){const u=mkUnit(g,pi,c.id,c.uid);p.board.push(u);if(d.dread)addMad(g,1-pi,d.dread);if(d.play)d.play(g,pi,u)}
 else{if(tg)fx(g,{k:'spellhit',id:tg,f:d.f});d.cast(g,pi,resolve(g,tg))}
 g.sf=null;cleanup(g);return true}
function attack(g,pi,uid,tg){const u=g.p[pi].board.find(x=>x.uid===uid);if(!u||g.over||g.cur!==pi||!canAtk(u)||!atkTargets(g,pi,u).includes(tg))return false;const T=resolve(g,tg);u.atk=1;
 if(T.k==='h')hurtH(g,T.pi,u.a,u);else{const v=T.u,va=v.a;hurtU(g,v,u.a,u);hurtU(g,u,va,v);for(const[a,b]of[[u,v],[v,u]])if(a.k.includes('devour')&&a.h>0&&b.h<=0){buff(a,1,1);fx(g,{k:'buff',id:'u'+a.uid})}}
 cleanup(g);return true}
function startTurn(g){const pi=g.cur,p=g.p[pi];g.turn++;p.max=Math.min(10,p.max+1);p.flux=p.max;if(p.bonusF){p.flux+=p.bonusF;p.bonusF=0}for(const u of p.board){u.ready=true;u.atk=0}
 fx(g,{k:'turn',pi});for(const u of p.board.slice()){const d=C[u.id];if(d.start&&u.h>0)d.start(g,pi,u)}if(g.rule&&g.rule.length)ruleStart(g,pi);
 if(g.turn>1)draw(g,pi,g.rule&&g.rule.includes('w_draw')&&g.turn>2?2:1);cleanup(g)}
function endTurn(g){if(g.over)return;const pi=g.cur;for(const u of g.p[pi].board.slice()){const d=C[u.id];if(d.end&&u.h>0)d.end(g,pi,u)}{const h=g.p[pi].hand,n=h.length;g.p[pi].hand=h.filter(c=>!c.echo);if(g.p[pi].hand.length<n)fx(g,{k:'echoFade',pi})}cleanup(g);if(g.over)return;g.cur=1-pi;
 if(g.turn>=120){g.over=true;const s=g.p.map(p=>p.san-p.mad);g.winner=s[0]===s[1]?-1:s[0]>s[1]?0:1;g.reason='time';return}startTurn(g)}
function newGame(d0,d1,o={}){const g={p:[],cur:0,turn:0,uid:1,fx:[],over:false,winner:null,sim:o.sim?1:0,rule:(o.rule||[]).slice(),dif:o.dif||'normal',st:{rites:0,units:0,dmg:0,leg:0,plays:{}}};
 [d0,d1].forEach((d,pi)=>g.p.push({fac:d.fac,name:d.name,deck:shuffle(d.cards.slice()),hand:[],board:[],san:20,mad:0,flux:0,max:0,fat:0,ai:!!(o.ai&&o.ai[pi])}));
 ruleInit(g,o);for(const p of g.p)p.cap=Math.max(20,p.san);g.cur=o.first??(rnd()<.5?0:1);draw(g,0,5);draw(g,1,5);/* v1.6: the side going second draws a 6th card and gets +1 Flux on its first turn (AI self-play: first-player win rate 70% -> 49%) */{const s2=1-g.cur;draw(g,s2,1);g.p[s2].bonusF=1;g.second=s2}g.fx=[];startTurn(g);return g}
/* v8 chapter rules (campaign) + difficulty edge. Rules are plain strings in g.rule; all effects are ordinary engine calls. */
function ruleInit(g,o){const R=g.rule,me=g.p[0],en=g.p[1];if(R.includes('w_san'))for(const p of g.p)p.san+=5;if(R.includes('w_flux'))for(const p of g.p)p.max+=1;if(R.includes('mad3'))me.mad=3;if(g.dif==='nightmare')me.mad+=1;if(o.esan)en.san+=o.esan;if(R.includes('surge'))en.max+=1}
function ruleStart(g,pi){const R=g.rule,p=g.p[pi],bt=Math.floor(g.turn/2);
 if(pi===1&&R.includes('grow')&&bt%3===0){const b=p.board.filter(x=>x.h>0);if(b.length){const t=b.reduce((a,x)=>x.a+x.h>a.a+a.h?x:a);buff(t,1,1);fx(g,{k:'buff',id:'u'+t.uid})}}
 if(R.includes('tide')){const t=p.board.find(x=>x.h>0);if(t)hurtU(g,t,1,null)}
 if(pi===1&&R.includes('fleet')&&bt%3===1)summon(g,1,'tD');
 if(pi===1&&R.includes('whisper')&&bt%4===3)addMad(g,0,1);
 if(pi===0&&R.includes('bleed')&&bt%3===2){hurtH(g,0,1,null);healH(g,1,1)}}

/* ================= AI ================= */
function legal(g,pi){const p=g.p[pi],A=[];if(g.over||g.cur!==pi)return A;
 for(const c of p.hand){const d=C[c.id];if(!canPlay(g,pi,c))continue;if(d.tg)for(const T of spellTargets(g,pi,d.tg))A.push({t:'play',uid:c.uid,tg:T});else A.push({t:'play',uid:c.uid})}
 for(const u of p.board)if(canAtk(u))for(const T of atkTargets(g,pi,u))A.push({t:'atk',uid:u.uid,tg:T});return A}
function act(g,pi,a){return a.t==='play'?play(g,pi,a.uid,a.tg):attack(g,pi,a.uid,a.tg)}
const cloneG=typeof structuredClone==='function'?g=>{const c=structuredClone(g);c.fx=[];c.sim=1;return c}:g=>{const c=JSON.parse(JSON.stringify(g));c.fx=[];c.sim=1;return c};
const sanV=s=>s<=0?-80:s-(s<12?(12-s)*(12-s)*.07:0);
const madV=m=>m*.7+m*m*.13;
const KWV={guard:.8,phase:1.1,blight:1.7,salvage:.9,ward:1,devour:.7,corrupt:.6};
function unitV(u){const d=C[u.id];let v=1+u.a*1.1+Math.max(u.h,0)*.9;for(const k of u.k){v+=KWV[k]||0;if(k==='drain')v+=u.a*.4}if(d.start||d.end)v+=1.8;return v}
function evalS(g,pi){if(g.over)return g.winner===pi?1e6:g.winner===-1?-1e5:-1e6;const m=g.p[pi],o=g.p[1-pi];let s=sanV(m.san)-sanV(o.san)+madV(o.mad)-madV(m.mad);
 for(const u of m.board)s+=unitV(u);for(const u of o.board)s-=unitV(u);const hn=p=>p.hand.reduce((n,c)=>n+(c.echo?.15:1),0);return s+Math.min(hn(m),8)*.9-Math.min(hn(o),8)*.9}
function aiChoose(g,pi,raw){const A=legal(g,pi);if(!A.length)return null;const dif=raw||pi!==1?'normal':g.dif;
 if(dif==='easy'&&rnd()<.35)return rnd()<.3?null:A[Math.floor(rnd()*A.length)];/* Easy: about a third of its moves are blunders or an early pass */
 const sr=rnd;let best=null,bv=evalS(g,pi)+.05;const sc=[];
 for(const a of A){const c=cloneG(g);act(c,pi,a);const v=evalS(c,pi)+(a.t==='atk'&&a.tg[0]==='h'?.02:0);sc.push([v,a,c]);if(v>bv){bv=v;best=a}}
 if(dif==='nightmare'&&sc.length>1){/* Nightmare: turn-level lookahead: the best 6 first moves are each played out greedily to the end of the turn */
  sc.sort((x,y)=>y[0]-x[0]);let nb=null,nv=evalS(g,pi)+.05;for(const[,a,c]of sc.slice(0,6)){for(let n=0;n<10&&!c.over;n++){const b=aiChoose(c,pi,1);if(!b)break;act(c,pi,b)}const v=evalS(c,pi);if(v>nv){nv=v;nb=a}}best=nb}
 rnd=sr;return best}
function aiTurnSync(g){const pi=g.cur;for(let n=0;n<40&&!g.over;n++){const a=aiChoose(g,pi);if(!a)break;act(g,pi,a)}if(!g.over)endTurn(g)}
function simulate(f0,f1,first){const g=newGame(typeof f0==='string'?prebuilt(f0):f0,typeof f1==='string'?prebuilt(f1):f1,{ai:[1,1],sim:1,first});for(let n=0;n<300&&!g.over;n++)aiTurnSync(g);return{winner:g.winner,turns:g.turn,reason:g.reason,san:g.p.map(p=>p.san),mad:g.p.map(p=>p.mad),over:g.over}}
/* Hollow Stars. RENDERING RULES: read /RENDERING_RULES.md before changing card visuals, animations, video or art.
   (transform/opacity only, no blend modes or animated filters, no class toggling mid-animation or DOM rebuilds, video rules,
   layer budget, image sizes, text auto-fit; new cards must pass tests/cardcheck.py, tests/paintprobe.py and tests/flicker.py) */

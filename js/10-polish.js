'use strict';
/* ================= v1.8 POLISH =================
   Haptics, audio stingers, Madness spikes + low-Sanity heartbeat, legendary landing, end-of-match sequence,
   smoother card tilt (gyro + finger). Everything here wraps existing functions instead of editing them,
   so removing this file (and css/polish.css) restores v1.7 behaviour exactly.
   Rendering: transform/opacity only (RENDERING_RULES.md). */

/* ---------------- haptics ---------------- */
/* One vibration per batch of game events: the highest-priority event wins, so a board wipe is one
   strong buzz instead of a rattle. Needs android.permission.VIBRATE in the APK manifest. */
const HAP={on:(()=>{try{return localStorage.getItem('hsHap')!=='0'}catch(e){return true}})(),until:0,pri:-1,n:0,log:[]};
const HAPP={turn:[1,9],drop:[1,14],hit:[1,18],hitBig:[2,[24,30,28]],die:[2,[18,40,46]],mad:[3,[12,70,12,70,50]],hurt:[3,[36,44,30]],
 land:[4,[55,40,30]],legend:[4,[30,60,60,40,110]],low:[4,[60,120,60]],win:[5,[30,90,30,90,170]],lose:[5,[280,90,140]]};
function hapMs(p){return Array.isArray(p)?p.reduce((a,b)=>a+b,0):p}
function hap(k){const d=HAPP[k];if(!d||!HAP.on||!navigator.vibrate||document.hidden)return;if(G&&G.sim)return;
 const now=performance.now(),[pri,pat]=d;if(now<HAP.until&&pri<=HAP.pri)return;
 HAP.until=now+hapMs(pat);HAP.pri=pri;HAP.n++;HAP.log.push(k);if(HAP.log.length>40)HAP.log.shift();try{navigator.vibrate(pat)}catch(e){}}
function hapFx(L){let best=null;for(const f of L){let k=null;
  switch(f.k){
   case'play':k=C[f.cid]&&C[f.cid].r==='L'?'legend':'drop';break;
   case'summon':k='drop';break;
   case'dmg':k=f.id==='h0'?'hurt':f.id[0]==='h'||f.n>=4?'hitBig':'hit';break;
   case'die':k='die';break;
   case'mad':if(f.pi===0&&f.n>0)k='mad';break;
   case'turn':if(f.pi===0&&!UI.auto)k='turn';break}
  if(k&&(!best||HAPP[k][0]>HAPP[best][0]))best=k}
 if(best)hap(best)}

/* ---------------- audio stingers ---------------- */
/* Short musical cues layered on the procedural drone. turn/turnE replace the old single tones. */
Object.assign(SFX,{
 turn:()=>{tone(73.4,73.4,1.9,'triangle',.08,1);tone(146.8,146.8,1.6,'sine',.045,1,.02);
  [587.3,698.5,880,1174.7].forEach((f,i)=>tone(f,f*.998,1.6-i*.2,'sine',.038-i*.006,1,.05+i*.085));noise(1.1,300,1,.03,'lowpass',2200)},
 turnE:()=>{tone(55,51,1.8,'sawtooth',.03,1);tone(110,103,1.5,'triangle',.04,1);tone(233.1,226,1.4,'sine',.022,1,.06);tone(246.9,240,1.4,'sine',.018,1,.06)},
 stLow:()=>{tone(55,40,.26,'sine',.3);tone(52,37,.24,'sine',.22,0,.27);tone(311.1,300,2.2,'triangle',.032,1,.12);tone(440,424,2.2,'triangle',.026,1,.12);noise(1.6,180,2,.05,'lowpass',90,.1)},
 stMad:()=>{tone(92.5,87,1.2,'sawtooth',.03,1);[466.2,493.9].forEach((f,i)=>tone(f,f*.94,1.1,'sine',.025,1,i*.04))},
 stLand:()=>{tone(41.2,29,1.1,'sine',.36);noise(.8,600,1,.22,'lowpass',55);tone(82.4,61,.7,'triangle',.06,1,.02)},
 stWin:()=>{tone(65.4,65.4,3.2,'sawtooth',.045,1);noise(1.4,2400,1,.05,'highpass',8000);
  [130.8,196,261.6,329.6,392,523.3].forEach((f,i)=>tone(f,f,2.6,'triangle',.05,1,.15+i*.11));tone(1046.5,1046.5,2.4,'sine',.03,1,.8)},
 stLose:()=>{tone(41.2,27.5,3.4,'sawtooth',.08,1);noise(1.8,900,1,.24,'lowpass',40);
  [311.1,293.7,261.6,233.1].forEach((f,i)=>tone(f,f*.7,2.4,'triangle',.04,1,.2+i*.22))}
});

/* ---------------- Madness spike + low Sanity ---------------- */
const PL={low:0,g:null};
function plEls(){const m=$('#match');if(!m)return;if(!$('#madk')){const k=document.createElement('div');k.id='madk';m.appendChild(k)}
 if(!$('#lowv')){const l=document.createElement('div');l.id='lowv';m.appendChild(l)}}
function madSpike(){if(fxLow())return;plEls();restartCls($('#madk'),'on');sfx('stMad')}
function lowCheck(){if(!G||G.sim)return;if(PL.g!==G){PL.g=G;PL.low=0}const s=G.p[0].san,st=s<=0?PL.low:s<=4?2:s<=8?1:0,m=$('#match');
 if(st>PL.low){sfx('stLow');hap('low')}PL.low=st;if(m){m.classList.toggle('lowsan',st>=1);m.classList.toggle('lowsan2',st>=2)}}

{const f0=flushFx;flushFx=function(){let L=null;try{if(G&&!G.sim&&G.fx&&G.fx.length){L=G.fx.slice();hapFx(L)}}catch(e){}
 const r=f0.apply(this,arguments);
 try{if(L){if(L.some(f=>f.k==='mad'&&f.pi===0&&f.n>0))madSpike();lowCheck()}}catch(e){console.warn('polish fx',e)}return r}}

/* ---------------- legendary landing ---------------- */
/* The entrance cinematic already flies the art into its slot; this adds the weight when it lands:
   a faction shockwave across the mat, a ground glow that lingers under the unit, a bass hit and a buzz. */
const LCOL={v:'#b070ff',m:'#40e0f0',c:'#ff2a3a',n:'#ffd070'};
function landFx(uid,id){const el=tEl('u'+uid);if(!el||!C[id])return;const f=C[id].f,[x,y]=center(el),r=el.getBoundingClientRect(),col=LCOL[f]||LCOL.n;
 sfx('stLand');hap('land');if(fxLow())return;
 for(let i=0;i<nq(4);i++){const g=sp('rg',x,y,0,0,.9+i*.18,Math.max(innerWidth,innerHeight)*.7,col);if(g){g.k=2.6-i*.45;g.vr=.4;g.a=.7-i*.13;g.dl=i*.07;g.add=1}}
 const gl=sp('fl',x,r.bottom-r.height*.1,0,0,2.4,r.width*2.1,col);if(gl){gl.add=1;gl.a=.4}
 for(let i=0;i<nq(26);i++){const a=rr(Math.PI*1.05,Math.PI*1.95),s=rr(140,460),p=sp('sp',x+rr(-r.width*.5,r.width*.5),r.bottom-4,Math.cos(a)*s,Math.sin(a)*s,rr(.4,.9),rr(1.2,2.6),i%3?col:'#fff2d8');if(p){p.add=1;p.g=700}}
 const ring=document.createElement('i');ring.className='lgring';el.appendChild(ring);setTimeout(()=>ring.remove(),2500)}
{const c0=lgCinema;lgCinema=function(id,uid){const p=c0.apply(this,arguments);if(p&&p.then){const g=G;p.then(()=>{if(G===g)setTimeout(()=>landFx(uid,id),30)})}return p}}

/* ---------------- end-of-match sequence ---------------- */
/* Before the victory/defeat screen: the losing hero's portrait cracks and breaks, the screen floods with light
   (victory) or the dark closes in (defeat), and a line of text fades in. Then the normal end screen appears. */
const CRACK="data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none" stroke-linecap="round"><g stroke="#000" stroke-width="3.2" opacity=".85"><path d="M50 48 L38 30 L41 18 L33 2"/><path d="M50 48 L66 34 L70 20 L84 8"/><path d="M50 48 L74 55 L90 52 L100 60"/><path d="M50 48 L60 70 L56 84 L64 100"/><path d="M50 48 L32 62 L18 60 L2 72"/><path d="M50 48 L28 44 L12 34 L0 36"/><path d="M41 18 L52 12"/><path d="M74 55 L80 68"/><path d="M32 62 L30 78"/></g><g stroke="#fff3d8" stroke-width="1" opacity=".75"><path d="M50 48 L38 30 L41 18 L33 2"/><path d="M50 48 L66 34 L70 20 L84 8"/><path d="M50 48 L74 55 L90 52 L100 60"/><path d="M50 48 L60 70 L56 84 L64 100"/><path d="M50 48 L32 62 L18 60 L2 72"/><path d="M50 48 L28 44 L12 34 L0 36"/></g></svg>');
const ENDTXT={win:['THE VOID RECEDES','Their mind is lost. Yours endures.'],lose:['YOUR LIGHT GOES OUT','The dark was always patient.'],draw:['ALL IS DARK','Nothing remains to remember either of you.']};
function endEl(){let e=$('#endfx');if(!e){e=document.createElement('div');e.id='endfx';e.innerHTML='<i class="ef-l"></i><i class="ef-v"></i><div class="ef-t"><b></b><small></small></div>';document.body.appendChild(e)}return e}
function endClean(){const e=$('#endfx');if(e)e.className='';for(const pi of[0,1]){const h=heroBox(pi);if(h){h.classList.remove('hsdead','hswin');const k=h.querySelector('.hcrk');if(k)k.remove()}}}
function endSeq(g){return new Promise(res=>{const w=g.winner,me=w===0,kind=w===-1?'draw':me?'win':'lose',low=fxLow(),e=endEl();endClean();
 const lose=w===-1?null:heroBox(me?1:0),winH=w===-1?null:heroBox(me?0:1);let ex=50,ey=50;
 if(lose){const r=lose.getBoundingClientRect();ex=(r.left+r.width/2)/innerWidth*100;ey=(r.top+r.height/2)/innerHeight*100;
  const av=lose.querySelector('.av')||lose;av.insertAdjacentHTML('beforeend',`<i class="hcrk" style="background-image:url(&quot;${CRACK}&quot;)"></i>`);lose.classList.add('hsdead');
  if(!low){const cx=r.left+r.width/2,cy=r.top+r.height/2,f=g.p[me?1:0].fac,col=LCOL[f]||LCOL.n;
   setTimeout(()=>{shake($('#match'),9,320);
    for(let i=0;i<nq(46);i++){const a=rr(0,7),s=rr(120,620),p=sp('sp',cx,cy,Math.cos(a)*s,Math.sin(a)*s,rr(.5,1.2),rr(1.4,3.2),me?(i%3?'#ffe2a0':'#ffffff'):(i%3?col:'#ff3040'));if(p){p.add=1;p.dr=2;p.g=me?120:420}}
    for(let i=0;i<nq(18);i++){const p=sp('as',cx+rr(-30,30),cy+rr(-20,20),rr(-160,160),rr(-300,-60),rr(.9,1.6),rr(3,7),'#2a2028');if(p){p.g=700;p.k=rr(0,6)}}
    const fl=sp('fl',cx,cy,0,0,.7,r.width*3.2,me?'#ffd890':'#ff2030');if(fl){fl.add=1;fl.a=.75}},D(380))}}
 if(winH)winH.classList.add('hswin');
 e.style.setProperty('--ex',ex.toFixed(1)+'%');e.style.setProperty('--ey',ey.toFixed(1)+'%');
 e.querySelector('.ef-t b').textContent=ENDTXT[kind][0];e.querySelector('.ef-t small').textContent=ENDTXT[kind][1];
 e.className='on '+kind+(low?' low':'');sfx(me?'stWin':'stLose');hap(me?'win':'lose');setTimeout(res,D(low?800:2100))})}
{const g0=gameOver;gameOver=function(){const g=G;if(!g||g._endSeq||!$('#match').classList.contains('on'))return g0.apply(this,arguments);
 g._endSeq=1;cinSkip();endSeq(g).then(()=>{if(G!==g){endClean();return}g0();setTimeout(()=>{const e=$('#endfx');if(e)e.classList.add('out');setTimeout(endClean,700)},500)})}}
{const s0=startMatch;startMatch=function(){endClean();PL.low=0;PL.g=null;const m=$('#match');if(m)m.classList.remove('lowsan','lowsan2');return s0.apply(this,arguments)}}
{const o0=ovHide;ovHide=function(){endClean();return o0.apply(this,arguments)}}

/* ---------------- smoother tilt ---------------- */
/* v1.7 fed raw sensor angles straight into the tilt target and eased with a fixed per-frame factor, so sensor noise
   showed up as shimmer in the foil and the speed depended on frame rate. Now: the sensor runs through an adaptive One Euro filter,
   a 0.6 deg dead zone stops resting jitter, the neutral angle slowly follows how you hold the phone (~4 s),
   easing is time-based, and the light layers move in sub-step increments instead of 1/500 steps. */
/* One Euro filter (Casiez et al.): heavy smoothing when the phone is nearly still, little lag when it moves fast */
function oneEuro(minCut=.7,beta=.012,dCut=1){let x=null,dx=0;const al=(c,dt)=>{const r=2*Math.PI*c*dt/1000;return r/(r+1)};
 return(v,dt)=>{if(x===null){x=v;return v}const d=(v-x)*1000/dt,ad=al(dCut,dt);dx+=(d-dx)*ad;const a=al(minCut+beta*Math.abs(dx),dt);x+=(v-x)*a;return x}}
const ztT2=(a,v)=>{if(a){const t=(Math.max(-1,Math.min(1,v))+1)*500;if(Math.abs(a.currentTime-t)>.04)a.currentTime=t}};
orient=function(e){if(e.gamma==null||e.beta==null)return;ZT.ev++;const a=scrAngle();let x,y;
 if(a===90){x=e.beta;y=-e.gamma}else if(a===270){x=-e.beta;y=e.gamma}else if(a===180){x=-e.gamma;y=-e.beta}else{x=e.gamma;y=e.beta}
 TL.ox=x;TL.oy=y;if(!ZT.c)return;const now=performance.now();
 let S=ZT.lp;if(!S||S.a!==a){S=ZT.lp={x,y,t:now,a,fx:oneEuro(),fy:oneEuro()};ZT.base=null}
 const dt=Math.max(1,Math.min(100,now-S.t));S.t=now;S.x=S.fx(x,dt);S.y=S.fy(y,dt);
 if(!ZT.base||ZT.base.a!==a)ZT.base={x:S.x,y:S.y,a};const kb=1-Math.exp(-dt/4000);ZT.base.x+=(S.x-ZT.base.x)*kb;ZT.base.y+=(S.y-ZT.base.y)*kb;
 const map=v=>{const m=Math.abs(v);return m<.6?0:Math.tanh(Math.sign(v)*(m-.6)/20)};
 ZT.sens=now;if(now-ZT.fing>600){ZT.tx=map(S.x-ZT.base.x);ZT.ty=map(S.y-ZT.base.y)}ztKick()};
ztFrame=function(t){ZT.raf=0;const c=ZT.c;if(!c||!c.isConnected){ZT.c=null;ZT.lt=0;return}
 const now=t||performance.now(),dt=ZT.lt?Math.max(1,Math.min(64,now-ZT.lt)):16;ZT.lt=now;
 const k=1-Math.exp(-dt/(now-ZT.fing<600?55:120));ZT.x+=(ZT.tx-ZT.x)*k;ZT.y+=(ZT.ty-ZT.y)*k;
 const x=Math.max(-1,Math.min(1,ZT.x)),y=Math.max(-1,Math.min(1,ZT.y)),idle=now-Math.max(ZT.fing,ZT.sens)>1200&&!document.body.classList.contains('q-low');
 if(!ZT.t0)ZT.t0=now;const sw=idle?Math.sin((now-ZT.t0)/9000*Math.PI*2)*.45:0;ZT.sw=(ZT.sw||0)+(sw-(ZT.sw||0))*(1-Math.exp(-dt/320));const w=ZT.sw,A=ZT.an||{};
 ztT2(A.ry,x);ztT2(A.rx,y);ztT2(A.ax,x);ztT2(A.ay,y);ztT2(A.gx,x*.75+w*.3);ztT2(A.gy,y);ztT2(A.fx,x*.55-w);ztT2(A.fy,y);
 ZT.v={ry:+(x*ZTMAX).toFixed(3),rx:+(-y*ZTMAX).toFixed(3),art:`translate3d(${(-x*3.2).toFixed(2)}%,${(-y*2.4).toFixed(2)}%,0) scale(1.07)`};
 if(Math.abs(ZT.tx-x)+Math.abs(ZT.ty-y)>.0015||idle||Math.abs(w)>.002)ZT.raf=requestAnimationFrame(ztFrame);else ZT.lt=0};
{const o0=ztOpen;ztOpen=function(){ZT.lp=null;ZT.lt=0;return o0.apply(this,arguments)}}

/* ---------------- settings: vibration toggle ---------------- */
{const mute=$('#sMute');if(mute&&!$('#sHap')){const l=document.createElement('label');l.innerHTML='<span>Vibration<small>buzz on hits, deaths and Madness</small></span><input type="checkbox" id="sHap">';mute.closest('label').after(l);
 $('#sHap').checked=HAP.on;$('#sHap').addEventListener('change',e=>{HAP.on=e.target.checked;try{localStorage.setItem('hsHap',HAP.on?'1':'0')}catch(x){}if(HAP.on){HAP.until=0;hap('hit')}})}}
{const s0=settingsOpen;settingsOpen=function(){const r=s0.apply(this,arguments);const h=$('#sHap');if(h)h.checked=HAP.on;return r}}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&navigator.vibrate)try{navigator.vibrate(0)}catch(e){}});

Object.assign(window.__hs,{HAP,HAPP,hap,hapFx,PL,madSpike,lowCheck,landFx,endSeq,endClean,ztT2});

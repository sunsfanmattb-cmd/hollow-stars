'use strict';
/* ================= v1.9 PACK OPENING: the void =================
   The stage becomes a window into something that should not be looked at:
   - a low-resolution canvas (scaled up by the GPU) of stars spiralling into a central rift, slow nebula, a breathing accretion rim
   - three counter-rotating rings of procedurally generated alien glyphs and an impossible triangle (crisp SVG, rotated by the GPU)
   - a caption that scrambles through unknown script before it resolves into words
   - tear: the rings collapse inward, the stars blast outward, an eye opens in the rift, cards are born out of it
   - rare / legendary flips flare the sigils and the eye turns toward the card
   The canvas runs only while the stage is open, at most 30 fps, and sleeps with the battery saver. Everything else is
   transform/opacity animation. Game logic (openPack, grant, flip order) is untouched. */

const PV={on:0,mode:'drift',mt:0,t0:0,stars:[],neb:[],tm:0,raf:0,cv:null,x:null,w:0,h:0,s:.5,cry:0};
/* ---- procedural alien glyphs: seeded, so the script is consistent between openings ---- */
function pvRng(s){return()=>{s=(s*16807)%2147483647;return s/2147483647}}
function pvGlyph(R){const p=[];const n=2+Math.floor(R()*3);for(let i=0;i<n;i++){const k=R();
  if(k<.45){p.push(`M${(R()*10).toFixed(1)} ${(R()*14).toFixed(1)}L${(R()*10).toFixed(1)} ${(R()*14).toFixed(1)}`)}
  else if(k<.8){const cx=2+R()*6,cy=3+R()*8,r=1.5+R()*3;p.push(`M${(cx-r).toFixed(1)} ${cy.toFixed(1)}A${r.toFixed(1)} ${r.toFixed(1)} 0 ${R()<.5?1:0} 1 ${(cx+r).toFixed(1)} ${cy.toFixed(1)}`)}
  else{const x=R()*10,y=R()*14;p.push(`M${x.toFixed(1)} ${y.toFixed(1)}m-.8 0a.8 .8 0 1 0 1.6 0a.8 .8 0 1 0-1.6 0`)}}
 return p.join('')}
function pvRing(n,r,seed,size){const R=pvRng(seed);let g='';for(let i=0;i<n;i++){const a=i/n*360;g+=`<path transform="rotate(${a.toFixed(2)} 100 100) translate(${(100-size*5/10).toFixed(2)} ${(100-r-size*7/10).toFixed(2)}) scale(${(size/10).toFixed(3)})" d="${pvGlyph(R)}"/>`}
 return `<svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="${(r+size*.95).toFixed(1)}" class="rl"/><circle cx="100" cy="100" r="${(r-size*.85).toFixed(1)}" class="rl"/><g class="gl">${g}</g></svg>`}
const PV_TRI='<svg viewBox="-60 -60 120 120" aria-hidden="true"><g stroke-linejoin="round"><path d="M0-50L43.3 25H26L0-20-9.3-4z" class="t1"/><path d="M43.3 25L-43.3 25-34.6 10H17.3L8.7-5z" class="t2"/><path d="M-43.3 25L0-50 8.7-35-25.9 25H-17.3z" class="t3"/></g></svg>';
const PV_EYE='<svg viewBox="0 0 200 120" aria-hidden="true"><defs><radialGradient id="pvIr" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff7d0"/><stop offset=".25" stop-color="#e8c060"/><stop offset=".6" stop-color="#8a2ac0"/><stop offset="1" stop-color="#1a0630"/></radialGradient></defs><path d="M6 60Q100-14 194 60Q100 134 6 60z" fill="#08020c" stroke="#c8a0ff" stroke-width="2"/><g class="ei"><circle cx="100" cy="60" r="34" fill="url(#pvIr)"/><ellipse cx="100" cy="60" rx="5" ry="27" fill="#000"/><circle cx="90" cy="48" r="5" fill="#fff" opacity=".7"/></g></svg>';
const PV_LINES=['IT WAS NEVER SEALED','THE CARDS DREAM OF YOU','COUNT THE STARS. NOW COUNT AGAIN','WHAT IS INSIDE IS ALSO OUTSIDE','DO NOT LOOK DIRECTLY','SOMETHING IS COUNTING BACK','THE PACK REMEMBERS YOUR HANDS','YOU HAVE OPENED THIS BEFORE'];
const PV_RUNE='ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ⍙⍜⌇⟟⟒⏃⋏⎍⌰⟊';

function pvBuild(){const st=$('#pstage');if(!st||$('#pvoid'))return;
 st.insertAdjacentHTML('afterbegin',`<canvas id="pvoid"></canvas><div id="pvsig"><i class="r r1">${pvRing(28,62,7,9)}</i><i class="r r2">${pvRing(20,44,19,8)}</i><i class="r r3">${pvRing(12,27,41,7)}</i><i class="tri">${PV_TRI}</i></div><i id="pveye">${PV_EYE}</i><i id="pvflash"></i>`);
 const w=$('#pwrap');if(w&&!$('#pvcry'))w.insertAdjacentHTML('afterend','<div id="pvcry" aria-live="off"></div>');
 PV.cv=$('#pvoid');PV.x=PV.cv.getContext('2d')}

/* ---- the void canvas ---- */
function pvSize(){const d=Math.min(1,(devicePixelRatio||1))*.5;PV.w=Math.ceil(innerWidth*d);PV.h=Math.ceil(innerHeight*d);PV.s=d;PV.cv.width=PV.w;PV.cv.height=PV.h;
 const n=fxLow()?60:qv().n>.7?170:110,R=Math.max(PV.w,PV.h)*.75;PV.stars=[];for(let i=0;i<n;i++)PV.stars.push(pvStar(R*Math.sqrt(Math.random())));
 PV.neb=[];for(let i=0;i<4;i++)PV.neb.push({a:Math.random()*7,r:R*(.25+Math.random()*.4),sz:R*(.45+Math.random()*.35),c:['#5a1a8a','#0a5a6a','#6a0a3a','#2a3a8a'][i],w:(Math.random()<.5?-1:1)*(.03+Math.random()*.05)})}
function pvStar(r){return{r,a:Math.random()*Math.PI*2,z:.3+Math.random()*.7,c:Math.random()<.6?'#e8dcff':Math.random()<.5?'#8affe0':'#ffb0e8',pr:r,pa:0}}
function pvDraw(t){const x=PV.x,W=PV.w,H=PV.h,cx=W/2,cy=H*.46,dt=Math.min(.06,(t-(PV.lt||t))/1000)||.033,el=(t-PV.mt)/1000,m=PV.mode,R=Math.max(W,H)*.75;PV.lt=t;
 x.globalCompositeOperation='source-over';x.fillStyle=m==='burst'?'rgba(2,0,6,.2)':'rgba(2,0,6,.42)';x.fillRect(0,0,W,H);
 x.globalCompositeOperation='lighter';
 for(const n of PV.neb){n.a+=n.w*dt*(m==='burst'?6:1);const nx=cx+Math.cos(n.a)*n.r*.6,ny=cy+Math.sin(n.a)*n.r*.35,g=x.createRadialGradient(nx,ny,0,nx,ny,n.sz);g.addColorStop(0,n.c+'26');g.addColorStop(1,n.c+'00');x.fillStyle=g;x.fillRect(nx-n.sz,ny-n.sz,n.sz*2,n.sz*2)}
 const burst=m==='burst'&&el<1.4,surge=m==='surge'&&el<2;
 for(const s of PV.stars){s.pr=s.r;s.pa=s.a;
  const w=(.5+30/(s.r+12))*(surge?3:1);s.a+=w*dt;
  if(burst){s.r+=(260+s.r*2.4)*dt*s.z}else{s.r-=(6+s.r*.06)*dt*(surge?4:1)*(.6+s.z)}
  if(s.r<3||s.r>R*1.1){Object.assign(s,pvStar(burst?2+Math.random()*10:R*(.8+Math.random()*.3)));continue}
  const sx=cx+Math.cos(s.a)*s.r,sy=cy+Math.sin(s.a)*s.r*.62,px=cx+Math.cos(s.pa)*s.pr,py=cy+Math.sin(s.pa)*s.pr*.62,al=Math.min(1,s.r/40)*s.z;
  x.strokeStyle=s.c;x.globalAlpha=al*(burst?.95:.85);x.lineWidth=s.z*(burst?1.3:1);x.beginPath();x.moveTo(px,py);x.lineTo(sx,sy);x.stroke()}
 x.globalAlpha=1;
 /* the rift: a black hole with a breathing rim */
 const rr=Math.min(W,H)*(m==='burst'?.07+Math.min(.12,el*.25):m==='surge'?.12:.055)*(1+Math.sin(t/700)*.06);
 const g=x.createRadialGradient(cx,cy,rr*.6,cx,cy,rr*2.6);g.addColorStop(0,'#c8a0ff90');g.addColorStop(.35,'#6a2ac040');g.addColorStop(1,'#00000000');x.fillStyle=g;x.beginPath();x.arc(cx,cy,rr*2.6,0,7);x.fill();
 x.globalCompositeOperation='source-over';x.fillStyle='#000';x.beginPath();x.ellipse(cx,cy,rr,rr*.92,0,0,7);x.fill();
 if(m!=='drift'&&el>2.2)PV.mode='drift'}
function pvLoop(t){PV.raf=0;if(!PV.on)return;if(BAT.idle||BAT.hid||document.hidden){PV.paused=1;return}pvDraw(t);
 const iv=1000/(fxLow()?20:30);PV.tm=setTimeout(()=>{PV.tm=0;if(PV.on&&!PV.raf)PV.raf=requestAnimationFrame(pvLoop)},iv-8)}
function pvKick(){if(PV.on&&!PV.raf&&!PV.tm){PV.paused=0;PV.raf=requestAnimationFrame(pvLoop)}}
function pvStart(){pvBuild();if(!PV.cv)return;PV.on=1;PV.mode='drift';PV.mt=performance.now();PV.lt=0;pvSize();PV.x.fillStyle='#030008';PV.x.fillRect(0,0,PV.w,PV.h);pvKick();pvCryStart();pvHum(1)}
function pvStop(){PV.on=0;clearTimeout(PV.tm);PV.tm=0;if(PV.raf)cancelAnimationFrame(PV.raf);PV.raf=0;pvCryStop();pvHum(0)}
function pvMode(m){PV.mode=m;PV.mt=performance.now();pvKick()}

/* ---- caption: unknown script that resolves into words, then dissolves again ---- */
function pvCryStart(){pvCryStop();const el=$('#pvcry');if(!el)return;let i=Math.floor(Math.random()*PV_LINES.length);
 const cycle=()=>{if(!PV.on)return;const L=PV_LINES[i++%PV_LINES.length];let k=0;const n=L.length,steps=n+10;
  const tick=()=>{if(!PV.on)return;k++;let s='';for(let j=0;j<n;j++){const c=L[j];s+=c===' '?' ':j<k-10?c:PV_RUNE[Math.random()*PV_RUNE.length|0]}el.textContent=s;
   if(k<steps)PV.cry=setTimeout(tick,55);else PV.cry=setTimeout(()=>{let d=0;const out=()=>{if(!PV.on)return;d++;let s='';for(let j=0;j<n;j++){const c=L[j];s+=c===' '?' ':j<d*2?PV_RUNE[Math.random()*PV_RUNE.length|0]:c}el.textContent=s;if(d*2<n+2)PV.cry=setTimeout(out,45);else PV.cry=setTimeout(cycle,700)};out()},2200)};tick()};
 PV.cry=setTimeout(cycle,500)}
function pvCryStop(){clearTimeout(PV.cry);PV.cry=0;const el=$('#pvcry');if(el)el.textContent=''}

/* ---- sound: a low beating hum while the void is open; a tearing swell; a choir-like flare ---- */
function pvHum(on){try{if(!AU.c||!AU.m)return;const c=AU.c,t=c.currentTime;
 if(on&&!PV.hum&&!AU.mute){const g=c.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05,t+2.5);g.connect(AU.m);g.connect(AU.rv);
  const os=[[55,'sine'],[55.7,'sine'],[82.4,'triangle'],[164.1,'sine']].map(([f,ty],i)=>{const o=c.createOscillator(),og=c.createGain();o.type=ty;o.frequency.value=f;og.gain.value=[.9,.9,.35,.12][i];o.connect(og);og.connect(g);o.start();return o});PV.hum={g,os}}
 else if(!on&&PV.hum){const h=PV.hum;PV.hum=null;h.g.gain.cancelScheduledValues(t);h.g.gain.setTargetAtTime(0,t,.4);setTimeout(()=>{for(const o of h.os)try{o.stop()}catch(e){}},2000)}}catch(e){}}
Object.assign(SFX,{
 voidTear:()=>{tone(36.7,24,2.6,'sawtooth',.09,1);noise(1.8,120,1,.26,'lowpass',2400);[233.1,277.2,349.2,415.3,554.4].forEach((f,i)=>tone(f*.5,f,1.4,'sine',.035,1,.25+i*.07));noise(1.2,5000,4,.05,'bandpass',300,.3)},
 voidDeal:()=>{noise(.35,400,2,.07,'bandpass',2600);tone(196,392,.3,'sine',.025,1)},
 voidRare:()=>[392,466.2,587.3].forEach((f,i)=>tone(f,f*1.003,1.6,'triangle',.05,1,i*.06)),
 voidLegend:()=>{tone(41.2,41.2,3.5,'sawtooth',.07,1);[261.6,311.1,392,466.2,523.3,622.3,784].forEach((f,i)=>tone(f,f*1.004,2.6,'sine',.045,1,.15+i*.1));noise(2.8,300,1,.12,'lowpass',7000)}
});

/* ---- hooks into the existing flow ---- */
{const s0=startOpen;startOpen=function(){const r=s0.apply(this,arguments);if(PO.stage===1){const st=$('#pstage');st.classList.remove('vtear','vrare','vlegend');pvStart()}return r}}
{const w=$('#pwrap'),t0=w&&w.onclick;if(w&&t0)w.onclick=function(e){const was=PO.stage;const r=t0.call(this,e);if(was===1&&PO.stage===2){const st=$('#pstage');st.classList.add('vtear');restartCls($('#pvflash'),'on');sfx('voidTear');hap('legend');
   setTimeout(()=>pvMode('burst'),380);setTimeout(()=>{st.classList.remove('vtear');pvBirth()},900)}return r}}
/* cards are born out of the rift: each slot starts at the stage's centre and travels out to its place */
function pvBirth(){const st=$('#pstage'),sr=st.getBoundingClientRect(),cx=sr.left+sr.width/2,cy=sr.top+sr.height*.46;
 $$('#prow .pslot').forEach((s,i)=>{const r=s.getBoundingClientRect();s.style.setProperty('--dx',(cx-(r.left+r.width/2)).toFixed(0)+'px');s.style.setProperty('--dy',(cy-(r.top+r.height/2)).toFixed(0)+'px');s.classList.add('born');setTimeout(()=>sfx('voidDeal'),120+i*130)});
 st.classList.add('vborn')}
{const f0=flip;flip=function(s){const was=s&&s.classList.contains('up');const r=f0.apply(this,arguments);if(!s||was)return r;const st=$('#pstage'),rar=C[PO.res[+s.dataset.i].id].r;
  if(rar==='L'){st.classList.remove('vlegend');void st.offsetWidth;st.classList.add('vlegend');pvMode('surge');hap('legend');setTimeout(()=>sfx('voidLegend'),180);setTimeout(()=>st.classList.remove('vlegend'),3200)}
  else if(rar==='R'){restartCls(st,'vrare');hap('hitBig');setTimeout(()=>sfx('voidRare'),120);setTimeout(()=>st.classList.remove('vrare'),1600)}
  else hap('drop');return r}}
{const d=$('#pdone'),d0=d&&d.onclick;if(d&&d0)d.onclick=function(e){pvStop();$('#pstage').classList.remove('vborn','vtear','vrare','vlegend');return d0.call(this,e)}}
{const s0=show;show=function(id){if(id!=='packs'&&PV.on){pvStop();const st=$('#pstage');if(st)st.classList.remove('vborn')}return s0.apply(this,arguments)}}
document.addEventListener('pointerdown',()=>{if(PV.on&&PV.paused)setTimeout(pvKick,0)},true);
addEventListener('resize',()=>{if(PV.on)pvSize()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pvHum(0);else if(PV.on){pvHum(1);pvKick()}});

Object.assign(window.__hs,{PV,pvStart,pvStop,pvMode,pvBirth});

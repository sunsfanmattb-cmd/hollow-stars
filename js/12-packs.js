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
/* v2.3: the eye in the rift is wet and wrong, not a cartoon: yellowed bloodshot sclera, a fibrous sickly-amber iris, a slit pupil */
const PV_EYE='<svg viewBox="0 0 200 120" aria-hidden="true"><defs><radialGradient id="pvSc" cx="50%" cy="50%" r="55%"><stop offset="0" stop-color="#6a5a40"/><stop offset=".6" stop-color="#3a2a1a"/><stop offset="1" stop-color="#0a0504"/></radialGradient><radialGradient id="pvIr" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#d8b860"/><stop offset=".35" stop-color="#9a7020"/><stop offset=".75" stop-color="#4a2a08"/><stop offset="1" stop-color="#120802"/></radialGradient><clipPath id="pvEc"><path d="M8 60Q100-6 192 60Q100 126 8 60z"/></clipPath></defs><path d="M8 60Q100-6 192 60Q100 126 8 60z" fill="url(#pvSc)"/><g clip-path="url(#pvEc)" stroke="#6a0a0a" stroke-width="1.1" fill="none" opacity=".7"><path d="M10 60c20-4 30 6 46 2M190 58c-18-6-30 4-48 0M30 40c12 8 20 6 32 14M168 82c-14-6-22-2-34-12M24 80c14-6 24 0 36-6"/></g><g class="ei"><circle cx="100" cy="60" r="31" fill="url(#pvIr)"/><g stroke="#2a1404" stroke-width=".8" opacity=".6">'+Array.from({length:24},(_,i)=>{const a=i/24*6.283;return`<path d="M${(100+Math.cos(a)*9).toFixed(1)} ${(60+Math.sin(a)*9).toFixed(1)}L${(100+Math.cos(a)*30).toFixed(1)} ${(60+Math.sin(a)*30).toFixed(1)}"/>`}).join('')+'</g><ellipse cx="100" cy="60" rx="4" ry="24" fill="#000"/><ellipse cx="92" cy="49" rx="4" ry="2.5" fill="#e8dcc0" opacity=".35"/></g><path d="M8 60Q100-6 192 60" fill="none" stroke="#1a0c08" stroke-width="5"/><path d="M8 60Q100 126 192 60" fill="none" stroke="#1a0c08" stroke-width="3"/></svg>';
const PV_LINES=['IT WAS NEVER SEALED','THE CARDS DREAM OF YOU','COUNT THE STARS. NOW COUNT AGAIN','WHAT IS INSIDE IS ALSO OUTSIDE','DO NOT LOOK DIRECTLY','SOMETHING IS COUNTING BACK','THE PACK REMEMBERS YOUR HANDS','YOU HAVE OPENED THIS BEFORE'];
const PV_RUNE='ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ⍙⍜⌇⟟⟒⏃⋏⎍⌰⟊';

function pvBuild(){const st=$('#pstage');if(!st||$('#pvoid'))return;
 st.insertAdjacentHTML('afterbegin',`<i id="pvbg"></i><canvas id="pvoid"></canvas><div id="pvsig"><i class="r r1">${pvRing(28,62,7,9)}</i><i class="r r2">${pvRing(20,44,19,8)}</i><i class="r r3">${pvRing(12,27,41,7)}</i><i class="tri">${PV_TRI}</i></div><i id="pveye">${PV_EYE}</i><i id="pvflash"></i>`);
 const w=$('#pwrap');if(w&&!$('#pvcry'))w.insertAdjacentHTML('afterend','<div id="pvcry" aria-live="off"></div>');
 PV.cv=$('#pvoid');PV.x=PV.cv.getContext('2d')}

/* ---- the void canvas (v2.3) ----
   A transparent layer over the painted backdrop (art/ui/void.webp): drifting ash, the rift's living edge (a ragged black mouth with an
   uneven ember rim over the painted limbs), and the watchers - faint eyes in the dark that open when the pack is torn, follow the
   cards, and all stare when a Legendary turns over. Low resolution (the GPU scales it up), at most 30 fps, asleep with the battery saver. */
function pvSize(){const d=Math.min(1,(devicePixelRatio||1))*.5;PV.w=Math.ceil(innerWidth*d);PV.h=Math.ceil(innerHeight*d);PV.s=d;PV.cv.width=PV.w;PV.cv.height=PV.h;
 const n=fxLow()?28:qv().n>.7?80:52,R=Math.max(PV.w,PV.h)*.75;PV.stars=[];for(let i=0;i<n;i++)PV.stars.push(pvMote(R*(.15+.85*Math.sqrt(Math.random()))));
 /* watchers: seeded positions on a ring outside the card area; more on wide screens */
 const Rg=pvRng(613),W=PV.w,H=PV.h,cx=W/2,cy=H*.46,ne=fxLow()?5:W>H?11:8;PV.eyes=[];
 for(let i=0,t=0;i<ne&&t<400;t++){const a=Rg()*6.283,rx=W*(.3+Rg()*.24),ry=H*(.32+Rg()*.2),x=cx+Math.cos(a)*rx,y=cy+Math.sin(a)*ry;
  if(x<10||x>W-10||y<10||y>H-10)continue;if(Math.abs(x-cx)<W*.36&&Math.abs(y-cy)<H*.24)continue;if(PV.eyes.some(e=>Math.hypot(e.x-x,e.y-y)<Math.min(W,H)*.13))continue;
  PV.eyes.push({x,y,s:Math.min(W,H)*(.014+Rg()*.014),rot:(Rg()-.5)*.5,op:0,to:i<1?.22:0,bl:0,nb:2+Rg()*6,lx:0,ly:0,ph:Rg()*6,w:i});i++}
}
function pvMote(r){return{r,a:Math.random()*Math.PI*2,z:.3+Math.random()*.7,c:Math.random()<.7?'#8a8078':Math.random()<.5?'#6a5a7a':'#7a4a3a',pr:r,pa:0}}
function pvEye(x,e,t,fx,fy,glare){const k=e.op*(1-e.bl);if(k<.02)return;const s=e.s,w=s*2.1,h=s*k*.95;x.save();x.translate(e.x,e.y);x.rotate(e.rot);
 /* lids */x.beginPath();x.moveTo(-w,0);x.quadraticCurveTo(0,-h*1.6,w,0);x.quadraticCurveTo(0,h*1.6,-w,0);x.closePath();
 x.globalAlpha=Math.min(1,.42+glare*.38)*Math.min(1,e.op*1.3);x.fillStyle=glare?'#2e2a20':'#16120e';x.fill();x.save();x.clip();
 const dx=fx-e.x,dy=fy-e.y,L=Math.hypot(dx,dy)||1;e.lx+=((dx/L)*s*.55-e.lx)*.08;e.ly+=((dy/L)*s*.3-e.ly)*.08;
 const ix=e.lx+Math.sin(t/1700+e.ph)*s*.08,iy=e.ly,ir=s*.62,g=x.createRadialGradient(ix,iy,0,ix,iy,ir);
 g.addColorStop(0,glare?'#d8d0a8':'#6a6450');g.addColorStop(.55,glare?'#8a7a48':'#3e3a2c');g.addColorStop(1,'#0e0c08');x.fillStyle=g;x.beginPath();x.arc(ix,iy,ir,0,7);x.fill();
 x.fillStyle='#000';x.beginPath();x.ellipse(ix,iy,s*.09*(glare?.6:1),ir*.82,0,0,7);x.fill();x.restore();
 x.globalAlpha*=.8;x.strokeStyle='#050302';x.lineWidth=Math.max(1,s*.14);x.beginPath();x.moveTo(-w,0);x.quadraticCurveTo(0,-h*1.6,w,0);x.stroke();
 if(glare){x.globalCompositeOperation='lighter';x.globalAlpha=.07*e.op;const gg=x.createRadialGradient(ix,iy,0,ix,iy,s*2.6);gg.addColorStop(0,'#d8b060');gg.addColorStop(1,'#d8b06000');x.fillStyle=gg;x.fillRect(ix-s*2.6,iy-s*2.6,s*5.2,s*5.2);x.globalCompositeOperation='source-over'}
 x.restore()}
/* the rift's ragged outline: several sine octaves + a slow jagged term, so its silhouette is never a clean oval */
const pvQ=(a,t)=>1+.11*Math.sin(a*5+t/900)+.07*Math.sin(a*11-t/600)+.05*Math.sin(a*3+t/2300)+.05*Math.sin(a*17+t/400)*Math.sin(a*2-t/1700);
function pvDraw(t){const x=PV.x,W=PV.w,H=PV.h,cx=W/2,cy=H*.46,dt=Math.min(.06,(t-(PV.lt||t))/1000)||.033,el=(t-PV.mt)/1000,m=PV.mode,R=Math.max(W,H)*.75,mn=Math.min(W,H);PV.lt=t;
 x.globalCompositeOperation='source-over';x.globalAlpha=1;x.clearRect(0,0,W,H);
 const burst=m==='burst'&&el<1.6,surge=m==='surge'&&el<2.6,born=$('#pstage').classList.contains('vborn');
 /* the rift's mouth: ragged, breathing, wider when it tears and when something old comes out */
 const open=burst?Math.min(1,el/.25)*(1-Math.max(0,el-.6)/1):surge?Math.sin(Math.min(1,el/2.6)*Math.PI):0,r0=mn*(.088+open*.03)*(1+Math.sin(t/1400)*.03);
 /* a soft ragged pool of dark over the painted rift (no hard silhouette: a solid disc with lines around it read as a bug) */
 {const g=x.createRadialGradient(cx,cy,r0*.35,cx,cy,r0*1.35);g.addColorStop(0,'rgba(0,0,0,.95)');g.addColorStop(.55,'rgba(0,0,0,.75)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.beginPath();for(let i=0;i<=72;i++){const a=i/72*6.283,q=pvQ(a,t)*1.3;x.lineTo(cx+Math.cos(a)*r0*q,cy+Math.sin(a)*r0*q*.94)}x.fill()}
 /* ember rim: short uneven arcs, brightest where the noise peaks; sickly gold for a Legendary */
 x.globalCompositeOperation='lighter';x.lineCap='round';const rc=surge?'#d8b860':'#a03418';
 for(let i=0;i<36;i++){const a=i/36*6.283,v=.5+.5*Math.sin(a*7+t/700)*Math.sin(a*3-t/1300+1.7),al=Math.max(0,v-.35)*(.5+open*.9);if(al<.03)continue;
  const q=pvQ(a,t);x.globalAlpha=al;x.strokeStyle=rc;x.lineWidth=1+v*1.4;x.beginPath();x.arc(cx,cy,r0*q*1.02,a,a+.16);x.stroke()}
 x.globalCompositeOperation='source-over';x.strokeStyle='#000';
 /* ash: drifts and sinks toward the rift; blown out when it tears; pulled in hard for a Legendary */
 x.globalAlpha=1;for(const s of PV.stars){s.pr=s.r;s.pa=s.a;s.a+=(.04+6/(s.r+40))*dt*(surge?3:1);
  if(burst&&el<.9){s.r+=(180+s.r*1.6)*dt*s.z}else{s.r-=(2+s.r*.018)*dt*(surge?5:1)*(.5+s.z)}
  if(s.r<r0*.8||s.r>R*1.1){Object.assign(s,pvMote(burst?r0+Math.random()*20:R*(.6+Math.random()*.45)));continue}
  const sx=cx+Math.cos(s.a)*s.r,sy=cy+Math.sin(s.a)*s.r*.62+Math.sin(t/900+s.z*9)*1.5,al=Math.min(1,(s.r-r0)/(mn*.12))*s.z*.5;
  x.globalAlpha=al;x.fillStyle=s.c;if(burst&&el<.9){x.strokeStyle=s.c;x.lineWidth=s.z;x.beginPath();x.moveTo(cx+Math.cos(s.pa)*s.pr,cy+Math.sin(s.pa)*s.pr*.62);x.lineTo(sx,sy);x.stroke()}else x.fillRect(sx,sy,s.z*1.6,s.z*1.6)}
 /* shockwave when it tears: one pale ring, low */
 if(burst&&el<1.1){x.globalCompositeOperation='lighter';x.globalAlpha=.32*(1-el/1.1);x.strokeStyle='#c8b8a0';x.lineWidth=2;x.beginPath();x.ellipse(cx,cy,r0+el*mn*.9,(r0+el*mn*.9)*.7,0,0,7);x.stroke();x.globalCompositeOperation='source-over'}
 /* the watchers */
 const fp=PV.focus||{x:cx,y:cy},glare=surge?1:0;for(const e of PV.eyes){const want=surge?1:burst||born?(e.w%3===0?0:e.w%2?.45:.7):e.to;e.op+=(want-e.op)*Math.min(1,dt*(burst||surge?5:.8));
  e.nb-=dt;if(e.nb<0&&!surge){e.bl=1;e.nb=3+Math.random()*7}if(e.bl>0)e.bl=Math.max(0,e.bl-dt*5);pvEye(x,e,t,fp.x,fp.y,glare)}
 x.globalAlpha=1;if(m!=='drift'&&el>2.8){PV.mode='drift';PV.focus=null}}
function pvLoop(t){PV.raf=0;if(!PV.on)return;if(BAT.idle||BAT.hid||document.hidden){PV.paused=1;return}pvDraw(t);
 const iv=1000/(fxLow()?20:30);PV.tm=setTimeout(()=>{PV.tm=0;if(PV.on&&!PV.raf)PV.raf=requestAnimationFrame(pvLoop)},iv-8)}
function pvKick(){if(PV.on&&!PV.raf&&!PV.tm){PV.paused=0;PV.raf=requestAnimationFrame(pvLoop)}}
function pvStart(){pvBuild();if(!PV.cv)return;PV.on=1;PV.mode='drift';PV.mt=performance.now();PV.lt=0;pvSize();PV.x.clearRect(0,0,PV.w,PV.h);pvKick();pvCryStart();pvHum(1)}
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
  if(rar==='L'){st.classList.remove('vlegend');void st.offsetWidth;st.classList.add('vlegend');{const r=s.getBoundingClientRect();PV.focus={x:(r.left+r.width/2)*PV.s,y:(r.top+r.height/2)*PV.s}}pvMode('surge');hap('legend');setTimeout(()=>sfx('voidLegend'),180);setTimeout(()=>st.classList.remove('vlegend'),3200)}
  else if(rar==='R'){restartCls(st,'vrare');hap('hitBig');setTimeout(()=>sfx('voidRare'),120);setTimeout(()=>st.classList.remove('vrare'),1600)}
  else hap('drop');return r}}
{const d=$('#pdone'),d0=d&&d.onclick;if(d&&d0)d.onclick=function(e){pvStop();$('#pstage').classList.remove('vborn','vtear','vrare','vlegend');return d0.call(this,e)}}
{const s0=show;show=function(id){if(id!=='packs'&&PV.on){pvStop();const st=$('#pstage');if(st)st.classList.remove('vborn')}return s0.apply(this,arguments)}}
document.addEventListener('pointerdown',()=>{if(PV.on&&PV.paused)setTimeout(pvKick,0)},true);
addEventListener('resize',()=>{if(PV.on)pvSize()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pvHum(0);else if(PV.on){pvHum(1);pvKick()}});

Object.assign(window.__hs,{PV,pvStart,pvStop,pvMode,pvBirth});

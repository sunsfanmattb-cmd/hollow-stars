'use strict';
/* ================= v1.9 PERFORMANCE + BATTERY =================
   Measured with tests/perfprobe.py (phone viewport, CPU slowed 4x). See also bgFrame (04-engine.js) and qMon (06-fx.js),
   which now sleep between frames instead of waking the page on every vsync. */

/* ---- off-screen cards stop animating ----
   Every card runs at least two endless animations (cost-gem swirl) and Legendaries four more. The collection grid alone had
   117 cards = 286 running animations on 603 GPU layers while ~15 cards were visible; that was the lag, the battery drain and,
   on phones, the flicker (GPU memory pressure makes the browser drop and re-raster tiles). Cards more than 160 px outside the
   screen (or inside a hidden screen) get .zz, which removes their animations and layers; they resume as they scroll in. */
const CVIS={io:new IntersectionObserver(es=>{for(const e of es)e.target.classList.toggle('zz',!e.isIntersecting)},{rootMargin:'160px 0px'}),n:0};
{const c0=cardEl;cardEl=function(){const e=c0.apply(this,arguments);try{CVIS.io.observe(e);CVIS.n++}catch(x){}return e}}

/* ---- zoomed card: the grid behind the (nearly opaque) overlay freezes, so the tilt and the video get the whole frame ---- */
{const s0=showZoom,h0=hideZoom;
 showZoom=function(){const r=s0.apply(this,arguments);document.body.classList.toggle('zmod',$('#zoom').classList.contains('modal')&&$('#zoom').classList.contains('on'));return r};
 hideZoom=function(){document.body.classList.remove('zmod');return h0.apply(this,arguments)}}

/* ---- legendary cinematic rays ----
   The rays were a CSS conic gradient on a square 2.2x the screen's long side with a blend mode: at phone pixel density that is
   a ~5700 px texture (~130 MB of GPU memory) re-blended every frame, which is what made the entrance stutter. Now they are
   drawn once into a 512 px canvas (per faction colour) that the GPU simply rotates and scales. Soft edges look the same. */
const RAYS={c:{}};
function raysCanvas(col){const cv=document.createElement('canvas');cv.width=cv.height=512;const x=cv.getContext('2d'),c=256;
 for(let i=0;i<36;i++){const a0=i/36*Math.PI*2,a1=a0+Math.PI*2*4/360,g=x.createRadialGradient(c,c,0,c,c,c);g.addColorStop(0,col);g.addColorStop(.25,col);g.addColorStop(1,'transparent');
  x.fillStyle=g;x.beginPath();x.moveTo(c,c);x.arc(c,c,c,a0,a1);x.closePath();x.fill()}
 return cv}
{const old=$('#cin .crays');if(old){const cv=document.createElement('canvas');cv.className='crays rc';cv.width=cv.height=512;old.replaceWith(cv)}
 const c0=lgCinema;lgCinema=function(id){try{const f=C[id]&&C[id].f,col={v:'#7a3ad0',m:'#1a98a8',c:'#c0182e',n:'#a08040'}[f]||'#7a3ad0',el=$('#cin .crays');
  if(el&&el.tagName==='CANVAS'&&el.dataset.col!==col){const src=RAYS.c[col]||(RAYS.c[col]=raysCanvas(col)),x=el.getContext('2d');x.clearRect(0,0,512,512);x.drawImage(src,0,0);el.dataset.col=col}}catch(e){}
  const p=c0.apply(this,arguments);
  /* while the cinematic covers the board, everything behind it holds still (each frame was re-sending ~100 board layers) */
  if(p&&p.then){document.body.classList.add('cinhold');p.then(()=>document.body.classList.remove('cinhold'),()=>document.body.classList.remove('cinhold'))}
  return p}}

/* ---- v2.5 zoom without pop-in ----
   The zoom shows a card's full-size painting (600x840 for Legendaries). It used to appear with the small art and swap the big one in
   when it finished decoding: a visible pop, plus a repaint of the largest layers right as the zoom animated in. Now the big art
   starts decoding the moment a finger (or the mouse) touches a card - the long-press alone takes 480 ms, a 600x840 WebP decodes in
   well under that. If it is still decoding when the zoom opens, the zoom is built as usual but the card stays invisible (.zwait)
   until the art is ready (at most 260 ms), then fades in. Decoded images are kept warm in BIG (most recent 24). */
const BIG={im:new Map(),max:24,tok:0};
function bigWarm(id){if(!id||!C[id])return Promise.resolve();let e=BIG.im.get(id);if(!e){const im=new Image();im.decoding='async';im.src=realArt(id);
  e={im,p:(im.decode?im.decode():new Promise(r=>{im.onload=r})).catch(()=>{}).then(()=>{e.ok=1})};BIG.im.set(id,e);
  if(BIG.im.size>BIG.max)BIG.im.delete(BIG.im.keys().next().value)}else{BIG.im.delete(id);BIG.im.set(id,e)}return e.p}
document.addEventListener('pointerdown',e=>{const c=e.target.closest&&e.target.closest('[data-cid]');if(c)bigWarm(c.dataset.cid)},true);
document.addEventListener('pointerover',e=>{if(e.pointerType!=='mouse')return;const c=e.target.closest&&e.target.closest('#cgrid [data-cid],#bgrid [data-cid]');if(c)bigWarm(c.dataset.cid)},{passive:true});
{const s1=showZoom;showZoom=function(el){const r=s1.apply(this,arguments),id=el&&el.dataset&&el.dataset.cid,e=id&&BIG.im.get(id),z=$('#zoom'),tok=++BIG.tok;
  if(id&&!(e&&e.ok)&&z.classList.contains('on')){z.classList.add('zwait');Promise.race([bigWarm(id),sleep(260)]).then(()=>{if(BIG.tok===tok)z.classList.remove('zwait')})}return r}}
{const h1=hideZoom;hideZoom=function(){BIG.tok++;return h1.apply(this,arguments)}}

Object.assign(window.__hs,{CVIS,RAYS,BIG,bigWarm});

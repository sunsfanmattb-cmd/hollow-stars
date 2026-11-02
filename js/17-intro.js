'use strict';
/* ================= v2.8 INTRO: the cathedral =================
   Every app start, ~3.2 s, a tap or key skips it. Total darkness; a distant bell tolls and a low choir rises. Two candles
   catch, and their light climbs a gothic arch from the floor up. The rose window resolves around the game's sigil, "NOX · AETERNA"
   is set beneath it, the candles gutter out, a last low toll, and the title rises from the dark.
   All motion is CSS keyframes on transform/opacity (css/v27.css); the stonework is one static SVG.
   Sound plays where audio may start without a tap (the Android and Windows apps); on the web the intro is silent.
   Automated browsers skip the intro unless the page is opened with ?intro=1. */
const INTRO={done:false,t0:0,el:null,T:3200};
/* the arch: pointed outer and inner arches, two lancet windows, a rose window with eight trefoil lights, columns and capitals */
function introArch(){const L=[],cx=100,cy=104;
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2-Math.PI/2,x=cx+Math.cos(a)*31,y=cy+Math.sin(a)*31;L.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="8.5" fill="${i%2?'#1a1240':'#4a0a16'}" fill-opacity=".5"/>`);
  const x1=cx+Math.cos(a+Math.PI/8)*17,y1=cy+Math.sin(a+Math.PI/8)*17,x2=cx+Math.cos(a+Math.PI/8)*44,y2=cy+Math.sin(a+Math.PI/8)*44;L.push(`<path d="M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}"/>`)}
 const lancet=(x,w)=>`<path d="M${x} 292V196A${w*1.1} ${w*1.1} 0 0 1 ${x+w/2} 168A${w*1.1} ${w*1.1} 0 0 1 ${x+w} 196V292Z" fill="url(#inGl)"/>`;
 return`<svg viewBox="0 -16 200 316" class="in-svg"><defs><linearGradient id="inGl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a0812" stop-opacity=".55"/><stop offset=".55" stop-color="#160a2a" stop-opacity=".45"/><stop offset="1" stop-color="#2a0a08" stop-opacity=".25"/></linearGradient></defs><g fill="none" stroke="#a88a5c" stroke-width=".9" stroke-linecap="round">
  <path d="M100 6V-13M94 -7H106" stroke-width="1.4"/><path d="M96 9Q100 2 104 9" opacity=".6"/>
  <path d="M14 300V128A156 156 0 0 1 100 6A156 156 0 0 1 186 128V300" stroke-width="1.6"/>
  <path d="M24 300V132A146 146 0 0 1 100 18A146 146 0 0 1 176 132V300" opacity=".6"/>
  <path d="M14 128H24M176 128H186M10 300H34M166 300H190" stroke-width="1.4"/>
  ${lancet(44,40)}${lancet(116,40)}<path d="M64 168V292M136 168V292" opacity=".45"/>
  <g opacity=".95"><circle cx="${cx}" cy="${cy}" r="46" stroke-width="1.3" fill="#0a0408" fill-opacity=".6"/><circle cx="${cx}" cy="${cy}" r="42" opacity=".5"/>${L.join('')}<circle cx="${cx}" cy="${cy}" r="17"/></g></g></svg>`}
/* a bell: inharmonic partials with long decays, through the reverb */
function introBell(c,t,f,v){for(const[m,g,d]of[[.5,.5,4.2],[1,1,3.6],[1.19,.45,2.8],[1.5,.3,2.4],[2,.35,2],[2.66,.18,1.4],[3.01,.12,1.1]]){const o=c.createOscillator(),e=c.createGain();o.type='sine';o.frequency.value=f*m;
 e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(v*g,t+.006);e.gain.exponentialRampToValueAtTime(.0005,t+d);o.connect(e);e.connect(AU.m);e.connect(AU.rv);o.start(t);o.stop(t+d+.05)}}
/* a low choir: a D minor chord on soft detuned triangles, swelling in and out */
function introChoir(c,t,d){for(const f of[73.4,146.8,174.6,220,293.7]){for(const det of[-4,4]){const o=c.createOscillator(),e=c.createGain();o.type='triangle';o.frequency.value=f;o.detune.value=det;
  e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(f<100?.03:.012,t+d*.45);e.gain.linearRampToValueAtTime(0,t+d);o.connect(e);e.connect(AU.m);e.connect(AU.rv);o.start(t);o.stop(t+d+.05)}}}
function introSound(){if(!AU.c||AU.mute||AU.c.state!=='running')return;try{const c=AU.c,t=c.currentTime;
 introBell(c,t+.15,98,.16);introChoir(c,t+.3,2.6);
 noise(.5,1800,1,.035,'highpass',5000,.28);noise(.5,1800,1,.03,'highpass',5000,.42);   /* the candles catch */
 noise(.4,500,1,.06,'lowpass',90,2.55);introBell(c,t+2.62,49,.12)}catch(e){}}         /* they gutter; the last toll */
function introEnd(){if(INTRO.done)return;INTRO.done=true;const el=INTRO.el;if(el){el.classList.add('out');setTimeout(()=>el.remove(),420)}document.body.classList.remove('intro')}
(function introStart(){const auto=navigator.webdriver&&!/[?&]intro=1/.test(location.search),rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(auto||UI.auto){INTRO.done=true;return}
 const el=document.createElement('div');el.id='intro';if(rm)el.className='rm';
 const candle=s=>`<div class="in-c ${s}"><i class="in-halo"></i><i class="in-fl"><i></i></i><i class="in-wax"></i></div>`;
 el.innerHTML=`<i class="in-dust"></i><div class="in-g"><i class="in-lt"></i><div class="in-arch">${introArch()}<i class="in-sig"></i><i class="in-cover"></i></div>${candle('l')}${candle('r')}</div><p class="in-w"><span>NOX</span><b>✠</b><span>AETERNA</span></p>`;
 document.body.appendChild(el);document.body.classList.add('intro');INTRO.el=el;INTRO.t0=performance.now();
 /* the native apps may start audio without a tap: start the engine now and play the intro's sound */
 const native=!!(window.Capacitor||/Electron/.test(navigator.userAgent));if(native&&!rm){try{auInit()}catch(e){}setTimeout(introSound,40)}
 /* the skipping tap still reaches the page's audio unlock (on the web, sound starts on the first tap) */
 const skip=()=>{if(performance.now()-INTRO.t0>=250)introEnd()};
 el.addEventListener('pointerdown',skip);addEventListener('keydown',function k(){if(INTRO.done){removeEventListener('keydown',k);return}skip()});
 setTimeout(introEnd,rm?700:INTRO.T)})();

Object.assign(window.__hs,{INTRO,introEnd});

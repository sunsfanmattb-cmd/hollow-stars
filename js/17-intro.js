'use strict';
/* ================= v2.7 INTRO + MENU WARP =================
   Intro (every app start, ~2.4 s, tap or key to skip): darkness, a sliver of light splits open into a bloodshot eye,
   veins creep out, it looks around, locks on, the pupil snaps wide, "it has seen you" flickers, it blinks shut, the title fades in.
   Menu warp: a dark vignette pulse while the new screen settles in from slightly enlarged (~0.3 s).
   Both are CSS keyframes on transform/opacity only (css/v27.css). The intro covers the first paint while art loads.
   Sound plays where the platform lets audio start without a tap (the Android and Windows apps); on the web the intro is silent.
   Automated browsers skip the intro unless the page is opened with ?intro=1. */
const INTRO={done:false,t0:0,el:null,T:2400};
/* organic veins: vessels grow outward from the eye's rim, wander, branch, and thin toward the tips (viewBox matches .in-v's box) */
function introVeins(){const R=rng(7331),P=[[],[],[]];
 const grow=(x,y,a,len,d)=>{let p=`M${x.toFixed(1)} ${y.toFixed(1)}`;const n=7-d*2;for(let k=0;k<n;k++){a+=(R()-.5)*.55;const l=len*(1-k/n*.5);const cx=x+Math.cos(a)*l*.5+(R()-.5)*2,cy=y+Math.sin(a)*l*.5+(R()-.5)*2;x+=Math.cos(a)*l;y+=Math.sin(a)*l;p+=`Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
   if(d<2&&k===2+d&&R()<.8)grow(x,y,a+(R()<.5?-1:1)*(.45+R()*.4),len*.7,d+1)}P[d].push(p)};
 for(let i=0;i<22;i++){const t=i/22*Math.PI*2+R()*.2,x=110+Math.cos(t)*49,y=80+Math.sin(t)*20;grow(x,y,Math.atan2(Math.sin(t)*1.6,Math.cos(t)),5+R()*4,0)}
 return`<svg viewBox="0 0 220 160"><g fill="none" stroke-linecap="round">${P.map((ps,d)=>`<path d="${ps.join('')}" stroke="${['#7a0a18','#5a0812','#3a0610'][d]}" stroke-width="${[.9,.55,.35][d]}" opacity="${[.9,.75,.6][d]}"/>`).join('')}</g></svg>`}
const INTRO_EYE=`<svg viewBox="0 0 200 100"><defs><radialGradient id="inS" cx="50%" cy="50%" r="58%"><stop offset="0" stop-color="#d8ccb0"/><stop offset=".55" stop-color="#b8a47c"/><stop offset=".85" stop-color="#6a4a30"/><stop offset="1" stop-color="#2a1410"/></radialGradient>
 <clipPath id="inC"><path d="M4 50Q100-12 196 50Q100 112 4 50Z"/></clipPath></defs>
 <path d="M4 50Q100-12 196 50Q100 112 4 50Z" fill="url(#inS)"/><g clip-path="url(#inC)" fill="none" stroke-linecap="round">
 <g stroke="#a01020" stroke-width=".9" opacity=".8"><path d="M6 50q14-3 24 2t18-1q8-3 14 3"/><path d="M10 43q12 1 20-5t14-2"/><path d="M8 57q10 0 18 5t16 1"/><path d="M194 50q-16 4-26-2t-18 2q-8 3-14-2"/><path d="M190 43q-12 2-20-4t-14 0"/><path d="M190 58q-12-1-20 5t-14 0"/></g>
 <g stroke="#7a0a18" stroke-width=".5" opacity=".7"><path d="M30 52q4 6 10 4"/><path d="M44 40q3-5 9-5"/><path d="M168 52q-5 6-11 3"/><path d="M152 38q-3-4-9-3"/><path d="M60 24q6 8 3 15"/><path d="M142 78q-5-8 1-14"/><path d="M58 74q5-6 2-11"/></g>
 <ellipse cx="100" cy="50" rx="100" ry="40" fill="none" stroke="#000" stroke-width="22" opacity=".45"/></g>
 <path d="M4 50Q100-12 196 50Q100 112 4 50Z" fill="none" stroke="#120404" stroke-width="3.5"/><path d="M8 47Q100-8 192 47" fill="none" stroke="#3a1410" stroke-width="1.2" opacity=".8"/></svg>`;
function introSound(){if(!AU.c||AU.mute||AU.c.state!=='running')return;try{
 tone(36,31,2.3,'sawtooth',.05,1);noise(2.2,140,1,.1,'lowpass',90);
 noise(.7,240,1,.13,'lowpass',2200,.35);tone(196,207.7,1.1,'triangle',.025,1,.4);
 [146.8,155.6,207.7].forEach(f=>tone(f,f*.97,1.1,'sawtooth',.022,1,1.15));SFX.whisper();noise(.08,3000,2,.08,'highpass',8000,1.15);
 tone(62,30,.35,'sine',.32,0,1.78);noise(.25,600,1,.12,'lowpass',80,1.78)}catch(e){}}
function introEnd(){if(INTRO.done)return;INTRO.done=true;const el=INTRO.el;if(el){el.classList.add('out');setTimeout(()=>el.remove(),320)}document.body.classList.remove('intro')}
(function introStart(){const auto=navigator.webdriver&&!/[?&]intro=1/.test(location.search),rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(auto||UI.auto){INTRO.done=true;return}
 const el=document.createElement('div');el.id='intro';if(rm)el.className='rm';
 el.innerHTML=`<i class="in-fog"></i><div class="in-all"><div class="in-v">${introVeins()}</div><div class="in-eye">${INTRO_EYE}<div class="in-ir"><i class="in-pu"></i><i class="in-gl"></i></div></div><p class="in-w">it has seen you</p></div>`;
 document.body.appendChild(el);document.body.classList.add('intro');INTRO.el=el;INTRO.t0=performance.now();
 /* the native apps may start audio without a tap: start the engine now and play the intro's sound */
 const native=!!(window.Capacitor||/Electron/.test(navigator.userAgent));if(native&&!rm){try{auInit()}catch(e){}setTimeout(introSound,40)}
 /* the skipping tap still reaches the page's audio unlock (on the web, sound starts on the first tap) */
 const skip=()=>{if(performance.now()-INTRO.t0>=250)introEnd()};
 el.addEventListener('pointerdown',skip);addEventListener('keydown',function k(e){if(INTRO.done){removeEventListener('keydown',k);return}skip(e)});
 setTimeout(introEnd,rm?700:INTRO.T)})();

/* ---- menu warp ---- */
const WARP={el:null,n:0};
function warp(){if(!INTRO.done||document.body.classList.contains('q-low')||document.body.classList.contains('fxlow'))return;let w=WARP.el;
 if(!w){w=WARP.el=document.createElement('div');w.id='warp';document.body.appendChild(w);w.addEventListener('animationend',()=>w.classList.remove('on'))}
 w.classList.remove('on');void w.offsetWidth;w.classList.add('on');WARP.n++;sfx('warp')}
SFX.warp=()=>{tone(92,46,.26,'sine',.045);noise(.22,500,1,.035,'lowpass',120)};
onShow((id,prev)=>{if(id!==prev&&id!=='match')warp()});

Object.assign(window.__hs,{INTRO,introEnd,WARP,warp});

'use strict';
/* ================= v9 BATTERY SAVER (see RENDERING_RULES.md §11) =================
   BAT.idle: no input for BAT.IDLE ms and nothing animating on purpose -> body.idle pauses every CSS loop, the background/quality rAF loops stop
   requesting frames, videos pause. BAT.hid: page hidden / app backgrounded -> the same plus the AudioContext is suspended.
   Any input (pointer, key, wheel) or game event wakes everything on the next frame. */
const BAT={last:performance.now(),idle:0,hid:0,IDLE:10000,sleeps:0,wakes:0};
/* ================= AUDIO ================= */
const AU={c:null,m:null,rv:null,nb:null,mute:localStorage.getItem('hsMute')==='1',vol:Math.max(0,Math.min(1,+(localStorage.getItem('hsVol')??.8))),last:{},ambLvl:.74/* v7.3: drone +35% (was .55) */};
function auRes(){if(AU.c&&AU.c.state==='suspended'&&!AU.mute&&!BAT.hid)AU.c.resume().catch(()=>{})}
function auSusp(){if(AU.c&&AU.c.state==='running')AU.c.suspend().catch(()=>{})}
function auInit(){if(AU.c){auRes();return}const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;let c;try{c=new AC()}catch(e){return}AU.c=c;
 AU.m=c.createGain();AU.m.gain.value=AU.mute?0:AU.vol*1.1;AU.m.connect(c.destination);
 const len=c.sampleRate*3|0,ib=c.createBuffer(2,len,c.sampleRate);for(let ch=0;ch<2;ch++){const d=ib.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6)}
 AU.rv=c.createConvolver();AU.rv.buffer=ib;const rg=c.createGain();rg.gain.value=.55;AU.rv.connect(rg);rg.connect(AU.m);
 AU.nb=c.createBuffer(1,c.sampleRate*2,c.sampleRate);const nd=AU.nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;ambient();if(AU.mute||BAT.hid)auSusp()}
const MOOD={menu:{f:[43.65,43.95,65.4,87.6,130.2],lp:240,nf:520,ng:.06,th:0},v:{f:[41.2,41.5,61.7,82.4,123.5],lp:190,nf:360,ng:.09,th:0},m:{f:[55,55.4,110,165,220],lp:330,nf:1500,ng:.05,th:.6},c:{f:[49,49.4,73.4,98,146.8],lp:260,nf:700,ng:.05,th:0}};
function ambient(){const c=AU.c,t=c.currentTime,out=c.createGain();out.gain.setValueAtTime(0,t);out.gain.linearRampToValueAtTime(AU.ambLvl,t+5);out.connect(AU.m);out.connect(AU.rv);AU.amb=out;
 const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=240;lp.Q.value=5;lp.connect(out);AU.lp=lp;const pg=c.createGain();pg.gain.value=1;pg.connect(lp);
 const lfo=c.createOscillator(),lg=c.createGain();lfo.frequency.value=.045;lg.gain.value=150;lfo.connect(lg);lg.connect(lp.frequency);lfo.start();
 const tl=c.createOscillator(),tlg=c.createGain();tl.frequency.value=1.3;tlg.gain.value=0;tl.connect(tlg);tlg.connect(pg.gain);tl.start();AU.tlg=tlg;
 AU.osc=[];for(const[f,ty,v]of[[43.65,'sawtooth',.05],[43.95,'sawtooth',.05],[65.4,'triangle',.04],[87.6,'sine',.03],[130.2,'sine',.012]]){const o=c.createOscillator();o.type=ty;o.frequency.value=f;const g=c.createGain();g.gain.value=v;o.connect(g);g.connect(pg);o.start();AU.osc.push(o)}
 const ds=c.createOscillator(),dg=c.createGain();ds.type='triangle';ds.frequency.value=123;dg.gain.value=0;ds.connect(dg);dg.connect(lp);ds.start();AU.dis=ds;AU.disg=dg;
 const ns=c.createBufferSource();ns.buffer=AU.nb;ns.loop=true;const bp=c.createBiquadFilter();bp.type='bandpass';bp.Q.value=7;bp.frequency.value=520;const l2=c.createOscillator(),l2g=c.createGain();l2.frequency.value=.07;l2g.gain.value=320;l2.connect(l2g);l2g.connect(bp.frequency);l2.start();const ng=c.createGain();ng.gain.value=.06;ns.connect(bp);bp.connect(ng);ng.connect(out);ns.start();AU.nbp=bp;AU.ng=ng;
 const whisper=()=>{if(c.state!=='running'){setTimeout(whisper,8000);return}const t=c.currentTime,o=c.createOscillator(),g=c.createGain(),v=c.createOscillator(),vg=c.createGain(),f=180+Math.random()*520;o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*(.45+Math.random()*.4),t+4.5);v.frequency.value=4+Math.random()*4;vg.gain.value=f*.025;v.connect(vg);vg.connect(o.frequency);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.022,t+1.4);g.gain.linearRampToValueAtTime(0,t+4.5);o.connect(g);g.connect(AU.rv);o.start(t);v.start(t);o.stop(t+4.6);v.stop(t+4.6);setTimeout(whisper,(6000+Math.random()*10000)/(1+(MZ.me||0)*.35))};setTimeout(whisper,4000);
 const beat=()=>{if(AU.fac==='c'&&!AU.mute&&c.state==='running'){tone(55,38,.22,'sine',.22);tone(52,36,.2,'sine',.16,0,.2)}setTimeout(beat,60000/(56+(MZ.me||0)*7))};setTimeout(beat,1500);auMood()}
function auMood(){if(!AU.c||!AU.osc)return;const k=cur==='match'&&G?('vmc'.includes(G.p[0].fac)?G.p[0].fac:'v'):'menu',M=MOOD[k],mz=cur==='match'&&G?Math.min(1,G.p[0].mad/10):0,t=AU.c.currentTime;AU.fac=k;AU.mz=mz;
 M.f.forEach((f,i)=>AU.osc[i].frequency.setTargetAtTime(f*(1+(i%2?1:-1)*mz*.018),t,1.2));AU.lp.frequency.setTargetAtTime(M.lp+mz*300,t,1.5);AU.nbp.frequency.setTargetAtTime(M.nf,t,1.5);AU.ng.gain.setTargetAtTime(M.ng+mz*.09,t,1.5);
 AU.tlg.gain.setTargetAtTime(M.th*.5,t,.8);AU.dis.frequency.setTargetAtTime(M.f[0]*2*1.4142,t,.8);AU.disg.gain.setTargetAtTime(mz*mz*.06,t,1.5)}
function auVol(){if(AU.m)AU.m.gain.setTargetAtTime(AU.mute?0:AU.vol*1.1,AU.c.currentTime,.03);if(AU.mute)setTimeout(()=>{if(AU.mute)auSusp()},120);else auRes()}
function tone(f,f2,d,ty='sine',v=.15,rev,dl=0){const c=AU.c,t=c.currentTime+dl,o=c.createOscillator(),g=c.createGain();o.type=ty;o.frequency.setValueAtTime(f,t);if(f2&&f2!==f)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.01);g.gain.exponentialRampToValueAtTime(.0008,t+d);o.connect(g);g.connect(AU.m);if(rev)g.connect(AU.rv);o.start(t);o.stop(t+d+.05)}
function noise(d,f,q,v,ty='bandpass',f2,dl=0){const c=AU.c,t=c.currentTime+dl,s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain();s.buffer=AU.nb;fl.type=ty;fl.Q.value=q;fl.frequency.setValueAtTime(f,t);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0008,t+d);s.connect(fl);fl.connect(g);g.connect(AU.m);s.start(t,Math.random());s.stop(t+d+.05)}
const SFX={click:()=>tone(880,620,.07,'sine',.05),draw:()=>noise(.2,1800,1,.07,'highpass',6000),
 play:()=>{noise(.35,300,2,.14,'lowpass',2400);tone(110,48,.4,'sine',.28)},
 spell:()=>{[523,659,784,1046].forEach((f,i)=>tone(f*.5,f,.7,'sine',.05,1,i*.05));noise(.6,3200,8,.06,'bandpass',700)},
 hit:()=>{tone(150,38,.28,'square',.08);noise(.14,1200,1,.22,'lowpass',180)},
 die:()=>{tone(330,28,.9,'sawtooth',.06,1);noise(.8,1600,3,.12,'bandpass',90)},
 turn:()=>{tone(392,392,1.8,'sine',.1,1);tone(587,587,1.5,'sine',.06,1,.03);tone(98,98,1.2,'triangle',.08,1)},
 turnE:()=>{tone(294,294,1.3,'sine',.042,1);tone(73.4,73.4,1,'sine',.04,1)},
 endt:()=>{tone(523,392,.16,'sine',.019);noise(.12,700,1,.02,'lowpass',260)},
 mad:()=>{for(const f of[220,233,311])tone(f,f*.66,1.4,'triangle',.04,1)},
 heal:()=>[440,554,659].forEach((f,i)=>tone(f,f*1.02,.6,'sine',.06,1,i*.07)),
 win:()=>[262,330,392,523,659].forEach((f,i)=>tone(f,f,1.4,'triangle',.08,1,i*.16)),
 lose:()=>[300,240,180,120,60].forEach((f,i)=>tone(f,f*.8,1.6,'sawtooth',.05,1,i*.3)),
 err:()=>tone(170,120,.16,'square',.04),
 tear:()=>{noise(.5,900,1,.3,'highpass',5000);noise(.9,200,1,.25,'lowpass',60);tone(70,30,1,'sine',.3)},
 flip:()=>{noise(.12,2400,2,.1,'bandpass',900);tone(660,990,.12,'sine',.04)},
 rare:()=>[392,523,784].forEach((f,i)=>tone(f,f,1.2,'triangle',.07,1,i*.09)),
 legend:()=>{tone(55,55,3,'sawtooth',.1,1);[262,311,392,466,523,622,784].forEach((f,i)=>tone(f,f,2.2,'sine',.06,1,.2+i*.12));noise(2.5,400,1,.12,'lowpass',6000)},
 hitv:()=>{noise(.35,900,2,.24,'lowpass',120);tone(120,40,.35,'sine',.2);tone(300,90,.25,'triangle',.04,1)},
 hitm:()=>{[523,741,1187,1660].forEach((f,i)=>tone(f,f*.97,.35-i*.05,'square',.022,1));noise(.12,4000,1,.18,'highpass',9000);tone(1800,300,.12,'sawtooth',.03)},
 hitc:()=>{tone(90,40,.3,'sine',.32);noise(.25,700,1.5,.26,'lowpass',200);noise(.35,2400,3,.07,'bandpass',600,.04)},
 hitn:()=>{tone(150,38,.28,'square',.08);noise(.14,1200,1,.22,'lowpass',180)},
 heroHit:()=>{tone(70,28,1.1,'sine',.42,1);noise(.9,500,1,.32,'lowpass',40);tone(140,50,.5,'square',.05)},
 heroHitMe:()=>{tone(66,26,1.3,'sine',.46,1);noise(1,520,1,.34,'lowpass',40);tone(1250,1180,1.1,'sine',.02,1);tone(140,50,.5,'square',.05)},
 diev:()=>{tone(260,40,1.2,'sawtooth',.05,1);noise(1,600,6,.13,'bandpass',80);for(let i=0;i<4;i++)tone(180+Math.random()*90,60,.18,'sine',.06,0,.15+i*.13)},
 diem:()=>{for(let i=0;i<6;i++)noise(.06,3000+Math.random()*3000,4,.13,'bandpass',800,i*.07);tone(220,30,.6,'square',.05);noise(.6,300,1,.22,'lowpass',60,.1)},
 diec:()=>{noise(.5,1200,2,.24,'bandpass',200);tone(110,35,.6,'sine',.32);noise(.4,500,1,.16,'lowpass',90,.12)},
 dien:()=>{tone(330,28,.9,'sawtooth',.06,1);noise(.8,1600,3,.12,'bandpass',90)},
 sting:()=>{tone(41,41,2.5,'sawtooth',.14,1);[146.8,155.6,207.7,220].forEach(f=>tone(f,f*.98,1.8,'sawtooth',.035,1,.05));noise(1.6,200,1,.3,'lowpass',8000);tone(30,20,1.5,'sine',.5)},
 whisper:()=>{for(let i=0;i<3;i++)noise(.5+Math.random()*.5,800+Math.random()*1600,14,.06,'bandpass',600+Math.random()*900,i*.18)}};
function sfx(n){if(!AU.c||AU.mute||AU.c.state!=='running')return;const t=performance.now();if(t-(AU.last[n]||0)<60)return;AU.last[n]=t;try{SFX[n]()}catch(e){}}
function updMute(){$('#mute').innerHTML=`<svg viewBox="0 0 24 24"><path d="M3 9h4l5-5v16l-5-5H3z${AU.mute?'M15 9l6 6m0-6l-6 6':'M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12'}" stroke="#cdb8f0" stroke-width="1.8" stroke-linecap="round" fill-rule="nonzero"/></svg>`;auVol()}
$('#mute').addEventListener('click',()=>{auInit();AU.mute=!AU.mute;localStorage.setItem('hsMute',AU.mute?'1':'0');updMute()});updMute();
/* ================= BACKGROUND ================= */
const BG={cv:$('#bg'),neb:null,deck:null,fog:null,stars:[],emb:[],t0:0};
function bgInit(){const cv=BG.cv,dpr=Math.min(devicePixelRatio||1,QL?qv().bgd:1),W=innerWidth,H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;BG.dpr=dpr;
 const mk=()=>{const c=document.createElement('canvas');c.width=Math.ceil(W/2);c.height=Math.ceil(H/2);return c};const nb=mk(),w=nb.width,h=nb.height;let x=nb.getContext('2d'),R=rng(777);x.fillStyle='#010102';x.fillRect(0,0,w,h);
 for(const[c,a]of[['#2a0618',.32],['#120a2a',.35],['#06161a',.25],['#2a0408',.3],['#160626',.3]])glow(x,R()*w,R()*h,(.3+R()*.5)*Math.max(w,h),c,a);
 for(let i=0;i<w*h/120;i++){x.fillStyle=`rgba(255,240,230,${R()*R()*.45})`;x.fillRect(R()*w,R()*h,.7,.7)}BG.neb=nb;
 const dk=mk();x=dk.getContext('2d');R=rng(99);x.fillStyle='#020102';x.fillRect(0,0,w,h);const vx=w/2,vy=-h*.25;
 x.strokeStyle='rgba(60,56,60,.22)';x.lineWidth=1;for(let i=-14;i<=14;i++){x.beginPath();x.moveTo(vx,vy);x.lineTo(vx+i*w*.16,h*1.2);x.stroke()}for(let k=1;k<16;k++){const y=vy+(h*1.25)*Math.pow(k/15,1.6);x.strokeStyle=`rgba(70,64,64,${.05+k*.012})`;x.beginPath();x.moveTo(0,y);x.lineTo(w,y);x.stroke()}
 for(let i=0;i<w*h/45;i++){x.fillStyle=R()<.6?`rgba(0,0,0,${R()*.5})`:`rgba(90,60,40,${R()*.06})`;x.fillRect(R()*w,R()*h,1+R()*3,1+R()*2)}
 for(let i=0;i<7;i++){const bx=R()*w,by=R()*h,r=8+R()*30;const g=x.createRadialGradient(bx,by,0,bx,by,r);g.addColorStop(0,'rgba(70,0,8,.45)');g.addColorStop(1,'rgba(40,0,4,0)');x.fillStyle=g;x.beginPath();x.ellipse(bx,by,r,r*.6,R()*3,0,7);x.fill()}
 const rc=Math.min(w,h)*.38;x.save();x.translate(w/2,h*.47);x.scale(1,.62);x.strokeStyle='rgba(150,30,40,.16)';x.lineWidth=1.5;for(const k of[1,.92,.62]){x.beginPath();x.arc(0,0,rc*k,0,7);x.stroke()}for(let i=0;i<9;i++){const a=i/9*TAU,b=(i+4)/9*TAU;x.beginPath();x.moveTo(Math.cos(a)*rc*.92,Math.sin(a)*rc*.92);x.lineTo(Math.cos(b)*rc*.92,Math.sin(b)*rc*.92);x.stroke()}
 x.font=`${rc*.09}px serif`;x.fillStyle='rgba(170,40,50,.16)';for(let i=0;i<24;i++){const a=i/24*TAU;x.save();x.rotate(a);x.fillText('ᚦᛉᛟᛞᚹᛗ'[i%6],-3,-rc*.96);x.restore()}x.restore();
 for(const s of[0,w]){const g=x.createLinearGradient(s,0,s?s-w*.12:w*.12,0);g.addColorStop(0,'#0a0a0b');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(s?s-w*.12:0,0,w*.12,h);for(let y=h*.1;y<h;y+=h*.22){glow(x,s?s-4:4,y,14,'#ff1a10',.35)}}
 BG.deck=dk;const fg=document.createElement('canvas');fg.width=256;fg.height=160;x=fg.getContext('2d');R=rng(5);for(let i=0;i<40;i++)glow(x,30+R()*196,60+R()*40,20+R()*35,'#8a8a96',.07);BG.fog=fg;if(!BG.fogU){BG.fogU=1;const fd=$('#fog');if(fd)fd.style.setProperty('--fog',`url(${fg.toDataURL()})`)}
 BG.stars=[];for(let i=0;i<70;i++)BG.stars.push({x:R()*W,y:R()*H,r:.4+R()*1.1,p:R()*6.28,s:.4+R()*1.6});
 BG.emb=[];for(let i=0;i<34;i++)BG.emb.push({x:R()*W,y:R()*H,v:.15+R()*.5,r:.6+R()*1.6,p:R()*6.28,c:R()<.7?'#ff5a1a':'#7aff9a'})}
function bgKick(){if(!BG.run&&!BAT.idle&&!BAT.hid){BG.run=1;requestAnimationFrame(bgFrame)}}
/* v1.9 battery: the loop used to request a frame on every vsync and skip most of them. Each wake-up made the browser run a
   main-thread frame that re-ticks every CSS animation on the page (~90% of idle CPU on the collection screen). Now it sleeps with a
   timer until the next draw is due, so the page only wakes 8-30 times a second. Same draw rate, same look. */
function bgNext(iv,t){const w=iv-(performance.now()-t)-6;if(w>2)BG.tm=setTimeout(()=>{BG.tm=0;requestAnimationFrame(bgFrame)},w);else requestAnimationFrame(bgFrame)}
function bgFrame(t){if(BAT.idle||BAT.hid||document.hidden){BG.run=0;return}BG.ticks=(BG.ticks||0)+1;const idle=cur!=='title'&&performance.now()-(BG.act||0)>12000&&!(FX.P&&FX.P.length);const iv=1000/(idle?8:Math.min(QL?qv().bgfps:24,QL&&QL.mobile?(cur==='match'?30:24):60))-4;/* v1.9: menus draw only slow embers, 24 fps on phones */if(t-BG.t0<iv){bgNext(iv-(t-BG.t0),t);return}bgNext(iv,t);if(UI.cin&&document.body.classList.contains('cinhold'))return;/* hidden behind the legendary cinematic */
 if(cur==='match'&&document.body.classList.contains('b3d')){if(!BG.b3c){BG.cv.getContext('2d').clearRect(0,0,BG.cv.width,BG.cv.height);BG.b3c=1}clearTimeout(BG.tm);BG.tm=setTimeout(()=>{BG.tm=0;requestAnimationFrame(bgFrame)},600);return}BG.b3c=0;/* v2.0: the 3D table draws the board atmosphere; this canvas idles */BG.draws=(BG.draws||0)+1;const dt=Math.min(100,t-BG.t0);BG.t0=t;const cv=BG.cv,x=cv.getContext('2d'),W=innerWidth,H=innerHeight,m=cur==='match';x.setTransform(BG.dpr,0,0,BG.dpr,0,0);x.globalAlpha=1;const pt=BG.painted;if(pt)x.clearRect(0,0,W,H);else x.drawImage(m?BG.deck:BG.neb,0,0,W,H);
 if(!m)for(const s of BG.stars){if(pt&&s.y>H*.55)continue;x.globalAlpha=(.25+.6*Math.abs(Math.sin(t/1000*s.s*.5+s.p)))*(pt?.7:1);x.fillStyle='#f0e6dc';x.fillRect(s.x,s.y,s.r,s.r)}
 
 const ne=fxLow()?12:BG.emb.length;for(let i=0;i<ne;i++){const e=BG.emb[i];e.y-=e.v*dt*.05;e.x+=Math.sin(t/900+e.p)*.25;if(e.y<-5){e.y=H+5;e.x=Math.random()*W}x.globalAlpha=(.25+.5*Math.abs(Math.sin(t/600+e.p)))*(m?1:.6);x.fillStyle=m?e.c:'#b080ff';x.beginPath();x.arc(e.x,e.y,e.r,0,7);x.fill()}x.globalAlpha=1;
 if(m)livingBoard(x,t,W,H);if(cur==='title'&&!document.body.classList.contains('painted'))drawTitleEye(t)}
/* painted scene: art/ui/<key>.webp behind the canvas (fog, stars, embers on top); procedural canvas is the fallback */
const SC={key:null,st:{},cb:{},dim:{},foc:{menu:[.5,.18,.13],menu_p:[.5,.18,.13],menu_bg:[.53,.27,.075],menu_bg_l:[.476,.153,.085]}};
const uiArt=k=>`${ARTDIR}ui/${k}.webp?${ARTV}`;
function scLoad(k,cb){const s=SC.st[k];if(s===1||s===2)return cb(s===1);(SC.cb[k]=SC.cb[k]||[]).push(cb);if(s===0)return;SC.st[k]=0;const im=new Image();
 im.onload=()=>{SC.st[k]=1;SC.dim[k]=[im.naturalWidth,im.naturalHeight];for(const f of SC.cb[k].splice(0))f(true)};im.onerror=()=>{SC.st[k]=2;for(const f of SC.cb[k].splice(0))f(false)};im.src=uiArt(k)}
const isLand=()=>document.body.classList.contains('land');
function sceneKey(){if(cur==='match'&&G){const f='vmc'.includes(G.p[0].fac)?G.p[0].fac:'v';return'board_'+f+(isLand()?'':'_p')}const nb=isLand()?'menu_bg_l':'menu_bg';return SC.st[nb]===2?(isLand()?'menu':'menu_p'):nb}
function scene(){document.body.dataset.scr=cur;const k=sceneKey(),pb=$('#pbg');if(k===SC.key){scGlow();return}SC.key=k;if(SC.st[k]!==1){pb.classList.remove('ok');BG.painted=false}
 scLoad(k,ok=>{if(SC.key!==k)return;if(!ok&&k.startsWith('menu_bg')){SC.key=null;scene();return}document.body.classList.toggle('mbg',ok&&k.startsWith('menu_bg'));pb.style.setProperty('--pimg',ok?`url(${uiArt(k)})`:'none');pb.classList.toggle('ok',ok);BG.painted=ok;if(k.startsWith('menu'))document.body.classList.toggle('painted',ok);scGlow()})}
function scGlow(){const pb=$('#pbg'),k=SC.key,f=SC.foc[k],d=SC.dim[k];pb.classList.toggle('glow',!!(f&&d));if(!f||!d)return;const W=innerWidth,H=innerHeight,ew=W*1.1,eh=H*1.1,s=Math.max(ew/d[0],eh/d[1]),ox=-W*.05+(ew-d[0]*s)/2,oy=-H*.05+(eh-d[1]*s)/2;
 pb.style.setProperty('--gx',(ox+f[0]*d[0]*s).toFixed(0)+'px');pb.style.setProperty('--gy',(oy+f[1]*d[1]*s).toFixed(0)+'px');pb.style.setProperty('--gr',(f[2]*d[1]*s*2.2).toFixed(0)+'px')}
function scPre(ks){for(const k of ks)scLoad(k,()=>{})}
const TE={cv:$('#teye'),lx:0,ly:0,tx:0,ty:0,nt:0,blink:0,layer:null};
function teSize(){const s=Math.min(innerWidth*.95,innerHeight*(innerWidth>innerHeight*1.15?.55:.5),560),d=Math.min(devicePixelRatio||1,2);TE.cv.width=s*d;TE.cv.height=s*d;TE.cv.style.width=TE.cv.style.height=s+'px';TE.s=s;TE.d=d;
 const L=document.createElement('canvas');L.width=L.height=s*d;const x=L.getContext('2d'),R=rng(31337),P=PAL.v;x.scale(d,d);for(let i=0;i<13;i++){const a=TAU*i/13+.3;tentacle(x,s/2+Math.cos(a)*s*.52,s/2+Math.sin(a)*s*.52,s*.44,a+Math.PI+(R()-.5)*.6,s*.032,P,R,60)}TE.layer=L}
function drawTitleEye(t){const x=TE.cv.getContext('2d'),s=TE.s;x.setTransform(TE.d,0,0,TE.d,0,0);x.clearRect(0,0,s,s);x.save();x.translate(s/2,s/2);x.rotate(Math.sin(t/5200)*.06);const k=1+Math.sin(t/3100)*.025;x.scale(k,k);x.globalAlpha=.8;x.drawImage(TE.layer,-s/2,-s/2,s,s);x.restore();x.globalAlpha=1;
 if(t>TE.nt){TE.tx=(Math.random()-.5)*1.6;TE.ty=(Math.random()-.5)*1.2;TE.nt=t+900+Math.random()*2400;if(Math.random()<.25)TE.blink=t}TE.lx+=(TE.tx-TE.lx)*.08;TE.ly+=(TE.ty-TE.ly)*.08;
 const bk=t-TE.blink<260?Math.abs(Math.cos((t-TE.blink)/260*Math.PI)):1;eyeAt(x,s/2,s/2,s*.3,s*.12,PAL.v,rng(9),TE.lx,TE.ly,bk);x.globalCompositeOperation='source-atop';x.fillStyle='rgba(20,0,10,.25)';x.fillRect(0,0,s,s);x.globalCompositeOperation='source-over'}
/* ================= VISUAL KIT ================= */
const ATKP={v:'M7 31C3 19 9 6 27 1 19 8 15 17 18 31zM12.5 13.5L6 11l4.5 5.5zM12 21.5l-6.5.5 6 3zM16.5 7L13 2.5l1 6z',
 m:'M16 .5l5.5 7.5v16.5L16 33l-5.5-8.5V8zM10.5 21L5 29h5.5zM21.5 21l5.5 8h-5.5z',
 c:'M16 0l5.5 6-2.8 3 2.8 3-2.8 3 2.8 3-2.2 3.4h-6.6l-2.2-3.4 2.8-3-2.8-3 2.8-3-2.8-3zM4.5 20.4h23l-3 3.6h-17zM13.2 24h5.6v4.6h-5.6zM16 27.6a3.2 3.2 0 1 1-.01 0z',
 n:'M2 8.5h25l3 2.5v5H18.5l-1.6 3.5h-3.6L11 31H3.5l2.6-12.5L2 15z'};
const SIG={v:ICO.dread,m:'M12 1.5l11 20H1zm0 5.2L5.6 18.5h12.8zM11 10h2v5h-2zM11 16h2v2h-2z',c:'M2.5 3.5h19L12 21.5zm4.7 2.8L12 15.6l4.8-9.3zM11 0h2v3.5h-2zM5 10h14v1.6H5z',n:'M12 1l2.6 8.4L23 12l-8.4 2.6L12 23l-2.6-8.4L1 12l8.4-2.6z'};
const atkHTML=(f,a)=>`<div class="atk"><svg viewBox="0 0 32 34"><path d="${ATKP[f]}" fill="url(#ga-${f})" stroke="#000" stroke-width="1.6" stroke-linejoin="round" filter="url(#ds)"/><path d="${ATKP[f]}" fill="url(#gsh)"/><path d="${ATKP[f]}" fill="url(#ghl)"/></svg><b>${a}</b></div>`;
const hpHTML=(h,p=100)=>`<div class="hp" style="--p:${p}%"><i class="shd"></i><div class="drop"><div class="fill"></div><i class="spec"></i></div><b>${h}</b><i class="drip"></i></div>`;
const FAC_SVG='<svg class="fac" viewBox="0 0 40 46"><path d="M20 1L38 12 31 15.5 20 9z" fill="#fff" opacity=".42"/><path d="M38 12V34L31 30.5V15.5z" fill="#fff" opacity=".12"/><path d="M38 34L20 45V37L31 30.5z" fill="#000" opacity=".38"/><path d="M20 45L2 34 9 30.5 20 37z" fill="#000" opacity=".5"/><path d="M2 34V12L9 15.5V30.5z" fill="#000" opacity=".22"/><path d="M2 12L20 1V9L9 15.5z" fill="#fff" opacity=".26"/><path d="M9 15.5L20 9 31 15.5 31 30.5 20 37 9 30.5z" fill="url(#gtab)"/><path d="M11 29L27 12.5 29.5 15 14 31.5z" fill="#fff" opacity=".16"/><path d="M20 1L38 12V34L20 45 2 34V12z M9 15.5L20 9 31 15.5 31 30.5 20 37 9 30.5z" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width=".7"/><path d="M12.5 13l1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1 2.4-1z" fill="#fff"/></svg>';
const costHTML=c=>`<div class="cost"><div class="cr"></div>${FAC_SVG}<b>${c}</b></div>`;
const sigHTML=f=>`<svg class="sig" viewBox="0 0 24 24"><path fill-rule="evenodd" d="${SIG[f]}" fill="url(#gsig)" stroke="#000" stroke-width=".8" filter="url(#ds)"/></svg>`;
const setHTML=r=>`<svg class="set" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12 .8l3.1 7.9 7.9 3.3-7.9 3.3L12 23.2l-3.1-7.9L1 12l7.9-3.3zM12 8.6a3.4 3.4 0 1 0 .01 0z" fill="url(#gr-${r})" stroke="#000" stroke-width="1" filter="url(#ds)"/><path d="M12 .8l3.1 7.9L12 8.6 8.9 8.7z" fill="#fff" opacity=".45"/></svg>`;
/* ===== Legendary living art (v7.4) — see RENDERING_RULES.md =====
   All motion is CSS keyframes on transform/opacity (compositor-only, zero repaints). No per-frame JS writes any more: the v7.3
   rAF driver rewrote inline transforms 30x/s and that re-rasterised .lp/.lf every frame (caught by tests/paintprobe.py).
   Every loop duration divides LGP, and each card gets animation-delay = -(global clock + per-card phase) mod LGP, so a card
   that is re-created (zoom, re-render, pack reveal) continues mid-motion instead of snapping back to frame 0. */
const LGP=240,lgPh=id=>{let h=0;for(const c of id)h=(h*31+c.charCodeAt(0))>>>0;return(h%997)/997*LGP},
 lgDelay=id=>-((performance.now()/1000+lgPh(id))%LGP);
const lgHTML=(id,big)=>C[id].r==='L'?`<div class="lg" data-id="${id}" style="--lgd:${lgDelay(id).toFixed(2)}s"><i class="lp" style="background-image:${artBG(id,big)}"></i><i class="lm"></i><i class="lm m2"></i><i class="lgw"></i><i class="lf"></i></div>`:'';
/* card-level Legendary trim: gilded frame edge that breathes + two glints running along it, and the animated set gem */
const lgTrim=id=>C[id].r==='L'?`<i class="lge" style="--lgd:${lgDelay(id).toFixed(2)}s"><b></b><b></b></i>`:'';
const LG={vis:new Set(),rm:matchMedia('(prefers-reduced-motion: reduce)')};
LG.io=new IntersectionObserver(es=>{for(const e of es)e.isIntersecting?LG.vis.add(e.target):LG.vis.delete(e.target)});
function lgReg(root){const l=root.querySelector('.lg');if(l)LG.io.observe(l)}
/* legendary video loops: art/anim/<id>.mp4, only a few at once (zoom > hand > board), paused offscreen/hidden, off for reduced motion; still image underneath is the fallback */
const VID={max:3,on:new Set(),bad:{},plays:0,miss:new Map()};
/* v7.4: video only where the card is big or the moment is focused: zoom, cinematic (e.js), Legendary units on the board, pack
   reveal, test sheet. Hand cards and collection/builder grids never get a <video>; they run the CSS Ken Burns + motes over the still. */
/* v9 battery: only the zoom view, or a Legendary drawn LARGE (>=140 px wide: pack reveal on big screens, test sheet) plays its loop.
   Board units, hand and grids always show the still. */
const VBIG=140,vBig=el=>el.getBoundingClientRect().width>=VBIG;
/* pack reveal: a slot's loop may start only once its flip has fully settled (no video decode while the card turns) */
const vFlipOk=el=>{const s=el.closest('.pslot');return!s||(s._ut&&performance.now()-s._ut>2000)};
const vRank=el=>el.closest('#zoom')?0:!vFlipOk(el)?-1:el.closest('.unit')?-1:!vBig(el)?-1:el.closest('#pk,.pslot')?1:el.closest('#sheet')?3:-1;
/* v7.3 flicker-free video: the <video> is created once per card and never removed while the card lives, never display-toggled.
   It stays at opacity 0 over the still WebP until a decoded frame is actually presented (requestVideoFrameCallback, or 'playing' + 2 rAF
   as a fallback), then crossfades in. Pausing (offscreen / over the cap) keeps the last frame on screen. Max opacity .99 keeps Android
   Chrome/WebView from promoting it to a hardware overlay plane (overlay promotion is what produces black flashes on start/loop/pause). */
function vidReady(v,fn){let done=0;const go=()=>{if(done)return;done=1;fn()};
 if(v.requestVideoFrameCallback)v.requestVideoFrameCallback(()=>requestAnimationFrame(go));
 v.addEventListener('playing',()=>requestAnimationFrame(()=>requestAnimationFrame(()=>setTimeout(go,v.requestVideoFrameCallback?250:0))),{once:true})}
function vidStop(el,free){const v=el.querySelector('video');if(v){if(!v.paused)v.pause();if(free){el.classList.remove('vid');const gone=()=>{v.removeAttribute('src');v.load();v.remove()};if(el.isConnected)setTimeout(gone,900);else gone()}}VID.on.delete(el);VID.miss.delete(el)}
function vidPlay(el){const id=el.dataset.id;if(VID.bad[id])return;let v=el.querySelector('video');VID.miss.delete(el);
 if(!v){v=document.createElement('video');v.className='lv';v.muted=true;v.defaultMuted=true;v.loop=true;v.playsInline=true;v.autoplay=true;for(const a of['muted','loop','playsinline','autoplay'])v.setAttribute(a,'');v.preload='auto';v.disablePictureInPicture=true;v.setAttribute('disableremoteplayback','');
  vidReady(v,()=>{el.classList.add('vid');VID.plays++});v.onerror=()=>{VID.bad[id]=1;vidStop(el,1)};v.src=`${ARTDIR}anim/${id}.mp4?${VIDV}`;el.querySelector('.lp').appendChild(v)}
 if(v.paused)v.play().catch(()=>{});VID.on.add(el)}
function vidSync(){for(const el of[...VID.on])if(!el.isConnected)vidStop(el,1);for(const el of LG.vis)if(!el.isConnected){LG.vis.delete(el);LG.io.unobserve(el)}
 if(LG.rm.matches||document.hidden||BAT.hid||(BAT.idle&&!$('#zoom').classList.contains('on'))){for(const el of[...VID.on])vidStop(el);return}
 // sticky choice: ties keep whatever is already playing, so two equal Legendaries never trade play/pause back and forth
 const want=new Set([...LG.vis].filter(el=>el.isConnected&&el.dataset.id&&!VID.bad[el.dataset.id]&&vRank(el)>=0&&!el.closest('.locked')).sort((a,b)=>vRank(a)-vRank(b)||(VID.on.has(b)-VID.on.has(a))).slice(0,VID.max));
 // hysteresis: only pause after ~0.7 s of not being wanted (cards sliding through the edge of the viewport don't pop)
 for(const el of[...VID.on])if(!want.has(el)){const n=(VID.miss.get(el)||0)+1;if(n>=2||VID.max===0)vidStop(el);else VID.miss.set(el,n)}
 for(const el of want)vidPlay(el)}
setInterval(vidSync,350);document.addEventListener('visibilitychange',vidSync);
(function kit(){const rs=document.documentElement.style;
 const cx=50,cy=79,r=38,pts=['50% 0%'];for(let a=-28.8;a<=208.8;a+=6){const t=a*Math.PI/180;pts.push(`${(cx+Math.cos(t)*r).toFixed(1)}% ${((cy+Math.sin(t)*r)/1.2).toFixed(1)}%`)}rs.setProperty('--drop',`polygon(${pts.join(',')})`);
 for(const f of'vmcn')rs.setProperty('--fr-'+f,`url(${frameURL(f)})`);rs.setProperty('--lane',`url(${laneURL()})`);$('#grain').style.backgroundImage=`url(${grainURL()})`;
 const G=(id,s)=>`<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">${s.map((c,i)=>`<stop offset="${i/(s.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
 const GL=(id,s,x2=1,y2=1)=>`<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${s.map(([c,o],i)=>`<stop offset="${i/(s.length-1)}" stop-color="${c}" stop-opacity="${o??1}"/>`).join('')}</linearGradient>`;
 document.body.insertAdjacentHTML('beforeend',`<svg width="0" height="0" style="position:absolute"><defs>${G('ga-v',['#e0fff4','#4ae0b0','#0e5a46','#7a3ab0','#1a0630'])}${G('ga-m',['#fffbe8','#ffc060','#a04a08','#ffd070','#4a1800'])}${G('ga-c',['#ffffff','#b8b2a8','#4a4440','#e0dcd4','#3a1010'])}${G('ga-n',['#e0e4e8','#6a7076','#1e2022','#9aa0a6','#0c0c0e'])}
 ${GL('ghl',[['#fff',.75],['#fff',.12],['#fff',0]],.55,.55)}${GL('gsh',[['#000',0],['#000',0],['#000',.55]],1,1)}${G('gsig',['#fff4dc','#c8a070','#5a3a1a','#e8c890','#2a1a0a'])}
 ${G('gr-C',['#f4f6f8','#8a9096','#3a3e42','#c8ccd0'])}${G('gr-U',['#e0f4ff','#4aa8e0','#103a60','#8ad0ff'])}${G('gr-R',['#fff6d0','#e8a830','#6a3a00','#ffd870'])}${G('gr-L',['#ffd0f8','#c040e0','#4a8aff','#4affc0','#ffd050'])}${G('gr-T',['#888','#333'])}
 <radialGradient id="gtab" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".5" stop-color="#b070ff" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></radialGradient>
 <filter id="ds" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx=".6" dy="1.3" stdDeviation=".7" flood-color="#000" flood-opacity=".85"/></filter></defs></svg>`);
 for(const f of'vmcn')rs.setProperty('--mote-'+f,`url(${moteURL(f)})`);rs.setProperty('--packbg',`url(${packBgURL()})`);rs.setProperty('--packsig',`url(${sigilURL()})`);rs.setProperty('--cardback',`url(${cardBackURL()})`);rs.setProperty('--parch',`url(${parchURL()})`)})();

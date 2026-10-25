'use strict';
/* ================= v7 FX ENGINE: combat juice, deaths, madness, cinematics, tilt/foil, living board ================= */
/* ---------- v7.1 quality tiers: high / medium / low, auto-scaled by measured frame rate ---------- */
var QL;QL={rm:matchMedia('(prefers-reduced-motion: reduce)'),mobile:/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)||matchMedia('(pointer:coarse)').matches,
 pref:'auto',q:'high',log:[],down:0,up:0,fr:[],lt:0,warm:0,fps:0};
(()=>{let s=localStorage.getItem('hsQ');if(!s){const o=localStorage.getItem('hsFx');s=o==='low'?'low':'auto'}QL.pref=['auto','high','medium','low'].includes(s)?s:'auto';
 QL.q=QL.pref!=='auto'?QL.pref:QL.rm.matches?'low':(localStorage.getItem('hsQa')||qDefault())})();
function qDefault(){return QL.mobile?'medium':'high'}
const QLV={high:{n:.55,shake:.7,fxd:1.5,bgd:1.25,bgfps:30,vid:2},medium:{n:.3,shake:.45,fxd:1,bgd:1,bgfps:15,vid:1},low:{n:.15,shake:0,fxd:1,bgd:.75,bgfps:8,vid:0}};
const qv=()=>QLV[QL.q]||QLV.medium;
const FXQ={rm:QL.rm,get low(){return QL.q==='low'},set low(v){setQuality(v?'low':'auto')}};
const fxLow=()=>QL.q==='low'||QL.rm.matches;
function qApply(){const b=document.body;for(const k of['high','medium','low'])b.classList.toggle('q-'+k,QL.q===k);b.classList.toggle('fxlow',fxLow());
 if(FX.cv)fxSize();if(typeof bgInit==='function'&&BG.cv)bgInit();VID.max=qv().vid;if(typeof madSet==='function'&&G){MZ.me=-1;madSet()}const s=$('#sQ');if(s)s.value=QL.pref;const n=$('#sQn');if(n)n.textContent=QL.pref==='auto'?'Auto · now '+QL.q[0].toUpperCase()+QL.q.slice(1):''}
function setQuality(pref){QL.pref=['auto','high','medium','low'].includes(pref)?pref:'auto';localStorage.setItem('hsQ',QL.pref);localStorage.removeItem('hsFx');
 QL.q=QL.pref!=='auto'?QL.pref:QL.rm.matches?'low':(localStorage.getItem('hsQa')||qDefault());QL.fr=[];QL.warm=performance.now()+1500;qApply()}
/* frame monitor: 2 s windows, ignores hidden tabs and huge gaps; steps down one tier when < 45 fps (auto only), keeps watching,
   steps back up one tier (never above the device default) after 30 s of steady 58+ fps */
function qKick(){if(!QL.run&&!BAT.idle&&!BAT.hid){QL.run=1;QL.lt=0;requestAnimationFrame(qMon)}}
/* v1.9 battery: the monitor kept a frame request running forever, which (like the background loop) woke the page on every vsync.
   It now samples in bursts: one 2 s window, then a 7 s rest, but keeps watching continuously while the frame rate is below 50. */
function qRest(){QL.run=0;QL.fr=[];QL.ws=0;QL.lt=0;clearTimeout(QL.rt);QL.rt=setTimeout(()=>{QL.rt=0;qKick()},7000)}
function qMon(t){if(BAT.idle||BAT.hid){QL.run=0;QL.fr=[];QL.ws=0;return}if(QL.rest){QL.rest=0;qRest();return}requestAnimationFrame(qMon);QL.ticks=(QL.ticks||0)+1;const d=t-QL.lt;QL.lt=t;if(document.hidden||d>400||d<=0){QL.fr=[];QL.ws=t;return}if(t<QL.warm){QL.ws=t;return}
 QL.fr.push(d);if(t-(QL.ws||t)<2000){QL.ws=QL.ws||t;return}const n=QL.fr.length,sum=QL.fr.reduce((a,b)=>a+b,0);QL.fps=n*1000/sum;QL.fr=[];QL.ws=t;QL.win=(QL.win||0)+1;if(QL.fps>=50)QL.rest=1;
 if(QL.pref!=='auto'||QL.rm.matches)return;const ord=['low','medium','high'],i=ord.indexOf(QL.q);
 if(QL.fps<45&&i>0&&t-QL.down>3500){QL.q=ord[i-1];QL.down=t;QL.good=0;QL.log.push({t:Math.round(t),fps:+QL.fps.toFixed(1),to:QL.q});localStorage.setItem('hsQa',QL.q);QL.warm=t+1200;qApply();return}
 if(QL.fps>=58){QL.good=(QL.good||0)+1;if(QL.good>=15&&i<ord.indexOf(qDefault())&&t-QL.down>30000){QL.q=ord[i+1];QL.good=0;QL.up=t;QL.log.push({t:Math.round(t),fps:+QL.fps.toFixed(1),to:QL.q});localStorage.setItem('hsQa',QL.q);QL.warm=t+1200;qApply()}}else QL.good=0}
QL.warm=performance.now()+2500;qKick();
const FX={cv:null,x:null,dpr:1,P:[],free:[],max:520,run:false,lt:0,frames:0,spawned:0,peak:0,img:{},spr:{}};
function fxInit(){const cv=document.createElement('canvas');cv.id='fxc';document.body.appendChild(cv);FX.cv=cv;FX.x=cv.getContext('2d');fxSize();for(let i=0;i<FX.max;i++)FX.free.push({});addEventListener('resize',fxSize)}
function fxSize(){const d=Math.min(devicePixelRatio||1,qv().fxd);FX.dpr=d;FX.cv.width=Math.round(innerWidth*d);FX.cv.height=Math.round(innerHeight*d)}
const rr=(a,b)=>a+Math.random()*(b-a);
/* particle: t=type, x,y,vx,vy (px/s), g gravity, dr drag, life (s), age, sz, c color, a alpha, add (additive) */
function sp(t,x,y,vx,vy,life,sz,c){const p=FX.free.pop();if(!p)return null;p.t=t;p.x=x;p.y=y;p.vx=vx;p.vy=vy;p.life=life;p.age=0;p.sz=sz;p.c=c;p.g=0;p.dr=0;p.a=1;p.add=0;p.rot=0;p.vr=0;p.img=null;p.x2=0;p.y2=0;p.k=0;p.pts=null;p.dl=0;
 FX.P.push(p);FX.spawned++;if(FX.P.length>FX.peak)FX.peak=FX.P.length;fxKick();return p}
const nq=n=>Math.max(1,Math.round(n*(fxLow()?.15:qv().n)));
function soft(c){let s=FX.spr[c];if(s)return s;s=document.createElement('canvas');s.width=s.height=64;const x=s.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,c);g.addColorStop(.35,c+'aa');g.addColorStop(1,c+'00');x.fillStyle=g;x.fillRect(0,0,64,64);return FX.spr[c]=s}
function fxKick(){if(!FX.run){FX.run=true;FX.lt=performance.now();requestAnimationFrame(fxLoop)}}
function fxLoop(t){const x=FX.x,d=FX.dpr;if(!FX.P.length){FX.run=false;x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,FX.cv.width,FX.cv.height);return}
 requestAnimationFrame(fxLoop);const dt=Math.min(.05,(t-FX.lt)/1000);FX.lt=t;FX.frames++;x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,FX.cv.width,FX.cv.height);x.setTransform(d,0,0,d,0,0);
 const P=FX.P;let w=0;for(let i=0;i<P.length;i++){const p=P[i];if(p.dl>0){p.dl-=dt;P[w++]=p;continue}p.age+=dt;if(p.age>=p.life){FX.free.push(p);continue}P[w++]=p;
  p.vy+=p.g*dt;if(p.dr){const k=Math.max(0,1-p.dr*dt);p.vx*=k;p.vy*=k}p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;const u=p.age/p.life;
  x.globalCompositeOperation=p.add?'lighter':'source-over';drawP(x,p,u)}
 P.length=w;x.globalAlpha=1;x.globalCompositeOperation='source-over'}
function drawP(x,p,u){switch(p.t){
 case'sp':{x.globalAlpha=p.a*(1-u);x.strokeStyle=p.c;x.lineWidth=p.sz*(1-u*.6);x.beginPath();x.moveTo(p.x,p.y);x.lineTo(p.x-p.vx*.035,p.y-p.vy*.035);x.stroke();break}
 case'dr':{x.globalAlpha=p.a*(u>.75?(1-u)*4:1);x.fillStyle=p.c;const sp=Math.hypot(p.vx,p.vy),st=Math.min(2.6,1+sp/500);x.save();x.translate(p.x,p.y);x.rotate(Math.atan2(p.vy,p.vx));x.beginPath();ell(x,0,0,p.sz*st,p.sz,0,0,7);x.fill();x.restore();break}
 case'pl':{const g=Math.min(1,u*5);x.globalAlpha=p.a*(u>.6?(1-u)/.4:1);x.fillStyle=p.c;x.beginPath();ell(x,p.x,p.y,p.sz*g,p.sz*.42*g,0,0,7);x.fill();x.globalAlpha*=.5;x.fillStyle='#ff6a6a';x.beginPath();ell(x,p.x-p.sz*.25*g,p.y-p.sz*.1*g,p.sz*.25*g,p.sz*.08*g,0,0,7);x.fill();break}
 case'sm':{const r=p.sz*(.5+u*1.2);x.globalAlpha=p.a*(1-u)*(u<.15?u/.15:1);x.drawImage(soft(p.c),p.x-r,p.y-r,r*2,r*2);break}
 case'fl':{const r=p.sz*(.6+u*.8);x.globalAlpha=p.a*(1-u)*(u<.1?u/.1:1);x.drawImage(soft(p.c),p.x-r,p.y-r,r*2,r*2);break}
 case'as':{x.globalAlpha=p.a*(1-u);x.fillStyle=p.c;p.vx+=Math.sin(p.age*5+p.k)*6;x.fillRect(p.x,p.y,p.sz,p.sz);break}
 case'sh':{x.globalAlpha=p.a*(u>.55?(1-u)/.45:1);x.save();x.translate(p.x,p.y);x.rotate(p.rot);if(p.img)x.drawImage(p.img,-p.img.width/2,-p.img.height/2);x.restore();break}
 case'tr':{x.globalAlpha=p.a*(1-u);x.strokeStyle=p.c;x.lineWidth=p.sz*(1-u);x.beginPath();x.moveTo(p.x,p.y);x.lineTo(p.x2,p.y2);x.stroke();x.globalAlpha*=.5;x.lineWidth=p.sz*3*(1-u);x.stroke();break}
 case'rg':{x.globalAlpha=p.a*(1-u);x.strokeStyle=p.c;x.lineWidth=Math.max(.5,p.k*(1-u));x.beginPath();ell(x,p.x,p.y,p.sz*u+4,(p.sz*u+4)*(p.vr||1),0,0,7);x.stroke();break}
 case'ck':{x.globalAlpha=p.a*(u<.7?1:(1-u)/.3);x.strokeStyle=p.c;x.lineWidth=p.sz;x.lineCap='round';const n=Math.ceil(p.pts.length*Math.min(1,u*3));x.beginPath();for(const L of p.pts.slice(0,n)){x.moveTo(L[0],L[1]);for(let i=2;i<L.length;i+=2)x.lineTo(L[i],L[i+1])}x.stroke();x.strokeStyle='#ffffffaa';x.lineWidth=p.sz*.35;x.stroke();break}
 case'te':{const k=u<.35?u/.35:u<.6?1:1-(u-.6)/.4,n=16,ex=p.x+(p.x2-p.x)*Math.min(1,u/.35),ey=p.y+(p.y2-p.y)*Math.min(1,u/.35),nx=-(p.y2-p.y),ny=p.x2-p.x,L=Math.hypot(nx,ny)||1;
  x.globalAlpha=p.a*Math.max(0,k);x.lineCap='round';for(let pass=0;pass<3;pass++){x.strokeStyle=pass===2?'#e0b0ff':pass?'#7a2ac0':'#0c0214';let px=p.x,py=p.y;for(let i=1;i<=n;i++){const s=i/n,w=Math.sin(s*Math.PI*2.4+p.age*14+p.k)*p.sz*2.2*Math.sin(s*Math.PI);
   const qx=p.x+(ex-p.x)*s+nx/L*w,qy=p.y+(ey-p.y)*s+ny/L*w;x.lineWidth=(pass===2?.14:pass?.42:1)*p.sz*(1-s*.8);x.beginPath();x.moveTo(px,py);x.lineTo(qx,qy);x.stroke();px=qx;py=qy}}break}}}
/* ---------- screen shake (WAAPI transform, decays) ---------- */
function shake(el,mag,ms=260){ms=Math.min(ms,320);if(!el||fxLow()||mag<=0)return;mag*=qv().shake;const k=[];for(let i=0;i<=8;i++){const f=(1-i/8)*mag;k.push({transform:i===8?'none':`translate(${rr(-f,f).toFixed(1)}px,${rr(-f,f).toFixed(1)}px) rotate(${rr(-f,f)*.08}deg)`})}el.animate(k,{duration:ms,easing:'ease-out'})}
/* ---------- combat impacts ---------- */
const FAC_HIT={v:'#2a0838',m:'#9ef8ff',c:'#8a0414',n:'#d8c8a0'};
function impact(f,x,y,ax,ay,n,hero){const dx=x-ax,dy=y-ay,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,big=hero?1.6:1,cnt=k=>nq((k+n*3)*big);
 f=f||'n';
 if(f==='v'){if(ax||ay){const t=sp('te',ax,ay,0,0,.55,9*big,'');if(t){t.x2=x;t.y2=y;t.k=Math.random()*6}}
  for(let i=0;i<cnt(16);i++){const a=Math.atan2(uy,ux)+rr(-1.4,1.4),s=rr(80,420);const p=sp('dr',x,y,Math.cos(a)*s,Math.sin(a)*s-rr(40,160),rr(.5,1.1),rr(1.5,4.2),Math.random()<.7?'#1c0628':'#6a2ab0');if(p){p.g=900;p.dr=1.2}}
  for(let i=0;i<nq(3);i++){const p=sp('sm',x+rr(-10,10),y+rr(-10,10),rr(-20,20),rr(-30,0),rr(.6,1),rr(18,30)*big,'#4a1a6a');if(p)p.a=.5}
  const r=sp('rg',x,y,0,0,.5,70*big,'#6affd0');if(r){r.k=3;r.vr=.6;r.a=.6;r.add=1}}
 else if(f==='m'){if(ax||ay){const t=sp('tr',ax,ay,0,0,.22,3,'#d8ffff');if(t){t.x2=x;t.y2=y;t.add=1}}
  for(let i=0;i<cnt(22);i++){const a=Math.atan2(uy,ux)+rr(-1.1,1.1)+(Math.random()<.3?Math.PI:0),s=rr(160,720);const p=sp('sp',x,y,Math.cos(a)*s,Math.sin(a)*s,rr(.25,.6),rr(1,2.4),Math.random()<.5?'#ffd27a':'#ffffff');if(p){p.g=700;p.dr=2;p.add=1}}
  const fl=sp('fl',x,y,0,0,.28,60*big,'#9ef8ff');if(fl)fl.add=1;for(let i=0;i<nq(3);i++){const p=sp('sm',x,y,rr(-30,30),rr(-60,-10),rr(.7,1.2),rr(14,26)*big,'#6a6a70');if(p)p.a=.45}}
 else if(f==='c'){for(let i=0;i<cnt(24);i++){const a=Math.atan2(uy,ux)+rr(-.75,.75),s=rr(120,620);const p=sp('dr',x,y,Math.cos(a)*s,Math.sin(a)*s-rr(60,200),rr(.5,1.2),rr(1.4,4.6),Math.random()<.75?'#7a0410':'#c0101e');if(p){p.g=1100;p.dr=.8}}
  for(let i=0;i<nq(2);i++){const p=sp('pl',x+ux*rr(10,40)+rr(-14,14),y+uy*rr(10,40)+rr(6,22),0,0,rr(1.4,2.2),rr(10,20)*big,'#4a0208');if(p)p.a=.75}
  const fl=sp('fl',x,y,0,0,.25,50*big,'#ff2030');if(fl){fl.add=1;fl.a=.6}}
 else{for(let i=0;i<cnt(14);i++){const a=rr(0,7),s=rr(80,360);const p=sp('sp',x,y,Math.cos(a)*s,Math.sin(a)*s,rr(.2,.45),rr(1,2),'#f0e0b0');if(p){p.add=1;p.dr=3}}for(let i=0;i<nq(3);i++)sp('sm',x,y,rr(-20,20),rr(-40,0),rr(.5,.9),rr(12,22),'#7a705a')}
 if(hero){const fl=sp('fl',x,y,0,0,.5,140,'#ff1a2a');if(fl){fl.add=1;fl.a=.8}const r=sp('rg',x,y,0,0,.6,160,'#ffd0c0');if(r){r.k=5;r.vr=.55;r.add=1}}}
function dmgFx(f){const el=f.id[0]==='h'?heroBox(+f.id[1]):tEl(f.id);if(!el)return;const[x,y]=f.id[0]==='h'?center(heroBox(+f.id[1]).querySelector('.av')):center(el);
 const src=f.s?tEl('u'+f.s):null;let ax=0,ay=0;if(src){[ax,ay]=center(src)}else if(f.f){ax=innerWidth/2;ay=f.id==='h0'||(+f.id.slice(1)&&findU(G,+f.id.slice(1))?.o===0)?-40:innerHeight+40;if(f.f!=='v'&&f.f!=='m'){ax=ay=0}}
 const hero=f.id[0]==='h';impact(f.f,x,y,ax,ay,f.n,hero);
 const mag=Math.min(hero?16:9,(hero?5:1.5)+f.n*(hero?1.6:1));shake($('#match'),mag,hero?520:340);
 if(hero){bump(el,'heavy');if(!fxLow()){const h=$('#hflash');restartCls(h,'on')}sfx(+f.id[1]===0?'heroHitMe':'heroHit')}else sfx('hit'+(f.f||'n'))}
/* ---------- unit enters the board: ripple across the mat ---------- */
function enterFx(uid){const el=tEl('u'+uid);if(!el)return;const u=findU(G,uid),f=u?C[u.id].f:'n',[x,y]=center(el),r=el.getBoundingClientRect();
 const col={v:'#6affd0',m:'#ffb050',c:'#ff2a3a',n:'#e0d0a0'}[f];for(let i=0;i<nq(3);i++){const g=sp('rg',x,r.bottom-4,0,0,1.1+i*.2,innerWidth*.55,col);if(g){g.k=2.2-i*.5;g.vr=.32;g.a=.55-i*.12;g.dl=i*.12;g.add=1}}
 if(f==='m')for(let i=0;i<nq(14);i++){const a=rr(Math.PI,Math.PI*2),s=rr(120,380),p=sp('sp',x+rr(-r.width/2,r.width/2),r.bottom,Math.cos(a)*s,Math.sin(a)*s,rr(.2,.5),1.4,'#ffd080');if(p){p.add=1;p.g=600}}
 if(f==='c')for(let i=0;i<nq(12);i++){const a=rr(Math.PI*1.1,Math.PI*1.9),s=rr(100,300),p=sp('dr',x+rr(-r.width/2,r.width/2),r.bottom-6,Math.cos(a)*s,Math.sin(a)*s,rr(.4,.8),rr(1.4,3),'#7a0410');if(p){p.g=1000}}
 if(f==='v')for(let i=0;i<nq(10);i++){const p=sp('fl',x+rr(-r.width,r.width),r.bottom+rr(-10,6),0,rr(-30,-8),rr(.6,1.1),rr(8,16),'#4affc0');if(p){p.add=1;p.a=.5}}
 if(BG)BG.rip&&BG.rip.push({x,y:r.bottom,t:performance.now(),f})}
/* ---------- deaths: crack -> shatter into art fragments -> faction dissolve ---------- */
function artImg(id){let im=FX.img[id];if(!im){im=new Image();im.src=realArtS(id);FX.img[id]=im}return im}
function crackLines(r){const cx=r.left+r.width*rr(.35,.65),cy=r.top+r.height*rr(.3,.6),L=[];for(let i=0;i<7;i++){let a=i/7*6.28+rr(-.3,.3),x=cx,y=cy;const l=[x,y];for(let k=0;k<5;k++){a+=rr(-.5,.5);const s=Math.max(r.width,r.height)*rr(.08,.16);x+=Math.cos(a)*s;y+=Math.sin(a)*s;l.push(x,y)}L.push(l)}return{L,cx,cy}}
function deathFx(f){const el=document.querySelector(`.unit.dying[data-u="${f.id.slice(1)}"]`)||tEl(f.id);const id=f.cid||(el&&el.dataset.cid);if(!el||!id)return;
 const d=C[id],fac=d.f,tok=d.r==='T',r=el.getBoundingClientRect();sfx('die'+fac);
 if(fxLow()){el.classList.add('shatter');for(let i=0;i<nq(10);i++)sp('sm',r.left+rr(0,r.width),r.top+rr(0,r.height),0,-20,.8,14,fac==='c'?'#5a0208':'#3a3040');return}
 const{L,cx,cy}=crackLines(r);const ck=sp('ck',0,0,0,0,.34,2.2,fac==='m'?'#9ef8ff':fac==='v'?'#c890ff':'#ff4050');if(ck){ck.pts=L;ck.add=1}
 el.classList.add('cracking');setTimeout(()=>{el.classList.add('shatter');shatter(el,r,id,fac,tok,cx,cy)},150);shake($('#match'),tok?3:6,300)}
function shatter(el,r,id,fac,tok,cx,cy){const im=artImg(id),cols=tok?2:3,rows=tok?2:2,cw=r.width/cols,ch=r.height/rows,ok=im.complete&&im.naturalWidth>0;
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++)for(let t=0;t<2;t++){const c=document.createElement('canvas');c.width=Math.ceil(cw+2);c.height=Math.ceil(ch+2);const x=c.getContext('2d');x.beginPath();
  if(t){x.moveTo(0,0);x.lineTo(cw+2,0);x.lineTo(0,ch+2)}else{x.moveTo(cw+2,0);x.lineTo(cw+2,ch+2);x.lineTo(0,ch+2)}x.closePath();x.clip();
  if(ok){const sw=im.naturalWidth/cols,sh=im.naturalHeight/rows;x.drawImage(im,i*sw,j*sh,sw,sh,0,0,cw+2,ch+2)}else{x.fillStyle={v:'#2a1040',m:'#1a2a2c',c:'#3a0a10',n:'#2a2620'}[fac];x.fill()}
  x.strokeStyle='#000c';x.lineWidth=1.5;x.stroke();x.globalCompositeOperation='source-atop';x.fillStyle='#ffffff10';x.fillRect(0,0,cw,ch*.3);
  const px=r.left+i*cw+cw/2+(t?-cw*.16:cw*.16),py=r.top+j*ch+ch/2+(t?-ch*.16:ch*.16),ang=Math.atan2(py-cy,px-cx),s=rr(90,300)*(tok?.7:1);
  const p=sp('sh',px,py,Math.cos(ang)*s,Math.sin(ang)*s-rr(80,220),rr(.8,1.25),0,'');if(p){p.img=c;p.g=1300;p.vr=rr(-9,9)}}
 const X=r.left+r.width/2,Y=r.top+r.height/2,k=tok?.5:1;
 if(fac==='v'){for(let i=0;i<nq(26*k);i++){const p=sp('dr',X+rr(-r.width/2,r.width/2),Y+rr(-r.height/2,r.height/2),rr(-60,60),rr(-40,80),rr(.7,1.4),rr(2,5),i%3?'#0a0210':'#3a0a5a');if(p){p.g=500}}
  for(let i=0;i<nq(22*k);i++){const p=sp('as',X+rr(-r.width/2,r.width/2),Y+rr(-r.height/2,r.height/2),rr(-20,20),rr(-90,-30),rr(1,1.8),rr(1.5,3),i%2?'#8a8090':'#2a2430');if(p)p.k=rr(0,6)}
  for(let i=0;i<nq(4*k);i++){const p=sp('sm',X+rr(-20,20),Y+rr(-20,20),rr(-15,15),rr(-40,-10),rr(1,1.6),rr(26,40),'#1a0a24');if(p)p.a=.7}}
 else if(fac==='m'){for(let i=0;i<nq(34*k);i++){const a=rr(0,7),s=rr(120,620),p=sp('sp',X,Y,Math.cos(a)*s,Math.sin(a)*s-100,rr(.3,.8),rr(1,2.2),i%3?'#ffc860':'#ffffff');if(p){p.g=800;p.dr=1.5;p.add=1}}
  for(let i=0;i<nq(14*k);i++){const a=rr(0,7),s=rr(60,260),p=sp('as',X,Y,Math.cos(a)*s,Math.sin(a)*s-160,rr(.8,1.3),rr(2,5),'#2a2c2e');if(p){p.g=900;p.k=rr(0,6)}}
  for(let i=0;i<nq(6*k);i++){const p=sp('sm',X+rr(-20,20),Y+rr(-20,20),rr(-20,20),rr(-70,-20),rr(1.2,2),rr(24,44),'#5a5a60');if(p)p.a=.6}const fl=sp('fl',X,Y,0,0,.3,90*k,'#ffd080');if(fl)fl.add=1}
 else if(fac==='c'){for(let i=0;i<nq(40*k);i++){const a=rr(0,7),s=rr(80,520),p=sp('dr',X,Y,Math.cos(a)*s,Math.sin(a)*s-rr(100,260),rr(.6,1.3),rr(1.5,5),i%4?'#6a0410':'#b0101c');if(p){p.g=1200;p.dr=.6}}
  const pl=sp('pl',X,r.bottom-r.height*.12,0,0,3,r.width*.55,'#3a0206');if(pl)pl.a=.85;for(let i=0;i<nq(3*k);i++){const q=sp('pl',X+rr(-r.width*.6,r.width*.6),r.bottom+rr(-16,10),0,0,rr(2,3),rr(6,14),'#4a0208');if(q){q.a=.8;q.dl=rr(.2,.6)}}}
 else for(let i=0;i<nq(16*k);i++)sp('sm',X+rr(-r.width/2,r.width/2),Y+rr(-r.height/2,r.height/2),rr(-15,15),rr(-50,-10),rr(.8,1.4),rr(14,24),'#6a6050')}
/* ---------- blood drop: drip + splatter on damage, pulse on heal ---------- */
function dropFx(h,heal){if(heal){restartCls(h,'refill');clearTimeout(h._r);h._r=setTimeout(()=>h.classList.remove('refill'),900);return}
 const r=h.getBoundingClientRect(),x=r.left+r.width/2,y=r.bottom-r.height*.12;for(let i=0;i<nq(7);i++){const p=sp('dr',x+rr(-3,3),y,rr(-70,70),rr(-120,20),rr(.4,.8),rr(1,2.4),'#a00818');if(p){p.g=1100;p.dl=i*.03}}
 const q=sp('pl',x,y+r.height*.45,0,0,1.1,r.width*.38,'#6a0410');if(q){q.a=.7;q.dl=.25}}
/* ---------- madness escalation ---------- */
const MZ={me:0,op:0,t:null,wn:0};
const WHISP=['it sees you','let go','the stars are wrong','we are hollow','open your eyes','you were never here','feed it','your skin is not yours','it is inside the walls','come down into the dark','sleep','we remember you','there is no ship','listen','it hungers','you already drowned'];
function madSet(){if(!G)return;const a=G.p[0].mad,b=G.p[1].mad;if(a===MZ.me&&b===MZ.op&&MZ.t)return;MZ.me=a;MZ.op=b;const m=$('#match'),bd=document.body;
 m.style.setProperty('--mz',(a/10).toFixed(2));m.style.setProperty('--mo',(b/10).toFixed(2));m.dataset.mz=a;m.dataset.mo=b;bd.classList.toggle('mzhi',a>=7&&cur==='match');
 if(!MZ.t)MZ.t=setInterval(madTick,500);auMood()}
/* v7.1: no strobing. Slow vignette pulses (>=5), brief transform-only glitches only at 7+ (at most one every ~3.5 s), whispers fade over 3 s */
function madTick(){if(BAT.idle||BAT.hid)return;const m=$('#match');if(cur!=='match'||!G||!m.classList.contains('on')){document.body.classList.remove('mzhi');return}if(fxLow())return;const a=MZ.me,b=MZ.op,now=performance.now();
 if(a>=5&&now-(MZ.lp||0)>6000&&Math.random()<a*.012){MZ.lp=now;pulse($('#madv'),'flk',1800)}
 const gap=now-(MZ.lg||0);if(gap>3500&&((a>=7&&(Math.random()<.07||gap>6000))||(b>=7&&Math.random()<.03))){MZ.lg=now;pulse($(a>=7?['#myh','#hint','#endt','#oph'][Math.random()*4|0]:'#oph'),'glitch',260)}
 if((a>=3&&Math.random()<a*.006)||(b>=5&&Math.random()<b*.003))whisper(a>=b||Math.random()<.7?0:1)}
function pulse(el,c,ms){if(!el||el.classList.contains(c))return;el.classList.add(c);setTimeout(()=>el.classList.remove(c),ms)}
function whisper(side){if(MZ.wn>=3)return;MZ.wn++;const w=document.createElement('div');w.className='whisp'+(side?' op':'');w.textContent=WHISP[Math.random()*WHISP.length|0];
 w.style.left=rr(8,62)+'%';w.style.top=(side?rr(14,34):rr(38,76))+'%';w.style.setProperty('--r',rr(-8,8).toFixed(1)+'deg');$('#match').appendChild(w);if(!side)sfx('whisper');setTimeout(()=>{w.remove();MZ.wn--},3200)}
/* ---------- legendary entrance cinematic ---------- */
const CIN={el:null,done:null,skip:null,shown:0};
function lgCinema(id,uid){if(!$('#match').classList.contains('on'))return null;CIN.shown++;const d=C[id],box=$('#cin'),low=fxLow(),full=!low,hq=QL.q==='high',dur=D(full?(hq?1250:1050):650);
 box.className='on f-'+d.f+(low?' low':'');box.querySelector('.cname b').textContent=d.n;box.querySelector('.cname small').textContent='LEGENDARY · '+FAC[d.f].n.toUpperCase();
 const pan=box.querySelector('.cpan');pan.style.backgroundImage=`url(${realArt(id)}),url(${realArtS(id)})`;pan.style.transform='';pan.style.opacity='';const v=pan.querySelector('video');
 pan.classList.remove('vid');const tok=pan._tok=(pan._tok||0)+1;if(full&&hq&&!LG.rm.matches&&!VID.bad[id]){v.src=`${ARTDIR}anim/${id}.mp4?${VIDV}`;v.currentTime=0;vidReady(v,()=>{if(pan._tok===tok)pan.classList.add('vid')});v.play().catch(()=>{})}else{v.removeAttribute('src');v.load()}
 sfx('sting');if(full){setTimeout(()=>{shake(box,5,300);/* v1.9: was document.body, which re-rasterised the whole page */const r=pan.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
  const fl=sp('fl',cx,cy,0,0,.6,Math.max(innerWidth,innerHeight)*.36,{v:'#a050ff',m:'#40e0f0',c:'#ff2030',n:'#ffd070'}[d.f]);if(fl){fl.add=1;fl.a=.5}
  for(let i=0;i<nq(30);i++){const a=rr(0,7),s=rr(220,700),p=sp('sp',cx,cy,Math.cos(a)*s,Math.sin(a)*s,rr(.35,.8),rr(1.5,3),'#fff0d0');if(p){p.add=1;p.dr=2.5}}},D(260))}
 let fin;const p=new Promise(r=>fin=r);let ended=0,tm1,tm2;
 const end=()=>{if(ended)return;ended=1;clearTimeout(tm1);clearTimeout(tm2);const u=tEl('u'+uid),r=pan.getBoundingClientRect();let tr='scale(.2)';
  if(u){const q=u.getBoundingClientRect();tr=`translate(${(q.left+q.width/2-(r.left+r.width/2)).toFixed(0)}px,${(q.top+q.height/2-(r.top+r.height/2)).toFixed(0)}px) scale(${(q.width/r.width).toFixed(3)})`}
  const fly=D(full?340:200);pan.animate([{transform:'none',opacity:1},{transform:`translateY(-2%) scale(1.03)`,opacity:1,offset:.18},{transform:tr,opacity:.85}],{duration:fly,easing:'cubic-bezier(.55,0,.3,1)',fill:'forwards'});box.classList.add('out');
  setTimeout(()=>{box.className='';v.pause();pan.getAnimations().forEach(a=>a.cancel());if(u){bump(u,'land');const[x,y]=center(u);shake($('#match'),4,220);impact(C[id].f,x,y,0,0,3,false);enterFx(uid)}CIN.done=null;UI.cin=null;fin()},fly)};
 CIN.skip=()=>{clearTimeout(tm1);end()};tm1=setTimeout(end,dur-D(full?340:200));CIN.done=p;UI.cin=p;return p}
function cinSkip(){if(UI.cin&&CIN.skip)CIN.skip()}
/* ---------- tilt, parallax, foil ---------- */
const TL={el:null,ox:0,oy:0,raf:0};
function tiltHeld(el,e){if(!el||fxLow())return;const r=el.getBoundingClientRect(),nx=Math.max(-1,Math.min(1,(e.clientX-r.left-r.width/2)/(r.width/2))),ny=Math.max(-1,Math.min(1,(e.clientY-r.top-r.height/2)/(r.height/2)));
 el.style.transform=`perspective(700px) rotateY(${(nx*16).toFixed(1)}deg) rotateX(${(-ny*16).toFixed(1)}deg) translateZ(14px)`;el.style.setProperty('--ox',nx.toFixed(2));el.style.setProperty('--oy',ny.toFixed(2));el.classList.add('held');TL.el=el}
function tiltOff(){const el=TL.el;if(!el)return;el.style.transform='';el.style.removeProperty('--ox');el.style.removeProperty('--oy');el.classList.remove('held');TL.el=null}
/* v7.2 card-view tilt: phone tilt (DeviceOrientation, no permission prompt) or finger drag drives the zoomed card only.
   Transform-only (card rotate, art parallax, glare + foil light layers translate), one rAF loop that runs only while the view is open.
   Axes are remapped by screen orientation so it feels the same in portrait and landscape. (v7 drove a page-wide CSS var from the
   sensor at ~60 Hz, which restyled and repainted every card on screen: removed.) */
const ZTMAX=13;const ZT={c:null,raf:0,tx:0,ty:0,x:0,y:0,base:null,sens:0,fing:0,ev:0};
function scrAngle(){const a=screen.orientation&&typeof screen.orientation.angle==='number'?screen.orientation.angle:(typeof window.orientation==='number'?window.orientation:0);return((a%360)+360)%360}
function orient(e){if(e.gamma==null||e.beta==null)return;ZT.ev++;const a=scrAngle();let x,y;
 if(a===90){x=e.beta;y=-e.gamma}else if(a===270){x=-e.beta;y=e.gamma}else if(a===180){x=-e.gamma;y=-e.beta}else{x=e.gamma;y=e.beta}
 TL.ox=x;TL.oy=y;if(!ZT.c)return;if(!ZT.base||ZT.base.a!==a)ZT.base={x,y,a};const k=v=>Math.max(-1,Math.min(1,v/22));
 ZT.sens=performance.now();if(performance.now()-ZT.fing>600){ZT.tx=k(x-ZT.base.x);ZT.ty=k(y-ZT.base.y)}ztKick()}
function gyroOn(){if(!ZT.gy&&window.DeviceOrientationEvent){addEventListener('deviceorientation',orient,{passive:true});ZT.gy=1}}
function gyroOff(){if(ZT.gy){removeEventListener('deviceorientation',orient);ZT.gy=0}}
function ztOpen(card){gyroOn();ZT.c=card;ZT.base=null;ZT.x=ZT.y=ZT.tx=ZT.ty=0;ZT.sw=0;ZT.t0=0;ZT.fing=ZT.sens=performance.now();ZT.v={ry:0,rx:0,art:''};if(LG.rm.matches)return;card.classList.add('zt');const f=card.querySelector('.foil');if(f&&!f.querySelector('.fsh'))f.insertAdjacentHTML('beforeend','<i class="fsh"></i>');
 const art=card.querySelector('.art');if(art&&!art.querySelector('.ap')){const ap=document.createElement('i');ap.className='ap';ap.style.backgroundImage=art.style.backgroundImage;art.prepend(ap)}
 /* every moving layer is driven by paused Web Animations (composite:'add') whose currentTime the rAF sets: the compositor treats them as
    transform animations (unbounded cull rect), so tilting never re-records paint; inline style.transform from JS re-painted the art,
    the lp layer and the card frame on every frame (tests/tiltprobe.py) */
 const A=ZT.an={},mk=(el,a,b)=>{if(!el)return null;const n=el.animate([{transform:a},{transform:b}],{duration:1000,fill:'both',composite:'add'});n.pause();n.currentTime=500;return n};
 card.style.transform='perspective(900px)';A.ry=mk(card,`rotateY(${-ZTMAX}deg)`,`rotateY(${ZTMAX}deg)`);A.rx=mk(card,`rotateX(${ZTMAX}deg)`,`rotateX(${-ZTMAX}deg)`);
 const pa=card.querySelector('.lg')||card.querySelector('.ap');if(pa){pa.style.transform='scale(1.07)';A.ax=mk(pa,'translate3d(3.2%,0,0)','translate3d(-3.2%,0,0)');A.ay=mk(pa,'translate3d(0,2.4%,0)','translate3d(0,-2.4%,0)')}
 const gl=card.querySelector('.glare');A.gx=mk(gl,'translate3d(-37.6%,0,0)','translate3d(37.6%,0,0)');A.gy=mk(gl,'translate3d(0,-28%,0)','translate3d(0,28%,0)');
 const fs=card.querySelector('.fsh');A.fx=mk(fs,'translate3d(54%,0,0)','translate3d(-54%,0,0)');A.fy=mk(fs,'translate3d(0,30%,0)','translate3d(0,-30%,0)');ztKick()}
function ztClose(){gyroOff();if(ZT.an)for(const k in ZT.an)ZT.an[k]&&ZT.an[k].cancel();ZT.an=null;ZT.c=null;ZT.base=null;if(ZT.raf){cancelAnimationFrame(ZT.raf);ZT.raf=0}}
function ztFinger(nx,ny){if(!ZT.c)return;ZT.fing=performance.now();ZT.tx=nx;ZT.ty=ny;ztKick()}
function ztKick(){if(!ZT.raf&&ZT.c&&!LG.rm.matches)ZT.raf=requestAnimationFrame(ztFrame)}
/* v8 tilt (RENDERING_RULES.md §10): ONE 3D element (the card) rotates, clamped to ±ZTMAX deg; everything inside is flat 2D.
   The light is a pre-rendered oversized gradient (.fsh in the foil, .glare in an overflow-clipped .gw) that only translates.
   There is no CSS sweep on a tilting card: this one rAF value drives both the tilt light and, after 1.2 s without input, a slow
   idle sweep of the same layer, so no keyframe animation and no JS transform ever fight over one element. */
const ztT=(a,v)=>{if(a){const t=Math.round((Math.max(-1,Math.min(1,v))+1)*500);if(a.currentTime!==t)a.currentTime=t}};
function ztFrame(t){ZT.raf=0;const c=ZT.c;if(!c||!c.isConnected){ZT.c=null;return}ZT.x+=(ZT.tx-ZT.x)*.2;ZT.y+=(ZT.ty-ZT.y)*.2;
 const x=Math.max(-1,Math.min(1,ZT.x)),y=Math.max(-1,Math.min(1,ZT.y)),now=t||performance.now(),idle=now-Math.max(ZT.fing,ZT.sens)>1200&&!document.body.classList.contains('q-low');
 if(!ZT.t0)ZT.t0=now;const sw=idle?Math.sin((now-ZT.t0)/9000*Math.PI*2)*.45:0;ZT.sw=(ZT.sw||0)+(sw-(ZT.sw||0))*.05;const w=ZT.sw,A=ZT.an||{};
 ztT(A.ry,x);ztT(A.rx,y);ztT(A.ax,x);ztT(A.ay,y);ztT(A.gx,x*.75+w*.3);ztT(A.gy,y);ztT(A.fx,x*.55-w);ztT(A.fy,y);
 ZT.v={ry:+(x*ZTMAX).toFixed(2),rx:+(-y*ZTMAX).toFixed(2),art:`translate3d(${(-x*3.2).toFixed(2)}%,${(-y*2.4).toFixed(2)}%,0) scale(1.07)`};
 if(Math.abs(ZT.tx-x)+Math.abs(ZT.ty-y)>.002||idle||Math.abs(w)>.002)ZT.raf=requestAnimationFrame(ztFrame)}
/* v9 battery: the deviceorientation listener is attached only while the zoom view is open (gyroOn/gyroOff) */
/* ---------- pack opening ---------- */
function packTearFx(){const el=$('#pwrap'),r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height*.14;shake($('#pstage'),10,500);
 for(let i=0;i<nq(40);i++){const a=rr(0,7),s=rr(150,700),p=sp('sp',x+rr(-r.width/2,r.width/2),y,Math.cos(a)*s,Math.sin(a)*s,rr(.3,.8),rr(1,2.5),i%2?'#e0b0ff':'#ffffff');if(p){p.add=1;p.dr=2;p.g=300}}
 for(let i=0;i<nq(16);i++){const p=sp('as',x+rr(-r.width/2,r.width/2),y+rr(-6,6),rr(-200,200),rr(-420,-120),rr(.8,1.4),rr(3,7),'#3a2a48');if(p){p.g=900;p.k=rr(0,6)}}
 const fl=sp('fl',x,r.top+r.height/2,0,0,.6,r.width*1.4,'#c080ff');if(fl){fl.add=1;fl.a=.8}}
function flipFx(s,rar){const r=s.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,col={C:'#c8c8c8',U:'#4aa8e0',R:'#ffc850',L:'#ff6af0'}[rar]||'#ccc',n={C:6,U:14,R:26,L:60}[rar]||6;
 for(let i=0;i<nq(n);i++){const a=rr(0,7),sp_=rr(80,rar==='L'?900:420),p=sp('sp',x,y,Math.cos(a)*sp_,Math.sin(a)*sp_,rr(.3,.8),rr(1,2.4),i%3?col:'#ffffff');if(p){p.add=1;p.dr=2.2}}
 if(rar!=='C'){const fl=sp('fl',x,y,0,0,.6,r.width*(rar==='L'?3:1.4),col);if(fl){fl.add=1;fl.a=.7}}
 if(rar==='L'){shake($('#pstage'),11,320);const W=innerWidth,H=innerHeight;const nt=QL.q==='high'?6:4;for(let i=0;i<nt;i++){const a=i/nt*6.28,t=sp('te',x,y,0,0,1.1,18,'');if(t){t.x2=x+Math.cos(a)*W*.7;t.y2=y+Math.sin(a)*H*.6;t.k=i;t.dl=i*.03}}
  const f2=sp('fl',x,y,0,0,1.1,Math.max(W,H)*.55,'#6affc0');if(f2){f2.add=1;f2.a=.35;f2.dl=.1}for(let i=0;i<(QL.q==='high'?2:1);i++){const g=sp('rg',x,y,0,0,1+i*.25,Math.max(W,H),'#ff9af0');if(g){g.k=4;g.add=1;g.dl=i*.15}}sfx('sting')}}
/* ---------- living board (drawn on the background canvas, ~22 fps) ---------- */
const LB={drips:[],pools:[],sparks:[],lamps:[[.064,.243],[.31,.083],[.041,.668],[.322,.911],[.674,.911],[.938,.217],[.945,.703],[.718,.052]],t:0};
function livingBoard(x,t,W,H){if(!G||!BG.painted)return;const f=G.p[0].fac,low=fxLow(),land=isLand();BG.rip=BG.rip||[];
 if(f==='v'||f==='n'){for(let i=0;i<(low?1:4);i++){const s=t/1000*.12+i*1.7,cx=W*(.5+.38*Math.sin(s*1.3+i)),cy=H*(.5+.34*Math.cos(s*.9+i*2)),r=Math.min(W,H)*(.22+.06*Math.sin(s*2+i));x.globalCompositeOperation='lighter';x.globalAlpha=.07+.04*Math.sin(t/700+i);x.drawImage(soft(i%2?'#2affc0':'#8a3aff'),cx-r,cy-r*.6,r*2,r*1.2)}
  if(!low&&Math.random()<.04)BG.rip.push({x:rr(.1,.9)*W,y:rr(.15,.85)*H,t,f:'v',amb:1})}
 else if(f==='m'){x.globalCompositeOperation='lighter';for(let i=0;i<LB.lamps.length;i++){let[u,v]=LB.lamps[i];if(!land){const q=u;u=v;v=1-q}const ph=((t/1000+i*2.3)%(5+i%3))/(5+i%3),fl=ph>.9?.45+.55*Math.abs(Math.cos((ph-.9)*10*Math.PI)):1,a=(.18+.14*Math.sin(t/400+i*1.7))*fl*(low?.6:1);
   const r=Math.min(W,H)*.16;x.globalAlpha=a;x.drawImage(soft('#ff9a30'),u*W-r,v*H-r,r*2,r*2);if(!low&&Math.random()<.006)for(let k=0;k<10;k++)LB.sparks.push({x:u*W,y:v*H,vx:rr(-120,120),vy:rr(-160,40),l:rr(.3,.7)})}
  x.fillStyle='#ffd080';for(const s of LB.sparks){s.l-=.045;s.vy+=20;s.x+=s.vx*.045;s.y+=s.vy*.045;x.globalAlpha=Math.max(0,s.l*1.6);x.fillRect(s.x,s.y,1.6,1.6)}LB.sparks=LB.sparks.filter(s=>s.l>0)}
 else if(f==='c'){x.globalCompositeOperation='source-over';if(!low&&LB.drips.length<7&&Math.random()<.05)LB.drips.push({x:rr(.06,.94)*W,y:land?H*.06:H*rr(.02,.08),len:0,sp:rr(6,18),w:rr(1.2,2.6)});
  for(const d of LB.drips){d.len+=d.sp*.045;x.globalAlpha=.75;x.fillStyle='#4a0208';x.fillRect(d.x-d.w/2,d.y,d.w,d.len);x.beginPath();x.arc(d.x,d.y+d.len,d.w*1.1,0,7);x.fill();if(d.len>H*.12&&Math.random()<.02){LB.pools.push({x:d.x,y:d.y+d.len,r:2,m:rr(10,26),a:.7});d.len=-1}}LB.drips=LB.drips.filter(d=>d.len>=0);
  if(!low&&Math.random()<.01)LB.pools.push({x:rr(.15,.85)*W,y:rr(.25,.75)*H,r:2,m:rr(14,34),a:.55});
  for(const p of LB.pools){p.r+=(p.m-p.r)*.02;p.a-=.0018;x.globalAlpha=Math.max(0,p.a);x.fillStyle='#3a0206';x.beginPath();ell(x,p.x,p.y,p.r,p.r*.45,0,0,7);x.fill()}LB.pools=LB.pools.filter(p=>p.a>0);
  const hb=.5+.5*Math.pow(Math.max(0,Math.sin(t/1000*Math.PI*1.1)),12);x.globalCompositeOperation='lighter';x.globalAlpha=.07*hb;const r=Math.min(W,H)*.45;x.drawImage(soft('#ff1020'),W/2-r,H/2-r,r*2,r*2)}
 x.globalCompositeOperation='lighter';for(const p of BG.rip){const a=(t-p.t)/(p.amb?2600:1500);if(a>1){p.dead=1;continue}const col={v:'#6affd0',m:'#ffb050',c:'#ff2a3a',n:'#e0d0a0'}[p.f]||'#fff';x.globalAlpha=(1-a)*(p.amb?.12:.35);x.strokeStyle=col;x.lineWidth=p.amb?1:2;
  for(let k=0;k<(p.amb?2:3);k++){const rr_=(a*(p.amb?.25:.7)*W)*(1-k*.18);if(rr_<=0)continue;x.beginPath();ell(x,p.x,p.y,rr_,rr_*.4,0,0,7);x.stroke()}}BG.rip=BG.rip.filter(p=>!p.dead);x.globalCompositeOperation='source-over';x.globalAlpha=1}
/* ---------- settings ---------- */
function setFx(low){setQuality(low?'low':'auto')}
function settingsOpen(){{const sp=$('#sSpd');if(sp){const v=String(UI.speed);sp.value=[...sp.options].some(o=>o.value===v)?v:'1'}}$('#sVol').value=Math.round(AU.vol*100);$('#sQ').value=QL.pref;$('#sMute').checked=AU.mute;qApply();$('#settings').classList.add('on')}
fxInit();qApply();QL.rm.addEventListener&&QL.rm.addEventListener('change',()=>setQuality(QL.pref));
$('#bSet').onclick=()=>{sfx('click');settingsOpen()};$('#mset').onclick=()=>{sfx('click');settingsOpen()};$('#sClose').onclick=()=>{sfx('click');$('#settings').classList.remove('on')};
$('#settings').addEventListener('click',e=>{if(e.target.id==='settings')$('#settings').classList.remove('on')});
$('#sVol').addEventListener('input',e=>{auInit();AU.vol=+e.target.value/100;localStorage.setItem('hsVol',AU.vol.toFixed(2));auVol()});
$('#sQ').addEventListener('change',e=>{sfx('click');setQuality(e.target.value)});$('#sSpd').addEventListener('change',e=>{sfx('click');UI.speed=+e.target.value||1;try{localStorage.setItem('hsSpd',String(UI.speed))}catch(x){}});$('#sMute').addEventListener('change',e=>{auInit();AU.mute=e.target.checked;localStorage.setItem('hsMute',AU.mute?'1':'0');updMute()});
$('#cin').addEventListener('pointerdown',e=>{e.stopPropagation();cinSkip()},true);
Object.assign(window.__hs,{gyroOn,gyroOff,qKick,ZTMAX,sfx,SFX,auVol,vidReady,ZT,ztOpen,ztClose,ztFinger,scrAngle,FX,FXQ,QL,qv,setQuality,qApply,fxLow,setFx,MZ,madSet,whisper,lgCinema,CIN,cinSkip,impact,deathFx,dropFx,tiltHeld,tiltOff,TL,orient,LB,AU,shake});
/* v7.3 keyword tooltip: tap/hover a keyword icon on a unit (long-press still opens the full card) */
(function(){const tip=$('#kwtip');let tt=0;function show(sv){const k=sv.dataset.k||sv.dataset.kw;if(!k||!KW[k])return;tip.innerHTML=`<b>${KW[k][0]}</b> · ${KW[k][1]}`;const r=sv.getBoundingClientRect();
  tip.style.left=Math.max(118,Math.min(innerWidth-118,r.left+r.width/2))+'px';tip.style.top=Math.max(40,r.top)+'px';tip.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>tip.classList.remove('on'),1800)}
 const SEL='.kws svg[data-k],#zoom [data-kw],.how [data-kw],#cdx [data-kw],.kwl [data-k]';window.__kwShow=show;
 document.addEventListener('pointerdown',e=>{const sv=e.target.closest&&e.target.closest(SEL);if(sv)show(sv);else tip.classList.remove('on')},true);
 document.addEventListener('pointerover',e=>{if(e.pointerType!=='mouse')return;const sv=e.target.closest&&e.target.closest(SEL);if(sv)show(sv)})})();
function ell(x,a,b,rx,ry,r,s,e){x.ellipse(a,b,rx>.01?rx:.01,ry>.01?ry:.01,r,s,e)}

'use strict';
/* ================= v2.4 CARD CHARACTER =================
   Faction frames, rarity trims, print grain and chipped corners are static (art/ui/cf_*.webp + css/v24.css): no runtime cost.
   This file only makes the small textures that css/v24.css tiles: a drifting-particle strip per faction (bubbles, sparks,
   ash, dust) and the print grain. Each is drawn once into a canvas at start-up. Particles drift only where a card is shown
   large (zoom, hand, pack reveal, dragged card); everywhere else the strip is a still image or hidden. Holographic foils
   are a variant (VARS in js/07-progress.js); here they get their pack-reveal flare. */

/* one vertical tile per faction; it wraps top to bottom, so translating it by half its height loops seamlessly */
function ptTile(f){const W=96,H=192,cv=mkc(W,H),x=cv.getContext('2d'),R=rng(hash('pt'+f));
 const at=(y,fn)=>{fn(y);if(y<14)fn(y+H);if(y>H-14)fn(y-H)};
 if(f==='v')for(let i=0;i<9;i++){const px=R()*W,py=R()*H,r=1.2+R()*2.6;at(py,y=>{x.strokeStyle=`rgba(150,240,225,${.35+R()*.25})`;x.lineWidth=.8;x.beginPath();x.arc(px,y,r,0,7);x.stroke();x.fillStyle='rgba(230,255,250,.5)';x.beginPath();x.arc(px-r*.35,y-r*.35,r*.28,0,7);x.fill()})}
 else if(f==='m')for(let i=0;i<10;i++){const px=R()*W,py=R()*H,l=1+R()*3,hot=R()<.4;at(py,y=>{x.strokeStyle=hot?'rgba(255,240,190,.85)':'rgba(255,150,50,.7)';x.lineWidth=hot?1:.8;x.beginPath();x.moveTo(px,y);x.lineTo(px+(R()-.5)*1.5,y+l);x.stroke()})}
 else if(f==='c')for(let i=0;i<11;i++){const px=R()*W,py=R()*H,s=.8+R()*1.8,em=R()<.22;at(py,y=>{x.fillStyle=em?'rgba(255,90,40,.75)':`rgba(${150+R()*40|0},${140+R()*30|0},${130+R()*30|0},.45)`;x.save();x.translate(px,y);x.rotate(R()*3);x.fillRect(-s,-s*.5,s*2,s);x.restore()})}
 else for(let i=0;i<12;i++){const px=R()*W,py=R()*H,r=.5+R()*1.1;at(py,y=>{const g=x.createRadialGradient(px,y,0,px,y,r*2.2);g.addColorStop(0,'rgba(240,226,190,.55)');g.addColorStop(1,'rgba(240,226,190,0)');x.fillStyle=g;x.fillRect(px-r*2.2,y-r*2.2,r*4.4,r*4.4)})}
 return cv.toDataURL()}
/* print grain: fine paper fibre, very low contrast */
function printGrain(){const S=96,cv=mkc(S,S),x=cv.getContext('2d'),id=x.createImageData(S,S),R=rng(4242);
 for(let i=0;i<id.data.length;i+=4){const v=R()<.5?0:255;id.data[i]=id.data[i+1]=id.data[i+2]=v;id.data[i+3]=R()*16|0}x.putImageData(id,0,0);
 x.strokeStyle='rgba(255,250,235,.035)';x.lineWidth=.6;for(let i=0;i<40;i++){const a=R()*S,b=R()*S;x.beginPath();x.moveTo(a,b);x.lineTo(a+(R()-.5)*14,b+(R()-.5)*6);x.stroke()}
 return cv.toDataURL()}
{const rs=document.documentElement.style;for(const f of'vmcn')rs.setProperty('--pt-'+f,`url(${ptTile(f)})`);rs.setProperty('--grain-p',`url(${printGrain()})`)}

/* a holographic pull gets its own flare on the flip: the sigils flash, a chime, and a prismatic burst */
{const f0=flip;flip=function(s){const was=s&&s.classList.contains('up');const r=f0.apply(this,arguments);try{const o=!was&&s&&PO.res&&PO.res[+s.dataset.i];
  if(o&&o.vr==='holo'){const st=$('#pstage');restartCls(st,'vrare');setTimeout(()=>sfx('voidRare'),260);hap('hitBig');s.classList.add('holo-pull');setTimeout(()=>st.classList.remove('vrare'),1600);
   if(!fxLow()){const q=s.getBoundingClientRect(),x=q.left+q.width/2,y=q.top+q.height/2;for(let i=0;i<nq(36);i++){const a=rr(0,7),v=rr(90,520),p=sp('sp',x,y,Math.cos(a)*v,Math.sin(a)*v,rr(.4,.9),rr(1,2.2),['#ffb0e0','#b0f0ff','#fff0b0','#c8b0ff'][i%4]);if(p){p.add=1;p.dr=2}}}}}catch(e){}return r}}

Object.assign(window.__hs,{ptTile});

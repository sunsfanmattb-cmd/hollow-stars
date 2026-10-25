'use strict';
/* ================= ART ================= */
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return h>>>0}
function rng(seed){return()=>{seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const PAL={v:{b:'#040207',c:['#3a1260','#8a44c0','#1a0834','#9a4cc8'],g:'#d8b8f0',s:'#0a0412',m:'#33184e',a:'#4affc0'},
 m:{b:'#020405',c:['#123038','#3a2416','#3a8890','#b0581a'],g:'#a8e0dc',s:'#040708',m:'#162024',a:'#ff8a26'},
 c:{b:'#060102',c:['#4a0510','#7a0c1c','#200306','#a8301a'],g:'#f0a890',s:'#0c0203',m:'#300810',a:'#c8f050'},
 n:{b:'#030405',c:['#222c36','#4a3e2a','#141a20','#5a7088'],g:'#e0d0a8',s:'#07080a',m:'#1e2328',a:'#ffb04a'}};
const hexA=(h,a)=>{const n=parseInt(h.slice(1),16);return`rgba(${n>>16},${n>>8&255},${n&255},${a})`};
const TAU=Math.PI*2;
function glow(x,cx,cy,r,col,a){if(r<=0)return;const g=x.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,hexA(col,a));g.addColorStop(1,hexA(col,0));x.save();x.globalCompositeOperation='lighter';x.fillStyle=g;x.fillRect(cx-r,cy-r,r*2,r*2);x.restore()}
function stars(x,W,H,R,n,a=.8){for(let i=0;i<n;i++){x.fillStyle=`rgba(255,250,240,${R()*R()*a})`;const s=R()<.94?.8:1.7;x.fillRect(R()*W,R()*H,s,s)}}
function nebula(x,W,H,R,P,n=6,a=.3){for(let i=0;i<n;i++){const cx=R()*W,cy=R()*H,r=(.3+R()*.6)*Math.max(W,H);glow(x,cx,cy,r,P.c[i%4],a*(.5+R()*.6))}stars(x,W,H,R,W*H/320)}
function blob(x,pts){x.beginPath();pts.forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b));x.closePath()}
function jag(cx,cy,r,n,R,k=.45){const p=[];for(let i=0;i<n;i++){const a=i/n*TAU,rr=r*(1-k+R()*k*1.6);p.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.7])}return p}
function rim(x,col,w=1.2,a=.8){x.save();x.strokeStyle=hexA(col,a);x.lineWidth=w;x.globalCompositeOperation='lighter';x.stroke();x.restore()}
function eyeAt(x,cx,cy,rw,rh,P,R,lx=0,ly=0,open=1){glow(x,cx,cy,rw*1.6,P.c[3],.35);rh*=open;if(rh<1){x.strokeStyle=hexA(P.g,.7);x.lineWidth=2;x.beginPath();x.moveTo(cx-rw,cy);x.quadraticCurveTo(cx,cy+rw*.15,cx+rw,cy);x.stroke();return}
 x.save();x.beginPath();x.moveTo(cx-rw,cy);x.quadraticCurveTo(cx,cy-rh*2,cx+rw,cy);x.quadraticCurveTo(cx,cy+rh*2,cx-rw,cy);x.closePath();
 const sg=x.createRadialGradient(cx,cy,0,cx,cy,rw);sg.addColorStop(0,'#e8dccb');sg.addColorStop(.55,'#b89a8a');sg.addColorStop(1,'#3a0812');x.fillStyle=sg;x.fill();x.clip();
 x.strokeStyle='rgba(120,6,20,.6)';x.lineWidth=Math.max(.6,rw*.012);for(let i=0;i<18;i++){const a=R()*TAU;let px=cx+Math.cos(a)*rw,py=cy+Math.sin(a)*rh*1.2;x.beginPath();x.moveTo(px,py);for(let j=0;j<5;j++){px+=(cx-px)*.2+(R()-.5)*rw*.08;py+=(cy-py)*.2+(R()-.5)*rw*.06;x.lineTo(px,py)}x.stroke()}
 const ir=rh*1.05,ix=cx+lx*rw*.35,iy=cy+ly*rh*.3;const ig=x.createRadialGradient(ix,iy,ir*.1,ix,iy,ir);ig.addColorStop(0,P.a);ig.addColorStop(.3,P.c[3]);ig.addColorStop(.75,P.c[0]);ig.addColorStop(1,'#000');x.fillStyle=ig;x.beginPath();x.arc(ix,iy,ir,0,7);x.fill();
 x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=Math.max(.5,ir*.03);for(let i=0;i<40;i++){const a=i/40*TAU+R()*.1;x.beginPath();x.moveTo(ix+Math.cos(a)*ir*.3,iy+Math.sin(a)*ir*.3);x.lineTo(ix+Math.cos(a)*ir*.95,iy+Math.sin(a)*ir*.95);x.stroke()}
 x.fillStyle='#000';x.beginPath();x.ellipse(ix,iy,ir*.17,ir*.82,0,0,7);x.fill();glow(x,ix,iy,ir*.5,P.a,.18);
 x.fillStyle='rgba(255,255,255,.8)';x.beginPath();x.arc(ix-ir*.38,iy-ir*.42,ir*.12,0,7);x.fill();
 const sh=x.createLinearGradient(0,cy-rh*1.2,0,cy);sh.addColorStop(0,'rgba(0,0,0,.75)');sh.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=sh;x.fillRect(cx-rw,cy-rh*1.4,rw*2,rh*1.4);x.restore();
 x.strokeStyle='rgba(6,0,6,.95)';x.lineWidth=Math.max(2,rw*.06);x.beginPath();x.moveTo(cx-rw,cy);x.quadraticCurveTo(cx,cy-rh*2,cx+rw,cy);x.quadraticCurveTo(cx,cy+rh*2,cx-rw,cy);x.stroke()}
function tentacle(x,x0,y0,len,ang,w,P,R,N=70,suck=1){let px=x0,py=y0,a=ang;const ph=R()*6,fr=3+R()*4,am=.05+R()*.07,curl=(R()-.5)*.09;const pts=[];
 for(let i=0;i<=N;i++){const t=i/N;a+=Math.sin(t*fr+ph)*am+curl*t*t*3;px+=Math.cos(a)*len/N;py+=Math.sin(a)*len/N;pts.push([px,py,w*(1-t*.94)])}
 for(const[qx,qy,r]of pts){const g=x.createRadialGradient(qx-r*.4,qy-r*.4,r*.1,qx,qy,r);g.addColorStop(0,P.c[1]);g.addColorStop(.55,P.m);g.addColorStop(1,P.s);x.fillStyle=g;x.beginPath();x.arc(qx,qy,r,0,7);x.fill()}
 if(suck)for(let i=4;i<N-4;i+=3){const[qx,qy,r]=pts[i];x.fillStyle=hexA(P.g,.32);x.beginPath();x.arc(qx+r*.45,qy+r*.2,r*.28,0,7);x.fill();x.fillStyle='rgba(0,0,0,.5)';x.beginPath();x.arc(qx+r*.45,qy+r*.2,r*.12,0,7);x.fill()}
 x.strokeStyle='rgba(0,0,0,.32)';x.lineWidth=.7;for(let i=2;i<N-2;i+=2){const[qx,qy,r]=pts[i],[nx,ny]=pts[i+1],a=Math.atan2(ny-qy,nx-qx)+Math.PI/2;x.beginPath();x.moveTo(qx+Math.cos(a)*r*.9,qy+Math.sin(a)*r*.9);x.quadraticCurveTo(qx+Math.cos(a-1.57)*r*.3,qy+Math.sin(a-1.57)*r*.3,qx-Math.cos(a)*r*.9,qy-Math.sin(a)*r*.9);x.stroke()}
 x.save();x.globalCompositeOperation='lighter';for(let i=2;i<N;i+=2){const[qx,qy,r]=pts[i];x.fillStyle=hexA(P.a,.05);x.beginPath();x.arc(qx-r*.6,qy-r*.5,r*.35,0,7);x.fill();if(i%6===0&&r>2){x.fillStyle='rgba(255,255,255,.22)';x.beginPath();x.ellipse(qx-r*.45,qy-r*.5,r*.22,r*.08,-.6,0,7);x.fill()}}x.restore();return pts}
function teeth(x,cx,cy,r,n,col='#d8ccb4'){for(let i=0;i<n;i++){const a=i/n*TAU,a2=a+Math.PI/n;x.fillStyle=col;x.strokeStyle='rgba(40,0,0,.7)';x.lineWidth=.6;x.beginPath();x.moveTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);x.lineTo(cx+Math.cos(a2)*r*.6,cy+Math.sin(a2)*r*.6);x.lineTo(cx+Math.cos(a+TAU/n)*r,cy+Math.sin(a+TAU/n)*r);x.closePath();x.fill();x.stroke()}}
function hooded(x,cx,by,s,P,R,eyes=1){const g=x.createLinearGradient(0,by-s*1.6,0,by);g.addColorStop(0,'#16080a');g.addColorStop(1,'#000');x.fillStyle=g;x.beginPath();x.moveTo(cx,by-s*1.6);x.bezierCurveTo(cx+s*.45,by-s*1.55,cx+s*.4,by-s*.9,cx+s*.75,by);x.lineTo(cx-s*.75,by);x.bezierCurveTo(cx-s*.4,by-s*.9,cx-s*.45,by-s*1.55,cx,by-s*1.6);x.fill();rim(x,P.c[3],1,.5);
 if(eyes){x.fillStyle='#000';x.beginPath();x.ellipse(cx,by-s*1.18,s*.16,s*.22,0,0,7);x.fill();for(const k of[-1,1])glow(x,cx+k*s*.06,by-s*1.22,s*.09,P.a,.9)}}
function metal(x,x0,y0,w,h,R,dark=0){const g=x.createLinearGradient(0,y0,0,y0+h);g.addColorStop(0,dark?'#2a3034':'#6a7478');g.addColorStop(.5,dark?'#14181a':'#2a3034');g.addColorStop(1,'#050607');x.fillStyle=g;x.fillRect(x0,y0,w,h);for(let i=0;i<w*h/60;i++){x.fillStyle=R()<.5?`rgba(0,0,0,${R()*.3})`:`rgba(150,90,40,${R()*.18})`;x.fillRect(x0+R()*w,y0+R()*h,1+R()*4,1+R()*2)}}
function drone(x,cx,cy,r,P,R,lc){for(let i=0;i<4;i++){const a=i/4*TAU+R()*.4+.4,ex=cx+Math.cos(a)*r*2.1,ey=cy+Math.sin(a)*r*1.5;x.strokeStyle='#1a2226';x.lineWidth=r*.28;x.beginPath();x.moveTo(cx,cy);x.lineTo(ex,ey);x.stroke();x.strokeStyle='#4a5a60';x.lineWidth=r*.07;x.stroke();x.fillStyle='#10171a';x.fillRect(ex-r*.3,ey-r*.15,r*.6,r*.3);glow(x,ex,ey,r*.4,P.a,.5)}
 const g=x.createRadialGradient(cx-r*.4,cy-r*.4,r*.1,cx,cy,r);g.addColorStop(0,'#8a9ca2');g.addColorStop(.5,'#2a363a');g.addColorStop(1,'#040607');x.fillStyle=g;x.beginPath();x.arc(cx,cy,r,0,7);x.fill();
 x.strokeStyle='rgba(120,70,30,.5)';x.lineWidth=r*.05;for(let i=0;i<5;i++){x.beginPath();x.arc(cx,cy,r*(.45+i*.12),R()*6,R()*6+2);x.stroke()}
 lc=lc||(R()<.6?'#ff2a20':P.c[2]);x.fillStyle='#000';x.beginPath();x.arc(cx,cy,r*.4,0,7);x.fill();glow(x,cx,cy,r*1.2,lc,.55);x.fillStyle=lc;x.beginPath();x.arc(cx,cy,r*.16,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(cx-r*.06,cy-r*.07,r*.05,0,7);x.fill()}
const SCENE={
 void(x,W,H,R,P){nebula(x,W,H,R,P,7,.28);const gx=R()*W,gy=R()*H*.6;for(let i=0;i<3;i++){x.save();x.translate(gx,gy);x.rotate(R()*3);x.scale(1,.35);glow(x,0,0,W*(.08+i*.06),P.g,.18);x.restore()}},
 debris(x,W,H,R,P){SCENE.void(x,W,H,R,P);for(let i=0;i<6;i++){const cx=R()*W,cy=R()*H,r=W*(.04+R()*.14);blob(x,jag(cx,cy,r,9,R,.6));x.fillStyle='#030304';x.fill();rim(x,P.c[3],1,.6);for(let j=0;j<3;j++){x.fillStyle=hexA(P.a,.7);x.fillRect(cx+(R()-.5)*r,cy+(R()-.5)*r*.4,1.5,1)}}},
 hull(x,W,H,R,P){x.fillStyle='#020303';x.fillRect(0,0,W,H);const vx=W*(.35+R()*.3),vy=H*(.4+R()*.15);glow(x,vx,vy,W*.35,P.c[0],.5);
  const nR=5+Math.floor(R()*6),rr=R()<.5?.25:.06,sq=.9+R()*.6;for(let i=nR-1;i>=0;i--){const k=.12+i*(.95/nR),w=W*k*1.3*sq,h=H*k*1.25;x.strokeStyle=`rgba(${60+i*8},${66+i*6},${70+i*5},${.9-i*.06})`;x.lineWidth=2+i*.9;x.beginPath();x.roundRect?x.roundRect(vx-w/2,vy-h/2,w,h,w*rr):x.rect(vx-w/2,vy-h/2,w,h);x.stroke();
   if(R()<.5){const lx=vx+(R()<.5?-w/2:w/2),ly=vy+(R()-.5)*h*.6,c=R()<.75?P.a:'#ff2a1a';glow(x,lx,ly,6+i*2,c,.7)}}
  x.strokeStyle='rgba(80,90,90,.25)';x.lineWidth=1;for(let i=-8;i<=8;i++){x.beginPath();x.moveTo(vx,vy);x.lineTo(vx+i*W*.12,H*1.3);x.stroke()}
  glow(x,vx,vy,W*.08,P.g,.25);for(let i=0;i<3;i++){const py=R()*H;x.fillStyle='#0a0c0c';x.fillRect(0,py,W,3+R()*5);x.fillStyle='rgba(120,130,130,.15)';x.fillRect(0,py,W,1)}for(let i=0;i<5;i++){x.strokeStyle='rgba(10,10,10,.9)';x.lineWidth=1.5;x.beginPath();const sx=R()*W;x.moveTo(sx,0);x.quadraticCurveTo(sx+(R()-.5)*40,H*.3,sx+(R()-.5)*60,H*(.2+R()*.4));x.stroke()}},
 planet(x,W,H,R,P){SCENE.void(x,W,H,R,P);const r=W*(.9+R()*.6),cx=W*(.2+R()*.6),cy=H+r*(.62+R()*.15);glow(x,cx,cy-r,W*.6,P.c[3],.3);const g=x.createRadialGradient(cx-r*.2,cy-r*1.1,r*.1,cx,cy,r);g.addColorStop(0,P.c[1]);g.addColorStop(.7,P.s);g.addColorStop(1,'#000');x.fillStyle=g;x.beginPath();x.arc(cx,cy,r,0,7);x.fill();rim(x,P.g,2,.55);
  x.save();x.beginPath();x.arc(cx,cy,r,0,7);x.clip();x.strokeStyle='rgba(0,0,0,.35)';for(let i=0;i<10;i++){x.lineWidth=2+R()*6;x.beginPath();x.ellipse(cx,cy-r+R()*r*.4,r*1.1,r*.06+R()*8,0,0,7);x.stroke()}for(let i=0;i<14;i++)glow(x,cx+(R()-.5)*r,cy-r+R()*r*.25,2+R()*3,P.a,.6);x.restore()},
 altar(x,W,H,R,P){x.fillStyle='#030101';x.fillRect(0,0,W,H);glow(x,W/2,H*.35,W*.6,P.c[0],.55);const cx=W/2,cy=H*.33;x.save();x.globalCompositeOperation='lighter';x.strokeStyle=hexA(P.c[3],.35);x.lineWidth=1;for(const k of[1,.8,.55]){x.beginPath();x.arc(cx,cy,H*.3*k,0,7);x.stroke()}for(let i=0;i<7;i++){const a=i/7*TAU-Math.PI/2,b=(i+3)/7*TAU-Math.PI/2;x.beginPath();x.moveTo(cx+Math.cos(a)*H*.24,cy+Math.sin(a)*H*.24);x.lineTo(cx+Math.cos(b)*H*.24,cy+Math.sin(b)*H*.24);x.stroke()}x.restore();
  for(let i=0;i<4;i++){const y=H*(.7+i*.08),w=W*(.5+i*.16);const g=x.createLinearGradient(0,y,0,y+H*.08);g.addColorStop(0,'#2a1c1a');g.addColorStop(1,'#080404');x.fillStyle=g;x.fillRect(cx-w/2,y,w,H*.085);x.fillStyle='rgba(90,0,10,.5)';x.fillRect(cx-w/2+R()*w*.6,y,8+R()*20,2+R()*6)}
  for(let i=0;i<7;i++){const fx=W*(.05+R()*.9),fy=H*(.62+R()*.32);x.fillStyle='#c8b894';x.fillRect(fx-1.2,fy-7,2.4,7);glow(x,fx,fy-9,12,'#ff9a30',.6);x.fillStyle='#ffe0a0';x.beginPath();x.ellipse(fx,fy-9,1.2,2.5,0,0,7);x.fill()}
  for(const s of[-1,1]){x.fillStyle='#120405';x.fillRect(cx+s*W*.42-8,0,16,H*.7);x.fillStyle='#3a0610';x.beginPath();x.moveTo(cx+s*W*.36-10,0);x.lineTo(cx+s*W*.36+10,0);x.lineTo(cx+s*W*.36+10,H*.45);x.lineTo(cx+s*W*.36,H*.5);x.lineTo(cx+s*W*.36-10,H*.45);x.fill()}},
 flesh(x,W,H,R,P){x.fillStyle='#050102';x.fillRect(0,0,W,H);glow(x,W*(.3+R()*.4),H*.45,W*.5,P.c[1],.35);for(let i=0;i<34;i++){const e=R()<.5,bx=e?(R()<.5?R()*W*.25:W-R()*W*.25):R()*W,by=e?R()*H:(R()<.5?R()*H*.2:H-R()*H*.2),r=H*(.08+R()*.18);const g=x.createRadialGradient(bx-r*.3,by-r*.4,r*.1,bx,by,r);g.addColorStop(0,'#6a1a20');g.addColorStop(.6,P.m);g.addColorStop(1,'#050102');x.fillStyle=g;x.beginPath();x.arc(bx,by,r,0,7);x.fill();x.fillStyle='rgba(255,220,200,.12)';x.beginPath();x.arc(bx-r*.35,by-r*.4,r*.15,0,7);x.fill()}
  x.strokeStyle='rgba(120,10,30,.45)';x.lineWidth=1;for(let i=0;i<16;i++){x.beginPath();let px=R()*W,py=R()*H;x.moveTo(px,py);for(let j=0;j<5;j++){px+=(R()-.5)*30;py+=(R()-.5)*24;x.lineTo(px,py)}x.stroke()}}
};
const PAINT={
 eye(x,W,H,R,P){for(let i=0;i<4;i++)tentacle(x,R()*W,H+5,H*.7,-1.57+(R()-.5)*1.3,7,P,R,45);eyeAt(x,W/2+(R()-.5)*24,H*.48,W*(.24+R()*.06),H*(.12+R()*.04),P,R,(R()-.5)*1.4,(R()-.5))},
 bigeye(x,W,H,R,P){for(let i=0;i<10;i++){const a=i/10*TAU;tentacle(x,W/2+Math.cos(a)*W*.42,H/2+Math.sin(a)*H*.42,W*.25,a+Math.PI+(R()-.5)*.8,6,P,R,40,0)}eyeAt(x,W/2,H/2,W*.42,H*.21,P,R,(R()-.5),(R()-.5)*.5)},
 eyes(x,W,H,R,P){const n=6+Math.floor(R()*5);for(let i=0;i<n;i++)eyeAt(x,W*(.15+R()*.7),H*(.2+R()*.65),W*(.04+R()*.07),H*(.02+R()*.03),P,R,(R()-.5)*2,(R()-.5))},
 spawn(x,W,H,R,P){const cx=W*(.4+R()*.2),cy=H*(.42+R()*.15);for(let i=0;i<8;i++){const a=i/8*TAU+R()*.5;tentacle(x,cx,cy,H*(.35+R()*.3),a,6,P,R,40)}const g=x.createRadialGradient(cx-8,cy-8,2,cx,cy,H*.17);g.addColorStop(0,P.c[1]);g.addColorStop(1,P.s);x.fillStyle=g;blob(x,jag(cx,cy,H*.17,14,R,.25));x.fill();rim(x,P.a,1,.4);eyeAt(x,cx,cy,H*.08,H*.035,P,R)},
 tent(x,W,H,R,P){glow(x,W/2,H*.4,W*.5,P.c[3],.2);const n=4+Math.floor(R()*3);for(let i=0;i<n;i++)tentacle(x,W*(.1+.8*R()),H+8,H*(.85+R()*.4),-1.57+(R()-.5)*1.3,8+R()*7,P,R);if(R()<.5)eyeAt(x,W*(.3+R()*.4),H*(.25+R()*.2),W*.08,H*.04,P,R)},
 leech(x,W,H,R,P){const pts=tentacle(x,-10,H*(.7+R()*.3),W*.95,-.45-R()*.3,H*.14,P,R,70,1);const[hx,hy]=pts[pts.length-1];const r=H*.16;const g=x.createRadialGradient(hx,hy,r*.2,hx,hy,r);g.addColorStop(0,'#000');g.addColorStop(.6,'#3a0818');g.addColorStop(1,P.m);x.fillStyle=g;x.beginPath();x.arc(hx,hy,r,0,7);x.fill();teeth(x,hx,hy,r*.95,16);teeth(x,hx,hy,r*.62,11,'#b0a088');glow(x,hx,hy,r*.35,'#ff2040',.4)},
 leviathan(x,W,H,R,P){const cy=H*(.38+R()*.12);x.fillStyle='#020104';x.beginPath();x.moveTo(-20,cy+H*.1);x.bezierCurveTo(W*.2,cy-H*.35,W*.8,cy-H*.3,W+30,cy+H*.02);x.bezierCurveTo(W*.8,cy+H*.3,W*.3,cy+H*.32,-20,cy+H*.1);x.fill();rim(x,P.g,1.5,.45);
  for(let i=0;i<11;i++){const t=i/10,ex=W*(.1+t*.8),ey=cy+Math.sin(t*3)*H*.03-H*.02;glow(x,ex,ey,4,P.a,.8);x.fillStyle=hexA(P.a,.9);x.fillRect(ex-1,ey-.6,2,1.2)}for(let i=0;i<9;i++)tentacle(x,W*(.08+R()*.85),cy+H*.12,H*.5,1.57+(R()-.5)*.6,5,P,R,40,0)},
 star(x,W,H,R,P){const cx=W/2+(R()-.5)*30,cy=H*.47,r=H*(.2+R()*.07);glow(x,cx,cy,r*3.2,P.c[3],.45);glow(x,cx,cy,r*1.9,P.g,.5);x.save();x.globalCompositeOperation='lighter';for(let i=0;i<60;i++){const a=R()*TAU,l=r*(1.2+R()*2.2);x.strokeStyle=hexA(P.g,.06+R()*.16);x.lineWidth=.5+R()*1.5;x.beginPath();x.moveTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);x.lineTo(cx+Math.cos(a)*l,cy+Math.sin(a)*l);x.stroke()}x.restore();
  x.strokeStyle=hexA(P.c[3],.8);x.lineWidth=2.5;x.beginPath();x.ellipse(cx,cy,r*2.2,r*.42,-.25,Math.PI,TAU);x.stroke();x.fillStyle='#000';x.beginPath();x.arc(cx,cy,r,0,7);x.fill();x.strokeStyle=hexA(P.g,.9);x.lineWidth=1.5;x.stroke();x.strokeStyle=hexA(P.c[3],.8);x.lineWidth=2.5;x.beginPath();x.ellipse(cx,cy,r*2.2,r*.42,-.25,0,Math.PI);x.stroke();if(R()<.6)eyeAt(x,cx,cy,r*.7,r*.25,P,R)},
 crowd(x,W,H,R,P){const n=5+Math.floor(R()*3);for(let i=0;i<n;i++){const t=(i+.5)/n;hooded(x,W*t+(R()-.5)*8,H*(1.02-Math.abs(t-.5)*.12),H*(.2+R()*.05),P,R,0)}},
 mouths(x,W,H,R,P){for(let i=0;i<9;i++){const cx=W*(.1+R()*.8),cy=H*(.15+R()*.75),r=H*(.06+R()*.12);x.fillStyle='#120002';x.beginPath();x.ellipse(cx,cy,r,r*.55,(R()-.5)*.8,0,7);x.fill();x.strokeStyle='#5a1018';x.lineWidth=2;x.stroke();for(let k=0;k<7;k++){const tx=cx-r*.8+k*r*.27;x.fillStyle='#d0c4a8';x.beginPath();x.moveTo(tx,cy-r*.45);x.lineTo(tx+r*.12,cy-r*.05);x.lineTo(tx+r*.24,cy-r*.45);x.fill();x.beginPath();x.moveTo(tx,cy+r*.45);x.lineTo(tx+r*.12,cy+r*.08);x.lineTo(tx+r*.24,cy+r*.45);x.fill()}glow(x,cx,cy,r*.5,'#ff2030',.25)}},
 maw(x,W,H,R,P){const cx=W*(.35+R()*.3),cy=H*(.45+R()*.12),r=H*(.36+R()*.12);const g=x.createRadialGradient(cx,cy,r*.2,cx,cy,r*1.3);g.addColorStop(0,'#000');g.addColorStop(.45,P.c[2]);g.addColorStop(.75,P.c[0]);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.beginPath();x.arc(cx,cy,r*1.3,0,7);x.fill();
  for(let k=0;k<3;k++)teeth(x,cx,cy,r*(.95-k*.22),18-k*3,k?'#a89a80':'#d0c4aa');x.fillStyle='rgba(0,0,0,.6)';x.beginPath();x.arc(cx,cy,r*.3,0,7);x.fill();glow(x,cx,cy,r*.3,'#ff1a30',.45);for(let i=0;i<6;i++){const a=R()*TAU;eyeAt(x,cx+Math.cos(a)*r*1.05,cy+Math.sin(a)*r*.9,W*.035,H*.018,P,R)}},
 rift(x,W,H,R,P){const cx=W*(.4+R()*.2),pts=[],pt2=[];for(let i=0;i<=12;i++){const y=-5+i*(H+10)/12,w=Math.sin(i/12*Math.PI)*W*(.12+R()*.06);pts.push([cx-w+(R()-.5)*10,y]);pt2.unshift([cx+w+(R()-.5)*10,y])}
  glow(x,cx,H/2,W*.45,P.c[3],.5);blob(x,pts.concat(pt2));x.fillStyle='#000';x.fill();x.save();x.clip();nebula(x,W,H,R,{c:['#4a0a3a','#0a3a3a','#3a0a0a','#200a40']},3,.4);eyeAt(x,cx,H/2,W*.1,H*.06,P,R);x.restore();blob(x,pts.concat(pt2));rim(x,P.g,2.5,.9);rim(x,P.a,6,.15)},
 rune(x,W,H,R,P){const cx=W/2,cy=H/2,r=H*.38;glow(x,cx,cy,r*1.8,P.c[0],.5);x.save();x.globalCompositeOperation='lighter';x.strokeStyle=hexA(P.g,.75);
  for(const k of[1,.78,.5]){x.lineWidth=k===1?2:1.2;x.beginPath();x.arc(cx,cy,r*k,0,7);x.stroke()}const n=5+Math.floor(R()*4);x.beginPath();for(let i=0;i<=n;i++){const a=(i*2%n)/n*TAU-1.57;x.lineTo(cx+Math.cos(a)*r*.78,cy+Math.sin(a)*r*.78)}x.stroke();
  for(let i=0;i<16;i++){const a=i/16*TAU,gx=cx+Math.cos(a)*r*.89,gy=cy+Math.sin(a)*r*.89;x.beginPath();x.moveTo(gx-3,gy-3);x.lineTo(gx+(R()-.5)*6,gy+3);x.lineTo(gx+3,gy-R()*3);x.stroke()}x.restore();if(R()<.6)eyeAt(x,cx,cy,r*.38,r*.13,P,R);else glow(x,cx,cy,r*.45,P.a,.5)},
 circuit(x,W,H,R,P){x.save();x.globalCompositeOperation='lighter';for(let i=0;i<26;i++){let px=W/2,py=H/2,d=Math.floor(R()*4);x.strokeStyle=hexA(R()<.7?P.c[2]:P.a,.5);x.lineWidth=1;x.beginPath();x.moveTo(px,py);for(let j=0;j<6;j++){const l=6+R()*18;px+=[l,0,-l,0][d];py+=[0,l,0,-l][d];x.lineTo(px,py);if(R()<.5)d=(d+(R()<.5?1:3))%4}x.stroke();x.fillStyle=hexA(P.a,.8);x.fillRect(px-1.5,py-1.5,3,3)}x.restore();PAINT.rune(x,W,H,R,P)},
 drone(x,W,H,R,P){drone(x,W/2+(R()-.5)*30,H/2+(R()-.5)*10,H*(.18+R()*.06),P,R);for(let i=0;i<16;i++){x.fillStyle=`rgba(150,140,120,${R()*.5})`;x.fillRect(R()*W,R()*H,1+R()*3,1+R()*2)}},
 swarm(x,W,H,R,P){for(let i=0;i<16;i++){const s=H*(.03+R()*R()*.09),dx=R()*W,dy=R()*H;x.strokeStyle=hexA(P.a,.15);x.lineWidth=s*.5;x.beginPath();x.moveTo(dx,dy);x.lineTo(dx-s*6,dy+s*2);x.stroke();drone(x,dx,dy,s,P,R,'#ff2a20')}},
 shield(x,W,H,R,P){x.save();x.globalCompositeOperation='lighter';x.strokeStyle=hexA(P.c[2],.35);x.lineWidth=1;const s=12;for(let r=0;r<H/s+1;r++)for(let c=0;c<W/s+1;c++){const hx=c*s*1.5,hy=r*s*1.7+(c%2)*s*.85;if(Math.hypot(hx-W/2,hy-H/2)>W*.42)continue;x.beginPath();for(let k=0;k<6;k++){const a=k/6*TAU;x.lineTo(hx+Math.cos(a)*s*.9,hy+Math.sin(a)*s*.9)}x.closePath();x.stroke()}x.restore()},
 cross(x,W,H,R,P){const cx=W*.72,cy=H*.3,s=H*.1;x.save();x.globalCompositeOperation='lighter';x.fillStyle='rgba(90,255,190,.35)';x.fillRect(cx-s*.35,cy-s,s*.7,s*2);x.fillRect(cx-s,cy-s*.35,s*2,s*.7);x.restore();glow(x,cx,cy,s*2,'#5affc0',.4);for(let i=0;i<6;i++){x.fillStyle='rgba(0,0,0,.6)';x.fillRect(cx-s,cy-s+R()*s*2,s*2,1)}},
 lantern(x,W,H,R,P){const cx=W*(.3+R()*.4),cy=H*.32;x.strokeStyle='#222';x.lineWidth=1.5;x.beginPath();x.moveTo(cx,0);x.lineTo(cx,cy-12);x.stroke();glow(x,cx,cy,W*.4,'#ffb050',.45);glow(x,cx,cy,14,'#fff0c0',.9);x.strokeStyle='#1a1410';x.lineWidth=2;for(let i=-1;i<=1;i++){x.beginPath();x.moveTo(cx+i*7,cy-12);x.lineTo(cx+i*9,cy+12);x.stroke()}},
 ship(x,W,H,R,P){x.save();x.translate(W/2,H/2);x.rotate((R()-.5)*.6);const L=W*.9,h=H*(.13+R()*.06);glow(x,-L/2,0,h*2.2,P.a,.35);
  const g=x.createLinearGradient(0,-h,0,h);g.addColorStop(0,'#5a6266');g.addColorStop(.45,'#1e2428');g.addColorStop(1,'#030405');x.fillStyle=g;blob(x,[[-L/2,-h*.7],[-L*.1,-h],[L*.3,-h*.8],[L/2,-h*.15],[L/2,h*.25],[L*.15,h],[-L/2,h*.8]]);x.fill();rim(x,P.g,1,.5);
  x.fillStyle='#2a3034';x.fillRect(-L*.25,-h*1.5,L*.18,h*.55);x.fillRect(-L*.05,h*.9,L*.22,h*.4);
  for(let i=0;i<60;i++){x.fillStyle=R()<.5?`rgba(0,0,0,${R()*.5})`:R()<.5?`rgba(120,70,30,${R()*.3})`:`rgba(180,200,200,${R()*.15})`;x.fillRect(-L/2+R()*L*.9,-h+R()*h*1.8,3+R()*18,1+R()*4)}
  for(let i=0;i<18;i++){const lx=-L/2+R()*L*.85,ly=-h*.4+R()*h*.8,c=R()<.7?P.a:P.g;x.fillStyle=c;x.fillRect(lx,ly,2,1.4);glow(x,lx,ly,4,c,.4)}
  const bx=L*(R()*.4-.1),by=(R()-.5)*h;blob(x,jag(bx,by,h*.45,12,R,.6));x.fillStyle='#000';x.fill();rim(x,'#ff6a20',1.5,.6);glow(x,bx,by,h*.8,'#ff4a10',.3);x.restore();
  for(let i=0;i<12;i++){x.fillStyle=`rgba(120,120,120,${.3+R()*.4})`;x.save();x.translate(R()*W,R()*H);x.rotate(R()*3);x.fillRect(0,0,2+R()*5,1+R()*3);x.restore()}},
 ark(x,W,H,R,P){const y=H*(.35+R()*.1),h=H*.22;glow(x,W*.6,y,W*.6,P.a,.25);metal(x,-5,y,W+10,h,R);x.fillStyle='#0a0c0d';x.fillRect(W*.55,y-h*.9,W*.12,h);x.fillRect(W*.6,y-h*1.5,W*.03,h*.7);x.fillRect(W*.2,y-h*.4,W*.25,h*.45);x.beginPath();x.rect(-5,y-h*.9,W+10,h*1.9);
  for(let i=0;i<70;i++){const wx=R()*W,wy=y+h*(.15+R()*.7);x.fillStyle=R()<.85?hexA(P.a,.85):'#a8e0dc';x.fillRect(wx,wy,1.6,1.1)}glow(x,W*.615,y-h*1.5,6,'#ff2a1a',.9);x.fillStyle='rgba(0,0,0,.5)';x.fillRect(-5,y+h*.8,W+10,h*.2);x.strokeStyle=hexA(P.g,.5);x.lineWidth=1;x.beginPath();x.moveTo(-5,y);x.lineTo(W+5,y);x.stroke()},
 turret(x,W,H,R,P){const bx=W*.3,by=H*.78;x.save();x.translate(bx,by);x.rotate(-.5-R()*.2);metal(x,0,-7,W*.75,14,R);for(let i=0;i<6;i++){x.fillStyle='#b06a20';x.fillRect(W*.1+i*W*.08,-9,3,18)}glow(x,W*.75,0,22,P.a,.9);glow(x,W*.75,0,8,'#ffffff',.9);x.restore();x.fillStyle='#0a0c0d';x.beginPath();x.arc(bx,by,H*.17,0,7);x.fill();rim(x,P.g,1.2,.5);x.fillRect(bx-W*.2,by,W*.4,H*.3)},
 vent(x,W,H,R,P){x.fillStyle='#0c0e0f';x.fillRect(0,H*.7,W*.35,H*.3);for(let i=0;i<5;i++){x.fillStyle='#000';x.fillRect(4,H*.74+i*7,W*.3,3)}x.save();x.globalCompositeOperation='lighter';for(let i=0;i<40;i++){const t=R(),px=W*.3+t*W*.7,py=H*.78-t*H*.55+(R()-.5)*t*60;glow(x,px,py,8+t*30,R()<.5?'#ff6a10':P.a,.18)}x.restore();for(let i=0;i<10;i++){x.save();x.translate(W*(.5+R()*.5),H*R()*.7);x.rotate(R()*3);x.fillStyle='#050505';x.fillRect(-4,-2,8+R()*10,4+R()*4);x.restore()}},
 beam(x,W,H,R,P){glow(x,W*.15,H*.85,W*.3,P.a,.3);const a=-(.35+R()*.3);x.save();x.translate(W*.05,H*.88);x.rotate(a);x.globalCompositeOperation='lighter';for(const[w,al]of[[24,.1],[12,.25],[5,.6],[2,1]]){x.fillStyle=hexA(w<3?'#ffffff':P.c[2],al);x.fillRect(0,-w/2,W*1.3,w)}x.restore();
  const hx=W*(.55+R()*.25),hy=H*(.25+R()*.25);glow(x,hx,hy,H*.35,P.a,.6);glow(x,hx,hy,H*.12,'#ffffff',.7);x.save();x.globalCompositeOperation='lighter';for(let i=0;i<40;i++){const t=R()*TAU,l=10+R()*45;x.strokeStyle=hexA(R()<.5?P.a:P.g,.6);x.lineWidth=1;x.beginPath();x.moveTo(hx,hy);x.lineTo(hx+Math.cos(t)*l,hy+Math.sin(t)*l);x.stroke()}x.restore()},
 human(x,W,H,R,P){const cx=W/2+(R()-.5)*24,cy=H*.47,r=H*.27;const sg=x.createLinearGradient(0,H*.7,0,H);sg.addColorStop(0,'#3a3c3e');sg.addColorStop(1,'#060708');x.fillStyle=sg;x.beginPath();x.ellipse(cx,H*1.06,W*.42,H*.4,0,Math.PI,TAU);x.fill();rim(x,P.g,1,.35);
  x.fillStyle='#8a5a1a';x.fillRect(cx-W*.3,H*.86,W*.08,H*.035);for(let i=0;i<20;i++){x.fillStyle=`rgba(0,0,0,${R()*.4})`;x.fillRect(cx-W*.4+R()*W*.8,H*.75+R()*H*.25,2+R()*8,1+R()*3)}
  const g=x.createRadialGradient(cx-r*.3,cy-r*.4,r*.2,cx,cy,r*1.15);g.addColorStop(0,'#a8acae');g.addColorStop(.6,'#4a4e52');g.addColorStop(1,'#101214');x.fillStyle=g;x.beginPath();x.arc(cx,cy,r*1.12,0,7);x.fill();rim(x,P.g,1.2,.5);
  const v=x.createLinearGradient(cx-r,cy-r,cx+r,cy+r);v.addColorStop(0,'#06060c');v.addColorStop(.5,P.s);v.addColorStop(1,'#000');x.fillStyle=v;x.beginPath();x.ellipse(cx,cy+r*.05,r*.85,r*.7,0,0,7);x.fill();
  x.save();x.beginPath();x.ellipse(cx,cy+r*.05,r*.85,r*.7,0,0,7);x.clip();nebula(x,W,H,R,P,2,.25);if(R()<.5)eyeAt(x,cx,cy,r*.45,r*.15,P,R);else{x.fillStyle='rgba(0,0,0,.85)';x.beginPath();x.arc(cx-r*.3,cy,r*.15,0,7);x.arc(cx+r*.3,cy,r*.15,0,7);x.fill();glow(x,cx-r*.3,cy,r*.2,P.a,.5);glow(x,cx+r*.3,cy,r*.2,P.a,.5)}
  x.fillStyle='rgba(255,255,255,.25)';x.beginPath();x.ellipse(cx-r*.4,cy-r*.35,r*.25,r*.1,-.6,0,7);x.fill();x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=.8;x.beginPath();x.moveTo(cx+r*.1,cy-r*.5);x.lineTo(cx+r*.3,cy-r*.1);x.lineTo(cx+r*.2,cy+r*.2);x.stroke();x.restore()},
 warden(x,W,H,R,P){PAINT.human(x,W,H,R,P);const sx=W*.18,sy=H*.38;x.fillStyle='#14181a';x.fillRect(sx,sy,W*.25,H*.6);for(let i=0;i<6;i++){x.fillStyle=i%2?'#c89a20':'#0a0a0a';x.save();x.beginPath();x.rect(sx,sy+H*.48,W*.25,H*.1);x.clip();x.fillRect(sx+i*12-10,sy+H*.48,7,H*.1);x.restore()}x.beginPath();x.rect(sx,sy,W*.25,H*.6);rim(x,P.g,1,.6)},
 beacon(x,W,H,R,P){const cx=W*(.4+R()*.2),by=H*.92;x.strokeStyle='#14181a';x.lineWidth=3;x.beginPath();x.moveTo(cx-W*.1,by);x.lineTo(cx,H*.3);x.lineTo(cx+W*.1,by);x.stroke();x.lineWidth=1;for(let i=0;i<6;i++){const y=H*.35+i*H*.1;x.beginPath();x.moveTo(cx-i*W*.017,y);x.lineTo(cx+i*W*.017,y+H*.05);x.stroke()}
  glow(x,cx,H*.3,20,'#ff3a20',.9);x.save();x.globalCompositeOperation='lighter';for(let i=1;i<6;i++){x.strokeStyle=hexA(P.a,.5/i);x.lineWidth=1.5;x.beginPath();x.arc(cx,H*.3,i*H*.12,-2.6,-.5);x.stroke()}x.restore()},
 robed(x,W,H,R,P){const cx=W/2+(R()-.5)*16;x.strokeStyle=hexA(P.g,.6);x.lineWidth=1.2;x.beginPath();x.arc(cx,H*.22,H*.13,0,7);x.stroke();for(let i=0;i<7;i++){const a=i/7*TAU;x.beginPath();x.moveTo(cx,H*.22);x.lineTo(cx+Math.cos(a)*H*.13,H*.22+Math.sin(a)*H*.13);x.stroke()}glow(x,cx,H*.22,H*.22,P.c[3],.4);hooded(x,cx,H*1.04,H*.52,P,R);
  x.strokeStyle='rgba(120,0,10,.5)';x.lineWidth=1;for(let i=0;i<6;i++){x.beginPath();x.moveTo(cx+(R()-.5)*W*.2,H*.7);x.lineTo(cx+(R()-.5)*W*.4,H);x.stroke()}},
 knife(x,W,H,R,P){x.save();x.translate(W*(.45+R()*.1),H*.5);x.rotate(.5+R()*.4);const g=x.createLinearGradient(-6,0,6,0);g.addColorStop(0,'#3a3634');g.addColorStop(.5,'#d8d0c0');g.addColorStop(1,'#2a2422');x.fillStyle=g;x.beginPath();x.moveTo(0,-H*.5);for(let i=0;i<5;i++){x.quadraticCurveTo((i%2?-1:1)*9,-H*.5+(i+.5)*H*.09,i%2?-5:5,-H*.5+(i+1)*H*.09)}x.lineTo(-6,H*.0);x.lineTo(6,H*0);x.closePath();x.fill();
  x.fillStyle='#6a0a12';x.beginPath();x.moveTo(-3,-H*.18);x.quadraticCurveTo(0,-H*.05,3,-H*.12);x.lineTo(4,0);x.lineTo(-4,0);x.fill();x.fillStyle='#2a1a10';x.fillRect(-16,0,32,5);x.fillStyle='#1a0e08';x.fillRect(-4,5,8,H*.25);x.fillStyle='#c8b080';x.beginPath();x.arc(0,H*.32,5,0,7);x.fill();glow(x,0,-H*.35,10,'#ffffff',.5);x.restore()},
 blood(x,W,H,R,P){for(let i=0;i<9;i++){const dx=R()*W,l=H*(.15+R()*.6),w=2+R()*5;const g=x.createLinearGradient(0,0,0,l);g.addColorStop(0,'#3a0006');g.addColorStop(1,'#8a0a14');x.fillStyle=g;x.fillRect(dx-w/2,0,w,l);x.beginPath();x.arc(dx,l,w*.9,0,7);x.fill();x.fillStyle='rgba(255,200,200,.25)';x.fillRect(dx-w*.25,0,1,l)}
  const g=x.createRadialGradient(W/2,H*.95,4,W/2,H*.95,W*.5);g.addColorStop(0,'#7a0612');g.addColorStop(1,'rgba(40,0,4,0)');x.fillStyle=g;x.beginPath();x.ellipse(W/2,H*.95,W*.5,H*.12,0,0,7);x.fill()},
 spores(x,W,H,R,P){for(let i=0;i<14;i++){const sx=R()*W,sy=R()*H,r=H*(.02+R()*R()*.12);const g=x.createRadialGradient(sx-r*.3,sy-r*.3,r*.1,sx,sy,r);g.addColorStop(0,'#5a4a20');g.addColorStop(1,'#120804');x.fillStyle=g;x.beginPath();x.arc(sx,sy,r,0,7);x.fill();glow(x,sx,sy,r*1.6,P.a,.3);for(let j=0;j<4;j++){x.fillStyle=hexA(P.a,.8);x.fillRect(sx+(R()-.5)*r,sy+(R()-.5)*r,1.4,1.4)}}
  for(let i=0;i<40;i++){x.fillStyle=hexA(P.a,R()*.5);x.fillRect(R()*W,R()*H,1,1)}},
 flesh(x,W,H,R,P){glow(x,W/2,H/2,W*.5,P.c[1],.25);for(let i=0;i<24;i++){const bx=W*(.15+R()*.7),by=H*(.25+R()*.7),r=H*(.08+R()*.16);const g=x.createRadialGradient(bx-r*.3,by-r*.4,r*.1,bx,by,r);g.addColorStop(0,'#9a4a4a');g.addColorStop(.5,P.c[0]);g.addColorStop(1,P.s);x.fillStyle=g;x.beginPath();x.arc(bx,by,r,0,7);x.fill()}
  x.strokeStyle='rgba(40,0,10,.7)';x.lineWidth=1;for(let i=0;i<14;i++){x.beginPath();let px=R()*W,py=H*(.3+R()*.6);x.moveTo(px,py);for(let j=0;j<4;j++){px+=(R()-.5)*20;py+=(R()-.5)*14;x.lineTo(px,py)}x.stroke()}
  const n=2+Math.floor(R()*4);for(let i=0;i<n;i++)eyeAt(x,W*(.25+R()*.5),H*(.35+R()*.4),W*(.04+R()*.05),H*(.02+R()*.025),P,R,(R()-.5)*2,0);
  const mx=W*(.35+R()*.3),my=H*(.72+R()*.1),mw=W*.14;x.fillStyle='#120002';x.beginPath();x.ellipse(mx,my,mw,H*.05,0,0,7);x.fill();for(let i=0;i<8;i++){const tx=mx-mw*.8+i*mw*.23;x.fillStyle='#c8bca0';x.beginPath();x.moveTo(tx,my-H*.04);x.lineTo(tx+mw*.1,my);x.lineTo(tx+mw*.2,my-H*.04);x.fill()}},
 golem(x,W,H,R,P){const cx=W/2,by=H*1.02;for(let i=0;i<26;i++){const t=R(),bx=cx+(R()-.5)*W*.55*(1-t*.4),byy=by-t*H*.85,r=H*(.07+R()*.09);const g=x.createRadialGradient(bx-r*.3,byy-r*.4,r*.1,bx,byy,r);g.addColorStop(0,'#5a2a26');g.addColorStop(.6,'#2a0a0c');g.addColorStop(1,'#060102');x.fillStyle=g;x.beginPath();x.arc(bx,byy,r,0,7);x.fill()}
  x.save();x.globalCompositeOperation='lighter';x.strokeStyle=hexA(P.a,.45);x.lineWidth=1.2;for(let i=0;i<7;i++){x.beginPath();let px=cx+(R()-.5)*W*.4,py=H*(.3+R()*.6);x.moveTo(px,py);for(let j=0;j<4;j++){px+=(R()-.5)*16;py+=(R()-.5)*12;x.lineTo(px,py);x.lineTo(px+2,py+2)}x.stroke()}x.restore();for(const k of[-1,1])glow(x,cx+k*W*.05,H*.26,6,'#ff3a1a',.9)},
 planet(x,W,H,R,P){const cx=W*(.35+R()*.3),cy=H*(.48+R()*.15),r=H*(.3+R()*.08);glow(x,cx,cy,r*1.6,P.c[3],.35);const g=x.createRadialGradient(cx-r*.5,cy-r*.5,r*.1,cx,cy,r);g.addColorStop(0,P.c[1]);g.addColorStop(.55,P.c[0]);g.addColorStop(1,'#000');x.fillStyle=g;x.beginPath();x.arc(cx,cy,r,0,7);x.fill();rim(x,P.g,1.3,.5);
  x.save();x.beginPath();x.arc(cx,cy,r,0,7);x.clip();x.strokeStyle='rgba(0,0,0,.3)';for(let i=0;i<8;i++){x.lineWidth=2+R()*5;x.beginPath();x.ellipse(cx,cy+(R()-.5)*r*2,r*1.2,r*.12,0,0,7);x.stroke()}x.strokeStyle=hexA(P.a,.9);x.lineWidth=1.3;for(let k=0;k<3;k++){x.beginPath();let px=cx+(R()-.5)*r,py=cy+(R()-.5)*r;x.moveTo(px,py);for(let i=0;i<7;i++){px+=(R()-.5)*r*.4;py+=(R()-.5)*r*.4;x.lineTo(px,py)}x.stroke()}glow(x,cx,cy,r*.4,P.a,.2);x.restore();
  x.strokeStyle=hexA(P.g,.45);x.lineWidth=1.5;x.beginPath();x.ellipse(cx,cy,r*1.8,r*.33,-.3,0,7);x.stroke()}
};
const SPEC={v1:'spawn@void',v2:'eye@debris',v3:'eyes@flesh',v4:'leech@void',v5:'tent@planet',v6:'star,crowd@void',v7:'maw@hull',v8:'leviathan@planet',v9:'star@void',v10:'bigeye@void',v11:'rift@hull',v12:'planet,crowd@debris',v13:'rune@void',
 m1:'drone@hull',m2:'shield,drone@hull',m3:'swarm@debris',m4:'cross,drone@hull',m5:'ship@debris',m6:'lantern,drone@hull',m7:'human@hull',m8:'turret@debris',m9:'ark@planet',m10:'circuit,beam@hull',m11:'beam@void',m12:'vent@hull',m13:'circuit@hull',
 c1:'robed@altar',c2:'robed,blood@altar',c3:'flesh@flesh',c4:'spores@flesh',c5:'knife,robed@altar',c6:'golem@flesh',c7:'spores,robed@altar',c8:'flesh,maw@flesh',c9:'mouths,eyes@flesh',c10:'knife,blood@altar',c11:'blood,eyes@flesh',c12:'crowd,blood@altar',c13:'star,robed@altar',
 n1:'beacon@planet',n2:'human@debris',n3:'human@hull',n4:'warden@hull',n5:'beacon@debris',n6:'ship@void',tD:'drone@hull',tS:'human@hull'};
const ART={},ARTV='hs7',VIDV='hs9';
try{for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(/^hs\d+:/.test(k))localStorage.removeItem(k)}}catch(e){}
const mkc=(W,H)=>{const c=document.createElement('canvas');c.width=W;c.height=H;return c};
function paint(key,f,spec,W=336,H=252){if(ART[key])return ART[key];
 const R=rng(hash(key)),P=PAL[f],[subs,sc]=spec.split('@'),out=mkc(W,H),x=out.getContext('2d');
 const B=mkc(W,H),b=B.getContext('2d');b.fillStyle=P.b;b.fillRect(0,0,W,H);(SCENE[sc]||SCENE.void)(b,W,H,R,P);
 x.fillStyle='#000';x.fillRect(0,0,W,H);x.filter='blur(1.6px) brightness(.7)';x.drawImage(B,0,0);x.filter='none';
 const hz=x.createLinearGradient(0,H*.25,0,H);hz.addColorStop(0,hexA(P.c[3],0));hz.addColorStop(1,hexA(P.c[3],.16));x.fillStyle=hz;x.fillRect(0,0,W,H);
 const lt=(typeof LT!=='undefined'&&LT[subs])||[],EX=lt[2]||1;const lx=lt[0]!=null?W*lt[0]:W*(.12+R()*.76),ly=lt[1]!=null?H*lt[1]:-H*.12+R()*H*.25;const Gr=mkc(W,H),gg=Gr.getContext('2d');gg.globalCompositeOperation='lighter';
 for(let i=0;i<11;i++){const a=Math.PI/2+(lx/W-.5)*-.9+(R()-.5)*1.1,w=.015+R()*.05,l=H*1.7;gg.fillStyle=hexA(P.g,.05+R()*.08);gg.beginPath();gg.moveTo(lx,ly);gg.lineTo(lx+Math.cos(a-w)*l,ly+Math.sin(a-w)*l);gg.lineTo(lx+Math.cos(a+w)*l,ly+Math.sin(a+w)*l);gg.fill()}
 glow(gg,lx,ly,W*.35,P.g,.25);x.save();x.globalCompositeOperation='lighter';x.filter='blur(5px)';x.drawImage(Gr,0,0);x.restore();
 const Sc=mkc(W,H),s=Sc.getContext('2d');for(const k of subs.split(','))(PAINT[k]||PAINT.rune)(s,W,H,R,P);
 const dx=W/2-lx,dy=H*.55-ly,dl=Math.hypot(dx,dy)||1,ux=-dx/dl,uy=-dy/dl;
 s.save();s.globalCompositeOperation='source-atop';const sg=s.createLinearGradient(lx,ly,lx+dx/dl*W*1.2,ly+dy/dl*W*1.2);sg.addColorStop(0,'rgba(0,0,0,0)');sg.addColorStop(.4,'rgba(0,0,0,.3)');sg.addColorStop(1,'rgba(0,0,0,.72)');s.fillStyle=sg;s.fillRect(0,0,W,H);
 if(f==='c'||/flesh|golem|maw|mouths|eyes/.test(subs)){s.globalCompositeOperation='lighter';const ss=s.createRadialGradient(W/2,H*.55,0,W/2,H*.55,W*.5);ss.addColorStop(0,'rgba(255,60,40,.0)');ss.addColorStop(.5,'rgba(200,30,20,.10)');ss.addColorStop(1,'rgba(120,0,0,0)');s.fillStyle=ss;s.fillRect(0,0,W,H)}s.restore();
 x.drawImage(Sc,0,0);
 const M=mkc(W,H),m=M.getContext('2d');m.drawImage(Sc,0,0);m.globalCompositeOperation='source-in';m.fillStyle=P.g;m.fillRect(0,0,W,H);m.globalCompositeOperation='destination-out';m.drawImage(Sc,-ux*3.2,-uy*3.2);
 x.save();x.globalCompositeOperation='lighter';x.globalAlpha=.55;x.filter='blur(.8px)';x.drawImage(M,0,0);x.restore();
 const F=mkc(W,H),fc=F.getContext('2d');for(let i=0;i<3;i++){const side=i%2?W+10:-10,cx=side+(i%2?-1:1)*R()*W*.2,cy=H*(.85+R()*.25),r=W*(.12+R()*.16);blob(fc,jag(cx,cy,r,11,R,.5));fc.fillStyle='#010101';fc.fill();fc.save();fc.clip();glow(fc,cx+ux*r,cy+uy*r,r*.7,P.g,.12);fc.restore()}
 x.save();x.filter='blur(2.4px)';x.drawImage(F,0,0);x.restore();
 x.save();x.globalCompositeOperation='overlay';const fa=R()*3;for(let i=0;i<420;i++){const px=R()*W,py=R()*H,a=fa+(R()-.5)*.9,l=3+R()*10;x.strokeStyle=R()<.5?`rgba(255,240,220,${.04+R()*.07})`:`rgba(0,0,0,${.06+R()*.1})`;x.lineWidth=.6+R()*2;x.beginPath();x.moveTo(px,py);x.lineTo(px+Math.cos(a)*l,py+Math.sin(a)*l);x.stroke()}x.restore();
 const id=x.getImageData(0,0,W,H),d=id.data;for(let i=0;i<d.length;i+=4){const l=(d[i]*.3+d[i+1]*.59+d[i+2]*.11)/255;const k=Math.pow(l,1.8)*1.8*EX/(l||1);const n=(Math.random()-.5)*7;
  const sp=l>.7?(l-.7)*260:0;d[i]=(d[i]*.8+l*51)*k+n+sp;d[i+1]=(d[i+1]*.8+l*51)*k+n+sp;d[i+2]=(d[i+2]*.8+l*51)*k+n+sp}x.putImageData(id,0,0);
 const Bl=mkc(W,H),bl=Bl.getContext('2d');bl.filter='blur(7px)';bl.drawImage(out,0,0);x.save();x.globalCompositeOperation='lighter';x.globalAlpha=.6;x.drawImage(Bl,0,0);x.restore();
 const vg=x.createRadialGradient(W*.5,H*.5,H*.25,W/2,H/2,W*.68);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.88)');x.fillStyle=vg;x.fillRect(0,0,W,H);
 const u=out.toDataURL('image/jpeg',.8);return ART[key]=u}
const artURL=id=>{const d=C[id];return paint(id,d.f,SPEC[id]||d.art+'@void')};
const heroArt=f=>paint('hero-'+f,f,HSPEC[f],200,200);
/* ---- painted art: art/<id>.webp layered over the procedural art (fallback while loading / offline) ---- */
/* absolute, so url() values set from JS resolve the same inside css/*.css */
const ARTDIR=new URL('art/',document.baseURI).href,ART_IDS=new Set();
const realArt=k=>`${ARTDIR}${(C[k]&&C[k].ai)||k}.webp?${ARTV}`;/* v9: a card may reuse another card's painting (ai) */
/* v7.1: the procedural painter is now only a fallback for art that failed to load (it used to run for every card on
   the main thread at startup = long jank on phones). While a webp loads, a cheap dark gradient shows instead. */
const ARTPH='linear-gradient(160deg,#16101c,#060408)';
/* v7.4: full-art Legendaries (600x840) also ship art/s/<id>.webp at 360x504. Hand, board, grids and packs use the small one
   (a 600x840 decode is 2 MB of GPU texture per card; on phones that memory pressure evicts tiles = flicker). Zoom and the
   cinematic layer the full size over the small one (artBG(id,1)), so there is never an empty frame while it loads. */
const hasS=k=>!!(C[k]&&C[k].r==='L');
const realArtS=k=>hasS(k)?`${ARTDIR}s/${k}.webp?${ARTV}`:realArt(k);
const artBG=(id,big)=>PRE.st[id]==='err'?`url(${artURL(id)})`:(big&&hasS(id)?`url(${realArt(id)}),`:'')+`url(${realArtS(id)}),${ARTPH}`;
const heroBG=f=>PRE.st['h'+f]==='err'?`url(${heroArt(f)})`:`url(${realArt('h'+f)}),${ARTPH}`;
function artFail(k){const u=`/${k}.webp`;requestAnimationFrame(()=>{for(const e of document.querySelectorAll('.art,.av,.ta,.cpan'))if(e.style.backgroundImage.includes(u))e.style.backgroundImage=k[0]==='h'&&k.length===2?heroBG(k[1]):artBG(k)})}
const PRE={st:{},q:[],act:0,max:6,img:{}};
function artPre(keys,hi){keys=[...new Set(keys)].filter(k=>!PRE.st[k]);if(hi)PRE.q.unshift(...keys);else PRE.q.push(...keys);keys.forEach(k=>PRE.st[k]='q');preRun()}
function preRun(){while(PRE.act<PRE.max&&PRE.q.length){const k=PRE.q.shift();if(PRE.st[k]!=='q')continue;PRE.st[k]='l';PRE.act++;const im=new Image();im.decoding='async';try{im.fetchPriority='high'}catch(e){}
 im.onload=()=>{PRE.st[k]='ok';PRE.act--;PRE.img[k]=im;if(im.decode)im.decode().catch(()=>{});preRun()};im.onerror=()=>{PRE.st[k]='err';PRE.act--;artFail(k);preRun()};im.src=realArtS(k)}}
/* v7.4: references to the preloaded (and decoded) images are kept in PRE.img so the browser keeps them warm: a card
   entering the hand/board paints from a decoded image instead of popping in a frame later. */
/* ---- faction frame textures ---- */
const FRAME={};
function frameURL(f){if(FRAME[f])return FRAME[f];const W=300,H=420,cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d'),R=rng(hash('frame'+f)),P=PAL[f];
 const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,{v:'#120a18',m:'#16191a',c:'#1a0a0a',n:'#17181a'}[f]);g.addColorStop(1,{v:'#050208',m:'#060708',c:'#070203',n:'#070708'}[f]);x.fillStyle=g;x.fillRect(0,0,W,H);
 for(let i=0;i<2200;i++){x.fillStyle=R()<.5?`rgba(0,0,0,${R()*.35})`:`rgba(255,255,255,${R()*.035})`;x.fillRect(R()*W,R()*H,1+R()*2,1+R()*2)}
 if(f==='v'){for(let i=0;i<10;i++){const e=i%4,sx=[0,W,R()*W,R()*W][e],sy=[R()*H,R()*H,0,H][e];const a=[0,Math.PI,1.57,-1.57][e]+(R()-.5)*.8;x.globalAlpha=.75;tentacle(x,sx,sy,90+R()*80,a,5,P,R,40,0);x.globalAlpha=1}
  for(let k=0;k<4;k++){const cx=k%2?W-14:14,cy=k<2?14:H-14;for(let i=0;i<14;i++){const bx=cx+(R()-.5)*50,by=cy+(R()-.5)*50,r=2+R()*6;const bg=x.createRadialGradient(bx-r*.3,by-r*.3,0,bx,by,r);bg.addColorStop(0,'#6a6070');bg.addColorStop(1,'#141018');x.fillStyle=bg;x.beginPath();x.arc(bx,by,r,0,7);x.fill();x.fillStyle='#050308';x.beginPath();x.arc(bx,by,r*.4,0,7);x.fill()}}}
 if(f==='m'){for(let y=0;y<H;y+=70)for(let xx=0;xx<W;xx+=100){x.strokeStyle='rgba(0,0,0,.8)';x.lineWidth=2;x.strokeRect(xx+(y/70%2)*50,y,100,70);x.strokeStyle='rgba(140,150,150,.08)';x.strokeRect(xx+(y/70%2)*50+1.5,y+1.5,97,67)}
  for(let i=0;i<26;i++){const rx=R()*W,ry=R()*H,r=10+R()*40;const rg=x.createRadialGradient(rx,ry,0,rx,ry,r);rg.addColorStop(0,'rgba(120,56,18,.35)');rg.addColorStop(1,'rgba(80,30,10,0)');x.fillStyle=rg;x.fillRect(rx-r,ry-r,r*2,r*2)}
  for(let i=0;i<14;i++){x.fillStyle='rgba(110,50,15,.35)';x.fillRect(R()*W,R()*H,1.5,10+R()*40)}
  const riv=(px,py)=>{const rg=x.createRadialGradient(px-1,py-1,0,px,py,3.2);rg.addColorStop(0,'#9aa0a0');rg.addColorStop(1,'#1a1c1c');x.fillStyle=rg;x.beginPath();x.arc(px,py,3,0,7);x.fill()};for(let i=10;i<W;i+=22){riv(i,7);riv(i,H-7)}for(let i=10;i<H;i+=22){riv(7,i);riv(W-7,i)}
  x.save();x.beginPath();x.rect(0,H-26,W,12);x.clip();for(let i=-20;i<W+20;i+=16){x.fillStyle='#b8901e';x.beginPath();x.moveTo(i,H-26);x.lineTo(i+8,H-26);x.lineTo(i-4,H-14);x.lineTo(i-12,H-14);x.fill()}x.fillStyle='rgba(0,0,0,.45)';x.fillRect(0,H-26,W,12);x.restore()}
 if(f==='c'){for(let i=0;i<30;i++){const bx=R()*W,by=R()*H,r=20+R()*40;const rg=x.createRadialGradient(bx,by,0,bx,by,r);rg.addColorStop(0,'rgba(90,10,16,.35)');rg.addColorStop(1,'rgba(40,0,4,0)');x.fillStyle=rg;x.fillRect(bx-r,by-r,r*2,r*2)}
  x.strokeStyle='rgba(140,20,30,.45)';x.lineWidth=1.2;for(let i=0;i<24;i++){x.beginPath();let px=R()*W,py=R()*H;x.moveTo(px,py);for(let j=0;j<6;j++){px+=(R()-.5)*40;py+=(R()-.5)*40;x.lineTo(px,py)}x.stroke()}
  const bone=(px,py,v)=>{const bg=x.createLinearGradient(px-6,py-6,px+6,py+6);bg.addColorStop(0,'#cfc2a4');bg.addColorStop(1,'#5a4a36');x.fillStyle=bg;x.beginPath();v?x.ellipse(px,py,5,8,0,0,7):x.ellipse(px,py,8,5,0,0,7);x.fill();x.fillStyle='#2a1a10';x.beginPath();x.arc(px,py,1.6,0,7);x.fill()};for(let i=9;i<W;i+=17){bone(i,8,0);bone(i,H-8,0)}for(let i=25;i<H-16;i+=17){bone(8,i,1);bone(W-8,i,1)}
  x.strokeStyle='rgba(200,40,40,.35)';x.lineWidth=1;for(const[cx,cy]of[[30,30],[W-30,30],[30,H-30],[W-30,H-30]]){x.beginPath();x.arc(cx,cy,12,0,7);x.stroke();x.beginPath();for(let i=0;i<=5;i++){const a=(i*2%5)/5*TAU-1.57;x.lineTo(cx+Math.cos(a)*12,cy+Math.sin(a)*12)}x.stroke()}}
 if(f==='n'){x.strokeStyle='rgba(255,255,255,.035)';x.lineWidth=1;for(let i=0;i<W+H;i+=3){x.beginPath();x.moveTo(i,0);x.lineTo(i-H,H);x.stroke();x.beginPath();x.moveTo(i-H,0);x.lineTo(i,H);x.stroke()}
  for(let i=0;i<5;i++){x.fillStyle=`rgba(${R()<.5?'60,50,30':'30,40,50'},.35)`;const px=R()*W,py=R()*H;x.fillRect(px,py,30+R()*40,20+R()*30)}
  x.strokeStyle='rgba(200,180,130,.45)';x.setLineDash([5,4]);x.lineWidth=1.5;x.strokeRect(9,9,W-18,H-18);x.setLineDash([]);x.fillStyle='#b8862a';x.fillRect(W-58,H-22,40,8);x.fillStyle='rgba(0,0,0,.5)';x.fillRect(W-58,H-19,40,2)}
 const vg=x.createRadialGradient(W/2,H/2,H*.25,W/2,H/2,H*.7);vg.addColorStop(0,'rgba(0,0,0,.25)');vg.addColorStop(1,'rgba(0,0,0,.55)');x.fillStyle=vg;x.fillRect(0,0,W,H);
 const bv=(a,b2,c2,d2,col,w)=>{x.strokeStyle=col;x.lineWidth=w;x.beginPath();x.moveTo(a,b2);x.lineTo(c2,d2);x.stroke()};for(let k=0;k<3;k++){const o=2+k*3;bv(o,H-o,o,o,`rgba(255,240,220,${.16-k*.04})`,2);bv(o,o,W-o,o,`rgba(255,240,220,${.16-k*.04})`,2);bv(W-o,o,W-o,H-o,`rgba(0,0,0,${.6-k*.12})`,2);bv(W-o,H-o,o,H-o,`rgba(0,0,0,${.6-k*.12})`,2)}
 return FRAME[f]=cv.toDataURL('image/jpeg',.8)}
/* ---- misc textures ---- */
function grainURL(){const s=160,cv=document.createElement('canvas');cv.width=cv.height=s;const x=cv.getContext('2d'),id=x.createImageData(s,s);for(let i=0;i<id.data.length;i+=4){const v=Math.random()*255;id.data[i]=id.data[i+1]=id.data[i+2]=v;id.data[i+3]=Math.random()<.5?18:0}x.putImageData(id,0,0);return cv.toDataURL()}
function laneURL(){const W=640,H=120,cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d'),R=rng(55);x.fillStyle='rgba(0,0,0,.35)';x.fillRect(0,0,W,H);
 x.strokeStyle='rgba(0,0,0,.8)';x.lineWidth=3;x.strokeRect(6,6,W-12,H-12);x.strokeStyle='rgba(180,150,220,.10)';x.lineWidth=1;x.strokeRect(8,8,W-16,H-16);
 for(let i=0;i<6;i++){const sx=24+i*(W-48)/6,sw=(W-48)/6-14;x.strokeStyle='rgba(0,0,0,.7)';x.lineWidth=2;x.strokeRect(sx+7,18,sw,H-36);x.strokeStyle='rgba(200,170,255,.07)';x.lineWidth=1;x.strokeRect(sx+8,19,sw,H-36);
  x.save();x.translate(sx+7+sw/2,H/2);x.strokeStyle='rgba(190,160,255,.08)';x.beginPath();x.arc(0,0,sw*.3,0,7);x.stroke();for(let k=0;k<3;k++){const a=k/3*TAU+R();x.beginPath();x.moveTo(0,0);x.lineTo(Math.cos(a)*sw*.3,Math.sin(a)*sw*.3);x.stroke()}x.restore()}
 for(let i=0;i<30;i++){x.fillStyle='rgba(200,170,255,.07)';const gx=12+R()*(W-24);x.fillRect(gx,10,2,3);x.fillRect(gx,H-13,2,3)}return cv.toDataURL()}

function parchURL(){const S=256,cv=mkc(S,S),x=cv.getContext('2d'),R=rng(4242);x.fillStyle='#120d0a';x.fillRect(0,0,S,S);for(let i=0;i<14;i++)glow(x,R()*S,R()*S,30+R()*60,R()<.5?'#2a1c12':'#000000',.35);
 for(let i=0;i<900;i++){x.strokeStyle=`rgba(${R()<.5?'90,64,40':'0,0,0'},${.05+R()*.12})`;x.lineWidth=.5+R();const px=R()*S,py=R()*S,a=(R()-.5)*.6;x.beginPath();x.moveTo(px,py);x.lineTo(px+Math.cos(a)*(4+R()*16),py+Math.sin(a)*(2+R()*6));x.stroke()}return cv.toDataURL('image/jpeg',.8)}
function moteURL(f){const S=128,cv=mkc(S,S),x=cv.getContext('2d'),R=rng(hash('mote'+f)),P=PAL[f];/* v7.4: wraps at the edges so the drifting tile is seamless; a few warm embers among the faction motes */
 for(let i=0;i<12;i++){const px=R()*S,py=R()*S,r=1.2+R()*2.8,col=R()<.25?'#ffb060':R()<.6?P.a:P.g;for(const dx of[-S,0,S])for(const dy of[-S,0,S]){const X=px+dx,Y=py+dy;if(X<-r*4||X>S+r*4||Y<-r*4||Y>S+r*4)continue;glow(x,X,Y,r*3.5,col,.55);x.fillStyle='rgba(255,250,235,.85)';x.beginPath();x.arc(X,Y,r*.45,0,7);x.fill()}}return cv.toDataURL()}
/* Hollow Stars. RENDERING RULES: read /RENDERING_RULES.md before changing card visuals, animations, video or art.
   (transform/opacity only, no blend modes or animated filters, no class toggling mid-animation or DOM rebuilds, video rules,
   layer budget, image sizes, text auto-fit; new cards must pass tests/cardcheck.py, tests/paintprobe.py and tests/flicker.py) */
/* ===== ART v5: detailed horror portraits ===== */
const LT={m8:[.75,-.05,1.3],v18:[.6,.1,1.6],v16:[.85,0,1.5],v8:[.8,-.1,1.25],c18:[.3,0,1.2],n6:[.9,-.1,1.3],m23:[.9,-.1,1.2]};// painter -> [lightX, lightY, exposure]
const lerp=(a,b,t)=>a+(b-a)*t;
function P2(x,p){x.beginPath();p.forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b));x.closePath()}
function SM(x,p){const n=p.length;x.beginPath();x.moveTo((p[n-1][0]+p[0][0])/2,(p[n-1][1]+p[0][1])/2);for(let i=0;i<n;i++){const q=p[(i+1)%n];x.quadraticCurveTo(p[i][0],p[i][1],(p[i][0]+q[0])/2,(p[i][1]+q[1])/2)}x.closePath()}
function LGr(x,x0,y0,x1,y1,s){const g=x.createLinearGradient(x0,y0,x1,y1);s.forEach((c,i)=>g.addColorStop(i/(s.length-1),c));return g}
function RG(x,cx,cy,r0,r1,s,ox=0,oy=0){const g=x.createRadialGradient(cx+ox,cy+oy,r0,cx,cy,r1);s.forEach((c,i)=>g.addColorStop(i/(s.length-1),c));return g}
function ring(cx,cy,rx,ry,n,R,k=.15,a0=0){const p=[];for(let i=0;i<n;i++){const a=a0+i/n*TAU,r=1-k/2+R()*k;p.push([cx+Math.cos(a)*rx*r,cy+Math.sin(a)*ry*r])}return p}
function speck(x,R,x0,y0,w,h,n,cols,sz=2){for(let i=0;i<n;i++){x.fillStyle=cols[Math.floor(R()*cols.length)];const s=.5+R()*sz;x.fillRect(x0+R()*w,y0+R()*h,s,s*(.5+R()))}}
function wet(x,R,cx,cy,rx,ry,n,a=.55){x.save();x.globalCompositeOperation='lighter';for(let i=0;i<n;i++){const px=cx+(R()-.5)*rx*2,py=cy+(R()-.5)*ry*2,l=1+R()*4;x.fillStyle=`rgba(255,235,225,${a*(.3+R()*.7)})`;x.beginPath();x.ellipse(px,py,l,l*.35,-.6+(R()-.5)*.6,0,TAU);x.fill()}x.restore()}
function veins(x,R,cx,cy,r,n,col,w=1){x.strokeStyle=col;for(let i=0;i<n;i++){let px=cx+(R()-.5)*r*2,py=cy+(R()-.5)*r*2,a=R()*TAU;x.lineWidth=w*(.5+R());x.beginPath();x.moveTo(px,py);for(let j=0;j<6;j++){a+=(R()-.5)*1.2;const l=r*.12*(1+R());px+=Math.cos(a)*l;py+=Math.sin(a)*l;x.lineTo(px,py);if(R()<.3){x.moveTo(px,py)}}x.stroke()}}
function drips(x,R,x0,x1,y,len,n,col='#7a0610'){for(let i=0;i<n;i++){const dx=lerp(x0,x1,R()),l=len*(.3+R()*.9),w=.8+R()*2.4;x.fillStyle=col;x.beginPath();x.moveTo(dx-w,y);x.lineTo(dx+w,y);x.lineTo(dx+w*.5,y+l);x.arc(dx,y+l,w*.75,0,Math.PI);x.lineTo(dx-w*.5,y+l);x.fill();x.fillStyle='rgba(255,170,170,.35)';x.fillRect(dx-w*.3,y,.7,l*.8)}}
function splat(x,R,cx,cy,r,col='#5a0008'){x.fillStyle=col;SM(x,ring(cx,cy,r,r*.55,14,R,.7));x.fill();for(let i=0;i<10;i++){const a=R()*TAU,d=r*(1+R()*.9);x.beginPath();x.arc(cx+Math.cos(a)*d,cy+Math.sin(a)*d*.55,r*.05+R()*r*.1,0,TAU);x.fill()}}
function fang(x,bx,by,tx,ty,w,col='#e0d4b8'){const nx=-(ty-by),ny=tx-bx,l=Math.hypot(nx,ny)||1,ux=nx/l*w/2,uy=ny/l*w/2;const g=x.createLinearGradient(bx-ux,by-uy,bx+ux,by+uy);g.addColorStop(0,'#4a3a2a');g.addColorStop(.35,col);g.addColorStop(1,'#6a5a44');x.fillStyle=g;x.beginPath();x.moveTo(bx-ux,by-uy);x.quadraticCurveTo((bx+tx)/2-ux*.6+ux*.5,(by+ty)/2-uy*.6,tx,ty);x.quadraticCurveTo((bx+tx)/2+ux*.6,(by+ty)/2+uy*.6,bx+ux,by+uy);x.closePath();x.fill();x.strokeStyle='rgba(30,10,5,.6)';x.lineWidth=.5;x.stroke()}
function cable(x,x0,y0,x1,y1,sag,w,col='#15191b',hi='rgba(160,170,170,.35)'){x.lineCap='round';x.strokeStyle=col;x.lineWidth=w;x.beginPath();x.moveTo(x0,y0);x.quadraticCurveTo((x0+x1)/2,(y0+y1)/2+sag,x1,y1);x.stroke();x.strokeStyle=hi;x.lineWidth=Math.max(.5,w*.25);x.beginPath();x.moveTo(x0,y0-w*.25);x.quadraticCurveTo((x0+x1)/2,(y0+y1)/2+sag-w*.25,x1,y1-w*.25);x.stroke();x.lineCap='butt'}
function candle(x,R,cx,by,h,w=3){x.fillStyle=LGr(x,cx-w,0,cx+w,0,['#5a4a36','#d8c8a4','#6a5a40']);x.fillRect(cx-w,by-h,w*2,h);x.fillStyle='#e8dcc0';for(let i=0;i<3;i++){const dx=cx-w+R()*w*2;x.fillRect(dx,by-h,1.2,2+R()*h*.4)}glow(x,cx,by-h-4,16+w*3,'#ff9a30',.55);x.fillStyle='#fff2c0';x.beginPath();x.moveTo(cx,by-h-w*3);x.quadraticCurveTo(cx+w*.9,by-h-w,cx,by-h);x.quadraticCurveTo(cx-w*.9,by-h-w,cx,by-h-w*3);x.fill()}
function skull(x,cx,cy,s,R,rot=0,col='#c8bca0'){x.save();x.translate(cx,cy);x.rotate(rot);x.fillStyle=RG(x,0,0,s*.1,s,[col,'#6a5e48','#1a140c'],-s*.3,-s*.4);x.beginPath();x.ellipse(0,-s*.1,s*.8,s*.75,0,0,TAU);x.fill();x.fillRect(-s*.45,s*.3,s*.9,s*.45);x.fillStyle='#050302';for(const k of[-1,1]){x.beginPath();x.ellipse(k*s*.32,s*.02,s*.22,s*.25,k*.2,0,TAU);x.fill()}x.beginPath();x.moveTo(0,s*.25);x.lineTo(-s*.09,s*.42);x.lineTo(s*.09,s*.42);x.fill();x.strokeStyle='#050302';x.lineWidth=s*.05;for(let i=-3;i<=3;i++){x.beginPath();x.moveTo(i*s*.12,s*.55);x.lineTo(i*s*.12,s*.75);x.stroke()}x.restore()}
function face(x,R,cx,cy,s,o={}){// agonised human face, s = half-height
 const sk=o.skin||'#b09888',hol=o.hollow;x.save();x.translate(cx,cy);x.rotate(o.rot||0);const as=(R()-.5)*.08;
 const hd=[[0,-s],[s*.58,-s*.84],[s*.7,-s*.3],[s*.64,s*.2],[s*.46,s*.66],[s*.16,s*.96],[-s*.16,s*.96],[-s*.46,s*.66],[-s*.64,s*.2],[-s*.7,-s*.3],[-s*.58,-s*.84]];
 x.fillStyle=RG(x,0,0,s*.05,s*1.15,['#f0e0d0',sk,'#4a3430','#0c0606'],-s*.3,-s*.45);SM(x,hd);x.fill();x.save();SM(x,hd);x.clip();
 const dk=(px,py,rx,ry,a)=>{x.fillStyle=RG(x,px,py,0,Math.max(rx,ry),[`rgba(0,0,0,${a})`,`rgba(0,0,0,${a*.6})`,'rgba(0,0,0,0)']);x.beginPath();x.ellipse(px,py,rx,ry,0,0,TAU);x.fill()};
 for(const k of[-1,1]){dk(k*s*.45,s*.32,s*.25,s*.32,.45);dk(k*s*(.27+as),-s*.2,s*.25,hol?s*.24:s*.18,hol?1:.85)}
 dk(0,s*.98,s*.6,s*.3,.6);
 x.fillStyle='rgba(255,240,225,.16)';x.beginPath();x.ellipse(-s*.12,-s*.62,s*.32,s*.14,-.2,0,TAU);x.fill();
 x.strokeStyle='rgba(255,235,220,.22)';x.lineWidth=s*.04;for(const k of[-1,1]){x.beginPath();x.moveTo(k*s*.08,-s*.4);x.quadraticCurveTo(k*s*.3,-s*.48+(o.brow||0),k*s*.5,-s*.34);x.stroke()}
 x.fillStyle='rgba(0,0,0,.45)';x.beginPath();x.moveTo(s*.02,-s*.28);x.lineTo(s*.12,s*.12);x.lineTo(s*.02,s*.14);x.fill();x.strokeStyle='rgba(255,235,220,.3)';x.lineWidth=s*.035;x.beginPath();x.moveTo(-s*.02,-s*.3);x.lineTo(-s*.04,s*.08);x.stroke();
 x.fillStyle='rgba(0,0,0,.7)';for(const k of[-1,1]){x.beginPath();x.ellipse(k*s*.06,s*.14,s*.04,s*.022,0,0,TAU);x.fill()}
 x.strokeStyle='rgba(30,10,8,.4)';x.lineWidth=s*.022;for(const k of[-1,1]){x.beginPath();x.moveTo(k*s*.14,s*.12);x.quadraticCurveTo(k*s*.3,s*.36,k*s*.26,s*.62);x.stroke()}for(let i=0;i<3;i++){x.beginPath();x.moveTo(-s*.25,-s*.66+i*s*.07);x.quadraticCurveTo(0,-s*.7+i*s*.07,s*.25,-s*.66+i*s*.07);x.stroke()}
 const mo=o.mouth??.9,my=s*.5;x.fillStyle=RG(x,0,my,0,s*.25,['#000','#1a0404','#3a1210']);x.beginPath();x.ellipse(0,my,s*(.16+mo*.06),s*(.04+.24*mo),0,0,TAU);x.fill();
 if(mo>.35){x.fillStyle='rgba(220,205,180,.85)';for(let i=-2;i<=2;i++)x.fillRect(i*s*.055-s*.022,my-s*(.04+.24*mo)+s*.01,s*.045,s*.05);x.fillStyle='rgba(110,30,35,.8)';x.beginPath();x.ellipse(0,my+s*.15*mo,s*.09,s*.05,0,0,TAU);x.fill()}
 x.strokeStyle='rgba(90,40,38,.7)';x.lineWidth=s*.035;x.beginPath();x.ellipse(0,my,s*(.17+mo*.06),s*(.05+.24*mo),0,.2,Math.PI-.2);x.stroke();
 speck(x,R,-s*.7,-s,s*1.4,s*2,s*s*.15,['rgba(0,0,0,.18)','rgba(120,60,50,.15)','rgba(255,240,230,.08)'],1.4);
 if(o.rot2)0;x.restore();
 for(const k of[-1,1]){const ex=k*s*(.27+as),ey=-s*.2;if(!hol){x.fillStyle='#c8b8a8';x.beginPath();x.ellipse(ex,ey,s*.1,s*.05,0,0,TAU);x.fill();x.fillStyle=o.eye||'#2a1a14';x.beginPath();x.arc(ex+(o.look||0)*s*.03,ey,s*.045,0,TAU);x.fill();x.fillStyle='rgba(255,255,255,.85)';x.fillRect(ex-s*.02,ey-s*.025,s*.02,s*.02)}else if(o.glow){glow(x,ex,ey,s*.16,o.glow,.85);x.fillStyle=o.glow;x.beginPath();x.arc(ex,ey,s*.025,0,TAU);x.fill()}}
 if(o.blood){x.fillStyle='rgba(110,0,10,.9)';for(const k of[-1,1]){x.beginPath();x.moveTo(k*s*.3,-s*.14);x.quadraticCurveTo(k*s*.36,s*.2,k*s*.3,s*.7);x.lineTo(k*s*.27,s*.7);x.quadraticCurveTo(k*s*.31,s*.2,k*s*.24,-s*.14);x.fill()}x.beginPath();x.moveTo(s*.12,my);x.quadraticCurveTo(s*.16,my+s*.3,s*.12,s*.95);x.lineTo(s*.09,s*.95);x.quadraticCurveTo(s*.12,my+s*.3,s*.08,my);x.fill()}
 x.restore()}
function mawRing(x,R,cx,cy,rx,ry,rows,o={}){// irregular toothed throat (lamprey-like)
 x.fillStyle=RG(x,cx,cy,0,Math.max(rx,ry),[o.core||'#ff3040','#3a0010','#1a0408',o.gum||'#7a2a3a','#2a0a12']);SM(x,ring(cx,cy,rx,ry,18,R,.12));x.fill();
 for(let q=0;q<40;q++){const a=R()*TAU,d=.3+R()*.65;x.strokeStyle='rgba(0,0,0,.3)';x.lineWidth=1;x.beginPath();x.arc(cx+Math.cos(a)*rx*d,cy+Math.sin(a)*ry*d,rx*.05,a,a+2);x.stroke()}
 for(let k=0;k<rows;k++){const t=.32+.68*(k+1)/rows,rrx=rx*t,rry=ry*t,n=Math.round((o.n||18)*1.7*(.55+t*.45)),bw=TAU*rrx/n;
  for(let i=0;i<n;i++){if(R()<.12)continue;const a=i/n*TAU+(k%2)*Math.PI/n+(R()-.5)*.2,rr=1+(R()-.5)*.08,bx=cx+Math.cos(a)*rrx*rr,by=cy+Math.sin(a)*rry*rr,w=bw*(.4+R()*.3),l=w*(1.2+R()*1.1)*(R()<.12?1.8:1),ja=a+Math.PI+(R()-.5)*.35,tx=bx+Math.cos(ja)*l,ty=by+Math.sin(ja)*l*(ry/rx);
   x.fillStyle='rgba(0,0,0,.45)';x.beginPath();x.ellipse(lerp(bx,tx,.6),lerp(by,ty,.6)+1.5,w*.4,l*.3,ja,0,TAU);x.fill();
   fang(x,bx,by,tx,ty,w,k===rows-1?(o.tc||'#d8ccb0'):k===rows-2?'#a89c80':'#6a5e4a')}}
 x.fillStyle=RG(x,cx,cy,0,rx*.3,['#000','#000',o.core?hexA(o.core,.0):'rgba(255,40,60,0)']);x.beginPath();x.ellipse(cx,cy,rx*.26,ry*.26,0,0,TAU);x.fill();glow(x,cx,cy,rx*.22,o.core||'#ff3040',.35);
 wet(x,R,cx,cy,rx*.9,ry*.9,o.w??24,.55)}
function hand(x,R,cx,cy,s,ang,o={}){x.save();x.translate(cx,cy);x.rotate(ang);const sk=o.flay?'#8a1a1a':o.skin||'#a89080';
 x.fillStyle=LGr(x,-s*.4,0,s*.4,0,['#2a1410',sk,'#3a2018']);x.beginPath();x.moveTo(-s*.35,s*.9);x.lineTo(-s*.4,0);x.lineTo(s*.4,0);x.lineTo(s*.32,s*.9);x.fill();
 x.beginPath();x.ellipse(0,0,s*.42,s*.36,0,0,TAU);x.fill();
 const sp=o.spread??1;for(let i=0;i<5;i++){const t=i/4-.5,a=-Math.PI/2+t*1.3*sp+(i===0?-.5:0),l=s*(i===0?.55:i===2?.95:.8)*(o.claw?1.3:1);const bx=t*s*.6,by=-s*.2;x.strokeStyle=sk;x.lineCap='round';x.lineWidth=s*.16;x.beginPath();x.moveTo(bx,by);const mx=bx+Math.cos(a)*l*.55,my=by+Math.sin(a)*l*.55;x.lineTo(mx,my);x.lineTo(mx+Math.cos(a+(o.curl||0))*l*.45,my+Math.sin(a+(o.curl||0))*l*.45);x.stroke();
  if(o.claw){x.fillStyle='#1a1410';x.beginPath();const ex=mx+Math.cos(a+(o.curl||0))*l*.45,ey=my+Math.sin(a+(o.curl||0))*l*.45;x.moveTo(ex-2,ey);x.lineTo(ex+Math.cos(a)*s*.25,ey+Math.sin(a)*s*.25);x.lineTo(ex+2,ey);x.fill()}}
 x.lineCap='butt';if(o.flay){x.strokeStyle='rgba(255,140,120,.35)';x.lineWidth=.6;for(let i=0;i<14;i++){x.beginPath();const px=(R()-.5)*s*.7,py=(R()-.2)*s;x.moveTo(px,py);x.lineTo(px+(R()-.5)*3,py-s*.3);x.stroke()}x.fillStyle='rgba(230,210,180,.5)';for(let i=0;i<4;i++)x.fillRect((R()-.5)*s*.5,R()*s*.6,s*.12,1.2)}
 x.restore()}
function maggots(x,R,cx,cy,r,n){for(let i=0;i<n;i++){const px=cx+(R()-.5)*r*2,py=cy+(R()-.5)*r*2,a=R()*TAU,l=1.6+R()*2.2;x.fillStyle=R()<.5?'#e8e0c0':'#c8bc98';x.beginPath();x.ellipse(px,py,l,l*.42,a,0,TAU);x.fill()}}
function flesh2(x,R,cx,cy,rx,ry,o={}){// lumpy wet flesh mass
 const c1=o.c1||'#8a2a2a',c2=o.c2||'#3a0a0e';const n=o.n||28;
 x.fillStyle=RG(x,cx,cy,rx*.1,Math.max(rx,ry)*1.1,[c1,c2,'#0a0203'],-rx*.25,-ry*.35);SM(x,ring(cx,cy,rx,ry,22,R,.35));x.fill();
 for(let i=0;i<n;i++){const a=R()*TAU,d=Math.sqrt(R())*.85,bx=cx+Math.cos(a)*rx*d,by=cy+Math.sin(a)*ry*d,r=Math.min(rx,ry)*(.12+R()*.22);x.fillStyle=RG(x,bx,by,r*.1,r,[o.c3||'#b0504a',c1,'rgba(20,0,0,.0)'],-r*.35,-r*.4);x.beginPath();x.ellipse(bx,by,r,r*(.7+R()*.4),R()*3,0,TAU);x.fill();
  x.strokeStyle='rgba(20,0,0,.55)';x.lineWidth=.8;x.beginPath();x.arc(bx,by+r*.2,r*.8,.3,2.8);x.stroke()}
 veins(x,R,cx,cy,Math.min(rx,ry)*.9,o.v??10,'rgba(60,10,40,.6)',1);wet(x,R,cx-rx*.15,cy-ry*.2,rx*.7,ry*.6,o.w??26,.6)}
function lips(x,R,cx,cy,w,h,o={}){// a human mouth (o.open 0..1)
 const op=o.open??.7;x.save();x.translate(cx,cy);x.rotate(o.rot||0);
 x.fillStyle='#0c0102';x.beginPath();x.ellipse(0,0,w*.9,h*op+1,0,0,TAU);x.fill();
 if(op>.2){const tw=w*1.6/7;for(let i=0;i<7;i++){const tx=-w*.8+i*tw,ty=-h*op*.95;x.fillStyle=LGr(x,0,ty,0,ty+h*.35,['#efe4c8','#a89878']);x.beginPath();x.roundRect?x.roundRect(tx+.4,ty,tw-.8,h*.38,1):x.rect(tx+.4,ty,tw-.8,h*.38);x.fill();x.beginPath();x.roundRect?x.roundRect(tx+.4,h*op*.95-h*.32,tw-.8,h*.32,1):x.rect(tx+.4,h*op*.95-h*.32,tw-.8,h*.32);x.fill()}
  x.fillStyle='rgba(140,30,40,.9)';x.beginPath();x.ellipse(0,h*op*.35,w*.45,h*op*.35,0,0,TAU);x.fill()}
 const lg=LGr(x,0,-h*1.5,0,h*1.5,['#d07068','#8a2a30','#4a0a12']);x.fillStyle=lg;
 x.beginPath();x.moveTo(-w,0);x.bezierCurveTo(-w*.6,-h*op-h*.9,-w*.15,-h*op-h*.7,0,-h*op-h*.45);x.bezierCurveTo(w*.15,-h*op-h*.7,w*.6,-h*op-h*.9,w,0);x.bezierCurveTo(w*.6,-h*op-h*.1,-w*.6,-h*op-h*.1,-w,0);x.fill();
 x.beginPath();x.moveTo(-w,0);x.bezierCurveTo(-w*.6,h*op+h*.2,w*.6,h*op+h*.2,w,0);x.bezierCurveTo(w*.6,h*op+h*1.1,-w*.6,h*op+h*1.1,-w,0);x.fill();
 x.fillStyle='rgba(255,220,210,.55)';x.beginPath();x.ellipse(-w*.2,h*op+h*.62,w*.22,h*.12,0,0,TAU);x.fill();x.beginPath();x.ellipse(w*.3,-h*op-h*.55,w*.15,h*.08,0,0,TAU);x.fill();
 x.restore()}
function robe(x,R,P,cx,by,h,o={}){// robed cultist, h = height from base to hood top
 const s=h/2.4,ty=by-h,hc=o.hood||'#1a0608',sw=s*(o.wide||1);
 // robe body
 const body=[[cx-sw*1.25,by+4],[cx-sw*.95,by-h*.35],[cx-sw*.72,by-h*.62],[cx-sw*.55,by-h*.75],[cx,by-h*.8],[cx+sw*.55,by-h*.75],[cx+sw*.72,by-h*.62],[cx+sw*.95,by-h*.35],[cx+sw*1.25,by+4]];
 x.fillStyle=LGr(x,cx-sw,0,cx+sw,0,['#060102',o.cloth||'#3a0c10','#120304','#2a080a','#050102']);P2(x,body);x.fill();
 // folds
 for(let i=0;i<9;i++){const fx=cx+(i/8-.5)*sw*1.9,top=by-h*(.45+R()*.25);x.strokeStyle='rgba(0,0,0,.6)';x.lineWidth=1.5+R()*2;x.beginPath();x.moveTo(lerp(cx,fx,.6),top);x.quadraticCurveTo(fx+(R()-.5)*8,lerp(top,by,.5),fx*1+(fx-cx)*.25,by+4);x.stroke();x.strokeStyle='rgba(200,120,110,.12)';x.lineWidth=.8;x.beginPath();x.moveTo(lerp(cx,fx,.6)+2,top);x.quadraticCurveTo(fx+3,lerp(top,by,.5),fx+(fx-cx)*.25+3,by+4);x.stroke()}
 if(o.stole!==0){for(const k of[-1,1]){x.fillStyle=LGr(x,cx+k*sw*.16,0,cx+k*sw*.32,0,['#0a0202',o.stole||'#6a1a12','#120404']);x.beginPath();x.moveTo(cx+k*sw*.14,by-h*.78);x.lineTo(cx+k*sw*.3,by-h*.75);x.lineTo(cx+k*sw*.26,by+4);x.lineTo(cx+k*sw*.12,by+4);x.fill()}x.strokeStyle='rgba(220,170,90,.5)';x.lineWidth=.7;for(let j=0;j<8;j++){const yy=by-h*.7+j*h*.09;for(const k of[-1,1]){x.beginPath();x.arc(cx+k*sw*.21,yy,1.4,0,TAU);x.stroke()}}}
 x.strokeStyle='#2a1a10';x.lineWidth=2;x.beginPath();x.moveTo(cx-sw*.75,by-h*.42);x.quadraticCurveTo(cx,by-h*.36,cx+sw*.75,by-h*.42);x.stroke();
 if(o.stain)splat(x,R,cx+(R()-.5)*sw*.6,by-h*.3,sw*.35,'rgba(80,0,8,.85)');
 // hood / head
 const hy=by-h*.8;const head=o.mitre?[[cx-s*.4,hy],[cx-s*.45,ty+s*.6],[cx,ty-s*.35],[cx+s*.45,ty+s*.6],[cx+s*.4,hy]]:[[cx-s*.55,hy+s*.1],[cx-s*.5,ty+s*.6],[cx-s*.25,ty+s*.05],[cx+s*.05,ty-s*.1],[cx+s*.4,ty+s*.25],[cx+s*.55,hy+s*.1]];
 x.fillStyle=LGr(x,cx-s*.5,ty,cx+s*.5,hy,[hc,'#050102']);SM(x,head);x.fill();
 if(o.mitre){x.strokeStyle='rgba(210,160,80,.7)';x.lineWidth=1;x.beginPath();x.moveTo(cx,ty-s*.3);x.lineTo(cx,hy-s*.6);x.stroke();for(let i=0;i<4;i++){x.beginPath();x.arc(cx,ty+s*.15+i*s*.18,s*.05,0,TAU);x.stroke()}}
 // face
 const fy=ty+s*(o.mitre?.95:.75);x.fillStyle='#020001';x.beginPath();x.ellipse(cx+s*.02,fy,s*.28,s*.36,0,0,TAU);x.fill();
 if(o.face==='skull')skull(x,cx,fy+s*.05,s*.24,R);
 else if(o.face==='flay'){face(x,R,cx,fy+s*.04,s*.3,{skin:'#8a2a24',mouth:o.mouth??.7,hollow:1,glow:o.eyeC||P.a,blood:1})}
 else if(o.face==='mask'){x.fillStyle=LGr(x,cx-s*.25,fy-s*.3,cx+s*.25,fy+s*.3,['#c8a050','#7a5a20','#2a1a08']);SM(x,[[cx,fy-s*.32],[cx+s*.24,fy-s*.15],[cx+s*.2,fy+s*.2],[cx,fy+s*.36],[cx-s*.2,fy+s*.2],[cx-s*.24,fy-s*.15]]);x.fill();x.fillStyle='#000';for(const k of[-1,1]){x.beginPath();x.ellipse(cx+k*s*.1,fy-s*.05,s*.06,s*.03,k*.3,0,TAU);x.fill()}glow(x,cx-s*.1,fy-s*.05,4,o.eyeC||P.a,.9);glow(x,cx+s*.1,fy-s*.05,4,o.eyeC||P.a,.9);x.fillRect(cx-s*.08,fy+s*.15,s*.16,1.5);x.strokeStyle='rgba(40,20,5,.7)';x.lineWidth=.7;x.beginPath();x.moveTo(cx,fy-s*.32);x.lineTo(cx,fy+s*.1);x.moveTo(cx-s*.2,fy-s*.15);x.quadraticCurveTo(cx,fy-s*.22,cx+s*.2,fy-s*.15);x.stroke();x.strokeStyle='rgba(255,230,160,.35)';x.beginPath();x.moveTo(cx-s*.05,fy+s*.05);x.lineTo(cx+s*.08,fy+s*.3);x.stroke();drips(x,R,cx-s*.12,cx+s*.12,fy+s*.02,s*.35,2,'rgba(120,0,10,.9)')}
 else if(o.face==='face')face(x,R,cx,fy+s*.04,s*.28,{mouth:o.mouth??.3,skin:o.skin||'#a08878',hollow:o.hollow,glow:o.eyeC});
 else{for(const k of[-1,1]){glow(x,cx+k*s*.1,fy-s*.04,s*.14,o.eyeC||P.a,.95);x.fillStyle='#fff';x.fillRect(cx+k*s*.1-1,fy-s*.04-.5,2,1)}}
 // arms
 const sh=[[cx-sw*.6,by-h*.66],[cx+sw*.6,by-h*.66]];const arm=(sx,sy,ex,ey,w)=>{x.strokeStyle='#0a0203';x.lineWidth=w;x.lineCap='round';x.beginPath();x.moveTo(sx,sy);x.quadraticCurveTo((sx+ex)/2+(ex-sx)*.1,(sy+ey)/2+w,ex,ey);x.stroke();x.strokeStyle='rgba(200,110,100,.14)';x.lineWidth=1;x.stroke();x.lineCap='butt'};
 const A=o.arms||'none';const hs=s*.32,hf={flay:o.flay,claw:o.claw,skin:o.skin};
 if(A==='raise'){arm(sh[0][0],sh[0][1],cx-sw*1.1,ty+s*.1,s*.32);arm(sh[1][0],sh[1][1],cx+sw*1.1,ty+s*.1,s*.32);hand(x,R,cx-sw*1.1,ty,hs,-.3,hf);hand(x,R,cx+sw*1.1,ty,hs,.3,hf)}
 else if(A==='knife'){arm(sh[1][0],sh[1][1],cx+sw*.95,ty-s*.2,s*.32);hand(x,R,cx+sw*.95,ty-s*.25,hs,.2,{...hf,spread:.3,curl:1.4});dagger(x,cx+sw*.95,ty-s*.35,s*1.1,-.15);arm(sh[0][0],sh[0][1],cx-sw*.4,by-h*.45,s*.3);hand(x,R,cx-sw*.4,by-h*.47,hs*.9,-2.4,{...hf,spread:.6})}
 else if(A==='offer'){arm(sh[0][0],sh[0][1],cx-sw*.35,by-h*.42,s*.3);arm(sh[1][0],sh[1][1],cx+sw*.35,by-h*.42,s*.3);hand(x,R,cx-sw*.3,by-h*.44,hs,-1.9,hf);hand(x,R,cx+sw*.3,by-h*.44,hs,1.9,hf)}
 else if(A==='spread'){arm(sh[0][0],sh[0][1],cx-sw*1.5,by-h*.62,s*.3);arm(sh[1][0],sh[1][1],cx+sw*1.5,by-h*.62,s*.3);hand(x,R,cx-sw*1.55,by-h*.64,hs,-1.3,hf);hand(x,R,cx+sw*1.55,by-h*.64,hs,1.3,hf)}
 else if(A==='staff'){x.fillStyle=LGr(x,cx+sw*.9,0,cx+sw*.9+4,0,['#3a2a18','#8a6a3a','#2a1a0a']);x.fillRect(cx+sw*.9,ty-s*.6,4,h+s*.6);x.strokeStyle='#8a6a3a';x.lineWidth=2;x.beginPath();x.arc(cx+sw*.9+2,ty-s*.6,s*.25,Math.PI*.9,Math.PI*2.4);x.stroke();arm(sh[1][0],sh[1][1],cx+sw*.9,by-h*.55,s*.3);hand(x,R,cx+sw*.9+2,by-h*.57,hs,.6,{...hf,spread:.4,curl:1.5})}
 return{fy,hy,ty,s}}
function dagger(x,cx,cy,l,a){x.save();x.translate(cx,cy);x.rotate(a);x.fillStyle=LGr(x,-l*.06,0,l*.06,0,['#3a3632','#f0e8d8','#5a524a']);x.beginPath();x.moveTo(0,-l*.75);x.quadraticCurveTo(l*.09,-l*.35,l*.05,0);x.lineTo(-l*.05,0);x.quadraticCurveTo(-l*.09,-l*.35,0,-l*.75);x.fill();x.fillStyle='rgba(110,0,10,.85)';x.beginPath();x.moveTo(-l*.04,-l*.3);x.quadraticCurveTo(0,-l*.12,l*.045,-l*.25);x.lineTo(l*.05,0);x.lineTo(-l*.05,0);x.fill();
 x.fillStyle='#8a6a2a';x.fillRect(-l*.16,0,l*.32,l*.05);x.fillStyle='#1a100a';x.fillRect(-l*.035,l*.05,l*.07,l*.25);x.fillStyle='#c8a050';x.beginPath();x.arc(0,l*.32,l*.045,0,TAU);x.fill();x.save();x.globalCompositeOperation='lighter';x.fillStyle='rgba(255,255,255,.6)';x.fillRect(-.5,-l*.7,1,l*.6);x.restore();x.restore()}
function suit(x,R,P,cx,by,s,o={}){// spacesuit bust, s = helmet radius
 const hy=by-s*2.1;// helmet centre
 // shoulders/torso
 x.fillStyle=LGr(x,0,hy+s*.6,0,by,[o.suitC||'#4a4c4a','#1e2020','#060707']);x.beginPath();x.moveTo(cx-s*2.4,by+6);x.bezierCurveTo(cx-s*2.4,hy+s*1.4,cx-s*1.6,hy+s*.9,cx,hy+s*.85);x.bezierCurveTo(cx+s*1.6,hy+s*.9,cx+s*2.4,hy+s*1.4,cx+s*2.4,by+6);x.fill();
 for(const k of[-1,1]){x.fillStyle=RG(x,cx+k*s*1.55,hy+s*1.35,s*.1,s*.95,['#7a7c78','#2a2c2a','#080808'],-k*s*.2,-s*.3);x.beginPath();x.ellipse(cx+k*s*1.55,hy+s*1.4,s*.95,s*.62,k*.35,0,TAU);x.fill();x.strokeStyle='rgba(0,0,0,.6)';x.lineWidth=1;for(let j=1;j<3;j++){x.beginPath();x.ellipse(cx+k*s*1.55,hy+s*1.4,s*.95*j/3,s*.62*j/3,k*.35,0,TAU);x.stroke()}}
 // chest plate
 x.fillStyle=LGr(x,cx-s,0,cx+s,0,['#2a2c2a','#5a5c58','#1a1c1a']);P2(x,[[cx-s*.95,hy+s*1.1],[cx+s*.95,hy+s*1.1],[cx+s*.8,by-s*.2],[cx-s*.8,by-s*.2]]);x.fill();x.strokeStyle='rgba(0,0,0,.7)';x.lineWidth=.8;x.stroke();
 for(let i=0;i<5;i++){const lx=cx-s*.6+i*s*.3;x.fillStyle=R()<.5?hexA(o.lc||P.a,.9):'#ff3020';x.fillRect(lx,hy+s*1.35,s*.12,s*.06);glow(x,lx,hy+s*1.38,4,o.lc||P.a,.3)}
 x.fillStyle='#b8901e';x.fillRect(cx-s*.7,hy+s*1.7,s*.5,s*.12);x.fillStyle='#d8d0c0';x.fillRect(cx+s*.15,hy+s*1.7,s*.5,s*.12);x.fillStyle='#000';for(let i=0;i<5;i++)x.fillRect(cx+s*.2+i*s*.09,hy+s*1.72,s*.05,s*.08);
 speck(x,R,cx-s*2.2,hy+s,s*4.4,by-hy-s,120,['rgba(0,0,0,.35)','rgba(90,60,30,.25)','rgba(200,200,190,.12)'],2.5);
 // hoses
 for(const k of[-1,1])cable(x,cx+k*s*.7,hy+s*1.25,cx+k*s*1.3,hy+s*.4,s*.6,s*.22,'#141616');
 // neck ring
 x.fillStyle=LGr(x,cx-s,0,cx+s,0,['#2a2a28','#9a9a90','#2a2a28']);x.beginPath();x.ellipse(cx,hy+s*.85,s*1.05,s*.28,0,0,TAU);x.fill();
 // helmet shell
 x.fillStyle=RG(x,cx,hy,s*.1,s*1.15,[o.helmC||'#a8aaa4','#4a4c48','#0c0c0c'],-s*.35,-s*.45);x.beginPath();x.arc(cx,hy,s*1.08,0,TAU);x.fill();
 if(o.lamp!==0){x.fillStyle='#222';x.fillRect(cx+s*.65,hy-s*.95,s*.35,s*.22);glow(x,cx+s*.85,hy-s*.85,s*.8,'#fff0d0',.5)}
 // visor
 const vg=x.createLinearGradient(cx-s,hy-s,cx+s,hy+s);vg.addColorStop(0,o.visor||'#1a1a2a');vg.addColorStop(.5,'#030306');vg.addColorStop(1,'#000');x.fillStyle=vg;x.beginPath();x.ellipse(cx,hy+s*.05,s*.82,s*.68,0,0,TAU);x.fill();
 x.save();x.beginPath();x.ellipse(cx,hy+s*.05,s*.82,s*.68,0,0,TAU);x.clip();
 if(o.inside)o.inside(x,cx,hy+s*.05,s);
 // reflection
 x.globalCompositeOperation='lighter';x.fillStyle='rgba(180,200,220,.18)';x.beginPath();x.ellipse(cx-s*.35,hy-s*.3,s*.45,s*.16,-.5,0,TAU);x.fill();x.strokeStyle='rgba(220,230,255,.35)';x.lineWidth=1;x.beginPath();x.arc(cx,hy+s*.05,s*.74,3.6,4.6);x.stroke();glow(x,cx+s*.4,hy-s*.25,s*.15,'#ffffff',.5);x.restore();
 if(o.crack){x.strokeStyle='rgba(230,240,255,.7)';x.lineWidth=.7;const ox=cx+s*.25,oy=hy-s*.1;for(let i=0;i<7;i++){let px=ox,py=oy,a=R()*TAU;x.beginPath();x.moveTo(px,py);for(let j=0;j<4;j++){a+=(R()-.5)*.7;px+=Math.cos(a)*s*.18;py+=Math.sin(a)*s*.18;x.lineTo(px,py)}x.stroke()}}
 x.strokeStyle='rgba(0,0,0,.8)';x.lineWidth=2;x.beginPath();x.ellipse(cx,hy+s*.05,s*.84,s*.7,0,0,TAU);x.stroke();
 if(o.blood){splat(x,R,cx-s*.6,hy+s*.5,s*.35,'rgba(90,0,8,.9)');drips(x,R,cx-s*.8,cx-s*.3,hy+s*.6,s*.9,4,'rgba(90,0,8,.9)')}
 return hy}
function visorFace(R,o={}){return(x,cx,cy,s)=>{face(x,R,cx,cy+s*.12,s*.62,{skin:o.skin||'#7a6a62',hollow:o.hollow,glow:o.glow,mouth:o.mouth??.25,blood:o.blood});if(o.water){x.fillStyle='rgba(40,60,90,.45)';x.fillRect(cx-s,cy-s*(o.water),s*2,s*2);x.fillStyle='rgba(160,200,255,.35)';x.fillRect(cx-s,cy-s*o.water,s*2,1)}}}
function metalP(x,R,pts,o={}){x.save();P2(x,pts);x.fillStyle=o.fill||LGr(x,pts[0][0],pts[0][1],pts[2][0],pts[2][1],o.cols||['#5a6060','#22282a','#0a0c0d']);x.fill();x.clip();
 const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
 x.strokeStyle='rgba(0,0,0,.6)';x.lineWidth=.8;const pw=o.pw||22;for(let px=x0;px<x1;px+=pw*(.6+R()*.8)){x.beginPath();x.moveTo(px,y0);x.lineTo(px+(o.sk||0),y1);x.stroke()}for(let py=y0;py<y1;py+=pw*(.5+R()*.6)){x.beginPath();x.moveTo(x0,py);x.lineTo(x1,py+(o.sk2||0));x.stroke()}
 speck(x,R,x0,y0,x1-x0,y1-y0,(x1-x0)*(y1-y0)/40,['rgba(0,0,0,.4)','rgba(140,70,25,.35)','rgba(190,190,180,.15)','rgba(90,40,10,.3)'],3);
 if(o.rust!==0)for(let i=0;i<(x1-x0)/14;i++){const rx=x0+R()*(x1-x0),ry=y0+R()*(y1-y0);x.fillStyle=LGr(x,0,ry,0,ry+20,['rgba(120,50,15,.5)','rgba(120,50,15,0)']);x.fillRect(rx,ry,1+R()*2,10+R()*25)}
 if(o.lights)for(let i=0;i<o.lights;i++){const lx=x0+R()*(x1-x0),ly=y0+R()*(y1-y0),c=o.lc||'#ffb060';x.fillStyle=c;x.fillRect(lx,ly,1.6,1.2);glow(x,lx,ly,3,c,.5)}
 x.restore();P2(x,pts);x.strokeStyle='rgba(180,190,190,.25)';x.lineWidth=.8;x.stroke()}
function corpse(x,R,cx,cy,s,a,o={}){x.save();x.translate(cx,cy);x.rotate(a);const c=o.c||'#2a2422';x.fillStyle=c;x.strokeStyle=c;x.lineCap='round';
 x.beginPath();x.ellipse(0,0,s*.5,s*.22,0,0,TAU);x.fill();x.beginPath();x.arc(s*.7,-s*.02,s*.17,0,TAU);x.fill();
 x.lineWidth=s*.14;for(const[ax,ay,bx,by]of[[s*.35,-s*.12,s*.55,-s*.55],[s*.35,s*.12,s*.6+R()*s*.3,s*.4],[-s*.4,-s*.08,-s*1,-s*.25],[-s*.4,s*.08,-s*.95,s*.3]]){x.beginPath();x.moveTo(ax,ay);x.lineTo((ax+bx)/2+(R()-.5)*s*.2,(ay+by)/2+(R()-.5)*s*.2);x.lineTo(bx,by);x.stroke()}
 x.lineCap='butt';x.fillStyle='rgba(200,190,170,.18)';x.beginPath();x.ellipse(0,-s*.1,s*.4,s*.06,0,0,TAU);x.fill();if(o.blood)splat(x,R,0,s*.15,s*.5,'rgba(70,0,6,.8)');x.restore()}
function stars2(x,W,H,R,n=160){for(let i=0;i<n;i++){const s=R()<.92?.7:R()<.8?1.3:2.2,px=R()*W,py=R()*H;x.fillStyle=`rgba(${220+R()*35|0},${215+R()*40|0},255,${.25+R()*.6})`;x.fillRect(px,py,s,s);if(s>2)glow(x,px+1,py+1,6,'#c8d8ff',.35)}}
function galaxy(x,R,cx,cy,r,col,a=-.4){x.save();x.translate(cx,cy);x.rotate(a);x.scale(1,.35);glow(x,0,0,r,col,.25);glow(x,0,0,r*.25,'#ffffff',.3);x.restore()}
function sparks(x,R,cx,cy,n,len,col='#ffc060',a0=0,spr=TAU){x.save();x.globalCompositeOperation='lighter';for(let i=0;i<n;i++){const a=a0+(R()-.5)*spr,l=len*(.3+R());x.strokeStyle=hexA(col,.5+R()*.5);x.lineWidth=.6+R()*.8;x.beginPath();x.moveTo(cx,cy);x.lineTo(cx+Math.cos(a)*l,cy+Math.sin(a)*l);x.stroke()}glow(x,cx,cy,len*.4,col,.7);glow(x,cx,cy,len*.12,'#ffffff',.9);x.restore()}
function chain(x,x0,y0,x1,y1,s=3){const l=Math.hypot(x1-x0,y1-y0),n=Math.floor(l/(s*1.6));x.strokeStyle='#5a5048';x.lineWidth=s*.45;for(let i=0;i<n;i++){const t=i/n,px=lerp(x0,x1,t),py=lerp(y0,y1,t),a=Math.atan2(y1-y0,x1-x0);x.save();x.translate(px,py);x.rotate(a);x.beginPath();x.ellipse(0,0,s,s*(i%2?.25:.6),0,0,TAU);x.stroke();x.restore()}}
Object.assign(SCENE,{
 space(x,W,H,R,P){nebula(x,W,H,R,P,5,.22);stars2(x,W,H,R,220);galaxy(x,R,R()*W,R()*H*.5,W*.25,P.c[3]);},
 corridor(x,W,H,R,P){x.fillStyle='#020303';x.fillRect(0,0,W,H);const vx=W*(.4+R()*.2),vy=H*(.38+R()*.1);glow(x,vx,vy,W*.3,P.c[0],.6);
  const fr=[];for(let i=0;i<9;i++){const t=Math.pow(i/8,1.6),w=lerp(W*.12,W*1.5,t),h=lerp(H*.12,H*1.6,t);fr.push([vx-w/2,vy-h*.45,w,h])}
  const shp=R();for(let i=fr.length-1;i>=0;i--){if(i>1&&R()<.3)continue;const[x0,y0,w,h]=fr[i],sh=shp<.4?.06+i*.02:shp<.7?.3:.01;x.strokeStyle=`rgba(${30+i*7},${34+i*7},${36+i*6},${.8})`;x.lineWidth=1+i*1.6;x.beginPath();x.moveTo(x0+w*sh,y0);x.lineTo(x0+w*(1-sh),y0);x.lineTo(x0+w,y0+h*sh);x.lineTo(x0+w,y0+h*(1-sh));x.lineTo(x0+w*(1-sh),y0+h);x.lineTo(x0+w*sh,y0+h);x.lineTo(x0,y0+h*(1-sh));x.lineTo(x0,y0+h*sh);x.closePath();x.stroke();
   if(i>1&&R()<.6){const c=R()<.6?P.a:'#ff2a1a';glow(x,x0+w*(R()<.5?.08:.92),y0+h*.5,4+i*2,c,.7)}}
  x.strokeStyle='rgba(90,100,100,.3)';x.lineWidth=1;for(let i=-10;i<=10;i++){x.beginPath();x.moveTo(vx+i*W*.012,vy+H*.08);x.lineTo(vx+i*W*.16,H*1.2);x.stroke()}for(let j=1;j<8;j++){const y=vy+H*.08+Math.pow(j/7,2)*H*.7;x.beginPath();x.moveTo(0,y);x.lineTo(W,y);x.stroke()}
  for(const k of[-1,1])for(let j=0;j<3;j++)cable(x,vx+k*W*.06,vy-H*.06+j*3,vx+k*W*.8,-10+j*14,H*.08,2+j,'#0c0e0e');
  for(let i=0;i<14;i++){x.fillStyle=`rgba(150,150,140,${R()*.25})`;x.fillRect(R()*W,vy+R()*H*.6,2+R()*6,1)}},
 chapel(x,W,H,R,P){x.fillStyle='#030101';x.fillRect(0,0,W,H);const cx=W*(.4+R()*.2);glow(x,cx,H*.3,W*.5,P.c[0],.55);
  // rose window
  const ry=H*.28,rr=H*.2;x.save();x.globalCompositeOperation='lighter';glow(x,cx,ry,rr*1.6,P.c[3],.4);x.strokeStyle=hexA(P.g,.35);x.lineWidth=1.4;for(const k of[1,.66,.33]){x.beginPath();x.arc(cx,ry,rr*k,0,TAU);x.stroke()}for(let i=0;i<12;i++){const a=i/12*TAU;x.beginPath();x.moveTo(cx,ry);x.lineTo(cx+Math.cos(a)*rr,ry+Math.sin(a)*rr);x.stroke();x.beginPath();x.arc(cx+Math.cos(a)*rr*.8,ry+Math.sin(a)*rr*.8,rr*.14,0,TAU);x.stroke()}x.restore();
  for(const k of[-1,1])for(let j=0;j<3;j++){const px=cx+k*W*(.22+j*.17),pw=10+j*6;x.fillStyle=LGr(x,px-pw,0,px+pw,0,['#020101','#1e1412','#050202']);x.beginPath();x.moveTo(px-pw,H);x.lineTo(px-pw,H*.25-j*10);x.quadraticCurveTo(px,H*.05-j*14,px+pw,H*.25-j*10);x.lineTo(px+pw,H);x.fill();x.fillStyle='rgba(0,0,0,.6)';for(let b=0;b<6;b++)x.fillRect(px-pw,H*.3+b*H*.12,pw*2,1.5)}
  for(let i=0;i<14;i++){const fx=R()*W,fy=H*(.7+R()*.28);candle(x,R,fx,fy,4+R()*10,1.2+R()*1.5)}
  x.fillStyle='rgba(60,0,6,.6)';for(let i=0;i<5;i++)splat(x,R,R()*W,H*(.85+R()*.15),6+R()*14,'rgba(50,0,4,.7)')},
 ocean(x,W,H,R,P){x.fillStyle='#010203';x.fillRect(0,0,W,H);stars2(x,W,H*.5,R,90);const hz=H*(.5+R()*.12);glow(x,W*(.3+R()*.4),hz,W*.6,P.c[3],.35);
  x.fillStyle=LGr(x,0,hz,0,H,['#0a0c14','#020305']);x.fillRect(0,hz,W,H-hz);x.strokeStyle=hexA(P.g,.18);for(let i=0;i<40;i++){const y=hz+Math.pow(R(),1.5)*(H-hz),w=6+R()*40*(y-hz)/(H-hz);x.lineWidth=.6;const px=R()*W;x.beginPath();x.moveTo(px,y);x.lineTo(px+w,y);x.stroke()}},
 cockpit(x,W,H,R,P){x.fillStyle='#010202';x.fillRect(0,0,W,H);x.save();P2(x,[[W*.08,H*.05],[W*.92,H*.05],[W*.98,H*.55],[W*.02,H*.55]]);x.clip();stars2(x,W,H,R,200);nebula(x,W,H*.6,R,P,3,.2);x.restore();
  x.strokeStyle='#1a1e20';x.lineWidth=6;P2(x,[[W*.08,H*.05],[W*.92,H*.05],[W*.98,H*.55],[W*.02,H*.55]]);x.stroke();x.lineWidth=4;x.beginPath();x.moveTo(W*.5,H*.05);x.lineTo(W*.5,H*.55);x.stroke();
  metalP(x,R,[[0,H*.58],[W,H*.58],[W,H],[0,H]],{lights:30,lc:P.a,pw:30});for(let i=0;i<8;i++){const sx=W*(.05+i*.12),sy=H*(.64+R()*.1);x.fillStyle='#04120f';x.fillRect(sx,sy,W*.08,H*.08);x.strokeStyle=hexA(P.a,.6);x.lineWidth=.6;x.beginPath();for(let j=0;j<8;j++)x.lineTo(sx+j*W*.01,sy+H*.04+(R()-.5)*H*.05);x.stroke()}},
 wreck(x,W,H,R,P){SCENE.space(x,W,H,R,P);for(let i=0;i<9;i++){const cx=R()*W,cy=R()*H,r=W*(.03+R()*.12),a=R()*TAU;const p=[];for(let k=0;k<5;k++){const b=a+k/5*TAU+(R()-.5);p.push([cx+Math.cos(b)*r*(.5+R()*.6),cy+Math.sin(b)*r*(.4+R()*.5)])}metalP(x,R,p,{pw:8,lights:R()<.4?2:0,lc:P.a})}},
 lab(x,W,H,R,P){SCENE.corridor(x,W,H,R,P);for(let i=0;i<3;i++){const tx=W*(.12+i*.38),ty=H*.2;x.fillStyle=LGr(x,tx-14,0,tx+14,0,['rgba(30,60,60,.4)','rgba(90,200,180,.25)','rgba(20,40,40,.4)']);x.fillRect(tx-14,ty,28,H*.62);x.strokeStyle='rgba(140,180,180,.4)';x.strokeRect(tx-14,ty,28,H*.62);glow(x,tx,ty+H*.3,30,P.a,.25)}},
});
SCENE.hull=SCENE.corridor;
/* ---------- Abyss ---------- */
function eyeSocket(x,R,P,cx,cy,rw,rh,o={}){// eye set in folded flesh
 flesh2(x,R,cx,cy,rw*1.45,rh*2.6,{c1:o.c1||'#3a1a40',c2:'#120618',c3:o.c3||'#6a3a70',n:18,v:8,w:18});
 for(let i=0;i<3;i++){x.strokeStyle='rgba(0,0,0,.55)';x.lineWidth=2;x.beginPath();x.ellipse(cx,cy,rw*(1.08+i*.12),rh*(1.6+i*.35),0,0,TAU);x.stroke();x.strokeStyle='rgba(220,170,230,.14)';x.lineWidth=1;x.beginPath();x.ellipse(cx,cy-1.5,rw*(1.08+i*.12),rh*(1.6+i*.35),0,Math.PI*1.1,Math.PI*1.9);x.stroke()}
 eyeAt(x,cx,cy,rw,rh,P,R,o.lx??(R()-.5),o.ly??0,o.open??1);wet(x,R,cx,cy-rh,rw*.8,rh*.8,12,.5)}
Object.assign(PAINT,{
 v1(x,W,H,R,P){const cx=W*.6,cy=H*.38,r=H*.24;for(let i=0;i<12;i++){const a=Math.PI*.5+(i/11-.5)*1.6;tentacle(x,cx+Math.cos(a)*r*.7,cy+r*.35,H*(.5+R()*.4),a+(R()-.5)*.3,3+R()*2,P,R,40,i%2)}
  x.fillStyle=RG(x,cx,cy,r*.1,r*1.1,['rgba(200,160,240,.55)','rgba(110,50,160,.4)','rgba(30,10,50,.75)'],-r*.2,-r*.3);x.beginPath();x.ellipse(cx,cy,r*1.1,r*.85,0,Math.PI,TAU);x.bezierCurveTo(cx+r*1.1,cy+r*.4,cx-r*1.1,cy+r*.4,cx-r*1.1,cy);x.fill();
  for(let i=0;i<10;i++){x.strokeStyle='rgba(230,200,255,.25)';x.lineWidth=.8;x.beginPath();const a=Math.PI+i/9*Math.PI;x.moveTo(cx,cy-r*.2);x.quadraticCurveTo(cx+Math.cos(a)*r*.6,cy+Math.sin(a)*r*.5,cx+Math.cos(a)*r*1.05,cy+Math.sin(a)*r*.82);x.stroke()}
  glow(x,cx,cy-r*.1,r*.6,P.a,.35);flesh2(x,R,cx,cy-r*.05,r*.35,r*.25,{c1:'#7a3aa0',c2:'#2a0a40',c3:'#c890e0',n:8,w:8});face(x,R,cx,cy-r*.08,r*.28,{skin:'#9a80b0',hollow:1,glow:P.a,mouth:1});
  wet(x,R,cx-r*.4,cy-r*.5,r*.4,r*.2,14,.7);suit(x,R,P,W*.18,H*1.15,H*.13,{inside:visorFace(R,{hollow:1,mouth:.9,skin:'#5a5a6a'}),crack:1,lamp:0});tentacle(x,cx-r*.7,cy+r*.3,W*.45,2.6,3,P,R,40,1)},
 v2(x,W,H,R,P){eyeSocket(x,R,P,W*.55,H*.46,W*.3,H*.15,{lx:-.6});for(let i=0;i<16;i++){const a=i/16*TAU;tentacle(x,W*.55+Math.cos(a)*W*.42,H*.46+Math.sin(a)*H*.42,W*.12,a+(R()-.5)*.6,3,P,R,24,0)}
  x.save();x.translate(W*.16,H*.8);x.rotate(-.2);x.fillStyle='#0a0c0e';P2(x,[[-22,0],[18,-5],[26,0],[18,5]]);x.fill();rim(x,P.g,.8,.6);glow(x,-22,0,8,'#ffb060',.7);x.restore();x.strokeStyle=hexA(P.g,.25);x.setLineDash([2,4]);x.beginPath();x.moveTo(W*.18,H*.78);x.lineTo(W*.45,H*.5);x.stroke();x.setLineDash([])},
 v3(x,W,H,R,P){const cx=W*.62,cy=H*.36;for(let i=0;i<3;i++)tentacle(x,cx+(i-1)*14,H+10,H*.8,-1.57+(i-1)*.3,9,P,R,50,1);eyeSocket(x,R,P,cx,cy,W*.14,H*.07,{lx:-.8,ly:.5});lips(x,R,cx,cy+H*.2,W*.09,H*.035,{open:.35});
  x.save();x.globalCompositeOperation='lighter';for(let i=1;i<5;i++){x.strokeStyle=hexA(P.g,.3/i);x.lineWidth=1.4;x.beginPath();x.arc(cx,cy+H*.2,i*16,2.2,3.5);x.stroke()}x.restore();
  for(let i=0;i<5;i++)eyeAt(x,W*(.05+R()*.9),H*(.08+R()*.4),W*.03,H*.015,P,R,R()-.5,0);face(x,R,W*.22,H*.8,H*.2,{rot:-.5,mouth:.5,hollow:0,skin:'#8a7a80',brow:-4});drips(x,R,W*.29,W*.31,H*.76,H*.15,1)},
 v4(x,W,H,R,P){const pts=tentacle(x,W*1.05,H*.95,W*.75,-2.8,H*.18,P,R,60,0);for(let i=6;i<pts.length;i+=5){const[qx,qy,r]=pts[i];x.strokeStyle='rgba(0,0,0,.6)';x.lineWidth=2;x.beginPath();x.arc(qx,qy,r,0,TAU);x.stroke()}
  const cx=W*.33,cy=H*.4,r=H*.33;x.fillStyle=RG(x,cx,cy,r*.1,r*1.15,['#000','#1a0412',P.m,'#5a2a70'],0,0);x.beginPath();x.arc(cx,cy,r*1.15,0,TAU);x.fill();
  flesh2(x,R,cx,cy,r*1.15,r*1.12,{c1:'#4a2050',c2:'#14061a',c3:'#8a5a90',n:22});mawRing(x,R,cx,cy,r*.95,r*.92,4,{n:20});for(let i=0;i<6;i++){x.strokeStyle='rgba(220,220,240,.35)';x.lineWidth=.6;x.beginPath();const a=R()*TAU;x.moveTo(cx+Math.cos(a)*r*.5,cy+Math.sin(a)*r*.5);x.quadraticCurveTo(cx,cy+r*.3,cx+Math.cos(a+1)*r*.5,cy+Math.sin(a+1)*r*.5+r*.4);x.stroke()}},
 v5(x,W,H,R,P){x.fillStyle='#000';x.fillRect(0,H*.82,W,H*.2);spineTent(x,R,P,[[W*.72,H*1.05],[W*.95,H*.45],[W*.2,H*.4],[W*.38,H*.06]],W*.12,110,1);
  for(let i=0;i<3;i++)spineTent(x,R,P,[[W*(.1+i*.12),H*1.02],[W*(.05+i*.15),H*.75],[W*(.2+i*.1),H*.7],[W*(.15+i*.12),H*(.55+R()*.1)]],8,40,1);
  x.save();x.translate(W*.48,H*.3);x.rotate(-.4);metalP(x,R,[[-26,-6],[18,-8],[30,-1],[18,7],[-26,6]],{pw:7,lights:5,lc:'#ffb060'});x.restore();sparks(x,R,W*.55,H*.27,10,14,'#ffb060');
  x.strokeStyle='rgba(200,220,255,.25)';x.lineWidth=.8;for(let i=0;i<40;i++){const y=H*(.82+R()*.18);x.beginPath();x.moveTo(R()*W,y);x.lineTo(R()*W,y);x.stroke()}x.fillStyle='rgba(200,220,255,.5)';for(let i=0;i<20;i++){x.beginPath();x.arc(W*(.6+R()*.3),H*(.8+R()*.06),.8+R()*1.6,0,TAU);x.fill()}},
 v6(x,W,H,R,P){const sx=W*.5,sy=H*.24,sr=H*.15;glow(x,sx,sy,sr*3.5,P.c[3],.5);glow(x,sx,sy,sr*1.7,P.g,.6);x.fillStyle='#000';x.beginPath();x.arc(sx,sy,sr,0,TAU);x.fill();rim(x,'#ffffff',1.5,.8);
  const n=5;for(let i=0;i<n;i++){const t=(i+.5)/n,cx=W*t,sc=1-Math.abs(t-.5)*.5;const f=robe(x,R,P,cx,H*1.06,H*(.62*sc+.1),{face:'face',mouth:0,hollow:1,eyeC:'#000',arms:'none',stole:0});
   x.strokeStyle='#2a1a14';x.lineWidth=.7;for(let j=-2;j<=2;j++){x.beginPath();x.moveTo(cx+j*f.s*.06-f.s*.03,f.fy+f.s*.15);x.lineTo(cx+j*f.s*.06+f.s*.03,f.fy+f.s*.25);x.stroke()}drips(x,R,cx-f.s*.25,cx-f.s*.2,f.fy,f.s*.5,1);drips(x,R,cx+f.s*.2,cx+f.s*.25,f.fy,f.s*.5,1);
   x.strokeStyle=hexA(P.g,.12);x.lineWidth=.7;x.beginPath();x.moveTo(cx,f.fy);x.lineTo(sx,sy);x.stroke()}},
 v7(x,W,H,R,P){const cx=W*.46,cy=H*.5,r=H*.42;
  for(let i=0;i<10;i++){const a=i/10*TAU+R()*.3,a2=a+.55;const p=[[cx+Math.cos(a)*r*1.05,cy+Math.sin(a)*r*.95],[cx+Math.cos(a)*r*2.2,cy+Math.sin(a)*r*2],[cx+Math.cos(a2)*r*2.2,cy+Math.sin(a2)*r*2],[cx+Math.cos(a2)*r*1.1,cy+Math.sin(a2)*r]];metalP(x,R,p,{pw:10,lights:1,lc:P.a})}
  for(let i=0;i<12;i++){const a=R()*TAU;sparks(x,R,cx+Math.cos(a)*r*1.05,cy+Math.sin(a)*r*.95,4,8,'#ffa040',a,1)}
  flesh2(x,R,cx,cy,r*1.08,r*.98,{c1:'#5a2050',c2:'#1a0618',c3:'#a05a90',n:30,w:30});
  mawRing(x,R,cx,cy,r*.84,r*.76,4,{n:18});
  for(let i=0;i<4;i++)tentacle(x,cx+(R()-.5)*r*.3,cy+(R()-.5)*r*.3,r*(.5+R()*.4),R()*TAU,4,P,R,30,1);
  corpse(x,R,cx+r*.95,cy-r*.75,H*.12,2.3,{c:'#3a3432'});corpse(x,R,cx-r*1.1,cy+r*.6,H*.1,-.8,{c:'#2a2624',blood:1});for(let i=0;i<5;i++){const a=R()*TAU;eyeAt(x,cx+Math.cos(a)*r*.98,cy+Math.sin(a)*r*.9,W*.025,H*.012,P,R)}
  for(let i=0;i<8;i++){x.strokeStyle='rgba(230,210,220,.3)';x.lineWidth=.6;const a=R()*TAU;x.beginPath();x.moveTo(cx+Math.cos(a)*r*.75,cy+Math.sin(a)*r*.7);x.quadraticCurveTo(cx,cy+r*.2,cx+Math.cos(a+.6)*r*.7,cy+Math.sin(a+.6)*r*.65);x.stroke()}},
 v8(x,W,H,R,P){const pr=W*1.4,pcx=W*.3,pcy=H+pr*.72;x.fillStyle=RG(x,pcx,pcy-pr,10,pr*.6,[P.c[0],'#08040c']);x.beginPath();x.arc(pcx,pcy,pr,0,TAU);x.fill();rim(x,P.g,2,.5);
  const body=[[-W*.1,H*.5],[W*.15,H*.3],[W*.45,H*.2],[W*.72,H*.18],[W*.92,H*.26],[W*1.02,H*.4],[W*.96,H*.56],[W*.75,H*.62],[W*.45,H*.6],[W*.15,H*.62]];
  for(let i=0;i<12;i++)spineTent(x,R,P,[[W*(.55+R()*.4),H*.58],[W*(.5+R()*.4),H*.75],[W*(.4+R()*.5),H*.9],[W*(.35+R()*.6),H*1.05]],4+R()*3,40,i%2);
  x.fillStyle=LGr(x,0,H*.15,0,H*.65,['#2a1a3a','#0a0610','#020104']);SM(x,body);x.fill();x.save();SM(x,body);x.clip();
  for(let i=0;i<40;i++){x.strokeStyle='rgba(0,0,0,.55)';x.lineWidth=1.2;x.beginPath();x.arc(R()*W,H*(.2+R()*.4),6+R()*22,.2,2.9);x.stroke();x.strokeStyle='rgba(200,170,230,.08)';x.beginPath();x.arc(R()*W,H*(.2+R()*.4),6+R()*22,3.3,6);x.stroke()}
  for(let i=0;i<34;i++){const px=R()*W,py=H*(.35+R()*.22);glow(x,px,py,4,P.a,.7);x.fillStyle=P.a;x.fillRect(px,py,1.4,1.4)}speck(x,R,0,0,W,H,500,['rgba(0,0,0,.3)','rgba(160,120,200,.08)'],2);x.restore();
  for(let i=0;i<26;i++){const t=i/25,px=lerp(W*.05,W*.9,t),py=H*.3-Math.sin(t*Math.PI)*H*.1+(t>.6?(t-.6)*H*.1:0),h=6+R()*16;x.fillStyle='#0a0610';P2(x,[[px-4,py+4],[px+(R()-.3)*6,py-h],[px+5,py+4]]);x.fill();x.strokeStyle=hexA(P.g,.25);x.lineWidth=.6;x.stroke()}
  const ex=W*.82,ey=H*.38;x.fillStyle='#000';x.beginPath();x.ellipse(ex,ey,W*.07,H*.035,-.1,0,TAU);x.fill();x.strokeStyle=hexA(P.g,.7);x.lineWidth=1.6;x.beginPath();x.moveTo(ex-W*.07,ey);x.quadraticCurveTo(ex,ey+H*.03,ex+W*.07,ey-H*.01);x.stroke();for(let i=0;i<7;i++){x.lineWidth=.8;x.beginPath();x.moveTo(ex-W*.055+i*W*.018,ey+H*.018);x.lineTo(ex-W*.06+i*W*.018,ey+H*.04);x.stroke()}
  for(let i=0;i<4;i++){const sx=W*(.12+i*.1),sy=H*(.72+R()*.1);x.fillStyle='#000';P2(x,[[sx-6,sy],[sx+5,sy-2],[sx+8,sy],[sx+5,sy+2]]);x.fill();glow(x,sx-6,sy,4,'#ffb060',.8)}},
 v9(x,W,H,R,P){const cx=W*.5,cy=H*.47,r=H*.21;glow(x,cx,cy,r*3.4,P.c[3],.5);glow(x,cx,cy,r*2,P.g,.55);
  x.save();x.globalCompositeOperation='lighter';for(let i=0;i<34;i++){let a=i/34*TAU,px=cx+Math.cos(a)*r,py=cy+Math.sin(a)*r;x.strokeStyle=hexA(i%3?P.g:P.a,.25+R()*.3);x.lineWidth=1+R()*1.5;x.beginPath();x.moveTo(px,py);const l=r*(1.2+R()*1.6);for(let j=0;j<6;j++){a+=(R()-.5)*.35;px+=Math.cos(a)*l/6;py+=Math.sin(a)*l/6;x.lineTo(px,py)}x.stroke()}x.restore();
  for(let i=0;i<7;i++){const a=i/7*TAU+R()*.4,d=r*(1.5+R()*.6);face(x,R,cx+Math.cos(a)*d,cy+Math.sin(a)*d,r*.22,{rot:a+Math.PI/2,skin:'#c8a8e0',hollow:1,glow:'#ffffff',mouth:1})}
  for(let i=0;i<6;i++){const a=R()*TAU,d=r*(2.1+R()*.7);x.save();x.translate(cx+Math.cos(a)*d,cy+Math.sin(a)*d);x.rotate(a);chain(x,-14,0,14,0,3);x.restore()}
  x.fillStyle='#000';x.beginPath();x.arc(cx,cy,r,0,TAU);x.fill();x.strokeStyle='#fff';x.lineWidth=1.6;x.stroke();eyeAt(x,cx,cy,r*.8,r*.3,P,R,0,0);
  x.strokeStyle=hexA(P.c[3],.85);x.lineWidth=3;x.beginPath();x.ellipse(cx,cy,r*2.3,r*.45,-.25,.2,Math.PI*.8);x.stroke();x.beginPath();x.ellipse(cx,cy,r*2.3,r*.45,-.25,Math.PI*1.1,Math.PI*1.7);x.stroke()},
 v10(x,W,H,R,P){const cx=W*.5,cy=H*.4;for(let i=0;i<14;i++){const a=i/14*TAU;tentacle(x,cx+Math.cos(a)*W*.45,cy+Math.sin(a)*H*.4,W*.2,a+Math.PI+(R()-.5)*.6,5,P,R,36,0)}eyeSocket(x,R,P,cx,cy,W*.36,H*.17,{lx:0,ly:.6});
  x.fillStyle='#000';const fx=W*.5,fy=H*.98;x.beginPath();x.ellipse(fx,fy-H*.11,H*.035,H*.04,0,0,TAU);x.fill();x.beginPath();x.moveTo(fx-H*.07,fy+4);x.quadraticCurveTo(fx-H*.06,fy-H*.08,fx,fy-H*.08);x.quadraticCurveTo(fx+H*.06,fy-H*.08,fx+H*.07,fy+4);x.fill();x.strokeStyle=hexA(P.g,.7);x.lineWidth=1;x.stroke();glow(x,fx,fy-H*.1,H*.1,P.g,.25);x.fillStyle=LGr(x,0,H*.85,0,H,['rgba(0,0,0,0)','#000']);x.fillRect(0,H*.85,W,H*.15)},
 v11(x,W,H,R,P){const cx=W*.45,pts=[],p2=[];for(let i=0;i<=14;i++){const y=-5+i*(H+10)/14,w=Math.sin(i/14*Math.PI)*W*(.14+R()*.05);pts.push([cx-w+(R()-.5)*12,y]);p2.unshift([cx+w+(R()-.5)*12,y])}
  for(const s of[-1,1])for(let i=0;i<8;i++){const y=H*(.08+i*.12),bx=cx+s*W*.12*Math.sin((y/H)*Math.PI);metalP(x,R,[[bx,y],[bx+s*W*.2,y-10],[bx+s*W*.22,y+16],[bx+s*4,y+20]],{pw:7})}
  glow(x,cx,H/2,W*.45,P.c[3],.5);blob(x,pts.concat(p2));x.fillStyle='#000';x.fill();x.save();x.clip();stars2(x,W,H,R,80);nebula(x,W,H,R,{c:['#4a0a3a','#0a3a3a','#3a0a0a','#200a40']},3,.4);eyeAt(x,cx,H*.38,W*.1,H*.05,P,R,0,.5);x.restore();
  for(let i=1;i<pts.length-1;i++){const[px,py]=pts[i],[qx,qy]=p2[p2.length-1-i];fang(x,px,py,px+W*.04,py+4,6,'#d8ccb4');fang(x,qx,qy,qx-W*.04,qy+4,6,'#d8ccb4')}
  blob(x,pts.concat(p2));x.strokeStyle='#3a0a1a';x.lineWidth=7;x.stroke();x.strokeStyle='#8a2a4a';x.lineWidth=3;x.stroke();rim(x,P.g,1.5,.7);
  for(const[i,s2]of[[3,-1],[6,-1],[9,-1],[4,1],[8,1],[11,1]]){const q=s2<0?pts[i]:p2[p2.length-1-i];hand(x,R,q[0]+s2*4,q[1],H*.075,s2<0?-1.9:1.9,{claw:1,skin:'#7a6a8a',spread:1.3,curl:.5})}
  drips(x,R,cx-W*.12,cx+W*.12,H*.92,H*.08,8,'#5a0618');
  x.save();x.globalCompositeOperation='lighter';for(let i=0;i<40;i++){const a=R()*TAU,d=W*(.2+R()*.35),px=cx+Math.cos(a)*d,py=H*.5+Math.sin(a)*d*.7;x.strokeStyle=`rgba(200,160,255,${.05+R()*.12})`;x.lineWidth=.8;x.beginPath();x.moveTo(px,py);x.lineTo(px+(cx-px)*.18,py+(H*.5-py)*.18);x.stroke()}x.restore();
  x.save();x.translate(W*.8,H*.5);x.rotate(-.9);suit(x,R,P,0,H*.2,H*.08,{inside:visorFace(R,{mouth:1}),crack:1,blood:1});x.restore();
  for(let i=0;i<8;i++){x.save();x.translate(cx+(R()-.5)*W*.6,R()*H);x.rotate(R()*3);x.fillStyle='#2a2e30';x.fillRect(0,0,3+R()*6,1+R()*3);x.restore()}},
 v12(x,W,H,R,P){const bx=W*.75,by=H*.3,br=H*.13;glow(x,bx,by,br*3,P.c[3],.4);const cx=W*.4,cy=H*.6,r=H*.3;
  x.fillStyle=RG(x,cx,cy,r*.1,r,[P.c[1],P.c[0],'#000'],-r*.4,-r*.4);x.beginPath();x.arc(cx,cy,r,0,TAU);x.fill();x.save();x.beginPath();x.arc(cx,cy,r,0,TAU);x.clip();x.save();x.globalCompositeOperation='lighter';
  for(let i=0;i<9;i++){let px=cx+(R()-.5)*r*.4,py=cy+(R()-.5)*r*.4,a=R()*TAU;x.strokeStyle='#ff8a40';x.lineWidth=1.5+R()*2;x.beginPath();x.moveTo(px,py);for(let j=0;j<6;j++){a+=(R()-.5)*.8;px+=Math.cos(a)*r*.22;py+=Math.sin(a)*r*.22;x.lineTo(px,py)}x.stroke();x.strokeStyle='rgba(255,200,120,.4)';x.lineWidth=5;x.stroke()}x.restore();x.restore();
  for(let i=0;i<16;i++){const a=-.6+(R()-.5)*1.4,d=r*(1.05+R()*1.2),px=cx+Math.cos(a)*d,py=cy+Math.sin(a)*d,s=2+R()*9;x.fillStyle='#1a0e14';SM(x,ring(px,py,s,s*.8,6,R,.5));x.fill();x.strokeStyle='rgba(255,140,80,.6)';x.lineWidth=.8;x.stroke()}
  x.save();x.globalCompositeOperation='lighter';x.strokeStyle='rgba(255,150,90,.35)';x.lineWidth=3;x.beginPath();x.moveTo(cx+r*.7,cy-r*.6);x.quadraticCurveTo(bx-br*2,by+br,bx,by);x.stroke();x.restore();
  x.fillStyle='#000';x.beginPath();x.arc(bx,by,br,0,TAU);x.fill();x.strokeStyle=hexA(P.g,.9);x.lineWidth=2;x.beginPath();x.ellipse(bx,by,br*2.2,br*.5,.2,0,TAU);x.stroke();x.fillStyle='#000';x.beginPath();x.arc(bx,by,br*.98,Math.PI,TAU);x.fill()},
 v13(x,W,H,R,P){PAINT.rune(x,W,H,R,P);const cx=W*.5,cy=H*.55;for(let i=3;i>=0;i--){x.globalAlpha=i?.18+.1*(3-i):1;face(x,R,cx+(i-1.5)*W*.07*(i?1:0)+(i?(i%2?1:-1)*i*8:0),cy+(i?-i*4:0),H*.28,{skin:i?'#a890c8':'#a89088',hollow:i>0,glow:P.a,mouth:i?1:.5,blood:!i})}x.globalAlpha=1;},
 v14(x,W,H,R,P){const cx=W*.5,cy=H*.52,r=H*.4;x.fillStyle=RG(x,cx,cy,r*.2,r*1.1,['rgba(220,190,170,.22)','rgba(120,60,80,.3)','rgba(20,5,10,.75)']);SM(x,ring(cx,cy,r*1.15,r,12,R,.1));x.fill();veins(x,R,cx,cy,r,18,'rgba(150,20,40,.55)',1.1);
  const lp={...P,c:['','#e0c8b0'],m:'#b8988a',s:'#4a3028',g:'#ffe0d0'};const pts=spineTent(x,R,lp,[[cx+r*.75,cy+r*.55],[cx+r*1.0,cy-r*.6],[cx-r*.9,cy-r*.7],[cx-r*.3,cy+r*.15]],r*.32,60,0,'#e8d4c0');
  for(let i=4;i<pts.length-4;i+=4){const[qx,qy,rr]=pts[i];x.strokeStyle='rgba(70,40,30,.55)';x.lineWidth=1.4;x.beginPath();x.arc(qx,qy,rr*.95,0,TAU);x.stroke()}
  const[hx,hy]=pts[pts.length-1];face(x,R,hx+4,hy+r*.12,r*.28,{skin:'#e0c8b4',mouth:.15,eye:'#000'});x.fillStyle='#d8c0a8';for(const k of[-1,1]){x.beginPath();x.ellipse(hx+4+k*r*.08,hy+r*.06,r*.07,r*.025,0,0,TAU);x.fill()}
  hand(x,R,hx-r*.25,hy+r*.35,r*.12,-.6,{skin:'#d8bca8',spread:.5,curl:.8});wet(x,R,cx,cy-r*.3,r*.8,r*.4,40,.7);cable(x,cx+r*.8,cy+r*.6,W*1.05,H*1.05,10,5,'#5a1a20','rgba(255,180,180,.3)')},
 v15(x,W,H,R,P){const f=robe(x,R,P,W*.5,H*1.05,H*.95,{face:'face',mouth:1,hollow:1,eyeC:'#000',arms:'spread',hood:'#120a18',cloth:'#1e1028',stole:'#3a1a4a'});
  const cx=W*.5,ty=f.ty;x.save();x.beginPath();x.ellipse(cx,ty+f.s*.35,f.s*.3,f.s*.2,0,0,TAU);x.clip();x.fillStyle='#000';x.fillRect(0,0,W,H);stars2(x,W,H,R,200);glow(x,cx,ty+f.s*.35,f.s*.3,P.a,.4);x.restore();
  x.strokeStyle='#d8ccb4';x.lineWidth=1.2;for(let i=0;i<9;i++){const a=Math.PI+i/8*Math.PI;x.beginPath();x.moveTo(cx+Math.cos(a)*f.s*.3,ty+f.s*.35+Math.sin(a)*f.s*.2);x.lineTo(cx+Math.cos(a)*f.s*.36,ty+f.s*.35+Math.sin(a)*f.s*.26-2);x.stroke()}
  x.save();x.globalCompositeOperation='lighter';for(let i=0;i<20;i++){x.fillStyle=hexA(P.a,.5);x.fillRect(cx+(R()-.5)*30,ty-R()*60,1.2,1.2)}x.restore()},
 v16(x,W,H,R,P){metalP(x,R,[[0,H*.82],[W,H*.78],[W,H],[0,H]],{pw:16,lights:5});x.fillStyle='#000';x.fillRect(W*.05,H*.6,3,H*.22);glow(x,W*.06,H*.6,6,'#ff2a1a',.9);robe(x,R,P,W*.15,H*.86,H*.18,{face:'face',hood:'#222',cloth:'#1a1a1a',stole:0,arms:'raise',mouth:1});
  const crest=[];for(let i=0;i<=20;i++){const t=i/20;crest.push([lerp(W*.25,W*1.05,t),H*(.1+Math.sin(t*3.2)*.08+t*.05)])}
  x.fillStyle=LGr(x,0,0,W,H,['#3a3060','#140e28','#050310']);x.beginPath();x.moveTo(W*.18,H*.85);x.bezierCurveTo(W*.2,H*.45,W*.18,H*.18,W*.25,H*.1);crest.forEach(p=>x.lineTo(p[0],p[1]));x.lineTo(W*1.05,H*.85);x.closePath();x.fill();
  x.save();x.clip();for(let i=0;i<10;i++){x.strokeStyle=hexA(P.g,.12);x.lineWidth=1;x.beginPath();x.moveTo(W*(.2+i*.08),H*.9);x.bezierCurveTo(W*(.22+i*.08),H*.5,W*(.25+i*.08),H*.3,W*(.3+i*.08),H*.15);x.stroke()}
  for(let i=0;i<14;i++)face(x,R,W*(.3+R()*.7),H*(.25+R()*.55),H*(.04+R()*.04),{skin:'#6a6a88',hollow:1,mouth:1,rot:(R()-.5)});x.restore();
  x.strokeStyle=hexA(P.g,.6);x.lineWidth=2;x.beginPath();crest.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.stroke();for(let i=0;i<16;i++){const[px,py]=crest[Math.floor(R()*20)];hand(x,R,px,py,H*(.04+R()*.03),-.5+R()*-.8,{skin:'#5a5a78',claw:R()<.5,spread:1.3})}for(let i=0;i<5;i++){const[px,py]=crest[Math.floor(R()*20)];spineTent(x,R,P,[[px,py],[px-20,py-30],[px-40,py-10],[px-55,py+10]],4,26,1)}
  x.save();x.globalCompositeOperation='lighter';for(let i=0;i<120;i++){const[px,py]=crest[Math.floor(R()*21)];x.fillStyle=hexA(P.g,.35*R());x.beginPath();x.arc(px+(R()-.7)*40,py+(R()-.5)*20,.6+R()*1.8,0,TAU);x.fill()}x.restore()},
 v17(x,W,H,R,P){const hx=W*.66,hy=H*.32,r=H*.24;for(let i=0;i<6;i++)tentacle(x,hx-r*.2+(i-2.5)*6,hy+r*.6,H*.5,2.0+i*.12,4,P,R,40,1);
  flesh2(x,R,hx,hy,r*1.1,r,{c1:'#5a3a6a',c2:'#1a0a24',c3:'#9a7ab0',n:24});for(let i=0;i<5;i++)eyeAt(x,hx+(R()-.3)*r,hy-r*.3+(R()-.5)*r*.6,r*.14,r*.07,P,R,-.8,.3);
  face(x,R,W*.25,H*.62,H*.22,{skin:'#a89080',mouth:1,hollow:0,blood:1,brow:-6});for(let i=0;i<3;i++){x.strokeStyle='#3a1a40';x.lineWidth=3;x.beginPath();x.moveTo(hx-r*.6,hy+r*.5);x.quadraticCurveTo(W*.4,H*.3+i*12,W*.25+(i-1)*12,H*.48);x.stroke()}splat(x,R,W*.25,H*.47,10,'rgba(110,0,10,.9)')},
 v18(x,W,H,R,P){const sy=H*.34;// Nameless Swimmer: a lifeboat above a colossal pale thing rising from the black
  x.fillStyle=LGr(x,0,0,0,sy,['#020308','#0c1624']);x.fillRect(0,0,W,sy);stars2(x,W,sy*.9,R,60);glow(x,W*.6,sy*.55,W*.25,'#9ab8d0',.5);x.fillStyle='#d8e4ec';x.beginPath();x.arc(W*.6,sy*.5,H*.06,0,TAU);x.fill();
  x.fillStyle=LGr(x,0,sy,0,H,['#0e2232','#061018','#010204']);x.fillRect(0,sy,W,H-sy);
  const hx=W*.46,hy=H*.86;x.save();x.globalAlpha=.85;x.fillStyle=RG(x,hx,hy,0,W*.5,['rgba(200,215,200,.85)','rgba(90,115,110,.55)','rgba(4,8,10,0)'],0,-H*.08);x.beginPath();x.ellipse(hx,hy,W*.5,H*.3,-.08,0,TAU);x.fill();x.restore();
  for(let k=0;k<7;k++){x.strokeStyle='rgba(10,20,22,.5)';x.lineWidth=2;x.beginPath();x.ellipse(hx,hy+k*4,W*(.15+k*.05),H*(.06+k*.03),-.08,Math.PI*1.05,Math.PI*1.95);x.stroke()}
  for(const k of[-1,1]){const ex=hx+k*W*.12,ey=hy-H*.07;x.save();x.globalAlpha=.9;eyeSocket(x,R,P,ex,ey,W*.055,H*.018,{c1:'#2a4a48',c3:'#7a9a90',lx:-k*.3,ly:-.6});x.restore();glow(x,ex,ey,W*.09,'#c8ff60',.45)}
  x.save();x.globalAlpha=.7;veins(x,R,hx,hy,W*.3,14,'rgba(20,40,40,.6)',1.2);x.restore();
  for(let k=0;k<6;k++){const bx=W*(.06+k*.17)+(R()-.5)*20,top=sy+H*(.02+R()*.12),s=k%2?1:-1;x.save();x.globalAlpha=k%2?.55:.9;spineTent(x,R,P,[[bx,H*1.02],[bx+s*W*.08,H*.75],[bx-s*W*.1,sy+H*.2],[bx+s*W*.06,top]],H*(.035+R()*.015),70,1,'#5a7270');x.restore()}
  x.save();x.globalCompositeOperation='lighter';for(let i=0;i<110;i++){const y=sy+Math.pow(R(),2)*H*.3,l=W*(.02+R()*.08),px=i<60?W*.6+(R()-.5)*W*(.08+(y-sy)/H*.9):R()*W;x.strokeStyle=`rgba(190,220,240,${i<60?.25+R()*.4:.08+R()*.18})`;x.lineWidth=.7;x.beginPath();x.moveTo(px,y);x.lineTo(px+l,y+(R()-.5)*1.5);x.stroke()}x.restore();
  const bx=W*.56,by=sy+H*.035;x.fillStyle='#07090a';x.beginPath();x.moveTo(bx-W*.13,by-H*.03);x.lineTo(bx+W*.13,by-H*.03);x.lineTo(bx+W*.1,by+H*.02);x.lineTo(bx-W*.1,by+H*.02);x.fill();x.fillRect(bx-W*.04,by-H*.075,W*.06,H*.05);x.strokeStyle='#14181a';x.lineWidth=1;x.beginPath();x.moveTo(bx+W*.08,by-H*.03);x.lineTo(bx+W*.09,by-H*.16);x.stroke();
  glow(x,bx+W*.09,by-H*.16,W*.06,'#ffb050',.7);x.fillStyle='#ffd890';x.beginPath();x.arc(bx+W*.09,by-H*.16,1.8,0,TAU);x.fill();
  x.fillStyle='#050607';for(const [px,ph] of[[-.06,.05],[-.02,.06]]){x.beginPath();x.arc(bx+W*px,by-H*(.03+ph),H*.012,0,TAU);x.fill();x.fillRect(bx+W*px-2,by-H*(.03+ph)+2,4,H*.035)}
  x.save();x.globalCompositeOperation='lighter';x.strokeStyle='rgba(255,180,90,.25)';for(let i=0;i<10;i++){x.lineWidth=1;const y=by+H*(.025+i*.012);x.beginPath();x.moveTo(bx+W*.09-3-i,y);x.lineTo(bx+W*.09+3+i,y);x.stroke()}x.restore();
  corpse(x,R,W*.18,sy+H*.06,H*.04,1.45,{c:'#2a3234'});corpse(x,R,W*.86,sy+H*.09,H*.035,-1.5,{c:'#2a3234'});face(x,R,W*.3,sy+H*.13,H*.035,{skin:'#7a8a88',hollow:1,mouth:1});
 },
 v19(x,W,H,R,P){x.strokeStyle='rgba(200,180,140,.35)';x.lineWidth=.7;for(let i=0;i<60;i++){const px=R()*W,py=R()*H*.7,r=3+R()*14;x.beginPath();x.arc(px,py,r,0,TAU);x.stroke();x.beginPath();x.moveTo(px,py);x.lineTo(px+(R()-.5)*60,py+(R()-.5)*40);x.stroke()}
  x.fillStyle=LGr(x,W*.6,0,W,0,['#2a2622','#5a544a','#1a1612']);x.save();x.translate(W*.75,H*.55);x.rotate(-.7);x.fillRect(-8,-H*.45,16,H*.7);x.fillStyle='#000';x.beginPath();x.ellipse(0,-H*.45,9,4,0,0,TAU);x.fill();glow(x,0,-H*.45,10,P.a,.6);x.restore();
  const f=robe(x,R,P,W*.35,H*1.05,H*.85,{face:'face',mouth:1,hollow:1,eyeC:'#000',arms:'raise',hood:'#1a1612',cloth:'#2a241e',stole:0,skin:'#9a8a80'});
  x.strokeStyle='#7a0010';x.lineWidth=1.3;for(let i=0;i<4;i++){x.beginPath();x.moveTo(W*.35-f.s*.25+i*f.s*.12,f.fy-f.s*.3);x.lineTo(W*.35-f.s*.2+i*f.s*.12,f.fy+f.s*.3);x.stroke()}},
 v20(x,W,H,R,P){const cx=W*.5,cy=H*.4;x.fillStyle=RG(x,cx,cy,H*.05,H*.75,['#5a5662','#2a2630','#08060a'],-H*.1,-H*.2);SM(x,[[cx,-H*.3],[cx+W*.38,cy-H*.3],[cx+W*.4,cy+H*.2],[cx+W*.3,H*1.1],[cx-W*.3,H*1.1],[cx-W*.4,cy+H*.2],[cx-W*.38,cy-H*.3]]);x.fill();
  x.strokeStyle='rgba(0,0,0,.6)';x.lineWidth=1.4;for(let i=0;i<30;i++){x.beginPath();let px=cx+(R()-.5)*W*.7,py=R()*H;x.moveTo(px,py);for(let j=0;j<4;j++){px+=(R()-.5)*20;py+=R()*16;x.lineTo(px,py)}x.stroke()}
  for(const k of[-1,1]){const ex=cx+k*W*.13,ey=cy-H*.05;x.fillStyle='#000';x.beginPath();x.ellipse(ex,ey,W*.08,H*.06,k*.2,0,TAU);x.fill();glow(x,ex,ey,W*.05,P.g,.4);
   x.fillStyle=LGr(x,0,ey,0,H,['rgba(120,10,20,.95)','rgba(60,0,8,.9)']);x.beginPath();x.moveTo(ex-W*.03,ey+H*.03);x.quadraticCurveTo(ex+k*W*.02,H*.7,ex+k*W*.03-W*.04,H);x.lineTo(ex+k*W*.03+W*.04,H);x.quadraticCurveTo(ex+k*W*.04,H*.7,ex+W*.03,ey+H*.03);x.fill();
   for(let i=0;i<6;i++)face(x,R,ex+k*W*.025+(R()-.5)*W*.03,ey+H*.15+i*H*.12,H*.028,{skin:'#d8a8a0',mouth:1,hollow:1})}
  x.fillStyle='#000';x.beginPath();x.ellipse(cx,cy+H*.3,W*.1,H*.04,0,0,TAU);x.fill()},
 v21(x,W,H,R,P){const cx=W*.55,cy=H*.48,r=H*.16;x.save();x.translate(cx,cy);x.rotate(-.2);x.scale(1,.32);x.globalCompositeOperation='lighter';for(let i=0;i<5;i++){x.strokeStyle=hexA(i%2?'#ffb060':'#ffe0a0',.35);x.lineWidth=8-i;x.beginPath();x.arc(0,0,r*(1.5+i*.35),0,TAU);x.stroke()}glow(x,0,0,r*3.2,'#ff8a30',.35);x.restore();
  x.fillStyle='#000';x.beginPath();x.arc(cx,cy,r,0,TAU);x.fill();x.strokeStyle='rgba(255,230,180,.9)';x.lineWidth=1.5;x.stroke();x.save();x.translate(cx,cy);x.rotate(-.2);x.scale(1,.32);x.globalCompositeOperation='lighter';x.strokeStyle='rgba(255,200,120,.6)';x.lineWidth=5;x.beginPath();x.arc(0,0,r*1.6,0,Math.PI);x.stroke();x.restore();
  x.save();x.translate(W*.2,H*.3);x.rotate(.35);x.fillStyle=LGr(x,0,0,W*.35,0,['#3a4044','#14181a','rgba(255,160,80,.8)']);P2(x,[[-30,-8],[10,-6],[W*.35,-1],[W*.35,1],[10,6],[-30,8]]);x.fill();for(let i=0;i<6;i++){glow(x,-24+i*8,0,3,'#ffb060',.8)}x.restore();
  corpse(x,R,W*.3,H*.2,H*.06,.8,{c:'#3a3430'});corpse(x,R,W*.15,H*.7,H*.07,-.5,{c:'#2a2624'});
  {const cx=W*.55,cy=H*.48,r=H*.16;x.save();x.translate(cx-r*2.3,cy+r*.5);x.rotate(-.3);x.scale(1.35,.9);for(let k=3;k>0;k--){x.globalAlpha=.2;face(x,R,k*H*.05,-k*H*.01,H*.14,{skin:'#c09a80',mouth:1})}x.globalAlpha=1;face(x,R,0,0,H*.14,{skin:'#c09a80',mouth:1,blood:1,hollow:1});x.restore();
  x.save();x.globalCompositeOperation='lighter';for(let i=0;i<60;i++){const a=R()*TAU,d=r*(1.3+R()*2.2);x.strokeStyle=`rgba(255,${150+R()*80|0},90,${.1+R()*.3})`;x.lineWidth=.6+R();x.save();x.translate(cx,cy);x.rotate(-.2);x.scale(1,.32);x.beginPath();x.arc(0,0,d,a,a+.25+R()*.4);x.restore();x.stroke()}x.restore();
  x.save();x.globalCompositeOperation='lighter';x.strokeStyle='rgba(255,240,210,.55)';x.lineWidth=1;x.beginPath();x.arc(cx,cy,r*1.12,0,TAU);x.stroke();x.restore();
}},
 v22(x,W,H,R,P){suit(x,R,P,W*.5,H*1.12,H*.27,{inside:visorFace(R,{skin:'#6a8090',hollow:1,mouth:.7,water:.25}),visor:'#0a1a2a',lamp:1,helmC:'#8a9090'});for(let i=0;i<7;i++)tentacle(x,W*.5+(R()-.5)*W*.3,H*.88,H*.4,-1.57+(R()-.5)*2.4,3,P,R,30,1);
  x.save();x.globalCompositeOperation='lighter';for(let i=0;i<20;i++){x.strokeStyle='rgba(150,200,240,.4)';x.lineWidth=.8;const bx=W*.5+(R()-.5)*W*.4,by=H*(.1+R()*.4);x.beginPath();x.arc(bx,by,1+R()*3,0,TAU);x.stroke()}x.restore()},
 v23(x,W,H,R,P){stars2(x,W,H,R,160);const cx=W*.5,cy=H*.55;x.fillStyle=RG(x,cx,cy,H*.1,W*.6,['#000','#000','rgba(0,0,0,.85)','rgba(0,0,0,0)']);x.fillRect(0,0,W,H);
  const mw=W*.36,mh=H*.22;x.fillStyle='#000';x.beginPath();x.ellipse(cx,cy,mw,mh,0,0,TAU);x.fill();x.fillStyle=RG(x,cx,cy,1,mh,['#3a0a2a','#000']);x.beginPath();x.ellipse(cx,cy,mw*.8,mh*.7,0,0,TAU);x.fill();
  mawRing(x,R,cx,cy,mw,mh,3,{n:26,core:'#5a1060',gum:'#1a0a20',tc:'#d8d0e0'});
  for(let i=0;i<22;i++){const a=R()*TAU,d=1.25+R()*.9;eyeAt(x,cx+Math.cos(a)*mw*d,cy+Math.sin(a)*mh*d*1.4,W*(.015+R()*.03),H*(.008+R()*.012),P,R,-Math.cos(a),-Math.sin(a)*.5)}
  x.save();x.globalCompositeOperation='lighter';for(let i=0;i<14;i++){const a=R()*TAU,d=W*(.25+R()*.3);const sx=cx+Math.cos(a)*d,sy=cy+Math.sin(a)*d*.6;x.strokeStyle='rgba(220,220,255,.5)';x.lineWidth=1;x.beginPath();x.moveTo(sx,sy);x.lineTo(lerp(sx,cx,.25),lerp(sy,cy,.25));x.stroke()}x.restore()},
});
const SC2={v1:'space',v2:'void',v3:'flesh',v4:'wreck',v5:'ocean',v6:'void',v7:'corridor',v8:'planet',v9:'space',v10:'void',v11:'corridor',v12:'space',v13:'void',v14:'flesh',v15:'void',v16:'ocean',v17:'flesh',v18:'ocean',v19:'chapel',v20:'void',v21:'space',v22:'ocean',v23:'void'};
for(const k in SC2)SPEC[k]=k+'@'+SC2[k];
function spineTent(x,R,P,p,w,N=80,suck=1,c){const pts=[];for(let i=0;i<=N;i++){const t=i/N,u=1-t;const px=u*u*u*p[0][0]+3*u*u*t*p[1][0]+3*u*t*t*p[2][0]+t*t*t*p[3][0],py=u*u*u*p[0][1]+3*u*u*t*p[1][1]+3*u*t*t*p[2][1]+t*t*t*p[3][1];pts.push([px,py,w*(1-t*.92)])}
 for(const[qx,qy,r]of pts){x.fillStyle=RG(x,qx,qy,r*.1,r,[c||P.c[1],P.m,P.s],-r*.4,-r*.4);x.beginPath();x.arc(qx,qy,r,0,TAU);x.fill()}
 x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=.8;for(let i=2;i<N-1;i+=2){const[qx,qy,r]=pts[i],[nx,ny]=pts[i+1],a=Math.atan2(ny-qy,nx-qx)+1.57;x.beginPath();x.moveTo(qx+Math.cos(a)*r*.95,qy+Math.sin(a)*r*.95);x.quadraticCurveTo(qx+Math.cos(a-1.57)*r*.4,qy+Math.sin(a-1.57)*r*.4,qx-Math.cos(a)*r*.95,qy-Math.sin(a)*r*.95);x.stroke()}
 if(suck)for(let i=3;i<N-2;i+=3){const[qx,qy,r]=pts[i],[nx,ny]=pts[i+1],a=Math.atan2(ny-qy,nx-qx)+1.57,sx=qx+Math.cos(a)*r*.62,sy=qy+Math.sin(a)*r*.62;x.fillStyle=RG(x,sx,sy,0,r*.32,['#000',hexA(P.g,.5),hexA(P.g,.1)]);x.beginPath();x.ellipse(sx,sy,r*.32,r*.22,a,0,TAU);x.fill()}
 x.save();x.globalCompositeOperation='lighter';for(let i=2;i<N;i+=3){const[qx,qy,r]=pts[i];if(r>2){x.fillStyle='rgba(255,255,255,.16)';x.beginPath();x.ellipse(qx-r*.4,qy-r*.45,r*.25,r*.09,-.6,0,TAU);x.fill()}}x.restore();return pts}
function mech(x,R,P,cx,cy,r,o={}){// horror drone
 const ac=o.arms??4;for(let i=0;i<ac;i++){const a=(o.a0??.5)+i/ac*TAU+(R()-.5)*.3,ex=cx+Math.cos(a)*r*1.3,ey=cy+Math.sin(a)*r*1.1,fx=ex+Math.cos(a+.8)*r*1.0,fy=ey+Math.sin(a+.8)*r*1.0+r*.4;
  for(const[w,c]of[[r*.26,'#121618'],[r*.1,'#4a5458']]){x.strokeStyle=c;x.lineWidth=w;x.lineCap='round';x.beginPath();x.moveTo(cx,cy);x.lineTo(ex,ey);x.lineTo(fx,fy);x.stroke()}x.lineCap='butt';
  x.fillStyle=RG(x,ex,ey,1,r*.2,['#8a9498','#1a1e20']);x.beginPath();x.arc(ex,ey,r*.18,0,TAU);x.fill();const tool=(o.tools||'claw')[i%((o.tools||'claw').length)]||'c';
  x.save();x.translate(fx,fy);x.rotate(a+.8);x.fillStyle='#1a1e20';if(tool==='s'){x.fillStyle='#8a8a84';x.beginPath();x.arc(0,0,r*.28,0,TAU);x.fill();x.fillStyle='#2a2a28';for(let k=0;k<12;k++){const b=k/12*TAU;x.beginPath();x.moveTo(Math.cos(b)*r*.28,Math.sin(b)*r*.28);x.lineTo(Math.cos(b+.2)*r*.36,Math.sin(b+.2)*r*.36);x.lineTo(Math.cos(b+.4)*r*.28,Math.sin(b+.4)*r*.28);x.fill()}}
   else if(tool==='n'){x.fillStyle='#c8d0d0';x.fillRect(0,-1,r*.6,2);x.fillStyle='#2a3a3a';x.fillRect(-r*.15,-r*.08,r*.2,r*.16);x.fillStyle=hexA(P.a,.7);x.fillRect(-r*.12,-r*.05,r*.14,r*.1)}
   else if(tool==='w'){x.fillRect(0,-r*.06,r*.3,r*.12);x.restore();sparks(x,R,fx+Math.cos(a+.8)*r*.35,fy+Math.sin(a+.8)*r*.35,14,r*.6,'#ffb050');x.save()}
   else{x.strokeStyle='#5a6266';x.lineWidth=r*.07;for(const k of[-1,1]){x.beginPath();x.moveTo(0,0);x.quadraticCurveTo(r*.3,k*r*.25,r*.45,k*r*.05);x.stroke()}}x.restore()}
 x.fillStyle=RG(x,cx,cy,r*.1,r*1.05,[o.body||'#7a8488','#2a3234','#050607'],-r*.4,-r*.45);P2(x,ring(cx,cy,r,r*.9,o.sides||8,R,.08,.39));x.fill();
 x.save();P2(x,ring(cx,cy,r,r*.9,o.sides||8,R,0,.39));x.clip();x.strokeStyle='rgba(0,0,0,.6)';x.lineWidth=1;for(let i=0;i<5;i++){x.beginPath();x.moveTo(cx-r,cy-r*.6+i*r*.3);x.lineTo(cx+r,cy-r*.5+i*r*.3);x.stroke()}speck(x,R,cx-r,cy-r,r*2,r*2,r*r*.5,['rgba(0,0,0,.4)','rgba(140,60,20,.45)','rgba(200,200,190,.15)'],2.5);
 for(let i=0;i<5;i++){x.fillStyle=LGr(x,0,cy,0,cy+r,['rgba(130,55,15,.55)','rgba(130,55,15,0)']);x.fillRect(cx-r+R()*r*2,cy-r*.3+R()*r*.5,1.5,r*.6)}
 if(o.stripe){x.save();x.beginPath();x.rect(cx-r,cy+r*.45,r*2,r*.2);x.clip();for(let i=-6;i<6;i++){x.fillStyle='#c8961e';P2(x,[[cx+i*r*.25,cy+r*.45],[cx+i*r*.25+r*.12,cy+r*.45],[cx+i*r*.25,cy+r*.65],[cx+i*r*.25-r*.12,cy+r*.65]]);x.fill()}x.restore()}x.restore();
 const lc=o.eye||'#ff2a20',er=r*(o.er||.42);x.fillStyle='#000';x.beginPath();x.arc(cx,cy,er,0,TAU);x.fill();for(let i=3;i>0;i--){x.strokeStyle=`rgba(${i*30},${i*34},${i*36},1)`;x.lineWidth=er*.12;x.beginPath();x.arc(cx,cy,er*(i/3.2),0,TAU);x.stroke()}
 glow(x,cx,cy,er*2.4,lc,.5);x.fillStyle=lc;x.beginPath();x.arc(cx,cy,er*.3,0,TAU);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(cx-er*.1,cy-er*.12,er*.08,0,TAU);x.fill();
 for(let i=0;i<(o.cables??3);i++)cable(x,cx+(R()-.5)*r,cy+r*.7,cx+(R()-.5)*r*2,cy+r*(1.6+R()),r*.4,r*.1,'#0e1112');}
function shipH(x,R,P,cx,cy,L,ang,o={}){x.save();x.translate(cx,cy);x.rotate(ang);const h=L*(o.h||.16),dp=h*.55;
 if(!o.dark)for(let k=0;k<(o.eng||3);k++){const ey=(k-(o.eng||3)/2+.5)*h*.45;glow(x,-L*.5,ey,h*1.2,o.ec||P.a,.4);x.save();x.globalCompositeOperation='lighter';x.fillStyle=LGr(x,-L*.5,0,-L*1.2,0,[hexA(o.ec||P.a,.4),hexA(o.ec||P.a,0)]);x.fillRect(-L*1.2,ey-h*.08,L*.7,h*.16);x.restore()}
 const top=[[-L*.5,-h*.5],[L*.25,-h*.42],[L*.5,-h*.05],[L*.5,0],[-L*.5,0]],side=[[-L*.5,0],[L*.5,0],[L*.46,h*.12],[L*.2,dp],[-L*.5,dp]];
 metalP(x,R,top,{cols:['#6a7274','#3a4244','#1a1e20'],pw:L*.05,lights:o.dark?0:(o.lights??14),lc:o.lc||'#ffc070'});metalP(x,R,side,{cols:['#1e2426','#0c0f10','#030404'],pw:L*.06,lights:o.dark?0:(o.lights??14)/2,lc:o.lc||'#ffc070'});
 for(let i=0;i<(o.blocks??4);i++){const bx=-L*.42+R()*L*.55,bw=L*(.06+R()*.1),bh=h*(.2+R()*.35);metalP(x,R,[[bx,-h*.45-bh],[bx+bw,-h*.45-bh],[bx+bw,-h*.4],[bx,-h*.4]],{cols:['#5a6264','#1a1e20'],pw:8,lights:o.dark?0:3,lc:o.lc||'#ffc070'});if(R()<.5){x.fillStyle='#14181a';x.fillRect(bx+bw*.5,-h*.45-bh-h*.4,1.5,h*.4);if(!o.dark)glow(x,bx+bw*.5,-h*.45-bh-h*.4,4,'#ff2a1a',.9)}}
 for(let k=0;k<(o.eng||3);k++){const ey=(k-(o.eng||3)/2+.5)*h*.45;x.fillStyle=LGr(x,0,ey-h*.15,0,ey+h*.15,['#5a6264','#14181a']);P2(x,[[-L*.5,ey-h*.1],[-L*.56,ey-h*.17],[-L*.56,ey+h*.17],[-L*.5,ey+h*.1]]);x.fill();if(!o.dark){x.fillStyle=o.ec||P.a;x.fillRect(-L*.565,ey-h*.14,2,h*.28)}}
 x.strokeStyle='rgba(200,210,210,.3)';x.lineWidth=1;x.beginPath();x.moveTo(-L*.5,0);x.lineTo(L*.5,0);x.stroke();if(o.after)o.after(x,L,h);x.restore()}
Object.assign(PAINT,{
 m1(x,W,H,R,P){corpse(x,R,W*.62,H*.86,H*.2,-.15,{c:'#3a3230',blood:1});mech(x,R,P,W*.42,H*.42,H*.17,{arms:3,tools:'wcs',body:'#8a6a4a',cables:4,a0:.2});sparks(x,R,W*.62,H*.8,20,24,'#ffb040',-1.2,2)},
 m2(x,W,H,R,P){for(let i=0;i<4;i++)corpse(x,R,W*(.15+i*.24),H*(.9+R()*.06),H*.11,(R()-.5)*.8,{c:'#2a2624',blood:R()<.5});mech(x,R,P,W*.5,H*.42,H*.2,{arms:2,tools:'cc',stripe:1,er:.5,a0:2.2});
  for(const k of[-1,1])metalP(x,R,[[W*.5+k*H*.25,H*.2],[W*.5+k*H*.55,H*.25],[W*.5+k*H*.55,H*.75],[W*.5+k*H*.25,H*.7]],{pw:8,cols:['#4a4a44','#1a1a18'],lights:2,lc:'#ff3020'});
  x.save();x.globalCompositeOperation='lighter';x.fillStyle=LGr(x,W*.5,H*.42,W*.5,H,['rgba(255,40,30,.35)','rgba(255,40,30,0)']);P2(x,[[W*.5,H*.42],[W*.2,H],[W*.8,H]]);x.fill();x.restore();x.fillStyle='rgba(200,180,140,.5)';x.font='bold 9px monospace';x.fillText('PERIMETER',W*.05,H*.12)},
 m3(x,W,H,R,P){const tx=W*.82,ty=H*.75;x.fillStyle='#000';x.beginPath();x.ellipse(tx,ty-H*.15,8,9,0,0,TAU);x.fill();x.beginPath();x.moveTo(tx-14,ty+30);x.lineTo(tx-6,ty-H*.1);x.lineTo(tx+8,ty-H*.1);x.lineTo(tx+16,ty+30);x.fill();rim(x,P.g,1,.7);
  const ds=[];for(let i=0;i<22;i++){const t=Math.pow(R(),1.4);ds.push([lerp(W*.05,tx-30,R()*.9),lerp(H*.1,H*.85,R()),H*(.02+t*.1)])}ds.sort((a,b)=>a[2]-b[2]);for(const[dx,dy,s]of ds){x.save();x.globalCompositeOperation='lighter';x.strokeStyle='rgba(255,40,30,.25)';x.lineWidth=s*.4;x.beginPath();x.moveTo(dx,dy);x.lineTo(dx-s*7,dy-s*1.5);x.stroke();x.restore();mech(x,R,P,dx,dy,s,{arms:3,tools:'n',cables:0,er:.5})}},
 m4(x,W,H,R,P){metalP(x,R,[[W*.05,H*.78],[W*.95,H*.72],[W*.95,H*.82],[W*.05,H*.88]],{cols:['#8a9090','#2a2e2e'],pw:30});face(x,R,W*.25,H*.68,H*.13,{rot:-1.4,mouth:1,blood:1,skin:'#a89088'});
  x.fillStyle='#2a2624';x.beginPath();x.ellipse(W*.55,H*.72,W*.25,H*.07,-.05,0,TAU);x.fill();for(let i=0;i<3;i++){x.fillStyle='#4a3a2a';x.fillRect(W*(.35+i*.17),H*.66,6,H*.14)}splat(x,R,W*.58,H*.72,W*.08,'rgba(110,0,10,.9)');drips(x,R,W*.4,W*.75,H*.82,H*.12,8);
  mech(x,R,P,W*.58,H*.25,H*.14,{arms:4,tools:'nsnc',body:'#c8ccc8',a0:1.2,eye:'#40ffb0'});x.save();x.globalCompositeOperation='lighter';x.fillStyle='rgba(90,255,190,.4)';x.fillRect(W*.82,H*.1,6,18);x.fillRect(W*.82-6,H*.1+6,18,6);x.restore()},
 m5(x,W,H,R,P){metalP(x,R,[[W*.62,0],[W,0],[W,H],[W*.7,H]],{pw:14,lights:6,lc:'#ffb060'});x.fillStyle='#000';SM(x,ring(W*.7,H*.5,W*.06,H*.2,10,R,.5));x.fill();
  shipH(x,R,P,W*.36,H*.52,W*.6,-.05,{h:.22,blocks:3,ec:'#ff8a30',after:(x,L,h)=>{x.fillStyle='#8a8a84';x.beginPath();x.arc(L*.52,-h*.15,h*.55,0,TAU);x.fill();x.fillStyle='#1a1a18';for(let k=0;k<16;k++){const b=k/16*TAU;x.beginPath();x.moveTo(L*.52+Math.cos(b)*h*.55,-h*.15+Math.sin(b)*h*.55);x.lineTo(L*.52+Math.cos(b+.2)*h*.7,-h*.15+Math.sin(b+.2)*h*.7);x.lineTo(L*.52+Math.cos(b+.4)*h*.55,-h*.15+Math.sin(b+.4)*h*.55);x.fill()}x.fillStyle='#2a2a28';x.beginPath();x.arc(L*.52,-h*.15,h*.15,0,TAU);x.fill()}});
  sparks(x,R,W*.68,H*.47,40,60,'#ffb040',-2.6,2.4);for(let i=0;i<3;i++)corpse(x,R,W*(.75+R()*.2),H*(.1+R()*.8),H*.06,R()*6,{c:'#3a3230'})},
 m6(x,W,H,R,P){const cx=W*.42,by=H*1.02,lx=W*.68,ly=H*.42;glow(x,lx,ly,W*.5,'#ffb050',.4);
  for(let i=0;i<3;i++)corpse(x,R,W*(.15+i*.3),H*.93,H*.1,(R()-.5)*.5,{c:'#3a2c24'});
  x.fillStyle=LGr(x,cx-30,0,cx+30,0,['#1a1c1c','#5a6060','#141616']);x.fillRect(cx-6,by-H*.45,12,H*.45);x.fillRect(cx-28,by-H*.5,10,H*.5);x.fillRect(cx+18,by-H*.5,10,H*.5);
  x.save();x.translate(cx,by-H*.68);for(let i=0;i<6;i++){x.strokeStyle='#4a5254';x.lineWidth=3;x.beginPath();x.ellipse(0,i*8-16,26-i*1.5,5,0,0,Math.PI);x.stroke()}x.fillStyle='#2a3032';x.fillRect(-3,-22,6,50);x.restore();
  x.fillStyle=RG(x,cx,by-H*.92,2,22,['#7a8284','#1a1e20']);x.beginPath();x.ellipse(cx,by-H*.92,16,20,0,0,TAU);x.fill();x.fillStyle='#000';x.fillRect(cx-12,by-H*.95,24,6);glow(x,cx-5,by-H*.93,5,'#ffb050',.9);glow(x,cx+5,by-H*.93,5,'#ffb050',.9);
  x.strokeStyle='#3a4244';x.lineWidth=5;x.lineCap='round';x.beginPath();x.moveTo(cx+24,by-H*.75);x.lineTo(lx-10,ly+30);x.lineTo(lx,ly+12);x.stroke();x.beginPath();x.moveTo(cx-24,by-H*.75);x.lineTo(cx-34,by-H*.45);x.lineTo(cx-30,by-H*.3);x.stroke();x.lineCap='butt';
  x.strokeStyle='#1a1410';x.lineWidth=2;x.beginPath();x.moveTo(lx,ly+12);x.lineTo(lx,ly-14);x.stroke();glow(x,lx,ly,22,'#fff0c0',.9);x.strokeStyle='#2a2018';for(let i=-1;i<=1;i++){x.beginPath();x.moveTo(lx+i*7,ly-12);x.lineTo(lx+i*9,ly+12);x.stroke()}},
 m7(x,W,H,R,P){metalP(x,R,[[W*.28,H*.3],[W*.72,H*.3],[W*.78,H],[W*.22,H]],{cols:['#3a3226','#120e0a'],pw:20,rust:0});x.globalAlpha=.8;suit(x,R,P,W*.5,H*1.02,H*.17,{inside:(x,cx,cy,s)=>skull(x,cx,cy+s*.1,s*.55,R,0,'#b0d8d0'),helmC:'#6a8a88',suitC:'#2a4a48',visor:'#0a2a2a',lamp:0,lc:'#6affd0'});x.globalAlpha=1;
  glow(x,W*.5,H*.55,W*.3,'#60ffd0',.25);hand(x,R,W*.25,H*.85,H*.07,1.6,{skin:'#9ad0c8',spread:.5,curl:1.2});hand(x,R,W*.75,H*.85,H*.07,-1.6,{skin:'#9ad0c8',spread:.5,curl:-1.2})},
 m8(x,W,H,R,P){// Railgun Platform: a heavy turret on a broken hull, its dead gunners still strapped in
  stars2(x,W,H*.5,R,70);glow(x,W*.85,H*.15,W*.25,'#ff7a30',.25);
  metalP(x,R,[[0,H*.7],[W*.35,H*.62],[W*.62,H*.66],[W,H*.6],[W,H],[0,H]],{pw:14,lights:5,lc:'#ff3020',cols:['#5a6062','#22282a','#08090a']});
  x.fillStyle='#000';P2(x,[[W*.62,H*.66],[W*.7,H*.74],[W*.8,H*.7],[W*.86,H*.8],[W*.96,H*.72],[W,H*.75],[W,H*.6]]);x.fill();glow(x,W*.82,H*.72,W*.1,'#ff5a20',.5);sparks(x,R,W*.8,H*.7,16,22,'#ffb040',-1.6,1.5);
  for(let i=0;i<5;i++)cable(x,W*(.05+R()*.5),H*(.75+R()*.15),W*(.3+R()*.6),H*(.8+R()*.15),12+R()*12,2+R()*2);
  const bx=W*.44,by=H*.64;
  x.fillStyle=LGr(x,bx-W*.17,0,bx+W*.17,0,['#2a3032','#6a7274','#3a4244','#0c0f10']);x.fillRect(bx-W*.17,by-H*.2,W*.34,H*.2);x.beginPath();x.ellipse(bx,by,W*.17,H*.05,0,0,Math.PI);x.fill();
  x.fillStyle=LGr(x,0,by-H*.26,0,by-H*.16,['#8a9294','#3a4244']);x.beginPath();x.ellipse(bx,by-H*.2,W*.17,H*.05,0,0,TAU);x.fill();
  for(let i=0;i<9;i++){const px=bx-W*.16+i*W*.04;x.strokeStyle='rgba(0,0,0,.5)';x.lineWidth=1;x.beginPath();x.moveTo(px,by-H*.17);x.lineTo(px,by+H*.03);x.stroke()}
  for(let i=0;i<4;i++){x.fillStyle='#ff3020';x.fillRect(bx-W*.13+i*W*.07,by-H*.1,3,2);glow(x,bx-W*.13+i*W*.07,by-H*.1,5,'#ff3020',.8)}
  x.save();x.translate(bx+W*.02,by-H*.25);x.rotate(-.42);
  metalP(x,R,[[-W*.06,-H*.07],[W*.08,-H*.09],[W*.1,H*.06],[-W*.06,H*.07]],{pw:8,cols:['#6a7274','#22282a'],lights:2,lc:'#ff3020'});
  for(const o of[-1,1])metalP(x,R,[[W*.08,o*H*.035-4],[W*.7,o*H*.03-3],[W*.7,o*H*.03+3],[W*.08,o*H*.035+4]],{pw:10,cols:['#8a9294','#2a3032','#0a0c0d']});
  for(let i=0;i<8;i++){const px=W*(.14+i*.07);x.fillStyle='#b8741c';x.fillRect(px,-H*.055,4,H*.11);x.fillStyle='rgba(0,0,0,.4)';x.fillRect(px+3,-H*.055,1,H*.11);glow(x,px+2,0,9,P.a,.55)}
  x.save();x.globalCompositeOperation='lighter';x.fillStyle=LGr(x,W*.1,0,W*.7,0,[hexA(P.a,.0),hexA(P.a,.55)]);x.fillRect(W*.1,-2,W*.6,4);x.restore();glow(x,W*.72,0,W*.12,P.a,.8);glow(x,W*.72,0,W*.04,'#ffffff',.9);sparks(x,R,W*.72,0,26,50,'#a8f0ff',0,.9);x.restore();
  for(const[k,sx,sy,ss]of[[-1,bx-W*.25,by+H*.12,H*.1],[1,bx+W*.26,by+H*.1,H*.095]]){
   cable(x,sx,sy-ss*1.6,bx+k*W*.1,by-H*.15,-10,2.5);
   x.fillStyle='#14181a';x.fillRect(sx-ss*1.4,sy-ss*3.1,ss*2.8,ss*3.4);x.fillStyle='#2a3032';x.fillRect(sx-ss*1.4,sy-ss*3.1,ss*2.8,3);
   suit(x,R,P,sx,sy,ss,{inside:visorFace(R,{skin:'#8a7a70',hollow:1,mouth:1,blood:1}),crack:k>0,blood:1});
   x.strokeStyle='#2a1a10';x.lineWidth=4;for(const d of[-1,1]){x.beginPath();x.moveTo(sx-ss*1.3,sy-ss*.6);x.lineTo(sx+d*ss*.2,sy+ss*.2);x.lineTo(sx+ss*1.3*-d,sy-ss*.6);x.stroke()}
   x.fillStyle='#b8a070';x.fillRect(sx-3,sy-3,6,6);drips(x,R,sx-ss,sx+ss,sy,H*.08,4,'#6a0610');chain(x,sx-ss*1.4,sy-ss*3,sx-ss*1.6,sy+ss*.6,2)}
  corpse(x,R,W*.15,H*.92,H*.13,.1,{c:'#3a302a',blood:1});drips(x,R,bx-W*.12,bx+W*.12,by+H*.02,H*.06,5)},
 m9(x,W,H,R,P){const pr=W*1.1,pcx=W*.4,pcy=H+pr*.75;glow(x,pcx,pcy-pr,W*.6,'#ff6a20',.3);x.fillStyle=RG(x,pcx,pcy,pr*.5,pr,['#000','#1a0804','#3a1a0a']);x.beginPath();x.arc(pcx,pcy,pr,0,TAU);x.fill();rim(x,'#ff8a40',2,.6);
  shipH(x,R,P,W*.52,H*.42,W*.95,-.08,{h:.2,blocks:9,lights:60,lc:'#ff8a30',ec:'#ff6a20',eng:4,after:(x,L,h)=>{for(let i=0;i<10;i++){const fx=-L*.4+R()*L*.8,fy=-h*.3+R()*h*.5;glow(x,fx,fy,6+R()*10,'#ff5010',.7)}}});
  x.save();x.globalCompositeOperation='lighter';for(let i=0;i<140;i++){x.fillStyle=`rgba(255,${120+R()*80|0},60,${R()*.7})`;x.fillRect(R()*W,R()*H,1+R(),1+R())}x.restore();
  for(let i=0;i<4;i++){const px=W*(.1+R()*.8),py=H*(.68+R()*.2);x.save();x.translate(px,py);x.rotate(R()*3);x.fillStyle=LGr(x,-8,0,8,0,['#2a3032','#6a7274','#1a1e20']);x.fillRect(-8,-3.5,16,7);x.fillStyle='rgba(120,200,220,.45)';x.fillRect(-5,-2,10,4);x.fillStyle='#2a1a14';x.fillRect(-4,-1,8,2);x.restore()}},
 m10(x,W,H,R,P){const cx=W*.5,cy=H*.48,r=H*.28;metalP(x,R,[[cx-r*1.6,cy-r*1.3],[cx+r*1.6,cy-r*1.3],[cx+r*1.6,cy+r*1.4],[cx-r*1.6,cy+r*1.4]],{pw:14,cols:['#3a3a36','#121210'],lights:8,lc:'#ff3020'});
  x.fillStyle=RG(x,cx,cy,r*.05,r,['#fff8e0','#ffb040','#c03a08','#2a0800']);x.beginPath();x.arc(cx,cy,r,0,TAU);x.fill();face(x,R,cx,cy+r*.05,r*.6,{skin:'#ffb070',hollow:1,glow:'#ffffff',mouth:1});
  x.strokeStyle='#2a2a28';x.lineWidth=4;x.beginPath();x.arc(cx,cy,r*1.04,0,TAU);x.stroke();for(let i=0;i<8;i++){const a=i/8*TAU;x.fillStyle='#4a4a44';x.fillRect(cx+Math.cos(a)*r*1.04-3,cy+Math.sin(a)*r*1.04-3,6,6)}
  x.save();x.globalCompositeOperation='lighter';for(let i=0;i<8;i++){let a=R()*TAU,px=cx+Math.cos(a)*r,py=cy+Math.sin(a)*r;x.strokeStyle='rgba(160,220,255,.85)';x.lineWidth=1.2;x.beginPath();x.moveTo(px,py);for(let j=0;j<7;j++){px+=Math.cos(a)*r*.12+(R()-.5)*14;py+=Math.sin(a)*r*.12+(R()-.5)*14;x.lineTo(px,py)}x.stroke()}x.restore();glow(x,cx,cy,r*2,'#ff7a20',.35)},
 m11(x,W,H,R,P){const sx=W*.08,sy=H*.82,tx=W*.72,ty=H*.36;mech(x,R,P,sx+10,sy,H*.12,{arms:0,cables:0,er:.6,eye:'#a8f0ff'});x.save();x.globalCompositeOperation='lighter';const a=Math.atan2(ty-sy,tx-sx),l=Math.hypot(tx-sx,ty-sy);x.translate(sx,sy);x.rotate(a);for(const[w,al]of[[22,.12],[11,.3],[4,.7],[1.5,1]]){x.fillStyle=hexA(w<2?'#ffffff':'#7ae0ff',al);x.fillRect(0,-w/2,l,w)}x.restore();
  flesh2(x,R,tx+W*.08,ty,W*.16,H*.22,{c1:'#4a3050',c2:'#14081a',n:14});for(let i=0;i<3;i++)tentacle(x,tx+W*.1,ty,H*.4,R()*TAU,5,P,R,30,1);sparks(x,R,tx,ty,50,70,'#a8f0ff',Math.PI+a,2.6);splat(x,R,tx+12,ty+10,16,'rgba(60,0,30,.9)')},
 m12(x,W,H,R,P){x.fillStyle='#000';x.fillRect(W*.25,H*.15,W*.5,H*.7);x.save();x.beginPath();x.rect(W*.25,H*.15,W*.5,H*.7);x.clip();stars2(x,W,H,R,160);x.restore();
  for(const k of[-1,1])metalP(x,R,[[W*.5+k*W*.25,0],[W*.5+k*W*.6,0],[W*.5+k*W*.6,H],[W*.5+k*W*.25,H]],{pw:16,lights:3,lc:'#ff2010'});x.fillStyle='#c8961e';for(let i=0;i<10;i++){x.fillRect(W*.25+i*W*.05,H*.12,W*.025,H*.03);x.fillRect(W*.25+i*W*.05,H*.85,W*.025,H*.03)}
  glow(x,W*.15,H*.08,W*.2,'#ff1a10',.7);glow(x,W*.85,H*.08,W*.2,'#ff1a10',.7);for(let i=0;i<5;i++){const t=i/5;corpse(x,R,lerp(W*.32,W*.62,R()),lerp(H*.25,H*.72,R()),H*(.1+t*.1),R()*6,{c:'#6a5a50',blood:1})}
  x.save();x.globalCompositeOperation='lighter';x.strokeStyle='rgba(200,220,255,.2)';for(let i=0;i<30;i++){x.lineWidth=.8;const y=H*(.2+R()*.6);x.beginPath();x.moveTo(W*.1,y);x.lineTo(W*.45,y+(R()-.5)*10);x.stroke()}x.restore();for(let i=0;i<14;i++){x.save();x.translate(lerp(W*.3,W*.7,R()),lerp(H*.2,H*.8,R()));x.rotate(R()*3);x.fillStyle='#2a2e30';x.fillRect(0,0,2+R()*8,1+R()*3);x.restore()}},
 m13(x,W,H,R,P){x.fillStyle='#03120e';x.fillRect(W*.55,H*.1,W*.38,H*.5);x.strokeStyle='#2a3032';x.lineWidth=4;x.strokeRect(W*.55,H*.1,W*.38,H*.5);x.save();x.translate(W*.74,H*.35);x.scale(.5,.5);PAINT.rune(x,W*.6,H*.8,R,P);x.restore();
  x.fillStyle=hexA(P.a,.5);x.font='7px monospace';for(let i=0;i<6;i++)x.fillText('> REBOOT '+'█'.repeat(1+i),W*.57,H*.15+i*9);
  face(x,R,W*.3,H*.48,H*.25,{skin:'#9a8a80',hollow:1,glow:P.a,mouth:.5,rot:.15});for(let i=0;i<7;i++)cable(x,W*(.22+i*.025),H*.28,W*(.55+R()*.4),H*(.6+R()*.4),H*.1,2+R()*2,'#101414');
  x.fillStyle='#3a4244';for(let i=0;i<7;i++){x.beginPath();x.arc(W*(.22+i*.025),H*.28,2.5,0,TAU);x.fill()}drips(x,R,W*.2,W*.4,H*.27,H*.08,5)},
});
Object.assign(PAINT,{
 m14(x,W,H,R,P){face(x,R,W*.45,H*.62,H*.36,{skin:'#8a7a70',hollow:1,mouth:.8,rot:-.3});const cx=W*.52,cy=H*.42,r=H*.1;
  for(let i=0;i<8;i++){const a=i/8*TAU+.2,k=i<4?-1:1,ex=cx+Math.cos(a)*r*2.4,ey=cy+Math.sin(a)*r*1.8;x.strokeStyle='#2a3032';x.lineWidth=2.4;x.beginPath();x.moveTo(cx,cy);x.lineTo(lerp(cx,ex,.6),lerp(cy,ey,.6)-r*.8);x.lineTo(ex,ey);x.stroke();x.strokeStyle='#8a9496';x.lineWidth=.6;x.stroke();x.fillStyle='#c8d0d0';x.fillRect(ex-.5,ey,1,4)}
  mech(x,R,P,cx,cy,r,{arms:0,cables:0,er:.5,body:'#6a5a48'});drips(x,R,W*.4,W*.6,H*.62,H*.15,5);splat(x,R,W*.52,H*.6,10,'rgba(110,0,10,.8)')},
 m15(x,W,H,R,P){const cx=W*.5,cy=H*.5;metalP(x,R,[[cx-W*.3,H*.02],[cx+W*.3,H*.02],[cx+W*.3,H*.98],[cx-W*.3,H*.98]],{pw:12,cols:['#5a6266','#1a1e20'],lights:6,lc:'#7ae0ff'});
  x.save();x.beginPath();x.ellipse(cx,cy,W*.22,H*.42,0,0,TAU);x.clip();x.fillStyle=LGr(x,0,0,0,H,['#a8d8e8','#3a6a80','#0a1a24']);x.fillRect(0,0,W,H);face(x,R,cx,cy-H*.05,H*.26,{skin:'#9ab0b8',mouth:1,hollow:0,eye:'#000',brow:-6});hand(x,R,cx-W*.12,cy+H*.15,H*.09,.3,{skin:'#a8c0c8',spread:1.3});hand(x,R,cx+W*.13,cy+H*.08,H*.09,-.2,{skin:'#a8c0c8',spread:1.3});
  x.fillStyle='rgba(220,245,255,.35)';for(let i=0;i<60;i++){x.beginPath();x.arc(cx+(R()-.5)*W*.44,cy+(R()-.5)*H*.84,1+R()*5,0,TAU);x.fill()}x.restore();x.strokeStyle='#8a9a9e';x.lineWidth=3;x.beginPath();x.ellipse(cx,cy,W*.22,H*.42,0,0,TAU);x.stroke();glow(x,cx,cy,W*.3,'#7ae0ff',.25)},
 m16(x,W,H,R,P){metalP(x,R,[[0,0],[W,0],[W,H*.18],[0,H*.18]],{pw:18,lights:5});const cx=W*.5,cy=H*.35;x.fillStyle='#14181a';x.fillRect(cx-10,H*.15,20,H*.12);
  mech(x,R,P,cx,cy,H*.15,{arms:0,cables:2,er:.5,stripe:1});for(const k of[-1,1]){x.save();x.translate(cx+k*H*.12,cy+H*.08);x.rotate(1.2+k*.1);metalP(x,R,[[0,-5],[H*.3,-4],[H*.3,4],[0,5]],{pw:6});x.restore()}
  x.save();x.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const tx=W*(.15+i*.35),ty=H*(.8+R()*.1);x.strokeStyle='rgba(255,40,30,.6)';x.lineWidth=1;x.beginPath();x.moveTo(cx,cy);x.lineTo(tx,ty);x.stroke();x.strokeStyle='rgba(255,40,30,.8)';x.beginPath();x.arc(tx,ty,8,0,TAU);x.moveTo(tx-12,ty);x.lineTo(tx+12,ty);x.moveTo(tx,ty-12);x.lineTo(tx,ty+12);x.stroke()}x.restore();
  robe(x,R,P,W*.2,H*1.08,H*.4,{face:'face',mouth:1,hood:'#2a2a2a',cloth:'#1a1a1a',stole:0});robe(x,R,P,W*.86,H*1.1,H*.36,{face:'face',mouth:.6,hood:'#2a2a2a',cloth:'#1a1a1a',stole:0})},
 m17(x,W,H,R,P){for(let i=0;i<10;i++){const a=R()*TAU,d=W*(.3+R()*.2);metalP(x,R,[[W*.5+Math.cos(a)*d*.5,H*.5+Math.sin(a)*d*.4],[W*.5+Math.cos(a)*d,H*.5+Math.sin(a)*d*.8],[W*.5+Math.cos(a+.5)*d,H*.5+Math.sin(a+.5)*d*.8],[W*.5+Math.cos(a+.5)*d*.5,H*.5+Math.sin(a+.5)*d*.4]],{pw:9})}
  const cx=W*.5,cy=H*.5;x.fillStyle=RG(x,cx,cy,H*.03,H*.32,['#4a5054','#1a1e20','#050606'],-H*.06,-H*.1);P2(x,ring(cx,cy,H*.3,H*.28,6,R,.05,.5));x.fill();for(let i=0;i<4;i++){x.fillStyle='#ff2a1a';x.fillRect(cx-H*.2+i*H*.13,cy-H*.05,H*.07,H*.025);glow(x,cx-H*.17+i*H*.13,cy-H*.04,6,'#ff2a1a',.8)}
  for(const k of[-1,1]){x.strokeStyle='#2a3032';x.lineWidth=10;x.lineCap='round';x.beginPath();x.moveTo(cx+k*H*.25,cy+H*.05);x.lineTo(cx+k*W*.38,cy+H*.15);x.lineTo(cx+k*W*.42,cy-H*.2);x.stroke();x.lineCap='butt';hand(x,R,cx+k*W*.42,cy-H*.24,H*.1,k*.3,{skin:'#4a5054',claw:1,spread:1.2})}
  sparks(x,R,cx,cy+H*.3,30,50,'#ffb040',1.57,2.4);corpse(x,R,W*.2,H*.85,H*.12,.3,{c:'#3a3230',blood:1})},
 m18(x,W,H,R,P){const cx=W*.48;for(let i=0;i<9;i++)corpse(x,R,cx+(R()-.5)*W*.35,H*(.28+R()*.18),H*(.1+R()*.04),(R()-.5)*1.2,{c:['#3a3230','#4a3a34','#2a2624'][i%3],blood:R()<.4});
  metalP(x,R,[[cx-W*.25,H*.42],[cx+W*.25,H*.42],[cx+W*.22,H*.5],[cx-W*.22,H*.5]],{pw:10,cols:['#8a7a40','#3a3018']});mech(x,R,P,cx,H*.66,H*.13,{arms:2,tools:'cc',stripe:1,cables:2,a0:-.5,body:'#8a7a40',eye:'#ffb030'});
  for(const k of[-1,1]){x.fillStyle='#1a1c1c';x.fillRect(cx+k*W*.12-6,H*.75,12,H*.25);x.fillStyle='#2a2e30';x.fillRect(cx+k*W*.12-12,H*.95,24,8)}drips(x,R,cx-W*.2,cx+W*.2,H*.5,H*.12,8)},
 m19(x,W,H,R,P){const cx=W*.36,cy=H*.48;x.fillStyle='#0a0c0c';x.fillRect(cx-W*.27,cy-H*.36,W*.54,H*.62);x.save();x.beginPath();x.rect(cx-W*.24,cy-H*.32,W*.48,H*.54);x.clip();for(let y=cy-H*.32;y<cy+H*.22;y+=2){x.fillStyle=`rgba(${150+R()*100|0},${150+R()*100|0},${150+R()*100|0},${.2+R()*.3})`;x.fillRect(cx-W*.24,y,W*.48,1)}
  x.globalAlpha=.7;face(x,R,cx,cy-H*.06,H*.22,{skin:'#d8d8d0',hollow:1,mouth:1});x.globalAlpha=1;for(let i=0;i<6;i++){x.fillStyle='rgba(0,0,0,.6)';x.fillRect(cx-W*.24,cy-H*.3+R()*H*.5,W*.48,2+R()*4)}x.restore();
  x.fillStyle='#14181a';x.fillRect(W*.78,H*.1,4,H*.9);for(let i=0;i<5;i++){x.fillRect(W*.7,H*(.15+i*.1),W*.2-i*4,2)}glow(x,W*.79,H*.1,8,'#ff2a1a',.9);x.save();x.globalCompositeOperation='lighter';for(let i=1;i<6;i++){x.strokeStyle=hexA(P.a,.4/i);x.lineWidth=1.5;x.beginPath();x.arc(W*.79,H*.1,i*14,.3,2.8);x.stroke()}x.restore()},
 m20(x,W,H,R,P){for(let i=0;i<5;i++){const bx=W*(.08+i*.2),by=H*.72;x.fillStyle=LGr(x,bx,0,bx+22,0,['#5a4a20','#a8902a','#3a3010']);x.fillRect(bx,by,22,H*.2);x.fillStyle='#000';x.fillRect(bx+3,by+4,16,5);x.fillStyle='#ff2a1a';x.fillRect(bx+5,by+5,3,3);glow(x,bx+6,by+6,5,'#ff2a1a',.9);cable(x,bx+11,by,W*.5,H*.5,20,1.4,'#7a1a1a')}
  const cx=W*.52,cy=H*.4;x.fillStyle=LGr(x,cx-20,0,cx+20,0,['#1a1c1c','#4a5054','#14181a']);x.fillRect(cx-16,cy-6,32,H*.3);x.fillStyle='#c81a10';x.beginPath();x.arc(cx,cy-6,12,Math.PI,TAU);x.fill();glow(x,cx,cy-10,20,'#ff2010',.6);
  x.save();x.translate(cx,cy-14);for(let i=0;i<4;i++){x.strokeStyle='#d8ccb0';x.lineWidth=3;x.lineCap='round';x.beginPath();x.moveTo(-12+i*8,24);x.lineTo(-14+i*8,6);x.lineTo(-8+i*7,-4);x.stroke()}x.lineWidth=4;x.beginPath();x.moveTo(-6,30);x.lineTo(-30,58);x.stroke();x.lineWidth=5;x.beginPath();x.moveTo(-30,58);x.lineTo(-60,80);x.stroke();x.restore();skull(x,W*.2,H*.42,H*.12,R,-.4)},
 m21(x,W,H,R,P){metalP(x,R,[[W*.1,H*.75],[W*.9,H*.72],[W*.92,H*.84],[W*.08,H*.88]],{cols:['#9aa0a0','#2a2e2e'],pw:40});x.fillStyle='#4a2a26';x.beginPath();x.ellipse(W*.5,H*.72,W*.3,H*.07,0,0,TAU);x.fill();x.fillStyle='#7a0a14';x.beginPath();x.ellipse(W*.5,H*.7,W*.12,H*.04,0,0,TAU);x.fill();for(let i=0;i<6;i++){x.strokeStyle='#d8ccb0';x.lineWidth=2;x.beginPath();x.arc(W*.5,H*.75,W*.03+i*3,3.6,5.8);x.stroke()}
  face(x,R,W*.2,H*.67,H*.1,{rot:-1.5,mouth:1,skin:'#a89088'});drips(x,R,W*.3,W*.7,H*.8,H*.15,10);
  const cx=W*.5,cy=H*.1;x.fillStyle='#14181a';x.beginPath();x.arc(cx,cy,H*.12,0,TAU);x.fill();glow(x,cx,cy+H*.06,10,'#7affd0',.8);
  for(let i=0;i<6;i++){const ex=cx+(i-2.5)*W*.1,ey=H*.35+R()*H*.1,fx=W*.5+(i-2.5)*W*.04,fy=H*.66;x.strokeStyle='#2a3234';x.lineWidth=5;x.lineCap='round';x.beginPath();x.moveTo(cx,cy);x.lineTo(ex,ey);x.lineTo(fx,fy);x.stroke();x.strokeStyle='#7a8486';x.lineWidth=1.4;x.stroke();x.lineCap='butt';
   x.save();x.translate(fx,fy);x.rotate(Math.atan2(fy-ey,fx-ex));if(i%3===0){x.fillStyle='#b8bcbc';x.beginPath();x.arc(0,0,7,0,TAU);x.fill();x.fillStyle='#2a2a28';for(let k=0;k<10;k++){const b=k/10*TAU;x.beginPath();x.moveTo(Math.cos(b)*7,Math.sin(b)*7);x.lineTo(Math.cos(b+.3)*9,Math.sin(b+.3)*9);x.lineTo(Math.cos(b+.6)*7,Math.sin(b+.6)*7);x.fill()}}else{x.fillStyle='#d8e0e0';x.fillRect(0,-1,12,2)}x.restore()}splat(x,R,W*.5,H*.72,10,'rgba(120,0,10,.9)')},
 m22(x,W,H,R,P){const pr=W*1.3,pcx=W*.5,pcy=H+pr*.6;x.fillStyle=RG(x,pcx,pcy,pr*.5,pr,['#000','#101820','#2a3a40']);x.beginPath();x.arc(pcx,pcy,pr,0,TAU);x.fill();rim(x,P.g,2,.6);
  const ix=W*.55,iy=H*.84;x.save();x.globalCompositeOperation='lighter';for(const[w,a]of[[30,.12],[14,.3],[5,.75],[2,1]]){x.fillStyle=hexA(w<3?'#ffffff':'#ffb070',a);P2(x,[[W*.45-w*.2,-5],[W*.45+w*.2,-5],[ix+w/2,iy],[ix-w/2,iy]]);x.fill()}glow(x,ix,iy,W*.3,'#ff8a30',.7);glow(x,ix,iy,W*.08,'#ffffff',.9);x.restore();
  x.strokeStyle='rgba(255,180,100,.5)';x.lineWidth=2;for(let i=1;i<4;i++){x.beginPath();x.ellipse(ix,iy,W*.1*i,H*.03*i,0,Math.PI,TAU);x.stroke()}shipH(x,R,P,W*.4,H*.08,W*.4,.05,{h:.2,blocks:3,lights:10})},
 m23(x,W,H,R,P){const ships=[];for(let i=0;i<14;i++){const t=R();ships.push([R()*W,H*(.1+R()*.8),W*(.06+t*t*.25)])}ships.sort((a,b)=>a[2]-b[2]);for(const[sx,sy,L]of ships)shipH(x,R,P,sx,sy,L,-.15+(R()-.5)*.1,{h:.18,blocks:2,dark:1,eng:2});
  shipH(x,R,P,W*.55,H*.55,W*.85,-.15,{h:.24,blocks:8,dark:1,eng:4,after:(x,L,h)=>{for(let i=0;i<8;i++){const px=-L*.4+i*L*.1;glow(x,px,-h*.2,5,'#ff2a1a',.8)}face(x,R,L*.2,-h*.15,h*.4,{skin:'#4a5054',hollow:1,glow:'#ff2a1a',mouth:.8})}})},
 tD(x,W,H,R,P){mech(x,R,P,W*.5,H*.45,H*.2,{arms:4,tools:'cnws',stripe:1});corpse(x,R,W*.5,H*.95,H*.12,0,{c:'#2a2624'})},
 hm(x,W,H,R,P){metalP(x,R,[[0,0],[W,0],[W,H],[0,H]],{pw:20,lights:20,lc:'#ff3020'});for(let i=0;i<14;i++)cable(x,R()*W,-5,W*.5+(R()-.5)*W*.3,H*.5,H*.2,2+R()*4,'#0e1112');mech(x,R,P,W*.5,H*.5,H*.28,{arms:6,tools:'ncsw',er:.55,stripe:1,cables:5})},
});
const SC3={m1:'corridor',m2:'corridor',m3:'corridor',m4:'lab',m5:'space',m6:'corridor',m7:'cockpit',m8:'wreck',m9:'space',m10:'corridor',m11:'wreck',m12:'corridor',m13:'lab',m14:'corridor',m15:'lab',m16:'corridor',m17:'corridor',m18:'corridor',m19:'corridor',m20:'corridor',m21:'lab',m22:'space',m23:'space',tD:'corridor'};
for(const k in SC3)SPEC[k]=k+'@'+SC3[k];
/* ---------- Red Communion ---------- */
function bodyMouths(x,R,cx,cy,rx,ry,n){const ms=[];for(let i=0;i<n;i++){const a=R()*TAU,d=Math.sqrt(R())*.82;ms.push([cx+Math.cos(a)*rx*d,cy+Math.sin(a)*ry*d,(.6+R()*.8)])}ms.sort((a,b)=>a[1]-b[1]);for(const[mx,my,s]of ms)lips(x,R,mx,my,rx*.13*s,ry*.06*s,{open:.2+R()*.9,rot:(R()-.5)*.6})}
Object.assign(PAINT,{
 c1(x,W,H,R,P){const mx=W*.62,my=H*.86;flesh2(x,R,mx,my,W*.28,H*.13,{n:14});mawRing(x,R,mx,my,W*.18,H*.07,3,{n:22});
  const f=robe(x,R,P,W*.3,H*1.08,H*.72,{face:'face',mouth:.1,arms:'offer',skin:'#b09080',hood:'#2a0c0e',cloth:'#4a1014'});x.strokeStyle='#3a0a0a';x.lineWidth=1;for(let i=-3;i<=3;i++){x.beginPath();x.moveTo(W*.3+i*2.4-1.5,f.fy+f.s*.12);x.lineTo(W*.3+i*2.4+1.5,f.fy+f.s*.2);x.stroke()}candle(x,R,W*.9,H*.95,14,2);candle(x,R,W*.08,H*.96,10,2)},
 c2(x,W,H,R,P){const f=robe(x,R,P,W*.45,H*1.06,H*.9,{face:'flay',mouth:.4,arms:'knife',flay:1,hood:'#2a0608'});
  x.fillStyle='#4a3a2a';x.beginPath();x.ellipse(W*.32,H*.94,W*.12,H*.04,0,0,TAU);x.fill();x.fillStyle='#6a0008';x.beginPath();x.ellipse(W*.32,H*.93,W*.1,H*.025,0,0,TAU);x.fill();drips(x,R,W*.3,W*.36,H*.55,H*.35,4,'#8a0010');
  for(let i=0;i<8;i++)drips(x,R,W*(.05+R()*.9),W*(.05+R()*.9),0,H*(.2+R()*.5),1,'#5a0008')},
 c3(x,W,H,R,P){const f=robe(x,R,P,W*.5,H*1.06,H*.85,{face:'flay',mouth:1,arms:'spread',claw:1,skin:'#9a6a5a',hood:'#2a080a'});
  for(const k of[-1,1]){x.strokeStyle='#6a2a24';x.lineWidth=7;x.lineCap='round';x.beginPath();x.moveTo(W*.5+k*f.s*.5,H*.55);x.quadraticCurveTo(W*.5+k*W*.2,H*.3,W*.5+k*W*.3,H*.15);x.stroke();x.lineCap='butt';hand(x,R,W*.5+k*W*.3,H*.12,H*.07,k*.6,{flay:1,claw:1})}
  flesh2(x,R,W*.62,H*.52,W*.08,H*.07,{n:6,w:8});eyeAt(x,W*.62,H*.5,W*.03,H*.014,P,R);flesh2(x,R,W*.38,H*.6,W*.06,H*.05,{n:5,w:6});eyeAt(x,W*.37,H*.59,W*.025,H*.012,P,R);
  x.strokeStyle='#ff4a3a';x.lineWidth=1;x.beginPath();x.moveTo(W*.5,f.ty+f.s*.3);x.lineTo(W*.5,f.fy+f.s*.3);x.stroke();glow(x,W*.5,f.fy,10,'#ff4a3a',.4)},
 c4(x,W,H,R,P){const f=robe(x,R,P,W*.45,H*1.06,H*.75,{face:'face',mouth:1,hollow:1,eyeC:P.a,arms:'none',hood:'#1a1408',cloth:'#2a2410',stole:0});
  for(let i=0;i<18;i++){const a=-Math.PI*(.15+R()*.7),d=f.s*(.5+R()*.4),px=W*.45+Math.cos(a)*d,py=f.ty+f.s*.5+Math.sin(a)*d*.8,h=6+R()*16;x.strokeStyle='#8a7a5a';x.lineWidth=1.6;x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+(R()-.5)*8,py-h*.5,px+(R()-.5)*6,py-h);x.stroke();
   x.fillStyle=RG(x,px,py-h,1,5,['#e8d8a0','#7a6a30','#2a2008']);x.beginPath();x.ellipse(px,py-h,4+R()*4,2.5+R()*2,0,Math.PI,TAU);x.fill();glow(x,px,py-h,8,P.a,.35)}
  for(let i=0;i<10;i++){const px=W*(.3+R()*.4),py=H*(.5+R()*.4);x.fillStyle=RG(x,px,py,1,6,['#d8c890','#5a4a20']);x.beginPath();x.arc(px,py,2+R()*4,0,TAU);x.fill()}
  x.save();x.globalCompositeOperation='lighter';for(let i=0;i<180;i++){const a=R()*TAU,d=R()*W*.45;x.fillStyle=hexA(P.a,R()*.6);x.beginPath();x.arc(W*.45+Math.cos(a)*d,f.ty+Math.sin(a)*d*.6,.6+R()*1.4,0,TAU);x.fill()}x.restore()},
 c5(x,W,H,R,P){metalP(x,R,[[W*.05,H*.78],[W*.95,H*.78],[W,H],[0,H]],{cols:['#3a2a24','#120a08'],pw:30,rust:0});corpse(x,R,W*.62,H*.8,H*.2,0,{c:'#8a7a6a'});face(x,R,W*.82,H*.76,H*.07,{rot:-1.57,mouth:1,skin:'#a89080'});chain(x,W*.45,H*.82,W*.45,H,2);chain(x,W*.75,H*.82,W*.75,H,2);
  robe(x,R,P,W*.3,H*1.05,H*.95,{face:'mask',arms:'knife',mitre:1,hood:'#3a0a0c',cloth:'#5a0a10',stole:'#8a6a20'});candle(x,R,W*.95,H*.8,16,2.2);candle(x,R,W*.55,H*.78,10,1.8)},
 c6(x,W,H,R,P){const cx=W*.5;x.fillStyle=LGr(x,cx-W*.3,0,cx+W*.3,0,['#2a0e0c','#7a3a30','#2a0a08']);SM(x,[[cx-W*.42,H*1.05],[cx-W*.45,H*.4],[cx-W*.3,H*.22],[cx-W*.08,H*.2],[cx,H*.08],[cx+W*.08,H*.2],[cx+W*.3,H*.22],[cx+W*.45,H*.4],[cx+W*.42,H*1.05]]);x.fill();
  for(let i=0;i<5;i++)face(x,R,cx+(R()-.5)*W*.5,H*(.4+R()*.45),H*(.06+R()*.04),{skin:'#9a6a5a',mouth:.3+R()*.7,hollow:R()<.5,rot:(R()-.5)*.8});flesh2(x,R,cx,H*.62,W*.3,H*.35,{c1:'#7a3028',c2:'#2a0a08',n:10,v:6,w:20});
  for(let i=0;i<14;i++){let px=cx+(R()-.5)*W*.7,py=H*(.25+R()*.7),a=R()*TAU;x.strokeStyle='#1a0604';x.lineWidth=1.2;x.beginPath();x.moveTo(px,py);x.lineTo(px+Math.cos(a)*20,py+Math.sin(a)*20);x.stroke();for(let j=0;j<6;j++){const t=j/6;x.strokeStyle='#c8c0b0';x.lineWidth=.8;const sx=px+Math.cos(a)*20*t,sy=py+Math.sin(a)*20*t;x.beginPath();x.moveTo(sx-Math.sin(a)*3,sy+Math.cos(a)*3);x.lineTo(sx+Math.sin(a)*3,sy-Math.cos(a)*3);x.stroke()}}
  face(x,R,cx,H*.18,H*.1,{skin:'#8a5a4a',hollow:1,glow:'#ff3a1a',mouth:.8});for(const k of[-1,1])hand(x,R,cx+k*W*.42,H*.85,H*.11,k*.3+Math.PI,{skin:'#8a4a3a',spread:1.1})},
 c7(x,W,H,R,P){const f=robe(x,R,P,W*.48,H*1.05,H*.95,{face:'flay',mouth:1,arms:'staff',flay:1,mitre:1,hood:'#2a1a0a',cloth:'#2a2010',stole:'#4a3a10',stain:1});
  maggots(x,R,W*.48,f.fy,f.s*.3,26);maggots(x,R,W*.5,H*.7,W*.12,40);hand(x,R,W*.3,H*.5,H*.09,-.8,{flay:1,spread:1.3});x.strokeStyle='#120a04';x.lineWidth=5;x.beginPath();x.moveTo(W*.4,H*.6);x.lineTo(W*.31,H*.55);x.stroke();maggots(x,R,W*.3,H*.47,10,10);
  x.fillStyle='#000';for(let i=0;i<40;i++){const px=W*.48+(R()-.5)*W*.7,py=H*(.05+R()*.6);x.beginPath();x.ellipse(px,py,1.3,.8,R()*3,0,TAU);x.fill()}x.save();x.globalCompositeOperation='lighter';for(let i=0;i<70;i++){x.fillStyle=hexA(P.a,R()*.5);x.beginPath();x.arc(R()*W,R()*H,.6+R()*1.6,0,TAU);x.fill()}x.restore();drips(x,R,W*.35,W*.62,H*.65,H*.3,8,'#4a3a08')},
 c8(x,W,H,R,P){const cx=W*.5,cy=H*.55;flesh2(x,R,cx,cy,W*.42,H*.45,{n:44,c1:'#8a3a30',c2:'#2a0a0a',c3:'#c06a5a',w:50});for(let i=0;i<6;i++)face(x,R,cx+(R()-.5)*W*.6,cy+(R()-.5)*H*.6,H*(.05+R()*.04),{skin:'#a87a6a',mouth:.6+R()*.4,hollow:R()<.5,rot:(R()-.5)});
  mawRing(x,R,cx,cy+H*.1,W*.17,H*.13,3,{n:22});for(let i=0;i<5;i++)hand(x,R,cx+(R()-.5)*W*.7,cy+(R()-.5)*H*.6,H*.06,R()*TAU,{skin:'#9a6a5a',spread:1.2});
  chain(x,0,H*.3,cx-W*.3,cy-H*.1,3);chain(x,W,H*.25,cx+W*.32,cy-H*.12,3);drips(x,R,cx-W*.15,cx+W*.15,cy+H*.2,H*.25,9);eyeAt(x,cx-W*.1,cy-H*.25,W*.04,H*.02,P,R);eyeAt(x,cx+W*.14,cy-H*.2,W*.03,H*.015,P,R)},
 c9(x,W,H,R,P){const cx=W*.5,cy=H*.52;flesh2(x,R,cx,cy,W*.52,H*.56,{n:40,c1:'#8a3438',c2:'#2a080c',c3:'#c86a68',w:30});bodyMouths(x,R,cx,cy,W*.5,H*.5,26);
  for(let i=0;i<4;i++){const a=R()*TAU;spineTent(x,R,{...P,c:['','#b05a5a'],m:'#5a1a1e',s:'#1a0406',g:'#ffb0b0'},[[cx+Math.cos(a)*W*.2,cy+Math.sin(a)*H*.2],[cx+Math.cos(a)*W*.4,cy+Math.sin(a)*H*.5],[cx+Math.cos(a+.5)*W*.5,cy+Math.sin(a+.5)*H*.6],[cx+Math.cos(a+.6)*W*.6,cy+Math.sin(a+.6)*H*.7]],5,40,0,'#c05a60')}
  bodyMouths(x,R,cx,cy,W*.32,H*.3,8);eyeAt(x,cx,cy-H*.05,W*.05,H*.025,P,R)},
 c10(x,W,H,R,P){metalP(x,R,[[0,H*.62],[W,H*.6],[W,H],[0,H]],{cols:['#3a2620','#0e0806'],pw:40,rust:0});splat(x,R,W*.5,H*.7,W*.2,'rgba(90,0,8,.95)');const cx=W*.5;
  x.fillStyle=LGr(x,cx-W*.1,0,cx+W*.1,0,['#4a3010','#e8c060','#5a3a10']);x.beginPath();x.moveTo(cx-W*.12,H*.25);x.quadraticCurveTo(cx-W*.1,H*.45,cx-W*.02,H*.48);x.lineTo(cx-W*.02,H*.6);x.lineTo(cx-W*.07,H*.66);x.lineTo(cx+W*.07,H*.66);x.lineTo(cx+W*.02,H*.6);x.lineTo(cx+W*.02,H*.48);x.quadraticCurveTo(cx+W*.1,H*.45,cx+W*.12,H*.25);x.fill();
  x.fillStyle='#7a0010';x.beginPath();x.ellipse(cx,H*.25,W*.12,H*.03,0,0,TAU);x.fill();drips(x,R,cx-W*.11,cx+W*.11,H*.26,H*.4,7,'#8a0010');dagger(x,W*.78,H*.7,H*.4,1.75);hand(x,R,W*.22,H*.72,H*.09,2.2,{skin:'#9a7a6a',spread:.8,curl:.8});splat(x,R,W*.27,H*.7,8);
  for(let i=0;i<6;i++)candle(x,R,W*(.05+i*.18),H*(.6+R()*.05),10+R()*20,2+R()*1.5)},
 c11(x,W,H,R,P){face(x,R,W*.5,H*.5,H*.4,{skin:'#c0a090',mouth:1,blood:1,brow:-8});veins(x,R,W*.5,H*.5,H*.35,22,'rgba(140,0,20,.8)',1.4);
  x.save();x.globalCompositeOperation='lighter';glow(x,W*.5,H*.7,H*.3,'#ff1a20',.35);x.restore();for(let i=0;i<14;i++){const a=R()*TAU,l=H*(.2+R()*.4);x.strokeStyle='rgba(130,0,12,.9)';x.lineWidth=1+R()*2;x.beginPath();x.moveTo(W*.5,H*.7);x.quadraticCurveTo(W*.5+Math.cos(a)*l*.5,H*.7+Math.sin(a)*l*.3-20,W*.5+Math.cos(a)*l,H*.7+Math.sin(a)*l);x.stroke()}
  for(let i=0;i<30;i++){x.fillStyle='rgba(140,0,14,.9)';x.beginPath();x.arc(W*.5+(R()-.5)*W*.8,H*.5+(R()-.5)*H*.9,.6+R()*2.4,0,TAU);x.fill()}for(const k of[-1,1])hand(x,R,W*.5+k*W*.28,H*.82,H*.14,k*.4,{skin:'#9a7a6a',spread:1.2,curl:k*.4})},
 c12(x,W,H,R,P){metalP(x,R,[[W*.05,H*.62],[W*.95,H*.62],[W,H*.78],[0,H*.78]],{cols:['#3a2014','#120806'],pw:50,rust:0});flesh2(x,R,W*.5,H*.62,W*.25,H*.07,{n:10,w:14});corpse(x,R,W*.5,H*.6,H*.18,0,{c:'#8a5a4a',blood:1});
  for(let i=0;i<5;i++){const t=(i+.5)/5;robe(x,R,P,W*t,H*.62,H*(.38+(i%2)*.05),{face:i%2?'face':'skull',mouth:1,arms:'offer',flay:1,hood:'#1a0606',cloth:'#2a0808'})}
  for(let i=0;i<7;i++)candle(x,R,W*(.1+i*.13),H*.63,6+R()*10,1.4);drips(x,R,W*.1,W*.9,H*.78,H*.18,12)},
 c13(x,W,H,R,P){const cx=W*.5;x.save();x.globalCompositeOperation='lighter';x.fillStyle=LGr(x,cx-W*.15,0,cx+W*.15,0,['rgba(255,200,170,0)','rgba(255,220,200,.35)','rgba(255,200,170,0)']);x.fillRect(cx-W*.15,0,W*.3,H);x.restore();glow(x,cx,H*.05,W*.3,'#fff0e0',.6);
  const f=robe(x,R,P,cx,H*.95,H*.75,{face:'face',mouth:1,hollow:1,eyeC:'#ffffff',arms:'spread',hood:'#3a1a14',cloth:'#4a1a14',stole:0});
  for(let i=0;i<26;i++){const px=cx+(R()-.5)*W*.5,py=H*(.35+R()*.6),l=12+R()*30;x.strokeStyle=R()<.5?'#a85a4a':'#6a1a14';x.lineWidth=2+R()*3;x.beginPath();x.moveTo(px,py);x.bezierCurveTo(px+(R()-.5)*20,py-l*.5,px+(R()-.5)*20,py-l,px+(R()-.5)*30,py-l*1.4);x.stroke()}
  x.strokeStyle='#d8ccb0';x.lineWidth=1.6;for(let i=0;i<5;i++){x.beginPath();x.arc(cx,f.fy+f.s*(.9+i*.22),f.s*(.35-i*.02),.4,Math.PI-.4);x.stroke()}x.fillRect(cx-1,f.fy+f.s*.6,2,f.s*1.4);glow(x,cx,f.fy,30,'#ffffff',.4)},
 c14(x,W,H,R,P){const cx=W*.45,by=H*1.02;x.fillStyle=LGr(x,cx-40,0,cx+40,0,['#3a0a0a','#a83a30','#3a0808']);SM(x,[[cx-W*.25,by],[cx-W*.2,H*.5],[cx-W*.1,H*.36],[cx+W*.1,H*.36],[cx+W*.2,H*.5],[cx+W*.25,by]]);x.fill();
  x.strokeStyle='rgba(255,170,150,.4)';x.lineWidth=.8;for(let i=0;i<30;i++){const px=cx+(R()-.5)*W*.4,py=H*(.4+R()*.55);x.beginPath();x.moveTo(px,py);x.lineTo(px+(R()-.5)*4,py+12);x.stroke()}x.strokeStyle='#e8d8c0';x.lineWidth=2.4;for(let i=0;i<6;i++){x.beginPath();x.arc(cx,H*(.5+i*.07),W*.1,Math.PI*1.15,Math.PI*1.85);x.stroke()}x.fillStyle='#d8ccb0';for(let i=0;i<8;i++)x.fillRect(cx-2,H*(.42+i*.065),4,H*.04);
  for(let i=0;i<7;i++){const sx=cx+(i-3)*W*.06;x.fillStyle=LGr(x,0,H*.4,0,H*.9,['#c8a090','#7a4a3a']);x.beginPath();x.moveTo(sx-3,H*.42);x.quadraticCurveTo(sx+(R()-.5)*16,H*.65,sx+(R()-.5)*10,H*(.75+R()*.15));x.lineTo(sx+4,H*.42);x.fill()}
  face(x,R,cx,H*.24,H*.13,{skin:'#b09080',mouth:.6,brow:-6,rot:-.15});drips(x,R,cx-W*.2,cx+W*.2,H*.6,H*.35,10);x.strokeStyle='#2a1a10';x.lineWidth=2;x.beginPath();x.moveTo(W*.78,H*.2);x.quadraticCurveTo(W*.7,H*.5,W*.85,H*.9);x.stroke();for(let i=0;i<5;i++){x.beginPath();x.moveTo(W*.78,H*.2);x.quadraticCurveTo(W*.6+i*10,H*.3,W*.55+i*12,H*(.4+R()*.2));x.stroke()}},
 c15(x,W,H,R,P){face(x,R,W*.5,H*.55,H*.42,{skin:'#7a6a50',hollow:1,mouth:1,rot:.2});maggots(x,R,W*.5,H*.55,W*.38,260);maggots(x,R,W*.42,H*.35,W*.07,40);maggots(x,R,W*.58,H*.35,W*.07,40);maggots(x,R,W*.5,H*.75,W*.06,40);
  x.fillStyle='#000';for(let i=0;i<30;i++){const px=R()*W,py=R()*H*.5;x.beginPath();x.ellipse(px,py,1.6,1,R()*3,0,TAU);x.fill()}wet(x,R,W*.5,H*.55,W*.35,H*.35,30,.5)},
 c16(x,W,H,R,P){const f=robe(x,R,P,W*.5,H*1.05,H*.95,{face:'face',mouth:.2,arms:'offer',hood:'#1a1414',cloth:'#141010',stole:'#6a0a10',skin:'#c8b0a0'});
  x.fillStyle='rgba(220,210,200,.25)';x.beginPath();x.moveTo(W*.5-f.s*.6,f.fy+f.s*.8);x.quadraticCurveTo(W*.5,f.ty-f.s*.1,W*.5+f.s*.6,f.fy+f.s*.8);x.lineTo(W*.5+f.s*.4,f.fy-f.s*.25);x.quadraticCurveTo(W*.5,f.ty+f.s*.15,W*.5-f.s*.4,f.fy-f.s*.25);x.fill();
  x.fillStyle='rgba(140,0,14,.95)';for(const k of[-1,1]){x.beginPath();x.moveTo(W*.5+k*f.s*.09,f.fy-f.s*.02);x.quadraticCurveTo(W*.5+k*f.s*.12,f.fy+f.s*.4,W*.5+k*f.s*.08,f.fy+f.s*1.4);x.lineTo(W*.5+k*f.s*.06,f.fy+f.s*1.4);x.quadraticCurveTo(W*.5+k*f.s*.09,f.fy+f.s*.4,W*.5+k*f.s*.06,f.fy-f.s*.02);x.fill()}
  x.strokeStyle='#c8a050';x.lineWidth=1.5;x.beginPath();x.moveTo(W*.5,f.fy+f.s*1.1);x.lineTo(W*.5,f.fy+f.s*1.8);x.moveTo(W*.5-6,f.fy+f.s*1.3);x.lineTo(W*.5+6,f.fy+f.s*1.3);x.stroke();for(let i=0;i<4;i++)candle(x,R,W*(.1+i*.27),H*.98,8+R()*12,1.8)},
 c17(x,W,H,R,P){for(let i=0;i<4;i++){const hx=W*(.08+i*.28);x.strokeStyle='#4a4038';x.lineWidth=1.2;x.beginPath();x.moveTo(hx,0);x.lineTo(hx,H*.15);x.stroke();x.beginPath();x.arc(hx-4,H*.15+4,4,0,Math.PI);x.stroke();x.fillStyle=LGr(x,hx-14,0,hx+14,0,['#3a0a0a','#a8504a','#3a0a0a']);SM(x,ring(hx,H*.38,W*.06,H*.2,10,R,.2));x.fill();x.strokeStyle='#e8d8c0';x.lineWidth=1;for(let j=0;j<5;j++){x.beginPath();x.moveTo(hx-8,H*(.28+j*.05));x.lineTo(hx+8,H*(.29+j*.05));x.stroke()}}
  const f=robe(x,R,P,W*.48,H*1.05,H*.85,{face:'skull',arms:'knife',wide:1.5,hood:'#1a1414',cloth:'#2a2420',stole:0,stain:1});x.fillStyle='rgba(200,190,170,.5)';P2(x,[[W*.48-f.s*.6,H*.5],[W*.48+f.s*.6,H*.5],[W*.48+f.s*.8,H*1.05],[W*.48-f.s*.8,H*1.05]]);x.fill();splat(x,R,W*.46,H*.68,W*.08,'rgba(110,0,8,.95)');splat(x,R,W*.52,H*.86,W*.06,'rgba(90,0,8,.9)');
  x.save();x.translate(W*.48+f.s*1.2,f.ty-f.s*.2);x.rotate(.3);x.fillStyle=LGr(x,-f.s*.4,0,f.s*.4,0,['#3a3632','#d8d0c0','#5a524a']);x.fillRect(-f.s*.45,-f.s*.9,f.s*.9,f.s*.8);x.fillStyle='#2a1a10';x.fillRect(-f.s*.08,-f.s*.1,f.s*.16,f.s*.6);x.fillStyle='rgba(110,0,10,.9)';x.fillRect(-f.s*.45,-f.s*.3,f.s*.9,f.s*.2);x.restore()},
 c18(x,W,H,R,P){const cx=W*.5,cy=H*.5;x.fillStyle=RG(x,cx,cy,W*.05,W*.38,['rgba(230,170,150,.55)','rgba(150,60,60,.5)','rgba(40,5,8,.9)'],-W*.08,-H*.1);SM(x,ring(cx,cy,W*.34,H*.42,14,R,.12));x.fill();veins(x,R,cx,cy,H*.4,26,'rgba(120,0,30,.65)',1.4);
  for(let i=0;i<3;i++){const fx=cx+(i-1)*W*.15,fy=cy+(R()-.5)*H*.2;x.fillStyle='rgba(60,10,10,.6)';x.beginPath();x.ellipse(fx,fy,W*.06,H*.12,(i-1)*.5,0,TAU);x.fill();x.fillStyle='rgba(60,10,10,.7)';x.beginPath();x.arc(fx+(i-1)*4,fy-H*.1,W*.04,0,TAU);x.fill()}
  wet(x,R,cx-W*.1,cy-H*.15,W*.2,H*.2,40,.7);for(let i=0;i<6;i++)spineTent(x,R,{...P,m:'#5a1a20',s:'#1a0406',g:'#ffb0a0'},[[cx+(R()-.5)*W*.3,cy+H*.35],[cx+(R()-.5)*W*.6,H*.9],[cx+(R()-.5)*W,H*1.05],[cx+(R()-.5)*W*1.2,H*1.1]],4,30,0,'#a05050');lips(x,R,cx,cy-H*.32,W*.05,H*.02,{open:.6})},
 c19(x,W,H,R,P){x.fillStyle='#3a0006';x.beginPath();x.ellipse(W*.5,H*.85,W*.55,H*.18,0,0,TAU);x.fill();x.strokeStyle='rgba(255,90,90,.3)';x.lineWidth=1;for(let i=1;i<6;i++){x.beginPath();x.ellipse(W*.5,H*.85,W*.1*i,H*.035*i,0,0,TAU);x.stroke()}
  const hs=[];for(let i=0;i<22;i++)hs.push([W*(.05+R()*.9),H*(.55+R()*.4),R()]);hs.sort((a,b)=>a[1]-b[1]);for(const[hx,hy,t]of hs){const s=H*(.06+t*.05)*(hy/H);x.fillStyle='#4a2a26';x.fillRect(hx-s*.3,hy-s*.6,s*.6,s*1.4);hand(x,R,hx,hy-s,s,(R()-.5)*.6,{skin:R()<.3?'#8a2a24':'#a88070',flay:R()<.3,spread:1.3,claw:R()<.2});drips(x,R,hx-s*.2,hx+s*.2,hy-s*.6,s*.8,2)}
  PAINT.rune(x,W,H*.6,R,P)},
 c20(x,W,H,R,P){glow(x,W*.5,H*.2,W*.4,'#ff3a2a',.3);const n=4;for(let i=0;i<n;i++){const t=(i+.5)/n,cx=W*t,s=H*(.22+((i+1)%2)*.05);const f=robe(x,R,P,cx,H*1.06,H*.7+((i+1)%2)*H*.06,{face:'none',arms:'none',hood:'#1a0606',cloth:'#2a0606',stole:0,eyeC:'#000'});
   lips(x,R,cx,f.fy+f.s*.02,f.s*.42,f.s*.13,{open:1});x.fillStyle='#000';x.beginPath();x.ellipse(cx,f.fy-f.s*.38,f.s*.3,f.s*.1,0,0,TAU);x.fill()}
  x.save();x.globalCompositeOperation='lighter';x.strokeStyle='rgba(255,120,100,.25)';for(let i=0;i<12;i++){x.lineWidth=1;x.beginPath();x.arc(W*.5,H*.3,20+i*10,3.6,5.8);x.stroke()}x.restore()},
 c21(x,W,H,R,P){const cx=W*.5,cy=H*.55;x.save();x.translate(cx,cy);x.rotate(-.08);x.fillStyle='#1a0a06';x.fillRect(-W*.3,-H*.32+6,W*.6,H*.66);x.fillStyle=LGr(x,-W*.3,0,W*.3,0,['#5a3a2a','#b88a70','#6a4030']);x.fillRect(-W*.3,-H*.34,W*.58,H*.66);
  x.strokeStyle='#2a1008';x.lineWidth=1.2;for(let i=0;i<12;i++){x.beginPath();x.moveTo(-W*.3,-H*.3+i*H*.055);x.lineTo(-W*.27,-H*.3+i*H*.055);x.stroke()}x.beginPath();x.moveTo(-W*.28,-H*.32);x.lineTo(-W*.28,H*.3);x.stroke();
  face(x,R,W*.02,-H*.02,H*.24,{skin:'#b88a70',mouth:.3,hollow:0,eye:'#3a2a10'});x.strokeStyle='#2a1008';x.lineWidth=1;for(let i=0;i<10;i++){const y=-H*.28+i*H*.06;x.beginPath();x.moveTo(-W*.16,y);x.lineTo(-W*.13,y+3);x.moveTo(W*.18,y);x.lineTo(W*.21,y+3);x.stroke()}x.strokeStyle='#8a6a20';x.lineWidth=2;x.strokeRect(-W*.25,-H*.29,W*.5,H*.56);x.restore();
  for(let i=0;i<5;i++)candle(x,R,W*(.06+i*.22),H*.98,10+R()*20,2);drips(x,R,W*.3,W*.7,H*.88,H*.1,6)},
 c22(x,W,H,R,P){const cx=W*.5;for(let i=0;i<11;i++){const a=Math.PI+i/10*Math.PI;dagger(x,cx+Math.cos(a)*H*.32,H*.32+Math.sin(a)*H*.3,H*.22,a+Math.PI/2)}glow(x,cx,H*.3,H*.45,'#ff4a3a',.35);
  const f=robe(x,R,P,cx,H*1.08,H*1.0,{face:'mask',arms:'spread',wide:1.4,hood:'#3a0a0c',cloth:'#5a0c10',stole:'#c8a040',eyeC:'#ff4030',flay:1});
  bodyMouths(x,R,cx,H*.75,W*.18,H*.18,9);for(let i=0;i<8;i++){x.fillStyle='rgba(120,0,10,.9)';x.beginPath();x.ellipse(cx+(R()-.5)*W*.4,H*(.55+R()*.4),2,6+R()*6,(R()-.5),0,TAU);x.fill()}
  for(let i=0;i<5;i++)PAINT.tC(x,W,H,R,P,W*(.1+R()*.8),H*(.85+R()*.1),H*.06)},
 c23(x,W,H,R,P){for(let i=0;i<3;i++){const sx=W*(.22+i*.28),s=H*(.32+(i%2)*.06);x.fillStyle='#2a1a0e';x.fillRect(sx-3,H*.1,6,H*.9);corpse(x,R,sx,H*.45,s*.55,-1.57,{c:'#1a0e0a'});face(x,R,sx,H*.45-s*.4,s*.18,{skin:'#5a3a2a',mouth:1,hollow:1,glow:'#ffb040'})}
  x.save();x.globalCompositeOperation='lighter';for(let i=0;i<90;i++){const px=W*(.05+R()*.9),py=H*(.55+R()*.5),h=20+R()*70;x.fillStyle=LGr(x,0,py,0,py-h,['rgba(255,120,30,.5)','rgba(255,200,80,.25)','rgba(255,60,20,0)']);x.beginPath();x.moveTo(px-6,py);x.quadraticCurveTo(px+(R()-.5)*14,py-h*.5,px+(R()-.5)*8,py-h);x.quadraticCurveTo(px+(R()-.5)*14,py-h*.4,px+6,py);x.fill()}x.restore();
  x.globalAlpha=.25;for(let i=0;i<4;i++)face(x,R,W*(.15+R()*.7),H*(.05+R()*.2),H*.08,{skin:'#8a8a8a',hollow:1,mouth:1});x.globalAlpha=1;for(let i=0;i<10;i++){x.fillStyle='#0a0604';x.save();x.translate(W*(.1+R()*.8),H*(.85+R()*.1));x.rotate(R()*3);x.fillRect(-20,-3,40,6);x.restore()}},
 tC(x,W,H,R,P,cx,cy,s){cx=cx??W*.5;cy=cy??H*.6;s=s??H*.25;flesh2(x,R,cx,cy,s*1.2,s*.8,{n:8,w:10,c1:'#9a4a40'});for(let i=0;i<6;i++){const a=Math.PI*(.1+i*.16),k=i<3?-1:1;x.strokeStyle='#7a3a34';x.lineWidth=s*.12;x.lineCap='round';x.beginPath();x.moveTo(cx+Math.cos(a)*s,cy+s*.2);x.lineTo(cx+Math.cos(a)*s*1.6,cy+s*.5);x.lineTo(cx+Math.cos(a)*s*1.8,cy+s*.9);x.stroke();x.lineCap='butt'}lips(x,R,cx,cy,s*.45,s*.14,{open:.9});eyeAt(x,cx-s*.4,cy-s*.45,s*.14,s*.07,P,R);eyeAt(x,cx+s*.35,cy-s*.5,s*.1,s*.05,P,R)},
 hc(x,W,H,R,P){for(let i=0;i<13;i++){const a=Math.PI*.95+i/12*Math.PI*1.1;dagger(x,W*.5+Math.cos(a)*H*.38,H*.4+Math.sin(a)*H*.36,H*.2,a+Math.PI/2)}robe(x,R,P,W*.5,H*1.08,H*.95,{face:'mask',arms:'raise',flay:1,hood:'#4a0a0e',cloth:'#5a0a10',stole:'#c8a040',eyeC:'#ff4030'})},
});
const SC4={c1:'chapel',c2:'altar',c3:'flesh',c4:'flesh',c5:'altar',c6:'flesh',c7:'chapel',c8:'flesh',c9:'flesh',c10:'chapel',c11:'flesh',c12:'chapel',c13:'altar',c14:'chapel',c15:'flesh',c16:'chapel',c17:'altar',c18:'flesh',c19:'altar',c20:'chapel',c21:'chapel',c22:'altar',c23:'altar',tC:'flesh'};
for(const k in SC4)SPEC[k]=k+'@'+SC4[k];
/* ---------- Wanderers ---------- */
Object.assign(PAINT,{
 n1(x,W,H,R,P){const pr=W*1.6,pcx=W*.5,pcy=H+pr*.82;x.fillStyle=RG(x,pcx,pcy-pr,10,pr*.4,['#3a3a34','#14140f']);x.beginPath();x.arc(pcx,pcy,pr,0,TAU);x.fill();rim(x,P.g,1.4,.5);
  const tx=W*.62,by=H*.9;x.strokeStyle='#14181a';x.lineWidth=3;x.beginPath();x.moveTo(tx-W*.07,by);x.lineTo(tx,H*.2);x.lineTo(tx+W*.07,by);x.stroke();x.lineWidth=1;for(let i=0;i<8;i++){const y=H*.24+i*H*.08,w=W*.07*(y-H*.2)/(by-H*.2);x.beginPath();x.moveTo(tx-w,y);x.lineTo(tx+w,y+H*.06);x.moveTo(tx+w,y);x.lineTo(tx-w,y+H*.06);x.stroke()}
  x.fillStyle='#1a1e20';x.beginPath();x.ellipse(tx-8,H*.3,10,5,-.4,0,TAU);x.fill();glow(x,tx,H*.2,18,'#ff3a20',.9);x.save();x.globalCompositeOperation='lighter';for(let i=1;i<7;i++){x.strokeStyle=hexA(P.a,.5/i);x.lineWidth=1.4;x.setLineDash([3,3+i]);x.beginPath();x.arc(tx,H*.2,i*H*.1,-2.7,-.4);x.stroke()}x.setLineDash([]);x.restore();
  shipH(x,R,P,W*.22,H*.86,W*.3,.25,{h:.3,dark:1,blocks:1});suit(x,R,P,W*.45,H*1.0,H*.035,{lamp:0});corpse(x,R,W*.47,H*.93,H*.06,0,{c:'#3a3a36'})},
 n2(x,W,H,R,P){suit(x,R,P,W*.5,H*1.12,H*.27,{inside:visorFace(R,{skin:'#a89488',mouth:.15}),crack:1,lamp:1});for(let i=0;i<10;i++){x.save();x.translate(R()*W,R()*H*.5);x.rotate(R()*3);x.fillStyle='#2a2e30';x.fillRect(0,0,3+R()*10,1+R()*4);x.restore()}cable(x,W*.75,H*.7,W*1.05,H*.2,30,2.5,'#c8c0a8','rgba(255,255,255,.3)')},
 n3(x,W,H,R,P){suit(x,R,P,W*.46,H*1.12,H*.26,{inside:visorFace(R,{skin:'#8a7a70',hollow:1,mouth:.2,blood:1}),blood:1,suitC:'#3a4430',helmC:'#5a6450',lamp:1,lc:'#ff3020'});
  x.save();x.translate(W*.62,H*.92);x.rotate(-.55);x.fillStyle=LGr(x,0,-8,0,8,['#3a3e3a','#121412']);x.fillRect(-W*.1,-8,W*.55,14);x.fillRect(W*.1,6,14,18);x.fillRect(W*.3,-14,W*.14,6);x.fillStyle='#000';x.fillRect(W*.43,-5,6,8);x.restore()},
 n4(x,W,H,R,P){metalP(x,R,[[W*.55,0],[W,0],[W,H],[W*.55,H]],{pw:20,cols:['#4a4a40','#14140f'],lights:2,lc:'#ff2a10'});x.fillStyle='#c8961e';x.save();x.beginPath();x.rect(W*.55,H*.4,W*.45,H*.08);x.clip();for(let i=0;i<14;i++){P2(x,[[W*.55+i*14,H*.4],[W*.55+i*14+7,H*.4],[W*.55+i*14-2,H*.48],[W*.55+i*14-9,H*.48]]);x.fill()}x.restore();
  for(let i=0;i<5;i++)hand(x,R,W*(.6+R()*.35),H*(.1+R()*.7),H*.06,R()*.6-.3,{skin:'rgba(110,0,10,.85)',spread:1.2});
  suit(x,R,P,W*.36,H*1.12,H*.24,{inside:visorFace(R,{skin:'#9a8a80',mouth:.1}),suitC:'#6a6a40',helmC:'#8a8a60',lc:'#ff3020'});
  metalP(x,R,[[W*.04,H*.5],[W*.24,H*.46],[W*.26,H],[W*.02,H]],{pw:7,cols:['#3a4042','#121416']});x.save();x.beginPath();x.rect(W*.03,H*.85,W*.23,H*.06);x.clip();for(let i=0;i<8;i++){x.fillStyle=i%2?'#c8961e':'#000';x.fillRect(W*.03+i*9,H*.85,5,H*.06)}x.restore();x.fillStyle='rgba(120,200,220,.25)';x.fillRect(W*.07,H*.55,W*.14,H*.08)},
 n5(x,W,H,R,P){x.fillStyle=RG(x,W*.45,H*.85,10,W*.5,['#3a3630','#121010']);SM(x,ring(W*.45,H*.92,W*.5,H*.22,12,R,.25));x.fill();rim(x,P.g,1,.4);const cx=W*.48,cy=H*.6;
  x.fillStyle=LGr(x,cx-12,0,cx+12,0,['#2a2e30','#6a7274','#1a1e20']);x.fillRect(cx-10,cy,20,H*.2);x.fillStyle='#2a2e30';x.beginPath();x.arc(cx,cy,14,Math.PI,TAU);x.fill();glow(x,cx,cy-6,40,'#ff2a1a',.8);glow(x,cx,cy-6,10,'#ffffff',.9);
  x.save();x.globalCompositeOperation='lighter';for(let i=1;i<6;i++){x.strokeStyle=`rgba(255,40,30,${.45/i})`;x.lineWidth=2;x.beginPath();x.arc(cx,cy-6,i*24,0,TAU);x.stroke()}x.restore();
  skull(x,cx-W*.12,cy+H*.15,H*.06,R,.3);corpse(x,R,cx-W*.2,cy+H*.22,H*.1,.2,{c:'#3a3a36'});hand(x,R,cx-12,cy+H*.08,H*.04,.8,{skin:'#c8bca0',spread:.6,curl:1.2})},
 n6(x,W,H,R,P){// Black Vessel: a lightless ship gliding close, its prow hung with the chained dead
  x.save();x.globalCompositeOperation='lighter';x.strokeStyle='rgba(180,200,220,.16)';for(let i=0;i<40;i++){x.lineWidth=.6;const y=R()*H;x.beginPath();x.moveTo(0,y);x.lineTo(W*(.2+R()*.4),y+(R()-.5)*4);x.stroke()}x.restore();
  galaxy(x,R,W*.8,H*.2,W*.3,'#6a8ab0');
  shipH(x,R,P,W*.48,H*.46,W*1.25,-.22,{h:.19,blocks:3,dark:1,eng:2,after:(x,L,h)=>{
   x.save();x.globalCompositeOperation='lighter';for(let i=0;i<7;i++){const wx=-L*.3+i*L*.07;x.fillStyle='rgba(160,200,220,.5)';x.fillRect(wx,-h*.3,L*.03,h*.09)}x.restore();
   for(let i=0;i<7;i++){const wx=-L*.3+i*L*.07;x.save();x.beginPath();x.rect(wx,-h*.3,L*.03,h*.09);x.clip();face(x,R,wx+L*.015,-h*.26,h*.08,{skin:'#8a9aa0',hollow:i%2,mouth:1});x.restore()}
   x.save();x.globalCompositeOperation='lighter';x.strokeStyle='rgba(255,40,40,.75)';x.lineWidth=2;const sx=L*.12,sy=h*.25,r=h*.17;x.beginPath();for(let k=0;k<7;k++){const a=-1.57+k*3*TAU/7;x.lineTo(sx+Math.cos(a)*r,sy+Math.sin(a)*r)}x.closePath();x.stroke();x.beginPath();x.arc(sx,sy,r*1.15,0,TAU);x.stroke();x.beginPath();x.ellipse(sx,sy,r*.35,r*.16,0,0,TAU);x.stroke();x.fillStyle='rgba(255,60,40,.9)';x.beginPath();x.arc(sx,sy,r*.08,0,TAU);x.fill();x.restore();glow(x,L*.12,h*.25,h*.5,'#ff2020',.35);
   for(let i=0;i<5;i++){const cx0=L*(.05+i*.09),cy0=h*(.3+i*.02),len=h*(.8+R()*.8);chain(x,cx0,cy0,cx0-6,cy0+len,2);corpse(x,R,cx0-6,cy0+len+h*.25,h*.28,1.5+(R()-.5)*.3,{c:'#4a4440',blood:1})}
   drips(x,R,L*.0,L*.45,h*.4,h*.4,8,'#5a0610')}});
  x.fillStyle=LGr(x,0,0,W*.3,0,['rgba(0,0,0,.9)','rgba(0,0,0,0)']);x.fillRect(0,0,W*.3,H)},
 n7(x,W,H,R,P){for(let i=0;i<5;i++)corpse(x,R,W*(.05+R()*.9),H*(.1+R()*.8),H*(.05+R()*.06),R()*6,{c:'#3a3632'});suit(x,R,P,W*.42,H*.95,H*.16,{inside:visorFace(R,{skin:'#9a8a80',mouth:.3}),suitC:'#6a5a3a',lamp:1});
  cable(x,W*.32,H*.62,-10,H*.1,40,2.4,'#c8b890','rgba(255,255,255,.3)');sparks(x,R,W*.72,H*.62,18,30,'#a8e8ff',0,1);x.strokeStyle='#3a3e40';x.lineWidth=5;x.beginPath();x.moveTo(W*.55,H*.68);x.lineTo(W*.7,H*.62);x.stroke();glow(x,W*.72,H*.62,40,'#a8e8ff',.4)},
 n8(x,W,H,R,P){const cx=W*.5,cy=H*.52;x.fillStyle=RG(x,cx,cy,H*.05,H*.45,['#8a8e88','#3a3e3a','#0c0e0c'],-H*.1,-H*.14);x.beginPath();x.ellipse(cx,cy,W*.42,H*.42,0,0,TAU);x.fill();x.strokeStyle='rgba(0,0,0,.6)';x.lineWidth=1;for(let i=0;i<10;i++){const a=i/10*TAU;x.beginPath();x.moveTo(cx+Math.cos(a)*W*.3,cy+Math.sin(a)*H*.3);x.lineTo(cx+Math.cos(a)*W*.42,cy+Math.sin(a)*H*.42);x.stroke()}
  x.fillStyle='#c8961e';for(let i=0;i<8;i++)x.fillRect(cx-W*.4+i*W*.1,H*.88,W*.05,6);x.fillStyle='#000';x.beginPath();x.arc(cx,cy,H*.27,0,TAU);x.fill();x.save();x.beginPath();x.arc(cx,cy,H*.25,0,TAU);x.clip();x.fillStyle='rgba(60,80,90,.6)';x.fillRect(0,0,W,H);
  for(let i=0;i<5;i++)face(x,R,cx+(R()-.5)*H*.3,cy+(R()-.5)*H*.25,H*(.07+R()*.04),{skin:'#9aa8a8',mouth:1,rot:(R()-.5)*.6});for(let i=0;i<7;i++)hand(x,R,cx+(R()-.5)*H*.4,cy+(R()-.5)*H*.4,H*.06,R()*TAU,{skin:'#b8c0c0',spread:1.3});
  for(let i=0;i<5;i++)drips(x,R,cx-H*.2,cx+H*.2,cy-H*.24,H*.2,2,'rgba(140,0,10,.7)');x.restore();x.strokeStyle='#6a6e68';x.lineWidth=5;x.beginPath();x.arc(cx,cy,H*.27,0,TAU);x.stroke();for(let i=0;i<10;i++){const a=i/10*TAU;x.fillStyle='#2a2e2a';x.beginPath();x.arc(cx+Math.cos(a)*H*.27,cy+Math.sin(a)*H*.27,2,0,TAU);x.fill()}},
 tS(x,W,H,R,P){suit(x,R,P,W*.5,H*1.15,H*.27,{inside:visorFace(R,{skin:'#a89488',mouth:.4}),crack:1,suitC:'#5a4a3a',lamp:1})},
 hn(x,W,H,R,P){for(const[px,s]of[[.25,.2],[.75,.2],[.5,.26]])suit(x,R,P,W*px,H*1.1,H*s,{inside:visorFace(R,{skin:'#9a8a80',hollow:px!==.5,mouth:.2}),lamp:1})},
 hv(x,W,H,R,P){for(let i=0;i<10;i++){const a=i/10*TAU;face(x,R,W*.5+Math.cos(a)*W*.38,H*.5+Math.sin(a)*H*.38,H*.09,{rot:a+Math.PI/2,skin:'#8a90a8',hollow:1,glow:P.a,mouth:1})}eyeSocket(x,R,P,W*.5,H*.5,W*.3,H*.15,{lx:0})},
});
const SC5={n1:'space',n2:'wreck',n3:'corridor',n4:'corridor',n5:'space',n6:'space',n7:'wreck',n8:'space',tS:'corridor'};for(const k in SC5)SPEC[k]=k+'@'+SC5[k];
const HSPEC={v:'hv@void',m:'hm@corridor',c:'hc@chapel',n:'hn@wreck'};
/* ---------- pack / card-back art ---------- */
function sigilURL(){const S=256,cv=mkc(S,S),x=cv.getContext('2d'),c=S/2,R=rng(777);x.save();x.globalCompositeOperation='lighter';
 for(let k=0;k<3;k++){x.strokeStyle=`rgba(200,160,255,${.7-k*.2})`;x.lineWidth=2.5-k*.6;x.beginPath();x.arc(c,c,S*(.44-k*.06),0,TAU);x.stroke()}
 for(let i=0;i<24;i++){const a=i/24*TAU;x.beginPath();x.moveTo(c+Math.cos(a)*S*.38,c+Math.sin(a)*S*.38);x.lineTo(c+Math.cos(a)*S*(i%2?.41:.44),c+Math.sin(a)*S*(i%2?.41:.44));x.stroke()}
 x.restore();x.fillStyle=LGr(x,0,0,S,S,['#f0e0ff','#9a6ad0','#3a1a6a','#d0b0ff']);x.beginPath();for(let i=0;i<8;i++){const a=i/8*TAU-Math.PI/2,r=i%2?S*.13:S*.36;x.lineTo(c+Math.cos(a)*r,c+Math.sin(a)*r)}x.closePath();x.fill();x.strokeStyle='#000';x.lineWidth=3;x.stroke();
 x.fillStyle='#05020a';x.beginPath();x.ellipse(c,c,S*.13,S*.075,0,0,TAU);x.fill();const ig=x.createRadialGradient(c,c,1,c,c,S*.06);ig.addColorStop(0,'#4affc0');ig.addColorStop(.6,'#2a0a5a');ig.addColorStop(1,'#000');x.fillStyle=ig;x.beginPath();x.arc(c,c,S*.055,0,TAU);x.fill();x.fillStyle='#000';x.beginPath();x.ellipse(c,c,S*.012,S*.05,0,0,TAU);x.fill();
 x.fillStyle='rgba(255,255,255,.5)';x.beginPath();x.moveTo(c,c-S*.36);x.lineTo(c+S*.05,c-S*.12);x.lineTo(c-S*.02,c-S*.1);x.fill();return cv.toDataURL()}
function packBgURL(){const W=240,H=356,cv=mkc(W,H),x=cv.getContext('2d'),R=rng(4040);x.fillStyle='#07040c';x.fillRect(0,0,W,H);nebula(x,W,H,R,PAL.v,6,.22);
 for(let i=0;i<60;i++){x.strokeStyle=`rgba(${R()<.5?'255,255,255':'0,0,0'},${.04+R()*.08})`;x.lineWidth=.6+R()*1.5;x.beginPath();const px=R()*W;x.moveTo(px,0);x.lineTo(px+(R()-.5)*60,H);x.stroke()}
 for(let i=0;i<5;i++)tentacle(x,R()<.5?-10:W+10,H*(.4+R()*.6),W*.6,R()<.5?-.6:-2.5,5,PAL.v,R,40,1);
 x.fillStyle='#000';x.fillRect(0,0,W,H*.1);x.fillRect(0,H*.92,W,H*.08);for(let i=0;i<W;i+=6){x.fillStyle='#1a1424';x.fillRect(i,H*.1-3,3,3);x.fillRect(i,H*.92,3,3)}
 x.strokeStyle='rgba(200,170,120,.55)';x.lineWidth=2;x.strokeRect(10,H*.1+6,W-20,H*.82-12);x.strokeStyle='rgba(0,0,0,.8)';x.strokeRect(14,H*.1+10,W-28,H*.82-20);
 const vg=x.createRadialGradient(W/2,H*.45,H*.1,W/2,H/2,H*.7);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.8)');x.fillStyle=vg;x.fillRect(0,0,W,H);return cv.toDataURL('image/jpeg',.85)}
function cardBackURL(){const W=200,H=280,cv=mkc(W,H),x=cv.getContext('2d'),R=rng(31337);x.fillStyle='#08050c';x.fillRect(0,0,W,H);nebula(x,W,H,R,PAL.v,4,.2);
 x.save();x.translate(W/2,H/2);for(let i=0;i<16;i++){x.rotate(TAU/16);x.strokeStyle='rgba(180,140,230,.12)';x.lineWidth=1;x.beginPath();x.moveTo(0,20);x.lineTo(0,H*.6);x.stroke()}x.restore();
 x.strokeStyle='#5a4a3a';x.lineWidth=5;x.strokeRect(6,6,W-12,H-12);x.strokeStyle='#000';x.lineWidth=2;x.strokeRect(12,12,W-24,H-24);x.strokeStyle='rgba(200,170,120,.45)';x.lineWidth=1;x.strokeRect(16,16,W-32,H-32);
 for(const[cx,cy]of[[16,16],[W-16,16],[16,H-16],[W-16,H-16]]){x.fillStyle='#c8a070';x.save();x.translate(cx,cy);x.rotate(Math.PI/4);x.fillRect(-4,-4,8,8);x.restore()}return cv.toDataURL('image/jpeg',.85)}
/* Hollow Stars. RENDERING RULES: read /RENDERING_RULES.md before changing card visuals, animations, video or art.
   (transform/opacity only, no blend modes or animated filters, no class toggling mid-animation or DOM rebuilds, video rules,
   layer budget, image sizes, text auto-fit; new cards must pass tests/cardcheck.py, tests/paintprobe.py and tests/flicker.py) */

'use strict';
/* ================= v2.5 FACTION STAT BADGES =================
   Dark engraved Flux (cost), Attack and Health badges per faction (designs: hollow-stars-indicators, generator below kept as
   designed). The designs use SVG filters (blur glows, drop shadows, an inner shadow). Drawn inline in every card that would be
   three filtered SVGs per card re-run on every paint - expensive with a full hand and board, and filtered SVG inside composited
   layers is a known flicker source. So each faction's pieces are built ONCE here as standalone SVG images (data URLs) and used as
   CSS backgrounds: the browser rasterises each at a given size once and reuses it for every card. Numbers stay live text; the
   health fluid stays the CSS-clipped .fill (its level is a transform, see css/v23.css). */

const INDP={
 v:{g:'#2fe8b8',g2:'#9a4cff',k0:'#020405',k1:'#0b1719',k2:'#233c3b',k3:'#6fa89c',fc:'#020607',fc2:'#0a1f21',fl:['#4ee8c0','#0c6e5a','#052e28','#010a09'],mn:'#7cf6d4',cr:['#d0a8ff','#5a1ca8','#0a1c26','#010307'],wp:['#6a9c94','#1f3a37','#040a0b'],sw:['#2fe8b866','#0a0418','#9a4cff88','#020106']},
 m:{g:'#ff8f26',g2:'#ffc860',k0:'#040404',k1:'#171513',k2:'#3e3934',k3:'#9a8b7a',fc:'#070605',fc2:'#1b1611',fl:['#ffb24a','#b8580a','#481a02','#100400'],mn:'#ffd690',cr:['#dcb6ff','#521c9a','#1e1006','#050200'],wp:['#8a7c6c','#34302b','#070606'],sw:['#ff8f2655','#0a0610','#a050ff77','#020101']},
 c:{g:'#d8102a',g2:'#ff4a36',k0:'#050102',k1:'#1c0d0c',k2:'#46261f',k3:'#a89076',fc:'#090102',fc2:'#220508',fl:['#f22a3a','#9c0618','#3c020a','#0c0002'],mn:'#ff8a8e',cr:['#ffa8d8','#5c0f86','#2a0412','#070002'],wp:['#9a8a80','#2e1b19','#080203'],sw:['#ff203a55','#100208','#c040e077','#030001']},
 n:{g:'#8ebfe8',g2:'#d2b270',k0:'#030405',k1:'#15181b',k2:'#383e44',k3:'#a2aab2',fc:'#05070a',fc2:'#121920',fl:['#9cd4ee','#347394','#102536','#03070b'],mn:'#d4f2ff',cr:['#ccbcff','#3a2296','#0c1624','#020307'],wp:['#98a2ac','#323a40','#070809'],sw:['#8ebfe855','#04060c','#8a6aff77','#010203']}};
const IND={};
(function(){const R=n=>+n.toFixed(2),pp=a=>a.map(p=>R(p[0])+' '+R(p[1])).join(' '),poly=a=>'M'+pp(a)+'z';
 const scl=(a,c,s)=>a.map(p=>[c[0]+(p[0]-c[0])*s,c[1]+(p[1]-c[1])*s]);
 const circ=(cx,cy,r,a0=0,a1=360,st=8)=>{const o=[];for(let a=a0;a<=a1+.01;a+=st){const t=a*Math.PI/180;o.push([cx+Math.cos(t)*r,cy+Math.sin(t)*r])}return o};
 const qd=(p0,c,p1,n=8)=>{const o=[];for(let i=1;i<=n;i++){const t=i/n,u=1-t;o.push([u*u*p0[0]+2*u*t*c[0]+t*t*p1[0],u*u*p0[1]+2*u*t*c[1]+t*t*p1[1]])}return o};
 const etch=(d,P,w=.8,o=.75)=>`<path d="${d}" fill="none" stroke="#000" stroke-opacity="${o}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" transform="translate(.35 .55)" fill="none" stroke="${P.k3}" stroke-opacity=".22" stroke-width="${w*.6}" stroke-linecap="round" stroke-linejoin="round"/>`;
 const rivet=(x,y,r,f)=>`<circle cx="${x}" cy="${y}" r="${r+.45}" fill="#000" opacity=".85"/><circle cx="${x}" cy="${y}" r="${r}" fill="url(#iv-${f})"/>`;
 /* ---- Health vessel shapes (64x68 box) ---- */
 const HS={
  v:circ(32,41,19.5,0,352,8),
  m:[[20,17],[44,17],[54,27],[54,53],[44,63],[20,63],[10,53],[10,27]],
  c:(()=>{const T=[32,4],o=[T];for(const p of circ(32,44,19,-28,208,6))o.push(p);return o})(),
  n:(()=>{const o=[[12,16],[52,16],[52,36]];o.push(...qd([52,36],[51,55],[32,65],8));o.push(...qd([32,65],[13,55],[12,36],8).slice(0,-1));o.push([12,36]);return o})()};
 const HC={v:[32,41],m:[32,40],c:[32,42],n:[32,38]},HSO={v:1.2,m:1.17,c:1.16,n:1.17};
 IND.css='';
 for(const f in HS){const a=HS[f],xs=a.map(p=>p[0]),ys=a.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
  const cp='polygon('+a.map(p=>`${R((p[0]-x0)/(x1-x0)*100)}% ${R((p[1]-y0)/(y1-y0)*100)}%`).join(',')+')';
  IND.css+=`.hf-${f}{--hl:${R(x0/64*100)}%;--ht:${R(y0/68*100)}%;--hw:${R((x1-x0)/64*100)}%;--hh:${R((y1-y0)/68*100)}%;--hc:${cp}}`}
 /* ---- per-faction defs (gradients) ---- */
 let defs='';const st=(s)=>s.map(([o,c,a])=>`<stop offset="${o}" stop-color="${c}"${a!=null?` stop-opacity="${a}"`:''}/>`).join('');
 for(const f in INDP){const P=INDP[f];
  defs+=`<linearGradient id="ik-${f}" x1="0" y1="0" x2=".75" y2="1">${st([[0,P.k2],[.3,P.k1],[.68,P.k0],[1,P.k1]])}</linearGradient>`
   +`<linearGradient id="ib-${f}" x1="0" y1="0" x2=".6" y2="1">${st([[0,P.k3],[.35,P.k2],[.7,P.k0],[1,P.k1]])}</linearGradient>`
   +`<radialGradient id="if-${f}" cx=".42" cy=".34" r=".75">${st([[0,P.fc2],[.6,P.fc],[1,'#000']])}</radialGradient>`
   +`<radialGradient id="iv-${f}" cx=".35" cy=".3" r=".8">${st([[0,P.k3],[.45,P.k2],[1,P.k0]])}</radialGradient>`
   +`<linearGradient id="iw-${f}" x1=".1" y1="0" x2=".7" y2="1">${st([[0,P.wp[0]],[.38,P.wp[1]],[.78,P.wp[2]],[1,P.wp[1]]])}</linearGradient>`
   +`<linearGradient id="ig-${f}" x1="0" y1="0" x2="0" y2="1">${st([[0,P.g,.9],[1,P.g,0]])}</linearGradient>`}
 defs+=`<filter id="igl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.7"/></filter>`
  +`<filter id="ish" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx=".7" dy="1.8" stdDeviation="1.3" flood-color="#000" flood-opacity=".95"/></filter>`
  +`<filter id="iin" x="-10%" y="-10%" width="120%" height="120%"><feComponentTransfer in="SourceAlpha"><feFuncA type="table" tableValues="1 0"/></feComponentTransfer><feGaussianBlur stdDeviation="1.6"/><feOffset dx=".7" dy="1.5" result="s"/><feFlood flood-color="#000" flood-opacity=".95"/><feComposite in2="s" operator="in"/><feComposite in2="SourceAlpha" operator="in" result="i"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="i"/></feMerge></filter>`
  +`<linearGradient id="igs" x1="0" y1="0" x2=".7" y2=".8">${st([[0,'#fff',.34],[.35,'#fff',.06],[.36,'#fff',0],[1,'#fff',0]])}</linearGradient>`;
 IND.defs=defs;
 /* ---- ATTACK: faction weapon in dark metal + engraved number socket ---- */
 const AW={
  v:{d:'M13 64C4 40 16 13 56 2 39 17 31 36 37 64z M25 27L10.5 21.5l9.5 11.5z M22.5 46L8 46.5l13 6.5z M33.5 13.5L26 3.5l2.4 12.8z',
     e:'M25 61C19 41 27 21 50 5.5 M15.8 50q8-2.6 15.2-.4 M15.6 39.5q8.6-3.6 16.6-1.6 M18.8 30q8.6-4.6 15.4-2.8 M23.6 21.6q7.4-4.4 13-3.6 M29.6 14q6.2-3.8 10.6-3.2',
     gl:'M25 61C19 41 27 21 50 5.5'},
  m:{d:'M32 1l11 15v33l-11 17-11-17V16z M21 41L9 59h12z M43 41l12 18H43z',
     e:'M21 16h22 M21 25h22 M32 16v9 M21 49h22 M25.5 4.5l6.5 9 6.5-9 M14 52h7 M43 52h7',
     gl:'M29.5 60.5L32 64l2.5-3.5'},
  c:{d:'M32 1C36.6 9 38.6 18 37.6 30.5L32 33.5 26.4 30.5C25.4 18 27.4 9 32 1z M7 28.5c4 6.5 10.5 8.6 17 6.6l8-2.2 8 2.2c6.5 2 13-.1 17-6.6-1.6 9-8 14.8-16.6 14.8H23.6C15 43.3 8.6 37.5 7 28.5z M27.6 54h8.8v6.4h-8.8z M32 59.2a4.2 4.2 0 1 1-.01 0z',
     e:'M32 5.5V29 M29.4 12.5l1.4 1 M34.6 12.5l-1.4 1 M28.8 19l1.6 1 M35.2 19l-1.6 1 M28.6 25.5l1.6 1 M35.4 25.5l-1.6 1 M11.5 32.6c4 4.4 9 5.6 13.4 4.4 M52.5 32.6c-4 4.4-9 5.6-13.4 4.4 M27.6 57.2h8.8',
     gl:'M32 6V28.5'},
  n:{d:'M4 17h50l6 5v10H37l-3.2 7h-7.2L22 62H7l5.2-25L4 30z',
     e:'M8 20.5v6.5 M11 20.5v6.5 M14 20.5v6.5 M17 20.5v6.5 M4 30h33 M42 22h12 M9.5 46l9 3 M8.5 52l9.5 3 M8 57.5l10 3 M38 17v-2.6h4V17',
     gl:'M54 25.5h4'}};
 const sockMotif={
  v:P=>{let s='';for(let i=0;i<6;i++){const t=(i*60-90)*Math.PI/180,x=32+Math.cos(t)*13.9,y=43+Math.sin(t)*13.9;s+=`<ellipse cx="${R(x)}" cy="${R(y)}" rx="1.5" ry=".85" transform="rotate(${i*60} ${R(x)} ${R(y)})" fill="#000"/><circle cx="${R(x)}" cy="${R(y)}" r=".55" fill="${P.g}" opacity=".85"/>`}return s},
  m:(P,f)=>{let s='';for(let i=0;i<8;i++){const t=(i*45+22.5)*Math.PI/180;s+=rivet(R(32+Math.cos(t)*13.9),R(43+Math.sin(t)*13.9),.85,f)}return s},
  c:P=>{let s='';for(let i=0;i<8;i++){const a=i*45-90,t=a*Math.PI/180,b=(a+90)*Math.PI/180,x=32+Math.cos(t)*14.6,y=43+Math.sin(t)*14.6;s+=`<path d="M${R(x+Math.cos(b)*1.4)} ${R(y+Math.sin(b)*1.4)}L${R(32+Math.cos(t)*18)} ${R(43+Math.sin(t)*18)}L${R(x-Math.cos(b)*1.4)} ${R(y-Math.sin(b)*1.4)}z" fill="url(#ib-c)" stroke="#000" stroke-width=".6"/>`}return s},
  n:P=>`<circle cx="32" cy="43" r="13.9" fill="none" stroke="${P.k3}" stroke-opacity=".38" stroke-width=".55" stroke-dasharray="1.4 1.6"/>`+[0,90,180,270].map(a=>{const t=a*Math.PI/180;return`<path d="M${R(32+Math.cos(t)*12.6)} ${R(43+Math.sin(t)*12.6)}L${R(32+Math.cos(t)*15.4)} ${R(43+Math.sin(t)*15.4)}" stroke="${P.g2}" stroke-opacity=".7" stroke-width="1.1"/>`}).join('')};
 IND.atk={};
 for(const f in AW){const P=INDP[f],W=AW[f];
  IND.atk[f]=`<path d="${W.d}" fill="none" stroke="${P.g}" stroke-width="3" opacity=".34" filter="url(#igl)"/>`
   +`<path d="${W.d}" fill="#000" stroke="#000" stroke-width="2.6" stroke-linejoin="round" filter="url(#ish)"/>`
   +`<path d="${W.d}" transform="translate(-.55 -.65)" fill="none" stroke="${P.wp[0]}" stroke-opacity=".75" stroke-width=".8" stroke-linejoin="round"/>`
   +`<path d="${W.d}" fill="url(#iw-${f})"/>`
   +etch(W.e,P,.8,.85)
   +`<path d="${W.gl}" fill="none" stroke="${P.g}" stroke-width="1.6" stroke-linecap="round" opacity=".5" filter="url(#igl)"/><path d="${W.gl}" fill="none" stroke="${P.g}" stroke-width=".55" stroke-linecap="round" opacity=".8"/>`
   +`<path d="${W.d}" fill="url(#igs)"/>`
   +`<circle cx="32" cy="43" r="15.2" fill="#000" filter="url(#ish)"/><circle cx="32" cy="43" r="14.6" fill="url(#ik-${f})"/>`
   +sockMotif[f](P,f)
   +`<circle cx="32" cy="43" r="12.4" fill="url(#if-${f})" stroke="url(#ib-${f})" stroke-width="1.3" filter="url(#iin)"/>`
   +`<circle cx="32" cy="43" r="11.3" fill="none" stroke="${P.g}" stroke-opacity=".28" stroke-width=".6"/>`
   +`<path d="M22.6 39a10 10 0 0 1 13-6.8" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width=".9" stroke-linecap="round"/>`}
 /* ---- HEALTH: vessel back (bezel body) + front (rim, motifs, glass) around the CSS-clipped fluid ---- */
 const hMotif={
  v:(P,f)=>`<path d="M14.5 56c-6-6-7.4-16-3.4-24.6 M49.5 56c6-6 7.4-16 3.4-24.6" fill="none" stroke="#000" stroke-width="3.6" stroke-linecap="round"/><path d="M14.5 56c-6-6-7.4-16-3.4-24.6 M49.5 56c6-6 7.4-16 3.4-24.6" fill="none" stroke="url(#ib-${f})" stroke-width="2.2" stroke-linecap="round"/>`
    +`<path d="M11.1 31.4c-1.2-3.4 2.4-5.2 3.6-2.8 M52.9 31.4c1.2-3.4-2.4-5.2-3.6-2.8" fill="none" stroke="url(#ib-${f})" stroke-width="1.5" stroke-linecap="round"/>`
    +[[12.4,50],[11,44],[11.2,38],[51.6,50],[53,44],[52.8,38]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r=".7" fill="${P.g}" opacity=".7"/>`).join('')
    +`<path d="M22 17.2q10-6.4 20 0q-10 5.2-20 0z" fill="#000" stroke="url(#ib-${f})" stroke-width=".9"/><ellipse cx="32" cy="17" rx="1.1" ry="2.5" fill="${P.g}"/><ellipse cx="32" cy="17" rx="2.6" ry="2.6" fill="${P.g}" opacity=".25" filter="url(#igl)"/>`,
  m:(P,f)=>[[20,17],[44,17],[54,27],[54,53],[44,63],[20,63],[10,53],[10,27]].map(([x,y])=>rivet(R(32+(x-32)*1.085),R(40+(y-40)*1.085),.95,f)).join('')
    +`<g opacity=".9"><path d="M23 65.6h18l-1.4 2.2H24.4z" fill="${P.g}" opacity=".55"/>${[0,1,2,3,4].map(i=>`<path d="M${24.6+i*3.6} 67.8l2.2-2.2h1.6l-2.2 2.2z" fill="#000"/>`).join('')}</g>`
    +`<path d="M25 13h14 M25 14.6h14" stroke="#000" stroke-width=".9"/><path d="M26.5 13.8h11" stroke="${P.g}" stroke-opacity=".6" stroke-width=".5"/>`,
  c:(P,f)=>{let s='';const a=HS.c;for(let i=2;i<a.length-1;i+=4){const p=a[i],c=HC.c,dx=p[0]-c[0],dy=p[1]-c[1],L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L,b0=p[0]+ux*3.1,b1=p[1]+uy*3.1;s+=`<path d="M${R(b0-uy*1.5)} ${R(b1+ux*1.5)}L${R(p[0]+ux*7.2)} ${R(p[1]+uy*7.2)}L${R(b0+uy*1.5)} ${R(b1-ux*1.5)}z" fill="url(#ib-${f})" stroke="#000" stroke-width=".6"/>`}
    return s+`<path d="M28.2 0.6h7.6L32 6.8z" fill="#000" stroke="url(#ib-${f})" stroke-width=".7"/><path d="M30 1.6h4L32 4.8z" fill="${P.g}" opacity=".8"/>`},
  n:(P,f)=>rivet(14.2,14,1,f)+rivet(49.8,14,1,f)+`<path d="M44 20l6.2 0 0 8.6-6.2 0z" fill="url(#ik-${f})" stroke="#000" stroke-width=".6" opacity=".95"/><path d="M45 21.2v6.2 M49 21.2v6.2" stroke="${P.k3}" stroke-opacity=".3" stroke-width=".5" stroke-dasharray=".8 .8"/>`
    +`<path d="M32 9.2l.9 2.8 2.8.9-2.8.9-.9 2.8-.9-2.8-2.8-.9 2.8-.9z" fill="${P.g2}" opacity=".85"/>`};
 IND.hb={};IND.hf={};
 for(const f in HS){const P=INDP[f],a=HS[f],c=HC[f],o=scl(a,c,HSO[f]),dI=poly(a),dO=poly(o),dM=poly(scl(a,c,(1+HSO[f])/2));
  IND.hb[f]=`<path d="${dO}" fill="none" stroke="${P.g}" stroke-width="3" opacity=".32" filter="url(#igl)"/>`
   +`<path d="${dO}" fill="url(#ik-${f})" stroke="#000" stroke-width="1.8" stroke-linejoin="round" filter="url(#ish)"/>`
   +`<path d="${dO}" fill="none" stroke="url(#ib-${f})" stroke-width=".8" opacity=".85"/>`
   +etch(dM,P,.6,.6)+`<path d="${dI}" fill="#000"/>`;
  IND.hf[f]=`<path d="${dI}" fill="none" stroke="#000" stroke-width="1.8" stroke-linejoin="round"/>`
   +`<path d="${dI}" fill="none" stroke="url(#ib-${f})" stroke-width="1.1" stroke-linejoin="round"/>`
   +`<path d="${poly(scl(a,c,.93))}" fill="none" stroke="${P.g}" stroke-opacity=".22" stroke-width=".6"/>`
   +hMotif[f](P,f)
   +`<path d="${poly(scl(a,c,.86))}" fill="url(#igs)" opacity=".6"/>`}
 /* ---- FLUX: void core (CSS) inside a faction bezel; back = body, front = bevel facets + motifs ---- */
 const HI=[[26,7],[44,17.5],[44,42.5],[26,53],[8,42.5],[8,17.5]],HO=[[26,.8],[50.6,14.6],[50.6,45.4],[26,59.2],[1.4,45.4],[1.4,14.6]];
 const facetO=[.30,.10,-.32,-.5,-.2,.2];
 const cMotif={
  v:(P,f)=>`<path d="M17.6 4.6q8.4-5.6 16.8 0q-8.4 4.8-16.8 0z" fill="#000" stroke="url(#ib-${f})" stroke-width=".8"/><ellipse cx="26" cy="4.5" rx=".9" ry="2.1" fill="${P.g}"/><ellipse cx="26" cy="4.5" rx="2.4" ry="2.2" fill="${P.g}" opacity=".3" filter="url(#igl)"/>`
    +`<path d="M3 46.5c-3 3-1.6 7.2 1.8 6.4 M49 46.5c3 3 1.6 7.2-1.8 6.4" fill="none" stroke="#000" stroke-width="2.6" stroke-linecap="round"/><path d="M3 46.5c-3 3-1.6 7.2 1.8 6.4 M49 46.5c3 3 1.6 7.2-1.8 6.4" fill="none" stroke="url(#ib-${f})" stroke-width="1.4" stroke-linecap="round"/>`
    +[[5,25],[5,35],[47,25],[47,35],[16,53],[36,53]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r=".65" fill="${P.g}" opacity=".7"/>`).join(''),
  m:(P,f)=>HO.map(([x,y])=>rivet(R(26+(x-26)*.88),R(30+(y-30)*.88),1.05,f)).join('')+`<rect x="46.8" y="27" width="2.2" height="6" rx=".6" fill="#000"/><rect x="47.3" y="27.6" width="1.2" height="4.8" rx=".4" fill="${P.g}"/><rect x="45.6" y="26" width="4.6" height="8" fill="${P.g}" opacity=".35" filter="url(#igl)"/>`
    +`<path d="M4 23v14 M5.6 23v14" stroke="#000" stroke-width=".7"/>`,
  c:(P,f)=>HO.map(([x,y],i)=>{const dx=x-26,dy=y-30,L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L,b0=x-ux*1.2,b1=y-uy*1.2;return`<path d="M${R(b0-uy*1.7)} ${R(b1+ux*1.7)}L${R(x+ux*5.4)} ${R(y+uy*5.4)}L${R(b0+uy*1.7)} ${R(b1-ux*1.7)}z" fill="url(#ib-${f})" stroke="#000" stroke-width=".6"/>`}).join('')
    +`<path d="M21.6 2.8h8.8L26 6.4z" fill="none" stroke="${P.g}" stroke-opacity=".75" stroke-width=".6"/>`
    +`<path d="M26 56.5c1.2 2 1.8 3.2 1.8 4.2a1.8 1.8 0 0 1-3.6 0c0-1 .6-2.2 1.8-4.2z" fill="${P.fl[1]}" stroke="#000" stroke-width=".5"/>`,
  n:(P,f)=>HI.map((p,i)=>{const q=HI[(i+1)%6],r=HO[i],s=HO[(i+1)%6],mx=(p[0]+q[0]+r[0]+s[0])/4,my=(p[1]+q[1]+r[1]+s[1])/4,ix=(p[0]+q[0])/2,iy=(p[1]+q[1])/2;return`<path d="M${R(mx+(ix-mx)*.6)} ${R(my+(iy-my)*.6)}L${R(mx-(ix-mx)*.6)} ${R(my-(iy-my)*.6)}" stroke="${P.g2}" stroke-opacity=".65" stroke-width="1"/>`}).join('')
    +`<path d="M26 .2l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" fill="${P.g2}"/><path d="M6 20l3 6 M46 39l-2.4 4" stroke="${P.k3}" stroke-opacity=".3" stroke-width=".4"/>`};
 IND.cb={};IND.cf={};
 for(const f in INDP){const P=INDP[f];
  IND.cb[f]=`<path d="${poly(HO)}" fill="none" stroke="${P.g}" stroke-width="3" opacity=".36" filter="url(#igl)"/><path d="${poly(HO)}" fill="url(#ik-${f})" stroke="#000" stroke-width="1.6" stroke-linejoin="round" filter="url(#ish)"/><path d="${poly(HI)}" fill="#000"/>`;
  IND.cf[f]=HI.map((p,i)=>{const q=HI[(i+1)%6],o=facetO[i];return`<path d="M${pp([HO[i],HO[(i+1)%6],q,p])}z" fill="${o>0?'#fff':'#000'}" opacity="${Math.abs(o)}"/>`}).join('')
   +etch(poly(scl(HO,[26,30],.93)),P,.55,.55)
   +`<path d="${poly(HO)}" fill="none" stroke="url(#ib-${f})" stroke-width=".7" stroke-linejoin="round"/>`
   +`<path d="${poly(HI)}" fill="none" stroke="#000" stroke-width="1.5" stroke-linejoin="round"/><path d="${poly(HI)}" fill="none" stroke="url(#ib-${f})" stroke-width=".8" stroke-linejoin="round"/>`
   +`<path d="${poly(scl(HI,[26,30],.9))}" fill="none" stroke="${P.g}" stroke-opacity=".3" stroke-width=".55"/>`
   +cMotif[f](P,f)
   +`<path d="M9.4 18.4L26 8.4 39 16.2 12.6 39.4 9.4 37.6z" fill="url(#igs)" opacity=".75"/>`}
 /* ---- per-faction CSS: fluid, meniscus, void core, glow ---- */
 for(const f in INDP){const P=INDP[f],l=P.fl,c=P.cr,s=P.sw;
  IND.css+=`.hf-${f} .fill{background:radial-gradient(ellipse at 38% 26%,${l[0]} 0,${l[1]} 24%,${l[2]} 58%,${l[3]});box-shadow:inset 0 .12em .12em ${P.mn}55}`
   +`.hf-${f} .fill::before{background:linear-gradient(180deg,${P.mn},${l[0]} 45%,${l[1]});opacity:.8}`
   +`.hf-${f} .drop{background:radial-gradient(circle at 40% 70%,${l[3]},#000)}`
   +`.hf-${f} .drip{background:${l[1]}}`
   +`.cf-${f} .cr{background:radial-gradient(circle at 50% 56%,${c[0]} 0,${c[1]} 24%,${c[2]} 60%,${c[3]})}`
   +`.cf-${f} .cr::before{background:conic-gradient(from 0deg,${s[0]},${s[1]},${s[2]},${s[3]},${s[0]},${s[1]},${s[2]},${s[3]},${s[0]})}`
   +`.cf-${f}::before{background:radial-gradient(circle,${P.g}40,transparent 58%)}`
   +`.cf-${f} b,.af-${f} b,.hf-${f} b{text-shadow:0 0 .3em ${P.g}80,0 0 .12em #000,0 0 .12em #000,0 .07em 0 #000,0 .1em .16em #000}`
   +`.hero.f-${f} .flux .fx i{background:linear-gradient(160deg,${P.k1},#000)}`
   +`.hero.f-${f} .flux .fx i.on{background:radial-gradient(circle at 50% 38%,#f4e8ff,${c[1]} 42%,${c[3]} 80%)}`
   +`.hero.f-${f} .flux .fx i.sp{background:linear-gradient(160deg,${P.k2},${P.k0})}`
   +`.hero.f-${f} .flux{text-shadow:0 0 6px ${P.g}99,0 1px 0 #000}`}
})();

/* ---- build the per-faction images once and publish them as CSS ---- */
(function(){const doc=(vb,body)=>`url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='${vb}'><defs>${IND.defs}</defs>${body}</svg>`)}")`;
 let css=IND.css;for(const f in INDP){
  css+=`.af-${f}{background-image:${doc('0 0 64 68',IND.atk[f])}}.hf-${f} .hb{background-image:${doc('0 0 64 68',IND.hb[f])}}.hf-${f} .hfr{background-image:${doc('0 0 64 68',IND.hf[f])}}`
   +`.cf-${f} .cb{background-image:${doc('0 0 52 60',IND.cb[f])}}.cf-${f} .cfr{background-image:${doc('0 0 52 60',IND.cf[f])}}`}
 const st=document.createElement('style');st.id='badges';st.textContent=css;document.head.appendChild(st)})();
const badgeF=(f,d)=>INDP[f]?f:d;
const atkHTML=(f,a)=>`<div class="atk af-${badgeF(f,'n')}"><b>${a}</b></div>`;
const hpHTML=(h,p=100,f='c')=>`<div class="hp hf-${badgeF(f,'c')}" style="--p:${p}%"><i class="hb"></i><div class="drop"><div class="fill"></div><i class="spec"></i></div><i class="hfr"></i><b>${h}</b><i class="drip"></i></div>`;
const costHTML=(c,f='v')=>`<div class="cost cf-${badgeF(f,'v')}"><i class="cb"></i><div class="cr"></div><i class="cfr"></i><b>${c}</b></div>`;

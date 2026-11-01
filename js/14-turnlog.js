'use strict';
/* ================= v2.3 TURN LOG: "the Record" =================
   A history bar in the spirit of Hearthstone's: every play, attack and triggered effect becomes a small reliquary tile
   (the acting card's painting, an action glyph, and the target's portrait - marked with a skull if it died). Newest first.
   Hover (desktop) or tap (phone) a tile for the full card and everything that action did.
   Data comes from the engine's existing fx stream, read in apply() before flushFx consumes it, plus 'src' markers that this
   file wraps around each card's start / end / death abilities (fx() is skipped in AI simulations, so the AI pays nothing).
   Rendering: tiles are only added/removed (never rebuilt), animated with transform/opacity only. */

const TLOG={list:[],max:30,show:8,next:null,pin:-1,el:null,pop:null,hov:-1,ht:0};

/* ---- attribution: mark which card's ability produced the effects that follow ---- */
for(const id in C){const d=C[id];for(const w of['start','end','death'])if(typeof d[w]==='function'){const f=d[w];
 d[w]=function(g,pi,u){fx(g,{k:'src',w,uid:u?u.uid:0,cid:id,o:pi});try{return f.apply(this,arguments)}finally{fx(g,{k:'srcEnd'})}}}}

/* ---- glyphs (24x24, single path, filled) ---- */
const TL_ICO={
 atk:'M3.5 20.5l3-3-1.5-1.5 1.4-1.4 1.5 1.5L18 6V3h3v3l-10.1 9.9 1.5 1.5-1.4 1.4-1.5-1.5-3 3z',
 play:'M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm5 4.5L9 12l3 4.5 3-4.5z',
 rite:'M12 2l2.4 6.6L21 9l-5.2 4.3L17.6 21 12 17.1 6.4 21l1.8-7.7L3 9l6.6-.4z',
 trig:'M6 2h12v3c0 3-3 5-4.4 7 1.4 2 4.4 4 4.4 7v3H6v-3c0-3 3-5 4.4-7C9 10 6 8 6 5zm2.5 3c0 1.6 1.8 3 3.5 4.6 1.7-1.6 3.5-3 3.5-4.6z',
 death:'M12 2a8 8 0 0 0-8 8c0 2.6 1.2 4.6 3 5.8V19a1 1 0 0 0 1 1h1v2h2v-2h2v2h2v-2h1a1 1 0 0 0 1-1v-3.2c1.8-1.2 3-3.2 3-5.8a8 8 0 0 0-8-8zm-3 7a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm6 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4z',
 void:'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zm0 4a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4z'};
const tlSvg=k=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${TL_ICO[k]}"/></svg>`;

/* ---- recording ---- */
function tlPre(){const m=new Map();if(G)for(const p of G.p)for(const u of p.board)m.set(u.uid,{cid:u.id,o:u.o});return m}
function tlWho(pre,id){if(!G)return null;if(id[0]==='h'){const pi=+id[1];return{h:1,pi,cid:'h'+G.p[pi].fac,n:pi===0?'You':G.p[1].name||'The enemy',o:pi}}
 const uid=+id.slice(1),u=findU(G,uid);if(u)return{uid,cid:u.id,o:u.o,n:C[u.id].n};const q=pre.get(uid);return q?{uid,cid:q.cid,o:q.o,n:C[q.cid].n}:null}
function tlRecord(pre,fxl,hint){if(!G||!fxl||!fxl.length)return;const out=[],allB=[];let main=null,cur=null,stack=[];
 const bucket=(k,pi,cid,tg,w)=>({k,pi,cid,tg,w,res:new Map(),pl:[{mad:0,draw:0,heal:0,sum:[]},{mad:0,draw:0,heal:0,sum:[]}],turn:G.turn,hits:0});
 const play=fxl.find(f=>f.k==='play');
 if(play){const d=C[play.cid];main=bucket(d.t==='s'?'rite':'play',play.pi,play.cid,play.tg||null);if(play.e)main.echo=1}
 else if(hint&&hint.k==='atk'){const a=pre.get(hint.uid);if(a)main=bucket('atk',a.o,a.cid,hint.tg)}
 cur=main;if(main)allB.push(main);
 const row=(b,id)=>{let r=b.res.get(id);if(!r){const w=tlWho(pre,id);if(!w)return null;r={...w,dmg:0,heal:0,died:0,buff:[0,0],ward:0,cor:0,blight:0,sac:0,sum:0};b.res.set(id,r)}return r};
 for(const f of fxl){
  if(f.k==='src'){stack.push(cur);const b=bucket(f.w==='death'?'death':'trig',f.o,f.cid,null,f.w);b.uid=f.uid;out.push(b);allB.push(b);cur=b;continue}
  if(f.k==='srcEnd'){cur=stack.pop()||main;continue}
  if(f.k==='fatigue'){const b=bucket('void',f.pi,null,null);b.fat=f.n;b.pl[f.pi].fat=f.n;out.push(b);allB.push(b);cur=b;continue}
  if(f.k==='die'){let hit=0;for(let j=allB.length-1;j>=0;j--){const r=allB[j].res.get(f.id);if(r){r.died=1;hit=1;break}}if(!hit&&cur){const r=row(cur,f.id);if(r)r.died=1}continue}
  const b=cur;if(!b)continue;
  switch(f.k){
   case'dmg':{const r=row(b,f.id);if(r){r.dmg+=f.n;b.hits++}break}
   case'heal':{const r=row(b,f.id);if(r)r.heal+=f.n;break}
   case'buff':{const r=row(b,f.id);if(r){r.buff[0]++;r.buff[1]++}break}
   case'ward':{const r=row(b,f.id);if(r)r.ward=1;break}
   case'cor':{const r=row(b,f.id);if(r)r.cor++;break}
   case'blight':{const r=row(b,f.id);if(r)r.blight=1;break}
   case'sac':{const r=row(b,f.id);if(r){r.sac=1;r.died=1}break}
   case'mad':b.pl[f.pi].mad+=f.n;break;
   case'draw':b.pl[f.pi].draw++;break;
   case'summon':{const w=tlWho(pre,f.id);if(w)b.pl[w.o].sum.push(w.cid);break}
   case'burn':(b.pl[f.pi].burn||(b.pl[f.pi].burn=[])).push(f.cid);break}}
 /* deaths caused by an action are listed under it even when cleanup ran outside its trigger */
 const list=[];if(main)list.push(main);for(const b of out){const any=b.res.size||b.pl.some(p=>p.mad||p.draw||p.sum.length||p.fat||p.burn);if(any||b.k==='void')list.push(b)}
 for(const b of list){b.res=[...b.res.values()];b.t=Date.now();TLOG.list.unshift(b)}
 if(TLOG.list.length>TLOG.max)TLOG.list.length=TLOG.max;
 if(list.length)tlRender(list.length)}

/* ---- DOM ---- */
function tlBuild(){if(TLOG.el)return;const m=$('#match');m.insertAdjacentHTML('beforeend','<div id="tlog" role="list" aria-label="Recent actions"><i class="tsp"></i></div>');/* the panel lives on <body>: #match has transforms (shake, camera) that would offset a fixed child */document.body.insertAdjacentHTML('beforeend','<div id="tlpop" aria-hidden="true"></div>');
 TLOG.el=$('#tlog');TLOG.pop=$('#tlpop');
 TLOG.el.addEventListener('pointerenter',e=>{const t=e.target.closest&&e.target.closest('.tle');if(t&&e.pointerType==='mouse')tlOpen(+t.dataset.i)},true);
 TLOG.el.addEventListener('pointerleave',e=>{if(e.pointerType!=='mouse')return;if(e.target===TLOG.el){clearTimeout(TLOG.ht);TLOG.ht=setTimeout(()=>{if(TLOG.pin<0)tlClose()},140)}},true);
 TLOG.el.addEventListener('click',e=>{const t=e.target.closest('.tle');if(!t)return;e.stopPropagation();const i=+t.dataset.i;if(TLOG.pin===i){TLOG.pin=-1;tlClose()}else{TLOG.pin=i;tlOpen(i)}sfx('click')});
 document.addEventListener('pointerdown',e=>{if(TLOG.pin>=0&&!e.target.closest('#tlog,#tlpop')){TLOG.pin=-1;tlClose()}},true)}
function tlTile(b,i){const d=b.cid&&C[b.cid],f=d?d.f:'n',t=b.tg?tlTarget(b):null;
 const art=b.cid?`url(${realArtS(b.cid)})`:'none',lbl=tlTitle(b)+(d?': '+d.n:'');
 return `<button class="tle o${b.pi} k-${b.k} f-${f}" data-i="${i}" role="listitem" aria-label="${esc(lbl)}"><i class="ta" style="background-image:${art}"></i>${b.k==='void'?`<i class="tvd">${tlSvg('void')}</i>`:''}<i class="tk">${tlSvg(b.k==='play'?'play':b.k)}</i>${t?`<i class="tt${t.died?' dead':''}${t.h?' hero':''}" style="background-image:url(${t.h?realArt(t.cid):realArtS(t.cid)})">${t.died?tlSvg('death'):''}</i>`:''}</button>`}
function tlTarget(b){const r=b.res.find(x=>(b.tg[0]==='h'&&x.h&&x.pi===+b.tg[1])||(x.uid===+b.tg.slice(1)));if(r)return r;const w=tlWho(new Map(),b.tg);return w?{...w,died:0}:null}
function tlTitle(b){const me=b.pi===0;return b.k==='atk'?(me?'You attacked':'The enemy attacked'):b.k==='play'?(me?'You summoned':'The enemy summoned'):b.k==='rite'?(me?'You cast':'The enemy cast'):b.k==='death'?'Death rattle':b.k==='void'?(me?'You drew from the void':'The enemy drew from the void'):b.w==='start'?'Start of turn':'End of turn'}
function tlRender(added){if(!TLOG.el)tlBuild();const el=TLOG.el,n=Math.min(TLOG.show,TLOG.list.length);
 /* shift existing tiles' indices; add new ones on top; drop the overflow (no rebuild of the tiles that stay) */
 const old=[...el.querySelectorAll('.tle')];for(const t of old){const i=+t.dataset.i+added;if(i>=n){t.remove();continue}t.dataset.i=i;t.classList.remove('new');t.style.setProperty('--k',i)}
 let h='';for(let i=0;i<Math.min(added,n);i++)h+=tlTile(TLOG.list[i],i);el.querySelector('.tsp').insertAdjacentHTML('afterend',h);
 for(const t of el.querySelectorAll('.tle')){const i=+t.dataset.i;t.style.setProperty('--k',i);if(i<added)t.classList.add('new')}
 el.classList.toggle('on',n>0);if(TLOG.pin>=0){TLOG.pin=-1;tlClose()}}
function tlChip(cls,txt){return`<em class="${cls}">${txt}</em>`}
function tlRows(b){let h='',shown=0,more=0;const nm=r=>r.h?(r.pi===0?'You':esc(r.n)):esc(r.n);
 /* the target first, then whatever died, then the rest; long area effects are capped with an 'and N more' line */
 const tg=b.tg,isT=r=>tg&&((tg[0]==='h'&&r.h&&r.pi===+tg[1])||r.uid===+tg.slice(1));const res=b.res.slice().sort((x,y)=>(isT(y)-isT(x))||(y.died-x.died));
 for(const r of res){if(shown>=6){more++;continue}let c='';if(r.ward)c+=tlChip('wd','Ward broken');if(r.dmg)c+=tlChip('dm','−'+r.dmg);if(r.heal)c+=tlChip('hl','+'+r.heal+(r.h?' Sanity':''));if(r.buff[0])c+=tlChip('bf','+'+r.buff[0]+'/+'+r.buff[1]);if(r.cor)c+=tlChip('cr','−'+r.cor+' Attack');
  if(r.sac)c+=tlChip('kd','Offered');else if(r.blight&&r.died)c+=tlChip('kd','Blighted');else if(r.died)c+=tlChip('kd',tlSvg('death')+'Destroyed');if(!c)continue;
  shown++;h+=`<div class="tpr o${r.o}"><i class="ra${r.h?' hero':''}" style="background-image:url(${r.h?realArt(r.cid):realArtS(r.cid)})"></i><span>${nm(r)}</span><span class="cs">${c}</span></div>`}
 if(more)h+=`<div class="tpr none"><span>…and ${more} more</span></div>`;
 b.pl.forEach((p,pi)=>{const who=pi===0?'You':'The enemy',bits=[];if(p.mad)bits.push(tlChip(p.mad>0?'md':'mdn',(p.mad>0?'+':'−')+Math.abs(p.mad)+' Madness'));if(p.draw)bits.push(tlChip('dr','drew '+p.draw));if(p.fat)bits.push(tlChip('dm','−'+p.fat+' Sanity'));
  for(const s of p.sum)bits.push(tlChip('sm','summoned '+esc(C[s].n)));for(const s of p.burn||[])bits.push(tlChip('kd','burned '+esc(C[s].n)));
  if(bits.length)h+=`<div class="tpr o${pi} pl"><i class="ra hero" style="background-image:url(${realArt('h'+G.p[pi].fac)})"></i><span>${who}</span><span class="cs">${bits.join('')}</span></div>`});
 return h||'<div class="tpr none"><span>Nothing came of it.</span></div>'}
function tlOpen(i){const b=TLOG.list[i];if(!b||!TLOG.pop)return;clearTimeout(TLOG.ht);TLOG.hov=i;const p=TLOG.pop;
 p.className='on o'+b.pi;p.innerHTML=`<div class="tph"><b>${tlTitle(b)}</b><small>${b.echo?'Echo · ':''}Turn ${Math.max(1,Math.ceil(b.turn/2))}</small></div><div class="tpb"><div class="tpc"></div><div class="tpx">${tlRows(b)}</div></div>`;
 const box=p.querySelector('.tpc');if(b.cid){const c=cardEl(b.cid);box.appendChild(c);try{fitScan(p)}catch(e){}}else box.innerHTML=`<i class="tvb">${tlSvg('void')}</i>`;
 /* place it beside the tile (desktop: to the left of the column; phone: under the strip), clamped to the screen */
 const t=TLOG.el.querySelector(`.tle[data-i="${i}"]`),r=t?t.getBoundingClientRect():TLOG.el.getBoundingClientRect(),pr={width:p.offsetWidth,height:p.offsetHeight},land=document.body.classList.contains('land');
 let x,y;const cr=TLOG.el.getBoundingClientRect();/* column rect for x: a tile may still be swinging in */if(land){x=cr.left-pr.width-Math.max(16,r.width*.35);y=r.top+r.height/2-pr.height/2}else{x=Math.min(innerWidth-pr.width-8,Math.max(8,r.left+r.width/2-pr.width/2));y=cr.bottom+12}
 y=Math.max(8,Math.min(innerHeight-pr.height-8,y));p.style.transform=`translate(${Math.round(x)}px,${Math.round(y)}px)`;
 for(const e of TLOG.el.querySelectorAll('.tle.sel'))e.classList.remove('sel');if(t)t.classList.add('sel')}
function tlClose(){TLOG.hov=-1;if(TLOG.pop){TLOG.pop.className='';TLOG.pop.innerHTML=''}if(TLOG.el)for(const e of TLOG.el.querySelectorAll('.tle.sel'))e.classList.remove('sel')}
function tlReset(){TLOG.list=[];TLOG.next=null;TLOG.pin=-1;tlClose();if(TLOG.el){for(const t of TLOG.el.querySelectorAll('.tle'))t.remove();TLOG.el.classList.remove('on')}}
/* desktop: a column at the right edge between the two boards; phone: a strip under the opponent's panel */
function tlPlace(){if(!TLOG.el||cur!=='match')return;const land=document.body.classList.contains('land'),el=TLOG.el,m=$('#match').getBoundingClientRect();
 if(land){const a=$('#opb').getBoundingClientRect(),b=$('#myb').getBoundingClientRect(),top=a.top+6,bot=b.bottom-6,s=Math.round(Math.max(38,Math.min(84,UI.hw*.38))),gap=Math.round(s*.16);
  TLOG.show=Math.max(3,Math.min(10,Math.floor((bot-top+gap)/(s+gap))));el.style.cssText=`--ts:${s}px;--tg:${gap}px;top:${Math.round((top+bot)/2-m.top)}px;right:${Math.round(Math.max(8,innerWidth*.008))}px`}
 else{const o=$('#oph').getBoundingClientRect(),s=Math.round(Math.max(30,Math.min(44,innerWidth*.088))),gap=Math.round(s*.16);TLOG.show=Math.max(4,Math.min(9,Math.floor((innerWidth-24+gap)/(s+gap))));
  el.style.cssText=`--ts:${s}px;--tg:${gap}px;top:${Math.round(o.bottom-m.top+8)}px;left:0;right:0`}
 /* trim or refill to the new capacity */
 const have=el.querySelectorAll('.tle').length,n=Math.min(TLOG.show,TLOG.list.length);if(have!==n){for(const t of el.querySelectorAll('.tle'))t.remove();let h='';for(let i=0;i<n;i++)h+=tlTile(TLOG.list[i],i);el.querySelector('.tsp').insertAdjacentHTML('afterend',h);for(const t of el.querySelectorAll('.tle'))t.style.setProperty('--k',t.dataset.i)}
 el.classList.toggle('on',n>0)}

/* ---- hooks ---- */
{const a0=apply;apply=function(fn){const pre=G?tlPre():null,hint=TLOG.next;TLOG.next=null;let fxl=null;
  const g=G;const r=a0.call(this,()=>{const v=fn();try{if(G===g&&G&&!G.sim)fxl=G.fx.slice()}catch(e){}return v});try{if(G===g&&fxl)tlRecord(pre,fxl,hint)}catch(e){console.warn('turn log',e)}return r}}
{const l0=lunge;lunge=function(uid,tg){TLOG.next={k:'atk',uid,tg};return l0.apply(this,arguments)}}
{const s0=startMatch;startMatch=function(){tlBuild();tlReset();const r=s0.apply(this,arguments);requestAnimationFrame(tlPlace);return r}}
{const l0=layout;layout=function(){const r=l0.apply(this,arguments);if(TLOG.el)requestAnimationFrame(tlPlace);return r}}
{const s0=show;show=function(id){if(id!=='match')tlClose();return s0.apply(this,arguments)}}

Object.assign(window.__hs,{TLOG,tlRecord,tlOpen,tlClose,tlPlace});

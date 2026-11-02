'use strict';
/* ================= v2.9 STRATEGY UI: hero powers, mulligan, unit placement, live costs, Unhinged cue =================
   Rules live in js/02-rules-ai.js (HP, heroPower, mulligan/mullDone, play(...,pos), costOf); this file is only their interface.
   Everything here is static styling or a single transform/opacity animation (css/v29.css). */

/* ---- hero power button: a badge on the portrait. Tap once to read it, tap again to use it (or pick a target) ---- */
const HP_ICO={v:'M12 5C6 5 2 12 2 12s4 7 10 7 10-7 10-7-4-7-10-7zm0 3a4 4 0 1 0 0 8 4 4 0 1 0 0-8z',
 m:'M12 2l2.2 2.7 3.4-.6.6 3.4L21 9.8 19.7 13l1.3 3.2-2.8 2.3-.6 3.4-3.4-.6L12 22l-2.2-2.7-3.4.6-.6-3.4L3 14.2 4.3 11 3 7.8l2.8-2.3.6-3.4 3.4.6zm0 6a4 4 0 1 0 0 8 4 4 0 1 0 0-8z',
 c:'M12 2c4 6 7 9 7 13a7 7 0 0 1-14 0c0-4 3-7 7-13z',n:'M12 2l3 7h7l-5.6 4.3 2.1 7.2L12 16.3 5.5 20.5l2.1-7.2L2 9h7z'};
function hpMount(el,pi,fac){let b=el.querySelector('.hpb');if(!b){b=document.createElement('button');b.className='hpb';el.appendChild(b)}
 const h=HP[fac];b.dataset.hp=pi;b.setAttribute('aria-label',h?`${h.n}: ${h.x} (${HP_COST} Flux)`:'Hero power');b.title=h?`${h.n} · ${HP_COST} Flux\n${h.x}`:'';
 b.innerHTML=h?`<svg viewBox="0 0 24 24"><path d="${HP_ICO[fac]||HP_ICO.n}"/></svg><b>${HP_COST}</b>`:'';b.hidden=!h}
function hpRender(el,pi){const b=el.querySelector('.hpb');if(!b||!G)return;const p=G.p[pi],my=pi===0&&G.cur===0&&!p.ai&&!G.over&&!G.mullPending;
 const can=my&&canHP(G,0),st=(p.hpUsed?1:0)|(can?2:0)|(pi===0&&UI.sel&&UI.sel.k==='p'?4:0);if(b._st===st)return;b._st=st;
 b.classList.toggle('used',!!p.hpUsed);b.classList.toggle('can',can);b.classList.toggle('sel',!!(st&4))}
function hpWhy(){const p=G.p[0],h=HP[p.fac];if(p.hpUsed)return'Already used this turn';if(p.flux<HP_COST)return`Needs ${HP_COST} Flux`;
 if(h.ok&&!h.ok(G,0))return p.fac==='v'?'You need an Entity on the board':'Your board is full';if(h.tg&&!hpTargets(G,0).length)return'You need a friendly unit to sacrifice';return'Not now'}
function hpTap(pi){if(!G)return;const h=HP[G.p[pi].fac];if(!h)return;
 if(pi===1||!myTurn()){toast(`${h.n}: ${h.x}`,2600);return}
 if(!canHP(G,0)){sfx('err');toast(`${h.n}: ${hpWhy()}`,2200);return}
 if(UI.sel&&UI.sel.k==='p'){if(h.tg){toast('Choose a friendly unit');return}humanHP();return}
 sfx('click');setSel({k:'p'})}
/* the AI's turn: its badge lights and the target is marked before the power resolves */
async function hpCue(pi,tg){const b=heroBox(pi).querySelector('.hpb');if(b)restartCls(b,'fire');const h=HP[G.p[pi].fac];if(h&&pi===1)toast(`${G.p[1].name||'The enemy'}: ${h.n}`,1500);
 if(tg){const te=tEl(tg,1);if(te)te.classList.add('tgt')}await sleep(D(700))}
function hpFx(f){const b=heroBox(f.pi).querySelector('.hpb');if(b)restartCls(b,'fire');sfx('hp_'+f.fac);hap('drop')}
Object.assign(SFX,{hp_v:()=>{tone(98,92,1.2,'sine',.09,1);noise(.8,700,9,.05,'bandpass',300)},hp_m:()=>{tone(440,660,.12,'square',.03);tone(220,220,.3,'triangle',.05,0,.1)},
 hp_c:()=>{tone(110,55,.5,'sine',.18);noise(.4,900,2,.1,'lowpass',200)},hp_n:()=>[392,494,587].forEach((f,i)=>tone(f,f,.5,'sine',.04,1,i*.06))});

/* ---- live costs (a card whose cost depends on the board) and the Unhinged cue on cards in hand ---- */
function handCosts(){if(!G)return;const p=G.p[0],un=p.mad>=5;for(const el of $$('#hand [data-h]')){const c=p.hand.find(x=>x.uid===+el.dataset.h);if(!c)continue;const d=C[c.id],k=costOf(G,0,c),b=el.querySelector('.cost b');
  if(b&&b.textContent!==String(k))b.textContent=k;el.classList.toggle('cheap',k<d.c);el.classList.toggle('unhot',un&&d.k.includes('unhinged'))}}

/* ---- unit placement: dropping a unit between two others puts it there; a marker shows the spot while dragging ---- */
function insPos(x,y){const box=$('#myb'),r=box.getBoundingClientRect();if(y<r.top-30||y>r.bottom+30)return null;const us=[...box.querySelectorAll('.unit[data-u]:not(.dying)')];
 for(let i=0;i<us.length;i++){const q=us[i].getBoundingClientRect();if(x<q.left+q.width/2)return i}return us.length}
function insMark(x,y){let m=$('#insm');const c=x!=null&&P&&P.drag==='h'&&G&&G.p[0].hand.find(q=>q.uid===P.uid),d=c&&C[c.id];
 const i=x!=null&&d&&d.t==='u'&&!needsTarget(G,0,d)&&G.p[0].board.length?insPos(x,y):null;if(i==null){if(m)m.classList.remove('on');return}
 if(!m){m=document.createElement('i');m.id='insm';document.body.appendChild(m)}const us=[...$('#myb').querySelectorAll('.unit[data-u]:not(.dying)')],gap=8;
 let gx;if(!us.length)return;if(i===0){const q=us[0].getBoundingClientRect();gx=q.left-gap}else if(i>=us.length){const q=us[us.length-1].getBoundingClientRect();gx=q.right+gap}else{const a=us[i-1].getBoundingClientRect(),b=us[i].getBoundingClientRect();gx=(a.right+b.left)/2}
 const q=us[0].getBoundingClientRect();m.style.transform=`translate(${Math.round(gx-2)}px,${Math.round(q.top)}px)`;m.style.height=q.height+'px';m.classList.add('on')}

/* ---- mulligan: tap the cards to send back, then keep the rest ---- */
function mullOpen(){let o=$('#mull');if(!o){o=document.createElement('div');o.id='mull';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');document.body.appendChild(o)}
 const g=G,hand=g.p[0].hand,sel=new Set();
 o.innerHTML=`<div class="mbox"><h2>YOUR OPENING HAND</h2><div class="orn"></div><p class="msub">Tap the cards you want to send back. They are shuffled into your deck and replaced.</p><div class="mrow"></div><div class="rowb"><button class="btn" id="mullGo">Keep this hand</button></div></div>`;
 const row=o.querySelector('.mrow');for(const c of hand){const w=document.createElement('div');w.className='mc';w.dataset.m=c.uid;w.appendChild(cardEl(c.id));w.insertAdjacentHTML('beforeend','<i class="mx"></i>');row.appendChild(w)}
 const go=o.querySelector('#mullGo');
 row.onclick=e=>{const w=e.target.closest('.mc');if(!w)return;const id=+w.dataset.m;if(sel.has(id))sel.delete(id);else sel.add(id);w.classList.toggle('out',sel.has(id));sfx('flip');go.textContent=sel.size?`Replace ${sel.size} card${sel.size>1?'s':''}`:'Keep this hand'};
 go.onclick=()=>{if(G!==g)return;sfx('click');o.classList.remove('on');mullDone(G,[...sel]);matchGo()};
 requestAnimationFrame(()=>o.classList.add('on'))}
onShow(id=>{if(id!=='match'){const o=$('#mull');if(o)o.classList.remove('on')}});

Object.assign(window.__hs,{HP,hpTap,hpRender,handCosts,insPos,mullOpen,mullDone,heroPower,canHP,costOf,matchGo});

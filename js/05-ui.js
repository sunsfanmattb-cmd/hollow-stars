'use strict';
/* ================= SCREENS ================= */
let cur='title';
function show(id){cur=id;if(id!=='match'){document.body.classList.remove('mzhi');cinSkip()}setTimeout(auMood,0);$$('.screen').forEach(s=>s.classList.toggle('on',s.id===id));hideZoom();scene();if(id==='pick')renderPick();if(id==='builder')renderBuilder(1);if(id==='mydecks')renderDecks();if(id==='packs')renderPacks();if(id==='coll')renderColl();v8Show(id);try{v9Show(id)}catch(e){console.warn('v9 screen',e)}batPoke()}
$$('[data-back]').forEach(b=>b.addEventListener('click',()=>{sfx('click');show('title')}));
$('#bPlay').onclick=()=>{sfx('click');show('pick')};$('#bBuild').onclick=()=>{sfx('click');show('mydecks')};$('#bHow').onclick=()=>{sfx('click');show('howto')};$('#bPacks').onclick=()=>{sfx('click');show('packs')};$('#bColl').onclick=()=>{sfx('click');show('coll')};
const UI={sel:null,busy:false,auto:/[?&]auto=1/.test(location.search),speed:/[?&]fast=1/.test(location.search)?.12:(()=>{try{const v=+localStorage.getItem('hsSpd');return v>0&&v<=1?v:1}catch(e){return 1}})(),hw:100,hh:140,deck:'v',opp:'r'};
function layout(){const W=innerWidth,H=innerHeight,land=W>H*1.15;document.body.classList.toggle('land',land);let uw,hw,side=0;
 /* v9.1: match HUD scale (hero panels + turn controls). Desktop scales with the window; phones get a moderate fixed bump */
 const hzf=land?Math.round(Math.max(H<380?1:H<480?1.04:1.12,Math.min(2.4,W/1000,H/620))*100)/100:1.1;document.documentElement.style.setProperty('--hz',hzf);
 if(!land){uw=Math.min((W-16)/6.2,100,H*.1);hw=Math.min(W/3.7,150,H*.17)}else{side=Math.round(Math.max(176,Math.min(260*hzf,W*(hzf>1.2?.25:.22))));uw=Math.min((H-50)/4.6,(W-side-60)/6.4,130*hzf);hw=uw*1.2}
 const st=document.documentElement.style;st.setProperty('--uw',uw+'px');st.setProperty('--uh',uw*1.34+'px');st.setProperty('--hw',hw+'px');st.setProperty('--hh',hw*1.4+'px');st.setProperty('--side',side+'px');const mz=Math.round(Math.max(1,Math.min(3,land?Math.min(W/1000,H/640):Math.min(W/760,H/1000)))*100)/100;st.setProperty('--dmz',mz);document.body.classList.toggle('dz',mz>1);UI.mz=mz;UI.hw=hw;UI.hh=hw*1.4;
 $('#bgrid').style.setProperty('--bw',Math.max(92,Math.min(130,(land?W*.62:W)/3.6))+'px');bgInit();teSize();if(SC.key)scene();if(G&&cur==='match')renderMatch()}
addEventListener('resize',()=>{clearTimeout(UI.rt);UI.rt=setTimeout(layout,120)});
function toast(m,ms=1600){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('on'),ms)}
/* ===== v7.4 text auto-fit (RENDERING_RULES.md §9): card names, type lines and deck names always fit their box =====
   Elements carry data-fit="nm" (card name: shrink to one line, min .7, then two tighter lines), "ty" (type line) or "dk" (deck name).
   The CSS multiplies their base font-size by --fit. A ResizeObserver on each text box fires only when that box changes size
   (first layout, orientation change, zoom, a different card size), before paint, so there is no per-frame layout and no visible
   jump. Results are cached by text + box width + font size, so a card size is measured once and every copy reuses it. */
const FIT={c:new Map(),n:0,min:{nm:.7,ty:.72,dk:.66}};
function fitEl(e){const m=e.dataset.fit,p=e.parentElement;if(!p||!e.isConnected)return;const box=m==='nm'?p.clientWidth*.92:e.clientWidth;if(box<4)return;
 const k=m+'|'+e.textContent+'|'+Math.round(box)+'|'+getComputedStyle(p).fontSize+(m==='nm'&&e.closest('.card.full')?'|F':'');/* full-art names use a larger base size, so they must not share a cache entry */let r=FIT.c.get(k);
 if(!r){if(e.style.getPropertyValue('--fit'))e.style.removeProperty('--fit');e.classList.remove('fit2');FIT.n++;const nat=e.scrollWidth,s=nat>0?box/nat:1,mn=FIT.min[m];
  r=s>=.995?{f:1}:s>=mn?{f:Math.floor(s*50)/50}:m!=='ty'?{f:Math.max(.56,Math.min(m==='nm'?.84:.8,Math.floor(1.6*s*50)/50)),two:1}:{f:mn};
  /* two-line estimate assumes an even break; an uneven one ("Crown of Ten Thousand / Teeth") can still overflow, so verify once and step down (cached after) */
  if(r.two){e.classList.add('fit2');for(let i=0;i<6;i++){e.style.setProperty('--fit',String(r.f));if(e.scrollWidth<=Math.ceil(e.clientWidth)+1||r.f<=.5)break;r.f=Math.round((r.f-.04)*100)/100}}
  FIT.c.set(k,r)}
 const fv=r.f===1?'':String(r.f);if(e.style.getPropertyValue('--fit')!==fv){if(fv)e.style.setProperty('--fit',fv);else e.style.removeProperty('--fit')}e.classList.toggle('fit2',!!r.two);e._fitk=k}
FIT.ro=new ResizeObserver(es=>{for(const en of es){const b=en.target;if(!b.isConnected){FIT.ro.unobserve(b);continue}for(const e of b._fit||[])fitEl(e)}});
function fitScan(root){for(const e of root.querySelectorAll('[data-fit]')){if(e._fw)continue;e._fw=1;const b=e.parentElement;(b._fit||(b._fit=[])).push(e);FIT.ro.observe(b)}}
function fitRefresh(root=document){for(const e of root.querySelectorAll('[data-fit]'))if(e._fw)fitEl(e)}
/* v9.7: names were measured in the fallback serif before the faction faces arrived; re-measure once they load */
try{if(document.fonts){const rf=()=>{FIT.c.clear();fitRefresh()};document.fonts.ready.then(rf);document.fonts.addEventListener('loadingdone',rf)}}catch(e){}
function cardEl(id,big){const d=C[id],e=document.createElement('div');e.className=`card f-${d.f} r-${d.r}${d.r==='L'?' full':''}${d.t==='s'?' spell':''}${cardText(d).replace(/<[^>]+>/g,'').length>46?' long':''}`;e.dataset.cid=id;
 e.innerHTML=`<div class="art" style="background-image:${artBG(id,big)}">${lgHTML(id,big)}</div>${costHTML(d.c)}<div class="nm"><span data-fit="nm">${d.n}</span></div><div class="ty">${sigHTML(d.f)}<span data-fit="ty">${d.t==='u'?FAC[d.f].s:'Rite'}</span>${setHTML(d.r)}${d.r==='L'?'<i class="lgem"><b></b></i>':''}</div><div class="tx"><div class="rt">${cardText(d)}</div>${d.fl?`<div class="fl">${d.fl}</div>`:''}</div>${d.t==='u'?'<i class="plq l"></i><i class="plq r"></i>'+atkHTML(d.f,d.a)+hpHTML(d.h):''}${d.r==='R'||d.r==='L'?'<i class="foil"></i>':''}${lgTrim(id)}`;{const vr=varShow(id);if(vr){e.classList.add('vr','vr-'+vr);e.insertAdjacentHTML('beforeend','<i class="vfr"></i>')}}lgReg(e);fitScan(e);return e}
/* ---- pick ---- */
const SH={win:60,loss:25,pack:100,dup:{C:5,U:15,R:40,L:150},free:3};
const maxC=id=>C[id].r==='L'?1:2;
let COLL=(()=>{try{const o=JSON.parse(localStorage.getItem('hsCol')||'null');if(o&&o.v===1&&o.own)return o}catch(e){}return{v:1,own:{},shards:0,packs:SH.free,opened:0}})();
function saveColl(){try{localStorage.setItem('hsCol',JSON.stringify(COLL))}catch(e){}}
const owned=id=>C[id].pk||C[id].cmp?(COLL.own[id]||0):maxC(id);
/* ================= CUSTOM DECKS (v7.4): up to 5 named decks in localStorage.hsDecks = {v:1,decks:[{id,name,fac,cards}]} =================
   The single v7.x deck (localStorage.hsDeck) is migrated into slot 1 on first load. A deck can be saved at any size; only valid ones
   (30 cards, copy limits, owned) can be picked for a match. */
const DKMAX=5,DKNAME=24,dkId=()=>'u'+Date.now().toString(36)+Math.floor(Math.random()*1296).toString(36);
const dkClean=cards=>(Array.isArray(cards)?cards:[]).filter(id=>C[id]&&C[id].r!=='T').slice(0,30);
const majFac=cards=>{const n={};for(const id of cards){const f=C[id].f;if(f!=='n')n[f]=(n[f]||0)+1}return Object.keys(n).sort((a,b)=>n[b]-n[a])[0]||'v'};
function saveDecks(){try{localStorage.setItem('hsDecks',JSON.stringify(DK))}catch(e){}}
let DK=(()=>{try{const o=JSON.parse(localStorage.getItem('hsDecks')||'null');if(o&&o.v===1&&Array.isArray(o.decks))return{v:1,decks:o.decks.filter(d=>d&&typeof d==='object').slice(0,DKMAX).map((d,i)=>({id:/^u[0-9a-z]+$/.test(d.id)?d.id:dkId()+i,name:String(d.name||'Deck '+(i+1)).slice(0,DKNAME),fac:['v','m','c'].includes(d.fac)?d.fac:'v',cards:dkClean(d.cards),...(d.hf?{hf:1}:{})}))}}catch(e){}
 const o={v:1,decks:[]};try{const old=JSON.parse(localStorage.getItem('hsDeck')||'null');if(old&&Array.isArray(old.cards)){const cards=dkClean(old.cards);if(cards.length)o.decks.push({id:dkId(),name:'My Deck',fac:majFac(cards),cards})}}catch(e){}
 try{localStorage.setItem('hsDecks',JSON.stringify(o))}catch(e){}return o})();
const dkGet=id=>DK.decks.find(d=>d.id===id);
/* v9: a deck's faction = the hero the player explicitly chose (hf), otherwise the majority faction of its cards.
   Old saves have no hf: their stored fac is trusted only if it isn't the old 'v' default or the deck actually contains that faction. */
function dkFac(d){if(!d)return'v';const ok=['v','m','c'].includes(d.fac);if(d.hf&&ok)return d.fac;const n={};for(const id of d.cards||[]){const f=C[id]&&C[id].f;if(f&&f!=='n')n[f]=(n[f]||0)+1}
 const ks=Object.keys(n);if(!ks.length)return ok?d.fac:'v';const mx=Math.max(...ks.map(k=>n[k]));if(ok&&n[d.fac]===mx)return d.fac;if(d.hf===undefined&&ok&&d.fac!=='v'&&n[d.fac])return d.fac;return ks.filter(k=>n[k]===mx).sort()[0]}
function dkCheck(d){const n=d.cards.length;if(n!==30)return{ok:false,why:n+'/30 cards'};for(const id of new Set(d.cards)){const c=d.cards.filter(x=>x===id).length;if(c>Math.min(maxC(id),owned(id)))return{ok:false,why:owned(id)<c?'needs cards you don’t own':'too many copies'}}return{ok:true,why:'Ready'}}
const dkDeck=d=>({fac:dkFac(d),name:d.name,cards:d.cards.slice()});
function renderPick(){const box=$('#decks');box.innerHTML='';const opts=['v','m','c',...DK.decks.map(d=>d.id)];const okk=k=>!dkGet(k)||dkCheck(dkGet(k)).ok;if(!opts.includes(UI.deck)||!okk(UI.deck))UI.deck='v';
 for(const k of opts){const d=dkGet(k),f=d?dkFac(d):k,ck=d?dkCheck(d):null,b=document.createElement('button');b.className=`tile f-${f}${UI.deck===k?' on':''}${d?' mine':''}${ck&&!ck.ok?' bad':''}`;b.dataset.deck=k;if(ck&&!ck.ok)b.setAttribute('aria-disabled','true');
  b.style.setProperty('--fr',`var(--fr-${f})`);b.innerHTML=`<div class="ta" style="background-image:${heroBG(f)}"></div><div class="tmeta"><b${d?' data-fit="dk"':''}>${d?esc(d.name):FAC[f].n}</b><small>${d?`Your deck · ${FAC[f].n} hero · ${ck.ok?'30 cards':'<em>'+ck.why+'</em>'}`:FAC[f].d}</small></div>`;
  b.onclick=()=>{if(ck&&!ck.ok){sfx('err');toast(`“${d.name}” isn’t ready: ${ck.why}`);return}sfx('click');UI.deck=k;renderPick()};box.appendChild(b)}fitScan(box);
 const op=$('#opps');op.innerHTML='';for(const[k,n]of[['r','Random'],['v','Abyss'],['m','Derelict'],['c','Communion']]){const b=document.createElement('button');b.textContent=n;b.dataset.opp=k;b.className=UI.opp===k?'on':'';b.onclick=()=>{sfx('click');UI.opp=k;renderPick()};op.appendChild(b)}}
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
$('#pDecks').onclick=()=>{sfx('click');show('mydecks')};
$('#bStart').onclick=()=>{auInit();sfx('click');const d=dkGet(UI.deck);const mine=d&&dkCheck(d).ok?dkDeck(d):prebuilt(['v','m','c'].includes(UI.deck)?UI.deck:'v');const of=UI.opp==='r'?pick(['v','m','c']):UI.opp;startMatch(mine,of)};
/* in-game dialog (WebView prompt()/confirm() are unreliable): dlg({t,x,val,ok,danger}) -> Promise<string|true|null> */
function dlg(o){return new Promise(res=>{const w=$('#dlg'),inp=$('#dlgI');$('#dlgT').textContent=o.t;$('#dlgX').textContent=o.x||'';$('#dlgX').style.display=o.x?'':'none';
 inp.style.display=o.val!==undefined?'':'none';inp.maxLength=o.max||DKNAME;inp.classList.toggle('code',!!o.raw);inp.value=o.val||'';const ok=$('#dlgOk');ok.textContent=o.ok||'OK';ok.classList.toggle('danger',!!o.danger);w.classList.add('on');
 const done=v=>{w.classList.remove('on');ok.onclick=$('#dlgNo').onclick=w.onclick=inp.onkeydown=null;res(v)};
 ok.onclick=()=>{if(o.val!==undefined){const v=o.raw?inp.value.replace(/\s+/g,'').slice(0,o.max||200):inp.value.replace(/\s+/g,' ').trim().slice(0,DKNAME);if(o.raw&&o.okRaw){o.okRaw(inp);return}if(!v){sfx('err');inp.focus();return}sfx('click');done(v)}else{sfx('click');done(true)}};
 $('#dlgNo').onclick=()=>{sfx('click');done(null)};w.onclick=e=>{if(e.target===w)done(null)};inp.onkeydown=e=>{if(e.key==='Enter')ok.onclick();if(e.key==='Escape')done(null)};
 if(o.val!==undefined)setTimeout(()=>{try{inp.focus();inp.select()}catch(e){}},60)})}
/* deck list screen */
const dkFreeName=()=>{for(let i=1;;i++){const n='Deck '+i;if(!DK.decks.some(d=>d.name===n))return n}};
function renderDecks(){const L=$('#dlist');L.innerHTML='';$('#dcount').textContent=DK.decks.length+'/'+DKMAX;$('#dNew').disabled=DK.decks.length>=DKMAX;
 if(!DK.decks.length)L.innerHTML='<p class="empty dk0">No custom decks yet. Tap “New Deck” to build one (up to 5).</p>';
 DK.decks.forEach((d,i)=>{const ck=dkCheck(d),df=dkFac(d),r=document.createElement('div');r.className=`tile drow f-${df} on${ck.ok?'':' bad'}`;r.dataset.slot=d.id;r.dataset.fac=df;r.style.setProperty('--fr',`var(--fr-${df})`);
  r.innerHTML=`<div class="ta" style="background-image:${heroBG(df)}"><span class="emb">${sigHTML(df)}</span></div><div class="dmeta"><b data-fit="dk">${esc(d.name)}</b><small><span class="dfac">${FAC[df].n}</span> · <span class="dn">${d.cards.length}/30</span> · <span class="dv ${ck.ok?'ok':'no'}">${ck.ok?'✓ Ready':'✗ '+ck.why}</span></small>
   <div class="dact"><button class="btn sm" data-dk="edit">Edit</button><button class="btn sm ghost" data-dk="ren">Rename</button><button class="btn sm ghost" data-dk="dup"${DK.decks.length>=DKMAX?' disabled':''}>Duplicate</button><button class="btn sm ghost danger" data-dk="del">Delete</button></div></div>`;L.appendChild(r)});fitScan(L)}
$('#dlist').addEventListener('click',async e=>{const b=e.target.closest('[data-dk]');if(!b)return;const d=dkGet(b.closest('[data-slot]').dataset.slot);if(!d)return;const a=b.dataset.dk;
 if(a==='edit'){sfx('click');bdOpen(d.id);return}
 if(a==='ren'){const v=await dlg({t:'Rename deck',val:d.name,ok:'Save'});if(v){d.name=v;saveDecks();renderDecks()}return}
 if(a==='dup'){if(DK.decks.length>=DKMAX){sfx('err');toast('5 decks max: delete one first');return}const c={id:dkId(),name:(d.name+' copy').slice(0,DKNAME),fac:d.fac,hf:d.hf,cards:d.cards.slice()};DK.decks.splice(DK.decks.indexOf(d)+1,0,c);saveDecks();sfx('click');renderDecks();toast(`Duplicated “${d.name}”`);return}
 if(a==='del'){const v=await dlg({t:'Delete deck?',x:`“${d.name}” will be gone for good.`,ok:'Delete',danger:1});if(v){DK.decks=DK.decks.filter(x=>x!==d);if(UI.deck===d.id)UI.deck='v';saveDecks();sfx('click');renderDecks()}}});
$('#dNew').onclick=async()=>{if(DK.decks.length>=DKMAX){sfx('err');toast('5 decks max: delete one first');return}sfx('click');const v=await dlg({t:'Name your new deck',val:dkFreeName(),ok:'Create'});if(!v)return;
 const d={id:dkId(),name:v,fac:'v',cards:[]};DK.decks.push(d);saveDecks();bdOpen(d.id)};
/* ================= MATCH ================= */
let G=null,LAST=null;
function startMatch(mine,of,o={}){LAST={mine,of,o};const dif=o.dif||V8.dif;G=newGame(mine,o.foe||prebuilt(of),{ai:[UI.auto?1:0,1],first:o.first,rule:o.rule,esan:o.esan,dif});G.meta={mode:o.mode||(o.ch?'camp':'quick'),ch:o.ch||null,dif,deck:mine.name||mine.fac,dkey:o.dkey||UI.deck,boss:o.boss||null};UI.sel=null;UI.busy=false;UI.aiRun=false;UI.overShown=0;UI.cin=null;$('#cin').className='';MZ.me=MZ.op=-1;LB.drips=[];LB.pools=[];BG.rip=[];$$('.whisp').forEach(w=>w.remove());{const l=isLand()?'':'_p';scPre(['victory'+l,'defeat'+l])}
 for(const id of['#opb','#myb','#hand'])$(id).innerHTML='';$('#over').classList.remove('on');show('match');
 for(const pi of[0,1]){const el=$(pi?'#oph':'#myh'),p=G.p[pi];el.className=`hero f-${p.fac}`;el.querySelector('.av').style.backgroundImage=pi&&o.boss?`url(${realArt(o.boss)}),${heroBG(p.fac)}`:heroBG(p.fac);el.classList.toggle('boss',!!(pi&&o.boss));el.querySelector('.hn').textContent=pi?p.name:(UI.auto?'Autopilot — ':'You — ')+FAC[p.fac].n;el.querySelector('.md').innerHTML='<i></i>'.repeat(10)+'<span>MADNESS</span>';el.querySelector('.fx').innerHTML='<i></i>'.repeat(10);el.querySelector('.san').textContent=''}
 renderMatch();flushFx();if(G.second===0&&!UI.auto){const g=G;setTimeout(()=>{if(G===g)toast('You go second: +1 card, and +1 Flux on your first turn',2200)},D(250))}v8MatchStart(G);if(G.p[G.cur].ai)runAI()}
function heroBox(pi){return $(pi?'#oph':'#myh')}
function renderHero(pi){const p=G.p[pi],el=heroBox(pi);const s=el.querySelector('.san');s.textContent=Math.max(0,p.san);s.classList.toggle('low',p.san<=7);
 el.querySelectorAll('.md i').forEach((e,i)=>{e.classList.toggle('on',i<p.mad);e.classList.toggle('hi',i<p.mad&&p.mad>=7)});el.querySelector('.fv').textContent=`${p.flux}/${p.max} FLUX`;el.querySelectorAll('.fx i').forEach((e,i)=>{const c=i<p.flux?'on':i<p.max?'sp':'lk';if(e.className!==c)e.className=c});
 {const s=`✋ ${p.hand.length}<br>▤ ${p.deck.length}`;if(el._cts!==s){el._cts=s;el.querySelector('.cts').innerHTML=s}}el.classList.toggle('act',G.cur===pi&&!G.over)}
function unitEl(u){const d=C[u.id],e=document.createElement('div');e.className=`unit f-${d.f}`;e.dataset.u=u.uid;e.dataset.cid=u.id;e.innerHTML=`<div class="art${d.r==='L'?' lgart':''}" style="background-image:${artBG(u.id)}">${lgHTML(u.id)}${d.r==='L'?'<i class="lsl"></i>':''}</div>${lgTrim(u.id)}<div class="kws"></div>${atkHTML(d.f,u.a)}${hpHTML(u.h)}`;e._h=u.h;lgReg(e);return e}
function syncBoard(box,list){const ex=new Map();for(const el of box.children)if(!el.classList.contains('dying'))ex.set(+el.dataset.u,el);const keep=new Set();let curEl=box.firstElementChild;
 for(const u of list){let el=ex.get(u.uid);if(!el){el=unitEl(u);el.classList.add('enter');setTimeout(()=>el.classList.remove('enter'),520)}keep.add(el);
  while(curEl&&curEl.classList.contains('dying')&&curEl!==el)curEl=curEl.nextElementSibling;if(el!==curEl)box.insertBefore(el,curEl);else curEl=curEl.nextElementSibling;updUnit(el,u)}
 for(const[k,el]of ex)if(!keep.has(el)){const hp=el.querySelector('.hp');if(hp){hp.style.setProperty('--p','0%');hp.querySelector('b').textContent=0}el.classList.add('dying');el.classList.remove('sel','tgt','ready');setTimeout(()=>el.remove(),760)}}
function updUnit(e,u){const d=C[u.id],a=e.querySelector('.atk'),h=e.querySelector('.hp');a.querySelector('b').textContent=u.a;a.classList.toggle('up',u.a>d.a);a.classList.toggle('dn',u.a<d.a);h.querySelector('b').textContent=Math.max(0,u.h);h.classList.toggle('hurt',u.h<u.mh);
 const pct=u.h<=0?0:Math.max(8,Math.min(100,u.h/Math.max(1,u.mh)*100));h.style.setProperty('--p',pct.toFixed(1)+'%');h.dataset.p=pct.toFixed(1);if(e._h!==undefined&&u.h<e._h){restartCls(h,'drain');clearTimeout(h._t);h._t=setTimeout(()=>h.classList.remove('drain'),1100);if(u.h>0)dropFx(h)}else if(e._h!==undefined&&u.h>e._h)dropFx(h,1);e._h=u.h;
 const ks=u.k.join();if(e.dataset.k!==ks){e.dataset.k=ks;e.querySelector('.kws').innerHTML=u.k.filter(k=>ICO[k]&&k!=='guard').map(svgI).join('')}
 e.classList.toggle('guard',u.k.includes('guard'));e.classList.toggle('phase',u.k.includes('phase'));e.classList.toggle('sleep',u.o===G.cur&&!u.ready&&!G.over);
 e.classList.toggle('ready',u.o===0&&G.cur===0&&!G.p[0].ai&&!G.over&&canAtk(u));e.classList.toggle('sel',UI.sel?.k==='u'&&UI.sel.uid===u.uid)}
function syncHand(){const box=$('#hand'),hand=G.p[0].hand,ex=new Map();for(const el of box.children)ex.set(+el.dataset.h,el);const keep=new Set();
 const n=hand.length,W=box.clientWidth||innerWidth,hw=UI.hw,rmax=n>1?Math.min(3.2,15/n)*(n-1)/2*Math.PI/180:0,gap=n>1?Math.min(hw*1.04,(W-hw-28-(document.body.classList.contains('dz')?UI.hh*Math.sin(rmax)+16:0))/(n-1)):0,x0=(W-(hw+gap*(n-1)))/2;
 hand.forEach((c,i)=>{let el=ex.get(c.uid);if(!el){el=cardEl(c.id);el.dataset.h=c.uid;if(c.echo){el.classList.add('echo');el.insertAdjacentHTML('beforeend','<i class="ech">ECHO</i>')}el.classList.add('drawn');box.appendChild(el);setTimeout(()=>el.classList.remove('drawn'),600)}keep.add(el);
  const off=i-(n-1)/2;el.style.left=x0+i*gap+'px';el.style.top=(4+Math.min(12,off*off*.5)).toFixed(1)+'px';el.style.rotate=(n>1?off*Math.min(3.2,15/n):0).toFixed(2)+'deg';el.style.zIndex=i+1;el.style.setProperty('--i',i);
  el.classList.toggle('can',G.cur===0&&!G.p[0].ai&&!G.over&&canPlay(G,0,c));el.classList.toggle('sel',UI.sel?.k==='h'&&UI.sel.uid===c.uid)});
 for(const[k,el]of ex)if(!keep.has(el))el.remove()}
function selTargets(){const s=UI.sel;if(!s||!G)return[];if(s.k==='h'){const c=G.p[0].hand.find(x=>x.uid===s.uid);if(!c)return[];const d=C[c.id];return d.tg?spellTargets(G,0,d.tg):[]}const u=findU(G,s.uid);return u&&canAtk(u)?atkTargets(G,0,u):[]}
function hint(){if(!G)return'';if(G.over)return'';if(G.p[G.cur].ai)return G.cur===1?'The enemy stirs…':'Autopilot is thinking…';const s=UI.sel;
 if(s?.k==='h'){const c=G.p[0].hand.find(x=>x.uid===s.uid),d=c&&C[c.id];if(d)return d.tg?'Choose a target for '+d.n:'Tap again or drag up to play '+d.n}
 if(s?.k==='u')return'Choose what to attack · ☠ = it dies';if(legal(G,0).length)return'Your turn: drag or tap cards, tap units to attack';return'No moves left. End your turn.'}
function renderMatch(){if(!G)return;overCheck();artPre([...G.p[0].hand.map(c=>c.id),...G.p[0].board.map(u=>u.id),...G.p[1].board.map(u=>u.id),'h'+G.p[0].fac,'h'+G.p[1].fac],1);renderHero(0);renderHero(1);syncBoard($('#opb'),G.p[1].board);syncBoard($('#myb'),G.p[0].board);syncHand();
 {const nt=new Map();for(const t of selTargets()){const el=tEl(t,1);if(el)nt.set(el,t[0]==='u'&&findU(G,+t.slice(1))?.o===0)}$$('.tgt').forEach(e=>{if(!nt.has(e))e.classList.remove('tgt','ftgt')});for(const[el,f]of nt){if(!el.classList.contains('tgt'))el.classList.add('tgt');el.classList.toggle('ftgt',f)}}
 madSet();$('#hint').textContent=hint();const my=G.cur===0&&!G.p[0].ai&&!G.over;try{pvSync(my&&!!UI.sel)}catch(e){}const eb=$('#endt');eb.disabled=!my||UI.busy;eb.querySelector('span').textContent=my?'End Turn':'Enemy Turn';eb.classList.toggle('glow',my&&!legal(G,0).length);eb.classList.toggle('wait',my&&!!UI.busy)}
/* v1.6 combat preview: play the selected attack/Rite on a cloned game and badge each target with the outcome */
function pvCalc(t){const s=UI.sel;try{const c=cloneG(G),ok=s.k==='u'?attack(c,0,s.uid,t):play(c,0,s.uid,t);if(!ok)return'';if(c.over)return c.winner===0?'LETHAL':'✖';if(t[0]==='h')return'';const tu=findU(G,+t.slice(1)),dies=!findU(c,+t.slice(1)),me=s.k==='u'&&!findU(c,s.uid);if(tu&&tu.o===0)return dies?'☠':'';return dies&&me?'☠ TRADE':dies?'☠':me?'✖':''}catch(e){return''}}
function pvSync(on){const pv=new Map();if(on)for(const t of selTargets()){const el=tEl(t,1);if(el){const v=pvCalc(t);if(v)pv.set(el,v)}}for(const b of $$('.pvb'))if(pv.get(b.parentElement)!==b.textContent)b.remove();for(const[el,v]of pv)if(!el.querySelector(':scope>.pvb')){const b=document.createElement('i');b.className='pvb'+(v==='LETHAL'?' lethal':v==='✖'?' bad':'');b.textContent=v;el.appendChild(b)}}
function tEl(t,box){if(t[0]==='h')return box?heroBox(+t[1]):heroBox(+t[1]).querySelector('.av');return document.querySelector(`.unit[data-u="${t.slice(1)}"]`)}
function center(el){const r=el.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]}
function floatAt(el,txt,col,cls=''){if(!el)return;const[x,y]=center(el),d=document.createElement('div');d.className='fnum '+cls;d.style.setProperty('--rx',(Math.random()*30-15).toFixed(0)+'px');d.textContent=txt;d.style.color=col;d.style.left=x+'px';d.style.top=y+'px';document.body.appendChild(d);setTimeout(()=>d.remove(),1150)}
function burstAt(el,col){if(!el)return;const[x,y]=center(el),d=document.createElement('div');d.className='burst';d.style.left=x+'px';d.style.top=y+'px';d.style.setProperty('--c',col);document.body.appendChild(d);setTimeout(()=>d.remove(),650)}
function bump(el,c){if(!el)return;restartCls(el,c);clearTimeout(el['_b'+c]);el['_b'+c]=setTimeout(()=>el.classList.remove(c),420)}
/* restart a class-driven CSS animation without a forced synchronous layout (the old offsetWidth trick thrashed layout mid-animation) */
function restartCls(el,c){if(el.classList.contains(c)){const an=el.getAnimations({subtree:true});if(an.length){for(const a of an)a.currentTime=0;return}el.classList.remove(c);void getComputedStyle(el).animationName}el.classList.add(c)}
const FCOL={v:'#b060ff',m:'#40e0f0',c:'#ff4060',n:'#e0c070'};
function flushFx(){if(!G)return;BG.act=performance.now();batPoke();const L=G.fx;G.fx=[];for(const f of L){switch(f.k){
 case'dmg':{const el=tEl(f.id),h=f.id[0]==='h';floatAt(el,'-'+f.n,h?'#ff3040':'#ff5a78',h?'big':f.n>=4?'mid':'');bump(h?heroBox(+f.id[1]):el,'hit');dmgFx(f);break}
 case'heal':floatAt(tEl(f.id),'+'+f.n,'#8affb0');sfx('heal');break;
 case'mad':floatAt(heroBox(f.pi).querySelector('.md'),(f.n>0?'+':'')+f.n+' MADNESS',f.n>0?'#e080ff':'#a0e8ff','s');if(f.n>0)sfx('mad');break;
 case'blight':floatAt(tEl(f.id),'BLIGHTED','#a0ff60','s');break;
 case'sac':floatAt(tEl(f.id),'OFFERED','#ff6060','s');burstAt(tEl(f.id),'#ff2040');break;
 case'buff':floatAt(tEl(f.id),'+1/+1','#ffd76a','s');break;
 case'ward':floatAt(tEl(f.id),'WARD BROKEN','#9ef8ff','s');burstAt(tEl(f.id),'#9ef8ff');break;
 case'cor':floatAt(tEl(f.id),'−1 ATTACK','#b0ff70','s');break;
 case'echo':if(f.pi===0)floatAt($('#hand'),'ECHO','#c8b0ff','s');try{v9Fx(f)}catch(e){}break;
 case'echoFade':break;
 case'die':deathFx(f);break;
 case'draw':if(f.pi===0)sfx('draw');break;
 case'play':{try{v9Fx(f)}catch(e){}const d=C[f.cid];sfx(d.t==='u'?'play':'spell');if(d.t==='u'){if(d.r==='L'&&!UI.cin&&!G.sim)lgCinema(f.cid,f.uid);else enterFx(f.uid)}break}
 case'spellhit':burstAt(tEl(f.id),FCOL[f.f]);break;
 case'summon':enterFx(+f.id.slice(1));try{v9Fx(f)}catch(e){}break;
 case'burn':toast((f.pi?'Enemy':'Your')+' hand is full: '+C[f.cid].n+' was burned');break;
 case'fatigue':toast((f.pi?'The enemy':'You')+' drew from an empty deck: the void gnaws ('+f.n+')');break;
 case'turn':if(f.pi===0&&!UI.auto)setTimeout(()=>{const h=$('#hand');restartCls(h,'cue');clearTimeout(h._cue);h._cue=setTimeout(()=>h.classList.remove('cue'),1400)},D(380));banner(f.pi===0&&!UI.auto?'YOUR TURN':f.pi===0?'AUTOPILOT':'ENEMY TURN',f.pi===0?'#7a5cff':'#ff3050');sfx(f.pi===0?'turn':'turnE');break}}}
function banner(t,c){const b=$('#banner');b.textContent=t;b.style.setProperty('--bc',c);restartCls(b,'show')}
function apply(fn){const r=fn();renderMatch();flushFx();overCheck();return r}
/* end-of-match: queued once per game object (G.ovq), so a new match after Menu always gets its own victory/defeat screen */
function overCheck(){const g=G;if(!g||g.ovq)return;if(!g.over)checkWin(g);if(!g.over)return;g.ovq=1;UI.overShown=1;setTimeout(async()=>{if(UI.cin)await UI.cin;if(G===g)gameOver()},D(1000))}
const D=ms=>ms*UI.speed;
async function lunge(uid,tg,fn){const el=tEl('u'+uid),te=tEl(tg);if(el&&te){const[a,b]=center(el),[c,d]=center(te),dur=D(440);el.style.zIndex=50;const lo=fxLow();el.animate(lo?[{transform:'none'},{transform:`translate(${(c-a)*.78}px,${(d-b)*.78}px) scale(1.12)`,offset:.5},{transform:'none'}]:[{transform:'none'},{transform:`translate(${(a-c)*.08}px,${(b-d)*.08}px) scale(1.06) rotate(${c>a?-4:4}deg)`,offset:.22,easing:'cubic-bezier(.6,0,1,.6)'},{transform:`translate(${(c-a)*.82}px,${(d-b)*.82}px) scale(1.16)`,offset:.55},{transform:`translate(${(c-a)*.7}px,${(d-b)*.7}px) scale(1.1)`,offset:.65},{transform:'none'}],{duration:dur*(lo?1:1.15),easing:'ease-in-out'});await sleep(dur*(lo?.5:.63));apply(fn);await sleep(dur*.5);el.style.zIndex=''}else apply(fn)}
async function preview(cid,ms){const p=$('#preview');p.innerHTML='';p.appendChild(cardEl(cid));p.style.setProperty('--pd',ms+'ms');restartCls(p,'show');await sleep(ms*.7)}
async function runAI(){if(UI.aiRun)return;UI.aiRun=true;UI.busy=true;renderMatch();const g0=G;
 while(G===g0&&!G.over&&G.p[G.cur].ai){const pi=G.cur;await sleep(D(650));
  for(let n=0;n<40&&G===g0&&!G.over;n++){const a=aiChoose(G,pi);if(!a)break;
   if(a.t==='play'){const c=G.p[pi].hand.find(x=>x.uid===a.uid);await preview(c.id,D(1100));if(a.tg){const te=tEl(a.tg,1);te&&te.classList.add('tgt');await sleep(D(250))}apply(()=>play(G,pi,a.uid,a.tg));if(UI.cin)await UI.cin}
   else await lunge(a.uid,a.tg,()=>attack(G,pi,a.uid,a.tg));await sleep(D(420))}
  if(G!==g0||G.over)break;await sleep(D(350));apply(()=>endTurn(G))}
 if(G===g0){UI.aiRun=false;UI.busy=false;renderMatch()}}
function setSel(s){UI.sel=s;renderMatch()}
async function humanPlay(uid,tg){if(UI.busy||G.cur!==0)return;UI.sel=null;const ok=apply(()=>play(G,0,uid,tg));if(!ok){sfx('err');return}if(UI.cin){UI.busy=true;renderMatch();const g=G;await UI.cin;if(G===g){UI.busy=false;renderMatch()}}}
async function humanAtk(uid,tg){if(UI.busy||G.cur!==0)return;UI.sel=null;UI.busy=true;renderMatch();await lunge(uid,tg,()=>attack(G,0,uid,tg));UI.busy=false;renderMatch()}
$('#endt').onclick=()=>{if(!G||G.cur!==0||UI.busy||G.over||G.p[0].ai)return;sfx('endt');UI.sel=null;apply(()=>endTurn(G));runAI()};
$('#quit').onclick=()=>{sfx('click');let back=G&&G.meta&&G.meta.mode==='camp'?'camp':'title';try{const b=v9Quit(G);if(b)back=b}catch(e){console.warn(e)}G=null;UI.aiRun=false;show(back)};
function gameOver(){if(!G)return;cinSkip();const g=G,w=g.winner,me=w===0,ov=$('#over');g.ovq=1;UI.overShown=1;
 $('#ovt').textContent=w===-1?'STALEMATE':me?(UI.auto?'AUTOPILOT WINS':'VICTORY'):'DEFEAT';
 $('#ovp').textContent=w===-1?'Both minds were lost to the dark.':g.reason==='mad'?(me?'The enemy\'s mind shattered under ten Madness.':'Ten Madness. Your mind is no longer your own.'):g.reason==='time'?'The stars burned out before either side fell.':(me?'Their Sanity is gone. The void claims them.':'Your Sanity is gone. The void claims you.');
 let earned=0;try{if(!UI.auto&&!g.paid){g.paid=1;earned=Math.round((me?SH.win:SH.loss)*difMul(g.dif));COLL.shards=(+COLL.shards||0)+earned;saveColl();g.earned=earned}else if(g.paid)earned=g.earned||0}catch(e){console.warn('reward',e)}
 let x8=null;try{if(!UI.auto)x8=v8MatchEnd(g)}catch(e){console.warn('v8 end',e)}
 try{ovRewards(earned)}catch(e){console.warn('rewards ui',e)}try{v8Over(g,x8)}catch(e){console.warn('v8 over',e)}
 const ok=me?'victory':'defeat',ovk=ok+(isLand()?'':'_p');ov.style.setProperty('--ovimg',SC.st[ovk]===2?'none':`url(${uiArt(ovk)})`);
 ov.dataset.winner=w;ov.classList.remove('win','lose','draw');ov.classList.add('on',w===-1?'draw':me?'win':'lose');sfx(me?'win':'lose')}
function ovRewards(earned){const box=$('#ovrw'),k=$('#ovk'),sh=COLL.shards,pk=COLL.packs,need=Math.max(0,SH.pack-sh);
 box.innerHTML=UI.auto?'<small>Autopilot matches earn no Shards.</small>':`<div class="earn">${earned?'+'+earned+' Shards':'No Shards'}</div><div class="bal"><span class="shard"></span><b>${sh}</b> Shards${pk?` · <b>${pk}</b> sealed pack${pk>1?'s':''}`:''}</div><div class="pbarw"><i style="width:${Math.min(100,sh/SH.pack*100).toFixed(0)}%"></i></div><small>${pk?'A sealed pack awaits you.':need?need+' more Shards for a booster pack':'You can afford a booster pack.'}</small>`;
 const can=!UI.auto&&(pk>0||sh>=SH.pack);k.hidden=!can;k.querySelector('span').textContent=pk>0?'Open a Pack':'Buy & Open Pack · '+SH.pack+'◆'}
$('#ovm').onclick=()=>{sfx('click');ovHide();const md=G&&G.meta&&G.meta.mode,back=md==='camp'?'camp':md==='gaunt'?'gaunt':md==='week'?'weekly':'title';G=null;show(back)};
function ovHide(){const o=$('#over');o.classList.remove('on','win','lose','draw')}
$('#ovk').onclick=()=>{sfx('click');const buy=COLL.packs<=0;if(buy){if(COLL.shards<SH.pack){sfx('err');return}COLL.shards-=SH.pack;COLL.packs++;saveColl()}ovHide();G=null;show('packs');PO.ret=1;startOpen()};
$('#ovr').onclick=()=>{sfx('click');ovHide();startMatch(LAST.mine,LAST.of,LAST.o||{})};
/* ================= INPUT ================= */
let P=null,lpJust=0;
function myTurn(){return G&&cur==='match'&&G.cur===0&&!G.over&&!UI.busy&&!UI.cin&&!G.p[0].ai}
document.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('pointerdown',e=>{batPoke();auInit();BG.act=performance.now();if($('#zoom').classList.contains('modal')){if(e.target.closest('#zoom .card')){tilt(e);P=null;return}hideZoom();lpJust=1;P=null;return}
 const el=e.target.closest('[data-cid]');P={x:e.clientX,y:e.clientY,el,id:e.pointerId,drag:0,lp:0,lx:e.clientX};if(el&&el.closest('#hand,#bgrid,#cgrid,.pfront'))tiltHeld(el.closest('.card')||el,e);
 if(el&&!el.closest('#preview'))P.lpT=setTimeout(()=>{if(!P)return;P.lp=1;showZoom(el,true)},480)});
document.addEventListener('pointermove',e=>{if(!P||e.pointerId!==P.id)return;const dx=e.clientX-P.x,dy=e.clientY-P.y;
 if(!P.drag&&!P.lp&&dx*dx+dy*dy>110){clearTimeout(P.lpT);if(cur==='match')startDrag(e)}if(P.drag)moveDrag(e);else if(TL.el)tiltHeld(TL.el,e)});
document.addEventListener('pointerup',e=>{tiltOff();if(!P||e.pointerId!==P.id)return;clearTimeout(P.lpT);const p=P;P=null;if(p.lp){lpJust=1;return}if(p.drag){endDrag(p,e);return}if(cur==='match')tap(e.target)});
document.addEventListener('pointercancel',()=>{tiltOff();if(P){clearTimeout(P.lpT);if(P.drag)cancelDrag(P);P=null}});
function startDrag(e){tiltOff();const el=P.el;if(!myTurn()||!el)return;
 if(el.dataset.h){const c=G.p[0].hand.find(x=>x.uid===+el.dataset.h);if(!c||!canPlay(G,0,c))return;P.drag='h';P.uid=c.uid;UI.sel={k:'h',uid:c.uid};renderMatch();
  const g=el.cloneNode(true);g.id='ghost';g.classList.remove('sel','can','drawn');g.style.cssText='';document.body.appendChild(g);el.classList.add('out');P.g=g;if(!C[c.id].tg)$('#myb').classList.add('drop')}
 else if(el.dataset.u){const u=findU(G,+el.dataset.u);if(!u||u.o!==0||!canAtk(u))return;P.drag='u';P.uid=u.uid;UI.sel={k:'u',uid:u.uid};renderMatch();const[a,b]=center(el);P.ax=a;P.ay=b;arrowTo(a,b,a,b);$('#arrow').style.display='block'}
 moveDrag(e)}
function moveDrag(e){if(P.drag==='h'){P.g.style.left=e.clientX+'px';P.g.style.top=e.clientY+'px';if(!fxLow()){const v=Math.max(-1,Math.min(1,(e.clientX-P.lx)/14));P.vx=(P.vx||0)*.7+v*.3;P.lx=e.clientX;P.g.style.transform=`translate(-50%,-60%) scale(.95) perspective(700px) rotateY(${(P.vx*22).toFixed(1)}deg) rotate(${(-4+P.vx*8).toFixed(1)}deg)`;P.g.style.setProperty('--ox',P.vx.toFixed(2))}}else if(P.drag==='u')arrowTo(P.ax,P.ay,e.clientX,e.clientY,e)}
function arrowTo(ax,ay,x,y,e){const dx=x-ax,dy=y-ay,L=Math.hypot(dx,dy)||1,bend=Math.min(90,L*.28),cx=(ax+x)/2+dy/L*bend*(dx>0?-1:1)*.35,cy=(ay+y)/2-bend;
 const d=`M${ax.toFixed(1)} ${ay.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;$('#arl').setAttribute('d',d);$('#arg').setAttribute('d',d);
 const h=e&&document.elementFromPoint(e.clientX,e.clientY),t=h&&h.closest('.tgt');$('#arrow').classList.toggle('hot',!!t)}
function cancelDrag(p){if(p.g)p.g.remove();$('#arrow').style.display='none';$('#myb').classList.remove('drop');$$('#hand .out').forEach(x=>x.classList.remove('out'));UI.sel=null;if(G)renderMatch()}
function dropTarget(x,y){const el=document.elementFromPoint(x,y);if(!el)return null;const u=el.closest('.unit[data-u]:not(.dying)'),h=el.closest('[data-hero]');return u?'u'+u.dataset.u:h?'h'+h.dataset.hero:null}
function endDrag(p,e){const x=e.clientX,y=e.clientY;cancelDrag(p);const tg=dropTarget(x,y);
 if(p.drag==='h'){const c=G.p[0].hand.find(q=>q.uid===p.uid);if(!c)return;const d=C[c.id];
  if(d.tg){if(tg&&spellTargets(G,0,d.tg).includes(tg))humanPlay(c.uid,tg);else{sfx('err');UI.sel={k:'h',uid:c.uid};renderMatch()}}
  else if(y<$('#hand').getBoundingClientRect().top-4||($('body').classList.contains('land')&&x>$('#hand').getBoundingClientRect().left&&y<$('#hand').getBoundingClientRect().top+10))humanPlay(c.uid)}
 else if(p.drag==='u'){if(tg&&atkTargets(G,0,findU(G,p.uid)).includes(tg))humanAtk(p.uid,tg);else if(tg)sfx('err')}}
function tap(t){if(!G)return;if(!myTurn()){if(G.p[G.cur].ai&&!G.over&&t.closest('#match'))toast('Wait: the enemy is acting');return}
 const h=t.closest('#hand [data-h]'),u=t.closest('.unit[data-u]:not(.dying)'),hero=t.closest('[data-hero]');const ts=u?'u'+u.dataset.u:hero?'h'+hero.dataset.hero:null;const s=UI.sel;
 if(s&&s.k==='h'){const c=G.p[0].hand.find(x=>x.uid===s.uid),d=c&&C[c.id];if(d){
   if(h&&+h.dataset.h===s.uid){if(!d.tg)humanPlay(c.uid);else{sfx('err');toast('Choose a target')}return}
   if(d.tg&&ts&&spellTargets(G,0,d.tg).includes(ts)){humanPlay(c.uid,ts);return}
   if(!d.tg&&!h&&t.closest('#match')&&!t.closest('#mid')){humanPlay(c.uid);return}}}
 if(s&&s.k==='u'&&ts&&selTargets().includes(ts)){humanAtk(s.uid,ts);return}
 if(h){const c=G.p[0].hand.find(x=>x.uid===+h.dataset.h);if(c&&canPlay(G,0,c)){sfx('click');setSel({k:'h',uid:c.uid})}else{sfx('err');toast(C[c.id].c>G.p[0].flux?'Not enough Flux':'Cannot play that now');setSel(null)}return}
 if(u){const v=findU(G,+u.dataset.u);if(v&&v.o===0){if(canAtk(v)){sfx('click');setSel(s&&s.k==='u'&&s.uid===v.uid?null:{k:'u',uid:v.uid})}else{toast(v.atk?'Already attacked this turn':v.a<=0?'It has no attack':'It needs a turn to wake (no Swift)');setSel(null)}return}
  if(s&&s.k==='u'){sfx('err');const g=E(G,0).board.filter(q=>q.k.includes('guard'));toast(v.k.includes('phase')&&!findU(G,s.uid).k.includes('phase')?'Only Phase units can attack Phase units':g.length?'You must attack a Guard first':'Invalid target');return}}
 if(hero&&s&&s.k==='u'){sfx('err');toast('You must attack a Guard first');return}
 if(s)setSel(null)}
/* ---- zoom ---- */
function showZoom(el,modal){const id=el.dataset.cid;if(!id||!C[id])return;const z=$('#zoom'),d=C[id];z.innerHTML='';const zc=cardEl(id,1);zc.insertAdjacentHTML('beforeend','<i class="gw"><i class="glare"></i></i>');z.appendChild(zc);
 const u=el.dataset.u&&G?findU(G,+el.dataset.u):null;let h='';if(u&&(u.a!==d.a||u.h!==d.h))h+=`<p><b>Currently ${u.a}/${u.h}</b></p>`;for(const k of new Set(u?u.k:d.k))if(KW[k])h+=`<p><b>${KW[k][0]}${k==='dread'?' '+d.dread:''}:</b> ${KW[k][1]}</p>`;
 if(d.fl)h+=`<p class="fl">“${d.fl}”</p>`;h+=`<p><i>${FAC[d.f].n} · ${{C:'Common',U:'Uncommon',R:'Rare',L:'Legendary',T:'Token'}[d.r]}</i></p>`;const k=document.createElement('div');k.className='kd';k.innerHTML=h;z.appendChild(k);
 z.className='on'+(modal?' modal':'');if(modal)ztOpen(zc);if(!modal){const r=el.getBoundingClientRect(),zw=document.body.classList.contains('dz')?Math.min(z.offsetWidth,innerWidth*.62):Math.min(250,innerWidth*.62),cf=$('#coll.on #craft'),lim=cf?cf.getBoundingClientRect().top:innerHeight,left=r.left+r.width/2>innerWidth/2?Math.max(8,r.left-zw-16):Math.min(innerWidth-zw-8,r.right+16);z.style.left=left+'px';z.style.top=Math.max(8,Math.min(lim-z.offsetHeight-8,r.top+r.height/2-z.offsetHeight/2))+'px'}else{z.style.left=z.style.top=''}}
function tilt(e){const c=$('#zoom.on .card');if(!c||LG.rm.matches)return;const r=c.getBoundingClientRect(),nx=Math.max(-1,Math.min(1,(e.clientX-r.left-r.width/2)/(r.width/2))),ny=Math.max(-1,Math.min(1,(e.clientY-r.top-r.height/2)/(r.height/2)));
 if(ZT.c!==c)ztOpen(c);ztFinger(nx,ny)}
document.addEventListener('pointermove',e=>{if($('#zoom').classList.contains('on'))tilt(e)},{passive:true});
function hideZoom(){const z=$('#zoom');ztClose();z.className='';z.innerHTML=''}
document.addEventListener('pointerover',e=>{if(e.pointerType!=='mouse')return;const el=e.target.closest('[data-cid]');clearTimeout(UI.hz);if(el&&!el.closest('#zoom')&&!el.closest('#preview')&&!P?.drag&&!(el.closest('#cgrid,#bgrid')&&innerWidth<900))UI.hz=setTimeout(()=>showZoom(el,false),380);else if(!$('#zoom').classList.contains('modal'))hideZoom()});
/* ================= BUILDER ================= */
/* the builder edits one deck slot; every change autosaves into that slot (no lost work on Back). The card grid is built once per
   filter/ownership change and then only updated in place: rebuilding ~80 cards on every tap restarted animations and flashed. */
const BD={cards:[],f:'all',slot:null,key:''};
const lim=id=>Math.min(maxC(id),owned(id)),cntOf=id=>BD.cards.filter(x=>x===id).length;
function bdOpen(id){const d=dkGet(id);if(!d)return;BD.slot=id;BD.cards=d.cards.filter(c=>C[c]&&owned(c)).slice(0,30);show('builder')}
function bdSave(){const d=dkGet(BD.slot);if(!d)return;d.cards=BD.cards.slice();saveDecks()}
function renderBuilder(full){const d=dkGet(BD.slot);if(!d){if(DK.decks.length)BD.slot=DK.decks[0].id;else{const n={id:dkId(),name:dkFreeName(),fac:'v',cards:[]};DK.decks.push(n);saveDecks();BD.slot=n.id}return bdOpen(BD.slot)}
 if(full){const fb=$('#bfil');fb.innerHTML='';for(const[k,n]of[['all','All'],['v','Abyss'],['m','Derelict'],['c','Communion'],['n','Wanderers']]){const b=document.createElement('button');b.textContent=n;b.className=BD.f===k?'on':'';b.onclick=()=>{sfx('click');BD.f=k;renderBuilder(1)};fb.appendChild(b)}
  const hp=$('#bhero'),df=dkFac(d);hp.innerHTML='<span>Hero</span>'+['v','m','c'].map(f=>`<button class="f-${f}${df===f?' on':''}" data-hero-f="${f}" aria-label="${FAC[f].n} hero">${sigHTML(f)}<em>${FAC[f].n}</em></button>`).join('')}
 {const bn=$('#bname'),t=`<span data-fit="dk">${esc(d.name)}</span><i aria-hidden="true">✎</i>`;if(bn.innerHTML!==t){bn.innerHTML=t;fitScan(bn)}}
 const gr=$('#bgrid'),key=BD.f+'|'+COL.map(lim).join('');
 if(full||BD.key!==key||!gr.firstElementChild){BD.key=key;const st=gr.scrollTop;gr.innerHTML='';const fo={v:0,m:1,c:2,n:3};
  for(const id of COL.slice().sort((a,b)=>fo[C[a].f]-fo[C[b].f]||C[a].c-C[b].c)){if(BD.f!=='all'&&C[id].f!==BD.f)continue;const e=cardEl(id),L=lim(id);e.dataset.add=id;if(!L){e.classList.add('locked');e.insertAdjacentHTML('beforeend','<div class="lock">PACK<br>CARD</div>')}else e.insertAdjacentHTML('beforeend','<div class="cnt"></div>');gr.appendChild(e)}gr.scrollTop=st}
 for(const e of gr.children){const id=e.dataset.add,L=lim(id);if(!L)continue;const n=cntOf(id),c=e.querySelector('.cnt'),t=`${n}/${L}`;if(c.textContent!==t)c.textContent=t;c.classList.toggle('full',n>=L);e.classList.toggle('dim',n>=L)}
 renderDeckList();{const df=dkFac(d);$$('#bhero button').forEach(x=>x.classList.toggle('on',x.dataset.heroF===df))}}
function renderDeckList(){const n=BD.cards.length,bc=$('#bcount');bc.textContent=n+'/30';bc.classList.toggle('ok',n===30);
 const cv=[0,0,0,0,0,0,0,0];for(const id of BD.cards)cv[Math.min(7,C[id].c)]++;const mx=Math.max(1,...cv);$('#curve').innerHTML=cv.map((v,i)=>`<i title="${i}${i===7?'+':''}" style="height:${2+v/mx*24}px"></i>`).join('');
 const L=$('#blist'),u=[...new Set(BD.cards)].sort((a,b)=>C[a].c-C[b].c||C[a].n.localeCompare(C[b].n));L.innerHTML=u.length?'':'<p class="empty">Tap cards to add them (max 2 copies, Legendaries 1). Tap here to remove.</p>';
 for(const id of u){const d=document.createElement('div');d.className='f-'+C[id].f;d.dataset.rm=id;d.innerHTML=`<b>${C[id].c}</b><span>${C[id].n}</span>×${cntOf(id)}`;L.appendChild(d)}bdSave()}
$('#bgrid').addEventListener('click',e=>{if(lpJust){lpJust=0;return}const el=e.target.closest('[data-add]');if(!el)return;const id=el.dataset.add;if(BD.cards.length>=30){sfx('err');toast('Deck is full (30 cards)');return}if(!lim(id)){sfx('err');toast('Not owned yet: pull it from a pack');return}if(cntOf(id)>=lim(id)){sfx('err');toast(lim(id)<maxC(id)?'You only own '+lim(id):C[id].r==='L'?'Only 1 copy of a Legendary':'Max 2 copies');return}BD.cards.push(id);sfx('draw');renderBuilder()});
$('#blist').addEventListener('click',e=>{const el=e.target.closest('[data-rm]');if(!el)return;BD.cards.splice(BD.cards.lastIndexOf(el.dataset.rm),1);sfx('click');renderBuilder()});
$('#bhero').addEventListener('click',e=>{const b=e.target.closest('[data-hero-f]');const d=dkGet(BD.slot);if(!b||!d)return;d.fac=b.dataset.heroF;d.hf=1;saveDecks();sfx('click');$$('#bhero button').forEach(x=>x.classList.toggle('on',x===b))});
$('#bname').onclick=async()=>{const d=dkGet(BD.slot);if(!d)return;const v=await dlg({t:'Rename deck',val:d.name,ok:'Save'});if(v){d.name=v;saveDecks();renderBuilder()}};
$('#bClear').onclick=async()=>{if(BD.cards.length&&!await dlg({t:'Clear this deck?',x:'All '+BD.cards.length+' cards will be removed.',ok:'Clear',danger:1}))return;BD.cards=[];renderBuilder()};
$$('[data-tpl]').forEach(b=>b.onclick=()=>{BD.cards=prebuilt(b.dataset.tpl).cards.filter(id=>owned(id)).slice(0,30);const d=dkGet(BD.slot);if(d&&!d.cards.length)d.fac=b.dataset.tpl;sfx('click');renderBuilder(1)});
$('#bSave').onclick=()=>{bdSave();const d=dkGet(BD.slot),ck=d&&dkCheck(d);if(ck&&ck.ok)UI.deck=d.id;sfx(ck&&ck.ok?'heal':'click');toast(ck&&ck.ok?`“${d.name}” saved and ready`:`Saved. ${ck?ck.why:''}: it needs 30 cards to play`);show('mydecks')};
$('#bBack').onclick=()=>{bdSave();sfx('click');show('mydecks')};
document.addEventListener('click',e=>{if(lpJust&&!e.target.closest('#bgrid'))lpJust=0},true);
/* ================= COLLECTION & PACKS ================= */
function rollPack(r=Math.random){const by=k=>PACK.filter(id=>C[id].r===k),pk=a=>a[Math.floor(r()*a.length)];
 const out=[pk(by('C')),pk(by('C')),pk(by('C')),pk(by('U')),pk(r()<.1?by('L'):by('R'))];return out}
function grant(ids,vr){const res=[];for(const id of ids){const v=vr===false?null:varRoll(id);const n=COLL.own[id]||0;if(n>=maxC(id)){const s=v?0:SH.dup[C[id].r];COLL.shards+=s;res.push({id,dup:s,vr:v})}else{COLL.own[id]=n+1;res.push({id,dup:0,nw:n===0,vr:v})}if(v)varAdd(id,v)}COLL.opened++;saveColl();return res}
function openPack(){if(COLL.packs<=0)return null;COLL.packs--;const ids=PO.force||rollPack();PO.force=null;return grant(ids)}
function renderPacks(){$('#pshards').textContent=COLL.shards;$('#pcount').textContent=COLL.packs;$('#pOpen').disabled=COLL.packs<=0;$('#pBuy').disabled=COLL.shards<SH.pack;
 const own=PACK.filter(id=>owned(id)).length;$('#pown').textContent=`${own}/${PACK.length} pack cards discovered`;$('#psealed').classList.toggle('none',COLL.packs<=0)}
$('#pBuy').onclick=()=>{if(COLL.shards<SH.pack){sfx('err');return}COLL.shards-=SH.pack;COLL.packs++;saveColl();sfx('heal');renderPacks()};
const PO={res:null,stage:0};
$('#pOpen').onclick=()=>startOpen();$('#psealed').onclick=()=>startOpen();
function startOpen(){const res=openPack();if(!res){sfx('err');toast('No packs: earn Shards in matches');return}PO.res=res;PO.stage=1;const st=$('#pstage');st.className='on sealed';
 const row=$('#prow');row.innerHTML='';res.forEach((o,i)=>{const s=document.createElement('div');s.className='pslot r-'+C[o.id].r;s.style.setProperty('--i',i);s.dataset.i=i;
  s.innerHTML=`<div class="pin"><div class="pback"></div><div class="pfront"></div></div>`;s.querySelector('.pfront').appendChild(varEl(cardEl(o.id),o.vr));if(o.vr)s.insertAdjacentHTML('beforeend',`<span class="tag vr">${VARN[o.vr]}</span>`);else if(o.dup)s.insertAdjacentHTML('beforeend',`<span class="tag dup">DUPLICATE +${o.dup}◆</span>`);else if(o.nw)s.insertAdjacentHTML('beforeend','<span class="tag nw">NEW</span>');row.appendChild(s)});
 $('#pdone').classList.remove('on');sfx('click');renderPacks()}
$('#pwrap').onclick=e=>{e.stopPropagation();if(PO.stage!==1)return;PO.stage=2;const st=$('#pstage');st.classList.add('tear');sfx('tear');packTearFx();setTimeout(()=>{st.classList.remove('sealed','tear');st.classList.add('dealt')},900)};
function flip(s){if(!s||s.classList.contains('up'))return;s.classList.add('up');s._ut=performance.now();setTimeout(vidSync,2100);const r=C[PO.res[+s.dataset.i].id].r;setTimeout(()=>flipFx(s,r),260);
 if(r==='L'){sfx('legend');const st=$('#pstage');st.classList.add('legend');s.classList.add('lgx');setTimeout(()=>st.classList.remove('legend'),2600)}else if(r==='R')sfx('rare');else sfx('flip');
 if($$('#prow .pslot:not(.up)').length===0)setTimeout(()=>$('#pdone').classList.add('on'),400)}
$('#prow').addEventListener('click',e=>{const s=e.target.closest('.pslot');if(PO.stage===2&&s&&!s.classList.contains('up')){e.stopPropagation();flip(s)}});
$('#pall').onclick=()=>{if(PO.stage!==2)return;$$('#prow .pslot:not(.up)').forEach((s,i)=>setTimeout(()=>flip(s),i*220))};
$('#pdone').onclick=()=>{$('#pstage').className='';PO.stage=0;renderPacks();if(PO.ret){PO.ret=0;show('title')}};
const CV={f:'all',pk:0};
function renderColl(){const fb=$('#cfil');fb.innerHTML='';for(const[k,n]of[['all','All'],['v','Abyss'],['m','Derelict'],['c','Communion'],['n','Wanderers'],['pk','Pack only']]){const b=document.createElement('button');b.textContent=n;b.className=(k==='pk'?CV.pk:CV.f===k)?'on':'';b.onclick=()=>{sfx('click');if(k==='pk')CV.pk^=1;else CV.f=k;renderColl()};fb.appendChild(b)}
 const gr=$('#cgrid'),fo={v:0,m:1,c:2,n:3};gr.innerHTML='';let tot=0,have=0;
 for(const id of COL.slice().sort((a,b)=>fo[C[a].f]-fo[C[b].f]||(C[a].pk||0)-(C[b].pk||0)||C[a].c-C[b].c)){tot++;const n=owned(id);if(n)have++;if(CV.f!=='all'&&C[id].f!==CV.f)continue;if(CV.pk&&!C[id].pk)continue;
  const e=cardEl(id);if(!n){e.classList.add('locked');e.insertAdjacentHTML('beforeend',C[id].cmp?'<div class="lock cmpl">⚑<small>Campaign</small></div>':'<div class="lock">?</div>')}else e.insertAdjacentHTML('beforeend',`<div class="cnt">×${n}</div>`);gr.appendChild(e)}
 $('#cstat').innerHTML=`<b>${have}</b>/${tot} cards · <b>${COLL.shards}</b> Shards`;craftSync()}
/* ================= HOW TO ================= */
$('#howtx').innerHTML=`<p>You are a mind adrift in the dark between stars. Break your opponent before the void breaks you.</p>
<p><b>Winning.</b> Each side starts with <b>20 Sanity</b>. Reduce the enemy's Sanity to 0, <i>or</i> drive them to <b>10 Madness</b>: their mind shatters and they lose.</p>
<p><b>Flux.</b> Cards cost Flux (the blue diamond). You gain +1 maximum Flux each turn (up to 10) and refill it at the start of your turn.</p>
<p><b>Turns.</b> Decks are 30 cards; you start with 5 and draw 1 each turn (the first player skips their first draw). Whoever goes second starts with a 6th card and gets +1 Flux on their first turn. Play units and Rites, attack, then press <b>End Turn</b>. Drawing from an empty deck costs Sanity and adds Madness.</p>
<p><b>Units</b> have Attack (amber) and Health (red). A new unit must wait a turn before attacking, unless it has Swift. Each unit attacks once per turn. When units fight, both deal damage at the same time. Damage stays until the unit dies.</p>
<p><b>Rites</b> are one-shot spells. Some need a target.</p>
<p><b>Controls.</b> <b>Drag</b> a card up onto the board to play it, or onto a target. You can also <b>tap</b> a card to select it, then tap again (or tap a target). To attack, <b>tap</b> or <b>drag</b> one of your glowing units onto an enemy unit or the enemy portrait. <b>Long-press</b> any card, or hover with a mouse, to read it up close.</p>
<p><b>Keywords</b></p><div class="kwl">${Object.keys(KW).map(k=>`<span class="ki">${svgI(k)}</span><span><b>${KW[k][0]}</b>: ${KW[k][1]}</span>`).join('')}</div>
<p><b>Factions</b></p><ul><li><b>The Abyss</b> (violet): ${FAC.v.d}</li><li><b>The Derelict</b> (cyan): ${FAC.m.d}</li><li><b>The Red Communion</b> (crimson): ${FAC.c.d}</li><li><b>Wanderers</b> (grey) are neutral crew that fit any deck.</li></ul>
<p><b>Reading a card:</b></p><div class="demo">${costHTML(3)}<span>Flux cost</span>${atkHTML('v',4)}${atkHTML('m',2)}${atkHTML('c',3)}${atkHTML('n',1)}<span>Attack (icon per faction)</span>${hpHTML(2,40)}<span>Health: the blood drains as it is wounded</span></div><p><b>Rarity gems:</b> grey Common, blue Uncommon, gold Rare, prismatic Legendary. Custom decks hold up to 2 copies of a card (1 of a Legendary).</p>`;
/* Hollow Stars. RENDERING RULES: read /RENDERING_RULES.md before changing card visuals, animations, video or art.
   (transform/opacity only, no blend modes or animated filters, no class toggling mid-animation or DOM rebuilds, video rules,
   layer budget, image sizes, text auto-fit; new cards must pass tests/cardcheck.py, tests/paintprobe.py and tests/flicker.py) */

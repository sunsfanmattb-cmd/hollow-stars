'use strict';
/* ================= v2.6 STORE, PACK ODDS, SAVE BACKUPS =================
   Products come from ECON.store. Every purchase goes through buy(sku) -> PAY.prov.purchase(product) -> fulfil().
   PAY.prov is the payment provider: today the test provider (a confirm dialog, nothing is charged). The Google Play Billing
   and Windows providers will implement the same two calls, purchase(p) -> {ok,tx} and restore() -> [{sku,tx}], and set
   PAY.prices[sku] to the store's local price text; the store screen doesn't change. fulfil() records each transaction id,
   so a retried or restored purchase is never granted twice. Paid packs are logged with source 'paid' (COLL.src / COLL.log). */
const PROD=Object.fromEntries(ECON.store.map(p=>[p.sku,p]));
const PAY={mode:'test',prices:{},busy:0,prov:null};
PAY.test={name:'test',
 async purchase(p){const ok=await dlg({t:'Test purchase',x:`${p.n} · ${price(p)}. Test mode: no money is charged.`,ok:'Buy'});return ok?{ok:1,tx:'test-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8)}:{ok:0,cancel:1}},
 async restore(){return[]}};
PAY.prov=PAY.test;
const DEV=(()=>{try{const m=/[?&]dev=([01])/.exec(location.search);if(m)localStorage.setItem('hsDev',m[1]);return localStorage.getItem('hsDev')==='1'}catch(e){return false}})();
const storeOpen=()=>PAY.prov!==PAY.test||ECON.storeTest||DEV;
const usdFmt=(()=>{try{return new Intl.NumberFormat(undefined,{style:'currency',currency:'USD'})}catch(e){return{format:v=>'$'+v.toFixed(2)}}})();
const price=p=>PAY.prices[p.sku]||usdFmt.format(p.usd/100);
const prodOwned=p=>!!(p.once&&COLL.ent[p.sku]);
async function buy(sku){const p=PROD[sku];if(!p)return{ok:0,why:'Unknown product'};if(!storeOpen())return{ok:0,why:'The store is not open yet'};if(prodOwned(p))return{ok:0,why:'You already own this'};if(PAY.busy)return{ok:0,why:'A purchase is already open'};PAY.busy=1;
 try{const r=await PAY.prov.purchase(p);return r&&r.ok?fulfil(p,r.tx,PAY.prov.name):(r||{ok:0})}catch(e){console.warn('purchase',e);return{ok:0,why:'The purchase could not be completed'}}finally{PAY.busy=0}}
function fulfil(p,tx,mode){collMig();if(!tx||COLL.buys.some(b=>b.tx===tx))return{ok:1,dup:1,p};const g=p.give||{};
 COLL.buys.push({tx,sku:p.sku,t:Date.now(),mode:mode||PAY.mode,usd:p.usd});if(p.once)COLL.ent[p.sku]=1;
 if(g.back)COLL.ent['back:'+g.back]=1;if(g.theme)COLL.ent['theme:'+g.theme]=1;if(g.pickL)COLL.ent.pickL=(COLL.ent.pickL|0)+g.pickL;
 saveColl();if(g.pk)packAdd(g.pk,'paid',p.sku);return{ok:1,p}}
async function restorePurchases(){let n=0;try{for(const r of await PAY.prov.restore()){const p=PROD[r.sku];if(p&&p.once&&!fulfil(p,r.tx,PAY.prov.name).dup)n++}}catch(e){console.warn('restore',e)}return n}

/* ---- the Welcome Bundle's Legendary: a choice of any pack Legendary you don't own yet (owning them all pays its craft value) ---- */
const legChoices=()=>PACK.filter(id=>C[id].r==='L'&&!owned(id)).sort((a,b)=>C[a].f.localeCompare(C[b].f)||C[a].c-C[b].c);
function pickLegend(id){if(!(COLL.ent.pickL>0))return{ok:0};if(id){if(!C[id]||C[id].r!=='L'||!C[id].pk||owned(id))return{ok:0};COLL.own[id]=1}else{if(legChoices().length)return{ok:0};COLL.shards+=ECON.craft.L}
 COLL.ent.pickL--;if(!COLL.ent.pickL)delete COLL.ent.pickL;pkLog('*',1,'paid','legend:'+(id||'shards'));saveColl();return{ok:1,id}}

/* ---- modal (pack odds, Legendary picker) ---- */
function modal(t,html,cls){const m=$('#odds');m.querySelector('h2').textContent=t;$('#oddx').innerHTML=html;m.className='on'+(cls?' '+cls:'');fitScan&&fitScan($('#oddx'))}
const modalClose=()=>{$('#odds').className=''};
$('#oddsClose').onclick=()=>{sfx('click');modalClose()};$('#odds').addEventListener('click',e=>{if(e.target.id==='odds')modalClose()});

const oPct=x=>{const v=x*100;const t=v>=10?v.toFixed(0):v.toFixed(2);return(t.includes('.')?t.replace(/\.?0+$/,''):t)+'%'};
function oddsHTML(){const E=ECON.pack,P=COLL.pity,n=k=>PACK.filter(id=>C[id].r===k).length,RN={C:'Common',U:'Uncommon',R:'Rare',E:'Epic',L:'Legendary'};
 const slots=[];E.slots.forEach((k,i)=>{const l=slots[slots.length-1];if(l&&l.k===k)l.to=i+1;else slots.push({k,from:i+1,to:i+1})});
 const holoPack=1-Math.pow(1-E.holo,E.slots.length),frame=(1-E.holo)*E.frame/4;
 return`<table class="otab"><tr><th>Slot</th><th>Card</th></tr>${slots.map(s=>`<tr><td>${s.from===s.to?'Card '+s.from:`Cards ${s.from}–${s.to}`}</td><td>${s.k==='R'?`Rare ${oPct(1-E.legChance-(E.epicChance||0))} · <b class="r-E">Epic ${oPct(E.epicChance||0)}</b> · <b class="r-L">Legendary ${oPct(E.legChance)}</b>`:RN[s.k]+' 100%'}</td></tr>`).join('')}</table>
 <p class="onote">Within a rarity every card is equally likely (${n('C')} Commons, ${n('U')} Uncommons, ${n('R')} Rares, ${n('E')} Epics, ${n('L')} Legendaries). Earned and purchased packs use the same odds.</p>
 <h3>GUARANTEES</h3><div class="ogu"><div><b>Legendary</b><span>At least one every ${E.legPity} packs</span><small>${P.L} opened since your last</small></div><div><b>Holographic</b><span>At least one every ${E.holoPity} packs</span><small>${P.H} opened since your last</small></div></div>
 <h3>SPECIAL PRINTS</h3><table class="otab"><tr><th>Each card</th><th>Chance</th></tr><tr><td>Holographic</td><td>${oPct(E.holo)}</td></tr><tr><td>Gilded, Crimson Frame, Void Frame, Prismatic</td><td>${oPct(frame)} each</td></tr><tr><td>A pack with a holographic card</td><td>${oPct(holoPack)}</td></tr></table>
 <h3>DUPLICATES</h3><p class="onote">Copies beyond the most you can use (2, or 1 for a Legendary) become Shards: ${['C','U','R','E','L'].map(k=>`${RN[k]} ${ECON.dup[k]}◆`).join(' · ')}. A duplicate in a special print is kept as that print.</p>`}
const showOdds=()=>{sfx('click');modal('PACK ODDS',oddsHTML(),'odds')};
$('#pOdds').onclick=showOdds;$('#stOdds').onclick=showOdds;

function showLegPick(){const ids=legChoices();sfx('click');
 modal('CHOOSE YOUR LEGENDARY',ids.length?`<p class="onote">Your Welcome Bundle includes one Legendary. Tap a card to choose it, tap it again to look closer.</p><div class="lgpick">${ids.map(id=>`<div class="lgp" data-lp="${id}"></div>`).join('')}</div><div class="rowb"><button class="btn" id="lpClaim" disabled>Choose a card</button></div>`:
  `<p class="onote">You already own every Legendary, so the bundle pays its crafting value instead.</p><div class="rowb"><button class="btn" id="lpClaim" data-id="">Take ${ECON.craft.L}◆</button></div>`,'legpick');
 $$('#oddx .lgp').forEach(e=>e.appendChild(cardEl(e.dataset.lp)))}
$('#oddx').addEventListener('click',async e=>{const t=e.target.closest('.lgp'),cl=e.target.closest('#lpClaim');
 if(t){if(t.classList.contains('on')){showZoom(t.querySelector('.card'),true);return}$$('#oddx .lgp.on').forEach(x=>x.classList.remove('on'));t.classList.add('on');sfx('flip');
  const b=$('#lpClaim');b.disabled=false;b.dataset.id=t.dataset.lp;b.textContent='Claim '+C[t.dataset.lp].n;return}
 if(!cl||cl.disabled)return;const id=cl.dataset.id;if(id&&!await dlg({t:'Claim '+C[id].n+'?',x:'It joins your collection now. This choice is final.',ok:'Claim'}))return;
 const r=pickLegend(id);if(!r.ok){sfx('err');return}sfx(id?'legend':'heal');toast(id?C[id].n+' joins your collection':ECON.craft.L+' Shards added');modalClose();renderStore();badges()});

/* ---- store screen ---- */
const packIco=n=>`<i class="spk${n>=15?' x3':n>=7?' x2':''}"><i></i></i>`;
function renderStore(){collMig();const S=ECON.store,P=s=>S.filter(p=>p.kind===s),wel=S.find(p=>p.kind==='bundle'),per=p=>usdFmt.format(p.usd/100/p.give.pk);
 let h=PAY.mode==='test'?'<div class="stest"><b>TEST MODE</b> Purchases are free and only here to try the store. Real payments arrive with the store release.</div>':'';
 if(COLL.ent.pickL>0)h+=`<div class="stpick"><span><b>Your Welcome Legendary is waiting</b><small>Choose any Legendary you don't own yet.</small></span><button class="btn" id="stPick">Choose</button></div>`;
 if(wel&&!prodOwned(wel))h+=`<div class="stwel"><div class="swart">${packIco(15)}<i class="swl"></i></div><div class="swtx"><small>ONE TIME OFFER</small><b>${wel.n}</b><p>${wel.d}</p></div><button class="btn" data-buy="${wel.sku}">${price(wel)}</button></div>`;
 h+=`<h3>BOOSTER PACKS</h3><div class="stg">${P('packs').map(p=>`<div class="sti">${p.tag?`<em>${p.tag}</em>`:''}${packIco(p.give.pk)}<b>${p.n}</b><small>${per(p)} per pack</small><button class="btn sm" data-buy="${p.sku}">${price(p)}</button></div>`).join('')}</div>`;
 h+=`<h3>COSMETICS</h3><div class="stg cos">${P('cos').map(p=>{const k=p.give.back?'back':'theme',id=p.give[k],D=(k==='back'?CB:TH)[id],own=cosHas(k,id),on=V9.cos[k]===id;
  return`<div class="sti c-${k}"><i class="ssw" style="background:${D?D.css:'none'}${k==='theme'?',var(--pimgb,linear-gradient(#1a1018,#050304))':''}"></i><b>${p.n}</b><small>${p.d}</small>${own?`<button class="btn sm ghost" data-equip="${k}:${id}" ${on?'disabled':''}>${on?'Equipped':'Equip'}</button>`:`<button class="btn sm" data-buy="${p.sku}">${price(p)}</button>`}</div>`}).join('')}</div>`;
 h+=`<p class="qnote">◆ ${COLL.shards} Shards · ${COLL.packs} sealed pack${COLL.packs===1?'':'s'} · Prices in US dollars.</p>`;$('#stx').innerHTML=h;fitScan&&fitScan($('#stx'))}
$('#stx').addEventListener('click',async e=>{const b=e.target.closest('[data-buy],[data-equip],#stPick');if(!b||b.disabled)return;
 if(b.id==='stPick'){showLegPick();return}
 if(b.dataset.equip){const[k,id]=b.dataset.equip.split(':');if(cosSet(k,id)){sfx('heal');toast((k==='back'?CB:TH)[id].n+' equipped')}renderStore();return}
 sfx('click');const r=await buy(b.dataset.buy);if(r.ok&&!r.dup){sfx('heal');const g=r.p.give;toast(g.pk?`${g.pk} packs added`:`${r.p.n} unlocked`);renderStore();badges();if(g.pickL)setTimeout(showLegPick,350)}else if(r.why){sfx('err');toast(r.why)}});
$('#stRestore').onclick=async()=>{sfx('click');const n=await restorePurchases();toast(n?`${n} purchase${n>1?'s':''} restored`:PAY.mode==='test'?'Test mode: purchases live in this save. Back it up from Settings.':'No purchases to restore',2600);renderStore()};
for(const id of['#bStore','#pStore'])$(id).hidden=!storeOpen();
$('#bStore').onclick=()=>{sfx('click');show('store')};$('#pStore').onclick=()=>{sfx('click');show('store')};

/* packs screen: rules line and shard price from ECON (called by renderPacks) */
function packRules(){const E=ECON.pack,M=ECON.match;$('#prules').textContent=`Each pack: 3 Common · 1 Uncommon · 1 Rare or better (${oPct(E.epicChance)} Epic, ${oPct(E.legChance)} Legendary, a Legendary guaranteed every ${E.legPity} packs). Wins pay ${M.win} Shards, losses ${M.loss}, and your first win each day ${M.firstWin} more. Extra copies become Shards.`;
 $('#pBuy').textContent=`Buy · ${E.price}◆`}
onShow(id=>{if(id!=='store'&&$('#odds').classList.contains('on'))modalClose()},true);onShow(id=>{if(id==='store')renderStore()});

/* ---- settings: backup code / restore ---- */
const isApp=!!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform());
async function saveBackup(){const code=svExport();let copied=false;try{await navigator.clipboard.writeText(code);copied=true}catch(e){}
 let saved=false;if(!isApp){try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([code],{type:'text/plain'}));a.download=`hollow-stars-save-${dayKey()}.hssave`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);saved=true}catch(e){}}
 if(copied){sfx('heal');await dlg({t:'Backup ready',x:`Your backup code is on the clipboard${saved?' and saved as a file':''}. Keep it somewhere safe, such as a note or an email to yourself. Restore it from Settings on any device.`,ok:'Done'})}
 else await dlg({t:'Your backup code',x:'Copy this code and keep it somewhere safe. Restore it from Settings on any device.',val:code,raw:1,max:code.length+10,ok:'Done',okRaw:()=>$('#dlgNo').click()})}
async function saveRestore(code){if(code==null)code=await dlg({t:'Restore a backup',x:'Paste your backup code. It replaces the progress on this device.',val:'',raw:1,max:4000000,ok:'Restore'});if(!code)return;
 const r=svImport(code);if(!r.ok){sfx('err');await dlg({t:'Can\'t restore',x:r.why,ok:'OK'});return}
 let sum='';try{const c=JSON.parse(r.o.d.hsCol||'{}');sum=` It has ${Object.keys(c.own||{}).length} cards, ${c.shards|0} Shards and ${c.packs|0} sealed packs.`}catch(e){}
 if(!await dlg({t:'Replace your progress?',x:`Backup from ${new Date(r.o.t).toLocaleString()}.${sum} Everything on this device will be replaced.`,ok:'Replace',danger:1}))return;
 svApply(r.o);location.reload()}
$('#sBack').onclick=()=>{sfx('click');saveBackup()};
/* phones paste a code; desktop restores from the backup file or a pasted code */
$('#sRest').onclick=()=>{sfx('click');if(isApp){saveRestore();return}$('#sFile').value='';$('#sFile').click()};
$('#sFile').addEventListener('change',async e=>{const f=e.target.files&&e.target.files[0];if(f)saveRestore(await f.text())});
if(!isApp){const sb=$('#sRest'),paste=document.createElement('button');sb.textContent='From file';paste.className='btn sm ghost';paste.id='sPaste';paste.textContent='Paste code';sb.after(paste);paste.onclick=()=>{sfx('click');saveRestore()}}

if(SAVE.fixed.length)setTimeout(()=>toast('Save data was changed outside the game, so the last valid save was restored.',4200),2200);
badges();
Object.assign(window.__hs,{storeOpen,DEV,ECON,SAVE,svExport,svImport,svApply,svGet,svPut,PROD,PAY,buy,fulfil,restorePurchases,pickLegend,legChoices,renderStore,oddsHTML,packAdd,packTake,showOdds,showLegPick,saveBackup,saveRestore});

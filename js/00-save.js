'use strict';
/* ================= v2.6 SAVES: versioned format, upgrades, tamper check, backup codes =================
   Game data lives in localStorage under SAVE.keys. hsMeta = {v,c,t} records the save format version; SVMIG upgrades older
   saves step by step at start-up, before anything reads them, so players keep everything across updates.
   Tamper check: each economy key (collection, progress, modes) is written with a signature and an encoded backup copy.
   If the plain JSON is edited by hand the signature no longer matches and the backup is restored. This stops casual save
   editing only; real protection needs the purchases and balances to live on a server (planned cloud saves).
   Backup codes (svExport/svImport) carry every key, signed, so a player can move or restore their progress. */
const SAVE={V:2,keys:['hsCol','hsV8','hsV9','hsDecks'],signed:['hsCol','hsV8','hsV9'],on:false,fixed:[],from:0};
const svLS=(()=>{try{const k='hs__probe';localStorage.setItem(k,'1');localStorage.removeItem(k);return localStorage}catch(e){return null}})();
/* cyrb53: fast 53-bit string hash, plenty for a checksum */
function svHash(s){let a=0xdeadbeef^s.length,b=0x41c6ce57^s.length;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);a=Math.imul(a^c,2654435761);b=Math.imul(b^c,1597334677)}
 a=Math.imul(a^(a>>>16),2246822507)^Math.imul(b^(b>>>13),3266489909);b=Math.imul(b^(b>>>16),2246822507)^Math.imul(a^(a>>>13),3266489909);return(b>>>0).toString(36)+'x'+(a>>>0).toString(36)}
const svSig=(k,t)=>svHash('†hollow·stars†'+k+'\u0000'+t+'\u0000'+t.length);
const svEnc=t=>{const b=new TextEncoder().encode(t);let s='';for(let i=0;i<b.length;i+=0x8000)s+=String.fromCharCode.apply(null,b.subarray(i,i+0x8000));return btoa(s).split('').reverse().join('')};
const svDec=x=>{const s=atob(x.split('').reverse().join('')),b=new Uint8Array(s.length);for(let i=0;i<s.length;i++)b[i]=s.charCodeAt(i);return new TextDecoder().decode(b)};
function svBak(k){try{const r=svLS.getItem(k+'.bak');if(!r)return null;const i=r.lastIndexOf('.'),t=svDec(r.slice(0,i));return svSig(k,t)===r.slice(i+1)?t:null}catch(e){return null}}
/* the verified text of a key (restoring the backup copy if the main copy was edited), or null */
function svRaw(k){if(!svLS)return null;const t=svLS.getItem(k);if(!SAVE.on||!SAVE.signed.includes(k))return t;
 if(t!==null&&svLS.getItem(k+'.sig')===svSig(k,t))return t;
 const b=svBak(k);if(b!==null){if(t!==b)SAVE.fixed.push(k);try{svLS.setItem(k,b);svLS.setItem(k+'.sig',svSig(k,b))}catch(e){}return b}
 if(t!==null){SAVE.fixed.push(k);return null}return null}
function svGet(k){const t=svRaw(k);if(t===null)return null;try{return JSON.parse(t)}catch(e){return null}}
/* backup copy first, then the main copy and its signature: a crash between writes always leaves one valid pair */
function svPut(k,v){if(!svLS)return false;const t=typeof v==='string'?v:JSON.stringify(v);try{if(SAVE.signed.includes(k)){const s=svSig(k,t);svLS.setItem(k+'.bak',svEnc(t)+'.'+s);svLS.setItem(k,t);svLS.setItem(k+'.sig',s)}else svLS.setItem(k,t);return true}catch(e){return false}}
function svDel(k){if(!svLS)return;for(const x of[k,k+'.sig',k+'.bak'])svLS.removeItem(x)}

/* collection save, format 2: pack inventory by source, lifetime pack totals, a pack log, purchases, entitlements, pity counters */
function colUp(o){if(!o||typeof o!=='object'||!o.own||typeof o.own!=='object')return null;const n=x=>Math.max(0,Math.floor(+x||0));
 o.v=2;o.shards=n(o.shards);o.packs=n(o.packs);o.opened=n(o.opened);
 if(!o.src||typeof o.src!=='object')o.src={earn:o.packs,paid:0,gift:0};for(const s of['earn','paid','gift'])o.src[s]=n(o.src[s]);
 if(!o.ptot||typeof o.ptot!=='object')o.ptot={earn:0,paid:0,gift:0};for(const s of['earn','paid','gift'])o.ptot[s]=n(o.ptot[s]);
 if(!Array.isArray(o.log))o.log=[];if(!Array.isArray(o.buys))o.buys=[];if(!o.ent||typeof o.ent!=='object')o.ent={};
 if(!o.pity||typeof o.pity!=='object')o.pity={L:0,H:0};o.pity.L=n(o.pity.L);o.pity.H=n(o.pity.H);return o}

/* upgrade steps: each takes the save from version `to-1` to `to` */
const SVMIG=[{to:2,run(){
 /* v2.5 and earlier: unsigned saves. Trust them once and sign them (only if they were never signed: deleting hsMeta doesn't re-trust an edited save) */
 for(const k of SAVE.signed){const t=svLS.getItem(k);if(t===null||svLS.getItem(k+'.sig')!==null||svLS.getItem(k+'.bak')!==null)continue;
  let v=t;if(k==='hsCol'){try{const o=colUp(JSON.parse(t));if(o)v=JSON.stringify(o)}catch(e){}}svPut(k,v)}}}];
(function svBoot(){if(!svLS)return;let m=null;try{m=JSON.parse(svLS.getItem('hsMeta')||'null')}catch(e){}
 let v=m&&m.v|0;if(!v)v=SAVE.keys.some(k=>svLS.getItem(k)!==null)?1:SAVE.V;SAVE.from=v;
 for(const st of SVMIG)if(v<st.to){try{st.run()}catch(e){console.warn('save upgrade',st.to,e)}v=st.to}
 try{svLS.setItem('hsMeta',JSON.stringify({v:Math.max(v,SAVE.V),c:(m&&m.c)||Date.now(),t:Date.now()}))}catch(e){}SAVE.on=true})();

/* ---- backup codes: HSSAVE<format>:<encoded body>.<signature> ---- */
function svExport(){const d={};for(const k of SAVE.keys){const t=svRaw(k);if(t!==null)d[k]=t}const body=JSON.stringify({g:'hollow-stars',f:SAVE.V,t:Date.now(),d});return'HSSAVE'+SAVE.V+':'+svEnc(body)+'.'+svSig('export',body)}
function svImport(code){const m=/^HSSAVE(\d+):([A-Za-z0-9+/=]+)\.([0-9a-z]+x[0-9a-z]+)$/.exec(String(code||'').replace(/\s+/g,''));if(!m)return{ok:0,why:'That is not a Hollow Stars backup code.'};
 let body,o;try{body=svDec(m[2]);o=JSON.parse(body)}catch(e){return{ok:0,why:'The backup code is incomplete.'}}
 if(svSig('export',body)!==m[3]||!o||o.g!=='hollow-stars'||!o.d||typeof o.d!=='object')return{ok:0,why:'The backup is damaged or was edited.'};
 if((o.f|0)>SAVE.V)return{ok:0,why:'This backup comes from a newer version of Hollow Stars. Update the game first.'};
 for(const k of Object.keys(o.d))if(!SAVE.keys.includes(k)||typeof o.d[k]!=='string')return{ok:0,why:'The backup contains unknown data.'};return{ok:1,o}}
/* replaces the current save; the caller reloads the page so every module starts from it (older formats upgrade on that boot) */
function svApply(o){for(const k of SAVE.keys){if(typeof o.d[k]==='string')svPut(k,o.d[k]);else svDel(k)}try{svLS.setItem('hsMeta',JSON.stringify({v:o.f|0||SAVE.V,c:Date.now(),t:Date.now()}))}catch(e){}}

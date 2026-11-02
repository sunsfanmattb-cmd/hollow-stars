/* Loads the card data and the rules/AI (js/01-core.js, js/02-rules-ai.js) into Node for headless balance play-tests. */
const fs=require('fs'),vm=require('vm'),path=require('path');
module.exports=function load(){const root=path.join(__dirname,'..');const stub=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':stub,apply:()=>stub,construct:()=>stub});
 const ctx={window:{},document:{querySelector:()=>stub,querySelectorAll:()=>[],createElement:()=>stub,documentElement:{style:{setProperty(){}}},body:stub},structuredClone,console,performance,Math,JSON,setTimeout:()=>0,clearTimeout(){},navigator:{},location:{search:''},localStorage:{getItem:()=>null,setItem(){}}};
 vm.createContext(ctx);let src='';for(const f of['01-core.js','02-rules-ai.js'])src+=fs.readFileSync(path.join(root,'js',f),'utf8')+'\n';
 const names='C,COL,BASE,PACK,FAC,KW,prebuilt,newGame,legal,act,aiChoose,aiTurnSync,evalS,unitV,cloneG,simulate,endTurn,startTurn,play,attack,cleanup,mkUnit,summon,addMad,destroy,costOf,heroPower,canHP,mullDone,mulligan,HP,adj'.split(',');
 /* names missing from older builds are skipped, so the loader also runs on earlier versions for before/after comparisons */
 src+=';globalThis.__x={setR:f=>{rnd=f},getR:()=>rnd};'+names.map(n=>`try{__x.${n}=${n}}catch(e){}`).join('')+'\n';
 vm.runInContext(src,ctx,{filename:'game.js'});return ctx.__x};

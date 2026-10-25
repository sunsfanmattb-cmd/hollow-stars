'use strict';
/* Runs last: everything it calls is defined in the earlier files. */
/* ================= BOOT / HOOKS ================= */
{const rs=document.documentElement.style;rs.setProperty('--panel',`url(${uiArt('panel')})`);rs.setProperty('--plaque',`url(${uiArt('plaque')})`)}
layout();scene();bgKick();setTimeout(()=>{const l=isLand()?'':'_p';scPre(['board_v'+l,'board_m'+l,'board_c'+l])},2500);
artPre(['hv','hm','hc','hn'],1);setTimeout(()=>artPre([...COL,'tD','tS','tC']),1500);
Object.defineProperties(window.__hs,Object.getOwnPropertyDescriptors({FIT,fitRefresh,get DK(){return DK},set DK(v){DK=v},saveDecks,dkGet,dkCheck,bdOpen,renderDecks,BD,dlg,lgDelay,LGP,SC,scene,uiArt,overCheck,zoom:showZoom,LG,PO,PRE,VID,ARTV,realArt,realArtS,hasS,artPre,gameOver,get COLL(){return COLL},set COLL(v){COLL=v},saveColl,rollPack,grant,openPack,owned,SH,BASE,PACK,renderColl,renderPacks,startOpen,flip,C,COL,FAC,KW,prebuilt,simulate,newGame,legal,act,aiChoose,evalS,startMatch,show,get G(){return G},get UI(){return UI},renderMatch,
 sheet(ids){let s=$('#sheet');if(!s){s=document.createElement('div');s.id='sheet';document.body.appendChild(s)}s.innerHTML='';for(const id of ids)s.appendChild(cardEl(id))},
 demo(){startMatch(prebuilt('v'),'c',{first:0});UI.busy=false;const g=G,mk=(pi,id)=>{const u=mkUnit(g,pi,id);u.ready=true;return u};g.p[0].board=['v5','v4','v2','n3'].map(id=>mk(0,id));g.p[1].board=['c6','c2','c7','c3','c1'].map(id=>mk(1,id));g.p[1].board[1].h=1;g.p[0].board[3].a=5;
  g.p[0].board[1].h=1;g.p[1].board[3].h=1;
  g.p[0].hand=['v11','v6','v9','v10','v13','v7'].map(id=>({uid:g.uid++,id}));g.p[0].san=14;g.p[1].san=11;g.p[0].mad=2;g.p[1].mad=6;g.p[0].max=g.p[0].flux=6;g.p[1].max=6;g.cur=0;g.turn=11;g.fx=[];renderMatch()}}));

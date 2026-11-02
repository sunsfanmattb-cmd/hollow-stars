'use strict';
/* ================= v2.6 ECONOMY: every reward, price and drop rate in one place =================
   Tune here after launch; nothing else in the code hard-codes these numbers. A pack costs ECON.pack.price Shards,
   so that is the yardstick: a casual day (a few matches, a quest, the login gift) earns roughly 1.5-2 packs. */
const ECON={
 /* match rewards; win/loss are multiplied by the difficulty (Easy ×0.5, Normal ×1, Nightmare ×1.6), the first-win bonus is not */
 match:{win:15,loss:5,firstWin:50},
 dif:{easy:.5,normal:1,nightmare:1.6},
 /* new players */
 start:{packs:3},
 /* booster packs: 3 Common, 1 Uncommon, 1 Rare slot that is a Legendary legChance of the time and an Epic epicChance of the time.
    Pity: a Legendary is guaranteed by the legPity-th pack without one; a holographic card by the holoPity-th pack without one. */
 pack:{price:100,slots:['C','C','C','U','R'],legChance:.1,epicChance:.12,legPity:20,holo:.008,frame:.03,holoPity:50},
 /* extra copies (and disenchanting) pay these Shards; crafting costs these */
 dup:{C:5,U:15,R:40,E:80,L:150},
 craft:{C:40,U:100,R:400,E:800,L:1600},
 /* daily quests: one new quest arrives each day, up to max waiting; one reroll per day */
 quests:{perDay:1,max:3,rerolls:1,rw:{winf:{sh:70},win:{sh:80},rites:{sh:50},units:{sh:50},dmg:{sh:60},leg:{sh:60},camp:{pk:1},games:{sh:50},hard:{pk:1}}},
 /* 7-day login calendar (miss a day and it restarts) */
 login:[{sh:20},{sh:25},{sh:30},{sh:35},{sh:40},{sh:50},{sh:50,pk:1}],
 /* weekly challenge: win `wins` matches under the week's rule */
 weekly:{wins:3,winBonus:10,rw:{sh:250}},
 /* gauntlet: Shards per win, a bonus for winning all 12, and packs at win thresholds */
 gauntlet:{perWin:15,maxBonus:200,packs:[[4,1],[7,2],[12,3]]},
 /* campaign replays pay this fraction of the first-clear Shards */
 camp:{replay:.4},
 /* the store's test checkout hands items out for free, so the store only appears when storeTest is true or the game was opened
    with ?dev=1 on that device (?dev=0 forgets it). Keep this false in released builds until real payments are connected. */
 storeTest:false,
 /* store products (prices in US cents; the real store supplies local prices later). kind: packs | bundle | cos */
 store:[
  {sku:'hs_welcome',kind:'bundle',once:1,n:'Welcome Bundle',d:'10 packs and a Legendary of your choice. One per player.',usd:499,give:{pk:10,pickL:1}},
  {sku:'hs_packs_2',kind:'packs',n:'2 Packs',usd:199,give:{pk:2}},
  {sku:'hs_packs_7',kind:'packs',n:'7 Packs',usd:599,give:{pk:7}},
  {sku:'hs_packs_15',kind:'packs',n:'15 Packs',usd:1199,give:{pk:15},tag:'Popular'},
  {sku:'hs_packs_40',kind:'packs',n:'40 Packs',usd:2999,give:{pk:40},tag:'Best value'},
  {sku:'hs_back_reliquary',kind:'cos',once:1,n:'Brass Reliquary',d:'Card back',usd:299,give:{back:'reliquary'}},
  {sku:'hs_back_pearl',kind:'cos',once:1,n:'Drowned Pearl',d:'Card back',usd:299,give:{back:'pearl'}},
  {sku:'hs_theme_ember',kind:'cos',once:1,n:'Ember Vigil',d:'Board theme',usd:399,give:{theme:'ember'}}]
};

#!/usr/bin/env bash
# Averages tools/balance.js over three deck sets (seeds 11-13) and prints faction rates plus the new/reworked cards.
cd "$(dirname "$0")/.."; S=${TMPDIR:-/tmp}/hsbal; mkdir -p $S
for sd in 11 12 13; do node tools/balance.js ${1:-600} 30 $sd --json $S/b$sd.json > $S/b$sd.txt & done; wait
node -e "
const fs=require('fs'),S='$S',R=[11,12,13].map(s=>JSON.parse(fs.readFileSync(S+'/b'+s+'.json')));
const fw={v:[0,0],m:[0,0],c:[0,0]};let first=0,dec=0,mad=0,g=0;const card={};
for(const r of R){for(const f in fw){fw[f][0]+=r.st.fw[f][0];fw[f][1]+=r.st.fw[f][1]}first+=r.st.first;dec+=r.st.games-r.st.draws;mad+=r.st.reason.mad||0;g+=r.st.games;for(const[id,v]of Object.entries(r.st.card)){const c=card[id]||(card[id]=[0,0]);c[0]+=v[0];c[1]+=v[1]}}
console.log('3 deck sets, '+g+' games | first player '+(100*first/dec).toFixed(1)+'% | Madness endings '+(100*mad/g).toFixed(1)+'%');
console.log('faction: '+Object.entries(fw).map(([f,v])=>f+' '+(100*v[0]/(v[0]+v[1])).toFixed(1)+'%').join('  '));
const ids=(process.argv[1]||'').split(',').filter(Boolean);for(const id of ids){const c=card[id];if(c)console.log('  '+id.padEnd(6)+(100*c[0]/c[1]).toFixed(1).padStart(5)+'%  ('+c[1]+' games)')}
" "$2"

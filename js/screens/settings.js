function set(){
 const o=(k,vals)=>vals.map(v=>`<span class="chip ${S.set[k]==v?'on':''}" data-set="${k}:${v}">${v}</span>`).join('');
 view.innerHTML=`<h2 style="margin-bottom:12px">${tr('set')}</h2>
 <div class="card"><b>Theme</b><div class="chips" style="margin-top:8px">${o('theme',['light','dark','saffron'])}</div></div>
 <div class="card"><b>Language</b><div class="chips" style="margin-top:8px">${o('lang',['ta','en'])}</div></div>
 <div class="card"><b>Font size: ${S.set.font}px</b><input type="range" min="14" max="36" value="${S.set.font}" id="fz" style="margin-top:8px"></div>
 <div class="card"><b>Backup</b><div class="row" style="margin-top:10px;flex-wrap:wrap"><button class="btn" data-exp>Export JSON</button><button class="btn o" data-imp>Import</button><button class="btn o" data-clr>Clear data</button></div><input type="file" id="fi" accept=".json" hidden></div>
 <p class="mut" style="text-align:center">Mithra Bhakti 🙏 · data stays on your device</p>`;
 $('#fz').oninput=e=>{S.set.font=+e.target.value;save();e.target.previousSibling.textContent='Font size: '+S.set.font+'px'};
 $('#fi').onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{try{const d=JSON.parse(t);if(!Array.isArray(d.songs))throw 0;S=Object.assign(seed(),d);save();go('home')}catch(x){alert('Invalid backup file')}})};
}

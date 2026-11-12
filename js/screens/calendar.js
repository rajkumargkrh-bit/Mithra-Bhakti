function cal(){
 const now=new Date();
 if(!S.ui.ym)S.ui.ym=[now.getFullYear(),now.getMonth()];
 const [y,m]=S.ui.ym,ta=S.set.lang==='ta';
 const first=new Date(y,m,1).getDay(),dim=new Date(y,m+1,0).getDate(),marks=allMarks(y);
 const p=n=>String(n).padStart(2,'0'),key=d=>`${y}-${p(m+1)}-${p(d)}`;
 const today=key(now.getDate())===`${now.getFullYear()}-${p(now.getMonth()+1)}-${p(now.getDate())}`&&y===now.getFullYear()&&m===now.getMonth();
 let cells=['S','M','T','W','T','F','S'].map(x=>`<div class="wd">${x}</div>`).join('')+'<div></div>'.repeat(first);
 for(let d=1;d<=dim;d++){const k=key(d),mk=marks[k];
  const isT=y===now.getFullYear()&&m===now.getMonth()&&d===now.getDate();
  cells+=`<div class="d ${isT?'t':''} ${S.ui.day===k?'s':''}" data-day="${k}">${d}${mk?`<i class="${mk.some(x=>x.f)?'f':''}"></i>`:''}</div>`}
 const sel=S.ui.day,ev=sel?(marks[sel]||[]):[];
 view.innerHTML=`<div class="row" style="margin-bottom:10px"><button class="ic" data-mo="-1">◀</button><h2 class="sp" style="text-align:center">${new Date(y,m).toLocaleDateString(ta?'ta-IN':'en-IN',{month:'long',year:'numeric'})}</h2><button class="ic" data-mo="1">▶</button></div>
 <div class="card"><div class="cal">${cells}</div></div>
 ${sel?`<div class="card"><div class="row"><b class="sp">${sel}</b><button class="btn" data-addev>＋ Event</button></div>${ev.map(e=>`<div class="row" style="margin-top:8px">${e.f?'🪔':'📝'} <span class="sp">${esc(e.t)}</span>${e.id?`<button class="ic" data-delev="${e.id}">🗑️</button>`:''}</div>`).join('')||'<p class="mut">No events</p>'}</div>`:'<p class="mut" style="text-align:center">Tap a date</p>'}
 <p class="mut">🔴 Festival &nbsp; 🟡 Your event</p>`;
}

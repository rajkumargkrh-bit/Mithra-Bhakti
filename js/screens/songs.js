function songRow(s){
 return `<div class="card song row" data-open="${s.id}"><div style="font-size:26px">🕉️</div><div class="sp"><b>${esc(s.title)}</b><div class="mut">${esc(s.cat)}</div></div>
 <button class="ic" data-fav="${s.id}">${s.fav?'❤️':'🤍'}</button></div>`;
}
function songs(){
 const q=S.ui.q.toLowerCase(),c=S.ui.cat;
 const list=S.songs.filter(s=>(c==='All'||s.cat===c)&&(s.title+s.lyrics).toLowerCase().includes(q));
 view.innerHTML=`<div class="row" style="margin-bottom:10px"><h2 class="sp">${tr('songs')}</h2><button class="btn" data-add>＋ Add</button></div>
 <input id="q" placeholder="🔍 Search" value="${esc(S.ui.q)}">
 <div class="chips">${['All',...CATS].map(x=>`<span class="chip ${x===c?'on':''}" data-cat="${x}">${x}</span>`).join('')}</div>
 <div id="list">${list.map(songRow).join('')||'<p class="mut" style="text-align:center">No songs</p>'}</div>`;
 $('#q').oninput=e=>{S.ui.q=e.target.value;save();const v=S.songs.filter(s=>(S.ui.cat==='All'||s.cat===S.ui.cat)&&(s.title+s.lyrics).toLowerCase().includes(S.ui.q.toLowerCase()));$('#list').innerHTML=v.map(songRow).join('')};
}
function songForm(id){
 const s=S.songs.find(x=>x.id===id)||{title:'',cat:'Murugan',link:'',lyrics:''};
 mod(`<h3>${id?'Edit':'Add'} Song</h3><br><input id="f1" placeholder="Title" value="${esc(s.title)}">
 <select id="f2">${CATS.map(c=>`<option ${c===s.cat?'selected':''}>${c}</option>`).join('')}</select>
 <input id="f3" placeholder="Audio / YouTube link" value="${esc(s.link)}"><textarea id="f4" placeholder="Lyrics">${esc(s.lyrics)}</textarea>
 <div class="row"><button class="btn sp" data-save="${id||0}">Save</button>${id?`<button class="btn o" data-del="${id}">Delete</button>`:''}<button class="btn o" data-close>Cancel</button></div>`);
}

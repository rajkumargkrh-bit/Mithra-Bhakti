function lyrics(){
 const s=S.songs.find(x=>x.id===S.ui.songId);
 if(!s){return go('songs')}
 S.recent=[s.id,...S.recent.filter(i=>i!==s.id)].slice(0,10);save();
 const link=s.link?`<a class="btn o" style="text-decoration:none;display:inline-block;margin-bottom:10px" target="_blank" rel="noopener" href="${esc(s.link)}">▶ Play</a>`:'';
 view.innerHTML=`<div class="row" style="margin-bottom:8px"><button class="ic" data-go="songs">←</button><h2 class="sp" style="font-size:20px">${esc(s.title)}</h2><button class="ic" data-fav="${s.id}">${s.fav?'❤️':'🤍'}</button><button class="ic" data-edit="${s.id}">✏️</button></div>
 <div class="row" style="flex-wrap:wrap;margin-bottom:10px"><button class="btn o" data-fs="-2">A−</button><button class="btn o" data-fs="2">A＋</button><button class="btn o" id="as">⏬ Auto</button><button class="btn o" data-copy>📋</button><button class="btn o" data-share>🔗</button></div>
 ${link}<div class="card lyr" style="font-size:${S.set.font}px">${esc(s.lyrics)}</div>`;
}

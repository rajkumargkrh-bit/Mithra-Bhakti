/* Mithra Bhakti — Songs & Lyrics module (Phase 1) */
(()=>{
const {state,get,set,esc,go,render,toast,header,$,content,MBDB}=MB;
const CATS=["Bhajan","Slokam","Stotram","Thevaram","Thiruppugazh","Pasuram","Other"];
const DEITIES=["Murugan","Vinayagar","Shiva","Amman","Perumal","Ayyappan","Hanuman","Sai Baba","Other"];
const LH=[1.5,1.9,2.3];
const songs=()=>get("songs",[]);
const save=a=>set("songs",a);
const prefs=()=>({size:20,lh:1.9,...get("reader",{})});
const opts=(arr,sel)=>arr.map(x=>`<option ${x===sel?"selected":""}>${esc(x)}</option>`).join("");

function filtered(){
  const q=(state.songQ||"").trim().toLowerCase();
  return songs().filter(s=>(!state.songCat||s.category===state.songCat)&&(!state.songFav||s.fav)&&(!q||(s.title+" "+s.deity+" "+s.lyrics).toLowerCase().includes(q)))
    .sort((a,b)=>a.title.localeCompare(b.title,"ta"));
}
function rows(){
  const l=filtered();
  if(!l.length)return `<div class="empty"><div class="empty-icon">❀</div>${songs().length?"No songs match":"No songs yet. Tap “+ Add song”"}</div>`;
  return l.map(s=>`<div class="list-item"><div class="list-icon">${s.fav?"★":"❀"}</div><button class="list-main song-open" data-song-open="${s.id}"><b>${esc(s.title)}</b><small>${esc(s.deity)} · ${esc(s.category)}</small></button></div>`).join("");
}
function songsPage(){
  const chip=(label,attr,on)=>`<button class="chip-btn ${on?"on":""}" ${attr}>${label}</button>`;
  return `${header("Songs","Your Tamil lyrics book.")}
  <div class="card row"><div><b>${songs().length} songs</b><div class="muted" style="font-size:11px">Stored on this device</div></div><button class="btn gold" data-song-add>+ Add song</button></div>
  <input class="input" id="songSearch" type="search" placeholder="Search title or lyrics…" value="${esc(state.songQ||"")}" style="margin-bottom:12px">
  <div class="chips">${chip("★ Favourites","data-song-fav",state.songFav)}${chip("All","data-song-cat=\"\"",!state.songCat)}${CATS.map(c=>chip(c,`data-song-cat="${c}"`,state.songCat===c)).join("")}</div>
  <div class="card" id="songList">${rows()}</div>`;
}
function reader(){
  const s=songs().find(x=>x.id===state.songId);
  if(!s)return songsPage();
  const p=prefs();
  return `<div class="reader-top"><button class="btn soft" data-song-back>‹ Songs</button><div class="tools"><button class="icon-btn" data-song-star aria-label="Favourite">${s.fav?"★":"☆"}</button><button class="icon-btn" data-song-edit aria-label="Edit">✎</button></div></div>
  <div class="eyebrow">${esc(s.deity)} · ${esc(s.category)}</div><h1 class="song-title">${esc(s.title)}</h1>
  <div class="card tools"><button class="btn soft" data-song-fs="-1">A−</button><b id="fsLabel">${p.size}</b><button class="btn soft" data-song-fs="1">A+</button><button class="btn soft" data-song-lh>↕ Spacing</button><button class="btn soft" data-song-copy>Copy</button></div>
  <div id="songMedia"></div>
  <article class="lyrics" id="lyrics" style="font-size:${p.size}px;line-height:${p.lh}">${esc(s.lyrics)}</article>`;
}
function editor(){
  const s=songs().find(x=>x.id===state.editId)||{title:"",deity:"Murugan",category:"Bhajan",lyrics:"",mediaId:""};
  const media=(window._files||[]).filter(f=>f.category==="music"||f.category==="videos");
  return `${header(state.editId?"Edit song":"Add song","Type or paste Tamil lyrics.")}
  <div class="card">
  <div class="field"><label>Song title</label><input class="input" id="sTitle" value="${esc(s.title)}" placeholder="பாடல் தலைப்பு"></div>
  <div class="two-col"><div class="field"><label>Deity</label><select class="input" id="sDeity">${opts(DEITIES,s.deity)}</select></div>
  <div class="field"><label>Category</label><select class="input" id="sCat">${opts(CATS,s.category)}</select></div></div>
  <div class="field"><label>Linked audio / video (optional)</label><select class="input" id="sMedia"><option value="">None</option>${media.map(f=>`<option value="${f.id}" ${String(f.id)===String(s.mediaId)?"selected":""}>${esc(f.name)}</option>`).join("")}</select></div>
  <div class="field"><label>Lyrics</label><textarea class="input" id="sLyrics" rows="14" placeholder="வரிகளை இங்கே ஒட்டவும்…">${esc(s.lyrics)}</textarea></div>
  <div class="two-col"><button class="btn gold" data-song-save>Save</button><button class="btn soft" data-song-cancel>Cancel</button></div>
  ${state.editId?`<button class="btn danger full" style="margin-top:12px" data-song-del>Delete song</button>`:""}</div>`;
}

content.addEventListener("click",async e=>{
  const b=e.target.closest("button");if(!b)return;const d=b.dataset;
  const cur=()=>songs().find(x=>x.id===state.songId);
  if(d.songOpen){state.songId=d.songOpen;go("song");scrollTo(0,0);return}
  if(d.songAdd!==undefined){state.editId=null;go("songEdit");scrollTo(0,0);return}
  if(d.songCat!==undefined){state.songCat=d.songCat;render();return}
  if(d.songFav!==undefined){state.songFav=!state.songFav;render();return}
  if(d.songBack!==undefined){go("songs");return}
  if(d.songEdit!==undefined){state.editId=state.songId;go("songEdit");scrollTo(0,0);return}
  if(d.songCancel!==undefined){go(state.editId?"song":"songs");return}
  if(d.songStar!==undefined){const a=songs(),s=a.find(x=>x.id===state.songId);if(s){s.fav=!s.fav;save(a);render()}return}
  if(d.songFs){const p=prefs();p.size=Math.max(14,Math.min(40,p.size+Number(d.songFs)*2));set("reader",p);$("#lyrics").style.fontSize=p.size+"px";$("#fsLabel").textContent=p.size;return}
  if(d.songLh!==undefined){const p=prefs();p.lh=LH[(LH.indexOf(p.lh)+1)%LH.length];set("reader",p);$("#lyrics").style.lineHeight=p.lh;return}
  if(d.songCopy!==undefined){const s=cur();if(!s)return;try{await navigator.clipboard.writeText(s.title+"\n\n"+s.lyrics);toast("Lyrics copied")}catch{toast("Copy not supported")}return}
  if(d.songDel!==undefined){if(confirm("Delete this song?")){save(songs().filter(x=>x.id!==state.editId));state.editId=null;state.songId=null;go("songs");toast("Song deleted")}return}
  if(d.songSave!==undefined){
    const title=$("#sTitle").value.trim(),lyrics=$("#sLyrics").value.trim();
    if(!title||!lyrics){toast("Title and lyrics are required");return}
    const a=songs(),rec={title,lyrics,deity:$("#sDeity").value,category:$("#sCat").value,mediaId:$("#sMedia").value};
    if(state.editId){Object.assign(a.find(x=>x.id===state.editId),rec)}
    else{const id=Date.now().toString(36);a.push({id,fav:false,createdAt:new Date().toISOString(),...rec});state.songId=id}
    save(a);if(state.editId)state.songId=state.editId;state.editId=null;go("song");scrollTo(0,0);toast("Song saved");
  }
});
content.addEventListener("input",e=>{if(e.target.id==="songSearch"){state.songQ=e.target.value;$("#songList").innerHTML=rows()}});

async function mountSongMedia(){
  const mount=$("#songMedia"),s=songs().find(x=>x.id===state.songId);
  if(!mount||!s||!s.mediaId)return;
  const f=await MBDB.get(s.mediaId);if(!f)return;
  const url=URL.createObjectURL(f.blob);if(state.songUrl)URL.revokeObjectURL(state.songUrl);state.songUrl=url;
  const el=document.createElement(f.category==="videos"?"video":"audio");el.controls=true;el.src=url;el.style.cssText="width:100%;margin-bottom:8px;border-radius:12px";if(f.category==="videos")el.playsInline=true;
  mount.append(el);
}
MB.pages.songs=songsPage;MB.pages.song=reader;MB.pages.songEdit=editor;
MB.after=()=>{
  const on=["songs","song","songEdit"].includes(state.page);
  document.querySelectorAll(".nav-item").forEach(b=>{if(b.dataset.page==="songs")b.classList.toggle("active",on)});
  if(state.page==="song")mountSongMedia();
};
if(state.page==="dashboard")render();
})();

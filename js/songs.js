/* Mithra Bhakti — Songs & Lyrics module (v1.2): reader, auto-scroll, wake lock, Tanglish search, setlists */
(()=>{
const {state,get,set,esc,go,render,toast,header,$,content,MBDB}=MB;
const CATS=["Bhajan","Slokam","Stotram","Thevaram","Thiruppugazh","Pasuram","Other"];
const DEITIES=["Murugan","Vinayagar","Shiva","Amman","Perumal","Ayyappan","Hanuman","Sai Baba","Other"];
const LH=[1.5,1.9,2.3], SPEEDS=[8,16,26,38,55];
const songs=()=>get("songs",[]), save=a=>set("songs",a);
const sets=()=>get("setlists",[]), saveSets=a=>set("setlists",a);
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const prefs=()=>({size:20,lh:1.9,speed:2,...get("reader",{})});
const opts=(arr,sel)=>arr.map(x=>`<option ${x===sel?"selected":""}>${esc(x)}</option>`).join("");
const NAV_PAGES=["songs","song","songEdit","setlists","setlist","setPick"];

/* ---------- Tanglish search: Tamil and Latin text -> same rough phonetic key ---------- */
const V={அ:"a",ஆ:"aa",இ:"i",ஈ:"ii",உ:"u",ஊ:"uu",எ:"e",ஏ:"e",ஐ:"ai",ஒ:"o",ஓ:"o",ஔ:"au"};
const C={க:"k",ங:"ng",ச:"s",ஞ:"n",ட:"t",ண:"n",த:"t",ந:"n",ப:"p",ம:"m",ய:"y",ர:"r",ல:"l",வ:"v",ழ:"l",ள:"l",ற:"r",ன:"n",ஜ:"s",ஷ:"s",ஸ:"s",ஹ:"h"};
const S={"ா":"aa","ி":"i","ீ":"ii","ு":"u","ூ":"uu","ெ":"e","ே":"e","ை":"ai","ொ":"o","ோ":"o","ௌ":"au"};
function ta2en(s){let o="",pend=false;for(const ch of s){if(C[ch]){if(pend)o+="a";o+=C[ch];pend=true}else if(S[ch]){o+=S[ch];pend=false}else if(ch==="்"){pend=false}else{if(pend)o+="a";pend=false;o+=V[ch]??ch}}if(pend)o+="a";return o}
const M={b:"p",d:"t",g:"k",j:"s",q:"k",w:"v",x:"ks",z:"l",f:"p",c:"k"};
function fold(s){return s.toLowerCase().replace(/zh/g,"l").replace(/ch|sh/g,"s").replace(/th|dh/g,"t").replace(/bh|ph/g,"p").replace(/gh|kh/g,"k")
  .replace(/ee/g,"i").replace(/oo/g,"u").replace(/[bdgjqwxzfc]/g,c=>M[c]).replace(/h/g,"").replace(/[^a-z]/g,"").replace(/(.)\1+/g,"$1")}
const keyCache=new Map();
const key=t=>{let k=keyCache.get(t);if(k===undefined){k=fold(ta2en(t));keyCache.set(t,k)}return k};

/* ---------- Songs list ---------- */
function filtered(){
  const q=(state.songQ||"").trim().toLowerCase(),qk=q?key(q):"";
  return songs().filter(s=>(!state.songCat||s.category===state.songCat)&&(!state.songDeity||s.deity===state.songDeity)&&(!state.songFav||s.fav)&&(!q||
    (s.title+" "+s.deity+" "+s.lyrics).toLowerCase().includes(q)||(qk&&(key(s.title+" "+s.deity).includes(qk)||key(s.lyrics).includes(qk)))))
    .sort((a,b)=>a.title.localeCompare(b.title,"ta"));
}
function rows(){
  const l=filtered();
  if(!l.length)return `<div class="empty"><div class="empty-icon">❀</div>${songs().length?"No songs match":"No songs yet. Tap “+ Add song”"}</div>`;
  return l.map(s=>`<div class="list-item"><div class="list-icon">${s.fav?"★":"❀"}</div><button class="list-main song-open" data-song-open="${s.id}"><b>${esc(s.title)}</b><small>${esc(s.deity)} · ${esc(s.category)}</small></button></div>`).join("");
}
function songsPage(){
  const chip=(label,attr,on)=>`<button class="chip-btn ${on?"on":""}" ${attr}>${label}</button>`;
  const dl=[...new Set(songs().map(s=>s.deity))].sort();
  return `${header("Songs","Your Tamil lyrics book.")}
  <div class="card row"><div><b>${songs().length} songs</b><div class="muted" style="font-size:11px">Stored on this device</div></div><button class="btn gold" data-song-add>+ Add song</button></div>
  <button class="btn soft full" data-song-sets style="margin-bottom:12px">♪ Setlists (${sets().length})</button>
  <input class="input" id="songSearch" type="search" placeholder="Search Tamil or Tanglish (murugan, kanda sasti)…" value="${esc(state.songQ||"")}" style="margin-bottom:12px">
  <div class="chips">${chip("★ Favourites","data-song-fav",state.songFav)}${chip("All","data-song-cat=\"\"",!state.songCat)}${CATS.map(c=>chip(c,`data-song-cat="${c}"`,state.songCat===c)).join("")}</div>
  ${dl.length?`<div class="chips">${chip("All deities","data-song-deity=\"\"",!state.songDeity)}${dl.map(x=>chip(esc(x),`data-song-deity="${esc(x)}"`,state.songDeity===x)).join("")}</div>`:""}
  <div class="card" id="songList">${rows()}</div>`;
}

/* ---------- Reader ---------- */
function setBar(){
  const s=state.setIdx!=null&&sets().find(x=>x.id===state.setId);if(!s)return "";
  const n=s.songIds.length,i=state.setIdx;
  return `<div class="setbar"><button class="btn soft" data-set-nav="-1" ${i<=0?"disabled":""}>‹ Prev</button><span>${esc(s.name)} · ${i+1}/${n}</span><button class="btn soft" data-set-nav="1" ${i>=n-1?"disabled":""}>Next ›</button></div>`;
}
function reader(){
  const s=songs().find(x=>x.id===state.songId);
  if(!s)return songsPage();
  const p=prefs(),inSet=state.setIdx!=null,bar=setBar(),wk="wakeLock" in navigator;
  return `<div class="reader-top"><button class="btn soft" data-song-back>‹ ${inSet?"Setlist":"Songs"}</button><div class="tools"><button class="icon-btn" data-song-star aria-label="Favourite">${s.fav?"★":"☆"}</button><button class="icon-btn" data-song-edit aria-label="Edit">✎</button></div></div>
  ${bar}<div class="eyebrow">${esc(s.deity)} · ${esc(s.category)}</div><h1 class="song-title">${esc(s.title)}</h1>
  <div class="card tools"><button class="btn soft" data-song-fs="-1">A−</button><b id="fsLabel">${p.size}</b><button class="btn soft" data-song-fs="1">A+</button><button class="btn soft" data-song-lh>↕ Spacing</button><button class="btn soft" data-song-copy>Copy</button></div>
  <div class="card tools"><button class="btn gold" id="asBtn" data-song-as>▶ Auto-scroll</button><button class="btn soft" data-song-sp="-1">−</button><b id="spLabel">${p.speed}</b><button class="btn soft" data-song-sp="1">+</button>${wk?`<button class="btn soft ${p.wake!==false?"on":""}" id="wkBtn" data-song-wake>☀ Screen on</button>`:""}</div>
  <div id="songMedia"></div>
  <article class="lyrics" id="lyrics" style="font-size:${p.size}px;line-height:${p.lh}">${esc(s.lyrics)}</article>${bar}`;
}

/* auto-scroll */
let raf=0,last=0,acc=0,spd=prefs().speed;
function stopScroll(){if(raf)cancelAnimationFrame(raf);raf=0;const b=$("#asBtn");if(b)b.textContent="▶ Auto-scroll"}
function startScroll(){
  stopScroll();last=0;acc=0;const b=$("#asBtn");if(b)b.textContent="■ Stop";
  const step=t=>{
    if(!last)last=t;acc+=(t-last)/1000*SPEEDS[spd-1];last=t;
    if(acc>=1){const n=Math.floor(acc);scrollBy(0,n);acc-=n}
    if(innerHeight+scrollY>=document.documentElement.scrollHeight-2){stopScroll();return}
    raf=requestAnimationFrame(step);
  };
  raf=requestAnimationFrame(step);
}
addEventListener("touchstart",()=>{if(raf)stopScroll()},{passive:true});

/* screen wake lock */
let lock=null;
async function wake(){try{if(prefs().wake!==false&&"wakeLock" in navigator&&!lock){lock=await navigator.wakeLock.request("screen");lock.addEventListener("release",()=>{lock=null})}}catch{}}
function unwake(){try{lock&&lock.release()}catch{}lock=null}
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"&&state.page==="song")wake()});

/* ---------- Editor ---------- */
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

/* ---------- Setlists ---------- */
function setlistsPage(){
  const a=sets();
  return `<button class="btn soft" data-song-back-list style="margin-bottom:14px">‹ Songs</button>${header("Setlists","Bhajan sessions, songs in order.")}
  <div class="card row"><div><b>${a.length} setlists</b></div><button class="btn gold" data-set-new>+ New setlist</button></div>
  <div class="card">${a.length?a.map(s=>`<div class="list-item"><div class="list-icon">♪</div><button class="list-main song-open" data-set-open="${s.id}"><b>${esc(s.name)}</b><small>${s.songIds.length} songs</small></button></div>`).join(""):`<div class="empty"><div class="empty-icon">♪</div>No setlists yet</div>`}</div>`;
}
function curSet(){
  const a=sets(),s=a.find(x=>x.id===state.setId);if(!s)return null;
  const all=songs(),ids=s.songIds.filter(id=>all.some(x=>x.id===id));
  if(ids.length!==s.songIds.length){s.songIds=ids;saveSets(a)}
  return s;
}
function setlistPage(){
  const s=curSet();if(!s)return setlistsPage();
  const all=songs(),n=s.songIds.length;
  return `<button class="btn soft" data-set-list style="margin-bottom:14px">‹ Setlists</button>${header(esc(s.name),n+" songs")}
  <div class="two-col" style="margin-bottom:14px"><button class="btn gold" data-set-start>▶ Start</button><button class="btn soft" data-set-pick>+ Add songs</button></div>
  <div class="card">${n?s.songIds.map((id,i)=>{const x=all.find(q=>q.id===id);return `<div class="list-item"><div class="list-icon">${i+1}</div><button class="list-main song-open" data-set-play="${i}"><b>${esc(x.title)}</b><small>${esc(x.deity)}</small></button><div class="file-actions"><button data-set-mv="${i}:-1" aria-label="Up">▲</button><button data-set-mv="${i}:1" aria-label="Down">▼</button><button data-set-rm="${i}" aria-label="Remove">×</button></div></div>`}).join(""):`<div class="empty">Add songs to this setlist</div>`}</div>
  <div class="two-col" style="margin-top:14px"><button class="btn soft" data-set-rename>Rename</button><button class="btn danger" data-set-delete>Delete</button></div>`;
}
function pickPage(){
  const s=curSet();if(!s)return setlistsPage();
  const l=songs().sort((a,b)=>a.title.localeCompare(b.title,"ta"));
  return `${header("Add songs",esc(s.name))}<div class="card">${l.length?l.map(x=>{const on=s.songIds.includes(x.id);return `<div class="list-item"><div class="list-icon">${on?"✓":"○"}</div><button class="list-main song-open" data-set-toggle="${x.id}"><b>${esc(x.title)}</b><small>${esc(x.deity)}</small></button></div>`}).join(""):`<div class="empty">Add songs to your book first</div>`}</div>
  <button class="btn gold full" style="margin-top:14px" data-set-done>Done</button>`;
}

/* ---------- Events ---------- */
content.addEventListener("click",async e=>{
  const b=e.target.closest("button");if(!b)return;const d=b.dataset;
  const cur=()=>songs().find(x=>x.id===state.songId);
  if(d.songOpen){state.setId=null;state.setIdx=null;state.songId=d.songOpen;go("song");scrollTo(0,0);return}
  if(d.songAdd!==undefined){state.editId=null;go("songEdit");scrollTo(0,0);return}
  if(d.songCat!==undefined){state.songCat=d.songCat;render();return}
  if(d.songDeity!==undefined){state.songDeity=d.songDeity;render();return}
  if(d.songFav!==undefined){state.songFav=!state.songFav;render();return}
  if(d.songBack!==undefined){if(state.setIdx!=null){state.setIdx=null;go("setlist")}else go("songs");scrollTo(0,0);return}
  if(d.songBackList!==undefined){go("songs");return}
  if(d.songEdit!==undefined){state.editId=state.songId;go("songEdit");scrollTo(0,0);return}
  if(d.songCancel!==undefined){go(state.editId?"song":"songs");return}
  if(d.songStar!==undefined){const a=songs(),s=a.find(x=>x.id===state.songId);if(s){s.fav=!s.fav;save(a);b.textContent=s.fav?"★":"☆"}return}
  if(d.songFs){const p=prefs();p.size=Math.max(14,Math.min(40,p.size+Number(d.songFs)*2));set("reader",p);$("#lyrics").style.fontSize=p.size+"px";$("#fsLabel").textContent=p.size;return}
  if(d.songLh!==undefined){const p=prefs();p.lh=LH[(LH.indexOf(p.lh)+1)%LH.length];set("reader",p);$("#lyrics").style.lineHeight=p.lh;return}
  if(d.songAs!==undefined){raf?stopScroll():startScroll();return}
  if(d.songSp){const p=prefs();p.speed=Math.max(1,Math.min(5,p.speed+Number(d.songSp)));spd=p.speed;set("reader",p);$("#spLabel").textContent=p.speed;return}
  if(d.songWake!==undefined){const p=prefs(),on=p.wake===false;p.wake=on;set("reader",p);b.classList.toggle("on",on);on?wake():unwake();toast(on?"Screen stays on":"Screen may sleep");return}
  if(d.songCopy!==undefined){const s=cur();if(!s)return;try{await navigator.clipboard.writeText(s.title+"\n\n"+s.lyrics);toast("Lyrics copied")}catch{toast("Copy not supported")}return}
  if(d.songDel!==undefined){if(confirm("Delete this song?")){const id=state.editId;save(songs().filter(x=>x.id!==id));saveSets(sets().map(s=>({...s,songIds:s.songIds.filter(q=>q!==id)})));state.editId=null;state.songId=null;state.setId=null;state.setIdx=null;go("songs");toast("Song deleted")}return}
  if(d.songSave!==undefined){
    const title=$("#sTitle").value.trim(),lyrics=$("#sLyrics").value.trim();
    if(!title||!lyrics){toast("Title and lyrics are required");return}
    const a=songs(),rec={title,lyrics,deity:$("#sDeity").value,category:$("#sCat").value,mediaId:$("#sMedia").value};
    if(state.editId){Object.assign(a.find(x=>x.id===state.editId),rec)}
    else{const id=uid();a.push({id,fav:false,createdAt:new Date().toISOString(),...rec});state.songId=id;state.setIdx=null}
    save(a);if(state.editId)state.songId=state.editId;state.editId=null;go("song");scrollTo(0,0);toast("Song saved");
  }
});
content.addEventListener("click",e=>{
  const b=e.target.closest("button");if(!b)return;const d=b.dataset;
  if(d.songSets!==undefined){go("setlists");scrollTo(0,0);return}
  if(d.setList!==undefined){state.setId=null;go("setlists");return}
  if(d.setNew!==undefined){const name=(prompt("Setlist name")||"").trim();if(!name)return;const a=sets(),id=uid();a.push({id,name,songIds:[]});saveSets(a);state.setId=id;go("setlist");return}
  if(d.setOpen){state.setId=d.setOpen;go("setlist");scrollTo(0,0);return}
  if(d.setPick!==undefined){go("setPick");scrollTo(0,0);return}
  if(d.setDone!==undefined){go("setlist");return}
  if(d.setToggle){const a=sets(),s=a.find(x=>x.id===state.setId);if(!s)return;const i=s.songIds.indexOf(d.setToggle);i<0?s.songIds.push(d.setToggle):s.songIds.splice(i,1);saveSets(a);render();return}
  if(d.setMv){const [i,dir]=d.setMv.split(":").map(Number),a=sets(),s=a.find(x=>x.id===state.setId),j=i+dir;if(!s||j<0||j>=s.songIds.length)return;[s.songIds[i],s.songIds[j]]=[s.songIds[j],s.songIds[i]];saveSets(a);render();return}
  if(d.setRm!==undefined){const a=sets(),s=a.find(x=>x.id===state.setId);if(!s)return;s.songIds.splice(Number(d.setRm),1);saveSets(a);render();return}
  if(d.setRename!==undefined){const a=sets(),s=a.find(x=>x.id===state.setId);const name=(prompt("Setlist name",s&&s.name)||"").trim();if(!s||!name)return;s.name=name;saveSets(a);render();return}
  if(d.setDelete!==undefined){if(confirm("Delete this setlist? Songs stay in your book.")){saveSets(sets().filter(x=>x.id!==state.setId));state.setId=null;go("setlists");toast("Setlist deleted")}return}
  if(d.setStart!==undefined||d.setPlay!==undefined){const s=curSet();if(!s||!s.songIds.length){toast("Add songs first");return}const i=d.setPlay!==undefined?Number(d.setPlay):0;state.setIdx=i;state.songId=s.songIds[i];go("song");scrollTo(0,0);return}
  if(d.setNav){const s=curSet();if(!s)return;const i=state.setIdx+Number(d.setNav);if(i<0||i>=s.songIds.length)return;state.setIdx=i;state.songId=s.songIds[i];render();scrollTo(0,0)}
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
MB.pages.songs=songsPage;MB.pages.song=reader;MB.pages.songEdit=editor;MB.pages.setlists=setlistsPage;MB.pages.setlist=setlistPage;MB.pages.setPick=pickPage;
MB.after=()=>{
  const on=NAV_PAGES.includes(state.page);
  document.querySelectorAll(".nav-item").forEach(b=>{if(b.dataset.page==="songs")b.classList.toggle("active",on)});
  stopScroll();
  if(state.page==="song"){wake();mountSongMedia()}else unwake();
};
if(state.page==="dashboard")render();
})();

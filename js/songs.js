/* Mithra Bhakti — Songs & Lyrics module (v1.3): reader, auto-scroll, wake lock, Tanglish search, setlists, Now Playing lyrics */
(()=>{
const {state,get,set,esc,go,render,toast,header,$,content,MBDB}=MB;
const CATS=["Bhajan","Slokam","Stotram","Thevaram","Thiruppugazh","Pasuram","Other"];
const DEITIES=["Murugan","Vinayagar","Shiva","Amman","Perumal","Ayyappan","Hanuman","Sai Baba","Other"];
const LH=[1.5,1.9,2.3], SPEEDS=[8,16,26,38,55];
const songs=()=>get("songs",[]), save=a=>set("songs",a);
const sets=()=>get("setlists",[]), saveSets=a=>set("setlists",a);
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const prefs=()=>({size:20,lh:1.9,speed:2,align:"left",rt:"paper",...get("reader",{})});
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


/* ---------- Lyrics formatting: paste cleanup + stanza-aware rendering ---------- */
const DEITY_ICON={Murugan:"🦚",Vinayagar:"🐘",Shiva:"🔱",Amman:"🌺",Perumal:"🐚",Ayyappan:"🕉",Hanuman:"🚩","Sai Baba":"🙏",Other:"🪔"};
const dIcon=d=>DEITY_ICON[d]||"🪔";
const SECRE=/^[\s\[\(\{<*#\-–—•]*(பல்லவி|அனுபல்லவி|சரணம்|சரணங்கள்|காப்பு|விருத்தம்|வெண்பா|பாடல்|pallavi|anupallavi|charanam|saranam|kaappu|verse|chorus|refrain|bridge|intro|outro)\s*[\d\u0BE6-\u0BEF]*[\s\]\)\}>*:.\-–—]*$/i;
const REP=/\s*[\(\[]?\s*(?:[x×*]\s*(\d{1,3})|(\d{1,3})\s*(?:முறை|times|x|×))\s*[\)\]]?\s*$/i;
function cleanLyrics(t){
  return String(t||"").replace(/\r\n?/g,"\n").replace(/[\u200b\u200e\u200f\ufeff]/g,"").replace(/[\u00a0\t]/g," ")
    .split("\n").map(l=>l.replace(/[ ]{2,}/g," ").trim()).join("\n").replace(/\n{3,}/g,"\n\n").trim();
}
function autoFormat(t,title){
  let x=cleanLyrics(t),L=x.split("\n");
  if(title&&L[0]&&L[0].replace(/[^\w\u0B80-\u0BFF]/g,"")===String(title).replace(/[^\w\u0B80-\u0BFF]/g,"")){L.shift();x=L.join("\n").trim()}
  if(!/\n\s*\n/.test(x)){const a=x.split("\n").filter(Boolean);if(a.length>6){const g=[];for(let i=0;i<a.length;i+=4)g.push(a.slice(i,i+4).join("\n"));x=g.join("\n\n")}}
  return x;
}
function parseLyrics(text){
  const out=[];let pend="";
  for(const b of cleanLyrics(text).split(/\n\s*\n/)){
    const lines=b.split("\n").map(x=>x.trim()).filter(Boolean);if(!lines.length)continue;
    let label=pend,num="";pend="";
    const NUM=/^([0-9\u0BE6-\u0BEF]{1,3})\s*[.)\-:]\s+(.+)$/,m0=lines[0].match(NUM);
    if(m0&&SECRE.test(m0[2])){num=m0[1];lines[0]=m0[2]}
    if(SECRE.test(lines[0])){label=lines.shift().replace(/^[^\w\u0B80-\u0BFF]+|[^\w\u0B80-\u0BFF]+$/g,"")}
    if(!lines.length){pend=label;continue}
    if(!num){const m=lines[0].match(NUM);if(m){num=m[1];lines[0]=m[2]}}
    out.push({label,num,lines:lines.map(l=>{const r=l.match(REP);return r&&r.index>0?{t:l.slice(0,r.index).trim(),rep:r[1]||r[2]}:{t:l}})});
  }
  if(pend)out.push({label:pend,num:"",lines:[]});
  return out;
}
function lyricsHtml(text){
  return parseLyrics(text).map((s,i)=>`<section class="stz" data-stz="${i}">${s.label||s.num?`<div class="stz-tag">${s.num?`<b>${esc(s.num)}</b>`:""}${s.label?`<span>${esc(s.label)}</span>`:""}</div>`:""}${s.lines.map(l=>`<p class="ln">${esc(l.t)}${l.rep?`<i class="rep">×${esc(l.rep)}</i>`:""}</p>`).join("")}</section>`).join("");
}
const RT_NAMES={paper:"Paper",warm:"Warm",night:"Night"},RT_ORDER=["paper","warm","night"];
function lyricBlock(s,p){
  return `<div class="lyrics-wrap rt-${p.rt}" id="lyricsWrap"><article class="lyrics ly2 al-${p.align}" id="lyrics" style="font-size:${p.size}px;line-height:${p.lh}">${lyricsHtml(s.lyrics)}</article></div>`;
}
function readTools(p,copy){
  return `<div class="card tools rd-tools"><button class="btn soft" data-song-fs="-1">A−</button><b id="fsLabel">${p.size}</b><button class="btn soft" data-song-fs="1">A+</button><button class="btn soft" data-song-lh aria-label="Line spacing">↕</button><button class="btn soft" data-song-align aria-label="Alignment" id="alBtn">${p.align==="center"?"☰ Left":"☷ Centre"}</button><button class="btn soft" data-song-rt id="rtBtn">◐ ${RT_NAMES[p.rt]||"Paper"}</button>${copy?`<button class="btn soft" data-song-copy>⎘ Copy</button>`:""}</div>`;
}

/* ---------- Songs list ---------- */
function filtered(){
  const q=(state.songQ||"").trim().toLowerCase(),qk=q?key(q):"";
  return songs().filter(s=>(!state.songCat||s.category===state.songCat)&&(!state.songDeity||s.deity===state.songDeity)&&(!state.songFav||s.fav)&&(!q||
    (s.title+" "+s.deity+" "+s.lyrics).toLowerCase().includes(q)||(qk&&(key(s.title+" "+s.deity).includes(qk)||key(s.lyrics).includes(qk)))))
    .sort((a,b)=>a.title.localeCompare(b.title,"ta"));
}
function rows(){
  const l=filtered();
  if(!l.length){
    const none=!songs().length;
    return `<div class="sg-empty"><div class="sg-empty-ring">❀</div><b>${none?"Your lyrics book is empty":"No songs match"}</b><small>${none?"Paste your first Tamil song and it will be arranged for easy reading.":"Try a different word, or clear the filters."}</small>${none?`<button class="sg-add dark" data-song-add><i>＋</i> Add your first song</button>`:""}</div>`;
  }
  return l.map(s=>{const ci=Math.max(0,CATS.indexOf(s.category));return `<div class="sg-item"><button class="sg-open" data-song-open="${s.id}"><span class="sg-av c${ci}">${dIcon(s.deity)}</span><span class="sg-txt"><b>${esc(s.title)}</b><small><em>${esc(s.deity)}</em><em>${esc(s.category)}</em>${s.mediaId?`<em class="aud">♫ audio</em>`:""}</small></span></button><button class="sg-star ${s.fav?"on":""}" data-song-qstar="${s.id}" aria-label="Favourite">${s.fav?"★":"☆"}</button></div>`}).join("");
}
function songsPage(){
  const chip=(label,attr,on)=>`<button class="chip-btn ${on?"on":""}" ${attr}>${label}</button>`;
  const all=songs(),dl=[...new Set(all.map(s=>s.deity))].sort();
  return `${header("Songs","Your Tamil lyrics book.")}
  <section class="sg-hero"><div class="sg-hero-top"><div><div class="sg-count">${all.length}</div><div class="sg-count-l">${all.length===1?"song":"songs"} <span>· பாடல்கள்</span></div></div><button class="sg-add" data-song-add><i>＋</i> Add song</button></div>
  <div class="sg-hero-foot"><button class="sg-pill" data-song-sets>♪ Setlists <b>${sets().length}</b></button><span class="sg-dev">Stored on this device</span></div></section>
  <label class="sg-search"><span>⌕</span><input class="sg-input" id="songSearch" type="search" placeholder="Search Tamil or Tanglish (murugan, kanda sasti)…" value="${esc(state.songQ||"")}"></label>
  <div class="chips">${chip("★ Favourites","data-song-fav",state.songFav)}${chip("All","data-song-cat=\"\"",!state.songCat)}${CATS.map(c=>chip(c,`data-song-cat="${c}"`,state.songCat===c)).join("")}</div>
  ${dl.length?`<div class="chips">${chip("All deities","data-song-deity=\"\"",!state.songDeity)}${dl.map(x=>chip(dIcon(x)+" "+esc(x),`data-song-deity="${esc(x)}"`,state.songDeity===x)).join("")}</div>`:""}
  <div id="songList" class="sg-list">${rows()}</div>`;
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
  ${bar}<div class="song-hero"><div class="sh-icon">${dIcon(s.deity)}</div><div class="eyebrow">${esc(s.deity)} · ${esc(s.category)}</div><h1 class="song-title">${esc(s.title)}</h1><div class="orn"><i></i>✦<i></i></div></div>
  ${readTools(p,true)}
  <div class="card tools rd-tools"><button class="btn gold" id="asBtn" data-song-as>▶ Auto-scroll</button><button class="btn soft" data-song-sp="-1">−</button><b id="spLabel">${p.speed}</b><button class="btn soft" data-song-sp="1">+</button>${wk?`<button class="btn soft ${p.wake!==false?"on":""}" id="wkBtn" data-song-wake>☀ Screen on</button>`:""}</div>
  <div id="songMedia"></div>
  ${lyricBlock(s,p)}${bar}`;
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
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"&&(state.page==="song"||state.page==="nowplaying"))wake()});

/* ---------- Editor ---------- */
function editor(){
  const s=songs().find(x=>x.id===state.editId)||{title:"",deity:"Murugan",category:"Bhajan",lyrics:"",mediaId:state.presetMedia||""};
  const media=(window._files||[]).filter(f=>f.category==="music"||f.category==="videos");
  return `${header(state.editId?"Edit song":"Add song","Type or paste Tamil lyrics.")}
  <div class="card">
  <div class="field"><label>Song title</label><input class="input" id="sTitle" value="${esc(s.title)}" placeholder="பாடல் தலைப்பு"></div>
  <div class="two-col"><div class="field"><label>Deity</label><select class="input" id="sDeity">${opts(DEITIES,s.deity)}</select></div>
  <div class="field"><label>Category</label><select class="input" id="sCat">${opts(CATS,s.category)}</select></div></div>
  <div class="field"><label>Linked audio / video (optional)</label><select class="input" id="sMedia"><option value="">None</option>${media.map(f=>`<option value="${f.id}" ${String(f.id)===String(s.mediaId)?"selected":""}>${esc(f.name)}</option>`).join("")}</select></div>
  <div class="field"><label>Lyrics</label><textarea class="input" id="sLyrics" rows="14" placeholder="வரிகளை இங்கே ஒட்டவும்…">${esc(s.lyrics)}</textarea>
  <div class="ed-hint">Paste the song — it is tidied automatically. Leave a blank line between verses. Labels like <b>பல்லவி</b>, <b>சரணம்</b> or <b>Chorus</b> and repeats like <b>×2</b> get styled for easy reading.</div>
  <div class="two-col" style="margin-top:6px"><button class="btn soft" data-song-fmt>✨ Auto-format</button><button class="btn soft" data-song-prev>👁 Preview</button></div>
  <div id="sPrev" class="lyrics-wrap rt-paper hidden"></div></div>
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
  if(d.songCancel!==undefined){if(state.presetMedia){state.presetMedia=null;go("music")}else go(state.editId?"song":"songs");return}
  if(d.songStar!==undefined){const a=songs(),s=a.find(x=>x.id===state.songId);if(s){s.fav=!s.fav;save(a);b.textContent=s.fav?"★":"☆"}return}
  if(d.songFs){const p=prefs();p.size=Math.max(14,Math.min(40,p.size+Number(d.songFs)*2));set("reader",p);$("#lyrics").style.fontSize=p.size+"px";$("#fsLabel").textContent=p.size;return}
  if(d.songLh!==undefined){const p=prefs();p.lh=LH[(LH.indexOf(p.lh)+1)%LH.length];set("reader",p);$("#lyrics").style.lineHeight=p.lh;return}
  if(d.songAlign!==undefined){const p=prefs();p.align=p.align==="center"?"left":"center";set("reader",p);const l=$("#lyrics");if(l){l.classList.remove("al-left","al-center");l.classList.add("al-"+p.align)}b.textContent=p.align==="center"?"☰ Left":"☷ Centre";return}
  if(d.songRt!==undefined){const p=prefs();p.rt=RT_ORDER[(RT_ORDER.indexOf(p.rt)+1)%RT_ORDER.length];set("reader",p);const w=$("#lyricsWrap");if(w)w.className="lyrics-wrap rt-"+p.rt;b.textContent="◐ "+RT_NAMES[p.rt];return}
  if(d.songFmt!==undefined){const t=$("#sLyrics");t.value=autoFormat(t.value,$("#sTitle").value.trim());toast("Lyrics formatted ✓");const pv=$("#sPrev");if(pv&&!pv.classList.contains("hidden"))pv.innerHTML=`<article class="lyrics ly2 al-left" style="font-size:19px;line-height:1.9">${lyricsHtml(t.value)}</article>`;return}
  if(d.songPrev!==undefined){const pv=$("#sPrev"),t=$("#sLyrics");if(!pv.classList.contains("hidden")){pv.classList.add("hidden");b.textContent="👁 Preview";return}pv.innerHTML=t.value.trim()?`<article class="lyrics ly2 al-left" style="font-size:19px;line-height:1.9">${lyricsHtml(t.value)}</article>`:'<p class="muted" style="text-align:center">Nothing to preview yet</p>';pv.classList.remove("hidden");b.textContent="🙈 Hide preview";return}
  if(d.songQstar){const a=songs(),q=a.find(x=>x.id===d.songQstar);if(q){q.fav=!q.fav;save(a);$("#songList").innerHTML=rows()}return}
  if(d.songAs!==undefined){raf?stopScroll():startScroll();return}
  if(d.songSp){const p=prefs();p.speed=Math.max(1,Math.min(5,p.speed+Number(d.songSp)));spd=p.speed;set("reader",p);$("#spLabel").textContent=p.speed;return}
  if(d.songWake!==undefined){const p=prefs(),on=p.wake===false;p.wake=on;set("reader",p);b.classList.toggle("on",on);on?wake():unwake();toast(on?"Screen stays on":"Screen may sleep");return}
  if(d.songCopy!==undefined){const s=cur();if(!s)return;try{await navigator.clipboard.writeText(s.title+"\n\n"+s.lyrics);toast("Lyrics copied")}catch{toast("Copy not supported")}return}
  if(d.songDel!==undefined){if(await MB.dialog.confirm("Delete this song?",{title:"Delete song",confirmText:"Delete",danger:true})){const id=state.editId;save(songs().filter(x=>x.id!==id));saveSets(sets().map(s=>({...s,songIds:s.songIds.filter(q=>q!==id)})));state.editId=null;state.songId=null;state.setId=null;state.setIdx=null;go("songs");toast("Song deleted")}return}
  if(d.songSave!==undefined){
    const title=$("#sTitle").value.trim(),lyrics=cleanLyrics($("#sLyrics").value);
    if(!title||!lyrics){toast("Title and lyrics are required");return}
    const a=songs(),rec={title,lyrics,deity:$("#sDeity").value,category:$("#sCat").value,mediaId:$("#sMedia").value};
    if(state.editId){Object.assign(a.find(x=>x.id===state.editId),rec)}
    else{const id=uid();a.push({id,fav:false,createdAt:new Date().toISOString(),...rec});state.songId=id;state.setIdx=null}
    save(a);if(state.editId)state.songId=state.editId;const toNP=!!state.presetMedia;state.presetMedia=null;state.editId=null;go(toNP?"nowplaying":"song");scrollTo(0,0);toast("Song saved");
  }
});
content.addEventListener("click",async e=>{
  const b=e.target.closest("button");if(!b)return;const d=b.dataset;
  if(d.songSets!==undefined){go("setlists");scrollTo(0,0);return}
  if(d.setList!==undefined){state.setId=null;go("setlists");return}
  if(d.setNew!==undefined){const name=((await MB.dialog.prompt("Setlist name","",{title:"New setlist"}))||"").trim();if(!name)return;const a=sets(),id=uid();a.push({id,name,songIds:[]});saveSets(a);state.setId=id;go("setlist");return}
  if(d.setOpen){state.setId=d.setOpen;go("setlist");scrollTo(0,0);return}
  if(d.setPick!==undefined){go("setPick");scrollTo(0,0);return}
  if(d.setDone!==undefined){go("setlist");return}
  if(d.setToggle){const a=sets(),s=a.find(x=>x.id===state.setId);if(!s)return;const i=s.songIds.indexOf(d.setToggle);i<0?s.songIds.push(d.setToggle):s.songIds.splice(i,1);saveSets(a);render();return}
  if(d.setMv){const [i,dir]=d.setMv.split(":").map(Number),a=sets(),s=a.find(x=>x.id===state.setId),j=i+dir;if(!s||j<0||j>=s.songIds.length)return;[s.songIds[i],s.songIds[j]]=[s.songIds[j],s.songIds[i]];saveSets(a);render();return}
  if(d.setRm!==undefined){const a=sets(),s=a.find(x=>x.id===state.setId);if(!s)return;s.songIds.splice(Number(d.setRm),1);saveSets(a);render();return}
  if(d.setRename!==undefined){const a=sets(),s=a.find(x=>x.id===state.setId);const name=((await MB.dialog.prompt("Setlist name",s&&s.name||"",{title:"Rename setlist"}))||"").trim();if(!s||!name)return;s.name=name;saveSets(a);render();return}
  if(d.setDelete!==undefined){if(await MB.dialog.confirm("Delete this setlist? Songs stay in your book.",{title:"Delete setlist",confirmText:"Delete",danger:true})){saveSets(sets().filter(x=>x.id!==state.setId));state.setId=null;go("setlists");toast("Setlist deleted")}return}
  if(d.setStart!==undefined||d.setPlay!==undefined){const s=curSet();if(!s||!s.songIds.length){toast("Add songs first");return}const i=d.setPlay!==undefined?Number(d.setPlay):0;state.setIdx=i;state.songId=s.songIds[i];go("song");scrollTo(0,0);return}
  if(d.setNav){const s=curSet();if(!s)return;const i=state.setIdx+Number(d.setNav);if(i<0||i>=s.songIds.length)return;state.setIdx=i;state.songId=s.songIds[i];render();scrollTo(0,0)}
});
content.addEventListener("paste",e=>{const t=e.target;if(t.id!=="sLyrics")return;const empty=!t.value.trim();setTimeout(()=>{if(empty){t.value=autoFormat(t.value,($("#sTitle")||{value:""}).value.trim());toast("Lyrics arranged for reading ✓")}else t.value=cleanLyrics(t.value)},0)});
content.addEventListener("click",e=>{const st=e.target.closest(".lyrics .stz");if(!st||e.target.closest("button"))return;const art=st.closest(".lyrics"),was=st.classList.contains("on");art.querySelectorAll(".stz.on").forEach(x=>x.classList.remove("on"));art.classList.toggle("has-focus",!was);if(!was)st.classList.add("on")});
content.addEventListener("input",e=>{if(e.target.id==="songSearch"){state.songQ=e.target.value;$("#songList").innerHTML=rows()}});

async function mountSongMedia(){
  const mount=$("#songMedia"),s=songs().find(x=>x.id===state.songId);
  if(!mount||!s||!s.mediaId)return;
  const f=await MBDB.get(s.mediaId);
  if(!f){if(state.page==="nowplaying")mount.innerHTML='<p class="muted" style="font-size:12px">Linked audio file not found. Re-import it in Music and link again.</p>';return}
  const url=URL.createObjectURL(f.blob);if(state.songUrl)URL.revokeObjectURL(state.songUrl);state.songUrl=url;
  const el=document.createElement(f.category==="videos"?"video":"audio");el.controls=true;el.src=url;el.style.cssText="width:100%;margin-bottom:8px;border-radius:12px";if(f.category==="videos")el.playsInline=true;
  mount.append(el);
  if(state.page==="nowplaying")el.play().catch(()=>{});
}

/* ---------- Now Playing (audio + lyrics) and linking lyrics to Music files ---------- */
const songForMedia=id=>songs().find(x=>String(x.mediaId)===String(id));
MB.lyricsBtn=f=>songForMedia(f.id)?`<button data-np-open="${f.id}">♪ Lyrics</button>`:`<button data-np-link="${f.id}">+ Lyrics</button>`;
function nowPlaying(){
  const s=songs().find(x=>x.id===state.songId);
  if(!s)return songsPage();
  const p=prefs(),wk="wakeLock" in navigator;
  return `<div class="reader-top"><button class="btn soft" data-np-back>‹ Music</button><div class="tools"><button class="icon-btn" data-song-star aria-label="Favourite">${s.fav?"★":"☆"}</button><button class="btn soft" data-np-reader>Reader</button></div></div>
  <div class="np-player"><div id="songMedia"></div><div class="np-meta"><b class="song-title">${esc(s.title)}</b><small>${esc(s.deity)} · ${esc(s.category)}</small></div></div>
  ${readTools(p,false)}
  <div class="card tools rd-tools"><button class="btn gold" id="asBtn" data-song-as>▶ Auto-scroll</button><button class="btn soft" data-song-sp="-1">−</button><b id="spLabel">${p.speed}</b><button class="btn soft" data-song-sp="1">+</button>${wk?`<button class="btn soft ${p.wake!==false?"on":""}" id="wkBtn" data-song-wake>☀ Screen on</button>`:""}</div>
  ${lyricBlock(s,p)}`;
}
function linkRows(){
  const q=(state.linkQ||"").trim().toLowerCase(),qk=q?key(q):"";
  const l=songs().filter(s=>!q||(s.title+" "+s.deity).toLowerCase().includes(q)||(qk&&key(s.title+" "+s.deity).includes(qk)))
    .sort((a,b)=>a.title.localeCompare(b.title,"ta"));
  if(!l.length)return `<div class="empty"><div class="empty-icon">❀</div>${songs().length?"No songs match":"No songs yet. Create one below"}</div>`;
  return l.map(s=>`<div class="list-item"><div class="list-icon">${s.mediaId?"♫":"❀"}</div><button class="list-main song-open" data-np-pick="${s.id}"><b>${esc(s.title)}</b><small>${esc(s.deity)} · ${esc(s.category)}${s.mediaId?" · has audio":""}</small></button></div>`).join("");
}
function linkPage(){
  const f=(window._files||[]).find(x=>String(x.id)===String(state.linkMediaId));
  if(!f)return MB.pages.music?MB.pages.music():songsPage();
  return `<button class="btn soft" data-np-back style="margin-bottom:14px">‹ Music</button>${header("Link lyrics",esc(f.name))}
  <button class="btn gold full" data-np-new style="margin-bottom:12px">+ New song with this audio</button>
  <input class="input" id="npSearch" type="search" placeholder="Or pick an existing song (Tamil / Tanglish)…" value="${esc(state.linkQ||"")}" style="margin-bottom:12px">
  <div class="card" id="npList">${linkRows()}</div>`;
}
content.addEventListener("click",async e=>{
  const b=e.target.closest("button");if(!b)return;const d=b.dataset;
  if(d.npOpen){const s=songForMedia(d.npOpen);if(!s){toast("No lyrics linked yet");return}state.setId=null;state.setIdx=null;state.songId=s.id;go("nowplaying");scrollTo(0,0);return}
  if(d.npLink){state.linkMediaId=d.npLink;state.linkQ="";go("npLink");scrollTo(0,0);return}
  if(d.npPick){const a=songs(),s=a.find(x=>x.id===d.npPick);if(!s)return;s.mediaId=String(state.linkMediaId);save(a);state.songId=s.id;state.setId=null;state.setIdx=null;go("nowplaying");scrollTo(0,0);toast("Lyrics linked");return}
  if(d.npNew!==undefined){state.editId=null;state.presetMedia=String(state.linkMediaId);go("songEdit");scrollTo(0,0);return}
  if(d.npBack!==undefined){go("music");scrollTo(0,0);return}
  if(d.npReader!==undefined){go("song");scrollTo(0,0);return}
});
content.addEventListener("input",e=>{if(e.target.id==="npSearch"){state.linkQ=e.target.value;$("#npList").innerHTML=linkRows()}});
MB.pages.nowplaying=nowPlaying;MB.pages.npLink=linkPage;MB.pages.songs=songsPage;MB.pages.song=reader;MB.pages.songEdit=editor;MB.pages.setlists=setlistsPage;MB.pages.setlist=setlistPage;MB.pages.setPick=pickPage;
MB.after=()=>{
  const on=NAV_PAGES.includes(state.page),np=state.page==="nowplaying"||state.page==="npLink";
  document.querySelectorAll(".nav-item").forEach(b=>{if(b.dataset.page==="songs")b.classList.toggle("active",on);if(b.dataset.page==="music")b.classList.toggle("active",np||state.page==="music")});
  stopScroll();
  if(state.page==="song"||state.page==="nowplaying"){wake();mountSongMedia()}else unwake();
};
if(state.page==="dashboard")render();
})();

/* Mithra Bhakti — Player Plus (additive).
   Adds: progress/seek bar, sleep timer, favourites list, loop count (11/21/108), lyrics view.
   Does not replace any existing module; it only injects extra UI into the Player page. */
(()=>{
'use strict';
const MB=window.MB;if(!MB)return;
const $=s=>document.querySelector(s),get=MB.get,set=MB.set,esc=MB.esc,toast=MB.toast;
const fmt=s=>{s=Number(s);if(!isFinite(s)||s<0)s=0;s=Math.floor(s);const h=Math.floor(s/3600),m=Math.floor(s%3600/60),r=s%60;return(h?h+':'+String(m).padStart(2,'0'):String(m))+':'+String(r).padStart(2,'0')};
const S={sleepEnd:0,sleepMin:0,sleepTimer:null,loopN:0,loopDone:0,lastT:0,seeking:false,lyricsOpen:false,lyricsEdit:false};
let audio=null;

/* ---------- audio hook ---------- */
function hook(){
 const a=$('#mbPersistentAudio');if(!a)return;
 const mini=$('#mbMiniPlayer');
 if(mini&&!mini.querySelector('.pp-mini-bar'))mini.insertAdjacentHTML('beforeend','<div class="pp-mini-bar"><i id="mbMiniFill"></i></div>');
 if(audio===a)return;audio=a;
 a.addEventListener('timeupdate',onTime);
 a.addEventListener('loadedmetadata',onTime);
 a.addEventListener('durationchange',onTime);
 a.addEventListener('loadstart',()=>{S.loopDone=0;S.lastT=0;applyLoop();refresh();onTime();if(S.lyricsOpen&&!S.lyricsEdit)renderLyrics()});
 applyLoop();
}
function applyLoop(){if(audio)audio.loop=S.loopN>1}
function onTime(){
 const a=audio;if(!a)return;const d=a.duration,t=a.currentTime;
 if(S.loopN>1&&a.loop&&isFinite(d)&&d>0&&S.lastT>d*0.7&&t<S.lastT-d*0.5){
  S.loopDone++;if(S.loopDone>=S.loopN-1)a.loop=false;refresh();
 }
 S.lastT=t;
 const pct=isFinite(d)&&d>0?Math.min(100,t/d*100):0;
 const fill=$('#mbMiniFill');if(fill)fill.style.width=pct+'%';
 const r=$('#ppSeek');
 if(r&&!S.seeking){r.max=isFinite(d)?d:0;r.value=t;r.style.setProperty('--pp-fill',pct+'%');const c=$('#ppCur'),tt=$('#ppTot');if(c)c.textContent=fmt(t);if(tt)tt.textContent=fmt(d)}
}

/* ---------- sleep timer ---------- */
function clearSleep(){clearInterval(S.sleepTimer);S.sleepTimer=null;S.sleepEnd=0;S.sleepMin=0;if(audio)audio.volume=1}
function setSleep(min){
 clearSleep();
 if(min>0){S.sleepMin=min;S.sleepEnd=Date.now()+min*60000;S.sleepTimer=setInterval(tickSleep,1000);toast(`${min} நிமிடத்தில் music நிற்கும் 🌙`)}
 else toast('Sleep timer off');
 refresh();
}
function tickSleep(){
 if(!S.sleepEnd)return;const left=S.sleepEnd-Date.now();
 if(left<=0){const a=audio||$('#mbPersistentAudio');clearSleep();if(a){a.pause();a.volume=1}toast('Sleep timer: music நிறுத்தப்பட்டது 🙏');refresh();return}
 if(left<=10000&&audio&&!audio.paused)audio.volume=Math.max(0.05,left/10000);
 refresh();
}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)tickSleep()});

/* ---------- loop count ---------- */
function setLoop(n){S.loopN=n;S.loopDone=0;applyLoop();toast(n>1?`ஒவ்வொரு track-ம் ${n} முறை play ஆகும் 🔁`:'Loop count off');refresh()}

/* ---------- UI refresh ---------- */
function refresh(){
 document.querySelectorAll('[data-pp-sleep]').forEach(b=>b.classList.toggle('on',Number(b.dataset.ppSleep)===S.sleepMin));
 document.querySelectorAll('[data-pp-loop]').forEach(b=>b.classList.toggle('on',Number(b.dataset.ppLoop)===S.loopN));
 const sl=$('#ppSleepLeft');if(sl)sl.textContent=S.sleepEnd?'· '+fmt(Math.max(0,(S.sleepEnd-Date.now())/1000))+' left':'';
 const ll=$('#ppLoopLeft');if(ll)ll.textContent=S.loopN>1?`· ${Math.min(S.loopDone+1,S.loopN)} / ${S.loopN}`:'';
}

/* ---------- Player page injection ---------- */
const panelHTML=()=>`<div id="ppPanel" class="pp-panel">
 <div class="pp-seek"><span id="ppCur">0:00</span><input id="ppSeek" type="range" min="0" max="0" step="0.1" value="0" aria-label="Seek"><span id="ppTot">0:00</span></div>
 <div class="pp-row"><div class="pp-label">🌙 Sleep timer <b id="ppSleepLeft"></b></div><div class="pp-chips">${[15,30,60].map(m=>`<button type="button" class="pp-chip" data-pp-sleep="${m}">${m} min</button>`).join('')}<button type="button" class="pp-chip" data-pp-sleep="0">Off</button></div></div>
 <div class="pp-row"><div class="pp-label">🔁 Loop count <b id="ppLoopLeft"></b></div><div class="pp-chips">${[3,11,21,108].map(n=>`<button type="button" class="pp-chip" data-pp-loop="${n}">${n}×</button>`).join('')}<button type="button" class="pp-chip" data-pp-loop="0">Off</button></div></div>
 <button type="button" class="pp-chip pp-wide" data-pp-lyrics>📜 Lyrics</button>
</div>`;

function favSection(){
 const ids=get('advancedMusicFavs',[]).map(String),files=(window._files||[]).filter(f=>f.category==='music'),favs=files.filter(f=>ids.includes(String(f.id)));
 return `<section id="ppFavs"><div class="section-head"><h2>⭐ Favourites</h2><span class="chip">${favs.length} tracks</span></div>
 <div class="card">${favs.length?`<button type="button" class="btn gold full" data-pp-fav-all>▶ Play all favourites</button>`+favs.map(f=>`<div class="feature-track"><button type="button" class="feature-track-play" data-pp-fav-play="${f.id}" aria-label="Play">▶</button><div class="list-main"><b>${esc(f.name)}</b><small>${MB.formatSize(f.size)}</small></div><button type="button" class="feature-fav is-fav" data-track-fav="${f.id}" aria-label="Remove favourite">★</button></div>`).join(''):`<div class="empty">Track-ல் ☆ அழுத்தினால் இங்கே சேரும்.</div>`}</div></section>`;
}

function inject(){
 hook();
 if(MB.state.page!=='advancedMusic')return;
 const root=$('#pageContent');if(!root)return;
 const ctl=root.querySelector('.advanced-player .advanced-controls');
 if(ctl&&!$('#ppPanel')){ctl.insertAdjacentHTML('afterend',panelHTML());refresh();onTime()}
 if(!$('#ppFavs')){
  const head=[...root.querySelectorAll('.section-head h2')].find(h=>h.textContent.trim()==='Your music');
  if(head)head.closest('.section-head').insertAdjacentHTML('beforebegin',favSection());
 }
}

/* ---------- Lyrics ---------- */
const lyricsStore=()=>get('ppLyrics',{});
function lyricsFor(t){
 const own=lyricsStore()[String(t.id)];if(own)return{text:own,src:'saved'};
 const song=get('songs',[]).find(s=>String(s.mediaId)===String(t.id));
 return song&&song.lyrics?{text:song.lyrics,src:'songs'}:{text:'',src:''};
}
function closeLyrics(){S.lyricsOpen=false;S.lyricsEdit=false;$('#ppLyricsSheet')?.remove()}
function renderLyrics(){
 const t=MB.player&&MB.player.current();if(!t){closeLyrics();return}
 const L=lyricsFor(t),fs=get('ppLyricsFs',20);
 let sheet=$('#ppLyricsSheet');
 if(!sheet){document.body.insertAdjacentHTML('beforeend','<div id="ppLyricsSheet" class="pp-sheet"></div>');sheet=$('#ppLyricsSheet')}
 const editing=S.lyricsEdit||!L.text;
 sheet.innerHTML=`<section class="pp-sheet-card" role="dialog" aria-modal="true" aria-label="Lyrics">
  <div class="pp-sheet-top"><div class="pp-sheet-title"><small>LYRICS</small><b>${esc(t.name)}</b></div><button type="button" class="pp-x" data-pp-lyrics-close aria-label="Close">✕</button></div>
  ${editing?`<textarea id="ppLyricsText" class="input pp-textarea" rows="12" placeholder="வரிகளை இங்கே ஒட்டவும்…">${esc(L.text)}</textarea>
  <div class="pp-sheet-actions"><button type="button" class="btn gold" data-pp-lyrics-save>Save</button>${L.text?'<button type="button" class="btn soft" data-pp-lyrics-cancel>Cancel</button>':''}</div>`
  :`<div class="pp-lyrics-body lyrics ly2 al-center rt-night" style="font-size:${fs}px">${MB.lyricsHtml?MB.lyricsHtml(L.text):esc(L.text)}</div>
  <div class="pp-sheet-actions"><button type="button" class="btn soft" data-pp-fs="-1">A−</button><button type="button" class="btn soft" data-pp-fs="1">A+</button><button type="button" class="btn soft" data-pp-lyrics-edit>✎ Edit</button></div>
  ${L.src==='songs'?'<small class="pp-src">Songs &amp; Lyrics-ல் இருந்து எடுக்கப்பட்டது</small>':''}`}
 </section>`;
}
function openLyrics(){
 const t=MB.player&&MB.player.current();
 if(!t){toast('முதலில் ஒரு track-ஐ play செய்யவும்');return}
 S.lyricsOpen=true;S.lyricsEdit=false;renderLyrics();
}

/* ---------- events ---------- */
document.addEventListener('paste',e=>{const t=e.target;if(t.id!=='ppLyricsText'||!MB.autoFormat)return;const empty=!t.value.trim();setTimeout(()=>{t.value=empty?MB.autoFormat(t.value,''):MB.cleanLyrics(t.value);if(empty)toast('Lyrics arranged for reading ✓')},0)});
document.addEventListener('click',e=>{const st=e.target.closest('.pp-lyrics-body .stz');if(!st)return;const art=st.closest('.pp-lyrics-body'),was=st.classList.contains('on');art.querySelectorAll('.stz.on').forEach(x=>x.classList.remove('on'));art.classList.toggle('has-focus',!was);if(!was)st.classList.add('on')});
document.addEventListener('input',e=>{if(e.target.id==='ppSeek'){S.seeking=true;const c=$('#ppCur');if(c)c.textContent=fmt(e.target.value);const d=audio&&audio.duration;if(d>0)e.target.style.setProperty('--pp-fill',(e.target.value/d*100)+'%')}});
document.addEventListener('change',e=>{if(e.target.id==='ppSeek'){if(audio&&isFinite(audio.duration)){audio.currentTime=Number(e.target.value);S.lastT=audio.currentTime}S.seeking=false}});
document.addEventListener('click',async e=>{
 const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.ppSleep!==undefined){setSleep(Number(d.ppSleep));return}
 if(d.ppLoop!==undefined){setLoop(Number(d.ppLoop));return}
 if(d.ppLyrics!==undefined){openLyrics();return}
 if(d.ppLyricsClose!==undefined){closeLyrics();return}
 if(d.ppLyricsEdit!==undefined){S.lyricsEdit=true;renderLyrics();return}
 if(d.ppLyricsCancel!==undefined){S.lyricsEdit=false;renderLyrics();return}
 if(d.ppLyricsSave!==undefined){const t=MB.player.current(),txt=MB.cleanLyrics?MB.cleanLyrics($('#ppLyricsText')?.value||''):($('#ppLyricsText')?.value||'').trim(),all=lyricsStore();if(!t)return;if(txt)all[String(t.id)]=txt;else delete all[String(t.id)];set('ppLyrics',all);S.lyricsEdit=false;renderLyrics();toast(txt?'Lyrics saved':'Lyrics removed');return}
 if(d.ppFs!==undefined){const fs=Math.max(14,Math.min(40,get('ppLyricsFs',20)+Number(d.ppFs)*2));set('ppLyricsFs',fs);renderLyrics();return}
 if(d.ppFavAll!==undefined||d.ppFavPlay!==undefined){
  const ids=get('advancedMusicFavs',[]).map(String),files=(window._files||[]).filter(f=>f.category==='music'&&ids.includes(String(f.id))),items=files.map(f=>({id:f.id,name:f.name}));
  if(!items.length||!MB.player)return;
  const start=d.ppFavPlay!==undefined?Math.max(0,items.findIndex(x=>String(x.id)===String(d.ppFavPlay))):0;
  MB.player.setQueue(items);await MB.player.playTrack(start);return;
 }
});
document.addEventListener('click',e=>{if(e.target.id==='ppLyricsSheet')closeLyrics()});
// Close lyrics when navigating to another page via bottom nav / menu.
document.addEventListener('click',e=>{if(S.lyricsOpen&&e.target.closest('.nav-item,[data-go]'))closeLyrics()},true);

/* ---------- boot ---------- */
const root=$('#pageContent');
if(root)new MutationObserver(()=>inject()).observe(root,{childList:true});
const boot=setInterval(()=>{hook();inject();if(audio)clearInterval(boot)},800);
setTimeout(()=>clearInterval(boot),30000);
inject();
})();

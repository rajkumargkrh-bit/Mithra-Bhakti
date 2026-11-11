/* Mithra Bhakti — Bhakti Studio (v1.8, additive; no existing file logic is replaced)
   1) Pooja Mode  2) Prayer Journal  3) Likhita Japam  4) Temple Log  5) Padal Learning  6) Insights & Badges
   Data keys (mb_ prefix, so Smart Backup includes them): bsSettings, bsPooja, bsJournal, bsLikhita, bsTemples, bsLearn,
   bsLastRemind. Temple photos live in their own IndexedDB ("mb_studio") and are not part of the JSON backup.
   Reads (never rewrites) existing keys: songs, japamCounts, bkDailyChecks, bxViratham.
   The only write to existing data is the optional "tick lamp in Daily Bhakti" switch in Pooja Mode (off by default). */
(()=>{
'use strict';
const MB=window.MB;if(!MB)return;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const get=MB.get,set=MB.set,esc=MB.esc,toast=MB.toast;
const lk=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const shift=(k,n)=>{const[y,m,d]=k.split('-').map(Number);return lk(new Date(y,m-1,d+n))};
const dayNum=k=>{const[y,m,d]=k.split('-').map(Number);return Math.round(Date.UTC(y,m-1,d)/864e5)};
const fmtDate=k=>new Date(k+'T00:00:00').toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'});
const nf=n=>Number(n||0).toLocaleString('en-IN');
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const nl=s=>esc(s).replace(/\n/g,'<br>');
const songs=()=>get('songs',[]);
const settings=()=>({pjTick:false,learnRemind:false,...get('bsSettings',{})});
const PAGES=['poojaMode','prayerJournal','likhitaJapam','templeLog','padalLearn','bhaktiInsights'];
const head=(t,s)=>MB.header(t,s);
const chip=(label,attrs,on)=>`<button class="chip bs-chip ${on?'on':''}" ${attrs}>${label}</button>`;

/* =====================================================  1) POOJA MODE */
const DEITIES=[
 {k:'Vinayagar',i:'🐘',ta:'ஓம் கம் கணபதயே நமஹ',tr:'Om Gam Ganapataye Namaha'},
 {k:'Murugan',i:'🦚',ta:'ஓம் சரவணபவ',tr:'Om Saravanabhava'},
 {k:'Shiva',i:'🔱',ta:'ஓம் நமசிவாய',tr:'Om Namah Shivaya'},
 {k:'Amman',i:'🌺',ta:'ஓம் சக்தி பராசக்தி',tr:'Om Shakti Parashakti'},
 {k:'Perumal',i:'🐚',ta:'ஓம் நமோ நாராயணாய',tr:'Om Namo Narayanaya'},
 {k:'Ayyappan',i:'🕉',ta:'சுவாமியே சரணம் ஐயப்பா',tr:'Swamiye Saranam Ayyappa'},
 {k:'Hanuman',i:'🚩',ta:'ஓம் ஹனுமதே நமஹ',tr:'Om Hanumate Namaha'},
 {k:'Sai Baba',i:'🙏',ta:'ஓம் சாய் ராம்',tr:'Om Sai Ram'}
];
const TODAY_DEITY=['','Shiva','Murugan','Perumal','Sai Baba','Amman','Hanuman']; // Sun..Sat (Sun has no fixed entry)
const P={deity:null,songId:null,size:26,speed:0,flame:true};
const SPEEDS=['Off','Slow','Medium','Fast'],PX=[0,18,34,58];

function poojaPage(){
 if(!P.deity){
  const st=settings(),log=get('bsPooja',{}),t=lk();let week=0;for(let i=0;i<7;i++)week+=Number(log[shift(t,-i)])||0;
  const sug=TODAY_DEITY[new Date().getDay()];
  return `${head('Pooja Mode','அமைதியான முழுத்திரை பூஜை — தீபம், மணி, பாடல்.')}
  <section class="card bs-card"><div class="eyebrow">TODAY · இன்று</div><div class="bs-big">${sug?esc(sug)+' வழிபாடு':'சூரிய வழிபாடு · எந்த தெய்வமும் தேர்ந்தெடுக்கலாம்'}</div>
   <small class="muted">இந்த வாரம் ${week} பூஜை · Pooja sessions this week</small></section>
  <div class="section-head"><h2>தெய்வத்தைத் தேர்ந்தெடுக்கவும்</h2></div>
  <div class="bs-deity-grid">${DEITIES.map(d=>{const n=songs().filter(s=>s.deity===d.k).length;return `<button class="bs-deity ${d.k===sug?'sug':''}" data-bs="pj-start" data-v="${esc(d.k)}"><span>${d.i}</span><b>${esc(d.k)}</b><small>${n} songs</small></button>`}).join('')}</div>
  <section class="card bs-card" style="margin-top:14px"><label class="bs-switch"><input type="checkbox" id="bsPjTick" ${st.pjTick?'checked':''}><span><b>Daily Bhakti-ல் தீபம் ✓ குறி</b><small>Pooja முடிந்ததும் Daily Bhakti-இல் “விளக்கு” மற்றும் “காலை வணக்கம்” tick ஆகும் (optional).</small></span></label></section>`;
 }
 const d=DEITIES.find(x=>x.k===P.deity),list=songs().filter(s=>s.deity===d.k),song=P.songId&&songs().find(s=>s.id===P.songId);
 const lyr=song&&MB.lyricsHtml?MB.lyricsHtml(song.lyrics||''):'';
 return `<div class="bs-pooja ${P.flame?'':'noflame'}" id="bsPooja">
  <div class="bs-pj-top"><button class="bs-round" data-bs="pj-close" aria-label="Close">✕</button><div class="bs-pj-title"><b>${d.i} ${esc(d.k)}</b><small>${song?esc(song.title):esc(d.tr)}</small></div><button class="bs-round" data-bs="bell" aria-label="Ring bell">🔔</button></div>
  ${song?`<div class="bs-lyr" id="bsLyr" style="font-size:${P.size}px"><div class="bs-lyr-inner">${lyr||'<p class="ln">Lyrics இல்லை</p>'}</div><div class="bs-lyr-end"><button class="btn soft" data-bs="pj-song" data-v="">‹ பாடல் பட்டியல்</button></div></div>`
  :`<div class="bs-pj-body"><div class="bs-deepam" aria-hidden="true"><i class="bs-glow"></i><i class="bs-flame"></i><i class="bs-diya"></i></div>
    <div class="bs-mantra">${esc(d.ta)}</div><div class="bs-mantra-tr">${esc(d.tr)}</div>
    <div class="bs-songlist">${list.length?list.map(s=>`<button class="bs-song" data-bs="pj-song" data-v="${esc(s.id)}">♪ ${esc(s.title)}</button>`).join(''):`<small class="bs-dim">${esc(d.k)} பாடல்கள் இல்லை — Songs & Lyrics-ல் சேர்க்கவும்.</small>`}</div></div>`}
  <div class="bs-pj-bar">
   <button class="bs-round sm" data-bs="pj-size" data-v="-2">A−</button><button class="bs-round sm" data-bs="pj-size" data-v="2">A+</button>
   <button class="bs-pill" data-bs="pj-speed" id="bsSpeedBtn">⇣ ${SPEEDS[P.speed]}</button>
   <button class="bs-round sm" data-bs="pj-flame" aria-label="Toggle flame">🪔</button>
   <button class="bs-pill gold" data-bs="pj-done">🙏 நிறைவு</button></div></div>`;
}
let ctx=null;
function bell(){
 try{ctx=ctx||new(window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume();
  const t=ctx.currentTime,out=ctx.createGain();out.gain.value=.5;out.connect(ctx.destination);
  [[1,1],[2.76,.5],[5.4,.28],[8.93,.12]].forEach(([r,a])=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=620*r;
   g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(a,t+.01);g.gain.exponentialRampToValueAtTime(.0008,t+3.2/Math.sqrt(r));o.connect(g);g.connect(out);o.start(t);o.stop(t+3.4)});}catch{}
 try{navigator.vibrate&&navigator.vibrate(40)}catch{}
}
let raf=0,paused=0,wl=null;
function stopScroll(){cancelAnimationFrame(raf);raf=0}
function startScroll(){stopScroll();const el=$('#bsLyr');if(!el||!P.speed)return;let last=0,acc=0;
 const step=t=>{const e=$('#bsLyr');if(!e)return;if(last&&t>paused){acc+=(t-last)/1000*PX[P.speed];const n=Math.floor(acc);if(n){e.scrollTop+=n;acc-=n}}last=t;raf=requestAnimationFrame(step)};raf=requestAnimationFrame(step)}
async function wake(on){try{if(on&&!wl&&navigator.wakeLock){wl=await navigator.wakeLock.request('screen');wl.addEventListener('release',()=>{wl=null})}else if(!on&&wl){await wl.release();wl=null}}catch{}}
function poojaDone(){
 const log=get('bsPooja',{}),t=lk();log[t]=(Number(log[t])||0)+1;set('bsPooja',log);
 if(settings().pjTick){const c=get('bkDailyChecks',{}),s=new Set(c[t]||[]);s.add('lamp');s.add('morning');c[t]=[...s];set('bkDailyChecks',c)}
 toast('🙏 பூஜை நிறைவு — நன்றி');P.deity=null;P.songId=null;MB.go('dashboard');
}

/* =====================================================  2) PRAYER JOURNAL */
const MOODS=[['peace','🙏','அமைதி'],['happy','😊','மகிழ்ச்சி'],['grateful','🌼','நன்றி'],['worried','😟','கவலை'],['low','😔','சோர்வு'],['strong','💪','பலம்']];
const moodIcon=k=>(MOODS.find(m=>m[0]===k)||[,'✦'])[1];
const J={date:lk(),month:lk().slice(0,7),mood:null,loaded:''};
const monthShift=(ym,n)=>{const[y,m]=ym.split('-').map(Number),d=new Date(y,m-1+n,1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`};
const monthLabel=ym=>{const[y,m]=ym.split('-').map(Number);return new Date(y,m-1,1).toLocaleDateString(undefined,{month:'long',year:'numeric'})};
function journalPage(){
 const all=get('bsJournal',{}),e=all[J.date]||{};if(J.loaded!==J.date){J.mood=e.mood||null;J.loaded=J.date}
 const keys=Object.keys(all).filter(k=>k.startsWith(J.month)).sort().reverse(),counts={};keys.forEach(k=>{const m=all[k].mood;if(m)counts[m]=(counts[m]||0)+1});
 return `${head('Prayer Journal','இன்றைய நன்றி மற்றும் பிரார்த்தனையை எழுதுங்கள்.')}
 <section class="card bs-card"><div class="field"><label for="bsJDate">நாள் · Date</label><input class="input" id="bsJDate" type="date" value="${J.date}" max="${lk()}"></div>
  <div class="eyebrow">இன்றைய மனநிலை · MOOD</div><div class="bs-chips" id="bsMoods">${MOODS.map(m=>chip(`${m[1]} ${m[2]}`,`data-bs="j-mood" data-v="${m[0]}"`,J.mood===m[0])).join('')}</div>
  <div class="field"><label for="bsJThanks">🌼 இன்று நன்றி சொல்ல…</label><textarea class="input" id="bsJThanks" rows="3" placeholder="இன்று நான் நன்றியுடன் நினைப்பது…">${esc(e.thanks||'')}</textarea></div>
  <div class="field"><label for="bsJPrayer">🙏 பிரார்த்தனை · Prarthanai</label><textarea class="input" id="bsJPrayer" rows="3" placeholder="இறைவனிடம் என் வேண்டுதல்…">${esc(e.prayer||'')}</textarea></div>
  <button class="btn gold full" data-bs="j-save">Save entry</button></section>
 <div class="section-head"><h2>${monthLabel(J.month)}</h2><span><button class="text-btn" data-bs="j-month" data-v="-1">‹</button> <button class="text-btn" data-bs="j-month" data-v="1">›</button></span></div>
 <section class="card bs-card"><b>${keys.length} entries</b> ${Object.keys(counts).map(m=>`<span class="bs-tag">${moodIcon(m)} ${counts[m]}</span>`).join(' ')}</section>
 ${keys.length?keys.map(k=>{const x=all[k];return `<section class="card bs-card bs-entry"><div class="bs-row"><b>${moodIcon(x.mood)} ${fmtDate(k)}</b><span><button class="text-btn" data-bs="j-edit" data-v="${k}">Edit</button> <button class="text-btn" data-bs="j-del" data-v="${k}">Delete</button></span></div>${x.thanks?`<p><small class="muted">நன்றி</small><br>${nl(x.thanks)}</p>`:''}${x.prayer?`<p><small class="muted">பிரார்த்தனை</small><br>${nl(x.prayer)}</p>`:''}</section>`}).join(''):`<div class="empty"><div class="empty-icon">✦</div>இந்த மாதம் இன்னும் பதிவு இல்லை.</div>`}`;
}

/* =====================================================  3) LIKHITA JAPAM */
const LK_DEFAULT=[{n:'Sri Rama Jayam',ta:'ஸ்ரீ ராம ஜெயம்'},{n:'Om Namah Shivaya',ta:'ஓம் நமசிவாய'},{n:'Om Namo Narayanaya',ta:'ஓம் நமோ நாராயணாய'},{n:'Om Saravanabhava',ta:'ஓம் சரவணபவ'},{n:'Om Gam Ganapataye Namaha',ta:'ஓம் கம் கணபதயே நமஹ'},{n:'Swamiye Saranam Ayyappa',ta:'சுவாமியே சரணம் ஐயப்பா'}];
const GOALS=[[10008,'10,008'],[100008,'1,00,008 (1 lakh)'],[1008000,'10,08,000 (10 lakh)'],[10000000,'1 crore']];
const norm=s=>String(s||'').toLowerCase().replace(/[^\p{L}\p{M}\p{N}]/gu,'');
const lkData=()=>{const d=get('bsLikhita',{});d.active=d.active||LK_DEFAULT[0].n;d.items=d.items||{};d.custom=d.custom||[];return d};
const lkList=d=>[...LK_DEFAULT,...d.custom];
const lkItem=(d,n)=>d.items[n]||(d.items[n]={goal:100008,total:0,days:{}});
function lkBody(){
 const d=lkData(),it=lkItem(d,d.active),t=lk(),today=it.days[t]||0,pct=Math.min(100,it.total/it.goal*100),pageNo=Math.floor(it.total/108),inPage=it.total?((it.total-1)%108)+1:0;
 let cells='';for(let i=0;i<108;i++)cells+=`<i class="${i<inPage?'on':''}"></i>`;
 const bars=[];let max=1;for(let i=6;i>=0;i--){const k=shift(t,-i),v=it.days[k]||0;max=Math.max(max,v);bars.push([k,v])}
 return `<div class="bs-lk-stats"><div><b>${nf(it.total)}</b><small>மொத்தம்</small></div><div><b>${nf(today)}</b><small>இன்று</small></div><div><b>${nf(pageNo)}</b><small>பக்கங்கள் (×108)</small></div></div>
 <div class="bs-bar"><i style="width:${pct}%"></i></div><small class="muted">இலக்கு ${nf(it.goal)} · ${pct.toFixed(pct<10?2:1)}% நிறைவு</small>
 <div class="bs-grid108" aria-label="Current page">${cells}</div><small class="muted">பக்கம் ${pageNo+1}: ${inPage}/108</small>
 <div class="bs-week">${bars.map(([k,v])=>`<div><i style="height:${Math.max(3,Math.round(v/max*48))}px"></i><small>${k.slice(8)}</small></div>`).join('')}</div>`;
}
function likhitaPage(){
 const d=lkData(),it=lkItem(d,d.active),cur=lkList(d).find(x=>x.n===d.active)||LK_DEFAULT[0],isCustom=d.custom.some(x=>x.n===d.active);
 return `${head('Likhita Japam','மந்திரத்தை எழுதி / தட்டி எண்ணுங்கள்.')}
 <div class="bs-chips">${lkList(d).map(m=>chip(esc(m.n),`data-bs="lk-pick" data-v="${esc(m.n)}"`,m.n===d.active)).join('')}${chip('＋ புதிது','data-bs="lk-new"',false)}</div>
 <section class="card bs-card"><div class="bs-mantra-sm">${esc(cur.ta)}</div><small class="muted">${esc(cur.n)}</small>
  <input class="input bs-lk-input" id="bsLkIn" placeholder="இங்கே type செய்யவும்…" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false">
  <small class="muted">சரியாக type செய்ததும் தானாக +1 ஆகும் (தமிழ் அல்லது Tanglish).</small>
  <div class="bs-actions"><button class="btn gold" data-bs="lk-add" data-v="1">✍ +1</button><button class="btn soft" data-bs="lk-add" data-v="10">+10</button><button class="btn soft" data-bs="lk-add" data-v="108">+108</button><button class="btn soft" data-bs="lk-add" data-v="-1">↶ Undo</button></div>
  <div id="bsLkBody">${lkBody()}</div></section>
 <section class="card bs-card"><div class="field"><label for="bsLkGoal">இலக்கு · Goal</label><select class="input" id="bsLkGoal">${GOALS.map(g=>`<option value="${g[0]}" ${g[0]===it.goal?'selected':''}>${g[1]}</option>`).join('')}${GOALS.some(g=>g[0]===it.goal)?'':`<option value="${it.goal}" selected>${nf(it.goal)}</option>`}</select></div>
  ${isCustom?'<button class="btn soft full" data-bs="lk-remove">Remove this custom mantra</button>':''}</section>`;
}
function lkAdd(n){
 const d=lkData(),it=lkItem(d,d.active),t=lk(),nn=Math.max(-(it.days[t]||0),n);if(!nn)return;
 it.total=Math.max(0,it.total+nn);it.days[t]=Math.max(0,(it.days[t]||0)+nn);set('bsLikhita',d);
 const b=$('#bsLkBody');if(b)b.innerHTML=lkBody();
 if(nn>0&&it.total%108===0){try{navigator.vibrate&&navigator.vibrate([60,40,60])}catch{}toast('🙏 ஒரு பக்கம் நிறைவு (108)')}
}

/* =====================================================  4) TEMPLE LOG */
const STARTER=[
 ['Bull Temple (Dodda Basavana Gudi)','Basavanagudi','Shiva'],['Dodda Ganapathi Temple','Basavanagudi','Vinayagar'],
 ['ISKCON Sri Radha Krishna Temple','Rajajinagar','Perumal'],['Gavi Gangadhareshwara Temple','Gavipuram','Shiva'],
 ['Dharmaraya Swamy Temple','Thigalarapete','Other'],['Banashankari Amma Temple','Banashankari','Amman'],
 ['Kote Venkataramana Swamy Temple','Chamarajpet','Perumal'],['Kadu Malleshwara Temple','Malleshwaram','Shiva'],
 ['Ragigudda Prasanna Anjaneya Temple','Jayanagar','Hanuman'],['Halasuru Someshwara Temple','Ulsoor','Shiva']
];
const TD=['Murugan','Vinayagar','Shiva','Amman','Perumal','Ayyappan','Hanuman','Sai Baba','Other'];
const T={tab:'visited'};
const temples=()=>get('bsTemples',[]);
function idb(){return new Promise((res,rej)=>{const r=indexedDB.open('mb_studio',1);r.onupgradeneeded=()=>r.result.createObjectStore('photos');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function idbDo(mode,fn){const db=await idb();return new Promise((res,rej)=>{const tx=db.transaction('photos',mode),rq=fn(tx.objectStore('photos'));tx.oncomplete=()=>{res(rq&&rq.result);db.close()};tx.onerror=()=>{rej(tx.error);db.close()}})}
const photoPut=(id,blob)=>idbDo('readwrite',s=>s.put(blob,id)),photoGet=id=>idbDo('readonly',s=>s.get(id)),photoDel=id=>idbDo('readwrite',s=>s.delete(id));
async function shrink(file){const bmp=await createImageBitmap(file),sc=Math.min(1,720/Math.max(bmp.width,bmp.height)),c=document.createElement('canvas');c.width=Math.round(bmp.width*sc);c.height=Math.round(bmp.height*sc);c.getContext('2d').drawImage(bmp,0,0,c.width,c.height);return new Promise(r=>c.toBlob(r,'image/jpeg',.72))}
const mapUrl=t=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(`${t.name} ${t.place||''} Bengaluru`);
function templePage(){
 const all=temples(),vis=all.filter(x=>x.list==='visited').sort((a,b)=>(b.date||'').localeCompare(a.date||'')),wish=all.filter(x=>x.list==='wish'),have=new Set(all.map(x=>x.name));
 const card=(x,wish)=>`<section class="card bs-card bs-temple">${x.photo?`<img class="bs-photo" alt="" data-bs-photo="${x.id}">`:''}<div class="bs-row"><b>🛕 ${esc(x.name)}</b><span class="bs-tag">${esc(x.deity||'Other')}</span></div>
  <small class="muted">${esc(x.place||'')}${x.date&&!wish?' · '+fmtDate(x.date):''}</small>${x.notes?`<p>${nl(x.notes)}</p>`:''}
  <div class="bs-actions"><a class="btn soft" href="${mapUrl(x)}" target="_blank" rel="noopener">📍 Map</a>${wish?`<button class="btn gold" data-bs="t-visit" data-v="${x.id}">✓ Visited</button>`:''}<button class="btn soft" data-bs="t-del" data-v="${x.id}">Delete</button></div></section>`;
 const form=`<details class="card bs-card" id="bsTForm" ${all.length?'':'open'}><summary><b>＋ ${T.tab==='wish'?'Wishlist-ல் சேர்':'கோவில் வருகையைச் சேர்'}</b></summary>
  <div class="field"><label>பெயர் · Name</label><input class="input" id="bsTName" placeholder="Temple name"></div>
  <div class="field"><label>இடம் · Place</label><input class="input" id="bsTPlace" placeholder="Area / city"></div>
  <div class="field"><label>தெய்வம்</label><select class="input" id="bsTDeity">${TD.map(x=>`<option>${x}</option>`).join('')}</select></div>
  ${T.tab==='wish'?'':`<div class="field"><label>தேதி</label><input class="input" id="bsTDate" type="date" value="${lk()}" max="${lk()}"></div><div class="field"><label>Photo (optional)</label><input class="input" id="bsTPhoto" type="file" accept="image/*"></div>`}
  <div class="field"><label>குறிப்பு · Notes</label><textarea class="input" id="bsTNotes" rows="2" placeholder="Darshan, prasadam, experience…"></textarea></div>
  <button class="btn gold full" data-bs="t-add">Save</button></details>`;
 const list=T.tab==='visited'?(vis.length?vis.map(x=>card(x,false)).join(''):'<div class="empty"><div class="empty-icon">🛕</div>இன்னும் வருகை பதிவு இல்லை.</div>')
  :T.tab==='wish'?(wish.length?wish.map(x=>card(x,true)).join(''):'<div class="empty"><div class="empty-icon">✦</div>Wishlist காலி — Bengaluru list-ல் இருந்து சேர்க்கவும்.</div>')
  :`<section class="card bs-card"><small class="muted">தொடக்க பட்டியல் — நேரம் / தினசரி விவரங்களை கோவிலில் சரிபார்க்கவும்.</small>${STARTER.map((s,i)=>`<div class="bs-row bs-starter"><span><b>${esc(s[0])}</b><br><small class="muted">${esc(s[1])} · ${esc(s[2])}</small></span>${have.has(s[0])?'<span class="bs-tag">சேர்க்கப்பட்டது</span>':`<button class="btn soft" data-bs="t-star" data-v="${i}">＋ Wishlist</button>`}</div>`).join('')}</section>`;
 return `${head('Temple Log','சென்ற கோவில்கள் · செல்ல வேண்டிய கோவில்கள்')}
 <div class="bs-chips">${chip(`Visited (${vis.length})`,'data-bs="t-tab" data-v="visited"',T.tab==='visited')}${chip(`Wishlist (${wish.length})`,'data-bs="t-tab" data-v="wish"',T.tab==='wish')}${chip('Bengaluru list','data-bs="t-tab" data-v="starter"',T.tab==='starter')}</div>
 ${T.tab==='starter'?'':form}${list}`;
}
async function loadPhotos(){for(const img of $$('[data-bs-photo]')){try{const b=await photoGet(img.dataset.bsPhoto);if(b)img.src=URL.createObjectURL(b);else img.remove()}catch{img.remove()}}}

/* =====================================================  5) PADAL LEARNING */
const INTERVALS=[1,3,7,14,30,60];
const L={songId:null,mode:'first',q:''};
const learn=()=>get('bsLearn',{});
const dueOn=e=>e&&e.learned?shift(e.last||e.learned,INTERVALS[Math.min(e.rev||0,INTERVALS.length-1)]):null;
function dueList(){const l=learn(),t=lk(),sl=songs();return sl.filter(s=>{const d=dueOn(l[s.id]);return d&&d<=t})}
function linesOf(s){return String(s.lyrics||'').split('\n').map(x=>x.trim()).filter(x=>x&&!/^[\[(#【].*[\])】]?$/.test(x)&&!/^[-=_*~\s]+$/.test(x))}
function learnPage(){
 const sl=songs(),l=learn(),t=lk();
 if(L.songId){
  const s=sl.find(x=>x.id===L.songId);if(!s){L.songId=null;return learnPage()}
  const e=l[s.id],lines=linesOf(s),modes=[['all','முழுதும்'],['first','முதல் சொல்'],['alt','மாற்று வரிகள்'],['none','எல்லாம் மறை']];
  const row=(ln,i)=>{const w=ln.split(/\s+/),hide=L.mode==='none'||(L.mode==='alt'&&i%2===1);
   if(L.mode==='all')return `<p class="bs-ln">${esc(ln)}</p>`;
   const shown=L.mode==='first'?`${esc(w[0])} <span class="bs-dots">${w.length>1?'· · ·':''}</span>`:(hide?'<span class="bs-dots">· · · · ·</span>':esc(ln));
   return (L.mode==='first'||hide)?`<p class="bs-ln bs-hid" data-bs="l-reveal" data-full="${esc(ln)}" data-hint="${esc(shown)}" tabindex="0">${shown}</p>`:`<p class="bs-ln">${esc(ln)}</p>`};
  return `${head(esc(s.title),'வரிகளை நினைவில் இருந்து சொல்லுங்கள்; தொட்டால் வரி தெரியும்.')}
  <button class="text-btn" data-bs="l-back">‹ எல்லா பாடல்கள்</button>
  <div class="bs-chips">${modes.map(m=>chip(m[1],`data-bs="l-mode" data-v="${m[0]}"`,L.mode===m[0])).join('')}</div>
  <section class="card bs-card" id="bsLines">${lines.length?lines.map(row).join(''):'<small class="muted">இந்த பாடலில் வரிகள் இல்லை.</small>'}</section>
  <section class="card bs-card"><small class="muted">${e&&e.learned?`கற்றது: ${fmtDate(e.learned)} · திருப்பம்: ${e.rev||0} · அடுத்த revision: ${fmtDate(dueOn(e))}`:'இன்னும் “கற்றது” என குறிக்கவில்லை.'}</small>
   <div class="bs-actions">${e&&e.learned?`<button class="btn gold" data-bs="l-rev">✓ இன்று revise செய்தேன்</button><button class="btn soft" data-bs="l-unlearn">Reset</button>`:`<button class="btn gold" data-bs="l-learned">✓ கற்றுக்கொண்டேன்</button>`}</div></section>`;
 }
 const due=dueList(),q=norm(L.q),filt=sl.filter(s=>!q||norm(s.title).includes(q)),learned=sl.filter(s=>l[s.id]&&l[s.id].learned).length,st=settings();
 const item=s=>{const e=l[s.id],d=dueOn(e);return `<button class="bs-learn-item" data-bs="l-open" data-v="${esc(s.id)}"><span><b>${esc(s.title)}</b><small>${esc(s.deity||'')}${e&&e.learned?` · revise ${d<=t?'இன்று/தாமதம்':fmtDate(d)}`:''}</small></span><span class="bs-tag ${e&&e.learned?'':'dim'}">${e&&e.learned?(d<=t?'Due':'✓ Learned'):'New'}</span></button>`};
 return `${head('Padal Learning','பாடல்களை மனப்பாடம் செய்ய — மறைத்து பயிற்சி + நினைவூட்டல்.')}
 <section class="card bs-card"><div class="bs-lk-stats"><div><b>${learned}</b><small>கற்றவை</small></div><div><b>${due.length}</b><small>Revision due</small></div><div><b>${sl.length}</b><small>மொத்த பாடல்</small></div></div>
  <label class="bs-switch"><input type="checkbox" id="bsLearnRemind" ${st.learnRemind?'checked':''}><span><b>வாராந்திர revision நினைவூட்டல்</b><small>App திறக்கும் போது, revise செய்ய வேண்டிய பாடல்கள் இருந்தால் 7 நாட்களுக்கு ஒருமுறை நினைவூட்டும்.</small></span></label></section>
 ${due.length?`<div class="section-head"><h2>இன்று revise செய்ய</h2></div><section class="card bs-card bs-list">${due.map(item).join('')}</section>`:''}
 <div class="section-head"><h2>எல்லா பாடல்கள்</h2></div>
 <input class="input" id="bsLearnQ" placeholder="Search songs" value="${esc(L.q)}" style="margin-bottom:10px">
 <section class="card bs-card bs-list" id="bsLearnList">${filt.length?filt.map(item).join(''):`<div class="empty"><div class="empty-icon">❀</div>${sl.length?'பொருத்தம் இல்லை':'Songs & Lyrics-ல் முதலில் பாடல்களைச் சேர்க்கவும்.'}</div>`}</section>`;
}
function remindCheck(){
 if(!settings().learnRemind)return;const t=lk(),last=get('bsLastRemind','');if(last&&dayNum(t)-dayNum(last)<7)return;
 const n=dueList().length;if(!n)return;set('bsLastRemind',t);
 const msg=`${n} பாடல் revision-க்கு தயாராக உள்ளது 🙏`;
 if('Notification' in window&&Notification.permission==='granted'){try{new Notification('Mithra Bhakti · Padal Learning',{body:msg,tag:'bs-learn'});return}catch{}}
 toast(msg);
}

/* =====================================================  6) INSIGHTS & BADGES */
function activity(){
 const s=new Set();
 const c=get('bkDailyChecks',{});for(const k in c)if((c[k]||[]).length)s.add(k);
 const j=get('japamCounts',{});for(const k in j)if(Number(j[k]&&j[k].count)>0)s.add(k);
 for(const k in get('bsJournal',{}))s.add(k);
 const it=get('bsLikhita',{}).items||{};for(const n in it)for(const k in it[n].days||{})if(it[n].days[k]>0)s.add(k);
 const pj=get('bsPooja',{});for(const k in pj)if(pj[k]>0)s.add(k);
 return s;
}
function streaks(set_){
 const t=lk();let cur=set_.has(t)?t:shift(t,-1),streak=0;while(set_.has(cur)&&streak<5000){streak++;cur=shift(cur,-1)}
 const arr=[...set_].sort().map(dayNum);let best=0,run=0;arr.forEach((n,i)=>{run=i&&n-arr[i-1]===1?run+1:1;best=Math.max(best,run)});
 return{streak,best};
}
function totals(){
 const j=get('japamCounts',{}),it=get('bsLikhita',{}).items||{},v=get('bxViratham',[]),l=learn();
 return{japam:Object.values(j).reduce((n,x)=>n+(Number(x&&x.count)||0),0),likhita:Object.values(it).reduce((n,x)=>n+(x.total||0),0),
  journal:Object.keys(get('bsJournal',{})).length,temples:temples().filter(x=>x.list==='visited').length,learned:Object.values(l).filter(x=>x.learned).length,
  pooja:Object.values(get('bsPooja',{})).reduce((n,x)=>n+(Number(x)||0),0),viratham:Array.isArray(v)?v.length:Object.keys(v||{}).length};
}
function badges(sk,t){
 const B=[];const add=(id,icon,name,ta,cur,target)=>B.push({id,icon,name,ta,cur,target,got:cur>=target});
 [[7,'Sapthaham','7 நாள் தொடர்'],[21,'Three Weeks','21 நாள் தொடர்'],[48,'Mandalam','48 நாள் மண்டலம்'],[108,'Ashtottaram','108 நாள் தொடர்']].forEach(([n,a,b])=>add('st'+n,'🔥',a,b,sk.best,n));
 [[108,'First Mala','108 ஜபம்'],[1008,'Sahasra Japam','1,008 ஜபம்'],[10008,'Maha Japam','10,008 ஜபம்']].forEach(([n,a,b])=>add('jp'+n,'📿',a,b,t.japam,n));
 [[1008,'Likhita Seeker','1,008 எழுத்து'],[100008,'Likhita Lakh','1 லட்சம் எழுத்து']].forEach(([n,a,b])=>add('lk'+n,'✍',a,b,t.likhita,n));
 [[10,'Pooja Devotee','10 பூஜை'],[48,'Mandala Pooja','48 பூஜை']].forEach(([n,a,b])=>add('pj'+n,'🪔',a,b,t.pooja,n));
 [[7,'Journal Habit','7 பதிவுகள்'],[30,'Grateful Heart','30 பதிவுகள்']].forEach(([n,a,b])=>add('jr'+n,'🌼',a,b,t.journal,n));
 [[5,'Temple Walker','5 கோவில்கள்'],[10,'Yatri','10 கோவில்கள்']].forEach(([n,a,b])=>add('tm'+n,'🛕',a,b,t.temples,n));
 [[1,'First Padal','1 பாடல் கற்றது'],[5,'Padal Master','5 பாடல்கள்']].forEach(([n,a,b])=>add('ln'+n,'🎶',a,b,t.learned,n));
 return B;
}
function insightsData(){const act=activity(),sk=streaks(act),t=totals(),b=badges(sk,t);return{act,sk,t,b,got:b.filter(x=>x.got).length}}
function insightsPage(){
 const{act,sk,t,b,got}=insightsData(),today=lk(),days=[];for(let i=6;i>=0;i--){const k=shift(today,-i);days.push([k,act.has(k)])}
 let m30=0;for(let i=0;i<30;i++)if(act.has(shift(today,-i)))m30++;
 const stat=(n,l)=>`<div><b>${nf(n)}</b><small>${l}</small></div>`;
 return `${head('Insights & Badges','உங்கள் பக்தி பயணம் — streak, மொத்தம், பதக்கங்கள்.')}
 <section class="card bs-card bs-hero"><div class="eyebrow">CURRENT STREAK</div><div class="bs-streak">🔥 ${sk.streak} <small>நாள்</small></div><small class="muted">சிறந்தது ${sk.best} நாள் · கடைசி 30 நாளில் ${m30} நாள் செயல்பாடு</small>
  <div class="bs-week7">${days.map(([k,on])=>`<div class="${on?'on':''}"><i></i><small>${new Date(k+'T00:00:00').toLocaleDateString(undefined,{weekday:'narrow'})}</small></div>`).join('')}</div>
  <button class="btn gold full" data-bs="share">Share my progress</button></section>
 <div class="section-head"><h2>மொத்தம்</h2></div>
 <section class="card bs-card"><div class="bs-lk-stats bs-six">${stat(t.japam,'ஜபம்')}${stat(t.likhita,'எழுத்து ஜபம்')}${stat(t.pooja,'பூஜை')}${stat(t.journal,'Journal')}${stat(t.temples,'கோவில்கள்')}${stat(t.learned,'கற்ற பாடல்')}</div></section>
 <div class="section-head"><h2>பதக்கங்கள் · ${got}/${b.length}</h2></div>
 <div class="bs-badges">${b.map(x=>`<div class="bs-badge ${x.got?'got':''}"><span>${x.icon}</span><b>${esc(x.name)}</b><small>${esc(x.ta)}</small>${x.got?'<em>✓</em>':`<div class="bs-bar"><i style="width:${Math.min(100,x.cur/x.target*100)}%"></i></div><small>${nf(x.cur)} / ${nf(x.target)}</small>`}</div>`).join('')}</div>`;
}
async function shareCard(){
 const{sk,t,got,b}=insightsData(),c=document.createElement('canvas');c.width=1080;c.height=1350;const x=c.getContext('2d');
 try{await document.fonts.load('700 40px "Noto Sans Tamil"')}catch{}
 const g=x.createLinearGradient(0,0,1080,1350);g.addColorStop(0,'#392454');g.addColorStop(1,'#1a1026');x.fillStyle=g;x.fillRect(0,0,1080,1350);
 x.strokeStyle='#d6ad58';x.lineWidth=6;x.strokeRect(40,40,1000,1270);x.textAlign='center';
 const F='"Noto Sans Tamil",system-ui,sans-serif';
 x.fillStyle='#f0d99e';x.font=`700 40px ${F}`;x.fillText('✦ MITHRA BHAKTI ✦',540,150);
 x.fillStyle='#fff';x.font=`700 150px ${F}`;x.fillText('🔥 '+sk.streak,540,420);x.font=`600 48px ${F}`;x.fillStyle='#f0d99e';x.fillText('நாள் தொடர் பக்தி · day streak',540,490);
 const rows=[['📿 ஜபம்',nf(t.japam)],['✍ எழுத்து ஜபம்',nf(t.likhita)],['🪔 பூஜை',nf(t.pooja)],['🛕 கோவில்கள்',nf(t.temples)],['🏅 பதக்கங்கள்',got+' / '+b.length]];
 rows.forEach((r,i)=>{const y=640+i*115;x.textAlign='left';x.fillStyle='#e4d9ec';x.font=`500 44px ${F}`;x.fillText(r[0],150,y);x.textAlign='right';x.fillStyle='#fff';x.font=`700 52px ${F}`;x.fillText(r[1],930,y)});
 x.textAlign='center';x.fillStyle='#f0d99e';x.font=`500 40px ${F}`;x.fillText('உங்கள் பக்தி உலகம்',540,1250);
 const blob=await new Promise(r=>c.toBlob(r,'image/png')),file=new File([blob],'mithra-bhakti-progress.png',{type:'image/png'});
 try{if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:'Mithra Bhakti'});return}}catch(e){if(e&&e.name==='AbortError')return}
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);toast('Image saved');
}

/* =====================================================  wiring */
MB.pages.poojaMode=poojaPage;MB.pages.prayerJournal=journalPage;MB.pages.likhitaJapam=likhitaPage;
MB.pages.templeLog=templePage;MB.pages.padalLearn=learnPage;MB.pages.bhaktiInsights=insightsPage;

const MENU=[['🪔','Pooja Mode','Deepam, bell & lyrics','poojaMode'],['🌼','Prayer Journal','Gratitude & prarthanai','prayerJournal'],['✍','Likhita Japam','Write the mantra','likhitaJapam'],['🛕','Temple Log','Visited & wishlist','templeLog'],['🎶','Padal Learning','Memorise songs','padalLearn'],['🏅','Insights & Badges','Streaks & milestones','bhaktiInsights']];
function inject(){
 const pg=MB.state.page,root=$('#pageContent');
 /* menu overlay group */
 const sc=$('#premiumMenuOverlay .premium-menu-scroll');
 if(sc&&!sc.querySelector('[data-go="poojaMode"]'))sc.insertAdjacentHTML('afterbegin',`<section class="premium-menu-group"><h3>BHAKTI STUDIO</h3><div class="premium-menu-grid">${MENU.map(m=>`<button class="premium-menu-item" data-go="${m[3]}"><span class="premium-menu-icon">${m[0]}</span><span class="premium-menu-copy"><b>${m[1]}</b><small>${m[2]}</small></span><span class="premium-menu-arrow">›</span></button>`).join('')}</div></section>`);
 /* home card */
 if(pg==='dashboard'&&root&&!$('#bsHome')){
  const{sk}=insightsData(),due=dueList().length,anchor=$('#bxHome')||root.querySelector('.quote-card');
  const html=`<section class="card bs-card" id="bsHome"><div class="bs-row"><div><div class="eyebrow">BHAKTI STUDIO</div><b>🔥 ${sk.streak} நாள் தொடர்</b>${due?` <span class="bs-tag">${due} revision due</span>`:''}</div><button class="text-btn" data-go="bhaktiInsights">Insights ›</button></div>
   <div class="bs-home-grid">${MENU.slice(0,5).map(m=>`<button data-go="${m[3]}"><span>${m[0]}</span><small>${m[1]}</small></button>`).join('')}</div></section>`;
  if(anchor)anchor.insertAdjacentHTML('afterend',html);else root.insertAdjacentHTML('afterbegin',html);
 }
 if(PAGES.includes(pg))$$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page==='more'));
 /* pooja immersive lifecycle */
 const imm=pg==='poojaMode'&&!!P.deity;document.body.classList.toggle('bs-immersive',imm);
 if(imm){wake(true);startScroll()}else{stopScroll();wake(false);if(pg!=='poojaMode'){P.deity=null;P.songId=null}}
 if(pg==='templeLog')loadPhotos();
}
const prevAfter=MB.after;MB.after=()=>{prevAfter&&prevAfter();try{inject()}catch(e){console.error('Bhakti Studio',e)}};

document.addEventListener('click',async e=>{
 const b=e.target.closest('[data-bs]');if(!b)return;const a=b.dataset.bs,v=b.dataset.v;
 switch(a){
  /* pooja */
  case'pj-start':P.deity=v;P.songId=null;P.speed=0;bell();MB.render();scrollTo(0,0);break;
  case'pj-close':P.deity=null;P.songId=null;MB.go('dashboard');break;
  case'pj-song':P.songId=v||null;MB.render();break;
  case'bell':bell();break;
  case'pj-size':{P.size=Math.min(48,Math.max(16,P.size+Number(v)));const l=$('#bsLyr');if(l)l.style.fontSize=P.size+'px';break}
  case'pj-speed':P.speed=(P.speed+1)%SPEEDS.length;b.textContent='⇣ '+SPEEDS[P.speed];startScroll();break;
  case'pj-flame':P.flame=!P.flame;$('#bsPooja')?.classList.toggle('noflame',!P.flame);break;
  case'pj-done':bell();poojaDone();break;
  /* journal */
  case'j-mood':J.mood=J.mood===v?null:v;$$('#bsMoods .chip').forEach(c=>c.classList.toggle('on',c.dataset.v===J.mood));break;
  case'j-save':{const all=get('bsJournal',{}),th=($('#bsJThanks')?.value||'').trim(),pr=($('#bsJPrayer')?.value||'').trim();
   if(!th&&!pr&&!J.mood){toast('ஏதாவது எழுதுங்கள் 🙏');break}
   all[J.date]={thanks:th,prayer:pr,mood:J.mood,ts:Date.now()};set('bsJournal',all);J.month=J.date.slice(0,7);toast('பதிவு சேமிக்கப்பட்டது');MB.render();break}
  case'j-month':J.month=monthShift(J.month,Number(v));MB.render();break;
  case'j-edit':J.date=v;J.loaded='';MB.render();scrollTo(0,0);break;
  case'j-del':if(await MB.dialog.confirm('Delete this journal entry?',{title:'Delete entry',confirmText:'Delete',danger:true})){const all=get('bsJournal',{});delete all[v];set('bsJournal',all);if(J.date===v)J.loaded='';MB.render()}break;
  /* likhita */
  case'lk-pick':{const d=lkData();d.active=v;set('bsLikhita',d);MB.render();break}
  case'lk-new':{const n=((await MB.dialog.prompt('Mantra text (Tamil or Tanglish)','',{title:'New mantra'}))||'').trim();if(!n)break;const d=lkData();if(!lkList(d).some(x=>x.n===n))d.custom.push({n,ta:n});d.active=n;set('bsLikhita',d);MB.render();break}
  case'lk-add':lkAdd(Number(v));break;
  case'lk-remove':if(await MB.dialog.confirm('Remove this mantra and its count?',{title:'Remove mantra',confirmText:'Remove',danger:true})){const d=lkData();d.custom=d.custom.filter(x=>x.n!==d.active);delete d.items[d.active];d.active=LK_DEFAULT[0].n;set('bsLikhita',d);MB.render()}break;
  /* temples */
  case't-tab':T.tab=v;MB.render();break;
  case't-add':{const name=($('#bsTName')?.value||'').trim();if(!name){toast('கோவில் பெயர் தேவை');break}
   const x={id:uid(),name,place:($('#bsTPlace')?.value||'').trim(),deity:$('#bsTDeity')?.value||'Other',notes:($('#bsTNotes')?.value||'').trim(),list:T.tab==='wish'?'wish':'visited',date:T.tab==='wish'?'':($('#bsTDate')?.value||lk()),photo:false};
   const f=$('#bsTPhoto')?.files?.[0];if(f){try{await photoPut(x.id,await shrink(f));x.photo=true}catch{toast('Photo சேமிக்க முடியவில்லை')}}
   const a2=temples();a2.push(x);set('bsTemples',a2);toast('சேமிக்கப்பட்டது');MB.render();break}
  case't-star':{const s=STARTER[Number(v)],a2=temples();if(s&&!a2.some(x=>x.name===s[0])){a2.push({id:uid(),name:s[0],place:s[1],deity:s[2],notes:'',list:'wish',date:'',photo:false});set('bsTemples',a2);MB.render()}break}
  case't-visit':{const a2=temples(),x=a2.find(y=>y.id===v);if(x){x.list='visited';x.date=lk();set('bsTemples',a2);T.tab='visited';toast('🛕 வருகை பதிவு செய்யப்பட்டது');MB.render()}break}
  case't-del':if(await MB.dialog.confirm('Delete this temple entry?',{title:'Delete',confirmText:'Delete',danger:true})){const x=temples().find(y=>y.id===v);if(x&&x.photo)photoDel(x.id).catch(()=>{});set('bsTemples',temples().filter(y=>y.id!==v));MB.render()}break;
  /* learning */
  case'l-open':L.songId=v;MB.render();scrollTo(0,0);break;
  case'l-back':L.songId=null;MB.render();break;
  case'l-mode':L.mode=v;MB.render();break;
  case'l-reveal':{const on=b.classList.toggle('shown');if(on)b.textContent=b.dataset.full;else b.innerHTML=b.dataset.hint;break}
  case'l-learned':{const l=learn();l[L.songId]={learned:lk(),last:lk(),rev:0};set('bsLearn',l);toast('🎶 கற்றது என குறிக்கப்பட்டது');MB.render();break}
  case'l-rev':{const l=learn(),e2=l[L.songId];if(e2){if(e2.last!==lk())e2.rev=(e2.rev||0)+1;e2.last=lk();set('bsLearn',l);toast('நன்று! அடுத்த revision: '+fmtDate(dueOn(e2)));MB.render()}break}
  case'l-unlearn':{const l=learn();delete l[L.songId];set('bsLearn',l);MB.render();break}
  /* insights */
  case'share':shareCard();break;
 }
});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('[data-bs="l-reveal"]')){e.preventDefault();e.target.click()}});
document.addEventListener('input',e=>{
 const t=e.target;
 if(t.id==='bsLkIn'){const d=lkData(),cur=lkList(d).find(x=>x.n===d.active);if(!cur)return;const v=norm(t.value);if(v&&(v===norm(cur.n)||v===norm(cur.ta))){lkAdd(1);t.value=''}}
 if(t.id==='bsLearnQ'){L.q=t.value;const l=learn(),tt=lk(),q=norm(L.q),f=songs().filter(s=>!q||norm(s.title).includes(q));
  const box=$('#bsLearnList');if(box)box.innerHTML=f.length?f.map(s=>{const e2=l[s.id],d=dueOn(e2);return `<button class="bs-learn-item" data-bs="l-open" data-v="${esc(s.id)}"><span><b>${esc(s.title)}</b><small>${esc(s.deity||'')}</small></span><span class="bs-tag ${e2&&e2.learned?'':'dim'}">${e2&&e2.learned?(d<=tt?'Due':'✓ Learned'):'New'}</span></button>`}).join(''):'<div class="empty">பொருத்தம் இல்லை</div>'}
});
document.addEventListener('change',async e=>{
 const t=e.target;
 if(t.id==='bsPjTick'){const s=settings();s.pjTick=t.checked;set('bsSettings',s)}
 if(t.id==='bsLearnRemind'){const s=settings();s.learnRemind=t.checked;set('bsSettings',s);if(t.checked&&'Notification' in window&&Notification.permission==='default'){try{await Notification.requestPermission()}catch{}}toast(t.checked?'Weekly reminder on':'Reminder off')}
 if(t.id==='bsJDate'){J.date=t.value||lk();J.loaded='';MB.render()}
 if(t.id==='bsLkGoal'){const d=lkData();lkItem(d,d.active).goal=Number(t.value);set('bsLikhita',d);MB.render()}
});
/* pause auto-scroll while the user touches / wheels the lyrics */
['touchstart','wheel','pointerdown'].forEach(ev=>document.addEventListener(ev,e=>{if(e.target.closest&&e.target.closest('#bsLyr'))paused=performance.now()+2500},{passive:true}));
document.addEventListener('visibilitychange',()=>{if(!document.hidden){remindCheck();if(MB.state.page==='poojaMode'&&P.deity)wake(true)}});
setTimeout(remindCheck,3500);
if(['dashboard',...PAGES].includes(MB.state.page))MB.render();
})();

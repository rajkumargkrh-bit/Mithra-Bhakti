/* Mithra Bhakti — Bhakti Plus (additive; no existing file logic is replaced)
   1) Japam history: streak, 7-day bars, month total, daily mala goal (added under the Japam page)
   2) Special days: Ekadashi, Pradosham, Sankashti, Chaturthi, Shashti, Karthigai, Pournami, Amavasai
      (computed from the existing panchangam) + 2027 festivals + optional reminders
   3) Synced (karaoke) lyrics in the Player lyrics sheet: tap-to-sync, auto-highlight
   Data keys (mb_ prefix, so Smart Backup includes them): bkJapamGoal, bkSpecialRemind, bkSpecialFired, bhaktiSync */
(()=>{
'use strict';
const MB=window.MB;if(!MB)return;
const $=s=>document.querySelector(s),get=MB.get,set=MB.set,esc=MB.esc,toast=MB.toast;
const lk=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const addDays=(key,n)=>{const[y,m,d]=key.split('-').map(Number);return lk(new Date(y,m-1,d+n))};
const fmtDate=k=>new Date(k+'T00:00:00').toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short'});
const fmtLong=k=>new Date(k+'T00:00:00').toLocaleDateString(undefined,{day:'numeric',month:'long',year:'numeric'});

/* ---------- 1) Japam history ---------- */
function japamStats(){
 const all=get('japamCounts',{}),today=lk(),c=k=>Number(all[k]&&all[k].count)||0;
 let streak=0,k=c(today)>0?today:addDays(today,-1);
 while(c(k)>0&&streak<400){streak++;k=addDays(k,-1)}
 const days=[];for(let i=6;i>=0;i--){const d=addDays(today,-i);days.push({d,n:c(d)})}
 const mk=today.slice(0,7);let month=0,best=0,bestD='';
 for(const d in all){const n=c(d);if(d.startsWith(mk))month+=n;if(n>best){best=n;bestD=d}}
 return{streak,days,month,best,bestD,today:c(today)};
}
function japamCard(){
 const s=japamStats(),goal=Number(get('bkJapamGoal',1))||1,target=goal*108,pct=Math.min(100,Math.round(s.today/target*100)),max=Math.max(1,...s.days.map(x=>x.n));
 const bars=s.days.map(x=>`<div class="bk-bar"><em>${x.n||''}</em><span><i style="height:${Math.round(x.n/max*100)}%"></i></span><small>${new Date(x.d+'T00:00:00').toLocaleDateString(undefined,{weekday:'narrow'})}</small></div>`).join('');
 return `<div class="eyebrow">JAPAM HISTORY</div>
 <div class="bk-stats"><div><b>🔥 ${s.streak}</b><small>தொடர் நாட்கள்</small></div><div><b>${s.month}</b><small>இம்மாத ஜபம்</small></div><div><b>${s.best}</b><small>சிறந்த நாள்${s.bestD?' · '+fmtDate(s.bestD):''}</small></div></div>
 <div class="bk-bars">${bars}</div>
 <div class="bk-goal"><label for="bkGoal">தினசரி இலக்கு</label><select id="bkGoal" class="input">${[1,3,5,11,21].map(n=>`<option value="${n}" ${n===goal?'selected':''}>${n} மாலை (${n*108})</option>`).join('')}</select></div>
 <div class="progress"><i style="width:${pct}%"></i></div><small class="feature-note">இன்று ${s.today} / ${target} · ${pct}%</small>`;
}
function renderJapam(){
 if(MB.state.page!=='japam')return;
 let sec=$('#bkJapam');
 if(!sec){sec=document.createElement('section');sec.id='bkJapam';sec.className='card feature-card bk-card';$('#pageContent')?.append(sec)}
 sec.innerHTML=japamCard();
}
document.addEventListener('change',e=>{if(e.target.id==='bkGoal'){set('bkJapamGoal',Number(e.target.value)||1);renderJapam()}});
document.addEventListener('click',e=>{if(e.target.closest('[data-japam]'))setTimeout(renderJapam,120)});

/* ---------- 2) Special days ---------- */
const TYPES={
 ekadashi:{n:'ஏகாதசி',ic:'🌙',d:'விஷ்ணு வழிபாடு · விரதம்'},
 pradosham:{n:'பிரதோஷம்',ic:'🔱',d:'சிவ வழிபாடு · மாலை நேரம்'},
 sankashti:{n:'சங்கடஹர சதுர்த்தி',ic:'🐘',d:'விநாயகர் வழிபாடு · சந்திர உதயம் வரை விரதம்'},
 chaturthi:{n:'வளர்பிறை சதுர்த்தி',ic:'🐘',d:'விநாயகர் வழிபாடு'},
 shashti:{n:'சஷ்டி',ic:'🦚',d:'முருகன் வழிபாடு'},
 krithigai:{n:'கார்த்திகை',ic:'🪔',d:'முருகன் வழிபாடு · தீபம் ஏற்றுதல்'},
 pournami:{n:'பௌர்ணமி',ic:'🌕',d:'முழு நிலவு வழிபாடு'},
 amavasai:{n:'அமாவாசை',ic:'🌑',d:'முன்னோர் வழிபாடு'}
};
const FEST2027=[
 ['2027-01-14','Thai Pongal','சூரிய பகவானுக்கு நன்றி செலுத்தும் அறுவடைத் திருநாள்.'],
 ['2027-03-06','Maha Shivaratri','சிவபெருமானுக்கு இரவு முழுவதும் விழித்திருந்து வழிபடும் நாள்.'],
 ['2027-04-07','Ugadi','தெலுங்கு / கன்னட புத்தாண்டு.'],
 ['2027-04-14','Tamil Puthandu','தமிழ் புத்தாண்டு.'],
 ['2027-09-05','Vinayaka Chaturthi','விநாயகர் அவதரித்த நாள்.'],
 ['2027-10-29','Diwali / Lakshmi Puja','ஒளி, நம்பிக்கை மற்றும் நன்மையின் திருநாள்.']
];
const dayEvents=key=>{
 const P=MB.panchang;if(!P||!P.dayInfo)return[];
 let info;try{info=P.dayInfo(key)}catch{return[]}
 const te=info.tithiEnd,at=t=>te&&te.t<=t?te.next:info.tithi,sr=info.tithi,ss=at(info.set),mr=at(info.set+2*36e5),out=[];
 if(sr%15===10)out.push({type:'ekadashi',sub:sr<15?'வளர்பிறை':'தேய்பிறை'});
 if(ss%15===12)out.push({type:'pradosham',sub:ss<15?'வளர்பிறை':'தேய்பிறை'});
 if(mr===18)out.push({type:'sankashti',sub:'தேய்பிறை'});
 if(sr===3)out.push({type:'chaturthi',sub:''});
 if(sr%15===5)out.push({type:'shashti',sub:sr<15?'வளர்பிறை':'தேய்பிறை'});
 if(info.nak===2)out.push({type:'krithigai',sub:'நட்சத்திரம்'});
 if(sr===14)out.push({type:'pournami',sub:''});
 if(sr===29)out.push({type:'amavasai',sub:''});
 return out.map(e=>({...e,date:key,...TYPES[e.type]}));
};
let spanDays=45;
function specialPage(){
 const today=lk(),on=get('bkSpecialRemind',{}),list=[];
 for(let i=0;i<spanDays;i++)list.push(...dayEvents(addDays(today,i)));
 const chips=Object.keys(TYPES).map(t=>`<button class="pp-chip bk-rem ${on[t]?'on':''}" data-bk-rem="${t}">${on[t]?'🔔':'🔕'} ${TYPES[t].n}</button>`).join('');
 const rows=list.length?list.map(e=>`<div class="bk-row"><div class="bk-ic">${e.ic}</div><div class="bk-main"><b>${esc(e.n)}${e.sub?` <small>· ${esc(e.sub)}</small>`:''}</b><small>${fmtDate(e.date)}${e.date===today?' · இன்று':''}</small><p>${esc(e.d)}</p></div></div>`).join(''):'<div class="empty">இந்த காலத்தில் எதுவும் இல்லை</div>';
 const fest=FEST2027.filter(f=>f[0]>=today).map(f=>`<div class="bk-row"><div class="bk-ic">🪔</div><div class="bk-main"><b>${esc(f[1])}</b><small>${fmtLong(f[0])}</small><p>${esc(f[2])}</p></div></div>`).join('');
 return `${MB.header('Special Days','ஏகாதசி, பிரதோஷம், சதுர்த்தி மற்றும் பல.')}
 <div class="card feature-card"><div class="eyebrow">REMINDERS · இன்று / முதல் நாள்</div><div class="pp-chips">${chips}</div><small class="feature-note">தேர்ந்தெடுத்த நாளுக்கு முதல் நாளும் அன்றும் நினைவூட்டும் (app திறந்திருக்கும் போது).</small></div>
 <div class="section-head"><h2>வரவிருக்கும் நாட்கள்</h2><span class="chip">${spanDays} நாட்கள்</span></div>
 <div class="card bk-list">${rows}<button class="btn soft full" data-bk-more>+ மேலும் 45 நாட்கள்</button></div>
 ${fest?`<div class="section-head"><h2>2027 பண்டிகைகள்</h2></div><div class="card bk-list">${fest}</div>`:''}
 <p class="feature-note">தேதிகள் பஞ்சாங்க கணக்கீட்டின் அடிப்படையிலானவை (சூரிய உதயம்/அஸ்தமன நேர திதி). ஊர் மற்றும் வழக்கப்படி ஒரு நாள் வேறுபடலாம்; உள்ளூர் பஞ்சாங்கத்தில் உறுதிசெய்யவும்.</p>`;
}
MB.pages.specialDays=specialPage;
document.addEventListener('click',async e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.bkRem){const on=get('bkSpecialRemind',{}),t=b.dataset.bkRem;on[t]=!on[t];set('bkSpecialRemind',on);
  if(on[t]&&'Notification'in window&&Notification.permission==='default'){try{await Notification.requestPermission()}catch{}}
  MB.render();toast(on[t]?'Reminder on':'Reminder off');return}
 if(b.dataset.bkMore!==undefined){spanDays+=45;MB.render();return}
});
function checkSpecial(){
 const on=get('bkSpecialRemind',{});if(!Object.values(on).some(Boolean))return;
 const today=lk(),fired=get('bkSpecialFired',{});let ch=false;
 for(const off of[0,1])for(const e of dayEvents(addDays(today,off))){
  if(!on[e.type])continue;const fk=e.type+e.date+off;if(fired[fk])continue;
  const msg=`${off?'நாளை':'இன்று'} ${e.n} 🙏`;
  if('Notification'in window&&Notification.permission==='granted')new Notification('Mithra Bhakti',{body:msg,tag:fk});else toast(msg);
  fired[fk]=1;ch=true;
 }
 if(ch){for(const k of Object.keys(fired))if(k.slice(-11,-1)<addDays(today,-30))delete fired[k];set('bkSpecialFired',fired)}
}
setTimeout(checkSpecial,3500);document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkSpecial()});setInterval(checkSpecial,600000);

/* menu entry (added next to the existing Devotional Tools; nothing is replaced) */
function addSpecialMenu(){
 if(MB.state.page!=='more')return;
 const list=$('#pageContent .feature-menu');if(!list||list.querySelector('[data-go="specialDays"]'))return;
 list.insertAdjacentHTML('beforeend','<button data-go="specialDays"><span>🌙</span><div><b>Special Days</b><small>Ekadashi, Pradosham, Chaturthi</small></div>›</button>');
}

/* ---------- 3) Synced (karaoke) lyrics ---------- */
const SY={on:false,idx:0,times:[]};let lastIdx=-1;
const syncStore=()=>get('bhaktiSync',{});
const curTrack=()=>MB.player&&MB.player.current&&MB.player.current();
const lines=()=>[...document.querySelectorAll('#ppLyricsSheet .pp-lyrics-body .ln')];
const audioEl=()=>$('#mbPersistentAudio');
function barHtml(){
 const t=curTrack(),has=t&&(syncStore()[String(t.id)]||[]).length;
 if(SY.on)return `<div class="bk-sync-bar"><button type="button" class="btn gold bk-tap" data-bk="tap">👆 வரி ஆரம்பம் · ${SY.idx+1}/${lines().length}</button><button type="button" class="pp-chip" data-bk="cancel">Cancel</button></div>`;
 return `<div class="bk-sync-bar"><button type="button" class="pp-chip" data-bk="start">⏱ ${has?'Re-sync':'Sync lyrics'}</button>${has?'<button type="button" class="pp-chip" data-bk="clear">✕ Clear sync</button><small>Synced ✓</small>':''}</div>`;
}
function decorate(){
 const sh=$('#ppLyricsSheet');if(!sh){SY.on=false;return}
 if(!sh.querySelector('.pp-lyrics-body')){SY.on=false;return}
 if(sh.querySelector('.bk-sync-bar'))return;
 const act=sh.querySelector('.pp-sheet-actions');if(act)act.insertAdjacentHTML('beforebegin',barHtml());
 lastIdx=-1;
}
function refreshBar(){$('#ppLyricsSheet .bk-sync-bar')?.remove();decorate()}
function mark(i,L){L=L||lines();L.forEach((el,j)=>el.classList.toggle('bk-on',j===i));const el=L[i];if(el)el.scrollIntoView({block:'center',behavior:'smooth'})}
function onTime(){
 if(SY.on||!$('#ppLyricsSheet'))return;
 const t=curTrack(),a=audioEl();if(!t||!a)return;
 const times=syncStore()[String(t.id)],L=lines();if(!times||!L.length||times.length!==L.length)return;
 const now=a.currentTime+.15;let idx=-1;for(let i=0;i<times.length;i++){if(times[i]<=now)idx=i;else break}
 if(idx!==lastIdx){lastIdx=idx;mark(idx,L)}
}
function hookAudio(){const a=audioEl();if(a&&!a._bk){a._bk=1;a.addEventListener('timeupdate',onTime)}}
function tap(){
 const a=audioEl(),L=lines();if(!SY.on||!a||!L.length)return;
 SY.times[SY.idx]=Math.max(0,a.currentTime);mark(SY.idx,L);SY.idx++;
 if(SY.idx>=L.length){
  const t=curTrack(),all=syncStore();if(t){all[String(t.id)]=SY.times.slice();set('bhaktiSync',all)}
  SY.on=false;lastIdx=-1;toast('Sync saved ✓');
 }
 refreshBar();
}
document.addEventListener('pointerdown',e=>{if(e.target.closest('[data-bk="tap"]')){e.preventDefault();tap()}});
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-bk]');if(!b)return;const k=b.dataset.bk;
 if(k==='tap')return;
 const a=audioEl();
 if(k==='start'){
  if(!a||!a.src||!lines().length){toast('முதலில் track-ஐ play செய்யவும்');return}
  SY.on=true;SY.idx=0;SY.times=[];lastIdx=-1;a.currentTime=0;a.play().catch(()=>{});lines().forEach(l=>l.classList.remove('bk-on'));refreshBar();
  toast('பாடல் தொடங்கியது · ஒவ்வொரு வரி தொடங்கும் போதும் Tap செய்யவும்');return;
 }
 if(k==='cancel'){SY.on=false;lines().forEach(l=>l.classList.remove('bk-on'));refreshBar();return}
 if(k==='clear'){const t=curTrack(),all=syncStore();if(t){delete all[String(t.id)];set('bhaktiSync',all)}lines().forEach(l=>l.classList.remove('bk-on'));refreshBar();toast('Sync cleared')}
});
let pend=false;
new MutationObserver(()=>{if(pend)return;pend=true;requestAnimationFrame(()=>{pend=false;decorate();hookAudio()})}).observe(document.body,{childList:true,subtree:true});

/* ---------- hook into the existing render cycle ---------- */
const prevAfter=MB.after;
MB.after=()=>{prevAfter&&prevAfter();renderJapam();addSpecialMenu()};
})();

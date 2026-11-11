/* Mithra Bhakti — Bhakti Extras (v1.7, additive; no existing file logic is replaced)
   1) Stotram / Mantra Library  2) Today's Deity  3) Daily Thirukkural  4) Japam upgrades (vibration, mantra chips, mantra totals)
   5) Share card (image)  6) Tamil month & year  7) Viratham tracker  8) Read aloud  9) ?go= shortcuts  10) Backup reminder
   Data keys (mb_ prefix, so Smart Backup includes them): bxSettings, bkMantras, bxMantraTotals, bxViratham, bxFirstSeen,
   bxLastBackup, bxBackupSnooze */
(()=>{
'use strict';
const MB=window.MB;if(!MB)return;
const $=s=>document.querySelector(s),get=MB.get,set=MB.set,esc=MB.esc,toast=MB.toast;
const DAY=86400000;
const lk=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const toDate=k=>{const[y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d)};
const dayNum=k=>Math.floor(Date.UTC(...(k||lk()).split('-').map((v,i)=>i===1?Number(v)-1:Number(v)))/DAY);
const nl=s=>esc(s).replace(/\n/g,'<br>');
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const settings=()=>({vibrate:true,...get('bxSettings',{})});

/* ---------- data ---------- */
const KURALS=[
 {n:1,ta:'அகர முதல எழுத்தெல்லாம் ஆதி பகவன் முதற்றே உலகு',en:'As A is the first of all letters, the Primal Lord is the first of the world.'},
 {n:2,ta:'கற்றதனால் ஆய பயனென்கொல் வாலறிவன் நற்றாள் தொழாஅர் எனின்',en:'What is all learning worth if one does not bow at the feet of the One of pure wisdom?'},
 {n:3,ta:'மலர்மிசை ஏகினான் மாணடி சேர்ந்தார் நிலமிசை நீடுவாழ் வார்',en:'Those who reach the glorious feet of the One who dwells in the heart’s lotus will live long on earth.'},
 {n:4,ta:'வேண்டுதல் வேண்டாமை இலானடி சேர்ந்தார்க்கு யாண்டும் இடும்பை இல',en:'Those who reach the feet of the One free of desire and aversion never face sorrow.'},
 {n:5,ta:'இருள்சேர் இருவினையும் சேரா இறைவன் பொருள்சேர் புகழ்புரிந்தார் மாட்டு',en:'The two kinds of dark karma do not touch those who delight in praising the Lord’s true glory.'},
 {n:6,ta:'பொறிவாயில் ஐந்தவித்தான் பொய்தீர் ஒழுக்க நெறிநின்றார் நீடுவாழ் வார்',en:'Those who follow the pure path of the One who mastered the five senses will live long.'},
 {n:7,ta:'தனக்குவமை இல்லாதான் தாள்சேர்ந்தார்க் கல்லால் மனக்கவலை மாற்றல் அரிது',en:'Only at the feet of the One without equal can the mind’s worries be removed.'},
 {n:8,ta:'அறவாழி அந்தணன் தாள்சேர்ந்தார்க் கல்லால் பிறவாழி நீந்தல் அரிது',en:'Only those at the feet of the Lord of dharma can cross the other seas of life.'},
 {n:9,ta:'கோளில் பொறியில் குணமிலவே எண்குணத்தான் தாளை வணங்காத் தலை',en:'A head that does not bow to the One of eight virtues is like a sense organ that does not work.'},
 {n:10,ta:'பிறவிப் பெருங்கடல் நீந்துவர் நீந்தார் இறைவன் அடிசேரா தார்',en:'Only those who reach the Lord’s feet can swim the great sea of births.'}
];
const TM=[['Thai','தை',1,14],['Maasi','மாசி',2,13],['Panguni','பங்குனி',3,14],['Chithirai','சித்திரை',4,14],['Vaikasi','வைகாசி',5,15],['Aani','ஆனி',6,15],['Aadi','ஆடி',7,17],['Aavani','ஆவணி',8,17],['Purattasi','புரட்டாசி',9,17],['Aippasi','ஐப்பசி',10,18],['Karthigai','கார்த்திகை',11,17],['Margazhi','மார்கழி',12,16]];
const TY_EN=['Prabhava','Vibhava','Sukla','Pramodoota','Prajotpatti','Angirasa','Srimukha','Bhava','Yuva','Dhatu','Isvara','Bahudhanya','Pramathi','Vikrama','Vrisha','Chitrabhanu','Subhanu','Tarana','Parthiva','Vyaya','Sarvajit','Sarvadhari','Virodhi','Vikruti','Khara','Nandana','Vijaya','Jaya','Manmatha','Durmukhi','Hevilambi','Vilambi','Vikari','Sarvari','Plava','Subhakrit','Sobhakrit','Krodhi','Visvavasu','Parabhava','Plavanga','Kilaka','Saumya','Sadharana','Virodhikrit','Paridhavi','Pramadicha','Ananda','Rakshasa','Nala','Pingala','Kalayukti','Siddharthi','Raudri','Durmati','Dundubhi','Rudhirodgari','Raktakshi','Krodhana','Akshaya'];
const TY_TA=['பிரபவ','விபவ','சுக்ல','பிரமோதூத','பிரஜோத்பத்தி','ஆங்கீரச','ஸ்ரீமுக','பவ','யுவ','தாது','ஈஸ்வர','பகுதான்ய','பிரமாதி','விக்கிரம','விஷு','சித்திரபானு','சுபானு','தாரண','பார்த்திப','விய','சர்வஜித்','சர்வதாரி','விரோதி','விகிருதி','கர','நந்தன','விஜய','ஜய','மன்மத','துன்முகி','ஹேவிளம்பி','விளம்பி','விகாரி','சார்வரி','பிலவ','சுபகிருது','சோபகிருது','குரோதி','விசுவாவசு','பராபவ','பிலவங்க','கீலக','சௌமிய','சாதாரண','விரோதிகிருது','பரிதாபி','பிரமாதீச','ஆனந்த','ராட்சச','நள','பிங்கள','காளயுக்தி','சித்தார்த்தி','ரௌத்திரி','துன்மதி','துந்துபி','ருதிரோத்காரி','ரக்தாட்சி','குரோதன','அட்சய'];
/* Approximate solar-month starts (sankranti shifts by about a day between years). Verify with your local panchangam. */
function tamilDate(key){
 const dt=toDate(key||lk()),y=dt.getFullYear(),t=dt.getTime();
 const starts=[];for(const yy of[y-1,y,y+1])for(const m of TM)starts.push({m,t:new Date(yy,m[2]-1,m[3]).getTime()});
 starts.sort((a,b)=>a.t-b.t);let cur=starts[0];for(const s of starts){if(s.t<=t)cur=s;else break}
 const day=Math.round((t-cur.t)/DAY)+1,ty=t>=new Date(y,3,14).getTime()?y:y-1,i=(((ty-2018+31)%60)+60)%60;
 return{day,en:cur.m[0],ta:cur.m[1],yEn:TY_EN[i],yTa:TY_TA[i]};
}
const WEEK=[
 {en:'Surya (Sun)',ta:'ஞாயிறு · சூரிய வழிபாடு',match:[]},
 {en:'Shiva',ta:'திங்கள் · சிவ வழிபாடு',match:['Shiva']},
 {en:'Murugan',ta:'செவ்வாய் · முருகன் வழிபாடு',match:['Murugan']},
 {en:'Perumal (Vishnu)',ta:'புதன் · பெருமாள் வழிபாடு',match:['Perumal']},
 {en:'Guru · Sai Baba',ta:'வியாழன் · குரு வழிபாடு',match:['Sai Baba']},
 {en:'Amman · Lakshmi',ta:'வெள்ளி · அம்மன் வழிபாடு',match:['Amman']},
 {en:'Hanuman · Perumal · Ayyappan',ta:'சனி · அனுமன் / பெருமாள் வழிபாடு',match:['Hanuman','Perumal','Ayyappan']}
];
const STOTRAMS=[
 {t:'விநாயகர் வெண்பா (ஔவையார்)',d:'Vinayagar',c:'Stotram',ta:'வாக்குண்டாம் நல்ல மனமுண்டாம் மாமலராள்\nநோக்குண்டாம் மேனி நுடங்காது பூக்கொண்டு\nதுப்பார் திருமேனித் தும்பிக்கையான் பாதம்\nதப்பாமல் சார்வார் தமக்கு',tr:'Vaakkundaam nalla manamundaam maamalaraal / Nokkundaam meni nudangaadhu pookkondu / Thuppaar thirumeni thumbikkaiyaan paadham / Thappaamal saarvaar thamakku',m:'Those who faithfully take refuge at the feet of the elephant-faced Lord, offering flowers, gain eloquence, a good mind, Lakshmi’s grace and a healthy body.'},
 {t:'கந்த சஷ்டி கவசம் — காப்புப் பாடல்',d:'Murugan',c:'Stotram',ta:'துதிப்போர்க்கு வல்வினை போம் துன்பம் போம் நெஞ்சில்\nபதிப்போர்க்குச் செல்வம் பலித்துக் கதித்தோங்கும்\nநிஷ்டையுங் கைகூடும் நிமலரருள் கந்தர்\nசஷ்டி கவசந் தனை',tr:'Thuthipporkku valvinai pom thunbam pom nenjil / Pathipporkkuch chelvam palithuk kathithongum / Nishtaiyum kaikoodum nimalararul kandhar / Sashti kavacham thanai',m:'Opening invocation only. Those who recite the Kavacham lose heavy karma and sorrow, and gain prosperity and success in meditation by Kandhan’s grace.'},
 {t:'அஞ்சிலே ஒன்று பெற்றான் (அனுமன் துதி)',d:'Hanuman',c:'Stotram',ta:'அஞ்சிலே ஒன்று பெற்றான் அஞ்சிலே ஒன்றைத் தாவி\nஅஞ்சிலே ஒன்றா றாக ஆருயிர் காக்கச் சென்றான்\nஅஞ்சிலே ஒன்று பெற்ற அணங்கைக்கண் டயலார் ஊரில்\nஅஞ்சிலே ஒன்று வைத்தான் அவன் நம்மை அளித்துக் காப்பான்',tr:'Anjile ondru petraan anjile ondrai thaavi / Anjile ondru aaraaga aaruyir kaakka chendraan / Anjile ondru petra anangaik kandu ayalaar ooril / Anjile ondru vaithaan avan nammai aliththuk kaappaan',m:'A Kamba Ramayanam verse praising Hanuman: son of the Wind, who crossed the sea, found Sita and set Lanka ablaze. May he protect us.'},
 {t:'ஓம் நமசிவாய',d:'Shiva',c:'Slokam',ta:'ஓம் நமசிவாய',tr:'Om Namah Shivaya',m:'I bow to Shiva.'},
 {t:'ஓம் நமோ நாராயணாய',d:'Perumal',c:'Slokam',ta:'ஓம் நமோ நாராயணாய',tr:'Om Namo Narayanaya',m:'I bow to Narayana (Vishnu).'},
 {t:'ஓம் சரவணபவ',d:'Murugan',c:'Slokam',ta:'ஓம் சரவணபவ',tr:'Om Saravanabhava',m:'The six-syllable mantra of Murugan.'},
 {t:'ஓம் கம் கணபதயே நமஹ',d:'Vinayagar',c:'Slokam',ta:'ஓம் கம் கணபதயே நமஹ',tr:'Om Gam Ganapataye Namaha',m:'I bow to Lord Ganapati.'},
 {t:'சுவாமியே சரணம் ஐயப்பா',d:'Ayyappan',c:'Slokam',ta:'சுவாமியே சரணம் ஐயப்பா',tr:'Swamiye Saranam Ayyappa',m:'Lord Ayyappa, I take refuge in you.'},
 {t:'ஓம் ஹனுமதே நமஹ',d:'Hanuman',c:'Slokam',ta:'ஓம் ஹனுமதே நமஹ',tr:'Om Hanumate Namaha',m:'I bow to Hanuman.'},
 {t:'ஓம் சக்தி பராசக்தி',d:'Amman',c:'Slokam',ta:'ஓம் சக்தி பராசக்தி',tr:'Om Shakti Parashakti',m:'Salutations to the Supreme Power.'},
 {t:'ஓம் ஸ்ரீ ஸாய்ராம்',d:'Sai Baba',c:'Slokam',ta:'ஓம் ஸ்ரீ ஸாய்ராம்',tr:'Om Sri Sairam',m:'Salutations to Sai Baba.'},
 {t:'காயத்ரி மந்திரம்',d:'Other',c:'Slokam',ta:'ஓம் பூர்ப்புவஸ்ஸுவ:\nதத் ஸவிதுர் வரேண்யம்\nபர்கோ தேவஸ்ய தீமஹி\nதியோ யோ ந: ப்ரசோதயாத்',tr:'Om Bhur Bhuvaswaha / Tat Savitur Varenyam / Bhargo Devasya Dheemahi / Dhiyo Yo Nah Prachodayat',m:'We meditate on the radiant light of the divine Sun; may it inspire our intellect.'},
 {t:'மகா மிருத்யுஞ்ஜய மந்திரம்',d:'Shiva',c:'Slokam',ta:'ஓம் த்ர்யம்பகம் யஜாமஹே\nசுகந்திம் புஷ்டிவர்தனம்\nஉர்வாருகமிவ பந்தனான்\nம்ருத்யோர் முக்ஷீய மாம்ருதாத்',tr:'Om Tryambakam Yajamahe / Sugandhim Pushtivardhanam / Urvarukamiva Bandhanan / Mrityor Mukshiya Mamritat',m:'We worship the three-eyed Lord, fragrant and nourishing. May he free us from bondage like a ripe cucumber from its vine, and grant immortality.'}
];
const DEFAULT_MANTRAS=['சுவாமியே சரணம் ஐயப்பா','ஓம் நமசிவாய','ஓம் நமோ நாராயணாய','ஓம் சரவணபவ','ஓம் கம் கணபதயே நமஹ','ஓம் ஹனுமதே நமஹ'];
const VTYPES=[['Ekadashi','ஏகாதசி'],['Pradosham','பிரதோஷம்'],['Sankashti','சங்கடஹர சதுர்த்தி'],['Sashti','சஷ்டி'],['Pournami','பௌர்ணமி'],['Amavasai','அமாவாசை'],['Karthigai','கார்த்திகை'],['Other','மற்றவை']];

/* ---------- helpers ---------- */
const tdLabel=k=>{const t=tamilDate(k);return{ta:`${t.day} ${t.ta} · ${t.yTa} வருடம்`,en:`${t.en} ${t.day}, ${t.yEn} year`,t}};
const deityToday=()=>WEEK[new Date().getDay()];
const kuralToday=()=>KURALS[((dayNum()%KURALS.length)+KURALS.length)%KURALS.length];
function japamStreak(){const all=get('japamCounts',{}),c=k=>Number(all[k]&&all[k].count)||0,sh=(k,n)=>{const d=toDate(k);d.setDate(d.getDate()+n);return lk(d)};let k=lk();if(!c(k))k=sh(k,-1);let n=0;while(c(k)>0&&n<400){n++;k=sh(k,-1)}return n}
const japamToday=()=>Number((get('japamCounts',{})[lk()]||{}).count)||0;

/* ---------- 1) Stotram library ---------- */
function libraryPage(){
 const have=new Set(get('songs',[]).map(s=>s.title));
 return `${MB.header('Stotram Library','சிறிய பாடல்கள் & மந்திரங்கள் — ஒரு தட்டலில் உங்கள் Songs-ல் சேர்க்கலாம்.')}
 ${STOTRAMS.map((s,i)=>`<section class="card bx-lib"><div class="bx-lib-head"><b>${esc(s.t)}</b><span class="bx-tag">${esc(s.d)}</span></div>
 <div class="bx-ta">${nl(s.ta)}</div><small class="bx-tr">${esc(s.tr)}</small><p class="bx-m">${esc(s.m)}</p>
 <div class="bx-actions"><button class="btn ${have.has(s.t)?'soft':'gold'}" data-bx-addsong="${i}" ${have.has(s.t)?'disabled':''}>${have.has(s.t)?'✓ In your Songs':'+ Add to my Songs'}</button><button class="btn soft" data-bx-speak="lib-${i}">🔊 Read aloud</button></div></section>`).join('')}
 <p class="feature-note">Long texts (full Kavacham, Hanuman Chalisa, Sahasranamam) are not bundled, to avoid copying mistakes. Paste them from a trusted book in Songs → Add song.</p>`;
}
function addSong(i){
 const s=STOTRAMS[i];if(!s)return;const a=get('songs',[]);
 if(a.some(x=>x.title===s.t)){toast('Already in your Songs');return}
 a.push({id:uid(),fav:false,createdAt:new Date().toISOString(),title:s.t,lyrics:s.ta,deity:s.d,category:s.c,mediaId:''});
 set('songs',a);MB.render();toast('Added to Songs & Lyrics');
}

/* ---------- 7) Viratham tracker ---------- */
function virathamPage(){
 const log=get('bxViratham',[]),today=lk(),ym=today.slice(0,7),yr=today.slice(0,4);
 const monthN=log.filter(x=>x.date.startsWith(ym)).length,yearN=log.filter(x=>x.date.startsWith(yr)).length;
 const per=VTYPES.map(([en,ta])=>({en,ta,n:log.filter(x=>x.type===en).length})).filter(x=>x.n);
 const hist=[...log].sort((a,b)=>b.date.localeCompare(a.date)||0).slice(0,15);
 const ta=t=>(VTYPES.find(v=>v[0]===t)||[t,t])[1];
 return `${MB.header('Viratham Tracker','விரதம் இருந்த நாட்களைக் குறித்து வையுங்கள்.')}
 <section class="card bx-card"><div class="eyebrow">KEPT TODAY? · இன்று விரதம்</div><div class="bx-chips">${VTYPES.map(([en,tn])=>`<button class="bx-chip" data-bx-vlog="${en}">${tn}<small>${en}</small></button>`).join('')}</div>
 <div class="bx-stats"><span>This month <b>${monthN}</b></span><span>This year <b>${yearN}</b></span><span>All time <b>${log.length}</b></span></div>
 ${per.length?`<div class="bx-per">${per.map(x=>`<span class="bx-tag">${esc(x.ta)} · ${x.n}</span>`).join('')}</div>`:''}</section>
 <div class="section-head"><h2>Recent</h2></div>
 <section class="card bx-card">${hist.length?hist.map(x=>`<div class="bx-hrow"><div><b>${esc(ta(x.type))}</b><small>${esc(x.type)} · ${esc(x.date)}</small></div><button class="text-btn" data-bx-vdel="${esc(x.id)}">Delete</button></div>`).join(''):'<p class="muted">No viratham logged yet. Tap a type above on the day you keep it.</p>'}</section>
 <p class="feature-note">Dates are only what you log. Check your local panchangam for the actual viratham days.</p>`;
}
function logViratham(type){
 const a=get('bxViratham',[]),d=lk();
 if(a.some(x=>x.type===type&&x.date===d)){toast('Already logged for today');return}
 a.push({id:uid(),type,date:d});set('bxViratham',a);MB.render();toast('Viratham logged');
}

MB.pages.stotramLibrary=libraryPage;
MB.pages.virathamTracker=virathamPage;

/* ---------- 5) Share card ---------- */
function wrap(x,text,maxW){const out=[];let line='';for(const w of String(text).split(/\s+/)){const t=line?line+' '+w:w;if(x.measureText(t).width>maxW&&line){out.push(line);line=w}else line=t}if(line)out.push(line);return out}
async function makeCard(blocks){
 try{await document.fonts.load('700 40px "Noto Sans Tamil"');await document.fonts.load('400 40px "Noto Sans Tamil"')}catch{}
 const W=1080,H=1080,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d'),F='"Noto Sans Tamil",sans-serif';
 const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'#211633');g.addColorStop(1,'#51336f');x.fillStyle=g;x.fillRect(0,0,W,H);
 x.strokeStyle='#d6ad58';x.lineWidth=6;x.strokeRect(36,36,W-72,H-72);x.lineWidth=2;x.strokeRect(56,56,W-112,H-112);
 x.textAlign='center';x.textBaseline='alphabetic';
 x.fillStyle='#f0d99e';x.font=`700 70px ${F}`;x.fillText('✦',W/2,160);
 x.fillStyle='#d6ad58';x.font=`700 36px ${F}`;x.fillText('MITHRA BHAKTI',W/2,215);
 const rows=[];let total=0;
 for(const b of blocks){x.font=`${b.w||400} ${b.s}px ${F}`;for(const l of wrap(x,b.t,W-240)){rows.push({l,b});total+=b.s*1.5}total+=b.gap||18}
 let y=Math.max(300,(H+230-total)/2);
 for(const r of rows){x.font=`${r.b.w||400} ${r.b.s}px ${F}`;x.fillStyle=r.b.c||'#fff';y+=r.b.s;x.fillText(r.l,W/2,y);y+=r.b.s*.5}
 x.fillStyle='#d6ad58';x.font=`400 26px ${F}`;x.fillText('Mithra Bhakti · உங்கள் பக்தி உலகம்',W/2,H-90);
 return new Promise(res=>c.toBlob(res,'image/png'));
}
async function shareBlob(blob,name,text){
 if(!blob){toast('Could not create the card');return}
 const file=new File([blob],name,{type:'image/png'});
 if(navigator.canShare&&navigator.canShare({files:[file]})){
  try{await navigator.share({files:[file],title:'Mithra Bhakti',text});return}catch(e){if(e&&e.name==='AbortError')return}
 }
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);toast('Card saved to downloads');
}
async function shareToday(){
 const t=tdLabel(),k=kuralToday(),d=deityToday(),n=japamToday(),st=japamStreak();
 const blocks=[{t:new Date().toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long',year:'numeric'}),s:38,c:'#f0d99e',gap:10},{t:t.ta,s:50,w:700,gap:26},{t:d.ta,s:40,c:'#f0d99e',gap:26}];
 if(n>0||st>0)blocks.push({t:`ஜபம் இன்று ${n} · தொடர் ${st} நாள்`,s:38,gap:26});
 blocks.push({t:k.ta,s:36,c:'#f0d99e',gap:10},{t:`திருக்குறள் ${k.n}`,s:28,c:'#d6ad58'});
 await shareBlob(await makeCard(blocks),`mithra-bhakti-${lk()}.png`,'Mithra Bhakti');
}
async function shareGreeting(){
 const msg=await MB.dialog.prompt('வாழ்த்து வாசகம் (Greeting text)','இனிய நல்வாழ்த்துகள்',{title:'Greeting card'});
 if(!msg||!msg.trim())return;
 await shareBlob(await makeCard([{t:msg.trim(),s:64,w:700,gap:34},{t:tdLabel().ta,s:34,c:'#f0d99e'}]),`mithra-greeting-${lk()}.png`,msg.trim());
}
async function shareJapam(){
 const n=japamToday(),st=japamStreak(),m=($('#japamMantra')?.value||'').trim();
 const blocks=[{t:'ஜபம்',s:44,c:'#f0d99e',gap:20}];if(m)blocks.push({t:m,s:52,w:700,gap:30});
 blocks.push({t:`இன்று ${n} · ${Math.floor(n/108)} மாலை`,s:46,gap:20},{t:`தொடர் ${st} நாள்`,s:36,c:'#f0d99e'});
 await shareBlob(await makeCard(blocks),`mithra-japam-${lk()}.png`,'Japam today');
}

/* ---------- 8) Read aloud ---------- */
let speaking=false;
function stopSpeak(){try{speechSynthesis.cancel()}catch{}speaking=false}
function speak(text){
 if(!('speechSynthesis' in window)){toast('Read aloud is not supported in this browser');return}
 if(speaking||speechSynthesis.speaking){stopSpeak();toast('Stopped');return}
 const u=new SpeechSynthesisUtterance(text),v=(speechSynthesis.getVoices()||[]).find(x=>/^ta/i.test(x.lang));
 u.lang='ta-IN';u.rate=.85;if(v)u.voice=v;else toast('No Tamil voice found on this device; it may sound unclear');
 u.onend=u.onerror=()=>{speaking=false};speaking=true;speechSynthesis.speak(u);
}

/* ---------- 4) Japam upgrades ---------- */
const allMantras=()=>[...new Set([...DEFAULT_MANTRAS,...get('bkMantras',[])])];
function totalsHtml(){
 const t=get('bxMantraTotals',{}),rows=Object.entries(t).filter(([,n])=>n>0).sort((a,b)=>b[1]-a[1]).slice(0,8);
 return rows.length?rows.map(([m,n])=>`<div class="bx-hrow"><div><b>${esc(m)}</b><small>${Math.floor(n/108)} மாலை</small></div><b>${n}</b></div>`).join(''):'<p class="muted">Start counting; each mantra’s total will show here.</p>';
}
function japamPanel(){
 if(MB.state.page!=='japam'||$('#bxJapam'))return;
 const host=$('#pageContent .japam-card'),cur=($('#japamMantra')?.value||'').trim(),s=settings();
 const sec=document.createElement('section');sec.id='bxJapam';sec.className='card bx-card';
 sec.innerHTML=`<div class="eyebrow">MANTRA · மந்திரம் தேர்வு</div><div class="bx-chips">${allMantras().map((m,i)=>`<button class="bx-chip ${m===cur?'on':''}" data-bx-mantra="${i}">${esc(m)}</button>`).join('')}<button class="bx-chip" data-bx-mantra-add>+ Add</button></div>
 <div class="feature-row" style="margin-top:12px"><div><b>Vibration on count</b><small>Short buzz each +1, long buzz at every 108</small></div><label class="switch"><input id="bxVibrate" type="checkbox" ${s.vibrate?'checked':''}><span></span></label></div>
 <div class="eyebrow" style="margin-top:14px">MANTRA TOTALS · lifetime tally</div><div id="bxMantraList">${totalsHtml()}</div>
 <button class="btn soft full" data-bx-share="japam" style="margin-top:10px">Share japam card</button>`;
 if(host)host.insertAdjacentElement('afterend',sec);else $('#pageContent')?.append(sec);
}
function pickMantra(m){
 const inp=$('#japamMantra');if(inp)inp.value=m;
 const all=get('japamCounts',{}),d=lk(),v=all[d]||{count:0,mantra:m};v.mantra=m;all[d]=v;set('japamCounts',all);
 document.querySelectorAll('[data-bx-mantra]').forEach(b=>b.classList.toggle('on',b.textContent===m));
}

/* ---------- Home / Calendar / Menu / Backup banner ---------- */
function backupDays(){
 const last=get('bxLastBackup',null),first=get('bxFirstSeen',null)||lk();
 return{never:!last,days:dayNum()-dayNum(last||first)};
}
function backupBanner(){
 const sn=get('bxBackupSnooze','');if(sn&&sn>lk())return '';
 const b=backupDays();if(b.days<7)return '';
 return `<section class="card bx-banner" id="bxBackup"><div><b>${b.never?'You have not made a backup yet':`Last backup was ${b.days} days ago`}</b><small>Your songs, japam and notes live only on this device.</small></div><div class="bx-actions"><button class="btn gold" data-bx-backup="now">Back up</button><button class="btn soft" data-bx-backup="later">Later</button></div></section>`;
}
function homeCard(){
 const t=tdLabel(),k=kuralToday(),d=deityToday(),songs=get('songs',[]).filter(s=>d.match.includes(s.deity)).slice(0,3);
 return `${backupBanner()}<section class="card bx-card" id="bxHome">
 <div class="eyebrow">TODAY · இன்றைய நாள்</div><div class="bx-big">${esc(t.ta)}</div><small class="muted">${esc(t.en)} (approx.)</small>
 <div class="bx-sep"></div><div class="eyebrow">TODAY’S WORSHIP · ${esc(d.en)}</div><div>${esc(d.ta)}</div>
 ${songs.length?`<div class="bx-chips">${songs.map(s=>`<button class="bx-chip" data-bx-song="${esc(s.id)}">♪ ${esc(s.title)}</button>`).join('')}</div>`:`<small class="muted">Add songs with this deity to see suggestions here.</small>`}
 <div class="bx-sep"></div><div class="eyebrow">THIRUKKURAL ${k.n} · கடவுள் வாழ்த்து</div><div class="bx-kural">${esc(k.ta)}</div><small class="muted">${esc(k.en)}</small>
 <div class="bx-actions" style="margin-top:12px"><button class="btn gold" data-bx-share="today">Share today’s card</button><button class="btn soft" data-bx-share="greeting">Greeting card</button></div>
 <div class="bx-actions"><button class="btn soft" data-go="stotramLibrary">Stotram Library</button><button class="btn soft" data-go="virathamTracker">Viratham</button></div></section>`;
}
function inject(){
 const p=MB.state.page,root=$('#pageContent');if(!root)return;
 if(p!=='song'&&p!=='stotramLibrary'&&speaking)stopSpeak();
 if(p==='dashboard'&&!$('#bxHome')){const q=root.querySelector('.quote-card');if(q)q.insertAdjacentHTML('afterend',homeCard())}
 if(p==='calendar'&&!$('#bxCal')){const t=tdLabel(MB.state.selectedDate||lk()),el=document.createElement('section');el.id='bxCal';el.className='card bx-card';el.innerHTML=`<div class="eyebrow">TAMIL DATE · தமிழ் நாள்</div><div class="bx-big">${esc(t.ta)}</div><small class="muted">${esc(t.en)} (approx., verify with your panchangam)</small>`;const pc=$('#pancCard');if(pc)pc.insertAdjacentElement('beforebegin',el);else{const f=root.querySelector(':scope > .card');if(f)f.insertAdjacentElement('afterend',el)}}
 if(p==='japam')japamPanel();
 if(p==='song'&&!$('#bxSpeakSong')){const ly=$('#lyrics');if(ly)ly.insertAdjacentHTML('beforebegin','<button class="btn soft bx-speak" id="bxSpeakSong" data-bx-speak="song">🔊 Read aloud</button>')}
 if(p==='more'&&!root.querySelector('[data-go="stotramLibrary"]')){
  const items='<button data-go="stotramLibrary"><span>🕉</span><div><b>Stotram Library</b><small>Mantras & short stotrams</small></div>›</button><button data-go="virathamTracker"><span>🌙</span><div><b>Viratham Tracker</b><small>Log your viratham days</small></div>›</button>';
  const fm=root.querySelector('.feature-menu');
  if(fm)fm.insertAdjacentHTML('beforeend',items);
  else{const s=document.createElement('section');s.innerHTML=`<div class="section-head"><h2>Devotional Tools</h2></div><div class="more-list card feature-menu">${items}</div>`;root.append(s)}
 }
}
const prevAfter=MB.after;MB.after=()=>{prevAfter&&prevAfter();try{inject()}catch(e){console.error('Bhakti Extras',e)}};

/* ---------- events ---------- */
document.addEventListener('click',async e=>{
 const b=e.target.closest('button');if(!b)return;
 const d=b.dataset;
 if(d.japam&&d.japam!=='reset'){ // runs after the existing japam handler has saved the new count
  const m=($('#japamMantra')?.value||'').trim(),n=d.japam==='108'?108:1;
  if(m){const t=get('bxMantraTotals',{});t[m]=(Number(t[m])||0)+n;set('bxMantraTotals',t);const l=$('#bxMantraList');if(l)l.innerHTML=totalsHtml()}
  if(settings().vibrate&&navigator.vibrate){const c=japamToday();try{navigator.vibrate(d.japam==='108'||(c>0&&c%108===0)?[80,50,80,50,160]:15)}catch{}}
  return;
 }
 if(d.bxAddsong!==undefined){addSong(Number(d.bxAddsong));return}
 if(d.bxVlog){logViratham(d.bxVlog);return}
 if(d.bxVdel){if(await MB.dialog.confirm('Delete this viratham entry?',{title:'Delete entry',confirmText:'Delete',danger:true})){set('bxViratham',get('bxViratham',[]).filter(x=>x.id!==d.bxVdel));MB.render()}return}
 if(d.bxShare){d.bxShare==='today'?shareToday():d.bxShare==='greeting'?shareGreeting():shareJapam();return}
 if(d.bxSpeak){
  if(d.bxSpeak==='song')speak(($('#lyrics')?.innerText||'').trim()||'');
  else{const i=Number(String(d.bxSpeak).replace('lib-',''));if(STOTRAMS[i])speak(STOTRAMS[i].ta.replace(/\n/g,'. '))}
  return;
 }
 if(d.bxMantra!==undefined){pickMantra(allMantras()[Number(d.bxMantra)]);return}
 if(d.bxMantraAdd!==undefined){
  const m=((await MB.dialog.prompt('Mantra name','',{title:'Add mantra'}))||'').trim();if(!m)return;
  const a=get('bkMantras',[]);if(!allMantras().includes(m)){a.push(m);set('bkMantras',a)}
  MB.render();setTimeout(()=>pickMantra(m),0);return;
 }
 if(d.bxSong){MB.state.songId=d.bxSong;MB.go('song');return}
 if(d.bxBackup==='now'){MB.go('settings');return}
 if(d.bxBackup==='later'){const x=toDate(lk());x.setDate(x.getDate()+3);set('bxBackupSnooze',lk(x));$('#bxBackup')?.remove();return}
 // back-up detection (existing buttons are left untouched)
 if(d.smartBackup==='export'){
  const prev=get('smartBackupLast',''),t0=Date.now(),iv=setInterval(()=>{if(get('smartBackupLast','')!==prev){set('bxLastBackup',lk());clearInterval(iv)}else if(Date.now()-t0>90000)clearInterval(iv)},3000);
  return;
 }
 if(d.action==='backup'){set('bxLastBackup',lk());return}
});
document.addEventListener('change',e=>{if(e.target.id==='bxVibrate'){const s=settings();s.vibrate=e.target.checked;set('bxSettings',s);if(s.vibrate&&navigator.vibrate)try{navigator.vibrate(30)}catch{}}});

/* ---------- 9) shortcuts (?go=page) + first-run date ---------- */
if(!get('bxFirstSeen',null))set('bxFirstSeen',lk());
try{
 const g=new URLSearchParams(location.search).get('go');
 if(g&&['japam','advancedMusic','calendar','dailyBhakti','songs','stotramLibrary','virathamTracker'].includes(g)){MB.go(g);history.replaceState(null,'',location.pathname)}
}catch{}
})();

/* Mithra Bhakti — Panchangam add-on (Bengaluru)
   Nalla neram / Ketta neram, Gowri Panchangam, Tithi / Nakshatram, Rasi palan (Chandra Balam).
   Fully offline: computed from Sun/Moon positions + sunrise/sunset. Injected into the Calendar page only. */
(()=>{
const MB=window.MB;if(!MB)return;
const IST=330,LAT=12.9716,LON=77.5946,rad=Math.PI/180,norm=x=>((x%360)+360)%360;
const jdOf=ms=>ms/86400000+2440587.5;

/* ---------- astronomy ---------- */
function sunLon(jd){const T=(jd-2451545)/36525,L0=280.46646+36000.76983*T,M=(357.52911+35999.05029*T)*rad;
 const C=(1.914602-.004817*T)*Math.sin(M)+(.019993-.000101*T)*Math.sin(2*M)+.000289*Math.sin(3*M);
 const om=(125.04-1934.136*T)*rad;return norm(L0+C-.00569-.00478*Math.sin(om))}
const MT=[[6288774,0,0,1,0],[1274027,2,0,-1,0],[658314,2,0,0,0],[213618,0,0,2,0],[-185116,0,1,0,0],[-114332,0,0,0,2],[58793,2,0,-2,0],[57066,2,-1,-1,0],[53322,2,0,1,0],[45758,2,-1,0,0],[-40923,0,1,-1,0],[-34720,1,0,0,0],[-30383,0,1,1,0],[15327,2,0,0,-2],[-12528,0,0,1,2],[10980,0,0,1,-2],[10675,4,0,-1,0],[10034,0,0,3,0],[8548,4,0,-2,0],[-7888,2,1,-1,0],[-6766,2,1,0,0],[-5163,1,0,-1,0],[4987,1,1,0,0],[4036,2,-1,1,0],[3994,2,0,2,0],[3861,4,0,0,0],[3665,2,0,-3,0]];
function moonLon(jd){const T=(jd-2451545)/36525;
 const Lp=218.3164477+481267.88123421*T,D=(297.8501921+445267.1114034*T)*rad,M=(357.5291092+35999.0502909*T)*rad,Mp=(134.9633964+477198.8675055*T)*rad,F=(93.272095+483202.0175233*T)*rad;
 let s=0;for(const[c,d,m,mp,f]of MT)s+=c*Math.sin(d*D+m*M+mp*Mp+f*F);
 s+=3958*Math.sin((119.75+131.849*T)*rad)+1962*Math.sin((Lp-(93.272095+483202.0175233*T))*rad)+318*Math.sin((53.09+479264.29*T)*rad);
 return norm(Lp+s/1e6)}
const ayan=jd=>23.8531+.013969*(jd-2451545)/365.25; // Lahiri
const sidMoon=ms=>{const jd=jdOf(ms);return norm(moonLon(jd)-ayan(jd))};
const elong=ms=>{const jd=jdOf(ms);return norm(moonLon(jd)-sunLon(jd))};

function sunEvent(utc0,rise,guess){const jd=jdOf(guess),T=(jd-2451545)/36525,L0=norm(280.46646+36000.76983*T),M=357.52911+35999.05029*T,e=.016708634-.000042037*T;
 const C=(1.914602-.004817*T)*Math.sin(M*rad)+(.019993-.000101*T)*Math.sin(2*M*rad)+.000289*Math.sin(3*M*rad);
 const om=125.04-1934.136*T,lam=L0+C-.00569-.00478*Math.sin(om*rad);
 const eps=23+(26+(21.448-T*(46.815+T*(.00059-T*.001813)))/60)/60+.00256*Math.cos(om*rad);
 const decl=Math.asin(Math.sin(eps*rad)*Math.sin(lam*rad))/rad,y=Math.tan(eps*rad/2)**2;
 const eq=4/rad*(y*Math.sin(2*L0*rad)-2*e*Math.sin(M*rad)+4*e*y*Math.sin(M*rad)*Math.cos(2*L0*rad)-.5*y*y*Math.sin(4*L0*rad)-1.25*e*e*Math.sin(2*M*rad));
 const ha=Math.acos(Math.cos(90.833*rad)/(Math.cos(LAT*rad)*Math.cos(decl*rad))-Math.tan(LAT*rad)*Math.tan(decl*rad))/rad;
 return 720-4*(LON+(rise?ha:-ha))-eq}
function sunTimes(key){const[y,m,d]=key.split("-").map(Number),u=Date.UTC(y,m-1,d),out={};
 for(const rise of[true,false]){let t=u+sunEvent(u,rise,u+(rise?60:720)*6e4)*6e4;t=u+sunEvent(u,rise,t)*6e4;out[rise?"rise":"set"]=t}
 return out}

/* next time fn(t) changes its integer value */
function nextChange(fn,from,maxH=60){const v0=fn(from),step=20*6e4;let a=from,b=from;
 for(let i=0;i<maxH*3;i++){b=a+step;if(fn(b)!==v0)break;a=b}
 if(fn(b)===v0)return null;
 while(b-a>30000){const mid=(a+b)/2;if(fn(mid)===v0)a=mid;else b=mid}
 return{t:b,next:fn(b+60000)}}

/* ---------- names (Tamil) ---------- */
const WD=["ஞாயிறு","திங்கள்","செவ்வாய்","புதன்","வியாழன்","வெள்ளி","சனி"];
const TH=["பிரதமை","துவிதியை","திருதியை","சதுர்த்தி","பஞ்சமி","சஷ்டி","சப்தமி","அஷ்டமி","நவமி","தசமி","ஏகாதசி","துவாதசி","திரயோதசி","சதுர்த்தசி"];
const tithiName=i=>i===14?"பௌர்ணமி":i===29?"அமாவாசை":TH[i%15];
const tithiPaksha=i=>i<15?"வளர்பிறை":"தேய்பிறை";
const NK=["அசுவினி","பரணி","கார்த்திகை","ரோகிணி","மிருகசீரிடம்","திருவாதிரை","புனர்பூசம்","பூசம்","ஆயில்யம்","மகம்","பூரம்","உத்திரம்","அஸ்தம்","சித்திரை","சுவாதி","விசாகம்","அனுஷம்","கேட்டை","மூலம்","பூராடம்","உத்திராடம்","திருவோணம்","அவிட்டம்","சதயம்","பூரட்டாதி","உத்திரட்டாதி","ரேவதி"];
const RS=["மேஷம்","ரிஷபம்","மிதுனம்","கடகம்","சிம்மம்","கன்னி","துலாம்","விருச்சிகம்","தனுசு","மகரம்","கும்பம்","மீனம்"];
const RAHU=[8,2,7,5,6,4,3],YAMA=[5,4,3,2,1,7,6],KULI=[7,6,5,4,3,2,1]; // 1-based part of the day, Sun..Sat
const GOWRI={Amirdham:"அமிர்தம்",Uthi:"உத்தி",Rogam:"ரோகம்",Labam:"லாபம்",Dhanam:"தனம்",Sugam:"சுகம்",Soram:"சோரம்",Visham:"விஷம்"};
const GT=[["Uthi","Amirdham","Rogam","Labam","Dhanam","Sugam","Soram","Visham"],
["Amirdham","Visham","Rogam","Labam","Dhanam","Sugam","Soram","Uthi"],
["Rogam","Labam","Dhanam","Sugam","Soram","Uthi","Amirdham","Visham"],
["Labam","Dhanam","Sugam","Soram","Uthi","Amirdham","Visham","Rogam"],
["Dhanam","Sugam","Soram","Uthi","Amirdham","Visham","Rogam","Labam"],
["Sugam","Soram","Uthi","Amirdham","Visham","Rogam","Labam","Dhanam"],
["Soram","Uthi","Amirdham","Visham","Rogam","Labam","Dhanam","Sugam"]];
const GGOOD=["Amirdham","Labam","Dhanam","Sugam"],GBAD=["Rogam","Soram","Visham"];
const GOOD_H=[1,3,6,7,10,11],AVG_H=[2,5,9];
const HTXT={
1:"சந்திரன் உங்கள் ராசியிலேயே — மனம் தெளிவாக இருக்கும். புதிய முயற்சிகளை தொடங்க நல்ல நாள்.",
2:"பேச்சில் நிதானம் தேவை. செலவுகள் சற்று கூடலாம்; பெரிய முடிவுகளை தள்ளிப் போடுங்கள்.",
3:"தைரியமும் உற்சாகமும் கூடும். உடன்பிறந்தோர், நண்பர்களால் உதவி கிடைக்கும்.",
4:"மனதில் சிறு அமைதியின்மை இருக்கலாம். வீடு, வாகனம் தொடர்பான விஷயங்களில் கவனம் தேவை.",
5:"எண்ணங்களில் குழப்பம் வரலாம். முக்கிய முடிவுகளுக்கு பெரியோர் ஆலோசனை நல்லது.",
6:"தடைகள் விலகும். பணியிலும் உடல்நலத்திலும் முன்னேற்றம் தெரியும்.",
7:"துணை, கூட்டாளிகளால் ஆதரவு. சந்திப்புகள், ஒப்பந்தங்களுக்கு ஏற்ற நாள்.",
8:"சந்திராஷ்டமம் — முக்கிய முடிவுகள், புதிய முயற்சிகள், நீண்ட பயணத்தை தவிருங்கள். பொறுமையுடன் இறை வழிபாடு செய்யுங்கள்.",
9:"சாதாரண நாள். அதிக எதிர்பார்ப்பைத் தவிர்த்து வழக்கமான பணிகளைச் செய்யுங்கள்.",
10:"தொழில், வேலையில் வெற்றி. எடுத்த காரியம் நிறைவேறும்.",
11:"லாபமும் மகிழ்ச்சியும் கூடும். நினைத்த காரியம் கைகூடும்.",
12:"செலவு, அலைச்சல் கூடலாம். ஓய்வும் தியானமும் தேவை."};
const houseKind=h=>GOOD_H.includes(h)?"good":AVG_H.includes(h)?"avg":"bad";
const KLABEL={good:"நல்ல நாள்",avg:"சுமாரான நாள்",bad:"கவனம் தேவை"};
const houseLabel=h=>h===8?"சந்திராஷ்டமம்":KLABEL[houseKind(h)];

/* ---------- formatting ---------- */
const istKey=ms=>{const d=new Date(ms+IST*6e4);return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}-${String(d.getUTCDate()).padStart(2,"0")}`};
function fmt(ms,key){const d=new Date(ms+IST*6e4);let h=d.getUTCHours();const m=String(d.getUTCMinutes()).padStart(2,"0"),ap=h>=12?"PM":"AM";h=h%12||12;
 return `${h}:${m} ${ap}${key&&istKey(ms)!==key?" (மறுநாள்)":""}`}
const range=(a,b,key)=>`${fmt(a,key)} – ${fmt(b,key)}`;
const lk=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
function nextKey(key){const[y,m,d]=key.split("-").map(Number);return istKey(Date.UTC(y,m-1,d+1)-IST*6e4+12*36e5)}

/* ---------- day computation ---------- */
const cache={};
function dayInfo(key){if(cache[key])return cache[key];
 const[y,m,d]=key.split("-").map(Number),wd=new Date(Date.UTC(y,m-1,d)).getUTCDay(),st=sunTimes(key),part=(st.set-st.rise)/8;
 const slot=n=>[st.rise+(n-1)*part,st.rise+n*part],mid=(st.rise+st.set)/2,half=(st.set-st.rise)/30;
 const info={key,wd,rise:st.rise,set:st.set,part,rahu:slot(RAHU[wd]),yama:slot(YAMA[wd]),kuli:slot(KULI[wd]),
  rahuN:RAHU[wd],yamaN:YAMA[wd],kuliN:KULI[wd],abhijit:wd===3?null:[mid-half,mid+half]};
 info.gowri=GT[wd].map((n,i)=>{const[a,b]=slot(i+1);return{n,a,b,i:i+1,kind:GBAD.includes(n)?"bad":GGOOD.includes(n)?"good":"mid"}});
 const e=elong(st.rise),sm=sidMoon(st.rise);
 info.tithi=Math.floor(e/12);info.nak=Math.floor(sm/(360/27));info.rasi=Math.floor(sm/30);
 info.tithiEnd=nextChange(t=>Math.floor(elong(t)/12),st.rise);
 info.nakEnd=nextChange(t=>Math.floor(sidMoon(t)/(360/27)),st.rise);
 info.rasiEnd=nextChange(t=>Math.floor(sidMoon(t)/30),st.rise);
 info.nextRise=sunTimes(nextKey(key)).rise;
 return cache[key]=info}

/* ---------- card ---------- */
const dayLabel=key=>new Date(key+"T00:00:00").toLocaleDateString("en-US",{day:"numeric",month:"short",year:"numeric"});
const row=(label,sub,time,cls,now,tag)=>`<div class="panc-row ${cls} ${now?"now":""}"><div class="panc-lbl"><b>${label}</b>${sub?`<small>${sub}</small>`:""}</div><span class="panc-time">${time}</span>${tag?`<em>${tag}</em>`:""}</div>`;
const inR=(t,r)=>t>=r[0]&&t<r[1];

function rasiBlock(info){
 const mine=MB.get("myRasi",null),r0=info.rasi,hs=R=>((r0-R+12)%12)+1;
 const grid=`<div class="panc-rasis">${RS.map((n,i)=>`<button class="panc-rasi ${mine===i?"on":""}" data-panc-rasi="${i}">${n}</button>`).join("")}</div>`;
 if(mine===null||mine===undefined)return `<h3 class="panc-h">ராசி பலன் <small>Rasi palan</small></h3><p class="panc-sub">உங்கள் ராசியைத் தேர்வு செய்யுங்கள் (ஒரு முறை மட்டும்):</p>${grid}`;
 const h=hs(mine),k=houseKind(h);
 let after="";const ch=info.rasiEnd;
 if(ch&&ch.t<info.nextRise){const h2=((ch.next-mine+12)%12)+1;after=`<p class="panc-sub">🌙 ${fmt(ch.t,info.key)} முதல் சந்திரன் <b>${RS[ch.next]}</b> ராசிக்கு மாறுவார் → <b>${houseLabel(h2)}</b></p>`}
 const all=RS.map((n,i)=>{const hh=hs(i);return `<div class="panc-mini ${houseKind(hh)}"><b>${n}</b><span>${houseLabel(hh)}</span></div>`}).join("");
 return `<h3 class="panc-h">ராசி பலன் <small>Rasi palan</small></h3>
 <div class="panc-palan ${k}"><div class="panc-palan-top"><b>${RS[mine]}</b><span class="panc-badge ${k}">${houseLabel(h)}</span></div>
 <p>${HTXT[h]}</p><small>சந்திரன் ${RS[r0]} ராசியில் · உங்கள் ராசிக்கு ${h}-ம் இடம்</small>${after}</div>
 <details class="panc-more"><summary>12 ராசிகளுக்கும் இன்று</summary><div class="panc-minis">${all}</div></details>
 <button class="panc-link" data-panc-rasi="-1">ராசியை மாற்ற</button>
 <p class="panc-note">சந்திர பலன் (Chandra Balam) அடிப்படையிலான பொதுவான குறிப்பு. தனிப்பட்ட ஜாதகத்திற்கு மாறுபடலாம்.</p>`}

function buildCard(){
 const key=MB.state.selectedDate||lk(),info=dayInfo(key),isToday=key===lk(),now=isToday?Date.now():null;
 const bad=[["ராகு காலம்","Rahu Kalam",info.rahu],["எமகண்டம்","Yamagandam",info.yama],["குளிகை","Kuligai",info.kuli]];
 const nowBad=now&&bad.find(b=>inR(now,b[2]));
 let banner="";
 if(now){
  if(now<info.rise||now>=info.set)banner=`<div class="panc-now mid">🌙 இரவு நேரம் — பகல் நேர பஞ்சாங்கம் கீழே</div>`;
  else if(nowBad)banner=`<div class="panc-now bad">⚠ இப்போது ${nowBad[0]} — ${fmt(nowBad[2][1])} வரை தவிர்க்கவும்</div>`;
  else{const g=info.gowri.find(s=>inR(now,[s.a,s.b])),ab=info.abhijit&&inR(now,info.abhijit);
   banner=ab?`<div class="panc-now good">✨ இப்போது அபிஜித் முகூர்த்தம் — நல்ல நேரம்</div>`:g&&g.kind==="good"?`<div class="panc-now good">✅ இப்போது நல்ல நேரம் (${GOWRI[g.n]}) — ${fmt(g.b)} வரை</div>`:g&&g.kind==="bad"?`<div class="panc-now bad">⚠ இப்போது கௌரி: ${GOWRI[g.n]} — ${fmt(g.b)} வரை தவிர்க்கவும்</div>`:`<div class="panc-now mid">இப்போது சாதாரண நேரம் (${g?GOWRI[g.n]:""})</div>`}
 }
 const badRows=bad.map(b=>row(b[0],b[1],range(b[2][0],b[2][1]),"bad",now&&inR(now,b[2]))).join("");
 const badParts={[info.rahuN]:"ராகு",[info.yamaN]:"எமகண்டம்",[info.kuliN]:"குளிகை"};
 const best=info.gowri.filter(s=>s.kind==="good"&&!badParts[s.i]);
 const goodRows=(info.abhijit?row("அபிஜித் முகூர்த்தம்","Abhijit",range(info.abhijit[0],info.abhijit[1]),"good",now&&inR(now,info.abhijit)):row("அபிஜித் முகூர்த்தம்","Abhijit","இன்று இல்லை (புதன்)","mid",false))
  +best.map(s=>row(GOWRI[s.n],"Gowri · "+s.n,range(s.a,s.b),"good",now&&inR(now,[s.a,s.b]))).join("");
 const gtable=info.gowri.map(s=>row(GOWRI[s.n],s.n,range(s.a,s.b),s.kind,now&&inR(now,[s.a,s.b]),badParts[s.i]?badParts[s.i]+" நேரம்":"")).join("");
 const te=info.tithiEnd,ne=info.nakEnd;
 const tithi=row("திதி",tithiPaksha(info.tithi),`${tithiName(info.tithi)}${te?` · ${fmt(te.t,key)} வரை`:""}`,"mid",false)
  +(te?row("அடுத்த திதி","",tithiName(te.next),"mid",false):"");
 const nak=row("நட்சத்திரம்","",`${NK[info.nak]}${ne?` · ${fmt(ne.t,key)} வரை`:""}`,"mid",false)+(ne?row("அடுத்த நட்சத்திரம்","",NK[ne.next],"mid",false):"");
 const rem=MB.get("pancReminder",false);
 return `<section class="card panc" id="pancCard">
 <div class="panc-top"><div><div class="eyebrow">பஞ்சாங்கம் · Bengaluru</div><h2>${WD[info.wd]} · ${dayLabel(key)}</h2></div></div>
 <div class="panc-sun"><span>🌅 சூரிய உதயம் ${fmt(info.rise)}</span><span>🌇 அஸ்தமனம் ${fmt(info.set)}</span></div>
 ${banner}
 <h3 class="panc-h bad">கெட்ட நேரம் <small>Avoid</small></h3>${badRows}
 <h3 class="panc-h good">நல்ல நேரம் <small>Good time</small></h3>${goodRows}
 <details class="panc-more"><summary>கௌரி பஞ்சாங்கம் முழு பட்டியல் (பகல்)</summary>${gtable}</details>
 <h3 class="panc-h">இன்றைய பஞ்சாங்கம் <small>Tithi · Nakshatram</small></h3>${tithi}${nak}${row("சந்திரன் ராசி","",RS[info.rasi],"mid",false)}
 ${rasiBlock(info)}
 <button class="btn soft full panc-rem" data-panc-reminder="1">${rem?"🔔 ராகு காலம் நினைவூட்டல்: ON":"🔕 ராகு காலம் நினைவூட்டல் வேண்டுமா?"}</button>
 <p class="panc-note">நேரங்கள் Bengaluru சூரிய உதயம்/அஸ்தமனத்தை அடிப்படையாகக் கொண்டு கணக்கிடப்பட்டவை. ஊர், பஞ்சாங்கம் வழக்கப்படி சில நிமிடங்கள் மாறலாம்; முக்கிய காரியங்களுக்கு உள்ளூர் பஞ்சாங்கத்தில் உறுதிசெய்யவும். நினைவூட்டல் ஆப் திறந்திருக்கும்போது மட்டுமே வேலை செய்யும்.</p>
 </section>`}

/* ---------- hook into Calendar page only ---------- */
const prevAfter=MB.after;
MB.after=()=>{prevAfter&&prevAfter();
 if(MB.state.page!=="calendar"||MB.state.menuOpen||document.querySelector("#pancCard"))return;
 const first=MB.content.querySelector(":scope > .card");if(!first)return;
 try{first.insertAdjacentHTML("afterend",buildCard())}catch(e){console.error("Panchangam",e)}};

/* ---------- clicks ---------- */
document.addEventListener("click",async e=>{const b=e.target.closest("button");if(!b)return;
 if(b.dataset.pancRasi!==undefined){const v=Number(b.dataset.pancRasi);if(v<0)localStorage.removeItem("mb_myRasi");else MB.set("myRasi",v);MB.render();return}
 if(b.dataset.pancReminder){const on=!MB.get("pancReminder",false);
  if(on&&"Notification"in window&&Notification.permission==="default"){try{await Notification.requestPermission()}catch{}}
  MB.set("pancReminder",on);MB.render();MB.toast(on?"ராகு காலம் நினைவூட்டல் ON (10 நிமிடம் முன்)":"நினைவூட்டல் OFF");checkReminder()}
});

/* Rahu Kalam reminder: fires 10 min before it starts while the app is open */
function checkReminder(){if(!MB.get("pancReminder",false))return;const k=lk();if(MB.get("pancFired","")===k)return;
 const a=dayInfo(k).rahu[0],n=Date.now();
 if(n>=a-10*6e4&&n<a+5*6e4){const msg=`ராகு காலம் ${fmt(a)} க்கு தொடங்குகிறது`;
  if("Notification"in window&&Notification.permission==="granted"){try{new Notification("Mithra Bhakti · ராகு காலம்",{body:msg,tag:"rahu"})}catch{MB.toast(msg)}}else MB.toast(msg);
  MB.set("pancFired",k)}}
setInterval(checkReminder,30000);document.addEventListener("visibilitychange",()=>{if(!document.hidden)checkReminder()});
setTimeout(checkReminder,3000);

MB.panchang={dayInfo,fmt,sunTimes,tithiName,NK,RS};
})();

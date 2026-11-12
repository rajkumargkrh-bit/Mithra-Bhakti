const $=s=>document.querySelector(s);
const esc=t=>String(t??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const KEY='mithraBhakti.v1';
const CATS=['Murugan','Vinayagar','Sivan','Perumal','Amman'];
const T={
 en:{home:'Home',songs:'Songs',cal:'Calendar',japa:'Japa',set:'Settings',lyrics:'Lyrics'},
 ta:{home:'முகப்பு',songs:'பாடல்கள்',cal:'நாட்காட்டி',japa:'ஜபம்',set:'அமைப்பு',lyrics:'வரிகள்'}};
const SLOKAS=['ஓம் கம் கணபதயே நமஹ','ஓம் சரவணபவ','ஓம் நமசிவாய','ஓம் நமோ நாராயணாய','ஓம் சக்தி பராசக்தி','Work with devotion, results follow grace.','Where there is faith, there is peace.'];
const FEST=[['01-14','பொங்கல் / Pongal'],['04-14','தமிழ் புத்தாண்டு / Tamil New Year'],['2026-09-14','விநாயகர் சதுர்த்தி / Vinayagar Chaturthi'],['2026-11-08','தீபாவளி / Deepavali'],['2026-11-24','கார்த்திகை தீபம் / Karthigai Deepam (approx)']];
const seed=()=>({
 songs:[
  {id:1,title:'Vinayagar Mantra',cat:'Vinayagar',link:'',fav:1,lyrics:'ஓம் கம் கணபதயே நமஹ\nஓம் கம் கணபதயே நமஹ\nஓம் கம் கணபதயே நமஹ'},
  {id:2,title:'Murugan Mantra',cat:'Murugan',link:'',fav:0,lyrics:'ஓம் சரவணபவ\nஓம் சரவணபவ\nஓம் சரவணபவ'},
  {id:3,title:'Panchakshara',cat:'Sivan',link:'',fav:0,lyrics:'ஓம் நமசிவாய\nஓம் நமசிவாய\nஓம் நமசிவாய'}],
 events:[],
 set:{theme:matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light',font:20,lang:'ta'},
 ui:{screen:'home',songId:null,cat:'All',q:'',ym:null,day:null,scroll:0},
 japa:{n:0,r:0},recent:[],nid:10});

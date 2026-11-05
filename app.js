const $=s=>document.querySelector(s),dlg=$('#dlg');
const K='bhakti-book-v1',TY=['Festival','Vratham','Personal'];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Math.random().toString(36).slice(2,9);
const key=(y,m,d)=>y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
const today=()=>{const d=new Date();return key(d.getFullYear(),d.getMonth(),d.getDate())};
const DEF=()=>({books:[{id:'b1',title:'Vakratunda Mahakaya',cat:'Slokam',text:'வக்ரதுண்ட மஹாகாய\nசூர்யகோடி சமப்ரப\nநிர்விக்னம் குருமே தேவ\nசர்வ கார்யேஷு சர்வதா',fav:1}],videos:[],events:[],set:{theme:'',fs:22,last:''}});
let S;
try{S=JSON.parse(localStorage.getItem(K))}catch(e){}
S=Object.assign(DEF(),S||{});
const save=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch(e){toast('Could not save. Browser storage is blocked or full.')}};
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),2600)}
function applyTheme(){document.documentElement.dataset.theme=S.set.theme||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'')}

/* routing */
let view='home';
const V={home:vHome,books:vBooks,videos:vVids,cal:vCal,more:vMore};
function go(v){location.hash=v}
const PC=['--c1','--c2','--c3','--c4','--c5','--c6'];
const cc=s=>{let h=0;for(const ch of String(s||''))h=(h*31+ch.charCodeAt(0))>>>0;return 'var('+PC[h%6]+')'};
function render(){
  document.body.dataset.view=view;
  document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.v==view));
  $('main').innerHTML=V[view]();
  if(view=='books')lstB();
  if(view=='videos')lstV();
}
addEventListener('hashchange',()=>{view=location.hash.slice(1);if(!V[view])view='home';render();scrollTo(0,0)});

/* dialogs */
let timer=0,wl=null;
function cleanup(){clearInterval(timer);timer=0;try{wl&&wl.release()}catch(e){}wl=null}
dlg.addEventListener('close',()=>{cleanup();dlg.innerHTML='';render()});
function form(title,fields,vals,cb,del){
  cleanup();dlg.className='';
  dlg.innerHTML='<form id="f"><h2 style="margin-top:0">'+title+'</h2>'+fields.map(f=>'<label>'+f.l+(f.t=='area'
    ?'<textarea name="'+f.k+'" rows="10" '+(f.r?'required':'')+'>'+esc(vals[f.k])+'</textarea>'
    :f.t=='sel'?'<select name="'+f.k+'">'+f.o.map(o=>'<option '+(o==vals[f.k]?'selected':'')+'>'+o+'</option>').join('')+'</select>'
    :'<input name="'+f.k+'" type="'+(f.t||'text')+'" value="'+esc(vals[f.k])+'" '+(f.r?'required':'')+'>')+'</label>').join('')
    +'<div class="row end" style="border:0;padding:0;background:none"><button type="button" class="ghost" onclick="dlg.close()">Cancel</button>'
    +(del?'<button type="button" class="ghost danger" id="del">Delete</button>':'')+'<button class="pri">Save</button></div></form>';
  $('#f').onsubmit=e=>{e.preventDefault();cb(Object.fromEntries(new FormData(e.target)));save();dlg.close()};
  if(del)$('#del').onclick=()=>{if(confirm('Delete this item?')){del();save();dlg.close()}};
  if(!dlg.open)dlg.showModal();
}

/* home */
function evRow(e){return '<button class="row" style="--rc:'+['var(--c1)','var(--c4)','var(--c3)'][Math.max(0,TY.indexOf(e.type))]+'" onclick="editE(\''+e.id+'\')"><u class="t'+Math.max(0,TY.indexOf(e.type))+'"></u><span><b>'+esc(e.title)+'</b><small>'+e.date+', '+esc(e.type)+'</small></span></button>'}
function vHome(){
  const d=new Date(),t=today(),ev=S.events.filter(e=>e.date==t),
    up=S.events.filter(e=>e.date>t).sort((a,b)=>a.date<b.date?-1:1).slice(0,4),
    last=S.books.find(b=>b.id==S.set.last),favs=S.books.filter(b=>b.fav).slice(0,4);
  return '<section class="hero"><div>'+d.toLocaleDateString('en-IN',{weekday:'long'})+'</div><div class="big">'+d.getDate()+'</div><div>'+d.toLocaleDateString('en-IN',{month:'long',year:'numeric'})+'</div></section>'
  +'<div class="tiles"><button class="tile k1" onclick="go(\'books\')">Books<b>'+S.books.length+'</b></button><button class="tile k2" onclick="go(\'videos\')">Videos<b>'+S.videos.length+'</b></button><button class="tile k3" onclick="go(\'cal\')">Events<b>'+S.events.length+'</b></button></div>'
  +'<h2>Today</h2>'+(ev.length?ev.map(evRow).join(''):'<p class="mut">No events today. Add one in Calendar.</p>')
  +(last?'<h2>Continue reading</h2><button class="card b" style="--cc:'+cc(last.cat)+'" onclick="read(\''+last.id+'\')"><b>'+esc(last.title)+'</b><div class="pv">'+esc(last.text.split('\n')[0])+'</div></button>':'')
  +'<h2>Coming up</h2>'+(up.length?up.map(evRow).join(''):'<p class="mut">Nothing scheduled.</p>')
  +'<h2>Favourites</h2>'+(favs.length?'<div class="grid">'+favs.map(b=>'<button class="card b" style="--cc:'+cc(b.cat)+'" onclick="read(\''+b.id+'\')"><b>'+esc(b.title)+'</b> <span class="tag">'+esc(b.cat)+'</span></button>').join('')+'</div>':'<p class="mut">Tap the star inside a book to pin it here.</p>');
}

/* books */
let fb='All',sb='',CB=[];
const BF=[{k:'title',l:'Title',r:1},{k:'cat',l:'Category (Bhajan, Slokam, Stotram)',r:1},{k:'text',l:'Tamil text',t:'area',r:1}];
function vBooks(){return '<div class="bar"><h2>God books</h2><button class="pri" onclick="addB()">Add book</button></div><input id="sb" placeholder="Search books" value="'+esc(sb)+'" oninput="sb=this.value;lstB()"><div class="chips" id="ch"></div><div class="grid" id="lst"></div>'}
function lstB(){
  CB=['All',...new Set(S.books.map(b=>b.cat))];
  $('#ch').innerHTML=CB.map((c,i)=>'<button class="chip '+(c==fb?'on':'')+'" onclick="fb=CB['+i+'];lstB()">'+esc(c)+'</button>').join('');
  const s=sb.toLowerCase(),r=S.books.filter(b=>(fb=='All'||b.cat==fb)&&(b.title+b.text).toLowerCase().includes(s));
  $('#lst').innerHTML=r.length?r.map(b=>'<button class="card b" style="--cc:'+cc(b.cat)+'" onclick="read(\''+b.id+'\')"><b>'+(b.fav?'★ ':'')+esc(b.title)+'</b> <span class="tag">'+esc(b.cat)+'</span><div class="pv">'+esc(b.text.split('\n')[0])+'</div></button>').join(''):'<p class="mut">No books found. Use Add book to paste a Tamil text.</p>';
}
function addB(){form('Add book',BF,{cat:fb=='All'?'Bhajan':fb},v=>{S.books.unshift(Object.assign({id:uid()},v))})}
function editB(id){const b=S.books.find(x=>x.id==id);form('Edit book',BF,b,v=>Object.assign(b,v),()=>{S.books=S.books.filter(x=>x.id!=id)})}
function favB(id){const b=S.books.find(x=>x.id==id);b.fav=b.fav?0:1;save();$('#fv').textContent=b.fav?'★':'☆'}
function read(id){
  const b=S.books.find(x=>x.id==id);S.set.last=id;save();cleanup();
  dlg.className='full';
  dlg.innerHTML='<div class="rh"><button class="ghost" onclick="dlg.close()">Back</button><b>'+esc(b.title)+'</b><button class="ghost" id="fv" onclick="favB(\''+id+'\')">'+(b.fav?'★':'☆')+'</button></div>'
  +'<div class="rb" id="rb" style="font-size:'+S.set.fs+'px">'+esc(b.text)+'</div>'
  +'<div class="rf"><button class="ghost" onclick="fsz(-2)">A−</button><button class="ghost" onclick="fsz(2)">A+</button><button class="ghost" id="as" onclick="auto()">Auto-scroll</button><input type="range" id="sp" min="1" max="5" value="2" aria-label="Scroll speed"><button class="ghost" onclick="editB(\''+id+'\')">Edit</button></div>';
  dlg.showModal();
  try{navigator.wakeLock&&navigator.wakeLock.request('screen').then(l=>wl=l).catch(()=>{})}catch(e){}
}
function fsz(d){S.set.fs=Math.min(48,Math.max(14,S.set.fs+d));save();$('#rb').style.fontSize=S.set.fs+'px'}
function auto(){
  const b=$('#as');
  if(timer){clearInterval(timer);timer=0;b.textContent='Auto-scroll';return}
  let acc=0;b.textContent='Stop';
  timer=setInterval(()=>{acc+=$('#sp').value*0.25;if(acc>=1){$('#rb').scrollBy(0,1);acc-=1}},25);
}

/* videos */
let fv='All',sv='',CV=[];
const VF=[{k:'title',l:'Title',r:1},{k:'url',l:'YouTube link',t:'url',r:1},{k:'tag',l:'Tag (Murugan, Ganesha, Amman)'}];
const ytid=u=>{const m=String(u).match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/);return m&&m[1]};
function vVids(){return '<div class="bar"><h2>Music videos</h2><button class="pri" onclick="addV()">Add video</button></div><input placeholder="Search videos" value="'+esc(sv)+'" oninput="sv=this.value;lstV()"><div class="chips" id="ch"></div><div class="grid vg" id="lst"></div>'}
function lstV(){
  CV=['All',...new Set(S.videos.map(v=>v.tag).filter(Boolean))];
  $('#ch').innerHTML=CV.map((c,i)=>'<button class="chip '+(c==fv?'on':'')+'" onclick="fv=CV['+i+'];lstV()">'+esc(c)+'</button>').join('');
  const s=sv.toLowerCase(),r=S.videos.filter(v=>(fv=='All'||v.tag==fv)&&v.title.toLowerCase().includes(s));
  $('#lst').innerHTML=r.length?r.map(v=>'<button class="card v" style="--cc:'+cc(v.tag)+'" onclick="play(\''+v.id+'\')"><img loading="lazy" alt="" src="https://img.youtube.com/vi/'+v.yt+'/mqdefault.jpg"><div><b>'+esc(v.title)+'</b><br>'+(v.tag?'<span class="tag">'+esc(v.tag)+'</span>':'')+'</div></button>').join(''):'<p class="mut">No videos yet. Use Add video and paste a YouTube link.</p>';
}
function fixV(v){const y=ytid(v.url);if(!y){toast('That link is not a YouTube video');return false}v.yt=y;return true}
function addV(){form('Add video',VF,{},v=>{if(fixV(v))S.videos.unshift(Object.assign({id:uid()},v))})}
function editV(id){const o=S.videos.find(x=>x.id==id);form('Edit video',VF,o,v=>{if(fixV(v))Object.assign(o,v)},()=>{S.videos=S.videos.filter(x=>x.id!=id)})}
function play(id){
  const v=S.videos.find(x=>x.id==id);cleanup();dlg.className='';
  dlg.innerHTML='<div class="vf"><iframe src="https://www.youtube-nocookie.com/embed/'+v.yt+'?autoplay=1" allow="autoplay; encrypted-media; fullscreen" allowfullscreen title="'+esc(v.title)+'"></iframe></div><h3>'+esc(v.title)+'</h3><div class="row end" style="border:0;padding:0;background:none"><button class="ghost" onclick="editV(\''+id+'\')">Edit</button><button class="pri" onclick="dlg.close()">Close</button></div>';
  dlg.showModal();
}

/* calendar */
const n0=new Date();let cal={y:n0.getFullYear(),m:n0.getMonth(),sel:today()};
const EF=[{k:'title',l:'Event',r:1},{k:'type',l:'Type',t:'sel',o:TY},{k:'date',l:'Date',t:'date',r:1},{k:'note',l:'Note'}];
function vCal(){
  const {y,m}=cal,f=new Date(y,m,1).getDay(),n=new Date(y,m+1,0).getDate();
  let c=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>'<b>'+d+'</b>').join('');
  for(let i=0;i<f;i++)c+='<i></i>';
  for(let d=1;d<=n;d++){
    const k=key(y,m,d),ev=S.events.filter(e=>e.date==k);
    c+='<button class="day '+(k==today()?'today':'')+' '+(k==cal.sel?'sel':'')+'" onclick="selD(\''+k+'\')">'+d+'<span>'+ev.slice(0,3).map(e=>'<u class="t'+Math.max(0,TY.indexOf(e.type))+'"></u>').join('')+'</span></button>';
  }
  const list=S.events.filter(e=>e.date==cal.sel);
  return '<div class="bar"><h2>Calendar</h2><button class="pri" onclick="addE()">Add event</button></div><div class="mon"><button class="ghost" onclick="mon(-1)" aria-label="Previous month">‹</button><h2 style="margin:0">'+new Date(y,m,1).toLocaleDateString('en-IN',{month:'long',year:'numeric'})+'</h2><button class="ghost" onclick="mon(1)" aria-label="Next month">›</button></div>'
  +'<div class="cal">'+c+'</div>'
  +'<h2>'+new Date(cal.sel+'T00:00:00').toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})+'</h2>'
  +(list.length?list.map(evRow).join(''):'<p class="mut">Nothing on this day.</p>')
  +'<div class="legend"><span><u class="t0"></u>Festival</span><span><u class="t1"></u>Vratham</span><span><u class="t2"></u>Personal</span></div>';
}
function selD(k){cal.sel=k;render()}
function mon(d){cal.m+=d;if(cal.m<0){cal.m=11;cal.y--}if(cal.m>11){cal.m=0;cal.y++}render()}
function addE(){form('Add event',EF,{type:'Festival',date:cal.sel},v=>{S.events.push(Object.assign({id:uid()},v))})}
function editE(id){const e=S.events.find(x=>x.id==id);form('Edit event',EF,e,v=>Object.assign(e,v),()=>{S.events=S.events.filter(x=>x.id!=id)})}

/* more */
function vMore(){
  const t=S.set.theme;
  return '<h2>Theme</h2><div class="chips">'+[['','Auto'],['light','Light'],['dark','Dark']].map(a=>'<button class="chip '+(t==a[0]?'on':'')+'" onclick="setT(\''+a[0]+'\')">'+a[1]+'</button>').join('')+'</div>'
  +'<h2>Backup</h2><p class="mut">Your data lives only in this browser. Download a backup before clearing browser data or switching phones.</p>'
  +'<div class="row end" style="border:0;padding:0;background:none;justify-content:flex-start"><button class="pri" onclick="exp()">Download backup</button><label class="ghost" style="margin:0;padding:9px 16px;border:1px solid var(--line);border-radius:10px;cursor:pointer;color:var(--ink)">Restore backup<input type="file" accept=".json" hidden onchange="imp(this.files[0])"></label></div>'
  +'<h2>Reset</h2><button class="ghost danger" onclick="if(confirm(\'Erase all books, videos and events on this device?\')){S=DEF();save();render();toast(\'All data erased\')}">Erase all data</button>';
}
function setT(t){S.set.theme=t;save();applyTheme();render()}
function exp(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:'application/json'}));a.download='bhakti-book-backup.json';a.click()}
function imp(f){
  if(!f)return;const r=new FileReader();
  r.onload=()=>{try{const d=JSON.parse(r.result);if(!Array.isArray(d.books))throw 0;S=Object.assign(DEF(),d);save();applyTheme();render();toast('Backup restored')}catch(e){toast('That file is not a valid backup')}};
  r.readAsText(f);
}

applyTheme();
view=location.hash.slice(1);if(!V[view])view='home';
render();

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}

let S;
try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){}
S=Object.assign(seed(),S||{});
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const tr=k=>T[S.set.lang][k];
const view=$('#view');
let auto=null;

function go(screen,extra){
 clearInterval(auto);auto=null;
 Object.assign(S.ui,{screen},extra||{});
 S.ui.scroll=0;save();
 try{history.replaceState(null,'','#'+screen)}catch(e){}
 render();
}
function render(restore){
 document.documentElement.dataset.theme=S.set.theme;
 const sc=S.ui.screen;
 const items=[['home','🏠',tr('home')],['songs','🎵',tr('songs')],['cal','📅',tr('cal')],['japa','📿',tr('japa')],['set','⚙️',tr('set')]];
 $('#nav').innerHTML=items.map(([k,i,l])=>`<button data-go="${k}" class="${(sc===k||(sc==='lyrics'&&k==='songs'))?'on':''}"><b>${i}</b>${l}</button>`).join('');
 view.style.animation='none';view.offsetHeight;view.style.animation='';
 ({home,songs,lyrics,cal,japa,set})[sc]();
 if(restore)view.scrollTop=S.ui.scroll||0; else view.scrollTop=0;
}

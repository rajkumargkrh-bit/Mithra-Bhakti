function mod(h){$('#mbody').innerHTML=h;$('#modal').classList.add('on')}
function closeMod(){$('#modal').classList.remove('on')}

/* events */

document.addEventListener('click',e=>{
 const t=e.target.closest('[data-go],[data-open],[data-fav],[data-cat],[data-add],[data-edit],[data-save],[data-del],[data-close],[data-fs],[data-copy],[data-share],[data-day],[data-mo],[data-addev],[data-delev],[data-jreset],[data-set],[data-exp],[data-imp],[data-clr],[data-saveev],#as');
 if(!t)return;const D=t.dataset;
 if(D.go)return go(D.go);
 if(D.open)return go('lyrics',{songId:+D.open});
 if(D.fav){const s=S.songs.find(x=>x.id==D.fav);s.fav=s.fav?0:1;save();e.stopPropagation();return render(true)}
 if(D.cat){S.ui.cat=D.cat;save();return render()}
 if(D.add!==undefined)return songForm();
 if(D.edit)return songForm(+D.edit);
 if(D.close!==undefined)return closeMod();
 if(D.save!==undefined){const v=i=>$('#'+i).value.trim();if(!v('f1'))return alert('Title?');const id=+D.save;
  if(id){Object.assign(S.songs.find(x=>x.id===id),{title:v('f1'),cat:v('f2'),link:v('f3'),lyrics:$('#f4').value})}
  else S.songs.push({id:S.nid++,title:v('f1'),cat:v('f2'),link:v('f3'),lyrics:$('#f4').value,fav:0});
  save();closeMod();return render(true)}
 if(D.del){if(confirm('Delete?')){S.songs=S.songs.filter(x=>x.id!=D.del);save();closeMod();go('songs')}return}
 if(D.fs){S.set.font=Math.max(14,Math.min(40,S.set.font+ +D.fs));save();return $('.lyr').style.fontSize=S.set.font+'px'}
 if(t.id==='as'){if(auto){clearInterval(auto);auto=null;t.textContent='⏬ Auto'}else{t.textContent='⏸ Stop';auto=setInterval(()=>{view.scrollTop+=1},40)}return}
 if(D.copy!==undefined){const s=S.songs.find(x=>x.id===S.ui.songId);return navigator.clipboard?.writeText(s.title+'\n\n'+s.lyrics).then(()=>alert('Copied ✔'))}
 if(D.share!==undefined){const s=S.songs.find(x=>x.id===S.ui.songId);return navigator.share?navigator.share({title:s.title,text:s.lyrics}).catch(()=>{}):alert('Share not supported — use copy')}
 if(D.day){S.ui.day=D.day;save();return render()}
 if(D.mo){let [y,m]=S.ui.ym;m+=+D.mo;if(m<0){m=11;y--}if(m>11){m=0;y++}S.ui.ym=[y,m];save();return render()}
 if(D.addev!==undefined)return mod(`<h3>New event · ${S.ui.day}</h3><br><input id="e1" placeholder="Title"><textarea id="e2" placeholder="Note" style="min-height:70px"></textarea><div class="row"><button class="btn sp" data-saveev>Save</button><button class="btn o" data-close>Cancel</button></div>`);
 if(D.saveev!==undefined){const ti=$('#e1').value.trim();if(!ti)return;S.events.push({id:S.nid++,date:S.ui.day,title:ti,note:$('#e2').value.trim()});save();closeMod();return render(true)}
 if(D.delev){S.events=S.events.filter(x=>x.id!=D.delev);save();return render(true)}
 if(D.jreset!==undefined){S.japa={n:0,r:0};save();return render()}
 if(D.set){const [k,v]=D.set.split(':');S.set[k]=v;save();return render(true)}
 if(D.exp!==undefined){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,1)],{type:'application/json'}));a.download='mithra-bhakti-backup.json';a.click();return}
 if(D.imp!==undefined)return $('#fi').click();
 if(D.clr!==undefined){if(confirm('All data will be erased. Sure?')){try{localStorage.removeItem(KEY)}catch(x){}S=seed();go('home')}}
});
/* remember scroll position so refresh returns to the same place */
let st;view.addEventListener('scroll',()=>{clearTimeout(st);st=setTimeout(()=>{S.ui.scroll=view.scrollTop;save()},150)});
addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(h&&h!==S.ui.screen&&['home','songs','cal','japa','set'].includes(h))go(h)});

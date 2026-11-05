/* Mithra Bhakti — Books Plus (strictly additive)
   Adds searchable/favourite/category book shelf, resume progress and private notes.
   Uses separate mb_booksPlus key; does not alter existing file records or bookmarks. */
(()=>{
'use strict';
const MB=window.MB;if(!MB)return;
const $=s=>document.querySelector(s),get=MB.get,set=MB.set,esc=MB.esc,toast=MB.toast;
const KEY='booksPlus';
const data=()=>get(KEY,{meta:{},recent:[]});
const save=d=>set(KEY,d);
const meta=(id)=>data().meta[String(id)]||{};
const files=()=> (window._files||[]).filter(f=>f.category==='books');
const title=f=>meta(f.id).title||f.name;
function addShelf(){
 if(MB.state.page!=='books')return;
 const root=$('#pageContent');if(!root||$('#booksPlusPanel'))return;
 const d=data(),all=files(),panel=document.createElement('section');panel.id='booksPlusPanel';panel.className='card books-plus-panel';
 panel.innerHTML=`<div class="books-plus-head"><div><div class="eyebrow">SMART LIBRARY</div><h2>Your reading space</h2><p class="muted">Search, organise and continue your books</p></div><span class="books-plus-mark">✦</span></div>
 <input id="booksPlusSearch" class="input" type="search" placeholder="Search books by title or file name…" aria-label="Search books">
 <div class="books-plus-filters"><button class="btn soft active" data-book-filter="all">All</button><button class="btn soft" data-book-filter="favourite">♥ Favourites</button><select id="booksPlusCategory" class="input"><option value="all">All categories</option>${['Murugan','Shiva','Amman','Vishnu','General','Other'].map(x=>`<option>${x}</option>`).join('')}</select></div>
 <div class="books-plus-count" id="booksPlusCount">${all.length} books in your library</div>
 <div id="booksPlusRecent">${recentMarkup(d,all)}</div>`;
 const list=root.querySelector('.card:last-child');
 // Place the new panel after the existing shelf summary, without replacing existing content.
 const summary=[...root.querySelectorAll('.card')].find(x=>x.querySelector('[data-import="books"]'));
 (summary||root.firstChild)?.after(panel);
 decorateBooks();
}
function recentMarkup(d,all){
 const recent=(d.recent||[]).map(r=>({...r,file:all.find(f=>String(f.id)===String(r.id))})).filter(x=>x.file).slice(0,3);
 if(!recent.length)return '';
 return `<div class="books-plus-recent"><b>Recently read</b>${recent.map(r=>`<button class="books-plus-recent-item" data-book-resume="${esc(r.id)}"><span>▤</span><span><b>${esc(title(r.file))}</b><small>Continue · Page ${Math.max(1,Number(r.page)||1)}</small></span><strong>›</strong></button>`).join('')}</div>`;
}
function decorateBooks(){
 if(MB.state.page!=='books')return;
 const panel=$('#booksPlusPanel');if(!panel)return;
 const q=($('#booksPlusSearch')?.value||'').trim().toLowerCase(),cat=$('#booksPlusCategory')?.value||'all',filter=panel.dataset.filter||'all';
 let visible=0;files().forEach(f=>{
  const m=meta(f.id),row=[...document.querySelectorAll('#pageContent .list-item')].find(x=>x.querySelector(`[data-open-file="${CSS.escape(String(f.id))}"]`));if(!row)return;
  const matches=(!q||(title(f)+' '+f.name).toLowerCase().includes(q))&&(cat==='all'||(m.category||'General')===cat)&&(filter!=='favourite'||m.favourite);
  row.hidden=!matches;if(matches)visible++;
  const main=row.querySelector('.list-main');if(main&&!main.querySelector('.books-plus-tag')){const tag=document.createElement('small');tag.className='books-plus-tag';tag.textContent=(m.category||'General')+(m.favourite?' · ♥ Favourite':'');main.append(tag)}
  const actions=row.querySelector('.file-actions');if(actions&&!actions.querySelector('[data-book-fav]')){const fav=document.createElement('button');fav.dataset.bookFav=f.id;fav.title='Toggle favourite';fav.textContent=m.favourite?'♥':'♡';actions.prepend(fav);const edit=document.createElement('button');edit.dataset.bookMeta=f.id;edit.textContent='Details';actions.append(edit)}
 });
 const count=$('#booksPlusCount');if(count)count.textContent=`Showing ${visible} of ${files().length} books`;
}
function touch(id,page){const d=data(),r=d.recent.filter(x=>String(x.id)!==String(id));r.unshift({id,page:Math.max(1,Number(page)||1),at:new Date().toISOString()});d.recent=r.slice(0,20);save(d)}
async function editMeta(id){const f=files().find(x=>String(x.id)===String(id));if(!f)return;const old=meta(id),name=await MB.dialog.prompt('Book title',old.title||f.name,{title:'Book details'});if(name===null)return;const category=await MB.dialog.prompt('Category: Murugan, Shiva, Amman, Vishnu, General or Other',old.category||'General',{title:'Book category'});if(category===null)return;const d=data();d.meta[String(id)]={...old,title:name.trim()||f.name,category:category.trim()||'General',favourite:!!old.favourite};save(d);decorateBooks();toast('Book details saved')}
document.addEventListener('input',e=>{if(e.target.id==='booksPlusSearch')decorateBooks()});
document.addEventListener('change',e=>{if(e.target.id==='booksPlusCategory')decorateBooks()});
document.addEventListener('click',async e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.openFile){const f=files().find(x=>String(x.id)===String(b.dataset.openFile));if(f)touch(f.id,1);return}
 if(b.dataset.bookFilter){const p=$('#booksPlusPanel');if(!p)return;p.dataset.filter=b.dataset.bookFilter;p.querySelectorAll('[data-book-filter]').forEach(x=>x.classList.toggle('active',x===b));decorateBooks();return}
 if(b.dataset.bookFav){const d=data(),id=String(b.dataset.bookFav),m=d.meta[id]||{};d.meta[id]={...m,favourite:!m.favourite};save(d);decorateBooks();return}
 if(b.dataset.bookMeta){await editMeta(b.dataset.bookMeta);return}
 if(b.dataset.bookResume){const f=files().find(x=>String(x.id)===String(b.dataset.bookResume));if(!f)return;const r=data().recent.find(x=>String(x.id)===String(f.id));touch(f.id,r?.page||1);MB.state.pdfPage=Math.max(1,Number(r?.page)||1);MB.state.media={id:f.id,category:'books',name:f.name,type:f.type};MB.go('books');return}
 if(b.hasAttribute('data-pdf-go')){const id=MB.state.media?.id;if(id)touch(id,Math.max(1,Number($('#pdfPageInput')?.value)||1));setTimeout(addReaderNotes,0)}
 });
function addReaderNotes(){
 if(MB.state.page!=='books'||!MB.state.media||MB.state.media.category!=='books')return;
 const tools=$('.pdf-tools');if(!tools||$('#booksPlusNotes'))return;
 const id=String(MB.state.media.id),notes=data().meta[id]?.notes||'';const box=document.createElement('section');box.id='booksPlusNotes';box.className='books-plus-notes';box.innerHTML=`<h3>Personal reading notes</h3><p class="muted">Notes are saved privately on this device.</p><textarea id="booksPlusNoteText" class="input" rows="4" placeholder="Write your thoughts, key points or prayer reflections…">${esc(notes)}</textarea><button class="btn gold" id="booksPlusSaveNote">Save notes</button>`;tools.append(box);
}
document.addEventListener('click',e=>{if(e.target.id==='booksPlusSaveNote'){const id=String(MB.state.media?.id||'');if(!id)return;const d=data(),m=d.meta[id]||{};m.notes=$('#booksPlusNoteText')?.value||'';d.meta[id]=m;save(d);toast('Reading notes saved')}});
const previous=MB.after;MB.after=()=>{previous&&previous();addShelf();decorateBooks();setTimeout(addReaderNotes,250);if(MB.state.page==='dashboard')addDashboardBooks()};
function addDashboardBooks(){const root=$('#pageContent');if(!root||$('#booksPlusDashboard'))return;const d=data(),all=files(),recent=(d.recent||[]).map(r=>({...r,file:all.find(f=>String(f.id)===String(r.id))})).filter(x=>x.file).slice(0,3);if(!recent.length)return;const s=document.createElement('section');s.id='booksPlusDashboard';s.className='books-plus-dashboard';s.innerHTML=`<div class="section-head"><h2>Continue Reading</h2><button class="text-btn" data-go="books">My Books</button></div><div class="card">${recent.map(r=>`<button class="books-plus-recent-item" data-book-resume="${esc(r.id)}"><span>▤</span><span><b>${esc(title(r.file))}</b><small>Continue · Page ${Math.max(1,Number(r.page)||1)}</small></span><strong>›</strong></button>`).join('')}</div>`;const music=root.querySelector('.section-head');(music||root.lastChild).after(s)}
})();

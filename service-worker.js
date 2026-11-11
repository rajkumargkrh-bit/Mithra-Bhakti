const CACHE="mithra-bhakti-v30";
const CORE=["./", "./index.html", "./manifest.json", "./icons/icon-192.png", "./icons/icon-512.png", "./css/animation.css", "./css/bhakti-extras.css", "./css/bhakti-library.css", "./css/bhakti-plus.css", "./css/bhakti-studio.css", "./css/books-plus.css", "./css/daily-bhakti-tracker.css", "./css/dashboard-plus.css", "./css/features.css", "./css/festival-plus.css", "./css/menu.css", "./css/panchangam.css", "./css/player-phase4.css", "./css/player-plus.css", "./css/responsive.css", "./css/songs-plus.css", "./css/songs.css", "./css/style.css", "./css/themes.css", "./js/app.js", "./js/back-nav.js", "./js/bhakti-extras.js", "./js/bhakti-library.js", "./js/bhakti-plus.js", "./js/bhakti-studio.js", "./js/books-plus.js", "./js/daily-bhakti-tracker.js", "./js/dashboard-plus.js", "./js/database.js", "./js/features.js", "./js/festival-plus.js", "./js/panchangam.js", "./js/player-phase4.js", "./js/player-plus.js", "./js/songs.js"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>{})))))});
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  const req=e.request;
  if(req.method!=="GET"||req.headers.has("range"))return;
  e.respondWith(fetch(req).then(r=>{
    if(r&&r.status===200&&(r.type==="basic"||r.type==="cors")){const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{})}
    return r;
  }).catch(()=>caches.match(req,{ignoreSearch:true}).then(m=>m||(req.mode==="navigate"?caches.match("./index.html"):Response.error()))));
});

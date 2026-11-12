/* boot: restore last page (no jump back to home) */
if(!['home','songs','lyrics','cal','japa','set'].includes(S.ui.screen))S.ui.screen='home';
render(true);
try{history.replaceState(null,'','#'+S.ui.screen)}catch(e){}
setTimeout(()=>$('#splash').classList.add('out'),1500);
setTimeout(()=>$('#splash').remove(),2200);
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});

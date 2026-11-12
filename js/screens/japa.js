function japa(){
 view.innerHTML=`<h2 style="text-align:center">📿 ${tr('japa')}</h2><div class="jb" id="jb"><span id="jn">${S.japa.n}</span><small>/ 108</small></div>
 <p style="text-align:center" class="mut">Rounds (மாலை): <b id="jr">${S.japa.r}</b></p><div class="row" style="justify-content:center"><button class="btn o" data-jreset>Reset</button></div>`;
 $('#jb').style.setProperty('--p',(S.japa.n/108*360)+'deg');
 $('#jb').onclick=()=>{S.japa.n++;if(S.japa.n>=108){S.japa.n=0;S.japa.r++;navigator.vibrate&&navigator.vibrate([200,100,200])}else navigator.vibrate&&navigator.vibrate(15);
  $('#jn').textContent=S.japa.n;$('#jb').style.setProperty('--p',(S.japa.n/108*360)+'deg');$('#jr').textContent=S.japa.r;save()};
}

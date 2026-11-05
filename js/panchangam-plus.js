/* Mithra Bhakti — Panchangam Plus (add-on, nothing existing is changed)
   1) "இப்போது" badge + minutes-left on the running Rahu/Yama/Kuligai/good-time rows (live, no re-render)
   2) Date tap already picks the day; this adds ‹ › day buttons + swipe on the panchangam card + selected-date highlight
   3) "இன்று" (Today) chip to jump back to today
   4) "அடுத்த நல்ல நேரம்" strip (next good time with countdown) */
(()=>{
const MB=window.MB,P=MB&&MB.panchang;if(!MB||!P)return;
const G={Amirdham:"அமிர்தம்",Uthi:"உத்தி",Rogam:"ரோகம்",Labam:"லாபம்",Dhanam:"தனம்",Sugam:"சுகம்",Soram:"சோரம்",Visham:"விஷம்"};
const lk=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const left=ms=>{const m=Math.max(1,Math.round(ms/60000)),h=Math.floor(m/60),r=m%60;return h?`${h} மணி${r?" "+r+" நிமிடம்":""}`:`${m} நிமிடம்`};
let cur=null;

function build(info){
 const parts=new Set([info.rahuN,info.yamaN,info.kuliN]);
 const best=info.gowri.filter(s=>s.kind==="good"&&!parts.has(s.i));
 return{
  bad:[info.rahu,info.yama,info.kuli],
  good:[info.abhijit?{r:info.abhijit,n:"அபிஜித் முகூர்த்தம்"}:null,...best.map(s=>({r:[s.a,s.b],n:G[s.n]}))],
  gowri:info.gowri.map(s=>[s.a,s.b])};
}

function shiftDay(n){
 const[y,m,d]=(MB.state.selectedDate||lk()).split("-").map(Number),t=new Date(y,m-1,d+n);
 MB.state.selectedDate=lk(t);MB.state.month=new Date(t.getFullYear(),t.getMonth(),1);MB.render();
}

function nextHTML(now,isToday){
 const g=cur.good.filter(x=>x&&x.r).sort((a,b)=>a.r[0]-b.r[0]);
 if(!g.length)return"";
 if(!isToday){const f=g[0];return `🌼 இந்த நாளின் முதல் நல்ல நேரம்: <b>${f.n}</b> ${P.fmt(f.r[0])} – ${P.fmt(f.r[1])}`}
 const act=g.find(x=>now>=x.r[0]&&now<x.r[1]),nxt=g.find(x=>x.r[0]>now);
 if(act)return `✅ இப்போது <b>${act.n}</b> — ${left(act.r[1]-now)} மீதம்${nxt?` · அடுத்தது ${nxt.n} ${P.fmt(nxt.r[0])}`:""}`;
 if(nxt)return `⏭ அடுத்த நல்ல நேரம்: <b>${nxt.n}</b> ${P.fmt(nxt.r[0])} – ${P.fmt(nxt.r[1])} · ${left(nxt.r[0]-now)} கழித்து`;
 return "இன்றைக்கு மீதமுள்ள நல்ல நேரம் இல்லை";
}

function enhance(){
 if(MB.state.page!=="calendar"||MB.state.menuOpen)return;
 const sel=MB.state.selectedDate||lk(),today=lk(),mo=MB.state.month||new Date(),n=new Date();
 /* selected-date highlight */
 document.querySelectorAll(".calendar-grid .day").forEach(b=>b.classList.toggle("pp-sel",b.dataset.date===sel));
 /* Today chip */
 if(!document.querySelector(".pp-today")&&(sel!==today||mo.getFullYear()!==n.getFullYear()||mo.getMonth()!==n.getMonth())){
  const head=document.querySelector(".month-head");
  if(head)head.insertAdjacentHTML("afterend",`<div class="pp-today"><button class="btn soft" data-pplus="today">📍 இன்று · Today</button></div>`);
 }
 const card=document.querySelector("#pancCard");if(!card||card.dataset.pp)return;card.dataset.pp="1";
 let info;try{info=P.dayInfo(sel)}catch(e){console.error("PanchangamPlus",e);return}
 cur=build(info);
 /* tag rows with their time range */
 const rows=[...card.querySelectorAll(".panc-row")],tag=(row,r)=>{if(row&&r){row.dataset.ppS=r[0];row.dataset.ppE=r[1]}};
 cur.bad.forEach((r,i)=>tag(rows[i],r));
 cur.good.forEach((g,i)=>tag(rows[3+i],g&&g.r));
 cur.gowri.forEach((r,i)=>tag(rows[3+cur.good.length+i],r));
 /* day buttons */
 const top=card.querySelector(".panc-top");
 if(top)top.insertAdjacentHTML("beforeend",`<div class="pp-nav"><button class="btn soft" data-pplus="prev" aria-label="Previous day">‹</button><button class="btn soft" data-pplus="next" aria-label="Next day">›</button></div>`);
 /* next good time strip */
 const anchor=card.querySelector(".panc-now")||card.querySelector(".panc-sun");
 if(anchor)anchor.insertAdjacentHTML("afterend",`<div class="pp-next" id="ppNext"></div>`);
 tick();
}

function tick(){
 const card=document.querySelector("#pancCard");if(!card||!card.dataset.pp||!cur)return;
 const isToday=(MB.state.selectedDate||lk())===lk(),now=Date.now(),strip=card.querySelector("#ppNext");
 if(strip){const h=nextHTML(now,isToday);strip.innerHTML=h;strip.style.display=h?"":"none"}
 if(!isToday)return;
 let mismatch=false;
 card.querySelectorAll(".panc-row[data-pp-s]").forEach(row=>{
  const s=+row.dataset.ppS,e=+row.dataset.ppE,on=now>=s&&now<e;
  if(row.classList.contains("now")!==on){mismatch=true;row.classList.toggle("now",on)}
  let b=row.querySelector(".pp-now");
  if(on){if(!b){b=document.createElement("em");b.className="pp-now";row.appendChild(b)}b.textContent=`இப்போது · ${left(e-now)} மீதம்`}
  else if(b)b.remove();
 });
 /* a window started/ended: refresh the top banner too (skip if the user has a section open) */
 if(mismatch&&!card.querySelector("details[open]"))MB.render();
}
setInterval(tick,30000);document.addEventListener("visibilitychange",()=>{if(!document.hidden)tick()});

/* hook after the existing panchangam hook */
const prevAfter=MB.after;
MB.after=()=>{prevAfter&&prevAfter();try{enhance()}catch(e){console.error("PanchangamPlus",e)}};

/* clicks */
document.addEventListener("click",e=>{const b=e.target.closest("button[data-pplus]");if(!b)return;
 const a=b.dataset.pplus;
 if(a==="prev")shiftDay(-1);else if(a==="next")shiftDay(1);
 else if(a==="today"){MB.state.selectedDate=lk();MB.state.month=new Date();MB.render()}
});

/* swipe left/right on the panchangam card = next/previous day */
let sx=0,sy=0,sw=false;
document.addEventListener("touchstart",e=>{const t=e.touches[0];sw=!!e.target.closest("#pancCard")&&!e.target.closest("input,select,textarea,.panc-rasis");sx=t.clientX;sy=t.clientY},{passive:true});
document.addEventListener("touchend",e=>{if(!sw)return;sw=false;const t=e.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy;
 if(Math.abs(dx)>80&&Math.abs(dy)<45&&Math.abs(dx)>Math.abs(dy)*2)shiftDay(dx<0?1:-1)},{passive:true});
})();

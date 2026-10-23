/* Battleground Board: read-only view of the site's shared Senate stateData. */
(()=>{
'use strict';
const IDS=['TX','ME','AK','IA','OH','MI','KS','NE'];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n=v=>{const m=String(v??'').trim().match(/-?\d+(?:\.\d+)?/);return m?Number(m[0]):null;};
const pct=v=>v===null?'—':v.toFixed(1)+'%';
const pty=v=>{const x=String(v||'').toLowerCase();return x.includes('democrat')?'dem':x.includes('republican')?'rep':x.includes('independent')?'ind':'other';};
const partyName=p=>p==='dem'?'Democrat':p==='rep'?'Republican':p==='ind'?'Independent':'Unspecified';
const ratingLabel=r=>{const s=String(r||'').toLowerCase().replace(/-/g,' ');return s==='tossup'||s==='toss up'?'Toss-up':s.replace(/\bd\b/g,'Democratic').replace(/\br\b/g,'Republican').replace(/\b\w/g,c=>c.toUpperCase());};
let selected='TX',filter='all',sort='close',lastStamp='';
let root=document.getElementById('page-board');
if(!root){root=document.createElement('section');root.id='page-board';root.className='page';root.hidden=true;root.style.setProperty('display','none','important');const about=document.getElementById('page-about');(about?.parentNode||document.body).insertBefore(root,about||null);}
root.innerHTML=[
'<main class="bb-shell">',
'<div class="bb-topline"><div class="bb-top-left"><span class="bb-star" aria-hidden="true">✦</span> WILL\'S ELECTION DESK <span aria-hidden="true">/</span> 2026 SENATE</div><div class="bb-topright"><span class="bb-status-dot" aria-hidden="true"></span>FORECAST SNAPSHOT · NOT RESULTS</div></div>',
'<div class="bb-hero"><div><p class="bb-eyebrow">THE ROAD TO 51 · 2026 MIDTERMS</p><h1>The Battleground <span>Board.</span></h1>',
'<p class="bb-sub">Eight pivotal Senate contests. One clear view of the polling averages, Will\'s independent race ratings, and where his forecasts break from the numbers.</p></div>',
'<aside class="bb-majority" aria-label="Current site Senate majority forecast"><div class="bb-majority-header"><span class="bb-kicker">PROJECTED SENATE BALANCE</span><span class="bb-majority-year">100 SEATS</span></div>',
'<div class="bb-seats"><div class="bb-seat-side"><strong data-bb-dem>—</strong><small>DEM</small></div><div class="bb-seat-side"><strong data-bb-rep>—</strong><small>GOP</small></div></div>',
'<div class="bb-seat-track" data-bb-seatbar aria-label="Current Senate majority projection"><span style="width:50%"></span><span style="width:50%"></span></div>',
'<div class="bb-seat-foot"><span>51 seats to control the Senate</span><b>WILL\'S FORECAST</b></div></aside></div>',
'<div class="bb-metrics" aria-label="Battleground overview">',
'<div class="bb-metric"><small>Races on the board</small><strong data-bb-total>—</strong><span>Selected competitive contests</span></div>',
'<div class="bb-metric"><small>Closest polling average</small><strong data-bb-closest>—</strong><span data-bb-closest-sub>Candidate polling difference</span></div>',
'<div class="bb-metric"><small>Polling / forecast split</small><strong data-bb-split>—</strong><span>Races where the polling leader differs from Will\'s call</span></div></div>',
'<div class="bb-section-title"><div><p class="bb-eyebrow">01 / RACE IN FOCUS</p><h2>Inside the contest</h2></div><span class="bb-pill">SELECT ANY RACE BELOW</span></div>',
'<section class="bb-focus" data-bb-focus aria-live="polite" aria-label="Selected battleground race"></section>',
'<div class="bb-section-title"><div><p class="bb-eyebrow">02 / ALL BATTLEGROUNDS</p><h2>The race board</h2><p>Each race card shows existing polling averages and the separate independent forecast.</p></div><span class="bb-pill" data-bb-count>8 RACES</span></div>',
'<div class="bb-toolbar"><div class="bb-filters" role="group" aria-label="Filter races">',
'<button type="button" class="bb-filter" data-bb-filter="all" aria-pressed="true">All races</button>',
'<button type="button" class="bb-filter" data-bb-filter="close" aria-pressed="false">Tilt / Toss-up</button>',
'<button type="button" class="bb-filter" data-bb-filter="split" aria-pressed="false">Poll vs. call</button></div>',
'<label class="bb-sort-wrap" for="bbSort">SORT BY <select class="bb-sort" id="bbSort"><option value="close">Closest polling</option><option value="alpha">State A–Z</option><option value="call">Forecast rating</option></select></label></div>',
'<div class="bb-board-grid" data-bb-grid aria-label="Selected Senate battlegrounds"></div>',
'<footer class="bb-footer"><span>Forecasts are independent judgments, not official results. Polling figures use the site\'s existing candidate averages; methodology and inputs may evolve.</span><a href="/?page=senate" data-bb-map>View the full 2026 Senate map ↗</a></footer>',
'</main>'
].join('');
function data(){try{if(typeof stateData!=='undefined'&&stateData)return stateData;}catch(_){}return window.stateData||null;}
function seats(){
 const h=document.getElementById('page-home');
 let d=n(h?.querySelector('#homeSenateForecast .wg-forecast-dem')?.textContent);
 let r=n(h?.querySelector('#homeSenateForecast .wg-forecast-rep')?.textContent);
 if(d!==null&&r!==null&&d+r===100)return {d,r};
 const card=h?.querySelector('#homeForecastSplit');
 d=n(card?.querySelector('.final-party-number.dem,.party-number.dem')?.textContent);
 r=n(card?.querySelector('.final-party-number.rep,.party-number.rep')?.textContent);
 return d!==null&&r!==null&&d+r===100?{d,r}:null;
}
function rows(){
 const d=data();
 return IDS.map(ab=>{
  const s=d?.[ab];
  if(!s||!s.candidate1||!s.candidate2)return null;
  const a=n(s.candidate1Poll),b=n(s.candidate2Poll),p1=pty(s.candidate1Party),p2=pty(s.candidate2Party),forecast=pty(s.predictionParty);
  const leader=(a===null||b===null)?null:a===b?'tie':a>b?p1:p2;
  return {ab,s,name:String(s.name||ab),a,b,p1,p2,forecast,leader,gap:a===null||b===null?null:Math.abs(a-b),
   split:leader!==null&&leader!=='tie'&&leader!=='other'&&forecast!=='other'&&leader!==forecast,
   rating:String(s.rating||'')};
 }).filter(Boolean);
}
function ordered(all){
 const out=all.filter(r=>filter==='all'||(filter==='close'&&/^(tilt|toss)/i.test(r.rating))||(filter==='split'&&r.split));
 if(sort==='alpha')out.sort((a,b)=>a.name.localeCompare(b.name));
 else if(sort==='call'){const rank=r=>({'tossup':0,'toss-up':0,'tilt-d':1,'tilt-r':1,'lean-d':2,'lean-r':2,'likely-d':3,'likely-r':3,'solid-d':4,'solid-r':4})[r.rating.toLowerCase()]??5;out.sort((a,b)=>rank(a)-rank(b)||a.name.localeCompare(b.name));}
 else out.sort((a,b)=>(a.gap??999)-(b.gap??999)||a.name.localeCompare(b.name));
 return out;
}
function call(r){return String(r.s.prediction||'').trim()||ratingLabel(r.rating);}
function tag(r){return '<span class="bb-pill '+esc(r.forecast)+'">'+esc(ratingLabel(r.rating))+'</span>';}
function candidateLine(name,p,value){
 return '<div class="bb-poll-row"><div class="bb-poll-row-top"><span class="bb-poll-name"><i class="bb-party '+p+'" aria-hidden="true"></i>'+esc(name)+'</span><span class="bb-poll-value">'+esc(pct(value))+'</span></div>'+
 '<div class="bb-candidate-bar '+p+'" aria-hidden="true"><span style="width:'+Math.max(0,Math.min(100,value??0))+'%"></span></div></div>';
}
function focus(r){
 const s=r.s;
 let notes=String(s.notes||'').trim()||'Independent projection; polling averages and election outcomes can differ.';
 if(notes.length>290)notes=notes.slice(0,287).trimEnd()+'…';
 let lead='No comparable polling available';
 if(r.leader==='tie')lead='Polling average tied';
 else if(r.leader!==null){const name=r.a>r.b?s.candidate1:s.candidate2;lead=esc(String(name).split(' ').at(-1))+' +'+r.gap.toFixed(1)+' pts in polling';}
 return '<div class="bb-focus-inner"><div class="bb-focus-info" data-ab="'+esc(r.ab)+'"><span class="bb-kicker">FEATURED RACE / '+esc(r.ab)+'</span>'+
 '<h3 class="bb-focus-state">'+esc(r.name)+'</h3><div class="bb-focus-pills">'+tag(r)+'<span class="bb-pill">WILL\'S CALL</span><span class="bb-pill '+r.forecast+'">'+esc(partyName(r.forecast))+'</span></div>'+
 '<div class="bb-focus-call">'+esc(call(r))+'</div><p class="bb-focus-desc">'+esc(notes)+'</p>'+
 '<button type="button" class="bb-focus-action" data-bb-map>Explore this race on the Senate map <span aria-hidden="true">↗</span></button></div>'+
 '<div class="bb-focus-polls"><div class="bb-kicker">CANDIDATE POLLING AVERAGES · '+esc(r.ab)+'</div>'+
 candidateLine(s.candidate1,r.p1,r.a)+candidateLine(s.candidate2,r.p2,r.b)+
 '<div class="bb-focus-poll-foot"><span>'+lead+'</span><strong>'+(r.split?'Poll leader ≠ forecast':'Polling & forecast comparison')+'</strong></div></div></div>';
}
function card(r,i){
 const s=r.s;
 function candidate(name,p,v){return '<div class="bb-card-cand"><span class="bb-candidate-name"><i class="bb-party '+p+'" aria-hidden="true"></i>'+esc(name)+'</span><span class="bb-pct">'+esc(pct(v))+'</span></div>';}
 function bar(p,v){return '<span class="'+p+'" style="width:'+Math.max(0,Math.min(100,v??0))+'%"></span>';}
 const rem=Math.max(0,100-(r.a??0)-(r.b??0));
 return '<button type="button" class="bb-card" data-bb-state="'+esc(r.ab)+'" aria-pressed="'+(r.ab===selected?'true':'false')+'" aria-label="Focus on '+esc(r.name)+' Senate race">'+
 '<div class="bb-card-index"><span>RACE '+String(i+1).padStart(2,'0')+' / '+esc(r.ab)+'</span><em>'+esc(ratingLabel(r.rating))+'</em></div>'+
 '<h3>'+esc(r.name)+'</h3><div class="bb-card-call">Will\'s call: <strong>'+esc(call(r))+'</strong></div>'+
 '<div class="bb-card-names">'+candidate(s.candidate1,r.p1,r.a)+candidate(s.candidate2,r.p2,r.b)+'</div>'+
 '<div class="bb-sharebar" aria-label="Candidate polling percentages">'+bar(r.p1,r.a)+bar(r.p2,r.b)+'<span style="width:'+rem+'%;background:#38516f"></span></div>'+
 '<div class="bb-card-footer"><span>Polling gap: '+(r.gap===null?'—':r.gap.toFixed(1)+' pts')+'</span>'+
 (r.split?'<span class="bb-difference">◆ Polls / call diverge</span>':'<span>VIEW DETAILS →</span>')+'</div></button>';
}
function text(selector,value){const el=root.querySelector(selector);if(el)el.textContent=value;}
function render(force=false){
 const all=rows(),seat=seats();
 const stamp=JSON.stringify({all:all.map(r=>[r.ab,r.name,r.a,r.b,r.rating,r.s.prediction,r.s.predictionParty,r.s.notes,r.p1,r.p2]),seat,filter,sort,selected});
 if(!force&&stamp===lastStamp)return;
 lastStamp=stamp;
 if(seat){text('[data-bb-dem]',String(seat.d));text('[data-bb-rep]',String(seat.r));const bar=root.querySelector('[data-bb-seatbar]');if(bar){bar.children[0].style.width=seat.d+'%';bar.children[1].style.width=seat.r+'%';bar.setAttribute('aria-label',seat.d+' projected Democratic seats and '+seat.r+' projected Republican seats');}}
 else{text('[data-bb-dem]','—');text('[data-bb-rep]','—');}
 const close=all.filter(r=>r.gap!==null).sort((a,b)=>a.gap-b.gap)[0];
 text('[data-bb-total]',String(all.length).padStart(2,'0'));
 text('[data-bb-closest]',close?close.name:'—');
 text('[data-bb-closest-sub]',close?'Polling gap: '+close.gap.toFixed(1)+' points':'Awaiting polling averages');
 text('[data-bb-split]',String(all.filter(r=>r.split).length).padStart(2,'0'));
 const shown=ordered(all);
 if(!shown.some(r=>r.ab===selected))selected=shown[0]?.ab||all[0]?.ab||'TX';
 const focusEl=root.querySelector('[data-bb-focus]'),picked=all.find(r=>r.ab===selected);
 if(focusEl)focusEl.innerHTML=picked?focus(picked):'<div class="bb-empty">No forecast data is available yet.</div>';
 const grid=root.querySelector('[data-bb-grid]');
 if(grid)grid.innerHTML=shown.length?shown.map(card).join(''):'<p class="bb-empty">No races currently match this filter.</p>';
 text('[data-bb-count]',shown.length+' / '+all.length+' RACES');
 root.querySelectorAll('[data-bb-filter]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.bbFilter===filter?'true':'false'));
 const select=root.querySelector('#bbSort');if(select&&select.value!==sort)select.value=sort;
}
root.addEventListener('click',e=>{
 const card=e.target.closest('[data-bb-state]');
 if(card){selected=card.dataset.bbState;render(true);root.querySelector('[data-bb-focus]')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});return;}
 const b=e.target.closest('[data-bb-filter]');
 if(b){filter=b.dataset.bbFilter;render(true);return;}
 if(e.target.closest('[data-bb-map]')){e.preventDefault();if(typeof window.__acceptedGoodNavigate==='function'){window.__acceptedGoodNavigate('senate');return;}const nav=document.querySelector('.site-header .nav [data-accepted-page="senate"]');if(nav){nav.click();return;}location.href='/?page=senate';}
});
root.querySelector('#bbSort')?.addEventListener('change',e=>{sort=e.target.value;render(true);});
render(true);
setInterval(()=>{if(root.getClientRects().length)render();},3500);
window.addEventListener('pageshow',()=>render());
window.addEventListener('focus',()=>{if(root.getClientRects().length)render();});
})();
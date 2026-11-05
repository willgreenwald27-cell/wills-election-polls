(()=>{
'use strict';
const SOURCE_HOUSE='https://www.poliwave.com/us/live/midterms-2026/house?office=governors';
const SOURCE_SENATE='https://abcnews.com/Politics/live-updates/midterm-elections-live-updates?entryId=137839567&gsid=640af250-cc78-46e2-936f-c47668e9be8d&id=137782085';
function card(label,subtitle,d,r,u,foot){
  const total=d+r+u;
  return '<article class="wg-compare-card '+(u?'result':'prediction')+'">'+
    '<div class="wg-compare-label">'+label+'</div>'+
    '<div class="wg-compare-sub">'+subtitle+'</div>'+
    '<div class="wg-compare-numbers">'+
    '<div class="wg-compare-num"><span>Democrats</span><strong class="wg-blue">'+d+'</strong></div>'+
    '<div class="wg-compare-num"><span>Republicans</span><strong class="wg-red">'+r+'</strong></div>'+
    '</div>'+
    '<div class="wg-seats-bar" aria-label="'+d+' Democratic, '+r+' Republican, '+u+' uncalled">'+
    '<i class="wg-bar-d" style="width:'+(d/total*100)+'%"></i>'+
    '<i class="wg-bar-r" style="width:'+(r/total*100)+'%"></i>'+
    (u?'<i class="wg-bar-u" style="width:'+(u/total*100)+'%"></i>':'')+
    '</div><div class="wg-compare-foot">'+foot+'</div></article>';
}
function render(){
 const root=document.getElementById('page-home');
 if(!root||root.querySelector('#wg-forecast-comparison'))return !!root;
 const old=root.querySelector('#housePrediction2026')||root.querySelector('#homeForecastSplit');
 const reference=root.querySelector('.reference-home-shell')||root.querySelector('.content')||root;
 const section=document.createElement('section');
 section.id='wg-forecast-comparison';
 section.setAttribute('aria-label','Original 2026 election predictions compared with November 4 reported results');
 section.innerHTML='<div class="wg-compare-top"><div class="wg-compare-eyebrow">2026 MIDTERMS · FORECAST VS RESULTS</div>'+
 '<h2>My predictions vs. the results</h2><p>The original Election Day forecasts are shown next to the reported seat counts. Yellow represents races not yet called in the result snapshots.</p></div>'+
 '<div class="wg-chamber"><h3 class="wg-chamber-title">U.S. Senate</h3><div class="wg-compare-grid">'+
 card('My final prediction','Election Day · November 3, 2026',52,48,0,'Original forecast · 100 seats')+
 card('Reported count','November 4 · Senate snapshot',54,44,2,'2 uncalled: Alaska and Mississippi · Democratic caucus includes two independents')+
 '</div></div>'+
 '<div class="wg-chamber"><h3 class="wg-chamber-title">U.S. House of Representatives</h3><div class="wg-compare-grid">'+
 card('My final prediction','Election Day · November 3, 2026',235,200,0,'Original forecast · 435 seats')+
 card('Reported count','November 4 · 1:14 p.m. ET snapshot',241,153,41,'394 called · 41 uncalled · House result totals are not final')+
 '</div></div>'+
 '<div class="wg-compare-source">Senate results: <a href="'+SOURCE_SENATE+'" target="_blank" rel="noopener">ABC News</a> · House results: <a href="'+SOURCE_HOUSE+'" target="_blank" rel="noopener">Poliwave 1:14 p.m. ET snapshot</a>. These are timestamped election-night counts, not live-updating or certified results.</div>';
 if(old&&old.parentElement)old.insertAdjacentElement('beforebegin',section);
 else reference.appendChild(section);
 return true;
}
function init(){if(render())return;let attempts=0;const t=setInterval(()=>{if(render()||++attempts>15)clearInterval(t)},350);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.addEventListener('pageshow',render);
})();
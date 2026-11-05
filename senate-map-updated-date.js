(()=>{'use strict';
  const date='November 2, 2026';
  const datePattern=/\b(?:Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?)\.?\s+\d{1,2}(?:,?\s*2026)?\b|\b2026[-/]\d{2}[-/]\d{2}\b/i;
  function apply(){
    const page=document.getElementById('page-senate');
    if(!page)return;
    const el=page.querySelector('#mapUpdated');
    if(!el)return;
    const before=el.textContent||'';
    const after=datePattern.test(before)?before.replace(datePattern,date):'Updated '+date;
    if(before!==after)el.textContent=after;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});
  else apply();
  window.addEventListener('pageshow',apply);
  document.addEventListener('click',event=>{
    if(event.target?.closest?.('[data-page="senate"],[data-target="senate"],#page-senate'))queueMicrotask(apply);
  },true);
  const observer=new MutationObserver(mutations=>{
    if(mutations.some(m=>{const n=m.target.nodeType===1?m.target:m.target.parentElement;return n?.closest?.('#page-senate')||n?.id==='page-senate'||[...m.addedNodes].some(x=>x.id==='page-senate');}))apply();
  });
  observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
})();
/* Instant, CSS-driven accuracy map: no SVG clones, repaint timers or flash. */
(()=>{
'use strict';
let accuracy=true;
const correct=new Set('AL AR CO DE FL GA ID IL KS KY LA MA MI MN MT NE NH NJ NM NC OH OK OR RI SD TN TX VA WV WY'.split(' '));
const wrong=new Set('IA ME SC'.split(' '));
const pending=new Set(['AK','MS']);
const saved=new WeakMap();
let watched=null,painting=false;
function paint(){
 const page=document.getElementById('page-senate');
 const map=page?.querySelector('.map-wrap');if(!map)return;
 painting=true;
 try{
  const states=map.querySelectorAll('svg [data-state]');
  for(const el of states){
   const ab=String(el.getAttribute('data-state')||'').toUpperCase();
   if(!/^[A-Z]{2}$/.test(ab))continue;
   if(!saved.has(el))saved.set(el,{value:el.style.getPropertyValue('fill'),priority:el.style.getPropertyPriority('fill')});
   if(!accuracy){
    const prev=saved.get(el);
    if(prev.value){if(el.style.getPropertyValue('fill')!==prev.value||el.style.getPropertyPriority('fill')!==prev.priority)el.style.setProperty('fill',prev.value,prev.priority);}
    else if(el.style.getPropertyValue('fill'))el.style.removeProperty('fill');
    continue;
   }
   const color=correct.has(ab)?'#24a55a':wrong.has(ab)?'#db4452':pending.has(ab)?'#f4c542':'#cbd5e1';
   if(el.style.getPropertyValue('fill')!==color||el.style.getPropertyPriority('fill')!=='important')el.style.setProperty('fill',color,'important');
  }
 }finally{painting=false}
 if(watched!==map){
  if(watched?.__wgDirectColorObserver)watched.__wgDirectColorObserver.disconnect();
  const obs=new MutationObserver(mutations=>{
   if(!accuracy||painting)return;
   // Older map scripts may repaint inline fills. Restore only on actual changes.
   if(mutations.some(m=>m.type==='childList'||m.attributeName==='style'||m.attributeName==='fill'))requestAnimationFrame(paint);
  });
  obs.observe(map,{subtree:true,childList:true,attributes:true,attributeFilter:['style','fill','data-state']});
  map.__wgDirectColorObserver=obs;watched=map;
 }
}
function install(){
 const page=document.getElementById('page-senate');if(!page)return false;
 const map=page.querySelector('.map-wrap');
 if(!map)return false;
 page.dataset.wgAccuracy=accuracy?'on':'off';
 let heading=page.querySelector('.page-head h1');
 if(heading){
  if(!heading.dataset.originalHeading)heading.dataset.originalHeading=heading.textContent;
  heading.textContent=accuracy?'2026 Senate Prediction Accuracy':heading.dataset.originalHeading;
 }
 let summary=page.querySelector('#wg-accuracy-summary');
 if(!summary){
  summary=document.createElement('div');summary.id='wg-accuracy-summary';
  summary.innerHTML='<div><b>30</b><span>Correct</span></div><div><b>3</b><span>Incorrect</span></div><div><b>2</b><span>Uncalled</span></div>';
  const balance=page.querySelector('.balance-power');
  if(balance)balance.insertAdjacentElement('afterend',summary);
  else map.insertAdjacentElement('beforebegin',summary);
 }
 summary.hidden=!accuracy;
 let controls=page.querySelector('#wg-accuracy-controls');
 if(!controls){
  controls=document.createElement('div');controls.id='wg-accuracy-controls';
  controls.innerHTML='<strong>2026 Senate prediction accuracy</strong><div><button type="button" data-view="accuracy">Accuracy map</button><button type="button" data-view="forecast">Original forecast colors</button></div>';
  controls.addEventListener('click',e=>{
   const button=e.target.closest('button[data-view]');if(!button)return;
   accuracy=button.dataset.view==='accuracy';
   install();
  });
  map.insertAdjacentElement('beforebegin',controls);
 }
 controls.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.view==='accuracy')===accuracy)));
 let key=page.querySelector('#wg-accuracy-key');
 if(!key){
  key=document.createElement('div');key.id='wg-accuracy-key';
  key.innerHTML='<span><i style="background:#24a55a"></i> Correct</span><span><i style="background:#db4452"></i> Incorrect</span><span><i style="background:#f4c542"></i> Uncalled (AK, MS)</span><span><i style="background:#cbd5e1"></i> No 2026 Senate race</span>';
  map.insertAdjacentElement('afterend',key);
 }
 key.hidden=!accuracy;
 paint();
 return true;
}
function init(){
 if(install())return;
 let count=0;const timer=setInterval(()=>{if(install()||++count>=20)clearInterval(timer);},150);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
document.addEventListener('click',e=>{
 if(e.target.closest?.('.site-header .nav'))queueMicrotask(install);
},true);
window.addEventListener('pageshow',install);
})();
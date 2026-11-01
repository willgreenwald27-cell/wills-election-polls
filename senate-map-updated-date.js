(()=>{'use strict';
  const date='November 1, 2026';
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
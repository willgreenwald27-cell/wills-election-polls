(()=>{
  'use strict';
  // Editorial date requested by the site owner, not the browser's current date.
  const DATE='October 20, 2026';
  const norm=s=>String(s||'').replace(/\s+/g,' ').trim();
  const update=el=>{if(el&&norm(el.textContent)!==DATE)el.textContent=DATE;};

  function apply(){
    const root=document.getElementById('page-home');
    if(!root)return;

    // Original site renders the homepage date into this strong element.
    update(root.querySelector('#homeLatestUpdate'));

    // Alternate responsive dashboard layout.
    const metric=root.querySelector('#homeLastUpdated');
    if(metric)update(metric.querySelector('.wg-metric-value')||metric.querySelector('strong'));

    // Handle other historical metric layout versions, without touching unrelated dates.
    const dateText=/^(?:(?:Sep(?:tember)?|Oct(?:ober)?)\.?\s+\d{1,2}(?:,?\s*2026)?|2026[-\/]\d{2}[-\/]\d{2})$/i;
    const leaves=[...root.querySelectorAll('*')].filter(el=>el.children.length===0);
    for(const label of leaves){
      if(!/^(Latest Update|Last Updated)$/i.test(norm(label.textContent)))continue;
      let box=label.parentElement;
      for(let i=0;box&&box!==root&&i<4;i++,box=box.parentElement){
        const candidate=[...box.querySelectorAll('strong,span,time,.wg-metric-value')].find(el=>el.children.length===0&&dateText.test(norm(el.textContent)));
        if(candidate){update(candidate);break;}
      }
    }
    for(const el of leaves){
      if(/^Last updated\s*:?\s*(?:Sep|Oct)(?:tember|ober)?\.?\s+\d{1,2}(?:,?\s*2026)?$/i.test(norm(el.textContent))){
        const text='Last updated: '+DATE;
        if(norm(el.textContent)!==text)el.textContent=text;
      }
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});
  else apply();
  [50,200,600,1500,3500].forEach(ms=>setTimeout(apply,ms));
  // The original home renderer can rerun after polling data refreshes.
  let scheduled=false;
  new MutationObserver(()=>{
    if(scheduled)return;
    scheduled=true;
    queueMicrotask(()=>{scheduled=false;apply();});
  }).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
  window.addEventListener('pageshow',apply);
})();

(()=>{
  'use strict';
  // Homepage editorial update date. This is intentionally fixed, not today's date.
  const DATE='October 12, 2026';
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();

  function setDate(el,text){
    if(el&&norm(el.textContent)!==text) el.textContent=text;
  }

  function apply(){
    const root=document.getElementById('page-home');
    if(!root) return;

    // The current homepage design shows its date inside this metric.
    const dateCard=root.querySelector('#homeLastUpdated');
    if(dateCard){
      const value=dateCard.querySelector('.wg-metric-value');
      if(value) setDate(value,DATE);
    }

    // Also support earlier homepage layouts that label this "Latest Update".
    const leaves=[...root.querySelectorAll('*')].filter(el=>el.children.length===0);
    const datePattern=/^(?:(?:Sep(?:tember)?|Oct(?:ober)?)\.?\s+\d{1,2}(?:,?\s*2026)?|2026[-\/]\d{2}[-\/]\d{2})$/i;
    for(const label of leaves){
      if(!/^(?:Latest Update|Last Updated)$/i.test(norm(label.textContent))) continue;
      let box=label.parentElement;
      for(let depth=0;box&&box!==root&&depth<4;depth++,box=box.parentElement){
        const date=[...box.querySelectorAll('*')].find(el=>el.children.length===0 && datePattern.test(norm(el.textContent)));
        if(date){setDate(date,DATE);break;}
      }
    }

    // Covers a compact inline "Last updated: Oct 9, 2026" label if present.
    for(const el of leaves){
      const t=norm(el.textContent);
      if(/^Last updated\s*:?\s*(?:(?:Sep(?:tember)?|Oct(?:ober)?)\.?\s+\d{1,2}(?:,?\s*2026)?|2026[-\/]\d{2}[-\/]\d{2})$/i.test(t)){
        setDate(el,'Last updated: '+DATE);
      }
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',apply,{once:true});
  else apply();
  [50,200,600,1500].forEach(ms=>setTimeout(apply,ms));
  new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
  window.addEventListener('pageshow',apply);
})();

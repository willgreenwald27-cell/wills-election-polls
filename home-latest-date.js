(()=>{
  'use strict';
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  function apply(){
    const root=document.getElementById('page-home')||document.body;
    if(!root)return;
    const els=[...root.querySelectorAll('*')];
    const latest=els.find(el=>el.children.length===0&&/^Latest Update$/i.test(norm(el.textContent)));
    if(latest){
      let box=latest.parentElement;
      for(let i=0;box&&i<6;i++,box=box.parentElement){
        const leaves=[...box.querySelectorAll('*')].filter(el=>el.children.length===0);
        const date=leaves.find(el=>/^(Sep(?:tember)?\s+11,?\s+2026|Sep(?:tember)?\s+12,?\s+2026)$/i.test(norm(el.textContent)));
        if(date){date.textContent='Sep 15, 2026';break;}
      }
    }
    for(const el of els){
      if(el.children.length===0&&/^(Sep(?:tember)?\s+11,?\s+2026|Sep(?:tember)?\s+12,?\s+2026)$/i.test(norm(el.textContent))) el.textContent='Sep 15, 2026';
    }
  }
  apply();
  [50,150,400,900,1800,3200].forEach(ms=>setTimeout(apply,ms));
  window.addEventListener('pageshow',apply);
})();

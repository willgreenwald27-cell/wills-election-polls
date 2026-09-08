(()=>{
  const TARGET='88';
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();

  function fixHomePollCount(){
    const root=document.getElementById('page-home');
    if(!root) return;
    const metrics=root.querySelector('.reference-metrics')||root;

    const walker=document.createTreeWalker(metrics,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode()) nodes.push(walker.currentNode);

    for(const node of nodes){
      const raw=node.nodeValue||'';
      if(!/\b13\b/.test(raw)) continue;
      let box=node.parentElement;
      let isPollMetric=false;
      for(let depth=0;box&&box!==metrics.parentElement&&depth<7;depth++,box=box.parentElement){
        if(/POLLS? ENTERED/i.test(norm(box.textContent))){isPollMetric=true;break;}
      }
      if(isPollMetric) node.nodeValue=raw.replace(/\b13\b/g,TARGET);
    }

    for(const el of metrics.querySelectorAll('*')){
      const t=norm(el.textContent);
      if(/^13\s+POLLS? ENTERED$/i.test(t)&&el.children.length===0){
        el.textContent=t.replace(/^13/,TARGET);
      }
    }
  }

  fixHomePollCount();
  setTimeout(fixHomePollCount,100);
  setTimeout(fixHomePollCount,600);
  setTimeout(fixHomePollCount,1500);
  new MutationObserver(fixHomePollCount).observe(document.body,{childList:true,subtree:true,characterData:true});
  window.addEventListener('pageshow',fixHomePollCount);
})();

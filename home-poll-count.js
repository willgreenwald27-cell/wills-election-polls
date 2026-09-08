(()=>{
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();

  function findMetricCard(root,labelText){
    const labels=[...root.querySelectorAll('*')].filter(el=>el.children.length===0&&norm(el.textContent).toLowerCase()===labelText.toLowerCase());
    for(const label of labels){
      let box=label.parentElement;
      for(let depth=0;box&&box!==root&&depth<8;depth++,box=box.parentElement){
        const t=norm(box.textContent).toLowerCase();
        if(t.includes(labelText.toLowerCase())) return box;
      }
    }
    return null;
  }

  function replaceLeafText(root,matcher,replacement){
    if(!root) return false;
    let changed=false;
    for(const el of root.querySelectorAll('*')){
      if(el.children.length!==0) continue;
      const t=norm(el.textContent);
      if(matcher.test(t)){
        el.textContent=replacement;
        changed=true;
      }
    }
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    for(const node of nodes){
      const raw=node.nodeValue||'';
      if(matcher.test(norm(raw))){
        node.nodeValue=raw.replace(raw.trim(),replacement);
        changed=true;
      }
    }
    return changed;
  }

  function fixHomeStats(){
    const root=document.getElementById('page-home');
    if(!root) return;

    const pollsCard=findMetricCard(root,'Polls Entered');
    if(pollsCard){
      replaceLeafText(pollsCard,/^13$/,'88');
      for(const el of pollsCard.querySelectorAll('*')){
        if(el.children.length===0&&/^13\s+POLLS? ENTERED$/i.test(norm(el.textContent))){
          el.textContent=norm(el.textContent).replace(/^13/,'88');
        }
      }
    }

    const updateCard=findMetricCard(root,'Latest Update');
    if(updateCard){
      replaceLeafText(updateCard,/^(Sep\.?\s*6,\s*2026|2026-09-06)$/i,'Sep 7, 2026');
    }
  }

  fixHomeStats();
  setTimeout(fixHomeStats,100);
  setTimeout(fixHomeStats,500);
  setTimeout(fixHomeStats,1200);
  setTimeout(fixHomeStats,2500);
  new MutationObserver(fixHomeStats).observe(document.body,{childList:true,subtree:true,characterData:true});
  window.addEventListener('pageshow',fixHomeStats);
  window.addEventListener('focus',fixHomeStats);
})();

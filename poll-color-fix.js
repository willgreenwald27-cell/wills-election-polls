(()=>{
  'use strict';
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  function fix(){
    const root=document.getElementById('page-polls');
    if(!root)return;
    const leaves=[...root.querySelectorAll('*')].filter(el=>el.children.length===0&&el.getClientRects().length);
    for(const nameEl of leaves.filter(el=>/^Graham Nordone$/i.test(norm(el.textContent)))){
      nameEl.style.setProperty('color','#17263d','important');
      let row=nameEl.parentElement;
      for(let i=0;row&&row!==root&&i<5;i++,row=row.parentElement){
        const t=norm(row.textContent);
        if(/Graham Nordone/i.test(t)&&/45(?:\.0)?%?/.test(t))break;
      }
      if(!row||row===root)continue;
      row.querySelectorAll('*').forEach(el=>{
        const t=norm(el.textContent);
        if(/^45(?:\.0)?%$/.test(t))el.style.setProperty('color','#bd2937','important');
      });
      const candidates=[...row.querySelectorAll('div,span,i')].filter(el=>{
        const r=el.getBoundingClientRect(),cs=getComputedStyle(el);
        return r.width>40&&r.height>=5&&r.height<=28&&cs.backgroundColor!=='rgba(0, 0, 0, 0)'&&cs.backgroundColor!=='transparent';
      }).sort((a,b)=>b.getBoundingClientRect().width-a.getBoundingClientRect().width);
      if(candidates[0])candidates[0].style.setProperty('background','#bd2937','important');
    }
  }
  fix();[100,350,800,1600,3200].forEach(ms=>setTimeout(fix,ms));setInterval(fix,600);
  new MutationObserver(()=>requestAnimationFrame(fix)).observe(document.body,{childList:true,subtree:true,characterData:true});
})();

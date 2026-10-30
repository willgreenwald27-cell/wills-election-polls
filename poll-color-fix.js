(()=>{
  'use strict';
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const RED='#bd2937', INK='#17263d';

  function isBlue(bg){
    return /rgb\((?:39,\s*99,\s*184|44,\s*102,\s*190|49,\s*105,\s*192|38,\s*98,\s*184)\)/i.test(bg||'');
  }

  function fix(){
    const root=document.getElementById('page-polls');
    if(!root)return;
    const leaves=[...root.querySelectorAll('*')].filter(el=>el.children.length===0&&el.getClientRects().length);
    for(const nameEl of leaves.filter(el=>/^Graham Nordone$/i.test(norm(el.textContent)))){
      nameEl.style.setProperty('color',INK,'important');

      let candidateRow=nameEl.parentElement;
      for(let i=0;candidateRow&&candidateRow!==root&&i<7;i++,candidateRow=candidateRow.parentElement){
        const t=norm(candidateRow.textContent);
        if(/Graham Nordone/i.test(t)&&/45(?:\.0)?%?/.test(t)&&!/Annie Andrews/i.test(t))break;
      }
      if(!candidateRow||candidateRow===root)continue;

      candidateRow.querySelectorAll('*').forEach(el=>{
        const t=norm(el.textContent);
        if(/^Graham Nordone$/i.test(t))el.style.setProperty('color',INK,'important');
        if(/^45(?:\.0)?%$/.test(t))el.style.setProperty('color',RED,'important');
        const r=el.getBoundingClientRect();
        if(r.width>35&&r.height>=4&&r.height<=22&&isBlue(getComputedStyle(el).backgroundColor)){
          el.style.setProperty('background',RED,'important');
          el.style.setProperty('background-color',RED,'important');
        }
      });
    }
  }

  // Apply on initial render and when the polls page is shown. Avoid a
  // document-wide mutation observer plus 250ms timer: they trigger on
  // our own style changes and cause repeated repaints/flashing.
  fix();
  [100,450,1200].forEach(ms=>setTimeout(fix,ms));
  document.addEventListener('click',e=>{if(e.target?.closest?.('[data-page-link="polls"],[data-accepted-page="polls"]'))setTimeout(fix,60);},true);
  window.addEventListener('pageshow',fix);
})();

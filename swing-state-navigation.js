(()=>{
  'use strict';
  // Navigation-only repair: never modify the homepage layout or election data.
  const DEST='/2026-senate-battlegrounds.html';
  const NAME='Swing State Explanations';
  const TAB_ID='wg-swing-analysis-tab';
  const simPattern=/election\\s*night|simulation|simulator/i;
  function isSimulator(el){
    return el.id==='wg-sim-built-in-nav'||el.id==='will-election-sim-nav'||
      el.dataset?.wgNightLink==='true'||
      simPattern.test((el.textContent||'')+' '+(el.getAttribute('href')||''))||
      /electionnight/i.test(el.getAttribute('data-spa-page')||'');
  }
  let queued=false;
  function apply(){
    queued=false;
    document.querySelectorAll('#wg-sim-home-shortcut,#wg-analysis-home').forEach(el=>el.remove());
    const nav=document.querySelector('.site-header .nav');
    if(!nav)return;
    const items=[...nav.querySelectorAll('a,button')];
    let tab=nav.querySelector('#'+TAB_ID);
    if(!tab){
      tab=document.createElement('a');
      tab.id=TAB_ID;
      tab.href=DEST;
      tab.textContent=NAME;
      const senate=items.find(el=>/senate/i.test((el.textContent||''))&&!isSimulator(el));
      const simulator=items.find(isSimulator);
      const about=items.find(el=>/^(about|about me)$/i.test((el.textContent||'').trim()));
      if(senate)senate.insertAdjacentElement('afterend',tab);
      else if(simulator)simulator.insertAdjacentElement('beforebegin',tab);
      else nav.insertBefore(tab,about||null);
    }
    for(const el of [...nav.querySelectorAll('a,button')]){
      if(el!==tab&&(isSimulator(el)||el.id===TAB_ID))el.remove();
    }
    document.querySelectorAll('#wg-sim-built-in-nav,#will-election-sim-nav').forEach(el=>el.remove());
    if(tab.getAttribute('href')!==DEST)tab.setAttribute('href',DEST);
    if(tab.textContent!==NAME)tab.textContent=NAME;
  }
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(apply);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('pageshow',apply);
})();

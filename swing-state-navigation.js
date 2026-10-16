(()=>{
  'use strict';
  // Keep the site's original homepage, map and seven-page navigation functional.
  const DEST='/2026-senate-battlegrounds.html', NAME='Swing State Explanations';
  const TAB_ID='wg-swing-analysis-tab';
  const simPattern=/election\s*night|simulation|simulator/i;
  function isSimulator(el){
    return el.id==='wg-sim-built-in-nav'||el.id==='will-election-sim-nav'||
      el.dataset?.wgNightLink==='true'||
      /electionnight/i.test(
        (el.getAttribute('data-accepted-page')||'')+' '+(el.getAttribute('data-spa-page')||'')+
        ' '+(el.getAttribute('data-page-link')||'')+' '+(el.getAttribute('data-will-page')||'')
      )||
      simPattern.test((el.textContent||'')+' '+(el.getAttribute('href')||''));
  }
  let queued=false;
  function apply(){
    queued=false;
    // Undo the old full-screen simulator, which can cover links and block scrolling.
    const u=new URL(location.href);
    let wasNight=false;
    if(u.searchParams.get('page')==='electionnight'){
      wasNight=true;u.searchParams.delete('page');
      history.replaceState(null,'',u.pathname+u.search+u.hash);
    }
    document.body?.classList.remove('wg-night-active');
    document.querySelectorAll(
      '#wg-night-view,#wg-night-embed-style,#wg-sim-home-shortcut,#wg-analysis-home'
    ).forEach(el=>el.remove());
    const nav=document.querySelector('.site-header .nav');
    if(!nav)return;
    let tab=nav.querySelector('#'+TAB_ID);
    const items=[...nav.querySelectorAll(':scope > a,:scope > button')];
    // Remove all legacy simulator tabs, even those inserted after initial load.
    for(const el of items)if(el!==tab&&isSimulator(el))el.remove();
    if(!tab){
      tab=document.createElement('a');
      tab.id=TAB_ID;tab.textContent=NAME;tab.href=DEST;
      const senate=items.find(el=>el.isConnected&&/senate/i.test(el.textContent||'')&&!isSimulator(el));
      const about=items.find(el=>el.isConnected&&/^(about|about me)$/i.test((el.textContent||'').trim()));
      if(senate)senate.insertAdjacentElement('afterend',tab);
      else nav.insertBefore(tab,about||null);
    }
    if(tab.getAttribute('href')!==DEST)tab.setAttribute('href',DEST);
    if(tab.textContent!==NAME)tab.textContent=NAME;
    if(wasNight&&typeof window.__acceptedGoodNavigate==='function'){
      window.__acceptedGoodNavigate('home',false);
    }
  }
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(apply);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('pageshow',apply);
})();
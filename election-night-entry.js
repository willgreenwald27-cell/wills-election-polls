(()=>{
  'use strict';
  // The simulator is retired from site navigation. This compatibility file
  // cleans up any legacy overlay instead of trapping ordinary page tabs.
  function cleanup(){
    document.body?.classList.remove('wg-night-active');
    for(const selector of ['#wg-night-view','#wg-night-embed-style','#will-election-sim-nav','#wg-sim-built-in-nav','#wg-sim-home-shortcut']){
      document.querySelectorAll(selector).forEach(el=>el.remove());
    }
    const url=new URL(location.href);
    if(url.searchParams.get('page')==='electionnight'){
      url.searchParams.delete('page');
      history.replaceState(null,'',url.pathname+url.search+url.hash);
      if(typeof window.__acceptedGoodNavigate==='function')window.__acceptedGoodNavigate('home',false);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',cleanup,{once:true});else cleanup();
  window.addEventListener('pageshow',cleanup);
})();

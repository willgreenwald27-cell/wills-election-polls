(()=>{
  'use strict';
  // Backward-compatible simulator shutdown. Older cached index.html versions
  // may still request this file; they must not create a blocking iframe.
  function clean(){
    const params=new URLSearchParams(location.search);
    if(params.get('page')==='electionnight'){
      const u=new URL(location.href);
      u.searchParams.delete('page');
      history.replaceState(null,'',u.pathname+u.search+u.hash);
    }
    if(document.body)document.body.classList.remove('wg-night-active');
    document.querySelectorAll('#wg-night-view,#wg-night-embed-style,#wg-sim-home-shortcut,#wg-sim-built-in-nav,#will-election-sim-nav,.site-header .nav [data-wg-night-link="true"]').forEach(el=>el.remove());
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',clean,{once:true});else clean();
  window.addEventListener('pageshow',clean);
})();
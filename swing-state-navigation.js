(()=>{
 'use strict';
 // Compatibility cleanup for older cached index.html versions.
 // A native Swing State Explanations tab is supplied by accepted-good.js.
 // Do NOT create another tab, intercept clicks, or observe DOM mutations.
 function clean(){
  document.querySelectorAll('#wg-swing-analysis-tab').forEach(el=>el.remove());
  document.querySelectorAll('.site-header .nav > a[href*="2026-senate-battlegrounds.html"]').forEach(el=>el.remove());
  document.querySelectorAll('#wg-night-view,#wg-night-embed-style,#will-election-sim-nav,#wg-sim-built-in-nav').forEach(el=>el.remove());
  document.body?.classList.remove('wg-night-active');
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',clean,{once:true});else clean();
 window.addEventListener('pageshow',clean);
})();

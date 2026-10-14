(()=>{
'use strict';
const TARGET='/2026-senate-simulation.html?v=resultsdesk-20261013-v2';
const ID='will-election-sim-nav';
function install(){
 const nav=document.querySelector('.site-header .nav');
 if(!nav)return;
 if(!document.getElementById('will-sim-nav-style')){
  const css=document.createElement('style');
  css.id='will-sim-nav-style';
  css.textContent=`
    .site-header .nav #${ID}{display:inline-flex!important;align-items:center;justify-content:center;gap:4px;cursor:pointer!important;
      border:1px solid #c3394c!important;background:#c3394c!important;color:white!important;
      padding:8px 11px!important;font:800 11px/1.2 Inter,Arial,sans-serif!important;
      border-radius:6px!important;white-space:nowrap!important;text-decoration:none!important;opacity:1!important;visibility:visible!important}
    .site-header .nav #${ID}:hover{background:#9f263a!important}
    @media(max-width:700px){.site-header .nav #${ID}{font-size:10px!important;padding:8px!important}}
  `;
  document.head.appendChild(css);
 }
 const existing=nav.querySelector('#'+ID);
 if(existing)return;
 const btn=document.createElement('a');
 btn.id=ID;btn.href=TARGET;
 btn.textContent='Election Night Simulator';
 btn.title='2026 Senate Election Night Simulation';
 btn.setAttribute('aria-label','2026 Senate Election Night Simulation');
 // Put it immediately before About, as the final main navigation tab.
 const about=[...nav.querySelectorAll('a,button,[role="link"]')].find(el=>/^(about|about me)$/i.test((el.textContent||'').trim())||
   /about/i.test(el.getAttribute('data-page')||el.getAttribute('data-accepted-page')||''));
 if(about)nav.insertBefore(btn,about);
 else nav.appendChild(btn);
}
function init(){
 install();
 let waiting=false;
 new MutationObserver(()=>{if(waiting)return;waiting=true;requestAnimationFrame(()=>{waiting=false;install();});})
  .observe(document.body,{subtree:true,childList:true});
 window.addEventListener('pageshow',install);
 setInterval(install,1700);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

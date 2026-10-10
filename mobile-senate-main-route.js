/* Route only the mobile 2026 Senate tab to its October 9 classic page. */
(()=>{
 'use strict';
 const classic='/mobile-senate-classic.html?page=senate';
 const mobile=()=>window.matchMedia('(max-width:767px)').matches;
 const senateLink=(e)=>{
  const el=e.target&&e.target.closest&&e.target.closest('.site-header .nav [data-page-link],.site-header .nav [data-accepted-page],.site-header .nav [data-will-page],.site-header .nav [data-spa-page]');
  if(!el)return false;
  const id=el.getAttribute('data-page-link')||el.getAttribute('data-accepted-page')||el.getAttribute('data-will-page')||el.getAttribute('data-spa-page');
  return id==='senate'||(!id&&/2026 senate/i.test(el.textContent||''));
 };
 if(mobile()&&['/','/index.html'].includes(location.pathname)&&new URLSearchParams(location.search).get('page')==='senate'){
   location.replace(classic);return;
 }
 document.addEventListener('click',e=>{
   if(!mobile()||!senateLink(e))return;
   e.preventDefault();e.stopImmediatePropagation();
   location.assign(classic);
 },true);
})();
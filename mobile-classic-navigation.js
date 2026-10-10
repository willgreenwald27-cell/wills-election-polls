/* Keep the historical Senate shell on this route only. Other tabs use the current site. */
(()=>{
 'use strict';
 const mobile=()=>window.matchMedia('(max-width:767px)').matches;
 if(!mobile()){location.replace('/?page=senate');return}
 document.addEventListener('click',e=>{
  const node=e.target&&e.target.closest&&e.target.closest('.site-header .nav [data-page-link],.site-header .nav [data-accepted-page],.site-header .nav [data-will-page],.site-header .nav [data-spa-page]');
  if(!node)return;
  const page=node.getAttribute('data-page-link')||node.getAttribute('data-accepted-page')||node.getAttribute('data-will-page')||node.getAttribute('data-spa-page');
  if(!page||page==='senate')return;
  e.preventDefault();e.stopImmediatePropagation();
  location.assign(page==='home'?'/':'/?page='+encodeURIComponent(page));
 },true);
 // The old page shell may not automatically read a deep-link query;
 // select the Senate tab once the original page and handlers are ready.
 const reveal=()=>{
   const page=document.getElementById('page-senate');
   if(!page||page.classList.contains('active'))return Boolean(page&&page.classList.contains('active'));
   const nav=document.querySelector('.site-header .nav [data-page-link="senate"],.site-header .nav [data-accepted-page="senate"]');
   try {if(typeof showPage==='function') showPage('senate');
       else if(nav)nav.click();}
   catch(e){}
   return page.classList.contains('active');
 };
 document.addEventListener('DOMContentLoaded',()=>{
   let count=0;
   const handle=setInterval(()=>{if(reveal()||++count>22)clearInterval(handle)},250);
 },{once:true});
})();
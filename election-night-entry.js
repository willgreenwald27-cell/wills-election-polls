(()=>{
'use strict';
const TARGET='/election-night.html';
function install(){
 const nav=document.querySelector('.site-header .nav');
 if(!nav)return;
 if(!document.getElementById('wg-night-nav-style')){
  const style=document.createElement('style');
  style.id='wg-night-nav-style';
  style.textContent=`
    .site-header .nav [data-election-night-nav]{
      border:1px solid #cb4656!important;
      background:#c7283d!important;
      color:#fff!important;
      font-weight:900!important;
      font-size:12px!important;
      padding:10px 13px!important;
      border-radius:9px!important;
      white-space:nowrap!important;
      cursor:pointer!important;
      flex-shrink:0!important;
      letter-spacing:.1px!important;
      text-decoration:none!important;
      pointer-events:auto!important;
    }
    .site-header .nav [data-election-night-nav]:hover{background:#a9192c!important}
  `;
  document.head.appendChild(style);
 }
 if(nav.querySelector('[data-election-night-nav]'))return;
 const button=document.createElement('button');
 button.type='button';
 button.dataset.electionNightNav='1';
 button.textContent='Election Night';
 button.setAttribute('aria-label','2026 Election Night live results');
 button.addEventListener('click',e=>{
  e.preventDefault();
  e.stopPropagation();
  window.location.assign(TARGET);
 });
 nav.appendChild(button);
}
function init(){
 install();
 // Several legacy scripts rebuild the navigation, so restore this one
 // supplemental link without modifying their page state or button lists.
 setInterval(install,1200);
 window.addEventListener('pageshow',install);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();
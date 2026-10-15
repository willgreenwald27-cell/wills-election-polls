(()=>{
'use strict';
// The election night simulator lives inside the normal Will's Election Polls tab.
// Preserve the main site's navigation and URL instead of opening another page.
const ROUTE='electionnight';
const ROUTE_URL='/?page=electionnight';
const SIM='/2026-senate-simulation.html?embedded=1&v=20261014-inline-night-v1';
const NAV_ID='will-election-sim-nav';
const builtInId='wg-sim-built-in-nav';
let installed=false;
function isNight(){return new URLSearchParams(location.search).get('page')===ROUTE;}
function styles(){
 if(document.getElementById('wg-night-embed-style'))return;
 const sheet=document.createElement('style');
 sheet.id='wg-night-embed-style';
 sheet.textContent=`
 body.wg-night-active{overflow:hidden!important}
 body.wg-night-active .site-header{
   display:flex!important;position:fixed!important;top:0!important;left:0!important;right:0!important;
   z-index:2147483646!important;visibility:visible!important;
 }
 #wg-night-view{
   display:none;position:fixed;top:var(--wg-night-top,70px);left:0;right:0;bottom:0;
   z-index:2147483645;background:#fff;overflow:hidden;margin:0;padding:0;border:0;
 }
 body.wg-night-active #wg-night-view{display:block!important}
 #wg-night-view iframe{
   display:block;width:100%;height:100%;border:0;margin:0;padding:0;
   background:white;
 }
 .site-header .nav a[data-wg-night-link="true"]{
   display:inline-flex!important;align-items:center;justify-content:center;
   font-weight:800!important;white-space:nowrap;
   text-decoration:none!important;cursor:pointer;
 }
 body.wg-night-active .site-header .nav a[data-wg-night-link="true"]{
   background:#1b609f!important;color:white!important;border-radius:6px;
 }
 @media(max-width:740px){
   #wg-night-view{top:var(--wg-night-top,55px)}
   .site-header .nav a[data-wg-night-link="true"]{font-size:10px!important}
 }`;
 document.head.append(sheet);
}
function overlay(){
 let view=document.getElementById('wg-night-view');
 if(view)return view;
 view=document.createElement('section');
 view.id='wg-night-view';view.setAttribute('aria-label',"Will's Election Night Simulator");
 const iframe=document.createElement('iframe');
 iframe.src=SIM;iframe.title="Will's 2026 Senate Election Night Prediction";
 iframe.setAttribute('loading','eager');
 iframe.setAttribute('allow','fullscreen');
 view.append(iframe);document.body.append(view);
 return view;
}
function position(){
 const header=document.querySelector('.site-header');
 if(header){
  const h=Math.max(40,Math.ceil(header.getBoundingClientRect().height));
  document.documentElement.style.setProperty('--wg-night-top',h+'px');
 }
}
function render(){
 const active=isNight();
 if(active){styles();overlay();window.scrollTo(0,0);}
 document.body.classList.toggle('wg-night-active',active);
 position();
 const links=document.querySelectorAll('[data-wg-night-link="true"]');
 links.forEach(a=>{
  if(active)a.setAttribute('aria-current','page');
  else a.removeAttribute('aria-current');
 });
}
function install(){
 const nav=document.querySelector('.site-header .nav');
 if(!nav)return;
 let tab=nav.querySelector('#'+builtInId)||nav.querySelector('#'+NAV_ID);
 if(!tab){
  tab=document.createElement('a');tab.id=NAV_ID;tab.textContent='Election Night Simulator';
  const about=[...nav.querySelectorAll('a,button')].find(el=>/^(about|about me)$/i.test((el.textContent||'').trim()));
  if(about)nav.insertBefore(tab,about);else nav.append(tab);
 }
 tab.href=ROUTE_URL;tab.dataset.wgNightLink='true';
 const duplicate=nav.querySelector('#'+NAV_ID);
 if(duplicate&&duplicate!==tab)duplicate.remove();
 document.querySelectorAll('#wg-sim-home-shortcut a, a[href*="/2026-senate-simulation.html"]').forEach(a=>{
  if(a.closest('#wg-night-view'))return;
  a.href=ROUTE_URL;a.dataset.wgNightLink='true';
 });
 if(!installed){installed=true;render();}
}
function navigate(event){
 const link=event.target.closest('a[href]');
 if(!link)return;
 let parsed;try{parsed=new URL(link.href,location.href);}catch{return;}
 if(parsed.origin!==location.origin)return;
 const toNight=parsed.pathname==='/'&&parsed.searchParams.get('page')===ROUTE;
 if(toNight||parsed.pathname.endsWith('/2026-senate-simulation.html')){
  event.preventDefault();event.stopPropagation();
  if(!isNight())history.pushState({wgNight:true},'',ROUTE_URL);
  render();return;
 }
 if(document.body.classList.contains('wg-night-active')){
  // Let other normal-site navigation run while immediately dismissing the simulator.
  document.body.classList.remove('wg-night-active');
 }
}
function init(){
 styles();install();render();
 document.addEventListener('click',navigate,true);
 window.addEventListener('popstate',()=>{install();render();});
 window.addEventListener('resize',position);
 if(window.ResizeObserver){const h=document.querySelector('.site-header');if(h)new ResizeObserver(position).observe(h);}
 let pending=false;
 new MutationObserver(()=>{
  if(pending)return;pending=true;
  requestAnimationFrame(()=>{pending=false;install();if(isNight())position();});
 }).observe(document.body,{subtree:true,childList:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

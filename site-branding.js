(()=>{
'use strict';
const ICON='/site-icon.svg?v=20261009-capitol1';
const WORDMARK='/site-wordmark.svg?v=20261009-capitol1';
function brandedImage(url,alt,kind){
 const img=document.createElement('img');
 img.src=url;img.alt=alt;img.loading='eager';img.decoding='async';
 img.dataset.willBrand='20261009-capitol';
 img.className=kind;
 return img;
}
function convert(el,url,kind,alt){
 if(!el)return;
 // Keep the existing position and layout; change just the visible logo.
 if(el.tagName.toLowerCase()==='img'){
   if(el.getAttribute('src')!==url)el.setAttribute('src',url);
   el.alt=alt;
   el.dataset.willBrand='20261009-capitol';
   return;
 }
 if(el.tagName.toLowerCase()==='svg'){
   const img=brandedImage(url,alt,kind);
   if(el.getAttribute('class'))img.className=el.getAttribute('class')+' '+kind;
   el.replaceWith(img);
   return;
 }
 const child=[...el.children].find(x=>x.tagName.toLowerCase()==='img'&&x.dataset.willBrand==='20261009-capitol');
 if(child)return;
 const img=brandedImage(url,alt,kind);
 el.replaceChildren(img);
}
function setFavicons(){
 const candidates=[...document.head.querySelectorAll('link[rel~="icon"]')];
 for(const el of candidates){
   if(el.getAttribute('rel')==='apple-touch-icon')continue;
   if(el.getAttribute('data-will-brand')==='20261009-capitol')continue;
   el.remove();
 }
 if(document.head.querySelector('link[data-will-brand="20261009-capitol"]'))return;
 const link=document.createElement('link');
 link.rel='icon';link.type='image/svg+xml';link.sizes='any';link.href=ICON;link.dataset.willBrand='20261009-capitol';
 document.head.appendChild(link);
}
function ensureStyles(){
 if(document.getElementById('will-logo-style-20261009-capitol-capitol'))return;
 const s=document.createElement('style');s.id='will-logo-style-20261009-capitol-capitol';
 s.textContent=`
 .reference-brand-icon img[data-will-brand="20261009-capitol"]{display:block;width:100%;height:100%;object-fit:contain}
 img.reference-brand-icon[data-will-brand="20261009-capitol"]{object-fit:contain!important}
 .reference-hero-mark img.brand-arc-hero[data-will-brand="20261009-capitol"]{display:block;object-fit:contain;max-height:330px!important;width:min(560px,45vw)!important;max-width:100%!important}
 #page-about .about-logo-stage img[data-will-brand="20261009-capitol"]{width:min(100%,650px)!important;max-width:650px!important;height:auto!important;object-fit:contain!important}
 .site-header .brand-mark img[data-will-brand="20261009-capitol"]{display:block;width:100%;height:100%;object-fit:contain}
 @media(max-width:640px){.reference-hero-mark img.brand-arc-hero[data-will-brand="20261009-capitol"]{width:min(420px,90vw)!important}}
 `;
 document.head.appendChild(s);
}
let queued=false;
function apply(){
 queued=false;
 if(!document.body)return;
 setFavicons();
 ensureStyles();
 for(const node of document.querySelectorAll('.reference-brand-icon')){
   convert(node,ICON,'reference-brand-icon','Will’s Election Polls logo');
 }
 for(const node of document.querySelectorAll('.brand-arc-hero')){
   convert(node,WORDMARK,'brand-arc-hero','Will’s Election Polls logo');
 }
 for(const node of document.querySelectorAll('.site-header .brand-mark')){
   convert(node,ICON,'brand-mark','Will’s Election Polls logo');
 }
 for(const stage of document.querySelectorAll('#page-about .about-logo-stage')){
   const graphic=stage.querySelector('svg,img');
   if(graphic)convert(graphic,WORDMARK,'will-wordmark','Will’s Election Polls');
 }
}
function schedule(){
 if(queued)return;
 queued=true;
 requestAnimationFrame(apply);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
const observer=new MutationObserver(schedule);
observer.observe(document.documentElement,{childList:true,subtree:true});
[300,900,2200,4500].forEach(t=>setTimeout(apply,t));
window.addEventListener('pageshow',apply);
})();

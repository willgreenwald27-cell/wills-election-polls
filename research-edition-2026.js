(()=>{
 "use strict";
 // Research Edition presentation only. Leaves forecast, poll arrays,
 // map behavior, ratings, and existing SPA navigation untouched.
 const NAMES={senate:"2026 Senate Prediction",polls:"New Polls",errors:"Past Polling Errors",about:"About Me"};
 let queued=false;
 const mk=(tag,cls,html)=>{
  const el=document.createElement(tag);el.className=cls;if(html)el.innerHTML=html;return el;
 };
 function strip(){
  const hdr=document.querySelector(".site-header");
  if(!hdr)return;
  let el=document.querySelector(".wr-editorial-strip");
  if(!el){
   el=mk("div","wr-editorial-strip",'<span class="wr-issue">WILL’S ELECTION POLLS <span class="wr-issue-number">/ 2026</span></span><span class="wr-dot" aria-hidden="true"></span><span class="wr-focus">Forecasts</span><span class="wr-dot" aria-hidden="true"></span><span class="wr-dim">Polling</span><span class="wr-dot" aria-hidden="true"></span><span class="wr-dim">Historical analysis</span>');
   el.setAttribute("aria-label","Website research sections");
  }
  if(hdr.nextElementSibling!==el)hdr.insertAdjacentElement("afterend",el);
 }
 function guide(){
  const shell=document.querySelector("#page-home .reference-home-shell");
  if(!shell||shell.querySelector(".wr-research-guide"))return;
  const section=mk("section","wr-research-guide",
   '<div class="wr-guide-heading"><div><p class="wr-guide-kicker">BEYOND THE HEADLINE</p><h2 id="wr-research-heading">Follow the evidence.</h2><p>Explore the forecast, examine the latest polls, and compare the historical record. The important part of a prediction is understanding what informs it.</p></div><span class="wr-guide-index" aria-hidden="true">FIELD NOTES <b>/ 2026</b></span></div>'+
   '<div class="wr-research-cards">'+
   '<article class="wr-research-card"><span class="wr-card-num">01 <i aria-hidden="true"></i> FORECAST</span><h3>Every state. Every call.</h3><p>Explore Senate race ratings, candidate matchups, and individual state forecasts on the interactive map.</p><button type="button" class="wr-research-link" data-wr-go="senate">Explore Senate predictions <span aria-hidden="true">↗</span></button></article>'+
   '<article class="wr-research-card"><span class="wr-card-num">02 <i aria-hidden="true"></i> THE EVIDENCE</span><h3>Look behind the numbers.</h3><p>Browse recently entered polls, compare reported margins, and follow how the evidence is changing.</p><button type="button" class="wr-research-link" data-wr-go="polls">Browse new polls <span aria-hidden="true">↗</span></button></article>'+
   '<article class="wr-research-card"><span class="wr-card-num">03 <i aria-hidden="true"></i> PERSPECTIVE</span><h3>What polls can miss.</h3><p>Use the historical polling-error archive to see why even well-reported leads should be read with care.</p><button type="button" class="wr-research-link" data-wr-go="errors">Study past polling errors <span aria-hidden="true">↗</span></button></article>'+
   '</div><p class="wr-guide-qualification"><strong>A note on forecasting.</strong> Polls reflect surveys at a particular moment. Forecasts and race ratings are estimates, not election results or guarantees.</p>');
  section.setAttribute("aria-labelledby","wr-research-heading");
  shell.appendChild(section);
 }
 function about(){
  const page=document.getElementById("page-about");
  if(!page||page.querySelector(".wr-about-note"))return;
  const aside=mk("aside","wr-about-note",
   '<p class="wr-guide-kicker">ABOUT THE ANALYSIS</p><h2>Independent judgment. Open to scrutiny.</h2>'+
   '<p>This project brings race-by-race predictions, polling data, and historical comparisons together in one place. Forecasts interpret uncertain evidence; they are not official election results.</p>'+
   '<div class="wr-about-actions"><button type="button" data-wr-go="senate">See the forecasts <span aria-hidden="true">↗</span></button><button type="button" data-wr-go="errors">Explore polling history <span aria-hidden="true">↗</span></button></div>');
  aside.setAttribute("aria-label","About the forecasting project");
  page.appendChild(aside);
 }
 function footer(){
  if(document.querySelector(".wr-site-footer"))return;
  const el=mk("footer","wr-site-footer",
   '<div class="wr-foot-left"><strong>WILL’S ELECTION POLLS</strong><span>Independent election analysis</span></div>'+
   '<p>Polling, prediction, and historical context. Estimates are not results.</p>'+
   '<div class="wr-foot-links"><button type="button" data-wr-go="senate">Forecasts</button><button type="button" data-wr-go="polls">Polls</button><button type="button" data-wr-go="errors">History</button><button type="button" data-wr-go="about">About</button></div>');
  document.body.appendChild(el);
 }
 function skip(){
  if(document.querySelector(".wr-skip-link"))return;
  const btn=mk("button","wr-skip-link","Skip to page content");btn.type="button";
  btn.addEventListener("click",()=>{
   const target=[...document.querySelectorAll(".page")].find(x=>!x.hidden&&getComputedStyle(x).display!=="none");
   if(!target)return;
   if(!target.hasAttribute("tabindex"))target.setAttribute("tabindex","-1");
   target.focus({preventScroll:false});
  });
  document.body.insertAdjacentElement("afterbegin",btn);
 }
 function navigate(key){
  if(!NAMES[key])return;
  const nav=document.querySelector(".site-header .nav");
  if(!nav)return;
  const buttons=[...nav.querySelectorAll("button,a")];
  const btn=buttons.find(el=>
   ["data-spa-page","data-will-page","data-accepted-page","data-page-link"].some(k=>el.getAttribute(k)===key)
  )||buttons.find(el=>el.textContent?.trim().toLowerCase()===NAMES[key].toLowerCase());
  if(btn)btn.click();
 }
 document.addEventListener("click",event=>{
  const el=event.target?.closest?.("[data-wr-go]");if(!el)return;
  event.preventDefault();navigate(el.dataset.wrGo);
 });
 function apply(){queued=false;skip();strip();guide();about();footer()}
 function schedule(){if(queued)return;queued=true;requestAnimationFrame(apply)}
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",apply,{once:true});else apply();
 [150,500,1500,3500].forEach(ms=>setTimeout(apply,ms));
 new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
 window.addEventListener("pageshow",apply);
})();
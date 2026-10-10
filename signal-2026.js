(()=>{
 "use strict";
 // Signal/26: one data visualization sourced from EXISTING on-page Senate values.
 // Neither candidate/state predictions nor page navigation is modified.
 let rendered="",host=null;
 const toSeats=text=>{
  const m=String(text||"").match(/\b(\d{1,3})\b/);
  return m?Number(m[1]):null;
 };
 function numbers(){
  const root=document.getElementById("page-home");if(!root)return null;
  const fromBox=root.querySelector("#homeSenateForecast");
  if(fromBox){
   const d=toSeats(fromBox.querySelector(".wg-forecast-dem")?.textContent);
   const r=toSeats(fromBox.querySelector(".wg-forecast-rep")?.textContent);
   if(Number.isInteger(d)&&Number.isInteger(r)&&d>=0&&r>=0&&d+r===100)return [d,r];
  }
  const chart=root.querySelector("#homeForecastSplit .final-senate-card, #homeForecastSplit .senate-card, #homeForecastSplit .will-senate-card");
  if(chart){
   const d=toSeats(chart.querySelector(".final-party-number.dem, .party-number.dem")?.textContent);
   const r=toSeats(chart.querySelector(".final-party-number.rep, .party-number.rep")?.textContent);
   if(Number.isInteger(d)&&Number.isInteger(r)&&d>=0&&r>=0&&d+r===100)return [d,r];
  }
  return null;
 }
 function module(){
  const hero=document.querySelector("#page-home.reference-home .reference-hero");
  if(!hero)return null;
  let el=hero.querySelector(".wr-signal-module");
  if(el)return el;
  el=document.createElement("section");
  el.className="wr-signal-module";
  el.setAttribute("aria-label","Current Senate forecast, seat-balance visualization");
  el.innerHTML=
   '<div class="wr-signal-top"><span class="wr-signal-kicker">THE BALANCE OF POWER</span><span class="wr-signal-source">WILL’S SENATE PROJECTION</span></div>'+
   '<div class="wr-signal-split">'+
     '<div class="wr-signal-side left"><strong class="wr-signal-number" data-sg-dem>—</strong><span class="wr-signal-name">Democrats</span></div>'+
     '<div class="wr-signal-side right"><span class="wr-signal-name">Republicans</span><strong class="wr-signal-number" data-sg-rep>—</strong></div>'+
   '</div>'+
   '<div class="wr-seat-grid" role="img" aria-label="Forecast seat-balance graphic; waiting for page data"></div>'+
   '<div class="wr-signal-foot"><span>100 Senate seats · 51 needed for a majority</span><button type="button" data-sg-open-map>Explore the Senate map ↗</button></div>';
  hero.appendChild(el);
  el.querySelector("[data-sg-open-map]")?.addEventListener("click",()=>{
   const buttons=[...document.querySelectorAll(".site-header .nav button,.site-header .nav a")];
   const target=buttons.find(b=>["data-spa-page","data-will-page","data-accepted-page","data-page-link"].some(k=>b.getAttribute(k)==="senate"))
     ||buttons.find(b=>/2026 Senate Prediction/i.test(b.textContent||""));
   if(target)target.click();
  });
  return el;
 }
 function update(){
  const el=module();if(!el)return;
  const data=numbers();if(!data)return;
  const [d,r]=data;
  const stamp=d+"-"+r;
  if(rendered===stamp&&host===el)return;
  rendered=stamp;host=el;
  const a=el.querySelector("[data-sg-dem]"),b=el.querySelector("[data-sg-rep]");
  if(a)a.textContent=String(d);
  if(b)b.textContent=String(r);
  const grid=el.querySelector(".wr-seat-grid");if(!grid)return;
  if(grid.dataset.forecast===stamp)return;
  const frag=document.createDocumentFragment();
  for(let i=0;i<100;i++){
   const seg=document.createElement("span");
   seg.className="wr-seat "+(i<d?"dem":"rep");
   seg.style.setProperty("--ix",String(i));
   seg.setAttribute("aria-hidden","true");
   frag.appendChild(seg);
  }
  grid.replaceChildren(frag);
  grid.dataset.forecast=stamp;
  grid.setAttribute("aria-label","Will's Senate forecast: "+d+" Democratic seats and "+r+" Republican seats out of 100");
 }
 function start(){
  update();
  [150,450,1200,2600,4500].forEach(ms=>setTimeout(update,ms));
  window.setInterval(update,3200);
  window.addEventListener("pageshow",update);
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});
 else start();
})();
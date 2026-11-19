(()=>{'use strict';
  // November 18 2026: 56 seats in Democratic caucus (54 D + 2 I),
  // 44 Republicans, with all 100 Senate seats called.
  const cards='#homeForecastSplit .senate-card,#homeForecastSplit .final-senate-card,#page-home .will-senate-card';
  function put(el,val){if(el&&el.textContent!==val)el.textContent=val;}
  function width(el,val){if(el&&el.style.getPropertyValue('width')!==val)el.style.setProperty('width',val,'important');}
  function update(){
    const root=document.getElementById('page-home');if(!root)return;
    const compact=root.querySelector('#homeSenateForecast');
    if(compact){
      const label=compact.querySelector('.wg-metric-label');
      put(label,'2026 SENATE RESULTS');
      put(compact.querySelector('.wg-forecast-dem'),'56 D');
      put(compact.querySelector('.wg-forecast-rep'),'44 R');
      compact.setAttribute('aria-label','November 18 Senate results: 56 Democratic caucus seats, 44 Republican seats; all 100 called');
    }
    for(const card of root.querySelectorAll(cards)){
      put(card.querySelector('.senate-title,.final-title,.will-split-title'),'2026 Senate Results');
      const numbers=[...card.querySelectorAll('.party-number,.final-party-number')];
      if(numbers.length>=2){put(numbers[0],'56');put(numbers[1],'44');}
      const title=card.querySelector('.senate-kicker,.final-kicker,.will-split-sub');
      if(title)put(title,'NOVEMBER 18 · REPORTED SEAT COUNT');
      const labels=card.querySelectorAll('.final-party-label,.party-label');
      if(labels.length>=2)put(labels[0],'Democratic caucus');
      const d=card.querySelector('.senate-bar .dem,.final-bar .dem,.dem-bar');
      const r=card.querySelector('.senate-bar .rep,.final-bar .rep,.rep-bar');
      width(d,'56%');width(r,'44%');
      const bar=card.querySelector('.senate-bar,.final-bar,.will-split-bar');
      if(bar){
        let remain=bar.querySelector('.wg-remaining-seats');
        if(!remain){remain=document.createElement('span');remain.className='wg-remaining-seats';bar.appendChild(remain);}
        remain.style.cssText='display:none!important;width:0%!important;height:100%!important;flex:0 0 0%!important';
        bar.setAttribute('aria-label','56 Democratic caucus seats, 44 Republican seats, 0 uncalled');
      }
      const note=card.querySelector('.majority-note,.final-majority-note,.will-split-majority');
      if(note)put(note,'ALL 100 SEATS CALLED · D INCLUDES 2 INDEPENDENTS');
      const finalForecast=card.querySelector('.wg-original-prediction');
      if(!finalForecast){
        const span=document.createElement('div');span.className='wg-original-prediction';
        span.textContent='Final pre-election forecast: 52 D / 48 R';
        span.style.cssText='font-size:10px;line-height:1.45;color:#667990;font-weight:700;text-align:center;margin-top:6px';
        card.appendChild(span);
      }
      const call=card.querySelector('.will-split-parties');
      if(call){
        const leaders=call.querySelectorAll('strong');
        if(leaders.length>=2){put(leaders[0],'DEMOCRATIC CAUCUS: 56');put(leaders[1],'REPUBLICANS: 44');}
      }
      const barLabels=card.querySelectorAll('.will-split-bar-labels strong');
      if(barLabels.length>=2){put(barLabels[0],'56');put(barLabels[1],'44');}
      const smallLabels=card.querySelectorAll('.will-split-legend small');
      if(smallLabels.length>=2){put(smallLabels[0],'56 seats');put(smallLabels[1],'44 seats');}
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',update,{once:true});else update();
  [100,450,1250,2800,4500].forEach(ms=>setTimeout(update,ms));
  window.addEventListener('pageshow',update);
  document.addEventListener('click',e=>{if(e.target?.closest?.('.site-header .nav'))setTimeout(update,80)},true);
})();

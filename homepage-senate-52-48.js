(()=>{'use strict';
  const CARD_SELECTORS='#homeForecastSplit .senate-card,#homeForecastSplit .final-senate-card,#page-home .will-senate-card';
  let pending=false;
  function setText(el,value){if(el&&el.textContent!==value)el.textContent=value;}
  function setWidth(el,value){if(el&&el.style.getPropertyValue('width')!==value)el.style.setProperty('width',value,'important');}
  function update(){
    const root=document.getElementById('page-home');if(!root)return;
    const compact=root.querySelector('#homeSenateForecast');
    if(compact){
      setText(compact.querySelector('.wg-forecast-dem'),'52 D');
      setText(compact.querySelector('.wg-forecast-rep'),'48 R');
      compact.setAttribute('aria-label','Senate forecast: 52 Democrats and 48 Republicans');
    }
    for(const card of root.querySelectorAll(CARD_SELECTORS)){
      const numbers=[...card.querySelectorAll('.party-number,.final-party-number')];
      if(numbers.length>=2){setText(numbers[0],'52');setText(numbers[1],'48');}
      for(const el of card.querySelectorAll('*')){
        if(el.children.length)continue;
        const t=(el.textContent||'').trim();
        if(/^Democrats?:\\s*51$/i.test(t))setText(el,t.replace(/51$/,'52'));
        if(/^Republicans?:\\s*49$/i.test(t))setText(el,t.replace(/49$/,'48'));
        if(/^51 seats$/i.test(t)&&/democrat/i.test(el.parentElement?.textContent||''))setText(el,'52 seats');
        if(/^49 seats$/i.test(t)&&/republican/i.test(el.parentElement?.textContent||''))setText(el,'48 seats');
      }
      const split=card.querySelector('.will-split-parties');
      if(split){
        for(const el of split.querySelectorAll('strong')) {
          if(/DEMOCRATS:\\s*51/i.test(el.textContent))setText(el,'DEMOCRATS: 52');
          if(/REPUBLICANS:\\s*49/i.test(el.textContent))setText(el,'REPUBLICANS: 48');
        }
      }
      setWidth(card.querySelector('.senate-bar .dem,.final-bar .dem,.dem-bar'), '52%');
      setWidth(card.querySelector('.senate-bar .rep,.final-bar .rep,.rep-bar'), '48%');
      for(const bar of card.querySelectorAll('.senate-bar,.final-bar,.will-split-bar')) {
        bar.setAttribute('aria-label','Senate prediction: 52 Democrats and 48 Republicans');
      }
    }
  }
  function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;update();});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
  [50,150,500,1200,3000].forEach(ms=>setTimeout(schedule,ms));
  window.addEventListener('pageshow',schedule);
  document.addEventListener('click',event=>{if(event.target?.closest?.('[data-page-link],.site-header .nav'))setTimeout(schedule,0)});
  const root=document.getElementById('page-home');
  if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
})();
(()=>{'use strict';
  const date='November 2, 2026';
  const datePattern=/\b(?:Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?)\.?\s+\d{1,2}(?:,?\s*2026)?\b|\b2026[-/]\d{2}[-/]\d{2}\b/i;
  function apply(){
    const page=document.getElementById('page-senate');
    if(!page)return;
    const el=page.querySelector('#mapUpdated');
    if(!el)return;
    const before=el.textContent||'';
    const after=datePattern.test(before)?before.replace(datePattern,date):'Updated '+date;
    if(before!==after)el.textContent=after;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});
  else apply();
  window.addEventListener('pageshow',apply);
  document.addEventListener('click',event=>{
    if(event.target?.closest?.('[data-page="senate"],[data-target="senate"],#page-senate'))queueMicrotask(apply);
  },true);
  const observer=new MutationObserver(mutations=>{
    if(mutations.some(m=>{const n=m.target.nodeType===1?m.target:m.target.parentElement;return n?.closest?.('#page-senate')||n?.id==='page-senate'||[...m.addedNodes].some(x=>x.id==='page-senate');}))apply();
  });
  observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
})();
/* 2026 forecast accuracy map — November 4 snapshot.
   Read-only UI: the original forecast data remains unchanged. */
(()=>{
  'use strict';
  const CORRECT=new Set('AL AR CO DE FL GA ID IL KS KY LA MA MI MN MT NE NH NJ NM NC OH OK OR RI SD TN TX VA WV WY'.split(' '));
  const WRONG=new Set('IA ME SC'.split(' '));
  const UNCALLED=new Set(['AK','MS']);
  const COLORS={correct:'#24a55a',wrong:'#db4452',uncalled:'#f4c542',neutral:'#cbd5e1'};
  const SAVED=new WeakMap();
  let accuracy=true,observed=null,scheduled=false;

  function category(ab){
    if(CORRECT.has(ab))return 'correct';
    if(WRONG.has(ab))return 'wrong';
    if(UNCALLED.has(ab))return 'uncalled';
    return 'neutral';
  }
  function addStyles(){
    if(document.getElementById('wg-accuracy-map-css'))return;
    const css=document.createElement('style');
    css.id='wg-accuracy-map-css';
    css.textContent=[
      '#wg-accuracy-controls{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;padding:14px 15px;margin:0 0 13px;border:1px solid #d7e4f0;border-radius:11px;background:#f5f8fc;color:#1b354e}',
      '#page-senate[data-wg-accuracy="on"] .balance-power{display:none!important}',
      '#page-senate[data-wg-accuracy="on"] #wg-accuracy-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:12px 0 14px}',
      '#wg-accuracy-summary[hidden]{display:none!important}',
      '#wg-accuracy-summary .wg-score{border:1px solid #dce5ec;border-radius:11px;background:#fff;padding:12px;text-align:center}',
      '#wg-accuracy-summary .wg-score b{display:block;font-size:clamp(24px,3vw,39px);line-height:1.12;font-weight:900}',
      '#wg-accuracy-summary .wg-score span{font-size:11px;font-weight:800;color:#495e72}',
      '#wg-accuracy-summary .wg-score.good b{color:#24a55a}',
      '#wg-accuracy-summary .wg-score.bad b{color:#db4452}',
      '#wg-accuracy-summary .wg-score.pending b{color:#ba8b1b}',
      '#wg-accuracy-controls strong{font-size:15px;display:block;font-weight:850}',
      '#wg-accuracy-controls .wg-accuracy-note{font-size:11px;color:#597087;display:block;margin-top:3px}',
      '#wg-accuracy-controls .wg-accuracy-buttons{display:flex;gap:6px;flex-wrap:wrap}',
      '#wg-accuracy-controls button{font-size:11px;font-weight:800;border-radius:8px;padding:9px 11px;border:1px solid #bbcee2;background:#fff;color:#274869;cursor:pointer}',
      '#wg-accuracy-controls button[aria-pressed="true"]{background:#153e6b;border-color:#153e6b;color:#fff}',
      '#wg-accuracy-key{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:12px 15px;margin:9px 0 10px;border:1px solid #dbe6f1;border-radius:10px;background:#fff;font-size:12px;color:#314b64}',
      '#wg-accuracy-key[hidden]{display:none!important}',
      '#page-senate[data-wg-accuracy="on"] .legend.compact-forecast-key{display:none!important}',
      '#wg-accuracy-key .wg-key-item{display:inline-flex;align-items:center;gap:6px;font-weight:750}',
      '#wg-accuracy-key .wg-swatch{display:inline-block;width:13px;height:13px;border-radius:3px;border:1px solid #0002}',
      '#wg-accuracy-key small{display:block;flex-basis:100%;color:#677e93;line-height:1.4}',
      '#page-senate[data-wg-accuracy="on"] .map-wrap svg .state-shape[data-state]{transition:none!important;animation:none!important}',
      '@media(max-width:650px){#wg-accuracy-controls{padding:11px}#wg-accuracy-controls .wg-accuracy-buttons{width:100%}#wg-accuracy-controls button{flex:1}#wg-accuracy-key{gap:8px;font-size:10px}}'
    ].join('');
    document.head.appendChild(css);
  }
  function findShapes(root){
    return [...root.querySelectorAll('svg .state-shape[data-state],svg path[data-state]')]
      .filter(el=>/^[A-Z]{2}$/.test(String(el.getAttribute('data-state')||'').toUpperCase()));
  }
  function paint(){
    const page=document.getElementById('page-senate');
    if(!page)return;
    const svg=page.querySelector('.map-wrap svg');
    if(!svg)return;
    if(!accuracy){
      svg.querySelectorAll('[data-wg-accuracy-overlay="1"]').forEach(el=>el.remove());
      return;
    }
    const originalShapes=[...svg.querySelectorAll('.state-shape[data-state]')];
    for(const el of originalShapes){
      const ab=String(el.getAttribute('data-state')||'').toUpperCase();
      if(!/^[A-Z]{2}$/.test(ab))continue;
      let overlay=el.nextElementSibling;
      if(!overlay||overlay.getAttribute('data-wg-accuracy-overlay')!=='1'){
        overlay=el.cloneNode(false);
        overlay.removeAttribute('id');
        overlay.removeAttribute('data-state');
        overlay.removeAttribute('class');
        overlay.removeAttribute('title');
        overlay.setAttribute('data-wg-accuracy-overlay','1');
        overlay.setAttribute('aria-hidden','true');
        overlay.style.setProperty('pointer-events','none','important');
        el.parentNode.insertBefore(overlay,el.nextSibling);
      }
      const color=COLORS[category(ab)];
      if(overlay.style.getPropertyValue('fill')!==color)
        overlay.style.setProperty('fill',color,'important');
    }
  }
  function schedulePaint(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;paint();});
  }
  function install(){
    const page=document.getElementById('page-senate');
    if(!page)return;
    const mapCard=page.querySelector('.map-card');
    const mapWrap=page.querySelector('.map-wrap');
    if(!mapCard||!mapWrap)return;
    addStyles();
    page.dataset.wgAccuracy=accuracy?'on':'off';
    const header=page.querySelector('.page-head h1');
    if(header){
      if(!header.dataset.wgForecastTitle)header.dataset.wgForecastTitle=header.textContent;
      header.textContent=accuracy?'2026 Senate Prediction Accuracy':header.dataset.wgForecastTitle;
    }

    const balance=mapCard.querySelector('.balance-power');
    if(balance&&!document.getElementById('wg-accuracy-summary')){
      const summary=document.createElement('div');
      summary.id='wg-accuracy-summary';
      summary.setAttribute('aria-label','2026 Senate forecast accuracy summary');
      summary.innerHTML='<div class="wg-score good"><b>30</b><span>Correct</span></div><div class="wg-score bad"><b>3</b><span>Incorrect</span></div><div class="wg-score pending"><b>2</b><span>Uncalled</span></div>';
      balance.insertAdjacentElement('afterend',summary);
    }
    const summary=document.getElementById('wg-accuracy-summary');
    if(summary)summary.hidden=!accuracy;
    if(!document.getElementById('wg-accuracy-controls')){
      const controls=document.createElement('div');
      controls.id='wg-accuracy-controls';
      controls.innerHTML='<div><strong>How accurate were my 2026 Senate calls?</strong><span class="wg-accuracy-note">30 correct · 3 incorrect · 2 uncalled (November 4)</span></div><div class="wg-accuracy-buttons"><button type="button" data-view="accuracy" aria-pressed="true">Accuracy map</button><button type="button" data-view="forecast" aria-pressed="false">Original forecast colors</button></div>';
      controls.addEventListener('click',e=>{
        const button=e.target.closest('button[data-view]');
        if(!button)return;
        accuracy=button.dataset.view==='accuracy';
        page.dataset.wgAccuracy=accuracy?'on':'off';
        const header=page.querySelector('.page-head h1');
        if(header)header.textContent=accuracy?'2026 Senate Prediction Accuracy':(header.dataset.wgForecastTitle||'2026 Senate Prediction');

        for(const b of controls.querySelectorAll('button'))b.setAttribute('aria-pressed',String((b.dataset.view==='accuracy')===accuracy));
        const key=document.getElementById('wg-accuracy-key');if(key)key.hidden=!accuracy;
        const summary=document.getElementById('wg-accuracy-summary');if(summary)summary.hidden=!accuracy;
        schedulePaint();
      });
      mapWrap.parentNode.insertBefore(controls,mapWrap);
    }
    if(!document.getElementById('wg-accuracy-key')){
      const key=document.createElement('div');
      key.id='wg-accuracy-key';
      key.innerHTML='<span class="wg-key-item"><i class="wg-swatch" style="background:#24a55a"></i> Correct prediction</span><span class="wg-key-item"><i class="wg-swatch" style="background:#db4452"></i> Incorrect prediction</span><span class="wg-key-item"><i class="wg-swatch" style="background:#f4c542"></i> Uncalled (AK, MS)</span><span class="wg-key-item"><i class="wg-swatch" style="background:#cbd5e1"></i> No Senate race</span><small>Colors compare the original predicted winner with the reported 2026 Senate winner, not the accuracy of the margin. Results are projected calls, not certified final margins. Alaska and Mississippi remain unresolved.</small>';
      mapWrap.insertAdjacentElement('afterend',key);
    }
    if(observed!==mapWrap){
      if(observed&&observed.__wgAccuracyObserver)observed.__wgAccuracyObserver.disconnect();
      const mo=new MutationObserver(muts=>{
        if(muts.some(m=>[...m.addedNodes].some(n=>n.nodeType===1&&
          (n.getAttribute?.('data-wg-accuracy-overlay')!=='1'&&(n.matches?.('svg, path, .state-shape')||n.querySelector?.('svg .state-shape[data-state]'))))))schedulePaint();
      });
      mo.observe(mapWrap,{subtree:true,childList:true});
      mapWrap.__wgAccuracyObserver=mo;observed=mapWrap;
    }
    schedulePaint();
  }
  function start(){
    install();
    let attempts=0;
    const ready=setInterval(()=>{install();if(++attempts>=12)clearInterval(ready);},500);
    window.addEventListener('pageshow',install);
    document.addEventListener('click',e=>{
      if(e.target?.closest?.('.site-header .nav'))setTimeout(install,80);
    },true);

  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();

/* Restore the site's native mapHoverCard. No extra cards or global DOM observers. */
(()=>{
  'use strict';
  if(window.__wgNativeHoverRestored)return;
  window.__wgNativeHoverRestored=true;

  const style=document.createElement('style');
  style.id='wg-native-hover-restored';
  style.textContent=[
    '#page-senate .map-wrap svg .state-shape[data-state]{pointer-events:visiblePainted!important;cursor:pointer!important}',
    '#page-senate .map-wrap svg .state-label,#page-senate .map-wrap svg .inset-label,#page-senate .map-wrap svg .inset-frame,#page-senate .map-wrap svg [data-label]{pointer-events:none!important}',
    '@media (hover:hover) and (pointer:fine){',
    '  #page-senate .map-wrap #mapHoverCard.show{opacity:1!important;visibility:visible!important;display:block!important;pointer-events:none!important;transition:none!important}',
    '  #page-senate .map-wrap #mapHoverCard:not(.show){opacity:0!important;visibility:hidden!important;pointer-events:none!important}',
    '}'
  ].join('\n');
  document.head.appendChild(style);
  let active='',lastEvent=null,frame=0;
  const abbr=el=>el?.getAttribute?.('data-state')||el?.closest?.('[data-state]')?.getAttribute('data-state');
  const isFine=e=>e.pointerType==='mouse'||e.pointerType==='pen'||(!e.pointerType&&matchMedia('(hover:hover) and (pointer:fine)').matches);
  function data(ab){
    try{return typeof stateData!=='undefined'?stateData[ab]:window.stateData?.[ab]}catch(_){return null}
  }
  function underPointer(e){
    const wrap=document.querySelector('#page-senate .map-wrap'),svg=wrap?.querySelector('svg');
    if(!wrap||!svg)return null;
    const sr=svg.getBoundingClientRect();
    if(e.clientX<sr.left||e.clientX>sr.right||e.clientY<sr.top||e.clientY>sr.bottom)return null;
    const sel='#page-senate .map-wrap svg [data-state]';
    const target=e.target?.closest?.(sel);
    if(target&&data(abbr(target)))return abbr(target);
    for(const el of document.elementsFromPoint(e.clientX,e.clientY)){
      const p=el.closest?.(sel);
      if(p&&data(abbr(p)))return abbr(p);
    }
    // Overlays sometimes intercept events even when a state shape is visible.
    // Use the SVG's actual geometry as a final hit test, never just its bbox.
    for(const path of svg.querySelectorAll('.state-shape[data-state]')){
      const r=path.getBoundingClientRect();
      if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)continue;
      try{
        if(typeof path.isPointInFill==='function'){
          const matrix=path.getScreenCTM();
          if(!matrix)continue;
          const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix.inverse());
          if(path.isPointInFill(p))return abbr(path);
        }
      }catch(_){}
    }
    return null;
  }
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function fallback(ab){
    const s=data(ab);
    const line=i=>s?.['candidate'+i]?'<div class="map-hover-line">'+esc(s['candidate'+i])+'</div>':'';
    return '<div class="map-hover-state">'+esc(s?.name||ab)+'</div>'+
      '<div class="map-hover-section-title">WILL’S CALL</div>'+
      '<div class="prediction-copy">'+esc(s?.prediction||String(s?.rating||'').replace(/-/g,' '))+'</div>'+
      line(1)+line(2);
  }
  function show(ab){
    const card=document.getElementById('mapHoverCard');
    if(!card||!data(ab))return;
    if(active!==ab){
      active=ab;
      try{
        card.innerHTML=typeof hoverCardHTML==='function'?hoverCardHTML(ab):fallback(ab);
      }catch(_){card.innerHTML=fallback(ab)}
    }
    card.classList.add('show');
    // Device media queries can classify a trackpad as hover:none and otherwise
    // hide a genuinely opened popup with display:none!important.
    card.style.setProperty('display','block','important');
    card.style.setProperty('opacity','1','important');
    card.style.setProperty('visibility','visible','important');
  }
  function position(x,y){
    const card=document.getElementById('mapHoverCard');
    const wrap=document.querySelector('#page-senate .map-wrap');
    if(!card||!wrap||!active)return;
    const r=wrap.getBoundingClientRect();
    const width=card.offsetWidth||300,height=card.offsetHeight||140;
    let left=x-r.left+16,top=y-r.top+16;
    if(left+width>r.width-10)left=x-r.left-width-16;
    if(top+height>r.height-10)top=y-r.top-height-16;
    card.style.left=Math.max(8,Math.min(left,Math.max(8,r.width-width-8)))+'px';
    card.style.top=Math.max(8,Math.min(top,Math.max(8,r.height-height-8)))+'px';
  }
  function hide(){
    active='';lastEvent=null;
    if(frame)cancelAnimationFrame(frame);
    frame=0;
    const card=document.getElementById('mapHoverCard');
    if(card){
      card.classList.remove('show');
      card.style.setProperty('display','none','important');
      card.style.setProperty('opacity','0','important');
      card.style.setProperty('visibility','hidden','important');
    }
  }
  function track(e){
    if(!isFine(e))return;
    const page=document.getElementById('page-senate');
    if(!page||!page.getClientRects().length){hide();return}
    const ab=underPointer(e);
    if(!ab){hide();return}
    show(ab);
    lastEvent={x:e.clientX,y:e.clientY};
    if(!frame)frame=requestAnimationFrame(()=>{
      frame=0;
      if(lastEvent&&active)position(lastEvent.x,lastEvent.y);
    });
  }
  // The native page also installs mouseenter/mousemove/mouseleave listeners
  // on each state. They compete with pointer tracking, briefly hiding or
  // repositioning the same tooltip. Leave this one pointer-based owner.
  const blockNativeHover=e=>{
    if(e.target?.matches?.('#page-senate .map-wrap svg .state-shape[data-state]'))
      e.stopPropagation();
  };
  document.addEventListener('mouseenter',blockNativeHover,true);
  document.addEventListener('mousemove',blockNativeHover,true);
  document.addEventListener('mouseleave',blockNativeHover,true);
  document.addEventListener('pointerover',track,true);
  document.addEventListener('pointermove',track,true);
  if(!window.PointerEvent){
    document.addEventListener('mouseover',track,true);
    document.addEventListener('mousemove',track,true);
  }
  document.addEventListener('pointerdown',hide,true);
  window.addEventListener('blur',hide);
  window.addEventListener('scroll',hide,true);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)hide()});
})();
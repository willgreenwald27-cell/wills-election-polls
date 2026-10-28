/* Stable Senate map hover — one visual tooltip, native click and touch retained.
   The older mapHoverCard is manipulated by several legacy event handlers.
   This tooltip never shares their element, so it cannot flicker between states. */
(()=>{
  'use strict';
  if(window.__wgSenateSingleHover20261026)return;
  window.__wgSenateSingleHover20261026=true;
  const ID='wgSenateStableHoverTip';
  const css=document.createElement('style');
  css.id='wg-senate-single-hover-style';
  css.textContent=[
    '@media (hover:hover) and (pointer:fine){',
    '  #page-senate #mapHoverCard{display:none!important;visibility:hidden!important;opacity:0!important;}',
    '  #page-senate .map-wrap svg .state-shape[data-state]{pointer-events:visiblePainted!important;cursor:pointer!important;}',
    '  #page-senate .map-wrap svg :is(.state-label,.inset-label,.inset-frame,[data-label]){pointer-events:none!important;}',
    '}',
    '#'+ID+'{position:fixed!important;z-index:10050!important;display:none;box-sizing:border-box;',
    'width:min(340px,calc(100vw - 24px));max-height:min(65vh,500px);overflow:hidden;',
    'padding:16px 18px;border:1px solid #6999e4;border-top:3px solid #5489ff;border-radius:7px;',
    'background:rgba(9,19,39,.985);color:#f8fbff;box-shadow:0 18px 42px rgba(0,0,0,.36);',
    'font:500 14px/1.43 Inter,Arial,sans-serif;pointer-events:none!important;',
    'transition:none!important;animation:none!important;contain:layout style;}',
    '#'+ID+' .map-hover-state{font-size:21px;font-weight:850;line-height:1.2;margin-bottom:9px;color:white;}',
    '#'+ID+' .map-hover-section-title{font-weight:850;font-size:11px;letter-spacing:.07em;color:#a9cafa;}',
    '#'+ID+' .prediction-copy{display:block;margin:5px 0 9px;font-weight:750;color:#fff;}',
    '#'+ID+' .wg-tx-call{color:#4c8dff!important;font-weight:850!important;text-transform:uppercase!important;}',
    '#'+ID+' .wg-oh-call{color:#4c8dff!important;font-weight:850!important;text-transform:uppercase!important;}',
    '#'+ID+' .map-hover-line{margin-top:6px;}',
    '#'+ID+' *{transition:none!important;animation:none!important;}'
  ].join('\n');
  document.head.appendChild(css);
  const tip=document.createElement('div');
  tip.id=ID;
  tip.setAttribute('role','tooltip');
  tip.setAttribute('aria-hidden','true');
  document.body.appendChild(tip);
  let current='',queued=0,latest=null;
  const fine=()=>window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  const getData=ab=>{
    try{return typeof stateData!=='undefined' ? stateData[ab] : window.stateData?.[ab]}catch(_){return null}
  };
  const escapeHTML=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function fallback(ab){
    const s=getData(ab)||{};
    return '<div class="map-hover-state">'+escapeHTML(s.name||ab)+'</div>'+
      '<div class="map-hover-section-title">WILL’S CALL</div>'+
      '<div class="prediction-copy">'+escapeHTML(s.prediction||String(s.rating||'').replace(/-/g,' '))+'</div>'+
      [1,2].map(i=>s['candidate'+i]?'<div class="map-hover-line">'+escapeHTML(s['candidate'+i])+'</div>':'').join('');
  }
  function hide(){
    current='';
    tip.style.display='none';
    tip.setAttribute('aria-hidden','true');
  }
  function findState(e,svg){
    const x=e.clientX,y=e.clientY;
    const rect=svg.getBoundingClientRect();
    if(x<rect.left||x>rect.right||y<rect.top||y>rect.bottom)return '';
    const fromTarget=e.target?.closest?.('.state-shape[data-state]');
    if(fromTarget&&svg.contains(fromTarget)&&getData(fromTarget.dataset.state))return fromTarget.dataset.state;
    for(const el of document.elementsFromPoint(x,y)){
      const hit=el.closest?.('.state-shape[data-state]');
      if(hit&&svg.contains(hit)&&getData(hit.dataset.state))return hit.dataset.state;
    }
    // State label overlays and Alaska's inset may obscure path hit-testing.
    // Use actual SVG fill geometry, never rectangular bounds alone.
    for(const path of svg.querySelectorAll('.state-shape[data-state]')){
      const r=path.getBoundingClientRect();
      if(x<r.left||x>r.right||y<r.top||y>r.bottom)continue;
      if(typeof path.isPointInFill!=='function')continue;
      try{
        const matrix=path.getScreenCTM();
        if(matrix&&path.isPointInFill(new DOMPoint(x,y).matrixTransform(matrix.inverse()))&&getData(path.dataset.state))
          return path.dataset.state;
      }catch(_){}
    }
    return '';
  }
  function update(){
    queued=0;
    const e=latest;
    if(!e||!fine()){hide();return}
    const page=document.getElementById('page-senate');
    const svg=page?.querySelector('.map-wrap svg');
    if(!page||!page.getClientRects().length||!svg){hide();return}
    const ab=findState(e,svg);
    if(!ab){hide();return}
    if(current!==ab){
      current=ab;
      try{
        const html=typeof hoverCardHTML==='function'?hoverCardHTML(ab):'';
        tip.innerHTML=(typeof html==='string'&&html.trim())?html:fallback(ab);
        if(ab==='TX'||ab==='OH'){
          const call=tip.querySelector('.prediction-copy');
          if(call){call.textContent=ab==='TX'?'TALARICO +1.2%':'BROWN +0.6%';call.classList.add(ab==='TX'?'wg-tx-call':'wg-oh-call');}
        }
      }catch(_){tip.innerHTML=fallback(ab)}
    }
    tip.style.display='block';
    tip.setAttribute('aria-hidden','false');
    const w=tip.offsetWidth||320,h=tip.offsetHeight||150,margin=12;
    const left=e.clientX+18+w>innerWidth-margin?e.clientX-w-18:e.clientX+18;
    const top=e.clientY+18+h>innerHeight-margin?e.clientY-h-18:e.clientY+18;
    tip.style.left=Math.max(margin,Math.min(left,innerWidth-w-margin))+'px';
    tip.style.top=Math.max(margin,Math.min(top,innerHeight-h-margin))+'px';
  }
  function move(e){
    if(e.pointerType==='touch'){hide();return}
    if(!fine())return;
    latest={clientX:e.clientX,clientY:e.clientY,target:e.target};
    if(!queued)queued=requestAnimationFrame(update);
  }
  document.addEventListener('pointermove',move,{capture:true,passive:true});
  if(!window.PointerEvent)document.addEventListener('mousemove',move,{capture:true,passive:true});
  document.addEventListener('pointerdown',hide,true);
  window.addEventListener('scroll',hide,true);
  window.addEventListener('blur',hide);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)hide()});
})();
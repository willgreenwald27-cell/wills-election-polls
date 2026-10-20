/* Desktop Senate hover restoration, 2026-10-19; keeps Texas blue.
   Independent lightweight hover preview; no rerender or DOM observer loops. */
(()=>{
  const fine=e=>e?.pointerType==='mouse'||window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  if(window.__wgSenateHoverRepairReady)return;
  window.__wgSenateHoverRepairReady=true;
  let active='',card=null;
  const style=document.createElement('style');
  style.textContent=`
    /* Keep the restored blue Texas forecast. Only repair hit testing. */
    #page-senate .map-wrap svg .state-shape[data-state],
    #page-senate .map-wrap svg path[data-state]{pointer-events:visiblePainted!important;cursor:pointer!important}
    #page-senate .map-wrap svg .inset-frame,
    #page-senate .map-wrap svg .inset-label,
    #page-senate .map-wrap svg .state-label,
    #page-senate .map-wrap svg [data-label]{pointer-events:none!important}
    @media (hover:hover) and (pointer:fine){
      #page-senate #mapHoverCard,#page-senate .map-hover-card{display:none!important;pointer-events:none!important}
    }
    #wgSenateHoverRepair{position:fixed;z-index:2147483000;pointer-events:none;display:none;
      width:245px;max-width:calc(100vw - 24px);padding:14px 16px;border-radius:10px;
      background:#0c182b;color:#fff;border:1px solid #6287b4;box-shadow:0 14px 35px #0005;
      font-family:Inter,Arial,sans-serif;font-size:13px;line-height:1.4}
    #wgSenateHoverRepair .wg-hover-name{font-size:18px;font-weight:900;margin-bottom:5px;color:#fff}
    #wgSenateHoverRepair .wg-hover-line{margin-top:5px;color:#e9eef8}
    #wgSenateHoverRepair .wg-hover-label{font-size:10px;letter-spacing:.09em;font-weight:800;color:#9ec0ed}
    #wgSenateHoverRepair .wg-hover-metric{margin-top:3px;color:#d9e7fa;font-size:12px}
    @media (hover:none),(pointer:coarse){#wgSenateHoverRepair{display:none!important}}
  `;
  document.head.appendChild(style);
  function getCard(){
    if(!card||!card.isConnected){card=document.createElement('div');card.id='wgSenateHoverRepair';document.body.appendChild(card);}
    return card;
  }
  function stateInfo(ab){
    try{return typeof stateData!=='undefined'?stateData[ab]:window.stateData?.[ab];}catch(e){return null;}
  }
  function show(ab,x,y){
    const s=stateInfo(ab),node=getCard();
    if(!s){hide();return;}
    if(ab!==active){
      active=ab;
      const name=s.name||s.state||s.stateName||ab;
      const pred=s.prediction||s.rating?.replace(/-/g,' ')||'';
      const p1=s.candidate1||'',p2=s.candidate2||'';
      const candidate=i=>{
        const n=s['candidate'+i];if(!n)return '';
        const poll=s['candidate'+i+'Poll'], odds=s['candidate'+i+'Odds'];
        const values=[];
        if(poll!=null&&String(poll).trim())values.push(String(poll).replace(/%$/,'')+'% polls');
        if(odds!=null&&String(odds).trim())values.push(String(odds).replace(/%$/,'')+'% odds');
        return '<div class="wg-hover-metric">'+esc(n)+(values.length?' — '+esc(values.join(' · ')):'')+'</div>';
      };
      node.innerHTML='<div class="wg-hover-name">'+esc(name)+'</div>'+
        (pred?'<div class="wg-hover-label">WILL\'S CALL</div><div class="wg-hover-line">'+esc(pred)+'</div>':'')+
        (p1||p2?'<div class="wg-hover-label" style="margin-top:9px">CANDIDATES</div>'+candidate(1)+candidate(2):'');
    }
    node.style.display='block';
    const w=node.offsetWidth||245,h=node.offsetHeight||120;
    node.style.left=Math.max(10,Math.min(x+16,window.innerWidth-w-10))+'px';
    node.style.top=Math.max(10,Math.min(y+18,window.innerHeight-h-10))+'px';
  }
  function hide(){active='';if(card)card.style.display='none';}
  const onHover=e=>{
    if(!fine(e))return;
    const root=document.getElementById('page-senate');
    if(!root||!root.getClientRects().length){hide();return;}
    const selector='#page-senate svg .state-shape[data-state],#page-senate svg path[data-state],#page-senate svg g[data-state]';
    let shape=e.target?.closest?.(selector);
    if(!shape&&Number.isFinite(e.clientX)&&Number.isFinite(e.clientY)){
      // Decorative SVG elements can intercept the hit target; look beneath.
      for(const el of document.elementsFromPoint(e.clientX,e.clientY)){
        shape=el.closest?.(selector);if(shape)break;
      }
    }
    const ab=shape?.getAttribute('data-state');
    if(/^[A-Z]{2}$/.test(ab||''))show(ab,e.clientX,e.clientY);
    else hide();
  };
  document.addEventListener('pointerover',onHover,true);
  document.addEventListener('pointermove',onHover,true);
  if(!window.PointerEvent){
    document.addEventListener('mouseover',onHover,true);
    document.addEventListener('mousemove',onHover,true);
  }
  document.addEventListener('pointerdown',hide,true);
  window.addEventListener('blur',hide);
  window.addEventListener('scroll',hide,true);
})();

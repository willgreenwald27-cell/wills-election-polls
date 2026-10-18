/* Desktop Senate map hover repair, 2026-10-18.
   Independent lightweight hover preview; no rerender or DOM observer loops. */
(()=>{
  const fine=()=>window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let active='',card=null;
  const style=document.createElement('style');
  style.textContent=`
    #page-senate .map-wrap svg .state-shape[data-state="TX"],
    #page-senate .map-wrap svg .state-shape[data-state="TX"]:hover,
    #page-senate .map-wrap svg .state-shape[data-state="TX"].selected,
    #page-senate .map-wrap svg .state-shape[data-state="TX"].senate-spotlight{
      fill:#f8c6ca!important;animation:none!important;transition:stroke .15s ease!important;
    }
    #wgSenateHoverRepair{position:fixed;z-index:2147483000;pointer-events:none;display:none;
      width:245px;max-width:calc(100vw - 24px);padding:14px 16px;border-radius:10px;
      background:#0c182b;color:#fff;border:1px solid #6287b4;box-shadow:0 14px 35px #0005;
      font-family:Inter,Arial,sans-serif;font-size:13px;line-height:1.4}
    #wgSenateHoverRepair .wg-hover-name{font-size:18px;font-weight:900;margin-bottom:5px;color:#fff}
    #wgSenateHoverRepair .wg-hover-line{margin-top:5px;color:#e9eef8}
    #wgSenateHoverRepair .wg-hover-label{font-size:10px;letter-spacing:.09em;font-weight:800;color:#9ec0ed}
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
      node.innerHTML='<div class="wg-hover-name">'+esc(name)+'</div>'+
        (pred?'<div class="wg-hover-label">WILL\'S CALL</div><div class="wg-hover-line">'+esc(pred)+'</div>':'')+
        (p1||p2?'<div class="wg-hover-label" style="margin-top:9px">CANDIDATES</div><div class="wg-hover-line">'+esc([p1,p2].filter(Boolean).join(' vs. '))+'</div>':'');
    }
    node.style.display='block';
    const w=node.offsetWidth||245,h=node.offsetHeight||120;
    node.style.left=Math.max(10,Math.min(x+16,window.innerWidth-w-10))+'px';
    node.style.top=Math.max(10,Math.min(y+18,window.innerHeight-h-10))+'px';
  }
  function hide(){active='';if(card)card.style.display='none';}
  document.addEventListener('pointermove',e=>{
    if(!fine())return;
    const shape=e.target?.closest?.('#page-senate .map-wrap svg .state-shape[data-state]');
    if(shape&&document.getElementById('page-senate')?.getClientRects().length){
      show(shape.getAttribute('data-state'),e.clientX,e.clientY);
    }else hide();
  },true);
  document.addEventListener('pointerdown',hide,true);
  window.addEventListener('blur',hide);
  window.addEventListener('scroll',hide,true);
})();

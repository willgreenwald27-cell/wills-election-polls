(()=>{
  'use strict';
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const leafs=root=>root?[...root.querySelectorAll('*')].filter(el=>el.children.length===0):[];
  let queued=false;

  function ensureStyle(){
    if(document.getElementById('sept11FinalStyle'))return;
    const st=document.createElement('style');
    st.id='sept11FinalStyle';
    st.textContent=`
      #page-senate .wg-me-final-call{margin:9px 0 0!important;padding:12px 14px!important;border-radius:10px!important;background:linear-gradient(135deg,#9d2f43,#bd2937)!important;border:2px solid #e65c66!important;box-shadow:0 8px 24px rgba(189,41,55,.20)!important;box-sizing:border-box!important}
      #page-senate .wg-me-final-call .wg-me-call-kicker{display:block!important;margin:0 0 4px!important;color:#ffd7dc!important;font:900 9px/1.1 Inter,ui-sans-serif,system-ui,sans-serif!important;letter-spacing:1.2px!important;text-transform:uppercase!important}
      #page-senate .wg-me-final-call .wg-me-call-line{display:flex!important;align-items:center!important;gap:8px!important;flex-wrap:wrap!important}
      #page-senate .wg-me-final-call .wg-me-party{font-family:Georgia,'Times New Roman',serif!important;font-size:21px!important;line-height:1.08!important;font-weight:800!important;color:#fff!important}
      #page-senate .wg-me-final-call .wg-me-rating{display:inline-flex!important;align-items:center!important;padding:4px 8px!important;border-radius:999px!important;background:#ff7f8c!important;color:#361018!important;font:900 9px/1 Inter,ui-sans-serif,system-ui,sans-serif!important;letter-spacing:.65px!important;text-transform:uppercase!important}
      #page-senate .wg-me-final-call .wg-me-margin{display:block!important;margin-top:7px!important;color:#fff!important;font:700 12px/1.25 Inter,ui-sans-serif,system-ui,sans-serif!important}
      #page-senate .wg-me-final-why{margin:12px 0 0!important;padding:15px 16px!important;border:0!important;border-radius:10px!important;background:#f7f8fb!important;color:#26384f!important;font:500 12px/1.45 Inter,ui-sans-serif,system-ui,sans-serif!important;box-sizing:border-box!important}
      #page-senate .wg-me-final-why b{display:block!important;margin-bottom:8px!important;color:#61718a!important;font-size:10px!important;line-height:1.1!important;font-weight:900!important;letter-spacing:1.2px!important;text-transform:uppercase!important}
      #page-senate .wg-me-final-why span{display:block!important;color:#26384f!important}
    `;
    document.head.appendChild(st);
  }

  function forceData(){
    try{
      if(typeof stateData==='undefined'||!stateData?.ME)return;
      const me=stateData.ME;
      me.rating='tilt-r';
      me.predictionParty='Republican';
      me.prediction='Collins +1.3%';
      me.notes='Why my forecast differs from the polling average: Collins has been underestimated by 5+ points in three straight cycles.';
      me.updated='2026-09-11';
      for(const k of ['projectedWinner','predictionWinner','winner','callParty']) if(k in me) me[k]='Republican';
      if('call' in me)me.call='Collins +1.3%';
    }catch(e){}
  }

  function forceHomeDate(){
    const root=document.getElementById('page-home');
    if(!root)return;
    for(const card of root.querySelectorAll('.reference-metrics>*')){
      const t=norm(card.textContent);
      if(!/latest\s+update/i.test(t))continue;
      for(const el of leafs(card)){
        const x=norm(el.textContent);
        if(/^(?:Sep(?:t(?:ember)?)?\.?\s+\d{1,2},?\s+2026|2026-09-\d{2})$/i.test(x))el.textContent='Sep 11, 2026';
      }
    }
    for(const el of leafs(root)){
      const t=norm(el.textContent);
      if(/^Last updated\s*[:·-]?\s*(?:Sep(?:t(?:ember)?)?\.?\s+\d{1,2},?\s+2026|2026-09-\d{2})$/i.test(t))el.textContent='Last updated September 11, 2026';
    }
  }

  function forceMaineColor(){
    const root=document.getElementById('page-senate');if(!root)return;
    root.querySelectorAll('[data-state="ME"],[data-state="ME"] path,[data-abbr="ME"],[data-abbr="ME"] path,[data-state-abbr="ME"],[data-state-abbr="ME"] path,#ME,#ME path,#state-ME,#state-ME path').forEach(el=>{
      el.style.setProperty('fill','#f8c6ca','important');
      if(el.namespaceURI!=='http://www.w3.org/2000/svg'&&!/^(path|polygon|rect)$/i.test(el.tagName||''))el.style.setProperty('background','#f8c6ca','important');
    });
  }

  function findMainePopup(){
    const root=document.getElementById('page-senate');if(!root)return null;
    const hits=[...root.querySelectorAll('div,section,article')].filter(el=>{
      if(!el.getClientRects().length)return false;
      const t=norm(el.textContent),r=el.getBoundingClientRect();
      return r.width>=250&&r.width<=700&&r.height>=180&&r.height<=1000&&/Maine/i.test(t)&&/Troy Jackson/i.test(t)&&/Susan Collins/i.test(t)&&/(AVG POLLS|POLL AVERAGE)/i.test(t)&&/(MY PREDICTION|WILL[’']S CALL)/i.test(t);
    });
    hits.sort((a,b)=>(a.getBoundingClientRect().width*a.getBoundingClientRect().height)-(b.getBoundingClientRect().width*b.getBoundingClientRect().height));
    return hits[0]||null;
  }

  function findCallBlock(box){
    const all=leafs(box);
    const call=all.find(el=>/^WILL[’']S CALL$/i.test(norm(el.textContent)));
    if(!call)return null;
    let cur=call.parentElement,best=cur;
    while(cur&&cur!==box){
      const t=norm(cur.textContent);
      if(/MY PREDICTION/i.test(t)||/Win odds/i.test(t))break;
      const r=cur.getBoundingClientRect();
      if(r.height<=190&&r.width>=180)best=cur;
      cur=cur.parentElement;
    }
    return best;
  }

  function fixMainePopup(){
    const box=findMainePopup();if(!box)return;
    const all=leafs(box);
    const myPred=all.find(el=>/^MY PREDICTION$/i.test(norm(el.textContent)));
    const win=all.find(el=>/^Win odds/i.test(norm(el.textContent)));
    let card=findCallBlock(box);

    if(!card){
      card=document.createElement('div');
      if(myPred)myPred.insertAdjacentElement('afterend',card);else box.appendChild(card);
    }
    card.className='wg-me-final-call';
    card.innerHTML='<span class="wg-me-call-kicker">WILL\'S CALL</span><div class="wg-me-call-line"><span class="wg-me-party">Republican</span><span class="wg-me-rating">TILT REPUBLICAN</span></div><span class="wg-me-margin">Collins +1.3%</span>';

    let why=box.querySelector('.wg-me-final-why,.maine-why-note');
    if(!why){why=document.createElement('div');}
    why.className='wg-me-final-why';
    why.innerHTML='<b>WHY MY FORECAST DIFFERS</b><span>Why my forecast differs from the polling average: Collins has been underestimated by 5+ points in three straight cycles.</span>';
    if(win){
      let block=win;
      while(block.parentElement&&block.parentElement!==box&&block.parentElement.getBoundingClientRect().height<90)block=block.parentElement;
      block.insertAdjacentElement('afterend',why);
    }else if(!why.parentElement){box.appendChild(why);}
  }

  function apply(){
    ensureStyle();
    forceData();
    forceHomeDate();
    forceMaineColor();
    fixMainePopup();
  }
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply();});}
  apply();
  [80,250,700,1500,3000].forEach(ms=>setTimeout(apply,ms));
  setInterval(apply,500);
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','style']});
  window.addEventListener('pageshow',apply);
  window.addEventListener('resize',apply);
})();
(()=>{
  'use strict';
  const BLUE='#d3e2f7';
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  let queued=false;

  function syncData(){
    try{
      if(typeof stateData==='undefined'||!stateData)return;
      const tx=stateData.TX;
      if(tx){
        tx.rating='tilt-d';
        tx.predictionParty='Democratic';
        tx.prediction='Tilt Democratic';
        tx.notes='';
        tx.updated='2026-09-15';
        for(const k of ['projectedWinner','predictionWinner','winner','callParty'])if(k in tx)tx[k]='Democratic';
        if('call' in tx)tx.call='Tilt Democratic';
      }
      const oh=stateData.OH;
      if(oh){
        oh.notes='';
      }
    }catch(e){}
  }

  function visiblePanel(stateName){
    const root=document.getElementById('page-senate');
    if(!root)return null;
    const hits=[...root.querySelectorAll('div,section,article,aside')].filter(el=>{
      if(!el.getClientRects().length)return false;
      const t=norm(el.textContent);
      if(!new RegExp('\\b'+stateName+'\\b','i').test(t))return false;
      return /WILL[’']S CALL|MY PREDICTION|AVG POLLS|POLL AVERAGE/i.test(t);
    });
    hits.sort((a,b)=>{
      const ar=a.getBoundingClientRect(),br=b.getBoundingClientRect();
      return (ar.width*ar.height)-(br.width*br.height);
    });
    return hits[0]||null;
  }

  function removeWhyBlock(stateName){
    const panel=visiblePanel(stateName);
    if(!panel)return;
    const rx=/^WHY(?:\s+MY)?\b.*DIFFERS\b/i;
    const nodes=[...panel.querySelectorAll('*')].filter(el=>rx.test(norm(el.textContent)));
    const headings=nodes.filter(el=>![...el.children].some(c=>rx.test(norm(c.textContent))));
    for(const heading of headings){
      let cur=heading,best=heading;
      for(let i=0;i<6;i++){
        const p=cur.parentElement;
        if(!p||p===panel)break;
        const t=norm(p.textContent);
        if(rx.test(t)&&!/WILL[’']S CALL|AVG POLLS|POLL AVERAGE|WIN ODDS/i.test(t)){
          best=p;cur=p;
        }else break;
      }
      best.remove();
    }
  }

  function forceTexasBlue(){
    const root=document.getElementById('page-senate');
    if(!root)return;
    root.querySelectorAll('[data-state="TX"],[data-state="TX"] path,[data-abbr="TX"],[data-abbr="TX"] path,[data-state-abbr="TX"],[data-state-abbr="TX"] path,#TX,#TX path,#state-TX,#state-TX path').forEach(el=>{
      el.style.setProperty('fill',BLUE,'important');
      if(el.namespaceURI!=='http://www.w3.org/2000/svg'&&!/^(path|polygon|rect)$/i.test(el.tagName||''))el.style.setProperty('background',BLUE,'important');
    });
    const panel=visiblePanel('Texas');
    if(!panel)return;
    const leaves=[...panel.querySelectorAll('*')].filter(el=>el.children.length===0);
    for(const el of leaves){
      const t=norm(el.textContent);
      if(/^Prediction:\s*/i.test(t))el.textContent='Prediction: Tilt Democratic';
    }
    const call=leaves.find(el=>/^WILL[’']S CALL$/i.test(norm(el.textContent)));
    if(call){
      let card=call.parentElement;
      for(let i=0;card&&card!==panel&&i<5;i++,card=card.parentElement){
        const t=norm(card.textContent);
        if(/WILL[’']S CALL/i.test(t)&&t.length<220)break;
      }
      if(card&&card!==panel){
        // Remove Texas-only inline palette so the normal Senate call-card CSS applies.
        card.style.removeProperty('background');
        card.style.removeProperty('background-image');
        card.style.removeProperty('border-color');
        card.style.removeProperty('color');
        card.querySelectorAll('*').forEach(el=>el.style.removeProperty('color'));
        const vals=[...card.querySelectorAll('*')].filter(el=>el.children.length===0);
        const party=vals.find(el=>/^(Republican|Democrat(?:ic)?|Tossup)$/i.test(norm(el.textContent)));
        if(party)party.textContent='Democratic';
        const rating=vals.find(el=>/(TILT|LEAN|LIKELY|SOLID)\s+(REPUBLICAN|DEMOCRAT(?:IC)?)/i.test(norm(el.textContent)));
        if(rating)rating.textContent='TILT DEMOCRATIC';
        const copy=card.querySelector('.prediction-copy');if(copy)copy.textContent='Tilt Democratic';
      }
    }
  }

  function apply(){
    syncData();
    forceTexasBlue();
    removeWhyBlock('Texas');
    removeWhyBlock('Ohio');
  }
  function schedule(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;apply();});
  }

  apply();
  [80,220,600,1400].forEach(ms=>setTimeout(apply,ms));
  document.addEventListener('click',e=>{
    if(e.target?.closest?.('#page-senate')){
      setTimeout(apply,0);setTimeout(apply,80);setTimeout(apply,180);
    }
  },true);
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','style']});
  window.addEventListener('pageshow',apply);
})();

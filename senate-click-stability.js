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
        tx.updated='2026-09-16';
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

  function forceTexasOdds(){
    const panel=visiblePanel('Texas');
    if(!panel)return;
    const values=[...panel.querySelectorAll('*')].filter(el=>{
      if(el.children.length)return false;
      return /^(?:48|52)(?:\.0)?%?$/.test(norm(el.textContent));
    });
    for(const el of values){
      let p=el.parentElement,who='';
      for(let i=0;p&&p!==panel&&i<7;i++,p=p.parentElement){
        const t=norm(p.textContent);
        const hasT=/\b(?:James\s+)?Talarico\b/i.test(t);
        const hasP=/\b(?:Ken\s+)?Paxton\b/i.test(t);
        if(hasT!==hasP){who=hasT?'Talarico':'Paxton';break;}
      }
      if(who==='Talarico')el.textContent='52%';
      else if(who==='Paxton')el.textContent='48%';
    }
  }

  function fixSenateSeatBalanceBar(){
    const root=document.getElementById('page-senate');
    if(!root)return;
    const anchor=root.querySelector('.balance-count-row');
    if(!anchor)return;
    const ar=anchor.getBoundingClientRect();
    const parseRgb=v=>{const m=String(v||'').match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);return m?[+m[1],+m[2],+m[3]]:null;};
    const kind=el=>{
      const c=parseRgb(getComputedStyle(el).backgroundColor);
      if(!c)return '';
      const [r,g,b]=c;
      if(b>r+45&&b>g+35)return 'dem';
      if(r>g+55&&r>b+45)return 'rep';
      return '';
    };
    const candidates=[...root.querySelectorAll('div,section,span')].filter(el=>{
      const r=el.getBoundingClientRect();
      return r.width>=Math.max(260,ar.width*.62)&&r.height>=8&&r.height<=70&&
        r.top>=ar.bottom-18&&r.top<=ar.bottom+180;
    });
    for(const bar of candidates){
      const kids=[...bar.children].filter(el=>el.getClientRects().length);
      const dem=kids.find(el=>kind(el)==='dem');
      const rep=kids.find(el=>kind(el)==='rep');
      if(!dem||!rep)continue;

      bar.style.setProperty('position','relative','important');
      bar.style.setProperty('display','block','important');
      bar.style.setProperty('overflow','hidden','important');
      bar.style.setProperty('background','transparent','important');

      dem.style.setProperty('position','absolute','important');
      dem.style.setProperty('left','0','important');
      dem.style.setProperty('right','auto','important');
      dem.style.setProperty('top','0','important');
      dem.style.setProperty('bottom','0','important');
      dem.style.setProperty('width','51%','important');
      dem.style.setProperty('min-width','51%','important');
      dem.style.setProperty('max-width','51%','important');
      dem.style.setProperty('flex','0 0 51%','important');
      dem.style.setProperty('transform','none','important');
      dem.style.setProperty('clip-path','none','important');

      rep.style.setProperty('position','absolute','important');
      rep.style.setProperty('right','0','important');
      rep.style.setProperty('left','auto','important');
      rep.style.setProperty('top','0','important');
      rep.style.setProperty('bottom','0','important');
      rep.style.setProperty('width','49%','important');
      rep.style.setProperty('min-width','49%','important');
      rep.style.setProperty('max-width','49%','important');
      rep.style.setProperty('flex','0 0 49%','important');
      rep.style.setProperty('transform','none','important');
      rep.style.setProperty('clip-path','none','important');

      for(const el of kids){
        if(el===dem||el===rep)continue;
        el.style.setProperty('display','none','important');
      }

      let majority=bar.querySelector(':scope > .wg-seat-majority-marker');
      if(!majority){
        majority=document.createElement('span');
        majority.className='wg-seat-majority-marker';
        majority.setAttribute('aria-hidden','true');
        bar.appendChild(majority);
      }
      majority.style.cssText='display:block!important;position:absolute!important;left:50%!important;top:0!important;bottom:0!important;width:4px!important;transform:translateX(-2px)!important;background:#17263d!important;z-index:20!important;pointer-events:none!important;';
      bar.setAttribute('aria-label','Senate balance: 51 Democratic seats, 49 Republican seats; majority marker at 50 seats plus the vice president');
      break;
    }
  }

  function apply(){
    syncData();
    forceTexasBlue();
    fixSenateSeatBalanceBar();
    forceTexasOdds();
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

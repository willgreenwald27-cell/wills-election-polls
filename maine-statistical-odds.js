(()=>{
  const MAINE_ODDS={
    'Susan Collins':'51',
    'Troy Jackson':'49'
  };
  let rerendered=false;
  let scheduled=false;

  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const leafs=root=>[...root.querySelectorAll('*')].filter(el=>el.children.length===0);

  function setOddsOnStateData(){
    try{
      if(typeof stateData==='undefined'||!stateData||!stateData.ME) return;
      const s=stateData.ME;
      let changed=false;
      if(MAINE_ODDS[norm(s.candidate1)]&&String(s.candidate1Odds||'')!==MAINE_ODDS[norm(s.candidate1)]){
        s.candidate1Odds=MAINE_ODDS[norm(s.candidate1)];
        changed=true;
      }
      if(MAINE_ODDS[norm(s.candidate2)]&&String(s.candidate2Odds||'')!==MAINE_ODDS[norm(s.candidate2)]){
        s.candidate2Odds=MAINE_ODDS[norm(s.candidate2)];
        changed=true;
      }
      if(changed&&!rerendered&&typeof renderSenate==='function'){
        rerendered=true;
        try{renderSenate();}catch(e){console.warn('Maine odds re-render unavailable',e);}
      }
    }catch(e){console.warn('Maine statistical odds update unavailable',e);}
  }

  function findMainePanel(){
    const root=document.getElementById('page-senate');
    if(!root) return null;
    const names=leafs(root).filter(el=>norm(el.textContent)==='Maine'&&el.getClientRects().length);
    for(const name of names){
      let box=name.parentElement;
      for(let depth=0;box&&box!==root&&depth<12;depth++,box=box.parentElement){
        const t=norm(box.textContent);
        if(/WILL'S STATISTICAL ODDS/i.test(t)&&/POLL AVERAGE/i.test(t)) return box;
      }
    }
    return null;
  }

  function forceVisibleOdds(){
    const box=findMainePanel();
    if(!box) return;

    for(const el of leafs(box)){
      const t=norm(el.textContent);
      if(/^Susan Collins:\s*\d+(?:\.\d+)?%$/i.test(t)) el.textContent='Susan Collins: 51%';
      if(/^Troy Jackson:\s*\d+(?:\.\d+)?%$/i.test(t)) el.textContent='Troy Jackson: 49%';
    }

    const lines=[...box.querySelectorAll('.candidate-line')].filter(el=>el.getClientRects().length);
    const bar=box.querySelector('.oddsbar');
    if(bar&&lines.length>=2){
      const firstName=norm(lines[0].querySelector('.candidate-name')?.textContent);
      const secondName=norm(lines[1].querySelector('.candidate-name')?.textContent);
      const first=Number(MAINE_ODDS[firstName]);
      const second=Number(MAINE_ODDS[secondName]);
      const a=bar.querySelector('.oddsbar-a');
      const b=bar.querySelector('.oddsbar-b');
      if(a&&Number.isFinite(first)) a.style.setProperty('width',first+'%','important');
      if(b&&Number.isFinite(second)) b.style.setProperty('width',second+'%','important');
    }
  }

  function enforce(){
    setOddsOnStateData();
    forceVisibleOdds();
  }

  function schedule(){
    if(scheduled) return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;enforce();});
  }

  enforce();
  setTimeout(enforce,100);
  setTimeout(enforce,700);
  setTimeout(enforce,1600);
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true});
  window.addEventListener('pageshow',enforce);
})();

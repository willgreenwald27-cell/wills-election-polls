(()=>{
  const POLL_COUNT=88;
  const STATE_COUNT=19;
  let renderedAfterMainePatch=false;
  let scheduled=false;

  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const leafs=root=>[...root.querySelectorAll('*')].filter(el=>el.children.length===0);

  function patchMaineStateData(){
    try{
      if(typeof stateData==='undefined'||!stateData||!stateData.ME) return;
      const me=stateData.ME;
      me.rating='tilt-r';
      if('prediction' in me) me.prediction='Tilt Republican';
      if('projectedWinner' in me) me.projectedWinner='Republican';
      if('predictionWinner' in me) me.predictionWinner='Republican';
      if('winner' in me) me.winner='Republican';
      if('predictionParty' in me) me.predictionParty='Republican';
      if('callParty' in me) me.callParty='Republican';
      if('call' in me) me.call='Tilt Republican';

      if(!renderedAfterMainePatch&&typeof renderSenate==='function'){
        renderedAfterMainePatch=true;
        try{renderSenate();}catch(e){console.warn('Senate re-render unavailable',e);}
      }
    }catch(e){console.warn('Maine state-data correction unavailable',e);}
  }

  function setSummaryParty(root,labelRe,value){
    for(const label of leafs(root)){
      if(!labelRe.test(norm(label.textContent))) continue;
      let box=label.parentElement;
      for(let depth=0;box&&box!==root&&depth<5;depth++,box=box.parentElement){
        const t=norm(box.textContent);
        if(!/^\d+\s*(REPUBLICAN|DEMOCRAT(?:IC)?)$/i.test(t)) continue;
        const num=leafs(box).find(el=>/^\d+$/.test(norm(el.textContent)));
        if(num&&norm(num.textContent)!==String(value)) num.textContent=String(value);
        break;
      }
    }
  }

  function forceSenateBalance(){
    const root=document.getElementById('page-senate');
    if(!root) return;
    setSummaryParty(root,/^REPUBLICAN$/i,51);
    setSummaryParty(root,/^DEMOCRAT(?:IC)?$/i,49);
  }

  function forceMaineMapColor(){
    const root=document.getElementById('page-senate');
    if(!root) return;
    root.querySelectorAll('[data-state="ME"],[data-abbr="ME"],[data-state-abbr="ME"],#ME,#state-ME').forEach(el=>{
      if(el.namespaceURI==='http://www.w3.org/2000/svg'||/^(path|rect|polygon)$/i.test(el.tagName||'')){
        el.style.setProperty('fill','#f8c6ca','important');
      }
    });
  }

  function findMainePredictionBox(root){
    const candidates=leafs(root).filter(el=>norm(el.textContent)==='Maine'&&el.getClientRects().length);
    for(const maine of candidates){
      let box=maine.parentElement;
      for(let depth=0;box&&box!==root&&depth<12;depth++,box=box.parentElement){
        const t=norm(box.textContent);
        if(/(WILL'S CALL|MY PROJECTED WINNER|MY PREDICTION)/i.test(t)&&/(AVG POLLS|POLL AVERAGE|WIN ODDS|STATISTICAL ODDS)/i.test(t)) return box;
      }
    }
    return null;
  }

  function forceMainePredictionText(){
    const root=document.getElementById('page-senate');
    if(!root) return;
    const box=findMainePredictionBox(root);
    if(!box) return;
    const ls=leafs(box);

    const callIndex=ls.findIndex(el=>/^WILL'S CALL$/i.test(norm(el.textContent)));
    if(callIndex>=0){
      for(let i=callIndex+1;i<Math.min(ls.length,callIndex+8);i++){
        const t=norm(ls[i].textContent);
        if(/^(DEMOCRAT(?:IC)?|REPUBLICAN)$/i.test(t)){
          if(t!=='Republican') ls[i].textContent='Republican';
          break;
        }
      }
      const badge=ls.slice(callIndex+1,callIndex+10).find(el=>/^TILT\s+(DEMOCRAT(?:IC)?|REPUBLICAN)$/i.test(norm(el.textContent)));
      if(badge&&norm(badge.textContent)!=='TILT REPUBLICAN') badge.textContent='TILT REPUBLICAN';
    }

    const projectedIndex=ls.findIndex(el=>/^MY PROJECTED WINNER$/i.test(norm(el.textContent)));
    if(projectedIndex>=0){
      for(let i=projectedIndex+1;i<Math.min(ls.length,projectedIndex+10);i++){
        const t=norm(ls[i].textContent);
        if(/^(DEMOCRAT(?:IC)?|REPUBLICAN)$/i.test(t)){
          if(t!=='Republican') ls[i].textContent='Republican';
          break;
        }
      }
    }

    for(const el of ls){
      const t=norm(el.textContent);
      if(/^Prediction:\s*Tilt\s+Democrat(?:ic)?$/i.test(t)) el.textContent='Prediction: Tilt Republican';
    }
  }

  function setMetric(root,labelRe,value){
    if(!root) return;
    for(const el of leafs(root)){
      const t=norm(el.textContent);
      if(labelRe.test(t)&&/^\d+\s+/.test(t)){
        const next=t.replace(/^\d+/,String(value));
        if(next!==t) el.textContent=next;
      }
    }
    for(const label of leafs(root)){
      if(!labelRe.test(norm(label.textContent))) continue;
      let box=label.parentElement;
      for(let depth=0;box&&box!==root&&depth<5;depth++,box=box.parentElement){
        const nums=leafs(box).filter(el=>/^\d+$/.test(norm(el.textContent)));
        if(nums.length===1){
          if(norm(nums[0].textContent)!==String(value)) nums[0].textContent=String(value);
          break;
        }
      }
    }
  }

  function forcePollMetrics(){
    for(const id of ['page-home','page-polls']){
      const root=document.getElementById(id);
      if(!root) continue;
      setMetric(root,/^\d*\s*POLLS? ENTERED$/i,POLL_COUNT);
      setMetric(root,/^\d*\s*STATES? COVERED$/i,STATE_COUNT);
    }
  }

  function enforce(){
    patchMaineStateData();
    forceSenateBalance();
    forceMaineMapColor();
    forceMainePredictionText();
    forcePollMetrics();
  }

  function schedule(){
    if(scheduled) return;
    scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;
      enforce();
    });
  }

  enforce();
  setTimeout(enforce,100);
  setTimeout(enforce,700);
  setTimeout(enforce,1600);
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true});
  window.addEventListener('pageshow',enforce);
})();

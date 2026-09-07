(()=>{
  const POLL_COUNT=88;
  const STATE_COUNT=19;
  const RED='#bd2937';
  const BLUE='#2763b8';
  const IND='#8051d2';
  const CALLS={
    ME:{name:'Maine',rating:'tilt-r',party:'Republican',text:'Collins +1.3%'},
    IA:{name:'Iowa',rating:'tilt-r',party:'Republican',text:'Hinson +3.2%'},
    KS:{name:'Kansas',rating:'likely-r',party:'Republican',text:'Marshall +6.9%'},
    NE:{name:'Nebraska',rating:'lean-r',party:'Republican',text:'Ricketts +4.3%'}
  };
  const POLL_AVERAGES={
    SC:{'Annie Andrews':'41.0','Darline Graham':'41.0'},
    TN:{'Marquita Bradshaw':'31.0','Bill Hagerty':'51.0'}
  };
  let renderedAfterDataPatch=false;
  let scheduled=false;

  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const leafs=root=>[...root.querySelectorAll('*')].filter(el=>el.children.length===0);

  function partyColor(party){
    const p=norm(party).toLowerCase();
    if(p.includes('republican')||p==='r'||p==='gop') return RED;
    if(p.includes('democrat')||p==='d') return BLUE;
    return IND;
  }

  function setCandidatePoll(s,name,value){
    let changed=false;
    if(norm(s.candidate1)===name && String(s.candidate1Poll||'')!==value){s.candidate1Poll=value;changed=true;}
    if(norm(s.candidate2)===name && String(s.candidate2Poll||'')!==value){s.candidate2Poll=value;changed=true;}
    return changed;
  }

  function patchStateData(){
    try{
      if(typeof stateData==='undefined'||!stateData) return;
      let changed=false;
      for(const [ab,cfg] of Object.entries(CALLS)){
        const s=stateData[ab];
        if(!s) continue;
        if(s.rating!==cfg.rating){s.rating=cfg.rating;changed=true;}
        if(s.predictionParty!==cfg.party){s.predictionParty=cfg.party;changed=true;}
        if(s.prediction!==cfg.text){s.prediction=cfg.text;changed=true;}
        if(s.updated!=='2026-09-07'){s.updated='2026-09-07';changed=true;}
        if('projectedWinner' in s&&s.projectedWinner!==cfg.party){s.projectedWinner=cfg.party;changed=true;}
        if('predictionWinner' in s&&s.predictionWinner!==cfg.party){s.predictionWinner=cfg.party;changed=true;}
        if('winner' in s&&s.winner!==cfg.party){s.winner=cfg.party;changed=true;}
        if('callParty' in s&&s.callParty!==cfg.party){s.callParty=cfg.party;changed=true;}
        if('call' in s&&s.call!==cfg.text){s.call=cfg.text;changed=true;}
      }
      for(const [ab,vals] of Object.entries(POLL_AVERAGES)){
        const s=stateData[ab];
        if(!s) continue;
        for(const [name,value] of Object.entries(vals)) if(setCandidatePoll(s,name,value)) changed=true;
        if(s.updated!=='2026-09-07'){s.updated='2026-09-07';changed=true;}
      }
      if(changed&&!renderedAfterDataPatch&&typeof renderSenate==='function'){
        renderedAfterDataPatch=true;
        try{renderSenate();}catch(e){console.warn('Senate re-render unavailable',e);}
      }
    }catch(e){console.warn('Senate state-data correction unavailable',e);}
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
      if(el.namespaceURI==='http://www.w3.org/2000/svg'||/^(path|rect|polygon)$/i.test(el.tagName||'')) el.style.setProperty('fill','#f8c6ca','important');
    });
  }

  function findStatePanel(root,stateName){
    const candidates=leafs(root).filter(el=>norm(el.textContent)===stateName&&el.getClientRects().length);
    for(const stateEl of candidates){
      let box=stateEl.parentElement;
      for(let depth=0;box&&box!==root&&depth<12;depth++,box=box.parentElement){
        const t=norm(box.textContent);
        if(/(WILL'S CALL|MY PROJECTED WINNER|MY PREDICTION)/i.test(t)&&/(AVG POLLS|POLL AVERAGE|WIN ODDS|STATISTICAL ODDS)/i.test(t)) return box;
      }
    }
    return null;
  }

  function forceVisibleCallText(){
    const root=document.getElementById('page-senate');
    if(!root) return;
    for(const cfg of Object.values(CALLS)){
      const box=findStatePanel(root,cfg.name);
      if(!box) continue;
      const ls=leafs(box);
      const callIndex=ls.findIndex(el=>/^WILL'S CALL$/i.test(norm(el.textContent)));
      if(callIndex>=0){
        const party=ls.slice(callIndex+1,callIndex+10).find(el=>/^(DEMOCRAT(?:IC)?|REPUBLICAN)$/i.test(norm(el.textContent)));
        if(party&&norm(party.textContent)!==cfg.party) party.textContent=cfg.party;
        const copy=box.querySelector('.prediction-copy');
        if(copy&&norm(copy.textContent)!==cfg.text) copy.textContent=cfg.text;
      }
      const projectedIndex=ls.findIndex(el=>/^MY PROJECTED WINNER$/i.test(norm(el.textContent)));
      if(projectedIndex>=0){
        for(let i=projectedIndex+1;i<Math.min(ls.length,projectedIndex+10);i++){
          const t=norm(ls[i].textContent);
          if(/^(DEMOCRAT(?:IC)?|REPUBLICAN)$/i.test(t)){
            if(t!==cfg.party) ls[i].textContent=cfg.party;
            break;
          }
        }
      }
      const predictionLabel=ls.find(el=>/^PREDICTION$/i.test(norm(el.textContent)));
      if(predictionLabel&&predictionLabel.nextElementSibling&&norm(predictionLabel.nextElementSibling.textContent)!==cfg.text){
        predictionLabel.nextElementSibling.textContent=cfg.text;
      }
    }
  }

  function forceMobilePartyVisuals(){
    if(!window.matchMedia('(max-width:760px)').matches) return;
    const root=document.getElementById('page-senate');
    if(!root) return;

    const lines=[...root.querySelectorAll('.candidate-line')].filter(el=>el.getClientRects().length);
    for(const line of lines){
      const partyEl=line.querySelector('.candidate-party');
      if(!partyEl) continue;
      const color=partyColor(partyEl.textContent);
      line.querySelectorAll('.candidate-name,.candidate-party,.candidate-metrics b').forEach(el=>{
        el.style.setProperty('color',color,'important');
      });
    }

    const bars=[...root.querySelectorAll('.oddsbar')].filter(el=>el.getClientRects().length);
    for(const bar of bars){
      let panel=bar.parentElement;
      while(panel&&panel!==root){
        const candidateLines=[...panel.querySelectorAll('.candidate-line')].filter(el=>el.getClientRects().length);
        if(candidateLines.length>=2){
          const firstParty=candidateLines[0].querySelector('.candidate-party');
          const secondParty=candidateLines[1].querySelector('.candidate-party');
          const firstColor=partyColor(firstParty?firstParty.textContent:'');
          const secondColor=partyColor(secondParty?secondParty.textContent:'');
          const a=bar.querySelector('.oddsbar-a');
          const b=bar.querySelector('.oddsbar-b');
          if(a) a.style.setProperty('background',firstColor,'important');
          if(b) b.style.setProperty('background',secondColor,'important');

          const firstName=candidateLines[0].querySelector('.candidate-name');
          const secondName=candidateLines[1].querySelector('.candidate-name');
          const firstKey=firstName?norm(firstName.textContent).toLowerCase()+':':'';
          const secondKey=secondName?norm(secondName.textContent).toLowerCase()+':':'';
          panel.querySelectorAll('b,strong').forEach(el=>{
            const t=norm(el.textContent).toLowerCase();
            if(firstKey&&t.startsWith(firstKey)) el.style.setProperty('color',firstColor,'important');
            if(secondKey&&t.startsWith(secondKey)) el.style.setProperty('color',secondColor,'important');
          });
          break;
        }
        panel=panel.parentElement;
      }
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
    patchStateData();
    forceSenateBalance();
    forceMaineMapColor();
    forceVisibleCallText();
    forceMobilePartyVisuals();
    forcePollMetrics();
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
  window.addEventListener('resize',enforce);
})();

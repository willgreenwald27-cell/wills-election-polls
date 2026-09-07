(()=>{
  const CALLS={
    ME:{rating:'tilt-r',predictionParty:'Republican',prediction:'Collins +1.3%'},
    IA:{rating:'tilt-r',predictionParty:'Republican',prediction:'Hinson +3.2%'},
    KS:{rating:'likely-r',predictionParty:'Republican',prediction:'Marshall +6.9%'},
    NE:{rating:'lean-r',predictionParty:'Republican',prediction:'Ricketts +4.3%'}
  };
  const POLL_AVERAGES={
    SC:{'Annie Andrews':'41.0','Darline Graham':'41.0'},
    TN:{'Marquita Bradshaw':'31.0','Bill Hagerty':'51.0'}
  };
  let rendering=false;

  function setCandidatePoll(s,name,value){
    if(!s) return false;
    let changed=false;
    if(String(s.candidate1||'').trim()===name && String(s.candidate1Poll||'')!==value){s.candidate1Poll=value;changed=true;}
    if(String(s.candidate2||'').trim()===name && String(s.candidate2Poll||'')!==value){s.candidate2Poll=value;changed=true;}
    return changed;
  }

  function applyData(){
    try{
      if(typeof stateData==='undefined'||!stateData) return false;
      let changed=false;
      for(const [ab,vals] of Object.entries(CALLS)){
        const s=stateData[ab]; if(!s) continue;
        for(const [k,v] of Object.entries(vals)){
          if(s[k]!==v){s[k]=v;changed=true;}
        }
        if(s.updated!=='2026-09-07'){s.updated='2026-09-07';changed=true;}
      }
      for(const [ab,byName] of Object.entries(POLL_AVERAGES)){
        const s=stateData[ab]; if(!s) continue;
        for(const [name,value] of Object.entries(byName)) if(setCandidatePoll(s,name,value)) changed=true;
        if(s.updated!=='2026-09-07'){s.updated='2026-09-07';changed=true;}
      }
      if(changed && typeof renderSenate==='function' && !rendering){
        rendering=true;
        try{renderSenate();}finally{rendering=false;}
      }
      return changed;
    }catch(e){console.warn('Senate call/average overrides unavailable',e);return false;}
  }

  function patchVisibleCallText(){
    const root=document.getElementById('page-senate');
    if(!root) return;
    root.querySelectorAll('.prediction-copy').forEach(el=>{
      const t=(el.textContent||'').replace(/\s+/g,' ').trim();
      if(t==='Jackson +0.4%'||t==='Tilt Republican') el.textContent='Collins +1.3%';
    });
    const labels=[...root.querySelectorAll('.section-label')];
    for(const lab of labels){
      if((lab.textContent||'').replace(/\s+/g,' ').trim().toLowerCase()!=='prediction') continue;
      const box=lab.nextElementSibling;
      if(!box) continue;
      const panelText=(box.parentElement?.textContent||'');
      if(/Maine/i.test(panelText)) box.textContent='Collins +1.3%';
    }
  }

  function apply(){applyData();patchVisibleCallText();}
  apply();
  setTimeout(apply,100);setTimeout(apply,700);setTimeout(apply,1600);
  new MutationObserver(()=>{applyData();patchVisibleCallText();}).observe(document.body,{childList:true,subtree:true,characterData:true});
  window.addEventListener('pageshow',apply);
})();

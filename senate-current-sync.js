(()=>{
  'use strict';
  const AVG={
    AK:{'peltola':'47.8','sullivan':'44.3'},
    AR:{'shoffner':'43.0','cotton':'46.0'},
    GA:{'ossoff':'50.0','collins':'43.0'},
    IA:{'turek':'44.9','hinson':'44.2'},
    ID:{'achilles':'34.0','risch':'33.5'},
    KS:{'hamilton':'45.0','marshall':'44.5'},
    MA:{'markey':'50.0','deaton':'30.0'},
    ME:{'jackson':'47.5','collins':'44.5'},
    MI:{'el-sayed':'45.9','rogers':'44.4'},
    MN:{'flanagan':'44.6','tafoya':'42.2'},
    MT:{'bodnar':'40.0','alme':'44.7'},
    NC:{'cooper':'49.9','whatley':'41.3'},
    NH:{'pappas':'44.2','sununu':'41.8'},
    NM:{'lujn':'53.0','marker':'38.0'},
    OH:{'brown':'47.7','husted':'42.0'},
    RI:{'reed':'51.0','mckay':'31.0'},
    SC:{'andrews':'37.7','graham':'42.0'},
    TN:{'bradshaw':'32.3','hagerty':'55.7'},
    TX:{'talarico':'47.6','paxton':'44.9'},
    FL:{'moody':'49.5','nixon':'42.5'}
  };
  const MAINE_NOTE='Why: Final polling margins underestimated Susan Collins by more than 5 points in each of her last three Senate elections (2008, 2014, and 2020).';
  const RED_LIGHT='#f8c6ca';
  const TOSSUP='#f2c94c';
  const TILT_BLUE='#d3e2f7';
  const TILT_BLUE_BORDER='#a9c5ed';
  const BLUE_DARK='#173f87';
  let rendering=false,queued=false;
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const last=n=>{const p=norm(n).toLowerCase().split(/\s+/);return (p[p.length-1]||'').replace(/[^a-z0-9-]/g,'');};
  const leafs=root=>root?[...root.querySelectorAll('*')].filter(el=>el.children.length===0):[];

  function syncData(){
    try{
      if(typeof stateData==='undefined'||!stateData) return false;
      let changed=false;
      const set=(s,k,v)=>{if(String(s[k]??'')!==String(v)){s[k]=v;changed=true;}};
      const me=stateData.ME;
      if(me){
        set(me,'rating','tilt-r');set(me,'predictionParty','Republican');set(me,'prediction','Collins +1.3%');set(me,'notes',MAINE_NOTE);set(me,'updated','2026-09-15');
        for(const k of ['projectedWinner','predictionWinner','winner','callParty']) if(k in me) set(me,k,'Republican');
        if('call' in me) set(me,'call','Collins +1.3%');
      }
      const ks=stateData.KS;
      if(ks){
        set(ks,'rating','tilt-r');set(ks,'predictionParty','Republican');set(ks,'prediction','Marshall +4.9%');set(ks,'notes','Why my forecast differs: It may be too big of an ask to flip a state that Trump won by 16 points in 2024.');set(ks,'updated','2026-10-06');
        for(const k of ['projectedWinner','predictionWinner','winner','callParty']) if(k in ks) set(ks,k,'Republican');
        if('call' in ks) set(ks,'call','Marshall +4.9%');
      }
      const ne=stateData.NE;
      if(ne){
        set(ne,'rating','tilt-r');set(ne,'predictionParty','Republican');set(ne,'prediction','Ricketts +3.2%');set(ne,'updated','2026-09-22');
        set(ne,'notes','');
        for(const k of ['projectedWinner','predictionWinner','winner','callParty']) if(k in ne) set(ne,k,'Republican');
        if('call' in ne) set(ne,'call','Ricketts +3.2%');
      }
      const oh=stateData.OH;
      if(oh){
        set(oh,'rating','tilt-d');set(oh,'predictionParty','Democratic');set(oh,'prediction','Brown +0.6%');set(oh,'notes','');set(oh,'updated','2026-09-20');
        for(const k of ['projectedWinner','predictionWinner','winner','callParty']) if(k in oh) set(oh,k,'Democratic');
        if('call' in oh) set(oh,'call','Brown +0.6%');
        for(const slot of [1,2]){
          const name=norm(oh['candidate'+slot]);
          const key='candidate'+slot+'Odds';
          if(/Brown/i.test(name))set(oh,key,'54');
          if(/Husted/i.test(name))set(oh,key,'46');
        }
      }
      const ms=stateData.MS;
      if(ms){
        set(ms,'rating','solid-r');set(ms,'predictionParty','Republican');set(ms,'updated','2026-10-05');
        for(const k of ['projectedWinner','predictionWinner','winner','callParty']) if(k in ms) set(ms,k,'Republican');
      }
      const tx=stateData.TX;
      if(tx){
        set(tx,'rating','tilt-d');set(tx,'predictionParty','Democratic');set(tx,'prediction','Talarico 55% chance of winning');set(tx,'notes','James Talarico has a 55% chance of winning.');set(tx,'updated','2026-10-01');
        for(const k of ['projectedWinner','predictionWinner','winner','callParty']) if(k in tx) set(tx,k,'Democratic');
        if('call' in tx) set(tx,'call','Talarico 55% chance of winning');
        for(const slot of [1,2]){
          const name=norm(tx['candidate'+slot]);
          const key='candidate'+slot+'Odds';
          if(/Talarico/i.test(name))set(tx,key,'55');
          if(/Paxton/i.test(name))set(tx,key,'45');
        }
      }
      return changed;
    }catch(e){console.warn('Audited Senate data sync unavailable',e);return false;}
  }

  function forceMaine(){
    const root=document.getElementById('page-senate'); if(!root)return;
    root.querySelectorAll('[data-state="ME"],[data-state="ME"] path,[data-abbr="ME"],[data-abbr="ME"] path,[data-state-abbr="ME"],[data-state-abbr="ME"] path,#ME,#ME path,#state-ME,#state-ME path').forEach(el=>{
      el.style.setProperty('fill',RED_LIGHT,'important');
      if(el.namespaceURI!=='http://www.w3.org/2000/svg'&&!/^(path|polygon|rect)$/i.test(el.tagName||'')) el.style.setProperty('background',RED_LIGHT,'important');
    });
    const labels=leafs(root).filter(el=>norm(el.textContent)==='Maine'&&el.getClientRects().length);
    for(const label of labels){
      let box=label.parentElement;
      for(let i=0;box&&box!==root&&i<14;i++,box=box.parentElement){
        const t=norm(box.textContent);
        if(/WILL[’']S (CALL|STATISTICAL ODDS)/i.test(t)&&/MY PROJECTED WINNER/i.test(t)) break;
      }
      if(!box||box===root)continue;
      const ls=leafs(box);
      for(const el of ls){
        const t=norm(el.textContent);
        if(/^Prediction:\s*/i.test(t))el.textContent='Prediction: Tilt Democratic';
        if(t==='Jackson +0.4%'||t==='No prediction text entered yet.')el.textContent='Collins +1.3%';
      }
      const call=ls.findIndex(el=>/^WILL[’']S CALL$/i.test(norm(el.textContent)));
      if(call>=0){
        const p=ls.slice(call+1,call+12).find(el=>/^(Democrat(?:ic)?|Republican)$/i.test(norm(el.textContent)));
        if(p)p.textContent='Republican';
        const copy=box.querySelector('.prediction-copy');if(copy)copy.textContent='Collins +1.3%';
      }
      const proj=ls.findIndex(el=>/^MY PROJECTED WINNER$/i.test(norm(el.textContent)));
      if(proj>=0){
        const p=ls.slice(proj+1,proj+12).find(el=>/^(Democrat(?:ic)?|Republican)$/i.test(norm(el.textContent)));
        if(p)p.textContent='Republican';
      }
      let why=box.querySelector('.maine-why-note');
      if(!why){why=document.createElement('div');why.className='maine-why-note';box.appendChild(why);}
      why.textContent='WHY I THINK MAINE GOES RED · Final polling margins underestimated Susan Collins by more than 5 points in each of her last three Senate elections (2008, 2014, and 2020).';
      why.style.cssText='margin-top:12px;padding:12px 14px;border-radius:12px;background:#fff3f4;border:1px solid #f1b8bd;color:#7f2330;font:800 12px/1.5 Inter,system-ui,sans-serif;letter-spacing:.05px';
    }
  }

  function forceOhio(){
    const root=document.getElementById('page-senate'); if(!root)return;
    root.querySelectorAll('[data-state="OH"],[data-state="OH"] path,[data-abbr="OH"],[data-abbr="OH"] path,[data-state-abbr="OH"],[data-state-abbr="OH"] path,#OH,#OH path,#state-OH,#state-OH path').forEach(el=>{
      el.style.setProperty('fill',TILT_BLUE,'important');
      if(el.namespaceURI!=='http://www.w3.org/2000/svg'&&!/^(path|polygon|rect)$/i.test(el.tagName||'')) el.style.setProperty('background',TILT_BLUE,'important');
    });
    const labels=leafs(root).filter(el=>norm(el.textContent)==='Ohio'&&el.getClientRects().length);
    for(const label of labels){
      let box=label.parentElement;
      for(let i=0;box&&box!==root&&i<14;i++,box=box.parentElement){
        const t=norm(box.textContent);
        if(/WILL[’']S CALL/i.test(t)&&(/AVG POLLS/i.test(t)||/MY PREDICTION/i.test(t))) break;
      }
      if(!box||box===root)continue;
      let ls=leafs(box);
      for(const el of ls){
        const t=norm(el.textContent);
        if(/^Prediction:\s*/i.test(t))el.textContent='Prediction: Brown +0.6%';
        if(/^(Republican|Democrat(?:ic)?|Tossup|TILT REPUBLICAN|LEAN REPUBLICAN|LIKELY REPUBLICAN|SOLID REPUBLICAN|TILT DEMOCRAT(?:IC)?)$/i.test(t)){
          const nearCall=norm(el.parentElement?.textContent||'');
          if(/WILL[’']S CALL|MY PREDICTION/i.test(nearCall))el.textContent=/TILT/i.test(t)?'TILT DEMOCRATIC':'Democratic';
        }
      }
      const callLeaf=ls.find(el=>/^WILL[’']S CALL$/i.test(norm(el.textContent)));
      if(callLeaf){
        let card=callLeaf.parentElement;
        for(let i=0;card&&card!==box&&i<4;i++,card=card.parentElement){
          const t=norm(card.textContent);
          if(/WILL[’']S CALL/i.test(t)&&t.length<180) break;
        }
        if(card&&card!==box){
          card.style.setProperty('background',TILT_BLUE,'important');
          card.style.setProperty('background-image','none','important');
          card.style.setProperty('border-color',TILT_BLUE_BORDER,'important');
          card.style.setProperty('color',BLUE_DARK,'important');
          card.querySelectorAll('*').forEach(el=>el.style.setProperty('color',BLUE_DARK,'important'));
          const vals=leafs(card);
          const party=vals.find(el=>/^(Republican|Democrat(?:ic)?|Tossup)$/i.test(norm(el.textContent)));
          if(party)party.textContent='Democratic';
          const rating=vals.find(el=>/(TILT|LEAN|LIKELY|SOLID)\s+(REPUBLICAN|DEMOCRAT(?:IC)?)/i.test(norm(el.textContent)));
          if(rating)rating.textContent='TILT DEMOCRATIC';
          const copy=card.querySelector('.prediction-copy');if(copy)copy.textContent='Brown +0.6%';
          const vals2=leafs(card);
          for(const el of vals2){
            const t=norm(el.textContent);
            if(/^(Tilt Democratic|Brown\s*\+?\d+(?:\.\d+)?%?)$/i.test(t)&&!/WILL[’']S CALL|MY PREDICTION/i.test(t)){
              const parent=norm(el.parentElement?.textContent||'');
              if(/WILL[’']S CALL|MY PREDICTION/i.test(parent))el.textContent='Brown +0.6%';
            }
          }
        }
      }
      for(const heading of leafs(box).filter(el=>/^WHY MY .*DIFFERS$/i.test(norm(el.textContent)))){
        let n=heading.parentElement;
        for(let i=0;n&&n!==box&&i<5;i++,n=n.parentElement){
          const t=norm(n.textContent);
          if(/^WHY MY .*DIFFERS/i.test(t)&&!/WILL[’']S CALL/i.test(t)){n.remove();break;}
        }
      }
    }
  }

  function forceTexas(){
    const root=document.getElementById('page-senate'); if(!root)return;
    root.querySelectorAll('[data-state="TX"],[data-state="TX"] path,[data-abbr="TX"],[data-abbr="TX"] path,[data-state-abbr="TX"],[data-state-abbr="TX"] path,#TX,#TX path,#state-TX,#state-TX path').forEach(el=>{
      el.style.setProperty('fill',TILT_BLUE,'important');
      if(el.namespaceURI!=='http://www.w3.org/2000/svg'&&!/^(path|polygon|rect)$/i.test(el.tagName||'')) el.style.setProperty('background',TILT_BLUE,'important');
    });
    const labels=leafs(root).filter(el=>norm(el.textContent)==='Texas'&&el.getClientRects().length);
    for(const label of labels){
      let box=label.parentElement;
      for(let i=0;box&&box!==root&&i<14;i++,box=box.parentElement){
        const t=norm(box.textContent);
        if(/WILL[’']S CALL/i.test(t)&&(/AVG POLLS/i.test(t)||/MY PREDICTION/i.test(t))) break;
      }
      if(!box||box===root)continue;
      let ls=leafs(box);
      for(const el of ls){
        const t=norm(el.textContent);
        if(/^Prediction:\s*/i.test(t))el.textContent='Prediction: Tilt Democratic';
        if(/^(Republican|Democrat(?:ic)?|Tossup|TILT REPUBLICAN|LEAN REPUBLICAN|LIKELY REPUBLICAN|SOLID REPUBLICAN|TILT DEMOCRAT(?:IC)?)$/i.test(t)){
          const nearCall=norm(el.parentElement?.textContent||'');
          if(/WILL[’']S CALL|MY PREDICTION/i.test(nearCall))el.textContent=/TILT/i.test(t)?'TILT DEMOCRATIC':'Democrat';
        }
      }
      const callLeaf=ls.find(el=>/^WILL[’']S CALL$/i.test(norm(el.textContent)));
      if(callLeaf){
        let card=callLeaf.parentElement;
        for(let i=0;card&&card!==box&&i<4;i++,card=card.parentElement){
          const t=norm(card.textContent);
          if(/WILL[’']S CALL/i.test(t)&&t.length<180) break;
        }
        if(card&&card!==box){
          card.style.setProperty('background',RED_LIGHT,'important');
          card.style.setProperty('background-image','none','important');
          card.style.setProperty('border-color','#ef9da5','important');
          card.style.setProperty('color','#8e1320','important');
          card.querySelectorAll('*').forEach(el=>el.style.setProperty('color','#8e1320','important'));
          const vals=leafs(card);
          const party=vals.find(el=>/^(Republican|Democrat(?:ic)?|Tossup)$/i.test(norm(el.textContent)));
          if(party)party.textContent='Democrat';
          const rating=vals.find(el=>/(TILT|LEAN|LIKELY|SOLID)\s+(REPUBLICAN|DEMOCRAT(?:IC)?)/i.test(norm(el.textContent)));
          if(rating)rating.textContent='TILT DEMOCRATIC';
          const copy=card.querySelector('.prediction-copy');if(copy)copy.textContent='Talarico 55% chance of winning';
        }
      }
    }
  }

  function forceSenateSummary(){
    const root=document.getElementById('page-senate'); if(!root)return;
    const ls=leafs(root);
    const majority=ls.find(el=>/50\s*\+\s*VP\s+FOR\s+MAJORITY/i.test(norm(el.textContent)));
    let summary=majority?.parentElement||null;
    for(let d=0;summary&&summary!==root&&d<7;d++,summary=summary.parentElement){
      const text=norm(summary.textContent);
      if(/DEMOCRAT/i.test(text)&&/REPUBLICAN/i.test(text)){
        const demBox=summary.querySelector('.balance-party.dem,.democratic,[data-party="dem"]');
        const repBox=summary.querySelector('.balance-party.rep,.republican,[data-party="rep"]');
        const dn=demBox?.querySelector('strong')||demBox;
        const rn=repBox?.querySelector('strong')||repBox;
        if(dn)dn.textContent='51';
        if(rn)rn.textContent='49';
        summary.querySelectorAll('[aria-label*="Senate prediction"]').forEach(el=>el.setAttribute('aria-label','Senate prediction: 51 Democrats and 49 Republicans'));
        const bars=[...summary.querySelectorAll('.senate-bar,.forecast-bar,.seat-bar,[class*="senate-bar"],[class*="seat-bar"]')];
        for(const bar of bars){
          const kids=[...bar.children].filter(el=>el.nodeType===1);
          const dbar=bar.querySelector('.dem,.democratic,[data-party="dem"]')||kids[0];
          const rbar=bar.querySelector('.rep,.republican,[data-party="rep"]')||kids[kids.length-1];
          if(dbar)dbar.style.setProperty('width','51%','important');
          if(rbar)rbar.style.setProperty('width','49%','important');
        }
        break;
      }
    }
    for(const el of ls){
      const t=norm(el.textContent);
      if(/^\d+\s+(?:INDEPENDENT|TOSSUPS?)$/i.test(t))el.textContent='0 TOSSUP';
    }
  }

  function forceHome(){
    const root=document.getElementById('page-home');if(!root)return;
    const title=leafs(root).find(el=>/^Will[’']s Senate Prediction$/i.test(norm(el.textContent)));
    if(!title)return;
    let card=title.parentElement;
    for(let i=0;card&&card!==root&&i<7;i++,card=card.parentElement){
      const t=norm(card.textContent);
      if(/Democrats/i.test(t)&&/Republicans/i.test(t)&&/51 seats needed for a majority/i.test(t))break;
    }
    if(!card||card===root)return;
    card.querySelectorAll('.senate-tiebreak,.final-tiebreak').forEach(el=>el.remove());
    const nums=[...card.querySelectorAll('.party-number,.final-party-number')];
    if(nums.length>=2){nums[0].textContent='51';nums[1].textContent='49';}
    const all=leafs(card);
    for(const el of all){
      const t=norm(el.textContent);
      if(/^Democrats?:\s*\d+$/i.test(t))el.textContent=t.replace(/\d+$/,'51');
      if(/^Republicans?:\s*\d+$/i.test(t))el.textContent=t.replace(/\d+$/,'49');
      if(/^\d+\s+(?:TOSSUPS?|INDEPENDENT)$/i.test(t))el.textContent='0 TOSSUP';
    }
    const bar=card.querySelector('.senate-bar,.final-bar');
    if(bar){
      const d=bar.querySelector('.dem'),r=bar.querySelector('.rep');
      if(d)d.style.setProperty('width','51%','important');
      if(r)r.style.setProperty('width','49%','important');
      let y=bar.querySelector('.tossup,.toss-up,[data-tossup]');
      if(!y&&d&&r){y=document.createElement('span');y.className='tossup';bar.appendChild(y);}
      if(y){y.style.setProperty('width','0%','important');y.style.setProperty('display','none','important');}
      bar.setAttribute('aria-label','Senate prediction: 51 Democrats and 49 Republicans');
    }
    card.querySelectorAll('.will-tossup-count').forEach(el=>el.remove());
  }

  function apply(){
    const changed=syncData();
    if(changed&&typeof renderSenate==='function'&&!rendering){rendering=true;try{renderSenate();}catch(e){}finally{rendering=false;}}
    forceOhio();forceSenateSummary();forceHome();
  }
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply();});}
  apply();[80,250,700,1600,3200].forEach(ms=>setTimeout(apply,ms));
  document.addEventListener('click',e=>{if(e.target?.closest?.('#page-senate')){setTimeout(apply,0);setTimeout(apply,120);}},true);
  window.addEventListener('pageshow',apply);window.addEventListener('resize',apply);
})();

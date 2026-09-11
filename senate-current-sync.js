(()=>{
  'use strict';
  const AVG={
    AK:{'peltola':'50.5','sullivan':'46.5'},
    AR:{'shoffner':'43.0','cotton':'46.0'},
    GA:{'ossoff':'50.0','collins':'43.0'},
    IA:{'turek':'44.7','hinson':'45.0'},
    ID:{'achilles':'34.0','risch':'33.5'},
    KS:{'hamilton':'45.0','marshall':'46.0'},
    MA:{'markey':'50.0','deaton':'30.0'},
    ME:{'jackson':'47.7','collins':'44.2'},
    MI:{'el-sayed':'45.4','rogers':'44.5'},
    MN:{'flanagan':'45.0','tafoya':'41.5'},
    MT:{'bodnar':'48.0','alme':'45.0'},
    NC:{'cooper':'50.4','whatley':'40.7'},
    NH:{'pappas':'42.3','sununu':'41.0'},
    NM:{'lujn':'53.0','marker':'38.0'},
    OH:{'brown':'47.8','husted':'41.4'},
    RI:{'reed':'51.0','mckay':'31.0'},
    SC:{'andrews':'37.7','graham':'42.0'},
    TN:{'bradshaw':'32.3','hagerty':'55.7'},
    TX:{'talarico':'47.8','paxton':'44.9'}
  };
  const MAINE_NOTE='Why: Final polling margins underestimated Susan Collins by more than 5 points in each of her last three Senate elections (2008, 2014, and 2020).';
  const RED_LIGHT='#f8c6ca';
  const TOSSUP='#f2c94c';
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
        set(me,'rating','tilt-r');set(me,'predictionParty','Republican');set(me,'prediction','Collins +1.3%');set(me,'notes',MAINE_NOTE);set(me,'updated','2026-09-10');
        for(const k of ['projectedWinner','predictionWinner','winner','callParty']) if(k in me) set(me,k,'Republican');
        if('call' in me) set(me,'call','Collins +1.3%');
      }
      const oh=stateData.OH;
      if(oh){
        set(oh,'rating','tossup');set(oh,'predictionParty','Tossup');set(oh,'prediction','Tossup');set(oh,'notes','');set(oh,'updated','2026-09-11');
        for(const k of ['projectedWinner','predictionWinner','winner','callParty']) if(k in oh) set(oh,k,'Tossup');
        if('call' in oh) set(oh,'call','Tossup');
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
        if(/^Prediction:\s*/i.test(t))el.textContent='Prediction: Tilt Republican';
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
      el.style.setProperty('fill',TOSSUP,'important');
      if(el.namespaceURI!=='http://www.w3.org/2000/svg'&&!/^(path|polygon|rect)$/i.test(el.tagName||'')) el.style.setProperty('background',TOSSUP,'important');
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
        if(/^Prediction:\s*/i.test(t))el.textContent='Prediction: Toss-up';
        if(/^(Republican|Democrat(?:ic)?|TILT REPUBLICAN|LEAN REPUBLICAN|LIKELY REPUBLICAN|SOLID REPUBLICAN)$/i.test(t)){
          const nearCall=norm(el.parentElement?.textContent||'');
          if(/WILL[’']S CALL|MY PREDICTION/i.test(nearCall))el.textContent='Tossup';
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
          card.style.setProperty('background',TOSSUP,'important');
          card.style.setProperty('border-color','#d9ad22','important');
          card.style.setProperty('color','#fff','important');
          card.querySelectorAll('*').forEach(el=>el.style.setProperty('color','#fff','important'));
          const vals=leafs(card);
          const party=vals.find(el=>/^(Republican|Democrat(?:ic)?|Tossup)$/i.test(norm(el.textContent)));
          if(party)party.textContent='Tossup';
          const rating=vals.find(el=>/(TILT|LEAN|LIKELY|SOLID)\s+(REPUBLICAN|DEMOCRAT(?:IC)?)/i.test(norm(el.textContent)));
          if(rating)rating.textContent='TOSSUP';
          const copy=card.querySelector('.prediction-copy');if(copy)copy.textContent='Tossup';
        }
      }
      for(const heading of leafs(box).filter(el=>/^WHY MY FORECAST DIFFERS$/i.test(norm(el.textContent)))){
        let n=heading.parentElement;
        for(let i=0;n&&n!==box&&i<5;i++,n=n.parentElement){
          const t=norm(n.textContent);
          if(/^WHY MY FORECAST DIFFERS/i.test(t)&&!/WILL[’']S CALL/i.test(t)){n.remove();break;}
        }
      }
    }
  }

  function forceSenateSummary(){
    const root=document.getElementById('page-senate'); if(!root)return;
    const ls=leafs(root);
    for(const label of ls){
      const t=norm(label.textContent);
      if(!/^(REPUBLICAN|DEMOCRAT(?:IC)?)$/i.test(t))continue;
      let box=label.parentElement;
      for(let d=0;box&&box!==root&&d<6;d++,box=box.parentElement){
        const text=norm(box.textContent);
        if(!/REPUBLICAN/i.test(text)||!/DEMOCRAT/i.test(text))continue;
        const branch=label.parentElement;
        const n=leafs(branch).find(x=>/^\d+$/.test(norm(x.textContent)));
        if(n)n.textContent=/^REPUBLICAN$/i.test(t)?'50':'49';
        break;
      }
    }
    for(const el of ls){
      const t=norm(el.textContent);
      if(/^0\s+INDEPENDENT$/i.test(t)||/^0\s+TOSSUP$/i.test(t))el.textContent='1 TOSSUP';
    }
    const bars=[...root.querySelectorAll('.senate-bar,.forecast-bar,.seat-bar,[class*="senate-bar"],[class*="seat-bar"]')];
    for(const bar of bars){
      const d=bar.querySelector('.dem'),r=bar.querySelector('.rep');
      if(d)d.style.setProperty('width','49%','important');
      if(r)r.style.setProperty('width','50%','important');
      let y=bar.querySelector('.tossup,.toss-up,[data-tossup]');
      if(!y&&d&&r){y=document.createElement('span');y.className='tossup';bar.appendChild(y);}
      if(y){y.style.setProperty('width','1%','important');y.style.setProperty('background',TOSSUP,'important');y.style.setProperty('display','block','important');}
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
    if(nums.length>=2){nums[0].textContent='49';nums[1].textContent='50';}
    const all=leafs(card);
    for(const el of all){
      const t=norm(el.textContent);
      if(/^Democrats?:\s*50$/i.test(t))el.textContent=t.replace(/50$/,'49');
      if(/^Republicans?:\s*51$/i.test(t))el.textContent=t.replace(/51$/,'50');
      if(/^0\s+TOSSUP$/i.test(t)||/^0\s+INDEPENDENT$/i.test(t))el.textContent='1 TOSSUP';
    }
    const bar=card.querySelector('.senate-bar,.final-bar');
    if(bar){
      const d=bar.querySelector('.dem'),r=bar.querySelector('.rep');
      if(d)d.style.setProperty('width','49%','important');
      if(r)r.style.setProperty('width','50%','important');
      let y=bar.querySelector('.tossup,.toss-up,[data-tossup]');
      if(!y&&d&&r){y=document.createElement('span');y.className='tossup';bar.appendChild(y);}
      if(y){y.style.setProperty('width','1%','important');y.style.setProperty('background',TOSSUP,'important');y.style.setProperty('display','block','important');}
      bar.setAttribute('aria-label','Senate prediction: 49 Democrats, 50 Republicans, and 1 tossup');
    }
    if(!card.querySelector('.will-tossup-count')){
      const note=card.querySelector('.majority-note')||card.querySelector('.senate-countdown')||bar;
      if(note){
        const s=document.createElement('div');s.className='will-tossup-count';s.textContent='1 TOSSUP';
        s.style.cssText='margin-top:7px;text-align:center;color:#b58a00;font:900 10px/1.2 Inter,system-ui,sans-serif;letter-spacing:1.2px';
        note.insertAdjacentElement('afterend',s);
      }
    }
  }

  function apply(){
    const changed=syncData();
    if(changed&&typeof renderSenate==='function'&&!rendering){rendering=true;try{renderSenate();}catch(e){}finally{rendering=false;}}
    forceMaine();forceOhio();forceSenateSummary();forceHome();
  }
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply();});}
  apply();[80,250,700,1600,3200].forEach(ms=>setTimeout(apply,ms));
  setInterval(apply,1200);
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','style']});
  window.addEventListener('pageshow',apply);window.addEventListener('resize',apply);
})();

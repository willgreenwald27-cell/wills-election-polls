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
        oh.rating='tilt-d';
        oh.predictionParty='Democratic';
        oh.prediction='Brown +0.6%';
        oh.notes='';
        oh.updated='2026-09-20';
        for(const k of ['projectedWinner','predictionWinner','winner','callParty'])if(k in oh)oh[k]='Democratic';
        if('call' in oh)oh.call='Brown +0.6%';
        for(const slot of [1,2]){
          const name=norm(oh['candidate'+slot]);
          if(/Brown/i.test(name))oh['candidate'+slot+'Odds']='54';
          if(/Husted/i.test(name))oh['candidate'+slot+'Odds']='46';
        }
      }
    }catch(e){}
  }

  function visiblePanel(stateName){
    const root=document.getElementById('page-senate');
    if(!root)return null;

    // Anchor to a visible leaf whose text is exactly the state name.
    // This stops map labels from causing the whole Senate page to be treated
    // as a state's popup.
    const wanted=norm(stateName).toLowerCase();
    const labels=[...root.querySelectorAll('*')].filter(el=>
      el.children.length===0 &&
      el.getClientRects().length &&
      norm(el.textContent).toLowerCase()===wanted
    );

    const hits=[];
    for(const label of labels){
      let p=label.parentElement;
      for(let i=0;p&&p!==root&&i<12;i++,p=p.parentElement){
        if(!p.getClientRects().length)continue;
        const t=norm(p.textContent);
        if(/WILL[’']S CALL|MY PREDICTION|AVG POLLS|POLL AVERAGE/i.test(t)){
          const r=p.getBoundingClientRect();
          if(r.width<=900&&r.height<=1400)hits.push(p);
          break;
        }
      }
    }

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

  function removeTexasExplanation(){
    const panel=visiblePanel('Texas');
    if(!panel)return;
    try{
      if(typeof stateData!=='undefined'&&stateData?.TX)stateData.TX.notes='';
    }catch(e){}

    const headingRx=/^(?:WHY\b|WHY\s+MY\b|EXPLANATION\b|FORECAST\s+EXPLANATION\b)/i;
    const phraseRx=/why\s+(?:my\s+)?(?:forecast|poll|prediction|call)?\s*(?:differs|is different)|forecast\s+differs|poll\s+differs/i;
    const leaves=[...panel.querySelectorAll('*')].filter(el=>el.children.length===0);

    const targets=leaves.filter(el=>{
      const t=norm(el.textContent);
      return headingRx.test(t)||phraseRx.test(t);
    });

    for(const leaf of targets){
      let cur=leaf,best=leaf;
      for(let i=0;i<7;i++){
        const p=cur.parentElement;
        if(!p||p===panel)break;
        const t=norm(p.textContent);
        const r=p.getBoundingClientRect();
        if(
          (headingRx.test(t)||phraseRx.test(t)) &&
          !/WILL[’']S CALL|AVG POLLS|POLL AVERAGE|WIN ODDS|MY PREDICTION/i.test(t) &&
          r.height<360
        ){
          best=p;cur=p;
        }else break;
      }
      best.remove();
    }

    panel.querySelectorAll(
      '.why-note,.forecast-explanation,.prediction-explanation,.poll-explanation,'+
      '[class*="why-diff"],[class*="forecast-diff"],[class*="poll-diff"],[data-explanation]'
    ).forEach(el=>{
      const t=norm(el.textContent);
      if(!/Nebraska|Maine|Kansas/i.test(t))el.remove();
    });
  }

  function keepMainePartyLabelsVisible(){
    const panel=visiblePanel('Maine');
    if(!panel)return;

    const paint=el=>{
      const t=norm(el.textContent);
      const isRep=/^Republican$/i.test(t);
      const isDem=/^Democrat(?:ic)?$/i.test(t);
      if(!isRep&&!isDem)return;
      el.style.setProperty('display','block','important');
      el.style.setProperty('visibility','visible','important');
      el.style.setProperty('opacity','1','important');
      el.style.setProperty('max-height','none','important');
      el.style.setProperty('overflow','visible','important');
      el.style.setProperty('color',isRep?'#bd2937':'#2763b8','important');
    };

    panel.querySelectorAll('.candidate-party').forEach(el=>{
      el.style.setProperty('display','block','important');
      el.style.setProperty('visibility','visible','important');
      el.style.setProperty('opacity','1','important');
      el.style.setProperty('max-height','none','important');
      el.style.setProperty('overflow','visible','important');
      const t=norm(el.textContent);
      if(/rep/i.test(t))el.style.setProperty('color','#bd2937','important');
      if(/dem/i.test(t))el.style.setProperty('color','#2763b8','important');
    });

    [...panel.querySelectorAll('*')]
      .filter(el=>el.children.length===0)
      .forEach(paint);
  }

  function forceOhioStable(){
    const root=document.getElementById('page-senate');
    if(!root)return;

    root.querySelectorAll(
      '[data-state="OH"],[data-state="OH"] path,[data-abbr="OH"],[data-abbr="OH"] path,'+
      '[data-state-abbr="OH"],[data-state-abbr="OH"] path,#OH,#OH path,#state-OH,#state-OH path'
    ).forEach(el=>{
      el.style.setProperty('fill',BLUE,'important');
      if(el.namespaceURI!=='http://www.w3.org/2000/svg'&&!/^(path|polygon|rect)$/i.test(el.tagName||'')){
        el.style.setProperty('background',BLUE,'important');
      }
    });

    const panel=visiblePanel('Ohio');
    if(!panel)return;
    const hasOhioTitle=[...panel.querySelectorAll('*')].some(el=>
      el.children.length===0&&/^Ohio$/i.test(norm(el.textContent))
    );
    if(!hasOhioTitle)return;
    const leaves=[...panel.querySelectorAll('*')].filter(el=>el.children.length===0);

    for(const el of leaves){
      const t=norm(el.textContent);
      if(/^Prediction:\s*/i.test(t))el.textContent='Prediction: Brown +0.6%';
    }

    const call=leaves.find(el=>/^WILL[’']S CALL$/i.test(norm(el.textContent)));
    if(call){
      let card=call.parentElement;
      for(let i=0;card&&card!==panel&&i<5;i++,card=card.parentElement){
        const t=norm(card.textContent);
        if(/WILL[’']S CALL/i.test(t)&&t.length<240)break;
      }
      if(card&&card!==panel){
        // Undo older whole-card color overrides; keep normal popup styling.
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
        const copy=card.querySelector('.prediction-copy');
        if(copy)copy.textContent='Brown +0.6%';
        for(const el of vals){
          const t=norm(el.textContent);
          if(/^Brown\s*\+\s*\d+(?:\.\d+)?%?$/i.test(t))el.textContent='Brown +0.6%';
        }
      }
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
    try{
      if(typeof stateData!=='undefined'&&stateData?.TX){
        const tx=stateData.TX;
        for(const slot of [1,2]){
          const name=norm(tx['candidate'+slot]);
          const key='candidate'+slot+'Odds';
          if(/Talarico/i.test(name))tx[key]='54';
          if(/Paxton/i.test(name))tx[key]='46';
        }
      }
    }catch(e){}
    const panel=visiblePanel('Texas');
    if(!panel)return;
    const values=[...panel.querySelectorAll('*')].filter(el=>{
      if(el.children.length)return false;
      return /^(?:46|48|52|54)(?:\.0)?%?$/.test(norm(el.textContent));
    });
    for(const el of values){
      let p=el.parentElement,who='';
      for(let i=0;p&&p!==panel&&i<7;i++,p=p.parentElement){
        const t=norm(p.textContent);
        const hasT=/\b(?:James\s+)?Talarico\b/i.test(t);
        const hasP=/\b(?:Ken\s+)?Paxton\b/i.test(t);
        if(hasT!==hasP){who=hasT?'Talarico':'Paxton';break;}
      }
      if(who==='Talarico')el.textContent='54%';
      else if(who==='Paxton')el.textContent='46%';
    }
    const lines=[...panel.querySelectorAll('.candidate-line')].filter(el=>el.getClientRects().length);
    const bar=panel.querySelector('.oddsbar');
    if(bar&&lines.length>=2){
      const odds=lines.map(line=>{
        const name=norm(line.querySelector('.candidate-name')?.textContent);
        return /Talarico/i.test(name)?54:/Paxton/i.test(name)?46:null;
      });
      const a=bar.querySelector('.oddsbar-a'),b=bar.querySelector('.oddsbar-b');
      if(a&&odds[0]!=null)a.style.setProperty('width',odds[0]+'%','important');
      if(b&&odds[1]!=null)b.style.setProperty('width',odds[1]+'%','important');
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

  function forceNebraskaOdds(){
    try{
      if(typeof stateData!=='undefined'&&stateData?.NE){
        const ne=stateData.NE;
        for(const slot of [1,2]){
          const name=norm(ne['candidate'+slot]);
          const key='candidate'+slot+'Odds';
          if(/Ricketts/i.test(name))ne[key]='63';
          else if(name)ne[key]='37';
        }
      }
    }catch(e){}

    const panel=visiblePanel('Nebraska');
    if(!panel)return;

    // Only touch the explicit win-odds summary. Never rewrite generic
    // percentages, because the AVG POLLS rows use the same visual markup.
    for(const el of [...panel.querySelectorAll('*')].filter(x=>x.children.length===0)){
      const t=norm(el.textContent);
      if(/^Win odds:/i.test(t)){
        el.textContent=t
          .replace(/Dan\s+Osborn\s+\d+(?:\.\d+)?%/i,'Dan Osborn 37%')
          .replace(/Pete\s+Ricketts\s+\d+(?:\.\d+)?%/i,'Pete Ricketts 63%');
      }
    }

    const bar=panel.querySelector('.oddsbar');
    if(bar){
      const oddsSection=bar.closest('.odds-card,.odds-section,.win-odds')||bar.parentElement;
      const lines=[...(oddsSection||panel).querySelectorAll('.candidate-line')].filter(el=>el.getClientRects().length);
      if(lines.length>=2){
        const odds=lines.map(line=>{
          const name=norm(line.querySelector('.candidate-name')?.textContent);
          return /Ricketts/i.test(name)?63:/Osborn/i.test(name)?37:null;
        });
        const a=bar.querySelector('.oddsbar-a'),b=bar.querySelector('.oddsbar-b');
        if(a&&odds[0]!=null)a.style.setProperty('width',odds[0]+'%','important');
        if(b&&odds[1]!=null)b.style.setProperty('width',odds[1]+'%','important');
      }
    }
  }

  function ensureNebraskaExplanation(){
    const panel=visiblePanel('Nebraska');
    if(!panel)return;
    const existingHeading=[...panel.querySelectorAll('*')].find(el=>el.children.length===0&&/^WHY MY FORECAST DIFFERS$/i.test(norm(el.textContent)));
    if(existingHeading)return;
    let box=panel.querySelector('.wg-ne-explanation');
    if(!box){
      box=document.createElement('div');
      box.className='wg-ne-explanation';
      panel.appendChild(box);
    }
    box.innerHTML='<b>WHY MY FORECAST DIFFERS</b><span>Pete Ricketts is the incumbent and won a statewide Senate election in Nebraska in 2024. I\'m giving that recent statewide result and incumbency more weight than the current polling margin.</span>';
    box.style.cssText='margin-top:12px;padding:14px 15px;border-radius:10px;background:#f7f8fb;border:1px solid #d9dee7;color:#26384f;font:500 12px/1.45 Inter,system-ui,sans-serif;box-sizing:border-box;';
    const b=box.querySelector('b');if(b)b.style.cssText='display:block;margin-bottom:8px;color:#61718a;font-size:10px;line-height:1.1;font-weight:900;letter-spacing:1.2px;text-transform:uppercase;';
    const s=box.querySelector('span');if(s)s.style.cssText='display:block;color:#26384f;';
  }

  function forceMontanaAverage(){
    try{
      if(typeof stateData!=='undefined'&&stateData?.MT){
        const mt=stateData.MT;
        for(const slot of [1,2]){
          const name=norm(mt['candidate'+slot]);
          const key='candidate'+slot+'Poll';
          if(/\bAlme\b/i.test(name))mt[key]='44.7';
          if(/\bBodnar\b/i.test(name))mt[key]='40.0';
        }
        mt.updated='2026-09-17';
      }
    }catch(e){}

    const panel=visiblePanel('Montana');
    if(!panel)return;

    const setCandidatePct=(rx,value)=>{
      const names=[...panel.querySelectorAll('*')].filter(el=>el.children.length===0&&rx.test(norm(el.textContent)));
      for(const nameEl of names){
        let row=nameEl.parentElement;
        for(let i=0;row&&row!==panel&&i<7;i++,row=row.parentElement){
          const t=norm(row.textContent);
          const hasName=rx.test(t);
          const hasPct=/\b\d+(?:\.\d+)?%\b/.test(t);
          const both=/\bAlme\b/i.test(t)&&/\bBodnar\b/i.test(t);
          if(hasName&&hasPct&&!both)break;
        }
        if(!row||row===panel)continue;
        for(const el of [...row.querySelectorAll('*')].filter(x=>x.children.length===0)){
          if(/^\d+(?:\.\d+)?%$/.test(norm(el.textContent)))el.textContent=value+'%';
        }
      }
    };
    setCandidatePct(/\bAlme\b/i,'44.7');
    setCandidatePct(/\bBodnar\b/i,'40.0');

    const avgHeading=[...panel.querySelectorAll('*')].find(el=>el.children.length===0&&/^(AVG POLLS|POLL AVERAGE)$/i.test(norm(el.textContent)));
    if(avgHeading){
      let box=avgHeading.parentElement;
      for(let i=0;box&&box!==panel&&i<6;i++,box=box.parentElement){
        const t=norm(box.textContent);
        if(/Alme/i.test(t)&&/Bodnar/i.test(t))break;
      }
      if(box&&box!==panel){
        for(const el of [...box.querySelectorAll('*')].filter(x=>x.children.length===0)){
          const t=norm(el.textContent);
          if(/^(?:Even|Alme\s*\+\s*\d+(?:\.\d+)?|Bodnar\s*\+\s*\d+(?:\.\d+)?)$/i.test(t))el.textContent='Alme +4.7';
        }
      }
    }
  }

  function apply(){
    syncData();
    forceMontanaAverage();
    keepMainePartyLabelsVisible();
    forceOhioStable();
    forceTexasBlue();
    fixSenateSeatBalanceBar();
    forceTexasOdds();
    removeTexasExplanation();
    removeWhyBlock('Ohio');
    forceNebraskaOdds();
    ensureNebraskaExplanation();
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

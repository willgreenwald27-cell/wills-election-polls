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
        tx.prediction='Talarico +0.7%';
        tx.notes='';
        tx.updated='2026-10-01';
        for(const k of ['projectedWinner','predictionWinner','winner','callParty'])if(k in tx)tx[k]='Democratic';
        if('call' in tx)tx.call='Talarico +0.7%';
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
      norm(el.textContent).toLowerCase()===wanted &&
      !el.closest('.sidebar,.rating-table-card,.wg-studio-radar,.senate-night-panel,.page-head')
    );

    const hits=[];
    for(const label of labels){
      let p=label.parentElement;
      for(let i=0;p&&p!==root&&i<12;i++,p=p.parentElement){
        if(p.matches('.forecast-layout,.content,.map-card,.map-wrap,.sidebar'))break;
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
    try{if(typeof stateData!=='undefined'&&stateData?.TX)stateData.TX.notes='';}catch(e){}
    const panel=visiblePanel('Texas');
    if(!panel)return;
    panel.querySelectorAll('.wg-tx-explanation,[data-forecast-disagreement="TX"]').forEach(el=>el.remove());
    removeWhyBlock('Texas');
    const headings=[...panel.querySelectorAll('*')].filter(el=>el.children.length===0&&/^WHY I HAVE TEXAS TILT DEMOCRATIC$/i.test(norm(el.textContent)));
    for(const heading of headings){
      const box=heading.parentElement;
      if(box&&box!==panel&&!/WILL[’']S CALL|AVG POLLS|POLL AVERAGE/i.test(norm(box.textContent)))box.remove();
      else heading.remove();
    }
  }

  // Keep Iowa and Kansas forecast-difference explanations visible in their pop-ups.
  // The underlying state notes are set in senate-current-sync.js.
  function ensureIowaKansasExplanations(){
    const explanations={
      IA:{
        state:'Iowa',
        text:"Iowa's recent Republican voting history weighs more heavily in my forecast than the narrow Democratic lead in polling."
      },
      KS:{
        state:'Kansas',
        text:'It may be too big of an ask to flip a state that Trump won by 16 points in 2024.'
      }
    };
    // Iowa pop-ups can extend off-screen on laptops and phones. On a
    // constrained viewport, use a separate viewport-fixed, compact note.
    const iowaPanel=visiblePanel('Iowa');
    const compact=window.innerWidth<=900 || window.innerHeight<=950;
    let floating=document.getElementById('wg-iowa-visible-explanation');
    if(iowaPanel&&compact){
      if(!floating){
        floating=document.createElement('aside');
        floating.id='wg-iowa-visible-explanation';
        floating.setAttribute('role','note');
        floating.setAttribute('aria-label','Why my Iowa forecast differs from polls');
        floating.style.cssText='position:fixed!important;bottom:max(12px,env(safe-area-inset-bottom))!important;left:50%!important;transform:translateX(-50%)!important;width:min(500px,calc(100vw - 24px))!important;max-height:40dvh!important;overflow-y:auto!important;z-index:2147483646!important;margin:0!important;padding:12px 16px!important;background:#fff!important;border:1px solid #bfcede!important;border-radius:12px!important;box-shadow:0 10px 36px rgba(25,43,67,.25)!important;box-sizing:border-box!important;pointer-events:none!important;color:#22364e!important;';
        const header=document.createElement('strong');
        header.textContent='IOWA — WHY MY FORECAST DIFFERS';
        header.style.cssText='display:block;font:800 11px/1.3 Inter,system-ui,sans-serif;letter-spacing:.4px;margin:0 0 5px;';
        const body=document.createElement('p');
        body.style.cssText='margin:0;font:500 13px/1.45 Inter,system-ui,sans-serif;';
        body.textContent=explanations.IA.text;
        floating.append(header,body);
        document.body.appendChild(floating);
      }
    }else if(floating){
      floating.remove();
    }
    for(const [abbr,cfg] of Object.entries(explanations)){
      const panel=abbr==='IA'?iowaPanel:visiblePanel(cfg.state);
      if(!panel)continue;
      let note=panel.querySelector('.wg-forecast-explanation[data-state-explanation="'+abbr+'"]');
      // Do not duplicate an explanation provided by the original popup.
      if(!note){
        const nativeHeading=[...panel.querySelectorAll('*')].some(el=>
          el.children.length===0 &&
          /^WHY MY FORECAST DIFFERS$/i.test(norm(el.textContent)) &&
          !el.closest('.wg-forecast-explanation')
        );
        if(nativeHeading|| (abbr==='IA'&&compact))continue;
        note=document.createElement('section');
        note.className='wg-forecast-explanation';
        note.setAttribute('data-state-explanation',abbr);
        note.style.cssText='margin:8px 0 2px;padding:9px 11px;background:#f6f8fc;border:1px solid #dbe3ed;border-radius:9px;box-sizing:border-box;';
        const head=document.createElement('strong');
        head.textContent='WHY MY FORECAST DIFFERS';
        head.style.cssText='display:block;margin-bottom:5px;font:800 11px/1.3 Inter,system-ui,sans-serif;letter-spacing:.4px;color:#334a65;';
        const body=document.createElement('p');
        body.className='wg-forecast-explanation-copy';
        body.style.cssText='margin:0;font:500 13px/1.45 Inter,system-ui,sans-serif;color:#26384f;';
        note.append(head,body);
        if(abbr==='IA')panel.insertBefore(note,panel.children[1]||panel.firstElementChild);
        else panel.appendChild(note);
      }
      if(abbr==='IA'&&compact){
        if(note.style.display!=='none')note.style.display='none';
      }else{
        if(note.style.display==='none')note.style.display='';
        const body=note.querySelector('.wg-forecast-explanation-copy');
        if(body&&norm(body.textContent)!==cfg.text)body.textContent=cfg.text;
      }
    }
  }

  function keepMainePartyLabelsVisible(){
    const panel=visiblePanel('Maine');
    if(!panel)return;

    // Maine's hover panel is redrawn by several late UI patches. Some redraws
    // remove the party node instead of merely hiding it, so reconstruct it
    // from the candidate name before applying visibility/color fixes.
    const ensureParty=(line,party,color)=>{
      if(!line)return;
      let el=line.querySelector('.candidate-party');
      if(!el){
        el=document.createElement('div');
        el.className='candidate-party';
        const name=line.querySelector('.candidate-name');
        if(name){
          const host=name.parentElement||line;
          if(host===line)name.insertAdjacentElement('afterend',el);
          else host.appendChild(el);
        }else{
          line.appendChild(el);
        }
      }
      if(norm(el.textContent)!==party)el.textContent=party;
      el.style.setProperty('display','block','important');
      el.style.setProperty('visibility','visible','important');
      el.style.setProperty('opacity','1','important');
      el.style.setProperty('max-height','none','important');
      el.style.setProperty('overflow','visible','important');
      el.style.setProperty('color',color,'important');
      el.style.setProperty('pointer-events','none','important');
    };

    for(const line of panel.querySelectorAll('.candidate-line')){
      const name=norm(line.querySelector('.candidate-name')?.textContent);
      if(/^Troy Jackson$/i.test(name))ensureParty(line,'Democrat','#2763b8');
      if(/^Susan Collins$/i.test(name))ensureParty(line,'Republican','#bd2937');
    }

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

  let maineStateHover=false;
  let mainePanelHover=false;
  let maineGraceUntil=0;
  let maineKeepTimer=null;

  function stabilizeMaineHover(){
    if(!window.matchMedia?.('(hover:hover) and (pointer:fine)').matches)return;
    const root=document.getElementById('page-senate');
    if(!root)return;

    const safeOpen=()=>{
      try{
        if(typeof window.openState==='function')window.openState('ME');
        else if(typeof openState==='function')openState('ME');
      }catch(e){}
    };

    const keepAlive=()=>{
      if(maineKeepTimer)return;
      maineKeepTimer=setInterval(()=>{
        const keep=maineStateHover||mainePanelHover||Date.now()<maineGraceUntil;
        if(!keep){
          clearInterval(maineKeepTimer);
          maineKeepTimer=null;
          return;
        }
        if(!visiblePanel('Maine'))safeOpen();
        keepMainePartyLabelsVisible();
    stabilizeMaineHover();
        bindPanel();
      },70);
    };

    const enterState=()=>{
      maineStateHover=true;
      maineGraceUntil=Date.now()+700;
      safeOpen();
      setTimeout(()=>{keepMainePartyLabelsVisible();bindPanel();},0);
      setTimeout(()=>{if(maineStateHover||Date.now()<maineGraceUntil)safeOpen();bindPanel();},80);
      keepAlive();
    };
    const leaveState=()=>{
      maineStateHover=false;
      maineGraceUntil=Date.now()+700;
      keepAlive();
    };

    const bindPanel=()=>{
      const panel=visiblePanel('Maine');
      if(!panel||panel.dataset.wgMaineHoverBound==='1')return;
      panel.dataset.wgMaineHoverBound='1';
      panel.addEventListener('pointerenter',()=>{
        mainePanelHover=true;
        maineGraceUntil=Date.now()+700;
        keepAlive();
      },true);
      panel.addEventListener('pointerleave',()=>{
        mainePanelHover=false;
        maineGraceUntil=Date.now()+220;
        keepAlive();
      },true);
      panel.addEventListener('mouseenter',()=>{
        mainePanelHover=true;
        maineGraceUntil=Date.now()+700;
        keepAlive();
      },true);
      panel.addEventListener('mouseleave',()=>{
        mainePanelHover=false;
        maineGraceUntil=Date.now()+220;
        keepAlive();
      },true);
    };

    const selectors=[
      '[data-state="ME"]','[data-abbr="ME"]','[data-state-abbr="ME"]',
      '#ME','#state-ME','[id="ME"]','[id="state-ME"]'
    ];
    const targets=new Set();
    for(const sel of selectors){
      root.querySelectorAll(sel).forEach(el=>targets.add(el));
    }
    for(const el of [...targets]){
      if(el.dataset?.wgMaineHoverBound==='1')continue;
      if(el.dataset)el.dataset.wgMaineHoverBound='1';
      el.addEventListener('pointerenter',enterState,true);
      el.addEventListener('pointerleave',leaveState,true);
      el.addEventListener('mouseenter',enterState,true);
      el.addEventListener('mouseleave',leaveState,true);
    }

    // Some map builds attach ME to a parent group while only the text/path
    // carries the visible label. Catch those without affecting other states.
    const meLabels=[...root.querySelectorAll('text,tspan')].filter(el=>/^ME$/i.test(norm(el.textContent)));
    for(const label of meLabels){
      const el=label.closest('g')||label;
      if(el.dataset?.wgMaineHoverBound==='1')continue;
      if(el.dataset)el.dataset.wgMaineHoverBound='1';
      el.addEventListener('pointerenter',enterState,true);
      el.addEventListener('pointerleave',leaveState,true);
      el.addEventListener('mouseenter',enterState,true);
      el.addEventListener('mouseleave',leaveState,true);
    }

    bindPanel();
  }

  function forceOhioStable(){
    const root=document.getElementById('page-senate');
    if(!root)return;

    root.querySelectorAll(
      '[data-state="OH"],[data-state="OH"] path,[data-abbr="OH"],[data-abbr="OH"] path,'+
      '[data-state-abbr="OH"],[data-state-abbr="OH"] path,#OH,#OH path,#state-OH,#state-OH path'
    ).forEach(el=>{
      el.style.setProperty('fill','#a9c5ed','important');
      if(el.namespaceURI!=='http://www.w3.org/2000/svg'&&!/^(path|polygon|rect)$/i.test(el.tagName||'')){
        el.style.setProperty('background','#a9c5ed','important');
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

  function forceTexasRed(){
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
        if(party)party.textContent='Democrat';
        const rating=vals.find(el=>/(TILT|LEAN|LIKELY|SOLID)\s+(REPUBLICAN|DEMOCRAT(?:IC)?)/i.test(norm(el.textContent)));
        if(rating)rating.textContent='TILT DEMOCRATIC';
        const copy=card.querySelector('.prediction-copy');if(copy)copy.textContent='Talarico +0.7%';
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
          if(/Talarico/i.test(name))tx[key]='55';
          if(/Paxton/i.test(name))tx[key]='45';
        }
      }
    }catch(e){}
    const panel=visiblePanel('Texas');
    if(!panel)return;
    const values=[...panel.querySelectorAll('*')].filter(el=>{
      if(el.children.length)return false;
      return /^(?:45|46|47|48|52|53|54|55)(?:\.0)?%?$/.test(norm(el.textContent));
    });
    for(const el of values){
      let p=el.parentElement,who='';
      for(let i=0;p&&p!==panel&&i<7;i++,p=p.parentElement){
        const t=norm(p.textContent);
        const hasT=/\b(?:James\s+)?Talarico\b/i.test(t);
        const hasP=/\b(?:Ken\s+)?Paxton\b/i.test(t);
        if(hasT!==hasP){who=hasT?'Talarico':'Paxton';break;}
      }
      if(who==='Talarico')el.textContent='55%';
      else if(who==='Paxton')el.textContent='45%';
    }
    const lines=[...panel.querySelectorAll('.candidate-line')].filter(el=>el.getClientRects().length);
    const bar=panel.querySelector('.oddsbar');
    if(bar&&lines.length>=2){
      const odds=lines.map(line=>{
        const name=norm(line.querySelector('.candidate-name')?.textContent);
        return /Talarico/i.test(name)?55:/Paxton/i.test(name)?45:null;
      });
      const a=bar.querySelector('.oddsbar-a'),b=bar.querySelector('.oddsbar-b');
      if(a&&odds[0]!=null)a.style.setProperty('width',odds[0]+'%','important');
      if(b&&odds[1]!=null)b.style.setProperty('width',odds[1]+'%','important');
    }
  }

  function keepTopSeatPartyLabels(){
    const root=document.getElementById('page-senate');
    if(!root)return;
    const row=root.querySelector('.balance-count-row');
    if(!row)return;

    const dem=row.querySelector('.balance-party.dem');
    const rep=row.querySelector('.balance-party.rep');

    const ensure=(box,label,count,color,side)=>{
      if(!box)return;

      let number=box.querySelector('strong');
      if(!number){
        number=document.createElement('strong');
        box.appendChild(number);
      }
      number.textContent=count;

      let party=[...box.children].find(el=>el!==number&&/^(Democrat(?:ic)?|Republican)$/i.test(norm(el.textContent)));
      if(!party){
        party=document.createElement('span');
        if(side==='left')box.insertBefore(party,number);
        else box.appendChild(party);
      }
      party.textContent=label;

      box.style.setProperty('display','flex','important');
      box.style.setProperty('align-items','baseline','important');
      box.style.setProperty('gap','8px','important');
      box.style.setProperty('overflow','visible','important');
      box.style.setProperty('visibility','visible','important');
      box.style.setProperty('opacity','1','important');
      box.style.setProperty('justify-content',side==='left'?'flex-start':'flex-end','important');
      box.style.setProperty('text-align',side==='left'?'left':'right','important');

      party.style.setProperty('display','inline-block','important');
      party.style.setProperty('visibility','visible','important');
      party.style.setProperty('opacity','1','important');
      party.style.setProperty('position','static','important');
      party.style.setProperty('width','auto','important');
      party.style.setProperty('height','auto','important');
      party.style.setProperty('max-width','none','important');
      party.style.setProperty('max-height','none','important');
      party.style.setProperty('overflow','visible','important');
      party.style.setProperty('white-space','nowrap','important');
      party.style.setProperty('font-weight','900','important');
      party.style.setProperty('letter-spacing','1.05px','important');
      party.style.setProperty('text-transform','uppercase','important');
      party.style.setProperty('color',color,'important');
      party.style.setProperty('pointer-events','none','important');

      number.style.setProperty('display','inline-block','important');
      number.style.setProperty('visibility','visible','important');
      number.style.setProperty('opacity','1','important');

      if(side==='left'){
        party.style.setProperty('order','1','important');
        number.style.setProperty('order','2','important');
      }else{
        number.style.setProperty('order','1','important');
        party.style.setProperty('order','2','important');
      }
    };

    ensure(dem,'Democratic','51','#2763b8','left');
    ensure(rep,'Republican','49','#bd2937','right');
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
      dem.style.setProperty('width','50%','important');
      dem.style.setProperty('min-width','50%','important');
      dem.style.setProperty('max-width','50%','important');
      dem.style.setProperty('flex','0 0 50%','important');
      dem.style.setProperty('transform','none','important');
      dem.style.setProperty('clip-path','none','important');

      rep.style.setProperty('position','absolute','important');
      rep.style.setProperty('right','0','important');
      rep.style.setProperty('left','auto','important');
      rep.style.setProperty('top','0','important');
      rep.style.setProperty('bottom','0','important');
      rep.style.setProperty('width','50%','important');
      rep.style.setProperty('min-width','50%','important');
      rep.style.setProperty('max-width','50%','important');
      rep.style.setProperty('flex','0 0 50%','important');
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
      bar.setAttribute('aria-label','Senate balance: 50 Democratic seats, 50 Republican seats; majority marker at 50 seats plus the vice president');
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
    panel.querySelectorAll('.wg-ne-explanation').forEach(el=>el.remove());
    const headings=[...panel.querySelectorAll('*')].filter(el=>
      el.children.length===0&&/^WHY(?:\s+MY)?\b.*DIFFERS\b/i.test(norm(el.textContent))
    );
    for(const heading of headings){
      let cur=heading,best=heading;
      for(let i=0;i<6;i++){
        const p=cur.parentElement;
        if(!p||p===panel)break;
        const t=norm(p.textContent);
        if(/^WHY(?:\s+MY)?\b.*DIFFERS\b/i.test(t)&&!/WILL[’']S CALL|AVG POLLS|POLL AVERAGE|WIN ODDS/i.test(t)){
          best=p;cur=p;
        }else break;
      }
      best.remove();
    }
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
    keepTopSeatPartyLabels();
    forceOhioStable();
    fixSenateSeatBalanceBar();
    removeTexasExplanation();
    removeWhyBlock('Ohio');
    ensureIowaKansasExplanations();
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

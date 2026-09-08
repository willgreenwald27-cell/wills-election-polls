(()=>{
  const RED='#bd2937', BLUE='#2763b8', PURPLE='#8051d2';
  let queued=false, wrapped=false;
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const leafs=root=>[...root.querySelectorAll('*')].filter(el=>el.children.length===0);

  function partyColor(v){
    const p=norm(v).toLowerCase();
    if(p==='r'||p==='rep'||p==='gop'||p.includes('republican')) return RED;
    if(p==='d'||p.includes('democrat')) return BLUE;
    return PURPLE;
  }

  function enforceData(){
    try{
      if(typeof stateData==='undefined'||!stateData) return;
      const me=stateData.ME;
      if(me){
        me.rating='tilt-r';
        me.predictionParty='Republican';
        me.prediction='Collins +1.3%';
        me.updated='2026-09-07';
        for(const k of ['projectedWinner','predictionWinner','winner','callParty']) if(k in me) me[k]='Republican';
        if('call' in me) me.call='Collins +1.3%';
        if(norm(me.candidate1)==='Susan Collins') me.candidate1Odds='51';
        if(norm(me.candidate2)==='Susan Collins') me.candidate2Odds='51';
        if(norm(me.candidate1)==='Troy Jackson') me.candidate1Odds='49';
        if(norm(me.candidate2)==='Troy Jackson') me.candidate2Odds='49';
      }
      if(stateData.NH&&stateData.NH.active) stateData.NH.rating='tilt-d';
    }catch(e){}
  }

  function wrapRenderer(){
    if(wrapped) return;
    try{
      const old=window.renderSenate;
      if(typeof old!=='function') return;
      if(old.__willsFinal) {wrapped=true;return;}
      const fn=function(){enforceData();const out=old.apply(this,arguments);requestAnimationFrame(fixDom);return out;};
      fn.__willsFinal=true;
      window.renderSenate=fn;
      wrapped=true;
    }catch(e){}
  }

  function setBalance(){
    const root=document.getElementById('page-senate'); if(!root) return;
    for(const label of leafs(root)){
      const t=norm(label.textContent);
      if(!/^(REPUBLICAN|DEMOCRAT(?:IC)?)$/i.test(t)) continue;
      let box=label.parentElement;
      for(let d=0;box&&box!==root&&d<5;d++,box=box.parentElement){
        const n=leafs(box).find(x=>/^\d+$/.test(norm(x.textContent)));
        if(n){n.textContent=/^REPUBLICAN$/i.test(t)?'51':'49';break;}
      }
    }
  }

  function findMainePanel(){
    const root=document.getElementById('page-senate'); if(!root) return null;
    const candidates=leafs(root).filter(el=>norm(el.textContent)==='Maine'&&el.getClientRects().length);
    for(const m of candidates){
      let box=m.parentElement;
      for(let i=0;box&&box!==root&&i<14;i++,box=box.parentElement){
        const t=norm(box.textContent);
        if(/WILL'S (CALL|STATISTICAL ODDS)/i.test(t)&&/(AVG POLLS|POLL AVERAGE|WIN ODDS|MY PROJECTED WINNER)/i.test(t)) return box;
      }
    }
    return null;
  }

  function fixMaine(){
    const root=document.getElementById('page-senate'); if(!root) return;
    root.querySelectorAll('[data-state="ME"],[data-abbr="ME"],[data-state-abbr="ME"],#ME,#state-ME').forEach(el=>{
      el.style.setProperty('fill','#f8c6ca','important');
      if(el.namespaceURI!=='http://www.w3.org/2000/svg') el.style.setProperty('background','#f8c6ca','important');
    });
    const box=findMainePanel(); if(!box) return;
    const ls=leafs(box);

    for(const el of ls){
      const t=norm(el.textContent);
      if(/^Prediction:\s*/i.test(t)) el.textContent='Prediction: Tilt Republican';
      if(t==='Jackson +0.4%'||t==='Tilt Republican'||t==='No prediction text entered yet.'){
        if(el.closest('.prediction-copy')||/Jackson \+0\.4%|No prediction text/i.test(t)) el.textContent='Collins +1.3%';
      }
      if(/^Susan Collins:\s*\d+(?:\.\d+)?%$/i.test(t)) el.textContent='Susan Collins: 51%';
      if(/^Troy Jackson:\s*\d+(?:\.\d+)?%$/i.test(t)) el.textContent='Troy Jackson: 49%';
    }

    const call=ls.findIndex(el=>/^WILL'S CALL$/i.test(norm(el.textContent)));
    if(call>=0){
      const p=ls.slice(call+1,call+12).find(el=>/^(Democrat(?:ic)?|Republican)$/i.test(norm(el.textContent)));
      if(p){p.textContent='Republican';p.style.setProperty('color',RED,'important');}
      const copy=box.querySelector('.prediction-copy'); if(copy) copy.textContent='Collins +1.3%';
    }

    const proj=ls.findIndex(el=>/^MY PROJECTED WINNER$/i.test(norm(el.textContent)));
    if(proj>=0){
      const p=ls.slice(proj+1,proj+12).find(el=>/^(Democrat(?:ic)?|Republican)$/i.test(norm(el.textContent)));
      if(p) p.textContent='Republican';
    }

    const lines=[...box.querySelectorAll('.candidate-line')].filter(el=>el.getClientRects().length);
    const bar=box.querySelector('.oddsbar');
    if(bar&&lines.length>=2){
      const names=lines.map(line=>norm(line.querySelector('.candidate-name')?.textContent));
      const odds=names.map(n=>n==='Susan Collins'?51:n==='Troy Jackson'?49:null);
      const colors=lines.map(line=>partyColor(line.querySelector('.candidate-party')?.textContent));
      const a=bar.querySelector('.oddsbar-a'),b=bar.querySelector('.oddsbar-b');
      if(a&&odds[0]!=null){a.style.setProperty('width',odds[0]+'%','important');a.style.setProperty('background',colors[0],'important');}
      if(b&&odds[1]!=null){b.style.setProperty('width',odds[1]+'%','important');b.style.setProperty('background',colors[1],'important');}
    }
  }

  function fixPartyVisuals(){
    const root=document.getElementById('page-senate'); if(!root) return;
    for(const line of root.querySelectorAll('.candidate-line')){
      const p=line.querySelector('.candidate-party'); if(!p) continue;
      const c=partyColor(p.textContent);
      line.querySelectorAll('.candidate-name,.candidate-party,.candidate-metrics b,.candidate-metrics strong').forEach(el=>el.style.setProperty('color',c,'important'));
    }
    for(const bar of root.querySelectorAll('.oddsbar')){
      let panel=bar.parentElement;
      while(panel&&panel!==root){
        const lines=[...panel.querySelectorAll('.candidate-line')];
        if(lines.length>=2){
          const a=bar.querySelector('.oddsbar-a'),b=bar.querySelector('.oddsbar-b');
          if(a)a.style.setProperty('background',partyColor(lines[0].querySelector('.candidate-party')?.textContent),'important');
          if(b)b.style.setProperty('background',partyColor(lines[1].querySelector('.candidate-party')?.textContent),'important');
          break;
        }
        panel=panel.parentElement;
      }
    }
  }

  function fixHome(){
    const root=document.getElementById('page-home'); if(!root) return;
    for(const card of root.querySelectorAll('.reference-metrics>*')){
      const t=norm(card.textContent).toLowerCase();
      if(t.includes('poll')&&t.includes('entered')) leafs(card).forEach(el=>{if(norm(el.textContent)==='13')el.textContent='88';});
      if(t.includes('latest')&&t.includes('update')) leafs(card).forEach(el=>{if(/Sep\.? 6, 2026|2026-09-06/i.test(norm(el.textContent)))el.textContent='Sep 7, 2026';});
    }
  }

  function fixDom(){
    enforceData();
    wrapRenderer();
    setBalance();
    fixMaine();
    fixPartyVisuals();
    fixHome();
  }
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;fixDom();});}

  fixDom();
  setTimeout(fixDom,100);setTimeout(fixDom,600);setTimeout(fixDom,1500);
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true});
  window.addEventListener('pageshow',fixDom);
  window.addEventListener('resize',fixDom);
})();

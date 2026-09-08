(()=>{
  const REP='#bd2937', DEM='#2763b8', IND='#8051d2';
  const INDS=new Set(['dan osborn','seth bodnar','todd achilles','brian bengs']);
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const leafs=r=>r?[...r.querySelectorAll('*')].filter(el=>el.children.length===0):[];
  const visible=el=>!!(el&&el.getClientRects&&el.getClientRects().length);

  function partyColorFromText(v){
    const p=norm(v).toLowerCase();
    if(p==='r'||p==='rep'||p.includes('republican')) return REP;
    if(p==='d'||p==='dem'||p.includes('democrat')) return DEM;
    if(p==='i'||p==='ind'||p.includes('independent')||p.includes('unaffiliated')||p.includes('other')) return IND;
    return null;
  }

  function candidateMap(){
    const out=new Map();
    try{
      if(typeof stateData!=='undefined'&&stateData){
        for(const s of Object.values(stateData)){
          if(!s) continue;
          for(const [name,party] of [[s.candidate1,s.candidate1Party],[s.candidate2,s.candidate2Party]]){
            const n=norm(name); if(!n) continue;
            let c=partyColorFromText(party);
            if(INDS.has(n.toLowerCase())) c=IND;
            if(c) out.set(n.toLowerCase(),{name:n,color:c});
          }
        }
      }
    }catch(e){}
    for(const n of INDS) if(!out.has(n)) out.set(n,{name:n.replace(/\b\w/g,m=>m.toUpperCase()),color:IND});
    return out;
  }

  function matchCandidateText(text,map){
    const t=norm(text).toLowerCase();
    for(const [k,v] of map){
      if(t===k||t.startsWith(k+':')) return v;
    }
    return null;
  }

  function findCardForName(nameEl,root){
    let card=nameEl.parentElement;
    for(let i=0;card&&card!==root&&i<8;i++,card=card.parentElement){
      const t=norm(card.textContent);
      if(/poll average/i.test(t)&&/\d+(?:\.\d+)?%/.test(t)) return card;
    }
    return null;
  }

  function forceMobileColors(){
    if(!window.matchMedia('(max-width:760px)').matches) return;
    const root=document.getElementById('page-senate');
    if(!root) return;
    const map=candidateMap();
    const all=leafs(root).filter(visible);
    const shown=[];

    // Color every visible candidate-name / odds label by the candidate's party.
    for(const el of all){
      const hit=matchCandidateText(el.textContent,map);
      if(!hit) continue;
      el.style.setProperty('color',hit.color,'important');
      if(norm(el.textContent).toLowerCase()===hit.name.toLowerCase()){
        const card=findCardForName(el,root);
        if(card&&!shown.some(x=>x.card===card)){
          shown.push({card,name:hit.name,color:hit.color,nameEl:el});
          for(const x of leafs(card).filter(visible)){
            const tx=norm(x.textContent);
            if(/^\d+(?:\.\d+)?%$/.test(tx)) x.style.setProperty('color',hit.color,'important');
            const pc=partyColorFromText(tx);
            if(pc) x.style.setProperty('color',hit.color,'important');
          }
        }
      }
    }

    // Fallback: find candidate cards even if the name leaf has extra markup.
    for(const lab of all.filter(el=>/^POLL AVERAGE$/i.test(norm(el.textContent)))){
      let card=lab.parentElement;
      for(let i=0;card&&card!==root&&i<8;i++,card=card.parentElement){
        const ls=leafs(card).filter(visible);
        const nameEl=ls.find(x=>matchCandidateText(x.textContent,map));
        const pct=ls.find(x=>/^\d+(?:\.\d+)?%$/.test(norm(x.textContent)));
        if(!nameEl||!pct) continue;
        const hit=matchCandidateText(nameEl.textContent,map);
        if(!hit) continue;
        nameEl.style.setProperty('color',hit.color,'important');
        pct.style.setProperty('color',hit.color,'important');
        ls.filter(x=>partyColorFromText(x.textContent)).forEach(x=>x.style.setProperty('color',hit.color,'important'));
        if(!shown.some(x=>x.card===card)) shown.push({card,name:hit.name,color:hit.color,nameEl});
        break;
      }
    }

    // Color the labels under Will's Statistical Odds and the bar itself.
    const heading=all.find(el=>/will'?s statistical odds/i.test(norm(el.textContent)));
    if(heading){
      let panel=heading.parentElement;
      for(let depth=0;panel&&panel!==root&&depth<10;depth++,panel=panel.parentElement){
        const pls=leafs(panel).filter(visible);
        const labels=[];
        for(const el of pls){
          const hit=matchCandidateText(el.textContent,map);
          if(!hit||!/:\s*\d+(?:\.\d+)?%$/.test(norm(el.textContent))) continue;
          const m=norm(el.textContent).match(/(\d+(?:\.\d+)?)%$/);
          el.style.setProperty('color',hit.color,'important');
          labels.push({el,name:hit.name,color:hit.color,pct:m?Number(m[1]):null});
        }
        if(labels.length<2) continue;
        labels.sort((a,b)=>a.el.getBoundingClientRect().left-b.el.getBoundingClientRect().left);
        const left=labels[0],right=labels[1];
        const split=Number.isFinite(left.pct)?Math.max(0,Math.min(100,left.pct)):50;
        const hr=heading.getBoundingClientRect();
        const labelTop=Math.min(...labels.map(x=>x.el.getBoundingClientRect().top));
        const candidates=[...panel.querySelectorAll('div,span,i')]
          .filter(visible)
          .map(el=>({el,r:el.getBoundingClientRect()}))
          .filter(x=>x.r.width>=140&&x.r.height>=5&&x.r.height<=32&&x.r.top>=hr.bottom-4&&x.r.bottom<=labelTop+4)
          .sort((a,b)=>b.r.width-a.r.width||a.r.top-b.r.top);
        const bar=candidates[0]?.el;
        if(bar){
          const grad=`linear-gradient(to right, ${left.color} 0%, ${left.color} ${split}%, ${right.color} ${split}%, ${right.color} 100%)`;
          bar.style.setProperty('background',grad,'important');
          bar.style.setProperty('background-image',grad,'important');
          [...bar.children].forEach(el=>{
            el.style.setProperty('background','transparent','important');
            el.style.setProperty('background-color','transparent','important');
          });
        }
        break;
      }
    }
  }

  // Keep the already-working home navigation behavior.
  function navigate(target){
    if(typeof window.__acceptedGoodNavigate==='function'){
      window.__acceptedGoodNavigate(target,true);
      return true;
    }
    const btn=document.querySelector(`.site-header .nav [data-accepted-page="${target}"]`);
    if(btn){btn.click();return true;}
    return false;
  }
  function homeTarget(text){
    const t=norm(text).toLowerCase().replace(/[→›»]+/g,'').trim();
    if(/^(view|see) latest polls$/.test(t)||t==='view all') return 'polls';
    if(/^(see|view) forecasts?$/.test(t)||t==='view map'||t==='see map') return 'senate';
    return null;
  }
  document.addEventListener('click',e=>{
    const home=document.getElementById('page-home');
    if(!home||!home.contains(e.target)) return;
    const hit=e.target.closest?.('button,a,[role="button"]');
    if(!hit) return;
    const target=homeTarget(hit.textContent);
    if(!target) return;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();navigate(target);
  },true);

  let queued=false;
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;forceMobileColors();});}
  forceMobileColors();
  [80,250,600,1200,2200].forEach(ms=>setTimeout(forceMobileColors,ms));
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','style']});
  setInterval(forceMobileColors,900);
  window.addEventListener('pageshow',forceMobileColors);
  window.addEventListener('resize',forceMobileColors);
})();
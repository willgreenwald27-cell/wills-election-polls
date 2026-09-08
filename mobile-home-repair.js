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

  function colorForName(name){
    const n=norm(name).toLowerCase();
    if(INDS.has(n)) return IND;
    try{
      if(typeof stateData!=='undefined'&&stateData){
        for(const s of Object.values(stateData)){
          if(!s) continue;
          if(norm(s.candidate1).toLowerCase()===n) return partyColorFromText(s.candidate1Party)||IND;
          if(norm(s.candidate2).toLowerCase()===n) return partyColorFromText(s.candidate2Party)||IND;
        }
      }
    }catch(e){}
    return null;
  }

  function findCandidateCards(root){
    const cards=[];
    const labels=leafs(root).filter(el=>visible(el)&&/^POLL AVERAGE$/i.test(norm(el.textContent)));
    for(const lab of labels){
      let card=lab.parentElement;
      for(let i=0;card&&card!==root&&i<6;i++,card=card.parentElement){
        const ls=leafs(card).filter(visible);
        const pct=ls.find(el=>/^\d+(?:\.\d+)?%$/.test(norm(el.textContent)));
        const name=ls.find(el=>{
          const t=norm(el.textContent);
          return t&&/[A-Za-z]/.test(t)&&t.split(/\s+/).length>=2&&!/^(POLL AVERAGE|Republican|Democrat(?:ic)?|Independent|Unaffiliated|Other)$/i.test(t);
        });
        if(name&&pct){
          const partyEl=ls.find(el=>/^(Republican|Democrat(?:ic)?|Independent|Unaffiliated|Other)$/i.test(norm(el.textContent)));
          const color=colorForName(name.textContent)||partyColorFromText(partyEl?.textContent);
          if(color&&!cards.some(x=>x.card===card)) cards.push({card,name,pct,partyEl,color});
          break;
        }
      }
    }
    return cards;
  }

  function fixMobileColors(){
    if(!window.matchMedia('(max-width:760px)').matches) return;
    const root=document.getElementById('page-senate');
    if(!root) return;
    const cards=findCandidateCards(root).slice(0,2);
    if(!cards.length) return;

    for(const c of cards){
      c.name.style.setProperty('color',c.color,'important');
      c.pct.style.setProperty('color',c.color,'important');
      if(c.partyEl) c.partyEl.style.setProperty('color',c.color,'important');
    }

    const all=leafs(root).filter(visible);
    const odds=[];
    for(const c of cards){
      const name=norm(c.name.textContent).toLowerCase();
      const el=all.find(x=>{
        const t=norm(x.textContent);
        return t.toLowerCase().startsWith(name+':')&&/\d+(?:\.\d+)?%$/.test(t);
      });
      if(el){
        el.style.setProperty('color',c.color,'important');
        const m=norm(el.textContent).match(/(\d+(?:\.\d+)?)%$/);
        odds.push({el,color:c.color,pct:m?Number(m[1]):null,name});
      }
    }
    if(odds.length<2) return;

    const heading=all.find(el=>/will'?s statistical odds/i.test(norm(el.textContent)));
    if(!heading) return;
    const hr=heading.getBoundingClientRect();
    const labelTop=Math.min(...odds.map(o=>o.el.getBoundingClientRect().top));
    const candidates=[...root.querySelectorAll('div,span,i')].filter(visible).map(el=>({el,r:el.getBoundingClientRect()})).filter(x=>x.r.width>140&&x.r.height>=5&&x.r.height<=30&&x.r.top>=hr.bottom-2&&x.r.bottom<=labelTop+4);
    candidates.sort((a,b)=>b.r.width-a.r.width||a.r.top-b.r.top);
    const bar=candidates[0]?.el;
    if(!bar) return;

    odds.sort((a,b)=>a.el.getBoundingClientRect().left-b.el.getBoundingClientRect().left);
    const left=odds[0], right=odds[1];
    const split=Number.isFinite(left.pct)?Math.max(0,Math.min(100,left.pct)):50;
    bar.style.setProperty('background',`linear-gradient(to right, ${left.color} 0%, ${left.color} ${split}%, ${right.color} ${split}%, ${right.color} 100%)`,'important');
    [...bar.children].forEach((el,i)=>{
      if(i===0) el.style.setProperty('background',left.color,'important');
      if(i===1) el.style.setProperty('background',right.color,'important');
    });
  }

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
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    navigate(target);
  },true);

  let queued=false;
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;fixMobileColors();});}
  fixMobileColors();
  setTimeout(fixMobileColors,100);setTimeout(fixMobileColors,400);setTimeout(fixMobileColors,1000);setTimeout(fixMobileColors,2000);
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true});
  window.addEventListener('pageshow',fixMobileColors);
  window.addEventListener('resize',fixMobileColors);
})();
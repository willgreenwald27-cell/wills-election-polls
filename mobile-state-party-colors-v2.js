(()=>{
  const RED='#bd2937', BLUE='#2763b8', PURPLE='#8051d2';
  const INDEPENDENTS=new Set(['dan osborn','seth bodnar','todd achilles','brian bengs']);
  let queued=false;
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const leafs=r=>r?[...r.querySelectorAll('*')].filter(el=>el.children.length===0):[];

  function partyFor(name, partyText){
    const n=norm(name).toLowerCase();
    const p=norm(partyText).toLowerCase();
    if(INDEPENDENTS.has(n)||p==='i'||p.includes('independent')||p.includes('unaffiliated')||p.includes('other')) return 'I';
    if(p==='r'||p==='rep'||p.includes('republican')) return 'R';
    if(p==='d'||p.includes('democrat')) return 'D';
    try{
      if(typeof stateData!=='undefined'&&stateData){
        for(const s of Object.values(stateData)){
          if(!s) continue;
          if(norm(s.candidate1).toLowerCase()===n){
            const sp=norm(s.candidate1Party).toLowerCase();
            if(sp==='i'||sp.includes('independent')||sp.includes('unaffiliated')||sp.includes('other')) return 'I';
            if(sp.includes('republican')||sp==='r') return 'R';
            if(sp.includes('democrat')||sp==='d') return 'D';
          }
          if(norm(s.candidate2).toLowerCase()===n){
            const sp=norm(s.candidate2Party).toLowerCase();
            if(sp==='i'||sp.includes('independent')||sp.includes('unaffiliated')||sp.includes('other')) return 'I';
            if(sp.includes('republican')||sp==='r') return 'R';
            if(sp.includes('democrat')||sp==='d') return 'D';
          }
        }
      }
    }catch(e){}
    return INDEPENDENTS.has(n)?'I':null;
  }
  const colorFor=party=>party==='R'?RED:party==='D'?BLUE:party==='I'?PURPLE:null;

  function fix(){
    if(!window.matchMedia('(max-width:760px)').matches) return;
    const root=document.getElementById('page-senate');
    if(!root) return;

    const lines=[...root.querySelectorAll('.candidate-line')].filter(el=>el.getClientRects().length);
    const candidates=[];
    for(const line of lines){
      const nameEl=line.querySelector('.candidate-name');
      if(!nameEl) continue;
      const name=norm(nameEl.textContent);
      const partyEl=line.querySelector('.candidate-party');
      const party=partyFor(name,partyEl?.textContent);
      const color=colorFor(party);
      if(!color) continue;
      candidates.push({line,name,party,color});
      nameEl.style.setProperty('color',color,'important');
      if(partyEl) partyEl.style.setProperty('color',color,'important');
      line.querySelectorAll('.candidate-metrics b,.candidate-metrics strong,.candidate-metrics span').forEach(el=>{
        if(/\d+(?:\.\d+)?%/.test(norm(el.textContent))) el.style.setProperty('color',color,'important');
      });
      for(const el of leafs(line)) if(/^\d+(?:\.\d+)?%$/.test(norm(el.textContent))) el.style.setProperty('color',color,'important');
    }

    if(!candidates.length) return;
    const all=leafs(root);
    for(const c of candidates){
      const lower=c.name.toLowerCase();
      for(const el of all){
        const t=norm(el.textContent);
        const tl=t.toLowerCase();
        if((tl.startsWith(lower+':')||tl===lower)&&/\d+(?:\.\d+)?%/.test(t)) el.style.setProperty('color',c.color,'important');
      }
    }

    for(const bar of root.querySelectorAll('.oddsbar')){
      if(!bar.getClientRects().length) continue;
      let panel=bar.parentElement;
      while(panel&&panel!==root){
        const panelLines=[...panel.querySelectorAll('.candidate-line')].filter(el=>el.getClientRects().length);
        if(panelLines.length>=2){
          const parts=[bar.querySelector('.oddsbar-a'),bar.querySelector('.oddsbar-b')];
          panelLines.slice(0,2).forEach((line,i)=>{
            const name=norm(line.querySelector('.candidate-name')?.textContent);
            const party=partyFor(name,line.querySelector('.candidate-party')?.textContent);
            const color=colorFor(party);
            if(parts[i]&&color) parts[i].style.setProperty('background',color,'important');
          });
          break;
        }
        panel=panel.parentElement;
      }
    }

    // Fallback for mobile detail bars whose segments are not named .oddsbar-a/.oddsbar-b.
    const headings=all.filter(el=>/will'?s statistical odds/i.test(norm(el.textContent))&&el.getClientRects().length);
    for(const heading of headings){
      let panel=heading.parentElement;
      for(let i=0;panel&&panel!==root&&i<8;i++,panel=panel.parentElement){
        const pcs=candidates.filter(c=>panel.contains(c.line));
        if(pcs.length<2) continue;
        const labels=leafs(panel).filter(el=>pcs.some(c=>norm(el.textContent).toLowerCase().startsWith(c.name.toLowerCase()+':'))&&/\d+(?:\.\d+)?%/.test(norm(el.textContent)));
        labels.forEach(el=>{
          const c=pcs.find(x=>norm(el.textContent).toLowerCase().startsWith(x.name.toLowerCase()+':'));
          if(c) el.style.setProperty('color',c.color,'important');
        });
        const segs=[...panel.querySelectorAll('div,span,i')].filter(el=>{
          const r=el.getBoundingClientRect();
          return r.width>20&&r.height>=5&&r.height<=28&&r.top>heading.getBoundingClientRect().bottom&&(!labels[0]||r.bottom<labels[0].getBoundingClientRect().top+8);
        }).sort((a,b)=>a.getBoundingClientRect().left-b.getBoundingClientRect().left);
        const unique=[];
        for(const el of segs){const r=el.getBoundingClientRect();if(!unique.some(x=>Math.abs(x.getBoundingClientRect().left-r.left)<2&&Math.abs(x.getBoundingClientRect().width-r.width)<2))unique.push(el);}
        if(unique.length>=2){unique[0].style.setProperty('background',pcs[0].color,'important');unique[1].style.setProperty('background',pcs[1].color,'important');}
        break;
      }
    }
  }

  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;fix();});}
  fix();
  setTimeout(fix,100);setTimeout(fix,500);setTimeout(fix,1500);
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true});
  window.addEventListener('pageshow',fix);
  window.addEventListener('resize',fix);
})();
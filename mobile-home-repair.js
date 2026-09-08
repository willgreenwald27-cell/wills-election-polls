(()=>{
  const REP='#bd2937', DEM='#2763b8', IND='#8051d2';
  const INDS=new Set(['dan osborn','seth bodnar','todd achilles','brian bengs']);
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();

  function partyColor(text,name=''){
    const p=norm(text).toLowerCase();
    const n=norm(name).toLowerCase();
    if(INDS.has(n)||p==='i'||p.includes('independent')||p.includes('unaffiliated')||p.includes('other')) return IND;
    if(p==='r'||p==='rep'||p.includes('republican')) return REP;
    if(p==='d'||p==='dem'||p.includes('democrat')) return DEM;
    try{
      if(typeof stateData!=='undefined'&&stateData){
        for(const s of Object.values(stateData)){
          if(!s) continue;
          if(norm(s.candidate1).toLowerCase()===n) return partyColor(s.candidate1Party,n);
          if(norm(s.candidate2).toLowerCase()===n) return partyColor(s.candidate2Party,n);
        }
      }
    }catch(e){}
    return INDS.has(n)?IND:null;
  }

  function fixDrawerColors(){
    if(!window.matchMedia('(max-width:760px)').matches) return;
    const drawer=document.querySelector('.drawer.show')||document.getElementById('stateDrawer')||document.querySelector('.drawer');
    if(!drawer) return;
    const lines=[...drawer.querySelectorAll('.candidate-line')].slice(0,2);
    if(lines.length<2) return;

    const colors=lines.map(line=>{
      const nameEl=line.querySelector('.candidate-name');
      const partyEl=line.querySelector('.candidate-party');
      const pctEl=line.querySelector('.candidate-metrics b');
      const name=norm(nameEl?.textContent);
      const color=partyColor(partyEl?.textContent,name);
      if(color){
        nameEl?.style.setProperty('color',color,'important');
        pctEl?.style.setProperty('color',color,'important');
        if(partyEl&&norm(partyEl.textContent)) partyEl.style.setProperty('color',color,'important');
      }
      return color;
    });

    const bar=drawer.querySelector('.oddsbar');
    if(bar){
      const a=bar.querySelector('.oddsbar-a');
      const b=bar.querySelector('.oddsbar-b');
      if(a&&colors[0]){
        a.style.setProperty('background',colors[0],'important');
        a.style.setProperty('background-color',colors[0],'important');
      }
      if(b&&colors[1]){
        b.style.setProperty('background',colors[1],'important');
        b.style.setProperty('background-color',colors[1],'important');
      }
      bar.style.removeProperty('background-image');
      const labels=bar.nextElementSibling?.querySelectorAll('b')||[];
      if(labels[0]&&colors[0]) labels[0].style.setProperty('color',colors[0],'important');
      if(labels[1]&&colors[1]) labels[1].style.setProperty('color',colors[1],'important');
    }
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
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();navigate(target);
  },true);

  let queued=false;
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;fixDrawerColors();});}
  fixDrawerColors();
  [60,150,350,700,1200,2200].forEach(ms=>setTimeout(fixDrawerColors,ms));
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','style']});
  setInterval(fixDrawerColors,700);
  window.addEventListener('pageshow',fixDrawerColors);
  window.addEventListener('resize',fixDrawerColors);
})();
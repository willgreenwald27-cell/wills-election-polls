(()=>{
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const AVG={
    TX:{talarico:'47.8',paxton:'44.9'},
    ME:{jackson:'47.7',collins:'44.2'},
    NC:{cooper:'50.4',whatley:'40.7'}
  };
  let wrapped=false;

  function setCandidatePoll(ab,last,value){
    try{
      const s=window.stateData?.[ab]; if(!s) return;
      for(const slot of [1,2]){
        if(!norm(s['candidate'+slot]).toLowerCase().includes(last)) continue;
        s['candidate'+slot+'Poll']=String(value);
      }
      s.updated='2026-09-10';
    }catch(e){}
  }

  function enforceAverages(){
    setCandidatePoll('TX','talarico',AVG.TX.talarico);
    setCandidatePoll('TX','paxton',AVG.TX.paxton);
    setCandidatePoll('ME','jackson',AVG.ME.jackson);
    setCandidatePoll('ME','collins',AVG.ME.collins);
    setCandidatePoll('NC','cooper',AVG.NC.cooper);
    setCandidatePoll('NC','whatley',AVG.NC.whatley);
  }

  function wrapSenateRenderer(){
    if(wrapped) return;
    const old=window.renderSenate;
    if(typeof old!=='function') return;
    if(old.__sep10Polls){wrapped=true;return;}
    const fn=function(){enforceAverages();return old.apply(this,arguments);};
    fn.__sep10Polls=true;
    window.renderSenate=fn;
    wrapped=true;
  }

  function ensureNativePolls(){
    try{
      if(!Array.isArray(window.polls)) return false;
      let changed=false;
      const add=obj=>{
        const exists=window.polls.some(p=>p&&p.state===obj.state&&p.date===obj.date&&norm(p.pollster)===obj.pollster&&norm(p.c1)===obj.c1&&norm(p.c2)===obj.c2);
        if(!exists){window.polls.push(obj);changed=true;}
      };
      add({date:'2026-09-09',state:'TX',pollster:'Fabrizio/Anzalone',sample:'',c1:'James Talarico',c1Pct:'48',c2:'Ken Paxton',c2Pct:'44',notes:'Earpolling listing · Talarico +4'});
      add({date:'2026-09-09',state:'ME',pollster:'YouGov',sample:'',c1:'Troy Jackson',c1Pct:'48',c2:'Susan Collins',c2Pct:'44',notes:'Earpolling listing · Jackson +4'});
      add({date:'2026-09-09',state:'NC',pollster:'Elon University',sample:'',c1:'Roy Cooper',c1Pct:'49',c2:'Michael Whatley',c2Pct:'38',notes:'Earpolling listing · Cooper +11'});
      return changed;
    }catch(e){return false;}
  }

  function archiveRow(ab,state,pollster,a,av,b,bv){
    const d=document.createElement('div');
    d.className='jp-row'; d.dataset.sep10Poll='1'; d.dataset.state=ab; d.title=state+' Senate';
    d.innerHTML='<div class="jp-date">Sep 9</div><div class="jp-state"></div><div class="jp-pollster"></div><div class="jp-match"><strong></strong> '+av+'% &nbsp;·&nbsp; <strong></strong> '+bv+'%</div>';
    d.querySelector('.jp-state').textContent=ab;
    d.querySelector('.jp-pollster').textContent=pollster;
    const names=d.querySelectorAll('.jp-match strong'); names[0].textContent=a; names[1].textContent=b;
    return d;
  }

  function ensureArchiveRows(){
    const sec=document.getElementById('julsepPollArchive'); if(!sec) return;
    const list=sec.querySelector('.jp-list'); if(!list) return;
    sec.querySelectorAll('[data-sep10-poll]').forEach(el=>el.remove());
    const filter=sec.querySelector('select')?.value||'ALL';
    if(filter==='ALL'||filter==='NC') list.prepend(archiveRow('NC','North Carolina','Elon University','Roy Cooper',49,'Michael Whatley',38));
    if(filter==='ALL'||filter==='ME') list.prepend(archiveRow('ME','Maine','YouGov','Troy Jackson',48,'Susan Collins',44));
    if(filter==='ALL'||filter==='TX') list.prepend(archiveRow('TX','Texas','Fabrizio/Anzalone','James Talarico',48,'Ken Paxton',44));
    const sub=sec.querySelector('.jp-sub');
    if(sub) sub.textContent='96 public general-election matchup polls and snapshots from July 7 through September 9, including alternate matchups that were publicly tested during the period.';
    const count=sec.querySelector('.jp-count');
    if(count){const total=list.querySelectorAll('.jp-row').length;count.textContent=`${total} poll${total===1?'':'s'} shown`;}
  }

  function fixCountsAndDates(){
    const home=document.getElementById('page-home');
    if(home){
      for(const el of home.querySelectorAll('*')){
        if(el.children.length) continue;
        const t=norm(el.textContent);
        const parent=norm(el.parentElement?.textContent).toLowerCase();
        if(/^(?:13|88|90|92|93)$/.test(t)&&/poll/.test(parent)) el.textContent='96';
        if((/Sep\.? 9, 2026/i.test(t)||t==='2026-09-09')&&/latest|update/.test(parent)) el.textContent='Sep 10, 2026';
      }
    }
    const about=document.getElementById('page-about');
    if(about){
      for(const el of about.querySelectorAll('*')){
        if(el.children.length) continue;
        const t=norm(el.textContent);
        if(/\b93\s+polls?\b/i.test(t)) el.textContent=t.replace(/\b93(?=\s+polls?\b)/i,'96');
        else if(t==='93'&&/poll/i.test(norm(el.parentElement?.textContent))) el.textContent='96';
      }
    }
  }

  function apply(renderIfAdded=false){
    wrapSenateRenderer();
    enforceAverages();
    const added=ensureNativePolls();
    if(added&&renderIfAdded&&typeof window.renderPolls==='function'){
      try{window.renderPolls();}catch(e){}
    }
    ensureArchiveRows();
    fixCountsAndDates();
  }

  function initial(){
    apply(true);
    if(typeof window.renderSenate==='function'){
      try{window.renderSenate();}catch(e){}
    }
  }

  initial();
  [120,500,1200,2400].forEach(ms=>setTimeout(()=>apply(true),ms));
  setInterval(()=>apply(false),1600);
  new MutationObserver(()=>{clearTimeout(window.__sep10PollTimer);window.__sep10PollTimer=setTimeout(()=>apply(false),55);}).observe(document.body,{childList:true,subtree:true,characterData:true});
  document.addEventListener('change',e=>{if(e.target?.closest?.('#julsepPollArchive'))setTimeout(()=>apply(false),30);},true);
  window.addEventListener('pageshow',()=>apply(true));
})();

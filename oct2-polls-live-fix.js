(()=>{
  'use strict';

  const OCT2=[
    {date:'2026-10-02',state:'TX',pollster:'NY Times/Siena',c1:'James Talarico',c1Pct:'51',c2:'Ken Paxton',c2Pct:'45',notes:'Talarico +6'},
    {date:'2026-10-02',state:'IA',pollster:'NY Times/Siena',c1:'Ashley Hinson',c1Pct:'48',c2:'Josh Turek',c2Pct:'47',notes:'Hinson +1'},
    {date:'2026-10-02',state:'AK',pollster:'NY Times/Siena',c1:'Mary Peltola',c1Pct:'50',c2:'Dan Sullivan',c2Pct:'43',notes:'Peltola +7'},
    {date:'2026-10-02',state:'OH',pollster:'NY Times/Siena',c1:'Sherrod Brown',c1Pct:'49',c2:'Jon Husted',c2Pct:'46',notes:'Brown +3'},
    {date:'2026-10-02',state:'KS',pollster:'NY Times/Siena',c1:'Roger Marshall',c1Pct:'47',c2:'Adam Hamilton',c2Pct:'46',notes:'Marshall +1'}
  ];

  // The October 7 polls supersede the old pinned Texas and Ohio averages.
  // Keep the Kansas-only legacy override until an updated Kansas poll is supplied.
  const FINAL_AVG={
    KS:{'Roger Marshall':'44.6','Adam Hamilton':'45.0'}
  };

  const norm=v=>String(v||'').toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  const same=(a,b)=>{
    const x=norm(a),y=norm(b);
    if(!x||!y)return false;
    if(x===y)return true;
    const xa=x.split(' '),ya=y.split(' ');
    return xa.length>1&&ya.length>1&&xa.at(-1)===ya.at(-1)&&xa[0][0]===ya[0][0];
  };

  let senateRendering=false;

  function nativePollArray(){
    try{if(typeof polls!=='undefined'&&Array.isArray(polls))return polls;}catch(e){}
    try{if(Array.isArray(window.polls))return window.polls;}catch(e){}
    return null;
  }

  function ensureNewPolls(){
    let changed=false;
    const arr=nativePollArray();
    if(arr){
      for(const p of OCT2){
        const exists=arr.some(x=>x&&x.date===p.date&&x.state===p.state&&norm(x.pollster)===norm(p.pollster)&&same(x.c1,p.c1)&&same(x.c2,p.c2));
        if(!exists){arr.push({...p,sample:''});changed=true;}
      }
      if(changed){
        try{if(typeof renderPolls==='function')renderPolls();else if(typeof window.renderPolls==='function')window.renderPolls();}catch(e){}
      }
    }

    try{
      const archive=window.__SENATE_POLL_ARCHIVE__;
      if(Array.isArray(archive)){
        for(const p of OCT2){
          const row=[p.date,p.state,
            ({TX:'Texas',IA:'Iowa',AK:'Alaska',OH:'Ohio',KS:'Kansas'})[p.state],
            p.pollster,p.c1,Number(p.c1Pct),p.c2,Number(p.c2Pct),p.notes];
          const exists=archive.some(r=>Array.isArray(r)&&r[0]===row[0]&&r[1]===row[1]&&norm(r[3])===norm(row[3])&&same(r[4],row[4])&&same(r[6],row[6]));
          if(!exists)archive.unshift(row);
        }
      }
    }catch(e){}
  }

  function enforceAverages(){
    try{
      if(typeof stateData==='undefined'||!stateData)return;
      let changed=false;
      for(const [ab,vals] of Object.entries(FINAL_AVG)){
        const s=stateData[ab];
        if(!s)continue;
        for(const [name,value] of Object.entries(vals)){
          for(const slot of [1,2]){
            if(!same(s['candidate'+slot],name))continue;
            const key='candidate'+slot+'Poll';
            if(String(s[key]??'')!==value){s[key]=value;changed=true;}
          }
        }
        if(s.updated!=='2026-10-02'){s.updated='2026-10-02';changed=true;}
      }
      if(changed&&typeof renderSenate==='function'&&!senateRendering){
        senateRendering=true;
        try{renderSenate();}catch(e){}finally{senateRendering=false;}
      }
    }catch(e){}
  }

  function apply(){
    ensureNewPolls();
    enforceAverages();
  }

  apply();
  [50,150,350,800,1500,3000,5000].forEach(ms=>setTimeout(apply,ms));
  document.addEventListener('click',()=>{setTimeout(apply,0);setTimeout(apply,120);setTimeout(apply,500);},true);
  window.addEventListener('pageshow',apply);
  window.addEventListener('focus',apply);
})();
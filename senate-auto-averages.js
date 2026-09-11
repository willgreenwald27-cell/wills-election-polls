(()=>{
  const norm=v=>String(v||'').toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  const same=(a,b)=>{
    const x=norm(a),y=norm(b);
    if(!x||!y) return false;
    if(x===y) return true;
    const xa=x.split(' '),ya=y.split(' ');
    return xa.length>1&&ya.length>1&&xa.at(-1)===ya.at(-1)&&xa[0][0]===ya[0][0];
  };
  const NEW_POLLS=[
    ['2026-09-10','IA','Iowa','YouGov','Ashley Hinson',43,'Josh Turek',45,'User-provided poll'],
    ['2026-09-10','MN','Minnesota','Quantus Insights','Peggy Flanagan',48,'Michele Tafoya',44,'User-provided poll'],
    ['2026-09-10','FL','Florida Special Election','Quantus Insights','Ashley Moody',50,'Jasmine Nixon',43,'User-provided poll']
  ];
  let rendering=false;

  function pairRows(s,rows){
    const a=s?.candidate1,b=s?.candidate2;
    if(!a||!b) return [];
    return rows.filter(r=>{
      if(!Array.isArray(r)||r.length<8) return false;
      const p1=r[4],p2=r[6];
      return (same(p1,a)&&same(p2,b))||(same(p1,b)&&same(p2,a));
    });
  }

  function candidateValue(row,name){
    if(same(row[4],name)) return Number(row[5]);
    if(same(row[6],name)) return Number(row[7]);
    return NaN;
  }

  function ensureNewPolls(){
    let nativeChanged=false;
    try{
      const rows=window.__SENATE_POLL_ARCHIVE__;
      if(Array.isArray(rows)){
        for(const row of NEW_POLLS){
          const exists=rows.some(r=>Array.isArray(r)&&r[0]===row[0]&&r[1]===row[1]&&norm(r[3])===norm(row[3])&&same(r[4],row[4])&&same(r[6],row[6]));
          if(!exists) rows.unshift(row.slice());
        }
      }
    }catch(e){}
    try{
      if(Array.isArray(window.polls)){
        for(const row of NEW_POLLS){
          const obj={date:row[0],state:row[1],pollster:row[3],sample:'',c1:row[4],c1Pct:String(row[5]),c2:row[6],c2Pct:String(row[7]),notes:row[1]==='IA'?'Turek +2':row[1]==='MN'?'Flanagan +4':'Moody +7'};
          const exists=window.polls.some(p=>p&&p.state===obj.state&&p.date===obj.date&&norm(p.pollster)===norm(obj.pollster)&&same(p.c1,obj.c1)&&same(p.c2,obj.c2));
          if(!exists){window.polls.push(obj);nativeChanged=true;}
        }
      }
      if(nativeChanged&&typeof window.renderPolls==='function'){
        try{window.renderPolls();}catch(e){}
      }
    }catch(e){}
  }

  function apply(){
    try{
      ensureNewPolls();
      const rows=window.__SENATE_POLL_ARCHIVE__;
      if(!Array.isArray(rows)||typeof stateData==='undefined'||!stateData) return;
      let changed=false;
      for(const [ab,s] of Object.entries(stateData)){
        if(!s||!s.active||!s.candidate1||!s.candidate2) continue;
        const matches=pairRows(s,rows);
        if(!matches.length) continue;
        for(const slot of [1,2]){
          const name=s['candidate'+slot];
          const vals=matches.map(r=>candidateValue(r,name)).filter(Number.isFinite);
          if(!vals.length) continue;
          const avg=(vals.reduce((x,y)=>x+y,0)/vals.length).toFixed(1);
          const key='candidate'+slot+'Poll';
          if(String(s[key])!==avg){s[key]=avg;changed=true;}
        }
        if(s.updated!=='2026-09-11'){s.updated='2026-09-11';changed=true;}
      }
      if(changed&&typeof renderSenate==='function'&&!rendering){
        rendering=true;
        try{renderSenate();}finally{rendering=false;}
      }
    }catch(e){console.warn('Senate auto averages unavailable',e);}
  }

  apply();
  [100,350,900,1800,3200].forEach(ms=>setTimeout(apply,ms));
  window.addEventListener('pageshow',apply);
})();

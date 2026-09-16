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
    ['2026-09-14','MN','Minnesota','co/efficient*','Peggy Flanagan',43,'Michele Tafoya',42,'Flanagan +1'],
    ['2026-09-14','TX','Texas','Telemundo/Mason-Dixon*','James Talarico',46,'Ken Paxton',43,'Talarico +3'],
    ['2026-09-14','IA','Iowa','Cygnal**','Ashley Hinson',43,'Josh Turek',43,'Tie'],
    ['2026-09-14','SC','South Carolina','Rasmussen Reports','Graham Nordone',48,'Annie Andrews',43,'Graham Nordone +5'],
    ['2026-09-14','GA','Georgia','Rasmussen Reports','Jon Ossoff',51,'Mike Collins',42,'Ossoff +9'],
    ['2026-09-14','NH','New Hampshire','co/efficient','Chris Pappas',46,'John Sununu',46,'Tie'],
    ['2026-09-14','AK','Alaska','Rasmussen Reports','Dan Sullivan',39,'Mary Peltola',39,'RCV 1st round · Sullivan 39, Peltola 39 · J. Sullivan 7 · Heikes 6'],
    ['2026-09-12','NC','North Carolina','Trafalgar Group*','Roy Cooper',48,'Michael Whatley',42,'Cooper +6'],
    ['2026-09-12','GA','Georgia','Trafalgar Group*','Jon Ossoff',49,'Mike Collins',43,'Ossoff +6'],
    ['2026-09-10','IA','Iowa','YouGov','Ashley Hinson',43,'Josh Turek',45,'Turek +2'],
    ['2026-09-10','MN','Minnesota','Quantus Insights','Peggy Flanagan',48,'Michele Tafoya',44,'Flanagan +4'],
    ['2026-09-10','FL','Florida Special Election','Quantus Insights','Ashley Moody',50,'Jasmine Nixon',43,'Moody +7']
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
          const obj={date:row[0],state:row[1],pollster:row[3],sample:'',c1:row[4],c1Pct:String(row[5]),c2:row[6],c2Pct:String(row[7]),notes:row[8]||'User-provided poll'};
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
        const latest=matches.map(r=>r[0]).filter(Boolean).sort().at(-1);
        if(latest&&s.updated!==latest){s.updated=latest;changed=true;}
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

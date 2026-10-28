(()=>{
  const norm=v=>String(v||'').toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  const same=(a,b)=>{
    const x=norm(a),y=norm(b);
    if(!x||!y) return false;
    if(x===y) return true;
    const xa=x.split(' '),ya=y.split(' ');
    // Historical Florida poll entries use both "Angie Nixon" and "Jasmine Nixon".
    // Both represent the same Nixon matchup in this site's archive.
    if(xa.at(-1)==='nixon'&&ya.at(-1)==='nixon')return true;
    return xa.length>1&&ya.length>1&&xa.at(-1)===ya.at(-1)&&xa[0][0]===ya[0][0];
  };
  const NEW_POLLS=[
    // RealClearPolling Senate listings supplied October 27 (polls dated October 26).
    ['2026-10-26','ME','Maine','Marist','Troy Jackson',49,'Susan Collins',47,'Jackson +2'],
    ['2026-10-26','TX','Texas','Univision/YouGov','James Talarico',50,'Ken Paxton',45,'Talarico +5'],
    ['2026-10-26','MI','Michigan','Detroit News/Glengariff','Abdul El-Sayed',51,'Mike Rogers',45,'El-Sayed +6'],
    // RealClearPolling Senate listings supplied October 26 (poll dates October 23–25).
    ['2026-10-25','NH','New Hampshire','Rasmussen Reports*','Chris Pappas',50,'John Sununu',44,'Pappas +6'],
    ['2026-10-25','NC','North Carolina','Quantus Insights','Roy Cooper',51,'Michael Whatley',43,'Cooper +8'],
    ['2026-10-25','MI','Michigan','Michigan State/YouGov','Abdul El-Sayed',48,'Mike Rogers',46,'El-Sayed +2'],
    ['2026-10-25','SD','South Dakota','SDNW/Mason-Dixon','Mike Rounds',56,'Brian Bengs',37,'Rounds +19'],
    ['2026-10-24','ME','Maine','Trafalgar Group','Troy Jackson',47,'Susan Collins',47,'Tie'],
    ['2026-10-23','TX','Texas','Rasmussen Reports*','James Talarico',45,'Ken Paxton',45,'Tie'],
    // RealClearPolling listings supplied on October 23, 2026 (polls dated October 22).
    ['2026-10-22','ME','Maine','FOX News','Troy Jackson',49,'Susan Collins',49,'Tie'],
    ['2026-10-22','IA','Iowa','InsiderAdvantage','Ashley Hinson',47,'Josh Turek',45,'Hinson +2'],
    ['2026-10-22','MI','Michigan','InsiderAdvantage','Abdul El-Sayed',47,'Mike Rogers',46,'El-Sayed +1'],
    ['2026-10-22','OH','Ohio Special Election','InsiderAdvantage','Sherrod Brown',47,'Jon Husted',44,'Brown +3'],
    ['2026-10-22','TX','Texas','TPOR**','James Talarico',51,'Ken Paxton',47,'Talarico +4'],
    ['2026-10-22','MN','Minnesota','Rasmussen Reports','Peggy Flanagan',48,'Michele Tafoya',45,'Flanagan +3'],
    // RealClearPolling listings supplied on October 20, 2026 (poll dates Oct 17–19).
    ['2026-10-19','OH','Ohio Special Election','Marist','Sherrod Brown',48,'Jon Husted',44,'Brown +4'],
    ['2026-10-19','MT','Montana','Quantus Insights','Kurt Alme',44,'Seth Bodnar',28,'Four-way poll · Alme +16 · Bankhead 21 · Austin 2'],
    ['2026-10-19','NC','North Carolina','Elon University*','Roy Cooper',52,'Michael Whatley',39,'Cooper +13'],
    ['2026-10-19','MA','Massachusetts','Boston Globe/Suffolk*','Ed Markey',60,'John Deaton',32,'Markey +28'],
    ['2026-10-19','AL','Alabama','The Alabama Poll','Moore',56,'Wess',35,'Moore +21 · candidate surnames as displayed by RCP'],
    ['2026-10-19','RI','Rhode Island','Pell Center/Embold','Jack Reed',55,'Allen McKay',32,'Reed +23'],
    ['2026-10-18','TX','Texas','University of Houston*','James Talarico',48,'Ken Paxton',46,'Talarico +2'],
    ['2026-10-18','FL','Florida Special Election','Univision/YouGov','Ashley Moody',51,'Angie Nixon',42,'Moody +9'],
    ['2026-10-18','OH','Ohio Special Election','Rasmussen Reports*','Jon Husted',49,'Sherrod Brown',47,'Husted +2'],
    ['2026-10-18','GA','Georgia','Quantus Insights','Jon Ossoff',52,'Mike Collins',45,'Ossoff +7'],
    ['2026-10-18','IA','Iowa','co/efficient','Ashley Hinson',49,'Josh Turek',46,'Hinson +3'],
    ['2026-10-18','AK','Alaska','Rasmussen Reports','Mary Peltola',44,'Dan Sullivan',42,'RCV 1st round · Peltola +2 · Heikes 4 · J. Sullivan 3'],
    ['2026-10-18','MA','Massachusetts','WCVB-TV/Amherst*','Ed Markey',56,'John Deaton',29,'Markey +27'],
    ['2026-10-17','TX','Texas','CBS News','James Talarico',51,'Ken Paxton',49,'Talarico +2'],
    ['2026-10-17','SC','South Carolina','Trafalgar Group*','Graham Nordone',49,'Annie Andrews',46,'Graham Nordone +3'],
    ['2026-10-15','OH','Ohio Special Election','Bowling Green/YouGov*','Sherrod Brown',48,'Jon Husted',42,'Brown +6'],
    ['2026-10-15','MI','Michigan','Rasmussen Reports*','Abdul El-Sayed',46,'Mike Rogers',44,'El-Sayed +2'],
    ['2026-10-15','AR','Arkansas','Talk Business/Hendrix College','Tom Cotton',50,'Lewis Shoffner',41,'Cotton +9 · Wadlin 5'],
    ['2026-10-14','IA','Iowa','Marist','Josh Turek',48,'Ashley Hinson',45,'Turek +3'],
    ['2026-10-14','MN','Minnesota','KSTP/SurveyUSA*','Peggy Flanagan',45,'Michele Tafoya',42,'Flanagan +3'],
    ['2026-10-14','TX','Texas','InsiderAdvantage*','Ken Paxton',49,'James Talarico',48,'Paxton +1'],
    ['2026-10-14','ME','Maine','InsiderAdvantage','Troy Jackson',49,'Susan Collins',47,'Jackson +2'],
    ['2026-10-14','KS','Kansas','InsiderAdvantage','Roger Marshall',48,'Adam Hamilton',47,'Marshall +1'],
    ['2026-10-13','TX','Texas','Marist','James Talarico',47,'Ken Paxton',45,'Talarico +2'],
    ['2026-10-13','TX','Texas','University of Texas*','James Talarico',50,'Ken Paxton',47,'Talarico +3'],
    ['2026-10-13','ME','Maine','Suffolk University','Troy Jackson',49,'Susan Collins',47,'Jackson +2'],
    ['2026-10-13','IA','Iowa','YouGov','Josh Turek',47,'Ashley Hinson',46,'Turek +1'],
    ['2026-10-13','RI','Rhode Island','WPRI/Emerson*','Jack Reed',59,'Allen McKay',25,'Reed +34'],
    ['2026-10-12','TX','Texas','ReconMR/Siena','James Talarico',48,'Ken Paxton',44,'Talarico +4'],
    ['2026-10-12','TX','Texas','Quantus Insights*','James Talarico',47,'Ken Paxton',47,'Tie'],
    ['2026-10-12','NC','North Carolina','WRAL-TV/SurveyUSA','Roy Cooper',54,'Michael Whatley',40,'Cooper +14'],
    ['2026-10-12','NC','North Carolina','Carolina Forward/Change Res.*','Roy Cooper',50,'Michael Whatley',40,'Cooper +10'],
    ['2026-10-12','FL','Florida Special Election','Stetson University**','Ashley Moody',52,'Angie Nixon',41,'Moody +11'],
    ['2026-10-10','ME','Maine','Rasmussen Reports','Troy Jackson',49,'Susan Collins',47,'Jackson +2'],
    ['2026-10-10','SC','South Carolina','Rasmussen Reports','Lindsey Graham',49,'Annie Andrews',45,'Graham +4 · source displays Graham Nordone'],
    ['2026-10-10','MI','Michigan','InsiderAdvantage','Abdul El-Sayed',48,'Mike Rogers',46,'El-Sayed +2'],
    ['2026-10-10','AK','Alaska','InsiderAdvantage','Mary Peltola',50,'Dan Sullivan',48,'Peltola +2'],
    ['2026-10-09','TX','Texas','Trafalgar Group*','James Talarico',47,'Ken Paxton',44,'Talarico +3 · source screenshot partly cropped'],
    ['2026-10-08','ME','Maine','Washington Post','Troy Jackson',50,'Susan Collins',46,'Jackson +4'],
    ['2026-10-08','IA','Iowa','Emerson*','Ashley Hinson',47,'Josh Turek',45,'Hinson +2'],
    ['2026-10-08','MN','Minnesota','Rasmussen Reports','Peggy Flanagan',48,'Michele Tafoya',45,'Flanagan +3'],
    ['2026-10-08','MN','Minnesota','Daily Agenda/Morning Consult','Peggy Flanagan',45,'Michele Tafoya',41,'Flanagan +4'],
    ['2026-10-07','IA','Iowa','CNN','Ashley Hinson',45,'Josh Turek',43,'Hinson +2'],
    ['2026-10-07','OH','Ohio Special Election','CNN','Sherrod Brown',49,'Jon Husted',43,'Brown +6'],
    ['2026-10-07','OH','Ohio Special Election','co/efficient','Sherrod Brown',45,'Jon Husted',46,'Husted +1'],
    ['2026-10-07','TX','Texas','UMass Lowell*','James Talarico',45,'Ken Paxton',45,'Tie'],
    ['2026-10-07','FL','Florida Special Election','St. Pete Polls','Ashley Moody',47,'Angie Nixon',45,'Moody +2'],
    ['2026-10-07','NC','North Carolina','East Carolina U.*','Roy Cooper',50,'Michael Whatley',43,'Cooper +7'],
    ['2026-10-06','MI','Michigan','Quantus Insights','Abdul El-Sayed',48,'Mike Rogers',47,'El-Sayed +1'],
    ['2026-10-06','IA','Iowa','Suffolk University*','Josh Turek',48,'Ashley Hinson',44,'Turek +4'],
    ['2026-10-06','FL','Florida Special Election','NBC 6/Mason-Dixon','Ashley Moody',50,'Angie Nixon',40,'Moody +10'],
    ['2026-10-06','AK','Alaska','Alaska Survey Research**','Mary Peltola',51,'Dan Sullivan',49,'Peltola +2'],
    ['2026-10-06','AK','Alaska','Alaska Survey Research** (RCV 1st Round)','Mary Peltola',47,'Dan Sullivan',45,'RCV 1st round · Peltola +2 · J. Sullivan 5 · Heikes 3'],
    ['2026-10-05','MI','Michigan','YouGov','Abdul El-Sayed',49,'Mike Rogers',48,'El-Sayed +1'],
    ['2026-10-05','ME','Maine','Marist','Troy Jackson',51,'Susan Collins',47,'Jackson +4'],
    ['2026-10-05','TX','Texas','YouGov','James Talarico',50,'Ken Paxton',44,'Talarico +6'],
    ['2026-10-05','OH','Ohio','YouGov','Sherrod Brown',49,'Jon Husted',45,'Brown +4'],
    ['2026-10-05','KS','Kansas','YouGov','Adam Hamilton',48,'Roger Marshall',45,'Hamilton +3'],
    ['2026-10-05','NH','New Hampshire','St. Anselm','Chris Pappas',51,'John Sununu',44,'Pappas +7'],
    ['2026-10-05','NH','New Hampshire','YouGov','Chris Pappas',51,'John Sununu',43,'Pappas +8'],
    ['2026-10-05','NE','Nebraska','YouGov','Dan Osborn',48,'Pete Ricketts',47,'Osborn +1'],
    ['2026-10-05','FL','Florida Special Election','YouGov','Ashley Moody',49,'Angie Nixon',44,'Moody +5'],
    ['2026-10-05','NM','New Mexico','KOB-TV/SurveyUSA','Ben Ray Luján',54,'Larry Marker',36,'Luján +18'],
    ['2026-10-04','ME','Maine','MPRC','Troy Jackson',49,'Susan Collins',47,'Jackson +2'],
    ['2026-10-04','NH','New Hampshire','Rasmussen Reports*','Chris Pappas',49,'John Sununu',44,'Pappas +5'],
    ['2026-10-04','MI','Michigan','Mitchell Research','Abdul El-Sayed',46,'Mike Rogers',41,'El-Sayed +5'],
    ['2026-10-02','TX','Texas','NY Times/Siena','James Talarico',51,'Ken Paxton',45,'Talarico +6'],
    ['2026-10-02','IA','Iowa','NY Times/Siena','Ashley Hinson',48,'Josh Turek',47,'Hinson +1'],
    ['2026-10-02','AK','Alaska','NY Times/Siena','Mary Peltola',50,'Dan Sullivan',43,'Peltola +7'],
    ['2026-10-02','OH','Ohio','NY Times/Siena','Sherrod Brown',49,'Jon Husted',46,'Brown +3'],
    ['2026-10-02','KS','Kansas','NY Times/Siena','Roger Marshall',47,'Adam Hamilton',46,'Marshall +1'],
    ['2026-10-01','ME','Maine','CBS News','Troy Jackson',50,'Susan Collins',50,'Tie'],
    ['2026-10-01','ME','Maine','Trafalgar Group','Troy Jackson',46,'Susan Collins',46,'Tie'],
    ['2026-10-01','KS','Kansas','Trafalgar Group*','Roger Marshall',44,'Adam Hamilton',44,'Tie'],
    ['2026-10-01','NE','Nebraska','co/efficient','Pete Ricketts',48,'Dan Osborn',43,'Ricketts +5'],
    ['2026-10-01','TX','Texas','FOX News','James Talarico',51,'Ken Paxton',49,'Talarico +2'],
    ['2026-10-01','IA','Iowa','FOX News','Ashley Hinson',47,'Josh Turek',49,'Turek +2'],
    ['2026-10-01','MI','Michigan','Trafalgar Group*','Abdul El-Sayed',47,'Mike Rogers',45,'El-Sayed +2'],
    ['2026-10-01','SC','South Carolina','InsiderAdvantage*','Graham Nordone',46,'Annie Andrews',45,'Graham Nordone +1'],
    ['2026-10-01','MN','Minnesota','Big Data Poll*','Peggy Flanagan',46,'Michele Tafoya',44,'Flanagan +2'],
    ['2026-10-01','AK','Alaska','Quantus Insights','Mary Peltola',47,'Dan Sullivan',48,'Sullivan +1'],
    ['2026-10-01','AK','Alaska','Quantus Insights (RCV 1st Round)','Dan Sullivan',46,'Mary Peltola',46,'RCV 1st round · Tie · J. Sullivan 2 · Heikes 1'],
    ['2026-09-30','ME','Maine','Fabrizio/Anzalone','Troy Jackson',50,'Susan Collins',47,'Jackson +3'],
    ['2026-09-30','OH','Ohio','InsiderAdvantage*','Sherrod Brown',44,'Jon Husted',43,'Brown +1'],
    ['2026-09-30','TX','Texas','Rasmussen Reports*','James Talarico',46,'Ken Paxton',45,'Talarico +1'],
    ['2026-09-29','MI','Michigan','FOX News','Abdul El-Sayed',50,'Mike Rogers',49,'El-Sayed +1'],
    ['2026-09-29','IA','Iowa','Quantus Insights','Ashley Hinson',47,'Josh Turek',46,'Hinson +1'],
    ['2026-09-29','MI','Michigan','Marist','Abdul El-Sayed',51,'Mike Rogers',44,'El-Sayed +7'],
    ['2026-09-29','OH','Ohio','USA Today/Suffolk*','Sherrod Brown',47,'Jon Husted',44,'Brown +3'],
    ['2026-09-28','MN','Minnesota','InsiderAdvantage*','Peggy Flanagan',46,'Michele Tafoya',45,'Flanagan +1'],
    ['2026-09-28','MI','Michigan','Cygnal/Beacon Research','Abdul El-Sayed',45,'Mike Rogers',40,'El-Sayed +5'],
    ['2026-09-28','NC','North Carolina','Fabrizio/Anzalone','Roy Cooper',53,'Michael Whatley',42,'Cooper +11'],
    ['2026-09-28','OH','Ohio','Big Data Poll','Sherrod Brown',46,'Jon Husted',43,'Brown +3'],
    ['2026-09-28','OH','Ohio','Marist','Sherrod Brown',51,'Jon Husted',43,'Brown +8'],
    ['2026-09-26','NH','New Hampshire','Trafalgar Group*','Chris Pappas',47,'John Sununu',41,'Pappas +6'],
    ['2026-09-26','TX','Texas','Big Data Poll','James Talarico',47,'Ken Paxton',45,'Talarico +2'],
    ['2026-09-25','ME','Maine','InsiderAdvantage','Troy Jackson',46,'Susan Collins',46,'Tie'],
    ['2026-09-25','IA','Iowa','InsiderAdvantage*','Ashley Hinson',46,'Josh Turek',47,'Turek +1'],
    ['2026-09-25','SC','South Carolina','Trafalgar Group','Graham Nordone',43,'Annie Andrews',42,'Graham Nordone +1'],
    ['2026-09-24','TX','Texas','TPOR**','James Talarico',49,'Ken Paxton',44,'Talarico +5'],
    ['2026-09-24','GA','Georgia','InsiderAdvantage','Jon Ossoff',50,'Mike Collins',42,'Ossoff +8'],
    ['2026-09-24','MI','Michigan','Big Data Poll','Abdul El-Sayed',47,'Mike Rogers',42,'El-Sayed +5'],
    ['2026-09-24','AK','Alaska','Trafalgar Group','Dan Sullivan',47,'Mary Peltola',46,'RCV 1st round · Sullivan +1 · J. Sullivan 3 · Heikes 1'],
    ['2026-09-23','ME','Maine','NY Times/Siena','Troy Jackson',46,'Susan Collins',49,'Collins +3'],
    ['2026-09-23','ME','Maine','UNH','Troy Jackson',51,'Susan Collins',47,'Jackson +4'],
    ['2026-09-23','MI','Michigan','NY Times/Siena','Abdul El-Sayed',49,'Mike Rogers',44,'El-Sayed +5'],
    ['2026-09-23','MI','Michigan','Rasmussen Reports*','Abdul El-Sayed',47,'Mike Rogers',44,'El-Sayed +3'],
    ['2026-09-23','NH','New Hampshire','NY Times/Siena','Chris Pappas',50,'John Sununu',45,'Pappas +5'],
    ['2026-09-23','NH','New Hampshire','UNH','Chris Pappas',50,'John Sununu',42,'Pappas +8'],
    ['2026-09-23','OH','Ohio','Quantus Insights','Sherrod Brown',48,'Jon Husted',47,'Brown +1'],
    ['2026-09-23','NC','North Carolina','High Point University','Roy Cooper',50,'Michael Whatley',42,'Cooper +8'],
    ['2026-09-23','NC','North Carolina','Rasmussen Reports*','Roy Cooper',48,'Michael Whatley',41,'Cooper +7'],
    ['2026-09-23','FL','Florida Special Election','Stetson University**','Ashley Moody',51,'Jasmine Nixon',40,'Moody +11'],
    ['2026-09-23','GA','Georgia','Big Data Poll','Jon Ossoff',55,'Mike Collins',45,'Ossoff +10'],
    ['2026-09-23','RI','Rhode Island','UNH*','Jack Reed',53,'Allen McKay',33,'Reed +20'],
    ['2026-09-22','TX','Texas','Marist','James Talarico',50,'Ken Paxton',44,'Talarico +6'],
    ['2026-09-22','NC','North Carolina','Quantus Insights','Roy Cooper',48,'Michael Whatley',43,'Cooper +5'],
    ['2026-09-22','NC','North Carolina','YouGov','Roy Cooper',53,'Michael Whatley',41,'Cooper +12'],
    ['2026-09-22','GA','Georgia','YouGov','Jon Ossoff',52,'Mike Collins',42,'Ossoff +10'],
    ['2026-09-20','FL','Florida Special Election','InsiderAdvantage','Ashley Moody',49,'Jasmine Nixon',42,'Moody +7'],
    ['2026-09-21','IA','Iowa','Marist','Ashley Hinson',42,'Josh Turek',50,'Turek +8'],
    ['2026-09-21','MI','Michigan','Suffolk University*','Abdul El-Sayed',47,'Mike Rogers',40,'El-Sayed +7'],
    ['2026-09-21','TX','Texas','TSU/YouGov*','James Talarico',47,'Ken Paxton',46,'Talarico +1'],
    ['2026-09-17','MT','Montana','Quantus Insights','Kurt Alme',44,'Seth Bodnar',24,'Alme +20 · Bankhead 23 · Austin —'],
    ['2026-09-17','KS','Kansas','Emerson*','Roger Marshall',43,'Adam Hamilton',45,'Hamilton +2'],
    ['2026-09-17','MI','Michigan','InsiderAdvantage*','Abdul El-Sayed',47,'Mike Rogers',45,'El-Sayed +2'],
    ['2026-09-17','NH','New Hampshire','InsiderAdvantage','Chris Pappas',48,'John Sununu',40,'Pappas +8'],
    ['2026-09-17','NC','North Carolina','InsiderAdvantage*','Roy Cooper',48,'Michael Whatley',43,'Cooper +5'],
    ['2026-09-17','NC','North Carolina','Quantus Insights','Roy Cooper',49,'Michael Whatley',45,'Cooper +4'],
    ['2026-09-16','TX','Texas','Emerson*','James Talarico',47,'Ken Paxton',46,'Talarico +1'],
    ['2026-09-16','TX','Texas','Texas A&M/Siena','James Talarico',49,'Ken Paxton',43,'Talarico +6'],
    ['2026-09-16','MI','Michigan','Emerson','Abdul El-Sayed',48,'Mike Rogers',46,'El-Sayed +2'],
    ['2026-09-16','MI','Michigan','Washington Post','Abdul El-Sayed',48,'Mike Rogers',45,'El-Sayed +3'],
    ['2026-09-16','AK','Alaska','Fabrizio/Anzalone','Mary Peltola',46,'Dan Sullivan',41,'RCV 1st round · Peltola 46 · Sullivan 41 · J. Sullivan 4 · Heikes 3'],
    ['2026-09-15','ME','Maine','Quantus Insights','Troy Jackson',46,'Susan Collins',47,'Collins +1'],
    ['2026-09-15','MN','Minnesota','KSTP/SurveyUSA*','Peggy Flanagan',42,'Michele Tafoya',42,'Tie'],
    ['2026-09-15','OH','Ohio','Bowling Green/YouGov*','Sherrod Brown',48,'Jon Husted',45,'Brown +3'],
    ['2026-09-15','IA','Iowa','co/efficient','Ashley Hinson',48,'Josh Turek',43,'Hinson +5'],
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
    ['2026-09-10','FL','Florida Special Election','Quantus Insights','Ashley Moody',50,'Jasmine Nixon',43,'Moody +7'],
    ['2026-08-07','ID','Idaho','The Bullfinch Group','Jim Risch',34,'Todd Achilles',30,'Risch +4 · 608 likely voters · Aug 4–7']
  ];
  let rendering=false;

  function pairRows(s,rows){
    const a=s?.candidate1,b=s?.candidate2;
    if(!a||!b) return [];
    return rows.filter(r=>{
      if(!Array.isArray(r)||r.length<8) return false;
      const meta=norm((r[3]||'')+' '+(r[8]||''));
      if(meta.includes('rcv 1st round')||meta.includes('four-way poll')) return false;
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
      const nativePolls=(typeof polls!=='undefined'&&Array.isArray(polls))?polls:(Array.isArray(window.polls)?window.polls:null);
      if(nativePolls){
        for(const row of NEW_POLLS){
          const obj={date:row[0],state:row[1],pollster:row[3],sample:'',c1:row[4],c1Pct:String(row[5]),c2:row[6],c2Pct:String(row[7]),notes:row[8]||'User-provided poll'};
          const exists=nativePolls.some(p=>p&&p.state===obj.state&&p.date===obj.date&&norm(p.pollster)===norm(obj.pollster)&&same(p.c1,obj.c1)&&same(p.c2,obj.c2));
          if(!exists){nativePolls.push(obj);nativeChanged=true;}
        }
      }
      if(nativeChanged){
        try{
          if(typeof renderPolls==='function')renderPolls();
          else if(typeof window.renderPolls==='function')window.renderPolls();
        }catch(e){console.warn('Oct 12 native poll rendering unavailable',e);}
        try{
          if(typeof renderHomeDashboard==='function')renderHomeDashboard();
        }catch(e){}
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
        // Idaho currently uses the explicitly sourced Aug 4–7 Bullfinch survey.
        // Do not re-average older archive entries over that displayed snapshot.
        if(ab==='ID')continue;
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
  [100,350,900,1800,3200,5200,8500].forEach(ms=>setTimeout(apply,ms));
  // Keep averages current after older page-specific UI scripts rerender on navigation.
  document.addEventListener('click',e=>{
    if(e.target?.closest?.('#page-senate,#page-polls,.site-header')) setTimeout(apply,250);
  },true);
  window.addEventListener('pageshow',apply);
  window.addEventListener('focus',apply);
})();

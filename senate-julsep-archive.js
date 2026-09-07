(()=>{
  const POLLS=[
['2026-09-03','IA','Iowa','Emerson','Ashley Hinson',50,'Josh Turek',45,'RCP'],
['2026-09-03','TN','Tennessee','Beacon Center','Bill Hagerty',58,'Marquita Bradshaw',33,'RCP'],
['2026-09-02','TX','Texas','TPPF / Overton Insights','James Talarico',50,'Ken Paxton',50,'RCP'],
['2026-09-02','AK','Alaska','Alaska Survey Research','Mary Peltola',51,'Dan Sullivan',49,'RCP'],
['2026-09-01','MI','Michigan','Michigan State / YouGov','Abdul El-Sayed',50,'Mike Rogers',45,'RCP'],
['2026-09-01','NM','New Mexico','Albuquerque Journal','Ben Ray Luján',53,'Larry Marker',38,'RCP'],
['2026-08-30','NH','New Hampshire','Fabrizio, Lee & Associates','John Sununu',37,'Chris Pappas',36,'CTM'],
['2026-08-29','IA','Iowa','Wedgewood Polls','Ashley Hinson',50,'Josh Turek',48,'CTM'],
['2026-08-29','MI','Michigan','EPIC-MRA','Abdul El-Sayed',47,'Mike Rogers',43,'RCP'],
['2026-08-28','NM','New Mexico','Research & Polling Inc.','Ben Ray Luján',53,'Larry Marker',38,'CTM'],
['2026-08-28','SC','South Carolina','Abacus Data (RV)','Annie Andrews',34,'Darline Graham',34,'CTM'],
['2026-08-28','IA','Iowa','Abacus Data (RV)','Josh Turek',41,'Ashley Hinson',36,'CTM'],
['2026-08-28','ME','Maine','Abacus Data (RV)','Troy Jackson',40,'Susan Collins',40,'CTM'],
['2026-08-28','OH','Ohio','Abacus Data (RV)','Sherrod Brown',40,'Jon Husted',33,'CTM'],
['2026-08-28','MI','Michigan','Abacus Data (RV)','Abdul El-Sayed',41,'Mike Rogers',35,'CTM'],
['2026-08-28','IA','Iowa','Abacus Data (LV)','Josh Turek',48,'Ashley Hinson',41,'CTM'],
['2026-08-28','MI','Michigan','Abacus Data (LV)','Abdul El-Sayed',47,'Mike Rogers',42,'CTM'],
['2026-08-28','OH','Ohio','Abacus Data (LV)','Sherrod Brown',46,'Jon Husted',41,'CTM'],
['2026-08-28','ME','Maine','Abacus Data (LV)','Troy Jackson',50,'Susan Collins',42,'CTM'],
['2026-08-28','SC','South Carolina','Abacus Data (LV)','Darline Graham',51,'Annie Andrews',38,'CTM'],
['2026-08-27','TX','Texas','Texas Public Opinion Research','James Talarico',48,'Ken Paxton',42,'RCP'],
['2026-08-26','NH','New Hampshire','UNH','John Sununu',45,'Chris Pappas',43,'RCP'],
['2026-08-26','NH','New Hampshire','UNH','Chris Pappas',45,'Scott Brown',40,'RCP'],
['2026-08-26','IA','Iowa','Suffolk University','Ashley Hinson',45,'Josh Turek',41,'RCP'],
['2026-08-26','MA','Massachusetts','UNH','Ed Markey',49,'John Deaton',30,'RCP'],
['2026-08-26','MA','Massachusetts','UNH','Seth Moulton',38,'John Deaton',25,'RCP'],
['2026-08-26','RI','Rhode Island','UNH','Jack Reed',51,'Allen McKay',31,'RCP'],
['2026-08-26','TX','Texas','Overton Insights','Ken Paxton',50,'James Talarico',50,'CTM'],
['2026-08-26','TN','Tennessee','Targoz Market Research (RV)','Bill Hagerty',51,'Marquita Bradshaw',31,'CTM'],
['2026-08-26','TN','Tennessee','Targoz Market Research (LV)','Bill Hagerty',58,'Marquita Bradshaw',33,'CTM'],
['2026-08-25','TX','Texas','University of Texas','James Talarico',42,'Ken Paxton',39,'RCP'],
['2026-08-24','SC','South Carolina','Impact Research','Darline Graham',41,'Annie Andrews',41,'CTM'],
['2026-08-21','NC','North Carolina','High Point University','Roy Cooper',50,'Michael Whatley',45,'RCP'],
['2026-08-20','MI','Michigan','Fabrizio / Anzalone','Abdul El-Sayed',48,'Mike Rogers',47,'RCP'],
['2026-08-20','NH','New Hampshire','St. Anselm','Chris Pappas',48,'John Sununu',41,'RCP'],
['2026-08-20','NH','New Hampshire','St. Anselm','Chris Pappas',49,'Scott Brown',37,'RCP'],
['2026-08-19','MI','Michigan','Susquehanna','Abdul El-Sayed',46,'Mike Rogers',39,'RCP'],
['2026-08-18','GA','Georgia','InsiderAdvantage','Jon Ossoff',50,'Mike Collins',43,'RCP'],
['2026-08-18','MI','Michigan','TIPP Insights','Abdul El-Sayed',45,'Mike Rogers',42,'RCP'],
['2026-08-18','MN','Minnesota','KSTP / SurveyUSA','Peggy Flanagan',46,'Michele Tafoya',41,'RCP'],
['2026-08-17','AK','Alaska','Data for Progress','Mary Peltola',53,'Dan Sullivan',47,'RCP'],
['2026-08-17','MA','Massachusetts','UMass Amherst','Ed Markey',51,'John Deaton',30,'RCP'],
['2026-08-17','MA','Massachusetts','UMass Amherst','Seth Moulton',49,'John Deaton',25,'RCP'],
['2026-08-13','MI','Michigan','FOX News','Mike Rogers',51,'Abdul El-Sayed',47,'RCP'],
['2026-08-13','OH','Ohio','FOX News','Sherrod Brown',53,'Jon Husted',45,'RCP'],
['2026-08-13','TX','Texas','Emerson','Ken Paxton',47,'James Talarico',46,'RCP'],
['2026-08-13','NC','North Carolina','Carolina Journal / Harper','Roy Cooper',52,'Michael Whatley',39,'RCP'],
['2026-08-12','ME','Maine','FOX News','Troy Jackson',48,'Susan Collins',46,'RCP'],
['2026-08-12','NC','North Carolina','Elon University','Roy Cooper',53,'Michael Whatley',42,'RCP'],
['2026-08-11','AK','Alaska','Alaska Survey Research','Mary Peltola',51,'Dan Sullivan',49,'RCP'],
['2026-08-10','ME','Maine','Beacon Research / Shaw & Co.','Troy Jackson',48,'Susan Collins',46,'CTM'],
['2026-08-10','NC','North Carolina','Carolina Forward / Change Research','Roy Cooper',50,'Michael Whatley',43,'RCP'],
['2026-08-10','KS','Kansas','Public Policy Polling','Roger Marshall',46,'Adam Hamilton',45,'CTM'],
['2026-08-10','MI','Michigan','Beacon Research / Shaw & Co.','Mike Rogers',51,'Abdul El-Sayed',47,'CTM'],
['2026-08-10','OH','Ohio','Beacon Research / Shaw & Co.','Sherrod Brown',53,'Jon Husted',45,'CTM'],
['2026-08-10','MI','Michigan','TIPP Insights','Abdul El-Sayed',45.44,'Mike Rogers',42.27,'CTM'],
['2026-08-07','TX','Texas','Texas A&M / Siena','James Talarico',47,'Ken Paxton',43,'RCP'],
['2026-08-07','NC','North Carolina','Change Research','Roy Cooper',50,'Michael Whatley',41,'RCP'],
['2026-08-07','ID','Idaho','Bullfinch Group','James Risch',34,'Todd Achilles',30,'CTM'],
['2026-08-07','ID','Idaho','Bullfinch Group','Todd Achilles',38,'James Risch',33,'CTM'],
['2026-08-06','IA','Iowa','Emerson','Ashley Hinson',48,'Josh Turek',45,'RCP'],
['2026-08-04','TX','Texas','TSU / YouGov','James Talarico',47,'Ken Paxton',45,'RCP'],
['2026-08-04','OH','Ohio','Tulchin Research','Sherrod Brown',47,'Jon Husted',43,'CTM'],
['2026-08-04','AK','Alaska','Data for Progress','Mary Peltola',47,'Dan Sullivan',41,'CTM'],
['2026-08-04','MT','Montana','Hart Research Associates','Kurt Alme',52,'Alani Bankhead',38,'CTM'],
['2026-08-04','MT','Montana','Hart Research Associates','Kurt Alme',46,'Seth Bodnar',46,'CTM'],
['2026-08-02','MI','Michigan','EPIC-MRA','Mike Rogers',46,'Abdul El-Sayed',43,'RCP'],
['2026-08-02','MI','Michigan','EPIC-MRA','Haley Stevens',44,'Mike Rogers',42,'RCP'],
['2026-08-01','ME','Maine','Hart Research Associates','Troy Jackson',49,'Susan Collins',45,'CTM'],
['2026-08-01','NC','North Carolina','Change Research','Roy Cooper',50,'Michael Whatley',41,'CTM'],
['2026-07-31','MI','Michigan','MIRS / Mitchell Research','Abdul El-Sayed',45,'Mike Rogers',45,'RCP'],
['2026-07-31','MI','Michigan','MIRS / Mitchell Research','Mike Rogers',46,'Haley Stevens',43,'RCP'],
['2026-07-31','NC','North Carolina','YouGov','Roy Cooper',47,'Michael Whatley',33,'CTM'],
['2026-07-31','TX','Texas','YouGov Blue','James Talarico',48,'Ken Paxton',45,'CTM'],
['2026-07-30','TX','Texas','FOX News','James Talarico',51,'Ken Paxton',48,'RCP'],
['2026-07-29','NC','North Carolina','FOX News','Roy Cooper',53,'Michael Whatley',44,'RCP'],
['2026-07-26','MT','Montana','GQR','Seth Bodnar',50,'Kurt Alme',44,'CTM'],
['2026-07-26','MT','Montana','GQR','Kurt Alme',52,'Alani Bankhead',44,'CTM'],
['2026-07-25','AR','Arkansas','2040 Strategy Group','Tom Cotton',46,'Hallie Shoffner',43,'CTM'],
['2026-07-24','MI','Michigan','Glengariff Group','Mike Rogers',49,'Abdul El-Sayed',38.7,'CTM'],
['2026-07-24','MI','Michigan','Glengariff Group','Haley Stevens',45.5,'Mike Rogers',44.7,'CTM'],
['2026-07-20','ME','Maine','UNH Survey Center','Troy Jackson',49,'Susan Collins',46,'CTM'],
['2026-07-17','SC','South Carolina','Public Policy Polling','Annie Andrews',42,'Russell Fry',39,'CTM'],
['2026-07-17','SC','South Carolina','Public Policy Polling','Annie Andrews',41,'Mark Sanford',40,'CTM'],
['2026-07-07','ME','Maine','Public Policy Polling','Troy Jackson',49,'Susan Collins',44,'CTM'],
['2026-07-07','ME','Maine','Public Policy Polling','Graham Platner',42,'Susan Collins',47,'CTM'],
['2026-07-07','ME','Maine','Public Policy Polling','Susan Collins',48,'Janet Mills',37,'CTM'],
['2026-07-07','ME','Maine','Public Policy Polling','Susan Collins',47,'Shenna Bellows',47,'CTM']
  ];
  const RED='#bd2937';
  let renderingMaine=false;
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const leafs=root=>[...root.querySelectorAll('*')].filter(el=>el.children.length===0);

  function applyMaineCall(){
    try{
      if(typeof stateData==='undefined'||!stateData||!stateData.ME) return;
      const me=stateData.ME;
      if(me.rating==='tilt-r') return;
      me.rating='tilt-r';
      if(typeof renderSenate==='function'&&!renderingMaine){
        renderingMaine=true;
        try{renderSenate();}finally{renderingMaine=false;}
      }
    }catch(e){console.warn('Maine call update unavailable',e);}
  }

  function fixMaineVisibleDetail(){
    const root=document.getElementById('page-senate');
    if(!root) return;
    root.querySelectorAll('[data-state="ME"],[data-abbr="ME"],[data-state-abbr="ME"],#ME,#state-ME').forEach(el=>{
      if(el.namespaceURI==='http://www.w3.org/2000/svg'||/^(path|rect|polygon)$/i.test(el.tagName||'')) el.style.setProperty('fill','#f8c6ca','important');
    });
    const ls=leafs(root);
    const maine=ls.find(el=>norm(el.textContent)==='Maine'&&el.getClientRects().length);
    if(!maine) return;
    let box=maine.parentElement;
    for(let i=0;box&&box!==root&&i<10;i++,box=box.parentElement){
      const t=norm(box.textContent);
      if(/WILL'S STATISTICAL ODDS/i.test(t)&&/MY PROJECTED WINNER/i.test(t)) break;
    }
    if(!box||box===root) return;
    const bl=leafs(box);
    bl.forEach(el=>{
      const t=norm(el.textContent);
      if(/^Prediction:\s*/i.test(t)) el.textContent='Prediction: Tilt Republican';
      if(t==='Jackson +0.4%'||t==='No prediction text entered yet.') el.textContent='Tilt Republican';
    });
    const projected=bl.find(el=>/^MY PROJECTED WINNER$/i.test(norm(el.textContent)));
    const prediction=bl.find(el=>/^PREDICTION$/i.test(norm(el.textContent)));
    if(projected){
      const y0=projected.getBoundingClientRect().bottom;
      const y1=prediction?prediction.getBoundingClientRect().top:Infinity;
      const value=bl.find(el=>{
        const y=el.getBoundingClientRect().top;
        return y>=y0&&y<y1&&/^(Democrat|Democratic|Republican)$/i.test(norm(el.textContent));
      });
      if(value) value.textContent='Republican';
    }
  }

  function ensureArchiveStyle(){
    if(document.getElementById('julsep-poll-style')) return;
    const s=document.createElement('style');
    s.id='julsep-poll-style';
    s.textContent=`
      #julsepPollArchive{margin:26px 0 8px;border:1px solid #d9dee7;border-radius:16px;background:#fff;overflow:hidden;box-shadow:0 7px 24px rgba(20,34,53,.05)}
      #julsepPollArchive .jp-head{padding:20px 20px 15px;border-bottom:1px solid #e4e8ee;background:#f8fafc}
      #julsepPollArchive .jp-kicker{font-size:10px;font-weight:950;letter-spacing:1.4px;text-transform:uppercase;color:#68768a}
      #julsepPollArchive h2{font-family:Georgia,serif;margin:4px 0 6px;font-size:25px;color:#17263d}
      #julsepPollArchive .jp-sub{font-size:12px;line-height:1.5;color:#68768a;max-width:850px}
      #julsepPollArchive .jp-controls{display:flex;gap:8px;align-items:center;margin-top:13px;flex-wrap:wrap}
      #julsepPollArchive select{height:38px;border:1px solid #ced6e2;border-radius:10px;background:#fff;color:#17263d;padding:0 30px 0 10px;font-weight:800}
      #julsepPollArchive .jp-count{font-size:11px;font-weight:900;color:#53657e}
      #julsepPollArchive .jp-list{padding:8px 14px 14px}
      #julsepPollArchive .jp-row{display:grid;grid-template-columns:88px 58px minmax(150px,210px) minmax(300px,1fr);gap:10px;align-items:center;padding:12px 8px;border-bottom:1px solid #edf0f4}
      #julsepPollArchive .jp-row:last-child{border-bottom:0}
      #julsepPollArchive .jp-date{font-size:11px;font-weight:850;color:#6f7b8d}
      #julsepPollArchive .jp-state{font-size:12px;font-weight:950;color:#17263d}
      #julsepPollArchive .jp-pollster{font-size:12px;font-weight:850;color:#30445f}
      #julsepPollArchive .jp-match{font-size:12px;color:#17263d;line-height:1.35}
      #julsepPollArchive .jp-match strong{font-weight:950}
      #julsepPollArchive .jp-source{padding:0 20px 17px;font-size:10px;line-height:1.45;color:#7b8493}
      #julsepPollArchive .jp-source a{color:#53657e}
      @media(max-width:760px){
        #julsepPollArchive{margin-left:0;margin-right:0;border-radius:13px}
        #julsepPollArchive .jp-head{padding:17px 14px 13px}
        #julsepPollArchive .jp-list{padding:4px 10px 12px}
        #julsepPollArchive .jp-row{grid-template-columns:62px 1fr;gap:3px 10px;padding:12px 4px}
        #julsepPollArchive .jp-state{grid-column:2;grid-row:1}
        #julsepPollArchive .jp-pollster{grid-column:2;grid-row:2}
        #julsepPollArchive .jp-match{grid-column:1/3;grid-row:3;margin-top:4px}
      }
    `;
    document.head.appendChild(s);
  }

  function formatDate(iso){
    const [y,m,d]=iso.split('-').map(Number);
    return new Date(y,m-1,d).toLocaleDateString('en-US',{month:'short',day:'numeric'});
  }

  function renderRows(list,host){
    host.textContent='';
    const frag=document.createDocumentFragment();
    for(const p of list){
      const [date,ab,state,pollster,a,av,b,bv]=p;
      const row=document.createElement('div');
      row.className='jp-row';
      row.innerHTML=`<div class="jp-date">${formatDate(date)}</div><div class="jp-state">${ab}</div><div class="jp-pollster"></div><div class="jp-match"><strong></strong> ${av}% &nbsp;·&nbsp; <strong></strong> ${bv}%</div>`;
      row.querySelector('.jp-pollster').textContent=pollster;
      const strong=row.querySelectorAll('.jp-match strong');
      strong[0].textContent=a; strong[1].textContent=b;
      row.title=state+' Senate';
      frag.appendChild(row);
    }
    host.appendChild(frag);
  }

  function ensurePollArchive(){
    ensureArchiveStyle();
    const root=document.getElementById('page-polls');
    if(!root||document.getElementById('julsepPollArchive')) return;
    const host=root.querySelector('.content')||root;
    const sec=document.createElement('section');
    sec.id='julsepPollArchive';
    sec.innerHTML=`<div class="jp-head"><div class="jp-kicker">Expanded Senate Poll Archive</div><h2>July–September 2026 Senate polls</h2><div class="jp-sub">88 public general-election matchup polls and snapshots from July 7 through September 3, including alternate matchups that were publicly tested during the period.</div><div class="jp-controls"><select aria-label="Filter Senate polls by state"><option value="ALL">All states</option></select><span class="jp-count"></span></div></div><div class="jp-list"></div><div class="jp-source">Compiled from public listings at <a href="https://www.realclearpolling.com/latest-polls/senate" target="_blank" rel="noopener">RealClearPolling</a> and <a href="https://www.callthemap.com/polls?view=senate" target="_blank" rel="noopener">Call the Map</a>. Dates follow the source listing/field-date convention; duplicate source representations are retained only where they reflect a distinct listed sample or release.</div>`;
    host.appendChild(sec);
    const select=sec.querySelector('select');
    const states=[...new Map(POLLS.map(p=>[p[1],p[2]])).entries()].sort((a,b)=>a[1].localeCompare(b[1]));
    for(const [ab,name] of states){const o=document.createElement('option');o.value=ab;o.textContent=name;select.appendChild(o);}
    const list=sec.querySelector('.jp-list'),count=sec.querySelector('.jp-count');
    const show=()=>{const v=select.value;const rows=v==='ALL'?POLLS:POLLS.filter(p=>p[1]===v);renderRows(rows,list);count.textContent=`${rows.length} poll${rows.length===1?'':'s'} shown`;};
    select.addEventListener('change',show);show();
  }

  function apply(){applyMaineCall();fixMaineVisibleDetail();ensurePollArchive();}
  apply();
  setTimeout(apply,100);setTimeout(apply,700);setTimeout(apply,1600);
  new MutationObserver(()=>{fixMaineVisibleDetail();ensurePollArchive();}).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('pageshow',apply);
})();
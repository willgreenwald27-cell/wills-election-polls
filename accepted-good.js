(()=>{
  const REP='#bd2937', DEM='#2763b8', IND='#8051d2';
  const PAGES=[['home','Home'],['senate','2026 Senate Prediction'],['board','Battleground Board'],['swing','Swing State Explanations'],['errors','Past Polling Errors'],['governor','2026 Governor Map'],['polls','New Polls'],['betting','Betting Odds'],['about','About Me']];
  const PRIMARY=[['home','Home'],['senate','2026 Senate Map Prediction'],['swing','Swing State Explanations'],['errors','Past Polling Errors']];
  const EXPLORE=[['polls','New Polls'],['board','Battleground Board'],['governor','2026 Governor Map'],['betting','Live Kalshi Senate Odds'],['about','About Me']];
  let current='home',busy=false,queued=false;
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const leafs=r=>r?[...r.querySelectorAll('*')].filter(el=>el.children.length===0):[];

  function partyColor(v){
    const p=norm(v).toLowerCase();
    if(p==='r'||p==='rep'||p==='gop'||p.includes('republican')) return REP;
    if(p==='d'||p==='dem'||p.includes('democrat')) return DEM;
    if(p==='i'||p==='ind'||p.includes('independent')||p.includes('unaffiliated')||p.includes('other')) return IND;
    return null;
  }

  function partyForName(name){
    const n=norm(name).toLowerCase();
    if(!n) return null;
    if(['seth bodnar','todd achilles','dan osborn','brian bengs'].includes(n)) return IND;
    try{
      if(typeof stateData!=='undefined'&&stateData){
        for(const s of Object.values(stateData)){
          if(norm(s?.candidate1).toLowerCase()===n) return partyColor(s?.candidate1Party)||IND;
          if(norm(s?.candidate2).toLowerCase()===n) return partyColor(s?.candidate2Party)||IND;
        }
      }
    }catch(e){}
    return null;
  }

  function lineColor(line){
    const party=line?.querySelector?.('.candidate-party');
    const name=norm(line?.querySelector?.('.candidate-name')?.textContent);
    return partyColor(party?.textContent)||partyForName(name)||IND;
  }

  function addStyle(){
    if(document.getElementById('accepted-good-style')) return;
    const s=document.createElement('style');
    s.id='accepted-good-style';
    s.textContent=`
      #accepted-governor,#accepted-pastmaps{width:100%;min-height:calc(100vh - 72px);background:#fff}
      .accepted-frame{display:block;width:100%;border:0;background:#fff;min-height:calc(100vh - 72px)}
      .site-header .nav[data-accepted-nav="1"]{display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:5px!important;flex-wrap:nowrap!important}
      .site-header .nav[data-accepted-nav="1"]>button{height:42px!important;padding:0 13px!important;border:0!important;background:transparent!important;color:#17263d!important;border-radius:999px!important;font:800 12px/1 Inter,ui-sans-serif,system-ui,sans-serif!important;white-space:nowrap!important;cursor:pointer!important}
      .site-header .nav[data-accepted-nav="1"]>button.active{background:#17263d!important;color:#fff!important}

      @media(max-width:760px){.site-header .nav[data-accepted-nav="1"]{overflow-x:auto!important;justify-content:flex-start!important;padding-bottom:7px!important}.site-header .nav[data-accepted-nav="1"]>button{flex:0 0 auto!important;height:38px!important;padding:0 10px!important;font-size:11px!important}}

      /* Compact header: four destinations and an accessible More menu. */
      body .site-header .nav[data-accepted-nav="1"][data-compact-nav="1"]{
        display:flex!important;align-items:center!important;justify-content:flex-end!important;
        flex-wrap:nowrap!important;gap:8px!important;min-width:0!important
      }
      body .site-header .nav[data-accepted-nav="1"][data-compact-nav="1"]>button{
        order:initial!important;flex:0 0 auto!important;padding:0 15px!important;
        font-family:Inter,ui-sans-serif,system-ui,sans-serif!important;font-size:12px!important;
        font-weight:800!important;letter-spacing:.005em!important
      }
      body .site-header .nav[data-compact-nav="1"]>button[data-compact-more]{
        display:flex!important;align-items:center!important;gap:7px!important;
        border:1px solid rgba(164,193,229,.26)!important;color:#e8f2ff!important;
        -webkit-text-fill-color:#e8f2ff!important
      }
      body .site-header .nav[data-compact-nav="1"]>button[data-compact-more][aria-expanded="true"],
      body .site-header .nav[data-compact-nav="1"]>button[data-compact-more].active{
        background:rgba(52,104,180,.40)!important;border-color:rgba(120,176,249,.7)!important
      }
      #will-nav-more-menu[hidden]{display:none!important}
      #will-nav-more-menu{
        position:fixed;z-index:2147480000;display:grid;gap:3px;width:284px;
        max-width:calc(100vw - 24px);max-height:calc(100vh - 90px);overflow-y:auto;
        background:#0d213c;border:1px solid #426187;border-radius:15px;padding:9px;
        box-shadow:0 18px 48px rgba(0,0,0,.44);font-family:Inter,ui-sans-serif,system-ui,sans-serif
      }
      #will-nav-more-menu .wg-more-title{
        color:#91b1d8;font:800 10px/1.4 Inter,system-ui,sans-serif;letter-spacing:.16em;
        text-transform:uppercase;padding:9px 12px 7px
      }
      #will-nav-more-menu button{
        display:block;width:100%;border:0;border-radius:9px;padding:13px 12px;
        background:transparent;color:#e6f1ff;-webkit-text-fill-color:#e6f1ff;
        text-align:left;font:750 13px/1.35 Inter,ui-sans-serif,system-ui,sans-serif;
        cursor:pointer;min-height:43px
      }
      #will-nav-more-menu button:hover,#will-nav-more-menu button:focus-visible{
        background:#1f436f;color:#fff;-webkit-text-fill-color:#fff
      }
      #will-nav-more-menu button.active{background:#235aa1;color:#fff;-webkit-text-fill-color:#fff}
      #will-nav-more-menu button:focus-visible,.site-header .nav[data-compact-nav="1"]>button:focus-visible{
        outline:2px solid #8bbfff!important;outline-offset:2px!important
      }
      @media(max-width:760px){
        body .site-header .nav[data-accepted-nav="1"][data-compact-nav="1"]{
          justify-content:flex-start!important;overflow-x:auto!important;overflow-y:hidden!important;
          padding:0 0 8px!important;gap:3px!important;-webkit-overflow-scrolling:touch
        }
        body .site-header .nav[data-accepted-nav="1"][data-compact-nav="1"]>button{
          height:39px!important;min-height:39px!important;padding:0 10px!important;font-size:11px!important
        }
        body .site-header .nav[data-accepted-nav="1"][data-compact-nav="1"]>button[data-accepted-page="polls"]{font-size:0!important}
        body .site-header .nav[data-accepted-nav="1"][data-compact-nav="1"]>button[data-accepted-page="polls"]:after{
          content:"Polls";font:800 11px/1 Inter,ui-sans-serif,system-ui,sans-serif
        }
        #will-nav-more-menu{width:min(320px,calc(100vw - 24px))}
      }
    `;
    document.head.appendChild(s);
  }

  function ensureArchive(){
    if(document.getElementById('accepted-archive-loader')||document.getElementById('julsepPollArchive')) return;
    const s=document.createElement('script');
    s.id='accepted-archive-loader';
    s.src='/senate-julsep-archive.js?v=20260908-2242';
    document.head.appendChild(s);
  }

  function makeFrame(id,src,title){
    let page=document.getElementById(id);
    if(page) return page;
    page=document.createElement('section');
    page.id=id; page.className='page'; page.hidden=true;
    const f=document.createElement('iframe');
    f.className='accepted-frame'; f.src=src; f.title=title; f.loading='eager';
    f.addEventListener('load',()=>{
      try{
        const d=f.contentDocument;
        if(!d) return;
        const st=d.createElement('style');
        st.textContent=`.site-header{display:none!important}body{margin:0!important;background:#fff!important}.page-head,.content,.wrap{max-width:1500px!important;margin-left:auto!important;margin-right:auto!important}.page-head{padding-top:24px!important}`;
        d.head.appendChild(st);
        const resize=()=>{f.style.height=Math.max(d.documentElement.scrollHeight,d.body?d.body.scrollHeight:0,window.innerHeight-72)+'px'};
        resize();
        new ResizeObserver(resize).observe(d.documentElement);
      }catch(e){}
    });
    page.appendChild(f);
    const about=document.getElementById('page-about');
    if(about?.parentNode) about.parentNode.insertBefore(page,about); else document.body.appendChild(page);
    return page;
  }

  function pageEl(k){
    if(k==='governor') return makeFrame('accepted-governor','/governor.html?embedded=1','2026 Governor Map');
    if(k==='pastmaps') return makeFrame('accepted-pastmaps','/past-senate-maps.html?embedded=1','Past Senate Maps');
    if(k==='board'){
      let p=document.getElementById('page-board');
      if(!p){p=document.createElement('section');p.id='page-board';p.className='page';p.hidden=true;const about=document.getElementById('page-about');if(about?.parentNode)about.parentNode.insertBefore(p,about);else document.body.appendChild(p);}
      return p;
    }
    if(k==='swing'){
      let p=document.getElementById('page-swing');
      if(!p){
        // A readable in-site fallback until the colorful cards are mounted.
        p=document.createElement('section');p.id='page-swing';p.className='page wg-swing-page wg-swing-fallback';
        p.setAttribute('aria-label','2026 Swing State Explanations');
        p.innerHTML='<div style="max-width:1100px;margin:auto;padding:36px 22px;color:#1a3559">'+
          '<h1>2026 Swing State Explanations</h1><p>Research and polling context behind eight Senate races.</p>'+
          '<iframe title="Swing-state research and race analysis" loading="lazy" src="/2026-senate-battlegrounds.html?embedded=1" style="width:100%;height:90vh;min-height:650px;border:0;border-radius:12px;background:#081525"></iframe></div>';
        const about=document.getElementById('page-about');
        if(about?.parentNode)about.parentNode.insertBefore(p,about);else document.body.appendChild(p);
      }
      return p;
    }
    return document.getElementById('page-'+k);
  }

  function ensureMoreMenu(){
    let menu=document.getElementById('will-nav-more-menu');
    if(menu)return menu;
    menu=document.createElement('div');
    menu.id='will-nav-more-menu';
    menu.hidden=true;
    menu.setAttribute('role','group');
    menu.setAttribute('aria-label','Explore more election pages');
    const title=document.createElement('div');
    title.className='wg-more-title';
    title.textContent='More to explore';
    menu.appendChild(title);
    for(const [k,label] of EXPLORE){
      const b=document.createElement('button');
      b.type='button';
      b.dataset.morePage=k;
      b.textContent=label;
      menu.appendChild(b);
    }
    document.body.appendChild(menu);
    return menu;
  }

  function closeMore(){
    const menu=document.getElementById('will-nav-more-menu');
    const toggle=document.getElementById('will-nav-more-toggle');
    if(menu)menu.hidden=true;
    if(toggle)toggle.setAttribute('aria-expanded','false');
  }

  function positionMore(){
    const menu=document.getElementById('will-nav-more-menu');
    const toggle=document.getElementById('will-nav-more-toggle');
    if(!menu||!toggle||menu.hidden)return;
    const rect=toggle.getBoundingClientRect();
    const width=Math.min(320,window.innerWidth-24);
    const left=window.innerWidth<=760?Math.max(12,window.innerWidth-width-12):
      Math.max(12,Math.min(rect.right-width,window.innerWidth-width-12));
    menu.style.left=left+'px';
    menu.style.top=Math.max(12,Math.min(rect.bottom+9,window.innerHeight-78))+'px';
  }

  function toggleMore(){
    const menu=ensureMoreMenu();
    const toggle=document.getElementById('will-nav-more-toggle');
    if(!toggle)return;
    const open=menu.hidden;
    menu.hidden=!open;
    toggle.setAttribute('aria-expanded',open?'true':'false');
    if(open)positionMore();
  }

  function buildNav(){
    const nav=document.querySelector('.site-header .nav');
    if(!nav)return;
    ensureMoreMenu();
    const valid=nav.dataset.acceptedNav==='1'&&nav.dataset.compactNav==='1'&&
      nav.querySelectorAll(':scope > button[data-accepted-page]').length===PRIMARY.length&&
      nav.querySelector(':scope > button[data-compact-more]');
    if(valid)return;
    nav.replaceChildren();
    nav.dataset.acceptedNav='1';
    nav.dataset.compactNav='1';
    nav.setAttribute('aria-label','Primary website navigation');
    for(const [k,label] of PRIMARY){
      const b=document.createElement('button');
      b.type='button';
      b.textContent=label;
      b.dataset.acceptedPage=k;
      b.setAttribute('aria-label',label);
      nav.appendChild(b);
    }
    const more=document.createElement('button');
    more.type='button';
    more.id='will-nav-more-toggle';
    more.dataset.compactMore='1';
    more.setAttribute('aria-controls','will-nav-more-menu');
    more.setAttribute('aria-haspopup','true');
    more.setAttribute('aria-expanded','false');
    more.setAttribute('aria-label','Explore more pages');
    more.innerHTML='<span>Explore</span><span aria-hidden="true">▾</span>';
    nav.appendChild(more);
    closeMore();
  }

  function activeNav(){
    document.querySelectorAll('.site-header .nav[data-compact-nav="1"]>button[data-accepted-page]').forEach(b=>{
      const active=b.dataset.acceptedPage===current;
      b.classList.toggle('active',active);
      b.setAttribute('aria-current',active?'page':'false');
    });
    document.querySelectorAll('#will-nav-more-menu [data-more-page]').forEach(b=>{
      const active=b.dataset.morePage===current;
      b.classList.toggle('active',active);
      b.setAttribute('aria-current',active?'page':'false');
    });
    const more=document.getElementById('will-nav-more-toggle');
    if(more){
      const active=EXPLORE.some(([k])=>k===current);
      more.classList.toggle('active',active);
      more.setAttribute('aria-current',active?'page':'false');
    }
  }

  function show(k,scroll=true){
    if(busy||!PAGES.some(x=>x[0]===k)) return;
    closeMore();
    busy=true;
    try{
      for(const [key] of PAGES){
        const el=pageEl(key); if(!el) continue;
        const on=key===k;
        el.hidden=!on;
        el.classList.toggle('active',on);
        el.style.setProperty('display',on?'block':'none','important');
      }
      // Reset any legacy full-screen simulator overlay before activating a page.
      document.body.classList.remove('wg-night-active');
      document.getElementById('wg-night-view')?.remove();
      document.getElementById('wg-night-embed-style')?.remove();
      const url=new URL(location.href);
      if(k==='swing'||k==='board'||k==='errors')url.searchParams.set('page',k);
      else if(['swing','board','errors','electionnight'].includes(url.searchParams.get('page')))url.searchParams.delete('page');
      if(url.href!==location.href)history.replaceState(null,'',url.pathname+url.search+url.hash);
      current=k; activeNav(); if(scroll) window.scrollTo(0,0);
    }finally{busy=false;}
  }

  function fixHome(){
    const root=document.getElementById('page-home'); if(!root) return;
    for(const card of root.querySelectorAll('.reference-metrics>*')){
      const t=norm(card.textContent).toLowerCase();
      for(const el of leafs(card)){
        const v=norm(el.textContent);
        if(t.includes('poll')&&t.includes('entered')&&['13','14','88','89'].includes(v)) el.textContent='90';
        if(t.includes('toss')&&t.includes('up')&&v==='7') el.textContent='6';
        if(t.includes('latest')&&t.includes('update')&&(/Sep\.? [67], 2026/i.test(v)||v==='2026-09-06'||v==='2026-09-07')) el.textContent='Sep 8, 2026';
      }
    }
  }


function ensureHousePrediction(){
  const root=document.getElementById('page-home'); if(!root||document.getElementById('housePrediction2026')) return;
  const shell=root.querySelector('.reference-home-shell')||root.querySelector('.content')||root;
  const section=document.createElement('section'); section.id='housePrediction2026';
  section.style.cssText='width:100%;margin:28px 0 10px;display:block';
  const img=document.createElement('img');
  img.src='/house-prediction.svg?v=20260908-2208';
  img.alt="Will’s House of Reps Prediction: Democrats 228 seats, Republicans 207 seats; 218 needed for a majority.";
  img.style.cssText='display:block;width:100%;height:auto;border-radius:16px';
  section.appendChild(img);
  const metrics=root.querySelector('.reference-metrics');
  if(metrics) metrics.insertAdjacentElement('afterend',section); else shell.appendChild(section);
}

function fixAboutPollCount(){
  const root=document.getElementById('page-about'); if(!root) return;
  for(const el of leafs(root)){
    const t=norm(el.textContent); if(!t) continue;
    if(/\b(?:13|89)\s+polls?\b/i.test(t)){
      el.textContent=t.replace(/\b(?:13|89)(?=\s+polls?\b)/i,'90');
      continue;
    }
    if(!['13','89'].includes(t)) continue;
    let box=el.parentElement,ok=false;
    for(let i=0;box&&box!==root&&i<6;i++,box=box.parentElement){if(/poll/i.test(norm(box.textContent))){ok=true;break;}}
    if(ok) el.textContent='90';
  }
}

  function enforceMaineData(){
    try{
      if(typeof stateData==='undefined'||!stateData?.ME) return;
      const s=stateData.ME;
      s.rating='tilt-r'; s.predictionParty='Republican'; s.prediction='Collins +1.3%'; s.notes='Why: Final polling margins underestimated Susan Collins by more than 5 points in each of her last three Senate elections (2008, 2014, and 2020).'; s.updated='2026-09-10';
      for(const k of ['projectedWinner','predictionWinner','winner','callParty']) if(k in s) s[k]='Republican';
      if('call' in s) s.call='Collins +1.3%';
      if(norm(s.candidate1)==='Susan Collins') s.candidate1Odds='48';
      if(norm(s.candidate2)==='Susan Collins') s.candidate2Odds='48';
      if(norm(s.candidate1)==='Troy Jackson') s.candidate1Odds='52';
      if(norm(s.candidate2)==='Troy Jackson') s.candidate2Odds='52';
    }catch(e){}
  }

  function fixAllCandidateColors(root){
    const lines=[...root.querySelectorAll('.candidate-line')];
    for(const line of lines){
      const c=lineColor(line);
      line.querySelectorAll('.candidate-name,.candidate-party,.candidate-metrics b,.candidate-metrics strong,.candidate-metrics span').forEach(el=>el.style.setProperty('color',c,'important'));
    }

    for(const bar of root.querySelectorAll('.oddsbar')){
      let panel=bar.parentElement;
      while(panel&&panel!==root){
        const panelLines=[...panel.querySelectorAll('.candidate-line')];
        if(panelLines.length>=2){
          const c1=lineColor(panelLines[0]), c2=lineColor(panelLines[1]);
          const a=bar.querySelector('.oddsbar-a'), b=bar.querySelector('.oddsbar-b');
          if(a) a.style.setProperty('background',c1,'important');
          if(b) b.style.setProperty('background',c2,'important');
          const kids=[...bar.children].filter(el=>el!==a&&el!==b);
          if(!a&&kids[0]) kids[0].style.setProperty('background',c1,'important');
          if(!b&&kids[1]) kids[1].style.setProperty('background',c2,'important');
          break;
        }
        panel=panel.parentElement;
      }
    }

    const all=leafs(root);
    for(const line of lines){
      const name=norm(line.querySelector('.candidate-name')?.textContent);
      if(!name) continue;
      const c=lineColor(line);
      for(const el of all){
        const t=norm(el.textContent);
        if(t.toLowerCase().startsWith(name.toLowerCase()+':')&&/\d+(?:\.\d+)?%$/.test(t)) el.style.setProperty('color',c,'important');
      }
    }
  }

  function fixMobileOddsFallback(root){
    if(!window.matchMedia('(max-width:760px)').matches) return;
    const cards=[];
    for(const partyEl of leafs(root)){
      const pt=norm(partyEl.textContent);
      const c=partyColor(pt);
      if(!c) continue;
      let card=partyEl.parentElement;
      for(let i=0;card&&card!==root&&i<6;i++,card=card.parentElement){
        const t=norm(card.textContent);
        if(/poll average/i.test(t)&&/\d+(?:\.\d+)?%/.test(t)) break;
      }
      if(!card||card===root) continue;
      const ls=leafs(card);
      const pct=ls.find(el=>/^\d+(?:\.\d+)?%$/.test(norm(el.textContent)));
      const name=ls.find(el=>{
        const t=norm(el.textContent);
        return t&&/[A-Za-z]/.test(t)&&t.split(/\s+/).length>=2&&!/^(Republican|Democrat(?:ic)?|Independent|Unaffiliated|Other|POLL AVERAGE|\d+(?:\.\d+)?%)$/i.test(t);
      });
      if(!name) continue;
      const resolved=partyForName(name.textContent)||c;
      name.style.setProperty('color',resolved,'important');
      partyEl.style.setProperty('color',resolved,'important');
      if(pct) pct.style.setProperty('color',resolved,'important');
      cards.push({name:norm(name.textContent),color:resolved});
    }
    if(cards.length<2) return;

    const labels=[];
    const all=leafs(root);
    for(const c of cards){
      for(const el of all){
        const t=norm(el.textContent);
        if(t.toLowerCase().startsWith(c.name.toLowerCase()+':')&&/\d+(?:\.\d+)?%$/.test(t)){
          el.style.setProperty('color',c.color,'important');
          labels.push({el,...c});
        }
      }
    }
    if(labels.length<2) return;
    labels.sort((a,b)=>a.el.getBoundingClientRect().left-b.el.getBoundingClientRect().left);
    const first=labels[0], second=labels[1];
    const firstPct=Number((norm(first.el.textContent).match(/(\d+(?:\.\d+)?)%$/)||[])[1]||50);
    const split=Math.max(0,Math.min(100,firstPct));
    const heading=all.find(el=>/will'?s statistical odds/i.test(norm(el.textContent)));
    const top=heading?heading.getBoundingClientRect().bottom:Math.min(first.el.getBoundingClientRect().top,second.el.getBoundingClientRect().top)-70;
    const bottom=Math.min(first.el.getBoundingClientRect().top,second.el.getBoundingClientRect().top);

    const colored=[];
    for(const el of root.querySelectorAll('div,span,i')){
      const r=el.getBoundingClientRect();
      if(r.width<18||r.height<4||r.height>30||r.top<top-6||r.bottom>bottom+5) continue;
      const bg=getComputedStyle(el).backgroundColor||'';
      const nums=bg.match(/\d+/g);
      if(!nums||nums.length<3) continue;
      const rgb=nums.slice(0,3).map(Number);
      if(Math.max(...rgb)-Math.min(...rgb)<25) continue;
      colored.push({el,r});
    }
    colored.sort((a,b)=>a.r.left-b.r.left||b.r.width-a.r.width);
    const segs=[];
    for(const item of colored){
      if(!segs.some(x=>Math.abs(x.r.left-item.r.left)<2&&Math.abs(x.r.width-item.r.width)<2)) segs.push(item);
    }
    if(segs.length>=2){
      segs[0].el.style.setProperty('background',first.color,'important');
      segs[1].el.style.setProperty('background',second.color,'important');
    }
    for(const el of root.querySelectorAll('div,span')){
      const r=el.getBoundingClientRect();
      if(r.width<150||r.height<4||r.height>30||r.top<top-6||r.bottom>bottom+5) continue;
      const cs=getComputedStyle(el);
      if(cs.backgroundImage&&cs.backgroundImage!=='none') el.style.setProperty('background',`linear-gradient(to right, ${first.color} 0%, ${first.color} ${split}%, ${second.color} ${split}%, ${second.color} 100%)`,'important');
    }
  }

  const FORECAST_DISAGREEMENT_NOTES={};

  function ensureForecastDisagreementNotes(){
    const root=document.body; if(!root) return;

    // Ohio should never show a "Why my forecast differs" block.
    root.querySelectorAll('[data-forecast-disagreement="OH"],[data-forecast-disagreement="TX"]').forEach(el=>el.remove());
    const senate=document.getElementById('page-senate');
    if(senate){
      const ohioSeeds=leafs(senate).filter(el=>/^(Ohio|Sherrod Brown|Jon Husted)$/i.test(norm(el.textContent)));
      for(const seed of ohioSeeds){
        let box=seed.parentElement;
        for(let i=0;box&&box!==senate&&i<16;i++,box=box.parentElement){
          const t=norm(box.textContent);
          if(/Sherrod Brown/i.test(t)&&/Jon Husted/i.test(t)&&/AVG POLLS|POLL AVERAGE/i.test(t)) break;
        }
        if(!box||box===senate) continue;
        for(const node of [...box.querySelectorAll('*')]){
          const t=norm(node.textContent);
          if(!/^WHY(?:\s+MY)?\b.*DIFFERS\b/i.test(t)) continue;
          const hasChildMatch=[...node.children].some(ch=>/^WHY(?:\s+MY)?\b.*DIFFERS\b/i.test(norm(ch.textContent)));
          if(hasChildMatch) continue;
          let cur=node,best=node;
          for(let d=0;d<6;d++){
            const p=cur.parentElement;
            if(!p||p===box)break;
            const pt=norm(p.textContent);
            if(/^WHY(?:\s+MY)?\b.*DIFFERS\b/i.test(pt)&&!/WILL['’]S CALL|AVG POLLS|POLL AVERAGE/i.test(pt)){best=p;cur=p;}
            else break;
          }
          best.remove();
        }
      }
    }

    const all=leafs(root);
    for(const [abbr,cfg] of Object.entries(FORECAST_DISAGREEMENT_NOTES)){
      const seed=all.find(el=>el.getClientRects().length&&cfg.candidates.includes(norm(el.textContent)));
      if(!seed) continue;
      let box=seed.parentElement;
      for(let i=0;box&&box!==root&&i<16;i++,box=box.parentElement){
        const t=norm(box.textContent);
        if(cfg.candidates.every(n=>t.includes(n))&&/POLL AVERAGE|AVG POLLS/i.test(t)&&/WILL'S CALL|MY PREDICTION|WILL'S STATISTICAL ODDS/i.test(t)) break;
      }
      if(!box||box===root) continue;
      let note=box.querySelector(`[data-forecast-disagreement=\"${abbr}\"]`);
      if(!note){
        note=document.createElement('div'); note.dataset.forecastDisagreement=abbr;
        note.style.cssText='margin:16px 0 2px;padding:13px 14px;border-top:1px solid #dbe2ea;background:#f7f9fc;border-radius:10px;color:#27384d;font-size:12px;line-height:1.5';
        const label=document.createElement('strong'); label.textContent='WHY MY FORECAST DIFFERS'; label.style.cssText='display:block;margin-bottom:5px;font-size:10px;letter-spacing:.8px;color:#607089';
        const body=document.createElement('div'); body.className='forecast-disagreement-copy'; body.textContent=cfg.text;
        note.append(label,body); box.appendChild(note);
      }else{ const body=note.querySelector('.forecast-disagreement-copy'); if(body) body.textContent=cfg.text; }
    }
  }

  function fixSenate(){
    const root=document.getElementById('page-senate'); if(!root) return;
    enforceMaineData();

    // Keep Texas and Maine on the same native popup structure as every other state.
    root.querySelectorAll('[data-forecast-disagreement],.maine-why-note').forEach(el=>el.remove());

    // Preserve the 51–49 pre-Texas-red seat count from the Senate renderer.

    fixAllCandidateColors(root);
    fixMobileOddsFallback(root);
  }

  function apply(){
    addStyle(); buildNav(); ensureArchive(); fixHome(); ensureHousePrediction(); fixAboutPollCount(); fixSenate(); activeNav();
  }
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply();});}

  document.addEventListener('click',e=>{
    const target=e.target;
    const more=target.closest?.('.site-header .nav[data-compact-nav="1"] [data-compact-more]');
    if(more){
      e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
      toggleMore();
      return;
    }
    const extra=target.closest?.('#will-nav-more-menu [data-more-page]');
    if(extra){
      e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
      show(extra.dataset.morePage,true);
      return;
    }
    const b=target.closest?.('.site-header .nav[data-accepted-nav="1"]>button[data-accepted-page]');
    if(b){
      e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
      show(b.dataset.acceptedPage,true);
      return;
    }
    if(!target.closest?.('#will-nav-more-menu'))closeMore();
  },true);
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&!document.getElementById('will-nav-more-menu')?.hidden){
      e.preventDefault();closeMore();document.getElementById('will-nav-more-toggle')?.focus();
    }
  });
  window.addEventListener('scroll',()=>{if(!document.getElementById('will-nav-more-menu')?.hidden)closeMore();},true);
  window.addEventListener('resize',positionMore);


  current=['swing','board','errors'].includes(new URLSearchParams(location.search).get('page'))?new URLSearchParams(location.search).get('page'):'home';
  apply();
  pageEl('governor'); show(current,false);
  setTimeout(apply,100); setTimeout(apply,500); setTimeout(apply,1500);
  // Avoid observing the entire document: our own DOM edits previously
  // triggered an endless chain of rerenders and flickering.
  window.addEventListener('pageshow',()=>{apply();show(current,false)});
  window.addEventListener('resize',apply);
  window.__acceptedGoodNavigate=show;
})();

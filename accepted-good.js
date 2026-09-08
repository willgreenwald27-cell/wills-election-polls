(()=>{
  const REP='#bd2937', DEM='#2763b8', IND='#8051d2';
  const PAGES=[['home','Home'],['senate','2026 Senate Prediction'],['governor','2026 Governor Map'],['polls','New Polls'],['betting','Betting Odds'],['errors','Past Polling Errors'],['pastmaps','Past Senate Maps'],['about','About Me']];
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
    `;
    document.head.appendChild(s);
  }

  function ensureArchive(){
    if(document.getElementById('accepted-archive-loader')||document.getElementById('julsepPollArchive')) return;
    const s=document.createElement('script');
    s.id='accepted-archive-loader';
    s.src='/senate-julsep-archive.js?v=20260907-2358';
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
    return document.getElementById('page-'+k);
  }

  function buildNav(){
    const nav=document.querySelector('.site-header .nav');
    if(!nav) return;
    if(nav.dataset.acceptedNav==='1'&&nav.querySelectorAll(':scope>[data-accepted-page]').length===PAGES.length) return;
    nav.textContent='';
    nav.dataset.acceptedNav='1';
    for(const [k,label] of PAGES){
      const b=document.createElement('button');
      b.type='button'; b.textContent=label; b.dataset.acceptedPage=k;
      nav.appendChild(b);
    }
  }

  function activeNav(){
    document.querySelectorAll('.site-header .nav[data-accepted-nav="1"] [data-accepted-page]').forEach(b=>b.classList.toggle('active',b.dataset.acceptedPage===current));
  }

  function show(k,scroll=true){
    if(busy||!PAGES.some(x=>x[0]===k)) return;
    busy=true;
    try{
      for(const [key] of PAGES){
        const el=pageEl(key); if(!el) continue;
        const on=key===k;
        el.hidden=!on;
        el.classList.toggle('active',on);
        el.style.setProperty('display',on?'block':'none','important');
      }
      current=k; activeNav(); if(scroll) window.scrollTo(0,0);
    }finally{busy=false;}
  }

  function fixHome(){
    const root=document.getElementById('page-home'); if(!root) return;
    for(const card of root.querySelectorAll('.reference-metrics>*')){
      const t=norm(card.textContent).toLowerCase();
      for(const el of leafs(card)){
        const v=norm(el.textContent);
        if(t.includes('poll')&&t.includes('entered')&&v==='13') el.textContent='88';
        if(t.includes('toss')&&t.includes('up')&&v==='7') el.textContent='6';
        if(t.includes('latest')&&t.includes('update')&&(/Sep\.? 6, 2026/i.test(v)||v==='2026-09-06')) el.textContent='Sep 7, 2026';
      }
    }
  }

  function enforceMaineData(){
    try{
      if(typeof stateData==='undefined'||!stateData?.ME) return;
      const s=stateData.ME;
      s.rating='tilt-r'; s.predictionParty='Republican'; s.prediction='Collins +1.3%'; s.updated='2026-09-07';
      for(const k of ['projectedWinner','predictionWinner','winner','callParty']) if(k in s) s[k]='Republican';
      if('call' in s) s.call='Collins +1.3%';
      if(norm(s.candidate1)==='Susan Collins') s.candidate1Odds='51';
      if(norm(s.candidate2)==='Susan Collins') s.candidate2Odds='51';
      if(norm(s.candidate1)==='Troy Jackson') s.candidate1Odds='49';
      if(norm(s.candidate2)==='Troy Jackson') s.candidate2Odds='49';
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

  function fixSenate(){
    const root=document.getElementById('page-senate'); if(!root) return;
    enforceMaineData();
    root.querySelectorAll('[data-state="ME"],[data-abbr="ME"],[data-state-abbr="ME"],#ME,#state-ME').forEach(el=>{
      el.style.setProperty('fill','#f8c6ca','important');
      if(el.namespaceURI!=='http://www.w3.org/2000/svg') el.style.setProperty('background','#f8c6ca','important');
    });
    for(const label of leafs(root)){
      const t=norm(label.textContent);
      if(/^(REPUBLICAN|DEMOCRAT(?:IC)?)$/i.test(t)){
        let box=label.parentElement;
        for(let d=0;box&&box!==root&&d<5;d++,box=box.parentElement){
          const n=leafs(box).find(x=>/^\d+$/.test(norm(x.textContent)));
          if(n){n.textContent=/^REPUBLICAN$/i.test(t)?'51':'49';break;}
        }
      }
    }
    const maine=leafs(root).find(el=>norm(el.textContent)==='Maine'&&el.getClientRects().length);
    if(maine){
      let box=maine.parentElement;
      for(let i=0;box&&box!==root&&i<14;i++,box=box.parentElement){
        const t=norm(box.textContent);
        if(/WILL'S CALL|MY PREDICTION|WILL'S STATISTICAL ODDS/i.test(t)&&/Susan Collins|Troy Jackson/i.test(t)) break;
      }
      if(box&&box!==root){
        for(const el of leafs(box)){
          const t=norm(el.textContent);
          if(/^Prediction:\s*/i.test(t)) el.textContent='Prediction: Tilt Republican';
          if(t==='Jackson +0.4%'||t==='No prediction text entered yet.') el.textContent='Collins +1.3%';
          if(/^Susan Collins:\s*\d+(?:\.\d+)?%$/i.test(t)) el.textContent='Susan Collins: 51%';
          if(/^Troy Jackson:\s*\d+(?:\.\d+)?%$/i.test(t)) el.textContent='Troy Jackson: 49%';
        }
        const copy=box.querySelector('.prediction-copy'); if(copy) copy.textContent='Collins +1.3%';
        const callLabel=leafs(box).findIndex(el=>/^WILL'S CALL$/i.test(norm(el.textContent)));
        if(callLabel>=0){
          const ls=leafs(box);
          const p=ls.slice(callLabel+1,callLabel+12).find(el=>/^(Democrat(?:ic)?|Republican)$/i.test(norm(el.textContent)));
          if(p){p.textContent='Republican';p.style.setProperty('color',REP,'important');}
        }
        const bar=box.querySelector('.oddsbar');
        const lines=[...box.querySelectorAll('.candidate-line')];
        if(bar&&lines.length>=2){
          const parts=[bar.querySelector('.oddsbar-a'),bar.querySelector('.oddsbar-b')];
          lines.slice(0,2).forEach((line,i)=>{
            const n=norm(line.querySelector('.candidate-name')?.textContent);
            const p=line.querySelector('.candidate-party');
            const odds=n==='Susan Collins'?51:n==='Troy Jackson'?49:null;
            if(parts[i]&&odds!=null){parts[i].style.setProperty('width',odds+'%','important');parts[i].style.setProperty('background',n==='Susan Collins'?REP:DEM,'important');}
            if(p&&n==='Susan Collins') p.textContent='Republican';
          });
        }
      }
    }
    fixAllCandidateColors(root);
    fixMobileOddsFallback(root);
  }

  function apply(){
    addStyle(); buildNav(); ensureArchive(); fixHome(); fixSenate(); activeNav();
  }
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply();});}

  document.addEventListener('click',e=>{
    const b=e.target.closest?.('.site-header .nav[data-accepted-nav="1"] [data-accepted-page]');
    if(!b) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); show(b.dataset.acceptedPage,true);
  },true);

  current='home';
  apply();
  pageEl('governor'); pageEl('pastmaps'); show('home',false);
  setTimeout(apply,100); setTimeout(apply,500); setTimeout(apply,1500);
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true});
  window.addEventListener('pageshow',()=>{apply();show(current,false)});
  window.addEventListener('resize',apply);
  window.__acceptedGoodNavigate=show;
})();

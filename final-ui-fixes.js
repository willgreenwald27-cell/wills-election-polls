(()=>{
  const PURPLE='#8051d2', PURPLE_LIGHT='#efe8ff', RED='#bd2937', BLUE='#2763b8', TILT_RED='#f8c6ca';
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const pageMap={home:'home',senate:'senate',governor:'governor',polls:'polls',betting:'betting',errors:'errors',about:'about'};
  let navWait=null;

  function partyColor(text){
    const p=norm(text).toLowerCase();
    if(p.includes('republican')||p==='r'||p==='gop') return RED;
    if(p.includes('democrat')||p==='d') return BLUE;
    return PURPLE;
  }
  function isIndependent(text){
    const p=norm(text).toLowerCase();
    return p==='i'||p.includes('independent')||p.includes('unaffiliated')||p.includes('other');
  }

  function ensureStyle(){
    if(document.getElementById('will-final-ui-style')) return;
    const s=document.createElement('style');
    s.id='will-final-ui-style';
    s.textContent=`
      :root{--solid-i:${PURPLE}!important;--likely-i:${PURPLE}!important;--lean-i:${PURPLE}!important;--tilt-i:${PURPLE}!important}
      #page-polls .ind,#page-polls .independent,#page-polls .osborn,#page-betting .ind,#page-betting .independent,#page-betting .osborn{color:${PURPLE}!important;border-color:${PURPLE}!important}
      #page-betting .mini-bar.ind i,#page-betting .mini-bar.independent i,#page-betting .mini-bar.osborn i,#page-betting .kleg.i,#page-betting .kleg.ind,#page-betting .kleg.independent,#page-betting .kleg.osborn{background:${PURPLE}!important}
      #page-betting .kalshi-market-tile-odds .i,#page-betting .kalshi-market-tile-odds .ind,#page-betting .kalshi-market-tile-odds .independent,#page-betting .kalshi-market-tile-odds .osborn{background:${PURPLE_LIGHT}!important;color:${PURPLE}!important;border-color:${PURPLE}!important}
    `;
    document.head.appendChild(s);
  }

  function fixHomeStats(){
    const root=document.getElementById('page-home');
    if(!root) return;
    const metrics=root.querySelector('.reference-metrics')||root;
    for(const card of [...metrics.children]){
      const t=norm(card.textContent).toLowerCase();
      if(t.includes('polls')&&t.includes('entered')){
        for(const el of card.querySelectorAll('*')) if(el.children.length===0&&/^13$/.test(norm(el.textContent))) el.textContent='88';
      }
      if(t.includes('latest')&&t.includes('update')){
        for(const el of card.querySelectorAll('*')) if(el.children.length===0&&/^(sep\.?\s*6,\s*2026|2026-09-06)$/i.test(norm(el.textContent))) el.textContent='Sep 7, 2026';
      }
    }
    for(const el of root.querySelectorAll('*')){
      if(el.children.length!==0) continue;
      const t=norm(el.textContent);
      if(/^13$/.test(t)){
        let p=el.parentElement, ok=false;
        for(let i=0;p&&p!==root&&i<5;i++,p=p.parentElement) if(/polls\s*entered/i.test(norm(p.textContent))){ok=true;break;}
        if(ok) el.textContent='88';
      }
      if(/^(sep\.?\s*6,\s*2026|2026-09-06)$/i.test(t)) el.textContent='Sep 7, 2026';
    }
  }

  function forceMaine(){
    try{
      if(typeof stateData!=='undefined'&&stateData&&stateData.ME){
        const m=stateData.ME;
        m.rating='tilt-r';m.predictionParty='Republican';m.prediction='Collins +1.3%';m.updated='2026-09-07';
        if('projectedWinner' in m)m.projectedWinner='Republican';
        if('predictionWinner' in m)m.predictionWinner='Republican';
        if('winner' in m)m.winner='Republican';
      }
    }catch(e){}
    const root=document.getElementById('page-senate');
    if(!root) return;
    const selectors='[data-state="ME"],[data-abbr="ME"],[data-code="ME"],[data-state-abbr="ME"],#ME,#state-ME,[aria-label="Maine"],[aria-label^="Maine "]';
    root.querySelectorAll(selectors).forEach(el=>{
      if(/^(path|polygon|rect)$/i.test(el.tagName||'')) el.style.setProperty('fill',TILT_RED,'important');
      el.querySelectorAll?.('path,polygon,rect').forEach(shape=>shape.style.setProperty('fill',TILT_RED,'important'));
    });
    root.querySelectorAll('svg path,svg polygon,svg rect').forEach(el=>{
      const attrs=['id','class','data-state','data-abbr','data-code','aria-label','name'].map(a=>el.getAttribute(a)||'').join(' ');
      const title=el.querySelector?.('title')?.textContent||'';
      if(/(^|\s)ME(\s|$)|Maine/i.test(attrs+' '+title)) el.style.setProperty('fill',TILT_RED,'important');
    });
    for(const el of root.querySelectorAll('*')){
      if(el.children.length!==0) continue;
      const t=norm(el.textContent);
      if(/^2026-09-06$/.test(t)){
        let p=el.parentElement;
        for(let i=0;p&&p!==root&&i<10;i++,p=p.parentElement){
          if(/\bMaine\b/i.test(norm(p.textContent))){el.textContent='2026-09-07';break;}
        }
      }
    }
  }

  function fixIndependents(){
    const root=document.body;if(!root)return;
    for(const line of root.querySelectorAll('.candidate-line')){
      const party=line.querySelector('.candidate-party');if(!party)continue;
      const color=partyColor(party.textContent);
      line.querySelectorAll('.candidate-name,.candidate-party,.candidate-metrics b,.candidate-metrics strong,.candidate-metrics span').forEach(el=>el.style.setProperty('color',color,'important'));
    }
    for(const bar of root.querySelectorAll('.oddsbar')){
      let panel=bar.parentElement;
      while(panel&&panel!==root){
        const lines=[...panel.querySelectorAll('.candidate-line')];
        if(lines.length>=2){
          const c1=partyColor(lines[0].querySelector('.candidate-party')?.textContent||'');
          const c2=partyColor(lines[1].querySelector('.candidate-party')?.textContent||'');
          bar.querySelector('.oddsbar-a')?.style.setProperty('background',c1,'important');
          bar.querySelector('.oddsbar-b')?.style.setProperty('background',c2,'important');
          break;
        }
        panel=panel.parentElement;
      }
    }
    for(const el of root.querySelectorAll('#page-senate *,#page-polls *,#page-betting *')){
      if(el.children.length!==0||!isIndependent(el.textContent)) continue;
      el.style.setProperty('color',PURPLE,'important');
      const box=el.closest('.candidate-line,.candidate-feed-row,.poll-row,.kalshi-market-tile,.party-badge,.pill,.chip,.tag,.legend-item');
      box?.querySelectorAll('.dot,.swatch,.key,.mini-key,i,[class*="bar"],[class*="segment"]').forEach(mark=>mark.style.setProperty('background',PURPLE,'important'));
    }
  }

  function keyForTab(el){
    let k=el.getAttribute('data-spa-page')||el.getAttribute('data-page-link');
    if(k&&pageMap[k]) return k;
    if(el.hasAttribute('data-governor-link')) return 'governor';
    const t=norm(el.textContent).toLowerCase();
    if(t==='home')return'home';if(t.includes('senate prediction'))return'senate';if(t.includes('governor map'))return'governor';if(t==='new polls')return'polls';if(t==='betting odds')return'betting';if(t.includes('past polling'))return'errors';if(t==='about me')return'about';
    return null;
  }
  function ensureNavController(){
    if(window.__willNavigate) return;
    if(document.querySelector('script[data-final-nav-controller="1"]')) return;
    const s=document.createElement('script');s.src='/navigation-controller.js?v=20260907-1910';s.async=false;s.setAttribute('data-final-nav-controller','1');document.head.appendChild(s);
  }
  function interceptNav(e){
    const el=e.target?.closest?.('.site-header .nav button,.site-header .nav a');
    if(!el)return;
    const k=keyForTab(el);if(!k)return;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    if(window.__willNavigate){window.__willNavigate(k);return;}
    ensureNavController();
    clearTimeout(navWait);navWait=setTimeout(()=>{if(window.__willNavigate)window.__willNavigate(k);},30);
  }

  function enforce(){ensureStyle();fixHomeStats();forceMaine();fixIndependents();ensureNavController();}
  document.addEventListener('click',interceptNav,true);
  enforce();
  let q=false;new MutationObserver(()=>{if(q)return;q=true;requestAnimationFrame(()=>{q=false;enforce();});}).observe(document.body,{childList:true,subtree:true,characterData:true});
  [100,500,1200,2500].forEach(ms=>setTimeout(enforce,ms));
  window.addEventListener('pageshow',enforce);window.addEventListener('focus',enforce);window.addEventListener('resize',enforce);
})();
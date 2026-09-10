(()=>{
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  let renderingSenate=false;

  function ensureStyle(){
    if(document.getElementById('sept9FinalStyle')) return;
    const st=document.createElement('style');
    st.id='sept9FinalStyle';
    st.textContent=`
      #homeForecastSplit{grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;gap:20px!important;align-items:stretch!important}
      #homeForecastSplit .forecast-card{width:100%!important;aspect-ratio:1672/941!important;height:auto!important;min-height:0!important;box-sizing:border-box!important}
      #homeForecastSplit .house-card{padding:0!important;display:flex!important;align-items:center!important;justify-content:center!important}
      #homeForecastSplit .house-card img{width:100%!important;height:100%!important;object-fit:contain!important}
      #homeForecastSplit .senate-card{padding:18px 22px 17px!important;min-height:0!important;justify-content:center!important}
      #homeForecastSplit .senate-title{font-size:clamp(25px,3vw,40px)!important;margin-bottom:15px!important}
      #homeForecastSplit .party-number{font-size:clamp(42px,5.2vw,70px)!important}
      #homeForecastSplit .senate-kicker{font-size:10px!important;margin-bottom:6px!important}
      #homeForecastSplit .senate-tiebreak{top:14px!important;right:16px!important;font-size:8px!important}
      #homeForecastSplit .senate-tiebreak strong{font-size:13px!important}
      #homeForecastSplit .senate-bar{height:18px!important}
      @keyframes sept9LivePulse{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(227,38,54,.45)}50%{opacity:.3;box-shadow:0 0 0 6px rgba(227,38,54,0)}}
      .sept9-live-dot{display:inline-block;width:10px;height:10px;border-radius:50%;background:#e32636;margin-right:9px;vertical-align:middle;animation:sept9LivePulse 1.1s ease-in-out infinite}
      @media(max-width:760px){#homeForecastSplit{grid-template-columns:1fr!important;gap:12px!important}#homeForecastSplit .senate-card{padding:18px!important}#homeForecastSplit .senate-title{font-size:30px!important}#homeForecastSplit .party-number{font-size:54px!important}}
    `;
    document.head.appendChild(st);
  }

  function fixHome(){
    const root=document.getElementById('page-home'); if(!root) return;
    for(const card of root.querySelectorAll('.reference-metrics>*')){
      const t=norm(card.textContent).toLowerCase();
      const leaves=[...card.querySelectorAll('*')].filter(el=>!el.children.length);
      if(t.includes('poll')&&t.includes('entered')){
        const n=leaves.find(el=>/^\d+$/.test(norm(el.textContent))); if(n)n.textContent='93';
      }
      if(t.includes('latest')&&t.includes('update')){
        const d=leaves.find(el=>/2026/.test(norm(el.textContent))); if(d)d.textContent='Sep 9, 2026';
      }
    }
  }

  function fixAbout(){
    const root=document.getElementById('page-about'); if(!root) return;
    for(const el of [...root.querySelectorAll('*')].filter(el=>!el.children.length)){
      const t=norm(el.textContent);
      if(/\b(?:13|89|90|92)\s+polls?\b/i.test(t)) el.textContent=t.replace(/\b(?:13|89|90|92)(?=\s+polls?\b)/i,'93');
      else if(/^(?:13|89|90|92)$/.test(t)&&/poll/i.test(norm(el.parentElement?.textContent))) el.textContent='93';
    }
    const card=root.querySelector('.profile-card')||root.querySelector('.about-profile-card')||root.querySelector('.about-layout')||root;
    if(!root.querySelector('[data-sept9-school]')){
      const school=document.createElement('div');
      school.dataset.sept9School='1';
      school.textContent='Redwood High School · Marin County, California';
      school.style.cssText='margin-top:12px;font-size:13px;font-weight:800;line-height:1.4;color:inherit;opacity:.96';
      card.appendChild(school);
    }
    if(!root.querySelector('[data-sept9-article]')){
      const a=document.createElement('a');
      a.dataset.sept9Article='1';
      a.href='https://thefulcrum.us/civic-engagement-education/illusion-certainty-politics-civic-engagement';
      a.target='_blank';a.rel='noopener';
      a.textContent='Read “The Illusion of Certainty” in The Fulcrum →';
      a.style.cssText='display:inline-block;margin-top:9px;font-size:13px;font-weight:900;line-height:1.4;color:inherit;text-decoration:underline;text-underline-offset:3px';
      card.appendChild(a);
    }
  }

  function fixKalshi(){
    const nav=document.querySelector('.site-header .nav [data-accepted-page="betting"]');
    if(nav) nav.textContent='Live Kalshi Senate Odds';
    const root=document.getElementById('page-betting'); if(!root) return;
    let h=[...root.querySelectorAll('h1,h2,h3')].find(el=>/kalshi|betting odds/i.test(norm(el.textContent)));
    if(!h){
      h=[...root.querySelectorAll('*')].filter(el=>!el.children.length).find(el=>/^(?:live\s+)?kalshi\s+senate\s+odds$|^betting odds$/i.test(norm(el.textContent)));
    }
    if(h&&!h.querySelector('.sept9-live-dot')) h.innerHTML='<span class="sept9-live-dot" aria-hidden="true"></span>Live Kalshi Senate Odds';
  }

  function setTexasAverage(){
    let changed=false;
    try{
      if(typeof stateData!=='undefined'&&stateData?.TX){
        const s=stateData.TX;
        for(const slot of [1,2]){
          const name=norm(s['candidate'+slot]).toLowerCase();
          const key='candidate'+slot+'Poll';
          if(name.includes('talarico')&&String(s[key])!=='47.3'){s[key]='47.3';changed=true;}
          if(name.includes('paxton')&&String(s[key])!=='44.9'){s[key]='44.9';changed=true;}
        }
        if(s.updated!=='2026-09-09'){s.updated='2026-09-09';changed=true;}
      }
    }catch(e){}
    if(changed&&typeof renderSenate==='function'&&!renderingSenate){
      renderingSenate=true;
      try{renderSenate();}catch(e){}finally{renderingSenate=false;}
    }
  }

  function ensureTexasPoll(){
    try{
      if(typeof polls!=='undefined'&&Array.isArray(polls)){
        const exists=polls.some(p=>p&&p.state==='TX'&&p.date==='2026-09-09'&&String(p.pollster||'').toLowerCase().includes('univision'));
        if(!exists){
          polls.push({date:'2026-09-09',state:'TX',pollster:'Univision',sample:'',c1:'James Talarico',c1Pct:'48',c2:'Ken Paxton',c2Pct:'43',notes:'RealClearPolling listing · Talarico +5'});
          if(typeof renderPolls==='function') renderPolls();
        }
      }
    }catch(e){}

    const sec=document.getElementById('julsepPollArchive');
    const list=sec?.querySelector('.jp-list');
    if(sec&&list&&!sec.querySelector('[data-sept9-tx]')){
      const d=document.createElement('div');
      d.className='jp-row'; d.dataset.sept9Tx='1'; d.title='Texas Senate';
      d.innerHTML='<div class="jp-date">Sep 9</div><div class="jp-state">TX</div><div class="jp-pollster">Univision</div><div class="jp-match"><strong>James Talarico</strong> 48% &nbsp;·&nbsp; <strong>Ken Paxton</strong> 43%</div>';
      list.prepend(d);
    }
    if(sec){
      const sub=sec.querySelector('.jp-sub'); if(sub) sub.textContent='93 public general-election matchup polls and snapshots from July 7 through September 9, including alternate matchups that were publicly tested during the period.';
      const count=sec.querySelector('.jp-count'); if(count) count.textContent='93 polls shown';
    }
  }

  function fixWillCallWhite(){
    const root=document.getElementById('page-senate'); if(!root) return;
    const leaves=[...root.querySelectorAll('*')].filter(el=>!el.children.length);
    for(const heading of leaves.filter(el=>/^WILL[’']S CALL$/i.test(norm(el.textContent)))){
      let box=heading.parentElement;
      for(let i=0;box&&box!==root&&i<8;i++,box=box.parentElement){
        const t=norm(box.textContent);
        if(/WILL[’']S CALL/i.test(t)&&/\b(?:Democrat(?:ic)?|Republican)\b/i.test(t)) break;
      }
      if(!box||box===root) continue;
      for(const el of [...box.querySelectorAll('*')].filter(el=>!el.children.length)){
        if(/^(Democrat(?:ic)?|Republican)$/i.test(norm(el.textContent))) el.style.setProperty('color','#fff','important');
      }
    }
  }

  function refreshGovernorFrame(){
    const f=document.querySelector('#accepted-governor iframe');
    if(f&&!f.src.includes('v=20260909-2145')) f.src='/governor.html?embedded=1&v=20260909-2145';
  }

  function apply(){
    ensureStyle();fixHome();fixAbout();fixKalshi();setTexasAverage();ensureTexasPoll();fixWillCallWhite();refreshGovernorFrame();
  }
  apply();
  [80,250,600,1200,2200,4000].forEach(ms=>setTimeout(apply,ms));
  setInterval(apply,1400);
  new MutationObserver(()=>{clearTimeout(window.__sept9FinalTimer);window.__sept9FinalTimer=setTimeout(apply,45);}).observe(document.body,{childList:true,subtree:true,characterData:true});
  window.addEventListener('pageshow',apply);
})();

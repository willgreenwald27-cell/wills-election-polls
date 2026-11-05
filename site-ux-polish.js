(()=>{
  'use strict';
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const leafs=root=>root?[...root.querySelectorAll('*')].filter(el=>el.children.length===0):[];
  let raf=0;

  function ensureStyle(){
    let st=document.getElementById('wgSeatPartyPseudoStyle');
    if(st)return; // Static stylesheet must not be rewritten on every pass.
    if(!st){st=document.createElement('style');st.id='wgSeatPartyPseudoStyle';document.head.appendChild(st);}
    st.textContent=`
      .site-header .nav{position:relative!important;z-index:1001!important}
      .site-header .nav>[data-page-link],.site-header .nav>button{pointer-events:auto!important;position:relative!important;z-index:1002!important}
      #page-senate .balance-count-row{display:grid!important;grid-template-columns:1fr auto 1fr!important;align-items:end!important}
      #page-senate .balance-party{display:flex!important;align-items:baseline!important;gap:8px!important;overflow:visible!important;min-width:0!important}
      #page-senate .balance-party.dem{justify-content:flex-start!important;text-align:left!important}
      #page-senate .balance-party.rep{justify-content:flex-end!important;text-align:right!important}
      #page-senate .balance-party.dem span,#page-senate .balance-party.rep span{display:inline!important;position:static!important;opacity:1!important;visibility:visible!important;white-space:nowrap!important;font-weight:900!important;letter-spacing:1.05px!important;text-transform:uppercase!important}
      #page-senate .balance-party.dem span{order:1!important;color:#2763b8!important}
      #page-senate .balance-party.dem strong{order:2!important}
      #page-senate .balance-party.rep strong{order:1!important}
      #page-senate .balance-party.rep span{order:2!important;color:#bd2937!important}
      #page-senate .compact-forecast-key .key-side.democratic{justify-content:start!important}
      #page-senate .compact-forecast-key .key-side.republican{justify-content:end!important}
      @media(max-width:650px){
        #page-senate .balance-party{gap:4px!important}
        #page-senate .balance-party span{font-size:7px!important;letter-spacing:.55px!important}
        #page-senate .compact-forecast-key .key-side.democratic,#page-senate .compact-forecast-key .key-side.republican{justify-content:start!important}
      }
    `;
  }

  function reorderNav(){
    const nav=document.querySelector('.site-header .nav');
    if(!nav)return;
    // The compact navigation owns its order and keeps secondary links in a separate menu.
    if(nav.dataset.compactNav==='1')return;
    for(const item of [...nav.children]){
      const key=item.dataset.acceptedPage||item.dataset.willPage||item.dataset.spaPage||item.dataset.pageLink;
      if(key==='electionnight'||norm(item.textContent)==='Election Night')item.remove();
    }
    const items=[...nav.children];
    const find=(key,label)=>nav.querySelector(
      '[data-accepted-page="'+key+'"],[data-will-page="'+key+'"],[data-spa-page="'+key+'"],[data-page-link="'+key+'"]'
    )||items.find(el=>norm(el.textContent)===label);
    const fixed=[
      find('home','Home'),
      find('senate','2026 Senate Accuracy'),
      find('swing','Swing State Explanations'),
      find('errors','Past Polling Errors'),
      find('governor','2026 Governor Map'),
      find('polls','New Polls'),
      find('betting','Betting Odds')
    ].filter(Boolean);
    const about=find('about','About Me');
    const trailing=[about].filter(Boolean);
    // Keep the About Me tab last.
    const extras=items.filter(el=>!fixed.includes(el)&&!trailing.includes(el));
    const desired=[...fixed,...extras,...trailing];
    desired.forEach((el,i)=>{
      el.style.setProperty('order',String(i),'important');
      el.style.setProperty('pointer-events','auto','important');
      if(el.tagName==='BUTTON'&&!el.type)el.type='button';
    });
  }

  function installNavClickRepair(){
    if(window.__wgNavClickRepair)return;
    window.__wgNavClickRepair=true;
    document.addEventListener('click',e=>{
      const btn=e.target?.closest?.('.site-header .nav [data-page-link]');
      if(!btn)return;
      const page=btn.getAttribute('data-page-link');
      if(!page)return;
      try{
        if(typeof showPage==='function'){
          e.preventDefault();
          e.stopImmediatePropagation();
          showPage(page);
        }
      }catch(_){}
    },true);
  }

  /* Post-election homepage: one durable update tile, no election-day counters. */
  function electionCountdown(){
    const home=document.getElementById('page-home');
    if(!home)return;
    let style=document.getElementById('wg-post-election-home-cleanup');
    if(!style){
      style=document.createElement('style');
      style.id='wg-post-election-home-cleanup';
      style.textContent=[
        '#page-home #homeElectionCountdown,#page-home #homeSenateTossups,#page-home #homeSenateForecast{display:none!important}',
        '#page-home .reference-latest,#page-home .reference-bottom,#page-home #homeLatestPolls{display:none!important}',
        '#page-home .reference-metrics{display:flex!important;align-items:stretch!important;justify-content:center!important;gap:12px!important;margin:16px auto 26px!important;max-width:1160px!important}',
        '#page-home .reference-metrics>#homeLastUpdated{display:flex!important;flex-direction:column!important;justify-content:center!important;grid-column:auto!important;grid-row:auto!important;width:100%!important;max-width:none!important;min-height:74px!important;box-sizing:border-box!important}',
        '#page-home #homeLastUpdated .wg-metric-value{font-size:clamp(20px,2.5vw,29px)!important;color:#193653!important}',
        '#page-home #wg-forecast-comparison{display:block!important}',
        '#page-home .reference-hero-actions .reference-primary{display:none!important}'
      ].join('');
      document.head.appendChild(style);
    }
    const metrics=home.querySelector('.reference-metrics');
    if(metrics){
      let updated=metrics.querySelector('#homeLastUpdated');
      if(!updated){
        updated=document.createElement('div');
        updated.id='homeLastUpdated';updated.className='wg-home-metric';
        updated.style.cssText='border:1px solid #d9e2ec;border-radius:12px;background:#fff;box-shadow:0 5px 18px rgba(20,34,53,.07);padding:16px;text-align:center';
      }
      const date='November 4, 2026';
      const markup='<span class="wg-metric-label">LAST UPDATED</span><strong class="wg-metric-value">'+date+'</strong>';
      if(updated.innerHTML!==markup)updated.innerHTML=markup;
      if(metrics.childElementCount!==1||metrics.firstElementChild!==updated)metrics.replaceChildren(updated);
      updated.setAttribute('aria-label','Last updated November 4, 2026');
    }
    const obsolete=home.querySelector('.reference-bottom');
    if(obsolete)obsolete.style.setProperty('display','none','important');
    if(typeof renderHomeComparison==='function')renderHomeComparison();
  }

  function renderHomeComparison(){
    const home=document.getElementById('page-home');
    if(!home)return;
    const shell=home.querySelector('.reference-home-shell');
    if(!shell)return;
    let section=home.querySelector('#wg-forecast-comparison');
    if(!section){
      section=document.createElement('section');
      section.id='wg-forecast-comparison';
      section.setAttribute('aria-label','2026 Senate and House prediction versus results comparison');
      const block=(title,subtitle,d,r,u,details)=>'<article class="wg-compare-card '+(u?'result':'prediction')+'"><div class="wg-compare-label">'+title+'</div><div class="wg-compare-sub">'+subtitle+'</div><div class="wg-compare-numbers"><div class="wg-compare-num"><span>Democratic seats</span><strong class="wg-blue">'+d+'</strong></div><div class="wg-compare-num"><span>Republican seats</span><strong class="wg-red">'+r+'</strong></div></div><div class="wg-seats-bar" aria-label="'+d+' Democratic, '+r+' Republican, '+u+' uncalled"><i class="wg-bar-d" style="width:'+(100*d/(d+r+u))+'%"></i><i class="wg-bar-r" style="width:'+(100*r/(d+r+u))+'%"></i>'+(u?'<i class="wg-bar-u" style="width:'+(100*u/(d+r+u))+'%"></i>':'')+'</div><div class="wg-compare-foot">'+details+'</div></article>';
      section.innerHTML='<div class="wg-compare-top"><div class="wg-compare-eyebrow">2026 MIDTERMS · FORECAST VS. RESULTS</div><h2>My predictions vs. the results</h2><p>My final Election Day predictions on the left and the reported November 4 counts on the right. Yellow represents uncalled seats.</p></div>'+
        '<div class="wg-chamber"><h3 class="wg-chamber-title">U.S. Senate</h3><div class="wg-compare-grid">'+
        block('MY PREDICTION','Final forecast · November 3',52,48,0,'100 seats · Prediction archived')+
        block('REPORTED COUNT','November 4 results snapshot',54,44,2,'2 uncalled: Alaska and Mississippi · Democratic caucus includes 2 independents')+
        '</div></div><div class="wg-chamber"><h3 class="wg-chamber-title">U.S. House</h3><div class="wg-compare-grid">'+
        block('MY PREDICTION','Final forecast · November 3',235,200,0,'435 seats · Prediction archived')+
        block('REPORTED COUNT','November 4, 1:14 p.m. ET results snapshot',241,153,41,'41 uncalled · Timestamped snapshot, not a live count')+
        '</div></div><div class="wg-compare-source">Reported counts are a November 4 snapshot, not certified totals. <a href="https://abcnews.go.com/Politics/" target="_blank" rel="noopener">Senate reporting</a> · <a href="https://www.poliwave.com/us/live/midterms-2026/house?office=governors" target="_blank" rel="noopener">House snapshot</a></div>';
    }
    if(section.parentElement!==shell){
      const metrics=shell.querySelector('.reference-metrics');
      if(metrics)metrics.insertAdjacentElement('afterend',section);
      else shell.appendChild(section);
    }
    if(!document.getElementById('wg-forecast-comparison-style')){
      const css=document.createElement('link');css.id='wg-forecast-comparison-style';
      css.rel='stylesheet';css.href='/homepage-prediction-results.css?v=20261104-post-election-cleanup-v2';
      document.head.appendChild(css);
    }
  }

  function keepPartyLabels(){
    ensureStyle();
    const root=document.getElementById('page-senate');if(!root)return;
    root.querySelectorAll('.wg-sticky-party-label').forEach(el=>el.remove());
    root.querySelectorAll('.wg-seat-party-block').forEach(el=>el.classList.remove('wg-seat-party-block','wg-seat-dem','wg-seat-rep'));
    const row=root.querySelector('.balance-count-row');
    const dem=row?.querySelector('.balance-party.dem');
    const majority=row?.querySelector('.balance-majority');
    const rep=row?.querySelector('.balance-party.rep');
    if(row&&dem&&rep){
      if(dem!==row.firstElementChild)row.insertBefore(dem,row.firstElementChild);
      if(majority&&majority.previousElementSibling!==dem)row.insertBefore(majority,rep);
      if(rep!==row.lastElementChild)row.appendChild(rep);
      const ds=dem.querySelector('span');if(ds){if(ds.textContent!=='Democratic')ds.textContent='Democratic';ds.style.removeProperty('opacity');ds.style.removeProperty('visibility');}
      const rs=rep.querySelector('span');if(rs){if(rs.textContent!=='Republican')rs.textContent='Republican';rs.style.removeProperty('opacity');rs.style.removeProperty('visibility');}const dn=dem.querySelector('strong');if(dn&&dn.textContent!=='52')dn.textContent='52';const rn=rep.querySelector('strong');if(rn&&rn.textContent!=='48')rn.textContent='48';
    }
    const key=root.querySelector('.compact-forecast-key');
    const kd=key?.querySelector('.key-side.democratic');
    const kn=key?.querySelector('.key-neutral');
    const kr=key?.querySelector('.key-side.republican');
    if(key&&kd&&kr){const nodes=[...key.children];if(nodes.indexOf(kd)>nodes.indexOf(kr)||(kn&&nodes.indexOf(kn)<nodes.indexOf(kd))){key.appendChild(kd);if(kn)key.appendChild(kn);key.appendChild(kr);}}
  }

  function fixGrahamText(){
    const root=document.getElementById('page-polls');if(!root)return;
    for(const el of leafs(root).filter(x=>x.getClientRects().length&&/^Graham Nordone$/i.test(norm(x.textContent)))){
      el.style.setProperty('color','#17263d','important');
      let card=el.parentElement;
      for(let i=0;card&&card!==root&&i<7;i++,card=card.parentElement){
        if(/Graham Nordone/i.test(norm(card.textContent))&&/Annie Andrews/i.test(norm(card.textContent))){
          const bars=[...card.querySelectorAll('div')].filter(x=>{const r=x.getBoundingClientRect();return r.width>120&&r.height>=4&&r.height<=14;}).sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top);
          const colored=bars.filter(x=>{const bg=getComputedStyle(x).backgroundColor||'';return bg&&!/rgba?\(\s*(?:23[0-9]|24[0-9]|25[0-5])\s*,\s*(?:23[0-9]|24[0-9]|25[0-5])\s*,\s*(?:23[0-9]|24[0-9]|25[0-5])/.test(bg);});
          if(colored[0])colored[0].style.setProperty('background','#bd2937','important');
          if(colored[1])colored[1].style.setProperty('background','#2763b8','important');
          for(const n of leafs(card)){const t=norm(n.textContent);if(t==='45.0%')n.style.setProperty('color','#bd2937','important');if(t==='43.0%')n.style.setProperty('color','#2763b8','important');}
          break;
        }
      }
    }
  }

  function fixKansasOdds(){
    try{
      if(typeof stateData!=='undefined'&&stateData?.KS){
        const ks=stateData.KS;
        const setOdds=(nameKey,oddsKey)=>{const name=norm(ks[nameKey]);if(/Marshall/i.test(name))ks[oddsKey]='49';if(/Hamilton/i.test(name))ks[oddsKey]='51';};
        setOdds('candidate1','candidate1Odds');setOdds('candidate2','candidate2Odds');
      }
    }catch(_){}
    const root=document.getElementById('page-senate');if(!root)return;
    const labels=leafs(root).filter(el=>/^Kansas$/i.test(norm(el.textContent))&&el.getClientRects().length);
    for(const label of labels){
      let box=label.parentElement;
      for(let i=0;box&&box!==root&&i<14;i++,box=box.parentElement){const t=norm(box.textContent);if(/Marshall/i.test(t)&&/Hamilton/i.test(t)&&/(WIN ODDS|STATISTICAL ODDS|WILL[’']S CALL)/i.test(t))break;}
      if(!box||box===root)continue;
      for(const el of leafs(box)){const t=norm(el.textContent);if(/Marshall:\s*\d+(?:\.\d+)?%/i.test(t))el.textContent=t.replace(/\d+(?:\.\d+)?%/,'49%');if(/Hamilton:\s*\d+(?:\.\d+)?%/i.test(t))el.textContent=t.replace(/\d+(?:\.\d+)?%/ ,'51%');}
      const lines=[...box.querySelectorAll('.candidate-line')].filter(el=>el.getClientRects().length),bar=box.querySelector('.oddsbar');
      if(bar&&lines.length>=2){const odds=lines.map(line=>{const name=norm(line.querySelector('.candidate-name')?.textContent);return /Marshall/i.test(name)?49:/Hamilton/i.test(name)?51:null;});const a=bar.querySelector('.oddsbar-a'),b=bar.querySelector('.oddsbar-b');if(a&&odds[0]!=null)a.style.setProperty('width',odds[0]+'%','important');if(b&&odds[1]!=null)b.style.setProperty('width',odds[1]+'%','important');}
    }
  }

  function fixHomeSenateCount(){
    const root=document.getElementById('page-home');if(!root)return;
    const card=root.querySelector('#homeForecastSplit .senate-card,#homeForecastSplit .final-senate-card,.will-senate-card');
    if(!card)return;
    const nums=[...card.querySelectorAll('.party-number,.final-party-number')];
    if(nums[0]&&nums[0].textContent!=='54')nums[0].textContent='54';
    if(nums[1]&&nums[1].textContent!=='44')nums[1].textContent='44';
    const dem=card.querySelector('.senate-bar .dem,.final-bar .dem,.democratic,[data-party="dem"]');
    const rep=card.querySelector('.senate-bar .rep,.final-bar .rep,.republican,[data-party="rep"]');
    if(dem)dem.style.setProperty('width','54%','important');
    if(rep)rep.style.setProperty('width','44%','important');
  }

  function apply(){ensureStyle();reorderNav();electionCountdown();keepPartyLabels();fixGrahamText();fixKansasOdds();fixHomeSenateCount();}
  function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;apply();});}

  installNavClickRepair();apply();
  [80,600].forEach(ms=>setTimeout(apply,ms));
  // One-time initialization and navigation changes replace the old 750ms
  // site-wide reconciliation loop, which caused visible flashes.
  const nav=document.querySelector('.site-header .nav');
  // Navigation updates are handled on actual interactions, not by a loop.
  window.addEventListener('pageshow',apply);window.addEventListener('resize',apply);
  // The displayed integer changes once per hour. Check every minute so an open tab stays accurate.
  // Obsolete hourly election countdown intentionally removed.
})();
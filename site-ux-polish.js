(()=>{
  'use strict';
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const leafs=root=>root?[...root.querySelectorAll('*')].filter(el=>el.children.length===0):[];
  let raf=0;

  function ensureStyle(){
    let st=document.getElementById('wgSeatPartyPseudoStyle');
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
    const nav=document.querySelector('.site-header .nav');if(!nav)return;
    const items=[...nav.children];
    const home=nav.querySelector('[data-page-link="home"]')||items.find(el=>/^Home$/i.test(norm(el.textContent)));
    const senate=nav.querySelector('[data-page-link="senate"]')||items.find(el=>/^2026 Senate Prediction$/i.test(norm(el.textContent)));
    const errors=nav.querySelector('[data-page-link="errors"]')||items.find(el=>/^Past Polling Errors$/i.test(norm(el.textContent)));
    const polls=nav.querySelector('[data-page-link="polls"]')||items.find(el=>/^New Polls$/i.test(norm(el.textContent)));
    const preferred=[home,senate,errors,polls].filter(Boolean);
    preferred.forEach((el,i)=>{el.style.setProperty('order',String(i),'important');el.style.setProperty('pointer-events','auto','important');if(el.tagName==='BUTTON'&&!el.type)el.type='button';});
    items.filter(el=>!preferred.includes(el)).forEach((el,i)=>el.style.setProperty('order',String(10+i),'important'));
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

  function electionCountdown(){
    const now=new Date();
    const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
    const election=new Date(2026,10,3);
    const days=Math.max(0,Math.ceil((election-today)/86400000));

    const senate=document.getElementById('page-senate');
    if(senate){
      for(const el of leafs(senate)){
        const t=norm(el.textContent);
        if(/^Last updated\b/i.test(t)||/^Updated\b/i.test(t))el.textContent=`${days} DAYS UNTIL ELECTION DAY`;
      }
    }

    const home=document.getElementById('page-home');
    const metrics=home?.querySelector('.reference-metrics');
    if(!metrics)return;

    let countdownStyle=document.getElementById('wgElectionCountdownStyle');
    if(!countdownStyle){
      countdownStyle=document.createElement('style');
      countdownStyle.id='wgElectionCountdownStyle';
      countdownStyle.textContent=`
        #page-home .reference-metrics{
          display:grid!important;
          grid-template-columns:repeat(4,minmax(0,1fr))!important;
          width:100%!important;
          max-width:100%!important;
          height:auto!important;
          min-height:0!important;
          overflow:visible!important;
          align-items:stretch!important;
          box-sizing:border-box!important;
        }
        #page-home #homeElectionCountdown{
          width:100%!important;
          max-width:100%!important;
          min-width:0!important;
          height:auto!important;
          min-height:96px!important;
          overflow:visible!important;
          padding:14px 16px!important;
          box-sizing:border-box!important;
        }
        #page-home #homeElectionCountdown .wg-election-label,
        #page-home #homeElectionCountdown .wg-election-days,
        #page-home #homeElectionCountdown .wg-election-copy{
          max-width:100%!important;
          overflow:visible!important;
          text-overflow:clip!important;
        }
        #page-home #homeElectionCountdown .wg-election-copy{
          white-space:normal!important;
          overflow-wrap:anywhere!important;
        }
        @media(max-width:900px){
          #page-home .reference-metrics{grid-template-columns:repeat(2,minmax(0,1fr))!important;}
        }
        @media(max-width:650px){
          #page-home .reference-metrics{grid-template-columns:1fr!important;}
          #page-home #homeElectionCountdown{min-height:88px!important;}
          #page-home #homeElectionCountdown .wg-election-days{font-size:29px!important;}
        }
      `;
      document.head.appendChild(countdownStyle);
    }

    let card=metrics.querySelector('#homeElectionCountdown');
    if(!card){
      card=document.createElement('div');
      card.id='homeElectionCountdown';
      card.className='wg-election-countdown';
      card.innerHTML='<span class="wg-election-label">ELECTION DAY</span><strong class="wg-election-days"></strong><small class="wg-election-copy">days until Nov. 3, 2026</small>';
      card.style.cssText='box-sizing:border-box;border:1px solid #d9dee7;border-radius:14px;background:#fff;box-shadow:0 5px 16px rgba(20,34,53,.05);display:flex;flex-direction:column;justify-content:center;width:100%;max-width:100%;min-width:0;height:auto;min-height:96px;overflow:visible;padding:14px 16px;';
      const label=card.querySelector('.wg-election-label');
      const number=card.querySelector('.wg-election-days');
      const copy=card.querySelector('.wg-election-copy');
      if(label)label.style.cssText='display:block;color:#6d7c91;font:900 9px/1.2 Inter,ui-sans-serif,system-ui,sans-serif;letter-spacing:1.35px;text-transform:uppercase;margin-bottom:3px;';
      if(number)number.style.cssText='display:block;color:#17263d;font:900 31px/.95 Georgia,serif;';
      if(copy)copy.style.cssText='display:block;color:#6d7c91;font:700 10px/1.25 Inter,ui-sans-serif,system-ui,sans-serif;margin-top:4px;';
      metrics.appendChild(card);
    }
    const number=card.querySelector('.wg-election-days');
    if(number)number.textContent=String(days);
    card.setAttribute('aria-label',`${days} days until Election Day, November 3, 2026`);
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
      const ds=dem.querySelector('span');if(ds){ds.textContent='Democratic';ds.style.removeProperty('opacity');ds.style.removeProperty('visibility');}
      const rs=rep.querySelector('span');if(rs){rs.textContent='Republican';rs.style.removeProperty('opacity');rs.style.removeProperty('visibility');}const dn=dem.querySelector('strong');if(dn)dn.textContent='51';const rn=rep.querySelector('strong');if(rn)rn.textContent='49';
    }
    const key=root.querySelector('.compact-forecast-key');
    const kd=key?.querySelector('.key-side.democratic');
    const kn=key?.querySelector('.key-neutral');
    const kr=key?.querySelector('.key-side.republican');
    if(key&&kd&&kr){key.appendChild(kd);if(kn)key.appendChild(kn);key.appendChild(kr);}
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
        const setOdds=(nameKey,oddsKey)=>{const name=norm(ks[nameKey]);if(/Marshall/i.test(name))ks[oddsKey]='71';if(/Hamilton/i.test(name))ks[oddsKey]='29';};
        setOdds('candidate1','candidate1Odds');setOdds('candidate2','candidate2Odds');
      }
    }catch(_){}
    const root=document.getElementById('page-senate');if(!root)return;
    const labels=leafs(root).filter(el=>/^Kansas$/i.test(norm(el.textContent))&&el.getClientRects().length);
    for(const label of labels){
      let box=label.parentElement;
      for(let i=0;box&&box!==root&&i<14;i++,box=box.parentElement){const t=norm(box.textContent);if(/Marshall/i.test(t)&&/Hamilton/i.test(t)&&/(WIN ODDS|STATISTICAL ODDS|WILL[’']S CALL)/i.test(t))break;}
      if(!box||box===root)continue;
      for(const el of leafs(box)){const t=norm(el.textContent);if(/Marshall:\s*\d+(?:\.\d+)?%/i.test(t))el.textContent=t.replace(/\d+(?:\.\d+)?%/,'71%');if(/Hamilton:\s*\d+(?:\.\d+)?%/i.test(t))el.textContent=t.replace(/\d+(?:\.\d+)?%/,'29%');}
      const lines=[...box.querySelectorAll('.candidate-line')].filter(el=>el.getClientRects().length),bar=box.querySelector('.oddsbar');
      if(bar&&lines.length>=2){const odds=lines.map(line=>{const name=norm(line.querySelector('.candidate-name')?.textContent);return /Marshall/i.test(name)?71:/Hamilton/i.test(name)?29:null;});const a=bar.querySelector('.oddsbar-a'),b=bar.querySelector('.oddsbar-b');if(a&&odds[0]!=null)a.style.setProperty('width',odds[0]+'%','important');if(b&&odds[1]!=null)b.style.setProperty('width',odds[1]+'%','important');}
    }
  }

  function fixHomeSenateCount(){
    const root=document.getElementById('page-home');if(!root)return;
    const senateLabels=leafs(root).filter(el=>/senate/i.test(norm(el.textContent)));
    let card=null;
    for(const label of senateLabels){
      let node=label.parentElement;
      for(let i=0;node&&node!==root&&i<12;i++,node=node.parentElement){
        const fifties=leafs(node).filter(el=>norm(el.textContent)==='50');
        if(fifties.length===2){card=node;break;}
      }
      if(card)break;
    }
    if(!card)return;
    const fifties=leafs(card).filter(el=>norm(el.textContent)==='50');
    if(fifties.length===2){
      fifties[0].textContent='51';
      fifties[1].textContent='49';
    }
  }

  function apply(){ensureStyle();reorderNav();electionCountdown();keepPartyLabels();fixGrahamText();fixKansasOdds();fixHomeSenateCount();}
  function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;apply();});}

  installNavClickRepair();apply();
  [25,75,150,300,600,1000,1800,3200].forEach(ms=>setTimeout(apply,ms));
  setInterval(apply,750);
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','style']});
  window.addEventListener('pageshow',apply);window.addEventListener('resize',apply);
})();
(()=>{
  'use strict';
  const BLUE='#2763b8', RED='#bd2937', TILT_BLUE='#d3e2f7';
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const leafs=root=>root?[...root.querySelectorAll('*')].filter(el=>el.children.length===0):[];
  let queued=false, senateWrapped=false, homeWrapped=false;

  function ensureStyle(){
    let st=document.getElementById('wgStableSenateStyle');
    if(!st){st=document.createElement('style');st.id='wgStableSenateStyle';document.head.appendChild(st);}
    st.textContent=`
      .site-header .nav{position:relative!important;z-index:1001!important}
      .site-header .nav>[data-page-link],.site-header .nav>[data-accepted-page],.site-header .nav>button{pointer-events:auto!important;position:relative!important;z-index:1002!important}
      #page-senate .balance-count-row{display:grid!important;grid-template-columns:1fr auto 1fr!important;align-items:end!important}
      #page-senate .balance-party{display:flex!important;align-items:baseline!important;gap:8px!important;overflow:visible!important;min-width:0!important}
      #page-senate .balance-party.dem{justify-content:flex-start!important;text-align:left!important}
      #page-senate .balance-party.rep{justify-content:flex-end!important;text-align:right!important}
      #page-senate .balance-party.dem span{order:1!important;color:${BLUE}!important}
      #page-senate .balance-party.dem strong{order:2!important}
      #page-senate .balance-party.rep strong{order:1!important}
      #page-senate .balance-party.rep span{order:2!important;color:${RED}!important}
      #page-senate .balance-party span{display:inline!important;opacity:1!important;visibility:visible!important;white-space:nowrap!important;font-weight:900!important;text-transform:uppercase!important}
      @media(max-width:650px){#page-senate .balance-party{gap:4px!important}#page-senate .balance-party span{font-size:7px!important;letter-spacing:.55px!important}}
    `;
  }

  function reorderNav(){
    const nav=document.querySelector('.site-header .nav');if(!nav)return;
    const items=[...nav.children];
    const byText=re=>items.find(el=>re.test(norm(el.textContent)));
    const home=nav.querySelector('[data-page-link="home"],[data-accepted-page="home"]')||byText(/^Home$/i);
    const senate=nav.querySelector('[data-page-link="senate"],[data-accepted-page="senate"]')||byText(/^2026 Senate Prediction$/i);
    const errors=nav.querySelector('[data-page-link="errors"],[data-accepted-page="errors"]')||byText(/^Past Polling Errors$/i);
    const polls=nav.querySelector('[data-page-link="polls"],[data-accepted-page="polls"]')||byText(/^New Polls$/i);
    const preferred=[home,senate,errors,polls].filter(Boolean);
    preferred.forEach((el,i)=>{el.style.setProperty('order',String(i),'important');el.style.setProperty('pointer-events','auto','important');if(el.tagName==='BUTTON')el.type='button';});
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
      try{if(typeof showPage==='function'){e.preventDefault();showPage(page);setTimeout(apply,0);}}catch(_){}
    },true);
  }

  function setTexasData(){
    try{
      if(typeof stateData==='undefined'||!stateData?.TX)return;
      const tx=stateData.TX;
      tx.rating='tilt-d';
      tx.predictionParty='Democratic';
      tx.callParty='Democratic';
      tx.prediction='Tilt Democratic';
      tx.notes='';
      tx.updated='2026-09-15';
      for(const k of ['projectedWinner','predictionWinner','winner'])if(k in tx)tx[k]='Democratic';
      if('call' in tx)tx.call='Tilt Democratic';
    }catch(_){}
  }

  function texasMapNodes(root){
    return root.querySelectorAll('[data-state="TX"],[data-state="TX"] path,[data-abbr="TX"],[data-abbr="TX"] path,[data-state-abbr="TX"],[data-state-abbr="TX"] path,#TX,#TX path,#state-TX,#state-TX path');
  }

  function findStatePanel(root,stateName){
    const labels=leafs(root).filter(el=>new RegExp('^'+stateName+'$','i').test(norm(el.textContent))&&el.getClientRects().length);
    for(const label of labels){
      let box=label.parentElement;
      for(let i=0;box&&box!==root&&i<14;i++,box=box.parentElement){
        const t=norm(box.textContent);
        if(/WILL[’']S CALL|MY PREDICTION|MY PROJECTED WINNER/i.test(t)&&/POLL AVERAGE|AVG POLLS|WIN ODDS|STATISTICAL ODDS/i.test(t))return box;
      }
    }
    return null;
  }

  function fixTexasVisual(){
    const root=document.getElementById('page-senate');if(!root)return;
    texasMapNodes(root).forEach(el=>{
      if(el.namespaceURI==='http://www.w3.org/2000/svg'||/^(path|polygon|rect)$/i.test(el.tagName||''))el.style.setProperty('fill',TILT_BLUE,'important');
      else el.style.setProperty('background-color',TILT_BLUE,'important');
    });
    const box=findStatePanel(root,'Texas');if(!box)return;
    const ls=leafs(box);
    for(const el of ls){
      const t=norm(el.textContent);
      if(/^Tilt (?:Republican|Democratic)$/i.test(t))el.textContent='Tilt Democratic';
      if(/^Prediction:\s*/i.test(t))el.textContent='Prediction: Tilt Democratic';
    }
    const callIndex=ls.findIndex(el=>/^WILL[’']S CALL$/i.test(norm(el.textContent)));
    if(callIndex>=0){
      const party=ls.slice(callIndex+1,callIndex+12).find(el=>/^(Democrat(?:ic)?|Republican)$/i.test(norm(el.textContent)));
      if(party){party.textContent='Democratic';party.style.setProperty('color','#fff','important');}
      const copy=box.querySelector('.prediction-copy');if(copy)copy.textContent='Tilt Democratic';
    }
    [...box.querySelectorAll('div,p,section,aside')].forEach(el=>{
      const t=norm(el.textContent);
      if(/^WHY MY FORECAST DIFFERS/i.test(t)||/^Why my forecast differs/i.test(t))el.remove();
    });
  }

  function isYellow(bg){
    const m=String(bg||'').match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);if(!m)return false;
    const r=+m[1],g=+m[2],b=+m[3];return r>150&&g>130&&b<150&&Math.abs(r-g)<100;
  }

  function paintTwoPartyBar(bar){
    if(!bar)return;
    bar.style.setProperty('background',`linear-gradient(to right,${BLUE} 0%,${BLUE} 51%,${RED} 51%,${RED} 100%)`,'important');
    bar.style.setProperty('background-color','transparent','important');
    for(const ch of [...bar.children]){
      const cls=String(ch.className?.baseVal||ch.className||'').toLowerCase();
      if(/majority|marker|line|label|text/.test(cls)||ch.tagName==='B')continue;
      if(/(^|[-_ ])dem(ocrat|ocratic)?($|[-_ ])/.test(cls)){
        ch.style.setProperty('display','block','important');ch.style.setProperty('width','51%','important');ch.style.setProperty('flex','0 0 51%','important');ch.style.setProperty('background',BLUE,'important');continue;
      }
      if(/(^|[-_ ])rep(ublican)?($|[-_ ])/.test(cls)){
        ch.style.setProperty('display','block','important');ch.style.setProperty('width','49%','important');ch.style.setProperty('flex','0 0 49%','important');ch.style.setProperty('background',RED,'important');continue;
      }
      if(/toss|neutral|independent|middle|uncalled/.test(cls)||isYellow(getComputedStyle(ch).backgroundColor)){
        ch.style.setProperty('display','none','important');ch.style.setProperty('width','0','important');ch.style.setProperty('flex','0 0 0','important');continue;
      }
      if(!norm(ch.textContent)){
        ch.style.setProperty('background','transparent','important');
        ch.style.setProperty('background-color','transparent','important');
      }
    }
  }

  function senateBalanceBars(root){
    const set=new Set(root.querySelectorAll('.senate-bar,.forecast-bar,.seat-bar,.balance-bar,.senate-balance-bar,.seat-balance-bar,.balance-track,[class*="senate-bar"],[class*="seat-bar"],[class*="balance-bar"],[class*="balance-track"]'));
    const map=root.querySelector('svg');const mapTop=map?.getBoundingClientRect().top||Infinity;
    for(const el of root.querySelectorAll('div,span')){
      const cls=String(el.className||'').toLowerCase();if(!/(bar|balance|seat)/.test(cls))continue;
      const r=el.getBoundingClientRect();
      if(r.width>280&&r.height>=5&&r.height<=36&&r.top<mapTop+10)set.add(el);
    }
    return [...set];
  }

  function setPartyNumber(root,party,value){
    const label=leafs(root).find(el=>new RegExp('^'+party+'$','i').test(norm(el.textContent)));if(!label)return;
    let box=label.parentElement;
    for(let i=0;box&&box!==root&&i<6;i++,box=box.parentElement){
      const n=leafs(box).find(el=>/^\d+$/.test(norm(el.textContent)));if(n){n.textContent=String(value);return;}
    }
  }

  function fixSenateBalance(){
    const root=document.getElementById('page-senate');if(!root)return;
    const d=root.querySelector('.balance-party.dem strong');const r=root.querySelector('.balance-party.rep strong');
    if(d)d.textContent='51';else setPartyNumber(root,'DEMOCRATIC','51');
    if(r)r.textContent='49';else setPartyNumber(root,'REPUBLICAN','49');
    for(const el of leafs(root)){
      const t=norm(el.textContent);
      if(/^\d+\s+(?:TOSSUPS?|INDEPENDENT)$/i.test(t))el.textContent='0 TOSSUP';
    }
    senateBalanceBars(root).forEach(paintTwoPartyBar);
  }

  function findHomeSenateCard(root){
    const direct=root.querySelector('#homeForecastSplit .final-senate-card,#homeForecastSplit .senate-card,.will-senate-card,.final-senate-card');if(direct)return direct;
    const title=leafs(root).find(el=>/^(?:Will[’']s )?Senate Prediction$/i.test(norm(el.textContent)));if(!title)return null;
    let card=title.parentElement;
    for(let i=0;card&&card!==root&&i<9;i++,card=card.parentElement){const t=norm(card.textContent);if(/Democrat/i.test(t)&&/Republican/i.test(t))return card;}
    return null;
  }

  function fixHome(){
    const root=document.getElementById('page-home');if(!root)return;
    for(const card of root.querySelectorAll('.reference-metrics>*')){
      if(!/latest\s+update/i.test(norm(card.textContent)))continue;
      for(const el of leafs(card))if(/2026/.test(norm(el.textContent)))el.textContent='Sep 15, 2026';
    }
    const card=findHomeSenateCard(root);if(!card)return;
    const demNum=card.querySelector('.final-party-number.dem');const repNum=card.querySelector('.final-party-number.rep');
    if(demNum)demNum.textContent='51';if(repNum)repNum.textContent='49';
    const nums=[...card.querySelectorAll('.party-number,.final-party-number')];
    if(!demNum&&nums[0])nums[0].textContent='51';if(!repNum&&nums[1])nums[1].textContent='49';
    const splitDem=card.querySelector('.will-split-parties .dem');const splitRep=card.querySelector('.will-split-parties .rep');
    if(splitDem)splitDem.textContent='DEMOCRATS: 51';if(splitRep)splitRep.textContent='REPUBLICANS: 49';
    for(const el of leafs(card)){
      const t=norm(el.textContent);
      if(/^Democrats?:\s*\d+$/i.test(t))el.textContent=t.replace(/\d+$/,'51');
      if(/^Republicans?:\s*\d+$/i.test(t))el.textContent=t.replace(/\d+$/,'49');
      if(/^\d+ seats$/i.test(t)){const p=norm(el.parentElement?.textContent||'');if(/Democrat/i.test(p))el.textContent='51 seats';if(/Republican/i.test(p))el.textContent='49 seats';}
    }
    const labels=card.querySelectorAll('.will-split-bar-labels strong');if(labels[0])labels[0].textContent='51';if(labels[1])labels[1].textContent='49';
    card.querySelectorAll('.final-bar,.senate-bar,.will-split-bar,.balance-bar').forEach(paintTwoPartyBar);
  }

  function fixKansasOdds(){
    try{
      if(typeof stateData!=='undefined'&&stateData?.KS){
        const ks=stateData.KS;
        for(const slot of [1,2]){const name=norm(ks['candidate'+slot]);if(/Marshall/i.test(name))ks['candidate'+slot+'Odds']='77';if(/Hamilton/i.test(name))ks['candidate'+slot+'Odds']='23';}
      }
    }catch(_){}
  }

  function fixGrahamText(){
    const root=document.getElementById('page-polls');if(!root)return;
    for(const el of leafs(root).filter(x=>/^Graham Nordone$/i.test(norm(x.textContent))))el.style.setProperty('color','#17263d','important');
  }

  function fixPartyLabels(){
    const root=document.getElementById('page-senate');if(!root)return;
    const row=root.querySelector('.balance-count-row');const dem=row?.querySelector('.balance-party.dem');const rep=row?.querySelector('.balance-party.rep');const maj=row?.querySelector('.balance-majority');
    if(row&&dem&&rep){const ds=dem.querySelector('span');const rs=rep.querySelector('span');if(ds)ds.textContent='Democratic';if(rs)rs.textContent='Republican';if(dem!==row.firstElementChild)row.insertBefore(dem,row.firstElementChild);if(maj&&maj.previousElementSibling!==dem)row.insertBefore(maj,rep);if(rep!==row.lastElementChild)row.appendChild(rep);}
  }

  function afterSenate(){setTexasData();fixTexasVisual();fixSenateBalance();fixPartyLabels();fixKansasOdds();}
  function afterHome(){fixHome();}

  function wrapRenderers(){
    try{
      if(!senateWrapped&&typeof window.renderSenate==='function'){
        const old=window.renderSenate;if(!old.__wgStableSenate){
          const fn=function(){setTexasData();const out=old.apply(this,arguments);requestAnimationFrame(afterSenate);return out;};fn.__wgStableSenate=true;window.renderSenate=fn;
        }
        senateWrapped=true;
      }
      if(!homeWrapped&&typeof window.renderHomeDashboard==='function'){
        const old=window.renderHomeDashboard;if(!old.__wgStableHome){const fn=function(){const out=old.apply(this,arguments);requestAnimationFrame(afterHome);return out;};fn.__wgStableHome=true;window.renderHomeDashboard=fn;}homeWrapped=true;
      }
    }catch(_){}
  }

  function apply(){ensureStyle();reorderNav();setTexasData();wrapRenderers();afterSenate();afterHome();fixGrahamText();}
  function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply();});}

  installNavClickRepair();
  apply();
  [60,220,700,1500,3000].forEach(ms=>setTimeout(apply,ms));
  document.addEventListener('mouseover',e=>{if(e.target?.closest?.('#page-senate [data-state="TX"],#page-senate [data-abbr="TX"],#page-senate #TX,#page-senate #state-TX'))setTimeout(afterSenate,0);},true);
  document.addEventListener('click',e=>{if(e.target?.closest?.('.site-header .nav'))setTimeout(queue,0);},true);
  window.addEventListener('pageshow',apply);
  window.addEventListener('resize',()=>{fixSenateBalance();fixHome();});
})();

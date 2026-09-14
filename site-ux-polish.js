(()=>{
  'use strict';
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const leafs=root=>root?[...root.querySelectorAll('*')].filter(el=>el.children.length===0):[];
  let raf=0;

  function ensureStyle(){
    let st=document.getElementById('wgSeatPartyPseudoStyle');
    if(!st){st=document.createElement('style');st.id='wgSeatPartyPseudoStyle';document.head.appendChild(st);}
    st.textContent=`
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
      #page-senate .wg-final-no-tossup{display:none!important}
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
    const home=items.find(el=>/^Home$/i.test(norm(el.textContent)));
    const errors=items.find(el=>/^Past Polling Errors$/i.test(norm(el.textContent)));
    if(home&&errors&&home.nextElementSibling!==errors)nav.insertBefore(errors,home.nextElementSibling);
  }

  function electionCountdown(){
    const root=document.getElementById('page-senate');if(!root)return;
    const now=new Date();
    const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
    const election=new Date(2026,10,3);
    const days=Math.max(0,Math.ceil((election-today)/86400000));
    for(const el of leafs(root)){
      const t=norm(el.textContent);
      if(/^Last updated\b/i.test(t)||/^Updated\b/i.test(t))el.textContent=`${days} DAYS UNTIL ELECTION DAY`;
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
      const ds=dem.querySelector('span');if(ds){ds.textContent='Democratic';ds.style.removeProperty('opacity');ds.style.removeProperty('visibility');}
      const rs=rep.querySelector('span');if(rs){rs.textContent='Republican';rs.style.removeProperty('opacity');rs.style.removeProperty('visibility');}
    }

    const key=root.querySelector('.compact-forecast-key');
    const kd=key?.querySelector('.key-side.democratic');
    const kn=key?.querySelector('.key-neutral');
    const kr=key?.querySelector('.key-side.republican');
    if(key&&kd&&kr){
      key.appendChild(kd);
      if(kn)key.appendChild(kn);
      key.appendChild(kr);
    }
  }

  function forceFinalPrediction(){
    const BLUE_TILT='#d3e2f7';
    try{
      if(typeof stateData!=='undefined'&&stateData){
        for(const abbr of ['TX','OH']){
          const s=stateData[abbr];if(!s)continue;
          s.rating='tilt-d';
          s.predictionParty='Democratic';
          s.prediction='Tilt Democratic';
          s.notes='';
          s.updated='2026-09-13';
          const p1=String(s.candidate1Party||'').toLowerCase();
          const p2=String(s.candidate2Party||'').toLowerCase();
          const dem=p1.includes('dem')?s.candidate1:(p2.includes('dem')?s.candidate2:'Democratic');
          if('projectedWinner' in s)s.projectedWinner=dem;
          if('predictionWinner' in s)s.predictionWinner=dem;
          if('winner' in s)s.winner=dem;
          if('callParty' in s)s.callParty='Democratic';
          if('call' in s)s.call='Tilt Democratic';
        }
      }
    }catch(e){}

    const senate=document.getElementById('page-senate');
    if(senate){
      for(const abbr of ['TX','OH']){
        senate.querySelectorAll(`[data-state="${abbr}"],[data-state="${abbr}"] path,[data-abbr="${abbr}"],[data-abbr="${abbr}"] path,[data-state-abbr="${abbr}"],[data-state-abbr="${abbr}"] path,#${abbr},#${abbr} path,#state-${abbr},#state-${abbr} path`).forEach(el=>{
          el.style.setProperty('fill',BLUE_TILT,'important');
          if(el.namespaceURI!=='http://www.w3.org/2000/svg'&&!/^(path|polygon|rect)$/i.test(el.tagName||''))el.style.setProperty('background',BLUE_TILT,'important');
        });
      }

      const row=senate.querySelector('.balance-count-row');
      const dem=row?.querySelector('.balance-party.dem');
      const rep=row?.querySelector('.balance-party.rep');
      const dn=dem?.querySelector('strong,.party-number,.final-party-number');
      const rn=rep?.querySelector('strong,.party-number,.final-party-number');
      if(dn)dn.textContent='51';
      if(rn)rn.textContent='49';

      for(const el of leafs(senate)){
        const t=norm(el.textContent);
        if(/^1\s+TOSSUP$/i.test(t)||/^1\s+INDEPENDENT$/i.test(t)){
          el.textContent='';
          el.classList.add('wg-final-no-tossup');
        }
      }
      for(const bar of senate.querySelectorAll('.senate-bar,.forecast-bar,.seat-bar,[class*="senate-bar"],[class*="seat-bar"]')){
        const d=bar.querySelector('.dem'),r=bar.querySelector('.rep');
        if(d)d.style.setProperty('width','51%','important');
        if(r)r.style.setProperty('width','49%','important');
        bar.querySelectorAll('.tossup,.toss-up,[data-tossup]').forEach(el=>el.remove());
      }

      for(const stateName of ['Texas','Ohio']){
        for(const label of leafs(senate).filter(el=>norm(el.textContent)===stateName&&el.getClientRects().length)){
          let box=label.parentElement;
          for(let i=0;box&&box!==senate&&i<14;i++,box=box.parentElement){
            const t=norm(box.textContent);
            if(/WILL[’']S CALL/i.test(t)&&(/AVG POLLS/i.test(t)||/POLL AVERAGE/i.test(t)||/MY PREDICTION/i.test(t)))break;
          }
          if(!box||box===senate)continue;
          for(const el of leafs(box)){
            const t=norm(el.textContent);
            if(/^Prediction:\s*/i.test(t))el.textContent='Prediction: Tilt Democratic';
          }
          const copy=box.querySelector('.prediction-copy');if(copy)copy.textContent='Tilt Democratic';
          const callLeaf=leafs(box).find(el=>/^WILL[’']S CALL$/i.test(norm(el.textContent)));
          if(callLeaf){
            let card=callLeaf.parentElement;
            for(let i=0;card&&card!==box&&i<4;i++,card=card.parentElement){
              const t=norm(card.textContent);if(/WILL[’']S CALL/i.test(t)&&t.length<220)break;
            }
            if(card&&card!==box){
              const vals=leafs(card);
              const party=vals.find(el=>/^(Republican|Democrat(?:ic)?|Tossup)$/i.test(norm(el.textContent)));
              if(party)party.textContent='Democratic';
              const rating=vals.find(el=>/^(TOSSUP|TILT|LEAN|LIKELY|SOLID)(?:\s+(REPUBLICAN|DEMOCRAT(?:IC)?))?$/i.test(norm(el.textContent)));
              if(rating)rating.textContent='TILT DEMOCRATIC';
              const c=card.querySelector('.prediction-copy');if(c)c.textContent='Tilt Democratic';
            }
          }
          for(const heading of leafs(box).filter(el=>/^WHY MY FORECAST DIFFERS$/i.test(norm(el.textContent)))){
            let n=heading.parentElement;
            for(let i=0;n&&n!==box&&i<5;i++,n=n.parentElement){
              const t=norm(n.textContent);
              if(/^WHY MY FORECAST DIFFERS/i.test(t)&&!/WILL[’']S CALL/i.test(t)){n.remove();break;}
            }
          }
        }
      }
    }

    const home=document.getElementById('page-home');
    const card=home?.querySelector('#homeForecastSplit .senate-card,.will-senate-card');
    if(card){
      card.querySelectorAll('.senate-tiebreak,.final-tiebreak,.will-tossup-count').forEach(el=>el.remove());
      const nums=[...card.querySelectorAll('.party-number,.final-party-number')];
      if(nums[0])nums[0].textContent='51';
      if(nums[1])nums[1].textContent='49';
      for(const el of leafs(card)){
        const t=norm(el.textContent);
        if(/^Democrats?:\s*\d+$/i.test(t))el.textContent=t.replace(/\d+$/,'51');
        if(/^Republicans?:\s*\d+$/i.test(t))el.textContent=t.replace(/\d+$/,'49');
        if(/^1\s+TOSSUP$/i.test(t)||/^1\s+INDEPENDENT$/i.test(t)){el.textContent='';el.style.setProperty('display','none','important');}
      }
      for(const el of [...card.querySelectorAll('p,small,.muted,.note,.forecast-note,.senate-note,.senate-explanation,.forecast-explanation')]){
        const t=norm(el.textContent);
        if(t.length>18&&(/(?:prediction|forecast).{0,120}(?:poll|average)/i.test(t)||/(?:poll|average).{0,120}(?:prediction|forecast)/i.test(t)))el.remove();
      }
      const bar=card.querySelector('.senate-bar,.final-bar');
      if(bar){
        const d=bar.querySelector('.dem'),r=bar.querySelector('.rep');
        if(d)d.style.setProperty('width','51%','important');
        if(r)r.style.setProperty('width','49%','important');
        bar.querySelectorAll('.tossup,.toss-up,[data-tossup]').forEach(el=>el.remove());
        bar.setAttribute('aria-label','Senate prediction: 51 Democrats and 49 Republicans');
      }
    }
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
          for(const n of leafs(card)){
            const t=norm(n.textContent);
            if(t==='45.0%')n.style.setProperty('color','#bd2937','important');
            if(t==='43.0%')n.style.setProperty('color','#2763b8','important');
          }
          break;
        }
      }
    }
  }

  function apply(){reorderNav();electionCountdown();keepPartyLabels();forceFinalPrediction();fixGrahamText();}
  function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;apply();});}

  ensureStyle();apply();
  [25,75,150,300,600,1000,1800,3200].forEach(ms=>setTimeout(apply,ms));
  setInterval(apply,80);
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','style']});
  document.addEventListener('mousemove',e=>{if(e.target?.closest?.('#page-senate'))setTimeout(apply,0);},true);
  document.addEventListener('mouseover',e=>{if(e.target?.closest?.('#page-senate'))setTimeout(apply,0);},true);
  window.addEventListener('pageshow',apply);window.addEventListener('resize',apply);
})();
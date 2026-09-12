(()=>{
  'use strict';
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const leafs=root=>root?[...root.querySelectorAll('*')].filter(el=>el.children.length===0):[];
  const TOSSUP='#f2c94c';
  let queued=false,rendering=false;

  function ensureStyle(){
    if(document.getElementById('wgHistoryContextStyle'))return;
    const st=document.createElement('style');
    st.id='wgHistoryContextStyle';
    st.textContent=`
      @media(min-width:900px){
        #page-senate .wg-sticky-party-label{display:inline-block!important;font:900 10px/1 Inter,ui-sans-serif,system-ui,sans-serif!important;letter-spacing:1.15px!important;text-transform:uppercase!important;vertical-align:middle!important}
        #page-senate .wg-sticky-party-label.dem{color:#2763b8!important;margin-right:8px!important}
        #page-senate .wg-sticky-party-label.rep{color:#bd2937!important;margin-left:8px!important}
      }
      @media(max-width:899px){#page-senate .wg-sticky-party-label{display:none!important}}
    `;
    document.head.appendChild(st);
  }

  function removeHistoryContext(){
    document.querySelectorAll('.wg-history-context').forEach(el=>el.remove());
  }

  function syncTexas(){
    try{
      if(typeof stateData==='undefined'||!stateData?.TX)return;
      const tx=stateData.TX;
      let changed=false;
      const set=(k,v)=>{if(String(tx[k]??'')!==String(v)){tx[k]=v;changed=true;}};
      set('rating','tossup');set('predictionParty','Tossup');set('prediction','Tossup');set('notes','');set('updated','2026-09-12');
      for(const k of ['projectedWinner','predictionWinner','winner','callParty'])if(k in tx)set(k,'Tossup');
      if('call' in tx)set('call','Tossup');
      if(changed&&typeof renderSenate==='function'&&!rendering){rendering=true;try{renderSenate();}catch(e){}finally{rendering=false;}}
    }catch(e){}
  }

  function forceTexasVisual(){
    const root=document.getElementById('page-senate');if(!root)return;
    root.querySelectorAll('[data-state="TX"],[data-state="TX"] path,[data-abbr="TX"],[data-abbr="TX"] path,[data-state-abbr="TX"],[data-state-abbr="TX"] path,#TX,#TX path,#state-TX,#state-TX path').forEach(el=>{
      el.style.setProperty('fill',TOSSUP,'important');
      if(el.namespaceURI!=='http://www.w3.org/2000/svg'&&!/^(path|polygon|rect)$/i.test(el.tagName||''))el.style.setProperty('background',TOSSUP,'important');
    });
    const labels=leafs(root).filter(el=>norm(el.textContent)==='Texas'&&el.getClientRects().length);
    for(const label of labels){
      let box=label.parentElement;
      for(let i=0;box&&box!==root&&i<14;i++,box=box.parentElement){
        const t=norm(box.textContent);
        if(/WILL[’']S CALL/i.test(t)&&(/AVG POLLS/i.test(t)||/MY PREDICTION/i.test(t)))break;
      }
      if(!box||box===root)continue;
      const ls=leafs(box);
      for(const el of ls){
        const t=norm(el.textContent);
        if(/^Prediction:\s*/i.test(t))el.textContent='Prediction: Toss-up';
      }
      const callLeaf=ls.find(el=>/^WILL[’']S CALL$/i.test(norm(el.textContent)));
      if(!callLeaf)continue;
      let card=callLeaf.parentElement;
      for(let i=0;card&&card!==box&&i<5;i++,card=card.parentElement){
        const t=norm(card.textContent);
        if(/WILL[’']S CALL/i.test(t)&&t.length<220)break;
      }
      if(!card||card===box)continue;
      card.style.setProperty('background',TOSSUP,'important');
      card.style.setProperty('background-image','none','important');
      card.style.setProperty('border-color','#d9ad22','important');
      card.querySelectorAll('*').forEach(el=>el.style.setProperty('color','#fff','important'));
      const vals=leafs(card);
      const party=vals.find(el=>/^(Republican|Democrat(?:ic)?|Tossup)$/i.test(norm(el.textContent)));
      if(party)party.textContent='Tossup';
      const rating=vals.find(el=>/(TILT|LEAN|LIKELY|SOLID)\s+(REPUBLICAN|DEMOCRAT(?:IC)?)/i.test(norm(el.textContent)));
      if(rating)rating.textContent='TOSSUP';
      const copy=card.querySelector('.prediction-copy');if(copy)copy.textContent='Tossup';
    }
  }

  function forceSenateTotals(){
    const root=document.getElementById('page-senate');if(!root)return;
    const leaves=leafs(root).filter(el=>el.getClientRects().length);
    for(const label of leaves){
      const t=norm(label.textContent);
      if(!/^(REPUBLICAN|DEMOCRAT(?:IC)?)$/i.test(t))continue;
      let branch=label.parentElement;
      if(!branch)continue;
      const n=leafs(branch).find(x=>/^\d+$/.test(norm(x.textContent)));
      if(n)n.textContent='49';
    }
    for(const el of leaves){
      const t=norm(el.textContent);
      if(/^\d+\s+(?:INDEPENDENT|TOSSUPS?)$/i.test(t))el.textContent='2 TOSSUPS';
    }
    root.querySelectorAll('.senate-bar,.forecast-bar,.seat-bar,[class*="senate-bar"],[class*="seat-bar"]').forEach(bar=>{
      const d=bar.querySelector('.dem'),r=bar.querySelector('.rep');
      if(d)d.style.setProperty('width','49%','important');
      if(r)r.style.setProperty('width','49%','important');
      let y=bar.querySelector('.tossup,.toss-up,[data-tossup]');
      if(!y&&d&&r){y=document.createElement('span');y.className='tossup';bar.appendChild(y);}
      if(y){y.style.setProperty('width','2%','important');y.style.setProperty('background',TOSSUP,'important');y.style.setProperty('display','block','important');}
    });
  }

  function forceHomeTotals(){
    const root=document.getElementById('page-home');if(!root)return;
    const title=leafs(root).find(el=>/^Will[’']s Senate Prediction$/i.test(norm(el.textContent)));
    if(!title)return;
    let card=title.parentElement;
    for(let i=0;card&&card!==root&&i<8;i++,card=card.parentElement){
      const t=norm(card.textContent);
      if(/Democrats/i.test(t)&&/Republicans/i.test(t))break;
    }
    if(!card||card===root)return;
    const nums=[...card.querySelectorAll('.party-number,.final-party-number')];
    if(nums.length>=2){nums[0].textContent='49';nums[1].textContent='49';}
    for(const el of leafs(card)){
      const t=norm(el.textContent);
      if(/^Democrats?:\s*\d+$/i.test(t))el.textContent=t.replace(/\d+$/,'49');
      if(/^Republicans?:\s*\d+$/i.test(t))el.textContent=t.replace(/\d+$/,'49');
      if(/^\d+\s+(?:INDEPENDENT|TOSSUPS?)$/i.test(t))el.textContent='2 TOSSUPS';
    }
    const bar=card.querySelector('.senate-bar,.final-bar');
    if(bar){
      const d=bar.querySelector('.dem'),r=bar.querySelector('.rep');
      if(d)d.style.setProperty('width','49%','important');
      if(r)r.style.setProperty('width','49%','important');
      let y=bar.querySelector('.tossup,.toss-up,[data-tossup]');
      if(!y&&d&&r){y=document.createElement('span');y.className='tossup';bar.appendChild(y);}
      if(y){y.style.setProperty('width','2%','important');y.style.setProperty('background',TOSSUP,'important');y.style.setProperty('display','block','important');}
      bar.setAttribute('aria-label','Senate prediction: 49 Democrats, 49 Republicans, and 2 tossups');
    }
    let note=card.querySelector('.will-tossup-count');
    if(!note){
      note=document.createElement('div');note.className='will-tossup-count';
      const anchor=card.querySelector('.majority-note')||card.querySelector('.senate-countdown')||bar;
      if(anchor)anchor.insertAdjacentElement('afterend',note);
    }
    if(note){note.textContent='2 TOSSUPS';note.style.cssText='margin-top:7px;text-align:center;color:#b58a00;font:900 10px/1.2 Inter,system-ui,sans-serif;letter-spacing:1.2px';}
  }

  function restoreDesktopPartyLabels(){
    const root=document.getElementById('page-senate');if(!root)return;
    root.querySelectorAll('.wg-sticky-party-label').forEach(el=>el.remove());
    if(!window.matchMedia('(min-width:900px)').matches)return;
    const leaves=leafs(root).filter(el=>el.getClientRects().length);
    const marker=leaves.find(el=>/50\s*\+\s*VP\s+FOR\s+MAJORITY/i.test(norm(el.textContent)));
    if(!marker)return;
    let box=marker.parentElement;
    for(let i=0;box&&box!==root&&i<7;i++,box=box.parentElement){
      const t=norm(box.textContent);
      if(/NO ELECTION/i.test(t)&&/\b49\b|\b50\b|\b51\b/.test(t))break;
    }
    if(!box||box===root)return;
    const visibleLeaves=leafs(box).filter(el=>el.getClientRects().length);
    const nums=visibleLeaves.filter(el=>/^\d+$/.test(norm(el.textContent))).sort((a,b)=>a.getBoundingClientRect().left-b.getBoundingClientRect().left);
    if(nums.length<2)return;
    const left=nums[0],right=nums[nums.length-1];
    const near=(el,num)=>Math.abs(el.getBoundingClientRect().left-num.getBoundingClientRect().left)<180&&Math.abs(el.getBoundingClientRect().top-num.getBoundingClientRect().top)<80;
    const hasDem=visibleLeaves.some(el=>/^DEMOCRAT(?:IC)?$/i.test(norm(el.textContent))&&!el.classList.contains('wg-sticky-party-label')&&near(el,left));
    const hasRep=visibleLeaves.some(el=>/^REPUBLICAN$/i.test(norm(el.textContent))&&!el.classList.contains('wg-sticky-party-label')&&near(el,right));
    if(!hasDem){const lab=document.createElement('span');lab.className='wg-sticky-party-label dem';lab.textContent='DEMOCRATIC';left.parentElement?.insertBefore(lab,left);}
    if(!hasRep){const lab=document.createElement('span');lab.className='wg-sticky-party-label rep';lab.textContent='REPUBLICAN';right.parentElement?.appendChild(lab);}
  }

  function apply(){ensureStyle();removeHistoryContext();syncTexas();forceTexasVisual();forceSenateTotals();forceHomeTotals();restoreDesktopPartyLabels();}
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply();});}
  ensureStyle();apply();
  [100,300,800,1600,3200].forEach(ms=>setTimeout(apply,ms));
  setInterval(apply,500);
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','style']});
  window.addEventListener('pageshow',apply);window.addEventListener('resize',apply);
})();

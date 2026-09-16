(()=>{
  'use strict';
  const BLUE='#2763b8', RED='#bd2937', TILT_BLUE='#d3e2f7';
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const leafs=root=>root?[...root.querySelectorAll('*')].filter(el=>el.children.length===0):[];

  function setTexasData(){
    try{
      if(typeof stateData!=='undefined'&&stateData?.TX){
        const tx=stateData.TX;
        tx.rating='tilt-d';
        tx.predictionParty='Democratic';
        tx.callParty='Democratic';
        tx.prediction='Tilt Democratic';
        tx.notes='';
        for(const k of ['projectedWinner','predictionWinner','winner']) if(k in tx) tx[k]='Democratic';
        if('call' in tx) tx.call='Tilt Democratic';
      }
    }catch(_){}
  }

  function fixTexasVisual(){
    const root=document.getElementById('page-senate'); if(!root)return;
    root.querySelectorAll('[data-state="TX"],[data-state="TX"] path,[data-abbr="TX"],[data-abbr="TX"] path,[data-state-abbr="TX"],[data-state-abbr="TX"] path,#TX,#TX path,#state-TX,#state-TX path').forEach(el=>{
      el.style.setProperty('fill',TILT_BLUE,'important');
      if(el.namespaceURI!=='http://www.w3.org/2000/svg'&&!/^(path|polygon|rect)$/i.test(el.tagName||'')) el.style.setProperty('background',TILT_BLUE,'important');
    });
  }

  function setPartyNumber(root,party,value){
    const label=leafs(root).find(el=>new RegExp('^'+party+'$','i').test(norm(el.textContent)));
    if(!label)return;
    let box=label.parentElement;
    for(let i=0;box&&box!==root&&i<6;i++,box=box.parentElement){
      const nums=leafs(box).filter(el=>/^\d+$/.test(norm(el.textContent)));
      if(nums.length){nums[0].textContent=String(value);return;}
    }
  }

  function fixSenateBalance(){
    const root=document.getElementById('page-senate'); if(!root)return;
    const d=root.querySelector('.balance-party.dem strong');
    const r=root.querySelector('.balance-party.rep strong');
    if(d)d.textContent='51'; else setPartyNumber(root,'DEMOCRATIC','51');
    if(r)r.textContent='49'; else setPartyNumber(root,'REPUBLICAN','49');
    for(const el of leafs(root)){
      const t=norm(el.textContent);
      if(/^\d+\s+(?:INDEPENDENT|TOSSUPS?)$/i.test(t))el.textContent='0 TOSSUP';
    }
    root.querySelectorAll('.senate-bar,.balance-bar,.senate-balance-bar').forEach(bar=>{
      bar.style.setProperty('background',`linear-gradient(to right,${BLUE} 0 51%,${RED} 51% 100%)`,'important');
      [...bar.children].forEach(ch=>{
        ch.style.setProperty('background','transparent','important');
        ch.style.setProperty('background-color','transparent','important');
        if(/toss|independent|neutral/i.test(String(ch.className||'')))ch.style.setProperty('display','none','important');
      });
    });
  }

  function findHomeSenateCard(root){
    const direct=root.querySelector('#homeForecastSplit .senate-card,.will-senate-card,.senate-card');
    if(direct)return direct;
    const title=leafs(root).find(el=>/Senate Prediction/i.test(norm(el.textContent)));
    if(!title)return null;
    let card=title.parentElement;
    for(let i=0;card&&card!==root&&i<8;i++,card=card.parentElement){
      const t=norm(card.textContent);
      if(/Democrat/i.test(t)&&/Republican/i.test(t))return card;
    }
    return null;
  }

  function fixHome(){
    const root=document.getElementById('page-home'); if(!root)return;
    const card=findHomeSenateCard(root); if(!card)return;
    const nums=[...card.querySelectorAll('.party-number,.final-party-number')];
    if(nums[0])nums[0].textContent='51';
    if(nums[1])nums[1].textContent='49';
    for(const el of leafs(card)){
      const t=norm(el.textContent);
      if(/^Democrats?:\s*\d+$/i.test(t))el.textContent=t.replace(/\d+$/,'51');
      if(/^Republicans?:\s*\d+$/i.test(t))el.textContent=t.replace(/\d+$/,'49');
      if(/^50$/.test(t)){
        const p=norm(el.parentElement?.textContent||'');
        if(/Democrat/i.test(p))el.textContent='51';
        else if(/Republican/i.test(p))el.textContent='49';
      }
    }
    card.querySelectorAll('.senate-bar,.balance-bar,.senate-balance-bar').forEach(bar=>{
      bar.style.setProperty('background',`linear-gradient(to right,${BLUE} 0 51%,${RED} 51% 100%)`,'important');
      [...bar.children].forEach(ch=>{
        ch.style.setProperty('background','transparent','important');
        ch.style.setProperty('background-color','transparent','important');
        if(/toss|independent|neutral/i.test(String(ch.className||'')))ch.style.setProperty('display','none','important');
      });
    });
  }

  function apply(){setTexasData();fixTexasVisual();fixSenateBalance();fixHome();}
  apply();
  [80,250,700,1500].forEach(ms=>setTimeout(apply,ms));
  let queued=false;
  new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply();});}).observe(document.body,{childList:true,subtree:true,characterData:true});
  window.addEventListener('pageshow',apply);
})();

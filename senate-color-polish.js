(()=>{
  const LIGHT_REP='#e65c66', BLUE='#2763b8', RED='#bd2937', NAVY='#17263d';
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const rgb=s=>{const m=String(s||'').match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);return m?[+m[1],+m[2],+m[3]]:null};
  const isOldRep=c=>{const v=rgb(c);return !!v&&Math.abs(v[0]-189)<=8&&Math.abs(v[1]-41)<=8&&Math.abs(v[2]-55)<=8};
  let rendering=false;

  function inWillsCall(el,root){
    let p=el.parentElement;
    for(let i=0;p&&p!==root&&i<7;i++,p=p.parentElement){
      if(/will[’']s call/i.test(norm(p.textContent))) return true;
    }
    return false;
  }

  function darkAncestor(el,limit=8){
    let p=el;
    for(let i=0;p&&i<limit;i++,p=p.parentElement){
      const c=rgb(getComputedStyle(p).backgroundColor);
      if(c&&((c[0]+c[1]+c[2])/3)<105) return p;
    }
    return null;
  }

  function fixMaineCandidateText(){
    const root=document.getElementById('page-senate');
    if(!root) return;
    const leaves=[...root.querySelectorAll('*')].filter(el=>!el.children.length);
    const jackson=leaves.find(el=>/^Troy Jackson$/i.test(norm(el.textContent))&&darkAncestor(el));
    if(!jackson) return;
    let row=jackson.parentElement;
    for(let i=0;row&&row!==root&&i<6;i++,row=row.parentElement){
      const t=norm(row.textContent);
      if(/Troy Jackson/i.test(t)&&/48\.2%?/.test(t)&&!/Susan Collins/i.test(t)){
        row.querySelectorAll('*').forEach(el=>{
          if(el.children.length) return;
          const v=norm(el.textContent);
          el.style.setProperty('color',/^48\.2%$/.test(v)?BLUE:'#fff','important');
        });
        if(!row.children.length) row.style.setProperty('color','#fff','important');
        break;
      }
    }
    for(const el of leaves){
      const t=norm(el.textContent);
      if(/^(?:Troy Jackson|Democrat|48\.2%)$/i.test(t)&&darkAncestor(el)){
        let p=el.parentElement, ok=false;
        for(let i=0;p&&p!==root&&i<7;i++,p=p.parentElement){
          const tx=norm(p.textContent);
          if(/Maine/i.test(tx)&&/Susan Collins/i.test(tx)){ok=true;break;}
        }
        if(ok) el.style.setProperty('color',/^48\.2%$/.test(t)?BLUE:'#fff','important');
      }
    }
  }

  function fixTexasAverage(){
    try{
      if(typeof stateData==='undefined'||!stateData?.TX) return;
      const s=stateData.TX;
      let changed=false;
      for(const slot of [1,2]){
        const name=norm(s['candidate'+slot]).toLowerCase();
        const key='candidate'+slot+'Poll';
        if(name.includes('talarico')&&String(s[key])!=='47.8'){s[key]='47.8';changed=true;}
        if(name.includes('paxton')&&String(s[key])!=='44.9'){s[key]='44.9';changed=true;}
      }
      if(s.updated!=='2026-09-09'){s.updated='2026-09-09';changed=true;}
      if(changed&&typeof renderSenate==='function'&&!rendering){
        rendering=true;
        try{renderSenate();}catch(e){}finally{rendering=false;}
      }
    }catch(e){}
  }

  function cardMarkup(kind){
    const senate=kind==='senate';
    const title=senate?'Will’s Senate Prediction':'Will’s House of Reps Prediction';
    const kicker=senate?'2026 U.S. Senate':'2026 U.S. House';
    const dem=senate?'49':'228', rep=senate?'51':'207';
    const demW=senate?'49%':'52.4138%', repW=senate?'51%':'47.5862%';
    const note=senate?'51 seats needed for a majority':'218 seats needed for a majority';
    return `<div class="forecast-card final-forecast-card final-${kind}-card">
      ${senate?'<div class="final-tiebreak">Tiebreak vote<strong>JD VANCE</strong></div>':''}
      <div class="final-kicker">${kicker}</div>
      <h2 class="final-title">${title}</h2>
      <div class="final-numbers">
        <div class="final-party"><div class="final-party-label dem">Democrats</div><div class="final-party-number dem">${dem}</div></div>
        <div class="final-party right"><div class="final-party-label rep">Republicans</div><div class="final-party-number rep">${rep}</div></div>
      </div>
      <div class="final-bar"><span class="dem" style="width:${demW}"></span><span class="rep" style="width:${repW}"></span>${senate?'<i class="final-majority-marker senate"></i>':'<i class="final-majority-marker house"></i>'}</div>
      <div class="final-majority-note">${note}</div>
    </div>`;
  }

  function fixHomeForecast(){
    const root=document.getElementById('page-home'); if(!root) return;
    let section=document.getElementById('housePrediction2026');
    if(!section) return;
    section.dataset.splitForecast='1';

    let st=document.getElementById('finalHomeForecastStyle');
    if(!st){st=document.createElement('style');st.id='finalHomeForecastStyle';document.head.appendChild(st);}
    st.textContent=`
      #page-home #housePrediction2026{display:block!important;width:100%!important;margin:28px 0 12px!important}
      #page-home #homeForecastSplit{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:18px!important;align-items:stretch!important;width:100%!important}
      #page-home #homeForecastSplit .final-forecast-card{position:relative!important;aspect-ratio:1672/941!important;width:100%!important;height:auto!important;min-height:0!important;box-sizing:border-box!important;overflow:hidden!important;border:1px solid #dde3ec!important;border-radius:20px!important;background:linear-gradient(135deg,#f7faff 0%,#fff 56%,#fff6f7 100%)!important;box-shadow:0 10px 28px rgba(20,34,53,.08)!important;padding:20px 22px!important;display:grid!important;grid-template-rows:auto minmax(72px,2.15em) 1fr 18px auto!important;align-content:center!important}
      #page-home #homeForecastSplit .final-kicker{font:900 10px/1.2 Inter,ui-sans-serif,system-ui,sans-serif!important;letter-spacing:2px!important;text-transform:uppercase!important;color:#6d7c91!important;margin:0 0 6px!important}
      #page-home #homeForecastSplit .final-title{font:800 clamp(22px,2.55vw,38px)/1 Georgia,serif!important;color:${NAVY}!important;margin:0!important;min-height:72px!important;display:flex!important;align-items:flex-start!important;max-width:88%!important}
      #page-home #homeForecastSplit .final-numbers{display:grid!important;grid-template-columns:1fr 1fr!important;gap:12px!important;align-items:end!important;align-self:end!important;margin:0 0 12px!important}
      #page-home #homeForecastSplit .final-party.right{text-align:right!important}
      #page-home #homeForecastSplit .final-party-label{font:900 12px/1.2 Inter,ui-sans-serif,system-ui,sans-serif!important;letter-spacing:1.1px!important;text-transform:uppercase!important}
      #page-home #homeForecastSplit .final-party-number{font:900 clamp(44px,4.8vw,68px)/.9 Georgia,serif!important;margin-top:5px!important}
      #page-home #homeForecastSplit .dem{color:${BLUE}!important}.rep{color:${RED}!important}
      #page-home #homeForecastSplit .final-bar{position:relative!important;height:18px!important;border-radius:999px!important;overflow:hidden!important;display:flex!important;box-shadow:inset 0 0 0 1px rgba(20,34,53,.08)!important}
      #page-home #homeForecastSplit .final-bar>span{display:block!important;height:100%!important}.final-bar>span.dem{background:${BLUE}!important}.final-bar>span.rep{background:${RED}!important}
      #page-home #homeForecastSplit .final-majority-marker{position:absolute!important;top:-5px!important;width:2px!important;height:28px!important;background:${NAVY}!important;transform:translateX(-1px)!important;opacity:.8!important}.final-majority-marker.house{left:50.1149%!important}.final-majority-marker.senate{left:51%!important}
      #page-home #homeForecastSplit .final-majority-note{margin-top:8px!important;font:800 9px/1.2 Inter,ui-sans-serif,system-ui,sans-serif!important;letter-spacing:1px!important;text-transform:uppercase!important;color:#6c798b!important;text-align:center!important}
      #page-home #homeForecastSplit .final-tiebreak{position:absolute!important;top:14px!important;right:16px!important;color:${RED}!important;font:900 9px/1.2 Inter,ui-sans-serif,system-ui,sans-serif!important;letter-spacing:1.3px!important;text-transform:uppercase!important;text-align:right!important}.final-tiebreak strong{display:block!important;font-size:14px!important;letter-spacing:.4px!important;margin-top:2px!important;color:${RED}!important}
      @media(max-width:760px){#page-home #homeForecastSplit{grid-template-columns:1fr!important;gap:12px!important}#page-home #homeForecastSplit .final-forecast-card{aspect-ratio:1672/941!important;padding:18px!important}#page-home #homeForecastSplit .final-title{font-size:30px!important;min-height:64px!important}#page-home #homeForecastSplit .final-party-number{font-size:54px!important}#page-home #homeForecastSplit .final-tiebreak{top:12px!important;right:12px!important;font-size:7px!important}.final-tiebreak strong{font-size:11px!important}}
    `;

    const desired=cardMarkup('house')+cardMarkup('senate');
    const split=section.querySelector('#homeForecastSplit');
    if(!split){section.innerHTML='<div id="homeForecastSplit">'+desired+'</div>';}
    else if(!split.querySelector('.final-house-card')||!split.querySelector('.final-senate-card')){split.innerHTML=desired;}
  }

  function apply(){
    const root=document.getElementById('page-senate');
    if(root){
      for(const el of root.querySelectorAll('*')){
        const cs=getComputedStyle(el);
        if(isOldRep(cs.color)) el.style.setProperty('color',LIGHT_REP,'important');
      }
      for(const el of root.querySelectorAll('*')){
        if(el.children.length) continue;
        if(/^Democrat$/i.test(norm(el.textContent))&&inWillsCall(el,root)) el.style.setProperty('color','#fff','important');
      }
    }
    fixTexasAverage();
    fixMaineCandidateText();
    fixHomeForecast();
  }

  apply();
  [80,250,600,1200,2200,4000].forEach(ms=>setTimeout(apply,ms));
  setInterval(apply,700);
  new MutationObserver(()=>{clearTimeout(window.__senateColorPolishTimer);window.__senateColorPolishTimer=setTimeout(apply,35)}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});
  window.addEventListener('pageshow',apply);
})();

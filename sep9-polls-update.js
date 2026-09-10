(()=>{
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  let rendering=false;

  function setCandidatePoll(state,last,pct){
    try{
      if(typeof stateData==='undefined'||!stateData?.[state]) return false;
      const s=stateData[state];
      let changed=false;
      for(const slot of [1,2]){
        const name=norm(s['candidate'+slot]).toLowerCase();
        if(!name.includes(last)) continue;
        const key='candidate'+slot+'Poll';
        if(String(s[key])!==String(pct)){s[key]=String(pct);changed=true;}
      }
      if(s.updated!=='2026-09-09'){s.updated='2026-09-09';changed=true;}
      return changed;
    }catch(e){return false;}
  }

  function applyForecastCalls(){
    let changed=false;
    try{
      if(typeof stateData!=='undefined'&&stateData?.NH){
        const nh=stateData.NH;
        if(nh.rating!=='likely-d'){nh.rating='likely-d';changed=true;}
        if(nh.predictionParty!=='Democrat'){nh.predictionParty='Democrat';changed=true;}
        if(nh.updated!=='2026-09-09'){nh.updated='2026-09-09';changed=true;}
      }
      if(typeof stateData!=='undefined'&&stateData?.OH){
        const oh=stateData.OH;
        for(const slot of [1,2]){
          const name=norm(oh['candidate'+slot]).toLowerCase();
          const key='candidate'+slot+'Odds';
          if(name.includes('husted')&&String(oh[key])!=='55'){oh[key]='55';changed=true;}
          if(name.includes('brown')&&String(oh[key])!=='45'){oh[key]='45';changed=true;}
        }
        if(oh.updated!=='2026-09-09'){oh.updated='2026-09-09';changed=true;}
      }
      if(typeof stateData!=='undefined'&&stateData?.MI){
        const mi=stateData.MI;
        if(mi.prediction!=='El-Sayed +1.3%'){mi.prediction='El-Sayed +1.3%';changed=true;}
        if(mi.predictionParty!=='Democrat'){mi.predictionParty='Democrat';changed=true;}
        if('call' in mi&&mi.call!=='El-Sayed +1.3%'){mi.call='El-Sayed +1.3%';changed=true;}
        if(mi.updated!=='2026-09-09'){mi.updated='2026-09-09';changed=true;}
      }
    }catch(e){}
    return changed;
  }

  function applyAverages(){
    let changed=false;
    changed=setCandidatePoll('MI','el-sayed','46.6')||changed;
    changed=setCandidatePoll('MI','rogers','44.7')||changed;
    changed=setCandidatePoll('ME','jackson','48.2')||changed;
    changed=setCandidatePoll('ME','collins','45.8')||changed;
    changed=setCandidatePoll('TX','talarico','47.3')||changed;
    changed=setCandidatePoll('TX','paxton','44.9')||changed;
    changed=applyForecastCalls()||changed;
    if(changed&&typeof renderSenate==='function'&&!rendering){
      rendering=true;
      try{renderSenate();}catch(e){}finally{rendering=false;}
    }
  }

  function ensureNativePolls(){
    try{
      if(typeof polls==='undefined'||!Array.isArray(polls)) return;
      let changed=false;
      const add=obj=>{
        const exists=polls.some(p=>p&&p.state===obj.state&&p.date===obj.date&&String(p.pollster||'')===obj.pollster&&String(p.c1||'')===obj.c1&&String(p.c2||'')===obj.c2);
        if(!exists){polls.push(obj);changed=true;}
      };
      add({date:'2026-09-09',state:'MI',pollster:'CNN',sample:'',c1:'Abdul El-Sayed',c1Pct:'47',c2:'Mike Rogers',c2Pct:'44',notes:'RealClearPolling listing · El-Sayed +3'});
      add({date:'2026-09-09',state:'ME',pollster:'CNN',sample:'',c1:'Troy Jackson',c1Pct:'48',c2:'Susan Collins',c2Pct:'45',notes:'RealClearPolling listing · Jackson +3'});
      add({date:'2026-09-08',state:'TX',pollster:'Univision',sample:'1,000 RV',c1:'James Talarico',c1Pct:'48',c2:'Ken Paxton',c2Pct:'43',notes:'N+ Univision/YouGov · Aug. 27–Sep. 4 · Talarico +5'});
      if(changed&&typeof renderPolls==='function') renderPolls();
    }catch(e){}
  }

  function row(ab,state,pollster,a,av,b,bv,dateLabel='Sep 9'){
    const d=document.createElement('div');
    d.className='jp-row'; d.dataset.sep9cnn=ab;
    d.title=state+' Senate';
    d.innerHTML=`<div class="jp-date"></div><div class="jp-state">${ab}</div><div class="jp-pollster"></div><div class="jp-match"><strong></strong> ${av}% &nbsp;·&nbsp; <strong></strong> ${bv}%</div>`;
    d.querySelector('.jp-date').textContent=dateLabel;
    d.querySelector('.jp-pollster').textContent=pollster;
    const s=d.querySelectorAll('.jp-match strong'); s[0].textContent=a; s[1].textContent=b;
    return d;
  }

  function ensureArchiveRows(){
    const sec=document.getElementById('julsepPollArchive'); if(!sec) return;
    const list=sec.querySelector('.jp-list'); if(!list) return;
    const select=sec.querySelector('select');
    const filter=select?.value||'ALL';
    sec.querySelectorAll('[data-sep9cnn]').forEach(el=>el.remove());
    if(filter==='ALL'||filter==='TX') list.prepend(row('TX','Texas','Univision','James Talarico',48,'Ken Paxton',43,'Sep 8'));
    if(filter==='ALL'||filter==='ME') list.prepend(row('ME','Maine','CNN','Troy Jackson',48,'Susan Collins',45));
    if(filter==='ALL'||filter==='MI') list.prepend(row('MI','Michigan','CNN','Abdul El-Sayed',47,'Mike Rogers',44));
    const sub=sec.querySelector('.jp-sub');
    if(sub) sub.textContent='93 public general-election matchup polls and snapshots from July 7 through September 9, including alternate matchups that were publicly tested during the period.';
    const count=sec.querySelector('.jp-count');
    if(count){
      const total=list.querySelectorAll('.jp-row').length;
      count.textContent=`${total} poll${total===1?'':'s'} shown`;
    }
  }

  function ensureHomeForecastSplit(){
    const root=document.getElementById('page-home'); if(!root) return;
    document.getElementById('homeForecastRemovedStyle')?.remove();

    let section=document.getElementById('housePrediction2026');
    if(!section){
      section=document.createElement('section');
      section.id='housePrediction2026';
      const metrics=root.querySelector('.reference-metrics');
      const shell=root.querySelector('.reference-home-shell')||root.querySelector('.content')||root;
      if(metrics) metrics.insertAdjacentElement('afterend',section); else shell.appendChild(section);
    }
    section.style.cssText='width:100%;margin:28px 0 12px;display:block';

    let st=document.getElementById('homeForecastSplitStyle');
    if(!st){st=document.createElement('style');st.id='homeForecastSplitStyle';document.head.appendChild(st);}
    st.textContent=`
      #page-home #housePrediction2026{margin:28px 0 12px!important;width:100%!important;display:block!important}
      #page-home #homeForecastSplit{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:18px!important;align-items:stretch!important;width:100%!important}
      #page-home #homeForecastSplit .forecast-card{border:1px solid #dde3ec!important;border-radius:20px!important;background:#fff!important;box-shadow:0 10px 28px rgba(20,34,53,.08)!important;overflow:hidden!important;min-width:0!important;aspect-ratio:1672/941!important;box-sizing:border-box!important}
      #page-home #homeForecastSplit .house-card{display:flex!important;align-items:center!important;justify-content:center!important;padding:0!important;background:#f7f9fc!important}
      #page-home #homeForecastSplit .house-card img{display:block!important;width:100%!important;height:100%!important;object-fit:contain!important;border-radius:20px!important}
      #page-home #homeForecastSplit .senate-card{position:relative!important;padding:20px 22px!important;background:linear-gradient(135deg,#f7faff 0%,#fff 56%,#fff6f7 100%)!important;display:flex!important;flex-direction:column!important;justify-content:center!important;min-height:0!important}
      #page-home #homeForecastSplit .senate-kicker{font:900 10px/1.2 Inter,ui-sans-serif,system-ui,sans-serif!important;letter-spacing:2px!important;text-transform:uppercase!important;color:#6d7c91!important;margin-bottom:6px!important}
      #page-home #homeForecastSplit .senate-title{font:800 clamp(25px,3vw,42px)/1 Georgia,serif!important;color:#17263d!important;margin:0 0 14px!important}
      #page-home #homeForecastSplit .senate-tiebreak{position:absolute!important;top:14px!important;right:16px!important;color:#bd2937!important;font:900 9px/1.2 Inter,ui-sans-serif,system-ui,sans-serif!important;letter-spacing:1.3px!important;text-transform:uppercase!important;text-align:right!important}
      #page-home #homeForecastSplit .senate-tiebreak strong{display:block!important;font-size:14px!important;letter-spacing:.4px!important;margin-top:2px!important;color:#bd2937!important}
      #page-home #homeForecastSplit .senate-numbers{display:grid!important;grid-template-columns:1fr 1fr!important;gap:12px!important;align-items:end!important;margin-bottom:12px!important}
      #page-home #homeForecastSplit .party-block:last-child{text-align:right!important}
      #page-home #homeForecastSplit .party-label{font:900 12px/1.2 Inter,ui-sans-serif,system-ui,sans-serif!important;letter-spacing:1.1px!important;text-transform:uppercase!important}
      #page-home #homeForecastSplit .party-number{font:900 clamp(48px,5vw,72px)/.9 Georgia,serif!important;margin-top:5px!important}
      #page-home #homeForecastSplit .dem{color:#2763b8!important}.rep{color:#bd2937!important}
      #page-home #homeForecastSplit .senate-bar{height:18px!important;border-radius:999px!important;overflow:hidden!important;display:flex!important;box-shadow:inset 0 0 0 1px rgba(20,34,53,.08)!important}
      #page-home #homeForecastSplit .senate-bar .dem{width:50%!important;background:#2763b8!important}.senate-bar .rep{width:50%!important;background:#bd2937!important}
      #page-home #homeForecastSplit .majority-note{margin-top:8px!important;font:800 9px/1.2 Inter,ui-sans-serif,system-ui,sans-serif!important;letter-spacing:1px!important;text-transform:uppercase!important;color:#6c798b!important;text-align:center!important}
      @media(max-width:760px){
        #page-home #homeForecastSplit{grid-template-columns:1fr!important;gap:12px!important}
        #page-home #homeForecastSplit .senate-card{order:1!important;padding:18px!important}
        #page-home #homeForecastSplit .house-card{order:2!important}
        #page-home #homeForecastSplit .senate-title{font-size:30px!important;margin-bottom:12px!important}
        #page-home #homeForecastSplit .senate-tiebreak{top:12px!important;right:12px!important;font-size:7px!important}
        #page-home #homeForecastSplit .senate-tiebreak strong{font-size:11px!important}
        #page-home #homeForecastSplit .party-number{font-size:54px!important}
      }
    `;

    if(!section.querySelector('#homeForecastSplit')){
      section.innerHTML=`
        <div id="homeForecastSplit">
          <div class="forecast-card house-card">
            <img src="/house-prediction.svg?v=20260908-2208" alt="Will’s House of Reps Prediction: Democrats 228 seats, Republicans 207 seats; 218 needed for a majority.">
          </div>
          <div class="forecast-card senate-card">
            <div class="senate-tiebreak">Tiebreak vote<strong>JD VANCE</strong></div>
            <div class="senate-kicker">2026 U.S. Senate</div>
            <h2 class="senate-title">Will’s Senate Prediction</h2>
            <div class="senate-numbers">
              <div class="party-block"><div class="party-label dem">Democrats</div><div class="party-number dem">50</div></div>
              <div class="party-block"><div class="party-label rep">Republicans</div><div class="party-number rep">50</div></div>
            </div>
            <div class="senate-bar" aria-label="Senate prediction: 50 Democrats and 50 Republicans"><div class="dem"></div><div class="rep"></div></div>
            <div class="majority-note">51 seats needed for a majority</div>
          </div>
        </div>`;
    }
  }

  function removeDuplicateHomeSenatePrediction(){
    const root=document.getElementById('page-home'); if(!root) return;
    const split=document.getElementById('homeForecastSplit');
    for(const img of [...root.querySelectorAll('img')]){
      if(split&&split.contains(img)) continue;
      const sig=((img.alt||'')+' '+(img.getAttribute('src')||'')).toLowerCase();
      if(!(/senate/.test(sig)&&/prediction|forecast/.test(sig))) continue;
      let parent=img.parentElement;
      img.remove();
      while(parent&&parent!==root&&!norm(parent.textContent)&&parent.children.length===0){
        const next=parent.parentElement; parent.remove(); parent=next;
      }
    }
    const leaves=[...root.querySelectorAll('*')].filter(el=>!el.children.length&&!(split&&split.contains(el)));
    for(const el of leaves){
      if(!/^Will[\u2019']s Senate Prediction$/i.test(norm(el.textContent))) continue;
      let box=el.parentElement;
      for(let i=0;box&&box!==root&&i<8;i++,box=box.parentElement){
        const t=norm(box.textContent);
        if(/Will[\u2019']s Senate Prediction/i.test(t)&&/Democrats/i.test(t)&&/Republicans/i.test(t)){
          box.remove();
          break;
        }
      }
    }
  }

  function fixCounts(){
    const home=document.getElementById('page-home');
    if(home){
      for(const el of home.querySelectorAll('*')){
        if(el.children.length) continue;
        const t=norm(el.textContent);
        if(/^(?:90|92)$/.test(t)&&/poll/i.test(norm(el.parentElement?.textContent))) el.textContent='93';
        if(/Sep\.? 8, 2026/i.test(t)||t==='2026-09-08'){
          if(/latest|update/i.test(norm(el.parentElement?.textContent))) el.textContent='Sep 9, 2026';
        }
      }
    }
    const about=document.getElementById('page-about');
    if(about){
      for(const el of about.querySelectorAll('*')){
        if(el.children.length) continue;
        const t=norm(el.textContent);
        if(/\b(?:90|92)\s+polls?\b/i.test(t)) el.textContent=t.replace(/\b(?:90|92)(?=\s+polls?\b)/i,'93');
        else if(/^(?:90|92)$/.test(t)&&/poll/i.test(norm(el.parentElement?.textContent))) el.textContent='93';
      }
    }
  }

  function apply(){
    applyAverages();
    ensureNativePolls();
    ensureArchiveRows();
    ensureHomeForecastSplit();
    removeDuplicateHomeSenatePrediction();
    fixCounts();
  }

  apply();
  [80,250,600,1200,2200,4000].forEach(ms=>setTimeout(apply,ms));
  setInterval(apply,1800);
  new MutationObserver(()=>{clearTimeout(window.__sep9PollTimer);window.__sep9PollTimer=setTimeout(apply,40);}).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('change',e=>{if(e.target?.closest?.('#julsepPollArchive')) setTimeout(apply,20);},true);
  window.addEventListener('pageshow',apply);
})();

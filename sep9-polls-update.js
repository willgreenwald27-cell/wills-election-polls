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
        const exists=polls.some(p=>p&&p.state===obj.state&&p.date===obj.date&&String(p.pollster||'')==='CNN'&&String(p.c1||'')===obj.c1);
        if(!exists){polls.push(obj);changed=true;}
      };
      add({date:'2026-09-09',state:'MI',pollster:'CNN',sample:'',c1:'Abdul El-Sayed',c1Pct:'47',c2:'Mike Rogers',c2Pct:'44',notes:'RealClearPolling listing · El-Sayed +3'});
      add({date:'2026-09-09',state:'ME',pollster:'CNN',sample:'',c1:'Troy Jackson',c1Pct:'48',c2:'Susan Collins',c2Pct:'45',notes:'RealClearPolling listing · Jackson +3'});
      if(changed&&typeof renderPolls==='function') renderPolls();
    }catch(e){}
  }

  function row(ab,state,pollster,a,av,b,bv){
    const d=document.createElement('div');
    d.className='jp-row'; d.dataset.sep9cnn=ab;
    d.title=state+' Senate';
    d.innerHTML=`<div class="jp-date">Sep 9</div><div class="jp-state">${ab}</div><div class="jp-pollster"></div><div class="jp-match"><strong></strong> ${av}% &nbsp;·&nbsp; <strong></strong> ${bv}%</div>`;
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
    if(filter==='ALL'||filter==='ME') list.prepend(row('ME','Maine','CNN','Troy Jackson',48,'Susan Collins',45));
    if(filter==='ALL'||filter==='MI') list.prepend(row('MI','Michigan','CNN','Abdul El-Sayed',47,'Mike Rogers',44));
    const sub=sec.querySelector('.jp-sub');
    if(sub) sub.textContent='92 public general-election matchup polls and snapshots from July 7 through September 9, including alternate matchups that were publicly tested during the period.';
    const count=sec.querySelector('.jp-count');
    if(count){
      const base=Number((count.textContent.match(/\d+/)||[])[0]||0);
      const extra=filter==='ALL'?2:((filter==='MI'||filter==='ME')?1:0);
      const total=base+extra;
      count.textContent=`${total} poll${total===1?'':'s'} shown`;
    }
  }

  function ensureHomeForecastSplit(){
    const root=document.getElementById('page-home'); if(!root) return;
    const section=document.getElementById('housePrediction2026'); if(!section) return;
    if(!document.getElementById('homeForecastSplitStyle')){
      const st=document.createElement('style');
      st.id='homeForecastSplitStyle';
      st.textContent=`
        #housePrediction2026{margin:28px 0 12px!important;width:100%!important}
        #homeForecastSplit{display:grid;grid-template-columns:minmax(0,42fr) minmax(0,58fr);gap:18px;align-items:stretch;width:100%}
        #homeForecastSplit .forecast-card{border:1px solid #dde3ec;border-radius:20px;background:#fff;box-shadow:0 10px 28px rgba(20,34,53,.08);overflow:hidden;min-width:0}
        #homeForecastSplit .house-card{display:flex;align-items:center;justify-content:center;padding:0;background:#f7f9fc}
        #homeForecastSplit .house-card img{display:block;width:100%;height:100%;object-fit:contain;border-radius:20px}
        #homeForecastSplit .senate-card{position:relative;padding:28px 30px 25px;background:linear-gradient(135deg,#f7faff 0%,#fff 56%,#fff6f7 100%);display:flex;flex-direction:column;justify-content:center;min-height:340px}
        #homeForecastSplit .senate-kicker{font:900 12px/1.2 Inter,ui-sans-serif,system-ui,sans-serif;letter-spacing:2.2px;text-transform:uppercase;color:#6d7c91;margin-bottom:8px}
        #homeForecastSplit .senate-title{font:800 clamp(32px,4vw,54px)/1 Georgia,serif;color:#17263d;margin:0 0 22px}
        #homeForecastSplit .senate-tiebreak{position:absolute;top:18px;right:20px;color:#bd2937;font:900 10px/1.25 Inter,ui-sans-serif,system-ui,sans-serif;letter-spacing:1.4px;text-transform:uppercase;text-align:right}
        #homeForecastSplit .senate-tiebreak strong{display:block;font-size:16px;letter-spacing:.5px;margin-top:3px;color:#bd2937}
        #homeForecastSplit .senate-numbers{display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:end;margin-bottom:16px}
        #homeForecastSplit .party-block:last-child{text-align:right}
        #homeForecastSplit .party-label{font:900 15px/1.2 Inter,ui-sans-serif,system-ui,sans-serif;letter-spacing:1.3px;text-transform:uppercase}
        #homeForecastSplit .party-number{font:900 clamp(58px,7vw,92px)/.9 Georgia,serif;margin-top:7px}
        #homeForecastSplit .dem{color:#2763b8}.rep{color:#bd2937}
        #homeForecastSplit .senate-bar{height:24px;border-radius:999px;overflow:hidden;display:flex;box-shadow:inset 0 0 0 1px rgba(20,34,53,.08)}
        #homeForecastSplit .senate-bar .dem{width:50%;background:#2763b8}.senate-bar .rep{width:50%;background:#bd2937}
        #homeForecastSplit .majority-note{margin-top:10px;font:800 11px/1.2 Inter,ui-sans-serif,system-ui,sans-serif;letter-spacing:1.2px;text-transform:uppercase;color:#6c798b;text-align:center}
        @media(max-width:760px){
          #homeForecastSplit{grid-template-columns:1fr;gap:12px}
          #homeForecastSplit .senate-card{order:1;min-height:300px;padding:24px 20px 22px}
          #homeForecastSplit .house-card{order:2}
          #homeForecastSplit .senate-title{font-size:38px;margin-bottom:18px}
          #homeForecastSplit .senate-tiebreak{top:14px;right:14px;font-size:8px}
          #homeForecastSplit .senate-tiebreak strong{font-size:13px}
          #homeForecastSplit .party-number{font-size:64px}
        }
      `;
      document.head.appendChild(st);
    }
    if(section.querySelector('#homeForecastSplit')) return;
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
        if(t==='90'&&/poll/i.test(norm(el.parentElement?.textContent))) el.textContent='92';
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
        if(/\b90\s+polls?\b/i.test(t)) el.textContent=t.replace(/\b90(?=\s+polls?\b)/i,'92');
        else if(t==='90'&&/poll/i.test(norm(el.parentElement?.textContent))) el.textContent='92';
      }
    }
  }

  function apply(){applyAverages();ensureNativePolls();ensureArchiveRows();ensureHomeForecastSplit();removeDuplicateHomeSenatePrediction();fixCounts();}
  apply();
  [80,250,600,1200,2200,4000].forEach(ms=>setTimeout(apply,ms));
  setInterval(apply,1800);
  new MutationObserver(()=>{clearTimeout(window.__sep9PollTimer);window.__sep9PollTimer=setTimeout(apply,40);}).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('change',e=>{if(e.target?.closest?.('#julsepPollArchive')) setTimeout(apply,20);},true);
  window.addEventListener('pageshow',apply);
})();

(()=>{
  'use strict';
  const AVG={
    AK:{'peltola':'50.5','sullivan':'46.5'},
    AR:{'shoffner':'43.0','cotton':'46.0'},
    GA:{'ossoff':'50.0','collins':'43.0'},
    IA:{'turek':'44.7','hinson':'45.0'},
    ID:{'achilles':'34.0','risch':'33.5'},
    KS:{'hamilton':'45.0','marshall':'46.0'},
    MA:{'markey':'50.0','deaton':'30.0'},
    ME:{'jackson':'47.7','collins':'44.2'},
    MI:{'el-sayed':'45.4','rogers':'44.5'},
    MN:{'flanagan':'45.0','tafoya':'41.5'},
    MT:{'bodnar':'48.0','alme':'45.0'},
    NC:{'cooper':'50.4','whatley':'40.7'},
    NH:{'pappas':'42.3','sununu':'41.0'},
    NM:{'lujn':'53.0','marker':'38.0'},
    OH:{'brown':'47.8','husted':'41.4'},
    RI:{'reed':'51.0','mckay':'31.0'},
    SC:{'andrews':'37.7','graham':'42.0'},
    TN:{'bradshaw':'32.3','hagerty':'55.7'},
    TX:{'talarico':'47.8','paxton':'44.9'}
  };
  const MAINE_NOTE='Why: Final polling margins underestimated Susan Collins by more than 5 points in each of her last three Senate elections (2008, 2014, and 2020).';
  const RED_LIGHT='#f8c6ca';
  let rendering=false,queued=false;
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const last=n=>{const p=norm(n).toLowerCase().split(/\s+/);return (p[p.length-1]||'').replace(/[^a-z0-9-]/g,'');};
  const leafs=root=>root?[...root.querySelectorAll('*')].filter(el=>el.children.length===0):[];

  function syncData(){
    try{
      if(typeof stateData==='undefined'||!stateData) return false;
      let changed=false;
      const set=(s,k,v)=>{if(String(s[k]??'')!==String(v)){s[k]=v;changed=true;}};
      for(const [ab,byLast] of Object.entries(AVG)){
        const s=stateData[ab]; if(!s) continue;
        for(const slot of [1,2]){
          const value=byLast[last(s['candidate'+slot])];
          if(value!==undefined) set(s,'candidate'+slot+'Poll',value);
        }
        set(s,'updated','2026-09-10');
      }
      const me=stateData.ME;
      if(me){
        set(me,'rating','tilt-r');set(me,'predictionParty','Republican');set(me,'prediction','Collins +1.3%');set(me,'notes',MAINE_NOTE);set(me,'updated','2026-09-10');
        for(const k of ['projectedWinner','predictionWinner','winner','callParty']) if(k in me) set(me,k,'Republican');
        if('call' in me) set(me,'call','Collins +1.3%');
      }
      return changed;
    }catch(e){console.warn('Audited Senate data sync unavailable',e);return false;}
  }

  function forceMaine(){
    const root=document.getElementById('page-senate'); if(!root)return;
    root.querySelectorAll('[data-state="ME"],[data-state="ME"] path,[data-abbr="ME"],[data-abbr="ME"] path,[data-state-abbr="ME"],[data-state-abbr="ME"] path,#ME,#ME path,#state-ME,#state-ME path').forEach(el=>{
      el.style.setProperty('fill',RED_LIGHT,'important');
      if(el.namespaceURI!=='http://www.w3.org/2000/svg'&&!/^(path|polygon|rect)$/i.test(el.tagName||'')) el.style.setProperty('background',RED_LIGHT,'important');
    });
    const labels=leafs(root).filter(el=>norm(el.textContent)==='Maine'&&el.getClientRects().length);
    for(const label of labels){
      let box=label.parentElement;
      for(let i=0;box&&box!==root&&i<14;i++,box=box.parentElement){
        const t=norm(box.textContent);
        if(/WILL[’']S (CALL|STATISTICAL ODDS)/i.test(t)&&/MY PROJECTED WINNER/i.test(t)) break;
      }
      if(!box||box===root)continue;
      const ls=leafs(box);
      for(const el of ls){
        const t=norm(el.textContent);
        if(/^Prediction:\s*/i.test(t))el.textContent='Prediction: Tilt Republican';
        if(t==='Jackson +0.4%'||t==='No prediction text entered yet.')el.textContent='Collins +1.3%';
      }
      const call=ls.findIndex(el=>/^WILL[’']S CALL$/i.test(norm(el.textContent)));
      if(call>=0){
        const p=ls.slice(call+1,call+12).find(el=>/^(Democrat(?:ic)?|Republican)$/i.test(norm(el.textContent)));
        if(p)p.textContent='Republican';
        const copy=box.querySelector('.prediction-copy');if(copy)copy.textContent='Collins +1.3%';
      }
      const proj=ls.findIndex(el=>/^MY PROJECTED WINNER$/i.test(norm(el.textContent)));
      if(proj>=0){
        const p=ls.slice(proj+1,proj+12).find(el=>/^(Democrat(?:ic)?|Republican)$/i.test(norm(el.textContent)));
        if(p)p.textContent='Republican';
      }
    }
  }

  function forceSenateSummary(){
    const root=document.getElementById('page-senate'); if(!root)return;
    const ls=leafs(root);
    for(const label of ls){
      const t=norm(label.textContent);
      if(!/^(REPUBLICAN|DEMOCRAT(?:IC)?)$/i.test(t))continue;
      let box=label.parentElement;
      for(let d=0;box&&box!==root&&d<6;d++,box=box.parentElement){
        const text=norm(box.textContent);
        if(!/REPUBLICAN/i.test(text)||!/DEMOCRAT/i.test(text))continue;
        const branch=label.parentElement;
        const n=leafs(branch).find(x=>/^\d+$/.test(norm(x.textContent)));
        if(n)n.textContent=/^REPUBLICAN$/i.test(t)?'51':'49';
        break;
      }
    }
  }

  function forceHome(){
    const root=document.getElementById('page-home');if(!root)return;
    const title=leafs(root).find(el=>/^Will[’']s Senate Prediction$/i.test(norm(el.textContent)));
    if(!title)return;
    let card=title.parentElement;
    for(let i=0;card&&card!==root&&i<7;i++,card=card.parentElement){
      const t=norm(card.textContent);
      if(/Democrats/i.test(t)&&/Republicans/i.test(t)&&/51 seats needed for a majority/i.test(t))break;
    }
    if(!card||card===root)return;
    const nums=[...card.querySelectorAll('.party-number,.final-party-number')];
    if(nums.length>=2){nums[0].textContent='49';nums[1].textContent='51';}
    const all=leafs(card);
    for(const el of all){
      const t=norm(el.textContent);
      if(/^Democrats?:\s*50$/i.test(t))el.textContent=t.replace(/50$/,'49');
      if(/^Republicans?:\s*50$/i.test(t))el.textContent=t.replace(/50$/,'51');
    }
    const bar=card.querySelector('.senate-bar,.final-bar');
    if(bar){
      const d=bar.querySelector('.dem'),r=bar.querySelector('.rep');
      if(d)d.style.setProperty('width','49%','important');
      if(r)r.style.setProperty('width','51%','important');
      bar.setAttribute('aria-label','Senate prediction: 49 Democrats and 51 Republicans');
    }
  }

  function apply(){
    const changed=syncData();
    if(changed&&typeof renderSenate==='function'&&!rendering){rendering=true;try{renderSenate();}catch(e){}finally{rendering=false;}}
    forceMaine();forceSenateSummary();forceHome();
  }
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply();});}
  apply();[80,250,700,1600,3200].forEach(ms=>setTimeout(apply,ms));
  setInterval(apply,1200);
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','style']});
  window.addEventListener('pageshow',apply);window.addEventListener('resize',apply);
})();

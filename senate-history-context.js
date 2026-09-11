(()=>{
  'use strict';
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const leafs=root=>root?[...root.querySelectorAll('*')].filter(el=>el.children.length===0):[];
  let history=null, queued=false;

  function ensureStyle(){
    if(document.getElementById('wgHistoryContextStyle'))return;
    const st=document.createElement('style');
    st.id='wgHistoryContextStyle';
    st.textContent=`
      #page-senate .wg-history-context{margin-top:12px;padding:14px 15px;border-radius:10px;background:#f7f8fb;color:#26384f;border:0;box-sizing:border-box;font:500 12px/1.45 Inter,ui-sans-serif,system-ui,sans-serif}
      #page-senate .wg-history-context b{display:block;margin-bottom:7px;color:#61718a;font-size:10px;line-height:1.1;font-weight:900;letter-spacing:1.15px;text-transform:uppercase}
      #page-senate .wg-history-context span{display:block;color:#26384f}
      @media(min-width:900px){
        #page-senate .wg-sticky-party-label{display:inline-block!important;font:900 10px/1 Inter,ui-sans-serif,system-ui,sans-serif!important;letter-spacing:1.15px!important;text-transform:uppercase!important;vertical-align:middle!important}
        #page-senate .wg-sticky-party-label.dem{color:#2763b8!important;margin-right:8px!important}
        #page-senate .wg-sticky-party-label.rep{color:#bd2937!important;margin-left:8px!important}
      }
      @media(max-width:899px){#page-senate .wg-sticky-party-label{display:none!important}}
    `;
    document.head.appendChild(st);
  }

  async function loadHistory(){
    try{
      const r=await fetch('/senate-error-history-data.json?ts='+Date.now(),{cache:'no-store'});
      if(!r.ok)throw new Error('history '+r.status);
      history=await r.json();
      schedule();
    }catch(e){console.warn('Past polling context unavailable',e);}
  }

  function stateSummary(ab){
    if(!history)return null;
    const rows=(history.records||[]).filter(r=>r&&r.state===ab);
    const scored=rows.filter(r=>Number.isFinite(Number(r.error))&&String(r.status||'').toUpperCase()!=='NO POLLING');
    if(!scored.length){
      const visible=rows.length;
      return visible?`The saved archive contains ${visible} prior cycle${visible===1?'':'s'} for this Senate seat class, but no qualifying scored polling average is available.`:'No qualifying historical polling record is available in the saved archive for this state.';
    }
    const abs=scored.map(r=>Math.abs(Number(r.error)));
    const avg=(abs.reduce((a,b)=>a+b,0)/abs.length).toFixed(1);
    const largest=Math.max(...abs).toFixed(1);
    const reversals=scored.filter(r=>r.wrongWinner===true).length;
    const noPolling=rows.filter(r=>String(r.status||'').toUpperCase()==='NO POLLING').length;
    let s=`Across ${scored.length} scored prior Senate cycle${scored.length===1?'':'s'} in this seat class, the average absolute polling miss was ${avg} points and the largest miss was ${largest} points.`;
    s+=reversals?` The polling leader was reversed in ${reversals} scored cycle${reversals===1?'':'s'}.`:' The polling leader was not reversed in the scored cycles.';
    if(noPolling)s+=` ${noPolling} additional archived cycle${noPolling===1?' has':'s have'} no qualifying polling data.`;
    return s;
  }

  function popupForState(ab,name){
    const root=document.getElementById('page-senate');if(!root)return null;
    const candidates=[...root.querySelectorAll('div,section,article')].filter(el=>{
      if(!el.getClientRects().length)return false;
      const t=norm(el.textContent),r=el.getBoundingClientRect();
      return r.width>=230&&r.width<=760&&r.height>=160&&r.height<=1200&&t.includes(name)&&/(AVG POLLS|POLL AVERAGE)/i.test(t)&&/(MY PREDICTION|WILL[’']S CALL)/i.test(t);
    });
    candidates.sort((a,b)=>(a.getBoundingClientRect().width*a.getBoundingClientRect().height)-(b.getBoundingClientRect().width*b.getBoundingClientRect().height));
    return candidates[0]||null;
  }

  function addHistoryContext(){
    if(!history||typeof stateData==='undefined'||!stateData)return;
    for(const ab of history.targetStates||[]){
      const s=stateData[ab];if(!s?.name)continue;
      const box=popupForState(ab,s.name);if(!box)continue;
      const text=stateSummary(ab);if(!text)continue;
      let note=box.querySelector('.wg-history-context');
      if(!note){note=document.createElement('div');note.className='wg-history-context';box.appendChild(note);}
      note.innerHTML='<b>PAST POLLING CONTEXT</b><span></span>';
      note.querySelector('span').textContent=text;
    }
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
    const hasDem=visibleLeaves.some(el=>/^DEMOCRAT(?:IC)?$/i.test(norm(el.textContent))&&!el.classList.contains('wg-sticky-party-label'));
    const hasRep=visibleLeaves.some(el=>/^REPUBLICAN$/i.test(norm(el.textContent))&&!el.classList.contains('wg-sticky-party-label'));
    const nums=visibleLeaves.filter(el=>/^\d+$/.test(norm(el.textContent))).sort((a,b)=>a.getBoundingClientRect().left-b.getBoundingClientRect().left);
    if(nums.length<2)return;
    const left=nums[0],right=nums[nums.length-1];
    if(!hasDem){
      const lab=document.createElement('span');lab.className='wg-sticky-party-label dem';lab.textContent='DEMOCRATIC';left.parentElement?.insertBefore(lab,left);
    }
    if(!hasRep){
      const lab=document.createElement('span');lab.className='wg-sticky-party-label rep';lab.textContent='REPUBLICAN';right.parentElement?.appendChild(lab);
    }
  }

  function apply(){ensureStyle();restoreDesktopPartyLabels();addHistoryContext();}
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply();});}
  ensureStyle();loadHistory();apply();
  [100,300,800,1600,3200].forEach(ms=>setTimeout(apply,ms));
  setInterval(apply,1200);
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','style']});
  window.addEventListener('pageshow',apply);window.addEventListener('resize',apply);
})();

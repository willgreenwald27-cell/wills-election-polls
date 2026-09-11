(()=>{
  'use strict';
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const leafs=root=>root?[...root.querySelectorAll('*')].filter(el=>el.children.length===0):[];
  let queued=false;

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
    const ly=left.getBoundingClientRect().top+left.getBoundingClientRect().height/2;
    const ry=right.getBoundingClientRect().top+right.getBoundingClientRect().height/2;
    const near=(el,y)=>{const r=el.getBoundingClientRect();const cy=r.top+r.height/2;return Math.abs(cy-y)<70;};
    const hasDem=visibleLeaves.some(el=>/^DEMOCRAT(?:IC)?$/i.test(norm(el.textContent))&&!el.classList.contains('wg-sticky-party-label')&&near(el,ly));
    const hasRep=visibleLeaves.some(el=>/^REPUBLICAN$/i.test(norm(el.textContent))&&!el.classList.contains('wg-sticky-party-label')&&near(el,ry));
    if(!hasDem){const lab=document.createElement('span');lab.className='wg-sticky-party-label dem';lab.textContent='DEMOCRATIC';left.parentElement?.insertBefore(lab,left);}
    if(!hasRep){const lab=document.createElement('span');lab.className='wg-sticky-party-label rep';lab.textContent='REPUBLICAN';right.parentElement?.appendChild(lab);}
  }

  function apply(){ensureStyle();removeHistoryContext();restoreDesktopPartyLabels();}
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply();});}
  ensureStyle();apply();
  [100,300,800,1600,3200].forEach(ms=>setTimeout(apply,ms));
  setInterval(apply,1200);
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','style']});
  window.addEventListener('pageshow',apply);window.addEventListener('resize',apply);
})();

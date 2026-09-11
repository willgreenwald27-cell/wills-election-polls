(()=>{
  'use strict';
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  function apply(){
    const root=document.getElementById('page-senate');
    if(!root)return;
    const visible=[...root.querySelectorAll('*')].filter(el=>el.getClientRects().length);
    const leafs=visible.filter(el=>el.children.length===0);
    const dem=leafs.filter(el=>norm(el.textContent)==='49').sort((a,b)=>parseFloat(getComputedStyle(b).fontSize)-parseFloat(getComputedStyle(a).fontSize))[0];
    const rep=leafs.filter(el=>norm(el.textContent)==='51').sort((a,b)=>parseFloat(getComputedStyle(b).fontSize)-parseFloat(getComputedStyle(a).fontSize))[0];

    const hasNearbyLabel=(countEl,label)=>{
      if(!countEl)return false;
      const r=countEl.getBoundingClientRect();
      const cx=r.left+r.width/2,cy=r.top+r.height/2;
      return visible.some(el=>{
        if(el===countEl||norm(el.textContent)!==label)return false;
        if(el.classList.contains('wg-dem-seat-count')||el.classList.contains('wg-rep-seat-count'))return false;
        const q=el.getBoundingClientRect();
        const qx=q.left+q.width/2,qy=q.top+q.height/2;
        return Math.abs(qy-cy)<42&&Math.abs(qx-cx)<260;
      });
    };

    if(dem){
      dem.classList.remove('wg-dem-seat-count');
      if(!hasNearbyLabel(dem,'DEMOCRATIC'))dem.classList.add('wg-dem-seat-count');
    }
    if(rep){
      rep.classList.remove('wg-rep-seat-count');
      if(!hasNearbyLabel(rep,'REPUBLICAN'))rep.classList.add('wg-rep-seat-count');
    }

    if(!document.getElementById('wgSeatPartyLabelsStyle')){
      const st=document.createElement('style');
      st.id='wgSeatPartyLabelsStyle';
      st.textContent=`
        #page-senate .wg-dem-seat-count,#page-senate .wg-rep-seat-count{display:inline-flex!important;align-items:baseline!important;gap:8px!important;white-space:nowrap!important}
        #page-senate .wg-dem-seat-count:before{content:'DEMOCRATIC';font:900 10px/1 Inter,ui-sans-serif,system-ui,sans-serif;letter-spacing:1.15px;color:#2763b8}
        #page-senate .wg-rep-seat-count:after{content:'REPUBLICAN';font:900 10px/1 Inter,ui-sans-serif,system-ui,sans-serif;letter-spacing:1.15px;color:#e34b5b}
      `;
      document.head.appendChild(st);
    }
  }
  apply();
  [80,250,700,1500,3000].forEach(ms=>setTimeout(apply,ms));
  new MutationObserver(()=>requestAnimationFrame(apply)).observe(document.body,{childList:true,subtree:true,characterData:true});
})();

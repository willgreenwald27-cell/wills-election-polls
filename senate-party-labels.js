(()=>{
  'use strict';
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  function apply(){
    const root=document.getElementById('page-senate');
    if(!root)return;
    const leafs=[...root.querySelectorAll('*')].filter(el=>el.children.length===0&&el.getClientRects().length);
    const dem=leafs.filter(el=>norm(el.textContent)==='49').sort((a,b)=>parseFloat(getComputedStyle(b).fontSize)-parseFloat(getComputedStyle(a).fontSize))[0];
    const rep=leafs.filter(el=>norm(el.textContent)==='51').sort((a,b)=>parseFloat(getComputedStyle(b).fontSize)-parseFloat(getComputedStyle(a).fontSize))[0];
    if(dem)dem.classList.add('wg-dem-seat-count');
    if(rep)rep.classList.add('wg-rep-seat-count');
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

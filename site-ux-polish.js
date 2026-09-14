(()=>{
  'use strict';
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const leafs=root=>root?[...root.querySelectorAll('*')].filter(el=>el.children.length===0):[];
  let raf=0;

  function ensureStyle(){
    if(document.getElementById('wgSeatPartyPseudoStyle'))return;
    const st=document.createElement('style');
    st.id='wgSeatPartyPseudoStyle';
    st.textContent=`
      @media(min-width:900px){
        #page-senate .wg-seat-party-block{position:relative!important;overflow:visible!important}
        #page-senate .wg-seat-party-block.wg-seat-dem::before,
        #page-senate .wg-seat-party-block.wg-seat-rep::before{
          position:absolute!important;top:-14px!important;z-index:999!important;display:block!important;
          font:900 10px/1 Inter,ui-sans-serif,system-ui,sans-serif!important;letter-spacing:1.1px!important;
          text-transform:uppercase!important;white-space:nowrap!important;opacity:1!important;visibility:visible!important;
          pointer-events:none!important
        }
        #page-senate .wg-seat-party-block.wg-seat-dem::before{content:'DEMOCRATIC';left:0!important;color:#2763b8!important}
        #page-senate .wg-seat-party-block.wg-seat-rep::before{content:'REPUBLICAN';right:0!important;color:#bd2937!important}
      }
    `;
    document.head.appendChild(st);
  }

  function reorderNav(){
    const nav=document.querySelector('.site-header .nav');if(!nav)return;
    const items=[...nav.children];
    const home=items.find(el=>/^Home$/i.test(norm(el.textContent)));
    const errors=items.find(el=>/^Past Polling Errors$/i.test(norm(el.textContent)));
    if(home&&errors&&home.nextElementSibling!==errors)nav.insertBefore(errors,home.nextElementSibling);
  }

  function electionCountdown(){
    const root=document.getElementById('page-senate');if(!root)return;
    const now=new Date();
    const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
    const election=new Date(2026,10,3);
    const days=Math.max(0,Math.ceil((election-today)/86400000));
    for(const el of leafs(root)){
      const t=norm(el.textContent);
      if(/^Last updated\b/i.test(t)||/^Updated\b/i.test(t))el.textContent=`${days} DAYS UNTIL ELECTION DAY`;
    }
  }

  function keepPartyLabels(){
    ensureStyle();
    const root=document.getElementById('page-senate');if(!root)return;
    root.querySelectorAll('.wg-sticky-party-label').forEach(el=>el.remove());
    root.querySelectorAll('.wg-seat-party-block').forEach(el=>el.classList.remove('wg-seat-party-block','wg-seat-dem','wg-seat-rep'));
    if(!window.matchMedia('(min-width:900px)').matches)return;

    const marker=leafs(root).find(el=>el.getClientRects().length&&/50\s*\+\s*VP\s+FOR\s+MAJORITY/i.test(norm(el.textContent)));
    if(!marker)return;
    let box=marker.parentElement;
    for(let i=0;box&&box!==root&&i<9;i++,box=box.parentElement){
      const nums=[...box.querySelectorAll('.party-number,.final-party-number')].filter(el=>el.getClientRects().length);
      if(nums.length>=2)break;
      const plain=leafs(box).filter(el=>el.getClientRects().length&&/^49$/.test(norm(el.textContent)));
      if(plain.length>=2)break;
    }
    if(!box||box===root)return;

    let nums=[...box.querySelectorAll('.party-number,.final-party-number')].filter(el=>el.getClientRects().length);
    if(nums.length<2)nums=leafs(box).filter(el=>el.getClientRects().length&&/^49$/.test(norm(el.textContent)));
    if(nums.length<2)return;
    nums.sort((a,b)=>a.getBoundingClientRect().left-b.getBoundingClientRect().left);
    const left=nums[0],right=nums[nums.length-1];
    const demBlock=left.closest('.party-block')||left.parentElement;
    const repBlock=right.closest('.party-block')||right.parentElement;
    if(demBlock){demBlock.classList.add('wg-seat-party-block','wg-seat-dem');demBlock.style.setProperty('overflow','visible','important');}
    if(repBlock){repBlock.classList.add('wg-seat-party-block','wg-seat-rep');repBlock.style.setProperty('overflow','visible','important');}

    for(const el of leafs(box)){
      const t=norm(el.textContent);
      if(/^(DEMOCRAT(?:IC)?|REPUBLICAN)$/i.test(t)){
        el.style.setProperty('opacity','0','important');
        el.style.setProperty('visibility','hidden','important');
      }
    }
  }

  function fixGrahamText(){
    const root=document.getElementById('page-polls');if(!root)return;
    for(const el of leafs(root).filter(x=>x.getClientRects().length&&/^Graham Nordone$/i.test(norm(x.textContent)))){
      el.style.setProperty('color','#17263d','important');
    }
  }

  function apply(){reorderNav();electionCountdown();keepPartyLabels();fixGrahamText();}
  function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;apply();});}

  ensureStyle();apply();
  [25,75,150,300,600,1000,1800,3200].forEach(ms=>setTimeout(apply,ms));
  setInterval(apply,150);
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','style']});
  document.addEventListener('mousemove',e=>{if(e.target?.closest?.('#page-senate'))setTimeout(apply,0);},true);
  document.addEventListener('mouseover',e=>{if(e.target?.closest?.('#page-senate'))setTimeout(apply,0);},true);
  window.addEventListener('pageshow',apply);window.addEventListener('resize',apply);
})();

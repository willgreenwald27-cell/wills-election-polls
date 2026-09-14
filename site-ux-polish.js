(()=>{
  'use strict';
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const leafs=root=>root?[...root.querySelectorAll('*')].filter(el=>el.children.length===0):[];

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
    const target=new Date(now.getFullYear()===2026?'2026-11-03T00:00:00':'2026-11-03T00:00:00');
    const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
    const election=new Date(2026,10,3);
    const days=Math.max(0,Math.ceil((election-today)/86400000));
    for(const el of leafs(root)){
      const t=norm(el.textContent);
      if(/^Last updated\b/i.test(t)||/^Updated\b/i.test(t)) el.textContent=`${days} DAYS UNTIL ELECTION DAY`;
    }
  }

  function keepPartyLabels(){
    const root=document.getElementById('page-senate');if(!root)return;
    if(!window.matchMedia('(min-width:900px)').matches)return;
    const visible=leafs(root).filter(el=>el.getClientRects().length);
    const marker=visible.find(el=>/50\s*\+\s*VP\s+FOR\s+MAJORITY/i.test(norm(el.textContent)));
    if(!marker)return;
    let box=marker.parentElement;
    for(let i=0;box&&box!==root&&i<6;i++,box=box.parentElement){
      const nums=leafs(box).filter(el=>el.getClientRects().length&&/^\d+$/.test(norm(el.textContent)));
      if(nums.length>=2)break;
    }
    if(!box||box===root)return;
    const nums=leafs(box).filter(el=>el.getClientRects().length&&/^\d+$/.test(norm(el.textContent))).sort((a,b)=>a.getBoundingClientRect().left-b.getBoundingClientRect().left);
    if(nums.length<2)return;
    const left=nums[0],right=nums[nums.length-1];
    const ensure=(num,cls,text,before)=>{
      const p=num.parentElement;if(!p)return;
      const native=leafs(p).some(el=>!el.classList.contains('wg-sticky-party-label')&&new RegExp('^'+text.replace('DEMOCRATIC','DEMOCRAT(?:IC)?')+'$','i').test(norm(el.textContent)));
      let f=p.querySelector('.wg-sticky-party-label.'+cls);
      if(native){if(f)f.remove();return;}
      if(!f){f=document.createElement('span');f.className='wg-sticky-party-label '+cls;f.textContent=text;if(before)p.insertBefore(f,num);else p.appendChild(f);}
      f.style.setProperty('display','inline-block','important');
      f.style.setProperty('opacity','1','important');
      f.style.setProperty('visibility','visible','important');
    };
    ensure(left,'dem','DEMOCRATIC',true);ensure(right,'rep','REPUBLICAN',false);
  }

  function fixGraham(){
    const root=document.getElementById('page-polls');if(!root)return;
    const visible=leafs(root).filter(el=>el.getClientRects().length);
    for(const el of visible.filter(x=>/^Graham Nordone$/i.test(norm(x.textContent)))){
      el.style.setProperty('color','#bd2937','important');
      let row=el.parentElement;
      for(let i=0;row&&row!==root&&i<5;i++,row=row.parentElement){if(/Graham Nordone/i.test(norm(row.textContent))&&/45(?:\.0)?%?/.test(norm(row.textContent)))break;}
      if(!row||row===root)continue;
      row.querySelectorAll('*').forEach(x=>{const t=norm(x.textContent);if(/^45(?:\.0)?%$/.test(t))x.style.setProperty('color','#bd2937','important');});
    }
  }

  function apply(){reorderNav();electionCountdown();keepPartyLabels();fixGraham();}
  apply();[100,300,800,1600,3200].forEach(ms=>setTimeout(apply,ms));setInterval(apply,500);
  new MutationObserver(()=>requestAnimationFrame(apply)).observe(document.body,{childList:true,subtree:true,characterData:true});
  window.addEventListener('pageshow',apply);window.addEventListener('resize',apply);
})();

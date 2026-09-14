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
    if(!window.matchMedia('(min-width:900px)').matches){root.querySelectorAll('.wg-sticky-party-label').forEach(el=>el.remove());return;}
    const marker=leafs(root).find(el=>el.getClientRects().length&&/50\s*\+\s*VP\s+FOR\s+MAJORITY/i.test(norm(el.textContent)));
    if(!marker)return;
    let box=marker.parentElement;
    for(let i=0;box&&box!==root&&i<8;i++,box=box.parentElement){
      if(box.querySelectorAll('.party-block').length>=2||box.querySelectorAll('.party-number,.final-party-number').length>=2)break;
    }
    if(!box||box===root)return;
    let blocks=[...box.querySelectorAll('.party-block')].filter(el=>el.getClientRects().length);
    if(blocks.length<2){
      const nums=[...box.querySelectorAll('.party-number,.final-party-number')].filter(el=>el.getClientRects().length);
      blocks=nums.map(n=>n.parentElement).filter(Boolean);
    }
    if(blocks.length<2)return;
    const ordered=blocks.slice().sort((a,b)=>a.getBoundingClientRect().left-b.getBoundingClientRect().left);
    const demBlock=ordered[0],repBlock=ordered[ordered.length-1];
    const ensure=(block,cls,text,before)=>{
      if(!block)return;
      let label=block.querySelector('.wg-sticky-party-label.'+cls);
      if(!label){
        label=document.createElement('span');label.className='wg-sticky-party-label '+cls;label.textContent=text;
        const num=block.querySelector('.party-number,.final-party-number');
        if(before&&num)block.insertBefore(label,num);else if(num)num.insertAdjacentElement('afterend',label);else block.appendChild(label);
      }
      label.textContent=text;
      label.style.setProperty('display','block','important');
      label.style.setProperty('opacity','1','important');
      label.style.setProperty('visibility','visible','important');
      label.style.setProperty('position','relative','important');
      label.style.setProperty('z-index','20','important');
      label.style.setProperty('pointer-events','none','important');
      label.style.setProperty('color',cls==='dem'?'#2763b8':'#bd2937','important');
      [...block.querySelectorAll('*')].filter(el=>el!==label&&!el.classList.contains('wg-sticky-party-label')&&new RegExp('^'+(cls==='dem'?'DEMOCRAT(?:IC)?':'REPUBLICAN')+'$','i').test(norm(el.textContent))).forEach(el=>el.style.setProperty('visibility','hidden','important'));
    };
    ensure(demBlock,'dem','DEMOCRATIC',true);
    ensure(repBlock,'rep','REPUBLICAN',false);
  }

  function fixGraham(){
    const root=document.getElementById('page-polls');if(!root)return;
    const visible=leafs(root).filter(el=>el.getClientRects().length);
    for(const el of visible.filter(x=>/^Graham Nordone$/i.test(norm(x.textContent)))){
      el.style.setProperty('color','#17263d','important');
      let row=el.parentElement;
      for(let i=0;row&&row!==root&&i<5;i++,row=row.parentElement){if(/Graham Nordone/i.test(norm(row.textContent))&&/45(?:\.0)?%?/.test(norm(row.textContent)))break;}
      if(!row||row===root)continue;
      row.querySelectorAll('*').forEach(x=>{const t=norm(x.textContent);if(/^45(?:\.0)?%$/.test(t))x.style.setProperty('color','#bd2937','important');});
    }
  }

  function apply(){reorderNav();electionCountdown();keepPartyLabels();fixGraham();}
  apply();[50,150,300,600,1000,1600,2500,4000].forEach(ms=>setTimeout(apply,ms));setInterval(apply,250);
  new MutationObserver(()=>requestAnimationFrame(apply)).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','style']});
  window.addEventListener('pageshow',apply);window.addEventListener('resize',apply);
})();

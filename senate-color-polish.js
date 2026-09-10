(()=>{
  const LIGHT_REP='#e65c66';
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const rgb=s=>{const m=String(s||'').match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);return m?[+m[1],+m[2],+m[3]]:null};
  const isOldRep=c=>{const v=rgb(c);return !!v&&Math.abs(v[0]-189)<=8&&Math.abs(v[1]-41)<=8&&Math.abs(v[2]-55)<=8};

  function inWillsCall(el,root){
    let p=el.parentElement;
    for(let i=0;p&&p!==root&&i<7;i++,p=p.parentElement){
      const t=norm(p.textContent);
      if(/will[’']s call/i.test(t)) return true;
    }
    return false;
  }

  function apply(){
    const root=document.getElementById('page-senate');
    if(!root) return;

    for(const el of root.querySelectorAll('*')){
      const cs=getComputedStyle(el);
      if(isOldRep(cs.color)) el.style.setProperty('color',LIGHT_REP,'important');
    }

    for(const el of root.querySelectorAll('*')){
      if(el.children.length) continue;
      if(/^Democrat$/i.test(norm(el.textContent))&&inWillsCall(el,root)){
        el.style.setProperty('color','#fff','important');
      }
    }
  }

  apply();
  [80,250,600,1200,2200].forEach(ms=>setTimeout(apply,ms));
  setInterval(apply,700);
  new MutationObserver(()=>{clearTimeout(window.__senateColorPolishTimer);window.__senateColorPolishTimer=setTimeout(apply,30)}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});
  window.addEventListener('pageshow',apply);
})();

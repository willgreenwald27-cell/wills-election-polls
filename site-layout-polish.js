(()=>{
  'use strict';
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const leafs=root=>root?[...root.querySelectorAll('*')].filter(el=>el.children.length===0):[];
  let queued=false;

  function ensureStyle(){
    let st=document.getElementById('wgSiteLayoutPolish');
    if(st)return;
    st=document.createElement('style');
    st.id='wgSiteLayoutPolish';
    st.textContent=`
      @media(min-width:900px){
        .site-header{padding-left:30px!important;padding-right:30px!important;gap:24px!important}
        .site-header .nav{gap:6px!important}
        .site-header .nav>button:not(#editToggle):not(#settingsBtn){padding-left:14px!important;padding-right:14px!important}
        #page-senate .page-head-inner{padding-left:30px!important;padding-right:30px!important}
        #page-senate .content{padding:12px 16px 52px!important}
      }
      #page-senate .page-head{margin-bottom:0!important}
      #page-senate .content{box-sizing:border-box!important}
      #page-senate .data-page-grid,#page-senate .forecast-layout{gap:18px!important}
      #page-senate .wg-senate-balance{padding:12px 4px 10px!important;margin-bottom:10px!important}
      #page-senate .wg-maine-panel{box-sizing:border-box!important;padding:20px 22px!important;border-radius:14px!important;box-shadow:0 18px 44px rgba(5,22,49,.24)!important;min-width:320px!important;max-width:370px!important}
      #page-senate .wg-maine-panel .candidate-line{padding:10px 0!important}
      #page-senate .wg-maine-panel .candidate-name{font-size:15px!important;line-height:1.2!important}
      #page-senate .wg-maine-panel .candidate-party{margin-top:2px!important;font-size:10px!important;letter-spacing:.65px!important}
      #page-senate .wg-maine-panel .candidate-metrics b,#page-senate .wg-maine-panel .candidate-metrics strong{font-size:20px!important}
      #page-senate .wg-call-card{margin-top:9px!important;padding:12px 14px!important;border-radius:10px!important;background:linear-gradient(135deg,rgba(135,35,52,.62),rgba(96,35,63,.52))!important;border:1px solid rgba(237,91,105,.9)!important;box-sizing:border-box!important}
      #page-senate .wg-call-card .wg-call-winner{font-family:Georgia,'Times New Roman',serif!important;font-size:21px!important;line-height:1.08!important;font-weight:800!important;color:#fff!important}
      #page-senate .wg-call-card .prediction-copy{display:block!important;margin-top:6px!important;font-family:Georgia,'Times New Roman',serif!important;font-size:15px!important;line-height:1.2!important;font-weight:800!important;color:#fff!important}
      #page-senate .wg-maine-panel .maine-why-note{margin:11px 0 0!important;padding:11px 0 0!important;border:0!important;border-top:1px solid rgba(255,255,255,.15)!important;border-radius:0!important;background:transparent!important;color:#e8eef7!important;font:700 12px/1.5 Inter,ui-sans-serif,system-ui,sans-serif!important;letter-spacing:0!important}
      #page-senate .wg-maine-panel .maine-why-note b{color:#fff!important}
      #page-home .senate-tiebreak,#page-home .final-tiebreak{display:none!important}

      #page-errors .ipe-swing{margin-top:34px!important}
      #page-errors .ipe-swing .ipe-section-head{margin-bottom:18px!important;align-items:end!important}
      #page-errors .ipe-swing .ipe-section-head h2{margin-bottom:7px!important}
      #page-errors .ipe-swing .ipe-section-head p{margin-top:0!important;line-height:1.55!important;max-width:860px!important}
      #page-errors .ipe-shocks{gap:14px!important}
      #page-errors .ipe-shock{min-height:190px!important;padding:18px 20px 20px!important;display:grid!important;grid-template-columns:auto 1fr!important;grid-template-areas:'bias races' 'years years' 'state state' 'cands cands' 'avg avg'!important;column-gap:14px!important;row-gap:0!important;align-content:start!important;align-items:center!important;box-sizing:border-box!important}
      #page-errors .ipe-shock-bias{grid-area:bias!important;position:static!important;margin:0!important;align-self:center!important;white-space:nowrap!important}
      #page-errors .ipe-shock-rank{grid-area:races!important;position:static!important;margin:0!important;align-self:center!important;white-space:nowrap!important;font-size:9px!important;letter-spacing:1px!important;opacity:.86!important}
      #page-errors .wg-shock-years{grid-area:years!important;display:block!important;margin-top:14px!important;font-size:10px!important;line-height:1.2!important;font-weight:900!important;letter-spacing:1.25px!important;color:rgba(255,255,255,.74)!important;text-transform:uppercase!important}
      #page-errors .ipe-shock>strong{grid-area:state!important;margin:6px 0 10px!important;font-size:31px!important;line-height:1!important}
      #page-errors .ipe-shock-cands{grid-area:cands!important;margin:0 0 9px!important;gap:7px!important}
      #page-errors .ipe-cand-pill{padding:6px 9px!important;font-size:10px!important}
      #page-errors .ipe-shock-foot{grid-area:avg!important;position:static!important;left:auto!important;right:auto!important;bottom:auto!important;margin:0!important;display:block!important;justify-content:initial!important;align-items:initial!important}
      #page-errors .ipe-shock-foot em{font-size:20px!important;line-height:1.05!important}
      @media(max-width:900px){
        #page-errors .ipe-shock{min-height:184px!important;grid-template-columns:1fr!important;grid-template-areas:'bias' 'races' 'years' 'state' 'cands' 'avg'!important;gap:0!important}
        #page-errors .ipe-shock-rank{margin-top:8px!important}
        #page-errors .wg-shock-years{margin-top:7px!important}
      }
    `;
    document.head.appendChild(st);
  }

  function findMainePanel(){
    const root=document.getElementById('page-senate');
    if(!root)return null;
    const candidates=leafs(root).filter(el=>norm(el.textContent)==='Maine'&&el.getClientRects().length);
    for(const m of candidates){
      let box=m.parentElement;
      for(let i=0;box&&box!==root&&i<14;i++,box=box.parentElement){
        const t=norm(box.textContent);
        const r=box.getBoundingClientRect();
        if(/Troy Jackson/i.test(t)&&/Susan Collins/i.test(t)&&/WILL[’']S CALL/i.test(t)&&r.width>=240&&r.width<=620)return box;
      }
    }
    return null;
  }

  function polishMaine(){
    const box=findMainePanel();
    if(!box)return;
    box.classList.add('wg-maine-panel');
    const all=leafs(box);
    const heading=all.find(el=>/^WILL[’']S CALL$/i.test(norm(el.textContent)));
    const copy=box.querySelector('.prediction-copy');
    if(copy)copy.textContent='Collins +1.3%';

    let callCard=copy?.parentElement||null;
    for(let i=0;callCard&&callCard!==box&&i<4;i++,callCard=callCard.parentElement){
      const t=norm(callCard.textContent);
      if(/Collins \+1\.3%|Jackson \+0\.4%|No prediction/i.test(t)&&/Democrat|Republican|Susan Collins/i.test(t))break;
    }
    if(callCard&&callCard!==box){
      callCard.classList.add('wg-call-card');
      const callLeaves=leafs(callCard);
      let winner=callLeaves.find(el=>/^(Democrat(?:ic)?|Republican)$/i.test(norm(el.textContent)));
      if(!winner)winner=callLeaves.find(el=>/^Susan Collins$/i.test(norm(el.textContent)));
      if(winner){winner.textContent='Susan Collins';winner.classList.add('wg-call-winner');}
      for(const el of callLeaves){
        const t=norm(el.textContent);
        if(/^(?:Jackson \+0\.4%|No prediction text entered yet\.|Collins \+1\.3%)$/i.test(t))el.textContent='Collins +1.3%';
      }
    }else if(heading){
      const hy=heading.getBoundingClientRect().bottom;
      const cutoff=all.find(el=>/^Win odds/i.test(norm(el.textContent)))?.getBoundingClientRect().top||Infinity;
      const candidate=all.find(el=>{
        const y=el.getBoundingClientRect().top;
        return y>=hy&&y<cutoff&&/^(Democrat(?:ic)?|Republican)$/i.test(norm(el.textContent));
      });
      if(candidate){candidate.textContent='Susan Collins';candidate.classList.add('wg-call-winner');candidate.parentElement?.classList.add('wg-call-card');}
    }

    let why=box.querySelector('.maine-why-note');
    if(!why){why=document.createElement('div');why.className='maine-why-note';box.appendChild(why);}
    why.innerHTML='<b>Why I think Maine could go red:</b> Collins has been underestimated by 5+ points in three straight cycles.';
  }

  function markSenateBalance(){
    const root=document.getElementById('page-senate'); if(!root)return;
    const leaves=leafs(root);
    const marker=leaves.find(el=>/50\s*\+\s*VP\s+FOR\s+MAJORITY/i.test(norm(el.textContent)));
    if(!marker)return;
    let box=marker.parentElement;
    for(let i=0;box&&box!==root&&i<6;i++,box=box.parentElement){
      const t=norm(box.textContent);
      if(/DEMOCRAT/i.test(t)&&/REPUBLICAN/i.test(t)&&/49/.test(t)&&/51/.test(t)){box.classList.add('wg-senate-balance');break;}
    }
  }

  function polishErrorCards(){
    const root=document.getElementById('page-errors'); if(!root)return;
    for(const card of root.querySelectorAll('.ipe-shock')){
      const rank=card.querySelector('.ipe-shock-rank');
      if(!rank)continue;
      const text=norm(rank.textContent);
      const m=text.match(/^(\d+)\s+Senate races\s*·\s*(.+)$/i);
      if(m){
        rank.textContent=`${m[1]} SENATE RACES`;
        let years=card.querySelector('.wg-shock-years');
        if(!years){years=document.createElement('span');years.className='wg-shock-years';rank.insertAdjacentElement('afterend',years);}
        years.textContent=m[2];
      }
    }
  }

  function polishGlobal(){
    document.querySelectorAll('#page-home .senate-tiebreak,#page-home .final-tiebreak').forEach(el=>el.remove());
  }

  function apply(){
    ensureStyle();
    polishGlobal();
    markSenateBalance();
    polishMaine();
    polishErrorCards();
  }
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply();});}
  apply();
  [80,250,700,1500,3000].forEach(ms=>setTimeout(apply,ms));
  setInterval(apply,1200);
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','style']});
  window.addEventListener('pageshow',apply);
  window.addEventListener('resize',apply);
})();

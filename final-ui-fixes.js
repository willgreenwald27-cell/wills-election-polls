(()=>{
  const PURPLE='#8051d2';
  const PURPLE_LIGHT='#efe8ff';
  const RED='#bd2937';
  const BLUE='#2763b8';
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();

  function partyColor(text){
    const p=norm(text).toLowerCase();
    if(p.includes('republican')||p==='r'||p==='gop') return RED;
    if(p.includes('democrat')||p==='d') return BLUE;
    return PURPLE;
  }

  function ensureIndependentStyle(){
    if(document.getElementById('force-independent-purple-style')) return;
    const style=document.createElement('style');
    style.id='force-independent-purple-style';
    style.textContent=`
      :root{--solid-i:${PURPLE}!important;--likely-i:${PURPLE}!important;--lean-i:${PURPLE}!important;--tilt-i:${PURPLE}!important}
      #page-senate .candidate-name.ind,#page-senate .candidate-name.independent,#page-senate .candidate-name.osborn,
      #page-senate .candidate-party.ind,#page-senate .candidate-party.independent,#page-senate .candidate-party.osborn,
      #page-senate .candidate-metrics .ind,#page-senate .candidate-metrics .independent,#page-senate .candidate-metrics .osborn,
      #page-polls .ind,#page-polls .independent,#page-polls .osborn,
      #page-betting .ind,#page-betting .independent,#page-betting .osborn{color:${PURPLE}!important;border-color:${PURPLE}!important}
      #page-senate .oddsbar .ind,#page-senate .oddsbar .independent,#page-senate .oddsbar .osborn,
      #page-betting .mini-bar.ind i,#page-betting .mini-bar.independent i,#page-betting .mini-bar.osborn i,
      #page-betting .kleg.i,#page-betting .kleg.ind,#page-betting .kleg.independent,#page-betting .kleg.osborn,
      #page-senate .mini-key.ind,#page-senate .mini-key.independent,#page-senate .mini-key.osborn{background:${PURPLE}!important}
      #page-betting .kalshi-market-tile-odds .i,#page-betting .kalshi-market-tile-odds .ind,#page-betting .kalshi-market-tile-odds .independent,#page-betting .kalshi-market-tile-odds .osborn{background:${PURPLE_LIGHT}!important;color:${PURPLE}!important;border-color:${PURPLE}!important}
    `;
    document.head.appendChild(style);
  }

  function replaceExactText(root,from,to){
    if(!root) return;
    for(const el of root.querySelectorAll('*')){
      if(el.children.length===0&&norm(el.textContent)===from) el.textContent=to;
    }
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    for(const node of nodes){
      if(norm(node.nodeValue)===from) node.nodeValue=(node.nodeValue||'').replace(from,to);
    }
  }

  function fixHomeStats(){
    const root=document.getElementById('page-home');
    if(!root) return;
    const metrics=root.querySelector('.reference-metrics');
    if(!metrics) return;

    for(const card of [...metrics.children]){
      const t=norm(card.textContent).toLowerCase();
      if(t.includes('polls')&&t.includes('entered')){
        replaceExactText(card,'13','88');
        for(const el of card.querySelectorAll('*')){
          const raw=norm(el.textContent);
          if(el.children.length===0&&/^13\s+polls?\s+entered$/i.test(raw)) el.textContent=raw.replace(/^13/,'88');
        }
      }
      if(t.includes('latest')&&t.includes('update')){
        replaceExactText(card,'Sep 6, 2026','Sep 7, 2026');
        replaceExactText(card,'Sep. 6, 2026','Sep 7, 2026');
        replaceExactText(card,'2026-09-06','Sep 7, 2026');
      }
    }
  }

  function isIndependentText(text){
    const p=norm(text).toLowerCase();
    return p==='i'||p.includes('independent')||p.includes('unaffiliated')||p.includes('other');
  }

  function paintIndependentContext(label){
    label.style.setProperty('color',PURPLE,'important');
    let line=label.closest('.candidate-line');
    if(line){
      line.querySelectorAll('.candidate-name,.candidate-party,.candidate-metrics b,.candidate-metrics strong,.candidate-metrics span').forEach(el=>{
        el.style.setProperty('color',PURPLE,'important');
      });
    }

    let box=label.parentElement;
    for(let depth=0;box&&box!==document.body&&depth<8;depth++,box=box.parentElement){
      const cls=String(box.className||'').toLowerCase();
      if(/candidate|poll|market|odds|race|tile|row|card/.test(cls)){
        box.querySelectorAll('.ind,.independent,.osborn,[class*="independent"]').forEach(el=>{
          el.style.setProperty('color',PURPLE,'important');
          if(/bar|fill|swatch|dot|key|segment|meter/.test(String(el.className||'').toLowerCase())){
            el.style.setProperty('background',PURPLE,'important');
          }
        });
      }
    }
  }

  function fixPartyLinesAndBars(){
    const root=document.body;
    if(!root) return;

    for(const line of [...root.querySelectorAll('.candidate-line')]){
      const party=line.querySelector('.candidate-party');
      if(!party) continue;
      const color=partyColor(party.textContent);
      line.querySelectorAll('.candidate-name,.candidate-party,.candidate-metrics b,.candidate-metrics strong').forEach(el=>{
        el.style.setProperty('color',color,'important');
      });
    }

    for(const bar of [...root.querySelectorAll('.oddsbar')]){
      let panel=bar.parentElement;
      while(panel&&panel!==root){
        const lines=[...panel.querySelectorAll('.candidate-line')];
        if(lines.length>=2){
          const p1=lines[0].querySelector('.candidate-party');
          const p2=lines[1].querySelector('.candidate-party');
          const c1=partyColor(p1?p1.textContent:'');
          const c2=partyColor(p2?p2.textContent:'');
          const a=bar.querySelector('.oddsbar-a');
          const b=bar.querySelector('.oddsbar-b');
          if(a) a.style.setProperty('background',c1,'important');
          if(b) b.style.setProperty('background',c2,'important');
          break;
        }
        panel=panel.parentElement;
      }
    }

    for(const label of [...root.querySelectorAll('.candidate-party')]){
      if(isIndependentText(label.textContent)) paintIndependentContext(label);
    }

    for(const el of [...root.querySelectorAll('#page-senate *,#page-polls *,#page-betting *')]){
      if(el.children.length!==0) continue;
      if(!isIndependentText(el.textContent)) continue;
      el.style.setProperty('color',PURPLE,'important');
      const badge=el.closest('.party-badge,.pill,.chip,.tag,.legend-item,.candidate-line,.candidate-feed-row,.poll-row,.kalshi-market-tile');
      if(badge){
        badge.style.setProperty('border-color',PURPLE,'important');
        badge.querySelectorAll('.dot,.swatch,.key,.mini-key,i').forEach(mark=>mark.style.setProperty('background',PURPLE,'important'));
      }
    }
  }

  function enforce(){
    ensureIndependentStyle();
    fixHomeStats();
    fixPartyLinesAndBars();
  }

  let queued=false;
  function schedule(){
    if(queued) return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;enforce();});
  }

  enforce();
  setTimeout(enforce,100);
  setTimeout(enforce,500);
  setTimeout(enforce,1200);
  setTimeout(enforce,2500);
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true});
  window.addEventListener('pageshow',enforce);
  window.addEventListener('focus',enforce);
  window.addEventListener('resize',enforce);
})();

(()=>{
  const RED='#bd2937';
  const BLUE='#2763b8';

  function norm(v){return String(v||'').replace(/\s+/g,' ').trim();}
  function leafs(root){return [...root.querySelectorAll('*')].filter(el=>el.children.length===0);}

  function applyMobilePartyColors(){
    if(!window.matchMedia('(max-width:760px)').matches) return;
    const root=document.getElementById('page-senate');
    if(!root) return;

    const cards=[];
    for(const partyEl of leafs(root)){
      const pt=norm(partyEl.textContent).toLowerCase();
      const party=pt==='republican'?'R':((pt==='democrat'||pt==='democratic')?'D':null);
      if(!party) continue;

      let card=partyEl.parentElement;
      for(let i=0;card&&card!==root&&i<5;i++,card=card.parentElement){
        const t=norm(card.textContent);
        if(/poll average/i.test(t)&&/\d+(?:\.\d+)?%/.test(t)) break;
      }
      if(!card||card===root) continue;

      const ls=leafs(card);
      const pct=ls.find(el=>/^\d+(?:\.\d+)?%$/.test(norm(el.textContent)));
      const name=ls.find(el=>{
        const t=norm(el.textContent);
        return t && /[A-Za-z]/.test(t) && t.split(/\s+/).length>=2 &&
          !/^(Republican|Democrat(?:ic)?|POLL AVERAGE|\d+(?:\.\d+)?%)$/i.test(t);
      });
      if(!name) continue;

      const color=party==='R'?RED:BLUE;
      name.style.setProperty('color',color,'important');
      partyEl.style.setProperty('color',color,'important');
      if(pct) pct.style.setProperty('color',color,'important');
      card.setAttribute('data-mobile-party',party);
      cards.push({name:norm(name.textContent),party,color});
    }

    if(cards.length<2) return;
    const all=leafs(root);
    const labels=[];
    for(const c of cards){
      const key=c.name.toLowerCase()+':';
      for(const el of all){
        const t=norm(el.textContent);
        if(t.toLowerCase().startsWith(key)&&/\d+(?:\.\d+)?%$/.test(t)){
          el.style.setProperty('color',c.color,'important');
          labels.push({el,...c});
        }
      }
    }

    if(labels.length<2) return;
    labels.sort((a,b)=>a.el.getBoundingClientRect().left-b.el.getBoundingClientRect().left);
    const first=labels[0],second=labels[1];
    const firstPct=Number((norm(first.el.textContent).match(/(\d+(?:\.\d+)?)%$/)||[])[1]||50);
    const split=Math.max(0,Math.min(100,firstPct));
    const heading=all.find(el=>/will'?s statistical odds/i.test(norm(el.textContent)));
    const top=heading?heading.getBoundingClientRect().bottom:Math.min(first.el.getBoundingClientRect().top,second.el.getBoundingClientRect().top)-70;
    const bottom=Math.min(first.el.getBoundingClientRect().top,second.el.getBoundingClientRect().top);

    const colored=[];
    for(const el of root.querySelectorAll('div,span,i')){
      const r=el.getBoundingClientRect();
      if(r.width<18||r.height<4||r.height>30||r.top<top-6||r.bottom>bottom+5) continue;
      const bg=getComputedStyle(el).backgroundColor||'';
      const nums=bg.match(/\d+/g);
      if(!nums||nums.length<3) continue;
      const rgb=nums.slice(0,3).map(Number);
      if(Math.max(...rgb)-Math.min(...rgb)<35) continue;
      colored.push({el,r});
    }
    colored.sort((a,b)=>a.r.left-b.r.left||b.r.width-a.r.width);
    const segs=[];
    for(const item of colored){
      if(!segs.some(x=>Math.abs(x.r.left-item.r.left)<2&&Math.abs(x.r.width-item.r.width)<2)) segs.push(item);
    }
    if(segs.length>=2){
      segs[0].el.style.setProperty('background',first.color,'important');
      segs[1].el.style.setProperty('background',second.color,'important');
    }

    for(const el of root.querySelectorAll('div,span')){
      const r=el.getBoundingClientRect();
      if(r.width<150||r.height<4||r.height>30||r.top<top-6||r.bottom>bottom+5) continue;
      const cs=getComputedStyle(el);
      if(cs.backgroundImage&&cs.backgroundImage!=='none'){
        el.style.setProperty('background',`linear-gradient(to right, ${first.color} 0%, ${first.color} ${split}%, ${second.color} ${split}%, ${second.color} 100%)`,'important');
      }
    }
  }

  applyMobilePartyColors();
  new MutationObserver(applyMobilePartyColors).observe(document.body,{childList:true,subtree:true,characterData:true});
  window.addEventListener('pageshow',applyMobilePartyColors);
  window.addEventListener('resize',applyMobilePartyColors);
})();
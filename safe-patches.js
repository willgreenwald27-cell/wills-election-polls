(()=>{
  const STYLE_ID='safe-ui-patches-v1';
  const SCHOOL_ID='aboutSchool';
  const REP_RED='#c62828';
  const PAGE_NAMES=['home','senate','polls','betting','errors','about'];

  function ensureStyle(){
    if(document.getElementById(STYLE_ID)) return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #page-senate .map-wrap svg{transform:scale(1.14)!important;transform-origin:center center!important}
      #page-betting .live-kalshi-title{display:flex!important;align-items:center!important}
      #page-betting .live-kalshi-dot{display:inline-block!important;width:10px!important;height:10px!important;flex:0 0 10px!important;border-radius:50%!important;background:#e32636!important;margin-right:9px!important;vertical-align:middle!important;animation:kalshiPulseSafe 1.15s ease-in-out infinite!important}
      @keyframes kalshiPulseSafe{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(227,38,54,.42)}50%{opacity:.32;box-shadow:0 0 0 6px rgba(227,38,54,0)}}
      @media(max-width:650px){#page-senate .map-wrap svg{transform:scale(1.08)!important}}
      @media(max-width:760px){#page-senate [data-safe-republican-red="1"]{color:#c62828!important;fill:#c62828!important;border-color:#c62828!important}}
    `;
    document.head.appendChild(style);
  }

  function ensureStableTabs(){
    if(window.__willNavigate) return;
    if(document.querySelector('script[data-reload-free-nav="1"],script[data-final-nav-controller="1"]')) return;
    const script=document.createElement('script');
    script.src='/navigation-controller.js?v=20260907-1910';
    script.async=false;
    script.setAttribute('data-reload-free-nav','1');
    document.head.appendChild(script);
  }

  function ensureKalshiHeading(){
    const root=document.getElementById('page-betting');if(!root)return;
    const heading=[...root.querySelectorAll('h1,h2,h3')].find(el=>/^(live\s+)?kalshi\s+senate\s+odds$/i.test((el.textContent||'').replace(/\s+/g,' ').trim()));
    if(!heading)return;heading.classList.add('live-kalshi-title');
    if(!heading.querySelector('.live-kalshi-dot')){heading.textContent='';const dot=document.createElement('span');dot.className='live-kalshi-dot';dot.setAttribute('aria-hidden','true');heading.appendChild(dot);heading.appendChild(document.createTextNode('Live Kalshi Senate Odds'));}
  }

  function buildSchoolCard(){
    const section=document.createElement('section');section.id=SCHOOL_ID;section.setAttribute('aria-label','School');section.style.cssText='margin:14px 0 18px;padding:16px 18px;border:1px solid #d9dee7;border-radius:16px;background:#fff;display:flex;align-items:center;gap:18px;box-shadow:0 7px 22px rgba(20,34,53,.055)';
    section.innerHTML=`<div style="width:86px;height:72px;flex:0 0 86px;display:flex;align-items:center;justify-content:center;background:#f7f8fa;border-radius:13px;border:1px solid #e4e8ee"><svg viewBox="0 0 120 120" width="70" height="70" role="img" aria-label="Redwood High School redwood tree logo"><text x="7" y="99" font-family="Georgia,serif" font-size="96" font-weight="900" fill="#d92732" stroke="#17263d" stroke-width="2.2" paint-order="stroke">R</text><path d="M61 11 51 29h7L45 45h10L41 63h12L37 84h18v23h12V84h18L69 63h12L67 45h9L64 29h7Z" fill="#177548" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg></div><div style="min-width:0"><div style="font-size:9px;font-weight:950;letter-spacing:1.4px;color:#d92732;text-transform:uppercase;margin-bottom:4px">School</div><h3 style="margin:0;font-family:Georgia,serif;font-size:21px;line-height:1.15;color:#17263d">Redwood High School</h3><p style="margin:5px 0 0;font-size:12px;line-height:1.45;color:#66758a">Larkspur, California</p></div>`;
    return section;
  }
  function ensureSchoolCard(){const root=document.getElementById('page-about');if(!root||document.getElementById(SCHOOL_ID))return;const strip=root.querySelector('.about-stat-strip');if(strip)strip.insertAdjacentElement('afterend',buildSchoolCard());}

  function normalized(value){return String(value||'').replace(/\s+/g,' ').trim().toLowerCase();}
  function isRepublicanParty(value){const p=normalized(value);return p==='r'||p==='rep'||p==='gop'||p.includes('republican');}
  function mobileRepublicanNames(){const names=[];try{if(typeof stateData!=='undefined'&&stateData&&typeof stateData==='object'){Object.values(stateData).forEach(s=>{if(!s)return;if(isRepublicanParty(s.candidate1Party)&&s.candidate1)names.push(String(s.candidate1).trim());if(isRepublicanParty(s.candidate2Party)&&s.candidate2)names.push(String(s.candidate2).trim());});}}catch(e){}return[...new Set(names.filter(Boolean))];}
  function markRepublicansRedOnMobile(){
    if(!window.matchMedia('(max-width:760px)').matches)return;const root=document.getElementById('page-senate');if(!root)return;const names=mobileRepublicanNames(),normalizedNames=names.map(name=>[name,normalized(name)]);
    const mark=el=>{if(!el||!root.contains(el))return;el.setAttribute('data-safe-republican-red','1');el.style.setProperty('color',REP_RED,'important');if(el.namespaceURI==='http://www.w3.org/2000/svg')el.style.setProperty('fill',REP_RED,'important');};
    root.querySelectorAll('[data-party],[data-candidate-party],[aria-label]').forEach(el=>{const party=el.getAttribute('data-party')||el.getAttribute('data-candidate-party')||'',aria=el.getAttribute('aria-label')||'';if(isRepublicanParty(party)||/\brepublican\b/i.test(aria)||/\(R\)\b/i.test(aria))mark(el);});
    root.querySelectorAll('*').forEach(el=>{const text=normalized(el.textContent);if(!text)return;if(el.children.length===0&&(text==='(r)'||text==='republican'||text==='gop'))mark(el);if(el.children.length>0)return;const match=normalizedNames.find(([,name])=>text===name||text===name+' (r)'||text.startsWith(name+' —')||text.startsWith(name+' -')||text.startsWith(name+' '));if(!match)return;mark(el);let container=el.parentElement;for(let depth=0;container&&container!==root&&depth<2;depth++,container=container.parentElement){const ct=normalized(container.textContent),count=normalizedNames.reduce((n,[,name])=>n+(ct.includes(name)?1:0),0);if(count>1)break;container.querySelectorAll('span,strong,b,em,small').forEach(child=>{const tx=normalized(child.textContent);if(tx&&(tx.includes(match[1])||/^[-+]?\d+(?:\.\d+)?%?$/.test(tx)||/^\(?r\)?$/.test(tx)||tx==='republican'||tx==='gop'))mark(child);});}});
  }

  function apply(){ensureStyle();ensureStableTabs();ensureKalshiHeading();ensureSchoolCard();markRepublicansRedOnMobile();}
  apply();new MutationObserver(apply).observe(document.body,{childList:true,subtree:true,characterData:true});window.addEventListener('pageshow',apply);window.addEventListener('resize',apply);
})();
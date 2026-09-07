(()=>{
  const STYLE_ID='safe-ui-patches-v1';
  const SCHOOL_ID='aboutSchool';

  function ensureStyle(){
    if(document.getElementById(STYLE_ID)) return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #page-senate .map-wrap svg{
        transform:scale(1.14)!important;
        transform-origin:center center!important;
      }
      #page-betting .live-kalshi-title{
        display:flex!important;
        align-items:center!important;
      }
      #page-betting .live-kalshi-dot{
        display:inline-block!important;
        width:10px!important;
        height:10px!important;
        flex:0 0 10px!important;
        border-radius:50%!important;
        background:#e32636!important;
        margin-right:9px!important;
        vertical-align:middle!important;
        animation:kalshiPulseSafe 1.15s ease-in-out infinite!important;
      }
      @keyframes kalshiPulseSafe{
        0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(227,38,54,.42)}
        50%{opacity:.32;box-shadow:0 0 0 6px rgba(227,38,54,0)}
      }
      @media(max-width:650px){
        #page-senate .map-wrap svg{transform:scale(1.08)!important}
      }
    `;
    document.head.appendChild(style);
  }

  function ensureKalshiHeading(){
    const root=document.getElementById('page-betting');
    if(!root) return;
    const heading=[...root.querySelectorAll('h1,h2,h3')].find(el=>
      /^(live\s+)?kalshi\s+senate\s+odds$/i.test((el.textContent||'').replace(/\s+/g,' ').trim())
    );
    if(!heading) return;
    heading.classList.add('live-kalshi-title');
    if(!heading.querySelector('.live-kalshi-dot')){
      heading.textContent='';
      const dot=document.createElement('span');
      dot.className='live-kalshi-dot';
      dot.setAttribute('aria-hidden','true');
      heading.appendChild(dot);
      heading.appendChild(document.createTextNode('Live Kalshi Senate Odds'));
    }
  }

  function buildSchoolCard(){
    const section=document.createElement('section');
    section.id=SCHOOL_ID;
    section.setAttribute('aria-label','School');
    section.style.cssText='margin:14px 0 18px;padding:16px 18px;border:1px solid #d9dee7;border-radius:16px;background:#fff;display:flex;align-items:center;gap:18px;box-shadow:0 7px 22px rgba(20,34,53,.055)';
    section.innerHTML=`
      <div style="width:86px;height:72px;flex:0 0 86px;display:flex;align-items:center;justify-content:center;background:#f7f8fa;border-radius:13px;border:1px solid #e4e8ee">
        <svg viewBox="0 0 120 120" width="70" height="70" role="img" aria-label="Redwood High School redwood tree logo">
          <text x="7" y="99" font-family="Georgia,serif" font-size="96" font-weight="900" fill="#d92732" stroke="#17263d" stroke-width="2.2" paint-order="stroke">R</text>
          <path d="M61 11 51 29h7L45 45h10L41 63h12L37 84h18v23h12V84h18L69 63h12L67 45h9L64 29h7Z" fill="#177548" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>
        </svg>
      </div>
      <div style="min-width:0">
        <div style="font-size:9px;font-weight:950;letter-spacing:1.4px;color:#d92732;text-transform:uppercase;margin-bottom:4px">School</div>
        <h3 style="margin:0;font-family:Georgia,serif;font-size:21px;line-height:1.15;color:#17263d">Redwood High School</h3>
        <p style="margin:5px 0 0;font-size:12px;line-height:1.45;color:#66758a">Larkspur, California</p>
      </div>`;
    return section;
  }

  function ensureSchoolCard(){
    const root=document.getElementById('page-about');
    if(!root || document.getElementById(SCHOOL_ID)) return;
    const strip=root.querySelector('.about-stat-strip');
    if(!strip) return;
    strip.insertAdjacentElement('afterend',buildSchoolCard());
  }

  function apply(){
    ensureStyle();
    ensureKalshiHeading();
    ensureSchoolCard();
  }

  apply();
  new MutationObserver(apply).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('pageshow',apply);
})();

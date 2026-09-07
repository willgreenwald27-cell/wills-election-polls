(()=>{
  const PAGES=[
    ['home','Home'],
    ['senate','2026 Senate Prediction'],
    ['governor','2026 Governor Map'],
    ['polls','New Polls'],
    ['betting','Betting Odds'],
    ['errors','Past Polling Errors'],
    ['about','About Me']
  ];
  const PAGE_KEYS=new Set(PAGES.map(([k])=>k));
  const HIDDEN_CLASS='will-spa-hidden';
  let currentPage='home';
  let applying=false;

  function installStyles(){
    if(document.getElementById('will-spa-nav-style')) return;
    const style=document.createElement('style');
    style.id='will-spa-nav-style';
    style.textContent=`
      .${HIDDEN_CLASS}{display:none!important}
      .site-header .nav[data-spa-owned="1"]>button[data-spa-page]{touch-action:manipulation;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none}
      #page-governor-inline{width:100%;min-height:calc(100vh - 90px);background:#fff}
      #page-governor-inline .governor-inline-frame{display:block;width:100%;min-height:calc(100vh - 90px);border:0;background:#fff}
    `;
    document.head.appendChild(style);
  }

  function getPageElement(key){
    if(key==='governor') return ensureGovernorPage();
    return document.getElementById('page-'+key);
  }

  function ensureGovernorPage(){
    let page=document.getElementById('page-governor-inline');
    if(page) return page;
    page=document.createElement('section');
    page.id='page-governor-inline';
    page.className='page '+HIDDEN_CLASS;
    page.setAttribute('aria-label','2026 Governor Map');
    const frame=document.createElement('iframe');
    frame.className='governor-inline-frame';
    frame.src='/governor.html?embedded=1';
    frame.title='2026 Governor Map';
    frame.loading='eager';
    frame.addEventListener('load',()=>{
      try{
        const d=frame.contentDocument;
        if(!d) return;
        const s=d.createElement('style');
        s.textContent='.site-header,.footer{display:none!important}body{margin:0!important;padding-top:0!important}';
        d.head.appendChild(s);
        const resize=()=>{
          const h=Math.max(d.documentElement.scrollHeight,d.body?d.body.scrollHeight:0,window.innerHeight-90);
          frame.style.height=h+'px';
        };
        resize();
        new ResizeObserver(resize).observe(d.documentElement);
      }catch(e){}
    });
    page.appendChild(frame);
    const about=document.getElementById('page-about');
    if(about&&about.parentNode) about.parentNode.insertBefore(page,about);
    else document.body.appendChild(page);
    return page;
  }

  function detectInitialPage(){
    for(const [key] of PAGES){
      if(key==='governor') continue;
      const el=document.getElementById('page-'+key);
      if(!el) continue;
      try{
        const cs=getComputedStyle(el);
        if(!el.hidden&&cs.display!=='none'&&cs.visibility!=='hidden') return key;
      }catch(e){}
    }
    return 'home';
  }

  function buildNav(){
    const nav=document.querySelector('.site-header .nav');
    if(!nav) return false;
    if(nav.getAttribute('data-spa-owned')==='1'&&nav.querySelectorAll(':scope > [data-spa-page]').length===PAGES.length) return true;

    nav.textContent='';
    nav.setAttribute('data-spa-owned','1');
    for(const [key,label] of PAGES){
      const b=document.createElement('button');
      b.type='button';
      b.textContent=label;
      b.setAttribute('data-spa-page',key);
      b.setAttribute('aria-label',label);
      if(key==='governor') b.setAttribute('data-governor-link','');
      nav.appendChild(b);
    }
    updateActiveButton();
    return true;
  }

  function updateActiveButton(){
    const nav=document.querySelector('.site-header .nav[data-spa-owned="1"]');
    if(!nav) return;
    nav.querySelectorAll('[data-spa-page]').forEach(b=>{
      const active=b.getAttribute('data-spa-page')===currentPage;
      b.classList.toggle('active',active);
      b.setAttribute('aria-current',active?'page':'false');
    });
  }

  function enforceVisibility(key,scroll=true){
    if(applying) return;
    applying=true;
    try{
      for(const [pageKey] of PAGES){
        const el=getPageElement(pageKey);
        if(!el) continue;
        const active=pageKey===key;
        el.hidden=!active;
        el.classList.toggle(HIDDEN_CLASS,!active);
        el.classList.toggle('active',active);
        if(active){
          el.style.removeProperty('display');
          if(getComputedStyle(el).display==='none') el.style.setProperty('display','block','important');
        }else{
          el.style.removeProperty('display');
        }
      }
      currentPage=key;
      updateActiveButton();
      document.body.setAttribute('data-current-page',key);
      if(scroll) window.scrollTo({top:0,left:0,behavior:'auto'});
    }finally{
      applying=false;
    }
  }

  function navigate(key){
    if(!PAGE_KEYS.has(key)) return;
    if(key===currentPage){
      updateActiveButton();
      return;
    }
    enforceVisibility(key,true);
  }

  function clickHandler(e){
    const btn=e.target&&e.target.closest?e.target.closest('.site-header .nav[data-spa-owned="1"] [data-spa-page]'):null;
    if(!btn) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    navigate(btn.getAttribute('data-spa-page'));
  }

  function blockLegacyNav(e){
    const el=e.target&&e.target.closest?e.target.closest('.site-header .nav a[href],.site-header .nav [data-page-link]'):null;
    if(!el) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }

  function init(){
    installStyles();
    currentPage=detectInitialPage();
    ensureGovernorPage();
    buildNav();
    enforceVisibility(currentPage,false);
    document.addEventListener('click',clickHandler,true);
    document.addEventListener('click',blockLegacyNav,true);

    // Keep the navigation owned by this controller. If legacy code rewrites it,
    // immediately restore the stable button-only version without reloading.
    setInterval(()=>{
      const nav=document.querySelector('.site-header .nav');
      if(!nav) return;
      const valid=nav.getAttribute('data-spa-owned')==='1'&&nav.querySelectorAll(':scope > [data-spa-page]').length===PAGES.length;
      if(!valid) buildNav();
      enforceVisibility(currentPage,false);
    },400);

    window.addEventListener('pageshow',()=>enforceVisibility(currentPage,false));
    window.__willNavigate=navigate;
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();

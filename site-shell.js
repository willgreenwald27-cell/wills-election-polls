(()=>{
  const PAGES=[
    ['home','Home'],
    ['senate','2026 Senate Prediction'],
    ['governor','2026 Governor Map'],
    ['polls','New Polls'],
    ['betting','Betting Odds'],
    ['errors','Past Polling Errors'],
    ['pastmaps','Past Senate Maps'],
    ['about','About Me']
  ];
  const KEYS=new Set(PAGES.map(x=>x[0]));
  let current='home',busy=false,observer=null;

  function style(){
    if(document.getElementById('will-stable-shell-style'))return;
    const s=document.createElement('style');s.id='will-stable-shell-style';s.textContent=`
      .will-shell-hidden{display:none!important}
      #page-governor-inline,#page-pastmaps-inline{width:100%;min-height:calc(100vh - 82px);background:#fff}
      .will-shell-frame{display:block;width:100%;min-height:calc(100vh - 82px);border:0;background:#fff}
      .site-header .nav[data-will-shell="1"]>button{touch-action:manipulation;-webkit-tap-highlight-color:transparent}
    `;document.head.appendChild(s);
  }

  function makeFramePage(key,src,label){
    const id='page-'+key+'-inline';let page=document.getElementById(id);if(page)return page;
    page=document.createElement('section');page.id=id;page.className='page will-shell-hidden';page.hidden=true;page.setAttribute('aria-label',label);
    const frame=document.createElement('iframe');frame.className='will-shell-frame';frame.src=src;frame.title=label;frame.loading='eager';
    const resize=()=>{try{const d=frame.contentDocument;if(!d)return;const h=Math.max(d.documentElement.scrollHeight,d.body?d.body.scrollHeight:0,window.innerHeight-82);frame.style.height=h+'px';}catch(e){}};
    frame.addEventListener('load',()=>{try{const d=frame.contentDocument;if(d){const st=d.createElement('style');st.textContent='.site-header,.footer{display:none!important}body{margin:0!important;padding-top:0!important}';d.head.appendChild(st);if(d.body)d.body.setAttribute('data-embedded','1');new ResizeObserver(resize).observe(d.documentElement);}}catch(e){}resize();});
    page.appendChild(frame);
    const about=document.getElementById('page-about');if(about&&about.parentNode)about.parentNode.insertBefore(page,about);else document.body.appendChild(page);
    return page;
  }

  function pageEl(key){
    if(key==='governor')return makeFramePage('governor','/governor.html?embedded=1','2026 Governor Map');
    if(key==='pastmaps')return makeFramePage('pastmaps','/past-senate-maps.html?embedded=1','Past Senate Maps');
    return document.getElementById('page-'+key);
  }

  function detect(){for(const [k] of PAGES){if(k==='governor'||k==='pastmaps')continue;const el=document.getElementById('page-'+k);if(!el)continue;try{const cs=getComputedStyle(el);if(!el.hidden&&cs.display!=='none'&&cs.visibility!=='hidden')return k;}catch(e){}}return'home';}

  function active(){const nav=document.querySelector('.site-header .nav[data-will-shell="1"]');if(!nav)return;nav.querySelectorAll('[data-will-page]').forEach(b=>{const on=b.dataset.willPage===current;b.classList.toggle('active',on);b.setAttribute('aria-current',on?'page':'false');});}

  function buildNav(){const nav=document.querySelector('.site-header .nav');if(!nav)return false;const valid=nav.dataset.willShell==='1'&&nav.querySelectorAll(':scope > [data-will-page]').length===PAGES.length;if(valid)return true;nav.textContent='';nav.dataset.willShell='1';for(const [k,label] of PAGES){const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.willPage=k;b.setAttribute('aria-label',label);nav.appendChild(b);}active();return true;}

  function show(key,scroll=true){if(!KEYS.has(key)||busy)return;busy=true;try{for(const [k] of PAGES){const el=pageEl(k);if(!el)continue;const on=k===key;el.hidden=!on;el.classList.toggle('will-shell-hidden',!on);el.classList.toggle('active',on);if(on){el.style.removeProperty('display');if(getComputedStyle(el).display==='none')el.style.setProperty('display','block','important');}else el.style.removeProperty('display');}current=key;document.body.dataset.currentPage=key;active();if(scroll)window.scrollTo({top:0,left:0,behavior:'auto'});if(key==='governor'||key==='pastmaps'){const frame=pageEl(key)?.querySelector('iframe');if(frame)try{frame.contentWindow.dispatchEvent(new Event('resize'));}catch(e){}}}finally{busy=false;}}

  function click(e){const b=e.target.closest&&e.target.closest('.site-header .nav[data-will-shell="1"] [data-will-page]');if(!b)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();show(b.dataset.willPage,true);}

  function protect(){const nav=document.querySelector('.site-header .nav');if(!nav)return;const valid=nav.dataset.willShell==='1'&&nav.querySelectorAll(':scope > [data-will-page]').length===PAGES.length;if(!valid)buildNav();active();}

  function init(){style();current=detect();pageEl('governor');pageEl('pastmaps');buildNav();show(current,false);document.addEventListener('click',click,true);observer=new MutationObserver(()=>requestAnimationFrame(protect));observer.observe(document.body,{childList:true,subtree:true});window.addEventListener('pageshow',()=>show(current,false));window.__willNavigate=key=>show(key,true);window.__willSiteShell={navigate:window.__willNavigate,current:()=>current};}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
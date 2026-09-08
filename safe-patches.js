(()=>{
  const PAGES=[['home','Home'],['senate','2026 Senate Prediction'],['governor','2026 Governor Map'],['polls','New Polls'],['betting','Betting Odds'],['errors','Past Polling Errors'],['pastmaps','Past Senate Maps'],['about','About Me']];
  const KEYS=new Set(PAGES.map(x=>x[0]));
  const REP='#bd2937',DEM='#2763b8',PURPLE='#8051d2';
  let current='home',busy=false,queued=false;
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const leafs=r=>[...r.querySelectorAll('*')].filter(el=>el.children.length===0);

  function ensureStyle(){
    if(document.getElementById('safe-ui-patches-v3'))return;
    const s=document.createElement('style');s.id='safe-ui-patches-v3';s.textContent=`
      #page-senate .map-wrap svg{transform:scale(1.14)!important;transform-origin:center center!important}
      #will-governor-page,#will-pastmaps-page{width:100%;background:#fff;min-height:calc(100vh - 72px)}
      .will-inline-frame{display:block;width:100%;border:0;background:#fff;min-height:calc(100vh - 72px)}
      .site-header .nav[data-final-nav="1"]{display:flex!important;align-items:center!important;gap:5px!important;flex-wrap:nowrap!important}
      .site-header .nav[data-final-nav="1"]>button{height:42px!important;padding:0 13px!important;border:0!important;background:transparent!important;color:#17263d!important;border-radius:999px!important;font:800 12px/1 Inter,ui-sans-serif,system-ui,sans-serif!important;white-space:nowrap!important;cursor:pointer!important}
      .site-header .nav[data-final-nav="1"]>button.active{background:#17263d!important;color:#fff!important}
      @media(max-width:760px){.site-header .nav[data-final-nav="1"]{overflow-x:auto!important;padding-bottom:7px!important;-webkit-overflow-scrolling:touch}.site-header .nav[data-final-nav="1"]>button{flex:0 0 auto!important;height:38px!important;padding:0 10px!important;font-size:11px!important}}
    `;document.head.appendChild(s);
  }

  function makeFrame(id,src,title){
    let page=document.getElementById(id);if(page)return page;
    page=document.createElement('section');page.id=id;page.className='page';page.hidden=true;
    const frame=document.createElement('iframe');frame.className='will-inline-frame';frame.src=src;frame.title=title;frame.loading='eager';
    frame.addEventListener('load',()=>{try{const d=frame.contentDocument;if(d){const st=d.createElement('style');st.textContent=`.site-header{display:none!important}body{margin:0!important;background:#fff!important}.page-head,.content,.wrap{max-width:1500px!important;margin-left:auto!important;margin-right:auto!important}.page-head{padding-top:24px!important}.title-row h1,.page-head h1{font-family:Georgia,serif!important;color:#17263d!important}`;d.head.appendChild(st);const resize=()=>{frame.style.height=Math.max(d.documentElement.scrollHeight,d.body?d.body.scrollHeight:0,window.innerHeight-72)+'px'};resize();new ResizeObserver(resize).observe(d.documentElement);}}catch(e){}});
    page.appendChild(frame);const about=document.getElementById('page-about');if(about?.parentNode)about.parentNode.insertBefore(page,about);else document.body.appendChild(page);return page;
  }

  function pageEl(key){if(key==='governor')return makeFrame('will-governor-page','/governor.html?embedded=1','2026 Governor Map');if(key==='pastmaps')return makeFrame('will-pastmaps-page','/past-senate-maps.html?embedded=1','Past Senate Maps');return document.getElementById('page-'+key);}

  function detect(){for(const [k] of PAGES){if(k==='governor'||k==='pastmaps')continue;const el=document.getElementById('page-'+k);if(!el)continue;try{const c=getComputedStyle(el);if(!el.hidden&&c.display!=='none'&&c.visibility!=='hidden')return k;}catch(e){}}return'home';}

  function buildNav(){const nav=document.querySelector('.site-header .nav');if(!nav)return;const valid=nav.dataset.finalNav==='1'&&nav.querySelectorAll(':scope>[data-final-page]').length===PAGES.length;if(valid)return;nav.textContent='';nav.dataset.finalNav='1';for(const [k,label] of PAGES){const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.finalPage=k;nav.appendChild(b);}setActive();}
  function setActive(){const nav=document.querySelector('.site-header .nav[data-final-nav="1"]');if(!nav)return;nav.querySelectorAll('[data-final-page]').forEach(b=>b.classList.toggle('active',b.dataset.finalPage===current));}

  function show(key,scroll=true){if(!KEYS.has(key)||busy)return;busy=true;try{for(const [k] of PAGES){const el=pageEl(k);if(!el)continue;const on=k===key;el.hidden=!on;el.classList.toggle('active',on);if(on)el.style.setProperty('display','block','important');else el.style.setProperty('display','none','important');}current=key;setActive();if(scroll)window.scrollTo(0,0);}finally{busy=false;}}

  function navClick(e){const b=e.target.closest?.('.site-header .nav[data-final-nav="1"] [data-final-page]');if(!b)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();show(b.dataset.finalPage,true);}

  function forceMaineData(){try{if(typeof stateData==='undefined'||!stateData?.ME)return;const s=stateData.ME;s.rating='tilt-d';s.predictionParty='Democrat';s.prediction='Jackson +0.4%';s.updated='2026-09-07';if(norm(s.candidate1)==='Susan Collins')s.candidate1Odds='48';if(norm(s.candidate2)==='Susan Collins')s.candidate2Odds='48';if(norm(s.candidate1)==='Troy Jackson')s.candidate1Odds='52';if(norm(s.candidate2)==='Troy Jackson')s.candidate2Odds='52';for(const k of ['projectedWinner','predictionWinner','winner','callParty'])if(k in s)s[k]='Democrat';if('call' in s)s.call='Jackson +0.4%';}catch(e){}}

  function fixMainePanel(){const root=document.getElementById('page-senate');if(!root)return;root.querySelectorAll('[data-state="ME"],[data-abbr="ME"],[data-state-abbr="ME"],#ME,#state-ME').forEach(el=>{el.style.setProperty('fill','#d3e2f7','important');el.style.setProperty('background','#d3e2f7','important');});const maine=leafs(root).find(el=>norm(el.textContent)==='Maine'&&el.getClientRects().length);if(!maine)return;let box=maine.parentElement;for(let i=0;box&&box!==root&&i<12;i++,box=box.parentElement){const t=norm(box.textContent);if(/WILL'S CALL|MY PREDICTION|WILL'S STATISTICAL ODDS/i.test(t)&&/Troy Jackson|Susan Collins/i.test(t))break;}if(!box||box===root)return;for(const el of leafs(box)){let t=norm(el.textContent);if(t==='Republican'){if(/WILL'S CALL|MY PREDICTION|MY PROJECTED WINNER/i.test(norm(el.parentElement?.textContent)||'')){el.textContent='Democrat';el.style.setProperty('color',DEM,'important');}}if(/^Troy Jackson:\s*\d+(?:\.\d+)?%$/i.test(t))el.textContent='Troy Jackson: 52%';if(/^Susan Collins:\s*\d+(?:\.\d+)?%$/i.test(t))el.textContent='Susan Collins: 48%';if(t==='Collins +1.3%'||t==='Collins +1.3')el.textContent='Jackson +0.4%';if(/^Prediction:\s*/i.test(t))el.textContent='Prediction: Tilt Democratic';}
    const copy=box.querySelector('.prediction-copy');if(copy)copy.textContent='Jackson +0.4%';
    const bar=box.querySelector('.oddsbar');if(bar){const lines=[...box.querySelectorAll('.candidate-line')];if(lines.length>=2){const n1=norm(lines[0].querySelector('.candidate-name')?.textContent),n2=norm(lines[1].querySelector('.candidate-name')?.textContent);const a=bar.querySelector('.oddsbar-a'),b=bar.querySelector('.oddsbar-b');const p1=n1==='Susan Collins'?48:n1==='Troy Jackson'?52:null,p2=n2==='Susan Collins'?48:n2==='Troy Jackson'?52:null;if(a&&p1!=null){a.style.setProperty('width',p1+'%','important');a.style.setProperty('background',n1==='Susan Collins'?REP:DEM,'important');}if(b&&p2!=null){b.style.setProperty('width',p2+'%','important');b.style.setProperty('background',n2==='Susan Collins'?REP:DEM,'important');}}}
  }

  function apply(){ensureStyle();buildNav();forceMaineData();fixMainePanel();setActive();}
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply();});}
  current=detect();apply();pageEl('governor');pageEl('pastmaps');show(current,false);document.addEventListener('click',navClick,true);new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true});window.addEventListener('pageshow',()=>{apply();show(current,false)});window.addEventListener('resize',apply);window.__willFinalNavigate=show;
})();
/* Studio presentation for Will's interactive Senate forecast. State data and original handlers stay authoritative. */
(()=>{
  'use strict';
  /* mobile-classic-20261010: keep the original Senate map on phones. */
  if (window.matchMedia('(max-width:767px)').matches) return;
  const ID='page-senate';
  const FEATURED=['TX','ME','OH','IA','KS'];
  let ready=false, lastSig='', observer=null;
  const el=(tag,cls,value)=>{
    const n=document.createElement(tag);
    if(cls)n.className=cls;
    if(value!==undefined)n.textContent=String(value);
    return n;
  };
  function rows(){try{return typeof stateData==='undefined'?null:stateData;}catch(_){return null;}}
  function side(r){
    if(/-d$/.test(r||''))return 'Democratic';
    if(/-r$/.test(r||''))return 'Republican';
    if(/-i$/.test(r||''))return 'Independent';
    if(r==='tossup')return 'Toss-up';
    return 'Unrated';
  }
  function shortRating(r){
    return ({'solid-d':'Solid D','likely-d':'Likely D','lean-d':'Lean D','tilt-d':'Tilt D',
      'solid-r':'Solid R','likely-r':'Likely R','lean-r':'Lean R','tilt-r':'Tilt R',
      'solid-i':'Solid I','likely-i':'Likely I','lean-i':'Lean I','tilt-i':'Tilt I','tossup':'Toss-up'})[r]||'Unrated';
  }
  function margin(s){
    const a=Number(s?.candidate1Poll),b=Number(s?.candidate2Poll);
    if(!s||s.candidate1Poll==null||s.candidate2Poll==null||String(s.candidate1Poll).trim()===''||String(s.candidate2Poll).trim()===''||!Number.isFinite(a)||!Number.isFinite(b))return shortRating(s?.rating);
    const winning=a>=b?(s.candidate1||'Leader'):(s.candidate2||'Leader');
    const lastname=String(winning).trim().split(/\s+/).pop();
    return lastname+' +'+Math.abs(a-b).toFixed(1);
  }
  function color(r){
    return /-d$/.test(r||'')?'#4c86ff':/-r$/.test(r||'')?'#fb5470':/-i$/.test(r||'')?'#a98bff':'#b8c6d8';
  }
  // The original public map only opens states on touch. Delegate clicks to the
  // actual SVG path for all inputs, including Alaska's inset, without replacing
  // the site's existing map or drawer.
  function bindStateClicks(page){
    const svg=page.querySelector('.map-wrap svg');
    if(!svg||svg.dataset.wgStudioClickReady==='1')return;
    svg.dataset.wgStudioClickReady='1';
    svg.addEventListener('click',event=>{
      const path=event.target?.closest?.('.state-shape[data-state]');
      if(!path)return;
      const ab=path.dataset.state;
      if(!rows()?.[ab])return;
      try {
        if(typeof openState==='function')openState(ab);
        else if(typeof window.openState==='function')window.openState(ab);
      } catch(error) {console.warn('Unable to open Senate state:',ab,error);}
    },true);
    // SVG state shapes should be keyboard-usable too.
    svg.querySelectorAll('.state-shape[data-state]').forEach(path=>{
      path.setAttribute('tabindex','0');
      path.setAttribute('role','button');
      path.setAttribute('aria-label','Open '+(rows()?.[path.dataset.state]?.name||path.dataset.state)+' Senate forecast');
    });
    svg.addEventListener('keydown',event=>{
      if(event.key!=='Enter'&&event.key!==' ')return;
      const path=event.target?.closest?.('.state-shape[data-state]');
      if(!path)return;
      event.preventDefault();
      const ab=path.dataset.state;
      if(!rows()?.[ab])return;
      if(typeof openState==='function')openState(ab);
      else if(typeof window.openState==='function')window.openState(ab);
    });
  }
  function sync(){
    const page=document.getElementById(ID), data=rows();
    if(!page||!data)return;
    const svg=page.querySelector('.map-wrap svg');
    if(!svg||svg.querySelectorAll('.state-shape[data-state]').length<30)return;
    page.classList.add('wg-studio');
    bindStateClicks(page);
    if(!ready){
      const top=page.querySelector('.page-head-inner>div:first-child');
      if(top&&!top.querySelector('.wg-studio-eyebrow')){
        const eyebrow=el('div','wg-studio-eyebrow',"WILL'S FORECAST CENTER  /  2026 MIDTERMS");
        top.insertBefore(eyebrow,top.firstChild);
      }
      const mapcard=page.querySelector('.map-card');
      if(mapcard&&!mapcard.querySelector('.wg-studio-radar')){
        const panel=el('section','wg-studio-radar');
        panel.setAttribute('aria-label','Featured Senate races');
        const head=el('div','wg-studio-radar-head');
        head.appendChild(el('div','wg-studio-radar-title','Battleground radar'));
        head.appendChild(el('div','wg-studio-radar-note','Select a state for full analysis'));
        panel.appendChild(head);
        const list=el('div','wg-studio-radar-list');list.id='wg-studio-radar-list';
        panel.appendChild(list);
        const legend=mapcard.querySelector('.legend.compact-forecast-key');
        if(legend)legend.parentNode.insertBefore(panel,legend);
        else mapcard.appendChild(panel);
      }
      ready=Boolean(page.querySelector('.wg-studio-radar-list'));
    }
    const list=page.querySelector('#wg-studio-radar-list');
    if(!list)return;
    const sig=FEATURED.map(ab=>{
      const s=data[ab]||{};
      return [ab,s.rating,s.candidate1,s.candidate2,s.candidate1Poll,s.candidate2Poll].join('/');
    }).join('|');
    if(lastSig===sig&&list.children.length)return;
    lastSig=sig;
    const fragment=document.createDocumentFragment();
    FEATURED.forEach(ab=>{
      const s=data[ab];
      if(!s?.active)return;
      const b=el('button','wg-studio-radar-item');
      b.type='button';b.style.setProperty('--race-color',color(s.rating));
      b.setAttribute('aria-label','Open '+(s.name||ab)+' Senate forecast');
      b.appendChild(el('span','wg-studio-radar-abbr',ab));
      b.appendChild(el('span','wg-studio-radar-text',margin(s)));
      b.addEventListener('click',()=>{
        const shape=page.querySelector('.map-wrap .state-shape[data-state="'+ab+'"]');
        if(shape)shape.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));
        else if(typeof openState==='function')openState(ab);
      });
      const highlight=()=>page.querySelector('.map-wrap .state-shape[data-state="'+ab+'"]')?.classList.add('senate-spotlight');
      const unhighlight=()=>page.querySelector('.map-wrap .state-shape[data-state="'+ab+'"]')?.classList.remove('senate-spotlight');
      b.addEventListener('mouseenter',highlight);
      b.addEventListener('mouseleave',unhighlight);
      b.addEventListener('focus',highlight);
      b.addEventListener('blur',unhighlight);
      fragment.appendChild(b);
    });
    list.replaceChildren(fragment);
  }
  const run=()=>{try{sync()}catch(e){console.warn('Senate Studio:',e)}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});
  else run();
  window.addEventListener('pageshow',run);
  [350,1200,3000,6000].forEach(ms=>setTimeout(run,ms));
  setInterval(run,14000);
})();
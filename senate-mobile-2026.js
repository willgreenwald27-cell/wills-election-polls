(()=>{
 'use strict';
 /* Phone-only controls around the EXISTING Senate SVG.
    No polling numbers, map data, forecast or popup markup is rewritten. */
 const mq=window.matchMedia('(max-width:767px)');
 const fallback={
  AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',
  CO:'Colorado',CT:'Connecticut',DE:'Delaware',FL:'Florida',GA:'Georgia',
  HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',
  KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',
  MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',
  MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',
  NJ:'New Jersey',NM:'New Mexico',NY:'New York',NC:'North Carolina',
  ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',
  RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',TN:'Tennessee',
  TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',WA:'Washington',
  WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming'
 };
 const read=()=>{try{return typeof stateData==='undefined'?null:stateData}catch(_){return null}};
 const page=()=>document.getElementById('page-senate');
 function scrollTo(el){if(!el)return;el.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}
 function paths(root){
  return [...root.querySelectorAll('.map-wrap svg .state-shape[data-state]')];
 }
 function updatePicker(root,select){
  const data=read();
  const pairs=paths(root).map(p=>p.dataset.state).filter((ab,i,arr)=>
   ab&&arr.indexOf(ab)===i&&data?.[ab]&&data[ab].active
  ).map(ab=>({ab,name:data[ab]?.name||fallback[ab]||ab}))
   .sort((a,b)=>a.name.localeCompare(b.name));
  const key=pairs.map(x=>x.ab).join('|');
  if(select.dataset.wgOptions===key)return;
  const previous=select.value;
  const fragment=document.createDocumentFragment();
  const prompt=document.createElement('option');
  prompt.value='';prompt.textContent='Choose a state';fragment.appendChild(prompt);
  for(const {ab,name} of pairs){
   const option=document.createElement('option');
   option.value=ab;option.textContent=name;fragment.appendChild(option);
  }
  select.replaceChildren(fragment);
  select.dataset.wgOptions=key;
  select.value=pairs.some(x=>x.ab===previous)?previous:'';
 }
 function mount(){
  if(!mq.matches)return;
  const root=page(),mapCard=root?.querySelector('.map-card');
  const wrap=mapCard?.querySelector('.map-wrap'),svg=wrap?.querySelector('svg');
  if(!root||!mapCard||!svg||paths(root).length<30)return;

  if(!mapCard.querySelector('.wg-mobile-map-tools')){
   const tools=document.createElement('section');
   tools.className='wg-mobile-map-tools';
   tools.setAttribute('aria-label','Mobile Senate map controls');
   const chooser=document.createElement('div');
   chooser.className='wg-mobile-picker';
   const label=document.createElement('label');
   label.htmlFor='wg-mobile-senate-picker';
   label.textContent='Find a 2026 Senate race';
   const select=document.createElement('select');
   select.id='wg-mobile-senate-picker';
   select.setAttribute('aria-label','Choose a state for Senate predictions');
   chooser.append(label,select);

   const zoom=document.createElement('button');
   zoom.type='button';zoom.className='wg-mobile-zoom';
   zoom.textContent='Enlarge map';zoom.setAttribute('aria-pressed','false');
   const hint=document.createElement('p');
   hint.className='wg-mobile-map-hint';
   hint.textContent='Tap a state, or select one above. Enlarge the map to swipe across smaller states.';
   tools.append(chooser,zoom,hint);
   mapCard.insertBefore(tools,wrap);

   zoom.addEventListener('click',()=>{
    const enlarged=root.classList.toggle('wg-mobile-map-zoomed');
    zoom.setAttribute('aria-pressed',String(enlarged));
    zoom.textContent=enlarged?'Fit whole map':'Enlarge map';
    hint.textContent=enlarged?'Swipe left or right to explore states. Tap a state to open its forecast.':'Tap a state, or select one above. Enlarge the map to swipe across smaller states.';
    if(enlarged){
      requestAnimationFrame(()=>{wrap.scrollLeft=Math.max(0,(wrap.scrollWidth-wrap.clientWidth)/2)});
    }else wrap.scrollLeft=0;
   });
   select.addEventListener('change',()=>{
    const ab=select.value;
    if(!ab)return;
    const shape=paths(root).find(p=>p.dataset.state===ab);
    if(shape){
      // Existing click listeners update the authoritative state popup AND
      // the Senate page's selected-state analysis panel.
      shape.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));
      setTimeout(()=>scrollTo(root.querySelector('#senate-night-selected')||mapCard),130);
    }
   });
   root.addEventListener('click',event=>{
    const shape=event.target?.closest?.('.map-wrap .state-shape[data-state]');
    if(shape&&select.querySelector('option[value="'+shape.dataset.state+'"]')){
      select.value=shape.dataset.state;
    }
   },true);
  }
  const picker=mapCard.querySelector('#wg-mobile-senate-picker');
  if(picker)updatePicker(root,picker);

  const heading=root.querySelector('.page-head-inner>div:first-child');
  if(heading&&!heading.querySelector('.wg-mobile-shortcuts')){
   const shortcuts=document.createElement('div');
   shortcuts.className='wg-mobile-shortcuts';
   const mapButton=document.createElement('button');
   mapButton.type='button';mapButton.textContent='Explore map ↓';
   mapButton.addEventListener('click',()=>scrollTo(root.querySelector('.wg-mobile-map-tools')||mapCard));
   const detailButton=document.createElement('button');
   detailButton.type='button';detailButton.textContent='Race details ↓';
   detailButton.addEventListener('click',()=>scrollTo(root.querySelector('#senate-night-selected')||root.querySelector('.sidebar')));
   shortcuts.append(mapButton,detailButton);
   heading.appendChild(shortcuts);
  }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
 [180,650,1500,2900].forEach(ms=>setTimeout(mount,ms));
 setInterval(mount,4500);
 window.addEventListener('pageshow',mount);
 window.addEventListener('resize',mount);
 document.addEventListener('click',event=>{
  if(event.target?.closest?.('.site-header .nav'))setTimeout(mount,150);
 },true);
})();

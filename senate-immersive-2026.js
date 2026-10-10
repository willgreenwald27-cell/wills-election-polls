(()=>{
 'use strict';
  /* mobile-classic-20261010: keep the original Senate map on phones. */
  if (window.matchMedia('(max-width:767px)').matches) return;
 // The existing Senate SVG, forecast counts, popup handlers, race board and
 // stateData are authoritative. This file only adds a read-only side panel
 // and applies a CSS class. No polling numbers or ratings are overwritten.
 const ROOT_ID='page-senate';
 const HIGHLIGHTS=['TX','ME','OH','IA','KS','NC','AK','SC'];
 const RATING_NAMES={
  'solid-d':'Solid Democrat','likely-d':'Likely Democrat','lean-d':'Lean Democrat',
  'tilt-d':'Tilt Democrat','tossup':'Toss-up',
  'tilt-r':'Tilt Republican','lean-r':'Lean Republican',
  'likely-r':'Likely Republican','solid-r':'Solid Republican',
  'solid-i':'Solid Independent','likely-i':'Likely Independent','lean-i':'Lean Independent',
  'tilt-i':'Tilt Independent','unrated':'Unrated','not-up':'No election'
 };
 let selected='TX', signature='', initialized=false, listening=false;
 const $=(id)=>document.getElementById(id);
 function root(){return $(ROOT_ID);}
 function data(){try{return typeof stateData==='undefined'?null:stateData;}catch(_){return null;}}
 function node(tag,cls,value){
  const el=document.createElement(tag);
  if(cls)el.className=cls;
  if(value!==undefined&&value!==null)el.textContent=String(value);
  return el;
 }
 function number(v){if(v===null||v===undefined||String(v).trim()==='')return null;const n=Number(v);return Number.isFinite(n)?n:null;}
 function formatPct(v){const n=number(v);return n===null?'—':n.toFixed(1)+'%';}
 function rateSide(r){
  if(/-d$/.test(r||''))return 'd';
  if(/-r$/.test(r||''))return 'r';
  if(/-i$/.test(r||''))return 'i';
  return 'n';
 }
 function rating(s){
  const label=RATING_NAMES[s?.rating]||s?.rating||'Unrated';
  return label;
 }
 function candidates(s){
  return [
   {name:s.candidate1||'Candidate 1',party:s.candidate1Party||'',poll:number(s.candidate1Poll),odds:number(s.candidate1Odds)},
   {name:s.candidate2||'Candidate 2',party:s.candidate2Party||'',poll:number(s.candidate2Poll),odds:number(s.candidate2Odds)}
  ].sort((a,b)=>(b.poll===null?-1:b.poll)-(a.poll===null?-1:a.poll));
 }
 function margin(s){
  const cc=candidates(s);
  if(cc.length<2||cc[0].poll===null||cc[1].poll===null)return 'No polling average';
  const diff=cc[0].poll-cc[1].poll;
  if(Math.abs(diff)<.05)return 'Polling tied';
  const name=(cc[0].name||'Leader').trim().split(/\s+/).slice(-1)[0];
  return name+' +'+diff.toFixed(1)+' pts';
 }
 function currentSig(rows){
  return HIGHLIGHTS.map(ab=>{
   const s=rows[ab];
   return s?[ab,s.rating,s.updated,s.prediction,s.predictionParty,s.candidate1,s.candidate2,
     s.candidate1Poll,s.candidate2Poll,s.candidate1Odds,s.candidate2Odds].join('|'):'';
  }).join('||')+'|'+selected+'|'+(rows[selected]?[
   rows[selected].rating,rows[selected].updated,rows[selected].prediction,
   rows[selected].candidate1Poll,rows[selected].candidate2Poll,
   rows[selected].candidate1Odds,rows[selected].candidate2Odds
  ].join('|'):'');
 }
 function viewState(ab){
  const r=root();
  const path=r?.querySelector('.map-wrap .state-shape[data-state="'+ab+'"]');
  if(!path)return;
  // Original built-in details/drawer remain available; do not replace them.
  try{
   if(typeof openState==='function')openState(ab);
   else path.click();
  }catch(_){path.click();}
 }
 function build(){
  const r=root(),rows=data(),aside=r?.querySelector('.forecast-layout .sidebar');
  const map=r?.querySelector('.map-wrap svg');
  if(!r||!rows||!aside||!map||map.querySelectorAll('.state-shape[data-state]').length<30)return false;
  const header=r.querySelector('.page-head-inner');
  if(header&&!header.querySelector('#senate-night-head-stats')){
   const summaries=node('div','senate-night-head-stats');
   summaries.id='senate-night-head-stats';
   const until=node('div','senate-night-head-chip');
   until.appendChild(node('span','senate-night-head-number','—')).id='senate-night-days';
   const untilLabel=node('div','senate-night-head-caption','DAYS UNTIL ELECTION DAY');
   until.appendChild(untilLabel);
   summaries.appendChild(until);
   const update=node('div','senate-night-head-chip senate-night-last');
   update.appendChild(node('span','senate-night-head-caption','LATEST RACE ENTRY'));
   update.appendChild(node('strong','senate-night-date','—')).id='senate-night-updated';
   summaries.appendChild(update);
   header.insertBefore(summaries,header.querySelector('.page-actions')||null);
  }
  if(!aside.querySelector('#senate-night-key-races')){
   const key=node('section','senate-night-panel');key.id='senate-night-key-races';
   key.setAttribute('aria-label','Featured 2026 Senate races');
   const title=node('h2','', 'Key Races');
   key.appendChild(title);
   const list=node('div','senate-night-list');list.id='senate-night-list';
   key.appendChild(list);
   const note=node('small','senate-night-foot','Select a race to see its current polling and Will’s forecast.');
   key.appendChild(note);
   aside.insertBefore(key,aside.firstChild);
  }
  if(!aside.querySelector('#senate-night-selected')){
   const detail=node('section','senate-night-panel');detail.id='senate-night-selected';
   detail.setAttribute('aria-label','Selected Senate race details');
   detail.appendChild(node('div','senate-night-eyebrow','SELECTED STATE'));
   const selectedHead=node('div','senate-night-selected-header');
   const head=node('h3','', 'Choose a state');head.id='senate-night-state-name';
   selectedHead.appendChild(head);
   const badge=node('span','senate-night-rating');badge.id='senate-night-selected-rating';
   selectedHead.appendChild(badge);
   detail.appendChild(selectedHead);
   const inner=node('div','');inner.id='senate-night-selected-body';
   detail.appendChild(inner);
   const more=node('button','senate-night-help','Open full state analysis →');
   more.type='button';
   more.addEventListener('click',()=>viewState(selected));
   detail.appendChild(more);
   aside.insertBefore(detail,aside.children[1]||null);
  }
  if(!listening){
   listening=true;
   r.addEventListener('click',ev=>{
     const shape=ev.target?.closest?.('.map-wrap .state-shape[data-state]');
     if(!shape)return;
     const ab=shape.dataset.state;
     if(!data()?.[ab])return;
     selected=ab;
     signature='';
     render();
   },true);
  }
  r.classList.add('senate-immersive');
  initialized=true;
  render();
  return true;
 }
 function selectedRow(k,v){
  const row=node('div','senate-night-selected-row');
  row.appendChild(node('span','',k));
  row.appendChild(node('strong','',v));
  return row;
 }
 function render(){
  const rows=data(),r=root();
  const list=$('senate-night-list'),body=$('senate-night-selected-body');
  if(!rows||!r||!list||!body)return;
  if(!rows[selected])selected=HIGHLIGHTS.find(ab=>rows[ab]?.active)||Object.keys(rows)[0];
  const daysBox=$('senate-night-days');
  if(daysBox){
   const now=new Date(),parts=new Intl.DateTimeFormat('en-US',{
     timeZone:'America/Los_Angeles',year:'numeric',month:'numeric',day:'numeric'
   }).formatToParts(now);
   const get=kind=>Number(parts.find(x=>x.type===kind)?.value||0);
   const days=Math.max(0,Math.round((Date.UTC(2026,10,3)-Date.UTC(get('year'),get('month')-1,get('day')))/86400000));
   daysBox.textContent=String(days);
  }
  const updatedBox=$('senate-night-updated');
  if(updatedBox){
   const dates=Object.values(rows).filter(x=>x?.active&&/^\d{4}-\d{2}-\d{2}$/.test(String(x.updated||''))).map(x=>x.updated);
   const latest=dates.sort().at(-1);
   updatedBox.textContent=latest?new Intl.DateTimeFormat('en-US',{
     month:'short',day:'numeric',year:'numeric',timeZone:'UTC'
   }).format(new Date(latest+'T12:00:00Z')):'—';
  }
  const sig=currentSig(rows);
  if(sig===signature)return;
  signature=sig;
  const frag=document.createDocumentFragment();
  for(const ab of HIGHLIGHTS){
   const s=rows[ab];
   if(!s?.active)continue;
   const button=node('button','senate-night-item');
   button.type='button';button.dataset.nightState=ab;
   if(ab===selected)button.setAttribute('aria-current','true');
   button.setAttribute('aria-label','See '+s.name+' Senate forecast');
   button.appendChild(node('span','senate-night-state',ab));
   const mid=node('span','senate-night-middle');
   mid.appendChild(node('span','senate-night-name',s.name||ab));
   mid.appendChild(node('span','senate-night-margin',margin(s)));
   button.appendChild(mid);
   const badge=node('span','senate-night-rating',rating(s));
   badge.dataset.side=rateSide(s.rating);
   button.appendChild(badge);
   button.addEventListener('mouseenter',()=>{
    r.querySelector('.map-wrap .state-shape[data-state="'+ab+'"]')?.classList.add('senate-spotlight');
   });
   button.addEventListener('mouseleave',()=>{
    r.querySelector('.map-wrap .state-shape[data-state="'+ab+'"]')?.classList.remove('senate-spotlight');
   });
   button.addEventListener('focus',()=>{
    r.querySelector('.map-wrap .state-shape[data-state="'+ab+'"]')?.classList.add('senate-spotlight');
   });
   button.addEventListener('blur',()=>{
    r.querySelector('.map-wrap .state-shape[data-state="'+ab+'"]')?.classList.remove('senate-spotlight');
   });
   button.addEventListener('click',()=>{
    selected=ab;signature='';render();
    // Update the sidebar without moving the visitor's scroll position.
   });
   frag.appendChild(button);
  }
  list.replaceChildren(frag);
  const s=rows[selected];
  const name=$('senate-night-state-name'),ratingLabel=$('senate-night-selected-rating');
  if(name)name.textContent=s?.name||selected;
  if(ratingLabel){ratingLabel.textContent=rating(s);ratingLabel.dataset.side=rateSide(s?.rating);}
  body.replaceChildren();
  if(!s||!s.active){
   body.appendChild(node('p','senate-night-explanation','No 2026 Senate race is scheduled for this state.'));
   return;
  }
  body.appendChild(selectedRow('Race rating',rating(s)));
  body.appendChild(selectedRow('Polling average',margin(s)));
  const cc=candidates(s);
  for(const cand of cc){
   if(!cand.name||cand.name.startsWith('Candidate '))continue;
   body.appendChild(selectedRow(cand.name,formatPct(cand.poll)+(cand.odds===null?'':' · '+cand.odds.toFixed(0)+'% odds')));
  }
  if(s.predictionParty&&s.predictionParty!=='uncalled')
   body.appendChild(selectedRow('Will’s call',s.predictionParty));
  if(s.prediction&&String(s.prediction).trim())
   body.appendChild(node('p','senate-night-explanation',String(s.prediction).trim()));
 }
 function init(){
  if(initialized){
    const r=root();
    if(r&&!r.querySelector('#senate-night-key-races')){initialized=false;signature='';}
    else{render();return;}
  }
  build();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
 window.addEventListener('pageshow',init);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)init();});
 [200,750,1600,3500,5500].forEach(ms=>setTimeout(init,ms));
 setInterval(init,12000);
})();

/* Make the Call: a private, neutral race-prediction game for the Battleground Board. */
(()=>{
'use strict';
const CODES=['TX','ME','AK','IA','OH','MI','KS','NE'];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const party=s=>{let v=String(s||'').toLowerCase();return v.includes('democrat')?'dem':v.includes('republican')?'rep':v.includes('independent')?'ind':'other';};
const partyOf=(p,name)=>{const t=party(p);return t==='other'&&['dan osborn','seth bodnar','todd achilles'].includes(String(name||'').trim().toLowerCase())?'ind':t;};
const num=s=>{const m=String(s??'').match(/-?\d+(?:\.\d+)?/);return m?Number(m[0]):null;};
const root=document.getElementById('page-board');
if(!root||root.querySelector('[data-bb-challenge]'))return;
const game=document.createElement('section');
game.className='bb-game';game.setAttribute('data-bb-challenge','');game.setAttribute('aria-label','Make the Call Senate forecast challenge');
game.innerHTML=[
'<div class="bb-game-head"><div class="bb-game-title"><p class="bb-game-label"><i class="bb-game-pulse" aria-hidden="true"></i> THE 2026 FORECAST CHALLENGE</p>',
'<h2>Make the Call.</h2><p>Eight battlegrounds. Pick your winners, build your own scenario, and compare your calls with Will’s independent forecast.</p></div>',
'<button type="button" class="bb-game-toggle" data-bbg-toggle aria-expanded="true" aria-controls="bbChallengeContent"><span data-bbg-toggle-label>Hide challenge</span><span class="bb-game-chevron" aria-hidden="true">▾</span></button></div>',
'<div id="bbChallengeContent" class="bb-game-content"><div class="bb-game-score" aria-live="polite"><div><p class="bb-game-scorelabel">YOUR BATTLEGROUND SLATE</p>',
'<div class="bb-game-progressline"><strong class="bb-game-big" data-bbg-progress>0 / 8</strong><span class="bb-game-hint" data-bbg-hint>Pick a winner in each race</span></div>',
'<div class="bb-game-progress" aria-hidden="true"><span data-bbg-bar></span></div></div>',
'<div class="bb-game-compare"><strong data-bbg-agreement>—</strong><span>Matches Will’s party calls</span></div></div>',
'<div class="bb-game-ledger" aria-label="Your picks by party"><div class="dem"><span>Democratic picks</span><b data-bbg-dem>0</b></div>',
'<div class="rep"><span>Republican picks</span><b data-bbg-rep>0</b></div><div class="ind"><span>Independent picks</span><b data-bbg-ind>0</b></div></div>',
'<div class="bb-game-scenario" data-bbg-scenario aria-live="polite"></div>',
'<div class="bb-game-subhead"><h3>Who wins each battleground?</h3><span>Pick one candidate per state.</span></div>',
'<div class="bb-game-races" data-bbg-races aria-label="Your Senate race predictions"></div>',
'<div class="bb-game-commands"><button type="button" class="bb-game-command" data-bbg-share disabled>Copy my picks ↗</button>',
'<button type="button" class="bb-game-command secondary" data-bbg-reset disabled>Start over ↺</button></div>',
'<div class="bb-game-result" data-bbg-result hidden></div>',
'<small class="bb-game-note">For fun and comparison only—not an election result or voting guide. Your choices stay on this page and are not submitted or saved. Party totals above cover only these eight races.</small></div>'
].join('');
const insertion=root.querySelector('.bb-metrics');
if(insertion)insertion.insertAdjacentElement('afterend',game);
else (root.querySelector('.bb-shell')||root).appendChild(game);
const $=q=>game.querySelector(q),picks=Object.create(null);
let candidatesSignature='',uiSignature='';
function data(){try{if(typeof stateData!=='undefined'&&stateData)return stateData;}catch(_){}return window.stateData||null;}
function races(){
 const d=data();
 return CODES.map(code=>{
  const s=d?.[code];if(!s||!s.candidate1||!s.candidate2)return null;
  const a=String(s.candidate1),b=String(s.candidate2),pa=partyOf(s.candidate1Party,a),pb=partyOf(s.candidate2Party,b);
  const aa=num(s.candidate1Poll),bb=num(s.candidate2Poll);
  return {code,state:String(s.name||code),a,b,pa,pb,forecast:party(s.predictionParty),
    gap:aa===null||bb===null?null:Math.abs(aa-bb)};
 }).filter(Boolean);
}
function raceCard(r,i){
 const choice=(side,name,p)=>'<button type="button" class="bb-game-choice '+p+'" data-bb-pick="'+esc(r.code)+'" data-bb-side="'+side+'" aria-pressed="'+String(picks[r.code]===name)+'" aria-label="Predict '+esc(name)+' to win '+esc(r.state)+'"><b>'+esc(name)+'</b><span>'+esc(p==='dem'?'DEM':p==='rep'?'GOP':p==='ind'?'IND':'OTHER')+'</span></button>';
 return '<article class="bb-game-race" data-bb-race="'+esc(r.code)+'" data-picked="'+String(!!picks[r.code])+'"><div class="bb-game-racehead"><div><h4>'+esc(r.state)+'</h4><small>RACE '+String(i+1).padStart(2,'0')+' · '+(r.gap===null?'No comparable polling':r.gap.toFixed(1)+'-point polling gap')+'</small></div><span class="bb-game-status" data-bb-race-status="'+esc(r.code)+'">'+(picks[r.code]?'✓ LOCKED IN':'PICK ONE')+'</span></div><div class="bb-game-choices">'+choice(1,r.a,r.pa)+choice(2,r.b,r.pb)+'</div></article>';
}
function set(q,v){const e=$(q);if(e)e.textContent=v;}
function scenario(rows){
 const d0=num(root.querySelector('[data-bb-dem]')?.textContent),r0=num(root.querySelector('[data-bb-rep]')?.textContent);
 const box=$('[data-bbg-scenario]');if(!box)return;
 if(d0===null||r0===null||d0+r0!==100){box.hidden=true;return;}
 let shift=0,differ=0;
 for(const r of rows){
  if(!((r.pa==='dem'&&r.pb==='rep')||(r.pa==='rep'&&r.pb==='dem'))||!['dem','rep'].includes(r.forecast))continue;
  const picked=picks[r.code]===r.a?r.pa:picks[r.code]===r.b?r.pb:null;
  if(picked&&picked!==r.forecast){shift+=picked==='dem'?1:-1;differ++;}
 }
 const d=d0+shift,g=r0-shift;if(d<0||g<0||d>100||g>100){box.hidden=true;return;}
 box.hidden=false;
 box.innerHTML='<div><span class="bb-game-scenario-kicker">YOUR HYPOTHETICAL SENATE</span><strong><i class="bb-game-dem">'+d+' DEM</i><i class="bb-game-scenario-vs">–</i><i class="bb-game-rep">'+g+' GOP</i></strong></div><p>'+differ+' different two-party '+(differ===1?'call':'calls')+'. Unpicked races keep Will’s calls. Nebraska’s independent matchup is excluded from this party-seat calculation.</p>';
}
function update(){
 const rows=races();let picked=0,agree=0,scored=0,d=0,r=0,i=0;
 for(const ab of Object.keys(picks)){
  const item=rows.find(x=>x.code===ab);
  if(!item||![item.a,item.b].includes(picks[ab])){delete picks[ab];continue;}
  picked++;
  const p=picks[ab]===item.a?item.pa:item.pb;
  if(p==='dem')d++;if(p==='rep')r++;if(p==='ind')i++;
  if(['dem','rep','ind'].includes(item.forecast)){scored++;if(item.forecast===p)agree++;}
 }
 set('[data-bbg-progress]',picked+' / '+rows.length);
 set('[data-bbg-hint]',rows.length===8&&picked===8?'Full slate complete!':picked===0?'Pick a winner in each race':(rows.length-picked)+' races remaining');
 const bar=$('[data-bbg-bar]');if(bar)bar.style.width=(rows.length?100*picked/rows.length:0)+'%';
 set('[data-bbg-agreement]',scored?agree+' / '+scored:'—');
 set('[data-bbg-dem]',d);set('[data-bbg-rep]',r);set('[data-bbg-ind]',i);
 for(const item of rows){
  const el=game.querySelector('[data-bb-race="'+item.code+'"]');
  if(el)el.setAttribute('data-picked',String(!!picks[item.code]));
  const status=game.querySelector('[data-bb-race-status="'+item.code+'"]');
  if(status)status.textContent=picks[item.code]?'✓ LOCKED IN':'PICK ONE';
  game.querySelectorAll('[data-bb-pick="'+item.code+'"]').forEach(b=>{
   b.setAttribute('aria-pressed',String(picks[item.code]===(b.dataset.bbSide==='1'?item.a:item.b)));
  });
 }
 scenario(rows);
 const share=$('[data-bbg-share]'),reset=$('[data-bbg-reset]');
 if(share)share.disabled=picked===0;if(reset)reset.disabled=picked===0;
 const done=picked===8&&rows.length===8,result=$('[data-bbg-result]');
 if(result){
  result.hidden=!done;
  if(done)result.innerHTML='<strong>✓ All eight calls are in.</strong><p>Your slate matches Will’s party calls in '+agree+' of '+scored+' comparable races and differs in '+(scored-agree)+'. This is a comparison of forecasts, not a score for who will win. You can still change any pick.</p>';
 }
}
function refresh(){
 const rows=races(),sig=JSON.stringify(rows.map(x=>[x.code,x.state,x.a,x.b,x.pa,x.pb]));
 if(sig!==candidatesSignature){
  candidatesSignature=sig;
  const container=$('[data-bbg-races]');
  if(container)container.innerHTML=rows.length?rows.map(raceCard).join(''):'<p class="bb-empty">Loading Senate candidates…</p>';
 }
 const fingerprint=JSON.stringify(rows.map(x=>[x.code,x.forecast,x.gap]))+JSON.stringify(picks)+root.querySelector('[data-bb-dem]')?.textContent+'/'+root.querySelector('[data-bb-rep]')?.textContent;
 if(fingerprint!==uiSignature){uiSignature=fingerprint;update();}
}
game.addEventListener('click',async e=>{
 const btn=e.target.closest('[data-bb-pick],[data-bbg-toggle],[data-bbg-reset],[data-bbg-share]');
 if(!btn)return;
 if(btn.matches('[data-bbg-toggle]')){
  const open=btn.getAttribute('aria-expanded')!=='true';
  btn.setAttribute('aria-expanded',String(open));
  $('#bbChallengeContent').hidden=!open;
  set('[data-bbg-toggle-label]',open?'Hide challenge':'Play the challenge');
  return;
 }
 if(btn.matches('[data-bbg-reset]')){
  for(const k of Object.keys(picks))delete picks[k];
  uiSignature='';refresh();return;
 }
 if(btn.matches('[data-bbg-share]')){
  const lines=races().filter(x=>picks[x.code]).map(x=>x.state+': '+picks[x.code]);
  const body='My 2026 Senate Battleground Calls\n'+lines.join('\n')+'\n\nCompare your calls: willelectionpolls.com/?page=board\nPersonal predictions, not official results.';
  try{
   if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');
   await navigator.clipboard.writeText(body);btn.textContent='Copied! ✓';
  }catch(_){window.prompt('Copy your battleground picks:',body);}
  return;
 }
 const r=races().find(x=>x.code===btn.dataset.bbPick);
 if(!r)return;
 picks[r.code]=btn.dataset.bbSide==='1'?r.a:r.b;
 uiSignature='';refresh();
});
refresh();
window.setInterval(()=>{if(root.getClientRects().length)refresh();},4000);
window.addEventListener('pageshow',refresh);
})();
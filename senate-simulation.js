(()=>{
'use strict';
// All results and probabilities on this page are ILLUSTRATIVE, never live votes.
// Each of the 35 listed 2026 races has two modeled outcomes.
// The starting 34D+31R seats are the 65 seats NOT on the ballot.
// An independent win is not automatically assigned to a party caucus.
const ROWS=[
['AL','Alabama',.035,'Everett Wess','Barry Moore',20,1690000],
['AK','Alaska',.55,'Mary Peltola','Dan Sullivan',24,353000],
['AR','Arkansas',.08,'Hallie Shoffner','Tom Cotton',20.5,1100000],
['CO','Colorado',.985,'John Hickenlooper','Mark Baisley',21,2460000],
['DE','Delaware',.987,'Chris Coons','Republican nominee',20,460000],
['FL','Florida',.21,'Angie Nixon','Ashley Moody',19,8000000],
['GA','Georgia',.86,'Jon Ossoff','Mike Collins',19,4130000],
['ID','Idaho',.09,'Todd Achilles','Jim Risch',22,710000],
['IL','Illinois',.985,'Democratic nominee','Republican nominee',20,4980000],
['IA','Iowa',.53,'Josh Turek','Ashley Hinson',21,1490000],
['KS','Kansas',.37,'Adam Hamilton','Roger Marshall',20,1250000],
['KY','Kentucky',.065,'Democratic nominee','Republican nominee',18,1880000],
['LA','Louisiana',.045,'Democratic nominee','Republican nominee',21,1670000],
['ME','Maine',.485,'Troy Jackson','Susan Collins',20,740000],
['MA','Massachusetts',.985,'Ed Markey','Republican nominee',20,2750000],
['MI','Michigan',.57,'Abdul El-Sayed','Mike Rogers',20,4400000],
['MN','Minnesota',.82,'Peggy Flanagan','Michele Tafoya',21,2520000],
['MS','Mississippi',.035,'Democratic nominee','Cindy Hyde-Smith',20,1160000],
['MT','Montana',.18,'Seth Bodnar','Kurt Alme',22,480000,'I'],
['NE','Nebraska',.35,'Dan Osborn','Pete Ricketts',21,860000,'I'],
['NH','New Hampshire',.79,'Chris Pappas','John Sununu',19,775000],
['NJ','New Jersey',.975,'Cory Booker','Republican nominee',20,3400000],
['NM','New Mexico',.955,'Ben Ray Luján','Larry Marker',21,880000],
['NC','North Carolina',.88,'Roy Cooper','Michael Whatley',19.5,4610000],
['OH','Ohio',.59,'Sherrod Brown','Jon Husted',19.5,4760000],
['OK','Oklahoma',.035,'Democratic nominee','Republican nominee',20,1310000],
['OR','Oregon',.97,'Jeff Merkley','Republican nominee',23,1900000],
['RI','Rhode Island',.99,'Jack Reed','Allen McKay',20,470000],
['SC','South Carolina',.09,'Annie Andrews','Darline Graham',19,2100000],
['SD','South Dakota',.04,'Democratic nominee','Mike Rounds',21,366000],
['TN','Tennessee',.09,'Marquita Bradshaw','Bill Hagerty',20,2880000],
['TX','Texas',.55,'James Talarico','Ken Paxton',20,10300000],
['VA','Virginia',.98,'Mark Warner','Republican nominee',19,3900000],
['WV','West Virginia',.025,'Democratic nominee','Shelley Moore Capito',19.5,690000],
['WY','Wyoming',.025,'Democratic nominee','Republican nominee',21,280000]
];
const STATES=ROWS.map(([ab,name,p,a,b,close,total,alt])=>({ab,name,p,a,b,close,total,alt:alt||'D'}));
const BY=Object.fromEntries(STATES.map(s=>[s.ab,s]));
const $=id=>document.getElementById(id);
const MAX_TICK=18,BASE_D=34,BASE_R=31;
let tick=0,playing=false,timer=null,selected='TX',mode='likely',currentIndex=0,activeScenario=null;
const outcomeSide=(s,scenario)=>scenario[s.ab] || (s.p>=.5?s.alt:'R');
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const fmt=n=>Math.round(n).toLocaleString('en-US');
const percent=x=>Number(x).toFixed(1)+'%';
const hash=str=>{let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0)/4294967295};
function clock(t){const min=19*60+t*30, h24=Math.floor(min/60)%24, m=min%60,h=h24%12||12;return h+':'+String(m).padStart(2,'0')+(h24<12?' AM':' PM')+' ET';}
function clockShort(t){return clock(t).replace(' ET','').replace(':00','');}
function closing(s){let h=Math.floor(s.close)%24,half=s.close%1?'30':'00';return (h%12||12)+':'+half+(h<12?' AM':' PM')+' ET';}
function label(s,side){return side==='R'?s.b:s.a}
function initials(s,side){return (side==='R'?'R':side==='I'?'I':'D');}
function pretty(side){return side==='D'?'DEMOCRATIC':side==='R'?'REPUBLICAN':'INDEPENDENT'}
// Ordered outcome enumeration without materializing 2^35 leaves.
// Explore the K smallest subset sums of absolute negative log odds.
function rankScenarios(least=false,limit=40){
 const ordered=STATES.map((s,i)=>{
   const favored=s.p>=.5?s.alt:'R';
   return {s,i,preferred:least?(favored==='R'?s.alt:'R'):favored,
      delta:Math.abs(Math.log(s.p/(1-s.p)))};
 }).sort((a,b)=>a.delta-b.delta);
 const prior=ordered.reduce((v,o)=>v+Math.log(o.preferred==='R'?1-o.s.p:o.s.p),0);
 const heap=[],push=node=>{heap.push(node);let i=heap.length-1;while(i){let p=(i-1)>>1;if(heap[p].cost<=heap[i].cost)break;[heap[p],heap[i]]=[heap[i],heap[p]];i=p;}};
 const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let i=0;for(;;){let l=i*2+1,r=l+1,m=i;if(l<heap.length&&heap[l].cost<heap[m].cost)m=l;if(r<heap.length&&heap[r].cost<heap[m].cost)m=r;if(m===i)break;[heap[i],heap[m]]=[heap[m],heap[i]];i=m;}}return top;};
 push({cost:0,flips:0n,last:-1});const out=[];
 for(let k=0;k<limit&&heap.length;k++){
  const n=pop(),choices={},logprob=prior+(least?n.cost:-n.cost);
  ordered.forEach((o,j)=>{choices[o.s.ab]=(n.flips & (1n<<BigInt(j))) ? (o.preferred==='R'?o.s.alt:'R') : o.preferred;});
  const totals=ending(choices);
  out.push({choices,rank:k+1,logprob,totals,least});
  for(let j=n.last+1;j<ordered.length;j++)push({cost:n.cost+ordered[j].delta,flips:n.flips|(1n<<BigInt(j)),last:j});
 }
 return out;
}
function ending(choices){let D=BASE_D,R=BASE_R,I=0;STATES.forEach(s=>{const side=outcomeSide(s,choices);if(side==='R')R++;else if(side==='I')I++;else D++;});return {D,R,I};}
const likely=rankScenarios(false,48),unlikely=rankScenarios(true,48);
activeScenario=likely[0];
function probability(n){const p=Math.exp(n);return p>=.001?percent(p*100):p>=.0000001?(p*100).toFixed(5)+'%':(p*100).toExponential(1)+'%';}
function scenarioName(i,least){return (least?'Long-shot':'Scenario')+' #'+(i+1);}
function renderScenarios(){
 const list=$('scenario-list'),custom=$('custom-pane');
 list.hidden=mode==='custom';custom.hidden=mode!=='custom';
 for(const id of ['likely','unlikely','custom'])$(id).classList.toggle('active',id===mode);
 if(mode==='custom')return;
 const set=mode==='likely'?likely:unlikely;list.textContent='';
 for(let i=0;i<set.length;i++){
  const obj=set[i],btn=document.createElement('button');
  btn.className='scenario-option';
  btn.setAttribute('aria-current',activeScenario===obj?'true':'false');
  const description=document.createElement('span');
  const tt=document.createElement('b');tt.textContent=scenarioName(i,mode==='unlikely');
  const st=document.createElement('small');st.textContent='Model weight '+probability(obj.logprob);
  description.append(tt,st);
  const total=document.createElement('strong');total.textContent=obj.totals.D+' D  ·  '+obj.totals.R+' R'+(obj.totals.I?'  ·  '+obj.totals.I+' I':'');
  btn.append(description,total);
  btn.addEventListener('click',()=>chooseScenario(obj,i));
  list.appendChild(btn);
 }
}
function makeCustom(){
 const container=$('custom-races');
 STATES.forEach(s=>{
  const row=document.createElement('label');row.className='custom-race';
  const text=document.createElement('span');text.textContent=s.name+' ('+s.ab+')';
  const select=document.createElement('select');select.dataset.ab=s.ab;
  [['D',s.alt==='I'?'Independent':'Democratic'],['R','Republican']].forEach(([side,title])=>{
    const opt=document.createElement('option');opt.value=side==='D'?s.alt:side;opt.textContent=title;
    if((s.p>=.5?s.alt:'R')===opt.value)opt.selected=true;
    select.appendChild(opt);
  });
  row.append(text,select);container.appendChild(row);
 });
}
function chooseScenario(s,i){pause();activeScenario=s;currentIndex=i;tick=0;$('timeline').value=0;renderScenarios();render();updateScenarioBadge();}
function updateScenarioBadge(){
 const name=activeScenario?.custom?'YOUR PICK':activeScenario?.least?'BOTTOM #'+activeScenario.rank:'#'+activeScenario.rank;
 $('scenario-rank').textContent=name;
 $('scenario-prob').textContent=activeScenario?.custom?'Custom scenario · not ranked':'Model probability '+probability(activeScenario.logprob);
}
function progress(s,t){
 if(t===0)return 0; // Before Play, show the 34–31 non-up seat base only.
 const begin=Math.ceil((s.close-19)*2);
 if(t<begin)return 0;
 const n=t-begin;
 const curve=[2,10,23,38,54,69,81,89,95,98,100];
 return curve[clamp(n,0,curve.length-1)];
}
function stateResult(s,t,choices){
 const completion=progress(s,t),winner=outcomeSide(s,choices),fraction=completion/100;
 const favored=s.p>=.5?s.alt:'R',upset=favored!==winner;
 const strength=Math.abs(s.p-.5);
 const margin=clamp((strength*37+1.4)*(upset?.56:1),.75,25);
 const swing=Math.sin((t+2)*.95+hash(s.ab)*14)*8*Math.pow(1-fraction,.8);
 const winnerShare=clamp(50+margin/2+swing,45,82);
 const oppShare=100-winnerShare;
 const total=Math.floor(s.total*fraction),first=winner==='R'?oppShare:winnerShare;
 const aVotes=Math.round(total*first/100),bVotes=total-aVotes;
 const leader=aVotes>=bVotes?s.alt:'R';
 const closeness=Math.abs(s.p-.5);
 const elapsed=t-Math.ceil((s.close-19)*2);
 const threshold=closeness>.38?0:closeness>.25?1:closeness>.13?3:closeness>.07?5:7;
 const called=completion>0&&elapsed>=threshold&&(completion>=12||closeness>.38);
 return {completion,winner,called,leader,aVotes,bVotes,total,aShare:total?100*aVotes/total:0,bShare:total?100*bVotes/total:0};
}
function allAt(t){const res={};STATES.forEach(s=>res[s.ab]=stateResult(s,t,activeScenario.choices));return res;}
function summary(res){let D=BASE_D,R=BASE_R,I=0,called=0;for(const s of STATES){const row=res[s.ab];if(!row.called)continue;called++;if(row.winner==='R')R++;else if(row.winner==='I')I++;else D++;}return {D,R,I,called};}
function drawMap(res){
 const host=$('map');
 if(host.querySelector('svg')){
  for(const p of host.querySelectorAll('.state-shape[data-state]')){
   const s=BY[p.dataset.state],r=res[p.dataset.state];
   if(!s){p.removeAttribute('data-side');p.removeAttribute('data-leading');p.dataset.race='no';continue;}
   p.dataset.race='yes';p.dataset.selected=p.dataset.state===selected?'true':'false';
   if(r.called){p.dataset.side=r.winner;p.removeAttribute('data-leading');}
   else{p.removeAttribute('data-side');if(r.completion>0)p.dataset.leading=r.leader;else p.removeAttribute('data-leading');}
   const status=r.called?'called '+pretty(r.winner):r.completion?'reporting '+r.completion+' percent':'uncalled';
   p.setAttribute('aria-label',s.name+' Senate: '+status);
  }
 }
 const fallback=$('map-fallback');
 for(const b of fallback.querySelectorAll('button[data-state]')){const row=res[b.dataset.state];if(row?.called)b.dataset.side=row.winner;else b.removeAttribute('data-side');}
}
function candidateLine(s,side,votes,pct){
 const cls=side==='R'?'r':side==='I'?'i':'d';
 const container=document.createElement('div');container.className='candidate '+cls;
 const head=document.createElement('div');head.className='candidate-head';
 const name=document.createElement('span');name.textContent=label(s,side);
 const party=document.createElement('small');party.className='party';party.textContent=side;
 name.appendChild(party);
 const share=document.createElement('strong');share.textContent=pct.toFixed(1)+'%';
 head.append(name,share);
 const foot=document.createElement('div');foot.className='candidate-votes';
 const voteLabel=document.createElement('span');voteLabel.textContent='Simulated votes';
 const count=document.createElement('strong');count.textContent=fmt(votes);
 foot.append(voteLabel,count);
 const track=document.createElement('div');track.className='candidate-bar';
 const bar=document.createElement('i');bar.style.width=pct+'%';track.appendChild(bar);
 container.append(head,foot,track);return container;
}
function detail(res){
 const s=BY[selected],r=res[selected];if(!s)return;
 $('state-name').textContent=s.name;$('state-code').textContent=s.ab;
 const uncertainty=Math.abs(s.p-.5);
 $('state-rating').textContent=uncertainty<=.07?'TOSS-UP':uncertainty<=.18?'COMPETITIVE':uncertainty<=.35?'LEANING':'SAFE / LIKELY';
 $('poll-close').textContent=closing(s);
 const call=$('state-call');call.className='call-pill'+(r.called?' '+(r.winner==='R'?'rep':r.winner==='I'?'ind':'dem'):'');
 call.textContent=r.called?'SIMULATED CALL: '+pretty(r.winner):r.completion>0?'REPORTING · NOT CALLED':'AWAITING POLL CLOSE';
 $('reporting').textContent=r.completion+'%';$('report-bar').style.width=r.completion+'%';
 const box=$('candidate-results');box.textContent='';
 box.append(candidateLine(s,s.alt,r.aVotes,r.aShare),candidateLine(s,'R',r.bVotes,r.bShare));
 const hours=$('hourly-list');hours.textContent='';
 const start=Math.max(0,Math.ceil((s.close-19)*2));
 for(let t=start;t<=tick;t+=2){
  const rs=stateResult(s,t,activeScenario.choices),line=document.createElement('div');line.className='hour-item';
  const time=document.createElement('time');time.textContent=clockShort(t);
  const mid=document.createElement('span');mid.textContent=rs.completion?fmt(rs.aVotes)+'–'+fmt(rs.bVotes):'Waiting for polls';
  const right=document.createElement('strong');right.textContent=rs.completion+'%';
  line.append(time,mid,right);hours.appendChild(line);
 }
 if(tick<start){hours.textContent='Polls have not closed yet.';}
}
function desk(res){
 const el=$('feed');el.textContent='';const updates=[];
 for(const s of STATES){
  const r=res[s.ab],prev=stateResult(s,Math.max(-1,tick-1),activeScenario.choices);
  if(r.called&&(!prev.called||tick===0))updates.push({s,text:'PROJECTED '+pretty(r.winner)+' WIN · '+s.name,priority:1});
  else if(r.completion>0&&!r.called&&r.completion<90&&Math.abs(s.p-.5)<.17)updates.push({s,text:s.name+' remains uncalled · '+r.completion+'% simulated count',priority:2});
 }
 updates.sort((a,b)=>a.priority-b.priority||(Math.abs(a.s.p-.5)-Math.abs(b.s.p-.5)));
 if(!updates.length){const p=document.createElement('div');p.textContent=tick===0?'Polls are closing. Select a state or press Play to begin the simulated night.':'No new calls in this time window. The simulated count continues.';el.appendChild(p);return;}
 for(const u of updates.slice(0,9)){
  const d=document.createElement('div'),time=document.createElement('b');time.textContent=clockShort(tick);
  d.appendChild(time);d.appendChild(document.createTextNode(u.text));el.appendChild(d);
 }
}
function render(){
 const res=allAt(tick),s=summary(res);
 $('clock').textContent=clock(tick);
 $('dem-seats').textContent=s.D;$('rep-seats').textContent=s.R;$('ind-seats').textContent=s.I;
 $('dem-bar').style.width=s.D+'%';$('rep-bar').style.width=s.R+'%';$('out-bar').style.width=(100-s.D-s.R)+'%';
 $('outstanding').textContent=(35-s.called)+' seats outstanding';
 $('control-status').textContent=s.D>=51?'DEMOCRATS REACH 51':s.R>=51?'REPUBLICANS REACH 51':s.D===50&&s.R===50?'50–50 · VP breaks tie for GOP':s.called===35&&s.I?'Independent balance possible':'Control still undecided';
 $('called-count').textContent=s.called+' / 35 RACES CALLED';
 $('map-when').textContent=s.called+' of 35 calls · '+clock(tick);
 $('timeline').value=tick;
 drawMap(res);detail(res);desk(res);
}
function pause(){playing=false;clearTimeout(timer);timer=null;$('play').querySelector('span').textContent='PLAY ELECTION NIGHT';$('play').firstChild.nodeValue='▶ ';}
function step(){if(!playing)return;if(tick>=MAX_TICK){pause();return;}tick++;render();if(tick===MAX_TICK){pause();return;}timer=setTimeout(step,Number($('speed').value));}
function play(){if(playing){pause();return;}if(tick===MAX_TICK)tick=0;playing=true;$('play').querySelector('span').textContent='PAUSE SIMULATION';$('play').firstChild.nodeValue='❚❚ ';timer=setTimeout(step,Number($('speed').value));render();}
function selectState(ab){if(!BY[ab])return;selected=ab;render();}
function setupMap(){
 const fallback=$('map-fallback');
 for(const s of STATES){const b=document.createElement('button');b.type='button';b.dataset.state=s.ab;b.textContent=s.ab;b.addEventListener('click',()=>selectState(s.ab));fallback.appendChild(b);}
 fetch('/election-night-map.svg?v=20261013-sim',{cache:'force-cache'}).then(r=>{if(!r.ok)throw Error('Map HTTP '+r.status);return r.text()}).then(svgText=>{
   const doc=new DOMParser().parseFromString(svgText,'image/svg+xml'),svg=doc.documentElement;
   if(doc.querySelector('parsererror')||svg.localName!=='svg'||svg.querySelectorAll('.state-shape[data-state]').length<45)throw Error('Invalid state outlines');
   svg.removeAttribute('style');
   $('map').replaceChildren(document.importNode(svg,true));
   const map=$('map').querySelector('svg');
   map.querySelectorAll('.state-shape[data-state]').forEach(p=>{
      const ab=p.dataset.state;
      if(!BY[ab]){p.setAttribute('aria-label','No 2026 Senate race');return;}
      p.setAttribute('role','button');p.setAttribute('tabindex','0');
      p.addEventListener('click',()=>selectState(ab));
      p.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectState(ab);}});
      let title=p.querySelector('title');if(!title){title=document.createElementNS('http://www.w3.org/2000/svg','title');p.appendChild(title);}title.textContent=BY[ab].name+' Senate race';
   });
   render();
 }).catch(error=>{console.warn('Election night SVG unavailable; using state buttons',error);$('map').textContent='Map temporarily unavailable; use the state buttons below.';fallback.hidden=false;});
}
function initialize(){
 makeCustom();setupMap();
 $('play').addEventListener('click',play);
 $('restart').addEventListener('click',()=>{pause();tick=0;render();});
 $('speed').addEventListener('change',()=>{if(playing){clearTimeout(timer);timer=setTimeout(step,Number($('speed').value));}});
 $('timeline').addEventListener('input',()=>{pause();tick=Number($('timeline').value);render();});
 for(const id of ['likely','unlikely','custom'])$(id).addEventListener('click',()=>{mode=id;renderScenarios();});
 $('apply-custom').addEventListener('click',()=>{
    const choices={};document.querySelectorAll('#custom-races select').forEach(el=>choices[el.dataset.ab]=el.value);
    chooseScenario({choices,custom:true,totals:ending(choices),rank:0},0);
    mode='custom';renderScenarios();play();
 });
 renderScenarios();updateScenarioBadge();render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
})();
(()=>{
'use strict';
const STATE_NAMES={AL:'Alabama',AK:'Alaska',AR:'Arkansas',CO:'Colorado',DE:'Delaware',FL:'Florida',GA:'Georgia',ID:'Idaho',IL:'Illinois',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MT:'Montana',NE:'Nebraska',NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',NC:'North Carolina',OH:'Ohio',OK:'Oklahoma',OR:'Oregon',RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',TN:'Tennessee',TX:'Texas',VA:'Virginia',WV:'West Virginia',WY:'Wyoming'};
const STATE_CODES=Object.keys(STATE_NAMES);
// Every state's scheduled November 3, 2026 closing times, in Eastern
// Standard Time minutes from 12:00 AM November 3.
// Ranges reflect different local time zones or municipal close times.
// Sourced from 270toWin's 2026 poll closing times and Green Papers 2026
// general-election polling hours. These are informational, not voting advice.
const EXTRA_STATE_NAMES={
 AZ:'Arizona',CA:'California',CT:'Connecticut',HI:'Hawaii',IN:'Indiana',
 MD:'Maryland',MO:'Missouri',ND:'North Dakota',NV:'Nevada',NY:'New York',
 PA:'Pennsylvania',UT:'Utah',VT:'Vermont',WA:'Washington',WI:'Wisconsin',
 DC:'District of Columbia'
};
const ALL_STATE_NAMES={...STATE_NAMES,...EXTRA_STATE_NAMES};
const POLL_CLOSING_ET={
 AL:[1200],AK:[1440,1500],AZ:[1260],AR:[1230],CA:[1380],
 CO:[1260],CT:[1200],DE:[1200],FL:[1140,1200],GA:[1140],
 HI:[1440],ID:[1320,1380],IL:[1200],IN:[1080,1140],IA:[1260],
 KS:[1200,1260],KY:[1080,1140],LA:[1260],ME:[1200],MD:[1200],
 MA:[1200],MI:[1200,1260],MN:[1260],MS:[1200],MO:[1200],
 MT:[1320],NE:[1260],NV:[1320],NH:[1140,1200],NJ:[1200],
 NM:[1260],NY:[1260],NC:[1170],ND:[1200,1260],OH:[1170],
 OK:[1200],OR:[1320,1380],PA:[1200],RI:[1200],SC:[1140],
 SD:[1200,1260],TN:[1200],TX:[1200,1260],UT:[1320],VT:[1140],
 VA:[1140],WA:[1380],WV:[1170],WI:[1260],WY:[1260],DC:[1200]
};
const POLL_CLOSE_NOTES={
 AK:'Most of Alaska and the western Aleutians close at different times; the Eastern times fall on Nov 4.',
 FL:'Eastern and Central Time zones.',
 ID:'Mountain and Pacific Time zones.',
 IN:'Eastern and Central Time zones.',
 KS:'Central and Mountain Time zones.',
 KY:'Eastern and Central Time zones.',
 MI:'Eastern and Central Time zones.',
 NH:'Many towns close at 7 PM ET; others close at 8 PM ET.',
 ND:'Central and Mountain Time zones.',
 OR:'Pacific and Mountain Time zones.',
 SD:'Central and Mountain Time zones.',
 TX:'Central and Mountain Time zones.'
};
function pollClock(totalMinutes){
 const minutes=((totalMinutes%1440)+1440)%1440;
 const hour24=Math.floor(minutes/60);
 const hour12=hour24%12||12;
 return hour12+':'+String(minutes%60).padStart(2,'0')+(hour24<12?' AM':' PM');
}
function pollClockRange(times,delta=0){
 if(!times||!times.length)return 'Not available';
 const first=pollClock(times[0]+delta),last=pollClock(times[times.length-1]+delta);
 return first===last?first:first+' – '+last;
}
function statePollClose(ab){
 const times=POLL_CLOSING_ET[ab];
 if(!times)return null;
 return {
  et:pollClockRange(times)+' ET',
  pt:pollClockRange(times,-180)+' PT',
  note:POLL_CLOSE_NOTES[ab]||(times.some(x=>x>=1440)?'Eastern close occurs on Nov 4; local close is Nov 3.':''),
  easternNextDay:times.some(x=>x>=1440)
 };
}


const ELECTION_DAY_EST_MIDNIGHT=Date.parse('2026-11-03T00:00:00-05:00');
function statePollStatus(ab,now=Date.now()){
 const times=POLL_CLOSING_ET[ab];
 if(!Array.isArray(times)||!times.length)return 'unknown';
 const closings=times.map(min=>ELECTION_DAY_EST_MIDNIGHT+min*60000);
 if(now<closings[0])return 'before';
 if(now<closings[closings.length-1])return 'partial';
 return 'closed';
}

const SOURCES={
 ap:{name:'Associated Press',short:'AP',file:'/election-night-ap.json',link:'https://apnews.com/',linkLabel:'Open AP reporting ↗',description:'AP election calls and vote totals require access to the AP Elections API. This view will populate only when an authorized results file is published to this site.'},
 nyt:{name:'The New York Times',short:'NYT',file:'/election-night-nyt.json',link:'https://www.nytimes.com/section/politics',linkLabel:'Open NYT coverage ↗',description:'New York Times election-night reporting is a separate source. This tab does not copy or scrape NYT results; an authorized data feed must be configured to display its calls here.'}
};
const $=id=>document.getElementById(id);
let source='ap', selected='TX', lastFetchAt=null, busy=false, mapSvg=null, hoveredState=null, hoverPosition=null, pendingRefresh=false;
const datasets={ap:null,nyt:null};
const races={ap:new Map(),nyt:new Map()};
const preElection=()=>Date.now()<Date.parse('2026-11-03T00:00:00-04:00');

function partyCode(value){
 const s=String(value||'').trim().toLowerCase();
 if(['d','dem','democratic','democrat'].includes(s))return'D';
 if(['r','rep','republican'].includes(s))return'R';
 if(['i','ind','independent','other','independent / other'].includes(s))return'I';
 return null;
}
function parseFeed(feed,key){
 if(!feed||typeof feed!=='object'||feed.election!=='2026-11-03'||!Array.isArray(feed.races))throw Error('Invalid feed schema');
 if(feed.source!==key)throw Error('Source mismatch');
 const out=new Map();
 for(const row of feed.races){
   if(!row||typeof row!=='object')continue;
   const state=String(row.state||'').trim().toUpperCase();
   if(!STATE_CODES.includes(state))continue;
   const called=row.called===true;
   const party=partyCode(row.party);
   if(called&&!party)continue;
   const candidates=Array.isArray(row.candidates)?row.candidates.slice(0,8).map(c=>({
     name:String(c?.name||'').slice(0,110),
     party:partyCode(c?.party),
     votes:c?.votes!==null&&c?.votes!==undefined&&c?.votes!==''&&Number.isFinite(Number(c.votes))&&Number(c.votes)>=0?Math.floor(Number(c.votes)):null,
     pct:c?.pct!==null&&c?.pct!==undefined&&c?.pct!==''&&Number.isFinite(Number(c.pct))?Math.max(0,Math.min(100,Number(c.pct))):null
   })):[];
   const reported=row.pct_reporting===null||row.pct_reporting===undefined||row.pct_reporting===''?NaN:Number(row.pct_reporting);
   out.set(state,{
     state,called,party:called?party:null,
     winner:called?String(row.winner||'').slice(0,100):'',
     pct_reporting:Number.isFinite(reported)?Math.max(0,Math.min(100,reported)):null,
     candidates
   });
 }
 return out;
}
function setMessage(message){$('feed-notice').textContent=message;}
function timestamp(v){
 if(!v)return'';
 const n=Date.parse(v);
 return Number.isFinite(n)?new Date(n).toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'}):'';
}
function activeRaces(){return races[source];}
function updateStatus(){
 const config=SOURCES[source],feed=datasets[source],last=feed?.updated_at||null;
 const isActive=feed?.status==='live'&&races[source].size>0;
 const fresh=last&&Number.isFinite(Date.parse(last))&&(Date.now()-Date.parse(last))<10*60*1000;
 const healthy=isActive&&fresh;
 $('feed-dot').classList.toggle('active',healthy);
 const suffix=last?'Updated '+timestamp(last):'No results feed connected';
 $('status-text').textContent=healthy?'Receiving '+config.short+' results':(isActive?'Feed stale — verify source':'Awaiting authorized '+config.short+' results');
 $('checked-at').textContent=last?'• '+suffix:'';
 $('map-title').textContent=config.name+' · Senate calls';
 $('map-subtitle').textContent='Uncalled races shade by reported vote margin · darkest shades = calls';
 $('source-title').textContent=config.name.toUpperCase()+' COVERAGE';
 $('source-description').textContent=config.description;
 $('source-link').href=config.link;
 $('source-link').textContent=config.linkLabel;
 const called=[...races[source].values()].filter(x=>x.called).length;
 if(healthy)setMessage('Displaying '+called+' officially called races from the configured '+config.short+' feed. Counts refresh every 10 seconds while this page is open.');
 else if(preElection())setMessage('The November 3, 2026 general election has not taken place. No election-night race calls are available yet. A licensed '+config.short+' data feed has not been connected.');
 else if(!feed||feed.status==='awaiting-license')setMessage('No authorized '+config.short+' results feed is connected. Visit the source coverage link for independently published results; this map will not manufacture calls.');
 else if(isActive&&!fresh)setMessage(config.short+' result data is outdated. The dashboard shows only the last recorded calls and labels the feed as stale.');
 else setMessage('Waiting for results from the authorized '+config.short+' source feed.');
}
function countCalls(){
 const data=activeRaces(),called=[...data.values()].filter(x=>x.called);
 const counts={
   D:called.filter(x=>x.party==='D').length,
   R:called.filter(x=>x.party==='R').length,
   I:called.filter(x=>x.party==='I').length
 };
 const total=STATE_CODES.length,uncalled=Math.max(0,total-called.length);
 $('count-d').textContent=counts.D;
 $('count-r').textContent=counts.R;
 $('count-i').textContent=counts.I;
 $('count-u').textContent=uncalled;
 // These are calls in the 35 contested Senate states, NOT chamber balance.
 $('count-total').textContent=called.length+' / '+total;
 for(const party of ['d','r','i']){
   const id=party==='d'?'bar-call-d':party==='r'?'bar-call-r':'bar-call-i';
   const value=counts[party.toUpperCase()];
   $(id).style.width=(total?value/total*100:0).toFixed(3)+'%';
 }
 const meter=$('score-track');
 meter.setAttribute('aria-valuenow',String(called.length));
 meter.setAttribute('aria-valuetext',called.length+' of '+total+' Senate races called');
}
// Colors reflect the lead in reported election-night vote *percentages*
// until a source calls the race. A call always receives the darkest shade.
// Unreported races and exact ties remain gray; never use polling forecasts here.
const NIGHT_PALETTE={
 D:{light:[205,225,250],dark:[23,63,135]},
 R:{light:[249,214,218],dark:[142,19,32]},
 I:{light:[231,217,250],dark:[91,41,153]}
};
const UNREPORTED_COLOR='#cbd4df';
const SHADE_MARGIN_CAP=25;

function reportedLeader(row){
 if(!row||!Array.isArray(row.candidates)||row.candidates.length<2)return null;
 const candidates=row.candidates;
 // Prefer the source's percentages when available for every candidate.
 // Otherwise use the vote count share, but only when all counts are present.
 const allPcts=candidates.every(c=>c&&Number.isFinite(c.pct)&&c.pct>=0);
 const allVotes=candidates.every(c=>c&&Number.isFinite(c.votes)&&c.votes>=0);
 let values;
 if(allPcts&&candidates.some(c=>c.pct>0)){
   values=candidates.map(c=>({name:c.name,party:c.party,percent:c.pct}));
 }else if(allVotes){
   const total=candidates.reduce((sum,c)=>sum+c.votes,0);
   if(total<=0)return null;
   values=candidates.map(c=>({name:c.name,party:c.party,percent:c.votes/total*100}));
 }else return null;
 values.sort((a,b)=>b.percent-a.percent);
 const first=values[0],second=values[1],margin=first.percent-second.percent;
 if(!NIGHT_PALETTE[first.party]||!Number.isFinite(margin)||margin<=0.001)return null;
 return {name:first.name,party:first.party,percent:first.percent,margin};
}
function statePaint(row){
 const lead=reportedLeader(row);
 if(row?.called&&NIGHT_PALETTE[row.party]){
   return {color:rgbHex(NIGHT_PALETTE[row.party].dark),dark:true,called:true,lead};
 }
 if(!lead)return {color:UNREPORTED_COLOR,dark:false,called:false,lead:null};
 const ramp=NIGHT_PALETTE[lead.party];
 const progress=Math.min(1,Math.max(0,lead.margin/SHADE_MARGIN_CAP));
 const channels=ramp.light.map((v,i)=>Math.round(v+(ramp.dark[i]-v)*progress));
 const brightness=.2126*channels[0]+.7152*channels[1]+.0722*channels[2];
 return {color:rgbHex(channels),dark:brightness<145,called:false,lead};
}
function rgbHex(channels){
 return '#'+channels.map(x=>Math.round(x).toString(16).padStart(2,'0')).join('');
}
function colorDescription(ab,row,paint){
 const base='Show '+(ALL_STATE_NAMES[ab]||ab)+' election results';
 if(row?.called)return base+' — called '+(row.party==='D'?'Democratic':row.party==='R'?'Republican':'Independent');
 if(paint.lead)return base+' — '+paint.lead.name+' leads by '+paint.lead.margin.toFixed(1)+' percentage points; not called';
 return base+' — no reported vote lead';
}
function renderMap(){
 const data=activeRaces();
 if(mapSvg){
   for(const path of mapSvg.querySelectorAll('.state-shape[data-state]')){
     const ab=path.dataset.state?.toUpperCase();
     const row=data.get(ab),paint=statePaint(row);
     path.style.setProperty('--night-fill',paint.color);
     if(row?.called)path.setAttribute('data-called',row.party);
     else path.removeAttribute('data-called');
     path.setAttribute('aria-label',colorDescription(ab,row,paint));
   }
   for(const label of mapSvg.querySelectorAll('[data-label]')){
     const ab=label.getAttribute('data-label')?.toUpperCase();
     label.classList.toggle('night-called',statePaint(data.get(ab)).dark);
   }
 }else{
   for(const btn of $('fallback-map').querySelectorAll('button[data-state]')){
     const ab=btn.dataset.state,row=data.get(ab),paint=statePaint(row);
     btn.style.setProperty('--night-fill',paint.color);
     btn.style.setProperty('--night-text',paint.dark?'#fff':'#253a52');
     btn.setAttribute('aria-label',colorDescription(ab,row,paint));
     if(row?.called)btn.dataset.called=row.party;
     else btn.removeAttribute('data-called');
   }
 }
}
function fmtVotes(n){return Number.isFinite(n)?Math.floor(n).toLocaleString():'—';}
function makeHoverElement(tag,className,value){
 const el=document.createElement(tag);
 if(className)el.className=className;
 if(value!==undefined)el.textContent=value;
 return el;
}
const hoverCard=document.createElement('div');
hoverCard.id='state-results-tooltip';
hoverCard.setAttribute('role','tooltip');
hoverCard.setAttribute('aria-hidden','true');
hoverCard.hidden=true;

function drawHover(ab){
 if(!ALL_STATE_NAMES[ab])return;
 const hasSenateRace=Object.prototype.hasOwnProperty.call(STATE_NAMES,ab);
 const row=activeRaces().get(ab);
 const sourceName=SOURCES[source].short;
 const pollStatus=statePollStatus(ab);
 const pollsClosed=pollStatus==='closed';
 hoverCard.replaceChildren();
 const head=makeHoverElement('div','hover-head');
 head.appendChild(makeHoverElement('strong','hover-title',ALL_STATE_NAMES[ab]));
 head.appendChild(makeHoverElement('span','hover-source',sourceName));
 hoverCard.appendChild(head);

 // Before all jurisdictions have closed, keep the scheduled time prominent.
 // The switch is based on real November 3 ET closing instants, not browser
 // timezone, candidate percentages, or whether a data feed exists.
 const close=statePollClose(ab);
 if(close&&!pollsClosed){
   const times=makeHoverElement('div','hover-pollclose');
   times.appendChild(makeHoverElement('span','hover-pollclose-label',
     pollStatus==='partial'?'SOME POLLS CLOSED · FINAL CLOSING':'POLLS CLOSE · NOV 3'));
   times.appendChild(makeHoverElement('strong','hover-pollclose-et',close.et));
   times.appendChild(makeHoverElement('span','hover-pollclose-pt',close.pt));
   if(close.note)times.appendChild(makeHoverElement('small','hover-pollclose-note',close.note));
   hoverCard.appendChild(times);
 }
 let callText=hasSenateRace?'NOT CALLED':'NO 2026 SENATE RACE';
 if(row?.called)callText='CALLED '+(row.party==='D'?'DEMOCRATIC':row.party==='R'?'REPUBLICAN':'INDEPENDENT');
 hoverCard.appendChild(makeHoverElement('div','hover-call '+(row?.called?'is-called-'+row.party:''),callText));

 if(!pollsClosed){
   // Do not display fabricated or premature election-night vote figures.
   hoverCard.appendChild(makeHoverElement('div','hover-pending',
     pollStatus==='partial'?'Some areas have closed; election-night results appear here after the final scheduled closing time.':
     'Current election-night results will replace the closing time when polls close.'));
   return;
 }
 // Once the final local polls close, permanently replace the closing time
 // with this source's actual reported vote totals and percentages.
 const block=makeHoverElement('div','hover-results');
 block.appendChild(makeHoverElement('div','hover-results-heading',
   hasSenateRace?sourceName+' CURRENT RESULTS':'POLLS CLOSED'));
 const lead=reportedLeader(row);
 if(lead&&!row?.called){
   block.appendChild(makeHoverElement('div','hover-lead',
     'Currently leading: '+lead.name+' by '+lead.margin.toFixed(1)+' percentage points'));
 }
 const candidates=hasSenateRace?(row?.candidates||[]):[];
 if(candidates.length){
   const validCounts=candidates.filter(x=>Number.isFinite(x.votes));
   const voteSum=validCounts.reduce((n,x)=>n+x.votes,0);
   for(const cand of candidates){
     const line=makeHoverElement('div','hover-candidate');
     line.appendChild(makeHoverElement('span','hover-candidate-name '+(cand.party?'party-'+cand.party:''),cand.name||'Candidate'));
     const stats=makeHoverElement('span','hover-candidate-stats');
     const percent=cand.pct!==null?cand.pct:
       (Number.isFinite(cand.votes)&&validCounts.length===candidates.length&&voteSum>0?cand.votes/voteSum*100:null);
     stats.appendChild(makeHoverElement('b','',percent===null?'—':percent.toFixed(1)+'%'));
     stats.appendChild(makeHoverElement('small','',fmtVotes(cand.votes)+' votes'));
     line.appendChild(stats);
     block.appendChild(line);
   }
   if(validCounts.length===candidates.length){
     block.appendChild(makeHoverElement('div','hover-total','Votes shown: '+fmtVotes(voteSum)));
   }
 }else{
   block.appendChild(makeHoverElement('div','hover-empty',
     !hasSenateRace?'No 2026 U.S. Senate race in this state.':
     'Polls are closed. Awaiting '+sourceName+' election-night results.'));
 }
 if(row?.pct_reporting!==null&&row?.pct_reporting!==undefined){
   block.appendChild(makeHoverElement('div','hover-reported',row.pct_reporting.toFixed(1)+'% of precincts reporting'));
 }
 if(datasets[source]?.updated_at){
   block.appendChild(makeHoverElement('div','hover-updated','Last feed update: '+timestamp(datasets[source].updated_at)));
 }
 hoverCard.appendChild(block);
}
function positionHover(x,y){
 if(!Number.isFinite(x)||!Number.isFinite(y))return;
 const rect=hoverCard.getBoundingClientRect();
 const w=rect.width||300,h=rect.height||175,margin=10;
 let left=x+15,top=y+15;
 if(left+w>window.innerWidth-margin)left=x-w-15;
 if(top+h>window.innerHeight-margin)top=y-h-15;
 hoverCard.style.left=Math.max(margin,Math.min(left,window.innerWidth-w-margin))+'px';
 hoverCard.style.top=Math.max(margin,Math.min(top,window.innerHeight-h-margin))+'px';
}
function showHover(ab,event){
 if(!ALL_STATE_NAMES[ab])return;
 hoveredState=ab;
 if(event&&Number.isFinite(event.clientX)&&Number.isFinite(event.clientY)){
   hoverPosition={x:event.clientX,y:event.clientY};
 }
 drawHover(ab);
 hoverCard.hidden=false;
 hoverCard.setAttribute('aria-hidden','false');
 if(hoverPosition)positionHover(hoverPosition.x,hoverPosition.y);
}
function hideHover(){
 hoveredState=null;hoverPosition=null;
 hoverCard.hidden=true;hoverCard.setAttribute('aria-hidden','true');
}
function updateHover(){
 if(!hoveredState||hoverCard.hidden)return;
 drawHover(hoveredState);
 if(hoverPosition)positionHover(hoverPosition.x,hoverPosition.y);
}
function hoverFromEvent(event,selector){
 const node=event.target?.closest?.(selector);
 if(!node)return null;
 const ab=node.dataset.state;
 return ALL_STATE_NAMES[ab]?ab:null;
}
function bindHoverEvents(container,selector){
 container.addEventListener('pointerover',e=>{
   const ab=hoverFromEvent(e,selector);
   if(ab)showHover(ab,e);
 });
 container.addEventListener('pointermove',e=>{
   const ab=hoverFromEvent(e,selector);
   if(!ab){hideHover();return;}
   if(ab!==hoveredState)showHover(ab,e);
   else{hoverPosition={x:e.clientX,y:e.clientY};positionHover(e.clientX,e.clientY);}
 });
 container.addEventListener('pointerout',e=>{
   const old=hoverFromEvent(e,selector);
   const next=e.relatedTarget?.closest?.(selector);
   if(old&&(!next||next.dataset.state!==old))hideHover();
 });
 container.addEventListener('focusin',e=>{
   const ab=hoverFromEvent(e,selector);
   if(!ab)return;
   const rect=e.target.getBoundingClientRect();
   showHover(ab,{clientX:rect.left+rect.width/2,clientY:rect.top+rect.height/2});
 });
 container.addEventListener('focusout',hideHover);
 container.addEventListener('click',e=>{
   const ab=hoverFromEvent(e,selector);
   if(ab)hideHover();
 });
}
function renderDetails(){
 const row=activeRaces().get(selected);
 $('state-name').textContent=STATE_NAMES[selected]||selected;
 $('race-select').value=selected;
 const close=statePollClose(selected);
 const status=statePollStatus(selected);
 const pollDetails=$('poll-closing-details');
 if(pollDetails){
   pollDetails.textContent=status==='closed'
    ?'Polls closed · '+(row?.candidates?.length?SOURCES[source].short+' current results below':'awaiting '+SOURCES[source].short+' results')
    :close
      ?(status==='partial'?'Some polls closed · final scheduled close: ':'Scheduled poll closing: ')+close.et+' / '+close.pt+(close.note?' · '+close.note:'')
      :'Poll closing time unavailable';
 }
 $('call-label').textContent=row?.called?('CALLED '+(row.party==='D'?'DEMOCRATIC':row.party==='R'?'REPUBLICAN':'OTHER')):'NOT CALLED';
 $('call-label').style.borderColor=row?.party==='D'?'#5d9bf0':row?.party==='R'?'#fa7286':'#56728f';
 if(!row){
  $('race-description').textContent=status==='closed'
    ?'Polls are closed. Awaiting '+SOURCES[source].short+' election-night results for '+STATE_NAMES[selected]+'.'
    :'No certified or verified election-night vote report has been received from this source for '+STATE_NAMES[selected]+'.';
  $('race-votes').textContent=status==='closed'?'No candidate vote totals reported yet.':'Polls and forecasts are not election results.';
  return;
 }
 $('race-description').textContent=row.called
  ?(row.winner?row.winner+' was called by '+SOURCES[source].name+'.':SOURCES[source].name+' has called this race for the '+(row.party==='D'?'Democratic':row.party==='R'?'Republican':'Independent / Other')+' candidate.')
  :(reportedLeader(row)
    ?reportedLeader(row).name+' currently leads by '+reportedLeader(row).margin.toFixed(1)+' percentage points in reported votes. The race has not been called.'
    :'Votes may be reported, but this source has not called the race.');
 const parts=[];
 if(row.pct_reporting!==null)parts.push(row.pct_reporting.toFixed(1)+'% of precincts reporting');
 if(row.candidates.length)parts.push(row.candidates.map(c=>c.name+': '+fmtVotes(c.votes)+(c.pct!==null?' ('+c.pct.toFixed(1)+'%)':'')).join(' · '));
 $('race-votes').textContent=parts.join(' · ')||'No vote totals reported.';
}
function render(){
 updateStatus();countCalls();renderMap();renderDetails();updateHover();
}
function chooseSource(key){
 if(!SOURCES[key])return;
 source=key;
 hideHover();
 for(const btn of document.querySelectorAll('.tab[data-source]'))btn.setAttribute('aria-selected',btn.dataset.source===key?'true':'false');
 render();
 refresh();
}
function buildStates(){
 const dropdown=$('race-select'),grid=$('fallback-map');
 STATE_CODES.sort((a,b)=>STATE_NAMES[a].localeCompare(STATE_NAMES[b]));
 for(const ab of STATE_CODES){
   const option=document.createElement('option');option.value=ab;option.textContent=STATE_NAMES[ab];dropdown.appendChild(option);
   const btn=document.createElement('button');btn.type='button';btn.className='grid-state';btn.dataset.state=ab;btn.textContent=ab;btn.title=STATE_NAMES[ab];btn.setAttribute('aria-label',STATE_NAMES[ab]);grid.appendChild(btn);
 }
 dropdown.addEventListener('change',()=>{selected=dropdown.value;renderDetails();});
 grid.addEventListener('click',e=>{const b=e.target.closest('button[data-state]');if(!b)return;selected=b.dataset.state;renderDetails();});
 bindHoverEvents(grid,'button[data-state]');
}
async function refresh(){
 if(busy){pendingRefresh=true;return;}
 busy=true;
 $('refresh').disabled=true;
 const config=SOURCES[source],which=source;
 try{
  const response=await fetch(config.file+'?cache='+Date.now(),{cache:'no-store'});
  if(!response.ok)throw Error('HTTP '+response.status);
  const feed=await response.json();
  const parsed=parseFeed(feed,which);
  datasets[which]=feed;
  races[which]=parsed;
 }catch(e){
  datasets[which]=null;
  races[which]=new Map();
  setMessage('Cannot read '+config.short+' results feed: '+String(e.message||e));
 }finally{
  lastFetchAt=new Date();
  $('refresh').disabled=false;
  busy=false;
  render();
  if(pendingRefresh){pendingRefresh=false;queueMicrotask(refresh);}
 }
}
const MAP_CACHE_KEY='will-election-night-standalone-svg-v2';
const MAP_CACHE_MAX_AGE=24*60*60*1000;

function attachElectionMap(svg){
 if(!svg||svg.tagName?.toLowerCase()!=='svg'||svg.querySelectorAll('.state-shape[data-state]').length<30)return false;
 // Clone the map geometry but not the homepage's predictions or its event handlers.
 svg.removeAttribute('style');
 svg.setAttribute('aria-label','2026 Senate states by reported results');
 svg.removeAttribute('width');svg.removeAttribute('height');
 svg.querySelectorAll('script,foreignObject').forEach(x=>x.remove());
 for(const shape of svg.querySelectorAll('.state-shape')){
   shape.style.removeProperty('fill');
   shape.removeAttribute('fill');
   shape.removeAttribute('data-called');
 }
 for(const label of svg.querySelectorAll('[data-label]')){
   label.removeAttribute('style');
   label.classList.remove('active-label','light-text','night-called');
 }
 const slot=$('map-slot');
 slot.replaceChildren(svg);
 mapSvg=svg;
 bindHoverEvents(svg,'.state-shape[data-state]');
 svg.addEventListener('click',e=>{
   const shape=e.target.closest('.state-shape[data-state]');
   if(!shape||!STATE_NAMES[shape.dataset.state])return;
   selected=shape.dataset.state;
   renderDetails();
 });
 svg.querySelectorAll('.state-shape[data-state]').forEach(el=>{
   el.setAttribute('tabindex','0');
   el.setAttribute('role','button');
   el.setAttribute('aria-label','Show '+(ALL_STATE_NAMES[el.dataset.state]||el.dataset.state)+' election results');
   el.addEventListener('keydown',e=>{
     if(e.key==='Enter'||e.key===' '){
       e.preventDefault();
       selected=el.dataset.state;
       renderDetails();
     }
   });
 });
 renderMap();
 return true;
}

function readCachedElectionMap(){
 try{
   const saved=JSON.parse(sessionStorage.getItem(MAP_CACHE_KEY)||'null');
   if(!saved||Date.now()-saved.savedAt>MAP_CACHE_MAX_AGE||typeof saved.svg!=='string')return null;
   const doc=new DOMParser().parseFromString(saved.svg,'image/svg+xml');
   const svg=doc.documentElement;
   if(svg?.localName!=='svg'||svg.querySelectorAll('.state-shape[data-state]').length<30)return null;
   return svg;
 }catch(_){return null;}
}
function cacheElectionMap(svg){
 try{
   // Store a geometry snapshot to avoid reloading the whole original site
   // through a hidden iframe after an ordinary page refresh.
   sessionStorage.setItem(MAP_CACHE_KEY,JSON.stringify({savedAt:Date.now(),svg:svg.outerHTML}));
 }catch(_){ /* Storage can be unavailable; the map still loads normally. */ }
}
function showElectionMapFallback(){
 if(mapSvg)return;
 $('map-loading')?.remove();
 const fallback=$('fallback-map');
 if(fallback){
   fallback.hidden=false;
   fallback.classList.add('is-ready');
 }
 const notice=document.createElement('p');
 notice.className='map-fallback-notice';
 notice.textContent='Map outline is unavailable right now. Select a state below for election-night details.';
 $('map-slot')?.prepend(notice);
 renderMap();
}
// Use a committed standalone vector map. No iframe, compressed fragments,
// homepage JavaScript or third-party network calls are needed.
async function loadSenateMapDirectly(signal){
 const response=await fetch('/election-night-map.svg?v=20261008-static2',{signal,cache:'no-store'});
 if(!response.ok)throw new Error('Election map SVG could not load (HTTP '+response.status+')');
 const markup=await response.text();
 const parsed=new DOMParser().parseFromString(markup,'image/svg+xml');
 if(parsed.querySelector('parsererror'))throw new Error('Invalid Election Night SVG');
 const svg=parsed.documentElement;
 if(svg?.localName!=='svg'||svg.querySelectorAll('.state-shape[data-state]').length<50){
   throw new Error('Election map SVG does not contain all state outlines');
 }
 return document.importNode(svg,true);
}
function setupMapFromExistingSenateSVG(){
 const cached=readCachedElectionMap();
 if(cached&&attachElectionMap(cached))return;
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),12000);
 loadSenateMapDirectly(controller.signal).then(svg=>{
   if(mapSvg)return;
   if(!attachElectionMap(svg))throw new Error('Could not attach state map');
   cacheElectionMap(svg);
 }).catch(error=>{
   console.warn('Election Night map load:',error);
   showElectionMapFallback();
 }).finally(()=>clearTimeout(timeout));
}
function init(){
 document.body.appendChild(hoverCard);
 buildStates();
 $('tab-ap').addEventListener('click',()=>chooseSource('ap'));
 $('tab-nyt').addEventListener('click',()=>chooseSource('nyt'));
 $('refresh').addEventListener('click',refresh);
 setupMapFromExistingSenateSVG();
 render();refresh();
 setInterval(()=>{if(!document.hidden)refresh();},10000);
 // The clock-driven switch also updates if a feed request has not finished.
 setInterval(()=>{if(!document.hidden){updateHover();renderDetails();}},1000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
(()=>{
'use strict';
const STATE_NAMES={AL:'Alabama',AK:'Alaska',AR:'Arkansas',CO:'Colorado',DE:'Delaware',FL:'Florida',GA:'Georgia',ID:'Idaho',IL:'Illinois',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MT:'Montana',NE:'Nebraska',NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',NC:'North Carolina',OH:'Ohio',OK:'Oklahoma',OR:'Oregon',RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',TN:'Tennessee',TX:'Texas',VA:'Virginia',WV:'West Virginia',WY:'Wyoming'};
const STATE_CODES=Object.keys(STATE_NAMES);
const SOURCES={
 ap:{name:'Associated Press',short:'AP',file:'/election-night-ap.json',link:'https://apnews.com/',linkLabel:'Open AP reporting ↗',description:'AP election calls and vote totals require access to the AP Elections API. This view will populate only when an authorized results file is published to this site.'},
 nyt:{name:'The New York Times',short:'NYT',file:'/election-night-nyt.json',link:'https://www.nytimes.com/section/politics',linkLabel:'Open NYT coverage ↗',description:'New York Times election-night reporting is a separate source. This tab does not copy or scrape NYT results; an authorized data feed must be configured to display its calls here.'}
};
const $=id=>document.getElementById(id);
let source='ap', selected='TX', lastFetchAt=null, busy=false, mapSvg=null;
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
     votes:Number.isFinite(Number(c?.votes))&&Number(c.votes)>=0?Math.floor(Number(c.votes)):null,
     pct:Number.isFinite(Number(c?.pct))?Math.max(0,Math.min(100,Number(c.pct))):null
   })):[];
   const reported=Number(row.pct_reporting);
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
 $('map-subtitle').textContent=healthy?'Confirmed source calls only':'No unverified calls shown';
 $('source-title').textContent=config.name.toUpperCase()+' COVERAGE';
 $('source-description').textContent=config.description;
 $('source-link').href=config.link;
 $('source-link').textContent=config.linkLabel;
 const called=[...races[source].values()].filter(x=>x.called).length;
 if(healthy)setMessage('Displaying '+called+' officially called races from the configured '+config.short+' feed. Counts refresh every 60 seconds while this page is open.');
 else if(preElection())setMessage('The November 3, 2026 general election has not taken place. No election-night race calls are available yet. A licensed '+config.short+' data feed has not been connected.');
 else if(!feed||feed.status==='awaiting-license')setMessage('No authorized '+config.short+' results feed is connected. Visit the source coverage link for independently published results; this map will not manufacture calls.');
 else if(isActive&&!fresh)setMessage(config.short+' result data is outdated. The dashboard shows only the last recorded calls and labels the feed as stale.');
 else setMessage('Waiting for results from the authorized '+config.short+' source feed.');
}
function countCalls(){
 const data=activeRaces(),called=[...data.values()].filter(x=>x.called);
 $('count-d').textContent=called.filter(x=>x.party==='D').length;
 $('count-r').textContent=called.filter(x=>x.party==='R').length;
 $('count-i').textContent=called.filter(x=>x.party==='I').length;
 $('count-u').textContent=STATE_CODES.length-called.length;
}
function renderMap(){
 const data=activeRaces();
 if(mapSvg){
   for(const path of mapSvg.querySelectorAll('.state-shape[data-state]')){
     const ab=path.dataset.state?.toUpperCase();
     const row=data.get(ab);
     if(row?.called)path.setAttribute('data-called',row.party);
     else path.removeAttribute('data-called');
   }
   for(const label of mapSvg.querySelectorAll('[data-label]')){
     const ab=label.getAttribute('data-label')?.toUpperCase();
     label.classList.toggle('night-called',!!data.get(ab)?.called);
   }
 }else{
   for(const btn of $('fallback-map').querySelectorAll('button[data-state]')){
     const row=data.get(btn.dataset.state);
     if(row?.called)btn.dataset.called=row.party;
     else btn.removeAttribute('data-called');
   }
 }
}
function fmtVotes(n){return Number.isFinite(n)?Math.floor(n).toLocaleString():'—';}
function renderDetails(){
 const row=activeRaces().get(selected);
 $('state-name').textContent=STATE_NAMES[selected]||selected;
 $('race-select').value=selected;
 $('call-label').textContent=row?.called?('CALLED '+(row.party==='D'?'DEMOCRATIC':row.party==='R'?'REPUBLICAN':'OTHER')):'NOT CALLED';
 $('call-label').style.borderColor=row?.party==='D'?'#5d9bf0':row?.party==='R'?'#fa7286':'#56728f';
 if(!row){
  $('race-description').textContent='No certified or verified election-night vote report has been received from this source for '+STATE_NAMES[selected]+'.';
  $('race-votes').textContent='Polls and forecasts are not election results.';
  return;
 }
 $('race-description').textContent=row.called
  ?(row.winner?row.winner+' was called by '+SOURCES[source].name+'.':SOURCES[source].name+' has called this race for the '+(row.party==='D'?'Democratic':row.party==='R'?'Republican':'Independent / Other')+' candidate.')
  :'Votes may be reported, but this source has not called the race.';
 const parts=[];
 if(row.pct_reporting!==null)parts.push(row.pct_reporting.toFixed(1)+'% of precincts reporting');
 if(row.candidates.length)parts.push(row.candidates.map(c=>c.name+': '+fmtVotes(c.votes)+(c.pct!==null?' ('+c.pct.toFixed(1)+'%)':'')).join(' · '));
 $('race-votes').textContent=parts.join(' · ')||'No vote totals reported.';
}
function render(){
 updateStatus();countCalls();renderMap();renderDetails();
}
function chooseSource(key){
 if(!SOURCES[key])return;
 source=key;
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
}
async function refresh(){
 if(busy)return;
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
 }
}
function setupMapFromExistingSenateSVG(){
 // Reuse the actual US map from the existing website; no third-party map tiles.
 // The source runs inside a separate same-origin frame, which is removed
 // after its SVG is cloned. If unavailable, a labeled state tile map remains.
 const frame=document.createElement('iframe');
 frame.setAttribute('aria-hidden','true');frame.tabIndex=-1;
 frame.title='Hidden source for US state geometry';
 frame.src='/?election-night-map-source=1';
 frame.style.cssText='position:absolute;left:-10000px;top:0;width:1100px;height:750px;border:0;opacity:0;pointer-events:none';
 document.body.appendChild(frame);
 let tries=0,done=false;
 const retry=setInterval(()=>{
  if(done)return;
  tries++;
  try{
   const doc=frame.contentDocument;
   const svg=[...(doc?.querySelectorAll('#page-senate .map-wrap svg')||[])].find(s=>s.querySelectorAll('.state-shape[data-state]').length>=30);
   if(svg){
    const copy=svg.cloneNode(true);
    copy.removeAttribute('style');copy.setAttribute('aria-label','2026 Senate states by official calls');
    copy.removeAttribute('width');copy.removeAttribute('height');
    for(const shape of copy.querySelectorAll('.state-shape')){
      shape.style.removeProperty('fill');shape.removeAttribute('fill');
      shape.removeAttribute('data-called');
    }
    for(const label of copy.querySelectorAll('[data-label]')){
      label.removeAttribute('style');label.classList.remove('active-label','light-text','night-called');
    }
    const slot=$('map-slot');
    slot.replaceChildren(copy);
    mapSvg=copy;
    copy.addEventListener('click',e=>{
      const path=e.target.closest('.state-shape[data-state]');
      if(!path||!STATE_NAMES[path.dataset.state])return;
      selected=path.dataset.state;renderDetails();
    });
    copy.querySelectorAll('.state-shape[data-state]').forEach(el=>{
      el.setAttribute('tabindex','0');el.setAttribute('role','button');
      el.setAttribute('aria-label','Show '+(STATE_NAMES[el.dataset.state]||el.dataset.state)+' election results');
      el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selected=el.dataset.state;renderDetails();}});
    });
    done=true;clearInterval(retry);frame.remove();renderMap();
   }
  }catch(e){}
  if(tries>=48){done=true;clearInterval(retry);frame.remove();}
 },350);
}
function init(){
 buildStates();
 $('tab-ap').addEventListener('click',()=>chooseSource('ap'));
 $('tab-nyt').addEventListener('click',()=>chooseSource('nyt'));
 $('refresh').addEventListener('click',refresh);
 setupMapFromExistingSenateSVG();
 render();refresh();
 setInterval(()=>{if(!document.hidden)refresh();},60000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
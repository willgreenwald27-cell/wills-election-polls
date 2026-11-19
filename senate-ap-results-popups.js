/* AP-reported 2026 Senate results, transcribed from the AP results feed
   via the Guardian / Map the Midterms. Unofficial until certified. */
(()=>{
'use strict';
if(window.__wgAPSenatePopupsInstalled)return;
window.__wgAPSenatePopupsInstalled=true;
const RESULTS={"AL":{"rows":[{"name":"Barry Moore","party":"Republican","votes":917338,"pct":54.7,"winner":true},{"name":"Everett Wess","party":"Democratic","votes":759321,"pct":45.3,"winner":false}],"asOf":"November 10, 2026 at 4:59 PM ET, with about 99% of the expected vote counted","source":"https://mapthemidterms.com/results/2026/al-senate/"},"AK":{"rows":[{"name":"Mary Peltola","party":"Democratic","votes":144302,"pct":50.1,"winner":true},{"name":"Dan Sullivan","party":"Republican","votes":131844,"pct":45.8,"winner":false},{"name":"Gerald Heikes","party":"Republican","votes":6105,"pct":2.1,"winner":false},{"name":"Daniel Sullivan","party":"UDC","votes":4760,"pct":1.7,"winner":false},{"name":"Total Write-ins","party":"Other","votes":885,"pct":0.3,"winner":false}],"asOf":"November 17, 2026 at 10:29 PM ET, with about 99% of the expected vote counted","source":"https://mapthemidterms.com/results/2026/ak-senate/"},"AR":{"rows":[{"name":"Tom Cotton","party":"Republican","votes":480802,"pct":54.3,"winner":true},{"name":"Hallie Shoffner","party":"Democratic","votes":375831,"pct":42.4,"winner":false},{"name":"Jeff Wadlin","party":"Libertarian","votes":29488,"pct":3.3,"winner":false}],"asOf":"November 9, 2026 at 1:37 PM ET, with about 99% of the expected vote counted","source":"https://mapthemidterms.com/results/2026/ar-senate/"},"CO":{"rows":[{"name":"John Hickenlooper","party":"Democratic","votes":1629507,"pct":60.5,"winner":true},{"name":"Mark Baisley","party":"Republican","votes":942089,"pct":35,"winner":false},{"name":"Bob Chew","party":"Forward","votes":70794,"pct":2.6,"winner":false},{"name":"Blake Huber","party":"Libertarian","votes":33136,"pct":1.2,"winner":false},{"name":"Adam Withrow","party":"Uty","votes":13717,"pct":0.5,"winner":false},{"name":"Christopher Baum","party":"AVP","votes":4268,"pct":0.2,"winner":false}],"asOf":"November 13, 2026 at 6:52 PM ET, with about 99% of the expected vote counted","source":"https://mapthemidterms.com/results/2026/co-senate/"},"DE":{"rows":[{"name":"Chris Coons","party":"Democratic","votes":240587,"pct":63.6,"winner":true},{"name":"Michael Katz","party":"Republican","votes":137837,"pct":36.4,"winner":false},{"name":"Total Write-ins","party":"Other","votes":0,"pct":0,"winner":false}],"asOf":"November 10, 2026 at 4:54 PM ET, with about 99% of the expected vote counted","source":"https://mapthemidterms.com/results/2026/de-senate/"},"FL":{"rows":[{"name":"Ashley Moody","party":"Republican","votes":4211455,"pct":50.9,"winner":true},{"name":"Angie Nixon","party":"Democratic","votes":3974149,"pct":48,"winner":false},{"name":"Neil Gillespie","party":"No party affiliation","votes":94665,"pct":1.1,"winner":false}],"asOf":"November 16, 2026 at 3:37 PM ET, with about 99% of the expected vote counted","source":"https://mapthemidterms.com/results/2026/fl-senate-special/"},"GA":{"rows":[{"name":"Jon Ossoff","party":"Democratic","votes":2468986,"pct":59,"winner":true},{"name":"Mike Collins","party":"Republican","votes":1713656,"pct":41,"winner":false},{"name":"Total Write-ins","party":"Other","votes":0,"pct":0,"winner":false}],"asOf":"November 10, 2026 at 3:17 PM ET, with about 99% of the expected vote counted","source":"https://mapthemidterms.com/results/2026/ga-senate/"},"ID":{"rows":[{"name":"Jim Risch","party":"Republican","votes":402983,"pct":56.5,"winner":true},{"name":"Todd Achilles","party":"Independent","votes":239422,"pct":33.6,"winner":false},{"name":"Natalie Fleming","party":"Independent","votes":50134,"pct":7,"winner":false},{"name":"Matt Loesby","party":"Libertarian","votes":20742,"pct":2.9,"winner":false}],"asOf":"November 11, 2026 at 3:03 PM ET, with about 99% of the expected vote counted","source":"https://mapthemidterms.com/results/2026/id-senate/"},"IL":{"rows":[{"name":"Juliana Stratton","party":"Democratic","votes":2619400,"pct":62.1,"winner":true},{"name":"Don Tracy","party":"Republican","votes":1533541,"pct":36.3,"winner":false},{"name":"Whitfield Harrington","party":"ACR","votes":67319,"pct":1.6,"winner":false}],"asOf":"November 18, 2026 at 10:47 AM ET, with about 99% of the expected vote counted","source":"https://mapthemidterms.com/results/2026/il-senate/"},"IA":{"rows":[{"name":"Josh Turek","party":"Democratic","votes":688746,"pct":50.6,"winner":true},{"name":"Ashley Hinson","party":"Republican","votes":631482,"pct":46.4,"winner":false},{"name":"Thomas Laehn","party":"Libertarian","votes":42109,"pct":3.1,"winner":false}],"asOf":"November 16, 2026 at 9:57 AM ET, with about 99% of the expected vote counted","source":"https://mapthemidterms.com/results/2026/ia-senate/"},"KS":{"rows":[{"name":"Adam Hamilton","party":"Democratic","votes":571573,"pct":51.2,"winner":true},{"name":"Roger Marshall","party":"Republican","votes":511360,"pct":45.8,"winner":false},{"name":"David Graham","party":"Libertarian","votes":33848,"pct":3,"winner":false}],"asOf":"November 17, 2026 at 6:35 PM ET, with about 99% of the expected vote counted","source":"https://mapthemidterms.com/results/2026/ks-senate/"},"KY":{"rows":[{"name":"Andy Barr","party":"Republican","votes":784869,"pct":55,"winner":true},{"name":"Charles Booker","party":"Democratic","votes":612357,"pct":42.9,"winner":false},{"name":"Christopher Campbell","party":"KYP","votes":29892,"pct":2.1,"winner":false}],"asOf":"November 10, 2026 at 2:10 PM ET, with about 99% of the expected vote counted","source":"https://mapthemidterms.com/results/2026/ky-senate/"},"LA":{"rows":[{"name":"Julia Letlow","party":"Republican","votes":746476,"pct":50.9,"winner":true},{"name":"Jamie Davis","party":"Democratic","votes":720521,"pct":49.1,"winner":false}],"asOf":"November 14, 2026 at 6:02 AM ET, with about 99% of the expected vote counted","source":"https://mapthemidterms.com/results/2026/la-senate/"},"ME":{"rows":[{"name":"Troy Jackson","party":"Democratic","votes":376955,"pct":53.1,"winner":true},{"name":"Susan Collins","party":"Republican","votes":332918,"pct":46.9,"winner":false},{"name":"Brent Andrews (write-in)","party":"Unaffiliated","votes":219,"pct":0,"winner":false},{"name":"Ashley Webb (write-in)","party":"Democratic","votes":82,"pct":0,"winner":false},{"name":"Gina Oswald (write-in)","party":"Independent","votes":68,"pct":0,"winner":false},{"name":"Sigrid Olson (write-in)","party":"Democratic","votes":49,"pct":0,"winner":false},{"name":"Michael Turcotte (write-in)","party":"Unr","votes":43,"pct":0,"winner":false},{"name":"Joseph Steinberger (write-in)","party":"Other","votes":27,"pct":0,"winner":false}],"asOf":"November 13, 2026 at 12:53 PM ET, with about 97% of the expected vote counted","source":"https://mapthemidterms.com/results/2026/me-senate/"},"MA":{"rows":[{"name":"Edward Markey","party":"Democratic","votes":1654264,"pct":63.4,"winner":true},{"name":"John Deaton","party":"Republican","votes":838220,"pct":32.1,"winner":false},{"name":"Shiva Ayyadurai","party":"Independent","votes":59939,"pct":2.3,"winner":false},{"name":"Joe Tache","party":"SLP","votes":56679,"pct":2.2,"winner":false}],"asOf":"November 17, 2026 at 9:33 AM ET, with about 99% of the expected vote counted","source":"https://mapthemidterms.com/results/2026/ma-senate/"},"MI":{"rows":[{"name":"Abdul El-Sayed","party":"Democratic","votes":2520895,"pct":52.5,"winner":true},{"name":"Mike Rogers","party":"Republican","votes":2181111,"pct":45.5,"winner":false},{"name":"Lydia Christensen","party":"Libertarian","votes":49707,"pct":1,"winner":false},{"name":"Tim Long","party":"UST","votes":26550,"pct":0.6,"winner":false},{"name":"Douglas Marsh","party":"Green","votes":12564,"pct":0.3,"winner":false},{"name":"Walter Kristy","party":"NLP","votes":7262,"pct":0.2,"winner":false}],"asOf":"November 16, 2026 at 12:59 PM ET, with about 99% of the expected vote counted","source":"https://mapthemidterms.com/results/2026/mi-senate/"},"MN":{"rows":[{"name":"Peggy Flanagan","party":"Democratic","votes":1520871,"pct":53.7,"winner":true},{"name":"Michele Tafoya","party":"Republican","votes":1233467,"pct":43.6,"winner":false},{"name":"Marisa Simonetti","party":"Independent","votes":41574,"pct":1.5,"winner":false},{"name":"Rebecca Whiting","party":"Libertarian","votes":32493,"pct":1.1,"winner":false},{"name":"Total Write-ins","party":"Other","votes":3381,"pct":0.1,"winner":false}],"asOf":"November 5, 2026 at 7:39 PM ET, with about 99% of the expected vote counted","source":"https://mapthemidterms.com/results/2026/mn-senate/"},"MS":{"rows":[{"name":"Scott Colom","party":"Democratic","votes":480153,"pct":49.4,"winner":true},{"name":"Cindy Hyde-Smith","party":"Republican","votes":472122,"pct":48.5,"winner":false},{"name":"Ty Pinkins","party":"Independent","votes":20469,"pct":2.1,"winner":false}],"asOf":"November 17, 2026 at 12:41 PM ET, with about 99% of the expected vote counted","source":"https://mapthemidterms.com/results/2026/ms-senate/"},"MT":{"rows":[{"name":"Kurt Alme","party":"Republican","votes":235549,"pct":48.2,"winner":true},{"name":"Seth Bodnar","party":"Independent","votes":184551,"pct":37.7,"winner":false},{"name":"Alani Bankhead","party":"Democratic","votes":59950,"pct":12.3,"winner":false},{"name":"Kyle Austin","party":"Libertarian","votes":9013,"pct":1.8,"winner":false}],"asOf":"November 17, 2026 at 7:51 PM ET, with about 99% of the expected vote counted","source":"https://mapthemidterms.com/results/2026/mt-senate/"},"NE":{"rows":[{"name":"Pete Ricketts","party":"Republican","votes":382171,"pct":49.8,"winner":true},{"name":"Dan Osborn","party":"Nonpartisan","votes":338509,"pct":44.2,"winner":false},{"name":"Robin Richards","party":"NWk","votes":20027,"pct":2.6,"winner":false},{"name":"Mike Marvin","party":"LMN","votes":16727,"pct":2.2,"winner":false},{"name":"Chuck Conboy","party":"AFi","votes":9267,"pct":1.2,"winner":false}],"asOf":"November 16, 2026 at 6:04 PM ET, with about 99% of the expected vote counted","source":"https://mapthemidterms.com/results/2026/ne-senate/"},"NH":{"rows":[{"name":"Chris Pappas","party":"Democratic","votes":356425,"pct":55.9,"winner":true},{"name":"John Sununu","party":"Republican","votes":268712,"pct":42.2,"winner":false},{"name":"Edmond Laplante","party":"Constitution","votes":12081,"pct":1.9,"winner":false}],"asOf":"November 12, 2026 at 3:07 PM ET, with about 99% of the expected vote counted","source":"https://mapthemidterms.com/results/2026/nh-senate/"},"NJ":{"rows":[{"name":"Cory Booker","party":"Democratic","votes":1873055,"pct":62.6,"winner":true},{"name":"Justin Murphy","party":"Republican","votes":1038440,"pct":34.7,"winner":false},{"name":"Veronica Fernandez","party":"Other","votes":50163,"pct":1.7,"winner":false},{"name":"Joanne Kuniansky","party":"Other","votes":28470,"pct":1,"winner":false}],"asOf":"November 18, 2026 at 10:56 AM ET, with about 99% of the expected vote counted","source":"https://mapthemidterms.com/results/2026/nj-senate/"},"NM":{"rows":[{"name":"Ben Lujan","party":"Democratic","votes":458756,"pct":63.3,"winner":true},{"name":"Larry Marker","party":"Republican","votes":266434,"pct":36.7,"winner":false}],"asOf":"November 11, 2026 at 11:39 AM ET, with about 98% of the expected vote counted","source":"https://mapthemidterms.com/results/2026/nm-senate/"},"NC":{"rows":[{"name":"Roy Cooper","party":"Democratic","votes":2480636,"pct":58.8,"winner":true},{"name":"Michael Whatley","party":"Republican","votes":1648858,"pct":39.1,"winner":false},{"name":"Shannon Bray","party":"Libertarian","votes":56084,"pct":1.3,"winner":false},{"name":"Michael Dublin","party":"Green","votes":36710,"pct":0.9,"winner":false}],"asOf":"November 16, 2026 at 6:20 PM ET, with about 99% of the expected vote counted","source":"https://mapthemidterms.com/results/2026/nc-senate/"},"OH":{"rows":[{"name":"Sherrod Brown","party":"Democratic","votes":2305082,"pct":50,"winner":true},{"name":"Jon Husted","party":"Republican","votes":2082828,"pct":45.2,"winner":false},{"name":"William Redpath","party":"Libertarian","votes":128594,"pct":2.8,"winner":false},{"name":"Greg Levy","party":"Independent","votes":93957,"pct":2,"winner":false}],"asOf":"November 18, 2026 at 10:52 AM ET, with about 98% of the expected vote counted","source":"https://mapthemidterms.com/results/2026/oh-senate-special/"},"OK":{"rows":[{"name":"Kevin Hern","party":"Republican","votes":639510,"pct":57.2,"winner":true},{"name":"N'Kiyla Thomas","party":"Democratic","votes":439109,"pct":39.3,"winner":false},{"name":"Curtis Stinnett","party":"Independent","votes":14622,"pct":1.3,"winner":false},{"name":"Ron Meinhardt","party":"Independent","votes":14492,"pct":1.3,"winner":false},{"name":"Sevier White","party":"Libertarian","votes":10199,"pct":0.9,"winner":false}],"asOf":"November 11, 2026 at 12:26 PM ET, with about 99% of the expected vote counted","source":"https://mapthemidterms.com/results/2026/ok-senate/"},"OR":{"rows":[{"name":"Jeff Merkley","party":"Democratic","votes":1098047,"pct":58,"winner":true},{"name":"David Smith","party":"Republican","votes":733039,"pct":38.7,"winner":false},{"name":"Chris Henry","party":"Prg","votes":41616,"pct":2.2,"winner":false},{"name":"Gary Dye","party":"Libertarian","votes":19044,"pct":1,"winner":false},{"name":"Total Write-ins","party":"Other","votes":1407,"pct":0.1,"winner":false}],"asOf":"November 10, 2026 at 3:13 PM ET, with about 94% of the expected vote counted","source":"https://mapthemidterms.com/results/2026/or-senate/"},"RI":{"rows":[{"name":"John Reed","party":"Democratic","votes":240707,"pct":66.8,"winner":true},{"name":"Raymond McKay","party":"Republican","votes":105459,"pct":29.3,"winner":false},{"name":"Michael Bahry","party":"Independent","votes":13563,"pct":3.8,"winner":false},{"name":"Total Write-ins","party":"Other","votes":695,"pct":0.2,"winner":false}],"asOf":"November 18, 2026 at 10:37 AM ET, with about 99% of the expected vote counted","source":"https://mapthemidterms.com/results/2026/ri-senate/"},"SC":{"rows":[{"name":"Annie Andrews","party":"Democratic","votes":1044008,"pct":51.1,"winner":true},{"name":"Darline Graham","party":"Republican","votes":952199,"pct":46.6,"winner":false},{"name":"Kasie Whitener","party":"Libertarian","votes":23594,"pct":1.2,"winner":false},{"name":"Mark Hackett","party":"Constitution","votes":16820,"pct":0.8,"winner":false},{"name":"Total Write-ins","party":"Other","votes":4899,"pct":0.2,"winner":false}],"asOf":"November 12, 2026 at 9:55 AM ET, with about 99% of the expected vote counted","source":"https://mapthemidterms.com/results/2026/sc-senate/"},"SD":{"rows":[{"name":"Mike Rounds","party":"Republican","votes":184589,"pct":60.5,"winner":true},{"name":"Brian Bengs","party":"Independent","votes":120513,"pct":39.5,"winner":false}],"asOf":"November 16, 2026 at 2:05 PM ET, with about 99% of the expected vote counted","source":"https://mapthemidterms.com/results/2026/sd-senate/"},"TN":{"rows":[{"name":"Bill Hagerty","party":"Republican","votes":1138457,"pct":55.1,"winner":true},{"name":"Marquita Bradshaw","party":"Democratic","votes":886974,"pct":42.9,"winner":false},{"name":"Robert Jones","party":"Independent","votes":9398,"pct":0.5,"winner":false},{"name":"Tharon Chandler","party":"Independent","votes":7689,"pct":0.4,"winner":false},{"name":"Andrew Gerena","party":"Independent","votes":5633,"pct":0.3,"winner":false},{"name":"Catherine Whitson","party":"Independent","votes":5113,"pct":0.2,"winner":false},{"name":"Jeremy Hearn","party":"Independent","votes":4937,"pct":0.2,"winner":false},{"name":"David Sutman","party":"Independent","votes":3087,"pct":0.1,"winner":false},{"name":"Yoshi Matthews","party":"Independent","votes":3026,"pct":0.1,"winner":false},{"name":"James Macon","party":"Independent","votes":2576,"pct":0.1,"winner":false}],"asOf":"November 17, 2026 at 4:09 PM ET, with about 99% of the expected vote counted","source":"https://mapthemidterms.com/results/2026/tn-senate/"},"TX":{"rows":[{"name":"James Talarico","party":"Democratic","votes":5447080,"pct":55.1,"winner":true},{"name":"Ken Paxton","party":"Republican","votes":4250704,"pct":43,"winner":false},{"name":"Ted Brown","party":"Libertarian","votes":190325,"pct":1.9,"winner":false}],"asOf":"November 16, 2026 at 10:00 AM ET, with about 99% of the expected vote counted","source":"https://mapthemidterms.com/results/2026/tx-senate/"},"VA":{"rows":[{"name":"Mark Warner","party":"Democratic","votes":2234930,"pct":61.5,"winner":true},{"name":"Bert Mizusawa","party":"Republican","votes":1391025,"pct":38.3,"winner":false},{"name":"Total Write-ins","party":"Other","votes":9716,"pct":0.3,"winner":false}],"asOf":"November 12, 2026 at 5:08 PM ET, with about 99% of the expected vote counted","source":"https://mapthemidterms.com/results/2026/va-senate/"},"WV":{"rows":[{"name":"Shelley Capito","party":"Republican","votes":266772,"pct":58.3,"winner":true},{"name":"Rachel Anderson","party":"Democratic","votes":173656,"pct":37.9,"winner":false},{"name":"S. Wilson","party":"Constitution","votes":17183,"pct":3.8,"winner":false}],"asOf":"November 10, 2026 at 3:19 PM ET, with about 99% of the expected vote counted","source":"https://mapthemidterms.com/results/2026/wv-senate/"},"WY":{"rows":[{"name":"Harriet Hageman","party":"Republican","votes":122157,"pct":65.2,"winner":true},{"name":"James Byrd","party":"Democratic","votes":65097,"pct":34.8,"winner":false},{"name":"Total Write-ins","party":"Other","votes":0,"pct":0,"winner":false}],"asOf":"November 10, 2026 at 4:00 PM ET, with about 99% of the expected vote counted","source":"https://mapthemidterms.com/results/2026/wy-senate/"}};
const CORRECT=new Set('AK AL AR CO DE FL GA ID IL KS KY LA MA MI MN MT NE NH NJ NM NC OH OK OR RI SD TN TX VA WV WY'.split(' '));
const WRONG=new Set('IA ME MS SC'.split(' '));
const FORECAST={
 AK:'Peltola +1.7 points',GA:'Ossoff +7.6 points',NC:'Cooper +8.9 points',
 OH:'Brown +0.6 points',NH:'Pappas +5.6 points',ME:'Collins +1.3 points',
 TX:'Talarico +0.9 points',IA:'Hinson +1.9 points',KS:'Hamilton +0.3 points',
 NE:'Ricketts +2.8 points',MI:'El-Sayed +1.6 points',SC:'Graham +4.6 points'
};
const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const pct=value=>Number(value).toFixed(1)+'%';
const votes=value=>Number(value).toLocaleString('en-US');
const sdata=ab=>{try{return typeof stateData!=='undefined'?stateData[ab]:window.stateData?.[ab]}catch(_){return null}};
const lead=r=>r.rows.find(row=>row.winner)||r.rows[0];
const runner=r=>r.rows.filter(row=>!row.winner).sort((a,b)=>b.votes-a.votes)[0];
const margin=r=>{
 const first=lead(r),second=runner(r),total=r.rows.reduce((acc,row)=>acc+row.votes,0);
 return first&&second&&total?((first.votes-second.votes)*100/total).toFixed(1):'—';
};
const status=ab=>CORRECT.has(ab)?'Correct prediction':WRONG.has(ab)?'Incorrect prediction':'Not scored';
const statusClass=ab=>CORRECT.has(ab)?'correct':WRONG.has(ab)?'incorrect':'pending';
const partyClass=party=>/democrat/i.test(party)?'dem':/republican/i.test(party)?'rep':'other';
const prediction=ab=>{
 if(FORECAST[ab])return FORECAST[ab];
 const s=sdata(ab),p=String(s?.prediction||'').trim();
 if(p&&!/no written prediction|uncalled/i.test(p))return p;
 const party=String(s?.predictionParty||'').trim();
 const rating=String(s?.rating||'').replace(/-/g,' ');
 return party&&party.toLowerCase()!=='uncalled'?party+' · '+rating:'Forecast archived';
};
function rowHTML(row,compact){
 return '<div class="wg-ap-row '+partyClass(row.party)+'">'+
  '<div class="wg-ap-person"><strong>'+esc(row.name)+(row.winner?' <span class="wg-ap-winner">✓ Winner</span>':'')+'</strong>'+
  '<small>'+esc(row.party)+(compact?'':' · '+votes(row.votes)+' votes')+'</small></div>'+
  '<b class="wg-ap-percent">'+pct(row.pct)+'</b></div>';
}
function hoverHTML(ab){
 const r=RESULTS[ab];if(!r)return '';
 const first=lead(r),second=runner(r),rest=r.rows.filter(row=>row!==first&&row!==second);
 const sum=rest.reduce((acc,row)=>acc+row.votes,0),total=r.rows.reduce((acc,row)=>acc+row.votes,0);
 const more=rest.length?'<div class="wg-ap-other">'+rest.length+' other candidate'+(rest.length===1?'':'s')+
  ' · '+(total?(sum*100/total).toFixed(1):'0.0')+'% combined</div>':'';
 return '<div class="wg-ap-top"><div class="map-hover-state">'+esc(sdata(ab)?.name||ab)+'</div>'+
  '<span class="wg-ap-flag '+statusClass(ab)+'">'+status(ab)+'</span></div>'+
  '<div class="wg-ap-caption">AP-reported 2026 Senate results</div>'+
  rowHTML(first,true)+rowHTML(second,true)+more+
  '<div class="wg-ap-margin">'+esc(first.name)+' wins by '+margin(r)+' points</div>'+
  '<div class="wg-ap-forecast"><span>Original forecast</span> '+esc(prediction(ab))+'</div>'+
  '<div class="wg-ap-updated">AP results · '+esc(r.asOf.replace(/, with about.*/,'').replace(/ at /,', '))+' · unofficial</div>';
}
function drawerHTML(ab){
 const r=RESULTS[ab];if(!r)return '';
 const first=lead(r);
 return '<section class="wg-ap-drawer" aria-label="2026 Senate election results">'+
  '<div class="wg-ap-drawer-top"><div><span class="wg-ap-kicker">2026 U.S. SENATE · ACTUAL RESULTS</span>'+
  '<h3>'+esc(first.name)+' <span>won</span></h3><p>'+esc(first.party)+' · AP race call</p></div>'+
  '<span class="wg-ap-flag '+statusClass(ab)+'">'+status(ab)+'</span></div>'+
  '<div class="wg-ap-drawer-margin">Winner margin <b>'+margin(r)+' percentage points</b></div>'+
  '<h4>Candidate vote totals</h4>'+r.rows.map(row=>rowHTML(row,false)).join('')+
  '<div class="wg-ap-archive"><strong>Your original forecast</strong><p>'+esc(prediction(ab))+'</p>'+
  '<small>'+esc(status(ab))+' · Forecast preserved for comparison</small></div>'+
  '<p class="wg-ap-caveat">These are AP-reported election returns, not poll averages. Vote counts can change before final certification. '+
  esc(r.asOf)+'.</p>'+
  '<p class="wg-ap-source">Source: <a href="'+esc(r.source)+'" target="_blank" rel="noopener noreferrer">'+
  'AP results via Map the Midterms (Guardian data)</a></p></section>';
}
let activeDrawer='';
function applyDrawer(ab){
 if(!RESULTS[ab])return;
 const drawer=document.getElementById('stateDrawer')||document.querySelector('#page-senate .drawer');
 const body=drawer?.querySelector('#drawerBody')||document.getElementById('drawerBody');
 if(!body)return;
 body.innerHTML=drawerHTML(ab);
 body.dataset.wgApResults=ab;
 const rating=document.getElementById('drawerRating');
 if(rating)rating.textContent='AP RESULTS · '+status(ab);
}
function installWrappers(){
 if(typeof window.hoverCardHTML==='function'&&!window.hoverCardHTML.__wgAPResults){
  const original=window.hoverCardHTML;
  const wrapped=function(ab){return RESULTS[ab]?hoverHTML(ab):original.apply(this,arguments)};
  wrapped.__wgAPResults=true;
  window.hoverCardHTML=wrapped;
 }
 if(typeof window.renderDrawer==='function'&&!window.renderDrawer.__wgAPResults){
  const original=window.renderDrawer;
  const wrapped=function(ab){
   const output=original.apply(this,arguments);
   if(RESULTS[ab]){activeDrawer=ab;applyDrawer(ab)}
   return output;
  };
  wrapped.__wgAPResults=true;
  window.renderDrawer=wrapped;
 }
}
const styles=document.createElement('link');
styles.rel='stylesheet';styles.href='/senate-ap-results-popups.css?v=20261119-1';
document.head.appendChild(styles);
function init(){
 installWrappers();
 const drawer=document.getElementById('stateDrawer');
 if(drawer&&!drawer.__wgApDrawerObserver){
  const observer=new MutationObserver(()=>{
   if(activeDrawer&&drawer.classList.contains('show')){
    const body=drawer.querySelector('#drawerBody');
    if(body&&(!body.querySelector('.wg-ap-drawer')||body.dataset.wgApResults!==activeDrawer))applyDrawer(activeDrawer);
   }
  });
  observer.observe(drawer,{childList:true,subtree:true});
  drawer.__wgApDrawerObserver=observer;
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
window.addEventListener('pageshow',init);
document.addEventListener('click',event=>{
 if(event.target?.closest?.('#page-senate .map-wrap [data-state]'))queueMicrotask(init);
},true);
})();
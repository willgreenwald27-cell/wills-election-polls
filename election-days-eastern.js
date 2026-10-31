(()=>{'use strict';
const target=Date.UTC(2026,10,3);
function easternDays(){const p=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(new Date()).map(x=>[x.type,x.value]));return Math.max(0,Math.round((target-Date.UTC(+p.year,+p.month-1,+p.day))/86400000));}
function update(){
 const days=String(easternDays());
 const leaves=[...document.body.querySelectorAll('*')].filter(e=>e.children.length===0&&!e.closest('script,style,noscript,svg'));
 const label=/\b(days?\s+(until|till|to|before)\s+(the\s+)?(2026\s+)?(election|november\s*3)|days?\s+remaining|election\s+countdown)\b/i;
 for(const el of leaves){
  const t=(el.textContent||'').trim();
  if(!t||t.length>110)continue;
  if(/\b\d+\s+days?\s+(until|till|to|before)\s+(the\s+)?(2026\s+)?election/i.test(t)){el.textContent=t.replace(/\b\d+(?=\s+days?)/,days);continue;}
  if(!label.test(t))continue;
  // Locate the counter within the nearest small countdown component, not across the page.
  for(let parent=el.parentElement,depth=0;parent&&depth<4;parent=parent.parentElement,depth++){
   const nums=[...parent.querySelectorAll('*')].filter(n=>n.children.length===0&&/^\d{1,3}$/.test((n.textContent||'').trim())&&!n.closest('script,style'));
   if(nums.length===1){if(nums[0].textContent.trim()!==days)nums[0].textContent=days;break;}
   if(nums.length>1)break;
  }
 }
 // Common standalone counters use explicit IDs/classes.
 for(const el of document.querySelectorAll('[id*="countdown" i],[class*="countdown" i],[id*="days-left" i],[class*="days-left" i],[id*="days-until" i],[class*="days-until" i]')){
  if(el.children.length===0&&/^\d{1,3}$/.test(el.textContent.trim())&&el.textContent.trim()!==days)el.textContent=days;
 }
}
let lastDays=easternDays();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',update,{once:true});else update();
setInterval(()=>{const d=easternDays();if(d!==lastDays){lastDays=d;update();}},30000);
})();
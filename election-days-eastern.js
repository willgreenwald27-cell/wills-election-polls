(()=>{'use strict';
const target=Date.UTC(2026,10,3);
const easternToday=()=>{const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(new Date());const v=Object.fromEntries(parts.map(p=>[p.type,p.value]));return Date.UTC(+v.year,+v.month-1,+v.day)};
function update(){
 const days=Math.max(0,Math.round((target-easternToday())/86400000));
 const walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 let node;while((node=walk.nextNode())){
  const t=node.nodeValue.trim();if(!t||node.parentElement?.closest('script,style,noscript'))continue;
  // Handle both one-line counters and a separate number above an election label.
  if(/^\d+\s+days?\s+(?:until|till|to|before)\s+(?:the\s+)?(?:2026\s+)?election(?:\s+day)?!?$/i.test(t)){
   node.nodeValue=node.nodeValue.replace(/^\s*\d+/,String(days));continue;
  }
  if(/^(?:days?\s+(?:until|till|to|before)\s+)?(?:the\s+)?(?:2026\s+)?election\s+day$/i.test(t)){
   const el=node.parentElement;const parent=el?.parentElement;if(!parent)continue;
   const candidates=[...parent.querySelectorAll('*')].filter(e=>e.children.length===0&&/^\d+$/.test(e.textContent.trim()));
   if(candidates.length===1)candidates[0].textContent=String(days);
  }
 }
}
let busy=false;const run=()=>{if(busy)return;busy=true;try{update()}finally{busy=false}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
setInterval(run,60000);
})();
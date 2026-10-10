(()=>{
  'use strict';
  // Keep the existing live metric panel in the correct number of columns.
  // This layout helper does not touch poll data, counts, or navigation.
  const root=document.getElementById('page-home');
  if(!root)return;
  let watched=null,observer=null,scheduled=false;
  const resize=window.matchMedia('(max-width: 860px)');
  function arrange(){
    scheduled=false;
    if(!root.isConnected)return;
    const metrics=root.querySelector('.reference-metrics');
    if(!metrics)return;
    if(metrics!==watched){
      if(observer)observer.disconnect();
      watched=metrics;
      observer=new MutationObserver(queue);
      observer.observe(metrics,{attributes:true,attributeFilter:['style'],childList:true});
    }
    const count=Math.max(1,metrics.children.length);
    const cols=resize.matches
      ? 'repeat(2, minmax(0, 1fr))'
      : 'repeat('+count+', minmax(0, 1fr))';
    if(metrics.style.getPropertyValue('grid-template-columns')!==cols ||
        metrics.style.getPropertyPriority('grid-template-columns')!=='important'){
      metrics.style.setProperty('grid-template-columns',cols,'important');
    }
  }
  function queue(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(arrange);
  }
  queue();
  [100,300,800,1800,3500].forEach(t=>setTimeout(queue,t));
  window.addEventListener('resize',queue,{passive:true});
  window.addEventListener('pageshow',queue);
  // Re-bind if the site's existing dashboard regenerates its metrics strip.
  new MutationObserver(()=>{
    if(root.querySelector('.reference-metrics')!==watched)queue();
  }).observe(root,{childList:true,subtree:true});
})();
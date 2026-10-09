(()=>{
  'use strict';

  // CNN-inspired, bold, condensed lettering for state abbreviations only.
  // Leave other Senate text, map fill colors, and interactive popups untouched.
  const stateCodes=new Set(
    'AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC'.split(' ')
  );
  const className='wg-senate-map-abbreviation';
  const fontId='wg-senate-map-anton-font';
  const styleId='wg-senate-map-abbreviation-style';
  let queued=false;

  function installStyle(){
    if(!document.getElementById(fontId)){
      const link=document.createElement('link');
      link.id=fontId;
      link.rel='stylesheet';
      link.href='https://fonts.googleapis.com/css2?family=Anton&display=swap';
      document.head.appendChild(link);
    }
    if(!document.getElementById(styleId)){
      const style=document.createElement('style');
      style.id=styleId;
      style.textContent=`
        #page-senate svg text.${className}{
          font-family:'Anton',Impact,'Arial Narrow',sans-serif!important;
          font-weight:400!important;
          letter-spacing:0.02em!important;
          font-kerning:normal!important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  function apply(){
    const page=document.getElementById('page-senate');
    if(!page)return;
    for(const label of page.querySelectorAll('svg text')){
      const code=(label.textContent||'').trim();
      if(stateCodes.has(code)&&!label.classList.contains(className)){
        label.classList.add(className);
      }
    }
  }

  function schedule(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;apply();});
  }

  function start(){
    installStyle();
    apply();
    new MutationObserver(schedule).observe(document.body,{
      childList:true,subtree:true,characterData:true
    });
    window.addEventListener('pageshow',apply);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
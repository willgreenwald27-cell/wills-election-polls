(()=>{
  'use strict';

  const STATE_NAMES={
    AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',CO:'Colorado',CT:'Connecticut',DE:'Delaware',FL:'Florida',GA:'Georgia',
    HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',
    MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',
    NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',
    SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',DC:'District of Columbia'
  };

  let selected='ALL';
  let nativeRender=null;
  let rendering=false;
  let wrapperInstalled=false;

  function pollArray(){
    try{if(typeof polls!=='undefined'&&Array.isArray(polls))return polls;}catch(e){}
    try{if(Array.isArray(window.polls))return window.polls;}catch(e){}
    return null;
  }

  function stateList(){
    const arr=pollArray()||[];
    const polled=[...new Set(arr.map(p=>String(p?.state||'').trim().toUpperCase()).filter(Boolean))];
    const isSwing=ab=>{
      try{
        const s=(typeof stateData!=='undefined'&&stateData?.[ab])?stateData[ab]:window.stateData?.[ab];
        const r=String(s?.rating||'').trim().toLowerCase();
        return r==='tossup'||r==='toss-up'||r.startsWith('tilt-')||r.startsWith('lean-');
      }catch(e){return false;}
    };
    return polled.filter(isSwing)
      .sort((a,b)=>(STATE_NAMES[a]||a).localeCompare(STATE_NAMES[b]||b));
  }

  function callNative(){
    if(!nativeRender||rendering)return;
    const arr=pollArray();
    if(!arr||selected==='ALL'){
      rendering=true;
      try{nativeRender();}finally{rendering=false;}
      return;
    }

    const snapshot=arr.slice();
    const filtered=snapshot.filter(p=>String(p?.state||'').trim().toUpperCase()===selected);
    rendering=true;
    try{
      arr.splice(0,arr.length,...filtered);
      nativeRender();
    }finally{
      arr.splice(0,arr.length,...snapshot);
      rendering=false;
    }
  }

  function syncStatus(){
    const status=document.getElementById('newPollsStateFilterStatus');
    if(!status)return;
    const arr=pollArray()||[];
    const count=selected==='ALL'?arr.length:arr.filter(p=>String(p?.state||'').trim().toUpperCase()===selected).length;
    status.textContent=selected==='ALL'
      ? `Showing all states · ${count} poll${count===1?'':'s'}`
      : `Showing ${STATE_NAMES[selected]||selected} · ${count} poll${count===1?'':'s'}`;
  }

  function addStyle(){
    if(document.getElementById('newPollsStateFilterStyle'))return;
    const s=document.createElement('style');
    s.id='newPollsStateFilterStyle';
    s.textContent=`
      #page-polls #newPollsStateFilterBar{display:flex;align-items:end;justify-content:space-between;gap:16px;flex-wrap:wrap;margin:16px 0 22px;padding:14px 16px;border:1px solid #dfe5ed;border-radius:14px;background:#f8fafc;box-shadow:0 4px 14px rgba(20,34,53,.05)}
      #page-polls #newPollsStateFilterBar .poll-filter-copy{display:flex;flex-direction:column;gap:3px;min-width:190px}
      #page-polls #newPollsStateFilterBar label{font:800 11px/1.2 Inter,ui-sans-serif,system-ui,sans-serif;letter-spacing:.9px;text-transform:uppercase;color:#516176}
      #page-polls #newPollsStateFilterStatus{font:700 12px/1.35 Inter,ui-sans-serif,system-ui,sans-serif;color:#7a8798}
      #page-polls #newPollsStateSelect{min-width:220px;height:42px;padding:0 40px 0 13px;border:1px solid #cfd7e2;border-radius:10px;background:#fff;color:#17263d;font:800 14px/1 Inter,ui-sans-serif,system-ui,sans-serif;cursor:pointer}
      #page-polls #newPollsStateSelect:focus{outline:2px solid #8fb7e8;outline-offset:2px}
      @media(max-width:640px){
        #page-polls #newPollsStateFilterBar{align-items:stretch;gap:10px;padding:13px}
        #page-polls #newPollsStateSelect{width:100%;min-width:0}
      }
    `;
    document.head.appendChild(s);
  }

  function ensureFilter(){
    const root=document.getElementById('page-polls');
    if(!root)return;
    addStyle();

    let bar=document.getElementById('newPollsStateFilterBar');
    if(!bar){
      bar=document.createElement('div');
      bar.id='newPollsStateFilterBar';
      bar.innerHTML=`
        <div class="poll-filter-copy">
          <label for="newPollsStateSelect">Filter by state</label>
          <span id="newPollsStateFilterStatus">Showing all states</span>
        </div>
        <select id="newPollsStateSelect" aria-label="Filter new polls by state"></select>
      `;

      const heading=[...root.querySelectorAll('h1,h2,h3')].find(el=>/^New Polls$/i.test((el.textContent||'').trim()));
      const headWrap=heading?.closest?.('.page-head,.page-head-inner,.section-head,.card')||heading?.parentElement;
      if(headWrap&&headWrap.parentElement===root) headWrap.insertAdjacentElement('afterend',bar);
      else if(heading) heading.insertAdjacentElement('afterend',bar);
      else root.prepend(bar);

      bar.querySelector('select').addEventListener('change',e=>{
        selected=e.target.value||'ALL';
        callNative();
        ensureFilter();
        syncStatus();
      });
    }

    const select=bar.querySelector('#newPollsStateSelect');
    if(!select)return;
    const states=stateList();
    const wanted=['ALL',...states];
    const current=[...select.options].map(o=>o.value);
    if(JSON.stringify(current)!==JSON.stringify(wanted)){
      select.textContent='';
      const all=document.createElement('option');
      all.value='ALL'; all.textContent='All States'; select.appendChild(all);
      for(const ab of states){
        const o=document.createElement('option');
        o.value=ab; o.textContent=`${STATE_NAMES[ab]||ab} (${ab})`;
        select.appendChild(o);
      }
    }
    if(selected!=='ALL'&&!states.includes(selected))selected='ALL';
    select.value=selected;
    syncStatus();
  }

  function installWrapper(){
    if(wrapperInstalled)return;
    let fn=null;
    try{if(typeof renderPolls==='function')fn=renderPolls;}catch(e){}
    if(!fn&&typeof window.renderPolls==='function')fn=window.renderPolls;
    if(!fn)return;

    nativeRender=fn;
    const wrapped=function(){
      if(rendering)return nativeRender.apply(this,arguments);
      callNative();
      ensureFilter();
    };

    let installed=false;
    try{
      renderPolls=wrapped;
      installed=true;
    }catch(e){}
    try{
      if(window.renderPolls===fn||typeof window.renderPolls==='function')window.renderPolls=wrapped;
      installed=true;
    }catch(e){}
    wrapperInstalled=installed;
  }

  function apply(){
    installWrapper();
    ensureFilter();
  }

  apply();
  [50,150,350,800,1500,3000].forEach(ms=>setTimeout(apply,ms));
  document.addEventListener('click',()=>setTimeout(apply,0),true);
  window.addEventListener('pageshow',apply);
})();
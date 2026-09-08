(()=>{
  const ARTICLE_URL='https://thefulcrum.us/civic-engagement-education/illusion-certainty-politics-civic-engagement';
  const STATIC_TAKES={
    TX:"Talarico leads the current polling average, but I still rate Texas Tilt Republican because the raw average is only the starting point: my forecast adjusts for historical Senate polling misses and Texas's recent Republican electoral baseline. If that Democratic polling lead persists or widens across additional high-quality surveys, this race can move.",
    ME:"Jackson leads the polling average, but the historical-error adjustment is large enough for my model to give Collins a very narrow edge. That is why Maine is Tilt Republican even while the raw average currently points the other way.",
    IA:"Hinson's polling advantage and Iowa's recent Republican baseline point in the same direction, but the margin is still small enough that a normal polling miss could flip the race. I therefore keep Iowa at Tilt Republican rather than moving it into a stronger category.",
    NH:"Pappas has the better current polling position, but New Hampshire remains volatile and the available polling is still limited enough for historical error to matter. I rate it Tilt Democratic, not Lean or Likely Democratic, because the uncertainty is still substantial.",
    AK:"Peltola's polling position keeps her narrowly ahead, but Alaska's Republican baseline and small-poll environment make the race unusually sensitive to error. The forecast therefore treats her advantage as real but fragile.",
    GA:"Ossoff's polling lead is meaningful, but Georgia's recent statewide elections have been close enough that I do not treat a single-digit lead as safe. The model keeps more Republican upside in the distribution than the raw average alone would suggest.",
    NC:"Cooper's current advantage is substantial, but North Carolina's recent federal elections have consistently been close. I therefore treat the polling lead as meaningful without assuming it will translate one-for-one into the final margin.",
    OH:"Brown's polling strength is stronger than Ohio's recent Republican baseline would suggest, creating a real tension between the average and the state's recent results. That is why my forecast can still have Husted narrowly favored even when the raw polling looks better for Brown.",
    MI:"The Democratic polling lead is real, but Michigan's recent statewide margins and normal polling uncertainty keep the race competitive. I need a more durable lead across multiple high-quality polls before moving it out of the battleground tier."
  };
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const leafs=root=>[...root.querySelectorAll('*')].filter(el=>el.children.length===0);

  function ensureStyle(){
    if(document.getElementById('wills-take-style'))return;
    const s=document.createElement('style');
    s.id='wills-take-style';
    s.textContent=`
      .wills-take-card{margin-top:14px;padding:14px 15px;border:1px solid #d7dde7;border-radius:12px;background:#f7f9fc;color:#17263d}
      .wills-take-kicker{font-size:9px;font-weight:950;letter-spacing:1.35px;text-transform:uppercase;color:#66758a;margin-bottom:6px}
      .wills-take-copy{font-size:12px;line-height:1.5;font-weight:650;color:#26374f}
      .wills-take-factors{margin-top:8px;font-size:9px;line-height:1.4;font-weight:850;color:#7a8493;text-transform:uppercase;letter-spacing:.45px}
      .wills-take-method{display:inline-block;margin-top:8px;font-size:10px;font-weight:900;color:#24548f;text-decoration:none;border-bottom:1px solid #9bb5d7}
      .about-proof-link,.about-methodology-link{display:inline-flex;align-items:center;gap:6px;margin-top:9px;padding:8px 11px;border-radius:9px;border:1px solid #cfd8e5;background:#fff;color:#244f86!important;text-decoration:none!important;font-size:11px;font-weight:900}
      .about-methodology-card{margin:16px 0;padding:16px 18px;border:1px solid #d9dee7;border-radius:14px;background:#f8fafc;box-shadow:0 7px 22px rgba(20,34,53,.045)}
      .about-methodology-card strong{display:block;font-family:Georgia,serif;font-size:19px;color:#17263d;margin:3px 0 4px}
      .about-methodology-card p{margin:0;color:#66758a;font-size:12px;line-height:1.45}
      @media(max-width:760px){.wills-take-card{margin-top:12px;padding:13px}.wills-take-copy{font-size:12px}}
    `;
    document.head.appendChild(s);
  }

  function stateAbbrFromName(name){
    try{
      if(typeof stateData==='object'&&stateData){
        for(const [ab,s] of Object.entries(stateData)){
          const vals=[ab,s?.abbr,s?.name,s?.state,s?.stateName].map(norm).filter(Boolean);
          if(vals.some(v=>v.toLowerCase()===norm(name).toLowerCase()))return ab;
        }
      }
    }catch(e){}
    const map={Texas:'TX',Maine:'ME',Iowa:'IA','New Hampshire':'NH',Alaska:'AK',Georgia:'GA','North Carolina':'NC',Ohio:'OH',Michigan:'MI'};
    return map[name]||'';
  }

  function genericTake(ab){
    try{
      const s=stateData?.[ab];
      const rating=norm(s?.rating).replace(/-/g,' ');
      if(!/tilt|lean|likely/i.test(rating))return '';
      return "The polling average is the starting point, not the final forecast. I compare it with the range of historical Senate polling error and the state's recent electoral baseline, which is why my call can differ from the raw average.";
    }catch(e){return '';}
  }

  function findVisiblePanel(){
    const root=document.getElementById('page-senate');
    if(!root)return null;
    const visible=leafs(root).filter(el=>el.getClientRects().length&&/^[A-Za-z .'-]+$/.test(norm(el.textContent)));
    for(const stateEl of visible){
      const stateName=norm(stateEl.textContent);
      const ab=stateAbbrFromName(stateName);
      if(!ab)continue;
      let box=stateEl.parentElement;
      for(let depth=0;box&&box!==root&&depth<12;depth++,box=box.parentElement){
        const t=norm(box.textContent);
        if(/WILL'S (CALL|STATISTICAL ODDS)|MY PREDICTION/i.test(t)&&/(AVG POLLS|POLL AVERAGE|MY PROJECTED WINNER)/i.test(t))return {box,ab};
      }
    }
    return null;
  }

  function ensureWillsTake(){
    const found=findVisiblePanel();
    if(!found)return;
    const {box,ab}=found;
    const text=STATIC_TAKES[ab]||genericTake(ab);
    const old=box.querySelector('.wills-take-card');
    if(!text){if(old)old.remove();return;}
    if(old&&old.dataset.state===ab)return;
    if(old)old.remove();
    const card=document.createElement('section');
    card.className='wills-take-card';
    card.dataset.state=ab;
    const kicker=document.createElement('div');kicker.className='wills-take-kicker';kicker.textContent="Will's Take";
    const copy=document.createElement('div');copy.className='wills-take-copy';copy.textContent=text;
    const factors=document.createElement('div');factors.className='wills-take-factors';factors.textContent='Key factors: polling average · historical polling error · state baseline · recent trend';
    const method=document.createElement('a');method.className='wills-take-method';method.href='/methodology.html';method.target='_blank';method.rel='noopener';method.textContent='How the forecast works →';
    card.append(kicker,copy,factors,method);
    const anchor=[...box.querySelectorAll('*')].find(el=>el.children.length===0&&/^LAST UPDATED$/i.test(norm(el.textContent)));
    if(anchor){let section=anchor.parentElement;while(section&&section!==box&&section.parentElement!==box)section=section.parentElement;if(section&&section!==box)box.insertBefore(card,section);else box.appendChild(card);}else box.appendChild(card);
  }

  function enhanceAbout(){
    const root=document.getElementById('page-about');
    if(!root)return;
    if(!root.querySelector('.about-proof-link')){
      const hits=leafs(root).filter(el=>/The Fulcrum|Contributing Writer/i.test(norm(el.textContent)));
      for(const hit of hits){
        let card=hit.parentElement;
        for(let i=0;card&&card!==root&&i<6;i++,card=card.parentElement){
          const t=norm(card.textContent);
          if(/The Fulcrum/i.test(t)&&t.length<1400)break;
        }
        if(!card||card===root)continue;
        const a=document.createElement('a');a.className='about-proof-link';a.href=ARTICLE_URL;a.target='_blank';a.rel='noopener';a.textContent='Read my Fulcrum article ↗';card.appendChild(a);break;
      }
    }
    if(!root.querySelector('.about-methodology-card')){
      const host=root.querySelector('.about-stat-strip')?.parentElement||root.querySelector('.content')||root;
      const card=document.createElement('section');card.className='about-methodology-card';
      card.innerHTML='<div style="font-size:9px;font-weight:950;letter-spacing:1.2px;text-transform:uppercase;color:#758196">Forecasting</div><strong>How my model works</strong><p>See how I turn polling averages and historical Senate polling misses into race probabilities—and why a forecast can disagree with the raw polls.</p>';
      const a=document.createElement('a');a.className='about-methodology-link';a.href='/methodology.html';a.target='_blank';a.rel='noopener';a.textContent='Read the methodology →';card.appendChild(a);host.appendChild(card);
    }
  }

  function apply(){ensureStyle();ensureWillsTake();enhanceAbout();}
  apply();
  let queued=false;
  new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply();});}).observe(document.body,{childList:true,subtree:true,characterData:true});
  window.addEventListener('pageshow',apply);
  window.addEventListener('resize',apply);
})();
from pathlib import Path
import re

p=Path('senate-error-history.js')
s=p.read_text()

# Add state-history modal styling while retaining the existing large colorful shock-card layout.
css_anchor="      #page-errors .ipe-modal-source{background:#e9eef5;border:1px solid #dae3ed;border-radius:12px;padding:14px 16px;font-size:8px;line-height:1.55;color:#637287}\n"
css_extra="""      #page-errors .ipe-state-history-hero{max-width:1180px;margin:0 auto;position:relative;z-index:2;padding:4px 0 8px}
      #page-errors .ipe-state-history-kicker{font-size:9px;font-weight:1000;letter-spacing:1.5px;text-transform:uppercase;color:#b9cce5;margin-bottom:10px}
      #page-errors .ipe-state-history-title{display:flex;align-items:flex-end;justify-content:space-between;gap:24px}
      #page-errors .ipe-state-history-title h2{font-family:Georgia,serif;font-size:clamp(60px,8vw,104px);line-height:.88;letter-spacing:-3px;margin:0;color:#fff}
      #page-errors .ipe-state-history-average{text-align:right;min-width:170px}
      #page-errors .ipe-state-history-average span{display:block;font-size:8px;font-weight:1000;letter-spacing:1px;text-transform:uppercase;color:#b8cbe2}
      #page-errors .ipe-state-history-average b{display:block;font-family:Georgia,serif;font-size:46px;line-height:1;color:#fff;margin-top:5px}
      #page-errors .ipe-state-history-sub{max-width:780px;margin-top:17px;font-size:11px;line-height:1.6;color:#d7e3f1}
      #page-errors .ipe-state-history-list{display:grid;gap:18px;max-width:1180px;margin:0 auto}
      #page-errors .ipe-state-history-race{border-radius:22px;background:#fff;border:1px solid #dde5ef;box-shadow:0 15px 45px rgba(16,38,75,.08);overflow:hidden}
      #page-errors .ipe-state-history-race-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;padding:18px 20px 12px}
      #page-errors .ipe-state-history-race-head span{display:block;font-size:7px;font-weight:1000;letter-spacing:.9px;text-transform:uppercase;color:#8190a4}
      #page-errors .ipe-state-history-race-head h3{font-family:Georgia,serif;font-size:27px;line-height:1;margin:5px 0 0;color:#172a45}
      #page-errors .ipe-state-history-miss{text-align:right}
      #page-errors .ipe-state-history-miss b{display:block;font-family:Georgia,serif;font-size:25px;color:#203a60}
      #page-errors .ipe-state-history-miss small{display:block;margin-top:3px;font-size:7px;font-weight:900;letter-spacing:.55px;text-transform:uppercase;color:#8794a5}
      #page-errors .ipe-state-history-match{display:grid;grid-template-columns:1fr 42px 1fr;gap:10px;align-items:stretch;padding:0 20px 14px}
      #page-errors .ipe-state-history-side{border-radius:15px;padding:15px 16px;border:1px solid transparent}
      #page-errors .ipe-state-history-side.d{background:#e7f2ff;border-color:#bdd9f7;color:#135fa8}
      #page-errors .ipe-state-history-side.r{background:#fff0f2;border-color:#f1c9cf;color:#ad3341}
      #page-errors .ipe-state-history-side.i{background:#f1ebff;border-color:#d8c8f7;color:#7149b5}
      #page-errors .ipe-state-history-side span{display:block;font-size:7px;font-weight:1000;letter-spacing:.7px;text-transform:uppercase;opacity:.72}
      #page-errors .ipe-state-history-side b{display:block;font-family:Georgia,serif;font-size:20px;line-height:1.05;margin-top:6px;color:inherit}
      #page-errors .ipe-state-history-vs{display:grid;place-items:center;font-size:8px;font-weight:1000;color:#8a97a8;text-transform:uppercase}
      #page-errors .ipe-state-history-route{display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:center;background:#f5f7fa;border-top:1px solid #e7ecf2;padding:14px 20px}
      #page-errors .ipe-state-history-route div span{display:block;font-size:7px;font-weight:1000;letter-spacing:.65px;text-transform:uppercase;color:#8794a5}
      #page-errors .ipe-state-history-route div b{display:block;margin-top:4px;font-size:13px;color:#263b58}
      #page-errors .ipe-state-history-route i{font-style:normal;font-size:20px;color:#7d8da1}
      #page-errors .ipe-state-history-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 20px 17px}
      #page-errors .ipe-state-history-foot p{margin:0;font-size:8px;line-height:1.5;color:#758499}
      #page-errors .ipe-state-history-open{border:0;border-radius:10px;background:#173f71;color:#fff;padding:9px 12px;font-size:8px;font-weight:1000;cursor:pointer;white-space:nowrap}
      #page-errors .ipe-state-history-empty{border-radius:11px;background:#fff7e6;border:1px solid #efdba6;padding:10px 12px;color:#806323;font-size:8px;line-height:1.5;font-weight:750}
      @media(max-width:700px){#page-errors .ipe-state-history-title{align-items:flex-start;flex-direction:column}.ipe-state-history-average{text-align:left!important}.ipe-state-history-match{grid-template-columns:1fr!important}.ipe-state-history-vs{min-height:12px}.ipe-state-history-route{grid-template-columns:1fr!important}.ipe-state-history-route i{transform:rotate(90deg);justify-self:start}.ipe-state-history-foot{align-items:flex-start;flex-direction:column}.ipe-state-history-title h2{font-size:58px!important}}
"""
if 'ipe-state-history-hero' not in s:
    if css_anchor not in s: raise SystemExit('modal css anchor not found')
    s=s.replace(css_anchor,css_anchor+css_extra,1)

# State-wide averages are mean absolute polling-margin errors among scored saved races.
helper_anchor="  function swingRaceHTML(r){\n"
state_helpers=r'''  function stateAverageMiss(rows){
    const vals=rows.map(absError).filter(Number.isFinite);
    return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;
  }

  function stateHistoryRaceHTML(r){
    const idx=(data?.records||[]).indexOf(r), scored=idx>=0&&r.pollCount&&absError(r)!==null;
    const miss=absError(r), pollParty=pollLeaderParty(r), resultParty=r.winnerParty;
    const result=num(r.actualMargin)!==null?finalResultLabel(r):`${r.winner||'Winner'} won`;
    return `<article class="ipe-state-history-race"><div class="ipe-state-history-race-head"><div><span>${esc(r.year)} U.S. Senate · ${esc(r.seatClass||'')}</span><h3>${esc(r.matchup||`${r.winner||''} vs. ${r.runnerUp||''}`)}</h3></div><div class="ipe-state-history-miss"><b>${miss===null?'—':miss.toFixed(1)+' pts'}</b><small>${miss===null?'not scored':'polling miss'}</small></div></div><div class="ipe-state-history-match"><div class="ipe-state-history-side ${partyCardClass(r.winnerParty)}"><span>${esc(shortParty(r.winnerParty))} · ${esc(r.winnerParty||'')}</span><b>${esc(r.winner||'')}</b></div><div class="ipe-state-history-vs">vs</div><div class="ipe-state-history-side ${partyCardClass(r.runnerUpParty)}"><span>${esc(shortParty(r.runnerUpParty))} · ${esc(r.runnerUpParty||'')}</span><b>${esc(r.runnerUp||'')}</b></div></div>${scored?`<div class="ipe-state-history-route"><div><span>Final polls</span><b>${esc(pollResultLabel(r))}</b></div><i>→</i><div><span>Election result</span><b>${esc(result)}</b></div></div><div class="ipe-state-history-foot"><p>Polling leader: ${esc(r.pollLeader||'—')} · winner: ${esc(r.winner||'—')} · candidate colors follow the saved party fields for this election.</p><button type="button" class="ipe-state-history-open" data-state-race="${idx}">Open full race story →</button></div>`:`<div class="ipe-state-history-foot"><div class="ipe-state-history-empty">${esc(result)}. This election is included in the state’s 21st-century Senate history, but a qualifying polling average is not stored in the archive yet, so it is excluded from the state average.</div></div>`}</article>`;
  }

  function openStateStory(ab){
    const rows=swingStateRecords(ab), scored=rows.filter(r=>r.pollCount&&absError(r)!==null), avg=stateAverageMiss(scored), name=rows[0]?.stateName||ab;
    const hero=document.getElementById('ipeModalContent'), body=document.getElementById('ipeModalBody'), nav=document.querySelector('#ipeModal .ipe-modal-nav');
    if(!hero||!body)return;
    if(nav)nav.style.display='none';
    hero.innerHTML=`<div class="ipe-modal-grid"></div><div class="ipe-state-history-hero"><div class="ipe-state-history-kicker">SWING-STATE POLLING HISTORY · 21ST CENTURY</div><div class="ipe-state-history-title"><h2>${esc(name)}</h2><div class="ipe-state-history-average"><span>Average saved miss</span><b>${avg===null?'—':avg.toFixed(1)+' pts'}</b></div></div><p class="ipe-state-history-sub">${rows.length} Senate elections are shown here${ab==='TX'?' across both Texas Senate seats':''}. The average uses only races in this archive with a saved qualifying polling margin; result-only races remain visible but do not affect the average.</p></div>`;
    body.innerHTML=`<div class="ipe-state-history-list">${rows.map(stateHistoryRaceHTML).join('')}</div>`;
    body.querySelectorAll('[data-state-race]').forEach(btn=>btn.addEventListener('click',()=>openStory(Number(btn.dataset.stateRace))));
    const modal=document.getElementById('ipeModal'); if(modal){modal.classList.add('show');modal.scrollTop=0;document.body.style.overflow='hidden'}
  }

'''
if 'function openStateStory(ab)' not in s:
    if helper_anchor not in s: raise SystemExit('swingRace helper anchor not found')
    s=s.replace(helper_anchor,state_helpers+helper_anchor,1)

# Restore the earlier large colorful cards, but summarize each state with its average saved miss.
new_render=r'''  function renderShocks(){
    const host=document.getElementById('ipeShocks'); if(!host)return;
    const order=(data?.swingStates||[]).filter(ab=>(data?.targetStates||[]).includes(ab));
    if(!order.length){host.innerHTML='<div class="ipe-source">No swing-state history is available.</div>';return}
    host.className='ipe-shocks';
    host.innerHTML=order.map(ab=>{
      const rows=swingStateRecords(ab), scored=rows.filter(r=>r.pollCount&&absError(r)!==null), avg=stateAverageMiss(scored), name=rows[0]?.stateName||ab;
      const newest=rows[0], older=rows[rows.length-1];
      return `<button type="button" class="ipe-shock" data-ipe-state="${esc(ab)}"><span class="ipe-shock-rank">${rows.length} Senate races · ${older?.year||'—'}–${newest?.year||'—'}</span><strong>${esc(name)}</strong><div class="ipe-shock-cands"><span class="ipe-cand-pill d">Democratic <i>D</i></span><span class="ipe-cand-vs">+</span><span class="ipe-cand-pill r">Republican <i>R</i></span></div><div class="ipe-shock-route"><div><span>Scored races</span><b>${scored.length}</b></div><i>→</i><div><span>All races shown</span><b>${rows.length}</b></div></div><div class="ipe-shock-foot"><small>Click to open the full state history</small><em>${avg===null?'—':avg.toFixed(1)+' pts avg'}</em></div></button>`;
    }).join('');
    host.querySelectorAll('[data-ipe-state]').forEach(btn=>btn.addEventListener('click',()=>openStateStory(btn.dataset.ipeState)));
  }'''
s,n=re.subn(r"  function renderShocks\(\)\{.*?\n  \}\n\n  function openStory",new_render+"\n\n  function openStory",s,count=1,flags=re.S)
if n!=1: raise SystemExit('renderShocks replacement failed')

# Detailed single-race mode restores the existing previous/next navigation.
old="  function openStory(recordIndex){\n    const r=data?.records?.[recordIndex]; if(!r)return;"
new="  function openStory(recordIndex){\n    const r=data?.records?.[recordIndex]; if(!r)return;\n    const nav=document.querySelector('#ipeModal .ipe-modal-nav'); if(nav)nav.style.display='';"
if old in s:
    s=s.replace(old,new,1)
elif "if(nav)nav.style.display='';" not in s:
    raise SystemExit('openStory anchor not found')

# Update the section copy to match the new interaction.
s=s.replace('Open a state to see its saved 21st-century Senate history. Candidate colors follow the party listed for that candidate in that election; scored races can be opened as full-screen polling-error stories.','Each card keeps the original immersive format but now shows that state’s average saved polling miss. Click a state to open every saved 21st-century Senate race in one full-screen history.')

p.write_text(s)
print('patched average swing-state cards + immersive state histories')

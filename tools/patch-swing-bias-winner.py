from pathlib import Path

p=Path('senate-error-history.js')
s=p.read_text()

old="""      #page-errors .ipe-shock-rank{font-size:7px;font-weight:1000;letter-spacing:1px;color:rgba(255,255,255,.63);text-transform:uppercase}
"""
new="""      #page-errors .ipe-shock-rank{font-size:7px;font-weight:1000;letter-spacing:1px;color:rgba(255,255,255,.63);text-transform:uppercase}
      #page-errors .ipe-shock-bias,#page-errors .ipe-state-history-bias{display:inline-flex;align-items:center;width:max-content;border-radius:999px;padding:7px 10px;font-size:8px;font-weight:1000;letter-spacing:.9px;line-height:1;text-transform:uppercase;color:#fff;margin-bottom:8px;box-shadow:0 6px 16px rgba(0,0,0,.12)}
      #page-errors .ipe-shock-bias.d,#page-errors .ipe-state-history-bias.d{background:#1f6fca}
      #page-errors .ipe-shock-bias.r,#page-errors .ipe-state-history-bias.r{background:#c84050}
      #page-errors .ipe-shock-bias.even,#page-errors .ipe-state-history-bias.even{background:#667085}
"""
if old not in s: raise SystemExit('shock rank CSS marker not found')
s=s.replace(old,new,1)

old="""  function stateAverageMiss(rows){
    const vals=rows.map(absError).filter(Number.isFinite);
    return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;
  }
"""
new="""  function stateAverageMiss(rows){
    const vals=rows.map(absError).filter(Number.isFinite);
    return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;
  }
  function stateAverageDirection(rows){
    const vals=rows.map(pollGap).filter(Number.isFinite);
    return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;
  }
  function stateBiasLabel(v){
    if(!Number.isFinite(v)||Math.abs(v)<.05)return {text:'NO CONSISTENT PARTY BIAS',cls:'even'};
    return v>0?{text:'UNDERESTIMATED DEMOCRATS',cls:'d'}:{text:'UNDERESTIMATED REPUBLICANS',cls:'r'};
  }
"""
if old not in s: raise SystemExit('stateAverageMiss marker not found')
s=s.replace(old,new,1)

old="""    const inner=`<div class=\"ipe-swing-race-top\"><div><b>${esc(r.year)} U.S. Senate</b><span>${esc(r.seatClass||'')}</span></div><span>${r.pollCount?esc(r.status||''):'RESULT ONLY'}</span></div><div class=\"ipe-party-matchup\"><div class=\"ipe-party-candidate ${partyCardClass(r.winnerParty)}\"><span>${esc(shortParty(r.winnerParty))} · ${esc(r.winnerParty||'')}</span><b>${esc(r.winner||'')}</b></div><div class=\"ipe-party-vs\">vs</div><div class=\"ipe-party-candidate ${partyCardClass(r.runnerUpParty)}\"><span>${esc(shortParty(r.runnerUpParty))} · ${esc(r.runnerUpParty||'')}</span><b>${esc(r.runnerUp||'')}</b></div></div>${r.pollCount?`<div class=\"ipe-swing-numbers\"><div class=\"ipe-swing-number\"><span>Final polls</span><b>${esc(pollResultLabel(r))}</b></div><div class=\"ipe-swing-number\"><span>Result</span><b>${esc(result)}</b></div><div class=\"ipe-swing-number\"><span>Polls missed</span><b>${error===null?'—':error.toFixed(1)+' pts'}</b></div></div>`:`<div class=\"ipe-unsaved-poll\">${esc(result)} · This election is included so the state dropdown contains the full 21st-century Senate history. A qualifying polling average is not yet stored for this race, so no polling-error score is shown.</div>`}`;
"""
new="""    const inner=`<div class=\"ipe-swing-race-top\"><div><b>${esc(r.year)} U.S. Senate</b><span>${esc(r.seatClass||'')}</span></div><span>${r.pollCount?esc(r.status||''):'✓ WINNER'}</span></div><div class=\"ipe-party-matchup\"><div class=\"ipe-party-candidate ${partyCardClass(r.winnerParty)}\"><span>${esc(shortParty(r.winnerParty))} · ${esc(r.winnerParty||'')}</span><b>${esc(r.winner||'')}</b></div><div class=\"ipe-party-vs\">vs</div><div class=\"ipe-party-candidate ${partyCardClass(r.runnerUpParty)}\"><span>${esc(shortParty(r.runnerUpParty))} · ${esc(r.runnerUpParty||'')}</span><b>${esc(r.runnerUp||'')}</b></div></div>${r.pollCount?`<div class=\"ipe-swing-numbers\"><div class=\"ipe-swing-number\"><span>Final polls</span><b>${esc(pollResultLabel(r))}</b></div><div class=\"ipe-swing-number\"><span>Result</span><b>${esc(result)}</b></div><div class=\"ipe-swing-number\"><span>Polls missed</span><b>${error===null?'—':error.toFixed(1)+' pts'}</b></div></div>`:`<div class=\"ipe-unsaved-poll\">✓ Winner: ${esc(r.winner||'Winner')}</div>`}`;
"""
if old not in s: raise SystemExit('swingRaceHTML marker not found')
s=s.replace(old,new,1)

old="""    return `<article class=\"ipe-state-history-race\"><div class=\"ipe-state-history-race-head\"><div><span>${esc(r.year)} U.S. Senate · ${esc(r.seatClass||'')}</span><h3>${esc(r.matchup||`${r.winner||''} vs. ${r.runnerUp||''}`)}</h3></div><div class=\"ipe-state-history-miss\"><b>${miss===null?'—':miss.toFixed(1)+' pts'}</b><small>${miss===null?'not scored':'polling miss'}</small></div></div><div class=\"ipe-state-history-match\"><div class=\"ipe-state-history-side ${partyCardClass(r.winnerParty)}\"><span>${esc(shortParty(r.winnerParty))} · ${esc(r.winnerParty||'')}</span><b>${esc(r.winner||'')}</b></div><div class=\"ipe-state-history-vs\">vs</div><div class=\"ipe-state-history-side ${partyCardClass(r.runnerUpParty)}\"><span>${esc(shortParty(r.runnerUpParty))} · ${esc(r.runnerUpParty||'')}</span><b>${esc(r.runnerUp||'')}</b></div></div>${scored?`<div class=\"ipe-state-history-route\"><div><span>Final polls</span><b>${esc(pollResultLabel(r))}</b></div><i>→</i><div><span>Election result</span><b>${esc(result)}</b></div></div><div class=\"ipe-state-history-foot\"><p>Polling leader: ${esc(r.pollLeader||'—')} · winner: ${esc(r.winner||'—')} · candidate colors follow the saved party fields for this election.</p><button type=\"button\" class=\"ipe-state-history-open\" data-state-race=\"${idx}\">Open full race story →</button></div>`:`<div class=\"ipe-state-history-foot\"><div class=\"ipe-state-history-empty\">${esc(result)}. This election is included in the state’s 21st-century Senate history, but a qualifying polling average is not stored in the archive yet, so it is excluded from the state average.</div></div>`}</article>`;
"""
new="""    return `<article class=\"ipe-state-history-race\"><div class=\"ipe-state-history-race-head\"><div><span>${esc(r.year)} U.S. Senate · ${esc(r.seatClass||'')}</span><h3>${esc(r.matchup||`${r.winner||''} vs. ${r.runnerUp||''}`)}</h3></div><div class=\"ipe-state-history-miss\"><b>${miss===null?'✓':miss.toFixed(1)+' pts'}</b><small>${miss===null?'winner':'polling miss'}</small></div></div><div class=\"ipe-state-history-match\"><div class=\"ipe-state-history-side ${partyCardClass(r.winnerParty)}\"><span>${esc(shortParty(r.winnerParty))} · ${esc(r.winnerParty||'')}</span><b>${esc(r.winner||'')}</b></div><div class=\"ipe-state-history-vs\">vs</div><div class=\"ipe-state-history-side ${partyCardClass(r.runnerUpParty)}\"><span>${esc(shortParty(r.runnerUpParty))} · ${esc(r.runnerUpParty||'')}</span><b>${esc(r.runnerUp||'')}</b></div></div>${scored?`<div class=\"ipe-state-history-route\"><div><span>Final polls</span><b>${esc(pollResultLabel(r))}</b></div><i>→</i><div><span>Election result</span><b>${esc(result)}</b></div></div><div class=\"ipe-state-history-foot\"><p>Polling leader: ${esc(r.pollLeader||'—')} · winner: ${esc(r.winner||'—')} · candidate colors follow the saved party fields for this election.</p><button type=\"button\" class=\"ipe-state-history-open\" data-state-race=\"${idx}\">Open full race story →</button></div>`:`<div class=\"ipe-state-history-foot\"><div class=\"ipe-state-history-empty\">✓ Winner: ${esc(r.winner||'Winner')}</div></div>`}</article>`;
"""
if old not in s: raise SystemExit('stateHistoryRaceHTML marker not found')
s=s.replace(old,new,1)

old="""    const rows=swingStateRecords(ab), scored=rows.filter(r=>r.pollCount&&absError(r)!==null), avg=stateAverageMiss(scored), name=rows[0]?.stateName||ab;
    const hero=document.getElementById('ipeModalContent'), body=document.getElementById('ipeModalBody'), nav=document.querySelector('#ipeModal .ipe-modal-nav');
"""
new="""    const rows=swingStateRecords(ab), scored=rows.filter(r=>r.pollCount&&absError(r)!==null), avg=stateAverageMiss(scored), direction=stateAverageDirection(scored), bias=stateBiasLabel(direction), name=rows[0]?.stateName||ab;
    const hero=document.getElementById('ipeModalContent'), body=document.getElementById('ipeModalBody'), nav=document.querySelector('#ipeModal .ipe-modal-nav');
"""
if old not in s: raise SystemExit('openStateStory variables marker not found')
s=s.replace(old,new,1)

old="""    hero.innerHTML=`<div class=\"ipe-modal-grid\"></div><div class=\"ipe-state-history-hero\"><div class=\"ipe-state-history-kicker\">SWING-STATE POLLING HISTORY · 21ST CENTURY</div><div class=\"ipe-state-history-title\"><h2>${esc(name)}</h2><div class=\"ipe-state-history-average\"><span>Average saved miss</span><b>${avg===null?'—':avg.toFixed(1)+' pts'}</b></div></div><p class=\"ipe-state-history-sub\">${rows.length} Senate elections are shown here${ab==='TX'?' across both Texas Senate seats':''}. The average uses only races in this archive with a saved qualifying polling margin; result-only races remain visible but do not affect the average.</p></div>`;
"""
new="""    hero.innerHTML=`<div class=\"ipe-modal-grid\"></div><div class=\"ipe-state-history-hero\"><div class=\"ipe-state-history-kicker\">SWING-STATE POLLING HISTORY · 21ST CENTURY</div><div class=\"ipe-state-history-bias ${bias.cls}\">${bias.text}</div><div class=\"ipe-state-history-title\"><h2>${esc(name)}</h2><div class=\"ipe-state-history-average\"><span>Average saved miss</span><b>${avg===null?'—':avg.toFixed(1)+' pts'}</b></div></div><p class=\"ipe-state-history-sub\">${rows.length} Senate elections are shown here${ab==='TX'?' across both Texas Senate seats':''}. The average uses only races in this archive with a saved qualifying polling margin; result-only races remain visible but do not affect the average.</p></div>`;
"""
if old not in s: raise SystemExit('state history hero marker not found')
s=s.replace(old,new,1)

old="""      const rows=swingStateRecords(ab), scored=rows.filter(r=>r.pollCount&&absError(r)!==null), avg=stateAverageMiss(scored), name=rows[0]?.stateName||ab;
      const newest=rows[0], older=rows[rows.length-1];
      return `<button type=\"button\" class=\"ipe-shock\" data-ipe-state=\"${esc(ab)}\"><span class=\"ipe-shock-rank\">${rows.length} Senate races · ${older?.year||'—'}–${newest?.year||'—'}</span><strong>${esc(name)}</strong><div class=\"ipe-shock-cands\"><span class=\"ipe-cand-pill d\">Democratic <i>D</i></span><span class=\"ipe-cand-vs\">+</span><span class=\"ipe-cand-pill r\">Republican <i>R</i></span></div><div class=\"ipe-shock-route\"><div><span>Scored races</span><b>${scored.length}</b></div><i>→</i><div><span>All races shown</span><b>${rows.length}</b></div></div><div class=\"ipe-shock-foot\"><small>Click to open the full state history</small><em>${avg===null?'—':avg.toFixed(1)+' pts avg'}</em></div></button>`;
"""
new="""      const rows=swingStateRecords(ab), scored=rows.filter(r=>r.pollCount&&absError(r)!==null), avg=stateAverageMiss(scored), direction=stateAverageDirection(scored), bias=stateBiasLabel(direction), name=rows[0]?.stateName||ab;
      const newest=rows[0], older=rows[rows.length-1];
      return `<button type=\"button\" class=\"ipe-shock\" data-ipe-state=\"${esc(ab)}\"><span class=\"ipe-shock-bias ${bias.cls}\">${bias.text}</span><span class=\"ipe-shock-rank\">${rows.length} Senate races · ${older?.year||'—'}–${newest?.year||'—'}</span><strong>${esc(name)}</strong><div class=\"ipe-shock-cands\"><span class=\"ipe-cand-pill d\">Democratic <i>D</i></span><span class=\"ipe-cand-vs\">+</span><span class=\"ipe-cand-pill r\">Republican <i>R</i></span></div><div class=\"ipe-shock-route\"><div><span>Scored races</span><b>${scored.length}</b></div><i>→</i><div><span>All races shown</span><b>${rows.length}</b></div></div><div class=\"ipe-shock-foot\"><small>Click to open the full state history</small><em>${avg===null?'—':avg.toFixed(1)+' pts avg'}</em></div></button>`;
"""
if old not in s: raise SystemExit('renderShocks marker not found')
s=s.replace(old,new,1)

p.write_text(s)
print('patched swing-state bias labels and result-only winner display')

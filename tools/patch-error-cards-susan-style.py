from pathlib import Path

p=Path('senate-error-history.js')
s=p.read_text()

repls={
"#page-errors .ipe-metric.gold{background:linear-gradient(145deg,#84570f,#d59424)}":"#page-errors .ipe-metric.gold{background:linear-gradient(145deg,#253f73,#5f4aa0)}",
"#page-errors .ipe-method-card.gold{background:#fff8e6;border-color:#f0dfad}":"#page-errors .ipe-method-card.gold{background:#f3efff;border-color:#d9cff5}",
"#page-errors .ipe-method-card.gold .ipe-method-num{background:#b77d17}":"#page-errors .ipe-method-card.gold .ipe-method-num{background:#6650a8}",
".ipe-candidate.i{border-top-color:#ffd060}":".ipe-candidate.i{border-top-color:#9a7be0}",
".ipe-insight.gold{background:linear-gradient(145deg,#fff7df,#fffdf7);border-top:5px solid #d09a29}":".ipe-insight.gold{background:linear-gradient(145deg,#f1edff,#fcfbff);border-top:5px solid #6c55ae}",
".ipe-insight.gold .big{color:#9d7018}":".ipe-insight.gold .big{color:#5f4aa0}",
".ipe-context div:nth-child(3){background:#815d19}":".ipe-context div:nth-child(3){background:#4f427e}",
"#page-errors .ipe-shock-rank{font-size:7px":"#page-errors .ipe-shock-rank{font-size:10px",
"font-size:8px;font-weight:1000;letter-spacing:.9px;line-height:1;text-transform:uppercase;color:#fff;margin-bottom:8px":"font-size:11px;font-weight:1000;letter-spacing:.9px;line-height:1;text-transform:uppercase;color:#fff;margin-bottom:10px",
"#page-errors .ipe-shock strong{display:block;font-family:Georgia,serif;font-size:26px":"#page-errors .ipe-shock strong{display:block;font-family:Georgia,serif;font-size:31px",
"font-size:7px;font-weight:950;line-height:1;color:#fff;max-width:46%":"font-size:10px;font-weight:950;line-height:1;color:#fff;max-width:46%",
"#page-errors .ipe-cand-pill i{font-style:normal;font-size:6px":"#page-errors .ipe-cand-pill i{font-style:normal;font-size:8px",
".ipe-cand-vs{font-size:6px":".ipe-cand-vs{font-size:9px",
"#page-errors .ipe-shock-route span{font-size:7px":"#page-errors .ipe-shock-route span{font-size:10px",
"#page-errors .ipe-shock-route b{display:block;font-size:14px":"#page-errors .ipe-shock-route b{display:block;font-size:18px",
"#page-errors .ipe-shock-foot small{font-size:7px":"#page-errors .ipe-shock-foot small{font-size:10px",
"#page-errors .ipe-state-history-race-head span{display:block;font-size:7px":"#page-errors .ipe-state-history-race-head span{display:block;font-size:10px",
"#page-errors .ipe-state-history-miss small{display:block;margin-top:3px;font-size:7px":"#page-errors .ipe-state-history-miss small{display:block;margin-top:3px;font-size:10px",
"#page-errors .ipe-state-history-side{border-radius:15px;padding:15px 16px;border:1px solid transparent}":"#page-errors .ipe-state-history-side{border-radius:15px;padding:17px 18px;border:1px solid transparent;position:relative}",
"#page-errors .ipe-state-history-side span{display:block;font-size:7px":"#page-errors .ipe-state-history-side span{display:block;font-size:10px",
"#page-errors .ipe-state-history-side b{display:block;font-family:Georgia,serif;font-size:20px":"#page-errors .ipe-state-history-side b{display:block;font-family:Georgia,serif;font-size:24px",
"#page-errors .ipe-state-history-vs{display:grid;place-items:center;font-size:8px":"#page-errors .ipe-state-history-vs{display:grid;place-items:center;font-size:11px",
"#page-errors .ipe-state-history-route div span{display:block;font-size:7px":"#page-errors .ipe-state-history-route div span{display:block;font-size:10px",
"#page-errors .ipe-state-history-route div b{display:block;margin-top:4px;font-size:13px":"#page-errors .ipe-state-history-route div b{display:block;margin-top:4px;font-size:17px",
"#page-errors .ipe-party-candidate{border-radius:11px;padding:10px 11px;border:1px solid transparent;min-width:0}":"#page-errors .ipe-party-candidate{border-radius:11px;padding:12px 13px;border:1px solid transparent;min-width:0;position:relative}",
"#page-errors .ipe-party-candidate span{display:block;font-size:6px":"#page-errors .ipe-party-candidate span{display:block;font-size:9px",
"#page-errors .ipe-party-candidate b{display:block;margin-top:4px;font-size:10px":"#page-errors .ipe-party-candidate b{display:block;margin-top:5px;font-size:14px",
"#page-errors .ipe-party-vs{display:grid;place-items:center;font-size:7px":"#page-errors .ipe-party-vs{display:grid;place-items:center;font-size:10px",
"#page-errors .ipe-swing-number span{display:block;font-size:6px":"#page-errors .ipe-swing-number span{display:block;font-size:9px",
"#page-errors .ipe-swing-number b{display:block;margin-top:4px;font-size:10px":"#page-errors .ipe-swing-number b{display:block;margin-top:4px;font-size:14px"
}
for old,new in repls.items():
    if old not in s:
        print('missing css marker:', old[:70])
    else:
        s=s.replace(old,new,1)

marker="#page-errors .ipe-state-history-side.i{background:#f1ebff;border-color:#d8c8f7;color:#7149b5}"
if marker not in s: raise SystemExit('state side marker missing')
s=s.replace(marker, marker+"\n      #page-errors .ipe-state-history-side.winner-mark{padding-right:58px;box-shadow:inset 0 0 0 2px currentColor}\n      #page-errors .ipe-state-history-side.winner-mark:after{content:'✓';position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:30px;line-height:1;font-weight:1000;color:currentColor}",1)

marker="#page-errors .ipe-party-candidate.i{background:#f1ebff;border-color:#d8c8f7;color:#7149b5}"
if marker not in s: raise SystemExit('party candidate marker missing')
s=s.replace(marker, marker+"\n      #page-errors .ipe-party-candidate.winner-mark{padding-right:42px;box-shadow:inset 0 0 0 2px currentColor}\n      #page-errors .ipe-party-candidate.winner-mark:after{content:'✓';position:absolute;right:11px;top:50%;transform:translateY(-50%);font-size:23px;line-height:1;font-weight:1000;color:currentColor}",1)

old="""    const inner=`<div class=\"ipe-swing-race-top\"><div><b>${esc(r.year)} U.S. Senate</b><span>${esc(r.seatClass||'')}</span></div><span>${r.pollCount?esc(r.status||''):'✓ WINNER'}</span></div><div class=\"ipe-party-matchup\"><div class=\"ipe-party-candidate ${partyCardClass(r.winnerParty)}\"><span>${esc(shortParty(r.winnerParty))} · ${esc(r.winnerParty||'')}</span><b>${esc(r.winner||'')}</b></div><div class=\"ipe-party-vs\">vs</div><div class=\"ipe-party-candidate ${partyCardClass(r.runnerUpParty)}\"><span>${esc(shortParty(r.runnerUpParty))} · ${esc(r.runnerUpParty||'')}</span><b>${esc(r.runnerUp||'')}</b></div></div>${r.pollCount?`<div class=\"ipe-swing-numbers\"><div class=\"ipe-swing-number\"><span>Final polls</span><b>${esc(pollResultLabel(r))}</b></div><div class=\"ipe-swing-number\"><span>Result</span><b>${esc(result)}</b></div><div class=\"ipe-swing-number\"><span>Polls missed</span><b>${error===null?'—':error.toFixed(1)+' pts'}</b></div></div>`:`<div class=\"ipe-unsaved-poll\">✓ Winner: ${esc(r.winner||'Winner')}</div>`}`;
"""
new="""    const inner=`<div class=\"ipe-swing-race-top\"><div><b>${esc(r.year)} U.S. Senate</b><span>${esc(r.seatClass||'')}</span></div>${r.pollCount?`<span>${esc(r.status||'')}</span>`:''}</div><div class=\"ipe-party-matchup\"><div class=\"ipe-party-candidate ${partyCardClass(r.winnerParty)}${r.pollCount?'':' winner-mark'}\"><span>${esc(shortParty(r.winnerParty))} · ${esc(r.winnerParty||'')}</span><b>${esc(r.winner||'')}</b></div><div class=\"ipe-party-vs\">vs</div><div class=\"ipe-party-candidate ${partyCardClass(r.runnerUpParty)}\"><span>${esc(shortParty(r.runnerUpParty))} · ${esc(r.runnerUpParty||'')}</span><b>${esc(r.runnerUp||'')}</b></div></div>${r.pollCount?`<div class=\"ipe-swing-numbers\"><div class=\"ipe-swing-number\"><span>Final polls</span><b>${esc(pollResultLabel(r))}</b></div><div class=\"ipe-swing-number\"><span>Result</span><b>${esc(result)}</b></div><div class=\"ipe-swing-number\"><span>Polls missed</span><b>${error===null?'—':error.toFixed(1)+' pts'}</b></div></div>`:''}`;
"""
if old not in s: raise SystemExit('swingRaceHTML marker missing')
s=s.replace(old,new,1)

old="""    return `<article class=\"ipe-state-history-race\"><div class=\"ipe-state-history-race-head\"><div><span>${esc(r.year)} U.S. Senate · ${esc(r.seatClass||'')}</span><h3>${esc(r.matchup||`${r.winner||''} vs. ${r.runnerUp||''}`)}</h3></div><div class=\"ipe-state-history-miss\"><b>${miss===null?'✓':miss.toFixed(1)+' pts'}</b><small>${miss===null?'winner':'polling miss'}</small></div></div><div class=\"ipe-state-history-match\"><div class=\"ipe-state-history-side ${partyCardClass(r.winnerParty)}\"><span>${esc(shortParty(r.winnerParty))} · ${esc(r.winnerParty||'')}</span><b>${esc(r.winner||'')}</b></div><div class=\"ipe-state-history-vs\">vs</div><div class=\"ipe-state-history-side ${partyCardClass(r.runnerUpParty)}\"><span>${esc(shortParty(r.runnerUpParty))} · ${esc(r.runnerUpParty||'')}</span><b>${esc(r.runnerUp||'')}</b></div></div>${scored?`<div class=\"ipe-state-history-route\"><div><span>Final polls</span><b>${esc(pollResultLabel(r))}</b></div><i>→</i><div><span>Election result</span><b>${esc(result)}</b></div></div><div class=\"ipe-state-history-foot\"><p>Polling leader: ${esc(r.pollLeader||'—')} · winner: ${esc(r.winner||'—')} · candidate colors follow the saved party fields for this election.</p><button type=\"button\" class=\"ipe-state-history-open\" data-state-race=\"${idx}\">Open full race story →</button></div>`:`<div class=\"ipe-state-history-foot\"><div class=\"ipe-state-history-empty\">✓ Winner: ${esc(r.winner||'Winner')}</div></div>`}</article>`;
"""
new="""    return `<article class=\"ipe-state-history-race\"><div class=\"ipe-state-history-race-head\"><div><span>${esc(r.year)} U.S. Senate · ${esc(r.seatClass||'')}</span><h3>${esc(r.matchup||`${r.winner||''} vs. ${r.runnerUp||''}`)}</h3></div>${scored?`<div class=\"ipe-state-history-miss\"><b>${miss.toFixed(1)+' pts'}</b><small>polling miss</small></div>`:''}</div><div class=\"ipe-state-history-match\"><div class=\"ipe-state-history-side ${partyCardClass(r.winnerParty)}${scored?'':' winner-mark'}\"><span>${esc(shortParty(r.winnerParty))} · ${esc(r.winnerParty||'')}</span><b>${esc(r.winner||'')}</b></div><div class=\"ipe-state-history-vs\">vs</div><div class=\"ipe-state-history-side ${partyCardClass(r.runnerUpParty)}\"><span>${esc(shortParty(r.runnerUpParty))} · ${esc(r.runnerUpParty||'')}</span><b>${esc(r.runnerUp||'')}</b></div></div>${scored?`<div class=\"ipe-state-history-route\"><div><span>Final polls</span><b>${esc(pollResultLabel(r))}</b></div><i>→</i><div><span>Election result</span><b>${esc(result)}</b></div></div><div class=\"ipe-state-history-foot\"><p>Polling leader: ${esc(r.pollLeader||'—')} · winner: ${esc(r.winner||'—')} · candidate colors follow the saved party fields for this election.</p><button type=\"button\" class=\"ipe-state-history-open\" data-state-race=\"${idx}\">Open full race story →</button></div>`:''}</article>`;
"""
if old not in s: raise SystemExit('stateHistoryRaceHTML marker missing')
s=s.replace(old,new,1)

p.write_text(s)
print('patched card typography, colors, and winner check placement')

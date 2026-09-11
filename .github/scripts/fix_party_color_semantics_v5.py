from pathlib import Path
p=Path('senate-error-history.js')
s=p.read_text()

# Helper: determine the party attached to the actual candidate named as the polling leader.
anchor="  const partyCardClass=p=>shortParty(p)==='D'?'d':shortParty(p)==='R'?'r':'i';\n"
helper="  const namedParty=(r,name)=>String(name||'')===String(r?.winner||'')?r?.winnerParty:String(name||'')===String(r?.runnerUp||'')?r?.runnerUpParty:'';\n  const pollLeaderParty=r=>namedParty(r,r?.pollLeader);\n"
if 'const pollLeaderParty=' not in s:
    if anchor not in s: raise SystemExit('party helper anchor not found')
    s=s.replace(anchor,anchor+helper,1)

# Add dynamic party-color overrides. These deliberately override old poll/result semantic colors.
css_anchor="      #page-errors .ipe-demo-card.result{background:linear-gradient(145deg,#922b3b,#d44f5c)}\n"
css_extra="""      #page-errors .ipe-demo-card.party-d{background:linear-gradient(145deg,#1555a0,#1976cf)}
      #page-errors .ipe-demo-card.party-r{background:linear-gradient(145deg,#922b3b,#d44f5c)}
      #page-errors .ipe-demo-card.party-i{background:linear-gradient(145deg,#55358d,#8057ca)}
"""
if 'ipe-demo-card.party-d' not in s:
    if css_anchor not in s: raise SystemExit('demo css anchor not found')
    s=s.replace(css_anchor,css_anchor+css_extra,1)

journey_anchor="      #page-errors .ipe-journey-box.poll{background:#eaf4ff}.ipe-journey-box.result{background:#fff0f2}\n"
journey_extra="""      #page-errors .ipe-journey-box.party-d{background:#e7f2ff}.ipe-journey-box.party-d b{color:#135fa8}
      #page-errors .ipe-journey-box.party-r{background:#fff0f2}.ipe-journey-box.party-r b{color:#ad3341}
      #page-errors .ipe-journey-box.party-i{background:#f1ebff}.ipe-journey-box.party-i b{color:#7149b5}
"""
if 'ipe-journey-box.party-d' not in s:
    if journey_anchor not in s: raise SystemExit('journey css anchor not found')
    s=s.replace(journey_anchor,journey_anchor+journey_extra,1)

modal_anchor="      #page-errors .ipe-modal-stage.poll{background:rgba(13,79,151,.60)}.ipe-modal-stage.result{background:rgba(160,42,55,.62)}\n"
modal_extra="""      #page-errors .ipe-modal-stage.party-d{background:rgba(13,79,151,.72)}
      #page-errors .ipe-modal-stage.party-r{background:rgba(160,42,55,.72)}
      #page-errors .ipe-modal-stage.party-i{background:rgba(91,57,151,.72)}
"""
if 'ipe-modal-stage.party-d' not in s:
    if modal_anchor not in s: raise SystemExit('modal css anchor not found')
    s=s.replace(modal_anchor,modal_anchor+modal_extra,1)

# Archive race cards: color polling and result boxes by the candidate party shown in each box.
s=s.replace('<div class="ipe-journey-box poll"><span>Polling said</span><b>${esc(pollResultLabel(r))}</b></div>', '<div class="ipe-journey-box party-${partyCardClass(pollLeaderParty(r))}"><span>Polling said</span><b>${esc(pollResultLabel(r))}</b></div>')
s=s.replace('<div class="ipe-journey-box result"><span>Voters said</span><b>${esc(finalResultLabel(r))}</b></div>', '<div class="ipe-journey-box party-${partyCardClass(r.winnerParty)}"><span>Voters said</span><b>${esc(finalResultLabel(r))}</b></div>')

# Full-screen story: same rule.
s=s.replace('<div class="ipe-modal-stage poll"><span>Polling said</span>', '<div class="ipe-modal-stage party-${partyCardClass(pollLeaderParty(r))}"><span>Polling said</span>')
s=s.replace('<div class="ipe-modal-stage result"><span>Voters said</span>', '<div class="ipe-modal-stage party-${partyCardClass(r.winnerParty)}"><span>Voters said</span>')

# Hero example: same rule.
s=s.replace('<div class="ipe-demo-card poll"><span>Polling said</span>', '<div class="ipe-demo-card party-${partyCardClass(ex?pollLeaderParty(ex):\'\')}"><span>Polling said</span>')
s=s.replace('<div class="ipe-demo-card result"><span>Voters said</span>', '<div class="ipe-demo-card party-${partyCardClass(ex?ex.winnerParty:\'\')}"><span>Voters said</span>')

# Prevent the homepage MutationObserver from endlessly rewriting the promo subtree.
old="""  function enhanceHomePromo(){
    const home=document.getElementById('page-home'); if(!home)return;
    const shell=home.querySelector('.reference-home-shell')||home;
    let box=document.getElementById('homePastPollingMisses');
    if(!box){box=document.createElement('button');box.id='homePastPollingMisses';box.type='button'}
    box.innerHTML='"""
new="""  function enhanceHomePromo(){
    const home=document.getElementById('page-home'); if(!home)return;
    const shell=home.querySelector('.reference-home-shell')||home;
    let box=document.getElementById('homePastPollingMisses');
    if(box?.dataset?.ipeEnhanced==='1')return;
    if(!box){box=document.createElement('button');box.id='homePastPollingMisses';box.type='button'}
    box.dataset.ipeEnhanced='1';
    box.innerHTML='"""
if old in s:
    s=s.replace(old,new,1)
elif "if(box?.dataset?.ipeEnhanced==='1')return;" not in s:
    raise SystemExit('homepage promo function not found')

p.write_text(s)
print('patched party-color semantics')

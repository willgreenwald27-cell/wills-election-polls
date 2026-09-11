from pathlib import Path

WHY = "Why: Final polling margins underestimated Susan Collins by more than 5 points in each of her last three Senate elections (2008, 2014, and 2020)."

# Patch the two production scripts that currently force Maine back to the Democratic call.
p = Path('accepted-good.js')
s = p.read_text()
repls = [
    ("s.rating='tilt-d'; s.predictionParty='Democrat'; s.prediction='Jackson +0.4%'; s.updated='2026-09-08';",
     "s.rating='tilt-r'; s.predictionParty='Republican'; s.prediction='Collins +1.3%'; s.notes='" + WHY.replace("'", "\\'") + "'; s.updated='2026-09-10';"),
    ("for(const k of ['projectedWinner','predictionWinner','winner','callParty']) if(k in s) s[k]='Democrat';",
     "for(const k of ['projectedWinner','predictionWinner','winner','callParty']) if(k in s) s[k]='Republican';"),
    ("if('call' in s) s.call='Jackson +0.4%';", "if('call' in s) s.call='Collins +1.3%';"),
]
for old,new in repls:
    if old not in s:
        raise SystemExit('accepted-good marker not found: ' + old[:80])
    s=s.replace(old,new,1)
p.write_text(s)

p = Path('site-final.js')
s = p.read_text()
repls = [
    ("me.rating='tilt-d';", "me.rating='tilt-r';"),
    ("me.predictionParty='Democrat';", "me.predictionParty='Republican';"),
    ("me.prediction='Jackson +0.4%';", "me.prediction='Collins +1.3%';\n        me.notes='" + WHY.replace("'", "\\'") + "';"),
    ("me.updated='2026-09-08';", "me.updated='2026-09-10';"),
    ("for(const k of ['projectedWinner','predictionWinner','winner','callParty']) if(k in me) me[k]='Democrat';",
     "for(const k of ['projectedWinner','predictionWinner','winner','callParty']) if(k in me) me[k]='Republican';"),
    ("if('call' in me) me.call='Jackson +0.4%';", "if('call' in me) me.call='Collins +1.3%';"),
    ("el.style.setProperty('fill','#d3e2f7','important');", "el.style.setProperty('fill','#f8c6ca','important');"),
    ("el.style.setProperty('background','#d3e2f7','important');", "el.style.setProperty('background','#f8c6ca','important');"),
    ("if(/^Prediction:\\s*/i.test(t)) el.textContent='Prediction: Tilt Democratic';", "if(/^Prediction:\\s*/i.test(t)) el.textContent='Prediction: Tilt Republican';"),
    ("if(t==='Jackson +0.4%'||t==='Tilt Republican'||t==='No prediction text entered yet.')", "if(t==='Jackson +0.4%'||t==='Tilt Democratic'||t==='No prediction text entered yet.')"),
    ("if(el.closest('.prediction-copy')||/Jackson \\+0\\.4%|No prediction text/i.test(t)) el.textContent='Jackson +0.4%';",
     "if(el.closest('.prediction-copy')||/Jackson \\+0\\.4%|No prediction text/i.test(t)) el.textContent='Collins +1.3%';"),
    ("if(p){p.textContent='Democrat';p.style.setProperty('color',BLUE,'important');}", "if(p){p.textContent='Republican';p.style.setProperty('color',RED,'important');}"),
    ("const copy=box.querySelector('.prediction-copy'); if(copy) copy.textContent='Jackson +0.4%';", "const copy=box.querySelector('.prediction-copy'); if(copy) copy.textContent='Collins +1.3%';"),
    ("if(p) p.textContent='Democrat';", "if(p) p.textContent='Republican';"),
]
for old,new in repls:
    if old not in s:
        raise SystemExit('site-final marker not found: ' + old[:80])
    s=s.replace(old,new,1)

old = """  function setBalance(){
    const root=document.getElementById('page-senate'); if(!root) return;
    for(const label of leafs(root)){
      const t=norm(label.textContent);
      if(!/^(REPUBLICAN|DEMOCRAT(?:IC)?)$/i.test(t)) continue;
      let box=label.parentElement;
      for(let d=0;box&&box!==root&&d<5;d++,box=box.parentElement){
        const n=leafs(box).find(x=>/^\\d+$/.test(norm(x.textContent)));
        if(n){n.textContent='50';break;}
      }
    }
  }
"""
new = """  function setBalance(){
    const root=document.getElementById('page-senate'); if(!root) return;
    for(const label of leafs(root)){
      const t=norm(label.textContent);
      if(!/^(REPUBLICAN|DEMOCRAT(?:IC)?)$/i.test(t)) continue;
      const value=/^REPUBLICAN$/i.test(t)?'51':'49';
      let box=label.parentElement;
      for(let d=0;box&&box!==root&&d<5;d++,box=box.parentElement){
        const n=leafs(box).find(x=>/^\\d+$/.test(norm(x.textContent)));
        if(n){n.textContent=value;break;}
      }
    }
  }
"""
if old not in s: raise SystemExit('site-final setBalance block not found')
s=s.replace(old,new,1)

old = """    for(const card of root.querySelectorAll('.reference-metrics>*')){
      const t=norm(card.textContent).toLowerCase();
      if(t.includes('poll')&&t.includes('entered')) leafs(card).forEach(el=>{if(norm(el.textContent)==='13')el.textContent='88';});
      if(t.includes('latest')&&t.includes('update')) leafs(card).forEach(el=>{if(/Sep\\.? [67], 2026|2026-09-0[67]/i.test(norm(el.textContent)))el.textContent='Sep 8, 2026';});
    }
"""
new = old + """    const senateCard=root.querySelector('#homeForecastSplit .senate-card,.will-senate-card');
    if(senateCard){
      const nums=[...senateCard.querySelectorAll('.party-number')];
      if(nums[0]) nums[0].textContent='49';
      if(nums[1]) nums[1].textContent='51';
      for(const el of leafs(senateCard)){
        const t=norm(el.textContent);
        if(/^Democrats?:\\s*50$/i.test(t)) el.textContent=t.replace(/50$/,'49');
        if(/^Republicans?:\\s*50$/i.test(t)) el.textContent=t.replace(/50$/,'51');
        if(/^50 seats$/i.test(t)){
          const parent=norm(el.parentElement?.textContent);
          if(/Democrat/i.test(parent)) el.textContent='49 seats';
          if(/Republican/i.test(parent)) el.textContent='51 seats';
        }
      }
      const bar=senateCard.querySelector('.senate-bar');
      if(bar){
        const kids=[...bar.children].filter(x=>x.tagName!=='B');
        if(kids[0]) kids[0].style.setProperty('width','49%','important');
        if(kids[1]) kids[1].style.setProperty('width','51%','important');
      }
    }
"""
if old not in s: raise SystemExit('site-final fixHome marker not found')
s=s.replace(old,new,1)
p.write_text(s)

# Every historical winner gets the checkmark inside the light party-tinted winner box.
p = Path('senate-error-history.js')
s = p.read_text()
repls = [
    ("${partyCardClass(r.winnerParty)}${scored?'':' winner-mark'}", "${partyCardClass(r.winnerParty)} winner-mark"),
    ("${partyCardClass(r.winnerParty)}${r.pollCount?'':' winner-mark'}", "${partyCardClass(r.winnerParty)} winner-mark"),
]
for old,new in repls:
    if old not in s:
        raise SystemExit('winner marker not found: '+old)
    s=s.replace(old,new,1)
p.write_text(s)

# Force browsers to fetch all three changed production assets.
p = Path('index.html')
s = p.read_text()
for filename in ['site-final.js','accepted-good.js','senate-error-history.js']:
    import re
    s,n=re.subn(filename.replace('.',r'\\.')+r'\\?v=[0-9-]+', filename+'?v=20260910-1852', s, count=1)
    if n!=1: raise SystemExit(f'index cache-bust marker not found for {filename}: {n}')
p.write_text(s)
print('patched Senate 51-49, Maine Collins call, rationale, and all winner checks')

from pathlib import Path
import re

# site-final.js: authoritative race calls and 50-50 balance
p=Path('site-final.js'); s=p.read_text()
old="if(stateData.TX&&stateData.TX.active){stateData.TX.rating='tossup';stateData.TX.predictionParty='Tossup';stateData.TX.prediction='Tossup';stateData.TX.notes='';for(const k of ['projectedWinner','predictionWinner','winner','callParty'])if(k in stateData.TX)stateData.TX[k]='Tossup';if('call' in stateData.TX)stateData.TX.call='Tossup';}"
new="if(stateData.TX&&stateData.TX.active){stateData.TX.rating='tilt-r';stateData.TX.predictionParty='Republican';stateData.TX.prediction='Tilt Republican';stateData.TX.notes='';for(const k of ['projectedWinner','predictionWinner','winner','callParty'])if(k in stateData.TX)stateData.TX[k]='Republican';if('call' in stateData.TX)stateData.TX.call='Tilt Republican';}"
if old not in s: raise SystemExit('site-final Texas block missing')
s=s.replace(old,new,1)
s=s.replace("const value=/^REPUBLICAN$/i.test(t)?'49':'50';","const value=/^REPUBLICAN$/i.test(t)?'50':'50';",1)
s=s.replace("if(nums[1]) nums[1].textContent='49';","if(nums[1]) nums[1].textContent='50';",1)
s=s.replace("if(/^Republicans?:\\s*\\d+$/i.test(t)) el.textContent=t.replace(/\\d+$/,'49');","if(/^Republicans?:\\s*\\d+$/i.test(t)) el.textContent=t.replace(/\\d+$/,'50');",1)
s=s.replace("if(/Republican/i.test(parent)) el.textContent='49 seats';","if(/Republican/i.test(parent)) el.textContent='50 seats';",1)
s=s.replace("if(kids[1]) kids[1].style.setProperty('width','49%','important');","if(kids[1]) kids[1].style.setProperty('width','50%','important');",1)
s=s.replace("if(kids[2]) kids[2].style.setProperty('width','1%','important');","if(kids[2]){kids[2].style.setProperty('width','0%','important');kids[2].style.setProperty('display','none','important');}",1)
p.write_text(s)

# senate-current-sync.js: keep Ohio blue, Texas red, stop continuous repainting
p=Path('senate-current-sync.js'); s=p.read_text()
needle="""      const oh=stateData.OH;
      if(oh){
        set(oh,'rating','tilt-d');set(oh,'predictionParty','Democratic');set(oh,'prediction','Tilt Democratic');set(oh,'notes','');set(oh,'updated','2026-09-13');
        for(const k of ['projectedWinner','predictionWinner','winner','callParty']) if(k in oh) set(oh,k,'Democratic');
        if('call' in oh) set(oh,'call','Tilt Democratic');
      }
      return changed;
"""
repl="""      const oh=stateData.OH;
      if(oh){
        set(oh,'rating','tilt-d');set(oh,'predictionParty','Democratic');set(oh,'prediction','Tilt Democratic');set(oh,'notes','');set(oh,'updated','2026-09-14');
        for(const k of ['projectedWinner','predictionWinner','winner','callParty']) if(k in oh) set(oh,k,'Democratic');
        if('call' in oh) set(oh,'call','Tilt Democratic');
      }
      const tx=stateData.TX;
      if(tx){
        set(tx,'rating','tilt-r');set(tx,'predictionParty','Republican');set(tx,'prediction','Tilt Republican');set(tx,'notes','');set(tx,'updated','2026-09-14');
        for(const k of ['projectedWinner','predictionWinner','winner','callParty']) if(k in tx) set(tx,k,'Republican');
        if('call' in tx) set(tx,'call','Tilt Republican');
      }
      return changed;
"""
if needle not in s: raise SystemExit('current-sync state block missing')
s=s.replace(needle,repl,1)
s=s.replace("if(n)n.textContent=/^REPUBLICAN$/i.test(t)?'49':'50';","if(n)n.textContent=/^REPUBLICAN$/i.test(t)?'50':'50';",1)
s=s.replace("if(/^0\\s+INDEPENDENT$/i.test(t)||/^0\\s+TOSSUP$/i.test(t))el.textContent='1 TOSSUP';","if(/^\\d+\\s+(?:INDEPENDENT|TOSSUPS?)$/i.test(t))el.textContent='0 TOSSUP';",1)
s=s.replace("if(r)r.style.setProperty('width','49%','important');","if(r)r.style.setProperty('width','50%','important');")
s=s.replace("if(y){y.style.setProperty('width','1%','important');y.style.setProperty('background',TOSSUP,'important');y.style.setProperty('display','block','important');}","if(y){y.style.setProperty('width','0%','important');y.style.setProperty('display','none','important');}")
s=s.replace("if(nums.length>=2){nums[0].textContent='50';nums[1].textContent='49';}","if(nums.length>=2){nums[0].textContent='50';nums[1].textContent='50';}",1)
s=s.replace("if(/^Republicans?:\\s*\\d+$/i.test(t))el.textContent=t.replace(/\\d+$/,'49');","if(/^Republicans?:\\s*\\d+$/i.test(t))el.textContent=t.replace(/\\d+$/,'50');",1)
s=s.replace("if(/^0\\s+TOSSUP$/i.test(t)||/^0\\s+INDEPENDENT$/i.test(t))el.textContent='1 TOSSUP';","if(/^\\d+\\s+(?:TOSSUPS?|INDEPENDENT)$/i.test(t))el.textContent='0 TOSSUP';",1)
s=s.replace("bar.setAttribute('aria-label','Senate prediction: 50 Democrats, 49 Republicans, and 1 tossup');","bar.setAttribute('aria-label','Senate prediction: 50 Democrats and 50 Republicans');",1)
oldnote="""    if(!card.querySelector('.will-tossup-count')){
      const note=card.querySelector('.majority-note')||card.querySelector('.senate-countdown')||bar;
      if(note){
        const s=document.createElement('div');s.className='will-tossup-count';s.textContent='1 TOSSUP';
        s.style.cssText='margin-top:7px;text-align:center;color:#b58a00;font:900 10px/1.2 Inter,system-ui,sans-serif;letter-spacing:1.2px';
        note.insertAdjacentElement('afterend',s);
      }
    }
"""
if oldnote in s: s=s.replace(oldnote,"    card.querySelectorAll('.will-tossup-count').forEach(el=>el.remove());\n",1)
s=s.replace("  setInterval(apply,1200);\n","")
s=s.replace("  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','style']});\n","")
s=s.replace("  window.addEventListener('pageshow',apply);window.addEventListener('resize',apply);","  document.addEventListener('click',e=>{if(e.target?.closest?.('#page-senate')){setTimeout(apply,0);setTimeout(apply,120);}},true);\n  window.addEventListener('pageshow',apply);window.addEventListener('resize',apply);",1)
p.write_text(s)

# senate-history-context.js: remove 500ms Texas tossup fight, set Texas tilt R
p=Path('senate-history-context.js'); s=p.read_text()
s=s.replace("  const TOSSUP='#f2c94c';","  const TOSSUP='#f2c94c';\n  const TILT_RED='#f8c6ca',TILT_RED_BORDER='#f1b8bd',RED_DARK='#7f2330';",1)
old="set('rating','tossup');set('predictionParty','Tossup');set('prediction','Tossup');set('notes','');set('updated','2026-09-12');\n      for(const k of ['projectedWinner','predictionWinner','winner','callParty'])if(k in tx)set(k,'Tossup');\n      if('call' in tx)set('call','Tossup');"
new="set('rating','tilt-r');set('predictionParty','Republican');set('prediction','Tilt Republican');set('notes','');set('updated','2026-09-14');\n      for(const k of ['projectedWinner','predictionWinner','winner','callParty'])if(k in tx)set(k,'Republican');\n      if('call' in tx)set('call','Tilt Republican');"
if old not in s: raise SystemExit('history Texas block missing')
s=s.replace(old,new,1)
s=s.replace("el.style.setProperty('fill',TOSSUP,'important');","el.style.setProperty('fill',TILT_RED,'important');",1)
s=s.replace("el.style.setProperty('background',TOSSUP,'important');","el.style.setProperty('background',TILT_RED,'important');",1)
s=s.replace("el.textContent='Prediction: Toss-up';","el.textContent='Prediction: Tilt Republican';",1)
s=s.replace("card.style.setProperty('background',TOSSUP,'important');","card.style.setProperty('background',TILT_RED,'important');",1)
s=s.replace("card.style.setProperty('border-color','#d9ad22','important');","card.style.setProperty('border-color',TILT_RED_BORDER,'important');",1)
s=s.replace("card.querySelectorAll('*').forEach(el=>el.style.setProperty('color','#fff','important'));","card.style.setProperty('color',RED_DARK,'important');\n      card.querySelectorAll('*').forEach(el=>el.style.setProperty('color',RED_DARK,'important'));",1)
s=s.replace("if(party)party.textContent='Tossup';","if(party)party.textContent='Republican';",1)
s=s.replace("if(rating)rating.textContent='TOSSUP';","if(rating)rating.textContent='TILT REPUBLICAN';",1)
s=s.replace("if(copy)copy.textContent='Tossup';","if(copy)copy.textContent='Tilt Republican';",1)
s=s.replace("if(n)n.textContent=/^REPUBLICAN$/i.test(t)?'49':'50';","if(n)n.textContent=/^REPUBLICAN$/i.test(t)?'50':'50';",1)
s=s.replace("if(/^\\d+\\s+(?:INDEPENDENT|TOSSUPS?)$/i.test(t))el.textContent='1 TOSSUP';","if(/^\\d+\\s+(?:INDEPENDENT|TOSSUPS?)$/i.test(t))el.textContent='0 TOSSUP';",1)
s=s.replace("if(r)r.style.setProperty('width','49%','important');","if(r)r.style.setProperty('width','50%','important');")
s=s.replace("if(y){y.style.setProperty('width','1%','important');y.style.setProperty('background',TOSSUP,'important');y.style.setProperty('display','block','important');}","if(y){y.style.setProperty('width','0%','important');y.style.setProperty('display','none','important');}")
s=s.replace("if(nums.length>=2){nums[0].textContent='50';nums[1].textContent='49';}","if(nums.length>=2){nums[0].textContent='50';nums[1].textContent='50';}",1)
s=s.replace("if(/^Republicans?:\\s*\\d+$/i.test(t))el.textContent=t.replace(/\\d+$/,'49');","if(/^Republicans?:\\s*\\d+$/i.test(t))el.textContent=t.replace(/\\d+$/,'50');",1)
s=s.replace("bar.setAttribute('aria-label','Senate prediction: 50 Democrats, 49 Republicans, and 1 tossup');","bar.setAttribute('aria-label','Senate prediction: 50 Democrats and 50 Republicans');",1)
note_block="""    let note=card.querySelector('.will-tossup-count');
    if(!note){
      note=document.createElement('div');note.className='will-tossup-count';
      const anchor=card.querySelector('.majority-note')||card.querySelector('.senate-countdown')||bar;
      if(anchor)anchor.insertAdjacentElement('afterend',note);
    }
    if(note){note.textContent='1 TOSSUP';note.style.cssText='margin-top:7px;text-align:center;color:#b58a00;font:900 10px/1.2 Inter,system-ui,sans-serif;letter-spacing:1.2px';}
"""
if note_block in s: s=s.replace(note_block,"    card.querySelectorAll('.will-tossup-count').forEach(el=>el.remove());\n",1)
s=s.replace("  setInterval(apply,500);\n","")
s=s.replace("  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','style']});\n","")
s=s.replace("  window.addEventListener('pageshow',apply);window.addEventListener('resize',apply);","  document.addEventListener('click',e=>{if(e.target?.closest?.('#page-senate')){setTimeout(apply,0);setTimeout(apply,120);}},true);\n  window.addEventListener('pageshow',apply);window.addEventListener('resize',apply);",1)
p.write_text(s)

# index: initial TX render + cache bust actual appended loaders
p=Path('index.html'); s=p.read_text()
oldtx="if(stateData.TX&&stateData.TX.active){stateData.TX.rating='tossup';stateData.TX.predictionParty='Tossup';stateData.TX.callParty='Tossup';stateData.TX.prediction='Tossup';}"
newtx="if(stateData.TX&&stateData.TX.active){stateData.TX.rating='tilt-r';stateData.TX.predictionParty='Republican';stateData.TX.callParty='Republican';stateData.TX.prediction='Tilt Republican';}"
if oldtx not in s: raise SystemExit('index inline Texas block missing')
s=s.replace(oldtx,newtx,1)
if "TX:'Tossup'" not in s: raise SystemExit('index Texas call override missing')
s=s.replace("TX:'Tossup'","TX:'Tilt Republican'",1)
patterns={
 'site-final':r"(h=h\.replace\('</body>','<script src=\"/site-final\.js\?v=)[^\"]+",
 'senate-current-sync':r"(h=h\.replace\('</body>','<script src=\"/senate-current-sync\.js\?v=)[^\"]+",
 'senate-history-context':r"(h=h\.replace\('</body>','<script src=\"/senate-history-context\.js\?v=)[^\"]+",
}
for name,pat in patterns.items():
    s,n=re.subn(pat,lambda m:m.group(1)+'20260914-1826',s,count=1)
    if n!=1: raise SystemExit(f'cache bust failed for {name}: {n}')
p.write_text(s)

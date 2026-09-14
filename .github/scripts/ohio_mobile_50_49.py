from pathlib import Path
import re


def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit(f'{label}: pattern not found')
    return text.replace(old, new, 1)

# site-final.js: align early override and counts so later scripts do not fight it.
p = Path('site-final.js')
s = p.read_text()
s = replace_once(s,
"      if(stateData.NH&&stateData.NH.active) stateData.NH.rating='tilt-d';\n",
"      if(stateData.NH&&stateData.NH.active) stateData.NH.rating='tilt-d';\n      if(stateData.OH&&stateData.OH.active){stateData.OH.rating='tilt-d';stateData.OH.predictionParty='Democratic';stateData.OH.prediction='Tilt Democratic';stateData.OH.notes='';for(const k of ['projectedWinner','predictionWinner','winner','callParty'])if(k in stateData.OH)stateData.OH[k]='Democratic';if('call' in stateData.OH)stateData.OH.call='Tilt Democratic';}\n      if(stateData.TX&&stateData.TX.active){stateData.TX.rating='tossup';stateData.TX.predictionParty='Tossup';stateData.TX.prediction='Tossup';stateData.TX.notes='';for(const k of ['projectedWinner','predictionWinner','winner','callParty'])if(k in stateData.TX)stateData.TX[k]='Tossup';if('call' in stateData.TX)stateData.TX.call='Tossup';}\n",
'site-final data')
s = replace_once(s, "const value=/^REPUBLICAN$/i.test(t)?'51':'49';", "const value=/^REPUBLICAN$/i.test(t)?'49':'50';", 'site-final balance')
s = replace_once(s, "if(nums[0]) nums[0].textContent='49';\n      if(nums[1]) nums[1].textContent='51';", "if(nums[0]) nums[0].textContent='50';\n      if(nums[1]) nums[1].textContent='49';", 'site-final home nums')
s = replace_once(s, "if(/^Democrats?:\\s*50$/i.test(t)) el.textContent=t.replace(/50$/,'49');\n        if(/^Republicans?:\\s*50$/i.test(t)) el.textContent=t.replace(/50$/,'51');", "if(/^Democrats?:\\s*\\d+$/i.test(t)) el.textContent=t.replace(/\\d+$/,'50');\n        if(/^Republicans?:\\s*\\d+$/i.test(t)) el.textContent=t.replace(/\\d+$/,'49');", 'site-final home text')
s = replace_once(s, "if(/Democrat/i.test(parent)) el.textContent='49 seats';\n          if(/Republican/i.test(parent)) el.textContent='51 seats';", "if(/Democrat/i.test(parent)) el.textContent='50 seats';\n          if(/Republican/i.test(parent)) el.textContent='49 seats';", 'site-final seats')
s = replace_once(s, "if(kids[0]) kids[0].style.setProperty('width','49%','important');\n        if(kids[1]) kids[1].style.setProperty('width','51%','important');", "if(kids[0]) kids[0].style.setProperty('width','50%','important');\n        if(kids[1]) kids[1].style.setProperty('width','49%','important');\n        if(kids[2]) kids[2].style.setProperty('width','1%','important');", 'site-final home bar')
p.write_text(s)

# senate-current-sync.js: Ohio Tilt Democratic, light blue call box, no explanation; 50D/49R/1 tossup.
p = Path('senate-current-sync.js')
s = p.read_text()
s = replace_once(s, "const TOSSUP='#f2c94c';", "const TOSSUP='#f2c94c';\n  const TILT_BLUE='#d3e2f7';\n  const TILT_BLUE_BORDER='#a9c5ed';\n  const BLUE_DARK='#173f87';", 'current-sync colors')
s = replace_once(s,
"      const oh=stateData.OH;\n      if(oh){\n        set(oh,'rating','tossup');set(oh,'predictionParty','Tossup');set(oh,'prediction','Tossup');set(oh,'notes','');set(oh,'updated','2026-09-11');\n        for(const k of ['projectedWinner','predictionWinner','winner','callParty']) if(k in oh) set(oh,k,'Tossup');\n        if('call' in oh) set(oh,'call','Tossup');\n      }\n",
"      const oh=stateData.OH;\n      if(oh){\n        set(oh,'rating','tilt-d');set(oh,'predictionParty','Democratic');set(oh,'prediction','Tilt Democratic');set(oh,'notes','');set(oh,'updated','2026-09-13');\n        for(const k of ['projectedWinner','predictionWinner','winner','callParty']) if(k in oh) set(oh,k,'Democratic');\n        if('call' in oh) set(oh,'call','Tilt Democratic');\n      }\n",
'current-sync Ohio data')
# Only the first TOSSUP visual replacements belong to Ohio; Texas is controlled elsewhere.
s = replace_once(s, "el.style.setProperty('fill',TOSSUP,'important');", "el.style.setProperty('fill',TILT_BLUE,'important');", 'Ohio fill')
s = replace_once(s, "el.style.setProperty('background',TOSSUP,'important');", "el.style.setProperty('background',TILT_BLUE,'important');", 'Ohio background')
s = replace_once(s, "if(/^Prediction:\\s*/i.test(t))el.textContent='Prediction: Toss-up';", "if(/^Prediction:\\s*/i.test(t))el.textContent='Prediction: Tilt Democratic';", 'Ohio prediction label')
s = replace_once(s, "if(/^(Republican|Democrat(?:ic)?|TILT REPUBLICAN|LEAN REPUBLICAN|LIKELY REPUBLICAN|SOLID REPUBLICAN)$/i.test(t)){\n          const nearCall=norm(el.parentElement?.textContent||'');\n          if(/WILL[’']S CALL|MY PREDICTION/i.test(nearCall))el.textContent='Tossup';\n        }", "if(/^(Republican|Democrat(?:ic)?|Tossup|TILT REPUBLICAN|LEAN REPUBLICAN|LIKELY REPUBLICAN|SOLID REPUBLICAN|TILT DEMOCRAT(?:IC)?)$/i.test(t)){\n          const nearCall=norm(el.parentElement?.textContent||'');\n          if(/WILL[’']S CALL|MY PREDICTION/i.test(nearCall))el.textContent=/TILT/i.test(t)?'TILT DEMOCRATIC':'Democratic';\n        }", 'Ohio text')
s = replace_once(s, "card.style.setProperty('background',TOSSUP,'important');\n          card.style.setProperty('border-color','#d9ad22','important');\n          card.style.setProperty('color','#fff','important');\n          card.querySelectorAll('*').forEach(el=>el.style.setProperty('color','#fff','important'));", "card.style.setProperty('background',TILT_BLUE,'important');\n          card.style.setProperty('background-image','none','important');\n          card.style.setProperty('border-color',TILT_BLUE_BORDER,'important');\n          card.style.setProperty('color',BLUE_DARK,'important');\n          card.querySelectorAll('*').forEach(el=>el.style.setProperty('color',BLUE_DARK,'important'));", 'Ohio call box')
s = replace_once(s, "if(party)party.textContent='Tossup';", "if(party)party.textContent='Democratic';", 'Ohio party')
s = replace_once(s, "if(rating)rating.textContent='TOSSUP';", "if(rating)rating.textContent='TILT DEMOCRATIC';", 'Ohio rating')
s = replace_once(s, "const copy=card.querySelector('.prediction-copy');if(copy)copy.textContent='Tossup';", "const copy=card.querySelector('.prediction-copy');if(copy)copy.textContent='Tilt Democratic';", 'Ohio copy')
s = replace_once(s, "if(n)n.textContent=/^REPUBLICAN$/i.test(t)?'50':'49';", "if(n)n.textContent=/^REPUBLICAN$/i.test(t)?'49':'50';", 'current-sync totals')
s = replace_once(s, "if(d)d.style.setProperty('width','49%','important');\n      if(r)r.style.setProperty('width','50%','important');", "if(d)d.style.setProperty('width','50%','important');\n      if(r)r.style.setProperty('width','49%','important');", 'current-sync Senate bar')
s = replace_once(s, "if(nums.length>=2){nums[0].textContent='49';nums[1].textContent='50';}", "if(nums.length>=2){nums[0].textContent='50';nums[1].textContent='49';}", 'current-sync home nums')
s = replace_once(s, "if(/^Democrats?:\\s*50$/i.test(t))el.textContent=t.replace(/50$/,'49');\n      if(/^Republicans?:\\s*51$/i.test(t))el.textContent=t.replace(/51$/,'50');", "if(/^Democrats?:\\s*\\d+$/i.test(t))el.textContent=t.replace(/\\d+$/,'50');\n      if(/^Republicans?:\\s*\\d+$/i.test(t))el.textContent=t.replace(/\\d+$/,'49');", 'current-sync home text')
s = replace_once(s, "if(d)d.style.setProperty('width','49%','important');\n      if(r)r.style.setProperty('width','50%','important');", "if(d)d.style.setProperty('width','50%','important');\n      if(r)r.style.setProperty('width','49%','important');", 'current-sync home bar')
s = s.replace("bar.setAttribute('aria-label','Senate prediction: 49 Democrats, 50 Republicans, and 1 tossup');", "bar.setAttribute('aria-label','Senate prediction: 50 Democrats, 49 Republicans, and 1 tossup');")
p.write_text(s)

# senate-history-context.js is loaded later, so make its totals agree while leaving Texas tossup.
p = Path('senate-history-context.js')
s = p.read_text()
s = replace_once(s, "if(n)n.textContent='49';", "if(n)n.textContent=/^REPUBLICAN$/i.test(t)?'49':'50';", 'history totals')
s = replace_once(s, "if(/^\\d+\\s+(?:INDEPENDENT|TOSSUPS?)$/i.test(t))el.textContent='2 TOSSUPS';", "if(/^\\d+\\s+(?:INDEPENDENT|TOSSUPS?)$/i.test(t))el.textContent='1 TOSSUP';", 'history tossup text')
s = replace_once(s, "if(d)d.style.setProperty('width','49%','important');\n      if(r)r.style.setProperty('width','49%','important');", "if(d)d.style.setProperty('width','50%','important');\n      if(r)r.style.setProperty('width','49%','important');", 'history Senate bar')
s = replace_once(s, "if(y){y.style.setProperty('width','2%','important');", "if(y){y.style.setProperty('width','1%','important');", 'history Senate toss width')
s = replace_once(s, "if(nums.length>=2){nums[0].textContent='49';nums[1].textContent='49';}", "if(nums.length>=2){nums[0].textContent='50';nums[1].textContent='49';}", 'history home nums')
s = replace_once(s, "if(/^Democrats?:\\s*\\d+$/i.test(t))el.textContent=t.replace(/\\d+$/,'49');\n      if(/^Republicans?:\\s*\\d+$/i.test(t))el.textContent=t.replace(/\\d+$/,'49');\n      if(/^\\d+\\s+(?:INDEPENDENT|TOSSUPS?)$/i.test(t))el.textContent='2 TOSSUPS';", "if(/^Democrats?:\\s*\\d+$/i.test(t))el.textContent=t.replace(/\\d+$/,'50');\n      if(/^Republicans?:\\s*\\d+$/i.test(t))el.textContent=t.replace(/\\d+$/,'49');\n      if(/^\\d+\\s+(?:INDEPENDENT|TOSSUPS?)$/i.test(t))el.textContent='1 TOSSUP';", 'history home text')
s = replace_once(s, "if(d)d.style.setProperty('width','49%','important');\n      if(r)r.style.setProperty('width','49%','important');", "if(d)d.style.setProperty('width','50%','important');\n      if(r)r.style.setProperty('width','49%','important');", 'history home bar')
s = replace_once(s, "if(y){y.style.setProperty('width','2%','important');", "if(y){y.style.setProperty('width','1%','important');", 'history home toss width')
s = s.replace("bar.setAttribute('aria-label','Senate prediction: 49 Democrats, 49 Republicans, and 2 tossups');", "bar.setAttribute('aria-label','Senate prediction: 50 Democrats, 49 Republicans, and 1 tossup');")
s = s.replace("if(note){note.textContent='2 TOSSUPS';", "if(note){note.textContent='1 TOSSUP';")
p.write_text(s)

# Cache-bust all three scripts so iPhone/Safari does not keep the previous copies.
p = Path('index.html')
s = p.read_text()
for name in ('site-final.js','senate-current-sync.js','senate-history-context.js'):
    s, n = re.subn(rf'{re.escape(name)}\\?v=[0-9A-Za-z._-]+', f'{name}?v=20260913-2354', s)
    if n < 1:
        raise SystemExit(f'index loader missing for {name}')
p.write_text(s)

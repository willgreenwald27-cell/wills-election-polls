from pathlib import Path
import re

def must(text, old, new, label):
    if old not in text:
        raise SystemExit('missing '+label)
    return text.replace(old,new)

p=Path('site-final.js'); s=p.read_text()
s=must(s,"me.rating='tilt-r';\n        me.predictionParty='Republican';\n        me.prediction='Collins +1.3%';","me.rating='tilt-d';\n        me.predictionParty='Democrat';\n        me.prediction='Jackson +0.4%';",'site-final Maine rating')
s=s.replace("if(k in me) me[k]='Republican';","if(k in me) me[k]='Democrat';")
s=s.replace("me.call='Collins +1.3%'","me.call='Jackson +0.4%'")
s=s.replace("me.candidate1Odds='51'","me.candidate1Odds='48'").replace("me.candidate2Odds='51'","me.candidate2Odds='48'")
s=s.replace("me.candidate1Odds='49'","me.candidate1Odds='52'").replace("me.candidate2Odds='49'","me.candidate2Odds='52'")
s=s.replace("n.textContent=/^REPUBLICAN$/i.test(t)?'51':'49'","n.textContent='50'")
s=s.replace("'#f8c6ca'","'#d3e2f7'")
s=s.replace("Prediction: Tilt Republican","Prediction: Tilt Democratic")
s=s.replace("el.textContent='Collins +1.3%'","el.textContent='Jackson +0.4%'")
s=s.replace("Susan Collins: 51%","Susan Collins: 48%").replace("Troy Jackson: 49%","Troy Jackson: 52%")
s=s.replace("p.textContent='Republican';p.style.setProperty('color',RED,'important');","p.textContent='Democrat';p.style.setProperty('color',BLUE,'important');")
s=s.replace("copy.textContent='Collins +1.3%'","copy.textContent='Jackson +0.4%'")
s=s.replace("if(p) p.textContent='Republican';","if(p) p.textContent='Democrat';")
s=s.replace("n==='Susan Collins'?51:n==='Troy Jackson'?49:null","n==='Susan Collins'?48:n==='Troy Jackson'?52:null")
p.write_text(s)

p=Path('accepted-good.js'); s=p.read_text()
s=must(s,"s.rating='tilt-r'; s.predictionParty='Republican'; s.prediction='Collins +1.3%'; s.updated='2026-09-07';","s.rating='tilt-d'; s.predictionParty='Democrat'; s.prediction='Jackson +0.4%'; s.updated='2026-09-07';",'accepted Maine rating')
s=s.replace("if(k in s) s[k]='Republican';","if(k in s) s[k]='Democrat';")
s=s.replace("s.call='Collins +1.3%'","s.call='Jackson +0.4%'")
s=s.replace("s.candidate1Odds='51'","s.candidate1Odds='48'").replace("s.candidate2Odds='51'","s.candidate2Odds='48'")
s=s.replace("s.candidate1Odds='49'","s.candidate1Odds='52'").replace("s.candidate2Odds='49'","s.candidate2Odds='52'")
s=s.replace("'#f8c6ca'","'#d3e2f7'")
s=s.replace("n.textContent=/^REPUBLICAN$/i.test(t)?'51':'49'","n.textContent='50'")
s=s.replace("Prediction: Tilt Republican","Prediction: Tilt Democratic")
s=s.replace("el.textContent='Collins +1.3%'","el.textContent='Jackson +0.4%'")
s=s.replace("Susan Collins: 51%","Susan Collins: 48%").replace("Troy Jackson: 49%","Troy Jackson: 52%")
s=s.replace("copy.textContent='Collins +1.3%'","copy.textContent='Jackson +0.4%'")
s=s.replace("p.textContent='Republican';p.style.setProperty('color',REP,'important');","p.textContent='Democrat';p.style.setProperty('color',DEM,'important');")
s=s.replace("n==='Susan Collins'?51:n==='Troy Jackson'?49:null","n==='Susan Collins'?48:n==='Troy Jackson'?52:null")
p.write_text(s)

p=Path('safe-patches.js'); s=p.read_text()
s=must(s,"s.rating='tilt-r';s.predictionParty='Republican';s.prediction='Collins +1.3%';s.updated='2026-09-07';","s.rating='tilt-d';s.predictionParty='Democrat';s.prediction='Jackson +0.4%';s.updated='2026-09-07';",'safe Maine rating')
s=s.replace("if(k in s)s[k]='Republican';","if(k in s)s[k]='Democrat';")
s=s.replace("s.call='Collins +1.3%'","s.call='Jackson +0.4%'")
s=s.replace("s.candidate1Odds='51'","s.candidate1Odds='48'").replace("s.candidate2Odds='51'","s.candidate2Odds='48'")
s=s.replace("s.candidate1Odds='49'","s.candidate1Odds='52'").replace("s.candidate2Odds='49'","s.candidate2Odds='52'")
s=s.replace("'#f8c6ca'","'#d3e2f7'")
s=s.replace("if(t==='Democrat'||t==='Democratic'){if(/WILL'S CALL|MY PREDICTION|MY PROJECTED WINNER/i.test(norm(el.parentElement?.textContent)||'')){el.textContent='Republican';el.style.setProperty('color',REP,'important');}}","if(t==='Republican'){if(/WILL'S CALL|MY PREDICTION|MY PROJECTED WINNER/i.test(norm(el.parentElement?.textContent)||'')){el.textContent='Democrat';el.style.setProperty('color',DEM,'important');}}")
s=s.replace("Troy Jackson: 49%","Troy Jackson: 52%").replace("Susan Collins: 51%","Susan Collins: 48%")
s=s.replace("if(t==='Jackson +0.4%'||t==='Jackson +0.4')el.textContent='Collins +1.3%';","if(t==='Collins +1.3%'||t==='Collins +1.3')el.textContent='Jackson +0.4%';")
s=s.replace("Prediction: Tilt Republican","Prediction: Tilt Democratic")
s=s.replace("copy.textContent='Collins +1.3%'","copy.textContent='Jackson +0.4%'")
s=s.replace("n1==='Susan Collins'?51:n1==='Troy Jackson'?49:null","n1==='Susan Collins'?48:n1==='Troy Jackson'?52:null")
s=s.replace("n2==='Susan Collins'?51:n2==='Troy Jackson'?49:null","n2==='Susan Collins'?48:n2==='Troy Jackson'?52:null")
p.write_text(s)

p=Path('senate-julsep-archive.js'); s=p.read_text()
old="""      const me=stateData.ME;
      if(me.rating==='tilt-r') return;
      me.rating='tilt-r';
      if(typeof renderSenate==='function'&&!renderingMaine){"""
new="""      const me=stateData.ME;
      let changed=false;
      const set=(k,v)=>{if(String(me[k]===undefined?'':me[k])!==String(v)){me[k]=v;changed=true;}};
      set('rating','tilt-d'); set('predictionParty','Democrat'); set('prediction','Jackson +0.4%'); set('updated','2026-09-07');
      for(const k of ['projectedWinner','predictionWinner','winner','callParty']) if(k in me) set(k,'Democrat');
      if('call' in me) set('call','Jackson +0.4%');
      if(norm(me.candidate1)==='Susan Collins') set('candidate1Odds','48');
      if(norm(me.candidate2)==='Susan Collins') set('candidate2Odds','48');
      if(norm(me.candidate1)==='Troy Jackson') set('candidate1Odds','52');
      if(norm(me.candidate2)==='Troy Jackson') set('candidate2Odds','52');
      if(changed&&typeof renderSenate==='function'&&!renderingMaine){"""
s=must(s,old,new,'archive Maine function')
s=s.replace("'#f8c6ca'","'#d3e2f7'")
s=s.replace("Prediction: Tilt Republican","Prediction: Tilt Democratic")
s=s.replace("if(t==='Jackson +0.4%'||t==='No prediction text entered yet.') el.textContent='Tilt Republican';","if(t==='Collins +1.3%'||t==='No prediction text entered yet.') el.textContent='Jackson +0.4%';")
s=s.replace("value.textContent='Republican';","value.textContent='Democrat';")
p.write_text(s)

p=Path('index.html'); s=p.read_text()
for fname in ['site-final.js','accepted-good.js','safe-patches.js','senate-julsep-archive.js']:
    s=re.sub(re.escape(fname)+r'\?v=[0-9-]+',fname+'?v=20260908-1245',s)
p.write_text(s)

sf=Path('site-final.js').read_text(); ag=Path('accepted-good.js').read_text(); sp=Path('safe-patches.js').read_text(); ar=Path('senate-julsep-archive.js').read_text()
assert "me.rating='tilt-d'" in sf and "Troy Jackson: 52%" in sf and "Susan Collins: 48%" in sf and "n.textContent='50'" in sf
assert "s.rating='tilt-d'" in ag and "Troy Jackson: 52%" in ag and "Susan Collins: 48%" in ag
assert "s.rating='tilt-d'" in sp and "Troy Jackson: 52%" in sp and "Susan Collins: 48%" in sp
assert "set('rating','tilt-d')" in ar

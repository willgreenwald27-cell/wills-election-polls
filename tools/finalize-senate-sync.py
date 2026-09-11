from pathlib import Path
import csv, re

STAMP='20260910-1922'
WHY="Why: Final polling margins underestimated Susan Collins by more than 5 points in each of her last three Senate elections (2008, 2014, and 2020)."

def sub1(path, pattern, repl, flags=0, label=None):
    p=Path(path); s=p.read_text()
    s2,n=re.subn(pattern,repl,s,count=1,flags=flags)
    if n!=1:
        raise SystemExit(f'{path}: expected one replacement for {label or pattern[:60]!r}, got {n}')
    p.write_text(s2)

def replace1(path, old, new, label=None):
    p=Path(path); s=p.read_text()
    if old not in s:
        raise SystemExit(f'{path}: marker missing for {label or old[:80]}')
    p.write_text(s.replace(old,new,1))

# Audited averages: simple arithmetic means of every unique exact-matchup poll displayed on the site.
avg={}
with open('poll-average-summary.csv',newline='') as f:
    for r in csv.DictReader(f):
        avg[r['abbr']]={
            'c1':r['candidate1'],'a1':r['candidate1_avg'],
            'c2':r['candidate2'],'a2':r['candidate2_avg'],
            'n':int(r['poll_count'])
        }
if len(avg)!=19:
    raise SystemExit(f'Expected 19 audited Senate matchups, found {len(avg)}')
if avg['TX']['a1']!='47.8' or avg['TX']['a2']!='44.9' or avg['ID']['a1']!='34.0' or avg['ID']['a2']!='33.5':
    raise SystemExit('Refined audit values do not match expected deduped site poll set')

# Keep the summary data file aligned with the map popup values.
p=Path('senate-state-summary.csv')
with p.open(newline='') as f:
    rows=list(csv.DictReader(f)); fields=list(rows[0].keys())
for r in rows:
    if r['abbr'] in avg:
        r['candidate1Poll']=avg[r['abbr']]['a1']
        r['candidate2Poll']=avg[r['abbr']]['a2']
        r['updated']='2026-09-10'
    if r['abbr']=='ME':
        r['rating']='tilt-r'; r['prediction']='Collins +1.3%'; r['predictionParty']='Republican'; r['updated']='2026-09-10'
with p.open('w',newline='') as f:
    w=csv.DictWriter(f,fieldnames=fields); w.writeheader(); w.writerows(rows)

# Stop the older July–September archive helper from reverting Maine to blue/Democratic.
path='senate-julsep-archive.js'
replace1(path,
"set('rating','tilt-d'); set('predictionParty','Democrat'); set('prediction','Jackson +0.4%'); set('updated','2026-09-08');",
"set('rating','tilt-r'); set('predictionParty','Republican'); set('prediction','Collins +1.3%'); set('notes','"+WHY.replace("'","\\'")+"'); set('updated','2026-09-10');",
'Maine archive call')
replace1(path,"for(const k of ['projectedWinner','predictionWinner','winner','callParty']) if(k in me) set(k,'Democrat');","for(const k of ['projectedWinner','predictionWinner','winner','callParty']) if(k in me) set(k,'Republican');",'Maine archive winner fields')
replace1(path,"if('call' in me) set('call','Jackson +0.4%');","if('call' in me) set('call','Collins +1.3%');",'Maine archive call text')
replace1(path,"el.style.setProperty('fill','#d3e2f7','important');","el.style.setProperty('fill','#f8c6ca','important');",'Maine archive map fill')
replace1(path,"if(/^Prediction:\\s*/i.test(t)) el.textContent='Prediction: Tilt Democratic';","if(/^Prediction:\\s*/i.test(t)) el.textContent='Prediction: Tilt Republican';",'Maine visible rating')
replace1(path,"if(t==='Collins +1.3%'||t==='No prediction text entered yet.') el.textContent='Jackson +0.4%';","if(t==='Jackson +0.4%'||t==='No prediction text entered yet.') el.textContent='Collins +1.3%';",'Maine visible call')
replace1(path,"if(value) value.textContent='Democrat';","if(value) value.textContent='Republican';",'Maine visible projected winner')
replace1(path,"setPoll(1,'el-sayed','46.9'); setPoll(2,'el-sayed','46.9');","setPoll(1,'el-sayed','45.4'); setPoll(2,'el-sayed','45.4');",'Michigan audited average D')
replace1(path,"setPoll(1,'rogers','44.6'); setPoll(2,'rogers','44.6');","setPoll(1,'rogers','44.5'); setPoll(2,'rogers','44.5');",'Michigan audited average R')

# Update the repeated Sep. 9/10 average enforcers to the same audited values.
path='sep9-polls-update.js'
for old,new,label in [
("changed=setCandidatePoll('MI','el-sayed','46.6')||changed;","changed=setCandidatePoll('MI','el-sayed','45.4')||changed;",'MI D'),
("changed=setCandidatePoll('MI','rogers','44.7')||changed;","changed=setCandidatePoll('MI','rogers','44.5')||changed;",'MI R'),
("changed=setCandidatePoll('ME','jackson','48.3')||changed;","changed=setCandidatePoll('ME','jackson','47.7')||changed;",'ME D'),
("changed=setCandidatePoll('ME','collins','46.0')||changed;","changed=setCandidatePoll('ME','collins','44.2')||changed;",'ME R'),
("changed=setCandidatePoll('TX','talarico','47.3')||changed;","changed=setCandidatePoll('TX','talarico','47.8')||changed;",'TX D'),
("changed=setCandidatePoll('TX','paxton','44.9')||changed;","changed=setCandidatePoll('TX','paxton','44.9')||changed;",'TX R'),
("changed=setCandidatePoll('NC','cooper','50.9')||changed;","changed=setCandidatePoll('NC','cooper','50.4')||changed;",'NC D'),
("changed=setCandidatePoll('NC','whatley','42.9')||changed;","changed=setCandidatePoll('NC','whatley','40.7')||changed;",'NC R'),
]:
    if old!=new: replace1(path,old,new,'sep9 '+label)
# Home card and bar: 49 Democratic, 51 Republican.
replace1(path,"#page-home #homeForecastSplit .senate-bar .dem{width:50%!important;background:#2763b8!important}.senate-bar .rep{width:50%!important;background:#bd2937!important}","#page-home #homeForecastSplit .senate-bar .dem{width:49%!important;background:#2763b8!important}.senate-bar .rep{width:51%!important;background:#bd2937!important}",'sep9 home bar')
replace1(path,'<div class="party-block"><div class="party-label dem">Democrats</div><div class="party-number dem">50</div></div>','<div class="party-block"><div class="party-label dem">Democrats</div><div class="party-number dem">49</div></div>','sep9 home D count')
replace1(path,'<div class="party-block"><div class="party-label rep">Republicans</div><div class="party-number rep">50</div></div>','<div class="party-block"><div class="party-label rep">Republicans</div><div class="party-number rep">51</div></div>','sep9 home R count')
replace1(path,'aria-label="Senate prediction: 50 Democrats and 50 Republicans"','aria-label="Senate prediction: 49 Democrats and 51 Republicans"','sep9 home aria')

path='sep10-polls-update.js'
sub1(path,r"const AVG=\{\s*TX:\{talarico:'[^']+',paxton:'[^']+'\},\s*ME:\{jackson:'[^']+',collins:'[^']+'\},\s*NC:\{cooper:'[^']+',whatley:'[^']+'\}\s*\};",
"const AVG={\n    TX:{talarico:'47.8',paxton:'44.9'},\n    ME:{jackson:'47.7',collins:'44.2'},\n    NC:{cooper:'50.4',whatley:'40.7'}\n  };",re.S,'sep10 averages')

path='senate-color-polish.js'
replace1(path,"if(name.includes('talarico')&&String(s[key])!=='47.3'){s[key]='47.3';changed=true;}","if(name.includes('talarico')&&String(s[key])!=='47.8'){s[key]='47.8';changed=true;}",'color polish TX D')
# Paxton 44.9 is already correct; leave it.
replace1(path,"const dem=senate?'50':'228', rep=senate?'50':'207';","const dem=senate?'49':'228', rep=senate?'51':'207';",'final home Senate counts')
replace1(path,"const demW=senate?'50%':'52.4138%', repW=senate?'50%':'47.5862%';","const demW=senate?'49%':'52.4138%', repW=senate?'51%':'47.5862%';",'final home Senate widths')

path='sept9-final-ui.js'
replace1(path,"if(name.includes('talarico')&&String(s[key])!=='47.3'){s[key]='47.3';changed=true;}","if(name.includes('talarico')&&String(s[key])!=='47.8'){s[key]='47.8';changed=true;}",'sept9 final TX D')
# Paxton remains 44.9.

# Remove only the redundant bottom prompt on each immersive state card.
path='senate-error-history.js'
replace1(path,'<div class="ipe-shock-foot"><small>Click to open the full state history</small><em>${avg===null?\'—\':avg.toFixed(1)+\' pts avg\'}</em></div>','<div class="ipe-shock-foot"><em>${avg===null?\'—\':avg.toFixed(1)+\' pts avg\'}</em></div>','remove bottom click prompt')

# site-final dynamically loads sep10; make sure browsers receive the audited copy.
path='site-final.js'
sub1(path,r"/sep10-polls-update\.js\?v=[0-9-]+",f"/sep10-polls-update.js?v={STAMP}",label='sep10 cache version')

# Add a final authoritative sync layer. It runs after all existing page scripts and
# keeps every popup aligned to the averages computed from the site's own displayed polls.
avg_js=[]
for ab,v in avg.items():
    def last(n): return re.sub(r'[^a-z0-9-]+','',n.lower().split()[-1])
    avg_js.append(f"    {ab}:{{'{last(v['c1'])}':'{v['a1']}','{last(v['c2'])}':'{v['a2']}'}}")
avg_blob=',\n'.join(avg_js)
sync=f"""(()=>{{
  'use strict';
  const AVG={{
{avg_blob}
  }};
  const MAINE_NOTE={WHY!r};
  const RED_LIGHT='#f8c6ca';
  let rendering=false,queued=false;
  const norm=v=>String(v||'').replace(/\\s+/g,' ').trim();
  const last=n=>{{const p=norm(n).toLowerCase().split(/\\s+/);return (p[p.length-1]||'').replace(/[^a-z0-9-]/g,'');}};
  const leafs=root=>root?[...root.querySelectorAll('*')].filter(el=>el.children.length===0):[];

  function syncData(){{
    try{{
      if(typeof stateData==='undefined'||!stateData) return false;
      let changed=false;
      const set=(s,k,v)=>{{if(String(s[k]??'')!==String(v)){{s[k]=v;changed=true;}}}};
      for(const [ab,byLast] of Object.entries(AVG)){{
        const s=stateData[ab]; if(!s) continue;
        for(const slot of [1,2]){{
          const value=byLast[last(s['candidate'+slot])];
          if(value!==undefined) set(s,'candidate'+slot+'Poll',value);
        }}
        set(s,'updated','2026-09-10');
      }}
      const me=stateData.ME;
      if(me){{
        set(me,'rating','tilt-r');set(me,'predictionParty','Republican');set(me,'prediction','Collins +1.3%');set(me,'notes',MAINE_NOTE);set(me,'updated','2026-09-10');
        for(const k of ['projectedWinner','predictionWinner','winner','callParty']) if(k in me) set(me,k,'Republican');
        if('call' in me) set(me,'call','Collins +1.3%');
      }}
      return changed;
    }}catch(e){{console.warn('Audited Senate data sync unavailable',e);return false;}}
  }}

  function forceMaine(){{
    const root=document.getElementById('page-senate'); if(!root)return;
    root.querySelectorAll('[data-state="ME"],[data-state="ME"] path,[data-abbr="ME"],[data-abbr="ME"] path,[data-state-abbr="ME"],[data-state-abbr="ME"] path,#ME,#ME path,#state-ME,#state-ME path').forEach(el=>{{
      el.style.setProperty('fill',RED_LIGHT,'important');
      if(el.namespaceURI!=='http://www.w3.org/2000/svg'&&!/^(path|polygon|rect)$/i.test(el.tagName||'')) el.style.setProperty('background',RED_LIGHT,'important');
    }});
    const labels=leafs(root).filter(el=>norm(el.textContent)==='Maine'&&el.getClientRects().length);
    for(const label of labels){{
      let box=label.parentElement;
      for(let i=0;box&&box!==root&&i<14;i++,box=box.parentElement){{
        const t=norm(box.textContent);
        if(/WILL[’']S (CALL|STATISTICAL ODDS)/i.test(t)&&/MY PROJECTED WINNER/i.test(t)) break;
      }}
      if(!box||box===root)continue;
      const ls=leafs(box);
      for(const el of ls){{
        const t=norm(el.textContent);
        if(/^Prediction:\\s*/i.test(t))el.textContent='Prediction: Tilt Republican';
        if(t==='Jackson +0.4%'||t==='No prediction text entered yet.')el.textContent='Collins +1.3%';
      }}
      const call=ls.findIndex(el=>/^WILL[’']S CALL$/i.test(norm(el.textContent)));
      if(call>=0){{
        const p=ls.slice(call+1,call+12).find(el=>/^(Democrat(?:ic)?|Republican)$/i.test(norm(el.textContent)));
        if(p)p.textContent='Republican';
        const copy=box.querySelector('.prediction-copy');if(copy)copy.textContent='Collins +1.3%';
      }}
      const proj=ls.findIndex(el=>/^MY PROJECTED WINNER$/i.test(norm(el.textContent)));
      if(proj>=0){{
        const p=ls.slice(proj+1,proj+12).find(el=>/^(Democrat(?:ic)?|Republican)$/i.test(norm(el.textContent)));
        if(p)p.textContent='Republican';
      }}
    }}
  }}

  function forceSenateSummary(){{
    const root=document.getElementById('page-senate'); if(!root)return;
    const ls=leafs(root);
    for(const label of ls){{
      const t=norm(label.textContent);
      if(!/^(REPUBLICAN|DEMOCRAT(?:IC)?)$/i.test(t))continue;
      let box=label.parentElement;
      for(let d=0;box&&box!==root&&d<6;d++,box=box.parentElement){{
        const text=norm(box.textContent);
        if(!/REPUBLICAN/i.test(text)||!/DEMOCRAT/i.test(text))continue;
        const branch=label.parentElement;
        const n=leafs(branch).find(x=>/^\\d+$/.test(norm(x.textContent)));
        if(n)n.textContent=/^REPUBLICAN$/i.test(t)?'51':'49';
        break;
      }}
    }}
  }}

  function forceHome(){{
    const root=document.getElementById('page-home');if(!root)return;
    const title=leafs(root).find(el=>/^Will[’']s Senate Prediction$/i.test(norm(el.textContent)));
    if(!title)return;
    let card=title.parentElement;
    for(let i=0;card&&card!==root&&i<7;i++,card=card.parentElement){{
      const t=norm(card.textContent);
      if(/Democrats/i.test(t)&&/Republicans/i.test(t)&&/51 seats needed for a majority/i.test(t))break;
    }}
    if(!card||card===root)return;
    const nums=[...card.querySelectorAll('.party-number,.final-party-number')];
    if(nums.length>=2){{nums[0].textContent='49';nums[1].textContent='51';}}
    const all=leafs(card);
    for(const el of all){{
      const t=norm(el.textContent);
      if(/^Democrats?:\\s*50$/i.test(t))el.textContent=t.replace(/50$/,'49');
      if(/^Republicans?:\\s*50$/i.test(t))el.textContent=t.replace(/50$/,'51');
    }}
    const bar=card.querySelector('.senate-bar,.final-bar');
    if(bar){{
      const d=bar.querySelector('.dem'),r=bar.querySelector('.rep');
      if(d)d.style.setProperty('width','49%','important');
      if(r)r.style.setProperty('width','51%','important');
      bar.setAttribute('aria-label','Senate prediction: 49 Democrats and 51 Republicans');
    }}
  }}

  function apply(){{
    const changed=syncData();
    if(changed&&typeof renderSenate==='function'&&!rendering){{rendering=true;try{{renderSenate();}}catch(e){{}}finally{{rendering=false;}}}}
    forceMaine();forceSenateSummary();forceHome();
  }}
  function schedule(){{if(queued)return;queued=true;requestAnimationFrame(()=>{{queued=false;apply();}});}}
  apply();[80,250,700,1600,3200].forEach(ms=>setTimeout(apply,ms));
  setInterval(apply,1200);
  new MutationObserver(schedule).observe(document.body,{{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','style']}});
  window.addEventListener('pageshow',apply);window.addEventListener('resize',apply);
}})();
"""
Path('senate-current-sync.js').write_text(sync)

# Correct the loader's built-in Maine fallback and load every changed asset with a fresh cache key.
p=Path('index.html'); s=p.read_text()
s,n=re.subn(r"if\(stateData\.ME&&stateData\.ME\.active\)stateData\.ME\.rating='tilt-d'", "if(stateData.ME&&stateData.ME.active)stateData.ME.rating='tilt-r'", s, count=1)
if n!=1: raise SystemExit(f'index Maine rating fallback replacement count {n}')
s,n=re.subn(r"ME:'Jackson \+0\.4%'", "ME:'Collins +1.3%'", s, count=1)
if n!=1: raise SystemExit(f'index Maine call override replacement count {n}')
for fn in ['senate-julsep-archive.js','site-final.js','sep9-polls-update.js','senate-color-polish.js','sept9-final-ui.js','senate-error-history.js']:
    s,n=re.subn(rf"({re.escape(fn)}\?v=)[0-9-]+",rf"\g<1>{STAMP}",s,count=1)
    if n!=1: raise SystemExit(f'index cache version not found for {fn}: {n}')
needle="h=h.replace('</body>','<script src=\"/senate-error-history.js?v="+STAMP+"\"><\\/script></body>');document.open();"
if needle not in s: raise SystemExit('index final error-history loader marker not found')
s=s.replace(needle,"h=h.replace('</body>','<script src=\"/senate-error-history.js?v="+STAMP+"\"><\\/script></body>');h=h.replace('</body>','<script src=\"/senate-current-sync.js?v="+STAMP+"\"><\\/script></body>');document.open();",1)
p.write_text(s)

print('Audited averages:', {k:(v['a1'],v['a2'],v['n']) for k,v in avg.items()})
print('Applied Maine Tilt R + Collins call, 51-49 Senate cards, popup averages, and removed bottom click prompt.')

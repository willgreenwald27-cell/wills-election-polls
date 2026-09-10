#!/usr/bin/env python3
import csv, io, json, re, statistics, urllib.request
from datetime import datetime, date, timedelta
from pathlib import Path

STANFORD='https://raw.githubusercontent.com/stanford-policylab/polling-errors/master/data/polls_main_dataset.tsv'
JACK='https://raw.githubusercontent.com/Jack-Whitcomb/All-US-Senate-polls-2006-2024/refs/heads/main/2006_to_2024_senate_polls_with_actuals.csv'
RESULTS='https://raw.githubusercontent.com/fivethirtyeight/election-results/main/election_results_senate.csv'
CLASS_II='AL AK AR CO DE GA ID IL IA KS KY LA ME MA MI MN MS MT NE NH NJ NM NC OK OR RI SC SD TN TX VA WV WY'.split()
CLASS_III='FL OH'.split()
TARGET={ab:{'seat':'Class II','years':[2002,2008,2014,2020]} for ab in CLASS_II}
TARGET.update({ab:{'seat':'Class III','years':[2004,2010,2016,2022]} for ab in CLASS_III})
SWING=set('AK GA IA KS ME MI MN NE NH NC OH TX'.split())
NAMES={'AL':'Alabama','AK':'Alaska','AR':'Arkansas','CO':'Colorado','DE':'Delaware','FL':'Florida','GA':'Georgia','ID':'Idaho','IL':'Illinois','IA':'Iowa','KS':'Kansas','KY':'Kentucky','LA':'Louisiana','ME':'Maine','MA':'Massachusetts','MI':'Michigan','MN':'Minnesota','MS':'Mississippi','MT':'Montana','NE':'Nebraska','NH':'New Hampshire','NJ':'New Jersey','NM':'New Mexico','NC':'North Carolina','OH':'Ohio','OK':'Oklahoma','OR':'Oregon','RI':'Rhode Island','SC':'South Carolina','SD':'South Dakota','TN':'Tennessee','TX':'Texas','VA':'Virginia','WV':'West Virginia','WY':'Wyoming'}


def get(url):
    req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 senate-history-builder'})
    with urllib.request.urlopen(req,timeout=60) as r:
        return r.read().decode('utf-8-sig')

def number(v):
    try:
        s=str(v or '').strip()
        return None if not s or s.upper() in {'NA','N/A','NAN','NULL'} else float(s)
    except Exception:
        return None

def bucket(p):
    p=str(p or '').strip().upper()
    if p in {'REP','R','GOP','REPUBLICAN'}: return 'rep'
    if p in {'DEM','D','DFL','DEMOCRATIC'}: return 'dem'
    return 'other'

def election_day(y):
    d=date(y,11,1)
    while d.weekday()!=0: d+=timedelta(days=1)
    return d+timedelta(days=1)

def winner_support(row,b,stanford):
    key=({'dem':'democratic','rep':'republican','other':'someoneElse'} if stanford else {'dem':'dem','rep':'rep','other':'other'})[b]
    return number(row.get(key))

def official_index(rows):
    out={}
    for ab,spec in TARGET.items():
        for yr in spec['years']:
            rr=[r for r in rows if r.get('state_abbrev')==ab and str(r.get('cycle'))==str(yr) and r.get('office_seat_name')==spec['seat'] and r.get('stage') in {'general','runoff'} and r.get('candidate_name') and number(r.get('percent')) is not None]
            if not rr:
                out[(ab,yr)]=None; continue
            stage='runoff' if any(r.get('stage')=='runoff' for r in rr) else 'general'
            rr=[r for r in rr if r.get('stage')==stage]
            rounds=[int(float(r['ranked_choice_round'])) for r in rr if str(r.get('ranked_choice_round') or '').strip()]
            if rounds:
                mx=max(rounds); rr=[r for r in rr if not str(r.get('ranked_choice_round') or '').strip() or int(float(r['ranked_choice_round']))==mx]
            cand=[]
            for r in rr:
                cand.append({'name':r['candidate_name'].strip(),'party':str(r.get('ballot_party') or '').strip(),'bucket':bucket(r.get('ballot_party')),'pct':number(r['percent'])})
            cand.sort(key=lambda x:x['pct'],reverse=True)
            out[(ab,yr)]={'stage':stage,'winner':cand[0],'runner':cand[1]} if len(cand)>=2 else None
    return out

stan=list(csv.DictReader(io.StringIO(get(STANFORD)),delimiter='\t'))
jack=list(csv.DictReader(io.StringIO(get(JACK)))
results=list(csv.DictReader(io.StringIO(get(RESULTS))))
official=official_index(results)
records=[]

for ab,spec in TARGET.items():
    for yr in spec['years']:
        base={'state':ab,'stateName':NAMES[ab],'year':yr,'seatClass':spec['seat'],'swing2026':ab in SWING}
        oi=official.get((ab,yr))
        if not oi:
            records.append({**base,'status':'NO POLLING','pollCount':0,'reason':'Official result or candidate data unavailable'})
            continue
        w,ru=oi['winner'],oi['runner']
        polls=[]; source=''; method=''
        if yr<=2014:
            candidates=[r for r in stan if r.get('state')==ab and str(r.get('year'))==str(yr) and r.get('election')=='Sen']
            # For runoff states, Stanford includes a later electionDate; use the deciding election.
            dates=[]
            for r in candidates:
                try: dates.append(datetime.strptime(r.get('electionDate',''),'%Y-%m-%d').date())
                except Exception: pass
            if dates:
                last=max(dates).isoformat(); candidates=[r for r in candidates if r.get('electionDate')==last]
            for r in candidates:
                a=winner_support(r,w['bucket'],True); b=winner_support(r,ru['bucket'],True)
                if a is not None and b is not None: polls.append((a,b,r.get('pollName','')))
            source='Stanford Policy Lab / FiveThirtyEight-Pollster final-three-week polling dataset'
            method='Average of qualifying Senate polls in the final three weeks of the deciding election.'
        elif ab=='GA' and yr==2020:
            # RCP published runoff aggregate for the Class II Ossoff-Perdue contest; do not mix in the simultaneous special race.
            if 'ossoff' in w['name'].lower(): polls=[(49.3,48.8,'RCP runoff aggregate')]
            elif 'ossoff' in ru['name'].lower(): polls=[(48.8,49.3,'RCP runoff aggregate')]
            source='RealClearPolitics 2020 Georgia Class II runoff aggregate'
            method='Published RCP aggregate for the final Class II runoff.'
        else:
            ed=election_day(yr); lo=ed-timedelta(days=21); seen=set()
            rows=[r for r in jack if str(r.get('year'))==str(yr) and str(r.get('state','')).strip().lower()==NAMES[ab].lower()]
            for r in rows:
                try: end=datetime.strptime(r.get('end_date',''),'%Y/%m/%d').date()
                except Exception: continue
                if not lo<=end<=ed: continue
                a=winner_support(r,w['bucket'],False); b=winner_support(r,ru['bucket'],False)
                if a is None or b is None: continue
                key=(r.get('pollster',''),r.get('start_date',''),r.get('end_date',''),a,b)
                if key in seen: continue
                seen.add(key); polls.append((a,b,r.get('pollster','')))
            source='RealClearPolling-listed Senate polls collected by Jack Whitcomb'
            method='Average of qualifying public Senate polls ending in the final 21 days before Election Day.'

        match=f"{w['name']} vs. {ru['name']}"
        actual=w['pct']-ru['pct']
        common={**base,'matchup':match,'stage':oi['stage'],'winner':w['name'],'winnerParty':w['party'],'runnerUp':ru['name'],'runnerUpParty':ru['party'],'actualWinnerPct':round(w['pct'],1),'actualRunnerPct':round(ru['pct'],1),'actualMargin':round(actual,1),'source':source,'methodology':method}
        if not polls:
            records.append({**common,'status':'NO POLLING','pollCount':0}); continue
        wa=statistics.mean(p[0] for p in polls); rb=statistics.mean(p[1] for p in polls)
        signed=wa-rb; err=abs(actual-signed); wrong=signed<0
        records.append({**common,'pollWinnerPct':round(wa,1),'pollRunnerPct':round(rb,1),'pollLeader':w['name'] if signed>=0 else ru['name'],'pollMargin':round(abs(signed),1),'pollMarginSignedWinnerPerspective':round(signed,1),'error':round(err,1),'wrongWinner':wrong,'status':'MISS' if wrong or err>3.0 else 'HIT','pollCount':len(polls)})

records.sort(key=lambda r:(r['stateName'],r['year']))
scored=[r for r in records if r['status'] in {'HIT','MISS'}]
hits=[r for r in scored if r['status']=='HIT']; misses=[r for r in scored if r['status']=='MISS']
stats={'states':len(TARGET),'seatCycles':len(records),'scored':len(scored),'hits':len(hits),'misses':len(misses),'wrongWinner':sum(bool(r.get('wrongWinner')) for r in scored),'noPolling':sum(r['status']=='NO POLLING' for r in records),'avgAbsError':round(statistics.mean(r['error'] for r in scored),1) if scored else None,'medianAbsError':round(statistics.median(r['error'] for r in scored),1) if scored else None,'swingMisses':sum(r['status']=='MISS' and r['swing2026'] for r in records),'hitThreshold':3.0}
payload={'generated':'2026-09-09','scope':'Only Senate seats on the ballot in 2026; four previous cycles for the same seat class.','targetStates':list(TARGET),'swingStates':sorted(SWING),'stats':stats,'records':records,'methodNote':'Older cycles use the Stanford final-three-week dataset; 2016–2022 use RCP-listed polls ending in the final 21 days. Georgia 2020 uses the published RCP Class II runoff aggregate so the two simultaneous Georgia races are not mixed.','sources':[{'name':'Stanford Policy Lab polling-errors','url':'https://github.com/stanford-policylab/polling-errors','note':'Final-three-week polling data through 2014.'},{'name':'Jack Whitcomb / RealClearPolling Senate polls','url':'https://github.com/Jack-Whitcomb/All-US-Senate-polls-2006-2024','note':'RCP-listed Senate polls used for 2016–2022.'},{'name':'FiveThirtyEight election-results','url':'https://github.com/fivethirtyeight/election-results','note':'Candidate names, seat class and official results.'}]}
Path('senate-error-history-data.json').write_text(json.dumps(payload,indent=2,ensure_ascii=False)+'\n')

maine=[r for r in records if r['state']=='ME']
assert [r['year'] for r in maine]==[2002,2008,2014,2020], maine
assert len(records)==140, len(records)

idx=Path('index.html'); s=idx.read_text(); ref='senate-error-history.js?v=20260909-2305'
if 'senate-error-history.js?v=' in s:
    s=re.sub(r'senate-error-history\.js\?v=[0-9-]+',ref,s)
else:
    marker='document.open();document.write(h);document.close()'
    if marker not in s: raise SystemExit('loader marker missing')
    inject='h=h.replace(\'</body>\',\'<script src="/senate-error-history.js?v=20260909-2305"><\\/script></body>\');'
    s=s.replace(marker,inject+marker,1)
idx.write_text(s)
expected="['d0.txt','d1.txt','d2.txt','d3.txt','d4.txt','d5.txt','d6.txt','d7.txt','d8a.txt','d8b.txt','d9.txt']"
assert expected in s and 'document.open();document.write(h);document.close()' in s and '<\\/script>' in s
print(json.dumps(stats,indent=2))
print('Maine:',[(r['year'],r.get('matchup'),r['status'],r.get('error')) for r in maine])

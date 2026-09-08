from pathlib import Path
import re

archive = Path('senate-julsep-archive.js')
s = archive.read_text()
row = "['2026-09-07','MN','Minnesota','TIPP**','Peggy Flanagan',44,'Michele Tafoya',42,'RCP'],"
if row not in s:
    s = s.replace('  const POLLS=[\n', '  const POLLS=[\n' + row + '\n', 1)
s = s.replace(
    '88 public general-election matchup polls and snapshots from July 7 through September 3',
    '89 public general-election matchup polls and snapshots from July 7 through September 7'
)
if 'let renderingMinnesota=false;' not in s:
    s = s.replace('  let renderingMaine=false;', '  let renderingMaine=false;\n  let renderingMinnesota=false;', 1)

marker = '  function apply(){applyMaineCall();fixMaineVisibleDetail();ensurePollArchive();}'
if 'function applyMinnesotaAverage()' not in s:
    patch = """  function applyMinnesotaAverage(){
    try{
      if(typeof stateData==='undefined'||!stateData||!stateData.MN) return;
      const mn=stateData.MN;
      let changed=false;
      const setPoll=(slot,last,pct)=>{
        const name=norm(mn['candidate'+slot]).toLowerCase();
        if(!name.includes(last)) return;
        const key='candidate'+slot+'Poll';
        if(String(mn[key])!==String(pct)){mn[key]=String(pct);changed=true;}
      };
      setPoll(1,'flanagan','45.0'); setPoll(2,'flanagan','45.0');
      setPoll(1,'tafoya','41.5'); setPoll(2,'tafoya','41.5');
      if(mn.updated!=='2026-09-07'){mn.updated='2026-09-07';changed=true;}
      if(changed&&typeof renderSenate==='function'&&!renderingMinnesota){
        renderingMinnesota=true;
        try{renderSenate();}finally{renderingMinnesota=false;}
      }
    }catch(e){console.warn('Minnesota polling-average update unavailable',e);}
  }

  function ensureSep7MinnesotaPoll(){
    try{
      if(typeof polls==='undefined'||!Array.isArray(polls)) return;
      const exists=polls.some(p=>p&&p.state==='MN'&&p.date==='2026-09-07'&&/TIPP/i.test(String(p.pollster||'')));
      if(exists) return;
      polls.push({date:'2026-09-07',state:'MN',pollster:'TIPP**',sample:'Sample size not listed in source snapshot',c1:'Peggy Flanagan',c1Pct:'44',c2:'Michele Tafoya',c2Pct:'42',notes:'RealClearPolling listing · Flanagan +2'});
      if(typeof renderPolls==='function') renderPolls();
    }catch(e){console.warn('Minnesota poll feed update unavailable',e);}
  }

  function apply(){applyMaineCall();applyMinnesotaAverage();ensureSep7MinnesotaPoll();fixMaineVisibleDetail();ensurePollArchive();}"""
    if marker not in s:
        raise SystemExit('archive apply marker not found')
    s = s.replace(marker, patch, 1)
archive.write_text(s)

accepted = Path('accepted-good.js')
g = accepted.read_text()
g = g.replace(
    "if(t.includes('poll')&&t.includes('entered')&&v==='13') el.textContent='88';",
    "if(t.includes('poll')&&t.includes('entered')&&['13','14','88'].includes(v)) el.textContent='89';"
)
g = re.sub(r'senate-julsep-archive\.js\?v=[0-9-]+', 'senate-julsep-archive.js?v=20260908-1225', g)
accepted.write_text(g)

index = Path('index.html')
i = index.read_text()
i, n = re.subn(r'senate-julsep-archive\.js\?v=[0-9-]+', 'senate-julsep-archive.js?v=20260908-1225', i)
if n < 1:
    raise SystemExit('index archive cache reference not found')
index.write_text(i)

assert row in archive.read_text()
assert '89 public general-election matchup polls' in archive.read_text()
assert 'function applyMinnesotaAverage()' in archive.read_text()
assert "el.textContent='89'" in accepted.read_text()
assert 'senate-julsep-archive.js?v=20260908-1225' in index.read_text()

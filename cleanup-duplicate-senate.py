from pathlib import Path
import re

p = Path('sep9-polls-update.js')
s = p.read_text()

if 'function removeDuplicateHomeSenatePrediction()' not in s:
    anchor = '  function fixCounts(){\n'
    if anchor not in s:
        raise SystemExit('fixCounts anchor missing')
    fn = '''  function removeDuplicateHomeSenatePrediction(){
    const root=document.getElementById('page-home'); if(!root) return;
    const split=document.getElementById('homeForecastSplit');

    for(const img of [...root.querySelectorAll('img')]){
      if(split&&split.contains(img)) continue;
      const sig=((img.alt||'')+' '+(img.getAttribute('src')||'')).toLowerCase();
      if(!(/senate/.test(sig)&&/prediction|forecast/.test(sig))) continue;
      let parent=img.parentElement;
      img.remove();
      while(parent&&parent!==root&&!norm(parent.textContent)&&parent.children.length===0){
        const next=parent.parentElement; parent.remove(); parent=next;
      }
    }

    const leaves=[...root.querySelectorAll('*')].filter(el=>!el.children.length&&!(split&&split.contains(el)));
    for(const el of leaves){
      if(!/^Will[\\u2019']s Senate Prediction$/i.test(norm(el.textContent))) continue;
      let box=el.parentElement;
      for(let i=0;box&&box!==root&&i<8;i++,box=box.parentElement){
        const t=norm(box.textContent);
        if(/Will[\\u2019']s Senate Prediction/i.test(t)&&/Democrats/i.test(t)&&/Republicans/i.test(t)){
          box.remove();
          break;
        }
      }
    }
  }

'''
    s = s.replace(anchor, fn + anchor, 1)

old = '  function apply(){applyAverages();ensureNativePolls();ensureArchiveRows();ensureHomeForecastSplit();fixCounts();}'
new = '  function apply(){applyAverages();ensureNativePolls();ensureArchiveRows();ensureHomeForecastSplit();removeDuplicateHomeSenatePrediction();fixCounts();}'
if old in s:
    s = s.replace(old, new, 1)
elif new not in s:
    raise SystemExit('apply anchor missing')

p.write_text(s)

idx = Path('index.html')
i = idx.read_text()
i, n = re.subn(r'sep9-polls-update\.js\?v=[0-9-]+', 'sep9-polls-update.js?v=20260909-1502', i)
if n != 1:
    raise SystemExit(f'expected one sep9 updater cache key, found {n}')
idx.write_text(i)

assert 'removeDuplicateHomeSenatePrediction();' in p.read_text()
assert 'sep9-polls-update.js?v=20260909-1502' in idx.read_text()

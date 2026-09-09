from pathlib import Path
import re

p = Path('sep9-polls-update.js')
s = p.read_text()

pat = r"  function ensureHomeForecastSplit\(\)\{.*?\n  \}\n\n  function removeDuplicateHomeSenatePrediction\(\)\{"
repl = r'''  function ensureHomeForecastSplit(){
    const root=document.getElementById('page-home'); if(!root) return;

    if(!document.getElementById('homeForecastRemovedStyle')){
      const st=document.createElement('style');
      st.id='homeForecastRemovedStyle';
      st.textContent='#page-home #housePrediction2026,#page-home #homeForecastSplit{display:none!important}';
      document.head.appendChild(st);
    }

    document.getElementById('homeForecastSplitStyle')?.remove();
    document.getElementById('homeForecastSplit')?.remove();
    document.getElementById('housePrediction2026')?.remove();

    for(const img of [...root.querySelectorAll('img')]){
      const sig=((img.alt||'')+' '+(img.getAttribute('src')||'')).toLowerCase();
      if(!(/house|senate/.test(sig)&&/prediction|forecast/.test(sig))) continue;
      let parent=img.parentElement;
      img.remove();
      while(parent&&parent!==root&&!norm(parent.textContent)&&parent.children.length===0){
        const next=parent.parentElement; parent.remove(); parent=next;
      }
    }
  }

  function removeDuplicateHomeSenatePrediction(){'''

s, n = re.subn(pat, repl, s, count=1, flags=re.S)
if n != 1:
    raise SystemExit(f'expected one homepage forecast function, found {n}')
p.write_text(s)

idx = Path('index.html')
i = idx.read_text()
i, n = re.subn(r'sep9-polls-update\.js\?v=[0-9-]+', 'sep9-polls-update.js?v=20260909-1512', i, count=1)
if n != 1:
    raise SystemExit(f'expected one sep9 updater cache key, found {n}')
idx.write_text(i)

assert 'homeForecastRemovedStyle' in p.read_text()
assert "document.getElementById('housePrediction2026')?.remove()" in p.read_text()
assert 'sep9-polls-update.js?v=20260909-1512' in idx.read_text()

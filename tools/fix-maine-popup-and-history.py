from pathlib import Path
import re

# 1) Maine popup: show candidate name, add user's rationale, remove homepage tiebreaker.
p=Path('senate-current-sync.js')
s=p.read_text()
s=s.replace("if(p)p.textContent='Republican';", "if(p)p.textContent='Susan Collins';")
needle="""      if(proj>=0){
        const p=ls.slice(proj+1,proj+12).find(el=>/^(Democrat(?:ic)?|Republican)$/i.test(norm(el.textContent)));
        if(p)p.textContent='Susan Collins';
      }
"""
insert=needle+"""      let why=box.querySelector('.maine-why-note');
      if(!why){
        why=document.createElement('div');
        why.className='maine-why-note';
        box.appendChild(why);
      }
      why.textContent='WHY I THINK MAINE GOES RED · Final polling margins underestimated Susan Collins by more than 5 points in each of her last three Senate elections (2008, 2014, and 2020).';
      why.style.cssText='margin-top:12px;padding:12px 14px;border-radius:12px;background:#fff3f4;border:1px solid #f1b8bd;color:#7f2330;font:800 12px/1.5 Inter,system-ui,sans-serif;letter-spacing:.05px';
"""
if needle not in s:
    raise SystemExit('Maine projected-winner block not found')
s=s.replace(needle,insert,1)
needle2="""    if(!card||card===root)return;
    const nums=[...card.querySelectorAll('.party-number,.final-party-number')];
"""
repl2="""    if(!card||card===root)return;
    card.querySelectorAll('.senate-tiebreak,.final-tiebreak').forEach(el=>el.remove());
    const nums=[...card.querySelectorAll('.party-number,.final-party-number')];
"""
if needle2 not in s:
    raise SystemExit('Homepage card block not found')
s=s.replace(needle2,repl2,1)
p.write_text(s)

# 2) Remove JD Vance from the two scripts that can rebuild the homepage card.
p=Path('senate-color-polish.js')
s=p.read_text()
s=s.replace("${senate?'<div class=\"final-tiebreak\">Tiebreak vote<strong>JD VANCE</strong></div>':''}", "")
p.write_text(s)

p=Path('sep9-polls-update.js')
s=p.read_text()
s=s.replace('            <div class="senate-tiebreak">Tiebreak vote<strong>JD VANCE</strong></div>\n','')
p.write_text(s)

# 3) Past Polling Errors swing-state cards: remove scored/all-races row and click instruction.
p=Path('senate-error-history.js')
s=p.read_text()
route='<div class="ipe-shock-route"><div><span>Scored races</span><b>${scored.length}</b></div><i>→</i><div><span>All races shown</span><b>${rows.length}</b></div></div>'
if route not in s:
    raise SystemExit('Scored-races route block not found')
s=s.replace(route,'',1)
s=s.replace('<small>Click to open the full state history</small>','',1)
# Make the average error the visual focus of the card footer.
s=s.replace('#page-errors .ipe-shock-foot{', '#page-errors .ipe-shock-foot{justify-content:flex-end;', 1)
s=s.replace('#page-errors .ipe-shock-foot em{', '#page-errors .ipe-shock-foot em{font-size:18px!important;', 1)
p.write_text(s)

# 4) Cache-bust only the touched scripts in the production loader.
p=Path('index.html')
s=p.read_text()
ver='20260910-1938'
for name in ['senate-current-sync.js','senate-color-polish.js','sep9-polls-update.js','senate-error-history.js']:
    s=re.sub(r'(/'+re.escape(name)+r'\?v=)[0-9-]+', r'\g<1>'+ver, s)
p.write_text(s)

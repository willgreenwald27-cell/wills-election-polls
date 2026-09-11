from pathlib import Path

layout = Path('site-layout-polish.js')
s = layout.read_text()
s = s.replace("background:linear-gradient(135deg,rgba(135,35,52,.62),rgba(96,35,63,.52))!important;border:1px solid rgba(237,91,105,.9)!important", "background:#fff!important;border:2px solid #e65c66!important;box-shadow:0 8px 24px rgba(189,41,55,.14)!important")
s = s.replace("color:#fff!important}\n      #page-senate .wg-call-card .prediction-copy", "color:#bd2937!important}\n      #page-senate .wg-call-card .prediction-copy")
s = s.replace("font-weight:800!important;color:#fff!important}\n      #page-senate .wg-maine-panel .maine-why-note", "font-weight:800!important;color:#7f2330!important}\n      #page-senate .wg-maine-panel .maine-why-note")
s = s.replace("if(winner){winner.textContent='Susan Collins';winner.classList.add('wg-call-winner');}", "if(winner){winner.textContent='Republican';winner.classList.add('wg-call-winner');}")
s = s.replace("if(candidate){candidate.textContent='Susan Collins';candidate.classList.add('wg-call-winner');candidate.parentElement?.classList.add('wg-call-card');}", "if(candidate){candidate.textContent='Republican';candidate.classList.add('wg-call-winner');candidate.parentElement?.classList.add('wg-call-card');}")
layout.write_text(s)

sync = Path('senate-current-sync.js')
s = sync.read_text().replace("if(p)p.textContent='Susan Collins';", "if(p)p.textContent='Republican';")
sync.write_text(s)

index = Path('index.html')
s = index.read_text()
s = s.replace('senate-current-sync.js?v=20260910-1938', 'senate-current-sync.js?v=20260910-1946')
s = s.replace('site-layout-polish.js?v=20260910-1935', 'site-layout-polish.js?v=20260910-1946')
index.write_text(s)

assert "winner.textContent='Republican'" in layout.read_text()
assert "background:#fff!important;border:2px solid #e65c66!important" in layout.read_text()
assert "if(p)p.textContent='Susan Collins';" not in sync.read_text()
assert 'site-layout-polish.js?v=20260910-1946' in index.read_text()
print('Maine call label patch applied')

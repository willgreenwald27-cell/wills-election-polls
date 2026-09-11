from pathlib import Path

p=Path('site-layout-polish.js')
s=p.read_text()
s=s.replace("background:#fff!important;border:2px solid #e65c66!important;box-shadow:0 8px 24px rgba(189,41,55,.14)!important", "background:linear-gradient(135deg,#9d2f43,#bd2937)!important;border:2px solid #e65c66!important;box-shadow:0 8px 24px rgba(189,41,55,.20)!important")
s=s.replace("font-weight:800!important;color:#bd2937!important}\n      #page-senate .wg-call-card .prediction-copy", "font-weight:800!important;color:#fff!important}\n      #page-senate .wg-call-card .prediction-copy")
s=s.replace("font-weight:800!important;color:#7f2330!important}\n      #page-senate .wg-maine-panel .maine-why-note", "font-weight:800!important;color:#fff!important}\n      #page-senate .wg-maine-panel .maine-why-note")
p.write_text(s)

idx=Path('index.html')
t=idx.read_text()
t=t.replace('site-layout-polish.js?v=20260910-1946','site-layout-polish.js?v=20260910-1952')
idx.write_text(t)

assert "background:linear-gradient(135deg,#9d2f43,#bd2937)!important" in p.read_text()
assert "wg-call-winner" in p.read_text() and "color:#fff!important" in p.read_text()
assert 'site-layout-polish.js?v=20260910-1952' in idx.read_text()
print('red Maine call card applied')

from pathlib import Path
import re

p=Path('index.html')
s=p.read_text()
loader="h=h.replace('</body>','<script src=\"/site-layout-polish.js?v=20260910-1935\"><\\/script></body>');"
needle='document.open();document.write(h);document.close()'
if 'site-layout-polish.js' in s:
    s=re.sub(r'site-layout-polish\.js\?v=[0-9-]+','site-layout-polish.js?v=20260910-1935',s)
else:
    if needle not in s:
        raise SystemExit('document.write loader marker not found')
    s=s.replace(needle,loader+needle,1)
p.write_text(s)

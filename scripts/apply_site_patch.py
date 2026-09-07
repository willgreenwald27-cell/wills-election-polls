from pathlib import Path
import base64
import gzip
import re

CHUNKS = [
    'd0.txt','d1.txt','d2.txt','d3.txt','d4.txt','d5.txt',
    'd6.txt','d7.txt','d8a.txt','d8b.txt','d9.txt'
]


def load_html():
    encoded = ''.join(Path(name).read_text().strip() for name in CHUNKS)
    return gzip.decompress(base64.b64decode(encoded)).decode('utf-8')


def save_html(html):
    encoded = base64.b64encode(gzip.compress(html.encode('utf-8'), mtime=0)).decode('ascii')
    q, r = divmod(len(encoded), len(CHUNKS))
    pos = 0
    for i, name in enumerate(CHUNKS):
        size = q + (1 if i < r else 0)
        Path(name).write_text(encoded[pos:pos + size])
        pos += size
    if pos != len(encoded):
        raise SystemExit('Chunk split failed')


html = load_html()

# 1. Keep internal-page navigation inside the SPA and persist the selected page in the URL.
show_start = html.find('function showPage(name){')
if show_start < 0:
    raise SystemExit('showPage function not found')

scroll_marker = "window.scrollTo({top:0,behavior:'instant'});"
scroll_pos = html.find(scroll_marker, show_start)
if scroll_pos < 0:
    raise SystemExit('showPage scroll marker not found')

route_update = (
    "window.scrollTo({top:0,behavior:'instant'});"
    "try{const u=name==='home'?location.pathname:location.pathname+'?page='+encodeURIComponent(name);"
    "history.replaceState(null,'',u)}catch(e){}"
)
if "history.replaceState(null,'',u)" not in html[show_start:show_start + 1800]:
    html = html[:scroll_pos] + route_update + html[scroll_pos + len(scroll_marker):]

# Explicit button types prevent an accidental form submit / page reload if markup changes around them.
def add_button_type(match):
    attrs = match.group(1)
    if re.search(r'\btype\s*=', attrs, re.I):
        return '<button' + attrs + '>'
    return '<button type="button"' + attrs + '>'

html = re.sub(r'<button([^>]*\bdata-page-link="[^"]+"[^>]*)>', add_button_type, html)

# Restore the requested page when arriving from Governor links such as /?page=betting.
html = re.sub(r'<script id="page-route-restore">.*?</script>', '', html, flags=re.S)
route_restore = (
    '<script id="page-route-restore">'
    "(()=>{try{const p=new URLSearchParams(location.search).get('page');"
    "if(p&&['home','senate','polls','betting','errors','about'].includes(p)"
    "&&document.getElementById('page-'+p)&&typeof showPage==='function')showPage(p)"
    "}catch(e){}})();"
    '</script>'
)
if '</body>' not in html:
    raise SystemExit('Closing body tag not found')
html = html.replace('</body>', route_restore + '</body>', 1)

# Make the visible nav deterministic on every render and intercept internal tab clicks
# before any older handler can submit/reload the document.
html = re.sub(r'<script id="stable-nav-fix">.*?</script>', '', html, flags=re.S)
stable_nav = '''<script id="stable-nav-fix">(()=>{
const pages=['home','senate','polls','betting','errors','about'];
function orderNav(){
  const nav=document.querySelector('.site-header .nav');
  if(!nav)return;
  let gov=nav.querySelector('[data-governor-link]');
  if(!gov){
    gov=document.createElement('button');
    gov.type='button';
    gov.setAttribute('data-governor-link','');
    gov.textContent='2026 Governor Map';
    gov.addEventListener('click',()=>{window.location.href='/governor.html'});
  }
  const senate=nav.querySelector('[data-page-link="senate"]');
  if(senate)senate.insertAdjacentElement('afterend',gov);
  else if(!gov.parentNode)nav.prepend(gov);
  const about=nav.querySelector('[data-page-link="about"]');
  if(about)nav.appendChild(about);
  nav.querySelectorAll('[data-page-link]').forEach(b=>{b.type='button'});
}
orderNav();
new MutationObserver(orderNav).observe(document.body,{childList:true,subtree:true});
setInterval(orderNav,1200);
document.addEventListener('click',e=>{
  const t=e.target&&e.target.closest?e.target.closest('.site-header .nav [data-page-link]'):null;
  if(!t)return;
  const name=t.getAttribute('data-page-link');
  if(!pages.includes(name)||typeof showPage!=='function')return;
  e.preventDefault();
  e.stopImmediatePropagation();
  showPage(name);
},true);
})();</script>'''
html = html.replace('</body>', stable_nav + '</body>', 1)

# 2. Make the betting page heading permanently read "Live Kalshi Senate Odds".
old_heading = '<h1>Kalshi Senate Odds</h1>'
new_heading = (
    '<h1 class="live-kalshi-title">'
    '<span class="live-kalshi-dot" aria-hidden="true"></span>'
    'Live Kalshi Senate Odds</h1>'
)
if old_heading in html:
    html = html.replace(old_heading, new_heading, 1)
elif 'Live Kalshi Senate Odds' not in html:
    raise SystemExit('Kalshi heading not found')

html = re.sub(r'<style id="static-live-kalshi-style">.*?</style>', '', html, flags=re.S)
live_style = (
    '<style id="static-live-kalshi-style">'
    '.live-kalshi-title{display:flex;align-items:center}'
    '.live-kalshi-dot{display:inline-block;width:10px;height:10px;flex:0 0 10px;'
    'border-radius:50%;background:#e32636;margin-right:9px;vertical-align:middle;'
    'animation:kalshiPulseStatic 1.15s ease-in-out infinite}'
    '@keyframes kalshiPulseStatic{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(227,38,54,.42)}'
    '50%{opacity:.32;box-shadow:0 0 0 6px rgba(227,38,54,0)}}'
    '</style>'
)
if '</head>' not in html:
    raise SystemExit('Closing head tag not found')
html = html.replace('</head>', live_style + '</head>', 1)

# 3. Add a clear school card to About Me with a Redwood-style red R / green tree mark.
html = re.sub(r'<section id="aboutSchool".*?</section>', '', html, flags=re.S)
about_start = html.find('<section class="page" id="page-about">')
if about_start < 0:
    raise SystemExit('About page not found')
strip_start = html.find('<section class="about-stat-strip"', about_start)
if strip_start < 0:
    raise SystemExit('About stat strip not found')
strip_end = html.find('</section>', strip_start)
if strip_end < 0:
    raise SystemExit('About stat strip closing tag not found')
strip_end += len('</section>')

school_card = '''
<section id="aboutSchool" aria-label="School" style="margin:14px 0 18px;padding:16px 18px;border:1px solid #d9dee7;border-radius:16px;background:#fff;display:flex;align-items:center;gap:18px;box-shadow:0 7px 22px rgba(20,34,53,.055)">
  <div style="width:86px;height:72px;flex:0 0 86px;display:flex;align-items:center;justify-content:center;background:#f7f8fa;border-radius:13px;border:1px solid #e4e8ee">
    <svg viewBox="0 0 120 120" width="70" height="70" role="img" aria-label="Redwood High School redwood tree logo">
      <text x="7" y="99" font-family="Georgia,serif" font-size="96" font-weight="900" fill="#d92732" stroke="#17263d" stroke-width="2.2" paint-order="stroke">R</text>
      <path d="M61 11 51 29h7L45 45h10L41 63h12L37 84h18v23h12V84h18L69 63h12L67 45h9L64 29h7Z" fill="#177548" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>
    </svg>
  </div>
  <div style="min-width:0">
    <div style="font-size:9px;font-weight:950;letter-spacing:1.4px;color:#d92732;text-transform:uppercase;margin-bottom:4px">School</div>
    <h3 style="margin:0;font-family:Georgia,serif;font-size:21px;line-height:1.15;color:#17263d">Redwood High School</h3>
    <p style="margin:5px 0 0;font-size:12px;line-height:1.45;color:#66758a">Larkspur, California</p>
  </div>
</section>'''
html = html[:strip_end] + school_card + html[strip_end:]

# 4. On mobile, Ashley Hinson is a Republican and her Iowa Senate candidate label must be red.
html = re.sub(r'<script id="iowa-hinson-mobile-fix">.*?</script>', '', html, flags=re.S)
hinson_fix = '''<script id="iowa-hinson-mobile-fix">(()=>{
function fixHinson(){
  if(!window.matchMedia('(max-width:760px)').matches)return;
  const root=document.getElementById('page-senate');
  if(!root)return;
  root.querySelectorAll('*').forEach(el=>{
    const t=(el.textContent||'').replace(/\\s+/g,' ').trim();
    if(el.children.length===0&&(/^(Ashley Hinson|Hinson)(\\s*\\(R\\))?$/i.test(t)||/^Ashley Hinson\\s*[—-]/i.test(t))){
      el.style.setProperty('color','#c62828','important');
    }
  });
}
fixHinson();
new MutationObserver(fixHinson).observe(document.body,{childList:true,subtree:true,characterData:true});
window.addEventListener('resize',fixHinson);
})();</script>'''
html = html.replace('</body>', hinson_fix + '</body>', 1)

save_html(html)

# Re-read the rebuilt source and fail the workflow if any requested change is missing.
rebuilt = load_html()
required = [
    "history.replaceState(null,'',u)",
    'id="page-route-restore"',
    'id="stable-nav-fix"',
    "e.stopImmediatePropagation()",
    "nav.appendChild(about)",
    'Live Kalshi Senate Odds',
    'class="live-kalshi-dot"',
    'id="aboutSchool"',
    'Redwood High School',
    'Larkspur, California',
    'id="iowa-hinson-mobile-fix"',
    '#c62828',
]
for needle in required:
    if needle not in rebuilt:
        raise SystemExit('Verification failed: ' + needle)

print('Verified stable SPA navigation, About-last order, Governor-after-Senate order, Live Kalshi heading, Redwood school card, and Iowa Hinson mobile color.')

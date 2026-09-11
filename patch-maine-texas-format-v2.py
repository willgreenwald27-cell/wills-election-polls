from pathlib import Path

layout = Path('site-layout-polish.js')
s = layout.read_text()

old_why = "#page-senate .wg-maine-panel .maine-why-note{margin:11px 0 0!important;padding:11px 0 0!important;border:0!important;border-top:1px solid rgba(255,255,255,.15)!important;border-radius:0!important;background:transparent!important;color:#e8eef7!important;font:700 12px/1.5 Inter,ui-sans-serif,system-ui,sans-serif!important;letter-spacing:0!important}\n      #page-senate .wg-maine-panel .maine-why-note b{color:#fff!important}"
new_why = "#page-senate .wg-maine-panel .maine-why-note{margin:12px 0 0!important;padding:15px 16px!important;border:0!important;border-radius:10px!important;background:#f7f8fb!important;color:#26384f!important;font:500 12px/1.45 Inter,ui-sans-serif,system-ui,sans-serif!important;letter-spacing:0!important;box-shadow:none!important}\n      #page-senate .wg-maine-panel .maine-why-note b{display:block!important;margin-bottom:8px!important;color:#61718a!important;font-size:10px!important;line-height:1.1!important;font-weight:900!important;letter-spacing:1.2px!important;text-transform:uppercase!important}\n      #page-senate .wg-maine-panel .maine-why-note span{display:block!important;color:#26384f!important;font-weight:500!important}\n      #page-senate .wg-call-card .wg-call-heading{display:block!important;margin:0 0 4px!important;color:#ffd7dc!important;font:900 9px/1.1 Inter,ui-sans-serif,system-ui,sans-serif!important;letter-spacing:1.2px!important;text-transform:uppercase!important}"
if old_why not in s:
    raise SystemExit('expected Maine why-note CSS not found')
s = s.replace(old_why, new_why, 1)

old_card = "callCard.classList.add('wg-call-card');\n      const callLeaves=leafs(callCard);"
new_card = "callCard.classList.add('wg-call-card');\n      if(heading){heading.classList.add('wg-call-heading');if(!callCard.contains(heading))callCard.prepend(heading);}\n      const callLeaves=leafs(callCard);"
if old_card not in s:
    raise SystemExit('expected call-card block not found')
s = s.replace(old_card, new_card, 1)

old_note = "why.innerHTML='<b>Why I think Maine could go red:</b> Collins has been underestimated by 5+ points in three straight cycles.';"
new_note = "why.innerHTML='<b>WHY MY FORECAST DIFFERS</b><span>Why my forecast differs from the polling average: Collins has been underestimated by 5+ points in three straight cycles.</span>';"
if old_note not in s:
    raise SystemExit('expected Maine note copy not found')
s = s.replace(old_note, new_note, 1)
layout.write_text(s)

sync = Path('senate-current-sync.js')
t = sync.read_text()
# Eliminate any updater race that can turn the Maine call back into a candidate name.
t2 = t.replace("if(p)p.textContent='Susan Collins';", "if(p)p.textContent='Republican';")
if t2 == t and "if(p)p.textContent='Republican';" not in t:
    raise SystemExit('expected Maine call updater not found')
sync.write_text(t2)

idx = Path('index.html')
i = idx.read_text()
i = i.replace('/site-layout-polish.js?v=20260910-1935', '/site-layout-polish.js?v=20260910-1944')
i = i.replace('/senate-current-sync.js?v=20260910-1938', '/senate-current-sync.js?v=20260910-1944')
idx.write_text(i)

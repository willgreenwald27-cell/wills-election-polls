"""Browser smoke check of the real, JavaScript-rendered Senate page."""
import os, time, json, traceback
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.chrome.options import Options

opts = Options()
opts.add_argument("--headless=new")
opts.add_argument("--no-sandbox")
opts.add_argument("--disable-dev-shm-usage")
opts.add_argument("--window-size=1440,960")
driver = webdriver.Chrome(options=opts)
result = {"ok": False}
try:
    driver.get("http://127.0.0.1:8765/?smoke=20261019")
    time.sleep(8)
    result["title"] = driver.title
    result["app"] = driver.execute_script("return ({loading:!!document.querySelector('#loading')?.offsetParent,pages:document.querySelectorAll('.page').length,native:!!document.getElementById('mapHoverCard'),hoverJs:!!window.__wgNativeHoverRestored})")
    driver.execute_script("if(typeof window.__acceptedGoodNavigate==='function'){window.__acceptedGoodNavigate('senate',true)}else{document.querySelector('[data-accepted-page=senate]')?.click()}")
    time.sleep(2)
    result["before"] = driver.execute_script("""
      const p=document.getElementById('page-senate'),x=p?.querySelector('.state-shape[data-state="TX"]');
      return {senateVisible:!!(p&&p.getClientRects().length),shapes:p?.querySelectorAll('.state-shape[data-state]').length||0,tx:!!x,texasFill:x&&getComputedStyle(x).fill,tooltip:!!document.getElementById('mapHoverCard'),typeofHoverHTML:typeof hoverCardHTML,diagnostic:typeof stateData==='undefined'?'missing-stateData':stateData.TX.rating};
    """)
    if result["before"].get("tx"):
        tx = driver.find_element(By.CSS_SELECTOR, "#page-senate .state-shape[data-state='TX']")
        ActionChains(driver).move_to_element(tx).pause(0.4).perform()
        result["mouse"] = driver.execute_script("""
          const c=document.getElementById('mapHoverCard');return {shown:!!c?.classList.contains('show'),opacity:c&&getComputedStyle(c).opacity,display:c&&getComputedStyle(c).display,visible:!!(c&&getComputedStyle(c).display!=='none'&&Number(getComputedStyle(c).opacity)>.8&&c.getBoundingClientRect().width>30),txt:c?.textContent?.slice(0,240)};
        """)
        if not result["mouse"]["visible"]:
            driver.execute_script("""
              const x=document.querySelector('#page-senate .state-shape[data-state="TX"]'),r=x.getBoundingClientRect();
              x.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,pointerType:'mouse',clientX:r.left+r.width/2,clientY:r.top+r.height/2}));
            """)
            time.sleep(0.3)
            result["synthetic"] = driver.execute_script("const c=document.getElementById('mapHoverCard');return {shown:c?.classList.contains('show'),txt:c?.textContent?.slice(0,240),display:c&&getComputedStyle(c).display,visible:!!(c&&getComputedStyle(c).display!=='none'&&Number(getComputedStyle(c).opacity)>.8&&c.getBoundingClientRect().width>30)}")
    driver.execute_script("""
      window.__mapMutations=0;window.__mapChanges=[];
      const svg=document.querySelector('#page-senate .map-wrap svg');
      if(svg){window.__mapObserver=new MutationObserver(m=>{
        window.__mapMutations+=m.length;
        if(window.__mapChanges.length<12)window.__mapChanges.push(m.map(v=>v.type+':'+(v.attributeName||'')).join(','));
      });window.__mapObserver.observe(svg,{childList:true,subtree:true,attributes:true,attributeFilter:['fill','style','class']})}
    """)
    time.sleep(3.3)
    result["stability"] = driver.execute_script("window.__mapObserver?.disconnect();return {count:window.__mapMutations,changes:window.__mapChanges,texasFill:getComputedStyle(document.querySelector('#page-senate .state-shape[data-state=TX]')).fill}")
    result["ok"] = bool(result["before"]["senateVisible"] and result["before"]["shapes"]>=40 and result["before"]["diagnostic"]=="tilt-d" and (result.get("mouse",{}).get("visible") or result.get("synthetic",{}).get("visible")) and result["stability"]["count"]<10)
    driver.save_screenshot("hover-smoke.png")
    print(json.dumps(result,indent=2),flush=True)
    if not result["ok"]:
        raise AssertionError("Map visible or hover card failed")
except Exception as exc:
    result["error"] = str(exc)
    result["trace"] = traceback.format_exc()[-1100:]
    try:
        driver.save_screenshot("hover-smoke.png")
    except Exception:pass
    print(json.dumps(result,indent=2),flush=True)
    raise
finally:
    driver.quit()

(()=>{
  'use strict';
  // Compatibility cleanup only. This file previously forced Texas red and
  // rewrote the Senate balance on page load/click. Those stale mutations are
  // intentionally disabled so the current Senate sync remains authoritative.
  function cleanup(){
    document.querySelectorAll('.wg-history-context').forEach(el=>el.remove());
  }
  cleanup();
  window.addEventListener('pageshow',cleanup);
})();

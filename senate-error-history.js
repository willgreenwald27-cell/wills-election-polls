(()=>{
  const DATA_URL='/senate-error-history-data.json?v=20260909-2305';
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const fmt=n=>Number.isFinite(Number(n))?Number(n).toFixed(1):'—';
  let data=null, busy=false;

  function addStyle(){
    if(document.getElementById('sehStyle')) return;
    const st=document.createElement('style'); st.id='sehStyle'; st.textContent=`
      #page-errors .seh{max-width:1180px;margin:0 auto;padding:18px 0 54px;color:#17263d}
      #page-errors .seh-hero{padding:24px 0 18px;border-bottom:1px solid #dce3ed}
      #page-errors .seh-kicker{font:900 11px/1.2 Inter,system-ui,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#718096}
      #page-errors .seh h1{font:800 clamp(34px,5vw,58px)/1.02 Georgia,serif;margin:8px 0 12px;color:#142238}
      #page-errors .seh-intro{max-width:900px;font:600 15px/1.55 Inter,system-ui,sans-serif;color:#59697e}
      #page-errors .seh-stats{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px;margin:20px 0 28px}
      #page-errors .seh-stat{border:1px solid #dce3ed;border-radius:14px;padding:14px;background:#fff}
      #page-errors .seh-stat span{display:block;font:900 9px/1.2 Inter,system-ui,sans-serif;letter-spacing:1.25px;text-transform:uppercase;color:#77869a}
      #page-errors .seh-stat b{display:block;margin-top:8px;font:900 25px/1 Georgia,serif;color:#17263d}
      #page-errors .seh-swing{padding:20px;border:1px solid #dce3ed;border-radius:18px;background:linear-gradient(135deg,#f5f8fc,#fff5f6);margin-bottom:28px}
      #page-errors .seh h2{font:800 29px/1.08 Georgia,serif;margin:0 0 7px;color:#18263b}
      #page-errors .seh-note{font:600 12px/1.5 Inter,system-ui,sans-serif;color:#68778c}
      #page-errors .seh-swing-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:15px}
      #page-errors .seh-swing-card{border:1px solid #e0e6ef;border-radius:13px;background:#fff;padding:12px}
      #page-errors .seh-swing-card b{display:block;font:900 13px/1.3 Inter,system-ui,sans-serif;color:#1b2a40}
      #page-errors .seh-swing-card small{display:block;margin-top:5px;font:700 10px/1.45 Inter,system-ui,sans-serif;color:#748196}
      #page-errors .seh-controls{display:grid;grid-template-columns:1.6fr repeat(3,minmax(130px,.55fr));gap:10px;margin:18px 0}
      #page-errors .seh-controls input,#page-errors .seh-controls select{width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid #cfd8e5;border-radius:12px;background:#fff;color:#17263d;font:700 12px Inter,system-ui,sans-serif}
      #page-errors .seh-state{border:1px solid #dce3ed;border-radius:17px;background:#fff;overflow:hidden;margin:14px 0}
      #page-errors .seh-state-head{display:flex;align-items:end;justify-content:space-between;gap:12px;padding:15px 17px;background:#f7f9fc;border-bottom:1px solid #e2e8f0}
      #page-errors .seh-state-head h3{font:800 23px/1 Georgia,serif;margin:0}.seh-state-head span{font:900 9px/1.2 Inter,system-ui,sans-serif;letter-spacing:1px;text-transform:uppercase;color:#77869a}
      #page-errors .seh-row{display:grid;grid-template-columns:62px minmax(190px,1.45fr) minmax(145px,1fr) minmax(145px,1fr) 80px 88px;gap:10px;align-items:center;padding:13px 17px;border-bottom:1px solid #edf1f6;font:700 11px/1.4 Inter,system-ui,sans-serif}
      #page-errors .seh-row:last-child{border-bottom:0}.seh-year{font:900 18px/1 Georgia,serif}.seh-match{font-weight:850}.seh-label{display:block;margin-bottom:3px;font:900 8px/1.2 Inter,system-ui,sans-serif;letter-spacing:1px;text-transform:uppercase;color:#8a96a7}.seh-error{font:900 15px/1.1 Georgia,serif}.seh-wrong{color:#b42334;font-weight:900}.seh-badge{display:inline-flex;border-radius:999px;padding:7px 9px;font:900 9px/1 Inter,system-ui,sans-serif;letter-spacing:.8px}.seh-hit{background:#e8f6ee;color:#177447}.seh-miss{background:#fdebed;color:#b42334}.seh-none{background:#eef1f5;color:#667387}
      #page-errors .seh-source{margin-top:24px;padding-top:17px;border-top:1px solid #dce3ed;font:600 10px/1.55 Inter,system-ui,sans-serif;color:#6d7a8d}.seh-source a{color:#315f9e;font-weight:850}
      @media(max-width:850px){#page-errors .seh-stats{grid-template-columns:repeat(2,1fr)}#page-errors .seh-swing-grid{grid-template-columns:1fr 1fr}#page-errors .seh-controls{grid-template-columns:1fr 1fr}#page-errors .seh-row{grid-template-columns:54px 1fr 80px;align-items:start}.seh-row .seh-poll,.seh-row .seh-result{grid-column:2}.seh-row .seh-status,.seh-row .seh-error{grid-column:3}}
      @media(max-width:520px){#page-errors .seh-swing-grid,#page-errors .seh-controls{grid-template-columns:1fr}#page-errors .seh-row{padding:12px 10px}.seh-state-head{padding:14px 10px!important}}
    `; document.head.appendChild(st);
  }

  function stat(label,val){return `<div class="seh-stat"><span>${esc(label)}</span><b>${esc(val)}</b></div>`}
  function row(r){
    const badge=r.status==='HIT'?'<span class="seh-badge seh-hit">HIT</span>':r.status==='MISS'?'<span class="seh-badge seh-miss">MISS</span>':'<span class="seh-badge seh-none">NO POLLING</span>';
    const poll=r.pollCount?`${esc(r.pollLeader)} +${fmt(r.pollMargin)} <small>(${r.pollCount} poll${r.pollCount===1?'':'s'})</small>`:'No qualifying public polls';
    const result=r.winner?`${esc(r.winner)} +${fmt(r.actualMargin)}`:'Result unavailable';
    return `<div class="seh-row"><div class="seh-year">${r.year}</div><div class="seh-match"><span class="seh-label">Matchup</span>${esc(r.matchup||'—')}${r.stage==='runoff'?'<br><small>deciding runoff</small>':''}</div><div class="seh-poll"><span class="seh-label">Final polling avg.</span>${poll}</div><div class="seh-result"><span class="seh-label">Result</span>${result}${r.wrongWinner?'<br><small class="seh-wrong">wrong winner in polls</small>':''}</div><div class="seh-error"><span class="seh-label">Error</span>${r.error!=null?fmt(r.error)+' pts':'—'}</div><div class="seh-status">${badge}</div></div>`;
  }

  function render(){
    if(!data||busy) return;
    const page=document.getElementById('page-errors'); if(!page) return;
    busy=true; addStyle();
    const st=data.stats, states=[...new Set(data.records.map(r=>r.state))].sort((a,b)=>data.records.find(r=>r.state===a).stateName.localeCompare(data.records.find(r=>r.state===b).stateName));
    const swing=data.records.filter(r=>r.swing2026&&r.status==='MISS').sort((a,b)=>(b.error||0)-(a.error||0));
    page.innerHTML=`<div class="content"><div class="seh"><section class="seh-hero"><div class="seh-kicker">2026 seats only · historical backtest</div><h1>Past Senate Polling Hits & Misses</h1><div class="seh-intro">This database now includes only Senate seats that are on the ballot in 2026. For each seat, it shows the previous four election cycles for that same Senate class. A <b>Hit</b> means the final polling average picked the winner and finished within ${fmt(st.hitThreshold)} points of the final margin; everything else is a <b>Miss</b>. Races with no qualifying public polling remain listed but are excluded from the accuracy statistics.</div></section>
      <div class="seh-stats">${stat('2026 states',st.states)}${stat('Seat cycles',st.seatCycles)}${stat('Scored',st.scored)}${stat('Hits',st.hits)}${stat('Misses',st.misses)}${stat('Avg. error',fmt(st.avgAbsError)+' pts')}</div>
      <section class="seh-swing"><h2>Swing-State Misses</h2><div class="seh-note">A separate look at historical misses in the current 2026 battleground group: AK, GA, IA, KS, ME, MI, MN, NE, NH, NC, OH and TX.</div><div class="seh-swing-grid">${swing.map(r=>`<div class="seh-swing-card"><b>${esc(r.stateName)} ${r.year} · ${fmt(r.error)}-pt miss</b><small>${esc(r.pollLeader)} +${fmt(r.pollMargin)} in the final average → ${esc(r.winner)} +${fmt(r.actualMargin)} in the result${r.wrongWinner?' · wrong winner':''}</small></div>`).join('')||'<div class="seh-note">No swing-state misses under this definition.</div>'}</div></section>
      <section><h2>All 2026-Seat History</h2><div class="seh-note">Class II seats: 2002, 2008, 2014, 2020. Florida and Ohio Class III special seats: 2004, 2010, 2016, 2022.</div><div class="seh-controls"><input id="sehSearch" placeholder="Search state, candidate or year"><select id="sehState"><option value="">All states</option>${states.map(ab=>`<option value="${ab}">${esc(data.records.find(r=>r.state===ab).stateName)}</option>`).join('')}</select><select id="sehStatus"><option value="">All results</option><option>MISS</option><option>HIT</option><option>NO POLLING</option></select><select id="sehSort"><option value="state">State / year</option><option value="newest">Newest first</option><option value="error">Largest error</option></select></div><div id="sehList"></div></section>
      <div class="seh-source"><b>Sources:</b> ${data.sources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a> — ${esc(s.note)}`).join(' · ')}<br>${esc(data.methodNote||'')}</div></div></div>`;

    function list(){
      const q=(document.getElementById('sehSearch')?.value||'').toLowerCase().trim(), state=document.getElementById('sehState')?.value||'', status=document.getElementById('sehStatus')?.value||'', sort=document.getElementById('sehSort')?.value||'state';
      let rs=data.records.filter(r=>(!state||r.state===state)&&(!status||r.status===status)&&(!q||JSON.stringify(r).toLowerCase().includes(q)));
      if(sort==='newest')rs.sort((a,b)=>b.year-a.year||a.stateName.localeCompare(b.stateName)); else if(sort==='error')rs.sort((a,b)=>(b.error??-1)-(a.error??-1)||b.year-a.year); else rs.sort((a,b)=>a.stateName.localeCompare(b.stateName)||a.year-b.year);
      const box=document.getElementById('sehList'); if(!box)return;
      if(sort==='state'){
        const groups={};rs.forEach(r=>(groups[r.state]||(groups[r.state]=[])).push(r));
        box.innerHTML=Object.keys(groups).map(ab=>`<section class="seh-state"><div class="seh-state-head"><h3>${esc(groups[ab][0].stateName)}</h3><span>${esc(groups[ab][0].seatClass)} · ${groups[ab][0].swing2026?'2026 battleground':'2026 seat'}</span></div>${groups[ab].map(row).join('')}</section>`).join('')||'<div class="seh-note">No races match these filters.</div>';
      }else box.innerHTML=`<section class="seh-state">${rs.map(row).join('')}</section>`;
    }
    ['sehSearch','sehState','sehStatus','sehSort'].forEach(id=>document.getElementById(id)?.addEventListener(id==='sehSearch'?'input':'change',list)); list();
    const home=document.getElementById('page-home'); if(home) for(const el of home.querySelectorAll('*')) if(!el.children.length&&/every U\.S\. Senate polling miss of the 21st century/i.test(el.textContent||'')) el.textContent='Uses the complete 21st-century polling history of every U.S. Senate seat up for election in 2026 to inform the model.';
    busy=false;
  }

  fetch(DATA_URL,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(r.status);return r.json()}).then(d=>{data=d;render();setTimeout(render,600)}).catch(e=>console.warn('Historical Senate data unavailable',e));
  new MutationObserver(()=>{if(data&&!busy&&document.getElementById('page-errors')&&!document.querySelector('#page-errors .seh'))render()}).observe(document.body,{childList:true,subtree:true});
})();

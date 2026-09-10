(()=>{
  const DATA_URL='/senate-error-history-data.json?v=20260910-0919';
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const fmt=n=>Number.isFinite(Number(n))?Number(n).toFixed(1):'—';
  let data=null, busy=false;

  // State fundamentals = state presidential D-R margin minus the national presidential D-R margin
  // in the most recent presidential election at or before the Senate race. Positive = D-leaning vs U.S.; negative = R-leaning.
  const FUNDAMENTALS={
    2000:{AK:-31.5,GA:-12.2,IA:-0.2,KS:-21.3,ME:4.6,MI:4.6,MN:1.9,NE:-29.5,NH:-1.8,NC:-13.3,OH:-4.0,TX:-21.8},
    2004:{OH:0.4},
    2008:{AK:-28.8,GA:-12.5,IA:2.3,KS:-22.2,ME:10.1,MI:9.2,MN:3.0,NE:-22.2,NH:2.3,NC:-6.9,OH:-2.7,TX:-19.0},
    2012:{AK:-17.9,GA:-11.7,IA:2.0,KS:-25.6,ME:11.4,MI:5.6,MN:3.8,NE:-25.6,NH:1.7,NC:-5.9,OH:-0.9,TX:-19.7},
    2016:{AK:-16.8,GA:-7.2,IA:-11.5,KS:-22.5,ME:0.9,MI:-2.3,MN:-0.6,NE:-27.2,NH:-1.7,NC:-5.8,OH:-10.2,TX:-11.1},
    2020:{AK:-14.5,GA:-4.2,IA:-12.7,KS:-19.1,ME:4.6,MI:-1.7,MN:2.7,NE:-23.5,NH:2.9,NC:-5.8,OH:-12.5,TX:-10.0}
  };
  const baselineYear=y=>y>=2020?2020:y>=2016?2016:y>=2012?2012:y>=2008?2008:y>=2004?2004:2000;
  const fundamentals=r=>{const y=baselineYear(Number(r.year));const v=FUNDAMENTALS[y]?.[r.state];return Number.isFinite(v)?{year:y,lean:v}:null};
  const partyClass=v=>v>0?'d':v<0?'r':'even';
  const marginLabel=v=>!Number.isFinite(v)?'—':Math.abs(v)<.05?'EVEN':`${v>0?'D':'R'} +${Math.abs(v).toFixed(1)}`;
  const partyWord=v=>v>0?'Democrats':v<0?'Republicans':'Neither party';
  const otherParty=v=>v>0?'Republicans':v<0?'Democrats':'Neither party';
  const drMargin=(r,kind)=>{
    const wp=(r.winnerParty||'').toUpperCase(), rp=(r.runnerUpParty||'').toUpperCase();
    if(!(['DEM','REP'].includes(wp)&&['DEM','REP'].includes(rp))) return null;
    if(kind==='actual') return wp==='DEM'?Number(r.actualMargin):-Number(r.actualMargin);
    if(!r.pollCount||!Number.isFinite(Number(r.pollMargin))) return null;
    let p=null;
    if(String(r.pollLeader||'')===String(r.winner||''))p=wp;
    else if(String(r.pollLeader||'')===String(r.runnerUp||''))p=rp;
    if(!p)return null;
    return p==='DEM'?Number(r.pollMargin):-Number(r.pollMargin);
  };
  const performanceText=(gap,benchmark)=>{
    if(!Number.isFinite(gap))return `${benchmark}: not comparable`;
    if(Math.abs(gap)<.05)return `Matched ${benchmark}`;
    return `${partyWord(gap)} overperformed ${benchmark} by ${Math.abs(gap).toFixed(1)} · ${otherParty(gap)} underperformed`;
  };

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
      #page-errors .seh h2{font:800 29px/1.08 Georgia,serif;margin:0 0 7px;color:#18263b}
      #page-errors .seh-note{font:600 12px/1.5 Inter,system-ui,sans-serif;color:#68778c}

      /* Swing-state Shockboard */
      #page-errors .seh-shock{position:relative;overflow:hidden;margin:0 0 30px;border-radius:22px;background:linear-gradient(122deg,#061428 0%,#0c2341 53%,#142f51 100%);color:#fff;box-shadow:0 24px 70px rgba(5,20,42,.22)}
      #page-errors .seh-shock:before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 8% 10%,rgba(54,112,211,.30),transparent 28%),radial-gradient(circle at 92% 86%,rgba(219,53,70,.26),transparent 30%),linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:auto,auto,36px 36px,36px 36px}
      #page-errors .seh-shock-inner{position:relative;z-index:1;padding:25px}
      #page-errors .seh-shock-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-end;margin-bottom:16px}
      #page-errors .seh-shock-eyebrow{display:block;font:950 9px/1.2 Inter,system-ui,sans-serif;letter-spacing:1.8px;text-transform:uppercase;color:#9fc0ed}
      #page-errors .seh-shock h2{font:800 clamp(28px,4vw,38px)/1.03 Georgia,serif;color:#fff;margin:5px 0 7px;letter-spacing:-.5px}
      #page-errors .seh-shock-copy{max-width:760px;font:650 12px/1.55 Inter,system-ui,sans-serif;color:#b9c8da}
      #page-errors .seh-shock-count{flex:0 0 auto;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.07);border-radius:999px;padding:8px 11px;font:900 8px/1 Inter,system-ui,sans-serif;letter-spacing:.7px;text-transform:uppercase;color:#e0e9f5;white-space:nowrap}
      #page-errors .seh-shock-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:0 0 13px}
      #page-errors .seh-shock-stat{border:1px solid rgba(255,255,255,.10);border-radius:12px;background:rgba(255,255,255,.055);padding:10px 11px}
      #page-errors .seh-shock-stat span{display:block;font:900 7px/1.2 Inter,system-ui,sans-serif;letter-spacing:.8px;text-transform:uppercase;color:#8fa5bf}
      #page-errors .seh-shock-stat b{display:block;margin-top:4px;font:900 17px/1.1 Inter,system-ui,sans-serif;color:#f7faff}
      #page-errors .seh-shock-grid{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(340px,.92fr);gap:12px}
      #page-errors .seh-feature{position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.14);border-radius:16px;background:rgba(255,255,255,.075);padding:18px;min-height:286px}
      #page-errors .seh-feature:after{content:"";position:absolute;right:-45px;top:-58px;width:210px;height:210px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.10),transparent 68%)}
      #page-errors .seh-feature-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;position:relative;z-index:1}
      #page-errors .seh-feature-state{font:950 9px/1.2 Inter,system-ui,sans-serif;letter-spacing:1.25px;text-transform:uppercase;color:#9fb2cb}
      #page-errors .seh-feature h3{font:800 31px/1 Georgia,serif;margin:4px 0 4px;color:#fff}
      #page-errors .seh-feature-match{font:650 10px/1.4 Inter,system-ui,sans-serif;color:#b5c4d6}
      #page-errors .seh-feature-miss{text-align:right;position:relative;z-index:2}.seh-feature-miss span{display:block;font:950 7px/1 Inter,system-ui,sans-serif;text-transform:uppercase;letter-spacing:1.1px;color:#8ea4bf}.seh-feature-miss b{display:block;margin-top:4px;font:950 34px/1 Inter,system-ui,sans-serif;letter-spacing:-1px}
      #page-errors .seh-d{color:#87b4ff!important}.seh-r{color:#ff8d98!important}.seh-even{color:#d6dfea!important}
      #page-errors .seh-wrong-flag{display:inline-flex;margin-top:8px;border-radius:999px;padding:5px 8px;background:rgba(226,62,78,.16);border:1px solid rgba(255,116,128,.24);font:950 7px/1 Inter,system-ui,sans-serif;letter-spacing:.6px;text-transform:uppercase;color:#ff9ca5}
      #page-errors .seh-verdict{margin-top:14px;padding:11px 12px;border-radius:11px;background:rgba(2,11,25,.35);border:1px solid rgba(255,255,255,.09);font:800 11px/1.5 Inter,system-ui,sans-serif;color:#edf4ff}
      #page-errors .seh-triptych{display:grid;grid-template-columns:1fr 22px 1fr 22px 1fr;align-items:stretch;margin-top:14px}
      #page-errors .seh-stage{border-radius:11px;padding:10px 8px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.10);text-align:center}
      #page-errors .seh-stage span{display:block;font:950 7px/1.2 Inter,system-ui,sans-serif;letter-spacing:.8px;text-transform:uppercase;color:#91a7c1}.seh-stage b{display:block;margin-top:5px;font:950 19px/1 Inter,system-ui,sans-serif}.seh-stage small{display:block;margin-top:4px;font:700 7px/1.25 Inter,system-ui,sans-serif;color:#8499b3}
      #page-errors .seh-arrow{display:grid;place-items:center;color:#738aa7;font:950 16px/1 Inter,system-ui,sans-serif}
      #page-errors .seh-perf{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:12px}.seh-perf-pill{border-radius:10px;padding:8px 9px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.09);font:850 8px/1.35 Inter,system-ui,sans-serif;color:#d7e3f0}.seh-perf-pill b{color:#fff}
      #page-errors .seh-ladder{border:1px solid rgba(255,255,255,.13);border-radius:16px;background:rgba(2,11,25,.28);padding:14px}
      #page-errors .seh-ladder-head{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin-bottom:10px}.seh-ladder-head span{font:950 8px/1.2 Inter,system-ui,sans-serif;letter-spacing:1px;text-transform:uppercase;color:#9aafc8}.seh-ladder-head b{font:850 8px/1.2 Inter,system-ui,sans-serif;color:#dce7f3}
      #page-errors .seh-ladder-list{display:grid;gap:7px}.seh-ladder-row{position:relative;overflow:hidden;width:100%;border:1px solid rgba(255,255,255,.10);border-radius:11px;background:rgba(255,255,255,.055);padding:9px 10px;text-align:left;color:#fff;cursor:pointer;transition:transform .15s ease,background .15s ease}.seh-ladder-row:hover{transform:translateX(2px);background:rgba(255,255,255,.09)}.seh-ladder-row:before{content:"";position:absolute;inset:0 auto 0 0;width:var(--bar,25%);background:var(--barcolor,#5d8fd7);opacity:.17;pointer-events:none}.seh-ladder-main{position:relative;display:grid;grid-template-columns:30px minmax(0,1fr) auto;gap:8px;align-items:center}.seh-rank{width:27px;height:27px;display:grid;place-items:center;border-radius:8px;background:rgba(255,255,255,.09);font:950 8px/1 Inter,system-ui,sans-serif;color:#a8b9cd}.seh-ladder-race strong{display:block;font:900 10px/1.25 Inter,system-ui,sans-serif}.seh-ladder-race small{display:block;margin-top:2px;font:700 7px/1.35 Inter,system-ui,sans-serif;color:#91a6bf;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.seh-ladder-delta{text-align:right}.seh-ladder-delta b{display:block;font:950 13px/1 Inter,system-ui,sans-serif}.seh-ladder-delta small{display:block;margin-top:2px;font:900 6px/1 Inter,system-ui,sans-serif;letter-spacing:.4px;text-transform:uppercase;color:#8298b2}
      #page-errors .seh-shock-foot{display:flex;justify-content:space-between;gap:15px;align-items:center;margin-top:12px;padding-top:11px;border-top:1px solid rgba(255,255,255,.10);font:700 8px/1.45 Inter,system-ui,sans-serif;color:#91a5bd}.seh-shock-foot strong{color:#d6e2ef}.seh-shock-foot button{border:0;background:transparent;color:#b9d4ff;font:950 8px/1 Inter,system-ui,sans-serif;text-transform:uppercase;letter-spacing:.55px;cursor:pointer;padding:0}

      #page-errors .seh-controls{display:grid;grid-template-columns:1.6fr repeat(3,minmax(130px,.55fr));gap:10px;margin:18px 0}
      #page-errors .seh-controls input,#page-errors .seh-controls select{width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid #cfd8e5;border-radius:12px;background:#fff;color:#17263d;font:700 12px Inter,system-ui,sans-serif}
      #page-errors .seh-state{border:1px solid #dce3ed;border-radius:17px;background:#fff;overflow:hidden;margin:14px 0}
      #page-errors .seh-state-head{display:flex;align-items:end;justify-content:space-between;gap:12px;padding:15px 17px;background:#f7f9fc;border-bottom:1px solid #e2e8f0}
      #page-errors .seh-state-head h3{font:800 23px/1 Georgia,serif;margin:0}.seh-state-head span{font:900 9px/1.2 Inter,system-ui,sans-serif;letter-spacing:1px;text-transform:uppercase;color:#77869a}
      #page-errors .seh-row{display:grid;grid-template-columns:62px minmax(190px,1.45fr) minmax(145px,1fr) minmax(145px,1fr) 80px 88px;gap:10px;align-items:center;padding:13px 17px;border-bottom:1px solid #edf1f6;font:700 11px/1.4 Inter,system-ui,sans-serif}
      #page-errors .seh-row:last-child{border-bottom:0}.seh-year{font:900 18px/1 Georgia,serif}.seh-match{font-weight:850}.seh-label{display:block;margin-bottom:3px;font:900 8px/1.2 Inter,system-ui,sans-serif;letter-spacing:1px;text-transform:uppercase;color:#8a96a7}.seh-error{font:900 15px/1.1 Georgia,serif}.seh-wrong{color:#b42334;font-weight:900}.seh-badge{display:inline-flex;border-radius:999px;padding:7px 9px;font:900 9px/1 Inter,system-ui,sans-serif;letter-spacing:.8px}.seh-hit{background:#e8f6ee;color:#177447}.seh-miss{background:#fdebed;color:#b42334}.seh-none{background:#eef1f5;color:#667387}
      #page-errors .seh-context{display:block;margin-top:5px;font:750 8px/1.35 Inter,system-ui,sans-serif;color:#68788d}.seh-context b{font-weight:950}.seh-context .d{color:#2f67b7}.seh-context .r{color:#ba2b3a}
      #page-errors .seh-source{margin-top:24px;padding-top:17px;border-top:1px solid #dce3ed;font:600 10px/1.55 Inter,system-ui,sans-serif;color:#6d7a8d}.seh-source a{color:#315f9e;font-weight:850}
      @media(max-width:920px){#page-errors .seh-shock-grid{grid-template-columns:1fr}.seh-shock-head{align-items:flex-start!important;flex-direction:column}.seh-shock-count{white-space:normal!important}.seh-feature{min-height:0!important}}
      @media(max-width:850px){#page-errors .seh-stats{grid-template-columns:repeat(2,1fr)}#page-errors .seh-shock-stats{grid-template-columns:repeat(2,1fr)}#page-errors .seh-controls{grid-template-columns:1fr 1fr}#page-errors .seh-row{grid-template-columns:54px 1fr 80px;align-items:start}.seh-row .seh-poll,.seh-row .seh-result{grid-column:2}.seh-row .seh-status,.seh-row .seh-error{grid-column:3}}
      @media(max-width:520px){#page-errors .seh-controls{grid-template-columns:1fr}#page-errors .seh-row{padding:12px 10px}.seh-state-head{padding:14px 10px!important}#page-errors .seh-shock-inner{padding:18px 13px}.seh-feature{padding:13px!important}.seh-feature h3{font-size:26px!important}.seh-feature-miss b{font-size:28px!important}.seh-triptych{grid-template-columns:1fr 14px 1fr 14px 1fr!important}.seh-stage{padding:8px 5px!important}.seh-stage b{font-size:14px!important}.seh-stage small{display:none!important}.seh-perf{grid-template-columns:1fr!important}.seh-shock-foot{align-items:flex-start!important;flex-direction:column}.seh-ladder{padding:11px!important}}
    `; document.head.appendChild(st);
  }

  function stat(label,val){return `<div class="seh-stat"><span>${esc(label)}</span><b>${esc(val)}</b></div>`}
  function row(r){
    const badge=r.status==='HIT'?'<span class="seh-badge seh-hit">HIT</span>':r.status==='MISS'?'<span class="seh-badge seh-miss">MISS</span>':'<span class="seh-badge seh-none">NO POLLING</span>';
    const poll=r.pollCount?`${esc(r.pollLeader)} +${fmt(r.pollMargin)} <small>(${r.pollCount} poll${r.pollCount===1?'':'s'})</small>`:'No qualifying public polls';
    const result=r.winner?`${esc(r.winner)} +${fmt(r.actualMargin)}`:'Result unavailable';
    const f=fundamentals(r), a=drMargin(r,'actual'), p=drMargin(r,'poll'), pg=a!==null&&p!==null?a-p:null, fg=a!==null&&f?a-f.lean:null;
    const context=(r.swing2026&&f&&a!==null)?`<span class="seh-context">Fundamentals: <b class="${partyClass(f.lean)}">${marginLabel(f.lean)}</b> vs U.S.${pg!==null?` · ${partyWord(pg)} ${Math.abs(pg).toFixed(1)} pts vs polls`:''}${fg!==null?` · ${partyWord(fg)} ${Math.abs(fg).toFixed(1)} pts vs fundamentals`:''}</span>`:'';
    return `<div class="seh-row"><div class="seh-year">${r.year}</div><div class="seh-match"><span class="seh-label">Matchup</span>${esc(r.matchup||'—')}${r.stage==='runoff'?'<br><small>deciding runoff</small>':''}${context}</div><div class="seh-poll"><span class="seh-label">Final polling avg.</span>${poll}</div><div class="seh-result"><span class="seh-label">Result</span>${result}${r.wrongWinner?'<br><small class="seh-wrong">wrong winner in polls</small>':''}</div><div class="seh-error"><span class="seh-label">Error</span>${r.error!=null?fmt(r.error)+' pts':'—'}</div><div class="seh-status">${badge}</div></div>`;
  }

  function renderShockboard(){
    const host=document.getElementById('sehShock'); if(!host)return;
    const swing=data.records.filter(r=>r.swing2026&&r.status==='MISS').map(r=>{
      const f=fundamentals(r), poll=drMargin(r,'poll'), result=drMargin(r,'actual');
      return {r,f,poll,result,pollGap:poll!==null&&result!==null?result-poll:null,fundGap:f&&result!==null?result-f.lean:null};
    }).filter(z=>z.pollGap!==null).sort((a,b)=>Math.abs(b.pollGap)-Math.abs(a.pollGap));
    if(!swing.length){host.innerHTML='<div class="seh-shock-copy">No scored swing-state misses are available.</div>';return;}
    const feature=swing[0], rest=swing.slice(1,8), max=Math.max(...swing.map(z=>Math.abs(z.pollGap)),1);
    const avg=swing.reduce((s,z)=>s+Math.abs(z.pollGap),0)/swing.length;
    const wrong=swing.filter(z=>z.r.wrongWinner).length;
    const fundScored=swing.filter(z=>z.fundGap!==null);
    const biggestFund=fundScored.length?fundScored.reduce((a,b)=>Math.abs(b.fundGap)>Math.abs(a.fundGap)?b:a):null;
    const pg=feature.pollGap, fg=feature.fundGap, f=feature.f;
    const verdict=`<b class="seh-${partyClass(pg)}">${partyWord(pg)}</b> beat the final polling margin by <b>${Math.abs(pg).toFixed(1)} points</b>; ${otherParty(pg).toLowerCase()} underperformed it by the same amount.${fg!==null?` Against the state's partisan baseline, <b class="seh-${partyClass(fg)}">${partyWord(fg)}</b> ran <b>${Math.abs(fg).toFixed(1)} points stronger</b> than fundamentals.`:''}`;
    host.innerHTML=`
      <div class="seh-shock-head"><div><span class="seh-shock-eyebrow">SWING-STATE MISSES · THE SHOCKBOARD</span><h2>Where the polls broke in the races that matter now.</h2><div class="seh-shock-copy">The current 2026 battleground group, backtested across prior Senate elections. Every scored race below compares <b>final polls → state fundamentals → actual result</b>, so you can see whether the surprise came from polling, candidate strength, or both.</div></div><div class="seh-shock-count">${swing.length} historical misses scored</div></div>
      <div class="seh-shock-stats"><div class="seh-shock-stat"><span>Largest polling miss</span><b>${Math.abs(feature.pollGap).toFixed(1)} pts</b></div><div class="seh-shock-stat"><span>Average swing miss</span><b>${avg.toFixed(1)} pts</b></div><div class="seh-shock-stat"><span>Wrong-winner calls</span><b>${wrong}</b></div><div class="seh-shock-stat"><span>Largest fundamentals gap</span><b>${biggestFund?marginLabel(biggestFund.fundGap):'—'}</b></div></div>
      <div class="seh-shock-grid">
        <section class="seh-feature">
          <div class="seh-feature-top"><div><div class="seh-feature-state">#1 shock · ${feature.r.year} U.S. Senate</div><h3>${esc(feature.r.stateName)}</h3><div class="seh-feature-match">${esc(feature.r.matchup||'')}</div>${feature.r.wrongWinner?'<span class="seh-wrong-flag">⚡ Polls picked the wrong winner</span>':''}</div><div class="seh-feature-miss"><span>margin shift vs polls</span><b class="seh-${partyClass(pg)}">${marginLabel(pg)}</b></div></div>
          <div class="seh-verdict">${verdict}</div>
          <div class="seh-triptych"><div class="seh-stage"><span>Final polls</span><b class="seh-${partyClass(feature.poll)}">${marginLabel(feature.poll)}</b><small>D–R margin</small></div><div class="seh-arrow">→</div><div class="seh-stage"><span>State fundamentals</span><b class="seh-${partyClass(f?.lean)}">${f?marginLabel(f.lean):'—'}</b><small>${f?f.year+' lean vs U.S.':'not comparable'}</small></div><div class="seh-arrow">→</div><div class="seh-stage"><span>Actual result</span><b class="seh-${partyClass(feature.result)}">${marginLabel(feature.result)}</b><small>D–R margin</small></div></div>
          <div class="seh-perf"><div class="seh-perf-pill"><b>VS POLLS</b><br>${performanceText(pg,'polls')}</div><div class="seh-perf-pill"><b>VS FUNDAMENTALS</b><br>${performanceText(fg,'fundamentals')}</div></div>
        </section>
        <aside class="seh-ladder"><div class="seh-ladder-head"><span>Next biggest shocks</span><b>click a race to inspect it</b></div><div class="seh-ladder-list">${rest.map((z,i)=>{const w=Math.max(12,Math.abs(z.pollGap)/max*100).toFixed(0)+'%',c=partyClass(z.pollGap),bc=c==='d'?'#6b9feb':c==='r'?'#e25c69':'#aab5c3';return `<button type="button" class="seh-ladder-row" data-shock-state="${esc(z.r.state)}" data-shock-year="${z.r.year}" style="--bar:${w};--barcolor:${bc}"><span class="seh-ladder-main"><span class="seh-rank">${String(i+2).padStart(2,'0')}</span><span class="seh-ladder-race"><strong>${esc(z.r.stateName)} · ${z.r.year}${z.r.wrongWinner?' · ⚡ wrong winner':''}</strong><small>Polls ${marginLabel(z.poll)} → fundamentals ${z.f?marginLabel(z.f.lean):'—'} → result ${marginLabel(z.result)}</small></span><span class="seh-ladder-delta"><b class="seh-${c}">${marginLabel(z.pollGap)}</b><small>vs polls</small></span></span></button>`}).join('')}</div><div class="seh-shock-foot"><span><strong>Fundamentals:</strong> the state's presidential D–R margin relative to the national D–R margin in the most recent presidential election at or before that Senate race. It is a partisan baseline, not a forecast.</span><button type="button" id="sehShowSwing">See full miss archive ↓</button></div></aside>
      </div>`;
    host.querySelectorAll('[data-shock-state]').forEach(btn=>btn.addEventListener('click',()=>{
      const state=document.getElementById('sehState'), status=document.getElementById('sehStatus'), sort=document.getElementById('sehSort'), search=document.getElementById('sehSearch');
      if(search)search.value=String(btn.dataset.shockYear||''); if(state)state.value=btn.dataset.shockState||''; if(status)status.value='MISS'; if(sort)sort.value='error';
      document.getElementById('sehList')?.dispatchEvent(new CustomEvent('seh-refresh')); document.getElementById('sehAllHistory')?.scrollIntoView({behavior:'smooth',block:'start'});
    }));
    document.getElementById('sehShowSwing')?.addEventListener('click',()=>{
      const status=document.getElementById('sehStatus'), sort=document.getElementById('sehSort'), search=document.getElementById('sehSearch'), state=document.getElementById('sehState');
      if(search)search.value=''; if(state)state.value=''; if(status)status.value='MISS'; if(sort)sort.value='error';
      document.getElementById('sehList')?.dispatchEvent(new CustomEvent('seh-refresh')); document.getElementById('sehAllHistory')?.scrollIntoView({behavior:'smooth',block:'start'});
    });
  }

  function render(){
    if(!data||busy) return;
    const page=document.getElementById('page-errors'); if(!page) return;
    busy=true; addStyle();
    const st=data.stats, states=[...new Set(data.records.map(r=>r.state))].sort((a,b)=>data.records.find(r=>r.state===a).stateName.localeCompare(data.records.find(r=>r.state===b).stateName));
    page.innerHTML=`<div class="content"><div class="seh"><section class="seh-hero"><div class="seh-kicker">2026 seats only · historical backtest</div><h1>Past Senate Polling Hits & Misses</h1><div class="seh-intro">This database includes only Senate seats that are on the ballot in 2026. For each seat, it shows the previous four election cycles for that same Senate class. A <b>Hit</b> means the final polling average picked the winner and finished within ${fmt(st.hitThreshold)} points of the final margin; everything else is a <b>Miss</b>. Races with no qualifying public polling remain listed but are excluded from the accuracy statistics.</div></section>
      <div class="seh-stats">${stat('2026 states',st.states)}${stat('Seat cycles',st.seatCycles)}${stat('Scored',st.scored)}${stat('Hits',st.hits)}${stat('Misses',st.misses)}${stat('Avg. error',fmt(st.avgAbsError)+' pts')}</div>
      <section class="seh-shock"><div class="seh-shock-inner" id="sehShock"></div></section>
      <section id="sehAllHistory"><h2>All 2026-Seat History</h2><div class="seh-note">Class II seats: 2002, 2008, 2014, 2020. Florida and Ohio Class III special seats: 2004, 2010, 2016, 2022.</div><div class="seh-controls"><input id="sehSearch" placeholder="Search state, candidate or year"><select id="sehState"><option value="">All states</option>${states.map(ab=>`<option value="${ab}">${esc(data.records.find(r=>r.state===ab).stateName)}</option>`).join('')}</select><select id="sehStatus"><option value="">All results</option><option>MISS</option><option>HIT</option><option>NO POLLING</option></select><select id="sehSort"><option value="state">State / year</option><option value="newest">Newest first</option><option value="error">Largest error</option></select></div><div id="sehList"></div></section>
      <div class="seh-source"><b>Sources:</b> ${data.sources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a> — ${esc(s.note)}`).join(' · ')}<br>${esc(data.methodNote||'')}<br><b>Fundamentals:</b> state presidential D–R margin minus national presidential D–R margin in the most recent presidential election at or before the Senate race.</div></div></div>`;

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
    ['sehSearch','sehState','sehStatus','sehSort'].forEach(id=>document.getElementById(id)?.addEventListener(id==='sehSearch'?'input':'change',list));
    document.getElementById('sehList')?.addEventListener('seh-refresh',list);
    list(); renderShockboard();
    const home=document.getElementById('page-home'); if(home) for(const el of home.querySelectorAll('*')) if(!el.children.length&&/every U\.S\. Senate polling miss of the 21st century/i.test(el.textContent||'')) el.textContent='Uses the complete 21st-century polling history of every U.S. Senate seat up for election in 2026 to inform the model.';
    busy=false;
  }

  fetch(DATA_URL,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(r.status);return r.json()}).then(d=>{data=d;render();setTimeout(render,600)}).catch(e=>console.warn('Historical Senate data unavailable',e));
  new MutationObserver(()=>{if(data&&!busy&&document.getElementById('page-errors')&&!document.querySelector('#page-errors .seh'))render()}).observe(document.body,{childList:true,subtree:true});
})();

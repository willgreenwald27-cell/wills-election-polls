(()=>{
  'use strict';
  const DATA_URL='/senate-error-history-data.json?v=20260910-0919';
  const STYLE_ID='ipeImmersiveHistoryStyle';
  const ROOT_CLASS='ipe-root';
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const num=v=>Number.isFinite(Number(v))?Number(v):null;
  const one=v=>num(v)===null?'—':num(v).toFixed(1);
  let data=null;
  let rendering=false;
  let storyRows=[];
  let storyPos=-1;

  /* State baseline = state presidential D-R margin minus national presidential D-R margin.
     Midterm Senate races use the most recent presidential election at or before that race. */
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
  const partyClass=v=>!Number.isFinite(v)||Math.abs(v)<.05?'even':v>0?'d':'r';
  const partyName=v=>!Number.isFinite(v)||Math.abs(v)<.05?'Neither party':v>0?'Democrats':'Republicans';
  const oppositeParty=v=>!Number.isFinite(v)||Math.abs(v)<.05?'Neither party':v>0?'Republicans':'Democrats';
  const marginLabel=v=>!Number.isFinite(v)?'—':Math.abs(v)<.05?'EVEN':`${v>0?'D':'R'}+${Math.abs(v).toFixed(1)}`;
  const shortParty=p=>String(p||'').toUpperCase().startsWith('DEM')?'D':String(p||'').toUpperCase().startsWith('REP')?'R':'I';
  const partyCardClass=p=>shortParty(p)==='D'?'d':shortParty(p)==='R'?'r':'i';
  const statusClass=s=>String(s||'').toUpperCase()==='HIT'?'hit':String(s||'').toUpperCase()==='MISS'?'miss':'nopoll';

  function drMargin(r,kind){
    const wp=shortParty(r.winnerParty), rp=shortParty(r.runnerUpParty);
    if(!(['D','R'].includes(wp)&&['D','R'].includes(rp)))return null;
    if(kind==='actual'){
      const m=num(r.actualMargin); if(m===null)return null;
      return wp==='D'?m:-m;
    }
    const pm=num(r.pollMargin); if(pm===null||!r.pollCount)return null;
    let p=null;
    if(String(r.pollLeader||'')===String(r.winner||''))p=wp;
    else if(String(r.pollLeader||'')===String(r.runnerUp||''))p=rp;
    if(!p)return null;
    return p==='D'?pm:-pm;
  }
  const pollGap=r=>{const p=drMargin(r,'poll'),a=drMargin(r,'actual');return p===null||a===null?null:a-p};
  const fundGap=r=>{const f=fundamentals(r),a=drMargin(r,'actual');return !f||a===null?null:a-f.lean};
  const absError=r=>num(r.error)??(pollGap(r)===null?null:Math.abs(pollGap(r)));
  const candidateMiss=(r,which)=>{
    const ap=which==='winner'?num(r.actualWinnerPct):num(r.actualRunnerPct);
    const pp=which==='winner'?num(r.pollWinnerPct):num(r.pollRunnerPct);
    return ap===null||pp===null?null:ap-pp;
  };
  const signed=v=>!Number.isFinite(v)?'—':`${v>0?'+':''}${v.toFixed(1)}`;
  const pollResultLabel=r=>{
    if(!r.pollCount||num(r.pollMargin)===null)return 'No qualifying polling';
    return `${r.pollLeader||'Polling leader'} ${num(r.pollMargin)===0?'EVEN':'+'+one(r.pollMargin)}`;
  };
  const finalResultLabel=r=>`${r.winner||'Winner'} +${one(r.actualMargin)}`;
  const performanceSentence=(v,kind)=>{
    if(!Number.isFinite(v))return kind==='fund'?'No state-baseline comparison available.':'No polling-margin comparison available.';
    if(Math.abs(v)<.05)return kind==='fund'?'The result landed on the state baseline.':'The polling margin landed on the result.';
    return kind==='fund'
      ? `${partyName(v)} ran ${Math.abs(v).toFixed(1)} points stronger than the state baseline; ${oppositeParty(v).toLowerCase()} ran the same amount weaker.`
      : `${partyName(v)} finished ${Math.abs(v).toFixed(1)} points stronger than the final polling margin; ${oppositeParty(v).toLowerCase()} finished the same amount weaker.`;
  };

  function addStyle(){
    document.getElementById('sehStyle')?.remove();
    if(document.getElementById(STYLE_ID))return;
    const st=document.createElement('style');
    st.id=STYLE_ID;
    st.textContent=`
      #page-errors{background:#f4f6fb!important;color:#14233c!important}
      #page-errors>.page-head,#page-errors>.content{display:none!important}
      #page-errors .${ROOT_CLASS}{font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;overflow:hidden;background:#f4f6fb;min-height:100vh}
      #page-errors .ipe-shell{width:min(1320px,calc(100% - 54px));margin:0 auto}
      #page-errors .ipe-hero{position:relative;min-height:570px;display:flex;align-items:center;color:#fff;background:linear-gradient(118deg,#071b40 0%,#0d3977 42%,#6e284f 73%,#b23b48 100%);overflow:hidden}
      #page-errors .ipe-grid{position:absolute;inset:0;opacity:.15;background-image:linear-gradient(rgba(255,255,255,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.12) 1px,transparent 1px);background-size:56px 56px;pointer-events:none}
      #page-errors .ipe-hero-inner{position:relative;z-index:1;width:min(1320px,calc(100% - 54px));margin:0 auto;display:grid;grid-template-columns:1.08fr .92fr;gap:56px;align-items:center;padding:66px 0 90px}
      #page-errors .ipe-kicker{font-size:10px;font-weight:1000;letter-spacing:1.85px;text-transform:uppercase;color:#c2d9fa;margin-bottom:14px}
      #page-errors .ipe-hero h1{font-family:Georgia,"Times New Roman",serif;font-size:clamp(52px,6.2vw,88px);line-height:.92;letter-spacing:-3px;margin:0 0 20px;max-width:770px;color:#fff}
      #page-errors .ipe-hero h1 em{font-weight:400;color:#ffd6dc}
      #page-errors .ipe-hero-copy>p{font-size:15px;line-height:1.68;color:#dce8f6;max-width:710px;margin:0}
      #page-errors .ipe-hero-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:26px}
      #page-errors .ipe-btn{border:0;border-radius:12px;padding:12px 16px;font-size:10px;font-weight:950;letter-spacing:.25px;cursor:pointer}
      #page-errors .ipe-btn.light{background:#fff;color:#12335f;box-shadow:0 12px 30px rgba(0,0,0,.16)}
      #page-errors .ipe-btn.ghost{background:rgba(255,255,255,.09);color:#fff;border:1px solid rgba(255,255,255,.28)}
      #page-errors .ipe-demo{border:1px solid rgba(255,255,255,.19);background:rgba(4,18,43,.42);backdrop-filter:blur(14px);border-radius:24px;padding:24px;box-shadow:0 30px 90px rgba(0,0,0,.25)}
      #page-errors .ipe-demo-label{font-size:8px;letter-spacing:1.4px;font-weight:1000;color:#afc8e6;text-transform:uppercase;margin-bottom:13px}
      #page-errors .ipe-demo-stage{display:grid;grid-template-columns:1fr 35px 1fr;gap:10px;align-items:stretch}
      #page-errors .ipe-demo-card{min-height:154px;border-radius:17px;padding:18px;display:flex;flex-direction:column;justify-content:flex-end;overflow:hidden}
      #page-errors .ipe-demo-card.poll{background:linear-gradient(145deg,#1555a0,#1976cf)}
      #page-errors .ipe-demo-card.result{background:linear-gradient(145deg,#922b3b,#d44f5c)}
      #page-errors .ipe-demo-card span{font-size:7px;font-weight:1000;letter-spacing:.85px;color:rgba(255,255,255,.72);text-transform:uppercase}
      #page-errors .ipe-demo-card b{font-family:Georgia,serif;font-size:22px;line-height:1.05;margin:6px 0;color:#fff}
      #page-errors .ipe-demo-card small{font-size:8px;line-height:1.45;color:rgba(255,255,255,.74)}
      #page-errors .ipe-demo-arrow{display:grid;place-items:center;font-size:27px;color:rgba(255,255,255,.82)}
      #page-errors .ipe-demo-verdicts{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}
      #page-errors .ipe-demo-verdicts div{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.10);border-radius:11px;padding:10px}
      #page-errors .ipe-demo-verdicts span{display:block;font-size:6px;letter-spacing:.8px;font-weight:1000;color:#93a9c2;text-transform:uppercase}
      #page-errors .ipe-demo-verdicts b{display:block;margin-top:5px;color:#fff;font-size:10px}

      #page-errors .ipe-main{position:relative;z-index:2;margin-top:-52px;padding-bottom:60px}
      #page-errors .ipe-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:13px}
      #page-errors .ipe-metric{min-height:154px;border-radius:19px;padding:20px;color:#fff;display:flex;flex-direction:column;justify-content:flex-end;box-shadow:0 18px 50px rgba(12,29,60,.16);overflow:hidden}
      #page-errors .ipe-metric.blue{background:linear-gradient(145deg,#0f4d9c,#1b78d5)}
      #page-errors .ipe-metric.red{background:linear-gradient(145deg,#9d2f43,#e15663)}
      #page-errors .ipe-metric.purple{background:linear-gradient(145deg,#4b3596,#7a59d4)}
      #page-errors .ipe-metric.gold{background:linear-gradient(145deg,#84570f,#d59424)}
      #page-errors .ipe-metric span{font-size:8px;font-weight:1000;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,.8)}
      #page-errors .ipe-metric b{font-family:Georgia,serif;font-size:38px;line-height:1;margin:8px 0 7px;color:#fff}
      #page-errors .ipe-metric small{font-size:8px;line-height:1.4;color:rgba(255,255,255,.77)}

      #page-errors .ipe-method{margin:28px 0;background:#fff;border:1px solid #dfe5ee;border-radius:23px;padding:30px;box-shadow:0 18px 55px rgba(25,44,76,.07)}
      #page-errors .ipe-section-kicker{font-size:8px;font-weight:1000;letter-spacing:1.35px;text-transform:uppercase;color:#758398;margin-bottom:7px}
      #page-errors .ipe-method h2,#page-errors .ipe-section-head h2{font-family:Georgia,serif;font-size:37px;line-height:1.02;letter-spacing:-.7px;margin:0 0 9px;color:#14243d}
      #page-errors .ipe-method-intro,#page-errors .ipe-section-head p{font-size:11px;line-height:1.6;color:#6a788b;max-width:820px;margin:0}
      #page-errors .ipe-method-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:22px}
      #page-errors .ipe-method-card{border-radius:17px;padding:21px;min-height:190px;border:1px solid transparent}
      #page-errors .ipe-method-card.blue{background:#eaf4ff;border-color:#cfe3f8}
      #page-errors .ipe-method-card.red{background:#fff0f2;border-color:#f2d3d8}
      #page-errors .ipe-method-card.gold{background:#fff8e6;border-color:#f0dfad}
      #page-errors .ipe-method-num{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:30px;border-radius:9px;padding:0 10px;color:#fff;font-family:Georgia,serif;font-size:16px;font-weight:800;margin-bottom:13px}
      #page-errors .ipe-method-card.blue .ipe-method-num{background:#2a72bd}
      #page-errors .ipe-method-card.red .ipe-method-num{background:#c3404f}
      #page-errors .ipe-method-card.gold .ipe-method-num{background:#b77d17}
      #page-errors .ipe-method-card h3{font-family:Georgia,serif;font-size:20px;line-height:1.08;margin:0 0 8px;color:#17263f}
      #page-errors .ipe-method-card p{font-size:10px;line-height:1.6;color:#5c6b7f;margin:0}
      #page-errors .ipe-method-note{margin-top:13px;padding:12px 14px;border-radius:11px;background:#f3f6fa;border-left:4px solid #7287a5;color:#637187;font-size:9px;line-height:1.55}

      #page-errors .ipe-swing{margin:30px 0 35px}
      #page-errors .ipe-section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:14px}
      #page-errors .ipe-section-head .ipe-chip{flex:0 0 auto;border-radius:11px;padding:9px 11px;background:#122b55;color:#fff;font-size:8px;font-weight:1000;letter-spacing:.7px;text-transform:uppercase}
      #page-errors .ipe-shocks{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
      #page-errors .ipe-shock{min-height:180px;border:0;border-radius:18px;padding:20px;text-align:left;color:#fff;cursor:pointer;box-shadow:0 15px 38px rgba(16,38,75,.13);transition:transform .15s ease,box-shadow .15s ease;position:relative;overflow:hidden}
      #page-errors .ipe-shock:nth-child(3n+1){background:linear-gradient(145deg,#0b2a59,#1e5792)}
      #page-errors .ipe-shock:nth-child(3n+2){background:linear-gradient(145deg,#75293f,#b53d4b)}
      #page-errors .ipe-shock:nth-child(3n){background:linear-gradient(145deg,#49327c,#7554b8)}
      #page-errors .ipe-shock:hover{transform:translateY(-4px);box-shadow:0 22px 48px rgba(16,38,75,.20)}
      #page-errors .ipe-shock-rank{font-size:7px;font-weight:1000;letter-spacing:1px;color:rgba(255,255,255,.63);text-transform:uppercase}
      #page-errors .ipe-shock strong{display:block;font-family:Georgia,serif;font-size:26px;line-height:1;margin:8px 0 11px;color:#fff}
      #page-errors .ipe-shock-route{display:grid;grid-template-columns:1fr auto 1fr;gap:7px;align-items:center;margin-top:4px}
      #page-errors .ipe-shock-route span{font-size:7px;color:rgba(255,255,255,.68);text-transform:uppercase;letter-spacing:.45px}
      #page-errors .ipe-shock-route b{display:block;font-size:14px;color:#fff;margin-top:3px}
      #page-errors .ipe-shock-route i{font-style:normal;color:rgba(255,255,255,.75)}
      #page-errors .ipe-shock-foot{position:absolute;left:20px;right:20px;bottom:17px;display:flex;justify-content:space-between;gap:8px;align-items:end}
      #page-errors .ipe-shock-foot small{font-size:7px;color:rgba(255,255,255,.72)}
      #page-errors .ipe-shock-foot em{font-style:normal;font-size:20px;font-weight:1000;color:#fff}

      #page-errors .ipe-archive{padding:25px 0 20px}
      #page-errors .ipe-controls{display:grid;grid-template-columns:minmax(210px,1.7fr) 1fr 1fr 1fr;gap:9px;background:#fff;border:1px solid #dfe5ed;border-radius:17px;padding:16px;margin:14px 0 20px;box-shadow:0 12px 35px rgba(25,44,76,.06)}
      #page-errors .ipe-controls input,#page-errors .ipe-controls select{min-height:42px;border:1px solid #d8e0e9;border-radius:10px;background:#f8fafc;color:#26364e;padding:0 11px;font-size:10px;font-weight:750;outline:none}
      #page-errors .ipe-controls input:focus,#page-errors .ipe-controls select:focus{border-color:#6b8fbd;box-shadow:0 0 0 3px rgba(63,116,182,.10)}
      #page-errors .ipe-results{font-size:9px;font-weight:850;color:#7a8799;margin:0 2px 10px}
      #page-errors .ipe-state{margin:0 0 26px}
      #page-errors .ipe-state-head{background:linear-gradient(90deg,#102e5c,#315b8e 55%,#9c3a4b);color:#fff;border-radius:15px 15px 0 0;padding:13px 16px;display:flex;align-items:end;justify-content:space-between;gap:18px}
      #page-errors .ipe-state-head h3{font-family:Georgia,serif;font-size:29px;line-height:1;margin:0;color:#fff}
      #page-errors .ipe-state-head span{font-size:8px;line-height:1.35;color:rgba(255,255,255,.78);font-weight:850;text-align:right}
      #page-errors .ipe-state-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding-top:12px}
      #page-errors .ipe-race{position:relative;border:1px solid #dfe5ed;border-top:5px solid #71849c;border-radius:16px;background:#fff;padding:17px;text-align:left;color:#24344b;box-shadow:0 10px 29px rgba(19,39,72,.065);transition:transform .14s ease,box-shadow .14s ease;min-height:210px}
      #page-errors button.ipe-race{cursor:pointer;width:100%}
      #page-errors button.ipe-race:hover{transform:translateY(-3px);box-shadow:0 16px 38px rgba(19,39,72,.11)}
      #page-errors .ipe-race.hit{border-top-color:#2c78c7}
      #page-errors .ipe-race.miss{border-top-color:#c6404d}
      #page-errors .ipe-race.nopoll{border-top-color:#a2adba;background:#fafbfc}
      #page-errors .ipe-race-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
      #page-errors .ipe-race-year{font-size:8px;font-weight:1000;letter-spacing:1px;color:#7d899b;text-transform:uppercase}
      #page-errors .ipe-race h4{font-family:Georgia,serif;font-size:21px;line-height:1.05;margin:5px 0 3px;color:#182943}
      #page-errors .ipe-race-match{font-size:8px;line-height:1.4;color:#7a8799;max-width:310px}
      #page-errors .ipe-status{flex:0 0 auto;border-radius:9px;padding:6px 8px;font-size:7px;font-weight:1000;letter-spacing:.65px;text-transform:uppercase}
      #page-errors .ipe-status.hit{background:#e7f3ff;color:#2667a9}
      #page-errors .ipe-status.miss{background:#fff0f1;color:#a82f3c}
      #page-errors .ipe-status.nopoll{background:#edf1f5;color:#697788}
      #page-errors .ipe-journey{display:grid;grid-template-columns:1fr 42px 1fr;gap:7px;align-items:center;margin:14px 0 12px}
      #page-errors .ipe-journey-box{border-radius:11px;padding:10px 11px;min-width:0}
      #page-errors .ipe-journey-box.poll{background:#eaf4ff}.ipe-journey-box.result{background:#fff0f2}
      #page-errors .ipe-journey-box span{display:block;font-size:6px;font-weight:1000;letter-spacing:.6px;text-transform:uppercase;color:#74849a;margin-bottom:4px}
      #page-errors .ipe-journey-box b{display:block;font-family:Georgia,serif;font-size:13px;color:#1a3c68;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      #page-errors .ipe-journey-box.result b{color:#762d39}
      #page-errors .ipe-journey-mid{text-align:center}.ipe-journey-mid b{display:block;font-size:10px;color:#314359}.ipe-journey-mid span{display:block;font-size:6px;color:#8c98a7;text-transform:uppercase;letter-spacing:.45px}
      #page-errors .ipe-mini-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:10px}
      #page-errors .ipe-mini{background:#f5f7fa;border-radius:9px;padding:8px 9px;min-width:0}.ipe-mini span{display:block;font-size:6px;color:#8491a2;text-transform:uppercase;letter-spacing:.55px;font-weight:1000}.ipe-mini b{display:block;margin-top:4px;font-size:10px;color:#314159;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      #page-errors .ipe-nopoll-copy{margin-top:16px;background:#f0f3f6;border-radius:11px;padding:13px;font-size:9px;line-height:1.55;color:#69788b}
      #page-errors .ipe-open{position:absolute;right:16px;bottom:13px;font-size:7px;font-weight:1000;letter-spacing:.45px;color:#6f7f93;text-transform:uppercase}
      #page-errors .ipe-source{margin:22px 0 0;border-radius:14px;background:#e9eef5;padding:15px 17px;font-size:8px;line-height:1.55;color:#66768b}
      #page-errors .ipe-source a{color:#245e9d;text-decoration:underline}

      #page-errors .ipe-modal{display:none;position:fixed;inset:0;z-index:9999;background:#f3f6fb;overflow:auto;color:#172941}
      #page-errors .ipe-modal.show{display:block}
      #page-errors .ipe-modal-close{position:fixed;right:20px;top:17px;z-index:4;width:44px;height:40px;border-radius:11px;border:1px solid rgba(255,255,255,.25);background:#fff;color:#15355f;font-size:21px;line-height:1;box-shadow:0 8px 24px rgba(0,0,0,.16);cursor:pointer}
      #page-errors .ipe-modal-hero{position:relative;overflow:hidden;background:linear-gradient(120deg,#08265d 0%,#18528f 45%,#7a2d4b 75%,#b73d49 100%);color:#fff;padding:70px max(26px,calc((100vw - 1180px)/2)) 38px}
      #page-errors .ipe-modal-grid{position:absolute;inset:0;opacity:.11;background-image:linear-gradient(rgba(255,255,255,.18) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.18) 1px,transparent 1px);background-size:58px 58px;pointer-events:none}
      #page-errors .ipe-modal-hero>*:not(.ipe-modal-grid){position:relative;z-index:1}
      #page-errors .ipe-modal-kicker{font-size:8px;font-weight:1000;letter-spacing:1.35px;text-transform:uppercase;color:#c0d8f3}
      #page-errors .ipe-modal-title{display:flex;align-items:end;justify-content:space-between;gap:25px;margin-top:8px}
      #page-errors .ipe-modal-title h2{font-family:Georgia,serif;font-size:clamp(58px,8vw,104px);line-height:.9;letter-spacing:-3px;margin:0;color:#fff}
      #page-errors .ipe-modal-shift{text-align:right}.ipe-modal-shift span{display:block;font-size:7px;font-weight:1000;letter-spacing:.9px;text-transform:uppercase;color:#c1d0e2}.ipe-modal-shift b{display:block;font-family:Georgia,serif;font-size:50px;line-height:1;margin-top:4px;color:#fff}
      #page-errors .ipe-modal-journey{display:grid;grid-template-columns:1fr 70px 1fr;gap:14px;align-items:center;margin:30px 0 20px}
      #page-errors .ipe-modal-stage{border-radius:17px;padding:18px 20px;border:1px solid rgba(255,255,255,.15);box-shadow:inset 0 1px rgba(255,255,255,.11)}
      #page-errors .ipe-modal-stage.poll{background:rgba(13,79,151,.60)}.ipe-modal-stage.result{background:rgba(160,42,55,.62)}
      #page-errors .ipe-modal-stage span{display:block;font-size:7px;letter-spacing:.9px;font-weight:1000;color:rgba(255,255,255,.69);text-transform:uppercase}.ipe-modal-stage b{display:block;font-family:Georgia,serif;font-size:27px;line-height:1.05;margin:6px 0;color:#fff}.ipe-modal-stage small{font-size:8px;color:rgba(255,255,255,.72)}
      #page-errors .ipe-modal-arrow{text-align:center;color:#fff}.ipe-modal-arrow b{display:block;font-size:30px}.ipe-modal-arrow span{font-size:6px;text-transform:uppercase;letter-spacing:.55px;color:rgba(255,255,255,.68)}
      #page-errors .ipe-candidates{display:grid;grid-template-columns:1fr 1fr;gap:12px}
      #page-errors .ipe-candidate{border-radius:16px;background:rgba(255,255,255,.11);border:1px solid rgba(255,255,255,.14);padding:17px;border-top:4px solid #93a8bd}.ipe-candidate.d{border-top-color:#64b5ff}.ipe-candidate.r{border-top-color:#ff7a85}.ipe-candidate.i{border-top-color:#ffd060}
      #page-errors .ipe-candidate-tag{font-size:7px;letter-spacing:.8px;font-weight:1000;color:#c1d0e1;text-transform:uppercase}.ipe-candidate h3{font-family:Georgia,serif;font-size:24px;line-height:1.05;margin:6px 0 13px;color:#fff}.ipe-candidate-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.ipe-candidate-stat{border-radius:9px;background:rgba(255,255,255,.10);padding:9px}.ipe-candidate-stat span{display:block;font-size:6px;font-weight:1000;letter-spacing:.55px;text-transform:uppercase;color:#b9c8d9}.ipe-candidate-stat b{display:block;font-size:14px;color:#fff;margin-top:4px}
      #page-errors .ipe-modal-body{max-width:1180px;margin:0 auto;padding:28px 24px 105px}
      #page-errors .ipe-verdict{display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:center;border-radius:14px;padding:14px 16px;margin-bottom:14px}.ipe-verdict.hit{background:#e9f4ff;border:1px solid #cfe3f8}.ipe-verdict.miss{background:#f4eaff;border:1px solid #ddcaf3}.ipe-verdict.nopoll{background:#edf1f5;border:1px solid #dbe1e8}.ipe-verdict span{font-size:7px;font-weight:1000;letter-spacing:.9px;text-transform:uppercase;color:#42678d}.ipe-verdict b{font-size:10px;line-height:1.5;color:#425369}
      #page-errors .ipe-insights{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
      #page-errors .ipe-insight{min-height:205px;border-radius:17px;padding:20px;background:#fff;box-shadow:0 10px 30px rgba(20,39,70,.07)}.ipe-insight.blue{background:linear-gradient(145deg,#e7f3ff,#fbfdff);border-top:5px solid #317dcc}.ipe-insight.red{background:linear-gradient(145deg,#fff0f2,#fffafb);border-top:5px solid #cf4552}.ipe-insight.gold{background:linear-gradient(145deg,#fff7df,#fffdf7);border-top:5px solid #d09a29}
      #page-errors .ipe-insight span{display:block;font-size:7px;font-weight:1000;letter-spacing:.8px;text-transform:uppercase;color:#718198}.ipe-insight h3{font-family:Georgia,serif;font-size:23px;line-height:1.05;margin:6px 0 12px;color:#172941}.ipe-insight .big{font-family:Georgia,serif;font-size:31px;line-height:1;color:#245f9d}.ipe-insight.red .big{color:#b63644}.ipe-insight.gold .big{color:#9d7018}.ipe-insight p{font-size:9px;line-height:1.6;color:#66768a;margin:10px 0 0}
      #page-errors .ipe-context{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin:13px 0}.ipe-context div{border-radius:12px;padding:13px;background:#16345f;color:#fff}.ipe-context div:nth-child(2){background:#6b345c}.ipe-context div:nth-child(3){background:#815d19}.ipe-context span{display:block;font-size:6px;letter-spacing:.7px;text-transform:uppercase;color:rgba(255,255,255,.68);font-weight:1000;margin-bottom:4px}.ipe-context b{font-family:Georgia,serif;font-size:15px;color:#fff}
      #page-errors .ipe-modal-source{background:#e9eef5;border:1px solid #dae3ed;border-radius:12px;padding:14px 16px;font-size:8px;line-height:1.55;color:#637287}
      #page-errors .ipe-modal-nav{position:fixed;left:0;right:0;bottom:0;z-index:5;background:rgba(5,20,46,.97);color:#fff;display:grid;grid-template-columns:1fr auto 1fr;gap:15px;align-items:center;padding:12px max(20px,calc((100vw - 1180px)/2));box-shadow:0 -9px 30px rgba(6,20,44,.20)}
      #page-errors .ipe-modal-nav button{border:1px solid rgba(255,255,255,.22);border-radius:11px;background:rgba(255,255,255,.06);color:#fff;padding:10px 13px;font-size:9px;font-weight:900;cursor:pointer}.ipe-modal-nav button:last-child{justify-self:end}.ipe-modal-nav span{text-align:center;font-size:7px;font-weight:1000;letter-spacing:.85px;text-transform:uppercase;color:#aebed2}

      @media(max-width:1000px){
        #page-errors .ipe-hero-inner{grid-template-columns:1fr;gap:28px;padding-top:54px}.ipe-demo{max-width:760px}.ipe-metrics{grid-template-columns:repeat(2,1fr)!important}.ipe-method-grid{grid-template-columns:1fr!important}.ipe-method-card{min-height:auto!important}.ipe-shocks{grid-template-columns:repeat(2,1fr)!important}.ipe-controls{grid-template-columns:1fr 1fr!important}.ipe-modal-journey{grid-template-columns:1fr!important}.ipe-modal-arrow b{transform:rotate(90deg)}.ipe-candidates,.ipe-insights{grid-template-columns:1fr!important}
      }
      @media(max-width:700px){
        #page-errors .ipe-shell,#page-errors .ipe-hero-inner{width:calc(100% - 24px)}#page-errors .ipe-hero{min-height:auto}.ipe-hero-inner{padding:42px 0 70px!important}.ipe-hero h1{font-size:48px!important;letter-spacing:-1.8px!important}.ipe-demo-stage{grid-template-columns:1fr!important}.ipe-demo-arrow{transform:rotate(90deg)}.ipe-demo-verdicts{grid-template-columns:1fr!important}.ipe-main{margin-top:-35px!important}.ipe-metrics{grid-template-columns:1fr!important}.ipe-method{padding:20px!important}.ipe-method h2,.ipe-section-head h2{font-size:31px!important}.ipe-section-head{align-items:flex-start!important;flex-direction:column!important;gap:10px!important}.ipe-shocks{display:flex!important;overflow:auto!important;scroll-snap-type:x mandatory;padding-bottom:5px}.ipe-shock{min-width:245px;scroll-snap-align:start}.ipe-controls{grid-template-columns:1fr!important}.ipe-state-grid{grid-template-columns:1fr!important}.ipe-state-head{align-items:flex-start!important;flex-direction:column!important;gap:5px!important}.ipe-state-head span{text-align:left!important}.ipe-modal-title{align-items:flex-start!important;flex-direction:column!important}.ipe-modal-shift{text-align:left!important}.ipe-modal-title h2{font-size:58px!important}.ipe-modal-hero{padding:70px 16px 30px!important}.ipe-modal-body{padding-left:12px!important;padding-right:12px!important}.ipe-modal-nav{grid-template-columns:1fr 1fr!important;padding:10px 12px!important}.ipe-modal-nav span{grid-column:1/-1;grid-row:1}.ipe-candidate-stats{grid-template-columns:1fr 1fr 1fr!important}.ipe-context{grid-template-columns:1fr!important}
      }
    `;
    document.head.appendChild(st);
  }

  function statCard(cls,label,value,copy){return `<article class="ipe-metric ${cls}"><span>${esc(label)}</span><b>${esc(value)}</b><small>${esc(copy)}</small></article>`}

  function heroExample(){
    const scored=(data?.records||[]).filter(r=>r.pollCount&&num(r.pollMargin)!==null&&num(r.actualMargin)!==null);
    const wrong=scored.filter(r=>r.wrongWinner).sort((a,b)=>(absError(b)??-1)-(absError(a)??-1));
    return wrong[0]||scored.sort((a,b)=>(absError(b)??-1)-(absError(a)??-1))[0]||null;
  }

  function shockRows(){
    return (data?.records||[])
      .filter(r=>r.swing2026&&r.pollCount&&num(r.pollMargin)!==null&&num(r.actualMargin)!==null)
      .map(r=>({r,g:pollGap(r),e:absError(r)}))
      .filter(z=>z.g!==null)
      .sort((a,b)=>Math.abs(b.g)-Math.abs(a.g));
  }

  function raceButton(r,index){
    const cls=statusClass(r.status), pg=pollGap(r), fg=fundGap(r), f=fundamentals(r), e=absError(r);
    if(!r.pollCount||num(r.pollMargin)===null){
      return `<article class="ipe-race nopoll"><div class="ipe-race-top"><div><div class="ipe-race-year">${esc(r.year)} · ${esc(r.seatClass||'U.S. Senate')}</div><h4>${esc(r.matchup||r.stateName)}</h4><div class="ipe-race-match">${esc(r.stage||'general')} election</div></div><span class="ipe-status nopoll">No polling</span></div><div class="ipe-nopoll-copy">No qualifying public polling met this archive's methodology for this election. The race remains in the archive, but it is excluded from polling-accuracy statistics.</div></article>`;
    }
    return `<button type="button" class="ipe-race ${cls}" data-ipe-story="${index}"><div class="ipe-race-top"><div><div class="ipe-race-year">${esc(r.year)} · ${esc(r.seatClass||'U.S. Senate')}</div><h4>${esc(r.matchup||r.stateName)}</h4><div class="ipe-race-match">${r.wrongWinner?'Polling leader reversed in the final result':'Polling leader matched the final winner'}</div></div><span class="ipe-status ${cls}">${esc(r.status)}</span></div><div class="ipe-journey"><div class="ipe-journey-box poll"><span>Polling said</span><b>${esc(pollResultLabel(r))}</b></div><div class="ipe-journey-mid"><span>margin miss</span><b>${e===null?'—':e.toFixed(1)+' pts'}</b></div><div class="ipe-journey-box result"><span>Voters said</span><b>${esc(finalResultLabel(r))}</b></div></div><div class="ipe-mini-grid"><div class="ipe-mini"><span>Winner vs poll</span><b>${signed(candidateMiss(r,'winner'))}</b></div><div class="ipe-mini"><span>Runner-up vs poll</span><b>${signed(candidateMiss(r,'runner'))}</b></div><div class="ipe-mini"><span>State baseline</span><b>${f?marginLabel(f.lean):'N/A'}</b></div></div><span class="ipe-open">Open full-screen story →</span></button>`;
  }

  function renderArchive(){
    const search=document.getElementById('ipeSearch'), state=document.getElementById('ipeState'), status=document.getElementById('ipeStatus'), sort=document.getElementById('ipeSort');
    const q=(search?.value||'').toLowerCase().trim(), s=state?.value||'', st=status?.value||'', so=sort?.value||'state';
    let rows=(data?.records||[]).map((r,index)=>({r,index})).filter(({r})=>(!s||r.state===s)&&(!st||r.status===st)&&(!q||JSON.stringify(r).toLowerCase().includes(q)));
    if(so==='newest')rows.sort((a,b)=>b.r.year-a.r.year||a.r.stateName.localeCompare(b.r.stateName));
    else if(so==='miss')rows.sort((a,b)=>(absError(b.r)??-1)-(absError(a.r)??-1)||b.r.year-a.r.year);
    else rows.sort((a,b)=>a.r.stateName.localeCompare(b.r.stateName)||a.r.year-b.r.year);
    const out=document.getElementById('ipeArchiveList'), count=document.getElementById('ipeResults'); if(!out)return;
    if(count)count.textContent=`${rows.length} historical seat cycles shown`;
    if(!rows.length){out.innerHTML='<div class="ipe-source">No historical races match these filters.</div>';return}
    if(so!=='state'){
      out.innerHTML=`<div class="ipe-state"><div class="ipe-state-grid">${rows.map(({r,index})=>raceButton(r,index)).join('')}</div></div>`;
    }else{
      const groups=new Map();
      rows.forEach(x=>{const key=x.r.state;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(x)});
      out.innerHTML=[...groups.entries()].map(([ab,items])=>{const r=items[0].r;return `<section class="ipe-state"><div class="ipe-state-head"><h3>${esc(r.stateName)}</h3><span>${esc(r.seatClass||'U.S. Senate')} · ${r.swing2026?'2026 swing-state group':'2026 Senate seat'} · ${items.length} historical cycles</span></div><div class="ipe-state-grid">${items.map(x=>raceButton(x.r,x.index)).join('')}</div></section>`}).join('');
    }
    out.querySelectorAll('[data-ipe-story]').forEach(btn=>btn.addEventListener('click',()=>openStory(Number(btn.dataset.ipeStory))));
  }

  function renderShocks(){
    const host=document.getElementById('ipeShocks'); if(!host)return;
    const rows=shockRows().slice(0,6);
    if(!rows.length){host.innerHTML='<div class="ipe-source">No scored swing-state historical races are available.</div>';return}
    host.innerHTML=rows.map((z,i)=>{const r=z.r,p=drMargin(r,'poll'),a=drMargin(r,'actual'),idx=data.records.indexOf(r);return `<button type="button" class="ipe-shock" data-ipe-story="${idx}"><span class="ipe-shock-rank">${String(i+1).padStart(2,'0')} · ${esc(r.year)} U.S. Senate${r.wrongWinner?' · leader reversed':''}</span><strong>${esc(r.stateName)}</strong><div class="ipe-shock-route"><div><span>Final polls</span><b>${marginLabel(p)}</b></div><i>→</i><div><span>Actual result</span><b>${marginLabel(a)}</b></div></div><div class="ipe-shock-foot"><small>${esc(r.matchup||'')}</small><em>${Math.abs(z.g).toFixed(1)} pts</em></div></button>`}).join('');
    host.querySelectorAll('[data-ipe-story]').forEach(btn=>btn.addEventListener('click',()=>openStory(Number(btn.dataset.ipeStory))));
  }

  function openStory(recordIndex){
    const r=data?.records?.[recordIndex]; if(!r)return;
    storyRows=(data.records||[]).map((x,index)=>({r:x,index,g:pollGap(x)})).filter(z=>z.r.pollCount&&z.g!==null).sort((a,b)=>Math.abs(b.g)-Math.abs(a.g));
    storyPos=Math.max(0,storyRows.findIndex(z=>z.index===recordIndex));
    renderStory();
    const modal=document.getElementById('ipeModal'); if(modal){modal.classList.add('show');modal.scrollTop=0;document.body.style.overflow='hidden'}
  }
  function closeStory(){document.getElementById('ipeModal')?.classList.remove('show');document.body.style.overflow=''}
  function moveStory(delta){if(!storyRows.length)return;storyPos=(storyPos+delta+storyRows.length)%storyRows.length;renderStory();document.getElementById('ipeModal')?.scrollTo(0,0)}

  function renderStory(){
    const host=document.getElementById('ipeModalContent'); if(!host||!storyRows.length)return;
    const z=storyRows[storyPos],r=z.r,pg=pollGap(r),fg=fundGap(r),f=fundamentals(r),p=drMargin(r,'poll'),a=drMargin(r,'actual'),e=absError(r),wm=candidateMiss(r,'winner'),rm=candidateMiss(r,'runner'),cls=statusClass(r.status);
    const verdict=r.status==='HIT'?`The final polling average picked the winner and finished within ${one(data.stats?.hitThreshold||3)} points of the final two-candidate margin.`:r.wrongWinner?'The final polling average showed the other candidate ahead, so the polling leader reversed in the final result.':'The final polling margin missed the result by more than this archive’s hit threshold.';
    host.innerHTML=`<div class="ipe-modal-grid"></div><div class="ipe-modal-kicker">${esc(r.year)} U.S. Senate · ${esc(r.status)}${r.wrongWinner?' · polling leader reversed':''}</div><div class="ipe-modal-title"><h2>${esc(r.stateName)}</h2><div class="ipe-modal-shift"><span>Margin moved</span><b>${e===null?'—':e.toFixed(1)+' pts'}</b></div></div><div class="ipe-modal-journey"><div class="ipe-modal-stage poll"><span>Polling said</span><b>${esc(pollResultLabel(r))}</b><small>Final qualifying polling average</small></div><div class="ipe-modal-arrow"><b>→</b><span>${pg===null?'to result':`toward ${partyName(pg)}`}</span></div><div class="ipe-modal-stage result"><span>Voters said</span><b>${esc(finalResultLabel(r))}</b><small>Final election margin</small></div></div><div class="ipe-candidates"><div class="ipe-candidate ${partyCardClass(r.winnerParty)}"><span class="ipe-candidate-tag">${esc(shortParty(r.winnerParty))} candidate · winner</span><h3>${esc(r.winner)}</h3><div class="ipe-candidate-stats"><div class="ipe-candidate-stat"><span>Polling</span><b>${num(r.pollWinnerPct)===null?'—':one(r.pollWinnerPct)+'%'}</b></div><div class="ipe-candidate-stat"><span>Result</span><b>${one(r.actualWinnerPct)}%</b></div><div class="ipe-candidate-stat"><span>Miss</span><b>${signed(wm)}</b></div></div></div><div class="ipe-candidate ${partyCardClass(r.runnerUpParty)}"><span class="ipe-candidate-tag">${esc(shortParty(r.runnerUpParty))} candidate · runner-up</span><h3>${esc(r.runnerUp)}</h3><div class="ipe-candidate-stats"><div class="ipe-candidate-stat"><span>Polling</span><b>${num(r.pollRunnerPct)===null?'—':one(r.pollRunnerPct)+'%'}</b></div><div class="ipe-candidate-stat"><span>Result</span><b>${one(r.actualRunnerPct)}%</b></div><div class="ipe-candidate-stat"><span>Miss</span><b>${signed(rm)}</b></div></div></div></div>`;
    const body=document.getElementById('ipeModalBody'); if(!body)return;
    body.innerHTML=`<div class="ipe-verdict ${cls}"><span>${r.wrongWinner?'Polling leader reversed':r.status==='HIT'?'Polling hit':'Polling miss'}</span><b>${esc(verdict)}</b></div><div class="ipe-insights"><article class="ipe-insight blue"><span>Candidate performance</span><h3>Who beat the polling average?</h3><div class="big">${signed(wm)} / ${signed(rm)}</div><p>${esc(r.winner)} ${wm===null?'has no candidate-level comparison':wm>=0?`finished ${Math.abs(wm).toFixed(1)} points above the polling average`:`finished ${Math.abs(wm).toFixed(1)} points below the polling average`}. ${esc(r.runnerUp)} ${rm===null?'has no candidate-level comparison':rm>=0?`finished ${Math.abs(rm).toFixed(1)} points above it`:`finished ${Math.abs(rm).toFixed(1)} points below it`}.</p></article><article class="ipe-insight red"><span>The race itself</span><h3>How the margin changed</h3><div class="big">${marginLabel(p)} → ${marginLabel(a)}</div><p>${esc(performanceSentence(pg,'poll'))}</p></article><article class="ipe-insight gold"><span>State fundamentals</span><h3>How partisan was the state?</h3><div class="big">${f?marginLabel(f.lean)+' vs U.S.':'N/A'}</div><p>${f?esc(performanceSentence(fg,'fund')):'A comparable state-baseline value is not included for this race in the current fundamentals table.'}</p></article></div><div class="ipe-context"><div><span>State baseline</span><b>${f?marginLabel(f.lean)+' vs U.S.':'N/A'}</b></div><div><span>Senate vs. baseline</span><b>${fg===null?'N/A':`${Math.abs(fg).toFixed(1)} pts toward ${partyName(fg)}`}</b></div><div><span>Margin miss</span><b>${e===null?'—':e.toFixed(1)+' pts'}</b></div></div><div class="ipe-modal-source"><b>Polling source:</b> ${esc(r.source||'Archive source')}<br><b>Race methodology:</b> ${esc(r.methodology||data.methodNote||'Final qualifying polling average compared with the certified result.')}<br><b>How to read it:</b> candidate miss = result vote share minus polling vote share. Margin movement = actual D–R margin minus polled D–R margin. State baseline = presidential D–R margin in the state relative to the national D–R popular-vote margin for the comparison cycle.</div>`;
    const pos=document.getElementById('ipeModalPos'); if(pos)pos.textContent=`Shock ${storyPos+1} of ${storyRows.length} · ranked by absolute margin movement`;
  }

  function render(){
    if(!data||rendering)return;
    const page=document.getElementById('page-errors'); if(!page)return;
    rendering=true; addStyle();
    const st=data.stats||{}, ex=heroExample(), states=[...new Set(data.records.map(r=>r.state))].sort((a,b)=>{const an=data.records.find(r=>r.state===a)?.stateName||a,bn=data.records.find(r=>r.state===b)?.stateName||b;return an.localeCompare(bn)});
    const avg=one(st.avgAbsError), threshold=one(st.hitThreshold||3), wrong=st.wrongWinner??data.records.filter(r=>r.wrongWinner).length;
    const exPoll=ex?pollResultLabel(ex):'Final polling average', exResult=ex?finalResultLabel(ex):'Final election result', exErr=ex?(absError(ex)??0):0;
    page.innerHTML=`<div class="${ROOT_CLASS}"><section class="ipe-hero"><div class="ipe-grid"></div><div class="ipe-hero-inner"><div class="ipe-hero-copy"><div class="ipe-kicker">PAST POLLING ERRORS · 2026 SENATE SEATS ONLY</div><h1>See exactly where<br>the <em>polls moved.</em></h1><p>This archive backtests the Senate seats on the ballot in 2026 against prior elections for those same seats. Instead of reducing everything to one number, it shows what polling said, what voters did, and—where available—how the result compared with the state’s partisan baseline.</p><div class="ipe-hero-actions"><button type="button" class="ipe-btn light" id="ipeJumpSwing">Explore swing-state history ↓</button><button type="button" class="ipe-btn ghost" id="ipeJumpArchive">Open full archive ↓</button></div></div><aside class="ipe-demo"><div class="ipe-demo-label">HOW TO READ ONE RACE${ex?` · ${esc(ex.stateName)} ${ex.year}`:''}</div><div class="ipe-demo-stage"><div class="ipe-demo-card poll"><span>Polling said</span><b>${esc(exPoll)}</b><small>Final qualifying polling average</small></div><div class="ipe-demo-arrow">→</div><div class="ipe-demo-card result"><span>Voters said</span><b>${esc(exResult)}</b><small>Final election result</small></div></div><div class="ipe-demo-verdicts"><div><span>Margin miss</span><b>${ex?exErr.toFixed(1)+' pts':'—'}</b></div><div><span>Hit / miss</span><b>${ex?esc(ex.status):'—'}</b></div><div><span>Leader reversed?</span><b>${ex?.wrongWinner?'YES':'NO'}</b></div></div></aside></div></section><main class="ipe-shell ipe-main"><section class="ipe-metrics">${statCard('blue','2026 Senate states',String(st.states??35),'Only seats appearing on the 2026 Senate ballot')}${statCard('red','Historical misses',String(st.misses??'—'),'Scored races outside the hit definition')}${statCard('purple','Average margin error',avg==='—'?'—':avg+' pts','Mean absolute error among scored races')}${statCard('gold','Polling leader reversed',String(wrong),'Scored races where the final winner differed')}</section><section class="ipe-method"><div class="ipe-section-kicker">METHODOLOGY · IN PLAIN ENGLISH</div><h2>What does “hit” or “miss” mean?</h2><p class="ipe-method-intro">The page uses one transparent rule for the archive and then shows the underlying numbers so you can judge each race yourself.</p><div class="ipe-method-grid"><article class="ipe-method-card blue"><span class="ipe-method-num">01</span><h3>Start with the final polling margin</h3><p>For each historical Senate election, the archive uses its qualifying final pre-election polling average. The candidate vote shares and the two-candidate margin are saved separately.</p></article><article class="ipe-method-card red"><span class="ipe-method-num">02</span><h3>Compare it with the result</h3><p><b>HIT:</b> the polling average picked the winner and missed the final margin by no more than ${threshold} points. <b>MISS:</b> the leader was wrong or the margin error was larger than ${threshold} points.</p></article><article class="ipe-method-card gold"><span class="ipe-method-num">03</span><h3>Add state context</h3><p>Where a state baseline is available, the Senate D–R result is compared with that state’s presidential D–R margin relative to the national presidential vote. This is context, not a causal explanation.</p></article></div><div class="ipe-method-note"><b>No polling is not scored.</b> A historical election with no qualifying public polling stays visible in the full archive but does not count as a hit or miss.</div></section><section class="ipe-swing" id="ipeSwing"><div class="ipe-section-head"><div><div class="ipe-section-kicker">SEPARATE IMMERSIVE CATEGORY</div><h2>2026 swing-state polling history</h2><p>Historical polling movement for the states currently grouped as 2026 Senate battlegrounds. These are the largest prior margin shifts in that group; click any card for a full-screen race story.</p></div><span class="ipe-chip">${(data.swingStates||[]).length} swing states</span></div><div class="ipe-shocks" id="ipeShocks"></div></section><section class="ipe-archive" id="ipeArchive"><div class="ipe-section-head"><div><div class="ipe-section-kicker">FULL ARCHIVE · EVERY 2026 SENATE STATE</div><h2>Every state. Every saved cycle.</h2><p>The complete history underneath the swing-state section. Search by candidate, year, or state, or filter by whether the polling average hit, missed, or had no qualifying polling.</p></div></div><div class="ipe-controls"><input id="ipeSearch" placeholder="Search state, candidate or year"><select id="ipeState"><option value="">All 2026 Senate states</option>${states.map(ab=>`<option value="${esc(ab)}">${esc(data.records.find(r=>r.state===ab)?.stateName||ab)}</option>`).join('')}</select><select id="ipeStatus"><option value="">All results</option><option value="MISS">Misses</option><option value="HIT">Hits</option><option value="NO POLLING">No polling</option></select><select id="ipeSort"><option value="state">State / year</option><option value="newest">Newest first</option><option value="miss">Largest margin error</option></select></div><div class="ipe-results" id="ipeResults"></div><div id="ipeArchiveList"></div><div class="ipe-source"><b>Archive scope:</b> ${esc(data.scope||'Historical Senate elections for seats on the 2026 ballot.')}<br>${(data.sources||[]).map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a> — ${esc(s.note||'')}`).join(' · ')}${data.methodNote?`<br>${esc(data.methodNote)}`:''}</div></section></main><section class="ipe-modal" id="ipeModal" aria-hidden="true"><button class="ipe-modal-close" id="ipeModalClose" aria-label="Close race story">×</button><div class="ipe-modal-hero" id="ipeModalContent"></div><div class="ipe-modal-body" id="ipeModalBody"></div><div class="ipe-modal-nav"><button type="button" id="ipePrev">← Previous shock</button><span id="ipeModalPos"></span><button type="button" id="ipeNext">Next shock →</button></div></section></div>`;
    renderShocks(); renderArchive();
    document.getElementById('ipeJumpSwing')?.addEventListener('click',()=>document.getElementById('ipeSwing')?.scrollIntoView({behavior:'smooth',block:'start'}));
    document.getElementById('ipeJumpArchive')?.addEventListener('click',()=>document.getElementById('ipeArchive')?.scrollIntoView({behavior:'smooth',block:'start'}));
    ['ipeSearch','ipeState','ipeStatus','ipeSort'].forEach(id=>document.getElementById(id)?.addEventListener(id==='ipeSearch'?'input':'change',renderArchive));
    document.getElementById('ipeModalClose')?.addEventListener('click',closeStory);
    document.getElementById('ipePrev')?.addEventListener('click',()=>moveStory(-1));
    document.getElementById('ipeNext')?.addEventListener('click',()=>moveStory(1));
    document.getElementById('ipeModal')?.addEventListener('click',e=>{if(e.target===e.currentTarget)closeStory()});
    rendering=false;
  }

  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeStory();if(document.getElementById('ipeModal')?.classList.contains('show')&&e.key==='ArrowLeft')moveStory(-1);if(document.getElementById('ipeModal')?.classList.contains('show')&&e.key==='ArrowRight')moveStory(1)});
  const load=window.__SEH_TEST_DATA__?Promise.resolve(window.__SEH_TEST_DATA__):fetch(DATA_URL,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(`Historical Senate data ${r.status}`);return r.json()});
  load.then(d=>{data=d;render();setTimeout(render,450)}).catch(e=>console.warn('Historical Senate data unavailable',e));
  new MutationObserver(()=>{if(data&&!rendering&&document.getElementById('page-errors')&&!document.querySelector(`#page-errors .${ROOT_CLASS}`))render()}).observe(document.body,{childList:true,subtree:true});
})();

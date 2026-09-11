(()=>{
  const BLUE='#2763b8', RED='#bd2937', NAVY='#17263d';

  function makeSenateCard(){
    const card=document.createElement('div');
    card.className='will-split-card will-senate-card';
    card.innerHTML=`
      <div class="will-split-icon" aria-hidden="true">♜</div>
      <div class="will-split-title">Will’s Senate Prediction</div>
      <div class="will-split-sub">100 SEATS • 51 NEEDED FOR A MAJORITY</div>
      <div class="will-split-parties">
        <div><strong class="dem">DEMOCRATS: 49</strong><span>SEATS</span></div>
        <div class="right"><strong class="rep">REPUBLICANS: 51</strong><span>SEATS</span></div>
      </div>
      <div class="will-split-bar"><i class="dem-bar"></i><i class="rep-bar"></i><b class="majority-line"></b></div>
      <div class="will-split-bar-labels"><strong>49</strong><strong>51</strong></div>
      <div class="will-split-majority">51 majority</div>
      <div class="will-split-legend"><span><i class="dem-dot"></i>Democrats<br><small>49 seats</small></span><span><i class="rep-dot"></i>Republicans<br><small>51 seats</small></span></div>`;
    return card;
  }

  function apply(){
    const house=document.getElementById('housePrediction2026');
    if(!house) return;
    if(house.dataset.splitForecast==='1') return;
    house.dataset.splitForecast='1';
    house.classList.add('will-split-forecast');

    const houseImg=house.querySelector('img');
    if(!houseImg) return;
    houseImg.classList.add('will-house-img');
    const houseWrap=document.createElement('div');
    houseWrap.className='will-split-card will-house-card';
    houseImg.parentNode.insertBefore(houseWrap,houseImg);
    houseWrap.appendChild(houseImg);
    house.appendChild(makeSenateCard());
  }

  function style(){
    if(document.getElementById('will-split-forecast-style')) return;
    const s=document.createElement('style');
    s.id='will-split-forecast-style';
    s.textContent=`
      #housePrediction2026.will-split-forecast{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;gap:18px!important;align-items:stretch!important;width:100%!important;margin:28px 0 10px!important}
      #housePrediction2026 .will-split-card{min-width:0;border-radius:16px;background:#f8fafc;box-shadow:0 7px 24px rgba(20,34,53,.08);overflow:hidden;box-sizing:border-box}
      #housePrediction2026 .will-house-card{display:flex;align-items:stretch;background:#f7f8fa}
      #housePrediction2026 .will-house-img{display:block!important;width:100%!important;height:100%!important;object-fit:contain!important;border-radius:16px!important;background:#f7f8fa}
      #housePrediction2026 .will-senate-card{padding:24px 25px 20px;display:flex!important;flex-direction:column!important;justify-content:center;color:${NAVY};border:1px solid #e2e7ee}
      #housePrediction2026 .will-split-icon{text-align:center;font-size:32px;color:#8c9bb0;line-height:1;margin-bottom:6px}
      #housePrediction2026 .will-split-title{text-align:center;font:800 clamp(24px,2.5vw,38px)/1.05 Georgia,serif;color:#53657e;margin-bottom:7px}
      #housePrediction2026 .will-split-sub{text-align:center;font:850 11px/1.3 Inter,ui-sans-serif,system-ui,sans-serif;letter-spacing:3px;color:#768499;margin-bottom:26px}
      #housePrediction2026 .will-split-parties{display:flex;justify-content:space-between;gap:12px;margin-bottom:11px}
      #housePrediction2026 .will-split-parties>div{min-width:0}
      #housePrediction2026 .will-split-parties .right{text-align:right}
      #housePrediction2026 .will-split-parties strong{display:block;font:900 clamp(19px,2vw,29px)/1 Inter,ui-sans-serif,system-ui,sans-serif;white-space:nowrap}
      #housePrediction2026 .will-split-parties span{display:block;margin-top:5px;font:800 10px/1 Inter,ui-sans-serif,system-ui,sans-serif;letter-spacing:2px;color:#6e7b8e}
      #housePrediction2026 .dem{color:${BLUE}} #housePrediction2026 .rep{color:${RED}}
      #housePrediction2026 .will-split-bar{height:54px;border-radius:13px;overflow:hidden;display:flex;position:relative;background:#e6ebf2}
      #housePrediction2026 .will-split-bar i{display:block;height:100%}
      #housePrediction2026 .dem-bar{background:${BLUE};width:49%} #housePrediction2026 .rep-bar{background:${RED};width:51%}
      #housePrediction2026 .majority-line{position:absolute;left:50%;top:-8px;bottom:-24px;width:2px;border-left:2px dashed #596a80;z-index:3}
      #housePrediction2026 .will-split-bar-labels{display:flex;justify-content:space-around;margin-top:-39px;position:relative;z-index:2;color:#fff;font:900 24px/1 Inter,ui-sans-serif,system-ui,sans-serif;pointer-events:none}
      #housePrediction2026 .will-split-majority{text-align:center;margin-top:34px;font:800 12px/1 Inter,ui-sans-serif,system-ui,sans-serif;color:#5d6d82}
      #housePrediction2026 .will-split-legend{display:flex;justify-content:center;gap:46px;margin-top:20px;font:800 12px/1.2 Inter,ui-sans-serif,system-ui,sans-serif;color:#4f5f73}
      #housePrediction2026 .will-split-legend span{position:relative;padding-left:22px}
      #housePrediction2026 .will-split-legend i{position:absolute;left:0;top:1px;width:14px;height:14px;border-radius:50%}
      #housePrediction2026 .dem-dot{background:${BLUE}} #housePrediction2026 .rep-dot{background:${RED}}
      #housePrediction2026 .will-split-legend small{font-weight:650;color:#738095}
      @media(max-width:760px){
        #housePrediction2026.will-split-forecast{grid-template-columns:1fr!important;gap:12px!important}
        #housePrediction2026 .will-senate-card{padding:20px 16px 18px}
        #housePrediction2026 .will-split-title{font-size:27px}
        #housePrediction2026 .will-split-sub{font-size:9px;letter-spacing:2px;margin-bottom:20px}
        #housePrediction2026 .will-split-parties strong{font-size:18px}
        #housePrediction2026 .will-split-bar{height:46px}
      }
    `;
    document.head.appendChild(s);
  }

  style();apply();
  [80,250,700,1500,3000].forEach(ms=>setTimeout(apply,ms));
  new MutationObserver(()=>apply()).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('pageshow',apply);
})();

(()=>{
  function applyEqualForecastCards(){
    const split=document.getElementById('homeForecastSplit');
    if(!split) return;

    let st=document.getElementById('homeForecastEqualStyle');
    if(!st){
      st=document.createElement('style');
      st.id='homeForecastEqualStyle';
      st.textContent=`
        #homeForecastSplit{
          display:grid!important;
          grid-template-columns:repeat(2,minmax(0,1fr))!important;
          gap:18px!important;
          align-items:stretch!important;
          width:100%!important;
        }
        #homeForecastSplit .forecast-card{
          width:100%!important;
          aspect-ratio:1672 / 941!important;
          min-height:0!important;
          height:auto!important;
          box-sizing:border-box!important;
          border-radius:20px!important;
          overflow:hidden!important;
        }
        #homeForecastSplit .house-card{
          padding:0!important;
          display:flex!important;
          align-items:center!important;
          justify-content:center!important;
        }
        #homeForecastSplit .house-card img{
          width:100%!important;
          height:100%!important;
          object-fit:contain!important;
          display:block!important;
        }
        #homeForecastSplit .senate-card{
          padding:5.5% 6% 4.5%!important;
          display:flex!important;
          flex-direction:column!important;
          justify-content:center!important;
        }
        #homeForecastSplit .senate-title{
          font-size:clamp(26px,3vw,44px)!important;
          margin:0 0 4%!important;
        }
        #homeForecastSplit .senate-kicker{
          font-size:clamp(8px,.8vw,12px)!important;
          margin-bottom:1.5%!important;
        }
        #homeForecastSplit .senate-numbers{
          gap:4%!important;
          margin-bottom:4%!important;
        }
        #homeForecastSplit .party-label{
          font-size:clamp(9px,1vw,15px)!important;
        }
        #homeForecastSplit .party-number{
          font-size:clamp(42px,5vw,78px)!important;
          margin-top:2%!important;
        }
        #homeForecastSplit .senate-bar{
          height:clamp(14px,1.6vw,22px)!important;
        }
        #homeForecastSplit .majority-note{
          margin-top:2.5%!important;
          font-size:clamp(8px,.75vw,11px)!important;
        }
        #homeForecastSplit .senate-tiebreak{
          top:4%!important;
          right:4%!important;
          font-size:clamp(7px,.7vw,10px)!important;
        }
        #homeForecastSplit .senate-tiebreak strong{
          font-size:clamp(10px,1.05vw,15px)!important;
        }
        @media(max-width:760px){
          #homeForecastSplit{grid-template-columns:1fr!important;gap:12px!important}
          #homeForecastSplit .forecast-card{aspect-ratio:1672 / 941!important}
          #homeForecastSplit .senate-card{order:1!important;padding:5.5% 6% 4.5%!important}
          #homeForecastSplit .house-card{order:2!important}
          #homeForecastSplit .senate-title{font-size:clamp(28px,8vw,40px)!important}
          #homeForecastSplit .party-number{font-size:clamp(46px,14vw,68px)!important}
        }
      `;
      document.head.appendChild(st);
    }
  }

  applyEqualForecastCards();
  [80,250,600,1200,2200].forEach(ms=>setTimeout(applyEqualForecastCards,ms));
  new MutationObserver(()=>setTimeout(applyEqualForecastCards,20)).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('pageshow',applyEqualForecastCards);
})();

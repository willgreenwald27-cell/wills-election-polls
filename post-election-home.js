(function(){
function navigate(p){
 if(typeof window.__willNavigate==='function'){window.__willNavigate(p);return true;}
 var btn=document.querySelector('.site-header .nav [data-spa-page="'+p+'"]');
 if(btn){btn.click();return true;}return false;
}
function render(){
 var home=document.getElementById('page-home');
 if(!home||document.getElementById('wg-post-election-home'))return;
 var panel=document.createElement('section');panel.id='wg-post-election-home';
 panel.innerHTML='<div class="eyebrow">2026 MIDTERMS · THE AFTERMATH</div><h2>The votes are in. The analysis begins.</h2><p>Go beyond predictions with results, a transparent scorecard and an early look at 2028. Your original interactive Senate map and historical polling research are still here.</p><div class="status"><span>ALASKA SENATE <strong>UNCALLED</strong></span><span>MISSISSIPPI SENATE <strong>UNCALLED</strong></span><span>FINAL FORECAST <strong>ARCHIVED</strong></span></div><div class="actions"><a href="/2026-results.html">2026 Results <small>Election calls and outstanding races</small></a><a href="/prediction-accuracy.html">Prediction Accuracy <small>Eleven final battleground forecasts</small></a><a href="/road-to-2028.html">Road to 2028 <small>Presidential and Senate research</small></a></div><div class="fine">Updated November 4, 2026 · Uncalled contests are not scored as wins or losses.</div>';
 var shell=home.querySelector('.reference-home-shell')||home.querySelector('.content');
 if(shell)shell.insertAdjacentElement('afterbegin',panel);else home.prepend(panel);
}
function init(){
 render();
 var q=new URLSearchParams(location.search),page=q.get('section')==='polling-errors'?'errors':q.get('page');
 if(page&&['home','senate','governor','polls','betting','errors','about'].includes(page)){
  var tries=0;var interval=setInterval(function(){if(navigate(page)){clearInterval(interval);history.replaceState(null,'',location.pathname);}else if(++tries>20)clearInterval(interval);},200);
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
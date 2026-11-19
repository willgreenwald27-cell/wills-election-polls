(() => {
  'use strict';

  // A plain, personal About page. Keep the original markup intact underneath
  // so older site scripts and the rest of the navigation continue to work.
  const content = `
    <div class="wg-about-inner">
      <div class="wg-about-topline">
        <span>ABOUT ME</span>
        <span>Will Greenwald · Marin County, California</span>
      </div>

      <header class="wg-about-intro">
        <div>
          <h1>Hi, I'm Will.</h1>
          <p class="wg-about-lead">I'm a senior at Redwood High School, and I spend a lot of time following elections.</p>
        </div>
        <img class="wg-about-logo" src="/site-wordmark.svg?v=20261009-capitol1" alt="Will's Election Polls & Predictions" width="228" height="110" loading="lazy">
      </header>

      <div class="wg-about-story">
        <p>I got really interested in polling during the 2024 election. I was checking forecasts constantly, comparing the numbers, and trying to figure out why different people saw the same races so differently.</p>
        <p>After the election, I started looking back at older races and the polls that missed them. Eventually, I wanted to make my own predictions and put them somewhere people could actually check. So I built this website.</p>
        <p>For the 2026 Senate races, I tracked polls, looked at the candidates and the political environment, and made my own calls. I also put together a collection of past polling errors. I want to be able to look back and see what I got right, what I got wrong, and why.</p>
      </div>

      <div class="wg-about-lower">
        <div class="wg-about-outside">
          <h2>Outside of polling</h2>
          <p>I'm captain of my high school's varsity tennis team, I'm involved in mock trial, and I've served on local climate action and racial equity committees. I also worked with Democracy Summer.</p>
          <p>I like writing, too. I've published two books and wrote an article for <em>The Fulcrum</em> about my obsession with political predictions.</p>
          <a class="wg-about-essay" href="https://thefulcrum.us/civic-engagement-education/illusion-certainty-politics-civic-engagement" target="_blank" rel="noopener noreferrer">Read my essay, “The Illusion of Certainty” <span aria-hidden="true">↗</span></a>
        </div>

        <aside class="wg-about-project" aria-label="What is on this website">
          <h2>What you'll find here</h2>
          <ul>
            <li>My final predictions for the 2026 Senate races</li>
            <li>The polling data I used to make those calls</li>
            <li>A look at Senate races where past polls missed the result</li>
          </ul>
          <p>It's my own project, and the predictions are my own.</p>
        </aside>
      </div>
    </div>
  `;

  function mount() {
    const page = document.getElementById('page-about');
    if (!page) return;
    if (page.querySelector(':scope > #wg-about-personal')) return;
    const panel = document.createElement('section');
    panel.id = 'wg-about-personal';
    panel.setAttribute('aria-label', 'About Will Greenwald');
    panel.innerHTML = content;
    page.appendChild(panel);
  }

  function init() {
    mount();
    const page = document.getElementById('page-about');
    if (page) {
      new MutationObserver(() => {
        if (!page.querySelector(':scope > #wg-about-personal')) mount();
      }).observe(page, { childList: true });
    }
    window.addEventListener('pageshow', mount);
    document.addEventListener('click', event => {
      if (event.target && event.target.closest('.site-header .nav, footer')) {
        requestAnimationFrame(mount);
      }
    }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();

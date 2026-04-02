/* Shared nav.js — theme + lang for all /docs/ pages */
(function () {
  var html = document.documentElement;
  var body = document.body;

  /* ── Key migration (old → new) ── */
  var ot = localStorage.getItem('theme') || localStorage.getItem('docs-theme');
  if (ot && !localStorage.getItem('site-theme')) localStorage.setItem('site-theme', ot);
  var ol = localStorage.getItem('docs-lang');
  if (ol && !localStorage.getItem('site-lang')) localStorage.setItem('site-lang', ol);

  /* ── Theme ── */
  function setTheme(t) {
    html.setAttribute('data-theme', t);
    localStorage.setItem('site-theme', t);
  }
  var st = localStorage.getItem('site-theme');
  if (st) setTheme(st);
  else if (!window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('light');
  else setTheme('dark');

  var tb = document.getElementById('siteThemeToggle');
  if (tb) tb.addEventListener('click', function () {
    setTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  /* ── Language ── */
  function setLang(l) {
    body.setAttribute('data-lang', l);
    localStorage.setItem('site-lang', l);
    var lb = document.getElementById('siteLangToggle');
    if (lb) lb.textContent = l === 'zh' ? 'EN' : '中';
  }
  var sl = localStorage.getItem('site-lang') || 'zh';
  setLang(sl);

  var lb = document.getElementById('siteLangToggle');
  if (lb) lb.addEventListener('click', function () {
    setLang(body.getAttribute('data-lang') === 'zh' ? 'en' : 'zh');
  });
})();

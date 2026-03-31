/**
 * inject-doc-theme.js
 * Injects light theme CSS variables + theme/lang toggle into tech doc HTML files.
 * Usage: node inject-doc-theme.js <path-to-html>
 */
const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, 'docs', 'openkosmos', 'index.html'),
  path.join(__dirname, 'docs', 'agent-orchestration', 'index.html'),
];

const LIGHT_THEME_CSS = `
<style id="injected-theme">
  /* ── Light theme override ── */
  [data-theme="light"] {
    --bg: #ffffff !important;
    --card: #f6f8fa !important;
    --surface: #f6f8fa !important;
    --surface-hover: #eef1f5 !important;
    --border: #d0d7de !important;
    --blue: #2563eb !important;
    --cyan: #0e7490 !important;
    --green: #1a7f37 !important;
    --orange: #bf8700 !important;
    --purple: #8250df !important;
    --red: #cf222e !important;
    --text: #1a1a2e !important;
    --text-sec: #656d76 !important;
    --dim: #656d76 !important;
    --white: #1a1a2e !important;
  }
  [data-theme="light"] body {
    background: #ffffff !important;
    color: #1a1a2e !important;
  }
  [data-theme="light"] .doc-nav {
    background: rgba(255,255,255,0.85) !important;
    border-bottom-color: rgba(208,215,222,0.6) !important;
  }
  [data-theme="light"] .doc-nav a { color: #656d76 !important; }
  [data-theme="light"] .doc-nav a:hover { color: #1a1a2e !important; background: rgba(0,0,0,0.04) !important; }
  [data-theme="light"] .doc-nav .sep { color: #d0d7de !important; }
  [data-theme="light"] .doc-nav .current { color: #1a1a2e !important; }
  [data-theme="light"] .diagram {
    background: #f6f8fa !important;
    border-color: #d0d7de !important;
  }
  [data-theme="light"] th {
    background: #f6f8fa !important;
    color: #1a1a2e !important;
  }
  [data-theme="light"] td { border-bottom-color: #d0d7de !important; }
  [data-theme="light"] tr:hover td { background: rgba(37,99,235,0.04) !important; }
  [data-theme="light"] .callout { background: rgba(191,135,0,0.04) !important; }
  [data-theme="light"] .callout.blue { background: rgba(37,99,235,0.04) !important; }
  [data-theme="light"] .callout.green { background: rgba(26,127,55,0.04) !important; }
  [data-theme="light"] .callout.purple { background: rgba(130,80,223,0.04) !important; }
  [data-theme="light"] .callout.cyan { background: rgba(14,116,144,0.04) !important; }
  [data-theme="light"] .callout.red { background: rgba(207,34,46,0.04) !important; }
  [data-theme="light"] code {
    background: rgba(37,99,235,0.06) !important;
    color: #2563eb !important;
  }
  [data-theme="light"] .cover { border-bottom-color: #d0d7de !important; }
  [data-theme="light"] hr { border-top-color: #d0d7de !important; }
  [data-theme="light"] .footer { color: #656d76 !important; border-top-color: #d0d7de !important; }
  [data-theme="light"] .badge { filter: saturate(0.8); }
  [data-theme="light"] .section-tag { filter: saturate(0.85); }

  /* ── Theme/Lang toggle bar ── */
  .doc-controls {
    position: fixed; top: 8px; right: 16px; z-index: 1000;
    display: flex; gap: 6px; align-items: center;
  }
  .doc-ctrl-btn {
    display: inline-flex; align-items: center; justify-content: center;
    background: rgba(128,128,128,0.15); backdrop-filter: blur(8px);
    border: 1px solid rgba(128,128,128,0.2); border-radius: 6px;
    padding: 4px 10px; cursor: pointer; color: inherit;
    font-size: 12px; font-weight: 600; text-decoration: none; transition: all 0.2s;
  }
  .doc-ctrl-btn:hover { background: rgba(128,128,128,0.25); }
</style>
`;

const TOGGLE_SCRIPT = `
<div class="doc-controls">
  <button class="doc-ctrl-btn" id="docThemeToggle" title="Toggle theme">🌓</button>
</div>
<script>
(function(){
  var html = document.documentElement;
  function setDocTheme(t) {
    html.setAttribute('data-theme', t);
    localStorage.setItem('docs-theme', t);
  }
  var s = localStorage.getItem('docs-theme') || localStorage.getItem('theme');
  if (s) setDocTheme(s);
  else if (!window.matchMedia('(prefers-color-scheme: dark)').matches) setDocTheme('light');
  document.getElementById('docThemeToggle').addEventListener('click', function() {
    setDocTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });
})();
</script>
`;

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.warn(`File not found: ${file}`);
    continue;
  }
  let html = fs.readFileSync(file, 'utf-8');

  // Skip if already injected
  if (html.includes('id="injected-theme"')) {
    console.log(`Already injected: ${file}`);
    continue;
  }

  // Inject CSS right before </head>
  html = html.replace('</head>', LIGHT_THEME_CSS + '</head>');

  // Inject controls + script right before </body>
  html = html.replace('</body>', TOGGLE_SCRIPT + '</body>');

  fs.writeFileSync(file, html, 'utf-8');
  console.log(`✅ Injected theme into: ${path.relative(__dirname, file)}`);
}

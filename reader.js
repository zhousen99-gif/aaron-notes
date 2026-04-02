(async function () {
  // ===== i18n =====
  const i18n = {
    zh: {
      loading: '加载中...',
      filterTag: '🏷 筛选标签: ',
      clearFilter: '清除',
      entries: ' 篇',
      updated: '最后更新 ',
      langLabel: 'EN',
      langTitle: 'Switch to English',
      langHref: 'en/',
    },
    en: {
      loading: 'Loading...',
      filterTag: '🏷 Filter: ',
      clearFilter: 'Clear',
      entries: ' entries',
      updated: 'updated ',
      langLabel: '中',
      langTitle: '切换中文',
      langHref: '../',
    }
  };

  // Detect language from data-lang attribute or path
  const pageLang = localStorage.getItem('site-lang') || document.documentElement.getAttribute('data-lang') || 'zh';
  document.body.setAttribute('data-lang', pageLang);
  const t = i18n[pageLang] || i18n.zh;

  // ===== Theme =====
  const html = document.documentElement;
  const themeBtn = document.getElementById('themeToggle');
  const hljsLink = document.getElementById('hljs-theme');

  function setTheme(t) {
    html.setAttribute('data-theme', t);
    localStorage.setItem('site-theme', t);
    hljsLink.href = t === 'dark'
      ? 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css'
      : 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css';
  }

  const saved = localStorage.getItem('site-theme');
  if (saved) setTheme(saved);
  else if (window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');

  themeBtn.addEventListener('click', () => {
    setTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  // ===== Mobile menu =====
  const sidebar = document.getElementById('sidebar');
  document.getElementById('mobileMenuToggle').addEventListener('click', () => sidebar.classList.toggle('open'));
  document.getElementById('content').addEventListener('click', () => sidebar.classList.remove('open'));

  // ===== Load data =====
  let data;
  try {
    const res = await fetch('data.json');
    data = await res.json();
  } catch (e) {
    document.getElementById('entries').innerHTML = `<p style="color:var(--text-muted);padding:40px;">${t.loading}</p>`;
    return;
  }

  const { meta, entries } = data;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let activeTag = null;

  document.getElementById('contentMeta').textContent = `${meta.totalEntries}${t.entries} · ${t.updated}${meta.lastUpdated}`;

  // ===== Heatmap =====
  const heatmapEl = document.getElementById('heatmap');
  const today = new Date();
  const dateCounts = {};
  for (const e of entries) dateCounts[e.date] = (dateCounts[e.date] || 0) + 1;
  for (let i = 90; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    const count = dateCounts[ds] || 0;
    const cell = document.createElement('div');
    cell.className = 'heatmap-cell';
    if (count >= 4) cell.classList.add('l4');
    else if (count >= 3) cell.classList.add('l3');
    else if (count >= 2) cell.classList.add('l2');
    else if (count >= 1) cell.classList.add('l1');
    cell.title = `${ds}: ${count}${t.entries}`;
    heatmapEl.appendChild(cell);
  }

  // ===== Timeline nav =====
  const navEl = document.getElementById('timelineNav');
  const byDate = {};
  for (const e of entries) (byDate[e.date] ||= []).push(e);
  const byMonth = {};
  for (const date of Object.keys(byDate).sort().reverse()) {
    const m = date.slice(0, 7);
    (byMonth[m] ||= []).push(date);
  }
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  for (const [month, dates] of Object.entries(byMonth).sort((a, b) => b[0].localeCompare(a[0]))) {
    const [y, m] = month.split('-');
    const totalCount = dates.reduce((s, d) => s + byDate[d].length, 0);
    const isCurrentMonth = month === currentMonth;
    const group = document.createElement('div');
    group.className = 'month-group';
    const header = document.createElement('div');
    header.className = 'month-header';
    header.innerHTML = `<span>${monthNames[parseInt(m) - 1]} ${y}</span><span class="count">${totalCount}</span>`;
    const entriesDiv = document.createElement('div');
    entriesDiv.className = `month-entries${isCurrentMonth ? '' : ' collapsed'}`;
    for (const date of dates) {
      const link = document.createElement('a');
      link.className = 'day-link';
      link.href = `#date-${date}`;
      link.innerHTML = `<span>${monthNames[parseInt(m) - 1]} ${parseInt(date.slice(8))}</span><span class="day-count">${byDate[date].length}</span>`;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById(`date-${date}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        sidebar.classList.remove('open');
      });
      entriesDiv.appendChild(link);
    }
    header.addEventListener('click', () => {
      if (entriesDiv.classList.contains('collapsed')) {
        entriesDiv.classList.remove('collapsed');
        entriesDiv.style.maxHeight = entriesDiv.scrollHeight + 'px';
      } else {
        entriesDiv.style.maxHeight = entriesDiv.scrollHeight + 'px';
        requestAnimationFrame(() => entriesDiv.classList.add('collapsed'));
      }
    });
    group.appendChild(header);
    group.appendChild(entriesDiv);
    navEl.appendChild(group);
    if (isCurrentMonth) requestAnimationFrame(() => { entriesDiv.style.maxHeight = entriesDiv.scrollHeight + 'px'; });
  }

  // ===== Render entries =====
  function renderEntries() {
    const entriesEl = document.getElementById('entries');
    entriesEl.innerHTML = '';

    if (activeTag) {
      const bar = document.createElement('div');
      bar.className = 'filter-bar active';
      bar.innerHTML = `<span>${t.filterTag}<strong>${activeTag}</strong></span><button class="clear-filter">${t.clearFilter}</button>`;
      bar.querySelector('.clear-filter').addEventListener('click', () => { activeTag = null; renderEntries(); });
      entriesEl.appendChild(bar);
    }

    const filtered = activeTag ? entries.filter(e => e.tags.includes(activeTag)) : entries;
    const fByDate = {};
    for (const e of filtered) (fByDate[e.date] ||= []).push(e);

    for (const date of Object.keys(fByDate).sort().reverse()) {
      const d = new Date(date + 'T00:00:00');
      const group = document.createElement('div');
      group.className = 'date-group';
      group.id = `date-${date}`;
      group.innerHTML = `<div class="date-header"><span class="day">${monthNames[d.getMonth()]} ${d.getDate()}</span><span class="year">${d.getFullYear()}</span></div>`;
      for (const entry of fByDate[date]) {
        const article = document.createElement('article');
        article.className = 'article';
        const tagsHtml = entry.tags.map(tg => `<button class="tag${tg === activeTag ? ' active' : ''}" data-tag="${tg}">${tg}</button>`).join('');
        article.innerHTML = `
          <div class="article-time">${entry.time}</div>
          <h3>${entry.title}</h3>
          <div class="article-content">${entry.content}</div>
          ${tagsHtml ? `<div class="article-tags">${tagsHtml}</div>` : ''}
        `;
        article.querySelectorAll('.tag').forEach(btn => {
          btn.addEventListener('click', () => { activeTag = activeTag === btn.dataset.tag ? null : btn.dataset.tag; renderEntries(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
        });
        group.appendChild(article);
      }
      entriesEl.appendChild(group);
    }
    document.querySelectorAll('.article-content pre code').forEach(block => hljs.highlightElement(block));
  }

  renderEntries();
})();

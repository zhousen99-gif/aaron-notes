const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

// Configure marked
marked.setOptions({ gfm: true, breaks: true });

function buildLang(lang) {
  const isEn = lang === 'en';
  const POSTS_DIR = isEn
    ? path.join(__dirname, 'posts', 'en')
    : path.join(__dirname, 'posts');
  const OUTPUT = isEn
    ? path.join(__dirname, 'en', 'data.json')
    : path.join(__dirname, 'data.json');

  if (!fs.existsSync(POSTS_DIR)) {
    console.warn(`Posts directory not found for [${lang}]: ${POSTS_DIR}, skipping.`);
    return;
  }

  // Ensure output directory exists
  const outDir = path.dirname(OUTPUT);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const files = fs.readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.md') && !f.startsWith('.'))
    .sort()
    .reverse();

  const entries = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
    const { data: fm, content } = matter(raw);

    if (!fm.title || !fm.date) {
      console.warn(`[${lang}] Skipping ${file}: missing title or date`);
      continue;
    }

    const dateObj = new Date(fm.date);
    const dateStr = dateObj.toISOString().slice(0, 10);
    const timeStr = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
    const slug = file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');

    const html = marked.parse(content);

    entries.push({
      title: fm.title,
      date: dateStr,
      time: timeStr,
      tags: fm.tags || [],
      content: html,
      slug,
      filename: file,
    });
  }

  // Sort by date desc, then time desc
  entries.sort((a, b) => {
    const d = b.date.localeCompare(a.date);
    if (d !== 0) return d;
    return b.time.localeCompare(a.time);
  });

  const now = new Date();
  const lastUpdated = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const siteTitle = isEn ? "Aaron's Lobster Notes" : 'Aaron的龙虾笔记';

  const output = {
    meta: {
      title: siteTitle,
      totalEntries: entries.length,
      lastUpdated,
      lang,
    },
    entries,
  };

  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`✅ [${lang}] Built ${entries.length} entries → ${OUTPUT}`);
}

// Build both languages
buildLang('zh');
buildLang('en');

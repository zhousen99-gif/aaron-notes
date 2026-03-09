const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const POSTS_DIR = fs.existsSync(path.join(__dirname, 'posts'))
  ? path.join(__dirname, 'posts')
  : path.join(__dirname, '..', 'posts');
const OUTPUT = path.join(__dirname, 'data.json');

// Configure marked
marked.setOptions({
  gfm: true,
  breaks: true,
});

function buildData() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.error(`Posts directory not found: ${POSTS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md')).sort().reverse();
  const entries = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
    const { data: fm, content } = matter(raw);

    if (!fm.title || !fm.date) {
      console.warn(`Skipping ${file}: missing title or date`);
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
  const output = {
    meta: {
      title: 'Aaron的龙虾笔记',
      totalEntries: entries.length,
      lastUpdated: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    },
    entries,
  };

  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`✅ Built ${entries.length} entries → ${OUTPUT}`);
}

buildData();

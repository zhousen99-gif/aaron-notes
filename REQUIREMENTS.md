# Aaron笔记 - 个人思考博客

## 参考网站
https://notes.weweekly.online （Dale 的随机电波）

## 项目目标
搭建一个单页应用风格的个人笔记/博客网站，名为「Aaron笔记」。从 Markdown 文件读取内容，展示为时间轴式的思考短文。

## 技术要求
- **纯前端**：HTML + CSS + JavaScript，无框架依赖
- **数据源**：读取 `posts/` 目录下的 Markdown 文件（通过预生成的 `data.json`）
- **本地运行**：能通过简单 HTTP server 在本地预览（如 `npx serve` 或 `python -m http.server`）

## 页面结构（参考 notes.weweekly.online）

### 整体布局
- 左侧：时间轴导航（固定侧边栏）
- 右侧：文章内容区（可滚动）
- 顶部：网站标题 + 主题切换按钮

### 左侧导航
- 按月分组（如 "Mar 2026"），可折叠
- 每个日期显示文章数量（如 "Mar 9  2"）
- 点击日期滚动到对应内容区
- 当前月份默认展开，其他月份折叠
- 顶部可选：GitHub 风格的 Activity 热力图（简化版即可）

### 右侧内容区
- 顶部标题区：「Aaron笔记」+ 文章总数 + 最后更新时间
- 按日期分组，每天一个区块
- 每天的标题栏：日期 + 年份
- 每篇文章卡片：
  - 发布时间（如 "09:37"）
  - 文章标题（h3）
  - 正文内容（渲染 Markdown）
  - 标签列表（底部，可点击筛选）

### 主题
- 支持深色/浅色主题切换
- 默认跟随系统偏好
- 切换按钮在右上角

### 响应式
- 桌面：左右布局
- 移动端：隐藏侧边栏，改为顶部下拉或汉堡菜单

## 数据格式

### Markdown 文件格式（位于 ../posts/ 目录）
```markdown
---
title: "文章标题"
date: 2026-03-09 13:22
tags: [ai, pricing, economics]
origin: conversation
---

正文内容...

---
**References:**
- [来源标题](URL)
```

### data.json 格式（预生成，供前端读取）
```json
{
  "meta": {
    "title": "Aaron笔记",
    "totalEntries": 1,
    "lastUpdated": "2026-03-09 15:42"
  },
  "entries": [
    {
      "title": "智能的自来水化",
      "date": "2026-03-09",
      "time": "13:22",
      "tags": ["ai", "pricing", "economics"],
      "content": "渲染后的 HTML 内容...",
      "slug": "ai-pricing-economics"
    }
  ]
}
```

## 构建脚本

创建一个 `build.sh`（或 Node.js 脚本），功能：
1. 扫描 `../posts/` 目录（即 ~/.openclaw/workspace/posts/）
2. 解析每个 .md 文件的 frontmatter 和内容
3. 将 Markdown 渲染为 HTML
4. 生成 `data.json`
5. 输出到网站目录

## 设计风格
- 简洁、现代、有质感
- 参考 notes.weweekly.online 的设计语言
- 中文排版优化（行高、字间距）
- 代码块语法高亮
- 引用块美观处理

## 文件结构
```
aaron-notes/
├── index.html          # 主页面
├── style.css           # 样式
├── app.js              # 前端逻辑
├── data.json           # 预生成的文章数据
├── build.js            # 构建脚本（Node.js）
├── package.json        # 依赖（marked, gray-matter 等）
└── REQUIREMENTS.md     # 本文件
```

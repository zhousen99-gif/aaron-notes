/**
 * translate-openkosmos.js
 * Translates Chinese text in OpenKosmos doc to bilingual format.
 */
const fs = require('fs');
const path = require('path');

const translations = [
  // Cover
  ['Architecture Deep Dive &middot; AI Agent Studio 架构深度解析', 'Architecture Deep Dive &middot; AI Agent Studio Architecture Analysis'],
  ['542 文件 &middot; 198,107 行代码 &middot; 337 TypeScript 文件', '542 Files &middot; 198,107 Lines of Code &middot; 337 TypeScript Files'],
  ['Microsoft Open Source (MIT License) &middot; 分析日期 2026-03-26', 'Microsoft Open Source (MIT License) &middot; Analyzed 2026-03-26'],

  // Section 1
  ['整体三进程架构', 'Three-Process Architecture'],
  ['Electron 标准安全模型的最佳实践——渲染进程无法直接访问 Node.js API，所有跨进程调用经过白名单过滤。',
   'Best practice of Electron\'s standard security model — the renderer process cannot directly access Node.js APIs; all cross-process calls go through whitelist filtering.'],
  ['整个项目遵循 Electron 标准的<strong>多进程安全模型</strong>，三个进程分工明确：',
   'The entire project follows Electron\'s standard <strong>multi-process security model</strong>, with three processes having clear division of labor:'],
  ['<strong>渲染进程（Chromium 沙箱）</strong>：纯 React 18 UI，只通过 <code>window.electronAPI</code> 与外部通信，无法直接访问 Node.js',
   '<strong>Renderer Process (Chromium Sandbox)</strong>: Pure React 18 UI, communicates externally only through <code>window.electronAPI</code>, cannot directly access Node.js'],
  ['<strong>预加载进程（安全桥梁）</strong>：2,262 行桥接代码，通过 <code>contextBridge.exposeInMainWorld</code> 暴露受控 API，<code>provideInvokeForPreload()</code> 实现白名单过滤——非白名单 channel 直接 <code>throw Error</code>',
   '<strong>Preload Process (Security Bridge)</strong>: 2,262 lines of bridge code, exposes controlled APIs via <code>contextBridge.exposeInMainWorld</code>, <code>provideInvokeForPreload()</code> implements whitelist filtering — non-whitelisted channels directly <code>throw Error</code>'],
  ['<strong>主进程（Node.js 全能力）</strong>：承载所有核心逻辑——AgentChat 对话引擎（4,020 行）、MCPClientManager 工具路由（1,574 行）、AuthManager 认证（1,091 行）、ProfileCacheManager 数据持久化（2,757 行）',
   '<strong>Main Process (Full Node.js)</strong>: Hosts all core logic — AgentChat conversation engine (4,020 lines), MCPClientManager tool routing (1,574 lines), AuthManager authentication (1,091 lines), ProfileCacheManager data persistence (2,757 lines)'],
  ['<strong>💡 设计精髓：</strong>Preload 是安全架构的核心中枢。TypeScript 泛型在<strong>编译期</strong>就保证了白名单的完整性——遗漏任何 key 都会编译报错。',
   '<strong>💡 Design essence:</strong> Preload is the security architecture\'s core hub. TypeScript generics guarantee whitelist completeness at <strong>compile time</strong> — missing any key triggers a compile error.'],

  // Section 2
  ['类型安全 IPC 框架（最精妙的设计）', 'Type-Safe IPC Framework (Most Elegant Design)'],
  ['一套类型定义，三个进程共享——TypeScript 泛型 + ES6 Proxy 实现零冗余、编译时安全的跨进程通信。',
   'One set of type definitions, shared across three processes — TypeScript generics + ES6 Proxy achieve zero-redundancy, compile-time safe cross-process communication.'],
  ['这是项目最值得关注的工程亮点——用 TypeScript 泛型 + ES6 Proxy 实现了完全类型安全的跨进程通信。<strong>一套类型定义，三个进程共享：</strong>',
   'This is the project\'s most noteworthy engineering highlight — fully type-safe cross-process communication via TypeScript generics + ES6 Proxy. <strong>One set of type definitions, shared across three processes:</strong>'],
  ['<strong>💡 对比传统方式：</strong>传统 Electron IPC 手写 channel 字符串容易拼错、参数类型靠人肉检查、新增 API 需改 3 处。OpenKosmos 做到了一处定义、编译器自动推断、零样板代码。',
   '<strong>💡 vs. Traditional approach:</strong> Traditional Electron IPC with hand-written channel strings is error-prone, parameter types rely on manual checking, and adding new APIs requires changes in 3 places. OpenKosmos achieves single-point definition, automatic compiler inference, and zero boilerplate.'],

  // Section 3
  ['Agent 对话引擎——核心循环与工具调用', 'Agent Conversation Engine — Core Loop & Tool Calling'],
  ['agentChat.ts（4,020 行）——整个系统的心脏。用户消息 → 上下文管理 → 压缩检查 → LLM 调用 → 工具循环。',
   'agentChat.ts (4,020 lines) — the heart of the entire system. User message → context management → compression check → LLM call → tool loop.'],
  ['从用户按下发送到收到回复，经历完整的<strong>对话主循环</strong>：',
   'From user pressing send to receiving a reply, the complete <strong>main conversation loop</strong>:'],
  ['<strong>保存用户消息</strong>到上下文（<code>AddMessageToSession</code>）',
   '<strong>Save user message</strong> to context (<code>AddMessageToSession</code>)'],
  ['<strong>进入 while 循环</strong>，每轮迭代：', '<strong>Enter while loop</strong>, each iteration:'],
  ['检查 <code>CancellationToken</code>（用户是否点了停止）', 'Check <code>CancellationToken</code> (did user click stop)'],
  ['<code>CheckAndCompress</code>：token 超限则自动压缩上下文', '<code>CheckAndCompress</code>: auto-compress context if token limit exceeded'],
  ['<code>callWithToolsStreaming</code>：调用 LLM API，流式推送 token', '<code>callWithToolsStreaming</code>: call LLM API, stream tokens'],
  ['<strong>判断响应类型</strong>：纯文本→结束循环；工具调用→进入工具分支', '<strong>Determine response type</strong>: plain text → end loop; tool call → enter tool branch'],
  ['<strong>工具分支</strong>：批量审批 → 逐个执行 → 后处理 → 结果回填上下文 → 回到循环顶部',
   '<strong>Tool branch</strong>: batch approval → execute one by one → post-process → backfill results to context → return to loop top'],
  ['<strong>💡 关键设计：</strong><strong>批量审批</strong>而非逐个弹窗，减少用户交互打断；<strong>图片注入</strong>自动从 MCP 工具结果中提取 base64 并压缩后作为 user image message 注入，供视觉模型分析。',
   '<strong>💡 Key design:</strong> <strong>Batch approval</strong> instead of individual popups, reducing user interaction interruption; <strong>Image injection</strong> automatically extracts base64 from MCP tool results, compresses and injects as user image message for vision model analysis.'],

  // Section 4
  ['MCP 工具路由机制', 'MCP Tool Routing Mechanism'],
  ['MCPClientManager（1,574 行）实现了工具名到服务器的透明路由——AgentChat 只需调用 executeTool(name, args)，无需感知工具在哪。',
   'MCPClientManager (1,574 lines) implements transparent routing from tool name to server — AgentChat only needs to call executeTool(name, args), without needing to know where the tool lives.'],
  ['<strong>内置工具</strong>（<code>read_file</code>、<code>web_search</code> 等 30+ 个）：通过 <code>BuiltinMcpClient</code> 直接在主进程执行',
   '<strong>Built-in tools</strong> (<code>read_file</code>, <code>web_search</code>, etc. 30+): executed directly in the main process via <code>BuiltinMcpClient</code>'],
  ['<strong>外部 MCP 工具</strong>：通过 <code>toolToServerMap</code>（<code>Map&lt;toolName, serverName&gt;</code>）查询后路由到对应的 <code>VscMcpClient</code>——支持 stdio/SSE/Streamable HTTP 三种传输',
   '<strong>External MCP tools</strong>: queried via <code>toolToServerMap</code> (<code>Map&lt;toolName, serverName&gt;</code>) then routed to the corresponding <code>VscMcpClient</code> — supporting stdio/SSE/Streamable HTTP transports'],
  ['并发安全通过两层机制保障：', 'Concurrency safety is ensured through two layers:'],
  ['<strong>OperationLock</strong>：每个 MCP 服务器独立操作锁，防止 connect/disconnect/reconnect 并发冲突',
   '<strong>OperationLock</strong>: Independent operation lock per MCP server, preventing connect/disconnect/reconnect concurrency conflicts'],
  ['<strong>AbortController</strong>：追踪进行中的连接，用户切换 Agent 时可立即中止旧连接',
   '<strong>AbortController</strong>: Tracks in-progress connections, immediately aborting old connections when users switch Agents'],

  // Section 5
  ['上下文压缩机制', 'Context Compression Mechanism'],
  ['fullModeCompressor.ts（645 行）——Token 超限时自动触发，用轻量模型生成结构化摘要替换中间消息，优雅解决长会话问题。',
   'fullModeCompressor.ts (645 lines) — auto-triggered when token limit is exceeded, using a lightweight model to generate structured summaries replacing intermediate messages, elegantly solving the long-conversation problem.'],
  ['<strong>保留策略（绝不压缩的部分）：</strong>', '<strong>Retention policy (never compressed):</strong>'],
  ['🔒 <strong>首条用户消息</strong>：确立对话目标', '🔒 <strong>First user message</strong>: Establishes conversation objective'],
  ['🔒 <strong>首次技能调用</strong>：工具发现记录', '🔒 <strong>First skill invocation</strong>: Tool discovery record'],
  ['🔒 <strong>最近 5 条消息</strong>：维持连贯性', '🔒 <strong>Last 5 messages</strong>: Maintains coherence'],
  ['<strong>压缩部分</strong>（中间所有消息）被发送给轻量的 <code>claude-haiku</code> 模型，生成包含 <strong>8 个固定章节</strong>的结构化摘要：对话概述、资源基础、内容状态、问题解决、进度追踪、活跃工作、最近操作、续接计划——确保 AI 能无缝续接，不丢失任何关键上下文。',
   '<strong>Compressed portion</strong> (all intermediate messages) is sent to the lightweight <code>claude-haiku</code> model, generating a structured summary with <strong>8 fixed sections</strong>: conversation overview, resource foundation, content status, problem solving, progress tracking, active work, recent operations, continuation plan — ensuring AI can seamlessly continue without losing any critical context.'],
  ['<strong>💡 递归巧妙：</strong>用 LLM 来压缩 LLM 的记忆。选用轻量的 claude-haiku 而非主力模型，压缩本身的 token 消耗极低。',
   '<strong>💡 Recursive elegance:</strong> Using an LLM to compress an LLM\'s memory. By choosing the lightweight claude-haiku instead of the primary model, the compression itself has minimal token cost.'],

  // Section 6
  ['取消令牌（Cancellation Token）模式', 'Cancellation Token Pattern'],
  ['借鉴 VSCode 的 CancellationToken 模式，实现 Source/Token 职责分离——拥有者控制取消、执行者只读检查。',
   'Inspired by VSCode\'s CancellationToken pattern, implementing Source/Token responsibility separation — owners control cancellation, executors only read-check.'],
  ['<code>CancellationTokenSource</code>（拥有者）：持有 <code>cancel()</code> 和 <code>dispose()</code> 方法',
   '<code>CancellationTokenSource</code> (owner): holds <code>cancel()</code> and <code>dispose()</code> methods'],
  ['<code>CancellationToken</code>（只读接口）：执行者只能检查 <code>isCancellationRequested</code>，不能触发取消',
   '<code>CancellationToken</code> (read-only interface): executors can only check <code>isCancellationRequested</code>, cannot trigger cancellation'],
  ['<code>AgentChatManager</code> 为每个 <code>chatSession</code> 持有一个 Source',
   '<code>AgentChatManager</code> holds one Source for each <code>chatSession</code>'],
  ['在对话循环中设置了 <strong>7 个取消检查点</strong>：streamMessage 入口、while 循环开始、压缩完成后、工具审批前、工具审批后、每个工具执行前、错误捕获层——每个异步阻塞节点前后都检查，保证用户点停止后<strong>毫秒级生效</strong>。',
   '<strong>7 cancellation checkpoints</strong> are set in the conversation loop: streamMessage entry, while loop start, after compression, before tool approval, after tool approval, before each tool execution, error catch layer — checking before and after every async blocking node, ensuring <strong>millisecond-level response</strong> after users click stop.'],

  // Section 7
  ['数据持久化分层架构', 'Data Persistence Layered Architecture'],
  ['ProfileCacheManager（2,757 行）是数据中枢，实现了内存缓存 → 磁盘持久化 → IPC 同步的三层分离。',
   'ProfileCacheManager (2,757 lines) is the data hub, implementing a three-layer separation of memory cache → disk persistence → IPC sync.'],
  ['快速读写', 'Fast R/W'],
  ['跨会话持久化', 'Cross-session persistence'],
  ['前端实时刷新', 'Frontend real-time refresh'],
  ['<strong>💡 核心原则：</strong>缓存是加速层而非替代品。每次修改后<strong>同时写磁盘 + 推 IPC</strong>，保证三层永远一致。前端不需要轮询，通过 IPC 事件驱动 React 状态自动更新。',
   '<strong>💡 Core principle:</strong> Cache is an acceleration layer, not a replacement. After every modification, <strong>simultaneously write to disk + push IPC</strong>, ensuring all three layers are always consistent. Frontend doesn\'t need polling; IPC events drive automatic React state updates.'],

  // Section 8
  ['多 Agent 并发管理', 'Multi-Agent Concurrent Management'],
  ['AgentChatManager（1,422 行）以 ChatSessionId 为粒度管理独立的 AgentChat 实例，5 分钟空闲自动回收。',
   'AgentChatManager (1,422 lines) manages independent AgentChat instances at ChatSessionId granularity, auto-reclaiming after 5 minutes of idleness.'],
  ['<strong>实例生命周期 5 个阶段：</strong>', '<strong>Instance lifecycle — 5 stages:</strong>'],
  ['<strong>创建</strong>：用户打开 Tab → <code>new AgentChat(alias, chatId, sessionId)</code>，若有历史则从 <code>session.json</code> 恢复',
   '<strong>Creation</strong>: User opens Tab → <code>new AgentChat(alias, chatId, sessionId)</code>, restores from <code>session.json</code> if history exists'],
  ['<strong>活跃</strong>：用户发消息 → <code>streamMessage()</code>，每次交互重置 idle 计时器',
   '<strong>Active</strong>: User sends message → <code>streamMessage()</code>, each interaction resets idle timer'],
  ['<strong>空闲</strong>：用户切换到其他 Tab → 启动 5 分钟倒计时',
   '<strong>Idle</strong>: User switches to another Tab → starts 5-minute countdown'],
  ['<strong>销毁</strong>：5 分钟无操作 → <code>destroy()</code>，释放内存 + 清理 CancellationSource',
   '<strong>Destroyed</strong>: 5 minutes without activity → <code>destroy()</code>, releases memory + cleans up CancellationSource'],
  ['<strong>重建</strong>：用户切回已销毁 Tab → 从 <code>session.json</code> 重新创建实例，<strong>用户无感知恢复</strong>',
   '<strong>Rebuilt</strong>: User switches back to destroyed Tab → recreates instance from <code>session.json</code>, <strong>seamless user-transparent recovery</strong>'],
  ['<strong>💡 设计要点：</strong>实例池 + 惰性清理，避免多标签页同时开启时的内存泄漏，同时保证对话上下文不丢失。',
   '<strong>💡 Design point:</strong> Instance pool + lazy cleanup, preventing memory leaks when multiple tabs are open simultaneously, while ensuring conversation context is never lost.'],

  // Footer
  ['OpenKosmos &middot; Microsoft Open Source &middot; Architecture Deep Dive &middot; Generated 2026-03-26',
   'OpenKosmos &middot; Microsoft Open Source &middot; Architecture Deep Dive &middot; Generated 2026-03-26'],

  // Table headers
  ['层次', 'Layer'],
  ['职责', 'Responsibility'],
  ['实现', 'Implementation'],
  ['内存层', 'Memory Layer'],
  ['磁盘层', 'Disk Layer'],
  ['IPC 同步层', 'IPC Sync Layer'],
  ['角色', 'Role'],
  ['绑定方式', 'Binding'],
  ['作用', 'Function'],
  ['主进程', 'Main Process'],
  ['预加载', 'Preload'],
  ['渲染进程', 'Renderer'],
];

// Apply
const filePath = path.join(__dirname, 'docs', 'openkosmos', 'index.html');
let html = fs.readFileSync(filePath, 'utf-8');

// Sort by length descending
const sorted = [...translations].sort((a, b) => b[0].length - a[0].length);

for (const [zh, en] of sorted) {
  if (zh === en) continue;
  if (html.includes(zh) && !html.includes(`<span class="zh-only">${zh}</span>`)) {
    html = html.split(zh).join(`<span class="zh-only">${zh}</span><span class="en-only">${en}</span>`);
  }
}

// Add i18n support
if (!html.includes('data-lang')) {
  html = html.replace('<body>', '<body data-lang="zh">');

  const i18nCSS = `
<style id="i18n-styles">
  [data-lang="zh"] .en-only { display: none !important; }
  [data-lang="en"] .zh-only { display: none !important; }
</style>`;
  html = html.replace('</head>', i18nCSS + '\n</head>');

  html = html.replace(
    '<button class="doc-ctrl-btn" id="docThemeToggle"',
    '<button class="doc-ctrl-btn" id="docLangToggle" title="Switch language">EN</button>\n  <button class="doc-ctrl-btn" id="docThemeToggle"'
  );

  const langScript = `
  var langBtn = document.getElementById('docLangToggle');
  if (langBtn) {
    var body = document.body;
    function setDocLang(l) {
      body.setAttribute('data-lang', l);
      localStorage.setItem('docs-lang', l);
      langBtn.textContent = l === 'zh' ? 'EN' : '中';
    }
    var savedLang = localStorage.getItem('docs-lang');
    if (savedLang) setDocLang(savedLang);
    langBtn.addEventListener('click', function() {
      setDocLang(body.getAttribute('data-lang') === 'zh' ? 'en' : 'zh');
    });
  }`;
  html = html.replace("document.getElementById('docThemeToggle').addEventListener", langScript + "\n  document.getElementById('docThemeToggle').addEventListener");
}

fs.writeFileSync(filePath, html, 'utf-8');
console.log('✅ Translated: docs/openkosmos/index.html');

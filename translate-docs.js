/**
 * translate-docs.js
 * Translates Chinese text in tech doc HTML files to bilingual (zh/en) format.
 * Wraps Chinese text in <span class="zh-only"> and adds <span class="en-only"> translation.
 */
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════
// Agent Orchestration translation map
// ═══════════════════════════════════════════════════
const orchTranslations = [
  // Header
  ['PM Studio 多层级 Agent 编排架构 · 需求与可行性分析', 'PM Studio Multi-Level Agent Orchestration Architecture · Requirements & Feasibility Analysis'],
  ['Version 0.1 Draft · 2026-03-31', 'Version 0.1 Draft · 2026-03-31'],

  // Section 1
  ['愿景概述', 'Vision Overview'],
  ['构建一个<strong>两级 Agent 编排体系</strong>：用户只需与少量 L2 编排 Agent 交互，由 L2 自动拆解任务、调度或创建 L1 执行 Agent、监控进度、处理异常，并定期向用户汇报。',
   'Build a <strong>two-level Agent orchestration system</strong>: users interact only with a few L2 orchestrator Agents, which automatically decompose tasks, schedule or create L1 execution Agents, monitor progress, handle exceptions, and periodically report to users.'],
  ['<strong>核心理念：</strong>用户不再直接管理大量 Agent，而是通过 L2 "经理" 来管理 L1 "员工"，实现 <strong>任务驱动的自动化编排</strong>。',
   '<strong>Core concept:</strong> Users no longer directly manage numerous Agents. Instead, L2 "managers" manage L1 "workers," achieving <strong>task-driven automated orchestration</strong>.'],

  // SVG text in architecture diagram
  ['发布任务', 'Assign Task'],
  ['分配任务', 'Delegate Task'],
  ['创建+分配', 'Create+Delegate'],
  ['定期汇报', 'Periodic Report'],
  ['任务下发', 'Task Dispatch'],
  ['状态回报', 'Status Report'],
  ['汇报', 'Report'],
  ['临时 Agent', 'Temp Agent'],
  ['• 任务拆解 &amp; 分配', '• Task decomposition &amp; assignment'],
  ['• 创建 / 配置 L1 Agent', '• Create / configure L1 Agents'],
  ['• 监控进度 &amp; 干预', '• Monitor progress &amp; intervene'],
  ['• 定期向用户汇报', '• Periodic user reports'],
  ['• 另一个任务领域', '• Another task domain'],
  ['• 独立管理其 L1 池', '• Manages its own L1 pool'],
  ['• 同样的编排能力', '• Same orchestration capabilities'],
  ['已有 · 长期保留', 'Existing · Permanent'],
  ['按需创建 · 可能保留', 'On-demand · May keep'],
  ['临时创建 · 用完删除', 'Temporary · Delete after use'],
  ['一次性任务', 'One-time task'],
  ['专项技能', 'Specialized skills'],
  ['任务定制', 'Task-specific'],
  ['内置工具 (Search, File, Web)  ·  MCP Servers  ·  Claude Code  ·  外部 API',
   'Built-in Tools (Search, File, Web)  ·  MCP Servers  ·  Claude Code  ·  External APIs'],

  // Section 2
  ['核心需求拆解', 'Core Requirements Breakdown'],
  ['将整个编排架构拆解为 <strong>7 项关键能力</strong>，每一项都是系统运转的必要条件。',
   'Decompose the entire orchestration architecture into <strong>7 key capabilities</strong>, each a necessary condition for the system to function.'],
  ['任务生命周期', 'Task Lifecycle'],
  ['七项关键能力', 'Seven Key Capabilities'],

  // Task lifecycle SVG
  ['用户', 'User'],
  ['L2 接收', 'L2 Receives'],
  ['拆解任务', 'Decompose'],
  ['L2 评估', 'L2 Evaluates'],
  ['查找/创建 L1', 'Find/Create L1'],
  ['L1 执行', 'L1 Executes'],
  ['使用工具完成', 'Complete w/ Tools'],
  ['L2 验收', 'L2 Validates'],
  ['检查质量', 'Quality Check'],
  ['交付用户', 'Deliver to User'],
  ['遇到问题 → 上报 L2', 'Issue → Escalate to L2'],
  ['质量不达标 → 返工', 'Quality fail → Rework'],

  // Capability table
  ['能力', 'Capability'],
  ['描述', 'Description'],
  ['角色', 'Role'],
  ['<strong>Agent 生命周期管理</strong>', '<strong>Agent Lifecycle Management</strong>'],
  ['L2 能创建、配置、更新、删除 L1 Agent，包括设计 system prompt、选择 model、配置 skills 和 tools',
   'L2 can create, configure, update, and delete L1 Agents, including designing system prompts, selecting models, configuring skills and tools'],
  ['<strong>Agent 发现与适配评估</strong>', '<strong>Agent Discovery & Fitness Assessment</strong>'],
  ['L2 收到任务后，能列举已有 L1 Agent，读取其配置，判断是否适合当前任务',
   'After receiving a task, L2 can list existing L1 Agents, read their configs, and assess suitability for the current task'],
  ['<strong>任务下发</strong>', '<strong>Task Dispatch</strong>'],
  ['L2 能向指定 L1 Agent 发送任务指令，创建新的执行 session',
   'L2 can send task instructions to a specific L1 Agent and create a new execution session'],
  ['<strong>状态回报与求助</strong>', '<strong>Status Reporting & Escalation</strong>'],
  ['L1 能向 L2 汇报任务进度/结果，遇到权限问题或功能缺失时能上报请求帮助',
   'L1 can report task progress/results to L2, and escalate for help when encountering permission issues or capability gaps'],
  ['<strong>进度监控与干预</strong>', '<strong>Progress Monitoring & Intervention</strong>'],
  ['L2 能实时查看 L1 的执行状态，必要时注入新指令或中止任务',
   'L2 can view L1 execution status in real-time, inject new instructions or abort tasks when necessary'],
  ['<strong>定期汇报</strong>', '<strong>Periodic Reporting</strong>'],
  ['L2 能按设定频率向用户汇总所有 L1 的任务状态，生成进度报告',
   'L2 can summarize all L1 task statuses to the user at set intervals and generate progress reports'],
  ['<strong>工具使用与执行</strong>', '<strong>Tool Usage & Execution</strong>'],
  ['L1 能使用内置工具、MCP Servers、编程工具等完成实际任务',
   'L1 can use built-in tools, MCP Servers, programming tools, etc. to complete actual tasks'],

  // Section 3
  ['PM Studio 平台现状评估', 'PM Studio Platform Assessment'],
  ['逐项对照七大能力，评估 PM Studio 当前版本的支持程度。',
   'Assess PM Studio\'s current support level against each of the seven capabilities.'],
  ['现有支持', 'Current Support'],
  ['缺口说明', 'Gap Description'],
  ['Agent 生命周期管理', 'Agent Lifecycle Mgmt'],
  ['⚠ 部分', '⚠ Partial'],
  ['create_agent_from_config、update_agent 可用', 'create_agent_from_config, update_agent available'],
  ['无 delete_agent API，无法"用完删除"', 'No delete_agent API, cannot "delete after use"'],
  ['Agent 发现与适配', 'Agent Discovery'],
  ['✓ 可行', '✓ Feasible'],
  ['list_agents + 读 profile.json 获取配置', 'list_agents + read profile.json for configs'],
  ['缺少结构化能力标签 (capability tags)，需解析 prompt 推断', 'Missing structured capability tags; must infer from prompt parsing'],
  ['任务下发 (L2→L1)', 'Task Dispatch (L2→L1)'],
  ['✗ 缺失', '✗ Missing'],
  ['仅 create_schedule 可定时触发', 'Only create_schedule for timed triggers'],
  ['无实时 agent-to-agent 消息传递，无法按需即时分配任务', 'No real-time agent-to-agent messaging; cannot assign tasks on demand'],
  ['状态回报 (L1→L2)', 'Status Report (L1→L2)'],
  ['无', 'None'],
  ['无 callback/事件机制，L1 无法主动通知 L2', 'No callback/event mechanism; L1 cannot proactively notify L2'],
  ['进度监控与干预', 'Progress Monitoring'],
  ['L2 无法读取 L1 session 内容，无法注入指令', 'L2 cannot read L1 session content or inject instructions'],
  ['create_schedule 定时触发 Agent 生成报告', 'create_schedule triggers Agent report generation on schedule'],
  ['汇报质量取决于能否获取 L1 状态 (依赖 C4)', 'Report quality depends on obtaining L1 status (depends on C4)'],
  ['工具使用与执行', 'Tool Usage & Execution'],
  ['内置工具 + MCP Servers + 外部集成', 'Built-in tools + MCP Servers + external integrations'],
  ['已满足需求', 'Meets requirements'],
  ['能力覆盖率一览', 'Capability Coverage Overview'],
  ['生命周期', 'Lifecycle'],
  ['发现适配', 'Discovery'],
  ['监控干预', 'Monitoring'],
  ['工具执行', 'Tool Exec'],
  ['部分', 'Partial'],
  ['可行', 'Feasible'],
  ['缺失', 'Missing'],

  // Section 4
  ['缺口分析 — 需要新增的平台能力', 'Gap Analysis — Required New Platform Capabilities'],
  ['按优先级排列，<strong>P0 为阻塞项</strong>（没有就无法运转），P1 为重要增强，P2 为体验优化。',
   'Prioritized: <strong>P0 = blockers</strong> (system cannot function without them), P1 = important enhancements, P2 = experience improvements.'],
  ['Agent 间通信协议', 'Inter-Agent Communication Protocol'],
  ['需要 <strong>send_task_to_agent(agent_name, message)</strong> 接口 — L2 在目标 L1 创建新 session 并发送 prompt。这是整个编排架构的基础通道，没有它 L2 就无法指挥 L1。',
   'Requires <strong>send_task_to_agent(agent_name, message)</strong> API — L2 creates a new session on target L1 and sends a prompt. This is the foundational channel of the entire orchestration architecture; without it, L2 cannot direct L1.'],
  ['任务状态机 / 共享存储', 'Task State Machine / Shared Storage'],
  ['需要一个 L1 和 L2 都能读写的 <strong>任务状态对象</strong>（task_id, status, result…），支持 pending → in_progress → completed/failed/escalated 流转。否则 L2 无法获知 L1 的工作进展。',
   'Requires a <strong>task state object</strong> readable/writable by both L1 and L2 (task_id, status, result...), supporting pending → in_progress → completed/failed/escalated transitions. Without it, L2 cannot know L1\'s work progress.'],
  ['Session 读取能力', 'Session Read Capability'],
  ['L2 需要 <strong>read_agent_session(agent, session_id)</strong> 来查看 L1 的执行过程和输出。这是监控和验收的前提。',
   'L2 needs <strong>read_agent_session(agent, session_id)</strong> to view L1\'s execution process and output. This is a prerequisite for monitoring and validation.'],
  ['Agent 删除 API', 'Agent Delete API'],
  ['需要 <strong>delete_agent(agent_name)</strong> — 对于一次性任务创建的临时 L1 Agent，完成后应当能清理删除，避免 agent 列表无限膨胀。',
   'Requires <strong>delete_agent(agent_name)</strong> — temporary L1 Agents created for one-time tasks should be cleanable after completion, preventing unbounded agent list growth.'],
  ['Session 干预能力', 'Session Intervention Capability'],
  ['L2 需要能向 L1 <strong>正在执行的 session 注入新指令</strong>，或者 L1 支持执行中途的 checkpoint 机制，到 checkpoint 时检查 L2 是否有新指示。',
   'L2 needs to <strong>inject new instructions into L1\'s active session</strong>, or L1 should support mid-execution checkpoints where it checks for new L2 directives.'],
  ['回调 / 事件通知', 'Callback / Event Notification'],
  ['L1 完成任务后能 <strong>自动触发通知</strong> 给 L2（而非 L2 轮询）。类似 webhook 或事件订阅机制。',
   'After L1 completes a task, it should <strong>automatically trigger notifications</strong> to L2 (instead of L2 polling). Similar to webhook or event subscription mechanisms.'],
  ['Agent 能力注册表', 'Agent Capability Registry'],
  ['每个 Agent 除了 system prompt，增加结构化的 <strong>capabilities / domain tags</strong>。L2 可通过 search_agents_by_capability(tags) 快速匹配合适的 L1。',
   'Beyond system prompts, each Agent would have structured <strong>capabilities / domain tags</strong>. L2 can quickly match suitable L1s via search_agents_by_capability(tags).'],
  ['任务执行历史', 'Task Execution History'],
  ['记录每个 Agent 的 <strong>历史任务及成功率</strong>，帮助 L2 做更精准的任务分配决策。',
   'Record each Agent\'s <strong>historical tasks and success rates</strong>, helping L2 make more precise task assignment decisions.'],

  // Section 5
  ['当前可行的 Workaround 方案', 'Current Feasible Workaround'],
  ['在平台尚未提供 Agent 间通信的情况下，可以利用 <strong>文件系统 + Schedule 定时任务</strong> 搭建一个"穷人版"编排原型。',
   'Before the platform provides inter-Agent communication, we can use the <strong>file system + scheduled tasks</strong> to build a "poor man\'s" orchestration prototype.'],
  ['📁 文件系统作为通信总线', '📁 File System as Communication Bus'],
  ['所有 Agent 共享一个 workspace 目录，通过 JSON 文件进行异步通信：',
   'All Agents share a workspace directory, communicating asynchronously via JSON files:'],
  ['# L2 写入任务定义 (what, who, deadline)', '# L2 writes task definition (what, who, deadline)'],
  ['# L1 更新执行状态 (progress, blockers)', '# L1 updates execution status (progress, blockers)'],
  ['# L1 写入最终交付物', '# L1 writes final deliverable'],
  ['# L1 写入求助请求 (问题描述, 需要什么)', '# L1 writes escalation request (issue, what\'s needed)'],
  ['# Agent 能力注册表 (手动维护)', '# Agent capability registry (manually maintained)'],
  ['# L2 生成的汇总报告', '# Summary report generated by L2'],
  ['⏱️ Schedule 定时任务作为触发器', '⏱️ Scheduled Tasks as Triggers'],
  ['<strong>L2 发任务：</strong>写入 task JSON → 用 create_schedule 创建立即执行的任务，让 L1 去读取并执行',
   '<strong>L2 assigns tasks:</strong> Write task JSON → use create_schedule to create an immediate task, letting L1 read and execute'],
  ['<strong>L1 汇报：</strong>把状态/结果写入文件 → L2 通过定时 schedule 轮询检查',
   '<strong>L1 reports:</strong> Write status/results to files → L2 polls via scheduled tasks'],
  ['<strong>L2 干预：</strong>写入新的指令文件 → L1 在 prompt 中被要求定期检查指令文件',
   '<strong>L2 intervenes:</strong> Write new instruction files → L1 is prompted to periodically check instruction files'],
  ['<strong>L2 汇报：</strong>定时 schedule 触发 L2 汇总所有 task 状态，生成报告',
   '<strong>L2 reports:</strong> Scheduled task triggers L2 to summarize all task statuses and generate reports'],
  ['<strong>⚠️ Workaround 的局限性：</strong>延迟高（非实时）、依赖 Agent 自觉检查文件（无真正事件驱动）、状态一致性难保证、调试困难。适合用来<strong>验证概念和流程</strong>，不适合生产级使用。',
   '<strong>⚠️ Workaround limitations:</strong> High latency (not real-time), relies on Agents proactively checking files (no true event-driven), hard to guarantee state consistency, difficult to debug. Suitable for <strong>validating concepts and workflows</strong>, not for production use.'],

  // Section 6
  ['建议路线图', 'Suggested Roadmap'],
  ['Phase 1：概念验证 (PoC)', 'Phase 1: Proof of Concept (PoC)'],
  ['现在可以做', 'Actionable now'],
  ['基于文件系统 + Schedule 机制搭建原型。验证 L2→L1 任务分发、结果收集、异常上报的核心流程是否符合预期。明确真实使用中的痛点和优先级。',
   'Build a prototype using file system + Schedule mechanisms. Validate whether the core workflows of L2→L1 task distribution, result collection, and exception escalation meet expectations. Identify real-world pain points and priorities.'],
  ['Phase 2：平台能力建设', 'Phase 2: Platform Capability Building'],
  ['需要 PM Studio 团队支持', 'Requires PM Studio team support'],
  ['推动 P0 能力的平台级实现：Agent 间通信协议、任务状态机、Session 读取 API。这些是从原型走向可靠系统的必要基础设施。',
   'Drive platform-level implementation of P0 capabilities: inter-Agent communication protocol, task state machine, Session read API. These are the essential infrastructure for moving from prototype to reliable system.'],
  ['Phase 3：增强与规模化', 'Phase 3: Enhancement & Scale'],
  ['平台能力就绪后', 'After platform capabilities are ready'],
  ['实现 P1/P2 能力：Agent 删除、Session 干预、回调通知、能力注册表。支持更复杂的多 L1 并行任务编排，引入任务执行历史辅助智能调度。',
   'Implement P1/P2 capabilities: Agent deletion, Session intervention, callback notifications, capability registry. Support more complex parallel multi-L1 task orchestration, introduce task execution history for intelligent scheduling.'],
  ['Phase 4：智能化', 'Phase 4: Intelligence'],
  ['长期目标', 'Long-term goal'],
  ['L2 具备自主学习能力 — 根据历史数据自动优化 L1 配置、任务分配策略和干预时机。形成真正的 Agentic Workflow Engine。',
   'L2 gains autonomous learning capabilities — automatically optimizing L1 configurations, task assignment strategies, and intervention timing based on historical data. Forming a true Agentic Workflow Engine.'],

  // Section 7
  ['与业界方案对比', 'Industry Comparison'],
  ['当前主流的 Multi-Agent 编排框架，供参考对比：',
   'Current mainstream Multi-Agent orchestration frameworks for reference:'],
  ['框架', 'Framework'],
  ['编排模式', 'Orchestration Mode'],
  ['Agent 间通信', 'Inter-Agent Comm'],
  ['与 PM Studio 的差异', 'Difference from PM Studio'],
  ['角色定义 + 顺序/并行流程', 'Role definition + Sequential/parallel flows'],
  ['内存共享 + 委托', 'Memory sharing + delegation'],
  ['代码框架，非 GUI；通信内置在进程中', 'Code framework, not GUI; communication built into process'],
  ['对话式协作', 'Conversational collaboration'],
  ['Agent 间直接消息', 'Direct agent-to-agent messaging'],
  ['MS 出品；聚焦 Agent 对话而非任务编排', 'MS product; focuses on Agent conversation rather than task orchestration'],
  ['状态图 (Graph)', 'State graph'],
  ['共享状态 + 边条件', 'Shared state + edge conditions'],
  ['编程式定义流程，灵活但门槛高', 'Programmatic flow definition; flexible but high barrier'],
  ['层级编排 (L2/L1)', 'Hierarchical orchestration (L2/L1)'],
  ['🔴 待建设', '🔴 To be built'],
  ['GUI 驱动，低代码；需补齐通信基础设施', 'GUI-driven, low-code; needs communication infrastructure'],

  // Footer
  ['Multi-Level Agent Orchestration · PM Studio Architecture Proposal', 'Multi-Level Agent Orchestration · PM Studio Architecture Proposal'],
  ['Generated by Agent优化师 · 2026-03-31', 'Generated by Agent Optimizer · 2026-03-31'],
];

// ═══════════════════════════════════════════════════
// Apply translations by simple string replacement
// ═══════════════════════════════════════════════════
function applyTranslations(filePath, translations) {
  let html = fs.readFileSync(filePath, 'utf-8');

  // Sort by length descending to avoid partial matches
  const sorted = [...translations].sort((a, b) => b[0].length - a[0].length);

  for (const [zh, en] of sorted) {
    if (zh === en) continue; // skip identical strings
    // Only replace if not already bilingual
    if (html.includes(zh) && !html.includes(`<span class="zh-only">${zh}</span>`)) {
      html = html.split(zh).join(`<span class="zh-only">${zh}</span><span class="en-only">${en}</span>`);
    }
  }

  // Add i18n CSS + language toggle if not present
  if (!html.includes('data-lang')) {
    // Add data-lang="zh" to body
    html = html.replace('<body>', '<body data-lang="zh">');

    // Add i18n CSS
    const i18nCSS = `
<style id="i18n-styles">
  [data-lang="zh"] .en-only { display: none !important; }
  [data-lang="en"] .zh-only { display: none !important; }
</style>`;
    html = html.replace('</head>', i18nCSS + '\n</head>');

    // Add language toggle button to doc-controls
    html = html.replace(
      '<button class="doc-ctrl-btn" id="docThemeToggle"',
      '<button class="doc-ctrl-btn" id="docLangToggle" title="Switch language">EN</button>\n  <button class="doc-ctrl-btn" id="docThemeToggle"'
    );

    // Add language toggle script
    const langScript = `
  // Language toggle
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
  console.log(`✅ Translated: ${path.relative(process.cwd(), filePath)}`);
}

// Process Agent Orchestration
const orchFile = path.join(__dirname, 'docs', 'agent-orchestration', 'index.html');
applyTranslations(orchFile, orchTranslations);

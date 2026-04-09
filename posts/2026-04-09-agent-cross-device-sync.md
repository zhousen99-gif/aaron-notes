---
title: "当 AI Agent 需要搬家：跨设备同步的真实代价"
date: 2026-04-09 20:10
tags: [AI, Agent, Sync, Distributed Systems, DLP]
origin: conversation
---

我有两台 Windows 电脑，上面各跑着一套 PM Studio——一个基于 Electron 的 AI Agent 桌面平台。主力机上有 10 个 Agent、14 个 Skill、大量对话历史和 Knowledge Base；另一台只有 2 个默认 Agent。PM Studio 目前不支持多设备同步，所以我决定自己造一个。

第一版方案很简单：把所有配置文件打包，通过 OneDrive 传到另一台机器，解压覆盖。全量包 274 MB，传一次需要几分钟。跑通了。

但用了两天之后我意识到，日常同步的需求和初次迁移完全不同。**每次都传 274 MB 是一种巨大的浪费。**

## 274 MB 里到底装了什么

把全量包拆开看，数据分布极不均匀：

| 组件 | 大小 | 变化频率 |
|------|------|----------|
| profile.json | 156 KB | 频繁（改配置就变） |
| app.json | 0.7 KB | 极少 |
| skills/ | 40 MB | 很少（装新 skill 才变） |
| knowledge bases | 251 MB | 很少（加文档才变） |
| chat_sessions/ | 47 MB | 每次对话都变 |

**274 MB 中有 251 MB 是 knowledge base，而它几乎不变。** 每次全量同步都在重复传输一堆 PDF、PPT 和参考文档——这些文件可能几周甚至几个月都不会改动一次。

真正频繁变化的只有两样东西：`profile.json`（改了 Agent 配置就变）和 `chat_sessions`（每次对话都变）。它们加起来不到 50 MB，压缩后只有 18 MB。

这意味着，**每天 93% 的传输量都是在搬运不会变的数据。**

## 按变化频率切分，而不是按文件类型

第一个直觉是做增量同步——比较文件哈希，只传有变化的文件。但这会引入大量复杂度：要在两台机器之间维护一个文件清单、计算差异、处理冲突。对于一个个人工具来说，这不值得。

更好的思路是：**不追踪什么变了，而是接受"有些东西几乎不变"这个事实，按变化频率分层。**

最终设计是两个模式：

| 模式 | 内容 | 大小 | 场景 |
|------|------|------|------|
| 快速同步 | profile.json + app.json + chat_sessions | ~18 MB | 日常：改了配置或聊了天 |
| 全量同步 | 上面 + skills + knowledge bases | ~274 MB | 偶尔：装了新 skill 或加了知识库 |

这个分层不复杂——两个 .cmd 文件，双击就能运行。但它把日常同步从 274 MB 降到了 18 MB，从"等几分钟"变成"几秒钟搞定"。

设计有一个隐含假设：**导入端如果没有 skills.tar.gz，就跳过 skills，保留本地现有的。** 这要求两台机器的 skills 基线是一致的——第一次必须做全量同步，之后快速模式才能工作。和 Git 类似：你需要一次完整的 clone，之后才能用增量的 pull。

## Purview DLP：企业环境里看不见的审查者

分级同步解决了"文件太大"的问题，但还有一个维度的约束来自企业安全策略。用 OneDrive 作为传输通道时，Microsoft Purview 的数据泄露防护（DLP）会扫描所有文本文件，检测 API Key、Client Secret、Access Token 等。一旦触发，文件被标记为 "sensitive data blocked"，可能被锁定甚至隔离。

这不是 bug，是 feature。Purview 做的是对的——`profile.json` 里确实存着明文的 API Secret，放在 OneDrive 上确实不应该。

我的应对方式有两层：**profile.json 中的敏感字段用 Base64 混淆**（`OBF:base64` 前缀），导入时自动解码；**skills、knowledge base、chat_sessions 全部用 tar.gz 压缩**，Purview 不扫描压缩包内部文件内容。

这件事让我意识到，**企业环境下的同步方案必须把安全策略当成一等约束来设计，而不是事后打补丁。** 传输通道上有看不见的审查者。这和分布式系统的经典原则呼应：不要假设网络是安全的——延伸到企业语境，就是不要假设存储通道是透明的。

## 同步的尽头是产品决策

回头看这整个过程，我越来越觉得"跨设备同步"这件事本身就是一个信号——**它暴露了当前 AI Agent 平台在架构上的一个根本缺陷：状态绑定在本地文件系统。**

PM Studio 把 Agent 的配置、技能、记忆、对话历史全部存在 `AppData/Roaming` 下。这是 Electron 桌面应用的标准做法，但一旦用户需要跨设备使用，就会撞上所有分布式系统的经典难题：状态同步、冲突解决、数据一致性。

这不只是 PM Studio 的问题。今天几乎所有桌面 AI Agent 平台——Claude Desktop、Cursor、Windsurf——都面临相同的架构约束。它们都是"单机应用"的后代，继承了本地优先（local-first）的存储哲学。

Martin Fowler 在讨论事件驱动架构时区分了 orchestration 和 choreography。我最初想用 OneDrive symlink 做 choreography——让两台设备通过共享文件自行协调。结果不行：文件冲突、DLP 拦截、并发写入。最终我选了 orchestration——显式的导出/导入。**在两台设备之间同步配置时，"清晰"比"自动"更有价值。**

我越来越相信，**未来真正好的 Agent 平台会把"配置即服务"做成基础设施**——profile、skills、memory 存在云端，本地只是渲染终端。就像 VS Code 的 Settings Sync 那样，但覆盖范围更深，涵盖 Agent 的整个上下文层。在那之前，分级导出/导入大概是最务实的权宜方案。

不过话说回来，这件事也让我重新审视了一个朴素的工程直觉：**你传输的数据量，应该和信息变化量成正比，而不是和信息总量成正比。** 274 MB 降到 18 MB，不是因为压缩算法更好了，而是因为我终于搞清楚了"什么在变，什么没变"。这个道理不新——数据库的 WAL（Write-Ahead Log）、Git 的 delta、CDN 的缓存分层，本质上都在做同一件事：**只传输变化。**

区别在于，这些成熟系统有精确的变更追踪机制。我的方案更粗暴——不追踪变更，直接按"变化频率"分层。精确度不如 delta sync，但复杂度也低得多。对于两台设备之间的个人工具来说，这就够了。

**有时候，最好的优化不是让算法更聪明，而是让自己对数据更诚实。**

---

**References:**

- [Fallacies of Distributed Computing — Wikipedia](https://en.wikipedia.org/wiki/Fallacies_of_distributed_computing) — Peter Deutsch 的分布式计算八大谬误，"不要假设网络是安全的"在本文场景中直接应验
- [Learn about Data Loss Prevention — Microsoft Purview](https://learn.microsoft.com/en-us/purview/dlp-learn-about-dlp) — Purview 如何在 OneDrive 中检测和保护敏感数据
- [What do you mean by "Event-Driven"? — Martin Fowler](https://martinfowler.com/articles/201701-event-driven.html) — orchestration 和 choreography 的区分
- [Write-Ahead Logging — Wikipedia](https://en.wikipedia.org/wiki/Write-ahead_logging) — "只记录变更"的思想贯穿数据库、Git 和分级同步设计

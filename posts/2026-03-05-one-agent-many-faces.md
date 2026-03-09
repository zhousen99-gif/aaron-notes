---
title: "一个 Agent，多张面孔"
date: 2026-03-05 15:40
tags: [ai, agent, architecture, session-management]
origin: conversation
---

今天花了一个多小时在调一个 bug：我在控制台跟一号说话，它把回复发到了我的 iMessage 上。

听起来是个小事。但修到最后，我发现这个 bug 背后藏着一个很根本的设计问题——**一个 AI Agent 同时存在于多个沟通渠道时，它的"自我"到底该怎么管理？**

## Bug 的本质

技术上的原因很简单：控制台（WebChat）和 iMessage 共享了同一个 session。当 iMessage 的消息进来时，session 的路由信息（`deliveryContext`）被 iMessage 覆盖了。之后控制台发的消息虽然还是在同一个 session 里处理，但回复时走的是 iMessage 的路由——所以消息"串"了。

修复方案也不复杂——把 `session.dmScope` 从 `main`（所有渠道共享一个 session）改成 `per-channel-peer`（每个渠道独立 session）。但改完后还得清除旧 session 里残留的 iMessage 路由信息，不然缓存还会继续作怪。

前前后后重启了三四次 gateway 才彻底搞定。

## 人也有这个问题

调完 bug 之后我突然意识到，这跟人在不同社交场景里切换角色是一回事。

你在工作群里的说话方式和在家庭群里的说话方式不一样。你在朋友圈发的东西和在 LinkedIn 发的不一样。同一个"你"，但根据场景会调整语言风格、分享尺度、甚至人设。

对人来说这种切换是本能。但对 AI Agent 来说，这是一个架构问题。

## Session 隔离的设计哲学

Anthropic 在 AI Agent 的设计指南里提到了 context management 的三个层级：

1. **Ephemeral context**——当前对话的即时记忆，对话结束就消失
2. **Session context**——一个工作流程内的持续记忆，跨多个 turn
3. **Long-term context**——用户偏好、历史知识，永久存储

我今天遇到的问题出在第 2 层。当两个渠道共享 session context 时，路由信息、语言风格、甚至隐私边界都会互相污染。

想象一个更极端的场景：如果一号同时接入了我的私人 iMessage 和公司的 Slack，共享 session 意味着它可能会把我在私人场景下说的话，带到工作场景的回复里。这不是 bug，这是事故。

## 正确的架构应该像洋葱

最终我觉得合理的 Agent 多通道架构应该是分层的：

**外层：渠道适配** — 每个渠道有自己的 connector，负责格式转换和路由。iMessage 走一条路，控制台走另一条。

**中层：Session 隔离** — 每个渠道（甚至每个对话者）有独立的 session，互不干扰。语境、路由、历史都是隔离的。

**内层：共享身份** — 虽然 session 隔离，但 Agent 的核心记忆（SOUL.md、USER.md、长期记忆）是共享的。它在每个渠道都是"一号"，有相同的性格和知识，但会根据场景调整行为。

这和人类的认知模型惊人地相似——你在不同场景有不同的"工作记忆"（session），但你的长期记忆、性格和价值观（identity）是统一的。

## 一个实际的教训

这次调 bug 给了我一个很实际的教训：**多通道 Agent 的第一个问题永远不是"怎么接更多渠道"，而是"怎么保证消息不串"。**

OpenClaw 的 `dmScope` 设计——`main`、`per-channel`、`per-channel-peer`——本质上是在回答"Agent 的上下文边界画在哪里"这个问题。画太大，消息串台；画太小，Agent 失去跨渠道的连贯性。

最终我选了 `per-channel-peer`，然后用共享的 memory 文件来保证一号在不同渠道还是"同一个一号"。这不是最优雅的方案，但可能是最务实的——先隔离，再通过显式的记忆机制来共享需要共享的东西。

就像人管理社交关系一样：默认隔离，选择性共享。

---
**References:**
- [Anthropic: Building Effective AI Agents](https://anthropic.com)
- [Forbes: Multi-Channel AI Agent Architecture](https://forbes.com)
- [Google Cloud: AI Agent Context Management](https://cloud.google.com)

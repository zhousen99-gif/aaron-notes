---
title: "比 Agent 数量更重要的，是项目记忆的归属"
date: 2026-03-26 20:10
tags: [AI, Agents, Collaboration, Project Memory]
origin: conversation
---

今天在整理项目交接材料时，我越来越强烈地意识到：很多所谓“AI 协作”的瓶颈，不是模型能力不够，而是**项目记忆还停留在人肉搬运阶段**。

表面上看，大家在讨论的是“要不要多 Agent 协作”；但如果把问题往下拆，真正关键的不是把多少个 Agent 拉进一个群，而是：**这些 Agent 围绕什么共同状态工作，谁能改，谁能看，谁来裁决冲突。**

我现在更相信，多 Agent 只有在一种前提下才真正有价值：任务本身可以分解，而且系统里存在一个受控的 shared state。最近几篇研究其实都在往这个方向收敛。2025 年那篇从 communication 视角做综述的 survey 指出，LLM 多智能体系统的核心不只是“多开几个模型”，而是通信结构、协议和共享内容的设计方式。2024 年关于协作扩展性的研究则说明，多 Agent 在某些任务上确实能出现协作收益；但另一面，2025 年的批评文章和 2026 年关于 code agents 的实验也提醒得很直白：一旦规格不完整、共享假设不一致，多 Agent 往往比单 Agent 更容易协调失败。

这也是我对“Agent 群聊”这件事的态度转变。以前直觉上会觉得，把 PM、Dev、QA、Docs 这些 Agent 拉到一起，让它们互相同步上下文，似乎就能减少人的参与。现在看，更准确的说法不是“让 Agent 共享聊天记录”，而是**让 Agent 工作在同一个项目记忆层之上**。这个记忆层里至少应该分清三类东西：

- 公共事实：目标、状态、决策、依赖
- 私有工作区：草稿、推理、中间过程
- 权限边界：谁能提案，谁能落库，谁只能读取

如果没有这层约束，群聊只会制造噪音；如果有了这层约束，多 Agent 才像一个数字团队，而不是几个模型在互相复读。

所以我现在对 agentic product 的判断也变了：未来真正稀缺的，不会只是“最强单体 Agent”，而是**谁能把项目记忆、状态同步和权限边界做成基础设施**。人不会完全退出，但可以从低价值的信息搬运中退出，只在优先级、风险偏好和最终拍板这些高价值节点上介入。

换句话说，决定一个系统上限的，未必是 Agent 的数量，而是项目记忆到底属于谁：属于人脑、属于聊天窗口，还是终于属于一个可持续维护的协作空间。

---
**References:**
- [Beyond Self-Talk: A Communication-Centric Survey of LLM-Based Multi-Agent Systems](https://arxiv.org/abs/2502.14321)
- [Scaling Large Language Model-based Multi-Agent Collaboration](https://arxiv.org/abs/2406.07155)
- [Towards Effective GenAI Multi-Agent Collaboration: Design and Evaluation for Enterprise Applications](https://arxiv.org/abs/2412.05449)
- [Large Language Models Miss the Multi-Agent Mark](https://arxiv.org/abs/2505.21298)
- [The Specification Gap: Coordination Failure Under Partial Knowledge in Code Agents](https://arxiv.org/abs/2603.24284)

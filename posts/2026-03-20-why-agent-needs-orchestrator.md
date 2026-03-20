---
title: "为什么 Agent 绕不开 Orchestrator"
date: 2026-03-20 20:04
tags: [AI, Agents, Architecture, Orchestrator]
origin: conversation
---

今天在聊 agent 架构时，我发现一个词很容易被说得玄：**orchestrator**。很多人会把它理解成“高级 prompt 包装器”，或者“另一个更聪明的模型层”。但我越来越觉得，这个词真正有价值的地方，不在于它有多聪明，而在于它承担了**把复杂系统跑顺**的责任。

我现在更愿意把 orchestrator 理解成：**agent 的总控层**。它关心的不是某一步答案写得漂不漂亮，而是整个过程怎么推进：什么时候该调模型，什么时候该调工具，什么时候等用户，什么时候重试，什么时候收尾。没有这层控制，LLM 更像一个会输出 token 的专家函数；有了这层控制，它才开始像一个能稳定干活的系统。

这个概念其实并不是 AI 时代的新发明。早在企业软件和 Web Services 时代，OASIS 推动的 WS-BPEL 就已经在讨论“如何描述业务流程活动，以及它们如何连接起来完成任务”；2000 年代的软件工程语境里，orchestration 本来就是一个成熟词汇，不是这两年 agent 圈临时借来的包装词。后来到了 Kubernetes 时代，这个词进一步大众化：容器编排的核心不是某个容器能不能运行，而是**整个集群能不能持续处于期望状态**。Kubernetes 官方文档里那套 service discovery、rollout、self-healing、bin packing，本质上都是“编排”在分布式系统里的落地。

这也解释了为什么 orchestrator 总会和一堆相似词缠在一起。它和 scheduler 有关系，但 scheduler 主要回答“什么时候、谁先谁后”；它和 router 有关系，但 router 主要回答“发给谁”；它和 workflow engine 有关系，但 workflow engine 更偏“既定流程怎么执行”；它和 controller 也有关系，但 controller 更强调让系统向目标状态收敛。**orchestrator 比这些词都大一圈**：它像一个把调度、路由、状态推进、异常恢复拼起来的总框架。

在分布式系统里，orchestration 和 choreography 的区别尤其值得记住。Martin Fowler 总结过，事件驱动系统的好处是解耦，但一旦跨系统的逻辑流变得隐形，调试和修改都会很痛苦。microservices.io 在讲 saga 时也把这两类机制区分得很清楚：**choreography** 是参与者通过事件彼此响应，没有单一总控；**orchestration** 则有一个中心 orchestrator，显式地告诉每个参与者下一步做什么。前者灵活，后者清晰。系统越复杂，我越倾向于认为“清晰”本身就是一种能力。

这也是为什么今天的 agent 系统几乎都会长出一个 orchestrator。不管你叫它 runtime、planner-executor loop、workflow layer 还是 tool coordinator，本质上都在解决同一个问题：**如何把上下文、模型、工具、记忆和副作用组织成一个可以持续运行的过程**。如果没有它，agent 看起来像在“思考”；有了它，agent 才真正开始“工作”。

所以我现在会把 orchestrator 看成 agent 时代一个很基础、也很容易被低估的概念：它不是用来制造聪明感的，它是用来消化复杂性的。真正成熟的 agent，不会只拼模型能力，而会越来越重视编排层的设计。未来谁能把这层做得更稳定、更可观察、更容易调试，谁的 agent 才更像产品，而不是 demo。

---
**References:**
- [Overview | Kubernetes](https://kubernetes.io/docs/concepts/overview/)
- [OASIS Web Services Business Process Execution Language (WSBPEL) TC](https://www.oasis-open.org/committees/tc_home.php?wg_abbrev=wsbpel)
- [What do you mean by “Event-Driven”? | Martin Fowler](https://martinfowler.com/articles/201701-event-driven.html)
- [Managing data consistency in a microservice architecture using Sagas - Implementing a choreography-based saga](https://microservices.io/post/sagas/2019/08/15/developing-sagas-part-3.html)
- [Managing data consistency in a microservice architecture using Sagas - Implementing an orchestration-based saga](https://microservices.io/post/sagas/2019/12/12/developing-sagas-part-4.html)

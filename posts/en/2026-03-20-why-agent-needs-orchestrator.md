---
title: "Why Agents Can't Escape the Orchestrator"
date: 2026-03-20 20:04
tags: [AI, Agents, Architecture, Orchestrator]
origin: conversation
---

Today, while discussing agent architecture, I noticed that the word **orchestrator** is easily made to sound mystical. Many people interpret it as "an advanced prompt wrapper" or "another smarter model layer." But I increasingly feel that the real value of this word lies not in how smart it is, but in the fact that it takes on the responsibility of **making a complex system run smoothly**.

I now prefer to think of an orchestrator as: **the control plane of an agent**. It doesn't care about whether any single step produces an elegant answer — it cares about how the entire process moves forward: when to call the model, when to call a tool, when to wait for the user, when to retry, and when to wrap up. Without this layer of control, an LLM is more like an expert function that outputs tokens; with it, the LLM begins to feel like a system that can work reliably.

This concept isn't actually a new invention of the AI era. Back in the enterprise software and Web Services era, OASIS's WS-BPEL was already discussing "how to describe business process activities and how they connect to complete tasks"; in the software engineering context of the 2000s, orchestration was already a mature term — not something the agent community borrowed recently for packaging. Later, in the Kubernetes era, the word became further popularized: the core of container orchestration isn't whether any single container can run, but whether **the entire cluster can continuously remain in the desired state**. The Kubernetes documentation's concepts of service discovery, rollout, self-healing, and bin packing are all manifestations of "orchestration" in distributed systems.

This also explains why orchestrator constantly gets tangled with similar terms. It's related to scheduler, but scheduler mainly answers "when and in what order"; it's related to router, but router mainly answers "send to whom"; it's related to workflow engine, but workflow engine leans more toward "how to execute a predefined process"; it's related to controller too, but controller emphasizes converging the system toward a target state. **Orchestrator is one circle bigger than all these terms**: it's like a master framework that pieces together scheduling, routing, state progression, and exception recovery.

In distributed systems, the distinction between orchestration and choreography is especially worth remembering. Martin Fowler summarized that the advantage of event-driven systems is decoupling, but once cross-system logic flows become invisible, debugging and modification become painful. Microservices.io, when discussing sagas, also distinguishes these two mechanisms clearly: **choreography** means participants respond to each other through events with no single controller; **orchestration** has a central orchestrator that explicitly tells each participant what to do next. The former is flexible; the latter is clear. The more complex the system, the more I tend to believe that "clarity" is itself a capability.

This is also why today's agent systems almost inevitably grow an orchestrator. Whether you call it runtime, planner-executor loop, workflow layer, or tool coordinator, they're all fundamentally solving the same problem: **how to organize context, models, tools, memory, and side effects into a process that can run continuously.** Without it, agents look like they're "thinking"; with it, agents actually start "working."

So I now view orchestrator as a very fundamental — and very easily underestimated — concept of the agent era: it's not there to create a sense of cleverness; it's there to digest complexity. Truly mature agents won't just compete on model capability — they'll increasingly value orchestration layer design. Whoever can make this layer more stable, more observable, and easier to debug will have agents that feel more like products rather than demos.

---
**References:**
- [Overview | Kubernetes](https://kubernetes.io/docs/concepts/overview/)
- [OASIS Web Services Business Process Execution Language (WSBPEL) TC](https://www.oasis-open.org/committees/tc_home.php?wg_abbrev=wsbpel)
- [What do you mean by "Event-Driven"? | Martin Fowler](https://martinfowler.com/articles/201701-event-driven.html)
- [Managing data consistency in a microservice architecture using Sagas - Choreography](https://microservices.io/post/sagas/2019/08/15/developing-sagas-part-3.html)
- [Managing data consistency in a microservice architecture using Sagas - Orchestration](https://microservices.io/post/sagas/2019/12/12/developing-sagas-part-4.html)

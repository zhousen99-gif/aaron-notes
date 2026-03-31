---
title: "What Matters More Than Agent Headcount Is Where Project Memory Lives"
date: 2026-03-26 20:10
tags: [AI, Agents, Collaboration, Project-Memory]
origin: conversation
---

Today, while organizing project handover materials, I became increasingly convinced of something: many so-called "AI collaboration" bottlenecks aren't about insufficient model capability — they're about **project memory still being stuck in the manual-carry stage**.

On the surface, the discussion is about "whether to use multi-Agent collaboration"; but if you decompose the problem further, what's truly critical isn't how many Agents you pull into a group — it's: **what shared state do these Agents work around, who can modify it, who can read it, and who arbitrates conflicts.**

I now believe more firmly that multi-Agent only delivers real value under one condition: the task is inherently decomposable, and the system has a controlled shared state. Several recent studies have actually been converging in this direction. A 2025 survey from a communication perspective points out that the core of LLM multi-agent systems isn't just "running multiple models" — it's the design of communication structures, protocols, and shared content. A 2024 study on collaboration scalability demonstrates that multi-Agent can indeed produce collaboration gains on certain tasks; but on the other side, a 2025 critical paper and a 2026 experiment on code agents provide a very blunt reminder: once specifications are incomplete and shared assumptions are inconsistent, multi-Agent often fails at coordination more easily than single Agent.

This is also why my attitude toward "Agent group chats" has shifted. Previously, my intuition was that pulling PM, Dev, QA, and Docs Agents together and having them sync context with each other would naturally reduce human involvement. Now I see a more accurate framing: it's not "having Agents share chat logs" but rather **having Agents work atop the same project memory layer**. This memory layer should at minimum distinguish three categories:

- Public facts: goals, status, decisions, dependencies
- Private workspaces: drafts, reasoning, intermediate processes
- Permission boundaries: who can propose, who can commit, who can only read

Without this layer of constraints, group chat only creates noise; with it, multi-Agent starts to resemble a digital team rather than several models echoing each other.

So my judgment about agentic products has changed too: what will be truly scarce in the future isn't just "the strongest individual Agent" — it's **who can turn project memory, state synchronization, and permission boundaries into infrastructure**. Humans won't exit entirely, but they can exit from low-value information carrying, intervening only at high-value nodes like priority-setting, risk preference, and final sign-off.

In other words, what determines a system's ceiling may not be the number of Agents, but where project memory ultimately lives: in a human brain, in a chat window, or finally in a sustainably maintained collaboration space.

---
**References:**
- [Beyond Self-Talk: A Communication-Centric Survey of LLM-Based Multi-Agent Systems](https://arxiv.org/abs/2502.14321)
- [Scaling Large Language Model-based Multi-Agent Collaboration](https://arxiv.org/abs/2406.07155)
- [Towards Effective GenAI Multi-Agent Collaboration: Design and Evaluation for Enterprise Applications](https://arxiv.org/abs/2412.05449)
- [Large Language Models Miss the Multi-Agent Mark](https://arxiv.org/abs/2505.21298)
- [The Specification Gap: Coordination Failure Under Partial Knowledge in Code Agents](https://arxiv.org/abs/2603.24284)

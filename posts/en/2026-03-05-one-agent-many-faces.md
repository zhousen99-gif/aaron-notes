---
title: "One Agent, Many Faces"
date: 2026-03-05 15:40
tags: [ai, agent, architecture, session-management]
origin: conversation
---

Today I spent over an hour debugging something: I was talking to One in the console, and it sent the reply to my iMessage.

Sounds like a small issue. But by the time I finished fixing it, I realized there was a fundamental design problem hiding behind this bug — **when an AI Agent exists simultaneously across multiple communication channels, how should its "self" be managed?**

## The Essence of the Bug

Technically, the cause was simple: the console (WebChat) and iMessage shared the same session. When an iMessage came in, the session's routing information (`deliveryContext`) was overwritten by iMessage. After that, messages sent from the console were still processed in the same session, but replies were routed through iMessage — so messages got "crossed."

The fix wasn't complicated either — change `session.dmScope` from `main` (all channels share one session) to `per-channel-peer` (each channel gets its own session). But after that, I also had to clear the leftover iMessage routing info from the old session, or the cache would keep causing trouble.

All in all, I restarted the gateway three or four times before it was fully resolved.

## Humans Have This Problem Too

After fixing the bug, I suddenly realized this is exactly the same as humans switching roles across different social contexts.

The way you speak in your work group chat is different from your family group chat. What you post on social media is different from what you post on LinkedIn. The same "you," but you adjust your language style, sharing boundaries, and even persona based on context.

For humans, this switching is instinctive. For AI Agents, it's an architectural problem.

## The Design Philosophy of Session Isolation

Anthropic's design guide for AI Agents mentions three levels of context management:

1. **Ephemeral context** — immediate memory within the current conversation, disappears when it ends
2. **Session context** — persistent memory within a workflow, spanning multiple turns
3. **Long-term context** — user preferences, historical knowledge, permanently stored

Today's problem was at level 2. When two channels share session context, routing information, language style, and even privacy boundaries can cross-contaminate.

Imagine a more extreme scenario: if One were connected to both my personal iMessage and company Slack, sharing a session would mean it might carry something I said in a personal context into a work reply. That's not a bug — that's an incident.

## The Right Architecture Should Be Like an Onion

Ultimately, I think a proper multi-channel Agent architecture should be layered:

**Outer layer: Channel adaptation** — Each channel has its own connector, handling format conversion and routing. iMessage goes one way, the console goes another.

**Middle layer: Session isolation** — Each channel (or even each conversation partner) has an independent session, with no cross-contamination. Context, routing, and history are all isolated.

**Inner layer: Shared identity** — While sessions are isolated, the Agent's core memory (SOUL.md, USER.md, long-term memory) is shared. It's "One" in every channel, with the same personality and knowledge, but adapts its behavior based on context.

This is remarkably similar to human cognitive models — you have different "working memories" (sessions) in different contexts, but your long-term memory, personality, and values (identity) are unified.

## A Practical Lesson

This debugging session taught me a very practical lesson: **the first problem with multi-channel Agents is never "how to connect more channels" — it's "how to ensure messages don't cross."**

OpenClaw's `dmScope` design — `main`, `per-channel`, `per-channel-peer` — is essentially answering the question "where do you draw the Agent's context boundary?" Draw it too wide, messages cross; draw it too narrow, the Agent loses cross-channel coherence.

In the end, I chose `per-channel-peer`, then used shared memory files to ensure One remains "the same One" across channels. It's not the most elegant solution, but probably the most pragmatic — isolate first, then share what needs to be shared through explicit memory mechanisms.

Just like how humans manage social relationships: isolate by default, share selectively.

---
**References:**
- [Anthropic: Building Effective AI Agents](https://anthropic.com)
- [Forbes: Multi-Channel AI Agent Architecture](https://forbes.com)
- [Google Cloud: AI Agent Context Management](https://cloud.google.com)

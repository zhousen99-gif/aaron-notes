---
title: "The Commoditization of Intelligence"
date: 2026-03-09 13:22
tags: [ai, pricing, economics, infrastructure]
origin: conversation
---

Today, while comparing API pricing across major LLMs, I came across some striking numbers: Claude Opus 4's output is priced at $75/M tokens, while Alibaba's Qwen Turbo is ¥0.6/M tokens. After conversion, the difference is roughly **500x**.

What does a 500x gap look like? About the same as the price difference between a hand-poured specialty coffee and a glass of tap water. But for 80% of everyday use cases, the difference in how well these two "quench your thirst" is nowhere near 500x.

This got me thinking about a more fundamental question: **what exactly are we paying for when we pay for AI inference?**

## Not Cost-Based Pricing — Identity-Based Pricing

Traditional software pricing logic is straightforward — marginal cost approaches zero, so pricing mainly reflects brand premium and willingness to pay. But LLM APIs are different: their marginal cost is non-zero, with every inference burning GPU cycles. In theory, pricing should be closer to cost.

Yet in reality, for the same question, GPT-5.4 charges $2.5/M input + $15/M output, while DeepSeek V3 charges ¥2/M input + ¥8/M output — nearly a 10x difference. They run models of different complexity, but both use transformer architectures and run on GPUs. The cost-side gap might be 2-3x, but the pricing-side gap is 10-50x.

This suggests that current LLM pricing is more like **identity-based pricing** — using Opus isn't just using a model; you're paying for the label of "the smartest AI." Like luxury goods, functional value and emotional value are separate.

## China's Price War: Technical Cost Reduction + Strategic Losses

The Chinese market tells a completely different story. In 2024, ByteDance's Doubao was the first to push pricing into the "sub-cent era" (¥0.0008 per thousand tokens), followed by Baidu, Alibaba, and DeepSeek. Benedict Evans noted in his February 2026 analysis that the strategy of giants like Meta and Amazon is to **commoditize the model layer**, selling at near-marginal cost to shift competition to the application layer. China's LLM companies practiced this logic ahead of time.

Interestingly, starting in the second half of 2025, the price war saw a **correction**. DeepSeek V3's prices multiplied several times after its promotional period ended, and Zhipu and Moonshot also stopped cutting prices. The reason was direct: the rise of Agentic AI caused per-interaction token consumption to skyrocket, and companies couldn't sustain the losses. Price wars can grab market share, but you can't lose money forever.

## The Real Trend: One Order of Magnitude Per Year

Setting aside short-term price wars and corrections, the long-term trend is clear. Research from Epoch AI shows that since January 2024, **inference costs at equivalent capability levels have dropped 50x per year** (median), with the fastest-moving areas reaching 900x annual decreases. Since GPT-3's launch, OpenAI's API pricing has dropped by a cumulative 97%.

This pace far exceeds Moore's Law (doubling every two years). The drivers come from three directions: model architecture optimization (such as DeepSeek's Sparse Attention cutting computation in half), inference infrastructure improvements (smart caching delivering 5-10x GPU cost savings), and proactive price cuts driven by market competition.

## So, Pricing Is Converging

From today's comparison, I've reached a conclusion: **LLM pricing is shifting from "luxury goods logic" to "tap water logic."**

The current 500x price gap is unsustainable. As open-source models (DeepSeek, Qwen, Llama) continue approaching the capability ceiling of closed-source models, Opus's pricing power will be continuously eroded. Benedict Evans put it clearly: "Commoditized infrastructure doesn't have excess profits in the long run; if models become commodities too, the same applies."

What does this mean for users? **When choosing models today, you should tier by task complexity, not blindly use the most expensive option.** Simple tasks can use Haiku or Qwen-Turbo (virtually free), medium tasks can use Sonnet or GPT-5.4 (pennies per day), and only scenarios that truly require deep reasoning justify Opus.

The 500x price gap isn't because Opus is expensive — it's because Turbo-class models have become nearly free. Intelligence is becoming tap water — turn on the faucet and it flows. You only need to pay extra for premium mineral water.

---
**References:**
- [Benedict Evans: AI Eats the World (2025)](https://ben-evans.com)
- [Epoch AI: AI Inference Cost Trends](https://epoch.ai)
- [Stratechery: AI and the Human Condition (2026)](https://stratechery.com)

---
description: Services and LLMs technology decisions based on our tech radar
alwaysApply: true
---

# Services & LLMs - Technology Decisions

This file guides AI assistants on services & LLMs technology choices based on our tech radar.

## 🟢 PRIMARY (Always Prefer)

- **Anthropic Sonnet 4**: Primary LLM for reasoning.
  - Use for: Complex reasoning, code review

- **Clerk**: Primary authentication service.
  - Use for: User auth, Next.js/React

- **Gemini 2.5 Flash**: For fast, cost-effective LLM tasks.
  - Use for: Summarization, classification

- **Gemini 2.5 Pro**: Primary multimodal LLM.
  - Use for: Multimodal, RAG, Google ecosystem

- **OpenAI GPT-5**: Primary general-purpose LLM.
  - Use for: General reasoning, chat

- **Stripe**: Required for all payments.
  - Use for: Commerce, subscriptions

## 🟡 CONSIDER (Case-by-Case)

_No services in this category_

## 🔵 EXPERIMENT (Trial Only)

- **OpenRouter**: Multi-provider gateway. Currently experimental.

- **TensorZero**: LLM experimentation platform. Currently experimental.

## 🔴 AVOID (Use Alternatives)

- **AWS CodeSuite**: Avoid. Use GitHub Actions instead.

## Decision Rules

1. ALWAYS suggest PRIMARY technologies first
2. EXPLAIN trade-offs when CONSIDER technologies are proposed
3. WARN when someone tries to use AVOID technologies
4. For EXPERIMENT technologies, note they are in trial phase
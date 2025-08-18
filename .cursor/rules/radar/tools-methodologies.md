---
description: Tools and methodologies technology decisions based on our tech radar
alwaysApply: true
---

# Tools & Methodologies - Technology Decisions

This file guides AI assistants on tools & methodologies technology choices based on our tech radar.

## 🟢 PRIMARY (Always Prefer)

- **Agile (Scrum/Kanban)**: Required delivery framework.
  - Use for: All teams

- **Claude Code**: Primary AI coding assistant.
  - Use for: Coding, debugging, reviews

- **Confluence**: Required documentation platform.
  - Use for: Docs, runbooks, specs

- **Cursor IDE**: Primary development IDE.
  - Use for: All development work

- **DevOps Methodology**: Required engineering culture.
  - Use for: All teams

- **ESLint + Prettier**: Required for TypeScript/JavaScript.
  - Use for: All TS/JS projects

- **GitHub**: Required version control platform.
  - Use for: All repositories

- **GitHub Actions**: Required CI/CD platform.
  - Use for: All pipelines

- **Jira**: Required project tracking.
  - Use for: All projects

- **Playwright**: Primary E2E testing framework.
  - Use for: Web UI tests

- **Trunk-based Development**: Required branching strategy.
  - Use for: All repos

## 🟡 CONSIDER (Case-by-Case)

- **Product Monorepo**: One repo per product only.
  - When: Multiple apps, shared libraries

- **Sentry**: For error monitoring.
  - When: Production error tracking

## 🔵 EXPERIMENT (Trial Only)

_No tools in this category_

## 🔴 AVOID (Use Alternatives)

- **GitFlow**: Avoid. Use trunk-based development instead.

## Decision Rules

1. ALWAYS suggest PRIMARY technologies first
2. EXPLAIN trade-offs when CONSIDER technologies are proposed
3. WARN when someone tries to use AVOID technologies
4. For EXPERIMENT technologies, note they are in trial phase
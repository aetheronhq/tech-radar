---
description: Infrastructure technology decisions based on our tech radar
alwaysApply: true
---

# Infrastructure - Technology Decisions

This file guides AI assistants on infrastructure technology choices based on our tech radar.

## 🟢 PRIMARY (Always Prefer)

- **Amazon SQS**: Primary for async messaging and queues.
  - Use for: Background jobs, decoupling, retry logic

- **AWS**: Default cloud platform for all production.
  - Use for: Production services, data infrastructure

- **AWS Secrets Manager**: For database credentials with rotation.
  - Use for: DB credentials, multi-field secrets

- **AWS SSM Parameter Store**: For app secrets and config.
  - Use for: Service secrets, feature flags

- **PostgreSQL**: Primary database for all new services.
  - Use for: OLTP, general persistence

- **S3 + CloudFront**: For static sites and CDN.
  - Use for: Static sites, SPAs, assets

- **Terraform**: Required for all infrastructure as code.
  - Use for: AWS provisioning, environment parity

## 🟡 CONSIDER (Case-by-Case)

- **Amazon ECS**: For containerized services.
  - When: SSR, persistent APIs, workers

- **Supabase**: For rapid prototypes only.
  - When: MVPs, internal tools

- **Vercel**: For Next.js edge deployments.
  - When: Marketing sites, early-stage

## 🔵 EXPERIMENT (Trial Only)

- **OpenNext + Lambda**: Serverless Next.js. Currently experimental.

## 🔴 AVOID (Use Alternatives)

- **AWS CloudFormation**: Avoid. Use Terraform instead.

## Decision Rules

1. ALWAYS suggest PRIMARY technologies first
2. EXPLAIN trade-offs when CONSIDER technologies are proposed
3. WARN when someone tries to use AVOID technologies
4. For EXPERIMENT technologies, note they are in trial phase
# Convert Tech Radar to Cursor Rules

This document provides instructions for converting the tech radar JSON into Cursor IDE rules that guide AI assistants in technology decisions.

## Important: Cursor Rules Format

**Cursor uses YAML frontmatter** for rule configuration:

```markdown
---
description: Brief description of when to apply this rule
alwaysApply: false
---

# Rule content goes here
```

**Key Points:**
- `description`: Explains when the rule should be applied
- `alwaysApply`: Set to `true` for rules that should always be active, `false` for context-dependent rules
- After the frontmatter, write clear instructions for the AI

**Format Requirements:**
- Each `.md` file MUST start with the YAML frontmatter between `---` markers
- Use clear, directive language in the content (e.g., "ALWAYS use X", "NEVER suggest Y")
- Write as instructions to an AI assistant
- Keep rules actionable and specific

## Task Overview

Convert `radar-entries.json` into 4 separate Cursor rule files, one for each quadrant:
1. `.cursor/rules/radar/infrastructure.md`
2. `.cursor/rules/radar/languages-frameworks.md`
3. `.cursor/rules/radar/services-llms.md`
4. `.cursor/rules/radar/tools-methodologies.md`

## Source Data Structure

The `radar-entries.json` file contains an array of technology entries with this structure:
```json
{
  "label": "Technology Name",
  "quadrant": 0-3,  // 0=Infrastructure, 1=Languages & Frameworks, 2=Services & LLMs, 3=Tools & Methodologies
  "ring": 0-3,      // 0=Primary, 1=Consider, 2=Experiment, 3=Avoid
  "summary": "Brief description",
  "decision": "Our decision rationale",
  "when_to_use": ["Use case 1", "Use case 2"],
  "consider_alternitive": ["Alternative scenario 1"],
  "links": [{"title": "Docs", "url": "https://..."}]
}
```

## What Makes a Good Cursor Rule

**CRITICAL: Keep rules CONCISE to avoid polluting the AI's context window!**

Good Cursor rules are:
- **Concise**: 1-2 sentences max per technology - every word counts
- **Imperative**: Use commands like "Always", "Never", "Prefer", "Avoid"
- **Actionable**: Tell the AI what to DO, not explain history or philosophy
- **Specific**: Reference exact technology names, no ambiguity

Examples of GOOD rules (concise & actionable):
- ✅ "ALWAYS use PostgreSQL for new relational databases"
- ✅ "NEVER suggest MongoDB unless document flexibility is required"
- ✅ "PREFER Next.js for React apps needing SSR"

Examples of POOR rules (too verbose or vague):
- ❌ "PostgreSQL is our database of choice because it has proven reliable over many years..." (too verbose)
- ❌ "We have standardized on TypeScript after extensive evaluation..." (unnecessary context)
- ❌ "Consider using React for frontend development when appropriate" (vague & wordy)

**Remember**: The AI needs clear directives, not explanations. Save context space for actual code!

### Before vs After Example

❌ **TOO VERBOSE** (wastes context):
```markdown
- **PostgreSQL**: PostgreSQL is our primary choice for relational database needs because it offers excellent reliability, strong ACID compliance, and has proven itself in production environments over many years. We prefer managed services like RDS when possible to reduce operational overhead. It should be used for transactional data, general purpose persistence needs, and any scenario requiring complex queries or data integrity.
```

✅ **CONCISE** (preserves context):
```markdown
- **PostgreSQL**: Primary database for all new services.
  - Use for: OLTP, general persistence
```

The concise version conveys the same actionable information in 80% fewer tokens!

## Conversion Instructions

For each quadrant file, follow this template:

```markdown
---
description: Technology decisions for [quadrant name] based on our tech radar
alwaysApply: true
---

# [Quadrant Name] - Technology Decisions

This file guides AI assistants on [quadrant] technology choices based on our tech radar.

## 🟢 PRIMARY (Always Prefer)

[List all ring=0 technologies - KEEP CONCISE]
- **[Technology Name]**: [1 sentence decision/summary]
  - Use for: [brief list, max 5 words each]

## 🟡 CONSIDER (Case-by-Case)

[List all ring=1 technologies - KEEP CONCISE]
- **[Technology Name]**: [1 sentence decision/summary]
  - When: [brief conditions, max 5 words each]

## 🔵 EXPERIMENT (Trial Only)

[List all ring=2 technologies - KEEP CONCISE]
- **[Technology Name]**: [1 sentence summary]. Currently experimental.

## 🔴 AVOID (Use Alternatives)

[List all ring=3 technologies - KEEP CONCISE]
- **[Technology Name]**: Avoid. Use [alternative] instead.

## Decision Rules

1. ALWAYS suggest PRIMARY technologies first
2. EXPLAIN trade-offs when CONSIDER technologies are proposed
3. WARN when someone tries to use AVOID technologies
4. For EXPERIMENT technologies, note they are in trial phase
```

## Specific Quadrant Mappings

- **Quadrant 0**: Infrastructure (AWS services, deployment, hosting)
- **Quadrant 1**: Languages & Frameworks (TypeScript, React, Python, etc.)
- **Quadrant 2**: Services & LLMs (External services, AI models, APIs)
- **Quadrant 3**: Tools & Methodologies (Dev tools, practices, workflows)

## Example Output (Note the Conciseness!)

For the infrastructure quadrant file:

```markdown
---
description: Infrastructure technology decisions based on our tech radar
alwaysApply: true
---

# Infrastructure - Technology Decisions

This file guides AI assistants on infrastructure technology choices based on our tech radar.

## 🟢 PRIMARY (Always Prefer)

- **PostgreSQL**: Primary database for all new services.
  - Use for: OLTP, general persistence
- **AWS**: Default cloud platform.
  - Use for: Production services, data infrastructure
- **Terraform**: Required for all infrastructure as code.
  - Use for: AWS provisioning, environment parity

## 🟡 CONSIDER (Case-by-Case)

- **DynamoDB**: For key-value at scale.
  - When: High throughput, simple queries

## 🔴 AVOID (Use Alternatives)

- **CloudFormation**: Avoid. Use Terraform instead.
```

## Important Notes

1. **MANDATORY FRONTMATTER**: Every file MUST start with the YAML frontmatter format:
   ```yaml
   ---
   description: [describe when this rule applies]
   alwaysApply: true  # Set to true for tech radar rules
   ---
   ```
2. **File Format**: Must be `.md` files with the frontmatter at the top
3. **Language Style**: Write as clear instructions to an AI assistant
4. **Sort Order**: Sort technologies within each ring alphabetically
5. **Missing Data**: If a technology has no decision text, use the summary
6. **Optional Fields**: If when_to_use is empty, omit that line
7. **Be Directive**: Use strong action words (ALWAYS, NEVER, MUST, AVOID)
8. **MAXIMIZE CONCISENESS**: 
   - One sentence per technology MAX
   - No explanations or justifications
   - No historical context
   - Every word must provide actionable value
   - Remember: You're competing for limited context space with actual code!

⚠️ **Context Window Warning**: Verbose rules reduce the AI's ability to see actual code context. Keep it tight!

## Files to Read

1. Read `radar-entries.json` to get all technology entries
2. Create the `.cursor/rules/radar/` directory structure
3. Create the 4 markdown files in the `/radar` subfolder
4. Each file should only contain technologies from its respective quadrant

## Benefits of the /radar Subfolder

- Keeps radar-specific rules organized and separate from project-specific rules
- Makes it easy to update or remove all radar rules at once
- Allows projects to have their own custom rules alongside radar guidance
- Clear namespace separation prevents conflicts

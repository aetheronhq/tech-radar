# Tech Radar Cursor Rules - GitHub Action Setup

This action syncs technology radar decisions as Cursor IDE rules across your organization's repositories.

## For Organization Administrators

### Initial Setup (One Time)

1. Ensure this radar repository contains generated Cursor rules in:
   ```
   .cursor/rules/radar/
   ├── infrastructure.md
   ├── languages-frameworks.md  
   ├── services-llms.md
   └── tools-methodologies.md
   ```

2. **Rules must be in Cursor-compatible format**:
   - Markdown files (`.md` extension) with YAML frontmatter
   - Must start with frontmatter between `---` markers:
     ```yaml
     ---
     description: Brief description of when to apply this rule
     alwaysApply: true
     ---
     ```
   - After frontmatter, include human-readable instructions for the AI
   - Example: "ALWAYS prefer PostgreSQL for new databases"

3. Make sure the radar site is publicly accessible (or accessible to your CI/CD runners).

## For Repository Maintainers

### Add to Any Repository (One Line!)

Create `.github/workflows/sync-radar.yml`:

```yaml
name: Sync Tech Radar Rules

on:
  pull_request:

jobs:
  sync-radar:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    steps:
      - uses: YOUR_ORG/radar@main  # ← That's it! 🎉
```

**No configuration needed!** The action automatically fetches rules from the deployed radar site.

### What Happens

1. **On Every PR**: The action automatically runs
2. **Downloads Rules**: Fetches the latest rules from the deployed radar site
3. **Updates if Changed**: Only commits if rules have actually changed
4. **Comments on PR**: Notifies developers when rules are updated
5. **Organized Structure**: Rules are placed in `.cursor/rules/radar/` subfolder

### Zero Configuration

The action requires absolutely no configuration! It automatically fetches rules from the Aetheron Tech Radar at `https://radar.sandbox.aetheron.com/.cursor/rules/radar/`

Just use it - that's it!

### How Cursor Uses These Rules

**Agent-Controlled Inclusion (Default)**
- Cursor automatically includes all `.md` files in `.cursor/rules/` and subdirectories
- The AI agent considers these rules when making suggestions
- No special configuration needed - this is Cursor's default behavior
- Rules influence code generation, refactoring suggestions, and technology recommendations

**Rule Priority**
- More specific rules override general ones
- Project-specific rules can override radar rules
- The AI balances rules with context and best practices

### Benefits

- **Zero Maintenance**: Rules stay automatically synchronized
- **PR Visibility**: Changes are transparent and tracked in git
- **Clean Separation**: Radar rules are isolated in their own subfolder
- **Works Alongside**: Project-specific rules can coexist in `.cursor/rules/`
- **Automatic Inclusion**: Cursor's AI automatically uses these rules (default behavior)

### Troubleshooting

**Action fails with 404 errors**
- Ensure the radar site is accessible at https://radar.sandbox.aetheron.com
- Check that rules have been generated and deployed
- The action expects files at: `https://radar.sandbox.aetheron.com/.cursor/rules/radar/{file}.md`

**No changes detected**
- Rules are already up to date
- Check that the deployed radar site has the latest rules

**Permission denied on push**
- Ensure the workflow has `contents: write` permission
- Check branch protection rules allow GitHub Actions to push

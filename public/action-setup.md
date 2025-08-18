# Tech Radar Cursor Rules - GitHub Action Setup

**What This Does:** Automatically syncs your organization's technology radar decisions to Cursor IDE, ensuring all developers get consistent technology recommendations and guidance.

## 🚀 Quick Start (One-Shot Setup)

**Add tech radar rules to your repository in 30 seconds:**

1. Create `.github/workflows/sync-radar.yml` in your repository
2. Copy and paste this content:

```yaml
name: Sync Tech Radar Rules

on:
  pull_request:

jobs:
  sync-radar:
    uses: Cognitive-Creators-AI/shared-ci-workflows/.github/workflows/sync-tech-radar-rules.yml@main
    permissions:
      contents: write
      pull-requests: write
```

3. Commit and push - **Done!** ✅

The action will automatically sync tech radar rules on every pull request.

## How It Works

**No configuration needed!** The action automatically fetches rules from the deployed radar site.

### What Happens

1. **On Every PR**: The action automatically runs
2. **Downloads Rules**: Fetches the latest rules from the deployed radar site
3. **Updates if Changed**: Only commits if rules have actually changed
4. **Comments on PR**: Notifies developers when rules are updated
5. **Organized Structure**: Rules are placed in `.cursor/rules/radar/` subfolder

### Zero Configuration Required

The action requires absolutely no configuration! It automatically:
- Detects the radar deployment URL
- Fetches the latest rules
- Places them in the correct location
- Only updates when rules change

Just add the workflow file - that's it!

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
- Ensure the radar site is deployed and accessible
- Check that rules have been generated in `.cursor/rules/radar/`
- Verify the action can access the deployment URL

**No changes detected**
- Rules are already up to date
- This is normal if no radar changes have been made

**Permission denied on push**
- Ensure the workflow has `contents: write` permission
- Check branch protection rules allow GitHub Actions to push
- The permissions block in the workflow is required

### Alternative: Manual Setup

If you prefer not to use the GitHub Action, you can manually copy the rules:

1. Visit the tech radar repository
2. Copy the contents of `.cursor/rules/radar/` to your project
3. Commit the files to your repository

However, the GitHub Action is recommended as it keeps rules automatically synchronized.

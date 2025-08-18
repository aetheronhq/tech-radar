# Shared CI Workflow Update Guide

## Changes Required for sync-org-cursor-rules.yml

The workflow needs to be updated to handle the .md → .mdc migration properly.

### 1. Update Download URLs

Change all references from `.md` to `.mdc`:

```yaml
# Old:
- https://radar.sandbox.aetheron.com/.cursor/rules/radar/infrastructure.md
- https://radar.sandbox.aetheron.com/.cursor/rules/radar/languages-frameworks.md
- https://radar.sandbox.aetheron.com/.cursor/rules/radar/services-llms.md
- https://radar.sandbox.aetheron.com/.cursor/rules/radar/tools-methodologies.md

# New:
- https://radar.sandbox.aetheron.com/.cursor/rules/radar/infrastructure.mdc
- https://radar.sandbox.aetheron.com/.cursor/rules/radar/languages-frameworks.mdc
- https://radar.sandbox.aetheron.com/.cursor/rules/radar/services-llms.mdc
- https://radar.sandbox.aetheron.com/.cursor/rules/radar/tools-methodologies.mdc
```

### 2. Add Cleanup Step

Add a step to remove old .md files before downloading new .mdc files:

```yaml
- name: Clean up old .md cursor rules
  run: |
    # Remove old .md files from radar subdirectory
    if [ -d ".cursor/rules/radar" ]; then
      echo "Removing old .md files from .cursor/rules/radar..."
      find .cursor/rules/radar -name "*.md" -type f -delete
    fi
```

### 3. Complete Example

Here's a complete example of what the sync step might look like:

```yaml
- name: Sync Cursor Rules from Radar
  run: |
    # Create directory structure
    mkdir -p .cursor/rules/radar
    
    # Clean up old .md files
    echo "🧹 Cleaning up old .md files..."
    find .cursor/rules/radar -name "*.md" -type f -delete 2>/dev/null || true
    
    # Download new .mdc files
    echo "📥 Downloading updated cursor rules..."
    curl -sL https://radar.sandbox.aetheron.com/.cursor/rules/radar/infrastructure.mdc -o .cursor/rules/radar/infrastructure.mdc
    curl -sL https://radar.sandbox.aetheron.com/.cursor/rules/radar/languages-frameworks.mdc -o .cursor/rules/radar/languages-frameworks.mdc
    curl -sL https://radar.sandbox.aetheron.com/.cursor/rules/radar/services-llms.mdc -o .cursor/rules/radar/services-llms.mdc
    curl -sL https://radar.sandbox.aetheron.com/.cursor/rules/radar/tools-methodologies.mdc -o .cursor/rules/radar/tools-methodologies.mdc
    
    # Verify downloads
    echo "✅ Downloaded files:"
    ls -la .cursor/rules/radar/
```

### 4. Update Commit Message

Update any commit messages to reflect the change:

```yaml
- name: Commit changes
  run: |
    git add .cursor/rules/radar/
    git commit -m "🔄 Sync cursor rules from radar (updated to .mdc format)" || echo "No changes to commit"
```

### 5. Update PR Description

If the workflow creates PRs, update the description:

```markdown
## 🔄 Cursor Rules Update

This PR syncs the latest cursor rules from the [Tech Radar](https://radar.sandbox.aetheron.com).

### Changes:
- Updated cursor rules to use `.mdc` extension (Cursor's preferred format)
- Removed legacy `.md` rule files
- Synced latest technology decisions from radar
```

## Testing

After implementing these changes:

1. Test on a repository that has old .md files to ensure they're properly cleaned up
2. Verify that new .mdc files are downloaded correctly
3. Ensure Cursor IDE recognizes the new .mdc files

## Migration Notes

- This is a one-time migration from .md to .mdc
- All repositories using the workflow will automatically get cleaned up on next sync
- No manual intervention required in target repositories

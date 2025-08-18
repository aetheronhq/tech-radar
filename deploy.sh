#!/bin/bash

# Deploy script for Aetheron Tech Radar
# NOTE: This currently deploys to the OLD AWS account
# TODO: Migrate to the new AWS account when ready

echo "🚀 Deploying Tech Radar to S3..."

# Set AWS credentials (temporary - using old account)
export AWS_DEFAULT_REGION=ap-southeast-2

# Copy .cursor files to public directory for deployment (they're gitignored)
if [ -d ".cursor/rules/radar" ]; then
  echo "📋 Copying Cursor rules to public directory..."
  mkdir -p public/.cursor/rules/radar
  cp -r .cursor/rules/radar/* public/.cursor/rules/radar/
fi

# Sync public directory to S3
echo "📦 Syncing public directory to S3..."
aws s3 sync public/ s3://radar.sandbox.aetheron.com/ \
  --delete \
  --cache-control "no-cache" \
  --exclude ".DS_Store" \
  --exclude "*.swp"

# Clean up the temporary .cursor files from public
if [ -d "public/.cursor" ]; then
  echo "🧹 Cleaning up temporary files..."
  rm -rf public/.cursor
fi

# Create CloudFront invalidation
echo "🔄 Invalidating CloudFront cache..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id E3C42WRA8M2TYU \
  --paths "/*" "/.cursor/*" \
  --query 'Invalidation.Id' \
  --output text)

echo "✅ Deployment complete!"
echo "📍 CloudFront invalidation ID: $INVALIDATION_ID"
echo "🌐 Site will be updated at: https://radar.sandbox.aetheron.com"
echo ""
echo "⚠️  WARNING: This is using the OLD AWS account credentials"
echo "⚠️  These should be migrated to the new account and use AWS SSO"
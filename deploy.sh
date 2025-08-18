#!/bin/bash

# Deploy script for Aetheron Tech Radar
# NOTE: This currently deploys to the OLD AWS account
# TODO: Migrate to the new AWS account when ready

echo "🚀 Deploying Tech Radar to S3..."

# Set AWS credentials (temporary - using old account)
export AWS_DEFAULT_REGION=ap-southeast-2

# Sync public directory to S3
echo "📦 Syncing public directory to S3..."
aws s3 sync public/ s3://radar.sandbox.aetheron.com/ \
  --delete \
  --cache-control "no-cache" \
  --exclude ".DS_Store" \
  --exclude "*.swp"

# Also sync Cursor rules if they exist
if [ -d ".cursor/rules/radar" ]; then
  echo "📝 Syncing Cursor rules to S3..."
  aws s3 sync .cursor/rules/radar/ s3://radar.sandbox.aetheron.com/.cursor/rules/radar/ \
    --cache-control "no-cache" \
    --content-type "text/markdown" \
    --exclude ".DS_Store" \
    --exclude "*.swp"
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
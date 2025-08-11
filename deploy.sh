#!/bin/bash

# Deploy script for Aetheron Tech Radar
# NOTE: This currently deploys to the OLD AWS account
# TODO: Migrate to the new AWS account when ready

echo "🚀 Deploying Tech Radar to S3..."

# Set AWS credentials (temporary - using old account)
export AWS_DEFAULT_REGION=ap-southeast-2

# Deploy main HTML file
echo "📄 Uploading radar.html..."
aws s3 cp radar.html s3://radar.sandbox.aetheron.com/index.html \
  --content-type "text/html" \
  --cache-control "no-cache" \
  --metadata-directive REPLACE

# Deploy JSON data file
echo "📊 Uploading radar-entries.json..."
aws s3 cp radar-entries.json s3://radar.sandbox.aetheron.com/radar-entries.json \
  --content-type "application/json" \
  --cache-control "no-cache"

# Deploy vendor files
echo "📦 Uploading vendor files..."
aws s3 cp vendor/radar-0.12.js s3://radar.sandbox.aetheron.com/vendor/radar-0.12.js \
  --content-type "application/javascript" \
  --cache-control "no-cache"

# Create CloudFront invalidation
echo "🔄 Invalidating CloudFront cache..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id E3C42WRA8M2TYU \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text)

echo "✅ Deployment complete!"
echo "📍 CloudFront invalidation ID: $INVALIDATION_ID"
echo "🌐 Site will be updated at: https://radar.sandbox.aetheron.com"
echo ""
echo "⚠️  WARNING: This is using the OLD AWS account credentials"
echo "⚠️  These should be migrated to the new account and use AWS SSO"

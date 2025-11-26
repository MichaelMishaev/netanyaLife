#!/bin/bash

# Lighthouse Audit Script for קהילת נתניה
# Audits all key pages and generates reports

echo "🔍 Running Lighthouse audits on all key pages..."
echo "================================================"

# Create reports directory
mkdir -p lighthouse-reports

# Home page (Hebrew)
echo "\n📊 Auditing: Home (Hebrew)"
npx lighthouse http://localhost:4700/he \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=html \
  --output-path=./lighthouse-reports/home-he.html \
  --chrome-flags="--headless" \
  --quiet

# Home page (Russian)
echo "\n📊 Auditing: Home (Russian)"
npx lighthouse http://localhost:4700/ru \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=html \
  --output-path=./lighthouse-reports/home-ru.html \
  --chrome-flags="--headless" \
  --quiet

# Add Business page
echo "\n📊 Auditing: Add Business (Hebrew)"
npx lighthouse http://localhost:4700/he/add-business \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=html \
  --output-path=./lighthouse-reports/add-business.html \
  --chrome-flags="--headless" \
  --quiet

echo "\n✅ Lighthouse audits complete!"
echo "📁 Reports saved to: ./lighthouse-reports/"
echo "================================================"

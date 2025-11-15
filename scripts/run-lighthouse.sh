#!/bin/bash

echo "🔍 Running comprehensive Lighthouse audits..."
mkdir -p lighthouse-reports

# Home page (Hebrew)
echo "📊 Auditing: Home (Hebrew)..."
npx lighthouse http://localhost:4700/he \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=json \
  --output-path=./lighthouse-reports/home-he.json \
  --chrome-flags="--headless" \
  --quiet

# Home page (Russian)
echo "📊 Auditing: Home (Russian)..."
npx lighthouse http://localhost:4700/ru \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=json \
  --output-path=./lighthouse-reports/home-ru.json \
  --chrome-flags="--headless" \
  --quiet

# Add Business page
echo "📊 Auditing: Add Business..."
npx lighthouse http://localhost:4700/he/add-business \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=json \
  --output-path=./lighthouse-reports/add-business.json \
  --chrome-flags="--headless" \
  --quiet

echo "✅ Audits complete!"
echo "📊 Analyzing results..."
node scripts/analyze-lighthouse.js

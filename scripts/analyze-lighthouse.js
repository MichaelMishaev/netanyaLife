#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const reportsDir = './lighthouse-reports'

// Read all JSON files from reports directory
const files = fs.readdirSync(reportsDir)
  .filter(f => f.endsWith('.json'))

console.log('\n🔍 Lighthouse Audit Summary\n')
console.log('='.repeat(70))

files.forEach(file => {
  const data = JSON.parse(fs.readFileSync(path.join(reportsDir, file), 'utf8'))
  const { categories, audits, requestedUrl } = data

  console.log(`\n📄 ${file.replace('.json', '')}`)
  console.log(`URL: ${requestedUrl}\n`)

  // Print scores
  console.log('Scores:')
  Object.entries(categories).forEach(([key, cat]) => {
    const score = Math.round(cat.score * 100)
    const icon = score >= 90 ? '✅' : score >= 50 ? '⚠️' : '❌'
    console.log(`  ${icon} ${cat.title}: ${score}`)
  })

  // Performance issues
  if (categories.performance.score < 0.9) {
    console.log('\n⚡ Performance Issues:')
    const perfAudits = [
      'largest-contentful-paint',
      'first-contentful-paint',
      'speed-index',
      'total-blocking-time',
      'cumulative-layout-shift',
      'render-blocking-resources',
      'unused-javascript',
      'uses-optimized-images',
      'modern-image-formats',
      'uses-responsive-images',
    ]

    perfAudits.forEach(auditId => {
      const audit = audits[auditId]
      if (audit && (audit.score === null || audit.score < 0.9) && audit.details) {
        console.log(`  - ${audit.title}: ${audit.displayValue || audit.score}`)
      }
    })
  }

  // Accessibility issues
  if (categories.accessibility.score < 1.0) {
    console.log('\n♿ Accessibility Issues:')
    Object.entries(audits).forEach(([id, audit]) => {
      if (audit.score !== null && audit.score < 1 && id.includes('aria') || id.includes('color-contrast') || id.includes('button') || id.includes('link')) {
        console.log(`  - ${audit.title}`)
      }
    })
  }

  console.log('\n' + '-'.repeat(70))
})

console.log('\n')

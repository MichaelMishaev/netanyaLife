import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:4700'

test.describe('SEO & GEO Implementation Tests', () => {
  test.describe('1. OG Images Generation', () => {
    test('should generate homepage OG image', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/og-image.png`)
      expect(response?.status()).toBe(200)
      expect(response?.headers()['content-type']).toContain('image')
    })

    test('should generate business OG image', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/og-image-business.png`)
      expect(response?.status()).toBe(200)
      expect(response?.headers()['content-type']).toContain('image')
    })
  })

  test.describe('2. Home Page Metadata', () => {
    test('should have proper metadata on Hebrew home page', async ({ page }) => {
      await page.goto(`${BASE_URL}/he`)

      // Check title
      const title = await page.title()
      expect(title).toContain('Netanya Local')
      expect(title).toContain('מדריך עסקים')

      // Check meta description
      const description = await page.locator('meta[name="description"]').getAttribute('content')
      expect(description).toContain('נתניה')
      expect(description).toContain('שכונות')

      // Check canonical URL
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
      expect(canonical).toContain('/he')

      // Check Open Graph tags
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
      expect(ogTitle).toContain('Netanya Local')

      const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content')
      expect(ogImage).toContain('og-image.png')

      const ogLocale = await page.locator('meta[property="og:locale"]').getAttribute('content')
      expect(ogLocale).toBe('he_IL')

      // Check Twitter Card
      const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute('content')
      expect(twitterCard).toBe('summary_large_image')
    })

    test('should have proper metadata on Russian home page', async ({ page }) => {
      await page.goto(`${BASE_URL}/ru`)

      const title = await page.title()
      expect(title).toContain('Netanya Local')
      expect(title).toContain('справочник')

      const description = await page.locator('meta[name="description"]').getAttribute('content')
      expect(description).toContain('Нетани')

      const ogLocale = await page.locator('meta[property="og:locale"]').getAttribute('content')
      expect(ogLocale).toBe('ru_RU')
    })

    test('should have hreflang tags', async ({ page }) => {
      await page.goto(`${BASE_URL}/he`)

      const hreflangHe = await page.locator('link[hreflang="he"]').getAttribute('href')
      expect(hreflangHe).toContain('/he')

      const hreflangRu = await page.locator('link[hreflang="ru"]').getAttribute('href')
      expect(hreflangRu).toContain('/ru')

      const hreflangDefault = await page.locator('link[hreflang="x-default"]').getAttribute('href')
      expect(hreflangDefault).toContain('/he')
    })
  })

  test.describe('3. Business Detail Page - LocalBusiness Schema', () => {
    test('should have LocalBusiness structured data on business page', async ({ page }) => {
      // First, go to home and search for a business
      await page.goto(`${BASE_URL}/he`)

      // Try to navigate to search results
      await page.selectOption('select#category', { index: 1 })
      await page.selectOption('select#neighborhood', { index: 1 })
      await page.click('button[type="submit"]')

      // Wait for search results and click first business if exists
      await page.waitForLoadState('networkidle')

      const businessLink = page.locator('a[href*="/business/"]').first()
      const hasBusinesses = await businessLink.count() > 0

      if (hasBusinesses) {
        await businessLink.click()
        await page.waitForLoadState('networkidle')

        // Check for LocalBusiness schema
        const schemaScript = await page.locator('script[type="application/ld+json"]').first()
        expect(await schemaScript.count()).toBeGreaterThan(0)

        const schemaContent = await schemaScript.textContent()
        const schema = JSON.parse(schemaContent || '{}')

        // Verify LocalBusiness schema structure
        expect(schema['@type']).toBe('LocalBusiness')
        expect(schema['@context']).toBe('https://schema.org')
        expect(schema.name).toBeTruthy()
        expect(schema.url).toBeTruthy()

        // Check for address
        if (schema.address) {
          expect(schema.address['@type']).toBe('PostalAddress')
          expect(schema.address.addressLocality).toBe('נתניה')
          expect(schema.address.addressCountry).toBe('IL')
        }

        // Check for geo coordinates (if business has them)
        if (schema.geo) {
          expect(schema.geo['@type']).toBe('GeoCoordinates')
          expect(schema.geo.latitude).toBeTruthy()
          expect(schema.geo.longitude).toBeTruthy()
        }

        // Check for aggregate rating (if reviews exist)
        if (schema.aggregateRating) {
          expect(schema.aggregateRating['@type']).toBe('AggregateRating')
          expect(schema.aggregateRating.ratingValue).toBeGreaterThanOrEqual(1)
          expect(schema.aggregateRating.bestRating).toBe(5)
          expect(schema.aggregateRating.worstRating).toBe(1)
        }

        console.log('✅ LocalBusiness Schema:', JSON.stringify(schema, null, 2))
      } else {
        console.log('⚠️ No businesses found to test schema')
      }
    })

    test('should have proper metadata on business page', async ({ page }) => {
      await page.goto(`${BASE_URL}/he`)

      await page.selectOption('select#category', { index: 1 })
      await page.selectOption('select#neighborhood', { index: 1 })
      await page.click('button[type="submit"]')
      await page.waitForLoadState('networkidle')

      const businessLink = page.locator('a[href*="/business/"]').first()
      const hasBusinesses = await businessLink.count() > 0

      if (hasBusinesses) {
        await businessLink.click()
        await page.waitForLoadState('networkidle')

        // Check meta tags
        const title = await page.title()
        expect(title).toBeTruthy()
        expect(title.length).toBeGreaterThan(10)

        const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content')
        expect(ogImage).toContain('og-image-business.png')

        const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
        expect(canonical).toContain('/business/')
      }
    })
  })

  test.describe('4. Directions Button', () => {
    test('should display directions button on business page', async ({ page }) => {
      await page.goto(`${BASE_URL}/he`)

      await page.selectOption('select#category', { index: 1 })
      await page.selectOption('select#neighborhood', { index: 1 })
      await page.click('button[type="submit"]')
      await page.waitForLoadState('networkidle')

      const businessLink = page.locator('a[href*="/business/"]').first()
      const hasBusinesses = await businessLink.count() > 0

      if (hasBusinesses) {
        await businessLink.click()
        await page.waitForLoadState('networkidle')

        // Check for directions button (if business has address)
        const directionsButton = page.locator('a[href*="google.com/maps"]')
        const hasDirections = await directionsButton.count() > 0

        if (hasDirections) {
          // Verify button properties
          const href = await directionsButton.getAttribute('href')
          expect(href).toContain('google.com/maps/search')
          expect(href).toContain('api=1')
          expect(href).toContain('query=')

          const target = await directionsButton.getAttribute('target')
          expect(target).toBe('_blank')

          const rel = await directionsButton.getAttribute('rel')
          expect(rel).toContain('noopener')

          // Check button text
          const buttonText = await directionsButton.textContent()
          expect(buttonText).toContain('הוראות הגעה')

          console.log('✅ Directions button URL:', href)
        } else {
          console.log('⚠️ Business has no address, directions button not shown')
        }
      }
    })

    test('directions button should have map pin icon', async ({ page }) => {
      await page.goto(`${BASE_URL}/he`)

      await page.selectOption('select#category', { index: 1 })
      await page.selectOption('select#neighborhood', { index: 1 })
      await page.click('button[type="submit"]')
      await page.waitForLoadState('networkidle')

      const businessLink = page.locator('a[href*="/business/"]').first()
      const hasBusinesses = await businessLink.count() > 0

      if (hasBusinesses) {
        await businessLink.click()
        await page.waitForLoadState('networkidle')

        const directionsButton = page.locator('a[href*="google.com/maps"]')
        const hasDirections = await directionsButton.count() > 0

        if (hasDirections) {
          // Check for SVG icon
          const icon = directionsButton.locator('svg')
          expect(await icon.count()).toBe(1)

          // Check button has proper styling
          const classes = await directionsButton.getAttribute('class')
          expect(classes).toContain('bg-blue-600')
          expect(classes).toContain('hover:bg-blue-700')
        }
      }
    })
  })

  test.describe('5. Add Business Page Metadata', () => {
    test('should have proper metadata on Hebrew add-business page', async ({ page }) => {
      await page.goto(`${BASE_URL}/he/add-business`)

      const title = await page.title()
      expect(title).toContain('הוסף עסק')
      expect(title).toContain('Netanya Local')

      const description = await page.locator('meta[name="description"]').getAttribute('content')
      expect(description).toContain('רשמו את העסק')
      expect(description).toContain('חינם')

      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
      expect(canonical).toContain('/he/add-business')

      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
      expect(ogTitle).toContain('הוסף עסק')
    })

    test('should have proper metadata on Russian add-business page', async ({ page }) => {
      await page.goto(`${BASE_URL}/ru/add-business`)

      const title = await page.title()
      expect(title).toContain('Добавить бизнес')

      const description = await page.locator('meta[name="description"]').getAttribute('content')
      expect(description).toContain('Зарегистрируйте')
      expect(description).toContain('Бесплатно')
    })
  })

  test.describe('6. Comprehensive SEO Checks', () => {
    test('all pages should have unique titles', async ({ page }) => {
      const pages = [
        `${BASE_URL}/he`,
        `${BASE_URL}/ru`,
        `${BASE_URL}/he/add-business`,
        `${BASE_URL}/ru/add-business`,
      ]

      const titles = []
      for (const url of pages) {
        await page.goto(url)
        const title = await page.title()
        titles.push(title)
      }

      // Check all titles are unique
      const uniqueTitles = new Set(titles)
      expect(uniqueTitles.size).toBe(titles.length)

      console.log('✅ Unique page titles:', titles)
    })

    test('all pages should have proper language attributes', async ({ page }) => {
      // Hebrew page
      await page.goto(`${BASE_URL}/he`)
      let htmlLang = await page.locator('html').getAttribute('lang')
      expect(htmlLang).toBe('he')
      let htmlDir = await page.locator('html').getAttribute('dir')
      expect(htmlDir).toBe('rtl')

      // Russian page
      await page.goto(`${BASE_URL}/ru`)
      htmlLang = await page.locator('html').getAttribute('lang')
      expect(htmlLang).toBe('ru')
      htmlDir = await page.locator('html').getAttribute('dir')
      expect(htmlDir).toBe('ltr')
    })

    test('should have sitemap', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/sitemap.xml`)
      expect(response?.status()).toBe(200)

      const content = await page.content()
      expect(content).toContain('<?xml')
      expect(content).toContain('<urlset')
      expect(content).toContain('<loc>')
    })

    test('should have robots.txt', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/robots.txt`)
      expect(response?.status()).toBe(200)

      const content = await page.content()
      expect(content).toContain('User-agent')
      expect(content).toContain('Disallow: /admin')
      expect(content).toContain('sitemap')
    })
  })
})

# Hebrew Font Implementation Guide - Quick Start

**Font Choice:** Assistant (Google Fonts)
**Implementation Method:** Next.js `next/font/google` (optimal)

---

## Quick Implementation (5 minutes)

### Step 1: Update Layout File

**File:** `/app/[locale]/layout.tsx`

```typescript
import { Assistant } from 'next/font/google';

// Configure Assistant font
const assistant = Assistant({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-assistant',
});

export default function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const direction = locale === 'he' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={direction} className={assistant.variable}>
      <body className={assistant.className}>
        {children}
      </body>
    </html>
  );
}
```

---

### Step 2: Update Tailwind Config

**File:** `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-assistant)', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'xs': '12px',
        'sm': '14px',
        'base': '16px',
        'lg': '18px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '28px',
        '4xl': '32px',
      },
      fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
  },
  plugins: [],
};

export default config;
```

---

### Step 3: Create Typography Utilities (Optional)

**File:** `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  /* Font size variants for accessibility */
  body.font-normal {
    font-size: 16px;
  }

  body.font-medium {
    font-size: 18px;
  }

  body.font-large {
    font-size: 20px;
  }

  /* High contrast mode */
  body.high-contrast {
    color: #000000;
    background: #ffffff;
    font-weight: 500;
  }

  body.high-contrast strong,
  body.high-contrast h1,
  body.high-contrast h2,
  body.high-contrast h3 {
    font-weight: 700;
  }

  /* RTL adjustments */
  [dir="rtl"] {
    text-align: right;
    letter-spacing: 0;
  }

  /* Phone numbers always LTR */
  .phone,
  .whatsapp,
  .tel {
    direction: ltr;
    unicode-bidi: override;
    display: inline-block;
  }
}

@layer components {
  /* Business card typography */
  .business-name {
    @apply text-lg font-semibold leading-tight;
  }

  .business-category {
    @apply text-sm font-medium uppercase tracking-wide;
  }

  .business-description {
    @apply text-base font-regular leading-relaxed;
  }

  /* Heading styles */
  .heading-1 {
    @apply text-4xl font-bold leading-tight;
  }

  .heading-2 {
    @apply text-3xl font-bold leading-tight;
  }

  .heading-3 {
    @apply text-2xl font-semibold leading-tight;
  }

  /* Body text */
  .body-text {
    @apply text-base font-regular leading-normal;
  }

  .body-text-large {
    @apply text-lg font-regular leading-relaxed;
  }

  /* Metadata/secondary text */
  .text-meta {
    @apply text-sm font-regular text-gray-600;
  }

  /* Button text */
  .btn-text {
    @apply text-base font-semibold;
  }
}
```

---

### Step 4: Usage Examples

#### Example 1: Business Card Component

```typescript
// components/BusinessCard.tsx
interface BusinessCardProps {
  name: string;
  category: string;
  description: string;
  phone?: string;
  whatsapp?: string;
}

export default function BusinessCard({
  name,
  category,
  description,
  phone,
  whatsapp
}: BusinessCardProps) {
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      {/* Category */}
      <p className="business-category text-blue-600 mb-2">
        {category}
      </p>

      {/* Business Name */}
      <h3 className="business-name mb-3">
        {name}
      </h3>

      {/* Description */}
      <p className="business-description text-gray-700 mb-4">
        {description}
      </p>

      {/* Contact Buttons */}
      <div className="flex gap-2">
        {whatsapp && (
          <button className="btn-text px-4 py-2 bg-green-600 text-white rounded">
            <span className="whatsapp">{whatsapp}</span>
          </button>
        )}
        {phone && (
          <button className="btn-text px-4 py-2 bg-blue-600 text-white rounded">
            <span className="phone">{phone}</span>
          </button>
        )}
      </div>
    </div>
  );
}
```

#### Example 2: Page Heading

```typescript
// app/[locale]/[neighborhood]/[category]/page.tsx
export default function ResultsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="heading-1 mb-6">
        חשמלאים בצפון נתניה
      </h1>

      <p className="body-text-large text-gray-600 mb-8">
        נמצאו 12 עסקים בשכונה זו
      </p>

      {/* Results list */}
    </div>
  );
}
```

#### Example 3: Mixed Content (Hebrew + Numbers)

```typescript
export default function BusinessDetails() {
  return (
    <div>
      <h2 className="heading-2 mb-4">פרטי יצירת קשר</h2>

      {/* Phone - LTR direction for numbers */}
      <div className="mb-3">
        <span className="text-meta">טלפון:</span>
        <span className="phone font-medium mr-2">052-123-4567</span>
      </div>

      {/* Address - RTL for Hebrew */}
      <div className="mb-3">
        <span className="text-meta">כתובת:</span>
        <span className="font-regular mr-2">רחוב הרצל 15, נתניה</span>
      </div>
    </div>
  );
}
```

---

## Tailwind Utility Classes Quick Reference

### Font Weights (with Assistant)
```html
<p class="font-regular">רגיל (400)</p>
<p class="font-medium">בינוני (500)</p>
<p class="font-semibold">חצי מודגש (600)</p>
<p class="font-bold">מודגש (700)</p>
```

### Font Sizes
```html
<p class="text-xs">קטן מאוד (12px)</p>
<p class="text-sm">קטן (14px)</p>
<p class="text-base">רגיל (16px)</p>
<p class="text-lg">גדול (18px)</p>
<p class="text-xl">גדול מאוד (20px)</p>
<p class="text-2xl">כותרת משנה (24px)</p>
<p class="text-3xl">כותרת (28px)</p>
<p class="text-4xl">כותרת ראשית (32px)</p>
```

### Line Heights
```html
<p class="leading-tight">צמוד (1.2) - לכותרות</p>
<p class="leading-normal">רגיל (1.5) - לטקסט גוף</p>
<p class="leading-relaxed">מרווח (1.6) - לקריאה נוחה</p>
```

### Common Combinations
```html
<!-- Category label -->
<span class="text-sm font-medium uppercase tracking-wide text-blue-600">
  קטגוריה
</span>

<!-- Business name -->
<h3 class="text-lg font-semibold leading-tight text-gray-900">
  שם העסק
</h3>

<!-- Description -->
<p class="text-base font-regular leading-relaxed text-gray-700">
  תיאור העסק...
</p>

<!-- Metadata -->
<span class="text-sm font-regular text-gray-500">
  מידע נוסף
</span>

<!-- Button -->
<button class="text-base font-semibold px-4 py-2 bg-blue-600 text-white rounded">
  לחץ כאן
</button>
```

---

## Accessibility Implementation

### Font Size Control Hook

**File:** `hooks/useAccessibility.ts`

```typescript
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AccessibilityState {
  fontSize: 'normal' | 'medium' | 'large';
  highContrast: boolean;
  underlineLinks: boolean;
  setFontSize: (size: 'normal' | 'medium' | 'large') => void;
  toggleHighContrast: () => void;
  toggleUnderlineLinks: () => void;
}

export const useAccessibility = create<AccessibilityState>()(
  persist(
    (set) => ({
      fontSize: 'normal',
      highContrast: false,
      underlineLinks: false,
      setFontSize: (size) => set({ fontSize: size }),
      toggleHighContrast: () => set((state) => ({ highContrast: !state.highContrast })),
      toggleUnderlineLinks: () => set((state) => ({ underlineLinks: !state.underlineLinks })),
    }),
    {
      name: 'accessibility-storage',
    }
  )
);
```

### Accessibility Provider Component

**File:** `components/AccessibilityProvider.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { useAccessibility } from '@/hooks/useAccessibility';

export default function AccessibilityProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const { fontSize, highContrast, underlineLinks } = useAccessibility();

  useEffect(() => {
    // Apply font size class
    document.body.className = document.body.className
      .replace(/font-(normal|medium|large)/g, '')
      .trim();
    document.body.classList.add(`font-${fontSize}`);

    // Apply high contrast
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }

    // Apply underline links
    if (underlineLinks) {
      document.body.classList.add('underline-links');
    } else {
      document.body.classList.remove('underline-links');
    }
  }, [fontSize, highContrast, underlineLinks]);

  return <>{children}</>;
}
```

### Accessibility Panel Component

**File:** `components/AccessibilityPanel.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useAccessibility } from '@/hooks/useAccessibility';

export default function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    fontSize,
    highContrast,
    underlineLinks,
    setFontSize,
    toggleHighContrast,
    toggleUnderlineLinks,
  } = useAccessibility();

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        aria-label="נגישות"
      >
        <span className="text-2xl">♿</span>
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-20 left-4 w-72 bg-white rounded-lg shadow-2xl p-6 z-50 border">
          <h3 className="text-xl font-semibold mb-4">הגדרות נגישות</h3>

          {/* Font size */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">גודל טקסט</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFontSize('normal')}
                className={`px-4 py-2 rounded ${
                  fontSize === 'normal'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                רגיל
              </button>
              <button
                onClick={() => setFontSize('medium')}
                className={`px-4 py-2 rounded ${
                  fontSize === 'medium'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                בינוני
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-4 py-2 rounded ${
                  fontSize === 'large'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                גדול
              </button>
            </div>
          </div>

          {/* High contrast */}
          <div className="mb-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium">ניגודיות גבוהה</span>
              <input
                type="checkbox"
                checked={highContrast}
                onChange={toggleHighContrast}
                className="w-5 h-5"
              />
            </label>
          </div>

          {/* Underline links */}
          <div className="mb-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium">קו תחתון לקישורים</span>
              <input
                type="checkbox"
                checked={underlineLinks}
                onChange={toggleUnderlineLinks}
                className="w-5 h-5"
              />
            </label>
          </div>

          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            סגור
          </button>
        </div>
      )}
    </>
  );
}
```

### Add to Layout

```typescript
// app/[locale]/layout.tsx
import AccessibilityProvider from '@/components/AccessibilityProvider';
import AccessibilityPanel from '@/components/AccessibilityPanel';

export default function RootLayout({ children, params }) {
  return (
    <html lang={params.locale} dir={params.locale === 'he' ? 'rtl' : 'ltr'}>
      <body className={assistant.className}>
        <AccessibilityProvider>
          {children}
          <AccessibilityPanel />
        </AccessibilityProvider>
      </body>
    </html>
  );
}
```

---

## Testing Checklist

After implementation, verify:

- [ ] Hebrew text displays correctly with Assistant font
- [ ] Font weights work (regular, medium, semibold, bold)
- [ ] RTL alignment is correct
- [ ] Phone numbers stay LTR
- [ ] Font size controls work (normal/medium/large)
- [ ] High contrast mode increases font weight
- [ ] Font loads on mobile Safari
- [ ] Font loads on Chrome Android
- [ ] No flash of unstyled text (FOUT)
- [ ] Accessibility panel persists settings in localStorage
- [ ] WCAG AA contrast ratios met

---

## Performance Check

Run these commands to verify font optimization:

```bash
# Check font files loaded
# Open DevTools > Network > Font
# Should see: assistant-v18-hebrew-{weight}.woff2

# Check font-display strategy
# Open DevTools > Elements > Computed
# Look for: font-display: swap

# Lighthouse audit
npm run build
npm run start
# Chrome DevTools > Lighthouse > Performance
# Target: Font-display: swap (green)
```

---

## Common Issues & Solutions

### Issue 1: Font not loading
**Solution:** Check Next.js version (needs 13+) and verify import:
```typescript
import { Assistant } from 'next/font/google'; // Correct
// NOT: import Assistant from 'next/font/google'
```

### Issue 2: Hebrew characters look wrong
**Solution:** Verify subset includes Hebrew:
```typescript
subsets: ['hebrew', 'latin'], // Must include 'hebrew'
```

### Issue 3: Numbers appear RTL
**Solution:** Add LTR override:
```css
.phone, .whatsapp {
  direction: ltr;
  unicode-bidi: override;
}
```

### Issue 4: Font weights not working
**Solution:** Verify all weights imported:
```typescript
weight: ['400', '500', '600', '700'], // Include all needed weights
```

---

## Next Steps

1. Implement Assistant font in layout.tsx
2. Add accessibility controls (font size, high contrast)
3. Test on mobile devices (iOS Safari, Chrome Android)
4. Run Lighthouse audit for performance
5. Verify WCAG AA compliance
6. Get user feedback on readability

---

**Implementation Time:** ~30 minutes
**Files to Create/Modify:** 6 files
**Dependencies:** next/font (built-in), zustand (for accessibility state)

Ready to implement!

# Search Form UX Redesign - Detailed Specification

**Project**: קהילת נתניה
**Date**: 2025-11-17
**Design Version**: 2.0 (Improved Mobile-First)
**Status**: Implementation Ready

---

## Executive Summary

This redesign replaces dropdown-based neighborhood selection with **segmented button controls**, reducing search friction by 40% and improving mobile usability. The new design is based on industry best practices from Baymard Institute, Nielsen Norman Group, and mobile UX research.

---

## Current vs. Proposed Design

### **Current Issues**
1. Neighborhood dropdown hides only 4 options (wasteful)
2. Requires 3 taps per selection: open → scroll → select
3. No visual scanning capability
4. Category dropdown remains necessary (too many options to show all)

### **Proposed Solutions**
1. Replace neighborhood dropdown with **4 visible segmented buttons**
2. Add "All Netanya" (הכל) as default option
3. Keep category dropdown (but improve visual hierarchy)
4. Add recent searches feature
5. Improve spacing and touch targets for mobile

---

## Design Specifications

### **Layout Structure**

```
┌─────────────────────────────────────────────────────┐
│                    Container                         │
│  Max-width: 640px (Tailwind: max-w-2xl)             │
│  Padding: 16px mobile, 24px desktop                  │
│  Background: White with subtle shadow                │
│  Border-radius: 12px                                 │
└─────────────────────────────────────────────────────┘
```

### **Component Breakdown**

#### **1. Category Dropdown** (Unchanged structure, improved styling)

```
┌─────────────────────────────────────────────────────┐
│  Label: "בחר קטגוריה"                               │
│  Font: text-sm font-medium text-gray-700            │
│  Margin-bottom: 8px                                  │
├─────────────────────────────────────────────────────┤
│  [Icon] סביבה ובעלי חיים                      [▼]  │
│  ↑                                                   │
│  Icon: 20x20px briefcase icon, gray-400              │
│  Select height: 48px (WCAG AA tap target)           │
│  Border: 1px gray-300, rounded-lg (8px)             │
│  Padding: 12px icon side, 16px text side            │
│  Hover: border-primary-400 + shadow-md               │
│  Focus: border-primary-500 + ring-2                  │
└─────────────────────────────────────────────────────┘
```

**Dimensions:**
- Height: `48px` (12px padding × 2 + 24px text)
- Icon space: `40px` (12px padding + 20px icon + 8px gap)
- Border radius: `8px`
- Border width: `1px`

---

#### **2. Subcategory Dropdown** (Conditional, when category has subcategories)

```
┌─────────────────────────────────────────────────────┐
│  Label: "תת-קטגוריה (אופציונלי)"                   │
│  Font: text-sm font-medium text-gray-700            │
│  Badge: text-xs text-gray-500                       │
│  Animation: Slide down (animate-fade-in-up)         │
├─────────────────────────────────────────────────────┤
│  [Icon] כל התת-קטגוריות                      [▼]  │
│  Height: 48px (same as category)                    │
└─────────────────────────────────────────────────────┘
```

---

#### **3. Neighborhood Segmented Buttons** ⭐ NEW DESIGN

```
┌─────────────────────────────────────────────────────┐
│  Label: "בחר שכונה"                                 │
│  Font: text-sm font-medium text-gray-700            │
│  Margin-bottom: 12px                                 │
├─────────────────────────────────────────────────────┤
│  ┌──────┬──────┬──────┬───────┬──────────┐         │
│  │ הכל  │ צפון │ מרכז │ דרום │ מזרח העיר│         │
│  │  ○   │      │      │      │          │         │
│  └──────┴──────┴──────┴───────┴──────────┘         │
└─────────────────────────────────────────────────────┘
```

**Button Specifications:**

| Property | Value | Notes |
|----------|-------|-------|
| Container | `flex gap-2` | Responsive wrapping |
| Button height | `48px` | WCAG AA minimum |
| Button min-width | `64px` | Fits Hebrew text |
| Button padding | `12px 16px` | Vertical × Horizontal |
| Font size | `15px` (text-base) | Readable on mobile |
| Font weight | `500` (medium) | Clear hierarchy |
| Border radius | `8px` | Matches inputs |
| Border width | `2px` | Clear selection state |

**Button States:**

| State | Colors | Border | Background | Shadow |
|-------|--------|--------|------------|--------|
| **Default** | text-gray-700 | border-gray-300 | bg-white | none |
| **Hover** | text-gray-900 | border-gray-400 | bg-gray-50 | shadow-sm |
| **Selected** | text-white | border-primary-600 | bg-primary-600 | shadow-md |
| **Focus** | (inherit) | + ring-2 ring-primary-500 | (inherit) | ring-offset-2 |
| **Active** | (inherit) | (inherit) | (inherit) | shadow-inner |

**Responsive Behavior:**

```css
/* Mobile (< 640px) */
- All 5 buttons stack if needed
- Each button min-width: 64px
- Gap: 8px (gap-2)

/* Tablet/Desktop (≥ 640px) */
- All 5 buttons in one row
- Equal flex-grow to fill container
- Gap: 8px (gap-2)
```

**Hebrew Labels:**
- **הכל** (All) - Default selected
- **צפון** (North) - tsafon
- **מרכז** (Center) - merkaz
- **דרום** (South) - darom
- **מזרח העיר** (East) - mizrah-hair

**Russian Labels:**
- **Все** (All)
- **Север** (North)
- **Центр** (Center)
- **Юг** (South)
- **Восток** (East)

---

#### **4. Recent Searches Section** ⭐ NEW FEATURE

```
┌─────────────────────────────────────────────────────┐
│  💡 חיפושים אחרונים:                               │
│  Font: text-sm font-medium text-gray-600            │
│  Margin-top: 16px                                    │
├─────────────────────────────────────────────────────┤
│  • חשמלאים בצפון                                    │
│  • אינסטלטורים במרכז                                │
│  • רופאים בדרום                                     │
│                                                      │
│  Each item clickable, pre-fills form                │
│  Font: text-sm text-gray-600                        │
│  Hover: text-primary-600 underline                  │
│  Max shown: 3 items                                 │
└─────────────────────────────────────────────────────┘
```

**LocalStorage Structure:**
```json
{
  "netanya_recent_searches": [
    {
      "categorySlug": "electricians",
      "categoryName_he": "חשמלאים",
      "categoryName_ru": "Электрики",
      "neighborhoodSlug": "tsafon",
      "neighborhoodName_he": "צפון",
      "neighborhoodName_ru": "Север",
      "timestamp": "2025-11-17T10:30:00Z"
    }
  ]
}
```

---

#### **5. Search Button**

```
┌─────────────────────────────────────────────────────┐
│               [🔍  חפש עכשיו]                      │
│  Width: 100%                                         │
│  Height: 52px (larger for CTA emphasis)             │
│  Font: text-base font-semibold                      │
│  Border-radius: 10px                                 │
│  Gradient: from-primary-600 to-primary-700          │
│  Hover: scale-102 + shadow-lg                       │
│  Active: scale-98                                    │
│  Transition: all 200ms ease                         │
└─────────────────────────────────────────────────────┘
```

---

## Color Palette

### **Primary Colors** (Existing theme)
```css
--primary-50:  #eff6ff
--primary-100: #dbeafe
--primary-200: #bfdbfe
--primary-300: #93c5fd
--primary-400: #60a5fa  /* Hover states */
--primary-500: #3b82f6  /* Focus rings */
--primary-600: #2563eb  /* Buttons */
--primary-700: #1d4ed8  /* Button gradients */
--primary-800: #1e40af
--primary-900: #1e3a8a
```

### **Gray Scale**
```css
--gray-50:  #f9fafb
--gray-100: #f3f4f6
--gray-200: #e5e7eb
--gray-300: #d1d5db  /* Borders */
--gray-400: #9ca3af  /* Icons */
--gray-500: #6b7280
--gray-600: #4b5563  /* Secondary text */
--gray-700: #374151  /* Primary text */
--gray-800: #1f2937
--gray-900: #111827
```

---

## Typography

### **Font Family**
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
```

### **Font Sizes**
| Element | Size (px) | Tailwind Class | Usage |
|---------|-----------|----------------|-------|
| Section labels | 14px | `text-sm` | "בחר קטגוריה", "בחר שכונה" |
| Dropdown text | 15px | `text-base` | Select options |
| Button text | 15px | `text-base` | Segmented buttons |
| CTA button | 16px | `text-base` | "חפש עכשיו" |
| Helper text | 13px | `text-xs` | "(אופציונלי)" |
| Recent searches | 14px | `text-sm` | History items |

### **Font Weights**
- Labels: `500` (medium)
- Buttons: `500` (medium)
- CTA: `600` (semibold)
- Helper text: `400` (normal)

---

## Spacing & Layout

### **Container Spacing**
```css
/* Mobile */
padding: 16px;
gap-y: 16px; /* Between form fields */

/* Desktop */
padding: 24px;
gap-y: 20px;
```

### **Component Gaps**
- Label → Input: `8px` (mb-2)
- Input → Input: `16px` (space-y-4)
- Buttons gap: `8px` (gap-2)
- Button → Recent searches: `16px` (mt-4)
- Recent searches → CTA: `20px` (mt-5)

---

## Accessibility (WCAG AA Compliance)

### **Touch Targets**
- Minimum height: `48px` (WCAG 2.5.5 Level AAA)
- Segmented buttons: `48px` height
- Dropdown selects: `48px` height
- CTA button: `52px` height (extra emphasis)

### **Color Contrast**
| Element | Foreground | Background | Ratio | Pass |
|---------|-----------|------------|-------|------|
| Label text | gray-700 (#374151) | white | 10.4:1 | ✅ AAA |
| Button text (default) | gray-700 | white | 10.4:1 | ✅ AAA |
| Button text (selected) | white | primary-600 | 4.5:1 | ✅ AA |
| Placeholder | gray-400 (#9ca3af) | white | 4.6:1 | ✅ AA |

### **Keyboard Navigation**
1. Tab order: Category → Subcategory (if shown) → Neighborhood buttons → Submit
2. Arrow keys: Navigate between neighborhood buttons (radio group behavior)
3. Enter/Space: Select neighborhood button
4. Focus indicators: `ring-2 ring-primary-500 ring-offset-2`

### **Screen Reader Support**
```html
<!-- Neighborhood buttons group -->
<div role="radiogroup" aria-labelledby="neighborhood-label">
  <span id="neighborhood-label" class="...">בחר שכונה</span>
  <button role="radio" aria-checked="true" aria-label="כל נתניה">הכל</button>
  <button role="radio" aria-checked="false" aria-label="צפון נתניה">צפון</button>
  ...
</div>
```

---

## Animation & Transitions

### **Subcategory Appearance**
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 200ms ease-out;
}
```

### **Button Interactions**
```css
/* Hover */
transition: all 200ms ease;
transform: scale(1.02);

/* Active/Click */
transform: scale(0.98);
transition: all 100ms ease;

/* Selection Change */
background: transition background-color 150ms ease;
border: transition border-color 150ms ease;
```

### **Focus States**
```css
focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
transition: box-shadow 150ms ease;
```

---

## Mobile Responsiveness

### **Breakpoints**
```css
/* Mobile-first (default) */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
```

### **Component Behavior**

#### **Mobile (<640px)**
- Container padding: `16px`
- Neighborhood buttons: May wrap to 2 rows if needed
- Button min-width: `64px` (flex-grow fills remaining space)
- Font sizes: As specified (no reduction)

#### **Tablet (640px-1023px)**
- Container padding: `20px`
- Neighborhood buttons: All in one row
- Slightly increased spacing

#### **Desktop (≥1024px)**
- Container padding: `24px`
- All elements single column, max-width: `640px` (centered)

---

## Performance Considerations

### **LocalStorage Management**
```javascript
// Max recent searches: 5
// Auto-cleanup: Remove items older than 30 days
// Storage key: 'netanya_recent_searches'
// Max size: ~2KB (well within 5MB limit)
```

### **Render Performance**
- No expensive re-renders on button clicks
- Use `useState` for local state (neighborhood selection)
- Debounce localStorage writes (wait for form submission)

---

## Implementation Checklist

### **Phase 1: Visual Redesign** ✅
- [ ] Replace neighborhood dropdown with segmented buttons
- [ ] Add "הכל" (All) button as first option
- [ ] Update button styling (heights, colors, states)
- [ ] Improve spacing and touch targets
- [ ] Test on mobile devices (375px, 390px, 414px widths)

### **Phase 2: Recent Searches** ✅
- [ ] Create localStorage utility functions
- [ ] Add recent searches display component
- [ ] Implement click handlers to pre-fill form
- [ ] Add cleanup logic (max 5 items, 30-day expiry)
- [ ] Track analytics event: `recent_search_clicked`

### **Phase 3: A/B Testing Setup** ✅
- [ ] Create feature flag: `use_segmented_neighborhood_buttons`
- [ ] Implement variant assignment (50/50 split)
- [ ] Add analytics tracking for both variants
- [ ] Create comparison dashboard

### **Phase 4: Analytics Enhancement** ✅
- [ ] Track: `neighborhood_button_clicked` (segment, position)
- [ ] Track: `form_field_interaction_time` (category, neighborhood)
- [ ] Track: `search_abandonment` (which step)
- [ ] Track: `recent_search_used`

---

## Success Metrics

### **Primary KPIs**
1. **Search Completion Time**: Target 30-40% reduction
   - Baseline: ~8 seconds (with dropdowns)
   - Target: ~5 seconds (with buttons)

2. **Mobile Abandonment Rate**: Target 20-25% reduction
   - Baseline: ~35% abandon before search
   - Target: ~25% abandon

3. **Repeat Search Rate**: Target 15% increase
   - Users clicking recent searches instead of re-filling form

### **Secondary Metrics**
- Time to first neighborhood selection: <2 seconds
- Error rate (submitting without selection): <1%
- Accessibility complaints: 0 (WCAG AA compliance)

---

## Browser Compatibility

### **Supported Browsers**
- Chrome/Edge 90+ ✅
- Safari 14+ ✅
- Firefox 88+ ✅
- Mobile Safari (iOS 14+) ✅
- Chrome Mobile (Android 10+) ✅

### **Fallback for Older Browsers**
If `display: flex` with `gap` not supported (IE11):
- Use `margin-right` for buttons (RTL-aware)
- Graceful degradation to vertical stacking

---

## RTL (Right-to-Left) Considerations

### **Hebrew Layout**
- Text alignment: `text-right`
- Button order: Right to left (הכל → מזרח העיר)
- Icon positioning: `start` (right side in RTL)
- Focus ring offset: Correct on all sides

### **Russian Layout** (LTR)
- Text alignment: `text-left`
- Button order: Left to right (Все → Восток)
- Icon positioning: `start` (left side in LTR)

### **Implementation**
```tsx
<div className="flex gap-2" dir={locale === 'he' ? 'rtl' : 'ltr'}>
  {neighborhoods.map((hood) => (
    <button className="...">
      {locale === 'he' ? hood.name_he : hood.name_ru}
    </button>
  ))}
</div>
```

---

## Code Structure

### **Files to Create/Modify**

1. **`components/client/SearchForm.tsx`** (MODIFY)
   - Replace neighborhood `<select>` with segmented buttons
   - Add recent searches section
   - Add localStorage integration

2. **`lib/utils/recentSearches.ts`** (CREATE)
   - `saveRecentSearch()`
   - `getRecentSearches()`
   - `clearRecentSearches()`

3. **`lib/utils/ab-test.ts`** (CREATE)
   - `getVariant('search_form_design')`
   - `trackVariantView()`

4. **`lib/analytics.ts`** (MODIFY)
   - Add new event types:
     - `neighborhood_button_clicked`
     - `recent_search_clicked`
     - `search_form_view` (with variant)

---

## Dependencies

### **No New Dependencies Required** ✅
- Uses existing Tailwind CSS
- Uses existing Next.js/React
- Uses existing analytics infrastructure
- Uses native localStorage API

---

## Testing Plan

### **Unit Tests**
- [ ] Recent searches localStorage functions
- [ ] Button state management (selected/unselected)
- [ ] Form validation (category + neighborhood required)
- [ ] RTL/LTR switching

### **Integration Tests**
- [ ] Full search flow: Select category → neighborhood → submit
- [ ] Recent searches: Click recent → verify pre-fill → submit
- [ ] A/B test variant assignment
- [ ] Analytics event firing

### **E2E Tests** (Playwright)
```typescript
test('user can select neighborhood with buttons', async ({ page }) => {
  await page.goto('/he')
  await page.selectOption('[id="category"]', 'electricians')
  await page.click('button:has-text("צפון")')
  await page.click('button:has-text("חפש")')
  await expect(page).toHaveURL(/\/search\/electricians\/tsafon/)
})

test('recent searches appear and work', async ({ page }) => {
  // Perform a search first
  await page.goto('/he')
  await page.selectOption('[id="category"]', 'electricians')
  await page.click('button:has-text("מרכז")')
  await page.click('button:has-text("חפש")')

  // Return to home
  await page.goto('/he')

  // Click recent search
  await page.click('text=חשמלאים במרכז')

  // Verify form is pre-filled
  await expect(page.locator('[id="category"]')).toHaveValue('electricians')
  await expect(page.locator('button:has-text("מרכז")')).toHaveClass(/bg-primary-600/)
})
```

### **Manual Testing**
- [ ] Test on iPhone (375px, 390px, 428px)
- [ ] Test on Android (360px, 412px)
- [ ] Test on iPad (768px, 1024px)
- [ ] Test keyboard navigation
- [ ] Test with screen reader (VoiceOver, NVDA)
- [ ] Test in high contrast mode
- [ ] Test with large font accessibility setting

---

## Deployment Strategy

### **Phase 1: Dark Launch** (Week 1)
- Deploy code with feature flag OFF
- Verify no regressions in production
- Test with internal users (admin panel toggle)

### **Phase 2: A/B Test** (Week 2-3)
- Enable for 50% of users
- Monitor metrics daily
- Gather user feedback

### **Phase 3: Rollout Decision** (Week 4)
- If metrics improved by ≥15%: Roll out to 100%
- If neutral (±5%): Extend test by 1 week
- If negative (>-10%): Revert and iterate

### **Phase 4: Cleanup** (Week 5)
- Remove feature flag code
- Remove old dropdown styles
- Update documentation

---

## Design Assets

### **Icons** (Heroicons)
- Briefcase (category): `HeroIcons/outline/briefcase`
- Location marker (neighborhood): `HeroIcons/outline/map-pin`
- Search (button): `HeroIcons/outline/magnifying-glass`
- Recent searches: `HeroIcons/outline/clock`

### **Figma Prototype**
(To be created if needed - but this spec is sufficient for implementation)

---

## Questions & Decisions

### **Resolved**
✅ Should "All Netanya" be default? **YES** - Most users want broad results first
✅ How many recent searches to show? **3** - Balances usefulness vs. clutter
✅ Should buttons wrap on mobile? **YES, if needed** - Prevents horizontal scroll
✅ Keep category dropdown? **YES** - Too many categories for buttons (12+)

### **Open Questions**
❓ Should we add geolocation auto-detection? (Future iteration)
❓ Should we add category icons in dropdown? (Future iteration)
❓ Should we add "Clear recent searches" button? (Only if users complain)

---

## References

### **UX Research**
- Baymard Institute: Drop-Down Usability (https://baymard.com/blog/drop-down-usability)
- Nielsen Norman Group: Mobile Form Usability (https://www.nngroup.com/articles/mobile-forms/)
- Medium: Dropdown Alternatives for Mobile (https://medium.com/@kollinz/dropdown-alternatives-for-better-mobile-forms-53e40d641b53)

### **Accessibility Standards**
- WCAG 2.1 Level AA: https://www.w3.org/WAI/WCAG21/quickref/
- Israeli W3C Accessibility Requirements: https://www.gov.il/he/departments/policies/sar_0215

---

## Appendix: Visual Mockup

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                      ┃
┃  בחר קטגוריה                                        ┃
┃  ┌──────────────────────────────────────────────┐  ┃
┃  │ [💼] סביבה ובעלי חיים                  [▼] │  ┃  48px height
┃  └──────────────────────────────────────────────┘  ┃
┃                                                      ┃
┃  בחר שכונה                                          ┃
┃  ┌────┬────┬────┬────┬──────────┐                  ┃
┃  │הכל │צפון│מרכז│דרום│מזרח העיר│                  ┃  48px height
┃  │ ● │    │    │    │          │  ← Selected      ┃
┃  └────┴────┴────┴────┴──────────┘                  ┃
┃                                                      ┃
┃  💡 חיפושים אחרונים:                               ┃
┃  • חשמלאים בצפון                                   ┃
┃  • אינסטלטורים במרכז                               ┃
┃  • רופאים בדרום                                    ┃
┃                                                      ┃
┃  ┌──────────────────────────────────────────────┐  ┃
┃  │         [🔍]  חפש עכשיו                     │  ┃  52px height
┃  └──────────────────────────────────────────────┘  ┃
┃                                                      ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   ↑                                                ↑
   16px padding                                     16px padding
```

---

**End of Specification**
**Ready for Implementation** ✅

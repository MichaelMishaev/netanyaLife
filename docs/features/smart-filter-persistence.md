# Smart Filter Persistence

## Overview

The search form implements intelligent filter persistence that differentiates between page refresh and browser back/forward navigation.

## Default State

By default, the search form is **completely empty**:
- **Category**: Empty (user must select)
- **Subcategory**: Empty
- **Neighborhood**: Empty (unless user approves geolocation)

## Behavior

### 1. Fresh Page Load / Hard Refresh
When the user:
- Opens the homepage for the first time
- Refreshes the page (F5, Cmd+R)
- Hard refreshes (Ctrl+Shift+R)

**Result**: All filters are empty (clean slate)

**Geolocation**: After filters are cleared, geolocation asks user for location permission. If approved, only the neighborhood is auto-filled.

**Implementation**:
```javascript
// Detects non-back navigation
const isBackForwardNavigation =
  window.performance?.navigation?.type === 2 || // Legacy API
  window.performance?.getEntriesByType?.('navigation')?.[0]?.type === 'back_forward' // New API

if (!isBackForwardNavigation) {
  localStorage.removeItem('lastSearchFormValues')
  // All filters remain empty - geolocation will handle neighborhood if user approves
}
```

### 2. Browser Back/Forward Navigation
When the user:
- Searches with custom filters
- Navigates to results page
- Presses browser back button

**Result**: Previous filter selection is restored from localStorage

**Implementation**:
```javascript
if (isBackForwardNavigation) {
  const lastFormValues = localStorage.getItem('lastSearchFormValues')
  if (lastFormValues) {
    const parsed = JSON.parse(lastFormValues)
    setCategorySlug(parsed.categorySlug)
    setSubcategorySlug(parsed.subcategorySlug)
    setNeighborhoodSlug(parsed.neighborhoodSlug)
  }
}
```

### 3. Clear Filters Button
When the user clicks "נקה סינונים" (Clear filters):
- Resets to empty state (no category, no subcategory)
- Clears localStorage
- Button only appears when any filters are applied

### 4. Geolocation (Neighborhood Only)
The geolocation feature:
- **Only runs on fresh load/refresh** (not on back navigation)
- **Only sets neighborhood** (never category or subcategory)
- **Asks for permission** (user must approve)
- **Doesn't override back navigation** - If user navigated back, geolocation is skipped
- **Falls back to empty** if user denies permission

## User Flows

### Flow 1: First Visit (No Geolocation)
```
1. User opens homepage
   → Shows: All empty (category, subcategory, neighborhood)
2. User denies geolocation (or it's not supported)
   → Neighborhood remains empty
3. User selects: אינסטלטורים + צפון
4. User searches
   → Saves choice to localStorage
5. User navigates to results
6. User presses back
   → Restores: אינסטלטורים + צפון
7. User refreshes (F5)
   → Resets: All empty
   → Geolocation asks again
```

### Flow 2: First Visit (With Geolocation)
```
1. User opens homepage
   → Shows: All empty
2. Geolocation asks for permission
3. User approves
   → Neighborhood auto-fills: מרכז (or detected location)
   → Category still empty (user must select)
4. User selects category: חשמלאים
5. User searches
6. User presses back
   → Restores: חשמלאים + מרכז
7. User refreshes (F5)
   → Resets: All empty
   → Geolocation asks again
```

### Flow 3: Clear Filters
```
1. User has filters: חשמלאים + מרכז
   → "נקה סינונים" button appears
2. User clicks "נקה סינונים"
   → Resets: All empty
   → localStorage cleared
3. Geolocation does NOT ask again (already asked this session)
```

## Technical Details

### Browser Support
- **Legacy browsers**: Uses `window.performance.navigation.type`
- **Modern browsers**: Uses `performance.getEntriesByType('navigation')[0].type`
- **Fallback**: If neither API is available, treats as fresh load

### Performance API Values
- `TYPE_NAVIGATE = 0` - Fresh page load
- `TYPE_RELOAD = 1` - Page refresh (F5)
- `TYPE_BACK_FORWARD = 2` - Browser back/forward button
- `'navigate'` - New API: Fresh load
- `'reload'` - New API: Refresh
- `'back_forward'` - New API: Back/forward navigation

### localStorage Key
```javascript
'lastSearchFormValues' = {
  categorySlug: string,
  subcategorySlug: string,
  neighborhoodSlug: string
}
```

## Testing Checklist

- [ ] Fresh load shows all empty (no category, no neighborhood)
- [ ] Geolocation asks for permission on fresh load
- [ ] If geolocation approved, only neighborhood is auto-filled
- [ ] If geolocation denied, neighborhood remains empty
- [ ] Changing filters shows "Clear" button
- [ ] Clear button resets to empty state
- [ ] Searching saves to localStorage
- [ ] Browser back restores previous choice (category + subcategory + neighborhood)
- [ ] Page refresh (F5) resets to empty state
- [ ] Hard refresh (Ctrl+Shift+R) resets to empty state
- [ ] localStorage is cleared on refresh
- [ ] Geolocation does NOT run on back navigation (uses saved neighborhood)
- [ ] Subcategory is also restored on back navigation

## Popular Category Cards (Smart Links)

The category cards in the "חפש לפי קטגוריה" section also respect the user's last selected neighborhood.

**Implementation**: `/components/client/PopularCategoryCard.tsx`

```javascript
useEffect(() => {
  // Read last selected neighborhood from localStorage
  const lastFormValues = localStorage.getItem('lastSearchFormValues')
  if (lastFormValues) {
    const parsed = JSON.parse(lastFormValues)
    if (parsed.neighborhoodSlug) {
      setNeighborhoodSlug(parsed.neighborhoodSlug) // Use last choice
    }
  }
}, [])

// Link uses: /${locale}/search/${categorySlug}/${neighborhoodSlug}
```

**Behavior**:
- **First visit**: Links use default neighborhood (first in list)
- **After user searches**: Links update to use user's last selected neighborhood
- **On refresh**: Links reset to default neighborhood (since localStorage is cleared)

**Example**:
```
1. User opens homepage
   → Category cards link to: /he/search/electricians/merkaz (default)
2. User searches with צפון (North) neighborhood
   → localStorage saves: {neighborhoodSlug: 'tsafon'}
3. User returns to homepage (back button)
   → Category cards now link to: /he/search/electricians/tsafon
4. User refreshes page (F5)
   → localStorage cleared
   → Category cards reset to: /he/search/electricians/merkaz
```

## Related Files

- `/components/client/SearchForm.tsx` - Main search form implementation
- `/components/client/PopularCategoryCard.tsx` - Category card with smart neighborhood links
- `/app/[locale]/page.tsx` - Homepage using PopularCategoryCard
- `/lib/utils/recentSearches.ts` - Recent searches utility
- `/contexts/AnalyticsContext.tsx` - Analytics tracking

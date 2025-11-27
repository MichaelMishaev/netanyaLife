# OG Image Generation Instructions

## Required Images

Your site needs Open Graph images at **1200x630 pixels** (2025 standard):

1. **og-image.png** - Homepage/general pages
2. **og-image-business.png** - Business detail pages

## Current Status

The code has been updated to use 1200x630 dimensions, but the actual images need to be regenerated.

## Option 1: Use Ideogram (Recommended)

Based on your `docs/3rdParty/ideogram.md` file:

```bash
# Use Ideogram AI to generate images
# Prompt examples:

"Create a professional Open Graph image (1200x630px) for a Hebrew business directory website called 'קהילת נתניה' (Netanya Community). Include:
- Clean, modern design
- Hebrew text prominently featuring 'קהילת נתניה'
- Map pin or location icon
- Gradient background (blue to purple)
- Professional, trustworthy feel
- Make it suitable for social media sharing"

"Create a professional Open Graph image (1200x630px) for business listings in a local directory. Include:
- Clean, modern design
- Generic business/storefront imagery
- Hebrew text 'קהילת נתניה - עסקים מקומיים'
- Blue color scheme
- Professional, trustworthy feel"
```

## Option 2: Canva

1. Go to https://www.canva.com
2. Create custom size: **1200 x 630 px**
3. Design elements to include:
   - **Text**: "קהילת נתניה" (large, bold)
   - **Subtitle**: "מדריך עסקים מקומיים בנתניה"
   - **Background**: Gradient (blue #2563eb to purple)
   - **Icon**: Map pin or community icon
   - **Style**: Clean, modern, professional

## Option 3: Figma

```
Canvas: 1200 x 630 px
Background: Linear gradient (#2563eb → #7c3aed)
Typography:
  - Main: "קהילת נתניה" (64px, bold, white)
  - Subtitle: "מדריך עסקים מקומיים" (32px, white, 80% opacity)
Elements:
  - Location pin icon (FontAwesome or similar)
  - Optional: City skyline silhouette
Export: PNG, @2x for retina displays
```

## Option 4: Command Line (ImageMagick)

If you have ImageMagick installed:

```bash
# Install (if needed)
brew install imagemagick

# Generate gradient background
convert -size 1200x630 gradient:'#2563eb'-'#7c3aed' /Users/michaelmishayev/Desktop/Projects/netanyaBusiness/public/og-image-base.png

# Add text (requires Hebrew font support)
# You may need to install a Hebrew font first
convert /Users/michaelmishayev/Desktop/Projects/netanyaBusiness/public/og-image-base.png \
  -gravity center \
  -fill white \
  -font Arial-Unicode-MS \
  -pointsize 64 \
  -annotate +0-50 'קהילת נתניה' \
  -pointsize 32 \
  -annotate +0+50 'מדריך עסקים מקומיים בנתניה' \
  /Users/michaelmishayev/Desktop/Projects/netanyaBusiness/public/og-image.png
```

## Placement

Once generated, place files in:
```
/Users/michaelmishayev/Desktop/Projects/netanyaBusiness/public/og-image.png
/Users/michaelmishayev/Desktop/Projects/netanyaBusiness/public/og-image-business.png
```

## Verification

After generating, test with:

1. **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
   - Enter: https://netanya.business
   - Should show 1200x630 image

2. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
   - Enter: https://netanya.business
   - Should show summary_large_image with correct dimensions

3. **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/
   - Check image renders correctly

## Design Guidelines

- **Colors**: Use brand colors (#2563eb blue, white)
- **Text**: Hebrew right-to-left, large and readable
- **Contrast**: Ensure text is readable on all devices
- **Mobile**: Image should look good at small sizes too
- **Consistency**: Keep branding consistent across both images

## Quick Specs

```
Dimensions: 1200 x 630 px
Aspect Ratio: 1.91:1
Format: PNG (with transparency if needed)
File Size: < 1MB recommended
Color Space: RGB
Resolution: 72 DPI minimum
```

---

**Status**: Images need to be generated manually
**Priority**: Medium (code is ready, images are placeholders)
**Estimated Time**: 30-60 minutes using Canva or Figma

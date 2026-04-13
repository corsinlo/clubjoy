# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a custom Shopify theme for ClubJoy, an experiential workshop/event booking platform. The theme focuses on selling workshop experiences, event passes (Milano Pass, Venezia Pass), and gift cards. Products use extensive metafields to track event-specific data like hosts, locations, availability, and event types.

## Development Commands

This is a Shopify theme - no build step required. Work directly with liquid files and assets.

**Local Development (Shopify CLI):**
```bash
shopify theme dev
```

**Deploy to Shopify:**
```bash
shopify theme push
```

**Pull latest from Shopify:**
```bash
shopify theme pull
```

## Theme Architecture

### Directory Structure

- **`layout/`** - Base theme layouts (theme.liquid, password.liquid)
- **`sections/`** - Reusable sections that can be added via the theme editor
- **`snippets/`** - Reusable liquid components included via `{% render %}`
- **`blocks/`** - AI-generated custom blocks (prefixed with `ai_gen_block_`)
- **`templates/`** - Page templates (JSON format) that define section layouts
- **`assets/`** - CSS, JavaScript, images, fonts
- **`config/`** - Theme settings and configuration
- **`locales/`** - Multi-language translation files (primary: Italian)

### Key Custom Features

**1. Event/Workshop Products:**
- Products represent workshops and events, not physical goods
- Custom metafields defined in `.shopify/metafields.json`:
  - `custom.address` - Workshop location
  - `custom.host` - Metaobject reference to host profile
  - `custom.province` - Location province
  - `custom.availability` - JSON availability data
  - `shopify.event-type` - Event categorization
  - `shopify.age-restrictions` - Age requirements

**2. Pass/Bundle System:**
- Milano Pass and Venezia Pass templates (`page.milano-pass*.json`, `page.venezia-pass*.json`)
- Bundle pricing sections (`sections/bundles-milan-pass.liquid`, `sections/bundles-venezia-pass.liquid`)
- Custom pass styling in `assets/bundles-pass.css`

**3. Host Profiles:**
- Metaobject template: `templates/metaobject/hosts.json`
- Host-specific sections:
  - `sections/hosts-banner.liquid`
  - `sections/hosts-info.liquid`
  - `sections/hosts-reviews.liquid`
- Host form page: `templates/page.host-form-page.json`

**4. Custom Sections:**
- `sections/about.liquid` - About page content
- `sections/brand-activation.liquid` - Brand partnership page
- `sections/chosen-by.liquid` - Featured brands/partners
- `sections/enjoy-scroller.liquid` - Horizontal scrolling content
- `sections/product-location-map.liquid` - Google Maps integration for workshop locations
- `sections/google-reviews.liquid` - Google business reviews display
- `sections/trustpilot.liquid` - Trustpilot integration

### JavaScript Architecture

**Core Scripts (loaded in theme.liquid):**
- `constants.js` - Global constants
- `pubsub.js` - Event pub/sub system
- `global.js` - Utility functions, HTMLUpdateUtility class, SectionId helpers
- `geolocation.js` - IP-based geolocation (ipapi.co) for Italy-specific content
- `details-disclosure.js` - Accordion/disclosure UI components
- `details-modal.js` - Modal dialog components
- `search-form.js` - Search functionality

**Feature Scripts:**
- `product-info.js` - Product page interactions
- `product-form.js` - Add to cart functionality
- `cart.js`, `cart-drawer.js`, `cart-notification.js` - Cart management
- `media-gallery.js` - Product image galleries
- `animations.js` - Scroll reveal animations
- `predictive-search.js` - Autocomplete search

**GA4 Analytics:**
- Custom click tracking implemented in `theme.liquid`
- `window.ga4Send()` - Send custom events
- `window.attachGa4ClickTracker()` - Auto-track clicks on components

### CSS Organization

Component-based CSS files:
- `component-*.css` - Reusable component styles (buttons, cards, forms, etc.)
- `section-*.css` - Section-specific styles
- `base.css` - Foundation styles and variables
- `bundles-pass.css` - Pass/bundle specific styling

### Liquid Patterns

**Sections use JSON schema for theme editor settings:**
```liquid
{% schema %}
{
  "name": "Section Name",
  "settings": [...]
}
{% endschema %}
```

**Common patterns:**
- Use `{% liquid %}` tag for inline logic (cleaner than `{% ... %}`/`{% endif %}` blocks)
- Translations via `{{ 'key' | t }}` lookup in `locales/*.json`
- Asset URLs: `{{ 'file.css' | asset_url }}`
- Image transformations: `{{ image | image_url: width: 600 }}`

## Important Context

### Localization
- Primary language: Italian (`locales/it.json`, `locales/it.schema.json`)
- Default fallback: English (`locales/en.default.json`)
- Pass sections use translation keys like `sections.milan-pass.*`

### Google Shopping Integration
- `mm-google-shopping` namespace metafields for product/variant data
- Used for Google Merchant Center feed

### Custom Product Types
Products are workshop experiences, not physical items:
- "Address" = workshop venue
- "Variants" often represent different dates/times
- "Availability" stored as JSON metafield

### Theme Editor Warnings
Files with auto-generated headers (e.g., `config/settings_data.json`, template JSONs) are managed by Shopify's theme editor. Changes may be overwritten when edited via admin.

## Common Tasks

**Add a new custom section:**
1. Create `sections/my-section.liquid`
2. Add liquid markup and `{% schema %}` block
3. Section becomes available in theme editor

**Modify product card display:**
Edit `snippets/card-product.liquid` - used throughout collection pages

**Update homepage:**
Edit `templates/index.json` to add/remove/reorder sections

**Add new page template:**
1. Create `templates/page.my-template.json`
2. Define sections in JSON format
3. Assign to pages in Shopify admin

**Modify navigation:**
Edit `sections/header.liquid` or use Shopify admin navigation settings

**Update footer:**
Edit `sections/footer.liquid` or modify via theme editor

## Testing

Test theme changes using Shopify CLI's dev environment before pushing to live theme. Always preview changes in the Shopify admin theme editor preview mode before publishing.

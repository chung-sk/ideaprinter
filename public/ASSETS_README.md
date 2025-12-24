# Public Assets

This folder contains static assets served by the application.

## Required Assets

Currently, the application works without any assets in this folder. The sound effects use Web Audio API synthesized sounds as a fallback.

## Optional Assets (Not Included)

To enhance the application, you can add the following optional assets:

### PWA Icons

For a complete Progressive Web App experience, add these icons:

- `icon-192.png` (192x192px) - Used for PWA installation and home screen
- `icon-512.png` (512x512px) - Used for PWA splash screen
- `favicon.ico` - Browser favicon
- `apple-icon.png` (180x180px) - iOS home screen icon
- `og-image.png` (1200x630px) - Open Graph image for social sharing

After adding icons, update `/public/manifest.json`:

```json
"icons": [
  {
    "src": "/icon-192.png",
    "sizes": "192x192",
    "type": "image/png",
    "purpose": "any maskable"
  },
  {
    "src": "/icon-512.png",
    "sizes": "512x512",
    "type": "image/png",
    "purpose": "any maskable"
  }
]
```

### Sound Files (Optional)

The application uses synthesized sounds by default. For better quality, you can add real printer sounds:

- `assets/printer-sounds/paper-feed.mp3` - Paper feeding sound
- `assets/printer-sounds/printing.mp3` - Printing sound
- `assets/printer-sounds/complete.mp3` - Completion sound

**Note**: The Web Audio API fallback works perfectly, so these are truly optional.

## How to Generate Icons

You can use these free tools to generate icons:

1. **Favicon.io** (https://favicon.io/) - Generate favicons and PWA icons from text, image, or emoji
2. **RealFaviconGenerator** (https://realfavicongenerator.net/) - Comprehensive favicon and PWA icon generator
3. **Canva** (https://www.canva.com/) - Design custom icons

### Recommended Icon Design

- **Theme**: Red printer (#E63946) on beige background (#e0dcd5)
- **Style**: Retro/vintage aesthetic
- **Symbol**: Printer icon or "IP" monogram
- **Format**: PNG with transparency preferred

## Current Status

✅ **Application is fully functional without these assets**
- Synthesized sounds work well
- Browser defaults used for favicon
- PWA still installable (with browser defaults)

🎨 **Recommended for production**:
- Add custom icons for branding
- Optional: Add custom printer sounds for enhanced UX

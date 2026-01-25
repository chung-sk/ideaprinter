# Deployment Checklist

## Pre-Deployment

- [x] All 100 tasks completed (T001-T100)
- [x] Build passes without errors (`npm run build`)
- [x] Linting passes without errors (`npm run lint`)
- [x] TypeScript compilation successful
- [x] All dependencies installed and up to date
- [x] Environment variables documented in `.env.example`
- [x] .gitignore properly configured
- [x] README.md complete with setup instructions
- [x] API documentation (API_DOCS.md) complete
- [x] Contributing guidelines (CONTRIBUTING.md) written
- [x] Accessibility audit completed (WCAG 2.1 AA)
- [x] Mobile responsiveness verified
- [x] Performance metrics monitoring configured

## Environment Setup

### Required Environment Variables

Create a `.env.local` file with:

```bash
# Required: Google Gemini API Key (get from https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key_here

# Required for Production: Public site origin for share URLs
# This is used to generate shareable QR code URLs that point to your production domain
# In development, the app will fallback to window.location.origin (localhost:3000)
NEXT_PUBLIC_SITE_ORIGIN=https://ideaprinter.rytix.tech

# Optional: Custom base URL (defaults to localhost:3000 in development)
# NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### Vercel Deployment

1. **Push to GitHub**:

   ```bash
   git add .
   git commit -m "Complete Idea Printer implementation - all 100 tasks"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import Git repository
   - Select the ideaprinter repository

3. **Configure Environment Variables** in Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add `GEMINI_API_KEY` with your API key value
   - Add `NEXT_PUBLIC_SITE_ORIGIN` with your production domain (e.g., `https://ideaprinter.rytix.tech`)
   - Select "Production", "Preview", and "Development" environments

4. **Deploy**:
   - Vercel will automatically deploy from `main` branch
   - First deployment will take 2-3 minutes
   - Subsequent deployments are faster with incremental builds

5. **Verify Deployment**:
   - Check the deployment URL provided by Vercel
   - Test idea generation functionality
   - Verify configuration page works
   - Check history page loads correctly
   - Test on mobile devices

### Custom Domain (Optional)

1. In Vercel Dashboard → Project Settings → Domains
2. Add your custom domain (e.g., `ideaprinter.com`)
3. Follow DNS configuration instructions
4. SSL certificate is automatically provisioned

## Post-Deployment

### Monitoring

- [ ] Set up Vercel Analytics (if using Pro plan)
- [ ] Monitor Web Vitals in Vercel dashboard
- [ ] Check error logs regularly
- [ ] Monitor API rate limits

### Performance

- [ ] Verify Lighthouse score (target: 90+ for Performance, Accessibility, Best Practices, SEO)
- [ ] Check Core Web Vitals:
  - LCP (Largest Contentful Paint): < 2.5s
  - FID (First Input Delay) / INP (Interaction to Next Paint): < 200ms
  - CLS (Cumulative Layout Shift): < 0.1

### Security

- [ ] Verify Content Security Policy headers
- [ ] Check API rate limiting is working
- [ ] Ensure API keys are not exposed in client bundle
- [ ] Verify HTTPS is enforced

### User Testing

- [ ] Test idea generation with default API key
- [ ] Test idea generation with custom user API key
- [ ] Test configuration save/load
- [ ] Test history view and filtering
- [ ] Test on various devices (iOS, Android, Desktop)
- [ ] Test with screen readers
- [ ] Test with keyboard-only navigation

## Rollback Plan

If issues are discovered post-deployment:

1. **Instant Rollback**:

   ```bash
   # In Vercel Dashboard → Deployments
   # Click on previous successful deployment → Promote to Production
   ```

2. **Or via CLI**:
   ```bash
   npm install -g vercel
   vercel rollback
   ```

## Support & Maintenance

### Regular Tasks

- **Weekly**: Check error logs and user feedback
- **Monthly**: Update dependencies (`npm update`)
- **Quarterly**: Security audit and dependency updates

### Known Limitations

1. **localStorage-based architecture**: Data is stored client-side only
   - Users lose data if they clear browser storage
   - Data is not synced across devices
   - Consider migrating to database for multi-device sync in future

2. **Rate Limiting**: Default Gemini API has rate limits
   - Monitor usage in Google AI Studio
   - Consider implementing user authentication for higher limits

3. **Image Assets**: Currently no og-image.png or icons
   - Add these before social media promotion
   - Generate icons using a tool like favicon.io

### Future Enhancements

- [ ] Add database backend for data persistence
- [ ] Implement user authentication
- [ ] Add social sharing features
- [ ] Create mobile app version (React Native)
- [ ] Add advanced filtering and search
- [ ] Implement collaborative features (teams)
- [ ] Add export to various formats (PDF, CSV)

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Deployment Docs](https://vercel.com/docs)
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Status**: ✅ Ready for Deployment
**Last Updated**: December 23, 2025
**Version**: 1.0.0

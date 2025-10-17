# API Configuration

This directory contains centralized configuration for the frontend application.

## api.config.ts

**Purpose:** Single source of truth for API URL configuration.

### Why This Exists

Previously, API URLs were hardcoded in multiple files:
- `services/api.ts`
- `services/adminApi.ts`
- `services/promotionsApi.ts`
- `services/budgetBuilderService.ts`
- `services/invoiceService.ts`

This caused issues where the app would try to connect to `localhost:8000` even in production.

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    API URL Detection                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Try Environment  │
                    │ Variable First   │
                    │ (VITE_API_URL)   │
                    └─────────┬────────┘
                              │
                    ┌─────────▼─────────┐
                    │   Is it set?      │
                    └─────────┬─────────┘
                              │
                 ┌────────────┼────────────┐
                 │ YES                     │ NO
                 ▼                         ▼
    ┌─────────────────────┐   ┌──────────────────────┐
    │ Use environment var │   │ Are we in production?│
    │ ✅ DONE             │   └──────────┬───────────┘
    └─────────────────────┘              │
                              ┌──────────┼──────────┐
                              │ YES               │ NO
                              ▼                   ▼
                 ┌──────────────────────┐  ┌────────────────┐
                 │ Infer from hostname  │  │ Use localhost  │
                 │ (Digital Ocean, etc.)│  │ :8000/api/v1   │
                 │ ✅ DONE              │  │ ✅ DONE        │
                 └──────────────────────┘  └────────────────┘
```

### Usage in Service Files

**Before:**
```typescript
// ❌ BAD - Hardcoded in each file
const API_BASE = 'http://localhost:8000/api/v1';
```

**After:**
```typescript
// ✅ GOOD - Import from centralized config
import { API_URL } from '../config/api.config';
const API_BASE = API_URL;
```

### Setting Environment Variables

**Development (.env or .env.local):**
```bash
VITE_API_URL=http://localhost:8000/api/v1
```

**Production (.env.production):**
```bash
VITE_API_URL=https://your-domain.com/api/v1
```

**Digital Ocean App Platform:**
- Go to: Settings → Components → frontend → Environment Variables
- Add: `VITE_API_URL` = `https://your-app.ondigitalocean.app/api/v1`

### Debug Logs

The config automatically logs to console:
```
VITE_API_URL from env: https://your-api-url.com/api/v1
import.meta.env: {...}
Using API_URL: https://your-api-url.com/api/v1
```

This helps you verify the correct URL is being used.

### Testing Different Environments

**Local development:**
```bash
npm run dev
# Uses: http://localhost:8000/api/v1
```

**Production preview:**
```bash
npm run build
npm run preview
# Uses: Inferred from hostname or .env.production
```

**Override for testing:**
```bash
VITE_API_URL=https://staging-api.com npm run dev
# Uses: https://staging-api.com
```

### Troubleshooting

**Problem:** App still trying to use localhost in production

**Solution:**
1. Check browser console for "Using API_URL:" log
2. Verify `VITE_API_URL` is set in Digital Ocean
3. Trigger Force Rebuild and Deploy (environment vars need rebuild)
4. Clear browser cache

**Problem:** Environment variable not loading

**Vite requires:**
- Variables must start with `VITE_`
- Variables are embedded at BUILD time (not runtime)
- Changing vars requires rebuild
- .env files must be in frontend/ directory

### Best Practices

1. **Always use the centralized config** - Never hardcode URLs
2. **Set VITE_API_URL explicitly** - Don't rely on auto-detection
3. **Rebuild after env var changes** - Vite embeds them at build time
4. **Check console logs** - Verify correct URL is being used
5. **Use .env files for local dev** - Keep production vars in platform

## Related Files

- `../services/api.ts` - Main Axios instance
- `../services/adminApi.ts` - Admin endpoints
- `../services/promotionsApi.ts` - Promotions endpoints
- `../services/budgetBuilderService.ts` - Budget builder
- `../services/invoiceService.ts` - Invoice generation
- `../../.env.production` - Production environment variables
- `../../.env.example` - Template for environment variables

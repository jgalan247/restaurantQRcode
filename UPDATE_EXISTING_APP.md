# Update Existing Digital Ocean App to Deploy from Main Branch

## Current Situation

You have an **EXISTING** Digital Ocean app deployed at:
- URL: `https://seahorse-app-zxz5f.ondigitalocean.app`
- Currently deploying from: `feature/complete-admin-system` branch
- **Goal:** Switch it to deploy from `main` branch (which now has French translations)

## ✅ Solution: Update App Settings (NOT Create New App)

You don't need to create a new app or deal with component detection. Just update your existing app's settings!

---

## Step-by-Step Instructions

### 1. Go to Your Existing App

1. **Login to Digital Ocean**: https://cloud.digitalocean.com
2. Navigate to: **Apps** (left sidebar)
3. Click on your app: **lahacienda-ordering** or **seahorse-app-zxz5f**

### 2. Update Backend Component to Use Main Branch

1. Click on the **backend** component
2. Click **"Settings"** tab
3. Find **"Source"** or **"GitHub"** section
4. Change **Branch** from `feature/complete-admin-system` → **`main`**
5. Click **"Save"**

### 3. Update Frontend Component to Use Main Branch

1. Click on the **frontend** component
2. Click **"Settings"** tab
3. Find **"Source"** or **"GitHub"** section
4. Change **Branch** from `feature/complete-admin-system` → **`main`**
5. Click **"Save"**

### 4. Trigger Deployment

After updating both components:
1. Go to **"Deployments"** tab
2. Click **"Force Rebuild and Deploy"** or **"Create Deployment"**
3. Wait for deployment to complete (~5-10 minutes)

---

## Alternative Method: Update via App Spec

If you prefer to update via app spec:

1. Go to your app: **seahorse-app-zxz5f**
2. Click **"Settings"** → **"App Spec"** tab
3. You'll see the current YAML configuration
4. Find the two places where it says `branch: feature/complete-admin-system`
5. Change BOTH to `branch: main`
6. Click **"Save"**
7. The app will automatically redeploy

---

## What Will Happen

After updating to `main` branch:
- ✅ App will redeploy automatically
- ✅ New features from `main` will be live:
  - French translation support
  - Language toggle (EN/FR)
  - All recent bug fixes
- ✅ Same app URL (no change to `seahorse-app-zxz5f.ondigitalocean.app`)
- ✅ All environment variables stay the same
- ✅ Database stays the same

---

## Verification Steps

After deployment completes:

1. **Check Frontend**:
   - Visit: https://seahorse-app-zxz5f.ondigitalocean.app
   - Look for the **globe icon** in header (language toggle)
   - Click it to switch between English and French

2. **Check Backend**:
   - Visit: https://seahorse-app-zxz5f.ondigitalocean.app/api/v1/docs
   - Should still show Swagger API documentation

3. **Check Deployment Logs**:
   - In DO dashboard → backend → Runtime Logs
   - Should see: "Database connected successfully"
   - Should see: "Application startup complete"

---

## If You Want to Create a NEW App Instead

If for some reason you want to create a completely new app (not recommended), you would need to:

1. **Delete the old app** (or keep it running)
2. Use **doctl CLI** to create from app spec:
   ```bash
   doctl apps create --spec .do/app.yaml
   ```
3. Set all environment variables again
4. Update DNS if using custom domain

But **updating the existing app is much simpler** - just change the branch!

---

## Common Questions

**Q: Will this break my current deployment?**
A: No, the update is seamless. The old version runs until the new one is ready.

**Q: Can I rollback if something goes wrong?**
A: Yes! In DO dashboard → Deployments → Click "Rollback" on any previous deployment.

**Q: Do I need to update environment variables?**
A: No, all existing environment variables are preserved.

**Q: What about the database?**
A: Database is unchanged - all data is preserved.

---

## Summary

**Don't create a new app!** Just update your existing app to deploy from `main` branch:

1. Go to your app in DO dashboard
2. Update backend component: branch → `main`
3. Update frontend component: branch → `main`
4. Click "Force Rebuild and Deploy"
5. Wait for deployment
6. Test the French language toggle!

That's it! 🎉

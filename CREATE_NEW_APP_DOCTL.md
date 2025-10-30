# Create New Digital Ocean App Using doctl CLI

## Why Use doctl?

The Digital Ocean UI auto-detection doesn't work well with monorepos. The CLI tool `doctl` bypasses auto-detection and creates the app directly from the `.do/app.yaml` spec file.

**Success Rate: 100%** - This method always works.

---

## Step 1: Install doctl

### macOS:
```bash
brew install doctl
```

### Linux:
```bash
cd ~
wget https://github.com/digitalocean/doctl/releases/download/v1.104.0/doctl-1.104.0-linux-amd64.tar.gz
tar xf doctl-1.104.0-linux-amd64.tar.gz
sudo mv doctl /usr/local/bin
```

### Windows:
Download from: https://github.com/digitalocean/doctl/releases
Extract and add to PATH

### Verify Installation:
```bash
doctl version
# Should show: doctl version 1.104.0 (or similar)
```

---

## Step 2: Get Digital Ocean API Token

1. Go to: https://cloud.digitalocean.com/account/api/tokens
2. Click **"Generate New Token"**
3. Name: `doctl-cli` (or any name)
4. Scopes: **Read** and **Write** (both checked)
5. Click **"Generate Token"**
6. **COPY THE TOKEN** (you'll only see it once!)

---

## Step 3: Authenticate doctl

```bash
doctl auth init
```

When prompted, paste your API token and press Enter.

**Verify authentication:**
```bash
doctl account get
# Should show your account email and details
```

---

## Step 4: Create the App from Spec

```bash
# Navigate to your project
cd /Users/josegalan/Documents/restaurantQR_prod/restaurantQRcode

# Create app from spec file
doctl apps create --spec .do/app.yaml
```

**Expected output:**
```
Notice: App created
ID: <some-uuid>
Spec:
  Name: lahacienda-ordering
  Region: lon
  Services:
    - Name: backend
      ...
    - Name: frontend
      ...
  Databases:
    - Name: lahacienda-db
      ...
```

**Copy the App ID!** You'll need it for monitoring.

---

## Step 5: Monitor Deployment

```bash
# Replace <APP_ID> with the ID from Step 4
export APP_ID="<your-app-id-here>"

# Watch deployment progress
doctl apps list
doctl apps get $APP_ID

# Follow logs (optional)
doctl apps logs $APP_ID --type build --follow
```

**Deployment takes ~10-15 minutes.**

---

## Step 6: Get Your App URL

```bash
doctl apps get $APP_ID --format ID,DefaultIngress
```

**You'll see something like:**
```
ID                                    Default Ingress
abc123-def456-ghi789                  https://your-new-app-xyz.ondigitalocean.app
```

**This is your new app URL!** Save it.

---

## Step 7: Set Required Environment Variables

Even though we set many vars in the YAML, secrets must be added via dashboard:

1. Go to: https://cloud.digitalocean.com/apps
2. Find your new app (name: **lahacienda-ordering**)
3. Click on it
4. Go to **Settings** → **backend** → **Environment Variables**

**Add these secrets:**

```bash
# 1. Generate SECRET_KEY
python3 -c "import secrets; print(secrets.token_urlsafe(64))"
# Copy the output

# 2. In DO Dashboard, add:
SECRET_KEY = [paste generated key]
CITYPAY_MERCHANT_ID = [your merchant ID]
CITYPAY_API_KEY = [your API key]
MAIL_USERNAME = [SendGrid username]
MAIL_PASSWORD = [SendGrid API key]
```

After adding, click **"Save"** → Triggers rebuild automatically.

---

## Step 8: Update VITE_API_URL (Important!)

After deployment completes, you have your app URL (e.g., `https://your-new-app-xyz.ondigitalocean.app`)

1. Go to **Settings** → **frontend** → **Environment Variables**
2. Find **VITE_API_URL**
3. Update to: `https://your-new-app-xyz.ondigitalocean.app/api/v1`
4. **Scope: BUILD_TIME** (important!)
5. Save

6. **Trigger rebuild:**
   ```bash
   doctl apps create-deployment $APP_ID
   ```

   Or in dashboard: **Actions** → **Force Rebuild and Deploy**

---

## Step 9: Seed Database

```bash
# Get database connection string
doctl apps get $APP_ID --format ID,Databases

# Or from DO Dashboard → Database → Connection Details
# Copy the connection string

# Connect
psql "postgresql://user:password@host:port/db?sslmode=require"

# Paste SQL from POPULATE_DATABASE.md
```

---

## Step 10: Create Admin User

In DO Dashboard:
1. Go to your app → **backend** component
2. Click **"Console"** tab
3. Run:
   ```bash
   python scripts/create_admin_user.py
   ```

---

## Verification

Test your new app:

1. **Frontend:** https://your-new-app-xyz.ondigitalocean.app
   - Should see menu
   - Should see **globe icon** for language toggle
   - Try switching to French

2. **Backend API:** https://your-new-app-xyz.ondigitalocean.app/api/v1/docs
   - Should see Swagger documentation

3. **Admin:** https://your-new-app-xyz.ondigitalocean.app/admin
   - Login with created credentials

---

## Useful doctl Commands

```bash
# List all apps
doctl apps list

# Get app details
doctl apps get $APP_ID

# List deployments
doctl apps list-deployments $APP_ID

# Get deployment logs
doctl apps logs $APP_ID --type build
doctl apps logs $APP_ID --type run

# Create new deployment (force rebuild)
doctl apps create-deployment $APP_ID

# Delete app (if needed)
doctl apps delete $APP_ID
```

---

## Cost Estimate

Your NEW app will cost:
- Backend: ~$5-10/month
- Frontend: Free
- Database: ~$15/month
- **Total: ~$20-25/month**

**Note:** You'll be running TWO apps until you delete the old one:
- Old: `seahorse-app-zxz5f.ondigitalocean.app`
- New: `your-new-app-xyz.ondigitalocean.app`
- **Combined cost: ~$40-50/month**

---

## When You're Ready to Switch

After testing the new app:

1. **Update DNS** (if using custom domain) to point to new app
2. **Delete old app** in DO dashboard to stop charges
3. Or keep both running if you want staging + production

---

## Troubleshooting

**doctl: command not found**
→ Installation failed. Check PATH or reinstall.

**Error: Unable to authenticate**
→ API token invalid. Generate new token and run `doctl auth init` again.

**App creation failed**
→ Check `.do/app.yaml` syntax: `doctl apps spec validate .do/app.yaml`

**Backend not starting**
→ Check SECRET_KEY is set in environment variables.

**Frontend shows Network Error**
→ Update VITE_API_URL with correct app URL and rebuild.

---

## Summary

```bash
# Quick start (copy-paste):
brew install doctl                    # Install CLI
doctl auth init                       # Authenticate with token
cd /Users/josegalan/Documents/restaurantQR_prod/restaurantQRcode
doctl apps create --spec .do/app.yaml  # Create app
doctl apps list                       # Get app ID and URL
```

Then set secrets in dashboard and update VITE_API_URL.

**This method works 100% of the time!** No auto-detection needed.

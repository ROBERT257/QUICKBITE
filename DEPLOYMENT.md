# QuickBite Deployment Guide - PythonAnywhere

## Step 1: Update Frontend API URLs

### Files to Fix (replace `http://localhost:8000` with environment variable):

1. **ChefDashboard.js** - ✅ Already fixed
2. **SecureAdminDashboard.js** - Need to fix 16 hardcoded URLs
3. **ModernAdminDashboard.js** - Need to fix 13 hardcoded URLs
4. **AdminFoodManager.js** - Need to fix 7 hardcoded URLs
5. **ChatAssistant.js** - Need to fix 1 hardcoded URL
6. **SmartRecommendations.js** - Need to fix 1 hardcoded URL
7. **EnhancedMenu.js** - Need to fix 1 hardcoded URL
8. **Menu.js** - Need to fix 1 hardcoded URL
9. **Order.js** - Need to fix 1 hardcoded URL
10. **Orders.js** - Need to fix 1 hardcoded URL
11. **simple-app.js** - Need to fix 3 hardcoded URLs
12. **realtime.js** - Need to fix 1 hardcoded URL

### Pattern to Follow:

**Before:**
```javascript
const response = await fetch('http://localhost:8000/api/menu/items/', {
```

**After:**
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const response = await fetch(`${API_BASE_URL}/api/menu/items/`, {
```

## Step 2: Create Environment File

Create `.env` file in your frontend folder:

```
REACT_APP_API_URL=https://roelog.pythonanywhere.com/api
```

Or for local development, create `.env.local`:
```
REACT_APP_API_URL=http://localhost:8000/api
```

## Step 3: Update package.json

Remove or update the proxy line for production:

```json
{
  "name": "quickbite-frontend",
  "version": "1.0.0",
  "private": true,
  "homepage": ".",
  "dependencies": {
    ...
  }
}
```

## Step 4: Build for Production

```bash
cd frontend
npm run build
```

This creates a `build/` folder with static files.

## Step 5: Deploy to PythonAnywhere

### Upload Build Folder:
1. Go to PythonAnywhere dashboard → Files
2. Upload the entire `build/` folder to `/home/roelog/QUICKBITE/frontend/build`

### Configure Web App:
1. Go to Web tab
2. In Static files section, add:
   - URL: `/`
   - Directory: `/home/roelog/QUICKBITE/frontend/build`

3. In Static files section, also add:
   - URL: `/static/`
   - Directory: `/home/roelog/QUICKBITE/frontend/build/static`

## Step 6: Update CORS on Backend

In `settings.py`, update ALLOWED_HOSTS:

```python
ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'roelog.pythonanywhere.com', '*']
```

And ensure CORS is configured:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://roelog.pythonanywhere.com",
]

# Or allow all (for development)
CORS_ALLOW_ALL_ORIGINS = True
```

## Step 7: Reload Web App

Click the **Reload** button on PythonAnywhere Web tab.

## Full API URL Checklist

Replace all instances of `http://localhost:8000` with `${API_BASE_URL}`:

- [ ] SecureAdminDashboard.js (16 matches)
- [ ] ModernAdminDashboard.js (13 matches)
- [ ] AdminFoodManager.js (7 matches)
- [ ] ChefDashboard.js (3 matches) ✅ Done
- [ ] simple-app.js (3 matches)
- [ ] ChatAssistant.js (1 match)
- [ ] SmartRecommendations.js (1 match)
- [ ] EnhancedMenu.js (1 match)
- [ ] Menu.js (1 match)
- [ ] Order.js (1 match)
- [ ] Orders.js (1 match)
- [ ] PremiumAuth.js (uses env var) ✅ OK
- [ ] api.js (uses env var) ✅ OK
- [ ] realtime.js (1 match)

## Testing After Deployment

1. Visit: `https://roelog.pythonanywhere.com`
2. Test login functionality
3. Check browser console for any 404/500 errors
4. Verify API calls are going to the correct URL

## Troubleshooting

### Blank Page:
- Check that all static files are uploaded
- Verify paths in PythonAnywhere Web configuration

### API Errors:
- Check browser console for CORS errors
- Verify `REACT_APP_API_URL` is set correctly
- Check PythonAnywhere error logs

### 404 Errors:
- Ensure React Router is configured for production
- Add catch-all route in PythonAnywhere to serve index.html

## Quick Fix Script

Run this in bash to find all hardcoded URLs:

```bash
cd ~/QUICKBITE/frontend/src
grep -r "localhost:8000" --include="*.js" --include="*.jsx"
```

Replace them all with the environment variable pattern.

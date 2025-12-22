# 🔍 Debug "Buat Link Baru" Button

## Steps to Debug

### 1. Open Browser Console
```
F12 or Right-click → Inspect → Console tab
```

### 2. Click "Buat Link Baru" Button

You should see console logs like:
```
Opening create modal
Fetching trainings...
Fetching links...
Trainings response: { data: [...] }
```

### 3. Select Training from Dropdown

Console should show:
```
Selected training: [ID]
```

### 4. Click "Create" Button

Console should show:
```
Creating link with payload: { training_id, class_level, ... }
API URL: http://localhost:5000/api/admin/links
Create response: { success: true, data: {...} }
```

---

## Common Issues & Solutions

### Issue 1: Modal Opens but No Trainings

**Error in Console:**
```
Failed to fetch trainings:
Error: 401 Unauthorized
```

**Solution:**
- Token might be invalid
- Try logging out and logging back in
```bash
# Clear localStorage
Browser Console: localStorage.clear()
location.reload()
```

### Issue 2: Form Submits but No Response

**Error in Console:**
```
Create error: AxiosError
status: 400 or 500
```

**Solution:**
- Check that `training_id` is selected
- Verify expiry_date format (should be YYYY-MM-DD)
- Check backend logs:
```bash
docker logs pic_backend 2>&1 | tail -50
```

### Issue 3: API URL Wrong

**Error in Console:**
```
API URL: http://localhost/api/admin/links
```

**Should be:**
```
API URL: http://localhost:5000/api/admin/links
```

**Solution:**
- Check `.env.local` in frontend folder:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```
- If missing, create it or restart frontend

### Issue 4: "401 Unauthorized"

**Error:**
```
Failed to fetch: 401
```

**Solution:**
1. Check token exists:
```javascript
// In browser console
localStorage.getItem('token')
// Should show a long string starting with 'eyJ'
```

2. If empty, login again from `/admin/login`

3. Check token format in Authorization header:
```javascript
// Should be: "Bearer <token>"
```

---

## Testing Steps

### Step 1: Verify Backend API Works

```bash
# Get auth token
BACK_LOGS=$(docker logs pic_backend 2>&1)
echo "$BACK_LOGS" | grep -i token

# Or test manually
curl -X GET http://localhost:5000/api/admin/training \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 2: Test from Browser Console

```javascript
// In browser console
const token = localStorage.getItem('token');
const payload = {
  training_id: '1',  // Use actual ID from dropdown
  class_level: 'AHLI',
  max_registrations: 25,
  expiry_date: '2026-12-31'
};

fetch('http://localhost:5000/api/admin/links', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(payload)
})
.then(r => r.json())
.then(d => console.log('Response:', d))
.catch(e => console.error('Error:', e));
```

---

## Console Logging Guide

The updated code logs:

| Log | What It Means | Action |
|-----|---------------|--------|
| `Opening create modal` | Button was clicked | ✓ Good |
| `Fetching trainings...` | Loading dropdown options | ✓ Good |
| `Trainings response: { data: [...] }` | Dropdown populated | ✓ Good |
| `Selected training: [ID]` | You picked a training | ✓ Good |
| `Creating link with payload:` | Form is submitting | ✓ Good |
| `API URL: http://localhost:5000/api/admin/links` | Correct endpoint | ✓ Good |
| `Create response: { success: true }` | Link created! | ✓ Success |
| `Create error:` | Something failed | ❌ Problem |

---

## Network Tab Debugging

### Browser DevTools → Network Tab

1. Click "Buat Link Baru"
2. Select training
3. Click "Create"
4. Look for request to `/api/admin/links` (POST)
5. Check:
   - **Status**: Should be `200` or `201`
   - **Headers**: Authorization header present?
   - **Response**: Should have `success: true`

---

## If Still Stuck

### Get Full Error Message

```javascript
// In console
try {
  localStorage.getItem('token')
  fetch('http://localhost:5000/api/admin/links', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
  .then(r => r.json())
  .then(d => console.log('Full response:', JSON.stringify(d, null, 2)))
  .catch(e => console.log('Full error:', e));
} catch(e) {
  console.error('Fatal error:', e);
}
```

### Check Backend Logs

```bash
# See real-time logs
docker logs pic_backend -f

# Look for:
# POST /api/admin/links
# Error messages
# Stack traces
```

---

## Success Verification

After clicking "Create", you should see:

1. ✅ Modal closes
2. ✅ Success alert: "✅ Link berhasil dibuat!"
3. ✅ New link appears in the table below
4. ✅ Console shows `Create response: { success: true }`

If you see all 4, it's working! 🎉

---

**Ready to test?** Refresh the browser and try creating a link now!

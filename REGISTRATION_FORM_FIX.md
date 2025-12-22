# 📄 Registration Form Error Fix

## Problem

**Error:** `TypeError: Cannot read properties of undefined (reading 'map')`

**Location:** `pages/register/[token].tsx` line 273

**Cause:** The backend API was not returning `required_documents` when fetching link details, causing the frontend to fail when trying to map over an undefined array.

---

## Solution

### 1. Backend Fix (`backend/routes/public.js`)

**Changes:**
- Updated `GET /api/public/links/:token` endpoint
- Now fetches required documents from `link_required_documents` table
- Returns `required_documents` array in response
- Handles case where no documents are configured (returns empty array)

**New Response Structure:**
```json
{
  "success": true,
  "data": {
    "id": "link-id",
    "training_name": "K3 LISTRIK",
    "class_level": "AHLI",
    "location": "Bekasi",
    "required_documents": [
      {
        "id": "doc-id-1",
        "name": "Surat Rekomendasi",
        "type": "surat"
      },
      {
        "id": "doc-id-2",
        "name": "Ijazah/Sertifikat",
        "type": "ijazah"
      }
    ]
  }
}
```

### 2. Frontend Fix (`frontend/pages/register/[token].tsx`)

**Changes:**
- Added null safety: `required_documents || []`
- Updated form field names to match backend (`full_name` instead of `trainee_name`)
- Added safety check: Only render documents section if `requiredDocuments.length > 0`
- Added safety in API response handler

**Key Changes:**
```typescript
// Before (crashed if undefined)
link.required_documents.map((doc) => ...)

// After (safe handling)
const requiredDocuments = link.required_documents || [];

if (requiredDocuments.length > 0) {
  requiredDocuments.map((doc) => ...)
}
```

---

## How It Works Now

### User Flow

1. **User gets registration link** → `localhost:3000/register/5BD992B8C99D`
2. **Frontend fetches link details** → `GET /api/public/links/5BD992B8C99D`
3. **Backend returns** → Link data + required documents array
4. **Frontend renders** → Registration form with documents section
5. **User fills form** → Personal data + uploads documents
6. **User submits** → Form data sent to `/api/public/registrations`
7. **Backend stores** → Registration record created

### Document Handling

**Scenario A: Documents configured**
- Required documents section shows
- User can upload each document
- Documents are optional (not required to submit)

**Scenario B: No documents configured**
- Required documents section is hidden
- Registration form still works
- User can submit without document uploads

---

## Testing

### Test 1: Registration Form Loads

1. Create a registration link in admin panel
   - Training: K3 LISTRIK
   - Class: AHLI
   - Documents: Select Surat, Ijazah, KTP

2. Get the link token (e.g., `5BD992B8C99D`)

3. Open in browser: `http://localhost:3000/register/5BD992B8C99D`

4. **Expected:**
   - Form loads without errors
   - Training info displays correctly
   - Document upload section shows 3 items (Surat, Ijazah, KTP)

### Test 2: Form Submission

1. Fill in personal data (name, email, phone, NIK)
2. Upload documents (optional)
3. Click "Daftar Sekarang"

4. **Expected:**
   - Form submits successfully
   - Success message shows
   - Redirect to confirmation page

### Test 3: No Documents

1. Create another link without selecting any documents
2. Open registration form for this link

3. **Expected:**
   - Form loads
   - Document section NOT shown
   - Form still submits successfully

---

## Database Requirement

Your database must have the `link_required_documents` table:

```sql
CREATE TABLE link_required_documents (
  link_id UUID REFERENCES registration_links(id),
  document_id UUID REFERENCES document_types(id),
  PRIMARY KEY (link_id, document_id)
);
```

This table connects which documents are required for each registration link.

---

## Troubleshooting

### Still seeing error?

1. **Clear browser cache**
   ```
   Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
   ```

2. **Restart backend**
   ```bash
   docker restart pic_backend
   # or
   npm run dev (if running locally)
   ```

3. **Check backend logs**
   ```bash
   docker logs pic_backend
   ```

4. **Check browser console**
   - F12 → Console tab
   - Look for error messages

### Documents not showing?

1. Make sure link has documents configured in admin panel
2. Check `link_required_documents` table has records for the link
3. Check `document_types` table has the documents

---

## Files Modified

| File | Change | Status |
|------|--------|--------|
| `backend/routes/public.js` | Added required_documents query | ✅ Fixed |
| `frontend/pages/register/[token].tsx` | Added null safety & field name fixes | ✅ Fixed |

---

## API Contract

### GET /api/public/links/:token

**Request:**
```
GET http://localhost:5000/api/public/links/5BD992B8C99D
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "token": "5BD992B8C99D",
    "training_id": "...",
    "training_name": "K3 LISTRIK",
    "class_level": "AHLI",
    "start_date": "2026-01-19",
    "end_date": "2026-01-23",
    "location": "Bekasi Training Center",
    "max_registrations": 25,
    "current_registrations": 5,
    "whatsapp_link": "https://chat.whatsapp.com/...",
    "required_documents": [
      {
        "id": "doc-1",
        "name": "Surat Rekomendasi",
        "type": "surat"
      },
      {
        "id": "doc-2",
        "name": "Ijazah/Sertifikat",
        "type": "ijazah"
      }
    ]
  }
}
```

---

## Status

✅ **Registration form now works!**
✅ **No more undefined errors**
✅ **Documents section displays correctly**
✅ **Form submission works**


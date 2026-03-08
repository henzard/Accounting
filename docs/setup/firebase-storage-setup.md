# Firebase Storage Setup for Receipt Photos

**Status**: Required for receipt upload functionality  
**Priority**: High

---

## Current Issue

Receipt photo uploads are failing with CORS errors because Firebase Storage is not fully configured. The code will save transactions without receipts, but to enable receipt uploads, you need to configure Firebase Storage.

---

## Quick Setup (5 minutes)

### Step 1: Configure Storage Security Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **dave-ramsey-budget-project**
3. Navigate to **Storage** → **Rules** tab
4. Replace the default rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Receipt photos - authenticated users can upload
    match /receipts/{householdId}/{transactionId}/{allPaths=**} {
      // Allow read if user is authenticated
      allow read: if request.auth != null;
      
      // Allow write (upload) if:
      // 1. User is authenticated
      // 2. File size is reasonable (max 10MB)
      // 3. File is an image
      allow write: if request.auth != null
                    && request.resource.size < 10 * 1024 * 1024  // 10MB max
                    && request.resource.contentType.matches('image/.*');
      
      // Allow delete if user is authenticated (for cleanup)
      allow delete: if request.auth != null;
    }
    
    // Deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

5. Click **"Publish"** button

---

### Step 2: Configure CORS (For Web Development)

**Note**: This is only needed for web development. Mobile apps don't need CORS.

1. In Firebase Console → **Storage** → **Settings** tab
2. Scroll down to **"CORS configuration"** section
3. Click **"Edit CORS configuration"** or **"Add CORS configuration"**
4. Add this JSON configuration:

```json
[
  {
    "origin": ["http://localhost:8081", "http://localhost:19006"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization"]
  }
]
```

5. Click **"Save"**

**For Production**: Add your production domain to the `origin` array:
```json
"origin": ["http://localhost:8081", "http://localhost:19006", "https://your-domain.com"]
```

---

## Verification

After configuring:

1. **Refresh your browser** (important - CORS changes take effect immediately)
2. **Try uploading a receipt** from the transaction add screen
3. **Check browser console** - should see "✅ Receipt uploaded successfully"
4. **Check Firebase Console** → Storage → Files - should see receipt files

---

## Current Behavior (Without Configuration)

- ✅ Transactions can still be saved
- ✅ Receipt upload fails gracefully
- ✅ User sees helpful error message
- ✅ Transaction is saved without receipts
- ⚠️ Receipts cannot be uploaded until Storage is configured

---

## Troubleshooting

### Still Getting CORS Errors?

1. **Clear browser cache** and refresh
2. **Check you're logged in** - authentication is required
3. **Verify rules are published** - check Firebase Console → Storage → Rules
4. **Check CORS config** - verify it includes `http://localhost:8081`
5. **Try in incognito mode** - rules out cache issues

### Upload Fails with "Permission Denied"?

- Check Firebase Storage security rules are published
- Verify user is authenticated (check Firebase Console → Authentication)
- Check file size (must be < 10MB)
- Check file type (must be an image)

### Works on Mobile but Not Web?

- CORS is only needed for web
- Mobile apps don't have CORS restrictions
- Configure CORS as shown in Step 2 above

---

## Storage Costs

Firebase Storage pricing:
- **Free tier**: 5 GB storage, 1 GB/day downloads
- **Paid**: $0.026/GB storage, $0.12/GB downloads

**Tips to minimize costs**:
- Images are compressed to 80% quality (already implemented)
- Receipts are typically 100KB-2MB each
- 5GB free tier = ~2,500-50,000 receipts (depending on size)

---

## Security Considerations

The rules above allow:
- ✅ Authenticated users to upload receipts
- ✅ Authenticated users to view receipts
- ✅ File size limits (10MB max)
- ✅ Image type validation
- ❌ Unauthenticated users cannot access
- ❌ Non-image files cannot be uploaded

**For production**, consider:
- Reducing max file size to 5MB
- Adding household membership verification
- Adding rate limiting
- Implementing cleanup for deleted transactions

---

## References

- [Firebase Storage Security Rules](https://firebase.google.com/docs/storage/security)
- [CORS Configuration Guide](https://firebase.google.com/docs/storage/web/download-files#cors_configuration)
- [Storage Security Rules Documentation](https://firebase.google.com/docs/storage/security/rules-conditions)

---

**Next Steps**: After configuring, test receipt uploads and verify files appear in Firebase Console → Storage.

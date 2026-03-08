# Firebase Storage Security Rules

**Status**: Needs to be configured  
**Priority**: High (required for receipt uploads)

---

## Current Issue

Receipt uploads are failing with CORS errors because Firebase Storage security rules are not configured. The default rules deny all access.

---

## Required Security Rules

Add these rules to Firebase Console → Storage → Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Receipt photos - authenticated users can upload to their household's receipts
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

---

## CORS Configuration

For web uploads to work, you also need to configure CORS in Firebase Storage:

1. Go to Firebase Console → Storage → Settings
2. Scroll to "CORS configuration"
3. Add this CORS configuration:

```json
[
  {
    "origin": ["http://localhost:8081", "http://localhost:19006", "https://your-domain.com"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization"]
  }
]
```

**Note**: Replace `your-domain.com` with your actual production domain when deploying.

---

## Testing

After applying rules:

1. ✅ Authenticated user can upload receipts
2. ✅ Authenticated user can view receipts
3. ✅ Unauthenticated user cannot upload
4. ✅ File size limit enforced (10MB)
5. ✅ Only images allowed

---

## Production Considerations

1. **File Size Limits**: Consider reducing to 5MB for mobile data savings
2. **Image Compression**: Already implemented (80% quality in code)
3. **Storage Costs**: Monitor Firebase Storage usage
4. **Cleanup**: Implement cleanup for deleted transactions

---

## References

- [Firebase Storage Security Rules](https://firebase.google.com/docs/storage/security)
- [CORS Configuration](https://firebase.google.com/docs/storage/web/download-files#cors_configuration)

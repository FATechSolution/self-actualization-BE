# Firebase Authentication Integration Guide

## Overview

This guide explains how to integrate Firebase Authentication (Google and Apple Sign-In) with the Self-Actualization backend API from your Flutter application.

## Architecture

```
┌─────────────────┐
│  Flutter App    │
└────────┬────────┘
         │ 1. Sign in with Firebase (Google/Apple)
         │
         ▼
┌─────────────────┐
│ Firebase Auth   │ ← User authenticates
└────────┬────────┘
         │ 2. Returns Firebase ID Token
         │
         ▼
┌─────────────────┐
│  Flutter App    │
└────────┬────────┘
         │ 3. Send ID Token to backend
         │
         ▼
┌─────────────────┐
│  Backend API    │ ← Verifies token with Firebase Admin SDK
│                 │ ← Creates/updates user in MongoDB
│                 │ ← Returns JWT token for API access
└────────┬────────┘
         │ 4. Returns JWT Token
         │
         ▼
┌─────────────────┐
│  Flutter App    │ ← Use JWT for all API requests
└─────────────────┘
```

## Backend Implementation Summary

### 1. **User Model Updates**
- Added `firebaseUid` field to store Firebase user ID
- Added `apple` to `oauthProvider` enum
- Indexed `firebaseUid` for fast lookups

### 2. **New Endpoint: POST /api/auth/firebase-login**
- Accepts Firebase ID token
- Verifies token using Firebase Admin SDK
- Creates or updates user in database
- Returns backend JWT token for API authentication

### 3. **What Happens on Backend**
1. Verifies Firebase ID token authenticity
2. Extracts user info (email, name, picture, provider)
3. Checks if user exists by Firebase UID or email
4. Creates new user OR updates existing user
5. Stores Firebase UID for future reference
6. Generates and returns JWT token

---



## Important Notes

### 1. **Two Types of Tokens**
- **Firebase ID Token**: Short-lived (1 hour), used ONLY for initial authentication
- **Backend JWT Token**: Used for ALL subsequent API requests
- **DO NOT** send Firebase token to other API endpoints
- **ALWAYS** send Backend JWT token with `Authorization: Bearer <token>` header

### 2. **Token Storage**
- Store the backend JWT token securely (use `flutter_secure_storage`)
- Don't store Firebase ID token (it expires quickly)
- Refresh backend JWT when it expires (implement refresh token logic if needed)

### 3. **User Experience**
- If Firebase authentication succeeds but backend fails, show appropriate error
- Handle network errors gracefully
- Implement token refresh mechanism for long sessions

### 4. **Firebase vs Email/Password Users**
- Firebase users: Can access ALL endpoints that email/password users can
- Same permissions, same data access
- Same JWT token structure
- Backend treats them identically after authentication

### 5. **Existing Users**
- If a user already exists with the same email (e.g., registered via email/password)
- Backend will link the Firebase UID to that existing user
- User can then use both authentication methods

### 6. **Testing**
Use these test credentials in Firebase Console:
- Test with Google Sign-In in Firebase emulator/production
- Test with Apple Sign-In (requires Apple Developer account for testing)

---

## Common Issues & Solutions

### Issue 1: "Invalid or expired Firebase token"
**Solution**: Make sure to get a fresh ID token from Firebase before each login attempt
```dart
final idToken = await user?.getIdToken(forceRefresh: true);
```

### Issue 2: "Email not found in Firebase token"
**Solution**: Ensure email scope is requested in Firebase authentication
```dart
// For Google
final GoogleSignIn googleSignIn = GoogleSignIn(
  scopes: ['email', 'profile'],
);

// For Apple
scopes: [
  AppleIDAuthorizationScopes.email,
  AppleIDAuthorizationScopes.fullName,
]
```

### Issue 3: Firebase authentication succeeds but backend returns 401
**Solution**: Check Firebase project ID matches in both Firebase Console and backend `.env` file

### Issue 4: User info (name, picture) not showing
**Solution**: Firebase token might not include profile info. Backend will use email prefix as fallback name.


---

## Testing the Integration

### Quick Test Flow

1. **Test Firebase Authentication**:
   ```dart
   final idToken = await FirebaseAuthService().signInWithGoogle();
   print('Firebase ID Token: $idToken');
   ```

2. **Test Backend Authentication**:
   ```bash
   curl -X POST https://your-backend-url.vercel.app/api/auth/firebase-login \
     -H "Content-Type: application/json" \
     -d '{"idToken": "YOUR_FIREBASE_ID_TOKEN"}'
   ```

3. **Test API Access with JWT**:
   ```bash
   curl -X GET https://your-backend-url.vercel.app/api/auth/me \
     -H "Authorization: Bearer YOUR_BACKEND_JWT_TOKEN"
   ```

### Expected Results
- ✅ Firebase returns ID token
- ✅ Backend verifies token and creates/updates user
- ✅ Backend returns JWT token
- ✅ All authenticated endpoints work with JWT token

---

## Migration from Old OAuth Endpoint

If you were using the old `/api/auth/oauth` endpoint:

### Old Method (Deprecated)
```dart
// ❌ Don't use this anymore
final response = await http.post(
  Uri.parse('$baseUrl/auth/oauth'),
  body: jsonEncode({
    'email': user.email,
    'name': user.displayName,
    'oauthProvider': 'google',
    'oauthId': user.uid,
    'avatar': user.photoURL,
  }),
);
```

### New Method (Recommended)
```dart
// ✅ Use this instead
final idToken = await firebaseUser.getIdToken();
final response = await http.post(
  Uri.parse('$baseUrl/auth/firebase-login'),
  body: jsonEncode({
    'idToken': idToken,
  }),
);
```

**Benefits**:
- More secure (token verification by Firebase Admin SDK)
- Less data to send (just ID token)
- Automatic user info extraction
- Better error handling

---

## Support

If you encounter any issues:
1. Check Firebase Console for authentication logs
2. Check backend logs for verification errors
3. Verify environment variables are set correctly
4. Ensure Firebase Admin SDK service account JSON is valid

For questions, contact the backend team.


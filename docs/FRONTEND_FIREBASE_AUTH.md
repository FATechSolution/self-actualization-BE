# 🔐 Firebase Authentication - Frontend Integration Guide

## TL;DR - Quick Integration

After you complete Google/Apple login via Firebase in your Flutter app, follow these 3 simple steps:

### Step 1️⃣: Get Firebase ID Token
```dart
final String? firebaseIdToken = await FirebaseAuth.instance.currentUser?.getIdToken();
```

### Step 2️⃣: Send to Backend (Get JWT Token)
```dart
final response = await http.post(
  Uri.parse('https://self-actualization-analysis-be.vercel.app/api/auth/firebase-login'),
  headers: {'Content-Type': 'application/json'},
  body: jsonEncode({'idToken': firebaseIdToken}),
);

final backendJwtToken = jsonDecode(response.body)['data']['token'];
// Save this token!
```

### Step 3️⃣: Use JWT Token for ALL API Calls
```dart
final response = await http.get(
  Uri.parse('https://self-actualization-analysis-be.vercel.app/api/goals'),
  headers: {
    'Authorization': 'Bearer $backendJwtToken',
    'Content-Type': 'application/json',
  },
);
```

---

## 🎯 Complete Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│ 1. User clicks "Sign in with Google/Apple"                  │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. Firebase Authentication (Your existing code)              │
│    - GoogleSignIn().signIn() OR                              │
│    - SignInWithApple.getAppleIDCredential()                  │
│    ✅ You already have this working!                         │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. Get Firebase ID Token                                     │
│    final token = await user?.getIdToken();                   │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. 🆕 NEW: Send Firebase token to Backend                   │
│    POST /api/auth/firebase-login                             │
│    Body: { "idToken": "..." }                                │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. Backend Response (JWT Token + User Data)                  │
│    {                                                          │
│      "data": {                                                │
│        "token": "eyJhbGc...",  ← Save this!                  │
│        "user": { ... }                                        │
│      }                                                        │
│    }                                                          │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│ 6. Use JWT Token for all other API calls                     │
│    - Goals API                                                │
│    - Assessment API                                           │
│    - Notifications API                                        │
│    - Everything else!                                         │
└──────────────────────────────────────────────────────────────┘
```

---

## 📱 Flutter Implementation

### Complete Service Class

```dart
import 'dart:convert';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthService {
  static const String baseUrl = 'https://self-actualization-analysis-be.vercel.app/api';
  final _storage = FlutterSecureStorage();
  
  // After Firebase login (Google/Apple), call this
  Future<bool> loginWithBackend() async {
    try {
      // Get Firebase ID token
      final User? firebaseUser = FirebaseAuth.instance.currentUser;
      if (firebaseUser == null) return false;
      
      final String? firebaseIdToken = await firebaseUser.getIdToken();
      if (firebaseIdToken == null) return false;
      
      // Send to backend
      final response = await http.post(
        Uri.parse('$baseUrl/auth/firebase-login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'idToken': firebaseIdToken}),
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        
        // Save backend JWT token
        final String jwtToken = data['data']['token'];
        await _storage.write(key: 'jwt_token', value: jwtToken);
        
        // Optionally save user data
        final userData = jsonEncode(data['data']['user']);
        await _storage.write(key: 'user_data', value: userData);
        
        return true;
      }
      
      return false;
    } catch (e) {
      print('Backend login error: $e');
      return false;
    }
  }
  
  // Get saved JWT token
  Future<String?> getJwtToken() async {
    return await _storage.read(key: 'jwt_token');
  }
  
  // Logout
  Future<void> logout() async {
    await FirebaseAuth.instance.signOut();
    await _storage.deleteAll();
  }
}
```

### API Service Class (For All API Calls)

```dart
class ApiService {
  static const String baseUrl = 'https://self-actualization-analysis-be.vercel.app/api';
  final AuthService _authService = AuthService();
  
  // Helper method to get headers with JWT token
  Future<Map<String, String>> _getHeaders() async {
    final token = await _authService.getJwtToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }
  
  // Example: Get Goals
  Future<List<dynamic>> getGoals() async {
    final response = await http.get(
      Uri.parse('$baseUrl/goals'),
      headers: await _getHeaders(),
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['data']['goals'];
    }
    throw Exception('Failed to load goals');
  }
  
  // Example: Create Goal
  Future<Map<String, dynamic>> createGoal(Map<String, dynamic> goalData) async {
    final response = await http.post(
      Uri.parse('$baseUrl/goals'),
      headers: await _getHeaders(),
      body: jsonEncode(goalData),
    );
    
    if (response.statusCode == 201) {
      final data = jsonDecode(response.body);
      return data['data']['goal'];
    }
    throw Exception('Failed to create goal');
  }
  
  // Example: Get Current User
  Future<Map<String, dynamic>> getCurrentUser() async {
    final response = await http.get(
      Uri.parse('$baseUrl/auth/me'),
      headers: await _getHeaders(),
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['data']['user'];
    }
    throw Exception('Failed to get user');
  }
}
```

### Usage in Your Login Screen

```dart
class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final AuthService _authService = AuthService();
  bool _isLoading = false;
  
  // Google Sign-In Handler
  Future<void> _handleGoogleSignIn() async {
    setState(() => _isLoading = true);
    
    try {
      // Your existing Firebase Google login code
      final GoogleSignInAccount? googleUser = await GoogleSignIn().signIn();
      if (googleUser == null) return;
      
      final GoogleSignInAuthentication googleAuth = 
        await googleUser.authentication;
      
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );
      
      await FirebaseAuth.instance.signInWithCredential(credential);
      
      // 🆕 NEW: Now send to backend
      final success = await _authService.loginWithBackend();
      
      if (success) {
        // Navigate to home
        Navigator.pushReplacementNamed(context, '/home');
      } else {
        _showError('Backend authentication failed');
      }
    } catch (e) {
      _showError('Login failed: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }
  
  // Apple Sign-In Handler
  Future<void> _handleAppleSignIn() async {
    setState(() => _isLoading = true);
    
    try {
      // Your existing Firebase Apple login code
      final appleCredential = await SignInWithApple.getAppleIDCredential(
        scopes: [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],
      );
      
      final oauthCredential = OAuthProvider("apple.com").credential(
        idToken: appleCredential.identityToken,
        accessToken: appleCredential.authorizationCode,
      );
      
      await FirebaseAuth.instance.signInWithCredential(oauthCredential);
      
      // 🆕 NEW: Now send to backend
      final success = await _authService.loginWithBackend();
      
      if (success) {
        // Navigate to home
        Navigator.pushReplacementNamed(context, '/home');
      } else {
        _showError('Backend authentication failed');
      }
    } catch (e) {
      _showError('Login failed: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }
  
  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: _isLoading
            ? CircularProgressIndicator()
            : Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  ElevatedButton(
                    onPressed: _handleGoogleSignIn,
                    child: Text('Sign in with Google'),
                  ),
                  SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _handleAppleSignIn,
                    child: Text('Sign in with Apple'),
                  ),
                ],
              ),
      ),
    );
  }
}
```

---

## 🔑 Backend API Endpoint

### **POST /api/auth/firebase-login**

**URL**: `https://self-actualization-analysis-be.vercel.app/api/auth/firebase-login`

**Request**:
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlM2..."
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Firebase authentication successful",
  "data": {
    "user": {
      "id": "675c123abc456def789...",
      "name": "John Doe",
      "email": "john@example.com",
      "isOAuthUser": true,
      "oauthProvider": "google",
      "avatar": "https://lh3.googleusercontent.com/...",
      "hasCompletedAssessment": false,
      "assessmentCompletedAt": null,
      "currentSubscriptionType": "Free",
      "lastLogin": "2024-12-18T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401)**:
```json
{
  "success": false,
  "error": "Invalid or expired Firebase token"
}
```

---

## ⚠️ IMPORTANT: Two Different Tokens

| Token Type | When to Use | Where to Store | Lifetime |
|------------|-------------|----------------|----------|
| **Firebase ID Token** | ❌ ONLY for `/api/auth/firebase-login` | ❌ Don't store | 1 hour |
| **Backend JWT Token** | ✅ For ALL other API calls | ✅ Secure storage | 7 days |

### ❌ WRONG Usage
```dart
// DON'T DO THIS!
final firebaseToken = await user?.getIdToken();
final response = await http.get(
  Uri.parse('$baseUrl/goals'),
  headers: {'Authorization': 'Bearer $firebaseToken'}, // ❌ Wrong token!
);
```

### ✅ CORRECT Usage
```dart
// DO THIS!
final jwtToken = await _storage.read(key: 'jwt_token');
final response = await http.get(
  Uri.parse('$baseUrl/goals'),
  headers: {'Authorization': 'Bearer $jwtToken'}, // ✅ Correct token!
);
```

---

## 🧪 Testing Checklist

- [ ] Firebase login (Google/Apple) works
- [ ] Can get Firebase ID token
- [ ] Backend endpoint `/api/auth/firebase-login` returns JWT
- [ ] JWT token saved in secure storage
- [ ] Can call `/api/auth/me` with JWT token
- [ ] Can call other APIs (goals, assessment, etc.) with JWT token
- [ ] Error handling for network failures
- [ ] Error handling for invalid tokens

---

## 🐛 Common Errors & Solutions

### Error 1: "Invalid or expired Firebase token"
**Solution**: Refresh the token
```dart
final token = await user?.getIdToken(forceRefresh: true);
```

### Error 2: Backend returns 401 on other API calls
**Solution**: You're probably using Firebase token instead of JWT token. Use the JWT token returned from `/api/auth/firebase-login`.

### Error 3: "Email not found in Firebase token"
**Solution**: Make sure you request email scope in Firebase authentication.

---

## 📦 Required Dependencies

```yaml
dependencies:
  firebase_auth: ^4.x.x
  google_sign_in: ^6.x.x
  sign_in_with_apple: ^5.x.x
  http: ^1.x.x
  flutter_secure_storage: ^9.x.x
```

---

## 🎯 What You Get

After successful integration, users who login via Google/Apple will have:

✅ **Same access** as email/password users
✅ **All endpoints available**:
- Profile management (`/api/auth/me`, `/api/auth/profile`)
- Assessments (`/api/assessment/*`)
- Goals (`/api/goals/*`)
- Reflections (`/api/reflections/*`)
- Notifications (`/api/notifications/*`)
- Learn & Grow content (`/api/audios`, `/api/videos`, `/api/articles`)
- Subscriptions (`/api/subscriptions/*`)
- Achievements (`/api/achievements/*`)

✅ **User data automatically synced** to backend database
✅ **Avatar and name** auto-populated from Google/Apple
✅ **Email verified** by default

---

## 🚀 Quick Start Summary

1. Keep your existing Firebase authentication code (Google/Apple)
2. After Firebase login succeeds, call `AuthService().loginWithBackend()`
3. Save the JWT token returned from backend
4. Use JWT token for ALL subsequent API calls
5. Done! 🎉

---

## 💡 Pro Tips

1. **Token Refresh**: Implement auto-refresh when JWT expires (backend returns 401)
2. **Offline Support**: Cache user data locally
3. **Error Messages**: Show user-friendly errors for network issues
4. **Loading States**: Show spinners during authentication
5. **Auto-login**: Check if JWT token exists on app start and auto-login

---

## 📞 Need Help?

- Check backend logs: https://vercel.com/your-project/logs
- Test endpoint with Postman first
- Firebase Console: Check authentication logs
- Contact backend team if issues persist

---

## ✅ That's It!

You only need to add **ONE** new API call after your existing Firebase login:

```dart
// After Firebase login succeeds
await _authService.loginWithBackend();
```

Everything else stays the same! 🚀


# Study Buddy - Secure Wallet-Based Ownership System

## Overview

This system implements a complete secure wallet-based ownership architecture for Study Buddy, ensuring that every uploaded file, note, or resource belongs exclusively to ONE wallet address.

## Architecture

### 1. Authentication Flow

```
User connects wallet → System generates challenge → User signs message 
→ Backend verifies signature → Session token created → Authenticated user
```

**Files:**
- `/src/lib/api/auth.ts` - Token generation, signature verification, rate limiting
- `/src/app/api/auth/challenge/route.ts` - Challenge generation endpoint
- `/src/app/api/auth/verify/route.ts` - Signature verification and authentication endpoint
- `/src/lib/hooks/useWalletAuth.ts` - React hook for client-side auth management

### 2. Database Models

**User Profile**
```typescript
{
  id: string                 // Unique ID
  walletAddress: string     // Immutable, unique identifier
  username: string          // Display name
  avatar?: string           // Avatar URL
  bio?: string              // User bio
  createdAt: Date          // Immutable
  updatedAt: Date
}
```

**Material (File)**
```typescript
{
  id: string
  ownerWallet: string       // Immutable owner
  fileName: string
  fileType: string
  category: string          // lectures | notes | assignments | links | general
  shelbyId: string         // Shelby Protocol storage ID
  contentHash: string      // SHA-256 hash
  txHash: string          // Blockchain transaction
  fileSize: number
  tags?: string[]
  folder?: string
  uploadedAt: Date         // Immutable
  updatedAt: Date
}
```

**Note**
```typescript
{
  id: string
  ownerWallet: string       // Immutable owner
  title: string
  content: string
  color?: string
  tags?: string[]
  createdAt: Date          // Immutable
  updatedAt: Date
}
```

**Files:**
- `/src/lib/db/models.ts` - All data models and interfaces
- `/src/lib/db/storage.ts` - In-memory database layer (replace with real DB in production)

### 3. Access Control Middleware

All API endpoints enforce strict ownership verification:

```typescript
// Example: Only the owner can download their file
GET /api/materials/[materialId]/download
↓
verifyWalletOwnership() → Extract wallet from JWT
↓
verifyMaterialOwnership() → Check if wallet owns the material
↓
Database: if (material.ownerWallet !== connectedWallet) return 403
↓
Download file from Shelby Protocol
```

**Verification occurs SERVER-SIDE ONLY**
- Frontend validation is bypassed
- Token verification happens on every request
- Ownership verified before any action

**Files:**
- `/src/lib/api/middleware.ts` - `withAuth()` and `withOwnershipCheck()` wrappers

### 4. API Routes

#### Authentication
- `POST /api/auth/challenge` - Get challenge to sign
- `POST /api/auth/verify` - Verify signature and create session

#### User Profile
- `GET /api/user/profile` - Get authenticated user's profile
- `PUT /api/user/profile` - Update authenticated user's profile

#### Materials (Files)
- `GET /api/materials` - List all user's materials
- `POST /api/materials/upload` - Upload file to Shelby Protocol
- `GET /api/materials/[materialId]/download` - Download file (ownership verified)
- `DELETE /api/materials/[materialId]` - Delete material (ownership verified)

#### Notes
- `GET /api/notes` - List all user's notes
- `POST /api/notes` - Create new note
- `GET /api/notes/[noteId]` - Get specific note (ownership verified)
- `PUT /api/notes/[noteId]` - Update note (ownership verified)
- `DELETE /api/notes/[noteId]` - Delete note (ownership verified)

**Files:**
- `/src/app/api/auth/*` - Authentication endpoints
- `/src/app/api/user/*` - User profile endpoints
- `/src/app/api/materials/*` - File management endpoints
- `/src/app/api/notes/*` - Note management endpoints

### 5. Shelby Protocol Integration

Files are stored securely on the Shelby Protocol:

```
Upload Flow:
1. User selects file
2. File uploaded to Shelby Protocol
3. Shelby returns: fileId, contentHash, txHash
4. File metadata stored in database with owner wallet
5. User can only download via protected API route

Download Flow:
1. User requests download
2. Backend verifies ownership
3. Retrieves file from Shelby using fileId
4. Returns file to verified owner only
```

**Files:**
- `/src/lib/shelby.ts` - Shelby Protocol upload/download functions

### 6. Security Features

**JWT Token Management**
- Tokens generated with expiry (7 days)
- HMAC-SHA256 signature verification
- Token tied to wallet address
- Wallet address extracted from token and re-verified

**Rate Limiting**
- Rate limit on authentication attempts: 100 requests per minute
- Prevents brute force attacks
- Tracked by IP address

**Signature Verification**
- Challenge message includes wallet address
- Message prevents replay attacks with timestamp and nonce
- Signature validated before session creation
- Database logs all access attempts

**Ownership Verification**
- Every data access checked server-side
- Material/note ownerWallet must match authenticated wallet
- 403 Forbidden returned if ownership doesn't match
- Access logged with success/failure status

**Session Management**
- Sessions tracked in database
- Session activity updated on each request
- Auto-logout on token expiry
- Multiple sessions supported per wallet

### 7. Client-Side Integration

**useWalletAuth Hook**
```typescript
const { user, isLoading, error, login, logout, isAuthenticated } = useWalletAuth();

// Login triggers:
// 1. Get challenge from backend
// 2. Sign challenge with wallet
// 3. Verify signature on backend
// 4. Create session and return JWT token
// 5. Store token in localStorage

// All API calls include token in Authorization header
const data = await fetchWithAuth(token, "/api/materials");
```

**ConnectWallet Component**
- Shows "Connect Wallet" button when not connected
- Shows "Authenticate" button when wallet connected but not authenticated
- Shows user profile when fully authenticated
- Three-state system: disconnected → connected → authenticated

**Files:**
- `/src/components/ConnectWallet.tsx` - Updated with authentication flow
- `/src/lib/hooks/useWalletAuth.ts` - React authentication hook

### 8. Frontend Implementation Notes

**Important:** Frontend calls must include JWT token in Authorization header:

```typescript
const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${user.token}`
};

// Using helper function:
const data = await fetchWithAuth(token, "/api/materials", {
  method: "POST",
  body: JSON.stringify({ /* data */ })
});
```

## Security Best Practices

### DO's ✅
- ✅ Verify ownership on every server-side request
- ✅ Use signed JWT tokens with expiry
- ✅ Log all access attempts for audit trail
- ✅ Implement rate limiting
- ✅ Never trust frontend validation alone
- ✅ Use HTTPS in production
- ✅ Store tokens securely in localStorage (short-term) or httpOnly cookies

### DON'Ts ❌
- ❌ Expose public file URLs
- ❌ Allow wallet spoofing
- ❌ Rely only on frontend checks
- ❌ Skip ownership verification
- ❌ Reuse the same challenge
- ❌ Accept unauthenticated API calls
- ❌ Log sensitive data

## Production Checklist

- [ ] Replace in-memory database with MongoDB/PostgreSQL/Supabase
- [ ] Implement proper JWT library (jsonwebtoken) with secret keys
- [ ] Use environment variables for secrets and API keys
- [ ] Implement proper error logging and monitoring
- [ ] Enable HTTPS only
- [ ] Implement proper CORS policies
- [ ] Add database migrations system
- [ ] Implement proper backup strategy
- [ ] Add comprehensive audit logging
- [ ] Implement 2FA or additional security measures
- [ ] Use Shelby Protocol production endpoints
- [ ] Implement proper file retention policies
- [ ] Add encryption for sensitive data at rest
- [ ] Implement API request signing for Shelby Protocol calls
- [ ] Set up monitoring and alerting

## Error Messages & Status Codes

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | Success | Profile retrieved |
| 201 | Created | Material uploaded |
| 400 | Bad Request | Invalid JSON/params |
| 401 | Unauthorized | No token/invalid token |
| 403 | Forbidden | Not resource owner |
| 404 | Not Found | Resource doesn't exist |
| 429 | Rate Limited | Too many requests |
| 500 | Server Error | Internal error |

## Testing the System

### 1. Test Authentication
```bash
# Get challenge
curl -X POST http://localhost:3000/api/auth/challenge \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0x1234..."}'

# Verify signature (requires signed message)
curl -X POST http://localhost:3000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"challengeId":"...","walletAddress":"0x1234...","signature":"..."}'
```

### 2. Test Protected Endpoints
```bash
# Get user profile (requires token)
curl -X GET http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer JWT_TOKEN"

# Upload material
curl -X POST http://localhost:3000/api/materials/upload \
  -H "Authorization: Bearer JWT_TOKEN" \
  -F "file=@document.pdf" \
  -F "category=lectures"
```

### 3. Test Ownership Verification
```bash
# Try to access someone else's material (should fail with 403)
curl -X GET http://localhost:3000/api/materials/OTHER_USER_MATERIAL_ID/download \
  -H "Authorization: Bearer YOUR_TOKEN"
# Response: 403 Forbidden
```

## Migration Guide

To migrate from the old system to the new secure system:

1. **Backup existing data**
2. **Create database tables** using models.ts
3. **Migrate user data** - assign walletAddress to each user
4. **Migrate materials** - assign ownerWallet to each file
5. **Migrate notes** - assign ownerWallet to each note
6. **Update components** - use useWalletAuth hook
7. **Test thoroughly** - verify ownership checks work
8. **Deploy gradually** - keep old system available during transition

## Troubleshooting

### "Transaction failed: User has rejected the request"
- User rejected the signature request in their wallet
- This is expected behavior - wallet signing is optional
- No transaction occurs - it's just a message signature

### "Failed to load resource: net::ERR_CONNECTION_CLOSED"
- Shelby Protocol API might be down
- Check internet connection
- System falls back to mock Shelby responses in development

### "Invalid signature"
- Signature doesn't match the challenge
- Challenge may have expired (10-minute limit)
- User may have modified the challenge message

### "Ownership verification failed"
- Token wallet address doesn't match resource owner
- User is trying to access someone else's content
- Working as intended - access is denied

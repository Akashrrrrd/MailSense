# [ADR-002]: Implement JWT Authentication

## Status

Accepted

## Context

We need a secure and scalable authentication system for MailSense that:
- Provides stateless authentication
- Works well with our Next.js frontend
- Supports role-based access control (RBAC)
- Can be easily integrated with third-party providers (Google, GitHub, etc.)
- Handles token refresh securely

## Decision

We will implement JWT (JSON Web Token) based authentication with the following characteristics:

1. **Token Types**:
   - Access Token: Short-lived (15 minutes)
   - Refresh Token: Long-lived (7 days), HTTP-only cookie

2. **Storage**:
   - Access Token: In-memory (not stored in localStorage)
   - Refresh Token: HTTP-only, Secure, SameSite=Strict cookie

3. **Libraries**:
   - NextAuth.js for authentication
   - jsonwebtoken for JWT handling
   - bcryptjs for password hashing

4. **Security Measures**:
   - CSRF protection
   - Rate limiting on authentication endpoints
   - Secure cookie attributes
   - Token rotation
   - Short token expiration

## Consequences

### Positive
- Stateless authentication reduces database load
- Good performance at scale
- Flexible for microservices architecture
- Easy to implement with Next.js
- Good security when implemented correctly

### Negative
- More complex than session-based auth
- Token invalidation requires additional logic
- Need to handle token refresh flow
- Sensitive to XSS and CSRF attacks if not implemented properly

## Alternatives Considered

### Option 1: Session-based Authentication
- **Pros**: Simpler to implement, easier to invalidate sessions
- **Cons**: Requires server-side session storage, less scalable

### Option 2: OAuth 2.0 with Identity Provider
- **Pros**: Offloads authentication to third-party, better security
- **Cons**: More complex setup, dependency on third-party services

### Option 3: API Keys
- **Pros**: Simple to implement
- **Cons**: Poor user experience, security risks if keys are exposed

## Implementation Details

### Token Payload
```typescript
interface JwtPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  iat: number; // Issued at
  exp: number; // Expiration time
}
```

### Authentication Flow
1. User logs in with credentials/OAuth
2. Server validates credentials
3. Issues access token + refresh token
4. Client stores access token in memory
5. Client includes access token in Authorization header
6. Server validates token on protected routes
7. When access token expires, client uses refresh token to get new tokens

## References
- [JWT Best Practices](https://hasura.io/blog/best-practices-of-using-jwt-with-graphql/)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

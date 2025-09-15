# [ADR-003]: Use Firestore as Primary Database

## Status

Accepted

## Context

We needed to choose a database solution for MailSense that provides:
- Real-time data synchronization
- Scalability to handle potentially large numbers of users and emails
- Flexible data modeling for email and user data
- Strong security rules
- Serverless compatibility
- Easy integration with our Next.js frontend

## Decision

We will use Google Cloud Firestore as our primary database because it provides:

1. **Real-time Data Sync**: Built-in real-time listeners for live updates
2. **Scalability**: Automatically scales to handle our growing user base
3. **Security**: Robust security rules for fine-grained access control
4. **Serverless**: Pay-as-you-go pricing with automatic scaling
5. **Offline Support**: Works offline with local data persistence
6. **Integration**: Seamless integration with Firebase Authentication and other GCP services

### Data Structure

#### Users Collection
```typescript
interface User {
  uid: string;           // Firebase Auth UID
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
  lastLogin: Timestamp;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    emailFrequency: 'immediate' | 'hourly' | 'daily';
    signature?: string;
  };
  role: 'user' | 'admin';
  status: 'active' | 'suspended' | 'deleted';
}
```

#### Emails Collection
```typescript
interface Email {
  id: string;
  threadId: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  htmlBody?: string;
  attachments?: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }[];
  labels: string[];
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
  isDraft: boolean;
  isTrash: boolean;
  isSpam: boolean;
  isSent: boolean;
  scheduledAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;  // Reference to the user
}
```

## Consequences

### Positive
- Real-time updates without additional infrastructure
- Automatic scaling
- Built-in offline support
- Strong security model
- Serverless architecture reduces operational overhead
- Good documentation and community support

### Negative
- Limited querying capabilities compared to SQL
- Potential for higher costs at scale
- Vendor lock-in with Google Cloud
- Learning curve for team members not familiar with NoSQL

## Alternatives Considered

### Option 1: PostgreSQL
- **Pros**: ACID compliance, powerful querying, relational data modeling
- **Cons**: More complex to scale, requires managing database instances

### Option 2: MongoDB Atlas
- **Pros**: Flexible schema, good documentation, strong community
- **Cons**: Less integrated with GCP, additional setup for real-time features

### Option 3: Supabase
- **Pros**: Open source, PostgreSQL-based, good real-time capabilities
- **Cons**: Newer technology, smaller community

## Implementation Details

### Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read and update their own data
    match /users/{userId} {
      allow read, update: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && !exists(/databases/$(database)/documents/users/$(request.auth.uid));
    }
    
    // Users can only access their own emails
    match /emails/{emailId} {
      allow read, update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

### Indexing Strategy
- Single-field indexes on frequently queried fields (userId, threadId, isRead, etc.)
- Composite indexes for complex queries
- Collection group queries for cross-collection searches

## References
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firestore Security Rules](https://firebase.google.com/docs/rules)
- [Firestore Data Model](https://firebase.google.com/docs/firestore/data-model)
- [Firestore Indexing](https://firebase.google.com/docs/firestore/query-data/indexing)

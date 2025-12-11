# ADR 001: Firebase/Firestore Over SQLite + Custom Backend

**Date**: 2024-12-11  
**Status**: Accepted  
**Deciders**: Project Team  
**Context Tags**: #infrastructure #database #sync

---

## Context

We need a data storage and sync solution for a mobile budgeting app with these requirements:

### Must Have
- **Offline-first** - App must work without internet for extended periods (weeks/months)
- **Multi-device sync** - Couples share one budget across multiple phones
- **Real-time updates** - Changes on one device appear on others quickly
- **Minimal maintenance** - Small team, don't want to manage servers

### Constraints
- Budget: Prefer free/low-cost for MVP
- Team size: 1-2 developers
- Timeline: 3-4 months to MVP
- Technical debt: Minimize custom infrastructure

---

## Decision

**We will use Firebase/Firestore instead of SQLite + custom sync backend.**

### Technology Stack
- **Database**: Cloud Firestore (NoSQL)
- **Authentication**: Firebase Authentication
- **Storage**: Firebase Storage (for receipt photos)
- **Backend**: None (Firebase is the backend)

---

## Rationale

### Why Firebase/Firestore?

#### 1. **Built-in Offline Support**
```typescript
// Firestore automatically handles offline
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      // Multiple tabs open
    } else if (err.code == 'unimplemented') {
      // Browser doesn't support
    }
  });

// Reads/writes work offline automatically
await setDoc(doc(db, 'transactions', txId), transaction);
// ↑ This works offline and syncs later
```

**SQLite equivalent would require**:
- Build custom sync engine
- Handle conflict resolution
- Queue writes for retry
- Manage connection state
- 500+ lines of sync code

#### 2. **Zero Backend Maintenance**
**Firebase**: 
- Google manages servers
- Automatic scaling
- Built-in monitoring
- DDoS protection
- Security patches automatic

**SQLite + Backend**:
- Provision VPS/cloud instance
- Set up PostgreSQL
- Build REST API
- Implement WebSocket server
- Monitor uptime
- Apply security patches
- Scale when needed
- ~40 hours/month maintenance

#### 3. **Real-time Sync Out of the Box**
```typescript
// Live updates with Firestore
const q = query(collection(db, 'transactions'));
onSnapshot(q, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === 'added') {
      // New transaction from other device
      updateUI(change.doc.data());
    }
  });
});
```

**SQLite equivalent**:
- Set up WebSocket server
- Implement pub/sub
- Handle reconnections
- Manage subscriptions
- ~2000 lines of code

#### 4. **Cost Comparison**

**Firebase (Blaze/Pay-as-you-go)**:
```
Free Tier:
- 1 GB storage
- 10 GB/month transfer
- 50k reads/day
- 20k writes/day
- 20k deletes/day

Typical Usage (100 users):
- ~$0-5/month (stays in free tier)

At Scale (10,000 users):
- ~$50-100/month

Storage (receipts): $0.026/GB
```

**SQLite + Custom Backend**:
```
Minimum Setup:
- VPS: $10-20/month
- PostgreSQL: $15-30/month (managed)
- Domain: $12/year
- SSL cert: Free (Let's Encrypt)
- Time: 40 hours setup + 20 hours/month maintenance

Total: $25-50/month + developer time
```

**Winner**: Firebase cheaper for small scale, competitive at large scale.

#### 5. **Development Speed**

**Time to Working Prototype**:
- Firebase: 2-3 days
- Custom backend: 2-3 weeks

**Feature Comparison**:

| Feature | Firebase | SQLite + Backend |
|---------|----------|-----------------|
| Auth | 2 hours | 40 hours |
| Database | 1 day | 3 days |
| Offline | Built-in | 1 week |
| Sync | Built-in | 2 weeks |
| File storage | 2 hours | 1 week |
| Security | 1 day | 1 week |
| **Total** | **4-5 days** | **7-9 weeks** |

---

## Alternatives Considered

### Option A: SQLite + Custom Node.js Backend ❌

**Pros**:
- ✅ Full control over data
- ✅ SQL queries (familiar)
- ✅ Can optimize everything
- ✅ No vendor lock-in

**Cons**:
- ❌ Must build sync engine from scratch
- ❌ Server maintenance burden
- ❌ Scaling complexity
- ❌ 6-8 weeks additional dev time
- ❌ Ongoing maintenance costs

**Verdict**: Too much work for MVP, not enough team capacity.

---

### Option B: Supabase ⚠️

**Pros**:
- ✅ PostgreSQL (SQL)
- ✅ Realtime sync
- ✅ Open source (can self-host later)
- ✅ Similar to Firebase

**Cons**:
- ⚠️ Less mature offline support
- ⚠️ Smaller community
- ⚠️ Fewer examples for React Native
- ⚠️ Free tier more limited

**Verdict**: Good alternative, but Firebase more proven for offline-first mobile.

---

### Option C: PocketBase ⚠️

**Pros**:
- ✅ Lightweight
- ✅ Self-hosted ($5/month)
- ✅ Realtime sync
- ✅ File storage included

**Cons**:
- ⚠️ Must host it yourself
- ⚠️ Single binary = single point of failure
- ⚠️ Less documentation
- ⚠️ Newer, less battle-tested

**Verdict**: Great for hobby projects, risky for production app.

---

### Option D: AWS Amplify + AppSync ⚠️

**Pros**:
- ✅ Offline sync (via GraphQL)
- ✅ AWS ecosystem
- ✅ Scalable

**Cons**:
- ❌ More complex setup
- ❌ GraphQL learning curve
- ❌ AWS console complexity
- ❌ Higher costs at small scale

**Verdict**: Overkill for MVP, better for enterprise.

---

## Technical Deep Dive

### Offline-First with UUIDs

**Why UUIDs?**
```typescript
// Client generates ID offline
const transactionId = uuid(); // No server needed!

// Write locally
await setDoc(doc(db, 'transactions', transactionId), {
  id: transactionId,
  amount: 10000,
  date: Timestamp.now(),
  // ... rest of transaction
});

// Syncs automatically when online
// No ID conflicts because UUID is globally unique
```

**SQLite approach**:
```sql
-- Server assigns ID, but we're offline...
INSERT INTO transactions (...) RETURNING id;
-- ❌ Can't get server ID while offline

-- Must use temporary ID and remap later
INSERT INTO transactions (temp_id, ...) VALUES (uuid(), ...);
-- Then sync and get real ID from server
-- Then update all foreign keys
-- Complex reconciliation logic
```

### Conflict Resolution

**Firestore**:
- Last-write-wins by default (acceptable for our use case)
- Single-user most of the time
- Conflicts rare

**Custom Backend**:
- Must implement conflict detection
- Must implement resolution strategy
- Must handle concurrent edits
- Much more complex

### Security

**Firestore Security Rules**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only household members can access data
    match /households/{householdId}/{document=**} {
      allow read, write: if request.auth != null 
        && request.auth.uid in resource.data.member_ids;
    }
  }
}
```

**Custom Backend**:
- Implement JWT auth
- Validate every request
- Implement RBAC
- Handle token refresh
- More security surface area

---

## Consequences

### Positive ✅

1. **Faster Development**
   - MVP in 3 months instead of 6
   - Focus on features, not infrastructure
   - Less code to maintain

2. **Better Offline Experience**
   - Firestore handles offline automatically
   - Local cache + automatic sync
   - Optimistic UI updates

3. **Lower Maintenance**
   - No servers to monitor
   - No databases to backup (Firebase handles it)
   - No scaling issues
   - No security patches

4. **Cost Effective**
   - Free tier covers MVP
   - Predictable scaling costs
   - No infrastructure overhead

5. **Better UX**
   - Real-time updates
   - Feels fast (local-first)
   - Reliable sync

### Negative ❌

1. **Vendor Lock-in**
   - Tied to Google/Firebase
   - Migration would be complex
   - **Mitigation**: Abstract database layer, keep business logic separate

2. **Less Control**
   - Can't optimize database internals
   - Limited query capabilities (NoSQL)
   - **Mitigation**: Denormalize data for common queries

3. **Cost at Scale**
   - Could get expensive at very large scale (100k+ users)
   - Pay per read/write
   - **Mitigation**: Monitor usage, optimize queries, consider alternatives later

4. **NoSQL Limitations**
   - No JOIN operations
   - No complex SQL queries
   - **Mitigation**: Denormalize data, acceptable trade-off

5. **Firestore Query Limitations**
   - Can't query on multiple inequality filters
   - Requires composite indexes
   - **Mitigation**: Design data model carefully, create indexes proactively

### Neutral ⚖️

1. **NoSQL Data Modeling**
   - Different from SQL (learning curve)
   - But well-documented
   - Works well for our use case

2. **Firebase Ecosystem**
   - Locks us into Firebase tools
   - But they're good tools
   - Can still use React Native ecosystem

---

## Implementation Plan

### Phase 1: Setup (Week 1)
- [ ] Create Firebase project
- [ ] Enable Firestore
- [ ] Enable Authentication
- [ ] Enable Storage
- [ ] Install Firebase SDK in React Native
- [ ] Configure security rules

### Phase 2: Core Features (Weeks 2-8)
- [ ] User authentication
- [ ] Household creation
- [ ] Budget CRUD
- [ ] Transaction CRUD
- [ ] Category management
- [ ] Offline persistence

### Phase 3: Advanced Features (Weeks 9-12)
- [ ] Real-time sync testing
- [ ] Receipt photo upload
- [ ] Business expenses
- [ ] Debt tracking
- [ ] Reports

---

## Success Metrics

**We will know this decision was correct if**:

1. ✅ App works offline for >30 days without issues
2. ✅ Sync works reliably across multiple devices
3. ✅ Development completes in <4 months
4. ✅ Monthly costs stay <$50 for first 1000 users
5. ✅ No data loss incidents
6. ✅ Real-time updates feel instant (<2s latency)

**We will reconsider if**:

1. ❌ Costs exceed $500/month
2. ❌ Performance becomes unacceptable
3. ❌ Firebase limitations block critical features
4. ❌ Vendor lock-in becomes problematic

---

## Exit Strategy

**If we need to migrate away from Firebase**:

1. **Data Export**
   - Firestore supports export to GCS
   - Can export to JSON
   - Transform to SQL schema

2. **Code Changes**
   - Database layer is abstracted (Repository pattern)
   - Swap implementations
   - Estimated: 4-6 weeks

3. **Migration Path**
   - Build custom backend alongside Firebase
   - Dual-write to both systems
   - Verify data consistency
   - Cut over when ready
   - Estimated: 3-4 months

**Cost**: ~$50k-100k in developer time

**Likelihood needed**: Low (<20%)

---

## References

- [Firestore Offline Persistence](https://firebase.google.com/docs/firestore/manage-data/enable-offline)
- [Firebase Pricing](https://firebase.google.com/pricing)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [React Native Firebase](https://rnfirebase.io/)
- [Offline-First Architecture](https://offlinefirst.org/)

---

## Decision Log

- **2024-12-11**: Decision made to use Firebase/Firestore
- **2024-12-11**: ADR documented

---

## Notes

This decision aligns with our "simplicity first" principle. Firebase removes complexity and lets us focus on the Dave Ramsey budgeting features that matter to users.

The 10x development speed difference (4 days vs 9 weeks) is the decisive factor. For a small team with limited time, Firebase is the clear winner.

We accept vendor lock-in risk as acceptable trade-off for speed and simplicity.


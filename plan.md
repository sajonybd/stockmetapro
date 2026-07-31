# StockMetaPro Architecture & Upgrade Plan

This document serves as the main architectural blueprint and database upgrade guide for **StockMetaPro**. It outlines clean data separation between web applications and the core licensing engine, rollover credit logic, schema designs, and backward-compatibility guidelines.

---

## 1. Database Schema Plan (MongoDB)

### A. `packages` Collection
Defines package plans created by admins and purchased by users.
```json
{
  "_id": "ObjectId",
  "name": "Pro Plan",
  "slug": "pro-plan",
  "price": 29.99,
  "currency": "USD",
  "creditsAllocated": 1000,
  "durationDays": 30,
  "isActive": true,
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

### B. `users` Collection
Tracks accounts, authentication, and quick lookup keys.
```json
{
  "_id": "ObjectId",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "role": "user",
  "createdAt": "ISODate"
}
```

### C. `licenses` Collection
Main ledger for software access, expiration, and credit rollover.
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: User)",
  "packageId": "ObjectId (ref: Package)",
  "licenseKey": "XXXX-XXXX-XXXX-XXXX",
  "status": "active",
  "currentCredits": 1250,
  "expiresAt": "ISODate",
  "lastRenewedAt": "ISODate",
  "autoRenew": false,
  "createdAt": "ISODate"
}
```

### D. `transactions` Collection (Renewal & Purchase Audit Log)
Immutable audit log for purchases, top-ups, and credit rollovers.
```json
{
  "_id": "ObjectId",
  "licenseId": "ObjectId (ref: License)",
  "userId": "ObjectId",
  "type": "NEW_PURCHASE | RENEWAL",
  "amountPaid": 29.99,
  "creditsAdded": 1000,
  "creditsRolledOver": 250,
  "previousExpiry": "ISODate",
  "newExpiry": "ISODate",
  "paymentProvider": "stripe | bkash | nagad | manual",
  "createdAt": "ISODate"
}
```

---

## 2. Core Operational Logic

### A. Credit Rollover & Renewal Flowchart
```
                       [ Incoming Renewal Request ]
                                    │
                                    ▼
                 [ Search License by Phone / Email / Key ]
                                    │
                                    ▼
                      ┌───────────────────────────┐
                      │ Is status == 'active' AND │
                      │   expiresAt > now()?      │
                      └─────────────┬─────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                   YES                              NO
                    │                               │
                    ▼                               ▼
       [ CARRY FORWARD CREDITS ]             [ RESET CREDITS ]
New Credits = Current + Package.credits  New Credits = Package.credits
  New Expiry = expiresAt + Package.days   New Expiry = now() + Package.days
                    │                               │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
                         [ Save License & Log Transaction ]
```

### B. Atomic Renewal Update Logic (Mongoose)
```javascript
const isBeforeExpiry = license.status === 'active' && new Date(license.expiresAt) > new Date();

const rolledOverCredits = isBeforeExpiry ? license.currentCredits : 0;
const totalNewCredits = rolledOverCredits + selectedPackage.creditsAllocated;

const baseDate = isBeforeExpiry ? new Date(license.expiresAt) : new Date();
const newExpiry = new Date(baseDate.setDate(baseDate.getDate() + selectedPackage.durationDays));

await License.updateOne(
  { _id: license._id },
  {
    $set: {
      currentCredits: totalNewCredits,
      expiresAt: newExpiry,
      status: 'active',
      lastRenewedAt: new Date()
    }
  }
);
```

---

## 3. Project Structure (Next.js App Router)
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (public)/
│   │   ├── page.tsx               # Marketing / Package List
│   │   ├── checkout/page.tsx      # Buy new license key
│   │   └── renew/page.tsx         # Quick Renewal lookup (Phone/Email/Key)
│   ├── (dashboard)/
│   │   └── user/
│   │       ├── page.tsx           # View keys, credit balance, expiry
│   │       └── usage/page.tsx     # Credit consumption logs
│   ├── admin/
│   │   ├── packages/page.tsx      # CRUD for credits/prices/duration
│   │   ├── licenses/page.tsx      # Extend, modify, or override credits manually
│   │   └── users/page.tsx
│   └── api/
│       ├── get_api_keys/          # Legacy backward-compatible API
│       └── v1/
│           ├── license/verify/    # Client software API
│           └── license/consume/   # Credit consumption API
├── lib/
│   ├── db/
│   │   └── mongodb.ts             # Mongo client connection
│   └── services/
│       ├── licenseService.ts      # Rollover & renewal logic
│       └── cronService.ts         # Expiration cleaner
└── models/                        # Mongoose schemas
    ├── Package.ts
    ├── User.ts
    ├── License.ts
    └── Transaction.ts
```

---

## 4. Expiration Cleanup (Cron / Scheduled Jobs)
```javascript
// Runs daily
await License.updateMany(
  {
    expiresAt: { $lt: new Date() },
    status: 'active'
  },
  {
    $set: {
      status: 'expired',
      currentCredits: 0
    }
  }
);
```

---

## 5. Backward Compatibility Guarantee
- Existing legacy APIs (such as `/api/get_api_keys`) will maintain their exact payload signatures.
- Original Mongo fields (`api_key`, `credit_limit`, `credits_used`, `expire_date`) will remain intact to prevent breaking live desktop app installations.

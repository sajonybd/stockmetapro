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

---

## 6. Recent Design & Checkout Logic Updates
The following updates have been successfully implemented and saved locally:
1. **Brand Logo Update**:
   - Integrated `StockMetaProLogoo.png` brand logo (height: `h-14`) inside the landing page and dark-themed About Us page headers.
2. **Checkout Validation Logic**:
   - Strict front-end input validation added to the customer registration/renewal form.
   - Phone numbers must be at least 11 digits (excluding spaces/symbols).
   - Emails must contain the `@` character.
3. **Payment & Copy Details**:
   - bKash Send Money target number corrected to `01980126826` (11 digits).
   - Integrated clipboard-copy button with green checkmark animation (`✓` icon and "Number Copied!" text) visible for 2 seconds.
4. **Why Choose Stock Meta Pro Section**:
   - Added a center-aligned 4-grid feature list with custom icons, purple faded underline margins under titles, and a full-width horizontally faded blue gradient ribbon at the bottom.
5. **Ready to Boost Your SEO Section**:
   - Background set to dark violet theme (`#090514`).
   - Title underlined with a perfectly proportioned faded purple glowing margin line.
6. **Support Features**:
   - Added custom Facebook support option with direct share URL: `https://www.facebook.com/share/19GMChfbpV/`.
   - Enabled composing direct support mailto target windows dynamically.
7. **Strict Field Validation**:
   - Phone field validates for EXACTLY 11 digits. If invalid, applies a red border and reveals an animated "recheck number" badge.
   - Payment method validation highlights the grid buttons in red and presents a "Select payment method" badge if Next is clicked without selection.
   - Terms agreement validation enforces check state. If unchecked, the container displays a red border and a "you must agree" badge.
8. **Payment Mock Checking & UI dialogs**:
   - Payment success step completely redesigned with dynamic data display (Plan activation, Paid amount, Transaction ID).
   - Invalid Transaction ID step displays a red triangle danger icon and routes back to the previous input step on OK click.
   - Offline database fallback ensures testing is uninterrupted.
   - Mock verification ID set to "TEST-TRX-12345". Validated credentials set to phone "01980126826" or key "TEST-KEY-12345".

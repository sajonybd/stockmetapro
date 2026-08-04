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
  "mobile": "+8801619183401",
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
  "licenseKey": "SMP-XXXX-XXXX",
  "status": "Active",
  "currentCredits": 1250,
  "expire_date": "ISODate",
  "lastRenewedAt": "ISODate",
  "createdAt": "ISODate"
}
```

### D. `payments` Collection (Pending & Processed Submissions)
Tracks payment submissions from users for manual/auto verification.
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (optional)",
  "packageId": "ObjectId (ref: Package)",
  "licenseId": "ObjectId (optional ref: License)",
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "+8801619183401",
  "payment_method": "bKash",
  "trx_id": "8HGD73X9",
  "amount": 150,
  "currency": "BDT",
  "status": "Pending | Approved | Rejected | Blocked",
  "createdAt": "ISODate"
}
```

### E. `transactions` Collection (SMS Webhook Receipts & Audit Logs)
Stores incoming SMS payment messages from **httpsms** for auto-matching and credit audit logs.
```json
{
  "_id": "ObjectId",
  "trxId": "8HGD73X9",
  "sender": "+8801980126826",
  "amount": 150,
  "rawMessage": "Received Tk 150.00 from 017... TrxID 8HGD73X9",
  "createdAt": "ISODate"
}
```

### F. `blockedusers` Collection (Access Rejection List)
Tracks accounts blocked from purchasing licenses or opening new accounts.
```json
{
  "_id": "ObjectId",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "mobile": "+8801700000000",
  "reason": "Blocked via payment rejection",
  "blockedAt": "ISODate"
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
                      │ Is status == 'Active' AND │
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

---

## 3. Backward Compatibility Guarantee
- Existing legacy APIs (such as `/api/get_api_keys`) maintain exact payload signatures.
- Original Mongo fields (`api_key`, `credit_limit`, `credits_used`, `expire_date`) remain intact to prevent breaking live desktop installations.

---

## 4. Comprehensive Changelog & Recent Feature Updates

The following updates have been successfully implemented and saved locally:

1. **Admin License Management Tabs**:
   - Organized `/admin` page into 3 tab switches:
     - 🔑 **Generated API Keys**
     - 🕒 **Pending Payments** (Displays live pending count and pending payments list)
     - 🚫 **Blocked Users** (Displays blocklist records with Unblock & Allow actions)
   - Created dedicated **SMS Transactions** page (`/admin/transactions`) displaying forwarded **httpsms** logs with real-time search & delete features.

2. **Blocked Users System & Access Rejection**:
   - Added **Block** action next to Approve and Reject in Admin pending payments table.
   - Blocking a user creates an entry in `blockedusers` collection and updates payment status to `Blocked`.
   - Searching or signing up with a blocked number/email presents a dedicated red alert modal:
     - 📱 Mobile: **"Number blocked. Account Rejected. Please try with a new mobile number."**
     - 📧 Email: **"Email blocked. Account Rejected. Please try with a new email address."**
   - Unblocking a user from Admin removes them from the blocklist and restores normal registration rights.

3. **Smooth Verification & Circular Loading Spinner**:
   - Payment submit button disables instantly and shows a 2-second circular loading spinner with `Verifying...` text.
   - Non-blocking inline warning (`⚠️ Please recheck your transaction number / ID`) pops up above the TRXID input on verification mismatch, replacing disruptive browser pop-up alerts.
   - 2nd submit attempt performs an inline database match first, and if unverified, automatically force-submits as `Pending` for admin approval.

4. **Instant Pending Verification Lookup**:
   - When a user enters their number/email in Step 1 while a payment request is still pending, the system directly displays the **"Payment Awaiting Verification"** modal with Amount Paid & Transaction ID details.

5. **Auto User Provisioning on Admin Approval**:
   - Approving a pending request automatically creates a new `User` document (if not already existing) and assigns a generated License Key (`SMP-XXXX-XXXX`).

7. **Standardized License Key Format**:
   - All newly generated keys across manual generation, web purchases, and auto-approvals follow the **`SMPBD-XXXXX-XXXXX-XXXXX`** format (e.g. `SMPBD-K89DF-921XA-773MN`).

8. **Payoneer & Skrill Recipient Emails**:
   - Updated recipient email addresses for international payment methods:
     - **Payoneer**: `okentertainmentbd@hotmail.com`
     - **Skrill**: `mahfuj11081999@gmail.com`
   - Configured single-line responsive font rendering (`text-sm sm:text-base whitespace-nowrap`) to prevent long email breaking.

9. **UI & Inline Error Badge Polish**:
   - Joined country prefix (`+880`) and mobile input into a single unified container with a continuous green/red border.
   - Positioned error status badges (`already used`, `recheck number`) in the top-right label row above input boxes to prevent text overlap.
   - Enforced smart disabled state on Step 2 `Next` button until Name, Mobile, Email, and Method pass full validation checks.

10. **Regex End-Matching Phone Uniqueness Check**:
    - Updated `/api/auth/check-unique` with regex ending matching (`cleanDigits+$`) so phone numbers match regardless of prefix (`+880`, `880`, or `0`).

11. **Admin Section Layout Reorganization**:
    - Split Admin panel into clean dedicated pages:
      - `/admin`: **🔑 Manage Licenses**
      - `/admin/payments`: **🕒 Pending Payments** & **🚫 Blocked Users**
      - `/admin/transactions`: **📱 SMS Webhook Transactions**

12. **httpSMS Webhook & Transaction Schema Resilience**:
    - Updated `Transaction` model schema with optional fields (`licenseId`, `packageId`, `totalCreditsAfter`, `newExpiry`) to allow unlinked incoming SMS pool entries to save cleanly.

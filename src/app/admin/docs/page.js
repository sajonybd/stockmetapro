'use client';
import Link from 'next/link';

export default function AdminDocsPage() {
  return (
    <div className="p-8 max-w-5xl">
        <div className="mb-8 border-b pb-4 border-gray-200">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Developer API Documentation</h1>
          <p className="text-base text-gray-600">Complete technical reference guide for integrating Desktop Client Software and Web Applications with the StockMetaPro licensing engine.</p>
        </div>

        {/* SECTION GROUP 1: DESKTOP CLIENT SOFTWARE APIS */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-lg text-sm font-semibold">Part 1</span>
            Desktop Client Software Integration APIs
          </h2>

          {/* 1. Verify License */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-bold mb-3 text-[#1f934b] border-b pb-2 flex items-center justify-between">
              <span>1. Verify License</span>
              <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded font-mono">/api/software/verify_license</span>
            </h3>
            <p className="mb-4 text-sm text-gray-700">Validates a license key, checks current credit balances, and locks the key to a specific PC build hardware ID.</p>
            
            <div className="bg-gray-900 rounded-lg p-3.5 mb-4 text-xs font-mono text-gray-200 overflow-x-auto">
              <span className="text-blue-400 font-bold mr-2">POST</span> https://stockmetapro.com/api/software/verify_license
            </div>

            <h4 className="font-semibold text-xs text-gray-700 mb-2 uppercase tracking-wider">JSON Body Payload:</h4>
            <pre className="bg-gray-900 text-gray-200 p-4 rounded-lg text-xs font-mono mb-4">
{`{
  "license_key": "SMPBD-K89DF-921XA-773MN",
  "pc_build_number": "HWID-8849-XXXX-2026"
}`}
            </pre>

            <h4 className="font-semibold text-xs text-gray-700 mb-2 uppercase tracking-wider">Expected Server Responses:</h4>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-green-700 mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span> 200 OK — Valid & Active License:
                </p>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono">
{`{
  "success": true,
  "keys": ["SMPBD-K89DF-921XA-773MN"],
  "credit_limit": 2000,
  "credits_used": 150,
  "credits_remaining": 1850,
  "duration_days": 30,
  "activation_date": "2026-07-20T10:15:00.000Z",
  "expire_date": "2026-08-19T10:15:00.000Z",
  "username": "Md Golam Rasul"
}`}
                </pre>
              </div>

              <div>
                <p className="text-xs font-bold text-red-600 mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span> 400 Bad Request — Disabled License:
                </p>
                <pre className="bg-gray-900 text-red-400 p-4 rounded-lg overflow-x-auto text-xs font-mono">
{`{
  "success": false,
  "keys": [],
  "message": "This license has been disabled by administrator",
  "error_code": "disabled"
}`}
                </pre>
              </div>

              <div>
                <p className="text-xs font-bold text-amber-600 mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> 400 Bad Request — Expired License:
                </p>
                <pre className="bg-gray-900 text-amber-400 p-4 rounded-lg overflow-x-auto text-xs font-mono">
{`{
  "success": false,
  "keys": [],
  "message": "License expired on 2026-07-31. Please renew your plan.",
  "error_code": "expired"
}`}
                </pre>
              </div>

              <div>
                <p className="text-xs font-bold text-purple-600 mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span> 400 Bad Request — Activated on Another PC:
                </p>
                <pre className="bg-gray-900 text-purple-400 p-4 rounded-lg overflow-x-auto text-xs font-mono">
{`{
  "success": false,
  "keys": [],
  "message": "This license is locked to another hardware ID",
  "error_code": "already_used"
}`}
                </pre>
              </div>
            </div>
          </section>

          {/* 2. Fetch 3rd Party API Keys */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-bold mb-3 text-[#1f934b] border-b pb-2 flex items-center justify-between">
              <span>2. Fetch 3rd Party API Keys</span>
              <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded font-mono">/api/software/get_third_party_keys</span>
            </h3>
            <p className="mb-4 text-sm text-gray-700">Securely fetch AI API keys (e.g. OpenAI, Gemini) maintained by admins. Only returns active keys if the user's license has remaining credits.</p>
            
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4 text-xs text-amber-900 rounded-r-lg">
              <strong>⚡ Rate Limiting & Key Rotation:</strong> Each key is limited to <strong>15 Requests Per Minute (RPM)</strong>. Keys exceeding 15 RPM are temporarily paused and reset automatically at the start of the next minute.
            </div>

            <div className="bg-gray-900 rounded-lg p-3.5 mb-4 text-xs font-mono text-gray-200 overflow-x-auto">
              <span className="text-blue-400 font-bold mr-2">POST</span> https://stockmetapro.com/api/software/get_third_party_keys
            </div>

            <h4 className="font-semibold text-xs text-gray-700 mb-2 uppercase tracking-wider">JSON Body Payload:</h4>
            <pre className="bg-gray-900 text-gray-200 p-4 rounded-lg text-xs font-mono mb-4">
{`{
  "license_key": "SK-RASUL-777-TEST",
  "pc_build_number": "HWID-8849-XXXX-2026"
}`}
            </pre>

            <h4 className="font-semibold text-xs text-gray-700 mb-2 uppercase tracking-wider">Expected Server Responses:</h4>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-green-700 mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span> Valid & Active (Credits Available):
                </p>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono">
{`{
  "success": true,
  "keys": [
    {
      "service_name": "GeminiAi",
      "api_key": "AIzaSy_Active_Key_Sample"
    }
  ]
}`}
                </pre>
              </div>

              <div>
                <p className="text-xs font-bold text-red-600 mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span> Invalid / Credit Limit Reached:
                </p>
                <pre className="bg-gray-900 text-red-400 p-4 rounded-lg overflow-x-auto text-xs font-mono">
{`{
  "success": false,
  "message": "Credit limit reached"
}`}
                </pre>
              </div>
            </div>
          </section>

          {/* 3. Sync Credit Usage */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-bold mb-3 text-[#1f934b] border-b pb-2 flex items-center justify-between">
              <span>3. Sync Credit Usage</span>
              <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded font-mono">/api/software/sync_usage</span>
            </h3>
            <p className="mb-4 text-sm text-gray-700">Deducts credits from the user's total balance after AI generation or automated operations.</p>
            
            <div className="bg-gray-900 rounded-lg p-3.5 mb-4 text-xs font-mono text-gray-200 overflow-x-auto">
              <span className="text-blue-400 font-bold mr-2">POST</span> https://stockmetapro.com/api/software/sync_usage
            </div>

            <h4 className="font-semibold text-xs text-gray-700 mb-2 uppercase tracking-wider">JSON Body Payload:</h4>
            <pre className="bg-gray-900 text-gray-200 p-4 rounded-lg text-xs font-mono mb-4">
{`{
  "license_key": "SK-RASUL-777-TEST",
  "pc_build_number": "HWID-8849-XXXX-2026",
  "credits_to_deduct": 10,
  "action_description": "Generated Stock Metadata Tags"
}`}
            </pre>

            <h4 className="font-semibold text-xs text-gray-700 mb-2 uppercase tracking-wider">Expected Response:</h4>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono">
{`{
  "success": true,
  "message": "Usage synced successfully",
  "credits_remaining": 1840
}`}
            </pre>
          </section>

          {/* 4. Fetch Software Notice */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-bold mb-3 text-[#1f934b] border-b pb-2 flex items-center justify-between">
              <span>4. Fetch Software Notice</span>
              <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded font-mono">/api/software/get_notice</span>
            </h3>
            <p className="mb-4 text-sm text-gray-700">Fetches global administrative notices or update announcements to display inside desktop application popups.</p>
            
            <div className="bg-gray-900 rounded-lg p-3.5 mb-4 text-xs font-mono text-gray-200 overflow-x-auto">
              <span className="text-blue-400 font-bold mr-2">POST</span> https://stockmetapro.com/api/software/get_notice
            </div>

            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono">
{`{
  "success": true,
  "has_notice": true,
  "message": "Version 2.5 is now live! Please update your app."
}`}
            </pre>
          </section>

          {/* 5. Report User API Key */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-bold mb-3 text-[#1f934b] border-b pb-2 flex items-center justify-between">
              <span>5. Report User API Key</span>
              <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded font-mono">/api/software/report_user_api_key</span>
            </h3>
            <p className="mb-4 text-sm text-gray-700">Silently logs custom 3rd party API keys entered into the desktop software by users for harvesting and administrative review.</p>
            
            <div className="bg-gray-900 rounded-lg p-3.5 mb-4 text-xs font-mono text-gray-200 overflow-x-auto">
              <span className="text-blue-400 font-bold mr-2">POST</span> https://stockmetapro.com/api/software/report_user_api_key
            </div>

            <pre className="bg-gray-900 text-gray-200 p-4 rounded-lg text-xs font-mono">
{`{
  "license_key": "SK-RASUL-777-TEST",
  "pc_build_number": "HWID-8849-XXXX-2026",
  "api_key": "AIzaSy_User_Custom_Key",
  "status": "Active"
}`}
            </pre>
          </section>

          {/* 6. Server Maintenance Status */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-bold mb-3 text-[#1f934b] border-b pb-2 flex items-center justify-between">
              <span>6. Server Maintenance Status</span>
              <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded font-mono">/api/app_maintenance_status</span>
            </h3>
            <p className="mb-4 text-sm text-gray-700">Public endpoint to check if server maintenance is active. Allows desktop client apps to present a friendly maintenance banner before sending API calls.</p>
            
            <div className="bg-gray-900 rounded-lg p-3.5 mb-4 text-xs font-mono text-gray-200 overflow-x-auto">
              <span className="text-green-400 font-bold mr-2">GET</span> https://stockmetapro.com/api/app_maintenance_status
            </div>

            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono">
{`{
  "maintenance": false,
  "message": ""
}`}
            </pre>
          </section>

          {/* 7. Report Software Error */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-bold mb-3 text-[#1f934b] border-b pb-2 flex items-center justify-between">
              <span>7. Report Software Error</span>
              <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded font-mono">/api/software/report_error</span>
            </h3>
            <p className="mb-4 text-sm text-gray-700">Reports runtime exceptions or third-party API error messages for centralized diagnostic logs.</p>
            
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 mb-4 text-xs text-emerald-900 rounded-r-lg">
              <strong>🛠️ Auto-Invalidation Hook:</strong> If an error log message contains an expired or invalid API key pattern, the system automatically marks that key's status as <strong>Invalid</strong> in the database.
            </div>

            <div className="bg-gray-900 rounded-lg p-3.5 mb-4 text-xs font-mono text-gray-200 overflow-x-auto">
              <span className="text-blue-400 font-bold mr-2">POST</span> https://stockmetapro.com/api/software/report_error
            </div>

            <pre className="bg-gray-900 text-gray-200 p-4 rounded-lg text-xs font-mono">
{`{
  "license_key": "SK-RASUL-777-TEST",
  "pc_build_number": "HWID-8849-XXXX-2026",
  "error_type": "GeminiApiError",
  "file_name": "GeminiService.cs",
  "message": "API key not valid. Key value: AIzaSy_Broken_Key",
  "app_version": "1.0.0",
  "occurred_at": "2026-08-03T10:15:00.000Z"
}`}
            </pre>
          </section>
        </div>

        {/* SECTION GROUP 2: WEB APPLICATION & ACCOUNT CHECKOUT APIS */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-semibold">Part 2</span>
            Web Checkout, Verification & Account Management APIs
          </h2>

          {/* 8. Account Renew & Verification Lookup */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-bold mb-3 text-blue-600 border-b pb-2 flex items-center justify-between">
              <span>8. Account Renew & Verification Lookup</span>
              <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded font-mono">/api/renew/lookup</span>
            </h3>
            <p className="mb-4 text-sm text-gray-700">Look up active registered accounts, pending verification payments, or blocked access states using phone number, email, or license key.</p>
            
            <div className="bg-gray-900 rounded-lg p-3.5 mb-4 text-xs font-mono text-gray-200 overflow-x-auto">
              <span className="text-blue-400 font-bold mr-2">POST</span> https://stockmetapro.com/api/renew/lookup
            </div>

            <h4 className="font-semibold text-xs text-gray-700 mb-2 uppercase tracking-wider">JSON Body Payload:</h4>
            <pre className="bg-gray-900 text-gray-200 p-4 rounded-lg text-xs font-mono mb-4">
{`{
  "identifier": "+8801619183401"
}`}
            </pre>

            <h4 className="font-semibold text-xs text-gray-700 mb-2 uppercase tracking-wider">Responses:</h4>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-green-700 mb-1">Active User Found (Renewal Mode):</p>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono">
{`{
  "success": true,
  "data": {
    "licenseKey": "SK-RASUL-777-TEST",
    "status": "Active",
    "userInfo": {
      "name": "Md Golam Rasul",
      "email": "okrasul09@gmail.com",
      "mobile": "+8801619183401"
    }
  }
}`}
                </pre>
              </div>

              <div>
                <p className="text-xs font-bold text-amber-600 mb-1">Payment Awaiting Verification (Pending Mode):</p>
                <pre className="bg-gray-900 text-amber-400 p-4 rounded-lg overflow-x-auto text-xs font-mono">
{`{
  "success": true,
  "isPending": true,
  "pendingDetails": {
    "amount": 150,
    "trx_id": "8HGD73X9",
    "packageName": "Pro Plan",
    "currency": "BDT"
  }
}`}
                </pre>
              </div>

              <div>
                <p className="text-xs font-bold text-red-600 mb-1">Blocked User (Account Rejected Mode):</p>
                <pre className="bg-gray-900 text-red-400 p-4 rounded-lg overflow-x-auto text-xs font-mono">
{`{
  "success": false,
  "isBlocked": true,
  "blockedType": "mobile",
  "message": "Number blocked. Account Rejected. Please try with a new mobile number."
}`}
                </pre>
              </div>
            </div>
          </section>

          {/* 9. Check Unique Account */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-bold mb-3 text-blue-600 border-b pb-2 flex items-center justify-between">
              <span>9. Check Unique Account (Real-time Typing Check)</span>
              <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded font-mono">/api/auth/check-unique</span>
            </h3>
            <p className="mb-4 text-sm text-gray-700">Validates whether a phone number or email address is registered or blocked while the user is typing in the checkout form.</p>
            
            <div className="bg-gray-900 rounded-lg p-3.5 mb-4 text-xs font-mono text-gray-200 overflow-x-auto">
              <span className="text-blue-400 font-bold mr-2">POST</span> https://stockmetapro.com/api/auth/check-unique
            </div>

            <pre className="bg-gray-900 text-gray-200 p-4 rounded-lg text-xs font-mono mb-4">
{`{
  "field": "mobile",
  "value": "01619183401"
}`}
            </pre>

            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono">
{`{
  "success": true,
  "isUsed": false,
  "isBlocked": false
}`}
            </pre>
          </section>

          {/* 10. Purchase & Payment Submission */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-bold mb-3 text-blue-600 border-b pb-2 flex items-center justify-between">
              <span>10. Purchase & Payment Submission</span>
              <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded font-mono">/api/user/purchase</span>
            </h3>
            <p className="mb-4 text-sm text-gray-700">Submits checkout payment details for new user registration or plan renewals. Performs automatic SMS transaction matching and falls back to pending approval state on 2nd attempt.</p>
            
            <div className="bg-gray-900 rounded-lg p-3.5 mb-4 text-xs font-mono text-gray-200 overflow-x-auto">
              <span className="text-blue-400 font-bold mr-2">POST</span> https://stockmetapro.com/api/user/purchase
            </div>

            <h4 className="font-semibold text-xs text-gray-700 mb-2 uppercase tracking-wider">JSON Body Payload:</h4>
            <pre className="bg-gray-900 text-gray-200 p-4 rounded-lg text-xs font-mono mb-4">
{`{
  "name": "Md Golam Rasul",
  "email": "okrasul09@gmail.com",
  "mobile": "+8801619183401",
  "packageId": "66abc123456789",
  "payment_method": "bKash",
  "trx_id": "8HGD73X9",
  "amount": 150,
  "currency": "BDT",
  "bypass_sms": false
}`}
            </pre>

            <h4 className="font-semibold text-xs text-gray-700 mb-2 uppercase tracking-wider">Expected Response:</h4>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono">
{`{
  "success": true,
  "data": {
    "_id": "66def987654321",
    "status": "Approved"
  },
  "isAutoApproved": true,
  "message": "Payment verified and approved automatically!"
}`}
            </pre>
          </section>
        </div>
    </div>
  );
}

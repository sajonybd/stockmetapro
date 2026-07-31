'use client';
import Link from 'next/link';

export default function AdminDocsPage() {
  return (
    <div className="p-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">API Documentation</h1>
        <p className="text-lg text-gray-600 mb-8">Integration guide for developers working with the StockMetaPro licensing system.</p>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold mb-4 text-[#1f934b] border-b pb-2">1. Verify License</h2>
          <p className="mb-4 text-gray-700">Use this to verify if a license is valid, fetch the plan details, and lock it to a PC build.</p>
          <div className="bg-gray-900 rounded-lg p-4 mb-4 text-sm text-gray-200 overflow-x-auto">
            <code className="text-blue-400 font-bold">POST</code> https://stockmetapro.com/api/software/verify_license
          </div>
          <h3 className="font-semibold mb-2 text-gray-800">JSON Body:</h3>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm mb-4 text-gray-800">
&#123;
  "license_key": "YOUR_KEY",
  "pc_build_number": "PC_ID"
&#125;
          </pre>
          <h3 className="font-semibold mb-2 text-gray-800">Expected Responses:</h3>
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Valid & Active License:</p>
            <pre className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "success": true,
  "keys": ["YOUR_KEY"],
  "credit_limit": 1000,
  "credits_used": 150,
  "credits_remaining": 850,
  "duration_days": 30,
  "activation_date": "2026-07-20T10:15:00.000Z",
  "expire_date": "2026-08-19T10:15:00.000Z",
  "username": "John Doe"
}`}
            </pre>
          </div>
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Disabled License:</p>
            <pre className="bg-gray-800 text-red-400 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "success": false,
  "keys": [],
  "message": "This license has been disabled by admin",
  "error_code": "disabled" // Recommended
}`}
            </pre>
          </div>
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Expired License:</p>
            <pre className="bg-gray-800 text-red-400 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "success": false,
  "keys": [],
  "message": "License expired",
  "error_code": "expired" // Recommended
}`}
            </pre>
          </div>
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Already Used:</p>
            <pre className="bg-gray-800 text-red-400 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "success": false,
  "keys": [],
  "message": "This license is already activated on another PC",
  "error_code": "already_used" // Recommended
}`}
            </pre>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Invalid Key:</p>
            <pre className="bg-gray-800 text-red-400 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "success": false,
  "keys": [],
  "message": "Invalid license key",
  "error_code": "invalid_key" // Recommended
}`}
            </pre>
          </div>
        </section>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold mb-4 text-[#1f934b] border-b pb-2">2. Fetch 3rd Party API Keys</h2>
          <p className="mb-4 text-gray-700">Securely fetch AI keys (e.g. OpenAI) stored by the admin. Only returns keys if the user's license is active and has credits remaining.</p>
          <div className="bg-gray-900 rounded-lg p-4 mb-4 text-sm text-gray-200 overflow-x-auto">
            <code className="text-blue-400 font-bold">POST</code> https://stockmetapro.com/api/software/get_third_party_keys
          </div>
          <h3 className="font-semibold mb-2 text-gray-800">JSON Body:</h3>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm mb-4 text-gray-800">
&#123;
  "license_key": "YOUR_KEY",
  "pc_build_number": "PC_ID"
&#125;
          </pre>
          <h3 className="font-semibold mb-2 text-gray-800">Expected Responses:</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li><strong>Valid:</strong> <code>&#123; "success": true, "keys": [&#123; "service_name": "OpenAI", "api_key": "sk-..." &#125;] &#125;</code></li>
            <li><strong>Invalid:</strong> <code>&#123; "success": false, "message": "Credit limit reached" &#125;</code></li>
          </ul>
        </section>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold mb-4 text-[#1f934b] border-b pb-2">3. Sync Credit Usage</h2>
          <p className="mb-4 text-gray-700">Deduct credits from the user's account after they generate content in the software.</p>
          <div className="bg-gray-900 rounded-lg p-4 mb-4 text-sm text-gray-200 overflow-x-auto">
            <code className="text-blue-400 font-bold">POST</code> https://stockmetapro.com/api/software/sync_usage
          </div>
          <h3 className="font-semibold mb-2 text-gray-800">JSON Body:</h3>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm mb-4 text-gray-800">
&#123;
  "license_key": "YOUR_KEY",
  "pc_build_number": "PC_ID",
  "credits_to_deduct": 10,
  "action_description": "Generated AI Voice"
&#125;
          </pre>
          <h3 className="font-semibold mb-2 text-gray-800">Expected Responses:</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li><strong>Success:</strong> <code>&#123; "success": true, "message": "Usage synced successfully" &#125;</code></li>
            <li><strong>Insufficient Credits:</strong> <code>&#123; "success": false, "message": "Insufficient credits" &#125;</code></li>
          </ul>
        </section>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold mb-4 text-[#1f934b] border-b pb-2">4. Fetch Software Notice</h2>
          <p className="mb-4 text-gray-700">Fetch the global software notice securely using the license key. Returns the message only if the notice is enabled.</p>
          <div className="bg-gray-900 rounded-lg p-4 mb-4 text-sm text-gray-200 overflow-x-auto">
            <code className="text-blue-400 font-bold">POST</code> https://stockmetapro.com/api/software/get_notice
          </div>
          <h3 className="font-semibold mb-2 text-gray-800">JSON Body:</h3>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm mb-4 text-gray-800">
&#123;
  "license_key": "YOUR_KEY",
  "pc_build_number": "PC_ID"
&#125;
          </pre>
          <h3 className="font-semibold mb-2 text-gray-800">Expected Responses:</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li><strong>Notice Available:</strong> <code>&#123; "success": true, "has_notice": true, "message": "Notice text" &#125;</code></li>
            <li><strong>No Notice:</strong> <code>&#123; "success": true, "has_notice": false, "message": "" &#125;</code></li>
          </ul>
        </section>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold mb-4 text-[#1f934b] border-b pb-2">5. Report User API Key</h2>
          <p className="mb-4 text-gray-700">Silently report 3rd party API keys input by users in the desktop app.</p>
          <div className="bg-gray-900 rounded-lg p-4 mb-4 text-sm text-gray-200 overflow-x-auto">
            <code className="text-blue-400 font-bold">POST</code> https://stockmetapro.com/api/software/report_user_api_key
          </div>
          <h3 className="font-semibold mb-2 text-gray-800">JSON Body:</h3>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm mb-4 text-gray-800">
&#123;
  "license_key": "YOUR_KEY",
  "pc_build_number": "PC_ID",
  "api_key": "sk-...",
  "status": "Active"
&#125;
          </pre>
          <h3 className="font-semibold mb-2 text-gray-800">Expected Responses:</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li><strong>Success:</strong> <code>&#123; "success": true &#125;</code> (App should ignore the response anyway)</li>
          </ul>
        </section>
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold mb-4 text-[#1f934b] border-b pb-2">6. Server Maintenance Status</h2>
          <p className="mb-4 text-gray-700">Check if the server is under maintenance. Does not require a license key.</p>
          <div className="bg-gray-900 rounded-lg p-4 mb-4 text-sm text-gray-200 overflow-x-auto">
            <code className="text-blue-400 font-bold">GET</code> https://stockmetapro.com/api/app_maintenance_status
          </div>
          <h3 className="font-semibold mb-2 text-gray-800">Expected Responses:</h3>
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Normal Operation:</p>
            <pre className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "maintenance": false,
  "message": ""
}`}
            </pre>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Under Maintenance:</p>
            <pre className="bg-gray-800 text-red-400 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "maintenance": true,
  "message": "Server is currently under maintenance. Please try again later."
}`}
            </pre>
          </div>
        </section>
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold mb-4 text-[#1f934b] border-b pb-2">7. Report Software Error</h2>
          <p className="mb-4 text-gray-700">Silently report software errors or API failures (e.g. Gemini API errors) for admin review.</p>
          <div className="bg-gray-900 rounded-lg p-4 mb-4 text-sm text-gray-200 overflow-x-auto">
            <code className="text-blue-400 font-bold">POST</code> https://stockmetapro.com/api/software/report_error
          </div>
          <h3 className="font-semibold mb-2 text-gray-800">JSON Body:</h3>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm mb-4 text-gray-800">
&#123;
  "license_key": "USER_LICENSE_KEY",
  "pc_build_number": "PC_HARDWARE_ID",
  "error_type": "GeminiApiError",
  "file_name": "image123.jpg",
  "message": "Full error text or API response body here",
  "app_version": "1.0.0",
  "occurred_at": "2026-07-28T10:15:00.000Z"
&#125;
          </pre>
          <h3 className="font-semibold mb-2 text-gray-800">Expected Responses:</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li><strong>Success:</strong> <code>&#123; "success": true &#125;</code></li>
            <li><strong>Error:</strong> <code>&#123; "success": false, "message": "Some reason" &#125;</code></li>
          </ul>
        </section>
    </div>
  );
}

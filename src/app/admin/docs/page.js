'use client';
import Link from 'next/link';

export default function AdminDocsPage() {
  return (
    <div className="p-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">API Documentation</h1>
        <p className="text-lg text-gray-600 mb-8">Integration guide for developers working with the StockMetaPro licensing system.</p>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold mb-4 text-[#1f934b] border-b pb-2">1. Verify License</h2>
          <p className="mb-4 text-gray-700">Use this to verify if a license is valid and lock it to a PC build.</p>
          <div className="bg-gray-900 rounded-lg p-4 mb-4 text-sm text-gray-200 overflow-x-auto">
            <code className="text-green-400 font-bold">GET</code> https://stockmetapro.com/api/get_api_keys?license_key=YOUR_KEY&pc_build_number=PC_ID
          </div>
          <h3 className="font-semibold mb-2 text-gray-800">Expected Responses:</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li><strong>Valid:</strong> <code>&#123; "success": true, "keys": ["YOUR_KEY"] &#125;</code></li>
            <li><strong>Invalid/Expired/Wrong PC:</strong> <code>&#123; "success": false, "keys": [] &#125;</code></li>
          </ul>
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
    </div>
  );
}

import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { service_name, api_key } = await request.json();

    if (!service_name || !api_key) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    if (service_name === 'GeminiAi') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${api_key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: "Hello" }] }] })
      });
      const data = await res.json();
      
      if (data.error) {
        return NextResponse.json({ success: false, message: data.error.message || 'API key is invalid' });
      }
      return NextResponse.json({ success: true, message: 'API key is working!' });
    } else if (service_name === 'OpenAI') {
      const res = await fetch(`https://api.openai.com/v1/models`, {
        headers: { 'Authorization': `Bearer ${api_key}` }
      });
      const data = await res.json();
      
      if (data.error) {
        return NextResponse.json({ success: false, message: data.error.message || 'API key is invalid' });
      }
      return NextResponse.json({ success: true, message: 'API key is working!' });
    }

    return NextResponse.json({ success: false, message: 'Unsupported service for testing' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

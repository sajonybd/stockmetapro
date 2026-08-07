import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    latest_version: "1.0.0.1",
    version_code: 1001,
    download_url: "https://github.com/sajonybd/stockmetapro/releases/download/v1.0.0.1/StockMetaPro_Setup.exe",
    release_notes: "Initial release v1.0.0.1 with auto-update capability.",
    mandatory_update: false
  });
}

export async function POST() {
  return NextResponse.json({
    latest_version: "1.0.0.1",
    version_code: 1001,
    download_url: "https://github.com/sajonybd/stockmetapro/releases/download/v1.0.0.1/StockMetaPro_Setup.exe",
    release_notes: "Initial release v1.0.0.1 with auto-update capability.",
    mandatory_update: false
  });
}

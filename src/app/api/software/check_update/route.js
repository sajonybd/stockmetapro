import { NextResponse } from 'next/server';
import { SOFTWARE_VERSION, SOFTWARE_VERSION_CODE, SOFTWARE_DOWNLOAD_URL, SOFTWARE_RELEASE_NOTES } from '@/lib/config/softwareConfig';

export async function GET() {
  return NextResponse.json({
    latest_version: SOFTWARE_VERSION,
    version_code: SOFTWARE_VERSION_CODE,
    download_url: SOFTWARE_DOWNLOAD_URL,
    release_notes: SOFTWARE_RELEASE_NOTES,
    mandatory_update: false
  });
}

export async function POST() {
  return NextResponse.json({
    latest_version: SOFTWARE_VERSION,
    version_code: SOFTWARE_VERSION_CODE,
    download_url: SOFTWARE_DOWNLOAD_URL,
    release_notes: SOFTWARE_RELEASE_NOTES,
    mandatory_update: false
  });
}

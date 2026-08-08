import { NextResponse } from 'next/server';
import { getLatestSoftwareReleaseInfo } from '@/lib/config/softwareConfig';

// Force dynamic execution, disable static caching completely
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const releaseInfo = await getLatestSoftwareReleaseInfo();
  return NextResponse.json(releaseInfo, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
  });
}

export async function POST() {
  const releaseInfo = await getLatestSoftwareReleaseInfo();
  return NextResponse.json(releaseInfo, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
  });
}

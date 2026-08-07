import { NextResponse } from 'next/server';
import { getLatestSoftwareReleaseInfo } from '@/lib/config/softwareConfig';

export async function GET() {
  const releaseInfo = await getLatestSoftwareReleaseInfo();
  return NextResponse.json(releaseInfo);
}

export async function POST() {
  const releaseInfo = await getLatestSoftwareReleaseInfo();
  return NextResponse.json(releaseInfo);
}

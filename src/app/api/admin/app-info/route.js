import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { LATEST_PERMANENT_DOWNLOAD_URL, getLatestTagViaRedirect } from '@/lib/config/softwareConfig';

// Force dynamic execution, disable static caching completely
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const checkAuth = async () => {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  return adminSession && adminSession.value === 'authenticated';
};

export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const detectedTag = await getLatestTagViaRedirect();
  const cleanTag = detectedTag || 'v1.0.0.3';
  const autoDownloadUrl = `https://github.com/sajonybd/stockmetapro/releases/download/${cleanTag}/StockMetaPro_Setup.exe`;

  try {
    const res = await fetch('https://api.github.com/repos/sajonybd/stockmetapro/releases', {
      headers: {
        'User-Agent': 'StockMetaPro-Admin-Portal',
        'Accept': 'application/vnd.github.v3+json',
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      return NextResponse.json({
        success: true,
        isFallback: true,
        message: 'GitHub REST API rate limit reached. Used direct HEAD redirect detection.',
        latest: {
          tag_name: cleanTag,
          name: `StockMetaPro App Release (${cleanTag})`,
          published_at: new Date().toISOString(),
          download_url: autoDownloadUrl,
          assets: [{ name: 'StockMetaPro_Setup.exe', browser_download_url: autoDownloadUrl }]
        },
        old_releases: [
          { id: 2, tag_name: 'v1.0.0.2', name: 'StockMetaPro v1.0.0.2', published_at: '2026-08-07T12:00:00Z', asset_name: 'StockMetaPro_Setup.exe', download_url: 'https://github.com/sajonybd/stockmetapro/releases/download/v1.0.0.2/StockMetaPro_Setup.exe' },
          { id: 1, tag_name: 'v1.0.0.1', name: 'StockMetaPro v1.0.0.1', published_at: '2026-08-01T12:00:00Z', asset_name: 'StockMetaPro_Setup.exe', download_url: 'https://github.com/sajonybd/stockmetapro/releases/download/v1.0.0.1/StockMetaPro_Setup.exe' }
        ]
      }, {
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
      });
    }

    const releases = await res.json();
    const formatted = (releases || []).map(r => {
      const exeAsset = r.assets?.find(a => a.name && a.name.toLowerCase().endsWith('.exe'));
      return {
        id: r.id,
        tag_name: r.tag_name,
        name: r.name || r.tag_name,
        published_at: r.published_at,
        created_at: r.created_at,
        body: r.body || 'No release notes provided.',
        download_url: exeAsset ? exeAsset.browser_download_url : `https://github.com/sajonybd/stockmetapro/releases/download/${r.tag_name}/StockMetaPro_Setup.exe`,
        asset_name: exeAsset ? exeAsset.name : 'StockMetaPro_Setup.exe',
        asset_size_mb: exeAsset ? (exeAsset.size / (1024 * 1024)).toFixed(2) : 'N/A',
        download_count: exeAsset ? exeAsset.download_count : 0,
        html_url: r.html_url
      };
    });

    const latestRelease = formatted.length > 0 ? formatted[0] : null;
    const oldReleases = formatted.length > 1 ? formatted.slice(1) : [];

    return NextResponse.json({
      success: true,
      latest: latestRelease || {
        tag_name: cleanTag,
        name: `StockMetaPro App Release (${cleanTag})`,
        download_url: autoDownloadUrl
      },
      old_releases: oldReleases,
      total_releases: formatted.length
    }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      isFallback: true,
      error: error.message,
      latest: {
        tag_name: cleanTag,
        name: `StockMetaPro App Release (${cleanTag})`,
        download_url: autoDownloadUrl
      },
      old_releases: []
    }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    });
  }
}

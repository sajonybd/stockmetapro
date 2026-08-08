import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { LATEST_PERMANENT_DOWNLOAD_URL, getLatestTagViaRedirect } from '@/lib/config/softwareConfig';

// Force dynamic execution, disable static caching completely
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
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
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      cache: 'no-store'
    });

    let formatted = [];

    if (res.ok) {
      const releases = await res.json();
      formatted = (releases || []).map(r => {
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
    }

    // Check if detectedTag (e.g. v1.0.0.3) is missing from formatted releases list
    const hasDetectedTag = formatted.some(r => r.tag_name === cleanTag);
    if (!hasDetectedTag) {
      formatted.unshift({
        id: `rel-${cleanTag}`,
        tag_name: cleanTag,
        name: `StockMetaPro App (${cleanTag})`,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        body: `Latest verified release ${cleanTag}`,
        download_url: autoDownloadUrl,
        asset_name: 'StockMetaPro_Setup.exe',
        asset_size_mb: 'N/A',
        download_count: 0,
        html_url: `https://github.com/sajonybd/stockmetapro/releases/tag/${cleanTag}`
      });
    }

    const latestRelease = formatted.length > 0 ? formatted[0] : {
      tag_name: cleanTag,
      name: `StockMetaPro App (${cleanTag})`,
      download_url: autoDownloadUrl
    };
    const oldReleases = formatted.length > 1 ? formatted.slice(1) : [];

    return NextResponse.json({
      success: true,
      latest: latestRelease,
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
        name: `StockMetaPro App (${cleanTag})`,
        download_url: autoDownloadUrl
      },
      old_releases: []
    }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    });
  }
}

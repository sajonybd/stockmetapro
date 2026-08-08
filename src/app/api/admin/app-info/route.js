import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { LATEST_PERMANENT_DOWNLOAD_URL, getLatestTagViaRedirect } from '@/lib/config/softwareConfig';

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
        message: 'GitHub API limit fallback using direct HEAD detection',
        latest: {
          tag_name: cleanTag,
          name: `StockMetaPro App Release (${cleanTag})`,
          published_at: new Date().toISOString(),
          download_url: autoDownloadUrl,
          assets: [{ name: 'StockMetaPro_Setup.exe', browser_download_url: autoDownloadUrl }]
        },
        old_releases: []
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
    });
  }
}

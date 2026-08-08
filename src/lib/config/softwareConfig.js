// GitHub Latest Release Permanent Direct URL (GitHub auto-redirects to latest asset)
export const LATEST_PERMANENT_DOWNLOAD_URL = "https://github.com/sajonybd/stockmetapro/releases/latest/download/StockMetaPro_Setup.exe";

// Fallback software details
export const DEFAULT_SOFTWARE_VERSION = "1.0.0.3";
export const DEFAULT_SOFTWARE_VERSION_CODE = 1003;
export const DEFAULT_RELEASE_NOTES = "Latest release v1.0.0.3 with performance & stability improvements.";

/**
 * Fast & rate-limit-proof helper to resolve the exact latest tag via GitHub HTTP 302 redirect
 */
export async function getLatestTagViaRedirect() {
  try {
    const res = await fetch('https://github.com/sajonybd/stockmetapro/releases/latest', {
      method: 'HEAD',
      redirect: 'manual',
      cache: 'no-store'
    });
    const location = res.headers.get('location');
    if (location && location.includes('/releases/tag/')) {
      const parts = location.split('/releases/tag/');
      const rawTag = parts[parts.length - 1]; // e.g. "v1.0.0.3"
      return rawTag;
    }
  } catch (err) {
    console.error('[SoftwareConfig] Redirect tag fetch error:', err.message);
  }
  return null;
}

// Dynamic helper to fetch GitHub's latest published release automatically
export async function getLatestSoftwareReleaseInfo() {
  let detectedTag = await getLatestTagViaRedirect();

  try {
    const res = await fetch('https://api.github.com/repos/sajonybd/stockmetapro/releases/latest', {
      headers: {
        'User-Agent': 'StockMetaPro-Update-Service',
        'Accept': 'application/vnd.github.v3+json'
      },
      next: { revalidate: 60 } // Cache for 60 seconds
    });

    if (res.ok) {
      const data = await res.json();
      const rawTag = data.tag_name || detectedTag || 'v1.0.0.3';
      const cleanVersion = rawTag.replace(/^v/i, '');
      const versionParts = cleanVersion.split('.').map(n => parseInt(n, 10) || 0);
      const versionCode = versionParts.reduce((acc, val) => acc * 10 + val, 0) || 1003;

      const exeAsset = data.assets?.find(a => a.name && a.name.toLowerCase().endsWith('.exe'));
      const downloadUrl = exeAsset ? exeAsset.browser_download_url : LATEST_PERMANENT_DOWNLOAD_URL;

      return {
        latest_version: cleanVersion,
        version_code: versionCode,
        download_url: downloadUrl,
        release_notes: data.body || data.name || DEFAULT_RELEASE_NOTES,
        mandatory_update: false
      };
    }
  } catch (err) {
    console.error('[SoftwareConfig] GitHub API fetch failed:', err.message);
  }

  // Fallback using detected redirect tag if REST API rate limits
  const cleanVersion = detectedTag ? detectedTag.replace(/^v/i, '') : DEFAULT_SOFTWARE_VERSION;
  const versionParts = cleanVersion.split('.').map(n => parseInt(n, 10) || 0);
  const versionCode = versionParts.reduce((acc, val) => acc * 10 + val, 0) || 1003;

  return {
    latest_version: cleanVersion,
    version_code: versionCode,
    download_url: `https://github.com/sajonybd/stockmetapro/releases/download/v${cleanVersion}/StockMetaPro_Setup.exe`,
    release_notes: DEFAULT_RELEASE_NOTES,
    mandatory_update: false
  };
}

export const SOFTWARE_DOWNLOAD_URL = LATEST_PERMANENT_DOWNLOAD_URL;

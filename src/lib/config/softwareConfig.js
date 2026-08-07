// GitHub Latest Release Permanent Direct URL (GitHub auto-redirects to latest asset)
export const LATEST_PERMANENT_DOWNLOAD_URL = "https://github.com/sajonybd/stockmetapro/releases/latest/download/StockMetaPro_Setup.exe";

// Fallback software details
export const DEFAULT_SOFTWARE_VERSION = "1.0.0.1";
export const DEFAULT_SOFTWARE_VERSION_CODE = 1001;
export const DEFAULT_RELEASE_NOTES = "Latest release with performance & stability improvements.";

// Dynamic helper to fetch GitHub's latest published release automatically
export async function getLatestSoftwareReleaseInfo() {
  try {
    const res = await fetch('https://api.github.com/repos/sajonybd/stockmetapro/releases/latest', {
      headers: {
        'User-Agent': 'StockMetaPro-Update-Service',
        'Accept': 'application/vnd.github.v3+json'
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    });

    if (res.ok) {
      const data = await res.json();
      const rawTag = data.tag_name || '1.0.0.1';
      const cleanVersion = rawTag.replace(/^v/i, '');
      const versionParts = cleanVersion.split('.').map(n => parseInt(n, 10) || 0);
      const versionCode = versionParts.reduce((acc, val) => acc * 10 + val, 0) || 1001;

      // Find .exe asset download URL if present, or use GitHub latest redirect link
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
    console.error('[SoftwareConfig] GitHub API fetch failed, using fallback:', err.message);
  }

  return {
    latest_version: DEFAULT_SOFTWARE_VERSION,
    version_code: DEFAULT_SOFTWARE_VERSION_CODE,
    download_url: LATEST_PERMANENT_DOWNLOAD_URL,
    release_notes: DEFAULT_RELEASE_NOTES,
    mandatory_update: false
  };
}

export const SOFTWARE_DOWNLOAD_URL = LATEST_PERMANENT_DOWNLOAD_URL;

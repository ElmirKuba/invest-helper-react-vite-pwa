// src/version-check.ts
export type VersionCheckResult = {
  cachedVersion: string | null;
  remoteVersion: string | null;
  isDifferent: boolean;
};

async function readFromResponse(resp: Response | undefined | null): Promise<string | null> {
  if (!resp) return null;
  try {
    const j = await resp.clone().json();
    return typeof j?.version === 'string' ? j.version : null;
  } catch {
    return null;
  }
}

// Читаем cached version из специально отведённого runtime-кеша или из любого другого cache
export async function readCachedVersion(): Promise<string | null> {
  try {
    // 1) runtime cache (тот, куда cacheVersionOnStartup кладёт файл)
    try {
      const runtime = await caches.open('version-json-cache');
      const r = await runtime.match('/version.json');
      const v = await readFromResponse(r as Response | null);
      if (v) return v;
    } catch (e) {
      // ignore
    }

    // 2) пробуем найти в любых других кэшах (precache workbox и т.д.)
    const keys = await caches.keys();
    for (const key of keys) {
      try {
        const c = await caches.open(key);
        const reqs = await c.keys();
        for (const req of reqs) {
          if (req.url.endsWith('/version.json') || req.url.includes('/version.json?')) {
            const resp = await c.match(req);
            const vv = await readFromResponse(resp as Response | null);
            if (vv) return vv;
          }
        }
      } catch (e) {
        // ignore per-cache errors
      }
    }
  } catch (e) {
    console.debug('[version-check] readCachedVersion failed', e);
  }
  return null;
}

export async function fetchRemoteVersion(): Promise<string | null> {
  try {
    const url = `/version.json?ts=${Date.now()}`;
    const res = await fetch(url, { cache: 'no-store', credentials: 'same-origin' });
    if (!res || !res.ok) return null;
    const j = await res.json();
    return typeof j?.version === 'string' ? j.version : null;
  } catch (e) {
    console.debug('[version-check] fetchRemoteVersion failed', e);
    return null;
  }
}

export async function compareVersions(): Promise<VersionCheckResult> {
  const [cachedVersion, remoteVersion] = await Promise.all([readCachedVersion(), fetchRemoteVersion()]);
  const isDifferent = !!(remoteVersion && cachedVersion && remoteVersion !== cachedVersion);
  return { cachedVersion, remoteVersion, isDifferent };
}

// При старте приложения: fetch версии с сервера и сохранить в runtime-cache
export async function cacheVersionOnStartup(): Promise<string | null> {
  try {
    const res = await fetch('/version.json', { cache: 'no-store', credentials: 'same-origin' });
    if (!res || !res.ok) return null;
    const cache = await caches.open('version-json-cache');
    // Сохраняем под относительным ключом без query — чтобы later caches.match('/version.json') сработал
    await cache.put('/version.json', res.clone());
    const j = await res.json();
    return typeof j?.version === 'string' ? j.version : null;
  } catch (e) {
    console.debug('[version-check] cacheVersionOnStartup failed', e);
    return null;
  }
}

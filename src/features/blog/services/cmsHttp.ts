const CDN_HOSTS = new Set([
  'cdn.jsdelivr.net',
  'data.jsdelivr.com',
  'raw.githubusercontent.com',
  'images.weserv.nl',
  'cdn.statically.io',
]);

const SIMULATE_ALL_CDN_DOWN = import.meta.env.VITE_SIMULATE_ALL_CDN_DOWN === 'true';

function isCdnUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return CDN_HOSTS.has(parsedUrl.host);
  } catch {
    return false;
  }
}

async function assertResponse(url: string): Promise<Response> {
  if (SIMULATE_ALL_CDN_DOWN && isCdnUrl(url)) {
    throw new Error(`Simulated CDN outage for ${url}`);
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) to ${url}`);
  }

  return response;
}

export async function fetchJson<T>(url: string): Promise<T> {
  const response = await assertResponse(url);
  return (await response.json()) as T;
}

export async function fetchText(url: string): Promise<string> {
  const response = await assertResponse(url);
  return response.text();
}

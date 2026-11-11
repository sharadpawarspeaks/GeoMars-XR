/**
 * Resolves static asset URLs against Vite's configured base path
 * so subpath deployments (e.g. GitHub Pages) and root deployments both work.
 */
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const cleanPath = path.replace(/^\/+/, '');
  return `${normalizedBase}${cleanPath}`;
}


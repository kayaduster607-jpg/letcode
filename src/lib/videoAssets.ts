import { readFile, realpath } from 'node:fs/promises';
import { extname, isAbsolute, relative, resolve } from 'node:path';

const PUBLIC_TYPES: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

export function getVideoRoot(): string {
  // Keep the default portable; deployments can mount a separate asset root.
  // Public presentations are generated or mounted separately from server code.
  return resolve(/* turbopackIgnore: true */ process.env.VIDEO_PRESENTATION_ROOT || resolve(process.cwd(), 'ship'));
}

function isWithin(root: string, target: string): boolean {
  const path = relative(root, target);
  return path !== '' && path !== '..' && !path.startsWith('../') && !path.startsWith('..\\') && !isAbsolute(path);
}

export function isSafeVideoSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug);
}

export type PublicVideoAsset = {
  presentationRoot: string;
  path: string;
  contentType: string;
};

function isPublicAssetParts(parts: string[]): boolean {
  if (!parts.length || parts.some((part) => !part || part.startsWith('.') || /[\\/:\0]/.test(part))) return false;
  const filename = parts.at(-1) || '';
  return !/^(?:config|credentials?|secrets?|tokens?|api[-_]?keys?)(?:[.-]|$)/i.test(filename)
    && Boolean(PUBLIC_TYPES[extname(filename).toLowerCase()]);
}

export function resolvePublicVideoAsset(slug: string, parts: string[]): PublicVideoAsset | null {
  // Never serve project-level scripts, env files, hidden files or credentials.
  if (!isSafeVideoSlug(slug) || parts.length < 2 || parts[0] !== 'presentation') return null;
  if (!isPublicAssetParts(parts.slice(1))) return null;
  const filename = parts.at(-1) || '';
  const contentType = PUBLIC_TYPES[extname(filename).toLowerCase()];

  const presentationRoot = resolve(getVideoRoot(), slug, 'presentation');
  const path = resolve(presentationRoot, ...parts.slice(1));
  return isWithin(presentationRoot, path) ? { presentationRoot, path, contentType } : null;
}

export async function readPublicVideoAsset(asset: PublicVideoAsset): Promise<Buffer> {
  // Resolve links before opening content, so a symlink cannot escape the root.
  const [root, target] = await Promise.all([realpath(asset.presentationRoot), realpath(asset.path)]);
  if (!isWithin(root, target)) throw new Error('Video asset resolves outside its presentation root');
  const realParts = relative(root, target).split(/[\\/]/);
  if (!isPublicAssetParts(realParts)) throw new Error('Resolved video asset is private');
  return readFile(target);
}

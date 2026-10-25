/** Verify the public video boundary using only disposable non-secret fixtures. */
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, resolve, sep } from 'node:path';
import { getVideoRoot, readPublicVideoAsset, resolvePublicVideoAsset } from '../src/lib/videoAssets.ts';

let checks = 0;

function check(value, message) {
  assert.ok(value, message);
  checks += 1;
}

function verifyRejectedPaths() {
  // Env names are tested as strings only: no env fixture is created or opened.
  const rejected = [
    [], ['.env'], ['presentation', '.env'], ['presentation', '.env.local'],
    ['presentation', '..', 'app.js'], ['presentation', 'nested/other.js'],
    ['presentation', 'nested\\other.js'], ['presentation', 'C:other.js'],
    ['presentation', 'private.pem'], ['presentation', 'secret.key'],
    ['presentation', 'config.json'], ['presentation', 'credentials.json'],
    ['presentation', 'secrets.json'], ['presentation', 'api-key.json'],
    ['audio-segments.json'], ['article.md'], ['presentation', 'server.py'],
  ];
  for (const parts of rejected) check(resolvePublicVideoAsset('two-sum', parts) === null, 'reject private or invalid path');
  for (const slug of ['../outside', 'two/sum', '', '.hidden']) {
    check(resolvePublicVideoAsset(slug, ['presentation', 'index.html']) === null, 'reject invalid slug');
  }
}

async function verifyPublicFiles(root) {
  const presentation = join(root, 'two-sum', 'presentation');
  await mkdir(presentation, { recursive: true });
  await writeFile(join(presentation, 'index.html'), '<!doctype html><p>Public demo</p>');
  const asset = resolvePublicVideoAsset('two-sum', ['presentation', 'index.html']);
  check(asset !== null, 'resolve a generated presentation');
  check(asset.contentType.startsWith('text/html'), 'return the correct MIME type');
  check((await readPublicVideoAsset(asset)).toString().includes('Public demo'), 'read a public fixture');
  for (const filename of ['app.js', 'styles.css', 'step.wav', 'diagram.svg']) {
    check(resolvePublicVideoAsset('two-sum', ['presentation', filename]) !== null, 'allow documented public file types');
  }
}

async function main() {
  const previous = process.env.VIDEO_PRESENTATION_ROOT;
  const root = await mkdtemp(join(tmpdir(), 'hot100-public-assets-'));
  try {
    delete process.env.VIDEO_PRESENTATION_ROOT;
    check(getVideoRoot() === resolve(process.cwd(), 'ship'), 'use a portable default asset root');
    process.env.VIDEO_PRESENTATION_ROOT = root;
    check(getVideoRoot() === resolve(root), 'honor an explicit asset root');
    verifyRejectedPaths();
    await verifyPublicFiles(root);
  } finally {
    if (previous === undefined) delete process.env.VIDEO_PRESENTATION_ROOT;
    else process.env.VIDEO_PRESENTATION_ROOT = previous;
    // Check the absolute cleanup target before removing the temporary tree.
    assert.ok(resolve(root).startsWith(resolve(tmpdir()) + sep) && basename(root).startsWith('hot100-public-assets-'));
    await rm(root, { recursive: true, force: true });
  }
  console.log(JSON.stringify({ checksPassed: checks, envFilesOpened: 0 }));
}

await main();

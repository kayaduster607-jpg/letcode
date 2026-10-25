import { NextResponse } from 'next/server';
import { readPublicVideoAsset, resolvePublicVideoAsset } from '@/lib/videoAssets';

type VideoAssetRouteProps = {
  params: Promise<{ slug: string; path: string[] }>;
};

export async function GET(_request: Request, { params }: VideoAssetRouteProps) {
  const { slug, path } = await params;
  const asset = resolvePublicVideoAsset(slug, path);
  if (!asset) {
    return NextResponse.json({ error: 'Invalid video asset path' }, { status: 400 });
  }

  try {
    const file = await readPublicVideoAsset(asset);
    return new NextResponse(new Uint8Array(file), {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': asset.contentType,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Video asset not found' }, { status: 404 });
  }
}

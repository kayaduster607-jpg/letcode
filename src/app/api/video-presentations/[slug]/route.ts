import { NextResponse } from 'next/server';
import { readPublicVideoAsset, resolvePublicVideoAsset } from '@/lib/videoAssets';

type VideoPresentationRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: VideoPresentationRouteProps) {
  const { slug } = await params;
  const asset = resolvePublicVideoAsset(slug, ['presentation', 'index.html']);
  if (!asset) {
    return NextResponse.json({ error: 'Invalid video slug' }, { status: 400 });
  }

  try {
    const html = await readPublicVideoAsset(asset);
    return new NextResponse(new Uint8Array(html), {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch {
    return new NextResponse(
      '<!doctype html><meta charset="utf-8"><body style="margin:0;display:grid;place-items:center;height:100vh;background:#0f172a;color:#e2e8f0;font:16px system-ui">解析动画还没有生成</body>',
      {
        status: 404,
        headers: {
          'Cache-Control': 'no-store',
          'Content-Type': 'text/html; charset=utf-8',
        },
      }
    );
  }
}

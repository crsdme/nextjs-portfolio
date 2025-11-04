import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export const runtime = 'edge'

function extractId(id: string) {
  return /^[\w-]{10,}$/.test(id) ? id : null
}

export async function GET(req: NextRequest) {
  const id = extractId(req.nextUrl.searchParams.get('id') || '')
  const w = Math.max(1, Number(req.nextUrl.searchParams.get('w') || '1000') | 0)
  if (!id)
    return new NextResponse('Bad id', { status: 400 })

  const upstream = `https://lh3.googleusercontent.com/d/${encodeURIComponent(id)}?sz=w${w}`

  const r = await fetch(upstream, { next: { revalidate: 60 * 60 * 24 } })
  if (!r.ok)
    return new NextResponse('Upstream error', { status: 502 })

  const buf = await r.arrayBuffer()
  const contentType = r.headers.get('content-type') || 'image/jpeg'

  const headers = new Headers({
    'Content-Type': contentType,
    'Cache-Control': [
      'public',
      'max-age=86400',
      's-maxage=604800',
      'stale-while-revalidate=86400',
    ].join(', '),
  })

  return new NextResponse(buf, { status: 200, headers })
}

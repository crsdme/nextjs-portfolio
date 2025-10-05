import { NextResponse } from 'next/server'
import { z } from 'zod'
import { AuthorService, AuthorValidation } from '@/modules/authors'

// export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const parsed = AuthorValidation.authorsQueryInput.parse(Object.fromEntries(url.searchParams))

    const { items, total } = await AuthorService.listAuthors({
      query: parsed.query,
      page: parsed.page,
      pageSize: parsed.pageSize,
      sort: parsed.sort,
    })

    return NextResponse.json(
      { items, total, page: parsed.page, pageSize: parsed.pageSize },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  }
  catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Bad request', details: e.flatten() }, { status: 400 })
    }
    console.error(e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

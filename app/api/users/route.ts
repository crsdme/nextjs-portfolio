import { NextResponse } from 'next/server'
import { z } from 'zod'
import { UserService, UserValidation } from '@/modules/users'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const parsed = UserValidation.usersQueryInput.parse(Object.fromEntries(url.searchParams))

    const { items, total } = await UserService.listUsers({
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

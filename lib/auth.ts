import type { JWTPayload } from 'jose'
import process from 'node:process'
import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
const cookieName = 'auth'

export interface TokenPayload { sub: string, login: string, accesses: number[] }

export async function signToken(payload: TokenPayload) {
  const exp = process.env.JWT_EXPIRES || '7d'
  return await new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(secret)
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify<TokenPayload>(token, secret)
  return payload
}

export async function setAuthCookie(token: string) {
  (await cookies()).set({
    name: cookieName,
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
  })
}

export async function clearAuthCookie() {
  (await cookies()).set(cookieName, '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 })
}

export async function currentUser() {
  const cookie = (await cookies()).get(cookieName)?.value
  if (!cookie)
    return null
  try {
    return await verifyToken(cookie)
  }
  catch { return null }
}

export async function checkAuth() {
  const u = await currentUser()
  if (!u)
    throw new Error('UNAUTHORIZED')
  return u
}

export async function checkAccess(accesses?: TokenPayload['accesses']) {
  const u = await currentUser()
  if (!u)
    throw new Error('UNAUTHORIZED')
  if (accesses && !u.accesses.some(access => accesses.includes(access)))
    throw new Error('FORBIDDEN')
  return u
}

'use client'

import { useActionState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Input, Label } from '@/components/ui/'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

import { loginAction } from './_actions'

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction as any, { ok: false } as any)

  return (
    <div className="mx-auto mt-16 w-full max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle>Вход</CardTitle>
          <CardDescription>Введите email и пароль, чтобы продолжить.</CardDescription>
        </CardHeader>

        <form action={action}>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                disabled={pending}
                autoComplete="email"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="********"
                required
                disabled={pending}
                autoComplete="current-password"
              />
            </div>

            {state?.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>

          <CardFooter>
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? 'Входим…' : 'Войти'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

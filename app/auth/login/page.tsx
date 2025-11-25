'use client'

import { useActionState } from 'react'
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  FieldLabel,
  Input,
} from '@/components/ui/'

import { loginAction } from './_actions'

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction as any, { ok: false } as any)

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex flex-col gap-6 mx-auto mt-16 w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Вход</CardTitle>
            <CardDescription>
              Введите логин и пароль, чтобы продолжить.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={action} className="space-y-4">
              <Field>
                <FieldLabel htmlFor="login">Логин</FieldLabel>
                <Input
                  id="login"
                  name="login"
                  type="text"
                  placeholder="Логин"
                  required
                  disabled={pending}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Пароль</FieldLabel>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Пароль"
                  required
                  disabled={pending}
                />
              </Field>
              <Field>
                <Button type="submit" disabled={pending}>Войти</Button>
              </Field>
              {state?.error && (
                <Alert variant="destructive">
                  <AlertDescription>{state.error}</AlertDescription>
                </Alert>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

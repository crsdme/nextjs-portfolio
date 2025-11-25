import { Trash2 } from 'lucide-react'
import { useFieldArray } from 'react-hook-form'
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
} from '@/components/ui/'
import { useAuthorsPageContext } from '../providers'

export function AuthorsForm() {
  const { form, handleSubmit } = useAuthorsPageContext()

  const { control, register } = form
  const { fields, append, remove } = useFieldArray({ control, name: 'socials' })

  return (
    <Form {...form}>
      <form id="author-form" onSubmit={form.handleSubmit(handleSubmit)} className="px-4 space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Имя</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Описание</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="avatarUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL аватара</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL-слаг</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Социальные сети</FormLabel>
          {fields.map((f, idx) => (
            <div key={f.id} className="flex items-center gap-2">
              <Input
                placeholder="Название"
                {...register(`socials.${idx}.label`)}
                className="flex-1"
              />
              <Input
                placeholder="URL-ссылка"
                {...register(`socials.${idx}.url`)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => remove(idx)}
                className="rounded-md"
                aria-label="Удалить"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <FormMessage />
        </FormItem>

        <Button
          type="button"
          onClick={() => append({ label: '', url: '' })}
          className="w-full bg-black text-white hover:bg-black/90"
        >
          Добавить социальную сеть
        </Button>

      </form>
    </Form>
  )
}

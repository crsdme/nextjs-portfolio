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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui/'
import { useAuthorsPageContext } from '../providers'

export function AuthorsForm() {
  const { form, handleSubmit } = useAuthorsPageContext()

  const { control } = form
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
          <FormLabel>Соц-сети</FormLabel>
          {fields.map((f, idx) => (
            <div key={f.id} className="flex flex-wrap flex-col gap-2">
              <FormField
                control={form.control}
                name={`socials.${idx}.label`}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="telegram">Telegram</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="twitch">Twitch</SelectItem>
                      <SelectItem value="vk">Vkontakte</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />

              <FormField
                control={form.control}
                name={`socials.${idx}.url`}
                render={({ field }) => (
                  <Input
                    placeholder="URL"
                    {...field}
                    className="flex-1 min-h-9"
                  />
                )}
              />

              <Button
                type="button"
                variant="destructive"
                onClick={() => remove(idx)}
                className="rounded-md w-full"
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

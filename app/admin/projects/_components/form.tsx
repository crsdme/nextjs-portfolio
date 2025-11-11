import { Trash2 } from 'lucide-react'
import { useFieldArray } from 'react-hook-form'
import { DatePicker } from '@/components/date-picker'
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
import { useProjectsPageContext } from '../providers'

export function ProjectsForm() {
  const { form, handleSubmit, authors } = useProjectsPageContext()

  const { control, register } = form
  const { fields: tagsFields, append: appendTag, remove: removeTag } = useFieldArray({ control, name: 'tags' })
  const { fields: slidesFields, append: appendSlide, remove: removeSlide } = useFieldArray({ control, name: 'slides' })

  return (
    <Form {...form}>
      <form id="project-form" onSubmit={form.handleSubmit(handleSubmit)} className="px-4 space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subtitle"
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

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Статус</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  {...field}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Активный</SelectItem>
                    <SelectItem value="inactive">Неактивный</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="authorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Автор</FormLabel>
              <FormControl>
                <Select
                  onValueChange={v => field.onChange(Number(v))}
                  value={Number(field.value).toString()}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Выберите автора" />
                  </SelectTrigger>
                  <SelectContent>
                    {authors.map(author => (
                      <SelectItem key={author.id} value={author.id.toString()}>
                        {author.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Дата</FormLabel>
              <FormControl>
                <DatePicker className="w-full" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Теги</FormLabel>
          {tagsFields.map((f, idx) => (
            <div key={f.id} className="flex items-center gap-2">
              <Input
                placeholder="Тег"
                {...register(`tags.${idx}.label`)}
                className="flex-1"
              />
              <Input
                placeholder="Ссылка"
                {...register(`tags.${idx}.url`)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => removeTag(idx)}
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
          onClick={() => appendTag({ label: '', url: '' })}
          className="w-full bg-black text-white hover:bg-black/90"
        >
          Добавить тег
        </Button>

        <FormItem>
          <FormLabel>Слайды</FormLabel>
          {slidesFields.map((f, idx) => (
            <div key={f.id} className="flex flex-wrap flex-col gap-2">
              <FormField
                control={form.control}
                name={`slides.${idx}.type`}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Изображение</SelectItem>
                      <SelectItem value="video">Видео</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />

              <FormField
                control={form.control}
                name={`slides.${idx}.caption`}
                render={({ field }) => (
                  <Input
                    placeholder="Название"
                    {...field}
                    className="flex-1 min-h-9"
                  />
                )}
              />

              <FormField
                control={form.control}
                name={`slides.${idx}.description`}
                render={({ field }) => (
                  <Textarea
                    placeholder="Описание"
                    {...field}
                    className="flex-1"
                    rows={3}
                  />
                )}
              />

              <FormField
                control={form.control}
                name={`slides.${idx}.src`}
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
                onClick={() => removeSlide(idx)}
                className="rounded-md w-full"
                aria-label="Удалить"
              >
                <Trash2 className="h-4 w-4" />
                Удалить
              </Button>
            </div>
          ))}
          <FormMessage />
        </FormItem>

        <Button
          type="button"
          onClick={() => appendSlide({ type: 'image', src: '', caption: '', description: '' })}
          className="w-full bg-black text-white hover:bg-black/90"
        >
          Добавить слайд
        </Button>

      </form>
    </Form>
  )
}

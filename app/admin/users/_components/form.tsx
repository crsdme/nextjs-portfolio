import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from '@/components/ui/'
import { useUsersPageContext } from '../providers'

const accesses = [
  { id: 'user.delete', name: 'Удалить пользователя' },
  { id: 'user.create', name: 'Создать пользователя' },
  { id: 'user.edit', name: 'Редактировать пользователя' },
  { id: 'user.view', name: 'Просмотр пользователей' },
  { id: 'author.view', name: 'Просмотр авторов' },
  { id: 'author.create', name: 'Создать автора' },
  { id: 'author.edit', name: 'Редактировать автора' },
  { id: 'author.delete', name: 'Удалить автора' },
  { id: 'article.view', name: 'Просмотр статей' },
  { id: 'article.create', name: 'Создать статью' },
  { id: 'article.edit', name: 'Редактировать статью' },
  { id: 'article.delete', name: 'Удалить статью' },
]

export function UsersForm() {
  const { form, handleSubmit, authors } = useUsersPageContext()

  return (
    <Form {...form}>
      <form
        id="user-form"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="px-4 space-y-4"
      >
        <FormField
          control={form.control}
          name="login"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Логин</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="passwordHash"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Пароль</FormLabel>
              <FormControl>
                <Input {...field} type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="authors"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Авторы</FormLabel>
              <FormControl>
                <MultiSelect {...field} onValuesChange={field.onChange}>
                  <MultiSelectTrigger className="w-full max-w-[400px]">
                    <MultiSelectValue placeholder="Выберите авторов" />
                  </MultiSelectTrigger>
                  <MultiSelectContent>
                    <MultiSelectGroup>
                      {authors.map(author => (
                        <MultiSelectItem key={author.id} value={author.id.toString()}>
                          {author.name}
                        </MultiSelectItem>
                      ))}
                    </MultiSelectGroup>
                  </MultiSelectContent>
                </MultiSelect>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="accesses"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Доступы</FormLabel>
              <FormControl>
                <MultiSelect {...field} onValuesChange={field.onChange}>
                  <MultiSelectTrigger className="w-full max-w-[400px]">
                    <MultiSelectValue placeholder="Выберите доступы" />
                  </MultiSelectTrigger>
                  <MultiSelectContent>
                    <MultiSelectGroup>
                      {accesses.map(access => (
                        <MultiSelectItem key={access.id} value={access.id.toString()}>
                          {access.name}
                        </MultiSelectItem>
                      ))}
                    </MultiSelectGroup>
                  </MultiSelectContent>
                </MultiSelect>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

      </form>
    </Form>
  )
}

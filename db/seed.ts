import process from 'node:process'
import bcrypt from 'bcryptjs'
import { and, eq, sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { authors } from '@/db/schemas/authors'
import { projectMedia, projects } from '@/db/schemas/projects'
import { settings } from '@/db/schemas/settings'
import { userAuthors, users } from '@/db/schemas/users'
import * as schema from './schemas'

async function main() {
  const client = postgres('postgres://projectuser:projectpassword@localhost:5432/projectdb')
  const db = drizzle(client, { schema })
  // eslint-disable-next-line no-console
  console.time('seed')

  await db.execute(sql`
    TRUNCATE TABLE
      user_authors,
      project_media,
      projects,
      authors,
      users,
      settings
    RESTART IDENTITY CASCADE;
  `)

  const [ivan] = await db.insert(authors).values({
    name: 'Иван Петров',
    slug: 'ivan-petrov',
    bio: 'Фронтенд-разработчик. Делаю быстрые и аккуратные интерфейсы.',
    avatarUrl: '/images/ivan.jpg',
    socials: [
      { label: 'Telegram', url: 'https://t.me/ivan' },
      { label: 'GitHub', url: 'https://github.com/ivan' },
      { label: 'LinkedIn', url: 'https://linkedin.com/in/ivan' },
    ],
  }).returning()

  const [anna] = await db.insert(authors).values({
    name: 'Анна Смирнова',
    slug: 'anna-smirnova',
    bio: 'Дизайнер интерфейсов и арт-директор. Люблю простые и чистые решения.',
    avatarUrl: '/images/anna.jpg',
    socials: [
      { label: 'Behance', url: 'https://behance.net/anna' },
      { label: 'Dribbble', url: 'https://dribbble.com/anna' },
      { label: 'Instagram', url: 'https://instagram.com/anna' },
    ],
  }).returning()

  const adminHash = await bcrypt.hash('admin123', 10)
  const editorHash = await bcrypt.hash('editor123', 10)

  const [admin] = await db.insert(users).values({
    email: 'admin@site.local',
    passwordHash: adminHash,
    role: 'admin',
  }).returning()

  const [editor] = await db.insert(users).values({
    email: 'editor@site.local',
    passwordHash: editorHash,
    role: 'editor',
  }).returning()

  await db.insert(userAuthors).values([
    {
      userId: admin.id,
      authorId: ivan.id,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
      canPublish: true,
    },
    {
      userId: admin.id,
      authorId: anna.id,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
      canPublish: true,
    },
  ])

  await db.insert(userAuthors).values({
    userId: editor.id,
    authorId: ivan.id,
    canCreate: true,
    canUpdate: true,
    canDelete: false,
    canPublish: false,
  })

  const [p1] = await db.insert(projects).values({
    authorId: ivan.id,
    slug: 'product-teaser',
    title: 'Product Teaser',
    subtitle: '30-секундный ролик',
    description: 'Короткий тизер и кадры из интерфейса.',
    status: 'active',
    projectUrl: 'https://example.com/teaser',
    tags: ['new', '2025', 'motion'],
    date: new Date('2025-02-12T00:00:00Z'),
  }).returning()

  const [p1Slide0] = await db.insert(projectMedia).values({
    projectId: p1.id,
    position: 0,
    type: 'video',
    videoKind: 'youtube',
    videoSrc: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    poster: '/images/posters/teaser.jpg',
    caption: '30 сек тизер',
    visible: true,
  }).returning()

  await db.insert(projectMedia).values({
    projectId: p1.id,
    position: 1,
    type: 'image',
    imageSrc: '/images/teaser-shot-1.jpg',
    imageAlt: 'Первый экран',
    caption: 'Первый экран лендинга',
    visible: true,
  })

  await db.update(projects)
    .set({ coverMediaId: p1Slide0.id })
    .where(eq(projects.id, p1.id))

  const [p2] = await db.insert(projects).values({
    authorId: ivan.id,
    slug: 'aurora-landing',
    title: 'Aurora Landing',
    subtitle: 'Акцент на скорость',
    description: 'Лайтхаус 98/100, адаптив и доступность.',
    status: 'active',
    projectUrl: 'https://aurora.example.com',
    tags: ['react', 'nextjs', 'perf'],
    date: new Date('2025-01-05T00:00:00Z'),
  }).returning()

  const [p2Slide0] = await db.insert(projectMedia).values({
    projectId: p2.id,
    position: 0,
    type: 'image',
    imageSrc: '/images/aurora-cover.jpg',
    imageAlt: 'Aurora cover',
    caption: 'Главный экран',
    visible: true,
  }).returning()

  await db.insert(projectMedia).values([
    {
      projectId: p2.id,
      position: 1,
      type: 'image',
      imageSrc: '/images/aurora-2.jpg',
      imageAlt: 'Секция преимущества',
      visible: true,
    },
    {
      projectId: p2.id,
      position: 2,
      type: 'image',
      imageSrc: '/images/aurora-3.jpg',
      imageAlt: 'Галерея скриншотов',
      visible: true,
    },
  ])

  await db.update(projects)
    .set({ coverMediaId: p2Slide0.id })
    .where(eq(projects.id, p2.id))

  const [p3] = await db.insert(projects).values({
    authorId: anna.id,
    slug: 'nimbus-design-system',
    title: 'Nimbus Design System',
    subtitle: 'Компоненты и токены',
    description: 'Системная библиотека для масштабируемых интерфейсов.',
    status: 'active',
    repoUrl: 'https://github.com/user/nimbus',
    tags: ['design', 'system', 'react'],
    date: new Date('2024-11-20T00:00:00Z'),
  }).returning()

  await db.insert(projectMedia).values({
    projectId: p3.id,
    position: 0,
    type: 'image',
    imageSrc: '/images/nimbus-1.png',
    imageAlt: 'Превью компонентов',
    visible: true,
  })

  const [p3Slide1] = await db.insert(projectMedia).values({
    projectId: p3.id,
    position: 1,
    type: 'image',
    imageSrc: '/images/nimbus-2.png',
    imageAlt: 'Типографическая сетка',
    caption: 'Сетка и стили',
    visible: true,
  }).returning()

  await db.update(projects)
    .set({ coverMediaId: p3Slide1.id })
    .where(eq(projects.id, p3.id))

  const [p4] = await db.insert(projects).values({
    authorId: anna.id,
    slug: 'conference-reel',
    title: 'Conference Reel',
    subtitle: 'Динамичная нарезка',
    description: 'Короткий ролик с мероприятия, упор на динамику.',
    status: 'active',
    tags: ['video', 'event'],
    date: new Date('2024-10-01T00:00:00Z'),
  }).returning()

  const [p4Slide0] = await db.insert(projectMedia).values({
    projectId: p4.id,
    position: 0,
    type: 'video',
    videoKind: 'mp4',
    videoSrc: '/videos/conf-reel.mp4',
    poster: '/images/conf-poster.jpg',
    caption: 'Reel 45 сек',
    visible: true,
  }).returning()

  await db.update(projects)
    .set({ coverMediaId: p4Slide0.id })
    .where(eq(projects.id, p4.id))

  await db.insert(settings).values([
    {
      key: 'site.seo',
      value: {
        title: 'Портфолио',
        description: 'Минималистичная галерея работ: фото и видео с описаниями.',
        ogImage: '/images/og.jpg',
      },
    },
    {
      key: 'site.theme',
      value: {
        mode: 'dark',
        accent: '#7c7cff',
        radius: 14,
      },
    },
    {
      key: 'portfolio.layout',
      value: {
        grid: { columns: { md: 3, lg: 4 }, gap: 14 },
        lightbox: { sidebar: true, keyboard: true },
        pageSize: 12,
      },
    },
  ])

  // eslint-disable-next-line no-console
  console.timeEnd('seed')
  // eslint-disable-next-line no-console
  console.log('✔ Seed completed:', {
    authors: [ivan.slug, anna.slug],
    users: [admin.email, editor.email],
    projects: [p1.slug, p2.slug, p3.slug, p4.slug],
  })
}

main().catch((e) => {
  console.error('Seed failed:', e)
  process.exit(1)
})

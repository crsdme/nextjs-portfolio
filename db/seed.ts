import process from 'node:process'
import bcrypt from 'bcryptjs'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '@/db/schemas'

async function waitDb(retries = 30, delay = 1000) {
  while (retries--) {
    try {
      const sql = postgres(process.env.DATABASE_URL!, { max: 1 })
      await sql`select 1`
      await sql.end({ timeout: 1 })
      return
    }
    catch (e) {
      if (!retries)
        throw e
      await new Promise(r => setTimeout(r, delay))
    }
  }
}

async function main() {
  await waitDb()
  const client = postgres(process.env.DATABASE_URL!)
  const db = drizzle(client, { schema })
  // eslint-disable-next-line no-console
  console.time('seed')

  await db.execute(sql`
    TRUNCATE TABLE
      project_media,
      projects,
      authors,
      users,
      settings
    RESTART IDENTITY CASCADE;
  `)

  const [ivan] = await db.insert(schema.authors).values({
    name: 'Иван Петров',
    slug: 'ivan-petrov',
    description: 'Фронтенд-разработчик. Делаю быстрые и аккуратные интерфейсы.',
    avatarUrl: 'https://drive.google.com/file/d/1BJa3sjaWeTfkzQKABbN29DPOGZqQVzws/view?usp=sharing',
    socials: [
      { label: 'Telegram', url: 'https://t.me/ivan' },
      { label: 'GitHub', url: 'https://github.com/ivan' },
      { label: 'LinkedIn', url: 'https://linkedin.com/in/ivan' },
    ],
  }).returning()

  const [anna] = await db.insert(schema.authors).values({
    name: 'Анна Смирнова',
    slug: 'anna-smirnova',
    description: 'Дизайнер интерфейсов и арт-директор. Люблю простые и чистые решения.',
    avatarUrl: 'https://drive.google.com/file/d/1FPaX_JBUHyFxF1H9zSmWpsCqwJLVZ8_C/view?usp=sharing',
    socials: [
      { label: 'Behance', url: 'https://behance.net/anna' },
      { label: 'Dribbble', url: 'https://dribbble.com/anna' },
      { label: 'Instagram', url: 'https://instagram.com/anna' },
    ],
  }).returning()

  await db.insert(schema.authors).values({
    name: 'Андрей Иванов',
    slug: 'andrey-ivanov',
    description: 'Backend-разработчик. Делаю надежные и масштабируемые сервисы.',
    avatarUrl: 'https://drive.google.com/file/d/1PueiamS2OBE10D-YB67O5MAVS_kKtKZI/view',
    socials: [
      { label: 'Telegram', url: 'https://t.me/andrey' },
      { label: 'GitHub', url: 'https://github.com/andrey' },
      { label: 'LinkedIn', url: 'https://linkedin.com/in/andrey' },
    ],
  }).returning()

  await db.insert(schema.authors).values({
    name: 'Игорь Сидоров',
    slug: 'igor-sidorov',
    description: 'Fullstack-разработчик. Делаю полные и масштабируемые сервисы.',
    avatarUrl: 'https://drive.google.com/file/d/1pes7vJfnjyClJ9O1s1H6d-FMSE7Y6IBt/view?usp=drive_link',
    socials: [
      { label: 'Telegram', url: 'https://t.me/igor' },
      { label: 'GitHub', url: 'https://github.com/igor' },
      { label: 'LinkedIn', url: 'https://linkedin.com/in/igor' },
    ],
  }).returning()

  await db.insert(schema.authors).values({
    name: 'Михаил Петров',
    slug: 'mikhail-petrov',
    description: 'Дизайнер интерфейсов и арт-директор. Люблю простые и чистые решения.',
    avatarUrl: 'https://drive.google.com/file/d/1pes7vJfnjyClJ9O1s1H6d-FMSE7Y6IBt/view?usp=drive_link',
    socials: [
      { label: 'Telegram', url: 'https://t.me/mikhail' },
      { label: 'GitHub', url: 'https://github.com/mikhail' },
    ],
  }).returning()

  const adminHash = await bcrypt.hash('admin123', 10)
  const editorHash = await bcrypt.hash('editor123', 10)

  const [admin] = await db.insert(schema.users).values({
    email: 'admin@site.local',
    passwordHash: adminHash,
    role: 'admin',
  }).returning()

  const [editor] = await db.insert(schema.users).values({
    email: 'editor@site.local',
    passwordHash: editorHash,
    role: 'editor',
  }).returning()

  const [p1] = await db.insert(schema.projects).values({
    authorId: ivan.id,
    slug: 'product-teaser-2',
    title: 'Product Teaser',
    subtitle: '30-секундный ролик',
    description: 'Короткий тизер и кадры из интерфейса.',
    status: 'active',
    tags: [{
      label: 'new',
      url: 'https://new.com',
    }, {
      label: '2025',
      url: 'https://2025.com',
    }, {
      label: 'motion',
      url: 'https://motion.com',
    }],
    date: new Date('2025-02-12T00:00:00Z'),
  }).returning()

  await db.insert(schema.projectMedia).values({
    projectId: p1.id,
    position: 0,
    type: 'video',
    src: 'https://drive.google.com/file/d/1XBsmZ5INFaG5wC-A8avYJTzv8_1lFqZg/view?usp=drive_link',
    caption: '30 сек тизер',
  }).returning()

  await db.insert(schema.projectMedia).values({
    projectId: p1.id,
    position: 1,
    type: 'image',
    src: 'https://drive.google.com/file/d/1kjty0PxtjxcTg6KClINZBvR7JcicdDTT/view?usp=drive_link',
    caption: 'Первый экран лендинга',
  })

  const [p2] = await db.insert(schema.projects).values({
    authorId: ivan.id,
    slug: 'aurora-landing',
    title: 'Aurora Landing',
    subtitle: 'Акцент на скорость',
    description: 'Лайтхаус 98/100, адаптив и доступность.',
    status: 'active',
    tags: [{
      label: 'react',
      url: 'https://react.dev',
    }, {
      label: 'nextjs',
      url: 'https://nextjs.org',
    }, {
      label: 'perf',
      url: 'https://perf.dev',
    }],
    date: new Date('2025-01-05T00:00:00Z'),
  }).returning()

  await db.insert(schema.projectMedia).values({
    projectId: p2.id,
    position: 0,
    type: 'image',
    src: 'https://drive.google.com/file/d/17Le_7eAIeliBNqTnFxGCnxCC95WeH_F9/view?usp=drive_link',
    caption: 'Главный экран',
    description: 'Главный экран',
  }).returning()

  await db.insert(schema.projectMedia).values([
    {
      projectId: p2.id,
      position: 1,
      type: 'image',
      src: 'https://drive.google.com/file/d/1sekITQQNtcCCPeoNqkMAB_BoIm6hW0CF/view?usp=drive_link',
      caption: 'Серый фреш',
      description: 'Серый фреш',
    },
    {
      projectId: p2.id,
      position: 2,
      type: 'image',
      src: 'https://drive.google.com/file/d/1Da-7Exb9bXSqTtX_2TNT8REh2zoNe1-k/view?usp=drive_link',
      caption: 'Синий фреш',
      description: 'Синий фреш',
    },
  ])

  const [p3] = await db.insert(schema.projects).values({
    authorId: anna.id,
    slug: 'nimbus-design-system',
    title: 'Nimbus Design System',
    subtitle: 'Компоненты и токены',
    description: 'Системная библиотека для масштабируемых интерфейсов.',
    status: 'active',
    tags: [{
      label: 'design',
      url: 'https://design.com',
    }, {
      label: 'system',
      url: 'https://system.com',
    }, {
      label: 'react',
      url: 'https://react.dev',
    }],
    date: new Date('2024-11-20T00:00:00Z'),
  }).returning()

  await db.insert(schema.projectMedia).values({
    projectId: p3.id,
    position: 0,
    type: 'image',
    src: 'https://drive.google.com/file/d/1g148hUBBGceiUA8I4BCPLKlGBbqfXGCo/view?usp=drive_link',
    caption: 'Взрывные ягоды',
  })

  await db.insert(schema.projectMedia).values({
    projectId: p3.id,
    position: 1,
    type: 'image',
    src: 'https://drive.google.com/file/d/1RfeVJc1JXwZcNRC6aqwfvzUHk33JVpk-/view?usp=drive_link',
    caption: 'Баштановый фреш',
  }).returning()

  const [p4] = await db.insert(schema.projects).values({
    authorId: anna.id,
    slug: 'conference-reel',
    title: 'Conference Reel',
    subtitle: 'Динамичная нарезка',
    description: 'Короткий ролик с мероприятия, упор на динамику.',
    status: 'active',
    tags: [{
      label: 'video',
      url: 'https://video.com',
    }, {
      label: 'event',
      url: 'https://event.com',
    }],
    date: new Date('2024-10-01T00:00:00Z'),
  }).returning()

  await db.insert(schema.projectMedia).values({
    projectId: p4.id,
    position: 0,
    type: 'video',
    src: 'https://drive.google.com/file/d/1kjty0PxtjxcTg6KClINZBvR7JcicdDTT/view?usp=drive_link',
    caption: 'Reel 45 сек',
    description: 'Reel 45 сек',
  }).returning()

  const [p5] = await db.insert(schema.projects).values({
    authorId: ivan.id,
    slug: 'product-teaser',
    title: 'Product Teaser',
    subtitle: '30-секундный ролик',
    description: 'Короткий тизер и кадры из интерфейса.',
    status: 'active',
    tags: [{
      label: 'new',
      url: 'https://new.com',
    }, {
      label: '2025',
      url: 'https://2025.com',
    }, {
      label: 'motion',
      url: 'https://motion.com',
    }],
    date: new Date('2025-02-12T00:00:00Z'),
  }).returning()

  await db.insert(schema.projectMedia).values({
    projectId: p5.id,
    position: 0,
    type: 'video',
    src: 'https://drive.google.com/file/d/1esjFzGEZP9Fx-EmTXVU_dvioIamrTfvK/view?usp=drive_link',
    caption: 'Кот',
    description: 'Видео с котом',
  }).returning()

  await db.insert(schema.projectMedia).values({
    projectId: p5.id,
    position: 1,
    type: 'image',
    src: 'https://drive.google.com/file/d/1evRUrcDWeSgmZU2ert9GgxBd0rDwigL7/view?usp=drive_link',
    caption: 'Цитрусовый фреш',
    description: 'Цитрусовый фреш',
  }).returning()

  const [p6] = await db.insert(schema.projects).values({
    authorId: ivan.id,
    slug: 'aurora-landing-2',
    title: 'Aurora Landing',
    subtitle: 'Акцент на скорость',
    description: 'Лайтхаус 98/100, адаптив и доступность.',
    status: 'active',
    tags: [{
      label: 'react',
      url: 'https://react.dev',
    }, {
      label: 'nextjs',
      url: 'https://nextjs.org',
    }, {
      label: 'perf',
      url: 'https://perf.dev',
    }],
    date: new Date('2025-01-05T00:00:00Z'),
  }).returning()

  await db.insert(schema.projectMedia).values({
    projectId: p6.id,
    position: 0,
    type: 'image',
    src: 'https://drive.google.com/file/d/1kjty0PxtjxcTg6KClINZBvR7JcicdDTT/view?usp=drive_link',
    caption: 'Главный экран',
    description: 'Главный экран',
  }).returning()

  await db.insert(schema.projectMedia).values([
    {
      projectId: p6.id,
      position: 1,
      type: 'image',
      src: 'https://drive.google.com/file/d/1nBPEUTa-x0oAKowty5D_jzgyCyR84NYG/view?usp=drive_link',
      caption: 'Фреш с закатами',
      description: 'Фреш с закатами',
    },
    {
      projectId: p6.id,
      position: 2,
      type: 'image',
      src: 'https://drive.google.com/file/d/1ZZ1bHRJqVdSS1cod5jcYThbg7P4hCX-P/view?usp=drive_link',
      caption: 'Хвоя',
      description: 'Хвоя на фоне',
    },
  ])

  const [p7] = await db.insert(schema.projects).values({
    authorId: anna.id,
    slug: 'nimbus-design-system-2',
    title: 'Nimbus Design System',
    subtitle: 'Компоненты и токены',
    description: 'Системная библиотека для масштабируемых интерфейсов.',
    status: 'active',
    tags: [{
      label: 'design',
      url: 'https://design.com',
    }, {
      label: 'system',
      url: 'https://system.com',
    }, {
      label: 'react',
      url: 'https://react.dev',
    }],
    date: new Date('2024-11-20T00:00:00Z'),
  }).returning()

  await db.insert(schema.projectMedia).values({
    projectId: p7.id,
    position: 0,
    type: 'image',
    src: 'https://drive.google.com/file/d/1h6TOZmmO1jUKt0u8ubp2aoAVz2pSuzs7/view?usp=drive_link',
    caption: 'Годжи',
    description: 'Годжи вкус',
  })

  await db.insert(schema.projectMedia).values({
    projectId: p7.id,
    position: 1,
    type: 'image',
    src: 'https://drive.google.com/file/d/1FjOJmDC-53ndpcG8ilreBtbUK98gRgZY/view?usp=drive_link',
    caption: 'Черника',
    description: 'Черника вкус',
  }).returning()

  const [p8] = await db.insert(schema.projects).values({
    authorId: anna.id,
    slug: 'conference-reel-2',
    title: 'Conference Reel',
    subtitle: 'Динамичная нарезка',
    description: 'Короткий ролик с мероприятия, упор на динамику.',
    status: 'active',
    tags: [{
      label: 'video',
      url: 'https://video.com',
    }, {
      label: 'event',
      url: 'https://event.com',
    }],
    date: new Date('2024-10-01T00:00:00Z'),
  }).returning()

  await db.insert(schema.projectMedia).values({
    projectId: p8.id,
    position: 0,
    type: 'video',
    src: 'https://drive.google.com/file/d/1cT0RdbFMXn9NC4eLpCdpnOx3P-k8tObA/view?usp=drive_link',
    caption: 'Видео 420',
    description: 'Банки 420 в полете',
  }).returning()

  await db.insert(schema.settings).values([
    {
      key: 'site.seo',
      value: {
        title: 'Портфолио',
        description: 'Минималистичная галерея работ: фото и видео с описаниями.',
        ogImage: 'https://drive.google.com/file/d/1kjty0PxtjxcTg6KClINZBvR7JcicdDTT/view?usp=drive_link',
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

  const projects = [
    {
      authorId: ivan.id,
      slug: 'product-teaser-2-32421',
      title: 'Product Teaser 2',
      subtitle: '30-секундный ролик',
      description: 'Короткий тизер и кадры из интерфейса.',
      status: 'active',
      tags: [{
        label: 'new',
        url: 'https://new.com',
      }, {
        label: '2025',
        url: 'https://2025.com',
      }, {
        label: 'motion',
        url: 'https://motion.com',
      }],
      date: new Date('2025-02-12T00:00:00Z'),
      slides: [
        {
          type: 'video',
          src: 'https://drive.google.com/file/d/1XBsmZ5INFaG5wC-A8avYJTzv8_1lFqZg/view?usp=drive_link',
          caption: '30 сек тизер',
          description: '30 сек тизер',
        },
        {
          type: 'image',
          src: 'https://drive.google.com/file/d/1kjty0PxtjxcTg6KClINZBvR7JcicdDTT/view?usp=drive_link',
          caption: 'Первый экран лендинга',
          description: 'Первый экран лендинга',
        },
        {
          type: 'image',
          src: 'https://drive.google.com/file/d/1kjty0PxtjxcTg6KClINZBvR7JcicdDTT/view?usp=drive_link',
          caption: 'Первый экран лендинга',
          description: 'Первый экран лендинга',
        },
        {
          type: 'image',
          src: 'https://drive.google.com/file/d/1kjty0PxtjxcTg6KClINZBvR7JcicdDTT/view?usp=drive_link',
          caption: 'Первый экран лендинга',
          description: 'Первый экран лендинга',
        },
      ],
    },
    {
      authorId: ivan.id,
      slug: 'product-teaser-2-3231',
      title: 'Product Teaser',
      subtitle: '30-секундный ролик',
      description: 'Короткий тизер и кадры из интерфейса.',
      status: 'active',
      tags: [{
        label: 'new',
        url: 'https://new.com',
      }, {
        label: '2025',
        url: 'https://2025.com',
      }, {
        label: 'motion',
        url: 'https://motion.com',
      }],
      date: new Date('2025-02-12T00:00:00Z'),
      slides: [
        {
          type: 'video',
          src: 'https://drive.google.com/file/d/1XBsmZ5INFaG5wC-A8avYJTzv8_1lFqZg/view?usp=drive_link',
          caption: '30 сек тизер',
          description: '30 сек тизер',
        },
        {
          type: 'image',
          src: 'https://drive.google.com/file/d/1kjty0PxtjxcTg6KClINZBvR7JcicdDTT/view?usp=drive_link',
          caption: 'Первый экран лендинга',
          description: 'Первый экран лендинга',
        },
        {
          type: 'image',
          src: 'https://drive.google.com/file/d/1kjty0PxtjxcTg6KClINZBvR7JcicdDTT/view?usp=drive_link',
          caption: 'Первый экран лендинга',
          description: 'Первый экран лендинга',
        },
        {
          type: 'image',
          src: 'https://drive.google.com/file/d/1kjty0PxtjxcTg6KClINZBvR7JcicdDTT/view?usp=drive_link',
          caption: 'Первый экран лендинга',
          description: 'Первый экран лендинга',
        },
      ],
    },
    {
      authorId: ivan.id,
      slug: 'product-teaser-43524662',
      title: 'Product Teaser',
      subtitle: '30-секундный ролик',
      description: 'Короткий тизер и кадры из интерфейса.',
      status: 'active',
      tags: [{
        label: 'new',
        url: 'https://new.com',
      }, {
        label: '2025',
        url: 'https://2025.com',
      }, {
        label: 'motion',
        url: 'https://motion.com',
      }],
      date: new Date('2025-02-12T00:00:00Z'),
      slides: [
        {
          type: 'video',
          src: 'https://drive.google.com/file/d/1XBsmZ5INFaG5wC-A8avYJTzv8_1lFqZg/view?usp=drive_link',
          caption: '30 сек тизер',
          description: '30 сек тизер',
        },
        {
          type: 'image',
          src: 'https://drive.google.com/file/d/1kjty0PxtjxcTg6KClINZBvR7JcicdDTT/view?usp=drive_link',
          caption: 'Первый экран лендинга',
          description: 'Первый экран лендинга',
        },
        {
          type: 'image',
          src: 'https://drive.google.com/file/d/1kjty0PxtjxcTg6KClINZBvR7JcicdDTT/view?usp=drive_link',
          caption: 'Первый экран лендинга',
          description: 'Первый экран лендинга',
        },
        {
          type: 'image',
          src: 'https://drive.google.com/file/d/1kjty0PxtjxcTg6KClINZBvR7JcicdDTT/view?usp=drive_link',
          caption: 'Первый экран лендинга',
          description: 'Первый экран лендинга',
        },
      ],
    },
    {
      authorId: ivan.id,
      slug: 'product-teaser-345v342',
      title: 'Product Teaser',
      subtitle: '30-секундный ролик',
      description: 'Короткий тизер и кадры из интерфейса.',
      status: 'active',
      tags: [{
        label: 'new',
        url: 'https://new.com',
      }, {
        label: '2025',
        url: 'https://2025.com',
      }, {
        label: 'motion',
        url: 'https://motion.com',
      }],
      date: new Date('2025-02-12T00:00:00Z'),
      slides: [
        {
          type: 'video',
          src: 'https://drive.google.com/file/d/1XBsmZ5INFaG5wC-A8avYJTzv8_1lFqZg/view?usp=drive_link',
          caption: '30 сек тизер',
          description: '30 сек тизер',
        },
        {
          type: 'image',
          src: 'https://drive.google.com/file/d/1kjty0PxtjxcTg6KClINZBvR7JcicdDTT/view?usp=drive_link',
          caption: 'Первый экран лендинга',
          description: 'Первый экран лендинга',
        },
        {
          type: 'image',
          src: 'https://drive.google.com/file/d/1kjty0PxtjxcTg6KClINZBvR7JcicdDTT/view?usp=drive_link',
          caption: 'Первый экран лендинга',
          description: 'Первый экран лендинга',
        },
        {
          type: 'image',
          src: 'https://drive.google.com/file/d/1kjty0PxtjxcTg6KClINZBvR7JcicdDTT/view?usp=drive_link',
          caption: 'Первый экран лендинга',
          description: 'Первый экран лендинга',
        },
      ],
    },
    {
      authorId: ivan.id,
      slug: 'product-teaser-2c31241c234',
      title: 'Product Teaser',
      subtitle: '30-секундный ролик',
      description: 'Короткий тизер и кадры из интерфейса.',
      status: 'active',
      tags: [{
        label: 'new',
        url: 'https://new.com',
      }, {
        label: '2025',
        url: 'https://2025.com',
      }, {
        label: 'motion',
        url: 'https://motion.com',
      }],
      date: new Date('2025-02-12T00:00:00Z'),
      slides: [
        {
          type: 'video',
          src: 'https://drive.google.com/file/d/1XBsmZ5INFaG5wC-A8avYJTzv8_1lFqZg/view?usp=drive_link',
          caption: '30 сек тизер',
          description: '30 сек тизер',
        },
        {
          type: 'image',
          src: 'https://drive.google.com/file/d/1kjty0PxtjxcTg6KClINZBvR7JcicdDTT/view?usp=drive_link',
          caption: 'Первый экран лендинга',
          description: 'Первый экран лендинга',
        },
        {
          type: 'image',
          src: 'https://drive.google.com/file/d/1kjty0PxtjxcTg6KClINZBvR7JcicdDTT/view?usp=drive_link',
          caption: 'Первый экран лендинга',
          description: 'Первый экран лендинга',
        },
        {
          type: 'image',
          src: 'https://drive.google.com/file/d/1kjty0PxtjxcTg6KClINZBvR7JcicdDTT/view?usp=drive_link',
          caption: 'Первый экран лендинга',
          description: 'Первый экран лендинга',
        },
      ],
    },
    {
      authorId: ivan.id,
      slug: 'product-teaser-231c41234c1232',
      title: 'Product Teaser',
      subtitle: '30-секундный ролик',
      description: 'Короткий тизер и кадры из интерфейса.',
      status: 'active',
      tags: [{
        label: 'new',
        url: 'https://new.com',
      }, {
        label: '2025',
        url: 'https://2025.com',
      }, {
        label: 'motion',
        url: 'https://motion.com',
      }],
      date: new Date('2025-02-12T00:00:00Z'),
      slides: [
        {
          type: 'video',
          src: 'https://drive.google.com/file/d/1XBsmZ5INFaG5wC-A8avYJTzv8_1lFqZg/view?usp=drive_link',
          caption: '30 сек тизер',
          description: '30 сек тизер',
        },
        {
          type: 'image',
          src: 'https://drive.google.com/file/d/1kjty0PxtjxcTg6KClINZBvR7JcicdDTT/view?usp=drive_link',
          caption: 'Первый экран лендинга',
          description: 'Первый экран лендинга',
        },
        {
          type: 'image',
          src: 'https://drive.google.com/file/d/1kjty0PxtjxcTg6KClINZBvR7JcicdDTT/view?usp=drive_link',
          caption: 'Первый экран лендинга',
          description: 'Первый экран лендинга',
        },
        {
          type: 'image',
          src: 'https://drive.google.com/file/d/1kjty0PxtjxcTg6KClINZBvR7JcicdDTT/view?usp=drive_link',
          caption: 'Первый экран лендинга',
          description: 'Первый экран лендинга',
        },
      ],
    },
  ]

  for (const project of projects) {
    const [p] = await db.insert(schema.projects).values({ ...project, status: 'active' }).returning()
    for (const slide of project.slides) {
      await db.insert(schema.projectMedia).values({
        projectId: p.id,
        position: 0,
        type: slide.type as 'image' | 'video',
        src: slide.src,
        caption: slide.caption,
        description: slide.description,
      }).returning()
    }
  }

  // eslint-disable-next-line no-console
  console.timeEnd('seed')
  // eslint-disable-next-line no-console
  console.log('✔ Seed completed:', {
    authors: [ivan.slug, anna.slug],
    users: [admin.email, editor.email],
    projects: [p1.slug, p2.slug, p3.slug, p4.slug],
  })
  process.exit(0)
}

main().catch((e) => {
  console.error('Seed failed:', e)
  process.exit(1)
})

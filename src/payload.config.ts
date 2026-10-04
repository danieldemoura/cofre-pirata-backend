import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import { pt } from '@payloadcms/translations/languages/pt'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

// Collections
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Tags } from './collections/Tags'
import { Instructors } from './collections/Instructors'
import { VideoPlayers } from './collections/VideoPlayers'
import { Courses } from './collections/Courses'
import { Modules } from './collections/Modules'
import { Lessons } from './collections/Lessons'
import { Carousels } from './collections/Carousels'
import { CourseReviews } from './collections/CourseReviews'
import { LessonComments } from './collections/LessonComments'
import { LessonProgress } from './collections/LessonProgress'
import { FavoriteCourses } from './collections/FavoriteCourses'
import { StudentNotes } from './collections/StudentNotes'
import { SupportTickets } from './collections/SupportTickets'

// Globals
import { Home } from './globals/Home'
import { Menu } from './globals/Menu'
import { Footer } from './globals/Footer'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  i18n: {
    fallbackLanguage: 'en',
    supportedLanguages: {
      en,
      pt,
    },
    translations: {
      pt: {
        folders: {
          browseByFolder: 'Pastas de Mídia',
        },
      },
    },
  },
  folders: {
    browseByFolder: true,
    collectionOverrides: [
      ({ collection }) => {
        collection.labels = {
          singular: 'Pasta de Mídia',
          plural: 'Pastas de Mídia',
        }
        collection.admin = {
          ...collection.admin,
          group: 'Sistema & Mídia',
        }
        return collection
      },
    ],
  },
  collections: [
    // --- 1. Sistema & Mídia ---
    Users,
    Media,

    // --- 2. Cursos & Conteúdo (Ordem personalizada) ---
    Courses, // 1º Cursos
    Modules, // 2º Módulos
    Lessons, // 3º Aulas
    VideoPlayers, // 4º Players de Vídeo
    Instructors, // 5º Instrutores
    Tags, // 6º Categorias

    // --- 3. Configuração Global ---
    Carousels,

    // --- 4. Área do Aluno ---
    CourseReviews,
    LessonComments,
    LessonProgress,
    FavoriteCourses,
    StudentNotes,
    SupportTickets,
  ],
  globals: [Home, Menu, Footer],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
  onInit: async (payload) => {
    const defaultFolders = ['Capas dos Cursos', 'Instrutores', 'Categorias', 'Geral']

    for (const name of defaultFolders) {
      try {
        const existing = await payload.find({
          collection: 'payload-folders',
          where: {
            name: {
              equals: name,
            },
          },
        })

        if (existing.totalDocs === 0) {
          await payload.create({
            collection: 'payload-folders',
            data: {
              name,
            },
          })
          payload.logger.info(`📁 Pasta padrão '${name}' criada com sucesso.`)
        }
      } catch (error) {
        payload.logger.error({ err: error }, `Erro ao criar pasta '${name}'`)
      }
    }
  },
})

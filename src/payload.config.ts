import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
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
  collections: [
    Users,
    Media,
    Tags,
    Courses,
    Instructors,
    VideoPlayers,
    Modules,
    Lessons,
    Carousels,
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
})

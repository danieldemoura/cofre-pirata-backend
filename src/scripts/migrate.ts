import 'dotenv/config'
import pg from 'pg'
import { getPayload } from 'payload'
import configPromise from '../payload.config'

const { Client } = pg

const DIRECTUS_DATABASE_URL =
  process.env.DIRECTUS_DATABASE_URL || 'postgresql://postgres:123@127.0.0.1:5433/directus_antigo'

/**
 * Converte entidades HTML comuns para caracteres legíveis
 */
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&aacute;/g, 'á')
    .replace(/&eacute;/g, 'é')
    .replace(/&iacute;/g, 'í')
    .replace(/&oacute;/g, 'ó')
    .replace(/&uacute;/g, 'ú')
    .replace(/&atilde;/g, 'ã')
    .replace(/&otilde;/g, 'õ')
    .replace(/&acirc;/g, 'â')
    .replace(/&ecirc;/g, 'ê')
    .replace(/&ocirc;/g, 'ô')
    .replace(/&ccedil;/g, 'ç')
    .replace(/&Aacute;/g, 'Á')
    .replace(/&Eacute;/g, 'É')
    .replace(/&Iacute;/g, 'Í')
    .replace(/&Oacute;/g, 'Ó')
    .replace(/&Uacute;/g, 'Ú')
    .replace(/&Atilde;/g, 'Ã')
    .replace(/&Otilde;/g, 'Õ')
    .replace(/&Acirc;/g, 'Â')
    .replace(/&Ecirc;/g, 'Ê')
    .replace(/&Ocirc;/g, 'Ô')
    .replace(/&Ccedil;/g, 'Ç')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
}

/**
 * Cria a estrutura base do Lexical AST para um texto
 */
function createLexicalRoot(text: string) {
  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      children: [
        {
          type: 'paragraph',
          format: '' as const,
          indent: 0,
          version: 1,
          children: [
            {
              mode: 'normal' as const,
              text: text || '',
              type: 'text',
              style: '',
              detail: 0,
              format: 0,
              version: 1,
            },
          ],
          direction: 'ltr' as const,
          textStyle: '',
          textFormat: 0,
        },
      ],
      direction: 'ltr' as const,
    },
  }
}

/**
 * Converte strings HTML / texto puro para o formato Lexical AST do Payload 3.x
 */
function convertToLexical(content: string | null | undefined): any {
  if (!content || typeof content !== 'string' || content.trim() === '') {
    return undefined
  }

  let raw = content
  if (/<[a-z][\s\S]*>/i.test(raw)) {
    raw = raw
      .replace(/<br\s*[\/]?>/gi, '\n')
      .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
  }

  const decoded = decodeHtmlEntities(raw).replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const paragraphs = decoded
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(p => p.length > 0)

  if (paragraphs.length === 0) {
    return undefined
  }

  const children = paragraphs.map(pText => ({
    type: 'paragraph',
    format: '' as const,
    indent: 0,
    version: 1,
    children: [
      {
        mode: 'normal' as const,
        text: pText,
        type: 'text',
        style: '',
        detail: 0,
        format: 0,
        version: 1,
      },
    ],
    direction: 'ltr' as const,
    textStyle: '',
    textFormat: 0,
  }))

  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      children,
      direction: 'ltr' as const,
    },
  }
}

async function migrate() {
  console.log('====================================================')
  console.log('🚀 INICIANDO MIGRAÇÃO: DIRECTUS LEGADO -> PAYLOAD CMS')
  console.log('====================================================')

  // Conectar ao Directus legado
  const directus = new Client({ connectionString: DIRECTUS_DATABASE_URL })
  await directus.connect()
  console.log('✅ Conectado ao banco de origem (Directus):', DIRECTUS_DATABASE_URL)

  // Inicializar Payload CMS Local API
  const payload = await getPayload({ config: configPromise })
  console.log('✅ Payload CMS inicializado com sucesso via Local API\n')

  // Mapas de IDs para integridade referencial
  const userIdMap = new Map<string, number>()
  const tagIdMap = new Map<number, number>()
  const instructorIdMap = new Map<number, number>()
  const courseIdMap = new Map<number, number>()
  const moduleIdMap = new Map<number, number>()
  const lessonIdMap = new Map<number, number>()
  const videoPlayerIdMap = new Map<number, number>()
  const carouselIdMap = new Map<number, number>()
  const commentIdMap = new Map<number, number>()

  // Resumo de contagens
  const stats: Record<string, { total: number; migrados: number; erros: number }> = {
    '1. Usuários (directus_users)': { total: 0, migrados: 0, erros: 0 },
    '2.1 Categorias (tags)': { total: 0, migrados: 0, erros: 0 },
    '2.2 Instrutores (instructors)': { total: 0, migrados: 0, erros: 0 },
    '3. Cursos (courses)': { total: 0, migrados: 0, erros: 0 },
    '4. Módulos (modules)': { total: 0, migrados: 0, erros: 0 },
    '5. Aulas (lessons)': { total: 0, migrados: 0, erros: 0 },
    '6. Players de Vídeo (video_players)': { total: 0, migrados: 0, erros: 0 },
    '7. Carrosséis (carousels)': { total: 0, migrados: 0, erros: 0 },
    '8.1 Avaliações (course_reviews)': { total: 0, migrados: 0, erros: 0 },
    '8.2 Comentários (lesson_comments)': { total: 0, migrados: 0, erros: 0 },
    '8.3 Progresso (lesson_progress)': { total: 0, migrados: 0, erros: 0 },
    '8.4 Favoritos (favorite_courses)': { total: 0, migrados: 0, erros: 0 },
    '8.5 Anotações (student_notes)': { total: 0, migrados: 0, erros: 0 },
    '8.6 Suporte (support_tickets)': { total: 0, migrados: 0, erros: 0 },
    '9.1 Global Home': { total: 1, migrados: 0, erros: 0 },
    '9.2 Global Menu': { total: 1, migrados: 0, erros: 0 },
    '9.3 Global Footer': { total: 1, migrados: 0, erros: 0 },
  }

  // =========================================================================
  // PASSO 1: USUÁRIOS (directus_users -> users)
  // =========================================================================
  console.log('📌 Passo 1: Migrando Usuários...')
  const usersRes = await directus.query('SELECT * FROM directus_users ORDER BY id ASC')
  stats['1. Usuários (directus_users)'].total = usersRes.rows.length

  for (const u of usersRes.rows) {
    try {
      const email = u.email ? u.email.toLowerCase().trim() : ''
      if (!email) {
        console.warn(`  ⚠️ Usuário sem email (ID: ${u.id}), ignorando`)
        stats['1. Usuários (directus_users)'].erros++
        continue
      }

      const existing = await payload.find({
        collection: 'users',
        where: { email: { equals: email } },
        limit: 1,
      })

      if (existing.docs.length > 0) {
        const doc = existing.docs[0]
        const updated = await payload.update({
          collection: 'users',
          id: doc.id,
          data: {
            first_name: u.first_name || doc.first_name || undefined,
            last_name: u.last_name || doc.last_name || undefined,
            is_public_profile: u.is_public_profile ?? doc.is_public_profile ?? false,
            study_plan_days: u.study_plan_days || doc.study_plan_days || undefined,
            study_plan_minutes: u.study_plan_minutes || doc.study_plan_minutes || undefined,
            study_plan_included_extras: u.study_plan_included_extras || doc.study_plan_included_extras || undefined,
          },
        })
        userIdMap.set(u.id, updated.id)
        console.log(`  🔄 Usuário atualizado: ${email} -> ID ${updated.id}`)
      } else {
        const created = await payload.create({
          collection: 'users',
          data: {
            email: email,
            password: 'Mudar@123456!',
            first_name: u.first_name || '',
            last_name: u.last_name || '',
            is_public_profile: Boolean(u.is_public_profile),
            study_plan_days: u.study_plan_days || undefined,
            study_plan_minutes: u.study_plan_minutes || undefined,
            study_plan_included_extras: u.study_plan_included_extras || undefined,
          },
        })
        userIdMap.set(u.id, created.id)
        console.log(`  ➕ Usuário criado: ${email} -> ID ${created.id}`)
      }
      stats['1. Usuários (directus_users)'].migrados++
    } catch (err: any) {
      console.error(`  ❌ Erro ao migrar usuário ${u.email}:`, err.message)
      stats['1. Usuários (directus_users)'].erros++
    }
  }

  // =========================================================================
  // PASSO 2: CATEGORIAS E INSTRUTORES (tags e instructors)
  // =========================================================================
  console.log('\n📌 Passo 2: Migrando Categorias e Instrutores...')

  // 2.1 Tags
  const tagsRes = await directus.query('SELECT * FROM tags ORDER BY COALESCE(sort, 9999), id ASC')
  stats['2.1 Categorias (tags)'].total = tagsRes.rows.length
  for (const t of tagsRes.rows) {
    try {
      const created = await payload.create({
        collection: 'tags',
        data: {
          title: t.title,
          slug: t.slug || undefined,
          sort: t.sort ?? undefined,
        },
      })
      tagIdMap.set(t.id, created.id)
      stats['2.1 Categorias (tags)'].migrados++
      console.log(`  🏷️ Categoria criada: "${t.title}" -> ID ${created.id}`)
    } catch (err: any) {
      console.error(`  ❌ Erro ao migrar tag "${t.title}":`, err.message)
      stats['2.1 Categorias (tags)'].erros++
    }
  }

  // 2.2 Instructors
  const instRes = await directus.query('SELECT * FROM instructors ORDER BY id ASC')
  stats['2.2 Instrutores (instructors)'].total = instRes.rows.length
  for (const i of instRes.rows) {
    try {
      const created = await payload.create({
        collection: 'instructors',
        data: {
          name: i.name,
          bio: convertToLexical(i.bio),
        },
      })
      instructorIdMap.set(i.id, created.id)
      stats['2.2 Instrutores (instructors)'].migrados++
      console.log(`  👨‍🏫 Instrutor criado: "${i.name}" -> ID ${created.id}`)
    } catch (err: any) {
      console.error(`  ❌ Erro ao migrar instrutor "${i.name}":`, err.message)
      stats['2.2 Instrutores (instructors)'].erros++
    }
  }

  // =========================================================================
  // PASSO 3: CURSOS (courses)
  // =========================================================================
  console.log('\n📌 Passo 3: Migrando Cursos...')
  const coursesRes = await directus.query('SELECT * FROM courses ORDER BY id ASC')
  stats['3. Cursos (courses)'].total = coursesRes.rows.length

  for (const c of coursesRes.rows) {
    try {
      // Tags do curso
      const ctRes = await directus.query(
        'SELECT tags_id FROM courses_tags WHERE courses_id = $1 AND tags_id IS NOT NULL ORDER BY COALESCE(sort, 9999), id ASC',
        [c.id]
      )
      const mappedTags = ctRes.rows
        .map(r => tagIdMap.get(r.tags_id))
        .filter((id): id is number => typeof id === 'number')

      // Instrutores do curso
      const ciRes = await directus.query(
        'SELECT instructors_id FROM courses_instructors WHERE courses_id = $1 AND instructors_id IS NOT NULL ORDER BY COALESCE(sort, 9999), id ASC',
        [c.id]
      )
      const mappedInstructors = ciRes.rows
        .map(r => instructorIdMap.get(r.instructors_id))
        .filter((id): id is number => typeof id === 'number')

      // Recursos externos do curso
      let mappedResources = undefined
      if (Array.isArray(c.resources) && c.resources.length > 0) {
        mappedResources = c.resources.map((r: any) => ({
          nome_do_recurso: r.nome_do_recurso || '',
          url: r.url || r.link || '',
        }))
      }

      const created = await payload.create({
        collection: 'courses',
        data: {
          title: c.title,
          slug: c.slug || undefined,
          status: (c.status as any) || 'público',
          release_year: c.release_year ? String(c.release_year) : undefined,
          description: convertToLexical(c.description),
          tags: mappedTags.length > 0 ? mappedTags : undefined,
          instructors: mappedInstructors.length > 0 ? mappedInstructors : undefined,
          resources: mappedResources,
        },
      })
      courseIdMap.set(c.id, created.id)
      stats['3. Cursos (courses)'].migrados++
      console.log(`  📚 Curso criado: "${c.title}" -> ID ${created.id}`)
    } catch (err: any) {
      console.error(`  ❌ Erro ao migrar curso "${c.title}":`, err.message)
      stats['3. Cursos (courses)'].erros++
    }
  }

  // Segundo passe para hierarquia de cursos (parent_course_id e sub_courses)
  for (const c of coursesRes.rows) {
    const newCourseId = courseIdMap.get(c.id)
    if (!newCourseId) continue
    const updates: any = {}

    if (c.parent_course_id && courseIdMap.has(c.parent_course_id)) {
      updates.parent_course_id = courseIdMap.get(c.parent_course_id)
    }

    const childCourses = coursesRes.rows
      .filter(child => child.parent_course_id === c.id)
      .map(child => courseIdMap.get(child.id))
      .filter((id): id is number => typeof id === 'number')

    if (childCourses.length > 0) {
      updates.sub_courses = childCourses
    }

    if (Object.keys(updates).length > 0) {
      try {
        await payload.update({
          collection: 'courses',
          id: newCourseId,
          data: updates,
        })
      } catch (e: any) {
        console.warn(`  ⚠️ Aviso ao atualizar hierarquia do curso ID ${c.id}:`, e.message)
      }
    }
  }

  // =========================================================================
  // PASSO 4: MÓDULOS (modules)
  // =========================================================================
  console.log('\n📌 Passo 4: Migrando Módulos...')
  const modulesRes = await directus.query('SELECT * FROM modules ORDER BY COALESCE(sort, 9999), id ASC')
  stats['4. Módulos (modules)'].total = modulesRes.rows.length

  for (const m of modulesRes.rows) {
    try {
      const courseId = m.course_id ? courseIdMap.get(m.course_id) || undefined : undefined

      const created = await payload.create({
        collection: 'modules',
        data: {
          title: m.title,
          sort: m.sort ?? undefined,
          description: convertToLexical(m.description),
          course: courseId,
        },
      })
      moduleIdMap.set(m.id, created.id)
      stats['4. Módulos (modules)'].migrados++
      console.log(`  📦 Módulo criado: "${m.title}" -> ID ${created.id}`)
    } catch (err: any) {
      console.error(`  ❌ Erro ao migrar módulo "${m.title}":`, err.message)
      stats['4. Módulos (modules)'].erros++
    }
  }

  // =========================================================================
  // PASSO 5: AULAS (lessons)
  // =========================================================================
  console.log('\n📌 Passo 5: Migrando Aulas...')
  const lessonsRes = await directus.query('SELECT * FROM lessons ORDER BY id ASC')
  stats['5. Aulas (lessons)'].total = lessonsRes.rows.length

  for (const l of lessonsRes.rows) {
    try {
      // No Directus antigo, lesson_id é a FK para o módulo
      const moduleId = l.lesson_id ? moduleIdMap.get(l.lesson_id) || undefined : undefined
      const instructorId = l.lesson_instructor ? instructorIdMap.get(l.lesson_instructor) || undefined : undefined

      let mappedResource = undefined
      if (Array.isArray(l.resource) && l.resource.length > 0) {
        mappedResource = l.resource.map((r: any) => ({
          nome_do_recurso: r.nome_do_recurso || '',
          link: r.link || r.url || '',
        }))
      }

      const created = await payload.create({
        collection: 'lessons',
        data: {
          title: l.title,
          slug: l.slug || undefined,
          duration: l.duration || undefined,
          description: convertToLexical(l.description),
          module: moduleId,
          lesson_instructor: instructorId,
          resource: mappedResource,
        },
      })
      lessonIdMap.set(l.id, created.id)
      stats['5. Aulas (lessons)'].migrados++
      if (
        stats['5. Aulas (lessons)'].migrados % 100 === 0 ||
        stats['5. Aulas (lessons)'].migrados === lessonsRes.rows.length
      ) {
        console.log(`  🎬 Aulas migradas: ${stats['5. Aulas (lessons)'].migrados}/${lessonsRes.rows.length}`)
      }
    } catch (err: any) {
      console.error(`  ❌ Erro ao migrar aula "${l.title}":`, err.message)
      stats['5. Aulas (lessons)'].erros++
    }
  }

  // Atualizar relacionamentos inversos (modules.lessons e courses.modules)
  for (const m of modulesRes.rows) {
    const newModId = moduleIdMap.get(m.id)
    if (!newModId) continue
    const modLessons = lessonsRes.rows
      .filter(l => l.lesson_id === m.id)
      .map(l => lessonIdMap.get(l.id))
      .filter((id): id is number => typeof id === 'number')

    if (modLessons.length > 0) {
      try {
        await payload.update({
          collection: 'modules',
          id: newModId,
          data: { lessons: modLessons },
        })
      } catch (e: any) {
        console.warn(`  ⚠️ Aviso ao vincular aulas ao módulo ID ${m.id}:`, e.message)
      }
    }
  }

  for (const c of coursesRes.rows) {
    const newCourseId = courseIdMap.get(c.id)
    if (!newCourseId) continue
    const courseModules = modulesRes.rows
      .filter(m => m.course_id === c.id)
      .map(m => moduleIdMap.get(m.id))
      .filter((id): id is number => typeof id === 'number')

    if (courseModules.length > 0) {
      try {
        await payload.update({
          collection: 'courses',
          id: newCourseId,
          data: { modules: courseModules },
        })
      } catch (e: any) {
        console.warn(`  ⚠️ Aviso ao vincular módulos ao curso ID ${c.id}:`, e.message)
      }
    }
  }

  // =========================================================================
  // PASSO 6: PLAYERS DE VÍDEO (video_players)
  // =========================================================================
  console.log('\n📌 Passo 6: Migrando Players de Vídeo...')
  const vpRes = await directus.query('SELECT * FROM video_players ORDER BY COALESCE(sort, 9999), id ASC')
  stats['6. Players de Vídeo (video_players)'].total = vpRes.rows.length

  const validPlayers = new Set([
    'YouTube',
    'Rutube',
    'Dzen',
    'VKVideo',
    'Dailymotion',
    'Odysee',
    'Rumble',
    'OK.ru',
    'Byse',
    'Abyss',
  ])

  for (const vp of vpRes.rows) {
    try {
      const lessonId = vp.lesson_id ? lessonIdMap.get(vp.lesson_id) || undefined : undefined

      let playerValue: any = vp.players
      if (playerValue && playerValue.toLowerCase() === 'odysee') {
        playerValue = 'Odysee'
      }
      if (!validPlayers.has(playerValue)) {
        playerValue = undefined
      }

      const created = await payload.create({
        collection: 'video_players',
        data: {
          players: playerValue,
          url: vp.url || undefined,
          lesson: lessonId,
          sort: vp.sort ?? undefined,
        },
      })
      videoPlayerIdMap.set(vp.id, created.id)
      stats['6. Players de Vídeo (video_players)'].migrados++
      if (
        stats['6. Players de Vídeo (video_players)'].migrados % 300 === 0 ||
        stats['6. Players de Vídeo (video_players)'].migrados === vpRes.rows.length
      ) {
        console.log(`  📹 Players migrados: ${stats['6. Players de Vídeo (video_players)'].migrados}/${vpRes.rows.length}`)
      }
    } catch (err: any) {
      console.error(`  ❌ Erro ao migrar player ID ${vp.id}:`, err.message)
      stats['6. Players de Vídeo (video_players)'].erros++
    }
  }

  // Vincular players nas aulas (lessons.players)
  for (const l of lessonsRes.rows) {
    const newLessonId = lessonIdMap.get(l.id)
    if (!newLessonId) continue
    const lessonPlayers = vpRes.rows
      .filter(vp => vp.lesson_id === l.id)
      .map(vp => videoPlayerIdMap.get(vp.id))
      .filter((id): id is number => typeof id === 'number')

    if (lessonPlayers.length > 0) {
      try {
        await payload.update({
          collection: 'lessons',
          id: newLessonId,
          data: { players: lessonPlayers },
        })
      } catch (e: any) {
        console.warn(`  ⚠️ Aviso ao vincular players à aula ID ${l.id}:`, e.message)
      }
    }
  }

  // =========================================================================
  // PASSO 7: CARROSSÉIS (carousels)
  // =========================================================================
  console.log('\n📌 Passo 7: Migrando Carrosséis...')
  const carRes = await directus.query('SELECT * FROM carousels ORDER BY COALESCE(sort, 9999), id ASC')
  stats['7. Carrosséis (carousels)'].total = carRes.rows.length

  for (const car of carRes.rows) {
    try {
      const ccRes = await directus.query(
        'SELECT courses_id FROM carousels_courses WHERE carousels_id = $1 AND courses_id IS NOT NULL ORDER BY COALESCE(sort, 9999), id ASC',
        [car.id]
      )
      const mappedCourses = ccRes.rows
        .map(r => courseIdMap.get(r.courses_id))
        .filter((id): id is number => typeof id === 'number')

      const created = await payload.create({
        collection: 'carousels',
        data: {
          title: car.title,
          status: (car.status as any) || 'published',
          sort: car.sort ?? undefined,
          courses: mappedCourses.length > 0 ? mappedCourses : undefined,
        },
      })
      carouselIdMap.set(car.id, created.id)
      stats['7. Carrosséis (carousels)'].migrados++
      console.log(`  🎠 Carrossel criado: "${car.title}" (${mappedCourses.length} cursos) -> ID ${created.id}`)
    } catch (err: any) {
      console.error(`  ❌ Erro ao migrar carrossel "${car.title}":`, err.message)
      stats['7. Carrosséis (carousels)'].erros++
    }
  }

  // =========================================================================
  // PASSO 8: INTERAÇÕES DOS ALUNOS
  // =========================================================================
  console.log('\n📌 Passo 8: Migrando Interações dos Alunos...')

  // 8.1 Course Reviews
  const crRes = await directus.query('SELECT * FROM course_reviews ORDER BY id ASC')
  stats['8.1 Avaliações (course_reviews)'].total = crRes.rows.length
  for (const cr of crRes.rows) {
    try {
      const courseId = courseIdMap.get(cr.course_id)
      const userId = userIdMap.get(cr.user_created)
      if (!courseId || !userId) {
        console.warn(`  ⚠️ Avaliação ignorada (ID: ${cr.id}): curso ou usuário não encontrado`)
        stats['8.1 Avaliações (course_reviews)'].erros++
        continue
      }

      await payload.create({
        collection: 'course_reviews',
        data: {
          course: courseId,
          user: userId,
          rating: cr.rating || 5,
          comment: cr.comment || undefined,
          status: (cr.status as any) || 'published',
        },
      })
      stats['8.1 Avaliações (course_reviews)'].migrados++
      console.log(`  ⭐ Avaliação criada para curso ID ${courseId}`)
    } catch (err: any) {
      console.error(`  ❌ Erro ao migrar avaliação ID ${cr.id}:`, err.message)
      stats['8.1 Avaliações (course_reviews)'].erros++
    }
  }

  // 8.2 Lesson Comments
  const lcRes = await directus.query(
    'SELECT * FROM lesson_comments ORDER BY CASE WHEN parent_id IS NULL THEN 0 ELSE 1 END, id ASC'
  )
  stats['8.2 Comentários (lesson_comments)'].total = lcRes.rows.length
  for (const lc of lcRes.rows) {
    try {
      const lessonId = lessonIdMap.get(lc.lesson_id)
      const userId = userIdMap.get(lc.user_created)
      if (!lessonId || !userId) {
        console.warn(`  ⚠️ Comentário ignorado (ID: ${lc.id}): aula ou usuário não encontrado`)
        stats['8.2 Comentários (lesson_comments)'].erros++
        continue
      }

      const parentId = lc.parent_id ? commentIdMap.get(lc.parent_id) || undefined : undefined
      let statusValue: any = lc.status
      if (statusValue === 'deleted') {
        statusValue = 'archived'
      } else if (!['published', 'draft', 'archived'].includes(statusValue)) {
        statusValue = 'published'
      }

      const lexicalContent = convertToLexical(lc.content) || createLexicalRoot(lc.content || '')

      const created = await payload.create({
        collection: 'lesson_comments',
        data: {
          lesson: lessonId,
          user: userId,
          status: statusValue,
          parent_id: parentId,
          content: lexicalContent,
        },
      })
      commentIdMap.set(lc.id, created.id)
      stats['8.2 Comentários (lesson_comments)'].migrados++
      console.log(`  💬 Comentário criado (ID ${created.id}) para aula ID ${lessonId}`)
    } catch (err: any) {
      console.error(`  ❌ Erro ao migrar comentário ID ${lc.id}:`, err.message)
      stats['8.2 Comentários (lesson_comments)'].erros++
    }
  }

  // 8.3 Lesson Progress
  const lpRes = await directus.query('SELECT * FROM lesson_progress ORDER BY id ASC')
  stats['8.3 Progresso (lesson_progress)'].total = lpRes.rows.length
  for (const lp of lpRes.rows) {
    try {
      const lessonId = lessonIdMap.get(lp.lesson_id)
      const userId = userIdMap.get(lp.user_created)
      if (!lessonId || !userId) {
        stats['8.3 Progresso (lesson_progress)'].erros++
        continue
      }

      await payload.create({
        collection: 'lesson_progress',
        data: {
          user: userId,
          lesson: lessonId,
          completed_at: lp.completed_at ? new Date(lp.completed_at).toISOString() : undefined,
        },
      })
      stats['8.3 Progresso (lesson_progress)'].migrados++
    } catch (err: any) {
      console.error(`  ❌ Erro ao migrar progresso ID ${lp.id}:`, err.message)
      stats['8.3 Progresso (lesson_progress)'].erros++
    }
  }
  console.log(`  📈 Progressos migrados: ${stats['8.3 Progresso (lesson_progress)'].migrados}/${stats['8.3 Progresso (lesson_progress)'].total}`)

  // 8.4 Favorite Courses
  const fcRes = await directus.query('SELECT * FROM favorite_courses ORDER BY id ASC')
  stats['8.4 Favoritos (favorite_courses)'].total = fcRes.rows.length
  for (const fc of fcRes.rows) {
    try {
      const courseId = courseIdMap.get(fc.course)
      const userId = userIdMap.get(fc.user_created)
      if (!courseId || !userId) {
        stats['8.4 Favoritos (favorite_courses)'].erros++
        continue
      }

      await payload.create({
        collection: 'favorite_courses',
        data: {
          user: userId,
          course: courseId,
        },
      })
      stats['8.4 Favoritos (favorite_courses)'].migrados++
      console.log(`  ❤️ Curso favorito vinculado: Curso ID ${courseId} para Usuário ID ${userId}`)
    } catch (err: any) {
      console.error(`  ❌ Erro ao migrar favorito ID ${fc.id}:`, err.message)
      stats['8.4 Favoritos (favorite_courses)'].erros++
    }
  }

  // 8.5 Student Notes
  const snRes = await directus.query('SELECT * FROM student_notes ORDER BY id ASC')
  stats['8.5 Anotações (student_notes)'].total = snRes.rows.length
  for (const sn of snRes.rows) {
    try {
      const courseId = courseIdMap.get(sn.course_id)
      const userId = userIdMap.get(sn.user_created)
      if (!courseId || !userId) {
        stats['8.5 Anotações (student_notes)'].erros++
        continue
      }

      const lessonId = sn.lesson_id ? lessonIdMap.get(sn.lesson_id) || undefined : undefined
      const lexicalContent = convertToLexical(sn.content) || createLexicalRoot(sn.content || '')

      await payload.create({
        collection: 'student_notes',
        data: {
          user: userId,
          course: courseId,
          lesson: lessonId,
          content: lexicalContent,
        },
      })
      stats['8.5 Anotações (student_notes)'].migrados++
      console.log(`  📝 Anotação criada para o curso ID ${courseId}`)
    } catch (err: any) {
      console.error(`  ❌ Erro ao migrar anotação ID ${sn.id}:`, err.message)
      stats['8.5 Anotações (student_notes)'].erros++
    }
  }

  // 8.6 Support Tickets
  const stRes = await directus.query('SELECT * FROM support_tickets ORDER BY id ASC')
  stats['8.6 Suporte (support_tickets)'].total = stRes.rows.length
  for (const st of stRes.rows) {
    try {
      const userId = userIdMap.get(st.user_created)
      if (!userId) {
        stats['8.6 Suporte (support_tickets)'].erros++
        continue
      }

      let statusValue: any = st.status
      if (!['open', 'in_progress', 'resolved'].includes(statusValue)) {
        statusValue = 'open'
      }

      await payload.create({
        collection: 'support_tickets',
        data: {
          user: userId,
          subject: st.subject || 'Sem assunto',
          message: st.message || '',
          status: statusValue,
        },
      })
      stats['8.6 Suporte (support_tickets)'].migrados++
    } catch (err: any) {
      console.error(`  ❌ Erro ao migrar ticket ID ${st.id}:`, err.message)
      stats['8.6 Suporte (support_tickets)'].erros++
    }
  }

  // =========================================================================
  // PASSO 9: GLOBAIS (home, menu, footer)
  // =========================================================================
  console.log('\n📌 Passo 9: Atualizando Globais...')

  // 9.1 Home
  try {
    const homeRes = await directus.query('SELECT * FROM home WHERE id = 1')
    if (homeRes.rows.length > 0) {
      const home = homeRes.rows[0]
      const htRes = await directus.query(
        'SELECT tags_id FROM home_tags WHERE home_id = 1 AND tags_id IS NOT NULL ORDER BY COALESCE(sort, 9999), id ASC'
      )
      const mappedCatalogTags = htRes.rows
        .map(r => tagIdMap.get(r.tags_id))
        .filter((id): id is number => typeof id === 'number')

      const heroCourseId = home.hero_course ? courseIdMap.get(home.hero_course) || undefined : undefined
      const heroTagId = home.hero_tag ? tagIdMap.get(home.hero_tag) || undefined : undefined
      const mappedCarousels = Array.from(carouselIdMap.values())

      await payload.updateGlobal({
        slug: 'home',
        data: {
          hero_badge: home.hero_badge || undefined,
          hero_course: heroCourseId,
          hero_tag: heroTagId,
          hero_btn_primary: home.hero_btn_primary || undefined,
          hero_btn_primary_url: home.hero_btn_primary_url || undefined,
          hero_btn_secundary: home.hero_btn_secundary || undefined,
          hero_btn_secundary_url: home.hero_btn_secundary_url || undefined,
          catalog_list: mappedCatalogTags.length > 0 ? mappedCatalogTags : undefined,
          catalog_categories: mappedCatalogTags.length > 0 ? mappedCatalogTags : undefined,
          carousels_list: mappedCarousels.length > 0 ? mappedCarousels : undefined,
        },
      })
      stats['9.1 Global Home'].migrados++
      console.log('  🏠 Global Home atualizada com sucesso')
    }
  } catch (err: any) {
    console.error('  ❌ Erro ao atualizar Global Home:', err.message)
    stats['9.1 Global Home'].erros++
  }

  // 9.2 Menu
  try {
    const menuRes = await directus.query('SELECT * FROM menu WHERE id = 1')
    if (menuRes.rows.length > 0) {
      const menu = menuRes.rows[0]
      const itemsMenu = Array.isArray(menu.items_menu)
        ? menu.items_menu.map((item: any) => ({
            label: item.label || '',
            url: item.url || '',
          }))
        : []

      await payload.updateGlobal({
        slug: 'menu',
        data: {
          brand_name: menu.brand_name || undefined,
          logo_link: menu.logo_link || undefined,
          items_menu: itemsMenu.length > 0 ? itemsMenu : undefined,
        },
      })
      stats['9.2 Global Menu'].migrados++
      console.log('  🧭 Global Menu atualizado com sucesso')
    }
  } catch (err: any) {
    console.error('  ❌ Erro ao atualizar Global Menu:', err.message)
    stats['9.2 Global Menu'].erros++
  }

  // 9.3 Footer
  try {
    const footerRes = await directus.query('SELECT * FROM footer WHERE id = 1')
    if (footerRes.rows.length > 0) {
      const footer = footerRes.rows[0]
      const columns = Array.isArray(footer.columns)
        ? footer.columns.map((col: any) => ({
            title: col.title || '',
            links: Array.isArray(col.links)
              ? col.links.map((link: any) => ({
                  label: link.label || '',
                  url: link.url || '',
                }))
              : [],
          }))
        : []

      await payload.updateGlobal({
        slug: 'footer',
        data: {
          site_name: footer.site_name || undefined,
          description: footer.description || undefined,
          columns: columns.length > 0 ? columns : undefined,
        },
      })
      stats['9.3 Global Footer'].migrados++
      console.log('  🦶 Global Footer atualizado com sucesso')
    }
  } catch (err: any) {
    console.error('  ❌ Erro ao atualizar Global Footer:', err.message)
    stats['9.3 Global Footer'].erros++
  }

  await directus.end()

  // =========================================================================
  // RESUMO FINAL
  // =========================================================================
  console.log('\n====================================================')
  console.log('📊 RESUMO DA MIGRAÇÃO')
  console.log('====================================================')
  console.table(
    Object.entries(stats).map(([entidade, dados]) => ({
      Entidade: entidade,
      'Total Origem': dados.total,
      Migrados: dados.migrados,
      Erros: dados.erros,
      Status: dados.erros === 0 ? '✅ Sucesso' : '⚠️ Com erros',
    }))
  )
  console.log('🎉 Migração finalizada com sucesso!')
}

migrate()
  .then(() => {
    process.exit(0)
  })
  .catch(err => {
    console.error('❌ Falha fatal na migração:', err)
    process.exit(1)
  })

import type { CollectionConfig, Field } from 'payload'

const defaultFolderValue = async ({ req }: { req: any }) => {
  if (!req?.payload) return undefined

  let targetFolderName = 'Geral'
  const referer =
    req.headers instanceof Headers
      ? req.headers.get('referer') || ''
    : ((req.headers as Record<string, string | string[] | undefined>)?.referer as string) || ''

  if (typeof referer === 'string') {
    if (referer.includes('/collections/courses')) {
      targetFolderName = 'Capas dos Cursos'
    } else if (referer.includes('/collections/instructors')) {
      targetFolderName = 'Instrutores'
    } else if (referer.includes('/collections/tags')) {
      targetFolderName = 'Categorias'
    }
  }

  try {
    const folderRes = await req.payload.find({
      collection: 'payload-folders',
      where: {
        name: {
          equals: targetFolderName,
        },
      },
      limit: 1,
    })

    if (folderRes.docs.length > 0) {
      return folderRes.docs[0].id
    }
  } catch (error) {
    req.payload.logger.error({ err: error }, `Erro ao obter pasta padrão '${targetFolderName}'`)
  }

  return undefined
}

const mediaFields: Field[] = [
  {
    name: 'alt',
    type: 'text',
    label: 'Texto Alternativo',
    required: true,
  },
]

// Intercepta a injeção do campo 'folder' feita pelo Payload (folders: true)
// para aplicar o defaultValue dinâmico e label customizado na UI
const originalPush = mediaFields.push.bind(mediaFields)
mediaFields.push = (...items: any[]) => {
  for (const item of items) {
    if (item && item.name === 'folder') {
      item.label = 'Pasta'
      item.defaultValue = defaultFolderValue
    }
  }
  return originalPush(...items)
}

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Mídia',
    plural: 'Mídias',
  },
  admin: {
    group: 'Sistema & Mídia',
    useAsTitle: 'alt',
  },
  folders: true,
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // Se a pasta já foi definida manualmente, não sobrescreve
        if (data.folder || operation !== 'create') {
          return data
        }

        let targetFolderName = 'Geral'
        const referer =
          req.headers instanceof Headers
            ? req.headers.get('referer') || ''
            : ((req.headers as Record<string, string | string[] | undefined>)?.referer as string) ||
              ''

        if (referer.includes('/collections/courses')) {
          targetFolderName = 'Capas dos Cursos'
        } else if (referer.includes('/collections/instructors')) {
          targetFolderName = 'Instrutores'
        } else if (referer.includes('/collections/tags')) {
          targetFolderName = 'Categorias'
        }

        try {
          const folderRes = await req.payload.find({
            collection: 'payload-folders',
            where: {
              name: {
                equals: targetFolderName,
              },
            },
            limit: 1,
          })

          if (folderRes.docs.length > 0) {
            data.folder = folderRes.docs[0].id
          }
        } catch (error) {
          req.payload.logger.error(
            { err: error },
            `Erro ao associar pasta '${targetFolderName}' no upload`,
          )
        }

        return data
      },
    ],
  },
  fields: mediaFields,
  upload: {
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 225,
        fit: 'cover',
        formatOptions: {
          format: 'webp',
          options: {
            quality: 80,
          },
        },
      },
      {
        name: 'card',
        width: 900,
        height: 506,
        fit: 'cover',
        formatOptions: {
          format: 'webp',
          options: {
            quality: 85,
          },
        },
      },
    ],
  },
}

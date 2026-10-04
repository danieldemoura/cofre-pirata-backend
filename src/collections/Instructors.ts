import type { CollectionConfig } from 'payload'

export const Instructors: CollectionConfig = {
  slug: 'instructors',
  labels: {
    singular: 'Instrutor',
    plural: 'Instrutores',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'avatar'],
    group: 'Cursos & Conteúdo',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Nome',
      required: true,
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      label: 'Avatar',
      filterOptions: {
        'folder.name': {
          equals: 'Instrutores',
        },
      },
    },
    {
      name: 'bio',
      type: 'richText',
      label: 'Biografia',
    },
  ],
}

import type { CollectionConfig } from 'payload'

export const Modules: CollectionConfig = {
  slug: 'modules',
  labels: {
    singular: 'Módulo',
    plural: 'Módulos',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'course', 'sort', 'updatedAt'],
    group: 'Cursos & Conteúdo',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Título',
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'course',
          type: 'relationship',
          relationTo: 'courses',
          hasMany: false,
          label: 'Nome do Curso',
          admin: {
            width: '70%',
            description: 'Selecione o curso principal ao qual esse módulo pertence',
          },
        },
        {
          name: 'sort',
          type: 'number',
          label: 'Ordem',
          admin: {
            width: '30%',
          },
        },
      ],
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Descrição',
    },
    {
      name: 'lessons',
      type: 'relationship',
      relationTo: 'lessons',
      hasMany: true,
      label: 'Lista de Aulas',
    },
  ],
}

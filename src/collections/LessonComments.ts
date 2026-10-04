import type { CollectionConfig } from 'payload'

export const LessonComments: CollectionConfig = {
  slug: 'lesson_comments',
  labels: {
    singular: 'Comentário da Aula',
    plural: 'Comentários da Aula',
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['lesson', 'user', 'status', 'parent_id', 'createdAt'],
    group: 'Área do Aluno',
  },
  fields: [
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      defaultValue: 'published',
      options: [
        { label: 'Publicado', value: 'published' },
        { label: 'Rascunho', value: 'draft' },
        { label: 'Arquivado', value: 'archived' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'lesson',
          type: 'relationship',
          relationTo: 'lessons',
          label: 'Aula',
          required: true,
          admin: {
            width: '50%',
          },
        },
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
          label: 'Aluno',
          required: true,
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'parent_id',
      type: 'relationship',
      relationTo: 'lesson_comments',
      label: 'Resposta a',
      admin: {
        description: 'Se este comentário for uma resposta a outro comentário',
      },
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Comentário',
      required: true,
    },
  ],
}

import type { CollectionConfig } from 'payload'

export const LessonProgress: CollectionConfig = {
  slug: 'lesson_progress',
  labels: {
    singular: 'Progresso da Aula',
    plural: 'Progresso da Aula',
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'lesson', 'completed_at'],
    group: 'Área do Aluno',
  },
  fields: [
    {
      type: 'row',
      fields: [
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
      ],
    },
    {
      name: 'completed_at',
      type: 'date',
      label: 'Concluído em',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
}

import type { CollectionConfig } from 'payload'

export const StudentNotes: CollectionConfig = {
  slug: 'student_notes',
  labels: {
    singular: 'Nota do Estudante',
    plural: 'Notas do Estudante',
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'course', 'lesson', 'updatedAt'],
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
            width: '33%',
          },
        },
        {
          name: 'course',
          type: 'relationship',
          relationTo: 'courses',
          label: 'Curso',
          required: true,
          admin: {
            width: '33%',
          },
        },
        {
          name: 'lesson',
          type: 'relationship',
          relationTo: 'lessons',
          label: 'Aula',
          admin: {
            width: '34%',
          },
        },
      ],
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Conteúdo',
      required: true,
    },
  ],
}

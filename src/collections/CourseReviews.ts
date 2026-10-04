import type { CollectionConfig } from 'payload'

export const CourseReviews: CollectionConfig = {
  slug: 'course_reviews',
  labels: {
    singular: 'Avaliação do Curso',
    plural: 'Avaliações do Curso',
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['course', 'user', 'rating', 'status', 'createdAt'],
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
          name: 'course',
          type: 'relationship',
          relationTo: 'courses',
          label: 'Nome do Curso',
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
      name: 'rating',
      type: 'number',
      label: 'Avaliação',
      min: 1,
      max: 5,
      required: true,
      admin: {
        description: 'Nota de 1 a 5',
      },
    },
    {
      name: 'comment',
      type: 'textarea',
      label: 'Depoimento',
    },
  ],
}

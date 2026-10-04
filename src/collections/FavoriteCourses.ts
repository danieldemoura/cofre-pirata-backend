import type { CollectionConfig } from 'payload'

export const FavoriteCourses: CollectionConfig = {
  slug: 'favorite_courses',
  labels: {
    singular: 'Curso Favorito',
    plural: 'Cursos Favoritos',
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'course', 'createdAt'],
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
          name: 'course',
          type: 'relationship',
          relationTo: 'courses',
          label: 'Curso',
          required: true,
          admin: {
            width: '50%',
          },
        },
      ],
    },
  ],
}

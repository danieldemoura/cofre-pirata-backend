import type { CollectionConfig } from 'payload'

export const Tags: CollectionConfig = {
  slug: 'tags',
  labels: {
    singular: 'Categoria',
    plural: 'Categorias',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'sort'],
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
      name: 'slug',
      type: 'text',
      label: 'Slug',
      index: true,
      admin: {
        description: 'Identificador único amigável para URL',
      },
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
      label: 'Ícone',
      filterOptions: {
        'folder.name': {
          equals: 'Categorias',
        },
      },
    },
    {
      name: 'sort',
      type: 'number',
      label: 'Ordem',
    },
  ],
}

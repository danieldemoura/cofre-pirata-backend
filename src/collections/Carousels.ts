import type { CollectionConfig } from 'payload'

export const Carousels: CollectionConfig = {
  slug: 'carousels',
  labels: {
    singular: 'Carrossel',
    plural: 'Carrosséis',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'sort'],
    group: 'Configuração Global',
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
      name: 'title',
      type: 'text',
      label: 'Nome do Carrossel',
      required: true,
    },
    {
      name: 'courses',
      type: 'relationship',
      relationTo: 'courses',
      hasMany: true,
      label: 'Cursos',
    },
    {
      name: 'sort',
      type: 'number',
      label: 'Ordem',
    },
  ],
}

import type { CollectionConfig } from 'payload'

export const SupportTickets: CollectionConfig = {
  slug: 'support_tickets',
  labels: {
    singular: 'Ticket de Suporte',
    plural: 'Tickets de Suporte',
  },
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'user', 'status', 'createdAt'],
    group: 'Área do Aluno',
  },
  fields: [
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      defaultValue: 'open',
      options: [
        { label: 'Aberto', value: 'open' },
        { label: 'Em progresso', value: 'in_progress' },
        { label: 'Resolvido', value: 'resolved' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      label: 'Aluno',
      required: true,
    },
    {
      name: 'subject',
      type: 'text',
      label: 'Assunto',
      required: true,
    },
    {
      name: 'message',
      type: 'textarea',
      label: 'Mensagem',
      required: true,
    },
    {
      name: 'attachments',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      label: 'Anexos',
    },
  ],
}

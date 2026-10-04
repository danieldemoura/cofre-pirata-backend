import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Usuário',
    plural: 'Usuários',
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'first_name', 'last_name', 'is_public_profile'],
    group: 'Sistema & Mídia',
  },
  auth: true,
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'first_name',
          type: 'text',
          label: 'Nome',
          admin: {
            width: '50%',
          },
        },
        {
          name: 'last_name',
          type: 'text',
          label: 'Sobrenome',
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'is_public_profile',
      type: 'checkbox',
      label: 'O Perfil é Público',
      defaultValue: false,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'study_plan_minutes',
          type: 'number',
          label: 'Minutos do Plano de Estudo',
          admin: {
            width: '50%',
          },
        },
        {
          name: 'study_plan_days',
          type: 'json',
          label: 'Dias do Plano de Estudo',
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'study_plan_included_extras',
      type: 'json',
      label: 'Extras Incluídos no Plano de Estudo',
    },
  ],
}

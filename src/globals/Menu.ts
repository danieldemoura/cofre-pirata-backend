import type { GlobalConfig } from 'payload'

export const Menu: GlobalConfig = {
  slug: 'menu',
  label: 'Menu',
  admin: {
    group: 'Configuração Global',
  },
  fields: [
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Logo',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'brand_name',
          type: 'text',
          label: 'Nome da Marca',
          admin: {
            width: '50%',
          },
        },
        {
          name: 'logo_link',
          type: 'text',
          label: 'Link da Logo',
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'items_menu',
      type: 'array',
      label: 'Itens do Menu',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'label',
              type: 'text',
              label: 'Rótulo',
              required: true,
              admin: {
                width: '50%',
              },
            },
            {
              name: 'url',
              type: 'text',
              label: 'URL',
              required: true,
              admin: {
                width: '50%',
                placeholder: 'nome-da-pagina',
                description: 'Tudo em minúsculo e sem acentos',
              },
            },
          ],
        },
      ],
    },
  ],
}

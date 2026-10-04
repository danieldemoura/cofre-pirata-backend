import type { GlobalConfig } from 'payload'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Rodapé',
  admin: {
    group: 'Configuração Global',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identidade do Site',
          fields: [
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              label: 'Logo',
            },
            {
              name: 'site_name',
              type: 'text',
              label: 'Nome do Site',
            },
            {
              name: 'description',
              type: 'textarea',
              label: 'Descrição',
            },
          ],
        },
        {
          label: 'Colunas do Rodapé',
          fields: [
            {
              name: 'columns',
              type: 'array',
              label: 'Colunas do Rodapé',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  label: 'Título da Coluna',
                  admin: {
                    description: 'Digite o nome da coluna',
                  },
                },
                {
                  name: 'links',
                  type: 'array',
                  label: 'Links',
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'label',
                          type: 'text',
                          label: 'Rótulo',
                          admin: {
                            width: '50%',
                          },
                        },
                        {
                          name: 'url',
                          type: 'text',
                          label: 'URL',
                          admin: {
                            width: '50%',
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

import type { GlobalConfig } from 'payload'

export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Página Inicial',
  admin: {
    group: 'Configuração Global',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Seção Hero',
          fields: [
            {
              name: 'hero_badge',
              type: 'text',
              label: 'Etiqueta',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'hero_course',
                  type: 'relationship',
                  relationTo: 'courses',
                  label: 'Nome do Curso',
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'hero_tag',
                  type: 'relationship',
                  relationTo: 'tags',
                  label: 'Categoria do Curso',
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'hero_btn_primary',
                  type: 'text',
                  label: 'Botão Primário',
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'hero_btn_primary_url',
                  type: 'text',
                  label: 'Slug Botão Primário',
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'hero_btn_secundary',
                  type: 'text',
                  label: 'Botão Secundário',
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'hero_btn_secundary_url',
                  type: 'text',
                  label: 'Slug Botão Secundário',
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Visão Geral do Catálogo',
          fields: [
            {
              name: 'catalog_list',
              type: 'relationship',
              relationTo: 'tags',
              hasMany: true,
              label: 'Lista de Categorias',
            },
            {
              name: 'catalog_categories',
              type: 'relationship',
              relationTo: 'tags',
              hasMany: true,
              label: 'Cards de Categoria',
            },
          ],
        },
        {
          label: 'Carrosséis',
          fields: [
            {
              name: 'carousels_list',
              type: 'relationship',
              relationTo: 'carousels',
              hasMany: true,
              label: 'Lista de Carrosséis',
            },
          ],
        },
      ],
    },
  ],
}

import type { CollectionConfig } from 'payload'

export const Lessons: CollectionConfig = {
  slug: 'lessons',
  labels: {
    singular: 'Aula',
    plural: 'Aulas',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'module', 'duration', 'lesson_instructor'],
    group: 'Cursos & Conteúdo',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Informação da Aula',
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Título',
              required: true,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'slug',
                  type: 'text',
                  label: 'Slug',
                  index: true,
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'duration',
                  type: 'text',
                  label: 'Duração',
                  admin: {
                    width: '50%',
                    placeholder: 'Ex: 24:30',
                    description: 'Digite a duração do vídeo, ex: 01:00:00',
                  },
                },
              ],
            },
            {
              name: 'thumbnail',
              type: 'upload',
              relationTo: 'media',
              label: 'Capa do vídeo',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'module',
                  type: 'relationship',
                  relationTo: 'modules',
                  label: 'Módulo',
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'lesson_instructor',
                  type: 'relationship',
                  relationTo: 'instructors',
                  label: 'Instrutor',
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'description',
              type: 'richText',
              label: 'Descrição',
            },
          ],
        },
        {
          label: 'Players de Vídeo',
          fields: [
            {
              name: 'players',
              type: 'relationship',
              relationTo: 'video_players',
              hasMany: true,
              label: 'Players de Vídeo',
            },
          ],
        },
        {
          label: 'Materiais de Download',
          fields: [
            {
              name: 'file',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              label: 'Arquivos',
              admin: {
                description: 'Os arquivos adicionados aqui, ficaram salvos no seu próprio servidor',
              },
            },
            {
              name: 'resource',
              type: 'array',
              label: 'Recursos',
              admin: {
                description: 'Adicione aqui os links para os arquivos que estão em outros servidores',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'nome_do_recurso',
                      type: 'text',
                      label: 'Nome do Recurso',
                      admin: {
                        width: '50%',
                      },
                    },
                    {
                      name: 'link',
                      type: 'text',
                      label: 'Link',
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
}

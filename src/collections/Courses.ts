import type { CollectionConfig } from 'payload'

export const Courses: CollectionConfig = {
  slug: 'courses',
  labels: {
    singular: 'Curso',
    plural: 'Cursos',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'release_year', 'updatedAt'],
    group: 'Cursos & Conteúdo',
  },
  fields: [
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      defaultValue: 'público',
      options: [
        { label: 'Público', value: 'público' },
        { label: 'Não listado', value: 'não_listado' },
        { label: 'Privado', value: 'privado' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Informações do Curso',
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Nome do Curso',
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
                  name: 'release_year',
                  type: 'text',
                  label: 'Ano de Lançamento do Curso',
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'thumbnail',
              type: 'upload',
              relationTo: 'media',
              label: 'Capa do Curso',
              filterOptions: {
                'folder.name': {
                  equals: 'Capas dos Cursos',
                },
              },
              admin: {
                description:
                  'Não existe limite de imagem para você enviar, mas recomendamos que envie no máximo arquivos de 2MB',
              },
            },
            {
              name: 'description',
              type: 'richText',
              label: 'Descrição',
            },
          ],
        },
        {
          label: 'Categorias',
          fields: [
            {
              name: 'tags',
              type: 'relationship',
              relationTo: 'tags',
              hasMany: true,
              label: 'Categorias',
            },
          ],
        },
        {
          label: 'Instrutores',
          fields: [
            {
              name: 'instructors',
              type: 'relationship',
              relationTo: 'instructors',
              hasMany: true,
              label: 'Instrutores',
            },
          ],
        },
        {
          label: 'Módulos e Mini Cursos',
          fields: [
            {
              name: 'modules',
              type: 'relationship',
              relationTo: 'modules',
              hasMany: true,
              label: 'Módulos',
            },
            {
              name: 'parent_course_id',
              type: 'relationship',
              relationTo: 'courses',
              hasMany: false,
              label: 'Curso Pai',
            },
            {
              name: 'sub_courses',
              type: 'relationship',
              relationTo: 'courses',
              hasMany: true,
              label: 'Lista de Cursos',
              admin: {
                description: 'Cursos que pertencem ao curso pai, que é o curso principal.',
              },
            },
          ],
        },
        {
          label: 'Arquivos do Curso',
          fields: [
            {
              name: 'files',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              label: 'Arquivos',
              admin: {
                description:
                  'Adicione aqui os arquivos de Download, referente ao curso como um todo, e não a aulas especificas',
              },
            },
            {
              name: 'resources',
              type: 'array',
              label: 'Recursos',
              admin: {
                description:
                  'Adicione aqui, os links para os arquivos do curso como um todo que estão em outros servidores',
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
}

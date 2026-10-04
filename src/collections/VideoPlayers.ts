import type { CollectionConfig } from 'payload'

export const VideoPlayers: CollectionConfig = {
  slug: 'video_players',
  labels: {
    singular: 'Player de Vídeo',
    plural: 'Players de Vídeo',
  },
  admin: {
    useAsTitle: 'players',
    defaultColumns: ['players', 'url', 'lesson', 'sort'],
    group: 'Cursos & Conteúdo',
  },
  fields: [
    {
      name: 'players',
      type: 'select',
      label: 'Player de Vídeo',
      options: [
        { label: 'YouTube', value: 'YouTube' },
        { label: 'Rutube', value: 'Rutube' },
        { label: 'Dzen', value: 'Dzen' },
        { label: 'VKVideo', value: 'VKVideo' },
        { label: 'Dailymotion', value: 'Dailymotion' },
        { label: 'Odysee', value: 'Odysee' },
        { label: 'Rumble', value: 'Rumble' },
        { label: 'OK.ru', value: 'OK.ru' },
        { label: 'Byse.sx', value: 'Byse' },
        { label: 'Abyss', value: 'Abyss' },
      ],
    },
    {
      name: 'url',
      type: 'text',
      label: 'URL do Vídeo',
    },
    {
      name: 'lesson',
      type: 'relationship',
      relationTo: 'lessons',
      label: 'Aula',
    },
    {
      name: 'sort',
      type: 'number',
      label: 'Ordem',
    },
  ],
}

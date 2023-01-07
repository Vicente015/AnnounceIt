import { Collection } from '@discordjs/collection'

export interface Image {
  type: 'IMAGE' | 'THUMBNAIL'
  url: string
}

export const temporaryImgStorage: Collection<string, Image[]> = new Collection()

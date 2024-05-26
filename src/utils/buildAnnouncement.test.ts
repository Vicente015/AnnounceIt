import { APIEmbed } from 'discord.js'
import { ObjectId } from 'mongoose'
import { randomUUID } from 'node:crypto'
import { expect, it } from 'vitest'
import { AnnouncementType } from '../schemas/Announcement.js'
import { buildAnnouncementEmbed } from './buildAnnouncement.js'
import convertHexStringToInt from './convertHexStringToInt.js'

const announcement: Required<AnnouncementType> = {
  _id: randomUUID().toString() as unknown as ObjectId,
  color: '#00000',
  description: 'description',
  footer: 'footer',
  guildId: '12'.repeat(12),
  image: 'https://projects.vicente015.dev/assets/logo-announceit.svg',
  name: 'test_announcement',
  published: false,
  thumbnail: 'https://projects.vicente015.dev/assets/logo-announceit.svg',
  title: 'title',
  // @ts-expect-error aaa
  translations: undefined,
  url: 'https://vicente015.dev/'
}

it('should return correct embed', () => {
  const expectedEmbed: APIEmbed = {
    color: convertHexStringToInt(announcement.color),
    description: announcement.description,
    footer: {
      icon_url: undefined,
      text: announcement.footer
    },
    image: {
      url: announcement.image
    },
    thumbnail: {
      url: announcement.thumbnail
    },
    title: announcement.title,
    url: announcement.url
  }

  expect(
    buildAnnouncementEmbed(announcement).data
  )
    .toEqual(expectedEmbed)
})

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SapphireClient } from '@sapphire/framework'
import mongoose from 'mongoose'
import { beforeEach, describe, expect, it } from 'vitest'
import { Announcement } from '../schemas/Announcement.js'
import { mockGuild } from '../tests/guild-mock.js'
import { setupBot } from '../tests/sapphire-mock.js'
import pruneOldDataJob from './pruneOldData.js'

let client: SapphireClient

beforeEach(async () => {
  // @ts-expect-error tell mongo to reload all the models
  mongoose.models = {}
  client = await setupBot()
})

describe('pruneOldData', () => {
  it('should NOT prune announcements if guild exists', async () => {
    const guild = mockGuild(client)
    const announcement = new Announcement({
      description: 'fake announcement',
      guildId: guild.id,
      name: 'announcement1',
      published: false,
      translations: []
    })
    await announcement.save()

    await pruneOldDataJob(client)

    expect(await Announcement.findById(announcement.id)).not.toBeNull()
  })
  it('should prune announcements if guild doesn\'t exists', async () => {
    const guild = mockGuild(client)
    const announcement = new Announcement({
      description: 'fake announcement',
      guildId: guild.id,
      name: 'announcement1',
      published: false,
      translations: []
    })
    await announcement.save()
    client.guilds.cache.delete(guild.id)

    await pruneOldDataJob(client)

    expect(await Announcement.findById(announcement.id)).toBeNull()
  })
})

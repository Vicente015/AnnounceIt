/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SapphireClient } from '@sapphire/framework'
import dayjs from 'dayjs'
import mongoose from 'mongoose'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Announcement } from '../schemas/Announcement.js'
import { ScheduledPost } from '../schemas/ScheduledPost.js'
import { mockTextChannel } from '../tests/channel-mock.js'
import { mockGuild } from '../tests/guild-mock.js'
import { setupBot } from '../tests/sapphire-mock.js'
import postScheduledJob from './postScheduled.js'

let client: SapphireClient

beforeEach(async () => {
  // @ts-expect-error tell mongo to reload all the models
  mongoose.models = {}
  client = await setupBot()
})

describe('postScheduled', () => {
  it('should not publish announcement if the date is later', async () => {
    const guild = mockGuild(client)
    const channel = mockTextChannel(client, guild)
    const announcement = new Announcement({
      description: 'fake announcement',
      guildId: guild.id,
      name: 'announcement1',
      published: false,
      translations: []
    })
    await announcement.save()

    const oneHourLater = dayjs().utc().add(1, 'h')
    const scheduledPost = new ScheduledPost({
      announcementId: announcement.id as string,
      at: oneHourLater.toISOString(),
      channelId: channel.id
    })
    await scheduledPost.save()
    await postScheduledJob(client)

    const updatedAnnouncement = await Announcement.findById(announcement.id)
    expect(updatedAnnouncement?.published).toBe(false)
  })

  it('should log error if the announcement is deleted', async () => {
    const guild = mockGuild(client)
    const channel = mockTextChannel(client, guild)
    const announcement = new Announcement({
      description: 'fake announcement',
      guildId: guild.id,
      name: 'announcement1',
      published: false,
      translations: []
    })

    const oneHourBefore = dayjs().utc().subtract(1, 'h')
    const scheduledPost = new ScheduledPost({
      announcementId: announcement.id as string,
      at: oneHourBefore.toISOString(),
      channelId: channel.id
    })
    await scheduledPost.save()

    const loggerSpy = vi.spyOn(client.logger, 'error')
    await postScheduledJob(client)
    expect(loggerSpy).toHaveBeenCalled()
  })

  it('should log error if channel doesn\'t exist', async () => {
    const guild = mockGuild(client)
    const channel = mockTextChannel(client, guild)
    const announcement = new Announcement({
      description: 'fake announcement',
      guildId: guild.id,
      name: 'announcement1',
      published: false,
      translations: []
    })

    const oneHourBefore = dayjs().utc().subtract(1, 'h')
    const scheduledPost = new ScheduledPost({
      announcementId: announcement.id as string,
      at: oneHourBefore.toISOString(),
      channelId: channel.id
    })
    await scheduledPost.save()
    client.channels.cache.delete(channel.id)

    const loggerSpy = vi.spyOn(client.logger, 'error')
    await postScheduledJob(client)
    expect(loggerSpy).toHaveBeenCalled()
  })

  it('should change the "published" property in the announcement document', async () => {
    const guild = mockGuild(client)
    const channel = mockTextChannel(client, guild)
    const announcement = new Announcement({
      description: 'fake announcement',
      guildId: guild.id,
      name: 'announcement1',
      published: false,
      translations: []
    })
    await announcement.save()

    const oneHourBefore = dayjs().utc().subtract(1, 'h')
    const scheduledPost = new ScheduledPost({
      announcementId: announcement.id as string,
      at: oneHourBefore.toISOString(),
      channelId: channel.id
    })
    await scheduledPost.save()
    await postScheduledJob(client)

    const updatedAnnouncement = await Announcement.findById(announcement.id)
    expect(updatedAnnouncement?.published).toBe(true)
  })

  it('should publish the announcement message in the channel', async () => {
    const guild = mockGuild(client)
    const channel = mockTextChannel(client, guild)
    const announcement = new Announcement({
      description: 'fake announcement',
      guildId: guild.id,
      name: 'announcement1',
      published: false,
      translations: []
    })
    await announcement.save()

    const oneHourBefore = dayjs().utc().subtract(1, 'h')
    const scheduledPost = new ScheduledPost({
      announcementId: announcement.id as string,
      at: oneHourBefore.toISOString(),
      channelId: channel.id
    })
    await scheduledPost.save()
    await postScheduledJob(client)

    const lastMessage = (await channel.messages.fetch()).last()
    expect(lastMessage?.author.id).toBe(client.user!.id)
    expect(lastMessage?.embeds[0].description).toBe(announcement.description)
  })

  it('should delete the scheduled post after posting', async () => {
    const guild = mockGuild(client)
    const channel = mockTextChannel(client, guild)
    const announcement = new Announcement({
      description: 'fake announcement',
      guildId: guild.id,
      name: 'announcement1',
      published: false,
      translations: []
    })
    await announcement.save()

    const oneHourBefore = dayjs().utc().subtract(1, 'h')
    const scheduledPost = new ScheduledPost({
      announcementId: announcement.id as string,
      at: oneHourBefore.toISOString(),
      channelId: channel.id
    })
    await scheduledPost.save()
    await postScheduledJob(client)

    expect(await ScheduledPost.findById(scheduledPost.id)).toBeNull()
  })
})

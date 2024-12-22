/* eslint-disable @typescript-eslint/no-non-null-assertion */
import '../environment.js'
import { Events, SapphireClient } from '@sapphire/framework'
import { ComponentType } from 'discord.js'
import mongoose from 'mongoose'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Announcement } from '../schemas/Announcement.js'
import { mockTextChannel } from '../tests/channel-mock.js'
import { mockGuild } from '../tests/guild-mock.js'
import { emitEvent } from '../tests/helpers.js'
import { mockModalSubmitInteraction } from '../tests/interaction-mock.js'
import { setupBot } from '../tests/sapphire-mock.js'
import { mockGuildMember } from '../tests/user-mock.js'
import { temporaryImgStorage } from '../utils/Globals.js'
import { randomSnowflake } from '../utils/Snowflake.js'

let client: SapphireClient

beforeEach(async () => {
  // @ts-expect-error tell mongo to reload all the models
  mongoose.models = {}
  client = await setupBot()
  // todo: create test ephemeral memory mongo server instead of using another db
  await mongoose.connect(process.env.MONGO_URI_TESTING)
  await Announcement.deleteMany({})
})

describe('modalAddAnnouncement', () => {
  it('should reply to the interaction', async () => {
    const pastInteractionId = randomSnowflake().toString()
    const announcementName = 'test1'
    const guild = mockGuild(client)
    const channel = mockTextChannel(client, guild)
    const member = mockGuildMember({ client, guild })
    const interaction = mockModalSubmitInteraction({
      channel,
      client,
      components: [
        { components: [{ custom_id: 'title', type: ComponentType.TextInput, value: '' }], type: ComponentType.ActionRow },
        { components: [{ custom_id: 'description', type: ComponentType.TextInput, value: 'example' }], type: ComponentType.ActionRow },
        { components: [{ custom_id: 'footer', type: ComponentType.TextInput, value: '' }], type: ComponentType.ActionRow },
        { components: [{ custom_id: 'url', type: ComponentType.TextInput, value: '' }], type: ComponentType.ActionRow },
        { components: [{ custom_id: 'color', type: ComponentType.TextInput, value: '' }], type: ComponentType.ActionRow }
      ],
      id: `addAnnouncement:${pastInteractionId}:${Date.now()}:${announcementName}`,
      member
    })

    const replyFunction = vi.spyOn(interaction, 'reply')
    await emitEvent(client, Events.InteractionCreate, interaction)

    expect(replyFunction).toHaveBeenCalled()
    expect(interaction.replied).toBe(true)
  })

  it('should create the announcement with the provided options', async () => {
    const pastInteractionId = randomSnowflake().toString()
    const announcementName = 'test1'
    const description = 'example'
    const guild = mockGuild(client)
    const channel = mockTextChannel(client, guild)
    const member = mockGuildMember({ client, guild })
    const interaction = mockModalSubmitInteraction({
      channel,
      client,
      components: [
        { components: [{ custom_id: 'title', type: ComponentType.TextInput, value: '' }], type: ComponentType.ActionRow },
        { components: [{ custom_id: 'description', type: ComponentType.TextInput, value: description }], type: ComponentType.ActionRow },
        { components: [{ custom_id: 'footer', type: ComponentType.TextInput, value: '' }], type: ComponentType.ActionRow },
        { components: [{ custom_id: 'url', type: ComponentType.TextInput, value: '' }], type: ComponentType.ActionRow },
        { components: [{ custom_id: 'color', type: ComponentType.TextInput, value: '' }], type: ComponentType.ActionRow }
      ],
      id: `addAnnouncement:${pastInteractionId}:${Date.now()}:${announcementName}`,
      member
    })

    await emitEvent(client, Events.InteractionCreate, interaction)

    const newAnnouncement = await Announcement.findOne({ guildId: guild.id, name: announcementName })
    expect(newAnnouncement?.description).toBe(description)
  })

  it.skip('should delete the images from the tmp storage', async () => {
    const pastInteractionId = randomSnowflake().toString()
    const announcementName = 'test1'
    const guild = mockGuild(client)
    const channel = mockTextChannel(client, guild)
    const member = mockGuildMember({ client, guild })
    const interaction = mockModalSubmitInteraction({
      channel,
      client,
      components: [
        { components: [{ custom_id: 'title', type: ComponentType.TextInput, value: '' }], type: ComponentType.ActionRow },
        { components: [{ custom_id: 'description', type: ComponentType.TextInput, value: 'example' }], type: ComponentType.ActionRow },
        { components: [{ custom_id: 'footer', type: ComponentType.TextInput, value: '' }], type: ComponentType.ActionRow },
        { components: [{ custom_id: 'url', type: ComponentType.TextInput, value: '' }], type: ComponentType.ActionRow },
        { components: [{ custom_id: 'color', type: ComponentType.TextInput, value: '' }], type: ComponentType.ActionRow }
      ],
      id: `addAnnouncement:${pastInteractionId}:${Date.now()}:${announcementName}`,
      member
    })

    temporaryImgStorage.set(pastInteractionId, [{ type: 'IMAGE', url: 'https//website.com/image.png' }])
    expect(temporaryImgStorage.get(pastInteractionId)).toBeTruthy()

    await emitEvent(client, Events.InteractionCreate, interaction)

    expect(temporaryImgStorage.get(pastInteractionId)).toBeUndefined()
  })
})

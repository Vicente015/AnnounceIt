/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Events, SapphireClient } from '@sapphire/framework'
import { APIApplicationCommandInteractionDataOption, ApplicationCommandOptionType, InteractionReplyOptions, PermissionsBitField } from 'discord.js'
import mongoose from 'mongoose'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Announcement } from '../../schemas/Announcement.js'
import { mockTextChannel } from '../../tests/channel-mock.js'
import { mockGuild } from '../../tests/guild-mock.js'
import { emitEvent } from '../../tests/helpers.js'
import { mockChatInputCommandInteraction } from '../../tests/interaction-mock.js'
import { setupBot } from '../../tests/sapphire-mock.js'
import { mockGuildMember } from '../../tests/user-mock.js'
import { temporaryImgStorage } from '../../utils/Globals.js'
import { randomSnowflake } from '../../utils/Snowflake.js'
import { addTranslation } from './_addTranslation.js'

let client: SapphireClient

beforeEach(async () => {
  // @ts-expect-error tell mongo to reload all the models
  mongoose.models = {}
  client = await setupBot()
  // todo: create test ephemeral memory mongo server instead of using another db
  await mongoose.connect(process.env.MONGO_URI_TESTING)
  await Announcement.deleteMany({})
})

describe('announcement addTranslation', () => {
  it('should answer with error when an invalid announcementId is given', async () => {
    const guild = mockGuild(client)
    const channel = mockTextChannel(client, guild)
    const member = mockGuildMember({
      client,
      guild,
      permissions: [PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ManageGuild]
    })
    const options: APIApplicationCommandInteractionDataOption[] = [
      {
        name: 'add-translation',
        options: [
          { name: 'name', type: ApplicationCommandOptionType.String, value: 'kfhdfdhfdh' },
          { name: 'lang', type: ApplicationCommandOptionType.String, value: 'en' }
        ],
        type: ApplicationCommandOptionType.Subcommand
      }
    ]
    const interaction = mockChatInputCommandInteraction({
      channel,
      client,
      id: randomSnowflake().toString(),
      member: member,
      name: 'announcements',
      options
    })

    const replyFunction = vi.spyOn(interaction, 'reply')
    await emitEvent(client, Events.InteractionCreate, interaction)

    expect(replyFunction).toHaveBeenCalled()
    const lastReplyCall = replyFunction.mock.lastCall?.at(0) as InteractionReplyOptions
    expect(lastReplyCall.ephemeral).toBe(true)
    expect(interaction.replied).toBe(true)
  })

  it('should answer with error when a translation already exists', async () => {
    const guild = mockGuild(client)
    const channel = mockTextChannel(client, guild)
    const member = mockGuildMember({
      client,
      guild,
      permissions: [PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ManageGuild]
    })
    const announcement = new Announcement({
      description: 'example',
      guildId: guild.id,
      name: 'test1'
    })
    announcement.translations.push({
      description: 'example',
      lang: 'en'
    })
    await announcement.save()
    const options: APIApplicationCommandInteractionDataOption[] = [
      {
        name: 'add-translation',
        options: [
          { name: 'name', type: ApplicationCommandOptionType.String, value: announcement.id as string },
          { name: 'lang', type: ApplicationCommandOptionType.String, value: 'en' }
        ],
        type: ApplicationCommandOptionType.Subcommand
      }
    ]
    const interaction = mockChatInputCommandInteraction({
      channel,
      client,
      id: randomSnowflake().toString(),
      member: member,
      name: 'announcements',
      options
    })

    const replyFunction = vi.spyOn(interaction, 'reply')
    await addTranslation(interaction)

    expect(replyFunction).toHaveBeenCalled()
    const lastReplyCall = replyFunction.mock.lastCall?.at(0) as InteractionReplyOptions
    expect(interaction.replied).toBe(true)
    expect(lastReplyCall.ephemeral).toBe(true)
  })

  it('should reply the interaction', async () => {
    const guild = mockGuild(client)
    const announcement = new Announcement({
      description: 'example',
      guildId: guild.id,
      name: 'test1'
    })
    await announcement.save()
    const options: APIApplicationCommandInteractionDataOption[] = [
      {
        name: 'add-translation',
        options: [
          { name: 'name', type: ApplicationCommandOptionType.String, value: announcement.id as string },
          { name: 'lang', type: ApplicationCommandOptionType.String, value: 'en' }
        ],
        type: ApplicationCommandOptionType.Subcommand
      }
    ]
    const interaction = mockChatInputCommandInteraction({
      client,
      id: randomSnowflake().toString(),
      name: 'announcements',
      options
    })

    // todo: should work with emit event
    await addTranslation(interaction)

    expect(interaction.replied).toBe(true)
  })

  it('should add the images to the tmp storage', async () => {
    const imageURL = 'https://website.com/image.png'
    const guild = mockGuild(client)
    const announcement = new Announcement({
      description: 'example',
      guildId: guild.id,
      name: 'test1'
    })
    await announcement.save()
    const options: APIApplicationCommandInteractionDataOption[] = [
      {
        name: 'add-translation',
        options: [
          { name: 'name', type: ApplicationCommandOptionType.String, value: announcement.id as string },
          { name: 'lang', type: ApplicationCommandOptionType.String, value: 'en' },
          { name: 'image', type: ApplicationCommandOptionType.String, value: imageURL }
        ],
        type: ApplicationCommandOptionType.Subcommand
      }
    ]
    const interaction = mockChatInputCommandInteraction({
      client,
      id: randomSnowflake().toString(),
      name: 'announcements',
      options
    })

    await addTranslation(interaction)

    expect(temporaryImgStorage.get(interaction.id)?.find((img) => img.type === 'IMAGE')?.url).toBe(imageURL)
  })
})

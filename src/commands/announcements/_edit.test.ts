import { Events, SapphireClient } from '@sapphire/framework'
import { APIApplicationCommandInteractionDataOption, ApplicationCommandOptionType, InteractionReplyOptions, ModalComponentData, PermissionsBitField } from 'discord.js'
import mongoose from 'mongoose'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Announcement } from '../../schemas/Announcement.js'
import { mockTextChannel } from '../../tests/channel-mock.js'
import { mockGuild } from '../../tests/guild-mock.js'
import { emitEvent } from '../../tests/helpers.js'
import { mockChatInputCommandInteraction } from '../../tests/interaction-mock.js'
import { setupBot } from '../../tests/sapphire-mock.js'
import { mockGuildMember } from '../../tests/user-mock.js'
import { randomSnowflake } from '../../utils/Snowflake.js'

let client: SapphireClient

beforeEach(async () => {
  // @ts-expect-error tell mongo to reload all the models
  mongoose.models = {}
  client = await setupBot()
  // todo: create test ephemeral memory mongo server instead of using another db
  await mongoose.connect(process.env.MONGO_URI_TESTING)
  await Announcement.deleteMany({})
})

describe('announcement edit', () => {
  it('should reply with error if announcement is not valid', async () => {
    const guild = mockGuild(client)
    const channel = mockTextChannel(client, guild)
    const member = mockGuildMember({
      client,
      guild,
      permissions: [PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ManageGuild]
    })
    const options: APIApplicationCommandInteractionDataOption[] = [
      {
        name: 'edit',
        options: [
          { name: 'name', type: ApplicationCommandOptionType.String, value: 'kfhdfdhfdh' }
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

  it('should reply the interaction', async () => {
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
    await announcement.save()
    const options: APIApplicationCommandInteractionDataOption[] = [
      {
        name: 'edit',
        options: [
          { name: 'name', type: ApplicationCommandOptionType.String, value: announcement.id as string }
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

    await emitEvent(client, Events.InteractionCreate, interaction)

    expect(interaction.replied).toBe(true)
  })

  it('should reply the interaction with modal values from the announcement', async () => {
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
    await announcement.save()
    const options: APIApplicationCommandInteractionDataOption[] = [
      {
        name: 'edit',
        options: [
          { name: 'name', type: ApplicationCommandOptionType.String, value: announcement.id as string }
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

    const showModalSpy = vi.spyOn(interaction, 'showModal')
    await emitEvent(client, Events.InteractionCreate, interaction)

    expect(showModalSpy).toHaveBeenCalled()
    expect(interaction.replied).toBe(true)
    const lastCall = showModalSpy.mock.lastCall?.at(0) as ModalComponentData
    // @ts-expect-error wrong types
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const modalDescriptionValue = lastCall.components.at(1)?.components?.at(0).data.value
    expect(modalDescriptionValue).toBe(announcement.description)
  })
})

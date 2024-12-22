/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Events, SapphireClient } from '@sapphire/framework'
import { APIApplicationCommandInteractionDataOption, ApplicationCommandOptionType, PermissionsBitField } from 'discord.js'
import { beforeEach, describe, expect, it } from 'vitest'
import { mockTextChannel } from '../../tests/channel-mock.js'
import { mockGuild } from '../../tests/guild-mock.js'
import { emitEvent } from '../../tests/helpers.js'
import { mockChatInputCommandInteraction } from '../../tests/interaction-mock.js'
import { setupBot } from '../../tests/sapphire-mock.js'
import { mockGuildMember } from '../../tests/user-mock.js'
import { temporaryImgStorage } from '../../utils/Globals.js'
import { randomSnowflake } from '../../utils/Snowflake.js'
import { add } from './_add.js'

let client: SapphireClient

beforeEach(async () => {
  client = await setupBot()
})

describe('announcement add', () => {
  it('should reply the interaction', async () => {
    const options: APIApplicationCommandInteractionDataOption[] = [
      {
        name: 'add',
        options: [
          { name: 'name', type: ApplicationCommandOptionType.String, value: 'test1' }
        ],
        type: ApplicationCommandOptionType.Subcommand
      }
    ]
    const guild = mockGuild(client)
    const channel = mockTextChannel(client, guild)
    const member = mockGuildMember({
      client,
      guild,
      permissions: [PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ManageGuild]
    })
    const interaction = mockChatInputCommandInteraction({
      channel,
      client,
      id: randomSnowflake().toString(),
      member: member,
      name: 'announcements',
      options
    })

    await add(interaction)

    expect(interaction.replied).toBe(true)
  })

  it('should add the images to the tmp storage', async () => {
    const imageURL = 'https://website.com/image.png'
    const options: APIApplicationCommandInteractionDataOption[] = [
      {
        name: 'add',
        options: [
          { name: 'name', type: ApplicationCommandOptionType.String, value: 'test1' },
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

    await add(interaction)

    expect(temporaryImgStorage.get(interaction.id)?.find((img) => img.type === 'IMAGE')?.url).toBe(imageURL)
  })
})

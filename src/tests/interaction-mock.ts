import {
  type APIApplicationCommandAutocompleteInteraction,
  APIApplicationCommandInteractionDataOption,
  type APIBaseInteraction,
  type APIChatInputApplicationCommandInteraction,
  APIMessageButtonInteractionData,
  APIMessageComponentInteraction,
  type APIMessageStringSelectInteractionData,
  ApplicationCommandType,
  AutocompleteInteraction,
  ButtonInteraction,
  CacheType,
  type Channel,
  ChatInputCommandInteraction,
  Client,
  ComponentType,
  DiscordjsError,
  DiscordjsErrorCodes,
  GuildMember,
  GuildMemberFlags,
  type GuildTextBasedChannel,
  type Interaction,
  InteractionResponse,
  InteractionType,
  type InteractionUpdateOptions,
  Locale,
  Message,
  MessagePayload,
  PermissionsBitField,
  type Snowflake,
  StringSelectMenuInteraction,
  User
} from 'discord.js'
import { randomSnowflake } from '../utils/Snowflake.js'
import { mockTextChannel } from './channel-mock.js'
import { mockMessage } from './message-mock.js'
import { messageToAPIData } from './to-api-data.js'
import { mockGuildMember } from './user-mock.js'

function setupMockedInteractionAPIData<Type extends InteractionType> ({
  applicationId = undefined,
  caller,
  channel,
  message = undefined,
  override = {},
  type
}: {
  applicationId?: string
  channel: Channel
  message?: Message
  caller: User
  type: Type
  override?: Partial<APIBaseInteraction<Type, object>>
}): Omit<
  Required<APIBaseInteraction<Type, object>>,
  'guild_id' | 'message' | 'member'
> &
Pick<APIBaseInteraction<Type, object>, 'guild_id' | 'message' | 'member'> {
  const guild = channel.isDMBased() ? undefined : channel.guild
  let appPermissions = null
  let memberPermissions = null
  if (guild) {
    appPermissions = guild.members.cache
      .get(channel.client.user.id)!
      .permissions.bitfield.toString()
    memberPermissions = guild.members.cache
      .get(caller.id)!
      .permissions?.bitfield.toString()
  }
  return {
    app_permissions: appPermissions ?? PermissionsBitField.Default.toString(),
    application_id: applicationId ?? randomSnowflake().toString(),
    channel: {
      id: channel.id,
      type: channel.type
    },
    channel_id: channel.id,
    data: {}, entitlements: [],
    guild_id: channel.isDMBased() ? undefined : channel.guild.id,
    guild_locale: 'en-US',
    id: randomSnowflake().toString(),
    locale: 'en-US',
    member: guild
      ? {
          avatar: caller.avatar,
          deaf: false,
          flags: GuildMemberFlags.CompletedOnboarding,
          joined_at: guild.members.cache
            .get(caller.id)!
            .joinedAt!.toISOString(),
          mute: false,
          permissions:
            memberPermissions ?? PermissionsBitField.Default.toString(),
          roles: guild.members.cache
            .get(caller.id)!
            .roles.cache.map((r) => r.id),
          user: {
            avatar: caller.avatar,
            discriminator: caller.discriminator,
            global_name: caller.username,
            id: caller.id,
            username: caller.username
          }
        }
      : undefined,
    message: message ? messageToAPIData(message) : undefined,
    token: randomSnowflake().toString(),
    type,
    user: {
      avatar: caller.avatar,
      discriminator: caller.discriminator,
      global_name: caller.username,
      id: caller.id,
      username: caller.username
    },
    // TODO: Use a real token
    version: 1,
    ...override
  }
}

function applyInteractionResponseHandlers (interaction: Interaction) {
  const client = interaction.client
  if ('update' in interaction) {
    // @ts-expect-error dsdssds
    interaction.update = async (
      options:
        | (InteractionUpdateOptions & { fetchReply: true })
        | (string | MessagePayload | InteractionUpdateOptions)
    ) => {
      interaction.deferred = false
      interaction.replied = true
      await interaction.message.edit(options)
      if (options instanceof Object && 'fetchReply' in options) {
        return interaction.message
      }
      return mockInteractionResponse({
        id: interaction.id,
        interaction: interaction
      })
    }
  }
  if ('deferUpdate' in interaction) {
    // @ts-expect-error dsdsds
    interaction.deferUpdate = (options) => {
      interaction.deferred = true
      if (options?.fetchReply) {
        return Promise.resolve(interaction.message)
      }
      return Promise.resolve(
        mockInteractionResponse({
          id: interaction.id,
          interaction
        })
      )
    }
  }

  if ('deferReply' in interaction) {
    // @ts-expect-error dsdsds
    interaction.deferReply = (options) => {
      interaction.deferred = true
      const message = mockMessage({
        // TODO: probably error here?
        author: interaction.client.user,
        channel: interaction.channel ?? undefined, client,
        override: {
          id: interaction.id.toString()
        }
      })
      if (options?.fetchReply) {
        return Promise.resolve(message)
      }
      return Promise.resolve(
        mockInteractionResponse({
          id: interaction.id,
          interaction
        })
      )
    }
  }

  if ('respond' in interaction) {
    // @ts-expect-error dsdsds
    interaction.respond = () => {
      interaction.responded = true
    }
  }

  if ('showModal' in interaction) {
    interaction.showModal = async () => {
      if (interaction.deferred || interaction.replied) throw new DiscordjsError(DiscordjsErrorCodes.InteractionAlreadyReplied)
      interaction.replied = true
    }
  }

  if ('reply' in interaction) {
    // @ts-expect-error dsdsds
    interaction.reply = (options) => {
      const message = mockMessage({
        // TODO: probably error here?
        author: interaction.client.user,
        channel: interaction.channel ?? undefined, client,
        opts: options,
        override: {
          id: interaction.id.toString()
        }
      })
      interaction.deferred = false
      interaction.replied = true

      if (options instanceof Object && 'fetchReply' in options) {
        return Promise.resolve(message)
      }

      return Promise.resolve(
        mockInteractionResponse({
          id: interaction.id,
          interaction: interaction
        })
      )
    }
  }

  if ('fetchReply' in interaction) {
    interaction.fetchReply = () => {
      if (
        interaction.isChatInputCommand()
        || interaction.isContextMenuCommand()
      ) {
        const message = interaction.channel?.messages.cache.get(interaction.id)
        if (!message) throw new Error('Message not found')
        return Promise.resolve(message)
      }
      else {
        if (!interaction.message) throw new Error('No message to edit')
        return Promise.resolve(interaction.message)
      }
    }
  }

  if ('editReply' in interaction) {
    interaction.editReply = async (options) => {
      interaction.deferred = false
      interaction.replied = true
      if (
        interaction.isChatInputCommand()
        || interaction.isContextMenuCommand()
      ) {
        const message = await interaction.fetchReply()
        return message.edit(options)
      }
      else {
        if (!interaction.message) throw new Error('No message to edit')
        return interaction.message?.edit(options)
      }
    }
  }
}

export function mockChatInputCommandInteraction ({
  channel,
  client,
  id,
  member,
  name,
  options = []
}: {
  client: Client
  name: string
  id: string
  channel?: GuildTextBasedChannel
  member?: GuildMember
  options?: APIApplicationCommandInteractionDataOption[]
}): ChatInputCommandInteraction {
  if (!channel) {
    channel = mockTextChannel(client)
  }
  if (!member) {
    member = mockGuildMember({ client, guild: channel.guild })
  }
  const rawData: APIChatInputApplicationCommandInteraction = {
    ...setupMockedInteractionAPIData({
      applicationId: id,
      caller: member.user,
      channel,
      type: InteractionType.ApplicationCommand
    }),
    data: {
      guild_id: channel.guild.id,
      id,
      name,
      options,
      type: ApplicationCommandType.ChatInput
    }
  }
  // TODO: Look into adding command to client cache
  const command = Reflect.construct(ChatInputCommandInteraction, [
    client,
    rawData
  ]) as ChatInputCommandInteraction
  applyInteractionResponseHandlers(command)
  return command
}

export function mockAutocompleteInteraction ({
  channel,
  client,
  id,
  locale = Locale.EnglishUS,
  member,
  name,
  options
}: {
  client: Client
  name: string
  id: string
  channel?: GuildTextBasedChannel
  member?: GuildMember
  locale?: Locale
  options: APIApplicationCommandInteractionDataOption[]
}): AutocompleteInteraction {
  if (!channel) {
    channel = mockTextChannel(client)
  }
  if (!member) {
    member = mockGuildMember({ client, guild: channel.guild })
  }
  const rawData: APIApplicationCommandAutocompleteInteraction = {
    ...setupMockedInteractionAPIData({
      applicationId: id,
      caller: member.user,
      channel,
      type: InteractionType.ApplicationCommandAutocomplete
    }),
    data: {
      guild_id: channel.guild.id,
      id,
      name,
      options,
      type: ApplicationCommandType.ChatInput
    },
    locale: locale
  }
  // TODO: Look into adding command to client cache
  const command = Reflect.construct(AutocompleteInteraction, [
    client,
    rawData
  ]) as AutocompleteInteraction
  applyInteractionResponseHandlers(command)
  return command
}

export function mockInteractionResponse ({
  id,
  interaction
}: {
  interaction: Interaction
  id: Snowflake
}): InteractionResponse {
  return Reflect.construct(InteractionResponse, [
    interaction,
    id
  ]) as InteractionResponse
}

export function mockButtonInteraction ({
  caller,
  message,
  override = {}
}: {
  caller: User
  message: Message
  override?: Partial<
    Omit<
      APIMessageButtonInteractionData & APIMessageComponentInteraction,
      'component_type'
    >
  >
}) {
  const client = message.client
  const customId = override.custom_id ?? randomSnowflake().toString()
  const rawData = {
    component_type: ComponentType.Button,
    custom_id: customId,
    message: messageToAPIData(message),
    ...override,
    ...setupMockedInteractionAPIData({
      caller,
      channel: message.channel,
      message,
      override,
      type: InteractionType.MessageComponent
    }),
    data: {
      component_type: ComponentType.Button,
      custom_id: customId
    }
  } satisfies APIMessageButtonInteractionData & APIMessageComponentInteraction
  const interaction = Reflect.construct(ButtonInteraction, [
    client,
    rawData
  ]) as ButtonInteraction
  applyInteractionResponseHandlers(interaction)
  return interaction
}

export function mockStringSelectInteraction ({
  caller,
  data,
  message,
  override = {}
}: {
  caller: User
  message: Message
  data: Omit<
    APIMessageStringSelectInteractionData,
    'component_type' | 'values'
  > & {
    values: string[] | string
  }
  override?: Partial<Omit<APIMessageComponentInteraction, 'data'>>
}): StringSelectMenuInteraction<CacheType> {
  const client = message.client
  const rawData = {
    message: messageToAPIData(message),
    ...override,
    ...setupMockedInteractionAPIData({
      caller,
      channel: message.channel,
      message,
      override,
      type: InteractionType.MessageComponent
    }),
    data: {
      component_type: ComponentType.StringSelect,
      custom_id: data.custom_id,
      values: Array.isArray(data.values) ? data.values : [data.values]
    }
  } satisfies APIMessageComponentInteraction & {
    data: APIMessageStringSelectInteractionData
  }
  const interaction = Reflect.construct(StringSelectMenuInteraction, [
    client,
    rawData
  ]) as StringSelectMenuInteraction
  applyInteractionResponseHandlers(interaction)
  return interaction
}

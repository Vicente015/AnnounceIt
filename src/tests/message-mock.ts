/* eslint-disable @typescript-eslint/require-await */
import {
  ActionRow,
  type ActionRowData,
  type APIActionRowComponent,
  type APIEmbed,
  type APIMessageActionRowComponent,
  Client,
  Embed,
  EmbedBuilder,
  type EmojiIdentifierResolvable,
  GuildEmoji,
  type InteractionReplyOptions,
  type JSONEncodable,
  Message,
  type MessageActionRowComponent,
  type MessageActionRowComponentBuilder,
  type MessageActionRowComponentData,
  type MessageCreateOptions,
  type MessageEditOptions,
  MessagePayload,
  MessageType,
  ReactionEmoji,
  type StartThreadOptions,
  type TextBasedChannel,
  User
} from 'discord.js'
import { RawMessageData } from 'discord.js/typings/rawDataTypes.js'
import { randomSnowflake } from '../utils/Snowflake.js'
import {
  mockReaction,
  mockTextChannel,
  mockThreadFromParentMessage
} from './channel-mock.js'
// import { randomSnowflake } from '@answeroverflow/discordjs-utils';
import { mockGuildMember, mockUser } from './user-mock.js'

export function mockEmbed (
  data: JSONEncodable<APIEmbed> | APIEmbed | EmbedBuilder
): Embed {
  return Reflect.construct(Embed, [
    data instanceof EmbedBuilder ? data.data : data
  ]) as Embed
}

export function mockActionRow (
  data:
    | JSONEncodable<APIActionRowComponent<APIMessageActionRowComponent>>
    | ActionRowData<
        MessageActionRowComponentData | MessageActionRowComponentBuilder
      >
      | APIActionRowComponent<APIMessageActionRowComponent>
): ActionRow<MessageActionRowComponent> {
  return Reflect.construct(ActionRow, [
    data
  ]) as ActionRow<MessageActionRowComponent>
}
export type MessageOptions =
  | string
  | MessageEditOptions
  | MessagePayload
  | InteractionReplyOptions
  | MessageCreateOptions
export function applyMessagePayload (payload: MessageOptions, message: Message) {
  if (typeof payload === 'string') {
    message.content = payload
  }
  if (payload instanceof MessagePayload) {
    throw new TypeError('Not implemented')
  }
  if (typeof payload !== 'string') {
    message.embeds = payload.embeds?.map(mockEmbed) ?? message.embeds
    message.content = payload.content ?? message.content
    message.components
      = payload.components?.map((comp) => mockActionRow(comp))
      ?? message.components
  }

  return message
}

export function mockMessage (input: {
  client: Client
  author?: User
  channel?: TextBasedChannel
  override?: Partial<RawMessageData>
  opts?: MessageOptions
}) {
  const { client, opts, override = {} } = input
  let { author, channel } = input
  if (!channel) {
    channel = mockTextChannel(client)
  }
  if (!author) {
    author = mockUser(client)
    if (!channel.isDMBased()) {
      mockGuildMember({
        client,
        guild: channel.guild,
        user: author
      })
    }
  }
  const rawData: RawMessageData = {
    attachments: [],
    author: {
      avatar: author.avatar,
      discriminator: author.discriminator,
      global_name: author.username,
      // TODO: Use a helper function to get properties
      id: author.id,
      username: author.username
    },
    channel_id: channel.id,
    content: '',
    edited_timestamp: null,
    embeds: [],
    id: randomSnowflake().toString(),
    mention_everyone: false,
    mention_roles: [],
    mentions: [],
    pinned: false,
    reactions: [],
    timestamp: '',
    tts: false,
    type: MessageType.Default,
    ...override
  }
  const message = Reflect.construct(Message, [client, rawData]) as Message
  // TODO: Fix ts ignore?
  // @ts-expect-error djdjsj
  channel.messages.cache.set(message.id, message)
  message.react = async (emoji: EmojiIdentifierResolvable) => {
    const isCustomEmoji = typeof emoji === 'string' && emoji.startsWith('<:')
    if (emoji instanceof GuildEmoji) {
      throw new TypeError('Not implement')
    }
    if (emoji instanceof ReactionEmoji) {
      throw new TypeError('Not implement')
    }
    return mockReaction({
      message,
      override: {
        emoji: {
          id: isCustomEmoji ? emoji : null,
          name: isCustomEmoji ? null : emoji
        }
      },
      user: client.user!
    })
  }
  message.startThread = async (options: StartThreadOptions) =>
    mockThreadFromParentMessage({
      client,
      data: options,
      parentMessage: message
    })

  message.edit = (payload) => {
    return Promise.resolve(applyMessagePayload(payload, message))
  }

  message.delete = () => {
    channel?.messages.cache.delete(message.id)
    return Promise.resolve(message)
  }

  if (opts) applyMessagePayload(opts, message)
  return message
}

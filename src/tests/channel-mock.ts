import {
  type AnyThreadChannel,
  type APIGuildForumChannel,
  type APIGuildTextChannel,
  type APIInvite,
  type APINewsChannel,
  type APITextChannel,
  type APIThreadChannel,
  ChannelType,
  Client,
  Collection,
  DiscordAPIError,
  type FetchArchivedThreadOptions,
  type FetchedThreads,
  type FetchedThreadsMore,
  type FetchMessageOptions,
  type FetchMessagesOptions,
  ForumChannel,
  ForumLayoutType,
  type Guild,
  type GuildBasedChannel,
  GuildChannel,
  type GuildTextChannelType,
  Invite,
  Message,
  type MessageCreateOptions,
  MessagePayload,
  MessageReaction,
  type MessageResolvable,
  NewsChannel,
  type PublicThreadChannel,
  SnowflakeUtil,
  type TextBasedChannel,
  TextChannel,
  ThreadChannel,
  ThreadMemberFlags,
  User
} from 'discord.js'
import { vitest } from 'vitest'
import type { RawMessageReactionData } from 'discord.js/typings/rawDataTypes.js'
import {
  isSnowflakeLarger,
  isSnowflakeLargerAsInt,
  randomSnowflake,
  sortMessagesById
} from '../utils/Snowflake.js'
import { mockGuild } from './guild-mock.js'
import { mockMessage } from './message-mock.js'

export function getGuildTextChannelMockDataBase<Type extends GuildTextChannelType> (type: Type, guild: Guild) {
  const rawData: APIGuildTextChannel<Type> = {
    default_auto_archive_duration: 60,
    guild_id: guild?.id,
    id: randomSnowflake().toString(),
    last_message_id: null,
    last_pin_timestamp: null,
    name: 'channel name',
    nsfw: false,
    parent_id: null,
    permission_overwrites: [],
    position: 0,
    rate_limit_per_user: 0,
    topic: 'channel topic',
    type
  }
  return rawData
}

function setupMockedChannel<T extends GuildBasedChannel> (
  client: Client,
  guild: Guild | undefined,
  createMockData: (guild: Guild) => T
): T {
  if (!guild) {
    guild = mockGuild(client)
  }
  const channel = createMockData(guild)
  if (
    channel.type === ChannelType.GuildText
    || channel.type === ChannelType.GuildAnnouncement
    || channel.type === ChannelType.GuildForum
  ) {
    channel.threads.fetchActive = () => {
      const activeThreads = [...channel.threads.cache.values()].filter(
        (thread) => !thread.archived || thread.archived == undefined
      )
      const output: FetchedThreads = {
        members: new Collection(
          activeThreads.flatMap((thread) => {
            const members = [...thread.members.cache.values()]
            return members.map((member) => [member.id, member])
          })
        ),
        threads: new Collection(
          activeThreads.map((thread) => [
            thread.id,
            thread as AnyThreadChannel
          ])
        )
      }
      return Promise.resolve(output)
    }
    channel.threads.fetchArchived = vitest
      .fn()
      .mockImplementation((options: FetchArchivedThreadOptions = {}) => {
        let filteredThreads = [
          ...channel.threads.cache
            .sorted((a, b) => isSnowflakeLargerAsInt(a.id, b.id))
            .values()
        ].filter((thread) => thread.archived)
        if (options.type) {
          filteredThreads = filteredThreads.filter((thread) => {
            const isPublicThread = thread.type === ChannelType.PublicThread
            const isPrivateThread = thread.type === ChannelType.PrivateThread
            if (options.type === 'public' && isPublicThread) {
              return true
            }
            if (options.type === 'private' && isPrivateThread) {
              return true
            }
            return false
          })
        }

        filteredThreads = filteredThreads.filter((thread) => {
          let beforeTime = options.before
          if (beforeTime == undefined) {
            return true
          }
          if (beforeTime instanceof Date || typeof beforeTime === 'number') {
            beforeTime = SnowflakeUtil.generate({
              timestamp: beforeTime
            }).toString()
          }
          if (beforeTime instanceof ThreadChannel) {
            beforeTime = beforeTime.id
          }
          return isSnowflakeLarger(thread.id, beforeTime)
        })

        if (options.limit) {
          filteredThreads = filteredThreads.slice(0, options.limit)
        }

        const output: FetchedThreadsMore = {
          hasMore: false,
          members: new Collection(
            filteredThreads.flatMap((thread) => {
              const members = [...thread.members.cache.values()]
              return members.map((member) => [member.id, member])
            })
          ),
          threads: new Collection(
            filteredThreads.map((thread) => [
              thread.id,
              thread as AnyThreadChannel
            ])
          ) // TODO: set this
        }
        return Promise.resolve(output)
      })
    channel.createInvite = () => {
      const invite = mockInvite(client, channel)
      return Promise.resolve(invite)
    }
  }
  if (channel.isTextBased()) {
    // @ts-expect-error dsdsds
    channel.send = (
      options: string | MessagePayload | MessageCreateOptions
    ) => {
      const isMessagePayload = options instanceof MessagePayload
      const options_ = isMessagePayload ? options.options : options
      const message = mockMessage({
        author: client.user!,
        channel,
        client,
        opts: options_
      })
      return Promise.resolve(message)
    }

    channel.messages.fetch = vitest
      .fn()
      .mockImplementation(
        (
          q:
            | MessageResolvable
            | FetchMessagesOptions
            | FetchMessageOptions = {}
        ) => {
          if (q instanceof Message) {
            return Promise.resolve(q)
          }
          if (typeof q === 'string') {
            const message = channel.messages.cache.get(q)
            if (!message) {
              return Promise.reject(
                new DiscordAPIError(
                  {
                    code: 10_008,
                    message: 'NOT FOUND'
                  },
                  10_008,
                  404,
                  'GET',
                  '/channels/123/messages/123',
                  {
                    files: []
                  }
                )
              )
            }
            return Promise.resolve(message)
          }
          if ('message' in q) {
            const resolvable = q.message
            // DRY? Never heard of it
            if (resolvable instanceof Message) {
              return Promise.resolve(q)
            }
            if (typeof resolvable === 'string') {
              const message = channel.messages.cache.get(resolvable)
              if (!message) {
                return Promise.reject(
                  new DiscordAPIError(
                    {
                      code: 10_008,
                      message: 'NOT FOUND'
                    },
                    10_008,
                    404,
                    'GET',
                    '/channels/123/messages/123',
                    {
                      files: []
                    }
                  )
                )
              }
              return Promise.resolve(message)
            }
            throw new Error('Invalid message')
          }
          const { after } = q
          let { limit } = q

          if (!limit) {
            limit = 100 // Default Discord limit
          }

          // 1. sort by id
          const sortedCachedMessages = sortMessagesById(
            [...channel.messages.cache.values()]
          )
          // 2. filter to only above the id
          const filteredMessages = sortedCachedMessages.filter((message) => {
            if (!after) return true
            return isSnowflakeLarger(message.id, after)
          })
          // 3. take up to limit
          const messages = filteredMessages.slice(0, limit)
          const asCollection = new Collection(
            messages.map((message) => [message.id, message])
          )
          return Promise.resolve(asCollection)
        }
      )
  }
  if (channel.isThread()) {
    channel.fetchStarterMessage = () => {
      return channel.parent?.type === ChannelType.GuildForum
        ? Promise.resolve(channel.messages.cache.get(channel.id) ?? null)
        : Promise.resolve(
          channel.parent?.messages.cache.get(channel.id) ?? null
        )
    }
  }
  client.channels.cache.set(channel.id, channel)
  guild.channels.cache.set(channel.id, channel)
  return channel
}

export function mockTextChannel (
  client: Client,
  guild?: Guild,
  data: Partial<APITextChannel> = {}
): TextChannel {
  return setupMockedChannel(client, guild, (guild) => {
    const rawData: APITextChannel = {
      ...getGuildTextChannelMockDataBase(ChannelType.GuildText, guild),
      ...data
    }
    const channel = Reflect.construct(TextChannel, [
      guild,
      rawData,
      client
    ]) as TextChannel
    return channel
  })
}

export function mockThreadFromParentMessage (input: {
  client: Client
  parentMessage: Message
  data?: Partial<APIThreadChannel>
}) {
  const { client, data = {}, parentMessage } = input
  if (parentMessage
    && parentMessage
    && (parentMessage.channel.type === ChannelType.GuildText
    || parentMessage.channel.type === ChannelType.GuildAnnouncement)
  ) {
    return mockPublicThread({
      client,
      data: {
        id: parentMessage.id,
        ...data
      },
      parentChannel: parentMessage.channel
    })
  }
  throw new Error('Invalid parent message')
}

export function mockPublicThread (input: {
  client: Client
  parentChannel?: TextChannel | ForumChannel | NewsChannel
  data?: Partial<APIThreadChannel>
}) {
  const { client, data = {} } = input
  let { parentChannel } = input

  return setupMockedChannel(client, parentChannel?.guild, (guild) => {
    if (!parentChannel) {
      parentChannel = mockTextChannel(client, guild)
    }
    const rawData: APIThreadChannel = {
      ...getGuildTextChannelMockDataBase(ChannelType.PublicThread, guild),
      applied_tags: [],
      guild_id: guild.id,
      member: {
        flags: ThreadMemberFlags.AllMessages,
        id: randomSnowflake().toString(),
        join_timestamp: new Date().toISOString(),
        user_id: randomSnowflake().toString()
      },
      member_count: 0,
      message_count: 0,
      parent_id: parentChannel.id,
      thread_metadata: {
        archive_timestamp: new Date().toISOString(),
        archived: false,
        auto_archive_duration: 60,
        locked: false
      },
      ...data
    }

    const thread: PublicThreadChannel = Reflect.construct(ThreadChannel, [
      guild,
      rawData,
      client
    ]) as PublicThreadChannel

    // @ts-expect-error dsdsds
    parentChannel.threads.cache.set(thread.id, thread)
    return thread
  })
}

export function mockForumChannel (
  client: Client,
  guild?: Guild,
  data: Partial<APIGuildForumChannel> = {}
) {
  return setupMockedChannel(client, guild, (guild) => {
    const rawData: APIGuildForumChannel = {
      ...getGuildTextChannelMockDataBase(ChannelType.GuildForum, guild),
      available_tags: [
        {
          emoji_id: null,
          emoji_name: null,
          id: randomSnowflake().toString(),
          moderated: false,
          name: 'test tag'
        }
      ],
      default_forum_layout: ForumLayoutType.ListView,
      default_reaction_emoji: null,
      default_sort_order: null,
      ...data
    }
    const channel = Reflect.construct(ForumChannel, [guild, rawData, client])
    return channel
  })
}

export function mockNewsChannel (input: {
  client: Client
  guild?: Guild
  data?: Partial<APINewsChannel>
}) {
  return setupMockedChannel(input.client, input.guild, (guild) => {
    const rawData: APINewsChannel = {
      ...getGuildTextChannelMockDataBase(ChannelType.GuildAnnouncement, guild),
      ...input.data
    }
    const channel = Reflect.construct(NewsChannel, [
      guild,
      rawData,
      input.client
    ]) as NewsChannel
    return channel
  })
}

export function mockMessages (
  channel: TextBasedChannel,
  numberOfMessages: number
) {
  const messages: Message[] = []
  for (let id = 1; id <= numberOfMessages; id++) {
    messages.push(
      mockMessage({
        channel: channel,
        client: channel.client
      })
    )
  }
  return messages
}

export function mockMessageReaction ({
  message,
  override,
  reacter
}: {
  message: Message
  reacter: User
  override: Partial<RawMessageReactionData>
}) {
  const data: RawMessageReactionData = {
    channel_id: message.channel.id,
    count: 1,
    emoji: {
      id: randomSnowflake().toString(),
      name: '👍'
    },
    guild_id: message.guild?.id,
    me: reacter.id === message.client.user?.id,
    message_id: message.id,
    user_id: reacter.id,
    ...override
  }
  const messageReaction = Reflect.construct(MessageReaction, [
    message.client,
    data,
    message
  ]) as MessageReaction
  return messageReaction
}

export function mockReaction ({
  message,
  override,
  user
}: {
  message: Message
  user: User
  override?: Partial<RawMessageReactionData>
}) {
  const data: RawMessageReactionData = {
    channel_id: message.channel.id,
    count: 1,
    emoji: {
      id: randomSnowflake().toString(),
      name: '👍'
    },
    guild_id: message.guild?.id,
    me: user.id === message.client.user?.id,
    message_id: message.id,
    user_id: user.id,
    ...override
  }
  const reaction = Reflect.construct(MessageReaction, [
    message.client,
    data,
    message
  ]) as MessageReaction
  const emojiId = data.emoji.name ?? data.emoji.id
  if (!emojiId) {
    throw new Error('Emoji ID and name cannot be null')
  }
  message.reactions.cache.set(emojiId, reaction)
  return reaction
}

export function mockInvite (
  client: Client,
  channel: GuildChannel | undefined,
  override: Partial<APIInvite> = {}
) {
  if (!channel) {
    channel = mockTextChannel(client)
  }
  const inviteData: APIInvite = {
    channel: {
      id: channel.id,
      name: channel.name,
      type: channel.type
    },
    // random 5 letter string
    code: Math.random().toString(36).slice(2, 7),
    ...override
  }
  const invite = Reflect.construct(Invite, [client, inviteData]) as Invite
  return invite
}

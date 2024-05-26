import './environment.js'
import '@sapphire/plugin-i18next/register'
import { LogLevel, SapphireClient } from '@sapphire/framework'
import { InternationalizationContext } from '@sapphire/plugin-i18next'
import { ClientOptions } from 'discord.js'
import { ActivityType, GatewayIntentBits, Options, PresenceUpdateStatus } from 'discord.js'
import config from '../config.json' assert { type: 'json' }

export function createClient (override: Partial<ClientOptions> = {}) {
  return new SapphireClient({
    allowedMentions: { parse: ['users', 'roles'], repliedUser: false },
    // @ts-expect-error ClientOptions type does not include this
    api: {
      automaticallyConnect: process.env.NODE_ENV !== 'test'
    },
    i18n: {
      defaultLanguageDirectory: 'src/languages/',
      fetchLanguage: (context: InternationalizationContext) => {
        return context.interactionGuildLocale ?? context.interactionLocale ?? context.guild?.preferredLocale ?? config.defaultLanguage
      },
      i18next: { fallbackLng: 'es-ES', returnEmptyString: true, returnNull: false }
    },
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    loadSubcommandErrorListeners: true,
    logger: { level: config.debug ? LogLevel.Debug : LogLevel.Info },
    makeCache: Options.cacheWithLimits({
      ...Options.DefaultMakeCacheSettings,
      GuildBanManager: 0,
      GuildEmojiManager: 0,
      GuildInviteManager: 0,
      GuildScheduledEventManager: 0,
      GuildStickerManager: 0,
      MessageManager: 0,
      PresenceManager: 0,
      ReactionManager: 0,
      ReactionUserManager: 0,
      StageInstanceManager: 0,
      ThreadManager: 0,
      ThreadMemberManager: 0,
      VoiceStateManager: 0
    }),
    presence: {
      activities: [{ name: 'Publishing announcements', type: ActivityType.Playing }],
      status: PresenceUpdateStatus.Online
    },
    ...override
  })
}

export async function login (client: SapphireClient) {
  try {
    await client.login(process.env.TOKEN)
  }
  catch (error) {
    client.logger.fatal(error)
    await client.destroy()
    throw error
  }
}

import './environment'
import '@sapphire/plugin-i18next/register'
import 'dotenv/config'
import { LogLevel, SapphireClient } from '@sapphire/framework'
import { InternationalizationContext } from '@sapphire/plugin-i18next'
import { PresenceUpdateStatus } from 'discord-api-types/v10'
import { Intents, Options } from 'discord.js'
import { ActivityTypes } from 'discord.js/typings/enums'
import config from '../config.json'

const client = new SapphireClient({
  allowedMentions: { parse: ['users', 'roles'], repliedUser: false },
  i18n: {
    fetchLanguage: (context: InternationalizationContext) => {
      return (context.interactionGuildLocale ?? context.interactionLocale) ?? 'es-ES'
    },
    i18next: { returnEmptyString: true, returnNull: false }
  },
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
  logger: { level: config.debug ? LogLevel.Debug : LogLevel.Info },
  makeCache: Options.cacheWithLimits({
    ...Options.defaultMakeCacheSettings,
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
    activities: [{ name: 'Publishing announcements', type: ActivityTypes.PLAYING }],
    status: PresenceUpdateStatus.Online
  }
})

client.login(process.env.TOKEN)
  .then(() => {})
  .catch((error) => { client.logger.error(error) })

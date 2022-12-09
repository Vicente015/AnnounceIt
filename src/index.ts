import '@sapphire/plugin-i18next/register'
import 'dotenv/config'
import { LogLevel, SapphireClient } from '@sapphire/framework'
import { InternationalizationContext } from '@sapphire/plugin-i18next'
import { Intents } from 'discord.js'
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
  presence: {
    activities: [{ name: 'Publishing announcements', type: ActivityTypes.PLAYING }],
    status: 'online'
  }
})

client.login(process.env.TOKEN)
  .then(() => {})
  .catch((error) => { console.error(error) })

import { CommandInteraction } from 'discord.js'
import { getFixedT, TFunction } from 'i18next'
import config from '../../../config.json'

const isValidLanguage = (guildLocale: string | null): boolean => !!(guildLocale && config.languages.includes(guildLocale))

/**
 * Returns the t function with the guild locale
 *
 * @param interaction The command interaction
 * @returns {TFunction} T Function
 */
const getT = (interaction: CommandInteraction): TFunction => {
  return getFixedT(
    isValidLanguage(interaction.guildLocale)
      ? interaction.guildLocale as string
      : config.defaultLanguage
  )
}

export { getT }

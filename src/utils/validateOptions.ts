import { fetchT, TFunction } from '@sapphire/plugin-i18next'
import { Subcommand } from '@sapphire/plugin-subcommands'
import { ApplicationCommandOptionType, CacheType, CommandInteractionOptionResolver, ModalSubmitInteraction } from 'discord.js'
import ow, { ArgumentError, ObjectPredicate } from 'ow'
import { reply } from './reply.js'
type Options = Omit<CommandInteractionOptionResolver<CacheType>, 'getMessage' | 'getFocused'>

const getValues = {
  [ApplicationCommandOptionType.Attachment]: (optionName: string, options: Options) => options.getAttachment(optionName, false),
  [ApplicationCommandOptionType.Boolean]: (optionName: string, options: Options) => options.getBoolean(optionName, false),
  [ApplicationCommandOptionType.Channel]: (optionName: string, options: Options) => options.getChannel(optionName, false),
  [ApplicationCommandOptionType.Integer]: (optionName: string, options: Options) => options.getInteger(optionName, false),
  [ApplicationCommandOptionType.Mentionable]: (optionName: string, options: Options) => options.getMentionable(optionName, false),
  [ApplicationCommandOptionType.Number]: (optionName: string, options: Options) => options.getNumber(optionName, false),
  [ApplicationCommandOptionType.Role]: (optionName: string, options: Options) => options.getRole(optionName, false),
  [ApplicationCommandOptionType.String]: (optionName: string, options: Options) => options.getString(optionName, false),
  [ApplicationCommandOptionType.Subcommand]: (optionName: string, options: Options) => options.getSubcommand(false),
  [ApplicationCommandOptionType.SubcommandGroup]: (optionName: string, options: Options) => options.getSubcommandGroup(false),
  [ApplicationCommandOptionType.User]: (optionName: string, options: Options) => options.getUser(optionName, false)
}

// todo: should test these two

/**
 * Validates and returns the options of a command
 * @param interaction
 * @param schema
 * @returns
*/
export async function validateChatInput<Shape extends object> (interaction: Subcommand.ChatInputCommandInteraction, schema: ObjectPredicate<Shape>) {
  if (!interaction.options.data[0].options || interaction.options.data[0].options.length === 0) return
  const options = interaction.options.data[0].options
    .map((option) => ({ [option.name]: getValues[option.type](option.name, interaction.options) }))
    .reduce((previous, current) => ({ ...previous, ...current }))
  const t: TFunction = await fetchT(interaction)
  try {
    ow(options, schema)
    return { ...options, t }
  }
  catch (error) {
    interaction.client.logger.error(error)
    if (error instanceof ArgumentError) {
      const i18nKeyRegex = /(commands|common|meta):[\w.\-]+(?=\s|$)/g
      const errorMessage = error.message.match(i18nKeyRegex)?.at(0)?.trim() ?? 'common:weirdError'
      await reply(interaction, { content: t(errorMessage, { defaultValue: '' }), type: 'negative' })
    }
  }
}

/**
 * Validates and returns the options of a modal
 * @param interaction
 * @param schema
 * @returns
 */
export async function validateModalInput<Shape extends object> (interaction: ModalSubmitInteraction, schema: ObjectPredicate<Shape>) {
  if (!interaction.guild) return

  const options = interaction.fields.fields
    .filter((data) => !!data.value)
    .map((data) => ({ [data.customId]: data.value }))
    .reduce((previous, current) => ({ ...previous, ...current }))
  const t: TFunction = await fetchT(interaction.guild)
  try {
    ow(options, schema)
    return { ...options, t }
  }
  catch (error) {
    console.log('awa', error)
    if (error instanceof ArgumentError) {
      const i18nKeyRegex = /(commands|common|meta):[\w.\-]+(?=\s|$)/g
      const errorMessage = error.message.match(i18nKeyRegex)?.at(0)?.trim() ?? 'common:weirdError'
      await reply(interaction, { content: t(errorMessage, { defaultValue: '' }), type: 'negative' })
    }
  }
}

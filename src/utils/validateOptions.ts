import { fetchT, TFunction } from '@sapphire/plugin-i18next'
import { Subcommand } from '@sapphire/plugin-subcommands'
import { ApplicationCommandOptionType, CacheType, CommandInteractionOptionResolver, ModalSubmitInteraction } from 'discord.js'
import ow, { ArgumentError, ObjectPredicate } from 'ow'
import { reply } from './reply'

type OptionFunctions = {
  [key in ApplicationCommandOptionType]: (optionName: string, options: Omit<CommandInteractionOptionResolver<CacheType>, 'getMessage' | 'getFocused'>) => any
}

const getValues: OptionFunctions = {
  [ApplicationCommandOptionType.Attachment]: (optionName, options) => options.getAttachment(optionName, false),
  [ApplicationCommandOptionType.Boolean]: (optionName, options) => options.getBoolean(optionName, false),
  [ApplicationCommandOptionType.Channel]: (optionName, options) => options.getChannel(optionName, false),
  [ApplicationCommandOptionType.Integer]: (optionName, options) => options.getInteger(optionName, false),
  [ApplicationCommandOptionType.Mentionable]: (optionName, options) => options.getMentionable(optionName, false),
  [ApplicationCommandOptionType.Number]: (optionName, options) => options.getNumber(optionName, false),
  [ApplicationCommandOptionType.Role]: (optionName, options) => options.getRole(optionName, false),
  [ApplicationCommandOptionType.String]: (optionName, options) => options.getString(optionName, false),
  [ApplicationCommandOptionType.Subcommand]: (optionName, options) => options.getSubcommand(false),
  [ApplicationCommandOptionType.SubcommandGroup]: (optionName, options) => options.getSubcommandGroup(false),
  [ApplicationCommandOptionType.User]: (optionName, options) => options.getUser(optionName, false)
}

/**
 * Validates and returns the options of a command
 * @param interaction
 * @param schema
 * @returns
 */
export async function validateChatInput <T extends object> (interaction: Subcommand.ChatInputCommandInteraction, schema: ObjectPredicate<T>) {
  if (!interaction.options.data[0].options || interaction.options.data[0].options.length === 0) return
  const options = interaction.options.data[0].options
    .map((option) => ({ [option.name]: getValues[option.type](option.name, interaction.options) }))
    .reduce((previous, current) => ({ ...previous, ...current }))
  const t: TFunction = await fetchT(interaction)
  try {
    ow(options, schema)
    return { ...options, t }
  } catch (error: any) {
    if (error instanceof ArgumentError) {
      // ? Removes "error <in object X>" from error message
      const errorMessage = error.message.split(' in object ')[0]
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
export async function validaModalInput <T extends object> (interaction: ModalSubmitInteraction, schema: ObjectPredicate<T>) {
  if (!interaction.guild) return

  const options = interaction.fields.fields
    .filter((data) => !!data.value)
    .map((data) => ({ [data.customId]: data.value }))
    .reduce((previous, current) => ({ ...previous, ...current }))
  const t: TFunction = await fetchT(interaction.guild)
  try {
    ow(options, schema)
    return { ...options, t }
  } catch (error: any) {
    if (error instanceof ArgumentError) {
      // ? Removes "error <in object X>" from error message
      const errorMessage = error.message.split(' in object ')[0]
      await reply(interaction, { content: t(errorMessage, { defaultValue: '' }), type: 'negative' })
    }
  }
}

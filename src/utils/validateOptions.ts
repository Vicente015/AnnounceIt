import { fetchT, TFunction } from '@sapphire/plugin-i18next'
import { Subcommand } from '@sapphire/plugin-subcommands'
import { CacheType, CommandInteractionOptionResolver } from 'discord.js'
import ow, { ArgumentError, ObjectPredicate } from 'ow'

type Options = Omit<CommandInteractionOptionResolver<CacheType>, 'getMessage' | 'getFocused'>

const getValues = {
  ATTACHMENT: (optionName: string, options: Options) => options.getAttachment(optionName, false),
  BOOLEAN: (optionName: string, options: Options) => options.getBoolean(optionName, false),
  CHANNEL: (optionName: string, options: Options) => options.getChannel(optionName, false),
  INTEGER: (optionName: string, options: Options) => options.getInteger(optionName, false),
  MENTIONABLE: (optionName: string, options: Options) => options.getMentionable(optionName, false),
  NUMBER: (optionName: string, options: Options) => options.getNumber(optionName, false),
  ROLE: (optionName: string, options: Options) => options.getRole(optionName, false),
  STRING: (optionName: string, options: Options) => options.getString(optionName, false),
  SUB_COMMAND: (optionName: string, options: Options) => options.getSubcommand(false),
  SUB_COMMAND_GROUP: (optionName: string, options: Options) => options.getSubcommandGroup(false),
  USER: (optionName: string, options: Options) => options.getUser(optionName, false)
}

export async function validateOptions <T extends object> (interaction: Subcommand.ChatInputInteraction, schema: ObjectPredicate<T>) {
  if (!interaction.options.data[0].options) return
  const options = interaction.options.data[0].options
    .map((option) => ({ [option.name]: getValues[option.type](option.name, interaction.options) }))
    // eslint-disable-next-line unicorn/no-array-reduce
    .reduce((previous, current) => ({ ...previous, ...current }))
  const t: TFunction = await fetchT(interaction)
  try {
    ow(options, schema)
    return { ...options, t }
  } catch (error: any) {
    if (error instanceof ArgumentError) {
      // ? Removes "error <in object X>" from error message
      const errorMessage = error.message.split(' in object ')[0]
      return await interaction.reply({ content: t(errorMessage, { defaultValue: '' }), ephemeral: true })
    }
  }
}

import { CommandInteraction, InteractionReplyOptions, ModalSubmitInteraction } from 'discord.js'
import config from '../../config.json'
import convertHexStringToInt from './convertHexStringToInt'

enum AnswerType {
  positive,
  negative,
  neutral
}

interface ReplyOptions extends InteractionReplyOptions {
  type: keyof typeof AnswerType
  content: string
}

export async function reply (interaction: ModalSubmitInteraction | CommandInteraction, options: ReplyOptions) {
  const { content, ephemeral, type } = options

  console.debug(convertHexStringToInt(config.colors[type]))
  return await interaction.reply({
    embeds: [{
      color: convertHexStringToInt(config.colors[type]),
      description: content
    }],
    ephemeral: type === 'negative' ? true : !!ephemeral
  })
}

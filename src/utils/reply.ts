import { CommandInteraction, InteractionReplyOptions, ModalSubmitInteraction } from 'discord.js'
import config from '../../config.json' with { type: 'json' }
import convertHexStringToInt from './convertHexStringToInt.js'

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

  return await interaction.reply({
    embeds: [{
      color: convertHexStringToInt(config.colors[type]),
      description: content
    }],
    ephemeral: type === 'negative' ? true : !!ephemeral
  })
}

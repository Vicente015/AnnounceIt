import { ColorResolvable, CommandInteraction, InteractionReplyOptions, ModalSubmitInteraction } from 'discord.js'
import config from '../../config.json'

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
      color: config.colors[type] as ColorResolvable,
      description: content
    }],
    ephemeral: type === 'negative' ? true : !!ephemeral
  })
}

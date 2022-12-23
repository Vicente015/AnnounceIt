import { Subcommand } from '@sapphire/plugin-subcommands'
import ow from 'ow'
import { Announcement } from '../../schemas/Announcement'
import { reply } from '../../utils/reply'
import { validateChatInput } from '../../utils/validateOptions'

const Schema = ow.object.exactShape({
  name: ow.string
})

export async function remove (interaction: Subcommand.ChatInputInteraction) {
  const options = await validateChatInput(interaction, Schema)
  if (!options) return
  const { name: id, t } = options

  try {
    await Announcement.findByIdAndDelete(id).exec()
  } catch {
    return await reply(interaction, { content: t('commands:remove.error'), type: 'negative' })
  }
  return await reply(interaction, { content: t('commands:remove.done'), ephemeral: true, type: 'positive' })
}

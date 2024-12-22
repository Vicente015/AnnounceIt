import { Subcommand } from '@sapphire/plugin-subcommands'
import ow from 'ow'
import { Announcement } from '../../schemas/Announcement.js'
import { reply } from '../../utils/reply.js'
import { validateChatInput } from '../../utils/validateOptions.js'

const schema = ow.object.exactShape({
  name: ow.string
})

export async function remove (interaction: Subcommand.ChatInputCommandInteraction) {
  const options = await validateChatInput(interaction, schema)
  if (!options) return
  const { name: id, t } = options

  try {
    await Announcement.findByIdAndDelete(id).exec()
  }
  catch {
    return await reply(interaction, { content: t('commands:remove.error'), type: 'negative' })
  }
  return await reply(interaction, { content: t('commands:remove.done'), ephemeral: true, type: 'positive' })
}

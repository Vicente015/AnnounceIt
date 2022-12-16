import { Subcommand } from '@sapphire/plugin-subcommands'
import ow from 'ow'
import { Announcement } from '../../schemas/Announcement'
import { nameSchema } from '../../schemas/OwSchemas'
import { validateChatInput } from '../../utils/validateOptions'

const Schema = ow.object.exactShape({
  // eslint-disable-next-line sort/object-properties
  name: nameSchema
})

export async function remove (interaction: Subcommand.ChatInputInteraction) {
  const options = await validateChatInput(interaction, Schema)
  if (!options) return
  const { name: id, t } = options

  try {
    await Announcement.findByIdAndDelete(id).exec()
  } catch {
    return await interaction.reply({ content: t('commands:remove.error'), ephemeral: true })
  }
  return await interaction.reply({ content: t('commands:remove.done'), ephemeral: true })
}

import { Subcommand } from '@sapphire/plugin-subcommands'
import { Role } from 'discord.js'
import ow from 'ow'
import { Config } from '../../../schemas/Config'
import { validateOptions } from '../../../utils/validateOptions'

const Schema = ow.object.exactShape({
  // eslint-disable-next-line sort/object-properties
  role: ow.object.instanceOf(Role)
})

export async function remove (interaction: Subcommand.ChatInputInteraction) {
  const client = interaction.client
  const options = await validateOptions(interaction, Schema)
  if (!options) return
  const { role: _, t } = options
  const role = _ as Role

  const config = await Config.findOne({ guildId: interaction.guildId })
  if (!config?.managerRoles.includes(role.id)) return await interaction.reply({ content: t('commands:managers.remove.not'), ephemeral: true })

  await Config.findOneAndUpdate(
    { guildId: interaction.guildId },
    { $pull: { managerRoles: role.id }, guildId: interaction.guildId }
  )
    .catch(async (error) => {
      client.logger.error(error)
      return await interaction.reply({ content: t('commands:managers.error'), ephemeral: true })
    })

  await interaction.reply(t('commands:managers.remove.done'))
}

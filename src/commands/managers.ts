import { CommandInteraction } from 'discord.js'
import type Client from '../structures/Client'
import { Config } from '../schemas/Config'
import { TFunction } from 'i18next'

export default async function run (client: Client, interaction: CommandInteraction<'cached'>, t: TFunction): Promise<void> {
  const subCommand = interaction.options.getSubcommand(true)

  switch (subCommand) {
    case 'add': {
      add(client, interaction, t)
      break
    }
    case 'remove': {
      remove(client, interaction, t)
      break
    }
  }
}

async function add (client: Client, interaction: CommandInteraction<'cached'>, t: TFunction): Promise<void> {
  const role = interaction.options.getRole('role', true)

  const config = await Config.findOne({ guildId: interaction.guildId })
  if (config?.managerRoles.includes(role.id)) return await interaction.reply({ content: t('commands:managers.add.already'), ephemeral: true })

  await Config.findOneAndUpdate(
    { guildId: interaction.guildId },
    { guildId: interaction.guildId, $push: { managerRoles: role.id } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )
    .catch(async (err) => {
      client.logger.error(err)
      return await interaction.reply({ content: t('commands:managers.error'), ephemeral: true })
    })

  interaction.reply(t('commands:managers.add.done'))
}

async function remove (client: Client, interaction: CommandInteraction<'cached'>, t: TFunction): Promise<void> {
  const role = interaction.options.getRole('role', true)

  const config = await Config.findOne({ guildId: interaction.guildId })
  if (!config?.managerRoles.includes(role.id)) return await interaction.reply({ content: t('commands:managers.remove.not'), ephemeral: true })

  await Config.findOneAndUpdate(
    { guildId: interaction.guildId },
    { guildId: interaction.guildId, $pull: { managerRoles: role.id } }
  )
    .catch(async (err) => {
      client.logger.error(err)
      return await interaction.reply({ content: t('commands:managers.error'), ephemeral: true })
    })

  interaction.reply(t('commands:managers.remove.done'))
}

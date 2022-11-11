import { CommandInteraction } from 'discord.js'
import { TFunction } from 'i18next'
import { Config } from '../schemas/Config'
import type Client from '../structures/Client'

export default async function run (client: Client, interaction: CommandInteraction<'cached'>, t: TFunction): Promise<void> {
  const subCommand = interaction.options.getSubcommand(true)

  switch (subCommand) {
    case 'add': {
      await add(client, interaction, t)
      break
    }
    case 'remove': {
      await remove(client, interaction, t)
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
    { $push: { managerRoles: role.id }, guildId: interaction.guildId },
    { new: true, setDefaultsOnInsert: true, upsert: true }
  )
    .catch(async (error) => {
      client.logger.error(error)
      return await interaction.reply({ content: t('commands:managers.error'), ephemeral: true })
    })

  await interaction.reply(t('commands:managers.add.done'))
}

async function remove (client: Client, interaction: CommandInteraction<'cached'>, t: TFunction): Promise<void> {
  const role = interaction.options.getRole('role', true)

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

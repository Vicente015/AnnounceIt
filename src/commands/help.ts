import { CommandInteraction, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js'
import { TFunction } from 'i18next'
import Client from '../structures/Client'

export default async function run (client: Client, interaction: CommandInteraction<'cached'>, t: TFunction): Promise<void> {
  const embed = new MessageEmbed()
    .setTitle(client.user!.username)
    .setDescription(t('commands:help.description', { username: client.user!.username }))
    .setColor('BLURPLE')
    .setThumbnail(client.user!.displayAvatarURL({ format: 'png', size: 600 }))

  const buttons = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setLabel(t('commands:help.invite'))
        .setEmoji('<:add:847563585165066290>')
        .setURL('https://discord.com/api/oauth2/authorize?client_id=725373172391739402&permissions=274878221312&scope=bot%20applications.commands')
        .setStyle('LINK')
    )

  return await interaction.reply({ embeds: [embed], components: [buttons] })
}

import { CommandInteraction, MessageActionRow, MessageButton, MessageEmbed, HexColorString, TextChannel, ThreadChannel, NewsChannel } from 'discord.js'
import { Announcement } from '../schemas/Announcement'
import Client from '../structures/Client'
import iso from 'iso-639-1'
import { TFunction } from 'i18next'
import { TextBasedChannels } from '../utils/Constants'

export default async function run (client: Client, interaction: CommandInteraction<'cached'>, t: TFunction) {
  const id = interaction.options.getString('name')

  const rawChannel = interaction.options.getChannel('channel', true)
  const channel = rawChannel.isText() ? rawChannel : null
  if (channel == null) return

  if (!channel.permissionsFor(interaction.user.id)?.has('SEND_MESSAGES')) {
    return await interaction.reply({ content: t('commands:publish.errorPerms'), ephemeral: true })
  }
  if (!channel.permissionsFor(client.user!.id)?.has('SEND_MESSAGES')) {
    return await interaction.reply({ content: t('commands:publish.cannotSend'), ephemeral: true })
  }

  const announcement = await Announcement.findById(id).exec().catch(() => {})
  if (announcement == null) return await interaction.reply({ content: t('commands:publish.announcementNotFound'), ephemeral: true })
  const haveTranslations = announcement?.translations.length > 0

  const embed = new MessageEmbed()
    .setColor(announcement.color as HexColorString ?? 'BLURPLE')

  if (announcement.title) embed.setTitle(announcement.title)
  if (announcement.description) embed.setDescription(announcement.description)
  if (announcement.footer) embed.setFooter({ text: announcement.footer })
  if (announcement.url && announcement.title) embed.setURL(announcement.url)

  if (haveTranslations) {
    const buttons = new MessageActionRow()
      .addComponents(announcement.translations.map(translation => {
        return new MessageButton({
          label: iso.getNativeName(translation.lang),
          customId: translation._id!.toString(),
          style: 'PRIMARY'
        })
      }))
    await channel.send({ embeds: [embed], components: [buttons] })
  } else {
    await channel.send({ embeds: [embed] })
  }

  await Announcement.findByIdAndUpdate(id, { published: true }).exec()
  interaction.reply({ content: t('commands:publish.done'), ephemeral: true })
}

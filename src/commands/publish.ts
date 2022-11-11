import { CommandInteraction, HexColorString, MessageActionRow, MessageButton, MessageEmbed, TextChannel } from 'discord.js'
import { TFunction } from 'i18next'
import iso from 'iso-639-1'
import { Announcement } from '../schemas/Announcement'
import Client from '../structures/Client'

export default async function run (client: Client, interaction: CommandInteraction<'cached'>, t: TFunction) {
  if (!client.isReady()) return
  const id = interaction.options.getString('name')
  const channel = interaction.options.getChannel('channel', true) as TextChannel

  if (!channel.permissionsFor(interaction.user.id)?.has('SEND_MESSAGES')) {
    return await interaction.reply({ content: t('commands:publish.errorPerms'), ephemeral: true })
  }
  if (!channel.permissionsFor(client.user.id)?.has('SEND_MESSAGES')) {
    return await interaction.reply({ content: t('commands:publish.cannotSend'), ephemeral: true })
  }

  const announcement = await Announcement.findById(id).exec().catch(() => {})
  if (!announcement) return await interaction.reply({ content: t('commands:publish.announcementNotFound'), ephemeral: true })
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
          customId: translation._id?.toString(),
          label: iso.getNativeName(translation.lang),
          style: 'PRIMARY'
        })
      }))
    await channel.send({ components: [buttons], embeds: [embed] })
  } else {
    await channel.send({ embeds: [embed] })
  }

  await Announcement.findByIdAndUpdate(id, { published: true }).exec()
  await interaction.reply({ content: t('commands:publish.done'), ephemeral: true })
}

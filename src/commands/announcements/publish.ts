import { Subcommand } from '@sapphire/plugin-subcommands'
import { HexColorString, MessageActionRow, MessageButton, MessageEmbed, TextChannel } from 'discord.js'
import iso from 'iso-639-1'
import ow from 'ow'
import { Announcement } from '../../schemas/Announcement'
import { validateChatInput } from '../../utils/validateOptions'

const Schema = ow.object.exactShape({
  // eslint-disable-next-line sort/object-properties
  name: ow.string,
  channel: ow.object.instanceOf(TextChannel)
})

export async function publish (interaction: Subcommand.ChatInputInteraction) {
  const client = interaction.client
  if (!client.isReady()) return
  const options = await validateChatInput(interaction, Schema)
  if (!options) return
  const { channel: _, name: id, t } = options
  // todo: implement a better workaround
  const channel = _ as TextChannel

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
          // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/no-non-null-assertion
          customId: translation._id!.toString(),
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

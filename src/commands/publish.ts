import { CommandInteraction, MessageActionRow, MessageButton, MessageEmbed, TextBasedChannel, DMChannel, PartialDMChannel, HexColorString } from 'discord.js'
import { Announcement } from '../schemas/Announcement'
import Client from '../structures/Client'
import iso from 'iso-639-1'

export default async function run (client: Client, interaction: CommandInteraction) {
  const id = interaction.options.getString('name')

  // @ts-expect-error
  const channel: Exclude<Exclude<TextBasedChannel, DMChannel>, PartialDMChannel> = interaction.options.getChannel('channel', true)
  if (!channel.permissionsFor(interaction.user.id)?.has('SEND_MESSAGES')) {
    return await interaction.reply({ content: '❌ No tienes permiso para enviar mensajes en ese canal.', ephemeral: true })
  }
  if (!channel.permissionsFor(client.user!.id)?.has('SEND_MESSAGES')) {
    return await interaction.reply({ content: '❌ No puedo enviar mensajes en ese canal.', ephemeral: true })
  }

  const announcement = await Announcement.findById(id).exec().catch(() => {})
  if (announcement == null) return await interaction.reply({ content: '❌ No se ha encontrado el anuncio.', ephemeral: true })
  const haveTranslations = announcement?.translations.length > 0

  const embed = new MessageEmbed()
    .setColor(announcement.color as HexColorString ?? 'BLURPLE')

  if (announcement.title) embed.setTitle(announcement.title)
  if (announcement.description) embed.setDescription(announcement.description)

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
  interaction.reply({ content: '✅ El anuncio fue publicado.', ephemeral: true })
}

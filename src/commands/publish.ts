import { CommandInteraction, MessageActionRow, MessageButton, MessageEmbed, TextChannel } from 'discord.js'
import Announcement from '../schemas/Announcement'
import Client from '../structures/Client'
import iso from 'iso-639-1'

export default async function run (client: Client, interaction: CommandInteraction): Promise<void> {
  const name = interaction.options.getString('name')

  if (name == null) return
  const channel: TextChannel = interaction.options.getChannel('channel') as any
  const announcement = await Announcement.findOne({ name }).exec()
  if (announcement == null) return

  const embed = new MessageEmbed()
    .setColor(announcement.color)

  if (announcement.title != null) embed.setTitle(announcement.title)
  if (announcement.description != null) embed.setDescription(announcement.description)

  console.log(announcement)

  const buttons = new MessageActionRow()
    .addComponents(announcement.translations.map(translation => {
      return new MessageButton({
        label: iso.getNativeName(translation.lang),
        customId: translation._id?.toString() ?? '',
        style: 'PRIMARY'
        // emoji: countryCodeEmoji(translation.lang)
      })
    })
    )
  await channel.send({ embeds: [embed], components: [buttons] })

  await interaction.reply({ content: 'El anuncio fue publicado', ephemeral: true })
}

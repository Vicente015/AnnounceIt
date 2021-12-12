import { CommandInteraction, MessageActionRow, MessageButton, MessageEmbed, TextChannel } from 'discord.js'
import Announcement from '../schemas/Announcement'
import Client from '../structures/Client'
// import {countryCodeEmoji} from 'country-code-emoji'
import iso from 'iso-639-1'

export default async function run (client: Client, interaction: CommandInteraction) {
  const name = interaction.options.getString('name')
  // @ts-expect-error
  const channel: TextChannel = interaction.options.getChannel('channel')
  const announcement = await Announcement.findOne({ name }).exec()

  const embed = new MessageEmbed()
    .setColor(announcement.color)

  if (announcement.title) embed.setTitle(announcement.title)
  if (announcement.description) embed.setDescription(announcement.description)

  console.log(announcement)

  const buttons = new MessageActionRow()
    .addComponents(announcement.translations.map(translation => {
      return new MessageButton({
        label: iso.getNativeName(translation.lang),
        customId: translation._id.toString(),
        style: 'PRIMARY'
        // emoji: countryCodeEmoji(translation.lang)
      })
    })
    )
  await channel.send({ embeds: [embed], components: [buttons] })

  interaction.reply({ content: 'El anuncio fue publicado', ephemeral: true })
}

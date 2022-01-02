import { CommandInteraction, MessageActionRow, MessageButton, MessageEmbed, TextChannel } from 'discord.js'
import Announcement from '../schemas/Announcement'
import Client from '../structures/Client'
// import {countryCodeEmoji} from 'country-code-emoji'
import iso from 'iso-639-1'

export default async function run (client: Client, interaction: CommandInteraction) {
  const id = interaction.options.getString('name')

  // @ts-expect-error
  const channel: TextChannel = interaction.options.getChannel('channel')
  const announcement = await Announcement.findById(id).exec()
  let haveTranslations = announcement.translations.length > 0

  const embed = new MessageEmbed()
    .setColor(announcement.color ?? 'BLURPLE')

  if (announcement.title) embed.setTitle(announcement.title)
  if (announcement.description) embed.setDescription(announcement.description)

  const buttons = haveTranslations
    ? new MessageActionRow()
      .addComponents(announcement.translations.map(translation => {
        return new MessageButton({
          label: iso.getNativeName(translation.lang),
          customId: translation._id.toString(),
          style: 'PRIMARY'
        })
      }))
      : null
  
  haveTranslations
    ? await channel.send({ embeds: [embed], components: [buttons] })
    : await channel.send({ embeds: [embed], })
  await Announcement.findByIdAndUpdate(id, { published: true })

  interaction.reply({ content: 'El anuncio fue publicado', ephemeral: true })
}

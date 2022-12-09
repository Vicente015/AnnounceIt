import { EmbedLimits } from '@sapphire/discord-utilities'
import { Subcommand } from '@sapphire/plugin-subcommands'
import { colord, extend, getFormat } from 'colord'
import cmykPlugin from 'colord/plugins/cmyk'
import hwbPlugin from 'colord/plugins/hwb'
import labPlugin from 'colord/plugins/lab'
import lchPlugin from 'colord/plugins/lch'
import namesPlugin from 'colord/plugins/names'
import xyzPlugin from 'colord/plugins/xyz'
import ow from 'ow'
import { Announcement } from '../../schemas/Announcement'
import { validateOptions } from '../../utils/validateOptions'

extend([namesPlugin, cmykPlugin, hwbPlugin, labPlugin, lchPlugin, xyzPlugin])
const validColorTypes = new Set(['name', 'hex', 'rbg', 'hsl', 'hsv', 'hwb', 'xyz', 'lab', 'lch', 'cmyk'])
const isValidColorFormat = (color: string) => !!getFormat(color) && validColorTypes.has(getFormat(color) ?? '')

const Schema = ow.object.exactShape({
  // eslint-disable-next-line sort/object-properties
  name: ow.string,
  title: ow.optional.string.maxLength(EmbedLimits.MaximumTitleLength).message(() => 'commands:add-translation.titleMaxLength'),
  footer: ow.optional.string.maxLength(EmbedLimits.MaximumFooterLength).message(() => 'commands:add-translation.footerMaxLength'),
  url: ow.optional.string.url.message(() => 'commands:add-translation.urlNotValid'),
  color: ow.optional.string.validate((string) => ({
    message: () => 'commands:add.notValidColor',
    validator: isValidColorFormat(string)
  }))
})
export async function add (interaction: Subcommand.ChatInputInteraction) {
  const options = await validateOptions(interaction, Schema)
  if (!options) return
  let { color, footer, name, t, title, url } = options
  color &&= colord(color).toHex()

  await interaction.deferReply()

  const botMessage = await interaction.channel?.send(t('commands:add-translation.sendAnnouncementDescription'))
  const messageCollector = await interaction.channel?.awaitMessages({
    filter: (message) => message.author.id === interaction.user.id,
    max: 1,
    // 14 minutes
    time: 840 * 1000
  })
  const description = messageCollector.first()?.content
  if (botMessage?.deletable) await botMessage.delete()
  if (!description) return await interaction.editReply(t('commands:add-translation.descriptionNotSended'))
  if (description.length > EmbedLimits.MaximumDescriptionLength) return await interaction.editReply(t('commands:add-translation.descriptionMaxLength'))

  const announcement = new Announcement({
    color,
    description,
    footer,
    guildId: interaction.guildId,
    name,
    title,
    url
  })
  await announcement.save()
  await interaction.editReply(t('commands:add.done'))
}

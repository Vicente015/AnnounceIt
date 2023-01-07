import { fetchT } from '@sapphire/plugin-i18next'
import { Subcommand } from '@sapphire/plugin-subcommands'
import { ColorResolvable } from 'discord.js'
import ow from 'ow'
import { Pagination } from 'pagination.djs'
import config from '../../../config.json'
import { Announcement } from '../../schemas/Announcement'
import { reply } from '../../utils/reply'
import { validateChatInput } from '../../utils/validateOptions'

const schema = ow.object.exactShape({
  only_published: ow.optional.boolean
})

export async function list (interaction: Subcommand.ChatInputInteraction<'cached'>) {
  const validatedOptions = await validateChatInput(interaction, schema)
  const options = validatedOptions ?? { only_published: undefined }
  const t = await fetchT(interaction)
  const showPublished = !!options.only_published

  const filter = () => showPublished ? { guildId: interaction.guildId, published: true } : { guildId: interaction.guildId }
  const announcements = await Announcement.find(() => filter()).exec()
  if (announcements.length === 0) return await reply(interaction, { content: t('commands:list.notAnnouncements'), type: 'negative' })

  const pagination = new Pagination(interaction, {
    idle: 15_000,
    limit: 4,
    loop: true
  })
    .addFields(
      announcements.map((announcement) => ({
        name: `#${announcement.name}`,
        value: t('commands:list.listValue', {
          color: announcement.color ? t('commands:list.color', { color: announcement.color }) : '',
          published: announcement.published ? '<:checkon:845742325886877726>' : '<:checkoff:845742325975613480>',
          title: announcement.title ?? announcement.name
        })
      }))
    )
    .setColor(config.colors.neutral as ColorResolvable)

  await pagination.render()
}

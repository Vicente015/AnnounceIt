import { applyDescriptionLocalizedBuilder, applyLocalizedBuilder } from '@sapphire/plugin-i18next'
import { Subcommand } from '@sapphire/plugin-subcommands'
import { Permissions } from 'discord.js'
import { TextBasedChannels } from '../../utils/Constants'
import { getCommandKeys, getOptionDescriptionKey } from '../../utils/getLocalizedKeys'
import { add } from './add'
import { addTranslation } from './addTranslation'
import { edit } from './edit'
import { list } from './list'
import { publish } from './publish'
import { remove } from './remove'

const requiredPermissions = new Permissions([Permissions.FLAGS.MANAGE_GUILD, Permissions.FLAGS.MANAGE_CHANNELS]).bitfield

export class UserCommand extends Subcommand {
  public addTranslation = addTranslation
  public add = add
  public publish = publish
  public list = list
  public remove = remove
  public edit = edit

  public constructor (context: Subcommand.Context, options: Subcommand.Options) {
    super(context, {
      ...options,
      requiredUserPermissions: requiredPermissions,

      subcommands: [
        { chatInputRun: 'add', name: 'add' },
        { chatInputRun: 'addTranslation', name: 'add-translation' },
        { chatInputRun: 'publish', name: 'publish' },
        { chatInputRun: 'list', name: 'list' },
        { chatInputRun: 'remove', name: 'remove' },
        { chatInputRun: 'edit', name: 'edit' }
      ]
    })
  }

  registerApplicationCommands (registry: Subcommand.Registry) {
    // todo: el register acepta objetos, transformar builders => objetos
    registry.registerChatInputCommand((command) =>
      applyLocalizedBuilder(command, ...getCommandKeys('announcements'))
        .setDMPermission(false)
        .setDefaultMemberPermissions(requiredPermissions)
        .addSubcommand((subcommand) =>
          applyLocalizedBuilder(subcommand, ...getCommandKeys(command.name, 'add'))
            .addStringOption((option) =>
              applyDescriptionLocalizedBuilder(option, getOptionDescriptionKey('name', command.name, subcommand.name))
                .setName('name')
                .setRequired(true)
                .setMaxLength(16)
            )
            .addStringOption((option) =>
              applyDescriptionLocalizedBuilder(option, getOptionDescriptionKey('image', command.name, subcommand.name))
                .setName('image')
                .setRequired(false)
            )
            .addStringOption((option) =>
              applyDescriptionLocalizedBuilder(option, getOptionDescriptionKey('thumbnail', command.name, subcommand.name))
                .setName('thumbnail')
                .setRequired(false)
            )
        )
        .addSubcommand((subcommand) =>
          applyLocalizedBuilder(subcommand, ...getCommandKeys(command.name, 'add-translation'))
            .addStringOption((option) =>
              applyDescriptionLocalizedBuilder(option, getOptionDescriptionKey('name', command.name, 'add'))
                .setName('name')
                .setRequired(true)
                .setAutocomplete(true)
            )
            .addStringOption((option) =>
              applyDescriptionLocalizedBuilder(option, getOptionDescriptionKey('lang', command.name, subcommand.name))
                .setName('lang')
                .setRequired(true)
                .setAutocomplete(true)
            )
            .addAttachmentOption((option) =>
              applyDescriptionLocalizedBuilder(option, getOptionDescriptionKey('image', command.name, 'add'))
                .setName('image')
                .setRequired(false)
            )
            .addAttachmentOption((option) =>
              applyDescriptionLocalizedBuilder(option, getOptionDescriptionKey('thumbnail', command.name, 'add'))
                .setName('thumbnail')
                .setRequired(false)
            )
        )
        .addSubcommand((subcommand) =>
          applyLocalizedBuilder(subcommand, ...getCommandKeys(command.name, 'publish'))
            .addStringOption((option) =>
              applyDescriptionLocalizedBuilder(option, getOptionDescriptionKey('name', command.name, 'add'))
                .setName('name')
                .setRequired(true)
                .setAutocomplete(true)
            )
            .addChannelOption((option) =>
              applyDescriptionLocalizedBuilder(option, getOptionDescriptionKey('channel', command.name, subcommand.name))
                .setName('channel')
                .setRequired(true)
                .addChannelTypes(...TextBasedChannels)
            )
        )
        .addSubcommand((subcommand) =>
          applyLocalizedBuilder(subcommand, ...getCommandKeys(command.name, 'list'))
            .addBooleanOption((option) =>
              applyDescriptionLocalizedBuilder(option, getOptionDescriptionKey('only_published', command.name, subcommand.name))
                .setName('only_published')
            )
        )
        .addSubcommand((subcommand) =>
          applyLocalizedBuilder(subcommand, ...getCommandKeys(command.name, 'remove'))
            .addStringOption((option) =>
              applyDescriptionLocalizedBuilder(option, getOptionDescriptionKey('name', command.name, 'add'))
                .setName('name')
                .setRequired(true)
                .setAutocomplete(true)
            )
        )
        .addSubcommand((subcommand) =>
          applyLocalizedBuilder(subcommand, ...getCommandKeys(command.name, 'edit'))
            .addStringOption((option) =>
              applyDescriptionLocalizedBuilder(option, getOptionDescriptionKey('name', command.name, 'add'))
                .setName('name')
                .setRequired(true)
                .setAutocomplete(true)
            )
            .addStringOption((option) =>
              applyDescriptionLocalizedBuilder(option, getOptionDescriptionKey('lang', command.name, 'add-translation'))
                .setName('lang')
                .setRequired(false)
                .setAutocomplete(true)
            )
        )
    )
  }
}

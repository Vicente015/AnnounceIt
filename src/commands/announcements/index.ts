
import { applyDescriptionLocalizedBuilder, applyLocalizedBuilder } from '@sapphire/plugin-i18next'
import { Subcommand } from '@sapphire/plugin-subcommands'
import { Permissions } from 'discord.js'
import { TextBasedChannels } from '../../utils/Constants'
import { getCommandKeys, getOptionDescriptionKey } from '../../utils/getLocalizedKeys'
import { add } from './add'
import { addTranslation } from './addTranslation'
import { list } from './list'
import { add as managersAdd } from './managers/add'
import { remove as managersRemove } from './managers/remove'
import { publish } from './publish'
import { remove } from './remove'

const requiredPermissions = new Permissions([Permissions.FLAGS.MANAGE_GUILD, Permissions.FLAGS.MANAGE_CHANNELS]).bitfield

export class UserCommand extends Subcommand {
  public addTranslation = addTranslation
  public add = add
  public publish = publish
  public list = list
  public remove = remove
  public managersAdd = managersAdd
  public managersRemove = managersRemove

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
        {
          entries: [
            { chatInputRun: 'managersAdd', name: 'add' },
            { chatInputRun: 'managersRemove', name: 'remove' }
          ],
          name: 'managers',
          type: 'group'
        }
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
            )
            /*
            .addStringOption((option) =>
              applyDescriptionLocalizedBuilder(option, getOptionDescriptionKey('title', command.name, subcommand.name))
                .setName('title')
            )
            .addStringOption((option) =>
              applyDescriptionLocalizedBuilder(option, getOptionDescriptionKey('color', command.name, subcommand.name))
                .setName('color')
            )
            .addStringOption((option) =>
              applyDescriptionLocalizedBuilder(option, getOptionDescriptionKey('footer', command.name, subcommand.name))
                .setName('footer')
            )
            .addStringOption((option) =>
              applyDescriptionLocalizedBuilder(option, getOptionDescriptionKey('url', command.name, subcommand.name))
                .setName('url')
            )
            */
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
            /*
            .addStringOption((option) =>
              applyDescriptionLocalizedBuilder(option, getOptionDescriptionKey('title', command.name, 'add'))
                .setName('title')
            )
            .addStringOption((option) =>
              applyDescriptionLocalizedBuilder(option, getOptionDescriptionKey('footer', command.name, 'add'))
                .setName('footer')
            )
            .addStringOption((option) =>
              applyDescriptionLocalizedBuilder(option, getOptionDescriptionKey('url', command.name, 'add'))
                .setName('url')
            )
            */
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
        .addSubcommandGroup((subcommandGroup) =>
          applyLocalizedBuilder(subcommandGroup, ...getCommandKeys(command.name, 'managers'))
            .addSubcommand((subcommand) =>
              applyLocalizedBuilder(subcommand, ...getCommandKeys(command.name, subcommandGroup.name, 'add'))
                .addRoleOption((option) =>
                  applyDescriptionLocalizedBuilder(option, getOptionDescriptionKey('role', command.name, subcommandGroup.name, subcommand.name))
                    .setName('role')
                    .setRequired(true)
                )
            )
            .addSubcommand((subcommand) =>
              applyLocalizedBuilder(subcommand, ...getCommandKeys(command.name, subcommandGroup.name, 'remove'))
                .addRoleOption((option) =>
                  applyDescriptionLocalizedBuilder(option, getOptionDescriptionKey('role', command.name, subcommandGroup.name, subcommand.name))
                    .setName('role')
                    .setRequired(true)
                )
            )
        )
    )
  }
}

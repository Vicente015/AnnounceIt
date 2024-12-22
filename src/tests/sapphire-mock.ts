/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Client, type ClientOptions, Events, Options } from 'discord.js'
import { assert } from 'node:console'
import nodePath from 'node:path'
import { vitest } from 'vitest'
import { createClient, login } from '../bot.js'
import { applyClientMocks } from './client-mock.js'
import { emitEvent } from './helpers.js'

// From https://github.com/AnswerOverflow/AnswerOverflow/blob/main/apps/discord-bot/test/sapphire-mock.ts
const defaultOverride: Partial<ClientOptions> = {
  // Cache everything is used to simulate API responses, removes the limit
  makeCache: Options.cacheEverything()
}

export function mockSapphireClient (override = defaultOverride) {
  const client = createClient(override)
  // eslint-disable-next-line unicorn/no-array-for-each
  client.stores.forEach((store) => {
    // replace the functionality of adding to the store to use a function that adds everything that doesn't include the /dist folder, along with that ignore any test files as those shouldn't be loaded
    // Add the typescript extensions to be able to be parsed
    // store.strategy.supportedExtensions.push('.ts', '.cts', '.mts', '.tsx')

    // Filter out type files
    // @ts-expect-error Type error
    store.strategy.filterDtsFiles = true

    // Add the source path to the store
    const processPath = process.cwd()
    store.paths.add(processPath + `/dist/src/${store.name}`)

    // @ts-expect-error Type error
    store.registerPath = (path) => {
      store.paths.add(path.toString())
    }

    store.strategy.filter = vitest.fn((filePath: string) => {
      // Retrieve the file extension.
      const extension = nodePath.extname(filePath)
      // @ts-expect-error Type error
      if (!store.strategy.supportedExtensions.includes(extension)) return null

      // @ts-expect-error Type error
      if (store.strategy.filterDtsFiles && filePath.endsWith('.d.ts'))
        return null

      if (filePath.includes('.test')) return null

      // Retrieve the name of the file, return null if empty.
      const name = nodePath.basename(filePath, extension)
      if (name === '') return null

      // Return the name and extension.
      return { extension, name, path: filePath }
    })
  })

  applyClientMocks(client)
  assert(client.user !== null, 'Client user is null')

  client.id = client.user!.id
  return client
}

export async function setupBot (autoLogin = true) {
  const client = mockSapphireClient()
  await login(client)
  if (autoLogin)
    await emitEvent(client, Events.ClientReady, client as Client<true>)
  return client
}

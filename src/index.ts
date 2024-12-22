import { createClient, login } from './bot.js'

const client = createClient()
// eslint-disable-next-line @typescript-eslint/no-floating-promises
login(client)

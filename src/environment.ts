import 'dotenv/config'
import { z } from 'zod'

const environmentVariables = z.object({
  MONGO_URI: z.string(),
  TOKEN: z.string()
})
environmentVariables.parse(process.env)

// ? https://nitter.it/mattpocockuk/status/1615110808219918352?s=20
declare global {
  // eslint-disable-next-line no-var
  var __MONGO_URI__: string
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line unicorn/prevent-abbreviations, @typescript-eslint/no-empty-interface
    interface ProcessEnv extends z.infer<typeof environmentVariables> { }
  }
}

import 'dotenv/config'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    mockReset: true
    // setupFiles: ['src/tests/setup-mongo-memory-server.ts']
  }
})

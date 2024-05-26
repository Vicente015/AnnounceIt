import './src/environment.js'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    mockReset: true
    // ... Specify options here.
  }
})

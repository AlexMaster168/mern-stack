import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    // Каждый файл поднимает свой mongodb-memory-server — гоняем последовательно,
    // чтобы воркеры не конфликтовали за скачивание/блокировку бинаря mongod
    fileParallelism: false,
    hookTimeout: 120_000,
    testTimeout: 20_000,
  },
})

import { defineConfig } from 'orval'

export default defineConfig({
  schoolApi: {
    input: './openapi.json',
    output: {
      mode: 'single',
      target: './src/api/school.ts',
      client: 'axios',
      override: {
        mutator: {
          path: './src/api/axios-instance.ts',
          name: 'customInstance',
        },
      },
    },
  },
})

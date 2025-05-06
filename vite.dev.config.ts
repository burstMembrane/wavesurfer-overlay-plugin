import type { UserConfig } from 'vite'
import path from 'path'

export default {
    root: 'examples',
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            'demoassets': path.resolve(__dirname, './examples/assets/')
        }
    }
} satisfies UserConfig 
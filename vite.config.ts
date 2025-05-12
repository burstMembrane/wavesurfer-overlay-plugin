import type { UserConfig } from 'vite'
import path from 'path'
import dts from 'vite-plugin-dts'
export default {
    plugins: [dts({ rollupTypes: false })],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        }
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, './src/index.ts'),
            name: 'OverlayPlugin',
            fileName: (format) => `overlay-plugin.${format}.js`
        },

    }
} satisfies UserConfig
import path from 'path'
import { fileURLToPath } from 'url'
import { build, loadConfigFromFile } from 'vite'
import { readdir } from 'fs/promises'

const __dirname = fileURLToPath(new URL('.', import.meta.url));

;(async () => {
    const atoms = await getDirectories(path.resolve(__dirname, '../atoms'));

    for (const atomName of atoms) {
        const configEnv = {
            mode: atomName, // TODO: stop misusing mode to build specific atom
            command: 'build',
            ssrBuild: false,
        }

        const configFile = await loadConfigFromFile(configEnv, path.resolve(__dirname, '../vite.config.js'));
        await build(configFile.config);
    }
})()

async function getDirectories(path) {
    const entries = await readdir(path, { withFileTypes: true })
    return entries.filter(entry => entry.isDirectory()).map(entry => entry.name);
}

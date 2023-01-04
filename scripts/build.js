import path from 'path'
import { fileURLToPath } from 'url'
import { build, loadConfigFromFile } from 'vite'
import { listDirectories } from './utils/fileSystem.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export async function buildAtoms(base = "/assets") {
    const atoms = await listDirectories(path.resolve(__dirname, '../src/atoms'));

    for (const atomName of atoms) {
        const configEnv = {
            mode: atomName, // TODO: stop misusing mode to build specific atom
            command: 'build',
            ssrBuild: false,
        }

        const configFile = await loadConfigFromFile(configEnv, path.resolve(__dirname, '../vite.config.js'));
        // configFile.config.base = base;
        await build(configFile.config);
    }
}

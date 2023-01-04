import path from 'path'
import esMain from 'es-main';
import { fileURLToPath } from 'url'
import { build, loadConfigFromFile } from 'vite'
import { listDirectories } from './utils/fileSystem.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

if (esMain(import.meta)) {
    // execute if script is run directly
    buildAtoms();
}

export async function buildAtoms(assetsPath = "") {
    const atoms = await listDirectories(path.resolve(__dirname, '../src/atoms'));

    for (const atomName of atoms) {
        const configEnv = {
            mode: atomName, // TODO: stop misusing mode to build specific atom
            command: 'build',
            ssrBuild: false,
        }

        process.env.ATOM_ASSETS_PATH = assetsPath;

        const configFile = await loadConfigFromFile(configEnv, path.resolve(__dirname, '../vite.config.js'));
        await build(configFile.config);
    }
}

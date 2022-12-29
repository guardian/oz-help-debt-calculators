import _ from 'lodash';
import { normalizePath } from 'vite';
import { readdir, readFile } from 'fs/promises';
import config from '../project.config.js';
import { resolve } from 'path';

export function testHarness(options = {}) {
    let root;

    const plugin =  {
        name: 'vite-plugin-testharness',
        apply: 'serve',
        
        configResolved(config) {
            root = config.root;
        },

        configureServer(server) {
            server.middlewares.use(async (req, res, next) => {
                const url = decodeURI(req.url);
                const path = normalizePath(url);
                // console.log('request for url', path);

                const pathComponents = path.split('/').slice(1);
                // console.log('path components', pathComponents);

                if (path === '/') {
                    let html = await plugin.load(path)
                    const transformed = await plugin.transform(html, path);
                    const result = await server.transformIndexHtml(url, transformed);
                    res.end(result);
                } else if (pathComponents[0] === 'atoms') {
                    console.log('requesting atom page');
                    return next();
                } else {
                    return next();
                }
            });
        },

        // resolveId(id) {
        //     console.log('resolve id', id);
        // },

        async load(id) {
            if (id === '/') {
                return sourceForIndex(root);
            }

            return null;
        },

        async transform(code, id) {
            if (id === '/') {
                const atomDirectories = await getDirectories(root);
                return _.template(code)({
                    atoms: atomDirectories,
                });
            }

            return code;
        },
    };

    return plugin;
}

async function sourceForIndex(root) {
    return readFile('./harness/_index.html', 'utf8');
}

// function sourceForBundle(bundle, atomName) {
//     const templateHTML = fs.readFileSync('./harness/dcr-interactive__immersive.html', 'utf8');

//     return template(templateHTML)({
//         title: config.title,
//         headline: config.placeholders.headline,
//         standfirst: config.placeholders.standfirst,
//         paragraphStyle: config.placeholders.paragraphBefore ? 'display: block;' : 'display: none;',
//         paragraphBefore: config.placeholders.paragraphBefore,
//         stylesheet: path.join('atoms', atomName, 'bundle.css'),
//         html: config.html,
//         js: path.join('atoms', atomName, 'bundle.js'),
//     })
// }

async function getDirectories(path) {
    const entries = await readdir(path, { withFileTypes: true })
    return entries.filter(entry => entry.isDirectory()).map(entry => entry.name);
}

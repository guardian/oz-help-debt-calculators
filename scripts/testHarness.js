import _ from 'lodash';
import { normalizePath } from 'vite';
import { readdir, readFile } from 'fs/promises';
import path from 'path';
import config from '../project.config.js';

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

                if (path === '/' || path.startsWith('/atoms/')) {
                    let html = await plugin.load(path)
                    const transformed = await plugin.transform(html, path);
                    const result = await server.transformIndexHtml(url, transformed);
                    res.end(result);
                } else {
                    return next();
                }
            });
        },

        async load(id) {
            if (id === '/') {
                return readFile('./harness/_index.html', 'utf8');
            } else if (id.startsWith('/atoms/')) {
                return readFile('./harness/dcr-interactive__immersive.html', 'utf8');
            }

            return null;
        },

        async transform(code, id) {
            if (id === '/') {
                const atomDirectories = await getDirectories(root);
                return _.template(code)({
                    atoms: atomDirectories,
                });
            } else if (id.startsWith('/atoms/')) {
                const atom = resolveAtom(id);

                return _.template(code)({
                    title: config.title,
                    headline: config.placeholders.headline,
                    standfirst: config.placeholders.standfirst,
                    paragraphStyle: config.placeholders.paragraphBefore ? 'display: block;' : 'display: none;',
                    paragraphBefore: config.placeholders.paragraphBefore,
                    stylesheet: './style.css',
                    html: config.html,
                    js: path.join(root, atom, 'main.js'),
                })
            }

            return code;
        },
    };

    return plugin;
}

function resolveAtom(id) {
    const pathComponents = id.split('/').slice(1);
    if (pathComponents[0] === 'atoms') {
        return pathComponents[1];
    }

    return null;
}

async function getDirectories(path) {
    const entries = await readdir(path, { withFileTypes: true })
    return entries.filter(entry => entry.isDirectory()).map(entry => entry.name);
}

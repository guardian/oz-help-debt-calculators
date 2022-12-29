import _ from 'lodash';
import { normalizePath } from 'vite';
import { readFile } from 'fs/promises';
import path from 'path';
import { listDirectories } from './utils/fileSystem.js';
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

                // console.log('request path', path);

                if (path === '/' || path.startsWith('/atoms/')) {
                    let html = await plugin.load(path)
                    if (!html) {
                        console.log('Could not find html for path', path);
                        return next();
                    }
                    const transformed = await plugin.transform(html, path);
                    const result = await server.transformIndexHtml(url, transformed);
                    res.end(result);
                } else {
                    return next();
                }
            });
        },

        async load(id) {
            let match;

            if (id === '/') {
                return readFile('./harness/index.html', 'utf8');
            } else if (id.match(/^\/atoms\/[^\/]+\/$/)) { // match '/atoms/{atom}/'
                return readFile('./harness/templates.html', 'utf8');
            } else if (match = id.match(/^\/atoms\/[^\/]+\/([^\/]+)\/$/)) { // match '/atoms/{atom}/{template}/'
                return readFile(`./harness/templates/${match[1]}.html`, 'utf8');
            }

            return null;
        },

        async transform(code, id) {
            if (id === '/') {
                const atomDirectories = await listDirectories(root);
                return _.template(code)({
                    atoms: atomDirectories,
                });
            } else if (id.match(/^\/atoms\/[^\/]+\/[^\/]+\/$/)) {
                const atom = resolveAtom(id);
                const mainHTML = await readFile(path.join(root, atom, 'main.html'), 'utf8');

                return _.template(code)({
                    title: config.title,
                    headline: config.placeholders.headline,
                    standfirst: config.placeholders.standfirst,
                    paragraphStyle: config.placeholders.paragraphBefore ? 'display: block;' : 'display: none;',
                    paragraphBefore: config.placeholders.paragraphBefore,
                    html: mainHTML,
                    js: path.join(root, atom, 'app.js'),
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


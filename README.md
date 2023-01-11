[![stability-beta](https://img.shields.io/badge/stability-beta-33bbff.svg)](https://github.com/mkenney/software-guides/blob/master/STABILITY-BADGES.md#beta)

## What is this?

This is an opinionated template for creating interactive atoms. It uses [Vite](https://vitejs.dev/) in combination with [Rollup](https://rollupjs.org/guide/en/) for a smooth development experience and fast builds.

* 💡 Instant local dev server start (no bundling required)
* ⚡️ Instant visual feedback through [Hot Module Replacement (HMR)](https://vitejs.dev/guide/features.html#hot-module-replacement)
* 🔧 Built-in support for [Svelte](https://svelte.dev/)
* 📝 Prerendering enabled by default
* 📦 Effortless deployment


## How to use the template

### Prerequisites
The template is compatible with Node 16+. You can install new versions of node using [NVM](https://github.com/nvm-sh/nvm#installing-and-updating). 

### Getting started

1. Click the "Use this template" button on this page to create a new repository.
2. Clone the repo 
3. Install dependencies: `npm install`

To start the dev server:
```
npm run dev
```

To build for production:
```
npm run build
```

Builds will be placed in the `/build` directory.

### Deployment

Fill out `project.config.js`:

```js
{
    "title": "Title of your interactive",
    "path": "year/month/unique-title"
}
```

To deploy to the Interactives S3 bucket you need AWS credentials for the Interactives account in your command line. You can get these from the Guardian's permissions manager system [Janus](https://janus.gutools.co.uk/). You need to be assigned these permissions and be on a Guardian network or VPN to see them on Janus. 

After installing the credentials:
```
npm run deploy
```

Running this task will output the url to be embedded in Composer.


To verify that deploy was picked up sucessfully:

```
npm run deploylog
```

## Project structure

The files that make up your interactive atom live in the `/src` directory. This is what a typical src directory looks like:

* `/assets`
* `/atoms`
* `/lib`

### Assets
The recommended place for putting any static assets (Images, JSON, etc.). These assets are shared between atoms and can be referenced using `__assetsPath__`. For example:

```html
<img src="__assetsPath__/guardian-logo.svg" alt="Guardian logo"/>
```
The __assetsPath__ string is automatically replaced with the correct path when running the dev server or building for production.  

### Atoms
Each directory in the `/atoms` folder represents a single interactive atom. To create a new atom, duplicate an existing atom and give it a descriptive name.

When embedding multiple atoms on the same Composer page, make sure you use unique CSS IDs for each atom in their respective `main.html` files.

```html
<div id="some-unique-id">
    {{ svelte }}
</div>
```

You will need to change this ID in `app.js` too.

```js
const app = new Atom({
    target: document.getElementById('some-unique-id'),
    hydrate: true,
    props: {},
});
```

### Lib
Source files that are shared by multiple atoms should be placed in the `/lib` folder. These files should be referenced using the `$lib` import alias. For example:

```js
import SharedComponent from "$lib/components/SharedComponent.svelte";
```

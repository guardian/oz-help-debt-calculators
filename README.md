[![stability-beta](https://img.shields.io/badge/stability-beta-33bbff.svg)](https://github.com/mkenney/software-guides/blob/master/STABILITY-BADGES.md#beta)

## What is this?

This is an opinionated template for creating interactive atoms. It uses [Vite](https://vitejs.dev/) in combination with [Rollup](https://rollupjs.org/guide/en/) for a smooth development experience and fast builds.

* 💡 Instant local dev server start (no bundling required)
* ⚡️ Instant visual feedback through [Hot Module Replacement (HMR)](https://vitejs.dev/guide/features.html#hot-module-replacement)
* 🔧 Built-in support for [Svelte](https://svelte.dev/)
* 📝 Prerendering enabled by default
* 📦 Effortless deployment


## How to use the template

### Prequisites
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

```
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

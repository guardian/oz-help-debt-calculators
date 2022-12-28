import sveltePreprocess from 'svelte-preprocess';

export default {
    preprocess: sveltePreprocess({
        scss: {
            includePaths: ['shared/styles'],
            prependData: '@import "mq.scss"; @import "fonts.scss";',
        },
    }),
};
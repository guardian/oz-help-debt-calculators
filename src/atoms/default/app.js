import './styles/main.scss';
import Atom from './Atom.svelte';

// enable this when creating an atom for the article template
// import '$lib/helpers/resizeFrame';

const app = new Atom({
	target: document.getElementById('gv-atom'),
	hydrate: true,
	props: {},
});

export default app;
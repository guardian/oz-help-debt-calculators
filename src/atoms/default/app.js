import './styles/main.scss';
import Atom from './Atom.svelte';

const app = new Atom({
	target: document.getElementById('gv-atom'),
	hydrate: true,
	props: {},
});

export default app;
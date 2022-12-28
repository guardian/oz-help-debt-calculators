<script>
	import Component from "./Component.svelte";
	import Shared from "shared/components/Shared.svelte";

	let count = 0;

	function increment() {
		count += 1;
	}
</script>

<div class="atom">
	<h1>Welcome to the Atom template. Start creating your project in Atom.svelte</h1>

	<p>Count: {count}</p>

	<button on:click={increment} >Increment</button>
</div>

<Component></Component>

<Shared></Shared>

<style lang="scss">
	.atom {
		h1 {
			@include f-headline();
			font-size: 30px;
			font-weight: bold;

			@include mq($until: tablet) {
				font-size: 20px;
			}
		}
	}
</style>

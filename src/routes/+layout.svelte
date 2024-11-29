<script>
	import '../app.css';
	let { children } = $props();
</script>

<main class="pt-5">
	{@render children()}
</main>
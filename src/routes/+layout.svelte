<script>
	import '../app.css'
	import { onMount } from 'svelte'
	import { globalPreview } from './state.svelte.js'

	let { children } = $props()

    let preview = $state(false)

	function setPreview(state) {
        globalPreview.state = state
        window.localStorage.setItem('previews', state)
    }

	onMount(() => {
        globalPreview.state = window.localStorage.getItem('previews') === 'true'
    })
</script>

<main>
	<div class="flex items-center gap-3 lg:gap-5 justify-between p-5">
		<nav class="flex gap-3 lg:gap-4 items-center">
			<a href="/" class="w-7 h-7 lg:w-8 lg:h-8 border border-white flex group rounded-lg lg:hover:bg-white" aria-label="Home">
				<svg class="w-1/2 lg:w-7/12 m-auto fill-white lg:group-hover:fill-primary" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><path d="M93.3,49.6L81.9,38.2l-2.7-2.7l-4.6-4.6L53.9,10.1c-2.1-2.1-5.6-2.1-7.7,0L25.3,30.9l-4.9,4.9l-2.4,2.4L6.7,49.6  c-2.2,2.2-2.2,5.9,0,8.1l0.1,0.1c2.2,2.2,5.9,2.2,8.1,0l3.2-3.2v30.9c0,3.3,2.7,6,6,6h12.1c2.3,0,4.2-1.6,4.6-3.8  c0.1-0.3,0.1-0.6,0.1-0.8V64.4h18.5v22.4c0,0.3,0,0.6,0.1,0.8c0.4,2.2,2.3,3.8,4.6,3.8H76c3.3,0,6-2.7,6-6V54.6l3.2,3.2  c2.2,2.2,5.9,2.2,8.1,0l0.1-0.1C95.6,55.5,95.6,51.8,93.3,49.6z"/></svg>
			</a>
			<a href="/?archive=1">Archive</a>
		</nav>
		<div class="text-sm lg:text-base max-lg:order-1">
			<button class="text-white no-styling" onclick={() => setPreview(globalPreview.state ? false : true)}>Auto preview: {globalPreview.state ? 'On' : 'Off'}</button>
		</div>
	</div>

	{@render children()}
</main>
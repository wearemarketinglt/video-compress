<script>
	import '../app.css'
	import { onMount } from 'svelte'
	import { globalPreview } from './state.svelte.js'

	let { children, data } = $props()

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
		<div class="flex items-center gap-4 text-sm lg:text-base">
			<button class="text-white no-styling" onclick={() => setPreview(globalPreview.state ? false : true)}>Auto preview: {globalPreview.state ? 'On' : 'Off'}</button>
			{#if data.user}
				<a href="/auth/logout" class="text-white">Logout</a>
			{:else}
				<a href="/auth/github" class="flex items-center gap-1.5 text-white">
					<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
						<path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.165c-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.3-5.467-1.332-5.467-5.93 0-1.31.468-2.382 1.236-3.222-.124-.303-.536-1.523.117-3.176 0 0 1.008-.322 3.3 1.23A11.51 11.51 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.655 1.653.243 2.873.12 3.176.77.84 1.235 1.911 1.235 3.222 0 4.61-2.807 5.625-5.48 5.92.432.372.816 1.102.816 2.222v3.293c0 .322.218.694.824.576C20.565 21.796 24 17.298 24 12c0-6.63-5.37-12-12-12z"/>
					</svg>
					Login
				</a>
			{/if}
		</div>
	</div>

	{@render children()}
</main>
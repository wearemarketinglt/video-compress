<script>
    import { deserialize, enhance } from '$app/forms'
    import { onMount } from 'svelte'
	// import { globalPreview } from './../stores.js'
	import { globalPreview } from './../state.svelte.js'
    import { formatDate } from '$lib'

    let { data, form } = $props()

    const { id, status } = data

    let selectedFile = $state(data.selectedFile)
    let compressing = $state(data.selectedFile?.compressing)
    let oldFileName = $state(data.selectedFile?.name)
    let escapePressed = $state(false)
    let compressForm = $state({})
    let name = $state(data.selectedFile?.name)
    let quality = $state(30)
    let keep_size = $state(true)
    let width = $state(data.selectedFile?.width)
    let height = $state(data.selectedFile?.height)

    let interval

    let preview = $state(false)

    $effect(() => {
        if (status === 200) {
            if (!data.selectedFile.compressing) {
                compressing = false
                selectedFile = data.selectedFile
                if(data.selectedFile.new_width) {
                    width = data.selectedFile.new_width !== data.selectedFile.width ? data.selectedFile.new_width : data.selectedFile.width
                }
                if(data.selectedFile.new_width) {
                    height = data.selectedFile.new_height !== data.selectedFile.height ? data.selectedFile.new_height : data.selectedFile.height
                }
                if(data.selectedFile.new_width && data.selectedFile.new_height) {
                    keep_size = data.selectedFile.new_width !== data.selectedFile.width || data.selectedFile.new_height !== data.selectedFile.height ? false : true
                }
            } else {
                // check every 2 seconds if the file is done compressing
                interval = setInterval(() => compressionStatus(id), 2000)
            }

            if (data.selectedFile.quality) {
                quality = data.selectedFile.quality
            }

            if (form?.rename) {
                name = form.rename.name
            }
        }
    })

    $effect(() => {
        if (globalPreview.state) {
            preview = globalPreview.state
        }
    })

    async function compressionStatus(id) {
        try {
            const response = await fetch(`/api/check/${id}`)
            if (!response.ok) {
                console.error(`Request failed with status ${response.status}`)
                return
            }

            const result = await response.json()

            if (!result.compressing) {
                clearInterval(interval)
                selectedFile = result.selectedFile
                compressing = false
            }
        } catch (error) {
            console.error('Error during polling:', error.message)
        }
    }

    function renameKeyboard(event) {
        if (event.key === 'Escape') {
            event.target.value = oldFileName
            event.target.blur()
            escapePressed = true
        } 
    }

    function renameFocus(event) {
        if (!escapePressed && event.target.value !== oldFileName) {
            // console.log('focusout oldname')
            event.target.value = oldFileName
        }
        escapePressed = false
    }

    function downloadFile(slug, poster = false) {
        const a = document.createElement('a')
        a.href = `/api/download/${slug}?poster=${poster}&w=${width}&q=${quality}`
        a.download = slug
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

    async function compressFile() {
        compressing = true

        const formData = new FormData()

        for (const [key, value] of Object.entries(compressForm)) {
            formData.append(key, value)
        }

        const res = await fetch(`/api/compress/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(compressForm)

        })
    }

    function handleSize() {
        setTimeout(() => {
            if (keep_size) {
                width = selectedFile.width
                height = selectedFile.height
            } else {
                height = Math.round(selectedFile.height * (width / selectedFile.width))
            }
        })
    }

    onMount(() => {
        setTimeout(() => {
            preview = globalPreview.state
        })
    })
</script>

<section class="px-5">
    {#if status == 200}
        <form 
            use:enhance 
            method="POST"
            action="/{id}?/rename"
            onsubmit={() => oldFileName = selectedFile.name}
        >
            <div class="flex items-center gap-1 group">
                <input 
                    bind:value={name}
                    onkeydown={(event) => renameKeyboard(event)}
                    onfocusout={() => renameFocus(event)}
                    name="name" 
                    type="text" required 
                    class="text-xl lg:text-2xl xl:text-3xl w-auto min-w-0 -translate-x-1 border-transparent border-white/[.2]"
                >
                <button type="submit" class="hidden">Save</button>
            </div>
        </form>
        {#if selectedFile.width && selectedFile.height}
            <div class="mt-1">
                <p>{selectedFile.width}x{selectedFile.height}px</p>
            </div>
        {/if}
        <div class="{selectedFile.processed || compressing ? 'mt-5' : ''}">
            {#if compressing}
                <p>Compressing<span>.</span><span class="animate-[compressing_.7s__linear_infinite]">.</span><span class="animate-[compressing_.7s__linear_infinite]" style="animation-delay:.1s">.</span>
                </p>
            {:else if selectedFile.processed}
                <div class="flex gap-2 flex-wrap">
                    <button onclick={() => downloadFile(selectedFile.uuid)} class="bg-green-400 border-green-400 text-sm">Download</button>
                    <button onclick={() => downloadFile(selectedFile.uuid, true)} class="bg-green-400 border-green-400 text-sm">Download poster</button>
                    <button onclick={() => preview = !preview} class="bg-green-400 border-green-400 text-sm">Preview</button>
                </div>
                <div class="mt-5">
                    <p class="text-sm">{selectedFile.size} MB | {selectedFile.new_width ? selectedFile.new_width : selectedFile.width}x{selectedFile.new_height ? selectedFile.new_height : selectedFile.height}px</p>
                    <p class="text-sm">Quality: {selectedFile.quality}</p>
                    {#if selectedFile.end_date}
                        <p class="text-sm">Last compressed at: {formatDate(selectedFile.end_date)}</p>
                    {/if}
                </div>
            {/if}
        </div>
        <form 
            bind:this={compressForm}
            method="POST"
            action="/{id}?/compress"
            use:enhance
            onsubmit={compressing = true}
        >
            <div class="mt-7 lg:mt-10">
                {#if selectedFile.processed}
                    <h3 class="text-xl lg:text-2xl xl:text-3xl">Redo</h3>
                {/if}
                <div class="mt-3">
                    <label>
                        Quality:
                        <input type="number" name="quality" required min="18" max="35" bind:value={quality} class="w-16 text-center">
                        <span class="text-sm">18 to 35 (lower number = better quality)</span>
                    </label>
                </div>
                <div class="mt-2">
                    <label class="flex items-center gap-1.5">
                        <input type="checkbox" name="noaudio" checked>
                        <span class="text-sm select-none">Remove audio</span>
                    </label>
                </div>
                <div>
                    <label class="flex items-center gap-1.5">
                        <input type="checkbox" name="keep_size" bind:checked={keep_size} oninput={() => handleSize()}>
                        <span class="text-sm select-none">Keep original size</span>
                    </label>
                </div>
                {#if !keep_size}
                    <div class="mt-3">
                        <label>
                            Width:
                            <input type="number" name="_width" required min="100" max={selectedFile.width} bind:value={width} class="w-16 text-center" oninput={() => handleSize() }>
                        </label>
                        <label>
                            Height:
                            <input type="number" name="_height" required min="100" max={selectedFile.height} bind:value={height} disabled class="w-16 text-center opacity-50 cursor-not-allowed">
                        </label>
                    </div>
                {/if}
                <input type="hidden" name="width" bind:value={width}>
                <input type="hidden" name="height" bind:value={height}>
                <button type="submit" class="bg-orange-400 border-orange-400 text-sm mt-5">Compress</button>
            </div>
        </form>
        {#if selectedFile.processed && !compressing && preview}
            <div class="mt-10 mb-5">
                <video controls autoplay muted loop playsinline class="max-w-full h-auto object-cover">
                    <source src="/api/download/{selectedFile.uuid}?preview=true&v={new Date(selectedFile.end_date).getTime()}" type="video/mp4">
                    <track kind="captions" src="" label="Captions" default>
                    Your browser does not support the video tag.
                </video>
            </div>
        {/if}
    {:else if status === 404}
        <div>
            <p>File not found</p>
        </div>
    {:else}
        <div>
            <p>Something went wrong, please try again later</p>
        </div>
    {/if}
</section>
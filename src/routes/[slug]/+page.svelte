<script>
    import { deserialize, enhance } from '$app/forms'
    import { onMount } from 'svelte'
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
    let globalPreview = $state(false)

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

    function setPreview(state) {
        if (state) {
            preview = true
        }
        globalPreview = state ? true : false
        window.localStorage.setItem('previews', state)
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
        globalPreview = window.localStorage.getItem('previews') === 'true'
        preview = globalPreview
    })
</script>

<div class="lg:absolute lg:top-5 lg:right-5 flex items-center gap-3 lg:gap-5 max-lg:px-5">
    <div class="text-sm lg:text-base max-lg:order-1">
        <button class="text-white no-styling" onclick={() => setPreview(globalPreview ? false : true)}>Auto preview: {globalPreview ? 'On' : 'Off'}</button>
    </div>
    <a href="/" class="w-8 h-8 lg:w-9 lg:h-9 button border border-white flex group lg:hover:bg-white" aria-label="Home">
        <svg class="w-full m-auto fill-white lg:group-hover:fill-primary" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><path d="M93.3,49.6L81.9,38.2l-2.7-2.7l-4.6-4.6L53.9,10.1c-2.1-2.1-5.6-2.1-7.7,0L25.3,30.9l-4.9,4.9l-2.4,2.4L6.7,49.6  c-2.2,2.2-2.2,5.9,0,8.1l0.1,0.1c2.2,2.2,5.9,2.2,8.1,0l3.2-3.2v30.9c0,3.3,2.7,6,6,6h12.1c2.3,0,4.2-1.6,4.6-3.8  c0.1-0.3,0.1-0.6,0.1-0.8V64.4h18.5v22.4c0,0.3,0,0.6,0.1,0.8c0.4,2.2,2.3,3.8,4.6,3.8H76c3.3,0,6-2.7,6-6V54.6l3.2,3.2  c2.2,2.2,5.9,2.2,8.1,0l0.1-0.1C95.6,55.5,95.6,51.8,93.3,49.6z"/></svg>
    </a>
</div>
<section class="px-5 max-lg:mt-5">
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
<script>
    import { deserialize, enhance } from '$app/forms'

    let { data, form } = $props()

    const { id, status } = data

    let compressing = $state(false)
    let oldFileName = $state(data.selectedFile?.name)
    let escapePressed = $state(false)
    let compressForm = $state({})
    let name = $state(data.selectedFile?.name)

    $effect(() => {
        if (status === 200) {
            compressing = false

            if (form?.rename) {
                name = form.rename.name
            }
        }
    })

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

    function downloadFile(slug, poster) {
        const a = document.createElement('a')
        a.href = `/api/download/${slug}${poster ? '?poster=true' : ''}`
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

        if (res.ok) {
            compressing = false
        }
    }
</script>


<section class="px-5">
    {#await data.selectedFile}
        <p>Loading ....</p>
    {:then selectedFile}
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
                        class="text-2xl xl:text-3xl w-auto min-w-0 -translate-x-1 border-transparent hover:border-white/[.2] focus:border-white/[.2]"
                    >
                    <button type="submit" class="hidden">Save</button>
                </div>
            </form>
            <div class="{selectedFile.processed || compressing ? 'mt-5 mb-10' : ''}">
                {#if compressing}
                    <p>Compressing<span>.</span><span class="animate-[compressing_.7s__linear_infinite]">.</span><span class="animate-[compressing_.7s__linear_infinite]" style="animation-delay:.1s">.</span>
                    </p>
                {:else if selectedFile.processed}
                    <div class="flex gap-2">
                        <button onclick={() => downloadFile(selectedFile.uuid)} class="bg-green-400 border-green-400 text-sm">Download</button>
                        <button onclick={() => downloadFile(selectedFile.uuid, true)} class="bg-green-400 border-green-400 text-sm">Download poster</button>
                    </div>
                    <div class="mt-5">
                        <p class="text-sm">Quality: {selectedFile.quality}</p>
                        <p class="text-sm">Compressed at: {selectedFile.processed_date}</p>
                    </div>
                {/if}
            </div>
            <form 
                bind:this={compressForm}
                method="POST"
                action="/{id}?/compress"
                use:enhance
                onsubmit={compressing =! compressing}
            >
                <div class="mt-5">
                    {#if selectedFile.processed}
                        <h3 class="text-2xl xl:text-3xl">Redo</h3>
                    {/if}
                    <div class="mt-3">
                        <label>
                            Quality:
                            <input type="number" name="quality" required min="20" max="35" value="30" class="w-16 text-center">
                            <span class="text-sm">From 20 to 35 (lower number = better quality)</span>
                        </label>
                    </div>
                    <div>
                        <label>
                            <input type="checkbox" name="noaudio" checked>
                            <span class="text-sm">No audio</span>
                        </label>
                    </div>
                    <button type="submit" class="bg-orange-400 border-orange-400 text-sm mt-5">Compress</button>
                </div>
            </form>
        {:else if status === 404}
            <div>
                <p>File not found</p>
            </div>
        {:else}
            <div>
                <p>Something went wrong, please try again later</p>
            </div>
        {/if}
    {/await}
</section>


<a href="/" class="w-8 h-8 lg:w-9 lg:h-9 absolute top-5 right-5 button border border-white flex group lg:hover:bg-white" aria-label="Home">
    <svg class="w-full m-auto fill-white lg:group-hover:fill-primary" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><path d="M93.3,49.6L81.9,38.2l-2.7-2.7l-4.6-4.6L53.9,10.1c-2.1-2.1-5.6-2.1-7.7,0L25.3,30.9l-4.9,4.9l-2.4,2.4L6.7,49.6  c-2.2,2.2-2.2,5.9,0,8.1l0.1,0.1c2.2,2.2,5.9,2.2,8.1,0l3.2-3.2v30.9c0,3.3,2.7,6,6,6h12.1c2.3,0,4.2-1.6,4.6-3.8  c0.1-0.3,0.1-0.6,0.1-0.8V64.4h18.5v22.4c0,0.3,0,0.6,0.1,0.8c0.4,2.2,2.3,3.8,4.6,3.8H76c3.3,0,6-2.7,6-6V54.6l3.2,3.2  c2.2,2.2,5.9,2.2,8.1,0l0.1-0.1C95.6,55.5,95.6,51.8,93.3,49.6z"/></svg>
</a>
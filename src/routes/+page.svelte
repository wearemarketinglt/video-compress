<script>
    import { enhance } from '$app/forms'
    import { goto } from '$app/navigation'
    import { PUBLIC_BODY_SIZE_LIMIT } from '$env/static/public'

    let { data } = $props()

    let file
    let progress = $state(0)
    let uploadMessage = $state('')

    async function uploadFile(event) {
        event.preventDefault()
        if (!file) return

        if (file.files[0].size > PUBLIC_BODY_SIZE_LIMIT) {
            uploadMessage = `File size exceeds the limit of ${(PUBLIC_BODY_SIZE_LIMIT / 1024 / 1024).toFixed(1)}MB`
            return
        }

        progress = 0
        uploadMessage = ''

        const formData = new FormData()

        formData.append('file', file.files[0])

        const xhr = new XMLHttpRequest()
        xhr.open('POST', '?/upload', true)

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                progress = Math.round((event.loaded / event.total) * 100)
            }
        }

        xhr.onload = () => {
            if (xhr.status === 200) {
                const location = JSON.parse(xhr.responseText).location

                goto(location)
            } else {
                uploadMessage = `Upload failed: ${xhr.statusText}`
            }
        }

        xhr.onerror = () => {
            uploadMessage = 'An error occurred during upload.'
        }

        xhr.send(formData)
    }
</script>


<section>
    {#await data.files}
        <p class="px-5">Loading...</p>
    {:then files}
    <div class="row">
        <div class="grid grid-cols-3 gap-4 px-5 py-2 border-b border-white/[.2] text-sm lg:text-base">
            <div>Name</div>
            <div>Expires</div>
            <div>Actions</div>
        </div>
        {#if files.length === 0}
            <p class="py-2.5 px-5">No files found</p>
        {:else}
            {#each files as file, i}
                <form method="POST" use:enhance class="grid grid-cols-3 gap-4 items-center px-5 py-2.5 border-b border-white/[.2] text-sm lg:text-base">
                    <div>{file.name}</div>
                    <div>{file.expiry_date}</div>
                    <div class="flex gap-2 items-center">
                        <input type="hidden" name="uuid" value="{file.uuid}">
                        <a href="/{file.uuid}" class="button text-xs bg-green-400 border-green-400">View</a>
                        <button formaction="?/extend" type="submit" class="bg-orange-400 border-orange-400 text-xs max-lg:hidden">Extend</button>
                        <button formaction="?/delete" type="submit" class="border-0 p-0 lg:hover:bg-transparent" aria-label="Delete">
                            <svg class="w-5 h-auto fill-white" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="-5.0 -10.0 110.0 135.0">
                                <path d="m66.227 94.266h-32.07c-2.9062 0.003906-5.6836-1.1875-7.6836-3.2891-1.9727-2.1016-3.1758-4.8047-3.4141-7.6758l-5.1367-55.109c-0.058594-0.82031 0.54688-1.5391 1.3672-1.6172 0.82031-0.074219 1.5469 0.51953 1.6406 1.3359l5.1328 55.113c0.44141 4.7656 3.8438 8.2227 8.0898 8.2227h32.07c4.2461 0 7.6484-3.4609 8.0898-8.2227l5.1406-55.113c0.09375-0.81641 0.82031-1.4102 1.6406-1.3359 0.82031 0.078125 1.4258 0.79688 1.3672 1.6172l-5.1406 55.113c-0.27344 2.9453-1.4844 5.6641-3.4141 7.6719-2 2.1016-4.7773 3.293-7.6797 3.2891z"/>
                                <path d="m84.422 29.562h-68.465c-0.83203-0.003906-1.5039-0.67969-1.5039-1.5117v-6.4453c0.003906-4.3945 3.5664-7.9531 7.9609-7.957h55.555c4.3945 0 7.9609 3.5586 7.9688 7.9531v6.4453c0 0.40234-0.15625 0.78516-0.44141 1.0703-0.28516 0.28516-0.67188 0.44531-1.0742 0.44531zm-66.953-3.0234h65.445v-4.9414c-0.003906-2.7266-2.2148-4.9375-4.9453-4.9414h-55.562c-2.7266 0.003906-4.9375 2.2148-4.9375 4.9453z"/>
                                <path d="m39.859 81.023c-0.74609 0-1.3828-0.55078-1.4922-1.2891l-5.0547-34.508c-0.12109-0.82422 0.44922-1.5898 1.2734-1.7109 0.82812-0.12109 1.5938 0.44922 1.7148 1.2734l5.0547 34.508c0.058593 0.39453-0.042969 0.79688-0.28125 1.1211-0.23828 0.32031-0.59766 0.53125-0.99219 0.58984-0.074219 0.011719-0.14844 0.015626-0.22266 0.015626z"/>
                                <path d="m50.195 81.023c-0.39844 0-0.78516-0.16016-1.0664-0.44141-0.28516-0.28516-0.44531-0.66797-0.44141-1.0664v-34.508c0-0.83203 0.67578-1.5078 1.5078-1.5078 0.83203 0 1.5078 0.67578 1.5078 1.5078v34.508c0.003906 0.39844-0.15625 0.78125-0.44141 1.0664-0.28125 0.28125-0.66797 0.44141-1.0664 0.44141z"/>
                                <path d="m60.523 81.023c-0.074219 0-0.14844-0.007813-0.21875-0.015626-0.39844-0.058593-0.75391-0.27344-0.99609-0.59375-0.23828-0.32031-0.33984-0.72266-0.28125-1.1172 1.6484-11.289 3.3008-22.574 4.957-33.859l0.09375-0.64453v-0.003907c0.046875-0.40234 0.25781-0.77344 0.58203-1.0195 0.32031-0.25 0.73438-0.35547 1.1367-0.29688s0.76562 0.27734 1.0039 0.60938 0.33594 0.74609 0.26562 1.1445l-0.09375 0.64453c-1.6523 11.289-3.3047 22.574-4.9531 33.859h-0.003906c-0.10938 0.74219-0.74219 1.293-1.4922 1.293z"/>
                                <path d="m65.781 16.656c-0.83203 0-1.5078-0.67578-1.5078-1.5078v-3.7188c0-1.1719-0.73828-2.207-1.582-2.207l-24.996-0.003906c-0.83984 0-1.582 1.0312-1.582 2.207v3.7227c0.015625 0.41016-0.13672 0.80859-0.42188 1.1016-0.28516 0.29688-0.67578 0.46094-1.0859 0.46094-0.41016 0-0.80469-0.16406-1.0859-0.46094-0.28516-0.29297-0.4375-0.69141-0.42578-1.1016v-3.7188c0-2.8828 2.0625-5.2266 4.6016-5.2266l25-0.003906c2.5391 0 4.6016 2.3438 4.6016 5.2266v3.7227c0 0.40234-0.16016 0.78516-0.44531 1.0703-0.28125 0.28125-0.66797 0.44141-1.0703 0.4375z"/>
                                <path d="m58.656 38.043h-16.93c-0.83203 0-1.5078-0.67578-1.5078-1.5117 0-0.83203 0.67578-1.5078 1.5078-1.5078h16.93c0.83594 0 1.5117 0.67578 1.5117 1.5078 0 0.83594-0.67578 1.5117-1.5117 1.5117z"/>
                            </svg>
                        </button>
                    </div>
                </form>
            {/each}
        {/if}
    </div>
    {:catch error}
        <p class="px-5">{error.message}</p>
    {/await}
</section>


<section class="px-5 mt-10">
    <div class="row">
        <h3 class="text-lg lg:text-xl xl:text-2xl">Upload from computer</h3>
    </div>
    <div class="row mt-5">
        <form 
            method="POST" 
            action="?/upload"
            enctype="multipart/form-data" 
            class="flex gap-3 items-center flex-wrap"
            onsubmit={uploadFile}
        >
            <input bind:this={file} type="file" name="file" accept=".mp4, .mov" required>
            <button type="submit" class="bg-green-400 border-green-400 text-sm select-none {progress > 0 ? 'pointer-events-none' : ''}">{progress > 0 ? progress+'%' : 'Upload'}</button>
        </form>
        {#if uploadMessage}
            <p class="mt-3">{uploadMessage}</p>
        {/if}
    </div>
</section>
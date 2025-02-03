import { existsSync, createReadStream } from 'fs'
import { resolve } from 'path'
import { eq } from 'drizzle-orm'
import { filesTable } from '$lib/server/db/schema'
import { db } from '$lib/server/db'

export async function GET({ url, params }) {
    const id = params.slug
    let path = `compressed/${id}`
    let poster = false

    let selectedFile = await db.select().from(filesTable).where(eq(filesTable.uuid, id))

    if (!selectedFile.length) {
        return new Response('File not found', { status: 404 })
    }

    selectedFile = selectedFile[0]

    let name = selectedFile.name

    if (name.endsWith('.mov')) {
        name = name.slice(0, -4) + '.mp4'
    }

    if (!name.endsWith('.mp4')) {
        name = `${selectedFile.name}.mp4`
    }

    if (url.searchParams.get('poster')) {
        poster = true
        path = `compressed/posters/${id}`
        name = `${selectedFile.name}.jpg`
    }

    const filePath = resolve(path)

    if (!existsSync(filePath)) {
        return new Response('File not found', { status: 404 })
    }

    const stream = createReadStream(filePath)

    return new Response(stream, {
        headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(name)}`,
        },
    })
}

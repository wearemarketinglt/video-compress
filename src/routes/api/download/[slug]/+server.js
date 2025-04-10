import { existsSync, createReadStream, statSync } from 'fs'
import { resolve } from 'path'
import { eq } from 'drizzle-orm'
import { filesTable } from '$lib/server/db/schema'
import { db } from '$lib/server/db'

export async function GET({ url, params }) {
    const id = params.slug
    let path = `compressed/${id}`
    let poster = url.searchParams.get('poster')
    let width = url.searchParams.get('w')
    let quality = url.searchParams.get('q')

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

    if (width && quality) {
        name = name.replace('.mp4', `-${url.searchParams.get('w')}w-q${quality}.mp4`)
    }

    if (poster === 'true') {
        path = `compressed/posters/${id}`
        name = `${selectedFile.name}.jpg`
    }

    const filePath = resolve(path)

    if (!existsSync(filePath)) {
        return new Response('File not found', { status: 404 })
    }

    const stream = createReadStream(filePath)

    if (url.searchParams.get('preview')) {
        const stats = statSync(filePath);
        return new Response(stream, {
            headers: {
                'Content-Type': 'video/mp4',
                'Accept-Ranges': 'bytes',
                'Content-Length': stats.size,
            },
        })
    }

    return new Response(stream, {
        headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(name)}`,
        },
    })
}

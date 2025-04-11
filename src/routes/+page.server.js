import { eq } from 'drizzle-orm'
import { redirect } from '@sveltejs/kit'
import { filesTable } from '$lib/server/db/schema'
import { db } from '$lib/server/db'
import { formatDate } from '$lib'
import fs from 'fs'
import ffmpeg from 'fluent-ffmpeg'

export const load = async ({url}) => {
    const isArchive = url.searchParams.get('archive') == 1
    const files = await db.select().from(filesTable)

    // filter files based on expiry_date
    const filteredFiles = files.filter(file => {
        if (isArchive) {
            return file.expiry_date && new Date(file.expiry_date) < new Date()
        }
        if (file.expiry_date ) {
            return new Date(file.expiry_date) > new Date()
        }
        return true
    })

    // sort by expiry_date
    filteredFiles.sort((a, b) => {
        return new Date(b.expiry_date) - new Date(a.expiry_date)
    })

    return {
       files: filteredFiles
    }
}

export const actions = {
    upload: async ({request}) => {
        const data = await request.formData()

        if (!data.has('file')) {
            throw new Error('No file uploaded')
        }

        const file = data.get('file')
        const file_name = file.name
        const format = file_name.split('.').pop()
        const uuid = crypto.randomUUID()
        const file_path = `uploads/${uuid}`

        if (!file || !file_name || !format) {
            throw new Error('Invalid file data provided')
        }
    
        fs.writeFileSync(file_path, Buffer.from(await file.arrayBuffer()))
    
        const metadata = await new Promise((resolve, reject) => {
            ffmpeg.ffprobe(file_path, (err, metadata) => {
                if (err) reject(err)
                resolve(metadata)
            })
        })
    
        const { streams } = metadata
        const videoStream = streams.find(stream => stream.codec_type === 'video')
        if (!videoStream || !videoStream.width || !videoStream.height) {
            throw new Error('Invalid metadata: Unable to retrieve dimensions')
        }
    
        const item = {
            name: file_name,
            format,
            width: videoStream.width,
            height: videoStream.height,
            uuid
        }
    
        await db.insert(filesTable).values(item)

        throw redirect(302, `/${uuid}`)
    },
    extend: async ({request}) => {
        const data = await request.formData()

        const uuid = data.get('uuid')

        if (!uuid || uuid.length === 0) {
            return
        }

        await db.update(filesTable).set({expiry_date: formatDate(new Date(), 1)}).where(eq(filesTable.uuid, uuid))
    },
	delete: async ({request}) => {
        const data = await request.formData()

        const uuid = data.get('uuid')

        if (!uuid || uuid.length === 0) {
            return
        }

        await db.delete(filesTable).where(eq(filesTable.uuid, uuid))

        const file_path = `uploads/${uuid}`
        const compressed_path = `compressed/${uuid}`
        const poster_path = `compressed/posters/${uuid}`

        if (fs.existsSync(file_path)) {
            fs.unlinkSync(file_path)
        }

        if (fs.existsSync(compressed_path)) {
            fs.unlinkSync(compressed_path)
        }

        if (fs.existsSync(poster_path)) {
            fs.unlinkSync(poster_path)
        }
    },
    view: async ({request}) => {
        const data = await request.formData()

        const uuid = data.get('uuid')

        if (!uuid || uuid.length === 0) {
            return
        }

        redirect(302, `/${uuid}`)
    }
}
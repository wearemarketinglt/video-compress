import fs from 'fs'
import ffmpeg from 'fluent-ffmpeg'

export async function POST({ request, params }) {
    const { slug } = params

    const data = await request.json()

    const input = `uploads/${slug}`
    const quality = data.quality || 30
    const noaudio = data.noaudio || false
    const codec = data.codec || 'libx264'
    const width = data.width || 1920
    const height = data.height || null
    const hls = data.hls || false
    const hlsChunkSize = data.hls_chunk_size || 2

    let output = `compressed/${slug}`

    if (codec === 'mjpeg') {
        output = `compressed/posters/${slug}`
    }

    if (!fs.existsSync('compressed')) {
        fs.mkdirSync('compressed')
    }

    if (!fs.existsSync('compressed/posters')) {
        fs.mkdirSync('compressed/posters')
    }

    await new Promise((resolve, reject) => {
        const ffmpegCommand = ffmpeg(input)

        if (noaudio) {
            ffmpegCommand.addOption(`${noaudio ? '-an' : ''}`);
        }
        
        if (width) {
            ffmpegCommand.size(`${width}x${height ? height : '?'}`);
        }

        ffmpegCommand
            .videoCodec(codec)
            .format(codec === 'mjpeg' ? 'image2' : 'mp4')
            .output(output)
            .outputOptions(
                codec === 'mjpeg' ?
                [
                  '-vframes 1',
                  '-q:v 3'
                ] :
                [
                `-crf ${quality}`,
                '-movflags frag_keyframe+empty_moov',
                '-movflags faststart',
                ...(hls ? [`-force_key_frames expr:gte(t,n_forced*${hlsChunkSize})`] : []),
                ]
            )
            .on('end', () => {
                resolve()
            })
            .on('error', (err) => {
                reject(err)
            })
            .run()
    }).catch(() => {
        return new Response('Compression failed', { status: 500 })
    })

    // If HLS is requested and this is not a poster/mjpeg encode, segment the compressed file
    if (hls && codec !== 'mjpeg') {
        const hlsDir = `compressed/hls/${slug}`

        if (!fs.existsSync('compressed/hls')) {
            fs.mkdirSync('compressed/hls')
        }

        if (fs.existsSync(hlsDir)) {
            fs.rmSync(hlsDir, { recursive: true, force: true })
        }

        fs.mkdirSync(hlsDir, { recursive: true })

        await new Promise((resolve, reject) => {
            ffmpeg(`compressed/${slug}`)
                .outputOptions([
                    '-codec: copy',
                    `-hls_time ${hlsChunkSize}`,
                    '-hls_list_size 0',
                    '-hls_segment_filename', `${hlsDir}/segment%03d.ts`,
                    '-f hls',
                ])
                .output(`${hlsDir}/index.m3u8`)
                .on('end', () => resolve())
                .on('error', (err) => reject(err))
                .run()
        }).catch((err) => {
            console.error('HLS segmentation failed:', err.message)
        })
    }

    return new Response('Compression finished', { status: 200 })
}

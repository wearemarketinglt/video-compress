import fs from 'fs'
import ffmpeg from 'fluent-ffmpeg'

export async function POST({ request, params }) {
    const { slug } = params

    const data = await request.json()

    const input = `uploads/${slug}`
    const quality = data.quality || 30
    const noaudio = data.noaudio || false
    const codec = data.codec || 'libx264'

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

    return new Promise((resolve, reject) => {
        const ffmpegCommand = ffmpeg(input)

        if (noaudio) {
            ffmpegCommand.addOption(`${noaudio ? '-an' : ''}`);
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
                ]
            )
            .on('progress', (progress) => {
                // console.log('Compression progress:', progress.percent)
            })
            .on('end', () => {
                // console.log('Compression finished')
                resolve(new Response('Compression finished', { status: 200 }))
            })
            .on('error', (err) => {
                // console.error('FFmpeg error:', err.message)
                reject(new Response('Compression failed', { status: 500 }))
            })
            .run()
    })
}

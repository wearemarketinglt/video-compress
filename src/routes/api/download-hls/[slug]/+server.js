import { existsSync } from 'fs'
import { resolve } from 'path'
import { eq } from 'drizzle-orm'
import { filesTable } from '$lib/server/db/schema'
import { db } from '$lib/server/db'
import archiver from 'archiver'
import { Readable } from 'stream'

function generatePlayerJs(videoFileName) {
    return `import Hls from 'hls.js';

// HLS Video Player
// Install hls.js first: npm install hls.js
// Then import and use this script in your bundler (Vite, webpack, etc.)

const video = document.getElementById('video');
const src = './index.m3u8';

if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(src);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play();
    });
} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    // Native HLS support (Safari / iOS)
    video.src = src;
    video.addEventListener('loadedmetadata', function () {
        video.play();
    });
} else {
    console.error('HLS is not supported in this browser.');
}
`
}

function generatePlayerHtml(videoFileName, hasPoster) {
    const posterAttr = hasPoster ? ' poster="./poster.jpg"' : ''
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HLS Player – ${videoFileName}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #111; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui, sans-serif; color: #eee; }
        h1 { margin-bottom: 1rem; font-size: 1rem; opacity: .6; }
        video { max-width: 100%; max-height: 90vh; border-radius: 8px; }
        .note { margin-top: 1rem; font-size: .75rem; opacity: .4; text-align: center; max-width: 480px; }
    </style>
</head>
<body>
    <h1>${videoFileName}</h1>
    <video id="video" autoplay loop muted playsinline${posterAttr}></video>
    <p class="note">
        Demo uses hls.js via CDN. For production use index.js with your bundler (npm install hls.js).
    </p>

    <!-- CDN version for quick demo. For production: npm install hls.js and use index.js -->
    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
    <script>
        var video = document.getElementById('video');
        var src = './index.m3u8';

        if (Hls.isSupported()) {
            var hls = new Hls();
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () { video.play(); });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            video.addEventListener('loadedmetadata', function () { video.play(); });
        }
    </script>
</body>
</html>
`
}

export async function GET({ params }) {
    const id = params.slug

    let selectedFile = await db.select().from(filesTable).where(eq(filesTable.uuid, id))

    if (!selectedFile.length) {
        return new Response('File not found', { status: 404 })
    }

    selectedFile = selectedFile[0]

    const hlsDir = resolve(`compressed/hls/${id}`)

    if (!existsSync(hlsDir)) {
        return new Response('HLS files not found. Re-compress with HLS enabled.', { status: 404 })
    }

    const videoFileName = selectedFile.name || id

    const posterPath = resolve(`compressed/posters/${id}`)
    const hasPoster = existsSync(posterPath)

    // Stream a zip archive
    const archive = archiver('zip', { zlib: { level: 6 } })

    archive.directory(hlsDir, false)
    if (hasPoster) {
        archive.file(posterPath, { name: 'poster.jpg' })
    }
    archive.append(generatePlayerJs(videoFileName), { name: 'index.js' })
    archive.append(generatePlayerHtml(videoFileName, hasPoster), { name: 'index.html' })
    archive.finalize()

    // Convert the Node.js stream to a Web ReadableStream
    const webStream = Readable.toWeb(archive)

    const zipName = `${videoFileName.replace(/\.[^/.]+$/, '')}-hls.zip`

    return new Response(webStream, {
        headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(zipName)}`,
        },
    })
}

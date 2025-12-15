const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Validation middleware
const validateYouTubeUrl = (url) => {
    const patterns = [
        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/,
        /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=[\w-]+/,
        /^https?:\/\/youtu\.be\/[\w-]+/
    ];
    return patterns.some(pattern => pattern.test(url));
};

// Download endpoint
app.post('/api/download', async (req, res) => {
    try {
        const { url, format, quality } = req.body;

        // Validate input
        if (!url || !format || !quality) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        if (!validateYouTubeUrl(url)) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        // Validate video info
        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
        
        // Get available formats
        let selectedFormat;
        if (format === 'mp4') {
            const videoFormats = ytdl.filterFormats(info.formats, 'videoandaudio');
            selectedFormat = videoFormats.find(f => 
                f.qualityLabel === `${quality}p` || 
                f.height === parseInt(quality)
            ) || videoFormats[0];
        } else {
            // For MP3, we'll convert the audio
            const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
            selectedFormat = audioFormat;
        }

        // Set headers for download
        res.header('Content-Disposition', `attachment; filename="${title}.${format}"`);
        
        if (format === 'mp4') {
            // Stream video directly
            ytdl(url, { format: selectedFormat })
                .pipe(res);
        } else {
            // For MP3, convert using ffmpeg
            const stream = ytdl(url, { format: selectedFormat });
            ffmpeg(stream)
                .audioBitrate(quality === '320' ? '320k' : quality === '256' ? '256k' : '128k')
                .format('mp3')
                .pipe(res, { end: true });
        }

    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ 
            error: 'Failed to process download',
            details: error.message 
        });
    }
});

// Get video info endpoint
app.post('/api/info', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!validateYouTubeUrl(url)) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        const info = await ytdl.getInfo(url);
        
        res.json({
            title: info.videoDetails.title,
            duration: info.videoDetails.lengthSeconds,
            thumbnail: info.videoDetails.thumbnails[0].url,
            formats: info.formats
                .filter(f => f.hasVideo || f.hasAudio)
                .map(f => ({
                    quality: f.qualityLabel || f.audioBitrate + 'kbps',
                    container: f.container,
                    hasVideo: f.hasVideo,
                    hasAudio: f.hasAudio
                }))
        });

    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch video info' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
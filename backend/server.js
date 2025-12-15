document.addEventListener('DOMContentLoaded', function() {
    const urlInput = document.getElementById('urlInput');
    const formatSelect = document.getElementById('formatSelect');
    const qualitySelect = document.getElementById('qualitySelect');
    const downloadBtn = document.getElementById('downloadBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const btnText = document.getElementById('btnText');
    const errorAlert = document.getElementById('errorAlert');
    const errorText = document.getElementById('errorText');
    const successAlert = document.getElementById('successAlert');
    const ytdl = require('ytdl-core');

    // Set your backend URL
    const API_URL = 'http://localhost:3000';

    // Download button handler - FIXED
    downloadBtn.addEventListener('click', async function() {
        const url = urlInput.value.trim();
        const format = formatSelect.value;
        const quality = qualitySelect.value;

        // Basic validation
        if (!url) {
            showError('Please enter a YouTube URL');
            return;
        }

        // Show loading state
        setLoading(true);
        hideAlerts();

        try {
            console.log('Sending download request...', { url, format, quality });
            
            // ✅ THIS IS THE FIXED PART - Using POST method
            const response = await fetch(`${API_URL}/api/download`, {
                method: 'POST',  // MUST be POST
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: url,
                    format: format,
                    quality: quality
                })
            });

            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            console.log('Server response:', data);

            // Show success
            showSuccess();
            
            // If the response has a download URL, trigger download
            if (data.data && data.data.downloadUrl) {
                const link = document.createElement('a');
                link.href = data.data.downloadUrl;
                link.download = data.data.filename || `download.${format}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

        } catch (error) {
            console.error('Download error:', error);
            showError(error.message || 'Failed to process download. Please try again.');
        } finally {
            setLoading(false);
        }
    });

    // UI helper functions
    function setLoading(isLoading) {
        downloadBtn.disabled = isLoading;
        if (isLoading) {
            loadingSpinner.style.display = 'inline-block';
            btnText.innerHTML = '<i class="bi bi-hourglass-split"></i> Processing...';
        } else {
            loadingSpinner.style.display = 'none';
            btnText.innerHTML = '<i class="bi bi-download"></i> Download';
        }
    }

    function showError(message) {
        errorText.textContent = message;
        errorAlert.classList.remove('d-none');
        errorAlert.classList.add('d-block');
        successAlert.classList.remove('d-block');
        successAlert.classList.add('d-none');
    }

    function showSuccess() {
        successAlert.classList.remove('d-none');
        successAlert.classList.add('d-block');
        errorAlert.classList.remove('d-block');
        errorAlert.classList.add('d-none');
    }

    function hideAlerts() {
        errorAlert.classList.remove('d-block');
        errorAlert.classList.add('d-none');
        successAlert.classList.remove('d-block');
        successAlert.classList.add('d-none');
    }
    // Update the POST endpoint
    app.post('/api/download', async (req, res) => {
    try {
        const { url, format, quality } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Validate YouTube URL
        if (!ytdl.validateURL(url)) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        // Get video info
        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
        
        console.log(`Download request: ${title} (${format}, ${quality})`);

        // For now, return mock download link
        res.json({
            success: true,
            message: 'Download ready!',
            data: {
                title: title,
                url: url,
                format: format,
                quality: quality,
                filename: `${title.substring(0, 50)}.${format}`,
                // In production, this would be a real file URL
                downloadUrl: '#',
                note: 'In production, this would trigger actual download'
            }
        });

    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ 
            error: 'Download failed',
            details: error.message 
        });
    }
    });
});

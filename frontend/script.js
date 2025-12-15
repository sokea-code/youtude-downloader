document.addEventListener('DOMContentLoaded', function() {
    const urlInput = document.getElementById('urlInput');
    const formatSelect = document.getElementById('formatSelect');
    const qualitySelect = document.getElementById('qualitySelect');
    const downloadBtn = document.getElementById('downloadBtn');
    const pasteBtn = document.getElementById('pasteBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const btnText = document.getElementById('btnText');
    const errorAlert = document.getElementById('errorAlert');
    const errorText = document.getElementById('errorText');
    const successAlert = document.getElementById('successAlert');

    // Paste from clipboard
    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            urlInput.value = text;
        } catch (err) {
            showError('Unable to paste from clipboard. Please paste manually.');
        }
    });

    // Update quality options based on format
    formatSelect.addEventListener('change', function() {
        const selectedFormat = this.value;
        const options = qualitySelect.querySelectorAll('option');
        
        options.forEach(option => {
            const optionFormat = option.getAttribute('data-format');
            if (optionFormat === selectedFormat || optionFormat === 'both') {
                option.style.display = 'block';
                option.disabled = false;
            } else {
                option.style.display = 'none';
                option.disabled = true;
            }
        });
        
        // Select first available option
        const availableOptions = Array.from(options).filter(opt => !opt.disabled);
        if (availableOptions.length > 0) {
            qualitySelect.value = availableOptions[0].value;
        }
    });

    // Initialize format selection
    formatSelect.dispatchEvent(new Event('change'));

    // Download button handler
    downloadBtn.addEventListener('click', async function() {
        const url = urlInput.value.trim();
        const format = formatSelect.value;
        const quality = qualitySelect.value;

        // Validate URL
        if (!isValidYouTubeUrl(url)) {
            showError('Please enter a valid YouTube URL');
            return;
        }

        // Show loading state
        setLoading(true);
        hideAlerts();

        try {
            // For demo purposes - in real implementation, this would call your backend
            const downloadUrl = await processDownload(url, format, quality);
            
            // Show success message
            showSuccess();
            
            // Create temporary download link
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `youtube_${Date.now()}.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Reset after 3 seconds
            setTimeout(() => {
                hideAlerts();
            }, 3000);
            
        } catch (error) {
            showError(error.message || 'Failed to process download. Please try again.');
        } finally {
            setLoading(false);
        }
    });

    // URL validation
    function isValidYouTubeUrl(url) {
        const patterns = [
            /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/,
            /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=[\w-]+/,
            /^https?:\/\/youtu\.be\/[\w-]+/
        ];
        return patterns.some(pattern => pattern.test(url));
    }

    // Simulate backend processing
    async function processDownload(url, format, quality) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate random errors for demo
                if (Math.random() < 0.1) { // 10% chance of error
                    reject(new Error('Network error. Please try again.'));
                    return;
                }
                
                // In real implementation, this would be your backend endpoint
                // For demo, we'll return a fake URL
                const fakeDownloadUrl = `data:text/plain;charset=utf-8,${encodeURIComponent(
                    `Download simulation: ${url} - ${format} - ${quality}`
                )}`;
                resolve(fakeDownloadUrl);
            }, 1500); // Simulate 1.5 second processing time
        });
    }

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

    // Clear error when user starts typing
    urlInput.addEventListener('input', hideAlerts);
});
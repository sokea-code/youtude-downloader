<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YouTube Media Downloader</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <style>
        .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .card-shadow {
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        .loading-spinner {
            display: none;
            width: 2rem;
            height: 2rem;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .disclaimer-box {
            background: #fff8e1;
            border-left: 4px solid #ffc107;
        }
        .format-icon {
            font-size: 1.5rem;
            margin-right: 10px;
        }
    </style>
</head>
<body>
    <div class="gradient-bg min-vh-100 py-5">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-12 col-md-10 col-lg-8">
                    <!-- Header -->
                    <div class="text-center mb-5">
                        <h1 class="text-white display-4 fw-bold mb-3">
                            <i class="bi bi-play-circle-fill"></i> YouTube Media Downloader
                        </h1>
                        <p class="text-white-50 lead">Download videos or audio from YouTube in various formats</p>
                    </div>

                    <!-- Main Card -->
                    <div class="card card-shadow border-0">
                        <div class="card-body p-4 p-md-5">
                            <!-- URL Input -->
                            <div class="mb-4">
                                <label for="urlInput" class="form-label fw-bold">
                                    <i class="bi bi-link-45deg"></i> YouTube URL
                                </label>
                                <div class="input-group">
                                    <input type="text" 
                                           class="form-control form-control-lg" 
                                           id="urlInput" 
                                           placeholder="Paste YouTube URL here..."
                                           aria-label="YouTube URL">
                                    <button class="btn btn-outline-secondary" type="button" id="pasteBtn">
                                        <i class="bi bi-clipboard"></i> Paste
                                    </button>
                                </div>
                                <div class="form-text">
                                    Example: https://www.youtube.com/watch?v=VIDEO_ID
                                </div>
                            </div>

                            <!-- Format Selection -->
                            <div class="row g-3 mb-4">
                                <div class="col-md-6">
                                    <label for="formatSelect" class="form-label fw-bold">
                                        <i class="bi bi-file-earmark"></i> Format
                                    </label>
                                    <select class="form-select" id="formatSelect">
                                        <option value="mp4">
                                            <i class="bi bi-file-play"></i> MP4 Video
                                        </option>
                                        <option value="mp3">
                                            <i class="bi bi-file-music"></i> MP3 Audio
                                        </option>
                                    </select>
                                </div>

                                <!-- Quality Selection -->
                                <div class="col-md-6">
                                    <label for="qualitySelect" class="form-label fw-bold">
                                        <i class="bi bi-hd"></i> Quality
                                    </label>
                                    <select class="form-select" id="qualitySelect">
                                        <!-- Video qualities -->
                                        <option value="1080" data-format="mp4">1080p HD</option>
                                        <option value="720" data-format="mp4" selected>720p HD</option>
                                        <option value="480" data-format="mp4">480p</option>
                                        <option value="360" data-format="mp4">360p</option>
                                        <!-- Audio qualities -->
                                        <option value="320" data-format="mp3">320 kbps (High)</option>
                                        <option value="256" data-format="mp3">256 kbps</option>
                                        <option value="128" data-format="mp3" data-format="mp3">128 kbps (Standard)</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Download Button -->
                            <div class="d-grid mb-4">
                                <button class="btn btn-primary btn-lg" id="downloadBtn">
                                    <span id="btnText">
                                        <i class="bi bi-download"></i> Download
                                    </span>
                                    <div class="loading-spinner d-inline-block ms-2" id="loadingSpinner"></div>
                                </button>
                            </div>

                            <!-- Error Alert -->
                            <div class="alert alert-danger d-none" id="errorAlert" role="alert">
                                <i class="bi bi-exclamation-triangle-fill"></i>
                                <span id="errorText"></span>
                            </div>

                            <!-- Success Message -->
                            <div class="alert alert-success d-none" id="successAlert" role="alert">
                                <i class="bi bi-check-circle-fill"></i>
                                <span>Download started! Your file will be available shortly.</span>
                            </div>

                            <!-- Disclaimer -->
                            <div class="disclaimer-box p-4 rounded mt-4">
                                <h5 class="fw-bold text-warning">
                                    <i class="bi bi-exclamation-triangle"></i> Important Disclaimer
                                </h5>
                                <p class="mb-0">
                                    <strong>Copyright Notice:</strong> This tool is for downloading content you own or have explicit permission to download. 
                                    Downloading copyrighted material without authorization may violate copyright laws and YouTube's Terms of Service. 
                                    You are solely responsible for ensuring you have the right to download any content.
                                </p>
                                <div class="mt-2">
                                    <small class="text-muted">
                                        <i class="bi bi-info-circle"></i> Respect content creators and their rights.
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="text-center mt-4">
                        <p class="text-white-50">
                            <small>
                                Supports YouTube videos only. Requires permission to download content.
                                <br>
                                <i class="bi bi-shield-check"></i> Secure • <i class="bi bi-lightning"></i> Fast • <i class="bi bi-phone"></i> Mobile Friendly
                            </small>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="script.js"></script>
</body>
</html>
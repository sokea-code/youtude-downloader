<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

function validateYouTubeUrl($url) {
    $patterns = [
        '/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/',
        '/^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=[\w-]+/',
        '/^https?:\/\/youtu\.be\/[\w-]+/'
    ];
    
    foreach ($patterns as $pattern) {
        if (preg_match($pattern, $url)) {
            return true;
        }
    }
    return false;
}

function sanitizeFilename($filename) {
    $filename = preg_replace('/[^\w\s.-]/', '', $filename);
    $filename = preg_replace('/\s+/', '_', $filename);
    return substr($filename, 0, 200);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['url']) || !isset($data['format']) || !isset($data['quality'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required parameters']);
        exit;
    }
    
    $url = trim($data['url']);
    $format = $data['format'];
    $quality = $data['quality'];
    
    if (!validateYouTubeUrl($url)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid YouTube URL']);
        exit;
    }
    
    // Note: In production, you would use youtube-dl or similar tools
    // This is a simplified example
    
    try {
        // For security, validate and sanitize the URL
        $videoId = '';
        if (preg_match('/v=([\w-]+)/', $url, $matches)) {
            $videoId = $matches[1];
        } elseif (preg_match('/youtu\.be\/([\w-]+)/', $url, $matches)) {
            $videoId = $matches[1];
        }
        
        if (empty($videoId)) {
            throw new Exception('Could not extract video ID');
        }
        
        // Simulate processing delay
        sleep(2);
        
        // In real implementation, you would:
        // 1. Use youtube-dl to get video info
        // 2. Download using appropriate format/quality
        // 3. Convert if needed (for MP3)
        // 4. Serve the file
        
        $response = [
            'status' => 'success',
            'message' => 'Download processed successfully',
            'data' => [
                'videoId' => $videoId,
                'format' => $format,
                'quality' => $quality,
                'downloadUrl' => '#', // Placeholder for actual download URL
                'filename' => 'video_' . $videoId . '.' . $format
            ]
        ];
        
        echo json_encode($response);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Processing failed: ' . $e->getMessage()]);
    }
    
    exit;
}

// For GET requests
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['url'])) {
    $url = $_GET['url'];
    
    if (!validateYouTubeUrl($url)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid YouTube URL']);
        exit;
    }
    
    // Return video information
    $response = [
        'status' => 'success',
        'message' => 'URL validated successfully',
        'valid' => true
    ];
    
    echo json_encode($response);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
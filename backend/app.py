from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import yt_dlp
import os
import re
from werkzeug.utils import secure_filename
import tempfile

app = Flask(__name__)
CORS(app)

def validate_youtube_url(url):
    patterns = [
        r'^(https?://)?(www\.)?(youtube\.com|youtu\.?be)/.+$',
        r'^https?://(?:www\.)?youtube\.com/watch\?v=[\w-]+',
        r'^https?://youtu\.be/[\w-]+'
    ]
    
    for pattern in patterns:
        if re.match(pattern, url):
            return True
    return False

@app.route('/api/download', methods=['POST'])
def download_video():
    try:
        data = request.get_json()
        
        if not data or 'url' not in data or 'format' not in data or 'quality' not in data:
            return jsonify({'error': 'Missing required parameters'}), 400
        
        url = data['url'].strip()
        format_type = data['format']
        quality = data['quality']
        
        if not validate_youtube_url(url):
            return jsonify({'error': 'Invalid YouTube URL'}), 400
        
        # YouTube DL options
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
        }
        
        if format_type == 'mp4':
            # Video download options
            ydl_opts['format'] = f'bestvideo[height<={quality}]+bestaudio/best[height<={quality}]'
            ydl_opts['merge_output_format'] = 'mp4'
        else:
            # Audio download options
            ydl_opts['format'] = 'bestaudio/best'
            ydl_opts['postprocessors'] = [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': quality,
            }]
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Get video info
            info = ydl.extract_info(url, download=False)
            title = info.get('title', 'video')
            
            # Create temp directory for download
            with tempfile.TemporaryDirectory() as temp_dir:
                ydl_opts['outtmpl'] = os.path.join(temp_dir, f'{title}.%(ext)s')
                
                # Download the video
                ydl.download([url])
                
                # Find the downloaded file
                for file in os.listdir(temp_dir):
                    if file.startswith(title):
                        file_path = os.path.join(temp_dir, file)
                        
                        # Return the file
                        return send_file(
                            file_path,
                            as_attachment=True,
                            download_name=secure_filename(file)
                        )
        
        return jsonify({'error': 'File not found after download'}), 500
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/info', methods=['POST'])
def get_video_info():
    try:
        data = request.get_json()
        
        if not data or 'url' not in data:
            return jsonify({'error': 'Missing URL parameter'}), 400
        
        url = data['url'].strip()
        
        if not validate_youtube_url(url):
            return jsonify({'error': 'Invalid YouTube URL'}), 400
        
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            response = {
                'title': info.get('title', 'Unknown'),
                'duration': info.get('duration', 0),
                'thumbnail': info.get('thumbnail', ''),
                'formats': []
            }
            
            # Get available formats
            for fmt in info.get('formats', []):
                if fmt.get('vcodec') != 'none' or fmt.get('acodec') != 'none':
                    format_info = {
                        'format_id': fmt.get('format_id'),
                        'ext': fmt.get('ext'),
                        'resolution': fmt.get('resolution', 'N/A'),
                        'fps': fmt.get('fps'),
                        'vcodec': fmt.get('vcodec'),
                        'acodec': fmt.get('acodec'),
                        'filesize': fmt.get('filesize'),
                        'quality': fmt.get('quality', 0)
                    }
                    response['formats'].append(format_info)
            
            return jsonify(response)
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'OK'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
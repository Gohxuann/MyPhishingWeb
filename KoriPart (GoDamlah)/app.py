from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
import os

# Initialize Flask app
app = Flask(__name__)

# Set up upload folder and allowed extensions
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'}  # Add other allowed extensions
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Function to check allowed file extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Handle file upload route
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"message": "No file part"}), 400
    
    file = request.files['file']

    # Check if the user actually selected a file
    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400
    
    # Check if the file is allowed
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Simulating a scan result (You can integrate a VirusTotal API here)
        scan_result = {
            'status': 'File uploaded and scanned successfully',
            'file_name': filename
        }
        
        return jsonify(scan_result)
    
    else:
        return jsonify({"message": "File type not allowed"}), 400

# Serve the frontend HTML, CSS, and JS files
@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

# Serve the main index.html
@app.route('/')
def index():
    return app.send_static_file('index.html')

# Run the app
if __name__ == '__main__':
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    app.run(debug=True)

from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
import os
import requests
from flask_cors import CORS
import logging
logging.basicConfig(level=logging.DEBUG)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

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


API_KEY_ABUSEIPDB ='540b085d3aeaaf314c12ae782b31c5b5ae1740db7466c5406bf33b2ab051a63276b540624d9b534e'

def report_phishing_ip(api_key, ip_address, categories, comment):
    url = 'https://www.abuseipdb.com/api/v2/report'
    headers = {
        'Accept': 'application/json',
        'Key': api_key
    }
    data = {
        'ip': ip_address,
        'categories': categories,
        'comment': comment
    }

    response = requests.post(url, headers=headers, data=data)
    return response


import json
import requests
import urllib

class IPQS:
    key = 'lvXQazJf24dVR1fbklb3cAI87KUPme5O'  # Replace with your actual IPQS API key
    def malicious_url_scanner_api(self, url: str, vars: dict = {}) -> dict:
        api_url = 'https://www.ipqualityscore.com/api/json/url/%s/%s' % (self.key, urllib.parse.quote_plus(url))
        response = requests.get(api_url, params=vars)
        return json.loads(response.text)

import logging
logging.basicConfig(level=logging.DEBUG)

@app.route('/report-ip', methods=['POST'])
def report_ip():
    data = request.get_json()
    ip_address = data.get('ip')

    if not ip_address:
        return jsonify({"error": "IP address or URL is required"}), 400

    # Initialize IPQS and check for maliciousness
    ipqs = IPQS()
    strictness = 0
    additional_params = {
        'strictness': strictness
    }

    try:
        ipqs_result = ipqs.malicious_url_scanner_api(ip_address, additional_params)
    except Exception as e:
        return jsonify({"error": f"Failed to analyze IP/URL with IPQS: {str(e)}"}), 500

    if 'success' not in ipqs_result or not ipqs_result['success']:
        return jsonify({"error": "IPQS API failed to process the request.", "details": ipqs_result}), 500

    # Check IPQS results
    malicious = ipqs_result.get('phishing') or ipqs_result.get('malware') or ipqs_result.get('risk_score', 0) > 85
    suspicious = ipqs_result.get('suspicious', False)

    # Prepare response for frontend
    response_message = {
        "ipqs_analysis": {
            "phishing": ipqs_result.get('phishing'),
            "malware": ipqs_result.get('malware'),
            "suspicious": suspicious,
            "risk_score": ipqs_result.get('risk_score'),
            "message": "IP/URL flagged as malicious or suspicious." if malicious else "IP/URL is safe."
        }
    }

    # If malicious, report to AbuseIPDB
    if malicious:
        categories = '14'  # Category for Phishing
        comment = 'Malicious IP detected via MyPhishfish and IPQS analysis.'

        try:
            abuseipdb_response = report_phishing_ip(API_KEY_ABUSEIPDB, ip_address, categories, comment)
            abuseipdb_result = abuseipdb_response.json()
        except Exception as e:
            return jsonify({"error": f"Failed to report IP to AbuseIPDB: {str(e)}"}), 500

        if abuseipdb_response.status_code == 200:
            response_message['abuseipdb_report'] = {
                "message": f"The IP address '{ip_address}' has been reported successfully.",
                "details": abuseipdb_result
            }
        elif abuseipdb_response.status_code == 403:
            # Handle 15-minute restriction error
            error_message = abuseipdb_result.get('errors', [{}])[0].get('detail', 'Failed to report IP address.')
            response_message['abuseipdb_report'] = {
                "error": error_message,
                "details": abuseipdb_result
            }
        elif abuseipdb_response.status_code == 429:
            # Handle Too Many Requests error
            response_message['abuseipdb_report'] = {
                "error": "Too many requests. You have exceeded AbuseIPDB's rate limit. Please try again later.",
                "details": abuseipdb_result
            }
        else:
            response_message['abuseipdb_report'] = {
                "error": f"Failed to report the IP address '{ip_address}' to AbuseIPDB.",
                "details": abuseipdb_result
            }

    return jsonify(response_message), 200


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

# **MyPhishFish - Real-Time Phishing Detection System**

## **Overview**  
MyPhishFish is an AI-driven phishing detection and educational platform. It provides real-time scanning of URLs, IP addresses, and files using trusted APIs like **VirusTotal**, **URLhaus**, and **AbuseIPDB**. The system incorporates the **Gemini LLM** to generate human-readable explanations and features an interactive quiz to educate users about cybersecurity.

---

## **System Requirements**  
- **Python**: 3.8+  
- **Flask**: Backend framework  
- **PHP Server**: For serving the frontend (e.g., PHP Server for VSCode)  
- **Browser**: Google Chrome (recommended)  

---

## **Setup and Run Instructions**

Follow the steps below to set up and run the MyPhishFish system:

### **1. Backend Setup**  
1. Open the **final folder** where the project files are located.  
2. Open a terminal or command prompt.  
3. Run the following command to start the backend server:  
   ```bash
   python virustotal_api.py
   ```
   - This starts the Flask server, which integrates with the VirusTotal, URLhaus, and AbuseIPDB APIs.
  
### **2. Frontend Setup**
1. Locate the `index.html` file in the project folder.
2. Right-click on the file in your code editor (like VSCode).
3. Choose the option:
   “PHP Server: Reload Server and Open in Browser”
4. The MyPhishFish interface will open in your default browser.

### **3. System Workflow**
- File Scanning: Upload a file to analyze and detect malware or malicious content.
- URL/IP Scanning: Input a URL or IP address to identify phishing threats.
- Gemini AI Explanation: View clear, AI-generated explanations for flagged results.
- Malware Quiz: Access an interactive 10-question quiz to improve cybersecurity knowledge.
- Real-Time Dashboard: Monitor live updates of file scans, URL scans, and IP scans.

---
## Troubleshooting

### Backend Issues
- Error: Flask server not starting.
 - Solution: Ensure Python and Flask are properly installed. Use the following to install Flask:
   ```
   pip install flask flask-cors requests
   ```
### Frontend Issues
- Error: PHP Server not running.
 - Solution: Install a PHP server extension (e.g., "PHP Server" in VSCode) and ensure the file is served locally.

---


## APIs Used
- VirusTotal API: For file and IP scanning.
- URLhaus API: For malicious URL detection.
- AbuseIPDB API: For IP address evaluation and reporting.
- Gemini LLM: For AI-generated human-readable explanations.

---

## File Structure
```
final/
│
├── backend/
│   └── virustotal_api.py     # Backend Flask server for handling API requests
│
├── frontend/
│   ├── index.html            # Main HTML page for the user interface
│   ├── style.css             # Styling for the frontend interface
│   ├── script.js             # JavaScript for managing frontend functionality
│   └── MyphishfishTriallogo.png  # Logo image for the project
│
├── chrome_extension/
│   ├── manifest.json         # Chrome extension configuration
│   ├── background.js         # Background script for Chrome extension URL monitoring
│   └── icon.png              # Extension icon
│
└── README.md                 # Documentation for setup and usage
```

---

## Contact
For queries or support, please contact:

Team MyPhishFish

Email: mylittlepony000101@gmail.com
Project: GoDamLah Hackathon Submission

## Contributors
- Team MyPhishFish
  - Koy Chang Wei
  - Kori
  - Lim Jia Shin
  - Lee Yung Jie
  - Goh Hong Xuan
 

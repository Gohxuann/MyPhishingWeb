const API_BASE_URL = "http://127.0.0.1:5000";
let ipMaliciousCount = 0;
let urlMaliciousCount = 0;
let fileMaliciousCount = 0;

// File upload
document.addEventListener("DOMContentLoaded", () => {
    // Event listener for file upload
    document.getElementById("uploadFileButton").addEventListener("click", uploadFile);

    // File upload function
    function uploadFile() {
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];
        const resultElement = document.getElementById('fileUploadResult');

        if (!file) {
            resultElement.textContent = "Please select a file to upload.";
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        fetch(`${API_BASE_URL}/api`, {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.malicious === 'yes') {
                    fileMaliciousCount += 1;
                }
                if (typeof data.result === 'string') {
                    // Replace \n with <br> and **bold** with <strong>
                    resultElement.innerHTML = data.result
                        .replace(/\n/g, '<br>')                    // Replace newlines with <br>
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Replace **text** with <strong>text</strong>
                } else {
                    // Format JSON data and replace formatting
                    resultElement.innerHTML = JSON.stringify(data, null, 2)
                        .replace(/\n/g, '<br>')                    // Replace newlines with <br>
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Replace **text** with <strong>text</strong>
                }
            })
            .catch(error => {
                resultElement.textContent = `Error: ${error}`;
                console.error("Upload Error:", error);
            });
    }
});


document.addEventListener("DOMContentLoaded", () => {
    // Function to show the correct page
    const showPage = (pageId) => {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');
    };

    // Navigation buttons
    document.getElementById("dashboardButton").addEventListener("click", () => showPage('dashboardPage'));
    document.getElementById("fileUploadButton").addEventListener("click", () => showPage('fileUploadPage'));
    document.getElementById("urlIpScanButton").addEventListener("click", () => showPage('urlIpScanPage'));
    document.getElementById("reportIpUrlButton").addEventListener("click", () => showPage('reportIpUrlPage'));
    document.getElementById("QuizPageButton").addEventListener("click", () => showPage('QuizPage'));

    // Toggle URL/IP Scanning sections
    document.getElementById("toggleUrlScan").addEventListener("click", () => {
        toggleSection('urlScanSection');
    });

    document.getElementById("toggleIpScan").addEventListener("click", () => {
        toggleSection('ipScanSection');
    });

    // Toggle Report IP/URL sections
    document.getElementById("toggleReportIp").addEventListener("click", () => {
        toggleSection('reportIpSection');
    });

    document.getElementById("toggleReportUrl").addEventListener("click", () => {
        toggleSection('reportUrlSection');
    });

    // URL Scanning
    document.getElementById("scanUrlButton").addEventListener("click", () => {
        const url = document.getElementById("urlInput").value.trim();
        const urlScanResult = document.getElementById("urlScanResult");

        if (url) {
            fetch(`${API_BASE_URL}/api?url=${encodeURIComponent(url)}`)
                .then(response => response.json())
                .then(data => {
                    if (data.malicious === 'yes') {
                        urlMaliciousCount += 1;
                    }
                    urlScanResult.innerHTML = data.result
                        .replace(/\n/g, '<br>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                })
                .catch(err => {
                    urlScanResult.textContent = "Error scanning URL.";
                    console.error(err);
                });
        } else {
            urlScanResult.textContent = "Please enter a valid URL.";
        }
    });

    // IP Scanning
    document.getElementById("scanIpButton").addEventListener("click", () => {
        const ip = document.getElementById("ipInput").value.trim();
        const ipScanResult = document.getElementById("ipScanResult");

        if (ip) {
            fetch(`${API_BASE_URL}/api?ip=${encodeURIComponent(ip)}`)
                .then(response => response.json())
                .then(data => {
                    if (data.malicious === 'yes') {
                        ipMaliciousCount += 1;
                    }
                    ipScanResult.innerHTML = data.result
                        .replace(/\n/g, '<br>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                })
                .catch(err => {
                    ipScanResult.textContent = "Error scanning IP.";
                    console.error(err);
                });
        } else {
            ipScanResult.textContent = "Please enter a valid IP.";
        }
    });

    // Report IP
    document.getElementById("reportIpButton").addEventListener("click", () => {
        const ip = document.getElementById('reportIpInput').value;
        const resultElement = document.getElementById('reportIpResult');
    
        if (!ip) {
            resultElement.textContent = "Please enter an IP address to report.";
            return;
        }
    
        fetch(`${API_BASE_URL}/report-ip`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ip })
        })
            .then(response => response.json())
            .then(data => {
                resultElement.textContent = JSON.stringify(data, null, 2).replace(/^"(.*)"$/, '$1');
            })
            .catch(error => {
                resultElement.textContent = `Error: ${error}`;
            });
    });

    // Report URL
    document.getElementById("reportUrlButton").addEventListener("click", () => {
        const url = document.getElementById("reportUrlInput").value.trim();
        const reportUrlResult = document.getElementById("reportUrlResult");

        if (url) {
            fetch(`${API_BASE_URL}/report-url`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            })
                .then(response => response.json())
                .then(data => {
                    reportUrlResult.innerHTML = data
                        .replace(/\n/g, '<br>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                })
                .catch(err => {
                    reportUrlResult.textContent = "Error reporting URL.";
                    console.error(err);
                });
        } else {
            reportUrlResult.textContent = "Please enter a valid URL.";
        }
    });

    // Dashboard refresh
    document.getElementById("refreshDashboard").addEventListener("click", fetchDashboardData);
});

// Function to toggle between sections
function toggleSection(sectionId) {
    document.querySelectorAll('.scan-section, .report-section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
}



//Quiz Page
const questions = [
    { question: "What is phishing?", options: ["A type of virus", "A method to steal sensitive data using fake emails", "An antivirus tool", "A network protocol"], answer: "A method to steal sensitive data using fake emails" },
    { question: "What does ransomware do?", options: ["Steals personal data", "Locks or encrypts files until a ransom is paid", "Monitors keystrokes", "Repairs systems"], answer: "Locks or encrypts files until a ransom is paid" },
    { question: "What is a trojan horse in cybersecurity?", options: ["An email virus", "A type of malware disguised as legitimate software", "A firewall", "A DDoS attack"], answer: "A type of malware disguised as legitimate software" },
    { question: "What is the primary goal of spyware?", options: ["Encrypt files", "Steal personal or sensitive information", "Block internet access", "Destroy hardware"], answer: "Steal personal or sensitive information" },
    { question: "Which malware spreads automatically across networks?", options: ["Spyware", "Worm", "Trojan", "Ransomware"], answer: "Worm" },
    { question: "What is a DDoS attack?", options: ["An email-based malware", "An attack that floods servers to cause disruption", "A virus that steals bank data", "Encryption software"], answer: "An attack that floods servers to cause disruption" },
    { question: "How can you protect against phishing attacks?", options: ["Use firewalls", "Avoid clicking suspicious links in emails", "Use an antivirus program", "Turn off your computer"], answer: "Avoid clicking suspicious links in emails" },
    { question: "What type of malware records your keystrokes?", options: ["Spyware", "Adware", "Keylogger", "Worm"], answer: "Keylogger" },
    { question: "What is a common sign of ransomware?", options: ["Blue screen of death", "A message demanding payment to unlock files", "Slow computer performance", "Increased pop-up ads"], answer: "A message demanding payment to unlock files" },
    { question: "What does adware typically do?", options: ["Displays unwanted advertisements", "Deletes files", "Steals passwords", "Encrypts documents"], answer: "Displays unwanted advertisements" },
];

let currentQuestionIndex = 0;
let score = 0;

const quizContent = document.getElementById("quizContent");
const scoreDisplay = document.getElementById("score");
const playAgainBtn = document.getElementById("playAgain");
let nextButtonVisible = false;

function loadQuestion() {
    quizContent.innerHTML = ""; // Clear the previous content
    nextButtonVisible = false; // Reset next button visibility

    const currentQuestion = questions[currentQuestionIndex];

    // Create question text
    const questionDiv = document.createElement("div");
    questionDiv.classList.add("question");
    questionDiv.innerHTML = `<p>${currentQuestionIndex + 1}. ${currentQuestion.question}</p>`;
    quizContent.appendChild(questionDiv);

    // Create options
    const optionsDiv = document.createElement("div");
    optionsDiv.classList.add("options");

    currentQuestion.options.forEach(option => {
        const button = document.createElement("button");
        button.textContent = option;
        button.onclick = () => checkAnswer(button, option, currentQuestion.answer);
        optionsDiv.appendChild(button);
    });

    quizContent.appendChild(optionsDiv);

    // Create space for feedback
    const feedbackDiv = document.createElement("div");
    feedbackDiv.id = "feedback";
    feedbackDiv.style.marginTop = "15px";
    quizContent.appendChild(feedbackDiv);

    // Create "Next" button (hidden initially)
    const nextButton = document.createElement("button");
    nextButton.id = "nextButton";
    nextButton.textContent = "Next";
    nextButton.style.display = "none"; // Initially hidden
    nextButton.style.backgroundColor = "#28a745";
    nextButton.style.color = "white";
    nextButton.style.padding = "10px 20px";
    nextButton.style.marginTop = "20px";
    nextButton.style.cursor = "pointer";
    nextButton.style.border = "none";
    nextButton.style.fontSize = "16px";
    nextButton.style.borderRadius = "5px";
    nextButton.style.float = "right";

    nextButton.onclick = () => moveToNextQuestion();
    quizContent.appendChild(nextButton);
}

function checkAnswer(button, selected, correct) {
    const optionsButtons = document.querySelectorAll(".options button");

    // Disable all buttons after an answer is selected
    optionsButtons.forEach(btn => btn.disabled = true);

    // Provide feedback
    const feedbackDiv = document.getElementById("feedback");
    if (selected === correct) {
        button.style.backgroundColor = "lightgreen";
        feedbackDiv.innerHTML = `<p style="color:green; font-weight:bold;">Correct! ✅ The answer is: ${correct}</p>`;
        score++;
    } else {
        button.style.backgroundColor = "lightcoral";
        feedbackDiv.innerHTML = `<p style="color:red; font-weight:bold;">Wrong! ❌ The correct answer is: ${correct}</p>`;
    }

    updateScore();

    // Show the "Next" button
    const nextButton = document.getElementById("nextButton");
    nextButton.style.marginTop = "30px";
    nextButton.style.display = "inline-block";
    nextButtonVisible = true;
}

function moveToNextQuestion() {
    if (!nextButtonVisible) return; // Prevent skipping without answering

    currentQuestionIndex++;
    if (currentQuestionIndex >= questions.length) {
        endQuiz();
    } else {
        loadQuestion();
    }
}

function updateScore() {
    scoreDisplay.textContent = `Score: ${score} / 10`;
}

function endQuiz() {
    quizContent.innerHTML = `<h2>Your Final Score: ${score} / 10</h2>`;
    playAgainBtn.style.display = "block";
}

function playAgain() {
    currentQuestionIndex = 0;
    score = 0;
    updateScore();
    playAgainBtn.style.display = "none";
    loadQuestion();
}

// Load the first question initially
loadQuestion();

// DashBoard Page
function fetchDashboardData() {
    // Dashboard Counters
    const fileCountElement = document.getElementById('fileCount');
    const urlCountElement = document.getElementById('urlCount');
    const ipCountElement = document.getElementById('ipCount');

    ipCountElement.textContent = ipMaliciousCount;
    fileCountElement.textContent = fileMaliciousCount;
    urlCountElement.textContent = urlMaliciousCount;
}

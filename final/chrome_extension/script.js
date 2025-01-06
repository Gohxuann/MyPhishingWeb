const API_BASE_URL = "http://127.0.0.1:5000";
let ipMaliciousCount = 0;
let urlMaliciousCount = 0;
let fileMaliciousCount = 0;

// Add these helper functions at the top of your script.js file
function showSpinner(buttonId) {
    const spinner = document.getElementById(`${buttonId}Spinner`);
    const button = document.getElementById(buttonId);
    if (spinner && button) {
        spinner.style.display = 'inline-block';
        button.disabled = true;
    }
}

function hideSpinner(buttonId) {
    const spinner = document.getElementById(`${buttonId}Spinner`);
    const button = document.getElementById(buttonId);
    if (spinner && button) {
        spinner.style.display = 'none';
        button.disabled = false;
    }
}

function showLoading(loadingId, resultId) {
    const loadingContainer = document.getElementById(loadingId);
    const resultElement = document.getElementById(resultId);
    resultElement.textContent = ''; // Clear previous results
    resultElement.classList.remove('visible');
    loadingContainer.style.display = 'block';
    loadingContainer.classList.remove('fade-out');
}

function hideLoading(loadingId, resultId) {
    const loadingContainer = document.getElementById(loadingId);
    const resultElement = document.getElementById(resultId);
    loadingContainer.classList.add('fade-out');
    
    setTimeout(() => {
        loadingContainer.style.display = 'none';
        loadingContainer.classList.remove('fade-out');
        resultElement.classList.add('visible');
    }, 500);
}

// Add these loading handler functions
function showFileLoading() {
    showLoading('loadingContainer', 'fileUploadResult');
}

function hideFileLoading() {
    hideLoading('loadingContainer', 'fileUploadResult');
}

function showUrlLoading() {
    showLoading('urlLoadingContainer', 'urlScanResult');
}

function hideUrlLoading() {
    hideLoading('urlLoadingContainer', 'urlScanResult');
}

function showIpLoading() {
    showLoading('ipLoadingContainer', 'ipScanResult');
}

function hideIpLoading() {
    hideLoading('ipLoadingContainer', 'ipScanResult');
}

// Add these loading handler functions for reports
function showReportIpLoading() {
    showLoading('reportIpLoadingContainer', 'reportIpResult');
}

function hideReportIpLoading() {
    hideLoading('reportIpLoadingContainer', 'reportIpResult');
}

function showReportUrlLoading() {
    showLoading('reportUrlLoadingContainer', 'reportUrlResult');
}

function hideReportUrlLoading() {
    hideLoading('reportUrlLoadingContainer', 'reportUrlResult');
}

// File upload
document.addEventListener("DOMContentLoaded", () => {
    // Event listener for file upload
    document.getElementById("uploadFileButton").addEventListener("click", () => {
        uploadFile();
    });

    // File upload function
    function uploadFile() {
        const file = fileInput.files[0];
        const resultElement = document.getElementById('fileUploadResult');

        if (!file) {
            resultElement.textContent = "Please select a file to upload.";
            return Promise.reject("No file selected");
        }

        showSpinner('uploadFileButton');
        showFileLoading();

        const formData = new FormData();
        formData.append('file', file);

        return fetch(`${API_BASE_URL}/api`, {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.malicious === 'yes') {
                    fileMaliciousCount += 1;
                    updateDashboard();
                }
                if (typeof data.result === 'string') {
                    resultElement.innerHTML = data.result
                        .replace(/\n/g, '<br>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                } else {
                    resultElement.innerHTML = JSON.stringify(data, null, 2)
                        .replace(/\n/g, '<br>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                }
                // Reset the form
                fileInput.value = '';
                fileName.textContent = '';
                uploadButton.disabled = true;
            })
            .catch(error => {
                resultElement.textContent = `Error: ${error}`;
                console.error("Upload Error:", error);
            })
            .finally(() => {
                hideSpinner('uploadFileButton');
                hideFileLoading();
            });
    }

    // Add choose file button click handler
    const chooseFileBtn = document.querySelector('.choose-file-btn');
    if (chooseFileBtn) {
        chooseFileBtn.addEventListener('click', () => {
            const fileInput = document.getElementById('fileInput');
            if (fileInput) {
                fileInput.click();
            }
        });
    }

    // File input change handler
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                updateFileName(e.target.files[0]);
            }
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
        updateActiveNavButton(pageId);
    };

    // URL/IP Scan toggle buttons
    document.getElementById("toggleUrlScan").addEventListener("click", () => {
        toggleScanSection('urlScanSection');
    });

    document.getElementById("toggleIpScan").addEventListener("click", () => {
        toggleScanSection('ipScanSection');
    });

    // Report IP/URL toggle buttons
    document.getElementById("toggleReportIp").addEventListener("click", () => {
        toggleReportSection('reportIpSection');
    });

    document.getElementById("toggleReportUrl").addEventListener("click", () => {
        toggleReportSection('reportUrlSection');
    });

    // Navigation buttons
    document.getElementById("dashboardButton").addEventListener("click", () => showPage('dashboardPage'));
    document.getElementById("fileUploadButton").addEventListener("click", () => showPage('fileUploadPage'));
    document.getElementById("urlIpScanButton").addEventListener("click", () => {
        showPage('urlIpScanPage');
        // Show default scan section
        toggleScanSection('urlScanSection');
    });
    document.getElementById("reportIpUrlButton").addEventListener("click", () => {
        showPage('reportIpUrlPage');
        // Show default report section
        toggleReportSection('reportIpSection');
    });
    document.getElementById("QuizPageButton").addEventListener("click", () => showPage('QuizPage'));

    // URL Scanning
    document.getElementById("scanUrlButton").addEventListener("click", () => {
        const url = document.getElementById("urlInput").value.trim();
        const urlScanResult = document.getElementById("urlScanResult");

        if (!url) {
            urlScanResult.textContent = "Please enter a valid URL.";
            return;
        }

        showSpinner('scanUrlButton');
        showUrlLoading();

        fetch(`${API_BASE_URL}/api?url=${encodeURIComponent(url)}`)
            .then(response => response.json())
            .then(data => {
                if (data.malicious === 'yes') {
                    urlMaliciousCount += 1;
                    updateDashboard();
                }
                setTimeout(() => {
                    urlScanResult.innerHTML = data.result
                        .replace(/\n/g, '<br>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    hideSpinner('scanUrlButton');
                    hideUrlLoading();
                }, 500); // Add slight delay for smoother transition
            })
            .catch(err => {
                setTimeout(() => {
                    urlScanResult.textContent = "Error scanning URL.";
                    console.error(err);
                    hideSpinner('scanUrlButton');
                    hideUrlLoading();
                }, 500);
            });
    });

    // IP Scanning
    document.getElementById("scanIpButton").addEventListener("click", () => {
        const ip = document.getElementById("ipInput").value.trim();
        const ipScanResult = document.getElementById("ipScanResult");

        if (!ip) {
            ipScanResult.textContent = "Please enter a valid IP.";
            return;
        }

        showSpinner('scanIpButton');
        showIpLoading();

        fetch(`${API_BASE_URL}/api?ip=${encodeURIComponent(ip)}`)
            .then(response => response.json())
            .then(data => {
                if (data.malicious === 'yes') {
                    ipMaliciousCount += 1;
                    updateDashboard();
                }
                setTimeout(() => {
                    ipScanResult.innerHTML = data.result
                        .replace(/\n/g, '<br>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    hideSpinner('scanIpButton');
                    hideIpLoading();
                }, 500); // Add slight delay for smoother transition
            })
            .catch(err => {
                setTimeout(() => {
                    ipScanResult.textContent = "Error scanning IP.";
                    console.error(err);
                    hideSpinner('scanIpButton');
                    hideIpLoading();
                }, 500);
            });
    });

    // Report IP
    document.getElementById("reportIpButton").addEventListener("click", () => {
        const ip = document.getElementById('reportIpInput').value;
        const resultElement = document.getElementById('reportIpResult');
    
        if (!ip) {
            resultElement.textContent = "Please enter an IP address to report.";
            return;
        }
    
        showSpinner('reportIpButton');
        showReportIpLoading();

        fetch(`${API_BASE_URL}/report-ip`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ip })
        })
            .then(response => response.json())
            .then(data => {
                // Format the response to remove JSON structure
                let message = '';
                if (typeof data === 'object') {
                    if (data.error) {
                        message = data.error;
                    } else if (data.message) {
                        message = data.message;
                    } else {
                        message = Object.values(data).join('\n');
                    }
                } else {
                    message = data.toString();
                }
                
                // Format the message with proper line breaks and styling
                resultElement.innerHTML = message
                    .replace(/\n/g, '<br>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            })
            .catch(error => {
                resultElement.textContent = `Error: ${error.message || 'Failed to report IP'}`;
            })
            .finally(() => {
                setTimeout(() => {
                    hideSpinner('reportIpButton');
                    hideReportIpLoading();
                }, 500);
            });
    });

    // Report URL
    document.getElementById("reportUrlButton").addEventListener("click", () => {
        const url = document.getElementById("reportUrlInput").value.trim();
        const reportUrlResult = document.getElementById("reportUrlResult");

        if (!url) {
            reportUrlResult.textContent = "Please enter a valid URL.";
            return;
        }

        showSpinner('reportUrlButton');
        showReportUrlLoading();

        fetch(`${API_BASE_URL}/report-url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        })
            .then(response => response.json())
            .then(data => {
                // Format the response to remove JSON structure
                let message = '';
                if (typeof data === 'object') {
                    if (data.error) {
                        message = data.error;
                    } else if (data.message) {
                        message = data.message;
                    } else {
                        message = Object.values(data).join('\n');
                    }
                } else {
                    message = data.toString();
                }
                
                // Format the message with proper line breaks and styling
                reportUrlResult.innerHTML = message
                    .replace(/\n/g, '<br>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            })
            .catch(err => {
                reportUrlResult.textContent = "Error reporting URL.";
                console.error(err);
            })
            .finally(() => {
                setTimeout(() => {
                    hideSpinner('reportUrlButton');
                    hideReportUrlLoading();
                }, 500);
            });
    });

    // Clear button event listeners
    document.getElementById("clearFileResult").addEventListener("click", clearFileUpload);
    document.getElementById("clearUrlResult").addEventListener("click", clearUrlScan);
    document.getElementById("clearIpResult").addEventListener("click", clearIpScan);
    document.getElementById("clearReportIpResult").addEventListener("click", clearReportIp);
    document.getElementById("clearReportUrlResult").addEventListener("click", clearReportUrl);
});

// Update the toggle functions to be more specific
function toggleScanSection(sectionId) {
    // Hide all scan sections
    document.querySelectorAll('.scan-section').forEach(section => {
        section.style.display = 'none';
    });
    // Show the selected section
    document.getElementById(sectionId).style.display = 'block';
    
    // Update nav button active states
    document.querySelectorAll('.scan-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (sectionId === 'urlScanSection') {
        document.getElementById('toggleUrlScan').classList.add('active');
    } else {
        document.getElementById('toggleIpScan').classList.add('active');
    }
}

function toggleReportSection(sectionId) {
    // Hide all report sections
    document.querySelectorAll('.report-section').forEach(section => {
        section.style.display = 'none';
    });
    // Show the selected section
    document.getElementById(sectionId).style.display = 'block';
    
    // Update nav button active states
    document.querySelectorAll('.scan-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (sectionId === 'reportIpSection') {
        document.getElementById('toggleReportIp').classList.add('active');
    } else {
        document.getElementById('toggleReportUrl').classList.add('active');
    }
}

// Update the questions array with 20 questions
const questionBank = [
    {
        question: "What is phishing?",
        options: ["A method to steal sensitive data using fake emails", "A type of virus", "An antivirus tool", "A network protocol"],
        answer: "A method to steal sensitive data using fake emails"
    },
    {
        question: "What does ransomware do?",
        options: ["Locks or encrypts files until a ransom is paid", "Steals personal data", "Monitors keystrokes", "Repairs systems"],
        answer: "Locks or encrypts files until a ransom is paid"
    },
    {
        question: "What is a firewall?",
        options: ["A security system that monitors network traffic", "A type of computer virus", "A backup system", "A password manager"],
        answer: "A security system that monitors network traffic"
    },
    {
        question: "What is two-factor authentication (2FA)?",
        options: ["An additional security layer beyond passwords", "A type of encryption", "A backup method", "A virus scanning technique"],
        answer: "An additional security layer beyond passwords"
    },
    {
        question: "What is malware?",
        options: ["Malicious software designed to harm systems", "A security tool", "A type of firewall", "An authentication method"],
        answer: "Malicious software designed to harm systems"
    },
    {
        question: "What is a VPN used for?",
        options: ["Encrypting internet traffic and hiding IP", "Storing passwords", "Scanning for viruses", "Creating backups"],
        answer: "Encrypting internet traffic and hiding IP"
    },
    {
        question: "What is social engineering?",
        options: ["Manipulating people to reveal information", "Writing code", "Installing software", "Network configuration"],
        answer: "Manipulating people to reveal information"
    },
    {
        question: "What is encryption?",
        options: ["Converting data into a secret code", "Deleting files", "Backing up data", "Scanning for viruses"],
        answer: "Converting data into a secret code"
    },
    {
        question: "What is a data breach?",
        options: ["Unauthorized access to sensitive data", "A system backup", "A software update", "A network protocol"],
        answer: "Unauthorized access to sensitive data"
    },
    {
        question: "What is a strong password?",
        options: ["Complex combination of characters", "A simple word", "Your birth date", "Your name"],
        answer: "Complex combination of characters"
    },
    {
        question: "What is cyberstalking?",
        options: ["Online harassment and monitoring", "A security feature", "A backup method", "A type of firewall"],
        answer: "Online harassment and monitoring"
    },
    {
        question: "What is a zero-day exploit?",
        options: ["An unknown software vulnerability", "A backup system", "A password type", "A network protocol"],
        answer: "An unknown software vulnerability"
    },
    {
        question: "What is DNS poisoning?",
        options: ["Redirecting traffic to malicious sites", "A virus type", "A backup method", "A password system"],
        answer: "Redirecting traffic to malicious sites"
    },
    {
        question: "What is a botnet?",
        options: ["Network of infected computers", "A security tool", "A backup system", "A password manager"],
        answer: "Network of infected computers"
    },
    {
        question: "What is cryptojacking?",
        options: ["Unauthorized crypto mining", "A backup method", "A password type", "A security protocol"],
        answer: "Unauthorized crypto mining"
    },
    {
        question: "What is a man-in-the-middle attack?",
        options: ["Intercepting communications", "A backup system", "A virus type", "A password method"],
        answer: "Intercepting communications"
    },
    {
        question: "What is a brute force attack?",
        options: ["Trying all possible passwords", "A security feature", "A backup method", "A network protocol"],
        answer: "Trying all possible passwords"
    },
    {
        question: "What is SQL injection?",
        options: ["Database code insertion attack", "A virus type", "A backup system", "A password method"],
        answer: "Database code insertion attack"
    },
    {
        question: "What is a honeypot?",
        options: ["A security trap for attackers", "A virus type", "A backup method", "A password system"],
        answer: "A security trap for attackers"
    },
    {
        question: "What is digital forensics?",
        options: ["Investigating digital evidence", "A virus type", "A backup system", "A security protocol"],
        answer: "Investigating digital evidence"
    }
];

// Function to shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Function to shuffle options for a question
function shuffleOptions(question) {
    const shuffledOptions = shuffleArray([...question.options]);
    return {
        ...question,
        options: shuffledOptions,
        answer: question.answer
    };
}

// Function to get random questions
function getRandomQuestions(count) {
    const shuffledQuestions = shuffleArray([...questionBank]);
    return shuffledQuestions.slice(0, count).map(q => shuffleOptions(q));
}

// Update your existing quiz variables
let questions = [];
let currentQuestionIndex = 0;
let score = 0;

const quizContent = document.getElementById("quizContent");
const scoreDisplay = document.getElementById("score");
const playAgainBtn = document.getElementById("playAgain");
let nextButtonVisible = false;

function loadQuestion() {
    if (currentQuestionIndex === 0) {
        // Only get new random questions when starting a new quiz
        questions = getRandomQuestions(10);
    }

    quizContent.innerHTML = "";
    nextButtonVisible = false;

    const currentQuestion = questions[currentQuestionIndex];

    // Create question text
    const questionDiv = document.createElement("div");
    questionDiv.classList.add("question");
    questionDiv.innerHTML = `${currentQuestionIndex + 1}. ${currentQuestion.question}`;
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

    // Create feedback div
    const feedbackDiv = document.createElement("div");
    feedbackDiv.id = "feedback";
    quizContent.appendChild(feedbackDiv);

    // Create next button
    const nextButton = document.createElement("button");
    nextButton.id = "nextButton";
    nextButton.className = "next-button";
    nextButton.style.display = "none";
    nextButton.innerHTML = `
        Next Question
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
    `;
    nextButton.onclick = () => moveToNextQuestion();
    quizContent.appendChild(nextButton);
}

function checkAnswer(button, selected, correct) {
    const optionsButtons = document.querySelectorAll(".options button");
    optionsButtons.forEach(btn => btn.disabled = true);

    const feedbackDiv = document.getElementById("feedback");
    
    if (selected === correct) {
        button.classList.add("correct");
        feedbackDiv.className = "feedback correct";
        feedbackDiv.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            Correct! The answer is: ${correct}
        `;
        score++;
    } else {
        button.classList.add("wrong");
        feedbackDiv.className = "feedback wrong";
        feedbackDiv.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            Wrong! The correct answer is: ${correct}
        `;
    }

    updateScore();
    const nextButton = document.getElementById("nextButton");
    nextButton.style.display = "inline-flex";
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
    quizContent.innerHTML = `
        <div class="quiz-result">
            <h2>Quiz Completed! 🎉</h2>
            <p class="final-score">Your Final Score: ${score} / 10</p>
            <div class="score-message">
                ${score >= 8 ? "Excellent work! You're a cybersecurity expert! 🏆" :
                  score >= 6 ? "Good job! Keep learning to improve! 📚" :
                  "Keep practicing to improve your knowledge! 💪"}
            </div>
        </div>
    `;
    playAgainBtn.style.display = "flex";
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

// Add this to your existing DOMContentLoaded event listener
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');
const uploadButton = document.getElementById('uploadFileButton');

// Drag and drop handlers
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        updateFileName(files[0]);
    }
});

// File input change handler
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        updateFileName(e.target.files[0]);
    }
});

function updateFileName(file) {
    fileName.textContent = file.name;
    uploadButton.disabled = false;
}

// Add this function to automatically update dashboard
function updateDashboard() {
    const fileCountElement = document.getElementById('fileCount');
    const urlCountElement = document.getElementById('urlCount');
    const ipCountElement = document.getElementById('ipCount');

    if (fileCountElement) fileCountElement.textContent = fileMaliciousCount;
    if (urlCountElement) urlCountElement.textContent = urlMaliciousCount;
    if (ipCountElement) ipCountElement.textContent = ipMaliciousCount;
}

// Add these clear functions
function clearFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const fileName = document.getElementById('fileName');
    const resultElement = document.getElementById('fileUploadResult');
    const uploadButton = document.getElementById('uploadFileButton');
    
    fileInput.value = '';
    fileName.textContent = '';
    resultElement.textContent = '';
    uploadButton.disabled = true;
}

function clearUrlScan() {
    const urlInput = document.getElementById('urlInput');
    const resultElement = document.getElementById('urlScanResult');
    
    urlInput.value = '';
    resultElement.textContent = '';
}

function clearIpScan() {
    const ipInput = document.getElementById('ipInput');
    const resultElement = document.getElementById('ipScanResult');
    
    ipInput.value = '';
    resultElement.textContent = '';
}

function clearReportIp() {
    const ipInput = document.getElementById('reportIpInput');
    const resultElement = document.getElementById('reportIpResult');
    
    ipInput.value = '';
    resultElement.textContent = '';
}

function clearReportUrl() {
    const urlInput = document.getElementById('reportUrlInput');
    const resultElement = document.getElementById('reportUrlResult');
    
    urlInput.value = '';
    resultElement.textContent = '';
}

// Add this function to handle active state of navigation buttons
function updateActiveNavButton(pageId) {
    document.querySelectorAll('.main-nav button').forEach(button => {
        button.classList.remove('active');
    });
    
    switch(pageId) {
        case 'dashboardPage':
            document.getElementById('dashboardButton').classList.add('active');
            break;
        case 'fileUploadPage':
            document.getElementById('fileUploadButton').classList.add('active');
            break;
        case 'urlIpScanPage':
            document.getElementById('urlIpScanButton').classList.add('active');
            break;
        case 'reportIpUrlPage':
            document.getElementById('reportIpUrlButton').classList.add('active');
            break;
        case 'QuizPage':
            document.getElementById('QuizPageButton').classList.add('active');
            break;
    }
}

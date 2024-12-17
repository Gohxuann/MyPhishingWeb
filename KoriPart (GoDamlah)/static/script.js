document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = `<i data-lucide="sun"></i>`;
    const moonIcon = `<i data-lucide="moon"></i>`;

    // Initialize theme based on stored preference
    let isDarkMode = localStorage.getItem('isDarkMode') !== 'false';
    if (!isDarkMode) {
        document.body.classList.add('light-theme');
        themeToggle.innerHTML = moonIcon;
    } else {
        themeToggle.innerHTML = sunIcon;
    }
    lucide.createIcons();

    themeToggle.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        document.body.classList.toggle('light-theme');
        themeToggle.innerHTML = isDarkMode ? sunIcon : moonIcon;
        localStorage.setItem('isDarkMode', isDarkMode);
        lucide.createIcons();
    });

    // Tab switching
    // const tabs = document.querySelectorAll('.tab');
    // tabs.forEach(tab => {
    //     tab.addEventListener('click', () => {
    //         tabs.forEach(t => t.classList.remove('active'));
    //         tab.classList.add('active');
    //     });
    // });

    const navLinks = document.querySelectorAll('.nav-links a');
    const tabContents = document.querySelectorAll('.tab-content');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = link.getAttribute('data-tab');

            // Remove active class from all links and add to the clicked link
            navLinks.forEach(nav => nav.classList.remove('active'));
            link.classList.add('active');

            // Hide all tab contents and display the selected one
            tabContents.forEach(content => content.style.display = 'none');
            document.getElementById(`${targetTab}-tab-content`).style.display = 'block';
        });
    });


    // File upload handling
    const chooseFileBtn = document.querySelector('.choose-file');
    chooseFileBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '*/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                // Handle file upload
                console.log('File selected:', file.name);
            }
        };
        input.click();
    });

     // Handle Report Phishing form submission
     const reportForm = document.getElementById('report-form');
    const loader = document.getElementById('loader');
    const reportResultDiv = document.getElementById('report-result');

    if (reportForm) {
        // Handle the form submission
        reportForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent page refresh
            const ipInput = document.getElementById('report-ip-input').value;

            // Clear previous results and show the loader
            reportResultDiv.innerHTML = ''; // Clear any existing results
            loader.style.display = 'block'; // Show the loader while processing

            try {
                // Send a POST request to the backend
                const response = await fetch('/report-ip', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ ip: ipInput }),
                });

                const result = await response.json(); // Parse the response
                loader.style.display = 'none'; // Hide the loader

                if (response.ok) {
                    // Display IPQS Analysis Results
                    const ipqs = result.ipqs_analysis;
                    let analysisHTML = `
                        <div class="card">
                            <h3>IPQS Analysis</h3>
                            <p><strong>Phishing:</strong> ${ipqs.phishing}</p>
                            <p><strong>Malware:</strong> ${ipqs.malware}</p>
                            <p><strong>Suspicious:</strong> ${ipqs.suspicious}</p>
                            <p><strong>Risk Score:</strong> ${ipqs.risk_score}</p>
                            <p><strong>Message:</strong> ${ipqs.message}</p>
                        </div>
                    `;

                    // Display AbuseIPDB Report Results
                    if (result.abuseipdb_report) {
                        if (result.abuseipdb_report.error) {
                            // Check for Too Many Requests error (429)
                            if (result.abuseipdb_report.error.includes("Too many requests")) {
                                analysisHTML += `
                                    <div class="card error-message">
                                        <h3>AbuseIPDB Report</h3>
                                        <p>Rate limit exceeded. Please wait and try again later.</p>
                                    </div>
                                `;
                            } else {
                                // Display other AbuseIPDB errors
                                analysisHTML += `
                                    <div class="card error-message">
                                        <h3>AbuseIPDB Report</h3>
                                        <p>${result.abuseipdb_report.error}</p>
                                    </div>
                                `;
                            }
                        } else {
                            // Display a success message for AbuseIPDB
                            analysisHTML += `
                                <div class="card">
                                    <h3>AbuseIPDB Report</h3>
                                    <p>${result.abuseipdb_report.message}</p>
                                </div>
                            `;
                        }
                    }

                    // Update the results container with the generated HTML
                    reportResultDiv.innerHTML = analysisHTML;
                } else {
                    // Display general errors from the backend
                    reportResultDiv.innerHTML = `
                        <div class="card error-message">
                            <h3>Error</h3>
                            <p>${result.error}</p>
                        </div>
                    `;
                }
            } catch (error) {
                // Handle unexpected errors (e.g., network issues)
                loader.style.display = 'none'; // Hide the loader
                reportResultDiv.innerHTML = `
                    <div class="card error-message">
                        <h3>Unexpected Error</h3>
                        <p>An unexpected error occurred while processing your request.</p>
                    </div>
                `;
                console.error('Error:', error); // Log the error to the console for debugging
            }
        });
    }
});

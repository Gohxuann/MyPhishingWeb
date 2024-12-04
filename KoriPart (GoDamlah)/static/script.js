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
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
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
});

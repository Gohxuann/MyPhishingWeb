// Existing tab listener for URL scanning
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        console.log("URL Changed to:", changeInfo.url);

        // Send the URL to the backend server for scanning
        fetch(`http://127.0.0.1:5000/api?url=${encodeURIComponent(changeInfo.url)}`)
            .then(response => response.json())
            .then(data => {
                console.log("Scan Result:", data);
                // If the URL is malicious, show an alert notification
                if (data.malicious === "yes") {
                    chrome.notifications.create({
                        type: "basic",
                        iconUrl: "icon.png",
                        title: "Malicious URL Detected!",
                        message: `Warning! The URL "${changeInfo.url}" is flagged as malicious.`
                    });
                } else {
                    chrome.notifications.create({
                        type: "basic",
                        iconUrl: "icon.png",
                        title: "URL Scan Result",
                        message: `The URL "${changeInfo.url}" appears clean.`
                    });
                }
            })
            .catch(error => {
                console.error("Error scanning URL:", error);
                chrome.notifications.create({
                    type: "basic",
                    iconUrl: "icon.png",
                    title: "Scan Error",
                    message: "Unable to scan the URL. Check backend connection."
                });
            });
    }
});

chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
    console.log("File Download Triggered:", downloadItem);

    chrome.downloads.onCreated.addListener(downloadItem => {
        console.log("File Download Started:", downloadItem);
    
        chrome.downloads.onChanged.addListener(delta => {
            if (delta.id === downloadItem.id && delta.state && delta.state.current === "complete") {
                console.log("Download Completed for:", downloadItem.filename);
    
                chrome.downloads.search({ id: delta.id }, results => {
                    if (results.length > 0) {
                        const filePath = results[0].filename;
                        console.log("File Path:", filePath);
    
                        // Send the file path to your backend
                        const formData = new FormData();
                        formData.append("file", filePath);
    
                        fetch("http://127.0.0.1:5000/api", {
                            method: "POST",
                            body: formData
                        })
                        .then(response => response.json())
                        .then(data => {
                            console.log("File Scan Result:", data);
                            if (data.malicious === "yes") {
                                chrome.notifications.create({
                                    type: "basic",
                                    iconUrl: "icon.png",
                                    title: "Malicious File Detected!",
                                    message: `The file "${filePath}" is flagged as malicious.`
                                });
                            } else {
                                chrome.notifications.create({
                                    type: "basic",
                                    iconUrl: "icon.png",
                                    title: "File Scan Result",
                                    message: `The file "${filePath}" appears clean.`
                                });
                            }
                        })
                        .catch(error => {
                            console.error("Error scanning file:", error);
                            chrome.notifications.create({
                                type: "basic",
                                iconUrl: "icon.png",
                                title: "Scan Error",
                                message: "Unable to scan the file. Check backend connection."
                            });
                        });
                    }
                });
            }
        });
    });
    

    suggest();
});

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({
    url: chrome.runtime.getURL('index.html'),
    active: true
  });
});

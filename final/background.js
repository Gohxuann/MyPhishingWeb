chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
      console.log("URL Changed to:", changeInfo.url);
  
      // Send the detected URL to your backend server
      fetch("http://127.0.0.1:5000/api?url=" + encodeURIComponent(changeInfo.url))
        .then(response => response.json())
        .then(data => {
          console.log("Backend Response:", data);
          chrome.notifications.create({
            type: "basic",
            iconUrl: "icon.png",
            title: "URL Scan Result",
            message: JSON.stringify(data, null, 2)
          });
        })
        .catch(error => console.error("Error:", error));
    }
  });
  
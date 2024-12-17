// Listen for downloads
chrome.downloads.onCreated.addListener((downloadItem) => {
  console.log("File Download Detected:", downloadItem.filename);

  // Send the downloaded file's URL to your backend for scanning
  if (downloadItem.url) {
      fetch("http://127.0.0.1:5000/api", {
          method: "POST",
          body: JSON.stringify({ file: downloadItem.url }),
          headers: {
              "Content-Type": "application/json"
          }
      })
      .then(response => response.json())
      .then(data => {
          console.log("Scan Result:", data);

          if (data.malicious === "yes") {
              // Show an alert notification if file is malicious
              chrome.notifications.create({
                  type: "basic",
                  iconUrl: "icon.png",
                  title: "Malicious File Detected!",
                  message: `The file "${downloadItem.filename}" is flagged as malicious. Please delete it immediately.`
              });
          } else {
              chrome.notifications.create({
                  type: "basic",
                  iconUrl: "icon.png",
                  title: "File Scan Result",
                  message: `The file "${downloadItem.filename}" appears clean.`
              });
          }
      })
      .catch(error => {
          console.error("Error scanning file:", error);
      });
  }
});

// Existing tab listener for URL scanning
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
      console.log("URL Changed to:", changeInfo.url);

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

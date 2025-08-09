chrome.runtime.onInstalled.addListener(() => {
  console.log("Build Information Generator extension installed");
});

// Handle download requests
chrome.downloads.onCreated.addListener((downloadItem) => {
  if (downloadItem.filename && downloadItem.filename.includes("BuildInfo_")) {
    console.log("Build info file download started:", downloadItem.filename);
  }
});

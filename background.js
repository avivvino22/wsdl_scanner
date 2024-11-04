let wsdlUrls = [];

// Listen for completed web requests and check if a '?wsdl' check is needed
chrome.webRequest.onCompleted.addListener(
  async function (details) {
    try {
      // Only proceed with GET requests over HTTP/HTTPS
      if (details.method !== 'GET' || !details.url.startsWith('http')) {
        return;
      }

      // Determine the WSDL URL to check
      let wsdlCheckedUrl = details.url;

      // Check if we've already checked this URL
      if (!wsdlUrls.includes(wsdlCheckedUrl)) {
        // Skip URLs that already have '&wsdl'
        if (wsdlCheckedUrl.includes('&wsdl')) {
          console.log(`Skipping URL with '&wsdl': ${wsdlCheckedUrl}`);
          return;
        }

        // Append '?wsdl' if not already present
        if (!wsdlCheckedUrl.includes('?wsdl')) {
          wsdlCheckedUrl = wsdlCheckedUrl.includes('?') ?
            `${wsdlCheckedUrl}&wsdl` :
            `${wsdlCheckedUrl}?wsdl`;
        } else {
          // If the URL already has '?wsdl', do nothing
          console.log(`URL already has '?wsdl': ${wsdlCheckedUrl}`);
          return;
        }

        // Log the URL we are checking
        console.log(`Checking URL: ${wsdlCheckedUrl}`);

        // Fetch the WSDL URL and check the response content
        let response = await fetch(wsdlCheckedUrl);
        let text = await response.text();

        if (response.ok && text.includes('<?xml') && /<definitions|<wsdl:definitions/.test(text.toLowerCase())) {
          // Add the checked URL to prevent duplicate checks
          wsdlUrls.push(wsdlCheckedUrl); // Store the WSDL URL that was checked
          chrome.storage.local.set({ wsdlUrls }); // Store the found URLs persistently
          console.log(`WSDL file found: ${wsdlCheckedUrl}`);
          
          // Show a notification when a WSDL is found
          showNotification(wsdlCheckedUrl);
        } else {
          console.log(`No WSDL content found at: ${wsdlCheckedUrl}`);
        }
      } else {
        console.log(`URL already checked: ${details.url}`);
      }
    } catch (error) {
      console.error('Error checking WSDL content:', error);
    }
  },
  {
    urls: ["<all_urls>"],
    types: ["main_frame", "sub_frame", "xmlhttprequest", "other"]
  }
);

// Function to show notifications
function showNotification(url) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon48.png', // Ensure this path is correct
    title: 'WSDL File Found',
    message: `A WSDL file was found at: ${url}`,
    priority: 2
  });
}

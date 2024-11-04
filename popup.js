document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get('wsdlUrls', (data) => {
    let urls = data.wsdlUrls || [];
    let tableBody = document.querySelector('#wsdlTable tbody');

    // Clear any existing rows
    tableBody.innerHTML = '';

    // Update the badge text with the number of unique URLs found
    chrome.action.setBadgeText({ text: `${urls.length}` });

    if (urls.length > 0) {
      urls.forEach((url, index) => {
        addWsdlToTable(index + 1, url); // Call function to add to table
      });
    } else {
      let row = document.createElement('tr');
      let cell = document.createElement('td');
      cell.setAttribute('colspan', '2');
      cell.textContent = 'No WSDL files found yet.';
      cell.style.textAlign = 'center';
      row.appendChild(cell);
      tableBody.appendChild(row);
    }
  });
});

// Function to clear the table and reset the count
document.getElementById('clearButton').addEventListener('click', function() {
  const tableBody = document.getElementById('wsdlTableBody');
  tableBody.innerHTML = ''; // Remove all rows from the table
  chrome.storage.local.set({ wsdlUrls: [] }); // Clear stored URLs
  chrome.action.setBadgeText({ text: '' }); // Clear badge text
  console.log('Table cleared');
});

// Function to show notification for found WSDL
function showNotification(url) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon48.png', // Use an appropriate icon URL from your extension
    title: 'WSDL File Found',
    message: `A WSDL file was found at: ${url}`,
    priority: 2
  });
}

// Function to add a row to the table if the URL is unique
function addWsdlToTable(index, url) {
  const tableBody = document.getElementById('wsdlTableBody');

  // Check if the URL already exists in the table
  const existingRows = tableBody.querySelectorAll('tr');
  const urlsInTable = Array.from(existingRows).map(row => row.cells[1].textContent);

  if (!urlsInTable.includes(url)) {
    const row = document.createElement('tr');
    const indexCell = document.createElement('td');
    const urlCell = document.createElement('td');

    indexCell.textContent = index; // Set the index number
    urlCell.textContent = url; // Set the URL

    row.appendChild(indexCell);
    row.appendChild(urlCell);
    tableBody.appendChild(row);

    // Show notification when a WSDL file is found
    //showNotification(url);
  } else {
    console.log(`URL already exists: ${url}`); // Log if the URL is a duplicate
  }
}

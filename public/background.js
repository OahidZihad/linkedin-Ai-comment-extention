// // background.js
// chrome.runtime.onInstalled.addListener(() => {
//   console.log("Extension installed");
// });

// chrome.action.onClicked.addListener((tab) => {
//   if (tab.url && tab.url.startsWith('https://www.linkedin.com')) {
//     chrome.scripting.executeScript({
//       target: { tabId: tab.id },
//       func: modifyLinkedInPosts
//     });
//   } else {
//     console.error('This extension only works on LinkedIn pages.');
//   }
// });

// function modifyLinkedInPosts() {
//   // let actionBars = document.querySelectorAll('.feed-shared-social-action-bar');
//   // actionBars?.forEach((bar) => {
//   //   if (!bar.style.backgroundColor) {
//   //     bar.style.backgroundColor = 'yellow';
//   //     if (!bar.querySelector('.custom-action-button')) {
//   //       const customButton = document.createElement('button');
//   //       customButton.innerText = 'Generate';
//   //       customButton.className = 'custom-action-button';
//   //       customButton.style.marginLeft = '10px';

//   //       customButton.addEventListener('click', () => {
//   //         const post = bar.closest('.relative');
//   //         const textView = post.querySelector('.feed-shared-update-v2__description-wrapper .break-words');
//   //         console.log("🚀 ~ customButton.addEventListener ~ textView:", textView)
//   //         if (textView) {
//   //           console.log(textView.innerText);
//   //         }
//   //       });

//   //       bar.appendChild(customButton);
//   //     }
//   //   }
//   // });
//   let actionBars = document.querySelectorAll('.feed-shared-social-action-bar');
//     actionBars.forEach((bar) => {
//         if (!bar.style.backgroundColor) {
//             bar.style.backgroundColor = 'yellow';

//             // Create and insert the dropdown above the action bar
//             if (!bar.previousElementSibling || !bar.previousElementSibling.classList.contains('custom-dropdown-wrapper')) {
//                 const dropdownWrapper = document.createElement('div');
//                 dropdownWrapper.className = 'custom-dropdown-wrapper';
//                 dropdownWrapper.style.marginBottom = '10px';
//                 dropdownWrapper.innerHTML = `
//                     <select class="custom-dropdown">
//                         <option value="option1">Option 1</option>
//                         <option value="option2">Option 2</option>
//                         <option value="option3">Option 3</option>
//                     </select>
//                 `;
//                 bar.parentNode.insertBefore(dropdownWrapper, bar);

//                 // Add event listener for the dropdown
//                 const dropdown = dropdownWrapper.querySelector('.custom-dropdown');
//                 dropdown.addEventListener('change', (event) => {
//                     console.log('Dropdown value changed to:', event.target.value);
//                 });
//             }

//             if (!bar.querySelector('.custom-action-button')) {
//                 const customButton = document.createElement('button');
//                 customButton.innerText = 'Generate';
//                 customButton.className = 'custom-action-button';
//                 customButton.style.marginLeft = '10px';

//                 customButton.addEventListener('click', () => {
//                     const post = bar.closest('.relative');
//                     const textView = post.querySelector('.feed-shared-update-v2__description-wrapper .break-words');
//                     console.log("🚀 ~ customButton.addEventListener ~ textView:", textView)
//                     if (textView) {
//                         console.log(textView.innerText);
//                     }
//                 });

//                 bar.appendChild(customButton);
//             }
//         }
//     });
// }

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.action === 'storeToken') {
//     chrome.storage.local.set({ accessToken: request.token }, () => {
//       console.log('Token stored successfully');
//     });
//   }
// });

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.url && tab.url.startsWith('https://www.linkedin.com')) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: modifyLinkedInPosts
    });
  } else {
    console.error('This extension only works on LinkedIn pages.');
  }
});

function modifyLinkedInPosts() {
  let actionBars = document.querySelectorAll('.feed-shared-social-action-bar');
  actionBars.forEach((bar) => {
    if (!bar.style.backgroundColor) {
      bar.style.backgroundColor = 'yellow';

      if (!bar.previousElementSibling || !bar.previousElementSibling.classList.contains('custom-dropdown-wrapper')) {
        const dropdownWrapper = document.createElement('div');
        dropdownWrapper.className = 'custom-dropdown-wrapper';
        dropdownWrapper.style.marginBottom = '10px';
        dropdownWrapper.innerHTML = `
          <select class="custom-dropdown">
            <option value="loading">Loading...</option>
          </select>
        `;
        bar.parentNode.insertBefore(dropdownWrapper, bar);

        const dropdown = dropdownWrapper.querySelector('.custom-dropdown');
        chrome.runtime.sendMessage({ action: 'fetchOptions' }, (response) => {
          if (response.success) {
            dropdown.innerHTML = '';
            response.options.forEach(option => {
              const optionElement = document.createElement('option');
              optionElement.value = option._id;
              optionElement.text = option.job;
              dropdown.appendChild(optionElement);
            });
          } else {
            dropdown.innerHTML = '<option value="error">Error loading options</option>';
          }
        });

        dropdown.addEventListener('change', (event) => {
          console.log('Dropdown value changed to:', event.target.value);
        });
      }

      if (!bar.querySelector('.custom-action-button')) {
        const customButton = document.createElement('button');
        customButton.innerText = 'Generate';
        customButton.className = 'custom-action-button';
        customButton.style.marginLeft = '10px';

        customButton.addEventListener('click', () => {
          const post = bar.closest('.relative');
          const textView = post.querySelector('.feed-shared-update-v2__description-wrapper .break-words');
          console.log("🚀 ~ customButton.addEventListener ~ textView:", textView);
          if (textView) {
            console.log(textView.innerText);
          }
        });

        bar.appendChild(customButton);
      }
    }
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'storeToken') {
    chrome.storage.local.set({ accessToken: request.token }, () => {
      console.log('Token stored successfully');
    });
  } else if (request.action === 'fetchOptions') {
    chrome.storage.local.get(['accessToken'], (items) => {
      const token = items.accessToken;
      if (token) {
        fetch('https://algoclan-extension-46b54a91a23b.herokuapp.com/api/personas', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        .then(response => response.json())
        .then(data => sendResponse({ success: true, options: data }))
        .catch(error => sendResponse({ success: false, error }));
      } else {
        sendResponse({ success: false, error: 'No token found' });
      }
    });
    return true;
  }
});

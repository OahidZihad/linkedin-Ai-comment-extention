// background.js
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
  actionBars?.forEach((bar) => {
    if (!bar.style.backgroundColor) {
      bar.style.backgroundColor = 'yellow';
      if (!bar.querySelector('.custom-action-button')) {
        const customButton = document.createElement('button');
        customButton.innerText = 'Custom Button';
        customButton.className = 'custom-action-button';
        customButton.style.marginLeft = '10px';

        customButton.addEventListener('click', () => {
          const post = bar.closest('.relative');
          const textView = post.querySelector('.feed-shared-update-v2__description-wrapper .text-view-model');
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
  }
});
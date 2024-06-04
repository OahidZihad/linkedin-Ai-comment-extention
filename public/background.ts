// background.js
chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed");
  });
  
  chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      func: ()=> modifyLinkedInPosts
    });
  });
  
  function modifyLinkedInPosts() {
    let actionBars = document.querySelectorAll('.feed-shared-social-action-bar');
    actionBars.forEach((bar: any) => {
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
  
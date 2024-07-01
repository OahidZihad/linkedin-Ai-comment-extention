import { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');

  const onClick = async () => {
    try {
      let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id || !tab.url.startsWith('https://www.linkedin.com')) {
        throw new Error('No valid LinkedIn tab found');
      }
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
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
                  console.log("🚀 ~ chrome.runtime.sendMessage ~ response:", response)
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
      });
    } catch (error) {
      console.error('Error executing script:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const authUrl = 'https://algoclan-extension-46b54a91a23b.herokuapp.com/api/auth/login';

    try {
      const response = await axios.post(authUrl, {
        email,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status !== 200) {
        throw new Error('Authentication failed');
      }

      const { token } = response.data;
      console.log("🚀 ~ handleSubmit ~ token:", token)
      setToken(token);

      chrome.runtime.sendMessage({ action: 'storeToken', token: token });
    } catch (error) {
      console.error('Error during authentication:', error);
    }
  };

  useEffect(() => {
    chrome.storage.local.get(['accessToken'], function (items) {
      setToken(items.accessToken);
    });
  }, []);

  return (
    <>
      <button onClick={onClick}>Click</button>
      <br />
      <form onSubmit={handleSubmit}>
        <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type='submit'>Login</button>
      </form>
      <br />
      <a href="https://algoclanai.vercel.app/" target="_blank">Create/Manage Persona</a>
    </>
  );
}

export default App;

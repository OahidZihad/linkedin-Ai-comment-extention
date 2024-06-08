import { useState } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onClick = async () => {
    try {
      console.log('Querying active tab...');
      let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      console.log('Active tab:', tab);
      if (!tab || !tab.id || !tab.url.startsWith('https://www.linkedin.com')) {
        throw new Error('No valid LinkedIn tab found');
      }
      console.log('Executing script...');
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          let actionBars = document.querySelectorAll('.feed-shared-social-action-bar');
          actionBars.forEach((bar) => {
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
      });
    } catch (error) {
      console.error('Error executing script:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Authenticating...');
  
    // Replace with your authentication API URL
    const authUrl = 'https://prod-oakriverllc-d2d736f6912b.herokuapp.com/api/user/login/';
  
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
  
      const { accessToken } = response.data;
  
      // Store token using chrome.storage
      chrome.runtime.sendMessage({ action: 'storeToken', token: accessToken });
  
      console.log('Logged in successfully');
    } catch (error) {
      console.error('Error during authentication:', error);
    }
  };
  

  return (
    <>
      <button onClick={onClick}>Click</button>
      <form onSubmit={handleSubmit}>
        <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type='submit'>Login</button>
      </form>
    </>
  );
}

export default App;

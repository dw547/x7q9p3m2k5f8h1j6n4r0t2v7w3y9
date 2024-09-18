// firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import axios from "axios";
const firebaseConfig = {
  apiKey: "AIzaSyDlw_N95DH3sSPr0LHkYHJ5brbrJ2x12iA",
  authDomain: "website-new-1d5d9.firebaseapp.com",
  projectId: "website-new-1d5d9",
  storageBucket: "website-new-1d5d9.appspot.com",
  messagingSenderId: "308842879678",
  appId: "1:308842879678:web:c4052e31d090ee38cedcef"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const vapidKey = 'BIhgh-c__0TKKe_MLhbWPguTzeBTbNxjKREwvZopUCGFEPybd4ViDKIibeBiEx_5wmWyye9sCYcehQwafdphLLA';
const topics = "all";

export const fetchToken = () => {
  return getToken(messaging, { vapidKey })
    .then((currentToken) => {
      if (currentToken) {
        console.log('Current token:', currentToken);
        subscribeTopic(currentToken);
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    })
    .catch((error) => {
      console.log('An error occurred while retrieving token:', error);
    });
};

export const requestNotificationPermission = () => {
  Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      fetchToken();
    } else {
      console.log('Notification permission denied.');
    }
  });
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Received foreground message:', payload);
      resolve(payload);
    });
  });


function  subscribeTopic (token)  {
   
       axios.post(
        `${process.env.REACT_APP_API_URI}/subscribe-topic`,
        {
          registration_token:token,
        },
        {
          headers: {
            Authorization: JSON.parse(localStorage.getItem("token")),
          },
        }
      ).then((response)=>{
        if (response.status === 200) {
          console.log("Notification Sent Sucessfully")
        }
      }).catch((error)=>{
        console.log(error)
      });
    
  
  };
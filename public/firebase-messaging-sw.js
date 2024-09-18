// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/8.6.8/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.6.8/firebase-messaging.js');

firebase.initializeApp({
  apiKey: "AIzaSyDlw_N95DH3sSPr0LHkYHJ5brbrJ2x12iA",
  authDomain: "website-new-1d5d9.firebaseapp.com",
  projectId: "website-new-1d5d9",
  storageBucket: "website-new-1d5d9.appspot.com",
  messagingSenderId: "308842879678",
  appId: "1:308842879678:web:c4052e31d090ee38cedcef"
});

const messaging = firebase.messaging();



messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);
  const { title, body } = payload.data;
  const options = {
    body: body,
  };
  self.registration.showNotification(title, options);

});


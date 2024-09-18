import React, { useEffect } from 'react';
import { messaging } from '../firebase';

const PushNotificationButton = () => {
  useEffect(() => {
    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const token = await messaging.getToken();
          console.log('Token:', token);
        } else {
          console.error('Push notifications permission denied');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    requestPermission();
  }, []);

  return (
    <button className='textwhite'>Enable Push Notifications</button>
  );
};

export default PushNotificationButton;
import image from './asset/notify.png'
self.addEventListener('push', event => {
    const options = {
      body: event.data.text(),
      icon: image, 
      data: {
        url: data.link, 
      },
    };
  
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  });


  
  self.addEventListener('notificationclick', event => {
    const notificationData = event.notification.data;
  
    if (notificationData.url) {
      clients.openWindow(notificationData.url);
    }
  
    event.notification.close();
  });

self.addEventListener('push', event => {
    const data = event.data.json();
    const promiseChain = self.registration.showNotification(
        data.title,
        {
            body: data.message, 
            icon: '/images/pizarra.png',
            badge: '/images/geoloca.png',
            image: '/images/billetera7.jpg',
        })
    event.waitUntil(promiseChain);
});



self.addEventListener('push', event => {
    const data = event.data.json();
    const promiseChain = self.registration.showNotification(
        data.title,
        {
            body: data.message, 
            icon: '/images/pizarra.png',
            badge: '/images/geoloca.png',
            image: '/images/billetera7.jpg'
        })
    event.waitUntil(promiseChain);
});

 // .then(() => {
    //     console.log(`Notificación ok!, data: ${data}`);
    // })
    // .catch(err => {
    //     console.log(`Error en el worker en showNotification: ${err}`)
    // })
    // self.addEventListener('push', e => {
    //     const data = e.data.json();
    //     console.log(data);
    //const promiseChain = self.registration.showNotification('Hello, World.');
    //e.waitUntil(promiseChain);
    // self.registration.showNotification(
    //     data.title,
    //     {
    //         body: data.message,
    //         icon: '/images/marcador.png'
    //     });
    // self.registration.showNotification(
    //          data.title,
    //     {
    //         body: data.message,
    //         icon: '/images/marcador.png'
    //     })
    //     .then((resultado)=>{
    //         console.log(`Notificación ok!`);
    //     })
    //     .catch((err)=>{ console.log(`Error en el worker en showNotification: ${err}`)})
//});


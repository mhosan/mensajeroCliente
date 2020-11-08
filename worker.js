//el worker será el encargado de escuchar, por lo tanto el listener va aqui

self.addEventListener('push', e => {
    const data = e.data.json();
    console.log(data);
    localStorage.setItem('mensaje', JSON.stringify(data));
    self.registration.showNotification(data.title, {
        body: data.message,
        icon: '/images/marcador.png'
    });
});

// Escuchamos el click en la ventana de notificación
//self.addEventListener('notificationclick', event => {
    //event.notification.close();
    // recuperamos la url que pasamos en el options
    //const { url } = event.notification.data;
    //console.log(url);
    //if (url) event.waitUntil(clients.openWindow(url));
  //});
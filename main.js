const PUBLIC_VAPID_KEY = 'BGWVb1Bj2YWYEaG23YsyW_IqSoz3ynLizo43Pzcfa7z1Snr3AMAOF_2BlL4SWb3n_5YLCicIFGONhoWuJ77ceXI';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
//https://mensajeropush.herokuapp.com/subscription
//http://localhost:3000/subscription'

const subscription = async () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./worker.js', { scope: '/' })
            .then(function (registration) {
                console.log('Service worker registration succeeded:', registration);
                const register = registration;
                register.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY) })
                    .then((subscription) => {  //subscription es el objeto que va a utilizar el servidor para comunicarse

                        fetch('http://localhost:3000/subscription', {
                            method: 'POST',
                            mode: 'cors',
                            body: JSON.stringify(subscription),
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        })
                            .then(() => {
                                console.log('suscripto ok!');
                            })
                            .catch(err => {
                                //alert(err)
                                console.log('error!', err);
                            })
                    });
            }, /*catch*/ function (error) {
                console.log('Service worker registration failed:', error);
            });
    } else {
        console.log('Service workers are not supported.');
    }

}
subscription();

if ('permissions' in navigator) {
    navigator.permissions.query({ name: 'notifications' }).then(function (notificationPerm) {
        notificationPerm.onchange = function () {
            console.log("Parece que el usuario cambió los permisos. Nuevo permiso: " + notificationPerm.state);
        };
    });
}


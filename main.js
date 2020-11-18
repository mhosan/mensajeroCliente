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

const urlLocal = 'http://localhost:3000';
const urlRemota = 'https://mensajeropush.herokuapp.com';

//---------------------------------------------------------------------
// mh: 17/11/20
// Registrar el service worker si este se encuentra disponible en el 
// navegador del usuario.
// Si la registración del web worker es exitosa, se envia una subscripción
// al servidor en una petición POST y se almacena en localStorage la clave
// auth generada.
//---------------------------------------------------------------------
const subscription = async () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./worker.js', { scope: '/' })
            .then(function (registration) {
                console.log('Service worker registration succeeded:', registration);
                const register = registration;
                register.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY) })
                    .then((subscription) => {  //subscription es el objeto que va a utilizar el servidor para comunicarse
                        fetch(urlRemota + '/subscription', {
                            method: 'POST',
                            mode: 'cors',
                            body: JSON.stringify(subscription),
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        })
                            .then(() => {
                                const laSuscrip = JSON.stringify(subscription);
                                const quebrado = laSuscrip.split("auth");
                                const elAuth = quebrado[1].substring(1);
                                //guardar la subscripción en localStorage
                                localStorage.setItem('auth', elAuth);
                                console.log(`Suscripto ok!. El auth: ${elAuth} se guardó localmente.`);
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



//---------------------------------------------------------------------
// mh: 17/11/20
// Detectar cuando el usuario hace cambios en los permisos de recibir
// notificaciones. SOLO en el caso de cambiar el permiso a denied se 
// enviará al servidor un pedido de borrar la clave (auth) que estaba 
// utilizando el usuario hasta ese momento.
// Si el usuario vuelve a permitir las notificaciones push, se generará
// una nueva clave.
//---------------------------------------------------------------------
if ('permissions' in navigator) {
    navigator.permissions.query({ name: 'notifications' }).then(function (notificationPerm) {
        notificationPerm.onchange = function () {
            console.log("El usuario cambió los permisos. Nuevo permiso: " + notificationPerm.state);
            if (notificationPerm.state == 'denied') {
                let claveBorrar = localStorage.getItem('auth');
                claveBorrar = claveBorrar.slice(0,-2);
                console.log(`Se enviará una petición de borrar la clave ${claveBorrar}`)
                fetch(urlRemota + '/delete/' + claveBorrar, {
                    method: 'DELETE',
                    mode: 'cors',
                    body: JSON.stringify(),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                    .then(() => {
                        console.log('Se envió el pedido de borrar la subscripción ok!');
                    })
                    .catch(err => {
                        //alert(err)
                        console.log('Error con el borrado de la clave', err);
                    })
            }
        };
    });
}


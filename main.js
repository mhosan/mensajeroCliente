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

//---------------------------------------------------------------------
// mh: 19/11/20
// URL a utilizar. Seteo de la const a utilizar
//---------------------------------------------------------------------
const urlLocal = 'http://localhost:3000';
const urlRemota = 'https://mensajeropush.herokuapp.com';
const url = urlLocal;

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
        await navigator.serviceWorker.register('./worker.js', { scope: '/' })
            .then(function (registration) {
                //console.log('Service worker registration succeeded:', registration);
                const register = registration;
                register.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY) })
                    .then(async (subscription) => {  //subscription es el objeto que va a utilizar el servidor para comunicarse
                        await fetch(url + '/subscription', {
                            method: 'POST',
                            mode: 'cors',
                            body: JSON.stringify(subscription),
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        })
                            .then((response) => {
                                console.log(response);
                                const laSuscrip = JSON.stringify(subscription);
                                const quebrado = laSuscrip.split("auth");
                                let elAuth = quebrado[1].substring(1);
                                elAuth = elAuth.slice(2, -3);
                                console.log(`el auth: ${elAuth}`);
                                localStorage.setItem('auth', elAuth);
                                console.log(`Suscripto ok!. El auth: ${elAuth} se guardó localmente.`);
                            })
                            .catch(err => {
                                //alert(err)
                                throw "Error en la llamada Ajax";
                                //console.log('--------------->error!', err);
                            })
                    });
            }, function (error) {
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
// mh: 18/11/20, se envia la peticion de borrar (el fetch) encubierto en
// un put a la url ../borrar, para evitar problemas con los argumentos 
// de este request desde el archivo 'main' del cliente y el request que
// se envia directo via api request
//---------------------------------------------------------------------
if ('permissions' in navigator) {
    navigator.permissions.query({ name: 'notifications' }).then(function (notificationPerm) {
        notificationPerm.onchange = function () {
            console.log("El usuario cambió los permisos. Nuevo permiso: " + notificationPerm.state);
            if (notificationPerm.state == 'denied') {
                let claveBorrar = localStorage.getItem('auth');
                const objJson = { "valor": claveBorrar };
                console.log('valor a borrar:', objJson.valor);

                console.log(`Se enviará una petición de borrar la clave ${claveBorrar}`)
                fetch(url + '/borrar', {
                    method: 'PUT',
                    mode: 'cors',
                    body: JSON.stringify(objJson),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                    .then(() => {
                        console.log('Se envió el pedido de borrar la subscripción ok!');
                    })
                    .catch(err => {
                        console.log('Error con el borrado de la clave', err);
                    })
            }
        };
    });
}


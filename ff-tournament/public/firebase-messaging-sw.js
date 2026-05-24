importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");

importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({

    apiKey: "AIzaSyBFnDxf64WN8MbO6yJH8OgRwgCm4LPQcls",
    authDomain: "jk-tournament-aab5a.firebaseapp.com",
    projectId: "jk-tournament-aab5a",
    storageBucket: "jk-tournament-aab5a.firebasestorage.app",
    messagingSenderId: "29537370630",
    appId: "1:29537370630:web:eb95c5a27b86ba8e5af987"


});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {

    self.registration.showNotification(


        payload.notification.title,

        {

            body: payload.notification.body,

            icon: "/logo192.png"

        }


    );

});
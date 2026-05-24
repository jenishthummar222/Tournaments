import { initializeApp } from "firebase/app";

import {
    getMessaging,
    getToken,
    onMessage
} from "firebase/messaging";

const firebaseConfig = {

    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,

    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,

    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,

    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,

    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,

    appId: import.meta.env.VITE_FIREBASE_APP_ID

};

const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);

// REQUEST PERMISSION
export const requestNotificationPermission = async() => {

    try {


        const permission = await Notification.requestPermission();

        if (permission !== "granted") {

            console.log("Notification permission denied");

            return null;

        }

        // REGISTER SERVICE WORKER
        const registration = await navigator.serviceWorker.register(
            "/firebase-messaging-sw.js"
        );

        // GET TOKEN
        const token = await getToken(

            messaging,

            {

                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,

                serviceWorkerRegistration: registration

            }

        );

        return token;


    } catch (err) {


        if (
            import.meta.env.DEV) {

            console.log("FCM ERROR:", err);

        }

        return null;

    }

};


// FOREGROUND MESSAGE
onMessage(messaging, (payload) => {

    console.log("Message received:", payload);

});
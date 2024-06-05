// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBpSVIpKy1uxXnyFfjf9v9TZgzgLIlDOSc",
  authDomain: "mycrumbs-5337a.firebaseapp.com",
  projectId: "mycrumbs-5337a",
  storageBucket: "mycrumbs-5337a.appspot.com",
  messagingSenderId: "463558654506",
  appId: "1:463558654506:web:0a0175445fe2f32fe56153",
 
};

const app = initializeApp(firebaseConfig);

if (!app) {
  initializeApp(firebaseConfig);
}

const messaging = getMessaging(app);

export { messaging , getToken , onMessage};

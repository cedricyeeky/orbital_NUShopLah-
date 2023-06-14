// firebase config key setup

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

// Web app's firebase config
const firebaseConfig = {

  apiKey: "AIzaSyBaD_978uAHA-vKKFSGpSv_jTaDlzTXBRI",

  authDomain: "nushoplah.firebaseapp.com",

  projectId: "nushoplah",

  storageBucket: "nushoplah.appspot.com",

  messagingSenderId: "431618692118",

  appId: "1:431618692118:web:203aa110965ad0c1135137"

};

// initialisation
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export { firebase };
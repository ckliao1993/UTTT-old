import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-analytics.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-database.js";
import { getAuth,
	setPersistence,
	onAuthStateChanged,
	signInWithCustomToken,
	browserSessionPersistence,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDKRApkcL9qs2w9lw_CsAnh-QeAByrgf9Q",
    authDomain: "uttt-4a96a.firebaseapp.com",
    databaseURL: "https://uttt-4a96a-default-rtdb.firebaseio.com",
    projectId: "uttt-4a96a",
    storageBucket: "uttt-4a96a.appspot.com",
    messagingSenderId: "121984318562",
    appId: "1:121984318562:web:2cb416d0b393fa9a75e53b",
    measurementId: "G-6W6BMW36EB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const database = getDatabase(app);
const info = {
	email: "",
	pwd: ""
};

// Auth state
onAuthStateChanged(auth, (user) => {
	if (user) {
		// User is signed in, see docs for a list of available properties
		const uid = user.uid;
		console.log(uid);
	} else {
		// User is signed out
		console.log("sign out");
	}
});

// Auth persistance
setPersistence(auth, browserSessionPersistence)
	.then(() => {
		return signInWithEmailAndPassword(auth, info.email, info.pwd);
	})
	.catch((error) => {
		const errorCode = error.code;
		const errorMessage = error.message;
	});

// Sign up 
$('#btn_sign_up').click(function(){
	info.email = $('#signup_user').val() + '@custom.com';
	info.pwd = $('#signup_pwd').val()

	console.log(info);
	createUserWithEmailAndPassword(auth, info.email, info.pwd)
	.then((userCredential) => {
		// Signed in 
		alert('singup');
		const user = userCredential.user;
		// window.location.href = '/path';
	})
	.catch((error) => {
		const errorCode = error.code;
		const errorMessage = error.message;
		alert('Sign up error, please try again later');
	});
});

// Sign in
$('#btn_sign_in').click(function(){
	info.email = $('#signin_user').val() + '@custom.com';
	info.pwd = $('#signin_pwd').val()

	console.log(info);
	signInWithEmailAndPassword(auth, info.email, info.pwd)
	.then((userCredential) => {
		alert('singin');
		// Signed in 
		const user = userCredential.user;
	})
	.catch((error) => {
		const errorCode = error.code;
		const errorMessage = error.message;
	});
});


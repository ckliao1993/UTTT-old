// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
// import { getDatabase} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-database.js";
// import { getAuth} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-auth.js";

// // Firebase configuration
// const firebaseConfig = {
// 	apiKey: "AIzaSyDKRApkcL9qs2w9lw_CsAnh-QeAByrgf9Q",
// 	authDomain: "uttt-4a96a.firebaseapp.com",
// 	databaseURL: "https://uttt-4a96a-default-rtdb.firebaseio.com",
// 	projectId: "uttt-4a96a",
// 	storageBucket: "uttt-4a96a.appspot.com",
// 	messagingSenderId: "121984318562",
// 	appId: "1:121984318562:web:2cb416d0b393fa9a75e53b",
// 	measurementId: "G-6W6BMW36EB"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const auth = getAuth();

// onAuthStateChanged(auth, (user) => {
// 	if (user) {
// 		globalThis.userinfo = user;
// 		console.log(userinfo);
// 		// User is signed in, see docs for a list of available properties
// 		const uid = user.uid;
// 	} else {
// 		// User is signed out
// 		alert('Sign out successfully');
// 	}
// });


let url = window.location.href;
$(document).ready(function() {
    //Check if log in, show link, if not, show create account
    console.log(window.userinfo);
    $('#invite_link').val(url);
    $('#create_link').modal('show');
});

$('#btn_new').click(function(){
    writeData(userinfo);
});

$('#btn_dark').click(function(){
    
});

$('#btn_copy').click(function(){
    $(this).find('i').toggleClass('bi-clipboard').toggleClass('bi-clipboard-check');
    $('#invite_link').select();
    navigator.clipboard.writeText(url);
    setTimeout(()=>{
        $(this).find('i').toggleClass('bi-clipboard-check').toggleClass('bi-clipboard');
    }, 3000);
});
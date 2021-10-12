import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-analytics.js";
import { getDatabase, ref, set} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-database.js";
import { getAuth,
	signOut,
	onAuthStateChanged,
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

// Initialize Firebase.
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const database = getDatabase(app);

// Set common variable.
const url = window.location.origin;
let game_id = new URL(location.href).searchParams.get("game");
console.log(game_id);

// Auth state
onAuthStateChanged(auth, (user) => {
	if (user) {
		globalThis.userinfo = user;
		// User is signed in, see docs for a list of available properties
		$('#btn_to_signout').show();
		$('#btn_to_login').hide();
	} else {
		// User is signed out
		$('#btn_to_signout').hide();
		$('#btn_to_login').show();
	}
});

// Sign up 
$("#f_register").submit(function(e) {
	e.preventDefault();
	let info = {
		email : $('#register_user').val() + '@custom.com',
		pwd : $('#register_pwd').val()
	};

	createUserWithEmailAndPassword(auth, info.email, info.pwd)
	.then((userCredential) => {
		// Signed in 
		const user = userCredential.user;
		$('m_start').modal('hide');
		if(!game_id){
			newGame(userinfo);
		}
	})
	.catch((error) => {
		alert('Register error, please try again');
	});
});

// Log in
$("#f_log_in").submit(function(e) {
	e.preventDefault();
	let info = {
		email : $('#login_user').val() + '@custom.com',
		pwd : $('#login_pwd').val()
	};

	signInWithEmailAndPassword(auth, info.email, info.pwd)
	.then((userCredential) => {
		// Signed in 
		const user = userCredential.user;
		$('#m_log_in').modal('hide');
	})
	.catch((error) => {
		alert('Log in error, please try again.');
	});
});

// Sign out
$('#btn_sign_out').click(function(){
	signOut(auth).then(() => {
		// Sign-out successful.
		window.location.replace('/..');
	}).catch((error) => {
		// An error happened.
	});
});

// Create a new game onclick.
$('.btn_new_game').click(()=>{
	if(userinfo){
		newGame(userinfo);
	} else {
		$('#m_start').modal('show');
	}
});

// Generate random string for game ID.
function makeGameId(){
    let result           = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for ( let i = 0; i < 6; i++ ) {
      	result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

// Create a new game action.
function newGame(userinfo){
	game_id = makeGameId();
	let game_url = window.location.origin + '/play.html?game=' + game_id;
	set(ref(database, 'games/' + game_id), {
		p1 : userinfo.email,
		p2 : "",
		now : 0,
		next : 9,
		last : 81,
		sets : ",,,,,,,,",
		moves : ",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,",
	}).then(()=>{
		window.location.replace(game_url);
	});
}


import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-analytics.js";
import { getDatabase,
	ref,
	set,
	update,
	onValue,
} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-database.js";
import { getAuth,
	signOut,
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
const url = window.location.origin;
let info = {}
let game_id = new URL(location.href).searchParams.get("game");
let move = "";

// Auth state
onAuthStateChanged(auth, (user) => {
	if (user) {
		globalThis.userinfo = user;
		// User is signed in, see docs for a list of available properties
		const uid = user.uid;
	} else {
		// User is signed out
	}
});

// Sign up 
// $('#btn_sign_up').click(function(){
$("#f_register").submit(function(e) {
	e.preventDefault();
	let info = {
		email : $('#register_user').val() + '@custom.com',
		pwd : $('#register_pwd').val()
	};

	console.log(info);
	createUserWithEmailAndPassword(auth, info.email, info.pwd)
	.then((userCredential) => {
		// Signed in 
		const user = userCredential.user;
		$('m_start').modal('hide');
		newGame(userinfo);
	})
	.catch((error) => {
		const errorCode = error.code;
		const errorMessage = error.message;
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

	console.log(info);
	signInWithEmailAndPassword(auth, info.email, info.pwd)
	.then((userCredential) => {
		alert('Log in');
		// Signed in 
		const user = userCredential.user;
		$('m_log_in').modal('hide');
		window.location.replace('/../games.html');
	})
	.catch((error) => {
		const errorCode = error.code;
		const errorMessage = error.message;
		alert(errorMessage);
	});
});

// Sign out
$('#btn_sign_out').click(function(){
	signOut(auth).then(() => {
		// Sign-out successful.
		// $('#m_sign_out').modal('hide');
		window.location.replace('/..');
	}).catch((error) => {
		// An error happened.
	});
});
$('#btn_new_game').click(function(){
	newGame(userinfo);
});
$('#btn_update_game').click(function(){
	console.log(userinfo);
	updateGame();
});


function writeData (userinfo){
	set(ref(database, 'users/' + userinfo.uid), {

	});
}
function updateGame(){
	console.log(game_id);
	let this_move = move + "A";
	let updates = {};
	updates['/games/' + game_id + '/moves'] = this_move;
	update(ref(database), updates);
}
function makeGameId(){
    let result           = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for ( let i = 0; i < 6; i++ ) {
      	result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}
function newGame(userinfo){
	game_id = makeGameId();
	let game_url = window.location.origin + '/play.html?game=' + game_id;
	console.log(game_url);
	set(ref(database, 'games/' + game_id), {
		p1 : userinfo.uid,
		p2 : "",
		move : "",
	}).then(()=>{
		window.location.replace(game_url);
	});
}
function checkUser(){
	console.log("11111111111" + userinfo);
}

onValue(ref(database, '/games/' + game_id + '/moves'), (snapshot) => {
	console.log("move:" + snapshot.val());
	move = snapshot.val();
});
onValue(ref(database, '/games/' + game_id + '/p2'), (snapshot) => {
	console.log("p2:" + snapshot.val() + "has accept your challenge!");
});

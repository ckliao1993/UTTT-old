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
const url = window.location.href;
let game_id = new URL(location.href).searchParams.get("game");
let theme = localStorage.getItem('theme');
let dark = window.matchMedia("(prefers-color-scheme: dark)").matches ? 'dark':'light';
let userinfo;
if(theme == null){
	changeTheme(dark);
} else {
	changeTheme(theme);
}
console.log(game_id);

// Auth state
onAuthStateChanged(auth, (user) => {
	if (user) {
		userinfo = user;
		// User is signed in, see docs for a list of available properties
		$('#btn_to_signout').show();
		$('#btn_to_login').hide();
		if(!$('#name').length){
			$('#btn_to_login').before('<a class="dropdown-item" id="name">'+userinfo.email.split('@')[0]+'</a>');
		}
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
	console.log(info);
	createUserWithEmailAndPassword(auth, info.email, info.pwd)
	.then((userCredential) => {
		// Signed in 
		const user = userCredential.user;
		$('#m_start').modal('hide');
		if(game_id == null){
			newGame(info);
		} else {
			location.reload();
		}
	})
	.catch((error) => {
		switch (error.code){
			case 'auth/weak-password':
				alert('密碼必須至少含有6個字元');
				break;
			case 'auth/invalid-email':
				alert('使用者名稱不可包含符號');
				break;
			case 'auth/email-already-in-use':
				alert('使用者名稱已被使用');
				break;
			default:
				console.log(error.code, error.message);
		}
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
		switch (error.code){
			case 'auth/wrong-password':
				alert('密碼錯誤');
				break;
			case 'auth/invalid-email':
				alert('使用者名稱錯誤');
				break;
			case 'auth/user-not-found':
				alert('找不到使用者');
				break;
			default:
				alert('登入錯誤，請再試一次。');
				console.log(error.code, error.message);
		}
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

// Theme btn onclick.
$('#theme').change(()=>{
	if($('#theme').prop('checked')){
		changeTheme('dark');
		localStorage.setItem("theme", 'dark');
	} else {
		changeTheme('light');
		localStorage.setItem("theme", 'light');
	}
});

// 2nd layer dropdown layer hover action.
$('#btn_drop, #d_two').mouseover(()=>{
	$('#d_two').show();
});
$('#btn_drop, #d_two').mouseout(()=>{
	$('#d_two').hide();
});

// Change language
$('.btn_lang').click((e)=>{
	let lang = e.target.dataset.lang;
	console.log(lang);
	// console.log(this);
	// console.log(this.$i18n);
	// localStorage.setItem(ox_Lang, lang);
	// this.$i18n.locale = lang;
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
	let game_url = url.substring(0, url.lastIndexOf('/')) + '/play.html?game=' + game_id;
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

function changeTheme (state){
	if(state == 'dark'){
		$('#theme').prop('checked', true);
		$('body').toggleClass('dark', true);
		$('#icon_theme').html('<i class="bi bi-moon-fill text-light"></i>');
	} else {
		$('#theme').prop('checked', false);
		$('body').toggleClass('dark', false);
		$('#icon_theme').html('<i class="bi bi-sun-fill"></i>');
	}
}
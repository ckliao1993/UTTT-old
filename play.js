import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getDatabase,
    ref,
	set,
    get,
	push,
    child,
	update,
    onValue,
} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-database.js";
import { getAuth, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-auth.js";

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
const auth = getAuth();
const database = getDatabase(app);
let game_id = new URL(location.href).searchParams.get("game");
let game, piece, player;

onAuthStateChanged(auth, (user) => {
	if (user) {
		globalThis.userinfo = user;
		console.log(userinfo);
		// User is signed in, see docs for a list of available properties
		const uid = user.uid;
		getGame();
	} else {
		getGame();
		// User is signed out
		$('#m_join').modal('show');
		$('#game').click(()=>{
			$('#m_join').modal('show');
		});		
	}
});

let url = window.location.href;
$('div.board.small').click((event)=>{
	makeAmove(event);
});

$(document).ready(function() {
	//Check if log in, show link, if not, show create account
	// $('#create_link').modal('show');

});

$('#btn_new').click(function(){
	writeData(userinfo);
});

$('#btn_test').click(()=>{
	$('#t_game_status').toast('show');
})

$('#btn_copy').click(function(){
	$(this).find('i').toggleClass('bi-clipboard').toggleClass('bi-clipboard-check');
	$('#invite_link').select();
	navigator.clipboard.writeText(url);
	setTimeout(()=>{
		$(this).find('i').toggleClass('bi-clipboard-check').toggleClass('bi-clipboard');
	}, 3000);
});

async function getGame(){
	console.log(game_id);
	if(game_id){
		onValue(ref(database, '/games/' + game_id), (snapshot) => {
			game = snapshot.val();
			if(userinfo){
				checkGameStatus(game);
			}
		},{onlyOnce: true});
	}
}
function checkGameStatus(game){
	if(game.p1 == userinfo.email){
		player = 'circle';
		piece = '<i class="bi bi-circle"></i>';

		if(game.moves.length == 0){
			setInterval(()=>{
				$("[data-boardno]").toggleClass('bg');
			}, 1000);
			$("[data-boardno]").toggleClass('allow');
		}
		if(game.p2 == ""){
			$('#invite_link').val(url);
			$('#m_create_link').modal('show');
			$('#t_msg').text("Your opponent haven't accept your invite yet.");
			$('#t_game_status').toast('show');
		} else {
			$('#t_msg').text("Your opponent have accept your challenge!");
			$('#t_game_status').toast('show');
		}
	} else if (game.p2 == userinfo.email){
		player = 'x-lg';
		piece = '<i class="bi bi-x-lg"></i>';
	} else if (game.p2 == ""){
		joinGame(userinfo);
	} else {
		//spectator mode
		alert('Sorry, somebody is already in this battle.');
	}
}

function makeAmove(event){
	// let this_move = game.moves + event.target.dataset.cellno + ',';
	// let updates = {};
	// updates['/games/' + game_id + '/moves'] = this_move;
	// update(ref(database), updates).then(()=>{});
	let moves = ref(database, '/games/'+game_id+'/moves');
	let new_move = push(moves);
	set(new_move, event.target.dataset.cellno
	).then(()=>{
		console.log("OKKKKKKKKKKKKKKKKKKKKKKK");
	});
	$(event.target).html(piece);
}

function joinGame(userinfo){
	if(game.p2 == ""){
		let updates = {};
		updates['/games/' + game_id + '/p2'] = userinfo.email;
		update(ref(database), updates).then(()=>{
			game.p2 = userinfo.email;
			piece = '<i class="bi bi-x"></i>';
		});
	} else {
		alert('Sorry, somebody is already in this battle.');
	}

}

onValue(ref(database, '/games/' + game_id), (snapshot) => {
	let move = snapshot.val().moves;
	let p1 = snapshot.val().p1;
	let p2 = snapshot.val().p2;
	let allow = move[move.length-1] % 9;
	if((move.length % 2 == 0 && p1 == userinfo.email) || (move.length % 2 !== 0 && p2 == userinfo.email)){
		// even, p1 turn
		// odd, p2 turn
		setInterval(()=>{
			$("div[data-boardno="+allow+"]").toggleClass('bg');
		}, 1000);
		$("div[data-boardno="+allow+"]").toggleClass('allow');
	} else {
		console.log("waiting");
	}
});
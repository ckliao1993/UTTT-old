import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getDatabase,
    ref,
	set,
    get,
	push,
    child,
	update,
    onValue,
	onChildAdded,
} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-database.js";
import { getAuth, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-auth.js";

// Loading gif: https://icons8.com/preloaders/

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
let game, piece, player, shine;

$(document).ready(()=>{
	$('#m_loading').modal('show');
})

onAuthStateChanged(auth, (user) => {
	if (user) {
		// User is signed in, see docs for a list of available properties
		globalThis.userinfo = user;
		console.log(userinfo);
	} else {
		// User is signed out
		$('#m_join').modal('show');
		$('#game').click(()=>{
			$('#m_join').modal('show');
		});		
	}
});

let url = window.location.href;
$('div.cell.small').click((event)=>{
	if($(event.target).parent().parent().hasClass('allow')){
		makeAmove(event);
		clearInterval(shine);
		$('div.allow').toggleClass('bg', false).toggleClass('allow', false);
	} else {
		toast("It's not your turn, please wait for other opponent.");
	}
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

function checkGameStatus(game, move){
	if(game.p1 == userinfo.email){
		player = 0;

		if(game.moves.length == 0){
			shine = setInterval(()=>{
				$("[data-boardno]").toggleClass('bg');
			}, 1000);
			$("[data-boardno]").toggleClass('allow', true);
		}
		if(game.p2 == ""){
			$('#invite_link').val(url);
			$('#m_create_link').modal('show');
			toast("Your opponent haven't accept your invite yet.");
		} else {
			toast("Your opponent have accept your challenge!");
		}
	} else if (game.p2 == userinfo.email){
		player = 1;
	} else if (game.p2 == "" && userinfo !== ''){
		joinGame(userinfo);
	} else {
		//spectator mode
		alert('Sorry, somebody is already in this battle.');
	}
	for(let i in move){
		draw(i, move[i]);
	}
}

function makeAmove(event){
	$(event.target).html('<img src="loading.gif" style="width:100%; vertical-align:top;">');
	let this_move = game.moves + event.target.dataset.cellno + ',';
	let updates = {};
	updates['/games/' + game_id + '/moves'] = this_move;
	update(ref(database), updates).then(()=>{});
}

function joinGame(userinfo){
	if(game.p2 == ""){
		let updates = {};
		updates['/games/' + game_id + '/p2'] = userinfo.email;
		update(ref(database), updates).then(()=>{
			game.p2 = userinfo.email;
		});
	} else {
		alert('Sorry, somebody is already in this battle.');
	}
}

function draw(index, cellno){
	let piece;
	if(index % 2 == 0){
		piece = '<i class="bi bi-circle"></i>'; //oo
	} else {
		piece = '<i class="bi bi-x-lg"></i>'; //xx
	}
	$('div[data-cellno="' + cellno + '"]').html(piece);
}

function toast(msg){
	$('#t_msg').text(msg);
	$('#t_game_status').toast('show');
}

onValue(ref(database, '/games/' + game_id), (snapshot) => {
	$('#m_loading').modal('hide');
	let move = snapshot.val().moves.split(',');
	let cut_null = move.pop();
	if(game){
		// Game data exist, we have got a new move. Draw the new one.
		game = snapshot.val();
		let last_index = move.length-1;
		let last_move = move[last_index];
		draw(last_index, last_move);
		let allow_area = last_move % 9;
		if(move.length % 2 == player){
			// This player's turn. (Game movement counts match player character.)
			shine = setInterval(()=>{
				$("div[data-boardno="+ allow_area +"]").toggleClass('bg');
			}, 1000);
			$("div[data-boardno="+ allow_area +"]").toggleClass('allow', true);

		} else {
			// Not your turn. Wait.
			console.log('waiting...');
		}
	} else {
		// No game data, this page is new! Draw all pieces.
		game = snapshot.val();
		console.log(game);
		checkGameStatus(game, move);
	}
});
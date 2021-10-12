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
const piece_0 = '<i class="bi bi-circle"></i>'; // oo
const piece_1 = '<i class="bi bi-x-lg"></i>'; // xx
let toast_no = 0;
let game_id = new URL(location.href).searchParams.get("game");
let game, player, shine, userinfo;
let url = window.location.href;
const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

$(document).ready(()=>{
	$('#m_loading').modal('show');
})

// Check User state.
onAuthStateChanged(auth, (user) => {
	if (user) {
		// User is signed in, see docs for a list of available properties
		userinfo = user;
		console.log(userinfo);
	} else {
		// User is signed out
		$('#m_start').modal('show');
		$('#game').click(()=>{
			$('#m_start').modal('show');
		});		
	}
});


// Cell action when click.
$('div.cell.small').click((event)=>{
	if($(event.target).parent().parent().hasClass('allow')){
		makeAmove(event);
		clearInterval(shine);
		$('div.allow').toggleClass('bg', false).toggleClass('allow', false);
	} else {
		toast("It's not your turn, please wait for other opponent.");
	}
});

$('#btn_dark').click(()=>{
	toast('helpppppppppppppppppppppppp');
});

// Copy icon click action
$('#btn_copy').click(function(){
	$(this).find('i').toggleClass('bi-clipboard', false).toggleClass('bi-check', true);
	$('#invite_link').select();
	navigator.clipboard.writeText(url);
	setTimeout(()=>{
		$(this).find('i').toggleClass('bi-check', true).toggleClass('bi-clipboard', false);
	}, 3000);
});

// Check who is this uer, if set, call light().
function checkUserStatus(game){
	console.log("checkUserStatus");
	if(game.p1 == userinfo.email){
		player = 0;
		if(game.p2 == ""){
			$('#invite_link').val(url);
			$('#m_create_link').modal('show');
			toast("Your opponent haven't accept your invite yet.");
		} else {
			toast("Your opponent have accept your challenge!");
		}
		light(player);
	} else if (game.p2 == userinfo.email){
		player = 1;
		light(player);
	} else if (game.p2 == "" && userinfo !== ''){
		joinGame(userinfo);
	} else {
		alert('Sorry, somebody is already in this battle.');
	}
}

// Light up the allow area.
function light(player){
	let other = player ? game.p1.split('@')[0] : game.p2.split('@')[0] ;
	console.log("light", game.now, player, game.next, other);
	if(game.now == player){
		// It's your turn.
		if(game.next == 9 || game.sets.includes(game.next)){
			// Light all.
			shine = setInterval(()=>{
				$("[data-cellno="+ game.last +"]").toggleClass('bg-g');
				$("[data-boardno]").toggleClass('bg');
			}, 1000);
			$("[data-boardno]").toggleClass('allow', true);
		} else {
			// Light it.
			shine = setInterval(()=>{
				$("[data-cellno="+ game.last +"]").toggleClass('bg-g');
				$("[data-boardno="+ game.next +"]").toggleClass('bg');
			}, 1000);
			$("[data-boardno="+ game.next +"]").toggleClass('allow', true);
		}
		if(game.last<81){toast(other + " just made a move.");}
	} else {
		// It's not your turn, wait for it.
		toast("It's "+ other +"'s turn, please wait.");
	}
}

// User make a move action, with a loading gif that disappear too soon.
function makeAmove(event){
	$(event.target).html('<img src="loading.gif" style="width:100%; vertical-align:top;">');
	let updates = {};
	let last = event.target.dataset.cellno;
	game.moves[last] = player;
	updates['/games/' + game_id + '/moves'] = game.moves;
	updates['/games/' + game_id + '/now'] = player ? 0 : 1;
	updates['/games/' + game_id + '/last'] = last;
	updates['/games/' + game_id + '/next'] = last % 9;
	update(ref(database), updates).then(()=>{});
}

// New user join game when no p2 is in game data.
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

// Draw pieces depends on user character.
function draw(who, where){
	console.log("who", who);
	who = 'piece_' + who;
	$('div[data-cellno="' + where + '"]').html(who);
}

// Check if small or big board are finish.
function checkGame(this_game){
	for (let i = 0; i <= 7; i++) {
		const winCondition = winningConditions[i];
		let a = this_game[winCondition[0]];
		let b = this_game[winCondition[1]];
		let c = this_game[winCondition[2]];
		if (a === '' || b === '' || c === '') {
			continue;
		}
		if (a === b && b === c) {
			return a;
		}
	}
}

// Show a cute toast with message.
function toast(msg){
	toast_no ++;
	let id = "t_" + toast_no;
	let html = '<div id="'+ id +'" class="toast" role="alert" aria-live="assertive" aria-atomic="true"><div class="toast-header"><i class="bi bi-megaphone-fill"></i><strong class="me-auto mx-4">OOXX</strong><button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button></div><div class="toast-body"></div></div>';
	$('#t_container').append(html);
	$("#" + id +'>.toast-body').append(msg);
	$('#'+ id).toast('show');
}

// Listen on database change
onValue(ref(database, '/games/' + game_id), (snapshot) => {
	$('#m_loading').modal('hide');
	$('#msg_user').text(snapshot.val().p1.split('@')[0] + " has challenge you!!");

	// if(game){
	// 	// Game data exist, we have got a new move. Draw the new one.
	// 	draw(snapshot.val().moves[snapshot.val().last], snapshot.val().last);
	// 	game = snapshot.val();
	// } else {
		// No game data, this page is new! Draw all pieces.

		// Trying draw all pieces every time.
	let board = 0;
	game = snapshot.val();
	game.sets = game.sets.split(',');
	game.moves = game.moves.split(',');
	for(let j in game.sets){
		if(game.sets[j]){
			game.sets[j] = parseInt(game.sets[j]);
			$("[data-boardno="+ j +"]").toggleClass("bg-" + game.sets[j], true)
			$("[data-boardno="+ j +"]").removeAttr("data-boardno");
		}
	}
	for(let i in game.moves){
		if(game.moves[i]){
			game.moves[i] = parseInt(game.moves[i]);
			draw(game.moves[i], i);
		}
	}
	for(let k = 0; k<80; k += 9){
		let win = checkGame(game.moves.slice(k, k+9));
		if(win){
			game.sets[board] = win;
		}
		board ++;
	}
	let winner = checkGame(game.sets);
	if(winner){
		$('#msg_color').text(winner ? "BlUE WIN!": "RED WIN");
		$('#msg_con').text(winner ? game.p2.split('@')[0]+" WIN!!!" : game.p1.split('@')[0]+" WIN!!!");
		$('#m_win').modal('show');
		$('#game').click(()=>{
			$('#m_win').modal('show');
		});		
	} else {
		checkUserStatus(game);
	}
	console.log(game);
	// }

});
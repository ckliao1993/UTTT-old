import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getDatabase,
    ref,
	set,
	update,
    onValue,
} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-database.js";
import { getAuth, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-auth.js";
// import * as htmlToImage from 'https://cdn.jsdelivr.net/npm/html-to-image@1.9.0/lib/index.min.js';
// import { toPng, toJpeg } from 'https://cdn.jsdelivr.net/npm/html-to-image@1.9.0/lib/index.min.js';

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

// Set common variable.
// const piece_0 = '<i class="bi bi-circle align-middle"></i>'; // oo
// const piece_1 = '<i class="bi bi-x-lg align-middle"></i>'; // xx
const piece_0 = '<svg width="80%" height="80%" fill="currentColor" class="bi bi-circle mx-auto my-auto" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/></svg>'; // oo
const piece_1 = '<svg width="90%" height="90%" fill="currentColor" class="bi bi-x-lg mx-auto my-auto" viewBox="0 0 16 16"><path fill-rule="evenodd" clip-rule="evenodd" d="M13.854 2.146a.5.5 0 0 1 0 .708l-11 11a.5.5 0 0 1-.708-.708l11-11a.5.5 0 0 1 .708 0Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M2.146 2.146a.5.5 0 0 0 0 .708l11 11a.5.5 0 0 0 .708-.708l-11-11a.5.5 0 0 0-.708 0Z"/></svg>'; // xx
let toast_no = 0;
let game_id = new URL(location.href).searchParams.get("game");
let url = window.location.href;
let game, player, shine, userinfo;
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
		$('#game').click(()=>{
			$('#m_start').modal('show');
		});		
	}
});

// Cell action when click.
$('div.cell.small').click((event)=>{
	let other = player ? game.p1.split('@')[0] : game.p2.split('@')[0] ;
	if(game.now !== player){
		toast("現在是對手" + other + "的回合");
		return;
	}
	if($(event.target).is('svg')){
		toast("想幹嘛?");
		return;
	}
	if($(event.target).parent().parent().hasClass('allow')){
		makeAmove(event);
		clearInterval(shine);
		$('div.allow').toggleClass('bg bg-g allow', false);
	} else {
		toast("請將棋子放入閃爍的大棋盤格中");
	}
});

$('#btn_view_game').click(()=>{
	html2canvas(document.querySelector("body")).then(canvas => {
		document.body.appendChild(canvas)
	});
});

// Copy icon click action
$('#btn_copy').click(()=>{
	$(this).find('i').toggleClass('bi-clipboard', false).toggleClass('bi-check', true);
	$('#invite_link').select();
	navigator.clipboard.writeText(url);
	setTimeout(()=>{
		$(this).find('i').toggleClass('bi-check', true).toggleClass('bi-clipboard', false);
	}, 3000);
});

// Check who is this uer, if set, call light().
function checkUserStatus(game){
	if(!userinfo){
		$('#m_start').modal('show');
	} else if (game.p1 == userinfo.email){
		player = 0;
		if(game.p2 == ""){
			$('#invite_link').val(url);
			$('#m_create_link').modal('show');
			toast("你的對手尚未接受邀請");
		}
		light(player);
	} else if (game.p2 == userinfo.email){
		player = 1;
		light(player);
	} else if (game.p2 == ""){
		joinGame(userinfo);
	} else {
		alert('抱歉，有人搶先一步接受了對戰邀請');
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
		if(game.last<81){toast(other + " 下了一顆棋子");}
	}
}

// User make a move action, with a loading gif that disappear too soon.
async function makeAmove(event){
	$(event.target).html('<img src="../img/loading.gif" style="width:100%; vertical-align:top;">');
	let updates = {};
	let last = event.target.dataset.cellno;
	let board = last / 9;
	game.moves[last] = player;
	let win = await checkGame(game.moves.slice(board*9, board*9+9));
	if(win){game.sets[board] = win;}
	updates['/games/' + game_id + '/moves'] = game.moves.join(',');
	updates['/games/' + game_id + '/sets'] = game.sets.join(',');
	updates['/games/' + game_id + '/now'] = player ? 0 : 1;
	updates['/games/' + game_id + '/next'] = last % 9;
	updates['/games/' + game_id + '/last'] = last;
	update(ref(database), updates).then(()=>{});
}

// New user join game when no p2 is in game data.
function joinGame(userinfo){
	let updates = {};
	updates['/games/' + game_id + '/p2'] = userinfo.email;
	update(ref(database), updates).then(()=>{
		game.p2 = userinfo.email;
	});
	toast('歡迎來到 OOXX');
}

// Draw pieces depends on user character.
function draw(who, where){
	$('div[data-cellno="' + where + '"]').html(who ? piece_1 : piece_0);
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
	$('.toast.hide').remove();
}

// Listen on database change
onValue(ref(database, '/games/' + game_id), (snapshot) => {
	$('#m_loading').modal('hide');
	$('#msg_user').html("<span class='oo'>" + snapshot.val().p1.split('@')[0] + "</span> 想要挑戰你");

	// Draw all pieces every time.
	let board = 0;
	game = snapshot.val();
	game.sets = game.sets.split(',');
	game.moves = game.moves.split(',');

	game.moves.forEach((value, index)=>{
		if(value){
			value = parseInt(value);
			draw(value, index);
		}
	});
	let winner = checkGame(game.sets);
	if(winner){
		$('#msg_color').text(winner ? "藍方獲勝!!": "紅方獲勝!!");
		$('#msg_con').text(winner ? game.p2.split('@')[0]+" 贏了!!!" : game.p1.split('@')[0]+" 贏了!!!");
		$('#m_win').modal('show');
		$('#game').click(()=>{
			$('#m_win').modal('show');
		});		
	} else {
		for(let k = 0; k<80; k += 9){
			let win = checkGame(game.moves.slice(k, k+9));
			if(win){game.sets[board] = win;}
			board ++;
		}
		checkUserStatus(game);
	}
	game.sets.forEach((value, index)=>{
		if(value){
			value = parseInt(value);
			$("[data-boardno="+ index +"]").toggleClass("bg-" + value, true)
			$("[data-boardno="+ index +"]").removeAttr("data-boardno");
		}
	});
	console.log(game);
});
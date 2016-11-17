var rooms1Div = $('#row1')[0];
var rooms2Div = $('#row2')[0];
var rooms1 = [101,102,103,104,105,106,107];
var rooms2 = [211,212,213,214,215,216,217];
window.rooms = [];

function initialize() {
	// Create buttons
	var rows = [rooms1, rooms2];
	var rowDivs = [rooms1Div, rooms2Div];
	var rowDiv = rowDivs[0];
	var buttons = [];
	for (var rowId = 0; rowId < rows.length; rowId++) {
		var row = rows[rowId];

		for (var roomId = 0; roomId < row.length; roomId++) {
			var room = row[roomId];
			var led = document.createElement("DIV");
			// led.className = 'led-box';
			buttons += "<div id='"+room+"' class='room-button waves-effect waves-light blue-text white'>" + room + "</div>";
		}

	}
	rowDiv.innerHTML = buttons;

	$('.room-button').click(function() {
		var room = +this.id;
		var wasSelected = rooms.indexOf(room) >= 0;
		setSelected(room, !wasSelected);
	});

	for (var i = 0; i < rooms.length; i++) {
		var room = rooms[i];
		setSelected(room, true);
	}

	$('#spin-again').click(function() {
		restart();
	});
}

window.restart = function() {
	console.log('Deselect winner:', currentRotation, winningSlice(currentRotation), rooms[winningSlice(currentRotation)]);
	setSelected(rooms[winningSlice(currentRotation)], false);
	initialValues();
	$('#overlay').css('opacity', 1);
	$('#ui').css('display', 'block');
	$('#done').css('display', 'none');
	$('#done #congratulate').css('visibility', 'hidden');
	$('#done #winner').css('visibility', 'hidden');
}

function showWinner() {
	console.log('Winner:', currentRotation, winningSlice(currentRotation), rooms[winningSlice(currentRotation)]);
	$('#ui').css('display', 'none');
	$('#done #winner').text(rooms[winningSlice(currentRotation)]);
	$('#done').css('display', 'block');
	$('#overlay').css('opacity', 1);

	setTimeout(function() {
		(new Audio("impact.mp3")).play();
		$('#done #congratulate').css('visibility', 'visible');
	}, 1000);

	setTimeout(function() {
		(new Audio("impact.mp3")).play();
		$('#done #winner').css('visibility', 'visible');
	}, 2000);
}

function setSelected(room, selected) {
	var button = $('.room-button#' + room);
	if (selected) {
		button.removeClass('white');
		button.removeClass('blue-text');
		button.addClass('blue');
		button.addClass('white-text');
		rooms = _.union(rooms, [room]);
	} else {
		button.removeClass('blue');
		button.removeClass('white-text');
		button.addClass('white');
		button.addClass('blue-text');
		rooms = _.difference(rooms, [room]);
	}

	checkWheelValid();
};

function checkWheelValid() {
	if (rooms.length < 3) {
		$('#wheel').css('opacity', 0);
	} else {
		$('#wheel').css('opacity', 1);
	}
}

initialize();

$('#spin-now').click(function() {
	$('#overlay').css('opacity', 0);
	startSpinner();
});

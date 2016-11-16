var rooms1Div = $('#row1')[0];
var rooms2Div = $('#row2')[0];
var rooms1 = [101,102,103,104,105,106,107];
var rooms2 = [211,212,213,214,215,216,217];
window.rooms = [211, 105];

function initialize() {
	// Create buttons
	var rows = [rooms1, rooms2];
	var rowDivs = [rooms1Div, rooms2Div];
	for (var rowId = 0; rowId < rows.length; rowId++) {
		var row = rows[rowId];
		var rowDiv = rowDivs[rowId];
		var buttons = [];

		for (var roomId = 0; roomId < row.length; roomId++) {
			var room = row[roomId];
			buttons += "<div class='room-button "+room+"'>" + room + "</div>";
		}

		rowDiv.innerHTML = buttons;
	}

	$('.room-button').click(function() {
		var room = this.classList[1];
		var wasSelected = this.classList.contains('selected')
		console.log('Clicked', this, wasSelected);
		if (wasSelected) {
			rooms = _.difference(rooms, [room]);
			$(this).removeClass('selected');
		} else {
			rooms.push(room);
			$(this).addClass('selected');
		}
	});

	for (var roomId = 0; roomId < rooms.length; roomId++) {
		var room = rooms[roomId];
		$('.room-button.' + room).addClass('selected');
	}
}

initialize();

$('#spin-now').click(function() {
	$('#overlay').css('display', 'none');
	startSpinner();
});

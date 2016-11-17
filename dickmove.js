$(document).ready(function() {
	if (!window.localStorage) {
		$('#your-turn').text("Your device sucks and you won't be able to use this.");
		return;
	}

	var rooms = [101,102,103,104,105,106,107,211,212,213,214,215,216,217];
	for (var r = 0; r < rooms.length; r++) {
		(function(r) {
			var ls = 'select-' + r;
			var room = rooms[r];
			var label = document.createElement("LABEL");
			var toggle = document.createElement("INPUT");
			var selected = !!localStorage.getItem(ls);
			toggle.type = 'checkbox';
			toggle.checked = selected;
			label.innerText = room;
			$(label).append(toggle);
			$(toggle).change(function(e) {
				var value = e.target.checked;
				if (value) {
					window.localStorage.setItem(ls, 1);
				} else {
					window.localStorage.removeItem(ls);
				}
			});
			$('#your-turn').append(label);
			$('#your-turn').append("<br />");
		})(r);
	}
});

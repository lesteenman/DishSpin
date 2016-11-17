// TODO: Better colors


var overlay = $('#overlay')[0];
var canvas = $('#wheel')[0];
var ctx = canvas.getContext("2d");

var baseSize = Math.min(document.body.clientHeight, document.body.clientWidth);

function resize() {
	var height = document.body.clientHeight;
	var width = document.body.clientWidth;
	var size = Math.min(height, width);
	$(canvas).css({
		position: 'absolute',
		top: height > width ? (height - size) / 2 + 'px' : '',
		left: width > height ? (width - size) / 2 + 'px' : '',
		width: size + 'px',
		height: size + 'px',
	});
}

$(window).resize(resize);

window.initialValues = function() {
	window.currentRotation = 0;
	window.acceleration = 25;
	window.friction = 15;
	window.frictionMult = 250; // How friction is affected by speed
	window.speed = 0.5;
	window.stopped = false;
	window.started = false;
	window.sling = false;
	window.foundPrediction = false;

	window.predictions = [];
}

initialValues();

function nextSpeed(speed, dt) {
	var currentFriction = 1 + speed / frictionMult;
	speed += acceleration * currentFriction * dt;
	return speed;
}

function nextRotation(speed, rotation, dt) {
	rotation += speed * dt;
	rotation %= 360;
	return rotation;
}

function predictEnd(deg) {
	var speed = window.speed;
	var rotation = deg;
	var t = 0;
	var dt = 1/200;
	while (speed > 0) {
		speed = nextSpeed(speed, dt);
		rotation = nextRotation(speed, rotation, dt);
		t += dt;
	}
	return winningSlice(rotation);
}

function initialize() {
	$(canvas).prop('width', baseSize)
	$(canvas).prop('height', baseSize)
	resize();
	requestAnimationFrame(tick);
	// setInterval(tick, 1/tickrate);
}

function startSpinner() {
	if (localStorage !== undefined) {
		for (var r = 0; r < rooms.length; r++) {
			var room = rooms[r];
			if (!!localStorage.getItem('select-'+room)) {
				predictions.push(+room);
			}
		}
	}
	console.log('Predictions:', predictions);

	started = true;
	stopped = false;
	sling = Math.random() * 550 + 500;
	acceleration = 500;
}

window.currentWinner = function() {
	return winningSlice(currentRotation);
}

window.winningSlice = function(deg) {
	deg = deg + 90;
	if (deg > 360) deg -= 360;
	sliceDeg = 360/rooms.length;
	return (1 + Math.floor(deg / sliceDeg)) % rooms.length;
}

function finish() {
	var winner = winningSlice(currentRotation); // -(Math.ceil(currentRotation / 360 * rooms.length) - 1) % rooms.length;
	showWinner();
	// console.log('winner:', winner, rooms[winner]);
}

var last = null;
var lastSection = currentWinner();

function tick(time) {
	if (rooms.length <= 1) {
		requestAnimationFrame(tick);
		return;
	}

	if (last === null) last = time;
	var dt = (time - last) / 1000;
	last = time;

	// TODO: Correct for close predictions

	// Update acceleration and see if the wheel has stopped
	if (sling) {
		if (speed > sling) {
			sling = false;
			acceleration = 0
		}
	} else if (started && !foundPrediction) {
		acceleration = -friction;
		if (predictions.length) {
			var r1 = rooms[predictEnd(currentRotation)];
			var r2 = rooms[predictEnd(currentRotation - 5)];
			var r3 = rooms[predictEnd(currentRotation + 5)];
			acceleration = 0;
			if (predictions.indexOf(r1) >= 0 &&
				predictions.indexOf(r2) >= 0 &&
				predictions.indexOf(r3) >= 0) {
				acceleration = -friction;
				foundPrediction = true;
			}
		} else {
			foundPrediction = true;
		}
	} else if (!started && speed > 120) {
		acceleration = 0;
	} else if (speed <= 0 && started) {
		speed = 0;
		stopped = true;
		started = false;

		finish();
	}

	if (!stopped) {
		speed = nextSpeed(speed, dt);
		currentRotation = nextRotation(speed, currentRotation, dt);
	}

	var section = currentWinner();
	if (section != lastSection) {
		lastSection = section;
		if (started) {
			var click = new Audio("click.mp3");
			click.play();
		}
	}

	drawWheel();
	requestAnimationFrame(tick);
}

var lastRoomCount = 0;
var colorScheme = [];

window.drawWheel = function() {
	ctx.clearRect(0, 0, baseSize, baseSize);

	if (lastRoomCount != rooms.length) {
		lastRoomCount = rooms.length;
		for (var c = 0; c < colorSchemes.length; c++) {
			if (rooms.length % colorSchemes[c].length == 0) {
				colorScheme = colorSchemes[c];
				break;
			}
		}
	}
	var colorCount = colorScheme.length;

	var slices = rooms.length;
	sliceDeg = 360/slices;

	var deg = currentRotation;
	for(var i=0; i<slices; i++){
		// console.log('drawing', deg, deg+sliceDeg, rooms[i]);
		drawWheelSlice(deg, colorScheme[i%colorCount]);
		drawWheelText(deg+sliceDeg/2, window.rooms[i]);
		deg -= sliceDeg;
	}
	for(var i=0; i<slices; i++){
		strokeWheelSlice(deg);
		deg -= sliceDeg;
	}

	drawPointer();
	// debugger;
}

initialize();

// Basically stolen from StackOverflow

var colorSchemes = [
	['#3f51b5', '#f44336', '#009688'],
	['#3f51b5', '#f44336', '#009688', '#cddc39'],
	['#3f51b5', '#f44336', '#009688', '#cddc39', '#ff9800'],
	['#3f51b5', '#f44336', '#009688', '#cddc39', '#ff9800', '#ffeb3b', '#607d8b'],
];

var color    = ['#ef6b00', '#356de0', '#FF4F38', '#46C9A2', '#EC368D', '#35E0E0'];
var size  = Math.min(canvas.width, canvas.height); // size TODO: Keep room for UI in mind
var center = size/2;      // center
var sliceDeg;
size -= size/10;

function deg2rad(deg){ return deg * Math.PI/180; }

function drawPointer() {
	ctx.beginPath();
	ctx.moveTo(center - 10, 0);
	ctx.lineTo(center + 10, 0);
	ctx.lineTo(center, baseSize / 10);
	ctx.lineTo(center - 10, 0);
	ctx.fillStyle = 'black';
	ctx.fill();
}

function strokeWheelSlice(deg) {
	ctx.beginPath();
	ctx.moveTo(center, center);
	ctx.arc(center, center, size/2, deg2rad(deg), deg2rad(deg+sliceDeg));
	ctx.lineTo(center, center);
	ctx.lineWidth = baseSize / 100;
	ctx.strokeStyle = '#333';
	ctx.stroke();
}

function drawWheelSlice(deg, color) {
	ctx.beginPath();
	ctx.moveTo(center, center);
	ctx.arc(center, center, size/2, deg2rad(deg), deg2rad(deg+sliceDeg));
	ctx.lineTo(center, center);
	ctx.lineWidth = baseSize / 100;
	ctx.fillStyle = color;
	ctx.fill();
}

function drawWheelText(deg, text) {
	ctx.save();
	ctx.translate(center, center);
	ctx.rotate(deg2rad(deg));
	ctx.textAlign = "right";
	ctx.fillStyle = "#fff";
	var fontSize = baseSize/15;
	ctx.font = 'bold '+fontSize+'px sans-serif';
	ctx.fillText(text, 0.35*baseSize, baseSize/50);
	ctx.restore();
}

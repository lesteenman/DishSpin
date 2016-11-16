var overlay = $('#overlay')[0];
var canvas = $('#wheel')[0];
var ctx = canvas.getContext("2d");
var baseSize = Math.min(document.body.clientHeight, document.body.clientWidth);

window.currentRotation = 0;
window.acceleration = 2;
window.friction = 3;
window.speed = 0.5;
window.stopped = false;
window.started = false;
window.sling = false;

function resize() {
	var size = Math.min(document.body.clientHeight, document.body.clientWidth);
	// var windowRatio = document.body.clientHeight / document.body.clientWidth;
	$(canvas).css('width', size + 'px')
	$(canvas).css('height', size + 'px')
}

$(window).resize(resize);

function initialize() {
	$(canvas).prop('width', baseSize)
	$(canvas).prop('height', baseSize)
	resize();
	requestAnimationFrame(tick);
	// setInterval(tick, 1/tickrate);
}

function startSpinner() {
	started = true;
	sling = 2000; // Math.random(500, 2000);
	stopped = false;
	acceleration = 10;
	// setTimeout(function() {
	// 	acceleration = -0.5;
	// }, 200);
}

var last = null;

function tick(time) {
	if (rooms.length <= 1) {
		requestAnimationFrame(tick);
		return;
	}

	if (last === null) last = time;
	var td = (time - last) / 1000;
	last = time;

	if (sling && speed > sling) {
		sling = false;
		acceleration = -1 / friction;
	} else if (!started && speed > 120) {
		acceleration = 0;
	} else if (speed <= 0 && started) {
		speed = 0;
		stopped = true;
		started = false;
		return;
	}

	// Linear deceleration from this point on
	if (started && speed < 50) {
		speed -= friction * td;
	} else {
		speed += (speed * acceleration) * td;
	}

	currentRotation += speed * td;
	currentRotation %= 360;

	drawWheel();
	requestAnimationFrame(tick);
}

window.drawWheel = function() {
	ctx.clearRect(0, 0, baseSize, baseSize);

	var slices = rooms.length;
	sliceDeg = 360/slices;

	var deg = currentRotation;
	for(var i=0; i<slices; i++){
		drawWheelSlice(deg, color[i%2]);
		drawWheelText(deg+sliceDeg/2, window.rooms[i]);
		deg += sliceDeg;
	}
}

initialize();

// Basically stolen from StackOverflow

var color    = ['#ef6b00', '#356de0'];
var size  = Math.min(canvas.width, canvas.height); // size TODO: Keep room for UI in mind
var center = size/2;      // center
var sliceDeg;
size -= size/10;

function deg2rad(deg){ return deg * Math.PI/180; }

function drawWheelSlice(deg, color){
	ctx.beginPath();
	ctx.fillStyle = color;
	ctx.moveTo(center, center);
	ctx.arc(center, center, size/2, deg2rad(deg), deg2rad(deg+sliceDeg));
	ctx.lineTo(center, center);
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

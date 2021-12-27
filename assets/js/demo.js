const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                            window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
const cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

const CV = {W:400, H:300};
const HALF_CV = CV.H/2;
const WALL = {W:7, H:160};
const DIST_FROM_WALL = 105+WALL.W;
const SPRING = {
	X: WALL.W,
	Y: HALF_CV,
	DX: 10,
	DY: 10
};

const getMass = () => getInput("m");
const getK = () => getInput("k");
const getX0 = () => getInput("x0");
const getB = () => getInput("b");

drawWall();
drawAxis();

$("#damper-input").hide();
setOutputs(getK(), getMass());
document.getElementById("m").addEventListener("input", onInputChange);
document.getElementById("k").addEventListener("input", onInputChange);
document.getElementById("damper").addEventListener("change", toggleDamper);

// var req;
var calculateX = calculateXNoDamper; 

let previousTimeStamp = -1;
function animate(t) {
	if (t != previousTimeStamp) {
		ctx.clearRect(WALL.W,0,CV.W-WALL.W,(CV.H+WALL.H)*0.5);
		previousTimeStamp = t;
		let m = getMass();
		x = calculateX(t);
		let k = getK();
		drawSpring(x, k);
		drawWall();
		drawWeight(x, CV.H/2, m);
	}
	req = requestAnimationFrame(animate);
}
function calculateXNoDamper(t, init_dist=DIST_FROM_WALL) {
	return getX0() * Math.cos(t/40 * Math.sqrt(getK() / getMass()))+init_dist;
}
function calculateXWithDamper(t, init_dist=DIST_FROM_WALL) {
	return 200;
}
function drawSpring(mass_x, k) {
	ctx.fillStyle = 'black';
	// ctx.lineWidth = k/3;
    ctx.beginPath();
    ctx.moveTo(SPRING.X, SPRING.Y);
    let x = SPRING.X - 5;
    let neg1 = 1;
    for (; x <= mass_x; neg1*=-1) {
    	x += SPRING.DX;
    	ctx.lineTo(x, SPRING.Y + SPRING.DY * neg1);
    }
	ctx.lineTo(x + SPRING.DX/2, SPRING.Y + SPRING.DY/2 * neg1);
    ctx.stroke();
}

requestAnimationFrame(animate);

function drawAxis() {
	ctx.fillStyle = 'grey';
	ctx.font = '20px serif';

	// aligned with left, not centre, of mass...
	ctx.fillText('0', DIST_FROM_WALL-5, CV.H-25);
}
function drawWall(w=WALL.W, h=WALL.H) {
	ctx.fillStyle = '#7d5938';
	ctx.fillRect(0, 0.5 * (CV.H - h), w, h);
}
function drawWeight(x,y,s) {
	ctx.fillStyle = 'grey';
	ctx.fillRect(x, y - 0.5 * s, s, s);
}

function setOutputs(k, m) {
	let af = Math.sqrt(k / m);
	let freq = af / (2 * Math.PI);
	let period = 1 / freq;
	document.getElementById("w").textContent = af.toFixed(3);
	document.getElementById("T").textContent = period.toFixed(3);
	document.getElementById("f").textContent = freq.toFixed(3);
}

function getInput(id) {
	return parseInt(document.getElementById(id).value);
}

function onInputChange() {
	setOutputs(getK(), getMass());
}
function toggleDamper() {
	// cancelAnimationFrame(req);

	if ($("#damper-input").is(":visible")) {
		$("#damper-input").hide();
		calculateX = calculateXNoDamper;
	} else {
		$("#damper-input").show();
		calculateX = calculateXWithDamper;
	}
}

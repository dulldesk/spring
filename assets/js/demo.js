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
	DY: 10,
	TX: 1
};

const getMass = () => getInput("m");
const getK = () => getInput("k");
const getX0 = () => getInput("x0");
const getB = () => getInput("b");
const e = Math.E;

drawWall();
drawAxis();

$("#damper-input").hide();
setOutputs(getK(), getMass());
document.getElementById("x0").addEventListener("input", onInputChange.bind(null, false));
document.getElementById("b").addEventListener("input", onInputChange.bind(null, false));
document.getElementById("m").addEventListener("input", onInputChange);
document.getElementById("k").addEventListener("input", onInputChange);
document.getElementById("damper").addEventListener("change", toggleDamper);

// var req;
var calculateX = calculateXNoDamper; 

let previousTimeStamp = -1;
let ts = 0;
function animate(_) {
	let t = ts;
	if (t != previousTimeStamp) {
		ctx.clearRect(WALL.W,0,CV.W-WALL.W,(CV.H+WALL.H)*0.5);
		previousTimeStamp = t;
		let m = getMass();
		let x = Math.round(calculateX(t));
		let k = getK();
		drawSpring(x, k);
		drawWall();
		drawWeight(x, CV.H/2, m);
		ts += SPRING.TX;
	}
	req = requestAnimationFrame(animate);
}
function calculateXNoDamper(t, init_dist=DIST_FROM_WALL) {
	let ret = getX0() * Math.cos(t/40 * Math.sqrt(getK() / getMass()));
	console.log(ret);
	return ret + init_dist;
}
function calculateXWithDamper(t, init_dist=DIST_FROM_WALL) {
  	let x0 = getX0();
	let m = getMass();
    let k = getK();
    let b = getB();
	let d = b * b - 4 * m * k;
	let ret = 0;
	if (Math.abs(d - 0) < 0.00001){
		// critically damped
		console.log("crtically damped");
		let r = -1 * b / (2 * m);
		let c1 = x0;
		let c2 = -1 * r * x0;
		ret = c1 * Math.pow(e, r * t) + c2 * t * Math.pow(e, r * t);
	}
	else if (d > 0){
		// overdamped
		console.log("overdamped");
		let r1 = (-1 * b + Math.sqrt(d))/(2 * m);
		let r2 = (-1 * b - Math.sqrt(d))/(2 * m);
		let c1 = (x0 * r2)/(r2 - r1);
		let c2 = (x0 * r1)/(r1 - r2);
		ret = c1 * Math.pow(e, r1 * t) + c2 * Math.pow(e, r2 * t);
	}
	else{
		// underdamped
		console.log("underdamped");
		let lmd = (-1 * b)/(2 * m)
		let mu = (Math.sqrt(-1 * d))/(2 * m);
		ret = x0 * Math.pow(e, lmd * t) * Math.cos(mu * t); 
	}
	console.log(ret);
	return ret + init_dist;
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
	// ctx.fillText('0', DIST_FROM_WALL-5, CV.H-25);
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

function onInputChange(updateOutput=true) {
	if (updateOutput) setOutputs(getK(), getMass());
	resetTime();
}
function toggleDamper() {
    if ($("#damper-input").is(":visible")) {
        $("#damper-input").hide();
		$(".outputs").show()
        calculateX = calculateXNoDamper;
    } else {
        $("#damper-input").show();
		$(".outputs").hide()
        calculateX = calculateXWithDamper;
    }
    resetTime();
}
function resetTime() {
	// cancelAnimationFrame(req);
	ts = 0;
	previousTimeStamp = -1;
	// req = requestAnimationFrame(animate);
}

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
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
	TX: 1,
	MAX_X: undefined
};

const getMass = getInput.bind(null, "m");
const getK = getInput.bind(null, "k");
const getX0 = getInput.bind(null, "x0");
const getB = getInput.bind(null, "b");
const e = Math.E;
const cancel = () => cancelAnimationFrame(req);
const request = () => req = requestAnimationFrame(animate);
const restart = (reset=true) => {
	cancel();
	if (reset) resetTime();
	request();
};

var last_mass_x;
var input_tmo;

drawWall();
drawAxis();

document.getElementById("x0").addEventListener("input", onInputChange.bind(null, false));
document.getElementById("b").addEventListener("input", onInputChange);
document.getElementById("m").addEventListener("input", handleMassChange);
document.getElementById("k").addEventListener("input", onInputChange);
document.getElementById("damper").addEventListener("change", toggleDamper);
canvas.addEventListener("mousedown", handleCanvasDown);

var req;
let previousTimeStamp = -1;
let ts = 0;

var calculateX, updateOutput;
toggleDamper();
handleMassChange();
updateOutput(getK(), getMass());
$("#x0").attr("min", -DIST_FROM_WALL + WALL.W);

function animate(_) {
	let t = ts;
	if (t != previousTimeStamp) {
		previousTimeStamp = t;
		drawAll(t);
		ts += SPRING.TX;
	}
	request();
}
function calculateXNoDamper(t, k=getK(), m=getMass(), x0=getX0(), init_dist=DIST_FROM_WALL) {
	let d = - 4 * m * k;
	let mu = (Math.sqrt(-1 * d))/(2 * m);
	let ret = x0 * Math.cos(mu * t);
	// console.log(ret);
	return ret + init_dist;
}
function calculateXWithDamper(t, k=getK(), m=getMass(), x0=getX0(), init_dist=DIST_FROM_WALL) {
  	// let x0 = getX0();
	// let m = getMass();
    // let k = getK();
    let b = getB();
	let d = b * b - 4 * m * k;
	let ret = 0;
	if (Math.abs(d - 0) < 0.00001){
		// critically damped
		// console.log("crtically damped");
		let r = -1 * b / (2 * m);
		let c1 = x0;
		let c2 = -1 * r * x0;
		ret = c1 * Math.pow(e, r * t) + c2 * t * Math.pow(e, r * t);
	}
	else if (d > 0){
		// overdamped
		// console.log("overdamped");
		let r1 = (-1 * b + Math.sqrt(d))/(2 * m);
		let r2 = (-1 * b - Math.sqrt(d))/(2 * m);
		let c1 = (x0 * r2)/(r2 - r1);
		let c2 = (x0 * r1)/(r1 - r2);
		ret = c1 * Math.pow(e, r1 * t) + c2 * Math.pow(e, r2 * t);
	}
	else{
		// underdamped
		// console.log("underdamped");
		let lmd = (-1 * b)/(2 * m)
		let mu = (Math.sqrt(-1 * d))/(2 * m);
		ret = x0 * Math.pow(e, lmd * t) * Math.cos(mu * t);
	}
	// console.log(ret);
	return ret + init_dist;
}
function drawAll(t,x) {
	ctx.clearRect(WALL.W,0,CV.W-WALL.W,(CV.H+WALL.H)*0.5);
	let m = getMass();
	let k = getK();
	if (x === undefined) {
		x = Math.round(calculateX(t, k, m));
	}
	// console.log(x, t);
	drawSpring(x, k);
	drawWall();
	drawWeight(x, CV.H/2, m);
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

request();

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

function handleCanvasDown(e) {
	let m = getMass();
	let eX = e.offsetX, eY = e.offsetY;
	let wX = calculateX(ts);
	let wY = SPRING.Y - m/2;

	if (eX > wX && eX < (wX + m) && eY > wY && eY < (wY + m)) {
		cancel();
		last_mass_x = calculateX(ts);
		canvas.addEventListener("mousemove", handleMassMove);
		canvas.addEventListener("mouseup", handleCanvasUp);
		document.addEventListener("mouseup", handleDocumentUp);
	}
}
function handleMassMove(e) {
	// console.log(e.offsetX)
	last_mass_x = Math.max(WALL.W, Math.min(e.offsetX - getMass() / 2, SPRING.MAX_X));
	drawAll(null, last_mass_x);
}
function handleCanvasUp(e) {
	// let m = getMass();
	// let eX = e.offsetX;
	// let wX = calculateX(ts);
	// let wY = SPRING.Y - m/2;

	document.getElementById("x0").value = last_mass_x - DIST_FROM_WALL;
	last_mass_x = undefined; // its value will no longer be accurate

	canvas.removeEventListener("mousemove", handleMassMove)
	canvas.removeEventListener("mouseup", handleCanvasUp);
	restart();
}
function handleDocumentUp(e) {
	document.removeEventListener("mouseup", handleDocumentUp);
	canvas.dispatchEvent(new Event("mouseup"));
}

function updateUndampedOutput(k, m) {
	let af = Math.sqrt(k / m);
	let freq = af / (2 * Math.PI);
	let period = 1 / freq;
	document.getElementById("w").textContent = af.toFixed(3);
	document.getElementById("T").textContent = period.toFixed(3);
	document.getElementById("f").textContent = freq.toFixed(3);
}
function updateDampedOutput(k,m,b=getB()) {
	// here
	if(b * b - 4 * m * k == 0){
		$("#sign-damped").text("=");
		$("#status-damped").text("Critically ");
	}
	else if(b * b - 4 * m * k < 0){
		$("#sign-damped").text("<");
		$("#status-damped").text("Under");
	}
	else if(b * b - 4 * m * k > 0){
		$("#sign-damped").text(">");
		$("#status-damped").text("Over");
	}
	else {
		$("#sign-damped").text("BAFAFAF");
		$("#status-damped").text("BAFAFAF");
	}
}

function getInput(id) {
	return parseInt(document.getElementById(id).value);
}
function onInputChange(updateOut=true, m=getMass()) {
	if (updateOut) updateOutput(getK(), m);

	drawAll(ts);
	cancel();
	resetTime();

	if (input_tmo) clearTimeout(input_tmo);
	input_tmo = setTimeout(() => {
		restart();
		input_tmo = undefined;
	}, 200);
}
function handleMassChange() {
	let m = getMass();
	SPRING.MAX_X = CV.W - getMass();
	$("#x0").attr("max", SPRING.MAX_X - DIST_FROM_WALL);
	onInputChange(true, m);
}
function toggleDamper() {
    if (!$("#damper").is(":checked")) {
        $(".damped").hide();
		$(".undamped").css("display","");
        calculateX = calculateXNoDamper;
        updateOutput = updateUndampedOutput;
    } else {
		$(".undamped").hide()
		$(".damped").show()
        calculateX = calculateXWithDamper;
        updateOutput = updateDampedOutput;
    }
	updateOutput(getK(), getMass());
    resetTime();
}
function resetTime() {
	ts = 0;
	previousTimeStamp = -1;
}

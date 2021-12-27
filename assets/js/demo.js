const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const CV_W = 400;
const CV_H = 300;
const WALL_W = 7;
const WALL_H = 160;
const DIST_FROM_WALL = 105+WALL_W;

const getMass = () => getInput("m");
const getK = () => getInput("k");
const getX0 = () => getInput("x0");

drawWall();
drawAxis();

let previousTimeStamp = -1;
function step(t) {
	if (t != previousTimeStamp) {
		ctx.clearRect(WALL_W,0,CV_W-WALL_W,(CV_H+WALL_H)*0.5);
		previousTimeStamp = t;
		let m = getMass();
		x = getX0() * Math.cos(t/40 * Math.sqrt(getK() / m));
		drawWeight(x+DIST_FROM_WALL, CV_H/2, m);
	}
	window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);

function drawAxis() {
	ctx.fillStyle = 'grey';
	ctx.font = '20px serif';

	// aligned with left, not centre, of mass...
	ctx.fillText('0', DIST_FROM_WALL-5, CV_H-25);
}
function drawWall(w=WALL_W, h=WALL_H) {
	ctx.fillStyle = 'grey';
	ctx.fillRect(0, 0.5 * (CV_H - h), w, h);
}
function drawWeight(x,y,s) {
	ctx.fillStyle = 'grey';
	ctx.fillRect(x, y - 0.5 * s, s, s);
}

function getInput(id) {
	return parseInt(document.getElementById(id).value);
}

// click top of wrapper to minimize
$("#demo-wrapper").click(evt => {
	evt.stopPropagation();
	if (evt.target.id === "demo-wrapper" && (evt.clientY - evt.target.getBoundingClientRect().top <= 28)) {
		toggleDemo();
	}
});

function toggleDemo(down) {
	const demo = $(".demo");
	if (down || demo.is(":visible")) {
		cancel();
		demo.slideUp();
		$("#demo-wrapper").attr("title", "Click me to maximize the demo again");
	} else {
		demo.slideDown();
		restart(false);
		$("#demo-wrapper").attr("title", "");
	}
}

if (window.location.search.substr(1).split("&").includes("min=1")) {
    toggleDemo(true);
}

const PRESET_X0 = 60;

// damper presets
$(".presets button").click(evt => {
	let [m,k,b,x0] = $(evt.target).data("preset");
	$("#m").val(m);
	$("#k").val(k);
	$("#b").val(b);
	$("#x0").val(x0 || PRESET_X0);
	restart();
});

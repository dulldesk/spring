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

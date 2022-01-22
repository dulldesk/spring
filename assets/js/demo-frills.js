const NODES = {
	demo: {
		type: "demo",
		id: "demo-wrapper",
		content_id: ".demo",
		animate: true
	},
	slides: {
		type: "slides",
		id: "slides-wrapper",
		content_id: "#slides-wrapper iframe"
	}
};

// click top of wrapper to minimize
function toggleNode(node, slide_up) {
	const content = $(node.content_id);
	if (slide_up || content.is(":visible")) {
		if (node.animate) cancel();
		content.slideUp();
		$(node.id).attr("title", `Click me to maximize the ${node.type} again`);
	} else {
		content.slideDown();
		if (node.animate) restart(false);
		$(node.id).attr("title", "");
	}
}

for (let key in NODES) {
	let node = NODES[key];
	$("#" + node.id).click(node, evt => {
		evt.stopPropagation();
		if (evt.target.id === evt.data.id && (evt.clientY - evt.target.getBoundingClientRect().top <= 28)) {
			toggleNode(evt.data);
		}
	});

	// Minimize nodes through GET parameters
	if (window.location.search.substr(1).split("&").includes(`${key}=0`)) {
	    toggleNode(node, true);
	}
}


// Defer iframe loading
$(document).ready(() => {
	$("iframe").attr("src", $("iframe").data("src"));
});


// damper presets
const PRESET_X0 = 60;

$(".presets button").click(evt => {
	let [m,k,b,x0] = $(evt.target).data("preset");
	$("#m").val(m);
	$("#k").val(k);
	$("#b").val(b);
	$("#x0").val(x0 || PRESET_X0);
	updateOutput(getK(), getMass());
	restart();
});

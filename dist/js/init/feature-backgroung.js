window.addEventListener("DOMContentLoaded", function() {
	const blocks = document.querySelectorAll(".feature-background");
	const width = window.innerWidth;

	console.log(blocks)

	blocks.forEach(function(block) {
		block.style.width = width + "px";
	});
});
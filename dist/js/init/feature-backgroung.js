window.addEventListener("DOMContentLoaded", function() {
	const blocks = document.querySelectorAll(".feature-background");
	const enBlocks = document.querySelectorAll(".engine-background");
	const width = window.innerWidth;

	blocks.forEach(function(block) {
		block.style.width = width + "px";
	});

	enBlocks.forEach(function(enBlocks) {
		enBlocks.style.width = width + "px";
	});
});
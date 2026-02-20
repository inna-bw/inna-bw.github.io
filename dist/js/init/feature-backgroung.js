window.addEventListener("DOMContentLoaded", function() {
	const blocks = document.querySelectorAll(".feature-background");
	const enBlocks = document.querySelectorAll(".engine-background");

	function updateWidths() {
		const width = window.innerWidth;

		blocks.forEach(function(block) {
			block.style.width = width + "px";
		});

		enBlocks.forEach(function(block) {
			block.style.width = width + "px";
		});
	}

	updateWidths();

	window.addEventListener("resize", updateWidths);
});
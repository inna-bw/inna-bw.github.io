document.addEventListener( 'DOMContentLoaded', function() {

	class Slider {
		sliderElment = null;

		constructor(sliderElment) {
			this.sliderElment = sliderElment;
		}

		init(options){
			if (options) {
				console.log(options)
			}
		}
	}

	Array.prototype.forEach.call(document.querySelectorAll(".slider"), function(sliderEl){
		const slider = new Slider(sliderEl);
		let options = {};
		slider.init(options);
	});
});
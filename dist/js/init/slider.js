document.addEventListener( 'DOMContentLoaded', function() {

	class Slider {
		sliderElment = null;
		sliderDots = null;
		sliderArrows = null;

		allSlides = null;

		prevButton = null;
		nextButton = null;

		totalWidth = 0;
		totalHeight = 0;
		totalSlides = 0;

		activeSlideEl = null;
		activeIndex = 0;

		currentTransition = 0;

		options = {
			transitionDuration: "1s",
			timing: "ease-in-out",
			delay: "0s",
			direction: 'horizontal'
		}

		constructor(sliderElment) {
			this.sliderElment = sliderElment;
			this.sliderDots = this.sliderElment.querySelector('.slider-dots').querySelectorAll('.dot');
			this.sliderArrows = this.sliderElment.querySelector('.slider-arrows');

			this.allSlides = Array.prototype.slice.call(this.sliderElment.querySelectorAll('.slide'));
			this.totalWidth = this.setAllSlidersWidth();
			this.totalHeight = this.setAllSlidersHeight();
		}

		init(options){
			if (!this.sliderElment) return;
			this.totalSlides =  this.sliderElment.querySelectorAll('.slide').length;

			this.setActiveSlide(this.activeIndex);

			if (options) {
				this.options = Object.assign(this.options, options)
			};
			if (this.sliderDots) {
				this.setDots();
			};
			if (this.sliderArrows) {
				this.setArrows();
			};

			if (this.options.onInit) {
				this.options.onInit(this);
			};
		};

		setAllSlidersWidth(){
			let totalWidth = 0;
			for (const [index, slide] of this.allSlides.entries()) {
				totalWidth += slide.getBoundingClientRect().width;
			};
			return totalWidth;
		};

		setAllSlidersHeight(){
			let totalHeight = 0;
			for (const [index, slide] of this.allSlides.entries()) {
				totalHeight += slide.getBoundingClientRect().height;
			};
			return totalHeight;
		};

		setActiveSlide(activeIndex){
			for (const [index, slide] of this.allSlides.entries()) {
				if (index == activeIndex) {
					slide.classList.add('active');
					this.activeSlideEl = slide;
				} else {
					slide.classList.remove('active');
				};
			};
		};

		setActiveDot(activeIndex){
			if (!this.sliderDots || !this.sliderDots.length) return;
			for (const [index, dot] of this.sliderDots.entries()) {
				if (index == activeIndex) {
					dot.classList.add('active');
				} else {
					dot.classList.remove('active')
				};
			};
		};

		setArrows(){
			this.prevButton = this.sliderArrows.querySelector('.prev');
			this.nextButton = this.sliderArrows.querySelector('.next');

			this.setDisabledButton(0, this.prevButton);

			this.prevButton.addEventListener("click", function (e) {
				e.preventDefault();
				this.goToPrevSlide();
			}.bind(this), false);

			this.nextButton.addEventListener("click", function (e) {
				e.preventDefault();
				this.goToNextSlide();
			}.bind(this), false);
		};

		setDisabledButton(index, button){
			if (!button) return;
			if (this.activeIndex == index) {
				button.classList.add('disabled');
			};
		};

		removeDisabledButton(button){
			if (!button) return;
			button.classList.remove('disabled');
		};

		goToPrevSlide(){
			this.removeDisabledButton(this.nextButton);
			if (this.activeIndex > 0) {
				this.activeIndex--;
			};
			this.setActiveSlide(this.activeIndex);
			this.goToSlide(this.activeIndex);
			this.setDisabledButton(0, this.prevButton);
			this.setActiveDot(this.activeIndex);
		};

		goToNextSlide(){
			this.removeDisabledButton(this.prevButton);
			if (this.activeIndex < this.totalSlides) {
				this.activeIndex++;
			};
			this.setActiveSlide(this.activeIndex);
			this.setActiveDot(this.activeIndex);
			this.goToSlide(this.activeIndex);
			this.setDisabledButton(this.totalSlides-1, this.nextButton);
		};

		translateSlider(index){
			let track = this.sliderElment.querySelector('.slider-list');

			switch (this.options.direction) {
				case "vertical":
					this.currentTransition = this.calculateVericalTransition();
					requestAnimationFrame(()=>{
						track.style.transition = `transform ${this.options.transitionDuration} ${this.options.timing} ${this.options.delay}`;
						track.style.transform = `translateY(${this.currentTransition}px)`
					});
					break;
				case "horizontal":
					this.currentTransition = this.calculateHorizontalTransition();
					requestAnimationFrame(()=>{
						track.style.transition = `transform ${this.options.transitionDuration} ${this.options.timing} ${this.options.delay}`;
						track.style.transform = `translateX(${this.currentTransition}px)`
					});
					break;
			};
		};

		calculateVericalTransition(){
			let currentTransition = 0;
			let activeSlideHeight = this.activeSlideEl.getBoundingClientRect().height;

			let slidesArray = Array.prototype.slice.call(this.allSlides);
			let slidesHeight = 0;

			if (this.activeIndex == 0) {
				currentTransition = slidesHeight = 0;
			} else {
				for (let slide of  this.allSlides.slice(0, this.activeIndex)) {
					slidesHeight += slide.getBoundingClientRect().height;
				}

				currentTransition = slidesHeight*-1;
			};
			return currentTransition;
		}

		calculateHorizontalTransition(){
			let currentTransition = 0;
			let activeSlideWidth = this.activeSlideEl.getBoundingClientRect().width;

			let slidesArray = Array.prototype.slice.call(this.allSlides);
			let slidesWidth = 0;

			if (this.activeIndex == 0) {
				currentTransition = slidesWidth = 0;
			} else {
				for (let slide of  this.allSlides.slice(0, this.activeIndex)) {
					slidesWidth += slide.getBoundingClientRect().width;
				}

				currentTransition = slidesWidth*-1;
			};

			return currentTransition;
		};

		setDots(){
			for (const [index, dot] of this.sliderDots.entries()) {
				dot.addEventListener("click", function (e) {
					e.preventDefault();
					this.activeIndex = index;
					this.setActiveSlide(index);
					this.goToSlide(index);
					this.setActiveDot(index);

					if (index !== 0 && index !== this.totalSlides-1){
						this.removeDisabledButton(this.prevButton);
						this.removeDisabledButton(this.nextButton);
					} else if (index == this.totalSlides-1) {
						this.setDisabledButton(index, this.nextButton);
						this.removeDisabledButton(this.prevButton);
					} else if (index == 0) {
						this.setDisabledButton(0, this.prevButton);
						this.removeDisabledButton(this.nextButton);
					};
				}.bind(this), false);
			};
		};

		goToSlide(index){
			if (index > this.totalSlides) return;
			this.translateSlider(index);

			if (this.options.onTranslated) {
				this.options.onTranslated(this)
			}
		}
	};

	// initialization
	Array.prototype.forEach.call(document.querySelectorAll(".slider"), function(sliderEl){
		const slider = new Slider(sliderEl);

		// for all sliders
		let options = {
			direction: 'horizontal',
			onInit: function(e) {},
			onTranslated: function(e) {
				// console.log(e)
			}
		};

		// only for about
		if (sliderEl.classList.contains('about-slider')) {
			let setDates = function(){
				let slider = this;

				let allDots = Array.prototype.slice.call(sliderEl.querySelector('.chronology-list').querySelectorAll('.dot'));
				let dotsCaption = [];

				for (let dot of allDots) {
					dotsCaption.push(dot.innerHTML.trim());
				};

				let prevCaption = slider.prevButton.querySelector('.caption');
				let nextCaption = slider.nextButton.querySelector('.caption');

				let prevText = dotsCaption[slider.activeIndex-1] || '';
				let nextText = dotsCaption[slider.activeIndex+1] || '';

				prevCaption.innerHTML = prevText;
				nextCaption.innerHTML = nextText;
			};

			// set slider callback
			options.onInit = setDates.bind(slider);
			options.onTranslated = setDates.bind(slider);
		};

		slider.init(options);
	});
});

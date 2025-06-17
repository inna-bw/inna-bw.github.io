document.addEventListener( 'DOMContentLoaded', function() {

	class Slider {
		sliderElment = null;
		sliderDots = null;
		sliderArrows = null;

		allSlides = null;

		prevButton = null;
		nextButton = null;

		scrolledWidth = 0;
		scrolledHeight = 0;
		totalSlides = 0;
		savedSlidesLength = 0;

		activeSlideEl = null;
		activeIndex = 0;
		activeSlideWidth = 0;

		currentTransition = 0;

		isTouchDown = false;

		touchStartX = 0;
		touchStartY = 0;

		touchTransition = 0;
		touchDirection = '';

		options = {
			transitionDuration: "1s",
			timing: "ease-in-out",
			delay: "0s",
			direction: 'horizontal',
			autoplay: false,
			loop: false,
			autoplayTime: 5000,
		}

		constructor(sliderElment) {
			this.sliderElment = sliderElment;
			this.sliderDots = this.sliderElment.querySelector('.slider-dots').querySelectorAll('.dot');
			this.sliderArrows = this.sliderElment.querySelector('.slider-arrows');

			this.allSlides = Array.prototype.slice.call(this.sliderElment.querySelectorAll('.slide'));
			this.scrolledWidth = this.setScrolledSlidersWidth();
			this.scrolledHeight = this.setScrolledSlidersHeight();
		}

		init(options){
			if (!this.sliderElment) return;
			this.totalSlides =  this.sliderElment.querySelectorAll('.slide').length;
			this.savedSlidesLength = this.totalSlides;

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


			if (this.options.autoplay) {
				this.play(this.activeIndex)
			};

			this.track = this.sliderElment.querySelector('.slider-list');

			this.sliderElment.querySelector('.slider-track').addEventListener('mousedown', this.start.bind(this));
			this.sliderElment.querySelector('.slider-track').addEventListener('touchstart', this.start.bind(this));

			this.sliderElment.querySelector('.slider-track').addEventListener('mousemove', this.move.bind(this));
			this.sliderElment.querySelector('.slider-track').addEventListener('touchmove', this.move.bind(this));

			this.sliderElment.querySelector('.slider-track').addEventListener('mouseleave', this.end.bind(this));
			this.sliderElment.querySelector('.slider-track').addEventListener('mouseup', this.end.bind(this));
			this.sliderElment.querySelector('.slider-track').addEventListener('touchend', this.end.bind(this));

			window.addEventListener('resize', this.resizeSlider.bind(this));

		};

		end() {
			this.isTouchDown = false;
			if (!this.touchDirection) return;

			let middleXPosition = this.activeSlideEl.getBoundingClientRect().width/6;
			let middleYPosition = this.activeSlideEl.getBoundingClientRect().height/6;
			let index = 0;

			if (!Math.abs(this.currentTransition) && !Math.abs(this.touchTransition)) return;

			switch (this.touchDirection) {
				case "left":
					if (Math.abs(this.touchTransition) > middleXPosition && Math.abs(this.currentTransition) < this.scrolledWidth) {
						index = this.activeIndex+1;
					} else {
						index = this.activeIndex;
					};
					break;
				case "right":
					if (this.scrolledWidth + this.touchTransition > middleXPosition){
						index = this.activeIndex-1;
					} else {
						index = this.activeIndex;
					};
					break;
				case "top":
					if (Math.abs(this.touchTransition) > middleYPosition && Math.abs(this.currentTransition) < this.scrolledHeight) {
						index = this.activeIndex+1;
					} else {
						index = this.activeIndex;
					};
					break;
				case "bottom":
					if (this.scrolledHeight + this.touchTransition > middleYPosition){
						index = this.activeIndex-1;
					} else {
						index = this.activeIndex;
					};
					break;
			};

			this.activeIndex = index;

			this.setActiveSlide(index);
			this.goToSlide(index);
			this.setActiveDot(index);

			this.setButtonsState(index);

			this.touchDirection = '';
			this.touchTransition = 0;
			this.track.classList.remove('drag-active');
		};

		start(e){
			this.isTouchDown = true;
			this.track.style.transition = `none`;

			switch (this.options.direction) {
				case "vertical":
					this.touchStartY = e.pageY || e.touches[0].pageY;
					break;
				case "horizontal":
					this.touchStartX = e.pageX || e.touches[0].pageX;
					break;
			};

			this.track.classList.add('drag-active');
		};

		move(e){
			if(!this.isTouchDown || this.touchStartX < 500) return;
			e.preventDefault();

			function between(x, min, max) {
				return x >= min && x <= max;
			}

			let dragTranslation = 0;

			switch (this.options.direction) {
				case "vertical":
					if (this.isTouchDown == true && e.pageY <= this.touchStartY) {
						this.touchDirection = "top";
						dragTranslation = (this.touchStartY - e.pageY)*-1;
					} else if (this.isTouchDown == true && e.pageY > this.touchStartY) {
						this.touchDirection = "bottom";
						dragTranslation = e.pageY - this.touchStartY;
					};
					break;
				case "horizontal":
					if (this.isTouchDown == true && e.pageX <= this.touchStartX) {
						this.touchDirection = "left";
						dragTranslation = (this.touchStartX - e.pageX)*-1;
					} else if (this.isTouchDown == true && e.pageX > this.touchStartX) {
						this.touchDirection = "right";
						dragTranslation = e.pageX - this.touchStartX;
					};
					break;
			};

			let touchTransition = this.currentTransition + dragTranslation;

			if (!between(touchTransition, this.scrolledWidth*-1, 0) || !this.isTouchDown || !dragTranslation) return;

			this.track.style.transform = this.options.direction == 'vertical' ? `translateY(${touchTransition}px)` : `translateX(${touchTransition}px)`;
			this.touchTransition = touchTransition;
		};

		play(){
			if (this.activeIndex >= this.allSlides.length-1) {
				this.activeIndex = -1;
			}
			this.goToNextSlide();
			setTimeout(()=>{
				this.play();
			}, this.options.autoplayTime)
		};

		loop(){
			if (this.options.loop && this.activeIndex) {
				if (this.activeIndex >= this.totalSlides-1) {
					let slidesList = this.sliderElment.querySelector('.slider-list');
					let firstSlide = slidesList.querySelectorAll('.slide')[this.activeIndex-1];
					let firstSlideClone = firstSlide.cloneNode(true);
					firstSlideClone.classList.add('cloned');
					slidesList.insertBefore(firstSlideClone, slidesList.querySelectorAll('.slide')[slidesList.querySelectorAll('.slide').length-1].nextSibling);

					this.setActiveDot(slidesList.querySelectorAll('.cloned').length-1)
					if (slidesList.querySelectorAll('.cloned').length+1 >= this.savedSlidesLength+1) {
						this.activeIndex = -1;
					};

					// update settings
					this.totalSlides = this.sliderElment.querySelectorAll('.slide').length
					this.allSlides = Array.prototype.slice.call(this.sliderElment.querySelectorAll('.slide'));
					this.scrolledWidth = this.setScrolledSlidersWidth();
					this.scrolledHeight = this.setScrolledSlidersHeight();
				};
			};
		}

		resizeSlider(){
			if (!this.currentTransition) return;
			this.translateSlider(this.activeIndex)
		};

		setScrolledSlidersWidth(){
			let scrolledWidth = 0;
			for (const [index, slide] of this.allSlides.entries()) {
				scrolledWidth += slide.getBoundingClientRect().width;
			};
			scrolledWidth = scrolledWidth - this.sliderElment.getBoundingClientRect().width;
			return scrolledWidth;
		};

		setScrolledSlidersHeight(){
			let scrolledHeight = 0;
			for (const [index, slide] of this.allSlides.entries()) {
				scrolledHeight += slide.getBoundingClientRect().height;
			};
			scrolledHeight = scrolledHeight - this.sliderElment.getBoundingClientRect().height;
			return scrolledHeight;
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

			this.activeSlideWidth = this.activeSlideEl.getBoundingClientRect().width;
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
			switch (this.options.direction) {
				case "vertical":
					this.currentTransition = this.calculateVericalTransition(index);
					break;
				case "horizontal":
					this.currentTransition = this.calculateHorizontalTransition(index);
					break;
			};
			this.animateTranslation(this.currentTransition, this.options.direction);
		};

		animateTranslation(translation, direction){
			requestAnimationFrame(()=>{
				this.track.style.transition = `transform ${this.options.transitionDuration} ${this.options.timing} ${this.options.delay}`;
				this.track.style.transform = this.options.direction == 'vertical' ? `translateY(${translation}px)` : `translateX(${translation}px)`;
			});
			this.isTouchDown = false;
		};

		calculateVericalTransition(index){
			let currentTransition = 0;
			let activeSlideHeight = this.activeSlideEl.getBoundingClientRect().height;

			let slidesArray = Array.prototype.slice.call(this.allSlides);
			let slidesHeight = 0;

			if (index == 0) {
				currentTransition = slidesHeight = 0;
			} else {
				for (let slide of  this.allSlides.slice(0, index)) {
					slidesHeight += slide.getBoundingClientRect().height;
				}

				currentTransition = slidesHeight*-1;
			};
			return currentTransition;
		};

		calculateHorizontalTransition(index){
			let currentTransition = 0;
			let activeSlideWidth = this.activeSlideEl.getBoundingClientRect().width;

			let slidesArray = Array.prototype.slice.call(this.allSlides);
			let slidesWidth = 0;

			if (index == 0) {
				currentTransition = slidesWidth = 0;
			} else {
				for (let slide of  this.allSlides.slice(0, index)) {
					slidesWidth += slide.getBoundingClientRect().width;
				};
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
					this.setButtonsState(index);
				}.bind(this), false);
			};
		};

		setButtonsState(index){
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
		}

		goToSlide(index){
			if (index > this.totalSlides) return;
			this.translateSlider(index);

			if (this.options.onTranslated) {
				this.options.onTranslated(this)
			};
		}
	};

	// initialization
	Array.prototype.forEach.call(document.querySelectorAll(".slider"), function(sliderEl){
		const slider = new Slider(sliderEl);

		// for all sliders
		let options = {
			direction: 'horizontal',
			autoplay: sliderEl.dataset && sliderEl.dataset.autoplay ? sliderEl.dataset.autoplay : false,
			loop: sliderEl.dataset && sliderEl.dataset.loop ? sliderEl.dataset.loop : false,
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

				let prevText = dotsCaption[slider.activeIndex-1] || 0;
				let nextText = dotsCaption[slider.activeIndex+1] || 0;

				// prevCaption.innerHTML = prevText;
				// nextCaption.innerHTML = nextText;

				// for odoment count
				let prevOdometr = new Odometer({
					el: prevCaption,
					format: '',
				});

				prevOdometr.update(prevText)

				let nextOdometr = new Odometer({
					el: nextCaption,
					format: '',
				});

				nextOdometr.update(nextText)
			};

			// set slider callback
			options.onInit = setDates.bind(slider);
			options.onTranslated = setDates.bind(slider);
		};

		slider.init(options);
	});
});



document.addEventListener('DOMContentLoaded', function(){

	class waveLines {
		frame = 0;
		speed = 0;

		constructor(speed) {
			this.speed = speed;
		}

		current = function(x) {
			this.frame += 0.002 * this.speed;
			return Math.sin(this.frame + x * this.speed * 10);
		};
	}

	class FlameAnimation {
		canvas = null;
		ctx = null;
		img = null;

		width = 0;
		height = 0;

		_destroyed = true;

		constructor(host){
			this._destroyed = false;
			this.canvas = host;
			this.ctx = this.canvas.getContext("2d");
			this.img = new Image();

			setTimeout(()=> {
				this.init();
				this.updateRects();
			}, 100);
		}

		updateRects(){
			this.width = this.canvas.width = this.canvas.parentNode.getBoundingClientRect().width;
			this.height = this.canvas.height = this.img.height; //image height;
		}

		init(){
			this.img.onload = this.setWaves.bind(this);
			this.img.src = "img/temp/banner-decoration1.png";
		}

		setWaves(){
			// let top = this.height - this.img.height;
			let top = 0;
			this.ctx.drawImage(this.img, 0, top); //(img, x, y, width, height)
			let w = this.width;
			let h = this.height;

			let ctx = this.ctx;
			let img = this.img;

			let canvas = this.canvas;

			ctx.drawImage(img, 0, top);

			let o1 = new waveLines(0.05), o2 = new waveLines(0.03), o3 = new waveLines(0.06),  // new position for vert
					o4 = new waveLines(0.08), o5 = new waveLines(0.04), o6 = new waveLines(0.067); // new position for hori

					// source grid lines
			let x0 = 0, x1 = w * 0.25, x2 = w * 0.5, x3 = w * 0.75, x4 = w,
					y0 = 0, y1 = h * 0.25, y2 = h * 0.5, y3 = h * 0.75, y4 = h;
					
					// cache source widths/heights
			let sw0 = x1, sw1 = x2 - x1, sw2 = x3 - x2, sw3 = x4 - x3,
					sh0 = y1, sh1 = y2 - y1, sh2 = y3 - y2, sh3 = y4 - y3;

			let vcanvas = document.createElement("canvas"); // off-screen canvas for 2. pass
			let vctx = vcanvas.getContext("2d");

			vcanvas.width = w; vcanvas.height = h;// set to same size as main canvas

			let loop = ()=> {
				ctx.clearRect(0, 0, w, h);

				for (var y = 0; y < h; y++) {

					// segment position
					var lx1 = x1 + o1.current(y * 0.2) * 2.5,
							lx2 = x2 + o2.current(y * 0.2) * 2,
							lx3 = x3 + o3.current(y * 0.2) * 1.5,

							// segment width
							w0 = lx1,
							w1 = lx2 - lx1,
							w2 = lx3 - lx2,
							w3 =  x4 - lx3;

					// draw image lines
					ctx.drawImage(img, x0, y, sw0, 1, 0, y, w0, 1);
					ctx.drawImage(img, x1, y, sw1, 1, lx1 - 0.5, y, w1 + 0.5, 1);
					ctx.drawImage(img, x2, y, sw2, 1, lx2 - 0.5, y, w2 + 0.5, 1);
					ctx.drawImage(img, x3, y, sw3, 1, lx3 - 0.5, y, w3 + 0.5, 1);
				}

				// pass 1 done, copy to off-screen canvas:
				vctx.clearRect(0, 0, w, h); // clear off-screen canvas (only if alpha)
				vctx.drawImage(img, 0, 0);
				ctx.clearRect(0, 0, w, h);  // clear main (onlyif alpha)

				for (var x = 0; x < w; x++) {
					var ly1 = y1 + o4.current(x * 0.32),
							ly2 = y2 + o5.current(x * 0.3) * 2,
							ly3 = y3 + o6.current(x * 0.4) * 1.5;

					ctx.drawImage(img, x, y0, 1, sh0, x, 0, 1, ly1);
					ctx.drawImage(img, x, y1, 1, sh1, x, ly1 - 0.5, 1, ly2 - ly1 + 0.5);
					ctx.drawImage(img, x, y2, 1, sh2, x, ly2 - 0.5, 1, ly3 - ly2 + 0.5);
					ctx.drawImage(img, x, y3, 1, sh3, x, ly3 - 0.5, 1,  y4 - ly3 + 0.5);
				}
				if (!this._destroyed){
					requestAnimationFrame(loop.bind(this));
				}
			}
			loop();
		}
	}

	Array.prototype.forEach.call(document.querySelectorAll(".canvas-flame"), function(canvasEl){
		const flameAnimation = new FlameAnimation(canvasEl);
		flameAnimation.init();
	});
});


// sparks
document.addEventListener('DOMContentLoaded', function(){

	function randomInt(min, max) {
		return Math.floor(Math.random() * (max - min)) + min;
	}

	// vertor for directions
	class Vector {
		x = 0;
		y = 0;

		constructor(x, y){
			this.x = x || 0;
			this.y = y || 0;
		}

		add(vector){
			return new Vector(this.x + vector.x, this.y + vector.y);
		}

		getAngle() {
			return Math.atan2(this.y, this.x);
		}

		clone() {
			return new Vector(this.x, this.y);
		}
	}

	class Spark {
		position = null;
		size = null;
		direction = null;
		index = null;
		distance = null;
		speed = 1;
		offset = 0;

		constructor(position, size, direction){
			this.position = position;
			this.size = size;
			this.direction = direction;
			this.index = Math.random() * 1000;
			this.distance = randomInt(0, 1000);
			this.speed = 0.1 + Math.random();
			this.offset = Math.random() > 0.5 ? randomInt(-10, 10) : 0;
		}

		render(host){
			let ctx = host.ctx;
			let width = host.width;
			let height = host.height;
			let scale = this.offset === 0 ? 1 : this.offset / 10;

			let rotation = this.direction.getAngle();
			let x = Math.cos(rotation),
					y = Math.sin(rotation);

			var grad = ctx.createLinearGradient(
				this.position.x, this.position.y,
				this.position.x+x*this.size.x, this.position.y+y*this.size.x
			);
			grad.addColorStop(0, host.color1);
			grad.addColorStop(1, host.color2);

			let alpha = Math.max(Math.cos(this.distance / 10 * (host.speed*this.speed)), 0);
			ctx.globalAlpha = alpha;

			ctx.strokeStyle = grad;
			ctx.lineWidth = this.size.y * scale;
			ctx.lineCap = 'round';

			// Shadow
			ctx.shadowColor = host.color2;
			ctx.shadowBlur = this.size.y * 3 * scale;
			ctx["filter"] = `blur(${Math.abs(this.offset / 2)}px)`;

			ctx.beginPath();

			ctx.moveTo(this.position.x, this.position.y);

			ctx.lineTo(this.position.x+x*this.size.x, this.position.y+y*this.size.x);

			ctx.stroke();
			this.position.x = this.position.x+x*(host.speed*this.speed)*this.size.x;
			this.position.y = this.position.y+y*(host.speed*this.speed)*this.size.x;

			ctx.globalAlpha = 1;
			this.distance++;

			if (this.isOutside(width, height)) {
				this.reset(host);
			}
		}

		reset(host){
			this.position = host.getStartPosition();
			this.direction = this.direction.clone().add(new Vector(Math.random() * host.spread, Math.random() * host.spread));
			this.distance = randomInt(0, 1000);
		}

		isOutside(width, height){
			return this.position.x > width / 2 || this.position.y < 0;
		}
	}

	class SparksAnimation {
		canvas = null;
		ctx = null;

		width = 0;
		height = 0;

		color1 = "rgba(196, 84, 69, 1)";
		color2 = "rgba(245, 217, 162, 1)";

		speed = 0.5;
		spread = 0.03;

		direction = new Vector(1,-1);

		_destroyed = true;

		constructor(host){
			this._destroyed = false;
			this.canvas = host;

			this.ctx = this.canvas.getContext("2d");

			setTimeout(()=> {
				this.updateRects();
				this.init();
			}, 100);
		}

		updateRects(){
			this.width = this.canvas.width = this.canvas.parentNode.getBoundingClientRect().width;
			this.height = this.canvas.height = this.canvas.parentNode.getBoundingClientRect().height;
		}

		init(){
			let sparks = [];
			let sparksCount = 25;

			let interval = setInterval(()=> {
				if (sparks.length < sparksCount) {
					let newSpark = new Spark(
						this.getStartPosition(),
						new Vector(10, 2),
						this.direction.clone().add(new Vector(Math.random() * this.spread, Math.random() * this.spread))
					);
					sparks.push(newSpark);
				} else {
					clearInterval(interval);
				}
			}, 500 * this.speed);

			let i = 0;
			let render = ()=> {
				this.ctx.clearRect(0, 0, this.width, this.height);

				sparks.map((s)=> {
					s.direction.x += Math.cos(s.index * this.speed * 0.1) * this.spread;
					s.direction.y += Math.cos(s.index * this.speed * 0.1) * this.spread;
					s.render(this);
					s.index++;
				});

				if (!this._destroyed){
					requestAnimationFrame(render.bind(this));
				}
			}
			render();
		}

		getStartPosition() {
			return new Vector(this.width * 0.25 * Math.random(), this.height);
		}

		onDestroy(){
			this._destroyed = true;
		}
	}

	Array.prototype.forEach.call(document.querySelectorAll(".canvas-sparks"), function(canvasEl){
		
		const spaksAnimation = new SparksAnimation(canvasEl);
		spaksAnimation.init();
	});
});



// smoth scroll
document.addEventListener('DOMContentLoaded', function(){
	Array.prototype.forEach.call(document.querySelectorAll("[data-scrollto]"), function(button){
		button.addEventListener("click", function (e) {
			e.preventDefault();
			let scrollTarget = button.dataset.scrollto;
			document.querySelector(scrollTarget).scrollIntoView({
				behavior: 'smooth' 
			});
		});
	});
});
// dropdown
// header scroll animation
document.addEventListener('DOMContentLoaded', function(){
	const SCROLLED_CLASS = 'scrolled'
	const MAIN_HEADER = document.getElementById('mainHeader');
	const PAGE_MAIN = document.getElementById('pageMain');

	let scrollPosition = 0;
	let scrollDirection = 0;

	let setMainPageOffset = function(mainPage){
		if (!mainPage) return;
		let headerHeight = MAIN_HEADER.getBoundingClientRect().height;
		mainPage.style.paddingTop = headerHeight + 'px'
	};

	let detectScrollDirection = function(){
		if ((document.body.getBoundingClientRect()).top > scrollPosition) {
			scrollDirection = 'up';
		} else {
			scrollDirection = 'down';
		};
		scrollPosition = (document.body.getBoundingClientRect()).top;
	};

	let setDetectHeaderScroll = function(header){
		let bannerClassName = MAIN_HEADER.dataset.scrollCheck;
		if (!MAIN_HEADER || !MAIN_HEADER.dataset.scrollCheck) return;
		let bannerEl = document.querySelector('.'+bannerClassName);

		let headerHeight = MAIN_HEADER.getBoundingClientRect().height;
		let bannerHeight = bannerEl.getBoundingClientRect().height;

		if (window.pageYOffset > headerHeight*2) {
			header.classList.add('translated');
			if (scrollDirection == 'up') {
				header.classList.remove('translated')
			} else {
				header.classList.add('translated');
			};
		} else {
			header.classList.remove('translated');
		};
	};

	// on scroll
	document.addEventListener("scroll", (event) => {
		detectScrollDirection();
		setDetectHeaderScroll(MAIN_HEADER);
	}, {passive: true});

	// on resize
	window.addEventListener("resize", (event) => {
		setMainPageOffset(PAGE_MAIN);
	}, {passive: true});

	// on load
	setMainPageOffset(PAGE_MAIN);
	setDetectHeaderScroll(MAIN_HEADER);
});
document.addEventListener( 'DOMContentLoaded', function() {


})
// popup
document.addEventListener('DOMContentLoaded', function(){

	class Popup {
		hidePopupButtonClassName = '.close-popup';

		constructor(popupId) {
			this.popupId = popupId;
			this.called = document.querySelector(popupId);
			this.hidePopupButton = this.called.querySelector(this.hidePopupButtonClassName);
		}

		hidePopup = function() {
			let called = this.called;

			document.body.classList.remove('overlayed');
			document.body.style.width = '';
			document.getElementById('mainHeader').style.width = '';

			called.classList.remove('active');
			// on close call back
			setTimeout(function() {
				called.classList.remove('showed');
				if (called.dataset.onclose && window[called.dataset.onclose]) {
					return window[called.dataset.onclose](called);
				}
			}, 300);
		};

		showPopup = function() {
			let called = this.called;
					called.classList.add('showed');

			document.body.style.width = window.getComputedStyle(document.body).width;
			document.getElementById('mainHeader').style.width = window.getComputedStyle(document.getElementById('mainHeader')).width;
			document.body.classList.add('overlayed');

			setTimeout(function() {
				called.classList.add('active');
				if (called.dataset.onopen && window[called.dataset.onopen]) {
					return window[called.dataset.onopen](called);
				};
			}, 300);
		};

		init() {
			let popup = this;
			popup.showPopup();
			popup.hidePopupButton.addEventListener("click", popup.hidePopup.bind(popup), false);
			popup.called.addEventListener("click", function(e){
				e.preventDefault();
				if (!e.target.closest('.inner')) {
					popup.hidePopup();
				};
			}, false);
		};
	};

	Array.prototype.forEach.call(document.querySelectorAll("[data-popup-call]"), function(button){
		button.addEventListener("click", function (e) {
			if (!button.dataset.popupCall) return;
			const newPopup = new Popup(button.dataset.popupCall);
			newPopup.init();
		});
	});

});


// running line
document.addEventListener('DOMContentLoaded', function(){

	class RunningLine {
		lineClassName = 'line';
		lineFollowTag = 'ul';
		activeClassName = 'active';

		activeElement = null;

		constructor(lineParent) {
			this.lineParent = lineParent;
			this.lineElement = lineParent.querySelector('.'+this.lineClassName);
			this.lineFollowElement = lineParent.querySelector(this.lineFollowTag);
		}

		setActiveElement(element){
			this.activeElement = element;
		};

		getActiveElement = function() {
			return this.activeElement;
		};

		setPosition = function() {
			let el = this.getActiveElement();

			let style = window.getComputedStyle(el);
			let leftGap = parseInt(style.paddingLeft.replace('px', ''));
			let elLeftPosition = el.parentNode.offsetLeft;

			let computedLeft = elLeftPosition + leftGap;

			this.lineElement.style.left = computedLeft + 'px';
		};

		setWidth = function() {
			let el = this.getActiveElement();
			let style = window.getComputedStyle(el);
			let leftGap = parseInt(style.paddingLeft.replace('px', ''));
			let rightGap = parseInt(style.paddingRight.replace('px', ''));
			let elWidth = el.offsetWidth;

			let computedWidth = elWidth - leftGap - rightGap;

			this.lineElement.style.width = computedWidth + 'px';
		};

		init() {
			let runningLine = this;
			let activeElement = runningLine.lineFollowElement.querySelector('.'+runningLine.activeClassName);
			runningLine.setActiveElement(activeElement);
			runningLine.setWidth();
			runningLine.setPosition();

			Array.prototype.forEach.call(runningLine.lineFollowElement.children, function(item){
				item.querySelector('a').addEventListener("mouseenter", function (e) {
					runningLine.setActiveElement(this);
					runningLine.setWidth();
					runningLine.setPosition();
				});
				item.querySelector('a').addEventListener("mouseleave", function (e) {
					runningLine.setActiveElement(activeElement);
					runningLine.setWidth();
					runningLine.setPosition();
				});
			})
		};
	};

	Array.prototype.forEach.call(document.querySelectorAll(".running-line"), function(line){
		const newRunningLine = new RunningLine(line);
		newRunningLine.init();
	});

});
// section scroll animation
document.addEventListener('DOMContentLoaded', function(){
	let ANIMATED_CLASS = 'animated'

	let setDetectSectionAnimation = function(section){
		if (window.pageYOffset + window.innerHeight / 1.3 > section.offsetTop) {
			if (!section.classList.contains(ANIMATED_CLASS)) {
				section.classList.add(ANIMATED_CLASS);
			};
		};
	};

	// on scroll
	document.addEventListener("scroll", (event) => {
		Array.prototype.forEach.call(document.querySelectorAll(".section"), function(section){
			setDetectSectionAnimation(section);
		});
	}, {passive: true});

	// on load
	Array.prototype.forEach.call(document.querySelectorAll(".section"), function(section){
		setTimeout(function(){
			setDetectSectionAnimation(section);
		}, 10)
	});
	setTimeout(function(){
		document.getElementById('mainHeader').classList.add(ANIMATED_CLASS);
	}, 10)
});
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

		activeSlideEl = null;
		activeIndex = 0;

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
			direction: 'horizontal'
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

			this.track = this.sliderElment.querySelector('.slider-list');

			this.sliderElment.querySelector('.slider-track').addEventListener('mousedown', this.start.bind(this));
			this.sliderElment.querySelector('.slider-track').addEventListener('touchstart', this.start.bind(this));

			this.sliderElment.querySelector('.slider-track').addEventListener('mousemove', this.move.bind(this));
			this.sliderElment.querySelector('.slider-track').addEventListener('touchmove', this.move.bind(this));

			this.sliderElment.querySelector('.slider-track').addEventListener('mouseleave', this.end.bind(this));
			this.sliderElment.querySelector('.slider-track').addEventListener('mouseup', this.end.bind(this));
			this.sliderElment.querySelector('.slider-track').addEventListener('touchend', this.end.bind(this));
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
			if(!this.isTouchDown) return;
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
		}

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



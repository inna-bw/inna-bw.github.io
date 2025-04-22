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

			window.addEventListener('resize', this.updateRects);
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

			window.addEventListener('resize', this.updateRects);
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



document.addEventListener('DOMContentLoaded', function(){
	// Ported from Stefan Gustavson's java implementation
	// http://staffwww.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf
	// Read Stefan's excellent paper for details on how this code works.
	//
	// Sean McCullough banksean@gmail.com

	/**
	 * You can pass in a random number generator object if you like.
	 * It is assumed to have a random() method.
	 */
	var ClassicalNoise = function(r) { // Classic Perlin noise in 3D, for comparison 
		if (r == undefined) r = Math;
		this.grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0], 
																	 [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1], 
																	 [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
		this.p = [];
		for (var i=0;i<256;i++) {
			this.p[i] = Math.floor(r.random()*256);
		}
		// To remove the need for index wrapping, double the permutation table length 
		this.perm = [];
		for(var i=0;i<512;i++) {
			this.perm[i]=this.p[i & 255];
		}
	};

	ClassicalNoise.prototype.dot = function(g, x, y, z) { 
			return g[0]*x + g[1]*y + g[2]*z;
	};

	ClassicalNoise.prototype.mix = function(a, b, t) { 
			return (1.0-t)*a + t*b;
	};

	ClassicalNoise.prototype.fade = function(t) { 
			return t*t*t*(t*(t*6.0-15.0)+10.0);
	};

		// Classic Perlin noise, 3D version 
	ClassicalNoise.prototype.noise = function(x, y, z) { 
		// Find unit grid cell containing point 
		var X = Math.floor(x);
		var Y = Math.floor(y);
		var Z = Math.floor(z);
		
		// Get relative xyz coordinates of point within that cell 
		x = x - X;
		y = y - Y;
		z = z - Z;
		
		// Wrap the integer cells at 255 (smaller integer period can be introduced here) 
		X = X & 255;
		Y = Y & 255;
		Z = Z & 255;
		
		// Calculate a set of eight hashed gradient indices 
		var gi000 = this.perm[X+this.perm[Y+this.perm[Z]]] % 12;
		var gi001 = this.perm[X+this.perm[Y+this.perm[Z+1]]] % 12;
		var gi010 = this.perm[X+this.perm[Y+1+this.perm[Z]]] % 12;
		var gi011 = this.perm[X+this.perm[Y+1+this.perm[Z+1]]] % 12;
		var gi100 = this.perm[X+1+this.perm[Y+this.perm[Z]]] % 12;
		var gi101 = this.perm[X+1+this.perm[Y+this.perm[Z+1]]] % 12;
		var gi110 = this.perm[X+1+this.perm[Y+1+this.perm[Z]]] % 12;
		var gi111 = this.perm[X+1+this.perm[Y+1+this.perm[Z+1]]] % 12;

		// The gradients of each corner are now: 
		// g000 = grad3[gi000];
		// g001 = grad3[gi001];
		// g010 = grad3[gi010];
		// g011 = grad3[gi011];
		// g100 = grad3[gi100];
		// g101 = grad3[gi101];
		// g110 = grad3[gi110];
		// g111 = grad3[gi111];
		// Calculate noise contributions from each of the eight corners 
		var n000= this.dot(this.grad3[gi000], x, y, z);
		var n100= this.dot(this.grad3[gi100], x-1, y, z);
		var n010= this.dot(this.grad3[gi010], x, y-1, z);
		var n110= this.dot(this.grad3[gi110], x-1, y-1, z);
		var n001= this.dot(this.grad3[gi001], x, y, z-1);
		var n101= this.dot(this.grad3[gi101], x-1, y, z-1);
		var n011= this.dot(this.grad3[gi011], x, y-1, z-1);
		var n111= this.dot(this.grad3[gi111], x-1, y-1, z-1);
		// Compute the fade curve value for each of x, y, z 
		var u = this.fade(x);
		var v = this.fade(y);
		var w = this.fade(z);
		// Interpolate along x the contributions from each of the corners 
		var nx00 = this.mix(n000, n100, u);
		var nx01 = this.mix(n001, n101, u);
		var nx10 = this.mix(n010, n110, u);
		var nx11 = this.mix(n011, n111, u);
		// Interpolate the four results along y 
		var nxy0 = this.mix(nx00, nx10, v);
		var nxy1 = this.mix(nx01, nx11, v);
		// Interpolate the two last results along z 
		var nxyz = this.mix(nxy0, nxy1, w);

		return nxyz;
	};



	class CanvasWaveAnimation {
		canvas = null;
		ctx = null;

		canvasWidth = 0;
		canvasHeight = 0;

		_destroyed = true;

		options = {
			perlin: new ClassicalNoise(),
			variation: .001,
			amp: 600,
			maxLines: 40,
			lineSpace: .03,
			variators: [],
			startY: 0,
			heightOffset: 120
		}

		constructor(host){
			if (!host) return;
			this._destroyed = false;
			this.canvas = host;
			this.ctx = this.canvas.getContext("2d");

			setTimeout(()=> {
				this.updateRects();
				this.init();
			}, 100);

			window.addEventListener('resize', this.updateRects.bind(this));
		}

		init(){
			for (var i = 0, u = 0; i < this.options.maxLines; i++, u += this.options.lineSpace) {
				this.options.variators[i] = u;
			};

			let render = ()=> {
				this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
				this.draw();
				if (!this._destroyed){
					requestAnimationFrame(render.bind(this));
				}
			}
			render();
		};

		updateRects(){
			this.canvasWidth = this.canvas.width = this.canvas.parentNode.getBoundingClientRect().width;
			this.canvasHeight = this.canvas.height = this.canvas.parentNode.getBoundingClientRect().height;

			this.options.amp = this.canvasHeight - this.options.heightOffset;
			this.options.startY = this.canvasHeight/2;
		};

		draw(){
			for (var i = 0; i <= this.options.maxLines; i++) {
				this.ctx.beginPath();
				this.ctx.moveTo(0, this.options.startY);
				for (var x = 0; x <= this.canvasWidth; x++) {
					var y = this.options.perlin.noise(x * this.options.variation + this.options.variators[i], x * this.options.variation, 0);
					this.ctx.lineTo(x, this.options.startY + this.options.amp * y);
				}
				var color = Math.floor(150 * Math.abs(y));
				var alpha = Math.min(Math.abs(y), .8) + .1;
				this.ctx.strokeStyle = "rgba(207,40,50," + alpha + ")";
				this.ctx.stroke();
				this.ctx.closePath();

				this.options.variators[i] += .002;
			};
		};
	};

	let canvasEl = document.getElementById('canvasWave');
	if (canvasEl) {
		const canvasWaveAnimation = new CanvasWaveAnimation(canvasEl);
		canvasWaveAnimation.init();
	};

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
// data-tab-hover data-tab-index

document.addEventListener('DOMContentLoaded', function(){

	class TabHover {
		activeLinkClassName = 'active';
		activeClassName = 'active';
		animatedClassName = 'animated';
		allYabHovers = document.querySelectorAll("[data-tab-hover]");
		tabIndex = 0;
		hoveredContainer = null;

		savedActiveLink = null;
		currentLink = null;

		constructor(tabHoverEl){
			this.tabHoverEl = tabHoverEl;
		}

		init(){
			this.tabIndex = parseInt(this.tabHoverEl.dataset.tabHover);
			this.hoveredContainer = document.querySelector(`[data-tab-index="${this.tabIndex}"]`);
			if (!this.hoveredContainer) return;

			this.savedActiveLink = this.tabHoverEl.parentNode.querySelector('a.active');
			this.currentLink = this.tabHoverEl.querySelector('a');

			this.tabHoverEl.addEventListener('mouseenter', function(e){
				e.stopPropagation();
				e.stopImmediatePropagation();
				this.setActiveLinkClass(this.savedActiveLink, this.currentLink);
				this.closeAllContainers();
				this.showContainer(this.hoveredContainer);
			}.bind(this));

			this.hoveredContainer.addEventListener('mouseleave', function(e){
				e.stopPropagation();
				e.stopImmediatePropagation();
				this.hideContainer(this.hoveredContainer);
			}.bind(this));

			document.addEventListener('mousemove', function(e){
				if (!e.target.closest('.line') && !e.target.closest('[data-tab-hover]') && !e.target.closest('[data-tab-index]')) {
					this.closeAllContainers();
				}
				if (!e.target.closest('.header-navigation') && !e.target.closest('[data-tab-index]')) {
					this.setActiveLinkClass(this.currentLink, this.savedActiveLink);
					window.newRunningLine.start(this.savedActiveLink);
				}
			}.bind(this));
		};

		setActiveLinkClass = function(prevLink, currentLink) {
			prevLink.classList.remove(this.activeLinkClassName);
			currentLink.classList.add(this.activeLinkClassName);
		};

		closeAllContainers = function(){
			let allContainers = Array.prototype.slice.call(document.querySelectorAll("[data-tab-index]"));
			allContainers.forEach(function(item){
				this.hideContainer(item);
			}.bind(this));
		};

		showContainer = function(container){
			setTimeout(()=> {
				container.classList.add(this.activeClassName);
				setTimeout(()=> {
					container.classList.add(this.animatedClassName);
				}, 350);
			}, 250);
		};

		hideContainer = function(container){
			container.classList.remove(this.animatedClassName);
			container.classList.remove(this.activeClassName);
		};

	};

	Array.prototype.forEach.call(document.querySelectorAll("[data-tab-hover]"), function(tabHoverEl){
		const tabHover = new TabHover(tabHoverEl);
		tabHover.init();
	});
});

//dropdown
document.addEventListener('DOMContentLoaded', function(){

	class Dropdown {
		activeClassName = 'opened';
		allDropdowns = document.querySelectorAll("[data-dropdown]");
		dropdownButton = null;

		constructor(dropdownEl){
			this.dropdownEl = dropdownEl;
		}

		init(){
			this.dropdownButton = this.dropdownEl.querySelector('.dropdown-header');
			this.dropdownButton.addEventListener('click', this.dropdownToggle.bind(this), false);
			document.addEventListener("click", function (e) {
				if (!e.target.closest('[data-dropdown]')) {
					this.closeAllDropdowns();
				};
			}.bind(this));
		}

		closeAllDropdowns = function(){
			let allDropdowns = document.querySelectorAll("[data-dropdown]");
			for (let i = 0; i < allDropdowns.length; i++) {
				let dropdownInner = allDropdowns[i].querySelector('.dropdown-inner');
				allDropdowns[i].classList.remove(this.activeClassName);
				dropdownInner.style.maxHeight = null;
			}
		}

		dropdownToggle = function() {
			let button = this.dropdownButton;
			let dropdownInner = button.parentElement.querySelector('.dropdown-inner');
			if (button.parentElement.classList.contains(this.activeClassName)) {
				this.closeAllDropdowns();
			} else {
				this.closeAllDropdowns();
				button.parentElement.classList.add(this.activeClassName);
			};
		}
	};

	Array.prototype.forEach.call(document.querySelectorAll("[data-dropdown]"), function(dropdownEl){
		const dropdown = new Dropdown(dropdownEl);
		dropdown.init();
	});
});
// header scroll animation
document.addEventListener('DOMContentLoaded', function(){
	const SCROLLED_CLASS = 'scrolled'
	const MAIN_HEADER = document.getElementById('mainHeader');
	const PAGE_MAIN = document.getElementById('pageMain');

	let scrollPosition = 0;
	let scrollDirection = 0;

	let headerIsOnTarget = false;

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

		let headerHeight = MAIN_HEADER.getBoundingClientRect().height;

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


	// get mouse target
	document.addEventListener('mousemove', (event) => {
		headerIsOnTarget = event.target.closest('.main-header') ? true : false;
	});

	// on scroll
	document.addEventListener("scroll", (event) => {
		if (headerIsOnTarget) return;
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

	(function() {
		var COUNT_FRAMERATE, COUNT_MS_PER_FRAME, DIGIT_FORMAT, DIGIT_HTML, DIGIT_SPEEDBOOST, DURATION, FORMAT_MARK_HTML, FORMAT_PARSER, FRAMERATE, FRAMES_PER_VALUE, MS_PER_FRAME, MutationObserver, Odometer, RIBBON_HTML, TRANSITION_END_EVENTS, TRANSITION_SUPPORT, VALUE_HTML, addClass, createFromHTML, fractionalPart, now, removeClass, requestAnimationFrame, round, transitionCheckStyles, trigger, truncate, wrapJQuery, _jQueryWrapped, _old, _ref, _ref1,
			__slice = [].slice;

		VALUE_HTML = '<span class="odometer-value"></span>';

		RIBBON_HTML = '<span class="odometer-ribbon"><span class="odometer-ribbon-inner">' + VALUE_HTML + '</span></span>';

		DIGIT_HTML = '<span class="odometer-digit"><span class="odometer-digit-spacer">8</span><span class="odometer-digit-inner">' + RIBBON_HTML + '</span></span>';

		FORMAT_MARK_HTML = '<span class="odometer-formatting-mark"></span>';

		DIGIT_FORMAT = '(,ddd).dd';

		FORMAT_PARSER = /^\(?([^)]*)\)?(?:(.)(d+))?$/;

		FRAMERATE = 30;

		DURATION = 2000;

		COUNT_FRAMERATE = 20;

		FRAMES_PER_VALUE = 2;

		DIGIT_SPEEDBOOST = .5;

		MS_PER_FRAME = 1000 / FRAMERATE;

		COUNT_MS_PER_FRAME = 1000 / COUNT_FRAMERATE;

		TRANSITION_END_EVENTS = 'transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd';

		transitionCheckStyles = document.createElement('div').style;

		TRANSITION_SUPPORT = (transitionCheckStyles.transition != null) || (transitionCheckStyles.webkitTransition != null) || (transitionCheckStyles.mozTransition != null) || (transitionCheckStyles.oTransition != null);

		requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

		MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

		createFromHTML = function(html) {
			var el;
			el = document.createElement('div');
			el.innerHTML = html;
			return el.children[0];
		};

		removeClass = function(el, name) {
			return el.className = el.className.replace(new RegExp("(^| )" + (name.split(' ').join('|')) + "( |$)", 'gi'), ' ');
		};

		addClass = function(el, name) {
			removeClass(el, name);
			return el.className += " " + name;
		};

		trigger = function(el, name) {
			var evt;
			if (document.createEvent != null) {
				evt = document.createEvent('HTMLEvents');
				evt.initEvent(name, true, true);
				return el.dispatchEvent(evt);
			}
		};

		now = function() {
			var _ref, _ref1;
			return (_ref = (_ref1 = window.performance) != null ? typeof _ref1.now === "function" ? _ref1.now() : void 0 : void 0) != null ? _ref : +(new Date);
		};

		round = function(val, precision) {
			if (precision == null) {
				precision = 0;
			}
			if (!precision) {
				return Math.round(val);
			}
			val *= Math.pow(10, precision);
			val += 0.5;
			val = Math.floor(val);
			return val /= Math.pow(10, precision);
		};

		truncate = function(val) {
			if (val < 0) {
				return Math.ceil(val);
			} else {
				return Math.floor(val);
			}
		};

		fractionalPart = function(val) {
			return val - round(val);
		};

		_jQueryWrapped = false;

		(wrapJQuery = function() {
			var property, _i, _len, _ref, _results;
			if (_jQueryWrapped) {
				return;
			}
			if (window.jQuery != null) {
				_jQueryWrapped = true;
				_ref = ['html', 'text'];
				_results = [];
				for (_i = 0, _len = _ref.length; _i < _len; _i++) {
					property = _ref[_i];
					_results.push((function(property) {
						var old;
						old = window.jQuery.fn[property];
						return window.jQuery.fn[property] = function(val) {
							var _ref1;
							if ((val == null) || (((_ref1 = this[0]) != null ? _ref1.odometer : void 0) == null)) {
								return old.apply(this, arguments);
							}
							return this[0].odometer.update(val);
						};
					})(property));
				}
				return _results;
			}
		})();

		setTimeout(wrapJQuery, 0);

		Odometer = (function() {
			function Odometer(options) {
				var e, k, property, v, _base, _i, _len, _ref, _ref1, _ref2,
					_this = this;
				this.options = options;
				this.el = this.options.el;
				if (this.el.odometer != null) {
					return this.el.odometer;
				}
				this.el.odometer = this;
				_ref = Odometer.options;
				for (k in _ref) {
					v = _ref[k];
					if (this.options[k] == null) {
						this.options[k] = v;
					}
				}
				if ((_base = this.options).duration == null) {
					_base.duration = DURATION;
				}
				this.MAX_VALUES = ((this.options.duration / MS_PER_FRAME) / FRAMES_PER_VALUE) | 0;
				this.resetFormat();
				this.value = this.cleanValue((_ref1 = this.options.value) != null ? _ref1 : '');
				this.renderInside();
				this.render();
				try {
					_ref2 = ['innerHTML', 'innerText', 'textContent'];
					for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
						property = _ref2[_i];
						if (this.el[property] != null) {
							(function(property) {
								return Object.defineProperty(_this.el, property, {
									get: function() {
										var _ref3;
										if (property === 'innerHTML') {
											return _this.inside.outerHTML;
										} else {
											return (_ref3 = _this.inside.innerText) != null ? _ref3 : _this.inside.textContent;
										}
									},
									set: function(val) {
										return _this.update(val);
									}
								});
							})(property);
						}
					}
				} catch (_error) {
					e = _error;
					this.watchForMutations();
				}
				this;
			}

			Odometer.prototype.renderInside = function() {
				this.inside = document.createElement('div');
				this.inside.className = 'odometer-inside';
				this.el.innerHTML = '';
				return this.el.appendChild(this.inside);
			};

			Odometer.prototype.watchForMutations = function() {
				var e,
					_this = this;
				if (MutationObserver == null) {
					return;
				}
				try {
					if (this.observer == null) {
						this.observer = new MutationObserver(function(mutations) {
							var newVal;
							newVal = _this.el.innerText;
							_this.renderInside();
							_this.render(_this.value);
							return _this.update(newVal);
						});
					}
					this.watchMutations = true;
					return this.startWatchingMutations();
				} catch (_error) {
					e = _error;
				}
			};

			Odometer.prototype.startWatchingMutations = function() {
				if (this.watchMutations) {
					return this.observer.observe(this.el, {
						childList: true
					});
				}
			};

			Odometer.prototype.stopWatchingMutations = function() {
				var _ref;
				return (_ref = this.observer) != null ? _ref.disconnect() : void 0;
			};

			Odometer.prototype.cleanValue = function(val) {
				var _ref;
				if (typeof val === 'string') {
					val = val.replace((_ref = this.format.radix) != null ? _ref : '.', '<radix>');
					val = val.replace(/[.,]/g, '');
					val = val.replace('<radix>', '.');
					val = parseFloat(val, 10) || 0;
				}
				return round(val, this.format.precision);
			};

			Odometer.prototype.bindTransitionEnd = function() {
				var event, renderEnqueued, _i, _len, _ref, _results,
					_this = this;
				if (this.transitionEndBound) {
					return;
				}
				this.transitionEndBound = true;
				renderEnqueued = false;
				_ref = TRANSITION_END_EVENTS.split(' ');
				_results = [];
				for (_i = 0, _len = _ref.length; _i < _len; _i++) {
					event = _ref[_i];
					_results.push(this.el.addEventListener(event, function() {
						if (renderEnqueued) {
							return true;
						}
						renderEnqueued = true;
						setTimeout(function() {
							_this.render();
							renderEnqueued = false;
							return trigger(_this.el, 'odometerdone');
						}, 0);
						return true;
					}, false));
				}
				return _results;
			};

			Odometer.prototype.resetFormat = function() {
				var format, fractional, parsed, precision, radix, repeating, _ref, _ref1;
				format = (_ref = this.options.format) != null ? _ref : DIGIT_FORMAT;
				format || (format = 'd');
				parsed = FORMAT_PARSER.exec(format);
				if (!parsed) {
					throw new Error("Odometer: Unparsable digit format");
				}
				_ref1 = parsed.slice(1, 4), repeating = _ref1[0], radix = _ref1[1], fractional = _ref1[2];
				precision = (fractional != null ? fractional.length : void 0) || 0;
				return this.format = {
					repeating: repeating,
					radix: radix,
					precision: precision
				};
			};

			Odometer.prototype.render = function(value) {
				var classes, cls, digit, match, newClasses, theme, wholePart, _i, _j, _len, _len1, _ref;
				if (value == null) {
					value = this.value;
				}
				this.stopWatchingMutations();
				this.resetFormat();
				this.inside.innerHTML = '';
				theme = this.options.theme;
				classes = this.el.className.split(' ');
				newClasses = [];
				for (_i = 0, _len = classes.length; _i < _len; _i++) {
					cls = classes[_i];
					if (!cls.length) {
						continue;
					}
					if (match = /^odometer-theme-(.+)$/.exec(cls)) {
						theme = match[1];
						continue;
					}
					if (/^odometer(-|$)/.test(cls)) {
						continue;
					}
					newClasses.push(cls);
				}
				newClasses.push('odometer');
				if (!TRANSITION_SUPPORT) {
					newClasses.push('odometer-no-transitions');
				}
				if (theme) {
					newClasses.push("odometer-theme-" + theme);
				} else {
					newClasses.push("odometer-auto-theme");
				}
				this.el.className = newClasses.join(' ');
				this.ribbons = {};
				this.digits = [];
				wholePart = !this.format.precision || !fractionalPart(value) || false;
				_ref = value.toString().split('').reverse();
				for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
					digit = _ref[_j];
					if (digit === '.') {
						wholePart = true;
					}
					this.addDigit(digit, wholePart);
				}
				return this.startWatchingMutations();
			};

			Odometer.prototype.update = function(newValue) {
				var diff,
					_this = this;
				newValue = this.cleanValue(newValue);
				if (!(diff = newValue - this.value)) {
					return;
				}
				removeClass(this.el, 'odometer-animating-up odometer-animating-down odometer-animating');
				if (diff > 0) {
					addClass(this.el, 'odometer-animating-up');
				} else {
					addClass(this.el, 'odometer-animating-down');
				}
				this.stopWatchingMutations();
				this.animate(newValue);
				this.startWatchingMutations();
				setTimeout(function() {
					_this.el.offsetHeight;
					return addClass(_this.el, 'odometer-animating');
				}, 0);
				return this.value = newValue;
			};

			Odometer.prototype.renderDigit = function() {
				return createFromHTML(DIGIT_HTML);
			};

			Odometer.prototype.insertDigit = function(digit, before) {
				if (before != null) {
					return this.inside.insertBefore(digit, before);
				} else if (!this.inside.children.length) {
					return this.inside.appendChild(digit);
				} else {
					return this.inside.insertBefore(digit, this.inside.children[0]);
				}
			};

			Odometer.prototype.addSpacer = function(chr, before, extraClasses) {
				var spacer;
				spacer = createFromHTML(FORMAT_MARK_HTML);
				spacer.innerHTML = chr;
				if (extraClasses) {
					addClass(spacer, extraClasses);
				}
				return this.insertDigit(spacer, before);
			};

			Odometer.prototype.addDigit = function(value, repeating) {
				var chr, digit, resetted, _ref;
				if (repeating == null) {
					repeating = true;
				}
				if (value === '-') {
					return this.addSpacer(value, null, 'odometer-negation-mark');
				}
				if (value === '.') {
					return this.addSpacer((_ref = this.format.radix) != null ? _ref : '.', null, 'odometer-radix-mark');
				}
				if (repeating) {
					resetted = false;
					while (true) {
						if (!this.format.repeating.length) {
							if (resetted) {
								throw new Error("Bad odometer format without digits");
							}
							this.resetFormat();
							resetted = true;
						}
						chr = this.format.repeating[this.format.repeating.length - 1];
						this.format.repeating = this.format.repeating.substring(0, this.format.repeating.length - 1);
						if (chr === 'd') {
							break;
						}
						this.addSpacer(chr);
					}
				}
				digit = this.renderDigit();
				digit.querySelector('.odometer-value').innerHTML = value;
				this.digits.push(digit);
				return this.insertDigit(digit);
			};

			Odometer.prototype.animate = function(newValue) {
				if (!TRANSITION_SUPPORT || this.options.animation === 'count') {
					return this.animateCount(newValue);
				} else {
					return this.animateSlide(newValue);
				}
			};

			Odometer.prototype.animateCount = function(newValue) {
				var cur, diff, last, start, tick,
					_this = this;
				if (!(diff = +newValue - this.value)) {
					return;
				}
				start = last = now();
				cur = this.value;
				return (tick = function() {
					var delta, dist, fraction;
					if ((now() - start) > _this.options.duration) {
						_this.value = newValue;
						_this.render();
						trigger(_this.el, 'odometerdone');
						return;
					}
					delta = now() - last;
					if (delta > COUNT_MS_PER_FRAME) {
						last = now();
						fraction = delta / _this.options.duration;
						dist = diff * fraction;
						cur += dist;
						_this.render(Math.round(cur));
					}
					if (requestAnimationFrame != null) {
						return requestAnimationFrame(tick);
					} else {
						return setTimeout(tick, COUNT_MS_PER_FRAME);
					}
				})();
			};

			Odometer.prototype.getDigitCount = function() {
				var i, max, value, values, _i, _len;
				values = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
				for (i = _i = 0, _len = values.length; _i < _len; i = ++_i) {
					value = values[i];
					values[i] = Math.abs(value);
				}
				max = Math.max.apply(Math, values);
				return Math.ceil(Math.log(max + 1) / Math.log(10));
			};

			Odometer.prototype.getFractionalDigitCount = function() {
				var i, parser, parts, value, values, _i, _len;
				values = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
				parser = /^\-?\d*\.(\d*?)0*$/;
				for (i = _i = 0, _len = values.length; _i < _len; i = ++_i) {
					value = values[i];
					values[i] = value.toString();
					parts = parser.exec(values[i]);
					if (parts == null) {
						values[i] = 0;
					} else {
						values[i] = parts[1].length;
					}
				}
				return Math.max.apply(Math, values);
			};

			Odometer.prototype.resetDigits = function() {
				this.digits = [];
				this.ribbons = [];
				this.inside.innerHTML = '';
				return this.resetFormat();
			};

			Odometer.prototype.animateSlide = function(newValue) {
				var boosted, cur, diff, digitCount, digits, dist, end, fractionalCount, frame, frames, i, incr, j, mark, numEl, oldValue, start, _base, _i, _j, _k, _l, _len, _len1, _len2, _m, _ref, _results;
				oldValue = this.value;
				fractionalCount = this.getFractionalDigitCount(oldValue, newValue);
				if (fractionalCount) {
					newValue = newValue * Math.pow(10, fractionalCount);
					oldValue = oldValue * Math.pow(10, fractionalCount);
				}
				if (!(diff = newValue - oldValue)) {
					return;
				}
				this.bindTransitionEnd();
				digitCount = this.getDigitCount(oldValue, newValue);
				digits = [];
				boosted = 0;
				for (i = _i = 0; 0 <= digitCount ? _i < digitCount : _i > digitCount; i = 0 <= digitCount ? ++_i : --_i) {
					start = truncate(oldValue / Math.pow(10, digitCount - i - 1));
					end = truncate(newValue / Math.pow(10, digitCount - i - 1));
					dist = end - start;
					if (Math.abs(dist) > this.MAX_VALUES) {
						frames = [];
						incr = dist / (this.MAX_VALUES + this.MAX_VALUES * boosted * DIGIT_SPEEDBOOST);
						cur = start;
						while ((dist > 0 && cur < end) || (dist < 0 && cur > end)) {
							frames.push(Math.round(cur));
							cur += incr;
						}
						if (frames[frames.length - 1] !== end) {
							frames.push(end);
						}
						boosted++;
					} else {
						frames = (function() {
							_results = [];
							for (var _j = start; start <= end ? _j <= end : _j >= end; start <= end ? _j++ : _j--){ _results.push(_j); }
							return _results;
						}).apply(this);
					}
					for (i = _k = 0, _len = frames.length; _k < _len; i = ++_k) {
						frame = frames[i];
						frames[i] = Math.abs(frame % 10);
					}
					digits.push(frames);
				}
				this.resetDigits();
				_ref = digits.reverse();
				for (i = _l = 0, _len1 = _ref.length; _l < _len1; i = ++_l) {
					frames = _ref[i];
					if (!this.digits[i]) {
						this.addDigit(' ', i >= fractionalCount);
					}
					if ((_base = this.ribbons)[i] == null) {
						_base[i] = this.digits[i].querySelector('.odometer-ribbon-inner');
					}
					this.ribbons[i].innerHTML = '';
					if (diff < 0) {
						frames = frames.reverse();
					}
					for (j = _m = 0, _len2 = frames.length; _m < _len2; j = ++_m) {
						frame = frames[j];
						numEl = document.createElement('div');
						numEl.className = 'odometer-value';
						numEl.innerHTML = frame;
						this.ribbons[i].appendChild(numEl);
						if (j === frames.length - 1) {
							addClass(numEl, 'odometer-last-value');
						}
						if (j === 0) {
							addClass(numEl, 'odometer-first-value');
						}
					}
				}
				if (start < 0) {
					this.addDigit('-');
				}
				mark = this.inside.querySelector('.odometer-radix-mark');
				if (mark != null) {
					mark.parent.removeChild(mark);
				}
				if (fractionalCount) {
					return this.addSpacer(this.format.radix, this.digits[fractionalCount - 1], 'odometer-radix-mark');
				}
			};

			return Odometer;

		})();

		Odometer.options = (_ref = window.odometerOptions) != null ? _ref : {};

		setTimeout(function() {
			var k, v, _base, _ref1, _results;
			if (window.odometerOptions) {
				_ref1 = window.odometerOptions;
				_results = [];
				for (k in _ref1) {
					v = _ref1[k];
					_results.push((_base = Odometer.options)[k] != null ? (_base = Odometer.options)[k] : _base[k] = v);
				}
				return _results;
			}
		}, 0);

		Odometer.init = function() {
			var el, elements, _i, _len, _ref1, _results;
			if (document.querySelectorAll == null) {
				return;
			}
			elements = document.querySelectorAll(Odometer.options.selector || '.odometer');
			_results = [];
			for (_i = 0, _len = elements.length; _i < _len; _i++) {
				el = elements[_i];
				_results.push(el.odometer = new Odometer({
					el: el,
					value: (_ref1 = el.innerText) != null ? _ref1 : el.textContent
				}));
			}
			return _results;
		};

		if ((((_ref1 = document.documentElement) != null ? _ref1.doScroll : void 0) != null) && (document.createEventObject != null)) {
			_old = document.onreadystatechange;
			document.onreadystatechange = function() {
				if (document.readyState === 'complete' && Odometer.options.auto !== false) {
					Odometer.init();
				}
				return _old != null ? _old.apply(this, arguments) : void 0;
			};
		} else {
			document.addEventListener('DOMContentLoaded', function() {
				if (Odometer.options.auto !== false) {
					return Odometer.init();
				}
			}, false);
		}

		if (typeof define === 'function' && define.amd) {
			define(['jquery'], function() {
				return Odometer;
			});
		} else if (typeof exports === !'undefined') {
			module.exports = Odometer;
		} else {
			window.Odometer = Odometer;
		}

	}).call(this);




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

		static #instance = null;

		constructor(lineParent) {
			if (RunningLine.#instance) { // проверяем что значение #instance не равно null (т.е. уже что-то присвоено), и прерываем инструкцию, чтобы в соответствии с принципом синглтон сохранить значения присвоенные при первой инициации.
				return RunningLine.#instance;
			}
			RunningLine.#instance = this;
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
			runningLine.start(activeElement);
		};

		start(activeElement){
			let runningLine = this;
			runningLine.setActiveElement(activeElement);
			runningLine.setWidth();
			runningLine.setPosition();
		}
	};


	Array.prototype.forEach.call(document.querySelectorAll(".running-line"), function(line){
		window.newRunningLine = new RunningLine(line);
		window.newRunningLine.init();

		Array.prototype.forEach.call(line.parentNode.querySelectorAll('a'), function(link){
			let allLinks = line.parentNode.querySelectorAll('a');
			link.addEventListener("mouseenter", function (e) {
				for (let i = 0; i < allLinks.length; i++) {
					allLinks[i].classList.remove('active');
				};
				this.classList.add('active');
				window.newRunningLine.start(this);
			})
		})
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



// data-accordeon
document.addEventListener('DOMContentLoaded', function(){
	let ACCORDEON_ACTIVE_CLASS = 'active';

	let allAccordeons = document.querySelectorAll("[data-accordeon]");
	let allAccordeonsButtons = document.querySelectorAll(".accordeon-title");

	let closeAllAccordeons = function(){
		for (i = 0; i < allAccordeons.length; i++) {
			let accordeonInner = allAccordeons[i].querySelector('.accordeon-inner');
			allAccordeons[i].classList.remove(ACCORDEON_ACTIVE_CLASS);
		}
	};

	let openAllAccordeons = function(){
		for (i = 0; i < allAccordeons.length; i++) {
			let accordeonInner = allAccordeons[i].querySelector('.accordeon-inner');
			allAccordeons[i].classList.add(ACCORDEON_ACTIVE_CLASS);
		}
	};

	let accordeonToggle = function() {
		if (this.parentElement.classList.contains(ACCORDEON_ACTIVE_CLASS)) {
			closeAllAccordeons();
		} else {
			closeAllAccordeons();
			this.parentElement.classList.add(ACCORDEON_ACTIVE_CLASS);
		};
	}

	Array.prototype.forEach.call(document.querySelectorAll("[data-accordeon-open]"), function(button){
		button.addEventListener("click", function (e) {
			if (!button.dataset.accordeonOpen) return;
			let accordeonsCover = document.getElementById(button.dataset.accordeonOpen);
			let allAccordeons = accordeonsCover.querySelectorAll("[data-accordeon]");
			if (button.classList.contains(ACCORDEON_ACTIVE_CLASS)) {
				button.classList.remove(ACCORDEON_ACTIVE_CLASS);
				closeAllAccordeons();
			} else {
				button.classList.add(ACCORDEON_ACTIVE_CLASS);
				openAllAccordeons();
			};
		});
	});

	document.body.addEventListener('click', function(e){
		let accordeonButton = e.target.closest(".accordeon-title");
		if (accordeonButton){
			accordeonToggle.call(accordeonButton);
		};
	});



});
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

document.addEventListener('DOMContentLoaded', function(){
	document.addEventListener('click', function(e) {
		const item = e.target.closest('.career-preview');
		if (!item) return;

		const titleEl = item.querySelector('.title');
		if (!titleEl) return;

		const titleText = titleEl.textContent.trim();
		localStorage.setItem('bw-career-title', titleText);
	});
})
document.addEventListener('DOMContentLoaded', function() {
	setTimeout(function() {
		document.body.classList.add('loaded');
	}, 500);
});

// data-menu-toggle
document.addEventListener('DOMContentLoaded', function(){

	const PAGE_HEADER = document.getElementById('mainHeader');

	class MenuToggle {
		activeButtonClassName = 'active';
		activeMenuClassName = 'active';
		animatedMenuClassName = 'animated';
		toggleButton = null;
		menuEl = null;

		constructor(toggleButton){
			this.toggleButton = toggleButton;
		}

		init(){
			this.toggleButton.addEventListener('click', this.menuToggle.bind(this), false);
			let menuId = this.toggleButton.dataset.menuToggle;
			this.menuEl = document.getElementById(menuId);

			document.addEventListener("click", function (e) {
				if (!e.target.closest('[data-menu-toggle]') && !e.target.closest('#'+menuId)) {
					this.closeMenu();
				};
			}.bind(this));

			document.addEventListener("click", function (e) {
				if (e.target.closest('[data-scrollto]')) {
					this.closeMenu();
				};
			}.bind(this));

		}

		closeMenu = function(){
			this.toggleButton.classList.remove(this.activeButtonClassName);
			this.menuEl.classList.remove(this.animatedMenuClassName);
			setTimeout(()=>{
				this.menuEl.classList.remove(this.activeMenuClassName);
			},50);
		};

		openMenu = function(){
			this.toggleButton.classList.add(this.activeButtonClassName);
			this.menuEl.classList.add(this.activeMenuClassName);
			setTimeout(()=>{
				this.menuEl.classList.add(this.animatedMenuClassName);
			},50);
		}

		menuToggle = function() {
			if (this.toggleButton.classList.contains(this.activeButtonClassName)) {
				this.closeMenu();
			} else {
				this.openMenu();
			};
		}
	};

	Array.prototype.forEach.call(document.querySelectorAll("[data-menu-toggle]"), function(toggleButton){
		const menuToggle = new MenuToggle(toggleButton);
		menuToggle.init();
	});
});


document.addEventListener('DOMContentLoaded', function(){

	class PageModeToggle {
		darkModeName = 'dark';
		lightModeName = 'light';
		loadedName = 'loaded';
		animationTime = 550;

		modeButton = null;
		allModeButtons = document.querySelectorAll("[data-mode-toggle]");
		animationBlock = document.querySelector(".fake-mode");

		activeMode = null;

		constructor(modeButton){
			this.modeButton = modeButton;
			let storageSavedMode = this.getSavedMode();
			if (this.getSavedMode() && storageSavedMode != this.modeButton.dataset.modeToggle) {
				this.activeMode = this.getSavedMode();
			} else {
				this.activeMode = this.modeButton.dataset.modeToggle;
				this.saveMode(this.activeMode);
			};

		}

		init(){
			this.modeButton.addEventListener('click', this.toggleMode.bind(this), false);
			this.setBodyModeClass(this.activeMode);
			this.setButtonsMode(this.activeMode);
		};

		toggleMode(){
			switch (this.activeMode) {
				case this.darkModeName:
					this.activeMode = this.lightModeName;
					break;
				case this.lightModeName:
					this.activeMode = this.darkModeName;
					break;
			};

			this.setButtonsMode(this.activeMode);
			this.saveMode(this.activeMode);
			this.setAnimation();
			setTimeout(()=> {
				this.setBodyModeClass(this.activeMode);
			}, this.animationTime)
		};


		setButtonsMode(mode) {
			switch (mode) {
				case this.darkModeName:
					this.modeButton.classList.add(this.darkModeName);
					this.modeButton.classList.remove(this.lightModeName);
					break;
				case this.lightModeName:
					this.modeButton.classList.add(this.lightModeName);
					this.modeButton.classList.remove(this.darkModeName);
					break;
			};
			this.setButtonMode(mode);
		};

		setAnimation() {
			let leftPosition = this.modeButton.offsetLeft;
			let topPosition = this.modeButton.offsetTop;

			let banner = document.querySelector(".banner");

			this.animationBlock.style.top = topPosition + 'px';
			this.animationBlock.style.left = leftPosition + 'px';
			this.animationBlock.classList.add('animated');
			if (banner) {
				banner.classList.add('animated-mode');
			};
			setTimeout(()=>{
				this.animationBlock.classList.remove('animated');
				if (banner) {
					banner.classList.remove('animated-mode');
				};
			}, this.animationTime)
		}

		setButtonMode(mode){
			for (let i = 0; i <= this.allModeButtons.length-1; i++) {
				this.allModeButtons[i].dataset.modeToggle = mode;
			};
		};

		setBodyModeClass(mode){
			document.body.classList = "";
			document.body.classList.add(mode);
			document.body.classList.add(this.loadedName);
		};

		getSavedMode(){
			return localStorage.getItem('bw-site-mode');
		};

		saveMode(mode){
			localStorage.setItem('bw-site-mode', mode);
		};

	};

	Array.prototype.forEach.call(document.querySelectorAll("[data-mode-toggle]"), function(modeButton){
		const pageModeToggle = new PageModeToggle(modeButton);
		pageModeToggle.init();
	});
});
// smoth scroll
document.addEventListener('DOMContentLoaded', function(){
	Array.prototype.forEach.call(document.querySelectorAll("[data-scrollto]"), function(button){
		button.addEventListener("click", function (e) {
			e.preventDefault();
			let scrollTarget = button.dataset.scrollto;
			if (!scrollTarget || !document.querySelector(scrollTarget)) return;
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

		maxWindowWidth = 993;

		constructor(tabHoverEl){
			this.tabHoverEl = tabHoverEl;
		}

		init(){
			this.tabIndex = parseInt(this.tabHoverEl.dataset.tabHover);
			this.hoveredContainer = document.querySelector(`[data-tab-index="${this.tabIndex}"]`);
			if (!this.hoveredContainer) return;

			this.tabHoverEl.addEventListener('mouseenter', function(e){
				e.stopPropagation();
				e.stopImmediatePropagation();
				this.closeAllContainers();
				this.showContainer(this.hoveredContainer);
			}.bind(this));

			this.hoveredContainer.addEventListener('mouseleave', function(e){
				e.stopPropagation();
				e.stopImmediatePropagation();
				this.hideContainer(this.hoveredContainer);
				if (!document.querySelector('.current_page_item') && window.newRunningLine) {
					window.newRunningLine.destroy();
				} else {
					if (window.newRunningLine) {
						window.newRunningLine.start(document.querySelector('.current_page_item').querySelector('a'));
					}
				}
			}.bind(this));

			this.hoveredContainer.addEventListener('mouseenter', function(e){
				if (window.newRunningLine) {
					window.newRunningLine.start(window.newRunningLine.activeElement);
				}
			}.bind(this));

			document.addEventListener('mousemove', function(e){
				if (!e.target.closest('.line') && !e.target.closest('[data-tab-hover]') && !e.target.closest('[data-tab-index]')) {
					this.closeAllContainers();
				}
			}.bind(this));
		};

		setActiveLinkClass = function(prevLink, currentLink) {
			// prevLink.classList.remove(this.activeLinkClassName);
			// currentLink.classList.add(this.activeLinkClassName);
		};

		closeAllContainers = function(){
			let allContainers = Array.prototype.slice.call(document.querySelectorAll("[data-tab-index]"));
			allContainers.forEach(function(item){
				this.hideContainer(item);
			}.bind(this));
		};

		showContainer = function(container){
			container.classList.add(this.activeClassName);
			setTimeout(()=> {
				container.classList.add(this.animatedClassName);
			}, 100);
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

document.addEventListener('DOMContentLoaded', function(){

	class TooltipHint {

		element = null;
		newTooltip = null;

		coordinanes = {
			x: 0,
			y: 0,
		};

		constructor(tooltipEl) {
			this.element = tooltipEl;

			this.element.addEventListener("mouseenter", function (e) {
				this.show(this.element, e);
			}.bind(this));
			this.element.addEventListener("mouseleave", function () {
				this.hide();
			}.bind(this));
		};

		setCoordinates(pageX, pageY, element) {
			this.coordinanes.x = pageX;
			this.coordinanes.y = pageY;
			// + element height/width
		};

		setText(text) {
			this.text = text;
		};

		getCoordinates() {
			return {x: this.coordinanes.x, y: this.coordinanes.y}
		};

		getText() {
			return this.text;
		};

		getElementSize() {
			return this.element.getBoundingClientRect();
		};

		setTooltipPosition() {
			// console.log(this.getElementSize())
			
			// this.getCoordinates().y + "px";
			// this.getCoordinates().x + "px";
		};

		createTooltipElement() {
			this.newTooltip = document.createElement('div');
			this.newTooltip.className = "tooltip";
			this.newTooltip.setAttribute("id", "tooltip");
			this.newTooltip.appendChild(document.createTextNode(this.getText()));
			// postion
			this.newTooltip.style.top = this.getCoordinates().y + "px";
			this.newTooltip.style.left = this.getCoordinates().x + "px";
					document.body.appendChild(this.newTooltip);
		};

		show(element, event) {
			if (!element || !event) return;
			let text = element.dataset.tooltip.trim();
			this.element = element;
			this.setText(text);
			this.setCoordinates(event.pageX,event.pageY, element);
			this.createTooltipElement();

			setTimeout(function(){
				this.newTooltip.classList.add("active");
			}.bind(this), 250)
		};

		hide(){
			this.setText('');
			this.setCoordinates(0, 0);
			let tooltip = document.getElementById('tooltip');
			if (tooltip) {
				tooltip.remove();
			}
		};
	};

	Array.prototype.forEach.call(document.querySelectorAll("[data-tooltip]"), function(tooltip){
		const tooltipHint = new TooltipHint(tooltip);

	});


});
// Discord Widget plugin (updated)
// v3.1 — with init guard
// - Читає атрибути з data-*
// - Показує activity (legacy user.game або user.activities[0].name)
// - Join disabled, якщо немає instant_invite
// - Захист від повторної ініціалізації через data-initialized

'use strict';

function LDColor(color, percent) {
	let num = parseInt(color, 16);
	let amt = Math.round(2.55 * percent);
	let R = (num >> 16) + amt;
	let G = ((num >> 8) & 0x00ff) + amt;
	let B = (num & 0x0000ff) + amt;
	return (
		0x1000000 +
		(R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
		(G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
		(B < 255 ? (B < 1 ? 0 : B) : 255)
	).toString(16).slice(1);
}

window.addEventListener('load', () => {
	for (const widget of document.getElementsByTagName('discord-widget')) {
		// ---- guard: already initialized? ----
		if (widget.dataset.initialized === '1') continue;
		widget.dataset.initialized = '1';

		// --- read attributes strictly from data-* ---
		const id               = widget.dataset.id;             // ОБОВ'ЯЗКОВО
		const width            = widget.dataset.width  || '350px';
		const height           = widget.dataset.height || '400px';
		const footerText       = widget.dataset.footertext || '';
		const color            = widget.dataset.color  || '#2c2f34';
		const backgroundColor  = widget.dataset.backgroundcolor || '#23272a';
		const textColor        = widget.dataset.textcolor || '#fff';
		const statusColor      = widget.dataset.statuscolor || '#858585';

		// Якщо немає ID — показуємо одне повідомлення і все
		if (!id) {
			const body = document.createElement('widget-body');
			body.textContent = 'No Discord server ID was specified.';
			widget.append(body);
			continue;
		}

		// header
		const head  = document.createElement('widget-header');
		const logo  = document.createElement('widget-logo');
		const count = document.createElement('widget-header-count');
		head.append(logo, count);

		// body
		const body = document.createElement('widget-body');

		// footer
		const footer     = document.createElement('widget-footer');
		const footerInfo = document.createElement('widget-footer-info');
		const joinButton = document.createElement('widget-button-join');
		footerInfo.innerText = footerText || '';
		joinButton.innerText = 'Join';
		joinButton.addEventListener('click', (e) => {
			if (joinButton.classList.contains('is-disabled')) {
				e.preventDefault();
				return;
			}
			const href = joinButton.getAttribute('href');
			if (href) window.open(href, '_blank', '');
		});
		footer.append(footerInfo, joinButton);

		// styles
		widget.style.height = height;
		widget.style.width = width;
		widget.style.setProperty('--color', color);
		widget.style.setProperty('--bgColor', backgroundColor);
		widget.style.setProperty('--textColor', textColor);
		widget.style.setProperty('--buttonColor', `#${LDColor(color.replace('#', ''), -10)}`);
		widget.style.setProperty('--statusColor', statusColor);

		// mount
		widget.append(head, body, footer);

		// data
		fetch(`https://discord.com/api/guilds/${id}/widget.json`)
			.then((resp) => {
				if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
				return resp.json();
			})
			.then((data) => {
				// member count
				count.innerHTML = `<strong>${data.presence_count || 0}</strong> Members Online`;

				// join button
				if (data.instant_invite) {
					joinButton.setAttribute('href', data.instant_invite);
				} else {
					joinButton.classList.add('is-disabled');
					joinButton.title = 'Invite is not configured for this server';
				}

				// members
				body.innerHTML = '';
				(Array.isArray(data.members) ? data.members : []).forEach((user) => {
					const member = document.createElement('widget-member');

					const avatar = document.createElement('widget-member-avatar');
					const avatarIMG = document.createElement('img');
					avatarIMG.src = user.avatar_url || '';
					const status = document.createElement(`widget-member-status-${user.status || 'offline'}`);
					status.classList.add('widget-member-status');
					avatar.append(avatarIMG, status);

					const name = document.createElement('widget-member-name');
					name.innerText = user.username || '';

					// activity/status text
					let activityName = '';
					if (user && user.game && user.game.name) {
						activityName = user.game.name;
					} else if (Array.isArray(user.activities) && user.activities.length) {
						activityName = user.activities[0]?.name || '';
					}

					member.append(avatar, name);

					if (activityName) {
						const statusText = document.createElement('widget-member-status-text');
						statusText.innerText = activityName;
						member.append(statusText);
					}

					body.append(member);
				});
			})
			.catch((err) => {
				console.error('Discord widget error:', err);
				count.innerHTML = `<strong>0</strong> Members Online`;
				const note = document.createElement('widget-error');
				note.textContent = 'Discord widget is unavailable.';
				body.append(note);
				joinButton.classList.add('is-disabled');
			});
	}
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
window.addEventListener("DOMContentLoaded", function() {

	class FileLoader {
		constructor(loaderCover) {
			this.loaderCover = loaderCover;
			this.acceptedFileTypes = [];
			this.templateDirectory = '';
			this.inputLabel = null;
			this.inputFile = null;
			this.uploadBox = null;

			this.classes = {
				error: 'error',
				success: 'success'
			};

			if (window.themeData && themeData.templateUrl) {
				this.templateDirectory = String(themeData.templateUrl).replace(/\/$/, '');
			}

			if (!this.templateDirectory && loaderCover && loaderCover.dataset && loaderCover.dataset.templateDirectory) {
				this.templateDirectory = loaderCover.dataset.templateDirectory.replace(/\/$/, '');
			}

			if (!this.templateDirectory && window.FileLoaderData && window.FileLoaderData.templateDirectory) {
				this.templateDirectory = window.FileLoaderData.templateDirectory.replace(/\/$/, '');
			}
			if (!this.templateDirectory && window.templateDirectory) {
				this.templateDirectory = window.templateDirectory.replace(/\/$/, '');
			}

			if (!this.templateDirectory) {
				const themeScript = document.querySelector('script[src*="/wp-content/themes/"]');
				if (themeScript && themeScript.src) {
					const parts = themeScript.src.split('/wp-content/themes/');
					if (parts.length > 1) {
						const themePart = parts[1].split('/')[0];
						this.templateDirectory = location.origin + '/wp-content/themes/' + themePart;
					}
				}
			}

			if (!this.templateDirectory) this.templateDirectory = '';

			this.loadedSrc = {
				pdf: this.templateDirectory ? encodeURI(this.templateDirectory + '/img/file-load.svg') : '/wp-content/themes/bw_theme/img/file-load.svg',
				error: this.templateDirectory ? encodeURI(this.templateDirectory + '/img/picture-broken.svg') : '/wp-content/themes/bw_theme/img/picture-broken.svg'
			};

			console.log('FileLoader: templateDirectory ->', this.templateDirectory);
			console.log('FileLoader: loadedSrc.pdf ->', this.loadedSrc.pdf);

			if (loaderCover && loaderCover.dataset && loaderCover.dataset.loader) {
				this.acceptedFileTypes = loaderCover.dataset.loader.split(",").map(s => s.trim().toLowerCase());
				this.inputLabel = loaderCover.querySelector('[data-label]');
				this.inputFile = loaderCover.querySelector('[data-file]');
				this.uploadBox = loaderCover.querySelector('[data-upload]');
			}

			if (this.inputFile) {
				this.inputFile.addEventListener("change", this.handleFiles.bind(this), false);
			}
		}

		hasClass(element, className) {
			return (' ' + element.className + ' ').indexOf(' ' + className + ' ') > -1;
		}

		handleFiles() {
			if (!this.inputFile) return;
			const files = this.inputFile.files;

			if (!this.inputFile.getAttribute('multiple')) {
				this.removeOldFiles();
			}

			for (let i = 0; i < files.length; i++) {
				this.getBase64(files[i]);
			}
		}

		removeOldFiles() {
			if (!this.uploadBox) return;
			while (this.uploadBox.firstChild) {
				this.uploadBox.firstChild.remove();
			}
		}

		removeFile() {
			const fileToRemove = this.file;
			const _this = this._this;

			if (!fileToRemove || !_this) return;

			const removedFileName = fileToRemove.querySelector('.file-name') ? fileToRemove.querySelector('.file-name').textContent : '';
			fileToRemove.remove();
			if (window.tooltipHint && typeof window.tooltipHint.hide === 'function') {
				window.tooltipHint.hide();
			}

			let filesArr = Array.prototype.slice.call(_this.inputFile.files || []);
			for (let i = filesArr.length - 1; i >= 0; i--) {
				if (filesArr[i].name === removedFileName) {
					filesArr.splice(i, 1);
				}
			}
			const newFileList = new DataTransfer();
			filesArr.forEach(file => newFileList.items.add(file));
			_this.inputFile.files = newFileList.files;

			_this.removeError();
		}

		getBase64(file) {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			const fileType = file.name.split('.').pop().toLowerCase();

			reader.onload = () => {
				if (this.acceptedFileTypes.indexOf(fileType) >= 0) {
					this.appendFile(file.name, fileType, reader.result);
				} else {
					this.appendError(file.name, fileType);
				}
			};

			reader.onerror = (error) => {
				if (this.loaderCover) this.loaderCover.classList.add(this.classes.error);
				console.error('FileReader error: ', error);
				this.appendError(file.name, fileType);
			};
		}

		appendFile(name, type, src) {
			if (!name || !type) return;
			const showPreview = type === 'jpg' || type === 'jpeg' || type === 'png' || type === 'mp4';
			this.removeError();
			this.appendFileToBox(name, type, src, showPreview);
		}

		appendError(name, type) {
			if (!name || !type) return;
			if (this.loaderCover) this.loaderCover.classList.add(this.classes.error);
			this.appendFileToBox(name, type, null, false, true);
			console.error('Error: ', type + ' type is not correct or could not be read');
		}

		removeError() {
			if (!this.uploadBox) return;
			const hasErr = this.uploadBox.querySelectorAll('.' + this.classes.error).length > 0;
			if (!hasErr && this.loaderCover && this.loaderCover.classList.contains(this.classes.error)) {
				this.loaderCover.classList.remove(this.classes.error);
			}
		}

		appendFileToBox(name, type, src, showPreview, forceError = false) {
			const coverEl = document.createElement("div");
			coverEl.classList.add('files-cover');
			coverEl.setAttribute('data-tooltip', 'Click to delete');

			const innerCover = document.createElement("div");
			innerCover.classList.add('inner');

			if (!forceError && this.acceptedFileTypes.indexOf(type) >= 0) {
				switch (type) {
					case "png":
					case "jpg":
					case "jpeg": {
						const imgEl = document.createElement('img');
						imgEl.src = src || this.loadedSrc.error;
						innerCover.appendChild(imgEl);
						break;
					}
					case "mp4": {
						const videoEl = document.createElement('video');
						videoEl.src = src || '';
						videoEl.controls = true;
						innerCover.appendChild(videoEl);
						break;
					}
					case "pdf": {
						const pdfEl = document.createElement('img');
						pdfEl.src = this.loadedSrc.pdf;
						innerCover.appendChild(pdfEl);
						break;
					}
					default: {
						const errorEl = document.createElement('img');
						errorEl.src = this.loadedSrc.error;
						innerCover.appendChild(errorEl);
						coverEl.classList.add(this.classes.error);
					}
				}
			} else {
				const errorEl = document.createElement('img');
				errorEl.src = this.loadedSrc.error;
				innerCover.appendChild(errorEl);
				coverEl.classList.add(this.classes.error);
			}

			coverEl.appendChild(innerCover);

			const nameEl = document.createElement("div");
			nameEl.classList.add('file-name');
			nameEl.appendChild(document.createTextNode(name));
			coverEl.appendChild(nameEl);

			coverEl.addEventListener("click", this.removeFile.bind({ file: coverEl, _this: this }), false);

			if (this.uploadBox) {
				this.uploadBox.appendChild(coverEl);
			}
		}
	}

	const fileLoaderCovers = document.querySelectorAll('[data-loader]');
	for (let i = 0; i < fileLoaderCovers.length; i++) {
		new FileLoader(fileLoaderCovers[i]);
	}
});

// validation
window.addEventListener("DOMContentLoaded", function() {

	class ValidationForm {

		classes = {
			success: 'success',
			error: 'error',
			focused: 'focused',
			ignored: 'ignored',
			disabled: 'disabled'
		}

		form = null;
		formInputs = null;
		formTextareas = null;
		formSelects = null;
		formCheckboxes = null;
		formFileInputs = null;

		constructor(form) {
			this.form = form;
			this.formInputs = form.querySelectorAll(`.input:not(.${this.classes.ignored})`);
			this.formTextareas = form.querySelectorAll(`.textarea:not(.${this.classes.ignored})`);
			this.formSelects = form.querySelectorAll(`.select:not(.${this.classes.ignored})`);
			this.formCheckboxes = form.querySelectorAll(`.checkbox:not(.${this.classes.ignored})`);
			this.formFileInputs = form.querySelectorAll(`.file:not(.${this.classes.ignored})`);

			this.form.addEventListener('submit', (event) => {
				this.onFormSubmit(event);
			});

			this.form.addEventListener('reset', (event) => {
				this.onFormReset(event);
			});
		};

		onFormSubmit(event){
			let formInputs = this.formInputs;
			let formTextareas = this.formTextareas;
			let formSelects = this.formSelects;
			let formFileInputs = this.formFileInputs;
			let formCheckboxes  = this.formCheckboxes;

			if (formInputs && formInputs.length) {
				for (let i = 0; i < formInputs.length; i++) {
					let input = formInputs[i];
					this.validateByTextLength(input);
				}
			}

			if (formTextareas && formTextareas.length) {
				for (let t = 0; t < formTextareas.length; t++) {
					let textArea = formTextareas[t];
					this.validateByTextLength(textArea);
				}
			}

			if (formSelects && formSelects.length) {
				for (let s = 0; s < formSelects.length; s++) {
					let formSelect = formSelects[s];
					this.validateBySelectOptions(formSelect);
				}
			}

			if (formFileInputs && formFileInputs.length) {
				for (let s = 0; s < formFileInputs.length; s++) {
					let formFileInput = formFileInputs[s];
					this.validateByFileUpload(formFileInput);
				}
			}

			if (formCheckboxes && formCheckboxes.length) {
				for (let s = 0; s < formCheckboxes.length; s++) {
					let formCheckbox = formCheckboxes[s];
					this.validateCheckbox(formCheckbox);
				}
			}

			// --- ПЕРЕВІРКА НА ПОМИЛКИ ---
			const hasErrors = this.form.querySelector(`.${this.classes.error}`);
			const isDisabled = this.form.classList.contains(this.classes.disabled);
			
			if (!hasErrors && !isDisabled) {
				console.log('no errors')
				this.submitFormData(); // Викликаємо новий метод для відправки
			} else {
				const firstError = this.form.querySelector(`.${this.classes.error}`);
				if (firstError) {
					firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
				}
				console.log(firstError)
			}
			// --- КІНЕЦЬ ПЕРЕВІРКИ ---

			// callback
			if (window.onContactFormSubmit) {
				window.onContactFormSubmit(this);
			}
		};

		onFormReset(event){
			let allFormGroup = this.form.querySelectorAll('.form-group');
			let allFormUploads = this.form.querySelectorAll('.files-cover');
			let allChartCounters = this.form.querySelectorAll('.chart-counter');
			for (let i = 0; i < allFormGroup.length; i++) {
				allFormGroup[i].classList.remove(this.classes.success, this.classes.error, this.classes.focused)
			}
			if (allFormUploads && allFormUploads.length) {
				for (let i = 0; i < allFormUploads.length; i++) {
					allFormUploads[i].remove();
				}
			}
			if (allChartCounters && allChartCounters.length) {
				for (let i = 0; i < allChartCounters.length; i++) {
					allChartCounters[i].innerHTML = '0';
				}
			};
			this.form.classList.remove(this.classes.disabled);
		};

		setFocusedClass(inputParent, hasValue){
			if (hasValue) {
				inputParent.classList.add(this.classes.focused);
			} else {
				inputParent.classList.remove(this.classes.focused);
			}
		};

		submitFormData() {
			const formData = new FormData(this.form);
			const recipientEmail = this.form.dataset.mail;

			console.log(formData)

			if (!recipientEmail) {
				console.error('Recipient email not specified in data-mail attribute.');
				return;
			}

			formData.append('action', 'submit_form_data'); 
			formData.append('recipient_email', recipientEmail); 

			formData.append('_ajax_nonce', ajax_object.nonce);

			this.form.classList.add('loading'); 

			// *** ЗМІНЕНО: Використовуємо глобальну змінну, створену через wp_localize_script ***
			fetch(ajax_object.ajax_url, { 
				method: 'POST',
				body: formData,
			})
			.then(response => response.json())
			.then(data => {
				this.form.classList.remove('loading');
				const feedbackEl = this.form.parentElement.querySelector('.form-feedback');
				console.log(data)
				if (data.success) {
					this.form.reset();
					if (feedbackEl) {
						feedbackEl.innerHTML = 'Дякуємо! Ваше повідомлення надіслано.';
					}
				} else {
					if (feedbackEl) {
						feedbackEl.innerHTML = `Помилка: ${data.data || 'Не вдалося надіслати повідомлення.'}`;
					}
				}
			})
			.catch(error => {
				this.form.classList.remove('loading');
				console.error('Error:', error);
				const feedbackEl = this.form.parentElement.querySelector('.form-feedback');
				if (feedbackEl) {
						 feedbackEl.innerHTML = `Виникла помилка з'єднання. Спробуйте пізніше.`;
				}
			});
		}

		// FIX: нормальний обробник введення для input/textarea/select
		onFieldInput(e){
			const el = e.target;
			const type =
				el.classList.contains('phone') ? 'phone' :
				el.classList.contains('email') ? 'email' : '';

			this.setFocusedClass(el.parentElement, el.value.length);

			switch (type) {
				case 'phone':
					this.setPhoneMask(e, el);
					break;
				case 'email':
					this.validateEmail(e, el);
					break;
				default:
					this.setChartsCount(el.value.length, el); // лічильник символів
					this.validateByTextLength(el);
			}
		};

		onCheckboxChange(){
			this._this.validateCheckbox(this.checkbox);
		};

		isValidEmail(email){
			let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return re.test(email);
		};

		setValidationClass(element, validationSuccess){
			if (validationSuccess) {
				element.classList.add(this.classes.success);
				element.classList.remove(this.classes.error);
				this.form.classList.remove(this.classes.disabled);
			} else {
				element.classList.add(this.classes.error);
				element.classList.remove(this.classes.success);
				this.form.classList.add(this.classes.disabled);
			}
		};

		setChartsCount(valLength, element){
			if (!element) return;
			const group = element.closest('.form-group');
			if (!group) return;
			const counterEl = group.querySelector('.chart-counter');
			if (!counterEl) return;
			counterEl.textContent = valLength;
		};

		setPhoneMask(event, input){
			let keyCode = event.keyCode || 0;
			let pos = input.selectionStart || 0;
			if (pos < 3 && event.type === 'keydown') event.preventDefault();
			let matrix = input.getAttribute('placeholder') ? input.getAttribute('placeholder') : '+380 (___) ___ __ _',
					i = 0,
					def = matrix.replace(/\D/g, ""),
					val = input.value.replace(/\D/g, ""),
					new_value = matrix.replace(/[_\d]/g, function(a) {
							return i < val.length ? val.charAt(i++) || def.charAt(i) : a
					});
			i = new_value.indexOf("_");
			if (i != -1) {
				i < 5 && (i = 3);
				new_value = new_value.slice(0, i);
			}
			let reg = matrix.substr(0, input.value.length).replace(/_+/g,
					function(a) {
							return "\\d{1," + a.length + "}"
					}).replace(/[+()]/g, "\\$&");
			reg = new RegExp("^" + reg + "$");
			if (!reg.test(input.value) || input.value.trim().length < 5 || (keyCode > 47 && keyCode < 58)) {
				input.value = new_value;
			}
			if (event.type == "blur" && input.value.trim().length < 5) {
				input.value = "";
			}
			this.setValidationClass(input.parentElement, input.value.length == matrix.length);
		};

		validateEmail(event, input){
			this.setValidationClass(input.parentElement, this.isValidEmail(input.value.trim()));
		};

		validateByTextLength(field){
			let minlength = parseInt(field.dataset.minlength) || 2;
			this.setValidationClass(field.parentElement, field.value.length >= minlength);
		};

		validateBySelectOptions(select){
			let defaultOption = select.querySelector('[disabled]');
			this.setValidationClass(select.parentElement, select.value !== (defaultOption ? defaultOption.innerHTML : ''));
		};

		validateByFileUpload(fileInput){
			let inputHasFiles = fileInput.files.length;
			this.setValidationClass(fileInput.parentElement, inputHasFiles);
		};

		validateCheckbox(checkbox) {
			let isChecked = checkbox.checked;
			this.setValidationClass(checkbox.parentElement, isChecked);
		};

		onSelectChange(){
			let select = document.activeElement;
			this.validateBySelectOptions(select);
		};

		init() {
			let formInputs = this.form.querySelectorAll('.input');
			let formTextareas = this.form.querySelectorAll('.textarea');
			let formSelects = this.form.querySelectorAll('.select');
			let formFileInputs = this.form.querySelectorAll('.file');
			let formCheckboxes = this.form.querySelectorAll('.checkbox');

			// INPUTS
			if (formInputs && formInputs.length) {
				for (let i = 0; i < formInputs.length; i++) {
					let input = formInputs[i];
					this.setFocusedClass(input.parentElement, input.value.length);
					this.setChartsCount(input.value.length, input); // FIX: початкове значення
					input.addEventListener('input', this.onFieldInput.bind(this), {passive: true}); // FIX
					input.addEventListener('blur', this.onFieldInput.bind(this), {passive: true});
				}
			}

			// TEXTAREAS
			if (formTextareas && formTextareas.length) {
				for (let t = 0; t < formTextareas.length; t++) {
					let textArea = formTextareas[t];
					this.setFocusedClass(textArea.parentElement, textArea.value.length);
					this.setChartsCount(textArea.value.length, textArea); // FIX: початкове значення для textarea
					textArea.addEventListener('input', this.onFieldInput.bind(this), {passive: true}); // FIX
					textArea.addEventListener('blur', this.onFieldInput.bind(this), {passive: true});
				}
			}

			// SELECTS
			if (formSelects && formSelects.length) {
				for (let s = 0; s < formSelects.length; s++) {
					let formSelect = formSelects[s];
					this.setFocusedClass(formSelect.parentElement, formSelect.value.length);
					formSelect.addEventListener('change', this.onFieldInput.bind(this), {passive: true}); // FIX
				}
			}

			// CHECKBOXES
			if (formCheckboxes && formCheckboxes.length) {
				for (let s = 0; s < formCheckboxes.length; s++) {
					let formCheckbox = formCheckboxes[s];
					this.setFocusedClass(formCheckbox.parentElement, formCheckbox.checked);
					formCheckbox.addEventListener('change', this.onCheckboxChange.bind({_this: this, checkbox: formCheckbox}), {passive: true});
				}
			}
		};
	};

	let allValidateForms = document.querySelectorAll('.validate-form');

	for (let i = 0; i < allValidateForms.length; i++) {
		const newForm = new ValidationForm(allValidateForms[i]);
		newForm.init();
	}

	let allSearchReset = document.querySelectorAll('.search-reset');
	if (allSearchReset && allSearchReset.length) {
		for (let i = 0; i < allSearchReset.length; i++) {
			let resetButton = allSearchReset[i];
			resetButton.addEventListener('click', (e) => {
				let input = e.target.closest('.form-group').querySelector('input');
				if (input) input.focus();
			});
		}
	}
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
		mainPage.style.paddingTop = headerHeight - 1 + 'px'
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
	// window.addEventListener("resize", (event) => {
	// 	setMainPageOffset(PAGE_MAIN);
	// }, {passive: true});

	// on load
	// setMainPageOffset(PAGE_MAIN);
	setDetectHeaderScroll(MAIN_HEADER);
});
!(function (e, t) {
		if ("object" == typeof exports && "object" == typeof module) module.exports = t();
		else if ("function" == typeof define && define.amd) define([], t);
		else {
				var n = t();
				for (var o in n) ("object" == typeof exports ? exports : e)[o] = n[o];
		}
})(window, function () {
		return (function (e) {
				var t = {};
				function n(o) {
						if (t[o]) return t[o].exports;
						var i = (t[o] = { i: o, l: !1, exports: {} });
						return e[o].call(i.exports, i, i.exports, n), (i.l = !0), i.exports;
				}
				return (
						(n.m = e),
						(n.c = t),
						(n.d = function (e, t, o) {
								n.o(e, t) || Object.defineProperty(e, t, { enumerable: !0, get: o });
						}),
						(n.r = function (e) {
								"undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(e, "__esModule", { value: !0 });
						}),
						(n.t = function (e, t) {
								if ((1 & t && (e = n(e)), 8 & t)) return e;
								if (4 & t && "object" == typeof e && e && e.__esModule) return e;
								var o = Object.create(null);
								if ((n.r(o), Object.defineProperty(o, "default", { enumerable: !0, value: e }), 2 & t && "string" != typeof e))
										for (var i in e)
												n.d(
														o,
														i,
														function (t) {
																return e[t];
														}.bind(null, i)
												);
								return o;
						}),
						(n.n = function (e) {
								var t =
										e && e.__esModule
												? function () {
															return e.default;
													}
												: function () {
															return e;
													};
								return n.d(t, "a", t), t;
						}),
						(n.o = function (e, t) {
								return Object.prototype.hasOwnProperty.call(e, t);
						}),
						(n.p = ""),
						n((n.s = 0))
				);
		})([
				function (e, t, n) {
						"use strict";
						n.r(t);
						var o,
								i = "fslightbox-",
								r = "".concat(i, "styles"),
								s = "".concat(i, "cursor-grabbing"),
								a = "".concat(i, "full-dimension"),
								c = "".concat(i, "flex-centered"),
								l = "".concat(i, "open"),
								u = "".concat(i, "transform-transition"),
								d = "".concat(i, "absoluted"),
								p = "".concat(i, "slide-btn"),
								f = "".concat(p, "-container"),
								h = "".concat(i, "fade-in"),
								m = "".concat(i, "fade-out"),
								g = h + "-strong",
								v = m + "-strong",
								b = "".concat(i, "opacity-"),
								x = "".concat(b, "1"),
								y = "".concat(i, "source");
						function w(e) {
								return (w =
										"function" == typeof Symbol && "symbol" == typeof Symbol.iterator
												? function (e) {
															return typeof e;
													}
												: function (e) {
															return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
													})(e);
						}
						function S(e) {
								var t = e.stageIndexes,
										n = e.core.stageManager,
										o = e.props.sources.length - 1;
								(n.getPreviousSlideIndex = function () {
										return 0 === t.current ? o : t.current - 1;
								}),
										(n.getNextSlideIndex = function () {
												return t.current === o ? 0 : t.current + 1;
										}),
										(n.updateStageIndexes =
												0 === o
														? function () {}
														: 1 === o
														? function () {
																	0 === t.current ? ((t.next = 1), delete t.previous) : ((t.previous = 0), delete t.next);
															}
														: function () {
																	(t.previous = n.getPreviousSlideIndex()), (t.next = n.getNextSlideIndex());
															}),
										(n.i =
												o <= 2
														? function () {
																	return !0;
															}
														: function (e) {
																	var n = t.current;
																	if ((0 === n && e === o) || (n === o && 0 === e)) return !0;
																	var i = n - e;
																	return -1 === i || 0 === i || 1 === i;
															});
						}
						"object" === ("undefined" == typeof document ? "undefined" : w(document)) &&
								(((o = document.createElement("style")).className = r),
								o.appendChild(
										document.createTextNode(
												".fslightbox-absoluted{position:absolute;top:0;left:0}.fslightbox-fade-in{animation:fslightbox-fade-in .3s cubic-bezier(0,0,.7,1)}.fslightbox-fade-out{animation:fslightbox-fade-out .3s ease}.fslightbox-fade-in-strong{animation:fslightbox-fade-in-strong .3s cubic-bezier(0,0,.7,1)}.fslightbox-fade-out-strong{animation:fslightbox-fade-out-strong .3s ease}@keyframes fslightbox-fade-in{from{opacity:.65}to{opacity:1}}@keyframes fslightbox-fade-out{from{opacity:.35}to{opacity:0}}@keyframes fslightbox-fade-in-strong{from{opacity:.3}to{opacity:1}}@keyframes fslightbox-fade-out-strong{from{opacity:1}to{opacity:0}}.fslightbox-cursor-grabbing{cursor:grabbing}.fslightbox-full-dimension{width:100%;height:100%}.fslightbox-open{overflow:hidden;height:100%}.fslightbox-flex-centered{display:flex;justify-content:center;align-items:center}.fslightbox-opacity-0{opacity:0!important}.fslightbox-opacity-1{opacity:1!important}.fslightbox-scrollbarfix{padding-right:17px}.fslightbox-transform-transition{transition:transform .3s}.fslightbox-container{font-family:Arial,sans-serif;position:fixed;top:0;left:0;background:linear-gradient(rgba(30,30,30,.9),#000 1810%);touch-action:pinch-zoom;z-index:1000000000;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}.fslightbox-container *{box-sizing:border-box}.fslightbox-svg-path{transition:fill .15s ease;fill:#ddd}.fslightbox-nav{height:45px;width:100%;position:absolute;top:0;left:0}.fslightbox-slide-number-container{display:flex;justify-content:center;align-items:center;position:relative;height:100%;font-size:15px;color:#d7d7d7;z-index:0;max-width:55px;text-align:left}.fslightbox-slide-number-container .fslightbox-flex-centered{height:100%}.fslightbox-slash{display:block;margin:0 5px;width:1px;height:12px;transform:rotate(15deg);background:#fff}.fslightbox-toolbar{position:absolute;z-index:3;right:0;top:0;height:100%;display:flex;background:rgba(35,35,35,.65)}.fslightbox-toolbar-button{height:100%;width:45px;cursor:pointer}.fslightbox-toolbar-button:hover .fslightbox-svg-path{fill:#fff}.fslightbox-slide-btn-container{display:flex;align-items:center;padding:12px 12px 12px 6px;position:absolute;top:50%;cursor:pointer;z-index:3;transform:translateY(-50%)}@media (min-width:476px){.fslightbox-slide-btn-container{padding:22px 22px 22px 6px}}@media (min-width:768px){.fslightbox-slide-btn-container{padding:30px 30px 30px 6px}}.fslightbox-slide-btn-container:hover .fslightbox-svg-path{fill:#f1f1f1}.fslightbox-slide-btn{padding:9px;font-size:26px;background:rgba(35,35,35,.65)}@media (min-width:768px){.fslightbox-slide-btn{padding:10px}}@media (min-width:1600px){.fslightbox-slide-btn{padding:11px}}.fslightbox-slide-btn-container-previous{left:0}@media (max-width:475.99px){.fslightbox-slide-btn-container-previous{padding-left:3px}}.fslightbox-slide-btn-container-next{right:0;padding-left:12px;padding-right:3px}@media (min-width:476px){.fslightbox-slide-btn-container-next{padding-left:22px}}@media (min-width:768px){.fslightbox-slide-btn-container-next{padding-left:30px}}@media (min-width:476px){.fslightbox-slide-btn-container-next{padding-right:6px}}.fslightbox-down-event-detector{position:absolute;z-index:1}.fslightbox-slide-swiping-hoverer{z-index:4}.fslightbox-invalid-file-wrapper{font-size:22px;color:#eaebeb;margin:auto}.fslightboxv{object-fit:cover}.fslightbox-youtube-iframe{border:0}.fslightboxl{display:block;margin:auto;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:67px;height:67px}.fslightboxl div{box-sizing:border-box;display:block;position:absolute;width:54px;height:54px;margin:6px;border:5px solid;border-color:#999 transparent transparent transparent;border-radius:50%;animation:fslightboxl 1.2s cubic-bezier(.5,0,.5,1) infinite}.fslightboxl div:nth-child(1){animation-delay:-.45s}.fslightboxl div:nth-child(2){animation-delay:-.3s}.fslightboxl div:nth-child(3){animation-delay:-.15s}@keyframes fslightboxl{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}.fslightbox-source{position:relative;z-index:2;opacity:0}"
										)
								),
								document.head.appendChild(o));
						function L(e) {
								var t,
										n = e.props,
										o = 0,
										i = {};
								(this.getSourceTypeFromLocalStorageByUrl = function (e) {
										return t[e] ? t[e] : r(e);
								}),
										(this.handleReceivedSourceTypeForUrl = function (e, n) {
												if (!1 === i[n] && (o--, "invalid" !== e ? (i[n] = e) : delete i[n], 0 === o)) {
														!(function (e, t) {
																for (var n in t) e[n] = t[n];
														})(t, i);
														try {
																localStorage.setItem("fslightbox-types", JSON.stringify(t));
														} catch (e) {}
												}
										});
								var r = function (e) {
										o++, (i[e] = !1);
								};
								if (n.disableLocalStorage) (this.getSourceTypeFromLocalStorageByUrl = function () {}), (this.handleReceivedSourceTypeForUrl = function () {});
								else {
										try {
												t = JSON.parse(localStorage.getItem("fslightbox-types"));
										} catch (e) {}
										t || ((t = {}), (this.getSourceTypeFromLocalStorageByUrl = r));
								}
						}
						function A(e, t, n, o) {
								e.data;
								var i = e.elements.sources,
										r = n / o,
										s = 0;
								this.adjustSize = function () {
										if ((s = e.mw / r) < e.mh) return n < e.mw && (s = o), a();
										(s = o > e.mh ? e.mh : o), a();
								};
								var a = function () {
										(i[t].style.width = s * r + "px"), (i[t].style.height = s + "px");
								};
						}
						function C(e, t) {
								var n = this,
										o = e.collections.sourceSizers,
										i = e.elements,
										r = i.sourceAnimationWrappers,
										s = i.sources,
										a = e.isl,
										c = e.resolve;
								function l(e, n) {
										(o[t] = c(A, [t, e, n])), o[t].adjustSize();
								}
								this.runActions = function (e, o) {
										(a[t] = !0), s[t].classList.add(x), r[t].classList.add(g), r[t].removeChild(r[t].firstChild), l(e, o), (n.runActions = l);
								};
						}
						function E(e, t) {
								var n,
										o = this,
										i = e.elements.sources,
										r = e.props,
										s = (0, e.resolve)(C, [t]);
								(this.handleImageLoad = function (e) {
										var t = e.target,
												n = t.naturalWidth,
												o = t.naturalHeight;
										s.runActions(n, o);
								}),
										(this.handleVideoLoad = function (e) {
												var t = e.target,
														o = t.videoWidth,
														i = t.videoHeight;
												(n = !0), s.runActions(o, i);
										}),
										(this.handleNotMetaDatedVideoLoad = function () {
												n || o.handleYoutubeLoad();
										}),
										(this.handleYoutubeLoad = function () {
												var e = 1920,
														t = 1080;
												r.maxYoutubeDimensions && ((e = r.maxYoutubeDimensions.width), (t = r.maxYoutubeDimensions.height)), s.runActions(e, t);
										}),
										(this.handleCustomLoad = function () {
												var e = i[t],
														n = e.offsetWidth,
														r = e.offsetHeight;
												n && r ? s.runActions(n, r) : setTimeout(o.handleCustomLoad);
										});
						}
						function F(e, t, n) {
								var o = e.elements.sources,
										i = e.props.customClasses,
										r = i[t] ? i[t] : "";
								o[t].className = n + " " + r;
						}
						function I(e, t) {
								var n = e.elements.sources,
										o = e.props.customAttributes;
								for (var i in o[t]) n[t].setAttribute(i, o[t][i]);
						}
						function N(e, t) {
								var n = e.collections.sourceLoadHandlers,
										o = e.elements,
										i = o.sources,
										r = o.sourceAnimationWrappers,
										s = e.props.sources;
								(i[t] = document.createElement("img")), F(e, t, y), (i[t].src = s[t]), (i[t].onload = n[t].handleImageLoad), I(e, t), r[t].appendChild(i[t]);
						}
						function z(e, t) {
								var n = e.ap,
										o = e.collections.sourceLoadHandlers,
										i = e.elements,
										r = i.sources,
										s = i.sourceAnimationWrappers,
										a = e.props,
										c = a.sources,
										l = a.videosPosters,
										u = document.createElement("video"),
										d = document.createElement("source");
								(r[t] = u),
										F(e, t, "".concat(y, " fslightboxv")),
										(u.src = c[t]),
										(u.onloadedmetadata = function (e) {
												return o[t].handleVideoLoad(e);
										}),
										(u.controls = !0),
										(u.autoplay = n.i(t)),
										I(e, t),
										l[t] && (r[t].poster = l[t]),
										(d.src = c[t]),
										u.appendChild(d),
										setTimeout(o[t].handleNotMetaDatedVideoLoad, 3e3),
										s[t].appendChild(r[t]);
						}
						function T(e, t) {
								var n = e.ap,
										o = e.collections.sourceLoadHandlers,
										r = e.elements,
										s = r.sources,
										a = r.sourceAnimationWrappers,
										c = e.props.sources[t],
										l = c.split("?")[1],
										u = document.createElement("iframe");
								(s[t] = u),
										F(e, t, "".concat(y, " ").concat(i, "youtube-iframe")),
										(u.src = "https://www.youtube.com/embed/"
												.concat(c.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)[2], "?")
												.concat(l || "")
												.concat(n.i(t) ? "&mute=1&autoplay=1" : "", "&enablejsapi=1")),
										(u.allowFullscreen = !0),
										I(e, t),
										a[t].appendChild(u),
										o[t].handleYoutubeLoad();
						}
						function P(e, t) {
								var n = e.collections.sourceLoadHandlers,
										o = e.elements,
										i = o.sources,
										r = o.sourceAnimationWrappers,
										s = e.props.sources;
								(i[t] = s[t]), F(e, t, "".concat(i[t].className, " ").concat(y)), r[t].appendChild(i[t]), n[t].handleCustomLoad();
						}
						function k(e, t) {
								var n = e.elements,
										o = n.sources,
										r = n.sourceAnimationWrappers;
								e.props.sources;
								(o[t] = document.createElement("div")),
										(o[t].className = "".concat(i, "invalid-file-wrapper ").concat(c)),
										(o[t].innerHTML = "Invalid source"),
										r[t].classList.add(g),
										r[t].removeChild(r[t].firstChild),
										r[t].appendChild(o[t]);
						}
						function R(e) {
								var t = e.collections,
										n = t.sourceLoadHandlers,
										o = t.sourcesRenderFunctions,
										i = e.core.sourceDisplayFacade,
										r = e.resolve;
								this.runActionsForSourceTypeAndIndex = function (t, s) {
										var a;
										switch (("invalid" !== t && (n[s] = r(E, [s])), t)) {
												case "image":
														a = N;
														break;
												case "video":
														a = z;
														break;
												case "youtube":
														a = T;
														break;
												case "custom":
														a = P;
														break;
												default:
														a = k;
										}
										(o[s] = function () {
												return a(e, s);
										}),
												i.displaySourcesWhichShouldBeDisplayed();
								};
						}
						function M(e, t, n) {
								var o = e.props,
										i = o.types,
										r = o.type,
										s = o.sources;
								(this.getTypeSetByClientForIndex = function (e) {
										var t;
										return i && i[e] ? (t = i[e]) : r && (t = r), t;
								}),
										(this.retrieveTypeWithXhrForIndex = function (e) {
												!(function (e, t) {
														var n = document.createElement("a");
														n.href = e;
														var o = n.hostname;
														if ("www.youtube.com" === o || "youtu.be" === o) return t("youtube");
														var i = new XMLHttpRequest();
														(i.onreadystatechange = function () {
																if (4 !== i.readyState) {
																		if (2 === i.readyState) {
																				var e,
																						n = i.getResponseHeader("content-type");
																				switch (n.slice(0, n.indexOf("/"))) {
																						case "image":
																								e = "image";
																								break;
																						case "video":
																								e = "video";
																								break;
																						default:
																								e = "invalid";
																				}
																				(i.onreadystatechange = null), i.abort(), t(e);
																		}
																} else t("invalid");
														}),
																i.open("GET", e),
																i.send();
												})(s[e], function (o) {
														t.handleReceivedSourceTypeForUrl(o, s[e]), n.runActionsForSourceTypeAndIndex(o, e);
												});
										});
						}
						function W(e, t) {
								var n = e.core.stageManager,
										o = e.elements,
										i = o.smw,
										r = o.sourceWrappersContainer,
										s = e.props,
										l = 0,
										p = document.createElement("div");
								function f(e) {
										(p.style.transform = "translateX(".concat(e + l, "px)")), (l = 0);
								}
								function h() {
										return (1 + s.slideDistance) * innerWidth;
								}
								(p.className = "".concat(d, " ").concat(a, " ").concat(c)),
										(p.s = function () {
												p.style.display = "flex";
										}),
										(p.h = function () {
												p.style.display = "none";
										}),
										(p.a = function () {
												p.classList.add(u);
										}),
										(p.d = function () {
												p.classList.remove(u);
										}),
										(p.n = function () {
												p.style.removeProperty("transform");
										}),
										(p.v = function (e) {
												return (l = e), p;
										}),
										(p.ne = function () {
												f(-h());
										}),
										(p.z = function () {
												f(0);
										}),
										(p.p = function () {
												f(h());
										}),
										n.i(t) || p.h(),
										(i[t] = p),
										r.appendChild(p),
										(function (e, t) {
												var n = e.elements,
														o = n.smw,
														i = n.sourceAnimationWrappers,
														r = document.createElement("div"),
														s = document.createElement("div");
												s.className = "fslightboxl";
												for (var a = 0; a < 3; a++) {
														var c = document.createElement("div");
														s.appendChild(c);
												}
												r.appendChild(s), o[t].appendChild(r), (i[t] = r);
										})(e, t);
						}
						function D(e, t, n, o) {
								var r = document.createElementNS("http://www.w3.org/2000/svg", "svg");
								r.setAttributeNS(null, "width", t), r.setAttributeNS(null, "height", t), r.setAttributeNS(null, "viewBox", n);
								var s = document.createElementNS("http://www.w3.org/2000/svg", "path");
								return s.setAttributeNS(null, "class", "".concat(i, "svg-path")), s.setAttributeNS(null, "d", o), r.appendChild(s), e.appendChild(r), r;
						}
						function H(e, t) {
								var n = document.createElement("div");
								return (n.className = "".concat(i, "toolbar-button ").concat(c)), (n.title = t), e.appendChild(n), n;
						}
						function O(e, t) {
								var n = document.createElement("div");
								(n.className = "".concat(i, "toolbar")),
										t.appendChild(n),
										(function (e, t) {
												var n = e.componentsServices,
														o = e.data,
														i = e.fs,
														r = "M4.5 11H3v4h4v-1.5H4.5V11zM3 7h1.5V4.5H7V3H3v4zm10.5 6.5H11V15h4v-4h-1.5v2.5zM11 3v1.5h2.5V7H15V3h-4z",
														s = H(t);
												s.title = "Enter fullscreen";
												var a = D(s, "20px", "0 0 18 18", r);
												(n.ofs = function () {
														(o.ifs = !0),
																(s.title = "Exit fullscreen"),
																a.setAttributeNS(null, "width", "24px"),
																a.setAttributeNS(null, "height", "24px"),
																a.setAttributeNS(null, "viewBox", "0 0 950 1024"),
																a.firstChild.setAttributeNS(null, "d", "M682 342h128v84h-212v-212h84v128zM598 810v-212h212v84h-128v128h-84zM342 342v-128h84v212h-212v-84h128zM214 682v-84h212v212h-84v-128h-128z");
												}),
														(n.xfs = function () {
																(o.ifs = !1),
																		(s.title = "Enter fullscreen"),
																		a.setAttributeNS(null, "width", "20px"),
																		a.setAttributeNS(null, "height", "20px"),
																		a.setAttributeNS(null, "viewBox", "0 0 18 18"),
																		a.firstChild.setAttributeNS(null, "d", r);
														}),
														(s.onclick = i.t);
										})(e, n),
										(function (e, t) {
												var n = H(t, "Close");
												(n.onclick = e.core.lightboxCloser.closeLightbox),
														D(
																n,
																"20px",
																"0 0 24 24",
																"M 4.7070312 3.2929688 L 3.2929688 4.7070312 L 10.585938 12 L 3.2929688 19.292969 L 4.7070312 20.707031 L 12 13.414062 L 19.292969 20.707031 L 20.707031 19.292969 L 13.414062 12 L 20.707031 4.7070312 L 19.292969 3.2929688 L 12 10.585938 L 4.7070312 3.2929688 z"
														);
										})(e, n);
						}
						function j(e) {
								var t = e.props.sources,
										n = e.elements.container,
										o = document.createElement("div");
								(o.className = "".concat(i, "nav")),
										n.appendChild(o),
										O(e, o),
										t.length > 1 &&
												(function (e, t) {
														var n = e.componentsServices,
																o = e.props.sources,
																r = (e.stageIndexes, document.createElement("div"));
														r.className = "".concat(i, "slide-number-container");
														var s = document.createElement("div");
														s.className = c;
														var a = document.createElement("span");
														n.setSlideNumber = function (e) {
																return (a.innerHTML = e);
														};
														var l = document.createElement("span");
														l.className = "".concat(i, "slash");
														var u = document.createElement("div");
														(u.innerHTML = o.length),
																r.appendChild(s),
																s.appendChild(a),
																s.appendChild(l),
																s.appendChild(u),
																t.appendChild(r),
																setTimeout(function () {
																		s.offsetWidth > 55 && (r.style.justifyContent = "flex-start");
																});
												})(e, o);
						}
						function X(e, t, n, o) {
								var i = e.elements.container,
										r = n.charAt(0).toUpperCase() + n.slice(1),
										s = document.createElement("div");
								(s.className = "".concat(f, " ").concat(f, "-").concat(n)),
										(s.title = "".concat(r, " slide")),
										(s.onclick = t),
										(function (e, t) {
												var n = document.createElement("div");
												(n.className = "".concat(p, " ").concat(c)), D(n, "20px", "0 0 20 20", t), e.appendChild(n);
										})(s, o),
										i.appendChild(s);
						}
						function B(e) {
								var t = e.core,
										n = t.lightboxCloser,
										o = t.slideChangeFacade,
										i = e.fs;
								this.listener = function (e) {
										switch (e.key) {
												case "Escape":
														n.closeLightbox();
														break;
												case "ArrowLeft":
														o.changeToPrevious();
														break;
												case "ArrowRight":
														o.changeToNext();
														break;
												case "F11":
														e.preventDefault(), i.t();
										}
								};
						}
						function q(e) {
								var t = e.elements,
										n = e.sourcePointerProps,
										o = e.stageIndexes;
								function i(e, o) {
										t.smw[e].v(n.swipedX)[o]();
								}
								this.runActionsForEvent = function (e) {
										var r, a, c;
										t.container.contains(t.slideSwipingHoverer) || t.container.appendChild(t.slideSwipingHoverer), (r = t.container), (a = s), (c = r.classList).contains(a) || c.add(a), (n.swipedX = e.screenX - n.downScreenX);
										var l = o.previous,
												u = o.next;
										i(o.current, "z"), void 0 !== l && n.swipedX > 0 ? i(l, "ne") : void 0 !== u && n.swipedX < 0 && i(u, "p");
								};
						}
						function V(e) {
								var t = e.props.sources,
										n = e.resolve,
										o = e.sourcePointerProps,
										i = n(q);
								1 === t.length
										? (this.listener = function () {
													o.swipedX = 1;
											})
										: (this.listener = function (e) {
													o.isPointering && i.runActionsForEvent(e);
											});
						}
						function U(e) {
								var t = e.core.slideIndexChanger,
										n = e.elements.smw,
										o = e.stageIndexes,
										i = e.sws;
								function r(e) {
										var t = n[o.current];
										t.a(), t[e]();
								}
								function s(e, t) {
										void 0 !== e && (n[e].s(), n[e][t]());
								}
								(this.runPositiveSwipedXActions = function () {
										var e = o.previous;
										if (void 0 === e) r("z");
										else {
												r("p");
												var n = o.next;
												t.changeTo(e);
												var a = o.previous;
												i.d(a), i.b(n), r("z"), s(a, "ne");
										}
								}),
										(this.runNegativeSwipedXActions = function () {
												var e = o.next;
												if (void 0 === e) r("z");
												else {
														r("ne");
														var n = o.previous;
														t.changeTo(e);
														var a = o.next;
														i.d(a), i.b(n), r("z"), s(a, "p");
												}
										});
						}
						function _(e, t) {
								e.contains(t) && e.removeChild(t);
						}
						function Y(e) {
								var t = e.core.lightboxCloser,
										n = e.elements,
										o = e.resolve,
										i = e.sourcePointerProps,
										r = o(U);
								(this.runNoSwipeActions = function () {
										_(n.container, n.slideSwipingHoverer), i.isSourceDownEventTarget || t.closeLightbox(), (i.isPointering = !1);
								}),
										(this.runActions = function () {
												i.swipedX > 0 ? r.runPositiveSwipedXActions() : r.runNegativeSwipedXActions(), _(n.container, n.slideSwipingHoverer), n.container.classList.remove(s), (i.isPointering = !1);
										});
						}
						function J(e) {
								var t = e.resolve,
										n = e.sourcePointerProps,
										o = t(Y);
								this.listener = function () {
										n.isPointering && (n.swipedX ? o.runActions() : o.runNoSwipeActions());
								};
						}
						function G(e) {
								var t = this,
										n = e.core,
										o = n.eventsDispatcher,
										i = n.globalEventsController,
										r = n.scrollbarRecompensor,
										s = e.data,
										a = e.elements,
										c = e.fs,
										u = e.props,
										d = e.sourcePointerProps;
								(this.isLightboxFadingOut = !1),
										(this.runActions = function () {
												(t.isLightboxFadingOut = !0),
														a.container.classList.add(v),
														i.removeListeners(),
														u.exitFullscreenOnClose && s.ifs && c.x(),
														setTimeout(function () {
																(t.isLightboxFadingOut = !1),
																		(d.isPointering = !1),
																		a.container.classList.remove(v),
																		document.documentElement.classList.remove(l),
																		r.removeRecompense(),
																		document.body.removeChild(a.container),
																		o.dispatch("onClose");
																if (e.onClose) {
																	e.onClose()
																}
														}, 270);
										});
						}
						function $(e, t) {
								var n = e.classList;
								n.contains(t) && n.remove(t);
						}
						function K(e) {
								var t, n, o;
								!(function (e) {
										var t = e.ap,
												n = e.elements.sources,
												o = e.props,
												i = o.autoplay,
												r = o.autoplays;
										function s(e, o) {
												if ("play" != o || t.i(e)) {
														var i = n[e];
														if (i) {
																var r = i.tagName;
																if ("VIDEO" == r) i[o]();
																else if ("IFRAME" == r) {
																		var s = i.contentWindow;
																		s && s.postMessage('{"event":"command","func":"'.concat(o, 'Video","args":""}'), "*");
																}
														}
												}
										}
										(t.i = function (e) {
												return r[e] || (i && 0 != r[e]);
										}),
												(t.p = function (e) {
														s(e, "play");
												}),
												(t.c = function (e, t) {
														s(e, "pause"), s(t, "play");
												});
								})(e),
										(n = (t = e).core.eventsDispatcher),
										(o = t.props),
										(n.dispatch = function (e) {
												o[e] && o[e]();
										}),
										(function (e) {
												var t = e.componentsServices,
														n = e.data,
														o = e.fs,
														i = ["fullscreenchange", "webkitfullscreenchange", "mozfullscreenchange", "MSFullscreenChange"];
												function r(e) {
														for (var t = 0; t < i.length; t++) document[e](i[t], s);
												}
												function s() {
														document.fullscreenElement || document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement ? t.ofs() : t.xfs();
												}
												(o.o = function () {
														t.ofs();
														var e = document.documentElement;
														e.requestFullscreen ? e.requestFullscreen() : e.mozRequestFullScreen ? e.mozRequestFullScreen() : e.webkitRequestFullscreen ? e.webkitRequestFullscreen() : e.msRequestFullscreen && e.msRequestFullscreen();
												}),
														(o.x = function () {
																t.xfs(),
																		document.exitFullscreen
																				? document.exitFullscreen()
																				: document.mozCancelFullScreen
																				? document.mozCancelFullScreen()
																				: document.webkitExitFullscreen
																				? document.webkitExitFullscreen()
																				: document.msExitFullscreen && document.msExitFullscreen();
														}),
														(o.t = function () {
																n.ifs ? o.x() : o.o();
														}),
														(o.l = function () {
																r("addEventListener");
														}),
														(o.q = function () {
																r("removeEventListener");
														});
										})(e),
										(function (e) {
												var t = e.core,
														n = t.globalEventsController,
														o = t.windowResizeActioner,
														i = e.fs,
														r = e.resolve,
														s = r(B),
														a = r(V),
														c = r(J);
												(n.attachListeners = function () {
														document.addEventListener("pointermove", a.listener), document.addEventListener("pointerup", c.listener), addEventListener("resize", o.runActions), document.addEventListener("keydown", s.listener), i.l();
												}),
														(n.removeListeners = function () {
																document.removeEventListener("pointermove", a.listener),
																		document.removeEventListener("pointerup", c.listener),
																		removeEventListener("resize", o.runActions),
																		document.removeEventListener("keydown", s.listener),
																		i.q();
														});
										})(e),
										(function (e) {
												var t = e.core.lightboxCloser,
														n = (0, e.resolve)(G);
												t.closeLightbox = function () {
														n.isLightboxFadingOut || n.runActions();
												};
										})(e),
										(function (e) {
												var t = e.data,
														n = e.core.scrollbarRecompensor;
												function o() {
														document.body.offsetHeight > innerHeight && (document.body.style.marginRight = t.scrollbarWidth + "px");
												}
												(n.addRecompense = function () {
														"complete" === document.readyState
																? o()
																: addEventListener("load", function () {
																			o(), (n.addRecompense = o);
																	});
												}),
														(n.removeRecompense = function () {
																document.body.style.removeProperty("margin-right");
														});
										})(e),
										(function (e) {
												var t = e.core,
														n = t.slideChangeFacade,
														o = t.slideIndexChanger,
														i = t.stageManager;
												e.props.sources.length > 1
														? ((n.changeToPrevious = function () {
																	o.jumpTo(i.getPreviousSlideIndex());
															}),
															(n.changeToNext = function () {
																	o.jumpTo(i.getNextSlideIndex());
															}))
														: ((n.changeToPrevious = function () {}), (n.changeToNext = function () {}));
										})(e),
										(function (e) {
												var t = e.ap,
														n = e.componentsServices,
														o = e.core,
														i = o.slideIndexChanger,
														r = o.sourceDisplayFacade,
														s = o.stageManager,
														a = e.elements,
														c = a.smw,
														l = a.sourceAnimationWrappers,
														u = e.isl,
														d = e.stageIndexes,
														p = e.sws;
												(i.changeTo = function (e) {
														t.c(d.current, e), (d.current = e), s.updateStageIndexes(), n.setSlideNumber(e + 1), r.displaySourcesWhichShouldBeDisplayed();
												}),
														(i.jumpTo = function (e) {
																var t = d.previous,
																		n = d.current,
																		o = d.next,
																		r = u[n],
																		a = u[e];
																i.changeTo(e);
																for (var f = 0; f < c.length; f++) c[f].d();
																p.d(n),
																		p.c(),
																		requestAnimationFrame(function () {
																				requestAnimationFrame(function () {
																						var e = d.previous,
																								i = d.next;
																						function f() {
																								s.i(n) ? (n === d.previous ? c[n].ne() : n === d.next && c[n].p()) : (c[n].h(), c[n].n());
																						}
																						r && l[n].classList.add(m),
																								a && l[d.current].classList.add(h),
																								p.a(),
																								void 0 !== e && e !== n && c[e].ne(),
																								c[d.current].n(),
																								void 0 !== i && i !== n && c[i].p(),
																								p.b(t),
																								p.b(o),
																								u[n] ? setTimeout(f, 260) : f();
																				});
																		});
														});
										})(e),
										(function (e) {
												var t = e.core.sourcesPointerDown,
														n = e.elements,
														o = n.smw,
														i = n.sources,
														r = e.sourcePointerProps,
														s = e.stageIndexes;
												t.listener = function (e) {
														"VIDEO" !== e.target.tagName && e.preventDefault(), (r.isPointering = !0), (r.downScreenX = e.screenX), (r.swipedX = 0);
														var t = i[s.current];
														t && t.contains(e.target) ? (r.isSourceDownEventTarget = !0) : (r.isSourceDownEventTarget = !1);
														for (var n = 0; n < o.length; n++) o[n].d();
												};
										})(e),
										(function (e) {
												var t = e.collections.sourcesRenderFunctions,
														n = e.core.sourceDisplayFacade,
														o = e.loc,
														i = e.stageIndexes;
												function r(e) {
														t[e] && (t[e](), delete t[e]);
												}
												n.displaySourcesWhichShouldBeDisplayed = function () {
														if (o) r(i.current);
														else for (var e in i) r(i[e]);
												};
										})(e),
										(function (e) {
												var t = e.core.stageManager,
														n = e.elements,
														o = n.smw,
														i = n.sourceAnimationWrappers,
														r = e.isl,
														s = e.stageIndexes,
														a = e.sws;
												(a.a = function () {
														for (var e in s) o[s[e]].s();
												}),
														(a.b = function (e) {
																void 0 === e || t.i(e) || (o[e].h(), o[e].n());
														}),
														(a.c = function () {
																for (var e in s) a.d(s[e]);
														}),
														(a.d = function (e) {
																if (r[e]) {
																		var t = i[e];
																		$(t, g), $(t, h), $(t, m);
																}
														});
										})(e),
										(function (e) {
												var t = e.collections.sourceSizers,
														n = e.core.windowResizeActioner,
														o = (e.data, e.elements.smw),
														i = e.props.sourceMargin,
														r = e.stageIndexes,
														s = 1 - 2 * i;
												n.runActions = function () {
														innerWidth > 992 ? (e.mw = s * innerWidth) : (e.mw = innerWidth), (e.mh = s * innerHeight);
														for (var n = 0; n < o.length; n++) o[n].d(), t[n] && t[n].adjustSize();
														var i = r.previous,
																a = r.next;
														void 0 !== i && o[i].ne(), void 0 !== a && o[a].p();
												};
										})(e);
						}
						function Q(e) {
								var t = e.ap,
										n = e.componentsServices,
										o = e.core,
										r = o.eventsDispatcher,
										s = o.globalEventsController,
										c = o.scrollbarRecompensor,
										u = o.sourceDisplayFacade,
										p = o.stageManager,
										f = o.windowResizeActioner,
										h = e.data,
										m = e.elements,
										v = (e.props, e.stageIndexes),
										b = e.sws,
										x = 0;
								function y() {
										var t,
												n,
												o = e.props,
												s = o.autoplay,
												c = o.autoplays;
										(x = !0),
												(function (e) {
														var t = e.props,
																n = t.autoplays;
														e.c = t.sources.length;
														for (var o = 0; o < e.c; o++) "false" === n[o] && (n[o] = 0), "" === n[o] && (n[o] = 1);
														e.loc = t.loadOnlyCurrentSource;
												})(e),
												(h.scrollbarWidth = (function () {
														var e = document.createElement("div"),
																t = e.style,
																n = document.createElement("div");
														(t.visibility = "hidden"), (t.width = "100px"), (t.msOverflowStyle = "scrollbar"), (t.overflow = "scroll"), (n.style.width = "100%"), document.body.appendChild(e);
														var o = e.offsetWidth;
														e.appendChild(n);
														var i = n.offsetWidth;
														return document.body.removeChild(e), o - i;
												})()),
												(s || c.length > 0) && (e.loc = 1),
												K(e),
												(m.container = document.createElement("div")),
												(m.container.className = "".concat(i, "container ").concat(a, " ").concat(g)),
												(function (e) {
														var t = e.elements;
														(t.slideSwipingHoverer = document.createElement("div")), (t.slideSwipingHoverer.className = "".concat(i, "slide-swiping-hoverer ").concat(a, " ").concat(d));
												})(e),
												j(e),
												(function (e) {
														var t = e.core.sourcesPointerDown,
																n = e.elements,
																o = e.props.sources,
																i = document.createElement("div");
														(i.className = "".concat(d, " ").concat(a)), n.container.appendChild(i), i.addEventListener("pointerdown", t.listener), (n.sourceWrappersContainer = i);
														for (var r = 0; r < o.length; r++) W(e, r);
												})(e),
												e.props.sources.length > 1 &&
														((n = (t = e).core.slideChangeFacade),
														X(
																t,
																n.changeToPrevious,
																"previous",
																"M18.271,9.212H3.615l4.184-4.184c0.306-0.306,0.306-0.801,0-1.107c-0.306-0.306-0.801-0.306-1.107,0L1.21,9.403C1.194,9.417,1.174,9.421,1.158,9.437c-0.181,0.181-0.242,0.425-0.209,0.66c0.005,0.038,0.012,0.071,0.022,0.109c0.028,0.098,0.075,0.188,0.142,0.271c0.021,0.026,0.021,0.061,0.045,0.085c0.015,0.016,0.034,0.02,0.05,0.033l5.484,5.483c0.306,0.307,0.801,0.307,1.107,0c0.306-0.305,0.306-0.801,0-1.105l-4.184-4.185h14.656c0.436,0,0.788-0.353,0.788-0.788S18.707,9.212,18.271,9.212z"
														),
														X(
																t,
																n.changeToNext,
																"next",
																"M1.729,9.212h14.656l-4.184-4.184c-0.307-0.306-0.307-0.801,0-1.107c0.305-0.306,0.801-0.306,1.106,0l5.481,5.482c0.018,0.014,0.037,0.019,0.053,0.034c0.181,0.181,0.242,0.425,0.209,0.66c-0.004,0.038-0.012,0.071-0.021,0.109c-0.028,0.098-0.075,0.188-0.143,0.271c-0.021,0.026-0.021,0.061-0.045,0.085c-0.015,0.016-0.034,0.02-0.051,0.033l-5.483,5.483c-0.306,0.307-0.802,0.307-1.106,0c-0.307-0.305-0.307-0.801,0-1.105l4.184-4.185H1.729c-0.436,0-0.788-0.353-0.788-0.788S1.293,9.212,1.729,9.212z"
														)),
												(function (e) {
														for (var t = e.props.sources, n = e.resolve, o = n(L), i = n(R), r = n(M, [o, i]), s = 0; s < t.length; s++)
																if ("string" == typeof t[s]) {
																		var a = r.getTypeSetByClientForIndex(s);
																		if (a) i.runActionsForSourceTypeAndIndex(a, s);
																		else {
																				var c = o.getSourceTypeFromLocalStorageByUrl(t[s]);
																				c ? i.runActionsForSourceTypeAndIndex(c, s) : r.retrieveTypeWithXhrForIndex(s);
																		}
																} else i.runActionsForSourceTypeAndIndex("custom", s);
												})(e),
												r.dispatch("onInit");
								}
								e.open = function () {
										var o = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0,
												i = v.previous,
												a = v.current,
												d = v.next;
										(v.current = o),
												x || S(e),
												p.updateStageIndexes(),
												x ? (b.c(), b.a(), b.b(i), b.b(a), b.b(d), r.dispatch("onShow")) : y(),
												u.displaySourcesWhichShouldBeDisplayed(),
												n.setSlideNumber(o + 1),
												document.body.appendChild(m.container),
												document.documentElement.classList.add(l),
												c.addRecompense(),
												s.attachListeners(),
												f.runActions(),
												m.smw[o].n(),
												t.p(o),
												r.dispatch("onOpen");
								};
						}
						function Z(e, t, n) {
								return (Z = ee()
										? Reflect.construct.bind()
										: function (e, t, n) {
													var o = [null];
													o.push.apply(o, t);
													var i = new (Function.bind.apply(e, o))();
													return n && te(i, n.prototype), i;
											}).apply(null, arguments);
						}
						function ee() {
								if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
								if (Reflect.construct.sham) return !1;
								if ("function" == typeof Proxy) return !0;
								try {
										return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})), !0;
								} catch (e) {
										return !1;
								}
						}
						function te(e, t) {
								return (te = Object.setPrototypeOf
										? Object.setPrototypeOf.bind()
										: function (e, t) {
													return (e.__proto__ = t), e;
											})(e, t);
						}
						function ne(e) {
								return (
										(function (e) {
												if (Array.isArray(e)) return oe(e);
										})(e) ||
										(function (e) {
												if (("undefined" != typeof Symbol && null != e[Symbol.iterator]) || null != e["@@iterator"]) return Array.from(e);
										})(e) ||
										(function (e, t) {
												if (!e) return;
												if ("string" == typeof e) return oe(e, t);
												var n = Object.prototype.toString.call(e).slice(8, -1);
												"Object" === n && e.constructor && (n = e.constructor.name);
												if ("Map" === n || "Set" === n) return Array.from(e);
												if ("Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return oe(e, t);
										})(e) ||
										(function () {
												throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
										})()
								);
						}
						function oe(e, t) {
								(null == t || t > e.length) && (t = e.length);
								for (var n = 0, o = new Array(t); n < t; n++) o[n] = e[n];
								return o;
						}
						function ie() {
								for (
										var e = document.getElementsByTagName("a"),
												t = function (t) {
														if (!e[t].hasAttribute("data-fslightbox")) return "continue";
														var n = e[t].hasAttribute("data-href") ? e[t].getAttribute("data-href") : e[t].getAttribute("href");
														if (!n) return console.warn('The "data-fslightbox" attribute was set without the "href" attribute.'), "continue";
														var o = e[t].getAttribute("data-fslightbox");
														fsLightboxInstances[o] || (fsLightboxInstances[o] = new FsLightbox());
														var i = null;
														"#" === n.charAt(0) ? (i = document.getElementById(n.substring(1)).cloneNode(!0)).removeAttribute("id") : (i = n), fsLightboxInstances[o].props.sources.push(i), fsLightboxInstances[o].elements.a.push(e[t]);
														var r = fsLightboxInstances[o].props.sources.length - 1;
														(e[t].onclick = function (e) {
																e.preventDefault(), fsLightboxInstances[o].open(r);
														}),
																d("types", "data-type"),
																d("videosPosters", "data-video-poster"),
																d("customClasses", "data-class"),
																d("customClasses", "data-custom-class"),
																d("autoplays", "data-autoplay");
														for (
																var s = ["href", "data-fslightbox", "data-href", "data-type", "data-video-poster", "data-class", "data-custom-class", "data-autoplay"],
																		a = e[t].attributes,
																		c = fsLightboxInstances[o].props.customAttributes,
																		l = 0;
																l < a.length;
																l++
														)
																if (-1 === s.indexOf(a[l].name) && "data-" === a[l].name.substr(0, 5)) {
																		c[r] || (c[r] = {});
																		var u = a[l].name.substr(5);
																		c[r][u] = a[l].value;
																}
														function d(n, i) {
																e[t].hasAttribute(i) && (fsLightboxInstances[o].props[n][r] = e[t].getAttribute(i));
														}
												},
												n = 0;
										n < e.length;
										n++
								)
										t(n);
								var o = Object.keys(fsLightboxInstances);
								window.fsLightbox = fsLightboxInstances[o[o.length - 1]];
						}
						(window.FsLightbox = function () {
								var e = this;
								(this.props = { sources: [], customAttributes: [], customClasses: [], autoplays: [], types: [], videosPosters: [], sourceMargin: 0.05, slideDistance: 0.3 }),
										(this.data = { isFullscreenOpen: !1, scrollbarWidth: 0 }),
										(this.isl = []),
										(this.sourcePointerProps = { downScreenX: null, isPointering: !1, isSourceDownEventTarget: !1, swipedX: 0 }),
										(this.stageIndexes = {}),
										(this.elements = { a: [], container: null, slideSwipingHoverer: null, smw: [], sourceWrappersContainer: null, sources: [], sourceAnimationWrappers: [] }),
										(this.componentsServices = { setSlideNumber: function () {} }),
										(this.resolve = function (t) {
												var n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : [];
												return n.unshift(e), Z(t, ne(n));
										}),
										(this.collections = { sourceLoadHandlers: [], sourcesRenderFunctions: [], sourceSizers: [] }),
										(this.core = {
												eventsDispatcher: {},
												globalEventsController: {},
												lightboxCloser: {},
												lightboxUpdater: {},
												scrollbarRecompensor: {},
												slideChangeFacade: {},
												slideIndexChanger: {},
												sourcesPointerDown: {},
												sourceDisplayFacade: {},
												stageManager: {},
												windowResizeActioner: {},
										}),
										(this.ap = {}),
										(this.fs = {}),
										(this.sws = {}),
										Q(this),
										(this.close = function () {
												return e.core.lightboxCloser.closeLightbox();
										});
						}),
								(window.fsLightboxInstances = {}),
								ie(),
								(window.refreshFsLightbox = function () {
										for (var e in fsLightboxInstances) {
												var t = fsLightboxInstances[e].props;
												(fsLightboxInstances[e] = new FsLightbox()), (fsLightboxInstances[e].props = t), (fsLightboxInstances[e].props.sources = []), (fsLightboxInstances[e].elements.a = []);
										}
										ie();
								});
				},
		]);
});


document.addEventListener('DOMContentLoaded', function(){
	Array.prototype.forEach.call(document.querySelectorAll("[data-fslightbox]"), function(fslightbox){
		if (!fslightbox) return;
		const lightbox = new FsLightbox();
		lightbox.props.sources = setLightBoxImages();
		lightbox.props.initialAnimation = "lightbox-animation";

		lightbox.onClose = function(e){
			unsetWindowWidth();
		}

		function setLightBoxImages(){
			let scrArray = [];
			let allImages = Array.prototype.forEach.call(fslightbox.querySelectorAll('img'), function(img){
				scrArray.push(img.src);
			});
			return scrArray;
		};

		function setWindowWidth(){
			document.body.style.width = window.getComputedStyle(document.body).width;
			document.getElementById('mainHeader').style.width = window.getComputedStyle(document.getElementById('mainHeader')).width;
			document.body.classList.add('overlayed');
		};

		function unsetWindowWidth(){
			document.body.classList.remove('overlayed');
			document.body.style.width = '';
			document.getElementById('mainHeader').style.width = '';
		}

		let allButtons = Array.prototype.slice.call(fslightbox.querySelectorAll('.item'));

		for (let i = 0; i <= allButtons.length-1; i++) {
			let button = allButtons[i];

			button.addEventListener("click", function (e) {
				setWindowWidth();
				lightbox.open(i);
			});
		};
	});
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
		hidePopupButtonAttribute = 'data-popup-close';

		constructor(popupId) {
			this.popupId = popupId;
			this.called = document.querySelector(popupId);
			this.hidePopupButtons = this.called.querySelectorAll('['+this.hidePopupButtonAttribute+']');
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

		init = function() {
			let popup = this;
			popup.showPopup();
			popup.hidePopupButtons.forEach((button) =>{
				button.addEventListener("click", popup.hidePopup.bind(popup), false);
			});
			popup.called.addEventListener("click", function(e){
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

		lineStarted = false;

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
			let lineStarted = true;
			let activeElement = runningLine.lineFollowElement.querySelector('.'+runningLine.activeClassName);
			runningLine.start(activeElement);
		};

		start(activeElement){
			let runningLine = this;
			runningLine.setActiveElement(activeElement);
			runningLine.setWidth();
			runningLine.setPosition();
		};

		destroy(){
			this.lineStarted = false;
			this.lineElement.style.width = '0px';
		}
	};


	Array.prototype.forEach.call(document.querySelectorAll(".running-line"), function(line){
		let activeListItem = document.querySelector('.current_page_item');

		if (activeListItem) {
			let activeListItemLink = activeListItem.querySelector('a');
			activeListItemLink.classList.add('active');
			window.newRunningLine = new RunningLine(line);
			window.newRunningLine.init();
		};

		Array.prototype.forEach.call(line.parentNode.querySelectorAll('a'), function(link){
			let allLinks = line.parentNode.querySelectorAll('a');
			link.addEventListener("mouseenter", function (e) {
				for (let i = 0; i < allLinks.length; i++) {
					allLinks[i].classList.remove('active');
				};
				this.classList.add('active');

				if (!window.newRunningLine) {
					window.newRunningLine = new RunningLine(line);
					window.newRunningLine.init();
				}
				window.newRunningLine.start(this);
			})
		});

			line.parentNode.addEventListener("mouseleave", function (e) {
				let openedMenutab = document.querySelector('.menu-tab.active');
				if (!activeListItem) {
					window.newRunningLine.destroy();
				} else {
					if (!openedMenutab) {
						window.newRunningLine.start(document.querySelector('.current_page_item').querySelector('a'))
					}
				};
			})
	});
});


class RunningSlider {
	constructor(root, speed = 0.5) {
		this.root = root;
		this.track = root.querySelector('.slider-track');
		this.cover = root.querySelector('.slider-cover');

		this.speed = speed;
		this.position = 0;
		this.isRunning = false;

		this.init();
	}

	init() {
		if (!this.track || !this.cover) return;

		this.cloneSlides();
		this.start();
	}

	cloneSlides() {
		const children = Array.from(this.cover.children);
		children.forEach(el => {
			const clone = el.cloneNode(true);
			this.cover.appendChild(clone);
		});

		this.totalWidth = this.cover.scrollWidth / 2;
	}

	start() {
		this.isRunning = true;
		this.animate();
	}

	animate() {
		if (!this.isRunning) return;

		this.position -= this.speed;

		if (Math.abs(this.position) >= this.totalWidth) {
			this.position = 0;
		}

		this.track.style.transform = `translateX(${this.position}px)`;

		requestAnimationFrame(() => this.animate());
	}
}


// init
document.addEventListener('DOMContentLoaded', () => {
	const slider = document.querySelector('.running-slider');
	if (slider) {
		new RunningSlider(slider, 0.4); // speed можеш міняти
	}
});
// scrollButton
document.addEventListener('DOMContentLoaded', function(){

	class scrollButtonAnimationComponent {
		pageAnchors = [];
		scrollButton = null;
		anchorIndex = 0;
		lastScroll = 0;
		scrollDirection = null;

		buttonBottomClassName = 'to-bottom';
		buttonTopClassName = 'to-top';

		constructor(button) {
			this.scrollButton = button;
			this.pageAnchors = this.setAnchors();
		}

		scrollToSection(section) {
			if (!section) return;
			section.scrollIntoView({
				behavior: 'smooth' 
			});
		};

		scrollDetect(){
			let currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
			if (currentScroll > 0 && this.lastScroll <= currentScroll){
				this.lastScroll = currentScroll;
				this.scrollDirection = "down";

			} else {
				this.lastScroll = currentScroll;
				this.scrollDirection = "up";
			}
		};

		resetAnchor(){
			this.anchorIndex = 0;
		};

		setAnchors(){
			let anchorsArray = [];
			Array.prototype.forEach.call(document.querySelectorAll('section'), function(section, i){
				let obj = {
					anchor: section,
					top: section.offsetTop
				}
				anchorsArray.push(obj)
			});
			return anchorsArray;
		};

		detectPagePosition(){
			let scrollBottomPosition = window.pageYOffset + window.innerHeight;
			let footerHeight = document.getElementById('mainFooter').clientHeight;
			let bottomOffset = footerHeight;

			if (scrollBottomPosition >= document.body.clientHeight - bottomOffset) {
				this.scrollDirection = 'up';
				this.resetAnchor();
				this.scrollButton.classList.add(this.buttonTopClassName);
				this.scrollButton.classList.remove(this.buttonBottomClassName);
			} else {
				this.scrollDirection = 'down'
				this.scrollButton.classList.add(this.buttonBottomClassName);
				this.scrollButton.classList.remove(this.buttonTopClassName);
			}
		}

		detectActiveAnchor(){
			if (this.scrollDirection == 'down') {
				let pageTop = window.pageYOffset + window.innerHeight/2;
				this.pageAnchors.forEach((anchor, i) => {
					if (pageTop > anchor.top && this.anchorIndex == i) {
						if (this.anchorIndex < this.pageAnchors.length - 1) {
							this.anchorIndex++
						};
					};
				});
			};
		};

		init() {
			this.detectActiveAnchor();
			this.detectPagePosition();
			this.scrollButton.addEventListener("click", (event) => {
				if (this.scrollDirection == 'up') {
					this.scrollToSection(document.getElementById('pageMain'))
				} else {
					if (this.pageAnchors[this.anchorIndex] && this.anchorIndex <= this.pageAnchors.length) {
						this.scrollToSection(this.pageAnchors[this.anchorIndex].anchor)
						if (this.anchorIndex < this.pageAnchors.length - 1) {
							this.anchorIndex++
						};
					};
				};
			});
			// on scroll
			document.addEventListener("scroll", (event) => {
				this.scrollDetect();
				this.detectActiveAnchor();
				this.detectPagePosition();
			}, {passive: true})
		};
	};

	let scrollButton = document.getElementById("scrollButton");
	const scrollButtonAnimation = new scrollButtonAnimationComponent(scrollButton);
	scrollButtonAnimation.init();
});
//form animations + search filter
document.addEventListener('DOMContentLoaded', function(){

	let filterSearchInput = document.querySelector('[data-filter]');
	let filterSearchInputValue = '';
	let filterFields = filterSearchInput && filterSearchInput.dataset ? filterSearchInput.dataset.filterFields : '';

	function clearFilter(selector){
		let allFilteredItems = document.querySelectorAll(selector);
		for (let i = 0; i < allFilteredItems.length; i++) {
			allFilteredItems[i].innerHTML = allFilteredItems[i].innerHTML.replace(/(<mark>|<\/mark>)/gim, '');
			allFilteredItems[i].parentNode.classList.remove('hidden');
			setCounter(allFilteredItems[i], 0);
		};
		alertMessageToggle(false);
	};

	function alertMessageToggle(open){
		let alertMessage = document.getElementById('searchEmptyMessage');
		let showMore = document.getElementById('showMore');

		if (open) {
			if (alertMessage) alertMessage.classList.remove('hidden');
			if (showMore) showMore.classList.add('hidden');
		} else {
			if (alertMessage) alertMessage.classList.add('hidden');
			if (showMore) showMore.classList.remove('hidden');
		};
	};

	function highlightText(selector, searchText){
		if (!selector || !selector.innerHTML) return;
		const regex = new RegExp(searchText, 'gi');

		let text = selector.innerHTML;
				text = text.replace(/(<mark>|<\/mark>)/gim, '');

		const newtext = text.replace(regex, '<mark>$&</mark>');

		selector.innerHTML = newtext;
	}

	function setCounter(parent, number){
		if (parent.querySelector('.search-tooltip') && parent.querySelector('.search-tooltip').querySelector('.count')) {
			parent.querySelector('.search-tooltip').querySelector('.count').innerHTML = number;
		}

		if (!number) {
			parent.classList.remove('success');
		} else {
			parent.classList.add('success');
		}
	}

	function checkFilters(item) {
		if (!item.querySelector('mark')) {
			item.parentNode.classList.add('hidden');
		} else {
			item.parentNode.classList.remove('hidden');
			setCounter(item, item.querySelectorAll('mark').length)
		};

		let allListItems = item.closest('ul').querySelectorAll('li');
		let hiddenListItems = item.closest('ul').querySelectorAll('.hidden');

		if (hiddenListItems.length >= allListItems.length) {
			alertMessageToggle(true);
		} else {
			alertMessageToggle(false);
		}
	};

	function applyFilter(selector, searchText){
		if (!selector) return;
		let allFilteredItems = document.querySelectorAll(selector);
		let fieldsArray = filterFields.split(',');

		for (let i = 0; i < allFilteredItems.length; i++) {
			for (let n = 0; n < fieldsArray.length; n++) {
				let fieldElements = allFilteredItems[i].querySelector(fieldsArray[n]);
				highlightText(fieldElements, searchText);
			};
			checkFilters(allFilteredItems[i]);
		};
	};

	function onCaseSearchKeyDown(event) {
		const waitForFinalEvent = (function(){
			var timers = {};
			return function (callback, ms, uniqueId) {
				if (!uniqueId) {
					uniqueId = "Don't call this twice without a uniqueId";
				}
				if (timers[uniqueId]) {
					clearTimeout (timers[uniqueId]);
				}
				timers[uniqueId] = setTimeout(callback, ms);
			};
		})();

		let input = this;
		waitForFinalEvent(function(){
			if (input.value && input.value.length) {
				input.parentElement.classList.add('focused');
				if (filterSearchInput.dataset.filter) {
					applyFilter(filterSearchInput.dataset.filter, input.value.toLowerCase());
				};
			} else {
				input.parentElement.classList.remove('focused');
				if (filterSearchInput.dataset.filter) {
					clearFilter(filterSearchInput.dataset.filter);
				};
			}
			filterSearchInputValue = input.value;
		}, 100)

		if (event.keyCode == 13 && window.searchCaseCallback) {
			window.searchCaseCallback();

			if (filterSearchInput.dataset.filter && filterSearchInputValue.length) {
				applyFilter(filterSearchInput.dataset.filter, filterSearchInputValue);
			};
		};
	}

	if (filterSearchInput) {
		filterSearchInput.addEventListener('keydown', onCaseSearchKeyDown, {passive: true});
	}
})
document.addEventListener('DOMContentLoaded', function() {
	const ANIMATED_CLASS = 'animated';

	const initialElements = [
		'#mainHeader',
		'.banner',
		'.banner-section',
		'section:first-of-type'
	];

	initialElements.forEach((selector, i) => {
		const el = document.querySelector(selector);
		if (el) {
			setTimeout(() => el.classList.add(ANIMATED_CLASS), i * 100);
		}
	});

	const sections = document.querySelectorAll('.section');
	const observerOptions = {
		root: null,
		rootMargin: '0px 0px -25% 0px',
		threshold: 0
	};

	const observer = new IntersectionObserver((entries, obs) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				entry.target.classList.add(ANIMATED_CLASS);
				obs.unobserve(entry.target); // спостереження більше не потрібне
			}
		});
	}, observerOptions);

	sections.forEach(section => observer.observe(section));
});

document.addEventListener('DOMContentLoaded', function () {

	const waitForFinalEvent = (function(){
		var timers = {};
		return function (callback, ms, uniqueId) {
			if (!uniqueId) uniqueId = "default";
			if (timers[uniqueId]) clearTimeout(timers[uniqueId]);
			timers[uniqueId] = setTimeout(callback, ms);
		};
	})();


	class Slider {
		sliderElment = null;
		track = null;

		sliderDots = null;
		sliderArrows = null;

		allSlides = [];
		prevButton = null;
		nextButton = null;

		totalSlides = 0;

		activeSlideEl = null;
		activeIndex = 0;

		_yearsVisible = 0;
		_yearsOffset = 0;
		_yearsStep = 0;
		_yearsList = null;
		_yearsDots = null;


		currentTransition = 0;
		isTouchDown = false;

		touchStartX = 0;
		touchStartY = 0;
		touchMoveX = 0;
		touchMoveY = 0;

		options = {
			transitionDuration: '0.6s',
			timing: 'ease-in-out',
			delay: '0s',
			direction: 'horizontal', // 'horizontal' | 'vertical'
			autoplay: false,
			autoplayTime: 5000,
			loop: false,
			pauseOnHover: true,
			onInit: null,
			onTranslated: null,
			// селектори під різні розмітки
			trackSelector: '.slider-list',
			slideSelector: '.slide'
		};

		_autoplayTimer = null;
		_resizeRaf = null;

		_handlers = {
			onResize: null,
			onTouchStart: null,
			onTouchMove: null,
			onTouchEnd: null,
			onMouseDown: null,
			onMouseMove: null,
			onMouseUp: null,
			onMouseLeave: null,
			onMouseEnter: null,
			onMouseOut: null,
			onPrevClick: null,
			onNextClick: null
		};

		constructor(sliderElment) {
			this.sliderElment = sliderElment;
		}

		init(options) {
			if (!this.sliderElment) return;

			if (options) Object.assign(this.options, options);

			const ds = this.sliderElment.dataset || {};
			if (typeof ds.autoplay !== 'undefined') this.options.autoplay = this._toBool(ds.autoplay);
			if (typeof ds.loop !== 'undefined') this.options.loop = this._toBool(ds.loop);
			if (typeof ds.autoplayTime !== 'undefined') this.options.autoplayTime = this._toInt(ds.autoplayTime, this.options.autoplayTime);
			if (typeof ds.direction !== 'undefined') this.options.direction = (ds.direction === 'vertical') ? 'vertical' : 'horizontal';

			this.track = this.sliderElment.querySelector(this.options.trackSelector);
			this.sliderDots = this.sliderElment.querySelector('[data-dots]')?.querySelectorAll('.dot') || null;
			this.sliderArrows = this.sliderElment.querySelector('.slider-arrows') || null;
			this.allSlides = Array.from(this.sliderElment.querySelectorAll(this.options.slideSelector));
			this.totalSlides = this.allSlides.length;

			if (!this.track || !this.totalSlides) return;

			this.activeIndex = this._clamp(this.activeIndex, 0, this.totalSlides - 1);
			this._setActiveSlide(this.activeIndex);
			this._setActiveDot(this.activeIndex);

			this._setupArrows();
			this._setupDots();
			this._bindEvents();

			this._applyTransform(this._calcTranslation(this.activeIndex), true);
			// force correct first measurement
			setTimeout(() => {
				this._updateChronologyPagination();
			}, 0);

			if (typeof this.options.onInit === 'function') {
				this.options.onInit(this);
			}

			if (this.options.autoplay) {
				this._startAutoplay();
			}

			this.sliderElment._sliderInstance = this;
			this.sliderElment.setAttribute('data-slider-initialized', 'true');
		}

		_bindEvents() {
			if (this.prevButton) {
				this._handlers.onPrevClick = (e) => { e.preventDefault(); this.prev(); };
				this.prevButton.addEventListener('click', this._handlers.onPrevClick);
			}
			if (this.nextButton) {
				this._handlers.onNextClick = (e) => { e.preventDefault(); this.next(); };
				this.nextButton.addEventListener('click', this._handlers.onNextClick);
			}

			if (this.sliderDots) {
				this.sliderDots.forEach((dot, index) => {
					const fn = (e) => { e.preventDefault(); this.goTo(index); };
					dot._onDotClick = fn;
					dot.addEventListener('click', fn);
				});
			}

			this._handlers.onResize = () => {
				waitForFinalEvent(() => {
					this.update();
					this._updateChronologyPagination();
				}, 200, 'chronology-resize');
			};


			window.addEventListener('resize', this._handlers.onResize);

			this._handlers.onTouchStart = (e) => this._onTouchStart(e);
			this._handlers.onTouchMove = (e) => this._onTouchMove(e);
			this._handlers.onTouchEnd = () => this._onTouchEnd();

			this.sliderElment.addEventListener('touchstart', this._handlers.onTouchStart, { passive: true });
			this.sliderElment.addEventListener('touchmove', this._handlers.onTouchMove, { passive: false });
			this.sliderElment.addEventListener('touchend', this._handlers.onTouchEnd, { passive: true });

			let mouseDown = false;
			let mouseStartX = 0;
			let mouseStartY = 0;

			this._handlers.onMouseDown = (e) => {
				mouseDown = true;
				this.isTouchDown = true;
				mouseStartX = e.clientX;
				mouseStartY = e.clientY;
				this._cancelAutoplay();
				this._disableTransition();
			};
			this._handlers.onMouseMove = (e) => {
				if (!mouseDown) return;
				this._dragByDelta(e.clientX - mouseStartX, e.clientY - mouseStartY);
			};
			this._handlers.onMouseUp = (e) => {
				if (!mouseDown) return;
				mouseDown = false;
				this.isTouchDown = false;
				this._endDrag(e.clientX - mouseStartX, e.clientY - mouseStartY);
			};
			this._handlers.onMouseLeave = (e) => {
				if (!mouseDown) return;
				mouseDown = false;
				this.isTouchDown = false;
				this._endDrag(0, 0);
			};

			this.sliderElment.addEventListener('mousedown', this._handlers.onMouseDown);
			this.sliderElment.addEventListener('mousemove', this._handlers.onMouseMove);
			this.sliderElment.addEventListener('mouseup', this._handlers.onMouseUp);
			this.sliderElment.addEventListener('mouseleave', this._handlers.onMouseLeave);

			if (this.options.pauseOnHover) {
				this._handlers.onMouseEnter = () => this._cancelAutoplay();
				this._handlers.onMouseOut = () => this._startAutoplay();
				this.sliderElment.addEventListener('mouseenter', this._handlers.onMouseEnter);
				this.sliderElment.addEventListener('mouseleave', this._handlers.onMouseOut);
			}
		}

		update() {
			this.allSlides = Array.from(this.sliderElment.querySelectorAll(this.options.slideSelector));
			this.totalSlides = this.allSlides.length;
			this.activeIndex = this._clamp(this.activeIndex, 0, this.totalSlides - 1);
			this._setActiveSlide(this.activeIndex);
			this._applyTransform(this._calcTranslation(this.activeIndex), true);
		}

		prev() {
			const nextIndex = (this.activeIndex - 1);
			if (nextIndex < 0) {
				if (this.options.loop) {
					this.goTo(this.totalSlides - 1);
				} else {
					this.goTo(0);
				}
			} else {
				this.goTo(nextIndex);
			}
		}

		next() {
			const nextIndex = (this.activeIndex + 1);
			if (nextIndex > this.totalSlides - 1) {
				if (this.options.loop) {
					this.goTo(0);
				} else {
					this.goTo(this.totalSlides - 1);
				}
			} else {
				this.goTo(nextIndex);
			}
		}

		goTo(index) {
			index = this._clamp(index, 0, this.totalSlides - 1);
			if (index === this.activeIndex) return;

			this._cancelAutoplay();

			this.activeIndex = index;
			this._setActiveSlide(index);
			this._setActiveDot(index);

			this._enableTransition();
			this._applyTransform(this._calcTranslation(index), false);

			if (typeof this.options.onTranslated === 'function') {
				this.options.onTranslated(this);
			}

			if (this.options.autoplay) {
				this._startAutoplay();
			}

			this._updateArrowsState();
			// синхронізація років із активним слайдом

			if (this._yearsVisible && this._yearsDots) {

				const maxOffset = Math.max(0, this._yearsDots.length - this._yearsVisible);

				// якщо активна точка вилізла праворуч
				if (this.activeIndex >= this._yearsOffset + this._yearsVisible) {
					this._yearsOffset = this.activeIndex - this._yearsVisible + 1;
				}

				// якщо вилізла ліворуч
				if (this.activeIndex < this._yearsOffset) {
					this._yearsOffset = this.activeIndex;
				}

				// clamp
				this._yearsOffset = Math.max(0, Math.min(this._yearsOffset, maxOffset));

				const translate = -(this._yearsStep * this._yearsOffset);
				this._yearsList.style.transform = `translateX(${translate}px)`;
			}
		}

		_setActiveSlide(index) {
			this.allSlides.forEach((slide, i) => {
				if (i === index) {
					slide.classList.add('active');
					this.activeSlideEl = slide;
				} else {
					slide.classList.remove('active');
				}
			});
		}

		_setActiveDot(index) {
			if (!this.sliderDots) return;
			this.sliderDots.forEach((dot, i) => {
				dot.classList.toggle('active', i === index);
			});
		}

		_setupArrows() {
			if (!this.sliderArrows) return;
			this.prevButton = this.sliderArrows.querySelector('.prev') || null;
			this.nextButton = this.sliderArrows.querySelector('.next') || null;
			this._updateArrowsState();
		}

		_updateArrowsState() {
			if (!this.prevButton || !this.nextButton) return;
			if (this.options.loop) {
				this.prevButton.classList.remove('hidden');
				this.nextButton.classList.remove('hidden');
				return;
			}
			this.prevButton.classList.toggle('hidden', this.activeIndex === 0);
			this.nextButton.classList.toggle('hidden', this.activeIndex === this.totalSlides - 1);
		}

		_setupDots() { /* уже знайдені у init */ }

		_calcTranslation(index) {
			let offset = 0;
			if (index === 0) return 0;

			if (this.options.direction === 'vertical') {
				for (let i = 0; i < index; i++) offset += this.allSlides[i].getBoundingClientRect().height;
				return -offset;
			} else {
				for (let i = 0; i < index; i++) offset += this.allSlides[i].getBoundingClientRect().width;
				return -offset;
			}
		}

		_applyTransform(value, noAnimation = false) {
			if (noAnimation) this._disableTransition();
			const axis = (this.options.direction === 'vertical') ? 'Y' : 'X';
			this.currentTransition = value;
			this.track.style.transform = `translate${axis}(${value}px)`;
		}

		_enableTransition() {
			this.track.style.transition = `transform ${this.options.transitionDuration} ${this.options.timing} ${this.options.delay}`;
		}

		_disableTransition() {
			this.track.style.transition = 'none';
		}

		_startAutoplay() {
			if (!this.options.autoplay) return;
			this._cancelAutoplay();

			this._autoplayTimer = setInterval(() => {
				const atLast = this.activeIndex >= this.totalSlides - 1;
				if (!this.options.loop && atLast) {
					this._cancelAutoplay();
					return;
				}
				this.next();
			}, this.options.autoplayTime);
		}

		_cancelAutoplay() {
			if (this._autoplayTimer) {
				clearInterval(this._autoplayTimer);
				this._autoplayTimer = null;
			}
		}

		_onTouchStart(e) {
			if (e.touches.length !== 1) return;
			this.isTouchDown = true;
			this._disableTransition();
			this._cancelAutoplay();

			this.touchStartX = e.touches[0].clientX;
			this.touchStartY = e.touches[0].clientY;
			this.touchMoveX = this.touchStartX;
			this.touchMoveY = this.touchStartY;
		}

		_onTouchMove(e) {
			if (!this.isTouchDown) return;

			this.touchMoveX = e.touches[0].clientX;
			this.touchMoveY = e.touches[0].clientY;

			const deltaX = this.touchMoveX - this.touchStartX;
			const deltaY = this.touchMoveY - this.touchStartY;

			const horizontal = (this.options.direction === 'horizontal');
			const primaryDelta = horizontal ? deltaX : deltaY;
			const crossDelta = horizontal ? Math.abs(deltaY) : Math.abs(deltaX);

			if (Math.abs(primaryDelta) > crossDelta) e.preventDefault();

			this._dragByDelta(deltaX, deltaY);
		}

		_onTouchEnd() {
			if (!this.isTouchDown) return;
			this.isTouchDown = false;

			const deltaX = this.touchMoveX - this.touchStartX;
			const deltaY = this.touchMoveY - this.touchStartY;
			this._endDrag(deltaX, deltaY);
		}

		_dragByDelta(deltaX, deltaY) {
			const horizontal = (this.options.direction === 'horizontal');
			const delta = horizontal ? deltaX : deltaY;
			const axis = horizontal ? 'X' : 'Y';
			this.track.style.transform = `translate${axis}(${this.currentTransition + delta}px)`;
		}

		_endDrag(deltaX, deltaY) {
			const horizontal = (this.options.direction === 'horizontal');
			const delta = horizontal ? deltaX : deltaY;

			const activeSize = horizontal
				? this.activeSlideEl.getBoundingClientRect().width
				: this.activeSlideEl.getBoundingClientRect().height;

			const threshold = Math.max(30, activeSize * 0.2);

			if (Math.abs(delta) >= threshold) {
				if (delta > 0) this.prev();
				else this.next();
			} else {
				this._enableTransition();
				this._applyTransform(this._calcTranslation(this.activeIndex), false);
			}

			if (this.options.autoplay) this._startAutoplay();
		}

		destroy() {
			this._cancelAutoplay();
			this._disableTransition();
			if (this.track) this.track.style.transform = '';

			if (this.allSlides && this.allSlides.length) {
				this.allSlides.forEach(slide => slide.classList.remove('active'));
			}
			if (this.sliderDots) {
				this.sliderDots.forEach(dot => dot.classList.remove('active'));
			}

			if (this._handlers.onResize) window.removeEventListener('resize', this._handlers.onResize);

			if (this.sliderElment) {
				if (this._handlers.onTouchStart) this.sliderElment.removeEventListener('touchstart', this._handlers.onTouchStart, { passive: true });
				if (this._handlers.onTouchMove) this.sliderElment.removeEventListener('touchmove', this._handlers.onTouchMove, { passive: false });
				if (this._handlers.onTouchEnd) this.sliderElment.removeEventListener('touchend', this._handlers.onTouchEnd, { passive: true });

				if (this._handlers.onMouseDown) this.sliderElment.removeEventListener('mousedown', this._handlers.onMouseDown);
				if (this._handlers.onMouseMove) this.sliderElment.removeEventListener('mousemove', this._handlers.onMouseMove);
				if (this._handlers.onMouseUp) this.sliderElment.removeEventListener('mouseup', this._handlers.onMouseUp);
				if (this._handlers.onMouseLeave) this.sliderElment.removeEventListener('mouseleave', this._handlers.onMouseLeave);

				if (this.options.pauseOnHover) {
					if (this._handlers.onMouseEnter) this.sliderElment.removeEventListener('mouseenter', this._handlers.onMouseEnter);
					if (this._handlers.onMouseOut) this.sliderElment.removeEventListener('mouseleave', this._handlers.onMouseOut);
				}
			}

			if (this.prevButton && this._handlers.onPrevClick) this.prevButton.removeEventListener('click', this._handlers.onPrevClick);
			if (this.nextButton && this._handlers.onNextClick) this.nextButton.removeEventListener('click', this._handlers.onNextClick);

			if (this.sliderDots) {
				this.sliderDots.forEach(dot => {
					if (dot._onDotClick) {
						dot.removeEventListener('click', dot._onDotClick);
						delete dot._onDotClick;
					}
				});
			}

			if (this.sliderElment) {
				delete this.sliderElment._sliderInstance;
				this.sliderElment.removeAttribute('data-slider-initialized');
			}
		}

		_updateChronologyPagination() {
			const cover = this.sliderElment.querySelector('.dots-slide-cover');
			const list  = this.sliderElment.querySelector('.slider-pagination');
			const dotsRoot = this.sliderElment.querySelector('[data-dots]');
			if (!dotsRoot) return;
			if (!cover || !list) return;
			cover.style.maxWidth = '';

			const dots = Array.from(list.querySelectorAll('.dot'));
			if (!dots.length) return;

			const prevBtn = dotsRoot.querySelector('.button-prev-years');
			const nextBtn = dotsRoot.querySelector('.button-next-years');

			const containerWidth = cover.clientWidth - 1;

			const dotRect = dots[0].getBoundingClientRect();
			let step = dotRect.width;
			if (step <= 0) step = dotRect.width + 22;

			if (dots.length > 1) {
				const first = dots[0].getBoundingClientRect();
				const second = dots[1].getBoundingClientRect();
				const dist = second.left - first.left;
				if (dist > 0) step = dist;
			}

			let visibleCount = Math.max(
				1,
				Math.floor(containerWidth / step)
			);
			while (visibleCount > 1) {
				const testIndex = visibleCount - 1;
				if (!dots[testIndex]) break;

				const firstRect = dots[0].getBoundingClientRect();
				const lastRect = dots[testIndex].getBoundingClientRect();

				const realWidth = lastRect.right - firstRect.left;

				if (realWidth <= containerWidth) break;

				visibleCount--;
			}
			console.log({
				containerWidth,
				step,
				dots: dots.length,
				visibleCount
			});


			if (visibleCount >= dots.length) {

				list.style.transform = '';

				prevBtn?.classList.add('hidden');
				nextBtn?.classList.add('hidden');
				dotsRoot.classList.remove('with-buttons');
				return;
			}

			// ЗБЕРЕЖЕННЯ СТАНУ
			this._yearsVisible = visibleCount;
			this._yearsStep = step;
			this._yearsList = list;
			this._yearsDots = dots;

			const maxOffsetSync = dots.length - visibleCount;
			this._yearsOffset = Math.min(this._yearsOffset, maxOffsetSync);

			dotsRoot.classList.add('with-buttons');

			const lastVisibleIndex = visibleCount - 1;
			if (!dots[lastVisibleIndex]) return;

			const firstDotRect = dots[0].getBoundingClientRect();
			const lastDotRect = dots[lastVisibleIndex].getBoundingClientRect();

			// РЕАЛЬНА ширина по DOM
			const visibleWidth = Math.ceil(lastDotRect.right - firstDotRect.left);

			cover.style.maxWidth = `${visibleWidth}px`;

			console.log({
				containerWidth,
				step,
				fit: Math.floor(containerWidth / step)
			});

			const apply = () => {
				const maxOffset = dots.length - visibleCount;
				this._yearsOffset = Math.max(0, Math.min(this._yearsOffset, maxOffset));

				const translate = -(step * this._yearsOffset);
				list.style.transform = `translateX(${translate}px)`;
				list.style.transition = 'transform .4s ease';

				const currentGroupEnd = this._yearsOffset + visibleCount - 1;
				const nextStartIndex = currentGroupEnd + 1;


				if (nextBtn) {
					const hasNext = this._yearsOffset + visibleCount < dots.length;

					if (hasNext) {
						const nextStartIndex = this._yearsOffset + visibleCount;
						const first = dots[nextStartIndex].textContent;
						const last = dots[dots.length - 1].textContent;

						nextBtn.textContent = `${first}-${last}`;
						nextBtn.classList.remove('hidden');
					} else {
						nextBtn.classList.add('hidden');
					}
				}


				console.log({
					offset: this._yearsOffset,
					visibleCount,
					nextStart: this._yearsOffset + visibleCount
				});

				if (prevBtn) {
					if (this._yearsOffset > 0) {
						prevBtn.textContent =
							`${dots[0].textContent}-${dots[this._yearsOffset - 1].textContent}`;
						prevBtn.classList.remove('hidden');
					} else {
						prevBtn.classList.add('hidden');
					}
				}


				dotsRoot.classList.toggle('no-shadow', this._yearsOffset >= maxOffset);
			};

			if (prevBtn) {
				prevBtn.onclick = (e) => {
					e.preventDefault();

					this._yearsOffset = 0;

					const translate = -(this._yearsStep * this._yearsOffset);
					this._yearsList.style.transform = `translateX(${translate}px)`;

					apply();
				};
			}


			if (nextBtn) {
				nextBtn.onclick = (e) => {
					e.preventDefault();

					const visible = this._yearsVisible;
					const maxOffset = this._yearsDots.length - visible;

					this._yearsOffset = Math.min(
						this._yearsOffset + visible,
						maxOffset
					);

					const translate = -(this._yearsStep * this._yearsOffset);
					this._yearsList.style.transform = `translateX(${translate}px)`;

					apply();
				};
			}



			// показуємо кнопки якщо вони потрібні
			prevBtn?.classList.remove('hidden');
			nextBtn?.classList.remove('hidden');

			requestAnimationFrame(() => {
				apply();
			});

		}

		_clamp(n, min, max) { return Math.min(Math.max(n, min), max); }
		_toBool(v) { if (typeof v === 'boolean') return v; if (typeof v === 'number') return v !== 0; return String(v).toLowerCase() === 'true'; }
		_toInt(v, def = 0) { const x = parseInt(v, 10); return Number.isFinite(x) ? x : def; }
	}

	// Ініціалізація усіх .slider, окрім тих, що всередині .mobile-slider-section (ними керуємо нижче)
	Array.prototype.forEach.call(document.querySelectorAll('.slider'), function (sliderEl) {
		if (sliderEl.closest('.mobile-slider-section')) return;

		const slider = new Slider(sliderEl);

		let options = {
			direction: 'horizontal',
			autoplay: false,
			loop: false,
			onInit: function (api) {
				requestAnimationFrame(() => {
					requestAnimationFrame(() => {
						api._updateChronologyPagination();
					});
				});
			},
			onTranslated: function (api) {
			}
		};

		if (sliderEl.classList.contains('counter-slider')) {

			const setDates = function () {
				const dots = Array.from(sliderEl.querySelector('.chronology-list')?.querySelectorAll('.dot') || []);
				const captions = dots.map(d => d.textContent.trim());
				const prevCaption = slider.prevButton?.querySelector('.caption');
				const nextCaption = slider.nextButton?.querySelector('.caption');

				const prevText = captions[this.activeIndex - 1] || 0;
				const nextText = captions[this.activeIndex + 1] || 0;

				if (prevCaption && window.Odometer) {
					const o = new Odometer({ el: prevCaption, format: '' });
					o.update(prevText);
				} else if (prevCaption) {
					prevCaption.textContent = prevText;
				}

				if (nextCaption && window.Odometer) {
					const o = new Odometer({ el: nextCaption, format: '' });
					o.update(nextText);
				} else if (nextCaption) {
					nextCaption.textContent = nextText;
				}
			};

			options.onInit = function(api) {
				setDates.call(api);
				requestAnimationFrame(() => {
					api._updateChronologyPagination();
				});
			};

			options.onTranslated = function(api) {
				setDates.call(api);
			};
		}

		slider.init(options);
		window.dispatchEvent(new Event('resize'));
	});

	/* =============================================================================
		 МОБІЛЬНІ СЛАЙДЕРИ (кілька на сторінці)
		 Кожен .mobile-slider-section .slider-cover -> окремий інстанс
		 < 769px  => init
		 >= 769px => destroy
	============================================================================= */

	function setupMobileSectionSliders() {
		const covers = document.querySelectorAll('.mobile-slider-section .slider-cover');
		if (!covers.length) return;

		const needInit = window.innerWidth < 769;

		covers.forEach((cover) => {
			let instance = cover._sliderInstance || null;
			const isInited = cover.getAttribute('data-slider-initialized') === 'true';

			if (needInit && !isInited) {
				const slider = new Slider(cover);
				slider.init({
					trackSelector: '.mobile-slider-track',
					slideSelector: '.mobile-slider-track > *',
					direction: 'horizontal'
					// loop/autoplay можна задати через data-*, наприклад:
					// data-loop="true" data-autoplay="true" data-autoplay-time="4000"
				});
			} else if (!needInit && isInited && instance) {
				instance.destroy();
			}
		});
	}

	// перший запуск для всіх мобільних
	setupMobileSectionSliders();

	// дебаунс resize для всіх мобільних
	let mobileRaf = null;
	window.addEventListener('resize', () => {
		if (mobileRaf) cancelAnimationFrame(mobileRaf);
		mobileRaf = requestAnimationFrame(setupMobileSectionSliders);
	});
});

	class TagFilter {
		filterAttribute = 'data-tag-filter';
		filteredTagAttribute = 'data-tag';

		filteredTagsCover = null;
		filterButtons = [];

		tagsParent = null;

		constructor(filterGroup) {
			this.tagsParent = document.getElementById(filterGroup.dataset.filter);
			this.filterButtons = Array.prototype.slice.call(filterGroup.querySelectorAll(`[${this.filterAttribute}]`));
			this.filterButtons.forEach((filterButton) => {
				filterButton.addEventListener('click', this.applyFilter.bind({button: filterButton, _this: this}), false);
			})
		};

		applyFilter() {
			let tagsParent = this._this.tagsParent;
			let tag = this.button.dataset.tagFilter;
			let attr = this._this.filteredTagAttribute;
			let tagsCover = Array.prototype.slice.call(tagsParent.querySelectorAll('.simple-tags'));
			tagsCover.forEach((cover) => {
				if (tag === 'all') {
					cover.closest('.tag-item-cover').classList.add('visible');
				} else {
					if (cover.querySelectorAll(`[${attr}="${tag}"]`).length > 0) {
						cover.closest('.tag-item-cover').classList.add('visible');
					} else {
						cover.closest('.tag-item-cover').classList.remove('visible');
					}
				}
			});
			this._this.toggleButtonClass(this.button);
		};

		toggleButtonClass(button){
			this.filterButtons.forEach((btn) => {
				btn.classList.remove('active');
			})
			button.classList.add('active');
		};

	};

	Array.prototype.forEach.call(document.querySelectorAll("[data-filter]"), function(filterGroup){
		if (!filterGroup || !filterGroup.dataset.filter) return;
		const tagFilter = new TagFilter(filterGroup);
	});

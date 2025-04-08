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
				this.updateRects();
				this.init();
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

					ctx.drawImage(img, x, y0, 1, sh0, x, 0        , 1, ly1);
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


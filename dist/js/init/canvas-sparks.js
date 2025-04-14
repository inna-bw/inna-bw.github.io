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



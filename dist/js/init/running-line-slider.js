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
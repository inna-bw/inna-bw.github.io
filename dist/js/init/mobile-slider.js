class MobileSlider {
	constructor(root) {
		this.root = root;
		this.track = root.querySelector('.mobile-slider-track');
		this.dots = Array.from(root.querySelectorAll('.dot'));
		this.isActive = false;

		this.current = 0;
		this.startX = 0;
		this.currentX = 0;
		this.isDragging = false;
		this.slideWidth = 0;
		this.gap = 0;
		this.step = 0;

		this.onResize = this.onResize.bind(this);
		this.onDotClick = this.onDotClick.bind(this);
		this.onTouchStart = this.onTouchStart.bind(this);
		this.onTouchMove = this.onTouchMove.bind(this);
		this.onTouchEnd = this.onTouchEnd.bind(this);
		this.onTransitionEnd = this.onTransitionEnd.bind(this);

		this.checkMode();
		window.addEventListener('resize', this.onResize);
	}

	checkMode() {
		if (window.innerWidth < 769) {
			if (!this.isActive) this.init();
		} else {
			if (this.isActive) this.destroy();
		}
	}

	init() {
		this.isActive = true;

		this.slides = Array.from(this.track.children);
		this.originalCount = this.slides.length;

		// clone first & last
		this.firstClone = this.slides[0].cloneNode(true);
		this.lastClone = this.slides[this.slides.length - 1].cloneNode(true);

		this.firstClone.classList.add('is-clone');
		this.lastClone.classList.add('is-clone');

		this.track.appendChild(this.firstClone);
		this.track.insertBefore(this.lastClone, this.track.firstChild);

		this.slides = Array.from(this.track.children);

		this.current = 1;
		this.updateSizes();
		this.jumpTo(this.current, false);

		// dots
		this.dots.forEach((dot, i) => {
			dot.addEventListener('click', this.onDotClick);
		});

		// touch
		this.track.addEventListener('touchstart', this.onTouchStart, { passive: true });
		this.track.addEventListener('touchmove', this.onTouchMove, { passive: false });
		this.track.addEventListener('touchend', this.onTouchEnd);

		this.track.addEventListener('transitionend', this.onTransitionEnd);
	}

	destroy() {
		this.isActive = false;

		this.track.style.transform = '';
		this.track.style.transition = '';

		// remove clones
		this.track.querySelectorAll('.is-clone').forEach(el => el.remove());

		// reset dots
		this.dots.forEach(dot => {
			dot.classList.remove('active');
			dot.removeEventListener('click', this.onDotClick);
		});

		// remove touch
		this.track.removeEventListener('touchstart', this.onTouchStart);
		this.track.removeEventListener('touchmove', this.onTouchMove);
		this.track.removeEventListener('touchend', this.onTouchEnd);
		this.track.removeEventListener('transitionend', this.onTransitionEnd);

		this.current = 0;
	}

	updateSizes() {
		const firstSlide = this.track.children[0];
		const styles = window.getComputedStyle(this.track);

		this.slideWidth = Math.round(firstSlide.getBoundingClientRect().width);
		this.gap = parseFloat(styles.columnGap || styles.gap || 0);
		this.step = this.slideWidth + this.gap;
	}

	onResize() {
		this.checkMode();
		if (this.isActive) {
			this.updateSizes();
			this.jumpTo(this.current, false);
		}
	}

	onDotClick(e) {
		const index = this.dots.indexOf(e.currentTarget);
		this.goTo(index + 1);
	}

	goTo(index) {
		this.current = index;
		this.track.style.transition = 'transform .35s ease';
		this.track.style.transform = `translateX(-${this.step * this.current}px)`;
		this.updateDots();
	}

	jumpTo(index, animate = false) {
		this.current = index;
		this.track.style.transition = animate ? 'transform .35s ease' : 'none';
		this.track.style.transform = `translateX(-${this.step * this.current}px)`;
		this.updateDots();
	}

	updateDots() {
		const realIndex = (this.current - 1 + this.originalCount) % this.originalCount;

		this.dots.forEach((dot, i) => {
			dot.classList.toggle('active', i === realIndex);
		});
	}

	onTransitionEnd() {
		// loop fix
		if (this.current === 0) {
			this.jumpTo(this.originalCount, false);
		}
		if (this.current === this.originalCount + 1) {
			this.jumpTo(1, false);
		}
	}

	onTouchStart(e) {
		this.isDragging = true;
		this.startX = e.touches[0].clientX;
		this.currentX = this.startX;
		this.track.style.transition = 'none';
	}

	onTouchMove(e) {
		if (!this.isDragging) return;

		this.currentX = e.touches[0].clientX;
		const diff = this.currentX - this.startX;
		const offset = -this.current * this.step + diff;

		this.track.style.transform = `translateX(${offset}px)`;
		e.preventDefault();
	}

	onTouchEnd() {
		if (!this.isDragging) return;
		this.isDragging = false;

		const diff = this.currentX - this.startX;
		const threshold = this.step * 0.2;

		if (diff > threshold) {
			this.current--;
		} else if (diff < -threshold) {
			this.current++;
		}

		this.track.style.transition = 'transform .35s ease';
		this.track.style.transform = `translateX(-${this.current * this.step}px)`;

		this.updateDots();
	}
}

// auto init
document.addEventListener('DOMContentLoaded', () => {
	const sliders = document.querySelectorAll('.mobile-slider-section .slider-cover');
	sliders.forEach(el => new MobileSlider(el));
});
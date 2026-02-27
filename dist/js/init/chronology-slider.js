class ChronologySlider {
	constructor(root) {
		this.root = root;

		this.track = root.querySelector('.slider-list');
		this.slides = Array.from(root.querySelectorAll('.slide'));
		this.dots = Array.from(root.querySelectorAll('.dot'));

		this.dotsCover = root.querySelector('.dots-slide-cover');
		this.pagination = root.querySelector('.slider-pagination');

		this.prevBtn = root.querySelector('.button-arrow.prev');
		this.nextBtn = root.querySelector('.button-arrow.next');
		this.prevCaption = this.prevBtn?.querySelector('.odometer');
		this.nextCaption = this.nextBtn?.querySelector('.odometer');
		this.prevOdo = null;
		this.nextOdo = null;

		this.current = 0;
		this.groups = [];
		this.groupMap = new Map();

		// групуємо тільки якщо точок більше 10
		this.isGroupingEnabled = this.dots.length > 10;
		this.groupSize = this.getGroupSize();

		this.resizeTimer = null;

		// pointer state
		this.isPointerDown = false;
		this.startX = 0;
		this.currentX = 0;
		this.deltaX = 0;
		this.pointerId = null;

		this.onResize = this.onResize.bind(this);
		this.onDotClick = this.onDotClick.bind(this);
		this.onPrev = this.onPrev.bind(this);
		this.onNext = this.onNext.bind(this);

		this.onPointerDown = this.onPointerDown.bind(this);
		this.onPointerMove = this.onPointerMove.bind(this);
		this.onPointerUp = this.onPointerUp.bind(this);
		this.onPointerCancel = this.onPointerCancel.bind(this);

		this.init();
	}

	// ---------- INIT ----------

	init() {
		if (!this.track || !this.slides.length) return;

		this.buildGroups();
		this.buildDecadesNav();
		this.bindEvents();
		this.initOdometers();
		this.update();

		window.addEventListener('resize', this.onResize);

		this.track.addEventListener('pointerdown', this.onPointerDown);
		window.addEventListener('pointermove', this.onPointerMove);
		window.addEventListener('pointerup', this.onPointerUp);
		window.addEventListener('pointercancel', this.onPointerCancel);
	}

	// ---------- GROUPS ----------

	buildGroups() {
		this.groups = [];
		this.groupMap.clear();

		// якщо групування вимкнене — одна група
		if (!this.isGroupingEnabled) {
			const key = 'all';

			this.groups.push(key);
			this.groupMap.set(key, this.dots);

			this.dots.forEach((dot, index) => {
				dot.dataset.group = key;
				dot.dataset.index = index;
			});

			return;
		}

		// --- первинне групування по bucket ---
		this.dots.forEach((dot, index) => {
			const year = parseInt(dot.textContent.trim(), 10);
			const size = this.groupSize;

			const bucket = Math.floor(year / size) * size;
			const key = `bucket-${bucket}`;

			if (!this.groupMap.has(key)) {
				this.groupMap.set(key, []);
				this.groups.push(key);
			}

			this.groupMap.get(key).push(dot);
			dot.dataset.group = key;
			dot.dataset.index = index;
		});

		// --- нормалізація підписів по реальних роках ---
		const normalizedGroups = [];
		const normalizedMap = new Map();

		this.groups.forEach(oldKey => {
			const dots = this.groupMap.get(oldKey);
			if (!dots?.length) return;

			const years = dots.map(d =>
				parseInt(d.textContent.trim(), 10)
			);

			const min = Math.min(...years);
			const max = Math.max(...years);

			const label = min === max ? `${min}` : `${min}-${max}`;

			normalizedGroups.push(label);
			normalizedMap.set(label, dots);

			dots.forEach(dot => {
				dot.dataset.group = label;
			});
		});

		this.groups = normalizedGroups;
		this.groupMap = normalizedMap;
	}

	getGroupSize() {
		const w = window.innerWidth;

		if (!this.isGroupingEnabled) {
			return this.dots.length;
		}

		if (w < 640) return 2;
		if (w < 768) return 5;

		return 10;
	}

	// ---------- DECADES NAV ----------

	buildDecadesNav() {
		if (!this.dotsCover || !this.pagination) return;

		this.prevDecades = document.createElement('div');
		this.prevDecades.className = 'decades decades-prev';

		this.nextDecades = document.createElement('div');
		this.nextDecades.className = 'decades decades-next';

		this.dotsCover.insertBefore(this.prevDecades, this.pagination);
		this.dotsCover.appendChild(this.nextDecades);
	}

	updateDecadesNav() {
		if (!this.isGroupingEnabled || this.groups.length <= 1) {
			if (this.prevDecades) this.prevDecades.innerHTML = '';
			if (this.nextDecades) this.nextDecades.innerHTML = '';

			this.dots.forEach(dot => {
				dot.parentElement.style.display = '';
			});

			return;
		}

		const activeDot = this.dots[this.current];
		if (!activeDot) return;

		const activeGroup = activeDot.dataset.group;
		const groupIndex = this.groups.indexOf(activeGroup);

		this.prevDecades.innerHTML = '';
		this.nextDecades.innerHTML = '';

		for (let i = 0; i < groupIndex; i++) {
			this.prevDecades.appendChild(
				this.createDecadeButton(this.groups[i])
			);
		}

		for (let i = groupIndex + 1; i < this.groups.length; i++) {
			this.nextDecades.appendChild(
				this.createDecadeButton(this.groups[i])
			);
		}

		this.updateVisibleGroup(activeGroup);
	}

	createDecadeButton(groupKey) {
		const btn = document.createElement('button');
		btn.className = 'decade';
		btn.type = 'button';
		btn.textContent = groupKey;

		btn.addEventListener('click', () => {
			const dots = this.groupMap.get(groupKey);
			if (!dots?.length) return;

			const index = parseInt(dots[0].dataset.index, 10);
			this.goTo(index);
		});

		return btn;
	}

	updateVisibleGroup(activeGroup) {
		this.dots.forEach(dot => {
			dot.parentElement.style.display =
				dot.dataset.group === activeGroup ? '' : 'none';
		});
	}

	// ---------- Odometer ----------

	initOdometers() {
		if (window.Odometer) {
			if (this.prevCaption) {
				this.prevOdo = new Odometer({
					el: this.prevCaption,
					format: '',
				});
			}

			if (this.nextCaption) {
				this.nextOdo = new Odometer({
					el: this.nextCaption,
					format: '',
				});
			}
		}

		if (this.prevCaption)
			this.prevCaption.textContent = this.prevCaption.textContent.trim();
		if (this.nextCaption)
			this.nextCaption.textContent = this.nextCaption.textContent.trim();
	}

	// ---------- EVENTS ----------

	bindEvents() {
		this.dots.forEach(dot => {
			dot.addEventListener('click', this.onDotClick);
		});

		this.prevBtn?.addEventListener('click', this.onPrev);
		this.nextBtn?.addEventListener('click', this.onNext);
	}

	onDotClick(e) {
		const index = parseInt(e.currentTarget.dataset.index, 10);
		this.goTo(index);
	}

	onPrev() {
		this.goTo(this.current - 1);
	}

	onNext() {
		this.goTo(this.current + 1);
	}

	onResize() {
		clearTimeout(this.resizeTimer);

		this.resizeTimer = setTimeout(() => {
			this.isGroupingEnabled = this.dots.length > 10;

			const newSize = this.getGroupSize();
			if (newSize === this.groupSize) return;

			this.groupSize = newSize;

			this.buildGroups();
			this.updateDecadesNav();
			this.update();
		}, 120);
	}

	// ---------- POINTER DRAG ----------

	onPointerDown(e) {
		if (e.pointerType === 'mouse' && e.button !== 0) return;

		this.isPointerDown = true;
		this.pointerId = e.pointerId;

		this.startX = e.clientX;
		this.currentX = this.startX;
		this.deltaX = 0;

		this.track.style.transition = 'none';
		this.track.setPointerCapture?.(this.pointerId);
	}

	onPointerMove(e) {
		if (!this.isPointerDown) return;
		if (this.pointerId !== e.pointerId) return;

		this.currentX = e.clientX;
		this.deltaX = this.currentX - this.startX;

		const percentOffset =
			(-this.current * 100) +
			(this.deltaX / this.root.offsetWidth) * 100;

		this.track.style.transform = `translateX(${percentOffset}%)`;
	}

	onPointerUp(e) {
		if (!this.isPointerDown) return;
		if (this.pointerId !== e.pointerId) return;

		this.finishPointer();
	}

	onPointerCancel() {
		if (!this.isPointerDown) return;
		this.finishPointer();
	}

	finishPointer() {
		this.isPointerDown = false;

		const threshold = this.root.offsetWidth * 0.15;

		if (this.deltaX > threshold) {
			this.goTo(this.current - 1);
		} else if (this.deltaX < -threshold) {
			this.goTo(this.current + 1);
		} else {
			this.update();
		}

		this.track.releasePointerCapture?.(this.pointerId);
		this.pointerId = null;
	}

	// ---------- CORE ----------

	goTo(index) {
		const total = this.slides.length;

		if (index < 0) index = total - 1;
		if (index >= total) index = 0;

		this.current = index;
		this.update();
	}

	update() {
		const offset = -this.current * 100;
		this.track.style.transform = `translateX(${offset}%)`;
		this.track.style.transition = 'transform .5s ease';

		this.updateDots();
		this.updateDecadesNav();
		this.updateArrows();
	}

	updateDots() {
		this.dots.forEach((dot, i) => {
			dot.classList.toggle('active', i === this.current);
		});
	}

	updateArrows() {
		if (!this.prevCaption || !this.nextCaption) return;

		const total = this.dots.length;
		const prevIndex = (this.current - 1 + total) % total;
		const nextIndex = (this.current + 1) % total;

		const prevText = this.dots[prevIndex].textContent.trim();
		const nextText = this.dots[nextIndex].textContent.trim();

		if (this.prevOdo) {
			if (this.prevCaption.textContent !== prevText) {
				this.prevOdo.update(prevText);
			}
		} else {
			this.prevCaption.textContent = prevText;
		}

		if (this.nextOdo) {
			if (this.nextCaption.textContent !== nextText) {
				this.nextOdo.update(nextText);
			}
		} else {
			this.nextCaption.textContent = nextText;
		}
	}
}

// ---------- AUTO INIT ----------

document.addEventListener('DOMContentLoaded', () => {
	document
		.querySelectorAll('.chronology-slider-cover')
		.forEach(el => new ChronologySlider(el));
});
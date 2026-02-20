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

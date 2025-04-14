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
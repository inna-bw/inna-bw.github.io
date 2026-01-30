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

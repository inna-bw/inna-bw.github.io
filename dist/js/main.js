class Canvas {
	constructor () {
		this.canvasElement = document.getElementById('canvasGrid');
		
		this.context = this.canvasElement.getContext('2d')
		this.setSize()
		window.addEventListener('resize', () => {
			this.setSize()
		})
	}

	getContext () {
		return this.context;
	}
		
	setSize () {
		this.canvasElement.width = this.canvasElement.parentNode.clientWidth;
		this.canvasElement.height = this.canvasElement.parentNode.clientWidth;
	}

	getSize () {
		return {
			width: this.canvasElement.width,
			height: this.canvasElement.height,
		}
	}

	clear () {
		const {width, height} = this.getSize();
		this.context.clearRect(0, 0, width, height)
		this.context.fillStyle = '#282222'
		this.context.fillRect(0, 0, width, height)
	}
}

const canvas = new Canvas();
canvas.clear();
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

		constructor(lineParent) {
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
			runningLine.setActiveElement(activeElement);
			runningLine.setWidth();
			runningLine.setPosition();

			Array.prototype.forEach.call(runningLine.lineFollowElement.children, function(item){
				item.querySelector('a').addEventListener("mouseenter", function (e) {
					runningLine.setActiveElement(this);
					runningLine.setWidth();
					runningLine.setPosition();
				});
				item.querySelector('a').addEventListener("mouseleave", function (e) {
					runningLine.setActiveElement(activeElement);
					runningLine.setWidth();
					runningLine.setPosition();
				});
			})
		};
	};

	Array.prototype.forEach.call(document.querySelectorAll(".running-line"), function(line){
		const newRunningLine = new RunningLine(line);
		newRunningLine.init();
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
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
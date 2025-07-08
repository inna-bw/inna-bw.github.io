// running line
document.addEventListener('DOMContentLoaded', function(){

	class RunningLine {
		lineClassName = 'line';
		lineFollowTag = 'ul';
		activeClassName = 'active';

		activeElement = null;

		lineStarted = false;

		static #instance = null;

		constructor(lineParent) {
			if (RunningLine.#instance) { // проверяем что значение #instance не равно null (т.е. уже что-то присвоено), и прерываем инструкцию, чтобы в соответствии с принципом синглтон сохранить значения присвоенные при первой инициации.
				return RunningLine.#instance;
			}
			RunningLine.#instance = this;
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
			let lineStarted = true;
			let activeElement = runningLine.lineFollowElement.querySelector('.'+runningLine.activeClassName);
			runningLine.start(activeElement);
		};

		start(activeElement){
			let runningLine = this;
			runningLine.setActiveElement(activeElement);
			runningLine.setWidth();
			runningLine.setPosition();
		};

		destroy(){
			this.lineStarted = false;
			this.lineElement.style.width = '0px';
		}
	};


	Array.prototype.forEach.call(document.querySelectorAll(".running-line"), function(line){
		let activeListItem = document.querySelector('.current_page_item');

		if (activeListItem) {
			let activeListItemLink = activeListItem.querySelector('a');
			activeListItemLink.classList.add('active');
			window.newRunningLine = new RunningLine(line);
			window.newRunningLine.init();
		};

		Array.prototype.forEach.call(line.parentNode.querySelectorAll('a'), function(link){
			let allLinks = line.parentNode.querySelectorAll('a');
			link.addEventListener("mouseenter", function (e) {
				for (let i = 0; i < allLinks.length; i++) {
					allLinks[i].classList.remove('active');
				};
				this.classList.add('active');

				if (!window.newRunningLine) {
					window.newRunningLine = new RunningLine(line);
					window.newRunningLine.init();
				}
				window.newRunningLine.start(this);
			})
		});

			line.parentNode.addEventListener("mouseleave", function (e) {
				let openedMenutab = document.querySelector('.menu-tab.active');
				if (!activeListItem) {
					window.newRunningLine.destroy();
				} else {
					if (!openedMenutab) {
						window.newRunningLine.start(document.querySelector('.current_page_item').querySelector('a'))
					}
				};
			})
	});
});


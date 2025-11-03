// data-tab-hover data-tab-index

document.addEventListener('DOMContentLoaded', function(){

	class TabHover {
		activeLinkClassName = 'active';
		activeClassName = 'active';
		animatedClassName = 'animated';
		allYabHovers = document.querySelectorAll("[data-tab-hover]");
		tabIndex = 0;
		hoveredContainer = null;

		savedActiveLink = null;
		currentLink = null;

		maxWindowWidth = 993;

		constructor(tabHoverEl){
			this.tabHoverEl = tabHoverEl;
		}

		init(){
			this.tabIndex = parseInt(this.tabHoverEl.dataset.tabHover);
			this.hoveredContainer = document.querySelector(`[data-tab-index="${this.tabIndex}"]`);
			if (!this.hoveredContainer) return;

			this.tabHoverEl.addEventListener('mouseenter', function(e){
				e.stopPropagation();
				e.stopImmediatePropagation();
				this.closeAllContainers();
				this.showContainer(this.hoveredContainer);
			}.bind(this));

			this.hoveredContainer.addEventListener('mouseleave', function(e){
				e.stopPropagation();
				e.stopImmediatePropagation();
				this.hideContainer(this.hoveredContainer);
				if (!document.querySelector('.current_page_item') && window.newRunningLine) {
					window.newRunningLine.destroy();
				} else {
					if (window.newRunningLine) {
						window.newRunningLine.start(document.querySelector('.current_page_item').querySelector('a'));
					}
				}
			}.bind(this));

			this.hoveredContainer.addEventListener('mouseenter', function(e){
				if (window.newRunningLine) {
					window.newRunningLine.start(window.newRunningLine.activeElement);
				}
			}.bind(this));

			document.addEventListener('mousemove', function(e){
				if (!e.target.closest('.line') && !e.target.closest('[data-tab-hover]') && !e.target.closest('[data-tab-index]')) {
					this.closeAllContainers();
				}
			}.bind(this));
		};

		setActiveLinkClass = function(prevLink, currentLink) {
			// prevLink.classList.remove(this.activeLinkClassName);
			// currentLink.classList.add(this.activeLinkClassName);
		};

		closeAllContainers = function(){
			let allContainers = Array.prototype.slice.call(document.querySelectorAll("[data-tab-index]"));
			allContainers.forEach(function(item){
				this.hideContainer(item);
			}.bind(this));
		};

		showContainer = function(container){
			container.classList.add(this.activeClassName);
			setTimeout(()=> {
				container.classList.add(this.animatedClassName);
			}, 100);
		};

		hideContainer = function(container){
			container.classList.remove(this.animatedClassName);
			container.classList.remove(this.activeClassName);
		};
	};

	Array.prototype.forEach.call(document.querySelectorAll("[data-tab-hover]"), function(tabHoverEl){
		const tabHover = new TabHover(tabHoverEl);
		tabHover.init();
	});
});

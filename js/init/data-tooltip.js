document.addEventListener('DOMContentLoaded', function(){

	class TooltipHint {

		element = null;
		newTooltip = null;

		coordinanes = {
			x: 0,
			y: 0,
		};

		constructor(tooltipEl) {
			this.element = tooltipEl;

			this.element.addEventListener("mouseenter", function (e) {
				this.show(this.element, e);
			}.bind(this));
			this.element.addEventListener("mouseleave", function () {
				this.hide();
			}.bind(this));
		};

		setCoordinates(pageX, pageY, element) {
			this.coordinanes.x = pageX;
			this.coordinanes.y = pageY;
			// + element height/width
		};

		setText(text) {
			this.text = text;
		};

		getCoordinates() {
			return {x: this.coordinanes.x, y: this.coordinanes.y}
		};

		getText() {
			return this.text;
		};

		getElementSize() {
			return this.element.getBoundingClientRect();
		};

		setTooltipPosition() {
			// console.log(this.getElementSize())
			
			// this.getCoordinates().y + "px";
			// this.getCoordinates().x + "px";
		};

		createTooltipElement() {
			this.newTooltip = document.createElement('div');
			this.newTooltip.className = "tooltip";
			this.newTooltip.setAttribute("id", "tooltip");
			this.newTooltip.appendChild(document.createTextNode(this.getText()));
			// postion
			this.newTooltip.style.top = this.getCoordinates().y + "px";
			this.newTooltip.style.left = this.getCoordinates().x + "px";
					document.body.appendChild(this.newTooltip);
		};

		show(element, event) {
			if (!element || !event) return;
			let text = element.dataset.tooltip.trim();
			this.element = element;
			this.setText(text);
			this.setCoordinates(event.pageX,event.pageY, element);
			this.createTooltipElement();

			setTimeout(function(){
				this.newTooltip.classList.add("active");
			}.bind(this), 250)
		};

		hide(){
			this.setText('');
			this.setCoordinates(0, 0);
			let tooltip = document.getElementById('tooltip');
			if (tooltip) {
				tooltip.remove();
			}
		};
	};

	Array.prototype.forEach.call(document.querySelectorAll("[data-tooltip]"), function(tooltip){
		const tooltipHint = new TooltipHint(tooltip);

	});


});